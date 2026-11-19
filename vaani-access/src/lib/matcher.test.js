import { describe, it, expect } from 'vitest'
import {
  detectIntents, normalizeDialect, maskSensitive, scoreSchemes,
  buildVoiceReply, DEMO_SENTENCES,
} from './matcher.js'
import { fallbackSchemes } from './fallbackSchemes.js'
import { isSpeechRecognitionSupported, isSpeechSynthesisSupported } from './speech.js'

// ---------- Intent detection: Hindi + Hinglish + dialects ----------
describe('detectIntents', () => {
  it('detects farmer from Hindi', () => {
    expect(detectIntents('मैं किसान हूँ, खेती के लिए पैसे चाहिए')).toContain('farmer')
  })
  it('detects student from Hinglish', () => {
    expect(detectIntents('Main college student hoon, fees problem')).toContain('student')
  })
  it('detects farmer from Bhojpuri', () => {
    expect(detectIntents('हम किसान हईं, फसल खातिर पैसा चाही')).toContain('farmer')
  })
  it('detects employment from Rajasthani/Haryanvi mix', () => {
    expect(detectIntents('म्हे मज़ूरी करूँ, गांव में काम चाहिए')).toContain('employment')
  })
  it('detects health from Hinglish', () => {
    expect(detectIntents('Mujhe bimari ke liye muft ilaj chahiye')).toContain('health')
  })
  it('detects women + savings for daughter', () => {
    const found = detectIntents('मेरी बेटी के लिए बचत करना है')
    expect(found).toContain('women')
    expect(found).toContain('savings')
  })
  it('detects banking for Jan-Dhan', () => {
    expect(detectIntents('मुझे जनधन खाता खोलना है')).toContain('banking')
  })
  it('detects pension', () => {
    expect(detectIntents('बुढ़ापे के लिए पेंशन चाहिए')).toContain('pension')
  })
  it('detects housing', () => {
    expect(detectIntents('Mujhe pakka ghar banana hai')).toContain('housing')
  })
  it('detects insurance for crop loss', () => {
    expect(detectIntents('सूखे से फसल खराब, मुआवजा चाहिए')).toContain('insurance')
  })
  it('detects food for ration queries', () => {
    expect(detectIntents('UP me naya ration card banana hai')).toContain('food')
  })
  it('detects energy for solar/bijli queries', () => {
    expect(detectIntents('Bijli bill bahut aata hai, solar lagwana hai')).toContain('energy')
  })
  it('returns empty for gibberish', () => {
    expect(detectIntents('asdf qwerty zxcv')).toEqual([])
  })
})

// ---------- Dialect normalization ----------
describe('normalizeDialect', () => {
  it('normalizes Bhojpuri verb forms', () => {
    expect(normalizeDialect('हम किसान हईं, फसल खातिर पैसा चाही'))
      .toBe('हम किसान हूँ, फसल के लिए पैसा चाहिए')
  })
  it('normalizes Rajasthani pronouns', () => {
    expect(normalizeDialect('म्हे मज़ूरी करूँ')).toContain('मैं')
  })
  it('normalizes Roman Hinglish pronouns', () => {
    expect(normalizeDialect('Main student hoon')).toContain('मैं')
  })
  it('leaves standard Hindi untouched', () => {
    const s = 'मैं किसान हूँ, खेती के लिए पैसे चाहिए'
    expect(normalizeDialect(s)).toBe(s)
  })
  it('handles empty input', () => {
    expect(normalizeDialect('')).toBe('')
  })
})

// ---------- Privacy masking ----------
describe('maskSensitive', () => {
  it('masks spaced Aadhaar numbers', () => {
    expect(maskSensitive('mera aadhaar 1234 5678 9012 hai'))
      .toBe('mera aadhaar XXXX-XXXX-XXXX hai')
  })
  it('masks 10-digit mobile numbers', () => {
    const out = maskSensitive('call me 9876543210')
    expect(out).not.toContain('9876543210')
  })
  it('masks long bank account numbers', () => {
    const out = maskSensitive('khata 12345678901234')
    expect(out).not.toContain('12345678901234')
  })
  it('leaves normal text untouched', () => {
    const s = 'मैं किसान हूँ'
    expect(maskSensitive(s)).toBe(s)
  })
})

// ---------- Recommendation engine ----------
describe('scoreSchemes', () => {
  const top = (q) => scoreSchemes(q, fallbackSchemes).results[0]

  it('matches student query → National Scholarship (पक्का मेल)', () => {
    const r = top(DEMO_SENTENCES[0].text)
    expect(r.scheme.slug).toBe('national-scholarship')
    expect(r.level).toBe('पक्का मेल')
  })
  it('matches farmer query → PM-KISAN', () => {
    expect(top(DEMO_SENTENCES[1].text).scheme.slug).toBe('pm-kisan')
  })
  it('matches housing query → PMAY-G', () => {
    expect(top(DEMO_SENTENCES[2].text).scheme.slug).toBe('pm-awas-gramin')
  })
  it('matches daughter query → Sukanya', () => {
    expect(top(DEMO_SENTENCES[3].text).scheme.slug).toBe('sukanya-samriddhi')
  })
  it('matches labourer query → MGNREGA', () => {
    expect(top(DEMO_SENTENCES[4].text).scheme.slug).toBe('mgnrega-job-card')
  })
  it('matches health query → Ayushman', () => {
    expect(top(DEMO_SENTENCES[5].text).scheme.slug).toBe('ayushman-bharat')
  })
  it('matches tailor query → Mudra Shishu', () => {
    expect(top(DEMO_SENTENCES[6].text).scheme.slug).toBe('pm-mudra-shishu')
  })
  it('matches gas query → Ujjwala', () => {
    expect(top(DEMO_SENTENCES[7].text).scheme.slug).toBe('pm-ujjwala')
  })
  it('matches ration-card demo → UP Ration Card', () => {
    expect(top(DEMO_SENTENCES[8].text).scheme.slug).toBe('up-ration-card')
  })
  it('matches solar demo → PM Surya Ghar', () => {
    expect(top(DEMO_SENTENCES[9].text).scheme.slug).toBe('pm-surya-ghar')
  })
  it('matches street-vendor query → SVANidhi (not Mudra)', () => {
    expect(top('Main rehdi lagata hoon, thele ke liye loan chahiye').scheme.slug).toBe('pm-svanidhi')
  })
  it('matches shramik query → e-Shram', () => {
    expect(top('Main shramik hoon, eshram card banana hai').scheme.slug).toBe('eshram-card')
  })
  it('matches pregnancy query → Matru Vandana', () => {
    expect(top('Meri patni garbhvati hai, paise milenge?').scheme.slug).toBe('pm-matu-vandana')
  })
  it('matches internship query → PM Internship', () => {
    expect(top('Main 12th pass hoon, company me internship chahiye').scheme.slug).toBe('pm-internship')
  })
  it('matches cheap-medicine query → Jan Aushadhi', () => {
    expect(top('Mujhe sasti dawa chahiye').scheme.slug).toBe('jan-aushadhi')
  })
  it('matches senior-citizen query → Vaya Vandana (not Ayushman)', () => {
    expect(top('70 saal ke pitaji ke liye muft ilaj chahiye').scheme.slug).toBe('vaya-vandana')
  })
  it('matches solar-pump query → PM-KUSUM (not Surya Ghar)', () => {
    expect(top('Khet me solar pump lagwana hai').scheme.slug).toBe('pm-kusum')
  })
  it('returns no results for gibberish', () => {
    expect(scoreSchemes('asdf qwerty zxcv', fallbackSchemes).results).toEqual([])
  })
  it('returns max 3 ranked results with reasons', () => {
    const { results } = scoreSchemes(DEMO_SENTENCES[0].text, fallbackSchemes)
    expect(results.length).toBeLessThanOrEqual(3)
    expect(results[0].reasons.length).toBeGreaterThan(0)
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })
  it('is deterministic — same query, same ranking', () => {
    const a = scoreSchemes('मैं किसान हूँ', fallbackSchemes).results.map((r) => r.scheme.slug)
    const b = scoreSchemes('मैं किसान हूँ', fallbackSchemes).results.map((r) => r.scheme.slug)
    expect(a).toEqual(b)
  })
})

// ---------- Voice reply builder ----------
describe('buildVoiceReply', () => {
  it('names the scheme and points to on-screen link', () => {
    const top = scoreSchemes(DEMO_SENTENCES[0].text, fallbackSchemes).results[0]
    const reply = buildVoiceReply(top, ['student'])
    expect(reply).toContain(top.scheme.name)
    expect(reply).toContain('official link')
  })
  it('never contains a URL', () => {
    const top = scoreSchemes(DEMO_SENTENCES[1].text, fallbackSchemes).results[0]
    expect(buildVoiceReply(top, ['farmer'])).not.toMatch(/https?:\/\//)
  })
  it('gives a helpful retry message when nothing matches', () => {
    const reply = buildVoiceReply(null, [])
    expect(reply).toContain('माफ कीजिए')
    expect(reply).toContain('दोबारा')
  })
})

// ---------- Data integrity: 33 schemes ----------
describe('fallbackSchemes (offline snapshot)', () => {
  it('has exactly 33 schemes', () => {
    expect(fallbackSchemes).toHaveLength(33)
  })
  it('every scheme has complete UI fields', () => {
    for (const s of fallbackSchemes) {
      expect(s.name, `${s.slug}: name`).toBeTruthy()
      expect(s.category_hi, `${s.slug}: category`).toBeTruthy()
      expect(s.benefit, `${s.slug}: benefit`).toBeTruthy()
      expect(s.official_url, `${s.slug}: url`).toMatch(/^https:\/\//)
      expect(s.helpline, `${s.slug}: helpline`).toBeTruthy()
      expect(s.steps_hi.length, `${s.slug}: steps`).toBeGreaterThanOrEqual(3)
      expect(s.eligibility_hi.length, `${s.slug}: eligibility`).toBeGreaterThanOrEqual(2)
      expect(s.documents_hi.length, `${s.slug}: documents`).toBeGreaterThanOrEqual(2)
      expect(s.keywords.length, `${s.slug}: keywords`).toBeGreaterThan(0)
      expect(s.intents.length, `${s.slug}: intents`).toBeGreaterThan(0)
    }
  })
  it('covers the new insurance/food/energy categories', () => {
    const cats = new Set(fallbackSchemes.map((st) => st.category))
    expect(cats.has('insurance')).toBe(true)
    expect(cats.has('food')).toBe(true)
    expect(cats.has('energy')).toBe(true)
  })
  it('slugs are unique', () => {
    const slugs = fallbackSchemes.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

// ---------- Speech API guards (safe in non-browser env) ----------
describe('speech guards', () => {
  it('report unsupported outside a browser without crashing', () => {
    expect(isSpeechRecognitionSupported()).toBe(false)
    expect(isSpeechSynthesisSupported()).toBe(false)
  })
})

describe('edge cases', () => {
  it('masks unspaced 12-digit Aadhaar-style numbers', () => {
    expect(maskSensitive('num 123456789012 end')).toBe('num XXXX-XXXX-XXXX end')
  })
  it('builds a reply even without steps', () => {
    const s = { ...fallbackSchemes[0], steps_hi: [] }
    const reply = buildVoiceReply({ scheme: s }, [])
    expect(reply).toContain(s.name)
    expect(reply).not.toMatch(/https?:\/\//)
  })
  it('collapses extra whitespace when normalizing', () => {
    expect(normalizeDialect('  Main   hoon,  ')).toBe('मैं हूँ,')
  })
})
