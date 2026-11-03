import Badge from "#/components/badge";
import formatElapsedTime from "#/lib/elapsedTime";
import formatNumber from "#/lib/formatNumber";
import formatRelativeTime from "#/lib/relativeTime";
import {
  lessonRouteId,
  useLessonResults,
} from "#/routes/(authed)/(base)/lesson/$lessonId/-compo/lessonResults";
import { Link, useLoaderData } from "@tanstack/react-router";
import styles from "#/routes/(authed)/(base)/lesson/$lessonId/lessonHistory.module.css";
import { gradeStatusColor } from "#/lib/gradeStatus";

export const LessonHistory = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const { attempts } = useLessonResults();

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>ประวัติการเรียน</h3>
      {attempts.length === 0 ? (
        <p className={styles.noAttemptsMessage}>ยังไม่มีการส่งงาน</p>
      ) : (
        <ul className={styles.list}>
          {attempts.map((attempt, index) => (
            <li key={attempt.id} className={styles.item}>
              <Link
                className={styles.link}
                to="/lesson/$lessonId/$sessionId"
                params={{ lessonId: lesson.id, sessionId: attempt.id }}
              >
                <span className={styles.content}>
                  <div className={styles.attemptHeader}>
                    <span>ครั้งที่ {attempts.length - index}</span>
                    <Badge color={gradeStatusColor[attempt.gradeStatus] || "var(--color-gray-500)"}>
                      {attempt.gradeStatus === "CANCELLED"
                        ? "ยอมแพ้"
                        : `${formatNumber(attempt.score, 0)}%`}
                    </Badge>
                  </div>
                  <span className={styles.timestamp}>
                    {`${formatRelativeTime(attempt.createdAt)} ใช้เวลา ${formatElapsedTime(attempt.createdAt, attempt.updatedAt)}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
