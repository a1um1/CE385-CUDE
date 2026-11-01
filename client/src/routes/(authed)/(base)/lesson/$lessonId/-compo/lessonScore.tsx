import { Scoring } from "#/components/scoring";
import { formatPercent } from "#/lib/formatNumber";
import { LessonAvailability } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonAvailability";
import { useLessonResults } from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";

export const LessonScore = () => {
  const { total, attempts } = useLessonResults();
  const latest = attempts.find((attempt) => !attempt.cancelled);

  if (!latest) return <LessonAvailability />;

  return (
    <Scoring
      status={total > 0 && latest.passed === total ? "success" : "fail"}
      label={formatPercent(latest.passed, total)}
    />
  );
};
