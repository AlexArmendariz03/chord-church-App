import { prefersFlats, transposeChordLine, transposeInlineChords } from "./transpose"

// Turns a plain chord sheet (chords on their own line above the lyrics) into stanzas of typed
// lines, so the viewer can color chords, label sections and keep each stanza together.
// A chord line followed by its lyric line becomes a "pair": the lyric is cut into segments,
// each starting at the column where a chord sat, so chords stay anchored to their syllable
// even with a proportional font.

// `chord` is null for the lyric text before the first chord
export type Segment = { chord: string | null; text: string }

export type LyricsLine =
  | { type: "chords"; text: string }
  | { type: "lyrics"; text: string }
  | { type: "pair"; segments: Segment[] }
  | { type: "section"; label: string; chords: string; kind: SectionKind }

export type SectionKind = "chorus" | "bridge" | "instrumental" | "verse"

export type Stanza = LyricsLine[]

// Smallest piece a stanza can be split into across columns: one line or chord+lyric pair;
// a section header always travels with what follows.
export type Unit = LyricsLine[]

// Section names as they come in scraped sheets, Spanish or English. A header is the name alone
// ("Coro", "[VERSO 2]", "Verso II (x2)"), the name and a colon ("Intro: Am G F") or the name and
// chords ("Intro A D E").
const SECTION_NAME = /^\s*([[(]?)\s*(intro|verso|estrofa|pre-?coro|coro|estribillo|puente|interludio|instrumental|final|outro|tag|pre-?chorus|chorus|verse|bridge|interlude|ending)\b(.*)$/i
// What can follow the name in the label itself: a number and/or a note like "(x2)"
const SECTION_SUFFIX = /^\s*(?:\d+|[ivx]+\b)?\s*(?:\([^)]*\))?\s*$/i
// Shown in Spanish whatever language the sheet used
const SECTION_LABELS: Record<string, string> = {
  chorus: "Coro", prechorus: "Pre-coro", verse: "Verso", bridge: "Puente", interlude: "Interludio", ending: "Final"
}
// Chord diagrams some sheets append at the end ("G2= 3x0230"): not part of the song
const CHORD_DIAGRAM = /^\s*[A-G]\S*\s*=\s*[0-9x]{4,6}\s*$/i
const CHORD = /^[A-G](?:#|b)?(?:maj|min|m|M|dim|aug|sus|add)?\d*(?:(?:sus|add|maj|b|#)\d+)*(?:\/[A-G](?:#|b)?)?$/
// Bar lines, repeat marks and separators that show up between chords: |  //  -  (x2)
const DECORATION = /^[|/\\\-–—.:()x×\d]*$/i

const stripDecoration = (token: string) => token.replace(/^[|/(]+|[|/)]+$/g, "")

const isChordLine = (line: string) => {
  const tokens = line.trim().split(/\s+/)
  let chordCount = 0
  for (const token of tokens) {
    const core = stripDecoration(token)
    // Runs written with dashes count chord by chord: "D-A-E", "A-C-E-Gb-E-D"
    const parts = core.split(/[-–]/).filter(Boolean)
    if (parts.length && parts.every(part => CHORD.test(part))) chordCount++
    else if (!DECORATION.test(token)) return false
  }
  return chordCount > 0
}

const sectionKind = (label: string): SectionKind => {
  if (/coro|estribillo/i.test(label)) return "chorus"
  if (/puente/i.test(label)) return "bridge"
  if (/intro|interludio|instrumental|final|outro/i.test(label)) return "instrumental"
  return "verse"
}

const sectionHeader = (line: string): LyricsLine | null => {
  const match = line.match(SECTION_NAME)
  if (!match) return null
  const [, opening, name] = match
  // "[CORO]", "(CORO)": drop the closing bracket that pairs with the opening one
  const rest = opening ? match[3].replace(/[\])]\s*$/, "") : match[3]
  const colon = rest.indexOf(":")
  const suffix = colon >= 0 ? rest.slice(0, colon) : rest
  let chords = colon >= 0 ? rest.slice(colon + 1).trim() : ""
  let labelSuffix = suffix.trim()
  if (!SECTION_SUFFIX.test(suffix)) {
    // "Intro A D F#m E": no colon, chords right after the name
    if (colon >= 0 || !isChordLine(suffix)) return null
    chords = suffix.trim()
    labelSuffix = ""
  }
  const translated = SECTION_LABELS[name.toLowerCase().replace("-", "")]
  const label = [translated ?? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(), labelSuffix].filter(Boolean).join(" ")
  return { type: "section", label, chords, kind: sectionKind(label) }
}

// Scraped lyrics keep the runs of spaces that made room for chords; once each chord sits on its
// own segment they only open gaps in the sentence ("nada     si te tengo"), so they shrink to one
const tidyText = (text: string) => text.replace(/ {2,}/g, " ")

const parseLine = (line: string): LyricsLine => {
  const section = sectionHeader(line)
  if (section) return section
  if (isChordLine(line)) return { type: "chords", text: line }
  return { type: "lyrics", text: line }
}

type ParseOptions = {
  showChords: boolean
  // Semitones to move every chord, and the song's written key (to choose ♯ or ♭ spelling)
  transpose?: { semitones: number; key: string }
}

const transposeLine = (line: LyricsLine, transpose: ParseOptions["transpose"]): LyricsLine => {
  if (!transpose?.semitones) return line
  const flats = prefersFlats(transpose.key, transpose.semitones)
  if (line.type === "chords") return { ...line, text: transposeChordLine(line.text, transpose.semitones, flats) }
  if (line.type === "section" && line.chords) return { ...line, chords: transposeInlineChords(line.chords, transpose.semitones, flats) }
  return line
}

const toSegments = (chordLine: string, text: string): Segment[] => {
  const chords = [...chordLine.matchAll(/\S+/g)].map(match => ({ column: match.index ?? 0, chord: match[0] }))
  const segments: Segment[] = []
  const lead = tidyText(text.slice(0, chords[0]?.column ?? text.length))
  if (lead) segments.push({ chord: null, text: lead })
  chords.forEach(({ column, chord }, index) => {
    segments.push({ chord, text: tidyText(text.slice(column, chords[index + 1]?.column ?? text.length)) })
  })
  return segments
}

const mergePairs = (lines: LyricsLine[]) =>
  lines.reduce<LyricsLine[]>((merged, line) => {
    const previous = merged.at(-1)
    if (line.type === "lyrics" && previous?.type === "chords") {
      merged[merged.length - 1] = { type: "pair", segments: toSegments(previous.text, line.text) }
    } else {
      merged.push(line)
    }
    return merged
  }, [])

// Many sheets have no blank lines at all: a section header also starts a new stanza
const splitAtSections = (lines: LyricsLine[]) =>
  lines.reduce<LyricsLine[][]>((stanzas, line) => {
    const current = stanzas.at(-1)
    if (!current || (line.type === "section" && current.length)) stanzas.push([line])
    else current.push(line)
    return stanzas
  }, [])

export const parseLyrics = (lyrics: string, { showChords, transpose }: ParseOptions): Stanza[] =>
  lyrics
    .replace(/\r\n/g, "\n")
    .split(/\n[ \t]*\n/)
    .flatMap(block =>
      splitAtSections(
        block
          .split("\n")
          .map(line => line.trimEnd())
          .filter(line => line && !CHORD_DIAGRAM.test(line))
          .map(parseLine)
      )
    )
    .map(lines =>
      mergePairs(
        lines
          .map(line => transposeLine(line, transpose))
          .filter(line => showChords || line.type !== "chords")
          .map(line => (!showChords && line.type === "section" ? { ...line, chords: "" } : line))
      )
        // Lyrics left without a chord line: their spacing no longer aligns anything
        .map(line => (line.type === "lyrics" ? { ...line, text: tidyText(line.text.trim()) } : line))
    )
    .filter(stanza => stanza.length > 0)

export const toUnits = (stanza: Stanza): Unit[] => {
  const units: Unit[] = []
  let pending: LyricsLine[] = []
  stanza.forEach((line, index) => {
    pending.push(line)
    const next = stanza[index + 1]
    if (line.type !== "section" || !next) {
      units.push(pending)
      pending = []
    }
  })
  return units
}

export const stanzaKind = (stanza: Stanza) => {
  const first = stanza[0]
  return first?.type === "section" ? first.kind : null
}
