import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: true,
  },
  // Tambahkan baris di bawah ini agar build mengarah ke nama repository GitHub Anda
  base: '/SIG-DESA-SENGGRENG/', 
})