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

const SECTION_HEADER = /^\s*((?:intro|verso|estrofa|pre-?coro|coro|puente|interludio|instrumental|final|outro|tag)\b[^:]*?)\s*(?::\s*(.*))?$/i
const CHORD = /^[A-G](?:#|b)?(?:maj|min|m|M|dim|aug|sus|add)?\d*(?:(?:sus|add|maj|b|#)\d+)*(?:\/[A-G](?:#|b)?)?$/
// Bar lines, repeat marks and separators that show up between chords: |  //  -  (x2)
const DECORATION = /^[|/\\\-–—.:()x×\d]*$/i

const stripDecoration = (token: string) => token.replace(/^[|/(]+|[|/)]+$/g, "")

const isChordLine = (line: string) => {
  const tokens = line.trim().split(/\s+/)
  let chordCount = 0
  for (const token of tokens) {
    const core = stripDecoration(token)
    if (CHORD.test(core)) chordCount++
    else if (!DECORATION.test(token)) return false
  }
  return chordCount > 0
}

const sectionKind = (label: string): SectionKind => {
  if (/coro/i.test(label)) return "chorus"
  if (/puente/i.test(label)) return "bridge"
  if (/intro|interludio|instrumental|final|outro/i.test(label)) return "instrumental"
  return "verse"
}

const parseLine = (line: string): LyricsLine => {
  const section = line.match(SECTION_HEADER)
  if (section) {
    const label = section[1].trim()
    return { type: "section", label, chords: section[2]?.trim() ?? "", kind: sectionKind(label) }
  }
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
  const lead = text.slice(0, chords[0]?.column ?? text.length)
  if (lead) segments.push({ chord: null, text: lead })
  chords.forEach(({ column, chord }, index) => {
    segments.push({ chord, text: text.slice(column, chords[index + 1]?.column ?? text.length) })
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

export const parseLyrics = (lyrics: string, { showChords, transpose }: ParseOptions): Stanza[] =>
  lyrics
    .replace(/\r\n/g, "\n")
    .split(/\n[ \t]*\n/)
    .map(block =>
      mergePairs(
        block
          .split("\n")
          .map(line => line.trimEnd())
          .filter(Boolean)
          .map(parseLine)
          .map(line => transposeLine(line, transpose))
          .filter(line => showChords || line.type !== "chords")
          .map(line => (!showChords && line.type === "section" ? { ...line, chords: "" } : line))
      )
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
