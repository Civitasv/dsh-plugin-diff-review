import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')

const targetsAssistantOutput = /row\?\.dataset\.chatFlowKind !== 'user' && row\?\.dataset\.chatFlowKind !== 'steering'/.test(source)
const installsAtStartup = /function installAssistantQuoteAction\(ctx: ClientContext\)/.test(source)
  && /ctx\.effect\(\(\) => installAssistantQuoteAction\(ctx\)/.test(source)
const appendsToComposer = /composerDraftStore\.update\(\(draft\) => \{[\s\S]*?draft\.text = `> \$\{text\}`/.test(source)
const watchesNativeSelection = /document\.addEventListener\('selectionchange', schedule\)/.test(source)
const rendersAtDocumentRoot = /document\.body\.append\(popup\)/.test(source)
const internalQuotesRemoved = !/function CodeEditor\(\{ path, value, onChange, onQuote \}/.test(source)
  && !/const quoteToChat =/.test(source)

const correct = targetsAssistantOutput && installsAtStartup && appendsToComposer && watchesNativeSelection && rendersAtDocumentRoot && internalQuotesRemoved
console.log(`${correct ? 'PASS' : 'FAIL'}  selecting assistant output offers Add to conversation and appends a quote to the composer`)
process.exitCode = correct ? 0 : 1
