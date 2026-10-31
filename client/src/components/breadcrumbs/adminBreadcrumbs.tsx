import { Link, useMatches } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import React from "react";
import styles from "./breadcrumbs.module.css";

const PATH_TITLES: Record<string, string> = {
  admin: "Admin",
  course: "Courses",
  unit: "Units",
  lesson: "Lessons",
  exercise: "Exercises",
  transaction: "Transactions",
  submission: "Lesson Sessions",
  user: "Users",
  create: "Create",
};

interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
}

export default function AdminBreadcrumbs() {
  const matches = useMatches();

  const items: BreadcrumbItem[] = [];

  for (const match of matches) {
    if (match.pathname.startsWith("/admin")) {
      const pageTitle = match.staticData?.pageTitle as string | undefined;

      if (match.pathname === "/admin") {
        items.push({
          id: match.pathname,
          label: pageTitle || "Admin",
          href: "/admin",
        });
      } else if (pageTitle) {
        items.push({
          id: match.pathname,
          label: pageTitle,
          href: match.pathname,
        });
      }
    }
  }

  // Fallback to URL segments if only root match exists
  if (items.length <= 1) {
    const lastMatch = matches[matches.length - 1];
    const pathname = lastMatch?.pathname || "/admin";
    const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);

    items.length = 0;
    let accumulatedPath = "";

    for (const segment of segments) {
      accumulatedPath += `/${segment}`;
      const isLast = accumulatedPath === pathname;
      const label =
        (isLast ? (lastMatch?.staticData?.pageTitle as string | undefined) : undefined) ||
        PATH_TITLES[segment] ||
        segment;

      items.push({
        id: accumulatedPath,
        label,
        href: isLast ? undefined : accumulatedPath,
      });
    }
  }

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.id}>
            {index > 0 && <ChevronRightIcon size="0.875rem" className={styles.separator} />}
            {isLast || !item.href ? (
              <span className={styles.current}>{item.label}</span>
            ) : (
              <Link to={item.href} className={styles.link}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
