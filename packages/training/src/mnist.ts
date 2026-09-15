import { pathToFileURL } from "node:url";

import type * as tfjs from "@tensorflow/tfjs-node";

import { INPUT_SIZE } from "./autoencoder";

type Tensorflow = typeof import("@tensorflow/tfjs-node");

const PIXEL_COLUMNS = Array.from({ length: INPUT_SIZE }, (_, index) => `pixel_${index}`);

const COLUMN_NAMES = ["label", ...PIXEL_COLUMNS];

export function mnistBatches(
  tf: Tensorflow,
  path: string,
  { batchSize = 100, shuffle = false } = {},
): tfjs.data.Dataset<tfjs.TensorContainer> {
  const samples = tf.data
    .csv(pathToFileURL(path).href, {
      columnNames: COLUMN_NAMES,
      hasHeader: false,
    })
    .map((row) => PIXEL_COLUMNS.map((column) => (row as Record<string, number>)[column]! / 255));

  return (shuffle ? samples.shuffle(2_048) : samples).batch(batchSize);
}
