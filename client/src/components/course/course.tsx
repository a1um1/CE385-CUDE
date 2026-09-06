import React from "react";
import { Book, Check } from "lucide-react";
import styles from "./course.module.css";

export type CourseStatus = "active" | "completed" | "locked";

export interface CourseProps {
  status?: CourseStatus;
  label?: string;
}

export const Course: React.FC<CourseProps> = ({ status = "completed", label = "Subject" }) => (
  <div className={`${styles.container} ${styles[status]}`}>
    <div className={styles.iconWrapper}>
      <svg className={styles.hexagonSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path 
          d="M11.4,25.3 L44.6,8.7 Q50,6 55.4,8.7 L88.6,25.3 Q94,28 94,34 L94,66 Q94,72 88.6,74.7 L55.4,91.3 Q50,94 44.6,91.3 L11.4,74.7 Q6,72 6,66 L6,34 Q6,28 11.4,25.3 Z" 
        />
      </svg>

      <div className={styles.innerIcon}>
        {status === "completed" ? (
          <Check size={40} strokeWidth={4} />
        ) : (
          <Book size={32} strokeWidth={2.5} />
        )}
      </div>
    </div>
    <span className={styles.label}>{label}</span>
  </div>
);