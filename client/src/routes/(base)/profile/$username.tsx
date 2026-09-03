import Avatar from "#/components/avatar";
import UserBackground from "#/components/userBackground";
import { useQueryProfile } from "#/data/profile.data";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./profile.module.css";
export const Route = createFileRoute("/(base)/profile/$username")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = Route.useParams();
  const { data, isLoading } = useQueryProfile(username);
  if (isLoading) return <div>Loading...</div>;
  return (
    <>
      <div className={styles["breakout"]}>
        <div className={styles["fade"]} />
        <UserBackground
          className={styles["background-user-banner"]}
          backgroundUrl={data?.backgroundImage}
          name={data?.name}
        />
      </div>
      <div className={styles["profile-header"]}>
        <Avatar avatarUrl={data?.profileImage} name={data?.name} size="8rem" />
        <div>
          <span>@{data?.username}</span>
          <h1 className="text-3xl font-semibold">
            {data?.name}{" "}
            {data?.epithet && <span className={styles["epihet"]}>{data?.epithet}</span>}
          </h1>
        </div>
      </div>
    </>
  );
}
