/**
 * publicIntakeApi.js
 * Thin wrapper for all public-facing intake calls.
 * Replace any import of base44.functions.invoke with these helpers.
 *
 * Required env var (Astro):
 *   PUBLIC_MLC_API_BASE_URL=https://api.mlcinsuranceagency.com
 */

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_MLC_API_BASE_URL) ||
  "https://api.mlcinsuranceagency.com";

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText;
    throw new Error(`[publicIntakeApi] ${res.status} ${path}: ${msg}`);
  }

  return data;
}

/**
 * Quote Step 1 — create/upsert lead
 * Maps to POST /public/intake/quote/step1
 */
export async function submitQuoteStep1(payload) {
  return post("/public/intake/quote/step1", payload);
}

/**
 * Quote Step 2 — enrich lead
 * Maps to POST /public/intake/quote/step2
 */
export async function submitQuoteStep2(payload) {
  return post("/public/intake/quote/step2", payload);
}

/**
 * Broker application
 * Maps to POST /public/intake/broker-application
 */
export async function submitBrokerApplication(payload) {
  return post("/public/intake/broker-application", payload);
}

/**
 * Footer SMS subscribe
 * Maps to POST /public/intake/sms-subscribe
 */
export async function submitSmsSubscribe(payload) {
  return post("/public/intake/sms-subscribe", payload);
}
