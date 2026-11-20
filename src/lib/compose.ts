/** Builds email and WhatsApp links that carry a form's contents. Nothing is sent by the website itself. */

export const mobilePattern = /^(\+?91[\s-]?)?[6-9]\d{9}$/;

export function mailtoHref(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function whatsappHref(number: string, body: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(body)}`;
}

/** "Label: value" lines, skipping empty values. Labels stay in English so the foundation reads one format. */
export const lines = (pairs: [string, string][]) =>
  pairs.filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v.trim()}`).join("\n");
