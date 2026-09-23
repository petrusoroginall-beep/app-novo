import "dotenv/config";
import express from "express";
import cors from "cors";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import Anthropic from "@anthropic-ai/sdk";

import { missions, missionsById } from "./missions/index.js";
import { anthropic, MODEL } from "./anthropicClient.js";
import { buildSystemPrompt } from "./promptBuilder.js";
import { TurnResponseSchema, FeedbackSchema } from "./turnSchema.js";

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/missions — lista para a tela inicial (sem dados sensíveis do NPC)
app.get("/api/missions", (_req, res) => {
  res.json(
    missions.map((m) => ({
      id: m.id,
      title: m.title,
      difficulty: m.difficulty,
      context: m.context,
      npcName: m.npc.name,
      maxTurns: m.maxTurns,
    })),
  );
});

// GET /api/missions/:id — detalhes para a tela da missão (ainda sem o
// prompt de sistema completo, que fica só no backend)
app.get("/api/missions/:id", (req, res) => {
  const mission = missionsById[req.params.id];
  if (!mission) return res.status(404).json({ error: "Mission not found" });

  res.json({
    id: mission.id,
    title: mission.title,
    difficulty: mission.difficulty,
    context: mission.context,
    npcName: mission.npc.name,
    npcRole: mission.npc.role,
    maxTurns: mission.maxTurns,
    openingLine: mission.openingLine,
  });
});

// POST /api/missions/:id/turn
// body: { history: [{ role: 'npc' | 'user', text: string }, ...] }
// A history deve incluir a fala inicial do NPC (role: 'npc') seguida das
// falas alternadas do usuário/NPC. O último item deve ser a fala mais
// recente do usuário — é ela que está sendo avaliada nesta chamada.
app.post("/api/missions/:id/turn", async (req, res) => {
  const mission = missionsById[req.params.id];
  if (!mission) return res.status(404).json({ error: "Mission not found" });

  const { history } = req.body;
  if (!Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: "history is required" });
  }
  const last = history[history.length - 1];
  if (!last || last.role !== "user") {
    return res.status(400).json({ error: "history must end with a user turn" });
  }

  const userTurnNumber = history.filter((h) => h.role === "user").length;

  const messages = history.map((h) => ({
    role: h.role === "npc" ? "assistant" : "user",
    content: h.text,
  }));

  try {
    const response = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 2048,
      // Efeito baixo: prioriza latência baixa, essencial numa conversa
      // por voz em tempo real, em troca de menos "raciocínio" profundo,
      // que este caso de uso (diálogo curto e avaliação simples) não exige.
      output_config: { effort: "low", format: zodOutputFormat(TurnResponseSchema) },
      system: buildSystemPrompt(mission, userTurnNumber),
      messages,
    });

    let result = response.parsed_output;
    if (!result) {
      return res.status(502).json({ error: "Failed to parse model output" });
    }

    // Trava de segurança no servidor: garante o limite de turnos mesmo que
    // o modelo não tenha seguido a instrução do prompt.
    if (userTurnNumber >= mission.maxTurns && result.mission_status === "in_progress") {
      result = { ...result, mission_status: "lost" };
      if (!result.feedback) {
        result.feedback = await generateFallbackFeedback(mission, messages);
      }
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({
        error: "ANTHROPIC_API_KEY ausente ou inválida no servidor (server/.env).",
      });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: `Erro da API da Anthropic: ${err.message}` });
    }
    res.status(500).json({ error: "Failed to get NPC response" });
  }
});

// Usada apenas quando o limite de turnos é atingido server-side e o modelo
// não gerou feedback (porque, na visão dele, a missão ainda estava em
// andamento). Gera o feedback final separadamente, com o roteiro completo.
async function generateFallbackFeedback(mission, conversationMessages) {
  const transcript = conversationMessages
    .map((m) => `${m.role === "assistant" ? mission.npc.name : "User"}: ${m.content}`)
    .join("\n");

  try {
    const response = await anthropic.messages.parse({
      model: MODEL,
      max_tokens: 1024,
      output_config: { effort: "low", format: zodOutputFormat(FeedbackSchema) },
      system: `Você é um coach de inglês falado analisando uma simulação de negociação que o usuário perdeu por esgotar o número de falas permitido sem alcançar o objetivo: "${mission.userGoal}".\n\nAnalise a ESTRATÉGIA DE ARGUMENTAÇÃO em inglês (não a gramática). Responda what_worked e what_didnt em português (pt-BR); better_phrase deve ser uma frase concreta em inglês.`,
      messages: [{ role: "user", content: `Transcrição da conversa:\n${transcript}` }],
    });
    return (
      response.parsed_output ?? {
        what_worked: "Não foi possível gerar feedback detalhado desta vez.",
        what_didnt: "",
        better_phrase: "",
      }
    );
  } catch (err) {
    console.error("Fallback feedback failed:", err);
    return {
      what_worked: "Não foi possível gerar feedback detalhado desta vez.",
      what_didnt: "",
      better_phrase: "",
    };
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Missões de Conversação — server rodando em http://localhost:${PORT}`);
});
