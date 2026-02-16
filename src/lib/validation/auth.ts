export interface CredentialsInput {
  username?: string
  password?: string
}

export interface CredentialsValidationResult {
  isValid: boolean
  message?: string
}

export const validateCredentials = (
  credentials: CredentialsInput
): CredentialsValidationResult => {
  const username = credentials.username?.trim()
  const password = credentials.password?.trim()

  if (!username || !password) {
    return {
      isValid: false,
      message: "Faltan campos obligatorios"
    }
  }

  if (username.length < 3) {
    return {
      isValid: false,
      message: "El nombre de usuario debe tener al menos 3 caracteres"
    }
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "La contraseña debe tener al menos 6 caracteres"
    }
  }

  return { isValid: true }
}
