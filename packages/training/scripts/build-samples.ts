import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as tf from "@tensorflow/tfjs-node";

import { loadAutoencoder, MNIST_DATASET_DIR } from "../src/model";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const datasetPath = resolve(MNIST_DATASET_DIR, "test.csv");
const outputPath = resolve(repositoryRoot, "apps/web/public/artifacts/mnist-samples.json");
const sampleCount = 10_000;

const [dataset, model] = await Promise.all([readFile(datasetPath, "utf8"), loadAutoencoder(tf)]);

const rows = dataset.trim().split("\n");
const step = Math.max(1, Math.floor(rows.length / sampleCount));
const selectedRows = rows.filter((_, index) => index % step === 0).slice(0, sampleCount);
const labels = selectedRows.map((row) => Number(row.split(",", 1)[0]));
const pixels = selectedRows.map((row) =>
  row
    .split(",")
    .slice(1)
    .map((value) => Number(value) / 255),
);
const input = tf.tensor2d(pixels, [pixels.length, 784]);
const latentLayer = model.getLayer("latent");
const encoder = tf.model({ inputs: model.inputs, outputs: latentLayer.output });
const encoded = encoder.predict(input) as tf.Tensor2D;
const values = encoded.arraySync() as number[][];
const samples = values.map(([x, y], index) => ({ x, y, label: labels[index]! }));

await writeFile(outputPath, `${JSON.stringify(samples)}\n`);

tf.dispose([input, encoded]);

model.dispose();

console.log(`Built ${samples.length} latent MNIST samples → ${outputPath}`);
