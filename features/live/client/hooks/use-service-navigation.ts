import { useState } from "react"
import type { ServiceWithSongs } from "@/types/services"

type NavigationOptions = {
  // Leader only: the prayer and announcements guide that follows the worship set
  withGuide: boolean
  // Pages of the song on screen
  pageCount: number
}

// Where the service is: which song, which page of it, and whether the leader's guide is up.
// "Siguiente" and "Anterior" walk pages, then songs, stopping at the guide on the way.
export const useServiceNavigation = (songs: ServiceWithSongs["songs"], { withGuide, pageCount }: NavigationOptions) => {
  const [activeServiceSongId, setActiveServiceSongId] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  const activeIndex = Math.max(0, songs.findIndex(serviceSong => serviceSong.id === activeServiceSongId))
  const activeSong = songs[activeIndex] ?? null
  // The guide follows the worship set: before the offering song, or at the end when there's none
  const offeringIndex = songs.findIndex(serviceSong => serviceSong.isOffering)
  const guideAfterIndex = !withGuide ? -1 : offeringIndex > 0 ? offeringIndex - 1 : songs.length - 1
  const isAtGuide = withGuide && activeIndex === guideAfterIndex

  const selectSong = (serviceSongId: string | null) => {
    setActiveServiceSongId(serviceSongId)
    setPageIndex(0)
    setIsGuideOpen(false)
  }

  const openGuide = () => {
    // While the guide is up, the active song is the one before it: "Anterior" goes back there
    if (activeIndex !== guideAfterIndex) {
      setActiveServiceSongId(songs[guideAfterIndex]?.id ?? null)
      setPageIndex(0)
    }
    setIsGuideOpen(true)
  }

  const canPrev = isGuideOpen || pageIndex > 0 || activeIndex > 0
  const canNext = isGuideOpen
    ? Boolean(songs[activeIndex + 1])
    : pageIndex < pageCount - 1 || activeIndex < songs.length - 1 || isAtGuide

  const goNext = () => {
    if (isGuideOpen) {
      if (songs[activeIndex + 1]) selectSong(songs[activeIndex + 1].id)
    } else if (pageIndex < pageCount - 1) setPageIndex(pageIndex + 1)
    else if (isAtGuide) setIsGuideOpen(true)
    else if (songs[activeIndex + 1]) selectSong(songs[activeIndex + 1].id)
  }

  const goPrev = () => {
    if (isGuideOpen) setIsGuideOpen(false)
    else if (pageIndex > 0) setPageIndex(pageIndex - 1)
    else if (withGuide && activeIndex === guideAfterIndex + 1) openGuide()
    else if (songs[activeIndex - 1]) selectSong(songs[activeIndex - 1].id)
  }

  const navigate = (direction: "prev" | "next") => (direction === "next" ? goNext() : goPrev())

  return {
    activeIndex,
    activeSong,
    pageIndex,
    setPageIndex,
    isGuideOpen,
    guideAfterIndex,
    canPrev,
    canNext,
    goNext,
    goPrev,
    navigate,
    selectSong,
    openGuide
  }
}
