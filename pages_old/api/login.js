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
