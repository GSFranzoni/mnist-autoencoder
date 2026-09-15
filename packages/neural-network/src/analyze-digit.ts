import { argmax, type NeuralNetwork, softmax, type Vector } from "./neural-network";

export type DigitAnalysis = {
  prediction: number;
  confidence: number;
  probabilities: Vector;
};

export function analyzeDigit(network: NeuralNetwork, input: Vector): DigitAnalysis {
  const logits = network.forward(input);

  const probabilities = softmax(logits);

  const prediction = argmax(probabilities);

  return {
    prediction,
    confidence: probabilities[prediction]!,
    probabilities,
  };
}
