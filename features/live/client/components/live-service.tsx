"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, ConfigProvider, Drawer, Empty, Row, Tag, Typography } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/features/auth/client/session-provider"
import { servicesApi } from "@/features/services/client/services-api"
import { errorMessage } from "@/shared/client/api"
import { CategoryTag } from "@/features/songs/client/components/category-tag"
import type { ServiceWithSongs } from "@/features/services/types"
import { useLivePreferences } from "../hooks/use-live-preferences"
import { useServiceNavigation } from "../hooks/use-service-navigation"
import { useStageMode } from "../hooks/use-stage-mode"
import { useViewportClass } from "../hooks/use-viewport-class"
import { useWakeLock } from "../hooks/use-wake-lock"
import { FONT_LIMITS, LyricsPager, type LyricsLayoutInfo } from "./lyrics-pager"
import { displaySemitones, transposeKey } from "@/shared/lyrics/transpose"
import { pickCurrentService } from "../../pick-current-service"
import { formatServiceDate } from "@/shared/utils/dates"
import { GUIDE_STEP_LABELS, guideStepsOf, upNextOf, type GuideStep } from "../../service-steps"
import { ClosingGuide } from "./closing-guide"
import { LeaderSlide } from "./leader-slide"
import { LiveNav } from "./live-nav"
import { LiveSongList } from "./live-song-list"
import { LiveToolbar } from "./live-toolbar"
import StageView from "./stage-view"

const FONT_STEP = 4
// Teléfono y tableta: ningún control mide menos de 44px de alto
const TOUCH_THEME = { token: { controlHeight: 44, controlHeightLG: 48 } }
// Query param that opens a specific service ("Abrir en vivo" on any service card)
const SERVICE_QUERY_PARAM = "servicio"
// Quien no dirige no ve la guía (fuera del componente, para que no cambie en cada render)
const NO_GUIDE: GuideStep[] = []

const LiveService = () => {
  const { message } = App.useApp()
  const router = useRouter()
  const { can } = useSession()
  // El dirigente ve el nombre de cada alabanza en grande y la guía de oración y anuncios
  const leadsService = can("leadService")
  const requestedServiceId = useSearchParams().get(SERVICE_QUERY_PARAM)
  const [services, setServices] = useState<ServiceWithSongs[]>([])
  const [loading, setLoading] = useState(true)
  const [isSongListCollapsed, setIsSongListCollapsed] = useState(false)
  // Teléfono y tableta: el setlist se abre en un panel desde abajo al tocar el título
  const [isSetlistOpen, setIsSetlistOpen] = useState(false)
  const viewport = useViewportClass()
  const isCompact = viewport !== "desktop"
  const { showChords, setShowChords, stageTheme, setStageTheme, leaderWantsLyrics, setLeaderWantsLyrics } = useLivePreferences()
  // A+/A− shift the automatic size, so the adjustment survives song changes and rotations
  const [fontOffset, setFontOffset] = useState(0)
  // Per song of this service, only for this session: the written key in the database stays as is
  const [transposeBySong, setTransposeBySong] = useState<Record<string, number>>({})
  const [layout, setLayout] = useState<LyricsLayoutInfo>({ pageCount: 1, fontSize: 24, autoSize: 24 })

  useEffect(() => {
    servicesApi.upcomingWithLyrics()
      .then(setServices)
      .catch(error => message.error(errorMessage(error, "Error al cargar el servicio")))
      .finally(() => setLoading(false))
  }, [message])

  const currentService = useMemo(() => pickCurrentService(services, requestedServiceId), [services, requestedServiceId])
  const songs = currentService?.songs ?? []
  const isLeaderView = leadsService && !leaderWantsLyrics
  // The leader's slide is a single page per song
  const { pageCount, fontSize, autoSize } = isLeaderView ? { ...layout, pageCount: 1 } : layout
  const {
    activeIndex, activeSong, pageIndex, setPageIndex, isGuideOpen, guideStep, guideStepIndex, guideSteps, guideAfterIndex,
    next, canPrev, canNext, goNext, goPrev, navigate, selectSong, openGuide
  } = useServiceNavigation(songs, { guideSteps: leadsService ? guideStepsOf(currentService) : NO_GUIDE, pageCount })
  const { isStageMode, enterStage, exitStage } = useStageMode(navigate)

  useWakeLock(Boolean(currentService))

  const changeService = (serviceId: string) => {
    selectSong(null)
    router.replace(`/en-curso?${SERVICE_QUERY_PARAM}=${serviceId}`)
  }

  const handleLayout = useCallback((info: LyricsLayoutInfo) => {
    setLayout(info)
    setPageIndex(current => Math.min(current, info.pageCount - 1))
  }, [setPageIndex])

  const toggleLeaderView = () => {
    setLeaderWantsLyrics(isLeaderView)
    setPageIndex(0)
  }

  // Lo que sigue después de lo que se ve, para la vista del dirigente
  const nextGuideStep = next?.guideStep != null ? guideSteps[next.guideStep] : null
  const nextLabel = nextGuideStep ? GUIDE_STEP_LABELS[nextGuideStep] : next && songs[next.songIndex]?.song.name
  // Abajo de la letra: la página o lo que sigue, en el tono en que cada quien la va a tocar
  const upNext = upNextOf(
    { songIndex: activeIndex, pageIndex, guideStep: guideStepIndex },
    next,
    { songs, pageCount, guideSteps, keyOf: song => transposeKey(song.song.key, transposeBySong[song.id] ?? 0) }
  )
  // Tableta y pantalla completa: tocar un lado de la pantalla cambia de página o de paso
  const sideTaps = (variant: "light" | "stage") => variant === "stage" || viewport === "tablet"

  const increaseFont = () => setFontOffset(Math.min(fontSize + FONT_STEP, FONT_LIMITS.max) - autoSize)
  const decreaseFont = () => setFontOffset(Math.max(fontSize - FONT_STEP, FONT_LIMITS.min) - autoSize)

  const semitones = activeSong ? transposeBySong[activeSong.id] ?? 0 : 0
  const transpose = (value: number) => {
    if (activeSong) setTransposeBySong(current => ({ ...current, [activeSong.id]: displaySemitones(value) }))
  }

  const renderPager = (song: NonNullable<typeof activeSong>, variant: "light" | "stage") => guideStep ? (
    <ClosingGuide
      step={guideStep}
      text={guideStep === "prayer" ? currentService?.prayerGuide : currentService?.announcements}
      variant={variant}
      sideTaps={sideTaps(variant)}
      onNavigate={navigate} />
  ) : isLeaderView ? (
    <LeaderSlide
      song={song} number={activeIndex + 1}
      total={songs.length}
      variant={variant}
      sideTaps={sideTaps(variant)}
      onNavigate={navigate}
      // Solo en teléfono y tableta: en escritorio la tarjeta se queda como siempre
      details={isCompact && variant === "light" ? { next: nextLabel ?? "Fin del servicio" } : undefined} />
  ) : (
    <LyricsPager
      lyrics={song.song.lyrics}
      showChords={showChords}
      transpose={{ semitones, key: song.song.key }}
      fontOffset={fontOffset}
      pageIndex={pageIndex}
      variant={variant}
      viewport={viewport}
      onLayout={handleLayout}
      onNavigate={navigate}
      sideTaps={sideTaps(variant)} />
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
        onToggleChords={setShowChords}
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
        guideSteps={guideSteps}
        guideStepIndex={guideStepIndex}
        guideAfterIndex={guideAfterIndex}
        nextGuideStep={nextGuideStep}
        onOpenGuide={openGuide}
        onExit={exitStage}
        stageTheme={stageTheme}
        onStageThemeChange={setStageTheme}>
        {renderPager(activeSong, "stage")}
      </StageView>
    )
  }

  if (loading) return <Card loading />

  if (!currentService) {
    return (
      <Card>
        <Empty description="No hay servicio en curso o próximo" />
      </Card>
    )
  }

  const songList = (inPanel: boolean) => (
    <LiveSongList
      services={services} service={currentService}
      onChangeService={changeService}
      activeSongId={activeSong?.id}
      guideSteps={guideSteps}
      guideStepIndex={guideStepIndex}
      guideAfterIndex={guideAfterIndex}
      bare={inPanel}
      onSelectSong={serviceSongId => {
        selectSong(serviceSongId)
        setIsSetlistOpen(false)
      }}
      onOpenGuide={step => {
        openGuide(step)
        setIsSetlistOpen(false)
      }} />
  )

  const titleText = activeSong && (guideStep ? GUIDE_STEP_LABELS[guideStep] : `${activeSong.position}. ${activeSong.song.name}`)

  const card = activeSong ? (
    <Card
      className="current-service-card"
      title={isCompact ? (
        <button
          type="button" className="current-service-title-trigger"
          aria-haspopup="dialog" onClick={() => setIsSetlistOpen(true)}>
          <span className="current-service-song-title-text">{titleText}</span>
          <DownOutlined className="current-service-title-caret" />
        </button>
      ) : (
        <span className="current-service-song-title">
          <Button
            className="current-service-list-toggle"
            aria-label={isSongListCollapsed ? "Mostrar lista" : "Ocultar lista"}
            icon={isSongListCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setIsSongListCollapsed(current => !current)}>
            {isSongListCollapsed ? "Lista" : "Ocultar"}
          </Button>
          <span className="current-service-song-title-text">{titleText}</span>
        </span>
      )}
      extra={isGuideOpen ? <Tag color="blue">Dirigente</Tag> : <CategoryTag category={activeSong.category} offering={activeSong.isOffering} />}>
      <LiveToolbar
        viewport={viewport}
        songKey={activeSong.song.key} semitones={semitones}
        onTranspose={transpose}
        songNumber={activeIndex + 1} songCount={songs.length}
        isGuideOpen={isGuideOpen}
        leadsService={leadsService} isLeaderView={isLeaderView}
        onToggleLeaderView={toggleLeaderView}
        showChords={showChords} onToggleChords={setShowChords}
        canDecreaseFont={fontSize > FONT_LIMITS.min} canIncreaseFont={fontSize < FONT_LIMITS.max}
        onDecreaseFont={decreaseFont} onIncreaseFont={increaseFont}
        onEnterStage={enterStage} />

      <div className="current-service-sheet">{renderPager(activeSong, "light")}</div>

      <LiveNav
        songs={songs} activeSongId={activeSong.id}
        guideSteps={guideSteps} guideStepIndex={guideStepIndex}
        guideAfterIndex={guideAfterIndex}
        pageIndex={pageIndex} pageCount={pageCount}
        canPrev={canPrev} canNext={canNext}
        onPrev={goPrev} onNext={goNext}
        upNext={isLeaderView && isCompact ? undefined : upNext} />
    </Card>
  ) : (
    <Empty description="Este servicio no tiene alabanzas" />
  )

  // Teléfono y tableta: la vista ocupa la pantalla (100dvh) y solo se desliza la letra
  if (isCompact) {
    return (
      <ConfigProvider theme={TOUCH_THEME}>
        <div className={`live-compact is-${viewport}`}>
          {card}
          <Drawer
            placement="bottom" size="70dvh"
            open={isSetlistOpen} onClose={() => setIsSetlistOpen(false)}
            title="Alabanzas programadas" rootClassName="live-setlist-drawer"
            // With several services the picker already shows each date
            extra={services.length > 1 ? null : <Typography.Text strong>{formatServiceDate(currentService.eventDate)}</Typography.Text>}>
            {songList(true)}
          </Drawer>
        </div>
      </ConfigProvider>
    )
  }

  return (
    <Row gutter={[16, 16]}>
      <Col
        xs={24} lg={8}
        className={`current-service-sidebar-col ${isSongListCollapsed ? "is-collapsed" : ""}`}>
        {songList(false)}
      </Col>

      <Col
        xs={24}
        lg={isSongListCollapsed ? 24 : 16}
        className="current-service-main-col">
        {card}
      </Col>
    </Row>
  )
}

export default LiveService
