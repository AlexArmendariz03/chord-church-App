"use client"

import { DatePicker, TimePicker } from "antd"
import type { Dayjs } from "dayjs"
import { useState } from "react"

type DateTimeFieldProps = {
  // Form.Item pasa value y onChange
  value?: Dayjs | null
  onChange?: (value: Dayjs | null) => void
  status?: "error" | "warning" | ""
}

// Fecha y hora del evento en dos campos: el calendario con hora en uno solo no cabe en el teléfono.
// Mientras falte una de las dos, el valor queda vacío y el formulario pide completarlo.
export const DateTimeField = ({ value, onChange, status }: DateTimeFieldProps) => {
  // Lo elegido en cada campo, aunque el otro siga vacío
  const [draft, setDraft] = useState<{ date: Dayjs | null; time: Dayjs | null }>({ date: null, time: null })
  // Este campo manda null mientras falta algo; undefined es un formulario recién abierto o reiniciado
  const partial = value === undefined ? { date: null, time: null } : draft
  const date = value ?? partial.date
  const time = value ?? partial.time

  const update = (next: { date: Dayjs | null; time: Dayjs | null }) => {
    setDraft(next)
    onChange?.(next.date && next.time
      ? next.date.hour(next.time.hour()).minute(next.time.minute()).second(0).millisecond(0)
      : null)
  }

  return (
    <div className="date-time-field">
      <DatePicker
        value={date} format="ddd D MMM YYYY"
        placeholder="Fecha" status={status}
        aria-label="Fecha del evento" inputReadOnly
        onChange={next => update({ date: next, time })} />
      <TimePicker
        value={time} format="h:mm a"
        use12Hours minuteStep={5}
        placeholder="Hora" status={status}
        aria-label="Hora del evento" inputReadOnly
        needConfirm={false} showNow={false}
        onChange={next => update({ date, time: next })} />
    </div>
  )
}
