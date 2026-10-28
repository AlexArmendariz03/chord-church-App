import { describe, expect, it } from "vitest"
import { isThemePreference, parsePreference, resolveTheme } from "./theme"

describe("parsePreference", () => {
  it("acepta claro y oscuro", () => {
    expect(parsePreference("light")).toBe("light")
    expect(parsePreference("dark")).toBe("dark")
  })

  it("sin cookie o con un valor desconocido sigue al sistema", () => {
    expect(parsePreference(undefined)).toBe("system")
    expect(parsePreference("azul")).toBe("system")
  })
})

describe("resolveTheme", () => {
  it("una elección fija no depende del sistema", () => {
    expect(resolveTheme("light", true)).toBe("light")
    expect(resolveTheme("dark", false)).toBe("dark")
  })

  it("automático usa lo que pide el sistema", () => {
    expect(resolveTheme("system", true)).toBe("dark")
    expect(resolveTheme("system", false)).toBe("light")
  })
})

describe("isThemePreference", () => {
  it("solo acepta los tres temas", () => {
    expect(["light", "dark", "system"].every(isThemePreference)).toBe(true)
    expect(isThemePreference("azul")).toBe(false)
    expect(isThemePreference(undefined)).toBe(false)
    expect(isThemePreference(1)).toBe(false)
  })
})
