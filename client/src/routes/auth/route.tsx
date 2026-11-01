import { resolveSession } from "#/data/user.data";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import styles from "./auth.module.css";
import Logo from "#/components/logo";
export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await resolveSession(context.queryClient);

    if (user) throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={styles["hex-bg"]}>
      <div className={styles.container}>
        <div>
          <Logo />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
