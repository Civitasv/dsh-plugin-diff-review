/**
 * End-to-end test of the diff-review server routes against a scratch repo.
 * Boots the built dist/index.js with a minimal fake cordis context that
 * captures the registered web routes, then drives them with fake req/res.
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const plugin = await import('../dist/index.js')

const root = process.cwd()
const repo = join(root, '.e2e-scratch')
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

// ---- scratch repo with history ----
await run(['init', '-q', '-b', 'main'])
await run(['config', 'core.autocrlf', 'false'])
writeFileSync(join(repo, 'a.txt'), 'one\ntwo\nthree\n')
writeFileSync(join(repo, 'gone.txt'), 'bye\n')
await run(['add', '-A'])
await run(['commit', '-q', '-m', 'init'])

// changes: staged+unstaged modify, staged new, untracked, deleted
writeFileSync(join(repo, 'a.txt'), 'one\ntwo\nthree\nfour\n')
await run(['add', 'a.txt'])
writeFileSync(join(repo, 'a.txt'), 'one\ntwo\nthree\nfour\nfive\n')
writeFileSync(join(repo, 'new.txt'), 'hello\n')
await run(['add', 'new.txt'])
writeFileSync(join(repo, 'untracked.txt'), 'fresh\n')
rmSync(join(repo, 'gone.txt'))

// ---- boot plugin with fake ctx, capture routes ----
const routes = new Map()
const ctx = {
  inject(deps, cb) {
    const httpCtx = {
      effect(fn) {
        const dispose = fn()
        return dispose
      },
      webServer: {
        register(route) {
          routes.set(route.path, route)
          return () => {}
        },
      },
    }
    cb(httpCtx)
  },
}
plugin.apply(ctx, plugin.Config({}))
check('status route registered', routes.has('/diff-review/status'))
check('apply route registered', routes.has('/diff-review/apply'))

// ---- fake req/res helpers ----
function fakeRes() {
  const res = { status: 0, body: null, headers: {} }
  res.writeHead = (status, headers) => {
    res.status = status
    res.headers = headers ?? {}
  }
  res.end = (data) => {
    res.body = typeof data === 'string' ? data : data
  }
  return res
}
async function get(route, query) {
  const res = fakeRes()
  await routes.get(route).handler({ method: 'GET', url: `/x${route}?cwd=${encodeURIComponent(query ?? repo)}` }, res)
  return { status: res.status, json: JSON.parse(res.body) }
}
async function post(route, body) {
  const res = fakeRes()
  const payload = JSON.stringify(body)
  let i = 0
  const req = {
    method: 'POST',
    url: `/x${route}`,
    [Symbol.asyncIterator]() {
      return {
        next: async () => (i < payload.length ? { value: payload[i++], done: false } : { done: true, value: undefined }),
      }
    },
  }
  await routes.get(route).handler(req, res)
  return { status: res.status, json: JSON.parse(res.body) }
}

// ---- status ----
const status = await get('/diff-review/status')
check('status 200', status.status === 200)
check('isRepo true', status.json.isRepo === true)
check('branch main', status.json.branch === 'main')
const byPath = Object.fromEntries(status.json.files.map((f) => [f.path, f]))
check('4 changed files', status.json.files.length === 4, status.json.files.map((f) => f.path).join(', '))
check('a.txt MM staged+unstaged', byPath['a.txt']?.status === 'MM')
check('a.txt diff contains both hunks', byPath['a.txt']?.diff.includes('+four') && byPath['a.txt']?.diff.includes('+five'))
check('a.txt added>=2', byPath['a.txt']?.added >= 2)
check('new.txt staged A', byPath['new.txt']?.status === 'A' && byPath['new.txt']?.staged === true)
check('new.txt diff /dev/null', byPath['new.txt']?.diff.includes('/dev/null'))
check('untracked.txt ??', byPath['untracked.txt']?.status === '??' && byPath['untracked.txt']?.untracked === true)
check('untracked synthetic diff', byPath['untracked.txt']?.diff.includes('+fresh'))
check('gone.txt D', byPath['gone.txt']?.status === 'D')
check('gone.txt diff has -bye', byPath['gone.txt']?.diff.includes('-bye'))

// ---- apply: accept one file (stage untracked) ----
let r = await post('/diff-review/apply', { cwd: repo, action: 'accept', path: 'untracked.txt' })
check('accept untracked ok', r.status === 200 && r.json.ok === true)
const afterAccept = await get('/diff-review/status')
check('untracked.txt now staged A', afterAccept.json.files.find((f) => f.path === 'untracked.txt')?.status === 'A')

// ---- apply: revert one file (a.txt full discard) ----
r = await post('/diff-review/apply', { cwd: repo, action: 'revert', path: 'a.txt' })
check('revert a.txt ok', r.status === 200 && r.json.ok === true)
const afterRevert = await get('/diff-review/status')
check('a.txt gone from changes', !afterRevert.json.files.some((f) => f.path === 'a.txt'))

// ---- apply: revert all ----
r = await post('/diff-review/apply', { cwd: repo, action: 'revert' })
check('revert all ok', r.status === 200 && r.json.ok === true)
const afterAll = await get('/diff-review/status')
check('tree clean after revert all', afterAll.json.files.length === 0, afterAll.json.files.map((f) => f.path).join(','))
check('new.txt removed from worktree', !existsSync(join(repo, 'new.txt')))
check('gone.txt restored', existsSync(join(repo, 'gone.txt')))

// ---- apply: accept all ----
writeFileSync(join(repo, 'z.txt'), 'zulu\n')
r = await post('/diff-review/apply', { cwd: repo, action: 'accept' })
check('accept all ok', r.status === 200 && r.json.ok === true)
const stagedAll = await run(['diff', '--cached', '--name-only'])
check('z.txt staged by accept all', stagedAll.includes('z.txt'))

// ---- error paths ----
r = await post('/diff-review/apply', { cwd: join(root, 'does-not-exist'), action: 'accept' })
check('missing cwd -> 400', r.status === 400)
r = await post('/diff-review/apply', { cwd: repo, action: 'accept', path: '../../etc/passwd' })
check('path traversal -> 400', r.status === 400)
r = await post('/diff-review/apply', { cwd: repo, action: 'bogus' })
check('bad action -> 400', r.status === 400)
const notRepo = join(root, '.e2e-notrepo')
mkdirSync(notRepo, { recursive: true })
const nr = await get('/diff-review/status', notRepo)
check('non-repo -> isRepo false', nr.json.isRepo === false && nr.json.error)
rmSync(notRepo, { recursive: true, force: true })

rmSync(repo, { recursive: true, force: true })
console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
