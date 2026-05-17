"use client";

export const countyKey = (value: string | null | undefined) => (value || "").trim().toLowerCase();

export const countyPretty = (value: string | null | undefined) =>
  (value || "")
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(" ");
