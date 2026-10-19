// Usernames are stored lowercase ("guitarrista"); show them as a name ("Guitarrista")
export const displayName = (username?: string | null) =>
  username ? username.charAt(0).toUpperCase() + username.slice(1) : ""
