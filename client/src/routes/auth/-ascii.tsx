import { useEffect, useRef, useState } from "react";
import styles from "./ascii.module.css";

const CHARS = " .:-=+*#%@";
const BOOST = 2; // saturation boost
const MIN_BRIGHT = 0.08; // skip near-black pixels
const CHAR_ASPECT = 0.6; // char cell is narrower than tall

const CELL_START = 60;
const CELL_END = 6;
const DURATION = 1400; // ms

interface AsciiPanelProps {
  src: string;
  name?: string;
  author?: string;
}

const clamp255 = (v: number): number => Math.min(255, Math.max(0, v));

function sampleImage(
  img: HTMLImageElement,
  cols: number,
  rows: number,
  width: number,
  height: number,
  cw: number,
  ch: number,
): Uint8ClampedArray | null {
  const offscreen = document.createElement("canvas");
  offscreen.width = cols;
  offscreen.height = rows;
  const sx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!sx) return null;

  // cover fit in real pixels, so the aspect ratio is preserved
  const scale = Math.max(width / img.width, height / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;

  // convert to grid units: one grid pixel = one cw x ch character cell
  sx.drawImage(img, (width - dw) / 2 / cw, (height - dh) / 2 / ch, dw / cw, dh / ch);
  return sx.getImageData(0, 0, cols, rows).data;
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  data: Uint8ClampedArray,
  i: number,
  px: number,
  py: number,
): void {
  const r0 = data[i] ?? 0;
  const g0 = data[i + 1] ?? 0;
  const b0 = data[i + 2] ?? 0;

  const l = (0.299 * r0 + 0.587 * g0 + 0.114 * b0) / 255;
  if (l < MIN_BRIGHT) return;

  // boost saturation around the luminance
  const L = l * 255;
  const r = Math.trunc(clamp255(L + (r0 - L) * BOOST));
  const g = Math.trunc(clamp255(L + (g0 - L) * BOOST));
  const b = Math.trunc(clamp255(L + (b0 - L) * BOOST));

  ctx.fillStyle = `rgb(${r},${g},${b})`;
  const idx = Math.min(CHARS.length - 1, Math.trunc(l * CHARS.length));
  ctx.fillText(CHARS.charAt(idx), px, py);
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  // coefficients for x(s) and y(s), with P0=(0,0) and P3=(1,1)
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (s: number): number => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number): number => ((ay * s + by) * s + cy) * s;
  const slopeX = (s: number): number => (3 * ax * s + 2 * bx) * s + cx;

  // given time t (x axis), find s such that x(s) = t, then return y(s)
  return (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    // Newton-Raphson, falls back to bisection if the slope is flat
    let s = t;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(s) - t;
      if (Math.abs(err) < 1e-5) return sampleY(s);
      const d = slopeX(s);
      if (Math.abs(d) < 1e-6) break;
      s -= err / d;
    }

    let lo = 0;
    let hi = 1;
    s = t;
    while (hi - lo > 1e-5) {
      if (sampleX(s) < t) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
    return sampleY(s);
  };
}

const ease = cubicBezier(0.99, 0, 0.01, 1.01);

export default function AsciiPanel({ src, name, author }: AsciiPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [readySrc, setReadySrc] = useState<string | null>(null);
  const ready = readySrc === src;

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const canvas: HTMLCanvasElement = el;
    const context: CanvasRenderingContext2D = ctx;

    const reduceMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const img = new Image();
    let loaded = false;
    let cell = reduceMotion ? CELL_END : CELL_START;
    let resizeFrame = 0;
    let animFrame = 0;
    let readyFrame = 0;

    function render(): void {
      if (!loaded) return;

      const { width, height } = canvas.getBoundingClientRect();
      const dpr = globalThis.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cw = cell * CHAR_ASPECT;
      const ch = cell;
      const cols = Math.ceil(width / cw);
      const rows = Math.ceil(height / ch);

      const data = sampleImage(img, cols, rows, width, height, cw, ch);
      if (!data) return;

      context.clearRect(0, 0, width, height);
      context.font = `${cell}px "JetBrains Mono", monospace`;
      context.textBaseline = "top";

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          drawCell(context, data, (y * cols + x) * 4, x * cw, y * ch);
        }
      }
    }

    function animate(start: number): void {
      const step = (now: number): void => {
        const t = Math.min(1, (now - start) / DURATION);
        const next = Math.round(CELL_START + (CELL_END - CELL_START) * ease(t));
        if (next !== cell) {
          cell = next;
          render(); // only re-render when the pixel size actually changes
        }
        if (t < 1) animFrame = requestAnimationFrame(step);
      };
      animFrame = requestAnimationFrame(step);
    }

    const onResize = (): void => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(render);
    };

    const onLoad = (): void => {
      loaded = true;
      render(); // first frame at CELL_START
      readyFrame = requestAnimationFrame(() => setReadySrc(src));
      if (!reduceMotion) animate(performance.now());
    };

    img.addEventListener("load", onLoad);
    img.src = src;
    globalThis.addEventListener("resize", onResize);

    return () => {
      img.removeEventListener("load", onLoad);
      globalThis.removeEventListener("resize", onResize);
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(animFrame);
      cancelAnimationFrame(readyFrame);
    };
  }, [src]);

  return (
    <div className={styles["ascii-panel"]}>
      <canvas
        ref={canvasRef}
        className={`${styles["ascii-canvas"]} ${ready ? styles.visible : ""}`}
      />
      <div className={styles["image-attribution"]}>
        {readySrc && (
          <>
            <span className={styles["image-name"]}>{name}</span>
            <span className={styles["image-author"]}>{`${author}`}</span>
          </>
        )}
      </div>
    </div>
  );
}
