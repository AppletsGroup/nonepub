import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function htmlImportPlugin() {
  const fileRegex = /\.(html)$/

  return {
    name: 'transform-file',

    transform(src: string, id: string) {
      if (fileRegex.test(id)) {
        return {
          code: `export default ${JSON.stringify(src)}`,
          map: null, // provide source map if available
        }
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'nonepub',
      fileName: (format) => `nonepub.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'react',
          'react-dom': 'ReactDOM'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [react(), htmlImportPlugin()],
})
