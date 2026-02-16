import { promises as fs } from "node:fs";
import path from "node:path";
import type { AppData, ServicePlan, Song } from "@/types/worship";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "church-data.json");

const initialData: AppData = {
  songs: [],
  servicePlans: []
};

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

export async function readData(): Promise<AppData> {
  await ensureDataFile();
  const content = await fs.readFile(DATA_FILE_PATH, "utf-8");
  return JSON.parse(content) as AppData;
}

export async function writeData(data: AppData): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function listSongs(): Promise<Song[]> {
  const data = await readData();
  return data.songs;
}

export async function upsertSong(song: Song): Promise<Song> {
  const data = await readData();
  const index = data.songs.findIndex((item) => item.id === song.id);

  if (index >= 0) {
    data.songs[index] = song;
  } else {
    data.songs.push(song);
  }

  await writeData(data);
  return song;
}

export async function listServicePlans(): Promise<ServicePlan[]> {
  const data = await readData();
  return data.servicePlans;
}

export async function upsertServicePlan(plan: ServicePlan): Promise<ServicePlan> {
  const data = await readData();
  const index = data.servicePlans.findIndex((item) => item.id === plan.id);

  if (index >= 0) {
    data.servicePlans[index] = plan;
  } else {
    data.servicePlans.push(plan);
  }

  data.servicePlans.sort((a, b) => b.date.localeCompare(a.date));
  await writeData(data);
  return plan;
}
