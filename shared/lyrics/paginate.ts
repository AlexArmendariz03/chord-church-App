// Pure layout math for the lyrics viewer. Every unit (chord line + lyric line) is measured once
// at REFERENCE_SIZE with `white-space: pre` (no wrapping), so heights and widths scale linearly
// with font size. That lets us try every font size without touching the DOM again.

export const REFERENCE_SIZE = 100
// Vertical space between stanzas and horizontal space between columns, in em
export const STANZA_GAP_EM = 0.9
export const COLUMN_GAP_EM = 2
// A stanza only splits across columns if each side keeps at least this many units,
// so nobody reads a lone line at the bottom of a column
const MIN_UNITS_PER_SIDE = 2

// width: el renglón más ancho sin partir. wordWidth: lo más ancho que no se puede partir (una
// palabra con sus acordes); en una caja angosta, como un teléfono, los renglones se parten hasta ahí.
export type StanzaMetrics = { unitHeights: number[]; width: number; wordWidth?: number }

// A run of consecutive units of one stanza shown in a column
export type Fragment = { stanza: number; from: number; to: number }

export type PageLayout = {
  fontSize: number
  columnsPerPage: number
  // pages → columns → fragments
  pages: Fragment[][][]
  // A single unit taller than the box: the page scrolls instead of clipping it
  overflows: boolean
}

type Box = { width: number; height: number }

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

const layoutAt = (metrics: StanzaMetrics[], box: Box, fontSize: number, maxColumns: number): PageLayout => {
  const scale = fontSize / REFERENCE_SIZE
  const gap = STANZA_GAP_EM * fontSize
  const columnGap = COLUMN_GAP_EM * fontSize
  const columnWidth = Math.max(...metrics.map(m => m.width), 1) * scale
  const columnsPerPage = Math.max(1, Math.min(maxColumns, Math.floor((box.width + columnGap) / (columnWidth + columnGap))))

  const columns: Fragment[][] = []
  let column: Fragment[] = []
  let used = 0
  let overflows = false

  const newColumn = () => {
    if (column.length) columns.push(column)
    column = []
    used = 0
  }

  metrics.forEach((metric, stanza) => {
    const heights = metric.unitHeights.map(height => height * scale)
    if (heights.some(height => height > box.height)) overflows = true
    let from = 0

    while (from < heights.length) {
      const rest = heights.slice(from)
      const lead = column.length ? gap : 0
      const space = box.height - used - lead

      if (sum(rest) <= space) {
        column.push({ stanza, from, to: heights.length })
        used += lead + sum(rest)
        break
      }

      // How many of the remaining units fit in what's left of this column
      let fit = 0
      for (let height = 0; fit < rest.length && height + rest[fit] <= space; fit++) height += rest[fit]

      const tallerThanColumn = sum(rest) > box.height
      const splitKeepsBothSides = fit >= MIN_UNITS_PER_SIDE && rest.length - fit >= MIN_UNITS_PER_SIDE
      if (fit > 0 && (splitKeepsBothSides || tallerThanColumn)) {
        column.push({ stanza, from, to: from + fit })
        from += fit
      } else if (!column.length) {
        // Empty column and still nothing fits: place one unit and let it overflow
        column.push({ stanza, from, to: from + 1 })
        from += 1
      }
      newColumn()
    }
  })
  newColumn()

  const pages: Fragment[][][] = []
  for (let i = 0; i < columns.length; i += columnsPerPage) pages.push(columns.slice(i, i + columnsPerPage))

  return { fontSize, columnsPerPage, pages, overflows }
}

type AutoLayoutOptions = {
  minSize: number
  maxSize: number
  // Preferred minimum: paginate rather than shrink below this (unless the width forces it)
  readableSize: number
  // Lo más que baja la letra para que la alabanza quepa en una página en vez de partirse en
  // varias; sin él, readableSize
  compactSize?: number
  maxColumns: number
  // Partir los renglones largos entre palabras en vez de achicar la letra (por omisión, sí).
  // En escritorio no: ahí la letra se achica hasta que quepa el renglón más largo, como siempre.
  wrap?: boolean
  // Tableta: la alabanza que no cabe en una página va completa en una sola que se desliza
  scrollWhenLong?: boolean
}

// Alturas con los renglones partidos a un tamaño, si ya se midieron (ver LyricsPager)
type WrappedMetrics = (fontSize: number) => StanzaMetrics[] | undefined

const widthLimitOf = (metrics: StanzaMetrics[], box: Box) =>
  Math.floor((box.width * REFERENCE_SIZE) / Math.max(...metrics.map(m => m.width), 1))

const wordLimitOf = (metrics: StanzaMetrics[], box: Box) =>
  Math.floor((box.width * REFERENCE_SIZE) / Math.max(...metrics.map(m => m.wordWidth ?? m.width), 1))

// Del tamaño más grande al más chico que se prueban
const sizeRange = (metrics: StanzaMetrics[], box: Box, options: AutoLayoutOptions) => {
  const widthLimit = widthLimitOf(metrics, box)
  // Caja angosta: en vez de achicar la letra por debajo de lo legible, los renglones largos se
  // parten entre palabras. Así solo la palabra más ancha limita el tamaño.
  const upper = widthLimit >= options.readableSize || options.wrap === false
    ? Math.max(options.minSize, Math.min(options.maxSize, widthLimit))
    : Math.max(options.minSize, Math.min(options.readableSize, wordLimitOf(metrics, box)))
  const lower = Math.max(options.minSize, Math.min(upper, options.compactSize ?? options.readableSize))
  return { upper, lower }
}

// Tamaños a probar en los que los renglones se parten: el pager mide sus alturas a cada uno
export const wrappingSizes = (metrics: StanzaMetrics[], box: Box, options: AutoLayoutOptions) => {
  if (!metrics.length || box.width <= 0 || box.height <= 0 || options.wrap === false) return []
  const { upper, lower } = sizeRange(metrics, box, options)
  const sizes: number[] = []
  for (let size = upper; size >= lower; size--) if (wrapsAt(metrics, box, size)) sizes.push(size)
  return sizes
}

export type AutoLayout = {
  fontSize: number
  // La alabanza va completa en una sola página que se desliza hacia abajo, en vez de partirse
  // en "Página 1 de 2"
  scrolling: boolean
}

// Largest font size that fits the song on as few pages as possible: first one page, shrinking
// down to `compactSize` if needed; only a long song takes more pages (or scrolls, with
// `scrollWhenLong`). Use `layoutLyrics` to get the pages at the chosen size.
export const autoLayout = (metrics: StanzaMetrics[], box: Box, options: AutoLayoutOptions, wrappedAt?: WrappedMetrics): AutoLayout => {
  if (!metrics.length || box.width <= 0 || box.height <= 0) return { fontSize: options.readableSize, scrolling: false }

  const { upper, lower } = sizeRange(metrics, box, options)
  const readable = Math.min(options.readableSize, upper)

  const fits = (size: number, pageCount: number) => {
    const sized = options.wrap !== false && wrapsAt(metrics, box, size) ? wrappedAt?.(size) : metrics
    if (!sized) return false
    const layout = layoutAt(sized, box, size, options.maxColumns)
    return !layout.overflows && layout.pages.length <= pageCount
  }

  for (let pageCount = 1; pageCount <= 12; pageCount++) {
    if (pageCount === 2 && options.scrollWhenLong) return { fontSize: readable, scrolling: true }
    for (let size = upper; size >= lower; size--) {
      if (fits(size, pageCount)) return { fontSize: size, scrolling: false }
    }
  }
  return { fontSize: readable, scrolling: false }
}

export const autoFontSize = (metrics: StanzaMetrics[], box: Box, options: AutoLayoutOptions, wrappedAt?: WrappedMetrics) =>
  autoLayout(metrics, box, options, wrappedAt).fontSize

// Teléfono: la letra en `base` (crece con el ancho de la pantalla), o más chica para que quepa el
// renglón más largo sin partirse, hasta `min`. Solo si ni así cabe, los renglones se parten.
export const fitWidthSize = (metrics: StanzaMetrics[], box: Box, { base, min }: { base: number; min: number }) => {
  if (!metrics.length || box.width <= 0) return base
  const widthLimit = widthLimitOf(metrics, box)
  if (widthLimit >= min) return Math.min(base, widthLimit)
  // Una palabra más ancha que la pantalla (muchos acordes encima) baja un poco más
  return Math.max(12, Math.min(min, wordLimitOf(metrics, box)))
}

// Si a este tamaño el renglón más ancho no cabe en la caja, los renglones se parten
export const wrapsAt = (metrics: StanzaMetrics[], box: Box, fontSize: number) =>
  box.width > 0 && (Math.max(0, ...metrics.map(m => m.width)) * fontSize) / REFERENCE_SIZE > box.width

export const layoutLyrics = (metrics: StanzaMetrics[], box: Box, fontSize: number, maxColumns: number) =>
  layoutAt(metrics, box, fontSize, maxColumns)
