import { classifyLine } from "@/features/live/client/lyrics/parse-lyrics"
import { trimLyrics } from "@/shared/utils/lyrics"

// La hoja del editor: cada sección de la alabanza es un bloque que se coloca libremente.
// La letra que se guarda (y la que se ve en vivo) sale de los bloques en el orden en que
// quedan en la hoja, de arriba hacia abajo y, en un mismo renglón, de izquierda a derecha.

export type SheetBlock = {
  id: string
  x: number
  y: number
  text: string
}

// Lo que se guarda en Song.payload para volver a abrir los bloques donde se dejaron
export type SheetPayload = {
  layout: "hoja"
  blocks: SheetBlock[]
}

// Medidas aproximadas de un bloque, para apilarlos sin medirlos en pantalla
const LINE_HEIGHT = 27.2
const BLOCK_CHROME = 64
export const BLOCK_GAP = 24
// Bloques cuyo borde de arriba está a menos de esto cuentan como del mismo renglón
const ROW_TOLERANCE = 40

export const createId = () => Math.random().toString(36).slice(2, 10)

// Corta la letra en bloques: un renglón vacío o el nombre de una sección empiezan uno nuevo
export const splitIntoBlocks = (lyrics: string): string[] => {
  const blocks: string[][] = []
  let current: string[] = []
  const close = () => {
    if (current.length) blocks.push(current)
    current = []
  }
  for (const line of lyrics.replace(/\r\n/g, "\n").split("\n")) {
    const kind = classifyLine(line)
    if (kind.type === "blank") close()
    else {
      if (kind.type === "section") close()
      current.push(line.trimEnd())
    }
  }
  close()
  return blocks.map(lines => lines.join("\n"))
}

// Un bloque mide al menos tres renglones de alto aunque tenga menos
const estimatedHeight = (text: string) => Math.max(3, text.split("\n").length) * LINE_HEIGHT + BLOCK_CHROME

// Pone los bloques uno debajo del otro, en el orden en que vienen
export const stackBlocks = (texts: string[], start = { x: 24, y: 24 }): SheetBlock[] => {
  let y = start.y
  return texts.map(text => {
    const block = { id: createId(), x: start.x, y, text }
    y += estimatedHeight(text) + BLOCK_GAP
    return block
  })
}

// Debajo del último bloque: donde cae uno nuevo
export const nextFreeY = (blocks: SheetBlock[]) =>
  blocks.reduce((bottom, block) => Math.max(bottom, block.y + estimatedHeight(block.text) + BLOCK_GAP), 24)

export const sortBlocks = (blocks: SheetBlock[]) =>
  [...blocks].sort((a, b) => Math.floor(a.y / ROW_TOLERANCE) - Math.floor(b.y / ROW_TOLERANCE) || a.x - b.x || a.y - b.y)

export const blocksToLyrics = (blocks: SheetBlock[]) =>
  sortBlocks(blocks)
    .map(block => trimLyrics(block.text))
    .filter(text => text.trim())
    .join("\n\n")

const isSheetPayload = (payload: unknown): payload is SheetPayload => {
  const candidate = payload as Partial<SheetPayload> | null
  return candidate?.layout === "hoja" && Array.isArray(candidate.blocks)
}

// Abre los bloques guardados si siguen diciendo lo mismo que la letra; si no (alabanza importada,
// hecha con el editor anterior o cambiada por otro lado), arma los bloques a partir de la letra
export const loadBlocks = (lyrics: string, payload: unknown): SheetBlock[] => {
  if (isSheetPayload(payload) && blocksToLyrics(payload.blocks) === trimLyrics(lyrics)) {
    return payload.blocks.map(({ id, x, y, text }) => ({ id, x, y, text }))
  }
  return stackBlocks(splitIntoBlocks(lyrics))
}

// Mueve el acorde que empieza en la columna `from` hasta la columna `to` de su renglón.
// Devuelve null si chocaría con otro acorde (siempre queda al menos un espacio entre dos).
export const moveChord = (line: string, from: number, to: number): string | null => {
  const token = line.slice(from).match(/^\S+/)?.[0]
  if (!token || to < 0) return null
  const chars = line.padEnd(Math.max(line.length, to + token.length)).split("")
  chars.fill(" ", from, from + token.length)
  for (let column = to - 1; column <= to + token.length; column++) {
    if (column >= 0 && column < chars.length && chars[column] !== " ") return null
  }
  chars.splice(to, token.length, ...token)
  return chars.join("").trimEnd()
}

// Los acordes de un renglón de acordes, con la columna donde empieza cada uno
export const chordTokens = (line: string) =>
  [...line.matchAll(/\S+/g)].map(match => ({ column: match.index ?? 0, chord: match[0] }))

export type BlockSize = { width: number; height: number }

// Tamaño de respaldo cuando un bloque aún no se ha medido en pantalla
const DEFAULT_WIDTH = 320

const sizeOf = (block: SheetBlock, sizes: Map<string, BlockSize>) =>
  sizes.get(block.id) ?? { width: DEFAULT_WIDTH, height: estimatedHeight(block.text) }

const overlaps = (a: SheetBlock, aSize: BlockSize, b: SheetBlock, bSize: BlockSize) =>
  a.x < b.x + bSize.width && b.x < a.x + aSize.width && a.y < b.y + bSize.height + BLOCK_GAP && b.y < a.y + aSize.height + BLOCK_GAP

// Que ningún bloque quede encima de otro: de arriba hacia abajo, cada bloque que choca con uno
// ya acomodado baja justo debajo de él. Nada sube ni se mueve de lado, así el orden se respeta.
export const resolveOverlaps = (blocks: SheetBlock[], sizes: Map<string, BlockSize>): SheetBlock[] => {
  const placed: SheetBlock[] = []
  for (const block of [...blocks].sort((a, b) => a.y - b.y || a.x - b.x)) {
    const size = sizeOf(block, sizes)
    let current = block
    let blocker = placed.find(other => overlaps(current, size, other, sizeOf(other, sizes)))
    while (blocker) {
      current = { ...current, y: blocker.y + sizeOf(blocker, sizes).height + BLOCK_GAP }
      blocker = placed.find(other => overlaps(current, size, other, sizeOf(other, sizes)))
    }
    placed.push(current)
  }
  const byId = new Map(placed.map(block => [block.id, block]))
  return blocks.map(block => byId.get(block.id) ?? block)
}

// Sube (-1) o baja (1) un bloque un lugar en el orden: cambia de sitio con su vecino
export const moveInOrder = (blocks: SheetBlock[], id: string, direction: -1 | 1, sizes: Map<string, BlockSize>) => {
  const sorted = sortBlocks(blocks)
  const index = sorted.findIndex(block => block.id === id)
  const neighbor = sorted[index + direction]
  if (index < 0 || !neighbor) return blocks
  const current = sorted[index]
  const [upper, lower] = direction === -1 ? [current, neighbor] : [neighbor, current]
  // El que sube toma el lugar de arriba; el otro queda justo debajo de él
  const top = Math.min(current.y, neighbor.y)
  const swapped = new Map([
    [upper.id, { ...upper, x: Math.min(current.x, neighbor.x), y: top }],
    [lower.id, { ...lower, x: Math.min(current.x, neighbor.x), y: top + sizeOf(upper, sizes).height + BLOCK_GAP }]
  ])
  return resolveOverlaps(blocks.map(block => swapped.get(block.id) ?? block), sizes)
}

// "Acomodar": todos en una columna, en el orden en que ya estaban, cada uno justo debajo del anterior
export const stackInOrder = (blocks: SheetBlock[], sizes: Map<string, BlockSize>, start = { x: 24, y: 24 }) => {
  let y = start.y
  const stacked = new Map(sortBlocks(blocks).map(block => {
    const placed = { ...block, x: start.x, y }
    y += sizeOf(block, sizes).height + BLOCK_GAP
    return [block.id, placed]
  }))
  return blocks.map(block => stacked.get(block.id) ?? block)
}
