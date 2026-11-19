// VaaniAccess matching engine — dialect-adaptive, deterministic, explainable.
// No LLM on the critical path: keyword + intent scoring with Hindi reasons.

// ---------- Category labels ----------
export const CATEGORY_LABEL = {
  farmer: 'किसान',
  education: 'शिक्षा',
  health: 'स्वास्थ्य',
  housing: 'आवास',
  'women-child': 'महिला-बेटी',
  employment: 'रोज़गार',
  'business-loan': 'व्यापार-लोन',
  pension: 'पेंशन',
  'bank-account': 'बैंक-खाता',
  insurance: 'बीमा',
  food: 'राशन',
  energy: 'ऊर्जा',
}

export const INTENT_LABEL = {
  farmer: 'किसान',
  agriculture: 'खेती',
  student: 'विद्यार्थी',
  education: 'शिक्षा',
  health: 'स्वास्थ्य',
  healthcare: 'इलाज',
  housing: 'आवास',
  women: 'महिला',
  employment: 'रोज़गार',
  business: 'व्यापार',
  loan: 'लोन',
  pension: 'पेंशन',
  banking: 'बैंक-खाता',
  savings: 'बचत',
  insurance: 'बीमा',
  youth: 'युवा',
  'financial-support': 'आर्थिक मदद',
  food: 'राशन',
  energy: 'बिजली',
}

// ---------- Intent keyword groups (Hindi + Hinglish + dialects) ----------
const INTENT_KEYWORDS = {
  farmer: ['kisan', 'kisaan', 'kheti', 'fasal', 'fausal', 'khet', 'किसान', 'खेती', 'फसल', 'फसल', 'खेत', 'khaad', 'खाद', 'beej', 'बीज', 'sinchai', 'सिंचाई', 'khalihan', 'farming', 'crop', 'tractor', 'ट्रैक्टर', 'jaman', 'जमीन खेती', 'batai', 'बटाई', 'kisani', 'किसानी', 'kusum', 'कुसुम', 'pump', 'पंप'],
  student: ['student', 'scholarship', 'college', 'school', 'fees', 'fee', 'फीस', 'छात्र', 'विद्यार्थी', 'कॉलेज', 'स्कूल', 'छात्रवृत्ति', 'padhai', 'पढ़ाई', 'exam', 'परीक्षा', 'admission', 'प्रवेश', 'hostel', 'छात्रावास', 'degree', 'डिग्री', 'vidyalay', 'विद्यालय', 'pariksha', 'पुस्तक', 'kitab'],
  health: ['ilaj', 'bimari', 'hospital', 'doctor', 'इलाज', 'बीमारी', 'अस्पताल', 'डॉक्टर', 'dawa', 'दवा', 'दवाई', 'operation', 'ऑपरेशन', 'health', 'स्वास्थ्य', 'bimar', 'बीमार', 'roga', 'रोग', 'sehat', 'सेहत', 'muft ilaj', 'मुफ्त इलाज', 'ayushman', 'आयुष्मान', 'card ilaj', 'janaushadhi', 'जन औषधि', 'generic', 'जेनेरिक', 'sasti dawa', 'सस्ती दवा', 'sugam', 'सुगम', '70', 'buzurg', 'बुजुर्ग'],
  housing: ['ghar', 'makaan', 'makan', 'awas', 'घर', 'मकान', 'आवास', 'पक्का', 'pakka', 'kaccha', 'कच्चा', 'छत', 'chat', 'house', 'colony', 'कॉलोनी', 'jhopdi', 'झोपड़ी', 'kamra', 'कमरा', 'sheher', 'शहर', 'urban', 'flat', 'फ्लैट', 'kiraye', 'किराया'],
  women: ['beti', 'बेटी', 'ladli', 'लाड़ली', 'लाडली', 'mahila', 'महिला', 'aurat', 'औरत', 'gas', 'गैस', 'cylinder', 'सिलेंडर', 'sylinder', 'chulha', 'चूल्हा', 'lakdi', 'लकड़ी', 'dhuan', 'धुआं', 'shaadi', 'शादी', 'shadi', 'betiya', 'बिटिया', 'ladki', 'लड़की', 'gharwali', 'garbhvati', 'गर्भवती', 'pregnant', 'delivery', 'डिलीवरी', 'vidhwa', 'विधवा', 'widow', 'kanya', 'कन्या', 'sumangala', 'सुमंगला'],
  employment: ['majdoor', 'majdur', 'मज़दूर', 'मजदूर', 'majdoori', 'मज़दूरी', 'मजूरी', 'kaam', 'काम', 'naukri', 'नौकरी', 'rojgar', 'रोजगार', 'rozgar', 'job', 'training', 'ट्रेनिंग', 'kaushal', 'कौशल', 'course', 'कोर्स', 'nrega', 'मनरेगा', 'manrega', 'dihadi', 'दिहाड़ी', 'dihadi', 'berojgar', 'बेरोजगार', 'sikhna', 'सीखना', 'internship', 'इंटर्नशिप', 'intern', 'इंटर्न', 'stipend', 'स्टाइपेंड', 'shramik', 'श्रमिक', 'eshram', 'ई-श्रम', 'unorganized', 'असंगठित', 'shram yogi', 'श्रम योगी'],
  business: ['dukaan', 'दुकान', 'dhandha', 'धंधा', 'business', 'व्यापार', 'vyapar', 'thela', 'ठेला', 'rehdi', 'रेहड़ी', 'loan', 'लोन', 'karz', 'कर्ज', 'कर्ज़', 'mudra', 'मुद्रा', 'darzi', 'दर्जी', 'दर्ज़ी', 'badai', 'बढ़ई', 'lohar', 'लोहार', 'silai', 'सिलाई', 'machine', 'मशीन', 'udyog', 'उद्योग', 'dhanda', 'karigar', 'कारीगर', 'mistri', 'मिस्त्री', 'naai', 'नाई', 'mochi', 'मोची', 'vishwakarma', 'विश्वकर्मा', 'vendor', 'वेंडर', 'svanidhi', 'स्वनिधि', 'pmegp', 'kvic', 'factory', 'फैक्टरी', 'enterprise'],
  pension: ['pension', 'पेंशन', 'budhapa', 'बुढ़ापा', 'budha', 'बूढ़ा', 'burhapa', '60', 'saath', 'retire', 'divyang', 'दिव्यांग', 'viklang', 'विकलांग', 'viklaang', 'langda', 'लंगड़ा', 'andha', 'अंधा', 'behra', 'बहरा', 'udid', 'upkaran', 'उपकरण', 'budhape', 'mandhan', 'मानधन', 'maandhan', 'sym', 'vridha', 'वृद्धा', 'vridhavastha', 'वृद्धावस्था', '70', 'vaya', 'वय', '1000 pension', '3000 pension'],
  banking: ['khata', 'खाता', 'bank', 'बैंक', 'account', 'jandhan', 'जनधन', 'जन-धन', 'dhan', 'rupay', 'passbook', 'पासबुक', 'zero balance', 'atm', 'एटीएम'],
  savings: ['bachat', 'बचत', 'savings', 'sukanya', 'सुकन्या', 'jama', 'जमा', 'byaj', 'ब्याज', 'interest', 'saving', 'paisa jama', 'ladli lakshmi', 'लक्ष्मी'],
  insurance: ['bima', 'बीमा', 'insurance', 'fasal bima', 'suraksha', 'सुरक्षा', 'claim', 'दावा', 'muavja', 'मुआवजा', 'nuksaan', 'नुकसान', 'sukha', 'सूखा', 'baadh', 'बाढ़', 'olavrishti', 'ओलावृष्टि', 'jeevan', 'जीवन', 'jivan', 'jyoti', 'ज्योति', 'life insurance', 'accident', 'दुर्घटना', 'durghatna', '436', '20 rupaye', '20 रुपये'],
  food: ['ration', 'राशन', 'anaaj', 'अनाज', 'nfsa', 'pmgkay', 'अन्न', 'chawal', 'चावल', 'gehu', 'गेहूं', 'kotedaar', 'कोटेदार', 'free ration', 'मुफ्त राशन', 'ration card', 'राशन कार्ड', 'sasta anaaj', 'सस्ता राशन'],
  energy: ['solar', 'सोलर', 'bijli', 'बिजली', 'surya', 'सूर्य', 'rooftop', 'panel', 'पैनल', 'muft bijli', 'मुफ्त बिजली', 'बिजली बिल', 'kusum', 'कुसुम', 'pump subsidy'],
}

// Generic need words — boost relevance but not intent-specific
const NEED_WORDS = ['chahiye', 'चाहिए', 'चाही', 'need', 'paise', 'पैसे', 'पैसा', 'paisa', 'मदद', 'madad', 'help', 'milega', 'मिलेगा', 'milegi', 'sahayata', 'सहायता', 'sarkari', 'सरकारी', 'yojana', 'योजना', 'labh', 'लाभ', 'form', 'फॉर्म', 'apply', 'आवेदन']

// ---------- Dialect normalization (for display: "समझा गया") ----------
// Token-based: JS \b doesn't work with Devanagari, so map whole tokens.
const DIALECT_TOKEN_MAP = {
  'हईं': 'हूँ', 'हई': 'हूँ', 'सूं': 'हूँ', 'छूं': 'हूँ', 'छी': 'है', 'हंव': 'हूँ',
  'म्हे': 'मैं', 'म्हारी': 'मेरी', 'म्हारो': 'मेरा', 'मय': 'मैं',
  'चाही': 'चाहिए', 'खातिर': 'के लिए', 'करत': 'करते', 'सुणो': 'सुनो',
  'हईं,': 'हूँ,', 'छूं,': 'हूँ,',
  'main': 'मैं', 'mein': 'मैं', 'hoon': 'हूँ', 'hun': 'हूँ', 'hu': 'हूँ',
  'mujhe': 'मुझे', 'muje': 'मुझे', 'hamko': 'हमको', 'humko': 'हमको',
  'milegi': 'मिलेगी', 'milega': 'मिलेगा', 'kuchh': 'कुछ', 'kuch': 'कुछ',
  'ke': 'के', 'liye': 'लिए', 'liye?': 'लिए?', 'hai': 'है', 'hain': 'हैं',
  'chahiye': 'चाहिए', 'kaam': 'काम', 'gaon': 'गांव', 'me': 'में',
}
const TRAIL_PUNCT = /[,.!?;:?"'()।]+$/

export function normalizeDialect(text) {
  if (!text) return text
  // Phrase-level fixes first
  let out = ' ' + text + ' '
  out = out.replace(/करत ही/g, 'करता हूँ')
  out = out.replace(/मज़ूरी करूँ/gi, 'मजदूरी करता हूँ')
  out = out.replace(/मजूरी करूँ/gi, 'मजदूरी करता हूँ')
  const parts = out.split(/(\s+)/)
  const mapped = parts.map((tok) => {
    if (/^\s*$/.test(tok) || tok === '') return tok
    const m = tok.match(TRAIL_PUNCT)
    const trail = m ? m[0] : ''
    const core = trail ? tok.slice(0, -trail.length) : tok
    const key = core.toLowerCase()
    if (DIALECT_TOKEN_MAP[core] !== undefined) return DIALECT_TOKEN_MAP[core] + trail
    if (DIALECT_TOKEN_MAP[key] !== undefined) return DIALECT_TOKEN_MAP[key] + trail
    return tok
  })
  return mapped.join('').replace(/\s+/g, ' ').trim()
}

// ---------- Privacy: mask Aadhaar / account / phone numbers ----------
export function maskSensitive(text) {
  if (!text) return text
  let out = text
  // Aadhaar-style 12 digits (with optional spaces)
  out = out.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, 'XXXX-XXXX-XXXX')
  // Any long digit run (bank a/c etc.)
  out = out.replace(/\b\d{11,18}\b/g, (m) => 'X'.repeat(m.length))
  // 10-digit mobile
  out = out.replace(/\b[6-9]\d{9}\b/g, 'XXXXXX0000')
  return out
}

// ---------- Intent detection ----------
export function detectIntents(rawText) {
  const text = (rawText || '').toLowerCase()
  const found = []
  for (const [intent, words] of Object.entries(INTENT_KEYWORDS)) {
    for (const w of words) {
      if (w && text.includes(w.toLowerCase())) {
        found.push(intent)
        break
      }
    }
  }
  return [...new Set(found)]
}

// Map detected intent → scheme intent overlap (scheme intents use these names)
const INTENT_ALIAS = {
  agriculture: 'farmer',
  farmer: 'agriculture',
  student: 'education',
  education: 'student',
  health: 'healthcare',
  healthcare: 'health',
  business: 'loan',
}

/** POST /api/recommend equivalent — deterministic scoring over schemes */
export function scoreSchemes(rawText, schemes) {
  const text = (rawText || '').toLowerCase()
  const intents = detectIntents(rawText)
  const expanded = new Set(intents)
  intents.forEach((i) => {
    if (INTENT_ALIAS[i]) expanded.add(INTENT_ALIAS[i])
  })

  const hasNeed = NEED_WORDS.some((w) => text.includes(w.toLowerCase()))

  const scored = (schemes || []).map((s) => {
    let score = 0
    const matched = []
    const kws = Array.isArray(s.keywords) ? s.keywords : []
    for (const kw of kws) {
      const k = (kw || '').toLowerCase().trim()
      if (k && k.length >= 2 && text.includes(k)) {
        score += k.length >= 5 ? 3 : 2
        matched.push(kw)
      }
    }
    // Intent overlap bonus
    const sIntents = Array.isArray(s.intents) ? s.intents : []
    const overlap = sIntents.filter((i) => expanded.has(i))
    score += overlap.length * 4
    // Need-word bonus if we already have signal
    if (hasNeed && score > 0) score += 1

    const reasons = []
    if (matched.length > 0) {
      const top = [...new Set(matched)].slice(0, 3).join('", "')
      reasons.push(`आपके शब्द "${top}" इस योजना से मेल खाते हैं`)
    }
    if (overlap.length > 0) {
      const lbl = overlap
        .slice(0, 2)
        .map((i) => INTENT_LABEL[i] || i)
        .join(' + ')
      reasons.push(`आपकी जरूरत (${lbl}) इस योजना के दायरे में आती है`)
    }
    if ((s.category_hi || s.category) && overlap.length > 0) {
      reasons.push(`श्रेणी: ${s.category_hi || s.category}`)
    }

    const level = score >= 8 ? 'पक्का मेल' : score >= 4 ? 'अच्छा मेल' : score > 0 ? 'संभावित' : '—'
    return { scheme: s, score, reasons, matched: [...new Set(matched)], overlap, level }
  })

  const results = scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || (a.scheme.name || '').localeCompare(b.scheme.name || ''))
    .slice(0, 3)

  return { intents, expanded: [...expanded], results, hasNeed }
}

// ---------- Voice reply builder (short Hindi, never speaks URLs) ----------
export function buildVoiceReply(topResult, _intents) {
  if (!topResult) {
    return 'माफ कीजिए, आपकी बात से कोई पक्की योजना नहीं मिल पाई। कृपया दोबारा बोलें — जैसे, मैं किसान हूँ, या मुझे छात्रवृत्ति चाहिए।'
  }
  const name = topResult.scheme.name || topResult.scheme.name_en
  const steps = Array.isArray(topResult.scheme.steps_hi) ? topResult.scheme.steps_hi : []
  const first = steps[0] ? ' पहला कदम: ' + steps[0] : ''
  return `आपके लिए ${name} सही रह सकती है।${first} बाकी कदम और कागज स्क्रीन पर देखिए। आवेदन के लिए स्क्रीन पर दिए गए official link पर जाइए।`
}

// ---------- Demo sentences (tap = run full pipeline) ----------
export const DEMO_SENTENCES = [
  { text: 'Main college student hoon, fees ke liye scholarship chahiye', tag: 'कॉलेज छात्र • Hinglish' },
  { text: 'मैं किसान हूँ, खेती के लिए पैसे चाहिए', tag: 'किसान • हिन्दी' },
  { text: 'Mujhe pakka ghar banana hai, kuch madad milegi?', tag: 'आवास • Hinglish' },
  { text: 'मेरी बेटी के लिए बचत करना है', tag: 'बेटी की बचत • हिन्दी' },
  { text: 'Main majdoor hoon, gaon me kaam chahiye', tag: 'मज़दूर • Hinglish' },
  { text: 'Mujhe bimari ke liye muft ilaj chahiye', tag: 'इलाज • Hinglish' },
  { text: 'Main darzi hoon, dukaan ke liye loan chahiye', tag: 'कारीगर लोन • Hinglish' },
  { text: 'हमको गैस सिलेंडर चाहिए, लकड़ी पर खाना बनता है', tag: 'गैस • हिन्दी' },
  { text: 'UP me naya ration card banana hai', tag: 'राशन • Hinglish' },
  { text: 'Bijli bill bahut aata hai, ghar par solar panel lagwana hai', tag: 'सोलर • Hinglish' },
]

// ---------- Dialect ticker ----------
export const DIALECT_TICKER = [
  ['खड़ी बोली', 'मैं किसान हूँ'],
  ['भोजपुरी', 'हम किसान हईं'],
  ['हरियाणवी', 'मैं किसान सूं'],
  ['राजस्थानी', 'म्हे किसान छूं'],
  ['अवधी', 'हम खेती करत ही'],
  ['मैथिली', 'हम किसान छी'],
  ['ब्रज', 'मैं किसानी करूँ'],
  ['छत्तीसगढ़ी', 'मय किसान हंव'],
  ['बुंदेली', 'हम खेती करत'],
  ['मारवाड़ी', 'म्हारी खेती है'],
]

// ---------- Helpers ----------
export function downloadChecklist(scheme) {
  const lines = [
    `वाणी एक्सेस — आवेदन चेकलिस्ट`,
    `योजना: ${scheme.name} (${scheme.name_en || ''})`,
    `लाभ: ${scheme.benefit || ''}`,
    `हेल्पलाइन: ${scheme.helpline || ''}`,
    `Official link: ${scheme.official_url || ''}`,
    ``,
    `पात्रता:`,
    ...((scheme.eligibility_hi || []).map((e, i) => `  ${i + 1}. ${e}`)),
    ``,
    `कागज़:`,
    ...((scheme.documents_hi || []).map((e, i) => `  ${i + 1}. ${e}`)),
    ``,
    `3 आसान कदम:`,
    ...((scheme.steps_hi || []).map((e, i) => `  ${i + 1}. ${e}`)),
    ``,
    `नोट: आधार/बैंक नंबर किसी से फोन पर साझा न करें।`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `checklist-${scheme.slug || 'yojana'}.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
