# File Tree Resize Hit Area Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Files browser divider as easy to drag as the Changes review divider while preserving a thin visual separator.

**Architecture:** Define one shared resize-hit-area constant in the client module. Use it for the resize handle's CSS width and for the Files browser grid track, so the grid cannot constrain the pointer target. The visible divider remains a one-pixel pseudo-element.

**Tech Stack:** TypeScript, React, inline CSS, Node.js smoke tests.

---

### Task 1: Lock down shared resize geometry

**Files:**

- Modify: `src/client/index.tsx`
- Test: `scripts/ui-smoke-test.mjs`

**Step 1: Write the failing test**

Add assertions that the client source defines one resize-hit-area constant and uses it both for the file-tree resize CSS rule and the Files browser grid template.

**Step 2: Run test to verify it fails**

Run: `npm run test:ui`

Expected: fail because the shared constant and its two uses do not yet exist.

**Step 3: Write minimal implementation**

Add a shared constant with a wider pointer target. Interpolate it into the resize CSS width and the Files browser grid track. Keep the pseudo-element's visual line thin.

**Step 4: Run test to verify it passes**

Run: `npm run test:ui`

Expected: pass.

**Step 5: Commit**

```bash
git add src/client/index.tsx scripts/ui-smoke-test.mjs
git commit -m "fix: widen file tree resize hit area"
```

### Task 2: Verify the production bundle

**Files:**

- Generated: `client.js`

**Step 1: Build the client bundle**

Run: `npm run build`

Expected: successful build and refreshed `client.js`.

**Step 2: Type-check the plugin**

Run: `npm run typecheck`

Expected: no TypeScript errors.

**Step 3: Confirm the bundle contains the shared resize geometry**

Run: `rg "Resize file tree" client.js`

Expected: the bundled client contains the resize control.
