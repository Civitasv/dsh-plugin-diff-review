/**
 * Wire types shared by the diff-review server routes and the browser client.
 */

/** One changed file in the review. */
export interface DiffFile {
  /** Repo-relative path (rename destination for renames). */
  path: string
  /** Original path for renames (the source). */
  origPath?: string
  /** Raw porcelain XY pair (e.g. 'MM', 'A ', ' D', '??', 'R '). */
  xy: string
  /** Human status letter(s): staged + unstaged, e.g. 'M', 'AM', '??'. */
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

export type ApplyAction = 'accept' | 'revert'

/** POST {applyPath} request body. */
export interface ApplyRequest {
  /** Absolute workspace directory (must be inside a git repo). */
  cwd: string
  /** accept = stage the change(s); revert = discard the change(s). */
  action: ApplyAction
  /** Repo-relative path; absent = apply to every changed file. */
  path?: string
}

export interface ApplyResponse {
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

/** One local (not-yet-pushed) commit. */
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
}

/** GET {historyPath}?cwd=… response — commits ahead of the upstream. */
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
