// Transposes chords by semitones while keeping each chord at its column, so chords stay
// above the same syllable even when the name changes length (F#m7 → Gm7).

const SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
const NOTE_INDEX: Record<string, number> = {
  ...Object.fromEntries(SHARPS.map((note, index) => [note, index])),
  ...Object.fromEntries(FLATS.map((note, index) => [note, index])),
  "E#": 5, "B#": 0, Fb: 4, Cb: 11
}
// Spanish key names stored in some songs ("LAm", "Sol")
const SOLFEGE: Record<string, string> = { DO: "C", RE: "D", MI: "E", FA: "F", SOL: "G", LA: "A", SI: "B" }
// Keys conventionally written with flats; everything else uses sharps
const FLAT_MAJOR_KEYS = new Set([5, 10, 3, 8, 1, 6]) // F Bb Eb Ab Db Gb
const FLAT_MINOR_KEYS = new Set([2, 7, 0, 5, 10, 3]) // Dm Gm Cm Fm Bbm Ebm

const NOTE = /^([A-G])([#b]?)/

export const normalizeSemitones = (semitones: number) => (((semitones % 12) + 12) % 12)
// −5..+6, the way musicians say it ("dos tonos abajo" rather than "+10")
export const displaySemitones = (semitones: number) => {
  const normalized = normalizeSemitones(semitones)
  return normalized > 6 ? normalized - 12 : normalized
}

const shiftNote = (note: string, semitones: number, preferFlats: boolean) => {
  const index = NOTE_INDEX[note]
  if (index === undefined) return note
  return (preferFlats ? FLATS : SHARPS)[normalizeSemitones(index + semitones)]
}

type ParsedKey = { root: number; minor: boolean; suffix: string }

const parseKey = (key: string): ParsedKey | null => {
  const trimmed = key.trim()
  const solfege = trimmed.match(/^(do|re|mi|fa|sol|la|si)([#b]?)(.*)$/i)
  const normalized = solfege ? SOLFEGE[solfege[1].toUpperCase()] + solfege[2] + solfege[3] : trimmed
  const match = normalized.match(/^([A-G][#b]?)(.*)$/)
  if (!match || NOTE_INDEX[match[1]] === undefined) return null
  return { root: NOTE_INDEX[match[1]], minor: /^m(?!aj)/.test(match[2]), suffix: match[2] }
}

// Whether the key the song is being played in reads better with flats
export const prefersFlats = (key: string, semitones: number) => {
  const parsed = parseKey(key)
  if (!parsed) return false
  const target = normalizeSemitones(parsed.root + semitones)
  return parsed.minor ? FLAT_MINOR_KEYS.has(target) : FLAT_MAJOR_KEYS.has(target)
}

// "D" +(-2) → "C". Unrecognized keys are returned unchanged.
export const transposeKey = (key: string, semitones: number) => {
  const parsed = parseKey(key)
  if (!parsed || !normalizeSemitones(semitones)) return key
  const flats = prefersFlats(key, semitones)
  return (flats ? FLATS : SHARPS)[normalizeSemitones(parsed.root + semitones)] + parsed.suffix
}

// Transposes one chord symbol, including the bass note of slash chords (D/F# → C/E)
export const transposeChord = (chord: string, semitones: number, preferFlats: boolean) => {
  const [main, bass] = chord.split("/")
  const shift = (part: string) => {
    const match = part.match(NOTE)
    if (!match) return part
    return shiftNote(match[1] + match[2], semitones, preferFlats) + part.slice(match[0].length)
  }
  return bass === undefined ? shift(main) : `${shift(main)}/${shift(bass)}`
}

// Chord core inside a token with bar lines / repeat marks around it: "//D", "G//", "(F/A)", "|Am"
const TOKEN_CORE = /^([|/(]*)(.*?)([|/)]*)$/

const transposeToken = (token: string, semitones: number, preferFlats: boolean) => {
  const [, before, core, after] = token.match(TOKEN_CORE) ?? ["", "", token, ""]
  return NOTE.test(core) ? before + transposeChord(core, semitones, preferFlats) + after : token
}

// Rewrites a chord line keeping every chord at its original column. When a chord gets longer
// and would touch the next one, the next chord moves right just enough to keep one space.
export const transposeChordLine = (line: string, semitones: number, preferFlats: boolean) => {
  if (!normalizeSemitones(semitones)) return line
  let output = ""
  for (const match of line.matchAll(/\S+/g)) {
    const token = transposeToken(match[0], semitones, preferFlats)
    const column = Math.max(match.index ?? 0, output.length ? output.length + 1 : 0)
    output = output.padEnd(column) + token
  }
  return output
}

// For chords that don't sit above lyrics (e.g. "Intro: //D Em D/F# G//"): spacing is kept as is
export const transposeInlineChords = (text: string, semitones: number, preferFlats: boolean) =>
  normalizeSemitones(semitones) ? text.replace(/\S+/g, token => transposeToken(token, semitones, preferFlats)) : text
