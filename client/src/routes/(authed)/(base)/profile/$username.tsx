import Avatar from "#/components/avatar";
import ButtonLink from "#/components/buttonLink";
import { ProgressBar } from "#/components/progress-bar";
import { Ranked } from "#/components/ranked";
import UserBackground from "#/components/userBackground";
import { profileQueryOptions } from "#/data/profile.data";
import { useUser } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./profile.module.css";
import { PencilIcon } from "lucide-react";

export const Route = createFileRoute("/(authed)/(base)/profile/$username")({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const profile = await context.queryClient.query(profileQueryOptions(params.username));
    return profile;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  const { data: me } = useUser();
  const isSelf = me != null && data?.id === me.id;
  return (
    <>
      <div className={styles["breakout"]}>
        <UserBackground
          className={styles["background-user-banner"]}
          backgroundUrl={data?.backgroundImage}
          name={data?.name}
        />
        <div className={styles["fade"]} />
        {isSelf && (
          <div className={styles["edit-button-container"]}>
            <ButtonLink
              to="/account"
              variant="secondary"
              size="sm"
              className={styles["edit-button"]}
            >
              <PencilIcon />
              Edit profile
            </ButtonLink>
          </div>
        )}
      </div>
      <div className={styles["profile-header"]}>
        <Avatar avatarUrl={data?.profileImage} name={data?.name} size="8rem" />
        <div className={styles["header-main"]}>
          <span>@{data?.username}</span>
          <div className={styles["name-row"]}>
            <h1 className={styles["page-title"]}>
              {data?.name}{" "}
              {data?.epithet && <span className={styles["epihet"]}>{data?.epithet}</span>}
            </h1>
          </div>
        </div>
        <div className={styles["level-row"]}>
          <div className={styles["level-progress"]}>
            <span className={styles["level-xp"]}>
              {(data?.xpIntoLevel ?? 0).toLocaleString()} /{" "}
              {((data?.xpIntoLevel ?? 0) + (data?.xpToNextLevel ?? 0)).toLocaleString()} XP
            </span>
            <ProgressBar progress={data?.levelProgressPercent ?? 0} height="0.75rem" />
          </div>
          <Ranked rank={data?.level ?? 0} size="7rem" />
        </div>
      </div>
    </>
  );
}
