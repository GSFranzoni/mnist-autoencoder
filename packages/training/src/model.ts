import { access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { compileAutoencoder, createAutoencoder, hasLatentLayer } from "./autoencoder";

type Tensorflow = typeof import("@tensorflow/tfjs-node");

export const REPOSITORY_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

export const MNIST_DATASET_DIR = resolve(REPOSITORY_ROOT, "datasets/mnist");

export const ARTIFACTS_DIR = resolve(REPOSITORY_ROOT, "artifacts");

export const MODEL_DIR = resolve(ARTIFACTS_DIR, "tfjs");

export const MODEL_PATH = resolve(MODEL_DIR, "model.json");

export async function loadAutoencoder(tf: Tensorflow) {
  try {
    await access(MODEL_PATH);
  } catch {
    return createAutoencoder(tf);
  }

  const model = await tf.loadLayersModel(`file://${MODEL_PATH}`);
  if (!hasLatentLayer(model)) {
    model.dispose();
    return createAutoencoder(tf);
  }

  return compileAutoencoder(tf, model);
}

export async function saveAutoencoder(model: import("@tensorflow/tfjs-node").LayersModel) {
  await mkdir(MODEL_DIR, { recursive: true });
  await model.save(`file://${MODEL_DIR}`);
}
