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
import { existsSync, readFileSync, rmSync, statSync } from 'node:fs'
import { isAbsolute, join, resolve, sep } from 'node:path'
import type { ApplyResponse, DiffFile, StatusResponse } from '../shared/types.ts'

export const name = 'diff-review'

export interface Config {
  /** HTTP route returning the review status (files + diffs). */
  statusPath: string
  /** HTTP route applying accept/revert operations. */
  applyPath: string
  /** Non-empty = only workspaces under these roots may be reviewed. */
  allowedRoots: string[]
}

export const Config: z<Config> = z.object({
  statusPath: z.string().default('/diff-review/status'),
  applyPath: z.string().default('/diff-review/apply'),
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
    return { isRepo: false, branch: null, files: [], error: 'not a git repository' }
  }
  const branchResult = await git(cwd, ['branch', '--show-current'])
  const branch = branchResult.code === 0 && branchResult.stdout.trim() ? branchResult.stdout.trim() : null

  const [statusResult, othersResult] = await Promise.all([
    git(cwd, ['status', '--porcelain=v1', '-z']),
    git(cwd, ['ls-files', '--others', '--exclude-standard', '-z']),
  ])

  const changes = parsePorcelain(statusResult.stdout)
  const untrackedPaths = othersResult.stdout.split('\0').filter(Boolean)
  for (const p of untrackedPaths) changes.push({ path: p, xy: '??' })

  const files = await Promise.all(changes.map((change) => collectDiff(cwd, change)))
  return { isRepo: true, branch, files }
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
  const cwd = validateWorkspace(record.cwd, config.allowedRoots)
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
// Workspace validation + routes.
// ---------------------------------------------------------------------------

type WorkspaceResult = { path: string } | { error: string }

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
              const cwd = validateWorkspace(readQuery(req).get('cwd'), config.allowedRoots)
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
  })
}
