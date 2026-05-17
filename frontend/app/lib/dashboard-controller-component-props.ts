"use client";

import type { ComponentProps } from "react";
import type DashboardMainContent from "../components/DashboardMainContent";
import type DashboardOverlays from "../components/DashboardOverlays";
import type DashboardTopChrome from "../components/DashboardTopChrome";

export type DashboardTopChromeProps = ComponentProps<typeof DashboardTopChrome>;
export type DashboardMainContentProps = ComponentProps<typeof DashboardMainContent>;
export type DashboardOverlayProps = ComponentProps<typeof DashboardOverlays>;
