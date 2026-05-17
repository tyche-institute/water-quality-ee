"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function useDashboardMapMobileEnvironment({
  setIsMapFullscreen,
  setMobilePanelState,
  mobilePanelState,
}: {
  setIsMapFullscreen: (value: boolean) => void;
  setMobilePanelState: (value: "collapsed" | "half" | "full") => void;
  mobilePanelState: "collapsed" | "half" | "full";
}) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 900px)").matches;
  });
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window === "undefined" ? 800 : window.innerHeight
  );
  const mobileFullscreenInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 900px)");
    const apply = () => {
      const nextIsMobile = mq.matches;
      setIsMobile(nextIsMobile);
      if (nextIsMobile && !mobileFullscreenInitializedRef.current) {
        setIsMapFullscreen(true);
        setMobilePanelState("collapsed");
        mobileFullscreenInitializedRef.current = true;
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setIsMapFullscreen, setMobilePanelState]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setViewportHeight(window.innerHeight);
    onResize();
    window.addEventListener("resize", onResize);
    const vv = window.visualViewport;
    const onViewportChange = () => {
      if (!vv) return;
      const diff = window.innerHeight - (vv.height + vv.offsetTop);
      setKeyboardOffset(diff > 80 ? diff : 0);
    };
    onViewportChange();
    vv?.addEventListener("resize", onViewportChange);
    vv?.addEventListener("scroll", onViewportChange);
    return () => {
      window.removeEventListener("resize", onResize);
      vv?.removeEventListener("resize", onViewportChange);
      vv?.removeEventListener("scroll", onViewportChange);
    };
  }, []);

  const mobileBottomOverlayPx = useMemo(() => {
    if (!isMobile) return 0;
    const sheetOwnHeight = viewportHeight * 0.92;
    const sheetPx =
      mobilePanelState === "full"
        ? Math.max(0, Math.round(sheetOwnHeight - 96))
        : mobilePanelState === "half"
          ? Math.round(sheetOwnHeight * 0.54)
          : 66;
    return sheetPx + keyboardOffset;
  }, [isMobile, keyboardOffset, mobilePanelState, viewportHeight]);

  return {
    isMobile,
    mobileBottomOverlayPx,
  };
}
