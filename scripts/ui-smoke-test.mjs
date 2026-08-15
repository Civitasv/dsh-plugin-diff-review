/**
 * Browser-level smoke test against a running DSH web GUI.
 *
 * It deliberately uses Chrome DevTools Protocol instead of a DOM emulator:
 * the plugin is loaded by DSH's module host, and these checks exercise the
 * real overlay, event listeners, virtual file tree, and dynamic Files tabs.
 *
 * Prerequisites:
 *   1. Start DSH web with this plugin installed.
 *   2. Provide a persisted DSH conversation (the runner uses an isolated
 *      browser profile). Usually it finds the newest local session; set
 *      DSH_SESSION_ID explicitly when that is not the intended session.
 *   3. npm run test:ui
 *
 * Optional environment variables:
 *   DSH_WEB_URL=http://127.0.0.1:3080/
 *   DSH_SESSION_ID=session-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *   DSH_WORKSPACE=E:\\DeepSeekHarnessPlugins\\dsh-plugin-diff-review
 *   CHROME_BIN=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const WEB = process.env.DSH_WEB_URL ?? 'http://127.0.0.1:3080/'
const PORT = Number(process.env.DSH_CDP_PORT ?? 9231)
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SESSIONS_ROOT = join(homedir(), '.dsh', 'sessions')
const WORKSPACE_NAME = process.env.DSH_WORKSPACE_NAME ?? ROOT.split(/[\\/]/).at(-1) ?? 'dsh-plugin-diff-review'
const profile = mkdtempSync(join(tmpdir(), 'dsdr-ui-smoke-'))
const chromeCandidates = [
  process.env.CHROME_BIN,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].filter((path) => typeof path === 'string' && path.length > 0)
const chromeBin = chromeCandidates.find((path) => existsSync(path))

if (!chromeBin) {
  throw new Error('Chrome/Edge not found. Set CHROME_BIN to a Chromium executable.')
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let ws
let messageId = 0
const pending = new Map()
let failures = 0

function check(name, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
  if (!condition) failures++
}

/** Restore the newest persisted session for this workspace in the clean test profile. */
function latestSessionId(workspace) {
  const folder = `--${workspace.replace(/[:\\/]+/g, '-').replace(/^-+/, '')}--`
  const base = join(SESSIONS_ROOT, folder)
  let latest = null
  try {
    for (const entry of readdirSync(base)) {
      if (!entry.startsWith('session-')) continue
      const full = join(base, entry)
      const stat = statSync(full)
      if (!stat.isDirectory() || !latest || stat.mtimeMs > latest.mtimeMs) latest = { id: entry, mtimeMs: stat.mtimeMs }
    }
  } catch { /* the caller will receive the normal missing-session guidance */ }
  return latest?.id ?? null
}

function send(method, params = {}) {
  const id = ++messageId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(`browser evaluation failed: ${JSON.stringify(result.exceptionDetails).slice(0, 400)}`)
  return result.result?.value
}

async function waitFor(expression, label, timeoutMs = 20_000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return true
    await sleep(150)
  }
  check(label, false, `timed out after ${timeoutMs}ms`)
  return false
}

async function click(selector) {
  return evaluate(`(() => { const node = document.querySelector(${JSON.stringify(selector)}); if (!node) return false; node.click(); return true })()`)
}

async function main() {
  console.log(`Launching ${chromeBin} against ${WEB}`)
  const chrome = spawn(chromeBin, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${PORT}`,
    '--window-size=1440,960',
    WEB,
  ], { stdio: 'ignore' })

  try {
    let target = null
    for (let i = 0; i < 80; i++) {
      try {
        const pages = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
        target = pages.find((page) => page.type === 'page') ?? null
        if (target) break
      } catch { /* browser is still starting */ }
      await sleep(250)
    }
    if (!target) throw new Error(`Unable to open ${WEB} in Chromium.`)

    console.log('Connected to browser')
    ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (!message.id || !pending.has(message.id)) return
      const request = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) request.reject(new Error(message.error.message))
      else request.resolve(message.result)
    }
    await send('Runtime.enable')
    await waitFor(`document.readyState === 'complete'`, 'DSH page loaded', 30_000)
    await waitFor(`!!document.querySelector('style[data-plugin-css="dsh-plugin-diff-review/review.css"]')`, 'diff-review plugin loaded', 30_000)
    const pickedWorkspace = await evaluate(`(async () => {
      const trigger = document.querySelector('button[class*=workspace]')
      if (!trigger) return 'no-workspace-picker'
      trigger.click()
      await new Promise((resolve) => setTimeout(resolve, 500))
      const candidates = [...document.querySelectorAll('[role=menuitem], [class*=menu] button, [class*=menu] [role=button]')]
      const item = candidates.find((node) => (node.textContent || '').trim() === ${JSON.stringify(WORKSPACE_NAME)})
      if (!item) return 'workspace-not-listed'
      item.click()
      return 'picked'
    })()`)
    console.log(`Workspace selection: ${pickedWorkspace}`)
    if (pickedWorkspace === 'picked') await sleep(1500)
    const sessionId = process.env.DSH_SESSION_ID ?? latestSessionId(process.env.DSH_WORKSPACE ?? ROOT)
    if (sessionId) {
      console.log(`Restoring session ${sessionId}`)
      await evaluate(`localStorage.setItem('dsh.sessions.current', ${JSON.stringify(sessionId)}); location.reload(); true`)
      await waitFor(`document.readyState === 'complete'`, 'saved session restored', 30_000)
      await waitFor(`!!document.querySelector('style[data-plugin-css="dsh-plugin-diff-review/review.css"]')`, 'plugin restored after session reload', 30_000)
    }
    if (!(await waitFor(`!!document.querySelector('.dsdr-trigger')`, 'conversation change trigger available', 45_000))) {
      throw new Error('No DSH conversation was restored. Set DSH_SESSION_ID to an active session id and rerun test:ui.')
    }

    check('opens review dock', await click('.dsdr-trigger') && await waitFor(`!!document.querySelector('.dsdr-panel-docked')`, 'review dock visible'))

    const reviewResizeResult = await evaluate(`(async () => {
      const list = document.querySelector('.dsdr-body > .dsdr-files')
      const handle = document.querySelector('.dsdr-body > .dsdr-file-tree-resize:not(.dsdr-file-tree-resize-overlay)')
      if (!(list instanceof HTMLElement) || !(handle instanceof HTMLElement)) return { error: 'missing-elements' }
      const before = list.getBoundingClientRect()
      const handleRect = handle.getBoundingClientRect()
      const x = handleRect.left + handleRect.width / 2
      const y = handleRect.top + Math.min(40, handleRect.height / 2)
      const hit = document.elementFromPoint(x, y)
      const cursor = getComputedStyle(handle).cursor
      handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y, pointerId: 1, buttons: 1 }))
      window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x - 40, clientY: y, pointerId: 1, buttons: 1 }))
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: x - 40, clientY: y, pointerId: 1 }))
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      const after = list.getBoundingClientRect()
      return {
        hitHandle: hit === handle || hit?.closest('.dsdr-file-tree-resize') === handle,
        cursor,
        beforeWidth: before.width,
        afterWidth: after.width,
      }
    })()`)
    check('Changes boundary hits its resize handle', reviewResizeResult?.hitHandle === true, JSON.stringify(reviewResizeResult))
    check('Changes boundary shows the resize cursor', reviewResizeResult?.cursor === 'col-resize', reviewResizeResult?.cursor ?? 'missing')
    check('dragging the Changes boundary resizes the tree', Math.abs((reviewResizeResult?.afterWidth ?? 0) - (reviewResizeResult?.beforeWidth ?? 0)) >= 30, JSON.stringify(reviewResizeResult))

    check('hides file tree', await click('[aria-label="Hide file tree"]') && await waitFor(`document.querySelector('.dsdr-panel')?.classList.contains('dsdr-panel-tree-hidden')`, 'tree hidden'))
    check('shows file tree again', await click('[aria-label="Show file tree"]') && await waitFor(`!document.querySelector('.dsdr-panel')?.classList.contains('dsdr-panel-tree-hidden')`, 'tree shown'))

    check('opens jump-to-file menu', await click('[aria-label="Jump to file"]') && await waitFor(`!!document.querySelector('.dsdr-jump-menu')`, 'jump menu visible'))
    check('closes jump-to-file menu', await click('[aria-label="Jump to file"]') && await waitFor(`!document.querySelector('.dsdr-jump-menu')`, 'jump menu hidden'))

    check('collapse-all control is present', Boolean(await evaluate(`document.querySelector('[aria-label="Collapse all diffs"]')`)))

    check('opens Files tab menu', await click('.dsdr-new-tab-btn') && await waitFor(`!!document.querySelector('.dsdr-new-tab-menu')`, 'Files menu visible'))
    await evaluate(`document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))`)
    check('Files tab menu closes outside', await waitFor(`!document.querySelector('.dsdr-new-tab-menu')`, 'Files menu hidden'))

    await click('.dsdr-new-tab-btn')
    const openedFiles = await evaluate(`(() => { const item = document.querySelector('.dsdr-new-tab-menu [role=menuitem]'); if (!item) return false; item.click(); return true })()`)
    check('opens Files browser tab', openedFiles && await waitFor(`!!document.querySelector('.dsdr-files-workspace .dsdr-files-search')`, 'Files browser visible', 30_000))

    const filesResizeResult = await evaluate(`(async () => {
      const list = document.querySelector('.dsdr-files-workspace .dsdr-files-list')
      const handle = document.querySelector('.dsdr-files-workspace .dsdr-file-tree-resize')
      if (!(list instanceof HTMLElement) || !(handle instanceof HTMLElement)) return { error: 'missing-elements' }
      const before = list.getBoundingClientRect()
      const handleRect = handle.getBoundingClientRect()
      const x = handleRect.left + handleRect.width / 2
      const y = handleRect.top + Math.min(40, handleRect.height / 2)
      const hit = document.elementFromPoint(x, y)
      const cursor = getComputedStyle(handle).cursor
      handle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y, pointerId: 1, buttons: 1 }))
      window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x - 40, clientY: y, pointerId: 1, buttons: 1 }))
      window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: x - 40, clientY: y, pointerId: 1 }))
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      const after = list.getBoundingClientRect()
      return {
        handleWidth: handleRect.width,
        hitHandle: hit === handle || hit?.closest('.dsdr-file-tree-resize') === handle,
        cursor,
        beforeWidth: before.width,
        afterWidth: after.width,
      }
    })()`)
    check('Files browser boundary hits the resize handle', filesResizeResult?.hitHandle === true, JSON.stringify(filesResizeResult))
    check('Files browser boundary shows the resize cursor', filesResizeResult?.cursor === 'col-resize', filesResizeResult?.cursor ?? 'missing')
    check('dragging the Files browser boundary resizes the tree', Math.abs((filesResizeResult?.afterWidth ?? 0) - (filesResizeResult?.beforeWidth ?? 0)) >= 30, JSON.stringify(filesResizeResult))

    const treeResult = await evaluate(`(() => {
      const tree = document.querySelector('.dsdr-arborist [role=tree]')
      if (!tree) return 'no-tree'
      tree.scrollTop = 500
      tree.dispatchEvent(new Event('scroll', { bubbles: true }))
      return tree.scrollHeight <= tree.clientHeight || tree.scrollTop > 0 ? 'scrollable' : 'blocked'
    })()`)
    check('virtual file tree can scroll', treeResult === 'scrollable', treeResult)

    const selected = await evaluate(`(() => { const file = document.querySelector('.dsdr-files-item-main'); if (!file) return false; file.click(); return true })()`)
    check('tree file creates a dynamic file tab', selected && await waitFor(`document.querySelectorAll('.dsdr-file-tab').length > 0`, 'file tab visible', 30_000))

    const menuOpened = await evaluate(`(() => { const action = document.querySelector('.dsdr-files-item-menu'); if (!action) return false; action.click(); return true })()`)
    check('file action menu exposes editor command', menuOpened && await waitFor(`!!document.querySelector('.dsdr-files-menu [role=menuitem]')`, 'file action menu visible'))
    check('file action menu closes outside', Boolean(await evaluate(`document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); true`)) && await waitFor(`!document.querySelector('.dsdr-files-menu')`, 'file action menu hidden'))

    console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURES`)
    process.exitCode = failures === 0 ? 0 : 1
  } finally {
    try { ws?.close() } catch { /* ignore */ }
    chrome.kill('SIGKILL')
    // Edge can hold the profile for a moment after SIGKILL on Windows. Cleanup
    // must never hide a useful smoke-test failure.
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 }) } catch { /* best effort */ }
  }
}

main().catch((error) => {
  console.error('FAILED:', error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
