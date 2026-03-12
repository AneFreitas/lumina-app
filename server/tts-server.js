import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'node:process';
import { Buffer } from 'node:buffer';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const port = Number(process.env.TTS_SERVER_PORT || 3001);
const googleTtsApiKey = process.env.GOOGLE_TTS_API_KEY;

const DEFAULT_VOICE_CANDIDATES = [
  'pt-BR-Neural2-F',
  'pt-BR-Neural2-C',
  'pt-BR-Neural2-A',
  'pt-BR-Wavenet-A',
  'pt-BR-Wavenet-B',
];

const escapeXml = (unsafe = '') => unsafe
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const buildSoftSsml = (text = '') => {
  const safeText = escapeXml(text.trim());
  return `<speak><prosody rate="110%" pitch="-1st">${safeText}</prosody></speak>`;
};

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const callGoogleTts = async ({ text, voiceName, languageCode, audioEncoding }) => {
  const payload = {
    input: {
      ssml: buildSoftSsml(text),
    },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding,
      speakingRate: 1.12,
      pitch: -1.2,
      volumeGainDb: -1.0,
    },
  };

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsApiKey}`, {
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

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/tts/health', (_, res) => {
  res.json({ ok: true, provider: 'google-cloud-tts' });
});

app.post('/api/tts', async (req, res) => {
  try {
    if (!googleTtsApiKey) {
      return res.status(500).json({ error: 'GOOGLE_TTS_API_KEY não configurada no ambiente local.' });
    }

    const text = String(req.body?.text || '').trim();
    const languageCode = String(req.body?.languageCode || 'pt-BR');
    const requestedVoice = String(req.body?.voiceName || process.env.GOOGLE_TTS_VOICE_NAME || '');
    const audioEncoding = String(req.body?.audioEncoding || process.env.GOOGLE_TTS_AUDIO_ENCODING || 'MP3').toUpperCase();

    if (!text) {
      return res.status(400).json({ error: 'Campo text é obrigatório.' });
    }

    if (text.length > 4500) {
      return res.status(400).json({ error: 'Texto muito longo. Limite recomendado: 4500 caracteres.' });
    }

    const voiceCandidates = unique([
      requestedVoice,
      process.env.GOOGLE_TTS_VOICE_NAME,
      ...DEFAULT_VOICE_CANDIDATES,
    ]);

    let lastError = null;
    for (const voiceName of voiceCandidates) {
      try {
        const audioBase64 = await callGoogleTts({ text, voiceName, languageCode, audioEncoding });
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

app.listen(port, () => {
  console.log(`TTS server online em http://localhost:${port}`);
});
