import { validateCredentials } from "@/lib/validation/auth"

describe("validateCredentials", () => {
  it("rechaza cuando faltan campos", () => {
    expect(validateCredentials({ username: "", password: "" })).toEqual({
      isValid: false,
      message: "Faltan campos obligatorios"
    })
  })

  it("rechaza username corto", () => {
    expect(validateCredentials({ username: "ab", password: "123456" })).toEqual({
      isValid: false,
      message: "El nombre de usuario debe tener al menos 3 caracteres"
    })
  })

  it("rechaza password corto", () => {
    expect(validateCredentials({ username: "usuario", password: "123" })).toEqual({
      isValid: false,
      message: "La contraseña debe tener al menos 6 caracteres"
    })
  })

  it("acepta credenciales válidas", () => {
    expect(validateCredentials({ username: "usuario", password: "123456" })).toEqual({
      isValid: true
    })
  })
})
