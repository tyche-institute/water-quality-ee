type AnalyticsEvent =
  | "dashboard_open"
  | "filters_changed"
  | "place_selected"
  | "watchlist_toggled"
  | "history_toggled"
  | "measurements_toggled"
  | "info_opened"
  | "share_click"
  | "verify_page_open"
  | "verify_attempt"
  | "verify_result"
  | "data_gap_notice_impression"
  | "data_gap_notice_dismissed"
  | "signed_badge_click"
  | "web_vital";

type EventPayload = {
  event: AnalyticsEvent;
  ts: string;
  meta?: Record<string, string | number | boolean | null>;
};

type Env = {
  ANALYTICS_KV: KVNamespace;
  ANALYTICS_ALLOW_ORIGIN?: string;
};

const EVENT_NAMES = new Set<AnalyticsEvent>([
  "dashboard_open",
  "filters_changed",
  "place_selected",
  "watchlist_toggled",
  "history_toggled",
  "measurements_toggled",
  "info_opened",
  "share_click",
  "verify_page_open",
  "verify_attempt",
  "verify_result",
  "data_gap_notice_impression",
  "data_gap_notice_dismissed",
  "signed_badge_click",
  "web_vital",
]);

function corsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowOrigin = env.ANALYTICS_ALLOW_ORIGIN || "https://h2oatlas.ee";
  const resolvedOrigin = origin && origin === allowOrigin ? origin : allowOrigin;
  return {
    "access-control-allow-origin": resolvedOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function isMetaValue(value: unknown): value is string | number | boolean | null {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function parsePayload(input: unknown): EventPayload | null {
  if (!input || typeof input !== "object") return null;
  const payload = input as Record<string, unknown>;
  if (typeof payload.event !== "string" || !EVENT_NAMES.has(payload.event as AnalyticsEvent)) return null;
  if (typeof payload.ts !== "string") return null;
  if (payload.meta !== undefined) {
    if (!payload.meta || typeof payload.meta !== "object" || Array.isArray(payload.meta)) return null;
    for (const value of Object.values(payload.meta)) {
      if (!isMetaValue(value)) return null;
    }
  }
  return payload as EventPayload;
}

async function incrementKey(kv: KVNamespace, key: string): Promise<void> {
  const current = Number((await kv.get(key)) || "0");
  await kv.put(key, String(current + 1));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = corsHeaders(request.headers.get("origin"), env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers });
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return new Response("Bad JSON", { status: 400, headers });
    }

    const payload = parsePayload(raw);
    if (!payload) {
      return new Response("Invalid payload", { status: 400, headers });
    }

    const day = payload.ts.slice(0, 10);
    await Promise.all([
      incrementKey(env.ANALYTICS_KV, `events:${day}:total`),
      incrementKey(env.ANALYTICS_KV, `events:${day}:${payload.event}`),
      env.ANALYTICS_KV.put("event:last", JSON.stringify(payload), { expirationTtl: 60 * 60 * 24 * 7 }),
    ]);

    return new Response("ok", { status: 200, headers });
  },
};
