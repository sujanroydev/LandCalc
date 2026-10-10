import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  define: {
    __DEV__: JSON.stringify(true),
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^react-native-safe-area-context$/,
        replacement: resolve(process.cwd(), 'src/web/safe-area-context.tsx'),
      },
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
  },
  build: {
    outDir: 'web',
  },
});
