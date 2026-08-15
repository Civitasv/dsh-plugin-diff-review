# File Tree Resize Hit Area Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Files browser divider as easy to drag as the Changes review divider while preserving a thin visual separator.

**Architecture:** Define one shared resize-hit-area constant in the client module. Make the Files browser content a positioned two-column grid and overlay the resize handle on the tree/editor boundary, so adjacent grid items cannot constrain or cover it. The visible divider remains a centered one-pixel pseudo-element.

**Tech Stack:** TypeScript, React, inline CSS, Node.js smoke tests.

---

### Task 1: Reproduce the missing resize hit target

**Files:**

- Modify: `src/client/index.tsx`
- Test: `scripts/ui-smoke-test.mjs`

**Step 1: Write the failing test**

After opening the Files browser, find the rendered tree/editor boundary from the file-list rectangle. Assert that `document.elementFromPoint()` at the boundary resolves to `.dsdr-file-tree-resize` and that its computed cursor is `col-resize`. Dispatch pointer down, move, and up events at that boundary and assert that the file-list width changes.

**Step 2: Run test to verify it fails**

Run: `npm run test:ui`

Expected: fail because the boundary is not hit-testable as the resize handle and dragging does not change the tree width.

**Step 3: Write minimal implementation**

Add a shared 12-pixel hit-area constant. Change `.dsdr-files-content` to a positioned two-column grid, remove the dedicated resize grid track, and absolutely position `.dsdr-file-tree-resize` over the tree/editor boundary. Mirror the horizontal positioning in docked mode and keep the pseudo-element's visual line one pixel wide.

**Step 4: Run test to verify it passes**

Run: `npm run test:ui`

Expected: pass.

**Step 5: Commit**

```bash
git add src/client/index.tsx scripts/ui-smoke-test.mjs
git commit -m "fix: widen file tree resize hit area"
```

### Task 2: Verify the production bundle and regression suite

**Files:**

- Generated: `client.js`

**Step 1: Build the client bundle**

Run: `npm run build`

Expected: successful build and refreshed `client.js`.

**Step 2: Type-check the plugin**

Run: `npm run typecheck`

Expected: no TypeScript errors.

**Step 3: Run all focused tests**

Run: `npm run test:ui && npm run test:files-path && npm run test:package && npm run test:session && npm run test:git`

Expected: all checks pass.

**Step 4: Confirm the bundle contains the resize control**

Run: `rg "Resize file tree" client.js`

Expected: the bundled client contains the resize control.
