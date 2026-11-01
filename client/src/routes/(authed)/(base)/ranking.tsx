import { RankedUserBar } from "#/components/ranked-user-bar";
import { useRankings } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";
import styles from "./ranking.module.css";

export const Route = createFileRoute("/(authed)/(base)/ranking")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: rankingData, isLoading } = useRankings({ period: "weekly", limit: 20 });
  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <h1 className={styles.heading}>Weekly Ranking</h1>

      {rankingData && rankingData.length > 0 ? (
        <>
          {rankingData.map((entry) => (
            <RankedUserBar
              key={`ranking-${entry.user.id}`}
              {...{
                avatarUrl: entry.user.profileImage,
                rank: entry.rank,
                name: entry.user.name,
                epithet: entry.user.epithet,
                username: entry.user.username,
                backgroundUrl: entry.user.backgroundImage,
                xp: entry.xpEarned,
                level: entry.user.level,
              }}
            />
          ))}
        </>
      ) : (
        <div className={styles.noDataMessage}>No data available.</div>
      )}
    </>
  );
}
