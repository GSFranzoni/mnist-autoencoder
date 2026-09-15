import { resolve } from "node:path";

import type { LayersModel, Tensor } from "@tensorflow/tfjs-node";
import * as tf from "@tensorflow/tfjs-node";

import { ReconstructionAudit } from "./audit";
import { mnistBatches } from "./mnist";
import { MNIST_DATASET_DIR, loadAutoencoder } from "./model";

const TEST_PATH = resolve(MNIST_DATASET_DIR, "test.csv");

export async function evaluateAutoencoder(model: LayersModel) {
  const audit = new ReconstructionAudit();

  const batches = mnistBatches(tf, TEST_PATH);
  const iterator = await batches.iterator();

  for (let next = await iterator.next(); !next.done; next = await iterator.next()) {
    const inputs = next.value as tf.Tensor2D;

    try {
      const result = model.evaluate(inputs, inputs);
      const losses = (Array.isArray(result) ? result : [result]) as Tensor[];
      audit.record(losses[0]!.dataSync()[0]!, inputs.shape[0]);
      losses.forEach((loss) => loss.dispose());
    } finally {
      inputs.dispose();
    }
  }

  return audit.snapshot();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const model = await loadAutoencoder(tf);
  console.log(await evaluateAutoencoder(model));
  model.dispose();
}
