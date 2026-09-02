import { useEffect, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import type { PanelLayout } from "../codeEditor.schema";
import { LS_LAYOUT_KEY } from "../codeEditor.schema";

function getInitialLayout(): PanelLayout {
  const stored = localStorage.getItem(LS_LAYOUT_KEY);
  return stored === "bottom" ? "bottom" : "side";
}

export function useEditorLayout() {
  const [panelLayout, setPanelLayout] = useState<PanelLayout>(getInitialLayout);

  const mainSideLayout = useDefaultLayout({ id: "codeEditor-main-side" });
  const mainBottomLayout = useDefaultLayout({ id: "codeEditor-main-bottom" });
  const ioSideLayout = useDefaultLayout({ id: "codeEditor-io-side" });
  const ioBottomLayout = useDefaultLayout({ id: "codeEditor-io-bottom" });

  const currentMainLayout = panelLayout === "side" ? mainSideLayout : mainBottomLayout;
  const currentIoLayout = panelLayout === "side" ? ioSideLayout : ioBottomLayout;

  const handleMainLayoutChange = currentMainLayout.onLayoutChanged;
  const handleIoLayoutChange = currentIoLayout.onLayoutChanged;

  useEffect(() => {
    localStorage.setItem(LS_LAYOUT_KEY, panelLayout);
  }, [panelLayout]);

  const toggleLayout = () => {
    setPanelLayout((prev) => (prev === "side" ? "bottom" : "side"));
  };

  return {
    panelLayout,
    toggleLayout,
    currentMainLayout,
    currentIoLayout,
    handleMainLayoutChange,
    handleIoLayoutChange,
  };
}
