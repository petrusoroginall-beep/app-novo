import { getMissionDetail } from "../_lib/missionService.js";

export default function handler(req, res) {
  const mission = getMissionDetail(req.query.id);
  if (!mission) {
    res.status(404).json({ error: "Mission not found" });
    return;
  }
  res.status(200).json(mission);
}
