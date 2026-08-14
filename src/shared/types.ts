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
