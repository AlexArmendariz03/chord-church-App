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

export type StanzaMetrics = { unitHeights: number[]; width: number }

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
  maxColumns: number
}

// Largest font size that fits the song on as few pages as possible without going below
// `readableSize`. Returns the chosen size; use `layoutLyrics` to get the pages at any size.
export const autoFontSize = (metrics: StanzaMetrics[], box: Box, options: AutoLayoutOptions) => {
  if (!metrics.length || box.width <= 0 || box.height <= 0) return options.readableSize

  const widest = Math.max(...metrics.map(m => m.width), 1)
  // Lines never wrap (it would break chord alignment), so the widest line caps the size
  const widthLimit = Math.floor((box.width * REFERENCE_SIZE) / widest)
  const maxSize = Math.max(options.minSize, Math.min(options.maxSize, widthLimit))
  const target = Math.min(options.readableSize, maxSize)

  const fits = (size: number, pageCount: number) => {
    const layout = layoutAt(metrics, box, size, options.maxColumns)
    return !layout.overflows && layout.pages.length <= pageCount
  }

  for (let pageCount = 1; pageCount <= 12; pageCount++) {
    for (let size = maxSize; size >= target; size--) {
      if (fits(size, pageCount)) return size
    }
  }
  return target
}

export const layoutLyrics = (metrics: StanzaMetrics[], box: Box, fontSize: number, maxColumns: number) =>
  layoutAt(metrics, box, fontSize, maxColumns)
