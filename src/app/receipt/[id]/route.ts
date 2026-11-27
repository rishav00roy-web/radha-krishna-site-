import { receiptsEndpoint, receiptsLive } from "@/lib/receipts";

/**
 * rkpm.org/receipt/<id> serves a receipt PDF from the foundation's own domain.
 * The id is the receipt number plus a random part (e.g. GGF-2026-27-0001-K7QD9XW2MA), so receipts
 * can't be guessed. The PDF itself stays private in the foundation's Drive; the receipt register
 * (Apps Script, see /receipts) hands it over only for an id it issued.
 */
export const dynamic = "force-dynamic";

const ID = /^[A-Z0-9-]{8,40}-[A-Z0-9]{10}$/;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id.toUpperCase();
  if (!ID.test(id) || !receiptsLive) return notFound();
  try {
    const res = await fetch(`${receiptsEndpoint}?r=${encodeURIComponent(id)}`, { cache: "no-store", redirect: "follow" });
    const body = (await res.json()) as { ok?: boolean; name?: string; data?: string };
    if (!body.ok || !body.data) return notFound();
    const pdf = Buffer.from(body.data, "base64");
    const name = (body.name || `${id}.pdf`).replace(/[^\w .-]/g, "");
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${name}"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
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
