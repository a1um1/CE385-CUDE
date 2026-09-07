import { type CodeLanguage } from "#/components/codeEditor/codeEditor.schema";
import { useEditorContext } from "#/components/codeEditor/subcomponent/editorContext";
import { PanelBottomIcon, PanelRightIcon, PlayIcon } from "lucide-react";
import styles from "../styles/toolbar.module.css";
import Button from "#/components/button";
import { useCodeAvailableLanguage } from "#/data/code.data";
import { useIsMutating } from "@tanstack/react-query";
import Spinner from "#/components/spinner";

import Select from "#/components/select";

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

  function handleLanguageChange(selectedLanguage: string) {
    onChangeLanguage?.(selectedLanguage as CodeLanguage);
    onChange("");
  }

  const currentLang = language ?? "c";
  const currentLanguageInfo = langaugeData?.languages?.[currentLang];
  const currentLanguageLabel = currentLanguageInfo
    ? `${currentLanguageInfo.name} ${currentLanguageInfo.version}`
    : currentLang;

  return (
    <div className={styles.toolbar}>
      <Select.Root
        value={currentLang}
        onValueChange={handleLanguageChange}
        disabled={disableLanguageSwitch || isLoading || isError}
        size="sm"
        radius="none"
      >
        <Select.Trigger className={styles.languageSelect} aria-label="Programming language">
          <Select.Value>{currentLanguageLabel}</Select.Value>
        </Select.Trigger>
        <Select.Content align="start" sideOffset={4}>
          {Object.entries(langaugeData?.languages || []).map(([lang, props]) => (
            <Select.Item key={lang} value={lang}>
              {props.name} {props.version}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
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
