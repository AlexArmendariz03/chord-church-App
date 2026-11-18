// Buscador de Alabanzas: por el nombre, sin importar acentos, mayúsculas ni signos
// ("senor" encuentra "Señor")

export const normalizeForSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

// Primero las que empiezan con lo buscado, luego las que lo tienen en el nombre (o todas sus
// palabras, en cualquier orden)
export const searchSongs = <T extends { name: string }>(songs: T[], query: string): T[] => {
  const phrase = normalizeForSearch(query)
  if (!phrase) return []
  const words = phrase.split(" ")

  return songs
    .flatMap(song => {
      const name = normalizeForSearch(song.name)
      if (name.startsWith(phrase)) return [{ rank: 0, song }]
      if (name.includes(phrase) || words.every(word => name.includes(word))) return [{ rank: 1, song }]
      return []
    })
    .sort((a, b) => a.rank - b.rank || a.song.name.localeCompare(b.song.name, "es"))
    .map(({ song }) => song)
}

// Otra alabanza que ya se llama igual (sin contar acentos, mayúsculas ni signos), para avisar
// antes de guardar una repetida. excludeId: la que se está editando
export const findSameName = <T extends { id: string; name: string }>(songs: T[], name: string, excludeId: string | null) => {
  const target = normalizeForSearch(name)
  return target ? songs.find(song => song.id !== excludeId && normalizeForSearch(song.name) === target) : undefined
}
