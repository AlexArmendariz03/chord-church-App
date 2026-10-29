"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type Dispatch, type MouseEvent, type TouchEvent } from "react"
import { autoFontSize, layoutLyrics, REFERENCE_SIZE, type Fragment, type StanzaMetrics } from "./paginate"
import { parseLyrics, stanzaKind, toUnits, type SectionKind, type Unit } from "./parse-lyrics"

// Section labels can be long ("Estrofa 2 (misma secuencia que…)"); they truncate, and only
// this much of them counts toward the column width when the row also carries chords.
const SECTION_LABEL_MAX_EM = 5

// Keeps an empty chord or lyric slot one line tall so every segment lines up
const NBSP = "\u00a0"

// Minimum horizontal drag (px) to treat a touch as "change page" instead of a tap or scroll
const SWIPE_THRESHOLD = 60

const VARIANT_OPTIONS = {
  light: { minSize: 12, maxSize: 44, readableSize: 20, maxColumns: 3 },
  stage: { minSize: 12, maxSize: 64, readableSize: 22, maxColumns: 3 }
}

export const FONT_LIMITS = { min: 14, max: 80 }

export type LyricsLayoutInfo = { pageCount: number; fontSize: number; autoSize: number }

type LyricsPagerProps = {
  lyrics: string
  showChords: boolean
  // Semitones to move every chord, and the song's written key (picks ♯ or ♭ spelling)
  transpose: { semitones: number; key: string }
  fontOffset: number
  pageIndex: number
  variant: keyof typeof VARIANT_OPTIONS
  onLayout: Dispatch<LyricsLayoutInfo>
  onNavigate: Dispatch<"prev" | "next">
  // Stage only: the left/right thirds of the lyrics turn the page, the middle calls this
  onCenterTap?: () => void
}

export type ParsedStanza = { units: Unit[]; kind: SectionKind | null }

export const StanzaView = ({ stanza, from = 0, to }: { stanza: ParsedStanza; from?: number; to?: number }) => (
  <div className={`lyrics-stanza ${stanza.kind ? `has-section is-${stanza.kind}` : ""} ${from > 0 ? "is-continued" : ""}`}>
    {stanza.units.slice(from, to).map((unit, unitIndex) => (
      <div key={from + unitIndex} className="lyrics-unit">
        {unit.map((line, index) =>
          line.type === "section" ? (
            <div key={index} className="lyrics-section">
              <span className="lyrics-section-label">{line.label}</span>
              {line.chords && <span className="lyrics-section-chords">{line.chords}</span>}
            </div>
          ) : line.type === "pair" ? (
            <div key={index} className="lyrics-pair">
              {line.segments.map((segment, segmentIndex) => (
                <span key={segmentIndex} className="lyrics-seg">
                  <span className="lyrics-seg-chord">{segment.chord ?? NBSP}</span>
                  <span className="lyrics-seg-text">{segment.text || NBSP}</span>
                </span>
              ))}
            </div>
          ) : line.type === "chords" ? (
            // A chord line with no lyric under it (intros, instrumental bars)
            <div key={index} className="lyrics-chordline">
              {line.text.trim().split(/\s+/).map((chord, chordIndex) => <span key={chordIndex}>{chord}</span>)}
            </div>
          ) : (
            <div key={index} className="lyrics-line">{line.text}</div>
          )
        )}
      </div>
    ))}
  </div>
)

// Right edge of an element measured from the stanza's left edge (includes the accent bar padding)
const rightEdge = (element: Element, stanzaLeft: number) => element.getBoundingClientRect().right - stanzaLeft

const measureStanza = (stanza: HTMLElement): StanzaMetrics => {
  const left = stanza.getBoundingClientRect().left
  const unitHeights = Array.from(stanza.querySelectorAll<HTMLElement>(".lyrics-unit")).map(unit => unit.getBoundingClientRect().height)
  // Lines are `width: max-content` inside the measurer, so their right edge is the text's
  const lineWidths = Array.from(stanza.querySelectorAll(".lyrics-line, .lyrics-pair, .lyrics-chordline")).map(line => rightEdge(line, left))
  const sectionWidths = Array.from(stanza.querySelectorAll(".lyrics-section")).map(section => {
    const chords = section.querySelector(".lyrics-section-chords")
    const label = section.querySelector(".lyrics-section-label")
    if (!chords || !label) return 0
    const labelExcess = Math.max(0, label.getBoundingClientRect().width - SECTION_LABEL_MAX_EM * REFERENCE_SIZE)
    return rightEdge(chords, left) - labelExcess
  })
  return { unitHeights, width: Math.max(0, ...lineWidths, ...sectionWidths) }
}

export const LyricsPager = ({
  lyrics,
  showChords,
  transpose,
  fontOffset,
  pageIndex,
  variant,
  onLayout,
  onNavigate,
  onCenterTap
}: LyricsPagerProps) => {
  const areaRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLDivElement | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const swipedRef = useRef(false)
  const [box, setBox] = useState({ width: 0, height: 0 })
  // Tied to the stanzas they were taken from: right after a song change the old measurements
  // would point at stanzas the new song doesn't have
  const [measured, setMeasured] = useState<{ source: ParsedStanza[]; metrics: StanzaMetrics[] } | null>(null)

  const { semitones, key } = transpose
  const stanzas = useMemo<ParsedStanza[]>(
    () => parseLyrics(lyrics, { showChords, transpose: { semitones, key } }).map(stanza => ({ units: toUnits(stanza), kind: stanzaKind(stanza) })),
    [lyrics, showChords, semitones, key]
  )
  const metrics = useMemo(() => (measured?.source === stanzas ? measured.metrics : []), [measured, stanzas])

  useLayoutEffect(() => {
    const area = areaRef.current
    if (!area) return
    const observer = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(area)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    let cancelled = false
    const measure = () => {
      const container = measureRef.current
      if (!container || cancelled) return
      setMeasured({ source: stanzas, metrics: Array.from(container.children as HTMLCollectionOf<HTMLElement>).map(measureStanza) })
    }
    measure()
    // Re-measure once the web font is in: fallback glyphs have different widths
    document.fonts?.ready.then(measure)
    return () => { cancelled = true }
  }, [stanzas])

  const options = VARIANT_OPTIONS[variant]
  const autoSize = useMemo(() => autoFontSize(metrics, box, options), [metrics, box, options])
  const fontSize = Math.min(Math.max(autoSize + fontOffset, FONT_LIMITS.min), FONT_LIMITS.max)
  const layout = useMemo(() => layoutLyrics(metrics, box, fontSize, options.maxColumns), [metrics, box, fontSize, options.maxColumns])
  const pageCount = Math.max(1, layout.pages.length)
  const currentPage: Fragment[][] = layout.pages[Math.min(pageIndex, pageCount - 1)] ?? []

  useEffect(() => {
    if (metrics.length) onLayout({ pageCount, fontSize, autoSize })
  }, [metrics.length, pageCount, fontSize, autoSize, onLayout])

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    // A swipe also ends in a click on touch screens; it already turned the page
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    if (!onCenterTap || window.getSelection()?.toString()) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    if (x < 0.3) onNavigate("prev")
    else if (x > 0.7) onNavigate("next")
    else onCenterTap()
  }

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    swipedRef.current = false
  }

  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      swipedRef.current = true
      onNavigate(deltaX < 0 ? "next" : "prev")
    }
  }

  return (
    <div
      className={`lyrics-viewer is-${variant}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>
      <div ref={areaRef} className="lyrics-area">
        <div
          key={`${lyrics.length}-${pageIndex}-${showChords}-${semitones}`}
          className={`lyrics-page ${layout.overflows ? "is-scrollable" : ""}`}
          style={{ fontSize, visibility: metrics.length ? "visible" : "hidden" }}>
          {currentPage.map((column, columnIndex) => (
            <div key={columnIndex} className="lyrics-column">
              {column.map(({ stanza, from, to }) => (
                <StanzaView
                  key={`${stanza}-${from}`} stanza={stanzas[stanza]}
                  from={from} to={to} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={measureRef} className="lyrics-measure"
        style={{ fontSize: REFERENCE_SIZE }} aria-hidden="true">
        {stanzas.map((stanza, index) => <StanzaView key={index} stanza={stanza} />)}
      </div>
    </div>
  )
}
