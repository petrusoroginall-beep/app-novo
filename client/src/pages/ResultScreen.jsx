import { Link, useLocation, useParams } from 'react-router-dom'

const STATUS_CONTENT = {
  won: { icon: '🎉', title: 'Missão cumprida!', subtitle: 'Você conseguiu o que queria.' },
  lost: { icon: '💬', title: 'Não desta vez', subtitle: 'A missão terminou sem sucesso.' },
}

export default function ResultScreen() {
  const { missionId } = useParams()
  const location = useLocation()
  const state = location.state

  if (!state) {
    return (
      <div className="screen state-message">
        Resultado não encontrado (a página foi recarregada?).
        <br />
        <Link to="/">Voltar para as missões</Link>
      </div>
    )
  }

  const { mission, result } = state
  const content = STATUS_CONTENT[result.mission_status] || STATUS_CONTENT.lost
  const feedback = result.feedback

  return (
    <div className="screen">
      <div className="result-header">
        <div className="result-icon">{content.icon}</div>
        <h1 className="result-title">{content.title}</h1>
        <p className="result-subtitle">
          {mission.title} — {content.subtitle}
        </p>
      </div>

      {feedback ? (
        <div className="feedback-list">
          <div className="feedback-card">
            <h3>O que funcionou</h3>
            <p>{feedback.what_worked || '—'}</p>
          </div>
          <div className="feedback-card">
            <h3>O que não funcionou</h3>
            <p>{feedback.what_didnt || '—'}</p>
          </div>
          <div className="feedback-card phrase">
            <h3>Frase mais eficaz</h3>
            <p>"{feedback.better_phrase}"</p>
          </div>
        </div>
      ) : (
        <div className="state-message">Feedback não disponível para esta tentativa.</div>
      )}

      <Link className="primary-button" to="/">
        Voltar para as missões
      </Link>
      <Link className="primary-button" to={`/mission/${missionId}`} style={{ marginTop: -12 }}>
        Tentar novamente
      </Link>
    </div>
  )
}
