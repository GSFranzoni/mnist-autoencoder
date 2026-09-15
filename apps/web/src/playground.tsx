import { Move, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

import type { ExplorerModel, MnistSample } from "@/queries/network.query";

type Latent = [number, number];
type Point = { sample: MnistSample; pixels: number[]; x: number; y: number };
type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

const digitColorTokens = Array.from({ length: 10 }, (_, label) => `--color-digit-${label}`);
const panelClass = "rounded-panel border border-border bg-surface shadow-panel";
const eyebrowClass =
  "text-subtle mb-1.5 block text-[0.64rem] font-bold uppercase tracking-[0.12em]";

export function Playground({ model }: { model: ExplorerModel }) {
  const points = useMemo(
    () =>
      model.samples.map((sample) => {
        const pixels = decodePixels(sample.pixels);
        const [x, y] = model.encode(pixels);
        return { sample, pixels, x, y };
      }),
    [model],
  );
  const bounds = useMemo(() => getBounds(points), [points]);
  const digitColors = useMemo(() => resolveTokens(digitColorTokens), []);
  const [latent, setLatent] = useState<Latent>([0, 0]);
  const [selected, setSelected] = useState<Point | null>(null);
  const pixels = model.decode(latent);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[1440px] px-5 pt-7 pb-10 sm:px-[clamp(20px,4vw,64px)]">
      <header className="grid grid-cols-[1fr_auto] items-center gap-3 pb-5 sm:grid-cols-[1fr_minmax(300px,1.35fr)_auto] sm:gap-7 sm:pb-7">
        <a
          className="text-foreground inline-flex items-center gap-2.5 font-bold tracking-[-0.035em]"
          href="/"
        >
          <span className="bg-accent/15 text-accent-soft border-border-strong grid size-[31px] place-items-center rounded-[10px] border">
            <Sparkles size={16} />
          </span>
          MNIST Autoencoder
        </a>
        <p className="text-muted col-span-full row-start-2 m-0 text-[.88rem] leading-6 sm:col-auto sm:row-auto">
          Explore how the network represents handwritten digits in two dimensions.
        </p>
        <span className="text-foreground-muted inline-flex items-center gap-2 text-xs whitespace-nowrap">
          <i className="bg-success size-[7px] rounded-full shadow-[0_0_12px_var(--color-success)]" />{" "}
          trained model
        </span>
      </header>
      <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,350px)] lg:gap-[clamp(18px,2.8vw,42px)]">
        <LatentSpace
          bounds={bounds}
          latent={latent}
          points={points}
          digitColors={digitColors}
          selected={selected}
          onChange={setLatent}
          onSelect={setSelected}
        />
        <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <DecodePreview latent={latent} pixels={pixels} />
          {selected && <SamplePreview point={selected} reconstruction={pixels} />}
          <ArchitectureHint />
        </aside>
      </section>
    </main>
  );
}

function LatentSpace({
  bounds,
  latent,
  points,
  digitColors,
  selected,
  onChange,
  onSelect,
}: {
  bounds: Bounds;
  latent: Latent;
  points: Point[];
  digitColors: string[];
  selected: Point | null;
  onChange: (latent: Latent) => void;
  onSelect: (point: Point | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 680, height: 620 });
  const [hovered, setHovered] = useState<Point | null>(null);
  const dragging = useRef(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ratio = devicePixelRatio || 1;
    canvas.width = size.width * ratio;
    canvas.height = size.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, size.width, size.height);
    const origin = project([0, 0], bounds, size);
    ctx.strokeStyle = cssToken("--color-grid");
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, size.height);
    ctx.moveTo(0, origin.y);
    ctx.lineTo(size.width, origin.y);
    ctx.stroke();
    for (const point of points) {
      const position = project([point.x, point.y], bounds, size);
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = digitColors[point.sample.label]!;
      ctx.beginPath();
      ctx.arc(position.x, position.y, 2.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const point of [hovered, selected]) {
      if (!point) {
        continue;
      }
      const position = project([point.x, point.y], bounds, size);
      ctx.strokeStyle =
        point === selected ? cssToken("--color-foreground") : cssToken("--color-accent-soft");
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(position.x, position.y, 7, 0, Math.PI * 2);
      ctx.stroke();
    }
    const cursor = project(latent, bounds, size);
    ctx.strokeStyle = cssToken("--color-foreground");
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cursor.x - 7, cursor.y);
    ctx.lineTo(cursor.x + 7, cursor.y);
    ctx.moveTo(cursor.x, cursor.y - 7);
    ctx.lineTo(cursor.x, cursor.y + 7);
    ctx.stroke();
  }, [bounds, digitColors, hovered, latent, points, selected, size]);
  const latentFromEvent = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return unproject({ x: event.clientX - rect.left, y: event.clientY - rect.top }, bounds, size);
  };
  const nearest = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    let match: Point | null = null;
    let distance = 9;
    for (const point of points) {
      const position = project([point.x, point.y], bounds, size);
      const next = Math.hypot(position.x - mouse.x, position.y - mouse.y);
      if (next < distance) {
        match = point;
        distance = next;
      }
    }
    return match;
  };
  return (
    <section className={`${panelClass} overflow-hidden`}>
      <div className="flex items-start justify-between px-5 pt-5 pb-4 sm:px-[26px] sm:pt-6 sm:pb-5">
        <div>
          <span className={eyebrowClass}>Bottleneck map</span>
          <h1 className="m-0 text-[1.15rem] font-semibold tracking-[-0.035em]">Latent space</h1>
        </div>
        <span className="text-foreground-muted rounded-[7px] bg-white/5 px-2 py-1.5 text-[.68rem]">
          {points.length.toLocaleString()} MNIST samples
        </span>
      </div>
      <div className="bg-plot border-border relative mx-[9px] h-[340px] overflow-hidden rounded-[13px] border sm:mx-[14px] sm:h-[420px] lg:h-[480px]">
        <canvas
          ref={canvasRef}
          className="block size-full cursor-crosshair touch-none"
          onPointerDown={(event) => {
            dragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            const point = nearest(event);
            onChange(point ? [point.x, point.y] : latentFromEvent(event));
            onSelect(point);
          }}
          onPointerMove={(event) => {
            const point = nearest(event);
            setHovered(point);
            if (dragging.current) {
              onChange(latentFromEvent(event));
              onSelect(null);
            }
          }}
          onPointerUp={() => {
            dragging.current = false;
          }}
          onPointerLeave={() => setHovered(null)}
          aria-label="Interactive two-dimensional latent space"
        />
        <span className="text-axis pointer-events-none absolute top-[11px] left-3 text-[.7rem] font-bold">
          z₂
        </span>
        <span className="text-axis pointer-events-none absolute right-3 bottom-2.5 text-[.7rem] font-bold">
          z₁
        </span>
        {hovered && <SampleTooltip point={hovered} />}
      </div>
      <div className="text-muted flex justify-between gap-2 px-5 py-4 text-[.72rem] sm:px-[26px] sm:pb-5">
        <span className="inline-flex items-center gap-1.5">
          <Move size={14} /> drag or click anywhere to decode
        </span>
        <span
          className="text-muted hidden items-center gap-2 text-[.68rem] sm:inline-flex"
          aria-label="Digit colour legend"
        >
          {digitColorTokens.map((token, label) => (
            <span key={label} className="inline-flex items-center gap-1">
              <i className="size-2 rounded-full" style={{ backgroundColor: `var(${token})` }} />
              {label}
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}

function DecodePreview({ latent, pixels }: { latent: Latent; pixels: number[] }) {
  return (
    <section className={`${panelClass} pb-5`}>
      <div className="text-muted flex items-start justify-between px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <div>
          <span className={eyebrowClass}>Decoder output</span>
          <h2 className="text-foreground m-0 text-[1.15rem] font-semibold tracking-[-0.035em]">
            Decoded image
          </h2>
        </div>
        <span className="bg-success mt-1 size-[7px] rounded-full shadow-[0_0_12px_var(--color-success)]" />
      </div>
      <PixelImage pixels={pixels} label="Decoded MNIST image" />
      <dl className="border-border bg-border mx-6 mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border">
        <div className="bg-surface-contrast px-3 py-2.5">
          <dt className="text-muted text-[.68rem]">z₁</dt>
          <dd className="text-foreground-soft mt-1 text-[.95rem] tabular-nums">
            {latent[0].toFixed(2)}
          </dd>
        </div>
        <div className="bg-surface-contrast px-3 py-2.5">
          <dt className="text-muted text-[.68rem]">z₂</dt>
          <dd className="text-foreground-soft mt-1 text-[.95rem] tabular-nums">
            {latent[1].toFixed(2)}
          </dd>
        </div>
      </dl>
      <p className="text-muted m-0 mt-2 flex items-center justify-center gap-1.5 text-[.72rem]">
        <Move size={14} /> Drag across the latent space to explore.
      </p>
    </section>
  );
}
function SamplePreview({ point, reconstruction }: { point: Point; reconstruction: number[] }) {
  return (
    <section className={`${panelClass} p-5 shadow-none`}>
      <div className="text-muted mb-3.5 flex justify-between text-[.72rem]">
        <span>Selected sample</span>
        <b className="text-foreground-soft font-semibold uppercase">digit {point.sample.label}</b>
      </div>
      <div className="flex justify-evenly gap-4">
        <figure className="m-0 text-center">
          <PixelImage pixels={point.pixels} label={`Original digit ${point.sample.label}`} />
          <figcaption className="text-muted mt-1.5 text-[.66rem]">Original</figcaption>
        </figure>
        <figure className="m-0 text-center">
          <PixelImage pixels={reconstruction} label="Reconstructed digit" />
          <figcaption className="text-muted mt-1.5 text-[.66rem]">Reconstructed</figcaption>
        </figure>
      </div>
    </section>
  );
}
function SampleTooltip({ point }: { point: Point }) {
  return (
    <div className="bg-plot/92 border-border-strong shadow-panel pointer-events-none absolute top-4 right-4 hidden items-center gap-2.5 rounded-[11px] border p-2 sm:flex">
      <PixelImage pixels={point.pixels} label={`Digit ${point.sample.label}`} />
      <div>
        <b className="mb-0.5 block text-[.72rem]">Digit {point.sample.label}</b>
        <span className="text-muted block text-[.62rem] tabular-nums">
          z₁ {point.x.toFixed(2)} · z₂ {point.y.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
function ArchitectureHint() {
  return (
    <section className={`${panelClass} self-stretch p-5 shadow-none`}>
      <span className={eyebrowClass}>Compression</span>
      <div className="text-foreground-muted flex items-center justify-between text-[.75rem]">
        <span>784 pixels</span>
        <i className="text-muted not-italic">→</i>
        <strong className="bg-accent/15 text-accent-soft border-accent/30 rounded-md border px-2 py-1 text-[.7rem]">
          z₁, z₂
        </strong>
        <i className="text-muted not-italic">→</i>
        <span>784 pixels</span>
      </div>
      <small className="text-muted mt-3 block text-[.68rem]">
        Labels colour the map, never the training.
      </small>
    </section>
  );
}
function PixelImage({ pixels, label }: { pixels: number[]; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    const image = ctx.createImageData(28, 28);
    for (let i = 0; i < 784; i++) {
      const value = Math.round(Math.max(0, Math.min(1, pixels[i] ?? 0)) * 255);
      image.data.set([value, value, value, 255], i * 4);
    }
    ctx.putImageData(image, 0, 0);
  }, [pixels]);
  return (
    <canvas
      ref={canvasRef}
      className="bg-surface-ink border-border mx-auto block aspect-square w-full max-w-[245px] rounded-xl border [image-rendering:pixelated]"
      width="28"
      height="28"
      aria-label={label}
      role="img"
    />
  );
}
function decodePixels(encoded: string) {
  return Array.from(atob(encoded), (value) => value.charCodeAt(0) / 255);
}
function cssToken(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}
function resolveTokens(tokens: string[]) {
  return tokens.map(cssToken);
}
function getBounds(points: Point[]): Bounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const padding = (values: number[]) =>
    Math.max((Math.max(...values) - Math.min(...values)) * 0.14, 0.05);
  const x = padding(xs);
  const y = padding(ys);
  return {
    minX: Math.min(...xs) - x,
    maxX: Math.max(...xs) + x,
    minY: Math.min(...ys) - y,
    maxY: Math.max(...ys) + y,
  };
}
function project([x, y]: Latent, bounds: Bounds, size: { width: number; height: number }) {
  return {
    x: ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * size.width,
    y: size.height - ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * size.height,
  };
}
function unproject(
  point: { x: number; y: number },
  bounds: Bounds,
  size: { width: number; height: number },
): Latent {
  return [
    bounds.minX + (point.x / size.width) * (bounds.maxX - bounds.minX),
    bounds.minY + ((size.height - point.y) / size.height) * (bounds.maxY - bounds.minY),
  ];
}
