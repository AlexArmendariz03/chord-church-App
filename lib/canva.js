export const tonalidades = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"
]

export const buildCanvaEmbedLink = link => {
  const normalized = link.trim()
  if (!normalized) return ""
  if (normalized.includes("/view?embed")) return normalized

  const withoutQuery = normalized.split("?")[0]

  if (withoutQuery.endsWith("/view")) {
    return `${withoutQuery}?embed`
  }

  if (withoutQuery.includes("/edit")) {
    return `${withoutQuery.replace("/edit", "/view")}?embed`
  }

  return normalized
}
