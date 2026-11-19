// Creates or updates a user in the database.
// Usage: npm run create-user -- <usuario> <contraseña> [leader|musico|proyeccion|master] [iglesia]
// La iglesia es su id o su nombre exacto. Sin ella, un usuario nuevo va a El Palomar y uno
// que ya existe se queda en la suya. El master solo se crea aquí: la app no deja asignar ese rol.
import bcrypt from "bcryptjs"
import { UserRole } from "../generated/prisma/enums"
import { prisma } from "../shared/server/prisma"

// Los roles salen del enum de prisma/schema.prisma, así que un rol nuevo funciona aquí sin tocar nada
const ROLES: string[] = Object.values(UserRole)
const [username, password, role = "musico", churchArg] = process.argv.slice(2)
// La que creó la migración add_churches con todo lo que ya existía
const DEFAULT_CHURCH_ID = "el-palomar"
const isRole = (value: string): value is UserRole => ROLES.includes(value)

if (!username || !password || !isRole(role)) {
  console.error(`Uso: npm run create-user -- <usuario> <contraseña> [${ROLES.join("|")}] [iglesia]`)
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
    const church = await prisma.church.findFirst({
      where: { OR: [{ id: churchArg ?? DEFAULT_CHURCH_ID }, { name: churchArg ?? DEFAULT_CHURCH_ID }] },
      select: { id: true, name: true }
    })
    if (!church) {
      console.error(`No existe la iglesia "${churchArg}". Créala desde la página Iglesias.`)
      process.exitCode = 1
      return
    }
    const saved = await prisma.user.upsert({
      where: { username: normalizedUsername },
      update: { password: hashedPassword, role: userRole, ...(churchArg ? { churchId: church.id } : {}) },
      create: { username: normalizedUsername, password: hashedPassword, role: userRole, churchId: church.id },
      select: { church: { select: { name: true } } }
    })
    console.log(`Usuario "${normalizedUsername}" guardado con rol ${userRole} en ${saved.church.name}`)
  } finally {
    await prisma.$disconnect()
  }
}

main(role)
