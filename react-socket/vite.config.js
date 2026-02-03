import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const BEARER_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYXptaW5AZXhjZWxiZC5jb20iLCJleHAiOjE3NzAwMzI2MjIsImlhdCI6MTc3MDAyOTAyMiwidHlwZSI6ImFjY2VzcyJ9.ddz0F1GV1o8Q62iApmTtfVfPMbpVcvlfzWz7HgLaZSk'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://arcpos.aninda.me',
        changeOrigin: true,
        ws: true,
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'X-Frappe-Site-Name': 'arcpos.aninda.me',
        },
      },
      '/arcpos.aninda.me': {
        target: 'https://arcpos.aninda.me',
        changeOrigin: true,
        ws: true,
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'X-Frappe-Site-Name': 'arcpos.aninda.me',
        },
      },
    },
  },
})
