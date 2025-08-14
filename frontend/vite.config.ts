import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,  // 기본 5173 → 3000으로 변경
    host: true   // Docker 컨테이너에서 접근 가능하게
  }
})
