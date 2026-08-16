import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')

const keepsTreeForSamePaths = /function usePathStableTree<T>\([\s\S]*?const signature = items\.map\(pathOf\)\.sort\(\)\.join\('\\n'\)[\s\S]*?return cache\.current\.tree/.test(source)
const lastTurnUsesStableTree = /const lastTurnTree = usePathStableTree\(lastTurnFiles, \(file\) => file\.path\)/.test(source)
  && /scope === 'last-turn' \? lastTurnTree : buildFileTree\(scopeFiles, \(f\) => f\.path\)/.test(source)
const memoizesStableTree = /const StableFileTreeView = memo\(FileTreeView/.test(source)
  && /prev\.nodes === next\.nodes[\s\S]*?prev\.activePath === next\.activePath/.test(source)
const lastTurnTracksSelection = /scope === 'last-turn' \? \([\s\S]*?<StableFileTreeView[\s\S]*?activePath=\{selected\}/.test(source)

const correct = keepsTreeForSamePaths && lastTurnUsesStableTree && memoizesStableTree && lastTurnTracksSelection
console.log(`${correct ? 'PASS' : 'FAIL'}  streaming updates preserve the Last Turn file-tree DOM when paths are unchanged`)
process.exitCode = correct ? 0 : 1
