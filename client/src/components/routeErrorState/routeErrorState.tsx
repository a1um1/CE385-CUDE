import { AlertTriangle, RotateCcw } from "lucide-react";
import Button from "#/components/button";
import ButtonLink from "#/components/buttonLink";
import type { ErrorComponentProps } from "@tanstack/react-router";
import styles from "./routeErrorState.module.css";

const FALLBACK_MESSAGE = "An unexpected error occurred while loading this page.";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error as { message?: unknown };
    if (typeof message === "string" && message) return message;
  }

  if (typeof error === "string" && error) return error;

  return FALLBACK_MESSAGE;
};

export interface RouteErrorStateProps extends Partial<ErrorComponentProps> {
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
}

export default function RouteErrorState({
  error,
  reset,
  title = "Something went wrong",
  message,
  backTo = "/",
  backLabel = "Go to Home",
}: RouteErrorStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles["icon-wrapper"]}>
        <AlertTriangle size={36} />
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message ?? getErrorMessage(error)}</p>
      <div className={styles.actions}>
        {reset && (
          <Button variant="primary" onClick={() => reset()}>
            <RotateCcw size={16} />
            Try Again
          </Button>
        )}
        <ButtonLink to={backTo} variant="secondary">
          {backLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
