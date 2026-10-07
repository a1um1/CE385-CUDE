import Avatar from "#/components/avatar";
import ButtonLink from "#/components/buttonLink";
import UserBackground from "#/components/userBackground";
import { profileQueryOptions } from "#/data/profile.data";
import { useUser } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./profile.module.css";
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">
              {data?.name}{" "}
              {data?.epithet && <span className={styles["epihet"]}>{data?.epithet}</span>}
            </h1>
            {isSelf && (
              <ButtonLink to="/account" variant="secondary">
                Edit profile
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
