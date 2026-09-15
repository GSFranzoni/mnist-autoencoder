import { useMemo, useState } from "react";

import { LatentSpace } from "@/components/latent-space";
import { PlaygroundHeader } from "@/components/playground-header";
import { getBounds, type Latent } from "@/lib/canvas";
import type { ExplorerModel } from "@/queries/network.query";

export function Playground({ model }: { model: ExplorerModel }) {
  const points = useMemo(
    () => model.samples.map((sample) => ({ sample, x: sample.x, y: sample.y })),
    [model],
  );

  const bounds = useMemo(() => getBounds(points), [points]);

  const [latent, setLatent] = useState<Latent>([0, 0]);

  return (
    <main className="bg-background relative min-h-dvh overflow-x-hidden px-5 pt-10 pb-10 sm:px-[clamp(20px,4vw,64px)]">
      <div className="relative mx-auto w-full max-w-5xl space-y-6">
        <PlaygroundHeader />
        <LatentSpace
          bounds={bounds}
          decode={model.decode}
          latent={latent}
          points={points}
          onChange={setLatent}
        />
      </div>
    </main>
  );
}
