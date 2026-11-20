"use client";

import { useRef, useState, type FormEvent } from "react";
import { lines, mailtoHref, mobilePattern, whatsappHref } from "@/lib/compose";
import { SendButtons } from "./SendButtons";

type Strings = {
  name: string; email: string; mobile: string; subject: string; message: string;
  sendEmail: string; sendWhatsApp: string; howEmail: string; howWhatsApp: string;
  required: string; invalidMobile: string;
};
type Field = "name" | "mobile" | "subject" | "message";

export function ContactForm({ strings, to, whatsapp }: { strings: Strings; to: string | null; whatsapp: string }) {
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const via = useRef<"email" | "whatsapp">(to ? "email" : "whatsapp");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const next: Partial<Record<Field, string>> = {};
    (["name", "mobile", "subject", "message"] as Field[]).forEach((k) => { if (!v(k)) next[k] = strings.required; });
    if (v("mobile") && !mobilePattern.test(v("mobile"))) next.mobile = strings.invalidMobile;
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    const body = lines([["Name", v("name")], ["Mobile", v("mobile")], ["Email", v("email")], ["Message", "\n" + v("message")]]);
    const subject = `Website enquiry: ${v("subject")}`;
    window.location.href = via.current === "email" && to ? mailtoHref(to, subject, body) : whatsappHref(whatsapp, `${subject}\n\n${body}`);
  }

  const input = (name: Field | "email", label: string, type = "text", extra: Record<string, string> = {}) => {
    const err = name === "email" ? undefined : errors[name];
    return (
      <div>
        <label htmlFor={`c-${name}`} className="label">{label}</label>
        <input
          id={`c-${name}`}
          name={name}
          type={type}
          required={name !== "email"}
          aria-invalid={err ? "true" : undefined}
          aria-describedby={err ? `ce-${name}` : undefined}
          className="field"
          {...extra}
        />
        {err ? <p id={`ce-${name}`} className="mt-1.5 text-sm text-[#b3261e]">{err}</p> : null}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {input("name", strings.name, "text", { autoComplete: "name", maxLength: "120" })}
        {input("mobile", strings.mobile, "tel", { autoComplete: "tel", inputMode: "tel", maxLength: "16" })}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {input("email", strings.email, "email", { autoComplete: "email", maxLength: "200" })}
        {input("subject", strings.subject, "text", { maxLength: "200" })}
      </div>
      <div>
        <label htmlFor="c-message" className="label">{strings.message}</label>
        <textarea
          id="c-message"
          name="message"
          required
          rows={6}
          maxLength={2000}
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "ce-message" : undefined}
          className="field resize-y"
        />
        {errors.message ? <p id="ce-message" className="mt-1.5 text-sm text-[#b3261e]">{errors.message}</p> : null}
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
