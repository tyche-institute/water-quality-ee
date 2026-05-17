"use client";

import { buildDashboardControllerFrame } from "./dashboard-controller-frame";
import { buildDashboardControllerViewModel } from "./dashboard-controller-view-model";
import { buildMainContentInput } from "./dashboard-controller-main-content-input";
import { buildOverlayInput } from "./dashboard-controller-overlay-input";
import { buildTopChromeInput } from "./dashboard-controller-top-chrome-input";
import { useDashboardControllerBootstrap } from "./use-dashboard-controller-bootstrap";
import { useDashboardControllerRuntime } from "./use-dashboard-controller-runtime";
import type { FrontendSnapshot } from "./types";

export function useDashboardController(snapshot: FrontendSnapshot) {
  const state = useDashboardControllerBootstrap();
  const runtime = useDashboardControllerRuntime(snapshot, state);
  const frame = buildDashboardControllerFrame(state, runtime);

  return buildDashboardControllerViewModel({
    ...frame,
    overlay: buildOverlayInput(snapshot, state, runtime),
    topChrome: buildTopChromeInput(state, runtime),
    mainContent: buildMainContentInput(snapshot, state, runtime),
  });
}
