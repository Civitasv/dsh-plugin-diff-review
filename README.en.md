# dsh-plugin-diff-review

View, process and review the changes in your current workspace from within DSH. Click **Changes** in the session header to open the review workbench on the right.

![Review workbench](docs/screenshots/showcase.png)

> 中文文档见 [README.md](README.md) · English docs: this file.

## Installation

This plugin depends on [dsh-plugin-open-editor](https://github.com/Civitasv/dsh-plugin-open-editor) — install them together:

```sh
dsh plugin --profile web add github:Civitasv/dsh-plugin-open-editor#main
dsh plugin --profile web add github:Civitasv/dsh-plugin-diff-review#v0.1.2
```

Then enable them in `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- insert:
    - id: open-editor
      name: dsh-plugin-open-editor
    - id: diff-review
      name: dsh-plugin-diff-review
```

Restart DSH to use the plugin. To update, re-run the two install commands above.

### Local development install

```sh
# macOS / Linux
bash install.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File install.ps1
```

The scripts install and register `dsh-plugin-open-editor`, link the current directory into the profile, and register the plugin in `cordis.patch.yml`. Restart DSH after installing.

## Viewing changes

In **Changes**, pick a scope: last round, unstaged, staged, a commit revision, or a branch. Click a file to view its diff. The toolbar lets you toggle split/unified view, jump to a file, collapse diffs, and show or hide the file tree.

After selecting **Commit**, choose a specific revision in the submenu to open its diff.

![Unified and split diffs](docs/screenshots/showcase4.png)

## File tree

The file tree is searchable, lets you expand directories, drag to resize its width, and automatically locates the currently open file. Right-click a file to open it in your editor, copy its path, or add it to the current conversation.

![File tree](docs/screenshots/showcase2.png)

## File tabs

Selecting a file in the tree, or opening one from Review, creates a closeable tab. Text files can be edited directly and are saved automatically; image preview and syntax highlighting for common code and document formats are supported.

![File preview](docs/screenshots/showcase3.png)

## Staging and committing

- Use the buttons next to a file or hunk to stage, unstage, or discard changes.
- Click **Commit**, enter a message, then choose commit, commit and push, or push.

## Comments and summaries

Add comments next to diff lines, confirm them all at once, and send them to the agent; once sent successfully, the comments are removed from the pending list.

![Comments](docs/screenshots/showcase5.png)

After the agent processes the comments, a review-result card and a summary of the changed files appear below its reply, with direct links into Review to inspect the corresponding diffs.

![Review result and change summary cards](docs/screenshots/showcase6.png)

## FAQ

- **"Last round" shows no files**: files changed directly by terminal commands are not recorded in the session history; switch to the **unstaged** or **staged** scope to see Git changes.
- **Opening in the editor fails**: make sure `dsh-plugin-open-editor` is installed and enabled, and that the target editor can be launched from PATH.

## License

MIT
