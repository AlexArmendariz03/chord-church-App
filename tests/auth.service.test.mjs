import test from "node:test"
import assert from "node:assert/strict"
import { createAuthService } from "../src/server/auth/service.mjs"

function createRepositoryStub(initialUsers = []) {
  const users = [...initialUsers]

  return {
    users,
    async findByUsername(username) {
      return users.find(user => user.username === username) ?? null
    },
    async create(data) {
      const newUser = { id: users.length + 1, ...data }
      users.push(newUser)
      return newUser
    }
  }
}

const hasherStub = {
  async hash(password) {
    return `hashed:${password}`
  },
  async compare(inputPassword, dbPassword) {
    return dbPassword === `hashed:${inputPassword}`
  }
}

test("register rejects weak password", async () => {
  const service = createAuthService({ userRepository: createRepositoryStub(), hasher: hasherStub })

  const response = await service.register({ username: "demo", password: "123", role: "MUSICO" })

  assert.equal(response.status, 400)
  assert.match(response.body.message, /contraseña/i)
})

test("register requires a valid role", async () => {
  const service = createAuthService({ userRepository: createRepositoryStub(), hasher: hasherStub })

  const response = await service.register({ username: "demo", password: "12345678", role: "ADMIN" })

  assert.equal(response.status, 400)
  assert.match(response.body.message, /rol/i)
})

test("register stores hashed password and selected role", async () => {
  const repository = createRepositoryStub()
  const service = createAuthService({ userRepository: repository, hasher: hasherStub })

  const response = await service.register({ username: "demoUser", password: "12345678", role: "DIRIGENTE" })

  assert.equal(response.status, 201)
  assert.equal(repository.users[0].password, "hashed:12345678")
  assert.equal(repository.users[0].role, "DIRIGENTE")
  assert.equal(response.body.user.role, "DIRIGENTE")
})

test("login rejects wrong password", async () => {
  const repository = createRepositoryStub([{ id: 1, username: "demo", password: "hashed:realpass", role: "MUSICO" }])
  const service = createAuthService({ userRepository: repository, hasher: hasherStub })

  const response = await service.login({ username: "demo", password: "badpass99" })

  assert.equal(response.status, 401)
  assert.match(response.body.message, /incorrecta/i)
})

test("login returns user role when credentials are valid", async () => {
  const repository = createRepositoryStub([{ id: 1, username: "demo", password: "hashed:realpass", role: "DIRIGENTE" }])
  const service = createAuthService({ userRepository: repository, hasher: hasherStub })

  const response = await service.login({ username: "demo", password: "realpass" })

  assert.equal(response.status, 200)
  assert.equal(response.body.user.role, "DIRIGENTE")
  assert.match(response.body.message, /exitoso/i)
})
