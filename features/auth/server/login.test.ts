import bcrypt from "bcryptjs"
import { beforeAll, describe, expect, it, vi } from "vitest"
import { loginUser } from "./login"

// Las cuentas de la base, simuladas: hay un "juan" en El Palomar y otro en Iglesia Norte, y "ana"
// tiene cuenta con la misma contraseña en las dos
type Account = { id: number; username: string; password: string; role: "leader" | "musico"; church: { id: string; name: string } }
const PALOMAR = { id: "el-palomar", name: "El Palomar" }
const NORTE = { id: "norte", name: "Iglesia Norte" }
const accounts: Account[] = []

vi.mock("@/shared/server/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(async ({ where }: { where: { username: string; churchId?: string } }) =>
        accounts.filter(account => account.username === where.username && (!where.churchId || account.church.id === where.churchId)))
    }
  }
}))

beforeAll(() => {
  const hash = (password: string) => bcrypt.hashSync(password, 4)
  accounts.push(
    { id: 1, username: "juan", password: hash("juan-palomar"), role: "leader", church: PALOMAR },
    { id: 2, username: "juan", password: hash("juan-norte"), role: "musico", church: NORTE },
    { id: 3, username: "ana", password: hash("misma-clave"), role: "musico", church: NORTE },
    { id: 4, username: "ana", password: hash("misma-clave"), role: "leader", church: PALOMAR }
  )
})

describe("loginUser", () => {
  it("con dos juan, entra al de la iglesia cuya contraseña coincide", async () => {
    expect(await loginUser({ username: " Juan ", password: "juan-norte" })).toMatchObject({
      status: 200, user: { userId: 2, username: "juan", role: "musico", churchId: "norte" }
    })
    expect(await loginUser({ username: "juan", password: "juan-palomar" })).toMatchObject({
      status: 200, user: { userId: 1, churchId: "el-palomar" }
    })
  })

  it("si la contraseña coincide en dos iglesias, pide elegir y luego entra a la elegida", async () => {
    expect(await loginUser({ username: "ana", password: "misma-clave" })).toEqual({
      status: 409, message: expect.any(String), churches: [PALOMAR, NORTE]
    })
    expect(await loginUser({ username: "ana", password: "misma-clave", churchId: "norte" })).toMatchObject({
      status: 200, user: { userId: 3, churchId: "norte" }
    })
  })

  it("contraseña incorrecta, usuario inexistente o iglesia equivocada: mismo error", async () => {
    const wrong = { status: 401, message: "Usuario o contraseña incorrectos" }
    expect(await loginUser({ username: "juan", password: "otra" })).toEqual(wrong)
    expect(await loginUser({ username: "pedro", password: "juan-norte" })).toEqual(wrong)
    expect(await loginUser({ username: "juan", password: "juan-norte", churchId: "el-palomar" })).toEqual(wrong)
  })
})
