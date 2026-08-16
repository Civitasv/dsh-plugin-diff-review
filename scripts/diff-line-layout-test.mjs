import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')
const rule = source.match(/\.dsdr-line\{([^}]*)\}/)?.[1] ?? ''
let failures = 0

function check(name, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`)
  if (!condition) failures++
}

check('diff lines fill the visible scroll width', rule.includes('min-width:100%'))
check('diff lines expand with long unwrapped text', rule.includes('width:max-content'))

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exitCode = failures === 0 ? 0 : 1
