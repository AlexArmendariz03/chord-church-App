// Imports songs from a JSON file (array). Shows what it would do; pass --apply to save.
// Usage: npm run import-songs -- <archivo.json> [--apply]
//
// Each item: { cancion, tono, letra_acordes, categoria: "jubilo" | "adoracion" }
// (also accepts name / key / lyrics / category, and seccion: "Júbilo" | "Adoración").
// Songs whose name already exists, or that come without lyrics, are skipped.
import fs from "node:fs"
import { PrismaClient } from "@prisma/client"

const SECTION_HEADER = /^\s*(intro|verso|estrofa|pre-?coro|coro|puente|interludio|instrumental|final|outro|tag)\b/i

// Scraped chord sheets put a blank line after every chord+lyric pair. Drop those, keeping one
// blank line only before section headers and where the source had 2+ blank lines (real breaks).
// Leading spaces are preserved: they align each chord over its syllable.
const normalizeLyrics = text => {
  const lines = text.replace(/\r\n/g, "\n").split("\n").map(line => line.trimEnd())
  const output = []
  let blankRun = 0

  for (const line of lines) {
    if (!line) {
      blankRun++
      continue
    }
    const startsSection = blankRun >= 2 || SECTION_HEADER.test(line)
    if (output.length && startsSection && output.at(-1) !== "") output.push("")
    output.push(line)
    blankRun = 0
  }

  return output.join("\n")
}

const normalizeName = name => name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()

const [file, ...flags] = process.argv.slice(2)
const apply = flags.includes("--apply")

if (!file) {
  console.error("Uso: npm run import-songs -- <archivo.json> [--apply]")
  process.exit(1)
}

const items = JSON.parse(fs.readFileSync(file, "utf8"))
if (!Array.isArray(items)) {
  console.error("El archivo debe contener un arreglo de canciones")
  process.exit(1)
}

const songs = items.map((item, index) => {
  const song = {
    name: String(item.cancion ?? item.name ?? "").trim(),
    key: String(item.tono ?? item.key ?? "").trim(),
    category: normalizeName(String(item.categoria ?? item.category ?? item.seccion ?? "")),
    lyrics: normalizeLyrics(String(item.letra_acordes ?? item.lyrics ?? ""))
  }
  const problems = [
    !song.name && "sin nombre",
    !song.key && "sin tono",
    !["jubilo", "adoracion"].includes(song.category) && "categoría debe ser jubilo o adoracion"
  ].filter(Boolean)
  if (problems.length) {
    console.error(`Canción #${index + 1} (${song.name || "?"}): ${problems.join(", ")}`)
    process.exit(1)
  }
  return song
})

// The scraper sometimes misses a sheet; skip it instead of failing the whole batch
const withoutLyrics = songs.filter(song => !song.lyrics)
const importable = songs.filter(song => song.lyrics)

const prisma = new PrismaClient()

try {
  const existing = new Set((await prisma.song.findMany({ select: { name: true } })).map(song => normalizeName(song.name)))
  const toCreate = importable.filter(song => !existing.has(normalizeName(song.name)))

  for (const song of withoutLyrics) console.log(`- ${song.name} | sin letra, se omite`)
  for (const song of importable) {
    const status = toCreate.includes(song) ? "nueva" : "ya existe, se omite"
    console.log(`- ${song.name} | ${song.category} | tono ${song.key} | ${song.lyrics.split("\n").length} líneas | ${status}`)
  }

  if (!apply) {
    console.log("\nVista previa: no se guardó nada. Agrega --apply para importar.")
  } else if (toCreate.length) {
    const { count } = await prisma.song.createMany({ data: toCreate })
    console.log(`\nImportadas ${count} alabanzas.`)
  } else {
    console.log("\nNada que importar.")
  }
} finally {
  await prisma.$disconnect()
}
