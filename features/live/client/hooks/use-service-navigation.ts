import { useState } from "react"
import type { ServiceWithSongs } from "@/features/services/types"
import { guideAfterIndexOf, nextPosition, prevPosition, type GuideStep, type LivePosition } from "../../service-steps"

type NavigationOptions = {
  // Solo el dirigente: los pasos de la guía (oración y anuncios) que siguen a la adoración
  guideSteps: GuideStep[]
  // Pages of the song on screen
  pageCount: number
}

// Where the service is: which song, which page of it, and which step of the leader's guide is up.
// "Siguiente" and "Anterior" walk pages, then songs, stopping at each guide step on the way
// (el camino está en service-steps.ts).
export const useServiceNavigation = (songs: ServiceWithSongs["songs"], { guideSteps, pageCount }: NavigationOptions) => {
  const [activeServiceSongId, setActiveServiceSongId] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  // Índice en guideSteps; null con la guía cerrada
  const [guideStepIndex, setGuideStepIndex] = useState<number | null>(null)

  const activeIndex = Math.max(0, songs.findIndex(serviceSong => serviceSong.id === activeServiceSongId))
  const activeSong = songs[activeIndex] ?? null
  const guideAfterIndex = guideAfterIndexOf(songs, guideSteps.length > 0)
  // Si el servicio cambia y su guía tiene menos pasos, la guía se cierra
  const openStep = guideStepIndex !== null && guideStepIndex < guideSteps.length ? guideStepIndex : null
  const guideStep = openStep === null ? null : guideSteps[openStep]

  const context = { songCount: songs.length, pageCount, guideAfterIndex, guideSteps }
  const position: LivePosition = { songIndex: activeIndex, pageIndex, guideStep: openStep }
  const next = nextPosition(position, context)
  const prev = prevPosition(position, context)

  const moveTo = (target: LivePosition | null) => {
    if (!target) return
    setActiveServiceSongId(songs[target.songIndex]?.id ?? null)
    setPageIndex(target.pageIndex)
    setGuideStepIndex(target.guideStep)
  }

  const selectSong = (serviceSongId: string | null) => {
    setActiveServiceSongId(serviceSongId)
    setPageIndex(0)
    setGuideStepIndex(null)
  }

  // Desde la lista: abre un paso de la guía. La alabanza activa queda en la de antes de la guía,
  // para que "Anterior" vuelva ahí
  const openGuide = (step: number = 0) => {
    if (activeIndex !== guideAfterIndex) {
      setActiveServiceSongId(songs[guideAfterIndex]?.id ?? null)
      setPageIndex(0)
    }
    setGuideStepIndex(step)
  }

  const goNext = () => moveTo(next)
  const goPrev = () => moveTo(prev)
  const navigate = (direction: "prev" | "next") => (direction === "next" ? goNext() : goPrev())

  return {
    activeIndex,
    activeSong,
    pageIndex,
    setPageIndex,
    isGuideOpen: guideStep !== null,
    guideStep,
    guideStepIndex: openStep,
    guideSteps,
    guideAfterIndex,
    // Lo que sigue y lo que hay antes, para las etiquetas de los botones
    next,
    canPrev: prev !== null,
    canNext: next !== null,
    goNext,
    goPrev,
    navigate,
    selectSong,
    openGuide
  }
}
