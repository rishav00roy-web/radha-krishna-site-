"use client";

import { useMemo, useState } from "react";

type CalendarEvent = { id: string; title: string; description: string; starts_at: string; ends_at: string | null; venue: string | null };

type Strings = { noEvents: string; upcoming: string; prevMonth: string; nextMonth: string; today: string };

const TZ = "Asia/Kolkata";
// Server (Node) and browser ICU can name Assamese months and weekdays differently, so locale-formatted
// text below opts out of the hydration text check instead of throwing.
// Date key in India time, so an event at 11pm IST stays on its own day.
const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

export function EventsCalendar({ events, strings, langTag }: { events: CalendarEvent[]; strings: Strings; langTag: string }) {
  const todayKey = dayKey(new Date());
  const [ty, tm] = todayKey.split("-").map(Number);
  const [month, setMonth] = useState({ y: ty, m: tm - 1 });
  const [selected, setSelected] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const start = new Date(e.starts_at);
      const end = e.ends_at ? new Date(e.ends_at) : start;
      // Multi-day events appear on each day they span (capped at 31 days).
      for (let d = new Date(start), n = 0; d <= end && n < 31; d = new Date(d.getTime() + 864e5), n++) {
        const k = dayKey(d);
        map.set(k, [...(map.get(k) ?? []), e]);
      }
    }
    return map;
  }, [events]);

  const first = new Date(Date.UTC(month.y, month.m, 1));
  const daysInMonth = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const cells = Array.from({ length: Math.ceil((lead + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - lead + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(langTag, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + i))),
  );
  const monthLabel = new Intl.DateTimeFormat(langTag, { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const keyFor = (day: number) => `${month.y}-${String(month.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const monthPrefix = `${month.y}-${String(month.m + 1).padStart(2, "0")}`;
  const listed = selected
    ? byDay.get(selected) ?? []
    : events.filter((e) => dayKey(new Date(e.starts_at)).startsWith(monthPrefix));
  const upcoming = events.filter((e) => dayKey(new Date(e.ends_at ?? e.starts_at)) >= todayKey).slice(0, 5);
  const fmt = (iso: string) => new Intl.DateTimeFormat(langTag, { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(new Date(iso));

  const shift = (n: number) => {
    setSelected(null);
    setMonth(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + n, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  };

  return (
    <div data-reveal className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="rounded border border-line bg-marble p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => shift(-1)} aria-label={strings.prevMonth} className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors duration-150 hover:border-gold">
            <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <div className="text-center">
            <p className="font-display text-2xl" aria-live="polite" suppressHydrationWarning>{monthLabel}</p>
            <button type="button" onClick={() => { setSelected(null); setMonth({ y: ty, m: tm - 1 }); }} className="text-sm text-gold underline">
              {strings.today}
            </button>
          </div>
          <button type="button" onClick={() => shift(1)} aria-label={strings.nextMonth} className="grid h-11 w-11 place-items-center rounded-full border border-line transition-colors duration-150 hover:border-gold">
            <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-ink-soft" aria-hidden>
          {weekdays.map((w) => <div key={w} className="py-2" suppressHydrationWarning>{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1" aria-label={monthLabel} suppressHydrationWarning>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const k = keyFor(day);
            const has = byDay.has(k);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(selected === k ? null : k)}
                aria-pressed={selected === k}
                aria-label={`${day}${has ? `, ${byDay.get(k)!.length}` : ""}`}
                className={`tabular relative grid aspect-square place-items-center rounded-sm text-[0.95rem] transition-colors duration-150 hover:bg-marble-2 aria-pressed:bg-gold aria-pressed:text-[#fffaf0] ${
                  k === todayKey ? "ring-1 ring-gold" : ""
                } ${has ? "font-semibold text-gold" : ""}`}
              >
                {day}
                {has ? <span aria-hidden className="absolute bottom-1.5 h-1 w-1 rounded-full bg-current" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <ul className="grid gap-4">
          {listed.length === 0 ? (
            <li className="rounded border border-dashed border-marble-3 p-6 text-ink-soft">{strings.noEvents}</li>
          ) : (
            listed.map((e) => (
              <li key={e.id} className="border-t border-line pt-4">
                <p className="tabular text-sm text-gold" suppressHydrationWarning>{fmt(e.starts_at)}{e.ends_at ? ` – ${fmt(e.ends_at)}` : ""}</p>
                <p className="mt-1 font-display text-2xl">{e.title}</p>
                {e.venue ? <p className="text-sm text-ink-soft">{e.venue}</p> : null}
                {e.description ? <p className="mt-2 text-ink-soft">{e.description}</p> : null}
              </li>
            ))
          )}
        </ul>
        {upcoming.length > 0 && !selected ? (
          <div className="mt-10">
            <p className="font-display text-xl">{strings.upcoming}</p>
            <ul className="mt-3 grid gap-2">
              {upcoming.map((e) => (
                <li key={e.id} className="flex justify-between gap-4 border-t border-line pt-2 text-[0.95rem]">
                  <span>{e.title}</span>
                  <span className="tabular shrink-0 text-ink-soft">{new Intl.DateTimeFormat(langTag, { dateStyle: "medium", timeZone: TZ }).format(new Date(e.starts_at))}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
