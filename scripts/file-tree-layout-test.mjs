import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')
let failures = 0

function check(name, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`)
  if (!condition) failures++
}

check('defines one file-tree row-height constant', /const FILE_TREE_ROW_HEIGHT_PX = \d+/.test(source))
check('uses the row-height constant to size non-filling trees', /flatCount \* FILE_TREE_ROW_HEIGHT_PX/.test(source))
check('uses the row-height constant for react-arborist rows', /rowHeight=\{FILE_TREE_ROW_HEIGHT_PX\}/.test(source))

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exitCode = failures === 0 ? 0 : 1
