"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type DoneStrings = {
  doneTitle: string; demoTitle: string; demoBody: string; doneRef: string; doneBody: string;
  ackNote: string; viewSample: string; doneWhatsApp: string;
};

/**
 * What a visitor sees after sending a form: their reference number, what happens next,
 * and a link to the sample receipt. In demo mode it also offers the old email/WhatsApp send.
 */
export function FormDone({
  live, refNo, strings, sampleHref, whatsappHref, mailHref, sendEmail, sendWhatsApp,
}: {
  live: boolean;
  refNo: string;
  strings: DoneStrings;
  sampleHref: string;
  whatsappHref: string;
  mailHref: string | null;
  sendEmail: string;
  sendWhatsApp: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.focus({ preventScroll: true });
    box.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  return (
    <div ref={box} tabIndex={-1} role="status" className="rounded border border-gold/50 bg-marble p-6 outline-none sm:p-8">
      <h3 className="font-display text-2xl leading-snug">{live ? strings.doneTitle : strings.demoTitle}</h3>
      {!live ? <p className="mt-3 text-ink-soft">{strings.demoBody}</p> : null}

      <p className="mt-6 text-sm text-ink-soft">{strings.doneRef}</p>
      <p className="tabular mt-1 select-all font-display text-3xl tracking-[0.04em] text-gold">{refNo}</p>
      <p className="mt-3 max-w-[60ch] text-ink-soft">{strings.doneBody}</p>
      {live ? <p className="mt-3 max-w-[60ch] text-ink-soft">{strings.ackNote}</p> : null}

      <div className="mt-7 flex flex-wrap gap-3">
        {!live && mailHref ? <a href={mailHref} className="btn btn-primary">{sendEmail}</a> : null}
        {!live ? (
          <a href={whatsappHref} className={`btn ${mailHref ? "btn-quiet" : "btn-primary"}`}>{sendWhatsApp}</a>
        ) : (
          <a href={whatsappHref} className="btn btn-quiet">{strings.doneWhatsApp}</a>
        )}
      </div>
      <Link href={sampleHref} className="group mt-6 inline-flex items-center gap-3 border-b border-gold pb-1 font-display text-xl text-ink no-underline">
        {strings.viewSample}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">⟶</span>
      </Link>
    </div>
  );
}
