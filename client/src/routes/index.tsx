import Navbar from "#/components/navbar";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      <Navbar />
      <div className="container p-4">
        <h1 className="text-4xl font-bold">CUDE</h1>
      </div>
    </>
  );
}
