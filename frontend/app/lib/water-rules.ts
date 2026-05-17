import waterNorms from "./water-rules.json";

export type DomainKey = "supluskoha" | "veevark" | "joogivesi" | "basseinid";

export type NormRule = {
  min?: number;
  max?: number;
  exact?: number;
  unit: string;
};

type DomainRuleMap = Partial<Record<DomainKey, NormRule>> & {
  default?: NormRule;
};

const RAW_RULES = waterNorms.rules as Record<string, DomainRuleMap>;

export const WATER_RULES_VERSION = waterNorms.version;

export function getNormRule(param: string, domain: string): NormRule | null {
  const entry = RAW_RULES[param];
  if (!entry) return null;
  return entry[domain as DomainKey] ?? entry.default ?? null;
}

export function isNormViolated(value: number, rule: NormRule): boolean {
  if (typeof rule.exact === "number" && value !== rule.exact) return true;
  if (typeof rule.min === "number" && value < rule.min) return true;
  if (typeof rule.max === "number" && value > rule.max) return true;
  return false;
}

export function formatNormRule(rule: NormRule, formatNumber?: (value: number) => string): string {
  const fmt = formatNumber ?? ((value: number) => String(value));
  if (typeof rule.exact === "number") return `= ${fmt(rule.exact)} ${rule.unit}`;
  if (typeof rule.min === "number" && typeof rule.max === "number") return `${fmt(rule.min)}-${fmt(rule.max)} ${rule.unit}`;
  if (typeof rule.min === "number") return `>= ${fmt(rule.min)} ${rule.unit}`;
  if (typeof rule.max === "number") return `<= ${fmt(rule.max)} ${rule.unit}`;
  return rule.unit;
}

export function assessNorm(param: string, value: number, domain: string): {
  rule: NormRule | null;
  violated: boolean | null;
} {
  const rule = getNormRule(param, domain);
  if (!rule) return { rule: null, violated: null };
  return { rule, violated: isNormViolated(value, rule) };
}
