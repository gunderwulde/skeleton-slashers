import { defineConfig } from 'vite';
import * as path from 'path';

/** Vite configuration for development and static assets. */
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/skeleton-slashers/' : '/',
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  }
});