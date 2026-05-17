"use client";

export function buildDashboardClassName(isMobile: boolean, sidebarCollapsed: boolean) {
  return `dashboard ${!isMobile ? (sidebarCollapsed ? "dashboardSidebarCollapsed" : "dashboardSidebar") : ""}`;
}
