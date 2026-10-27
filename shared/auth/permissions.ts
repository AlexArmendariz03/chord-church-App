import type { UserRole } from "@prisma/client"

// Roles y permisos de la app, en un solo lugar. Lo usan el proxy, las rutas de la API y la interfaz.
// Para agregar un rol: súmalo al enum UserRole de prisma/schema.prisma (con su migración), a ROLES,
// a ROLE_LABELS y a PERMISSIONS; TypeScript marca lo que falte.
// Para agregar un permiso: súmalo a Permission y decide qué rol lo tiene en PERMISSIONS.

export const ROLES = ["leader", "musico", "proyeccion"] as const
export type Role = (typeof ROLES)[number]

// Deja de compilar si ROLES y el enum UserRole de la base no tienen exactamente los mismos roles
export const ROLES_MATCH_SCHEMA: [Role] extends [UserRole] ? ([UserRole] extends [Role] ? true : never) : never = true

export const isRole = (value: unknown): value is Role => ROLES.includes(value as Role)

export type Permission =
  // Crear, editar y eliminar alabanzas (página Alabanzas)
  | "manageSongs"
  // Crear, editar y eliminar servicios (página Servicios)
  | "manageServices"
  // Abrir En curso para seguir el servicio en vivo
  | "goLive"
  // Dirigir en En curso: vista del dirigente y guía de oración y anuncios
  | "leadService"
  // Ver el tono de cada alabanza
  | "seeKeys"

const PERMISSIONS: Record<Role, Record<Permission, boolean>> = {
  leader: { manageSongs: true, manageServices: true, goLive: true, leadService: true, seeKeys: true },
  musico: { manageSongs: false, manageServices: false, goLive: true, leadService: false, seeKeys: true },
  proyeccion: { manageSongs: false, manageServices: false, goLive: false, leadService: false, seeKeys: false }
}

export const can = (role: Role | null | undefined, permission: Permission) => Boolean(role && PERMISSIONS[role][permission])

export const ROLE_LABELS: Record<Role, string> = {
  leader: "Dirigente",
  musico: "Músico",
  proyeccion: "Proyección"
}
