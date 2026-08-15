# File tree resize hit area

## Goal

Make the file-tree divider in the Files browser as easy to drag as the divider in the Changes review view.

## Design

Render the file-tree resize handle as an independent 12-pixel pointer target positioned over the boundary between the tree and editor. Keep the visible divider as a centered one-pixel line, so the layout does not look heavier.

The Files browser grid keeps only the tree and editor content tracks. The resize handle overlays their boundary instead of occupying a middle grid track, preventing either adjacent pane from constraining or covering the pointer target. The same positioning must work in normal and docked layouts.

## Verification

Extend the browser UI smoke test to locate the boundary, verify that hit-testing returns the resize handle with a column-resize cursor, dispatch a pointer drag, and assert that the tree width changes. Cover both normal and docked positioning where the harness supports them. Run the UI smoke test, type check, and build after the change.
