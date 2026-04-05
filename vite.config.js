import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei')) return 'r3f';
          if (id.includes('framer-motion')) return 'framer';
          if (id.includes('node_modules/gsap/')) return 'gsap';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-core';
        },
      },
    },
  },
})
