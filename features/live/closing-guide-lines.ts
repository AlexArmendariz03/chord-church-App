// Cómo se lee el texto de oración y anuncios. Una línea por renglón:
// - "Vamos a orar por:" o "Vamos a orar…" (termina en ":" o "…") es un título
// - "-Mi pastor" o "• Mi pastor" es un sub-punto del punto de arriba
// - "“Si tiene una petición…”" (entre comillas) es una nota al final
// - cualquier otra es un punto; si ya trae número ("1)", "2.", "3-") se le quita, la app numera sola
export type GuideLine =
  | { type: "heading"; text: string }
  | { type: "item"; text: string; subItems: string[] }
  | { type: "quote"; text: string }

const HEADING_END = /(:|…|\.\.\.)$/
const SUB_ITEM_START = /^[-–—•*]\s*/
const QUOTE_START = /^["“«]/
const NUMBER_START = /^\d{1,3}\s*[).\-–]\s*/

export const toGuideLines = (text?: string | null): GuideLine[] => {
  const lines: GuideLine[] = []
  for (const raw of (text ?? "").split("\n")) {
    const line = raw.trim()
    if (!line) continue

    const last = lines.at(-1)
    if (SUB_ITEM_START.test(line)) {
      const subItem = line.replace(SUB_ITEM_START, "")
      if (!subItem) continue
      // Un sub-punto sin punto arriba se muestra como punto
      if (last?.type === "item") last.subItems.push(subItem)
      else lines.push({ type: "item", text: subItem, subItems: [] })
    } else if (QUOTE_START.test(line)) {
      lines.push({ type: "quote", text: line })
    } else if (HEADING_END.test(line) && !NUMBER_START.test(line)) {
      lines.push({ type: "heading", text: line })
    } else {
      lines.push({ type: "item", text: line.replace(NUMBER_START, "") || line, subItems: [] })
    }
  }
  return lines
}
