/**
 * Build the diff-review plugin:
 *
 *  1. Server half  → dist/index.js  (ESM bundle, @deepseek-ai/* external,
 *     resolved at runtime from the profile's node_modules).
 *  2. Client half  → client.js      (the DSH client bundle contract:
 *     `window.__ModuleLoader__.load({ id, factory })` — esbuild's CJS output
 *     is wrapped in a factory that receives the loader's `require`, so
 *     react / react/jsx-runtime / @deepseek-ai/* resolve through the shell's
 *     static module table and registered plugin bundles at runtime).
 */
import { build } from 'esbuild'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const PKG = 'dsh-plugin-diff-review'

// ---- 1. server half ----
mkdirSync(join(root, 'dist'), { recursive: true })
await build({
  entryPoints: [join(root, 'src/server/index.ts')],
  outfile: join(root, 'dist/index.js'),
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node20',
  external: ['@deepseek-ai/*', 'node:*'],
  sourcemap: true,
  logLevel: 'info',
})

// ---- 2. client half ----
const tmpClient = join(root, '.tmp-client.js')
await build({
  entryPoints: [join(root, 'src/client/index.tsx')],
  outfile: tmpClient,
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  jsx: 'automatic',
  target: 'es2020',
  external: ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client', '@deepseek-ai/*'],
  sourcemap: 'inline',
  logLevel: 'info',
})

const body = readFileSync(tmpClient, 'utf8')
const wrapped = `window.__ModuleLoader__.load({
	id: ${JSON.stringify(PKG)},
	factory: function (require) {
		var module = { exports: {} };
		var exports = module.exports;
		(function (module, exports, require) {
${body}
		})(module, module.exports, require);
		return module.exports;
	}
});
`
writeFileSync(join(root, 'client.js'), wrapped)
rmSync(tmpClient, { force: true })

console.log('[build] dist/index.js (server)')
console.log(`[build] client.js (${(wrapped.length / 1024).toFixed(1)} KiB)`)
