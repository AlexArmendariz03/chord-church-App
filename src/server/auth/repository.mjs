import { prisma } from "@/lib/prisma"

export const userRepository = {
  findByUsername(username) {
    return prisma.user.findUnique({ where: { username } })
  },

  create(data) {
    return prisma.user.create({ data })
  }
}
