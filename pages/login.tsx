import Head from "next/head";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import type { UserRole } from "@/types/worship";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("musico");
  const router = useRouter();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem("church-user", JSON.stringify({ name, role }));
    void router.push(role === "dirigente" ? "/dirigente" : "/musico");
  };

  return (
    <>
      <Head>
        <title>Ingreso | Chord Church</title>
      </Head>
      <main className="container">
        <section className="card">
          <h1>Chord Church</h1>
          <p>Inicia sesión para administrar o ver las alabanzas del servicio.</p>
          <form onSubmit={onSubmit} className="form-grid">
            <label>
              Nombre
              <input
                value={name}
                required
                minLength={2}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Ana"
              />
            </label>
            <label>
              Rol
              <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="dirigente">Dirigente</option>
                <option value="musico">Músico</option>
              </select>
            </label>
            <button type="submit">Entrar</button>
          </form>
        </section>
      </main>
    </>
  );
}
