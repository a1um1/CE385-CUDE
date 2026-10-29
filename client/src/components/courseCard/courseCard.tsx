import { Book } from "lucide-react";
import type { CSSProperties, ComponentType, SVGProps } from "react";
import CIcon from "#/components/codeEditor/icons/CIcon";
import PythonIcon from "#/components/codeEditor/icons/PythonIcon";
import styles from "#/routes/(authed)/(base)/index.module.css";
import type { availableLanguageKey } from "#/data/code.data";

const courseIcons: Partial<Record<availableLanguageKey, ComponentType<SVGProps<SVGSVGElement>>>> = {
  python: PythonIcon,
  c: CIcon,
};

export interface CourseCardProps {
  name: string;
  color: string;
  icon: availableLanguageKey;
  onClick?: () => void;
}

export function CourseCard({ name, color, icon, onClick }: CourseCardProps) {
  const Icon = courseIcons[icon] ?? Book;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ "--course-color": color } as CSSProperties}
      className={styles["course-card"]}
    >
      <Icon className={styles["course-icon"]} />
      <span className={styles["course-name"]}>{name}</span>
    </button>
  );
}

export default CourseCard;
