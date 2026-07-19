export type UserRole = "dirigente" | "musico"

type LoginParams = {
  username: string
  password: string
}

type StaticUser = LoginParams & {
  role: UserRole
  displayName: string
}

export const STATIC_USERS: StaticUser[] = [
  {
    username: "dirigente",
    password: "dirigente123",
    role: "dirigente",
    displayName: "Dirigente"
  },
  {
    username: "musico",
    password: "musico123",
    role: "musico",
    displayName: "Músico"
  }
]

export async function loginUser({ username, password }: LoginParams): Promise<{ message: string; role?: UserRole; status: number }> {
  const normalizedUsername = username.trim().toLowerCase()
  const staticUser = STATIC_USERS.find((candidate) => candidate.username === normalizedUsername && candidate.password === password)

  if (!staticUser) {
    return {
      status: 401,
      message: "Credenciales incorrectas. Usa dirigente/dirigente123 o musico/musico123"
    }
  }

  return {
    status: 200,
    message: `Inicio de sesión exitoso (${staticUser.displayName})`,
    role: staticUser.role
  }
}
