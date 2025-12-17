const USERS_KEY = "appUsers"

const isBrowser = () => typeof window !== "undefined"

export const defaultUser = { username: "usuario", password: "canva123" }

export const getStoredUsers = () => {
  if (!isBrowser()) return []

  const rawUsers = window.localStorage.getItem(USERS_KEY)

  if (!rawUsers) return []

  try {
    const parsed = JSON.parse(rawUsers)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Error al leer los usuarios almacenados", error)
    return []
  }
}

export const saveStoredUsers = users => {
  if (!isBrowser()) return

  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const ensureDefaultUser = () => {
  if (!isBrowser()) return

  const users = getStoredUsers()
  const hasDefaultUser = users.some(user => user.username === defaultUser.username)

  if (!hasDefaultUser) {
    saveStoredUsers([...users, defaultUser])
  }
}
