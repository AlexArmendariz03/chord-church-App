import { apiRequest } from "@/shared/client/api"
import type { Role } from "@/shared/auth/permissions"
import type { UserListItem } from "@/features/users/types"

// Lo que envía la página Usuarios (lo valida features/users/server/user-input.ts)
export type NewUserInput = { username: string; password: string; role: Role }
export type UserUpdateInput = { password?: string; role?: Role }

export const usersApi = {
  list: () => apiRequest<UserListItem[]>("/api/users", { fallback: "No se pudieron cargar los usuarios" }),
  create: (user: NewUserInput) =>
    apiRequest<UserListItem>("/api/users", { method: "POST", body: user, fallback: "Error al crear el usuario" }),
  update: (id: number, changes: UserUpdateInput) =>
    apiRequest<UserListItem>(`/api/users/${id}`, { method: "PUT", body: changes, fallback: "Error al guardar el usuario" })
}
