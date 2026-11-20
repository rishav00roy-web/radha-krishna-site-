"use client";

import { useActionState } from "react";
import type { Field } from "@/lib/admin/resources";
import type { FormState } from "@/app/admin/actions";

const langs = [
  ["en", "English"],
  ["as", "Assamese"],
  ["hi", "Hindi"],
] as const;

export function SubmitBar({ pending, state, label = "Save" }: { pending: boolean; state: FormState; label?: string }) {
  return (
    <div className="sticky bottom-0 -mx-6 mt-8 flex flex-wrap items-center gap-4 border-t border-line bg-marble px-6 py-4">
      <button type="submit" disabled={pending} className="btn btn-primary">{pending ? "Saving…" : label}</button>
      <p role="status" aria-live="polite" className={state.error ? "text-[#b3261e]" : "text-[#2e6b3f]"}>{state.error ?? state.ok}</p>
    </div>
  );
}

function FieldInput({ field, value }: { field: Field; value: unknown }) {
  const id = `fld-${field.name}`;
  const req = "required" in field && field.required;
  const help = field.help ? <p className="mt-1 text-sm text-ink-soft">{field.help}</p> : null;

  if (field.type === "localized") {
    const v = (value as Record<string, string>) ?? {};
    return (
      <fieldset>
        <legend className="label">{field.label}{req ? " *" : ""}</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {langs.map(([code, name]) => (
            <div key={code}>
              <label htmlFor={`${id}-${code}`} className="mb-1 block text-sm text-ink-soft">{name}</label>
              {field.multiline ? (
                <textarea id={`${id}-${code}`} name={`${field.name}.${code}`} defaultValue={v[code] ?? ""} rows={6} lang={code} className="field resize-y" />
              ) : (
                <input id={`${id}-${code}`} name={`${field.name}.${code}`} defaultValue={v[code] ?? ""} lang={code} className="field" required={req && code === "en"} />
              )}
            </div>
          ))}
        </div>
        {help}
      </fieldset>
    );
  }

  if (field.type === "boolean") {
    return (
      <div>
        <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-3">
          <input type="checkbox" name={field.name} defaultChecked={Boolean(value)} className="h-5 w-5 accent-[var(--gold)]" />
          <span>{field.label}</span>
        </label>
        {help}
      </div>
    );
  }

  if (field.type === "media") {
    const url = (value as string) ?? "";
    return (
      <div>
        <label htmlFor={id} className="label">{field.label}</label>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <input id={id} name={field.name} defaultValue={url} placeholder="https://…" className="field" />
          <input aria-label={`Upload ${field.label}`} type="file" name={`${field.name}__file`} accept={field.accept} className="field file:mr-3 file:rounded-full file:border-0 file:bg-marble-2 file:px-3 file:py-1" />
        </div>
        {url && /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(url) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="mt-3 h-28 w-auto rounded-sm border border-line object-cover" />
        ) : null}
        {help ?? <p className="mt-1 text-sm text-ink-soft">Paste a link or choose a file; a chosen file replaces the link.</p>}
      </div>
    );
  }

  const common = { id, name: field.name, required: req, className: "field" };
  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = <textarea {...common} rows={4} defaultValue={(value as string) ?? ""} />;
      break;
    case "number":
      input = <input {...common} type="number" step={field.step ?? "1"} min={field.min} max={field.max} defaultValue={value == null ? "" : String(value)} className="field tabular" />;
      break;
    case "datetime":
    case "date":
      input = <input {...common} type={field.type === "date" ? "date" : "datetime-local"} defaultValue={(value as string) ?? ""} className="field tabular" />;
      break;
    case "select":
      input = (
        <select {...common} defaultValue={(value as string) ?? field.options[0]}>
          {field.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
        </select>
      );
      break;
    default:
      input = <input {...common} defaultValue={(value as string) ?? ""} pattern={field.type === "slug" ? "[a-z0-9-]+" : undefined} />;
  }
  return (
    <div>
      <label htmlFor={id} className="label">{field.label}{req ? " *" : ""}</label>
      {input}
      {help}
    </div>
  );
}

export function RecordForm({
  fields,
  values,
  action,
  initialOk,
}: {
  fields: Field[];
  values: Record<string, unknown>;
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  initialOk?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: initialOk });
  return (
    <form action={formAction} className="grid gap-6">
      {fields.map((f) => (
        <FieldInput key={f.name} field={f} value={values[f.name]} />
      ))}
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}
