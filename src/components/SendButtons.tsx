"use client";

/** The two ways a form leaves the site: the visitor's email app, or WhatsApp. */
export function SendButtons({
  email,
  sendEmail,
  sendWhatsApp,
  howEmail,
  howWhatsApp,
  onSend,
}: {
  email: string | null;
  sendEmail: string;
  sendWhatsApp: string;
  howEmail: string;
  howWhatsApp: string;
  onSend: (via: "email" | "whatsapp") => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {email ? (
          <button type="submit" name="via" value="email" onClick={() => onSend("email")} className="btn btn-primary">
            <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
            </svg>
            {sendEmail}
          </button>
        ) : null}
        <button type="submit" name="via" value="whatsapp" onClick={() => onSend("whatsapp")} className={`btn ${email ? "btn-quiet" : "btn-primary"}`}>
          <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19l-4 1z" />
          </svg>
          {sendWhatsApp}
        </button>
      </div>
      <p className="mt-3 max-w-[60ch] text-sm text-ink-soft">{email ? howEmail : howWhatsApp}</p>
    </div>
  );
}
