# MNIST Autoencoder

> Draw a digit. Watch it become 784 pixels. See a tiny neural network make its best guess.

[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Bun](https://img.shields.io/badge/Bun-workspaces-000?logo=bun&logoColor=white)](https://bun.sh)

[Live demo →](https://gsfranzoni.github.io/mnist-autoencoder/)

MNIST Autoencoder is a small, interactive digit-recognition experiment. Sketch a handwritten number from 0–9 and the browser preprocesses it into the same 28 × 28 pixel format used by MNIST before running inference with the included trained network.

## Support

If you enjoyed this little neural-network experiment, you can support its creator here:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?logo=buymeacoffee&logoColor=000)](https://buymeacoffee.com/gsfranzoni)

<a href="https://buymeacoffee.com/gsfranzoni">
  <img src="apps/web/public/assets/buymeacoffee.png" width="220" alt="Buy Me a Coffee QR code for gsfranzoni" />
</a>

## What it does

- Lets you draw directly on a touch-friendly canvas.
- Crops, centers, scales, and converts the sketch into 784 normalized inputs.
- Loads the trained network once as a static asset and shows its prediction and confidence.
- Includes local Node/TensorFlow.js commands to train and evaluate the model against MNIST CSV data.

## Quick start

Requires [Bun](https://bun.sh) 1.4 or newer.

```bash
bun install
bun run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

## Download the MNIST dataset

The web playground already includes trained weights, so downloading the dataset is only required if you want to train or evaluate the network locally.

```bash
bun run download:mnist
```

The script downloads the MNIST archive temporarily, extracts **only** its training and test CSV files, and removes the archive afterward:

```text
datasets/mnist/train.csv
datasets/mnist/test.csv
```

> [!NOTE]
> The download script uses the system `unzip` command. Dataset files are ignored by Git and are never included in the web build.

## Commands

| Command                  | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `bun run dev`            | Start the web app through Turborepo.               |
| `bun run build`          | Produce the Vite production build.                 |
| `bun run typecheck`      | Type-check every workspace package.                |
| `bun run lint`           | Lint the workspace.                                |
| `bun run test`           | Run workspace tests.                               |
| `bun run download:mnist` | Download MNIST training and test CSV files.        |
| `bun run start:training` | Train with TensorFlow on CPU using Node 20.        |
| `bun run sync:weights`   | Publish the latest trained weights to the web app. |
| `bun run start:testing`  | Evaluate the network against the MNIST test set.   |

## Project structure

```text
apps/web                 Vite + React drawing playground
packages/training        Node/TensorFlow.js CSV loading, training, evaluation, and terminal UI
```

The web app loads its TensorFlow.js model from `apps/web/public/artifacts/tfjs/model.json`. Training writes local output to `artifacts/tfjs`; after reviewing a run, use `bun run sync:weights` to publish that artifact to the web app. Training data and local artifacts are ignored by Git; use the download command above before running training or evaluation.

Training uses the native TensorFlow.js Node CPU binding. Its commands run through Node 20 automatically, even if the host default is another version. The browser continues to use TensorFlow.js for inference.

## Deployment

Pushing to `main` deploys the web app to GitHub Pages through the included workflow. In the GitHub repository settings, set **Pages → Source** to **GitHub Actions** once.
