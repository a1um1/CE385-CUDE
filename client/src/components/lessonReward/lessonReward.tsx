import Gem from "#/components/icon/gem";

export interface LessonRewardProps {
  xp: number;
  gems: number;
}

/** The XP and gems a lesson pays on the first pass. */
export default function LessonReward({ xp, gems }: LessonRewardProps) {
  return (
    <p className="flex items-center gap-2">
      <span className="text-success bg-linear-to-t from-success/40 to-transparent rounded-full border-2 px-4 py-1.5 font-bold italic">
        +{xp} XP
      </span>
      <span className="text-gem bg-linear-to-t from-gem/40 to-transparent rounded-full border-2 px-4 py-1.5 flex gap-2">
        <Gem /> {gems}
      </span>
    </p>
  );
}
