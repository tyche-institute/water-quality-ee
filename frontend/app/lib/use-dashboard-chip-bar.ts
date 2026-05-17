"use client";

import { useCallback, useRef, useState } from "react";

export function useDashboardChipBar({
  chipBarRef,
}: {
  chipBarRef: React.RefObject<HTMLDivElement | null>;
}) {
  const chipDragOrigin = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const chipPointerId = useRef<number | null>(null);
  const chipDragging = useRef(false);
  const [chipPos, setChipPos] = useState<{ left: number; top: number } | null>(null);

  const onChipPointerDown = useCallback((e: React.PointerEvent) => {
    const bar = chipBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    chipDragOrigin.current = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top };
    chipDragging.current = false;
    chipPointerId.current = e.pointerId;
  }, [chipBarRef]);

  const onChipPointerMove = useCallback((e: React.PointerEvent) => {
    const origin = chipDragOrigin.current;
    const bar = chipBarRef.current;
    if (!origin || !bar) return;
    const dx = e.clientX - origin.x;
    const dy = e.clientY - origin.y;
    if (!chipDragging.current) {
      if (Math.abs(dx) + Math.abs(dy) < 5) return;
      chipDragging.current = true;
      if (chipPointerId.current !== null) {
        bar.setPointerCapture(chipPointerId.current);
      }
    }
    const parent = bar.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const barWidth = bar.offsetWidth;
    const barHeight = bar.offsetHeight;
    const newLeft = Math.max(0, Math.min(parentRect.width - barWidth, origin.left - parentRect.left + dx));
    const newTop = Math.max(0, Math.min(parentRect.height - barHeight, origin.top - parentRect.top + dy));
    setChipPos({ left: newLeft, top: newTop });
  }, [chipBarRef]);

  const onChipPointerUp = useCallback((e: React.PointerEvent) => {
    const bar = chipBarRef.current;
    if (bar && chipPointerId.current !== null) {
      try {
        bar.releasePointerCapture(chipPointerId.current);
      } catch {
        // Pointer was not captured.
      }
    }
    chipPointerId.current = null;
    if (chipDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      setTimeout(() => {
        chipDragging.current = false;
      }, 0);
    }
    chipDragOrigin.current = null;
  }, [chipBarRef]);

  const onChipClick = useCallback((e: React.MouseEvent) => {
    if (!chipDragging.current) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return {
    chipPos,
    onChipPointerDown,
    onChipPointerMove,
    onChipPointerUp,
    onChipClick,
  };
}
