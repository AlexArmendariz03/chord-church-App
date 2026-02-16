import type { NextApiRequest, NextApiResponse } from "next";
import { listSongs, upsertSong } from "@/lib/data-store";
import type { Song, SongCategory } from "@/types/worship";

const categories: SongCategory[] = ["jubilo", "adoracion"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const songs = await listSongs();
    return res.status(200).json(songs);
  }

  if (req.method === "POST") {
    const { title, lyrics, key, category } = req.body as Partial<Song>;
    if (!title || !lyrics || !key || !category || !categories.includes(category)) {
      return res.status(400).json({ error: "Datos de alabanza inválidos." });
    }

    const now = new Date().toISOString();
    const song: Song = {
      id: crypto.randomUUID(),
      title,
      lyrics,
      key,
      category,
      createdAt: now,
      updatedAt: now
    };

    const savedSong = await upsertSong(song);
    return res.status(201).json(savedSong);
  }

  return res.status(405).json({ error: "Método no permitido" });
}
