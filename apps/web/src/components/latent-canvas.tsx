import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

import type { Bounds, Latent, Point } from "@/lib/canvas";
import { drawLatentSpace, nearestPoint, unproject, type CanvasSize } from "@/lib/canvas";

type Props = {
  bounds: Bounds;
  latent: Latent;
  points: Point[];
  onChange: (latent: Latent) => void;
  onHover: (point: Point | null) => void;
  onPointerLatent: (latent: Latent | null) => void;
};

const digitColorTokens = Array.from({ length: 10 }, (_, label) => `--color-digit-${label}`);

export function LatentCanvas({
  bounds,
  latent,
  points,
  onChange,
  onHover,
  onPointerLatent,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dragging = useRef(false);

  const size = useCanvasSize(canvasRef);

  const [hovered, setHovered] = useState<Point | null>(null);

  const colors = useMemo(() => digitColorTokens.map(cssToken), []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    drawLatentSpace(canvas, { bounds, colors, hovered, latent, points, size });
  }, [bounds, colors, hovered, latent, points, size]);

  const positionFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const updatePointer = (event: PointerEvent<HTMLCanvasElement>) => {
    const position = positionFromEvent(event);
    const nextLatent = unproject(position, bounds, size);
    const point = nearestPoint(position, points, bounds, size);
    setHovered(point);
    onHover(point);
    onPointerLatent(nextLatent);
    return nextLatent;
  };

  return (
    <div className="bg-plot border-border relative aspect-square overflow-hidden rounded-2xl border shadow-[inset_0_1px_0_rgb(255_255_255/4%)]">
      <canvas
        ref={canvasRef}
        className="block size-full cursor-crosshair touch-none"
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          onChange(updatePointer(event));
        }}
        onPointerMove={(event) => {
          const nextLatent = updatePointer(event);
          if (dragging.current) {
            onChange(nextLatent);
          }
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          dragging.current = false;
          setHovered(null);
          onHover(null);
          onPointerLatent(null);
        }}
        aria-label="Interactive two-dimensional latent space"
      />
      <span className="text-axis bg-plot/70 pointer-events-none absolute top-3 left-3 rounded px-1.5 py-1 text-[.65rem] font-bold backdrop-blur-sm">
        z₂
      </span>
      <span className="text-axis bg-plot/70 pointer-events-none absolute right-3 bottom-3 rounded px-1.5 py-1 text-[.65rem] font-bold backdrop-blur-sm">
        z₁
      </span>
    </div>
  );
}

function useCanvasSize(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [size, setSize] = useState<CanvasSize>({ width: 680, height: 620 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef]);
  return size;
}

function cssToken(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}
