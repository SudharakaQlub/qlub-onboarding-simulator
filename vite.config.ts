import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Railway / qlubapps.com serve the built app through `vite preview`
  preview: { allowedHosts: true },
})
