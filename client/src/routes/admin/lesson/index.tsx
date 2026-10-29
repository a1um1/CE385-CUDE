import * as React from "react";
import ButtonLink from "#/components/buttonLink";
import DataTable from "#/components/table";
import { createTableColumnHelper } from "#/components/table/features";
import { useAdminLessonListQuery } from "#/data/admin/lesson.data";
import { useAdminUnitListQuery } from "#/data/admin/unit.data";
import { useAdminCourseListQuery } from "#/data/admin/course.data";
import styles from "./lessonList.module.css";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "#/components/select";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import Input from "#/components/input";
import Button from "#/components/button";

const lessonPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  courseId: z.string().optional(),
  unitId: z.string().optional(),
  search: z.string().optional(),
});

export const Route = createFileRoute("/admin/lesson/")({
  validateSearch: (search) => lessonPaginationSchema.parse(search),
  component: RouteComponent,
  staticData: {
    pageTitle: "All Lessons",
    pageKey: "admin-lesson-list",
  },
});

type AdminLesson = NonNullable<ReturnType<typeof useAdminLessonListQuery>["data"]>["items"][number];

const columnHelper = createTableColumnHelper<AdminLesson>();

const buildColumns = (unitMap: Map<string, string>) =>
  columnHelper.columns([
    columnHelper.number("position", {
      header: "#",
      align: "center",
    }),
    columnHelper.text("name", {
      header: "Name",
      strong: true,
    }),
    columnHelper.display({
      id: "unit",
      header: "Unit",
      cell: (info) => (
        <span>{unitMap.get(info.row.original.unitID) ?? info.row.original.unitID}</span>
      ),
    }),
    columnHelper.number("passThreshold", {
      header: "Pass Threshold",
      align: "center",
      decimals: 2,
    }),
    columnHelper.number("XPgiven", {
      header: "XP",
      align: "center",
    }),
    columnHelper.number("gemsGiven", {
      header: "Gems",
      align: "center",
    }),
    columnHelper.display({
      id: "prerequisites",
      header: "Prerequisites",
      cell: (info) => {
        const count = info.row.original.prerequisiteLessonIDs?.length ?? 0;
        return <span>{count > 0 ? `${count} required` : "None"}</span>;
      },
    }),
    columnHelper.datetime("startAt", {
      header: "Start At",
    }),
    columnHelper.datetime("endAt", {
      header: "End At",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <ButtonLink
            size="xs"
            variant="secondary"
            to="/admin/exercise"
            search={{
              cursor: undefined,
              perPage: 20,
              direction: "forward",
              lessonID: info.row.original.id,
            }}
          >
            Exercises
          </ButtonLink>
          <ButtonLink
            size="xs"
            variant="secondary"
            to="/admin/lesson/$id"
            params={{ id: info.row.original.id }}
          >
            Edit
          </ButtonLink>
        </div>
      ),
    }),
  ]);

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [nameSearch, setNameSearch] = React.useState(search.search ?? "");

  const handleSearch = () => {
    const next = nameSearch.trim() || undefined;
    navigate({
      search: (prev) => ({ ...prev, search: next, page: 1 }),
    });
  };

  const coursesQuery = useAdminCourseListQuery({
    perPage: 100,
    direction: "forward",
  });

  const unitsQuery = useAdminUnitListQuery({
    perPage: 100,
    direction: "forward",
    courseID: search.courseId,
  });

  const unitMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const unit of unitsQuery.data?.data ?? []) {
      map.set(unit.id, unit.name);
    }
    return map;
  }, [unitsQuery.data?.data]);

  const courseFilterItems = React.useMemo(() => {
    const items = [{ value: "ALL", label: "All Courses" }];
    for (const course of coursesQuery.data?.data ?? []) {
      items.push({ value: course.id, label: course.name });
    }
    return items;
  }, [coursesQuery.data?.data]);

  const unitFilterItems = React.useMemo(() => {
    const items = [{ value: "ALL", label: "All Units" }];
    for (const unit of unitsQuery.data?.data ?? []) {
      items.push({ value: unit.id, label: unit.name });
    }
    return items;
  }, [unitsQuery.data?.data]);

  const typedColumns = React.useMemo(() => buildColumns(unitMap), [unitMap]);

  const handleCourseFilterChange = (courseId: string | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        courseId: courseId === "ALL" || !courseId ? undefined : courseId,
        unitId: undefined,
        page: 1,
      }),
    });
  };

  const handleUnitFilterChange = (unitId: string | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        unitId: unitId === "ALL" || !unitId ? undefined : unitId,
        page: 1,
      }),
    });
  };

  const query = useAdminLessonListQuery({
    page: search.page,
    limit: search.limit,
    unitId: search.unitId,
    search: search.search,
    include: ["unit", "unit.course"],
  });

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: newPage,
      }),
    });
  };

  const handlePageSizeChange = (newLimit: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        limit: newLimit,
        page: 1,
      }),
    });
  };

  const currentPage = query.data?.page ?? search.page;
  const totalPages = query.data?.totalPages ?? 1;

  return (
    <DataTable
      toolbarActions={
        <div className={styles.toolbarContainer}>
          <div className={styles.filtersGroup}>
            <div className={styles.filterField}>
              <span className={styles.filterLabel}>Search</span>
              <Input
                size="sm"
                placeholder="Search lessons"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>
            <div className={styles.filterField}>
              <span className={styles.filterLabel}>Course</span>
              <SelectRoot
                value={search.courseId ?? "ALL"}
                onValueChange={handleCourseFilterChange}
                size="sm"
                items={courseFilterItems}
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

            <div className={styles.filterField}>
              <span className={styles.filterLabel}>Unit</span>
              <SelectRoot
                value={search.unitId ?? "ALL"}
                onValueChange={handleUnitFilterChange}
                size="sm"
                items={unitFilterItems}
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
            <Button size="sm" onClick={handleSearch}>
              Search
            </Button>
          </div>

          <ButtonLink
            to="/admin/lesson/create"
            search={{ unitId: search.unitId }}
            variant="primary"
          >
            Create Lesson
          </ButtonLink>
        </div>
      }
      columns={typedColumns}
      data={query.data?.items ?? []}
      isLoading={query.isLoading}
      manualPagination
      pageCount={totalPages}
      pagination={{
        pageIndex: currentPage - 1,
        pageSize: search.limit,
      }}
      onPaginationChange={(updater) => {
        const nextState =
          typeof updater === "function"
            ? updater({
                pageIndex: currentPage - 1,
                pageSize: search.limit,
              })
            : updater;
        if (nextState.pageSize !== search.limit) {
          handlePageSizeChange(nextState.pageSize);
        } else if (nextState.pageIndex + 1 !== currentPage) {
          handlePageChange(nextState.pageIndex + 1);
        }
      }}
    />
  );
}
