/**
 * Wire types shared by the diff-review server routes and the browser client.
 */

/** One changed file in the review. */
export interface DiffFile {
  /** Repo-relative path (rename destination for renames). */
  path: string
  /** Path before a rename/copy (the source side); present only for R/C statuses. */
  origPath?: string
  /** Raw porcelain XY pair (e.g. 'MM', 'A ', ' D', '??', 'R '). */
  xy: string
  /** Display status: the porcelain XY pair with spaces trimmed, e.g. 'M', 'MM', 'A', 'D', 'R', '??'. */
  status: string
  /** Whether the file is untracked. */
  untracked: boolean
  /** Whether the index holds changes for this file. */
  staged: boolean
  /** Whether the worktree holds changes for this file. */
  unstaged: boolean
  /** Added line count (0 for binary). */
  added: number
  /** Deleted line count (0 for binary). */
  deleted: number
  /** Unified diff text (staged + unstaged concatenated; synthetic for untracked). */
  diff: string
  /** True when the file looks binary (no usable diff). */
  binary: boolean
  /** Worktree mtime (epoch ms), 0 when unreadable (used by the Last-turn scope). */
  mtime: number
  /** Hunks of `diff` in order, each tagged with the git layer it belongs to. */
  hunks: DiffHunk[]
}

/** One hunk of a file's diff (`@@ … @@` header plus its body lines). */
export interface DiffHunk {
  /** staged = from `git diff --cached` (index vs HEAD); unstaged = worktree vs index. */
  layer: 'staged' | 'unstaged'
  /** The raw hunk text, starting with the `@@` line (no trailing newline). */
  text: string
}

/** GET {statusPath}?cwd=… response. */
export interface StatusResponse {
  isRepo: boolean
  /** Current branch name, or null when not a repo / detached HEAD. */
  branch: string | null
  /** Upstream branch (`origin/main`), or null when none is configured. */
  upstream: string | null
  /** Commits ahead of the upstream (0 when no upstream). */
  ahead: number
  /** Commits behind the upstream (0 when no upstream). */
  behind: number
  files: DiffFile[]
  error?: string
}

export type ApplyAction = 'accept' | 'revert' | 'unstage'

/** POST {applyPath} request body. */
export interface ApplyRequest {
  /** Absolute workspace directory (must be inside a git repo). */
  cwd: string
  /** accept = stage the change(s); revert = discard the change(s); unstage = move back to the worktree. */
  action: ApplyAction
  /** Repo-relative path; absent = apply to every changed file. */
  path?: string
}

export interface ApplyResponse {
  ok: boolean
  /** Untracked files deleted by a revert-all (for the client notice). */
  deleted?: string[]
  error?: string
}

/** POST {applyHunkPath} request body — one hunk of one file. */
export interface ApplyHunkRequest {
  /** Absolute workspace directory (must be inside a git repo). */
  cwd: string
  /** Repo-relative path. */
  path: string
  /** accept = stage the hunk; revert = discard it; unstage = move it back to the worktree. */
  action: ApplyAction
  /** The hunk text starting with the `@@` line (see DiffHunk). */
  hunk: string
}

export interface ApplyHunkResponse {
  ok: boolean
  error?: string
}

export type GitAction = 'commit' | 'push'

/** POST {commitPath} / {pushPath} request body. */
export interface GitRequest {
  /** Absolute workspace directory (must be inside a git repo). */
  cwd: string
  /** Commit message (commit only). */
  message?: string
}

export interface GitResponse {
  ok: boolean
  /** Short commit hash (commit only). */
  hash?: string
  /** Commit subject (commit only). */
  subject?: string
  /** Push output (push only). */
  output?: string
  error?: string
}

/** One commit in the history timeline. */
export interface CommitInfo {
  /** Full hash. */
  hash: string
  /** Short hash (7+ chars). */
  short: string
  /** Author name. */
  author: string
  /** Author date, ISO 8601. */
  date: string
  /** Commit subject. */
  subject: string
  /** True when the commit is not on the remote (unpushed). */
  ahead: boolean
}

/** GET {historyPath}?cwd=… response — the recent commit timeline. */
export interface HistoryResponse {
  ok: boolean
  commits: CommitInfo[]
  error?: string
}

/** GET {commitDiffPath}?cwd=…&hash=… response. */
export interface CommitDiffResponse {
  ok: boolean
  /** Short hash echoed back. */
  short?: string
  subject?: string
  /** Unified diff of the commit (git show --format=). */
  diff: string
  /** Per-file stats. */
  files: { path: string; status: string; added: number; deleted: number }[]
  /** Total added lines across the commit. */
  added: number
  /** Total deleted lines across the commit. */
  deleted: number
  error?: string
}

/** One inline comment anchored to a diff line of a workspace file. */
export interface ReviewComment {
  /** Client-generated id (crypto.randomUUID). */
  id: string
  /** Repo-relative path. */
  path: string
  /** Post-change line number (1-based), or null for a pure deletion. */
  lineNew: number | null
  /** Pre-change line number (1-based), or null for a pure addition. */
  lineOld: number | null
  text: string
  /** ISO 8601 timestamp. */
  createdAt: string
  /**
   * Which review tab created it: 'session' comments anchor to the session
   * hunks' RELATIVE line counts (no real line numbers in the session log),
   * 'workspace' comments anchor to real file lines. Used to route jumps to
   * the right tab. Absent on comments written by older versions.
   */
  source?: 'session' | 'workspace'
}

/** GET {commentsPath}?cwd=… response. */
export interface CommentsResponse {
  ok: boolean
  comments: ReviewComment[]
  error?: string
}

/** POST {commentsPath} request body — replace the whole comment list. */
export interface CommentsRequest {
  cwd: string
  comments: ReviewComment[]
}

// ---------------------------------------------------------------------------
// AI review (/review).
// ---------------------------------------------------------------------------

export type ReviewPriority = 'P0' | 'P1' | 'P2' | 'P3'

/** One-line summary of an AI review run (panel state). */
export type ReviewSummary = { verdict: 'correct' | 'incorrect'; count: number }

/** One structured finding produced by the review model. */
export interface ReviewFinding {
  priority: ReviewPriority
  /** Short imperative title (≤80 chars). */
  title: string
  detail: string
  /** Repo-relative path (must be in the reviewed file set). */
  file: string
  /** New-file line range (1-based). */
  lineStart: number
  lineEnd: number
  /** Model confidence 0–1. */
  confidence: number
  /** Optional replacement code. */
  suggestion?: string
}

/** POST {reviewPath} request body. */
export interface ReviewRequest {
  /** Absolute workspace directory (must be inside a git repo). */
  cwd: string
  /** Session id used to resolve the current model (fallback: config reviewModel). */
  sessionId?: string
  /** uncommitted (default) | branch | commit. */
  scope?: 'uncommitted' | 'branch' | 'commit'
  /** Base branch for scope 'branch'. */
  base?: string
  /** Commit hash for scope 'commit'. */
  commitHash?: string
  /** Extra review instructions (e.g. "focus on security"). */
  instructions?: string
}

export interface ReviewResponse {
  ok: boolean
  verdict?: 'correct' | 'incorrect'
  findings: ReviewFinding[]
  /** Model used for the review. */
  model?: { provider: string; model: string }
  /** True when the diff fed to the model was truncated. */
  truncated?: boolean
  error?: string
}

// ---------------------------------------------------------------------------
// GitHub PR context (gh CLI).
// ---------------------------------------------------------------------------

/** One GitHub PR review comment (inline or general). */
export interface PrComment {
  /** Stable id (gh comment id). */
  id: string
  /** Author login. */
  author: string
  body: string
  /** Repo-relative path for inline comments, null for general comments. */
  path?: string | null
  /** New-file line for inline comments. */
  line?: number | null
  /** ISO date. */
  createdAt: string
}

/** GET {prPath}?cwd=… response — the current branch's PR context. */
export interface PrResponse {
  ok: boolean
  /** Present when a PR exists for the current branch. */
  pr?: { number: number; title: string; url: string; author: string; state: string; body?: string }
  comments: PrComment[]
  /** Reason when no PR / no gh / gh not authed. */
  error?: string
}

// ---------------------------------------------------------------------------
// Multi-repo detection.
// ---------------------------------------------------------------------------

/** GET {reposPath}?cwd=… response — git repos under a workspace. */
export interface ReposResponse {
  ok: boolean
  repos: { path: string; branch: string | null }[]
  error?: string
}
