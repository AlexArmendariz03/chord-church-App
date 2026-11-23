import "server-only"
import type { SessionUser } from "@/shared/server/session-token"

// La cuenta de la sesión en la base. Las sesiones nuevas traen el id de la persona; las de antes
// solo el usuario y la iglesia, que basta mientras la persona siga en su iglesia (con el master
// dentro de otra iglesia no se encuentra, y se resuelve al volver a iniciar sesión).
export const sessionAccountWhere = (user: SessionUser) =>
  user.userId !== undefined
    ? { id: user.userId }
    : { churchId_username: { churchId: user.churchId, username: user.username } }

// Si el usuario de una iglesia es la persona de la sesión
export const isSessionAccount = (user: SessionUser, account: { id: number; username: string; churchId: string }) =>
  user.userId !== undefined ? account.id === user.userId : account.username === user.username && account.churchId === user.churchId
