import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^react-native$/,
        replacement: resolve(process.cwd(), 'node_modules/react-native-web'),
      },
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ],
  },
  optimizeDeps: {
    include: ['react-native-web', 'react-dom'],
    exclude: ['react-native-safe-area-context'],
  },
  build: {
    outDir: 'web',
  },
});
