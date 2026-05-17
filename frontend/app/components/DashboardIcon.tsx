"use client";

export type DashboardIconName =
  | "pin"
  | "unpin"
  | "close"
  | "alert"
  | "reset"
  | "filter-x"
  | "filters"
  | "locate"
  | "info"
  | "calendar"
  | "sun"
  | "moon"
  | "swim"
  | "pool"
  | "tap"
  | "drop"
  | "check-circle"
  | "x-circle"
  | "dash-circle"
  | "star"
  | "star-outline"
  | "signal"
  | "grid"
  | "globe"
  | "chevron-down";

export default function DashboardIcon({ name }: { name: DashboardIconName }) {
  if (name === "pin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4.5h8l-1.4 4.2 2.7 2.8v1H13v6l-1 1-1-1v-6H6.7v-1l2.7-2.8L8 4.5Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "unpin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 5h10l-1.6 4.3 2.6 2.7v1H13v5.7l-1 1-1-1V13H6v-1l2.6-2.7L7 5Zm-1.7 12.2 11.5-11.5 1.4 1.4L6.7 18.6l-1.4-1.4Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.7 5.3 12 10.6l5.3-5.3 1.4 1.4L13.4 12l5.3 5.3-1.4 1.4L12 13.4l-5.3 5.3-1.4-1.4L10.6 12 5.3 6.7l1.4-1.4Z" fill="currentColor" />
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
  if (name === "filters") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7a1 1 0 0 1 1-1h2.3a2.5 2.5 0 0 1 4.8 0H19a1 1 0 1 1 0 2h-6.9a2.5 2.5 0 0 1-4.8 0H5a1 1 0 0 1-1-1Zm8 10a2.5 2.5 0 0 1-4.7 1H5a1 1 0 1 1 0-2h2.3a2.5 2.5 0 0 1 4.7 1Zm1-6a2.5 2.5 0 0 1 4.7-1H19a1 1 0 1 1 0 2h-1.3a2.5 2.5 0 0 1-4.7-1Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "filter-x") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 5h16l-6 7v5l-4 2v-7L4 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M5 19 19 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "locate") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "info") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="7.6" r="1.4" fill="currentColor" />
        <rect x="10.7" y="10.4" width="2.6" height="7.2" rx="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "sun") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.1 5.1l1.7 1.7M17.2 17.2l1.7 1.7M5.1 18.9l1.7-1.7M17.2 6.8l1.7-1.7" />
        </g>
      </svg>
    );
  }
  if (name === "moon") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 13.5A9 9 0 1 1 10.5 3a7.2 7.2 0 0 0 10.5 10.5Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "swim") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="13.5" cy="4.5" r="1.8" fill="currentColor" />
        <path d="M12 7 9 12l4 2 1.5-2.5L16 14l3.5-1.5-2.5-5.5-5 0Z" fill="currentColor" />
        <path d="M3 18.5c1.4-1.4 3.6-1.4 5 0s3.6 1.4 5 0 3.6-1.4 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "pool") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 13V9l3-3 3 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M3 16c1.4-1.4 3.6-1.4 5 0s3.6 1.4 5 0 3.6-1.4 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 20c1.4-1.4 3.6-1.4 5 0s3.6 1.4 5 0 3.6-1.4 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "tap") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 8h10v5H7z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M10 8V6h4v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M17 10.5h2.5v1.5H17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="18" r="1.3" fill="currentColor" />
      </svg>
    );
  }
  if (name === "drop") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3C12 3 5.5 10.5 5.5 15a6.5 6.5 0 0 0 13 0C18.5 10.5 12 3 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "check-circle") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "x-circle") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "dash-circle") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "star") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 15.77l-5.25 2.88 1-5.85L3.5 8.65l5.9-.85L12 2.5Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === "star-outline") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 15.77l-5.25 2.88 1-5.85L3.5 8.65l5.9-.85L12 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "grid") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.2" y="3.2" width="7.6" height="7.6" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
        <rect x="13.2" y="3.2" width="7.6" height="7.6" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
        <rect x="3.2" y="13.2" width="7.6" height="7.6" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
        <rect x="13.2" y="13.2" width="7.6" height="7.6" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === "globe") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 12h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 3c2.5 2.8 3.8 5.9 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.9-3.8-9S9.5 5.8 12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "chevron-down") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "signal") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="17" width="4" height="4" rx="0.8" fill="currentColor" />
        <rect x="8" y="12" width="4" height="9" rx="0.8" fill="currentColor" />
        <rect x="14" y="7" width="4" height="14" rx="0.8" fill="currentColor" />
        <rect x="20" y="2" width="3" height="19" rx="0.8" fill="currentColor" opacity="0.35" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4a8 8 0 1 1-5.7 2.3L4.9 7.7A10 10 0 1 0 12 2v2Zm-1 1 4 4-4 4V10H2V8h9V5Z" fill="currentColor" />
    </svg>
  );
}
