/**
 * Local-calendar-day string (YYYY-MM-DD) — deliberately not
 * `toISOString().slice(0, 10)`, which gives the UTC date. In any timezone
 * behind UTC, that returns tomorrow's date while it's still today locally
 * (e.g. 9pm US Eastern is already past midnight UTC). Every date string
 * this app stores (`Profile.blockStart`, `Session.date`) gets parsed
 * elsewhere as local midnight (`new Date(\`${dateStr}T00:00:00\`)`, see
 * `weekOfBlock`), so storage has to use the same local convention or the
 * two drift apart right at the boundary that matters most: midnight.
 */
export function todayLocal(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
