import { describe, expect, it } from "vitest"
import { parseNewUser, parseUserUpdate } from "./user-input"

describe("parseNewUser", () => {
  it("guarda el usuario en minúsculas y sin espacios en las orillas", () => {
    expect(parseNewUser({ username: "  Pastor ", password: "12345678", role: "leader" }))
      .toEqual({ data: { username: "pastor", password: "12345678", role: "leader" } })
  })

  it("rechaza usuarios con espacios, acentos o muy cortos", () => {
    expect(parseNewUser({ username: "juan perez", password: "12345678", role: "musico" }).error).toBeDefined()
    expect(parseNewUser({ username: "josé", password: "12345678", role: "musico" }).error).toBeDefined()
    expect(parseNewUser({ username: "jo", password: "12345678", role: "musico" }).error).toBeDefined()
  })

  it("pide una contraseña de al menos 8 caracteres y un rol que exista", () => {
    expect(parseNewUser({ username: "pastor", password: "1234567", role: "leader" }).error).toMatch(/8 caracteres/)
    expect(parseNewUser({ username: "pastor", password: "12345678", role: "admin" }).error).toBe("Elige un rol válido")
  })
})

describe("parseUserUpdate", () => {
  it("cambia solo lo que viene", () => {
    expect(parseUserUpdate({ role: "musico" })).toEqual({ data: { role: "musico" } })
    expect(parseUserUpdate({ password: "nueva-clave" })).toEqual({ data: { password: "nueva-clave" } })
  })

  it("rechaza un cambio vacío, una contraseña corta o un rol que no existe", () => {
    expect(parseUserUpdate({}).error).toBe("No hay nada que cambiar")
    expect(parseUserUpdate({ password: "corta" }).error).toMatch(/8 caracteres/)
    expect(parseUserUpdate({ role: "admin" }).error).toBe("Elige un rol válido")
  })
})
