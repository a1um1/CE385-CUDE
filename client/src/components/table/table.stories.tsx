import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  DataTable,
  DataTableColumnHeader,
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
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Member",
    status: "Active",
    createdAt: "2024-02-10",
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Viewer",
    status: "Pending",
    createdAt: "2024-03-05",
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2024-03-12",
  },
  {
    id: "5",
    name: "Evan Wright",
    email: "evan@example.com",
    role: "Member",
    status: "Inactive",
    createdAt: "2024-04-01",
  },
  {
    id: "6",
    name: "Fiona Gallagher",
    email: "fiona@example.com",
    role: "Member",
    status: "Active",
    createdAt: "2024-04-18",
  },
  {
    id: "7",
    name: "George Clark",
    email: "george@example.com",
    role: "Viewer",
    status: "Inactive",
    createdAt: "2024-05-09",
  },
  {
    id: "8",
    name: "Hannah Abbott",
    email: "hannah@example.com",
    role: "Member",
    status: "Active",
    createdAt: "2024-05-22",
  },
  {
    id: "9",
    name: "Ian Malcolm",
    email: "ian@example.com",
    role: "Admin",
    status: "Pending",
    createdAt: "2024-06-11",
  },
  {
    id: "10",
    name: "Julia Roberts",
    email: "julia@example.com",
    role: "Viewer",
    status: "Active",
    createdAt: "2024-06-30",
  },
  {
    id: "11",
    name: "Kevin Bacon",
    email: "kevin@example.com",
    role: "Member",
    status: "Active",
    createdAt: "2024-07-04",
  },
  {
    id: "12",
    name: "Laura Croft",
    email: "laura@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2024-07-19",
  },
];

const columnHelper = createTableColumnHelper<User>();

const defaultColumns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: (info) => <span style={{ fontWeight: 600 }}>{info.getValue()}</span>,
  }),
  columnHelper.accessor("email", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("role", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: (info) => {
      const status = info.getValue();
      const color =
        status === "Active"
          ? "var(--color-energy)"
          : status === "Pending"
            ? "var(--color-gem)"
            : "var(--color-danger)";
      return (
        <span
          style={{
            padding: "0.2rem 0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.75rem",
            backgroundColor: `color-mix(in oklch, ${color} 20%, transparent)`,
            color,
            border: `1px solid ${color}`,
          }}
        >
          {status}
        </span>
      );
    },
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: (info) => info.getValue(),
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
    columns: defaultColumns as any,
    searchable: true,
    searchPlaceholder: "Search users...",
    pageSizeOptions: [5, 10, 20],
    defaultPagination: { pageIndex: 0, pageSize: 5 },
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns: defaultColumns as any,
    isLoading: true,
    loadingRowCount: 5,
    searchable: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: defaultColumns as any,
    emptyText: "No users found. Try adjusting your filters.",
    searchable: true,
  },
};

export const WithRowActions: Story = {
  args: {
    data: mockUsers,
    columns: defaultColumns as any,
  },
  render: () => {
    const actionColumns = columnHelper.columns([
      ...defaultColumns,
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
    columns: defaultColumns as any,
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
        columns={defaultColumns as any}
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
