import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { validateCredentials } from "@/lib/validation/auth"

type LoginResponse = {
  message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" })
  }

  const { username, password } = req.body as { username?: string; password?: string }
  const validationResult = validateCredentials({ username, password })

  if (!validationResult.isValid) {
    return res.status(400).json({ message: validationResult.message ?? "Faltan campos obligatorios" })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username!.trim() }
    })

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" })
    }

    const isPasswordValid = await bcrypt.compare(password!.trim(), user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" })
    }

    return res.status(200).json({ message: "Inicio de sesión exitoso" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error del servidor" })
  }
}
