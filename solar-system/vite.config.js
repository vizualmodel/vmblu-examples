import { defineConfig } from 'vite'

const production = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [],
    build: {
    sourcemap: true, // !production,
    minify: production ? 'esbuild' : false, // Use esbuild for faster builds
    emptyOutDir: false, // Clean output directory before building
    outDir: './out', // Set the output directory
    rollupOptions: {
      input: './model/solar-system.app.js',
      output: {
        format: 'es',
        entryFileNames: '[name]-bundle.js', // Remove hash
        chunkFileNames: '[name]-chunk.js', // Remove hash
        assetFileNames: 'assets/[name].[ext]', // Remove hash
      },
    },
  },

})

