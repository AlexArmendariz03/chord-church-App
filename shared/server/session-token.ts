// Signed session token: base64url(payload).base64url(HMAC-SHA256(payload)).
// Uses Web Crypto so it works both in route handlers and in proxy.ts.

export type SessionRole = "leader" | "musico" | "proyeccion"

const SESSION_ROLES: SessionRole[] = ["leader", "musico", "proyeccion"]

export type SessionUser = {
  username: string
  role: SessionRole
}

type SessionPayload = SessionUser & { exp: number }

export const SESSION_COOKIE_NAME = "session"
export const SESSION_MAX_AGE = 60 * 60 * 24

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

const getKey = () => {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET no está configurado (mínimo 32 caracteres)")
  }
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
}

export async function signSession(user: SessionUser): Promise<string> {
  const payload: SessionPayload = { ...user, exp: Date.now() + SESSION_MAX_AGE * 1000 }
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(body))
  return `${body}.${toBase64Url(new Uint8Array(signature))}`
}

export async function verifySession(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null
  const [body, signature] = token.split(".")
  if (!body || !signature) return null

  try {
    const isValid = await crypto.subtle.verify("HMAC", await getKey(), fromBase64Url(signature), encoder.encode(body))
    if (!isValid) return null

    const payload = JSON.parse(decoder.decode(fromBase64Url(body))) as Partial<SessionPayload>
    if (!payload.exp || payload.exp < Date.now()) return null
    if (!payload.username || !payload.role || !SESSION_ROLES.includes(payload.role)) return null

    return { username: payload.username, role: payload.role }
  } catch {
    return null
  }
}
