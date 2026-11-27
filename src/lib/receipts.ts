/**
 * Founding-member sign-ups and donation notices go to the foundation's receipt register:
 * a Google Sheet with an Apps Script web app (see /receipts in the repository).
 *
 * NEXT_PUBLIC_RECEIPTS_ENDPOINT overrides the web app's URL; otherwise DEFAULT_ENDPOINT is used.
 * The URL is public by design (browsers post to it), so it is safe in the code.
 * Set the variable to "off" to run the forms in demo mode: nothing is sent, the visitor sees
 * the reference they would get, and sends the details themselves by email or WhatsApp.
 */
import type { Locale } from "@/i18n/config";

const DEFAULT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbw0afidnlWL_MzXVcwuai4Sv5xlwSpCuQ_Zc74mtZcwomRxjOQ01kkdseQjsSp0jAjAVA/exec";

export const receiptsEndpoint = (process.env.NEXT_PUBLIC_RECEIPTS_ENDPOINT || DEFAULT_ENDPOINT).trim();
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
