import Head from "next/head";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import type { ServicePlan, Song, SongCategory } from "@/types/worship";

type PlanResponse = ServicePlan & { jubiloSongs: Song[]; adoracionSongs: Song[] };

const initialSongForm = {
  title: "",
  key: "",
  category: "jubilo" as SongCategory,
  lyrics: ""
};

export default function DirigentePage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [songForm, setSongForm] = useState(initialSongForm);
  const [date, setDate] = useState("");
  const [jubiloSongIds, setJubiloSongIds] = useState<string[]>([]);
  const [adoracionSongIds, setAdoracionSongIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const jubiloSongs = useMemo(() => songs.filter((song) => song.category === "jubilo"), [songs]);
  const adoracionSongs = useMemo(() => songs.filter((song) => song.category === "adoracion"), [songs]);

  useEffect(() => {
    const storedUser = localStorage.getItem("church-user");
    if (!storedUser) {
      void router.replace("/login");
      return;
    }

    const parsed = JSON.parse(storedUser) as { role?: string };
    if (parsed.role !== "dirigente") {
      void router.replace("/musico");
      return;
    }

    void loadData();
  }, [router]);

  const loadData = async () => {
    const [songsRes, plansRes] = await Promise.all([fetch("/api/songs"), fetch("/api/service-plans")]);
    const songsData = (await songsRes.json()) as Song[];
    const plansData = (await plansRes.json()) as PlanResponse[];
    setSongs(songsData);
    setPlans(plansData);
  };

  const submitSong = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/songs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(songForm)
    });

    if (!response.ok) {
      setMessage("No fue posible guardar la alabanza.");
      return;
    }

    setSongForm(initialSongForm);
    setMessage("Alabanza guardada exitosamente.");
    await loadData();
  };

  const submitPlan = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/service-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, jubiloSongIds, adoracionSongIds })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "No fue posible guardar el plan.");
      return;
    }

    setDate("");
    setJubiloSongIds([]);
    setAdoracionSongIds([]);
    setMessage("Plan de alabanzas guardado.");
    await loadData();
  };

  return (
    <>
      <Head>
        <title>Panel del dirigente | Chord Church</title>
      </Head>
      <main className="container">
        <section className="card">
          <h1>Panel del dirigente</h1>
          {message ? <p className="message">{message}</p> : null}

          <h2>Cargar alabanza</h2>
          <form className="form-grid" onSubmit={submitSong}>
            <input
              required
              value={songForm.title}
              onChange={(event) => setSongForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Nombre de la alabanza"
            />
            <input
              required
              value={songForm.key}
              onChange={(event) => setSongForm((prev) => ({ ...prev, key: event.target.value }))}
              placeholder="Tono (Ej. G, Am, D)"
            />
            <select
              value={songForm.category}
              onChange={(event) =>
                setSongForm((prev) => ({ ...prev, category: event.target.value as SongCategory }))
              }
            >
              <option value="jubilo">Júbilo</option>
              <option value="adoracion">Adoración</option>
            </select>
            <textarea
              required
              value={songForm.lyrics}
              onChange={(event) => setSongForm((prev) => ({ ...prev, lyrics: event.target.value }))}
              rows={4}
              placeholder="Letra de la alabanza"
            />
            <button type="submit">Guardar alabanza</button>
          </form>

          <h2>Crear plan de servicio</h2>
          <form className="form-grid" onSubmit={submitPlan}>
            <label>
              Fecha
              <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label>
              2 de júbilo
              <select
                multiple
                value={jubiloSongIds}
                onChange={(event) =>
                  setJubiloSongIds(Array.from(event.target.selectedOptions).map((option) => option.value))
                }
              >
                {jubiloSongs.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.title} ({song.key})
                  </option>
                ))}
              </select>
            </label>
            <label>
              2 de adoración
              <select
                multiple
                value={adoracionSongIds}
                onChange={(event) =>
                  setAdoracionSongIds(Array.from(event.target.selectedOptions).map((option) => option.value))
                }
              >
                {adoracionSongs.map((song) => (
                  <option key={song.id} value={song.id}>
                    {song.title} ({song.key})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Guardar plan</button>
          </form>
        </section>

        <section className="card">
          <h2>Planes guardados</h2>
          {plans.length === 0 ? <p>No hay planes creados todavía.</p> : null}
          {plans.map((plan) => (
            <article key={plan.id} className="plan-card">
              <h3>{plan.date}</h3>
              <p><strong>Júbilo:</strong> {plan.jubiloSongs.map((song) => song.title).join(", ")}</p>
              <p><strong>Adoración:</strong> {plan.adoracionSongs.map((song) => song.title).join(", ")}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
