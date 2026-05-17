"use client";

import SignedBadge from "./SignedBadge";
import type { DashboardLang } from "../lib/dashboard-types";

type Props = {
  lang: DashboardLang;
};

export default function DashboardMapFreshnessOverlay(props: Props) {
  const { lang } = props;
  return (
    <div className="mapFreshnessOverlay">
      <SignedBadge lang={lang} />
    </div>
  );
}
