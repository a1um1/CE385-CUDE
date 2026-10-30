import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import DataTable, { createTableColumnHelper } from "#/components/table";
import { useAdminSessionListQuery } from "#/data/admin/session.data";
import { useAdminCourseListQuery } from "#/data/admin/course.data";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import { useAdminUnitListQuery } from "#/data/admin/unit.data";
import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import Input from "#/components/input";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "#/components/select";
import { basicPaginationSchema } from "#/lib/pagination.schema";
import { sessionResult, submissionResultColor } from "#/lib/submissionResult";
import { z } from "zod";
import styles from "./submissionList.module.css";

const sessionSearchSchema = basicPaginationSchema.extend({
  userSearch: z.string().optional(),
  courseID: z.string().optional(),
  unitID: z.string().optional(),
  lessonID: z.string().optional(),
  result: z.enum(["PASSED", "FAILED", "GRADING", "ONGOING", "GIVEUP"]).optional(),
});

type ResultValue = NonNullable<z.infer<typeof sessionSearchSchema>["result"]>;

export const Route = createFileRoute("/admin/submission/")({
  validateSearch: (search) => sessionSearchSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "Lesson Sessions",
    pageKey: "submissions-list",
  },
});

type AdminSession = NonNullable<
  ReturnType<typeof useAdminSessionListQuery>["data"]
>["data"][number];

const columnHelper = createTableColumnHelper<AdminSession>();

const resultOptions = [
  { value: "ALL", label: "All Results" },
  { value: "PASSED", label: "Passed" },
  { value: "FAILED", label: "Failed" },
  { value: "GRADING", label: "Grading" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "GIVEUP", label: "Give up" },
];

const typedColumns = columnHelper.columns([
  columnHelper.display({
    id: "user",
    header: "User",
    cell: (info) => {
      const { name, email } = info.row.original.user;
      return (
        <div>
          <div className={styles.userName}>{name}</div>
          <div className={styles.userEmail}>{email}</div>
        </div>
      );
    },
  }),
  columnHelper.text("lesson.unit.course.name", {
    header: "Course",
  }),
  columnHelper.text("lesson.unit.name", {
    header: "Unit",
  }),
  columnHelper.text("lesson.name", {
    header: "Lesson",
  }),
  columnHelper.display({
    id: "result",
    header: "Result",
    cell: (info) => {
      const result = sessionResult(info.row.original);
      return (
        <span className={styles.resultSpan} style={{ color: submissionResultColor[result] }}>
          {result}
        </span>
      );
    },
  }),
  columnHelper.datetime("createdAt", { header: "Started At", sortable: false }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <ButtonLink
        size="xs"
        variant="secondary"
        to="/admin/submission/$id"
        params={{ id: info.row.original.id }}
      >
        View
      </ButtonLink>
    ),
  }),
]);

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <span className={styles.filterLabel}>{children}</span>;
}

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [pendingUserSearch, setPendingUserSearch] = React.useState(search.userSearch ?? "");

  const coursesQuery = useAdminCourseListQuery({ perPage: 100, direction: "forward" });
  const unitsQuery = useAdminUnitListQuery({
    perPage: 100,
    direction: "forward",
    courseID: search.courseID,
  });
  const lessonsQuery = useAdminLessonListQuery({
    page: 1,
    limit: 100,
    unitId: search.unitID,
  });

  const handleCourseChange = (courseID: string | null) => {
    const isAll = !courseID || courseID === "ALL";
    navigate({
      search: (prev) => ({
        ...prev,
        courseID: isAll ? undefined : courseID,
        unitID: undefined,
        lessonID: undefined,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const handleUnitChange = (unitID: string | null) => {
    const isAll = !unitID || unitID === "ALL";
    navigate({
      search: (prev) => ({
        ...prev,
        unitID: isAll ? undefined : unitID,
        lessonID: undefined,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const handleLessonChange = (lessonID: string | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        lessonID: !lessonID || lessonID === "ALL" ? undefined : lessonID,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const handleResultChange = (result: string | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        result: !result || result === "ALL" ? undefined : (result as ResultValue),
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const applyFilters = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        userSearch: pendingUserSearch.trim() || undefined,
        cursor: undefined,
        direction: "forward",
      }),
    });
  };

  const query = useAdminSessionListQuery({
    perPage: search.perPage,
    cursor: search.cursor,
    direction: search.direction,
    userSearch: search.userSearch,
    courseID: search.courseID,
    unitID: search.unitID,
    lessonID: search.lessonID,
    result: search.result,
  });

  const handleNextPage = () => {
    if (!query.data?.nextCursor) return;
    navigate({ search: (p) => ({ ...p, cursor: query.data?.nextCursor, direction: "forward" }) });
  };
  const handlePreviousPage = () => {
    if (!query.data?.prevCursor) return;
    navigate({ search: (p) => ({ ...p, cursor: query.data?.prevCursor, direction: "backward" }) });
  };
  const handlePageSizeChange = (newSize: number) => {
    navigate({
      search: (p) => ({ ...p, perPage: newSize, cursor: undefined, direction: "forward" }),
    });
  };

  return (
    <DataTable
      toolbarActions={
        <div className={styles.toolbarActions}>
          <div className={styles.toolbarColumn}>
            <FilterLabel>Course</FilterLabel>
            <SelectRoot
              value={search.courseID ?? "ALL"}
              onValueChange={handleCourseChange}
              size="sm"
              items={[
                { value: "ALL", label: "All Courses" },
                ...(coursesQuery.data?.data ?? []).map((c) => ({ value: c.id, label: c.name })),
              ]}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Courses</SelectItem>
                {coursesQuery.data?.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <div className={styles.toolbarColumn}>
            <FilterLabel>Unit</FilterLabel>
            <SelectRoot
              value={search.unitID ?? "ALL"}
              onValueChange={handleUnitChange}
              size="sm"
              items={[
                { value: "ALL", label: "All Units" },
                ...(unitsQuery.data?.data ?? []).map((u) => ({ value: u.id, label: u.name })),
              ]}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Units</SelectItem>
                {unitsQuery.data?.data?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <div className={styles.toolbarColumn}>
            <FilterLabel>Lesson</FilterLabel>
            <SelectRoot
              value={search.lessonID ?? "ALL"}
              onValueChange={handleLessonChange}
              size="sm"
              items={[
                { value: "ALL", label: "All Lessons" },
                ...(lessonsQuery.data?.items ?? []).map((l) => ({ value: l.id, label: l.name })),
              ]}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Lessons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Lessons</SelectItem>
                {lessonsQuery.data?.items?.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <div className={styles.toolbarColumn}>
            <FilterLabel>Result</FilterLabel>
            <SelectRoot
              value={search.result ?? "ALL"}
              onValueChange={handleResultChange}
              size="sm"
              items={resultOptions}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                {resultOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <div className={styles.toolbarColumn}>
            <FilterLabel>User</FilterLabel>
            <Input
              size="sm"
              placeholder="Name or email"
              value={pendingUserSearch}
              onChange={(event) => setPendingUserSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
            />
          </div>

          <Button size="sm" onClick={applyFilters}>
            Search
          </Button>
        </div>
      }
      columns={typedColumns}
      data={query.data?.data ?? []}
      isLoading={query.isLoading}
      cursorPagination={{
        hasNextPage: Boolean(query.data?.nextCursor),
        hasPreviousPage: Boolean(query.data?.prevCursor),
        onNextPage: handleNextPage,
        onPreviousPage: handlePreviousPage,
        pageSize: search.perPage,
        onPageSizeChange: handlePageSizeChange,
        pageSizeOptions: [10, 20, 50],
      }}
    />
  );
}
