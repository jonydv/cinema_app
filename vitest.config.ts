import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { defineConfig, Plugin } from 'vitest/config'

/** Transforms Angular `templateUrl` → inline `template` for JIT compilation in vitest. */
function inlineAngularTemplates(): Plugin {
  return {
    name: 'inline-angular-templates',
    transform(code, id) {
      if (!id.endsWith('.ts') || !code.includes('templateUrl')) return null
      return code.replace(/templateUrl:\s*['"](.+?)['"]/g, (_, url: string) => {
        const tmpl = readFileSync(resolve(dirname(id), url), 'utf-8')
        return `template: \`${tmpl.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\``
      })
    },
  }
}

export default defineConfig({
  plugins: [inlineAngularTemplates()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/app/core'),
      '@data': resolve(__dirname, 'src/app/data'),
      '@store': resolve(__dirname, 'src/app/store'),
      '@features': resolve(__dirname, 'src/app/features'),
      '@shared': resolve(__dirname, 'src/app/shared'),
      '@env': resolve(__dirname, 'src/environments'),
    },
  },
})
