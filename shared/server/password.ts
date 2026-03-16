import { createHash, timingSafeEqual } from "node:crypto"

const HASH_PREFIX = "sha256:"

export function hashPassword(password: string) {
  return `${HASH_PREFIX}${createHash("sha256").update(password).digest("hex")}`
}

export function verifyPassword(password: string, storedPassword: string) {
  if (!storedPassword.startsWith(HASH_PREFIX)) {
    return password === storedPassword
  }

  const providedHash = Buffer.from(hashPassword(password))
  const storedHash = Buffer.from(storedPassword)

  if (providedHash.length !== storedHash.length) {
    return false
  }

  return timingSafeEqual(providedHash, storedHash)
}
