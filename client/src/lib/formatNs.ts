export default function formatNstoMs(ns: number) {
  return (ns / 1e6).toFixed(2);
}
