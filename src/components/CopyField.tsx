"use client";

import { useState } from "react";

/** A bank detail with a copy button. The value stays selectable text, so it also works without JS. */
export function CopyField({ label, value, copy, copied, mono = false }: { label: string; value: string; copy: string; copied: string; mono?: boolean }) {
  const [done, setDone] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older browsers: select the text so the visitor can copy it themselves.
      const el = document.getElementById(`cf-${label}`);
      if (el) window.getSelection()?.selectAllChildren(el);
      return;
    }
    setDone(true);
    window.setTimeout(() => setDone(false), 1800);
  }
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgb(243_236_220/0.14)] py-3.5 last:border-0">
      <div className="min-w-0">
        <dt className="text-sm text-forest-soft">{label}</dt>
        <dd id={`cf-${label}`} className={`mt-0.5 break-words text-lg text-forest-ink ${mono ? "tabular font-medium tracking-[0.04em]" : ""}`}>{value}</dd>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`${copy}: ${label}`}
        className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border border-[rgb(212_169_73/0.5)] px-3.5 text-sm text-gold-pale transition-colors duration-200 hover:border-gold-bright hover:bg-[rgb(212_169_73/0.12)]"
      >
        <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {done ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>}
        </svg>
        <span aria-live="polite">{done ? copied : copy}</span>
      </button>
    </div>
  );
}
