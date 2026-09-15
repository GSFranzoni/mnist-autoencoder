import { queryOptions } from "@tanstack/react-query";
import type { LayersModel, SymbolicTensor, Tensor } from "@tensorflow/tfjs";

export type ExplorerModel = {
  decode: (latent: [number, number]) => number[];
  encode: (pixels: number[]) => [number, number];
  samples: MnistSample[];
};

export type MnistSample = {
  x: number;
  y: number;
  label: number;
};

async function loadNetwork(): Promise<ExplorerModel> {
  const basePath = import.meta.env.BASE_URL;
  const [tf, samples] = await Promise.all([import("@tensorflow/tfjs"), loadSamples(basePath)]);
  const model = await tf.loadLayersModel(`${basePath}artifacts/tfjs/model.json`);
  let latentLayer: LayersModel["layers"][number];
  try {
    latentLayer = model.getLayer("latent");
  } catch {
    throw new Error("The published model does not contain the required latent layer.");
  }
  const encoder = tf.model({ inputs: model.inputs, outputs: latentLayer.output });
  const decoderInput = tf.input({ shape: [2], name: "latent_input" });
  let decoderValue = decoderInput as SymbolicTensor;
  const latentIndex = model.layers.indexOf(latentLayer);
  for (const layer of model.layers.slice(latentIndex + 1)) {
    decoderValue = layer.apply(decoderValue) as SymbolicTensor;
  }
  const decoder = tf.model({ inputs: decoderInput, outputs: decoderValue });

  return {
    decode: (latent) => predict(tf, decoder, latent, 2),
    encode: (pixels) => {
      const latent = predict(tf, encoder, pixels, 784);
      return [latent[0]!, latent[1]!];
    },
    samples,
  };
}

async function loadSamples(basePath: string): Promise<MnistSample[]> {
  const response = await fetch(`${basePath}artifacts/mnist-samples.json`);

  if (!response.ok) {
    throw new Error("Could not load the MNIST explorer samples");
  }

  return response.json() as Promise<MnistSample[]>;
}

function predict(
  tf: typeof import("@tensorflow/tfjs"),
  model: LayersModel,
  values: number[],
  inputSize: number,
) {
  return tf.tidy(() => {
    const input = tf.tensor2d([values], [1, inputSize]);
    const output = model.predict(input) as Tensor;
    return Array.from(output.dataSync()) as number[];
  });
}

export const networkQueryOptions = queryOptions({
  queryKey: ["network"],
  queryFn: loadNetwork,
  staleTime: Infinity,
  gcTime: Infinity,
  retry: 1,
});
