import { useEffect, useMemo, useState } from "react"
import dayjs from "dayjs"
import "dayjs/locale/es"
import { servicesApi, type SongUsage } from "./services-api"

type MonthUsage = { month: string; services: SongUsage }

// Fechas ("6 dic") de otros servicios del mismo mes en que ya se tocó cada alabanza, para avisar
// al elegir una que se repite mucho. `month` es "YYYY-MM" del evento, según el dispositivo (la hora
// de la iglesia); el servicio que se edita no cuenta.
export const useMonthUsage = (month: string | null, editingServiceId: string | null) => {
  const [usage, setUsage] = useState<MonthUsage | null>(null)

  useEffect(() => {
    if (!month || usage?.month === month) return
    let cancelled = false
    const start = dayjs(`${month}-01`)
    servicesApi.usage(start.toDate(), start.add(1, "month").toDate())
      .then(services => !cancelled && setUsage({ month, services }))
      // Es solo un aviso: sin él, el formulario funciona igual
      .catch(() => {})
    return () => { cancelled = true }
  }, [month, usage?.month])

  return useMemo(() => {
    const datesBySong = new Map<string, string[]>()
    if (!usage || usage.month !== month) return datesBySong
    for (const service of usage.services) {
      if (service.id === editingServiceId) continue
      for (const songId of service.songIds) {
        datesBySong.set(songId, [...(datesBySong.get(songId) ?? []), dayjs(service.eventDate).locale("es").format("D MMM")])
      }
    }
    return datesBySong
  }, [usage, month, editingServiceId])
}
