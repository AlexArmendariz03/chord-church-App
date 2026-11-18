// The API returns services from a few hours ago onwards, sorted by date. A service picked
// from a card wins; otherwise prefer the most recent one that already started (the service
// happening now) over the next one.
export const pickCurrentService = <T extends { id: string; eventDate: string }>(
  services: T[],
  requestedId: string | null,
  now = Date.now()
): T | undefined => {
  const requested = services.find(service => service.id === requestedId)
  if (requested) return requested
  const started = services.filter(service => new Date(service.eventDate).getTime() <= now)
  return started.at(-1) ?? services[0]
}
