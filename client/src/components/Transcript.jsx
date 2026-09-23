import { useEffect, useRef } from 'react'

export default function Transcript({ history, interimTranscript }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [history, interimTranscript])

  return (
    <div className="transcript">
      {history.map((turn, i) => (
        <div
          key={i}
          className={`bubble ${turn.role === 'npc' ? 'bubble-npc' : 'bubble-user'}`}
        >
          {turn.text}
        </div>
      ))}
      {interimTranscript && <div className="bubble bubble-interim">{interimTranscript}</div>}
      <div ref={endRef} />
    </div>
  )
}
