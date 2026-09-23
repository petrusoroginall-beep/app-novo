import { z } from "zod";

// Formato estruturado que o Claude deve devolver a cada turno da missão.
// Combina, numa única chamada: a fala do NPC + a avaliação de progresso
// do usuário + (quando a missão termina) o feedback estratégico.
export const FeedbackSchema = z.object({
  what_worked: z
    .string()
    .describe("Em pt-BR: o que funcionou na argumentação do usuário em inglês."),
  what_didnt: z
    .string()
    .describe("Em pt-BR: o que não funcionou ou enfraqueceu o argumento do usuário."),
  better_phrase: z
    .string()
    .describe(
      "Em inglês: uma frase alternativa concreta que teria sido mais eficaz no momento decisivo.",
    ),
});

export const TurnResponseSchema = z.object({
  npc_reply: z
    .string()
    .describe("Fala do NPC em inglês, em 1 a 4 frases curtas, em primeira pessoa."),
  progress: z
    .enum(["advancing", "stagnant", "losing"])
    .describe("Avaliação da última fala do usuário em relação ao objetivo dele."),
  mission_status: z.enum(["in_progress", "won", "lost"]),
  feedback: FeedbackSchema.nullable().describe(
    "Preenchido somente quando mission_status é 'won' ou 'lost'. Caso contrário, null.",
  ),
});
