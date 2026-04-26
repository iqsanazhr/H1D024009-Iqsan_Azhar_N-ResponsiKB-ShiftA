import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/H1D024009-Iqsan_Azhar_N-ResponsiKB-ShiftA/', // Path repository GitHub Pages
  plugins: [
    tailwindcss(),
    react()
  ],
})
