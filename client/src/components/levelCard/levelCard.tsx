import { ProgressBar } from "#/components/progress-bar";
import { Ranked } from "#/components/ranked";
import UserBackground from "#/components/userBackground";
import { useUser, useUserStats } from "#/data/user.data";

export default function LevelCard() {
  const { data: user } = useUser();
  const { data: stats } = useUserStats();
  const level = stats?.level ?? 0;
  const xpIntoLevel = stats?.xpIntoLevel ?? 0;
  const xpToNextLevel = stats?.xpToNextLevel ?? 0;

  return (
    <div className="flex flex-col mb-1">
      <div className="relative">
        <UserBackground backgroundUrl={user?.backgroundImage} name={user?.name} />
        <div className="bg-linear-to-t from-background/80 to-background/50 absolute inset-0" />
      </div>

      <div className="flex items-center gap-4 -mt-14 px-2 z-0">
        <Ranked rank={level} size="80px" />
        <div className="flex flex-col flex-1 gap-3">
          <div className="flex justify-between">
            <span className="text-lg font-semibold">Level {level}</span>
            <span>
              {xpIntoLevel} / {xpIntoLevel + xpToNextLevel} XP
            </span>
          </div>

          <ProgressBar progress={stats?.levelProgressPercent ?? 0} height="0.5rem" />
        </div>
      </div>
    </div>
  );
}
