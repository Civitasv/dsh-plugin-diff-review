/**
 * End-to-end test of the diff-review server routes against a scratch repo.
 * Boots the built dist/index.js with a minimal fake cordis context that
 * captures the registered web routes, then drives them with fake req/res.
 */
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
let reviewCalls = []
let reviewOutput = ''
const ctx = {
  // fake llm service: records calls, streams `reviewOutput` as text-deltas
  llm: {
    async *stream(options) {
      reviewCalls.push(options)
      yield { type: 'block-start', index: 0, blockType: 'text' }
      if (reviewOutput) yield { type: 'text-delta', index: 0, text: reviewOutput }
      yield { type: 'finish', reason: 'stop' }
    },
  },
  // fake host session store: a fixed request-header config
  sessions: {
    get(id) {
      return { requestHeader: () => (id === 'sess-1' ? { config: { provider: 'fake-provider', model: 'fake-model' } } : undefined) }
    },
  },
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
check('apply-hunk route registered', routes.has('/diff-review/apply-hunk'))
check('comments route registered', routes.has('/diff-review/comments'))
check('review route registered', routes.has('/diff-review/review'))
check('pr route registered', routes.has('/diff-review/pr'))
check('repos route registered', routes.has('/diff-review/repos'))

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

/** GET with a full raw query string (e.g. cwd=…&base=…). */
async function get2(route, query) {
  const res = fakeRes()
  await routes.get(route).handler({ method: 'GET', url: `/x${route}?${query}` }, res)
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

// ---- hunk data: a.txt is MM (staged +four, unstaged +five) ----
let st = await get('/diff-review/status')
let a = st.json.files.find((f) => f.path === 'a.txt')
check('a.txt has 2 hunks (staged, unstaged)', a?.hunks?.length === 2, JSON.stringify(a?.hunks?.map((h) => h.layer)))
check('a.txt hunk[0] staged +four', a?.hunks?.[0]?.layer === 'staged' && a.hunks[0].text.includes('+four'))
check('a.txt hunk[1] unstaged +five', a?.hunks?.[1]?.layer === 'unstaged' && a.hunks[1].text.includes('+five'))
const fourHunk = a.hunks[0].text

// ---- apply-hunk: revert the STAGED hunk (index + worktree) ----
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'a.txt', action: 'revert', hunk: fourHunk })
check('hunk revert (staged) ok', r.status === 200 && r.json.ok === true)
check('a.txt worktree lost four', !readFileSync(join(repo, 'a.txt'), 'utf8').includes('four'))
st = await get('/diff-review/status')
a = st.json.files.find((f) => f.path === 'a.txt')
check('a.txt unstaged-only after staged revert', a?.staged === false && a?.unstaged === true, a?.status)
check('a.txt hunks all unstaged', a?.hunks?.length === 1 && a.hunks[0].layer === 'unstaged')
const mergedHunk = a.hunks[0].text

// ---- apply-hunk: revert the unstaged hunk (worktree only) ----
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'a.txt', action: 'revert', hunk: mergedHunk })
check('hunk revert (unstaged) ok', r.status === 200 && r.json.ok === true)
check('a.txt worktree lost five', !readFileSync(join(repo, 'a.txt'), 'utf8').includes('five'))
st = await get('/diff-review/status')
check('a.txt clean after unstaged revert', !st.json.files.some((f) => f.path === 'a.txt'))

// ---- apply-hunk: stage an unstaged hunk, then unstage it ----
writeFileSync(join(repo, 'a.txt'), 'one\ntwo\nthree\nfour\nfive\n')
await run(['add', 'a.txt'])
writeFileSync(join(repo, 'a.txt'), 'one\ntwo\nthree\nfour\nfive\nsix\n')
st = await get('/diff-review/status')
a = st.json.files.find((f) => f.path === 'a.txt')
check('a.txt MM re-setup', a?.status === 'MM', a?.status)
const sixHunk = a.hunks[1].text // unstaged +six
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'a.txt', action: 'accept', hunk: sixHunk })
check('hunk accept ok', r.status === 200 && r.json.ok === true)
st = await get('/diff-review/status')
a = st.json.files.find((f) => f.path === 'a.txt')
check('a.txt fully staged after hunk accept', a?.status === 'M', a?.status)
check('a.txt hunks all staged', a?.hunks?.length === 1 && a.hunks[0].layer === 'staged')
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'a.txt', action: 'unstage', hunk: a.hunks[0].text })
check('hunk unstage ok', r.status === 200 && r.json.ok === true)
st = await get('/diff-review/status')
a = st.json.files.find((f) => f.path === 'a.txt')
check('a.txt unstaged-only after hunk unstage', a?.staged === false && a?.unstaged === true, a?.status)

// ---- apply-hunk on an untracked file (partial stage -> unstage -> revert) ----
writeFileSync(join(repo, 'u2.txt'), 'p1\np2\np3\n')
st = await get('/diff-review/status')
const u2 = st.json.files.find((f) => f.path === 'u2.txt')
check('untracked u2 has one unstaged hunk', u2?.hunks?.length === 1 && u2.hunks[0].layer === 'unstaged')
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'u2.txt', action: 'accept', hunk: u2.hunks[0].text })
check('untracked hunk accept ok', r.status === 200 && r.json.ok === true)
st = await get('/diff-review/status')
check('u2 staged A after hunk accept', st.json.files.find((f) => f.path === 'u2.txt')?.status === 'A')
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'u2.txt', action: 'unstage', hunk: u2.hunks[0].text })
check('untracked hunk unstage ok', r.status === 200 && r.json.ok === true)
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'u2.txt', action: 'revert', hunk: u2.hunks[0].text })
check('untracked hunk revert ok', r.status === 200 && r.json.ok === true)
check('u2 removed from worktree', !existsSync(join(repo, 'u2.txt')))

// ---- apply: unstage one staged file, then unstage all ----
r = await post('/diff-review/apply', { cwd: repo, action: 'unstage', path: 'new.txt' })
check('unstage new.txt ok', r.status === 200 && r.json.ok === true)
st = await get('/diff-review/status')
check('new.txt back to untracked after unstage', st.json.files.find((f) => f.path === 'new.txt')?.status === '??')
check('new.txt worktree kept after unstage', existsSync(join(repo, 'new.txt')))
r = await post('/diff-review/apply', { cwd: repo, action: 'unstage' })
check('unstage all ok', r.status === 200 && r.json.ok === true)
check('index clean after unstage all', (await run(['diff', '--cached', '--name-only'])).trim() === '')

// ---- apply-hunk error paths ----
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'new.txt', action: 'accept', hunk: 'garbage' })
check('invalid hunk -> 400', r.status === 400)
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'nope.txt', action: 'accept', hunk: '@@ -1 +1 @@\n+x\n' })
check('missing file -> 404', r.status === 404)
r = await post('/diff-review/apply-hunk', { cwd: repo, path: 'new.txt', action: 'accept', hunk: '@@ -1 +1 @@\n+x\n' })
check('stale hunk -> 409', r.status === 409)

// ---- inline comments (repo-scoped storage in .git) ----
let cr = await get('/diff-review/comments')
check('comments GET ok + empty', cr.status === 200 && cr.json.ok === true && Array.isArray(cr.json.comments) && cr.json.comments.length === 0)
const sampleComment = { id: 'c1', path: 'a.txt', lineNew: 2, lineOld: null, text: 'maybe rename this', createdAt: '2026-08-15T00:00:00.000Z' }
r = await post('/diff-review/comments', { cwd: repo, comments: [sampleComment] })
check('comments POST ok', r.status === 200 && r.json.ok === true)
cr = await get('/diff-review/comments')
check('comments GET returns saved', cr.json.comments.length === 1 && cr.json.comments[0].id === 'c1' && cr.json.comments[0].path === 'a.txt')
check('comments persisted in git dir', existsSync(join(repo, '.git', 'diff-review-comments.json')))
r = await post('/diff-review/comments', { cwd: repo, comments: [] })
check('comments replace ok', r.status === 200)
cr = await get('/diff-review/comments')
check('comments cleared after replace', cr.json.comments.length === 0)
r = await post('/diff-review/comments', { cwd: repo, comments: [{ id: 'x', path: '../../etc/passwd', lineNew: 1, lineOld: null, text: 'bad', createdAt: '2026-08-15T00:00:00.000Z' }] })
check('comments path traversal -> 400', r.status === 400)
r = await post('/diff-review/comments', { cwd: repo, comments: 'nope' })
check('comments non-array -> 400', r.status === 400)
r = await post('/diff-review/comments', { cwd: repo, comments: [{ id: 'x', path: 'a.txt', lineNew: null, lineOld: null, text: 'no anchor', createdAt: '2026-08-15T00:00:00.000Z' }] })
check('comments no anchor -> 400', r.status === 400)

// ---- apply: revert one file (a.txt full discard) ----
r = await post('/diff-review/apply', { cwd: repo, action: 'revert', path: 'a.txt' })
check('revert a.txt ok', r.status === 200 && r.json.ok === true)
const afterRevert = await get('/diff-review/status')
check('a.txt gone from changes', !afterRevert.json.files.some((f) => f.path === 'a.txt'))

// ---- apply: revert all ----
r = await post('/diff-review/apply', { cwd: repo, action: 'revert' })
check('revert all ok', r.status === 200 && r.json.ok === true)
check('revert all reports deleted untracked', Array.isArray(r.json.deleted) && r.json.deleted.includes('new.txt') && r.json.deleted.includes('untracked.txt'), JSON.stringify(r.json.deleted))
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

// ---- branches + branch scope (merge-base diff) ----
await run(['commit', '-q', '-m', 'zulu']) // commit the staged z.txt so the tree is clean
let br = await get('/diff-review/branches')
check('branches lists main', br.status === 200 && br.json.ok === true && br.json.branches.includes('main'))
await run(['checkout', '-q', '-b', 'feature'])
writeFileSync(join(repo, 'feat.txt'), 'feature line\n')
await run(['add', 'feat.txt'])
await run(['commit', '-q', '-m', 'feature commit'])
await run(['checkout', '-q', 'main'])
writeFileSync(join(repo, 'main-change.txt'), 'new on main\n')
await run(['add', 'main-change.txt'])
let bs = await get2('/diff-review/status', `cwd=${encodeURIComponent(repo)}&base=feature`)
check('branch scope ok', bs.status === 200 && bs.json.isRepo === true)
check('branch scope lists worktree change', bs.json.files.some((f) => f.path === 'main-change.txt'))
check('branch scope excludes committed feature file', !bs.json.files.some((f) => f.path === 'feat.txt'))
check('branch scope diff has content', bs.json.files.find((f) => f.path === 'main-change.txt')?.diff.includes('new on main'))
const badBase = await get2('/diff-review/status', `cwd=${encodeURIComponent(repo)}&base=does-not-exist`)
check('branch scope unknown base -> error', badBase.status === 200 && badBase.json.error && badBase.json.files.length === 0)
const badRef = await get2('/diff-review/status', `cwd=${encodeURIComponent(repo)}&base=-evil`)
check('branch scope option-like base -> error', badRef.json.error)

// ---- AI review (/review) ----
// repo state: main-change.txt staged on main (uncommitted scope has 1 file)
reviewCalls = []
reviewOutput = JSON.stringify({
  verdict: 'incorrect',
  findings: [
    { priority: 'P1', title: 'Unsafe interpolation', detail: 'SQL injection risk', file: 'main-change.txt', lineStart: 1, lineEnd: 1, confidence: 0.9, suggestion: 'use params' },
    { priority: 'P3', title: 'Naming nit', detail: 'rename x', file: 'main-change.txt', lineStart: 2, lineEnd: 3, confidence: 0.4 },
    { priority: 'P1', title: 'Phantom file', detail: 'not in review set', file: 'nope.txt', lineStart: 1, lineEnd: 1, confidence: 0.9 },
  ],
})
r = await post('/diff-review/review', { cwd: repo, sessionId: 'sess-1', scope: 'uncommitted' })
check('review ok', r.status === 200 && r.json.ok === true)
check('review verdict incorrect', r.json.verdict === 'incorrect')
check('review findings keep 2 (phantom dropped)', r.json.findings.length === 2, JSON.stringify(r.json.findings.map((f) => f.file)))
check('review finding fields', r.json.findings[0]?.priority === 'P1' && r.json.findings[0]?.confidence === 0.9 && r.json.findings[0]?.suggestion === 'use params')
check('review model from session header', r.json.model?.provider === 'fake-provider' && r.json.model?.model === 'fake-model')
check('review prompt mentions scope', reviewCalls[0]?.messages[0]?.content[0]?.text.includes('uncommitted changes'))
check('review prompt mentions file', reviewCalls[0]?.messages[0]?.content[0]?.text.includes('main-change.txt'))

// config reviewModel wins over the session header
const ctx2 = { ...ctx, llm: ctx.llm, sessions: ctx.sessions }
const routes2 = new Map()
const plugin2 = await import('../dist/index.js')
const ctxB = {
  llm: ctx.llm,
  sessions: ctx.sessions,
  inject(deps, cb) {
    cb({
      effect(fn) {
        return fn()
      },
      webServer: {
        register(route) {
          routes2.set(route.path, route)
          return () => {}
        },
      },
    })
  },
}
plugin2.apply(ctxB, plugin2.Config({ reviewProvider: 'cfg-provider', reviewModel: 'cfg-model' }))
const resB = { status: 0, body: null }
resB.writeHead = (s) => {
  resB.status = s
}
resB.end = (d) => {
  resB.body = d
}
const payload = JSON.stringify({ cwd: repo, sessionId: 'sess-1', scope: 'uncommitted' })
let i = 0
const reqB = {
  method: 'POST',
  url: '/x',
  [Symbol.asyncIterator]() {
    return {
      next: async () => (i < payload.length ? { value: payload[i++], done: false } : { done: true }),
    }
  },
}
await routes2.get('/diff-review/review').handler(reqB, resB)
check('review config model wins', JSON.parse(resB.body).model?.provider === 'cfg-provider' && JSON.parse(resB.body).model?.model === 'cfg-model')

// review: invalid model output -> P2 diagnostic finding
reviewOutput = 'this is not json'
r = await post('/diff-review/review', { cwd: repo, sessionId: 'sess-1', scope: 'uncommitted' })
check('review unparseable -> P2 diagnostic', r.status === 200 && r.json.ok === true && r.json.findings.length === 1 && r.json.findings[0].priority === 'P2')

// review: no model anywhere -> 400
const ctxC = {
  inject(deps, cb) {
    cb({
      effect(fn) {
        return fn()
      },
      webServer: {
        register(route) {
          routes2.set(route.path, route)
          return () => {}
        },
      },
    })
  },
}
plugin2.apply(ctxC, plugin2.Config({}))
const resC = { status: 0, body: null }
resC.writeHead = (s) => {
  resC.status = s
}
resC.end = (d) => {
  resC.body = d
}
const payloadC = JSON.stringify({ cwd: repo, sessionId: 'unknown', scope: 'uncommitted' })
let j = 0
const reqC = {
  method: 'POST',
  url: '/x',
  [Symbol.asyncIterator]() {
    return {
      next: async () => (j < payloadC.length ? { value: payloadC[j++], done: false } : { done: true }),
    }
  },
}
await routes2.get('/diff-review/review').handler(reqC, resC)
check('review no model -> 400', resC.status === 400 && JSON.parse(resC.body).error)

// review: branch scope + commit scope
reviewOutput = JSON.stringify({ verdict: 'correct', findings: [] })
r = await post('/diff-review/review', { cwd: repo, sessionId: 'sess-1', scope: 'branch', base: 'feature' })
check('review branch scope ok', r.status === 200 && r.json.ok === true)
const commitHash = (await run(['rev-parse', 'HEAD'])).trim()
reviewOutput = JSON.stringify({ verdict: 'correct', findings: [] })
r = await post('/diff-review/review', { cwd: repo, sessionId: 'sess-1', scope: 'commit', commitHash })
check('review commit scope ok', r.status === 200 && r.json.ok === true)
r = await post('/diff-review/review', { cwd: repo, sessionId: 'sess-1', scope: 'commit', commitHash: 'notahash' })
check('review bad commit hash -> 400', r.status === 400)

// ---- commit-diff: real per-file statuses (A/M/D) ----
await run(['commit', '-q', '-m', 'main-change']) // commit staged main-change.txt (A)
writeFileSync(join(repo, 'mod.txt'), 'line1\nline2\n')
writeFileSync(join(repo, 'gone.txt'), 'bye\nchanged\n') // re-created by revert-all earlier; now modified (M)
rmSync(join(repo, 'z.txt')) // delete a tracked file (D)
await run(['add', '-A'])
await run(['commit', '-q', '-m', 'mixed'])
const mixedHash = (await run(['rev-parse', 'HEAD'])).trim()
let cd = await get2('/diff-review/commit-diff', `cwd=${encodeURIComponent(repo)}&hash=${mixedHash}`)
check('commit-diff ok', cd.status === 200 && cd.json.ok === true)
check('commit-diff status A (new file)', cd.json.files.find((f) => f.path === 'mod.txt')?.status === 'A')
check('commit-diff status M (modified)', cd.json.files.find((f) => f.path === 'gone.txt')?.status === 'M')
check('commit-diff status D (deleted)', cd.json.files.find((f) => f.path === 'z.txt')?.status === 'D')

// ---- PR context (gh) — degrades gracefully without gh / no PR ----
const pr = await get('/diff-review/pr')
check('pr route ok + empty comments', pr.status === 200 && pr.json.ok === true && Array.isArray(pr.json.comments))
check('pr degrades with note', typeof pr.json.error === 'string' && pr.json.error.length > 0)

// ---- multi-repo detection ----
const standalone = join(root, '..', '.e2e-standalone')
rmSync(standalone, { recursive: true, force: true })
mkdirSync(standalone, { recursive: true })
const rp = (args) => new Promise((resolve, reject) => execFile('git', ['-C', standalone, ...args], { windowsHide: true }, (e, so, se) => (e ? reject(new Error(se)) : resolve(so))))
await rp(['init', '-q', '-b', 'main'])
await rp(['config', 'user.email', 't@t'])
await rp(['config', 'user.name', 't'])
mkdirSync(join(standalone, 'nested'), { recursive: true })
writeFileSync(join(standalone, 'nested', 'sub.txt'), 'sub\n')
// nested repo first (needs a commit before the parent can reference it)
await rp(['-C', join(standalone, 'nested'), 'init', '-q', '-b', 'main'])
await rp(['-C', join(standalone, 'nested'), 'config', 'user.email', 't@t'])
await rp(['-C', join(standalone, 'nested'), 'config', 'user.name', 't'])
await rp(['-C', join(standalone, 'nested'), 'add', '-A'])
await rp(['-C', join(standalone, 'nested'), 'commit', '-q', '-m', 'nested'])
writeFileSync(join(standalone, 'top.txt'), 'top\n')
await rp(['add', '-A'])
await rp(['commit', '-q', '-m', 'top'])
const repos = await get('/diff-review/repos', standalone)
check('repos route ok', repos.status === 200 && repos.json.ok === true)
check('repos lists top-level repo', repos.json.repos.some((x) => x.path === standalone), JSON.stringify(repos.json.repos.map((x) => x.path)))
check('repos lists nested repo', repos.json.repos.some((x) => x.path === join(standalone, 'nested')), JSON.stringify(repos.json.repos.map((x) => x.path)))
rmSync(standalone, { recursive: true, force: true })

// ---- error paths ----
r = await post('/diff-review/apply', { cwd: join(root, 'does-not-exist'), action: 'accept' })
check('missing cwd -> 400', r.status === 400)
r = await post('/diff-review/apply', { cwd: repo, action: 'accept', path: '../../etc/passwd' })
check('path traversal -> 400', r.status === 400)
r = await post('/diff-review/apply', { cwd: repo, action: 'bogus' })
check('bad action -> 400', r.status === 400)
// Non-repo probe must live OUTSIDE this plugin's own git repo.
const notRepo = join(root, '..', '.e2e-notrepo')
mkdirSync(notRepo, { recursive: true })
const nr = await get('/diff-review/status', notRepo)
check('non-repo -> isRepo false', nr.json.isRepo === false && nr.json.error)
rmSync(notRepo, { recursive: true, force: true })

rmSync(repo, { recursive: true, force: true })
console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
