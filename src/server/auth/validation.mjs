const USERNAME_MIN_LENGTH = 3
const PASSWORD_MIN_LENGTH = 8
const ALLOWED_ROLES = ["DIRIGENTE", "MUSICO"]

function normalizeRole(inputRole) {
  if (typeof inputRole !== "string") {
    return ""
  }

  return inputRole.trim().toUpperCase()
}

export function validateCredentials(payload, options = {}) {
  const username = typeof payload?.username === "string" ? payload.username.trim() : ""
  const password = typeof payload?.password === "string" ? payload.password : ""
  const role = normalizeRole(payload?.role)

  if (!username || !password) {
    return { valid: false, message: "Faltan campos obligatorios" }
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    return { valid: false, message: `El usuario debe tener al menos ${USERNAME_MIN_LENGTH} caracteres` }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres` }
  }

  if (options.requireRole && !ALLOWED_ROLES.includes(role)) {
    return { valid: false, message: "El rol debe ser DIRIGENTE o MUSICO" }
  }

  return {
    valid: true,
    value: {
      username,
      password,
      role: ALLOWED_ROLES.includes(role) ? role : undefined
    }
  }
}

export { ALLOWED_ROLES }
