import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { validateCredentials } from "@/lib/validation/auth"

type RegisterResponse = {
  message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<RegisterResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" })
  }

  const { username, password } = req.body as { username?: string; password?: string }
  const validationResult = validateCredentials({ username, password })

  if (!validationResult.isValid) {
    return res.status(400).json({ message: validationResult.message ?? "Faltan campos obligatorios" })
  }

  try {
    const sanitizedUsername = username!.trim()
    const sanitizedPassword = password!.trim()

    const existingUser = await prisma.user.findUnique({
      where: { username: sanitizedUsername }
    })

    if (existingUser) {
      return res.status(409).json({ message: "El nombre de usuario ya está en uso" })
    }

    const hashedPassword = await bcrypt.hash(sanitizedPassword, 10)

    await prisma.user.create({
      data: {
        username: sanitizedUsername,
        password: hashedPassword
      }
    })

    return res.status(201).json({ message: "Usuario registrado exitosamente" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error del servidor" })
  }
}
