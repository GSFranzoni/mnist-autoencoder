import { createReadStream } from "node:fs";

import { parse } from "csv-parse";

type MNISTSample = {
  input: number[];
  label: number;
};

export async function* streamMNIST(path: string): AsyncGenerator<MNISTSample> {
  const parser = createReadStream(path).pipe(
    parse({
      cast: true,
    }),
  );

  for await (const row of parser) {
    const [label, ...pixels] = row as number[];

    yield {
      label,
      input: pixels.map((pixel) => pixel / 255),
    };
  }
}

/**
 * Streams MNIST in a randomized order without loading the whole 105 MB CSV into memory.
 * A sample is swapped into a fixed-size buffer and a random buffered sample is emitted.
 */
export async function* shuffledMNIST(
  path: string,
  bufferSize = 2_048,
): AsyncGenerator<MNISTSample> {
  const buffer: MNISTSample[] = [];

  for await (const sample of streamMNIST(path)) {
    if (buffer.length < bufferSize) {
      buffer.push(sample);
      continue;
    }

    const index = Math.floor(Math.random() * buffer.length);
    const bufferedSample = buffer[index]!;

    buffer[index] = sample;
    yield bufferedSample;
  }

  for (let index = buffer.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [buffer[index], buffer[swapIndex]] = [buffer[swapIndex]!, buffer[index]!];
  }

  yield* buffer;
}
