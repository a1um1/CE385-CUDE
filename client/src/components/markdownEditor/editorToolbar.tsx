import styles from "./markdownEditor.module.css";
import {
  DEFAULT_TOOLBAR_ACTIONS,
  WindowToggleActions,
  type ToolbarActionConfig,
} from "./toolbarActions";

export interface EditorToolbarProps {
  actions?: ToolbarActionConfig[];
}

export function EditorToolbar({ actions = DEFAULT_TOOLBAR_ACTIONS }: EditorToolbarProps) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Markdown Editor Toolbar">
      <div className={styles["toolbar-group"]}>
        {actions.map((action) => {
          const ActionComponent = action.component;
          return <ActionComponent key={action.id} />;
        })}
      </div>

      <WindowToggleActions />
    </div>
  );
}

export default EditorToolbar;
