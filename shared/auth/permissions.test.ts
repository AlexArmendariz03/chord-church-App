import { describe, expect, it } from "vitest"
import { can, isRole, ROLES } from "./permissions"

describe("can", () => {
  it("el dirigente puede todo", () => {
    expect(can("leader", "manageSongs")).toBe(true)
    expect(can("leader", "leadService")).toBe(true)
  })

  it("el músico sigue En curso con tonos, sin administrar", () => {
    expect(can("musico", "goLive")).toBe(true)
    expect(can("musico", "seeKeys")).toBe(true)
    expect(can("musico", "manageServices")).toBe(false)
    expect(can("musico", "leadService")).toBe(false)
  })

  it("proyección solo ve la lista de servicios", () => {
    expect(can("proyeccion", "goLive")).toBe(false)
    expect(can("proyeccion", "seeKeys")).toBe(false)
  })

  it("sin rol no puede nada", () => {
    expect(can(null, "goLive")).toBe(false)
    expect(can(undefined, "seeKeys")).toBe(false)
  })
})

describe("isRole", () => {
  it("acepta solo los roles conocidos", () => {
    ROLES.forEach(role => expect(isRole(role)).toBe(true))
    expect(isRole("admin")).toBe(false)
    expect(isRole(undefined)).toBe(false)
  })
})
