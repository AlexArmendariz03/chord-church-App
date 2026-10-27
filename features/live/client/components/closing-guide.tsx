"use client"

import { NotificationOutlined } from "@ant-design/icons"

type ClosingGuideProps = {
  prayerGuide?: string | null
  announcements?: string | null
  variant: "light" | "stage"
  // Stage only: tapping the guide shows or hides the controls, like tapping the lyrics
  onCenterTap?: () => void
}

type GuideLine = { type: "heading" | "item"; text: string }

// One item per line; a line ending in ":" ("Vamos a orar por:") introduces the items below it
const toLines = (text?: string | null): GuideLine[] =>
  (text ?? "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => (line.endsWith(":") ? { type: "heading", text: line } : { type: "item", text: line }))

const GuideLines = ({ lines, numbered }: { lines: GuideLine[]; numbered: boolean }) => {
  let itemNumber = 0
  return (
    <div className="closing-guide-lines">
      {lines.map((line, index) => {
        if (line.type === "heading") return <p key={index} className="closing-guide-lead">{line.text}</p>
        itemNumber++
        return (
          <p key={index} className="closing-guide-item">
            <span className="closing-guide-marker" aria-hidden="true">{numbered ? itemNumber : "•"}</span>
            {line.text}
          </p>
        )
      })}
    </div>
  )
}

// What the leader says once the songs are over: prayer points, then the announcements
export const ClosingGuide = ({ prayerGuide, announcements, variant, onCenterTap }: ClosingGuideProps) => {
  const prayerLines = toLines(prayerGuide)
  const announcementLines = toLines(announcements)

  return (
    <section
      className={`closing-guide is-${variant}`} aria-label="Guía para el dirigente"
      onClick={onCenterTap}>
      <div className={`closing-guide-content ${prayerLines.length && announcementLines.length ? "has-both" : ""}`}>
        <div className="closing-guide-prayer">
          <span className="closing-guide-eyebrow">Solo dirigente · Antes de la ofrenda</span>
          {prayerLines.length > 0 && (
            <>
              <h2 className="closing-guide-title">Momento de oración</h2>
              <GuideLines lines={prayerLines} numbered />
            </>
          )}
        </div>
        {announcementLines.length > 0 && (
          <aside className="closing-guide-note">
            <span className="closing-guide-note-title"><NotificationOutlined /> Anuncios</span>
            <GuideLines lines={announcementLines} numbered={false} />
          </aside>
        )}
      </div>
    </section>
  )
}

export const hasClosingGuide = (service?: { prayerGuide?: string | null; announcements?: string | null } | null) =>
  Boolean(service?.prayerGuide?.trim() || service?.announcements?.trim())
