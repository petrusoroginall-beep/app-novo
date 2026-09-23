import { useCallback, useEffect, useState } from 'react'

// Fala da IA via Web Speech API nativa do navegador (SpeechSynthesis) —
// sem custo, sem chave de API adicional.
export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(
    (text) => {
      return new Promise((resolve) => {
        if (!isSupported || !text) {
          resolve()
          return
        }
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US'
        utterance.rate = 1
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => {
          setIsSpeaking(false)
          resolve()
        }
        utterance.onerror = () => {
          setIsSpeaking(false)
          resolve()
        }
        window.speechSynthesis.speak(utterance)
      })
    },
    [isSupported],
  )

  const cancel = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel()
    }
  }, [isSupported])

  return { isSupported, isSpeaking, speak, cancel }
}
