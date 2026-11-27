"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandMark } from "./BrandMark";
import { inr, rupeesInWords } from "@/lib/amountWords";

type Org = { name: string; address: string; cin: string; pan: string; csr: string; darpan: string; eightyG: string; phone: string; email: string | null };

/** A value the foundation still has to give. Shown highlighted on the demo, so nothing reads as final. */
function Fill({ children }: { children: React.ReactNode }) {
  return <mark className="rounded-sm border border-dashed border-[#c08a1e] bg-[#fff1c7] px-1 text-[#6b4a0e] print:border-[#999] print:bg-transparent">{children}</mark>;
}

const isPlaceholderEmail = (e: string | null) => !e || /example\.(org|com)$/i.test(e);

function financialYear(d: Date) {
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}-${String(y + 1).slice(2)}`;
}

/**
 * The receipt flow, step by step, for one submission (read from the URL):
 * 1. the acknowledgement email sent at once, 2. the foundation marks the payment received,
 * 3. the numbered receipt it then sends. Everything is marked as a sample.
 */
export function ReceiptDemo({ org }: { org: Org }) {
  const q = useSearchParams();
  const locale = (useParams()?.locale as string) || "en";
  const member = q.get("k") === "m";
  const ref = q.get("ref") || (member ? "FM-000000-DEMO" : "DN-000000-DEMO");
  const name = q.get("n") || "Sample Name";
  const email = q.get("e") || "";
  const place = q.get("pl") || "";
  const donorPan = q.get("pan") || "";

  const [amount, setAmount] = useState(String(Number(q.get("a")) > 0 ? Number(q.get("a")) : member ? 100000 : 1100));
  const [mode, setMode] = useState(member ? "Bank transfer" : q.get("md") || "Bank transfer");
  const [utr, setUtr] = useState(q.get("u") || "");
  const [issued, setIssued] = useState(false);
  const today = useMemo(() => new Date(), []);
  const dateText = today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
  const amt = Math.max(0, Math.floor(Number(amount.replace(/[,\s₹]/g, "")) || 0));
  const receiptNo = `GGF/DEMO/${financialYear(today)}/0001`;
  const sender = isPlaceholderEmail(org.email) ? null : org.email;

  const backHref = `/${locale}/${member ? "founding-members#register" : "donate#tell"}`;

  return (
    <div className="bg-marble-2 pb-24 pt-[calc(2rem+env(safe-area-inset-top))] print:bg-white print:p-0">
      <div className="container-x max-w-[880px]">
        <div className="rounded border-2 border-dashed border-[#c08a1e] bg-[#fff6dc] p-5 text-[#5b3f0b] print:hidden">
          <p className="font-display text-2xl">Demo of the receipt system</p>
          <p className="mt-1">
            This page shows what the foundation&apos;s system sends for reference <strong className="tabular">{ref}</strong>. It is a sample, not a real receipt.
            Highlighted parts are details the foundation still has to give.
          </p>
          <Link href={backHref} className="mt-3 inline-block underline underline-offset-4">← Back to the form</Link>
        </div>

        {/* 1. Acknowledgement */}
        <section className="mt-10 print:hidden" aria-labelledby="s1">
          <h1 id="s1" className="display-md"><span className="text-gold">1.</span> Acknowledgement, sent at once</h1>
          <p className="mt-2 text-ink-soft">Emailed automatically within a minute of the form being sent. It confirms the details arrived. It is not a receipt.</p>
          <div className="mt-5 overflow-hidden rounded border border-line bg-white shadow-[0_18px_40px_-28px_rgb(42_33_24/0.5)]">
            <dl className="grid gap-1 border-b border-line bg-marble px-5 py-4 text-sm sm:grid-cols-[5rem_1fr]">
              <dt className="text-ink-soft">From</dt><dd>{org.name} &lt;{sender ?? <Fill>foundation email</Fill>}&gt;</dd>
              <dt className="text-ink-soft">To</dt><dd>{email || <span className="text-ink-soft">No email given, so the foundation replies on WhatsApp instead</span>}</dd>
              <dt className="text-ink-soft">Subject</dt><dd>{member ? "We've received your founding member registration" : "We've received your donation details"} ({ref})</dd>
            </dl>
            <div className="grid gap-3 px-5 py-6 text-[0.98rem] leading-relaxed">
              <p>Namaskar {name},</p>
              {member ? (
                <p>Thank you for your interest in becoming a founding member of the proposed Shri Shri Radha-Krishna Prem Mandir. Your registration has reached Gousamuh Gramaya Foundation{place ? ` (${place})` : ""}. Someone from the foundation will call you to answer your questions and share the full details.</p>
              ) : (
                <p>Thank you for your gift of <strong>{inr(amt)}</strong> by {mode.toLowerCase()}. Your details have reached Gousamuh Gramaya Foundation.</p>
              )}
              <p>Your reference number is <strong className="tabular">{ref}</strong>. Please quote it when you contact us{member ? "" : ", and in your bank transfer remark"}.</p>
              <p className="rounded-sm bg-marble-2 px-3 py-2">This email is an acknowledgement, not a receipt. The foundation sends an official numbered receipt once {member ? "a payment" : "your gift"} reaches its account{member ? "" : " or is handed over at its office"}.{member ? " Payments are made only by bank transfer, to an account the foundation confirms in writing." : ""}</p>
              <p>With gratitude,<br />{org.name}<br /><span className="text-ink-soft">{org.address} · {org.phone}</span></p>
            </div>
          </div>
        </section>

        {/* 2. The foundation confirms the money */}
        <section className="mt-12 print:hidden" aria-labelledby="s2">
          <h2 id="s2" className="display-md"><span className="text-gold">2.</span> The foundation confirms the payment</h2>
          <p className="mt-2 text-ink-soft">
            When the money shows in the bank statement (or cash is handed over), staff open the Google Sheet, fill in the amount and UTR on that row, set the status to
            &nbsp;<em>Received</em> and choose <em>Receipts → Issue receipt</em>. Try it here:
          </p>
          <div className="mt-5 grid gap-4 rounded border border-line bg-marble p-5 sm:grid-cols-3">
            <label className="grid gap-1 text-sm text-ink-soft">Amount received (₹)
              <input value={amount} onChange={(e) => { setAmount(e.target.value); setIssued(false); }} inputMode="numeric" className="field tabular" />
            </label>
            <label className="grid gap-1 text-sm text-ink-soft">Mode
              <select value={mode} onChange={(e) => { setMode(e.target.value); setIssued(false); }} className="field" disabled={member}>
                <option>Bank transfer</option>
                {!member ? <option>Cash in person</option> : null}
              </select>
            </label>
            <label className="grid gap-1 text-sm text-ink-soft">UTR / reference
              <input value={utr} onChange={(e) => { setUtr(e.target.value); setIssued(false); }} placeholder={mode === "Bank transfer" ? "e.g. MAHBR52026112700123" : "Not needed for cash"} className="field tabular" />
            </label>
            <div className="sm:col-span-3">
              <button type="button" onClick={() => setIssued(true)} disabled={amt < 1} className="btn btn-primary">Mark as received and issue receipt</button>
              {member ? <p className="mt-2 text-sm text-ink-soft">Founding-member payments: bank transfer only (cash of ₹2 lakh or more from one person is not allowed).</p> : null}
            </div>
          </div>
        </section>

        {/* 3. The receipt */}
        {issued ? (
          <section className="mt-12" aria-labelledby="s3">
            <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
              <div>
                <h2 id="s3" className="display-md"><span className="text-gold">3.</span> The official receipt</h2>
                <p className="mt-2 text-ink-soft">The Sheet turns this into a PDF, emails it{email ? ` to ${email}` : ""}, saves it in the foundation&apos;s Drive and writes the receipt number on the row.</p>
              </div>
              <button type="button" onClick={() => window.print()} className="btn btn-quiet">Print or save as PDF</button>
            </div>

            <article id="receipt" className="relative mt-6 overflow-hidden rounded bg-[#fffdf7] p-6 text-[#2a2118] shadow-[inset_0_0_0_1px_#c9a24a,inset_0_0_0_6px_#fffdf7,inset_0_0_0_7px_rgb(201_162_74/0.45),0_24px_50px_-30px_rgb(42_33_24/0.6)] sm:p-10 print:shadow-[inset_0_0_0_1px_#c9a24a]">
              <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[24deg] whitespace-nowrap font-display text-[clamp(3rem,12vw,7rem)] tracking-[0.12em] text-[rgb(179_38_30/0.09)]">SAMPLE · DEMO</span>
              <header className="relative flex flex-col items-center gap-3 border-b border-[rgb(201_162_74/0.5)] pb-5 text-center">
                <BrandMark size={52} className="text-[#a87a26]" />
                <p className="font-display text-2xl leading-tight sm:text-3xl">{org.name}</p>
                <p className="max-w-[48ch] text-xs leading-relaxed text-[#6b5b48]">
                  A Section 8 company · {org.address}<br />CIN {org.cin} · PAN {org.pan} · CSR Reg. {org.csr} · NGO Darpan {org.darpan}
                </p>
                <p className="mt-1 rounded-full border border-[#b3261e] px-3 py-0.5 text-xs font-semibold tracking-[0.14em] text-[#b3261e]">SAMPLE RECEIPT · NOT VALID</p>
              </header>

              <div className="relative mt-6 flex flex-wrap justify-between gap-3 text-sm">
                <p><span className="text-[#6b5b48]">Receipt no.</span> <strong className="tabular">{receiptNo}</strong></p>
                <p><span className="text-[#6b5b48]">Date</span> <strong>{dateText}</strong></p>
              </div>

              <dl className="relative mt-6 grid gap-x-6 gap-y-3 text-[0.98rem] sm:grid-cols-[11rem_1fr]">
                <dt className="text-[#6b5b48]">Received with thanks from</dt><dd className="font-semibold">{name}</dd>
                <dt className="text-[#6b5b48]">Amount</dt><dd><strong className="tabular text-lg">{inr(amt)}</strong><br /><span className="text-sm">{rupeesInWords(amt)}</span></dd>
                <dt className="text-[#6b5b48]">Towards</dt>
                <dd>{member ? <>Founding membership: <Fill>what this payment covers</Fill></> : (q.get("p") || "Wherever it is most needed")}</dd>
                <dt className="text-[#6b5b48]">Mode of payment</dt><dd>{mode}{mode === "Bank transfer" && utr ? <>, UTR <span className="tabular">{utr}</span></> : null}</dd>
                {donorPan ? <><dt className="text-[#6b5b48]">Donor PAN</dt><dd className="tabular">{donorPan}</dd></> : null}
                <dt className="text-[#6b5b48]">Website reference</dt><dd className="tabular">{ref}</dd>
              </dl>

              <footer className="relative mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-[rgb(201_162_74/0.5)] pt-6 text-sm">
                <p className="max-w-[40ch] text-xs leading-relaxed text-[#6b5b48]">
                  Issued by {org.name} after the payment was confirmed.{" "}
                  {member
                    ? "This is a founding-member payment, not a donation, and is not eligible for deduction under section 80G."
                    : mode !== "Bank transfer" && amt > 2000
                      ? "Cash donations above ₹2,000 are not eligible for deduction under section 80G."
                      : `This donation is eligible for deduction under section 80G of the Income Tax Act, 1961. 80G registration: ${org.eightyG}.`}
                </p>
                <div className="text-center">
                  <div className="mx-auto h-10 w-44 border-b border-[#2a2118]" />
                  <p className="mt-1"><Fill>Authorised signatory, name and title</Fill></p>
                  <p className="text-xs text-[#6b5b48]">For {org.name}</p>
                </div>
              </footer>
            </article>
          </section>
        ) : null}
      </div>
    </div>
  );
}
