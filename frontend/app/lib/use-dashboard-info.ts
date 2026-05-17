"use client";

import { useEffect, useRef, useState } from "react";

export type DashboardInfoPageTab = "analytics" | "aboutModel" | "aboutService";

export function useDashboardInfo() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoPageOpen, setInfoPageOpen] = useState(false);
  const [infoPageTab, setInfoPageTab] = useState<DashboardInfoPageTab>("analytics");
  const [infoTitle, setInfoTitle] = useState("");
  const [infoText, setInfoText] = useState("");
  const infoCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!infoOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setInfoOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timeoutId = window.setTimeout(() => infoCloseBtnRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(timeoutId);
      previouslyFocused?.focus?.();
    };
  }, [infoOpen]);

  return {
    infoOpen,
    setInfoOpen,
    infoPageOpen,
    setInfoPageOpen,
    infoPageTab,
    setInfoPageTab,
    infoTitle,
    setInfoTitle,
    infoText,
    setInfoText,
    infoCloseBtnRef,
  };
}
