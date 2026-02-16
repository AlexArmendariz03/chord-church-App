import type { NextApiRequest, NextApiResponse } from "next";
import { listServicePlans, listSongs, upsertServicePlan } from "@/lib/data-store";
import { buildPlanSummary, validateServicePlanSelection } from "@/lib/worship";
import type { ServicePlan } from "@/types/worship";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const [plans, songs] = await Promise.all([listServicePlans(), listSongs()]);
    const summaries = plans.map((plan) => buildPlanSummary(plan, songs));
    return res.status(200).json(summaries);
  }

  if (req.method === "POST") {
    const { date, jubiloSongIds, adoracionSongIds } = req.body as Partial<ServicePlan>;

    if (!date || !Array.isArray(jubiloSongIds) || !Array.isArray(adoracionSongIds)) {
      return res.status(400).json({ error: "Debes enviar fecha y selecciones por categoría." });
    }

    const songs = await listSongs();
    const errors = validateServicePlanSelection({
      jubiloSongIds,
      adoracionSongIds,
      songs
    });

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    const now = new Date().toISOString();
    const plan: ServicePlan = {
      id: crypto.randomUUID(),
      date,
      jubiloSongIds,
      adoracionSongIds,
      createdAt: now,
      updatedAt: now
    };

    const savedPlan = await upsertServicePlan(plan);
    return res.status(201).json(buildPlanSummary(savedPlan, songs));
  }

  return res.status(405).json({ error: "Método no permitido" });
}
