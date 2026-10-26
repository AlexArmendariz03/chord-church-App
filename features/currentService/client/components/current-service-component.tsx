"use client"

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ExpandOutlined, LeftOutlined, MenuFoldOutlined, MenuUnfoldOutlined, OrderedListOutlined, ReadOutlined, RightOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, Empty, Row, Select, Space, Switch, Tag, Typography } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/features/layout/client/components/session-provider"
import { CategoryTag } from "@/shared/components/category-tag"
import { formatServiceDate } from "@/shared/utils/dates"
import type { ServiceWithSongs } from "@/types/services"
import { FONT_LIMITS, LyricsPager, type LyricsLayoutInfo } from "../lyrics/lyrics-pager"
import { displaySemitones, transposeKey } from "../lyrics/transpose"
import { useWakeLock } from "../use-wake-lock"
import { ClosingGuide, hasClosingGuide } from "./closing-guide"
import { LeaderSlide } from "./leader-slide"
import StageView, { formatSemitones, STAGE_THEMES, type StageTheme } from "./stage-view"

const { Title, Text } = Typography

const FONT_STEP = 4
const SHOW_CHORDS_STORAGE_KEY = "chord-church:show-chords"
const STAGE_THEME_STORAGE_KEY = "chord-church:stage-theme"
const LEADER_LYRICS_STORAGE_KEY = "chord-church:leader-lyrics"
// Matches the breakpoint in current-service.scss where the list moves below the lyrics.
const STACKED_LAYOUT_MAX_WIDTH = "(max-width: 991.98px)"

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

// Query param that opens a specific service ("Abrir en vivo" on any service card)
const SERVICE_QUERY_PARAM = "servicio"

const CurrentServiceComponent = () => {
  const { message } = App.useApp()
  const router = useRouter()
  const { isLeader } = useSession()
  const requestedServiceId = useSearchParams().get(SERVICE_QUERY_PARAM)
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(true)
  const [activeServiceSongId, setActiveServiceSongId] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  // Leader only: the prayer and announcements guide that follows the last song
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [isSongListCollapsed, setIsSongListCollapsed] = useState(false)
  const [isStageMode, setIsStageMode] = useState(false)
  const [showChords, setShowChords] = useState(true)
  const [stageTheme, setStageTheme] = useState<StageTheme>("aurora")
  // The leader sees each song's name instead of its lyrics and chords, unless they ask for the lyrics
  const [leaderWantsLyrics, setLeaderWantsLyrics] = useState(false)
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
      setLeaderWantsLyrics(localStorage.getItem(LEADER_LYRICS_STORAGE_KEY) === "true")
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

  const toggleLeaderLyrics = (value: boolean) => {
    setLeaderWantsLyrics(value)
    setPageIndex(0)
    try {
      localStorage.setItem(LEADER_LYRICS_STORAGE_KEY, String(value))
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

  // The API returns services from a few hours ago onwards, sorted by date. A service picked
  // from a card wins; otherwise prefer the most recent one that already started (the service
  // happening now) over the next one.
  const currentService = useMemo(() => {
    const requested = services.find(service => service.id === requestedServiceId)
    if (requested) return requested
    const now = Date.now()
    const started = services.filter(service => new Date(service.eventDate).getTime() <= now)
    return started.at(-1) ?? services[0]
  }, [services, requestedServiceId])

  const changeService = (serviceId: string) => {
    setActiveServiceSongId(null)
    setPageIndex(0)
    setIsGuideOpen(false)
    router.replace(`/en-curso?${SERVICE_QUERY_PARAM}=${serviceId}`)
  }

  useWakeLock(Boolean(currentService))

  const songs = currentService?.songs ?? []
  const activeIndex = Math.max(0, songs.findIndex(serviceSong => serviceSong.id === activeServiceSongId))
  const activeSong = songs[activeIndex] ?? null
  const isLeaderView = isLeader && !leaderWantsLyrics
  // The leader's slide is a single page per song
  const { pageCount, fontSize, autoSize } = isLeaderView ? { ...layout, pageCount: 1 } : layout
  const showsGuide = isLeader && hasClosingGuide(currentService)
  // The guide follows the worship set: before the offering song, or at the end when there's none
  const offeringIndex = songs.findIndex(serviceSong => serviceSong.isOffering)
  const guideAfterIndex = !showsGuide ? -1 : offeringIndex > 0 ? offeringIndex - 1 : songs.length - 1

  const handleLayout = useCallback((info: LyricsLayoutInfo) => {
    setLayout(info)
    setPageIndex(current => Math.min(current, info.pageCount - 1))
  }, [])

  const selectSong = (serviceSongId: string) => {
    setActiveServiceSongId(serviceSongId)
    setPageIndex(0)
    setIsGuideOpen(false)
  }

  const openGuide = () => {
    // While the guide is up, the active song is the one before it: "Anterior" goes back there
    if (activeIndex !== guideAfterIndex) {
      setActiveServiceSongId(songs[guideAfterIndex]?.id ?? null)
      setPageIndex(0)
    }
    setIsGuideOpen(true)
  }

  const isAtGuide = showsGuide && activeIndex === guideAfterIndex

  const canPrev = isGuideOpen || pageIndex > 0 || activeIndex > 0
  const canNext = isGuideOpen
    ? Boolean(songs[activeIndex + 1])
    : pageIndex < pageCount - 1 || activeIndex < songs.length - 1 || isAtGuide

  const goNext = () => {
    if (isGuideOpen) {
      if (songs[activeIndex + 1]) selectSong(songs[activeIndex + 1].id)
    } else if (pageIndex < pageCount - 1) setPageIndex(pageIndex + 1)
    else if (isAtGuide) setIsGuideOpen(true)
    else if (songs[activeIndex + 1]) selectSong(songs[activeIndex + 1].id)
  }

  const goPrev = () => {
    if (isGuideOpen) setIsGuideOpen(false)
    else if (pageIndex > 0) setPageIndex(pageIndex - 1)
    else if (showsGuide && activeIndex === guideAfterIndex + 1) openGuide()
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

  const openGuideFromList = () => {
    openGuide()
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

  const renderPager = (song: NonNullable<typeof activeSong>, variant: "light" | "stage") => isGuideOpen ? (
    <ClosingGuide
      prayerGuide={currentService?.prayerGuide}
      announcements={currentService?.announcements}
      variant={variant} />
  ) : isLeaderView ? (
    <LeaderSlide
      song={song} number={activeIndex + 1}
      total={songs.length}
      variant={variant} />
  ) : (
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
        songTools={!isLeaderView}
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
        isGuideOpen={isGuideOpen}
        guideAfterIndex={guideAfterIndex}
        onOpenGuide={openGuide}
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
          {/* Collapsing only applies side by side; stacked (phones, iPad portrait) the list stays below */}
          <Col
            xs={24} lg={8}
            className={`current-service-sidebar-col ${isSongListCollapsed ? "is-collapsed" : ""}`}>
            <Card
              title="Alabanzas programadas"
              // With several services the picker already shows each date
              extra={services.length > 1 ? null : <Text strong>{formatServiceDate(currentService.eventDate)}</Text>}
              style={{ height: "100%" }}>
              <Space
                orientation="vertical" size={8}
                style={{ width: "100%" }}>
                {services.length > 1 ? (
                  <Select
                    className="current-service-picker" size="large"
                    value={currentService.id} onChange={changeService}
                    aria-label="Cambiar de evento"
                    options={services.map(service => ({
                      value: service.id,
                      label: `${service.title} · ${formatServiceDate(service.eventDate)}`
                    }))} />
                ) : (
                  <Title level={4} style={{ marginTop: 0 }}>{currentService.title}</Title>
                )}
                {currentService.songs.map(({ id, song, category, position, isOffering }, index) => (
                  <Fragment key={id}>
                    <div
                      role="button" tabIndex={0}
                      className={`current-service-song-row is-${category} ${activeSong?.id === id && !isGuideOpen ? "is-active" : ""}`}
                      onClick={() => selectSongFromList(id)}
                      onKeyDown={e => e.key === "Enter" && selectSongFromList(id)}>
                      <span>
                        <span className="current-service-song-name">{position}. {song.name}</span>
                        <span className="current-service-song-meta">Tono {song.key}</span>
                      </span>
                      <CategoryTag category={category} offering={isOffering} />
                    </div>
                    {/* Leader only: the guide sits after the worship set, before the offering */}
                    {index === guideAfterIndex && (
                      <div
                        role="button" tabIndex={0}
                        className={`current-service-song-row is-guide ${isGuideOpen ? "is-active" : ""}`}
                        onClick={openGuideFromList}
                        onKeyDown={e => e.key === "Enter" && openGuideFromList()}>
                        <span>
                          <span className="current-service-song-name">Oración y anuncios</span>
                          <span className="current-service-song-meta">Antes de la ofrenda</span>
                        </span>
                        <Tag color="blue">Dirigente</Tag>
                      </div>
                    )}
                  </Fragment>
                ))}
              </Space>
            </Card>
          </Col>

          <Col
            ref={mainColumnRef} xs={24}
            lg={isSongListCollapsed ? 24 : 16}
            className="current-service-main-col">
            {activeSong ? (
              <Card
                title={
                  <span className="current-service-song-title">
                    <Button
                      className="current-service-list-toggle"
                      aria-label={isSongListCollapsed ? "Mostrar lista" : "Ocultar lista"}
                      icon={isSongListCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                      onClick={() => setIsSongListCollapsed(current => !current)}>
                      {isSongListCollapsed ? "Lista" : "Ocultar"}
                    </Button>
                    <span className="current-service-song-title-text">
                      {isGuideOpen ? "Oración y anuncios" : `${activeSong.position}. ${activeSong.song.name}`}
                    </span>
                  </span>
                }
                extra={isGuideOpen ? <Tag color="blue">Dirigente</Tag> : <CategoryTag category={activeSong.category} offering={activeSong.isOffering} />}>
                <div className={`current-service-toolbar ${isGuideOpen ? "is-guide" : ""}`}>
                  <Space
                    size={12} align="center"
                    wrap>
                    {!isLeaderView && <Space.Compact>
                      <Button aria-label="Bajar medio tono" onClick={() => transpose(semitones - 1)}>♭</Button>
                      <Button
                        className={`current-service-key-badge ${isTransposed ? "is-transposed" : ""}`}
                        disabled={!isTransposed} onClick={() => transpose(0)}
                        title={isTransposed ? `Original: ${activeSong.song.key}. Clic para volver al tono original` : "Tono original"}>
                        Tono: {transposeKey(activeSong.song.key, semitones)}
                        {isTransposed && <span className="current-service-key-shift">{formatSemitones(semitones)}</span>}
                      </Button>
                      <Button aria-label="Subir medio tono" onClick={() => transpose(semitones + 1)}>♯</Button>
                    </Space.Compact>}
                    {!isGuideOpen && <Text type="secondary">Canción {activeIndex + 1} de {songs.length}</Text>}
                  </Space>
                  <div className="current-service-toolbar-actions">
                    {isLeader && (
                      <Button
                        icon={isLeaderView ? <ReadOutlined /> : <OrderedListOutlined />}
                        onClick={() => toggleLeaderLyrics(isLeaderView)}>
                        {isLeaderView ? "Ver letras" : "Vista del dirigente"}
                      </Button>
                    )}
                    {!isLeaderView && (
                      <>
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
                      </>
                    )}
                    <Button
                      type="primary" icon={<ExpandOutlined />}
                      className="current-service-stage-button" onClick={enterStage}>
                      Pantalla completa
                    </Button>
                  </div>
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
                      {songs.map((serviceSong, index) => (
                        <Fragment key={serviceSong.id}>
                          <span className={`current-service-progress-dot ${serviceSong.id === activeSong.id && !isGuideOpen ? "is-active" : ""}`} />
                          {index === guideAfterIndex && <span className={`current-service-progress-dot is-guide ${isGuideOpen ? "is-active" : ""}`} />}
                        </Fragment>
                      ))}
                    </div>
                    {pageCount > 1 && !isGuideOpen && <Text type="secondary" className="current-service-page">Página {pageIndex + 1} de {pageCount}</Text>}
                  </div>
                  <Button
                    size="large" type="primary"
                    disabled={!canNext} onClick={goNext}>
                    Siguiente{pageIndex < pageCount - 1 && !isGuideOpen && <span className="current-service-nav-page-word">página</span>} <RightOutlined />
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
