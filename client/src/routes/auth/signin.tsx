import Button from "#/components/button";
import Input from "#/components/input";
import { useSignIn } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/signin")({
  component: RouteComponent,
});

function RouteComponent() {
  const signInMutation = useSignIn();

  const handleFormSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInMutation.mutateAsync({ email, password });
      alert("Sign-in successful!");
    } catch (error) {
      console.error("Sign-in failed:", error);
      alert("Sign-in failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-semibold">Sign In</h1>
      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email">Email</label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            disabled={signInMutation.isPending}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <Input
            type="password"
            id="password"
            name="password"
            required
            disabled={signInMutation.isPending}
          />
        </div>
        <Button type="submit" disabled={signInMutation.isPending} block>
          Sign In
        </Button>
      </form>
    </div>
  );
}
