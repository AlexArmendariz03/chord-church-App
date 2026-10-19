import dayjs from "dayjs"
import "dayjs/locale/es"

// "Domingo 18 de octubre, 10:00 am"
export const formatServiceDate = (date: string | Date) => {
  const formatted = dayjs(date).locale("es").format("dddd D [de] MMMM, h:mm a")
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}
