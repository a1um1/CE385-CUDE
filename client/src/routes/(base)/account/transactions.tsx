import Button from "#/components/button";
import { useTestSpendEnergy } from "#/data/test.data";
import { useUserTransactions } from "#/data/user.data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(base)/account/transactions")({
  component: RouteComponent,
  staticData: {
    pageKey: "transactions",
    pageTitle: "Transactions",
  },
});

function RouteComponent() {
  const { data, isLoading } = useUserTransactions({
    perPage: 20,
    direction: "forward",
    cursor: undefined,
  });
  const testSpend = useTestSpendEnergy();

  const handleSpendEnergy = async () => {
    testSpend.mutate();
  };

  if (isLoading) return <div>Loading transactions...</div>;
  return (
    <div>
      <Button onClick={handleSpendEnergy} disabled={testSpend.isPending}>
        Spend Energy
      </Button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
