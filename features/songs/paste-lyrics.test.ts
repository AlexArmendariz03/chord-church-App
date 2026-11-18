import { describe, expect, it } from "vitest"
import { cleanPastedLyrics, pasteIntoSheet, toEnglishChord } from "./paste-lyrics"
import { blocksToLyrics } from "./sheet-layout"

describe("toEnglishChord", () => {
  it("pasa cada nota y su tipo a letras", () => {
    expect(["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"].map(toEnglishChord)).toEqual(["C", "D", "E", "F", "G", "A", "B"])
    expect(toEnglishChord("Sol#m7")).toBe("G#m7")
    expect(toEnglishChord("Sib")).toBe("Bb")
    expect(toEnglishChord("Fa♯")).toBe("F#")
    expect(toEnglishChord("DO")).toBe("C")
  })

  it("lee el guion como menor y el bajo después de la barra", () => {
    expect(toEnglishChord("Si-")).toBe("Bm")
    expect(toEnglishChord("Fa#-")).toBe("F#m")
    expect(toEnglishChord("Sol/Si")).toBe("G/B")
  })

  it("ignora el punto o la coma que queda pegada", () => {
    expect(toEnglishChord("Fa.")).toBe("F")
    expect(toEnglishChord("La#,")).toBe("A#")
  })

  it("no confunde palabras de la letra con acordes", () => {
    expect(toEnglishChord("la")).toBeNull()
    expect(toEnglishChord("mi")).toBeNull()
    expect(toEnglishChord("Solo")).toBeNull()
    expect(toEnglishChord("Fama")).toBeNull()
    expect(toEnglishChord("G")).toBeNull()
  })
})

describe("cleanPastedLyrics", () => {
  it("pasa los renglones de acordes en Do-Re-Mi sin mover cada acorde de su columna", () => {
    const { lyrics, convertedLines } = cleanPastedLyrics([
      "Do         Sol    Re-",
      "Quiero llenar tu trono",
      "Mi Dios así eres tú"
    ].join("\n"))
    expect(lyrics).toBe([
      "C          G      Dm",
      "Quiero llenar tu trono",
      "Mi Dios así eres tú"
    ].join("\n"))
    expect(convertedLines).toBe(1)
  })

  it("une el guion suelto con su nota y deja las marcas de repetición", () => {
    expect(cleanPastedLyrics("   Sol -     Do      Fa\n//Me muestras que tú eres real//").lyrics)
      .toBe("   Gm        C       F\n//Me muestras que tú eres real//")
    expect(cleanPastedLyrics("Re  La  //  (x2)").lyrics).toBe("D   A   //  (x2)")
  })

  it("pasa los acordes de un encabezado de sección", () => {
    expect(cleanPastedLyrics("Intro: Do Sol La- Fa").lyrics).toBe("Intro: C G Am F")
    expect(cleanPastedLyrics("Coro").lyrics).toBe("Coro")
  })

  it("deja igual los acordes que ya vienen en letras", () => {
    const sheet = "G       D\nCuan grande es Él\n\nCoro\nEm      C\nSanto, santo"
    expect(cleanPastedLyrics(sheet)).toEqual({ lyrics: sheet, convertedLines: 0 })
  })

  it("cambia tabuladores y espacios raros por espacios normales", () => {
    expect(cleanPastedLyrics("G\tD\nHola mundo​  ").lyrics).toBe("G       D\nHola mundo")
  })

  it("junta los renglones vacíos repetidos y quita los de las orillas", () => {
    expect(cleanPastedLyrics("\n\nVerso 1\nG\nUno\n\n\n\nCoro\nC\nDos\n\n").lyrics).toBe("Verso 1\nG\nUno\n\nCoro\nC\nDos")
  })

  it("en hojas con un renglón vacío después de cada renglón, solo dos o más separan estrofas", () => {
    const pasted = ["G", "", "Uno", "", "D", "", "Dos", "", "", "Em", "", "Tres", "", "C", "", "Cuatro"].join("\n")
    expect(cleanPastedLyrics(pasted).lyrics).toBe(["G", "Uno", "D", "Dos", "", "Em", "Tres", "C", "Cuatro"].join("\n"))
  })
})

describe("pasteIntoSheet", () => {
  const sheet = [{ id: "a", x: 24, y: 24, text: "Verso 1\nG\nUno" }, { id: "b", x: 24, y: 300, text: "" }]
  const pasted = "Coro\nDo\nDos\n\nFinal\nSol\nTres"

  it("reemplaza la hoja con los bloques de lo pegado", () => {
    const result = pasteIntoSheet(sheet, pasted, "replace")
    expect(result.added).toBe(2)
    expect(result.convertedLines).toBe(2)
    expect(blocksToLyrics(result.blocks)).toBe("Coro\nC\nDos\n\nFinal\nG\nTres")
  })

  it("agrega lo pegado debajo de lo que ya había, sin los bloques vacíos", () => {
    const result = pasteIntoSheet(sheet, pasted, "append")
    expect(result.blocks.map(block => block.id).slice(0, 1)).toEqual(["a"])
    expect(result.blocks).toHaveLength(3)
    expect(blocksToLyrics(result.blocks)).toBe("Verso 1\nG\nUno\n\nCoro\nC\nDos\n\nFinal\nG\nTres")
  })
})
