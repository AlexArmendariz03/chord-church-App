import { describe, expect, it } from "vitest"
import { guideAfterIndexOf, guideStepsOf, nextPosition, prevPosition, tapZone, type LivePosition, type StepsContext } from "./service-steps"

// Cuatro alabanzas: 0 y 1 de júbilo, 2 de adoración y 3 la ofrenda. La guía va después de la 2.
const CONTEXT: StepsContext = { songCount: 4, pageCount: 1, guideAfterIndex: 2, guideSteps: ["prayer", "announcements"] }

const at = (songIndex: number, guideStep: number | null = null, pageIndex = 0): LivePosition => ({ songIndex, pageIndex, guideStep })

describe("guideStepsOf", () => {
  it("la oración va primero y los anuncios después", () => {
    expect(guideStepsOf({ prayerGuide: "Por la iglesia", announcements: "Ensayo el sábado" })).toEqual(["prayer", "announcements"])
  })

  it("sin anuncios no hay paso de anuncios, y sin oración tampoco paso de oración", () => {
    expect(guideStepsOf({ prayerGuide: "Por la iglesia", announcements: "   " })).toEqual(["prayer"])
    expect(guideStepsOf({ prayerGuide: null, announcements: "Ensayo el sábado" })).toEqual(["announcements"])
  })

  it("sin servicio o sin textos no hay guía", () => {
    expect(guideStepsOf(null)).toEqual([])
    expect(guideStepsOf({ prayerGuide: "", announcements: undefined })).toEqual([])
  })
})

describe("guideAfterIndexOf", () => {
  it("la guía va antes de la ofrenda", () => {
    expect(guideAfterIndexOf([{ isOffering: false }, { isOffering: false }, { isOffering: true }], true)).toBe(1)
  })

  it("sin ofrenda va al final", () => {
    expect(guideAfterIndexOf([{ isOffering: false }, { isOffering: false }], true)).toBe(1)
  })

  it("sin guía o sin alabanzas no hay lugar para ella", () => {
    expect(guideAfterIndexOf([{ isOffering: false }], false)).toBe(-1)
    expect(guideAfterIndexOf([], true)).toBe(-1)
  })
})

describe("nextPosition", () => {
  it("pasa las páginas de la alabanza antes de cambiar de alabanza", () => {
    expect(nextPosition(at(0), { ...CONTEXT, pageCount: 2 })).toEqual(at(0, null, 1))
    expect(nextPosition(at(0, null, 1), { ...CONTEXT, pageCount: 2 })).toEqual(at(1))
  })

  it("al terminar la adoración abre la oración, luego los anuncios y luego la ofrenda", () => {
    expect(nextPosition(at(2), CONTEXT)).toEqual(at(2, 0))
    expect(nextPosition(at(2, 0), CONTEXT)).toEqual(at(2, 1))
    expect(nextPosition(at(2, 1), CONTEXT)).toEqual(at(3))
  })

  it("con un solo paso de guía va directo a la ofrenda", () => {
    expect(nextPosition(at(2, 0), { ...CONTEXT, guideSteps: ["prayer"] })).toEqual(at(3))
  })

  it("sin guía pasa de la adoración a la ofrenda", () => {
    expect(nextPosition(at(2), { ...CONTEXT, guideAfterIndex: -1, guideSteps: [] })).toEqual(at(3))
  })

  it("después del último paso, si la guía es lo último del servicio, no hay siguiente", () => {
    const context = { ...CONTEXT, guideAfterIndex: 3 }
    expect(nextPosition(at(3, 1), context)).toBeNull()
    expect(nextPosition(at(3), { ...CONTEXT, guideAfterIndex: -1, guideSteps: [] })).toBeNull()
  })
})

describe("prevPosition", () => {
  it("desde la ofrenda vuelve a los anuncios, luego a la oración y luego a la adoración", () => {
    expect(prevPosition(at(3), CONTEXT)).toEqual(at(2, 1))
    expect(prevPosition(at(2, 1), CONTEXT)).toEqual(at(2, 0))
    expect(prevPosition(at(2, 0), CONTEXT)).toEqual(at(2))
  })

  it("al salir de la guía hacia atrás vuelve a la página donde se quedó la alabanza", () => {
    expect(prevPosition(at(2, 0, 2), { ...CONTEXT, pageCount: 3 })).toEqual(at(2, null, 2))
  })

  it("dentro de una alabanza retrocede página por página", () => {
    expect(prevPosition(at(1, null, 1), { ...CONTEXT, pageCount: 2 })).toEqual(at(1))
    expect(prevPosition(at(1), CONTEXT)).toEqual(at(0))
  })

  it("en la primera página de la primera alabanza no hay anterior", () => {
    expect(prevPosition(at(0), CONTEXT)).toBeNull()
  })
})

describe("tapZone", () => {
  it("el lado izquierdo va atrás y el derecho adelante", () => {
    expect(tapZone(50, 1000)).toBe("prev")
    expect(tapZone(950, 1000)).toBe("next")
  })

  it("el centro muestra u oculta los controles", () => {
    expect(tapZone(500, 1000)).toBe("center")
    expect(tapZone(300, 1000)).toBe("center")
    expect(tapZone(700, 1000)).toBe("center")
  })

  it("sin ancho medido no cambia nada", () => {
    expect(tapZone(10, 0)).toBe("center")
  })
})
