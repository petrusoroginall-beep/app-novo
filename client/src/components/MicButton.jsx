const ICON = {
  idle: '🎙️',
  listening: '⏹️',
  thinking: '…',
  speaking: '🔊',
}

const STATUS_TEXT = {
  idle: 'Toque para falar',
  listening: 'Ouvindo — toque para enviar',
  thinking: 'Pensando...',
  speaking: 'Falando...',
}

export default function MicButton({ state, onClick, disabled }) {
  const clickable = !disabled && (state === 'idle' || state === 'listening')
  return (
    <div className="mic-area">
      <button
        type="button"
        className="mic-button"
        data-state={state}
        onClick={onClick}
        disabled={!clickable}
        aria-label={STATUS_TEXT[state]}
      >
        {ICON[state]}
      </button>
      <div className="mic-status">{STATUS_TEXT[state]}</div>
    </div>
  )
}
