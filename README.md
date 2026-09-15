# MNIST Autoencoder

> A small visual experiment in compression: explore how handwritten digits become two coordinates and back again.

[![Live demo](https://img.shields.io/badge/live%20demo-open-6d5dfc?logo=github)](https://gsfranzoni.github.io/mnist-autoencoder/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![Bun](https://img.shields.io/badge/Bun-workspaces-000?logo=bun&logoColor=white)](https://bun.sh/)

[Live demo →](https://gsfranzoni.github.io/mnist-autoencoder/)

MNIST Autoencoder is an interactive browser playground backed by a neural network trained on the [MNIST dataset](https://en.wikipedia.org/wiki/MNIST_database). Each 28 × 28 image is represented by 784 normalized pixel values. The autoencoder compresses those values into a two-dimensional latent vector and reconstructs the original image from it.

The web app renders the latent space as a color-coded map. Hover or drag across the map to decode any coordinate and inspect the digit produced by the decoder. Colors and labels are used for visualization; the reconstruction objective itself is unsupervised.

## How it works

```text
Input (INPUT_SIZE, "pixels")
        │
        ▼
  Dense(400)  →  LeakyReLU(α=0.2)
        │
        ▼
  Dense(200)  →  LeakyReLU(α=0.2)
        │
        ▼
  Dense(LATENT_SIZE)              ← latent space
        │
        ▼
  Dense(200)  →  LeakyReLU(α=0.2)
        │
        ▼
  Dense(400)  →  LeakyReLU(α=0.2)
        │
        ▼
  Dense(INPUT_SIZE)  →  Sigmoid   ← reconstruction
```

The model uses dense layers with LeakyReLU activations and a two-unit `latent` layer. Training minimizes binary cross-entropy between each input image and its reconstruction. The browser uses [TensorFlow.js](https://www.tensorflow.org/js); local training uses the native [TensorFlow.js Node binding](https://github.com/tensorflow/tfjs/tree/master/tfjs-node).

## What you can explore

- View thousands of MNIST examples projected into the two-dimensional latent space.
- Hover over a point to see its reconstructed digit, label, and coordinates.
- Drag through empty regions to query the decoder between known examples.
- Compare the original 784-dimensional input with its compact two-dimensional representation.
- Run training, evaluation, and visualization data generation locally.

## Support

If you enjoyed this little neural-network experiment, you can support its creator here:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?logo=buymeacoffee&logoColor=000)](https://buymeacoffee.com/gsfranzoni)

<a href="https://buymeacoffee.com/gsfranzoni">
  <img src="apps/web/public/assets/buymeacoffee.png" width="220" alt="Buy Me a Coffee QR code for gsfranzoni" />
</a>

## Quick start

Requires [Bun](https://bun.sh/) 1.4 or newer.

```bash
bun install
bun run dev
```

Open the Vite URL printed in the terminal, usually [`http://localhost:5173`](http://localhost:5173).

To create a production build locally:

```bash
bun run build
bun run --filter @mnist-autoencoder/web preview
```

## Dataset and local training

Download the CSV files before running the Node training or evaluation commands:

```bash
bun run download:mnist
```

The script extracts only the files used by this project:

```text
datasets/mnist/train.csv
datasets/mnist/test.csv
```

> [!NOTE]
> The download script requires the system `unzip` command. Dataset files are ignored by Git and are never included in the web bundle.

Train the autoencoder on the CPU:

```bash
bun run start:training
```

The command runs through Node 20 automatically for compatibility with the native TensorFlow.js binding. It writes the model to `artifacts/tfjs`.

Evaluate the model against the MNIST test set:

```bash
bun run start:testing
```

After training, regenerate the latent points consumed by the web playground and copy the model artifacts into the public directory:

```bash
bun run sync:weights
```

Run this command whenever you want the deployed visualization to reflect a new local training run.

## Commands

| Command                                           | Purpose                                                    |
| ------------------------------------------------- | ---------------------------------------------------------- |
| `bun run dev`                                     | Start the web app through Turborepo.                       |
| `bun run build`                                   | Build every workspace package.                             |
| `bun run --filter @mnist-autoencoder/web preview` | Preview the web production build.                          |
| `bun run typecheck`                               | Type-check every workspace package.                        |
| `bun run lint`                                    | Lint every workspace package.                              |
| `bun run test`                                    | Run the workspace test suite.                              |
| `bun run download:mnist`                          | Download and extract the MNIST CSV files.                  |
| `bun run start:training`                          | Train the autoencoder with TensorFlow.js on Node CPU.      |
| `bun run start:testing`                           | Evaluate reconstruction quality on the test set.           |
| `bun run sync:weights`                            | Publish trained weights and latent samples to the web app. |

## Project structure

```text
apps/web
└── Vite + React interactive latent-space playground

packages/training
└── Node/TensorFlow.js dataset loading, model training, evaluation, and terminal output

datasets/mnist
└── Local MNIST CSV files (ignored by Git)

artifacts/tfjs
└── Locally generated TensorFlow.js model files (ignored by Git)
```

The model architecture is defined in [`packages/training/src/autoencoder.ts`](packages/training/src/autoencoder.ts). The web application loads the published TensorFlow.js model and latent samples from [`apps/web/public/artifacts`](apps/web/public/artifacts).

## Deployment

Pushing to `main` deploys the web app to GitHub Pages through [the deployment workflow](.github/workflows/deploy.yml). In the repository settings, set **Pages → Source** to **GitHub Actions** once.

The Vite base path is configured automatically from the GitHub repository name, so the same app can run locally and under the project URL on GitHub Pages.
