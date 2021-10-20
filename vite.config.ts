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
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'noonepub',
      fileName: (format) => `noonepub.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'react',
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
