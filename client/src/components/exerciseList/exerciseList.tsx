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
  if (isLoading) return <Skeleton className="h-14" />;
  if (isError) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-red-500">
        {errorMessage ?? "Failed to load exercises."}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No exercises found.</div>;
  }

  return (
    <ol className="flex flex-col">
      {items.map((item, index) => {
        const row = (
          <>
            <span className="opacity-50">{index + 1}.</span>
            <span className="flex-1">{item.name}</span>
            {item.badge && <Badge color={item.badge.color}>{item.badge.label}</Badge>}
          </>
        );

        return (
          <li key={item.id} className="border-b border-border">
            {sessionId ? (
              <Link
                className="flex items-center gap-4 p-4 hover:bg-gray-500/10"
                to="/session/$id/$exerciseId"
                params={{ id: sessionId, exerciseId: item.id }}
              >
                {row}
              </Link>
            ) : (
              <div className="flex items-center gap-4 p-4">{row}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
