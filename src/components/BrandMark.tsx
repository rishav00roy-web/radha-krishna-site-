/** Site mark: a lotus beneath a flute. Original artwork; not the GGF logo. */
export function BrandMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="22" strokeOpacity="0.5" />
      <path d="M24 35c-3-2.6-4.3-6.4-3.4-11.5 2.1.9 3.4 2.6 3.4 4.7 0-2.1 1.3-3.8 3.4-4.7.9 5.1-.4 8.9-3.4 11.5z" />
      <path d="M24 35c-5.6 0-9.8-3-11.5-8.1 3.4-.4 6.8.9 9 3.8M24 35c5.6 0 9.8-3 11.5-8.1-3.4-.4-6.8.9-9 3.8" />
      <path d="M11 17.5l26-6" />
      <path d="M12.5 19.5l26-6" strokeOpacity="0.5" />
      <path d="M33 11c1.6-2.3 4-3.4 6-3" />
    </svg>
  );
}
