export type UnifiedDiffRow = {
  kind: 'add' | 'del' | 'ctx' | 'hunk' | 'file' | 'note'
  text: string
}

export type UnifiedRowWithLines = {
  row: UnifiedDiffRow
  oldLine: number | null
  newLine: number | null
}

function hunkStarts(head: string): { oldStart: number; newStart: number } {
  const match = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(head)
  return { oldStart: match ? Number(match[1]) : 1, newStart: match ? Number(match[2]) : 1 }
}

export function gitRowsWithLines(diff: string): UnifiedRowWithLines[] {
  let oldLine = 1
  let newLine = 1
  return diff.split('\n').map((text) => {
    const row = text.startsWith('+++') || text.startsWith('---')
      ? { kind: 'file' as const, text }
      : text.startsWith('@@')
        ? { kind: 'hunk' as const, text }
        : text.startsWith('+')
          ? { kind: 'add' as const, text }
          : text.startsWith('-')
            ? { kind: 'del' as const, text }
            : text.startsWith('\\ ')
              ? { kind: 'note' as const, text }
              : { kind: 'ctx' as const, text }
    if (row.kind === 'hunk') {
      const starts = hunkStarts(text)
      oldLine = starts.oldStart
      newLine = starts.newStart
      return { row, oldLine: null, newLine: null }
    }
    if (row.kind === 'ctx') return { row, oldLine: oldLine++, newLine: newLine++ }
    if (row.kind === 'del') return { row, oldLine: oldLine++, newLine: null }
    if (row.kind === 'add') return { row, oldLine: null, newLine: newLine++ }
    return { row, oldLine: null, newLine: null }
  })
}
