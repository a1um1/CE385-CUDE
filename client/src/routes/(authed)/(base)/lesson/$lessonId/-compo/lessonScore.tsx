import { Scoring } from "#/components/scoring";
import formatNumber from "#/lib/formatNumber";
import { gradeScoringStatus } from "#/lib/gradeStatus";
import { LessonAvailability } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonAvailability";
import { useLessonResults } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";

export const LessonScore = () => {
  const { attempts } = useLessonResults();
  const [latest] = attempts;

  if (!latest) return <LessonAvailability />;

  return (
    <Scoring
      status={gradeScoringStatus[latest.gradeStatus]}
      label={`${formatNumber(latest.score, 0)}%`}
    />
  );
};
