import { describe, expect, it } from "vitest"
import { BLOCK_GAP, blocksToLyrics, loadBlocks, moveChord, moveInOrder, resolveOverlaps, splitIntoBlocks, stackBlocks, stackInOrder } from "./sheet-layout"

const SONG = ["Verso 1", "G       D", "Cuan grande es Él", "Coro", "Em      C", "Santo, santo", "", "Final"].join("\n")

describe("splitIntoBlocks", () => {
  it("empieza un bloque en cada sección y en cada renglón vacío", () => {
    expect(splitIntoBlocks(SONG)).toEqual([
      "Verso 1\nG       D\nCuan grande es Él",
      "Coro\nEm      C\nSanto, santo",
      "Final"
    ])
  })
})

describe("blocksToLyrics", () => {
  it("ordena los bloques de arriba hacia abajo y, en el mismo renglón, de izquierda a derecha", () => {
    const blocks = [
      { id: "c", x: 0, y: 400, text: "Final" },
      { id: "b", x: 420, y: 30, text: "Coro" },
      { id: "a", x: 20, y: 20, text: "Verso" }
    ]
    expect(blocksToLyrics(blocks)).toBe("Verso\n\nCoro\n\nFinal")
  })
})

describe("loadBlocks", () => {
  it("abre los bloques guardados si coinciden con la letra", () => {
    const blocks = [{ id: "a", x: 300, y: 10, text: "Coro\nSanto" }]
    expect(loadBlocks("Coro\nSanto", { layout: "hoja", blocks })).toEqual(blocks)
  })

  it("arma los bloques desde la letra si el payload no es de la hoja o ya no coincide", () => {
    expect(loadBlocks(SONG, { contentBlocks: [] })).toHaveLength(3)
    expect(loadBlocks(SONG, { layout: "hoja", blocks: [{ id: "a", x: 0, y: 0, text: "Otra" }] })).toHaveLength(3)
  })

  it("apila los bloques sin encimarlos", () => {
    const [first, second] = stackBlocks(["A\nB\nC", "D"])
    expect(second.y).toBeGreaterThan(first.y + 3 * 27)
  })
})

describe("moveChord", () => {
  it("mueve un acorde a otra columna", () => {
    expect(moveChord("G       D", 8, 4)).toBe("G   D")
    expect(moveChord("G", 0, 3)).toBe("   G")
  })

  it("no deja que un acorde choque con otro", () => {
    expect(moveChord("G   D", 4, 1)).toBeNull()
    expect(moveChord("G   D", 0, 3)).toBeNull()
  })
})

describe("resolveOverlaps", () => {
  const sizes = new Map([["a", { width: 300, height: 200 }], ["b", { width: 300, height: 100 }], ["c", { width: 300, height: 100 }]])

  it("baja el bloque que quedó encima de otro, y en cadena los que siguen", () => {
    const blocks = [{ id: "a", x: 0, y: 0, text: "" }, { id: "b", x: 100, y: 150, text: "" }, { id: "c", x: 0, y: 260, text: "" }]
    const [a, b, c] = resolveOverlaps(blocks, sizes)
    expect(a.y).toBe(0)
    expect(b.y).toBe(200 + BLOCK_GAP)
    expect(c.y).toBe(b.y + 100 + BLOCK_GAP)
  })

  it("no mueve bloques que están lado a lado", () => {
    const blocks = [{ id: "a", x: 0, y: 0, text: "" }, { id: "b", x: 400, y: 20, text: "" }]
    expect(resolveOverlaps(blocks, sizes)).toEqual(blocks)
  })
})

describe("moveInOrder", () => {
  const sizes = new Map([["a", { width: 300, height: 100 }], ["b", { width: 300, height: 150 }]])
  const blocks = [{ id: "a", x: 24, y: 24, text: "A" }, { id: "b", x: 24, y: 148, text: "B" }]

  it("sube un bloque un lugar", () => {
    expect(blocksToLyrics(moveInOrder(blocks, "b", -1, sizes))).toBe("B\n\nA")
  })

  it("no hace nada si ya es el primero o el último", () => {
    expect(moveInOrder(blocks, "a", -1, sizes)).toBe(blocks)
    expect(moveInOrder(blocks, "b", 1, sizes)).toBe(blocks)
  })
})

describe("stackInOrder", () => {
  it("pone los bloques en una columna sin cambiar su orden", () => {
    const sizes = new Map([["a", { width: 300, height: 100 }], ["b", { width: 300, height: 80 }]])
    const blocks = [{ id: "a", x: 500, y: 300, text: "A" }, { id: "b", x: 0, y: 10, text: "B" }]
    expect(stackInOrder(blocks, sizes)).toEqual([
      { id: "a", x: 24, y: 24 + 80 + BLOCK_GAP, text: "A" },
      { id: "b", x: 24, y: 24, text: "B" }
    ])
  })
})
