import { beforeAll, describe, expect, it } from "vitest"
import { bearerToken, sessionTokenFrom, signSession, verifySession } from "./session-token"

beforeAll(() => {
  process.env.SESSION_SECRET ??= "secreto-de-prueba-con-al-menos-32-caracteres"
})

describe("signSession y verifySession", () => {
  it("la sesión lleva la iglesia", async () => {
    const user = { username: "ana", role: "leader", churchId: "iglesia-b" } as const
    expect(await verifySession(await signSession(user))).toEqual(user)
  })

  it("la sesión lleva el id de la persona; las de antes, sin él, siguen valiendo", async () => {
    const user = { userId: 7, username: "juan", role: "musico", churchId: "iglesia-b" } as const
    expect(await verifySession(await signSession(user))).toEqual(user)
    const { userId: _, ...legacy } = user
    expect(await verifySession(await signSession(legacy))).toEqual(legacy)
  })

  it("un id que no es número entero se ignora", async () => {
    const token = await signSession({ userId: "7", username: "juan", role: "musico", churchId: "iglesia-b" } as never)
    expect(await verifySession(token)).toEqual({ username: "juan", role: "musico", churchId: "iglesia-b" })
  })

  it("una sesión de antes de las iglesias, sin churchId, ya no vale", async () => {
    const token = await signSession({ username: "ana", role: "leader" } as never)
    expect(await verifySession(token)).toBeNull()
  })

  it("rechaza un token modificado", async () => {
    const token = await signSession({ username: "ana", role: "musico", churchId: "iglesia-b" })
    const [body, signature] = token.split(".")
    const forged = Buffer.from(JSON.stringify({ username: "ana", role: "master", churchId: "iglesia-b", exp: Date.now() + 60_000 })).toString("base64url")
    expect(await verifySession(`${forged}.${signature}`)).toBeNull()
    expect(body).not.toBe(forged)
  })
})

describe("bearerToken", () => {
  it("saca el token del encabezado Authorization", () => {
    expect(bearerToken("Bearer abc.def")).toBe("abc.def")
    expect(bearerToken("bearer abc.def")).toBe("abc.def")
  })

  it("ignora encabezados vacíos o de otro tipo", () => {
    expect(bearerToken(null)).toBeUndefined()
    expect(bearerToken("Basic abc")).toBeUndefined()
    expect(bearerToken("Bearer ")).toBeUndefined()
  })
})

describe("sessionTokenFrom", () => {
  it("prefiere la cookie de la web y si no hay usa el token de la app", () => {
    expect(sessionTokenFrom("cookie", "Bearer app")).toBe("cookie")
    expect(sessionTokenFrom(undefined, "Bearer app")).toBe("app")
    expect(sessionTokenFrom(undefined, null)).toBeUndefined()
  })
})
