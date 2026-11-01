import Badge from "#/components/badge";
import Skeleton from "#/components/skeleton";
import { Link } from "@tanstack/react-router";
import styles from "./exerciseList.module.css";

export interface ExerciseListItem {
  id: string;
  name: string;
  badge?: { label: string; color?: string };
}

export interface ExerciseListProps {
  items: ExerciseListItem[] | undefined;
  isLoading?: boolean;
  /** When set, every row links to that exercise of the session. */
  sessionId?: string;
}

/** Numbered list of a lesson's exercises, with an optional result badge per row. */
export interface ExerciseListErrorProps {
  isError?: boolean;
  errorMessage?: string;
}

export default function ExerciseList({
  items,
  isLoading,
  sessionId,
  isError,
  errorMessage,
}: ExerciseListProps & ExerciseListErrorProps) {
  if (isLoading) return <Skeleton className={styles.skeletonLoader} />;
  if (isError) {
    return (
      <div className={styles.errorMessage}>
        {errorMessage ?? "Failed to load exercises."}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return <div className={styles.emptyMessage}>No exercises found.</div>;
  }

  return (
    <ol className={styles.list}>
      {items.map((item, index) => {
        const row = (
          <>
            <span className={styles.indexNumber}>{index + 1}.</span>
            <span className={styles.itemName}>{item.name}</span>
            {item.badge && <Badge color={item.badge.color}>{item.badge.label}</Badge>}
          </>
        );

        return (
          <li key={item.id} className={styles.item}>
            {sessionId ? (
              <Link
                className={styles.row}
                to="/session/$id/$exerciseId"
                params={{ id: sessionId, exerciseId: item.id }}
              >
                {row}
              </Link>
            ) : (
              <div className={styles.row}>{row}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
