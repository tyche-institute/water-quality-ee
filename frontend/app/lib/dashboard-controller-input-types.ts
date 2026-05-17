"use client";

import type { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import type { useDashboardControllerRuntime } from "./use-dashboard-controller-runtime";

export type DashboardBootstrapState = ReturnType<typeof useDashboardControllerBootstrap>;
export type DashboardRuntimeState = ReturnType<typeof useDashboardControllerRuntime>;
