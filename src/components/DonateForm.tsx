"use client";

import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { lines, mailtoHref, mobilePattern, whatsappHref } from "@/lib/compose";
import { SendButtons } from "./SendButtons";

type D = Dictionary["donate"];

const presets = [501, 1100, 2100, 5100, 11000];
// en-IN on both server and browser: other locale data can differ between them and break hydration.
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const pinPattern = /^\d{6}$/;
const panPattern = /^[A-Z]{5}\d{4}[A-Z]$/;

/**
 * What the form sends, with the English label for each field. The sheet uses the keys; when there is no
 * sheet yet, the labels head the lines of the email or WhatsApp message. Choices are always sent in English,
 * so the foundation reads one language whatever language the visitor used.
 */
const LABELS = {
  kind: "Giving",
  method: "Given by",
  amount: "Amount (₹)",
  purpose: "Purpose",
  paidOn: "Paid on",
  paidFrom: "Paid from",
  reference: "Transaction reference (UTR)",
  owner: "Owner as in land records",
  ownerRelation: "Relation to owner",
  landDistrict: "Land: district",
  circle: "Revenue circle",
  mouza: "Mouza",
  village: "Village",
  dag: "Dag no.",
  patta: "Patta no.",
  pattaType: "Patta type",
  bigha: "Bigha",
  katha: "Katha",
  lessa: "Lessa",
  landUse: "Land type",
  papers: "Papers",
  claims: "Loan, dispute or claim",
  name: "Name",
  relative: "Father's / spouse's name",
  organisation: "Organisation",
  mobile: "Phone",
  email: "Email",
  address: "Address",
  district: "District",
  state: "State",
  pin: "PIN",
  pan: "PAN",
  note: "Note",
} as const;
type Key = keyof typeof LABELS;
type Entry = Partial<Record<Key, string>>;

// The order errors are checked in, top of the form to bottom, so the first one gets focus.
const ERROR_ORDER = [
  "amount", "paidOn", "owner", "landDistrict", "circle", "mouza", "village", "dag", "patta", "bigha",
  "name", "relative", "mobile", "email", "address", "district", "state", "pin", "pan", "consent",
] as const;

export function DonateForm({
  kind,
  g,
  en,
  locale,
  to,
  whatsapp,
  sheetUrl,
}: {
  /** "money" on the Donate page; "land" on the founding member page. */
  kind: "money" | "land";
  /** The Donate page's text in the visitor's language. */
  g: D;
  /** The same text in English, for the values sent to the foundation. */
  en: D;
  locale: string;
  to: string | null;
  whatsapp: string;
  /** The foundation's Google Sheet web app. Null until it is set up: the form then uses email or WhatsApp. */
  sheetUrl: string | null;
}) {
  const [method, setMethod] = useState(0); // 0 bank transfer, 1 cash
  const [choice, setChoice] = useState<string>(String(presets[1]));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [failed, setFailed] = useState<Entry | null>(null);
  const via = useRef<"email" | "whatsapp">(to ? "email" : "whatsapp");
  const otherRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const failRef = useRef<HTMLDivElement>(null);
  const money = kind === "money";
  const bank = money && method === 0;

  useEffect(() => {
    if (state === "sent") doneRef.current?.focus();
    if (state === "failed") failRef.current?.focus();
  }, [state]);

  function compose(entry: Entry) {
    const subject = entry.kind === en.kinds[1]
      ? `Land offer: ${entry.village}, dag ${entry.dag}`
      : `Donation: ₹${Number(entry.amount).toLocaleString("en-IN")} by ${String(entry.method).toLowerCase()} for ${entry.purpose}`;
    const body = lines((Object.keys(LABELS) as Key[]).map((k): [string, string] => [LABELS[k], entry[k] ?? ""]));
    return { subject, body, whatsappLink: whatsappHref(whatsapp, `${subject}\n\n${body}`) };
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const pick = (list: readonly string[], k: string) => list[Number(v(k))] ?? "";
    const next: Record<string, string> = {};
    const need = (...keys: string[]) => keys.forEach((k) => { if (!v(k)) next[k] = g.required; });

    need("name", "mobile", "address", "district", "state", "pin");
    // People type numbers with spaces or dashes ("98640 12345"); check and send it without them.
    const mobile = v("mobile").replace(/[\s-]/g, "");
    if (mobile && !mobilePattern.test(mobile)) next.mobile = g.invalidMobile;
    if (v("email") && !emailPattern.test(v("email"))) next.email = g.invalidEmail;
    if (v("pin") && !pinPattern.test(v("pin"))) next.pin = g.invalidPin;
    const pan = v("pan").toUpperCase().replace(/\s/g, "");
    if (pan && !panPattern.test(pan)) next.pan = g.invalidPan;

    let amount = 0;
    if (money) {
      amount = choice === "other" ? Math.floor(Number(v("other").replace(/[,\s₹]/g, ""))) : Number(choice);
      if (!Number.isFinite(amount) || amount < 1) next.amount = g.invalidAmount;
      if (bank) need("paidOn");
    } else {
      need("relative", "owner", "landDistrict", "circle", "mouza", "village", "dag", "patta");
      const area = ["bigha", "katha", "lessa"].map((k) => (v(k) ? Number(v(k)) : 0));
      if (area.some((n) => !Number.isFinite(n) || n < 0) || !area.some((n) => n > 0)) next.bigha = g.invalidArea;
    }
    if (!f.get("consent")) next.consent = g.consentRequired;

    setErrors(next);
    const first = ERROR_ORDER.find((k) => next[k]);
    if (first) {
      const id = first === "amount" ? (choice === "other" ? "d-other" : `d-amt-${choice}`) : `d-${first}`;
      document.getElementById(id)?.focus();
      return;
    }

    const entry: Entry = {
      kind: en.kinds[money ? 0 : 1],
      name: v("name"), relative: v("relative"), organisation: v("organisation"), mobile, email: v("email"),
      address: v("address"), district: v("district"), state: v("state"), pin: v("pin"), pan,
      note: v("note"),
    };
    if (money) {
      Object.assign(entry, {
        method: en.methods[method],
        amount: String(amount),
        purpose: pick(en.purposes, "purpose") || en.purposes[0],
        paidOn: bank ? v("paidOn") : "",
        paidFrom: bank ? v("paidFrom") : "",
        reference: bank ? v("reference") : "",
      });
    } else {
      Object.assign(entry, {
        owner: v("owner"), ownerRelation: pick(en.ownerRelations, "ownerRelation"),
        landDistrict: v("landDistrict"), circle: v("circle"), mouza: v("mouza"), village: v("village"),
        dag: v("dag"), patta: v("patta"), pattaType: pick(en.pattaTypes, "pattaType"),
        bigha: v("bigha"), katha: v("katha"), lessa: v("lessa"), landUse: pick(en.landUses, "landUse"),
        papers: f.getAll("papers").map((i) => en.paperTypes[Number(i)]).filter(Boolean).join(", "),
        claims: pick(en.claimOptions, "claims"),
      });
    }

    if (!sheetUrl) {
      // No sheet yet: hand the details to the visitor's email app or WhatsApp.
      const { subject, body, whatsappLink } = compose(entry);
      window.location.href = via.current === "email" && to ? mailtoHref(to, subject, body) : whatsappLink;
      return;
    }

    setState("sending");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      // text/plain keeps this a "simple" request, which Google Apps Script accepts from another site.
      const res = await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...entry, locale, website: v("website") }),
        signal: controller.signal,
      });
      const out = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !out?.ok) throw new Error("not saved");
      setState("sent");
    } catch {
      setFailed(entry);
      setState("failed");
    } finally {
      clearTimeout(timer);
    }
  }

  if (state === "sent") {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="rounded border border-gold/40 bg-marble p-7 outline-none sm:p-9">
        <h3 className="display-md">{g.thanksTitle}</h3>
        <p className="mt-3 text-ink-soft">{money ? g.thanksMoney : g.thanksLand}</p>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  const opt = (text: string) => <span className="text-ink-soft/80"> ({text})</span>;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8">
      {/* Bots fill in every box; people never see this one. */}
      <div aria-hidden style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {money ? (
        <Section key="money" title={g.giftTitle}>
          <Choice legend={g.method} name="method" options={g.methods} value={method} onChange={setMethod} />

          <fieldset aria-describedby={err("amount") ? "d-amount-err" : undefined}>
            <legend className="label">{g.amount}</legend>
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
                    {p === "other" ? g.other : rupees(Number(p))}
                  </span>
                </label>
              ))}
            </div>
            {choice === "other" ? (
              <div className="mt-4 max-w-[240px]">
                <label htmlFor="d-other" className="label">{g.otherLabel}</label>
                <div className="relative">
                  <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft">₹</span>
                  <input
                    ref={otherRef}
                    id="d-other"
                    name="other"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={11}
                    aria-invalid={err("amount") ? "true" : undefined}
                    aria-describedby={err("amount") ? "d-amount-err" : undefined}
                    className="field tabular !pl-9"
                  />
                </div>
              </div>
            ) : null}
            <ErrorText id="d-amount-err" text={err("amount")} />
          </fieldset>

          <Select id="d-purpose" name="purpose" label={g.purpose} options={g.purposes} />

          {bank ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="d-paidOn" name="paidOn" label={g.paidOn} type="date" required error={err("paidOn")} />
              <Field id="d-paidFrom" name="paidFrom" label={<>{g.paidFrom}{opt(g.optional)}</>} maxLength={100} />
              <Field id="d-reference" name="reference" label={g.reference} hint={g.referenceHint} maxLength={40} autoComplete="off" className="sm:col-span-2" inputClassName="tabular sm:max-w-[360px]" />
            </div>
          ) : null}
        </Section>
      ) : (
        <Section key="land" title={g.landTitle}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="d-owner" name="owner" label={g.owner} required maxLength={180} error={err("owner")} className="sm:col-span-2" />
            <Select id="d-ownerRelation" name="ownerRelation" label={g.ownerRelation} options={g.ownerRelations} className="sm:col-span-2" />
            <Field id="d-landDistrict" name="landDistrict" label={g.landDistrict} required maxLength={60} error={err("landDistrict")} />
            <Field id="d-circle" name="circle" label={g.circle} required maxLength={60} error={err("circle")} />
            <Field id="d-mouza" name="mouza" label={g.mouza} required maxLength={60} error={err("mouza")} />
            <Field id="d-village" name="village" label={g.village} required maxLength={100} error={err("village")} />
            <Field id="d-dag" name="dag" label={g.dag} required maxLength={60} error={err("dag")} />
            <Field id="d-patta" name="patta" label={g.patta} required maxLength={60} error={err("patta")} />
            <Select id="d-pattaType" name="pattaType" label={g.pattaType} options={g.pattaTypes} />
            <Select id="d-landUse" name="landUse" label={g.landUse} options={g.landUses} />
          </div>

          <fieldset aria-describedby={`d-area-hint${err("bigha") ? " d-area-err" : ""}`}>
            <legend className="label">{g.area}</legend>
            <div className="grid max-w-[420px] grid-cols-3 gap-3">
              {(["bigha", "katha", "lessa"] as const).map((k) => (
                <div key={k}>
                  <label htmlFor={`d-${k}`} className="mb-1 block text-sm text-ink-soft">{g[k]}</label>
                  <input id={`d-${k}`} name={k} inputMode="decimal" maxLength={7} autoComplete="off" aria-invalid={err("bigha") ? "true" : undefined} className="field tabular" />
                </div>
              ))}
            </div>
            <p id="d-area-hint" className="mt-1.5 text-sm text-ink-soft">{g.areaHint}</p>
            <ErrorText id="d-area-err" text={err("bigha")} />
          </fieldset>

          <fieldset>
            <legend className="label">{g.papers}</legend>
            <div className="mt-1 flex flex-wrap gap-x-6 gap-y-3">
              {g.paperTypes.map((label, i) => (
                <label key={label} className="flex min-h-[32px] cursor-pointer items-center gap-2.5">
                  <input type="checkbox" name="papers" value={i} className="h-5 w-5 accent-gold" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <Select id="d-claims" name="claims" label={g.claims} options={g.claimOptions} className="sm:max-w-[360px]" />
        </Section>
      )}

      <Section title={g.donorTitle}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="d-name" name="name" label={g.name} required autoComplete="name" maxLength={120} error={err("name")} />
          <Field
            id="d-relative"
            name="relative"
            label={money ? <>{g.relative}{opt(g.optional)}</> : g.relative}
            required={!money}
            maxLength={120}
            error={err("relative")}
          />
          <Field id="d-organisation" name="organisation" label={<>{g.organisationName}{opt(g.optional)}</>} autoComplete="organization" maxLength={150} className="sm:col-span-2" />
          <Field id="d-mobile" name="mobile" label={g.mobile} hint={g.mobileHint} type="tel" inputMode="tel" autoComplete="tel" required maxLength={16} error={err("mobile")} />
          <Field id="d-email" name="email" label={<>{g.email}{opt(g.optional)}</>} hint={g.emailHint} type="email" autoComplete="email" maxLength={200} error={err("email")} />
          <Field id="d-address" name="address" label={g.address} autoComplete="street-address" required maxLength={250} error={err("address")} className="sm:col-span-2" />
          <Field id="d-district" name="district" label={g.district} required maxLength={60} error={err("district")} />
          <Field id="d-state" name="state" label={g.state} autoComplete="address-level1" required maxLength={60} defaultValue={g.stateDefault} error={err("state")} />
          <Field id="d-pin" name="pin" label={g.pin} inputMode="numeric" autoComplete="postal-code" required maxLength={6} error={err("pin")} inputClassName="tabular" />
          <Field id="d-pan" name="pan" label={<>{g.pan}{opt(g.optional)}</>} hint={g.panHint} autoComplete="off" maxLength={10} error={err("pan")} inputClassName="tabular uppercase" />
        </div>
      </Section>

      <div>
        <label htmlFor="d-note" className="label">{g.note}</label>
        <textarea id="d-note" name="note" rows={3} maxLength={1000} className="field resize-y" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            id="d-consent"
            type="checkbox"
            name="consent"
            value="yes"
            aria-invalid={err("consent") ? "true" : undefined}
            aria-describedby={err("consent") ? "d-consent-err" : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-gold"
          />
          <span className="text-[0.98rem] text-ink-soft">{g.consent}</span>
        </label>
        <ErrorText id="d-consent-err" text={err("consent")} />
      </div>

      {sheetUrl ? (
        <div>
          <button type="submit" disabled={state === "sending"} aria-busy={state === "sending"} className="btn btn-primary disabled:opacity-70">
            {state === "sending" ? g.sending : g.submit}
          </button>
          <p className="mt-3 max-w-[60ch] text-sm text-ink-soft">{g.howSheet}</p>
          {state === "failed" && failed ? (
            <div ref={failRef} tabIndex={-1} role="alert" className="mt-5 rounded border border-[#b3261e]/40 bg-[#fdf1f0] p-5 outline-none">
              <p className="text-[#8a1f17]">{g.sendFailed}</p>
              <a href={compose(failed).whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-quiet mt-4 text-[#8a1f17]">
                {g.sendWhatsApp}
              </a>
            </div>
          ) : null}
        </div>
      ) : (
        <SendButtons
          email={to}
          sendEmail={g.sendEmail}
          sendWhatsApp={g.sendWhatsApp}
          howEmail={g.howEmail}
          howWhatsApp={g.howWhatsApp}
          onSend={(w) => { via.current = w; }}
        />
      )}
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line pt-6">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {children}
    </section>
  );
}

function ErrorText({ id, text }: { id: string; text?: string }) {
  return text ? <p id={id} className="mt-1.5 text-sm text-[#b3261e]">{text}</p> : null;
}

function Field({
  id,
  label,
  hint,
  error,
  className = "",
  inputClassName = "",
  ...input
}: {
  id: string;
  label: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className">) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} aria-invalid={error ? "true" : undefined} aria-describedby={describedBy} className={`field ${inputClassName}`} {...input} />
      {hint ? <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-soft">{hint}</p> : null}
      <ErrorText id={`${id}-err`} text={error} />
    </div>
  );
}

/** A dropdown whose values are positions in the list, mapped to English when sent. */
function Select({ id, name, label, options, className = "" }: { id: string; name: string; label: string; options: readonly string[]; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} name={name} defaultValue="0" className="field">
        {options.map((o, i) => (
          <option key={o} value={i}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/** Large radio buttons, as used for "How are you giving?". */
function Choice({ legend, name, options, value, onChange }: { legend: string; name: string; options: readonly string[]; value: number; onChange: (i: number) => void }) {
  return (
    <fieldset>
      <legend className="label">{legend}</legend>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        {options.map((label, i) => (
          <label key={label} className="relative">
            <input type="radio" name={name} value={i} checked={value === i} onChange={() => onChange(i)} className="peer sr-only" />
            <span className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-sm border border-line bg-marble px-4 transition-colors duration-200 hover:border-gold peer-checked:border-gold peer-checked:bg-[rgb(168_122_38/0.08)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
              <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${value === i ? "border-gold" : "border-ink-soft/50"}`}>
                {value === i ? <span className="h-2.5 w-2.5 rounded-full bg-gold" /> : null}
              </span>
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
