import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = resolve(repositoryRoot, "artifacts/weights.json");
const targetPath = resolve(repositoryRoot, "apps/web/public/artifacts/weights.json");

const source = Bun.file(sourcePath);

if (!(await source.exists())) {
  throw new Error(
    "No trained weights found. Run `bun run start:training` before syncing the web model.",
  );
}

await mkdir(dirname(targetPath), { recursive: true });
await Bun.write(targetPath, source);

console.log(`Synced ${sourcePath} → ${targetPath}`);

await import("./build-mnist-samples");
