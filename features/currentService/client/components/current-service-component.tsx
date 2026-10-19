"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type TouchEvent } from "react"
import {
  CompressOutlined,
  ExpandOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from "@ant-design/icons"
import { App, Button, Card, Col, Empty, Row, Space, Tag, Typography } from "antd"
import { formatServiceDate } from "@/shared/utils/dates"
import type { ServiceWithSongs } from "@/types/services"

const { Title, Text } = Typography

const LONG_LYRICS_LINE_THRESHOLD = 24
const MIN_FONT_SIZE = 14
const MAX_FONT_SIZE = 56
const FONT_STEP = 4
const BASE_FONT_SIZE_NORMAL = 30
const BASE_FONT_SIZE_PRESENTATION = 40
// Below this width (tablets like iPad included), 2 narrow columns of chords+lyrics
// get too cramped to read — show one comfortable scrollable column instead.
const TWO_COLUMN_MIN_WIDTH = "(min-width: 1200px)"
// Matches the breakpoint in current-service.scss where the list moves below the lyrics.
const STACKED_LAYOUT_MAX_WIDTH = "(max-width: 991.98px)"
// Minimum horizontal drag (px) to treat a touch gesture as "change song" instead of a
// vertical scroll or an accidental tap.
const SWIPE_THRESHOLD = 60

const splitLyricsIntoColumns = (lyrics: string): string[] => {
  const totalLines = lyrics.split("\n").length
  if (totalLines <= LONG_LYRICS_LINE_THRESHOLD) return [lyrics]

  // Split on blank lines, tolerating trailing spaces on the blank line itself
  const stanzas = lyrics.split(/\n\s*\n/).map(chunk => chunk.trim()).filter(Boolean)
  if (stanzas.length < 2) return [lyrics]

  const stanzaLineCounts = stanzas.map(chunk => chunk.split("\n").length)
  const targetLines = totalLines / 2

  let cumulative = 0
  let bestSplitIndex = 0
  let bestDiff = Infinity

  for (let i = 0; i < stanzas.length - 1; i++) {
    cumulative += stanzaLineCounts[i]
    const diff = Math.abs(cumulative - targetLines)
    if (diff < bestDiff) {
      bestDiff = diff
      bestSplitIndex = i
    }
  }

  const firstColumn = stanzas.slice(0, bestSplitIndex + 1).join("\n\n")
  const secondColumn = stanzas.slice(bestSplitIndex + 1).join("\n\n")
  return [firstColumn, secondColumn]
}


const CurrentServiceComponent = () => {
  const { message } = App.useApp()
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(true)
  const [activeServiceSongId, setActiveServiceSongId] = useState<string | null>(null)
  const [isSongListCollapsed, setIsSongListCollapsed] = useState(false)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  // Auto-fit picks the size that fits the box; A+/A− apply an offset on top of it so
  // the manual adjustment survives song changes and screen rotations.
  const [autoFontSize, setAutoFontSize] = useState(BASE_FONT_SIZE_NORMAL)
  const [fontOffset, setFontOffset] = useState(0)
  const fontSize = Math.min(Math.max(autoFontSize + fontOffset, MIN_FONT_SIZE), MAX_FONT_SIZE)
  const [isWideScreen, setIsWideScreen] = useState(false)
  const lyricsBoxRef = useRef<HTMLDivElement | null>(null)
  const mainColumnRef = useRef<HTMLDivElement | null>(null)
  const columnRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const mediaQuery = window.matchMedia(TWO_COLUMN_MIN_WIDTH)
    const updateIsWideScreen = () => setIsWideScreen(mediaQuery.matches)
    updateIsWideScreen()
    mediaQuery.addEventListener("change", updateIsWideScreen)
    return () => mediaQuery.removeEventListener("change", updateIsWideScreen)
  }, [])

  // The browser can exit real fullscreen without going through our "Salir" button
  // (Esc key, iPad system gesture, Safari auto-exit) — without this, isPresentationMode
  // stays stuck true and the fixed full-screen overlay hides the header with no way back.
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresentationMode(false)
        setIsSongListCollapsed(false)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

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

  // The API returns services from a few hours ago onwards, sorted by date. Prefer the
  // most recent one that already started (the service happening now) over the next one.
  const currentService = useMemo(() => {
    const now = Date.now()
    const started = services.filter(service => new Date(service.eventDate).getTime() <= now)
    return started.at(-1) ?? services[0]
  }, [services])
  const activeSong = useMemo(() => {
    if (!currentService) return null
    return currentService.songs.find(serviceSong => serviceSong.id === activeServiceSongId) ?? currentService.songs[0] ?? null
  }, [activeServiceSongId, currentService])
  const activeIndex = currentService?.songs.findIndex(serviceSong => serviceSong.id === activeSong?.id) ?? -1
  const lyricsColumns = useMemo(() => {
    const lyrics = activeSong?.song.lyrics ?? ""
    return isWideScreen ? splitLyricsIntoColumns(lyrics) : [lyrics]
  }, [activeSong, isWideScreen])

  useEffect(() => {
    if (currentService?.songs[0] && !activeServiceSongId) {
      setActiveServiceSongId(currentService.songs[0].id)
    }
  }, [activeServiceSongId, currentService])

  useLayoutEffect(() => {
    const fitLyricsToBox = () => {
      const box = lyricsBoxRef.current
      const columns = columnRefs.current.filter((el): el is HTMLDivElement => Boolean(el))
      if (!box || columns.length === 0) return

      const base = isPresentationMode ? BASE_FONT_SIZE_PRESENTATION : BASE_FONT_SIZE_NORMAL
      const previousInlineSizes = columns.map(column => column.style.fontSize)
      // Small safety margin so sub-pixel rounding never tips a "just fits" measurement into a scrollbar
      const available = box.clientHeight * 0.97

      // Line-wrapping height doesn't scale linearly with font size (narrower columns wrap
      // more aggressively), so scan candidate sizes and measure actual rendered height
      // instead of estimating with a single proportional guess.
      let bestFit = available > 0 ? MIN_FONT_SIZE : base
      for (let size = base; available > 0 && size >= MIN_FONT_SIZE; size--) {
        columns.forEach(column => { column.style.fontSize = `${size}px` })
        if (Math.max(...columns.map(column => column.scrollHeight)) <= available) {
          bestFit = size
          break
        }
      }

      columns.forEach((column, index) => { column.style.fontSize = previousInlineSizes[index] })
      setAutoFontSize(bestFit)
    }

    fitLyricsToBox()
    window.addEventListener("resize", fitLyricsToBox)
    return () => window.removeEventListener("resize", fitLyricsToBox)
  }, [activeSong?.id, lyricsColumns, isPresentationMode])

  // On phones the song list sits below the lyrics; after picking a song, bring the lyrics back into view.
  const selectSongFromList = (serviceSongId: string) => {
    setActiveServiceSongId(serviceSongId)
    if (window.matchMedia(STACKED_LAYOUT_MAX_WIDTH).matches) {
      mainColumnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const goToSong = (nextIndex: number) => {
    const nextSong = currentService?.songs[nextIndex]
    if (nextSong) setActiveServiceSongId(nextSong.id)
  }

  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    const isHorizontalSwipe = Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.5
    if (!isHorizontalSwipe) return

    goToSong(activeIndex + (deltaX < 0 ? 1 : -1))
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

  const increaseFont = () => setFontOffset(Math.min(fontSize + FONT_STEP, MAX_FONT_SIZE) - autoFontSize)
  const decreaseFont = () => setFontOffset(Math.max(fontSize - FONT_STEP, MIN_FONT_SIZE) - autoFontSize)

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
      }}>
      <Space
        orientation="vertical" size={20}
        style={{ width: "100%" }}>
        {!isPresentationMode && (
          <Card loading={loading}>
            <Title level={2} style={{ marginBottom: 0 }}>En curso</Title>
          </Card>
        )}

        {!loading && !currentService ? (
          <Empty description="No hay servicio en curso o próximo" />
        ) : currentService ? (
          <Row gutter={isPresentationMode ? [0, 0] : [16, 16]} style={{ minHeight: isPresentationMode ? "100vh" : undefined }}>
            {!isSongListCollapsed && (
              <Col
                xs={24} lg={isPresentationMode ? 6 : 8}
                className="current-service-sidebar-col">
                <Card
                  title="Alabanzas programadas"
                  extra={<Text strong>{formatServiceDate(currentService.eventDate)}</Text>}
                  style={{ height: "100%", borderRadius: isPresentationMode ? 0 : 8 }}>
                  <Space
                    orientation="vertical" size={8}
                    style={{ width: "100%" }}>
                    <Title level={4} style={{ marginTop: 0 }}>{currentService.title}</Title>
                    {currentService.songs.map(({ id, song, category, position }) => (
                      <div
                        key={id}
                        role="button" tabIndex={0}
                        className={`current-service-song-row is-${category} ${activeSong?.id === id ? "is-active" : ""}`}
                        onClick={() => selectSongFromList(id)}
                        onKeyDown={e => e.key === "Enter" && selectSongFromList(id)}>
                        <span>
                          <span className="current-service-song-name">{position}. {song.name}</span>
                          <span className="current-service-song-meta">Tono {song.key}</span>
                        </span>
                        <Tag color={category === "jubilo" ? "green" : "purple"}>
                          {category === "jubilo" ? "Júbilo" : "Adoración"}
                        </Tag>
                      </div>
                    ))}
                  </Space>
                </Card>
              </Col>
            )}

            <Col
              ref={mainColumnRef} xs={24}
              lg={isSongListCollapsed ? 24 : isPresentationMode ? 18 : 16}
              className="current-service-main-col">
              {activeSong ? (
                <Card
                  title={
                    <Space wrap>
                      <Button
                        aria-label={isSongListCollapsed ? "Mostrar lista" : "Ocultar lista"}
                        icon={isSongListCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setIsSongListCollapsed(current => !current)}>
                        {isSongListCollapsed ? "Lista" : "Ocultar"}
                      </Button>
                      <span>{activeSong.position}. {activeSong.song.name}</span>
                    </Space>
                  }
                  extra={<Tag color={activeSong.category === "jubilo" ? "green" : "purple"}>{activeSong.category === "jubilo" ? "Júbilo" : "Adoración"}</Tag>}
                  style={{ minHeight: isPresentationMode ? "100vh" : 620, borderRadius: isPresentationMode ? 0 : 8 }}
                  styles={{ body: { background: isPresentationMode ? "#0f172a" : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" } }}>
                  <Space
                    orientation="vertical" size={22}
                    style={{ width: "100%" }}>
                    <Row
                      justify="space-between" align="middle"
                      gutter={[12, 12]}>
                      <Col>
                        <Space
                          size={12} align="center"
                          wrap>
                          <span className={`current-service-key-badge ${isPresentationMode ? "is-dark" : ""}`}>
                            Tono: {activeSong.song.key}
                          </span>
                          <Text style={{ color: isPresentationMode ? "#cbd5e1" : undefined }}>Canción {activeIndex + 1} de {currentService.songs.length}</Text>
                        </Space>
                      </Col>
                      <Col>
                        <Space wrap size={8}>
                          <Button
                            aria-label="Reducir letra" size="large"
                            disabled={fontSize <= MIN_FONT_SIZE} onClick={decreaseFont}>
                            A−
                          </Button>
                          <Button
                            aria-label="Aumentar letra" size="large"
                            disabled={fontSize >= MAX_FONT_SIZE} onClick={increaseFont}>
                            A+
                          </Button>
                          <Button
                            aria-label={isPresentationMode ? "Salir de pantalla completa" : "Pantalla completa"}
                            icon={isPresentationMode ? <CompressOutlined /> : <ExpandOutlined />}
                            size="large" type="primary"
                            onClick={togglePresentationMode}>
                            {isPresentationMode ? "Salir" : "Pantalla completa"}
                          </Button>
                        </Space>
                      </Col>
                    </Row>

                    <div
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        background: isPresentationMode ? "#111827" : "#ffffff",
                        border: isPresentationMode ? "1px solid #334155" : "1px solid #e5e7eb",
                        borderRadius: 20,
                        boxShadow: isPresentationMode ? "none" : "0 18px 45px rgba(15, 23, 42, 0.08)",
                        color: isPresentationMode ? "#f8fafc" : "#111827",
                        height: isPresentationMode ? "calc(100vh - 240px)" : 480,
                        padding: isPresentationMode ? 44 : 32
                      }}>
                      <div
                        ref={lyricsBoxRef}
                        className={lyricsColumns.length > 1 ? "current-service-lyrics-columns" : undefined}
                        style={{
                          flex: "1 1 auto",
                          minHeight: 0,
                          overflow: "auto",
                          display: lyricsColumns.length > 1 ? "flex" : "block"
                        }}>
                        {lyricsColumns.map((column, index) => (
                          <div
                            key={index}
                            className={lyricsColumns.length > 1 ? "current-service-lyrics-column" : undefined}>
                            <div
                              ref={el => { columnRefs.current[index] = el }}
                              style={{ whiteSpace: "pre-wrap", fontSize, lineHeight: 1.55, color: "inherit", fontFamily: "var(--font-mono)" }}>
                              {column}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Row
                      justify="space-between" align="middle"
                      gutter={[12, 12]}>
                      <Col>
                        <Button
                          disabled={activeIndex <= 0} size="large"
                          onClick={() => goToSong(activeIndex - 1)}>
                          Anterior
                        </Button>
                      </Col>
                      <Col>
                        <div className="current-service-progress-dots" aria-hidden="true">
                          {currentService.songs.map(serviceSong => (
                            <span
                              key={serviceSong.id}
                              className={`current-service-progress-dot ${serviceSong.id === activeSong.id ? "is-active" : ""}`} />
                          ))}
                        </div>
                      </Col>
                      <Col>
                        <Button
                          disabled={!currentService.songs[activeIndex + 1]} size="large"
                          type="primary" onClick={() => goToSong(activeIndex + 1)}>
                          Siguiente
                        </Button>
                      </Col>
                    </Row>

                    {!isWideScreen && (
                      <Text
                        type="secondary"
                        style={{ display: "block", textAlign: "center", fontSize: 12, color: isPresentationMode ? "#94a3b8" : undefined }}>
                        Desliza la letra hacia los lados para cambiar de canción
                      </Text>
                    )}
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
