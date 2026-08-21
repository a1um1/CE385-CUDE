import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/")({ component: Home });

function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold">CUDE</h1>
    </>
  );
}
