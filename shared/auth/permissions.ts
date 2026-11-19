import type { UserRole } from "@/generated/prisma/client"

// Roles y permisos de la app, en un solo lugar. Lo usan el proxy, las rutas de la API y la interfaz.
// Para agregar un rol: súmalo al enum UserRole de prisma/schema.prisma (con su migración), a ROLES,
// a ROLE_LABELS y a PERMISSIONS; TypeScript marca lo que falte.
// Para agregar un permiso: súmalo a Permission y decide qué rol lo tiene en PERMISSIONS.

export const ROLES = ["master", "leader", "musico", "proyeccion"] as const
export type Role = (typeof ROLES)[number]

// Deja de compilar si ROLES y el enum UserRole de la base no tienen exactamente los mismos roles
export const ROLES_MATCH_SCHEMA: [Role] extends [UserRole] ? ([UserRole] extends [Role] ? true : never) : never = true

export const isRole = (value: unknown): value is Role => ROLES.includes(value as Role)

// Los roles que se dan dentro de una iglesia desde la página Usuarios. El master ve todas las
// iglesias, así que no se asigna desde la app: solo con el script create-user.
export type AssignableRole = Exclude<Role, "master">
export const ASSIGNABLE_ROLES = ROLES.filter((role): role is AssignableRole => role !== "master")
export const isAssignableRole = (value: unknown): value is AssignableRole => ASSIGNABLE_ROLES.includes(value as AssignableRole)

export type Permission =
  // Ver el cancionero (página Alabanzas) y abrir la vista previa de cada alabanza para ensayarla
  | "viewSongs"
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
  // Crear usuarios, cambiarles el rol y restablecer su contraseña (página Usuarios), en su iglesia
  | "manageUsers"
  // Crear y renombrar iglesias, y entrar a cualquiera de ellas (página Iglesias)
  | "manageChurches"

// Todos los permisos encendidos: el master los tiene siempre, también los que se agreguen después
const ALL_PERMISSIONS: Record<Permission, true> = {
  viewSongs: true, manageSongs: true, manageServices: true, goLive: true, leadService: true, seeKeys: true, manageUsers: true, manageChurches: true
}

const PERMISSIONS: Record<Role, Record<Permission, boolean>> = {
  master: ALL_PERMISSIONS,
  leader: { viewSongs: true, manageSongs: true, manageServices: true, goLive: true, leadService: true, seeKeys: true, manageUsers: false, manageChurches: false },
  musico: { viewSongs: true, manageSongs: false, manageServices: false, goLive: true, leadService: false, seeKeys: true, manageUsers: false, manageChurches: false },
  proyeccion: { viewSongs: false, manageSongs: false, manageServices: false, goLive: false, leadService: false, seeKeys: false, manageUsers: false, manageChurches: false }
}

export const can = (role: Role | null | undefined, permission: Permission) => Boolean(role && PERMISSIONS[role][permission])

export const ROLE_LABELS: Record<Role, string> = {
  master: "Master",
  leader: "Dirigente",
  musico: "Músico",
  proyeccion: "Proyección"
}
