import Head from "next/head";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import type { LoginResult } from "@/lib/auth";

export default function LoginPage() {
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
      setError(payload.error ?? "No fue posible iniciar sesión.");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("church-user", JSON.stringify(payload));
    setIsLoading(false);
    void router.push(payload.role === "dirigente" ? "/dirigente" : "/musico");
  };

  return (
    <>
      <Head>
        <title>Ingreso | Chord Church</title>
      </Head>
      <main className="container">
        <section className="card">
          <h1>Chord Church</h1>
          <p>Inicia sesión con tus credenciales. El sistema detecta automáticamente tu rol.</p>
          <form onSubmit={onSubmit} className="form-grid">
            <label>
              Usuario
              <input
                value={username}
                required
                minLength={3}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Ej. dirigente"
              />
            </label>
            <label>
              Contraseña
              <input
                value={password}
                required
                type="password"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
              />
            </label>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Validando..." : "Entrar"}
            </button>
          </form>
          {error ? <p className="error-message">{error}</p> : null}

          <p className="hint">
            Demo dirigente: <strong>dirigente / Dirigente123*</strong>
            <br />
            Demo músico: <strong>musico / Musico123*</strong>
          </p>
        </section>
      </main>
    </>
  );
}
