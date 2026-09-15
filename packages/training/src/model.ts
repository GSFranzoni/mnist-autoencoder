import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getMnistAutoencoderNetwork } from "@mnist-autoencoder/neural-network";

export const REPOSITORY_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

export const MNIST_DATASET_DIR = resolve(REPOSITORY_ROOT, "datasets/mnist");

export const ARTIFACTS_DIR = resolve(REPOSITORY_ROOT, "artifacts");

export const WEIGHTS_PATH = resolve(ARTIFACTS_DIR, "weights.json");

export async function createNetwork() {
  const { network } = getMnistAutoencoderNetwork();

  const weightsFile = Bun.file(WEIGHTS_PATH);

  if (await weightsFile.exists()) {
    network.load(await weightsFile.json());
  }

  return network;
}
