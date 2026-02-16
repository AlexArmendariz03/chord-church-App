const USERNAME_MIN_LENGTH = 3
const PASSWORD_MIN_LENGTH = 8

export function validateCredentials(payload) {
  const username = typeof payload?.username === "string" ? payload.username.trim() : ""
  const password = typeof payload?.password === "string" ? payload.password : ""

  if (!username || !password) {
    return { valid: false, message: "Faltan campos obligatorios" }
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    return { valid: false, message: `El usuario debe tener al menos ${USERNAME_MIN_LENGTH} caracteres` }
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres` }
  }

  return { valid: true, value: { username, password } }
}
