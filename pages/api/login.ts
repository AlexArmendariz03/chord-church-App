import { prisma } from "@/lib/prisma"
import type { NextApiRequest, NextApiResponse } from "next"
import bcrypt from "bcrypt"

type ResponseData = {
  message: string
  role?: "leader" | "musico"
}

type StaticUser = {
  username: string
  password: string
  role: "leader" | "musico"
}

const STATIC_USERS: StaticUser[] = [
  {
    username: "leader",
    password: "leader123",
    role: "leader"
  },
  {
    username: "musico",
    password: "musico123",
    role: "musico"
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" })
  }

  const { username, password } = req.body as { username?: string; password?: string }

  if (!username || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" })
  }

  const staticUser = STATIC_USERS.find(user => user.username === username)

  if (staticUser && staticUser.password === password) {
    return res.status(200).json({
      message: `Inicio de sesión exitoso (${staticUser.role})`,
      role: staticUser.role
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta" })
    }

    return res.status(200).json({ message: "Inicio de sesión exitoso" })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error del servidor" })
  }
}
