import ButtonLink from "#/components/buttonLink";
import { usePendingLearnSessionQuery } from "#/data/learnSession.data";
import { Clock } from "lucide-react";

export const PendingSessionBanner = () => {
  const pendingSessionQuery = usePendingLearnSessionQuery();
  if (pendingSessionQuery.isLoading || !pendingSessionQuery.data) return null;
  if (!pendingSessionQuery.data) return null;

  return (
    <div
      className="bg-indigo-500/10 rounded-full border border-indigo-500 text-indigo-500 p-3 flex items-center justify-between gap-4"
      role="alert"
    >
      <p className="flex gap-2 items-center">
        <Clock />
        คุณกำลังมีเนื้อหาที่รอดำเนินการ
      </p>
      <ButtonLink
        to="/session/$id"
        params={{ id: pendingSessionQuery.data.id }}
        variant="primary"
        radius="pilled"
        size="sm"
      >
        ดำเนินการต่อ
      </ButtonLink>
    </div>
  );
};
