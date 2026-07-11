import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

// Nombre del repositorio en GitHub Pages (https://usuario.github.io/masajes-app/)
const REPO = 'masajes-app'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? `/${REPO}/` : '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Masajes · Gestión de turnos',
        short_name: 'Masajes',
        description: 'Gestión de turnos, convocantes y caja para masajistas.',
        theme_color: '#2E5A3A',
        background_color: '#EAF6E8',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
}))
