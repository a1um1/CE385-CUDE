import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import { useTestData } from "#/data/test.data";
import { useSignOut, useUser } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data, isLoading, error } = useTestData();
  const user = useUser();
  const signOutMutation = useSignOut();

  const handleSignOut = async () => {
    signOutMutation.mutateAsync();
  };
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
      <div className="mt-4">
        {user.isLoading ? (
          "Loading user..."
        ) : user.error ? (
          <>
            <ButtonLink to="/auth/signin" variant="primary" size="md" radius="none" block>
              Sign In{" "}
            </ButtonLink>
          </>
        ) : user.data ? (
          <>
            <p>
              Welcome, {user.data.name} ({user.data.email})
            </p>
            <Button onClick={handleSignOut}>Sign Out</Button>
          </>
        ) : (
          "No user data"
        )}
      </div>
    </div>
  );
}
