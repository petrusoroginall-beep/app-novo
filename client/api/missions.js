import { listMissions } from "./_lib/missionService.js";

export default function handler(req, res) {
  res.status(200).json(listMissions());
}
