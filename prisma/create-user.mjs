// Creates or updates a user in the database.
// Usage: npm run create-user -- <usuario> <contraseña> [leader|musico]
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const [username, password, role = "musico"] = process.argv.slice(2)

if (!username || !password || !["leader", "musico"].includes(role)) {
  console.error("Uso: npm run create-user -- <usuario> <contraseña> [leader|musico]")
  process.exit(1)
}

if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres")
  process.exit(1)
}

const prisma = new PrismaClient()
const normalizedUsername = username.trim().toLowerCase()
const hashedPassword = await bcrypt.hash(password, 10)

try {
  await prisma.user.upsert({
    where: { username: normalizedUsername },
    update: { password: hashedPassword, role },
    create: { username: normalizedUsername, password: hashedPassword, role }
  })
  console.log(`Usuario "${normalizedUsername}" guardado con rol ${role}`)
} finally {
  await prisma.$disconnect()
}
