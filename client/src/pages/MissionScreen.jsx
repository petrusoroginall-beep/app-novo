import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { fetchMission, sendTurn } from '../api.js'
import { saveMissionResult } from '../storage.js'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js'
import Transcript from '../components/Transcript.jsx'
import MicButton from '../components/MicButton.jsx'
import ProgressStrip from '../components/ProgressStrip.jsx'

// phase: 'loading' | 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
export default function MissionScreen() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const [mission, setMission] = useState(null)
  const [history, setHistory] = useState([])
  const [phase, setPhase] = useState('loading')
  const [progress, setProgress] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [textInput, setTextInput] = useState('')

  const speechRecognition = useSpeechRecognition()
  const speechSynthesis = useSpeechSynthesis()
  const hasSpokenOpening = useRef(false)

  useEffect(() => {
    let cancelled = false
    fetchMission(missionId)
      .then((data) => {
        if (cancelled) return
        setMission(data)
        setHistory([{ role: 'npc', text: data.openingLine }])
        setPhase('idle')
      })
      .catch((err) => {
        if (cancelled) return
        setErrorMessage(err.message)
        setPhase('error')
      })
    return () => {
      cancelled = true
    }
  }, [missionId])

  // Fala a linha de abertura assim que a missão carrega, uma única vez.
  useEffect(() => {
    if (mission && !hasSpokenOpening.current) {
      hasSpokenOpening.current = true
      setPhase('speaking')
      speechSynthesis.speak(mission.openingLine).then(() => setPhase('idle'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission])

  async function submitUserTurn(text) {
    const trimmed = text.trim()
    if (!trimmed) {
      setPhase('idle')
      return
    }

    const newHistory = [...history, { role: 'user', text: trimmed }]
    setHistory(newHistory)
    setPhase('thinking')
    setErrorMessage(null)

    try {
      const result = await sendTurn(missionId, newHistory)
      const historyWithReply = [...newHistory, { role: 'npc', text: result.npc_reply }]
      setHistory(historyWithReply)
      setProgress(result.progress)

      if (result.mission_status !== 'in_progress') {
        saveMissionResult(missionId, result.mission_status)
        speechSynthesis.speak(result.npc_reply).finally(() => {
          navigate(`/mission/${missionId}/result`, {
            state: { mission, history: historyWithReply, result },
          })
        })
        return
      }

      setPhase('speaking')
      await speechSynthesis.speak(result.npc_reply)
      setPhase('idle')
    } catch (err) {
      setErrorMessage(err.message)
      setPhase('idle')
    }
  }

  async function handleMicClick() {
    if (phase === 'idle') {
      speechSynthesis.cancel()
      speechRecognition.startListening()
      setPhase('listening')
      return
    }
    if (phase === 'listening') {
      const transcript = await speechRecognition.stopListening()
      await submitUserTurn(transcript)
    }
  }

  function handleTextSubmit(e) {
    e.preventDefault()
    const text = textInput
    setTextInput('')
    submitUserTurn(text)
  }

  if (phase === 'loading') {
    return <div className="screen state-message">Carregando missão...</div>
  }

  if (phase === 'error' && !mission) {
    return (
      <div className="screen state-message">
        Não foi possível carregar esta missão: {errorMessage}
        <br />
        <Link to="/">Voltar</Link>
      </div>
    )
  }

  const userTurnCount = history.filter((h) => h.role === 'user').length

  return (
    <div className="screen">
      <div className="topbar">
        <Link to="/" className="back-button" aria-label="Voltar">
          ←
        </Link>
        <h1>{mission.title}</h1>
      </div>

      <div className="mission-info">
        <span className="npc">
          {mission.npcName} — {mission.npcRole}
        </span>
        <span className="turn-counter">
          Turno {Math.min(userTurnCount, mission.maxTurns)} de {mission.maxTurns}
        </span>
      </div>

      <ProgressStrip progress={progress} />

      {!speechRecognition.isSupported && (
        <div className="banner">
          Seu navegador não suporta reconhecimento de voz (comum no Safari/iOS). Você ainda pode
          digitar sua resposta em inglês abaixo.
        </div>
      )}

      {errorMessage && <div className="banner">{errorMessage}</div>}

      <Transcript
        history={history}
        interimTranscript={phase === 'listening' ? speechRecognition.interimTranscript : ''}
      />

      {speechRecognition.isSupported ? (
        <MicButton state={phase} onClick={handleMicClick} disabled={phase === 'error'} />
      ) : (
        <form className="mic-area" onSubmit={handleTextSubmit}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your response in English..."
            disabled={phase === 'thinking' || phase === 'speaking'}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'inherit',
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            className="primary-button"
            style={{ margin: '10px 0 0', width: '100%' }}
            disabled={phase === 'thinking' || phase === 'speaking' || !textInput.trim()}
          >
            {phase === 'thinking' ? 'Pensando...' : phase === 'speaking' ? 'Falando...' : 'Enviar'}
          </button>
        </form>
      )}
    </div>
  )
}
