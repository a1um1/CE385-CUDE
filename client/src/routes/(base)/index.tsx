import ButtonLink from "#/components/buttonLink";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/")({ component: Home });

function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold">CUDE</h1>
      <div>
        <ButtonLink variant="secondary" to="/play">
          Code Playground
        </ButtonLink>
        <ButtonLink variant="secondary" to="/play-grader">
          Code Grader
        </ButtonLink>
      </div>
    </>
  );
}
