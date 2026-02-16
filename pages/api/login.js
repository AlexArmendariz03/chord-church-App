import bcrypt from "bcrypt"
import { createAuthService } from "@/src/server/auth/service.mjs"
import { userRepository } from "@/src/server/auth/repository.mjs"

const authService = createAuthService({ userRepository, hasher: bcrypt })

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" })
  }

  try {
    const result = await authService.login(req.body)
    return res.status(result.status).json(result.body)
  } catch (error) {
    console.error("login_error", error)
    return res.status(500).json({ message: "Error del servidor" })
  }
}
