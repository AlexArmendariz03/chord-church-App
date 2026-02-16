import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { ServicePlan, Song } from "@/types/worship";

type PlanResponse = ServicePlan & { jubiloSongs: Song[]; adoracionSongs: Song[] };

export default function MusicoPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("church-user");
    if (!storedUser) {
      void router.replace("/login");
      return;
    }

    void fetch("/api/service-plans")
      .then((res) => res.json() as Promise<PlanResponse[]>)
      .then((data) => setPlans(data));
  }, [router]);

  return (
    <>
      <Head>
        <title>Panel del músico | Chord Church</title>
      </Head>
      <main className="container">
        <section className="card">
          <h1>Planes de alabanza</h1>
          {plans.length === 0 ? <p>No hay planes disponibles todavía.</p> : null}
          {plans.map((plan) => (
            <article key={plan.id} className="plan-card">
              <h2>Servicio: {plan.date}</h2>
              <h3>Júbilo</h3>
              {plan.jubiloSongs.map((song) => (
                <button key={song.id} className="song-button" onClick={() => setSelectedSong(song)}>
                  {song.title} - {song.key}
                </button>
              ))}
              <h3>Adoración</h3>
              {plan.adoracionSongs.map((song) => (
                <button key={song.id} className="song-button" onClick={() => setSelectedSong(song)}>
                  {song.title} - {song.key}
                </button>
              ))}
            </article>
          ))}
        </section>

        <section className="card">
          <h2>Detalle de alabanza</h2>
          {!selectedSong ? (
            <p>Selecciona una alabanza para ver letra y tono.</p>
          ) : (
            <article>
              <h3>{selectedSong.title}</h3>
              <p><strong>Tono:</strong> {selectedSong.key}</p>
              <pre className="lyrics">{selectedSong.lyrics}</pre>
            </article>
          )}
        </section>
      </main>
    </>
  );
}
