import { DenseLayer, NeuralNetwork, ReLULayer, SigmoidLayer, type Layer } from "./neural-network";

export function getMnistAutoencoderNetwork() {
  const encodeLayers: Layer[] = [
    new DenseLayer(784, 128),
    new ReLULayer(),
    new DenseLayer(128, 32),
    new ReLULayer(),
    new DenseLayer(32, 2),
  ];

  const decodeLayers: Layer[] = [
    new DenseLayer(2, 32),
    new ReLULayer(),
    new DenseLayer(32, 128),
    new ReLULayer(),
    new DenseLayer(128, 784),
    new SigmoidLayer(),
  ];

  return {
    encodeLayers,
    decodeLayers,
    network: new NeuralNetwork([...encodeLayers, ...decodeLayers]),
  };
}
