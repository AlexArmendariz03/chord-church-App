import { classifyLine } from "@/shared/lyrics/parse-lyrics"
import { nextFreeY, splitIntoBlocks, stackBlocks, type SheetBlock } from "./sheet-layout"

// Limpia una alabanza pegada en el editor: espacios raros, tabuladores, renglones vacíos de más
// y acordes escritos en Do, Re, Mi, que pasan a C, D, E para que el transporte y la vista en vivo
// los reconozcan.

const SOLFEGE: Record<string, string> = { do: "C", re: "D", mi: "E", fa: "F", sol: "G", la: "A", si: "B" }
// Nota, alteración y el resto: "Sol#m7" → Sol, #, m7. Se revisa aparte que empiece con mayúscula,
// para no confundir "la" o "mi" de la letra con un acorde.
const SPANISH_CHORD = /^(do|re|mi|fa|sol|la|si)([#b♯♭]?)(.*)$/i
const QUALITY = /^(?:maj|min|m|M|dim|aug|sus|add)?\d*(?:(?:sus|add|maj|b|#)\d+)*$/
// Marcas que van entre acordes sin ser uno: //  |  (x2)
const DECORATION = /^[|/\\().:x×\d-]+$/i
// Tabulador de 8 columnas, como cualquier editor de texto plano
const TAB_SIZE = 8

const accidentalOf = (symbol: string) => (symbol === "♯" ? "#" : symbol === "♭" ? "b" : symbol)

// "Si-" → "Bm", "Fa#-" → "F#m", "Sol/Si" → "G/B", "Fa." → "F"; null si no es un acorde en Do-Re-Mi
export const toEnglishChord = (token: string): string | null => {
  const match = token.replace(/[.,;]+$/, "").match(SPANISH_CHORD)
  if (!match) return null
  const [, root, accidental, rest] = match
  if (root[0] !== root[0].toUpperCase()) return null
  // El guion pegado a la nota es menor
  let quality = rest.startsWith("-") ? `m${rest.slice(1)}` : rest
  let bass = ""
  const slash = quality.indexOf("/")
  if (slash >= 0) {
    const bassNote = toEnglishChord(quality.slice(slash + 1))
    if (!bassNote || !/^[A-G][#b]?$/.test(bassNote)) return null
    bass = `/${bassNote}`
    quality = quality.slice(0, slash)
  }
  if (!QUALITY.test(quality)) return null
  return SOLFEGE[root.toLowerCase()] + accidentalOf(accidental) + quality + bass
}

// Un renglón de acordes en Do-Re-Mi con cada acorde en la columna donde estaba, para que siga
// sobre su sílaba. null si el renglón no es solo acordes en Do-Re-Mi.
const convertChordLine = (line: string): string | null => {
  // end: la columna donde terminaba el acorde como venía escrito
  const placed: { text: string; column: number; end: number }[] = []
  let converted = 0
  for (const match of line.matchAll(/\S+/g)) {
    const token = match[0]
    const column = match.index ?? 0
    const previous = placed.at(-1)
    // "Re -": el guion suelto, a un espacio de una nota sola, también es menor
    if (token === "-" && previous && /^[A-G][#b]?$/.test(previous.text) && column === previous.end + 1) {
      previous.text += "m"
      continue
    }
    const chord = toEnglishChord(token)
    if (chord) converted++
    else if (!DECORATION.test(token)) return null
    placed.push({ text: chord ?? token, column, end: column + token.length })
  }
  if (!converted) return null
  let result = ""
  for (const { text, column } of placed) result = result.padEnd(Math.max(column, result ? result.length + 1 : 0)) + text
  return classifyLine(result).type === "chords" ? result : null
}

// "Intro: Do Sol Re" → "Intro: C G D"
const convertSectionChords = (line: string): string | null => {
  const colon = line.indexOf(":")
  if (colon <= 0 || classifyLine(line.slice(0, colon)).type !== "section") return null
  const chords = line.slice(colon + 1).trim()
  const converted = chords && convertChordLine(chords)
  // Aquí los acordes no van sobre ninguna sílaba: un espacio entre cada uno
  return converted ? `${line.slice(0, colon)}: ${converted.split(/\s+/).join(" ")}` : null
}

const expandTabs = (line: string) => {
  let result = ""
  for (const char of line) result += char === "\t" ? " ".repeat(TAB_SIZE - (result.length % TAB_SIZE)) : char
  return result
}

// Muchas hojas copiadas de páginas web dejan un renglón vacío después de cada renglón; ahí un
// solo renglón vacío no separa nada y las estrofas se separan con dos o más
const isDoubleSpaced = (lines: string[]) => {
  let gaps = 0
  let singleGaps = 0
  let blankRun = 0
  let seenText = false
  for (const line of lines) {
    if (!line) {
      blankRun++
      continue
    }
    if (seenText) {
      gaps++
      if (blankRun === 1) singleGaps++
    }
    seenText = true
    blankRun = 0
  }
  return gaps >= 4 && singleGaps / gaps >= 0.6
}

export type PastedLyrics = {
  lyrics: string
  // Renglones de acordes que estaban en Do-Re-Mi
  convertedLines: number
}

export const cleanPastedLyrics = (text: string): PastedLyrics => {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .replace(/[​-‍﻿]/g, "")
    .replace(/[  -   　]/g, " ")
    .split("\n")
    .map(line => expandTabs(line).trimEnd())

  const doubleSpaced = isDoubleSpaced(lines)
  const output: string[] = []
  let blankRun = 0
  let convertedLines = 0
  for (const line of lines) {
    if (!line) {
      blankRun++
      continue
    }
    const isBreak = doubleSpaced ? blankRun >= 2 : blankRun >= 1
    if (output.length && isBreak) output.push("")
    blankRun = 0
    const converted = convertSectionChords(line) ?? convertChordLine(line)
    if (converted) convertedLines++
    output.push(converted ?? line)
  }

  return { lyrics: output.join("\n"), convertedLines }
}

export type PasteMode = "replace" | "append"

// La hoja después de pegar: la letra limpia, cortada en bloques, en lugar de los que había o
// debajo de todos. added: cuántos bloques salieron de lo pegado
export const pasteIntoSheet = (blocks: SheetBlock[], text: string, mode: PasteMode) => {
  const { lyrics, convertedLines } = cleanPastedLyrics(text)
  const texts = splitIntoBlocks(lyrics)
  const kept = mode === "append" ? blocks.filter(block => block.text.trim()) : []
  const added = stackBlocks(texts, { x: 24, y: kept.length ? nextFreeY(kept) : 24 })
  return { blocks: [...kept, ...added], added: added.length, convertedLines }
}
