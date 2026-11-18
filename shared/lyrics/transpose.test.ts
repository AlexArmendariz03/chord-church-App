import { describe, expect, it } from "vitest"
import { displaySemitones, formatSemitones, prefersFlats, transposeChord, transposeChordLine, transposeInlineChords, transposeKey } from "./transpose"

describe("transposeKey", () => {
  it("sube y baja el tono", () => {
    expect(transposeKey("D", -2)).toBe("C")
    expect(transposeKey("G", 2)).toBe("A")
    expect(transposeKey("Am", 3)).toBe("Cm")
  })

  it("usa bemoles en los tonos que se escriben con bemol", () => {
    expect(transposeKey("C", 5)).toBe("F")
    expect(transposeKey("C", 10)).toBe("Bb")
    expect(transposeKey("Am", 1)).toBe("Bbm")
    expect(transposeKey("C", 6)).toBe("Gb")
  })

  it("entiende los nombres en español", () => {
    expect(transposeKey("Sol", 2)).toBe("A")
    expect(transposeKey("LAm", -2)).toBe("Gm")
  })

  it("deja igual un tono que no reconoce o sin cambio", () => {
    expect(transposeKey("Libre", 2)).toBe("Libre")
    expect(transposeKey("E", 0)).toBe("E")
    expect(transposeKey("E", 12)).toBe("E")
  })
})

describe("displaySemitones", () => {
  it("muestra los semitonos entre −5 y +6", () => {
    expect(displaySemitones(10)).toBe(-2)
    expect(displaySemitones(-1)).toBe(-1)
    expect(displaySemitones(6)).toBe(6)
    expect(displaySemitones(13)).toBe(1)
  })
})

describe("formatSemitones", () => {
  it("lleva signo de más al subir", () => {
    expect(formatSemitones(2)).toBe("+2")
    expect(formatSemitones(11)).toBe("-1")
    expect(formatSemitones(0)).toBe("0")
  })
})

describe("prefersFlats", () => {
  it("decide por el tono que resulta", () => {
    expect(prefersFlats("C", 5)).toBe(true)
    expect(prefersFlats("C", 7)).toBe(false)
    expect(prefersFlats("Dm", 0)).toBe(true)
    expect(prefersFlats("???", 3)).toBe(false)
  })
})

describe("transposeChord", () => {
  it("transpone el bajo de los acordes con barra", () => {
    expect(transposeChord("D/F#", -2, false)).toBe("C/E")
  })

  it("conserva el sufijo del acorde", () => {
    expect(transposeChord("F#m7", 1, false)).toBe("Gm7")
    expect(transposeChord("Csus4", 3, true)).toBe("Ebsus4")
  })
})

describe("transposeChordLine", () => {
  it("mantiene cada acorde en su columna", () => {
    expect(transposeChordLine("G     D     Em", 2, false)).toBe("A     E     F#m")
  })

  it("separa con un espacio si un acorde crece y toca al siguiente", () => {
    expect(transposeChordLine("E F", 2, false)).toBe("F# G")
    expect(transposeChordLine("E F#", 1, false)).toBe("F G")
  })

  it("respeta barras y repeticiones", () => {
    expect(transposeChordLine("|G  //D", 2, false)).toBe("|A  //E")
  })
})

describe("transposeInlineChords", () => {
  it("transpone los acordes de una introducción sin cambiar los espacios", () => {
    expect(transposeInlineChords("//D Em D/F# G//", 2, false)).toBe("//E F#m E/G# A//")
  })
})
