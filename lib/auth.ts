import type { UserRole } from "@/types/worship";

export interface AuthUser {
  username: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface LoginResult {
  username: string;
  name: string;
  role: UserRole;
}

const users: AuthUser[] = [
  {
    username: "dirigente",
    name: "Dirigente General",
    password: "Dirigente123*",
    role: "dirigente"
  },
  {
    username: "musico",
    name: "Músico Base",
    password: "Musico123*",
    role: "musico"
  }
];

export function authenticateUser(username: string, password: string): LoginResult | null {
  const normalizedUsername = username.trim().toLowerCase();

  const foundUser = users.find(
    (user) => user.username.toLowerCase() === normalizedUsername && user.password === password
  );

  if (!foundUser) {
    return null;
  }

  return {
    username: foundUser.username,
    name: foundUser.name,
    role: foundUser.role
  };
}

export function listAvailableUsers(): Array<Pick<AuthUser, "username" | "role">> {
  return users.map((user) => ({ username: user.username, role: user.role }));
}
