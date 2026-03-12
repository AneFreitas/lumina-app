import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { Buffer } from 'node:buffer';

const googleTtsApiKey = defineSecret('GOOGLE_TTS_API_KEY');

const DEFAULT_VOICE_CANDIDATES = [
  'pt-BR-Neural2-C',
  'pt-BR-Neural2-B',
  'pt-BR-Neural2-A',
  'pt-BR-Neural2-F',
  'pt-BR-Wavenet-A',
  'pt-BR-Wavenet-B',
];

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const sendCors = (res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
};

const callGoogleTts = async ({ text, voiceName, languageCode, audioEncoding, apiKey }) => {
  const payload = {
    input: { text: text.trim() },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding,
      speakingRate: 1.07,
      pitch: -1.0,
      volumeGainDb: 0.0,
      effectsProfileId: ['headphone-class-device'],
    },
  };

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result?.audioContent) {
    const message = result?.error?.message || 'Falha na síntese de voz';
    throw new Error(message);
  }

  return result.audioContent;
};

export const tts = onRequest({ region: 'us-central1', secrets: [googleTtsApiKey] }, async (req, res) => {
  sendCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method === 'GET' && (req.path === '/health' || req.path.endsWith('/health'))) {
    return res.status(200).json({ ok: true, provider: 'firebase-functions-google-tts' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const apiKey = googleTtsApiKey.value();
    if (!apiKey) {
      return res.status(500).json({ error: 'GOOGLE_TTS_API_KEY não configurada.' });
    }

    const text = String(req.body?.text || '').trim();
    const languageCode = String(req.body?.languageCode || 'pt-BR');
    const requestedVoice = String(req.body?.voiceName || '');
    const audioEncoding = String(req.body?.audioEncoding || 'MP3').toUpperCase();

    if (!text) {
      return res.status(400).json({ error: 'Campo text é obrigatório.' });
    }

    if (text.length > 4500) {
      return res.status(400).json({ error: 'Texto muito longo. Limite recomendado: 4500 caracteres.' });
    }

    const voiceCandidates = unique([
      requestedVoice,
      ...DEFAULT_VOICE_CANDIDATES,
    ]);

    let lastError = null;
    for (const voiceName of voiceCandidates) {
      try {
        const audioBase64 = await callGoogleTts({ text, voiceName, languageCode, audioEncoding, apiKey });
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-TTS-Voice', voiceName);
        return res.status(200).send(audioBuffer);
      } catch (error) {
        lastError = error;
      }
    }

    return res.status(502).json({ error: `Não foi possível sintetizar voz natural: ${lastError?.message || 'erro desconhecido'}` });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Erro inesperado no TTS.' });
  }
});
