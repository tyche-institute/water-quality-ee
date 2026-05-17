"use client";

import { useRef, useState } from "react";

export function useDashboardControllerFrameState() {
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const mapPanelRef = useRef<HTMLElement | null>(null);
  const desktopDetailRef = useRef<HTMLDivElement | null>(null);
  const chipBarRef = useRef<HTMLDivElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  return {
    isMapFullscreen,
    setIsMapFullscreen,
    mapPanelRef,
    desktopDetailRef,
    chipBarRef,
    langMenuRef,
  };
}
