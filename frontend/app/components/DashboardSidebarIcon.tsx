"use client";

type Props = {
  name: "globe" | "grid" | "alert" | "signal" | "check-circle" | "chevron-down" | "calendar" | "close";
};

export default function DashboardSidebarIcon({ name }: Props) {
  if (name === "close") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.7 5.3 12 10.6l5.3-5.3 1.4 1.4L13.4 12l5.3 5.3-1.4 1.4L12 13.4l-5.3 5.3-1.4-1.4L10.6 12 5.3 6.7l1.4-1.4Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "globe") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.2 2.4 3.4 5.7 3.4 9S14.2 18.6 12 21c-2.2-2.4-3.4-5.7-3.4-9S9.8 5.4 12 3Zm-7 9h14M6.1 7.5h11.8M6.1 16.5h11.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "grid") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "alert") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 2.2 20h19.6L12 3Zm0 5.2c.6 0 1 .4 1 1v5.4a1 1 0 1 1-2 0V9.2c0-.6.4-1 1-1Zm0 10a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "signal") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 16h2v3H5v-3Zm4-4h2v7H9v-7Zm4-4h2v11h-2V8Zm4-4h2v15h-2V4Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "check-circle") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm-1 11.2-3-3 1.4-1.4 1.6 1.6 3.8-3.8 1.4 1.4-5.2 5.2Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "chevron-down") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6.7 9.3 5.3 5.3 5.3-5.3 1.4 1.4-6.7 6.7-6.7-6.7 1.4-1.4Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
