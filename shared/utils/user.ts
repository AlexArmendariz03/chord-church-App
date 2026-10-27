// Cuentas compartidas cuyo nombre lleva acento, que el usuario no tiene
const ACCENTED_NAMES: Record<string, string> = { proyeccion: "Proyección" }

// Usernames are stored lowercase ("guitarrista"); show them as a name ("Guitarrista")
export const displayName = (username?: string | null) =>
  !username ? "" : ACCENTED_NAMES[username] ?? username.charAt(0).toUpperCase() + username.slice(1)
