// Sequential awaits are the point: each encode depends on the previous result.
/* oxlint-disable no-await-in-loop */

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_QUALITY = 0.05;
const MAX_QUALITY = 0.9;
const QUALITY_STEP = 0.05;

type Encode = (quality: number) => Promise<Blob | null>;

// Highest quality at or under targetBytes, null if even MIN_QUALITY overshoots.
async function searchQuality(encode: Encode, targetBytes: number): Promise<Blob | null> {
  let lo = MIN_QUALITY;
  let hi = MAX_QUALITY;
  let best: Blob | null = null;

  while (hi - lo > QUALITY_STEP) {
    const mid = (lo + hi) / 2;
    const blob = await encode(mid);
    if (!blob) throw new Error("Image compression failed");
    if (blob.size <= targetBytes) {
      best = blob;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  if (best) return best;
  const floor = await encode(MIN_QUALITY);
  return floor && floor.size <= targetBytes ? floor : null;
}

// Crop region → WebP blob at most targetBytes long: binary-search quality first,
// halve resolution only when even MIN_QUALITY overshoots. Best effort if the
// target is unreachable — server presign enforces the hard size limit.
export async function cropToBlob(
  src: string,
  crop: CropRect,
  maxDim: number,
  targetBytes: number,
): Promise<Blob> {
  const img = new Image();
  img.src = src;
  await img.decode();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  let scale = Math.min(1, maxDim / Math.max(crop.width, crop.height));
  let best: Blob | null = null;

  const encode: Encode = (quality) =>
    new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));

  for (let attempt = 0; attempt < 3; attempt++) {
    canvas.width = Math.max(1, Math.round(crop.width * scale));
    canvas.height = Math.max(1, Math.round(crop.height * scale));
    ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);

    const top = await encode(MAX_QUALITY);
    if (!top) throw new Error("Image compression failed");
    if (top.size <= targetBytes) return top;
    best = top;

    const fit = await searchQuality(encode, targetBytes);
    if (fit) return fit;

    scale *= 0.5;
  }

  if (!best) throw new Error("Image compression failed");
  return best;
}
