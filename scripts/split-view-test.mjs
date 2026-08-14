/**
 * Verifies the split-view pairing algorithm against a real git diff.
 * Mirrors pairRows/parseGitBlocks/hunkStarts from the client exactly
 * (pure functions; the client bundle itself cannot be imported in node).
 */
import { execFile } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const repo = join(root, '.split-scratch')
rmSync(repo, { recursive: true, force: true })
mkdirSync(repo, { recursive: true })

let failures = 0
function check(name, cond, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  if (!cond) failures++
}

function run(args) {
  return new Promise((resolve, reject) => {
    execFile('git', ['-C', repo, ...args], { windowsHide: true }, (err, stdout) => {
      if (err) reject(new Error(`git ${args.join(' ')}: ${err.message}`))
      else resolve(stdout)
    })
  })
}

// --- diff model (duplicated from src/client/index.tsx) ---
const KIND = { file: 'file', hunk: 'hunk', add: 'add', del: 'del', ctx: 'ctx', note: 'note' }
const GIT_META = /^(diff --git |index |new file |deleted file |old mode |new mode |similarity index |rename (from|to) |Binary files )/

function parseGitBlocks(diff) {
  const blocks = []
  let current = null
  const lines = diff.split('\n')
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  for (const line of lines) {
    let kind
    if (line.startsWith('+++') || line.startsWith('---') || GIT_META.test(line)) kind = KIND.file
    else if (line.startsWith('@@')) kind = KIND.hunk
    else if (line.startsWith('+')) kind = KIND.add
    else if (line.startsWith('-')) kind = KIND.del
    else if (line.startsWith('\\ ')) kind = KIND.note
    else kind = KIND.ctx
    if (kind === KIND.file || kind === KIND.hunk) {
      current = { head: { kind, text: line }, rows: [] }
      blocks.push(current)
    } else {
      if (!current) {
        current = { head: null, rows: [] }
        blocks.push(current)
      }
      current.rows.push({ kind, text: line })
    }
  }
  return blocks
}

function hunkStarts(head) {
  const m = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(head)
  return { oldStart: m ? Number(m[1]) : 1, newStart: m ? Number(m[2]) : 1 }
}

function pairRows(rows, oldStart, newStart) {
  const out = []
  let oldLine = oldStart
  let newLine = newStart
  let pending = []
  const flush = () => {
    for (const p of pending) out.push({ left: p.text, right: '', leftNum: p.num, rightNum: null, kind: 'change' })
    pending = []
  }
  for (const row of rows) {
    if (row.kind === 'del') pending.push({ text: row.text.slice(1), num: oldLine++ })
    else if (row.kind === 'add') {
      const p = pending.shift()
      out.push({ left: p?.text ?? '', right: row.text.slice(1), leftNum: p?.num ?? null, rightNum: newLine++, kind: 'change' })
    } else if (row.kind === 'ctx') {
      flush()
      const text = row.text.startsWith(' ') ? row.text.slice(1) : row.text
      out.push({ left: text, right: text, leftNum: oldLine++, rightNum: newLine++, kind: 'ctx' })
    } else flush()
  }
  flush()
  return out
}

function gitSplitBlocks(diff) {
  return parseGitBlocks(diff)
    .filter((b) => b.head?.kind !== 'file' && (b.rows.length > 0 || b.head?.kind === 'hunk'))
    .map((b) => {
      const starts = b.head ? hunkStarts(b.head.text) : { oldStart: 1, newStart: 1 }
      return { head: b.head?.kind === 'hunk' ? b.head.text : null, rows: pairRows(b.rows, starts.oldStart, starts.newStart) }
    })
}

// --- scratch repo: three scenarios exercised through real git diffs ---
await run(['init', '-q', '-b', 'main'])
await run(['config', 'core.autocrlf', 'false'])
writeFileSync(join(repo, 'f.txt'), 'alpha\nbeta\ngamma\ndelta\nepsilon\nzeta\n')
await run(['add', '-A'])
await run(['commit', '-q', '-m', 'init'])

async function scenario(name, newContent, expectations) {
  writeFileSync(join(repo, 'f.txt'), newContent)
  const diff = await run(['diff', '--', 'f.txt'])
  const blocks = gitSplitBlocks(diff)
  const rows = blocks.length > 0 ? blocks[0].rows : []
  console.log(`--- ${name}: raw diff ---`)
  console.log(diff)
  console.log(`--- ${name}: rows (num|text) ---`)
  for (const r of rows) console.log(`  ${r.kind} ${r.leftNum ?? '-'}|${r.left}|${r.rightNum ?? '-'}|${r.right}`)
  check(`${name}: one hunk block`, blocks.length === 1, `blocks=${blocks.length}`)
  check(`${name}: hunk head kept`, (blocks[0]?.head ?? '').startsWith('@@ -'), blocks[0]?.head ?? 'null')
  for (const [label, cond] of expectations(rows)) check(`${name}: ${label}`, cond)
  await run(['checkout', '--', 'f.txt'])
}

// Scenario 1: same-length replacement — 4 deleted lines replaced by 4 added.
await scenario('replace', 'alpha\nBETA\nGAMMA\nDELTA\nomega\nzeta\n', (rows) => {
  const ctx = rows.filter((r) => r.kind === 'ctx')
  const ch = rows.filter((r) => r.kind === 'change')
  return [
    ['ctx = 2 (alpha, zeta)', ctx.length === 2 && ctx.every((r) => r.leftNum !== null && r.rightNum !== null)],
    ['alpha @1/1', ctx[0]?.left === 'alpha' && ctx[0]?.leftNum === 1 && ctx[0]?.rightNum === 1],
    ['zeta @6/6', ctx[1]?.left === 'zeta' && ctx[1]?.leftNum === 6 && ctx[1]?.rightNum === 6],
    ['4 aligned change rows', ch.length === 4 && ch.every((r) => r.leftNum !== null && r.rightNum !== null)],
    ['beta->BETA @2/2', ch[0]?.left === 'beta' && ch[0]?.right === 'BETA' && ch[0]?.leftNum === 2 && ch[0]?.rightNum === 2],
    ['epsilon->omega @5/5', ch[3]?.left === 'epsilon' && ch[3]?.right === 'omega' && ch[3]?.leftNum === 5 && ch[3]?.rightNum === 5],
  ]
})

// Scenario 2: trailing pure addition.
await scenario('add', 'alpha\nBETA\nGAMMA\nDELTA\nomega\nzeta\nEXTRA\n', (rows) => {
  const ch = rows.filter((r) => r.kind === 'change')
  const pureAdd = ch.filter((r) => r.leftNum === null && r.rightNum !== null)
  const last = ch[ch.length - 1]
  return [
    ['4 paired + 1 pure addition', ch.length === 5 && pureAdd.length === 1],
    ['EXTRA is the pure addition @7', last?.left === '' && last?.leftNum === null && last?.right === 'EXTRA' && last?.rightNum === 7],
  ]
})

// Scenario 3: middle pure deletion (delta removed, positions shift).
await scenario('delete', 'alpha\nBETA\nGAMMA\nepsilon\nzeta\n', (rows) => {
  const ch = rows.filter((r) => r.kind === 'change')
  const pureDel = ch.filter((r) => r.rightNum === null && r.leftNum !== null)
  const delta = ch.find((r) => r.left === 'delta')
  const eps = ch.find((r) => r.left === 'epsilon' || r.right === 'epsilon')
  return [
    ['delta is a pure deletion', pureDel.length === 1 && delta?.rightNum === null && delta?.leftNum === 4],
    ['epsilon kept (paired or context)', (eps?.kind === 'change' && eps?.rightNum !== null) || rows.some((r) => r.kind === 'ctx' && r.left === 'epsilon')],
  ]
})

rmSync(repo, { recursive: true, force: true })
console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
