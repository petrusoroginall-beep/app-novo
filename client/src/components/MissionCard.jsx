import { Link } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge.jsx'

export default function MissionCard({ mission, result }) {
  return (
    <li>
      <Link className="mission-card" to={`/mission/${mission.id}`}>
        <div className="mission-card-top">
          <h2>{mission.title}</h2>
          <div className="mission-meta">
            {result && (
              <span className="badge badge-done">
                {result.status === 'won' ? '✓ concluída' : 'tentada'}
              </span>
            )}
            <DifficultyBadge difficulty={mission.difficulty} />
          </div>
        </div>
        <p>{mission.context}</p>
      </Link>
    </li>
  )
}
