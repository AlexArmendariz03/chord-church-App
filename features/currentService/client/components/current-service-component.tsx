"use client"

import { useEffect, useMemo, useState } from "react"
import { App, Button, Card, Col, Empty, Row, Space, Tag, Typography } from "antd"
import type { ServiceWithSongs } from "@/types/services"

const { Paragraph, Title, Text } = Typography

const CurrentServiceComponent = () => {
  const { message } = App.useApp()
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(true)
  const [activeServiceSongId, setActiveServiceSongId] = useState<string | null>(null)

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
  const activeSong = useMemo(() => {
    if (!currentService) return null
    return currentService.songs.find((serviceSong) => serviceSong.id === activeServiceSongId) ?? currentService.songs[0] ?? null
  }, [activeServiceSongId, currentService])
  const activeIndex = currentService?.songs.findIndex((serviceSong) => serviceSong.id === activeSong?.id) ?? -1

  useEffect(() => {
    if (currentService?.songs[0] && !activeServiceSongId) {
      setActiveServiceSongId(currentService.songs[0].id)
    }
  }, [activeServiceSongId, currentService])

  const goToSong = (nextIndex: number) => {
    const nextSong = currentService?.songs[nextIndex]
    if (nextSong) setActiveServiceSongId(nextSong.id)
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Card loading={loading}>
          <Title level={2}>En curso demo</Title>
          <Paragraph>
            Vista previa para el músico: abre cada alabanza del servicio programado para ver tono, categoría y letra en pantalla grande.
          </Paragraph>
        </Card>

        {!loading && !currentService ? (
          <Empty description="No hay servicio en curso o próximo" />
        ) : currentService ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card title="Alabanzas programadas" extra={<Text strong>{new Date(currentService.eventDate).toLocaleString()}</Text>}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Title level={4} style={{ marginTop: 0 }}>{currentService.title}</Title>
                  {currentService.songs.map(({ id, song, category, position }) => (
                    <Button
                      block
                      key={id}
                      type={activeSong?.id === id ? "primary" : "default"}
                      onClick={() => setActiveServiceSongId(id)}
                      style={{ height: "auto", justifyContent: "flex-start", padding: "10px 12px", textAlign: "left" }}
                    >
                      {position}. {song.name} · {song.key} · {category === "jubilo" ? "Júbilo" : "Adoración"}
                    </Button>
                  ))}
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              {activeSong ? (
                <Card
                  title={`${activeSong.position}. ${activeSong.song.name}`}
                  extra={<Tag color={activeSong.category === "jubilo" ? "green" : "purple"}>{activeSong.category === "jubilo" ? "Júbilo" : "Adoración"}</Tag>}
                >
                  <Space direction="vertical" size={18} style={{ width: "100%" }}>
                    <Title level={1} style={{ margin: 0 }}>Tono: {activeSong.song.key}</Title>
                    <Paragraph style={{ whiteSpace: "pre-wrap", fontSize: 24, lineHeight: 1.6, marginBottom: 0 }}>
                      {activeSong.song.lyrics}
                    </Paragraph>
                    <Space>
                      <Button disabled={activeIndex <= 0} onClick={() => goToSong(activeIndex - 1)}>
                        Anterior
                      </Button>
                      <Button disabled={!currentService.songs[activeIndex + 1]} type="primary" onClick={() => goToSong(activeIndex + 1)}>
                        Siguiente
                      </Button>
                    </Space>
                  </Space>
                </Card>
              ) : (
                <Empty description="Selecciona una alabanza" />
              )}
            </Col>
          </Row>
        ) : null}
      </Space>
    </div>
  )
}

export default CurrentServiceComponent
