import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')

const keepsTreeForSamePaths = /function usePathStableTree<T>\([\s\S]*?const signature = items\.map\(pathOf\)\.sort\(\)\.join\('\\n'\)[\s\S]*?return cache\.current\.tree/.test(source)
const lastTurnUsesStableTree = /const lastTurnTree = usePathStableTree\(lastTurnFiles, \(file\) => file\.path\)/.test(source)
  && /scope === 'last-turn' \? lastTurnTree : buildFileTree\(scopeFiles, \(f\) => f\.path\)/.test(source)
const memoizesStableTree = /const StableFileTreeView = memo\(FileTreeView/.test(source)
  && /prev\.nodes === next\.nodes[\s\S]*?prev\.activePath === next\.activePath/.test(source)
const lastTurnTracksSelection = /scope === 'last-turn' \? \([\s\S]*?<StableFileTreeView[\s\S]*?activePath=\{selected\}/.test(source)
// Files tab: same fix as the Last-turn tree — the workspace file list is
// cached by path signature and rendered through the memoized tree view, so
// streaming re-renders of the overlay do not recycle react-arborist rows.
const filesUsesStableTree = /const tree = usePathStableTree\(shown, \(file\) => file\.path\)/.test(source)
  && /<StableFileTreeView\s+nodes=\{tree\}\s+collapsed=\{collapsed\}\s+onToggleDir=\{onToggleDir\}\s+depth=\{0\}\s+fillHeight\s+activePath=\{selected\}/.test(source)

const correct = keepsTreeForSamePaths && lastTurnUsesStableTree && memoizesStableTree && lastTurnTracksSelection && filesUsesStableTree
console.log(`${correct ? 'PASS' : 'FAIL'}  streaming updates preserve the Last Turn and Files file-tree DOM when paths are unchanged`)
process.exitCode = correct ? 0 : 1
