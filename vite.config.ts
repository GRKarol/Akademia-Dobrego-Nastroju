
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Ładujemy zmienne środowiskowe (np. z Vercela)
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // To pozwala aplikacji używać process.env.API_KEY na produkcji
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
    },
    server: {
      port: 3000,
    }
  };
});
