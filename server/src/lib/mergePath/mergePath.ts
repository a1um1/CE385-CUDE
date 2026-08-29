export function mergePath(...segments: (string | undefined)[]): string {
  const merged = segments
    .map((segment) => (segment ? segment.trim() : ""))
    .filter((segment) => segment !== "")
    .join("/")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "");
  return merged;
}
