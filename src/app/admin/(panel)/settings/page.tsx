import { requireRole } from "@/lib/auth";
import { getLocation, getMedia, getOrganisation } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { saveSetting } from "../../actions";

const Text = ({ name, label, value, help }: { name: string; label: string; value?: string | number | null; help?: string }) => (
  <div>
    <label htmlFor={`s-${name}`} className="label">{label}</label>
    <input id={`s-${name}`} name={name} defaultValue={value ?? ""} className="field" />
    {help ? <p className="mt-1 text-sm text-ink-soft">{help}</p> : null}
  </div>
);

const Media = ({ name, label, value }: { name: string; label: string; value: string | null }) => (
  <div>
    <label htmlFor={`m-${name}`} className="label">{label}</label>
    <div className="grid gap-3 md:grid-cols-2">
      <input id={`m-${name}`} name={name} defaultValue={value ?? ""} placeholder="https://…" className="field" />
      <input aria-label={`Upload ${label}`} type="file" name={`${name}__file`} accept="image/*" className="field" />
    </div>
    {value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={value} alt="" className="mt-3 h-28 w-auto rounded-sm border border-line object-contain" />
    ) : <p className="mt-1 text-sm text-ink-soft">Empty: the site shows its labelled placeholder.</p>}
  </div>
);

export default async function Settings() {
  await requireRole("admin");
  const [org, loc, media] = await Promise.all([getOrganisation(), getLocation(), getMedia()]);
  const langs = [["en", "English"], ["as", "Assamese"], ["hi", "Hindi"]] as const;

  return (
    <div className="grid max-w-5xl gap-12">
      <h1 className="text-4xl">Organisation and site</h1>

      <section className="rounded border border-line bg-marble p-6">
        <h2 className="text-2xl">Organisation details</h2>
        <p className="mt-1 text-ink-soft">Shown in the footer, the About GGF page and the contact page.</p>
        <div className="mt-6">
          <SettingsForm action={saveSetting.bind(null, "organisation")}>
            <div className="grid gap-5 md:grid-cols-2">
              <Text name="name" label="Name" value={org.name} />
              <Text name="short_name" label="Short name" value={org.short_name} />
            </div>
            <Text name="legal_form" label="Legal form" value={org.legal_form} />
            <div className="grid gap-5 md:grid-cols-2">
              <Text name="cin" label="CIN" value={org.cin} />
              <Text name="pan" label="PAN" value={org.pan} />
              <Text name="csr" label="CSR registration no." value={org.csr} />
              <Text name="darpan" label="NGO Darpan ID" value={org.darpan} />
            </div>
            <Text name="address" label="Registered office" value={org.address} />
            <div className="grid gap-5 md:grid-cols-2">
              <Text name="phone" label="Phone" value={org.phone} />
              <Text name="email" label="Email (optional)" value={org.email} />
              <Text name="leader_name" label="Project leader" value={org.leader_name} />
              <Text name="leader_title" label="Leader's title" value={org.leader_title} />
            </div>
          </SettingsForm>
        </div>
      </section>

      <section className="rounded border border-line bg-marble p-6">
        <h2 className="text-2xl">Website media</h2>
        <p className="mt-1 text-ink-soft">Replace the placeholders with the official GGF logo, the temple render for the homepage and the master-plan drawing.</p>
        <div className="mt-6">
          <SettingsForm action={saveSetting.bind(null, "media")}>
            <Media name="logo" label="GGF logo" value={media.logo} />
            <Media name="hero_image" label="Homepage hero render" value={media.hero_image} />
            <Media name="masterplan_image" label="Master-plan drawing (the hotspots sit on top of it)" value={media.masterplan_image} />
          </SettingsForm>
        </div>
      </section>

      <section className="rounded border border-line bg-marble p-6">
        <h2 className="text-2xl">Location</h2>
        <p className="mt-1 text-ink-soft">Leave empty until verified. The map, directions and landmarks appear only when filled in.</p>
        <div className="mt-6">
          <SettingsForm action={saveSetting.bind(null, "location")}>
            <div className="grid gap-5 md:grid-cols-2">
              <Text name="lat" label="Latitude" value={loc.lat} help="For example 26.7509" />
              <Text name="lng" label="Longitude" value={loc.lng} help="For example 94.2037" />
            </div>
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" name="verified" className="h-5 w-5 accent-[var(--gold)]" defaultChecked={loc.lat !== null} />
              <span>These coordinates have been verified on site</span>
            </label>
            <fieldset>
              <legend className="label">Directions</legend>
              <div className="grid gap-3 md:grid-cols-3">
                {langs.map(([c, n]) => (
                  <textarea key={c} aria-label={`Directions (${n})`} name={`directions.${c}`} lang={c} rows={4} defaultValue={loc.directions?.[c] ?? ""} placeholder={n} className="field" />
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">Nearby landmarks (one per line)</legend>
              <div className="grid gap-3 md:grid-cols-3">
                {langs.map(([c, n]) => (
                  <textarea key={c} aria-label={`Landmarks (${n})`} name={`landmarks.${c}`} lang={c} rows={4} defaultValue={loc.landmarks.map((l) => l[c]).join("\n")} placeholder={n} className="field" />
                ))}
              </div>
            </fieldset>
          </SettingsForm>
        </div>
      </section>
    </div>
  );
}
