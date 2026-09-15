import { useEffect, useRef } from "react";

export function PixelImage({ pixels, label }: { pixels: number[]; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) {
      return;
    }
    const image = context.createImageData(28, 28);
    for (let index = 0; index < 784; index++) {
      const value = Math.round(Math.max(0, Math.min(1, pixels[index] ?? 0)) * 255);
      image.data.set([value, value, value, 255], index * 4);
    }
    context.putImageData(image, 0, 0);
  }, [pixels]);
  return (
    <canvas
      ref={canvasRef}
      className="border-border bg-surface-ink block size-full rounded-xl border [image-rendering:pixelated]"
      width="28"
      height="28"
      aria-label={label}
      role="img"
    />
  );
}
