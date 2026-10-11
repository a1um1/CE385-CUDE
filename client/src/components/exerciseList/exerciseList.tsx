import Badge from "#/components/badge";
import Skeleton from "#/components/skeleton";
import { Link } from "@tanstack/react-router";

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
export default function ExerciseList({ items, isLoading, sessionId }: ExerciseListProps) {
  if (isLoading) return <Skeleton className="h-14" />;

  return (
    <ol className="flex flex-col gap-2">
      {items?.map((item, index) => (
        <li key={item.id} className="flex items-center gap-3 border border-border px-4 py-3">
          <span className="opacity-50">{index + 1}.</span>
          {sessionId ? (
            <Link
              className="flex-1"
              to="/session/$id/$exerciseId"
              params={{ id: sessionId, exerciseId: item.id }}
            >
              {item.name}
            </Link>
          ) : (
            <span className="flex-1">{item.name}</span>
          )}
          {item.badge && <Badge color={item.badge.color}>{item.badge.label}</Badge>}
        </li>
      ))}
    </ol>
  );
}
