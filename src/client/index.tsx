/**
 * Diff-review plugin — client half.
 *
 * Codex-style review of the session workspace's uncommitted changes:
 *
 * - A session-header action ("Diff Review") shows the changed-file count of
 *   the current session's workspace and opens the review surface.
 * - The review surface mounts in the frame-wide `shell.overlay` layer (root
 *   scope): a modal with a file list on the left and a per-file unified diff
 *   on the right, plus Accept (stage) / Revert (discard) per file and for
 *   everything at once. Revert requires a confirming second click.
 *
 * State hand-off between the session-scoped trigger and the root-scoped
 * overlay goes through a plain module-level snapshot store (the slot store
 * seat cannot span scopes): the trigger writes `{ open, cwd, key }`, the
 * overlay subscribes with useSyncExternalStore and re-loads on each open.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ClientContext, SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only imports pulling the header-action slot contract, the
// session/global standard kit, and the shell.overlay contract into this program.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ApplyResponse, DiffFile, StatusResponse } from '../shared/types.ts'

export const name = 'diff-review'

/** Required client services (fiber inject). */
export const inject = ['sessions', 'slots', 'locale']

const LOCALE_NS = 'diff-review'
const STATUS_URL = 'diff-review/status'
const APPLY_URL = 'diff-review/apply'
const STYLE_TAG = 'dsh-plugin-diff-review/review.css'

/** Open state shared between the header trigger (session scope) and the overlay (root scope). */
const overlayStore = createSnapshotStore<{ open: boolean; cwd: string | null; key: number }>({
  open: false,
  cwd: null,
  key: 0,
})

const REVIEW_CSS = `
.dsdr-trigger{min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:4px;padding:3px 6px;font:inherit;font-size:12px;line-height:18px;display:inline-flex}
.dsdr-trigger:hover,.dsdr-trigger:focus-visible{color:var(--dsw-alias-label-secondary)}
.dsdr-label{margin-left:2px}
.dsdr-count{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-secondary);border-radius:999px;min-width:16px;text-align:center;font-size:11px;line-height:16px;padding:0 5px;font-variant-numeric:tabular-nums}
.dsdr-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:32px}
.dsdr-panel{box-sizing:border-box;width:min(1120px,100%);height:min(720px,calc(100vh - 64px));background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:var(--dsw-shadow-lv3);display:flex;flex-direction:column;overflow:hidden}
.dsdr-header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dsdr-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-subtitle{color:var(--dsw-alias-label-tertiary);font-size:12px;font-family:var(--dsw-font-mono)}
.dsdr-spacer{flex:1}
.dsdr-btn{box-sizing:border-box;min-height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:3px 10px;font:inherit;font-size:12px;line-height:18px;display:inline-flex;align-items:center;gap:5px}
.dsdr-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-btn:disabled{opacity:.5;cursor:default}
.dsdr-btn-primary{border-color:var(--dsw-static-neutral-bluish-400);color:var(--dsw-alias-label-primary)}
.dsdr-btn-danger{color:var(--dsw-alias-state-error-primary)}
.dsdr-btn-danger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)}
.dsdr-btn-confirm{border-color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);color:var(--dsw-static-neutral-bluish-50)}
.dsdr-btn-confirm:hover:not(:disabled){background:var(--dsw-alias-state-error-primary);color:var(--dsw-static-neutral-bluish-50)}
.dsdr-body{display:flex;flex:1;min-height:0}
.dsdr-files{width:290px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow-y:auto;padding:8px}
.dsdr-file{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border-radius:8px;padding:6px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:var(--dsw-alias-label-primary)}
.dsdr-file:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-file-selected{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-file-name{flex:1;min-width:0;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-family:var(--dsw-font-mono)}
.dsdr-file-stat{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dsdr-chip{flex:none;min-width:22px;text-align:center;border-radius:5px;font-size:11px;line-height:16px;padding:0 4px;font-family:var(--dsw-font-mono)}
.dsdr-chip-m{background:rgba(217,130,27,.16);color:var(--dsw-alias-state-warning-primary, #d9821b)}
.dsdr-chip-a{background:rgba(46,160,67,.16);color:var(--dsw-alias-state-success-primary, #2ea043)}
.dsdr-chip-d{background:rgba(248,81,73,.16);color:var(--dsw-alias-state-error-primary, #f85149)}
.dsdr-chip-r{background:rgba(88,166,255,.16);color:var(--dsw-alias-state-info-primary, #58a6ff)}
.dsdr-chip-u{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-diff{flex:1;min-width:0;overflow:auto;padding:10px 0}
.dsdr-diff-empty{display:flex;align-items:center;justify-content:center;height:100%;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsdr-diff-head{display:flex;align-items:center;gap:10px;padding:6px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dsdr-diff-path{font-family:var(--dsw-font-mono);font-size:13px;color:var(--dsw-alias-label-primary);flex:1;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-diff-stats{font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none}
.dsdr-diff-scroll{flex:1;min-height:0;overflow:auto;display:flex}
.dsdr-pre{margin:0;padding:8px 0;font-family:var(--dsw-font-mono);font-size:12px;line-height:18px;white-space:pre;min-width:100%;flex:1}
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
  'action.label': 'Diff 审查',
  'action.aria': '审查当前项目的未提交更改',
  'action.count': '{count} 个文件更改',
  'review.title': 'Diff 审查',
  'review.branch': '分支',
  'review.detached': '游离 HEAD',
  'review.notRepo': '当前目录不是 git 仓库',
  'review.empty': '没有未提交的更改 🎉',
  'review.loadError': '加载失败',
  'review.accept': '采纳',
  'review.revert': '丢弃',
  'review.acceptAll': '全部采纳',
  'review.revertAll': '全部丢弃',
  'review.confirmRevert': '再次点击确认丢弃',
  'review.confirmRevertAll': '再次点击确认全部丢弃',
  'review.refresh': '刷新',
  'review.close': '关闭',
  'review.busy': '处理中…',
  'review.done': '已{action} {count} 个文件',
  'review.doneOne': '已{action} {path}',
  'review.accepted': '采纳',
  'review.reverted': '丢弃',
  'review.untracked': '未跟踪',
  'review.binary': '二进制',
  'review.selectedFile': '已选文件',
  'review.changes': '{added}+ {deleted}-',
} as const

/** English dictionary, checked complete against the zh key set. */
const en: Record<keyof typeof zh, string> = {
  'action.label': 'Diff Review',
  'action.aria': 'Review uncommitted changes of the current project',
  'action.count': '{count} changed files',
  'review.title': 'Diff Review',
  'review.branch': 'branch',
  'review.detached': 'detached HEAD',
  'review.notRepo': 'This directory is not a git repository',
  'review.empty': 'No uncommitted changes 🎉',
  'review.loadError': 'Failed to load',
  'review.accept': 'Accept',
  'review.revert': 'Revert',
  'review.acceptAll': 'Accept all',
  'review.revertAll': 'Revert all',
  'review.confirmRevert': 'Click again to confirm revert',
  'review.confirmRevertAll': 'Click again to confirm revert all',
  'review.refresh': 'Refresh',
  'review.close': 'Close',
  'review.busy': 'Working…',
  'review.done': '{action} {count} files',
  'review.doneOne': '{action} {path}',
  'review.accepted': 'Accepted',
  'review.reverted': 'Reverted',
  'review.untracked': 'untracked',
  'review.binary': 'binary',
  'review.selectedFile': 'selected file',
  'review.changes': '{added}+ {deleted}-',
}

type DiffReviewActionProps = PropsRuntime<'conversation.session.header.actions'> & PropsLocale<'diff-review'>
type DiffReviewOverlayProps = PropsRuntime<'shell.overlay'> & PropsLocale<'diff-review'>

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

/** Status chip color class for a change. */
function chipClass(status: string): string {
  const s = status.replace(/\s/g, '')
  if (s.includes('??')) return 'dsdr-chip-u'
  if (s.startsWith('A') || s.includes('A')) return 'dsdr-chip-a'
  if (s.startsWith('D') || s.includes('D')) return 'dsdr-chip-d'
  if (s.startsWith('R') || s.includes('R')) return 'dsdr-chip-r'
  return 'dsdr-chip-m'
}

/** Split unified diff text into renderable lines. */
function diffLines(diff: string): { kind: 'add' | 'del' | 'ctx' | 'hunk' | 'file' | 'note'; text: string }[] {
  return diff.split('\n').map((line) => {
    if (line.startsWith('+++') || line.startsWith('---')) return { kind: 'file' as const, text: line }
    if (line.startsWith('@@')) return { kind: 'hunk' as const, text: line }
    if (line.startsWith('+')) return { kind: 'add' as const, text: line }
    if (line.startsWith('-')) return { kind: 'del' as const, text: line }
    if (line.startsWith('\\ ')) return { kind: 'note' as const, text: line }
    return { kind: 'ctx' as const, text: line }
  })
}

/** Fetch the review status for a workspace. */
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

// ---------------------------------------------------------------------------
// Header action (session scope).
// ---------------------------------------------------------------------------

function DiffReviewAction({ sessionId, useSessions, t }: DiffReviewActionProps) {
  const cwd = useSessions((s: SessionListState) => s.byId[sessionId]?.cwd)
  const [count, setCount] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  // Badge: changed-file count of this session's workspace.
  useEffect(() => {
    let alive = true
    setCount(null)
    if (!cwd) return
    void loadStatus(cwd)
      .then((status) => {
        if (alive && status.isRepo) setCount(status.files.length)
      })
      .catch(() => {
        // badge is a nicety — the review surface reports errors itself
      })
    return () => {
      alive = false
    }
  }, [cwd])

  const openOverlay = () => {
    if (!cwd) return
    overlayStore.update((d) => {
      d.open = true
      d.cwd = cwd
      d.key = d.key + 1
    })
  }

  const closeOverlay = () => {
    overlayStore.update((d) => {
      d.open = false
    })
  }

  // Keep the trigger's open state in sync with the store (e.g. Escape close).
  useEffect(() => {
    const unsub = overlayStore.subscribe(() => {
      setOpen(overlayStore.getSnapshot().open)
    })
    return unsub
  }, [])

  if (!cwd) return null

  return (
    <button
      type="button"
      className="dsdr-trigger"
      aria-label={t('action.aria')}
      onClick={openOverlay}
    >
      <IconDiff />
      <span className="dsdr-label">{t('action.label')}</span>
      {count !== null && count > 0 ? <span className="dsdr-count">{count}</span> : null}
      {open ? <span className="dsdr-count" aria-hidden="true">✓</span> : null}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Review overlay (root scope).
// ---------------------------------------------------------------------------

function DiffReviewOverlay({ t }: DiffReviewOverlayProps) {
  const state = useSyncExternalStore(overlayStore.subscribe, overlayStore.getSnapshot)
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [confirm, setConfirm] = useState<'file' | 'all' | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cwd = state.cwd

  const load = async (silent = false) => {
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

  useEffect(() => {
    if (state.open && state.key > 0) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open, state.key])

  // Escape / outside-click close + notice auto-dismiss.
  useEffect(() => {
    if (!state.open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        overlayStore.update((d) => {
          d.open = false
        })
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.open])

  useEffect(() => {
    if (!notice) return
    noticeTimer.current = setTimeout(() => setNotice(null), 3000)
    return () => clearTimeout(noticeTimer.current)
  }, [notice])

  if (!state.open || !cwd) return null

  const files = status?.isRepo ? status.files : []
  const selectedFile = files.find((f) => f.path === selected) ?? null
  const totalAdded = files.reduce((n, f) => n + f.added, 0)
  const totalDeleted = files.reduce((n, f) => n + f.deleted, 0)

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
        await load(true)
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

  return (
    <div
      className="dsdr-overlay"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          overlayStore.update((d) => {
            d.open = false
          })
        }
      }}
    >
      <div className="dsdr-panel" role="dialog" aria-modal="true" aria-label={t('review.title')}>
        <div className="dsdr-header">
          <span className="dsdr-title">{t('review.title')}</span>
          <span className="dsdr-subtitle">
            {status?.isRepo
              ? `${status.branch ?? t('review.detached')} · ${t('review.changes', { added: totalAdded, deleted: totalDeleted })}`
              : t('review.notRepo')}
          </span>
          <span className="dsdr-spacer" />
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
          <button type="button" className="dsdr-btn" disabled={busy} onClick={() => void load()}>
            <IconRefresh />
            {t('review.refresh')}
          </button>
          <button
            type="button"
            className="dsdr-btn"
            aria-label={t('review.close')}
            onClick={() =>
              overlayStore.update((d) => {
                d.open = false
              })
            }
          >
            <IconX />
          </button>
        </div>

        {error && !status?.isRepo ? <div className="dsdr-empty">{error}</div> : null}

        {status?.isRepo && files.length === 0 ? (
          <div className="dsdr-empty">{t('review.empty')}</div>
        ) : null}

        {status?.isRepo && files.length > 0 ? (
          <div className="dsdr-body">
            <div className="dsdr-files" role="listbox" aria-label={t('review.title')}>
              {files.map((file) => (
                <button
                  key={file.path}
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
                  <span className="dsdr-file-name" title={file.path}>
                    {file.path}
                  </span>
                  <span className="dsdr-file-stat">
                    {file.binary ? t('review.binary') : t('review.changes', { added: file.added, deleted: file.deleted })}
                  </span>
                </button>
              ))}
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
                      {selectedFile.binary
                        ? t('review.binary')
                        : t('review.changes', { added: selectedFile.added, deleted: selectedFile.deleted })}
                    </span>
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
                  <div className="dsdr-diff-scroll">
                    <pre className="dsdr-pre">
                      {diffLines(selectedFile.diff).map((line, i) => (
                        <div key={i} className={`dsdr-line dsdr-line-${line.kind}`}>
                          {line.text || ' '}
                        </div>
                      ))}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="dsdr-diff-empty">{t('review.selectedFile')}</div>
              )}
            </div>
          </div>
        ) : null}

        <div className="dsdr-foot">
          {loading || busy ? <span className="dsdr-spinner" aria-hidden="true" /> : null}
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
      },
      DiffReviewOverlay,
    ),
  )
}
