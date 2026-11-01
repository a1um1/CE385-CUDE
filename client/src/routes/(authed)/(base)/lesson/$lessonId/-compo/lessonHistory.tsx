import Badge from "#/components/badge";
import formatElapsedTime from "#/lib/elapsedTime";
import { formatPercent } from "#/lib/formatNumber";
import formatRelativeTime from "#/lib/relativeTime";
import {
  lessonRouteId,
  useLessonResults,
} from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";
import { Link, useLoaderData } from "@tanstack/react-router";

export const LessonHistory = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const { total, attempts } = useLessonResults();

  return (
    <div className="flex flex-col gap-2 min-w-sm">
      <h3 className="text-lg font-bold">ประวัติการเรียน</h3>
      {attempts.length === 0 ? (
        <p className="opacity-70">ยังไม่มีการส่งงาน</p>
      ) : (
        <ul className="flex flex-col">
          {attempts.map((attempt, index) => (
            <li key={attempt.id} className="border-b border-border">
              <Link
                className="flex items-center gap-4 p-4 hover:bg-secondary"
                to="/lesson/$lessonId/$sessionId"
                params={{ lessonId: lesson.id, sessionId: attempt.id }}
              >
                <span className="flex flex-1 flex-col">
                  <span>ครั้งที่ {attempts.length - index}</span>
                  <span className="text-sm opacity-70">
                    {`${formatRelativeTime(attempt.createdAt)} · ใช้เวลา ${formatElapsedTime(attempt.createdAt, attempt.updatedAt)}`}
                  </span>
                </span>
                <Badge>{attempt.cancelled ? "ยอมแพ้" : formatPercent(attempt.passed, total)}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
