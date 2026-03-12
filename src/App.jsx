import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { loadCloudAppState, saveCloudAppState } from './firebase.js';
import { LOCAL_VERSE_LIBRARY } from './data/localVerseLibrary.js';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Bell,
  BellOff,
  Sparkles,
  Share2,
  Volume2,
  VolumeX,
  Check,
  Maximize2,
  Minimize2,
  Quote,
  Info,
  Moon,
  Globe
} from 'lucide-react';

// --- BANCO DE DADOS CURADO (SELEÇÃO "VERSÍCULOS DE OURO") ---
const CURATED_LOCAL_DATABASE = [
  {
    id: 1,
    reference: "Filipenses 4:6-7",
    text: "Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus. E a paz de Deus, que excede todo o entendimento, guardará o coração e a mente de vocês em Cristo Jesus.",
    ai_explanation: "Este texto nos convida a uma troca divina: entregamos nossa ansiedade e recebemos a paz (Shalom) de Deus. A 'paz que excede o entendimento' não é lógica; é descrita por Paulo como uma sentinela militar (v.7) que monta guarda sobre nossas emoções quando as circunstâncias dizem que deveríamos estar em pânico."
  },
  {
    id: 2,
    reference: "Isaías 40:31",
    text: "Mas aqueles que esperam no Senhor renovam as suas forças. Voam alto como águias; correm e não ficam exaustos, andam e não se cansam.",
    ai_explanation: "No hebraico, a palavra 'esperar' aqui (qavah) significa entrelaçar, como fios formando uma corda resistente. Ao nos 'entrelaçarmos' com Deus na espera, trocamos nossa fraqueza pela força Dele. A águia usa as correntes de vento (tempestades) para subir, não batendo asas desesperadamente, mas planando na soberania divina."
  },
  // ... (Mantendo os outros versículos locais para quando estiver offline)
  {
    id: 3,
    reference: "Josué 1:9",
    text: "Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.",
    ai_explanation: "A coragem bíblica não é a ausência de medo, mas a obediência apesar dele. A garantia da coragem de Josué não estava em sua habilidade militar, mas na onipresença de Deus ('estará com você'). É um chamado para agir baseado na companhia divina, não nas circunstâncias externas."
  },
  {
    id: 4,
    reference: "Salmos 23:4",
    text: "Mesmo quando eu andar por um vale de trevas e morte, não temerei perigo algum, pois tu estás comigo; a tua vara e o teu cajado me protegem.",
    ai_explanation: "O vale não é o destino final, é apenas uma passagem ('andar por'). O pastor usa a vara para afastar predadores e o cajado para guiar a ovelha. O conforto supremo vem de saber que, nas sombras mais densas, a presença do Pastor é mais real que a própria escuridão."
  },
  {
    id: 5,
    reference: "Romanos 8:28",
    text: "Sabemos que Deus age em todas as coisas para o bem daqueles que o amam, dos que foram chamados de acordo com o seu propósito.",
    ai_explanation: "A promessa não é que todas as coisas são boas em si mesmas, mas que Deus 'tece' soberanamente todas as circunstâncias (boas ou más) para um fim benéfico final: a nossa conformidade com a imagem de Cristo. É a alquimia divina transformando tragédias em triunfo eterno."
  },
  {
    id: 6,
    reference: "Jeremias 29:11",
    text: "Porque sou eu que conheço os planos que tenho para vocês', diz o Senhor, 'planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.",
    ai_explanation: "Dito a exilados na Babilônia, este versículo lembra que o silêncio de Deus ou o sofrimento presente não significam o fim da história. Os planos de Deus transcendem o momento de dor e visam uma restauração completa. É um convite a confiar no Arquiteto mesmo quando não vemos a planta da obra."
  },
  {
    id: 7,
    reference: "João 3:16",
    text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    ai_explanation: "O 'Versículo de Ouro' por excelência resume o Evangelho: a magnitude do amor de Deus (o mundo todo), a magnitude do sacrifício (Filho unigênito) e a magnitude do resultado (vida eterna). É o convite universal da graça que exige uma resposta individual: crer."
  },
  {
    id: 8,
    reference: "Salmos 91:1-2",
    text: "Aquele que habita no abrigo do Altíssimo e descansa à sombra do Todo-poderoso pode dizer ao Senhor: Tu és o meu refúgio e a minha fortaleza, o meu Deus, em quem confio.",
    ai_explanation: "A chave da proteção divina aqui é 'habitar' (morar), não apenas visitar. Quem vive na presença constante de Deus (o Lugar Secreto) encontra uma sombra protetora que nenhum mal espiritual pode penetrar. É uma declaração de posse e intimidade: 'MEU refúgio, MEU Deus'."
  },
  {
    id: 9,
    reference: "Mateus 11:28",
    text: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.",
    ai_explanation: "Jesus oferece uma troca de jugos. O jugo da religiosidade e da autossuficiência é pesado e esmagador; o jugo do discipulado com Cristo é suave. O descanso prometido não é apenas inatividade física, mas um alívio profundo para a alma que cessa de tentar ganhar o favor de Deus por esforço próprio."
  },
  {
    id: 10,
    reference: "Provérbios 3:5-6",
    text: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas.",
    ai_explanation: "A instrução é radical: abandonar a confiança no nosso intelecto limitado. 'Reconhecer' em hebraico implica intimidade e consulta antes de cada decisão. Quando fazemos de Deus nosso parceiro de caminhada, Ele remove os obstáculos e alinha nossa rota com a vontade Dele."
  }
];

// --- AUXILIAR: TRADUTOR DE LIVROS (Inglês -> Português) ---
// A API bible-api.com as vezes retorna nomes em inglês.
const translateBook = (bookName) => {
  const map = {
    'Genesis': 'Gênesis', 'Exodus': 'Êxodo', 'Leviticus': 'Levítico', 'Numbers': 'Números', 'Deuteronomy': 'Deuteronômio',
    'Joshua': 'Josué', 'Judges': 'Juízes', 'Ruth': 'Rute', '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
    '1 Kings': '1 Reis', '2 Kings': '2 Reis', '1 Chronicles': '1 Crônicas', '2 Chronicles': '2 Crônicas',
    'Ezra': 'Esdras', 'Nehemiah': 'Neemias', 'Esther': 'Ester', 'Job': 'Jó', 'Psalms': 'Salmos', 'Proverbs': 'Provérbios',
    'Ecclesiastes': 'Eclesiastes', 'Song of Solomon': 'Cânticos', 'Isaiah': 'Isaías', 'Jeremiah': 'Jeremias',
    'Lamentations': 'Lamentações', 'Ezekiel': 'Ezequiel', 'Daniel': 'Daniel', 'Hosea': 'Oseias', 'Joel': 'Joel',
    'Amos': 'Amós', 'Obadiah': 'Obadias', 'Jonah': 'Jonas', 'Micah': 'Miqueias', 'Nahum': 'Naum',
    'Habakkuk': 'Habacuque', 'Zephaniah': 'Sofonias', 'Haggai': 'Ageu', 'Zechariah': 'Zacarias', 'Malachi': 'Malaquias',
    'Matthew': 'Mateus', 'Mark': 'Marcos', 'Luke': 'Lucas', 'John': 'João', 'Acts': 'Atos', 'Romans': 'Romanos',
    '1 Corinthians': '1 Coríntios', '2 Corinthians': '2 Coríntios', 'Galatians': 'Gálatas', 'Ephesians': 'Efésios',
    'Philippians': 'Filipenses', 'Colossians': 'Colossenses', '1 Thessalonians': '1 Tessalonicenses', '2 Thessalonians': '2 Tessalonicenses',
    '1 Timothy': '1 Timóteo', '2 Timothy': '2 Timóteo', 'Titus': 'Tito', 'Philemon': 'Filemom', 'Hebrews': 'Hebreus',
    'James': 'Tiago', '1 Peter': '1 Pedro', '2 Peter': '2 Pedro', '1 John': '1 João', '2 John': '2 João',
    '3 John': '3 João', 'Jude': 'Judas', 'Revelation': 'Apocalipse'
  };
  return map[bookName] || bookName;
};

const normalizeText = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const BOOK_ALIASES = {
  jo: 'João',
  joao: 'João',
  jn: 'João',
  mt: 'Mateus',
  mc: 'Marcos',
  lc: 'Lucas',
  rm: 'Romanos',
  fp: 'Filipenses',
  is: 'Isaías',
  jr: 'Jeremias',
  js: 'Josué',
  pv: 'Provérbios',
  sl: 'Salmos',
  sm: 'Salmos',
  salmo: 'Salmos',
  salmos: 'Salmos',
  ap: 'Apocalipse',
  gn: 'Gênesis',
  ex: 'Êxodo',
};

const normalizeReferenceInput = (reference = '') => {
  const cleaned = reference
    .replace(/\s+/g, ' ')
    .replace(/\s*:\s*/g, ':')
    .trim();

  const match = cleaned.match(/^((?:[1-3]\s*)?[\p{L}.]+(?:\s+[\p{L}.]+)*)\s+(\d+)[:.]?(\d+)$/u);
  if (!match) return cleaned;

  const [, rawBook, chapter, verse] = match;
  const bookKey = normalizeText(rawBook.replace(/\./g, ''));
  const normalizedBook = BOOK_ALIASES[bookKey] || rawBook.trim();
  return `${normalizedBook} ${chapter}:${verse}`;
};

const buildReferenceCandidates = (reference = '') => {
  const normalized = normalizeReferenceInput(reference);
  const accentless = normalizeText(normalized)
    .replace(/\b1\s/g, '1 ')
    .replace(/\b2\s/g, '2 ')
    .replace(/\b3\s/g, '3 ');

  return Array.from(new Set([
    reference.trim(),
    normalized,
    accentless,
  ].filter(Boolean)));
};

const isReferenceLikeQuery = (query = '') => /\d/.test(query) || /[:.]/.test(query);

const searchLocalVerses = (query, limit = 30) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const matches = [];

  for (const verse of LOCAL_DATABASE) {
    const normalizedReference = normalizeText(verse.reference || '');
    const normalizedTextValue = normalizeText(verse.text || '');
    const normalizedTheme = normalizeText(verse.theme || '');
    const normalizedExplanation = normalizeText(verse.ai_explanation || '');
    const normalizedBook = normalizedReference.split(/\s+\d/)[0] || normalizedReference;

    let score = 0;

    if (normalizedReference === normalizedQuery) score += 200;
    if (normalizedReference.startsWith(normalizedQuery)) score += 120;
    if (normalizedReference.includes(normalizedQuery)) score += 90;
    if (normalizedBook === normalizedQuery) score += 100;
    if (normalizedBook.startsWith(normalizedQuery)) score += 80;
    if (normalizedTheme === normalizedQuery) score += 75;
    if (normalizedTheme.includes(normalizedQuery)) score += 55;
    if (normalizedTextValue.includes(normalizedQuery)) score += 50;
    if (normalizedExplanation.includes(normalizedQuery)) score += 20;

    if (tokens.length > 1) {
      let matchedTokens = 0;
      for (const token of tokens) {
        if (
          normalizedReference.includes(token)
          || normalizedTextValue.includes(token)
          || normalizedTheme.includes(token)
          || normalizedExplanation.includes(token)
        ) {
          matchedTokens += 1;
        }
      }

      if (matchedTokens === tokens.length) score += 65;
      else if (matchedTokens > 0) score += matchedTokens * 10;
    }

    if (score > 0) {
      matches.push({ ...verse, source: 'local', _score: score });
    }
  }

  return matches
    .sort((a, b) => b._score - a._score || a.reference.localeCompare(b.reference, 'pt-BR'))
    .slice(0, limit)
    .map(({ _score, ...verse }) => verse);
};

// --- SIMULADOR DE IA (FALLBACK) ---
// Usado apenas se a API online falhar
const generateStaticFallback = (text) => {
  if (text.includes('amor')) return "O amor Ágape é a essência do caráter divino, exigindo ação e não apenas sentimento.";
  if (text.includes('senhor')) return "Reconhecer o senhorio de Cristo coloca todas as outras preocupações em perspectiva.";
  return "Este versículo é uma âncora para a alma, convidando-nos a confiar na fidelidade imutável de Deus.";
};

const buildLocalVerseExplanation = (verse) => {
  const theme = verse?.theme ? `Tema central: ${verse.theme}. ` : '';
  const fallback = generateStaticFallback(verse?.text || '');
  return `${theme}${fallback} Em ${verse?.reference}, Deus nos chama a responder com fé prática, esperança firme e obediência no cotidiano.`.trim();
};

const LOCAL_DATABASE = (() => {
  const merged = [...CURATED_LOCAL_DATABASE, ...LOCAL_VERSE_LIBRARY];
  const uniqueVerses = [];
  const seen = new Set();
  const normalizeLibraryValue = (value = '') => String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  for (const verse of merged) {
    const normalizedReference = String(verse.reference || '').trim();
    const normalizedText = String(verse.text || '').replace(/\s+/g, ' ').trim();
    if (!normalizedReference || !normalizedText) continue;

    const key = `${normalizeLibraryValue(normalizedReference)}::${normalizeLibraryValue(normalizedText)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    uniqueVerses.push({
      ...verse,
      id: uniqueVerses.length + 1,
      reference: normalizedReference,
      text: normalizedText,
      ai_explanation: verse.ai_explanation || buildLocalVerseExplanation(verse),
    });
  }

  return uniqueVerses;
})();

const formatTime = (date) => {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const APP_STORAGE_KEY = 'lumina_app_state_v1';
const DEVICE_ID_STORAGE_KEY = 'lumina_device_id_v1';
const VOICE_PREFERENCE_STORAGE_KEY = 'lumina_voice_gender_v1';
const MAX_DAILY_CHECKLIST_DAYS = 90;
const MAX_DAILY_VERSE_PLAYS = 5;
const RECENT_VARIETY_WINDOW = 21;
const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

const getBrasiliaDateTag = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BRAZIL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return `${year}-${month}-${day}`;
};

const getBrasiliaClock = (date = new Date()) => {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getBrasiliaWeekday = (date = new Date()) => {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    weekday: 'short',
  }).format(date).replace('.', '');
};

const getBrasiliaHour = (date = new Date()) => Number(new Intl.DateTimeFormat('en-GB', {
  timeZone: BRAZIL_TIMEZONE,
  hour: '2-digit',
  hour12: false,
}).format(date));

const getTodayTag = () => getBrasiliaDateTag(new Date());

const isValidVoiceGender = (value) => value === 'female' || value === 'male';

const pruneDailyChecklist = (dailyChecklist = {}, maxDays = MAX_DAILY_CHECKLIST_DAYS) => {
  if (!dailyChecklist || typeof dailyChecklist !== 'object') return {};

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (maxDays - 1));
  cutoffDate.setHours(0, 0, 0, 0);
  const cutoffTime = cutoffDate.getTime();

  return Object.entries(dailyChecklist).reduce((accumulator, [tag, value]) => {
    const parsedDate = new Date(`${tag}T00:00:00`);
    if (!Number.isNaN(parsedDate.getTime()) && parsedDate.getTime() >= cutoffTime) {
      accumulator[tag] = value;
    }
    return accumulator;
  }, {});
};

const getOrCreateDeviceId = () => {
  try {
    const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) return existing;

    const generated = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    localStorage.setItem(DEVICE_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return null;
  }
};

const getMoodScore = (moodRaw) => {
  const mood = moodRaw.toLowerCase();
  if (mood.includes('gratid') || mood.includes('feliz') || mood.includes('paz') || mood.includes('alegr')) return 2;
  if (mood.includes('calm') || mood.includes('esper')) return 1;
  if (mood.includes('ans') || mood.includes('medo') || mood.includes('preocup') || mood.includes('triste') || mood.includes('dor')) return -2;
  if (mood.includes('cans') || mood.includes('desanim')) return -1;
  return 0;
};

const shuffleVerses = (verses) => {
  const shuffled = [...verses];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
};

const buildComfortMessage = (moodRaw) => {
  const mood = moodRaw.toLowerCase();
  if (mood.includes('ans') || mood.includes('medo') || mood.includes('preocup')) {
    return 'Você não está sozinho(a). Respire fundo: Deus cuida de você hoje, um passo de cada vez.';
  }
  if (mood.includes('triste') || mood.includes('dor') || mood.includes('cans')) {
    return 'Seu coração importa. Deus acolhe sua dor e renova suas forças no tempo certo.';
  }
  if (mood.includes('gratid') || mood.includes('feliz') || mood.includes('paz')) {
    return 'Que lindo ver seu coração grato. Continue firme: a paz de Deus transborda em você.';
  }
  return 'Obrigado por abrir seu coração. Deus te vê, te ama e caminha com você em cada detalhe.';
};

const humanizeSpeechText = (text = '') => text
  .replace(/\s+/g, ' ')
  .replace(/:/g, ', ')
  .replace(/;/g, '. ')
  .replace(/\s*,\s*/g, ', ')
  .replace(/\.(?=\S)/g, '. ')
  .trim();

const splitSpeechSegments = (text = '') => {
  const normalized = humanizeSpeechText(text);
  return normalized
    .split(/(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 12);
};

const ONLINE_REFERENCE_POOL = [
  'João 3:16', 'Salmos 23:1', 'Salmos 23:4', 'Salmos 27:1', 'Salmos 34:8', 'Salmos 37:5', 'Salmos 46:1', 'Salmos 91:1',
  'Salmos 91:2', 'Salmos 119:105', 'Provérbios 3:5', 'Provérbios 3:6', 'Provérbios 18:10', 'Isaías 40:31', 'Isaías 41:10', 'Isaías 43:2',
  'Jeremias 29:11', 'Lamentações 3:22', 'Lamentações 3:23', 'Josué 1:9', 'Mateus 5:14', 'Mateus 6:33', 'Mateus 11:28', 'Mateus 19:26',
  'Marcos 10:27', 'Lucas 1:37', 'João 8:12', 'João 10:10', 'João 14:6', 'João 14:27', 'João 15:5', 'Atos 1:8',
  'Romanos 5:8', 'Romanos 8:1', 'Romanos 8:28', 'Romanos 8:37', 'Romanos 10:9', '1 Coríntios 10:13', '1 Coríntios 13:4', '2 Coríntios 5:7',
  '2 Coríntios 12:9', 'Gálatas 5:22', 'Efésios 2:8', 'Efésios 3:20', 'Efésios 6:10', 'Filipenses 4:6', 'Filipenses 4:7', 'Filipenses 4:13',
  'Colossenses 3:23', '2 Timóteo 1:7', 'Hebreus 11:1', 'Hebreus 13:8', 'Tiago 1:5', '1 Pedro 5:7', '1 João 1:9', '1 João 4:8',
  '1 João 4:19', 'Apocalipse 3:20', 'Apocalipse 21:4', 'Salmos 121:1', 'Salmos 121:2', 'Salmos 126:5', 'Isaías 26:3', 'Isaías 55:8',
  'Mateus 28:20', 'João 11:25', 'Romanos 12:2', 'Efésios 4:32', 'Filipenses 1:6', 'Colossenses 3:15', 'Hebreus 4:16', 'Tiago 4:8'
];

const CLOUD_VOICE_BY_GENDER = {
  female: 'pt-BR-Neural2-C',  // best available female (Studio needs OAuth)
  male: 'pt-BR-Neural2-B',    // best available male
};

const inferVoiceGender = (voiceName = '') => {
  const normalized = String(voiceName).toLowerCase();
  if (normalized.includes('-b') || normalized.includes('masc') || normalized.includes('male')) return 'male';
  return 'female';
};

const getVoiceGenderLabel = (gender) => (gender === 'male' ? 'Masculina' : 'Feminina');

const getVerseKey = (verse) => `${verse?.id ?? verse?.reference ?? 'verse'}::${verse?.reference ?? ''}`;

export default function DevocionalApp() {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [seenVerses, setSeenVerses] = useState([]);
  const [referenceInput, setReferenceInput] = useState('');
  const [recentReferences, setRecentReferences] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [journeyStats, setJourneyStats] = useState({ verseReads: 0, explanationReads: 0, moodLogs: 0, referenceSearches: 0 });
  const [moodInput, setMoodInput] = useState('');
  const [comfortMessage, setComfortMessage] = useState('');
  const [dailyChecklist, setDailyChecklist] = useState({});
  const [moodHistory, setMoodHistory] = useState([]);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceLabel, setVoiceLabel] = useState('Padrão');
  const [selectedVoiceGender, setSelectedVoiceGender] = useState('female');
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [voiceSelectionRequired, setVoiceSelectionRequired] = useState(false);
  const [showMoodPrompt, setShowMoodPrompt] = useState(false);
  const [supportPromptState, setSupportPromptState] = useState({});
  const [selectedCalendarTag, setSelectedCalendarTag] = useState(null);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [standbyMode, setStandbyMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [localCycle, setLocalCycle] = useState([]);
  const [localCycleIndex, setLocalCycleIndex] = useState(0);
  const [onlineCycle, setOnlineCycle] = useState([]);
  const [onlineCycleIndex, setOnlineCycleIndex] = useState(0);
  const [notificationCycle, setNotificationCycle] = useState([]);
  const [notificationCycleIndex, setNotificationCycleIndex] = useState(0);
  const [verseProgress, setVerseProgress] = useState({});
  const isNativePlatform = Capacitor.isNativePlatform();
  const USE_BACKEND_TTS = String(import.meta.env.VITE_USE_BACKEND_TTS ?? 'false').toLowerCase() === 'true';
  const configuredTtsBaseUrl = String(import.meta.env.VITE_TTS_API_BASE_URL ?? '').trim();
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isCurrentHostLocal = /^(localhost|127\.0\.0\.1)$/i.test(currentHostname);
  const isConfiguredTtsLocal = /localhost|127\.0\.0\.1/i.test(configuredTtsBaseUrl);
  const BACKEND_TTS_BASE_URL = configuredTtsBaseUrl && (!isConfiguredTtsLocal || isCurrentHostLocal)
    ? configuredTtsBaseUrl
    : '';
  const BACKEND_TTS_VOICE_NAME = String(import.meta.env.VITE_TTS_VOICE_NAME ?? 'pt-BR-Neural2-B');
  const FIRESTORE_SYNC_ENABLED = String(import.meta.env.VITE_ENABLE_FIRESTORE_SYNC ?? 'true').toLowerCase() === 'true';

  const notificationInterval = useRef(null);
  const sendNotificationRef = useRef(null);
  const speechRef = useRef(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const deviceIdRef = useRef(null);
  const cloudSyncTimeoutRef = useRef(null);
  const NATIVE_NOTIFICATION_BASE_ID = 1000;
  const NOTIFICATION_DAYS_AHEAD = 15;
  const NOTIFICATIONS_PER_DAY = 3;
  const NATIVE_NOTIFICATION_COUNT = NOTIFICATION_DAYS_AHEAD * NOTIFICATIONS_PER_DAY;
  const DAILY_REMINDER_BASE_ID = 3000;
  const DAILY_REMINDER_COUNT = 30;
  const JOURNEY_POINTS = {
    verseRead: 10,
    explanationRead: 15,
    moodLog: 5,
    referenceSearch: 8,
  };

  const persistVoicePreference = useCallback((gender) => {
    if (!isValidVoiceGender(gender)) return;
    setSelectedVoiceGender(gender);
    try {
      localStorage.setItem(VOICE_PREFERENCE_STORAGE_KEY, gender);
    } catch {
      // noop
    }
  }, []);

  const openMoodPromptForSlot = useCallback((slotKey) => {
    const todayTag = getTodayTag();
    setSupportPromptState((previous) => {
      const current = previous[todayTag] || {};
      if (current[slotKey]) return previous;

      const shouldAlsoMarkNight = slotKey === 'firstEntryShown' && getBrasiliaHour(new Date()) >= 21;

      return {
        ...previous,
        [todayTag]: {
          ...current,
          [slotKey]: true,
          ...(shouldAlsoMarkNight ? { nightShown: true } : {}),
        },
      };
    });
    setShowMoodPrompt(true);
  }, []);

  const applySavedState = useCallback((parsed) => {
    if (!parsed || !Array.isArray(parsed.history) || parsed.history.length === 0) return false;

    const sanitizedDailyChecklist = pruneDailyChecklist(parsed.dailyChecklist || {});

    setHistory(parsed.history);
    const safeIndex = typeof parsed.currentIndex === 'number'
      ? Math.min(Math.max(parsed.currentIndex, 0), parsed.history.length - 1)
      : parsed.history.length - 1;
    setCurrentIndex(safeIndex);
    setCurrentVerse(parsed.history[safeIndex]);

    // Regenerate cycle if saved one is stale (library expanded significantly)
    if (Array.isArray(parsed.localCycle) && parsed.localCycle.length >= LOCAL_DATABASE.length * 0.5) {
      setLocalCycle(parsed.localCycle);
      if (typeof parsed.localCycleIndex === 'number') setLocalCycleIndex(parsed.localCycleIndex);
    } else {
      const recentRefs = new Set((parsed.history || []).slice(-RECENT_VARIETY_WINDOW).map((v) => v.reference));
      const freshPool = LOCAL_DATABASE.filter((v) => !recentRefs.has(v.reference));
      const freshCycle = shuffleVerses(freshPool.length > 0 ? freshPool : LOCAL_DATABASE);
      setLocalCycle(freshCycle);
      setLocalCycleIndex(0);
    }
    if (Array.isArray(parsed.onlineCycle)) setOnlineCycle(parsed.onlineCycle);
    if (typeof parsed.onlineCycleIndex === 'number') setOnlineCycleIndex(parsed.onlineCycleIndex);
    if (Array.isArray(parsed.notificationCycle)) setNotificationCycle(parsed.notificationCycle);
    if (typeof parsed.notificationCycleIndex === 'number') setNotificationCycleIndex(parsed.notificationCycleIndex);
    if (Array.isArray(parsed.seenVerses)) setSeenVerses(parsed.seenVerses);
    if (parsed.verseProgress && typeof parsed.verseProgress === 'object') setVerseProgress(parsed.verseProgress);
    if (Array.isArray(parsed.recentReferences)) setRecentReferences(parsed.recentReferences.slice(0, 3));
    if (parsed.journeyStats && typeof parsed.journeyStats === 'object') {
      setJourneyStats({
        verseReads: Number(parsed.journeyStats.verseReads) || 0,
        explanationReads: Number(parsed.journeyStats.explanationReads) || 0,
        moodLogs: Number(parsed.journeyStats.moodLogs) || 0,
        referenceSearches: Number(parsed.journeyStats.referenceSearches) || 0,
      });
    }
    setNotificationsEnabled(Boolean(parsed.notificationsEnabled));
    setDailyChecklist(sanitizedDailyChecklist);
    if (Array.isArray(parsed.moodHistory)) setMoodHistory(parsed.moodHistory);
    if (parsed.supportPromptState && typeof parsed.supportPromptState === 'object') {
      setSupportPromptState(pruneDailyChecklist(parsed.supportPromptState, MAX_DAILY_CHECKLIST_DAYS));
    }
    if (isValidVoiceGender(parsed.selectedVoiceGender)) {
      persistVoicePreference(parsed.selectedVoiceGender);
    }

    return true;
  }, [persistVoicePreference]);

  const restoreSavedState = useCallback(() => {
    try {
      const rawState = localStorage.getItem(APP_STORAGE_KEY);
      if (!rawState) return false;

      const parsed = JSON.parse(rawState);
      return applySavedState(parsed);
    } catch (error) {
      console.error('Falha ao restaurar estado:', error);
      return false;
    }
  }, [applySavedState]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      let restored = restoreSavedState();
      deviceIdRef.current = getOrCreateDeviceId();

      if (FIRESTORE_SYNC_ENABLED && deviceIdRef.current) {
        let localLastSeenAt = 0;
        try {
          const localRaw = localStorage.getItem(APP_STORAGE_KEY);
          if (localRaw) {
            const localParsed = JSON.parse(localRaw);
            localLastSeenAt = Number(localParsed?.lastSeenAt) || 0;
          }
        } catch {
          localLastSeenAt = 0;
        }

        try {
          const cloudState = await loadCloudAppState(deviceIdRef.current);
          if (cloudState) {
            const cloudLastSeenAt = Number(cloudState?.lastSeenAt) || 0;
            if (!restored || cloudLastSeenAt > localLastSeenAt) {
              restored = applySavedState(cloudState);
            }
          }
        } catch {
          // noop
        }
      }

      if (!restored && isMounted) {
        const firstCycle = shuffleVerses(LOCAL_DATABASE);
        const firstVerse = { ...firstCycle[0], source: 'local' };
        setLocalCycle(firstCycle);
        setLocalCycleIndex(1);
        setHistory([firstVerse]);
        setCurrentIndex(0);
        setCurrentVerse(firstVerse);
      }

      let storedVoice = null;
      try {
        storedVoice = localStorage.getItem(VOICE_PREFERENCE_STORAGE_KEY);
      } catch {
        storedVoice = null;
      }

      if (isMounted) {
        if (isValidVoiceGender(storedVoice)) {
          setSelectedVoiceGender(storedVoice);
          setVoiceSelectionRequired(false);
        } else {
          setSelectedVoiceGender(inferVoiceGender(BACKEND_TTS_VOICE_NAME));
          setVoiceSelectionRequired(true);
          setShowVoicePicker(true);
        }
        setHasBootstrapped(true);
      }
    };

    bootstrap();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      if (speechRef.current) window.speechSynthesis.cancel();
      if (cloudSyncTimeoutRef.current) clearTimeout(cloudSyncTimeoutRef.current);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [FIRESTORE_SYNC_ENABLED, restoreSavedState, applySavedState, BACKEND_TTS_VOICE_NAME]);

  useEffect(() => {
    if (history.length === 0) return;
    const sanitizedDailyChecklist = pruneDailyChecklist(dailyChecklist, MAX_DAILY_CHECKLIST_DAYS);
    const sanitizedSupportPromptState = pruneDailyChecklist(supportPromptState, MAX_DAILY_CHECKLIST_DAYS);
    const payload = {
      history: history.slice(-200),
      currentIndex,
      localCycle,
      localCycleIndex,
      onlineCycle,
      onlineCycleIndex,
      notificationCycle,
      notificationCycleIndex,
      seenVerses,
      verseProgress,
      recentReferences: recentReferences.slice(0, 3),
      journeyStats,
      notificationsEnabled,
      dailyChecklist: sanitizedDailyChecklist,
      supportPromptState: sanitizedSupportPromptState,
      selectedVoiceGender,
      moodHistory: moodHistory.slice(-120),
      lastSeenAt: Date.now(),
      lastSeenDay: getTodayTag(),
    };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));

    if (FIRESTORE_SYNC_ENABLED && deviceIdRef.current) {
      if (cloudSyncTimeoutRef.current) clearTimeout(cloudSyncTimeoutRef.current);
      cloudSyncTimeoutRef.current = setTimeout(() => {
        saveCloudAppState(deviceIdRef.current, payload).catch(() => null);
      }, 1200);
    }
  }, [history, currentIndex, localCycle, localCycleIndex, onlineCycle, onlineCycleIndex, notificationCycle, notificationCycleIndex, seenVerses, verseProgress, recentReferences, journeyStats, notificationsEnabled, dailyChecklist, supportPromptState, moodHistory, selectedVoiceGender, FIRESTORE_SYNC_ENABLED]);

  useEffect(() => {
    if (!hasBootstrapped || showVoicePicker || showMoodPrompt) return;

    const todayTag = getTodayTag();
    const todayState = supportPromptState[todayTag] || {};
    const currentHour = getBrasiliaHour(currentTime);

    if (!todayState.firstEntryShown) {
      openMoodPromptForSlot('firstEntryShown');
      return;
    }

    if (currentHour >= 21 && !todayState.nightShown) {
      openMoodPromptForSlot('nightShown');
    }
  }, [hasBootstrapped, showVoicePicker, showMoodPrompt, supportPromptState, currentTime, openMoodPromptForSlot]);

  useEffect(() => {
    if (notificationsEnabled && !isNativePlatform) {
      notificationInterval.current = setInterval(() => {
        sendNotificationRef.current?.();
      }, 8 * 60 * 60 * 1000);
    } else {
      if (notificationInterval.current) clearInterval(notificationInterval.current);
    }
    return () => {
      if (notificationInterval.current) clearInterval(notificationInterval.current);
    };
  }, [notificationsEnabled, isNativePlatform]);

  const getNextCycleVerse = () => {
    const recentReferences = history.slice(-RECENT_VARIETY_WINDOW).map((verse) => verse.reference);
    let activeCycle = localCycle;
    let activeIndex = localCycleIndex;

    if (activeCycle.length === 0 || activeIndex >= activeCycle.length) {
      const freshPool = LOCAL_DATABASE.filter((verse) => !recentReferences.includes(verse.reference));
      activeCycle = shuffleVerses(freshPool.length > 0 ? freshPool : LOCAL_DATABASE);
      if (currentVerse && activeCycle.length > 1 && activeCycle[0].id === currentVerse.id) {
        const [firstVerse, secondVerse] = activeCycle;
        activeCycle[0] = secondVerse;
        activeCycle[1] = firstVerse;
      }
      activeIndex = 0;
    }

    const selectedVerse = { ...activeCycle[activeIndex], source: 'local' };
    setLocalCycle(activeCycle);
    setLocalCycleIndex(activeIndex + 1);
    return selectedVerse;
  };

  const getNextOnlineReference = () => {
    const recentRefs = history.slice(-RECENT_VARIETY_WINDOW).map((verse) => normalizeText(verse.reference));
    let activeCycle = onlineCycle;
    let activeIndex = onlineCycleIndex;

    if (activeCycle.length === 0 || activeIndex >= activeCycle.length) {
      const freshPool = ONLINE_REFERENCE_POOL.filter((reference) => !recentRefs.includes(normalizeText(reference)));
      activeCycle = shuffleVerses(freshPool.length > 0 ? freshPool : ONLINE_REFERENCE_POOL);
      activeIndex = 0;
    }

    const selectedReference = activeCycle[activeIndex];
    setOnlineCycle(activeCycle);
    setOnlineCycleIndex(activeIndex + 1);
    return selectedReference;
  };

  const markVerseProgress = (patch) => {
    if (!currentVerse) return;
    const verseKey = getVerseKey(currentVerse);
    setVerseProgress((previous) => ({
      ...previous,
      [verseKey]: {
        heard: false,
        completed: false,
        ...(previous[verseKey] || {}),
        ...patch,
      },
    }));
  };

  const getNextNotificationReferences = (count) => {
    let activeCycle = notificationCycle;
    let activeIndex = notificationCycleIndex;
    const references = [];

    while (references.length < count) {
      if (activeCycle.length === 0 || activeIndex >= activeCycle.length) {
        activeCycle = shuffleVerses(ONLINE_REFERENCE_POOL);
        activeIndex = 0;
      }

      references.push(activeCycle[activeIndex]);
      activeIndex += 1;
    }

    setNotificationCycle(activeCycle);
    setNotificationCycleIndex(activeIndex);
    return references;
  };

  const fetchNotificationVerse = async (reference) => {
    for (const candidate of buildReferenceCandidates(reference)) {
      try {
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(candidate)}?translation=almeida`);
        if (!response.ok) continue;
        const data = await response.json();
        if (!data?.text) continue;

        const verseText = (data.text || '').replace(/\n/g, ' ').trim();
        const firstVerse = Array.isArray(data.verses) && data.verses.length > 0 ? data.verses[0] : null;
        const chapter = firstVerse?.chapter ?? data.chapter;
        const verseNumber = firstVerse?.verse ?? data.verse;
        const translatedBook = translateBook(firstVerse?.book_name || data.book_name || '');
        const normalizedReference = chapter && verseNumber
          ? `${translatedBook} ${chapter}:${verseNumber}`
          : (data.reference || reference);

        return {
          id: `notification-${normalizedReference}`,
          reference: normalizedReference,
          text: verseText,
          source: 'online'
        };
      } catch (error) {
        console.error('Erro ao buscar versículo da notificação:', error);
      }
    }

    const localMatch = LOCAL_DATABASE.find((verse) => normalizeText(verse.reference) === normalizeText(reference));
    return localMatch ? { ...localMatch, source: 'local' } : null;
  };

  const formatNotificationBody = (verse) => {
    const preview = verse.text.length > 120 ? `${verse.text.substring(0, 120)}...` : verse.text;
    return `${verse.reference} — ${preview}`;
  };

  const buildUnexpectedNotificationDate = (dayOffset, slotIndex) => {
    const baseHours = [9, 14, 20];
    const at = new Date();
    at.setDate(at.getDate() + dayOffset + 1);
    at.setHours(baseHours[slotIndex], 7 + ((dayOffset * 13 + slotIndex * 11) % 43), 0, 0);
    return at;
  };

  const clearNativeNotifications = async () => {
    const ids = Array.from({ length: NATIVE_NOTIFICATION_COUNT }, (_, index) => ({ id: NATIVE_NOTIFICATION_BASE_ID + index }));
    await LocalNotifications.cancel({ notifications: ids });
  };

  const scheduleNativeDevotionalNotifications = async () => {
    await clearNativeNotifications();

    const references = getNextNotificationReferences(NATIVE_NOTIFICATION_COUNT);
    const fetchedVerses = await Promise.all(references.map((reference) => fetchNotificationVerse(reference)));
    const notifications = fetchedVerses
      .map((verse, index) => {
        if (!verse) return null;
        const dayOffset = Math.floor(index / NOTIFICATIONS_PER_DAY);
        const slotIndex = index % NOTIFICATIONS_PER_DAY;
        return {
          id: NATIVE_NOTIFICATION_BASE_ID + index,
          title: 'LUMINA: Versículo inesperado',
          body: formatNotificationBody(verse),
          schedule: {
            at: buildUnexpectedNotificationDate(dayOffset, slotIndex),
            allowWhileIdle: true,
          }
        };
      })
      .filter(Boolean);

    await LocalNotifications.schedule({ notifications });
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (isNativePlatform) {
        const permission = await LocalNotifications.requestPermissions();
        if (permission.display === 'granted') {
          await scheduleNativeDevotionalNotifications();
          setNotificationsEnabled(true);
          alert('Notificações ativas. Você receberá 3 versículos inesperados por dia, sem repetição por 15 dias e respeitando o ciclo disponível.');
        } else {
          alert('Permissão negada para notificações.');
          setNotificationsEnabled(false);
        }
      } else {
        if (!("Notification" in window)) {
          alert("Este navegador não suporta notificações de sistema.");
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          new Notification("LUMINA ativado", {
            body: "Você receberá 3 versículos inesperados por dia.",
            icon: "/icon.png"
          });
        } else {
          alert("Permissão negada para notificações.");
          setNotificationsEnabled(false);
        }
      }
    } else {
      if (isNativePlatform) {
        await clearNativeNotifications();
      }
      setNotificationsEnabled(false);
    }
  };

  const sendNotification = async () => {
    const [reference] = getNextNotificationReferences(1);
    const verse = await fetchNotificationVerse(reference);
    if (Notification.permission === "granted" && verse) {
      new Notification("LUMINA: Versículo inesperado", {
        body: formatNotificationBody(verse),
        icon: "/icon.png"
      });
    }
  };

  sendNotificationRef.current = sendNotification;

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    window.speechSynthesis.cancel();
    speechRef.current = null;
    setIsSpeaking(false);
  };

  const speakWithBackendTTS = async (text) => {
    if (!USE_BACKEND_TTS) return false;

    const cloudVoiceName = CLOUD_VOICE_BY_GENDER[selectedVoiceGender] || BACKEND_TTS_VOICE_NAME;
    const ttsEndpoint = `${BACKEND_TTS_BASE_URL}/api/tts`;

    try {
      const response = await fetch(ttsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: humanizeSpeechText(text),
          languageCode: 'pt-BR',
          voiceName: cloudVoiceName,
          audioEncoding: 'MP3',
        }),
      });

      if (!response.ok) return false;

      const contentType = response.headers.get('content-type') || '';
      let audioBlob = null;

      if (contentType.includes('application/json')) {
        const payload = await response.json();
        const audioBase64 = payload?.audioBase64 || payload?.audioContentBase64 || payload?.audioContent;
        if (!audioBase64) return false;
        const binary = atob(audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        audioBlob = new Blob([bytes], { type: payload?.mimeType || 'audio/mpeg' });
      } else {
        audioBlob = await response.blob();
      }

      if (!audioBlob || audioBlob.size === 0) return false;

      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      audioUrlRef.current = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrlRef.current);
      audio.preload = 'auto';
      audioRef.current = audio;
      const resolvedVoiceName = response.headers.get('x-tts-voice') || cloudVoiceName;
      setVoiceLabel(`Google Cloud (${resolvedVoiceName})`);
      setIsSpeaking(true);

      audio.onended = () => {
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
        setIsSpeaking(false);
      };

      audio.onerror = () => {
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
        setIsSpeaking(false);
      };

      await audio.play();
      return true;
    } catch (error) {
      console.error('Falha ao reproduzir TTS do backend:', error);
      return false;
    }
  };

  const chooseComfortVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const portugueseVoices = voices.filter((voice) => /pt-BR|pt_BR|Portuguese/i.test(`${voice.lang} ${voice.name}`));
    if (portugueseVoices.length === 0) return voices[0] || null;

    const avoidTokens = ['google portugues do brasil', 'google translate', 'translate'];
    const preferredPool = portugueseVoices.filter((voice) => {
      const name = voice.name.toLowerCase();
      return !avoidTokens.some((token) => name.includes(token));
    });

    const pool = preferredPool.length > 0 ? preferredPool : portugueseVoices;
    const feminineTokens = ['female', 'feminina', 'woman', 'mulher', 'luciana', 'francisca', 'helena', 'maria', 'ana'];
    const masculineTokens = ['male', 'masculina', 'man', 'homem', 'antonio', 'daniel', 'ricardo', 'felipe', 'joao'];
    const preferredTokens = selectedVoiceGender === 'male' ? masculineTokens : feminineTokens;
    const prioritizedTokens = [...preferredTokens, 'neural', 'natural', 'microsoft', 'samsung', 'apple'];

    for (const token of prioritizedTokens) {
      const found = pool.find((voice) => voice.name.toLowerCase().includes(token));
      if (found) return found;
    }

    return pool[0];
  };

  const speakText = async (text) => {
    if (!text) return false;
    if (isSpeaking) {
      stopSpeech();
      return false;
    }

    const backendPlayed = await speakWithBackendTTS(text);
    if (backendPlayed) return true;
    if (!('speechSynthesis' in window)) return false;

    const selectedVoice = chooseComfortVoice();
    const segments = splitSpeechSegments(text);
    if (segments.length === 0) return false;

    if (selectedVoice) setVoiceLabel(selectedVoice.name);

    let queueIndex = 0;
    setIsSpeaking(true);
    window.speechSynthesis.cancel();

    const speakNext = () => {
      if (queueIndex >= segments.length) {
        speechRef.current = null;
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(segments[queueIndex]);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.lang = 'pt-BR';
      utterance.rate = 1.07;
      utterance.pitch = 1.02;
      utterance.volume = 0.95;
      utterance.onend = () => {
        queueIndex += 1;
        setTimeout(speakNext, 120);
      };
      utterance.onerror = () => {
        speechRef.current = null;
        setIsSpeaking(false);
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakNext();
    return true;
  };

  const handleReadVerse = async () => {
    if (!currentVerse) return;
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    const todayTag = getTodayTag();
    const todayState = dailyChecklist[todayTag] || {};
    const todayVerseAudioPlays = Number(todayState.verseAudioPlays) || 0;

    if (todayVerseAudioPlays >= MAX_DAILY_VERSE_PLAYS) {
      alert(`Você atingiu o limite diário de ${MAX_DAILY_VERSE_PLAYS} audições de versículos. A contagem reinicia amanhã.`);
      return;
    }

    const started = await speakText(`Versículo de hoje, ${currentVerse.reference}. Ouça com calma. ${currentVerse.text}`);
    if (!started) return;

    saveSeenVerse(currentVerse);
    addJourneyAction('verseReads');
    setDailyChecklist((previous) => {
      const current = previous[todayTag] || { moodLogged: false, verseRead: false, explanationRead: false, completionCount: 0, verseReferences: [], verseAudioPlays: 0 };
      const verseReferences = Array.isArray(current.verseReferences) ? current.verseReferences : [];
      const nextVerseReferences = verseReferences.includes(currentVerse.reference)
        ? verseReferences
        : [...verseReferences, currentVerse.reference];

      return {
        ...previous,
        [todayTag]: {
          ...current,
          verseReferences: nextVerseReferences,
          verseAudioPlays: (Number(current.verseAudioPlays) || 0) + 1,
        },
      };
    });
    markVerseProgress({ heard: true });
  };

  const handleMarkVerseAsRead = () => {
    if (!currentVerse) return;
    const verseState = verseProgress[getVerseKey(currentVerse)] || { heard: false, completed: false };
    if (!verseState.heard) {
      alert('Antes de avançar, ouça o versículo atual.');
      return;
    }
    saveSeenVerse(currentVerse);
    markChecklistAction('verseRead');
    markVerseProgress({ completed: true });
  };

  const handleReadExplanation = () => {
    if (!currentVerse) return;
    saveSeenVerse(currentVerse);
    markChecklistAction('explanationRead');
    addJourneyAction('explanationReads');
    speakText(`Entendimento de hoje. ${currentVerse.ai_explanation}`);
  };

  const handleVoicePreview = () => {
    speakText(`Exemplo de voz ${getVoiceGenderLabel(selectedVoiceGender).toLowerCase()}. Deus está com você, com paz, cuidado e esperança para hoje.`);
  };

  // --- NOVA INTEGRAÇÃO: API DE CONTEXTO ---
  const fetchContextFromWikipedia = async (bookName) => {
    try {
      // Busca na Wikipédia em Português
      // Nota: 'origin=*' é necessário para contornar bloqueios de CORS em navegadores modernos
      const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(bookName)}&origin=*`;

      const response = await fetch(searchUrl);
      const data = await response.json();
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === "-1") return null; // Não encontrou

      let extract = pages[pageId].extract;

      // Limpa e resume o texto para não ficar gigante
      if (extract) {
        // Pega as 3 primeiras frases para um resumo conciso
        const sentences = extract.split('. ');
        let summary = sentences.slice(0, 3).join('. ') + '.';
        if (summary.length > 300) summary = summary.substring(0, 300) + "...";
        return `CONTEXTO DO LIVRO (${bookName.toUpperCase()}): ${summary}`;
      }
      return null;
    } catch (e) {
      console.error("Erro ao buscar contexto:", e);
      return null;
    }
  };

  const fetchByReferenceFromAPI = async (referenceQuery) => {
    try {
      let data = null;

      for (const candidate of buildReferenceCandidates(referenceQuery)) {
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(candidate)}?translation=almeida`);
        if (!response.ok) continue;
        data = await response.json();
        if (data?.text) break;
      }

      if (!data?.text) throw new Error('Referência não encontrada na API');

      const verseText = (data.text || '').replace(/\n/g, ' ').trim();
      if (!verseText) return null;

      const firstVerse = Array.isArray(data.verses) && data.verses.length > 0 ? data.verses[0] : null;
      const chapter = firstVerse?.chapter ?? data.chapter;
      const verseNumber = firstVerse?.verse ?? data.verse;
      const translatedBook = translateBook(firstVerse?.book_name || data.book_name || '');
      const normalizedReference = chapter && verseNumber
        ? `${translatedBook} ${chapter}:${verseNumber}`
        : (data.reference || referenceQuery);

      let context = await fetchContextFromWikipedia(translatedBook || normalizedReference.split(' ')[0]);
      if (!context) {
        context = `Reflexão sobre ${translatedBook || normalizedReference}: ` + generateStaticFallback(verseText);
      }

      return {
        id: `api-search-${Date.now()}`,
        reference: normalizedReference,
        text: verseText,
        ai_explanation: context,
        source: 'online'
      };
    } catch (error) {
      console.error('Erro na busca por referência:', error);
      return null;
    }
  };

  const saveSeenVerse = (verse) => {
    if (!verse) return;
    setSeenVerses((previous) => {
      const exists = previous.some((v) => v.reference === verse.reference && v.text === verse.text);
      if (!exists) {
        return [...previous, verse].slice(-300);
      }
      return previous;
    });
  };

  const markChecklistAction = (actionKey) => {
    const todayTag = getTodayTag();
    setDailyChecklist((previous) => {
      const current = previous[todayTag] || { moodLogged: false, verseRead: false, explanationRead: false, completionCount: 0 };
      const updated = { ...current, [actionKey]: true };

      // Incrementa completionCount se é primeira vez ou é re-completion mesmo dia
      if (updated.moodLogged && updated.verseRead && updated.explanationRead) {
        if (!current.completedAt) {
          // Primeira vez completa no dia
          updated.completedAt = Date.now();
          updated.completionCount = (current.completionCount || 0) + 1;
        } else {
          // Re-completion no mesmo dia
          updated.completionCount = (current.completionCount || 0) + 1;
        }
      }

      return { ...previous, [todayTag]: updated };
    });
  };

  const addJourneyAction = (actionKey) => {
    setJourneyStats((previous) => ({
      ...previous,
      [actionKey]: (previous[actionKey] || 0) + 1,
    }));
  };

  const handleNextVerse = async () => {
    const verseState = currentVerse ? (verseProgress[getVerseKey(currentVerse)] || { heard: false, completed: false }) : null;
    if (currentVerse && (!verseState?.heard || !verseState?.completed)) {
      alert('Para seguir para o próximo, ouça o versículo atual e marque como concluído.');
      return;
    }

    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentVerse(history[nextIndex]);
      setShowExplanation(false);
      return;
    }

    setIsLoadingVerse(true);

    // Rotina offline: Se offline e tem seenVerses, rotaciona entre vistos
    if (!isOnline && seenVerses.length > 0) {
      const recentReferences = history.slice(-RECENT_VARIETY_WINDOW).map((verse) => verse.reference);
      const offlinePool = seenVerses.filter((verse) => !recentReferences.includes(verse.reference));
      const pool = offlinePool.length > 0 ? offlinePool : seenVerses;
      const randomVerse = pool[Math.floor(Math.random() * pool.length)];
      const newHistory = [...history, randomVerse];
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      setCurrentVerse(randomVerse);
      setShowExplanation(false);
      alert('Você está offline. Estamos mostrando versículos já vistos; para receber novos e uma experiência melhor, conecte-se à internet.');
      setIsLoadingVerse(false);
      return;
    }

    let newVerse = null;

    if (isOnline) {
      const nextReference = getNextOnlineReference();
      newVerse = await fetchByReferenceFromAPI(nextReference);
    }

    if (!newVerse) {
      newVerse = getNextCycleVerse();
    }

    saveSeenVerse(newVerse);

    const newHistory = [...history, newVerse];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setCurrentVerse(newVerse);
    setShowExplanation(false);
    setIsLoadingVerse(false);
  };

  const handleMoodSupport = () => {
    const cleanedMood = moodInput.trim();
    if (!cleanedMood) return;

    const moodScore = getMoodScore(cleanedMood);
    const todayTag = getTodayTag();
    const now = new Date();

    setComfortMessage(buildComfortMessage(cleanedMood));
    markChecklistAction('moodLogged');
    addJourneyAction('moodLogs');
    setMoodHistory((previous) => [
      ...previous,
      {
        tag: todayTag,
        mood: cleanedMood,
        score: moodScore,
        message: buildComfortMessage(cleanedMood),
        time: getBrasiliaClock(now),
      },
    ].slice(-120));
    setMoodInput('');
    setShowMoodPrompt(false);
  };

  const handleSelectVoiceGender = (gender) => {
    persistVoicePreference(gender);
    setVoiceSelectionRequired(false);
    setShowVoicePicker(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentVerse(history[prevIndex]);
      setShowExplanation(false);
    }
  };

  const toggleExplanation = () => {
    if (showExplanation) {
      setShowExplanation(false);
      return;
    }
    setIsExplaining(true);
    // Tempo simulado para parecer que a "IA" está pensando (melhora a UX)
    setTimeout(() => {
      setIsExplaining(false);
      setShowExplanation(true);
    }, 1000);
  };

  const handleShare = () => {
    if (navigator.share && currentVerse) {
      navigator.share({
        title: 'LUMINA - Versículo',
        text: `"${currentVerse.text}"\n— ${currentVerse.reference}\n\n${currentVerse.ai_explanation}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      const text = `"${currentVerse.text}" - ${currentVerse.reference}`;
      navigator.clipboard.writeText(text);
      alert("Copiado para a área de transferência!");
    }
  };

  const navigateToSearchResult = (verse) => {
    const verseWithSource = { ...verse, source: verse.source || 'local' };
    const newHistory = [...history, verseWithSource];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setCurrentVerse(verseWithSource);
    setShowExplanation(false);
    saveSeenVerse(verseWithSource);
    addJourneyAction('referenceSearches');
    setSearchResults([]);
  };

  const handleReferenceSearch = async (queryOverride) => {
    const query = normalizeReferenceInput(queryOverride ?? referenceInput);
    if (!query) return;

    setIsLoadingVerse(true);
    setSearchResults([]);

    let searchedVerse = null;
    const localMatches = searchLocalVerses(query, 40);

    if (localMatches.length === 1) {
      [searchedVerse] = localMatches;
    } else if (localMatches.length > 1) {
      setSearchResults(localMatches);
      setReferenceInput('');
      setIsLoadingVerse(false);
      return;
    }

    if (!searchedVerse && isReferenceLikeQuery(query)) {
      searchedVerse = await fetchByReferenceFromAPI(query);
    }

    if (!searchedVerse) {
      alert('Não encontramos na base. Tente buscar por referência, livro, tema ou palavras do texto, como: João 3:16, Lucas, amor, esperança, perdão.');
      setIsLoadingVerse(false);
      return;
    }

    const newHistory = [...history, searchedVerse];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setCurrentVerse(searchedVerse);
    setShowExplanation(false);
    saveSeenVerse(searchedVerse);
    addJourneyAction('referenceSearches');
    setRecentReferences((previous) => {
      const filtered = previous.filter((item) => item.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 3);
    });
    setReferenceInput('');
    setIsLoadingVerse(false);
  };

  const todayTag = getTodayTag();
  const todayChecklist = dailyChecklist[todayTag] || { moodLogged: false, verseRead: false, explanationRead: false, verseAudioPlays: 0 };
  const completionPercent = Math.round((Number(todayChecklist.moodLogged) + Number(todayChecklist.verseRead) + Number(todayChecklist.explanationRead)) / 3 * 100);
  const todayVerseAudioPlays = Number(todayChecklist.verseAudioPlays) || 0;
  const remainingVerseAudioPlays = Math.max(0, MAX_DAILY_VERSE_PLAYS - todayVerseAudioPlays);
  const currentVerseProgress = currentVerse ? (verseProgress[getVerseKey(currentVerse)] || { heard: false, completed: false }) : { heard: false, completed: false };
  const canAdvanceVerse = Boolean(currentVerse && currentVerseProgress.heard && currentVerseProgress.completed);

  // Streaks e Badges
  const consecutiveDays = (() => {
    let count = 0;
    let date = new Date();
    while (true) {
      const tag = getBrasiliaDateTag(date);
      if (!dailyChecklist[tag]?.completedAt) break;
      count += 1;
      date.setDate(date.getDate() - 1);
    }
    return count;
  })();

  const totalCompletions = Object.values(dailyChecklist).reduce((sum, day) => sum + (day.completionCount || 0), 0);
  const totalContentConsumed = journeyStats.verseReads + journeyStats.explanationReads + journeyStats.referenceSearches;
  const journeyPoints = (
    journeyStats.verseReads * JOURNEY_POINTS.verseRead
    + journeyStats.explanationReads * JOURNEY_POINTS.explanationRead
    + journeyStats.moodLogs * JOURNEY_POINTS.moodLog
    + journeyStats.referenceSearches * JOURNEY_POINTS.referenceSearch
  );

  const readerBadge = (() => {
    if (journeyPoints >= 1500 || totalCompletions >= 60 || consecutiveDays >= 30) return { text: 'Leitor Fiel a Deus ✨', color: 'text-purple-600' };
    if (journeyPoints >= 700 || totalCompletions >= 30 || consecutiveDays >= 14) return { text: 'Discípulo Constante 🙏', color: 'text-blue-600' };
    if (journeyPoints >= 220 || totalCompletions >= 10 || consecutiveDays >= 5) return { text: 'Leitor Dedicado 📖', color: 'text-green-600' };
    return { text: 'Iniciando Jornada 🌱', color: 'text-orange-600' };
  })();

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const tag = getBrasiliaDateTag(date);
    const dayNumber = tag.slice(8, 10);
    const dayData = dailyChecklist[tag];
    const done = Boolean(dayData?.completedAt);
    const fire = Math.max((dayData?.completionCount || 0) - 1, 0);
    return {
      tag,
      dayNumber,
      weekday: getBrasiliaWeekday(date),
      done,
      fire,
    };
  });

  const selectedDayDetails = selectedCalendarTag
    ? {
        tag: selectedCalendarTag,
        dayData: dailyChecklist[selectedCalendarTag] || {},
        moods: moodHistory.filter((item) => item.tag === selectedCalendarTag),
      }
    : null;

  if (!currentVerse && !isLoadingVerse) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-500 font-bold tracking-widest animate-pulse">CONECTANDO AO CÉU...</div>;

  // --- MODO STANDBY ---
  if (standbyMode) {
    return (
      <div
        className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-between p-8 transition-all duration-1000"
        onClick={() => setStandbyMode(false)}
      >
        <div className="w-full flex justify-between items-start opacity-30 hover:opacity-100 transition-opacity">
          <span className="text-xs tracking-widest uppercase text-amber-500/80">Toque para despertar</span>
          <Minimize2 size={20} className="text-amber-500/80" />
        </div>

        <div className="flex flex-col items-center text-center space-y-10 animate-fade-in w-full max-w-4xl">
          <div className="text-[min(15vw,8rem)] font-extralight tracking-tighter leading-none select-none text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            {formatTime(currentTime)}
          </div>

          <div className="max-w-2xl px-4">
            <p className="text-xl md:text-3xl font-serif italic text-slate-300 leading-relaxed">
              "{currentVerse?.text}"
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-amber-500">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-700"></span>
              <p className="text-sm tracking-[0.3em] uppercase font-bold drop-shadow-md">
                {currentVerse?.reference}
              </p>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-700"></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 text-xs uppercase tracking-widest mb-8">
          <Moon size={12} />
          Modo Contemplação
        </div>
      </div>
    );
  }

  // --- APP PRINCIPAL ---
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-800 font-sans flex flex-col overflow-x-hidden overflow-y-auto relative">

      {/* Background Decorativo Rico */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-blue-950 to-blue-900 rounded-b-[3rem] shadow-2xl z-0" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center gap-3 px-4 sm:px-6 py-4 sm:py-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
            <img src="/icon-app.png" alt="LUMINA" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">LUMINA</h1>
            <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">Devocional Diário</span>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className={`flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
            {isOnline ? 'Conectado' : 'Sem internet'}
          </div>
          <button
            onClick={() => setShowVoicePicker(true)}
            className="px-3 h-10 rounded-full bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 transition-colors text-[10px] font-bold tracking-widest uppercase"
          >
            Voz {selectedVoiceGender === 'male' ? 'M' : 'F'}
          </button>
          <button
            onClick={toggleNotifications}
            className={`p-2.5 rounded-full transition-all duration-300 border ${notificationsEnabled ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
          >
            {notificationsEnabled ? <Bell size={18} fill="currentColor" /> : <BellOff size={18} />}
          </button>
          <button
            onClick={() => setStandbyMode(true)}
            className="p-2.5 rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col px-4 sm:px-6 pt-2 pb-24 sm:pb-8 max-w-3xl mx-auto w-full">
        <div className="mb-3 bg-white/90 border border-slate-100 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-widest font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <span>Semanal com Deus</span>
              <span className={`text-xs px-2 py-1 rounded-lg font-bold ${readerBadge.color}`}>{readerBadge.text}</span>
            </div>
            <span>Brasília {getBrasiliaClock(currentTime)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mb-3">
            {weekDays.map((day) => (
              <button key={day.tag} onClick={() => setSelectedCalendarTag(day.tag)} className="flex flex-col items-center gap-0.5 rounded-xl px-1 py-1 hover:bg-slate-50 transition-colors">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">{day.weekday}</span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${day.done ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  {day.dayNumber}
                </div>
                {day.fire > 0 && (
                  <div className="text-[9px] tracking-tight">
                    {Array.from({ length: Math.min(day.fire, 3) }).map((_, i) => <span key={i}>🔥</span>)}
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Toque em um dia para ver versículos lidos e sentimentos registrados.</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className={`text-[10px] px-2 py-1 rounded-lg border font-bold uppercase tracking-wide ${todayChecklist.moodLogged ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>Sentimento</div>
            <div className={`text-[10px] px-2 py-1 rounded-lg border font-bold uppercase tracking-wide ${todayChecklist.verseRead ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>Versículo concluído</div>
            <div className={`text-[10px] px-2 py-1 rounded-lg border font-bold uppercase tracking-wide ${todayChecklist.explanationRead ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>Entendimento concluído</div>
          </div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Progresso de hoje: {completionPercent}%</p>
          <p className="text-xs font-semibold text-blue-700 mb-1">Pontuação da jornada: {journeyPoints} pts</p>
          <p className="text-[11px] text-slate-500">Conteúdos consumidos: {totalContentConsumed} • Sentimentos registrados: {journeyStats.moodLogs}</p>
        </div>

        <div className="mb-3 bg-white/90 border border-slate-100 rounded-2xl p-3 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={moodInput}
              onChange={(event) => setMoodInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleMoodSupport();
              }}
              placeholder="Como você se sente hoje?"
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <button
              onClick={handleMoodSupport}
              className="h-11 px-4 rounded-xl bg-amber-500 text-white text-xs font-bold tracking-wide uppercase hover:bg-amber-400"
            >
              Acolher
            </button>
          </div>
          {comfortMessage && (
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {comfortMessage}
            </p>
          )}
        </div>

        <div className="mb-4 bg-white/90 border border-slate-100 rounded-2xl p-3 shadow-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={referenceInput}
              onChange={(event) => setReferenceInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleReferenceSearch();
              }}
              placeholder="Buscar livro, referência, tema ou palavra (ex: Lucas, João 3:16, amor)"
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleReferenceSearch}
              disabled={isLoadingVerse}
              className="h-11 px-4 rounded-xl bg-blue-700 text-white text-xs font-bold tracking-wide uppercase hover:bg-blue-600 disabled:opacity-60"
            >
              Buscar
            </button>
          </div>
          {recentReferences.length > 0 && searchResults.length === 0 && (
            <div className="mt-3">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-2">Últimas buscas</p>
              <div className="flex flex-wrap gap-2">
                {recentReferences.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleReferenceSearch(item)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          {searchResults.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}</p>
                <button onClick={() => setSearchResults([])} className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded">✕ Fechar</button>
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {searchResults.map((verse) => (
                  <button
                    key={verse.id}
                    onClick={() => navigateToSearchResult(verse)}
                    className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                  >
                    <p className="text-xs font-bold text-blue-700 mb-1">{verse.reference}</p>
                    <p className="text-xs text-slate-500 line-clamp-2">{verse.text}</p>
                    {verse.theme && <p className="text-[10px] text-amber-600 mt-1 uppercase tracking-wide">{verse.theme}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center py-4">
          <div className={`bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(30,58,138,0.2)] p-8 md:p-12 relative overflow-hidden transition-all duration-500 border border-slate-100 ${isLoadingVerse ? 'opacity-90 scale-[0.99] blur-sm' : 'opacity-100 scale-100'}`}>

            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />
            <Quote className="text-slate-50 w-40 h-40 absolute -top-6 -left-6 transform -rotate-12 -z-0 pointer-events-none" />

            <div className="z-10 relative flex flex-col items-center text-center">
              <div className="mb-8">
                <span className={`text-[10px] font-bold tracking-[0.3em] uppercase px-4 py-1.5 rounded-full border flex items-center gap-2 ${currentVerse?.source === 'online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {currentVerse?.source === 'online' && <Globe size={10} />}
                  Versículo
                </span>
              </div>

              {isLoadingVerse ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                  <span className="text-xs uppercase tracking-widest">Buscando na nuvem...</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-serif text-slate-800 leading-relaxed mb-8 selection:bg-amber-100">
                    "{currentVerse?.text}"
                  </p>
                  <div className="relative">
                    <p className="text-lg font-bold text-blue-950 pb-2 px-6 relative z-10">
                      {currentVerse?.reference}
                    </p>
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-amber-100/50 -rotate-1 z-0"></div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center gap-4 mt-12 z-10 relative">
              <button
                onClick={handleShare}
                className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95"
                title="Compartilhar"
              >
                <Share2 size={20} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={handleReadVerse}
                disabled={!isSpeaking && remainingVerseAudioPlays === 0}
                className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95"
                title="Ouvir versículo"
              >
                {isSpeaking ? <VolumeX size={20} className="group-hover:scale-105 transition-transform" /> : <Volume2 size={20} className="group-hover:scale-105 transition-transform" />}
              </button>

              <button
                onClick={handleMarkVerseAsRead}
                className="group inline-flex items-center gap-2 px-4 py-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 transition-all active:scale-95 text-xs font-bold uppercase tracking-wide"
                title="Marcar como concluído"
              >
                <Check size={18} className="group-hover:scale-105 transition-transform" />
                Concluído
              </button>

              <button
                onClick={toggleExplanation}
                disabled={isLoadingVerse}
                className={`flex-1 max-w-xs flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95
                  ${showExplanation
                    ? 'bg-slate-900 text-white shadow-slate-200'
                    : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-blue-500/20 hover:shadow-blue-500/30 hover:to-blue-500'
                  }`}
              >
                {isExplaining ? (
                  <span className="animate-pulse flex items-center gap-2">
                    <Sparkles size={16} className="animate-spin" /> BUSCANDO CONTEXTO...
                  </span>
                ) : (
                  <>
                    <Sparkles size={16} className={showExplanation ? '' : 'text-amber-300'} />
                    {showExplanation ? 'FECHAR INSIGHT' : 'ENTENDIMENTO'}
                  </>
                )}
              </button>
            </div>
            <p className="mt-4 text-center text-xs text-slate-500 z-10 relative">
              Áudios de versículo hoje: <span className="font-bold text-slate-700">{todayVerseAudioPlays}/{MAX_DAILY_VERSE_PLAYS}</span>
              {' · '}
              {remainingVerseAudioPlays > 0 ? `${remainingVerseAudioPlays} restantes hoje` : 'limite diário atingido'}
            </p>
          </div>
        </div>

        {showExplanation && currentVerse && (
          <div className="animate-slide-up mx-2 mb-4">
            <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl shadow-blue-900/5 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
              <div className="flex items-start gap-4 pl-2">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 mt-1 shrink-0">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase text-slate-400 mb-2 tracking-widest">
                    {currentVerse.source === 'online' ? 'Contexto Histórico & Teológico (Wiki)' : 'Insight Devocional'}
                  </h3>
                  <p className="text-slate-700 leading-relaxed text-sm md:text-base font-medium">
                    {currentVerse.ai_explanation}
                  </p>
                  <button
                    onClick={handleReadExplanation}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-500"
                  >
                    {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    Ouvir entendimento ({voiceLabel})
                  </button>
                  <button
                    onClick={() => {
                      saveSeenVerse(currentVerse);
                      markChecklistAction('explanationRead');
                      addJourneyAction('explanationReads');
                    }}
                    className="mt-4 ml-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-600 hover:text-emerald-500"
                  >
                    <Check size={14} />
                    Concluído
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {showVoicePicker && (
        <div className="fixed inset-0 z-[70] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Escolha sua voz</p>
                <h3 className="text-lg font-bold text-slate-800">Como você prefere ouvir?</h3>
              </div>
              {hasBootstrapped && !voiceSelectionRequired && (
                <button onClick={() => setShowVoicePicker(false)} className="text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-slate-600">
                  Fechar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectVoiceGender('female')}
                className={`h-12 rounded-2xl text-xs font-bold uppercase tracking-wide border transition-colors ${selectedVoiceGender === 'female' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                Voz feminina
              </button>
              <button
                onClick={() => handleSelectVoiceGender('male')}
                className={`h-12 rounded-2xl text-xs font-bold uppercase tracking-wide border transition-colors ${selectedVoiceGender === 'male' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                Voz masculina
              </button>
            </div>
            <button
              onClick={handleVoicePreview}
              className="mt-4 w-full h-11 rounded-2xl bg-slate-900 text-white text-xs font-bold uppercase tracking-wide hover:bg-slate-800"
            >
              Ouvir exemplo
            </button>
          </div>
        </div>
      )}

      {showMoodPrompt && (
        <div className="fixed inset-0 z-[65] bg-slate-950/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-5">
            <p className="text-[11px] uppercase tracking-widest font-bold text-amber-500 mb-2">Acolher</p>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Como você se sente agora?</h3>
            <p className="text-sm text-slate-500 mb-4">Escreva em poucas palavras para receber cuidado e registrar seu momento.</p>
            <input
              type="text"
              value={moodInput}
              onChange={(event) => setMoodInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleMoodSupport();
              }}
              placeholder="Ex: ansiosa, em paz, cansada"
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowMoodPrompt(false)} className="flex-1 h-11 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide hover:bg-slate-50">
                Agora não
              </button>
              <button onClick={handleMoodSupport} className="flex-1 h-11 rounded-2xl bg-amber-500 text-white text-xs font-bold uppercase tracking-wide hover:bg-amber-400">
                Acolher
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDayDetails && (
        <div className="fixed inset-0 z-[60] bg-slate-950/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedCalendarTag(null)}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400">Dia selecionado</p>
                <h3 className="text-lg font-bold text-slate-800">{selectedDayDetails.tag}</h3>
              </div>
              <button onClick={() => setSelectedCalendarTag(null)} className="text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-slate-600">
                Fechar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Versículos lidos</p>
                <p className="text-2xl font-bold text-slate-800">{Array.isArray(selectedDayDetails.dayData.verseReferences) ? selectedDayDetails.dayData.verseReferences.length : 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-1">Sentimentos</p>
                <p className="text-sm font-semibold text-slate-700">{selectedDayDetails.moods.length > 0 ? `${selectedDayDetails.moods.length} registro(s)` : 'Não registrado'}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-2">Possíveis sentimentos</p>
              {selectedDayDetails.moods.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedDayDetails.moods.map((item, index) => (
                    <span key={`${item.time}-${index}`} className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
                      {item.mood}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nenhum sentimento registrado nesse dia.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="bg-white border-t border-slate-100 p-4 pb-8 safe-area-bottom z-50 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex justify-between items-center px-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || isLoadingVerse}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${currentIndex === 0 ? 'text-slate-200 bg-slate-50' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95'}`}
          >
            <ChevronLeft size={22} />
          </button>

          <div className="flex flex-col items-center px-4">
            <div className="flex gap-1.5 mb-2">
              {history.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-slate-200'}`}
                  style={{ display: Math.abs(currentIndex - idx) > 2 ? 'none' : 'block' }}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {currentIndex + 1} / {history.length}
            </span>
          </div>

          <button
            onClick={handleNextVerse}
            disabled={isLoadingVerse || !canAdvanceVerse}
            className={`flex items-center gap-3 pl-5 pr-4 h-12 rounded-xl transition-all shadow-lg group ${isLoadingVerse || !canAdvanceVerse ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-slate-200/20' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-slate-900/10'}`}
          >
            <span className="font-bold text-xs tracking-wide uppercase">{canAdvanceVerse ? 'Próximo' : 'Ouça e conclua'}</span>
            <div className={`w-6 h-6 rounded flex items-center justify-center transition-transform ${canAdvanceVerse ? 'bg-white/20 group-hover:translate-x-1' : 'bg-slate-300'}`}>
              <ChevronRight size={14} />
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
