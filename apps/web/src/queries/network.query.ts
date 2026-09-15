import { getMnistAutoencoderNetwork } from "@mnist-autoencoder/neural-network";
import { queryOptions } from "@tanstack/react-query";

export type ExplorerModel = {
  decode: (latent: [number, number]) => number[];
  encode: (pixels: number[]) => [number, number];
  samples: MnistSample[];
};

export type MnistSample = {
  sampleId: number;
  label: number;
  pixels: string;
};

async function loadNetwork(): Promise<ExplorerModel> {
  const basePath = import.meta.env.BASE_URL;

  const [weightsResponse, samplesResponse] = await Promise.all([
    fetch(`${basePath}artifacts/weights.json`),
    fetch(`${basePath}artifacts/mnist-samples.json`),
  ]);

  if (!weightsResponse.ok || !samplesResponse.ok) {
    throw new Error("Could not load the trained autoencoder artifacts");
  }

  const { decodeLayers, encodeLayers, network } = getMnistAutoencoderNetwork();

  if (!network.load(await weightsResponse.json())) {
    throw new Error("The published weights do not match the autoencoder topology");
  }

  return {
    decode: (latent) => {
      let output: number[] = latent;

      for (const layer of decodeLayers) {
        output = layer.forward(output);
      }

      return output;
    },
    encode: (pixels) => {
      let output = pixels;

      for (const layer of encodeLayers) {
        output = layer.forward(output);
      }

      return [output[0]!, output[1]!];
    },
    samples: (await samplesResponse.json()) as MnistSample[],
  };
}

export const networkQueryOptions = queryOptions({
  queryKey: ["network"],
  queryFn: () =>
    loadNetwork().catch((e) => {
      console.log(e);
      throw e;
    }),
  staleTime: Infinity,
  gcTime: Infinity,
  retry: 1,
});
