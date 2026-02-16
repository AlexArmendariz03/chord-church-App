import type { NextApiRequest, NextApiResponse } from "next";
import { listSongs, upsertSong } from "@/lib/data-store";
import type { Song, SongCategory } from "@/types/worship";

const categories: SongCategory[] = ["jubilo", "adoracion"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const id = req.query.id as string;
  const { title, lyrics, key, category } = req.body as Partial<Song>;
  if (!id || !title || !lyrics || !key || !category || !categories.includes(category)) {
    return res.status(400).json({ error: "Datos inválidos." });
  }

  const songs = await listSongs();
  const existing = songs.find((song) => song.id === id);
  if (!existing) {
    return res.status(404).json({ error: "Alabanza no encontrada." });
  }

  const updatedSong: Song = {
    ...existing,
    title,
    lyrics,
    key,
    category,
    updatedAt: new Date().toISOString()
  };

  const saved = await upsertSong(updatedSong);
  return res.status(200).json(saved);
}
