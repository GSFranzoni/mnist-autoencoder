import { mkdir, rename } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

import {
  MSELoss,
  NeuralNetwork,
  ReconstructionAudit,
  SGD,
} from "@mnist-autoencoder/neural-network";

import { shuffledMNIST } from "./mnist";
import { ARTIFACTS_DIR, createNetwork, MNIST_DATASET_DIR, WEIGHTS_PATH } from "./model";
import { TrainingPresenter } from "./presenter";
import { test } from "./testing";

const TRAINING_PATH = resolve(MNIST_DATASET_DIR, "train.csv");

const checkpointPath = `${WEIGHTS_PATH}.tmp`;

export async function train(network: NeuralNetwork, epochs = 10) {
  let stopped = false;

  const stop = () => {
    if (stopped) {
      return;
    }

    stopped = true;
  };

  const presenter = await TrainingPresenter.create();

  process.on("SIGINT", stop);

  const save = async () => {
    await mkdir(ARTIFACTS_DIR, { recursive: true });
    await Bun.write(checkpointPath, `${JSON.stringify(network.export(), null, 2)}\n`);
    await rename(checkpointPath, WEIGHTS_PATH);
  };

  try {
    const optimizer = new SGD(0.5);

    const lossFunction = new MSELoss();

    for (let epoch = 0; epoch < epochs && !stopped; epoch++) {
      const audit = new ReconstructionAudit();

      for await (const sample of shuffledMNIST(TRAINING_PATH)) {
        if (stopped) {
          break;
        }

        const reconstruction = network.forward(sample.input);

        const { loss, gradient } = lossFunction.calculate(reconstruction, sample.input);

        network.backward(gradient);
        optimizer.step(network.parameters());
        audit.record(loss);

        if (audit.shouldReport()) {
          presenter.update(epoch + 1, audit.snapshot());
        }
      }

      await save();

      if (!stopped) {
        const { metrics } = await test(network);

        presenter.updateTest(metrics);
      }
    }
  } finally {
    process.off("SIGINT", stop);
    await save();
    presenter.destroy();
  }

  if (stopped) {
    process.exitCode = 130;
  }
}

if (import.meta.main) {
  await train(await createNetwork(), 30);
}
