/**
 * Non-git workspace regression test (Codex-aligned Last turn).
 *
 * Outside a git repository the workspace tab must still show the Last-turn
 * scope: Last turn is client-side session data (collectSessionRounds) and
 * does not need git. Guards this behavior at the source level:
 *   1. the workspace body renders when `!status.isRepo` and scope is
 *      'last-turn' (not only when `status.isRepo`);
 *   2. the scope picker is available on the workspace tab regardless of the
 *      repo, but filters git-backed scopes (Unstaged/Staged/Commit/Branch)
 *      to Last turn when git is unavailable;
 *   3. the scope falls back to 'last-turn' when status loads as non-repo;
 *   4. git-only chrome (repo selector, base-branch select, commit button)
 *      stays hidden outside a repository.
 */
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')

// 1. Workspace body renders for a non-repo workspace when the scope is Last turn.
const bodyRendersForNonRepoLastTurn = /status !== null && \(status\.isRepo \|\| scope === 'last-turn'\)/.test(source)
// 2a. Scope picker shows on the workspace tab without requiring a repo.
const scopePickerNotGatedOnRepo = /\{tab === 'workspace' \? \(\s*<span className="dsdr-scope">/.test(source)
// 2b. The picker receives gitAvailable and filters to Last turn when git is absent.
const pickerGetsGitAvailable = /<ReviewScopeSelect scope=\{scope\} history=\{history\} t=\{t\} gitAvailable=\{status\?\.isRepo === true\}/.test(source)
const pickerFiltersWithoutGit = /const options = gitAvailable \? SCOPE_OPTIONS : SCOPE_OPTIONS\.filter\(\(option\) => option\.id === 'last-turn'\)/.test(source)
const pickerRendersFiltered = /\{options\.map\(\(option\) => option\.id === 'commit' \?/.test(source)
// 3. Scope falls back to Last turn when the workspace is not a repo.
const scopeFallsBackWithoutGit = /if \(status && !status\.isRepo && scope !== 'last-turn'\) setScope\('last-turn'\)/.test(source)
// 4. Git-only chrome stays hidden outside a repository.
const repoSelectorGated = /status\?\.isRepo && repos\.length > 1 \? <ThemeSelect ariaLabel=\{t\('repo\.label'\)\}/.test(source)
const baseBranchGated = /status\?\.isRepo && scope === 'branch' \? <ThemeSelect ariaLabel=\{t\('scope\.base'\)\}/.test(source)
const commitButtonGated = /tab === 'workspace' && status\?\.isRepo \? <button type="button" className="dsdr-btn" disabled=\{busy \|\| \(files\.length === 0 && stagedCount === 0\)\}/.test(source)
// Locale hints mention Last turn still works.
const zhHintMentionsLastTurn = /'review\.notRepoHint': '当前目录不是 git 仓库；「最后一轮」范围与「会话更改」页签仍可查看会话中的修改。'/.test(source)
const enHintMentionsLastTurn = /'review\.notRepoHint': 'This directory is not a git repository; the "Last turn" scope and the "Session" tab still show conversation changes\.'/.test(source)

const correct =
  bodyRendersForNonRepoLastTurn
  && scopePickerNotGatedOnRepo
  && pickerGetsGitAvailable
  && pickerFiltersWithoutGit
  && pickerRendersFiltered
  && scopeFallsBackWithoutGit
  && repoSelectorGated
  && baseBranchGated
  && commitButtonGated
  && zhHintMentionsLastTurn
  && enHintMentionsLastTurn

console.log(`${correct ? 'PASS' : 'FAIL'}  non-git workspace still shows the Last-turn scope (Codex-aligned)`)
process.exitCode = correct ? 0 : 1
