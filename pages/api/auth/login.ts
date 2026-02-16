import type { NextApiRequest, NextApiResponse } from "next";
import { authenticateUser } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ error: "Debes enviar usuario y contraseña." });
  }

  const user = authenticateUser(username, password);

  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  return res.status(200).json(user);
}
