export class ReconstructionAudit {
  private totalLoss = 0;

  private samples = 0;

  record(loss: number, samples = 1) {
    this.totalLoss += loss;
    this.samples += samples;
  }

  shouldReport(every = 1000) {
    return this.samples % every === 0;
  }

  snapshot() {
    return {
      samples: this.samples,
      loss: this.totalLoss / this.samples,
    };
  }
}

export function lossValue(result: number | number[]) {
  return Number(Array.isArray(result) ? result[0] : result);
}
