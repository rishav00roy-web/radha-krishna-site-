/** The temple's gold line lotus: five petals over a curved base, drawn from Rishav's logo. */
export function LotusLogo({ width = 56, className, strokeWidth = 2.8, glow = false }: { width?: number; className?: string; strokeWidth?: number; glow?: boolean }) {
  return (
    <svg
      viewBox="0 0 110 60"
      width={width}
      height={Math.round((width * 60) / 110)}
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={glow ? { filter: "drop-shadow(0 1px 1.5px rgb(8 14 22 / 0.75)) drop-shadow(0 0 9px rgb(8 14 22 / 0.5)) drop-shadow(0 0 14px rgb(226 196 134 / 0.35))" } : undefined}
    >
      <path d="M54 39C47 33 42.5 22 44.5 9.5C49 12.5 53 17 54 23.5C55 17 59 12.5 63.5 9.5C65.5 22 61 33 54 39Z" />
      <path d="M51.5 39C43 31 33 20.5 21.5 18.5C32.5 16.5 42 21 47.5 27.5M56.5 39C65 31 75 20.5 86.5 18.5C75.5 16.5 66 21 60.5 27.5" />
      <path d="M27 20C32 21 36.5 25 39 29.5M81 20C76 21 71.5 25 69 29.5" />
      <path d="M54 40C38 40 20 35 8.5 27C21 23.5 34 27.5 43 35M54 40C70 40 88 35 99.5 27C87 23.5 74 27.5 65 35" />
      <path d="M20.5 53C38 43.5 70 43.5 87.5 53" />
    </svg>
  );
}

/** Site mark, used beside the temple name (hero corner, footer). */
export function BrandMark({ size = 40, className }: { size?: number; className?: string }) {
  return <LotusLogo width={Math.round(size * 1.45)} strokeWidth={3.2} glow className={className} />;
}
