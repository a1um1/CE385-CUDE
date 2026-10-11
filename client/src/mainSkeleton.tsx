import Skeleton from "#/components/skeleton";

export const MainSkeleton = () => (
  <div className="container p-4 flex flex-col gap-6 min-h-dvh">
    <Skeleton className="min-h-20" />
    <Skeleton className="flex-1" />
  </div>
);
