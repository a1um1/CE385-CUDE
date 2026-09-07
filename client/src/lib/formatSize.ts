const SIZES = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const;
export type SizeUnit = (typeof SIZES)[number];

export default function formatFileSize(
  value: number,
  inputUnit: SizeUnit = "Bytes",
  decimals = 2,
): string {
  if (value === 0) return "0 Bytes";

  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // 1. Normalize input to base bytes
  const inputIndex = Math.max(0, SIZES.indexOf(inputUnit));
  const rawBytes = absValue * 1024 ** inputIndex;

  // 2. Determine target unit index
  const dm = Math.max(0, decimals);
  let unitIndex = Math.floor(Math.log(rawBytes) / Math.log(1024));
  unitIndex = Math.min(unitIndex, SIZES.length - 1);

  // 3. Compute value and handle rollover (e.g., 1023.99 -> 1024)
  let scaledValue = rawBytes / 1024 ** unitIndex;
  if (parseFloat(scaledValue.toFixed(dm)) >= 1024 && unitIndex < SIZES.length - 1) {
    unitIndex += 1;
    scaledValue /= 1024;
  }

  const sign = isNegative ? "-" : "";
  return `${sign}${parseFloat(scaledValue.toFixed(dm))} ${SIZES[unitIndex]}`;
}
