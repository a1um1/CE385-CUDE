import clsx from "clsx";
import styles from "./alert.module.css";
import { CheckIcon, XIcon } from "lucide-react";

const alertVaraints = {
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
  message: string;
  variant?: keyof typeof alertVaraints;
}

export default function Alert(props: AlertProps) {
  const currentVaraint = (props.variant && alertVaraints[props.variant]) || alertVaraints.success;
  return (
    <div className={clsx(styles["alert"], currentVaraint.class)}>
      <currentVaraint.icon />
      {props.message}
    </div>
  );
}
