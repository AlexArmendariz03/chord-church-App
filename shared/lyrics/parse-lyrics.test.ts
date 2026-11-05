import { describe, expect, it } from "vitest"
import { classifyLine, parseLyrics, stanzaKind, toUnits, transposeSheet } from "./parse-lyrics"

const SONG = [
  "Verso 1",
  "G       D",
  "Cuan grande es Él",
  "",
  "[CORO]",
  "Em      C",
  "Santo, santo",
  "",
  "G2= 320033"
].join("\n")

describe("parseLyrics", () => {
  it("une cada línea de acordes con su letra", () => {
    const [verse] = parseLyrics(SONG, { showChords: true })
    expect(verse[0]).toEqual({ type: "section", label: "Verso 1", chords: "", kind: "verse" })
    expect(verse[1]).toEqual({
      type: "pair",
      segments: [{ chord: "G", text: "Cuan gra" }, { chord: "D", text: "nde es Él" }]
    })
  })

  it("reconoce las secciones entre corchetes y su tipo", () => {
    const stanzas = parseLyrics(SONG, { showChords: true })
    expect(stanzas).toHaveLength(2)
    expect(stanzaKind(stanzas[1])).toBe("chorus")
    expect(stanzas[1][0]).toMatchObject({ type: "section", label: "Coro" })
  })

  it("quita los diagramas de acordes del final", () => {
    const text = parseLyrics(SONG, { showChords: true }).flat()
    expect(JSON.stringify(text)).not.toContain("320033")
  })

  it("sin acordes deja solo la letra, sin espacios de sobra", () => {
    const [verse] = parseLyrics(SONG, { showChords: false })
    expect(verse[1]).toEqual({ type: "lyrics", text: "Cuan grande es Él" })
  })

  it("lee los acordes que van junto al nombre de la sección", () => {
    const [intro] = parseLyrics("Intro: //D Em D/F# G//", { showChords: true })
    expect(intro[0]).toEqual({ type: "section", label: "Intro", chords: "//D Em D/F# G//", kind: "instrumental" })
    const [noColon] = parseLyrics("Intro A D F#m E", { showChords: true })
    expect(noColon[0]).toMatchObject({ label: "Intro", chords: "A D F#m E" })
  })

  it("traduce las secciones en inglés", () => {
    const [chorus] = parseLyrics("Chorus\nHoly", { showChords: true })
    expect(chorus[0]).toMatchObject({ label: "Coro", kind: "chorus" })
  })

  it("no confunde una frase que empieza como sección con un encabezado", () => {
    const [stanza] = parseLyrics("Coro de ángeles canta", { showChords: true })
    expect(stanza[0]).toEqual({ type: "lyrics", text: "Coro de ángeles canta" })
  })

  it("transpone los acordes", () => {
    const [verse] = parseLyrics("G       D\nCuan grande es Él", { showChords: true, transpose: { semitones: 2, key: "G" } })
    expect(verse[0]).toMatchObject({ segments: [{ chord: "A" }, { chord: "E" }] })
  })

  it("una sección nueva empieza otra estrofa aunque no haya línea en blanco", () => {
    expect(parseLyrics("Verso\nuno\nCoro\ndos", { showChords: true })).toHaveLength(2)
  })
})

describe("toUnits", () => {
  it("el encabezado de sección va con la línea que le sigue", () => {
    const [verse] = parseLyrics("Verso\nuno\ndos", { showChords: true })
    const units = toUnits(verse)
    expect(units).toHaveLength(2)
    expect(units[0].map(line => line.type)).toEqual(["section", "lyrics"])
  })
})

describe("classifyLine", () => {
  it("distingue secciones, acordes, letra y renglones vacíos", () => {
    expect(classifyLine("[CORO]")).toEqual({ type: "section", kind: "chorus" })
    expect(classifyLine("Intro: A D E")).toEqual({ type: "section", kind: "instrumental" })
    expect(classifyLine("G       D")).toEqual({ type: "chords" })
    expect(classifyLine("Cuan grande es Él")).toEqual({ type: "lyrics" })
    expect(classifyLine("   ")).toEqual({ type: "blank" })
    expect(classifyLine("G2= 320033")).toEqual({ type: "ignored" })
  })
})

describe("transposeSheet", () => {
  it("mueve los acordes y deja intacta la letra y el nombre de las secciones", () => {
    const sheet = ["Coro", "G       D", "Cuan grande es Él", "Intro: G D/F#"].join("\n")
    expect(transposeSheet(sheet, 2, "G").split("\n")).toEqual(["Coro", "A       E", "Cuan grande es Él", "Intro: A E/G#"])
  })
})
