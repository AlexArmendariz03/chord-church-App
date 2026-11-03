import { describe, expect, it } from "vitest"
import { bearerToken, sessionTokenFrom } from "./session-token"

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
