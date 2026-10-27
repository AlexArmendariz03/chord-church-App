import { describe, expect, it } from "vitest"
import { parseSongBody } from "./song-input"

const VALID = { name: "  Cuan grande es Él ", key: "G", category: "adoracion", lyrics: "\n\n  G\nCuan grande  \n\n" }

describe("parseSongBody", () => {
  it("limpia los textos y conserva la sangría de la primera línea", () => {
    expect(parseSongBody(VALID)).toEqual({
      data: { name: "Cuan grande es Él", key: "G", category: "adoracion", lyrics: "  G\nCuan grande" }
    })
  })

  it("solo incluye etiquetas y payload si vienen", () => {
    const parsed = parseSongBody({ ...VALID, isYouth: true, isService: false, payload: { blocks: [] } })
    expect(parsed).toMatchObject({ data: { isYouth: true, isService: false, payload: { blocks: [] } } })
    expect(parseSongBody({ ...VALID, isYouth: "sí" })).not.toHaveProperty("data.isYouth")
  })

  it("pide los campos obligatorios", () => {
    expect(parseSongBody({ ...VALID, name: "   " }).error).toBeDefined()
    expect(parseSongBody({ ...VALID, key: undefined }).error).toBeDefined()
    expect(parseSongBody({ ...VALID, category: "ofrenda" }).error).toBeDefined()
    expect(parseSongBody({ ...VALID, lyrics: 42 }).error).toBeDefined()
  })

  it("rechaza textos y payload demasiado grandes", () => {
    expect(parseSongBody({ ...VALID, name: "a".repeat(201) }).error).toBeDefined()
    expect(parseSongBody({ ...VALID, lyrics: "a".repeat(20001) }).error).toBeDefined()
    expect(parseSongBody({ ...VALID, payload: "a".repeat(100001) }).error).toBe("La alabanza es demasiado grande")
  })
})
