/**
 * Capture REAL screenshots of the diff-review panel inside the running dsh
 * web GUI via Chrome DevTools Protocol (Node 22 global WebSocket).
 *
 * The GUI keeps sessions server-side under ~/.dsh/sessions/<cwd>/session-<id>;
 * a fresh headless profile has no selected session, so this script injects
 * `dsh.sessions.current` (localStorage) with the most recent session id of a
 * matching workspace before reload, which restores the session and lets the
 * plugin's 变动 trigger render.
 *
 * Captures:
 *   workspace-real.png  — workspace tab: file tree + unified diff (+ dock strip)
 *   session-real.png    — session-changes tab: per-round diffs
 *   card-real.png       — conversation review card after sending via the dock
 *   comments-real.png   — comment dock strip (hero state, no session needed)
 *
 * Usage: node scripts/screenshot-all.mjs [workspacePath]
 *   workspacePath defaults to the plugin repo root; the most recent session
 *   under ~/.dsh/sessions for that path is restored.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const outDir = join(root, 'docs', 'screenshots')
mkdirSync(outDir, { recursive: true })
const WEB = process.env.DSH_WEB_URL ?? 'http://127.0.0.1:3080/'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 9229
const USER_DATA = `/tmp/dsh-dr-cdp-${process.pid}`
const SESSIONS_ROOT = join(homedir(), '.dsh', 'sessions')

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
  if (r.exceptionDetails) throw new Error(`eval failed: ${expression}\n${JSON.stringify(r.exceptionDetails).slice(0, 300)}`)
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

/** Full session id (with `session-` prefix) with the largest log for a workspace. */
function largestSessionId(workspace) {
  const dirName = `--${workspace.replace(/[\\/]/g, '-').replace(/^-+/, '')}--`
  const base = join(SESSIONS_ROOT, dirName)
  let best = null
  try {
    for (const entry of readdirSync(base)) {
      const full = join(base, entry)
      const st = statSync(full)
      if (!st.isDirectory() || !entry.startsWith('session-')) continue
      let size = 0
      try {
        for (const f of readdirSync(full)) {
          if (f.endsWith('.jsonl') || f.endsWith('.zstd')) size += statSync(join(full, f)).size
        }
      } catch { /* ignore */ }
      if (!best || size > best.size) best = { id: entry, size }
    }
  } catch { /* no persisted sessions */ }
  return best?.id ?? null
}

async function main() {
  const workspace = resolve(process.argv[2] ?? root)
  const sessionId = largestSessionId(workspace)
  console.log('workspace:', workspace)
  console.log('restoring session:', sessionId ?? '(none — falling back to hero state)')

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

  try {
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

    // Comment dock renders even in the hero state.
    if (await evalJs(`!!document.querySelector('.dsdr-dock')`)) {
      await shot('comments-real.png')
    }

    // Pick the workspace from the hero chip menu (browser-side, automatable).
    const picked = await evalJs(`(async () => {
      const chip = document.querySelector('button[class*=workspace]')
      if (!chip) return 'no-chip'
      chip.click()
      await new Promise((r) => setTimeout(r, 600))
      const items = [...document.querySelectorAll('[role=menuitem], [class*=menu] button, [class*=menu] [role=button]')]
      const target = items.find((b) => (b.textContent || '').trim() === ${JSON.stringify(process.env.DSH_WORKSPACE ?? 'dsh-plugin-diff-review')})
      if (!target) return 'no-item:' + items.map((b) => (b.textContent || '').trim()).join('|')
      target.click()
      return 'picked'
    })()`)
    console.log('workspace pick:', picked)
    await sleep(2500)

    // A freshly opened workspace restores the newest (often empty) session,
    // which shows the hero. Send one message to activate it so the session
    // gains a cwd and the plugin trigger renders.
    const activated = await evalJs(`(async () => {
      const ta = document.querySelector('textarea')
      if (!ta) return 'no-textarea'
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
      setter.call(ta, 'hi')
      ta.dispatchEvent(new Event('input', { bubbles: true }))
      await new Promise((r) => setTimeout(r, 300))
      ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }))
      return 'sent'
    })()`)
    console.log('activate message:', activated)
    await waitFor(`!!document.querySelector('.dsdr-trigger')`, 45000, 500)
    await sleep(2000)

    // Comment dock renders even in the hero state.
    if (await evalJs(`!!document.querySelector('.dsdr-dock')`)) {
      await shot('comments-real.png')
    }

    const hasSession = await evalJs(`!!document.querySelector('.dsdr-trigger')`)
    if (!hasSession) {
      console.log('session did not restore — skipping panel captures')
      return
    }

    // Open the review panel.
    await evalJs(`document.querySelector('.dsdr-trigger').click()`)
    await waitFor(`!!document.querySelector('.dsdr-panel')`)
    await sleep(3000) // workspace status + diff load
    await shot('workspace-real.png')

    // Session-changes tab.
    await evalJs(`(() => {
      const tabs = [...document.querySelectorAll('.dsdr-tab, button')]
      const tab = tabs.find((b) => b.textContent && b.textContent.includes('会话更改'))
      if (tab) tab.click()
      return !!tab
    })()`)
    await sleep(2500)
    await shot('session-real.png')

    // Send the pending comments via the dock strip → conversation card.
    const sent = await evalJs(`(() => {
      const strip = document.querySelector('.dsdr-dock-head')
      if (!strip) return false
      strip.click()
      return true
    })()`)
    console.log('dock send clicked:', sent)
    await sleep(6000)
    await shot('card-real.png')
  } finally {
    try { ws?.close() } catch { /* ignore */ }
    chrome.kill('SIGKILL')
  }
}

main().catch((e) => {
  console.error('FAILED:', e.message)
  process.exitCode = 1
})
