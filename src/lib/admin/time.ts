/** datetime-local inputs are edited in India Standard Time. */
export function toIstInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 330 * 60_000);
  return d.toISOString().slice(0, 16);
}
export const fromIstInput = (v: string) => (v ? new Date(`${v}:00+05:30`).toISOString() : null);
