import type { Role } from "@/shared/auth/permissions"

// Un usuario como lo ve la página Usuarios: nunca lleva la contraseña
export type UserListItem = {
  id: number
  username: string
  role: Role
}
