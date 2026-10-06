import ButtonLink from "#/components/buttonLink";
import { usePendingLearnSessionQuery } from "#/data/learnSession.data";
import { Clock } from "lucide-react";

export const PendingSessionBanner = () => {
  const pendingSessionQuery = usePendingLearnSessionQuery();
  if (pendingSessionQuery.isLoading || !pendingSessionQuery.data) return null;
  if (!pendingSessionQuery.data) return null;

  return (
    <div
      className="bg-indigo-100 border-l-4 border-indigo-500 text-indigo-700 p-4 flex items-center justify-between"
      role="alert"
    >
      <p className="flex gap-2 items-center">
        <Clock />
        คุณกำลังมีเนื้อหาที่รอดำเนินการ
      </p>
      <ButtonLink to="/session/$id" params={{ id: pendingSessionQuery.data.id }} variant="primary">
        ดำเนินการต่อ
      </ButtonLink>
    </div>
  );
};
