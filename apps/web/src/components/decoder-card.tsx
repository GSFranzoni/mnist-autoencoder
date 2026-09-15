import { Crosshair } from "lucide-react";
import { useMemo } from "react";

import { PixelImage } from "@/components/pixel-image";
import type { Latent, Point } from "@/lib/canvas";
import { cn } from "@/lib/cn";

const panelClass = "rounded-panel border border-border bg-surface shadow-panel";

const eyebrowClass = "text-subtle text-[.64rem] font-bold uppercase tracking-[.14em]";

export function DecoderCard({
  point,
  latent,
  decode,
}: {
  point: Point | null;
  latent: Latent | null;
  decode: (latent: Latent) => number[];
}) {
  const pixels = useMemo(() => (latent ? decode(latent) : null), [decode, latent]);

  const title = point ? `Digit ${point.sample.label}` : "Latent position";

  const coordinates: Latent = latent ?? [0, 0];

  return (
    <section className={cn(panelClass, "h-48 overflow-hidden p-5 shadow-none")}>
      <div className="flex items-center justify-between">
        <span className={eyebrowClass}>Decoder output</span>
        <Crosshair className="text-accent-soft" size={15} />
      </div>
      {pixels ? (
        <div className="mt-5 flex items-center gap-5">
          <div className="size-28 shrink-0 rounded-2xl">
            <PixelImage pixels={pixels} label={title} />
          </div>
          <div className="min-w-0 text-left">
            <b className="text-foreground-soft block text-[.9rem]">{title}</b>
            <span className="text-muted mt-2 block text-[.7rem] leading-5 tabular-nums">
              z₁ {coordinates[0].toFixed(2)}
              <br />
              z₂ {coordinates[1].toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-muted grid h-full place-items-center text-center text-sm leading-6">
          Move across the map to ask the decoder for a digit.
        </div>
      )}
    </section>
  );
}
