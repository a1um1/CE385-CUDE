import Button from "#/components/button";
import Input from "#/components/input";
import { useSignUp } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const signUpMutation = useSignUp();
  const navigate = Route.useNavigate();
  const handleFormSubmit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signUpMutation.mutateAsync({ name, email, password });
      alert("Sign-up successful!");
      navigate({ to: "/auth/signin" });
    } catch (error) {
      console.error("Sign-up failed:", error);
      alert("Sign-up failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Sign Up</h1>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <Input type="text" id="name" name="name" required disabled={signUpMutation.isPending} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <Input
            type="email"
            id="email"
            name="email"
            required
            disabled={signUpMutation.isPending}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <Input
            type="password"
            id="password"
            name="password"
            required
            disabled={signUpMutation.isPending}
          />
        </div>
        <Button type="submit" disabled={signUpMutation.isPending}>
          Sign Up
        </Button>
      </form>
    </div>
  );
}
