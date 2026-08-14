/**
 * Verifies the session-changes extraction (client pure functions) against
 * realistic conversation snapshots — especially the truncated-window case
 * where the tool `call` head is null but the call/result diff cards survive.
 * Mirrors diffsFromDiffCard / diffsFromMeta / changesFromToolResult /
 * collectSessionRounds / countSessionChanges from src/client/index.tsx
 * (pure functions; the client bundle cannot be imported in node).
 */
let failures = 0
function check(name, cond, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  if (!cond) failures++
}

// ---- mirrored pure functions (kept in sync with src/client/index.tsx) ----

function asFileDiff(raw) {
  if (!raw || typeof raw !== 'object') return null
  const rec = raw
  if (typeof rec.path !== 'string' || !rec.path) return null
  if (typeof rec.newText !== 'string') return null
  const oldText = rec.oldText
  return { path: rec.path, oldText: typeof oldText === 'string' ? oldText : null, newText: rec.newText }
}

function diffsFromDiffCard(view) {
  if (!view || view.card !== 'diff' || !Array.isArray(view.diffs)) return []
  return view.diffs.map(asFileDiff).filter(Boolean)
}

function diffCardTitle(view) {
  if (!view || typeof view !== 'object') return null
  const title = view.title
  return typeof title === 'string' && title.trim() ? title.trim() : null
}

function diffsFromMeta(meta) {
  if (!meta || typeof meta !== 'object') return []
  const diffs = meta.diffs
  if (!Array.isArray(diffs)) return []
  return diffs.map(asFileDiff).filter(Boolean)
}

const MUTATION_TOOLS = new Set(['str_replace_editor', 'notebook_edit'])
const MUTATION_COMMANDS = new Set(['write', 'edit', 'replace', 'delete', 'move'])

function mutationPath(tool, argsRaw) {
  let args = null
  try {
    args = JSON.parse(argsRaw)
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
      if (typeof args[key] === 'string' && args[key]) return args[key]
    }
  }
  return null
}

function changesFromToolResult(call, node) {
  const resultDiffs = diffsFromDiffCard(node.resultView)
  const callDiffs = resultDiffs.length === 0 ? diffsFromDiffCard(node.callView) : []
  const metaDiffs = resultDiffs.length === 0 && callDiffs.length === 0 ? diffsFromMeta(node.meta) : []
  const allDiffs = resultDiffs.length > 0 ? resultDiffs : callDiffs.length > 0 ? callDiffs : metaDiffs
  const tool = call?.name ?? diffCardTitle(node.callView) ?? 'tool'
  if (allDiffs.length > 0) {
    const byPath = new Map()
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

function collectSessionRounds(nodes) {
  const rounds = []
  let current = null
  for (const node of nodes) {
    if (node.kind === 'user') {
      current = { round: rounds.length + 1, label: 'test', changes: [] }
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

function countSessionChanges(nodes) {
  let count = 0
  const seen = new Set()
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

// ---- scenarios ----

// 1. diff card on the RESULT view, call present
const nodeResultDiff = {
  kind: 'tool-result',
  call: { name: 'edit', argsRaw: '{"file_path":"a.ts"}' },
  resultView: { card: 'diff', diffs: [{ path: 'a.ts', oldText: 'one\n', newText: 'one\ntwo\n' }] },
  callView: null,
  meta: null,
}
let rounds = collectSessionRounds([{ kind: 'user', content: [] }, nodeResultDiff])
check('result-view diff extracted', rounds.length === 1 && rounds[0].changes.length === 1 && rounds[0].changes[0].path === 'a.ts' && rounds[0].changes[0].hasDiff)
check('result-view diff hunk carried', rounds[0].changes[0].hunks.length === 1 && rounds[0].changes[0].hunks[0].newText === 'one\ntwo\n')

// 2. KEY FIX: call head truncated (null) but the CALL VIEW diff card survives
const nodeTruncated = {
  kind: 'tool-result',
  call: null,
  callView: { card: 'diff', title: 'Write b.ts', diffs: [{ path: 'b.ts', oldText: null, newText: 'hello\n' }] },
  resultView: null,
  meta: null,
}
rounds = collectSessionRounds([{ kind: 'user', content: [] }, nodeTruncated])
check('truncated call: callView diff extracted', rounds.length === 1 && rounds[0].changes.length === 1 && rounds[0].changes[0].path === 'b.ts' && rounds[0].changes[0].hasDiff)
check('truncated call: tool label from callView title', rounds[0].changes[0].tool === 'Write b.ts')

// 3. no diff anywhere: path-only from a known mutation tool
const nodePathOnly = {
  kind: 'tool-result',
  call: { name: 'str_replace_editor', argsRaw: '{"file_path":"c.ts"}' },
  callView: null,
  resultView: null,
  meta: null,
}
rounds = collectSessionRounds([{ kind: 'user', content: [] }, nodePathOnly])
check('path-only fallback', rounds.length === 1 && rounds[0].changes.length === 1 && rounds[0].changes[0].path === 'c.ts' && !rounds[0].changes[0].hasDiff)

// 4. meta.diffs fallback (no views)
const nodeMeta = {
  kind: 'tool-result',
  call: { name: 'write', argsRaw: '{}' },
  callView: null,
  resultView: null,
  meta: { diffs: [{ path: 'd.ts', oldText: null, newText: 'x\n' }] },
}
rounds = collectSessionRounds([{ kind: 'user', content: [] }, nodeMeta])
check('meta.diffs fallback', rounds.length === 1 && rounds[0].changes.length === 1 && rounds[0].changes[0].path === 'd.ts')

// 5. nothing known -> skipped entirely
const nodeBash = { kind: 'tool-result', call: { name: 'bash', argsRaw: '{"command":"echo hi"}' }, callView: null, resultView: null, meta: null }
rounds = collectSessionRounds([{ kind: 'user', content: [] }, nodeBash])
check('unrelated tool skipped', rounds.length === 0)

// 6. count (badge) counts distinct tool:path, including truncated calls
const count = countSessionChanges([{ kind: 'user', content: [] }, nodeResultDiff, nodeTruncated, nodePathOnly, nodeBash])
check('count distinct tool:path', count === 3, String(count))

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
