"use client"

import { useEffect, useMemo, useState } from "react"
import { App, Card, Col, Empty, Row, Space, Tag, Typography } from "antd"
import type { ServiceWithSongs } from "@/types/services"

const { Paragraph, Title, Text } = Typography

const CurrentServiceComponent = () => {
  const { message } = App.useApp()
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services")
        const data = (await response.json()) as ServiceWithSongs[]
        if (!response.ok) throw new Error("No se pudo cargar el servicio en curso")
        setServices(data)
      } catch (error) {
        message.error(error instanceof Error ? error.message : "Error al cargar el servicio")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [message])

  const currentService = useMemo(() => services[0], [services])

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Card loading={loading}>
          <Title level={2}>En curso demo</Title>
          <Paragraph>
            Aquí se muestra el próximo servicio vigente del flujo hardcodeado, según la fecha y hora guardada en Servicios.
          </Paragraph>
        </Card>

        {!loading && !currentService ? (
          <Empty description="No hay servicio en curso o próximo" />
        ) : currentService ? (
          <Card title={currentService.title} extra={<Text strong>{new Date(currentService.eventDate).toLocaleString()}</Text>}>
            <Row gutter={[16, 16]}>
              {currentService.songs.map(({ id, song, category, position }) => (
                <Col xs={24} md={12} key={id}>
                  <Card
                    size="small"
                    title={`${position}. ${song.name}`}
                    extra={<Tag color={category === "jubilo" ? "green" : "purple"}>{category === "jubilo" ? "Júbilo" : "Adoración"}</Tag>}
                  >
                    <Title level={4}>Tono: {song.key}</Title>
                    <Paragraph style={{ whiteSpace: "pre-wrap" }}>{song.lyrics}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        ) : null}
      </Space>
    </div>
  )
}

export default CurrentServiceComponent
