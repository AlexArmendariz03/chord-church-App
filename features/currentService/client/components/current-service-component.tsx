"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CompressOutlined,
  ExpandOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MinusOutlined,
  PlusOutlined
} from "@ant-design/icons"
import { App, Button, Card, Col, Empty, Row, Space, Tag, Tooltip, Typography } from "antd"
import type { ServiceWithSongs } from "@/types/services"

const { Paragraph, Title, Text } = Typography

const CurrentServiceComponent = () => {
  const { message } = App.useApp()
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(true)
  const [activeServiceSongId, setActiveServiceSongId] = useState<string | null>(null)
  const [isSongListCollapsed, setIsSongListCollapsed] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [fontSize, setFontSize] = useState(30)

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

  const togglePresentationMode = async () => {
    const nextPresentationMode = !isPresentationMode
    setIsPresentationMode(nextPresentationMode)
    setIsSongListCollapsed(nextPresentationMode)

    try {
      if (nextPresentationMode && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }

      if (!nextPresentationMode && document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch {
      message.info("Modo presentación activado dentro de la página")
    }
  }

  const increaseFont = () => setFontSize((current) => Math.min(current + 4, 56))
  const decreaseFont = () => setFontSize((current) => Math.max(current - 4, 22))

  return (
    <div
      style={{
        background: isPresentationMode ? "#0f172a" : undefined,
        inset: isPresentationMode ? 0 : undefined,
        minHeight: isPresentationMode ? "100vh" : undefined,
        overflow: isPresentationMode ? "auto" : undefined,
        padding: isPresentationMode ? 0 : 0,
        position: isPresentationMode ? "fixed" : "relative",
        zIndex: isPresentationMode ? 2000 : 1
      }}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {!isPresentationMode && (
          <Card loading={loading}>
            <Title level={2}>En curso demo</Title>
            <Paragraph>
              Vista previa para el músico: la lista queda colapsable al lado izquierdo y la letra se puede poner en pantalla completa para verla durante el servicio.
            </Paragraph>
          </Card>
        )}

        {!loading && !currentService ? (
          <Empty description="No hay servicio en curso o próximo" />
        ) : currentService ? (
          <Row gutter={isPresentationMode ? [0, 0] : [16, 16]} style={{ minHeight: isPresentationMode ? "100vh" : undefined }}>
            {!isSongListCollapsed && (
              <Col xs={24} lg={isPresentationMode ? 6 : 8}>
                <Card
                  title="Alabanzas programadas"
                  extra={<Text strong>{new Date(currentService.eventDate).toLocaleString()}</Text>}
                  style={{ height: "100%", borderRadius: isPresentationMode ? 0 : 8 }}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Title level={4} style={{ marginTop: 0 }}>{currentService.title}</Title>
                    {currentService.songs.map(({ id, song, category, position }) => (
                      <Button
                        block
                        key={id}
                        type={activeSong?.id === id ? "primary" : "default"}
                        onClick={() => setActiveServiceSongId(id)}
                        style={{ height: "auto", justifyContent: "flex-start", padding: "12px", textAlign: "left", whiteSpace: "normal" }}
                      >
                        {position}. {song.name} · {song.key} · {category === "jubilo" ? "Júbilo" : "Adoración"}
                      </Button>
                    ))}
                  </Space>
                </Card>
              </Col>
            )}

            <Col xs={24} lg={isSongListCollapsed ? 24 : isPresentationMode ? 18 : 16}>
              {activeSong ? (
                <Card
                  title={
                    <Space wrap>
                      <Tooltip title={isSongListCollapsed ? "Mostrar lista" : "Colapsar lista"}>
                        <Button
                          aria-label={isSongListCollapsed ? "Mostrar lista" : "Colapsar lista"}
                          icon={isSongListCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                          onClick={() => setIsSongListCollapsed((current) => !current)}
                        />
                      </Tooltip>
                      <span>{activeSong.position}. {activeSong.song.name}</span>
                    </Space>
                  }
                  extra={<Tag color={activeSong.category === "jubilo" ? "green" : "purple"}>{activeSong.category === "jubilo" ? "Júbilo" : "Adoración"}</Tag>}
                  style={{ minHeight: isPresentationMode ? "100vh" : 620, borderRadius: isPresentationMode ? 0 : 8 }}
                  styles={{ body: { background: isPresentationMode ? "#0f172a" : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" } }}
                >
                  <Space direction="vertical" size={22} style={{ width: "100%" }}>
                    <Row justify="space-between" align="middle" gutter={[12, 12]}>
                      <Col>
                        <Space size={12} wrap>
                          <Title level={1} style={{ margin: 0, color: isPresentationMode ? "#f8fafc" : undefined }}>Tono: {activeSong.song.key}</Title>
                          <Text style={{ color: isPresentationMode ? "#cbd5e1" : undefined }}>Canción {activeIndex + 1} de {currentService.songs.length}</Text>
                        </Space>
                      </Col>
                      <Col>
                        <Space wrap>
                          <Tooltip title="Reducir letra">
                            <Button aria-label="Reducir letra" icon={<MinusOutlined />} onClick={decreaseFont} />
                          </Tooltip>
                          <Tooltip title="Aumentar letra">
                            <Button aria-label="Aumentar letra" icon={<PlusOutlined />} onClick={increaseFont} />
                          </Tooltip>
                          <Tooltip title={isPresentationMode ? "Salir de pantalla completa" : "Pantalla completa"}>
                            <Button
                              aria-label={isPresentationMode ? "Salir de pantalla completa" : "Pantalla completa"}
                              icon={isPresentationMode ? <CompressOutlined /> : <ExpandOutlined />}
                              type="primary"
                              onClick={togglePresentationMode}
                            />
                          </Tooltip>
                        </Space>
                      </Col>
                    </Row>

                    <div
                      style={{
                        background: isPresentationMode ? "#111827" : "#ffffff",
                        border: isPresentationMode ? "1px solid #334155" : "1px solid #e5e7eb",
                        borderRadius: 20,
                        boxShadow: isPresentationMode ? "none" : "0 18px 45px rgba(15, 23, 42, 0.08)",
                        color: isPresentationMode ? "#f8fafc" : "#111827",
                        minHeight: isPresentationMode ? "calc(100vh - 240px)" : 380,
                        padding: isPresentationMode ? 44 : 32
                      }}
                    >
                      <Paragraph style={{ whiteSpace: "pre-wrap", fontSize, lineHeight: 1.55, marginBottom: 0, color: "inherit" }}>
                        {activeSong.song.lyrics}
                      </Paragraph>
                    </div>

                    <Row justify="space-between" align="middle" gutter={[12, 12]}>
                      <Col>
                        <Button disabled={activeIndex <= 0} size="large" onClick={() => goToSong(activeIndex - 1)}>
                          Anterior
                        </Button>
                      </Col>
                      <Col>
                        <Space>
                          {currentService.songs.map((serviceSong, index) => (
                            <Button
                              key={serviceSong.id}
                              shape="circle"
                              type={serviceSong.id === activeSong.id ? "primary" : "default"}
                              onClick={() => goToSong(index)}
                            >
                              {index + 1}
                            </Button>
                          ))}
                        </Space>
                      </Col>
                      <Col>
                        <Button disabled={!currentService.songs[activeIndex + 1]} size="large" type="primary" onClick={() => goToSong(activeIndex + 1)}>
                          Siguiente
                        </Button>
                      </Col>
                    </Row>
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
