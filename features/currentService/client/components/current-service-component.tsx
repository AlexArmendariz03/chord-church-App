"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ExpandOutlined, LeftOutlined, MenuFoldOutlined, MenuUnfoldOutlined, RightOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, Empty, Row, Space, Switch, Typography } from "antd"
import { CategoryTag } from "@/shared/components/category-tag"
import { formatServiceDate } from "@/shared/utils/dates"
import type { ServiceWithSongs } from "@/types/services"
import { FONT_LIMITS, LyricsPager, type LyricsLayoutInfo } from "../lyrics/lyrics-pager"
import { displaySemitones, transposeKey } from "../lyrics/transpose"
import { useWakeLock } from "../use-wake-lock"
import StageView, { formatSemitones, STAGE_THEMES, type StageTheme } from "./stage-view"

const { Title, Text } = Typography

const FONT_STEP = 4
const SHOW_CHORDS_STORAGE_KEY = "chord-church:show-chords"
const STAGE_THEME_STORAGE_KEY = "chord-church:stage-theme"
// Matches the breakpoint in current-service.scss where the list moves below the lyrics.
const STACKED_LAYOUT_MAX_WIDTH = "(max-width: 991.98px)"

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

const CurrentServiceComponent = () => {
  const { message } = App.useApp()
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(true)
  const [activeServiceSongId, setActiveServiceSongId] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [isSongListCollapsed, setIsSongListCollapsed] = useState(false)
  const [isStageMode, setIsStageMode] = useState(false)
  const [showChords, setShowChords] = useState(true)
  const [stageTheme, setStageTheme] = useState<StageTheme>("aurora")
  // A+/A− shift the automatic size, so the adjustment survives song changes and rotations
  const [fontOffset, setFontOffset] = useState(0)
  // Per song of this service, only for this session: the written key in the database stays as is
  const [transposeBySong, setTransposeBySong] = useState<Record<string, number>>({})
  const [layout, setLayout] = useState<LyricsLayoutInfo>({ pageCount: 1, fontSize: 24, autoSize: 24 })
  const mainColumnRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      setShowChords(localStorage.getItem(SHOW_CHORDS_STORAGE_KEY) !== "false")
      const savedTheme = STAGE_THEMES.find(option => option.value === localStorage.getItem(STAGE_THEME_STORAGE_KEY))
      if (savedTheme) setStageTheme(savedTheme.value)
    } catch {
      // Storage unavailable (private mode): keep chords visible
    }
  }, [])

  const toggleChords = (value: boolean) => {
    setShowChords(value)
    try {
      localStorage.setItem(SHOW_CHORDS_STORAGE_KEY, String(value))
    } catch {
      // Preference just won't be remembered
    }
  }

  const changeStageTheme = (value: StageTheme) => {
    setStageTheme(value)
    try {
      localStorage.setItem(STAGE_THEME_STORAGE_KEY, value)
    } catch {
      // Preference just won't be remembered
    }
  }

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

  useWakeLock(Boolean(currentService))

  const songs = currentService?.songs ?? []
  const activeIndex = Math.max(0, songs.findIndex(serviceSong => serviceSong.id === activeServiceSongId))
  const activeSong = songs[activeIndex] ?? null
  const { pageCount, fontSize, autoSize } = layout

  const handleLayout = useCallback((info: LyricsLayoutInfo) => {
    setLayout(info)
    setPageIndex(current => Math.min(current, info.pageCount - 1))
  }, [])

  const selectSong = (serviceSongId: string) => {
    setActiveServiceSongId(serviceSongId)
    setPageIndex(0)
  }

  const canPrev = pageIndex > 0 || activeIndex > 0
  const canNext = pageIndex < pageCount - 1 || activeIndex < songs.length - 1

  const goNext = () => {
    if (pageIndex < pageCount - 1) setPageIndex(pageIndex + 1)
    else if (songs[activeIndex + 1]) selectSong(songs[activeIndex + 1].id)
  }

  const goPrev = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1)
    else if (songs[activeIndex - 1]) selectSong(songs[activeIndex - 1].id)
  }

  const navigate = (direction: "prev" | "next") => (direction === "next" ? goNext() : goPrev())

  // Keyboard and Bluetooth page-turner pedals (they send arrow / Page Up / Page Down keys)
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return
      const nextKeys = isStageMode ? ["ArrowRight", "ArrowDown", "PageDown", " "] : ["ArrowRight", "PageDown"]
      const prevKeys = isStageMode ? ["ArrowLeft", "ArrowUp", "PageUp"] : ["ArrowLeft", "PageUp"]
      if (nextKeys.includes(event.key)) navigateRef.current("next")
      else if (prevKeys.includes(event.key)) navigateRef.current("prev")
      else if (event.key === "Escape" && isStageMode) setIsStageMode(false)
      else return
      event.preventDefault()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isStageMode])

  // The browser can leave real fullscreen on its own (Esc, iPad gesture); follow it
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsStageMode(false)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (!isStageMode) return
    const root = document.documentElement
    root.style.overflow = "hidden"
    return () => { root.style.overflow = "" }
  }, [isStageMode])

  const enterStage = async () => {
    setIsStageMode(true)
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    } catch {
      // No fullscreen API (iPhone Safari): the stage still covers the whole page
    }
  }

  const exitStage = async () => {
    setIsStageMode(false)
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
  }

  // On phones the song list sits below the lyrics; after picking a song, bring the lyrics back into view.
  const selectSongFromList = (serviceSongId: string) => {
    selectSong(serviceSongId)
    if (window.matchMedia(STACKED_LAYOUT_MAX_WIDTH).matches) {
      mainColumnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const increaseFont = () => setFontOffset(Math.min(fontSize + FONT_STEP, FONT_LIMITS.max) - autoSize)
  const decreaseFont = () => setFontOffset(Math.max(fontSize - FONT_STEP, FONT_LIMITS.min) - autoSize)

  const semitones = activeSong ? transposeBySong[activeSong.id] ?? 0 : 0
  const isTransposed = semitones !== 0
  const transpose = (value: number) => {
    if (activeSong) setTransposeBySong(current => ({ ...current, [activeSong.id]: displaySemitones(value) }))
  }

  const renderPager = (song: NonNullable<typeof activeSong>, variant: "light" | "stage") => (
    <LyricsPager
      lyrics={song.song.lyrics}
      showChords={showChords}
      transpose={{ semitones, key: song.song.key }}
      fontOffset={fontOffset}
      pageIndex={pageIndex}
      variant={variant}
      onLayout={handleLayout}
      onNavigate={navigate} />
  )

  if (isStageMode && currentService && activeSong) {
    return (
      <StageView
        service={currentService}
        activeIndex={activeIndex}
        pageIndex={pageIndex}
        pageCount={pageCount}
        showChords={showChords}
        onToggleChords={toggleChords}
        semitones={semitones}
        onTranspose={transpose}
        canDecreaseFont={fontSize > FONT_LIMITS.min}
        canIncreaseFont={fontSize < FONT_LIMITS.max}
        onDecreaseFont={decreaseFont}
        onIncreaseFont={increaseFont}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={goPrev}
        onNext={goNext}
        onSelectSong={selectSong}
        onExit={exitStage}
        stageTheme={stageTheme}
        onStageThemeChange={changeStageTheme}>
        {renderPager(activeSong, "stage")}
      </StageView>
    )
  }

  if (loading) return <Card loading />

  return (
    <>
      {!currentService ? (
        <Card>
          <Empty description="No hay servicio en curso o próximo" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {!isSongListCollapsed && (
            <Col
              xs={24} lg={8}
              className="current-service-sidebar-col">
              <Card
                title="Alabanzas programadas"
                extra={<Text strong>{formatServiceDate(currentService.eventDate)}</Text>}
                style={{ height: "100%" }}>
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
                      <CategoryTag category={category} />
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          )}

          <Col
            ref={mainColumnRef} xs={24}
            lg={isSongListCollapsed ? 24 : 16}
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
                extra={<CategoryTag category={activeSong.category} />}>
                <div className="current-service-toolbar">
                  <Space
                    size={12} align="center"
                    wrap>
                    <Space.Compact>
                      <Button aria-label="Bajar medio tono" onClick={() => transpose(semitones - 1)}>♭</Button>
                      <Button
                        className={`current-service-key-badge ${isTransposed ? "is-transposed" : ""}`}
                        disabled={!isTransposed} onClick={() => transpose(0)}
                        title={isTransposed ? `Original: ${activeSong.song.key}. Clic para volver al tono original` : "Tono original"}>
                        Tono: {transposeKey(activeSong.song.key, semitones)}
                        {isTransposed && <span className="current-service-key-shift">{formatSemitones(semitones)}</span>}
                      </Button>
                      <Button aria-label="Subir medio tono" onClick={() => transpose(semitones + 1)}>♯</Button>
                    </Space.Compact>
                    <Text type="secondary">Canción {activeIndex + 1} de {songs.length}</Text>
                  </Space>
                  <Space
                    wrap size={8}
                    align="center">
                    <label className="current-service-chords-toggle">
                      <Switch
                        size="small" checked={showChords}
                        onChange={toggleChords} />
                      Acordes
                    </label>
                    <Button
                      aria-label="Reducir letra" disabled={fontSize <= FONT_LIMITS.min}
                      onClick={decreaseFont}>
                      A−
                    </Button>
                    <Button
                      aria-label="Aumentar letra" disabled={fontSize >= FONT_LIMITS.max}
                      onClick={increaseFont}>
                      A+
                    </Button>
                    <Button
                      type="primary" icon={<ExpandOutlined />}
                      onClick={enterStage}>
                      Pantalla completa
                    </Button>
                  </Space>
                </div>

                <div className="current-service-sheet">{renderPager(activeSong, "light")}</div>

                <div className="current-service-nav">
                  <Button
                    size="large" icon={<LeftOutlined />}
                    disabled={!canPrev} onClick={goPrev}>
                    Anterior
                  </Button>
                  <div className="current-service-nav-center">
                    <div className="current-service-progress-dots" aria-hidden="true">
                      {songs.map(serviceSong => (
                        <span
                          key={serviceSong.id}
                          className={`current-service-progress-dot ${serviceSong.id === activeSong.id ? "is-active" : ""}`} />
                      ))}
                    </div>
                    {pageCount > 1 && <Text type="secondary" className="current-service-page">Página {pageIndex + 1} de {pageCount}</Text>}
                  </div>
                  <Button
                    size="large" type="primary"
                    disabled={!canNext} onClick={goNext}>
                    {pageIndex < pageCount - 1 ? "Siguiente página" : "Siguiente"} <RightOutlined />
                  </Button>
                </div>
              </Card>
            ) : (
              <Empty description="Este servicio no tiene alabanzas" />
            )}
          </Col>
        </Row>
      )}
    </>
  )
}

export default CurrentServiceComponent
