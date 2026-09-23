// Faixa fina no topo que reflete a última avaliação de progresso
// ("advancing" | "stagnant" | "losing") devolvida pelo backend a cada turno.
export default function ProgressStrip({ progress }) {
  const widthByProgress = { advancing: '100%', stagnant: '60%', losing: '25%' }
  return (
    <div className="progress-strip">
      {progress && (
        <div
          className={`progress-strip-fill progress-${progress}`}
          style={{ width: widthByProgress[progress] }}
        />
      )}
    </div>
  )
}
