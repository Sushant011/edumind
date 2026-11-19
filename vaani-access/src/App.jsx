import React, { useCallback, useEffect, useRef, useState } from 'react'
import { fetchSchemes, backendInfo } from './lib/insforge.js'
import { fallbackSchemes } from './lib/fallbackSchemes.js'
import {
  scoreSchemes, buildVoiceReply, normalizeDialect, maskSensitive,
  DEMO_SENTENCES, DIALECT_TICKER, CATEGORY_LABEL, INTENT_LABEL, downloadChecklist,
} from './lib/matcher.js'
import {
  isSpeechRecognitionSupported, isSpeechSynthesisSupported,
  createRecognizer, speak, stopSpeak,
} from './lib/speech.js'

const scrollTo = (id) => {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null
  if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ================= Header ================= */
function Header({ online, soundOn, onToggleSound, bigText, onToggleBigText, onMic }) {
  return (
    <header className="header">
      <div className="header-inner">
        <a className="logo" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <span className="logo-mark">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
              <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
            </svg>
          </span>
          <span>
            <span className="logo-name">VaaniAccess</span>
            <br />
            <span className="logo-sub">वाणी एक्सेस • वॉइस योजना नेविगेटर</span>
          </span>
        </a>
        <nav className="nav">
          <a href="#console" onClick={(e) => { e.preventDefault(); scrollTo('console') }}>बोलो</a>
          <a href="#results" onClick={(e) => { e.preventDefault(); scrollTo('results') }}>नतीजे</a>
          <a href="#schemes" onClick={(e) => { e.preventDefault(); scrollTo('schemes') }}>योजनाएं</a>
          <a href="#how" onClick={(e) => { e.preventDefault(); scrollTo('how') }}>तरीका</a>
          <a href="#demo" onClick={(e) => { e.preventDefault(); scrollTo('demo') }}>लाइव डेमो</a>
        </nav>
        <div className="header-actions">
          <span className={`pill-ready ${online ? '' : 'off'}`} title={backendInfo.baseUrl || 'backend'}>
            <span className="dot" /> {online ? 'वॉइस तैयार' : 'ऑफ़लाइन'}
          </span>
          <button className="icon-btn" onClick={onToggleSound} title={soundOn ? 'आवाज़ बंद करें' : 'आवाज़ चालू करें'} aria-label={soundOn ? 'आवाज़ बंद करें' : 'आवाज़ चालू करें'} aria-pressed={soundOn}>
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button className={`icon-btn ${bigText ? '' : 'light'}`} onClick={onToggleBigText} title="बड़े अक्षर" aria-label="बड़े अक्षर मोड" aria-pressed={bigText}>
            T
          </button>
          <button className="btn btn-orange btn-sm" onClick={onMic} style={{ padding: '10px 16px' }}>
            🎙 बोलना शुरू करें
          </button>
        </div>
      </div>
    </header>
  )
}

/* ================= Hero ================= */
function Hero({ count, onMic }) {
  return (
    <section className="hero" id="top">
      <div className="hero-bg-word" aria-hidden="true">वाणी</div>
      <div className="wrap hero-grid">
        <div>
          <span className="badge">🔊 VOICE AI × ACCESSIBILITY • 100% हिंदी-फर्स्ट</span>
          <h1 className="hero-title">बोलो. जानो.<br /><span className="accent">पाओ.</span></h1>
          <div className="hero-sub">Speak. Discover. Receive.</div>
          <p className="hero-desc">
            फॉर्म का झंझट खत्म। अपनी बोली में बोलिए — <b>वाणी एक्सेस</b> आपकी बात
            समझकर सही सरकारी योजना बताएगा और <b>3 आसान कदम</b> हिंदी में बोलकर
            समझाएगा। किसान, छात्र, मज़दूर — सबके लिए।
          </p>
          <div className="hero-cta">
            <button className="btn btn-orange" onClick={onMic}>🎙 माइक दबाकर बोलें</button>
            <button className="btn btn-white" onClick={() => scrollTo('demo')}>▶ 60-सेकंड डेमो</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><b>{count}+</b><span>योजनाएं</span></div>
            <div className="stat"><b>10+</b><span>बोलियां</span></div>
            <div className="stat"><b>3</b><span>आसान कदम</span></div>
            <div className="stat"><b>₹0</b><span>बिना API key</span></div>
          </div>
          <div className="hero-tip">टिप: कीबोर्ड पर <kbd>M</kbd> दबाकर भी माइक चलाएं</div>
        </div>
        <div className="hero-visual">
          <div className="speech-bubble"><span className="waves">🎙</span> “मैं किसान हूँ…”</div>
          <div className="photo-card">
            <div className="tape" />
            <img src="/hero-family.jpg" alt="ग्रामीण परिवार वाणी एक्सेस से बोलकर योजना जान रहा है" fetchPriority="high" />
            <div className="photo-caption">हर घर तक — अपनी बोली में</div>
            <div className="photo-sub">hi-IN • Web Speech API</div>
          </div>
          <div className="match-chip">PM-KISAN • <b>पक्का मेल ✓</b></div>
        </div>
      </div>
    </section>
  )
}

/* ================= Dialect ticker ================= */
function Ticker() {
  const items = [...DIALECT_TICKER, ...DIALECT_TICKER]
  return (
    <div className="marquee-band" aria-hidden="true">
      <div className="marquee">
        {items.map(([d, s], i) => (
          <span key={i}><i>{d}</i> — {s}</span>
        ))}
      </div>
    </div>
  )
}

/* ================= Voice console ================= */
function VoiceConsole({ schemes, offline, soundOn, micNonce, queryNonce, onSpeakText }) {
  const [lang, setLang] = useState('hi-IN')
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [stage, setStage] = useState('idle') // idle|listening|matching|done
  const [result, setResult] = useState(null) // {intents, results, text}
  const [error, setError] = useState('')
  const [textInput, setTextInput] = useState('')
  const [history, setHistory] = useState([])
  const recRef = useRef(null)
  const firstMic = useRef(true)

  const supported = isSpeechRecognitionSupported()

  const runPipeline = useCallback((rawText, { autoSpeak } = {}) => {
    const masked = maskSensitive(rawText || '')
    const clean = masked.trim()
    if (!clean) {
      setError('कुछ सुनाई नहीं दिया — कृपया दोबारा बोलें या नीचे लिखें।')
      return
    }
    setError('')
    setHistory((h) => [clean, ...h.filter((x) => x !== clean)].slice(0, 4))
    setStage('matching')
    // Small delay so the "समझो" stage is visible
    setTimeout(() => {
      const scored = scoreSchemes(clean, schemes)
      setResult({ ...scored, text: clean })
      setStage('done')
      const reply = buildVoiceReply(scored.results[0], scored.intents)
      if ((autoSpeak ?? soundOnRef.current) && isSpeechSynthesisSupported()) {
        setStage('speaking')
        speak(reply).then(() => setStage('done'))
      }
    }, 450)
  }, [schemes])

  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn

  // External triggers: mic button / M key / demo buttons
  useEffect(() => {
    if (firstMic.current) { firstMic.current = false; return }
    startListening()
  }, [micNonce])

  const firstQuery = useRef(true)
  useEffect(() => {
    if (firstQuery.current) { firstQuery.current = false; return }
    if (queryNonce && queryNonce.text) {
      stopSpeak()
      setTranscript(queryNonce.text)
      setInterim('')
      runPipeline(queryNonce.text)
    }
  }, [queryNonce])

  // M key shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey) {
        const t = e.target
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
        e.preventDefault()
        startListening()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Cleanup recognizer on unmount
  useEffect(() => () => { try { recRef.current && recRef.current.abort() } catch { /* already stopped */ } }, [])

  function startListening() {
    if (!supported) {
      setError('यह ब्राउज़र वॉइस इनपुट नहीं देता (Chrome/Edge इस्तेमाल करें) — नीचे टेक्स्ट में लिखें।')
      return
    }
    if (listening) { try { recRef.current && recRef.current.stop() } catch { /* already stopped */ } return }
    setError('')
    stopSpeak()
    setTranscript('')
    setInterim('')
    setResult(null)
    try {
      const rec = createRecognizer({
        lang,
        onResult: ({ interim: im, fin }) => {
          if (im) setInterim(im)
          if (fin) {
            setTranscript((prev) => (prev ? prev + ' ' + fin : fin))
            setInterim('')
          }
        },
        onEnd: () => {
          setListening(false)
          setStage('idle')
          setTranscript((prev) => {
            const full = (prev || '').trim()
            if (full) setTimeout(() => runPipeline(full), 50)
            else setError('कोई आवाज़ सुनाई नहीं दी — दोबारा कोशिश करें या नीचे लिखें।')
            return prev
          })
        },
        onError: (e) => {
          setListening(false)
          setStage('idle')
          const code = (e && e.error) || ''
          if (code === 'not-allowed' || code === 'service-not-allowed') {
            setError('माइक की अनुमति नहीं मिली — ब्राउज़र में माइक चालू करें या नीचे टेक्स्ट लिखें।')
          } else if (code === 'no-speech') {
            setError('कोई आवाज़ सुनाई नहीं दी — माइक के पास बोलें और दोबारा कोशिश करें।')
          } else if (code !== 'aborted') {
            setError('वॉइस में दिक्कत आई — नीचे टेक्स्ट में लिखकर देखें।')
          }
        },
      })
      recRef.current = rec
      rec.start()
      setListening(true)
      setStage('listening')
    } catch {
      setError('माइक शुरू नहीं हो पाया — नीचे टेक्स्ट में लिखें।')
    }
  }

  const normalized = transcript ? normalizeDialect(transcript) : ''
  const showUnderstood = normalized && normalized !== transcript.trim()

  return (
    <section className="section" id="console">
      <div className="wrap">
        <div className="kicker">वॉइस-इन • वॉइस-आउट</div>
        <h2 className="section-title">अपनी बोली में पूछिए</h2>
        <p className="section-desc">
          माइक दबाएं, बोलें — जैसे “Main college student hoon” — बाकी काम वाणी एक्सेस करेगा।
        </p>

        <div className="console-card">
          <div className="console-top">
            <span className="console-title">🎙 वॉइस कंसोल</span>
            <div className="lang-tabs">
              {[
                ['hi-IN', 'हिन्दी'],
                ['hi-IN-hing', 'Hinglish'],
                ['en-IN', 'English'],
              ].map(([v, label]) => (
                <button
                  key={v}
                  className={`lang-tab ${lang === (v === 'hi-IN-hing' ? 'hi-IN' : v) ? 'active' : ''}`}
                  onClick={() => setLang(v === 'hi-IN-hing' ? 'hi-IN' : v)}
                  aria-pressed={lang === (v === 'hi-IN-hing' ? 'hi-IN' : v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="privacy-notes">
            <span className="privacy-note">🔒 आवाज़ डिवाइस पर ही रहती है — कोई रिकॉर्डिंग सेव नहीं होती</span>
            <span className="privacy-note">🛡 आधार / बैंक नंबर न बोलें — नंबर अपने-आप छिपा दिए जाते हैं</span>
          </div>

          <div className="pipeline">
            {[
              ['listening', '👂 सुनो'],
              ['matching', '🧠 समझो'],
              ['done', '📋 योजना'],
              ['speaking', '🔊 बोलो'],
            ].map(([key, label], i) => (
              <React.Fragment key={key}>
                {i > 0 && <span className="pipe-arrow">→</span>}
                <span className={`pipe-step ${stage === key ? 'on' : ''}`}>{label}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="mic-row">
            <button className={`mic-btn ${listening ? 'listening' : ''}`} onClick={startListening} aria-pressed={listening} aria-label={listening ? 'सुनना बंद करें' : 'माइक दबाएं और बोलें'}>
              <span className="mic-ic">{listening ? '⏹' : '🎙'}</span>
              <span>{listening ? 'सुन रहे हैं… दबाकर रोकें' : 'माइक दबाएं और बोलें'}</span>
            </button>
            <div className="transcript-box" role="status" aria-label="लाइव ट्रांसक्रिप्ट">
              <span className="transcript-label">लाइव ट्रांसक्रिप्ट</span>
              <div className="transcript-text">
                {transcript ? (
                  <>{maskSensitive(transcript)} {interim && <span className="interim">{maskSensitive(interim)}</span>}</>
                ) : interim ? (
                  <span className="interim">{maskSensitive(interim)}</span>
                ) : (
                  <span className="placeholder">यहाँ आपकी बोली लिखी दिखेगी… जैसे “मैं किसान हूँ, खेती के लिए पैसे चाहिए”</span>
                )}
              </div>
              {showUnderstood && (
                <div className="understood">✨ समझा गया: {maskSensitive(normalized)}</div>
              )}
              {result && result.intents.length > 0 && (
                <div className="intent-chips">
                  {result.intents.map((i) => (
                    <span className="intent-chip" key={i}>🎯 {INTENT_LABEL[i] || i}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-fallback">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textInput.trim()) {
                  setTranscript(textInput.trim())
                  runPipeline(textInput.trim())
                  setTextInput('')
                }
              }}
              placeholder="✍️ टेक्स्ट में लिखें — जैसे: मुझे पक्का घर बनाना है"
              aria-label="टेक्स्ट में लिखें"
            />
            <button
              className="btn btn-orange btn-sm"
              style={{ padding: '12px 20px' }}
              onClick={() => {
                if (!textInput.trim()) return
                setTranscript(textInput.trim())
                runPipeline(textInput.trim())
                setTextInput('')
              }}
            >
              योजना खोजें →
            </button>
          </div>

          {error && <div className="error-banner" role="alert">⚠️ {error}</div>}
          {!supported && (
            <div className="offline-banner" role="status">ℹ️ इस ब्राउज़र में वॉइस इनपुट नहीं है — ऊपर टेक्स्ट बॉक्स से काम चलाएं (सबसे अच्छा अनुभव Chrome/Edge में)।</div>
          )}
          {offline && (
            <div className="offline-banner" role="status">
              ⚠️ InsForge सर्वर से जुड़ नहीं पाया — सहेजी हुई offline सूची से नतीजे दिखा रहे हैं।{' '}
              <button className="mini-btn dark" style={{ marginLeft: 8, flex: 'none', padding: '6px 16px' }} onClick={() => window.location.reload()}>
                दोबारा जोड़ें ↻
              </button>
            </div>
          )}

          <div className="demo-title">बोलकर देखें — डेमो वाक्य (दबाते ही पूरा पाइपलाइन चलेगा)</div>
          <div className="demo-grid">
            {DEMO_SENTENCES.map((d, i) => (
              <button
                key={i}
                className="demo-chip"
                onClick={() => {
                  stopSpeak()
                  setTranscript(d.text)
                  setInterim('')
                  setError('')
                  runPipeline(d.text)
                  setTimeout(() => scrollTo('results'), 600)
                }}
              >
                <span className="q">“{d.text}”</span>
                <span className="t">{d.tag}</span>
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <>
              <div className="history-title">🕘 हाल के सवाल <span className="history-sub">(सिर्फ इस सत्र के लिए — कहीं सेव नहीं होते)</span></div>
              <div className="history-chips">
                {history.map((q) => (
                  <button key={q} className="history-chip" onClick={() => { stopSpeak(); setTranscript(q); setError(''); runPipeline(q) }}>
                    <span aria-hidden="true">↻ </span>{q}
                  </button>
                ))}
              </div>
            </>
          )}
          <div id="results" style={{ scrollMarginTop: 90 }} aria-live="polite">
            {result && (
              <Results result={result} onSpeakText={onSpeakText} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================= Results ================= */
function Results({ result, onSpeakText }) {
  const { results, text } = result
  if (!results || results.length === 0) {
    return (
      <div className="results">
        <div className="no-match">
          😕 <b>“{maskSensitive(text)}”</b> से कोई पक्का मेल नहीं मिला।<br />
          सुझाव: <b>किसान</b> • <b>छात्रवृत्ति</b> • <b>इलाज</b> • <b>पक्का घर</b> • <b>गैस</b> • <b>मज़दूरी</b> जैसे
          शब्दों के साथ दोबारा बोलें — या नीचे योजना लाइब्रेरी में खुद खोजें।{' '}
          <button className="btn btn-white btn-sm" style={{ marginTop: 8 }} onClick={() => scrollTo('schemes')}>
            📚 लाइब्रेरी खोलें
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="results">
      {results.map((r, i) => {
        const s = r.scheme
        const steps = s.steps_hi || s.steps || []
        const docs = s.documents_hi || s.documents || []
        const elig = s.eligibility_hi || s.eligibility || []
        return (
          <article className={`result-card ${i === 0 ? 'top' : ''}`} key={s.id || s.slug || i}>
            <div className="result-head">
              <span className="result-rank">{i + 1}</span>
              <div>
                <div className="result-name">{s.name}</div>
                <div className="result-en">{s.name_en} • {s.category_hi || CATEGORY_LABEL[s.category]}</div>
              </div>
              <span className={`level-badge ${r.level === 'पक्का मेल' ? '' : r.level === 'अच्छा मेल' ? 'good' : 'maybe'}`}>
                {r.level === 'पक्का मेल' ? '✓ ' : ''}{r.level}
              </span>
            </div>
            {r.reasons.length > 0 && (
              <div className="why-box">
                <b>💡 यह योजना क्यों?</b>
                <ul>{r.reasons.map((x, j) => <li key={j}>{x}</li>)}</ul>
              </div>
            )}
            <div className="result-grid">
              <div className="result-block">
                <h4>✅ पात्रता</h4>
                <ul>{elig.slice(0, 3).map((e, j) => <li key={j}>{e}</li>)}</ul>
              </div>
              <div className="result-block">
                <h4>📄 कागज़</h4>
                <ul>{docs.slice(0, 4).map((e, j) => <li key={j}>{e}</li>)}</ul>
              </div>
              <div className="result-block">
                <h4>👣 3 आसान कदम</h4>
                <ul>{steps.slice(0, 3).map((e, j) => <li key={j}>{e}</li>)}</ul>
              </div>
            </div>
            <div className="result-foot">
              <span className="benefit-tag">🎁 {s.benefit}</span>
              {s.helpline && <span className="helpline-tag">📞 {s.helpline}</span>}
              <span style={{ flex: 1 }} />
              <button className="btn btn-white btn-sm" onClick={() => onSpeakText(s)}>🔊 सुनें</button>
              <button className="btn btn-white btn-sm" onClick={() => downloadChecklist(s)}>⬇ चेकलिस्ट</button>
              {s.official_url ? (
                <a className="btn btn-orange btn-sm" href={s.official_url} target="_blank" rel="noreferrer">
                  🏛 Official Website पर आवेदन ↗
                </a>
              ) : (
                <span className="btn btn-white btn-sm" style={{ opacity: 0.6 }}>सत्यापित लिंक उपलब्ध नहीं</span>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

/* ================= How it works ================= */
function HowItWorks() {
  return (
    <section className="section alt" id="how">
      <div className="wrap">
        <div className="kicker">कैसे काम करता है</div>
        <h2 className="section-title">बोली से योजना तक — 3 कदम</h2>
        <p className="section-desc">कोई फॉर्म नहीं, कोई दफ्तर के चक्कर नहीं। सिर्फ बोलिए और समझिए।</p>
        <div className="steps3">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>🎙 बोलिए अपनी बोली में</h3>
            <p>Web Speech API (hi-IN) आपकी हिंदी, हिंग्लिश या बोली — भोजपुरी, हरियाणवी, राजस्थानी — सब सुनता है। कोई टाइपिंग नहीं।</p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>🧠 हम समझते हैं मतलब</h3>
            <p>“हम किसान हईं”, “main majdoor hoon”, “फीस चाहिए” — बोलचाल के शब्द पात्रता (eligibility) से अपने-आप जुड़ते हैं।</p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>🔊 सुनिए 3 आसान कदम</h3>
            <p>सबसे सही योजना चुनकर हिंदी में बोलकर बताते हैं — क्या करना है, कौन-से कागज़, कहाँ जाना है। चेकलिस्ट भी डाउनलोड करें।</p>
          </div>
        </div>
        <div className="map-title">बोली → पात्रता मैपिंग (dialect-adaptive)</div>
        <div className="map-grid">
          {[
            ['“हम किसान हईं, फसल खातिर पैसा चाही”', 'किसान • पैसे की ज़रूरत', 'PM-KISAN + KCC'],
            ['“Main college student hoon, fees problem”', 'विद्यार्थी • फीस', 'National Scholarship'],
            ['“म्हे मज़ूरी करूँ, गांव में काम चाहिए”', 'मज़दूर • रोज़गार', 'MGNREGA जॉब कार्ड'],
          ].map(([said, need, got], i) => (
            <div className="map-card" key={i}>
              <div className="said">{said}</div>
              <div className="arrow">↓</div>
              <div className="got"><span>{need}</span><b>→ {got}</b></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================= Scheme library ================= */
const FILTERS = [
  ['all', 'सभी'],
  ['farmer', 'किसान'],
  ['education', 'शिक्षा'],
  ['health', 'स्वास्थ्य'],
  ['housing', 'आवास'],
  ['women-child', 'महिला-बेटी'],
  ['employment', 'रोज़गार'],
  ['business-loan', 'व्यापार-लोन'],
  ['pension', 'पेंशन'],
  ['bank-account', 'बैंक-खाता'],
  ['insurance', 'बीमा'],
  ['food', 'राशन'],
  ['energy', 'ऊर्जा'],
]

function SchemeLibrary({ schemes, loading, offline, onOpen, onSpeakText }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')

  const counts = {}
  schemes.forEach((s) => { counts[s.category] = (counts[s.category] || 0) + 1 })

  const list = schemes.filter((s) => {
    if (filter !== 'all' && s.category !== filter) return false
    if (q.trim()) {
      const t = ((s.name || '') + ' ' + (s.name_en || '') + ' ' + (s.description_hi || '')).toLowerCase()
      if (!t.includes(q.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <section className="section" id="schemes">
      <div className="wrap">
        <div className="kicker">योजना लाइब्रेरी</div>
        <h2 className="section-title">{schemes.length} योजनाएं — एक ही जगह</h2>
        <p className="section-desc">खोजें, छांटें, किसी भी योजना को बोलकर सुनें या चेकलिस्ट लें।</p>
        <div className="search-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 खोजें — जैसे: किसान, स्कॉलरशिप, गैस, पेंशन…"
            aria-label="योजना खोजें"
          />
        </div>
        <div className="filter-bar">
          {FILTERS.map(([v, label]) => (
            <button
              key={v}
              className={`filter-btn ${filter === v ? 'active' : ''}`}
              onClick={() => setFilter(v)}
              aria-pressed={filter === v}
            >
              {label} ({v === 'all' ? schemes.length : counts[v] || 0})
            </button>
          ))}
        </div>
        {loading ? (
          <div className="library-loading">⏳ InsForge से योजनाएं ला रहे हैं…</div>
        ) : list.length === 0 ? (
          <div className="library-empty">😕 कोई योजना नहीं मिली — खोज या फ़िल्टर बदलकर देखें।</div>
        ) : (
          <div className="scheme-grid">
            {list.map((s) => (
              <article className="scheme-card" key={s.id || s.slug}>
                <span className="scheme-cat">{s.category_hi || CATEGORY_LABEL[s.category] || s.category}</span>
                <h3>{s.name}</h3>
                <p>{s.description_hi || s.description}</p>
                <span className="scheme-benefit">🎁 {s.benefit}</span>
                <div className="scheme-actions">
                  <button className="mini-btn" onClick={() => onSpeakText(s)}>🔊 सुनें</button>
                  <button className="mini-btn" onClick={() => downloadChecklist(s)}>⬇ सूची</button>
                  <button className="mini-btn dark" onClick={() => onOpen(s)} aria-haspopup="dialog">विवरण →</button>
                </div>
              </article>
            ))}
          </div>
        )}
        {offline && !loading && (
          <div className="offline-banner" role="status">⚠️ Backend offline — सहेजी हुई सूची दिखा रहे हैं।</div>
        )}
      </div>
    </section>
  )
}

/* ================= Scheme modal ================= */
function SchemeModal({ scheme: s, onClose, onSpeakText }) {
  const modalRef = useRef(null)
  useEffect(() => {
    if (modalRef.current) modalRef.current.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && modalRef.current) {
        const items = modalRef.current.querySelectorAll('a[href], button:not([disabled])')
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])
  if (!s) return null
  const elig = s.eligibility_hi || s.eligibility || []
  const docs = s.documents_hi || s.documents || []
  const steps = s.steps_hi || s.steps || []
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={s.name} onClick={(e) => e.stopPropagation()}>
        <span className="scheme-cat">{s.category_hi || CATEGORY_LABEL[s.category]}</span>
        <h2>{s.name}</h2>
        <div className="en">{s.name_en}</div>
        <p>{s.description_hi || s.description}</p>
        <p style={{ marginTop: 8 }}><span className="benefit-tag">🎁 {s.benefit}</span></p>
        {s.helpline && <p style={{ marginTop: 6, fontWeight: 700 }}>📞 हेल्पलाइन: {s.helpline}</p>}
        <div className="modal-sec">
          <h4>✅ पात्रता</h4>
          <ul>{elig.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
        <div className="modal-sec">
          <h4>📄 जरूरी कागज़</h4>
          <ul>{docs.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
        <div className="modal-sec">
          <h4>👣 आवेदन के कदम</h4>
          <ul>{steps.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
        <div className="modal-actions">
          {s.official_url ? (
            <a className="btn btn-orange btn-sm" href={s.official_url} target="_blank" rel="noreferrer">
              🏛 Official Website पर आवेदन ↗
            </a>
          ) : (
            <span className="btn btn-white btn-sm" style={{ opacity: 0.6 }}>सत्यापित लिंक उपलब्ध नहीं</span>
          )}
          <button className="btn btn-white btn-sm" onClick={() => onSpeakText(s)}>🔊 सुनें</button>
          <button className="btn btn-white btn-sm" onClick={() => downloadChecklist(s)}>⬇ चेकलिस्ट</button>
          <button className="btn btn-white btn-sm" onClick={onClose}>✕ बंद करें</button>
        </div>
      </div>
    </div>
  )
}

/* ================= Demo script ================= */
function DemoScript({ onRunDemo }) {
  return (
    <section className="demo-band" id="demo">
      <div className="wrap section">
        <div className="kicker">60–90 सेकंड लाइव डेमो</div>
        <h2 className="section-title" style={{ color: '#fff6e9' }}>जजों के लिए डेमो स्क्रिप्ट</h2>
        <p className="section-desc">बस एक बटन दबाएं — या खुद माइक में बोलें। यही पूरा MVP है।</p>
        <div className="demo-steps">
          {[
            ['माइक दबाएं', 'वॉइस कंसोल पर बड़ा नारंगी माइक दबाएं (या M दबाएं)। Chrome में hi-IN पहचान अपने-आप चलेगी।'],
            ['बोलें: “Main college student hoon”', 'फीस-छात्रवृत्ति वाली पंक्ति बोलें। लाइव ट्रांसक्रिप्ट में शब्द दिखेंगे।'],
            ['मैच देखें', 'National Scholarship “पक्का मेल” के साथ ऊपर आएगी — पात्रता, 3 कदम, कागज़, हेल्पलाइन सहित।'],
            ['हिंदी में सुनें', 'ऑटो-बोल चालू हो तो 3 कदम अपने-आप सुनाई देंगे। फिर चेकलिस्ट डाउनलोड करके दिखाएं।'],
          ].map(([h, p], i) => (
            <div className="demo-step" key={i}>
              <div className="n">{i + 1}</div>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div className="demo-cta-box">
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3>एक क्लिक में पूरा डेमो चलाएं</h3>
            <p>“Main college student hoon, fees ke liye scholarship chahiye” — मैच + हिंदी वॉइस जवाब अपने-आप।</p>
          </div>
          <button className="btn" style={{ background: '#241a12', color: '#fff' }} onClick={onRunDemo}>
            ▶ डेमो चलाएं
          </button>
        </div>
        <div className="voice-trio">
          <span>🎙 वॉइस-इन</span>
          <span>🧠 स्मार्ट मैच</span>
          <span>🔊 वॉइस-आउट</span>
        </div>
      </div>
    </section>
  )
}

/* ================= Footer ================= */
function Footer({ online }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-card">
            <h3>♿ पहुंच (Accessibility)</h3>
            <p>बड़े अक्षर मोड, टेक्स्ट फॉलबैक, कीबोर्ड शॉर्टकट, high-contrast कार्ड — कम पढ़े-लिखे व बुज़ुर्गों के लिए।</p>
          </div>
          <div className="footer-card">
            <h3>💸 बिना API key, मुफ़्त</h3>
            <p>सिर्फ Web Speech API (SpeechRecognition + SpeechSynthesis)। InsForge Postgres backend — कोई सर्वर खर्च नहीं।</p>
          </div>
          <div className="footer-card">
            <h3>🚀 स्केल का रास्ता</h3>
            <p>आगे: ज़्यादा बोलियां व योजनाएं, IVR/WhatsApp बॉट, location-aware मैचिंग और एडमिन डैशबोर्ड।</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>🎙 VaaniAccess — बोलो, जानो, पाओ • Dialect-Adaptive Public Scheme Voice Navigator</span>
          <span>{online ? '🟢 Backend: InsForge Postgres connected' : '🟡 Backend: offline snapshot'} • आवाज़ डिवाइस पर ही • कोई रिकॉर्डिंग सेव नहीं</span>
        </div>
      </div>
    </footer>
  )
}

/* ================= App ================= */
export default function App() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [bigText, setBigText] = useState(false)
  const [selected, setSelected] = useState(null)
  const [micNonce, setMicNonce] = useState(0)
  const [queryNonce, setQueryNonce] = useState(null)

  useEffect(() => {
    document.body.classList.toggle('big-text', bigText)
  }, [bigText])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchSchemes()
        if (cancelled) return
        if (data && data.length > 0) {
          setSchemes(data)
          setOffline(false)
        } else {
          setSchemes(fallbackSchemes)
          setOffline(true)
        }
      } catch {
        if (!cancelled) {
          setSchemes(fallbackSchemes)
          setOffline(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const triggerMic = useCallback(() => {
    scrollTo('console')
    setTimeout(() => setMicNonce((n) => n + 1), 450)
  }, [])

  const runDemo = useCallback(() => {
    scrollTo('console')
    setTimeout(() => {
      setQueryNonce({ text: DEMO_SENTENCES[0].text, at: Date.now() })
      setTimeout(() => scrollTo('results'), 900)
    }, 450)
  }, [])

  const speakScheme = useCallback((s) => {
    if (!isSpeechSynthesisSupported()) return
    const steps = s.steps_hi || s.steps || []
    const text = `${s.name}। लाभ: ${s.benefit || ''}। पहला कदम: ${steps[0] || ''}। आवेदन के लिए स्क्रीन पर दिए गए official link पर जाइए।`
    speak(text)
  }, [])

  useEffect(() => {
    if (!soundOn) stopSpeak()
  }, [soundOn])

  return (
    <>
      <a className="skip-link" href="#console" onClick={(e) => { e.preventDefault(); scrollTo('console') }}>मुख्य सामग्री पर जाएं ↓</a>
      <Header
        online={!offline && !loading}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((v) => !v)}
        bigText={bigText}
        onToggleBigText={() => setBigText((v) => !v)}
        onMic={triggerMic}
      />
      <main>
      <Hero count={schemes.length || 15} onMic={triggerMic} />
      <Ticker />
      <VoiceConsole
        schemes={schemes}
        offline={offline}
        soundOn={soundOn}
        micNonce={micNonce}
        queryNonce={queryNonce}
        onSpeakText={speakScheme}
      />
      <HowItWorks />
      <SchemeLibrary
        schemes={schemes}
        loading={loading}
        offline={offline}
        onOpen={setSelected}
        onSpeakText={speakScheme}
      />
      <DemoScript onRunDemo={runDemo} />
      </main>
      <Footer online={!offline && !loading} />
      {selected && (
        <SchemeModal scheme={selected} onClose={() => setSelected(null)} onSpeakText={speakScheme} />
      )}
    </>
  )
}
