import { describe, expect, it } from "vitest"
import { IN_PROGRESS_HOURS, isSingleWorshipEvent, pastServiceCutoff } from "./service-rules"

describe("isSingleWorshipEvent", () => {
  it("estudios y seminarios llevan una sola alabanza", () => {
    expect(isSingleWorshipEvent("Estudio bíblico")).toBe(true)
    expect(isSingleWorshipEvent("SEMINARIO de jóvenes")).toBe(true)
  })

  it("no confunde palabras parecidas", () => {
    expect(isSingleWorshipEvent("Estudiantes")).toBe(false)
    expect(isSingleWorshipEvent("Seminaristas")).toBe(false)
    expect(isSingleWorshipEvent("Servicio dominical")).toBe(false)
  })

  it("sábado y domingo a las 9:45 a. m., hora de la iglesia", () => {
    // Ciudad de México es UTC−6: 9:45 local son las 15:45 UTC
    expect(isSingleWorshipEvent("Reunión", "2026-10-31T15:45:00Z")).toBe(true)
    expect(isSingleWorshipEvent("Reunión", "2026-11-01T15:45:00Z")).toBe(true)
    // Viernes a la misma hora y domingo a otra hora
    expect(isSingleWorshipEvent("Reunión", "2026-10-30T15:45:00Z")).toBe(false)
    expect(isSingleWorshipEvent("Reunión", "2026-11-01T17:00:00Z")).toBe(false)
  })

  it("una fecha inválida o vacía no cuenta", () => {
    expect(isSingleWorshipEvent("Reunión", "no es fecha")).toBe(false)
    expect(isSingleWorshipEvent("Reunión", null)).toBe(false)
  })
})

describe("pastServiceCutoff", () => {
  it("un servicio pasa a anteriores 6 horas después de empezar", () => {
    const now = new Date("2026-10-27T18:00:00Z")
    expect(IN_PROGRESS_HOURS).toBe(6)
    expect(pastServiceCutoff(now).toISOString()).toBe("2026-10-27T12:00:00.000Z")
  })
})
