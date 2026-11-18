"use client"

import { InfoCircleOutlined } from "@ant-design/icons"
import { AutoComplete, Button, Col, Form, Input, Row, type FormInstance } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import "dayjs/locale/es"
import { useMemo } from "react"
import { isSingleWorshipEvent } from "@/features/services/service-rules"
import type { ServiceSummary } from "@/features/services/types"
import type { SongListItem } from "@/features/songs/types"
import type { ServiceInput } from "../services-api"
import { useMonthUsage } from "../use-month-usage"
import { DateTimeField } from "./date-time-field"
import { SongLane } from "./song-lane"

export type ServiceFormValues = {
  title: string
  eventDate: Dayjs
  jubiloSongIds: string[]
  adoracionSongIds: string[]
  offeringSongId?: string
  prayerGuide?: string
  announcements?: string
}

const PRAYER_PLACEHOLDER = "Vamos a orar por:\nLa iglesia local\nNuestro pastor\nNuestros obreros y misioneros"
const ANNOUNCEMENTS_PLACEHOLDER = "Dar los anuncios del día de mañana:\nSeminarios a las 9:00 a. m."

// Las alabanzas de un servicio guardado, separadas como las pide el formulario
export const songFields = (service: ServiceSummary) => ({
  jubiloSongIds: service.songs.filter(s => s.category === "jubilo" && !s.isOffering).sort((a, b) => a.position - b.position).map(s => s.songId),
  adoracionSongIds: service.songs.filter(s => s.category === "adoracion").sort((a, b) => a.position - b.position).map(s => s.songId),
  offeringSongId: service.songs.find(s => s.isOffering)?.songId
})

export const formValuesOf = (service: ServiceSummary): Partial<ServiceFormValues> => ({
  title: service.title,
  eventDate: dayjs(service.eventDate),
  ...songFields(service),
  prayerGuide: service.prayerGuide ?? undefined,
  announcements: service.announcements ?? undefined
})

// Estudios, seminarios y la reunión de las 9:45 del fin de semana llevan solo 1 de adoración,
// sin júbilo, ofrenda ni guía: lo que quedó escrito en esos campos no se envía
const toServiceInput = (values: ServiceFormValues): ServiceInput => {
  const singleWorship = isSingleWorshipEvent(values.title, values.eventDate.toDate())
  return {
    title: values.title,
    eventDate: values.eventDate.toISOString(),
    jubiloSongIds: singleWorship ? [] : values.jubiloSongIds,
    adoracionSongIds: singleWorship ? values.adoracionSongIds.slice(0, 1) : values.adoracionSongIds,
    offeringSongId: singleWorship ? null : values.offeringSongId ?? null,
    prayerGuide: singleWorship ? null : values.prayerGuide,
    announcements: singleWorship ? null : values.announcements
  }
}

type ServiceFormProps = {
  form: FormInstance<ServiceFormValues>
  songs: SongListItem[]
  // El servicio que se edita; null al crear uno
  editingServiceId: string | null
  saving: boolean
  onSubmit: (service: ServiceInput) => void
  // Solo dentro del modal
  onCancel?: () => void
  // Nombres de otros servicios, para sugerirlos al escribir
  titleSuggestions?: string[]
}

// Cada parte del formulario con su número: 1 Evento, 2 Alabanzas, 3 Guía
const Step = ({ number, title, hint, children }: { number: number; title: string; hint?: string; children: React.ReactNode }) => (
  <section className="service-form-step">
    <header className="service-form-step-header">
      <span className="service-form-step-number">{number}</span>
      <div>
        <h4 className="service-form-step-title">{title}</h4>
        {hint && <p className="service-form-step-hint">{hint}</p>}
      </div>
    </header>
    {children}
  </section>
)

// La ofrenda es un solo id en el formulario; su grupo trabaja con listas
const asList = (value?: string | null) => ({ value: value ? [value] : [] })
const firstOf = (value?: string[]) => value?.[0]

export const ServiceForm = ({ form, songs, editingServiceId, saving, onSubmit, onCancel, titleSuggestions = [] }: ServiceFormProps) => {
  const jubiloSongs = useMemo(() => songs.filter(song => song.category === "jubilo"), [songs])
  const adoracionSongs = useMemo(() => songs.filter(song => song.category === "adoracion"), [songs])
  const pickedJubilo = Form.useWatch("jubiloSongIds", form) ?? []
  const pickedAdoracion = Form.useWatch("adoracionSongIds", form) ?? []
  const pickedOffering = Form.useWatch("offeringSongId", form)
  // Studies and the weekend 9:45 gathering: one worship song for the whole event
  const watchedTitle = Form.useWatch("title", form)
  const watchedDate = Form.useWatch("eventDate", form)
  const singleWorship = isSingleWorshipEvent(watchedTitle, watchedDate?.toDate())
  const datesBySong = useMonthUsage(watchedDate ? watchedDate.format("YYYY-MM") : null, editingServiceId)
  const monthName = watchedDate ? watchedDate.locale("es").format("MMMM") : ""
  const titleOptions = useMemo(() => {
    const typed = (watchedTitle ?? "").trim().toLowerCase()
    return [...new Set(titleSuggestions)]
      .filter(title => title.toLowerCase().includes(typed) && title.toLowerCase() !== typed)
      .slice(0, 8)
      .map(title => ({ value: title }))
  }, [titleSuggestions, watchedTitle])

  // Lo que lleva el servicio, al pie junto a Guardar
  const jubiloCount = singleWorship ? 0 : pickedJubilo.length
  const adoracionCount = singleWorship ? Math.min(1, pickedAdoracion.length) : pickedAdoracion.length
  const summary = [
    jubiloCount > 0 && `${jubiloCount} júbilo`,
    adoracionCount > 0 && `${adoracionCount} adoración`,
    !singleWorship && pickedOffering && "ofrenda"
  ].filter(Boolean).join(" · ")
  const laneProps = { datesBySong, monthName }

  return (
    <Form
      form={form} layout="vertical"
      requiredMark={false} className="service-form"
      onFinish={values => onSubmit(toServiceInput(values))}>
      <Step number={1} title="Evento">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="title" label="Nombre del servicio"
              rules={[{ required: true, message: "Escribe el nombre" }]}>
              <AutoComplete options={titleOptions}>
                <Input placeholder="Ej. Servicio domingo" />
              </AutoComplete>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="eventDate" label="Fecha y hora"
              rules={[{ required: true, message: "Elige la fecha y la hora" }]}>
              <DateTimeField />
            </Form.Item>
          </Col>
        </Row>
        {singleWorship && (
          <p className="service-form-single">
            <InfoCircleOutlined /> Estudios, seminarios y la reunión de las 9:45 llevan solo 1 alabanza de adoración, sin júbilo, ofrenda ni guía.
          </p>
        )}
      </Step>

      <Step
        number={2} title="Orden de alabanzas"
        hint="Se tocan en este orden. Usa las flechas para cambiarlo.">
        <div className="service-form-lanes">
          {!singleWorship && (
            <Form.Item
              name="jubiloSongIds" className="service-form-lane"
              rules={[{ required: true, type: "array", min: 1, message: "Agrega al menos 1 de júbilo" }]}>
              <SongLane
                kind="jubilo" title="Júbilo"
                songs={jubiloSongs} excludeIds={pickedOffering ? [pickedOffering] : []}
                firstPosition={1} placeholder="Agregar de júbilo"
                emptyText="Todavía no hay alabanzas de júbilo" {...laneProps} />
            </Form.Item>
          )}
          <Form.Item
            name="adoracionSongIds" className="service-form-lane"
            rules={[
              { required: true, type: "array", min: 1, message: singleWorship ? "Agrega la alabanza de adoración" : "Agrega al menos 1 de adoración" },
              ...(singleWorship ? [{ type: "array" as const, max: 1, message: "Este evento lleva solo 1" }] : [])
            ]}>
            <SongLane
              kind="adoracion" title="Adoración"
              songs={adoracionSongs} firstPosition={jubiloCount + 1}
              maxCount={singleWorship ? 1 : undefined} placeholder="Agregar de adoración"
              emptyText="Todavía no hay alabanzas de adoración" {...laneProps} />
          </Form.Item>
          {!singleWorship && (
            <Form.Item
              name="offeringSongId" className="service-form-lane"
              getValueProps={asList} normalize={firstOf}>
              <SongLane
                kind="ofrenda" title="Ofrenda"
                songs={jubiloSongs} excludeIds={pickedJubilo}
                firstPosition={jubiloCount + adoracionCount + 1} maxCount={1}
                placeholder="Elegir una de júbilo" emptyText="Se toca después de la adoración, mientras se recoge la ofrenda"
                {...laneProps} />
            </Form.Item>
          )}
        </div>
      </Step>

      {!singleWorship && (
        <Step
          number={3} title="Guía para el dirigente"
          hint='Opcional. Un punto por línea; una línea que termina en ":" sirve de título.'>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="prayerGuide" label="Oración">
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder={PRAYER_PLACEHOLDER} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="announcements" label="Anuncios">
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder={ANNOUNCEMENTS_PLACEHOLDER} />
              </Form.Item>
            </Col>
          </Row>
        </Step>
      )}

      <footer className="service-form-actions">
        <span className="service-form-summary">{summary || "Sin alabanzas todavía"}</span>
        {onCancel && <Button onClick={onCancel}>Cancelar</Button>}
        <Button
          type="primary" htmlType="submit"
          loading={saving}>
          {editingServiceId ? "Guardar cambios" : "Guardar servicio"}
        </Button>
      </footer>
    </Form>
  )
}
