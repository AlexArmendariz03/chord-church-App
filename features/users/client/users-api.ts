import { apiRequest } from "@/shared/client/api"
import type { AssignableRole } from "@/shared/auth/permissions"
import type { UserListItem } from "@/features/users/types"

// Lo que envía la página Usuarios (lo valida features/users/server/user-input.ts)
export type NewUserInput = { username: string; password: string; role: AssignableRole }
export type UserUpdateInput = { password?: string; role?: AssignableRole }

// Sin iglesia, los usuarios de la iglesia de la sesión; con ella, los de esa iglesia (solo el master,
// desde la página de la iglesia)
export const usersApiFor = (churchId?: string) => {
  const base = churchId ? `/api/churches/${churchId}/users` : "/api/users"
  return {
    list: () => apiRequest<UserListItem[]>(base, { fallback: "No se pudieron cargar los usuarios" }),
    create: (user: NewUserInput) =>
      apiRequest<UserListItem>(base, { method: "POST", body: user, fallback: "Error al crear el usuario" }),
    update: (id: number, changes: UserUpdateInput) =>
      apiRequest<UserListItem>(`${base}/${id}`, { method: "PUT", body: changes, fallback: "Error al guardar el usuario" })
  }
}

export const usersApi = usersApiFor()
