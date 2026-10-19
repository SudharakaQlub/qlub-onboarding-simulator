// Browser voice: speech out (speechSynthesis) and speech in (Web Speech recognition, Chrome/Edge/Safari).
// No AI model here. The voice agent can later replace these with a hosted voice.
import { useCallback, useEffect, useRef, useState } from 'react'

const KEY = 'qos.voice.v1'

export function loadVoiceOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}
export function saveVoiceOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    /* ignore */
  }
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string) {
  if (!canSpeak() || !text) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-AU'
    u.rate = 1.03
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang === 'en-AU') ??
      window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'))
    if (voice) u.voice = voice
    window.speechSynthesis.speak(u)
  } catch {
    /* speech unavailable */
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}

// Minimal typing for the Web Speech API (not in TypeScript's DOM lib).
interface Recognition {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start: () => void
  stop: () => void
}
type RecognitionCtor = new () => Recognition

function ctor(): RecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
export const canListen = () => typeof window !== 'undefined' && !!ctor()

/** One-shot listening: press the mic, say something, get the text. */
export function useListen(onText: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rec = useRef<Recognition | null>(null)
  const cb = useRef(onText)
  cb.current = onText

  const stop = useCallback(() => {
    rec.current?.stop()
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const C = ctor()
    if (!C) {
      setError('Voice input works in Chrome, Edge or Safari. Type instead.')
      return
    }
    stopSpeaking()
    const r = new C()
    r.lang = 'en-AU'
    r.interimResults = false
    r.continuous = false
    r.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript?.trim()
      if (text) cb.current(text)
    }
    r.onerror = (e) => setError(e.error === 'not-allowed' ? 'Microphone access was blocked. Allow it in the browser, or type instead.' : null)
    r.onend = () => setListening(false)
    rec.current = r
    setError(null)
    setListening(true)
    try {
      r.start()
    } catch {
      setListening(false)
    }
  }, [])

  useEffect(() => () => rec.current?.stop(), [])
  return { listening, start, stop, error, supported: canListen() }
}
