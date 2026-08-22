export function mergePath(...segments: (string | undefined)[]): string {
  return segments
    .map((seg, i) => {
      if (i === 0) return seg?.replace(/\/+$/, "");
      return seg?.replace(/^\/+|\/+$/g, "");
    })
    .filter(Boolean)
    .join("/");
}
