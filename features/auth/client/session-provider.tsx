"use client"

import { createContext, useContext, type PropsWithChildren } from "react"
import { can, type Permission } from "@/shared/auth/permissions"
import type { SessionUser } from "@/shared/server/session-token"

const SessionContext = createContext<SessionUser | null>(null)

type SessionProviderProps = PropsWithChildren<{ user: SessionUser | null }>

export const SessionProvider = ({ user, children }: SessionProviderProps) => (
  <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
)

// La interfaz decide qué mostrar con can("permiso"), igual que el proxy y la API (shared/auth/permissions.ts)
export const useSession = () => {
  const user = useContext(SessionContext)
  return { user, role: user?.role, can: (permission: Permission) => can(user?.role, permission) }
}
