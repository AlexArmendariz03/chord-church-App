"use client"

import { EditOutlined, PushpinOutlined } from "@ant-design/icons"
import { Alert, AutoComplete, Button, Col, Form, Input, Modal, Row, type FormInstance } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import "dayjs/locale/es"
import { useMemo, useState } from "react"
import type { ChurchPrayers } from "@/features/churches/types"
import { toGuideLines } from "@/features/live/closing-guide-lines"
import { isSingleWorshipEvent } from "@/features/services/service-rules"
import type { ServiceSummary } from "@/features/services/types"
import type { SongListItem } from "@/features/songs/types"
import type { ServiceInput } from "../services-api"
import { useMonthUsage } from "../use-month-usage"
import { DateTimeField } from "./date-time-field"
import { ServiceOrderSummary, type OrderItem } from "./service-order-summary"
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

const PRAYER_PLACEHOLDER = "Vacío: se usan las peticiones de la iglesia.\nEscribe aquí solo si este servicio lleva otra oración."
const CHURCH_PRAYERS_PLACEHOLDER = "Vamos a orar…\n1) Por esta iglesia\n- Nuestros nuevos conversos\n2) Por nuestro pastor\n“Si tiene una petición, levante la mano”"
const GUIDE_HINT = "Opcional. Un punto por línea (se numeran solos); \"-\" al inicio lo vuelve sub-punto, " +
  "una línea que termina en \":\" o \"…\" es título y una frase entre comillas queda como nota."
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
  // Las peticiones de la iglesia: salen en el momento de oración si el servicio no trae las suyas
  churchPrayers?: string | null
  onSaveChurchPrayers?: (prayers: ChurchPrayers) => Promise<boolean>
}

// Cada parte del formulario con su número: 1 Evento, 2 Orden de alabanzas, 3 Guía
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

export const ServiceForm = ({ form, songs, editingServiceId, saving, onSubmit, onCancel, titleSuggestions = [], churchPrayers, onSaveChurchPrayers }: ServiceFormProps) => {
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
  // El orden completo como se guardará: júbilo, adoración y al final la ofrenda
  const songById = useMemo(() => new Map(songs.map(song => [song.id, song])), [songs])
  const orderItems: OrderItem[] = [
    ...(singleWorship ? [] : pickedJubilo).map(id => ({ id, kind: "jubilo" as const })),
    ...pickedAdoracion.slice(0, adoracionCount).map(id => ({ id, kind: "adoracion" as const })),
    ...(!singleWorship && pickedOffering ? [{ id: pickedOffering, kind: "ofrenda" as const }] : [])
  ].flatMap(({ id, kind }) => {
    const song = songById.get(id)
    return song ? [{ song, kind }] : []
  })
  const laneProps = { datesBySong, monthName }

  // Las peticiones de la iglesia y su editor
  const prayerGuide = Form.useWatch("prayerGuide", form)
  const ownPrayer = Boolean(prayerGuide?.trim())
  const prayerCount = toGuideLines(churchPrayers).filter(line => line.type === "item").length
  const [prayersDraft, setPrayersDraft] = useState<string | null>(null)
  const [savingPrayers, setSavingPrayers] = useState(false)

  const saveChurchPrayers = async () => {
    if (!onSaveChurchPrayers || prayersDraft === null) return
    setSavingPrayers(true)
    const saved = await onSaveChurchPrayers({ prayerGuide: prayersDraft })
    setSavingPrayers(false)
    if (saved) setPrayersDraft(null)
  }

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
          <Alert
            type="info" showIcon
            title="Estudios, seminarios y la reunión de las 9:45 llevan solo 1 alabanza de adoración, sin júbilo, ofrenda ni guía." />
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
          hint={GUIDE_HINT}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="prayerGuide" label="Oración de este servicio">
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder={PRAYER_PLACEHOLDER} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="announcements" label="Anuncios del mes">
                <Input.TextArea autoSize={{ minRows: 4, maxRows: 10 }} placeholder={ANNOUNCEMENTS_PLACEHOLDER} />
              </Form.Item>
            </Col>
          </Row>
          {onSaveChurchPrayers && (
            <div className="service-form-template">
              <div className="service-form-template-text">
                <span className="service-form-template-title"><PushpinOutlined /> Peticiones de la iglesia</span>
                <span className="service-form-template-note">
                  {!prayerCount
                    ? "Todavía no hay peticiones. Agrégalas una vez y saldrán en el momento de oración de cada servicio."
                    : ownPrayer
                      ? `Este servicio usa su propia oración en lugar de las ${prayerCount} peticiones de la iglesia.`
                      : `Este servicio usa las ${prayerCount} peticiones de la iglesia en el momento de oración.`}
                </span>
              </div>
              <Button
                size="small" icon={<EditOutlined />}
                onClick={() => setPrayersDraft(churchPrayers ?? "")}>
                {prayerCount ? "Ver y editar" : "Agregar peticiones"}
              </Button>
            </div>
          )}
          <Modal
            open={prayersDraft !== null} title="Peticiones de la iglesia"
            okText="Guardar peticiones" cancelText="Cancelar"
            confirmLoading={savingPrayers} onOk={saveChurchPrayers}
            onCancel={() => setPrayersDraft(null)} destroyOnHidden>
            <p className="service-form-step-hint">
              Salen en el momento de oración de todos los servicios, también los que ya están creados.
              Un servicio con su propia oración usa esa en su lugar.
            </p>
            <Input.TextArea
              value={prayersDraft ?? ""} onChange={event => setPrayersDraft(event.target.value)}
              autoSize={{ minRows: 10, maxRows: 22 }} placeholder={CHURCH_PRAYERS_PLACEHOLDER} />
          </Modal>
        </Step>
      )}

      <footer className="service-form-actions">
        <ServiceOrderSummary items={orderItems} />
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
