import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" })
  }

  const { username, password } = req.body

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

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })

    return res.status(201).json({ message: "Usuario registrado exitosamente", user: newUser })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error del servidor" })
  }
}
