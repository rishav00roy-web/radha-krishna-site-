import type { IconKey } from "@/lib/types";

/**
 * Original fine-line ornamental icon set, drawn for this site.
 * One stroke weight (1.5 on a 48 grid), round caps, currentColor.
 */
const paths: Record<IconKey, React.ReactNode> = {
  temple: (
    <>
      <path d="M24 3v4" />
      <path d="M24 3l5 2-5 2" />
      <circle cx="24" cy="9" r="1.6" />
      <path d="M18.5 24c0-6 2.5-10.5 5.5-13 3 2.5 5.5 7 5.5 13" />
      <path d="M20.5 17.5h7M19.4 21h9.2" />
      <path d="M10 30c0-3.5 1.5-6 4-7.5 2.5 1.5 4 4 4 7.5M30 30c0-3.5 1.5-6 4-7.5 2.5 1.5 4 4 4 7.5" />
      <path d="M8 30h32v12H8z" />
      <path d="M21 42v-6.5a3 3 0 0 1 6 0V42" />
      <path d="M13 34v8M35 34v8" />
      <path d="M5 45h38" />
    </>
  ),
  cow: (
    <>
      <path d="M11 17c-2-1-4-3-4.5-6M17 16c1.5-1 2.5-3 2.5-5.5" />
      <path d="M9 17h9l1.5 3c3-1.5 6.5-2.5 10-1.5 1.5-2 3.5-2.5 5-1.5 3 .5 6 2.5 6.5 7v5" />
      <path d="M9 17c-1.5 1.5-2.5 4-2 6.5.5 2 2 3 4 3 1.5 0 2.5-.5 3.5-1.5" />
      <circle cx="12" cy="20.5" r=".8" fill="currentColor" stroke="none" />
      <path d="M16.5 25c1.5 2 3.5 3.5 6 4v13M37 26v16M23 33c4 1 9.5 1 14-1" />
      <path d="M41 24c1.5 3 1.5 7 0 10" />
      <path d="M27 42v-5M33 42v-6" />
      <path d="M5 45h38" />
    </>
  ),
  water: (
    <>
      <ellipse cx="24" cy="33" rx="19" ry="8" />
      <path d="M11 37c3 1 6 1 9 0M28 38c3 1 6 1 9 0" />
      <path d="M24 30c-2.5-2-3.5-5-2.5-9 2 .5 3.5 2 3.5 4 0-2 1.5-3.5 3.5-4 1 4 0 7-2.5 9" />
      <path d="M24 30c-4 0-7-2-8.5-5 2.5-1 5.5-.5 7 1.5M24 30c4 0 7-2 8.5-5-2.5-1-5.5-.5-7 1.5" />
      <path d="M14 13c0 2 1.5 3.5 3 3.5s3-1.5 3-3.5c0-2-3-6-3-6s-3 4-3 6z" />
    </>
  ),
  bamboo: (
    <>
      <path d="M15 45V5M24 45V9M33 45V3" />
      <path d="M13 13h4M13 24h4M13 35h4M22 18h4M22 30h4M31 11h4M31 22h4M31 34h4" />
      <path d="M17 13c3-1 6-4 7-8M26 18c4-.5 8-3.5 10-7M35 22c3 0 6-2 8-5M13 24c-3-.5-6-3-7.5-6M22 30c-2.5 1.5-4 4.5-4 8" />
    </>
  ),
  herb: (
    <>
      <path d="M10 28h28l-3 10a6 6 0 0 1-5.8 4.5H18.8A6 6 0 0 1 13 38z" />
      <path d="M8 28h32" />
      <path d="M30 26l8-14" />
      <path d="M38 12a2 2 0 1 1 1 3.5" />
      <path d="M20 28v-9M20 19c-4 0-6.5-2.5-7-6 3.5 0 6.5 2.5 7 6zM20 22c3.5 0 6-2 6.5-5.5-3.5 0-6 2-6.5 5.5zM20 19v-6M20 13c-1.5-1.5-1.5-4 0-6 1.5 2 1.5 4.5 0 6z" />
    </>
  ),
  fruit: (
    <>
      <path d="M24 45V27M24 33l-5-4M24 30l5-4" />
      <path d="M24 27c-9 0-15-5-15-11.5S15 4 24 4s15 5 15 11.5S33 27 24 27z" />
      <circle cx="17" cy="15" r="2" />
      <circle cx="28" cy="11" r="2" />
      <circle cx="30" cy="19" r="2" />
      <circle cx="21" cy="21" r="2" />
      <path d="M14 45h20" />
    </>
  ),
  meditate: (
    <>
      <circle cx="24" cy="11" r="3.5" />
      <path d="M24 15v10M24 18l-6 5 4 3M24 18l6 5-4 3" />
      <path d="M11 35c3-5 8-6 13-3 5-3 10-2 13 3-4 2.5-9 3-13 1-4 2-9 1.5-13-1z" />
      <path d="M9 13a15 15 0 0 1 30 0" strokeDasharray="1 3.5" />
      <path d="M8 42h32" />
    </>
  ),
  gathering: (
    <>
      <path d="M6 18L24 7l18 11" />
      <path d="M9 18h30" />
      <path d="M11 18v22M37 18v22M20 18v4M28 18v4" />
      <circle cx="18" cy="29" r="2.2" />
      <circle cx="24" cy="27" r="2.2" />
      <circle cx="30" cy="29" r="2.2" />
      <path d="M14.5 38c0-3 1.5-5 3.5-5s3.5 2 3.5 5M20.5 36c0-3 1.5-5 3.5-5s3.5 2 3.5 5M26.5 38c0-3 1.5-5 3.5-5s3.5 2 3.5 5" />
      <path d="M5 42h38" />
    </>
  ),
  lotus: (
    <>
      <path d="M24 36c-3.5-3-5-7.5-4-13.5 2.5 1 4 3 4 5.5 0-2.5 1.5-4.5 4-5.5 1 6-.5 10.5-4 13.5z" />
      <path d="M24 36c-6.5 0-11.5-3.5-13.5-9.5 4-.5 8 1 10.5 4.5" />
      <path d="M24 36c6.5 0 11.5-3.5 13.5-9.5-4-.5-8 1-10.5 4.5" />
      <path d="M24 36c-9 1-15.5-1-19-6 4.5-2 9-1.5 12.5 1M24 36c9 1 15.5-1 19-6-4.5-2-9-1.5-12.5 1" />
      <path d="M10 41c4.5-2 9.5-3 14-3s9.5 1 14 3" />
      <path d="M24 16v-4M17 18l-2-3M31 18l2-3" />
    </>
  ),
  feather: (
    <>
      <path d="M12 44C18 34 24 24 34 6" />
      <path d="M34 6c4 4 6 10 4 16-2 7-9 12-17 13" />
      <path d="M34 6c-6 2-11 7-13 13-1.5 5-1 10 0 16" />
      <ellipse cx="30" cy="17" rx="4.2" ry="5.5" transform="rotate(30 30 17)" />
      <ellipse cx="30" cy="17" rx="2" ry="2.8" transform="rotate(30 30 17)" />
      <path d="M23 30l-6 1M26 26l-7-1M29 23l-6-4" strokeDasharray="1 2" />
    </>
  ),
  flute: (
    <>
      <path d="M5 33L41 11" />
      <path d="M7 36L43 14" />
      <path d="M5 33l2 3M41 11l2 3" />
      <circle cx="17" cy="27.6" r=".9" fill="currentColor" stroke="none" />
      <circle cx="22" cy="24.6" r=".9" fill="currentColor" stroke="none" />
      <circle cx="27" cy="21.6" r=".9" fill="currentColor" stroke="none" />
      <circle cx="32" cy="18.6" r=".9" fill="currentColor" stroke="none" />
      <path d="M11 31.5c-1 3-1 6 1 9M13 30.5c0 3 1 6 3.5 8" />
      <path d="M36 12c2-3 5-5 8-5" />
    </>
  ),
  diya: (
    <>
      <path d="M8 30c2 6 8.5 9 16 9s14-3 16-9z" />
      <path d="M8 30h32" />
      <path d="M38 30l5-3" />
      <path d="M24 24c-3-2.5-3.5-6.5 0-12 3.5 5.5 3 9.5 0 12z" />
      <path d="M24 24v6" />
      <path d="M17 44h14" />
      <path d="M14 10l-2-2M34 10l2-2M24 6V3" />
    </>
  ),
  kalash: (
    <>
      <path d="M17 16h14" />
      <path d="M19 16c-6 3-9 9-7.5 16 1.5 6 6.5 10 12.5 10s11-4 12.5-10c1.5-7-1.5-13-7.5-16" />
      <path d="M19 16v-3h10v3" />
      <path d="M24 13c-1-3 0-6 0-8M24 5c-4 0-7 2-9 5M24 5c4 0 7 2 9 5" />
      <path d="M13 28h22M14.5 33h19" />
      <path d="M20 45h8" />
    </>
  ),
  book: (
    <>
      <path d="M24 14c-4-3-10-4-17-3v24c7-1 13 0 17 3 4-3 10-4 17-3V11c-7-1-13 0-17 3z" />
      <path d="M24 14v24" />
      <path d="M11 18c3-.5 6 0 9 1.5M11 23c3-.5 6 0 9 1.5M28 19.5c3-1.5 6-2 9-1.5M28 24.5c3-1.5 6-2 9-1.5" />
      <path d="M13 38l-4 7M35 38l4 7M10 43h28" />
    </>
  ),
  drum: (
    <>
      <path d="M8 18c0-2 3-3.5 6-3.5s6 1.5 6 3.5" />
      <path d="M28 18c0-2 3-3.5 6-3.5s6 1.5 6 3.5" />
      <path d="M8 18c-1 6 0 12 2 18M40 18c1 6 0 12-2 18" />
      <path d="M20 18c4 1 4 1 8 0" />
      <path d="M8 18c3 2 9 2 12 0M28 18c3 2 9 2 12 0" />
      <path d="M10 36c4 3 24 3 28 0" />
      <path d="M12 22l6 12M18 22l-4 13M30 22l6 12M36 22l-4 13" strokeDasharray="1 2.5" />
    </>
  ),
  hands: (
    <>
      <path d="M6 26c3 6 8 11 14 13h8c6-2 11-7 14-13" />
      <path d="M6 26l3-2 6 6M42 26l-3-2-6 6" />
      <path d="M15 30c2 3 5 5 9 5s7-2 9-5" />
      <path d="M24 27c-2.5-2-3.5-5-2.5-9 1.5.5 2.5 2 2.5 3.5 0-1.5 1-3 2.5-3.5 1 4 0 7-2.5 9z" />
      <path d="M24 27c-3.5 0-6-1.5-7-4 2-.5 4.5 0 5.5 1.5M24 27c3.5 0 6-1.5 7-4-2-.5-4.5 0-5.5 1.5" />
      <path d="M20 39v5M28 39v5" />
    </>
  ),
  tree: (
    <>
      <path d="M24 45V22M24 30l-6-5M24 27l5-4M20 45c1.5-2 2.5-4 4-6 1.5 2 2.5 4 4 6" />
      <path d="M16 24c-5 0-8-3.5-8-7.5 0-3.5 2.5-6 6-6.5C15 6.5 19 4 24 4s9 2.5 10 6c3.5.5 6 3 6 6.5 0 4-3 7.5-8 7.5z" />
    </>
  ),
  conch: (
    <>
      <path d="M10 30c0-10 8-19 19-21 5-1 9 2 9 6 0 3-2 5-5 5 4 3 4 9 0 12-4 4-11 5-17 3" />
      <path d="M10 30c-2 2-3 5-2 8l8-6" />
      <path d="M33 20c-4 0-8 2-10 6M29 14c-3 1-6 3-8 6" />
      <path d="M38 15c-3-1-6 0-8 2" />
    </>
  ),
};

export function Icon({
  name,
  size = 40,
  className,
  title,
}: {
  name: IconKey;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
