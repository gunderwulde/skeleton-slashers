import { defineConfig } from 'vite';
import * as path from 'path';

/**
 * vite.config.ts
 * Configuración para manejar el servidor de desarrollo y recursos estáticos.
 */
export default defineConfig({
  // GitHub Pages sirve el proyecto bajo el nombre del repositorio.
  base: process.env.GITHUB_ACTIONS ? '/skeleton-slashers/' : '/',
  // Establece la carpeta raíz del proyecto si es necesario
  root: path.resolve(__dirname), 
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 3000, // Puerto para el servidor de desarrollo
    open: true,
  }
});