"use client";

import { useActionState } from "react";
import { submitEnquiry, type ContactState } from "@/app/[locale]/contact/actions";

type Strings = {
  name: string; email: string; mobile: string; subject: string; message: string; submit: string; sending: string;
  success: string; error: string; notConfigured: string; required: string; invalidEmail: string; invalidMobile: string;
};

export function ContactForm({ strings, locale }: { strings: Strings; locale: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitEnquiry, { status: "idle" });
  const v = state.values ?? {};
  const err = (k: keyof NonNullable<ContactState["errors"]>) => {
    const e = state.errors?.[k];
    return e === "email" ? strings.invalidEmail : e === "mobile" ? strings.invalidMobile : e ? strings.required : null;
  };

  if (state.status === "success") {
    return (
      <div role="status" className="rounded border border-gold bg-marble-2 p-8">
        <svg aria-hidden viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="20" /><path d="M15 24.5l6 6 12-13" />
        </svg>
        <p className="mt-4 text-lg">{strings.success}</p>
      </div>
    );
  }

  const field = (name: "name" | "email" | "mobile" | "subject", label: string, type = "text", extra: Record<string, string> = {}) => {
    const e = err(name);
    return (
      <div>
        <label htmlFor={`f-${name}`} className="label">{label}</label>
        <input
          id={`f-${name}`}
          name={name}
          type={type}
          required
          defaultValue={v[name]}
          aria-invalid={e ? "true" : undefined}
          aria-describedby={e ? `e-${name}` : undefined}
          className="field"
          {...extra}
        />
        {e ? <p id={`e-${name}`} className="mt-1.5 text-sm text-[#b3261e]">{e}</p> : null}
      </div>
    );
  };

  return (
    <form action={action} noValidate className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", strings.name, "text", { autoComplete: "name", maxLength: "120" })}
        {field("email", strings.email, "email", { autoComplete: "email", maxLength: "200" })}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field("mobile", strings.mobile, "tel", { autoComplete: "tel", inputMode: "tel", maxLength: "16" })}
        {field("subject", strings.subject, "text", { maxLength: "200" })}
      </div>
      <div>
        <label htmlFor="f-message" className="label">{strings.message}</label>
        <textarea
          id="f-message"
          name="message"
          required
          rows={6}
          maxLength={4000}
          defaultValue={v.message}
          aria-invalid={err("message") ? "true" : undefined}
          aria-describedby={err("message") ? "e-message" : undefined}
          className="field resize-y"
        />
        {err("message") ? <p id="e-message" className="mt-1.5 text-sm text-[#b3261e]">{err("message")}</p> : null}
      </div>

      {state.status === "error" && !state.errors ? <p role="alert" className="text-[#b3261e]">{strings.error}</p> : null}
      {state.status === "not_configured" ? <p role="alert" className="text-ink-soft">{strings.notConfigured}</p> : null}

      <div>
        <button type="submit" disabled={pending} aria-disabled={pending} className="btn btn-primary">
          {pending ? (
            <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
            </svg>
          ) : null}
          {pending ? strings.sending : strings.submit}
        </button>
      </div>
    </form>
  );
}
