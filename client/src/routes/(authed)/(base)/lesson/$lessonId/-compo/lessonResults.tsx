import type { components } from "#/data/base/openapi";
import { useExerciseFromLessonQuery } from "#/data/exercise.data";
import { useLearnSessionsQuery } from "#/data/learnSession.data";
import { useLoaderData } from "@tanstack/react-router";
import { Book, type LucideIcon } from "lucide-react";

export const lessonRouteId = "/(authed)/(base)/lesson/$lessonId";

export const useLessonResults = () => {
  const lesson = useLoaderData({ from: lessonRouteId });
  const sessions = useLearnSessionsQuery(["submissions"]);
  const exercises = useExerciseFromLessonQuery(lesson.id);

  const total = exercises.data?.filter((exercise) => exercise.type === "CODE").length ?? 0;

  const attempts = (sessions.data ?? [])
    .filter(
      (session) =>
        session.LessonID === lesson.id &&
        (session.status === "SUBMITTED" || session.status === "CANCELLED"),
    )
    .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      cancelled: session.status === "CANCELLED",
      passed: session.submissions?.filter((submission) => submission.ok).length ?? 0,
    }));

  return { total, attempts };
};

export const availableStatuses = {
  AVAILABLE: {
    label: "Available",
    status: "inProgress",
    icon: Book,
  },
  PENDING: {
    label: "In Progress",
    status: "inProgress",
    icon: undefined,
  },
  NOT_AVAILABLE: {
    label: "Not Available",
    status: "locked",
    icon: undefined,
  },
} as const satisfies Record<
  components["schemas"]["EnrollmentStatus"],
  {
    label: string;
    status: "inProgress" | "fail" | "locked";
    icon: LucideIcon | undefined;
  }
>;
