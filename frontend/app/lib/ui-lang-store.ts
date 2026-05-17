"use client";

import { useSyncExternalStore } from "react";

export type UiLang = "ru" | "et" | "en";

export const UI_LANG_STORAGE_KEY = "water.ui.lang";
export const UI_LANG_CHANGED_EVENT = "water-ui-lang-changed";

export function normalizeUiLang(value: string | null | undefined): UiLang {
  const next = String(value ?? "").toLowerCase();
  if (next.startsWith("ru")) return "ru";
  if (next.startsWith("et")) return "et";
  return "en";
}

function readUiLang(): UiLang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(UI_LANG_STORAGE_KEY);
    return normalizeUiLang(stored ?? window.navigator.language);
  } catch {
    return normalizeUiLang(window.navigator.language);
  }
}

function getServerUiLang(): UiLang {
  return "en";
}

function subscribeUiLang(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === UI_LANG_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener(UI_LANG_CHANGED_EVENT, onStoreChange as EventListener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(UI_LANG_CHANGED_EVENT, onStoreChange as EventListener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useUiLang(): UiLang {
  return useSyncExternalStore(subscribeUiLang, readUiLang, getServerUiLang);
}
