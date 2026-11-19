// Web Speech API helpers — SpeechRecognition (hi-IN) + SpeechSynthesis (Hindi)

export function isSpeechRecognitionSupported() {
  return Boolean(
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  )
}

export function isSpeechSynthesisSupported() {
  return Boolean(typeof window !== 'undefined' && 'speechSynthesis' in window)
}

/** Create a Hindi speech recognizer. Returns { rec, start, stop } */
export function createRecognizer({ lang = 'hi-IN', onResult, onEnd, onError }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  const rec = new SR()
  rec.lang = lang
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1
  rec.onresult = (e) => {
    let interim = ''
    let fin = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript
      if (e.results[i].isFinal) fin += t
      else interim += t
    }
    onResult && onResult({ interim, fin })
  }
  rec.onend = () => onEnd && onEnd()
  rec.onerror = (e) => onError && onError(e)
  return rec
}

function pickHindiVoice() {
  try {
    const voices = window.speechSynthesis.getVoices() || []
    return (
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('hi')) ||
      voices.find((v) => /hindi|india/i.test(v.name)) ||
      null
    )
  } catch {
    return null
  }
}

/** Speak Hindi text. Never used for URLs — only short instructions. */
export function speak(text, { rate = 0.95, pitch = 1 } = {}) {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) return resolve(false)
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'hi-IN'
      u.rate = rate
      u.pitch = pitch
      const v = pickHindiVoice()
      if (v) u.voice = v
      u.onend = () => resolve(true)
      u.onerror = () => resolve(false)
      window.speechSynthesis.speak(u)
      // Safety: resolve anyway after 30s
      setTimeout(() => resolve(true), 30000)
    } catch {
      resolve(false)
    }
  })
}

export function stopSpeak() {
  try {
    window.speechSynthesis && window.speechSynthesis.cancel()
  } catch {
    /* speech synthesis unavailable */
  }
}
