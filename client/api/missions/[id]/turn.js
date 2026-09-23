import { runTurn } from "../../_lib/missionService.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { history } = req.body || {};
  const { status, body } = await runTurn(req.query.id, history);
  res.status(status).json(body);
}
