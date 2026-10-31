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
import Calendar from "#/components/calendar";
import type { CSSProperties } from "react";

const activityStatusColor = {
  PENDING: "#3B82F6",
  SUBMITTED: "#F59E0B",
  GRADED: "#10B981",
  CANCELLED: "#6B7280",
} satisfies Record<string, string>;

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
      </div>
      <div className={styles["profile-header"]}>
        <Avatar avatarUrl={data?.profileImage} name={data?.name} size="8rem" />
        <div className={styles["header-main"]}>
          <div>
            <span>@{data?.username}</span>{" "}
            {isSelf && (
              <ButtonLink to="/account" variant="secondary" size="sm">
                <PencilIcon />
                Edit profile
              </ButtonLink>
            )}
          </div>
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
      <div className={styles["profile-content"]}>
        <section className={styles["profile-calendar"]}>
          <Calendar month={new Date().getMonth() + 1} year={new Date().getFullYear()} />
        </section>
        <section className={styles["activity"]}>
          <h2 className={styles["activity-title"]}>Recent activity</h2>
          {data && data.recentActivity.length > 0 ? (
            <ul className={styles["activity-list"]}>
              {data.recentActivity.map((activity) => (
                <li key={activity.id} className={styles["activity-item"]}>
                  <div className={styles["activity-info"]}>
                    <span className={styles["activity-lesson"]}>{activity.lessonName}</span>
                    <span className={styles["activity-context"]}>{activity.unitName}</span>
                  </div>
                  <div className={styles["activity-meta"]}>
                    <span
                      className={styles["activity-status"]}
                      style={
                        { "--status-color": activityStatusColor[activity.status] } as CSSProperties
                      }
                    >
                      {activity.status}
                    </span>
                    <span className={styles["activity-time"]}>
                      {new Date(activity.createdAt).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles["activity-empty"]}>No lesson sessions yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
