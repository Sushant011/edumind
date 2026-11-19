// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  isSpeechRecognitionSupported, isSpeechSynthesisSupported,
  createRecognizer, speak, stopSpeak,
} from './speech.js'

afterEach(() => {
  delete window.SpeechRecognition
  delete window.webkitSpeechRecognition
  delete window.speechSynthesis
  delete globalThis.SpeechSynthesisUtterance
  vi.restoreAllMocks()
})

describe('speech guards without browser APIs', () => {
  it('reports unsupported', () => {
    expect(isSpeechRecognitionSupported()).toBe(false)
    expect(isSpeechSynthesisSupported()).toBe(false)
  })
  it('speak resolves false when unsupported', async () => {
    await expect(speak('नमस्ते')).resolves.toBe(false)
  })
  it('stopSpeak does not throw', () => {
    expect(() => stopSpeak()).not.toThrow()
  })
})

describe('createRecognizer with mocked SpeechRecognition', () => {
  class MockRecognition {
    constructor() {
      this.lang = ''
      this.interimResults = false
      this.continuous = false
      MockRecognition.last = this
    }
    start() { this.started = true }
    stop() { this.started = false }
    abort() { this.started = false }
  }

  it('configures Hindi recognition and forwards final results', () => {
    window.SpeechRecognition = MockRecognition
    const onResult = vi.fn()
    const rec = createRecognizer({ lang: 'hi-IN', onResult, onEnd: () => {}, onError: () => {} })
    expect(rec.lang).toBe('hi-IN')
    expect(rec.interimResults).toBe(true)
    expect(rec.continuous).toBe(false)
    rec.onresult({
      resultIndex: 0,
      results: [{ isFinal: true, 0: { transcript: 'मैं किसान हूँ' } }],
    })
    expect(onResult).toHaveBeenCalledWith({ interim: '', fin: 'मैं किसान हूँ' })
  })

  it('separates interim from final transcripts', () => {
    window.SpeechRecognition = MockRecognition
    const onResult = vi.fn()
    const rec = createRecognizer({ lang: 'hi-IN', onResult, onEnd: () => {}, onError: () => {} })
    rec.onresult({
      resultIndex: 0,
      results: [{ isFinal: false, 0: { transcript: 'मैं किसान' } }],
    })
    expect(onResult).toHaveBeenCalledWith({ interim: 'मैं किसान', fin: '' })
  })

  it('forwards end and error events', () => {
    window.SpeechRecognition = MockRecognition
    const onEnd = vi.fn()
    const onError = vi.fn()
    const rec = createRecognizer({ lang: 'hi-IN', onResult: () => {}, onEnd, onError })
    rec.onend()
    rec.onerror({ error: 'no-speech' })
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith({ error: 'no-speech' })
  })
})

describe('speak/stopSpeak with mocked synthesis', () => {
  function installVoices() {
    globalThis.SpeechSynthesisUtterance = class {
      constructor(text) { this.text = text }
    }
    window.speechSynthesis = {
      speak: vi.fn((u) => { if (u.onend) u.onend() }),
      cancel: vi.fn(),
      getVoices: () => [
        { lang: 'en-US', name: 'English' },
        { lang: 'hi-IN', name: 'Hindi' },
      ],
    }
  }

  it('speaks Hindi with the Hindi voice', async () => {
    installVoices()
    expect(isSpeechSynthesisSupported()).toBe(true)
    await expect(speak('नमस्ते')).resolves.toBe(true)
    const utter = window.speechSynthesis.speak.mock.calls[0][0]
    expect(utter.lang).toBe('hi-IN')
    expect(utter.text).toBe('नमस्ते')
    expect(utter.voice.lang).toBe('hi-IN')
  })

  it('stopSpeak cancels synthesis', () => {
    installVoices()
    stopSpeak()
    expect(window.speechSynthesis.cancel).toHaveBeenCalled()
  })
})
