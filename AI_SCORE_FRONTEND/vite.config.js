import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/ai_score_checker/",
  plugins: [react()]
});
