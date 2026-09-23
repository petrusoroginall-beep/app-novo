import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { missions, missionsById } from "./missions/index.js";
import { anthropic, MODEL } from "./anthropicClient.js";
import { buildSystemPrompt } from "./promptBuilder.js";
import { TurnResponseSchema, FeedbackSchema } from "./turnSchema.js";

/**
 * Lógica de negócio pura (sem Express, sem Vercel), reaproveitada pelos dois
 * jeitos de rodar o backend:
 *   - server/src/index.js       -> Express, para rodar num computador local
 *   - client/api/missions*.js   -> funções serverless, para deploy na Vercel
 */

export function listMissions() {
  return missions.map((m) => ({
    id: m.id,
    title: m.title,
    difficulty: m.difficulty,
    context: m.context,
    npcName: m.npc.name,
    maxTurns: m.maxTurns,
  }));
}

export function getMissionDetail(id) {
  const mission = missionsById[id];
  if (!mission) return null;
  return {
    id: mission.id,
    title: mission.title,
    difficulty: mission.difficulty,
    context: mission.context,
    npcName: mission.npc.name,
    npcRole: mission.npc.role,
    maxTurns: mission.maxTurns,
    openingLine: mission.openingLine,
  };
}

// Retorna sempre { status, body } — quem chama (Express ou a função
// serverless) só precisa repassar isso como resposta HTTP.
export async function runTurn(missionId, history) {
  const mission = missionsById[missionId];
  if (!mission) {
    return { status: 404, body: { error: "Mission not found" } };
  }
  if (!Array.isArray(history) || history.length === 0) {
    return { status: 400, body: { error: "history is required" } };
  }
  const last = history[history.length - 1];
  if (!last || last.role !== "user") {
    return { status: 400, body: { error: "history must end with a user turn" } };
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
      output_config: { effort: "low", format: zodOutputFormat(TurnResponseSchema) },
      system: buildSystemPrompt(mission, userTurnNumber),
      messages,
    });

    let result = response.parsed_output;
    if (!result) {
      return { status: 502, body: { error: "Failed to parse model output" } };
    }

    // Trava de segurança: garante o limite de turnos mesmo que o modelo não
    // tenha seguido a instrução do prompt.
    if (userTurnNumber >= mission.maxTurns && result.mission_status === "in_progress") {
      result = { ...result, mission_status: "lost" };
      if (!result.feedback) {
        result.feedback = await generateFallbackFeedback(mission, messages);
      }
    }

    return { status: 200, body: result };
  } catch (err) {
    console.error(err);
    if (err instanceof Anthropic.AuthenticationError) {
      return {
        status: 500,
        body: { error: "ANTHROPIC_API_KEY ausente ou inválida no servidor." },
      };
    }
    if (err instanceof Anthropic.APIError) {
      return { status: 502, body: { error: `Erro da API da Anthropic: ${err.message}` } };
    }
    return { status: 500, body: { error: "Failed to get NPC response" } };
  }
}

// Usada só quando o limite de turnos é atingido e o modelo não gerou
// feedback (porque, na visão dele, a missão ainda estava em andamento).
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
