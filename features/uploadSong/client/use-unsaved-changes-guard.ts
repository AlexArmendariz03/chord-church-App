import { useEffect } from "react"

export const UNSAVED_CHANGES_MESSAGE = "Tienes cambios sin guardar. ¿Salir sin guardar?"

// Warns before leaving the page with unsaved changes: on reload/close (beforeunload)
// and on in-app links (menu, logo), which Next.js navigates client-side.
export const useUnsavedChangesGuard = (isDirty: boolean) => {
  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }

    // Capture phase on document runs before React's root listener, so stopping the
    // event here keeps <Link> from navigating.
    const handleLinkClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]")
      if (!(link instanceof HTMLAnchorElement) || link.origin !== window.location.origin) return
      if (link.pathname === window.location.pathname && link.search === window.location.search) return
      if (window.confirm(UNSAVED_CHANGES_MESSAGE)) return

      event.preventDefault()
      event.stopPropagation()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("click", handleLinkClick, true)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("click", handleLinkClick, true)
    }
  }, [isDirty])
}
