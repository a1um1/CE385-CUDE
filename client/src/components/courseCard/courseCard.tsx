import { Book } from "lucide-react";
import type { CSSProperties, ComponentType, SVGProps } from "react";
import CIcon from "#/components/codeEditor/icons/CIcon";
import PythonIcon from "#/components/codeEditor/icons/PythonIcon";
import styles from "#/components/courseCard/courseCard.module.css";
import type { availableLanguageKey } from "#/data/code.data";
import JavaScriptIcon from "#/components/codeEditor/icons/JavaScriptIcon";
import PostgresIcon from "#/components/codeEditor/icons/PostgresIcon";
import CSharpIcon from "#/components/codeEditor/icons/CSharpIcon";

export const courseIcons: Record<availableLanguageKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  python: PythonIcon,
  c: CIcon,
  csharp: CSharpIcon,
  javascript: JavaScriptIcon,
  sql: PostgresIcon,
};

export interface CourseCardProps {
  name: string;
  color: string;
  icon: availableLanguageKey;
  shortDescription: string;
  badge: string;
  onClick?: () => void;
}

export function CourseCard({
  name,
  color,
  icon,
  shortDescription,
  badge,
  onClick,
}: CourseCardProps) {
  const Icon = courseIcons[icon] ?? Book;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ "--course-color": color } as CSSProperties}
      className={styles["course-card"]}
    >
      <Icon className={styles["course-icon"]} />
      {badge && <span className={styles["course-badge"]}>{badge}</span>}
      <div className={styles["course-footer"]}>
        <span className={styles["course-name"]}>{name}</span>
        {shortDescription && (
          <span className={styles["course-description"]}>{shortDescription}</span>
        )}
      </div>
    </button>
  );
}

export default CourseCard;
