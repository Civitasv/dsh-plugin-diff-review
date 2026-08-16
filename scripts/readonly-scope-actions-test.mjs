import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')
const leaf = source.match(/const workspaceLeaf = \([\s\S]*?\n  \)/)?.[0] ?? ''
const actionsAreGuarded = /\{allowActions \? <span className="dsdr-file-actions">/.test(leaf)
const stagedUsesUnstage = /file\.staged \? <button[\s\S]*?title=\{t\('hunk\.unstage'\)\}[\s\S]*?runApply\('unstage', file\.path\)[\s\S]*?: <button[\s\S]*?title=\{t\('hunk\.stage'\)\}[\s\S]*?runApply\('accept', file\.path\)/.test(leaf)
const revertOnlyAppliesToUnstaged = /\{!file\.staged \? <button[\s\S]*?title=\{t\('hunk\.revert'\)\}[\s\S]*?runApply\('revert', file\.path\)/.test(leaf)

const correct = actionsAreGuarded && stagedUsesUnstage && revertOnlyAppliesToUnstaged
console.log(`${correct ? 'PASS' : 'FAIL'}  file actions match their staged or unstaged layer`)
process.exitCode = correct ? 0 : 1
