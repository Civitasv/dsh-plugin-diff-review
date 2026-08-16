import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')
const usesScopeStats = /const scopeAdded = scopeFiles\.reduce\(\(n, f\) => n \+ f\.added, 0\)/.test(source)
  && /const scopeDeleted = scopeFiles\.reduce\(\(n, f\) => n \+ f\.deleted, 0\)/.test(source)
const usesCommitStats = /const subtitleAdded = scope === 'commit' && selectedCommit && commitDiff\?\.ok \? commitDiff\.added : scopeAdded/.test(source)
  && /const subtitleDeleted = scope === 'commit' && selectedCommit && commitDiff\?\.ok \? commitDiff\.deleted : scopeDeleted/.test(source)
  && /t\('review\.changes', \{ added: subtitleAdded, deleted: subtitleDeleted \}\)/.test(source)

const correct = usesScopeStats && usesCommitStats
console.log(`${correct ? 'PASS' : 'FAIL'}  toolbar line statistics follow the selected scope, including commits`)
process.exitCode = correct ? 0 : 1
