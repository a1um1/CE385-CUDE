import ButtonLink from "#/components/buttonLink";
import { usePendingLearnSessionQuery } from "#/data/learnSession.data";
import { Clock } from "lucide-react";
import styles from "./pendingSessionBanner.module.css";

export const PendingSessionBanner = () => {
  const pendingSessionQuery = usePendingLearnSessionQuery();
  if (pendingSessionQuery.isLoading || !pendingSessionQuery.data) return null;
  if (!pendingSessionQuery.data) return null;

  return (
    <div className={styles.banner} role="alert">
      <p className={styles.message}>
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
