import { resolve } from "node:path";

import { MSELoss, NeuralNetwork, ReconstructionAudit } from "@mnist-autoencoder/neural-network";

import { streamMNIST } from "./mnist";
import { createNetwork, MNIST_DATASET_DIR } from "./model";

const testPath = resolve(MNIST_DATASET_DIR, "test.csv");

export async function test(network: NeuralNetwork) {
  const audit = new ReconstructionAudit();

  const lossFunction = new MSELoss();

  for await (const sample of streamMNIST(testPath)) {
    const reconstruction = network.forward(sample.input);

    const { loss } = lossFunction.calculate(reconstruction, sample.input);

    audit.record(loss);
  }

  const metrics = audit.snapshot();

  return {
    metrics,
  };
}

if (import.meta.main) {
  await test(await createNetwork());
}
