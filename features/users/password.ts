// Contraseña al azar para un usuario nuevo o al restablecerla: sin letras que se confunden
// (l, 1, o, 0), fácil de dictar por teléfono
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"
const LENGTH = 10

export const generatePassword = (randomValues: (bytes: Uint8Array) => Uint8Array = bytes => crypto.getRandomValues(bytes)) =>
  Array.from(randomValues(new Uint8Array(LENGTH)), byte => ALPHABET[byte % ALPHABET.length]).join("")
