"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardMobilePanelState, DashboardMobileSheetMode } from "./dashboard-types";

export function useDashboardMobileSheet({
  selectedPlaceId,
  clusterPlacesCount,
}: {
  selectedPlaceId: string | null;
  clusterPlacesCount: number;
}) {
  const [mobilePanelState, setMobilePanelState] = useState<DashboardMobilePanelState>("collapsed");
  const [sheetMode, setSheetMode] = useState<DashboardMobileSheetMode>("place");
  const lastAutoOpenedPlaceId = useRef<string | null>(null);
  const sheetDragStartY = useRef<number | null>(null);
  const sheetDragLastY = useRef<number | null>(null);
  const sheetDragLastTs = useRef<number | null>(null);
  const sheetDragVelocity = useRef(0);
  const suppressNextHandleClick = useRef(false);
  const [sheetDragOffset, setSheetDragOffset] = useState(0);
  const [sheetDragging, setSheetDragging] = useState(false);

  const cycleMobilePanelState = useCallback(() => {
    setMobilePanelState((prev) => {
      if (prev === "collapsed") {
        if (sheetMode === "filter" || selectedPlaceId) return "half";
        setSheetMode("filter");
        return "half";
      }
      return prev === "half" ? "full" : "collapsed";
    });
  }, [selectedPlaceId, sheetMode]);

  useEffect(() => {
    if (mobilePanelState !== "collapsed" && sheetMode === "place" && !selectedPlaceId && clusterPlacesCount === 0) {
      const timeoutId = window.setTimeout(() => setMobilePanelState("collapsed"), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [clusterPlacesCount, mobilePanelState, selectedPlaceId, sheetMode]);

  useEffect(() => {
    if (!selectedPlaceId) {
      lastAutoOpenedPlaceId.current = null;
      return;
    }
    if (lastAutoOpenedPlaceId.current === selectedPlaceId) return;
    const timeoutId = window.setTimeout(() => {
      lastAutoOpenedPlaceId.current = selectedPlaceId;
      setSheetMode("place");
      setMobilePanelState((prev) => (prev === "collapsed" ? "half" : prev));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [selectedPlaceId]);

  const resetSheetDrag = useCallback(() => {
    sheetDragStartY.current = null;
    sheetDragLastY.current = null;
    sheetDragLastTs.current = null;
    sheetDragVelocity.current = 0;
    setSheetDragging(false);
    setSheetDragOffset(0);
  }, []);

  const onSheetPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    sheetDragStartY.current = e.clientY;
    sheetDragLastY.current = e.clientY;
    sheetDragLastTs.current = performance.now();
    sheetDragVelocity.current = 0;
    setSheetDragging(true);
    setSheetDragOffset(0);
  }, []);

  const onSheetPointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (sheetDragStartY.current === null) return;
    const now = performance.now();
    if (sheetDragLastY.current !== null && sheetDragLastTs.current !== null) {
      const dy = e.clientY - sheetDragLastY.current;
      const dt = Math.max(1, now - sheetDragLastTs.current);
      sheetDragVelocity.current = dy / dt;
    }
    sheetDragLastY.current = e.clientY;
    sheetDragLastTs.current = now;
    setSheetDragOffset(e.clientY - sheetDragStartY.current);
  }, []);

  const onSheetPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    setSheetDragging(false);
    if (sheetDragStartY.current === null) {
      setSheetDragOffset(0);
      cycleMobilePanelState();
      return;
    }
    suppressNextHandleClick.current = true;
    const delta = e.clientY - sheetDragStartY.current;
    const fling = sheetDragVelocity.current;
    sheetDragStartY.current = null;
    sheetDragLastY.current = null;
    sheetDragLastTs.current = null;
    sheetDragVelocity.current = 0;
    setSheetDragOffset(0);
    if (Math.abs(delta) < 14 && Math.abs(fling) < 0.4) {
      cycleMobilePanelState();
      return;
    }
    if (delta < -24 || fling < -0.65) {
      setMobilePanelState((prev) => (prev === "collapsed" ? "half" : "full"));
      return;
    }
    if (delta > 24 || fling > 0.65) {
      setMobilePanelState((prev) => (prev === "full" ? "half" : "collapsed"));
      return;
    }
    cycleMobilePanelState();
  }, [cycleMobilePanelState]);

  const onSheetHandleClick = useCallback(() => {
    if (suppressNextHandleClick.current) {
      suppressNextHandleClick.current = false;
      return;
    }
    cycleMobilePanelState();
  }, [cycleMobilePanelState]);

  return {
    mobilePanelState,
    setMobilePanelState,
    sheetMode,
    setSheetMode,
    sheetDragging,
    sheetDragOffset,
    cycleMobilePanelState: onSheetHandleClick,
    onSheetPointerDown,
    onSheetPointerMove,
    onSheetPointerUp,
    resetSheetDrag,
  };
}
