import type { DashboardLang } from "./dashboard-types";

export type DashboardContentLang = DashboardLang;

export type ParamCopy = {
  ruLabel: string;
  etLabel: string;
  enLabel: string;
  ruDesc: string;
  etDesc: string;
  enDesc: string;
};

export type ParameterCard = {
  key: string;
  icon: string;
  ruTitle: string;
  etTitle: string;
  enTitle: string;
  ruImpact: string;
  etImpact: string;
  enImpact: string;
  ruWhy: string;
  etWhy: string;
  enWhy: string;
};
