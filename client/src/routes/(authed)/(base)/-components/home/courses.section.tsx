import { Book, FaceSlightlyFrowning } from "lucide-react";
import type { ComponentType, CSSProperties, SVGProps } from "react";
import CIcon from "#/components/codeEditor/icons/CIcon";
import PythonIcon from "#/components/codeEditor/icons/PythonIcon";
import Skeleton from "#/components/skeleton";
import { useCourses } from "#/data/course.data";
import { useHomeSelection } from "#/store/homeSelection";
import styles from "#/routes/(authed)/(base)/index.module.css";
import type { availableLanguageKey } from "#/data/code.data";

const courseIcons: Record<availableLanguageKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  python: PythonIcon,
  c: CIcon,
};

export function CoursesSection() {
  const { setCourse } = useHomeSelection();
  const courses = useCourses();

  return (
    <>
      <h1 className="text-3xl font-bold">คอร์สเรียน</h1>
      {courses.isLoading ? (
        <div className={styles["course-grid"]}>
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className={styles["course-grid"]}>
          {courses.data?.data.map((item) => {
            const Icon = courseIcons[item.icon] ?? Book;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCourse(item.id)}
                style={{ "--course-color": item.color } as CSSProperties}
                className={styles["course-card"]}
              >
                <Icon className={styles["course-icon"]} />
                <span className={styles["course-name"]}>{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
      {(courses.data?.data ?? []).length === 0 && !courses.isLoading && (
        <div className="flex flex-col items-center justify-center gap-2">
          <FaceSlightlyFrowning className="size-24" />
          <p>No courses available.</p>
        </div>
      )}
    </>
  );
}

export default CoursesSection;
