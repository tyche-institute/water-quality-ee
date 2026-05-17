"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useDashboardMapUi({
  mapPanelRef,
  isMapFullscreen,
  setIsMapFullscreen,
  setGeoError,
  setUserCoords,
  setNearbyOnly,
  geoUnsupportedLabel,
  geoDeniedLabel,
}: {
  mapPanelRef: React.RefObject<HTMLElement | null>;
  isMapFullscreen: boolean;
  setIsMapFullscreen: (value: boolean) => void;
  setGeoError: (value: string | null) => void;
  setUserCoords: (value: { lat: number; lon: number } | null) => void;
  setNearbyOnly: (value: boolean) => void;
  geoUnsupportedLabel: string;
  geoDeniedLabel: string;
}) {
  const [countBubble, setCountBubble] = useState<{ seq: number; text: string } | null>(null);
  const countBubbleSeqRef = useRef(0);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFullscreenChange = () => {
      setIsMapFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [setIsMapFullscreen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("mapFullscreenActive", isMapFullscreen);
    return () => document.body.classList.remove("mapFullscreenActive");
  }, [isMapFullscreen]);

  const showCountBubble = useCallback((text: string) => {
    const seq = ++countBubbleSeqRef.current;
    setCountBubble({ seq, text });
    window.setTimeout(() => {
      setCountBubble((current) => (current && current.seq === seq ? null : current));
    }, 1800);
  }, []);

  const activateNearMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError(geoUnsupportedLabel);
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        setNearbyOnly(true);
      },
      () => {
        setGeoError(geoDeniedLabel);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [geoDeniedLabel, geoUnsupportedLabel, setGeoError, setNearbyOnly, setUserCoords]);

  const toggleMapFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    const target = mapPanelRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        setIsMapFullscreen(false);
      }
      return;
    }
    if (isMapFullscreen) {
      setIsMapFullscreen(false);
      return;
    }
    if (target.requestFullscreen) {
      try {
        await target.requestFullscreen();
        return;
      } catch {
        // Fallback to CSS fullscreen state when the browser Fullscreen API is unavailable.
      }
    }
    setIsMapFullscreen(true);
  }, [isMapFullscreen, mapPanelRef, setIsMapFullscreen]);

  return {
    countBubble,
    showCountBubble,
    activateNearMe,
    toggleMapFullscreen,
  };
}
