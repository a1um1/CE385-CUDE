import { FaceSlightlyFrowning } from "lucide-react";
import Skeleton from "#/components/skeleton";
import { useCourses } from "#/data/course.data";
import { useHomeSelection } from "#/store/homeSelection";
import styles from "#/routes/(authed)/(base)/index.module.css";
import { CourseCard } from "#/components/courseCard";

export function CoursesSection() {
  const { setCourse } = useHomeSelection();
  const courses = useCourses();

  return (
    <>
      <h1 className={styles.heading}>คอร์สเรียน</h1>
      {courses.isLoading ? (
        <div className={styles["course-grid"]}>
          <Skeleton className={styles.skeletonLoader} />
          <Skeleton className={styles.skeletonLoader} />
        </div>
      ) : (
        <div className={styles["course-grid"]}>
          {courses.data?.data.map((item) => (
            <CourseCard
              key={item.id}
              name={item.name}
              color={item.color}
              icon={item.icon}
              shortDescription={item.shortDescription ?? ""}
              badge={item.badge ?? ""}
              onClick={() => setCourse(item.id)}
            />
          ))}
        </div>
      )}
      {(courses.data?.data ?? []).length === 0 && !courses.isLoading && (
        <div className={styles.emptyState}>
          <FaceSlightlyFrowning className={styles.frowningFace} />
          <p>No courses available.</p>
        </div>
      )}
    </>
  );
}

export default CoursesSection;
