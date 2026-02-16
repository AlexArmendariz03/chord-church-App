import { validateCredentials } from "./validation.mjs"

export function createAuthService({ userRepository, hasher }) {
  if (!userRepository || !hasher) {
    throw new Error("createAuthService requiere userRepository y hasher")
  }

  return {
    async register(payload) {
      const validation = validateCredentials(payload, { requireRole: true })

      if (!validation.valid) {
        return { status: 400, body: { message: validation.message } }
      }

      const { username, password, role } = validation.value
      const existingUser = await userRepository.findByUsername(username)

      if (existingUser) {
        return { status: 409, body: { message: "El nombre de usuario ya está en uso" } }
      }

      const hashedPassword = await hasher.hash(password, 10)
      const newUser = await userRepository.create({ username, password: hashedPassword, role })

      return {
        status: 201,
        body: {
          message: "Usuario registrado exitosamente",
          user: {
            id: newUser.id,
            username: newUser.username,
            role: newUser.role
          }
        }
      }
    },

    async login(payload) {
      const validation = validateCredentials(payload)

      if (!validation.valid) {
        return { status: 400, body: { message: validation.message } }
      }

      const { username, password } = validation.value
      const user = await userRepository.findByUsername(username)

      if (!user) {
        return { status: 401, body: { message: "Usuario no encontrado" } }
      }

      const isPasswordValid = await hasher.compare(password, user.password)
      if (!isPasswordValid) {
        return { status: 401, body: { message: "Contraseña incorrecta" } }
      }

      return {
        status: 200,
        body: {
          message: "Inicio de sesión exitoso",
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        }
      }
    }
  }
}
