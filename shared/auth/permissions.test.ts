import { describe, expect, it } from "vitest"
import { can, isAssignableRole, isRole, ROLES } from "./permissions"

describe("can", () => {
  it("el master tiene todos los permisos", () => {
    const permissions = ["viewSongs", "manageSongs", "manageServices", "goLive", "leadService", "seeKeys", "manageUsers", "manageChurches"] as const
    permissions.forEach(permission => expect(can("master", permission)).toBe(true))
  })

  it("el dirigente puede todo", () => {
    expect(can("leader", "manageSongs")).toBe(true)
    expect(can("leader", "leadService")).toBe(true)
  })

  it("el músico sigue En curso con tonos y ve el cancionero, sin administrar", () => {
    expect(can("musico", "goLive")).toBe(true)
    expect(can("musico", "viewSongs")).toBe(true)
    expect(can("musico", "manageSongs")).toBe(false)
    expect(can("musico", "seeKeys")).toBe(true)
    expect(can("musico", "manageServices")).toBe(false)
    expect(can("musico", "leadService")).toBe(false)
  })

  it("proyección solo ve la lista de servicios", () => {
    expect(can("proyeccion", "goLive")).toBe(false)
    expect(can("proyeccion", "seeKeys")).toBe(false)
    expect(can("proyeccion", "viewSongs")).toBe(false)
  })

  it("solo el master administra usuarios", () => {
    expect(can("master", "manageUsers")).toBe(true)
    expect(can("leader", "manageUsers")).toBe(false)
    expect(can("musico", "manageUsers")).toBe(false)
    expect(can("proyeccion", "manageUsers")).toBe(false)
  })

  it("solo el master administra iglesias", () => {
    expect(can("master", "manageChurches")).toBe(true)
    expect(can("leader", "manageChurches")).toBe(false)
    expect(can("musico", "manageChurches")).toBe(false)
    expect(can("proyeccion", "manageChurches")).toBe(false)
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

describe("isAssignableRole", () => {
  it("el master no se asigna desde la app", () => {
    expect(isAssignableRole("master")).toBe(false)
    expect(isAssignableRole("leader")).toBe(true)
    expect(isAssignableRole("musico")).toBe(true)
    expect(isAssignableRole("proyeccion")).toBe(true)
    expect(isAssignableRole("admin")).toBe(false)
  })
})
