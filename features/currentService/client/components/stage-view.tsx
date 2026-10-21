"use client"

import { cloneElement, Fragment, useCallback, useEffect, useRef, useState, type Dispatch, type ReactElement, type ReactNode } from "react"
import { BgColorsOutlined, CloseOutlined, DownOutlined, EyeInvisibleOutlined, LeftOutlined, RightOutlined, UnorderedListOutlined } from "@ant-design/icons"
import { ConfigProvider, Drawer, Segmented, theme } from "antd"
import { formatServiceDate } from "@/shared/utils/dates"
import type { ServiceWithSongs } from "@/types/services"
import { displaySemitones, transposeKey } from "../lyrics/transpose"

// Controls fade out after this long without interaction, leaving the whole screen to the lyrics
const CONTROLS_HIDE_DELAY_MS = 3500
// Desktop: the mouse brings the controls back only near the top/bottom edge (px), like a
// video player, so moving it over the lyrics doesn't keep them on screen
const EDGE_REVEAL_PX = 96
// How long the big "next song" card stays up after changing songs
const SONG_INTRO_MS = 700

export const STAGE_THEMES = [
  { value: "aurora", label: "Aurora" },
  { value: "noche", label: "Noche" },
  { value: "calido", label: "Cálido" }
] as const

export type StageTheme = (typeof STAGE_THEMES)[number]["value"]

type StageViewProps = {
  service: ServiceWithSongs
  activeIndex: number
  pageIndex: number
  pageCount: number
  showChords: boolean
  onToggleChords: Dispatch<boolean>
  semitones: number
  onTranspose: Dispatch<number>
  canDecreaseFont: boolean
  canIncreaseFont: boolean
  onDecreaseFont: () => void
  onIncreaseFont: () => void
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onSelectSong: Dispatch<string>
  // Leader only: the prayer and announcements guide, shown after the song at guideAfterIndex
  // (the end of the worship set, before the offering); -1 when there's no guide
  isGuideOpen: boolean
  guideAfterIndex: number
  onOpenGuide: () => void
  onExit: () => void
  stageTheme: StageTheme
  onStageThemeChange: Dispatch<StageTheme>
  // The LyricsPager, owned by the parent so page/font state survives entering and leaving.
  // StageView hands it `onCenterTap`, which shows or hides the controls.
  children: ReactElement<{ onCenterTap?: () => void }>
}

const STAGE_THEME = {
  algorithm: theme.darkAlgorithm,
  token: { colorPrimary: "#6366f1", colorBgElevated: "#151b2e", fontSize: 15 }
}

export const formatSemitones = (semitones: number) => {
  const shown = displaySemitones(semitones)
  return shown > 0 ? `+${shown}` : `${shown}`
}

type BubbleProps = {
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  variant?: "primary" | "large"
  // Phones: drop it from the toolbar when the same action is reachable another way
  hideOnNarrow?: boolean
  children: ReactNode
}

// Round glass button, icon only; the label goes to screen readers and the hover tooltip
const Bubble = ({ label, onClick, disabled, active, variant, hideOnNarrow, children }: BubbleProps) => (
  <button
    type="button"
    className={`stage-bubble ${variant ? `is-${variant}` : ""} ${active ? "is-active" : ""} ${hideOnNarrow ? "is-wide-only" : ""}`}
    aria-label={label} title={label}
    aria-pressed={active} disabled={disabled}
    onClick={onClick}>
    {children}
  </button>
)

const StageView = ({
  service,
  activeIndex,
  pageIndex,
  pageCount,
  showChords,
  onToggleChords,
  semitones,
  onTranspose,
  canDecreaseFont,
  canIncreaseFont,
  onDecreaseFont,
  onIncreaseFont,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onSelectSong,
  isGuideOpen,
  guideAfterIndex,
  onOpenGuide,
  onExit,
  stageTheme,
  onStageThemeChange,
  children
}: StageViewProps) => {
  const [isListOpen, setIsListOpen] = useState(false)
  const [introSongId, setIntroSongId] = useState<string | null>(null)
  const [controlsVisible, setControlsVisible] = useState(true)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHideTimer = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY_MS)
  }, [])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    scheduleHide()
  }, [scheduleHide])

  const hideControls = () => {
    clearHideTimer()
    setControlsVisible(false)
  }

  const toggleControls = () => (controlsVisible ? hideControls() : showControls())

  useEffect(() => {
    scheduleHide()
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
  }, [scheduleHide])

  const openList = () => {
    clearHideTimer()
    setControlsVisible(true)
    setIsListOpen(true)
  }

  const cycleTheme = () => {
    const index = STAGE_THEMES.findIndex(option => option.value === stageTheme)
    onStageThemeChange(STAGE_THEMES[(index + 1) % STAGE_THEMES.length].value)
  }

  const current = service.songs[activeIndex]
  const currentId = current?.id

  // Big title card each time a new song comes up, so the whole band sees what's next
  useEffect(() => {
    if (!currentId) return
    setIntroSongId(currentId)
    const timer = setTimeout(() => setIntroSongId(null), SONG_INTRO_MS)
    return () => clearTimeout(timer)
  }, [currentId])

  const next = service.songs[activeIndex + 1]
  const hasNextPage = pageIndex < pageCount - 1

  if (!current) return null

  const playedKey = transposeKey(current.song.key, semitones)
  const isTransposed = displaySemitones(semitones) !== 0
  const themeLabel = STAGE_THEMES.find(option => option.value === stageTheme)?.label
  const guideIsNext = !isGuideOpen && !hasNextPage && activeIndex === guideAfterIndex
  const upNext = hasNextPage && !isGuideOpen ? { label: "Página", detail: `${pageIndex + 2} de ${pageCount}` }
    : guideIsNext ? { label: "Sigue", detail: "Oración y anuncios" }
    : next ? { label: next.isOffering ? "Sigue · Ofrenda" : "Sigue", detail: `${next.song.name} · ${next.song.key}` }
    : null

  return (
    <ConfigProvider theme={STAGE_THEME}>
      <div
        className={`stage ${controlsVisible ? "has-controls" : ""}`} role="dialog"
        data-theme={stageTheme} data-category={current.category}
        aria-label={`Modo escenario: ${isGuideOpen ? "Oración y anuncios" : current.song.name}`}
        onMouseMove={event => {
          // Taps also fire mousemove, but without movement
          const moved = event.movementX || event.movementY
          const nearEdge = event.clientY < EDGE_REVEAL_PX || event.clientY > window.innerHeight - EDGE_REVEAL_PX
          if (moved && nearEdge && !controlsVisible) showControls()
        }}>
        {/* Soft color glow behind the lyrics; warm for júbilo, cool for adoración */}
        <div className="stage-backdrop" aria-hidden="true">
          <span className="stage-glow is-a" />
          <span className="stage-glow is-b" />
          <span className="stage-glow is-c" />
        </div>

        <div
          className={`stage-intro ${introSongId === current.id && !isGuideOpen ? "is-visible" : ""}`}
          aria-live="polite">
          <span className="stage-intro-position">{activeIndex + 1} / {service.songs.length}</span>
          <span className="stage-intro-name">{current.song.name}</span>
          <span className="stage-intro-meta">
            <span className="stage-intro-key">Tono {playedKey}</span>
            {current.isOffering ? "Ofrenda" : current.category === "jubilo" ? "Júbilo" : "Adoración"}
          </span>
        </div>

        {/* Always visible, even with the controls hidden: where we are and in which key */}
        <div className="stage-hud">
          {isGuideOpen ? (
            <span className="stage-hud-name">Oración y anuncios</span>
          ) : (
            <>
              <span className="stage-hud-position">{activeIndex + 1}/{service.songs.length}</span>
              <span className="stage-hud-name">{current.song.name}</span>
              <span className={`stage-hud-key ${isTransposed ? "is-transposed" : ""}`}>{playedKey}</span>
              {pageCount > 1 && <span className="stage-hud-page">Pág. {pageIndex + 1}/{pageCount}</span>}
            </>
          )}
        </div>

        <main className="stage-body">
          {canPrev && <LeftOutlined className="stage-edge is-prev" aria-hidden />}
          {cloneElement(children, { onCenterTap: toggleControls })}
          {canNext && <RightOutlined className="stage-edge is-next" aria-hidden />}
        </main>

        <div className="stage-progress-line" aria-hidden="true">
          {service.songs.map((serviceSong, index) => (
            <span
              key={serviceSong.id}
              className={`stage-progress-line-song ${index < activeIndex || (isGuideOpen && index === activeIndex) ? "is-done" : ""}`}>
              {index === activeIndex && !isGuideOpen && (
                <span
                  className="stage-progress-line-fill"
                  style={{ width: `${((pageIndex + 1) / pageCount) * 100}%` }} />
              )}
            </span>
          ))}
        </div>

        {/* With the controls hidden, a small handle brings them back (tapping the center works too) */}
        <button
          type="button" className="stage-reveal"
          aria-label="Mostrar controles" tabIndex={controlsVisible ? -1 : 0}
          onClick={showControls}>
          <DownOutlined />
        </button>

        {/* Top-right: tools, grouped in small pills */}
        <div
          className="stage-cluster is-top" onPointerDown={showControls}
          inert={!controlsVisible}>
          {/* Song tools: nothing to change while the guide is up */}
          {!isGuideOpen && (
            <>
              <div
                className="stage-pill" role="group"
                aria-label="Transponer tono">
                <Bubble label="Bajar medio tono" onClick={() => onTranspose(semitones - 1)}>♭</Bubble>
                <button
                  type="button" className={`stage-key ${isTransposed ? "is-transposed" : ""}`}
                  disabled={!isTransposed} onClick={() => onTranspose(0)}
                  title={isTransposed ? `Original: ${current.song.key}. Toca para volver al tono original` : "Tono original"}>
                  {playedKey}
                  {isTransposed && <span className="stage-key-shift">{formatSemitones(semitones)}</span>}
                </button>
                <Bubble label="Subir medio tono" onClick={() => onTranspose(semitones + 1)}>♯</Bubble>
              </div>

              <div
                className="stage-pill" role="group"
                aria-label="Tamaño de letra">
                <Bubble
                  label="Reducir letra" disabled={!canDecreaseFont}
                  onClick={onDecreaseFont}>
                  <span className="stage-font-glyph is-small">A</span>
                </Bubble>
                <Bubble
                  label="Aumentar letra" disabled={!canIncreaseFont}
                  onClick={onIncreaseFont}>
                  <span className="stage-font-glyph">A</span>
                </Bubble>
              </div>

              <Bubble
                label={showChords ? "Ocultar acordes" : "Mostrar acordes"} active={showChords}
                onClick={() => onToggleChords(!showChords)}>
                <span className="stage-chord-glyph">C<sup>7</sup></span>
              </Bubble>
            </>
          )}
          <Bubble
            label={`Tema: ${themeLabel}. Cambiar`} hideOnNarrow
            onClick={cycleTheme}>
            <BgColorsOutlined />
          </Bubble>
          <Bubble label="Lista de alabanzas" onClick={openList}><UnorderedListOutlined /></Bubble>
          <Bubble
            label="Ocultar controles" hideOnNarrow
            onClick={hideControls}>
            <EyeInvisibleOutlined />
          </Bubble>
          <Bubble label="Salir del modo escenario" onClick={onExit}><CloseOutlined /></Bubble>
        </div>

        {/* Bottom corners: previous / next */}
        <div
          className="stage-cluster is-bottom-left" onPointerDown={showControls}
          inert={!controlsVisible}>
          <Bubble
            label="Anterior" variant="large"
            disabled={!canPrev} onClick={onPrev}>
            <LeftOutlined />
          </Bubble>
        </div>

        <div
          className="stage-cluster is-bottom-right" onPointerDown={showControls}
          inert={!controlsVisible}>
          {upNext && (
            <span className="stage-up-next">
              <span className="stage-up-next-label">{upNext.label}</span>
              <span className="stage-up-next-detail">{upNext.detail}</span>
            </span>
          )}
          <Bubble
            label={hasNextPage && !isGuideOpen ? "Siguiente página" : guideIsNext ? "Oración y anuncios" : next ? "Siguiente canción" : "Fin del servicio"} variant="primary"
            disabled={!canNext} onClick={onNext}>
            <RightOutlined />
          </Bubble>
        </div>

        <Drawer
          open={isListOpen} onClose={() => setIsListOpen(false)}
          afterOpenChange={open => !open && scheduleHide()}
          placement="left" zIndex={2100}
          title={service.title} rootClassName="stage-drawer">
          <p className="stage-drawer-date">{formatServiceDate(service.eventDate)}</p>
          <ol className="stage-drawer-list">
            {service.songs.map((serviceSong, index) => (
              <Fragment key={serviceSong.id}>
                <li>
                  <button
                    type="button"
                    className={`stage-drawer-song is-${serviceSong.category} ${index === activeIndex && !isGuideOpen ? "is-active" : ""}`}
                    onClick={() => {
                      onSelectSong(serviceSong.id)
                      setIsListOpen(false)
                    }}>
                    <span className="stage-drawer-song-name">{serviceSong.position}. {serviceSong.song.name}</span>
                    <span className="stage-drawer-song-key">{serviceSong.song.key}</span>
                  </button>
                </li>
                {index === guideAfterIndex && (
                  <li>
                    <button
                      type="button"
                      className={`stage-drawer-song is-guide ${isGuideOpen ? "is-active" : ""}`}
                      onClick={() => {
                        onOpenGuide()
                        setIsListOpen(false)
                      }}>
                      <span className="stage-drawer-song-name">Oración y anuncios</span>
                    </button>
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
          <p className="stage-drawer-heading">Apariencia</p>
          <Segmented
            block value={stageTheme}
            options={[...STAGE_THEMES]}
            onChange={value => onStageThemeChange(value as StageTheme)} />
        </Drawer>
      </div>
    </ConfigProvider>
  )
}

export default StageView
