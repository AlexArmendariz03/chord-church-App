import { describe, expect, it } from "vitest"
import { autoFontSize, autoLayout, fitWidthSize, layoutLyrics, wrappingSizes, wrapsAt, type StanzaMetrics } from "./paginate"

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

  it("en una pantalla angosta parte los renglones en lugar de bajar del tamaño legible", () => {
    // A 20 el renglón mide 400 y la caja 300: se parte entre palabras y la letra se queda en 20
    const metrics = [{ ...stanza(2, 2000), wordWidth: 400 }]
    expect(autoFontSize(metrics, { width: 300, height: 1000 }, options)).toBe(20)
    expect(wrapsAt(metrics, { width: 300, height: 1000 }, 20)).toBe(true)
  })

  it("la palabra más ancha limita el tamaño cuando los renglones se parten", () => {
    expect(autoFontSize([{ ...stanza(2, 2000), wordWidth: 2000 }], { width: 300, height: 1000 }, options)).toBe(15)
  })

  it("sin medidas de palabras se comporta como antes", () => {
    expect(autoFontSize([stanza(1, 3000)], { width: 300, height: 1000 }, options)).toBe(10)
  })

  it("con scrollWhenLong, si no cabe en una página, va completa y se desliza", () => {
    const narrow = [{ ...stanza(30, 2000), wordWidth: 400 }]
    const wrapped = () => [{ unitHeights: Array(60).fill(100), width: 300 }]
    const tablet = { ...options, compactSize: 16, scrollWhenLong: true }
    expect(autoLayout(narrow, { width: 300, height: 400 }, tablet, wrapped)).toEqual({ fontSize: 20, scrolling: true })
    // Si cabe en una página, no se desliza
    expect(autoLayout([stanza(2, 500)], { width: 300, height: 400 }, tablet).scrolling).toBe(false)
    // Sin scrollWhenLong (escritorio) se pagina
    expect(autoLayout([stanza(30, 500)], { width: 1000, height: 400 }, options).scrolling).toBe(false)
  })

  it("sin wrap (escritorio) achica la letra hasta que quepa el renglón más largo, como antes", () => {
    const metrics = [{ ...stanza(2, 2000), wordWidth: 400 }]
    expect(autoFontSize(metrics, { width: 300, height: 1000 }, { ...options, wrap: false })).toBe(15)
    expect(wrappingSizes(metrics, { width: 300, height: 1000 }, { ...options, wrap: false })).toEqual([])
  })

  it("en el teléfono la letra cabe a lo ancho, entre el mínimo y la base", () => {
    // Renglón de 2000 a REFERENCE_SIZE en una caja de 340: cabe hasta 17
    expect(fitWidthSize([stanza(1, 2000)], { width: 340, height: 500 }, { base: 20, min: 15 })).toBe(17)
    expect(fitWidthSize([stanza(1, 1000)], { width: 340, height: 500 }, { base: 18, min: 15 })).toBe(18)
    // No cabe ni a 15: se queda en 15 y los renglones se parten
    expect(fitWidthSize([{ ...stanza(1, 4000), wordWidth: 500 }], { width: 340, height: 500 }, { base: 18, min: 15 })).toBe(15)
  })

  it("con compactSize baja la letra para que quepa en una sola página", () => {
    // 10 unidades de 100: a 20 miden 200 y la caja tiene 180; a 18 caben justas
    const metrics = [stanza(10, 100)]
    const upTo20 = { ...options, maxSize: 20 }
    expect(autoFontSize(metrics, { width: 1000, height: 180 }, upTo20)).toBe(20)
    expect(layoutLyrics(metrics, { width: 1000, height: 180 }, 20, 1).pages).toHaveLength(2)
    expect(autoFontSize(metrics, { width: 1000, height: 180 }, { ...upTo20, compactSize: 16 })).toBe(18)
  })

  it("una alabanza larga usa varias páginas al tamaño más grande que pueda", () => {
    const size = autoFontSize([stanza(40, 100)], { width: 1000, height: 200 }, { ...options, compactSize: 16 })
    expect(size).toBe(20)
  })

  it("con renglones partidos usa las alturas medidas a cada tamaño", () => {
    const metrics = [{ ...stanza(4, 2000), wordWidth: 400 }]
    const box = { width: 300, height: 200 }
    const compact = { ...options, compactSize: 16 }
    expect(wrappingSizes(metrics, box, compact)).toEqual([20, 19, 18, 17, 16])
    // Partidos, cada renglón ocupa dos: 8 unidades. A 16 miden 128 y caben; a 17 o más, no
    const wrapped = (size: number) => (size >= 16 ? [{ unitHeights: Array(8).fill(100 * (size >= 17 ? 1.5 : 1)), width: 300 * 100 / size }] : undefined)
    expect(autoFontSize(metrics, box, compact, wrapped)).toBe(16)
  })
})
