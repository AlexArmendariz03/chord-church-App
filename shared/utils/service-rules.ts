// Some events only take one worship song for the whole event, with no júbilo or offering:
// Bible studies, seminars, and the 9:45 a. m. gathering on Saturdays and Sundays.

// The church's local time, so the server (UTC) and the browser agree on day and hour
const CHURCH_TIME_ZONE = "America/Mexico_City"
const SINGLE_WORSHIP_DAYS = ["Sat", "Sun"]
const SINGLE_WORSHIP_TIME = "09:45"

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

// "Estudio bíblico", "Seminario de jóvenes"… (but not "Estudiantes" or "Seminaristas")
const isStudy = (title?: string | null) => Boolean(title && /\b(estudios?|seminarios?)\b/.test(normalize(title)))

const isWeekendMorning = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CHURCH_TIME_ZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value
  return SINGLE_WORSHIP_DAYS.includes(part("weekday") ?? "") && `${part("hour")}:${part("minute")}` === SINGLE_WORSHIP_TIME
}

export const isSingleWorshipEvent = (title?: string | null, eventDate?: Date | string | null) => {
  if (isStudy(title)) return true
  if (!eventDate) return false
  const date = new Date(eventDate)
  return !Number.isNaN(date.getTime()) && isWeekendMorning(date)
}
