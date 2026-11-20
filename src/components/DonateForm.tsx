"use client";

import { useRef, useState, type FormEvent } from "react";
import { lines, mailtoHref, mobilePattern, whatsappHref } from "@/lib/compose";
import { SendButtons } from "./SendButtons";

type Strings = {
  name: string; mobile: string; amount: string; other: string; otherLabel: string; purpose: string;
  note: string; sendEmail: string; sendWhatsApp: string; howEmail: string; howWhatsApp: string;
  required: string; invalidMobile: string; invalidAmount: string;
};

const presets = [501, 1100, 2100, 5100, 11000];
// en-IN on both server and browser: other locale data can differ between them and break hydration.
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function DonateForm({
  strings,
  purposes,
  to,
  whatsapp,
}: {
  strings: Strings;
  /** label: shown to the visitor; value: the English label sent to the foundation */
  purposes: { label: string; value: string }[];
  to: string | null;
  whatsapp: string;
}) {
  const [choice, setChoice] = useState<string>(String(presets[1]));
  const [errors, setErrors] = useState<Partial<Record<"name" | "mobile" | "amount", string>>>({});
  const via = useRef<"email" | "whatsapp">(to ? "email" : "whatsapp");
  const otherRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const amount = choice === "other" ? Math.floor(Number(v("other").replace(/[,\s₹]/g, ""))) : Number(choice);
    const next: typeof errors = {};
    if (!v("name")) next.name = strings.required;
    if (!v("mobile")) next.mobile = strings.required;
    else if (!mobilePattern.test(v("mobile"))) next.mobile = strings.invalidMobile;
    if (!Number.isFinite(amount) || amount < 1) next.amount = strings.invalidAmount;
    setErrors(next);
    if (next.name || next.mobile || next.amount) {
      const id = next.name ? "d-name" : next.mobile ? "d-mobile" : choice === "other" ? "d-other" : `d-amt-${choice}`;
      document.getElementById(id)?.focus();
      return;
    }
    const purpose = purposes.find((p) => p.value === v("purpose"))?.value ?? purposes[0].value;
    const body = lines([
      ["Name", v("name")],
      ["Phone", v("mobile")],
      ["Amount", `₹${amount.toLocaleString("en-IN")}`],
      ["Purpose", purpose],
      ["Note", v("note")],
    ]);
    const subject = `Donation offer: ₹${amount.toLocaleString("en-IN")} for ${purpose}`;
    window.location.href = via.current === "email" && to ? mailtoHref(to, subject, body) : whatsappHref(whatsapp, `${subject}\n\n${body}`);
  }

  const err = (k: keyof typeof errors, id: string) =>
    errors[k] ? <p id={id} className="mt-1.5 text-sm text-[#b3261e]">{errors[k]}</p> : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-7">
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
        <label htmlFor="d-note" className="label">{strings.note}</label>
        <textarea id="d-note" name="note" rows={3} maxLength={1000} className="field resize-y" />
      </div>

      <SendButtons
        email={to}
        sendEmail={strings.sendEmail}
        sendWhatsApp={strings.sendWhatsApp}
        howEmail={strings.howEmail}
        howWhatsApp={strings.howWhatsApp}
        onSend={(w) => { via.current = w; }}
      />
    </form>
  );
}
