/** Verifies conversion of tool-reported paths before Files opens them. */
import { build } from 'esbuild'
import { mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

const dir = mkdtempSync(join(tmpdir(), 'dsdr-files-path-'))
const output = join(dir, 'files-path.mjs')
let failures = 0
const check = (name, actual, expected) => {
  const ok = actual === expected
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : ` (${JSON.stringify(actual)} !== ${JSON.stringify(expected)})`}`)
  if (!ok) failures++
}

try {
  await build({ entryPoints: [join(process.cwd(), 'src/client/files-path.ts')], outfile: output, bundle: true, format: 'esm', platform: 'neutral', logLevel: 'silent' })
  const { filesWorkspacePath } = await import(pathToFileURL(output).href)
  check('keeps repo-relative path', filesWorkspacePath('E:\\Workspace', 'src/client/index.tsx'), 'src/client/index.tsx')
  check('converts absolute Windows path under workspace', filesWorkspacePath('E:\\Workspace', 'E:\\Workspace\\dsh-plugin\\tmp-usage-analysis.mjs'), 'dsh-plugin/tmp-usage-analysis.mjs')
  check('matches Windows drive case-insensitively', filesWorkspacePath('e:\\Workspace', 'E:\\WORKSPACE\\a.ts'), 'a.ts')
  check('converts absolute POSIX path under workspace', filesWorkspacePath('/home/me/workspace', '/home/me/workspace/a.ts'), 'a.ts')
  check('rejects sibling prefix', filesWorkspacePath('E:\\Workspace', 'E:\\Workspace-other\\a.ts'), null)
  check('rejects outside workspace', filesWorkspacePath('E:\\Workspace', 'E:\\Other\\a.ts'), null)
  check('rejects traversal', filesWorkspacePath('E:\\Workspace', '../secret.txt'), null)
  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
  process.exitCode = failures === 0 ? 0 : 1
} finally {
  rmSync(dir, { recursive: true, force: true })
}
