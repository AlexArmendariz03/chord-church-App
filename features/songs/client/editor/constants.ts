import type { CSSProperties } from "react"
import { trimLyrics } from "@/shared/utils/lyrics"
import type { BoardConfig, ContentBlock } from "./types"

// Medidas del lienzo (Konva) y posición del tablero dentro de él
export const STAGE = { width: 1400, height: 1200 }
export const BOARD = { x: 120, y: 80 }

export const INITIAL_BOARD_CONFIG: BoardConfig = {
  boardWidth: 760,
  boardHeight: 980,
  backgroundColor: "#1f2937",
  borderColor: "#f59e0b",
  textColor: "#ffffff",
  fontSize: 18,
  padding: 24,
  textAlign: "center",
  zoom: 0.62
}

export const CARD_STYLE: CSSProperties = {
  borderRadius: 22,
  boxShadow: "0 10px 28px var(--app-shadow)",
  border: "1px solid var(--app-border-soft)"
}

export const ALIGN_OPTIONS = [
  { label: "Izquierda", value: "left" },
  { label: "Centro", value: "center" },
  { label: "Derecha", value: "right" }
]

export type StylePreset = {
  key: string
  name: string
  background: string
  border: string
  lyricsColor: string
  chordColor: string
}

export const STYLE_PRESETS: StylePreset[] = [
  { key: "escenario", name: "Escenario", background: "#1f2937", border: "#f59e0b", lyricsColor: "#ffffff", chordColor: "#f59e0b" },
  { key: "medianoche", name: "Medianoche", background: "#0f172a", border: "#6366f1", lyricsColor: "#f1f5f9", chordColor: "#a5b4fc" },
  { key: "hoja-clara", name: "Hoja clara", background: "#fdfaf5", border: "#92400e", lyricsColor: "#1f2937", chordColor: "#1d4ed8" }
]

// El texto de ejemplo del primer bloque: no cuenta como letra al guardar
export const PLACEHOLDER_LYRICS = "Escribe aquí la letra de tu canción"

export const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

export const clampZoom = (value: number) => Math.min(2.5, Math.max(0.35, value))

const block = (text: string, index: number): ContentBlock => ({
  id: createId(),
  type: "content",
  text,
  x: BOARD.x + 24,
  y: BOARD.y + 24 + index * 150,
  width: 340,
  color: "#ffffff",
  fontSize: 18,
  align: "center"
})

export const createInitialBlock = () => block(PLACEHOLDER_LYRICS, 0)

// Alabanzas sin payload (importadas o creadas antes del editor): un bloque por estrofa
export const buildBlocksFromLyrics = (lyrics: string): ContentBlock[] => {
  const chunks = lyrics.split(/\n[ \t]*\n/).map(trimLyrics).filter(Boolean)
  return chunks.length ? chunks.map(block) : [createInitialBlock()]
}
