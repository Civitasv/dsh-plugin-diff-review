import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')
const types = readFileSync(new URL('../src/shared/types.ts', import.meta.url), 'utf8')
const explicitScopeKeys = /export type ReviewCommentScope = 'unstaged' \| 'staged' \| 'branch' \| 'last-turn'/.test(types)
const storesScope = /const commentScope: ReviewCommentScope =/.test(source)
  && /scope: commentScope/.test(source)
const restoresScope = /const commentScope = focus\.scope \?\? \(focus\.tab === 'session' \? 'last-turn' : 'unstaged'\)/.test(source)
  && /setScope\(commentScope\)/.test(source)
const resolvesLastTurnPath = /const lastTurnPath = lastTurnFiles\.find\(\(file\) => file\.path === focus\.path \|\| repoRelativePath\(file\.path, activeCwd\) === focus\.path\)\?\.path \?\? focus\.path/.test(source)
  && /setSelected\(lastTurnPath\)/.test(source)
const renderedScroll = /const target = document\.querySelector\(`\[data-dsdr-line="\$\{jumpLine\}"\]`\)/.test(source)
const noScopeInference = !/pendingWorkspaceFocus|isLastTurnTarget/.test(source)

const correct = explicitScopeKeys && storesScope && restoresScope && resolvesLastTurnPath && renderedScroll && noScopeInference
console.log(`${correct ? 'PASS' : 'FAIL'}  comment links restore their explicit review scope and scroll after the diff renders`)
process.exitCode = correct ? 0 : 1
