import { build } from 'esbuild'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const dir = mkdtempSync(join(tmpdir(), 'dsdr-unified-lines-'))
const out = join(dir, 'unified-rows.mjs')
let failures = 0

function check(name, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  if (!condition) failures++
}

try {
  await build({ entryPoints: [join(root, 'src/client/unified-rows.ts')], outfile: out, bundle: true, format: 'esm', platform: 'neutral', logLevel: 'silent' })
  const { gitRowsWithLines } = await import(pathToFileURL(out).href)
  const rows = gitRowsWithLines(['@@ -10,2 +10,3 @@', ' alpha', '-beta', '+BETA', '+gamma', ' delta'].join('\n'))
  const content = rows.filter((entry) => ['ctx', 'del', 'add'].includes(entry.row.kind))
  check('keeps the hunk header without line numbers', rows[0]?.row.kind === 'hunk' && rows[0]?.oldLine === null && rows[0]?.newLine === null)
  check('numbers context on both sides', content[0]?.oldLine === 10 && content[0]?.newLine === 10)
  check('numbers deletions on the old side only', content[1]?.oldLine === 11 && content[1]?.newLine === null)
  check('numbers additions on the new side only', content[2]?.oldLine === null && content[2]?.newLine === 11)
  check('increments subsequent additions and context', content[3]?.newLine === 12 && content[4]?.oldLine === 12 && content[4]?.newLine === 13)
} finally {
  rmSync(dir, { recursive: true, force: true })
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exitCode = failures === 0 ? 0 : 1
