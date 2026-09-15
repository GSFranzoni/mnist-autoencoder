import { cn } from "@/lib/cn";

const panelClass = "rounded-panel border border-border bg-surface shadow-panel";
const eyebrowClass = "text-subtle text-[.64rem] font-bold uppercase tracking-[.14em]";

export function CompressionCard() {
  return (
    <section className={cn(panelClass, "relative overflow-hidden p-5 shadow-none")}>
      <div
        aria-hidden
        className="bg-accent/10 pointer-events-none absolute -top-12 -right-10 size-28 rounded-full blur-2xl"
      />
      <div className="relative">
        <span className={eyebrowClass}>Compression</span>
        <div className="mt-4 flex items-center justify-between gap-2 text-center text-xs">
          <span className="text-foreground-muted">784 pixels</span>
          <i className="text-muted not-italic">→</i>
          <strong className="border-accent/30 bg-accent/12 text-accent-soft rounded-md border px-2 py-1 font-semibold">
            z₁, z₂
          </strong>
          <i className="text-muted not-italic">→</i>
          <span className="text-foreground-muted">784 pixels</span>
        </div>
        <p className="text-muted mt-4 text-[.72rem] leading-5">
          Labels colour the map only. The autoencoder learns by reconstructing its own input.
        </p>
      </div>
    </section>
  );
}
