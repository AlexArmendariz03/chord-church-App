type RegisterParams = {
  username: string;
  password: string;
};

type StaticUser = {
  username: string;
  password: string;
  role: "leader" | "musico";
};

const STATIC_USERS: StaticUser[] = [
  {
    username: "leader",
    password: "leader123",
    role: "leader",
  },
  {
    username: "musico",
    password: "musico123",
    role: "musico",
  },
];

export async function registerUser({
                                     username,
                                     password,
                                   }: RegisterParams): Promise<{ message: string; status: number }> {
  const existingUser = STATIC_USERS.find((user) => user.username === username);

  if (existingUser) {
    return {
      status: 409,
      message: "El nombre de usuario ya está en uso",
    };
  }

  STATIC_USERS.push({
    username,
    password,
    role: "musico",
  });

  return {
    status: 201,
    message: "Usuario registrado exitosamente",
  };
}