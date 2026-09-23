import Button from "#/components/button";
import Energy from "#/components/icon/energy";
import Gem from "#/components/icon/gem";
import DataTable, { createTableColumnHelper } from "#/components/table";
import { useTestSpendEnergy } from "#/data/test.data";
import { useUserTransactions } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(base)/account/transactions")({
  component: RouteComponent,
  staticData: {
    pageKey: "transactions",
    pageTitle: "Transactions",
  },
});

type AdminUser = NonNullable<ReturnType<typeof useUserTransactions>["data"]>["data"][number];
type currencyType = AdminUser["type"];

const columnHelper = createTableColumnHelper<AdminUser>();

const currencyIcons: Record<currencyType, React.FC> = {
  ENERGY: Energy,
  GEM: Gem,
  XP: () => <span>XP</span>,
};

const typedColumns = columnHelper.columns([
  columnHelper.text("reason", {
    header: "Transaction",
    strong: true,
    sortable: false,
  }),
  columnHelper.display({
    id: "amount",
    header: "Amount",
    cell: (info) => {
      const { type, amount } = info.row.original;
      const CurrencyIcon = currencyIcons[type];
      const isPositive = amount > 0;
      const formattedAmount = Math.abs(amount).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return (
        <span className="flex gap-0.5">
          {isPositive ? "+" : "-"}
          {formattedAmount}
          <CurrencyIcon />
        </span>
      );
    },
  }),
  columnHelper.datetime("createdAt", {
    header: "Created At",
    sortable: false,
  }),
]);

function RouteComponent() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [perPage, setPerPage] = useState<number>(20);
  const { data, isLoading } = useUserTransactions({
    perPage,
    direction,
    cursor,
  });
  const testSpend = useTestSpendEnergy();

  const handleSpendEnergy = async () => {
    testSpend.mutate();
  };

  const handleNextPage = () => {
    if (!data?.nextCursor) return;
    setDirection("forward");
    setCursor(data?.nextCursor);
  };

  const handlePreviousPage = () => {
    if (!data?.prevCursor) return;
    setDirection("backward");
    setCursor(data?.prevCursor);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPerPage(newPageSize);
    setCursor(undefined); // Reset cursor when changing page size
    setDirection("forward"); // Reset direction to forward when changing page size
  };

  if (isLoading) return <div>Loading transactions...</div>;
  return (
    <>
      <Button onClick={handleSpendEnergy} disabled={testSpend.isPending}>
        Spend Energy
      </Button>
      <DataTable
        columns={typedColumns}
        data={data?.data ?? []}
        isLoading={isLoading}
        cursorPagination={{
          hasNextPage: Boolean(data?.nextCursor),
          hasPreviousPage: Boolean(data?.prevCursor),
          onNextPage: handleNextPage,
          pageSize: perPage,
          onPageSizeChange: handlePageSizeChange,
          onPreviousPage: handlePreviousPage,
          pageSizeOptions: [10, 20, 50],
        }}
      />
    </>
  );
}
