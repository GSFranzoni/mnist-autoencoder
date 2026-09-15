import type { MnistSample } from "@/queries/network.query";

export type CanvasSize = { width: number; height: number };

export type CanvasPoint = { x: number; y: number };

export type Latent = [number, number];

export type Point = { sample: MnistSample; x: number; y: number };

export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

export function getBounds(points: Point[]): Bounds {
  const [first] = points;
  if (!first) {
    return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
  }

  let minX = first.x;
  let maxX = first.x;
  let minY = first.y;
  let maxY = first.y;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }
  const xPadding = Math.max((maxX - minX) * 0.14, 0.05);
  const yPadding = Math.max((maxY - minY) * 0.14, 0.05);
  return {
    minX: minX - xPadding,
    maxX: maxX + xPadding,
    minY: minY - yPadding,
    maxY: maxY + yPadding,
  };
}

export function drawLatentSpace(
  canvas: HTMLCanvasElement,
  {
    bounds,
    colors,
    hovered,
    latent,
    points,
    size,
  }: {
    bounds: Bounds;
    colors: string[];
    hovered: Point | null;
    latent: Latent;
    points: Point[];
    size: CanvasSize;
  },
) {
  const ratio = devicePixelRatio || 1;
  canvas.width = size.width * ratio;
  canvas.height = size.height * ratio;
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.scale(ratio, ratio);
  context.clearRect(0, 0, size.width, size.height);

  const origin = project([0, 0], bounds, size);
  context.strokeStyle = cssToken("--color-grid");
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(origin.x, 0);
  context.lineTo(origin.x, size.height);
  context.moveTo(0, origin.y);
  context.lineTo(size.width, origin.y);
  context.stroke();

  for (const point of points) {
    const position = project([point.x, point.y], bounds, size);
    context.globalAlpha = 0.74;
    context.fillStyle = colors[point.sample.label] ?? "#fff";
    context.beginPath();
    context.arc(position.x, position.y, 2.2, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 1;

  if (hovered) {
    const position = project([hovered.x, hovered.y], bounds, size);
    context.strokeStyle = cssToken("--color-accent-soft");
    context.lineWidth = 2;
    context.beginPath();
    context.arc(position.x, position.y, 7, 0, Math.PI * 2);
    context.stroke();
  }

  const cursor = project(latent, bounds, size);
  context.strokeStyle = cssToken("--color-foreground");
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(cursor.x - 7, cursor.y);
  context.lineTo(cursor.x + 7, cursor.y);
  context.moveTo(cursor.x, cursor.y - 7);
  context.lineTo(cursor.x, cursor.y + 7);
  context.stroke();
}

export function nearestPoint(
  mouse: CanvasPoint,
  points: Point[],
  bounds: Bounds,
  size: CanvasSize,
) {
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
}

export function project([x, y]: Latent, bounds: Bounds, size: CanvasSize): CanvasPoint {
  return {
    x: ((x - bounds.minX) / (bounds.maxX - bounds.minX)) * size.width,
    y: size.height - ((y - bounds.minY) / (bounds.maxY - bounds.minY)) * size.height,
  };
}

export function unproject(point: CanvasPoint, bounds: Bounds, size: CanvasSize): Latent {
  return [
    bounds.minX + (point.x / size.width) * (bounds.maxX - bounds.minX),
    bounds.minY + ((size.height - point.y) / size.height) * (bounds.maxY - bounds.minY),
  ];
}

function cssToken(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}
