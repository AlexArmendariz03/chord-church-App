import { prisma } from "@/shared/server/prisma"
import { hashPassword } from "@/shared/server/password"

type RegisterParams = {
  username: string
  password: string
}

export async function registerUser({ username, password }: RegisterParams): Promise<{ message: string; status: number }> {
  const existingUser = await prisma.user.findUnique({
    where: { username }
  })

  if (existingUser) {
    return { status: 409, message: "El nombre de usuario ya está en uso" }
  }

  const hashedPassword = hashPassword(password)

  await prisma.user.create({
    data: {
      username,
      password: hashedPassword
    }
  })

  return { status: 201, message: "Usuario registrado exitosamente" }
}
