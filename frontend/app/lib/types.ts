export type FrontendPlace = {
  id: string;
  location: string;
  domain: string;
  place_kind: string;
  county: string | null;
  sample_date: string | null;
  official_compliant: number | null;
  coord_source: string | null;
  lat: number;
  lon: number;
  model_violation_prob: number | null;
  lr_violation_prob: number | null;
  rf_violation_prob: number | null;
  gb_violation_prob: number | null;
  lgbm_violation_prob: number | null;
  risk_level: "low" | "medium" | "high" | "unknown";
  has_model_prob: boolean;
  audit_bucket?: "agree_pass" | "agree_violate" | "hidden_violation" | "hidden_pass" | "unknown";
  deterministic_norms_violation?: boolean;
  n_measured_norm_params?: number;
  n_total_norm_params?: number;
  norm_coverage_ratio?: number | null;
  data_quality_flags?: string[];
  uncertainty_level?: "low" | "medium" | "high";
  search_text: string;
  measurements_count: number;
  measurements?: Record<string, number>;
  sample_history?: Array<{
    sample_date: string;
    official_compliant: number | null;
    measurements?: Record<string, number>;
  }>;
  // AI Act Art 12 provenance (optional — older snapshots may not carry these).
  prediction_id?: string;
  feature_hash?: string;
  model_version?: string;
  created_at?: string;
};

export type FrontendRefreshHistoryEntry = {
  generated_at: string | null;
  data_fetched_at?: string | null;
  model_trained_at?: string | null;
  git_sha?: string | null;
  model_version?: string | null;
  places_count: number;
  official_violation_share: number | null;
  model_coverage_share: number;
  publication_gap_count: number;
  changes_from_previous?: {
    places_count_delta: number;
    official_violation_share_delta_pp: number | null;
    model_coverage_share_delta_pp: number | null;
    publication_gap_count_delta: number;
  } | null;
};

export type FrontendSnapshot = {
  generated_at: string;
  data_fetched_at?: string | null;
  model_trained_at?: string | null;
  has_model_predictions: boolean;
  available_models: string[];
  model_labels: Record<string, string>;
  /** Human-readable name of the model whose probability drives
   *  `risk_level` / marker color on the map (e.g. "LightGBM").
   *  Null on very old snapshots with no per-model columns. */
  canonical_model?: string | null;
  data_catalog_url: string | null;
  disclaimer: string | null;
  places_count: number;
  place_kinds: Record<string, string>;
  domains: string[];
  diagnostics: {
    official_compliant_share: number | null;
    official_violation_share: number | null;
    model_coverage_share: number;
    mean_model_probabilities: Record<string, number | null>;
    uncertainty_summary?: {
      method: string;
      audit_bucket_counts: Record<string, number>;
      uncertainty_level_counts: Record<string, number>;
      places_with_publication_gap: number;
      flag_counts: Record<string, number>;
    };
  };
  places: FrontendPlace[];
  refresh_history?: FrontendRefreshHistoryEntry[];
  // AI Act Art 12 snapshot-level provenance (optional).
  model_version?: string;
  git_sha?: string | null;
  feature_hash_columns?: string[];
};
