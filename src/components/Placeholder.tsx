import { Icon } from "./Icon";
import type { IconKey } from "@/lib/types";

/** Clearly-labelled stand-in for an official image that has not been supplied yet. */
export function Placeholder({
  icon,
  label,
  note,
  className = "",
  dark = false,
}: {
  icon: IconKey;
  label: string;
  note: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`relative isolate flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center ${
        dark ? "bg-forest-2 text-forest-ink" : "border border-line bg-marble text-ink"
      } ${className}`}
      role="img"
      aria-label={`${label}. ${note}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.09]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Cpath d='M18 2l16 16-16 16L2 18z M18 10l8 8-8 8-8-8z' fill='none' stroke='%23a87a26' stroke-width='1'/%3E%3C/svg%3E\")",
          backgroundSize: "36px 36px",
        }}
      />
      <Icon name={icon} size={56} className={dark ? "text-gold-bright" : "text-gold"} />
      <p className="font-display text-xl leading-tight">{label}</p>
      <p className={`max-w-[28ch] text-sm ${dark ? "text-forest-soft" : "text-ink-soft"}`}>{note}</p>
    </div>
  );
}
