import "dotenv/config";
import express from "express";
import cors from "cors";

// A lógica de negócio (missões, prompt, chamada à Anthropic) mora em
// client/api/_lib — é a mesma usada nas funções serverless da Vercel.
// Este arquivo é só uma casca Express para rodar tudo localmente num
// computador com "npm run dev".
import { listMissions, getMissionDetail, runTurn } from "../../client/api/_lib/missionService.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/missions", (_req, res) => {
  res.json(listMissions());
});

app.get("/api/missions/:id", (req, res) => {
  const mission = getMissionDetail(req.params.id);
  if (!mission) return res.status(404).json({ error: "Mission not found" });
  res.json(mission);
});

app.post("/api/missions/:id/turn", async (req, res) => {
  const { status, body } = await runTurn(req.params.id, req.body?.history);
  res.status(status).json(body);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Missões de Conversação — server rodando em http://localhost:${PORT}`);
});
