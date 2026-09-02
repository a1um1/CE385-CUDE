export default function formatBytetoMb(b: number) {
  return (b / 1_048_576).toFixed(2);
}
