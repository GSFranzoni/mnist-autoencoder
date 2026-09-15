import { Move } from "lucide-react";
import { useState } from "react";

import { CompressionCard } from "@/components/compression-card";
import { DecoderCard } from "@/components/decoder-card";
import { DigitLegend } from "@/components/digit-legend";
import { LatentCanvas } from "@/components/latent-canvas";
import type { Bounds, Latent, Point } from "@/lib/canvas";

type Props = {
  bounds: Bounds;
  decode: (latent: Latent) => number[];
  latent: Latent;
  points: Point[];
  onChange: (latent: Latent) => void;
};

export function LatentSpace({ bounds, decode, latent, points, onChange }: Props) {
  const [hovered, setHovered] = useState<Point | null>(null);

  const [pointerLatent, setPointerLatent] = useState<Latent | null>(null);

  return (
    <section className="grid grid-cols-1 gap-5 px-3 pb-3 sm:px-4 md:grid-cols-[minmax(0,1fr)_290px]">
      <div>
        <LatentCanvas
          bounds={bounds}
          latent={latent}
          points={points}
          onChange={onChange}
          onHover={setHovered}
          onPointerLatent={setPointerLatent}
        />
        <div className="text-muted flex items-center justify-between gap-4 px-2 pt-4 text-[.72rem] sm:px-3">
          <span className="inline-flex items-center gap-1.5">
            <Move size={14} /> Hover or drag to decode
          </span>
          <DigitLegend />
        </div>
      </div>
      <aside className="grid content-start gap-4">
        <DecoderCard point={hovered} latent={pointerLatent} decode={decode} />
        <CompressionCard />
      </aside>
    </section>
  );
}
