export default function formatNumber(num: number, decimals = 2) {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function padNumber(num: number, length: number) {
  return num.toString().padStart(length, "0");
}

/** A score as a whole percentage, e.g. `1` of `3` becomes `33%`. */
export function formatPercent(passed: number, total: number) {
  return `${total > 0 ? Math.round((passed / total) * 100) : 0}%`;
}
