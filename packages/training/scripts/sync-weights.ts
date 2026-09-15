import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

const sourcePath = resolve(repositoryRoot, "artifacts/tfjs");

const targetPath = resolve(repositoryRoot, "apps/web/public/artifacts/tfjs");

if (!(await Bun.file(resolve(sourcePath, "model.json")).exists())) {
  throw new Error(
    "No trained weights found. Run `bun run start:training` before syncing the web model.",
  );
}

await mkdir(dirname(targetPath), { recursive: true });

await cp(sourcePath, targetPath, { recursive: true, force: true });

console.log(`Synced ${sourcePath} → ${targetPath}`);

const buildSamples = Bun.spawn(
  [
    "npm",
    "exec",
    "--yes",
    "--package=node@20.20.2",
    "--",
    "node",
    "./packages/training/node_modules/.bin/tsx",
    "packages/training/scripts/build-samples.ts",
  ],
  { cwd: repositoryRoot, stdout: "inherit", stderr: "inherit" },
);

if ((await buildSamples.exited) !== 0) {
  throw new Error("Could not build latent MNIST samples.");
}
