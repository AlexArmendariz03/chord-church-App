"use client"

import { useEffect, useMemo, useState } from "react"
import { App, Button, Card, Col, DatePicker, Empty, Form, Input, Row, Select, Space, Tag, Typography } from "antd"
import type { Dayjs } from "dayjs"
import type { ServiceWithSongs, SongWithMeta } from "@/types/services"

const { Title, Paragraph, Text } = Typography

type ServiceFormValues = {
  title: string
  eventDate: Dayjs
  jubiloSongIds: string[]
  adoracionSongIds: string[]
}

const ServicesComponent = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm<ServiceFormValues>()
  const [role, setRole] = useState<string>("musico")
  const [songs, setSongs] = useState<SongWithMeta[]>([])
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(false)

  const isLeader = role === "dirigente" || role === "leader"
  const jubiloSongs = useMemo(() => songs.filter((song) => song.category === "jubilo"), [songs])
  const adoracionSongs = useMemo(() => songs.filter((song) => song.category === "adoracion"), [songs])

  const fetchData = async () => {
    const [songsResponse, servicesResponse] = await Promise.all([fetch("/api/songs"), fetch("/api/services")])
    setSongs(await songsResponse.json())
    setServices(await servicesResponse.json())
  }

  useEffect(() => {
    setRole(localStorage.getItem("userRole") ?? "musico")
    fetchData().catch(() => message.error("No se pudo cargar la información"))
  }, [message])

  const createService = async (values: ServiceFormValues) => {
    setLoading(true)
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, eventDate: values.eventDate.toISOString() })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? "Error al guardar el servicio")
      message.success("Servicio creado correctamente")
      form.resetFields()
      await fetchData()
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al guardar el servicio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Card>
          <Title level={2}>Servicios</Title>
          <Paragraph>
            El dirigente crea el servicio seleccionando exactamente <Text strong>2 canciones de júbilo</Text> y <Text strong>2 de adoración</Text>. El músico solo ve las letras y tonos del servicio vigente en la fecha guardada.
          </Paragraph>
          <Tag color={isLeader ? "gold" : "blue"}>Rol actual: {isLeader ? "Dirigente" : "Músico"}</Tag>
        </Card>

        {isLeader && (
          <Card title="Crear servicio">
            <Form form={form} layout="vertical" onFinish={createService}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="title" label="Nombre del servicio" rules={[{ required: true, message: "Escribe el nombre" }]}>
                    <Input placeholder="Ej. Servicio domingo" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="eventDate" label="Fecha del evento" rules={[{ required: true, message: "Selecciona la fecha" }]}>
                    <DatePicker showTime style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="jubiloSongIds" label="2 canciones de júbilo" rules={[{ required: true, type: "array", len: 2, message: "Selecciona exactamente 2" }]}>
                    <Select mode="multiple" maxCount={2} options={jubiloSongs.map((song) => ({ label: `${song.name} (${song.key})`, value: song.id }))} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="adoracionSongIds" label="2 canciones de adoración" rules={[{ required: true, type: "array", len: 2, message: "Selecciona exactamente 2" }]}>
                    <Select mode="multiple" maxCount={2} options={adoracionSongs.map((song) => ({ label: `${song.name} (${song.key})`, value: song.id }))} />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" htmlType="submit" loading={loading}>Guardar servicio</Button>
            </Form>
          </Card>
        )}

        {services.length === 0 ? <Empty description="No hay servicios activos" /> : services.map((service) => (
          <Card key={service.id} title={service.title} extra={new Date(service.eventDate).toLocaleString()}>
            <Row gutter={[16, 16]}>
              {service.songs.map(({ id, song, category, position }) => (
                <Col xs={24} md={12} key={id}>
                  <Card size="small" title={`${position}. ${song.name}`} extra={<Tag color={category === "jubilo" ? "green" : "purple"}>{category === "jubilo" ? "Júbilo" : "Adoración"}</Tag>}>
                    <Title level={4}>Tono: {song.key}</Title>
                    <Paragraph style={{ whiteSpace: "pre-wrap" }}>{song.lyrics}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        ))}
      </Space>
    </div>
  )
}

export default ServicesComponent
