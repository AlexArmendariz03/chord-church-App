import bcrypt from "bcrypt"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function upsertUser({ username, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10)

  return prisma.user.upsert({
    where: { username },
    update: { password: passwordHash, role },
    create: { username, password: passwordHash, role }
  })
}

async function main() {
  await upsertUser({ username: "dirigente", password: "Dirigente123", role: "DIRIGENTE" })
  await upsertUser({ username: "musico", password: "Musico123", role: "MUSICO" })

  console.log("Cuentas listas:")
  console.log("- dirigente / Dirigente123")
  console.log("- musico / Musico123")
}

main()
  .catch(error => {
    console.error("seed_roles_error", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
