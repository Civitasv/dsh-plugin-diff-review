/**
 * Build the diff-review plugin:
 *
 *  1. Server half  → dist/index.js  (ESM bundle, @deepseek-ai/* external,
 *     resolved at runtime from the profile's node_modules).
 *  2. Client half  → client.js      (the DSH client bundle contract:
 *     `window.__ModuleLoader__.load({ id, factory })` — esbuild's CJS output
 *     is wrapped in a factory that receives the loader's `require`, so
 *     React and the explicitly injected DSH client services resolve through
 *     the shell's module table. UI libraries are bundled: unlike services,
 *     they do not register a factory in that table.
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
  minify: true,
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom',
    'react-dom/client',
    '@deepseek-ai/dsh-client-runtime/client',
  ],
  // The pure primitives package imports KaTeX's stylesheet for its optional
  // rich-text helpers. The shell owns document-level math styling; keeping
  // that stylesheet out of this self-contained JS bundle also avoids emitting
  // orphan font assets next to client.js.
  loader: { '.css': 'empty' },
  // Third-party editor sources make an inline browser source map several MB;
  // ship the compact runtime bundle instead. The TypeScript source remains in
  // the plugin repository for development and server builds keep their map.
  sourcemap: false,
  logLevel: 'info',
})

const body = readFileSync(tmpClient, 'utf8')
// These are ordinary UI libraries, not DSH-injected client services. Leaving
// either require in the output makes ModuleLoader fail before the plugin UI can
// mount. Keep this assertion adjacent to the external list so a future build
// change cannot silently reintroduce the release-blocking failure.
for (const dependency of [
  '@deepseek-ai/dsh-client-ui-attachment',
  '@deepseek-ai/dsh-client-ui-primitives',
]) {
  if (body.includes(`require(${JSON.stringify(dependency)})`)) {
    throw new Error(`[build] client bundle must include ${dependency}, not externalize it`)
  }
}
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
