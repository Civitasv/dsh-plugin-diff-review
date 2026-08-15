/**
 * Capture a REAL screenshot of the diff-review comment dock strip inside the
 * running dsh web GUI via Chrome DevTools Protocol (Node 22 global WebSocket,
 * no puppeteer). The dock renders above the composer even without a session
 * (hero state), so this needs no session setup.
 *
 * Usage: node scripts/screenshot-real.mjs
 *   DSH_WEB_URL overrides the GUI URL (default http://127.0.0.1:3080/).
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = join(root, 'docs', 'screenshots')
mkdirSync(outDir, { recursive: true })
const WEB = process.env.DSH_WEB_URL ?? 'http://127.0.0.1:3080/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9229
const USER_DATA = `/tmp/dsh-dr-cdp-${process.pid}`

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=2',
  `--user-data-dir=${USER_DATA}`,
  `--remote-debugging-port=${PORT}`,
  '--window-size=1440,900',
  '--no-first-run',
  '--no-default-browser-check',
  WEB,
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let ws
let msgId = 0
const pending = new Map()

function send(method, params = {}) {
  const id = ++msgId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evalJs(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (r.exceptionDetails) throw new Error(`eval failed: ${expression}`)
  return r.result?.value
}

async function waitFor(expression, timeoutMs = 30000, interval = 400) {
  const start = Date.now()
  for (;;) {
    const v = await evalJs(expression)
    if (v) return v
    if (Date.now() - start > timeoutMs) throw new Error(`timeout waiting for: ${expression}`)
    await sleep(interval)
  }
}

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  const png = Buffer.from(r.data, 'base64')
  writeFileSync(join(outDir, name), png)
  console.log(`captured ${name} (${(png.length / 1024).toFixed(0)} KiB)`)
}

async function main() {
  let target
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      target = list.find((t) => t.type === 'page')
      if (target) break
    } catch { /* retry */ }
    await sleep(500)
  }
  if (!target) throw new Error('no page target (chrome failed to start?)')
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id)
      pending.delete(m.id)
      if (m.error) reject(new Error(`${m.error.message} (${m.error.code})`))
      else resolve(m.result)
    }
  }
  await send('Page.enable')
  await send('Runtime.enable')

  await waitFor(`document.readyState === 'complete'`)
  await waitFor(`!!document.querySelector('style[data-plugin-css="dsh-plugin-diff-review/review.css"]')`)
  await sleep(1500)

  // The comment dock renders above the composer even in the hero state.
  await waitFor(`!!document.querySelector('.dsdr-dock')`)
  await sleep(800)
  await shot('comments-real.png')
  console.log('dock chips:', await evalJs(`document.querySelectorAll('.dsdr-dock-chip').length`))
}

main()
  .catch((e) => {
    console.error('FAILED:', e.message)
    process.exitCode = 1
  })
  .finally(() => {
    try { ws?.close() } catch { /* ignore */ }
    chrome.kill('SIGKILL')
  })
