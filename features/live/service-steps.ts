// Los pasos de En curso: cada alabanza (con sus páginas) y, para el dirigente, la guía en dos
// pasos —primero la oración y después los anuncios— al terminar la adoración, antes de la ofrenda.

export type GuideStep = "prayer" | "announcements"

export const GUIDE_STEP_LABELS: Record<GuideStep, string> = { prayer: "Oración", announcements: "Anuncios" }

// Dónde va el servicio: la alabanza, su página y, si la guía está abierta, en qué paso de ella
export type LivePosition = { songIndex: number; pageIndex: number; guideStep: number | null }

export type StepsContext = {
  songCount: number
  // Páginas de la alabanza que está en pantalla
  pageCount: number
  // La guía sale después de esta alabanza; -1 si no hay guía
  guideAfterIndex: number
  guideSteps: GuideStep[]
}

// Solo los pasos que traen texto: sin anuncios no hay paso de anuncios
export const guideStepsOf = (service?: { prayerGuide?: string | null; announcements?: string | null } | null): GuideStep[] => [
  ...(service?.prayerGuide?.trim() ? ["prayer" as const] : []),
  ...(service?.announcements?.trim() ? ["announcements" as const] : [])
]

// La guía va al terminar la adoración: antes de la ofrenda o, si no hay ofrenda, al final
export const guideAfterIndexOf = (songs: { isOffering: boolean }[], hasGuide: boolean) => {
  if (!hasGuide || songs.length === 0) return -1
  const offeringIndex = songs.findIndex(song => song.isOffering)
  return offeringIndex > 0 ? offeringIndex - 1 : songs.length - 1
}

// "Siguiente": la página que sigue, luego cada paso de la guía y luego la alabanza que sigue.
// null cuando ya no hay nada después.
export const nextPosition = (position: LivePosition, context: StepsContext): LivePosition | null => {
  const { songIndex, pageIndex, guideStep } = position
  const lastGuideStep = context.guideSteps.length - 1
  if (guideStep !== null) {
    if (guideStep < lastGuideStep) return { songIndex, pageIndex, guideStep: guideStep + 1 }
    return songIndex + 1 < context.songCount ? { songIndex: songIndex + 1, pageIndex: 0, guideStep: null } : null
  }
  if (pageIndex < context.pageCount - 1) return { songIndex, pageIndex: pageIndex + 1, guideStep: null }
  if (songIndex === context.guideAfterIndex && lastGuideStep >= 0) return { songIndex, pageIndex, guideStep: 0 }
  return songIndex + 1 < context.songCount ? { songIndex: songIndex + 1, pageIndex: 0, guideStep: null } : null
}

// "Anterior": el mismo camino al revés. Al salir de la guía hacia atrás se vuelve a la página
// donde se quedó la alabanza; al volver desde la alabanza siguiente, se entra por el último paso.
export const prevPosition = (position: LivePosition, context: StepsContext): LivePosition | null => {
  const { songIndex, pageIndex, guideStep } = position
  if (guideStep !== null) {
    return guideStep > 0 ? { songIndex, pageIndex, guideStep: guideStep - 1 } : { songIndex, pageIndex, guideStep: null }
  }
  if (pageIndex > 0) return { songIndex, pageIndex: pageIndex - 1, guideStep: null }
  if (context.guideSteps.length > 0 && songIndex === context.guideAfterIndex + 1) {
    return { songIndex: context.guideAfterIndex, pageIndex: 0, guideStep: context.guideSteps.length - 1 }
  }
  return songIndex > 0 ? { songIndex: songIndex - 1, pageIndex: 0, guideStep: null } : null
}

// Dónde cae un toque en la pantalla: el 30 % de cada lado cambia de página o de paso,
// el centro muestra u oculta los controles
export type TapZone = "prev" | "next" | "center"

export const tapZone = (x: number, width: number): TapZone => {
  if (width <= 0) return "center"
  const fraction = x / width
  return fraction < 0.3 ? "prev" : fraction > 0.7 ? "next" : "center"
}

// Lo que se ve abajo de la letra en la navegación: la página que sigue si la alabanza tiene más,
// y si no, qué sigue en el servicio ("Algo está cayendo aquí · G", "Oración", "Fin del servicio").
// keyOf da el tono en que va a salir cada alabanza (con lo que el músico la haya transportado).
export type UpNext = { label: string; detail: string }

export const upNextOf = <Song extends { id: string; isOffering: boolean; song: { name: string; key: string } }>(
  position: LivePosition,
  next: LivePosition | null,
  context: { songs: Song[]; pageCount: number; guideSteps: GuideStep[]; keyOf: (song: Song) => string }
): UpNext => {
  if (position.guideStep === null && position.pageIndex < context.pageCount - 1) {
    return { label: "Página", detail: `${position.pageIndex + 1} de ${context.pageCount}` }
  }
  if (!next) return { label: "Sigue:", detail: "Fin del servicio" }
  if (next.guideStep !== null) return { label: "Sigue:", detail: GUIDE_STEP_LABELS[context.guideSteps[next.guideStep]] }
  const song = context.songs[next.songIndex]
  return { label: song.isOffering ? "Sigue · Ofrenda:" : "Sigue:", detail: `${song.song.name} · ${context.keyOf(song)}` }
}
