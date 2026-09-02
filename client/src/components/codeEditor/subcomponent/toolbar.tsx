import { type CodeLanguage } from "#/components/codeEditor/codeEditor.schema";
import { useEditorContext } from "#/components/codeEditor/subcomponent/editorContext";
import { PanelBottomIcon, PanelRightIcon, PlayIcon } from "lucide-react";
import styles from "../styles/toolbar.module.css";
import Button from "#/components/button";
import { useCodeAvailableLanguage } from "#/data/code.data";
import { useIsMutating } from "@tanstack/react-query";
import Spinner from "#/components/spinner";

export default function EditorToolbar() {
  const { data: langaugeData, isLoading, isError } = useCodeAvailableLanguage();
  const isMutating = useIsMutating();

  const isMutatingOrLoading = isLoading || isMutating;
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
        disabled={disableLanguageSwitch || isLoading || isError}
      >
        {Object.entries(langaugeData?.languages || []).map(([lang, props]) => (
          <option key={lang} value={lang}>
            {props.name} {props.version}
          </option>
        ))}
      </select>
      <div className={styles.toolbarActions}>
        <Button
          onClick={toggleLayout}
          size="sm"
          variant="secondary"
          title={panelLayout === "side" ? "Switch to bottom panel" : "Switch to side panel"}
          radius="square"
        >
          {panelLayout === "side" ? <PanelBottomIcon /> : <PanelRightIcon />}
        </Button>
        {runCode && (
          <Button
            onClick={runCode}
            size="sm"
            title="Run (Shift+Enter)"
            radius="square"
            disabled={isLoading}
          >
            {isMutatingOrLoading ? (
              <>
                <Spinner />
                Procsessing
              </>
            ) : (
              <>
                <PlayIcon fill="currentColor" />
                Run
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
