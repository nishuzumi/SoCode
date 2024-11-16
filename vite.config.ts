import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [viteStaticCopy({
    targets: [
      {
        src: 'src/lib/bundle_solc.js',  // 源文件路径
        dest: 'assets'  // 目标文件夹
      }
    ]
  }),nodePolyfills(),react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
