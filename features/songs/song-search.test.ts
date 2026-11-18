import { describe, expect, it } from "vitest"
import { normalizeForSearch, searchSongs } from "./song-search"

const SONGS = [
  { name: "Cadenas romper" },
  { name: "Santo por siempre" },
  { name: "Hosanna (Levantamos un clamor)" },
  { name: "Señor tu nombre exaltaré" },
  { name: "Hosanna" }
]
const names = (query: string) => searchSongs(SONGS, query).map(song => song.name)

describe("normalizeForSearch", () => {
  it("ignora acentos, mayúsculas y signos", () => {
    expect(normalizeForSearch("¡Señor, AQUÍ estás!")).toBe("senor aqui estas")
  })
})

describe("searchSongs", () => {
  it("sin nada que buscar no devuelve nada", () => {
    expect(searchSongs(SONGS, "  ¿? ")).toEqual([])
  })

  it("pone primero las que empiezan con lo buscado, luego las que lo tienen en el nombre", () => {
    expect(names("hosanna")).toEqual(["Hosanna", "Hosanna (Levantamos un clamor)"])
    expect(names("clamor")).toEqual(["Hosanna (Levantamos un clamor)"])
  })

  it("no importan acentos ni el orden de las palabras", () => {
    expect(names("senor")).toEqual(["Señor tu nombre exaltaré"])
    expect(names("siempre santo")).toEqual(["Santo por siempre"])
  })

  it("no busca en la letra", () => {
    expect(names("cristo")).toEqual([])
  })
})
