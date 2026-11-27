import type { Dictionary } from "@/i18n";
import type { Organisation } from "@/lib/types";

/** The foundation's registrations, shown where people give or sign up: CIN, PAN (also its 80G reference), CSR and NGO Darpan. */
export function Registrations({ dict, org, className = "" }: { dict: Dictionary; org: Organisation; className?: string }) {
  const o = dict.organisation;
  const rows: [string, string][] = [
    [o.cin, org.cin],
    [`${o.pan} · 80G`, org.eighty_g === org.pan ? org.pan : `${org.pan} · 80G ${org.eighty_g}`],
    [o.csr, org.csr],
    [o.darpan, org.darpan],
  ];
  return (
    <div className={`rounded border border-line bg-marble p-6 ${className}`}>
      <h3 className="text-xl">{dict.common.orgName}</h3>
      <dl className="mt-4 grid gap-3 text-[0.95rem] sm:grid-cols-2">
        {rows.map(([k, v], i) => (
          // The CIN is long: it gets the full row.
          <div key={k} className={i === 0 ? "sm:col-span-2" : undefined}>
            <dt className="text-sm text-ink-soft">{k}</dt>
            <dd className="tabular mt-0.5 break-all">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
