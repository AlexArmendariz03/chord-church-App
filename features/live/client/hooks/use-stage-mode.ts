import { useEffect, useEffectEvent, useState } from "react"

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

// Full screen ("Pantalla completa") plus the keys that turn pages: keyboard arrows and Bluetooth
// page-turner pedals (they send arrow / Page Up / Page Down keys)
export const useStageMode = (onNavigate: (direction: "prev" | "next") => void) => {
  const [isStageMode, setIsStageMode] = useState(false)
  // Always the latest navigation, without re-subscribing the listener on every render
  const navigate = useEffectEvent(onNavigate)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || isTypingTarget(event.target)) return
      const nextKeys = isStageMode ? ["ArrowRight", "ArrowDown", "PageDown", " "] : ["ArrowRight", "PageDown"]
      const prevKeys = isStageMode ? ["ArrowLeft", "ArrowUp", "PageUp"] : ["ArrowLeft", "PageUp"]
      if (nextKeys.includes(event.key)) navigate("next")
      else if (prevKeys.includes(event.key)) navigate("prev")
      else if (event.key === "Escape" && isStageMode) setIsStageMode(false)
      else return
      event.preventDefault()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isStageMode])

  // The browser can leave real fullscreen on its own (Esc, iPad gesture); follow it
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsStageMode(false)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (!isStageMode) return
    const root = document.documentElement
    root.style.overflow = "hidden"
    return () => { root.style.overflow = "" }
  }, [isStageMode])

  const enterStage = async () => {
    setIsStageMode(true)
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    } catch {
      // No fullscreen API (iPhone Safari): the stage still covers the whole page
    }
  }

  const exitStage = async () => {
    setIsStageMode(false)
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
  }

  return { isStageMode, enterStage, exitStage }
}
