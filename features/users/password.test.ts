import { describe, expect, it } from "vitest"
import { generatePassword } from "./password"

describe("generatePassword", () => {
  it("da 10 caracteres sin letras que se confundan", () => {
    const password = generatePassword()
    expect(password).toMatch(/^[a-km-np-z2-9]{10}$/)
  })

  it("cambia cada vez", () => {
    expect(generatePassword()).not.toBe(generatePassword())
  })
})
