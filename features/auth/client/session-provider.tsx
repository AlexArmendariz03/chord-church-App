"use client"

import { createContext, useContext, type PropsWithChildren } from "react"
import { can, type Permission } from "@/shared/auth/permissions"
import type { CurrentChurch } from "@/features/churches/types"
import type { SessionUser } from "@/shared/server/session-token"

type SessionValue = { user: SessionUser | null; church: CurrentChurch | null }

const SessionContext = createContext<SessionValue>({ user: null, church: null })

type SessionProviderProps = PropsWithChildren<SessionValue>

export const SessionProvider = ({ user, church, children }: SessionProviderProps) => (
  <SessionContext.Provider value={{ user, church }}>{children}</SessionContext.Provider>
)

// La interfaz decide qué mostrar con can("permiso"), igual que el proxy y la API (shared/auth/permissions.ts)
export const useSession = () => {
  const { user, church } = useContext(SessionContext)
  return { user, church, role: user?.role, can: (permission: Permission) => can(user?.role, permission) }
}
