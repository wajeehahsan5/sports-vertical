/** The call time in the athlete's own zone (UK or US), with the zone name so there's no doubt. */
export function formatWhen(iso: string, timeZone?: string) {
  const zone = timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = zone.startsWith("America/") ? "en-US" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: zone,
    timeZoneName: "short",
  }).format(new Date(iso));
}
