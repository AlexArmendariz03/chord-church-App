import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE_NAME, verifySession } from "@/shared/server/session-token"

const PUBLIC_PAGES = ["/login"]
const PUBLIC_API = ["/api/login", "/api/logout"]
// Open to everyone, with or without a session
const OPEN_PAGES = ["/terminos"]
const LEADER_PAGES = ["/alabanzas", "/servicios"]
// Proyección solo ve la lista de servicios en Inicio
const LIVE_PAGES = ["/en-curso"]

const matches = (pathname: string, paths: string[]) =>
  paths.some(path => pathname === path || pathname.startsWith(`${path}/`))

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const user = await verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url))

  if (pathname.startsWith("/api/")) {
    if (matches(pathname, PUBLIC_API) || user) return NextResponse.next()
    return NextResponse.json({ message: "Tu sesión expiró. Vuelve a iniciar sesión." }, { status: 401 })
  }

  if (matches(pathname, OPEN_PAGES)) return NextResponse.next()

  if (matches(pathname, PUBLIC_PAGES)) {
    return user ? redirectTo("/dashboard") : NextResponse.next()
  }

  if (!user) return redirectTo("/login")
  if (matches(pathname, LEADER_PAGES) && user.role !== "leader") return redirectTo("/dashboard")
  if (matches(pathname, LIVE_PAGES) && user.role === "proyeccion") return redirectTo("/dashboard")

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"]
}
