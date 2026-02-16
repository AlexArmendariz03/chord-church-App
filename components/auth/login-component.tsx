import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import type { LoginResult } from "@/lib/auth";

export default function LoginComponent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const payload = (await response.json()) as LoginResult & { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Usuario o contraseña incorrectos");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("church-user", JSON.stringify(payload));
    setIsLoading(false);
    void router.push(payload.role === "dirigente" ? "/dirigente" : "/musico");
  };

  return (
    <section className="legacy-login-container">
      <div className="legacy-login-card">
        <div className="legacy-login-image-wrap">
          <Image width={320} height={320} src="/1.png" alt="Logo de Chord Church" priority />
        </div>

        <form className="legacy-login-form" onSubmit={onSubmit}>
          <h1>Chord Church</h1>
          <p>Ingresa tus credenciales para detectar automáticamente tu rol.</p>

          <label>
            Usuario
            <input
              required
              minLength={3}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ej. dirigente"
            />
          </label>

          <label>
            Contraseña
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
            />
          </label>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Validando..." : "Iniciar Sesión"}
          </button>

          {error ? <p className="error-message">{error}</p> : null}
          <p className="hint">
            Demo dirigente: <strong>dirigente / Dirigente123*</strong>
            <br />
            Demo músico: <strong>musico / Musico123*</strong>
          </p>
        </form>
      </div>
    </section>
  );
}
