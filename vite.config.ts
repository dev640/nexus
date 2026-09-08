import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Root-level Vite config so the Freebuff preview command (`npx vite`, run from
// the repo root) serves the real app in frontend/ and the deploy build
// (`vite build`) emits static output to dist/.
export default defineConfig(async () => {
  const { createRequire } = await import('node:module')
  const { fileURLToPath } = await import('node:url')
  const here = fileURLToPath(new URL('.', import.meta.url))
  const rootRequire = createRequire(here + 'index.js')
  const frontendRequire = createRequire(here + 'frontend/package.json')

  let reactPlugin: any
  let tailwindcss: any
  try {
    reactPlugin = rootRequire('@vitejs/plugin-react').default
    tailwindcss = rootRequire('@tailwindcss/vite').default
  } catch {
    reactPlugin = frontendRequire('@vitejs/plugin-react').default
    tailwindcss = frontendRequire('@tailwindcss/vite').default
  }

  return {
    root: 'frontend',
    plugins: [reactPlugin(), tailwindcss()],
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
  }
})
