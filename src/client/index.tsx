/**
 * Diff-review plugin — client half.
 *
 * Codex-style review with two sources:
 *
 * 1. **会话更改 (Session changes)** — what the agent changed in each round of
 *    this conversation, derived from the conversation snapshot (tool results
 *    carry the host-computed `resultView` diff hunks). Works with or without
 *    git, and shows a change even when no diff text is available (path-only).
 * 2. **工作区 (Workspace)** — the git working tree's uncommitted changes
 *    (staged + unstaged + untracked) with per-file / all-file accept (stage)
 *    and revert (discard) through the plugin's server routes.
 *
 * The review surface mounts in `shell.overlay` (root scope). State hand-off
 * between the session-scoped header trigger and the root-scoped overlay goes
 * through a module-level snapshot store; the conversation snapshot for the
 * current session is read reactively through `ctx.sessions` (injected via the
 * overlay registration's inject face).
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, Fragment } from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { diffLines } from 'diff'
import type { ClientContext, ISessions, SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConversationNode, ToolResultNode, UserMessageNode } from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionId, ToolResultView } from '@deepseek-ai/dsh-api-remotes/client'
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
// Type-only imports pulling the header-action slot contract, the shell.overlay
// contract, the settings.general.item slot contract and the standard kit.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ApplyHunkResponse, ApplyResponse, CommentsResponse, CommitDiffResponse, CommitInfo, DiffFile, DiffHunk, GitResponse, HistoryResponse, PrResponse, ReposResponse, ReviewComment, ReviewFinding, ReviewResponse, StatusResponse } from '../shared/types.ts'

export const name = 'diff-review'

/** Required client services (fiber inject). */
export const inject = ['sessions', 'slots', 'locale']

const LOCALE_NS = 'diff-review'
const STATUS_URL = 'diff-review/status'
const APPLY_URL = 'diff-review/apply'
const APPLY_HUNK_URL = 'diff-review/apply-hunk'
const COMMIT_URL = 'diff-review/commit'
const PUSH_URL = 'diff-review/push'
const HISTORY_URL = 'diff-review/history'
const COMMIT_DIFF_URL = 'diff-review/commit-diff'
const COMMENTS_URL = 'diff-review/comments'
const BRANCHES_URL = 'diff-review/branches'
const REVIEW_URL = 'diff-review/review'
const PR_URL = 'diff-review/pr'
const REPOS_URL = 'diff-review/repos'
const OPEN_EDITOR_URL = 'open-editor/open'
const STYLE_TAG = 'dsh-plugin-diff-review/review.css'

/** Open state shared between the header trigger (session scope) and the overlay (root scope). */
const overlayStore = createSnapshotStore<{ open: boolean; cwd: string | null; key: number; focus?: { path: string; line?: number } | null }>({
  open: false,
  cwd: null,
  key: 0,
  focus: null,
})

/**
 * Pending inline comments surfaced above the composer (Codex-style). The
 * review overlay syncs its workspace comments (plus the diff context and the
 * last AI review result) here; the composer dock reads them and carries a
 * full review package with the user's next message.
 */
interface PendingComments {
  cwd: string | null
  comments: ReviewComment[]
  /** Unified diff text per commented path (context for the carried message). */
  diffs: Record<string, string>
  /** Last AI review result (verdict + findings), appended to the carried message. */
  review: ReviewResponse | null
}
const pendingCommentsStore = createSnapshotStore<PendingComments>({
  cwd: null,
  comments: [],
  diffs: {},
  review: null,
})

/** Inject text into a session as a user message; falls back to the clipboard. */
async function injectToSession(sessions: ISessions | undefined, sessionId: SessionId | null, text: string): Promise<'sent' | 'copied' | 'failed'> {
  const binding = sessionId ? sessions?.binding(sessionId) : undefined
  const session = binding?.session
  if (session) {
    try {
      const result = await session.prompt([{ type: 'text', text }], 'queue')
      if (result.ok) return 'sent'
    } catch {
      // fall through to the copy fallback
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}

// ---------------------------------------------------------------------------
// Review preferences (font / size / panel geometry), shared by the overlay
// and the Settings → General row. Persisted to localStorage by the store.
// ---------------------------------------------------------------------------

/** Panel geometry bounds. */
export const MIN_PANEL_W = 640
export const MIN_PANEL_H = 400

interface Prefs {
  /** Font option id (see FONT_OPTIONS). */
  font: string
  /** Diff text size in px. */
  size: number
  /** Panel width in px. */
  width: number
  /** Panel height in px. */
  height: number
}

const FONT_OPTIONS: { id: string; label: string; css: string }[] = [
  { id: 'mono', label: 'font.mono', css: 'var(--dsw-font-mono)' },
  { id: 'system', label: 'font.system', css: 'system-ui, -apple-system, sans-serif' },
  { id: 'consolas', label: 'Consolas', css: 'Consolas, "Courier New", monospace' },
  { id: 'jetbrains', label: 'JetBrains Mono', css: '"JetBrains Mono", Consolas, monospace' },
  { id: 'fira', label: 'Fira Code', css: '"Fira Code", Consolas, monospace' },
  { id: 'source', label: 'Source Code Pro', css: '"Source Code Pro", Consolas, monospace' },
]

const SIZE_OPTIONS = [11, 12, 13, 14, 16, 18]

/** Review scopes of the workspace tab (aligned with the Codex review pane). */
type WorkspaceScope = 'all' | 'unstaged' | 'staged' | 'commit' | 'branch' | 'last-turn'

const SCOPE_OPTIONS: { id: WorkspaceScope; label: keyof typeof zh }[] = [
  { id: 'all', label: 'scope.all' },
  { id: 'unstaged', label: 'scope.unstaged' },
  { id: 'staged', label: 'scope.staged' },
  { id: 'commit', label: 'scope.commit' },
  { id: 'branch', label: 'scope.branch' },
  { id: 'last-turn', label: 'scope.last-turn' },
]

/** Browser-side absolute path check (no node:path in the client bundle). */
function isAbsPath(p: string): boolean {
  return p.startsWith('/') || /^[A-Za-z]:[\\/]/.test(p)
}

function baseName(p: string): string {
  return p.split(/[\\/]/).pop() ?? p
}

const prefsStore = createSnapshotStore<Prefs>(
  { font: 'mono', size: 12, width: 1120, height: 720 },
  { persist: { name: 'dsdr-prefs' } },
)

/** CSS font-family for a stored font option id. */
function fontCss(id: string): string {
  return FONT_OPTIONS.find((f) => f.id === id)?.css ?? FONT_OPTIONS[0].css
}

/** Panel CSS variables carrying the font/size preference. */
function diffStyleVars(prefs: Prefs): CSSProperties {
  return {
    '--dsdr-diff-font': fontCss(prefs.font),
    '--dsdr-diff-size': `${prefs.size}px`,
  } as CSSProperties
}

// ---------------------------------------------------------------------------
// Session-changes extraction (client-side, works without git).
// ---------------------------------------------------------------------------

/** One before/after slice of a change (a hunk). */
interface Hunk {
  oldText: string | null
  newText: string
}

/** One file changed inside one round. */
interface RoundChange {
  path: string
  tool: string
  hunks: Hunk[]
  /** False when only the path is known (no diff data persisted). */
  hasDiff: boolean
}

/** One user round and the files it changed. */
interface SessionRound {
  round: number
  label: string
  changes: RoundChange[]
}

interface FileDiffLike {
  path: string
  oldText: string | null
  newText: string
}

/** Validate a raw FileDiff-shaped value (the tools' `{path, oldText, newText}` contract). */
function asFileDiff(raw: unknown): FileDiffLike | null {
  if (!raw || typeof raw !== 'object') return null
  const rec = raw as Record<string, unknown>
  if (typeof rec.path !== 'string' || !rec.path) return null
  if (typeof rec.newText !== 'string') return null
  const oldText = rec.oldText
  return { path: rec.path, oldText: typeof oldText === 'string' ? oldText : null, newText: rec.newText }
}

/** Diff hunks carried by a diff card (call view or result view). */
function diffsFromDiffCard(view: { card?: unknown; diffs?: unknown } | null | undefined): FileDiffLike[] {
  if (!view || view.card !== 'diff' || !Array.isArray(view.diffs)) return []
  return view.diffs.map(asFileDiff).filter((d): d is FileDiffLike => d !== null)
}

/** Human label for a call whose `call` head was truncated out of the window. */
function diffCardTitle(view: unknown): string | null {
  if (!view || typeof view !== 'object') return null
  const title = (view as Record<string, unknown>).title
  return typeof title === 'string' && title.trim() ? title.trim() : null
}

/** Raw `meta.diffs` fallback (the persisted tool/result meta). */
function diffsFromMeta(meta: unknown): FileDiffLike[] {
  if (!meta || typeof meta !== 'object') return []
  const diffs = (meta as Record<string, unknown>).diffs
  if (!Array.isArray(diffs)) return []
  return diffs.map(asFileDiff).filter((d): d is FileDiffLike => d !== null)
}

const MUTATION_TOOLS = new Set(['str_replace_editor', 'notebook_edit'])
const MUTATION_COMMANDS = new Set(['write', 'edit', 'replace', 'delete', 'move'])

/** Path-only fallback for known file-mutating tools whose result carried no diff. */
function mutationPath(tool: string, argsRaw: string): string | null {
  let args: Record<string, unknown> | null = null
  try {
    args = JSON.parse(argsRaw) as Record<string, unknown>
  } catch {
    return null
  }
  if (!args || typeof args !== 'object') return null
  if (tool === 'fs' || tool === 'filesystem') {
    const cmd = typeof args.command === 'string' ? args.command : ''
    if (!MUTATION_COMMANDS.has(cmd)) return null
    return typeof args.file_path === 'string' && args.file_path ? args.file_path : null
  }
  if (MUTATION_TOOLS.has(tool) || tool.startsWith('edit')) {
    for (const key of ['file_path', 'path', 'filename']) {
      if (typeof args[key] === 'string' && args[key]) return args[key] as string
    }
  }
  return null
}

/** Extract the changed files from one settled tool result (diff hunks, else path-only). */
function changesFromToolResult(call: { name: string; argsRaw: string } | null, node: ToolResultNode): RoundChange[] {
  // Long sessions truncate the call head out of the window (call === null), but
  // the host-computed call/result diff cards still carry the change — read those.
  const resultDiffs = diffsFromDiffCard(node.resultView)
  const callDiffs = resultDiffs.length === 0 ? diffsFromDiffCard(node.callView) : []
  const metaDiffs = resultDiffs.length === 0 && callDiffs.length === 0 ? diffsFromMeta(node.meta) : []
  const allDiffs = resultDiffs.length > 0 ? resultDiffs : callDiffs.length > 0 ? callDiffs : metaDiffs
  const tool = call?.name ?? diffCardTitle(node.callView) ?? 'tool'
  if (allDiffs.length > 0) {
    const byPath = new Map<string, RoundChange>()
    for (const d of allDiffs) {
      let entry = byPath.get(d.path)
      if (!entry) {
        entry = { path: d.path, tool, hunks: [], hasDiff: true }
        byPath.set(d.path, entry)
      }
      entry.hunks.push({ oldText: d.oldText, newText: d.newText })
    }
    return [...byPath.values()]
  }
  const path = call ? mutationPath(tool, call.argsRaw) : null
  return path ? [{ path, tool, hunks: [], hasDiff: false }] : []
}

/** Plain text of a user message (content blocks of type 'text'). */
function userText(node: UserMessageNode): string {
  const parts: string[] = []
  for (const block of node.content) {
    if (block && typeof block === 'object' && (block as { type?: unknown }).type === 'text' && typeof (block as { text?: unknown }).text === 'string') {
      parts.push((block as { text: string }).text)
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

/** Walk the conversation nodes and group changed files by user round. */
export function collectSessionRounds(nodes: readonly ConversationNode[]): SessionRound[] {
  const rounds: SessionRound[] = []
  let current: SessionRound | null = null
  for (const node of nodes) {
    if (node.kind === 'user') {
      current = { round: rounds.length + 1, label: userText(node).slice(0, 60), changes: [] }
      rounds.push(current)
      continue
    }
    if (node.kind !== 'tool-result' || !current) continue
    for (const change of changesFromToolResult(node.call, node)) {
      const existing = current.changes.find((c) => c.path === change.path && c.tool === change.tool)
      if (existing) {
        if (change.hasDiff) {
          existing.hunks.push(...change.hunks)
          existing.hasDiff = true
        }
      } else {
        current.changes.push(change)
      }
    }
  }
  return rounds.filter((r) => r.changes.length > 0)
}

/** Count of changed files across all rounds (for the header badge). */
export function countSessionChanges(nodes: readonly ConversationNode[]): number {
  let count = 0
  const seen = new Set<string>()
  for (const node of nodes) {
    if (node.kind !== 'tool-result') continue
    for (const change of changesFromToolResult(node.call, node)) {
      const key = `${change.tool}:${change.path}`
      if (!seen.has(key)) {
        seen.add(key)
        count++
      }
    }
  }
  return count
}

// ---------------------------------------------------------------------------
// Diff rendering.
// ---------------------------------------------------------------------------

/** Split one `git show --format=` diff into per-file segments. */
function splitCommitDiff(diff: string): { path: string; text: string }[] {
  const segments: { path: string; text: string[] }[] = []
  let current: { path: string; text: string[] } | null = null
  for (const line of diff.split('\n')) {
    const match = /^diff --git a\/(.*?) b\//.exec(line)
    if (match) {
      if (current) segments.push(current)
      current = { path: match[1], text: [line] }
    } else if (current) {
      current.text.push(line)
    }
  }
  if (current) segments.push(current)
  return segments.map((s) => ({ path: s.path, text: s.text.join('\n') }))
}

/** Status letter for a commit's file, derived from its diff segment text. */
function commitFileStatus(segmentText: string): string {
  if (/^new file mode/.test(segmentText)) return 'A'
  if (/^deleted file mode/.test(segmentText)) return 'D'
  if (/^rename from /.test(segmentText)) return 'R'
  return 'M'
}

type DiffRow = { kind: 'add' | 'del' | 'ctx' | 'hunk' | 'file' | 'note'; text: string }

/** Classify raw unified-diff text (git output) into rows. */
function gitDiffRows(diff: string): DiffRow[] {
  return diff.split('\n').map((line) => {
    if (line.startsWith('+++') || line.startsWith('---')) return { kind: 'file' as const, text: line }
    if (line.startsWith('@@')) return { kind: 'hunk' as const, text: line }
    if (line.startsWith('+')) return { kind: 'add' as const, text: line }
    if (line.startsWith('-')) return { kind: 'del' as const, text: line }
    if (line.startsWith('\\ ')) return { kind: 'note' as const, text: line }
    return { kind: 'ctx' as const, text: line }
  })
}

/** Compute add/del/ctx rows between two texts (the tools' FileDiff shape). */
function textDiffRows(oldText: string | null, newText: string): DiffRow[] {
  const rows: DiffRow[] = []
  for (const part of diffLines(oldText ?? '', newText)) {
    const lines = part.value.split('\n')
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
    for (const line of lines) {
      if (part.added) rows.push({ kind: 'add', text: `+${line}` })
      else if (part.removed) rows.push({ kind: 'del', text: `-${line}` })
      else rows.push({ kind: 'ctx', text: line })
    }
  }
  return rows
}

/** Session change rows with relative old/new line numbers (hunk rows reset). */
function sessionRowsWithLines(change: RoundChange): { row: DiffRow; oldLine: number | null; newLine: number | null }[] {
  const out: { row: DiffRow; oldLine: number | null; newLine: number | null }[] = []
  let oldLine = 1
  let newLine = 1
  for (const row of changeRows(change)) {
    if (row.kind === 'ctx') {
      out.push({ row, oldLine: oldLine++, newLine: newLine++ })
    } else if (row.kind === 'add') {
      out.push({ row, oldLine: null, newLine: newLine++ })
    } else if (row.kind === 'del') {
      out.push({ row, oldLine: oldLine++, newLine: null })
    } else {
      out.push({ row, oldLine: null, newLine: null })
    }
  }
  return out
}

/** All rows for one round change (multiple hunks get `@@` separators). */
function changeRows(change: RoundChange): DiffRow[] {
  if (!change.hasDiff || change.hunks.length === 0) return []
  const rows: DiffRow[] = []
  change.hunks.forEach((hunk, i) => {
    if (change.hunks.length > 1) rows.push({ kind: 'hunk', text: `@@ hunk ${i + 1}/${change.hunks.length} @@` })
    rows.push(...textDiffRows(hunk.oldText, hunk.newText))
  })
  return rows
}

// ---------------------------------------------------------------------------
// Split (two-column) diff view.
// ---------------------------------------------------------------------------

/** One aligned row of the side-by-side view. */
interface SplitRow {
  left: string
  right: string
  /** 1-based line number in the old file, or null (pure addition). */
  leftNum: number | null
  /** 1-based line number in the new file, or null (pure deletion). */
  rightNum: number | null
  kind: 'ctx' | 'change'
}

/** One side-by-side block (a hunk with its `@@` header). */
interface SplitBlock {
  head: string | null
  rows: SplitRow[]
}

/**
 * Pair add/del rows into aligned left/right columns. Removed lines buffer
 * until the matching additions arrive (unified diff orders deletions before
 * additions), so pure deletions and pure additions still get their own row
 * with an empty cell on the opposite side. Line numbers track from the hunk
 * header's `-a,b +c,d` positions.
 */
function pairRows(rows: DiffRow[], oldStart: number, newStart: number): SplitRow[] {
  const out: SplitRow[] = []
  let oldLine = oldStart
  let newLine = newStart
  let pending: { text: string; num: number }[] = []
  const flush = () => {
    for (const p of pending) out.push({ left: p.text, right: '', leftNum: p.num, rightNum: null, kind: 'change' })
    pending = []
  }
  for (const row of rows) {
    if (row.kind === 'del') {
      pending.push({ text: row.text.slice(1), num: oldLine++ })
    } else if (row.kind === 'add') {
      const p = pending.shift()
      out.push({ left: p?.text ?? '', right: row.text.slice(1), leftNum: p?.num ?? null, rightNum: newLine++, kind: 'change' })
    } else if (row.kind === 'ctx') {
      flush()
      // Unified-diff context lines carry a leading space — strip it for the
      // split cells so both columns render bare text.
      const text = row.text.startsWith(' ') ? row.text.slice(1) : row.text
      out.push({ left: text, right: text, leftNum: oldLine++, rightNum: newLine++, kind: 'ctx' })
    } else {
      flush() // notes (\ No newline…) and stray rows: just break the pairing
    }
  }
  flush()
  return out
}

/** Parse git unified diff text into blocks (`---/+++` file rows and `@@` hunks). */
const GIT_META = /^(diff --git |index |new file |deleted file |old mode |new mode |similarity index |rename (from|to) |Binary files )/

function parseGitBlocks(diff: string): { head: DiffRow | null; rows: DiffRow[] }[] {
  const blocks: { head: DiffRow | null; rows: DiffRow[] }[] = []
  let current: { head: DiffRow | null; rows: DiffRow[] } | null = null
  const lines = diff.split('\n')
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  for (const line of lines) {
    let kind: DiffRow['kind']
    if (line.startsWith('+++') || line.startsWith('---') || GIT_META.test(line)) kind = 'file'
    else if (line.startsWith('@@')) kind = 'hunk'
    else if (line.startsWith('+')) kind = 'add'
    else if (line.startsWith('-')) kind = 'del'
    else if (line.startsWith('\\ ')) kind = 'note'
    else kind = 'ctx'
    if (kind === 'file' || kind === 'hunk') {
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

/** Hunk start positions from a `@@ -a,b +c,d @@` header. */
function hunkStarts(head: string): { oldStart: number; newStart: number } {
  const m = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(head)
  return { oldStart: m ? Number(m[1]) : 1, newStart: m ? Number(m[2]) : 1 }
}

/** Side-by-side blocks for a git unified diff (skips pure file-header blocks). */
function gitSplitBlocks(diff: string): SplitBlock[] {
  return parseGitBlocks(diff)
    .filter((b) => b.head?.kind !== 'file' && (b.rows.length > 0 || b.head?.kind === 'hunk'))
    .map((b) => {
      const starts = b.head ? hunkStarts(b.head.text) : { oldStart: 1, newStart: 1 }
      return { head: b.head?.kind === 'hunk' ? b.head.text : null, rows: pairRows(b.rows, starts.oldStart, starts.newStart) }
    })
}

/** Side-by-side blocks for the tools' FileDiff shape (oldText/newText). */
function textSplitBlocks(oldText: string | null, newText: string): SplitBlock[] {
  const rows: DiffRow[] = []
  for (const part of diffLines(oldText ?? '', newText)) {
    const lines = part.value.split('\n')
    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
    for (const line of lines) {
      if (part.added) rows.push({ kind: 'add', text: `+${line}` })
      else if (part.removed) rows.push({ kind: 'del', text: `-${line}` })
      else rows.push({ kind: 'ctx', text: line })
    }
  }
  return [{ head: null, rows: pairRows(rows, 1, 1) }]
}

/** All side-by-side blocks for one round change. */
function changeSplitBlocks(change: RoundChange): SplitBlock[] {
  if (!change.hasDiff || change.hunks.length === 0) return []
  return change.hunks.map((hunk, i) => ({
    head: change.hunks.length > 1 ? `@@ hunk ${i + 1}/${change.hunks.length} @@` : null,
    rows: textSplitBlocks(hunk.oldText, hunk.newText)[0].rows,
  }))
}

// ---------------------------------------------------------------------------
// Styles (dsdr-*; the header trigger mirrors the in-tree action rows).
// ---------------------------------------------------------------------------

const REVIEW_CSS = `
.dsdr-trigger{min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:4px;padding:3px 6px;font:inherit;font-size:12px;line-height:18px;display:inline-flex}
.dsdr-trigger:hover,.dsdr-trigger:focus-visible{color:var(--dsw-alias-label-secondary)}
.dsdr-label{margin-left:2px}
.dsdr-count{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-secondary);border-radius:999px;min-width:16px;text-align:center;font-size:11px;line-height:16px;padding:0 5px;font-variant-numeric:tabular-nums}
.dsdr-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:32px}
.dsdr-panel{box-sizing:border-box;position:relative;width:min(1120px,100%);height:min(720px,calc(100vh - 64px));max-width:calc(100vw - 64px);max-height:calc(100vh - 64px);background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:var(--dsw-shadow-lv3);display:flex;flex-direction:column;overflow:hidden}
.dsdr-resize{position:absolute;z-index:5}
.dsdr-resize-e{top:0;right:-3px;width:7px;height:100%;cursor:ew-resize}
.dsdr-resize-s{bottom:-3px;left:0;width:100%;height:7px;cursor:ns-resize}
.dsdr-resize-se{right:-4px;bottom:-4px;width:15px;height:15px;cursor:nwse-resize}
.dsdr-header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dsdr-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-subtitle{color:var(--dsw-alias-label-tertiary);font-size:12px;font-family:var(--dsw-font-mono)}
.dsdr-tabs{display:flex;gap:4px;margin-left:14px}
.dsdr-tab{box-sizing:border-box;min-height:26px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:2px 10px;font:inherit;font-size:12px;line-height:18px}
.dsdr-tab:hover{color:var(--dsw-alias-label-secondary)}
.dsdr-tab-active{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-scope{display:inline-flex;align-items:center;gap:6px;margin-left:8px}
.dsdr-scope .dsdr-sel-trigger{min-width:110px;height:26px;font-size:12px;line-height:18px;padding:0 8px;background:var(--dsw-alias-bg-layer-2)}
.dsdr-spacer{flex:1}
.dsdr-btn{box-sizing:border-box;min-height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:3px 10px;font:inherit;font-size:12px;line-height:18px;display:inline-flex;align-items:center;gap:5px}
.dsdr-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-btn:disabled{opacity:.5;cursor:default}
.dsdr-btn-primary{border-color:var(--dsw-static-neutral-bluish-400);color:var(--dsw-alias-label-primary)}
.dsdr-btn-danger{color:var(--dsw-alias-state-error-primary)}
.dsdr-btn-danger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)}
.dsdr-btn-confirm{border-color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);color:var(--dsw-static-neutral-bluish-50)}
.dsdr-btn-confirm:hover:not(:disabled){background:var(--dsw-alias-state-error-primary);color:var(--dsw-static-neutral-bluish-50)}
.dsdr-commit-input{box-sizing:border-box;width:200px;min-height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);padding:3px 10px;font:inherit;font-size:12px;line-height:18px}
.dsdr-commit-input::placeholder{color:var(--dsw-alias-label-caption)}
.dsdr-commit-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsdr-section{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);padding:10px 8px 3px;font-weight:600;display:flex;align-items:center;gap:6px}
.dsdr-section:first-child{padding-top:4px}
.dsdr-branch{display:flex;align-items:center;gap:8px;padding:4px 8px 8px;flex-wrap:wrap}
.dsdr-branch-ref{font-size:12px;color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;display:inline-flex;align-items:center;gap:5px}
.dsdr-branch-arrow{color:var(--dsw-alias-label-tertiary)}
.dsdr-branch-stat{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-variant-numeric:tabular-nums}
.dsdr-branch-ahead{color:var(--dsw-alias-state-success-primary)}
.dsdr-branch-behind{color:var(--dsw-alias-state-warn-primary)}
.dsdr-branch-sync{color:var(--dsw-alias-state-success-primary)}
.dsdr-commit{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;border-radius:8px;padding:5px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:var(--dsw-alias-label-primary)}
.dsdr-commit:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-tl-selected .dsdr-commit{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-timeline{display:flex;flex-direction:column}
.dsdr-tl-item{display:flex;gap:6px;align-items:stretch;border-radius:8px}
.dsdr-tl-rail{position:relative;flex:none;width:14px;display:flex;justify-content:center}
.dsdr-tl-rail::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--dsw-alias-border-l2)}
.dsdr-tl-item:first-child .dsdr-tl-rail::before{top:9px}
.dsdr-tl-item:last-child .dsdr-tl-rail::before{bottom:auto;height:9px}
.dsdr-tl-dot{position:relative;z-index:1;top:9px;flex:none;width:7px;height:7px;border-radius:50%;border:1px solid var(--dsw-alias-bg-module-platform)}
.dsdr-tl-dot-local{background:var(--dsw-alias-state-success-primary)}
.dsdr-tl-dot-remote{background:var(--dsw-alias-label-tertiary)}
.dsdr-commit-head{display:flex;align-items:center;gap:6px;min-width:0}
.dsdr-commit-short{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-commit-subject{flex:1;min-width:0;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-commit-meta{font-size:11px;color:var(--dsw-alias-label-tertiary);padding-left:0}
.dsdr-tl-badge{flex:none;font-size:10px;line-height:14px;border-radius:4px;padding:0 5px}
.dsdr-tl-badge-local{background:rgba(46,160,67,.16);color:var(--dsw-alias-state-success-primary)}
.dsdr-tl-badge-remote{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-diff-hash{margin-left:8px;font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-commit-file-head{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dsdr-commit-file-path{font-family:var(--dsw-font-mono);font-size:12px;color:var(--dsw-alias-label-primary);margin-left:4px}
.dsdr-cfg-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}
.dsdr-cfg-card:hover{border-color:var(--dsw-alias-label-dimmed)}
.dsdr-cfg-card-open{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}
.dsdr-cfg-head{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}
.dsdr-cfg-head:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsdr-cfg-head-text{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}
.dsdr-cfg-name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}
.dsdr-cfg-desc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}
.dsdr-cfg-caret{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}
.dsdr-cfg-caret-open{transform:rotate(180deg)}
.dsdr-cfg-body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px;display:flex;flex-direction:column}
.dsdr-cfg-field{flex-direction:column;gap:6px;padding:12px 0;display:flex}
.dsdr-cfg-field+.dsdr-cfg-field{border-top:1px solid var(--dsw-alias-border-l2)}
.dsdr-cfg-label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}
.dsdr-cfg-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}
.dsdr-cfg-pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}
.dsdr-cfg-failed{min-width:0;color:var(--dsw-alias-label-error);flex:1;margin:0;font-size:12px;line-height:1.5}
.dsdr-cfg-actions{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}
.dsdr-body{display:flex;flex:1;min-height:0}
.dsdr-files{width:300px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow-y:auto;padding:8px}
.dsdr-round{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);padding:8px 8px 3px;font-weight:600}
.dsdr-round-label{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-weight:400;color:var(--dsw-alias-label-secondary)}
.dsdr-file{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border-radius:8px;padding:6px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:var(--dsw-alias-label-primary)}
.dsdr-file:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-file-selected{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-dir{display:flex;align-items:center;gap:5px;width:100%;box-sizing:border-box;border-radius:7px;padding:5px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:var(--dsw-alias-label-secondary);font-size:12px}
.dsdr-dir:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-dir-caret{flex:none;width:12px;text-align:center;font-size:10px;color:var(--dsw-alias-label-tertiary)}
.dsdr-dir-name{flex:1;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-weight:600}
.dsdr-dir-count{flex:none;font-size:10px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dsdr-file-name{flex:1;min-width:0;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-family:var(--dsw-font-mono)}
.dsdr-file-stat{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dsdr-chip{flex:none;min-width:22px;text-align:center;border-radius:5px;font-size:11px;line-height:16px;padding:0 4px;font-family:var(--dsw-font-mono)}
.dsdr-chip-m{background:rgba(46,160,67,.16);color:#2ea043}
.dsdr-chip-a{background:rgba(46,160,67,.16);color:#2ea043}
.dsdr-chip-d{background:rgba(248,81,73,.16);color:#f85149}
.dsdr-chip-r{background:rgba(88,166,255,.16);color:#58a6ff}
.dsdr-chip-u{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-tool{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-diff{flex:1;min-width:0;overflow:auto;padding:10px 0}
.dsdr-diff-empty{display:flex;align-items:center;justify-content:center;height:100%;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsdr-diff-head{display:flex;align-items:center;gap:10px;padding:6px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dsdr-diff-path{font-family:var(--dsw-font-mono);font-size:13px;color:var(--dsw-alias-label-primary);flex:1;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-diff-stats{font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none}
.dsdr-diff-scroll{flex:1;min-height:0;overflow:auto;display:flex}
.dsdr-pre{margin:0;padding:8px 0;font-family:var(--dsdr-diff-font, var(--dsw-font-mono));font-size:var(--dsdr-diff-size, 12px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px);white-space:pre;min-width:100%;flex:1}
.dsdr-line{display:flex;align-items:flex-start;gap:10px;padding:0 16px;color:var(--dsw-alias-label-primary);position:relative}
.dsdr-line-num{flex:none;position:relative;width:40px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;font-size:calc(var(--dsdr-diff-size, 12px) - 1px);opacity:.75}
.dsdr-line-text{flex:1;min-width:0;white-space:pre}
.dsdr-comment-add{position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:16px;height:16px;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:12px;line-height:1;padding:0;visibility:hidden}
.dsdr-line:hover .dsdr-comment-add,.dsdr-comment-add:focus-visible{visibility:visible}
.dsdr-comment-add:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-comment-has{visibility:visible;background:color-mix(in srgb, var(--dsw-alias-button-info-fill) 16%, transparent);color:var(--dsw-alias-button-info-fill);font-variant-numeric:tabular-nums;font-size:10px}
.dsdr-line-commented{box-shadow:inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-button-info-fill) 70%, transparent)}
.dsdr-comment-editor{display:flex;flex-direction:column;gap:6px;padding:8px 16px;border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.dsdr-comment-input{box-sizing:border-box;width:100%;min-height:52px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);padding:6px 8px;font:inherit;font-size:12px;line-height:18px;resize:vertical}
.dsdr-comment-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsdr-comment-actions{display:flex;gap:6px;justify-content:flex-end}
.dsdr-comment-pop{position:absolute;z-index:20;right:16px;top:calc(100% + 2px);min-width:280px;max-width:440px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);border-radius:10px;box-shadow:var(--dsw-shadow-lv3);padding:8px;display:flex;flex-direction:column;gap:6px}
.dsdr-comment-item{display:flex;flex-direction:column;gap:4px;border-bottom:1px solid var(--dsw-alias-border-l1);padding-bottom:6px}
.dsdr-comment-item:last-child{border-bottom:0;padding-bottom:0}
.dsdr-comment-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--dsw-font-mono)}
.dsdr-comment-meta{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-comment-meta .dsdr-btn{min-height:20px;padding:0 6px;font-size:10px;line-height:14px;margin-left:auto}
.dsdr-openline{flex:none;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:12px;line-height:1;padding:0;visibility:hidden}
.dsdr-line:hover .dsdr-openline,.dsdr-openline:focus-visible{visibility:visible}
.dsdr-openline:hover{color:var(--dsw-alias-label-primary)}
.dsdr-line-finding{box-shadow:inset 3px 0 0 var(--dsdr-finding-color, rgba(255,166,87,.7))}
.dsdr-finding-P0{--dsdr-finding-color:#f85149}
.dsdr-finding-P1{--dsdr-finding-color:#ffa657}
.dsdr-finding-P2{--dsdr-finding-color:#d29922}
.dsdr-finding-P3{--dsdr-finding-color:#8b949e}
.dsdr-finding-tag{flex:none;font-size:10px;line-height:14px;border-radius:4px;padding:0 4px;font-family:var(--dsw-font-mono);font-weight:600;align-self:flex-start;margin-top:2px}
.dsdr-finding-tag.dsdr-finding-P0{background:rgba(248,81,73,.18);color:#f85149}
.dsdr-finding-tag.dsdr-finding-P1{background:rgba(255,166,87,.16);color:#ffa657}
.dsdr-finding-tag.dsdr-finding-P2{background:rgba(210,153,34,.16);color:#d29922}
.dsdr-finding-tag.dsdr-finding-P3{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-line-jump{background:rgba(88,166,255,.16)}
.dsdr-verdict{position:sticky;top:0;z-index:6;display:flex;align-items:center;gap:8px;margin:0 0 6px;padding:8px 12px;background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:var(--dsw-shadow-lv2);font-size:12px;line-height:18px;flex-wrap:wrap}
.dsdr-verdict-mark{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;font-size:12px;font-weight:700}
.dsdr-verdict-ok .dsdr-verdict-mark{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 18%, transparent);color:var(--dsw-alias-state-success-primary)}
.dsdr-verdict-bad .dsdr-verdict-mark{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 18%, transparent);color:var(--dsw-alias-state-error-primary)}
.dsdr-verdict-text{font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-verdict-ok .dsdr-verdict-text{color:var(--dsw-alias-state-success-primary)}
.dsdr-verdict-bad .dsdr-verdict-text{color:var(--dsw-alias-state-error-primary)}
.dsdr-verdict-meta{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.dsdr-verdict-model{font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-finding-card{display:flex;flex-direction:column;gap:4px;margin:4px 0 6px;padding:8px 16px;background:var(--dsw-alias-bg-module-platform);border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsdr-finding-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsdr-finding-card-title{flex:1;min-width:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-finding-card-loc{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsdr-finding-card-detail{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsdr-finding-card-meta{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-finding-card-suggestion{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;line-height:16px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 8px;font-family:var(--dsw-font-mono)}
.dsdr-pr{display:flex;flex-direction:column;gap:4px;padding:4px 8px 8px}
.dsdr-pr-item{display:flex;flex-direction:column;gap:3px;border-radius:8px;padding:6px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit}
.dsdr-pr-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-pr-meta{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-pr-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsdr-dock{box-sizing:border-box;display:flex;flex-direction:column;gap:2px;width:100%;max-width:var(--dsh-composer-card-max-width, 780px);margin:0 auto calc(-1 * var(--dsh-composer-stack-gap, 6px) - 8px);padding:8px 16px;background:var(--dsw-specific-input-major);border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-bottom:none;border-radius:22px 22px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}
.dsdr-dock-head{display:flex;align-items:center;gap:6px;min-height:22px}
.dsdr-dock-icon{display:inline-flex;color:var(--dsw-alias-button-info-fill)}
.dsdr-dock-count{font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);white-space:nowrap}
.dsdr-dock-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0}
.dsdr-dock-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-dock-list{display:flex;flex-direction:column;gap:2px;padding-top:4px;margin-top:2px;max-height:168px;overflow-y:auto}
.dsdr-dock-item{display:flex;flex-direction:column;gap:1px;text-align:left;border:0;background:transparent;border-radius:7px;padding:4px 8px;cursor:pointer;font:inherit}
.dsdr-dock-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-dock-loc{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-dock-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.dsdr-send{position:absolute;z-index:40;top:52px;right:16px;width:min(480px,calc(100% - 32px));border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);border-radius:12px;box-shadow:var(--dsw-shadow-lv3);padding:12px;display:flex;flex-direction:column;gap:8px}
.dsdr-send-title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-send-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.dsdr-send-input{box-sizing:border-box;width:100%;min-height:140px;max-height:320px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);padding:8px;font:inherit;font-size:12px;line-height:18px;resize:vertical;white-space:pre-wrap}
.dsdr-line-add{background:rgba(46,160,67,.13)}
.dsdr-line-del{background:rgba(248,81,73,.12)}
.dsdr-line-hunk{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-line-file{color:var(--dsw-alias-label-tertiary)}
.dsdr-line-note{color:var(--dsw-alias-label-tertiary);font-style:italic}
.dsdr-hunk-bar{display:flex;align-items:center;gap:6px;padding:2px 16px;border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-fill-l2)}
.dsdr-hunk-bar .dsdr-btn{min-height:22px;padding:1px 8px;font-size:11px;line-height:16px}
.dsdr-hunk-layer{font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);margin-right:auto}
.dsdr-foot{display:flex;align-items:center;gap:10px;padding:8px 16px;border-top:1px solid var(--dsw-alias-border-l1);flex:none;min-height:36px}
.dsdr-notice{font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsdr-notice-ok{color:var(--dsw-alias-state-success-primary)}
.dsdr-notice-error{color:var(--dsw-alias-state-error-primary)}
.dsdr-spinner{flex:none;width:12px;height:12px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-label-secondary);animation:dsdr-spin .8s linear infinite}
@keyframes dsdr-spin{to{transform:rotate(360deg)}}
.dsdr-empty{padding:40px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsdr-nodiff{padding:8px 16px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsdr-sel{position:relative;display:inline-flex}
.dsdr-sel-trigger{box-sizing:content-box;min-width:180px;height:34px;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;color:var(--dsw-alias-label-primary);cursor:pointer;padding:0 12px;font:inherit;font-size:13px;line-height:1.5;display:inline-flex;align-items:center;gap:8px}
.dsdr-sel-trigger:hover{border-color:var(--dsw-alias-label-dimmed)}
.dsdr-sel-trigger:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}
.dsdr-sel-trigger svg{flex:none;transition:transform .12s}
.dsdr-sel-trigger[aria-expanded="true"] svg{transform:rotate(180deg)}
.dsdr-sel-value{flex:1;min-width:0;text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-sel-menu{z-index:200;box-sizing:border-box;min-width:100%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);border-radius:10px;margin:0;padding:4px;list-style:none;display:flex;flex-direction:column;gap:1px;position:absolute;top:calc(100% + 5px);left:0}
.dsdr-sel-option{box-sizing:border-box;width:100%;min-height:30px;color:var(--dsw-alias-label-primary);border-radius:7px;align-items:center;gap:8px;padding:5px 8px;font:inherit;font-size:12px;line-height:18px;cursor:pointer;background:0 0;border:0;text-align:left;display:flex}
.dsdr-sel-option:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-sel-option-active{color:var(--dsw-alias-label-primary)}
.dsdr-sel-option-mark{flex:none;width:14px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary)}
.dsdr-sel-option-label{flex:1;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-view-toggle{display:flex;gap:2px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;padding:2px;flex:none}
.dsdr-view-btn{box-sizing:border-box;min-height:22px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:1px 8px;font:inherit;font-size:11px;line-height:16px}
.dsdr-view-btn:hover{color:var(--dsw-alias-label-secondary)}
.dsdr-view-btn-active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-split{min-width:100%}
.dsdr-split-head{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary);padding:4px 8px;position:sticky;top:0;background:var(--dsw-alias-bg-module-platform)}
.dsdr-split-head div{display:flex;gap:8px}
.dsdr-split-hunk{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-fill-l2);font-family:var(--dsdr-diff-font, var(--dsw-font-mono));font-size:11px;line-height:18px;padding:2px 16px}
.dsdr-split-row{position:relative;display:grid;grid-template-columns:1fr 1fr;font-family:var(--dsdr-diff-font, var(--dsw-font-mono));font-size:var(--dsdr-diff-size, 12px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px)}
.dsdr-split-cell:hover .dsdr-comment-add,.dsdr-split-row:hover .dsdr-comment-add{visibility:visible}
.dsdr-split-cell{display:flex;gap:8px;padding:0 8px;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}
.dsdr-split-num{flex:none;position:relative;width:42px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;font-size:calc(var(--dsdr-diff-size, 12px) - 1px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px)}
.dsdr-split-text{flex:1;min-width:0}
.dsdr-cell-finding{box-shadow:inset 0 0 0 1px var(--dsdr-finding-color, rgba(255,166,87,.7));background:rgba(255,166,87,.08)}
.dsdr-cell-jump{background:rgba(88,166,255,.16)}
.dsdr-split-finding{flex:none;font-size:9px;line-height:12px;border-radius:3px;padding:0 3px;font-family:var(--dsw-font-mono);font-weight:600;align-self:flex-start}
.dsdr-split-finding.dsdr-finding-P0{background:rgba(248,81,73,.18);color:#f85149}
.dsdr-split-finding.dsdr-finding-P1{background:rgba(255,166,87,.16);color:#ffa657}
.dsdr-split-finding.dsdr-finding-P2{background:rgba(210,153,34,.16);color:#d29922}
.dsdr-split-finding.dsdr-finding-P3{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-split-openline{flex:none;display:flex;align-items:center;justify-content:center;width:16px;height:16px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:11px;line-height:1;padding:0;visibility:hidden}
.dsdr-split-cell:hover .dsdr-split-openline,.dsdr-split-openline:focus-visible{visibility:visible}
.dsdr-split-openline:hover{color:var(--dsw-alias-label-primary)}
.dsdr-cell-add{background:rgba(46,160,67,.13)}
.dsdr-cell-del{background:rgba(248,81,73,.12)}
.dsdr-cell-dim{background:var(--dsw-alias-fill-l1, rgba(128,128,128,.05))}
`
if (typeof document !== 'undefined' && document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG)}]`) === null) {
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-plugin-diff-review'
  tag.dataset.pluginCss = STYLE_TAG
  tag.textContent = REVIEW_CSS
  document.head.appendChild(tag)
}

/** Simplified Chinese dictionary (key-set source of truth). */
const zh = {
  'action.label': '变动',
  'action.aria': '审查当前项目与每轮修改',
  'tab.session': '会话更改',
  'tab.workspace': '工作区',
  'review.title': '变动',
  'review.branch': '分支',
  'review.detached': '游离 HEAD',
  'review.notRepo': '当前目录不是 git 仓库',
  'review.notRepoHint': '「会话更改」页签不受影响，仍可查看每轮修改。',
  'review.noSessionChanges': '这个会话还没有文件修改记录',
  'review.sessionStats': '{rounds} 轮 · {files} 个文件',
  'review.round': '第 {round} 轮',
  'review.empty': '没有未提交的更改 🎉',
  'review.loadError': '加载失败',
  'review.accept': '采纳',
  'review.revert': '丢弃',
  'review.acceptAll': '全部采纳',
  'review.revertAll': '全部丢弃',
  'review.unstage': '取消暂存',
  'review.unstageAll': '全部取消暂存',
  'hunk.stage': '暂存',
  'hunk.revert': '丢弃',
  'hunk.unstage': '取消暂存',
  'hunk.staged': '已暂存',
  'hunk.unstaged': '未暂存',
  'review.confirmRevert': '再次点击确认丢弃',
  'review.confirmRevertAll': '再次点击确认全部丢弃',
  'review.commit': '提交',
  'review.commitPlaceholder': '提交说明…',
  'review.push': '推送',
  'review.confirmPush': '再次点击确认推送',
  'review.committed': '已提交 {summary}',
  'review.commitFailed': '提交失败',
  'review.pushed': '已推送',
  'review.pushFailed': '推送失败',
  'review.ahead': '领先 {n}',
  'review.behind': '落后 {n}',
  'review.sectionStaged': '已暂存',
  'review.sectionChanges': '未暂存',
  'review.sectionBranch': '分支与远程',
  'review.noUpstream': '未设置上游分支',
  'review.history': '历史',
  'review.commitFiles': '变动文件',
  'history.local': '本地',
  'history.remote': '远程',
  'time.now': '刚刚',
  'time.minutes': '{n} 分钟前',
  'time.hours': '{n} 小时前',
  'time.days': '{n} 天前',
  'review.refresh': '刷新',
  'review.close': '关闭',
  'review.busy': '处理中…',
  'review.done': '已{action} {count} 个文件',
  'review.doneOne': '已{action} {path}',
  'review.doneDeleted': '已{action} {count} 个文件（删除 {deleted} 个未跟踪文件）',
  'review.accepted': '采纳',
  'review.reverted': '丢弃',
  'review.untracked': '未跟踪',
  'review.binary': '二进制',
  'review.noDiffData': '该修改没有 diff 数据',
  'review.changes': '{added}+ {deleted}-',
  'view.single': '单栏',
  'view.split': '双栏',
  'view.before': '原文件',
  'view.after': '新文件',
  'comment.add': '评论此行',
  'comment.show': '查看评论',
  'comment.placeholder': '评论…（Ctrl/⌘+Enter 保存）',
  'comment.save': '保存',
  'comment.cancel': '取消',
  'comment.delete': '删除',
  'comment.saved': '已保存评论',
  'comment.failed': '评论保存失败',
  'scope.label': '范围',
  'scope.all': '全部',
  'scope.unstaged': '未暂存',
  'scope.staged': '已暂存',
  'scope.commit': '提交',
  'scope.branch': '分支',
  'scope.last-turn': '最后一轮',
  'review.lastTurnEmpty': '最后一轮没有记录到文件修改 —— 终端命令（bash）改文件不会计入会话记录；可切到「全部」查看 git 变更',
  'scope.base': '基线分支',
  'scope.branchReadonly': '分支范围只读（对比 merge-base，不提供采纳/丢弃）',
  'review.selectCommit': '从左侧选择提交查看 diff',
  'review.sendToAgent': '发送给代理',
  'review.sendTitle': '发送行内评论给代理',
  'review.sendHint': '评论会作为评审指引注入当前会话（Address the inline comments）。发送失败时退化为复制文本。',
  'review.sentToAgent': '已发送给代理',
  'review.copy': '复制文本',
  'review.copied': '已复制',
  'review.copyFailed': '复制失败',
  'review.review': '评审',
  'review.reviewing': '评审中…',
  'review.reviewFailed': '评审失败',
  'review.verdictCorrect': '补丁正确 ✓',
  'review.verdictIncorrect': '补丁存在问题 ✗',
  'review.noFindings': '没有发现问题',
  'review.findings': '{n} 条发现',
  'review.confidence': '置信度 {confidence}',
  'review.suggestion': '建议',
  'review.sendFindings': '发送发现给代理',
  'review.sentFindings': '已发送发现给代理',
  'review.reviewScope': '评审范围',
  'pr.title': 'PR #{number}',
  'pr.comments': 'PR 评论 ({n})',
  'pr.noPr': '无关联 PR',
  'pr.sendComments': '发送 PR 评论给代理',
  'editor.openFile': '在编辑器中打开',
  'editor.openLine': '在编辑器中打开该行',
  'editor.failed': '打开失败',
  'repo.label': '仓库',
  'review.dockComments': '行内评论 {n} 条',
  'review.dockJump': '点击在评审面板中打开对应变更',
  'review.dockHint': '随下一条消息自动附带（含 diff 与 AI 评审结论）',
  'settings.title': '变动',
  'settings.font': '字体',
  'settings.size': '字号',
  'config.title': '配置',
  'font.mono': '等宽（默认）',
  'font.system': '系统字体',
} as const

/** English dictionary, checked complete against the zh key set. */
const en: Record<keyof typeof zh, string> = {
  'action.label': 'Changes',
  'action.aria': 'Review workspace and per-round changes',
  'tab.session': 'Session',
  'tab.workspace': 'Workspace',
  'review.title': 'Changes',
  'review.branch': 'branch',
  'review.detached': 'detached HEAD',
  'review.notRepo': 'This directory is not a git repository',
  'review.notRepoHint': 'The "Session" tab still shows every round\'s changes.',
  'review.noSessionChanges': 'No file changes recorded in this session yet',
  'review.sessionStats': '{rounds} rounds · {files} files',
  'review.round': 'Round {round}',
  'review.empty': 'No uncommitted changes 🎉',
  'review.loadError': 'Failed to load',
  'review.accept': 'Accept',
  'review.revert': 'Revert',
  'review.acceptAll': 'Accept all',
  'review.revertAll': 'Revert all',
  'review.unstage': 'Unstage',
  'review.unstageAll': 'Unstage all',
  'hunk.stage': 'Stage',
  'hunk.revert': 'Revert',
  'hunk.unstage': 'Unstage',
  'hunk.staged': 'staged',
  'hunk.unstaged': 'unstaged',
  'review.confirmRevert': 'Click again to confirm revert',
  'review.confirmRevertAll': 'Click again to confirm revert all',
  'review.commit': 'Commit',
  'review.commitPlaceholder': 'Commit message…',
  'review.push': 'Push',
  'review.confirmPush': 'Click again to confirm push',
  'review.committed': 'Committed {summary}',
  'review.commitFailed': 'Commit failed',
  'review.pushed': 'Pushed',
  'review.pushFailed': 'Push failed',
  'review.ahead': '{n} ahead',
  'review.behind': '{n} behind',
  'review.sectionStaged': 'Staged',
  'review.sectionChanges': 'Changes',
  'review.sectionBranch': 'Branch vs remote',
  'review.noUpstream': 'no upstream',
  'review.history': 'History',
  'review.commitFiles': 'Files',
  'history.local': 'local',
  'history.remote': 'remote',
  'time.now': 'just now',
  'time.minutes': '{n} min ago',
  'time.hours': '{n} h ago',
  'time.days': '{n} d ago',
  'review.refresh': 'Refresh',
  'review.close': 'Close',
  'review.busy': 'Working…',
  'review.done': '{action} {count} files',
  'review.doneOne': '{action} {path}',
  'review.doneDeleted': '{action} {count} files ({deleted} untracked deleted)',
  'review.accepted': 'Accepted',
  'review.reverted': 'Reverted',
  'review.untracked': 'untracked',
  'review.binary': 'binary',
  'review.noDiffData': 'No diff data for this change',
  'review.changes': '{added}+ {deleted}-',
  'view.single': 'Single',
  'view.split': 'Split',
  'view.before': 'Before',
  'view.after': 'After',
  'comment.add': 'Comment on this line',
  'comment.show': 'View comments',
  'comment.placeholder': 'Comment… (Ctrl/⌘+Enter to save)',
  'comment.save': 'Save',
  'comment.cancel': 'Cancel',
  'comment.delete': 'Delete',
  'comment.saved': 'Comment saved',
  'comment.failed': 'Failed to save comment',
  'scope.label': 'Scope',
  'scope.all': 'All',
  'scope.unstaged': 'Unstaged',
  'scope.staged': 'Staged',
  'scope.commit': 'Commit',
  'scope.branch': 'Branch',
  'scope.last-turn': 'Last turn',
  'review.lastTurnEmpty': 'No file changes recorded for the last turn — terminal commands (bash) that edit files are not tracked in the session log; switch to "All" to see git changes',
  'scope.base': 'Base branch',
  'scope.branchReadonly': 'Branch scope is read-only (merge-base diff; no accept/revert)',
  'review.selectCommit': 'Select a commit from the left to view its diff',
  'review.sendToAgent': 'Send to agent',
  'review.sendTitle': 'Send inline comments to the agent',
  'review.sendHint': 'Comments are injected into the current session as review guidance (Address the inline comments). Falls back to copyable text if sending fails.',
  'review.sentToAgent': 'Sent to agent',
  'review.copy': 'Copy text',
  'review.copied': 'Copied',
  'review.copyFailed': 'Copy failed',
  'review.review': 'Review',
  'review.reviewing': 'Reviewing…',
  'review.reviewFailed': 'Review failed',
  'review.verdictCorrect': 'Patch is correct ✓',
  'review.verdictIncorrect': 'Patch needs work ✗',
  'review.noFindings': 'No issues found',
  'review.findings': '{n} findings',
  'review.confidence': 'confidence {confidence}',
  'review.suggestion': 'Suggestion',
  'review.sendFindings': 'Send findings to agent',
  'review.sentFindings': 'Findings sent to agent',
  'review.reviewScope': 'Review scope',
  'pr.title': 'PR #{number}',
  'pr.comments': 'PR comments ({n})',
  'pr.noPr': 'No associated PR',
  'pr.sendComments': 'Send PR comments to agent',
  'editor.openFile': 'Open in editor',
  'editor.openLine': 'Open this line in editor',
  'editor.failed': 'Failed to open',
  'repo.label': 'Repo',
  'review.dockComments': '{n} inline comments',
  'review.dockJump': 'Open the matching change in the review panel',
  'review.dockHint': 'Auto-carried with your next message (diff + AI verdict included)',
  'settings.title': 'Changes',
  'settings.font': 'Font',
  'settings.size': 'Font size',
  'config.title': 'Configuration',
  'font.mono': 'Monospace (default)',
  'font.system': 'System font',
}

type DiffReviewActionProps = PropsRuntime<'conversation.session.header.actions'> & PropsLocale<'diff-review'>
type DiffReviewOverlayProps = PropsRuntime<'shell.overlay'> & PropsLocale<'diff-review'> & { sessions: ISessions }

/** Diff icon (lucide file-diff). */
function IconDiff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M9 10h6" />
      <path d="M12 7v6" />
      <path d="M9 17h6" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function IconComment() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

type ViewMode = 'single' | 'split'

/** 单栏 / 双栏 segmented toggle (persisted across opens). */
function DiffViewToggle({ view, onChange, t }: { view: ViewMode; onChange: (v: ViewMode) => void; t: (key: keyof typeof zh, params?: Record<string, unknown>) => string }) {
  return (
    <div className="dsdr-view-toggle" role="group" aria-label={t('view.single')}>
      <button
        type="button"
        className={`dsdr-view-btn${view === 'single' ? ' dsdr-view-btn-active' : ''}`}
        aria-pressed={view === 'single'}
        onClick={() => onChange('single')}
      >
        {t('view.single')}
      </button>
      <button
        type="button"
        className={`dsdr-view-btn${view === 'split' ? ' dsdr-view-btn-active' : ''}`}
        aria-pressed={view === 'split'}
        onClick={() => onChange('split')}
      >
        {t('view.split')}
      </button>
    </div>
  )
}

/** Two-column side-by-side diff body (old left, new right, line numbers aligned). */
function SplitDiff({ blocks, beforeLabel, afterLabel }: { blocks: SplitBlock[]; beforeLabel: string; afterLabel: string }) {
  if (blocks.length === 0) return null
  return (
    <div className="dsdr-diff-scroll">
      <div className="dsdr-split">
        <div className="dsdr-split-head">
          <div>
            <span className="dsdr-split-num" aria-hidden="true" />
            <span>{beforeLabel}</span>
          </div>
          <div>
            <span className="dsdr-split-num" aria-hidden="true" />
            <span>{afterLabel}</span>
          </div>
        </div>
        {blocks.map((block, bi) => (
          <div key={bi}>
            {block.head ? <div className="dsdr-split-hunk">{block.head}</div> : null}
            {block.rows.map((row, ri) => (
              <div key={ri} className="dsdr-split-row">
                <div className={`dsdr-split-cell ${row.leftNum === null ? 'dsdr-cell-dim' : row.kind === 'change' ? 'dsdr-cell-del' : ''}`}>
                  <span className="dsdr-split-num">{row.leftNum ?? ''}</span>
                  <span className="dsdr-split-text">{row.left}</span>
                </div>
                <div className={`dsdr-split-cell ${row.rightNum === null ? 'dsdr-cell-dim' : row.kind === 'change' ? 'dsdr-cell-add' : ''}`}>
                  <span className="dsdr-split-num">{row.rightNum ?? ''}</span>
                  <span className="dsdr-split-text">{row.right}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Per-hunk action bar (stage / unstage / revert) for workspace diffs. */
function HunkToolbar({
  hunk,
  busy,
  onAction,
  t,
}: {
  hunk: import('../shared/types.ts').DiffHunk | undefined
  busy: boolean
  onAction: (action: 'accept' | 'revert' | 'unstage', hunk: import('../shared/types.ts').DiffHunk) => void
  t: (key: keyof typeof zh, params?: Record<string, unknown>) => string
}) {
  if (!hunk) return null
  const staged = hunk.layer === 'staged'
  return (
    <div className="dsdr-hunk-bar">
      <span className="dsdr-hunk-layer">{staged ? t('hunk.staged') : t('hunk.unstaged')}</span>
      {staged ? (
        <button type="button" className="dsdr-btn" disabled={busy} onClick={() => onAction('unstage', hunk)}>
          {t('hunk.unstage')}
        </button>
      ) : (
        <button type="button" className="dsdr-btn dsdr-btn-primary" disabled={busy} onClick={() => onAction('accept', hunk)}>
          {t('hunk.stage')}
        </button>
      )}
      <button type="button" className="dsdr-btn dsdr-btn-danger" disabled={busy} onClick={() => onAction('revert', hunk)}>
        {t('hunk.revert')}
      </button>
    </div>
  )
}

/** Hunks of `diff` whose old or new line range covers any of `lines`. */
function hunksForLines(diff: string, lines: (number | null)[]): string {
  const targets = new Set(lines.filter((l): l is number => l !== null))
  if (targets.size === 0) return ''
  const blocks = parseGitBlocks(diff)
  const parts: string[] = []
  for (const block of blocks) {
    if (block.head?.kind !== 'hunk') continue
    const starts = hunkStarts(block.head.text)
    let oldLine = starts.oldStart
    let newLine = starts.newStart
    let oMin = Infinity
    let oMax = -Infinity
    let nMin = Infinity
    let nMax = -Infinity
    for (const row of block.rows) {
      if (row.kind === 'ctx') {
        if (oldLine < oMin) oMin = oldLine
        if (oldLine > oMax) oMax = oldLine
        if (newLine < nMin) nMin = newLine
        if (newLine > nMax) nMax = newLine
        oldLine++
        newLine++
      } else if (row.kind === 'add') {
        if (newLine < nMin) nMin = newLine
        if (newLine > nMax) nMax = newLine
        newLine++
      } else if (row.kind === 'del') {
        if (oldLine < oMin) oMin = oldLine
        if (oldLine > oMax) oMax = oldLine
        oldLine++
      }
    }
    const hit = [...targets].some(
      (l) => (oMin <= l && l <= oMax) || (nMin <= l && l <= nMax),
    )
    if (hit) parts.push([block.head.text, ...block.rows.map((r) => r.text)].join('\n'))
  }
  return parts.join('\n')
}

/** Unified diff rows with old/new line numbers tracked through hunks. */
function unifiedRowsWithLines(rows: DiffRow[], oldStart: number, newStart: number): { row: DiffRow; oldLine: number | null; newLine: number | null }[] {
  let oldLine = oldStart
  let newLine = newStart
  return rows.map((row) => {
    if (row.kind === 'ctx') return { row, oldLine: oldLine++, newLine: newLine++ }
    if (row.kind === 'add') return { row, oldLine: null, newLine: newLine++ }
    if (row.kind === 'del') return { row, oldLine: oldLine++, newLine: null }
    return { row, oldLine: null, newLine: null }
  })
}

/** Match a comment against a row's anchors (both must agree when set). */
function commentMatches(comment: ReviewComment, oldLine: number | null, newLine: number | null): boolean {
  if (comment.lineNew !== null && comment.lineNew !== newLine) return false
  if (comment.lineOld !== null && comment.lineOld !== oldLine) return false
  return true
}

/** Hover-to-comment affordance + comment marker for one diff line. */
function CommentLine({
  count,
  open,
  onOpen,
  onToggle,
  t,
}: {
  count: number
  open: boolean
  onOpen: () => void
  onToggle: () => void
  t: (key: keyof typeof zh, params?: Record<string, unknown>) => string
}) {
  return (
    <button
      type="button"
      className={`dsdr-comment-add${count > 0 ? ' dsdr-comment-has' : ''}`}
      title={count > 0 ? t('comment.show') : t('comment.add')}
      aria-label={count > 0 ? t('comment.show') : t('comment.add')}
      onClick={count > 0 ? onToggle : onOpen}
    >
      {count > 0 ? count : '+'}
    </button>
  )
}

/** The inline comment editor, rendered as its own row. */
function CommentEditor({
  text,
  onText,
  onSave,
  onCancel,
  busy,
  t,
}: {
  text: string
  onText: (v: string) => void
  onSave: () => void
  onCancel: () => void
  busy: boolean
  t: (key: keyof typeof zh, params?: Record<string, unknown>) => string
}) {
  return (
    <div className="dsdr-comment-editor">
      <textarea
        className="dsdr-comment-input"
        value={text}
        autoFocus
        rows={2}
        placeholder={t('comment.placeholder')}
        onChange={(event) => onText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onCancel()
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) onSave()
        }}
      />
      <div className="dsdr-comment-actions">
        <button type="button" className="dsdr-btn dsdr-btn-primary" disabled={busy || !text.trim()} onClick={onSave}>
          {t('comment.save')}
        </button>
        <button type="button" className="dsdr-btn" disabled={busy} onClick={onCancel}>
          {t('comment.cancel')}
        </button>
      </div>
    </div>
  )
}

/** One AI-review finding rendered as an inline card (Codex-style). */
function FindingCard({ finding, t }: { finding: ReviewFinding; t: (key: keyof typeof zh, params?: Record<string, unknown>) => string }) {
  return (
    <div className={`dsdr-finding-card dsdr-finding-${finding.priority}`}>
      <div className="dsdr-finding-card-head">
        <span className={`dsdr-finding-tag dsdr-finding-${finding.priority}`}>{finding.priority}</span>
        <span className="dsdr-finding-card-title">{finding.title}</span>
        <span className="dsdr-finding-card-loc">
          {finding.file}:{finding.lineStart}{finding.lineEnd !== finding.lineStart ? `-${finding.lineEnd}` : ''}
        </span>
      </div>
      {finding.detail ? <div className="dsdr-finding-card-detail">{finding.detail}</div> : null}
      <div className="dsdr-finding-card-meta">
        {t('review.confidence', { confidence: finding.confidence.toFixed(2) })}
      </div>
      {finding.suggestion ? <pre className="dsdr-finding-card-suggestion">{finding.suggestion}</pre> : null}
    </div>
  )
}

/** Unified diff with per-hunk action bars and inline comments (workspace files). */
function UnifiedDiff({
  diff,
  hunks,
  busy,
  onHunkAction,
  t,
  comments,
  commentEditor,
  commentText,
  onCommentText,
  onOpenComment,
  onSaveComment,
  onCancelComment,
  commentPopover,
  onTogglePopover,
  onDeleteComment,
  readOnly,
  path,
  reviewFindings,
  onOpenLine,
  jumpLine,
}: {
  diff: string
  hunks: import('../shared/types.ts').DiffHunk[]
  busy: boolean
  onHunkAction: (action: 'accept' | 'revert' | 'unstage', hunk: import('../shared/types.ts').DiffHunk) => void
  t: (key: keyof typeof zh, params?: Record<string, unknown>) => string
  comments?: ReviewComment[]
  commentEditor?: { oldLine: number | null; newLine: number | null } | null
  commentText?: string
  onCommentText?: (v: string) => void
  onOpenComment?: (oldLine: number | null, newLine: number | null) => void
  onSaveComment?: () => void
  onCancelComment?: () => void
  commentPopover?: string | null
  onTogglePopover?: (key: string) => void
  onDeleteComment?: (id: string) => void
  /** Hide per-hunk action bars (branch scope is a read-only diff). */
  readOnly?: boolean
  /** Repo-relative file path (for open-in-editor and markers). */
  path?: string
  /** AI-review findings to mark on matching lines. */
  reviewFindings?: ReviewFinding[]
  /** Open the file at a line in the user's editor. */
  onOpenLine?: (path: string, line: number) => void
  /** Temporary line highlight (e.g. jump from a PR comment). */
  jumpLine?: number | null
}) {
  const blocks = parseGitBlocks(diff)
  let hunkIndex = 0
  const editingKey = commentEditor ? `${commentEditor.oldLine ?? 'o'}:${commentEditor.newLine ?? 'n'}` : null
  const findingsFor = (oldLine: number | null, newLine: number | null): ReviewFinding[] => {
    if (!path || !reviewFindings || reviewFindings.length === 0) return []
    return reviewFindings.filter((f) => {
      if (f.file !== path) return false
      if (newLine !== null) return newLine >= f.lineStart && newLine <= f.lineEnd
      return oldLine !== null && oldLine >= f.lineStart && oldLine <= f.lineEnd
    })
  }
  return (
    <div className="dsdr-diff-scroll">
      <pre className="dsdr-pre">
        {blocks.map((block, bi) => {
          const isHunk = block.head?.kind === 'hunk'
          const hunk = isHunk ? hunks[hunkIndex++] : undefined
          const starts = block.head?.kind === 'hunk' ? hunkStarts(block.head.text) : { oldStart: 1, newStart: 1 }
          const rows = isHunk ? unifiedRowsWithLines(block.rows, starts.oldStart, starts.newStart) : []
          return (
            <Fragment key={bi}>
              {isHunk && !readOnly ? <HunkToolbar hunk={hunk} busy={busy} onAction={onHunkAction} t={t} /> : null}
              {block.head ? <div className={`dsdr-line dsdr-line-${block.head.kind}`}>{block.head.text || ' '}</div> : null}
              {isHunk
                ? rows.map(({ row, oldLine, newLine }, ri) => {
                    const key = `${oldLine ?? 'o'}:${newLine ?? 'n'}`
                    const rowComments = comments?.filter((c) => commentMatches(c, oldLine, newLine)) ?? []
                    const findings = findingsFor(oldLine, newLine)
                    const editing = editingKey === key
                    const showActions = row.kind === 'ctx' || row.kind === 'add' || row.kind === 'del'
                    const findingCls = findings.length > 0 ? ` dsdr-line-finding dsdr-finding-${findings[0].priority}` : ''
                    const jumped = jumpLine != null && (newLine === jumpLine || (newLine === null && oldLine === jumpLine))
                    return (
                      <Fragment key={ri}>
                        <div
                          className={`dsdr-line dsdr-line-${row.kind}${rowComments.length > 0 ? ' dsdr-line-commented' : ''}${findingCls}${jumped ? ' dsdr-line-jump' : ''}`}
                          data-dsdr-line={newLine ?? oldLine ?? undefined}
                        >
                          <span className="dsdr-line-num">
                            {newLine ?? oldLine ?? ''}
                            {showActions ? (
                              <CommentLine
                                count={rowComments.length}
                                open={commentPopover === key}
                                onOpen={() => onOpenComment?.(oldLine, newLine)}
                                onToggle={() => onTogglePopover?.(key)}
                                t={t}
                              />
                            ) : null}
                          </span>
                          <span className="dsdr-line-text">{row.text || ' '}</span>
                          {showActions ? (
                            <>
                              {findings.length > 0 ? (
                                <span className={`dsdr-finding-tag dsdr-finding-${findings[0].priority}`} title={findings[0].title}>
                                  {findings[0].priority}
                                  {findings.length > 1 ? `×${findings.length}` : ''}
                                </span>
                              ) : null}
                              {path && onOpenLine && (newLine ?? oldLine) ? (
                                <button
                                  type="button"
                                  className="dsdr-openline"
                                  title={t('editor.openLine')}
                                  aria-label={t('editor.openLine')}
                                  onClick={() => onOpenLine(path, newLine ?? oldLine ?? 1)}
                                >
                                  ↗
                                </button>
                              ) : null}
                            </>
                          ) : null}
                          {showActions && rowComments.length > 0 && commentPopover === key ? (
                            <div className="dsdr-comment-pop">
                              {rowComments.map((comment) => (
                                <div key={comment.id} className="dsdr-comment-item">
                                  <div className="dsdr-comment-text">{comment.text}</div>
                                  <div className="dsdr-comment-meta">
                                    <span>{comment.path}</span>
                                    <button type="button" className="dsdr-btn dsdr-btn-danger" disabled={busy} onClick={() => onDeleteComment?.(comment.id)}>
                                      {t('comment.delete')}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        {editing ? <CommentEditor text={commentText ?? ''} onText={onCommentText ?? (() => {})} onSave={onSaveComment ?? (() => {})} onCancel={onCancelComment ?? (() => {})} busy={busy} t={t} /> : null}
                        {(reviewFindings ?? [])
                          .filter((f) => f.file === path && f.lineStart === (newLine ?? oldLine))
                          .map((f, fi) => (
                            <FindingCard key={`${f.file}:${f.lineStart}:${fi}`} finding={f} t={t} />
                          ))}
                      </Fragment>
                    )
                  })
                : block.rows.map((row, ri) => (
                    <div key={ri} className={`dsdr-line dsdr-line-${row.kind}`}>{row.text || ' '}</div>
                  ))}
            </Fragment>
          )
        })}
      </pre>
    </div>
  )
}

/** Status chip color class for a workspace change. */
/** Drag handle for resizing the panel (east / south / south-east). */
function ResizeHandle({ mode, onResize }: { mode: 'e' | 's' | 'se'; onResize: (dx: number, dy: number) => void }) {
  const last = useRef<{ x: number; y: number } | null>(null)
  return (
    <div
      className={`dsdr-resize dsdr-resize-${mode}`}
      aria-hidden="true"
      onPointerDown={(event) => {
        last.current = { x: event.clientX, y: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!last.current) return
        const dx = event.clientX - last.current.x
        const dy = event.clientY - last.current.y
        last.current = { x: event.clientX, y: event.clientY }
        if (dx !== 0 || dy !== 0) onResize(dx, dy)
      }}
      onPointerUp={(event) => {
        last.current = null
        event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={() => {
        last.current = null
      }}
    />
  )
}

/** Status chip color class for a workspace change. */
function chipClass(status: string): string {
  const s = status.replace(/\s/g, '')
  if (s.includes('??')) return 'dsdr-chip-u'
  if (s.startsWith('A') || s.includes('A')) return 'dsdr-chip-a'
  if (s.startsWith('D') || s.includes('D')) return 'dsdr-chip-d'
  if (s.startsWith('R') || s.includes('R')) return 'dsdr-chip-r'
  return 'dsdr-chip-m'
}

async function loadStatus(cwd: string): Promise<StatusResponse> {
  const res = await fetch(`${STATUS_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`status request failed: ${res.status}`)
  return (await res.json()) as StatusResponse
}

async function applyChanges(cwd: string, action: 'accept' | 'revert' | 'unstage', path?: string): Promise<ApplyResponse> {
  const res = await fetch(APPLY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cwd, action, path }),
  })
  return (await res.json().catch(() => ({ ok: false, error: 'invalid response' }))) as ApplyResponse
}

/** Apply one hunk of one file (stage / unstage / revert). */
async function applyHunk(cwd: string, path: string, action: 'accept' | 'revert' | 'unstage', hunk: string): Promise<ApplyHunkResponse> {
  const res = await fetch(APPLY_HUNK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cwd, path, action, hunk }),
  })
  return (await res.json().catch(() => ({ ok: false, error: 'invalid response' }))) as ApplyHunkResponse
}

async function runGitAction(cwd: string, action: 'commit' | 'push', message?: string): Promise<GitResponse> {
  const url = action === 'commit' ? COMMIT_URL : PUSH_URL
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(action === 'commit' ? { cwd, message } : { cwd }),
  })
  return (await res.json().catch(() => ({ ok: false, error: 'invalid response' }))) as GitResponse
}

/** Local (unpushed) commits ahead of the upstream. */
async function loadHistory(cwd: string): Promise<HistoryResponse> {
  const res = await fetch(`${HISTORY_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: 'application/json' } })
  return (await res.json().catch(() => ({ ok: false, commits: [], error: 'invalid response' }))) as HistoryResponse
}

/** One commit's unified diff. */
async function loadCommitDiff(cwd: string, hash: string): Promise<CommitDiffResponse> {
  const res = await fetch(`${COMMIT_DIFF_URL}?cwd=${encodeURIComponent(cwd)}&hash=${encodeURIComponent(hash)}`, { headers: { accept: 'application/json' } })
  return (await res.json().catch(() => ({ ok: false, diff: '', files: [], added: 0, deleted: 0, error: 'invalid response' }))) as CommitDiffResponse
}

/** Inline review comments for the workspace (repo-scoped). */
async function loadComments(cwd: string): Promise<ReviewComment[]> {
  const res = await fetch(`${COMMENTS_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: 'application/json' } })
  const data = (await res.json().catch(() => ({ ok: false, comments: [] }))) as CommentsResponse
  return data.ok ? data.comments : []
}

/** Replace the whole comment list (single-user replace semantics). */
async function saveComments(cwd: string, comments: ReviewComment[]): Promise<boolean> {
  const res = await fetch(COMMENTS_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cwd, comments }),
  })
  const data = (await res.json().catch(() => ({ ok: false }))) as CommentsResponse
  return data.ok === true
}

/** Local branch names (for the Branch review scope). */
async function loadBranches(cwd: string): Promise<string[]> {
  const res = await fetch(`${BRANCHES_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: 'application/json' } })
  const data = (await res.json().catch(() => ({ ok: false, branches: [] }))) as { ok: boolean; branches: string[] }
  return data.ok ? data.branches : []
}

/** Run an AI review over the given scope. */
async function runReview(cwd: string, sessionId: string | null, scope: 'uncommitted' | 'branch' | 'commit', base?: string, commitHash?: string): Promise<ReviewResponse> {
  const res = await fetch(REVIEW_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cwd, sessionId: sessionId ?? undefined, scope, base, commitHash }),
  })
  return (await res.json().catch(() => ({ ok: false, findings: [], error: 'invalid response' }))) as ReviewResponse
}

/** Current branch's GitHub PR context (degrades gracefully without gh). */
async function loadPr(cwd: string): Promise<PrResponse> {
  const res = await fetch(`${PR_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: 'application/json' } })
  return (await res.json().catch(() => ({ ok: false, comments: [], error: 'invalid response' }))) as PrResponse
}

/** Git repos under a workspace (multi-repo selector). */
async function loadRepos(cwd: string): Promise<ReposResponse> {
  const res = await fetch(`${REPOS_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: 'application/json' } })
  return (await res.json().catch(() => ({ ok: false, repos: [], error: 'invalid response' }))) as ReposResponse
}

/** Open a file (optionally at a line) in the user's editor via open-editor. */
async function openInEditor(cwd: string, path: string, line?: number): Promise<{ ok: boolean; error?: string }> {
  const abs = path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path) ? path : `${cwd}/${path}`
  const res = await fetch(OPEN_EDITOR_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path: abs, line }),
  })
  return (await res.json().catch(() => ({ ok: false, error: 'invalid response' }))) as { ok: boolean; error?: string }
}

/** Short relative time for commit rows ("just now" / "3 min ago" / …). */
function relativeTime(iso: string, t: (key: keyof typeof zh, params?: Record<string, unknown>) => string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return t('time.now')
  if (minutes < 60) return t('time.minutes', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return t('time.hours', { n: hours })
  return t('time.days', { n: Math.floor(hours / 24) })
}

/** Theme-aware dropdown replacing native <select> (native popups ignore the theme). */
function ThemeSelect({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  ariaLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnKey)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnKey)
    }
  }, [open])

  return (
    <div className="dsdr-sel" ref={rootRef}>
      <button
        type="button"
        className="dsdr-sel-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dsdr-sel-value">{current?.label ?? value}</span>
        <IconChevronDown />
      </button>
      {open ? (
        <ul className="dsdr-sel-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <li key={option.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={`dsdr-sel-option${option.value === value ? ' dsdr-sel-option-active' : ''}`}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <span className="dsdr-sel-option-mark">{option.value === value ? <IconCheck /> : null}</span>
                <span className="dsdr-sel-option-label">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Diff font + font size controls (shared prefs store). */
function DiffReviewPrefs({ t }: { t: (key: keyof typeof zh, params?: Record<string, unknown>) => string }) {
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.getSnapshot)
  return (
    <>
      <div className="dsdr-cfg-field">
        <span className="dsdr-cfg-label" id="dsdr-pref-font-label">{t('settings.font')}</span>
        <ThemeSelect
          ariaLabel={t('settings.font')}
          value={prefs.font}
          options={FONT_OPTIONS.map((f) => ({ value: f.id, label: f.label.startsWith('font.') ? t(f.label as keyof typeof zh) : f.label }))}
          onChange={(font) =>
            prefsStore.update((d) => {
              d.font = font
            })
          }
        />
      </div>
      <div className="dsdr-cfg-field">
        <span className="dsdr-cfg-label" id="dsdr-pref-size-label">{t('settings.size')}</span>
        <ThemeSelect
          ariaLabel={t('settings.size')}
          value={String(prefs.size)}
          options={SIZE_OPTIONS.map((s) => ({ value: String(s), label: `${s}px` }))}
          onChange={(size) =>
            prefsStore.update((d) => {
              d.size = Number(size)
            })
          }
        />
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Header action (session scope): badge + open.
// ---------------------------------------------------------------------------

function DiffReviewAction({ sessionId, useSessions, useSession, t }: DiffReviewActionProps) {
  const cwd = useSessions((s: SessionListState) => s.byId[sessionId]?.cwd)
  const nodes = useSession((s) => s.nodes)
  const changeCount = useMemo(() => countSessionChanges(nodes), [nodes])
  const [open, setOpen] = useState(false)

  const openOverlay = () => {
    if (!cwd) return
    overlayStore.update((d) => {
      d.open = true
      d.cwd = cwd
      d.key = d.key + 1
    })
  }

  useEffect(() => {
    const unsub = overlayStore.subscribe(() => {
      setOpen(overlayStore.getSnapshot().open)
    })
    return unsub
  }, [])

  if (!cwd) return null

  return (
    <button type="button" className="dsdr-trigger" aria-label={t('action.aria')} onClick={openOverlay}>
      <IconDiff />
      <span className="dsdr-label">{t('action.label')}</span>
      {changeCount > 0 ? <span className="dsdr-count">{changeCount}</span> : null}
      {open ? <span className="dsdr-count" aria-hidden="true">✓</span> : null}
    </button>
  )
}

// ---------------------------------------------------------------------------
// File tree: build a directory tree from flat paths and render it with
// collapsible folders (the left side of the review surface).
// ---------------------------------------------------------------------------

type TreeDir<T> = { kind: 'dir'; name: string; path: string; children: TreeNode<T>[] }
type TreeLeaf<T> = { kind: 'leaf'; name: string; path: string; item: T }
type TreeNode<T> = TreeDir<T> | TreeLeaf<T>

/** Turn a flat item list into a sorted directory tree (directories first). */
function buildFileTree<T>(items: readonly T[], pathOf: (item: T) => string): TreeNode<T>[] {
  const root: TreeNode<T>[] = []
  const dirIndex = new Map<string, TreeDir<T>>()
  for (const item of items) {
    const path = pathOf(item)
    const parts = path.split('/').filter(Boolean)
    if (parts.length === 0) continue
    let siblings = root
    let prefix = ''
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i]
      let dir = dirIndex.get(prefix)
      if (!dir) {
        dir = { kind: 'dir', name: parts[i], path: prefix, children: [] }
        dirIndex.set(prefix, dir)
        siblings.push(dir)
      }
      siblings = dir.children
    }
    siblings.push({ kind: 'leaf', name: parts[parts.length - 1], path, item })
  }
  const sortNodes = (nodes: TreeNode<T>[]): void => {
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    for (const node of nodes) if (node.kind === 'dir') sortNodes(node.children)
  }
  sortNodes(root)
  return root
}

/** Recursive tree renderer: collapsible directories + leaf rows. */
function FileTreeView<T>(props: {
  nodes: TreeNode<T>[]
  collapsed: ReadonlySet<string>
  onToggleDir: (path: string) => void
  depth: number
  renderLeaf: (leaf: TreeLeaf<T>) => ReactNode
}): ReactElement {
  const { nodes, collapsed, onToggleDir, depth, renderLeaf } = props
  return (
    <>
      {nodes.map((node) =>
        node.kind === 'dir' ? (
          <div key={node.path}>
            <button
              type="button"
              className={`dsdr-dir${collapsed.has(node.path) ? '' : ' dsdr-dir-open'}`}
              style={{ paddingLeft: depth * 14 + 8 }}
              aria-expanded={!collapsed.has(node.path)}
              onClick={() => onToggleDir(node.path)}
            >
              <span className="dsdr-dir-caret" aria-hidden="true">{collapsed.has(node.path) ? '▸' : '▾'}</span>
              <span className="dsdr-dir-name" title={node.path}>{node.name}</span>
              <span className="dsdr-dir-count">{node.children.length}</span>
            </button>
            {!collapsed.has(node.path) ? (
              <FileTreeView nodes={node.children} collapsed={collapsed} onToggleDir={onToggleDir} depth={depth + 1} renderLeaf={renderLeaf} />
            ) : null}
          </div>
        ) : (
          <div key={node.path} style={{ paddingLeft: depth * 14 }}>{renderLeaf(node)}</div>
        ),
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Composer dock (session scope): pending inline comments float above the
// input box, Codex-style — hover the pill to preview, click send to inject.
// ---------------------------------------------------------------------------

type DiffReviewComposerDockProps = PropsRuntime<'conversation.input.dock'> & PropsLocale<'diff-review'> & { sessions: ISessions }

function DiffReviewComposerDock({ sessionId, useSessions, sessions, input, t }: DiffReviewComposerDockProps) {
  const cwd = useSessions((s: SessionListState) => s.byId[sessionId]?.cwd)
  const pending = useSyncExternalStore(pendingCommentsStore.subscribe, pendingCommentsStore.getSnapshot)
  const [hover, setHover] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const carriedIds = useRef<string | null>(null)
  const carrying = useRef(false)

  // Seed the store from server storage when nothing has been synced for this
  // workspace yet (panel never opened this session — comments persist in .git).
  useEffect(() => {
    if (!cwd || pending.cwd === cwd) return
    let cancelled = false
    void loadComments(cwd).then((list) => {
      if (cancelled) return
      pendingCommentsStore.update((d) => {
        if (d.cwd === cwd) return
        d.cwd = cwd
        d.comments = list
      })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cwd, pending.cwd])

  const comments = pending.cwd === cwd ? pending.comments : []
  const ids = comments.map((c) => c.id).join(',')
  useEffect(() => {
    if (comments.length === 0) {
      setDismissed(false)
      carriedIds.current = null
    }
  }, [comments.length])

  /** Compose the full review package: comments + their diff hunks + AI verdict. */
  const composeCarriedMessage = (): string => {
    const lines: string[] = ['请处理以下针对当前工作区的行内评审评论（Address the inline comments，保持改动范围最小）：', '']
    const byPath = new Map<string, ReviewComment[]>()
    for (const c of comments) {
      const list = byPath.get(c.path)
      if (list) list.push(c)
      else byPath.set(c.path, [c])
    }
    for (const [path, list] of byPath) {
      lines.push(`## ${path}`)
      for (const c of list) {
        const anchor = c.lineNew !== null ? `:${c.lineNew}` : ` (old line ${c.lineOld})`
        lines.push(`- ${path}${anchor}: ${c.text}`)
      }
      const hunks = hunksForLines(pending.diffs[path] ?? '', list.map((c) => c.lineNew ?? c.lineOld))
      if (hunks) {
        lines.push('```diff')
        lines.push(hunks)
        lines.push('```')
      }
      lines.push('')
    }
    if (pending.review?.ok && (pending.review.findings.length > 0 || pending.review.verdict)) {
      lines.push('## AI 评审结论')
      lines.push(pending.review.verdict === 'incorrect' ? '补丁存在问题（Patch is incorrect）' : '补丁正确（Patch is correct）')
      for (const f of pending.review.findings) {
        lines.push(`- [${f.priority}] ${f.file}:${f.lineStart}${f.lineEnd !== f.lineStart ? `-${f.lineEnd}` : ''} ${f.title} — ${f.detail}`)
        if (f.suggestion) lines.push(`  \`\`\`\n${f.suggestion}\n  \`\`\``)
      }
    }
    return lines.join('\n').slice(0, 16000)
  }

  // Codex-style auto-carry: when the user submits a message while comments are
  // pending, queue the full review package right behind it (no send button).
  const phase = input?.phase
  useEffect(() => {
    if (comments.length === 0 || carrying.current || carriedIds.current === ids) return
    if (phase !== 'submitting' && phase !== 'adjudicating') return
    carrying.current = true
    const targetIds = ids
    void injectToSession(sessions, sessionId, composeCarriedMessage()).then((outcome) => {
      if (outcome !== 'failed') carriedIds.current = targetIds
      carrying.current = false
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, ids])

  if (!cwd || comments.length === 0 || dismissed) return null

  /** Open the review panel at the comment's change block. */
  const focusComment = (comment: ReviewComment) => {
    overlayStore.update((d) => {
      d.open = true
      d.cwd = cwd
      d.focus = { path: comment.path, line: comment.lineNew ?? comment.lineOld ?? undefined }
      d.key = d.key + 1
    })
  }

  return (
    <div className="dsdr-dock" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="dsdr-dock-head">
        <span className="dsdr-dock-icon"><IconComment /></span>
        <span className="dsdr-dock-count" title={t('review.dockHint')}>{t('review.dockComments', { n: comments.length })}</span>
        <span className="dsdr-spacer" />
        <button type="button" className="dsdr-dock-close" aria-label={t('comment.cancel')} onClick={() => setDismissed(true)}>
          <IconX />
        </button>
      </div>
      {hover ? (
        <div className="dsdr-dock-list">
          {comments.map((comment) => (
            <button
              key={comment.id}
              type="button"
              className="dsdr-dock-item"
              title={t('review.dockJump')}
              onClick={() => focusComment(comment)}
            >
              <span className="dsdr-dock-loc">{comment.path}{comment.lineNew !== null ? `:${comment.lineNew}` : ''}</span>
              <span className="dsdr-dock-text">{comment.text}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Review overlay (root scope): session + workspace tabs.
// ---------------------------------------------------------------------------

function DiffReviewOverlay({ sessions, t }: DiffReviewOverlayProps) {
  const storeState = useSyncExternalStore(overlayStore.subscribe, overlayStore.getSnapshot)
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.getSnapshot)
  // Git-first: land on the workspace tab (staged/unstaged/branch trees) so the
  // change review is one click away; the session tab stays a click away.
  const [tab, setTab] = useState<'session' | 'workspace'>('workspace')
  const [view, setView] = useState<ViewMode>(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem('dsdr-view') === 'split' ? 'split' : 'single'
    } catch {
      return 'single'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('dsdr-view', view)
    } catch {
      // private mode / unavailable — non-fatal
    }
  }, [view])

  // Workspace tab state.
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [confirm, setConfirm] = useState<'file' | 'all' | 'push' | null>(null)
  const [commitMessage, setCommitMessage] = useState('')
  // Local (unpushed) commit history: list + per-commit diff view.
  const [history, setHistory] = useState<CommitInfo[]>([])
  const [selectedCommit, setSelectedCommit] = useState<CommitInfo | null>(null)
  const [commitDiff, setCommitDiff] = useState<CommitDiffResponse | null>(null)
  const [commitDiffLoading, setCommitDiffLoading] = useState(false)
  const [selectedCommitFile, setSelectedCommitFile] = useState<string | null>(null)
  // Inline review comments (workspace tab, single view).
  const [comments, setComments] = useState<ReviewComment[]>([])
  const [commentEditor, setCommentEditor] = useState<{ oldLine: number | null; newLine: number | null } | null>(null)
  const [commentText, setCommentText] = useState('')
  const [commentPopover, setCommentPopover] = useState<string | null>(null)
  // Review scope: which slice of the repository the workspace tab shows.
  const [scope, setScope] = useState<WorkspaceScope>('all')
  const [branches, setBranches] = useState<string[]>([])
  const [baseBranch, setBaseBranch] = useState<string | null>(null)
  const [baseStatus, setBaseStatus] = useState<StatusResponse | null>(null)
  // Feedback loop: send inline comments to the agent (session.prompt, copy fallback).
  const [sendOpen, setSendOpen] = useState(false)
  const [sendText, setSendText] = useState('')
  // AI review (/review): findings + verdict.
  const [review, setReview] = useState<ReviewResponse | null>(null)
  const [reviewing, setReviewing] = useState(false)
  // GitHub PR context (gh CLI).
  const [pr, setPr] = useState<PrResponse | null>(null)
  // Multi-repo: repos detected under the workspace + the selected one.
  const [repos, setRepos] = useState<{ path: string; branch: string | null }[]>([])
  const [repoPath, setRepoPath] = useState<string | null>(null)
  // Temporary line highlight (jump target from a PR comment or a finding).
  const [jumpLine, setJumpLine] = useState<number | null>(null)

  /** Select a file and flash its line (findings / PR comments). */
  const jumpTo = (file: string, line?: number) => {
    setSelected(file)
    setSelectedCommit(null)
    setSelectedCommitFile(null)
    setCommitDiff(null)
    setJumpLine(line ?? null)
    setTimeout(() => setJumpLine(null), 2500)
  }
  // Collapsed directories in the left-hand file tree (shared across tabs).
  const [collapsedDirs, setCollapsedDirs] = useState<ReadonlySet<string>>(() => new Set())
  const toggleDir = useMemo(
    () => (path: string) => {
      setCollapsedDirs((prev) => {
        const next = new Set(prev)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
      })
    },
    [],
  )
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Current session's conversation snapshot (reactive), for the session tab.
  const currentId = useSyncExternalStore(
    useMemo(() => (notify: () => void) => sessions.list.subscribe(notify), [sessions]),
    useMemo(() => () => sessions.list.getSnapshot().current, [sessions]),
  )
  const snapshot = useSyncExternalStore(
    useMemo(() => {
      return (notify: () => void) => {
        const binding = currentId ? sessions.binding(currentId) : undefined
        if (!binding) return () => {}
        return binding.session.subscribe(notify)
      }
    }, [sessions, currentId]),
    useMemo(() => {
      return () => {
        const binding = currentId ? sessions.binding(currentId) : undefined
        return binding ? binding.session.getSnapshot() : null
      }
    }, [sessions, currentId]),
  )

  const rounds = useMemo(() => (snapshot ? collectSessionRounds(snapshot.nodes) : []), [snapshot])
  // Left-hand file trees: per-round trees for the session tab, one tree for
  // the git working tree on the workspace tab.
  const sessionTrees = useMemo(() => new Map(rounds.map((r) => [r.round, buildFileTree(r.changes, (c) => c.path)])), [rounds])
  const totalSessionFiles = useMemo(() => rounds.reduce((n, r) => n + r.changes.length, 0), [rounds])
  const [selectedRound, setSelectedRound] = useState<number | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const selectedChange = useMemo(() => {
    const round = rounds.find((r) => r.round === selectedRound)
    return round?.changes.find((c) => c.path === selectedPath) ?? null
  }, [rounds, selectedRound, selectedPath])

  const cwd = storeState.cwd
  /** Active git repo for workspace operations (multi-repo selector override). */
  const activeCwd = repoPath ?? cwd

  const loadWorkspace = async (silent = false) => {
    if (!activeCwd) return
    if (!silent) setLoading(true)
    setError(null)
    try {
      const [next, hist, nextComments, branchList, prData, repoList] = await Promise.all([
        loadStatus(activeCwd),
        loadHistory(activeCwd),
        loadComments(activeCwd),
        loadBranches(activeCwd),
        loadPr(activeCwd),
        loadRepos(activeCwd),
      ])
      setStatus(next)
      if (hist.ok) setHistory(hist.commits)
      setComments(nextComments)
      setBranches(branchList)
      setPr(prData)
      setRepos(repoList.repos)
      // Default the repo selector to the workspace root when it is itself a repo.
      if (repoPath === null && !repoList.repos.some((r) => r.path === activeCwd)) {
        const first = repoList.repos[0]
        if (first && first.path !== cwd) setRepoPath(first.path)
      }
      if (next.error && !next.isRepo) setError(next.error)
      setSelected((prev) => (prev && next.files.some((f) => f.path === prev) ? prev : next.files[0]?.path ?? null))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh the workspace data: reload whenever the tab becomes active or
  // the workspace changes, and periodically while the overlay is open. A
  // workspace switch clears stale commit selection and history first.
  const workspaceCwdRef = useRef<string | null>(null)
  useEffect(() => {
    const previous = workspaceCwdRef.current
    workspaceCwdRef.current = activeCwd ?? null
    if (tab !== 'workspace' || !activeCwd) return
    if (previous !== activeCwd) {
      setSelectedCommit(null)
      setCommitDiff(null)
      setSelectedCommitFile(null)
      setHistory([])
      setComments([])
      setCommentEditor(null)
      setCommentPopover(null)
      setReview(null)
      setPr(null)
    }
    void loadWorkspace()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, activeCwd])

  // Surface workspace comments above the composer (Codex-style dock), along
  // with the diff context and the last AI review result.
  useEffect(() => {
    pendingCommentsStore.update((d) => {
      d.cwd = activeCwd ?? null
      d.comments = comments
      const diffs: Record<string, string> = {}
      for (const c of comments) {
        const file = status?.files.find((f) => f.path === c.path)
        if (file?.diff) diffs[c.path] = file.diff
      }
      d.diffs = diffs
      d.review = review
    })
  }, [comments, activeCwd, status, review])

  // Jump to a change block from the composer dock (comment click).
  useEffect(() => {
    const focus = storeState.focus
    if (!storeState.open || !cwd || !focus) return
    setTab('workspace')
    setSelected(focus.path)
    setJumpLine(focus.line ?? null)
    const scrollTimer = setTimeout(() => {
      if (focus.line != null) {
        document.querySelector(`[data-dsdr-line="${focus.line}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }, 80)
    const clearTimer = setTimeout(() => setJumpLine(null), 2500)
    return () => {
      clearTimeout(scrollTimer)
      clearTimeout(clearTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeState.key])

  // Keep staged/unstaged/history fresh while the workspace tab is open.
  useEffect(() => {
    if (!storeState.open || tab !== 'workspace' || !activeCwd) return
    const timer = setInterval(() => {
      void loadWorkspace(true)
    }, 15000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeState.open, tab, activeCwd])

  // Branch scope: diff the worktree against the selected base branch.
  // Default the base to the first branch that isn't the current one.
  useEffect(() => {
    if (scope !== 'branch' || !activeCwd) return
    const current = status?.branch ?? null
    if (baseBranch === null && branches.length > 0) {
      const fallback = branches.find((b) => b !== current) ?? branches[0]
      setBaseBranch(fallback)
    }
  }, [scope, activeCwd, branches, baseBranch, status?.branch])

  useEffect(() => {
    if (scope !== 'branch' || !activeCwd || !baseBranch) {
      setBaseStatus(null)
      return
    }
    let cancelled = false
    void (async () => {
      const res = await fetch(`${STATUS_URL}?cwd=${encodeURIComponent(activeCwd)}&base=${encodeURIComponent(baseBranch)}`, { headers: { accept: 'application/json' } })
      const data = (await res.json().catch(() => null)) as StatusResponse | null
      if (!cancelled && data) {
        setBaseStatus(data)
        if (data.error && baseStatus?.error !== data.error) setError(data.error)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, activeCwd, baseBranch])

  // Default selection for the session tab follows the first round with changes.
  useEffect(() => {
    if (selectedRound === null && rounds.length > 0) {
      setSelectedRound(rounds[0].round)
      setSelectedPath(rounds[0].changes[0]?.path ?? null)
    }
  }, [rounds, selectedRound])

  useEffect(() => {
    if (!storeState.open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        overlayStore.update((d) => {
          d.open = false
        })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [storeState.open])

  useEffect(() => {
    if (!notice) return
    noticeTimer.current = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(noticeTimer.current)
  }, [notice])

  const files = status?.isRepo ? status.files : []
  const stagedFiles = useMemo(() => files.filter((f) => f.staged), [files])
  const unstagedFiles = useMemo(() => files.filter((f) => !f.staged), [files])

  // "Last turn" scope: paths the agent touched in the most recent round.
  const lastRoundPaths = useMemo(() => {
    const set = new Set<string>()
    const last = rounds[rounds.length - 1]
    if (!last || !cwd) return set
    for (const change of last.changes) {
      set.add(change.path)
      const p = change.path
      if (isAbsPath(p)) {
        const rel = p.startsWith(cwd) ? p.slice(cwd.length).replace(/^[\\/]+/, '') : p
        set.add(rel)
        set.add(baseName(p))
      } else {
        set.add(baseName(p))
      }
    }
    return set
  }, [rounds, cwd])

  /** The file slice the current scope shows. */
  const scopeFiles = useMemo(() => {
    switch (scope) {
      case 'unstaged':
        return unstagedFiles
      case 'staged':
        return stagedFiles
      case 'branch':
        return baseStatus?.files ?? []
      case 'last-turn':
        if (lastRoundPaths.size === 0) return []
        return files.filter((f) => {
          if (lastRoundPaths.has(f.path) || lastRoundPaths.has(baseName(f.path))) return true
          // Session paths may be workspace-root relative or absolute (the repo can
          // be a subdirectory of the workspace) — match any suffix form.
          const suffix = `/${f.path}`
          for (const p of lastRoundPaths) {
            if (p.endsWith(suffix)) return true
          }
          return false
        })
      default:
        return files
    }
  }, [scope, unstagedFiles, stagedFiles, baseStatus, files, lastRoundPaths])

  /** Scopes where file/hunk accept·revert·unstage and commit/push make sense. */
  const allowActions = scope !== 'branch' && scope !== 'commit'

  /** Files the current scope can hand to the AI review. */
  const reviewableFiles = scope === 'branch' ? baseStatus?.files?.length ?? 0 : files.length
  const stagedCount = stagedFiles.length
  // NOTE: hooks must all run before the early return below (React hook order).
  const stagedTree = useMemo(() => buildFileTree(stagedFiles, (f) => f.path), [stagedFiles])
  const unstagedTree = useMemo(() => buildFileTree(unstagedFiles, (f) => f.path), [unstagedFiles])
  const scopeTree = useMemo(() => buildFileTree(scopeFiles, (f) => f.path), [scopeFiles])
  const commitFilesTree = useMemo(
    () => (commitDiff?.ok ? buildFileTree(commitDiff.files, (f) => f.path) : []),
    [commitDiff],
  )

  if (!storeState.open || !cwd) return null

  const selectedFile = scopeFiles.find((f) => f.path === selected) ?? null
  const totalAdded = files.reduce((n, f) => n + f.added, 0)
  const totalDeleted = files.reduce((n, f) => n + f.deleted, 0)

  // Commit-detail view: the selected file within the selected commit.
  const commitSegments = commitDiff?.ok ? splitCommitDiff(commitDiff.diff) : []
  const commitActiveFile = selectedCommit && commitDiff?.ok ? commitDiff.files.find((f) => f.path === selectedCommitFile) ?? null : null
  const commitActiveText = commitActiveFile
    ? commitSegments.find((s) => s.path === commitActiveFile.path)?.text ?? commitDiff?.diff ?? ''
    : commitDiff?.diff ?? ''

  /** Leaf row shared by the staged/unstaged file trees. */
  const workspaceLeaf = ({ item: file, name }: { item: DiffFile; name: string }) => (
    <button
      type="button"
      role="option"
      aria-selected={file.path === selected}
      className={`dsdr-file${file.path === selected ? ' dsdr-file-selected' : ''}`}
      onClick={() => {
        setSelected(file.path)
        setSelectedCommit(null)
        setSelectedCommitFile(null)
        setCommitDiff(null)
        setConfirm(null)
        setCommentEditor(null)
        setCommentPopover(null)
      }}
    >
      <span className={`dsdr-chip ${chipClass(file.status)}`}>{file.untracked ? '??' : file.status}</span>
      <span className="dsdr-file-name" title={file.path}>{name}</span>
      <span className="dsdr-file-stat">
        {file.binary ? t('review.binary') : t('review.changes', { added: file.added, deleted: file.deleted })}
      </span>
    </button>
  )

  const runApply = async (action: 'accept' | 'revert' | 'unstage', path?: string) => {
    setBusy(true)
    setNotice(null)
    setConfirm(null)
    try {
      const result = await applyChanges(activeCwd ?? cwd ?? '', action, path)
      if (result.ok) {
        const verb = action === 'accept' ? t('review.accepted') : action === 'unstage' ? t('review.unstaged') : t('review.reverted')
        setNotice({
          kind: 'ok',
          text: path
            ? t('review.doneOne', { action: verb, path })
            : result.deleted && result.deleted.length > 0
              ? t('review.doneDeleted', { action: verb, count: files.length, deleted: result.deleted.length })
              : t('review.done', { action: verb, count: files.length }),
        })
        await loadWorkspace(true)
      } else {
        setNotice({ kind: 'error', text: result.error || t('review.loadError') })
      }
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : t('review.loadError') })
    } finally {
      setBusy(false)
    }
  }

  const onFileAction = (action: 'accept' | 'revert' | 'unstage', path: string) => {
    if (action === 'revert' && confirm !== 'file') {
      setConfirm('file')
      setTimeout(() => setConfirm((c) => (c === 'file' ? null : c)), 2500)
      return
    }
    void runApply(action, path)
  }

  const onAllAction = (action: 'accept' | 'revert') => {
    if (action === 'revert' && confirm !== 'all') {
      setConfirm('all')
      setTimeout(() => setConfirm((c) => (c === 'all' ? null : c)), 2500)
      return
    }
    void runApply(action)
  }

  /** Apply one hunk (stage / unstage / revert) of the selected file. */
  const onHunkAction = async (action: 'accept' | 'revert' | 'unstage', hunk: DiffHunk) => {
    if (!selectedFile || busy) return
    setBusy(true)
    setNotice(null)
    try {
      const result = await applyHunk(activeCwd ?? cwd ?? '', selectedFile.path, action, hunk.text)
      if (result.ok) {
        const verb = action === 'accept' ? t('review.accepted') : action === 'unstage' ? t('review.unstaged') : t('review.reverted')
        setNotice({ kind: 'ok', text: t('review.doneOne', { action: verb, path: selectedFile.path }) })
        await loadWorkspace(true)
      } else {
        setNotice({ kind: 'error', text: result.error || t('review.loadError') })
      }
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : t('review.loadError') })
    } finally {
      setBusy(false)
    }
  }

  // ---- inline comments ----
  const openComment = (oldLine: number | null, newLine: number | null) => {
    if (busy) return
    setCommentEditor({ oldLine, newLine })
    setCommentText('')
    setCommentPopover(null)
  }

  const saveComment = async () => {
    const commentPath = tab === 'workspace' ? selectedFile?.path : selectedChange?.path
    if (!commentPath || !commentEditor || busy) return
    const text = commentText.trim()
    if (!text) return
    const comment: ReviewComment = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      path: commentPath,
      lineNew: commentEditor.newLine,
      lineOld: commentEditor.oldLine,
      text,
      createdAt: new Date().toISOString(),
    }
    setBusy(true)
    try {
      const next = [...comments, comment]
      if (activeCwd && (await saveComments(activeCwd, next))) {
        setComments(next)
        setCommentEditor(null)
        setCommentText('')
        setNotice({ kind: 'ok', text: t('comment.saved') })
      } else {
        setNotice({ kind: 'error', text: t('comment.failed') })
      }
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : t('comment.failed') })
    } finally {
      setBusy(false)
    }
  }

  const cancelComment = () => {
    setCommentEditor(null)
    setCommentText('')
  }

  const deleteComment = async (id: string) => {
    if (busy) return
    const next = comments.filter((c) => c.id !== id)
    setBusy(true)
    try {
      if (activeCwd && (await saveComments(activeCwd, next))) {
        setComments(next)
      } else {
        setNotice({ kind: 'error', text: t('comment.failed') })
      }
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : t('comment.failed') })
    } finally {
      setBusy(false)
    }
  }

  // ---- AI review (/review): run, re-run, and hand findings to the agent ----
  const onReview = async () => {
    if (!activeCwd || reviewing || busy) return
    setReviewing(true)
    setReview(null)
    setNotice(null)
    try {
      const reviewScope = scope === 'branch' ? 'branch' : scope === 'commit' && selectedCommit ? 'commit' : 'uncommitted'
      const result = await runReview(activeCwd, currentId ?? null, reviewScope, baseBranch ?? undefined, selectedCommit?.hash ?? undefined)
      if (result.ok) {
        setReview(result)
      } else {
        setNotice({ kind: 'error', text: result.error || t('review.reviewFailed') })
      }
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : t('review.reviewFailed') })
    } finally {
      setReviewing(false)
    }
  }

  /** Compose a "send to agent" message from findings or PR comments. */
  const composeFindingsMessage = (): string => {
    const byPath = new Map<string, ReviewFinding[]>()
    for (const f of review?.findings ?? []) {
      const list = byPath.get(f.file)
      if (list) list.push(f)
      else byPath.set(f.file, [f])
    }
    const lines: string[] = ['请处理以下 AI 评审发现（Address the review findings，保持改动范围最小）：', '']
    for (const [path, list] of byPath) {
      lines.push(`## ${path}`)
      for (const f of list) {
        const range = f.lineStart === f.lineEnd ? `:${f.lineStart}` : `:${f.lineStart}-${f.lineEnd}`
        lines.push(`- [${f.priority}] ${path}${range}: ${f.title} — ${f.detail}`)
        if (f.suggestion) lines.push(`  \`\`\`\n${f.suggestion}\n  \`\`\``)
      }
      lines.push('')
    }
    return lines.join('\n')
  }

  const composePrMessage = (): string => {
    if (!pr?.pr || pr.comments.length === 0) return ''
    const lines: string[] = [`请处理 PR #${pr.pr.number}（${pr.pr.title}）的评论（Address the PR comments，保持改动范围最小）：`, '']
    for (const c of pr.comments) {
      const anchor = c.path ? `${c.path}${c.line ? `:${c.line}` : ''}` : 'general'
      lines.push(`- ${anchor} (${c.author}): ${c.body}`)
    }
    return lines.join('\n')
  }

  const openSendPanelWith = (text: string) => {
    setSendText(text)
    setSendOpen(true)
  }

  // ---- editor integration (via dsh-plugin-open-editor) ----
  const openFile = async (path: string, line?: number) => {
    if (!activeCwd || busy) return
    const result = await openInEditor(activeCwd, path, line)
    if (!result.ok) setNotice({ kind: 'error', text: `${t('editor.failed')}: ${result.error ?? ''}` })
  }

  /** Jump from a PR comment to the file (and highlight the line). */
  const onPrCommentClick = (path: string | null | undefined, line: number | null | undefined) => {
    if (path) jumpTo(path, line ?? undefined)
    else setJumpLine(null)
  }

  // ---- feedback loop: comments → agent (prompt injection, copy fallback) ----
  const composeReviewMessage = (): string => {
    if (comments.length === 0) return ''
    const byPath = new Map<string, ReviewComment[]>()
    for (const c of comments) {
      const list = byPath.get(c.path)
      if (list) list.push(c)
      else byPath.set(c.path, [c])
    }
    const lines: string[] = [
      '请处理以下针对当前工作区的行内评审评论（Address the inline comments，保持改动范围最小）：',
      '',
    ]
    for (const [path, list] of byPath) {
      lines.push(`## ${path}`)
      for (const c of list) {
        const anchor = c.lineNew !== null ? `:${c.lineNew}` : ` (old line ${c.lineOld})`
        lines.push(`- ${path}${anchor}: ${c.text}`)
      }
      lines.push('')
    }
    return lines.join('\n')
  }

  const openSendPanel = () => {
    setSendText(composeReviewMessage())
    setSendOpen(true)
  }

  const sendToAgent = async () => {
    const text = sendText.trim()
    if (!text || busy) return
    setBusy(true)
    try {
      const outcome = await injectToSession(sessions, currentId ?? null, text)
      setSendOpen(false)
      if (outcome === 'sent') setNotice({ kind: 'ok', text: t('review.sentToAgent') })
      else if (outcome === 'copied') setNotice({ kind: 'ok', text: t('review.copied') })
      else setNotice({ kind: 'error', text: t('review.copyFailed') })
    } finally {
      setBusy(false)
    }
  }

  /** Commit the staged changes with the entered message. */
  const onCommit = async () => {
    const message = commitMessage.trim()
    if (!message || busy || !activeCwd) return
    setBusy(true)
    setNotice(null)
    setConfirm(null)
    try {
      const result = await runGitAction(activeCwd, 'commit', message)
      if (result.ok) {
        setCommitMessage('')
        const summary = result.hash ? `${result.hash} ${result.subject ?? ''}`.trim() : (result.subject ?? '')
        setNotice({ kind: 'ok', text: t('review.committed', { summary }) })
        await loadWorkspace(true)
      } else {
        setNotice({ kind: 'error', text: result.error || t('review.commitFailed') })
      }
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : t('review.commitFailed') })
    } finally {
      setBusy(false)
    }
  }

  /** Push the current branch (double-click to confirm). */
  const onPush = () => {
    if (busy || !activeCwd) return
    if (confirm !== 'push') {
      setConfirm('push')
      setTimeout(() => setConfirm((c) => (c === 'push' ? null : c)), 2500)
      return
    }
    void (async () => {
      setConfirm(null)
      setBusy(true)
      setNotice(null)
      try {
        const result = await runGitAction(activeCwd, 'push')
        if (result.ok) {
          setNotice({ kind: 'ok', text: t('review.pushed') })
        } else {
          setNotice({ kind: 'error', text: result.error || t('review.pushFailed') })
        }
        await loadWorkspace(true)
      } catch (e) {
        setNotice({ kind: 'error', text: e instanceof Error ? e.message : t('review.pushFailed') })
      } finally {
        setBusy(false)
      }
    })()
  }

  /** Select a local commit and load its diff into the right pane. */
  const selectCommit = (commit: CommitInfo) => {
    if (!activeCwd) return
    setSelected(null)
    setSelectedCommit(commit)
    setSelectedCommitFile(null)
    setConfirm(null)
    setCommitDiff(null)
    setCommitDiffLoading(true)
    void loadCommitDiff(activeCwd, commit.hash)
      .then((d) => {
        setCommitDiff(d)
        setCommitDiffLoading(false)
        // Default the file tree to the first changed file.
        if (d.ok && d.files.length > 0) setSelectedCommitFile(d.files[0].path)
      })
      .catch(() => setCommitDiffLoading(false))
  }

  const close = () => {
    overlayStore.update((d) => {
      d.open = false
    })
  }

  return (
    <div
      className="dsdr-overlay"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <div
        className="dsdr-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('review.title')}
        style={{ width: `${prefs.width}px`, height: `${prefs.height}px`, ...diffStyleVars(prefs) } as CSSProperties}
      >
        <ResizeHandle
          mode="e"
          onResize={(dx) =>
            prefsStore.update((d) => {
              d.width = Math.max(MIN_PANEL_W, Math.min(window.innerWidth - 64, d.width + dx))
            })
          }
        />
        <ResizeHandle
          mode="s"
          onResize={(_dx, dy) =>
            prefsStore.update((d) => {
              d.height = Math.max(MIN_PANEL_H, Math.min(window.innerHeight - 64, d.height + dy))
            })
          }
        />
        <ResizeHandle
          mode="se"
          onResize={(dx, dy) =>
            prefsStore.update((d) => {
              d.width = Math.max(MIN_PANEL_W, Math.min(window.innerWidth - 64, d.width + dx))
              d.height = Math.max(MIN_PANEL_H, Math.min(window.innerHeight - 64, d.height + dy))
            })
          }
        />
        <div className="dsdr-header">
          <span className="dsdr-title">{t('review.title')}</span>
          <span className="dsdr-tabs" role="tablist" aria-label={t('review.title')}>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'session'}
              className={`dsdr-tab${tab === 'session' ? ' dsdr-tab-active' : ''}`}
              onClick={() => setTab('session')}
            >
              {t('tab.session')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'workspace'}
              className={`dsdr-tab${tab === 'workspace' ? ' dsdr-tab-active' : ''}`}
              onClick={() => setTab('workspace')}
            >
              {t('tab.workspace')}
            </button>
          </span>
          {tab === 'workspace' && status?.isRepo ? (
            <span className="dsdr-scope">
              {repos.length > 1 ? (
                <ThemeSelect
                  ariaLabel={t('repo.label')}
                  value={repoPath ?? activeCwd ?? ''}
                  options={repos.map((r) => ({ value: r.path, label: `${baseName(r.path)}${r.branch ? ` (${r.branch})` : ''}` }))}
                  onChange={(v) => {
                    setRepoPath(v)
                    setSelected(null)
                    setReview(null)
                  }}
                />
              ) : null}
              <ThemeSelect
                ariaLabel={t('scope.label')}
                value={scope}
                options={SCOPE_OPTIONS.map((s) => ({ value: s.id, label: t(s.label) }))}
                onChange={(v) => {
                  setScope(v as WorkspaceScope)
                  setSelected(null)
                }}
              />
              {scope === 'branch' ? (
                <ThemeSelect
                  ariaLabel={t('scope.base')}
                  value={baseBranch ?? ''}
                  options={branches.map((b) => ({ value: b, label: b }))}
                  onChange={setBaseBranch}
                />
              ) : null}
            </span>
          ) : null}
          <span className="dsdr-subtitle">
            {tab === 'session'
              ? t('review.sessionStats', { rounds: rounds.length, files: totalSessionFiles })
              : status?.isRepo
                ? `${status.branch ?? t('review.detached')} · ${t('review.changes', { added: totalAdded, deleted: totalDeleted })}${status.ahead > 0 ? ` · ${t('review.ahead', { n: status.ahead })}` : ''}${status.behind > 0 ? ` · ${t('review.behind', { n: status.behind })}` : ''}`
                : t('review.notRepo')}
          </span>
          <span className="dsdr-spacer" />
          {tab === 'workspace' && allowActions ? (
            <>
              <button type="button" className="dsdr-btn dsdr-btn-primary" disabled={busy || files.length === 0} onClick={() => onAllAction('accept')}>
                {t('review.acceptAll')}
              </button>
              {stagedCount > 0 ? (
                <button type="button" className="dsdr-btn" disabled={busy} onClick={() => void runApply('unstage')}>
                  {t('review.unstageAll')}
                </button>
              ) : null}
              <button
                type="button"
                className={`dsdr-btn dsdr-btn-danger${confirm === 'all' ? ' dsdr-btn-confirm' : ''}`}
                disabled={busy || files.length === 0}
                onClick={() => onAllAction('revert')}
              >
                {confirm === 'all' ? t('review.confirmRevertAll') : t('review.revertAll')}
              </button>
              <input
                className="dsdr-commit-input"
                type="text"
                value={commitMessage}
                placeholder={t('review.commitPlaceholder')}
                disabled={busy}
                onChange={(event) => setCommitMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void onCommit()
                }}
              />
              <button type="button" className="dsdr-btn" disabled={busy || !commitMessage.trim() || stagedCount === 0} onClick={() => void onCommit()}>
                {t('review.commit')}
              </button>
            </>
          ) : null}
          {tab === 'workspace' && status?.isRepo && reviewableFiles > 0 ? (
            <button
              type="button"
              className="dsdr-btn dsdr-btn-primary"
              disabled={busy || reviewing}
              onClick={() => void onReview()}
              title={t('review.reviewScope')}
            >
              {reviewing ? t('review.reviewing') : t('review.review')}
            </button>
          ) : null}
          <button type="button" className="dsdr-btn" aria-label={t('review.close')} onClick={close}>
            <IconX />
          </button>
        </div>

        {sendOpen ? (
          <div className="dsdr-send">
            <span className="dsdr-send-title">{t('review.sendTitle')}</span>
            <span className="dsdr-send-hint">{t('review.sendHint')}</span>
            <textarea className="dsdr-send-input" readOnly value={sendText} spellCheck={false} />
            <div className="dsdr-comment-actions">
              <button type="button" className="dsdr-btn" disabled={busy} onClick={() => setSendOpen(false)}>
                {t('comment.cancel')}
              </button>
              <button
                type="button"
                className="dsdr-btn"
                disabled={busy}
                onClick={() => {
                  void navigator.clipboard?.writeText(sendText).then(
                    () => setNotice({ kind: 'ok', text: t('review.copied') }),
                    () => setNotice({ kind: 'error', text: t('review.copyFailed') }),
                  )
                }}
              >
                {t('review.copy')}
              </button>
              <button type="button" className="dsdr-btn dsdr-btn-primary" disabled={busy || !sendText.trim()} onClick={() => void sendToAgent()}>
                {t('review.sendToAgent')}
              </button>
            </div>
          </div>
        ) : null}

        {tab === 'session' ? (
          rounds.length === 0 ? (
            <div className="dsdr-empty">{t('review.noSessionChanges')}</div>
          ) : (
            <div className="dsdr-body">
              <div className="dsdr-files" role="listbox" aria-label={t('tab.session')}>
                {rounds.map((round) => (
                  <div key={round.round}>
                    <div className="dsdr-round">
                      {t('review.round', { round: round.round })}
                      {round.label ? <div className="dsdr-round-label" title={round.label}>{round.label}</div> : null}
                    </div>
                    <FileTreeView
                      nodes={sessionTrees.get(round.round) ?? []}
                      collapsed={collapsedDirs}
                      onToggleDir={toggleDir}
                      depth={0}
                      renderLeaf={({ item: change, name }) => {
                        const key = `${round.round}:${change.path}`
                        const selectedKey = selectedChange ? `${selectedRound}:${selectedChange.path}` : null
                        return (
                          <button
                            type="button"
                            role="option"
                            aria-selected={key === selectedKey}
                            className={`dsdr-file${key === selectedKey ? ' dsdr-file-selected' : ''}`}
                            onClick={() => {
                              setSelectedRound(round.round)
                              setSelectedPath(change.path)
                              setConfirm(null)
                            }}
                          >
                            <span className={`dsdr-chip ${change.hasDiff ? 'dsdr-chip-m' : 'dsdr-chip-u'}`}>{change.hasDiff ? 'M' : '·'}</span>
                            <span className="dsdr-file-name" title={change.path}>{name}</span>
                            <span className="dsdr-tool" title={change.tool}>{change.tool}</span>
                          </button>
                        )
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="dsdr-diff">
                {selectedChange ? (
                  <>
                    <div className="dsdr-diff-head">
                      <span className="dsdr-diff-path" title={selectedChange.path}>{selectedChange.path}</span>
                      <span className="dsdr-tool">{selectedChange.tool}</span>
                      {selectedChange.hasDiff ? <DiffViewToggle view={view} onChange={setView} t={t} /> : null}
                      <button type="button" className="dsdr-btn" disabled={busy} onClick={() => void openFile(selectedChange.path)} title={t('editor.openFile')}>
                        ↗ {t('editor.openFile')}
                      </button>
                    </div>
                    {selectedChange.hasDiff ? (
                      view === 'split' && changeSplitBlocks(selectedChange).length > 0 ? (
                        <div className="dsdr-diff-scroll">
                          <div className="dsdr-split">
                            <div className="dsdr-split-head">
                              <div>
                                <span className="dsdr-split-num" aria-hidden="true" />
                                <span>{t('view.before')}</span>
                              </div>
                              <div>
                                <span className="dsdr-split-num" aria-hidden="true" />
                                <span>{t('view.after')}</span>
                              </div>
                            </div>
                            {changeSplitBlocks(selectedChange).map((block, bi) => (
                              <Fragment key={bi}>
                                {block.head ? <div className="dsdr-split-hunk">{block.head}</div> : null}
                                {block.rows.map((row, ri) => {
                                  const leftAnchor = { oldLine: row.leftNum, newLine: row.kind === 'ctx' && row.leftNum !== null ? row.leftNum : null }
                                  const rightAnchor = { oldLine: row.kind === 'ctx' && row.rightNum !== null ? row.rightNum : null, newLine: row.rightNum }
                                  const leftKey = `${leftAnchor.oldLine ?? 'o'}:${leftAnchor.newLine ?? 'n'}`
                                  const rightKey = `${rightAnchor.oldLine ?? 'o'}:${rightAnchor.newLine ?? 'n'}`
                                  const leftComments = comments.filter((c) => commentMatches(c, leftAnchor.oldLine, leftAnchor.newLine))
                                  const rightComments = comments.filter((c) => commentMatches(c, rightAnchor.oldLine, rightAnchor.newLine))
                                  const commentBtn = (anchor: { oldLine: number | null; newLine: number | null }, count: number) => {
                                    const key = `${anchor.oldLine ?? 'o'}:${anchor.newLine ?? 'n'}`
                                    return (
                                      <CommentLine
                                        count={count}
                                        open={commentPopover === key}
                                        onOpen={() => {
                                          setCommentEditor({ oldLine: anchor.oldLine, newLine: anchor.newLine })
                                          setCommentText('')
                                          setCommentPopover(null)
                                        }}
                                        onToggle={() => setCommentPopover((prev) => (prev === key ? null : key))}
                                        t={t}
                                      />
                                    )
                                  }
                                  const openBtn = (line: number) => (
                                    <button type="button" className="dsdr-split-openline" title={t('editor.openLine')} aria-label={t('editor.openLine')} onClick={() => void openFile(selectedChange.path, line)}>
                                      ↗
                                    </button>
                                  )
                                  return (
                                    <Fragment key={ri}>
                                      <div className="dsdr-split-row">
                                        <div
                                          className={`dsdr-split-cell ${row.leftNum === null ? 'dsdr-cell-dim' : row.kind === 'change' ? 'dsdr-cell-del' : ''}`}
                                          data-dsdr-line={row.leftNum ?? undefined}
                                        >
                                          <span className="dsdr-split-num">
                                            {row.leftNum ?? ''}
                                            {commentBtn(leftAnchor, leftComments.length)}
                                          </span>
                                          <span className="dsdr-split-text">{row.left}</span>
                                          {row.leftNum !== null ? openBtn(row.leftNum) : null}
                                        </div>
                                        <div
                                          className={`dsdr-split-cell ${row.rightNum === null ? 'dsdr-cell-dim' : row.kind === 'change' ? 'dsdr-cell-add' : ''}`}
                                          data-dsdr-line={row.rightNum ?? undefined}
                                        >
                                          <span className="dsdr-split-num">
                                            {row.rightNum ?? ''}
                                            {commentBtn(rightAnchor, rightComments.length)}
                                          </span>
                                          <span className="dsdr-split-text">{row.right}</span>
                                          {row.rightNum !== null ? openBtn(row.rightNum) : null}
                                        </div>
                                        {leftComments.length > 0 && commentPopover === leftKey ? (
                                          <div className="dsdr-comment-pop">
                                            {leftComments.map((comment) => (
                                              <div key={comment.id} className="dsdr-comment-item">
                                                <div className="dsdr-comment-text">{comment.text}</div>
                                                <div className="dsdr-comment-meta">
                                                  <span>{comment.path}</span>
                                                  <button type="button" className="dsdr-btn dsdr-btn-danger" disabled={busy} onClick={() => void deleteComment(comment.id)}>
                                                    {t('comment.delete')}
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : null}
                                        {rightComments.length > 0 && commentPopover === rightKey ? (
                                          <div className="dsdr-comment-pop">
                                            {rightComments.map((comment) => (
                                              <div key={comment.id} className="dsdr-comment-item">
                                                <div className="dsdr-comment-text">{comment.text}</div>
                                                <div className="dsdr-comment-meta">
                                                  <span>{comment.path}</span>
                                                  <button type="button" className="dsdr-btn dsdr-btn-danger" disabled={busy} onClick={() => void deleteComment(comment.id)}>
                                                    {t('comment.delete')}
                                                  </button>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : null}
                                      </div>
                                      {commentEditor && (leftKey === `${commentEditor.oldLine ?? 'o'}:${commentEditor.newLine ?? 'n'}` || rightKey === `${commentEditor.oldLine ?? 'o'}:${commentEditor.newLine ?? 'n'}`) ? (
                                        <CommentEditor text={commentText} onText={setCommentText} onSave={() => void saveComment()} onCancel={cancelComment} busy={busy} t={t} />
                                      ) : null}
                                    </Fragment>
                                  )
                                })}
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="dsdr-diff-scroll">
                          <pre className="dsdr-pre">
                            {sessionRowsWithLines(selectedChange).map(({ row, oldLine, newLine }, i) => {
                              const key = `${oldLine ?? 'o'}:${newLine ?? 'n'}`
                              const rowComments = comments.filter((c) => commentMatches(c, oldLine, newLine))
                              const showActions = row.kind === 'ctx' || row.kind === 'add' || row.kind === 'del'
                              return (
                                <Fragment key={i}>
                                  <div className={`dsdr-line dsdr-line-${row.kind}${rowComments.length > 0 ? ' dsdr-line-commented' : ''}`} data-dsdr-line={newLine ?? oldLine ?? undefined}>
                                    <span className="dsdr-line-num">
                                      {newLine ?? oldLine ?? ''}
                                      {showActions ? (
                                        <CommentLine
                                          count={rowComments.length}
                                          open={commentPopover === key}
                                          onOpen={() => openComment(oldLine, newLine)}
                                          onToggle={() => setCommentPopover((prev) => (prev === key ? null : key))}
                                          t={t}
                                        />
                                      ) : null}
                                    </span>
                                    <span className="dsdr-line-text">{row.text || ' '}</span>
                                    {showActions && (newLine ?? oldLine) ? (
                                      <button type="button" className="dsdr-openline" title={t('editor.openLine')} aria-label={t('editor.openLine')} onClick={() => void openFile(selectedChange.path, newLine ?? oldLine ?? 1)}>
                                        ↗
                                      </button>
                                    ) : null}
                                  </div>
                                  {showActions && rowComments.length > 0 && commentPopover === key ? (
                                    <div className="dsdr-comment-pop">
                                      {rowComments.map((comment) => (
                                        <div key={comment.id} className="dsdr-comment-item">
                                          <div className="dsdr-comment-text">{comment.text}</div>
                                          <div className="dsdr-comment-meta">
                                            <span>{comment.path}</span>
                                            <button type="button" className="dsdr-btn dsdr-btn-danger" disabled={busy} onClick={() => void deleteComment(comment.id)}>
                                              {t('comment.delete')}
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                  {commentEditor && `${commentEditor.oldLine ?? 'o'}:${commentEditor.newLine ?? 'n'}` === key ? (
                                    <CommentEditor text={commentText} onText={setCommentText} onSave={() => void saveComment()} onCancel={cancelComment} busy={busy} t={t} />
                                  ) : null}
                                </Fragment>
                              )
                            })}
                          </pre>
                        </div>
                      )
                    ) : (
                      <div className="dsdr-nodiff">{t('review.noDiffData')}</div>
                    )}
                  </>
                ) : (
                  <div className="dsdr-diff-empty">{t('review.noSessionChanges')}</div>
                )}
              </div>
            </div>
          )
        ) : error && !status?.isRepo ? (
          <div className="dsdr-empty">
            {error}
            <div>{t('review.notRepoHint')}</div>
          </div>
        ) : status?.isRepo ? (
          <div className="dsdr-body">
            <div className="dsdr-files" role="listbox" aria-label={t('tab.workspace')}>
              {scope === 'all' ? (
                <>
                  {stagedFiles.length > 0 ? (
                    <>
                      <div className="dsdr-section">{t('review.sectionStaged')} ({stagedFiles.length})</div>
                      <FileTreeView
                        nodes={stagedTree}
                        collapsed={collapsedDirs}
                        onToggleDir={toggleDir}
                        depth={0}
                        renderLeaf={workspaceLeaf}
                      />
                    </>
                  ) : null}
                  {unstagedFiles.length > 0 ? (
                    <>
                      <div className="dsdr-section">{t('review.sectionChanges')} ({unstagedFiles.length})</div>
                      <FileTreeView
                        nodes={unstagedTree}
                        collapsed={collapsedDirs}
                        onToggleDir={toggleDir}
                        depth={0}
                        renderLeaf={workspaceLeaf}
                      />
                    </>
                  ) : null}
                </>
              ) : null}
              {scope === 'unstaged' ? (
                unstagedFiles.length > 0 ? (
                  <>
                    <div className="dsdr-section">{t('review.sectionChanges')} ({unstagedFiles.length})</div>
                    <FileTreeView
                      nodes={unstagedTree}
                      collapsed={collapsedDirs}
                      onToggleDir={toggleDir}
                      depth={0}
                      renderLeaf={workspaceLeaf}
                    />
                  </>
                ) : (
                  <div className="dsdr-empty">{t('review.empty')}</div>
                )
              ) : null}
              {scope === 'staged' ? (
                stagedFiles.length > 0 ? (
                  <>
                    <div className="dsdr-section">{t('review.sectionStaged')} ({stagedFiles.length})</div>
                    <FileTreeView
                      nodes={stagedTree}
                      collapsed={collapsedDirs}
                      onToggleDir={toggleDir}
                      depth={0}
                      renderLeaf={workspaceLeaf}
                    />
                  </>
                ) : (
                  <div className="dsdr-empty">{t('review.empty')}</div>
                )
              ) : null}
              {scope === 'branch' ? (
                scopeFiles.length > 0 ? (
                  <>
                    <div className="dsdr-section">
                      {t('scope.branch')} {baseBranch ? `↔ ${baseBranch}` : ''} ({scopeFiles.length})
                    </div>
                    <div className="dsdr-nodiff">{t('scope.branchReadonly')}</div>
                    <FileTreeView
                      nodes={scopeTree}
                      collapsed={collapsedDirs}
                      onToggleDir={toggleDir}
                      depth={0}
                      renderLeaf={workspaceLeaf}
                    />
                  </>
                ) : (
                  <div className="dsdr-empty">{t('review.empty')}</div>
                )
              ) : null}
              {scope === 'last-turn' ? (
                scopeFiles.length > 0 ? (
                  <>
                    <div className="dsdr-section">{t('scope.last-turn')} ({scopeFiles.length})</div>
                    <FileTreeView
                      nodes={scopeTree}
                      collapsed={collapsedDirs}
                      onToggleDir={toggleDir}
                      depth={0}
                      renderLeaf={workspaceLeaf}
                    />
                  </>
                ) : (
                  <div className="dsdr-empty">{t('review.lastTurnEmpty')}</div>
                )
              ) : null}
              {(scope === 'all' || scope === 'commit') && history.length > 0 ? (
                <>
                  <div className="dsdr-section">{t('review.history')}</div>
                  <div className="dsdr-timeline">
                    {history.map((commit) => (
                      <div
                        key={commit.hash}
                        className={`dsdr-tl-item${selectedCommit?.hash === commit.hash ? ' dsdr-tl-selected' : ''}`}
                      >
                        <div className="dsdr-tl-rail" aria-hidden="true">
                          <span className={`dsdr-tl-dot${commit.ahead ? ' dsdr-tl-dot-local' : ' dsdr-tl-dot-remote'}`} />
                        </div>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selectedCommit?.hash === commit.hash}
                          className="dsdr-commit"
                          onClick={() => selectCommit(commit)}
                        >
                          <span className="dsdr-commit-head">
                            <span className={`dsdr-tl-badge${commit.ahead ? ' dsdr-tl-badge-local' : ' dsdr-tl-badge-remote'}`}>
                              {commit.ahead ? t('history.local') : t('history.remote')}
                            </span>
                            <span className="dsdr-commit-short">{commit.short}</span>
                            <span className="dsdr-commit-subject" title={commit.subject}>{commit.subject}</span>
                          </span>
                          <span className="dsdr-commit-meta">{commit.author} · {relativeTime(commit.date, t)}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              {(scope === 'all' || scope === 'commit') && selectedCommit && commitDiff?.ok && commitDiff.files.length > 0 ? (
                <>
                  <div className="dsdr-section">{t('review.commitFiles')} ({commitDiff.files.length})</div>
                  <FileTreeView
                    nodes={commitFilesTree}
                    collapsed={collapsedDirs}
                    onToggleDir={toggleDir}
                    depth={0}
                    renderLeaf={({ item: file, name }) => (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedCommitFile === file.path}
                        className={`dsdr-file${selectedCommitFile === file.path ? ' dsdr-file-selected' : ''}`}
                        onClick={() => setSelectedCommitFile(file.path)}
                      >
                        <span className="dsdr-chip dsdr-chip-m">{file.status}</span>
                        <span className="dsdr-file-name" title={file.path}>{name}</span>
                        <span className="dsdr-file-stat">
                          {t('review.changes', { added: file.added, deleted: file.deleted })}
                        </span>
                      </button>
                    )}
                  />
                </>
              ) : null}
              {scope === 'all' ? (
                <>
                  <div className="dsdr-section">{t('review.sectionBranch')}</div>
                  <div className="dsdr-branch">
                    <span className="dsdr-branch-ref" title={status.upstream ?? undefined}>
                      {status.branch ?? t('review.detached')}
                      <span className="dsdr-branch-arrow">→</span>
                      {status.upstream ?? t('review.noUpstream')}
                    </span>
                    <span className="dsdr-branch-stat">
                      {status.ahead > 0 ? <span className="dsdr-branch-ahead">{t('review.ahead', { n: status.ahead })}</span> : null}
                      {status.behind > 0 ? <span className="dsdr-branch-behind">{t('review.behind', { n: status.behind })}</span> : null}
                      {status.ahead === 0 && status.behind === 0 && status.upstream ? <span className="dsdr-branch-sync">✓</span> : null}
                    </span>
                    <button
                      type="button"
                      className={`dsdr-btn${confirm === 'push' ? ' dsdr-btn-confirm' : ''}`}
                      disabled={busy || (status?.ahead ?? 0) === 0}
                      onClick={onPush}
                    >
                      {confirm === 'push' ? t('review.confirmPush') : `${t('review.push')}${(status?.ahead ?? 0) > 0 ? ` (${status?.ahead ?? 0})` : ''}`}
                    </button>
                  </div>
                  {pr?.pr ? (
                    <>
                      <div className="dsdr-section">
                        {t('pr.title', { number: pr.pr.number })}
                        {pr.comments.length > 0 ? ` · ${t('pr.comments', { n: pr.comments.length })}` : ''}
                      </div>
                      <div className="dsdr-pr">
                        {pr.comments.length === 0 ? <div className="dsdr-nodiff">{t('pr.noPr')}</div> : null}
                        {pr.comments.map((comment) => (
                          <button
                            key={comment.id}
                            type="button"
                            className="dsdr-pr-item"
                            onClick={() => onPrCommentClick(comment.path, comment.line)}
                          >
                            <span className="dsdr-pr-meta">
                              {comment.path ? `${baseName(comment.path)}${comment.line ? `:${comment.line}` : ''}` : 'general'} · {comment.author}
                            </span>
                            <span className="dsdr-pr-text">{comment.body}</span>
                          </button>
                        ))}
                        {pr.comments.length > 0 ? (
                          <button type="button" className="dsdr-btn" disabled={busy} onClick={() => openSendPanelWith(composePrMessage())}>
                            {t('pr.sendComments')}
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </>
              ) : null}
            </div>
            <div className="dsdr-diff">
              {review?.ok ? (
                <div className={`dsdr-verdict${review.verdict === 'incorrect' ? ' dsdr-verdict-bad' : ' dsdr-verdict-ok'}`}>
                  <span className="dsdr-verdict-mark">{review.verdict === 'incorrect' ? '✗' : '✓'}</span>
                  <span className="dsdr-verdict-text">
                    {review.verdict === 'incorrect' ? t('review.verdictIncorrect') : t('review.verdictCorrect')}
                  </span>
                  <span className="dsdr-verdict-meta">
                    {review.findings.length > 0 ? t('review.findings', { n: review.findings.length }) : t('review.noFindings')}
                    {review.truncated ? ' (truncated)' : ''}
                  </span>
                  {review.model ? <span className="dsdr-verdict-model">{review.model.provider}/{review.model.model}</span> : null}
                  <span className="dsdr-spacer" />
                  {review.findings.length > 0 ? (
                    <button type="button" className="dsdr-btn" disabled={busy} onClick={() => openSendPanelWith(composeFindingsMessage())}>
                      {t('review.sendFindings')}
                    </button>
                  ) : null}
                </div>
              ) : null}
              {selectedCommit ? (
                commitDiffLoading ? (
                  <div className="dsdr-diff-empty">{t('review.busy')}</div>
                ) : commitDiff?.ok ? (
                  <>
                    <div className="dsdr-diff-head">
                      <span className="dsdr-diff-path" title={selectedCommit.subject}>
                        {selectedCommit.subject}
                        <span className="dsdr-diff-hash">{selectedCommit.short}</span>
                      </span>
                      <span className="dsdr-tool">
                        {selectedCommit.author} · {relativeTime(selectedCommit.date, t)}
                      </span>
                      <span className="dsdr-diff-stats">
                        {t('review.changes', { added: commitDiff.added, deleted: commitDiff.deleted })}
                      </span>
                      <DiffViewToggle view={view} onChange={setView} t={t} />
                    </div>
                    {commitActiveFile ? (
                      <div className="dsdr-commit-file-head">
                        <span className="dsdr-diff-path" title={commitActiveFile.path}>
                          <span className="dsdr-chip dsdr-chip-m">{commitFileStatus(commitSegments.find((s) => s.path === commitActiveFile.path)?.text ?? '')}</span>
                          <span className="dsdr-commit-file-path">{commitActiveFile.path}</span>
                        </span>
                        <span className="dsdr-diff-stats">
                          {t('review.changes', { added: commitActiveFile.added, deleted: commitActiveFile.deleted })}
                        </span>
                      </div>
                    ) : null}
                    {view === 'split' && gitSplitBlocks(commitActiveText).length > 0 ? (
                      <SplitDiff blocks={gitSplitBlocks(commitActiveText)} beforeLabel={t('view.before')} afterLabel={t('view.after')} />
                    ) : (
                      <div className="dsdr-diff-scroll">
                        <pre className="dsdr-pre">
                          {gitDiffRows(commitActiveText).map((row, i) => (
                            <div key={i} className={`dsdr-line dsdr-line-${row.kind}`}>{row.text || ' '}</div>
                          ))}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="dsdr-diff-empty">{commitDiff?.error ?? t('review.noDiffData')}</div>
                )
              ) : selectedFile ? (
                <>
                  <div className="dsdr-diff-head">
                    <span className="dsdr-diff-path" title={selectedFile.path}>
                      {selectedFile.path}
                      {selectedFile.origPath ? ` ← ${selectedFile.origPath}` : ''}
                    </span>
                    <span className="dsdr-diff-stats">
                      {selectedFile.binary ? t('review.binary') : t('review.changes', { added: selectedFile.added, deleted: selectedFile.deleted })}
                    </span>
                    <DiffViewToggle view={view} onChange={setView} t={t} />
                    <button type="button" className="dsdr-btn" disabled={busy} onClick={() => void openFile(selectedFile.path)} title={t('editor.openFile')}>
                      ↗ {t('editor.openFile')}
                    </button>
                    {allowActions && selectedFile.unstaged ? (
                      <button type="button" className="dsdr-btn dsdr-btn-primary" disabled={busy} onClick={() => onFileAction('accept', selectedFile.path)}>
                        {t('review.accept')}
                      </button>
                    ) : null}
                    {allowActions && selectedFile.staged ? (
                      <button type="button" className="dsdr-btn" disabled={busy} onClick={() => onFileAction('unstage', selectedFile.path)}>
                        {t('review.unstage')}
                      </button>
                    ) : null}
                    {allowActions ? (
                      <button
                        type="button"
                        className={`dsdr-btn dsdr-btn-danger${confirm === 'file' ? ' dsdr-btn-confirm' : ''}`}
                        disabled={busy}
                        onClick={() => onFileAction('revert', selectedFile.path)}
                      >
                        {confirm === 'file' ? t('review.confirmRevert') : t('review.revert')}
                      </button>
                    ) : null}
                  </div>
                  {view === 'split' && !selectedFile.binary && gitSplitBlocks(selectedFile.diff).length > 0 ? (
                    <div className="dsdr-diff-scroll">
                      <div className="dsdr-split">
                        <div className="dsdr-split-head">
                          <div>
                            <span className="dsdr-split-num" aria-hidden="true" />
                            <span>{t('view.before')}</span>
                          </div>
                          <div>
                            <span className="dsdr-split-num" aria-hidden="true" />
                            <span>{t('view.after')}</span>
                          </div>
                        </div>
                        {gitSplitBlocks(selectedFile.diff).map((block, bi) => (
                          <Fragment key={bi}>
                            {allowActions ? <HunkToolbar hunk={selectedFile.hunks[bi]} busy={busy} onAction={onHunkAction} t={t} /> : null}
                            {block.head ? <div className="dsdr-split-hunk">{block.head}</div> : null}
                            {block.rows.map((row, ri) => {
                              const rowFindings = (review?.findings ?? []).filter(
                                (f) =>
                                  f.file === selectedFile.path &&
                                  (row.rightNum !== null ? row.rightNum >= f.lineStart && row.rightNum <= f.lineEnd : row.leftNum !== null && row.leftNum >= f.lineStart && row.leftNum <= f.lineEnd),
                              )
                              const findingCls = rowFindings.length > 0 ? ` dsdr-cell-finding dsdr-finding-${rowFindings[0].priority}` : ''
                              const jumped = jumpLine != null && (row.rightNum === jumpLine || (row.rightNum === null && row.leftNum === jumpLine))
                              // Comment anchors stay consistent with the unified view: ctx rows expose
                              // both line numbers, change rows expose the side they belong to.
                              const leftAnchor = { oldLine: row.leftNum, newLine: row.kind === 'ctx' && row.leftNum !== null ? row.leftNum : null }
                              const rightAnchor = { oldLine: row.kind === 'ctx' && row.rightNum !== null ? row.rightNum : null, newLine: row.rightNum }
                              const leftKey = `${leftAnchor.oldLine ?? 'o'}:${leftAnchor.newLine ?? 'n'}`
                              const rightKey = `${rightAnchor.oldLine ?? 'o'}:${rightAnchor.newLine ?? 'n'}`
                              const leftComments = comments.filter((c) => commentMatches(c, leftAnchor.oldLine, leftAnchor.newLine))
                              const rightComments = comments.filter((c) => commentMatches(c, rightAnchor.oldLine, rightAnchor.newLine))
                              const openBtn = (line: number) =>
                                selectedFile.path ? (
                                  <button type="button" className="dsdr-split-openline" title={t('editor.openLine')} aria-label={t('editor.openLine')} onClick={() => void openFile(selectedFile.path, line)}>
                                    ↗
                                  </button>
                                ) : null
                              const commentBtn = (anchor: { oldLine: number | null; newLine: number | null }, count: number) => (
                                <CommentLine
                                  count={count}
                                  open={commentPopover === `${anchor.oldLine ?? 'o'}:${anchor.newLine ?? 'n'}`}
                                  onOpen={() => {
                                    setCommentEditor({ oldLine: anchor.oldLine, newLine: anchor.newLine })
                                    setCommentText('')
                                    setCommentPopover(null)
                                  }}
                                  onToggle={() => setCommentPopover((prev) => (prev === `${anchor.oldLine ?? 'o'}:${anchor.newLine ?? 'n'}` ? null : `${anchor.oldLine ?? 'o'}:${anchor.newLine ?? 'n'}`))}
                                  t={t}
                                />
                              )
                              return (
                                <Fragment key={ri}>
                                  <div className="dsdr-split-row">
                                    <div
                                      className={`dsdr-split-cell ${row.leftNum === null ? 'dsdr-cell-dim' : row.kind === 'change' ? 'dsdr-cell-del' : ''}${findingCls}${jumped ? ' dsdr-cell-jump' : ''}`}
                                      data-dsdr-line={row.leftNum ?? undefined}
                                    >
                                      <span className="dsdr-split-num">
                                        {row.leftNum ?? ''}
                                        {commentBtn(leftAnchor, leftComments.length)}
                                      </span>
                                      <span className="dsdr-split-text">{row.left}</span>
                                      {row.leftNum !== null ? openBtn(row.leftNum) : null}
                                      {rowFindings.length > 0 && row.rightNum === null ? <span className={`dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`}>{rowFindings[0].priority}</span> : null}
                                    </div>
                                    <div
                                      className={`dsdr-split-cell ${row.rightNum === null ? 'dsdr-cell-dim' : row.kind === 'change' ? 'dsdr-cell-add' : ''}${findingCls}${jumped ? ' dsdr-cell-jump' : ''}`}
                                      data-dsdr-line={row.rightNum ?? undefined}
                                    >
                                      <span className="dsdr-split-num">
                                        {row.rightNum ?? ''}
                                        {commentBtn(rightAnchor, rightComments.length)}
                                      </span>
                                      <span className="dsdr-split-text">{row.right}</span>
                                      {row.rightNum !== null ? openBtn(row.rightNum) : null}
                                      {rowFindings.length > 0 && row.rightNum !== null ? <span className={`dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`}>{rowFindings[0].priority}</span> : null}
                                    </div>
                                    {leftComments.length > 0 && commentPopover === leftKey ? (
                                      <div className="dsdr-comment-pop">
                                        {leftComments.map((comment) => (
                                          <div key={comment.id} className="dsdr-comment-item">
                                            <div className="dsdr-comment-text">{comment.text}</div>
                                            <div className="dsdr-comment-meta">
                                              <span>{comment.path}</span>
                                              <button type="button" className="dsdr-btn dsdr-btn-danger" disabled={busy} onClick={() => void deleteComment(comment.id)}>
                                                {t('comment.delete')}
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                    {rightComments.length > 0 && commentPopover === rightKey ? (
                                      <div className="dsdr-comment-pop">
                                        {rightComments.map((comment) => (
                                          <div key={comment.id} className="dsdr-comment-item">
                                            <div className="dsdr-comment-text">{comment.text}</div>
                                            <div className="dsdr-comment-meta">
                                              <span>{comment.path}</span>
                                              <button type="button" className="dsdr-btn dsdr-btn-danger" disabled={busy} onClick={() => void deleteComment(comment.id)}>
                                                {t('comment.delete')}
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                  {commentEditor && (leftKey === `${commentEditor.oldLine ?? 'o'}:${commentEditor.newLine ?? 'n'}` || rightKey === `${commentEditor.oldLine ?? 'o'}:${commentEditor.newLine ?? 'n'}`) ? (
                                    <CommentEditor text={commentText} onText={setCommentText} onSave={() => void saveComment()} onCancel={cancelComment} busy={busy} t={t} />
                                  ) : null}
                                  {(review?.findings ?? [])
                                    .filter((f) => f.file === selectedFile.path && f.lineStart === (row.leftNum ?? row.rightNum))
                                    .map((f, fi) => (
                                      <FindingCard key={`${f.file}:${f.lineStart}:${fi}`} finding={f} t={t} />
                                    ))}
                                </Fragment>
                              )
                            })}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <UnifiedDiff
                      diff={selectedFile.diff}
                      hunks={selectedFile.hunks}
                      busy={busy}
                      onHunkAction={onHunkAction}
                      t={t}
                      comments={comments}
                      commentEditor={commentEditor}
                      commentText={commentText}
                      onCommentText={setCommentText}
                      onOpenComment={openComment}
                      onSaveComment={() => void saveComment()}
                      onCancelComment={cancelComment}
                      commentPopover={commentPopover}
                      onTogglePopover={(key) => setCommentPopover((prev) => (prev === key ? null : key))}
                      onDeleteComment={(id) => void deleteComment(id)}
                      readOnly={!allowActions}
                      path={selectedFile.path}
                      reviewFindings={review?.findings}
                      onOpenLine={(p, line) => void openFile(p, line)}
                      jumpLine={jumpLine}
                    />
                  )}
                </>
              ) : (
                <div className="dsdr-diff-empty">{scope === 'commit' ? t('review.selectCommit') : t('review.empty')}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="dsdr-empty">
            {error ?? t('review.loadError')}
            {!status?.isRepo ? <div>{t('review.notRepoHint')}</div> : null}
          </div>
        )}

        <div className="dsdr-foot">
          {(loading || busy) && tab === 'workspace' ? <span className="dsdr-spinner" aria-hidden="true" /> : null}
          {busy ? <span className="dsdr-notice">{t('review.busy')}</span> : null}
          {notice ? <span className={`dsdr-notice dsdr-notice-${notice.kind}`}>{notice.text}</span> : null}
        </div>
      </div>
    </div>
  )
}

/** Config card for the Plugins configuration tab (Settings → Plugins → 可配置). */
function DiffReviewConfigCard({ t }: { t: (key: keyof typeof zh, params?: Record<string, unknown>) => string }) {
  const [open, setOpen] = useState(false)

  return (
    <li className={open ? 'dsdr-cfg-card dsdr-cfg-card-open' : 'dsdr-cfg-card'}>
      <button type="button" className="dsdr-cfg-head" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="dsdr-cfg-head-text">
          <span className="dsdr-cfg-name">{t('settings.title')}</span>
          <span className="dsdr-cfg-desc">{t('config.title')}</span>
        </span>
        <IconChevronDownOutline14 className={open ? 'dsdr-cfg-caret dsdr-cfg-caret-open' : 'dsdr-cfg-caret'} />
      </button>
      {open ? (
        <div className="dsdr-cfg-body">
          <DiffReviewPrefs t={t} />
        </div>
      ) : null}
    </li>
  )
}

/** Client plugin body. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), 'diff-review: locale dictionary')
  ctx.slots.inject('conversation.session.header.actions', () =>
    ctx.slots.register(
      {
        name: 'conversation.session.header.actions',
        id: 'diff-review',
        order: 70,
        locale: LOCALE_NS,
      },
      DiffReviewAction,
    ),
  )
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'diff-review-overlay',
        order: 10,
        locale: LOCALE_NS,
        inject: () => ({ sessions: ctx.sessions }),
      },
      DiffReviewOverlay,
    ),
  )
  // Codex-style pending-comments strip at the TOP of the composer, styled as
  // the card's own surface so it reads as one fused dialog.
  ctx.slots.inject('conversation.input.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.dock',
        id: 'diff-review-comments-dock',
        order: 20,
        locale: LOCALE_NS,
        inject: () => ({ sessions: ctx.sessions }),
      },
      DiffReviewComposerDock,
    ),
  )
  // The plugin's own settings tab inside 设置 → 插件 (not the General section).
  // The plugin's whole configuration lives in one card inside
  // 设置 → 插件 → 插件配置 (settings.plugin.item): font/size.
  ctx.slots.inject('settings.plugin.item', () =>
    ctx.slots.register(
      {
        name: 'settings.plugin.item',
        id: 'diff-review-config',
        order: 30,
        locale: LOCALE_NS,
      },
      DiffReviewConfigCard,
    ),
  )
}
