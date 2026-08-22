import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  DataTable,
  createTableColumnHelper,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./index";
import Button from "../button";
import type { PaginationState, SortingState } from "@tanstack/react-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member" | "Viewer";
  status: "Active" | "Pending" | "Inactive";
  balance: number;
  isVerified: boolean;
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    balance: 5400.5,
    isVerified: true,
    createdAt: "2024-01-15T09:30:00Z",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Member",
    status: "Active",
    balance: 1250,
    isVerified: false,
    createdAt: "2024-02-10T14:15:00Z",
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Viewer",
    status: "Pending",
    balance: 0,
    isVerified: true,
    createdAt: "2024-03-05T11:00:00Z",
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "Admin",
    status: "Active",
    balance: 18_900.25,
    isVerified: true,
    createdAt: "2024-03-12T08:45:00Z",
  },
  {
    id: "5",
    name: "Evan Wright",
    email: "evan@example.com",
    role: "Member",
    status: "Inactive",
    balance: 320,
    isVerified: false,
    createdAt: "2024-04-01T16:20:00Z",
  },
  {
    id: "6",
    name: "Fiona Gallagher",
    email: "fiona@example.com",
    role: "Member",
    status: "Active",
    balance: 4100.75,
    isVerified: true,
    createdAt: "2024-04-18T10:10:00Z",
  },
  {
    id: "7",
    name: "George Clark",
    email: "george@example.com",
    role: "Viewer",
    status: "Inactive",
    balance: 50,
    isVerified: false,
    createdAt: "2024-05-09T13:50:00Z",
  },
  {
    id: "8",
    name: "Hannah Abbott",
    email: "hannah@example.com",
    role: "Member",
    status: "Active",
    balance: 780,
    isVerified: true,
    createdAt: "2024-05-22T17:05:00Z",
  },
  {
    id: "9",
    name: "Ian Malcolm",
    email: "ian@example.com",
    role: "Admin",
    status: "Pending",
    balance: 9300,
    isVerified: false,
    createdAt: "2024-06-11T12:00:00Z",
  },
  {
    id: "10",
    name: "Julia Roberts",
    email: "julia@example.com",
    role: "Viewer",
    status: "Active",
    balance: 2150.8,
    isVerified: true,
    createdAt: "2024-06-30T15:40:00Z",
  },
  {
    id: "11",
    name: "Kevin Bacon",
    email: "kevin@example.com",
    role: "Member",
    status: "Active",
    balance: 6400,
    isVerified: true,
    createdAt: "2024-07-04T09:15:00Z",
  },
  {
    id: "12",
    name: "Laura Croft",
    email: "laura@example.com",
    role: "Admin",
    status: "Active",
    balance: 14_200,
    isVerified: true,
    createdAt: "2024-07-19T18:25:00Z",
  },
];

const columnHelper = createTableColumnHelper<User>();

const typedColumns = columnHelper.columns([
  columnHelper.text("name", {
    header: "Name",
    strong: true,
  }),
  columnHelper.text("email", {
    header: "Email",
  }),
  columnHelper.badge("role", {
    header: "Role",
    defaultColor: "#6B7280",
  }),
  columnHelper.badge("status", {
    header: "Status",
    map: {
      Active: { color: "#10B981" },
      Pending: { color: "#8B5CF6" },
      Inactive: { color: "#EF4444" },
    },
  }),
  columnHelper.currency("balance", {
    header: "Balance",
    currency: "USD",
  }),
  columnHelper.boolean("isVerified", {
    header: "Verified",
  }),
  columnHelper.datetime("createdAt", {
    header: "Created At",
  }),
]);

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockUsers,
    columns: typedColumns as any,
    searchable: true,
    searchPlaceholder: "Search users...",
    pageSizeOptions: [5, 10, 20],
    defaultPagination: { pageIndex: 0, pageSize: 5 },
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns: typedColumns as any,
    isLoading: true,
    loadingRowCount: 5,
    searchable: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: typedColumns as any,
    emptyText: "No users found. Try adjusting your filters.",
    searchable: true,
  },
};

export const CursorPaginationStory: Story = {
  name: "Cursor-Based Pagination",
  args: {
    data: [],
    columns: typedColumns as any,
  },
  render: () => {
    const [pageSize, setPageSize] = React.useState(3);
    const [cursor, setCursor] = React.useState<string | undefined>(undefined);
    const [direction, setDirection] = React.useState<"forward" | "backward">("forward");
    const [isLoading, setIsLoading] = React.useState(false);

    // Simulate backend query with cursor and direction
    const { items, nextCursor, prevCursor } = React.useMemo(() => {
      if (direction === "backward" && cursor) {
        const cursorIdx = mockUsers.findIndex((u) => u.id === cursor);
        const end = cursorIdx !== -1 ? cursorIdx : mockUsers.length;
        const start = Math.max(0, end - pageSize);
        const slice = mockUsers.slice(start, end);
        return {
          items: slice,
          nextCursor: cursor,
          prevCursor: start > 0 ? slice[0]?.id : undefined,
        };
      }

      // Forward direction
      const start = cursor ? mockUsers.findIndex((u) => u.id === cursor) + 1 : 0;
      const slice = mockUsers.slice(start, start + pageSize);
      const hasNext = start + pageSize < mockUsers.length;
      return {
        items: slice,
        nextCursor: hasNext ? slice[slice.length - 1]?.id : undefined,
        prevCursor: cursor || undefined,
      };
    }, [cursor, direction, pageSize]);

    const handleNext = () => {
      if (!nextCursor) return;
      setIsLoading(true);
      setTimeout(() => {
        setCursor(nextCursor);
        setDirection("forward");
        setIsLoading(false);
      }, 250);
    };

    const handlePrev = () => {
      if (!prevCursor) return;
      setIsLoading(true);
      setTimeout(() => {
        setCursor(prevCursor);
        setDirection("backward");
        setIsLoading(false);
      }, 250);
    };

    return (
      <DataTable
        data={items}
        columns={typedColumns as any}
        isLoading={isLoading}
        cursorPagination={{
          hasNextPage: Boolean(nextCursor),
          hasPreviousPage: Boolean(prevCursor),
          onNextPage: handleNext,
          onPreviousPage: handlePrev,
          pageSize,
          onPageSizeChange: (newSize) => {
            setCursor(undefined);
            setDirection("forward");
            setPageSize(newSize);
          },
          pageSizeOptions: [3, 5, 10],
        }}
      />
    );
  },
};

export const WithRowActions: Story = {
  args: {
    data: mockUsers,
    columns: typedColumns as any,
  },
  render: () => {
    const actionColumns = columnHelper.columns([
      ...typedColumns,
      columnHelper.display({
        id: "actions",
        header: () => <div style={{ textAlign: "right" }}>Actions</div>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <Button
                size="xs"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Edit user: ${user.name}`);
                }}
              >
                Edit
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Delete user: ${user.name}`);
                }}
              >
                Delete
              </Button>
            </div>
          );
        },
      }),
    ]);

    return (
      <DataTable
        data={mockUsers}
        columns={actionColumns as any}
        searchable
        searchPlaceholder="Filter users..."
        toolbarActions={
          <Button size="sm" variant="primary" onClick={() => alert("Add User clicked")}>
            + Add User
          </Button>
        }
        onRowClick={(row) => alert(`Clicked row for: ${row.original.name}`)}
      />
    );
  },
};

export const ManualServerSide: Story = {
  args: {
    data: [],
    columns: typedColumns as any,
  },
  render: () => {
    const [pagination, setPagination] = React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 4,
    });
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    // Simulate backend query slice
    const totalCount = mockUsers.length;
    const startIndex = pagination.pageIndex * pagination.pageSize;
    const pagedData = React.useMemo(() => {
      const sorted = [...mockUsers];
      if (sorting.length > 0) {
        const [sort] = sorting;
        if (sort) {
          sorted.sort((a, b) => {
            const aVal = (a as unknown as Record<string, unknown>)[sort.id];
            const bVal = (b as unknown as Record<string, unknown>)[sort.id];
            if ((aVal ?? "") < (bVal ?? "")) return sort.desc ? 1 : -1;
            if ((aVal ?? "") > (bVal ?? "")) return sort.desc ? -1 : 1;
            return 0;
          });
        }
      }
      return sorted.slice(startIndex, startIndex + pagination.pageSize);
    }, [pagination, sorting, startIndex]);

    const handlePaginationChange = (updater: any) => {
      setIsLoading(true);
      setTimeout(() => {
        setPagination(updater);
        setIsLoading(false);
      }, 300);
    };

    const handleSortingChange = (updater: any) => {
      setIsLoading(true);
      setTimeout(() => {
        setSorting(updater);
        setIsLoading(false);
      }, 300);
    };

    return (
      <DataTable
        data={pagedData}
        columns={typedColumns as any}
        isLoading={isLoading}
        manualPagination
        manualSorting
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        pageCount={Math.ceil(totalCount / pagination.pageSize)}
        rowCount={totalCount}
        pageSizeOptions={[2, 4, 8]}
      />
    );
  },
};

export const PrimitivesOnly: Story = {
  args: {
    data: [],
    columns: [],
  },
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead style={{ textAlign: "right" }}>Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell style={{ fontWeight: 600 }}>CE385-CUDE</TableCell>
          <TableCell>Active</TableCell>
          <TableCell style={{ textAlign: "right" }}>$12,000</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ fontWeight: 600 }}>Design System</TableCell>
          <TableCell>Completed</TableCell>
          <TableCell style={{ textAlign: "right" }}>$8,500</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
