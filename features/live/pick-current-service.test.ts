import { describe, expect, it } from "vitest"
import { pickCurrentService } from "./pick-current-service"

const NOW = new Date("2026-11-01T17:00:00Z").getTime()
const services = [
  { id: "temprano", eventDate: "2026-11-01T14:00:00Z" },
  { id: "en-curso", eventDate: "2026-11-01T16:30:00Z" },
  { id: "siguiente", eventDate: "2026-11-01T19:00:00Z" }
]

describe("pickCurrentService", () => {
  it("el que eligió el usuario gana", () => {
    expect(pickCurrentService(services, "siguiente", NOW)?.id).toBe("siguiente")
  })

  it("si no, el que empezó más recientemente", () => {
    expect(pickCurrentService(services, null, NOW)?.id).toBe("en-curso")
    expect(pickCurrentService(services, "no-existe", NOW)?.id).toBe("en-curso")
  })

  it("si ninguno ha empezado, el próximo", () => {
    expect(pickCurrentService(services.slice(2), null, NOW)?.id).toBe("siguiente")
  })

  it("sin servicios no hay ninguno", () => {
    expect(pickCurrentService([], null, NOW)).toBeUndefined()
  })
})
