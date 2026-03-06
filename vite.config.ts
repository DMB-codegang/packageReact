import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://package.codegang.top',
        changeOrigin: true,
        secure: false
      },
      '/ocr': {
        target: 'https://ocr.codegang.top',
        changeOrigin: true,
        secure: false
      }
    },
    // 配置WASM文件的MIME类型
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  // 确保WASM文件被正确处理
  assetsInclude: ['**/*.wasm']
})
