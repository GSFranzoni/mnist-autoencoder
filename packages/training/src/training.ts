import process from "node:process";

import type { LayersModel } from "@tensorflow/tfjs-node";
import * as tf from "@tensorflow/tfjs-node";

import { ReconstructionAudit, lossValue } from "./audit";
import { mnistBatches } from "./mnist";
import { MNIST_DATASET_DIR, loadAutoencoder, saveAutoencoder } from "./model";
import { TrainingPresenter } from "./presenter";
import { evaluateAutoencoder } from "./testing";

const TRAINING_PATH = `${MNIST_DATASET_DIR}/train.csv`;

export async function train(epochs = 10) {
  const model = await loadAutoencoder(tf);
  const presenter = await TrainingPresenter.create();
  let stopped = false;

  const stop = () => {
    stopped = true;
  };
  process.on("SIGINT", stop);

  try {
    for (let epoch = 1; epoch <= epochs && !stopped; epoch++) {
      await trainEpoch(model, epoch, presenter, () => stopped);
    }
  } finally {
    process.off("SIGINT", stop);
    presenter.destroy();
    model.dispose();
  }

  if (stopped) {
    process.exitCode = 130;
  }
}

async function trainEpoch(
  model: LayersModel,
  epoch: number,
  presenter: TrainingPresenter,
  isStopped: () => boolean,
) {
  const audit = new ReconstructionAudit();

  const batches = mnistBatches(tf, TRAINING_PATH, { shuffle: true });

  const iterator = await batches.iterator();

  for (let next = await iterator.next(); !next.done; next = await iterator.next()) {
    if (isStopped()) {
      break;
    }

    const inputs = next.value as tf.Tensor2D;

    try {
      audit.record(lossValue(await model.trainOnBatch(inputs, inputs)), inputs.shape[0]);
    } finally {
      inputs.dispose();
    }

    if (audit.shouldReport()) {
      presenter.update(epoch, audit.snapshot());
    }
  }

  if (audit.snapshot().samples > 0) {
    await saveAutoencoder(model);
  }

  if (!isStopped()) {
    presenter.updateTest(await evaluateAutoencoder(model));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await train(25);
}
