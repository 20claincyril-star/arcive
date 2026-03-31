import { defineConfig } from 'vite';

export default defineConfig({
  root: 'ui',
  build: {
    outDir: '../dist-frontend',
    emptyOutDir: true,
    rollupOptions: {
      external: ['@tauri-apps/api', '@tauri-apps/api/dialog', '@tauri-apps/api/core']
    }
  }
});

