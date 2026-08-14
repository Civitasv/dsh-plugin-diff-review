/**
 * Generate README screenshots of the diff-review overlay.
 *
 * Renders a faithful static mock of the review panel (workspace pane +
 * history timeline + commit detail) styled with the same --dsw-* tokens and
 * captures it with headless Chrome into docs/screenshots/.
 *
 * Usage: node scripts/gen-screenshots.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = join(root, 'docs', 'screenshots')
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
mkdirSync(outDir, { recursive: true })

const TOKENS = `
  --dsw-alias-bg-module-platform:#f2f3f5;
  --dsw-alias-bg-base:#fbfbfc;
  --dsw-alias-bg-layer-1:#ffffff;
  --dsw-alias-bg-layer-2:#ffffff;
  --dsw-alias-bg-layer-3:#ffffff;
  --dsw-alias-border-l1:rgba(0,0,0,.04);
  --dsw-alias-border-l2:rgba(0,0,0,.1);
  --dsw-alias-label-primary:#1b1b1c;
  --dsw-alias-label-secondary:#5f6064;
  --dsw-alias-label-tertiary:#9b9da3;
  --dsw-alias-interactive-bg-hover:rgba(38,49,72,.06);
  --dsw-alias-fill-l2:#e5e7eb;
  --dsw-alias-state-success-primary:#1f9d55;
  --dsw-alias-state-warn-primary:#c98a00;
  --dsw-static-neutral-bluish-400:#adb1b8;
  --dsw-static-neutral-bluish-50:#f9fafb;
  --dsw-static-neutral-bluish-900:#1b1b1c;
`

const COMMON_CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;font-size:13px;line-height:1.55;background:#e8eaed;color:var(--dsw-alias-label-primary);display:flex;align-items:center;justify-content:center;height:100vh}
  .panel{width:1120px;height:700px;background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:0 24px 64px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden}
  .head{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
  .title{font-size:14px;font-weight:600}
  .tabs{display:flex;gap:4px;margin-left:14px}
  .tab{min-height:26px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);padding:2px 10px;font-size:12px;line-height:18px;cursor:default}
  .tab.active{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
  .subtitle{color:var(--dsw-alias-label-tertiary);font-size:12px;font-family:ui-monospace,Menlo,Consolas,monospace}
  .spacer{flex:1}
  .btn{min-height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);padding:3px 10px;font-size:12px;line-height:18px;display:inline-flex;align-items:center;gap:5px;cursor:default}
  .btn.primary{border-color:var(--dsw-static-neutral-bluish-400);color:var(--dsw-alias-label-primary)}
  .btn.danger{color:var(--dsw-alias-state-warn-primary)}
  .commit-input{width:190px;min-height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);padding:3px 10px;font-size:12px}
  .commit-input::placeholder{color:var(--dsw-alias-label-tertiary)}
  .body{display:flex;flex:1;min-height:0}
  .files{width:340px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow:hidden;padding:6px 8px}
  .section{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);padding:9px 8px 3px;font-weight:600}
  .section:first-child{padding-top:4px}
  .dir{display:flex;align-items:center;gap:5px;width:100%;border-radius:7px;padding:4px 8px;color:var(--dsw-alias-label-secondary);font-size:12px;cursor:default}
  .dir .caret{width:12px;text-align:center;font-size:10px;color:var(--dsw-alias-label-tertiary)}
  .dir .name{flex:1;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dir .count{font-size:10px;color:var(--dsw-alias-label-tertiary)}
  .file{display:flex;align-items:center;gap:8px;width:100%;border-radius:8px;padding:5px 8px;color:var(--dsw-alias-label-primary);font-size:12px;cursor:default}
  .file.selected{background:var(--dsw-alias-interactive-bg-hover)}
  .file .chip{flex:none;min-width:22px;text-align:center;border-radius:5px;font-size:11px;line-height:16px;padding:0 4px;font-family:ui-monospace,Menlo,Consolas,monospace}
  .chip.m{background:rgba(46,160,67,.16);color:#2ea043}
  .chip.u{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
  .file .fname{flex:1;min-width:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .file .stat{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
  .timeline{display:flex;flex-direction:column}
  .tl-item{display:flex;gap:6px;align-items:stretch}
  .tl-item.selected .commit{background:var(--dsw-alias-interactive-bg-hover)}
  .tl-rail{position:relative;flex:none;width:14px;display:flex;justify-content:center}
  .tl-rail::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--dsw-alias-border-l2)}
  .tl-dot{position:relative;z-index:1;top:8px;flex:none;width:7px;height:7px;border-radius:50%;border:1px solid var(--dsw-alias-bg-module-platform)}
  .tl-dot.local{background:var(--dsw-alias-state-success-primary)}
  .tl-dot.remote{background:var(--dsw-alias-label-tertiary)}
  .commit{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;border-radius:8px;padding:4px 8px;font-size:12px;cursor:default}
  .commit .chead{display:flex;align-items:center;gap:6px;min-width:0}
  .commit .badge{flex:none;font-size:10px;line-height:14px;border-radius:4px;padding:0 5px}
  .badge.local{background:rgba(46,160,67,.16);color:#2ea043}
  .badge.remote{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
  .commit .short{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,Menlo,Consolas,monospace}
  .commit .subject{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .commit .meta{font-size:11px;color:var(--dsw-alias-label-tertiary)}
  .branch{display:flex;align-items:center;gap:8px;padding:4px 8px 8px;flex-wrap:wrap}
  .branch .ref{font-size:12px;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,Menlo,Consolas,monospace;display:inline-flex;align-items:center;gap:5px}
  .branch .arrow{color:var(--dsw-alias-label-tertiary)}
  .branch .stat{display:inline-flex;gap:6px;font-size:11px}
  .branch .ahead{color:#2ea043}
  .branch .push{min-height:26px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);padding:2px 10px;font-size:12px;cursor:default}
  .diff{flex:1;min-width:0;overflow:hidden;display:flex;flex-direction:column}
  .dhead{display:flex;align-items:center;gap:10px;padding:6px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
  .dpath{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dpath .hash{margin-left:8px;font-size:11px;color:var(--dsw-alias-label-tertiary)}
  .dstat{font-size:12px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
  .toggle{display:inline-flex;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;overflow:hidden}
  .toggle span{font-size:11px;padding:2px 8px;color:var(--dsw-alias-label-tertiary)}
  .toggle span.on{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
  .fhead{display:flex;align-items:center;gap:10px;padding:7px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
  .fhead .chip{min-width:22px;text-align:center;border-radius:5px;font-size:11px;line-height:16px;padding:0 4px;font-family:ui-monospace,Menlo,Consolas,monospace;background:rgba(46,160,67,.16);color:#2ea043}
  .fhead .fpath{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .scroll{flex:1;overflow:hidden;padding:4px 0}
  .pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.6}
  .line{white-space:pre;padding:0 16px}
  .line.add{background:rgba(46,160,67,.14)}
  .line.del{background:rgba(248,81,73,.14)}
  .line.hunk{color:var(--dsw-alias-label-tertiary)}
  .line.file{color:var(--dsw-alias-label-tertiary)}
`

/** One file row in a section tree. */
function fileRow(path, name, chip, chipClass, stat, selected = false, indent = 0) {
  return `<div class="file${selected ? ' selected' : ''}" style="padding-left:${8 + indent * 14}px">
    <span class="chip ${chipClass}">${chip}</span>
    <span class="fname" title="${path}">${name}</span>
    <span class="stat">${stat}</span>
  </div>`
}

/** A directory row. */
function dirRow(name, count, indent) {
  return `<div class="dir" style="padding-left:${8 + indent * 14}px"><span class="caret">▾</span><span class="name">${name}</span><span class="count">${count}</span></div>`
}

/** One timeline commit row. */
function timelineRow(short, subject, author, time, badge, dotClass, selected = false) {
  return `<div class="tl-item${selected ? ' selected' : ''}">
    <div class="tl-rail"><span class="tl-dot ${dotClass}"></span></div>
    <div class="commit">
      <div class="chead"><span class="badge ${badge}">${badge === 'local' ? '本地' : '远程'}</span><span class="short">${short}</span><span class="subject" title="${subject}">${subject}</span></div>
      <div class="meta">${author} · ${time}</div>
    </div>
  </div>`
}

const DIFF_ROWS = [
  ['hunk', '@@ -24,7 +24,7 @@ export function loadWorkspace(cwd: string) {'],
  ['ctx', '   setError(null)'],
  ['ctx', '   try {'],
  ['ctx', '     const [next, hist] = await Promise.all([loadStatus(cwd), loadHistory(cwd)])'],
  ['add', '+    setStatus(next)'],
  ['add', '+    if (hist.ok) setHistory(hist.commits)'],
  ['ctx', '     setSelected(prev => prev && next.files.some(f => f.path === prev) ? prev : next.files[0]?.path ?? null)'],
  ['del', '-    setSelected(next.files[0]?.path ?? null)'],
  ['ctx', '   } catch (e) {'],
  ['ctx', '     setError(e instanceof Error ? e.message : String(e))'],
]
function diffRows(rows) {
  return rows.map(([kind, text]) => `<div class="line ${kind}">${text.replace(/</g, '&lt;')}</div>`).join('\n')
}

/** View 1: workspace pane with sections + timeline + file diff. */
function workspacePage() {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>:root{${TOKENS}}${COMMON_CSS}</style></head><body>
<div class="panel">
  <div class="head">
    <span class="title">变动</span>
    <span class="tabs"><span class="tab">会话更改</span><span class="tab active">工作区</span></span>
    <span class="subtitle">main · 9+ 3- · 领先 2</span>
    <span class="spacer"></span>
    <span class="btn primary">全部采纳</span>
    <span class="btn danger">全部丢弃</span>
    <input class="commit-input" placeholder="提交说明…" value="feat: 自动刷新工作区">
    <span class="btn primary" style="color:#1f9d55">提交</span>
    <span class="btn">✕</span>
  </div>
  <div class="body">
    <div class="files">
      <div class="section">已暂存 (1)</div>
      <div class="dir" style="padding-left:8px"><span class="caret">▾</span><span class="name">src</span><span class="count">1</span></div>
      ${fileRow('src/server/index.ts', 'index.ts', 'M', 'm', '2+ 1-', true, 1)}
      <div class="section">未暂存 (2)</div>
      <div class="dir" style="padding-left:8px"><span class="caret">▾</span><span class="name">src/client</span><span class="count">1</span></div>
      ${fileRow('src/client/index.tsx', 'index.tsx', 'M', 'm', '9+ 2-', false, 1)}
      ${fileRow('docs/guide.md', 'guide.md', '??', 'u', '新增', false, 0)}
      <div class="section">历史</div>
      <div class="timeline">
        ${timelineRow('d027d50', 'feat: 自动刷新工作区', 'Civitasv', '刚刚', 'local', 'local')}
        ${timelineRow('6f8b99b', 'feat: 本地提交时间线', 'Civitasv', '3 小时前', 'local', 'local')}
        ${timelineRow('39204c4', 'feat: Commit and Push', 'Civitasv', '昨天', 'remote', 'remote')}
        ${timelineRow('b95b0a7', 'init: 初始提交', 'Civitasv', '2 天前', 'remote', 'remote')}
      </div>
      <div class="section">分支与远程</div>
      <div class="branch">
        <span class="ref">main <span class="arrow">→</span> origin/main</span>
        <span class="stat"><span class="ahead">领先 2</span></span>
        <span class="push">推送 (2)</span>
      </div>
    </div>
    <div class="diff">
      <div class="dhead">
        <span class="dpath">src/server/index.ts<span class="hash"></span></span>
        <span class="dstat">9+ 3-</span>
        <span class="toggle"><span>单栏</span><span class="on">双栏</span></span>
        <span class="btn primary" style="padding:2px 10px">采纳</span>
        <span class="btn danger" style="padding:2px 10px">丢弃</span>
      </div>
      <div class="scroll"><pre class="pre">${diffRows(DIFF_ROWS)}</pre></div>
    </div>
  </div>
</div>
</body></html>`
}

/** View 2: commit selected — timeline + changed-file tree + commit diff. */
function commitPage() {  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>:root{${TOKENS}}${COMMON_CSS}</style></head><body>
<div class="panel">
  <div class="head">
    <span class="title">变动</span>
    <span class="tabs"><span class="tab">会话更改</span><span class="tab active">工作区</span></span>
    <span class="subtitle">main · 领先 2</span>
    <span class="spacer"></span>
    <span class="btn primary">全部采纳</span>
    <span class="btn danger">全部丢弃</span>
    <input class="commit-input" placeholder="提交说明…">
    <span class="btn primary">提交</span>
    <span class="btn">✕</span>
  </div>
  <div class="body">
    <div class="files">
      <div class="section">历史</div>
      <div class="timeline">
        ${timelineRow('d027d50', 'feat: 自动刷新工作区', 'Civitasv', '刚刚', 'local', 'local', true)}
        ${timelineRow('6f8b99b', 'feat: 本地提交时间线', 'Civitasv', '3 小时前', 'local', 'local')}
        ${timelineRow('39204c4', 'feat: Commit and Push', 'Civitasv', '昨天', 'remote', 'remote')}
        ${timelineRow('b95b0a7', 'init: 初始提交', 'Civitasv', '2 天前', 'remote', 'remote')}
      </div>
      <div class="section">变动文件 (2)</div>
      <div class="dir" style="padding-left:8px"><span class="caret">▾</span><span class="name">src</span><span class="count">2</span></div>
      ${fileRow('src/server/index.ts', 'index.ts', 'M', 'm', '4+ 2-', true, 1)}
      ${fileRow('src/client/index.tsx', 'index.tsx', 'M', 'm', '12+ 4-', false, 1)}
      <div class="section">分支与远程</div>
      <div class="branch">
        <span class="ref">main <span class="arrow">→</span> origin/main</span>
        <span class="stat"><span class="ahead">领先 2</span></span>
        <span class="push">推送 (2)</span>
      </div>
    </div>
    <div class="diff">
      <div class="dhead">
        <span class="dpath">feat: 自动刷新工作区<span class="hash">d027d50</span></span>
        <span class="dstat" style="color:var(--dsw-alias-label-tertiary)">Civitasv · 刚刚</span>
        <span class="dstat">16+ 6-</span>
        <span class="toggle"><span>单栏</span><span class="on">双栏</span></span>
      </div>
      <div class="fhead">
        <span class="chip">M</span>
        <span class="fpath">src/server/index.ts</span>
        <span class="dstat">4+ 2-</span>
      </div>
      <div class="scroll"><pre class="pre">${diffRows(DIFF_ROWS)}</pre></div>
    </div>
  </div>
</div>
</body></html>`
}

/** View 3: session tab — rounds with per-round file trees + change diff. */
function sessionPage() {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>:root{${TOKENS}}${COMMON_CSS}</style></head><body>
<div class="panel">
  <div class="head">
    <span class="title">变动</span>
    <span class="tabs"><span class="tab active">会话更改</span><span class="tab">工作区</span></span>
    <span class="subtitle">4 轮 · 5 个文件</span>
    <span class="spacer"></span>
    <span class="btn">✕</span>
  </div>
  <div class="body">
    <div class="files">
      <div class="section" style="font-weight:600;color:var(--dsw-alias-label-secondary)">第 4 轮 · 实现自动刷新与历史时间线</div>
      <div class="dir" style="padding-left:8px"><span class="caret">▾</span><span class="name">src</span><span class="count">2</span></div>
      ${fileRow('src/client/index.tsx', 'index.tsx', 'M', 'm', 'diff', true, 1)}
      ${fileRow('src/server/index.ts', 'index.ts', 'M', 'm', 'diff', false, 1)}
      <div class="section" style="font-weight:600;color:var(--dsw-alias-label-secondary)">第 3 轮 · 为提交增加本地历史与 diff</div>
      <div class="dir" style="padding-left:8px"><span class="caret">▾</span><span class="name">src/shared</span><span class="count">1</span></div>
      ${fileRow('src/shared/types.ts', 'types.ts', 'M', 'm', 'diff', false, 1)}
      <div class="section" style="font-weight:600;color:var(--dsw-alias-label-secondary)">第 2 轮 · 支持 Commit 与 Push</div>
      ${fileRow('README.md', 'README.md', 'M', 'm', 'diff', false, 0)}
      <div class="section" style="font-weight:600;color:var(--dsw-alias-label-secondary)">第 1 轮 · 左侧改为文件树</div>
      ${fileRow('package.json', 'package.json', 'M', 'm', 'diff', false, 0)}
    </div>
    <div class="diff">
      <div class="dhead">
        <span class="dpath">src/client/index.tsx</span>
        <span class="dstat">str_replace_editor</span>
        <span class="toggle"><span>单栏</span><span class="on">双栏</span></span>
      </div>
      <div class="scroll"><pre class="pre">${diffRows(DIFF_ROWS)}</pre></div>
    </div>
  </div>
</div>
</body></html>`
}

function capture(htmlPath, pngPath, tag) {
  const userDataDir = `/tmp/dsh-dr-cs-${tag}`
  spawnSync('rm', ['-rf', userDataDir])
  const run = spawnSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1280,800',
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`,
  ], { stdio: 'pipe', timeout: 20000 })
  if (run.status !== 0 && !(run.error && run.error.code === 'ETIMEDOUT')) {
    throw new Error(`chrome failed for ${tag}: ${run.error?.message ?? run.stderr?.toString()}`)
  }
}

for (const [name, html] of [['workspace', workspacePage()], ['commit', commitPage()], ['session', sessionPage()]]) {
  const htmlPath = join(outDir, `${name}.html`)
  const pngPath = join(outDir, `${name}.png`)
  writeFileSync(htmlPath, html)
  capture(htmlPath, pngPath, name)
  spawnSync('rm', ['-f', htmlPath])
  console.log(`generated ${name}.png`)
}
