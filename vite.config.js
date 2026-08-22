import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 用相对路径，使产物可部署在 GitHub Pages 的任意子路径下（/aiali-Chinese/）
  base: './',
  plugins: [react()],
})
