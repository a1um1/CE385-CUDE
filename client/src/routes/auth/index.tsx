import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/")({
  beforeLoad: async () => {
    throw redirect({
      to: "/auth/signin",
    });
  },
});
