import { useTestData } from "#/data/test.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data, isLoading, error } = useTestData();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        {isLoading
          ? "Loading..."
          : error
            ? `Error: ${error}`
            : `Random Number: ${data?.randomNumber}`}
      </p>
    </div>
  );
}
