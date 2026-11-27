import { receiptsEndpoint, receiptsLive } from "@/lib/receipts";

/**
 * rkpm.org/receipt/<id> serves a receipt PDF from the foundation's own domain.
 * The id is the receipt number plus a random part (e.g. GGF-2026-27-0001-K7QD9XW2MA), so receipts
 * can't be guessed. The PDF itself stays private in the foundation's Drive; the receipt register
 * (Apps Script, see /receipts) hands it over only for an id it issued.
 */
export const dynamic = "force-dynamic";

const ID = /^[A-Z0-9-]{8,40}-[A-Z0-9]{10}$/;

// At most 30 receipt lookups per visitor in 10 minutes (kept in memory; enough for one small server).
const WINDOW = 10 * 60 * 1000, LIMIT = 30;
const hits = new Map<string, { n: number; until: number }>();
function tooMany(ip: string) {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.until < now) hits.delete(k);
  const h = hits.get(ip);
  if (!h || h.until < now) { hits.set(ip, { n: 1, until: now + WINDOW }); return false; }
  h.n += 1;
  return h.n > LIMIT;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (tooMany(ip)) return new Response("Too many requests. Please try again later.", { status: 429, headers: { "Retry-After": "600" } });
  const id = (await params).id.toUpperCase();
  if (!ID.test(id) || !receiptsLive) return notFound();
  try {
    // Only ever the foundation's own register; the visitor controls nothing but the checked id.
    const res = await fetch(`${receiptsEndpoint}?r=${encodeURIComponent(id)}`, { cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(15000) });
    const body = (await res.json()) as { ok?: boolean; name?: string; data?: string };
    if (!body.ok || !body.data) return notFound();
    const pdf = Buffer.from(body.data, "base64");
    if (pdf.subarray(0, 4).toString() !== "%PDF") return notFound();
    const name = (body.name || `${id}.pdf`).replace(/[^\w .-]/g, "");
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${name}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return new Response("This receipt could not be loaded just now. Please try again in a minute.", { status: 502 });
  }
}

function notFound() {
  return new Response("Receipt not found. Please check the link, or contact Gousamuh Gramaya Foundation.", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}
