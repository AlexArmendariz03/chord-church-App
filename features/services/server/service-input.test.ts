import { beforeEach, describe, expect, it, vi } from "vitest"
import { parseServiceBody, type ServiceBody } from "./service-input"

// Las categorías de las alabanzas salen de la base: aquí se simulan
const CATEGORIES: Record<string, "jubilo" | "adoracion"> = { j1: "jubilo", j2: "jubilo", a1: "adoracion", a2: "adoracion" }

vi.mock("@/shared/server/prisma", () => ({
  prisma: {
    song: {
      findMany: vi.fn(async ({ where }: { where: { id: { in: string[] } } }) =>
        where.id.in.filter(id => CATEGORIES[id]).map(id => ({ id, category: CATEGORIES[id] })))
    }
  }
}))

// Martes por la noche: un servicio normal
const SERVICE: ServiceBody = {
  title: "  Servicio de jóvenes ",
  eventDate: "2026-10-28T01:00:00Z",
  jubiloSongIds: ["j1"],
  adoracionSongIds: ["a1"],
  prayerGuide: "  Por la familia ",
  announcements: "   "
}

describe("parseServiceBody", () => {
  beforeEach(() => vi.clearAllMocks())

  it("ordena júbilo, adoración y ofrenda y limpia los textos", async () => {
    const parsed = await parseServiceBody({ ...SERVICE, jubiloSongIds: ["j1"], offeringSongId: "j2" })
    expect(parsed).toEqual({
      data: {
        title: "Servicio de jóvenes",
        eventDate: new Date("2026-10-28T01:00:00Z"),
        prayerGuide: "Por la familia",
        announcements: null,
        songs: [
          { songId: "j1", category: "jubilo", isOffering: false, position: 1 },
          { songId: "a1", category: "adoracion", isOffering: false, position: 2 },
          { songId: "j2", category: "jubilo", isOffering: true, position: 3 }
        ]
      }
    })
  })

  it("pide título y una fecha válida", async () => {
    expect((await parseServiceBody({ ...SERVICE, title: " " })).error).toBeDefined()
    expect((await parseServiceBody({ ...SERVICE, eventDate: "mañana" })).error).toBeDefined()
  })

  it("un servicio normal lleva al menos una de júbilo y una de adoración", async () => {
    expect((await parseServiceBody({ ...SERVICE, jubiloSongIds: [] })).error).toMatch(/al menos 1/)
  })

  it("no deja repetir alabanzas", async () => {
    expect((await parseServiceBody({ ...SERVICE, offeringSongId: "j1" })).error).toBe("No repitas canciones en el servicio")
  })

  it("revisa que cada alabanza sea del tipo correcto", async () => {
    expect((await parseServiceBody({ ...SERVICE, jubiloSongIds: ["a2"] })).error).toMatch(/no coincide/)
    expect((await parseServiceBody({ ...SERVICE, offeringSongId: "a2" })).error).toMatch(/ofrenda debe ser de júbilo/)
    expect((await parseServiceBody({ ...SERVICE, jubiloSongIds: ["no-existe"] })).error).toMatch(/no coincide/)
  })

  it("un estudio lleva solo una de adoración y sin guía", async () => {
    const study = { ...SERVICE, title: "Estudio bíblico", jubiloSongIds: [], adoracionSongIds: ["a1"] }
    const parsed = await parseServiceBody(study)
    expect(parsed).toMatchObject({ data: { prayerGuide: null, announcements: null, songs: [{ songId: "a1", position: 1 }] } })
    expect((await parseServiceBody({ ...study, jubiloSongIds: ["j1"] })).error).toMatch(/solo 1 canción/)
  })

  it("rechaza listas que no son de ids", async () => {
    expect((await parseServiceBody({ ...SERVICE, jubiloSongIds: "j1" as unknown as string[] })).error).toBe("Selección de canciones inválida")
  })
})
