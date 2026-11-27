/**
 * Founding-member sign-ups and donation notices go to the foundation's receipt register:
 * a Google Sheet with an Apps Script web app (see /receipts in the repository).
 *
 * NEXT_PUBLIC_RECEIPTS_ENDPOINT is the web app's URL. Without it the forms run in demo mode:
 * nothing is sent, the visitor sees the reference they would get, and sends the details
 * themselves by email or WhatsApp, as before.
 */
import type { Locale } from "@/i18n/config";

export const receiptsEndpoint = (process.env.NEXT_PUBLIC_RECEIPTS_ENDPOINT || "").trim();
export const receiptsLive = receiptsEndpoint.startsWith("https://");

export type Kind = "member" | "donation";

/** A short reference the visitor can quote, like FM-261127-K7QD. The receipt number itself is given by the foundation. */
export function makeRef(kind: Kind) {
  const d = new Date();
  const ist = new Date(d.getTime() + (330 + d.getTimezoneOffset()) * 60000);
  const ymd = `${String(ist.getFullYear()).slice(2)}${String(ist.getMonth() + 1).padStart(2, "0")}${String(ist.getDate()).padStart(2, "0")}`;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const tail = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `${kind === "member" ? "FM" : "DN"}-${ymd}-${tail}`;
}

/**
 * Sends one form to the register. The Apps Script web app does not send CORS headers, so the
 * request is "no-cors": it arrives, but the page cannot read the reply. A network failure still throws.
 */
export async function recordSubmission(kind: Kind, ref: string, fields: Record<string, string>) {
  if (!receiptsLive) return;
  const body = new URLSearchParams({ kind, ref, ...fields });
  await fetch(receiptsEndpoint, { method: "POST", mode: "no-cors", body, keepalive: true });
}

/** The demo page that shows the acknowledgement email and a sample receipt for this submission. */
export function sampleReceiptHref(locale: Locale, kind: Kind, ref: string, f: Record<string, string>) {
  const q = new URLSearchParams({ k: kind === "member" ? "m" : "d", ref });
  for (const [k, v] of Object.entries(f)) if (v) q.set(k, v);
  return `/${locale}/receipt-demo?${q.toString()}`;
}
