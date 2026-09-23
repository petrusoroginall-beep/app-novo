import Anthropic from "@anthropic-ai/sdk";

// Resolve a credencial automaticamente a partir de ANTHROPIC_API_KEY
// (definida no .env local ou nas Environment Variables do projeto na Vercel).
// Nunca chamada a partir do navegador.
export const anthropic = new Anthropic();

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
