import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/client/index.tsx', import.meta.url), 'utf8')
let failures = 0

function check(name, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`)
  if (!condition) failures++
}

check('split cells have a visible center divider', /\.dsdr-split-cell\+\.dsdr-split-cell\{[^}]*border-left:/.test(source))
check('changed split cells use Codex-style edge accents', /\.dsdr-cell-add\{[^}]*box-shadow:inset/.test(source) && /\.dsdr-cell-del\{[^}]*box-shadow:inset/.test(source))
check('changed split gutters are tinted with their cell', /\.dsdr-cell-add \.dsdr-split-num\{[^}]*background:/.test(source) && /\.dsdr-cell-del \.dsdr-split-num\{[^}]*background:/.test(source))
check('only the hovered split pane reveals its comment button', /\.dsdr-split-cell:hover \.dsdr-comment-add\{visibility:visible\}/.test(source) && !/\.dsdr-split-row:hover \.dsdr-comment-add/.test(source))
check('each split pane anchors its floating comment button at the line-number gutter', /\.dsdr-split-cell\{[^}]*position:relative/.test(source) && /\.dsdr-split-cell \.dsdr-comment-add\{[^}]*top:0[^}]*left:30px/.test(source))
check('unified and split comment buttons share the Codex-style circular affordance', /\.dsdr-comment-add\{[^}]*border-radius:999px/.test(source) && !/\.dsdr-split-cell \.dsdr-comment-add\{[^}]*border-radius:999px/.test(source))
check('opening a split comment editor hides its floating button', /\.dsdr-split-cell:has\(\.dsdr-comment-editor-draft\) \.dsdr-comment-add\{display:none\}/.test(source) && /className="dsdr-comment-editor dsdr-comment-editor-draft"/.test(source))
check('split comment editors stay inside their owning pane', /\.dsdr-split-cell>\.dsdr-comment-editor\{[^}]*box-sizing:border-box[^}]*flex:0 0 100%/.test(source))

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
process.exitCode = failures === 0 ? 0 : 1
