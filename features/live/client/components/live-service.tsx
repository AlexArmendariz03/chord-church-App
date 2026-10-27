"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import { App, Button, Card, Col, Empty, Row, Tag } from "antd"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "@/features/layout/client/components/session-provider"
import { servicesApi } from "@/features/services/client/services-api"
import { errorMessage } from "@/shared/client/api"
import { CategoryTag } from "@/shared/components/category-tag"
import type { ServiceWithSongs } from "@/types/services"
import { useLivePreferences } from "../hooks/use-live-preferences"
import { useServiceNavigation } from "../hooks/use-service-navigation"
import { useStageMode } from "../hooks/use-stage-mode"
import { useWakeLock } from "../hooks/use-wake-lock"
import { FONT_LIMITS, LyricsPager, type LyricsLayoutInfo } from "../lyrics/lyrics-pager"
import { displaySemitones } from "../lyrics/transpose"
import { pickCurrentService } from "../pick-current-service"
import { ClosingGuide, hasClosingGuide } from "./closing-guide"
import { LeaderSlide } from "./leader-slide"
import { LiveNav } from "./live-nav"
import { LiveSongList } from "./live-song-list"
import { LiveToolbar } from "./live-toolbar"
import StageView from "./stage-view"

const FONT_STEP = 4
// Matches the breakpoint in current-service.scss where the list moves below the lyrics.
const STACKED_LAYOUT_MAX_WIDTH = "(max-width: 991.98px)"
// Query param that opens a specific service ("Abrir en vivo" on any service card)
const SERVICE_QUERY_PARAM = "servicio"

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
  const { showChords, setShowChords, stageTheme, setStageTheme, leaderWantsLyrics, setLeaderWantsLyrics } = useLivePreferences()
  // A+/A− shift the automatic size, so the adjustment survives song changes and rotations
  const [fontOffset, setFontOffset] = useState(0)
  // Per song of this service, only for this session: the written key in the database stays as is
  const [transposeBySong, setTransposeBySong] = useState<Record<string, number>>({})
  const [layout, setLayout] = useState<LyricsLayoutInfo>({ pageCount: 1, fontSize: 24, autoSize: 24 })
  const mainColumnRef = useRef<HTMLDivElement | null>(null)

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
    activeIndex, activeSong, pageIndex, setPageIndex, isGuideOpen, guideAfterIndex,
    canPrev, canNext, goNext, goPrev, navigate, selectSong, openGuide
  } = useServiceNavigation(songs, { withGuide: leadsService && hasClosingGuide(currentService), pageCount })
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

  // On phones the song list sits below the lyrics; after picking from it, bring the lyrics back into view.
  const showLyricsOnPhones = () => {
    if (window.matchMedia(STACKED_LAYOUT_MAX_WIDTH).matches) {
      mainColumnRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const increaseFont = () => setFontOffset(Math.min(fontSize + FONT_STEP, FONT_LIMITS.max) - autoSize)
  const decreaseFont = () => setFontOffset(Math.max(fontSize - FONT_STEP, FONT_LIMITS.min) - autoSize)

  const semitones = activeSong ? transposeBySong[activeSong.id] ?? 0 : 0
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
        isGuideOpen={isGuideOpen}
        guideAfterIndex={guideAfterIndex}
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

  return (
    <Row gutter={[16, 16]}>
      {/* Collapsing only applies side by side; stacked (phones, iPad portrait) the list stays below */}
      <Col
        xs={24} lg={8}
        className={`current-service-sidebar-col ${isSongListCollapsed ? "is-collapsed" : ""}`}>
        <LiveSongList
          services={services} service={currentService}
          onChangeService={changeService}
          activeSongId={activeSong?.id}
          isGuideOpen={isGuideOpen}
          guideAfterIndex={guideAfterIndex}
          onSelectSong={serviceSongId => {
            selectSong(serviceSongId)
            showLyricsOnPhones()
          }}
          onOpenGuide={() => {
            openGuide()
            showLyricsOnPhones()
          }} />
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
            <LiveToolbar
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
              isGuideOpen={isGuideOpen} guideAfterIndex={guideAfterIndex}
              pageIndex={pageIndex} pageCount={pageCount}
              canPrev={canPrev} canNext={canNext}
              onPrev={goPrev} onNext={goNext} />
          </Card>
        ) : (
          <Empty description="Este servicio no tiene alabanzas" />
        )}
      </Col>
    </Row>
  )
}

export default LiveService
