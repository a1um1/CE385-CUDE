import { resolveSession } from "#/data/user.data";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import styles from "./auth.module.css";
import Logo from "#/components/logo";
import AsciiPanel from "#/routes/auth/-ascii";
import images from "./wallpaper.json";
import { useState } from "react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = await resolveSession(context.queryClient);

    if (user) throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  // oxlint-disable-next-line react/hook-use-state
  const [randomImage] = useState(
    () => images[Math.floor(Math.random() * images.length)] ?? images[0],
  );
  return (
    <div className={styles["hex-bg"]}>
      <AsciiPanel
        src={randomImage?.src ?? ""}
        name={randomImage?.name}
        author={randomImage?.author}
      />
      <div className={styles.container}>
        <div className={styles.subContainer}>
          <div className={styles.logo}>
            <Logo />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
