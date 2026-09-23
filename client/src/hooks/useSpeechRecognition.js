import { useCallback, useEffect, useRef, useState } from 'react'

const SpeechRecognitionImpl =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

// Captura de voz via Web Speech API nativa do navegador (sem custo, sem
// chave de API). Suporte: bom no Chrome/Android; limitado ou ausente no
// Safari/iOS — ver aviso na tela da missão.
export function useSpeechRecognition() {
  const isSupported = Boolean(SpeechRecognitionImpl)
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)

  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const resolveRef = useRef(null)

  useEffect(() => {
    if (!isSupported) return undefined

    const recognition = new SpeechRecognitionImpl()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let interim = ''
      let final = finalTranscriptRef.current
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += (final ? ' ' : '') + transcript.trim()
        } else {
          interim += transcript
        }
      }
      finalTranscriptRef.current = final
      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (resolveRef.current) {
        resolveRef.current(finalTranscriptRef.current.trim())
        resolveRef.current = null
      }
    }

    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [isSupported])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return
    finalTranscriptRef.current = ''
    setInterimTranscript('')
    setError(null)
    setIsListening(true)
    recognitionRef.current.start()
  }, [isListening])

  // Resolve com a transcrição final assim que o reconhecimento efetivamente
  // parar (evento onend), não no momento em que stop() é chamado.
  const stopListening = useCallback(() => {
    return new Promise((resolve) => {
      if (!recognitionRef.current || !isListening) {
        resolve(finalTranscriptRef.current.trim())
        return
      }
      resolveRef.current = resolve
      recognitionRef.current.stop()
    })
  }, [isListening])

  return { isSupported, isListening, interimTranscript, error, startListening, stopListening }
}
