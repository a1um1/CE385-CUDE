import clsx from "clsx";
import styles from "./alert.module.css";
import { CheckIcon, XIcon } from "lucide-react";

interface AlertProps {
  message: string;
  variant: "success" | "error" | undefined;
}

const icon_mapping = {
  success: CheckIcon,
  error: XIcon,
};

export default function Alert(props: AlertProps) {
  const MappedIcon = props.variant !== undefined && icon_mapping[props.variant];
  return (
    <div className={clsx(styles["alert"], props.variant !== undefined && styles[props.variant])}>
      {MappedIcon && <MappedIcon />}
      {props.message}
    </div>
  );
}
