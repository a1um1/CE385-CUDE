import React from "react";
import { Book, Check, Lock, Play, X } from "lucide-react";
import styles from "./course.module.css";
import clsx from "clsx";

export type CourseStatus = "available" | "ongoing" | "passed" | "failed" | "unavailable";

export interface CourseProps {
  status?: CourseStatus;
  label?: string;
}

const statusConfig: Record<CourseStatus, { className?: string; icon: React.ReactElement }> = {
  available: {
    className: styles.available,
    icon: <Book size={32} strokeWidth={2.5} />,
  },
  ongoing: {
    className: styles.ongoing,
    icon: <Play size={34} strokeWidth={2.5} fill="currentColor" />,
  },
  passed: {
    className: styles.passed,
    icon: <Check size={40} strokeWidth={4} />,
  },
  failed: {
    className: styles.failed,
    icon: <X size={40} strokeWidth={4} />,
  },
  unavailable: {
    className: styles.unavailable,
    icon: <Lock size={30} strokeWidth={2.5} />,
  },
};

export const Course: React.FC<CourseProps> = ({ status = "available", label = "Subject" }) => {
  const { className, icon } = statusConfig[status];
  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.iconWrapper}>
        <svg className={styles.hexagonSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Regular pointy-top hexagon, circumradius 44. Same 6-unit rounding at all 6 corners: a
              quadratic stops short of its control, so the tip stays as soft as the side corners. */}
          <path d="M55.196,9 L82.909,25 Q88.105,28 88.105,34 L88.105,66 Q88.105,72 82.909,75 L55.196,91 Q50,94 44.804,91 L17.091,75 Q11.895,72 11.895,66 L11.895,34 Q11.895,28 17.091,25 L44.804,9 Q50,6 55.196,9 Z" />
        </svg>
        <div className={styles.innerIcon}>{icon}</div>
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default Course;
