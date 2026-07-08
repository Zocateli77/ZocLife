/**
 * Timezone helpers for the app.
 *
 * The app is single-user, based in Brazil, and must behave consistently whether
 * code runs on the client (browser tz) or on the server (UTC on Vercel).
 * Everything "day"-related is anchored to America/Sao_Paulo so SSR and the
 * client agree on which calendar day "today" is and where a day starts/ends.
 */

export const APP_TIME_ZONE = "America/Sao_Paulo";

/**
 * Today's date in the app timezone as a `YYYY-MM-DD` string.
 * `en-CA` formats dates as `YYYY-MM-DD`, so this is stable across runtimes.
 */
export function getTodayInAppTz(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * The UTC offset (in minutes) of the app timezone at the given instant.
 * Positive means ahead of UTC. Brazil is UTC-3, so this returns -180.
 */
function appTzOffsetMinutes(instant: Date): number {
  // Format the instant as wall-clock time in the app tz, then compare that
  // wall-clock reading (interpreted as UTC) against the real instant.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(instant);

  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  // `hour` can come back as 24 for midnight in some environments.
  const hour = map.hour === 24 ? 0 : map.hour;

  const asUtc = Date.UTC(
    map.year,
    map.month - 1,
    map.day,
    hour,
    map.minute,
    map.second,
  );

  return Math.round((asUtc - instant.getTime()) / 60000);
}

/**
 * Given a `YYYY-MM-DD` date string, returns the UTC ISO instants for the start
 * and (exclusive-ish) end of that calendar day *in the app timezone*.
 *
 * `startISO` is 00:00:00.000 local, `endISO` is 23:59:59.999 local — matching
 * the inclusive `gte`/`lte` range used by `getEventsInRange`.
 */
export function appDayRange(dateStr: string): { startISO: string; endISO: string } {
  const [year, month, day] = dateStr.split("-").map(Number);

  // Approximate the local-day start as a UTC instant, then correct by the tz
  // offset at that instant to land exactly on local midnight.
  const approx = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const offset = appTzOffsetMinutes(approx);

  const startMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0) - offset * 60000;
  const endMs = Date.UTC(year, month - 1, day, 23, 59, 59, 999) - offset * 60000;

  return {
    startISO: new Date(startMs).toISOString(),
    endISO: new Date(endMs).toISOString(),
  };
}
