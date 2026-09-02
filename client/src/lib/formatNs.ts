export default function formatNstoMs(ns: number) {
  return (ns / 1_000_100).toFixed(2);
}
