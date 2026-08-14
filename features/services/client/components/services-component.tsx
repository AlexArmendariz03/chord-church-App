"use client"

import { useEffect, useMemo, useState } from "react"
import { MoreOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, Collapse, DatePicker, Dropdown, Empty, Form, Input, Row, Select, Space, Tag, Typography } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { useSearchParams } from "next/navigation"
import type { ServiceWithSongs, SongWithMeta } from "@/types/services"

const { Title, Paragraph, Text } = Typography

type ServiceFormValues = {
  title: string
  eventDate: Dayjs
  jubiloSongIds: string[]
  adoracionSongIds: string[]
}

const ServicesComponent = () => {
  const { modal, message } = App.useApp()
  const searchParams = useSearchParams()
  const [form] = Form.useForm<ServiceFormValues>()
  const [role, setRole] = useState<string>("musico")
  const [songs, setSongs] = useState<SongWithMeta[]>([])
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [urlEditApplied, setUrlEditApplied] = useState(false)

  const isLeader = role === "leader"
  const jubiloSongs = useMemo(() => songs.filter(song => song.category === "jubilo"), [songs])
  const adoracionSongs = useMemo(() => songs.filter(song => song.category === "adoracion"), [songs])

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
    setRole(localStorage.getItem("userRole") ?? "musico")
    fetchData().catch(() => message.error("No se pudo cargar la información"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startEdit = (service: ServiceWithSongs) => {
    setEditingServiceId(service.id)
    form.setFieldsValue({
      title: service.title,
      eventDate: dayjs(service.eventDate),
      jubiloSongIds: service.songs.filter(s => s.category === "jubilo").sort((a, b) => a.position - b.position).map(s => s.songId),
      adoracionSongIds: service.songs.filter(s => s.category === "adoracion").sort((a, b) => a.position - b.position).map(s => s.songId)
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
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
        body: JSON.stringify({ ...values, eventDate: values.eventDate.toISOString() })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? "Error al guardar el servicio")
      message.success(editingServiceId ? "Servicio actualizado correctamente" : "Servicio creado correctamente")
      setEditingServiceId(null)
      form.resetFields()
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
        if (editingServiceId === service.id) cancelEdit()
        await fetchData()
      }
    })
  }

  return (
    <div style={{ padding: 24 }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        <Card>
          <Title level={2}>Servicios</Title>
          <Paragraph>
            El líder crea el servicio seleccionando al menos <Text strong>1 canción de júbilo</Text> y <Text strong>1 de adoración</Text>. El músico no edita ni crea alabanzas: solo ve los servicios programados y puede abrir cada alabanza desde En curso.
          </Paragraph>
          <Tag color={isLeader ? "gold" : "blue"}>Rol actual: {isLeader ? "Líder" : "Músico"}</Tag>
        </Card>

        {isLeader && (
          <Card title={editingServiceId ? "Editando servicio" : "Crear servicio"}>
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
                    <DatePicker showTime style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="jubiloSongIds" label="Canciones de júbilo (mínimo 1)"
                    rules={[{ required: true, type: "array", min: 1, message: "Selecciona al menos 1" }]}>
                    <Select
                      mode="multiple"
                      options={jubiloSongs.map(song => ({ label: `${song.name} (${song.key})`, value: song.id }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="adoracionSongIds" label="Canciones de adoración (mínimo 1)"
                    rules={[{ required: true, type: "array", min: 1, message: "Selecciona al menos 1" }]}>
                    <Select
                      mode="multiple"
                      options={adoracionSongs.map(song => ({ label: `${song.name} (${song.key})`, value: song.id }))} />
                  </Form.Item>
                </Col>
              </Row>
              <Space>
                <Button
                  type="primary" htmlType="submit"
                  loading={saving}>
                  {editingServiceId ? "Guardar cambios" : "Guardar servicio"}
                </Button>
                {editingServiceId && <Button onClick={cancelEdit}>Cancelar</Button>}
              </Space>
            </Form>
          </Card>
        )}

        <Card loading={loading}>
          {services.length === 0 ? (
            <Empty description="No hay servicios activos" />
          ) : (
            <Collapse
              ghost
              className="collapse-panel-list"
              items={services.map(service => ({
                key: service.id,
                label: (
                  <Row
                    align="middle" gutter={12}
                    wrap={false}>
                    <Col flex="auto">
                      <Text strong>{service.title}</Text>
                      <br />
                      <Text
                        type="secondary" style={{ fontSize: 13 }}>
                        {new Date(service.eventDate).toLocaleString()}
                      </Text>
                    </Col>
                    <Col>
                      <Space size={4}>
                        <Tag color="gold">{service.songs.filter(s => s.category === "jubilo").length} júbilo</Tag>
                        <Tag color="purple">{service.songs.filter(s => s.category === "adoracion").length} adoración</Tag>
                      </Space>
                    </Col>
                    {isLeader && (
                      <Col onClick={e => e.stopPropagation()}>
                        <Dropdown
                          trigger={["click"]}
                          menu={{
                            items: [
                              { key: "edit", label: "Editar" },
                              { key: "delete", label: "Eliminar", danger: true }
                            ],
                            onClick: ({ key }) => {
                              if (key === "edit") startEdit(service)
                              if (key === "delete") deleteService(service)
                            }
                          }}>
                          <Button
                            type="text" icon={<MoreOutlined />}
                            aria-label="Más acciones" />
                        </Dropdown>
                      </Col>
                    )}
                  </Row>
                ),
                children: (
                  <div>
                    {[...service.songs].sort((a, b) => a.position - b.position).map(({ id, song, category, position }) => (
                      <div key={id} className="nested-song-row">
                        <Text>{position}. {song.name}</Text>
                        <Space>
                          <Text type="secondary">Tono: {song.key}</Text>
                          <Tag color={category === "jubilo" ? "green" : "purple"}>
                            {category === "jubilo" ? "Júbilo" : "Adoración"}
                          </Tag>
                        </Space>
                      </div>
                    ))}
                  </div>
                )
              }))} />
          )}
        </Card>
      </Space>
    </div>
  )
}

export default ServicesComponent
