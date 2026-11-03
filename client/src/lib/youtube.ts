/** YouTube thumbnail URL for a `watch`, `youtu.be` or embed link. */
export function youtubeThumbnail(url: string): string {
  const parsed = new URL(url);
  const id = parsed.searchParams.get("v") ?? parsed.pathname.match(/[^/]+$/)?.[0];
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
