import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const datasetPath = resolve(repositoryRoot, "datasets/mnist/test.csv");
const outputPath = resolve(repositoryRoot, "apps/web/public/artifacts/mnist-samples.json");
const sampleCount = 1_000;

type Sample = { sampleId: number; label: number; pixels: string };

const dataset = Bun.file(datasetPath);

if (!(await dataset.exists())) {
  throw new Error("datasets/mnist/test.csv is required to build the explorer samples.");
}

const rows = (await dataset.text()).trim().split("\n");
const step = Math.max(1, Math.floor(rows.length / sampleCount));
const samples: Sample[] = [];

for (let sampleId = 0; sampleId < rows.length && samples.length < sampleCount; sampleId += step) {
  const [label, ...pixels] = rows[sampleId]!.split(",").map(Number);

  samples.push({
    sampleId,
    label,
    pixels: Buffer.from(pixels).toString("base64"),
  });
}

await mkdir(dirname(outputPath), { recursive: true });
await Bun.write(outputPath, `${JSON.stringify(samples)}\n`);

console.log(`Built ${samples.length} MNIST explorer samples → ${outputPath}`);
