// Creates or updates a user in the database.
// Usage: npm run create-user -- <usuario> <contraseña> [leader|musico|proyeccion]
import bcrypt from "bcryptjs"
import { UserRole } from "../generated/prisma/enums"
import { prisma } from "../shared/server/prisma"

// Los roles salen del enum de prisma/schema.prisma, así que un rol nuevo funciona aquí sin tocar nada
const ROLES: string[] = Object.values(UserRole)
const [username, password, role = "musico"] = process.argv.slice(2)
const isRole = (value: string): value is UserRole => ROLES.includes(value)

if (!username || !password || !isRole(role)) {
  console.error(`Uso: npm run create-user -- <usuario> <contraseña> [${ROLES.join("|")}]`)
  process.exit(1)
}

if (password.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres")
  process.exit(1)
}

// Se corre con tsx como CommonJS, que no admite await fuera de una función
const main = async (userRole: UserRole) => {
  const normalizedUsername = username.trim().toLowerCase()
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    await prisma.user.upsert({
      where: { username: normalizedUsername },
      update: { password: hashedPassword, role: userRole },
      create: { username: normalizedUsername, password: hashedPassword, role: userRole }
    })
    console.log(`Usuario "${normalizedUsername}" guardado con rol ${userRole}`)
  } finally {
    await prisma.$disconnect()
  }
}

main(role)
