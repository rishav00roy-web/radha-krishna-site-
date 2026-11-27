"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import { lines, mailtoHref, mobilePattern, whatsappHref } from "@/lib/compose";
import { makeRef, receiptsLive, recordSubmission, sampleReceiptHref } from "@/lib/receipts";
import { FormDone, type DoneStrings } from "./FormDone";

type Strings = DoneStrings & {
  name: string; mobile: string; email: string; emailHint: string; place: string; visit: string; note: string;
  required: string; invalidMobile: string; invalidEmail: string;
  sendEmail: string; sendWhatsApp: string; howEmail: string; howWhatsApp: string;
  send: string; sending: string; howDirect: string; failed: string;
};
type Field = "name" | "mobile" | "email";

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Founding-member sign-up: an expression of interest, never a payment. */
export function MemberForm({ strings, locale, to, whatsapp }: { strings: Strings; locale: Locale; to: string | null; whatsapp: string }) {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [state, setState] = useState<"idle" | "sending" | "failed">("idle");
  const [done, setDone] = useState<null | { ref: string; sample: string; wa: string; mail: string | null }>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const next: Partial<Record<Field, string>> = {};
    if (!v("name")) next.name = strings.required;
    if (!v("mobile")) next.mobile = strings.required;
    else if (!mobilePattern.test(v("mobile"))) next.mobile = strings.invalidMobile;
    if (v("email") && !emailPattern.test(v("email"))) next.email = strings.invalidEmail;
    setErrors(next);
    const first = (["name", "mobile", "email"] as Field[]).find((k) => next[k]);
    if (first) {
      document.getElementById(`m-${first}`)?.focus();
      return;
    }

    const ref = makeRef("member");
    const fields = { name: v("name"), phone: v("mobile"), email: v("email"), place: v("place"), visit: f.get("visit") ? "Yes" : "No", note: v("note"), lang: locale };
    // Labels stay in English so the foundation reads one format.
    const body = lines([
      ["Reference", ref], ["Name", fields.name], ["Phone", fields.phone], ["Email", fields.email],
      ["Town or district", fields.place], ["Wants to visit the site", fields.visit], ["Note", fields.note],
    ]);
    const subject = `Founding member interest: ${fields.name} (${ref})`;

    setState("sending");
    try {
      await recordSubmission("member", ref, fields);
    } catch {
      setState("failed");
      return;
    }
    setState("idle");
    setDone({
      ref,
      sample: sampleReceiptHref(locale, "member", ref, { n: fields.name, e: fields.email, pl: fields.place }),
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

  const err = (k: Field) => (errors[k] ? <p id={`me-${k}`} className="mt-1.5 text-sm text-[#b3261e]">{errors[k]}</p> : null);
  const aria = (k: Field) => ({ "aria-invalid": errors[k] ? ("true" as const) : undefined, "aria-describedby": errors[k] ? `me-${k}` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="m-name" className="label">{strings.name}</label>
          <input id="m-name" name="name" autoComplete="name" maxLength={120} required className="field" {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="m-mobile" className="label">{strings.mobile}</label>
          <input id="m-mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" maxLength={16} required className="field" {...aria("mobile")} />
          {err("mobile")}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="m-email" className="label">{strings.email}</label>
          <input id="m-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={160} className="field" aria-invalid={errors.email ? "true" : undefined} aria-describedby={errors.email ? "me-email" : "m-email-hint"} />
          {errors.email ? err("email") : <p id="m-email-hint" className="mt-1.5 text-sm text-ink-soft">{strings.emailHint}</p>}
        </div>
        <div>
          <label htmlFor="m-place" className="label">{strings.place}</label>
          <input id="m-place" name="place" autoComplete="address-level2" maxLength={120} className="field" />
        </div>
      </div>
      <label className="flex min-h-[48px] cursor-pointer items-center gap-3">
        <input type="checkbox" name="visit" value="yes" className="h-5 w-5 shrink-0 accent-[var(--gold)]" />
        <span>{strings.visit}</span>
      </label>
      <div>
        <label htmlFor="m-note" className="label">{strings.note}</label>
        <textarea id="m-note" name="note" rows={3} maxLength={1000} className="field resize-y" />
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
