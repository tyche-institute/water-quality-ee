"use client";

import { useCallback } from "react";

export function useDashboardInfoPageActions({
  setInfoPageOpen,
  setInfoPageTab,
}: {
  setInfoPageOpen: (value: boolean) => void;
  setInfoPageTab: (value: "analytics" | "aboutModel" | "aboutService") => void;
}) {
  const openAboutModel = useCallback(() => {
    setInfoPageOpen(true);
    setInfoPageTab("aboutModel");
  }, [setInfoPageOpen, setInfoPageTab]);

  const openAboutService = useCallback(() => {
    setInfoPageOpen(true);
    setInfoPageTab("aboutService");
  }, [setInfoPageOpen, setInfoPageTab]);

  return {
    openAboutModel,
    openAboutService,
  };
}
