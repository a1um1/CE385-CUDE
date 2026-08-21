import clsx from "clsx";
import style from "./spinner.module.css";
import { Loader2 } from "lucide-react";

export interface SpinnerProps {
  size?: string;
  className?: string;
}

export default function Spinner({ size = "3rem", className }: SpinnerProps) {
  return <Loader2 className={clsx(style.spinner, className)} size={size} />;
}
