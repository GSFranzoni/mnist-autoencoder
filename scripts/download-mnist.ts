// scripts/download-mnist.ts
import { mkdir, rename, rm } from "node:fs/promises";

import { $ } from "bun";

const DATASET_DIR = "./datasets/mnist";

const ZIP_PATH = "./datasets/mnist.zip";

const FILE_ID = "1eEKzfmEu6WKdRlohBQiqi3PhW_uIVJVP";

const DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

const TRAIN_PATH = `${DATASET_DIR}/train.csv`;

const TEST_PATH = `${DATASET_DIR}/test.csv`;

await mkdir(DATASET_DIR, {
  recursive: true,
});

const trainExists = await Bun.file(TRAIN_PATH).exists();

const testExists = await Bun.file(TEST_PATH).exists();

if (trainExists && testExists) {
  console.log("✓ MNIST dataset already exists");
  process.exit(0);
}

console.log("↓ Downloading MNIST dataset...");

const response = await fetch(DOWNLOAD_URL, {
  redirect: "follow",
});

if (!response.ok) {
  throw new Error(`Failed to download dataset: ${response.status}`);
}

await Bun.write(ZIP_PATH, response);

console.log("✓ Download complete");
console.log("↓ Extracting...");

await $`unzip -oj ${ZIP_PATH} mnist_train.csv mnist_test.csv -d ${DATASET_DIR}`;

const originalTrain = `${DATASET_DIR}/mnist_train.csv`;

const originalTest = `${DATASET_DIR}/mnist_test.csv`;

if (await Bun.file(originalTrain).exists()) {
  await rename(originalTrain, TRAIN_PATH);
}

if (await Bun.file(originalTest).exists()) {
  await rename(originalTest, TEST_PATH);
}

await rm(ZIP_PATH, {
  force: true,
});

console.log("✓ MNIST dataset ready");
console.log(`  ${TRAIN_PATH}`);
console.log(`  ${TEST_PATH}`);
