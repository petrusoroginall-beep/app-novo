const LABELS = {
  easy: 'Fácil',
  'easy-medium': 'Fácil-média',
  medium: 'Média',
  hard: 'Difícil',
}

export default function DifficultyBadge({ difficulty }) {
  const className = `badge badge-${difficulty}`
  return <span className={className}>{LABELS[difficulty] || difficulty}</span>
}
