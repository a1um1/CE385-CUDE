import Skeleton from "#/components/skeleton";
import styles from "./mainSkeleton.module.css";

export const MainSkeleton = () => (
  <div className={styles.mainContainer}>
    <Skeleton className={styles.skeletonHeader} />
    <Skeleton className={styles.skeletonContent} />
  </div>
);
