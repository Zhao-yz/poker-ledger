// The app's "today". Everyone using it plays in the Bay Area, and using one fixed zone
// means the server and the browser always agree on the date.
export const APP_TIME_ZONE = "America/Los_Angeles";

/** Today's date as YYYY-MM-DD in the app's time zone. */
export function todayInAppZone(now: Date = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
