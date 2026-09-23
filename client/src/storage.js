// Progresso guardado localmente no navegador (sem login/servidor).
// Formato: { [missionId]: { status: 'won' | 'lost', lastPlayedAt: ISOString } }
const STORAGE_KEY = 'missoes-conversacao:progress'

export function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveMissionResult(missionId, status) {
  try {
    const progress = getProgress()
    progress[missionId] = { status, lastPlayedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // localStorage indisponível (modo privado etc.) — segue sem persistir
  }
}
