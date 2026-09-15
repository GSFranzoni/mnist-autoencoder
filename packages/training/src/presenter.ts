import process from "node:process";

export type TrainingMetrics = {
  samples: number;
  loss: number;
};

const ESC = "\u001B[";

/**
 * A small, portable terminal dashboard.
 *
 * It intentionally uses only standard ANSI screen control sequences. Unlike the
 * previous renderer, it does not enable raw mode or ask the terminal for color
 * capabilities, both of which can leave unread control responses in the shell.
 */
export class TrainingPresenter {
  private readonly interactive = Boolean(process.stdout.isTTY);

  private epoch = 0;

  private metrics: TrainingMetrics = { samples: 0, loss: Number.NaN };

  private testMetrics?: TrainingMetrics;

  private destroyed = false;

  static async create() {
    const presenter = new TrainingPresenter();
    presenter.start();
    return presenter;
  }

  update(epoch: number, metrics: TrainingMetrics) {
    this.epoch = Math.max(1, Math.trunc(epoch));
    this.metrics = metrics;

    if (!this.interactive) {
      console.log(
        [
          `epoch ${this.epoch}`,
          `${metrics.samples.toLocaleString("en-US")} samples`,
          `reconstruction MSE ${formatMetric(metrics.loss)}`,
        ].join(" · "),
      );
      return;
    }

    this.render();
  }

  updateTest(metrics: TrainingMetrics) {
    this.testMetrics = metrics;

    if (!this.interactive) {
      console.log(
        `test set · reconstruction MSE ${formatMetric(metrics.loss)}\n`,
      );
      return;
    }

    this.render();
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    if (this.interactive) {
      process.stdout.write(`${ESC}0m${ESC}?25h${ESC}?1049l`);
    }
  }

  private start() {
    if (!this.interactive) {
      console.log("MNIST / AUTOENCODER");
      console.log("Training started. Press Ctrl+C to save the current weights and stop.\n");
      return;
    }

    process.stdout.write(`${ESC}?1049h${ESC}2J${ESC}H${ESC}?25l`);
    this.render();
  }

  private render() {
    if (!this.interactive || this.destroyed) {
      return;
    }

    const testSummary = this.testMetrics
      ? `MSE ${formatMetric(this.testMetrics.loss)}`
      : "—";

    const lines = [
      color("95", "MNIST  /  AUTOENCODER"),
      "",
      color(
        "90",
        this.epoch
          ? `● TRAINING  Epoch ${this.epoch} · Reconstructing sample ${this.metrics.samples.toLocaleString("en-US")}`
          : "● TRAINING  Waiting for the first batch…",
      ),
      "",
      color("95", "╭──────────────────── LIVE METRICS ────────────────────╮"),
      color("95", boxLine(metricLine("EPOCH", this.epoch ? String(this.epoch) : "—"))),
      color(
        "37",
        boxLine(metricLine("SAMPLES PROCESSED", this.metrics.samples.toLocaleString("en-US"))),
      ),
      color("93", boxLine(metricLine("RECONSTRUCTION MSE", formatMetric(this.metrics.loss)))),
      color("95", boxLine(metricLine("TEST RECONSTRUCTION", testSummary))),
      color("95", "╰──────────────────────────────────────────────────────╯"),
      "",
      color("90", "Ctrl+C to stop training and save the current weights"),
    ];

    process.stdout.write(`${ESC}H${ESC}2J${lines.join("\n")}\n`);
  }
}

function color(code: string, value: string) {
  return `${ESC}${code}m${value}${ESC}0m`;
}

function formatMetric(value: number) {
  return Number.isFinite(value) ? value.toFixed(4) : "—";
}

function metricLine(label: string, value: string) {
  return `${label.padEnd(26)}${value.padStart(26)}`;
}

function boxLine(value: string) {
  return `│ ${value.padEnd(52)} │`;
}
