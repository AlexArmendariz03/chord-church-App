"use client"

import { useLayoutEffect, useRef } from "react"
import { NotificationOutlined } from "@ant-design/icons"
import { toGuideLines, type GuideLine } from "@/features/live/closing-guide-lines"
import { largestFittingScale, MAX_GUIDE_SCALE } from "@/features/live/guide-fit"
import type { GuideStep } from "@/features/live/service-steps"
import { handleSideTap } from "../side-tap"

type ClosingGuideProps = {
  // Qué paso de la guía se ve: la oración o los anuncios, cada uno en su pantalla
  step: GuideStep
  text?: string | null
  variant: "light" | "stage"
  // Tableta y pantalla completa: tocar un lado pasa al paso anterior o al siguiente
  sideTaps: boolean
  onNavigate: (direction: "prev" | "next") => void
  // Stage only: tapping the middle shows or hides the controls, like tapping the lyrics
  onCenterTap?: () => void
}

// Con 4 puntos o más la guía se reparte en dos columnas (en pantallas anchas)
const COLUMNS_FROM_ITEMS = 4

const GuideLines = ({ lines, numbered }: { lines: GuideLine[]; numbered: boolean }) => {
  let itemNumber = 0
  return (
    <div className="closing-guide-lines">
      {lines.map((line, index) => {
        if (line.type === "heading") return <p key={index} className="closing-guide-lead">{line.text}</p>
        if (line.type === "quote") return <p key={index} className="closing-guide-quote">{line.text}</p>
        itemNumber++
        return (
          <div key={index} className="closing-guide-point">
            <p className="closing-guide-item">
              <span className="closing-guide-marker" aria-hidden="true">{numbered ? itemNumber : "•"}</span>
              {line.text}
            </p>
            {line.subItems.length > 0 && (
              <ul className="closing-guide-subitems">
                {line.subItems.map((subItem, subIndex) => <li key={subIndex}>{subItem}</li>)}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

const STEP_TITLES: Record<GuideStep, string> = { prayer: "Momento de oración", announcements: "Anuncios" }

// What the leader says once the worship set is over: first the prayer, then the announcements
export const ClosingGuide = ({ step, text, variant, sideTaps, onNavigate, onCenterTap }: ClosingGuideProps) => {
  const lines = toGuideLines(text)
  const inColumns = lines.filter(line => line.type === "item").length >= COLUMNS_FROM_ITEMS
  const sectionRef = useRef<HTMLElement>(null)

  // Ajusta la letra para que la guía llene la pantalla sin pasarse, y vuelve a medir si cambia el tamaño
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const fit = () => {
      const scale = largestFittingScale(value => {
        section.style.setProperty("--guide-fit", String(value))
        return section.scrollHeight <= section.clientHeight + 1
      }, { max: MAX_GUIDE_SCALE })
      section.style.setProperty("--guide-fit", String(scale))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(section)
    return () => observer.disconnect()
  }, [text, step, variant])

  return (
    <section
      ref={sectionRef} key={step}
      className={`closing-guide is-${variant} is-${step}`} aria-label={STEP_TITLES[step]}
      onClick={event => handleSideTap(event, { sideTaps, onNavigate, onCenterTap })}>
      <div className={`closing-guide-content ${inColumns ? "is-columns" : ""}`}>
        <span className="closing-guide-eyebrow">
          {step === "announcements" && <NotificationOutlined />} Solo dirigente · Antes de la ofrenda
        </span>
        <h2 className="closing-guide-title">{STEP_TITLES[step]}</h2>
        <GuideLines lines={lines} numbered={step === "prayer"} />
      </div>
    </section>
  )
}
