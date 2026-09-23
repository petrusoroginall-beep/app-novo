import { useEffect, useState } from 'react'
import { fetchMissions } from '../api.js'
import { getProgress } from '../storage.js'
import MissionCard from '../components/MissionCard.jsx'

export default function HomeScreen() {
  const [missions, setMissions] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState({})

  useEffect(() => {
    setProgress(getProgress())
    fetchMissions()
      .then(setMissions)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="screen">
      <div className="home-header">
        <h1>Missões de Conversação</h1>
        <p>Convença, negocie ou resolva — só por falar inglês de verdade.</p>
      </div>

      {error && <div className="banner">Não foi possível carregar as missões: {error}</div>}

      {!missions && !error && <div className="state-message">Carregando missões...</div>}

      {missions && (
        <ul className="mission-list">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} result={progress[mission.id]} />
          ))}
        </ul>
      )}
    </div>
  )
}
