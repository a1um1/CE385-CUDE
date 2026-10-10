import Button from "#/components/button";
import { clsx } from "clsx";
import { PanelLeftIcon } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import styles from "./collapsibleSidebar.module.css";

interface CollapsibleSidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
}

const CollapsibleSidebarContext = createContext<CollapsibleSidebarContextValue | null>(null);

/** Read the sidebar collapse state. Must be used inside `<CollapsibleSidebar>`. */
export function useCollapsibleSidebar() {
  const context = useContext(CollapsibleSidebarContext);
  if (!context) {
    throw new Error("useCollapsibleSidebar must be used within <CollapsibleSidebar>");
  }
  return context;
}

interface CollapsibleSidebarProps {
  children: ReactNode;
  /** Controlled collapse state. Omit for uncontrolled. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

/** Icon-only collapsible sidebar shell. Compose with `CollapsibleSidebarLabel`, `CollapsibleSidebarToggle` and `CollapsibleSidebarFooter`. */
export function CollapsibleSidebar({
  children,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
}: CollapsibleSidebarProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
  const isCollapsed = collapsed ?? uncontrolled;

  const setCollapsed = useCallback(
    (value: boolean) => {
      if (collapsed === undefined) setUncontrolled(value);
      onCollapsedChange?.(value);
    },
    [collapsed, onCollapsedChange],
  );

  const contextValue = useMemo(
    () => ({ collapsed: isCollapsed, setCollapsed, toggle: () => setCollapsed(!isCollapsed) }),
    [isCollapsed, setCollapsed],
  );

  return (
    <CollapsibleSidebarContext.Provider value={contextValue}>
      <aside className={clsx(styles.sidebar, isCollapsed && styles.collapsed, className)}>
        {children}
      </aside>
    </CollapsibleSidebarContext.Provider>
  );
}

/** Renders its children only while the sidebar is expanded. */
export function CollapsibleSidebarLabel({ children }: { children: ReactNode }) {
  const { collapsed } = useCollapsibleSidebar();
  if (collapsed) return null;
  return children;
}

/** Bottom-pinned region that pushes itself below the rest of the sidebar. */
export function CollapsibleSidebarFooter({ children }: { children: ReactNode }) {
  return <div className={styles.footer}>{children}</div>;
}

interface CollapsibleSidebarToggleProps {
  /** Text shown when expanded; also used as the tooltip. */
  label?: string;
}

/** Button that flips the collapse state. */
export function CollapsibleSidebarToggle({
  label = "Toggle sidebar",
}: CollapsibleSidebarToggleProps) {
  const { toggle } = useCollapsibleSidebar();

  return (
    <Button variant="ghost" block align="start" onClick={toggle} title={label}>
      <PanelLeftIcon />
      <CollapsibleSidebarLabel>{label}</CollapsibleSidebarLabel>
    </Button>
  );
}
