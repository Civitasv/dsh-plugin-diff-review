/**
 * Verifies the review-package parser (src/client/review-package.ts) against
 * the exact message format the composer dock composes (composeCarriedMessage).
 * The client bundle cannot be imported in node, so this script bundles the
 * parser module with esbuild (devDependency) and exercises the same code the
 * browser runs.
 */
import { build } from 'esbuild'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const root = process.cwd()
const src = join(root, 'src/client/review-package.ts')

const dir = mkdtempSync(join(tmpdir(), 'dsdr-pkgtest-'))
const out = join(dir, 'parser.mjs')
try {
  await build({
    entryPoints: [src],
    outfile: out,
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    target: 'es2020',
    logLevel: 'silent',
  })
  const mod = await import(pathToFileURL(out).href)
  const { parseReviewPackage, isReviewPackageText } = mod

  let failures = 0
  function check(name, cond, detail = '') {
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
    if (!cond) failures++
  }

  // --- fixture replicating composeCarriedMessage output ---
  const PREFIX = '请处理以下针对当前工作区的行内评审评论（Address the inline comments，保持改动范围最小）：'
  const CWD = '/home/user/project'

  function compose({ comments = [], verdict = null, findings = [], workspace = CWD } = {}) {
    const lines = [PREFIX, `工作区：${workspace}`, '']
    const byPath = new Map()
    for (const c of comments) {
      const list = byPath.get(c.path)
      if (list) list.push(c)
      else byPath.set(c.path, [c])
    }
    for (const [path, list] of byPath) {
      lines.push(`## ${path}`)
      for (const c of list) {
        const anchor = c.lineNew !== null ? `:${c.lineNew}` : ` (old line ${c.lineOld})`
        const tag = c.source === 'session' ? '[s]' : c.source === 'workspace' ? '[w]' : ''
        lines.push(`- ${tag ? `${tag} ` : ''}${path}${anchor}: ${c.text}`)
      }
      lines.push('```diff')
      lines.push(`@@ -1,3 +1,4 @@`)
      lines.push(` context`)
      lines.push(`+added line`)
      lines.push('```')
      lines.push('')
    }
    if (verdict !== null) {
      lines.push('## AI 评审结论')
      lines.push(verdict === 'incorrect' ? '补丁存在问题（Patch is incorrect）' : '补丁正确（Patch is correct）')
      for (const f of findings) {
        const range = f.lineEnd && f.lineEnd !== f.lineStart ? `-${f.lineEnd}` : ''
        lines.push(`- [${f.priority}] ${f.file}:${f.lineStart}${range} ${f.title} — ${f.detail}`)
        if (f.suggestion) {
          lines.push('  ```')
          lines.push(f.suggestion)
          lines.push('  ```')
        }
      }
    }
    return lines.join('\n')
  }

  // 1. not a review package → null / false
  check('plain message: isReviewPackageText false', isReviewPackageText('fix the bug please') === false)
  check('plain message: parse null', parseReviewPackage('fix the bug please') === null)
  check('empty: parse null', parseReviewPackage('') === null)

  // 2. full package: comments + hunk + verdict + findings
  const full = compose({
    comments: [
      { path: 'src/server/index.ts', lineNew: 411, lineOld: null, text: '这里 mtime 的 statSync 可以缓存', source: 'session' },
      { path: 'src/server/index.ts', lineNew: 415, lineOld: null, text: '边界情况：max<=1 应返回 …' },
      { path: 'src/client/index.tsx', lineNew: null, lineOld: 12, text: '删掉的行也值得一条评论', source: 'workspace' },
    ],
    verdict: 'incorrect',
    findings: [
      { priority: 'P1', file: 'src/server/index.ts', lineStart: 411, lineEnd: 411, title: '避免重复 statSync', detail: '把 mtime 缓存起来', suggestion: 'const cached = statSync(...)' },
      { priority: 'P2', file: 'src/client/index.tsx', lineStart: 12, lineEnd: 15, title: '命名', detail: '起个更好的名字' },
    ],
  })
  const p1 = parseReviewPackage(full)
  check('full: parsed', p1 !== null)
  check('full: workspace', p1?.workspace === CWD, p1?.workspace ?? 'null')
  check('full: verdict incorrect', p1?.verdict === 'incorrect')
  check('full: comment count', p1?.comments.length === 3)
  check('full: comment new-line anchor', p1?.comments[0].path === 'src/server/index.ts' && p1?.comments[0].line === 411 && p1?.comments[0].text === '这里 mtime 的 statSync 可以缓存')
  check('full: comment source session', p1?.comments[0].source === 'session')
  check('full: comment with colon in text', p1?.comments[1].line === 415 && p1?.comments[1].text === '边界情况：max<=1 应返回 …')
  check('full: comment source absent (legacy)', p1?.comments[1].source === undefined)
  check('full: old-line anchor', p1?.comments[2].line === null && p1?.comments[2].text === '删掉的行也值得一条评论')
  check('full: comment source workspace', p1?.comments[2].source === 'workspace')
  check('full: findings count', p1?.findings.length === 2)
  check('full: finding fields', p1?.findings[0].priority === 'P1' && p1?.findings[0].file === 'src/server/index.ts' && p1?.findings[0].line === 411 && p1?.findings[0].title === '避免重复 statSync' && p1?.findings[0].detail === '把 mtime 缓存起来')
  check('full: finding with line range', p1?.findings[1].line === 12 && p1?.findings[1].title === '命名')
  check('full: isReviewPackageText true', isReviewPackageText(full) === true)

  // 3. verdict-only package (no comments)
  const onlyVerdict = compose({
    verdict: 'correct',
    findings: [],
  })
  const p2 = parseReviewPackage(onlyVerdict)
  check('verdict-only: parsed', p2 !== null)
  check('verdict-only: correct', p2?.verdict === 'correct')
  check('verdict-only: no comments', p2?.comments.length === 0)

  // 4. comments without verdict
  const noVerdict = compose({
    comments: [{ path: 'a.ts', lineNew: 1, lineOld: null, text: 'hi' }],
    verdict: null,
  })
  const p3 = parseReviewPackage(noVerdict)
  check('no-verdict: parsed', p3 !== null)
  check('no-verdict: verdict null', p3?.verdict === null)
  check('no-verdict: one comment', p3?.comments.length === 1 && p3?.comments[0].path === 'a.ts' && p3?.comments[0].line === 1)

  // 5. path with regex metacharacters
  const weirdPath = compose({
    comments: [{ path: 'src/a.b+(c).ts', lineNew: 7, lineOld: null, text: 'regex-safe' }],
    verdict: null,
  })
  const p4 = parseReviewPackage(weirdPath)
  check('regex-path: parsed comment', p4?.comments.length === 1 && p4?.comments[0].path === 'src/a.b+(c).ts' && p4?.comments[0].line === 7)

  // 6. workspace line missing → workspace null
  const noWs = [PREFIX, '', '## a.ts', '- a.ts:3: note'].join('\n')
  const p5 = parseReviewPackage(noWs)
  check('no-workspace: workspace null', p5?.workspace === null)
  check('no-workspace: comment parsed', p5?.comments.length === 1 && p5?.comments[0].line === 3)

  // 7. truncated message (slice(0,16000)) still parses leading comments
  const longText = 'x'.repeat(20000)
  const truncated = compose({
    comments: [{ path: 'big.ts', lineNew: 9, lineOld: null, text: longText }],
    verdict: null,
  }).slice(0, 16000)
  const p6 = parseReviewPackage(truncated)
  check('truncated: parsed', p6 !== null)
  check('truncated: comment present', p6?.comments.length === 1 && p6?.comments[0].path === 'big.ts' && p6?.comments[0].line === 9)

  // 8. verdict with finding lacking detail (no — separator)
  const noDetail = compose({
    verdict: 'incorrect',
    findings: [{ priority: 'P0', file: 'x.ts', lineStart: 4, lineEnd: 4, title: 'must fix', detail: '' }],
  })
  // rebuild without the — detail
  const noDetailMsg = noDetail.replace('must fix — ', 'must fix')
  const p7 = parseReviewPackage(noDetailMsg)
  check('no-detail finding: title intact', p7?.findings.length === 1 && p7?.findings[0].title === 'must fix' && p7?.findings[0].detail === '')

  console.log(failures === 0 ? '\nAll review-package parser checks passed.' : `\n${failures} check(s) FAILED.`)
  rmSync(dir, { recursive: true, force: true })
  process.exit(failures === 0 ? 0 : 1)
} catch (err) {
  console.error(err)
  process.exit(1)
}
