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

/** Read the sidebar collapse state. Must be used inside `<CollapsibleSidebarProvider>`. */
export function useCollapsibleSidebar() {
  const context = useContext(CollapsibleSidebarContext);
  if (!context) {
    throw new Error("useCollapsibleSidebar must be used within <CollapsibleSidebarProvider>");
  }
  return context;
}

interface CollapsibleSidebarProviderProps {
  children: ReactNode;
  /** Controlled collapse state. Omit for uncontrolled. */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Owns the collapse state. Wrap the sidebar and anything that toggles it
 * (e.g. a header button) so they share one state.
 */
export function CollapsibleSidebarProvider({
  children,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
}: CollapsibleSidebarProviderProps) {
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
      {children}
    </CollapsibleSidebarContext.Provider>
  );
}

interface CollapsibleSidebarProps {
  children: ReactNode;
  className?: string;
}

/** Icon-only collapsible sidebar rail. Reads its state from `CollapsibleSidebarProvider`. */
export function CollapsibleSidebar({ children, className }: CollapsibleSidebarProps) {
  const { collapsed } = useCollapsibleSidebar();

  return (
    <aside className={clsx(styles.sidebar, collapsed && styles.collapsed, className)}>
      {children}
    </aside>
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
  /** Icon-only button, for use outside the rail (e.g. in a header). */
  iconOnly?: boolean;
}

/** Button that flips the collapse state. */
export function CollapsibleSidebarToggle({
  label = "Toggle sidebar",
  iconOnly = false,
}: CollapsibleSidebarToggleProps) {
  const { toggle } = useCollapsibleSidebar();

  if (iconOnly) {
    return (
      <Button variant="ghost" icon onClick={toggle} title={label}>
        <PanelLeftIcon />
      </Button>
    );
  }

  return (
    <Button variant="ghost" block align="start" onClick={toggle} title={label}>
      <PanelLeftIcon />
      <CollapsibleSidebarLabel>{label}</CollapsibleSidebarLabel>
    </Button>
  );
}
