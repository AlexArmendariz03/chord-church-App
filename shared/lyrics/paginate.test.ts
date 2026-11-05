import { describe, expect, it } from "vitest"
import { autoFontSize, layoutLyrics, type StanzaMetrics } from "./paginate"

// Medidas a REFERENCE_SIZE (100): cada unidad mide 100 de alto
const stanza = (units: number, width = 500): StanzaMetrics => ({ unitHeights: Array(units).fill(100), width })

describe("layoutLyrics", () => {
  it("todo cabe en una columna", () => {
    const layout = layoutLyrics([stanza(2), stanza(2)], { width: 500, height: 1000 }, 100, 1)
    expect(layout.pages).toHaveLength(1)
    expect(layout.pages[0]).toHaveLength(1)
    expect(layout.overflows).toBe(false)
  })

  it("no corta una estrofa si un lado se queda con una sola línea", () => {
    // Caben 3 de 4 unidades: partir dejaría una sola abajo, así que la estrofa pasa completa a la otra columna
    const layout = layoutLyrics([stanza(1), stanza(4)], { width: 500, height: 490 }, 100, 1)
    expect(layout.pages[0][0]).toEqual([{ stanza: 0, from: 0, to: 1 }])
    expect(layout.pages[1][0]).toEqual([{ stanza: 1, from: 0, to: 4 }])
  })

  it("parte una estrofa más alta que la columna", () => {
    const layout = layoutLyrics([stanza(6)], { width: 500, height: 300 }, 100, 1)
    expect(layout.pages.map(page => page[0][0])).toEqual([
      { stanza: 0, from: 0, to: 3 },
      { stanza: 0, from: 3, to: 6 }
    ])
  })

  it("pone varias columnas por página si caben a lo ancho", () => {
    const layout = layoutLyrics([stanza(3), stanza(3)], { width: 1300, height: 300 }, 100, 2)
    expect(layout.columnsPerPage).toBe(2)
    expect(layout.pages).toHaveLength(1)
  })

  it("avisa cuando una sola unidad no cabe", () => {
    expect(layoutLyrics([stanza(1)], { width: 500, height: 50 }, 100, 1).overflows).toBe(true)
  })
})

describe("autoFontSize", () => {
  const options = { minSize: 10, maxSize: 60, readableSize: 20, maxColumns: 1 }

  it("elige el tamaño más grande que cabe en una página", () => {
    const size = autoFontSize([stanza(4, 500)], { width: 1000, height: 200 }, options)
    expect(size).toBe(50)
    expect(layoutLyrics([stanza(4, 500)], { width: 1000, height: 200 }, size, 1).pages).toHaveLength(1)
  })

  it("el ancho de la línea más larga limita el tamaño", () => {
    expect(autoFontSize([stanza(1, 1000)], { width: 300, height: 1000 }, options)).toBe(30)
  })

  it("prefiere más páginas antes que bajar del tamaño legible", () => {
    const size = autoFontSize([stanza(40, 100)], { width: 1000, height: 200 }, options)
    expect(size).toBeGreaterThanOrEqual(options.readableSize)
  })

  it("sin espacio devuelve el tamaño legible", () => {
    expect(autoFontSize([], { width: 0, height: 0 }, options)).toBe(20)
  })
})
