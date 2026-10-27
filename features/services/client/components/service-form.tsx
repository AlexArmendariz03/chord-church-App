"use client"

import { ExclamationCircleOutlined } from "@ant-design/icons"
import { Button, Col, DatePicker, Form, Input, Row, Select, Typography, type FormInstance } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import "dayjs/locale/es"
import { useMemo } from "react"
import { isSingleWorshipEvent } from "@/shared/utils/service-rules"
import type { ServiceSummary, SongListItem } from "@/types/services"
import type { ServiceInput } from "../services-api"
import { useMonthUsage } from "../use-month-usage"

const { Paragraph, Text } = Typography

export type ServiceFormValues = {
  title: string
  eventDate: Dayjs
  jubiloSongIds: string[]
  adoracionSongIds: string[]
  offeringSongId?: string
  prayerGuide?: string
  announcements?: string
}

// Si una alabanza ya está en esta cantidad de otros servicios del mes, se avisa al elegirla otra vez
const REPEAT_WARNING_COUNT = 2
// "6 dic y 13 dic"
const DATE_LIST = new Intl.ListFormat("es", { type: "conjunction" })

const PRAYER_PLACEHOLDER = "Vamos a orar por:\nLa iglesia local\nNuestro pastor\nNuestros obreros y misioneros"
const ANNOUNCEMENTS_PLACEHOLDER = "Dar los anuncios del día de mañana:\nSeminarios a las 9:00 a. m."

const toOption = (song: SongListItem) => ({
  label: `${song.name} (${song.key})${song.isYouth ? " · Jóvenes" : ""}${song.isService ? " · Servicios" : ""}`,
  value: song.id
})

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
}

export const ServiceForm = ({ form, songs, editingServiceId, saving, onSubmit, onCancel }: ServiceFormProps) => {
  const jubiloSongs = useMemo(() => songs.filter(song => song.category === "jubilo"), [songs])
  const adoracionSongs = useMemo(() => songs.filter(song => song.category === "adoracion"), [songs])
  // A song can only be in the service once, so the júbilo list and the offering hide each other's pick
  const pickedJubilo = Form.useWatch("jubiloSongIds", form)
  const pickedOffering = Form.useWatch("offeringSongId", form)
  const pickedAdoracion = Form.useWatch("adoracionSongIds", form)
  // Studies and the weekend 9:45 gathering: one worship song for the whole event
  const watchedTitle = Form.useWatch("title", form)
  const watchedDate = Form.useWatch("eventDate", form)
  const singleWorship = isSingleWorshipEvent(watchedTitle, watchedDate?.toDate())
  const datesBySong = useMonthUsage(watchedDate ? watchedDate.format("YYYY-MM") : null, editingServiceId)
  const monthName = watchedDate ? watchedDate.locale("es").format("MMMM") : ""

  // Nota bajo el campo cuando alguna de sus alabanzas ya se usó REPEAT_WARNING_COUNT veces o más en el mes
  const repeatNote = (songIds?: string[]) => {
    const repeated = (songIds ?? []).flatMap(songId => {
      const dates = datesBySong.get(songId) ?? []
      const song = songs.find(candidate => candidate.id === songId)
      return song && dates.length >= REPEAT_WARNING_COUNT ? [{ name: song.name, dates }] : []
    })
    if (!repeated.length) return undefined
    return (
      <span className="service-repeat-note">
        {repeated.map(({ name, dates }) => (
          <span key={name}>
            <ExclamationCircleOutlined /> {name} ya se usó {dates.length} veces en {monthName} ({DATE_LIST.format(dates)})
          </span>
        ))}
      </span>
    )
  }

  return (
    <Form
      form={form} layout="vertical"
      onFinish={values => onSubmit(toServiceInput(values))}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="title" label="Nombre del servicio"
            rules={[{ required: true, message: "Escribe el nombre" }]}>
            <Input placeholder="Ej. Servicio domingo" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="eventDate" label="Fecha del evento"
            rules={[{ required: true, message: "Selecciona la fecha" }]}>
            <DatePicker
              showTime={{ format: "h:mm a", minuteStep: 5 }} format="DD/MM/YYYY h:mm a"
              placeholder="Selecciona fecha y hora" style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        {!singleWorship && (
          <Col xs={24} md={12}>
            <Form.Item
              name="jubiloSongIds" label="Canciones de júbilo (mínimo 1)"
              extra={repeatNote(pickedJubilo)}
              rules={[{ required: true, type: "array", min: 1, message: "Selecciona al menos 1" }]}>
              <Select
                mode="multiple" placeholder="Busca o selecciona alabanzas"
                optionFilterProp="label"
                options={jubiloSongs.filter(song => song.id !== pickedOffering).map(toOption)} />
            </Form.Item>
          </Col>
        )}
        <Col xs={24} md={12}>
          <Form.Item
            name="adoracionSongIds"
            extra={repeatNote(pickedAdoracion)}
            label={singleWorship ? "Canción de adoración (solo 1)" : "Canciones de adoración (mínimo 1)"}
            rules={[
              { required: true, type: "array", min: 1, message: "Selecciona al menos 1" },
              ...(singleWorship ? [{ type: "array" as const, max: 1, message: "Este evento lleva solo 1" }] : [])
            ]}>
            <Select
              mode="multiple" maxCount={singleWorship ? 1 : undefined}
              placeholder="Busca o selecciona alabanzas"
              optionFilterProp="label"
              options={adoracionSongs.map(toOption)} />
          </Form.Item>
        </Col>
        {!singleWorship && (
          <Col xs={24} md={12}>
            <Form.Item
              name="offeringSongId" label="Canción de la ofrenda (opcional)"
              extra={repeatNote(pickedOffering ? [pickedOffering] : [])}>
              <Select
                showSearch allowClear
                placeholder="Busca o selecciona una de júbilo"
                optionFilterProp="label"
                options={jubiloSongs.filter(song => !pickedJubilo?.includes(song.id)).map(toOption)} />
            </Form.Item>
          </Col>
        )}
        {!singleWorship && (
          <>
            <Col span={24}>
              <Text strong>Guía para el dirigente (opcional)</Text>
              <Paragraph type="secondary" style={{ marginBottom: 12 }}>
                Escribe un punto por línea; una línea que termina en &quot;:&quot; sirve de título.
              </Paragraph>
            </Col>
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
          </>
        )}
      </Row>
      <div className="service-form-actions">
        {onCancel && <Button onClick={onCancel}>Cancelar</Button>}
        <Button
          type="primary" htmlType="submit"
          loading={saving}>
          {editingServiceId ? "Guardar cambios" : "Guardar servicio"}
        </Button>
      </div>
    </Form>
  )
}
