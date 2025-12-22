import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Bell,
  BellOff,
  Sparkles,
  Share2,
  Maximize2,
  Minimize2,
  Clock,
  Quote,
  Wifi,
  WifiOff,
  Info,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

// --- BANCO DE DADOS CURADO (SELEÇÃO "VERSÍCULOS DE OURO") ---
const LOCAL_DATABASE = [
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

// --- SIMULADOR DE IA (FALLBACK) ---
// Usado apenas se a API online falhar
const generateStaticFallback = (text) => {
  if (text.includes('amor')) return "O amor Ágape é a essência do caráter divino, exigindo ação e não apenas sentimento.";
  if (t.includes('senhor')) return "Reconhecer o senhorio de Cristo coloca todas as outras preocupações em perspectiva.";
  return "Este versículo é uma âncora para a alma, convidando-nos a confiar na fidelidade imutável de Deus.";
};

const formatTime = (date) => {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export default function DevocionalApp() {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentVerse, setCurrentVerse] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [standbyMode, setStandbyMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const notificationInterval = useRef(null);

  useEffect(() => {
    if (!document.querySelector('script[src*="tailwindcss.com"]')) {
      const script = document.createElement('script');
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }

    handleNextVerse();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  useEffect(() => {
    if (notificationsEnabled) {
      notificationInterval.current = setInterval(() => {
        sendNotification();
      }, 7200000);
    } else {
      if (notificationInterval.current) clearInterval(notificationInterval.current);
    }
    return () => clearInterval(notificationInterval.current);
  }, [notificationsEnabled]);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (!("Notification" in window)) {
        alert("Este navegador não suporta notificações de sistema.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("LUMINA Ativado", {
          body: "Você receberá versículos de sabedoria a cada 2 horas.",
          icon: "/icon.png"
        });
      } else {
        alert("Permissão negada para notificações.");
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const sendNotification = () => {
    const randomV = LOCAL_DATABASE[Math.floor(Math.random() * LOCAL_DATABASE.length)];
    if (Notification.permission === "granted") {
      new Notification("LUMINA: Versículo", {
        body: `${randomV.reference} - ${randomV.text.substring(0, 60)}...`,
        icon: "/icon.png"
      });
    }
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

  const fetchFromAPI = async () => {
    try {
      // 1. Busca o Versículo
      const response = await fetch('https://bible-api.com/?random=verse&translation=almeida');
      if (!response.ok) throw new Error('Falha na API da Bíblia');
      const data = await response.json();

      const ptBookName = translateBook(data.book_name);

      // 2. Busca o Entendimento (Contexto) Online
      let context = await fetchContextFromWikipedia(ptBookName);

      // 3. Se falhar, usa o gerador local melhorado
      if (!context) {
        context = `Reflexão sobre ${ptBookName}: ` + generateStaticFallback(data.text);
      }

      return {
        id: `api-${Date.now()}`,
        reference: `${ptBookName} ${data.chapter}:${data.verse}`,
        text: data.text.replace(/\n/g, ' '),
        ai_explanation: context,
        source: 'online'
      };
    } catch (error) {
      console.error("Erro geral:", error);
      return null;
    }
  };

  const handleNextVerse = async () => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentVerse(history[nextIndex]);
      setShowExplanation(false);
      return;
    }

    setIsLoadingVerse(true);
    const tryOnline = isOnline && Math.random() > 0.3; // 70% de chance de online para variar mais
    let newVerse = null;

    if (tryOnline) {
      newVerse = await fetchFromAPI();
    }

    if (!newVerse) {
      let availableVerses = LOCAL_DATABASE.filter(v =>
        !history.slice(-10).some(h => h.id === v.id)
      );
      if (availableVerses.length === 0) availableVerses = LOCAL_DATABASE;
      const randomLocal = availableVerses[Math.floor(Math.random() * availableVerses.length)];
      newVerse = { ...randomLocal, source: 'local' };
    }

    const newHistory = [...history, newVerse];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setCurrentVerse(newVerse);
    setShowExplanation(false);
    setIsLoadingVerse(false);
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
    <div className="min-h-screen bg-[#F5F5F7] text-slate-800 font-sans flex flex-col overflow-hidden relative">

      {/* Background Decorativo Rico */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-blue-950 to-blue-900 rounded-b-[3rem] shadow-2xl z-0" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
            <BookOpen className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">LUMINA</h1>
            <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">Devocional Diário</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className={`flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${isOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
            {isOnline ? 'On' : 'Off'}
          </div>
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
      <main className="relative z-10 flex-1 flex flex-col px-6 pt-2 pb-6 max-w-3xl mx-auto w-full">
        <div className="flex-1 flex flex-col justify-center py-4">
          <div className={`bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(30,58,138,0.2)] p-8 md:p-12 relative overflow-hidden transition-all duration-500 border border-slate-100 ${isLoadingVerse ? 'opacity-90 scale-[0.99] blur-sm' : 'opacity-100 scale-100'}`}>

            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />
            <Quote className="text-slate-50 w-40 h-40 absolute -top-6 -left-6 transform -rotate-12 -z-0 pointer-events-none" />

            <div className="z-10 relative flex flex-col items-center text-center">
              <div className="mb-8">
                <span className={`text-[10px] font-bold tracking-[0.3em] uppercase px-4 py-1.5 rounded-full border flex items-center gap-2 ${currentVerse?.source === 'online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {currentVerse?.source === 'online' && <Globe size={10} />}
                  {currentVerse?.source === 'online' ? 'Descoberta Online' : 'Versículo de Ouro'}
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
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

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
            disabled={isLoadingVerse}
            className="flex items-center gap-3 pl-5 pr-4 h-12 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-900/10 group"
          >
            <span className="font-bold text-xs tracking-wide uppercase">Próximo</span>
            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
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
