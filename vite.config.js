import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em produção (GitHub Pages) o site fica em /nome-do-repositorio/
export default defineConfig({ plugins: [react()], base: process.env.VITE_BASE || '/' })
