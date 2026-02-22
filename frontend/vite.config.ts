import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import dns from 'node:dns';

// Fix Node ENOTFOUND issues by forcing IPv4 resolution first
dns.setDefaultResultOrder('ipv4first');

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://pras75299portfolio.vercel.app',
        changeOrigin: true,
      },
    },
  },
});