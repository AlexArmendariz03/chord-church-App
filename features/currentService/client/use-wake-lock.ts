import { useEffect } from "react"

// Keeps the screen on (no auto-dim/lock) while `active`, so the iPad doesn't go dark mid-song.
// The browser drops the lock whenever the tab is hidden, so it's re-requested on return.
// Unsupported browsers or non-HTTPS origins simply keep their normal behavior.
export const useWakeLock = (active: boolean) => {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      if (document.visibilityState !== "visible") return
      try {
        const lock = await navigator.wakeLock.request("screen")
        if (cancelled) await lock.release()
        else sentinel = lock
      } catch {
        // Denied (e.g. low battery mode): nothing to do, the screen just behaves as usual
      }
    }

    const handleVisibilityChange = () => {
      if (!sentinel || sentinel.released) request()
    }

    request()
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      sentinel?.release().catch(() => {})
    }
  }, [active])
}
