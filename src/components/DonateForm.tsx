"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import { lines, mailtoHref, mobilePattern, whatsappHref } from "@/lib/compose";
import { Honeypot } from "@/components/Honeypot";
import { makeRef, receiptsLive, recordSubmission, sampleReceiptHref } from "@/lib/receipts";
import { FormDone, type DoneStrings } from "./FormDone";
import { emailPattern } from "./MemberForm";

type Strings = DoneStrings & {
  email: string; emailHint: string; invalidEmail: string; pan: string; panHint: string; invalidPan: string; send: string; sending: string; howDirect: string; failed: string;
  name: string; mobile: string; amount: string; other: string; otherLabel: string; purpose: string;
  note: string; sendEmail: string; sendWhatsApp: string; howEmail: string; howWhatsApp: string;
  required: string; invalidMobile: string; invalidAmount: string;
  method: string; methods: readonly string[]; reference: string; referenceHint: string;
};

const presets = [501, 1100, 2100, 5100, 11000];
// en-IN on both server and browser: other locale data can differ between them and break hydration.
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function DonateForm({
  strings,
  purposes,
  to,
  whatsapp,
  locale,
}: {
  strings: Strings;
  locale: Locale;
  /** label: shown to the visitor; value: the English label sent to the foundation */
  purposes: { label: string; value: string }[];
  to: string | null;
  whatsapp: string;
}) {
  const [choice, setChoice] = useState<string>(String(presets[1]));
  const [method, setMethod] = useState<0 | 1>(0);
  const [errors, setErrors] = useState<Partial<Record<"name" | "mobile" | "amount" | "email" | "pan", string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "failed">("idle");
  const [done, setDone] = useState<null | { ref: string; sample: string; wa: string; mail: string | null }>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const amount = choice === "other" ? Math.floor(Number(v("other").replace(/[,\s₹]/g, ""))) : Number(choice);
    const next: typeof errors = {};
    if (!v("name")) next.name = strings.required;
    if (!v("mobile")) next.mobile = strings.required;
    else if (!mobilePattern.test(v("mobile"))) next.mobile = strings.invalidMobile;
    if (!Number.isFinite(amount) || amount < 1) next.amount = strings.invalidAmount;
    if (v("email") && !emailPattern.test(v("email"))) next.email = strings.invalidEmail;
    const pan = v("pan").toUpperCase();
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) next.pan = strings.invalidPan;
    setErrors(next);
    if (next.name || next.mobile || next.amount || next.email || next.pan) {
      const id = next.name ? "d-name" : next.mobile ? "d-mobile" : next.email ? "d-email" : next.pan ? "d-pan" : choice === "other" ? "d-other" : `d-amt-${choice}`;
      document.getElementById(id)?.focus();
      return;
    }
    const purpose = purposes.find((p) => p.value === v("purpose"))?.value ?? purposes[0].value;
    const ref = makeRef("donation");
    const mode = method === 0 ? "Bank transfer" : "Cash in person";
    const body = lines([
      ["Reference", ref],
      ["Name", v("name")],
      ["Phone", v("mobile")],
      ["Email", v("email")],
      ["PAN (for 80G)", pan],
      ["Amount", `₹${amount.toLocaleString("en-IN")}`],
      ["Purpose", purpose],
      // Always sent in English, like the purpose, so the foundation reads one language.
      ["Given by", mode],
      ["Transaction reference (UTR)", method === 0 ? v("reference") : ""],
      ["Note", v("note")],
    ]);
    const subject = `Donation: ₹${amount.toLocaleString("en-IN")} by ${method === 0 ? "bank transfer" : "cash"} for ${purpose} (${ref})`;
    const utr = method === 0 ? v("reference") : "";

    setState("sending");
    try {
      if (!f.get("website")) await recordSubmission("donation", ref, {
        name: v("name"), phone: v("mobile"), email: v("email"), amount: String(amount), purpose, mode, utr, pan, note: v("note"), lang: locale,
      });
    } catch {
      setState("failed");
      return;
    }
    setState("idle");
    setDone({
      ref,
      sample: sampleReceiptHref(locale, "donation", ref, { n: v("name"), e: v("email"), a: String(amount), p: purpose, md: mode, u: utr, pan }),
      wa: whatsappHref(whatsapp, `${subject}\n\n${body}`),
      mail: to ? mailtoHref(to, subject, body) : null,
    });
  }

  if (done) {
    return (
      <FormDone
        live={receiptsLive}
        refNo={done.ref}
        strings={strings}
        sampleHref={done.sample}
        whatsappHref={done.wa}
        mailHref={done.mail}
        sendEmail={strings.sendEmail}
        sendWhatsApp={strings.sendWhatsApp}
      />
    );
  }

  const err = (k: keyof typeof errors, id: string) =>
    errors[k] ? <p id={id} className="mt-1.5 text-sm text-[#b3261e]">{errors[k]}</p> : null;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-7">
      <Honeypot />
      <fieldset>
        <legend className="label">{strings.method}</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {strings.methods.map((label, i) => (
            <label key={label} className="relative">
              <input type="radio" name="method" value={i} checked={method === i} onChange={() => setMethod(i as 0 | 1)} className="peer sr-only" />
              <span className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-sm border border-line bg-marble px-4 transition-colors duration-200 hover:border-gold peer-checked:border-gold peer-checked:bg-[rgb(168_122_38/0.08)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${method === i ? "border-gold" : "border-ink-soft/50"}`}>
                  {method === i ? <span className="h-2.5 w-2.5 rounded-full bg-gold" /> : null}
                </span>
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset aria-describedby={errors.amount ? "de-amount" : undefined}>
        <legend className="label">{strings.amount}</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {[...presets.map(String), "other"].map((p) => (
            <label key={p} className="relative">
              <input
                id={p === "other" ? "d-amt-other" : `d-amt-${p}`}
                type="radio"
                name="amount"
                value={p}
                checked={choice === p}
                onChange={() => {
                  setChoice(p);
                  if (p === "other") requestAnimationFrame(() => otherRef.current?.focus());
                }}
                className="peer sr-only"
              />
              <span className="tabular flex min-h-[48px] cursor-pointer items-center rounded-full border border-line bg-marble px-5 text-[1.05rem] transition-colors duration-200 hover:border-gold peer-checked:border-gold peer-checked:bg-gold peer-checked:text-[#fffaf0] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                {p === "other" ? strings.other : rupees(Number(p))}
              </span>
            </label>
          ))}
        </div>
        {choice === "other" ? (
          <div className="mt-4 max-w-[240px]">
            <label htmlFor="d-other" className="label">{strings.otherLabel}</label>
            <div className="relative">
              <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">₹</span>
              <input
                ref={otherRef}
                id="d-other"
                name="other"
                inputMode="numeric"
                autoComplete="off"
                maxLength={9}
                aria-invalid={errors.amount ? "true" : undefined}
                aria-describedby={errors.amount ? "de-amount" : undefined}
                className="field tabular !pl-9"
              />
            </div>
          </div>
        ) : null}
        {err("amount", "de-amount")}
      </fieldset>

      <div>
        <label htmlFor="d-purpose" className="label">{strings.purpose}</label>
        <select id="d-purpose" name="purpose" defaultValue={purposes[0].value} className="field">
          {purposes.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="d-name" className="label">{strings.name}</label>
          <input id="d-name" name="name" autoComplete="name" maxLength={120} required aria-invalid={errors.name ? "true" : undefined} aria-describedby={errors.name ? "de-name" : undefined} className="field" />
          {err("name", "de-name")}
        </div>
        <div>
          <label htmlFor="d-mobile" className="label">{strings.mobile}</label>
          <input id="d-mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" maxLength={16} required aria-invalid={errors.mobile ? "true" : undefined} aria-describedby={errors.mobile ? "de-mobile" : undefined} className="field" />
          {err("mobile", "de-mobile")}
        </div>
      </div>

      <div>
        <label htmlFor="d-email" className="label">{strings.email}</label>
        <input id="d-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={160} aria-invalid={errors.email ? "true" : undefined} aria-describedby={errors.email ? "de-email" : "d-email-hint"} className="field sm:max-w-[420px]" />
        {errors.email ? err("email", "de-email") : <p id="d-email-hint" className="mt-1.5 text-sm text-ink-soft">{strings.emailHint}</p>}
      </div>

      <div>
        <label htmlFor="d-pan" className="label">{strings.pan}</label>
        <input id="d-pan" name="pan" autoComplete="off" autoCapitalize="characters" maxLength={10} aria-invalid={errors.pan ? "true" : undefined} aria-describedby={errors.pan ? "de-pan" : "d-pan-hint"} className="field tabular uppercase sm:max-w-[240px]" />
        {errors.pan ? err("pan", "de-pan") : <p id="d-pan-hint" className="mt-1.5 text-sm text-ink-soft">{strings.panHint}</p>}
      </div>

      {method === 0 ? (
        <div>
          <label htmlFor="d-ref" className="label">{strings.reference}</label>
          <input id="d-ref" name="reference" autoComplete="off" maxLength={40} aria-describedby="d-ref-hint" className="field tabular sm:max-w-[360px]" />
          <p id="d-ref-hint" className="mt-1.5 text-sm text-ink-soft">{strings.referenceHint}</p>
        </div>
      ) : null}

      <div>
        <label htmlFor="d-note" className="label">{strings.note}</label>
        <textarea id="d-note" name="note" rows={3} maxLength={1000} className="field resize-y" />
      </div>

      <div>
        <button type="submit" disabled={state === "sending"} className="btn btn-primary">
          {state === "sending" ? strings.sending : strings.send}
        </button>
        <p className="mt-3 max-w-[60ch] text-sm text-ink-soft">{receiptsLive ? strings.howDirect : to ? strings.howEmail : strings.howWhatsApp}</p>
        {state === "failed" ? <p role="alert" className="mt-2 text-sm text-[#b3261e]">{strings.failed}</p> : null}
      </div>
    </form>
  );
}
