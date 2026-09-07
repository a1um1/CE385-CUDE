export default function formatNumber(num: number, decimals = 2) {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}
