import { BrainCircuit } from "lucide-react";

export function PlaygroundHeader() {
  return (
    <header className="flex flex-col gap-5 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3.5">
        <span className="bg-accent/12 text-accent-soft border-accent/25 grid size-11 shrink-0 place-items-center rounded-2xl border">
          <BrainCircuit size={21} strokeWidth={1.7} />
        </span>
        <div>
          <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-[-.045em] sm:text-3xl">
            Explore the latent space
          </h1>
          <p className="text-muted mt-2 max-w-xl text-sm leading-6">
            Each point is a handwritten digit compressed into just two coordinates.
          </p>
        </div>
      </div>
    </header>
  );
}
