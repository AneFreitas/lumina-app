import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Esta configuração é essencial para o Vite processar o código React (JSX)
export default defineConfig({
  plugins: [react()],
})
