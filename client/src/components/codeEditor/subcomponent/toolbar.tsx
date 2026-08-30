import { LANGUAGE_OPTIONS, type CodeLanguage } from "#/components/codeEditor/codeEditor.schema";
import { useEditorContext } from "#/components/codeEditor/subcomponent/editorContext";
import { PanelBottomIcon, PanelRightIcon, PlayIcon } from "lucide-react";
import styles from "../styles/toolbar.module.css";
import Button from "#/components/button";

export default function EditorToolbar() {
  const {
    language,
    onChangeLanguage,
    onChange,
    disableLanguageSwitch,
    runCode,
    layout: { panelLayout, toggleLayout },
  } = useEditorContext();

  function handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedLanguage = event.target.value as CodeLanguage;
    onChangeLanguage?.(selectedLanguage);
    onChange("");
  }

  return (
    <div className={styles.toolbar}>
      <select
        className={styles.languageSelect}
        value={language ?? "c"}
        onChange={handleLanguageChange}
        aria-label="Programming language"
        disabled={disableLanguageSwitch}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className={styles.toolbarActions}>
        <Button
          onClick={toggleLayout}
          size="xs"
          variant="secondary"
          title={panelLayout === "side" ? "Switch to bottom panel" : "Switch to side panel"}
          style={{ height: "21px", width: "21px", padding: 0, minWidth: "24px" }}
        >
          {panelLayout === "side" ? <PanelBottomIcon size={14} /> : <PanelRightIcon size={14} />}
        </Button>
        {runCode && (
          <Button onClick={runCode} size="xs" title="Run (Shift+Enter)">
            <PlayIcon fill="currentColor" />
            Run
          </Button>
        )}
      </div>
    </div>
  );
}
