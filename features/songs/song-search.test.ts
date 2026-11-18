import { describe, expect, it } from "vitest"
import { findSameName, normalizeForSearch, searchSongs } from "./song-search"

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

describe("findSameName", () => {
  const songs = [{ id: "a", name: "Señor tu nombre exaltaré" }, { id: "b", name: "Hosanna" }]

  it("encuentra la que se llama igual aunque cambien acentos, mayúsculas o signos", () => {
    expect(findSameName(songs, "  senor, TU nombre exaltare ", null)).toBe(songs[0])
  })

  it("no cuenta la que se está editando ni nombres que solo se parecen", () => {
    expect(findSameName(songs, "Hosanna", "b")).toBeUndefined()
    expect(findSameName(songs, "Hosanna en las alturas", null)).toBeUndefined()
    expect(findSameName(songs, "  ", null)).toBeUndefined()
  })
})
