import Logo from "#/components/logo";
import ButtonLink from "#/components/buttonLink";
import {
  CollapsibleSidebar,
  CollapsibleSidebarLabel,
  CollapsibleSidebarSection,
  useCollapsibleSidebar,
} from "#/components/collapsibleSidebar";
import { Link, useMatches, type LinkProps } from "@tanstack/react-router";
import {
  BookOpenIcon,
  BookTextIcon,
  Code2Icon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import styles from "./sidebar.module.css";

interface NavItem {
  key: string;
  label: string;
  link: LinkProps;
  icon: LucideIcon;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "General",
    items: [
      {
        key: "admin-dashboard",
        label: "Dashboard",
        link: { to: "/admin" },
        icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    title: "Curriculum",
    items: [
      {
        key: "admin-course-list",
        label: "Courses",
        link: { to: "/admin/course" },
        icon: GraduationCapIcon,
      },
      {
        key: "admin-unit-list",
        label: "Units",
        link: { to: "/admin/unit" },
        icon: BookOpenIcon,
      },
      {
        key: "admin-lesson-list",
        label: "Lessons",
        link: { to: "/admin/lesson" },
        icon: BookTextIcon,
      },
      {
        key: "admin-exercise-list",
        label: "Exercises",
        link: { to: "/admin/exercise" },
        icon: Code2Icon,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        key: "admin-user-list",
        label: "Users",
        link: { to: "/admin/user" },
        icon: UsersIcon,
      },
    ],
  },
];

export default function Sidebar() {
  const matches = useMatches();
  const pageKey = matches[matches.length - 1]?.staticData?.pageKey;
  const { collapsed } = useCollapsibleSidebar();

  return (
    <CollapsibleSidebar className={styles.sidebar}>
      <div className={styles.header}>
        <Link to="/" className={styles.logoLink} title="CUDE Admin">
          {collapsed ? <span className={styles.collapsedLogo}>C</span> : <Logo type="admin" />}
        </Link>
      </div>

      <div className={styles.navContent}>
        {navSections.map((section, idx) => (
          <div key={section.title ?? idx} className={styles.sectionBlock}>
            {section.title && <CollapsibleSidebarSection title={section.title} />}
            {section.items.map((item) => (
              <ButtonLink
                key={item.key}
                to={item.link.to}
                block
                align={collapsed ? "center" : "start"}
                radius="square"
                title={item.label}
                variant={pageKey === item.key ? "secondary" : "ghost"}
              >
                <item.icon />
                <CollapsibleSidebarLabel>{item.label}</CollapsibleSidebarLabel>
              </ButtonLink>
            ))}
          </div>
        ))}
      </div>
    </CollapsibleSidebar>
  );
}
