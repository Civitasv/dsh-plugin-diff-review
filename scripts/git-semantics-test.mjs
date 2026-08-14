/**
 * Scratch-repo verification of the exact git semantics the diff-review
 * server uses. Creates a throwaway repo, exercises every command, asserts
 * the outcomes, then removes the repo.
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const repo = join(root, '.git-test-scratch')
rmSync(repo, { recursive: true, force: true })
mkdirSync(repo, { recursive: true })

let failures = 0
function check(name, cond, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  if (!cond) failures++
}

function run(args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile('git', ['-C', repo, ...args], { windowsHide: true, ...opts }, (err, stdout, stderr) => {
      if (err) reject(new Error(`git ${args.join(' ')}: ${stderr || err.message}`))
      else resolve(stdout)
    })
  })
}

// May fail (not a repo yet) — used only for branch detection later.
function tryRun(args) {
  return new Promise((resolve) => {
    execFile('git', ['-C', repo, ...args], { windowsHide: true }, (err, stdout) => resolve(err ? null : stdout.trim()))
  })
}

// ---- scaffold ----
await run(['init', '-q', '-b', 'main'])
await run(['config', 'core.autocrlf', 'false']) // deterministic line endings
writeFileSync(join(repo, 'base.txt'), 'one\ntwo\nthree\n')
writeFileSync(join(repo, 'gone.txt'), 'will be deleted\n')
await run(['add', '-A'])
await run(['commit', '-q', '-m', 'init'])

// ---- case 1: modified file, staged AND unstaged ----
writeFileSync(join(repo, 'base.txt'), 'one\ntwo\nthree\nfour\n') // staged change
await run(['add', 'base.txt'])
writeFileSync(join(repo, 'base.txt'), 'one\ntwo\nthree\nfour\nfive\n') // unstaged change on top

// ---- case 2: staged new file ----
writeFileSync(join(repo, 'new.txt'), 'hello\n')
await run(['add', 'new.txt'])

// ---- case 3: unstaged new (untracked) file ----
writeFileSync(join(repo, 'untracked.txt'), 'brand new\n')

// ---- case 4: deleted file (unstaged) ----
rmSync(join(repo, 'gone.txt'))

// ---- status porcelain -z parsing ----
const status = await run(['status', '--porcelain=v1', '-z'])
const records = status.split('\0').filter(Boolean)
check('status -z has 4+ records', records.length >= 4, records.join(' | '))
console.log('  records:', records.map((r) => JSON.stringify(r)).join(' '))

// untracked via ls-files --others
const others = (await run(['ls-files', '--others', '--exclude-standard', '-z'])).split('\0').filter(Boolean)
check('ls-files --others lists untracked.txt', others.includes('untracked.txt'), others.join(','))

// ---- diffs ----
const diffStaged = await run(['diff', '--cached', '--', 'base.txt'])
const diffUnstaged = await run(['diff', '--', 'base.txt'])
check('staged diff mentions +four', diffStaged.includes('+four'))
check('unstaged diff mentions +five', diffUnstaged.includes('+five'))
const diffNew = await run(['diff', '--cached', '--', 'new.txt'])
check('staged diff for new file has /dev/null header', diffNew.includes('/dev/null'))
const diffGone = await run(['diff', '--', 'gone.txt'])
check('unstaged diff for deleted file', diffGone.includes('gone.txt') && diffGone.includes('-will be deleted'))

// ---- revert semantics ----
// revert base.txt fully (staged + unstaged) -> back to HEAD content
await run(['restore', '--source=HEAD', '--staged', '--worktree', '--', 'base.txt'])
const baseNow = readFileSync(join(repo, 'base.txt'), 'utf8')
check('restore base.txt -> HEAD content', baseNow === 'one\ntwo\nthree\n', JSON.stringify(baseNow))
const stagedAfter = await tryRun(['diff', '--cached', '--name-only'])
check('base.txt unstaged after restore', !(stagedAfter ?? '').includes('base.txt'))

// revert staged-new file -> remove from index AND worktree?
await run(['restore', '--source=HEAD', '--staged', '--worktree', '--', 'new.txt'])
check('restore staged-new: file removed from worktree', !existsSync(join(repo, 'new.txt')))
const idxAfter = await tryRun(['ls-files', '--', 'new.txt'])
check('restore staged-new: file removed from index', (idxAfter ?? '') === '')

// revert deleted file -> restored
await run(['restore', '--source=HEAD', '--staged', '--worktree', '--', 'gone.txt'])
check('restore deleted file: content back', readFileSync(join(repo, 'gone.txt'), 'utf8') === 'will be deleted\n')

// untracked revert = delete file (fs, done by server)
rmSync(join(repo, 'untracked.txt'))
check('untracked revert: fs.rm removes it', !existsSync(join(repo, 'untracked.txt')))

// ---- accept (stage) semantics ----
writeFileSync(join(repo, 'base.txt'), 'one\ntwo\nthree\nfour\n')
await run(['add', 'base.txt'])
// delete a file then git add <path> stages the deletion
rmSync(join(repo, 'gone.txt'))
await run(['add', 'gone.txt'])
const deletedStaged = await tryRun(['diff', '--cached', '--name-status'])
check('git add <deleted path> stages deletion', (deletedStaged ?? '').includes('D\tgone.txt'), deletedStaged ?? '')
// untracked accept = git add
writeFileSync(join(repo, 'untracked.txt'), 'brand new\n')
await run(['add', 'untracked.txt'])
const untrackedStaged = await tryRun(['diff', '--cached', '--name-status'])
check('git add <untracked> stages it as A', (untrackedStaged ?? '').includes('A\tuntracked.txt'), untrackedStaged ?? '')

// ---- branch detection ----
const branch = await tryRun(['branch', '--show-current'])
check('branch --show-current', branch === 'main', branch ?? '')
const isRepo = await tryRun(['rev-parse', '--is-inside-work-tree'])
check('rev-parse --is-inside-work-tree', isRepo === 'true', isRepo ?? '')

// ---- rename in porcelain -z (2 records) ----
writeFileSync(join(repo, 'renamed.txt'), 'renamed content\n')
await run(['add', 'renamed.txt'])
await run(['commit', '-q', '-m', 'add renamed'])
await run(['mv', 'renamed.txt', 'moved.txt'])
const renStatus = await run(['status', '--porcelain=v1', '-z'])
const renRecords = renStatus.split('\0').filter(Boolean)
const hasRename = renRecords.some((r) => r.startsWith('R'))
check('porcelain -z rename detected', hasRename, renRecords.join(' | '))
// The second record of a rename pair carries the SOURCE path; the first
// (XY-prefixed) record carries the destination.
if (hasRename) {
  const ri = renRecords.findIndex((r) => r.startsWith('R'))
  const dest = renRecords[ri].slice(3)
  const src = renRecords[ri + 1]
  check('porcelain -z rename: XY record carries dest', dest === 'moved.txt', dest ?? '')
  check('porcelain -z rename: next record is source', src === 'renamed.txt', src ?? '')
}

rmSync(repo, { recursive: true, force: true })
console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
