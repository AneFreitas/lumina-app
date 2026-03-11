# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Variáveis de ambiente (API Key)

1. Copie o arquivo `.env.example` para `.env.local`.
2. Preencha os valores no seu ambiente local.
3. Não comite `.env.local` (já está ignorado no `.gitignore`).

Exemplo:

```bash
cp .env.example .env.local
```

Para usar voz Google Cloud (não nativa), configure no `.env.local`:

```dotenv
VITE_USE_BACKEND_TTS=true
VITE_TTS_API_BASE_URL=http://localhost:3001
VITE_TTS_VOICE_NAME=pt-BR-Neural2-B
```

O app chama o endpoint `POST /api/tts` no backend com:

```json
{
	"text": "texto para sintetizar",
	"languageCode": "pt-BR",
	"voiceName": "pt-BR-Neural2-B",
	"audioEncoding": "MP3"
}
```

Resposta esperada: `audio/mpeg` (blob) **ou** JSON com `audioBase64`.

### Subir servidor local de voz natural (Google TTS)

1. Preencha `GOOGLE_TTS_API_KEY` no `.env.local`.
2. Inicie o backend de voz:

```bash
npm run tts:server
```

3. Em outro terminal, inicie o app:

```bash
npm run dev
```

Com `VITE_USE_BACKEND_TTS=true`, o app usa voz Google Neural2 (menos robótica) e faz fallback para voz nativa só se o backend falhar.
