import type * as tfjs from "@tensorflow/tfjs-node";

type Tensorflow = typeof import("@tensorflow/tfjs-node");

export const INPUT_SIZE = 784;

export const LATENT_SIZE = 2;

export function compileAutoencoder(tf: Tensorflow, model: tfjs.LayersModel) {
  model.compile({ optimizer: tf.train.adam(0.001), loss: "binaryCrossentropy" });
  return model;
}

export function createAutoencoder(tf: Tensorflow): tfjs.LayersModel {
  const input = tf.input({ shape: [INPUT_SIZE], name: "pixels" });

  const encoderLayers = [
    tf.layers.dense({ units: 400, name: "encoder_dense_1" }),
    tf.layers.leakyReLU({ alpha: 0.2, name: "encoder_leaky_relu_1" }),
    tf.layers.dense({ units: 200, name: "encoder_dense_2" }),
    tf.layers.leakyReLU({ alpha: 0.2, name: "encoder_leaky_relu_2" }),
    tf.layers.dense({ units: LATENT_SIZE, name: "latent" }),
  ];

  const latent = applyLayers(input, encoderLayers);

  const decoderLayers = [
    tf.layers.dense({ units: 200, name: "decoder_dense_1" }),
    tf.layers.leakyReLU({ alpha: 0.2, name: "decoder_leaky_relu_1" }),
    tf.layers.dense({ units: 400, name: "decoder_dense_2" }),
    tf.layers.leakyReLU({ alpha: 0.2, name: "decoder_leaky_relu_2" }),
    tf.layers.dense({ units: INPUT_SIZE, name: "reconstruction_dense" }),
    tf.layers.activation({ activation: "sigmoid", name: "reconstruction" }),
  ];

  const reconstruction = applyLayers(latent, decoderLayers);

  return compileAutoencoder(
    tf,
    tf.model({
      inputs: input,
      outputs: reconstruction,
      name: "mnist_autoencoder",
    }),
  );
}

export function hasLatentLayer(model: tfjs.LayersModel) {
  return model.layers.some((layer) => layer.name === "latent");
}

function applyLayers(input: tfjs.SymbolicTensor, layers: readonly tfjs.layers.Layer[]) {
  return layers.reduce((value, layer) => layer.apply(value) as tfjs.SymbolicTensor, input);
}
