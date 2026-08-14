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
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { diffLines } from 'diff'
import type { ClientContext, ISessions, SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConversationNode, ToolResultNode, UserMessageNode } from '@deepseek-ai/dsh-client-runtime/client'
import type { ToolResultView } from '@deepseek-ai/dsh-api-remotes/client'
// Type-only imports pulling the header-action slot contract, the shell.overlay
// contract, the settings.general.item slot contract and the standard kit.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ApplyResponse, DiffFile, GitResponse, StatusResponse } from '../shared/types.ts'

export const name = 'diff-review'

/** Required client services (fiber inject). */
export const inject = ['sessions', 'slots', 'locale']

const LOCALE_NS = 'diff-review'
const STATUS_URL = 'diff-review/status'
const APPLY_URL = 'diff-review/apply'
const COMMIT_URL = 'diff-review/commit'
const PUSH_URL = 'diff-review/push'
const STYLE_TAG = 'dsh-plugin-diff-review/review.css'

/** Open state shared between the header trigger (session scope) and the overlay (root scope). */
const overlayStore = createSnapshotStore<{ open: boolean; cwd: string | null; key: number }>({
  open: false,
  cwd: null,
  key: 0,
})

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

/** Diff hunks carried by a completed tool result (`resultView.card === 'diff'`). */
function diffsFromResultView(resultView: ToolResultView | null): FileDiffLike[] {
  if (!resultView || resultView.card !== 'diff' || !Array.isArray(resultView.diffs)) return []
  return resultView.diffs.map(asFileDiff).filter((d): d is FileDiffLike => d !== null)
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
function changesFromToolResult(call: { name: string; argsRaw: string }, node: ToolResultNode): RoundChange[] {
  const tool = call.name
  const diffs = diffsFromResultView(node.resultView)
  const fallbackDiffs = diffs.length === 0 ? diffsFromMeta(node.meta) : []
  const allDiffs = diffs.length > 0 ? diffs : fallbackDiffs
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
  const path = mutationPath(tool, call.argsRaw)
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
    if (node.kind !== 'tool-result' || !current || !node.call) continue
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
    if (node.kind !== 'tool-result' || !node.call) continue
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
.dsdr-line{display:flex;padding:0 16px;color:var(--dsw-alias-label-primary)}
.dsdr-line-add{background:rgba(46,160,67,.13)}
.dsdr-line-del{background:rgba(248,81,73,.12)}
.dsdr-line-hunk{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-line-file{color:var(--dsw-alias-label-tertiary)}
.dsdr-line-note{color:var(--dsw-alias-label-tertiary);font-style:italic}
.dsdr-foot{display:flex;align-items:center;gap:10px;padding:8px 16px;border-top:1px solid var(--dsw-alias-border-l1);flex:none;min-height:36px}
.dsdr-notice{font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsdr-notice-ok{color:var(--dsw-alias-state-success-primary)}
.dsdr-notice-error{color:var(--dsw-alias-state-error-primary)}
.dsdr-spinner{flex:none;width:12px;height:12px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-label-secondary);animation:dsdr-spin .8s linear infinite}
@keyframes dsdr-spin{to{transform:rotate(360deg)}}
.dsdr-empty{padding:40px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsdr-nodiff{padding:8px 16px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsdr-set-row{border-bottom:1px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;gap:10px;padding:16px 0}
.dsdr-set-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.dsdr-set-grid{display:flex;flex-wrap:wrap;gap:12px}
.dsdr-set-field{display:flex;flex-direction:column;gap:4px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsdr-sel{position:relative;display:inline-flex}
.dsdr-sel-trigger{box-sizing:border-box;min-width:180px;min-height:28px;background:var(--dsw-alias-fill-l2);border:1px solid var(--dsw-alias-border-l2);border-radius:7px;color:var(--dsw-alias-label-primary);cursor:pointer;padding:2px 8px;font:inherit;font-size:12px;line-height:18px;display:inline-flex;align-items:center;gap:8px}
.dsdr-sel-trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-sel-trigger:focus-visible{outline:1px solid var(--dsw-static-neutral-bluish-400)}
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
.dsdr-split-row{display:grid;grid-template-columns:1fr 1fr;font-family:var(--dsdr-diff-font, var(--dsw-font-mono));font-size:var(--dsdr-diff-size, 12px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px)}
.dsdr-split-cell{display:flex;gap:8px;padding:0 8px;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}
.dsdr-split-num{flex:none;width:36px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;font-size:calc(var(--dsdr-diff-size, 12px) - 1px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px)}
.dsdr-split-text{flex:1;min-width:0}
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
  'review.refresh': '刷新',
  'review.close': '关闭',
  'review.busy': '处理中…',
  'review.done': '已{action} {count} 个文件',
  'review.doneOne': '已{action} {path}',
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
  'settings.title': '变动',
  'settings.font': '字体',
  'settings.size': '字号',
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
  'review.refresh': 'Refresh',
  'review.close': 'Close',
  'review.busy': 'Working…',
  'review.done': '{action} {count} files',
  'review.doneOne': '{action} {path}',
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
  'settings.title': 'Changes',
  'settings.font': 'Font',
  'settings.size': 'Font size',
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

function IconRefresh() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
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

async function applyChanges(cwd: string, action: 'accept' | 'revert', path?: string): Promise<ApplyResponse> {
  const res = await fetch(APPLY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ cwd, action, path }),
  })
  return (await res.json().catch(() => ({ ok: false, error: 'invalid response' }))) as ApplyResponse
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

/** Settings → General preference row: diff font + font size (shared prefs store). */
function DiffReviewSettingsRow({ t }: { t: (key: keyof typeof zh, params?: Record<string, unknown>) => string }) {
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.getSnapshot)
  return (
    <div className="dsdr-set-row">
      <div className="dsdr-set-title">{t('settings.title')}</div>
      <div className="dsdr-set-grid">
        <label className="dsdr-set-field">
          <span>{t('settings.font')}</span>
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
        </label>
        <label className="dsdr-set-field">
          <span>{t('settings.size')}</span>
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
        </label>
      </div>
    </div>
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

  const loadWorkspace = async (silent = false) => {
    if (!cwd) return
    if (!silent) setLoading(true)
    setError(null)
    try {
      const next = await loadStatus(cwd)
      setStatus(next)
      if (next.error && !next.isRepo) setError(next.error)
      setSelected((prev) => (prev && next.files.some((f) => f.path === prev) ? prev : next.files[0]?.path ?? null))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // Load workspace status lazily on first visit of the tab.
  const workspaceLoaded = useRef(false)
  useEffect(() => {
    if (tab === 'workspace' && !workspaceLoaded.current && cwd) {
      workspaceLoaded.current = true
      void loadWorkspace()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, cwd])

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
  const stagedCount = stagedFiles.length
  // NOTE: hooks must all run before the early return below (React hook order).
  const stagedTree = useMemo(() => buildFileTree(stagedFiles, (f) => f.path), [stagedFiles])
  const unstagedTree = useMemo(() => buildFileTree(unstagedFiles, (f) => f.path), [unstagedFiles])

  if (!storeState.open || !cwd) return null

  const selectedFile = files.find((f) => f.path === selected) ?? null
  const totalAdded = files.reduce((n, f) => n + f.added, 0)
  const totalDeleted = files.reduce((n, f) => n + f.deleted, 0)

  /** Leaf row shared by the staged/unstaged file trees. */
  const workspaceLeaf = ({ item: file, name }: { item: DiffFile; name: string }) => (
    <button
      type="button"
      role="option"
      aria-selected={file.path === selected}
      className={`dsdr-file${file.path === selected ? ' dsdr-file-selected' : ''}`}
      onClick={() => {
        setSelected(file.path)
        setConfirm(null)
      }}
    >
      <span className={`dsdr-chip ${chipClass(file.status)}`}>{file.untracked ? '??' : file.status}</span>
      <span className="dsdr-file-name" title={file.path}>{name}</span>
      <span className="dsdr-file-stat">
        {file.binary ? t('review.binary') : t('review.changes', { added: file.added, deleted: file.deleted })}
      </span>
    </button>
  )

  const runApply = async (action: 'accept' | 'revert', path?: string) => {
    setBusy(true)
    setNotice(null)
    setConfirm(null)
    try {
      const result = await applyChanges(cwd, action, path)
      if (result.ok) {
        setNotice({
          kind: 'ok',
          text: path
            ? t('review.doneOne', { action: action === 'accept' ? t('review.accepted') : t('review.reverted'), path })
            : t('review.done', { action: action === 'accept' ? t('review.accepted') : t('review.reverted'), count: files.length }),
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

  const onFileAction = (action: 'accept' | 'revert', path: string) => {
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

  /** Commit the staged changes with the entered message. */
  const onCommit = async () => {
    const message = commitMessage.trim()
    if (!message || busy) return
    setBusy(true)
    setNotice(null)
    setConfirm(null)
    try {
      const result = await runGitAction(cwd, 'commit', message)
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
    if (busy) return
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
        const result = await runGitAction(cwd, 'push')
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
          <span className="dsdr-subtitle">
            {tab === 'session'
              ? t('review.sessionStats', { rounds: rounds.length, files: totalSessionFiles })
              : status?.isRepo
                ? `${status.branch ?? t('review.detached')} · ${t('review.changes', { added: totalAdded, deleted: totalDeleted })}${status.ahead > 0 ? ` · ${t('review.ahead', { n: status.ahead })}` : ''}${status.behind > 0 ? ` · ${t('review.behind', { n: status.behind })}` : ''}`
                : t('review.notRepo')}
          </span>
          <span className="dsdr-spacer" />
          {tab === 'workspace' ? (
            <>
              <button type="button" className="dsdr-btn dsdr-btn-primary" disabled={busy || files.length === 0} onClick={() => onAllAction('accept')}>
                {t('review.acceptAll')}
              </button>
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
              <button type="button" className="dsdr-btn" disabled={busy} onClick={() => void loadWorkspace()}>
                <IconRefresh />
                {t('review.refresh')}
              </button>
            </>
          ) : null}
          <button type="button" className="dsdr-btn" aria-label={t('review.close')} onClick={close}>
            <IconX />
          </button>
        </div>

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
                    </div>
                    {selectedChange.hasDiff ? (
                      view === 'split' && changeSplitBlocks(selectedChange).length > 0 ? (
                        <SplitDiff blocks={changeSplitBlocks(selectedChange)} beforeLabel={t('view.before')} afterLabel={t('view.after')} />
                      ) : (
                        <div className="dsdr-diff-scroll">
                          <pre className="dsdr-pre">
                            {changeRows(selectedChange).map((row, i) => (
                              <div key={i} className={`dsdr-line dsdr-line-${row.kind}`}>{row.text || ' '}</div>
                            ))}
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
            </div>
            <div className="dsdr-diff">
              {selectedFile ? (
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
                    <button type="button" className="dsdr-btn dsdr-btn-primary" disabled={busy} onClick={() => onFileAction('accept', selectedFile.path)}>
                      {t('review.accept')}
                    </button>
                    <button
                      type="button"
                      className={`dsdr-btn dsdr-btn-danger${confirm === 'file' ? ' dsdr-btn-confirm' : ''}`}
                      disabled={busy}
                      onClick={() => onFileAction('revert', selectedFile.path)}
                    >
                      {confirm === 'file' ? t('review.confirmRevert') : t('review.revert')}
                    </button>
                  </div>
                  {view === 'split' && !selectedFile.binary && gitSplitBlocks(selectedFile.diff).length > 0 ? (
                    <SplitDiff blocks={gitSplitBlocks(selectedFile.diff)} beforeLabel={t('view.before')} afterLabel={t('view.after')} />
                  ) : (
                    <div className="dsdr-diff-scroll">
                      <pre className="dsdr-pre">
                        {gitDiffRows(selectedFile.diff).map((row, i) => (
                          <div key={i} className={`dsdr-line dsdr-line-${row.kind}`}>{row.text || ' '}</div>
                        ))}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="dsdr-diff-empty">{t('review.empty')}</div>
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
  ctx.slots.inject('settings.general.item', () =>
    ctx.slots.register(
      {
        name: 'settings.general.item',
        id: 'diff-review-preferences',
        order: 30,
        locale: LOCALE_NS,
      },
      DiffReviewSettingsRow,
    ),
  )
}
