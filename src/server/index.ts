/**
 * Diff-review plugin — server half.
 *
 * Codex-style diff review over the session's workspace: list every
 * uncommitted change (staged + unstaged + untracked), serve per-file unified
 * diffs, and apply accept (stage) / revert (discard) operations through git.
 *
 * Git is invoked with `execFile` (no shell), every pathspec goes after `--`,
 * and the workspace must be an existing absolute directory (optionally
 * restricted by `allowedRoots`), so untrusted browser input can never escape
 * the intended repo.
 *
 * Routes:
 * - `GET  {statusPath}?cwd=…` — repo facts + every changed file with its diff.
 * - `POST {applyPath}`       — `{ cwd, action: 'accept'|'revert', path? }`.
 */
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { execFile } from 'node:child_process'
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { isAbsolute, join, resolve, sep } from 'node:path'
import type { ApplyResponse, CommitDiffResponse, DiffFile, GitResponse, HistoryResponse, StatusResponse } from '../shared/types.ts'

export const name = 'diff-review'

export interface Config {
  /** HTTP route returning the review status (files + diffs). */
  statusPath: string
  /** HTTP route applying accept/revert operations. */
  applyPath: string
  /** HTTP route committing staged changes. */
  commitPath: string
  /** HTTP route pushing the current branch. */
  pushPath: string
  /** HTTP route listing local (unpushed) commits. */
  historyPath: string
  /** HTTP route returning one commit's diff. */
  commitDiffPath: string
  /** HTTP route reading/writing the allowedRoots config override. */
  configPath: string
  /** Non-empty = only workspaces under these roots may be reviewed. */
  allowedRoots: string[]
}

export const Config: z<Config> = z.object({
  statusPath: z.string().default('/diff-review/status'),
  applyPath: z.string().default('/diff-review/apply'),
  commitPath: z.string().default('/diff-review/commit'),
  pushPath: z.string().default('/diff-review/push'),
  historyPath: z.string().default('/diff-review/history'),
  commitDiffPath: z.string().default('/diff-review/commit-diff'),
  configPath: z.string().default('/diff-review/config'),
  allowedRoots: z.array(z.string()).default([]),
})

const MAX_BUFFER = 64 * 1024 * 1024

interface GitResult {
  code: number
  stdout: string
  stderr: string
}

/** Run git in `cwd`; never throws (callers branch on `code`). */
function git(cwd: string, args: string[]): Promise<GitResult> {
  return new Promise((resolvePromise) => {
    execFile('git', ['-C', cwd, '-c', 'color.ui=never', ...args], { windowsHide: true, maxBuffer: MAX_BUFFER }, (err, stdout, stderr) => {
      if (err) {
        const code = typeof err.code === 'number' ? err.code : 1
        resolvePromise({ code, stdout: stdout ?? '', stderr: stderr ?? '' })
      } else {
        resolvePromise({ code: 0, stdout: stdout ?? '', stderr: stderr ?? '' })
      }
    })
  })
}

/** Safe repo-relative path: rejects traversal, absolute paths and option-like names. */
function sanitizeRepoPath(raw: unknown): { path: string } | { error: string } {
  if (typeof raw !== 'string' || !raw.trim()) return { error: 'missing "path"' }
  const p = raw.trim()
  if (isAbsolute(p)) return { error: `path must be repo-relative: ${p}` }
  if (p.startsWith('-')) return { error: `invalid path: ${p}` }
  const segments = p.split(/[\\/]/)
  if (segments.includes('..')) return { error: `path traversal is not allowed: ${p}` }
  return { path: p }
}

// ---------------------------------------------------------------------------
// Status collection.
// ---------------------------------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

interface Change {
  path: string
  origPath?: string
  xy: string
}

/**
 * Parse `git status --porcelain=v1 -z` into changes. Renames/copies emit two
 * NUL-separated records: the XY record carries the DESTINATION path, the next
 * record carries the SOURCE path (verified against git 2.51).
 */
function parsePorcelain(stdout: string): Change[] {
  const records = stdout.split('\0').filter((r) => r.length > 0)
  const out: Change[] = []
  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    if (rec.length < 3) continue
    const xy = rec.slice(0, 2)
    const path = rec.slice(3)
    if (xy === '??' || xy === '!!') continue // untracked handled via ls-files; ignored skipped
    if (xy[0] === 'R' || xy[0] === 'C') {
      const orig = i + 1 < records.length ? records[i + 1] : undefined
      if (orig !== undefined) i++ // consume the source record
      out.push({ path, origPath: orig, xy })
    } else {
      out.push({ path, xy })
    }
  }
  return out
}

function countLines(diff: string): { added: number; deleted: number } {
  let added = 0
  let deleted = 0
  for (const line of diff.split('\n')) {
    if (line.startsWith('+') && !line.startsWith('+++')) added++
    else if (line.startsWith('-') && !line.startsWith('---')) deleted++
  }
  return { added, deleted }
}

/** Synthetic all-added diff for an untracked file. */
function syntheticUntrackedDiff(path: string, content: string): string {
  const normalized = content.replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')
  // A trailing newline produces a final empty element — drop it so the diff
  // matches git's own count (a file "a\nb\n" has two lines, not three).
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  const header = `--- /dev/null\n+++ b/${path}\n@@ -0,0 +1,${lines.length} @@\n`
  return header + lines.map((l) => `+${l}`).join('\n')
}

async function collectDiff(cwd: string, change: Change): Promise<DiffFile> {
  const untracked = change.xy.startsWith('??')
  let diff = ''
  let binary = false

  if (untracked) {
    const abs = resolve(cwd, change.path)
    try {
      const content = readFileSync(abs, 'utf8')
      if (content.includes('\u0000')) {
        binary = true
        diff = 'Binary file (untracked)'
      } else {
        diff = syntheticUntrackedDiff(change.path, content)
      }
    } catch {
      diff = '(unreadable)'
    }
  } else {
    const [staged, unstaged] = await Promise.all([
      git(cwd, ['diff', '--cached', '--', change.path]),
      git(cwd, ['diff', '--', change.path]),
    ])
    const stagedText = staged.stdout.trimEnd()
    const unstagedText = unstaged.stdout.trimEnd()
    diff = [stagedText, unstagedText].filter(Boolean).join('\n')
    if (!diff.trim()) {
      // binary-only change (git prints a binary note with exit code 0)
      const [b1, b2] = await Promise.all([
        git(cwd, ['diff', '--cached', '--numstat', '--', change.path]),
        git(cwd, ['diff', '--numstat', '--', change.path]),
      ])
      const numstat = [b1.stdout, b2.stdout].join('\n')
      if (numstat.includes('-\t-\t')) {
        binary = true
        diff = 'Binary files differ'
      }
    }
  }

  const counts = binary ? { added: 0, deleted: 0 } : countLines(diff)
  const staged = untracked ? false : change.xy[0] !== ' ' && change.xy[0] !== '?'
  const unstaged = untracked ? true : change.xy[1] !== ' ' && change.xy[1] !== '?'
  const status = untracked ? '??' : change.xy.trim()

  return {
    path: change.path,
    origPath: change.origPath,
    xy: change.xy,
    status,
    untracked,
    staged,
    unstaged,
    added: counts.added,
    deleted: counts.deleted,
    diff,
    binary,
  }
}

async function collectStatus(cwd: string): Promise<StatusResponse> {
  const isRepo = await git(cwd, ['rev-parse', '--is-inside-work-tree'])
  if (isRepo.code !== 0) {
    return { isRepo: false, branch: null, upstream: null, ahead: 0, behind: 0, files: [], error: 'not a git repository' }
  }
  const branchResult = await git(cwd, ['branch', '--show-current'])
  const branch = branchResult.code === 0 && branchResult.stdout.trim() ? branchResult.stdout.trim() : null

  // Upstream + ahead/behind (0/0 when no upstream is configured).
  const upstreamResult = await git(cwd, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])
  const upstream = upstreamResult.code === 0 && upstreamResult.stdout.trim() ? upstreamResult.stdout.trim() : null
  let ahead = 0
  let behind = 0
  if (upstream) {
    const [aheadRes, behindRes] = await Promise.all([
      git(cwd, ['rev-list', '--count', '@{u}..HEAD']),
      git(cwd, ['rev-list', '--count', 'HEAD..@{u}']),
    ])
    ahead = aheadRes.code === 0 ? Number(aheadRes.stdout.trim()) || 0 : 0
    behind = behindRes.code === 0 ? Number(behindRes.stdout.trim()) || 0 : 0
  }

  const [statusResult, othersResult] = await Promise.all([
    git(cwd, ['status', '--porcelain=v1', '-z']),
    git(cwd, ['ls-files', '--others', '--exclude-standard', '-z']),
  ])

  const changes = parsePorcelain(statusResult.stdout)
  const untrackedPaths = othersResult.stdout.split('\0').filter(Boolean)
  for (const p of untrackedPaths) changes.push({ path: p, xy: '??' })

  const files = await Promise.all(changes.map((change) => collectDiff(cwd, change)))
  return { isRepo: true, branch, upstream, ahead, behind, files }
}

// ---------------------------------------------------------------------------
// Apply (accept = stage, revert = discard).
// ---------------------------------------------------------------------------

async function revertPath(cwd: string, path: string, untracked: boolean): Promise<string | null> {
  const abs = resolve(cwd, path)
  if (untracked) {
    try {
      // Only ever delete inside the workspace.
      if (!abs.startsWith(resolve(cwd) + sep) && abs !== resolve(cwd)) return `refusing to delete outside workspace: ${path}`
      if (existsSync(abs)) rmSync(abs, { recursive: true, force: true })
      return null
    } catch (e) {
      return `cannot remove ${path}: ${e instanceof Error ? e.message : String(e)}`
    }
  }
  const res = await git(cwd, ['restore', '--source=HEAD', '--staged', '--worktree', '--', path])
  return res.code === 0 ? null : res.stderr.trim() || `git restore failed for ${path}`
}

async function applyAction(config: Config, raw: unknown): Promise<{ status: number; body: ApplyResponse }> {
  const record = isRecord(raw) ? raw : {}
  const cwd = validateWorkspace(record.cwd, effectiveAllowedRoots(config))
  if ('error' in cwd) return { status: 400, body: { ok: false, error: cwd.error } }

  const action = record.action
  if (action !== 'accept' && action !== 'revert') {
    return { status: 400, body: { ok: false, error: 'action must be "accept" or "revert"' } }
  }

  let paths: string[] | null = null
  if (record.path !== undefined) {
    const safe = sanitizeRepoPath(record.path)
    if ('error' in safe) return { status: 400, body: { ok: false, error: safe.error } }
    paths = [safe.path]
  }

  if (action === 'accept') {
    const res = await git(cwd.path, paths === null ? ['add', '-A'] : ['add', '--', ...paths])
    if (res.code !== 0) return { status: 500, body: { ok: false, error: res.stderr.trim() || 'git add failed' } }
    return { status: 200, body: { ok: true } }
  }

  // revert
  if (paths === null) {
    const status = await collectStatus(cwd.path)
    if (!status.isRepo) return { status: 400, body: { ok: false, error: 'not a git repository' } }
    const errors: string[] = []
    for (const file of status.files) {
      const error = await revertPath(cwd.path, file.path, file.untracked)
      if (error) errors.push(error)
    }
    if (errors.length > 0) return { status: 500, body: { ok: false, error: errors.join('; ') } }
    return { status: 200, body: { ok: true } }
  }

  // revert one path — resolve untracked-ness against the live status
  const status = await collectStatus(cwd.path)
  const file = status.isRepo ? status.files.find((f) => f.path === paths![0]) : undefined
  const untracked = file?.untracked ?? false
  const error = await revertPath(cwd.path, paths[0], untracked)
  if (error) return { status: 500, body: { ok: false, error } }
  return { status: 200, body: { ok: true } }
}

// ---------------------------------------------------------------------------
// Commit + push (Codex-style: stage → commit with a message → push).
// ---------------------------------------------------------------------------

const MAX_COMMIT_MESSAGE = 2000

/** Commit the staged changes. `git commit` refuses when nothing is staged. */
async function commitAction(config: Config, raw: unknown): Promise<{ status: number; body: GitResponse }> {
  const record = isRecord(raw) ? raw : {}
  const cwd = validateWorkspace(record.cwd, effectiveAllowedRoots(config))
  if ('error' in cwd) return { status: 400, body: { ok: false, error: cwd.error } }

  const message = typeof record.message === 'string' ? record.message.trim() : ''
  if (!message) return { status: 400, body: { ok: false, error: 'missing "message"' } }
  if (message.length > MAX_COMMIT_MESSAGE) return { status: 400, body: { ok: false, error: `message too long (max ${MAX_COMMIT_MESSAGE} chars)` } }
  if (message.startsWith('-')) return { status: 400, body: { ok: false, error: 'message must not start with "-"' } }

  const res = await git(cwd.path, ['commit', '-m', message])
  if (res.code !== 0) {
    // `nothing to commit` is printed to stdout by git, not stderr.
    const detail = res.stderr.trim() || res.stdout.trim()
    return { status: 400, body: { ok: false, error: detail || 'git commit failed' } }
  }
  const hashRes = await git(cwd.path, ['rev-parse', '--short', 'HEAD'])
  return {
    status: 200,
    body: {
      ok: true,
      hash: hashRes.code === 0 ? hashRes.stdout.trim() : undefined,
      subject: message.split('\n')[0],
    },
  }
}

/** Push the current branch to its upstream. */
async function pushAction(config: Config, raw: unknown): Promise<{ status: number; body: GitResponse }> {
  const record = isRecord(raw) ? raw : {}
  const cwd = validateWorkspace(record.cwd, effectiveAllowedRoots(config))
  if ('error' in cwd) return { status: 400, body: { ok: false, error: cwd.error } }

  const res = await git(cwd.path, ['push'])
  if (res.code !== 0) {
    return { status: 500, body: { ok: false, error: res.stderr.trim() || 'git push failed' } }
  }
  return { status: 200, body: { ok: true, output: (res.stdout.trim() || res.stderr.trim() || 'pushed') } }
}

// ---------------------------------------------------------------------------
// Local history (commits not on the remote) + per-commit diff.
// ---------------------------------------------------------------------------

const HISTORY_LIMIT = 30

/** Recent commit timeline: every commit on HEAD, flagged ahead (unpushed). */
async function collectHistory(cwd: string): Promise<HistoryResponse> {
  // Ahead set: commits not on the remote. Without an upstream every local
  // commit counts as unpushed.
  const upstreamResult = await git(cwd, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])
  const hasUpstream = upstreamResult.code === 0 && upstreamResult.stdout.trim() !== ''
  const ahead = new Set<string>()
  if (hasUpstream) {
    const revs = await git(cwd, ['rev-list', '@{u}..HEAD'])
    if (revs.code === 0) for (const line of revs.stdout.split('\n')) if (line.trim()) ahead.add(line.trim())
  }

  // Record terminator \x01, field separator \x00 (subjects may contain any
  // printable char except the control separators).
  const res = await git(cwd, [
    'log',
    'HEAD',
    `--max-count=${HISTORY_LIMIT}`,
    '--pretty=format:%H%x00%h%x00%an%x00%aI%x00%s%x01',
  ])
  if (res.code !== 0) {
    return { ok: false, commits: [], error: res.stderr.trim() || 'git log failed' }
  }
  const commits = res.stdout
    .split('\x01')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, short, author, date, ...subjectParts] = record.split('\x00')
      return { hash, short, author, date, subject: subjectParts.join('\x00'), ahead: hasUpstream ? ahead.has(hash) : true }
    })
    .filter((c) => c.hash && c.short)
  return { ok: true, commits }
}

const HASH_RE = /^[0-9a-f]{7,40}$/

/** Diff of one commit (`git show <hash> --format=`). */
async function commitDiffAction(config: Config, query: URLSearchParams): Promise<{ status: number; body: CommitDiffResponse }> {
  const cwd = validateWorkspace(query.get('cwd'), effectiveAllowedRoots(config))
  if ('error' in cwd) return { status: 400, body: { ok: false, error: cwd.error, diff: '', files: [], added: 0, deleted: 0 } }

  const hash = query.get('hash') ?? ''
  if (!HASH_RE.test(hash)) {
    return { status: 400, body: { ok: false, error: 'invalid "hash"', diff: '', files: [], added: 0, deleted: 0 } }
  }

  const [diffRes, numstatRes] = await Promise.all([
    git(cwd.path, ['show', hash, '--format=', '--no-color']),
    git(cwd.path, ['show', hash, '--numstat', '--format=']),
  ])
  if (diffRes.code !== 0) {
    return { status: 400, body: { ok: false, error: diffRes.stderr.trim() || 'git show failed', diff: '', files: [], added: 0, deleted: 0 } }
  }

  const files: CommitDiffResponse['files'] = []
  let added = 0
  let deleted = 0
  for (const line of numstatRes.stdout.split('\n')) {
    const match = /^(\d+|-)\t(\d+|-)\t(.*)$/.exec(line)
    if (!match) continue
    const a = match[1] === '-' ? 0 : Number(match[1])
    const d = match[2] === '-' ? 0 : Number(match[2])
    added += a
    deleted += d
    files.push({ path: match[3], status: 'M', added: a, deleted: d })
  }

  return {
    status: 200,
    body: {
      ok: true,
      short: hash.slice(0, 7),
      diff: diffRes.stdout,
      files,
      added,
      deleted,
    },
  }
}

// ---------------------------------------------------------------------------
// Workspace validation + routes.
// ---------------------------------------------------------------------------

type WorkspaceResult = { path: string } | { error: string }

/** User-editable allowedRoots override (live, via the plugin config card). */
const CONFIG_OVERRIDE_FILE = 'dsh-plugin-diff-review-config.json'

function configOverridePath(): string {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, CONFIG_OVERRIDE_FILE)
}

/** Effective allowedRoots: the config-card override wins over entry config. */
function effectiveAllowedRoots(config: Config): string[] {
  try {
    const raw = JSON.parse(readFileSync(configOverridePath(), 'utf8'))
    if (isRecord(raw) && Array.isArray(raw.allowedRoots)) {
      return raw.allowedRoots.filter((r): r is string => typeof r === 'string')
    }
  } catch {
    // absent or malformed — fall back to entry config
  }
  return config.allowedRoots
}

/** Read the effective config for the config card. */
function readEffectiveConfig(config: Config): { allowedRoots: string[] } {
  return { allowedRoots: effectiveAllowedRoots(config) }
}

/** Persist the allowedRoots override ([] restores entry config). */
function writeConfigOverride(allowedRoots: string[]): void {
  writeFileSync(configOverridePath(), JSON.stringify({ allowedRoots }, null, 2), 'utf8')
}

function validateWorkspace(raw: unknown, allowedRoots: string[]): WorkspaceResult {
  if (typeof raw !== 'string' || !raw.trim()) return { error: 'missing "cwd"' }
  const p = raw.trim()
  if (!isAbsolute(p)) return { error: `cwd must be absolute: ${p}` }
  if (!existsSync(p)) return { error: `cwd does not exist: ${p}` }
  try {
    if (!statSync(p).isDirectory()) return { error: `cwd is not a directory: ${p}` }
  } catch (e) {
    return { error: `cannot stat cwd: ${e instanceof Error ? e.message : String(e)}` }
  }
  if (allowedRoots.length > 0) {
    const ok = allowedRoots.some((root) => {
      const r = root.replace(/[\\/]+$/, '')
      return p === r || p.startsWith(r + sep)
    })
    if (!ok) return { error: `cwd is outside allowedRoots: ${p}` }
  }
  return { path: p }
}

function jsonResponse(res: import('node:http').ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(data),
  })
  res.end(data)
}

async function readJsonBody(req: import('node:http').IncomingMessage): Promise<unknown> {
  let body = ''
  for await (const chunk of req) body += chunk
  if (!body) return {}
  try {
    return JSON.parse(body)
  } catch {
    return null
  }
}

function readQuery(req: import('node:http').IncomingMessage): URLSearchParams {
  return new URLSearchParams(req.url?.split('?')[1] ?? '')
}

/** Plugin body: register the status and apply routes. */
export function apply(ctx: Context, config: Config): void {
  ctx.inject(['webServer'], (httpCtx) => {
    httpCtx.effect(
      () =>
        httpCtx.webServer!.register({
          kind: 'exact',
          path: config.statusPath,
          handler: async (req, res) => {
            if (req.method === 'GET' || req.method === 'HEAD') {
              const cwd = validateWorkspace(readQuery(req).get('cwd'), effectiveAllowedRoots(config))
              if ('error' in cwd) {
                jsonResponse(res, 400, { isRepo: false, branch: null, files: [], error: cwd.error })
                return
              }
              jsonResponse(res, 200, await collectStatus(cwd.path))
              return
            }
            jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
          },
        }),
      'diff-review: status route',
    )
    httpCtx.effect(
      () =>
        httpCtx.webServer!.register({
          kind: 'exact',
          path: config.applyPath,
          handler: async (req, res) => {
            if (req.method === 'POST') {
              const raw = await readJsonBody(req)
              if (raw === null) {
                jsonResponse(res, 400, { ok: false, error: 'invalid JSON body' })
                return
              }
              const result = await applyAction(config, raw)
              jsonResponse(res, result.status, result.body)
              return
            }
            jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
          },
        }),
      'diff-review: apply route',
    )
    httpCtx.effect(
      () =>
        httpCtx.webServer!.register({
          kind: 'exact',
          path: config.commitPath,
          handler: async (req, res) => {
            if (req.method === 'POST') {
              const raw = await readJsonBody(req)
              if (raw === null) {
                jsonResponse(res, 400, { ok: false, error: 'invalid JSON body' })
                return
              }
              const result = await commitAction(config, raw)
              jsonResponse(res, result.status, result.body)
              return
            }
            jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
          },
        }),
      'diff-review: commit route',
    )
    httpCtx.effect(
      () =>
        httpCtx.webServer!.register({
          kind: 'exact',
          path: config.pushPath,
          handler: async (req, res) => {
            if (req.method === 'POST') {
              const raw = await readJsonBody(req)
              if (raw === null) {
                jsonResponse(res, 400, { ok: false, error: 'invalid JSON body' })
                return
              }
              const result = await pushAction(config, raw)
              jsonResponse(res, result.status, result.body)
              return
            }
            jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
          },
        }),
      'diff-review: push route',
    )
    httpCtx.effect(
      () =>
        httpCtx.webServer!.register({
          kind: 'exact',
          path: config.historyPath,
          handler: async (req, res) => {
            if (req.method === 'GET' || req.method === 'HEAD') {
              const cwd = validateWorkspace(readQuery(req).get('cwd'), effectiveAllowedRoots(config))
              if ('error' in cwd) {
                jsonResponse(res, 400, { ok: false, commits: [], error: cwd.error })
                return
              }
              jsonResponse(res, 200, await collectHistory(cwd.path))
              return
            }
            jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
          },
        }),
      'diff-review: history route',
    )
    httpCtx.effect(
      () =>
        httpCtx.webServer!.register({
          kind: 'exact',
          path: config.commitDiffPath,
          handler: async (req, res) => {
            if (req.method === 'GET' || req.method === 'HEAD') {
              const result = await commitDiffAction(config, readQuery(req))
              jsonResponse(res, result.status, result.body)
              return
            }
            jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
          },
        }),
      'diff-review: commit-diff route',
    )
    // Config card surface: read/write the allowedRoots override.
    httpCtx.effect(
      () =>
        httpCtx.webServer!.register({
          kind: 'exact',
          path: config.configPath,
          handler: async (req, res) => {
            if (req.method === 'GET' || req.method === 'HEAD') {
              jsonResponse(res, 200, { ok: true, ...readEffectiveConfig(config) })
              return
            }
            if (req.method === 'POST') {
              const raw = await readJsonBody(req)
              if (raw === null) {
                jsonResponse(res, 400, { ok: false, error: 'invalid JSON body' })
                return
              }
              const record = isRecord(raw) ? raw : {}
              const cfg = isRecord(record.config) ? record.config : {}
              if (!Array.isArray(cfg.allowedRoots) || cfg.allowedRoots.some((r) => typeof r !== 'string')) {
                jsonResponse(res, 400, { ok: false, error: 'config.allowedRoots must be an array of paths' })
                return
              }
              try {
                writeConfigOverride(cfg.allowedRoots)
                jsonResponse(res, 200, { ok: true, allowedRoots: effectiveAllowedRoots(config) })
              } catch (e) {
                jsonResponse(res, 500, { ok: false, error: e instanceof Error ? e.message : String(e) })
              }
              return
            }
            jsonResponse(res, 405, { ok: false, error: 'method not allowed' })
          },
        }),
      'diff-review: config route',
    )
  })
}
