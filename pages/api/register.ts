import { prisma } from "@/lib/prisma"
import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcrypt"

type ResponseData = {
  message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" })
  }

  const { username, password } = req.body as { username?: string; password?: string }

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return res.status(409).json({ message: "El nombre de usuario ya está en uso" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    return res.status(201).json({ message: "Usuario registrado exitosamente" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error del servidor" })
  }
}
