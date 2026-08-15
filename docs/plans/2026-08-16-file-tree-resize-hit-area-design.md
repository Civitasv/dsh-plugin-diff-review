# File tree resize hit area

## Goal

Make the file-tree divider in the Files browser as easy to drag as the divider in the Changes review view.

## Design

Use one shared, wider pointer target for every file-tree resize handle. Keep the visible divider as a thin line, so the layout does not look heavier.

The Files browser grid must allocate the same wider column to the resize handle; otherwise its grid track constrains the pointer target even when the component itself is wider.

## Verification

Add a lightweight source-level UI test that asserts the shared handle width and Files browser grid track use the same constant. Run the UI smoke test, type check, and build after the change.
