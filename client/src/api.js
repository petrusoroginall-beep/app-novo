// Todas as chamadas passam por /api, que o Vite (dev) redireciona para o
// backend em localhost:3001 (ver vite.config.js). Em produção, sirva o
// backend no mesmo domínio/porta ou ajuste esta base URL.

async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Erro ${res.status} ao chamar ${path}`)
  }
  return res.json()
}

export function fetchMissions() {
  return request('/missions')
}

export function fetchMission(missionId) {
  return request(`/missions/${missionId}`)
}

export function sendTurn(missionId, history) {
  return request(`/missions/${missionId}/turn`, {
    method: 'POST',
    body: JSON.stringify({ history }),
  })
}
