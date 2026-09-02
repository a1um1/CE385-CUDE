import clsx from "clsx";
import styles from "./alert.module.css";
import { CheckIcon, InfoIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";

const alertVaraints = {
  default: {
    class: "",
    icon: InfoIcon,
  },
  success: {
    class: styles["success"],
    icon: CheckIcon,
  },
  error: {
    class: styles["error"],
    icon: XIcon,
  },
} as const;

interface AlertProps {
  children: ReactNode;
  variant?: keyof typeof alertVaraints;
}

export default function Alert(props: AlertProps) {
  const currentVaraint = (props.variant && alertVaraints[props.variant]) || alertVaraints.success;
  return (
    <div className={clsx(styles["alert"], currentVaraint.class)}>
      <currentVaraint.icon />
      {props.children}
    </div>
  );
}
