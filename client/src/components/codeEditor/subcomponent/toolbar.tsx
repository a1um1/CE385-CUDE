import { type CodeLanguage } from "#/components/codeEditor/codeEditor.schema";
import { useEditorContext } from "#/components/codeEditor/subcomponent/editorContext";
import { PanelBottomIcon, PanelRightIcon, PlayIcon, Code } from "lucide-react";
import PythonIcon from "#/components/codeEditor/icons/PythonIcon";
import CIcon from "#/components/codeEditor/icons/CIcon";
import styles from "../styles/toolbar.module.css";
import Button from "#/components/button";
import { useCodeAvailableLanguage } from "#/data/code.data";
import { useIsMutating } from "@tanstack/react-query";
import Spinner from "#/components/spinner";

import Select from "#/components/select";

export default function EditorToolbar() {
  const { data: langaugeData, isLoading, isError } = useCodeAvailableLanguage();
  const isMutating = useIsMutating({ mutationKey: ["run_exercise"] });

  const isMutatingOrLoading = isLoading || isMutating;
  const {
    language,
    onChangeLanguage,
    onChange,
    disableLanguageSwitch,
    runCode,
    layout: { panelLayout, toggleLayout },
  } = useEditorContext();

  function handleLanguageChange(selectedLanguage: string | null) {
    if (selectedLanguage === null) return;
    onChangeLanguage?.(selectedLanguage as CodeLanguage);
    onChange("");
  }

  const currentLang = language ?? "c";
  const currentLanguageInfo = langaugeData?.languages?.[currentLang];
  const currentLanguageLabel = currentLanguageInfo
    ? `${currentLanguageInfo.name} ${currentLanguageInfo.version}`
    : currentLang;

  const hasDisable = disableLanguageSwitch ?? false;

  function renderLanguageIcon(lang: string = currentLang) {
    switch (lang) {
      case "python": {
        return <PythonIcon className={styles.languageIcon} />;
      }
      case "c":
      case "cpp": {
        return <CIcon className={styles.languageIcon} />;
      }
      default: {
        return <Code className={styles.languageIcon} size={16} />;
      }
    }
  }

  return (
    <div className={styles.toolbar}>
      {hasDisable ? (
        <div className={styles.languageDisplay}>
          {renderLanguageIcon(currentLang)}
          <span>{currentLanguageLabel}</span>
        </div>
      ) : (
        <Select.Root
          value={currentLang}
          onValueChange={handleLanguageChange}
          disabled={isLoading || isError}
          size="sm"
          radius="none"
        >
          <Select.Trigger className={styles.languageSelect} aria-label="Programming language">
            <span className={styles.languageTriggerContent}>
              {renderLanguageIcon(currentLang)}
              <Select.Value>{currentLanguageLabel}</Select.Value>
            </span>
          </Select.Trigger>
          <Select.Content align="start" sideOffset={4}>
            {Object.entries(langaugeData?.languages || []).map(([lang, props]) => (
              <Select.Item key={lang} value={lang}>
                <span className={styles.languageOption}>
                  {renderLanguageIcon(lang)}
                  <span>
                    {props.name} {props.version}
                  </span>
                </span>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
      <div className={styles.toolbarActions}>
        <Button
          onClick={toggleLayout}
          size="sm"
          variant="secondary"
          title={panelLayout === "side" ? "Switch to bottom panel" : "Switch to side panel"}
          radius="square"
          icon
        >
          {panelLayout === "side" ? <PanelBottomIcon /> : <PanelRightIcon />}
        </Button>
        {runCode && (
          <Button
            onClick={runCode}
            size="sm"
            title="Run (Shift+Enter)"
            radius="square"
            disabled={isLoading || Boolean(isMutating)}
          >
            {isMutatingOrLoading ? (
              <>
                <Spinner />
                Proccessing
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
