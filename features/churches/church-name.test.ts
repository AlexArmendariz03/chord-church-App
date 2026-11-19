import { describe, expect, it } from "vitest"
import { parseChurchName } from "./church-name"

describe("parseChurchName", () => {
  it("quita los espacios de más", () => {
    expect(parseChurchName("  Iglesia   Centro ")).toEqual({ name: "Iglesia Centro" })
  })

  it("pide un nombre de 2 a 80 caracteres", () => {
    expect(parseChurchName("").error).toBeDefined()
    expect(parseChurchName(" a ").error).toBeDefined()
    expect(parseChurchName(undefined).error).toBeDefined()
    expect(parseChurchName("x".repeat(81)).error).toMatch(/80/)
  })
})
