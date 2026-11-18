import { isRole, type Role } from "@/shared/auth/permissions"

// Valida el cuerpo para crear (POST) y editar (PUT) un usuario, como song-input.ts con las alabanzas

export type NewUserBody = { username?: unknown; password?: unknown; role?: unknown }
export type UserUpdateBody = { password?: unknown; role?: unknown }

// Igual que el script create-user: al menos 8 caracteres
export const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 200
// Minúsculas, números, punto, guion y guion bajo: se escribe igual en cualquier teclado
const USERNAME = /^[a-z0-9._-]{3,40}$/

const passwordError = (password: unknown) => {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
  if (password.length > MAX_PASSWORD_LENGTH) return "La contraseña es demasiado larga"
  return null
}

export function parseNewUser({ username, password, role }: NewUserBody):
  | { error: string }
  | { error?: undefined; data: { username: string; password: string; role: Role } } {
  const normalized = typeof username === "string" ? username.trim().toLowerCase() : ""
  if (!USERNAME.test(normalized)) return { error: "El usuario debe tener de 3 a 40 letras sin acentos, números, punto o guion, sin espacios" }
  const badPassword = passwordError(password)
  if (badPassword) return { error: badPassword }
  if (!isRole(role)) return { error: "Elige un rol válido" }
  return { data: { username: normalized, password: password as string, role } }
}

// Se cambia lo que venga: el rol, la contraseña o los dos
export function parseUserUpdate({ password, role }: UserUpdateBody):
  | { error: string }
  | { error?: undefined; data: { password?: string; role?: Role } } {
  if (password === undefined && role === undefined) return { error: "No hay nada que cambiar" }
  if (password !== undefined) {
    const badPassword = passwordError(password)
    if (badPassword) return { error: badPassword }
  }
  if (role !== undefined && !isRole(role)) return { error: "Elige un rol válido" }
  return {
    data: {
      ...(password === undefined ? {} : { password: password as string }),
      ...(role === undefined ? {} : { role: role as Role })
    }
  }
}
