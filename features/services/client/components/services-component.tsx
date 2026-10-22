"use client"

import { useEffect, useMemo, useState } from "react"
import { PlusOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, DatePicker, Empty, Form, Input, Modal, Row, Select, Space, Typography } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/features/layout/client/components/session-provider"
import { ServiceCard } from "@/shared/components/service-card"
import type { ServiceWithSongs, SongWithMeta } from "@/types/services"
import { isSingleWorshipEvent } from "@/shared/utils/service-rules"

const { Title, Paragraph, Text } = Typography

type ServiceFormValues = {
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

const ServicesComponent = () => {
  const { modal, message } = App.useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form] = Form.useForm<ServiceFormValues>()
  const { isLeader } = useSession()
  const [songs, setSongs] = useState<SongWithMeta[]>([])
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [urlEditApplied, setUrlEditApplied] = useState(false)

  const jubiloSongs = useMemo(() => songs.filter(song => song.category === "jubilo"), [songs])
  const adoracionSongs = useMemo(() => songs.filter(song => song.category === "adoracion"), [songs])
  // A song can only be in the service once, so the júbilo list and the offering hide each other's pick
  const pickedJubilo = Form.useWatch("jubiloSongIds", form)
  const pickedOffering = Form.useWatch("offeringSongId", form)
  // Studies and the weekend 9:45 gathering: one worship song for the whole event
  const watchedTitle = Form.useWatch("title", form)
  const watchedDate = Form.useWatch("eventDate", form)
  const singleWorship = isSingleWorshipEvent(watchedTitle, watchedDate?.toDate())
  const toOption = (song: SongWithMeta) => ({ label: `${song.name} (${song.key})${song.isYouth ? " · Jóvenes" : ""}${song.isService ? " · Servicios" : ""}`, value: song.id })
  // With no services yet the form is the page; once there are some, it moves into a modal
  // so the list stays in front
  const formInModal = services.length > 0

  const fetchData = async () => {
    setLoading(true)
    try {
      const [songsResponse, servicesResponse] = await Promise.all([fetch("/api/songs"), fetch("/api/services")])
      setSongs(await songsResponse.json())
      setServices(await servicesResponse.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData().catch(() => message.error("No se pudo cargar la información"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startEdit = (service: ServiceWithSongs) => {
    setEditingServiceId(service.id)
    form.setFieldsValue({
      title: service.title,
      eventDate: dayjs(service.eventDate),
      jubiloSongIds: service.songs.filter(s => s.category === "jubilo" && !s.isOffering).sort((a, b) => a.position - b.position).map(s => s.songId),
      adoracionSongIds: service.songs.filter(s => s.category === "adoracion").sort((a, b) => a.position - b.position).map(s => s.songId),
      offeringSongId: service.songs.find(s => s.isOffering)?.songId,
      prayerGuide: service.prayerGuide ?? undefined,
      announcements: service.announcements ?? undefined
    })
    setFormOpen(true)
  }

  const startCreate = () => {
    setEditingServiceId(null)
    form.resetFields()
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingServiceId(null)
    form.resetFields()
  }

  useEffect(() => {
    if (urlEditApplied || !services.length) return
    const editId = searchParams.get("edit")
    if (!editId) return
    const target = services.find(service => service.id === editId)
    if (target) startEdit(target)
    setUrlEditApplied(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, searchParams, urlEditApplied])

  const saveService = async (values: ServiceFormValues) => {
    setSaving(true)
    try {
      const url = editingServiceId ? `/api/services/${editingServiceId}` : "/api/services"
      const response = await fetch(url, {
        method: editingServiceId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          jubiloSongIds: singleWorship ? [] : values.jubiloSongIds,
          adoracionSongIds: singleWorship ? values.adoracionSongIds.slice(0, 1) : values.adoracionSongIds,
          offeringSongId: singleWorship ? null : values.offeringSongId ?? null,
          prayerGuide: singleWorship ? null : values.prayerGuide,
          announcements: singleWorship ? null : values.announcements,
          eventDate: values.eventDate.toISOString()
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? "Error al guardar el servicio")
      message.success(editingServiceId ? "Servicio actualizado correctamente" : "Servicio creado correctamente")
      closeForm()
      await fetchData()
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al guardar el servicio")
    } finally {
      setSaving(false)
    }
  }

  const deleteService = (service: ServiceWithSongs) => {
    modal.confirm({
      title: "Eliminar servicio",
      content: `¿Seguro que deseas eliminar "${service.title}"? Esta acción no se puede deshacer.`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      async onOk() {
        const response = await fetch(`/api/services/${service.id}`, { method: "DELETE" })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message ?? "Error al eliminar")
        message.success("Servicio eliminado")
        if (editingServiceId === service.id) closeForm()
        await fetchData()
      }
    })
  }

  const serviceForm = (
    <Form
      form={form} layout="vertical"
      onFinish={saveService}>
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
              name="offeringSongId" label="Canción de la ofrenda (opcional)">
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
        {formInModal && <Button onClick={closeForm}>Cancelar</Button>}
        <Button
          type="primary" htmlType="submit"
          loading={saving}>
          {editingServiceId ? "Guardar cambios" : "Guardar servicio"}
        </Button>
      </div>
    </Form>
  )

  return (
    <div style={{ padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <Row
            align="middle" gutter={[16, 12]}
            justify="space-between">
            <Col flex="1 1 320px">
              <Title level={2} style={{ margin: 0 }}>Servicios</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Las canciones se tocan en el orden en que las eliges.
                Estudios y seminarios llevan solo 1 de adoración.
              </Paragraph>
            </Col>
            {isLeader && formInModal && (
              <Col>
                <Button
                  type="primary" size="large"
                  icon={<PlusOutlined />} onClick={startCreate}>
                  Agregar evento
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        {isLeader && !formInModal && !loading && (
          <Card title="Crear servicio">
            {serviceForm}
          </Card>
        )}

        {isLeader && formInModal && (
          <Modal
            open={formOpen} title={editingServiceId ? "Editar servicio" : "Agregar evento"}
            onCancel={closeForm} footer={null}
            width={760} forceRender>
            {serviceForm}
          </Modal>
        )}

        <Card loading={loading}>
          {services.length === 0 ? (
            <Empty description="Aún no hay servicios programados" />
          ) : (
            <div className="service-list">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id} service={service}
                  isNext={index === 0}
                  onOpen={() => router.push(`/en-curso?servicio=${service.id}`)}
                  onEdit={isLeader ? () => startEdit(service) : undefined}
                  onDelete={isLeader ? () => deleteService(service) : undefined} />
              ))}
            </div>
          )}
        </Card>
      </Space>
    </div>
  )
}

export default ServicesComponent
