/**
 * Review-package parsing for the Codex-style conversation card.
 *
 * The plugin injects the pending inline comments (plus their diff hunks and
 * the optional AI verdict) as one plain user message. This module re-parses
 * that message text so the conversation can render it as a card — each
 * comment clickable to jump to the matching change block in the review panel.
 *
 * Pure functions only: the client bundle cannot be imported in node, so the
 * unit test (scripts/review-package-test.mjs) bundles this module with esbuild
 * and exercises the exact same code the browser runs.
 */

export interface ReviewPackageComment {
  /** Repo-relative path (same as the section header path). */
  path: string
  /** Post-change line (1-based); null when only the old-line anchor exists. */
  line: number | null
  /** Comment text. */
  text: string
  /**
   * Origin review tab, carried in the message as a `[s]`/`[w]` tag so the
   * card can route its jump: 'session' anchors to relative hunk lines,
   * 'workspace' to real file lines. Absent on older messages.
   */
  source?: 'session' | 'workspace'
}

export interface ReviewPackageFinding {
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  file: string
  line: number
  title: string
  detail: string
}

export interface ReviewPackage {
  /** Workspace root embedded in the message (工作区：...), when present. */
  workspace: string | null
  comments: ReviewPackageComment[]
  verdict: 'correct' | 'incorrect' | null
  findings: ReviewPackageFinding[]
}

/** First non-empty line of the message (the message header line). */
const REVIEW_PREFIX = '请处理以下针对当前工作区的行内评审评论'

/** @returns true when the text is a carried review package (card-worthy). */
export function isReviewPackageText(text: string): boolean {
  const first = firstNonEmptyLine(text)
  return first !== null && first.startsWith(REVIEW_PREFIX)
}

function firstNonEmptyLine(text: string): string | null {
  for (const raw of text.split('\n')) {
    const t = raw.trim()
    if (t !== '') return t
  }
  return null
}

/**
 * Parse a carried review-package message back into structured data.
 * Returns null when the text is not a review package (plain user message).
 */
export function parseReviewPackage(text: string): ReviewPackage | null {
  if (!isReviewPackageText(text)) return null
  const pkg: ReviewPackage = { workspace: null, comments: [], verdict: null, findings: [] }
  const lines = text.split('\n')
  let i = 0

  // 1. header line (the prefix) — already matched by isReviewPackageText.
  while (i < lines.length) {
    const t = lines[i].trim()
    i += 1
    if (t !== '') break
  }

  // 2. optional workspace line right after the header.
  while (i < lines.length) {
    const t = lines[i].trim()
    if (t === '') {
      i += 1
      continue
    }
    const w = /^工作区[:：]\s*(.+)$/.exec(t)
    if (w) {
      pkg.workspace = w[1].trim() || null
      i += 1
    }
    break
  }

  // 3. sections: `## <path>` (comments + optional ```diff hunk) and
  //    `## AI 评审结论` (verdict + findings).
  let section: string | null = null
  for (; i < lines.length; i++) {
    const raw = lines[i]
    const t = raw.trim()
    if (t === '') continue
    if (t.startsWith('## ')) {
      const title = t.slice(3).trim()
      section = title === 'AI 评审结论' ? 'verdict' : title
      continue
    }
    if (t.startsWith('```')) {
      // diff fence or suggestion fence — consume until the closing fence.
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) i += 1
      continue
    }
    if (section === 'verdict') {
      if (/补丁存在问题/.test(t) || /patch is incorrect/i.test(t)) pkg.verdict = 'incorrect'
      else if (/补丁正确/.test(t) || /patch is correct/i.test(t)) pkg.verdict = 'correct'
      const f = /^-\s*\[(P[0-3])\]\s*(.+?):(\d+)(?:-(\d+))?\s+(.+?)(?:\s*—\s*(.*))?$/.exec(t)
      if (f) {
        pkg.findings.push({ priority: f[1] as ReviewPackageFinding['priority'], file: f[2], line: Number(f[3]), title: f[5], detail: f[6] ?? '' })
      }
      continue
    }
    if (section !== null && t.startsWith('- ')) {
      let body = t.slice(2).trim()
      // Optional origin-tab tag (`- [s] path:…` / `- [w] path:…`).
      let source: ReviewPackageComment['source']
      const mTag = /^\[([sw])\]\s*(.+)$/.exec(body)
      if (mTag) {
        source = mTag[1] === 's' ? 'session' : 'workspace'
        body = mTag[2].trim()
      }
      const esc = escapeRegex(section)
      // `- <path>:<lineNew>: <text>`
      const mNew = new RegExp(`^${esc}:(\\d+):\\s*(.*)$`).exec(body)
      if (mNew) {
        pkg.comments.push({ path: section, line: Number(mNew[1]), text: mNew[2], source })
        continue
      }
      // `- <path> (old line <lineOld>): <text>`
      const mOld = new RegExp(`^${esc} \\(old line (\\d+)\\):\\s*(.*)$`).exec(body)
      if (mOld) {
        pkg.comments.push({ path: section, line: null, text: mOld[2], source })
      }
    }
  }
  return pkg
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
