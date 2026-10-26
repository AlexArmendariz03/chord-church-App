"use client"

import { createContext, useContext, type PropsWithChildren } from "react"
import type { SessionUser } from "@/shared/server/session-token"

const SessionContext = createContext<SessionUser | null>(null)

type SessionProviderProps = PropsWithChildren<{ user: SessionUser | null }>

export const SessionProvider = ({ user, children }: SessionProviderProps) => (
  <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
)

export const useSession = () => {
  const user = useContext(SessionContext)
  return { user, isLeader: user?.role === "leader", isProjection: user?.role === "proyeccion" }
}
