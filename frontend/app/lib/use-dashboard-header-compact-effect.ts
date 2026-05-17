"use client";

import { useEffect } from "react";

export function useDashboardHeaderCompactEffect(setHeaderCompact: (value: boolean) => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setHeaderCompact(window.scrollY > 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [setHeaderCompact]);
}
