window.__ModuleLoader__.load({
	id: "dsh-plugin-diff-review",
	factory: function (require) {
		var module = { exports: {} };
		var exports = module.exports;
		(function (module, exports, require) {
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  MIN_PANEL_H: () => MIN_PANEL_H,
  MIN_PANEL_W: () => MIN_PANEL_W,
  apply: () => apply,
  collectSessionRounds: () => collectSessionRounds,
  countSessionChanges: () => countSessionChanges,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");

// node_modules/diff/libesm/diff/base.js
var Diff = class {
  diff(oldStr, newStr, options = {}) {
    let callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    } else if ("callback" in options) {
      callback = options.callback;
    }
    const oldString = this.castInput(oldStr, options);
    const newString = this.castInput(newStr, options);
    const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
    const newTokens = this.removeEmpty(this.tokenize(newString, options));
    return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
  }
  diffWithOptionsObj(oldTokens, newTokens, options, callback) {
    var _a;
    const done = (value) => {
      value = this.postProcess(value, options);
      if (callback) {
        setTimeout(function() {
          callback(value);
        }, 0);
        return void 0;
      } else {
        return value;
      }
    };
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;
    if (options.maxEditLength != null) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    const maxExecutionTime = (_a = options.timeout) !== null && _a !== void 0 ? _a : Infinity;
    const abortAfterTimestamp = Date.now() + maxExecutionTime;
    const bestPath = [{ oldPos: -1, lastComponent: void 0 }];
    let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
    if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
      return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
    }
    let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
    const execEditLength = () => {
      for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
        let basePath;
        const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
        if (removePath) {
          bestPath[diagonalPath - 1] = void 0;
        }
        let canAdd = false;
        if (addPath) {
          const addPathNewPos = addPath.oldPos - diagonalPath;
          canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
        }
        const canRemove = removePath && removePath.oldPos + 1 < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = void 0;
          continue;
        }
        if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) {
          basePath = this.addToPath(addPath, true, false, 0, options);
        } else {
          basePath = this.addToPath(removePath, false, true, 1, options);
        }
        newPos = this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
        if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
          return done(this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
        } else {
          bestPath[diagonalPath] = basePath;
          if (basePath.oldPos + 1 >= oldLen) {
            maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
          }
          if (newPos + 1 >= newLen) {
            minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
          }
        }
      }
      editLength++;
    };
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) {
            return callback(void 0);
          }
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
        const ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  }
  addToPath(path, added, removed, oldPosInc, options) {
    const last = path.lastComponent;
    if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: last.count + 1, added, removed, previousComponent: last.previousComponent }
      };
    } else {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: 1, added, removed, previousComponent: last }
      };
    }
  }
  extractCommon(basePath, newTokens, oldTokens, diagonalPath, options) {
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
      newPos++;
      oldPos++;
      commonCount++;
      if (options.oneChangePerToken) {
        basePath.lastComponent = { count: 1, previousComponent: basePath.lastComponent, added: false, removed: false };
      }
    }
    if (commonCount && !options.oneChangePerToken) {
      basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent, added: false, removed: false };
    }
    basePath.oldPos = oldPos;
    return newPos;
  }
  equals(left, right, options) {
    if (options.comparator) {
      return options.comparator(left, right);
    } else {
      return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  }
  removeEmpty(array) {
    const ret = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  castInput(value, options) {
    return value;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tokenize(value, options) {
    return Array.from(value);
  }
  join(chars) {
    return chars.join("");
  }
  postProcess(changeObjects, options) {
    return changeObjects;
  }
  get useLongestToken() {
    return false;
  }
  buildValues(lastComponent, newTokens, oldTokens) {
    const components = [];
    let nextComponent;
    while (lastComponent) {
      components.push(lastComponent);
      nextComponent = lastComponent.previousComponent;
      delete lastComponent.previousComponent;
      lastComponent = nextComponent;
    }
    components.reverse();
    const componentLen = components.length;
    let componentPos = 0, newPos = 0, oldPos = 0;
    for (; componentPos < componentLen; componentPos++) {
      const component = components[componentPos];
      if (!component.removed) {
        if (!component.added && this.useLongestToken) {
          let value = newTokens.slice(newPos, newPos + component.count);
          value = value.map(function(value2, i) {
            const oldValue = oldTokens[oldPos + i];
            return oldValue.length > value2.length ? oldValue : value2;
          });
          component.value = this.join(value);
        } else {
          component.value = this.join(newTokens.slice(newPos, newPos + component.count));
        }
        newPos += component.count;
        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
        oldPos += component.count;
      }
    }
    return components;
  }
};

// node_modules/diff/libesm/diff/line.js
var LineDiff = class extends Diff {
  constructor() {
    super(...arguments);
    this.tokenize = tokenize;
  }
  equals(left, right, options) {
    if (options.ignoreWhitespace) {
      if (!options.newlineIsToken || !left.includes("\n")) {
        left = left.trim();
      }
      if (!options.newlineIsToken || !right.includes("\n")) {
        right = right.trim();
      }
    } else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
      if (left.endsWith("\n")) {
        left = left.slice(0, -1);
      }
      if (right.endsWith("\n")) {
        right = right.slice(0, -1);
      }
    }
    return super.equals(left, right, options);
  }
};
var lineDiff = new LineDiff();
function diffLines(oldStr, newStr, options) {
  return lineDiff.diff(oldStr, newStr, options);
}
function tokenize(value, options) {
  if (options.stripTrailingCr) {
    value = value.replace(/\r\n/g, "\n");
  }
  const retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  }
  for (let i = 0; i < linesAndNewlines.length; i++) {
    const line = linesAndNewlines[i];
    if (i % 2 && !options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      retLines.push(line);
    }
  }
  return retLines;
}

// src/client/index.tsx
var import_client = require("@deepseek-ai/dsh-client-runtime/client");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime = require("react/jsx-runtime");
var name = "diff-review";
var inject = ["sessions", "slots", "locale"];
var LOCALE_NS = "diff-review";
var STATUS_URL = "diff-review/status";
var APPLY_URL = "diff-review/apply";
var APPLY_HUNK_URL = "diff-review/apply-hunk";
var COMMIT_URL = "diff-review/commit";
var PUSH_URL = "diff-review/push";
var HISTORY_URL = "diff-review/history";
var COMMIT_DIFF_URL = "diff-review/commit-diff";
var COMMENTS_URL = "diff-review/comments";
var BRANCHES_URL = "diff-review/branches";
var REVIEW_URL = "diff-review/review";
var PR_URL = "diff-review/pr";
var REPOS_URL = "diff-review/repos";
var OPEN_EDITOR_URL = "open-editor/open";
var STYLE_TAG = "dsh-plugin-diff-review/review.css";
var overlayStore = (0, import_client.createSnapshotStore)({
  open: false,
  cwd: null,
  key: 0
});
var pendingCommentsStore = (0, import_client.createSnapshotStore)({
  cwd: null,
  comments: []
});
async function injectToSession(sessions, sessionId, text) {
  const binding = sessionId ? sessions?.binding(sessionId) : void 0;
  const session = binding?.session;
  if (session) {
    try {
      const result = await session.prompt([{ type: "text", text }], "queue");
      if (result.ok) return "sent";
    } catch {
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
var MIN_PANEL_W = 640;
var MIN_PANEL_H = 400;
var FONT_OPTIONS = [
  { id: "mono", label: "font.mono", css: "var(--dsw-font-mono)" },
  { id: "system", label: "font.system", css: "system-ui, -apple-system, sans-serif" },
  { id: "consolas", label: "Consolas", css: 'Consolas, "Courier New", monospace' },
  { id: "jetbrains", label: "JetBrains Mono", css: '"JetBrains Mono", Consolas, monospace' },
  { id: "fira", label: "Fira Code", css: '"Fira Code", Consolas, monospace' },
  { id: "source", label: "Source Code Pro", css: '"Source Code Pro", Consolas, monospace' }
];
var SIZE_OPTIONS = [11, 12, 13, 14, 16, 18];
var SCOPE_OPTIONS = [
  { id: "all", label: "scope.all" },
  { id: "unstaged", label: "scope.unstaged" },
  { id: "staged", label: "scope.staged" },
  { id: "commit", label: "scope.commit" },
  { id: "branch", label: "scope.branch" },
  { id: "last-turn", label: "scope.last-turn" }
];
function isAbsPath(p) {
  return p.startsWith("/") || /^[A-Za-z]:[\\/]/.test(p);
}
function baseName(p) {
  return p.split(/[\\/]/).pop() ?? p;
}
var prefsStore = (0, import_client.createSnapshotStore)(
  { font: "mono", size: 12, width: 1120, height: 720 },
  { persist: { name: "dsdr-prefs" } }
);
function fontCss(id) {
  return FONT_OPTIONS.find((f) => f.id === id)?.css ?? FONT_OPTIONS[0].css;
}
function diffStyleVars(prefs) {
  return {
    "--dsdr-diff-font": fontCss(prefs.font),
    "--dsdr-diff-size": `${prefs.size}px`
  };
}
function asFileDiff(raw) {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw;
  if (typeof rec.path !== "string" || !rec.path) return null;
  if (typeof rec.newText !== "string") return null;
  const oldText = rec.oldText;
  return { path: rec.path, oldText: typeof oldText === "string" ? oldText : null, newText: rec.newText };
}
function diffsFromResultView(resultView) {
  if (!resultView || resultView.card !== "diff" || !Array.isArray(resultView.diffs)) return [];
  return resultView.diffs.map(asFileDiff).filter((d) => d !== null);
}
function diffsFromMeta(meta) {
  if (!meta || typeof meta !== "object") return [];
  const diffs = meta.diffs;
  if (!Array.isArray(diffs)) return [];
  return diffs.map(asFileDiff).filter((d) => d !== null);
}
var MUTATION_TOOLS = /* @__PURE__ */ new Set(["str_replace_editor", "notebook_edit"]);
var MUTATION_COMMANDS = /* @__PURE__ */ new Set(["write", "edit", "replace", "delete", "move"]);
function mutationPath(tool, argsRaw) {
  let args = null;
  try {
    args = JSON.parse(argsRaw);
  } catch {
    return null;
  }
  if (!args || typeof args !== "object") return null;
  if (tool === "fs" || tool === "filesystem") {
    const cmd = typeof args.command === "string" ? args.command : "";
    if (!MUTATION_COMMANDS.has(cmd)) return null;
    return typeof args.file_path === "string" && args.file_path ? args.file_path : null;
  }
  if (MUTATION_TOOLS.has(tool) || tool.startsWith("edit")) {
    for (const key of ["file_path", "path", "filename"]) {
      if (typeof args[key] === "string" && args[key]) return args[key];
    }
  }
  return null;
}
function changesFromToolResult(call, node) {
  const tool = call.name;
  const diffs = diffsFromResultView(node.resultView);
  const fallbackDiffs = diffs.length === 0 ? diffsFromMeta(node.meta) : [];
  const allDiffs = diffs.length > 0 ? diffs : fallbackDiffs;
  if (allDiffs.length > 0) {
    const byPath = /* @__PURE__ */ new Map();
    for (const d of allDiffs) {
      let entry = byPath.get(d.path);
      if (!entry) {
        entry = { path: d.path, tool, hunks: [], hasDiff: true };
        byPath.set(d.path, entry);
      }
      entry.hunks.push({ oldText: d.oldText, newText: d.newText });
    }
    return [...byPath.values()];
  }
  const path = mutationPath(tool, call.argsRaw);
  return path ? [{ path, tool, hunks: [], hasDiff: false }] : [];
}
function userText(node) {
  const parts = [];
  for (const block of node.content) {
    if (block && typeof block === "object" && block.type === "text" && typeof block.text === "string") {
      parts.push(block.text);
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}
function collectSessionRounds(nodes) {
  const rounds = [];
  let current = null;
  for (const node of nodes) {
    if (node.kind === "user") {
      current = { round: rounds.length + 1, label: userText(node).slice(0, 60), changes: [] };
      rounds.push(current);
      continue;
    }
    if (node.kind !== "tool-result" || !current || !node.call) continue;
    for (const change of changesFromToolResult(node.call, node)) {
      const existing = current.changes.find((c) => c.path === change.path && c.tool === change.tool);
      if (existing) {
        if (change.hasDiff) {
          existing.hunks.push(...change.hunks);
          existing.hasDiff = true;
        }
      } else {
        current.changes.push(change);
      }
    }
  }
  return rounds.filter((r) => r.changes.length > 0);
}
function countSessionChanges(nodes) {
  let count = 0;
  const seen = /* @__PURE__ */ new Set();
  for (const node of nodes) {
    if (node.kind !== "tool-result" || !node.call) continue;
    for (const change of changesFromToolResult(node.call, node)) {
      const key = `${change.tool}:${change.path}`;
      if (!seen.has(key)) {
        seen.add(key);
        count++;
      }
    }
  }
  return count;
}
function splitCommitDiff(diff) {
  const segments = [];
  let current = null;
  for (const line of diff.split("\n")) {
    const match = /^diff --git a\/(.*?) b\//.exec(line);
    if (match) {
      if (current) segments.push(current);
      current = { path: match[1], text: [line] };
    } else if (current) {
      current.text.push(line);
    }
  }
  if (current) segments.push(current);
  return segments.map((s) => ({ path: s.path, text: s.text.join("\n") }));
}
function commitFileStatus(segmentText) {
  if (/^new file mode/.test(segmentText)) return "A";
  if (/^deleted file mode/.test(segmentText)) return "D";
  if (/^rename from /.test(segmentText)) return "R";
  return "M";
}
function gitDiffRows(diff) {
  return diff.split("\n").map((line) => {
    if (line.startsWith("+++") || line.startsWith("---")) return { kind: "file", text: line };
    if (line.startsWith("@@")) return { kind: "hunk", text: line };
    if (line.startsWith("+")) return { kind: "add", text: line };
    if (line.startsWith("-")) return { kind: "del", text: line };
    if (line.startsWith("\\ ")) return { kind: "note", text: line };
    return { kind: "ctx", text: line };
  });
}
function textDiffRows(oldText, newText) {
  const rows = [];
  for (const part of diffLines(oldText ?? "", newText)) {
    const lines = part.value.split("\n");
    if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
    for (const line of lines) {
      if (part.added) rows.push({ kind: "add", text: `+${line}` });
      else if (part.removed) rows.push({ kind: "del", text: `-${line}` });
      else rows.push({ kind: "ctx", text: line });
    }
  }
  return rows;
}
function changeRows(change) {
  if (!change.hasDiff || change.hunks.length === 0) return [];
  const rows = [];
  change.hunks.forEach((hunk, i) => {
    if (change.hunks.length > 1) rows.push({ kind: "hunk", text: `@@ hunk ${i + 1}/${change.hunks.length} @@` });
    rows.push(...textDiffRows(hunk.oldText, hunk.newText));
  });
  return rows;
}
function pairRows(rows, oldStart, newStart) {
  const out = [];
  let oldLine = oldStart;
  let newLine = newStart;
  let pending = [];
  const flush = () => {
    for (const p of pending) out.push({ left: p.text, right: "", leftNum: p.num, rightNum: null, kind: "change" });
    pending = [];
  };
  for (const row of rows) {
    if (row.kind === "del") {
      pending.push({ text: row.text.slice(1), num: oldLine++ });
    } else if (row.kind === "add") {
      const p = pending.shift();
      out.push({ left: p?.text ?? "", right: row.text.slice(1), leftNum: p?.num ?? null, rightNum: newLine++, kind: "change" });
    } else if (row.kind === "ctx") {
      flush();
      const text = row.text.startsWith(" ") ? row.text.slice(1) : row.text;
      out.push({ left: text, right: text, leftNum: oldLine++, rightNum: newLine++, kind: "ctx" });
    } else {
      flush();
    }
  }
  flush();
  return out;
}
var GIT_META = /^(diff --git |index |new file |deleted file |old mode |new mode |similarity index |rename (from|to) |Binary files )/;
function parseGitBlocks(diff) {
  const blocks = [];
  let current = null;
  const lines = diff.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  for (const line of lines) {
    let kind;
    if (line.startsWith("+++") || line.startsWith("---") || GIT_META.test(line)) kind = "file";
    else if (line.startsWith("@@")) kind = "hunk";
    else if (line.startsWith("+")) kind = "add";
    else if (line.startsWith("-")) kind = "del";
    else if (line.startsWith("\\ ")) kind = "note";
    else kind = "ctx";
    if (kind === "file" || kind === "hunk") {
      current = { head: { kind, text: line }, rows: [] };
      blocks.push(current);
    } else {
      if (!current) {
        current = { head: null, rows: [] };
        blocks.push(current);
      }
      current.rows.push({ kind, text: line });
    }
  }
  return blocks;
}
function hunkStarts(head) {
  const m = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(head);
  return { oldStart: m ? Number(m[1]) : 1, newStart: m ? Number(m[2]) : 1 };
}
function gitSplitBlocks(diff) {
  return parseGitBlocks(diff).filter((b) => b.head?.kind !== "file" && (b.rows.length > 0 || b.head?.kind === "hunk")).map((b) => {
    const starts = b.head ? hunkStarts(b.head.text) : { oldStart: 1, newStart: 1 };
    return { head: b.head?.kind === "hunk" ? b.head.text : null, rows: pairRows(b.rows, starts.oldStart, starts.newStart) };
  });
}
function textSplitBlocks(oldText, newText) {
  const rows = [];
  for (const part of diffLines(oldText ?? "", newText)) {
    const lines = part.value.split("\n");
    if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
    for (const line of lines) {
      if (part.added) rows.push({ kind: "add", text: `+${line}` });
      else if (part.removed) rows.push({ kind: "del", text: `-${line}` });
      else rows.push({ kind: "ctx", text: line });
    }
  }
  return [{ head: null, rows: pairRows(rows, 1, 1) }];
}
function changeSplitBlocks(change) {
  if (!change.hasDiff || change.hunks.length === 0) return [];
  return change.hunks.map((hunk, i) => ({
    head: change.hunks.length > 1 ? `@@ hunk ${i + 1}/${change.hunks.length} @@` : null,
    rows: textSplitBlocks(hunk.oldText, hunk.newText)[0].rows
  }));
}
var REVIEW_CSS = `
.dsdr-trigger{min-height:28px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:4px;padding:3px 6px;font:inherit;font-size:12px;line-height:18px;display:inline-flex}
.dsdr-trigger:hover,.dsdr-trigger:focus-visible{color:var(--dsw-alias-label-secondary)}
.dsdr-label{margin-left:2px}
.dsdr-count{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-secondary);border-radius:999px;min-width:16px;text-align:center;font-size:11px;line-height:16px;padding:0 5px;font-variant-numeric:tabular-nums}
.dsdr-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:32px}
.dsdr-panel{box-sizing:border-box;position:relative;width:min(1120px,100%);height:min(720px,calc(100vh - 64px));max-width:calc(100vw - 64px);max-height:calc(100vh - 64px);background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:var(--dsw-shadow-lv3);display:flex;flex-direction:column;overflow:hidden}
.dsdr-resize{position:absolute;z-index:5}
.dsdr-resize-e{top:0;right:-3px;width:7px;height:100%;cursor:ew-resize}
.dsdr-resize-s{bottom:-3px;left:0;width:100%;height:7px;cursor:ns-resize}
.dsdr-resize-se{right:-4px;bottom:-4px;width:15px;height:15px;cursor:nwse-resize}
.dsdr-header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dsdr-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-subtitle{color:var(--dsw-alias-label-tertiary);font-size:12px;font-family:var(--dsw-font-mono)}
.dsdr-tabs{display:flex;gap:4px;margin-left:14px}
.dsdr-tab{box-sizing:border-box;min-height:26px;border:1px solid transparent;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:2px 10px;font:inherit;font-size:12px;line-height:18px}
.dsdr-tab:hover{color:var(--dsw-alias-label-secondary)}
.dsdr-tab-active{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-scope{display:inline-flex;align-items:center;gap:6px;margin-left:8px}
.dsdr-scope .dsdr-sel-trigger{min-width:110px;height:26px;font-size:12px;line-height:18px;padding:0 8px;background:var(--dsw-alias-bg-layer-2)}
.dsdr-spacer{flex:1}
.dsdr-btn{box-sizing:border-box;min-height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:3px 10px;font:inherit;font-size:12px;line-height:18px;display:inline-flex;align-items:center;gap:5px}
.dsdr-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-btn:disabled{opacity:.5;cursor:default}
.dsdr-btn-primary{border-color:var(--dsw-static-neutral-bluish-400);color:var(--dsw-alias-label-primary)}
.dsdr-btn-danger{color:var(--dsw-alias-state-error-primary)}
.dsdr-btn-danger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)}
.dsdr-btn-confirm{border-color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-state-error-primary);color:var(--dsw-static-neutral-bluish-50)}
.dsdr-btn-confirm:hover:not(:disabled){background:var(--dsw-alias-state-error-primary);color:var(--dsw-static-neutral-bluish-50)}
.dsdr-commit-input{box-sizing:border-box;width:200px;min-height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);padding:3px 10px;font:inherit;font-size:12px;line-height:18px}
.dsdr-commit-input::placeholder{color:var(--dsw-alias-label-caption)}
.dsdr-commit-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsdr-section{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);padding:10px 8px 3px;font-weight:600;display:flex;align-items:center;gap:6px}
.dsdr-section:first-child{padding-top:4px}
.dsdr-branch{display:flex;align-items:center;gap:8px;padding:4px 8px 8px;flex-wrap:wrap}
.dsdr-branch-ref{font-size:12px;color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;display:inline-flex;align-items:center;gap:5px}
.dsdr-branch-arrow{color:var(--dsw-alias-label-tertiary)}
.dsdr-branch-stat{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-variant-numeric:tabular-nums}
.dsdr-branch-ahead{color:var(--dsw-alias-state-success-primary)}
.dsdr-branch-behind{color:var(--dsw-alias-state-warn-primary)}
.dsdr-branch-sync{color:var(--dsw-alias-state-success-primary)}
.dsdr-commit{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;border-radius:8px;padding:5px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:var(--dsw-alias-label-primary)}
.dsdr-commit:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-tl-selected .dsdr-commit{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-timeline{display:flex;flex-direction:column}
.dsdr-tl-item{display:flex;gap:6px;align-items:stretch;border-radius:8px}
.dsdr-tl-rail{position:relative;flex:none;width:14px;display:flex;justify-content:center}
.dsdr-tl-rail::before{content:"";position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--dsw-alias-border-l2)}
.dsdr-tl-item:first-child .dsdr-tl-rail::before{top:9px}
.dsdr-tl-item:last-child .dsdr-tl-rail::before{bottom:auto;height:9px}
.dsdr-tl-dot{position:relative;z-index:1;top:9px;flex:none;width:7px;height:7px;border-radius:50%;border:1px solid var(--dsw-alias-bg-module-platform)}
.dsdr-tl-dot-local{background:var(--dsw-alias-state-success-primary)}
.dsdr-tl-dot-remote{background:var(--dsw-alias-label-tertiary)}
.dsdr-commit-head{display:flex;align-items:center;gap:6px;min-width:0}
.dsdr-commit-short{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-commit-subject{flex:1;min-width:0;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-commit-meta{font-size:11px;color:var(--dsw-alias-label-tertiary);padding-left:0}
.dsdr-tl-badge{flex:none;font-size:10px;line-height:14px;border-radius:4px;padding:0 5px}
.dsdr-tl-badge-local{background:rgba(46,160,67,.16);color:var(--dsw-alias-state-success-primary)}
.dsdr-tl-badge-remote{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-diff-hash{margin-left:8px;font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-commit-file-head{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dsdr-commit-file-path{font-family:var(--dsw-font-mono);font-size:12px;color:var(--dsw-alias-label-primary);margin-left:4px}
.dsdr-cfg-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}
.dsdr-cfg-card:hover{border-color:var(--dsw-alias-label-dimmed)}
.dsdr-cfg-card-open{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}
.dsdr-cfg-head{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}
.dsdr-cfg-head:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.dsdr-cfg-head-text{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}
.dsdr-cfg-name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}
.dsdr-cfg-desc{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}
.dsdr-cfg-caret{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}
.dsdr-cfg-caret-open{transform:rotate(180deg)}
.dsdr-cfg-body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px;display:flex;flex-direction:column}
.dsdr-cfg-field{flex-direction:column;gap:6px;padding:12px 0;display:flex}
.dsdr-cfg-field+.dsdr-cfg-field{border-top:1px solid var(--dsw-alias-border-l2)}
.dsdr-cfg-label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}
.dsdr-cfg-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}
.dsdr-cfg-pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}
.dsdr-cfg-failed{min-width:0;color:var(--dsw-alias-label-error);flex:1;margin:0;font-size:12px;line-height:1.5}
.dsdr-cfg-actions{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}
.dsdr-body{display:flex;flex:1;min-height:0}
.dsdr-files{width:300px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow-y:auto;padding:8px}
.dsdr-round{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);padding:8px 8px 3px;font-weight:600}
.dsdr-round-label{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-weight:400;color:var(--dsw-alias-label-secondary)}
.dsdr-file{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border-radius:8px;padding:6px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:var(--dsw-alias-label-primary)}
.dsdr-file:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-file-selected{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-dir{display:flex;align-items:center;gap:5px;width:100%;box-sizing:border-box;border-radius:7px;padding:5px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:var(--dsw-alias-label-secondary);font-size:12px}
.dsdr-dir:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-dir-caret{flex:none;width:12px;text-align:center;font-size:10px;color:var(--dsw-alias-label-tertiary)}
.dsdr-dir-name{flex:1;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-weight:600}
.dsdr-dir-count{flex:none;font-size:10px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dsdr-file-name{flex:1;min-width:0;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-family:var(--dsw-font-mono)}
.dsdr-file-stat{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.dsdr-chip{flex:none;min-width:22px;text-align:center;border-radius:5px;font-size:11px;line-height:16px;padding:0 4px;font-family:var(--dsw-font-mono)}
.dsdr-chip-m{background:rgba(46,160,67,.16);color:#2ea043}
.dsdr-chip-a{background:rgba(46,160,67,.16);color:#2ea043}
.dsdr-chip-d{background:rgba(248,81,73,.16);color:#f85149}
.dsdr-chip-r{background:rgba(88,166,255,.16);color:#58a6ff}
.dsdr-chip-u{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-tool{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-diff{flex:1;min-width:0;overflow:auto;padding:10px 0}
.dsdr-diff-empty{display:flex;align-items:center;justify-content:center;height:100%;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsdr-diff-head{display:flex;align-items:center;gap:10px;padding:6px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none}
.dsdr-diff-path{font-family:var(--dsw-font-mono);font-size:13px;color:var(--dsw-alias-label-primary);flex:1;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-diff-stats{font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none}
.dsdr-diff-scroll{flex:1;min-height:0;overflow:auto;display:flex}
.dsdr-pre{margin:0;padding:8px 0;font-family:var(--dsdr-diff-font, var(--dsw-font-mono));font-size:var(--dsdr-diff-size, 12px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px);white-space:pre;min-width:100%;flex:1}
.dsdr-line{display:flex;align-items:flex-start;gap:10px;padding:0 16px;color:var(--dsw-alias-label-primary);position:relative}
.dsdr-line-num{flex:none;width:34px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;font-size:calc(var(--dsdr-diff-size, 12px) - 1px);opacity:.75}
.dsdr-line-text{flex:1;min-width:0;white-space:pre}
.dsdr-comment-add{flex:none;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:11px;line-height:1;padding:0;margin-top:1px;visibility:hidden}
.dsdr-line:hover .dsdr-comment-add,.dsdr-comment-add:focus-visible{visibility:visible}
.dsdr-comment-add:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}
.dsdr-comment-has{visibility:visible;background:rgba(88,166,255,.18);color:#58a6ff;border-color:transparent;font-variant-numeric:tabular-nums}
.dsdr-line-commented{box-shadow:inset 3px 0 0 rgba(88,166,255,.7)}
.dsdr-comment-editor{display:flex;flex-direction:column;gap:6px;padding:8px 16px;border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.dsdr-comment-input{box-sizing:border-box;width:100%;min-height:52px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);padding:6px 8px;font:inherit;font-size:12px;line-height:18px;resize:vertical}
.dsdr-comment-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsdr-comment-actions{display:flex;gap:6px;justify-content:flex-end}
.dsdr-comment-pop{position:absolute;z-index:20;right:16px;top:calc(100% + 2px);min-width:280px;max-width:440px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);border-radius:10px;box-shadow:var(--dsw-shadow-lv3);padding:8px;display:flex;flex-direction:column;gap:6px}
.dsdr-comment-item{display:flex;flex-direction:column;gap:4px;border-bottom:1px solid var(--dsw-alias-border-l1);padding-bottom:6px}
.dsdr-comment-item:last-child{border-bottom:0;padding-bottom:0}
.dsdr-comment-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere;font-family:var(--dsw-font-mono)}
.dsdr-comment-meta{display:flex;align-items:center;gap:8px;font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-comment-meta .dsdr-btn{min-height:20px;padding:0 6px;font-size:10px;line-height:14px;margin-left:auto}
.dsdr-openline{flex:none;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:12px;line-height:1;padding:0;visibility:hidden}
.dsdr-line:hover .dsdr-openline,.dsdr-openline:focus-visible{visibility:visible}
.dsdr-openline:hover{color:var(--dsw-alias-label-primary)}
.dsdr-line-finding{box-shadow:inset 3px 0 0 var(--dsdr-finding-color, rgba(255,166,87,.7))}
.dsdr-finding-P0{--dsdr-finding-color:#f85149}
.dsdr-finding-P1{--dsdr-finding-color:#ffa657}
.dsdr-finding-P2{--dsdr-finding-color:#d29922}
.dsdr-finding-P3{--dsdr-finding-color:#8b949e}
.dsdr-finding-tag{flex:none;font-size:10px;line-height:14px;border-radius:4px;padding:0 4px;font-family:var(--dsw-font-mono);font-weight:600;align-self:flex-start;margin-top:2px}
.dsdr-finding-tag.dsdr-finding-P0{background:rgba(248,81,73,.18);color:#f85149}
.dsdr-finding-tag.dsdr-finding-P1{background:rgba(255,166,87,.16);color:#ffa657}
.dsdr-finding-tag.dsdr-finding-P2{background:rgba(210,153,34,.16);color:#d29922}
.dsdr-finding-tag.dsdr-finding-P3{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-line-jump{background:rgba(88,166,255,.16)}
.dsdr-review-strip{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;font-size:12px;flex-wrap:wrap}
.dsdr-review-ok{color:var(--dsw-alias-state-success-primary)}
.dsdr-review-bad{color:var(--dsw-alias-state-error-primary)}
.dsdr-review-model{font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-review-toggle-on{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}
.dsdr-findings{display:flex;flex-direction:column;gap:4px;padding:8px 16px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;max-height:260px;overflow-y:auto}
.dsdr-finding-item{display:flex;gap:8px;align-items:flex-start;border-radius:8px;padding:6px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit}
.dsdr-finding-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-finding-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.dsdr-finding-title{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary);display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.dsdr-finding-loc{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);font-weight:400}
.dsdr-finding-detail{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsdr-finding-meta{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-finding-suggestion{display:block;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;line-height:16px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:6px;padding:4px 8px;font-family:var(--dsw-font-mono)}
.dsdr-pr{display:flex;flex-direction:column;gap:4px;padding:4px 8px 8px}
.dsdr-pr-item{display:flex;flex-direction:column;gap:3px;border-radius:8px;padding:6px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit}
.dsdr-pr-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-pr-meta{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-pr-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsdr-dock{display:flex;align-items:center;gap:8px;padding:6px 16px;font-size:12px;line-height:18px;flex-wrap:wrap}
.dsdr-dock-pill{position:relative;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:rgba(88,166,255,.12);color:var(--dsw-alias-label-secondary);padding:2px 12px;font:inherit;font-size:12px;line-height:18px;cursor:default;user-select:none}
.dsdr-dock-pop{position:absolute;z-index:40;left:0;top:calc(100% + 6px);min-width:320px;max-width:min(520px,90vw);max-height:280px;overflow-y:auto;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);border-radius:10px;box-shadow:var(--dsw-shadow-lv3);padding:8px;display:flex;flex-direction:column;gap:6px}
.dsdr-dock-item{display:flex;flex-direction:column;gap:2px;border-bottom:1px solid var(--dsw-alias-border-l1);padding-bottom:6px}
.dsdr-dock-item:last-child{border-bottom:0;padding-bottom:0}
.dsdr-dock-loc{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-dock-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsdr-dock-send{min-height:24px}
.dsdr-dock-close{min-height:24px;padding:0 6px}
.dsdr-send{position:absolute;z-index:40;top:52px;right:16px;width:min(480px,calc(100% - 32px));border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);border-radius:12px;box-shadow:var(--dsw-shadow-lv3);padding:12px;display:flex;flex-direction:column;gap:8px}
.dsdr-send-title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-send-hint{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary)}
.dsdr-send-input{box-sizing:border-box;width:100%;min-height:140px;max-height:320px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);padding:8px;font:inherit;font-size:12px;line-height:18px;resize:vertical;white-space:pre-wrap}
.dsdr-line-add{background:rgba(46,160,67,.13)}
.dsdr-line-del{background:rgba(248,81,73,.12)}
.dsdr-line-hunk{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-line-file{color:var(--dsw-alias-label-tertiary)}
.dsdr-line-note{color:var(--dsw-alias-label-tertiary);font-style:italic}
.dsdr-hunk-bar{display:flex;align-items:center;gap:6px;padding:2px 16px;border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-fill-l2)}
.dsdr-hunk-bar .dsdr-btn{min-height:22px;padding:1px 8px;font-size:11px;line-height:16px}
.dsdr-hunk-layer{font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);margin-right:auto}
.dsdr-foot{display:flex;align-items:center;gap:10px;padding:8px 16px;border-top:1px solid var(--dsw-alias-border-l1);flex:none;min-height:36px}
.dsdr-notice{font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsdr-notice-ok{color:var(--dsw-alias-state-success-primary)}
.dsdr-notice-error{color:var(--dsw-alias-state-error-primary)}
.dsdr-spinner{flex:none;width:12px;height:12px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-label-secondary);animation:dsdr-spin .8s linear infinite}
@keyframes dsdr-spin{to{transform:rotate(360deg)}}
.dsdr-empty{padding:40px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsdr-nodiff{padding:8px 16px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsdr-sel{position:relative;display:inline-flex}
.dsdr-sel-trigger{box-sizing:content-box;min-width:180px;height:34px;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;color:var(--dsw-alias-label-primary);cursor:pointer;padding:0 12px;font:inherit;font-size:13px;line-height:1.5;display:inline-flex;align-items:center;gap:8px}
.dsdr-sel-trigger:hover{border-color:var(--dsw-alias-label-dimmed)}
.dsdr-sel-trigger:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}
.dsdr-sel-trigger svg{flex:none;transition:transform .12s}
.dsdr-sel-trigger[aria-expanded="true"] svg{transform:rotate(180deg)}
.dsdr-sel-value{flex:1;min-width:0;text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-sel-menu{z-index:200;box-sizing:border-box;min-width:100%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);border-radius:10px;margin:0;padding:4px;list-style:none;display:flex;flex-direction:column;gap:1px;position:absolute;top:calc(100% + 5px);left:0}
.dsdr-sel-option{box-sizing:border-box;width:100%;min-height:30px;color:var(--dsw-alias-label-primary);border-radius:7px;align-items:center;gap:8px;padding:5px 8px;font:inherit;font-size:12px;line-height:18px;cursor:pointer;background:0 0;border:0;text-align:left;display:flex}
.dsdr-sel-option:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-sel-option-active{color:var(--dsw-alias-label-primary)}
.dsdr-sel-option-mark{flex:none;width:14px;display:inline-flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary)}
.dsdr-sel-option-label{flex:1;min-width:0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-view-toggle{display:flex;gap:2px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;padding:2px;flex:none}
.dsdr-view-btn{box-sizing:border-box;min-height:22px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:1px 8px;font:inherit;font-size:11px;line-height:16px}
.dsdr-view-btn:hover{color:var(--dsw-alias-label-secondary)}
.dsdr-view-btn-active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-split{min-width:100%}
.dsdr-split-head{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary);padding:4px 8px;position:sticky;top:0;background:var(--dsw-alias-bg-module-platform)}
.dsdr-split-head div{display:flex;gap:8px}
.dsdr-split-hunk{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-fill-l2);font-family:var(--dsdr-diff-font, var(--dsw-font-mono));font-size:11px;line-height:18px;padding:2px 16px}
.dsdr-split-row{display:grid;grid-template-columns:1fr 1fr;font-family:var(--dsdr-diff-font, var(--dsw-font-mono));font-size:var(--dsdr-diff-size, 12px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px)}
.dsdr-split-cell{display:flex;gap:8px;padding:0 8px;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}
.dsdr-split-num{flex:none;width:36px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;font-size:calc(var(--dsdr-diff-size, 12px) - 1px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px)}
.dsdr-split-text{flex:1;min-width:0}
.dsdr-cell-finding{box-shadow:inset 0 0 0 1px var(--dsdr-finding-color, rgba(255,166,87,.7));background:rgba(255,166,87,.08)}
.dsdr-cell-jump{background:rgba(88,166,255,.16)}
.dsdr-split-finding{flex:none;font-size:9px;line-height:12px;border-radius:3px;padding:0 3px;font-family:var(--dsw-font-mono);font-weight:600;align-self:flex-start}
.dsdr-split-finding.dsdr-finding-P0{background:rgba(248,81,73,.18);color:#f85149}
.dsdr-split-finding.dsdr-finding-P1{background:rgba(255,166,87,.16);color:#ffa657}
.dsdr-split-finding.dsdr-finding-P2{background:rgba(210,153,34,.16);color:#d29922}
.dsdr-split-finding.dsdr-finding-P3{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-split-openline{flex:none;display:flex;align-items:center;justify-content:center;width:16px;height:16px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:11px;line-height:1;padding:0;visibility:hidden}
.dsdr-split-cell:hover .dsdr-split-openline,.dsdr-split-openline:focus-visible{visibility:visible}
.dsdr-split-openline:hover{color:var(--dsw-alias-label-primary)}
.dsdr-cell-add{background:rgba(46,160,67,.13)}
.dsdr-cell-del{background:rgba(248,81,73,.12)}
.dsdr-cell-dim{background:var(--dsw-alias-fill-l1, rgba(128,128,128,.05))}
`;
if (typeof document !== "undefined" && document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG)}]`) === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-plugin-diff-review";
  tag.dataset.pluginCss = STYLE_TAG;
  tag.textContent = REVIEW_CSS;
  document.head.appendChild(tag);
}
var zh = {
  "action.label": "\u53D8\u52A8",
  "action.aria": "\u5BA1\u67E5\u5F53\u524D\u9879\u76EE\u4E0E\u6BCF\u8F6E\u4FEE\u6539",
  "tab.session": "\u4F1A\u8BDD\u66F4\u6539",
  "tab.workspace": "\u5DE5\u4F5C\u533A",
  "review.title": "\u53D8\u52A8",
  "review.branch": "\u5206\u652F",
  "review.detached": "\u6E38\u79BB HEAD",
  "review.notRepo": "\u5F53\u524D\u76EE\u5F55\u4E0D\u662F git \u4ED3\u5E93",
  "review.notRepoHint": "\u300C\u4F1A\u8BDD\u66F4\u6539\u300D\u9875\u7B7E\u4E0D\u53D7\u5F71\u54CD\uFF0C\u4ECD\u53EF\u67E5\u770B\u6BCF\u8F6E\u4FEE\u6539\u3002",
  "review.noSessionChanges": "\u8FD9\u4E2A\u4F1A\u8BDD\u8FD8\u6CA1\u6709\u6587\u4EF6\u4FEE\u6539\u8BB0\u5F55",
  "review.sessionStats": "{rounds} \u8F6E \xB7 {files} \u4E2A\u6587\u4EF6",
  "review.round": "\u7B2C {round} \u8F6E",
  "review.empty": "\u6CA1\u6709\u672A\u63D0\u4EA4\u7684\u66F4\u6539 \u{1F389}",
  "review.loadError": "\u52A0\u8F7D\u5931\u8D25",
  "review.accept": "\u91C7\u7EB3",
  "review.revert": "\u4E22\u5F03",
  "review.acceptAll": "\u5168\u90E8\u91C7\u7EB3",
  "review.revertAll": "\u5168\u90E8\u4E22\u5F03",
  "review.unstage": "\u53D6\u6D88\u6682\u5B58",
  "review.unstageAll": "\u5168\u90E8\u53D6\u6D88\u6682\u5B58",
  "hunk.stage": "\u6682\u5B58",
  "hunk.revert": "\u4E22\u5F03",
  "hunk.unstage": "\u53D6\u6D88\u6682\u5B58",
  "hunk.staged": "\u5DF2\u6682\u5B58",
  "hunk.unstaged": "\u672A\u6682\u5B58",
  "review.confirmRevert": "\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u4E22\u5F03",
  "review.confirmRevertAll": "\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u5168\u90E8\u4E22\u5F03",
  "review.commit": "\u63D0\u4EA4",
  "review.commitPlaceholder": "\u63D0\u4EA4\u8BF4\u660E\u2026",
  "review.push": "\u63A8\u9001",
  "review.confirmPush": "\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u63A8\u9001",
  "review.committed": "\u5DF2\u63D0\u4EA4 {summary}",
  "review.commitFailed": "\u63D0\u4EA4\u5931\u8D25",
  "review.pushed": "\u5DF2\u63A8\u9001",
  "review.pushFailed": "\u63A8\u9001\u5931\u8D25",
  "review.ahead": "\u9886\u5148 {n}",
  "review.behind": "\u843D\u540E {n}",
  "review.sectionStaged": "\u5DF2\u6682\u5B58",
  "review.sectionChanges": "\u672A\u6682\u5B58",
  "review.sectionBranch": "\u5206\u652F\u4E0E\u8FDC\u7A0B",
  "review.noUpstream": "\u672A\u8BBE\u7F6E\u4E0A\u6E38\u5206\u652F",
  "review.history": "\u5386\u53F2",
  "review.commitFiles": "\u53D8\u52A8\u6587\u4EF6",
  "history.local": "\u672C\u5730",
  "history.remote": "\u8FDC\u7A0B",
  "time.now": "\u521A\u521A",
  "time.minutes": "{n} \u5206\u949F\u524D",
  "time.hours": "{n} \u5C0F\u65F6\u524D",
  "time.days": "{n} \u5929\u524D",
  "review.refresh": "\u5237\u65B0",
  "review.close": "\u5173\u95ED",
  "review.busy": "\u5904\u7406\u4E2D\u2026",
  "review.done": "\u5DF2{action} {count} \u4E2A\u6587\u4EF6",
  "review.doneOne": "\u5DF2{action} {path}",
  "review.doneDeleted": "\u5DF2{action} {count} \u4E2A\u6587\u4EF6\uFF08\u5220\u9664 {deleted} \u4E2A\u672A\u8DDF\u8E2A\u6587\u4EF6\uFF09",
  "review.accepted": "\u91C7\u7EB3",
  "review.reverted": "\u4E22\u5F03",
  "review.untracked": "\u672A\u8DDF\u8E2A",
  "review.binary": "\u4E8C\u8FDB\u5236",
  "review.noDiffData": "\u8BE5\u4FEE\u6539\u6CA1\u6709 diff \u6570\u636E",
  "review.changes": "{added}+ {deleted}-",
  "view.single": "\u5355\u680F",
  "view.split": "\u53CC\u680F",
  "view.before": "\u539F\u6587\u4EF6",
  "view.after": "\u65B0\u6587\u4EF6",
  "comment.add": "\u8BC4\u8BBA\u6B64\u884C",
  "comment.show": "\u67E5\u770B\u8BC4\u8BBA",
  "comment.placeholder": "\u8BC4\u8BBA\u2026\uFF08Ctrl/\u2318+Enter \u4FDD\u5B58\uFF09",
  "comment.save": "\u4FDD\u5B58",
  "comment.cancel": "\u53D6\u6D88",
  "comment.delete": "\u5220\u9664",
  "comment.saved": "\u5DF2\u4FDD\u5B58\u8BC4\u8BBA",
  "comment.failed": "\u8BC4\u8BBA\u4FDD\u5B58\u5931\u8D25",
  "scope.label": "\u8303\u56F4",
  "scope.all": "\u5168\u90E8",
  "scope.unstaged": "\u672A\u6682\u5B58",
  "scope.staged": "\u5DF2\u6682\u5B58",
  "scope.commit": "\u63D0\u4EA4",
  "scope.branch": "\u5206\u652F",
  "scope.last-turn": "\u6700\u540E\u4E00\u8F6E",
  "review.lastTurnEmpty": "\u6700\u540E\u4E00\u8F6E\u6CA1\u6709\u8BB0\u5F55\u5230\u6587\u4EF6\u4FEE\u6539 \u2014\u2014 \u7EC8\u7AEF\u547D\u4EE4\uFF08bash\uFF09\u6539\u6587\u4EF6\u4E0D\u4F1A\u8BA1\u5165\u4F1A\u8BDD\u8BB0\u5F55\uFF1B\u53EF\u5207\u5230\u300C\u5168\u90E8\u300D\u67E5\u770B git \u53D8\u66F4",
  "scope.base": "\u57FA\u7EBF\u5206\u652F",
  "scope.branchReadonly": "\u5206\u652F\u8303\u56F4\u53EA\u8BFB\uFF08\u5BF9\u6BD4 merge-base\uFF0C\u4E0D\u63D0\u4F9B\u91C7\u7EB3/\u4E22\u5F03\uFF09",
  "review.selectCommit": "\u4ECE\u5DE6\u4FA7\u9009\u62E9\u63D0\u4EA4\u67E5\u770B diff",
  "review.sendToAgent": "\u53D1\u9001\u7ED9\u4EE3\u7406",
  "review.sendTitle": "\u53D1\u9001\u884C\u5185\u8BC4\u8BBA\u7ED9\u4EE3\u7406",
  "review.sendHint": "\u8BC4\u8BBA\u4F1A\u4F5C\u4E3A\u8BC4\u5BA1\u6307\u5F15\u6CE8\u5165\u5F53\u524D\u4F1A\u8BDD\uFF08Address the inline comments\uFF09\u3002\u53D1\u9001\u5931\u8D25\u65F6\u9000\u5316\u4E3A\u590D\u5236\u6587\u672C\u3002",
  "review.sentToAgent": "\u5DF2\u53D1\u9001\u7ED9\u4EE3\u7406",
  "review.copy": "\u590D\u5236\u6587\u672C",
  "review.copied": "\u5DF2\u590D\u5236",
  "review.copyFailed": "\u590D\u5236\u5931\u8D25",
  "review.review": "\u8BC4\u5BA1",
  "review.reviewing": "\u8BC4\u5BA1\u4E2D\u2026",
  "review.reviewFailed": "\u8BC4\u5BA1\u5931\u8D25",
  "review.verdictCorrect": "\u8865\u4E01\u6B63\u786E \u2713",
  "review.verdictIncorrect": "\u8865\u4E01\u5B58\u5728\u95EE\u9898 \u2717",
  "review.noFindings": "\u6CA1\u6709\u53D1\u73B0\u95EE\u9898",
  "review.findings": "{n} \u6761\u53D1\u73B0",
  "review.confidence": "\u7F6E\u4FE1\u5EA6 {confidence}",
  "review.suggestion": "\u5EFA\u8BAE",
  "review.sendFindings": "\u53D1\u9001\u53D1\u73B0\u7ED9\u4EE3\u7406",
  "review.sentFindings": "\u5DF2\u53D1\u9001\u53D1\u73B0\u7ED9\u4EE3\u7406",
  "review.reviewScope": "\u8BC4\u5BA1\u8303\u56F4",
  "pr.title": "PR #{number}",
  "pr.comments": "PR \u8BC4\u8BBA ({n})",
  "pr.noPr": "\u65E0\u5173\u8054 PR",
  "pr.sendComments": "\u53D1\u9001 PR \u8BC4\u8BBA\u7ED9\u4EE3\u7406",
  "editor.openFile": "\u5728\u7F16\u8F91\u5668\u4E2D\u6253\u5F00",
  "editor.openLine": "\u5728\u7F16\u8F91\u5668\u4E2D\u6253\u5F00\u8BE5\u884C",
  "editor.failed": "\u6253\u5F00\u5931\u8D25",
  "repo.label": "\u4ED3\u5E93",
  "review.dockComments": "\u884C\u5185\u8BC4\u8BBA {n} \u6761",
  "review.sent": "\u5DF2\u53D1\u9001 \u2713",
  "settings.title": "\u53D8\u52A8",
  "settings.font": "\u5B57\u4F53",
  "settings.size": "\u5B57\u53F7",
  "config.title": "\u914D\u7F6E",
  "font.mono": "\u7B49\u5BBD\uFF08\u9ED8\u8BA4\uFF09",
  "font.system": "\u7CFB\u7EDF\u5B57\u4F53"
};
var en = {
  "action.label": "Changes",
  "action.aria": "Review workspace and per-round changes",
  "tab.session": "Session",
  "tab.workspace": "Workspace",
  "review.title": "Changes",
  "review.branch": "branch",
  "review.detached": "detached HEAD",
  "review.notRepo": "This directory is not a git repository",
  "review.notRepoHint": `The "Session" tab still shows every round's changes.`,
  "review.noSessionChanges": "No file changes recorded in this session yet",
  "review.sessionStats": "{rounds} rounds \xB7 {files} files",
  "review.round": "Round {round}",
  "review.empty": "No uncommitted changes \u{1F389}",
  "review.loadError": "Failed to load",
  "review.accept": "Accept",
  "review.revert": "Revert",
  "review.acceptAll": "Accept all",
  "review.revertAll": "Revert all",
  "review.unstage": "Unstage",
  "review.unstageAll": "Unstage all",
  "hunk.stage": "Stage",
  "hunk.revert": "Revert",
  "hunk.unstage": "Unstage",
  "hunk.staged": "staged",
  "hunk.unstaged": "unstaged",
  "review.confirmRevert": "Click again to confirm revert",
  "review.confirmRevertAll": "Click again to confirm revert all",
  "review.commit": "Commit",
  "review.commitPlaceholder": "Commit message\u2026",
  "review.push": "Push",
  "review.confirmPush": "Click again to confirm push",
  "review.committed": "Committed {summary}",
  "review.commitFailed": "Commit failed",
  "review.pushed": "Pushed",
  "review.pushFailed": "Push failed",
  "review.ahead": "{n} ahead",
  "review.behind": "{n} behind",
  "review.sectionStaged": "Staged",
  "review.sectionChanges": "Changes",
  "review.sectionBranch": "Branch vs remote",
  "review.noUpstream": "no upstream",
  "review.history": "History",
  "review.commitFiles": "Files",
  "history.local": "local",
  "history.remote": "remote",
  "time.now": "just now",
  "time.minutes": "{n} min ago",
  "time.hours": "{n} h ago",
  "time.days": "{n} d ago",
  "review.refresh": "Refresh",
  "review.close": "Close",
  "review.busy": "Working\u2026",
  "review.done": "{action} {count} files",
  "review.doneOne": "{action} {path}",
  "review.doneDeleted": "{action} {count} files ({deleted} untracked deleted)",
  "review.accepted": "Accepted",
  "review.reverted": "Reverted",
  "review.untracked": "untracked",
  "review.binary": "binary",
  "review.noDiffData": "No diff data for this change",
  "review.changes": "{added}+ {deleted}-",
  "view.single": "Single",
  "view.split": "Split",
  "view.before": "Before",
  "view.after": "After",
  "comment.add": "Comment on this line",
  "comment.show": "View comments",
  "comment.placeholder": "Comment\u2026 (Ctrl/\u2318+Enter to save)",
  "comment.save": "Save",
  "comment.cancel": "Cancel",
  "comment.delete": "Delete",
  "comment.saved": "Comment saved",
  "comment.failed": "Failed to save comment",
  "scope.label": "Scope",
  "scope.all": "All",
  "scope.unstaged": "Unstaged",
  "scope.staged": "Staged",
  "scope.commit": "Commit",
  "scope.branch": "Branch",
  "scope.last-turn": "Last turn",
  "review.lastTurnEmpty": 'No file changes recorded for the last turn \u2014 terminal commands (bash) that edit files are not tracked in the session log; switch to "All" to see git changes',
  "scope.base": "Base branch",
  "scope.branchReadonly": "Branch scope is read-only (merge-base diff; no accept/revert)",
  "review.selectCommit": "Select a commit from the left to view its diff",
  "review.sendToAgent": "Send to agent",
  "review.sendTitle": "Send inline comments to the agent",
  "review.sendHint": "Comments are injected into the current session as review guidance (Address the inline comments). Falls back to copyable text if sending fails.",
  "review.sentToAgent": "Sent to agent",
  "review.copy": "Copy text",
  "review.copied": "Copied",
  "review.copyFailed": "Copy failed",
  "review.review": "Review",
  "review.reviewing": "Reviewing\u2026",
  "review.reviewFailed": "Review failed",
  "review.verdictCorrect": "Patch is correct \u2713",
  "review.verdictIncorrect": "Patch needs work \u2717",
  "review.noFindings": "No issues found",
  "review.findings": "{n} findings",
  "review.confidence": "confidence {confidence}",
  "review.suggestion": "Suggestion",
  "review.sendFindings": "Send findings to agent",
  "review.sentFindings": "Findings sent to agent",
  "review.reviewScope": "Review scope",
  "pr.title": "PR #{number}",
  "pr.comments": "PR comments ({n})",
  "pr.noPr": "No associated PR",
  "pr.sendComments": "Send PR comments to agent",
  "editor.openFile": "Open in editor",
  "editor.openLine": "Open this line in editor",
  "editor.failed": "Failed to open",
  "repo.label": "Repo",
  "review.dockComments": "{n} inline comments",
  "review.sent": "Sent \u2713",
  "settings.title": "Changes",
  "settings.font": "Font",
  "settings.size": "Font size",
  "config.title": "Configuration",
  "font.mono": "Monospace (default)",
  "font.system": "System font"
};
function IconDiff() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9 10h6" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M12 7v6" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9 17h6" })
  ] });
}
function IconX() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M18 6 6 18" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m6 6 12 12" })
  ] });
}
function IconChevronDown() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m6 9 6 6 6-6" }) });
}
function IconCheck() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 6 9 17l-5-5" }) });
}
function DiffViewToggle({ view, onChange, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-view-toggle", role: "group", "aria-label": t("view.single"), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: `dsdr-view-btn${view === "single" ? " dsdr-view-btn-active" : ""}`,
        "aria-pressed": view === "single",
        onClick: () => onChange("single"),
        children: t("view.single")
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: `dsdr-view-btn${view === "split" ? " dsdr-view-btn-active" : ""}`,
        "aria-pressed": view === "split",
        onClick: () => onChange("split"),
        children: t("view.split")
      }
    )
  ] });
}
function SplitDiff({ blocks, beforeLabel, afterLabel }) {
  if (blocks.length === 0) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: beforeLabel })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", "aria-hidden": "true" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: afterLabel })
      ] })
    ] }),
    blocks.map((block, bi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      block.head ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-split-hunk", children: block.head }) : null,
      block.rows.map((row, ri) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split-row", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-split-cell ${row.leftNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-del" : ""}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", children: row.leftNum ?? "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.left })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-split-cell ${row.rightNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-add" : ""}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", children: row.rightNum ?? "" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.right })
        ] })
      ] }, ri))
    ] }, bi))
  ] }) });
}
function HunkToolbar({
  hunk,
  busy,
  onAction,
  t
}) {
  if (!hunk) return null;
  const staged = hunk.layer === "staged";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-hunk-bar", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-hunk-layer", children: staged ? t("hunk.staged") : t("hunk.unstaged") }),
    staged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => onAction("unstage", hunk), children: t("hunk.unstage") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary", disabled: busy, onClick: () => onAction("accept", hunk), children: t("hunk.stage") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-danger", disabled: busy, onClick: () => onAction("revert", hunk), children: t("hunk.revert") })
  ] });
}
function unifiedRowsWithLines(rows, oldStart, newStart) {
  let oldLine = oldStart;
  let newLine = newStart;
  return rows.map((row) => {
    if (row.kind === "ctx") return { row, oldLine: oldLine++, newLine: newLine++ };
    if (row.kind === "add") return { row, oldLine: null, newLine: newLine++ };
    if (row.kind === "del") return { row, oldLine: oldLine++, newLine: null };
    return { row, oldLine: null, newLine: null };
  });
}
function commentMatches(comment, oldLine, newLine) {
  if (comment.lineNew !== null && comment.lineNew !== newLine) return false;
  if (comment.lineOld !== null && comment.lineOld !== oldLine) return false;
  return true;
}
function CommentLine({
  count,
  open,
  onOpen,
  onToggle,
  t
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      type: "button",
      className: `dsdr-comment-add${count > 0 ? " dsdr-comment-has" : ""}`,
      title: count > 0 ? t("comment.show") : t("comment.add"),
      "aria-label": count > 0 ? t("comment.show") : t("comment.add"),
      onClick: count > 0 ? onToggle : onOpen,
      children: count > 0 ? count : "+"
    }
  );
}
function CommentEditor({
  text,
  onText,
  onSave,
  onCancel,
  busy,
  t
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-editor", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "textarea",
      {
        className: "dsdr-comment-input",
        value: text,
        autoFocus: true,
        rows: 2,
        placeholder: t("comment.placeholder"),
        onChange: (event) => onText(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Escape") onCancel();
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) onSave();
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary", disabled: busy || !text.trim(), onClick: onSave, children: t("comment.save") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: onCancel, children: t("comment.cancel") })
    ] })
  ] });
}
function UnifiedDiff({
  diff,
  hunks,
  busy,
  onHunkAction,
  t,
  comments,
  commentEditor,
  commentText,
  onCommentText,
  onOpenComment,
  onSaveComment,
  onCancelComment,
  commentPopover,
  onTogglePopover,
  onDeleteComment,
  readOnly,
  path,
  reviewFindings,
  onOpenLine,
  jumpLine
}) {
  const blocks = parseGitBlocks(diff);
  let hunkIndex = 0;
  const editingKey = commentEditor ? `${commentEditor.oldLine ?? "o"}:${commentEditor.newLine ?? "n"}` : null;
  const findingsFor = (oldLine, newLine) => {
    if (!path || !reviewFindings || reviewFindings.length === 0) return [];
    return reviewFindings.filter((f) => {
      if (f.file !== path) return false;
      if (newLine !== null) return newLine >= f.lineStart && newLine <= f.lineEnd;
      return oldLine !== null && oldLine >= f.lineStart && oldLine <= f.lineEnd;
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsdr-pre", children: blocks.map((block, bi) => {
    const isHunk = block.head?.kind === "hunk";
    const hunk = isHunk ? hunks[hunkIndex++] : void 0;
    const starts = block.head?.kind === "hunk" ? hunkStarts(block.head.text) : { oldStart: 1, newStart: 1 };
    const rows = isHunk ? unifiedRowsWithLines(block.rows, starts.oldStart, starts.newStart) : [];
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
      isHunk && !readOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HunkToolbar, { hunk, busy, onAction: onHunkAction, t }) : null,
      block.head ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsdr-line dsdr-line-${block.head.kind}`, children: block.head.text || " " }) : null,
      isHunk ? rows.map(({ row, oldLine, newLine }, ri) => {
        const key = `${oldLine ?? "o"}:${newLine ?? "n"}`;
        const rowComments = comments?.filter((c) => commentMatches(c, oldLine, newLine)) ?? [];
        const findings = findingsFor(oldLine, newLine);
        const editing = editingKey === key;
        const showActions = row.kind === "ctx" || row.kind === "add" || row.kind === "del";
        const findingCls = findings.length > 0 ? ` dsdr-line-finding dsdr-finding-${findings[0].priority}` : "";
        const jumped = jumpLine != null && (newLine === jumpLine || newLine === null && oldLine === jumpLine);
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-line dsdr-line-${row.kind}${rowComments.length > 0 ? " dsdr-line-commented" : ""}${findingCls}${jumped ? " dsdr-line-jump" : ""}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-line-num", children: newLine ?? oldLine ?? "" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-line-text", children: row.text || " " }),
            showActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              findings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `dsdr-finding-tag dsdr-finding-${findings[0].priority}`, title: findings[0].title, children: [
                findings[0].priority,
                findings.length > 1 ? `\xD7${findings.length}` : ""
              ] }) : null,
              path && onOpenLine && (newLine ?? oldLine) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "dsdr-openline",
                  title: t("editor.openLine"),
                  "aria-label": t("editor.openLine"),
                  onClick: () => onOpenLine(path, newLine ?? oldLine ?? 1),
                  children: "\u2197"
                }
              ) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                CommentLine,
                {
                  count: rowComments.length,
                  open: commentPopover === key,
                  onOpen: () => onOpenComment?.(oldLine, newLine),
                  onToggle: () => onTogglePopover?.(key),
                  t
                }
              )
            ] }) : null
          ] }),
          showActions && rowComments.length > 0 && commentPopover === key ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-pop", children: rowComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-text", children: comment.text }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-meta", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: comment.path }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-danger", disabled: busy, onClick: () => onDeleteComment?.(comment.id), children: t("comment.delete") })
            ] })
          ] }, comment.id)) }) : null,
          editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEditor, { text: commentText ?? "", onText: onCommentText ?? (() => {
          }), onSave: onSaveComment ?? (() => {
          }), onCancel: onCancelComment ?? (() => {
          }), busy, t }) : null
        ] }, ri);
      }) : block.rows.map((row, ri) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsdr-line dsdr-line-${row.kind}`, children: row.text || " " }, ri))
    ] }, bi);
  }) }) });
}
function ResizeHandle({ mode, onResize }) {
  const last = (0, import_react.useRef)(null);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: `dsdr-resize dsdr-resize-${mode}`,
      "aria-hidden": "true",
      onPointerDown: (event) => {
        last.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove: (event) => {
        if (!last.current) return;
        const dx = event.clientX - last.current.x;
        const dy = event.clientY - last.current.y;
        last.current = { x: event.clientX, y: event.clientY };
        if (dx !== 0 || dy !== 0) onResize(dx, dy);
      },
      onPointerUp: (event) => {
        last.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      },
      onPointerCancel: () => {
        last.current = null;
      }
    }
  );
}
function chipClass(status) {
  const s = status.replace(/\s/g, "");
  if (s.includes("??")) return "dsdr-chip-u";
  if (s.startsWith("A") || s.includes("A")) return "dsdr-chip-a";
  if (s.startsWith("D") || s.includes("D")) return "dsdr-chip-d";
  if (s.startsWith("R") || s.includes("R")) return "dsdr-chip-r";
  return "dsdr-chip-m";
}
async function loadStatus(cwd) {
  const res = await fetch(`${STATUS_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`status request failed: ${res.status}`);
  return await res.json();
}
async function applyChanges(cwd, action, path) {
  const res = await fetch(APPLY_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cwd, action, path })
  });
  return await res.json().catch(() => ({ ok: false, error: "invalid response" }));
}
async function applyHunk(cwd, path, action, hunk) {
  const res = await fetch(APPLY_HUNK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cwd, path, action, hunk })
  });
  return await res.json().catch(() => ({ ok: false, error: "invalid response" }));
}
async function runGitAction(cwd, action, message) {
  const url = action === "commit" ? COMMIT_URL : PUSH_URL;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(action === "commit" ? { cwd, message } : { cwd })
  });
  return await res.json().catch(() => ({ ok: false, error: "invalid response" }));
}
async function loadHistory(cwd) {
  const res = await fetch(`${HISTORY_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: "application/json" } });
  return await res.json().catch(() => ({ ok: false, commits: [], error: "invalid response" }));
}
async function loadCommitDiff(cwd, hash) {
  const res = await fetch(`${COMMIT_DIFF_URL}?cwd=${encodeURIComponent(cwd)}&hash=${encodeURIComponent(hash)}`, { headers: { accept: "application/json" } });
  return await res.json().catch(() => ({ ok: false, diff: "", files: [], added: 0, deleted: 0, error: "invalid response" }));
}
async function loadComments(cwd) {
  const res = await fetch(`${COMMENTS_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: "application/json" } });
  const data = await res.json().catch(() => ({ ok: false, comments: [] }));
  return data.ok ? data.comments : [];
}
async function saveComments(cwd, comments) {
  const res = await fetch(COMMENTS_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cwd, comments })
  });
  const data = await res.json().catch(() => ({ ok: false }));
  return data.ok === true;
}
async function loadBranches(cwd) {
  const res = await fetch(`${BRANCHES_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: "application/json" } });
  const data = await res.json().catch(() => ({ ok: false, branches: [] }));
  return data.ok ? data.branches : [];
}
async function runReview(cwd, sessionId, scope, base, commitHash) {
  const res = await fetch(REVIEW_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ cwd, sessionId: sessionId ?? void 0, scope, base, commitHash })
  });
  return await res.json().catch(() => ({ ok: false, findings: [], error: "invalid response" }));
}
async function loadPr(cwd) {
  const res = await fetch(`${PR_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: "application/json" } });
  return await res.json().catch(() => ({ ok: false, comments: [], error: "invalid response" }));
}
async function loadRepos(cwd) {
  const res = await fetch(`${REPOS_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: "application/json" } });
  return await res.json().catch(() => ({ ok: false, repos: [], error: "invalid response" }));
}
async function openInEditor(cwd, path, line) {
  const abs = path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path) ? path : `${cwd}/${path}`;
  const res = await fetch(OPEN_EDITOR_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: abs, line })
  });
  return await res.json().catch(() => ({ ok: false, error: "invalid response" }));
}
function relativeTime(iso, t) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 6e4);
  if (minutes < 1) return t("time.now");
  if (minutes < 60) return t("time.minutes", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("time.hours", { n: hours });
  return t("time.days", { n: Math.floor(hours / 24) });
}
function ThemeSelect({
  value,
  options,
  onChange,
  ariaLabel
}) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const rootRef = (0, import_react.useRef)(null);
  const current = options.find((o) => o.value === value);
  (0, import_react.useEffect)(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnKey);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnKey);
    };
  }, [open]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-sel", ref: rootRef, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: "dsdr-sel-trigger",
        "aria-haspopup": "listbox",
        "aria-expanded": open,
        "aria-label": ariaLabel,
        onClick: () => setOpen((v) => !v),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-sel-value", children: current?.label ?? value }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconChevronDown, {})
        ]
      }
    ),
    open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "dsdr-sel-menu", role: "listbox", "aria-label": ariaLabel, children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { role: "none", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        role: "option",
        "aria-selected": option.value === value,
        className: `dsdr-sel-option${option.value === value ? " dsdr-sel-option-active" : ""}`,
        onClick: () => {
          onChange(option.value);
          setOpen(false);
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-sel-option-mark", children: option.value === value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCheck, {}) : null }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-sel-option-label", children: option.label })
        ]
      }
    ) }, option.value)) }) : null
  ] });
}
function DiffReviewPrefs({ t }) {
  const prefs = (0, import_react.useSyncExternalStore)(prefsStore.subscribe, prefsStore.getSnapshot);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-cfg-field", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-cfg-label", id: "dsdr-pref-font-label", children: t("settings.font") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ThemeSelect,
        {
          ariaLabel: t("settings.font"),
          value: prefs.font,
          options: FONT_OPTIONS.map((f) => ({ value: f.id, label: f.label.startsWith("font.") ? t(f.label) : f.label })),
          onChange: (font) => prefsStore.update((d) => {
            d.font = font;
          })
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-cfg-field", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-cfg-label", id: "dsdr-pref-size-label", children: t("settings.size") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        ThemeSelect,
        {
          ariaLabel: t("settings.size"),
          value: String(prefs.size),
          options: SIZE_OPTIONS.map((s) => ({ value: String(s), label: `${s}px` })),
          onChange: (size) => prefsStore.update((d) => {
            d.size = Number(size);
          })
        }
      )
    ] })
  ] });
}
function DiffReviewAction({ sessionId, useSessions, useSession, t }) {
  const cwd = useSessions((s) => s.byId[sessionId]?.cwd);
  const nodes = useSession((s) => s.nodes);
  const changeCount = (0, import_react.useMemo)(() => countSessionChanges(nodes), [nodes]);
  const [open, setOpen] = (0, import_react.useState)(false);
  const openOverlay = () => {
    if (!cwd) return;
    overlayStore.update((d) => {
      d.open = true;
      d.cwd = cwd;
      d.key = d.key + 1;
    });
  };
  (0, import_react.useEffect)(() => {
    const unsub = overlayStore.subscribe(() => {
      setOpen(overlayStore.getSnapshot().open);
    });
    return unsub;
  }, []);
  if (!cwd) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-trigger", "aria-label": t("action.aria"), onClick: openOverlay, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconDiff, {}),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-label", children: t("action.label") }),
    changeCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-count", children: changeCount }) : null,
    open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-count", "aria-hidden": "true", children: "\u2713" }) : null
  ] });
}
function buildFileTree(items, pathOf) {
  const root = [];
  const dirIndex = /* @__PURE__ */ new Map();
  for (const item of items) {
    const path = pathOf(item);
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) continue;
    let siblings = root;
    let prefix = "";
    for (let i = 0; i < parts.length - 1; i++) {
      prefix = prefix ? `${prefix}/${parts[i]}` : parts[i];
      let dir = dirIndex.get(prefix);
      if (!dir) {
        dir = { kind: "dir", name: parts[i], path: prefix, children: [] };
        dirIndex.set(prefix, dir);
        siblings.push(dir);
      }
      siblings = dir.children;
    }
    siblings.push({ kind: "leaf", name: parts[parts.length - 1], path, item });
  }
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) if (node.kind === "dir") sortNodes(node.children);
  };
  sortNodes(root);
  return root;
}
function FileTreeView(props) {
  const { nodes, collapsed, onToggleDir, depth, renderLeaf } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: nodes.map(
    (node) => node.kind === "dir" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: `dsdr-dir${collapsed.has(node.path) ? "" : " dsdr-dir-open"}`,
          style: { paddingLeft: depth * 14 + 8 },
          "aria-expanded": !collapsed.has(node.path),
          onClick: () => onToggleDir(node.path),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dir-caret", "aria-hidden": "true", children: collapsed.has(node.path) ? "\u25B8" : "\u25BE" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dir-name", title: node.path, children: node.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dir-count", children: node.children.length })
          ]
        }
      ),
      !collapsed.has(node.path) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileTreeView, { nodes: node.children, collapsed, onToggleDir, depth: depth + 1, renderLeaf }) : null
    ] }, node.path) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { paddingLeft: depth * 14 }, children: renderLeaf(node) }, node.path)
  ) });
}
function DiffReviewComposerDock({ sessionId, useSessions, sessions, t }) {
  const cwd = useSessions((s) => s.byId[sessionId]?.cwd);
  const pending = (0, import_react.useSyncExternalStore)(pendingCommentsStore.subscribe, pendingCommentsStore.getSnapshot);
  const [hover, setHover] = (0, import_react.useState)(false);
  const [sending, setSending] = (0, import_react.useState)(false);
  const [dismissed, setDismissed] = (0, import_react.useState)(false);
  const [sentFlash, setSentFlash] = (0, import_react.useState)(false);
  const sentIds = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    if (!cwd || pending.cwd === cwd) return;
    let cancelled = false;
    void loadComments(cwd).then((list) => {
      if (cancelled) return;
      pendingCommentsStore.update((d) => {
        if (d.cwd === cwd) return;
        d.cwd = cwd;
        d.comments = list;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [cwd, pending.cwd]);
  const comments = pending.cwd === cwd ? pending.comments : [];
  const ids = comments.map((c) => c.id).join(",");
  const alreadySent = sentIds.current === ids;
  (0, import_react.useEffect)(() => {
    if (comments.length === 0) {
      setDismissed(false);
      setSentFlash(false);
      sentIds.current = null;
    }
  }, [comments.length]);
  if (!cwd || comments.length === 0 || dismissed || alreadySent) return null;
  const send = async () => {
    setSending(true);
    const lines = ["\u8BF7\u5904\u7406\u4EE5\u4E0B\u9488\u5BF9\u5F53\u524D\u5DE5\u4F5C\u533A\u7684\u884C\u5185\u8BC4\u5BA1\u8BC4\u8BBA\uFF08Address the inline comments\uFF0C\u4FDD\u6301\u6539\u52A8\u8303\u56F4\u6700\u5C0F\uFF09\uFF1A", ""];
    for (const c of comments) {
      const anchor = c.lineNew !== null ? `:${c.lineNew}` : ` (old line ${c.lineOld})`;
      lines.push(`- ${c.path}${anchor}: ${c.text}`);
    }
    const outcome = await injectToSession(sessions, sessionId, lines.join("\n"));
    setSending(false);
    if (outcome === "sent") {
      sentIds.current = comments.map((c) => c.id).join(",");
      setSentFlash(true);
      setTimeout(() => setSentFlash(false), 2e3);
    } else if (outcome === "copied") {
      sentIds.current = comments.map((c) => c.id).join(",");
      setSentFlash(true);
      setTimeout(() => setSentFlash(false), 2e3);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-dock", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-dock-pill", onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), role: "button", tabIndex: 0, "aria-label": t("review.dockComments", { n: comments.length }), children: [
      "\u{1F4AC} ",
      t("review.dockComments", { n: comments.length }),
      hover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-dock-pop", children: comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-dock-item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-dock-loc", children: [
          comment.path,
          comment.lineNew !== null ? `:${comment.lineNew}` : ""
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-text", children: comment.text })
      ] }, comment.id)) }) : null
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary dsdr-dock-send", disabled: sending, onClick: () => void send(), children: sentFlash ? t("review.sent") : sending ? t("review.busy") : t("review.sendToAgent") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-dock-close", "aria-label": t("comment.cancel"), onClick: () => setDismissed(true), children: "\u2715" })
  ] });
}
function DiffReviewOverlay({ sessions, t }) {
  const storeState = (0, import_react.useSyncExternalStore)(overlayStore.subscribe, overlayStore.getSnapshot);
  const prefs = (0, import_react.useSyncExternalStore)(prefsStore.subscribe, prefsStore.getSnapshot);
  const [tab, setTab] = (0, import_react.useState)("workspace");
  const [view, setView] = (0, import_react.useState)(() => {
    try {
      return typeof localStorage !== "undefined" && localStorage.getItem("dsdr-view") === "split" ? "split" : "single";
    } catch {
      return "single";
    }
  });
  (0, import_react.useEffect)(() => {
    try {
      localStorage.setItem("dsdr-view", view);
    } catch {
    }
  }, [view]);
  const [status, setStatus] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [selected, setSelected] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [notice, setNotice] = (0, import_react.useState)(null);
  const [confirm, setConfirm] = (0, import_react.useState)(null);
  const [commitMessage, setCommitMessage] = (0, import_react.useState)("");
  const [history, setHistory] = (0, import_react.useState)([]);
  const [selectedCommit, setSelectedCommit] = (0, import_react.useState)(null);
  const [commitDiff, setCommitDiff] = (0, import_react.useState)(null);
  const [commitDiffLoading, setCommitDiffLoading] = (0, import_react.useState)(false);
  const [selectedCommitFile, setSelectedCommitFile] = (0, import_react.useState)(null);
  const [comments, setComments] = (0, import_react.useState)([]);
  const [commentEditor, setCommentEditor] = (0, import_react.useState)(null);
  const [commentText, setCommentText] = (0, import_react.useState)("");
  const [commentPopover, setCommentPopover] = (0, import_react.useState)(null);
  const [scope, setScope] = (0, import_react.useState)("all");
  const [branches, setBranches] = (0, import_react.useState)([]);
  const [baseBranch, setBaseBranch] = (0, import_react.useState)(null);
  const [baseStatus, setBaseStatus] = (0, import_react.useState)(null);
  const [sendOpen, setSendOpen] = (0, import_react.useState)(false);
  const [sendText, setSendText] = (0, import_react.useState)("");
  const [review, setReview] = (0, import_react.useState)(null);
  const [reviewing, setReviewing] = (0, import_react.useState)(false);
  const [pr, setPr] = (0, import_react.useState)(null);
  const [repos, setRepos] = (0, import_react.useState)([]);
  const [repoPath, setRepoPath] = (0, import_react.useState)(null);
  const [jumpLine, setJumpLine] = (0, import_react.useState)(null);
  const [findingsOpen, setFindingsOpen] = (0, import_react.useState)(false);
  const jumpTo = (file, line) => {
    setSelected(file);
    setSelectedCommit(null);
    setSelectedCommitFile(null);
    setCommitDiff(null);
    setJumpLine(line ?? null);
    setTimeout(() => setJumpLine(null), 2500);
  };
  const [collapsedDirs, setCollapsedDirs] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
  const toggleDir = (0, import_react.useMemo)(
    () => (path) => {
      setCollapsedDirs((prev) => {
        const next = new Set(prev);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
    },
    []
  );
  const noticeTimer = (0, import_react.useRef)(void 0);
  const currentId = (0, import_react.useSyncExternalStore)(
    (0, import_react.useMemo)(() => (notify) => sessions.list.subscribe(notify), [sessions]),
    (0, import_react.useMemo)(() => () => sessions.list.getSnapshot().current, [sessions])
  );
  const snapshot = (0, import_react.useSyncExternalStore)(
    (0, import_react.useMemo)(() => {
      return (notify) => {
        const binding = currentId ? sessions.binding(currentId) : void 0;
        if (!binding) return () => {
        };
        return binding.session.subscribe(notify);
      };
    }, [sessions, currentId]),
    (0, import_react.useMemo)(() => {
      return () => {
        const binding = currentId ? sessions.binding(currentId) : void 0;
        return binding ? binding.session.getSnapshot() : null;
      };
    }, [sessions, currentId])
  );
  const rounds = (0, import_react.useMemo)(() => snapshot ? collectSessionRounds(snapshot.nodes) : [], [snapshot]);
  const sessionTrees = (0, import_react.useMemo)(() => new Map(rounds.map((r) => [r.round, buildFileTree(r.changes, (c) => c.path)])), [rounds]);
  const totalSessionFiles = (0, import_react.useMemo)(() => rounds.reduce((n, r) => n + r.changes.length, 0), [rounds]);
  const [selectedRound, setSelectedRound] = (0, import_react.useState)(null);
  const [selectedPath, setSelectedPath] = (0, import_react.useState)(null);
  const selectedChange = (0, import_react.useMemo)(() => {
    const round = rounds.find((r) => r.round === selectedRound);
    return round?.changes.find((c) => c.path === selectedPath) ?? null;
  }, [rounds, selectedRound, selectedPath]);
  const cwd = storeState.cwd;
  const activeCwd = repoPath ?? cwd;
  const loadWorkspace = async (silent = false) => {
    if (!activeCwd) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [next, hist, nextComments, branchList, prData, repoList] = await Promise.all([
        loadStatus(activeCwd),
        loadHistory(activeCwd),
        loadComments(activeCwd),
        loadBranches(activeCwd),
        loadPr(activeCwd),
        loadRepos(activeCwd)
      ]);
      setStatus(next);
      if (hist.ok) setHistory(hist.commits);
      setComments(nextComments);
      setBranches(branchList);
      setPr(prData);
      setRepos(repoList.repos);
      if (repoPath === null && !repoList.repos.some((r) => r.path === activeCwd)) {
        const first = repoList.repos[0];
        if (first && first.path !== cwd) setRepoPath(first.path);
      }
      if (next.error && !next.isRepo) setError(next.error);
      setSelected((prev) => prev && next.files.some((f) => f.path === prev) ? prev : next.files[0]?.path ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };
  const workspaceCwdRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    const previous = workspaceCwdRef.current;
    workspaceCwdRef.current = activeCwd ?? null;
    if (tab !== "workspace" || !activeCwd) return;
    if (previous !== activeCwd) {
      setSelectedCommit(null);
      setCommitDiff(null);
      setSelectedCommitFile(null);
      setHistory([]);
      setComments([]);
      setCommentEditor(null);
      setCommentPopover(null);
      setReview(null);
      setPr(null);
    }
    void loadWorkspace();
  }, [tab, activeCwd]);
  (0, import_react.useEffect)(() => {
    if (!storeState.open || tab !== "workspace" || !activeCwd) return;
    const timer = setInterval(() => {
      void loadWorkspace(true);
    }, 15e3);
    return () => clearInterval(timer);
  }, [storeState.open, tab, activeCwd]);
  (0, import_react.useEffect)(() => {
    if (scope !== "branch" || !activeCwd) return;
    const current = status?.branch ?? null;
    if (baseBranch === null && branches.length > 0) {
      const fallback = branches.find((b) => b !== current) ?? branches[0];
      setBaseBranch(fallback);
    }
  }, [scope, activeCwd, branches, baseBranch, status?.branch]);
  (0, import_react.useEffect)(() => {
    if (scope !== "branch" || !activeCwd || !baseBranch) {
      setBaseStatus(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetch(`${STATUS_URL}?cwd=${encodeURIComponent(activeCwd)}&base=${encodeURIComponent(baseBranch)}`, { headers: { accept: "application/json" } });
      const data = await res.json().catch(() => null);
      if (!cancelled && data) {
        setBaseStatus(data);
        if (data.error && baseStatus?.error !== data.error) setError(data.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, activeCwd, baseBranch]);
  (0, import_react.useEffect)(() => {
    if (selectedRound === null && rounds.length > 0) {
      setSelectedRound(rounds[0].round);
      setSelectedPath(rounds[0].changes[0]?.path ?? null);
    }
  }, [rounds, selectedRound]);
  (0, import_react.useEffect)(() => {
    if (!storeState.open) return;
    const onKey = (event) => {
      if (event.key === "Escape") {
        overlayStore.update((d) => {
          d.open = false;
        });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [storeState.open]);
  (0, import_react.useEffect)(() => {
    if (!notice) return;
    noticeTimer.current = setTimeout(() => setNotice(null), 3e3);
    return () => clearTimeout(noticeTimer.current);
  }, [notice]);
  const files = status?.isRepo ? status.files : [];
  const stagedFiles = (0, import_react.useMemo)(() => files.filter((f) => f.staged), [files]);
  const unstagedFiles = (0, import_react.useMemo)(() => files.filter((f) => !f.staged), [files]);
  const lastRoundPaths = (0, import_react.useMemo)(() => {
    const set = /* @__PURE__ */ new Set();
    const last = rounds[rounds.length - 1];
    if (!last || !cwd) return set;
    for (const change of last.changes) {
      set.add(change.path);
      const p = change.path;
      if (isAbsPath(p)) {
        const rel = p.startsWith(cwd) ? p.slice(cwd.length).replace(/^[\\/]+/, "") : p;
        set.add(rel);
        set.add(baseName(p));
      } else {
        set.add(baseName(p));
      }
    }
    return set;
  }, [rounds, cwd]);
  const scopeFiles = (0, import_react.useMemo)(() => {
    switch (scope) {
      case "unstaged":
        return unstagedFiles;
      case "staged":
        return stagedFiles;
      case "branch":
        return baseStatus?.files ?? [];
      case "last-turn":
        if (lastRoundPaths.size === 0) return [];
        return files.filter((f) => {
          if (lastRoundPaths.has(f.path) || lastRoundPaths.has(baseName(f.path))) return true;
          const suffix = `/${f.path}`;
          for (const p of lastRoundPaths) {
            if (p.endsWith(suffix)) return true;
          }
          return false;
        });
      default:
        return files;
    }
  }, [scope, unstagedFiles, stagedFiles, baseStatus, files, lastRoundPaths]);
  const allowActions = scope !== "branch" && scope !== "commit";
  const reviewableFiles = scope === "branch" ? baseStatus?.files?.length ?? 0 : files.length;
  const stagedCount = stagedFiles.length;
  const stagedTree = (0, import_react.useMemo)(() => buildFileTree(stagedFiles, (f) => f.path), [stagedFiles]);
  const unstagedTree = (0, import_react.useMemo)(() => buildFileTree(unstagedFiles, (f) => f.path), [unstagedFiles]);
  const scopeTree = (0, import_react.useMemo)(() => buildFileTree(scopeFiles, (f) => f.path), [scopeFiles]);
  const commitFilesTree = (0, import_react.useMemo)(
    () => commitDiff?.ok ? buildFileTree(commitDiff.files, (f) => f.path) : [],
    [commitDiff]
  );
  if (!storeState.open || !cwd) return null;
  const selectedFile = scopeFiles.find((f) => f.path === selected) ?? null;
  const totalAdded = files.reduce((n, f) => n + f.added, 0);
  const totalDeleted = files.reduce((n, f) => n + f.deleted, 0);
  const commitSegments = commitDiff?.ok ? splitCommitDiff(commitDiff.diff) : [];
  const commitActiveFile = selectedCommit && commitDiff?.ok ? commitDiff.files.find((f) => f.path === selectedCommitFile) ?? null : null;
  const commitActiveText = commitActiveFile ? commitSegments.find((s) => s.path === commitActiveFile.path)?.text ?? commitDiff?.diff ?? "" : commitDiff?.diff ?? "";
  const workspaceLeaf = ({ item: file, name: name2 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      role: "option",
      "aria-selected": file.path === selected,
      className: `dsdr-file${file.path === selected ? " dsdr-file-selected" : ""}`,
      onClick: () => {
        setSelected(file.path);
        setSelectedCommit(null);
        setSelectedCommitFile(null);
        setCommitDiff(null);
        setConfirm(null);
        setCommentEditor(null);
        setCommentPopover(null);
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-chip ${chipClass(file.status)}`, children: file.untracked ? "??" : file.status }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-name", title: file.path, children: name2 }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-stat", children: file.binary ? t("review.binary") : t("review.changes", { added: file.added, deleted: file.deleted }) })
      ]
    }
  );
  const runApply = async (action, path) => {
    setBusy(true);
    setNotice(null);
    setConfirm(null);
    try {
      const result = await applyChanges(activeCwd ?? cwd ?? "", action, path);
      if (result.ok) {
        const verb = action === "accept" ? t("review.accepted") : action === "unstage" ? t("review.unstaged") : t("review.reverted");
        setNotice({
          kind: "ok",
          text: path ? t("review.doneOne", { action: verb, path }) : result.deleted && result.deleted.length > 0 ? t("review.doneDeleted", { action: verb, count: files.length, deleted: result.deleted.length }) : t("review.done", { action: verb, count: files.length })
        });
        await loadWorkspace(true);
      } else {
        setNotice({ kind: "error", text: result.error || t("review.loadError") });
      }
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : t("review.loadError") });
    } finally {
      setBusy(false);
    }
  };
  const onFileAction = (action, path) => {
    if (action === "revert" && confirm !== "file") {
      setConfirm("file");
      setTimeout(() => setConfirm((c) => c === "file" ? null : c), 2500);
      return;
    }
    void runApply(action, path);
  };
  const onAllAction = (action) => {
    if (action === "revert" && confirm !== "all") {
      setConfirm("all");
      setTimeout(() => setConfirm((c) => c === "all" ? null : c), 2500);
      return;
    }
    void runApply(action);
  };
  const onHunkAction = async (action, hunk) => {
    if (!selectedFile || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await applyHunk(activeCwd ?? cwd ?? "", selectedFile.path, action, hunk.text);
      if (result.ok) {
        const verb = action === "accept" ? t("review.accepted") : action === "unstage" ? t("review.unstaged") : t("review.reverted");
        setNotice({ kind: "ok", text: t("review.doneOne", { action: verb, path: selectedFile.path }) });
        await loadWorkspace(true);
      } else {
        setNotice({ kind: "error", text: result.error || t("review.loadError") });
      }
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : t("review.loadError") });
    } finally {
      setBusy(false);
    }
  };
  const openComment = (oldLine, newLine) => {
    if (busy) return;
    setCommentEditor({ oldLine, newLine });
    setCommentText("");
    setCommentPopover(null);
  };
  const saveComment = async () => {
    if (!selectedFile || !commentEditor || busy) return;
    const text = commentText.trim();
    if (!text) return;
    const comment = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      path: selectedFile.path,
      lineNew: commentEditor.newLine,
      lineOld: commentEditor.oldLine,
      text,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    setBusy(true);
    try {
      const next = [...comments, comment];
      if (activeCwd && await saveComments(activeCwd, next)) {
        setComments(next);
        setCommentEditor(null);
        setCommentText("");
        setNotice({ kind: "ok", text: t("comment.saved") });
      } else {
        setNotice({ kind: "error", text: t("comment.failed") });
      }
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : t("comment.failed") });
    } finally {
      setBusy(false);
    }
  };
  const cancelComment = () => {
    setCommentEditor(null);
    setCommentText("");
  };
  const deleteComment = async (id) => {
    if (busy) return;
    const next = comments.filter((c) => c.id !== id);
    setBusy(true);
    try {
      if (activeCwd && await saveComments(activeCwd, next)) {
        setComments(next);
      } else {
        setNotice({ kind: "error", text: t("comment.failed") });
      }
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : t("comment.failed") });
    } finally {
      setBusy(false);
    }
  };
  const onReview = async () => {
    if (!activeCwd || reviewing || busy) return;
    setReviewing(true);
    setReview(null);
    setNotice(null);
    try {
      const reviewScope = scope === "branch" ? "branch" : scope === "commit" && selectedCommit ? "commit" : "uncommitted";
      const result = await runReview(activeCwd, currentId ?? null, reviewScope, baseBranch ?? void 0, selectedCommit?.hash ?? void 0);
      if (result.ok) {
        setReview(result);
      } else {
        setNotice({ kind: "error", text: result.error || t("review.reviewFailed") });
      }
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : t("review.reviewFailed") });
    } finally {
      setReviewing(false);
    }
  };
  const composeFindingsMessage = () => {
    const byPath = /* @__PURE__ */ new Map();
    for (const f of review?.findings ?? []) {
      const list = byPath.get(f.file);
      if (list) list.push(f);
      else byPath.set(f.file, [f]);
    }
    const lines = ["\u8BF7\u5904\u7406\u4EE5\u4E0B AI \u8BC4\u5BA1\u53D1\u73B0\uFF08Address the review findings\uFF0C\u4FDD\u6301\u6539\u52A8\u8303\u56F4\u6700\u5C0F\uFF09\uFF1A", ""];
    for (const [path, list] of byPath) {
      lines.push(`## ${path}`);
      for (const f of list) {
        const range = f.lineStart === f.lineEnd ? `:${f.lineStart}` : `:${f.lineStart}-${f.lineEnd}`;
        lines.push(`- [${f.priority}] ${path}${range}: ${f.title} \u2014 ${f.detail}`);
        if (f.suggestion) lines.push(`  \`\`\`
${f.suggestion}
  \`\`\``);
      }
      lines.push("");
    }
    return lines.join("\n");
  };
  const composePrMessage = () => {
    if (!pr?.pr || pr.comments.length === 0) return "";
    const lines = [`\u8BF7\u5904\u7406 PR #${pr.pr.number}\uFF08${pr.pr.title}\uFF09\u7684\u8BC4\u8BBA\uFF08Address the PR comments\uFF0C\u4FDD\u6301\u6539\u52A8\u8303\u56F4\u6700\u5C0F\uFF09\uFF1A`, ""];
    for (const c of pr.comments) {
      const anchor = c.path ? `${c.path}${c.line ? `:${c.line}` : ""}` : "general";
      lines.push(`- ${anchor} (${c.author}): ${c.body}`);
    }
    return lines.join("\n");
  };
  const openSendPanelWith = (text) => {
    setSendText(text);
    setSendOpen(true);
  };
  const openFile = async (path, line) => {
    if (!activeCwd || busy) return;
    const result = await openInEditor(activeCwd, path, line);
    if (!result.ok) setNotice({ kind: "error", text: `${t("editor.failed")}: ${result.error ?? ""}` });
  };
  const onPrCommentClick = (path, line) => {
    if (path) jumpTo(path, line ?? void 0);
    else setJumpLine(null);
  };
  (0, import_react.useEffect)(() => {
    pendingCommentsStore.update((d) => {
      d.cwd = activeCwd ?? null;
      d.comments = comments;
    });
  }, [comments, activeCwd]);
  const composeReviewMessage = () => {
    if (comments.length === 0) return "";
    const byPath = /* @__PURE__ */ new Map();
    for (const c of comments) {
      const list = byPath.get(c.path);
      if (list) list.push(c);
      else byPath.set(c.path, [c]);
    }
    const lines = [
      "\u8BF7\u5904\u7406\u4EE5\u4E0B\u9488\u5BF9\u5F53\u524D\u5DE5\u4F5C\u533A\u7684\u884C\u5185\u8BC4\u5BA1\u8BC4\u8BBA\uFF08Address the inline comments\uFF0C\u4FDD\u6301\u6539\u52A8\u8303\u56F4\u6700\u5C0F\uFF09\uFF1A",
      ""
    ];
    for (const [path, list] of byPath) {
      lines.push(`## ${path}`);
      for (const c of list) {
        const anchor = c.lineNew !== null ? `:${c.lineNew}` : ` (old line ${c.lineOld})`;
        lines.push(`- ${path}${anchor}: ${c.text}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  };
  const openSendPanel = () => {
    setSendText(composeReviewMessage());
    setSendOpen(true);
  };
  const sendToAgent = async () => {
    const text = sendText.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      const outcome = await injectToSession(sessions, currentId ?? null, text);
      setSendOpen(false);
      if (outcome === "sent") setNotice({ kind: "ok", text: t("review.sentToAgent") });
      else if (outcome === "copied") setNotice({ kind: "ok", text: t("review.copied") });
      else setNotice({ kind: "error", text: t("review.copyFailed") });
    } finally {
      setBusy(false);
    }
  };
  const onCommit = async () => {
    const message = commitMessage.trim();
    if (!message || busy || !activeCwd) return;
    setBusy(true);
    setNotice(null);
    setConfirm(null);
    try {
      const result = await runGitAction(activeCwd, "commit", message);
      if (result.ok) {
        setCommitMessage("");
        const summary = result.hash ? `${result.hash} ${result.subject ?? ""}`.trim() : result.subject ?? "";
        setNotice({ kind: "ok", text: t("review.committed", { summary }) });
        await loadWorkspace(true);
      } else {
        setNotice({ kind: "error", text: result.error || t("review.commitFailed") });
      }
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : t("review.commitFailed") });
    } finally {
      setBusy(false);
    }
  };
  const onPush = () => {
    if (busy || !activeCwd) return;
    if (confirm !== "push") {
      setConfirm("push");
      setTimeout(() => setConfirm((c) => c === "push" ? null : c), 2500);
      return;
    }
    void (async () => {
      setConfirm(null);
      setBusy(true);
      setNotice(null);
      try {
        const result = await runGitAction(activeCwd, "push");
        if (result.ok) {
          setNotice({ kind: "ok", text: t("review.pushed") });
        } else {
          setNotice({ kind: "error", text: result.error || t("review.pushFailed") });
        }
        await loadWorkspace(true);
      } catch (e) {
        setNotice({ kind: "error", text: e instanceof Error ? e.message : t("review.pushFailed") });
      } finally {
        setBusy(false);
      }
    })();
  };
  const selectCommit = (commit) => {
    if (!activeCwd) return;
    setSelected(null);
    setSelectedCommit(commit);
    setSelectedCommitFile(null);
    setConfirm(null);
    setCommitDiff(null);
    setCommitDiffLoading(true);
    void loadCommitDiff(activeCwd, commit.hash).then((d) => {
      setCommitDiff(d);
      setCommitDiffLoading(false);
      if (d.ok && d.files.length > 0) setSelectedCommitFile(d.files[0].path);
    }).catch(() => setCommitDiffLoading(false));
  };
  const close = () => {
    overlayStore.update((d) => {
      d.open = false;
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      className: "dsdr-overlay",
      onPointerDown: (event) => {
        if (event.target === event.currentTarget) close();
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "div",
        {
          className: "dsdr-panel",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": t("review.title"),
          style: { width: `${prefs.width}px`, height: `${prefs.height}px`, ...diffStyleVars(prefs) },
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ResizeHandle,
              {
                mode: "e",
                onResize: (dx) => prefsStore.update((d) => {
                  d.width = Math.max(MIN_PANEL_W, Math.min(window.innerWidth - 64, d.width + dx));
                })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ResizeHandle,
              {
                mode: "s",
                onResize: (_dx, dy) => prefsStore.update((d) => {
                  d.height = Math.max(MIN_PANEL_H, Math.min(window.innerHeight - 64, d.height + dy));
                })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ResizeHandle,
              {
                mode: "se",
                onResize: (dx, dy) => prefsStore.update((d) => {
                  d.width = Math.max(MIN_PANEL_W, Math.min(window.innerWidth - 64, d.width + dx));
                  d.height = Math.max(MIN_PANEL_H, Math.min(window.innerHeight - 64, d.height + dy));
                })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-header", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-title", children: t("review.title") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-tabs", role: "tablist", "aria-label": t("review.title"), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    role: "tab",
                    "aria-selected": tab === "session",
                    className: `dsdr-tab${tab === "session" ? " dsdr-tab-active" : ""}`,
                    onClick: () => setTab("session"),
                    children: t("tab.session")
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    role: "tab",
                    "aria-selected": tab === "workspace",
                    className: `dsdr-tab${tab === "workspace" ? " dsdr-tab-active" : ""}`,
                    onClick: () => setTab("workspace"),
                    children: t("tab.workspace")
                  }
                )
              ] }),
              tab === "workspace" && status?.isRepo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-scope", children: [
                repos.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  ThemeSelect,
                  {
                    ariaLabel: t("repo.label"),
                    value: repoPath ?? activeCwd ?? "",
                    options: repos.map((r) => ({ value: r.path, label: `${baseName(r.path)}${r.branch ? ` (${r.branch})` : ""}` })),
                    onChange: (v) => {
                      setRepoPath(v);
                      setSelected(null);
                      setReview(null);
                    }
                  }
                ) : null,
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  ThemeSelect,
                  {
                    ariaLabel: t("scope.label"),
                    value: scope,
                    options: SCOPE_OPTIONS.map((s) => ({ value: s.id, label: t(s.label) })),
                    onChange: (v) => {
                      setScope(v);
                      setSelected(null);
                    }
                  }
                ),
                scope === "branch" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  ThemeSelect,
                  {
                    ariaLabel: t("scope.base"),
                    value: baseBranch ?? "",
                    options: branches.map((b) => ({ value: b, label: b })),
                    onChange: setBaseBranch
                  }
                ) : null
              ] }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-subtitle", children: tab === "session" ? t("review.sessionStats", { rounds: rounds.length, files: totalSessionFiles }) : status?.isRepo ? `${status.branch ?? t("review.detached")} \xB7 ${t("review.changes", { added: totalAdded, deleted: totalDeleted })}${status.ahead > 0 ? ` \xB7 ${t("review.ahead", { n: status.ahead })}` : ""}${status.behind > 0 ? ` \xB7 ${t("review.behind", { n: status.behind })}` : ""}` : t("review.notRepo") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spacer" }),
              tab === "workspace" && allowActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary", disabled: busy || files.length === 0, onClick: () => onAllAction("accept"), children: t("review.acceptAll") }),
                stagedCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => void runApply("unstage"), children: t("review.unstageAll") }) : null,
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: `dsdr-btn dsdr-btn-danger${confirm === "all" ? " dsdr-btn-confirm" : ""}`,
                    disabled: busy || files.length === 0,
                    onClick: () => onAllAction("revert"),
                    children: confirm === "all" ? t("review.confirmRevertAll") : t("review.revertAll")
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "input",
                  {
                    className: "dsdr-commit-input",
                    type: "text",
                    value: commitMessage,
                    placeholder: t("review.commitPlaceholder"),
                    disabled: busy,
                    onChange: (event) => setCommitMessage(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === "Enter") void onCommit();
                    }
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy || !commitMessage.trim() || stagedCount === 0, onClick: () => void onCommit(), children: t("review.commit") })
              ] }) : null,
              tab === "workspace" && status?.isRepo && reviewableFiles > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "dsdr-btn dsdr-btn-primary",
                  disabled: busy || reviewing,
                  onClick: () => void onReview(),
                  title: t("review.reviewScope"),
                  children: reviewing ? t("review.reviewing") : t("review.review")
                }
              ) : null,
              tab === "workspace" && status?.isRepo && comments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: openSendPanel, children: [
                t("review.sendToAgent"),
                " (",
                comments.length,
                ")"
              ] }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", "aria-label": t("review.close"), onClick: close, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconX, {}) })
            ] }),
            sendOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-send", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-send-title", children: t("review.sendTitle") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-send-hint", children: t("review.sendHint") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { className: "dsdr-send-input", readOnly: true, value: sendText, spellCheck: false }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-actions", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => setSendOpen(false), children: t("comment.cancel") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "dsdr-btn",
                    disabled: busy,
                    onClick: () => {
                      void navigator.clipboard?.writeText(sendText).then(
                        () => setNotice({ kind: "ok", text: t("review.copied") }),
                        () => setNotice({ kind: "error", text: t("review.copyFailed") })
                      );
                    },
                    children: t("review.copy")
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary", disabled: busy || !sendText.trim(), onClick: () => void sendToAgent(), children: t("review.sendToAgent") })
              ] })
            ] }) : null,
            tab === "workspace" && review?.ok && reviewableFiles > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-review-strip", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: review.verdict === "incorrect" ? "dsdr-review-bad" : "dsdr-review-ok", children: review.verdict === "incorrect" ? t("review.verdictIncorrect") : t("review.verdictCorrect") }),
                review.findings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    type: "button",
                    className: `dsdr-btn dsdr-review-toggle${findingsOpen ? " dsdr-review-toggle-on" : ""}`,
                    onClick: () => setFindingsOpen((v) => !v),
                    children: [
                      t("review.findings", { n: review.findings.length }),
                      review.truncated ? " (truncated)" : ""
                    ]
                  }
                ) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  t("review.noFindings"),
                  review.truncated ? " (truncated)" : ""
                ] }),
                review.model ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-review-model", children: [
                  review.model.provider,
                  "/",
                  review.model.model
                ] }) : null,
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spacer" }),
                review.findings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => openSendPanelWith(composeFindingsMessage()), children: t("review.sendFindings") }) : null
              ] }),
              findingsOpen && review.findings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-findings", children: review.findings.map((finding, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  type: "button",
                  className: "dsdr-finding-item",
                  onClick: () => jumpTo(finding.file, finding.lineStart),
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-finding-tag dsdr-finding-${finding.priority}`, children: finding.priority }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-finding-body", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-finding-title", children: [
                        finding.title,
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-finding-loc", children: [
                          finding.file,
                          ":",
                          finding.lineStart,
                          finding.lineEnd !== finding.lineStart ? `-${finding.lineEnd}` : ""
                        ] })
                      ] }),
                      finding.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-finding-detail", children: finding.detail }) : null,
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-finding-meta", children: [
                        t("review.confidence", { confidence: finding.confidence.toFixed(2) }),
                        finding.suggestion ? ` \xB7 ${t("review.suggestion")}` : ""
                      ] }),
                      finding.suggestion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { className: "dsdr-finding-suggestion", children: finding.suggestion }) : null
                    ] })
                  ]
                },
                `${finding.file}:${finding.lineStart}-${finding.lineEnd}:${i}`
              )) }) : null
            ] }) : null,
            tab === "session" ? rounds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty", children: t("review.noSessionChanges") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-body", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-files", role: "listbox", "aria-label": t("tab.session"), children: rounds.map((round) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-round", children: [
                  t("review.round", { round: round.round }),
                  round.label ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-round-label", title: round.label, children: round.label }) : null
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  FileTreeView,
                  {
                    nodes: sessionTrees.get(round.round) ?? [],
                    collapsed: collapsedDirs,
                    onToggleDir: toggleDir,
                    depth: 0,
                    renderLeaf: ({ item: change, name: name2 }) => {
                      const key = `${round.round}:${change.path}`;
                      const selectedKey = selectedChange ? `${selectedRound}:${selectedChange.path}` : null;
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "button",
                        {
                          type: "button",
                          role: "option",
                          "aria-selected": key === selectedKey,
                          className: `dsdr-file${key === selectedKey ? " dsdr-file-selected" : ""}`,
                          onClick: () => {
                            setSelectedRound(round.round);
                            setSelectedPath(change.path);
                            setConfirm(null);
                          },
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-chip ${change.hasDiff ? "dsdr-chip-m" : "dsdr-chip-u"}`, children: change.hasDiff ? "M" : "\xB7" }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-name", title: change.path, children: name2 }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-tool", title: change.tool, children: change.tool })
                          ]
                        }
                      );
                    }
                  }
                )
              ] }, round.round)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff", children: selectedChange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-diff-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-diff-path", title: selectedChange.path, children: selectedChange.path }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-tool", children: selectedChange.tool }),
                  selectedChange.hasDiff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiffViewToggle, { view, onChange: setView, t }) : null
                ] }),
                selectedChange.hasDiff ? view === "split" && changeSplitBlocks(selectedChange).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitDiff, { blocks: changeSplitBlocks(selectedChange), beforeLabel: t("view.before"), afterLabel: t("view.after") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsdr-pre", children: changeRows(selectedChange).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsdr-line dsdr-line-${row.kind}`, children: row.text || " " }, i)) }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-nodiff", children: t("review.noDiffData") })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-empty", children: t("review.noSessionChanges") }) })
            ] }) : error && !status?.isRepo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-empty", children: [
              error,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: t("review.notRepoHint") })
            ] }) : status?.isRepo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-body", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-files", role: "listbox", "aria-label": t("tab.workspace"), children: [
                scope === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  stagedFiles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-section", children: [
                      t("review.sectionStaged"),
                      " (",
                      stagedFiles.length,
                      ")"
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      FileTreeView,
                      {
                        nodes: stagedTree,
                        collapsed: collapsedDirs,
                        onToggleDir: toggleDir,
                        depth: 0,
                        renderLeaf: workspaceLeaf
                      }
                    )
                  ] }) : null,
                  unstagedFiles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-section", children: [
                      t("review.sectionChanges"),
                      " (",
                      unstagedFiles.length,
                      ")"
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      FileTreeView,
                      {
                        nodes: unstagedTree,
                        collapsed: collapsedDirs,
                        onToggleDir: toggleDir,
                        depth: 0,
                        renderLeaf: workspaceLeaf
                      }
                    )
                  ] }) : null
                ] }) : null,
                scope === "unstaged" ? unstagedFiles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-section", children: [
                    t("review.sectionChanges"),
                    " (",
                    unstagedFiles.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    FileTreeView,
                    {
                      nodes: unstagedTree,
                      collapsed: collapsedDirs,
                      onToggleDir: toggleDir,
                      depth: 0,
                      renderLeaf: workspaceLeaf
                    }
                  )
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty", children: t("review.empty") }) : null,
                scope === "staged" ? stagedFiles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-section", children: [
                    t("review.sectionStaged"),
                    " (",
                    stagedFiles.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    FileTreeView,
                    {
                      nodes: stagedTree,
                      collapsed: collapsedDirs,
                      onToggleDir: toggleDir,
                      depth: 0,
                      renderLeaf: workspaceLeaf
                    }
                  )
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty", children: t("review.empty") }) : null,
                scope === "branch" ? scopeFiles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-section", children: [
                    t("scope.branch"),
                    " ",
                    baseBranch ? `\u2194 ${baseBranch}` : "",
                    " (",
                    scopeFiles.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-nodiff", children: t("scope.branchReadonly") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    FileTreeView,
                    {
                      nodes: scopeTree,
                      collapsed: collapsedDirs,
                      onToggleDir: toggleDir,
                      depth: 0,
                      renderLeaf: workspaceLeaf
                    }
                  )
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty", children: t("review.empty") }) : null,
                scope === "last-turn" ? scopeFiles.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-section", children: [
                    t("scope.last-turn"),
                    " (",
                    scopeFiles.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    FileTreeView,
                    {
                      nodes: scopeTree,
                      collapsed: collapsedDirs,
                      onToggleDir: toggleDir,
                      depth: 0,
                      renderLeaf: workspaceLeaf
                    }
                  )
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty", children: t("review.lastTurnEmpty") }) : null,
                (scope === "all" || scope === "commit") && history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-section", children: t("review.history") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-timeline", children: history.map((commit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "div",
                    {
                      className: `dsdr-tl-item${selectedCommit?.hash === commit.hash ? " dsdr-tl-selected" : ""}`,
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-tl-rail", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-tl-dot${commit.ahead ? " dsdr-tl-dot-local" : " dsdr-tl-dot-remote"}` }) }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "button",
                          {
                            type: "button",
                            role: "option",
                            "aria-selected": selectedCommit?.hash === commit.hash,
                            className: "dsdr-commit",
                            onClick: () => selectCommit(commit),
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-commit-head", children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-tl-badge${commit.ahead ? " dsdr-tl-badge-local" : " dsdr-tl-badge-remote"}`, children: commit.ahead ? t("history.local") : t("history.remote") }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-commit-short", children: commit.short }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-commit-subject", title: commit.subject, children: commit.subject })
                              ] }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-commit-meta", children: [
                                commit.author,
                                " \xB7 ",
                                relativeTime(commit.date, t)
                              ] })
                            ]
                          }
                        )
                      ]
                    },
                    commit.hash
                  )) })
                ] }) : null,
                (scope === "all" || scope === "commit") && selectedCommit && commitDiff?.ok && commitDiff.files.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-section", children: [
                    t("review.commitFiles"),
                    " (",
                    commitDiff.files.length,
                    ")"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    FileTreeView,
                    {
                      nodes: commitFilesTree,
                      collapsed: collapsedDirs,
                      onToggleDir: toggleDir,
                      depth: 0,
                      renderLeaf: ({ item: file, name: name2 }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "button",
                        {
                          type: "button",
                          role: "option",
                          "aria-selected": selectedCommitFile === file.path,
                          className: `dsdr-file${selectedCommitFile === file.path ? " dsdr-file-selected" : ""}`,
                          onClick: () => setSelectedCommitFile(file.path),
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-chip dsdr-chip-m", children: file.status }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-name", title: file.path, children: name2 }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-stat", children: t("review.changes", { added: file.added, deleted: file.deleted }) })
                          ]
                        }
                      )
                    }
                  )
                ] }) : null,
                scope === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-section", children: t("review.sectionBranch") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-branch", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-branch-ref", title: status.upstream ?? void 0, children: [
                      status.branch ?? t("review.detached"),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-branch-arrow", children: "\u2192" }),
                      status.upstream ?? t("review.noUpstream")
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-branch-stat", children: [
                      status.ahead > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-branch-ahead", children: t("review.ahead", { n: status.ahead }) }) : null,
                      status.behind > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-branch-behind", children: t("review.behind", { n: status.behind }) }) : null,
                      status.ahead === 0 && status.behind === 0 && status.upstream ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-branch-sync", children: "\u2713" }) : null
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "button",
                      {
                        type: "button",
                        className: `dsdr-btn${confirm === "push" ? " dsdr-btn-confirm" : ""}`,
                        disabled: busy || (status?.ahead ?? 0) === 0,
                        onClick: onPush,
                        children: confirm === "push" ? t("review.confirmPush") : `${t("review.push")}${(status?.ahead ?? 0) > 0 ? ` (${status?.ahead ?? 0})` : ""}`
                      }
                    )
                  ] }),
                  pr?.pr ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-section", children: [
                      t("pr.title", { number: pr.pr.number }),
                      pr.comments.length > 0 ? ` \xB7 ${t("pr.comments", { n: pr.comments.length })}` : ""
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-pr", children: [
                      pr.comments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-nodiff", children: t("pr.noPr") }) : null,
                      pr.comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "button",
                        {
                          type: "button",
                          className: "dsdr-pr-item",
                          onClick: () => onPrCommentClick(comment.path, comment.line),
                          children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-pr-meta", children: [
                              comment.path ? `${baseName(comment.path)}${comment.line ? `:${comment.line}` : ""}` : "general",
                              " \xB7 ",
                              comment.author
                            ] }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-pr-text", children: comment.body })
                          ]
                        },
                        comment.id
                      )),
                      pr.comments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => openSendPanelWith(composePrMessage()), children: t("pr.sendComments") }) : null
                    ] })
                  ] }) : null
                ] }) : null
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff", children: selectedCommit ? commitDiffLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-empty", children: t("review.busy") }) : commitDiff?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-diff-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-diff-path", title: selectedCommit.subject, children: [
                    selectedCommit.subject,
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-diff-hash", children: selectedCommit.short })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-tool", children: [
                    selectedCommit.author,
                    " \xB7 ",
                    relativeTime(selectedCommit.date, t)
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-diff-stats", children: t("review.changes", { added: commitDiff.added, deleted: commitDiff.deleted }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiffViewToggle, { view, onChange: setView, t })
                ] }),
                commitActiveFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-commit-file-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-diff-path", title: commitActiveFile.path, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-chip dsdr-chip-m", children: commitFileStatus(commitSegments.find((s) => s.path === commitActiveFile.path)?.text ?? "") }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-commit-file-path", children: commitActiveFile.path })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-diff-stats", children: t("review.changes", { added: commitActiveFile.added, deleted: commitActiveFile.deleted }) })
                ] }) : null,
                view === "split" && gitSplitBlocks(commitActiveText).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitDiff, { blocks: gitSplitBlocks(commitActiveText), beforeLabel: t("view.before"), afterLabel: t("view.after") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsdr-pre", children: gitDiffRows(commitActiveText).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsdr-line dsdr-line-${row.kind}`, children: row.text || " " }, i)) }) })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-empty", children: commitDiff?.error ?? t("review.noDiffData") }) : selectedFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-diff-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-diff-path", title: selectedFile.path, children: [
                    selectedFile.path,
                    selectedFile.origPath ? ` \u2190 ${selectedFile.origPath}` : ""
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-diff-stats", children: selectedFile.binary ? t("review.binary") : t("review.changes", { added: selectedFile.added, deleted: selectedFile.deleted }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiffViewToggle, { view, onChange: setView, t }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => void openFile(selectedFile.path), title: t("editor.openFile"), children: [
                    "\u2197 ",
                    t("editor.openFile")
                  ] }),
                  allowActions && selectedFile.unstaged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary", disabled: busy, onClick: () => onFileAction("accept", selectedFile.path), children: t("review.accept") }) : null,
                  allowActions && selectedFile.staged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => onFileAction("unstage", selectedFile.path), children: t("review.unstage") }) : null,
                  allowActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      className: `dsdr-btn dsdr-btn-danger${confirm === "file" ? " dsdr-btn-confirm" : ""}`,
                      disabled: busy,
                      onClick: () => onFileAction("revert", selectedFile.path),
                      children: confirm === "file" ? t("review.confirmRevert") : t("review.revert")
                    }
                  ) : null
                ] }),
                view === "split" && !selectedFile.binary && gitSplitBlocks(selectedFile.diff).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split-head", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", "aria-hidden": "true" }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("view.before") })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", "aria-hidden": "true" }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("view.after") })
                    ] })
                  ] }),
                  gitSplitBlocks(selectedFile.diff).map((block, bi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
                    allowActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HunkToolbar, { hunk: selectedFile.hunks[bi], busy, onAction: onHunkAction, t }) : null,
                    block.head ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-split-hunk", children: block.head }) : null,
                    block.rows.map((row, ri) => {
                      const rowFindings = (review?.findings ?? []).filter(
                        (f) => f.file === selectedFile.path && (row.rightNum !== null ? row.rightNum >= f.lineStart && row.rightNum <= f.lineEnd : row.leftNum !== null && row.leftNum >= f.lineStart && row.leftNum <= f.lineEnd)
                      );
                      const findingCls = rowFindings.length > 0 ? ` dsdr-cell-finding dsdr-finding-${rowFindings[0].priority}` : "";
                      const jumped = jumpLine != null && (row.rightNum === jumpLine || row.rightNum === null && row.leftNum === jumpLine);
                      const leftAnchor = { oldLine: row.leftNum, newLine: row.kind === "ctx" && row.leftNum !== null ? row.leftNum : null };
                      const rightAnchor = { oldLine: row.kind === "ctx" && row.rightNum !== null ? row.rightNum : null, newLine: row.rightNum };
                      const leftKey = `${leftAnchor.oldLine ?? "o"}:${leftAnchor.newLine ?? "n"}`;
                      const rightKey = `${rightAnchor.oldLine ?? "o"}:${rightAnchor.newLine ?? "n"}`;
                      const leftComments = comments.filter((c) => commentMatches(c, leftAnchor.oldLine, leftAnchor.newLine));
                      const rightComments = comments.filter((c) => commentMatches(c, rightAnchor.oldLine, rightAnchor.newLine));
                      const openBtn = (line) => selectedFile.path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-split-openline", title: t("editor.openLine"), "aria-label": t("editor.openLine"), onClick: () => void openFile(selectedFile.path, line), children: "\u2197" }) : null;
                      const commentBtn = (anchor, count) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        CommentLine,
                        {
                          count,
                          open: commentPopover === `${anchor.oldLine ?? "o"}:${anchor.newLine ?? "n"}`,
                          onOpen: () => {
                            setCommentEditor({ oldLine: anchor.oldLine, newLine: anchor.newLine });
                            setCommentText("");
                            setCommentPopover(null);
                          },
                          onToggle: () => setCommentPopover((prev) => prev === `${anchor.oldLine ?? "o"}:${anchor.newLine ?? "n"}` ? null : `${anchor.oldLine ?? "o"}:${anchor.newLine ?? "n"}`),
                          t
                        }
                      );
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split-row", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-split-cell ${row.leftNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-del" : ""}${findingCls}${jumped ? " dsdr-cell-jump" : ""}`, children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", children: row.leftNum ?? "" }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.left }),
                            row.leftNum !== null ? openBtn(row.leftNum) : null,
                            rowFindings.length > 0 && row.rightNum === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`, children: rowFindings[0].priority }) : null,
                            commentBtn(leftAnchor, leftComments.length)
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-split-cell ${row.rightNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-add" : ""}${findingCls}${jumped ? " dsdr-cell-jump" : ""}`, children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", children: row.rightNum ?? "" }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.right }),
                            row.rightNum !== null ? openBtn(row.rightNum) : null,
                            rowFindings.length > 0 && row.rightNum !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`, children: rowFindings[0].priority }) : null,
                            commentBtn(rightAnchor, rightComments.length)
                          ] })
                        ] }),
                        leftComments.length > 0 && commentPopover === leftKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-pop", children: leftComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-item", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-text", children: comment.text }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-meta", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: comment.path }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-danger", disabled: busy, onClick: () => void deleteComment(comment.id), children: t("comment.delete") })
                          ] })
                        ] }, comment.id)) }) : null,
                        rightComments.length > 0 && commentPopover === rightKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-pop", children: rightComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-item", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-text", children: comment.text }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-meta", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: comment.path }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-danger", disabled: busy, onClick: () => void deleteComment(comment.id), children: t("comment.delete") })
                          ] })
                        ] }, comment.id)) }) : null,
                        commentEditor && (leftKey === `${commentEditor.oldLine ?? "o"}:${commentEditor.newLine ?? "n"}` || rightKey === `${commentEditor.oldLine ?? "o"}:${commentEditor.newLine ?? "n"}`) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEditor, { text: commentText, onText: setCommentText, onSave: () => void saveComment(), onCancel: cancelComment, busy, t }) : null
                      ] }, ri);
                    })
                  ] }, bi))
                ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  UnifiedDiff,
                  {
                    diff: selectedFile.diff,
                    hunks: selectedFile.hunks,
                    busy,
                    onHunkAction,
                    t,
                    comments,
                    commentEditor,
                    commentText,
                    onCommentText: setCommentText,
                    onOpenComment: openComment,
                    onSaveComment: () => void saveComment(),
                    onCancelComment: cancelComment,
                    commentPopover,
                    onTogglePopover: (key) => setCommentPopover((prev) => prev === key ? null : key),
                    onDeleteComment: (id) => void deleteComment(id),
                    readOnly: !allowActions,
                    path: selectedFile.path,
                    reviewFindings: review?.findings,
                    onOpenLine: (p, line) => void openFile(p, line),
                    jumpLine
                  }
                )
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-empty", children: scope === "commit" ? t("review.selectCommit") : t("review.empty") }) })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-empty", children: [
              error ?? t("review.loadError"),
              !status?.isRepo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: t("review.notRepoHint") }) : null
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-foot", children: [
              (loading || busy) && tab === "workspace" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spinner", "aria-hidden": "true" }) : null,
              busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-notice", children: t("review.busy") }) : null,
              notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-notice dsdr-notice-${notice.kind}`, children: notice.text }) : null
            ] })
          ]
        }
      )
    }
  );
}
function DiffReviewConfigCard({ t }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { className: open ? "dsdr-cfg-card dsdr-cfg-card-open" : "dsdr-cfg-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-cfg-head", "aria-expanded": open, onClick: () => setOpen((v) => !v), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-cfg-head-text", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-cfg-name", children: t("settings.title") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-cfg-desc", children: t("config.title") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconChevronDownOutline14, { className: open ? "dsdr-cfg-caret dsdr-cfg-caret-open" : "dsdr-cfg-caret" })
    ] }),
    open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-cfg-body", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiffReviewPrefs, { t }) }) : null
  ] });
}
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(LOCALE_NS, { zh, en }), "diff-review: locale dictionary");
  ctx.slots.inject(
    "conversation.session.header.actions",
    () => ctx.slots.register(
      {
        name: "conversation.session.header.actions",
        id: "diff-review",
        order: 70,
        locale: LOCALE_NS
      },
      DiffReviewAction
    )
  );
  ctx.slots.inject(
    "shell.overlay",
    () => ctx.slots.register(
      {
        name: "shell.overlay",
        id: "diff-review-overlay",
        order: 10,
        locale: LOCALE_NS,
        inject: () => ({ sessions: ctx.sessions })
      },
      DiffReviewOverlay
    )
  );
  ctx.slots.inject(
    "conversation.input.dock",
    () => ctx.slots.register(
      {
        name: "conversation.input.dock",
        id: "diff-review-comments-dock",
        order: 20,
        locale: LOCALE_NS,
        inject: () => ({ sessions: ctx.sessions })
      },
      DiffReviewComposerDock
    )
  );
  ctx.slots.inject(
    "settings.plugin.item",
    () => ctx.slots.register(
      {
        name: "settings.plugin.item",
        id: "diff-review-config",
        order: 30,
        locale: LOCALE_NS
      },
      DiffReviewConfigCard
    )
  );
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERpZmYtcmV2aWV3IHBsdWdpbiBcdTIwMTQgY2xpZW50IGhhbGYuXG4gKlxuICogQ29kZXgtc3R5bGUgcmV2aWV3IHdpdGggdHdvIHNvdXJjZXM6XG4gKlxuICogMS4gKipcdTRGMUFcdThCRERcdTY2RjRcdTY1MzkgKFNlc3Npb24gY2hhbmdlcykqKiBcdTIwMTQgd2hhdCB0aGUgYWdlbnQgY2hhbmdlZCBpbiBlYWNoIHJvdW5kIG9mXG4gKiAgICB0aGlzIGNvbnZlcnNhdGlvbiwgZGVyaXZlZCBmcm9tIHRoZSBjb252ZXJzYXRpb24gc25hcHNob3QgKHRvb2wgcmVzdWx0c1xuICogICAgY2FycnkgdGhlIGhvc3QtY29tcHV0ZWQgYHJlc3VsdFZpZXdgIGRpZmYgaHVua3MpLiBXb3JrcyB3aXRoIG9yIHdpdGhvdXRcbiAqICAgIGdpdCwgYW5kIHNob3dzIGEgY2hhbmdlIGV2ZW4gd2hlbiBubyBkaWZmIHRleHQgaXMgYXZhaWxhYmxlIChwYXRoLW9ubHkpLlxuICogMi4gKipcdTVERTVcdTRGNUNcdTUzM0EgKFdvcmtzcGFjZSkqKiBcdTIwMTQgdGhlIGdpdCB3b3JraW5nIHRyZWUncyB1bmNvbW1pdHRlZCBjaGFuZ2VzXG4gKiAgICAoc3RhZ2VkICsgdW5zdGFnZWQgKyB1bnRyYWNrZWQpIHdpdGggcGVyLWZpbGUgLyBhbGwtZmlsZSBhY2NlcHQgKHN0YWdlKVxuICogICAgYW5kIHJldmVydCAoZGlzY2FyZCkgdGhyb3VnaCB0aGUgcGx1Z2luJ3Mgc2VydmVyIHJvdXRlcy5cbiAqXG4gKiBUaGUgcmV2aWV3IHN1cmZhY2UgbW91bnRzIGluIGBzaGVsbC5vdmVybGF5YCAocm9vdCBzY29wZSkuIFN0YXRlIGhhbmQtb2ZmXG4gKiBiZXR3ZWVuIHRoZSBzZXNzaW9uLXNjb3BlZCBoZWFkZXIgdHJpZ2dlciBhbmQgdGhlIHJvb3Qtc2NvcGVkIG92ZXJsYXkgZ29lc1xuICogdGhyb3VnaCBhIG1vZHVsZS1sZXZlbCBzbmFwc2hvdCBzdG9yZTsgdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCBmb3IgdGhlXG4gKiBjdXJyZW50IHNlc3Npb24gaXMgcmVhZCByZWFjdGl2ZWx5IHRocm91Z2ggYGN0eC5zZXNzaW9uc2AgKGluamVjdGVkIHZpYSB0aGVcbiAqIG92ZXJsYXkgcmVnaXN0cmF0aW9uJ3MgaW5qZWN0IGZhY2UpLlxuICovXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUsIHVzZVN5bmNFeHRlcm5hbFN0b3JlLCBGcmFnbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDU1NQcm9wZXJ0aWVzLCBSZWFjdEVsZW1lbnQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgZGlmZkxpbmVzIH0gZnJvbSAnZGlmZidcbmltcG9ydCB0eXBlIHsgQ2xpZW50Q29udGV4dCwgSVNlc3Npb25zLCBTZXNzaW9uTGlzdFN0YXRlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgeyBjcmVhdGVTbmFwc2hvdFN0b3JlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFByb3BzTG9jYWxlLCBQcm9wc1J1bnRpbWUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1zbG90cydcbmltcG9ydCB0eXBlIHsgQ29udmVyc2F0aW9uTm9kZSwgVG9vbFJlc3VsdE5vZGUsIFVzZXJNZXNzYWdlTm9kZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXJ1bnRpbWUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBTZXNzaW9uSWQsIFRvb2xSZXN1bHRWaWV3IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hcGktcmVtb3Rlcy9jbGllbnQnXG5pbXBvcnQgeyBJY29uQ2hldnJvbkRvd25PdXRsaW5lMTQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEdpdFJlc3BvbnNlLCBIaXN0b3J5UmVzcG9uc2UsIFByUmVzcG9uc2UsIFJlcG9zUmVzcG9uc2UsIFJldmlld0NvbW1lbnQsIFJldmlld0ZpbmRpbmcsIFJldmlld1Jlc3BvbnNlLCBTdGF0dXNSZXNwb25zZSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcy50cydcblxuZXhwb3J0IGNvbnN0IG5hbWUgPSAnZGlmZi1yZXZpZXcnXG5cbi8qKiBSZXF1aXJlZCBjbGllbnQgc2VydmljZXMgKGZpYmVyIGluamVjdCkuICovXG5leHBvcnQgY29uc3QgaW5qZWN0ID0gWydzZXNzaW9ucycsICdzbG90cycsICdsb2NhbGUnXVxuXG5jb25zdCBMT0NBTEVfTlMgPSAnZGlmZi1yZXZpZXcnXG5jb25zdCBTVEFUVVNfVVJMID0gJ2RpZmYtcmV2aWV3L3N0YXR1cydcbmNvbnN0IEFQUExZX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseSdcbmNvbnN0IEFQUExZX0hVTktfVVJMID0gJ2RpZmYtcmV2aWV3L2FwcGx5LWh1bmsnXG5jb25zdCBDT01NSVRfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdCdcbmNvbnN0IFBVU0hfVVJMID0gJ2RpZmYtcmV2aWV3L3B1c2gnXG5jb25zdCBISVNUT1JZX1VSTCA9ICdkaWZmLXJldmlldy9oaXN0b3J5J1xuY29uc3QgQ09NTUlUX0RJRkZfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdC1kaWZmJ1xuY29uc3QgQ09NTUVOVFNfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1lbnRzJ1xuY29uc3QgQlJBTkNIRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2JyYW5jaGVzJ1xuY29uc3QgUkVWSUVXX1VSTCA9ICdkaWZmLXJldmlldy9yZXZpZXcnXG5jb25zdCBQUl9VUkwgPSAnZGlmZi1yZXZpZXcvcHInXG5jb25zdCBSRVBPU19VUkwgPSAnZGlmZi1yZXZpZXcvcmVwb3MnXG5jb25zdCBPUEVOX0VESVRPUl9VUkwgPSAnb3Blbi1lZGl0b3Ivb3BlbidcbmNvbnN0IFNUWUxFX1RBRyA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3L3Jldmlldy5jc3MnXG5cbi8qKiBPcGVuIHN0YXRlIHNoYXJlZCBiZXR3ZWVuIHRoZSBoZWFkZXIgdHJpZ2dlciAoc2Vzc2lvbiBzY29wZSkgYW5kIHRoZSBvdmVybGF5IChyb290IHNjb3BlKS4gKi9cbmNvbnN0IG92ZXJsYXlTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8eyBvcGVuOiBib29sZWFuOyBjd2Q6IHN0cmluZyB8IG51bGw7IGtleTogbnVtYmVyIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxufSlcblxuLyoqXG4gKiBQZW5kaW5nIGlubGluZSBjb21tZW50cyBzdXJmYWNlZCBhYm92ZSB0aGUgY29tcG9zZXIgKENvZGV4LXN0eWxlKS4gVGhlXG4gKiByZXZpZXcgb3ZlcmxheSBzeW5jcyBpdHMgd29ya3NwYWNlIGNvbW1lbnRzIGhlcmU7IHRoZSBjb21wb3NlciBkb2NrIHJlYWRzXG4gKiB0aGVtIGZvciB0aGUgY3VycmVudCBzZXNzaW9uJ3Mgd29ya3NwYWNlLlxuICovXG5jb25zdCBwZW5kaW5nQ29tbWVudHNTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8eyBjd2Q6IHN0cmluZyB8IG51bGw7IGNvbW1lbnRzOiBSZXZpZXdDb21tZW50W10gfT4oe1xuICBjd2Q6IG51bGwsXG4gIGNvbW1lbnRzOiBbXSxcbn0pXG5cbi8qKiBJbmplY3QgdGV4dCBpbnRvIGEgc2Vzc2lvbiBhcyBhIHVzZXIgbWVzc2FnZTsgZmFsbHMgYmFjayB0byB0aGUgY2xpcGJvYXJkLiAqL1xuYXN5bmMgZnVuY3Rpb24gaW5qZWN0VG9TZXNzaW9uKHNlc3Npb25zOiBJU2Vzc2lvbnMgfCB1bmRlZmluZWQsIHNlc3Npb25JZDogU2Vzc2lvbklkIHwgbnVsbCwgdGV4dDogc3RyaW5nKTogUHJvbWlzZTwnc2VudCcgfCAnY29waWVkJyB8ICdmYWlsZWQnPiB7XG4gIGNvbnN0IGJpbmRpbmcgPSBzZXNzaW9uSWQgPyBzZXNzaW9ucz8uYmluZGluZyhzZXNzaW9uSWQpIDogdW5kZWZpbmVkXG4gIGNvbnN0IHNlc3Npb24gPSBiaW5kaW5nPy5zZXNzaW9uXG4gIGlmIChzZXNzaW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlc3Npb24ucHJvbXB0KFt7IHR5cGU6ICd0ZXh0JywgdGV4dCB9XSwgJ3F1ZXVlJylcbiAgICAgIGlmIChyZXN1bHQub2spIHJldHVybiAnc2VudCdcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgY29weSBmYWxsYmFja1xuICAgIH1cbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gICAgcmV0dXJuICdjb3BpZWQnXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnZmFpbGVkJ1xuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IHByZWZlcmVuY2VzIChmb250IC8gc2l6ZSAvIHBhbmVsIGdlb21ldHJ5KSwgc2hhcmVkIGJ5IHRoZSBvdmVybGF5XG4vLyBhbmQgdGhlIFNldHRpbmdzIFx1MjE5MiBHZW5lcmFsIHJvdy4gUGVyc2lzdGVkIHRvIGxvY2FsU3RvcmFnZSBieSB0aGUgc3RvcmUuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFBhbmVsIGdlb21ldHJ5IGJvdW5kcy4gKi9cbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfVyA9IDY0MFxuZXhwb3J0IGNvbnN0IE1JTl9QQU5FTF9IID0gNDAwXG5cbmludGVyZmFjZSBQcmVmcyB7XG4gIC8qKiBGb250IG9wdGlvbiBpZCAoc2VlIEZPTlRfT1BUSU9OUykuICovXG4gIGZvbnQ6IHN0cmluZ1xuICAvKiogRGlmZiB0ZXh0IHNpemUgaW4gcHguICovXG4gIHNpemU6IG51bWJlclxuICAvKiogUGFuZWwgd2lkdGggaW4gcHguICovXG4gIHdpZHRoOiBudW1iZXJcbiAgLyoqIFBhbmVsIGhlaWdodCBpbiBweC4gKi9cbiAgaGVpZ2h0OiBudW1iZXJcbn1cblxuY29uc3QgRk9OVF9PUFRJT05TOiB7IGlkOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGNzczogc3RyaW5nIH1bXSA9IFtcbiAgeyBpZDogJ21vbm8nLCBsYWJlbDogJ2ZvbnQubW9ubycsIGNzczogJ3ZhcigtLWRzdy1mb250LW1vbm8pJyB9LFxuICB7IGlkOiAnc3lzdGVtJywgbGFiZWw6ICdmb250LnN5c3RlbScsIGNzczogJ3N5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZicgfSxcbiAgeyBpZDogJ2NvbnNvbGFzJywgbGFiZWw6ICdDb25zb2xhcycsIGNzczogJ0NvbnNvbGFzLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ2pldGJyYWlucycsIGxhYmVsOiAnSmV0QnJhaW5zIE1vbm8nLCBjc3M6ICdcIkpldEJyYWlucyBNb25vXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdmaXJhJywgbGFiZWw6ICdGaXJhIENvZGUnLCBjc3M6ICdcIkZpcmEgQ29kZVwiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnc291cmNlJywgbGFiZWw6ICdTb3VyY2UgQ29kZSBQcm8nLCBjc3M6ICdcIlNvdXJjZSBDb2RlIFByb1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuXVxuXG5jb25zdCBTSVpFX09QVElPTlMgPSBbMTEsIDEyLCAxMywgMTQsIDE2LCAxOF1cblxuLyoqIFJldmlldyBzY29wZXMgb2YgdGhlIHdvcmtzcGFjZSB0YWIgKGFsaWduZWQgd2l0aCB0aGUgQ29kZXggcmV2aWV3IHBhbmUpLiAqL1xudHlwZSBXb3Jrc3BhY2VTY29wZSA9ICdhbGwnIHwgJ3Vuc3RhZ2VkJyB8ICdzdGFnZWQnIHwgJ2NvbW1pdCcgfCAnYnJhbmNoJyB8ICdsYXN0LXR1cm4nXG5cbmNvbnN0IFNDT1BFX09QVElPTlM6IHsgaWQ6IFdvcmtzcGFjZVNjb3BlOyBsYWJlbDoga2V5b2YgdHlwZW9mIHpoIH1bXSA9IFtcbiAgeyBpZDogJ2FsbCcsIGxhYmVsOiAnc2NvcGUuYWxsJyB9LFxuICB7IGlkOiAndW5zdGFnZWQnLCBsYWJlbDogJ3Njb3BlLnVuc3RhZ2VkJyB9LFxuICB7IGlkOiAnc3RhZ2VkJywgbGFiZWw6ICdzY29wZS5zdGFnZWQnIH0sXG4gIHsgaWQ6ICdjb21taXQnLCBsYWJlbDogJ3Njb3BlLmNvbW1pdCcgfSxcbiAgeyBpZDogJ2JyYW5jaCcsIGxhYmVsOiAnc2NvcGUuYnJhbmNoJyB9LFxuICB7IGlkOiAnbGFzdC10dXJuJywgbGFiZWw6ICdzY29wZS5sYXN0LXR1cm4nIH0sXG5dXG5cbi8qKiBCcm93c2VyLXNpZGUgYWJzb2x1dGUgcGF0aCBjaGVjayAobm8gbm9kZTpwYXRoIGluIHRoZSBjbGllbnQgYnVuZGxlKS4gKi9cbmZ1bmN0aW9uIGlzQWJzUGF0aChwOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHAuc3RhcnRzV2l0aCgnLycpIHx8IC9eW0EtWmEtel06W1xcXFwvXS8udGVzdChwKVxufVxuXG5mdW5jdGlvbiBiYXNlTmFtZShwOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcC5zcGxpdCgvW1xcXFwvXS8pLnBvcCgpID8/IHBcbn1cblxuY29uc3QgcHJlZnNTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UHJlZnM+KFxuICB7IGZvbnQ6ICdtb25vJywgc2l6ZTogMTIsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDcyMCB9LFxuICB7IHBlcnNpc3Q6IHsgbmFtZTogJ2RzZHItcHJlZnMnIH0gfSxcbilcblxuLyoqIENTUyBmb250LWZhbWlseSBmb3IgYSBzdG9yZWQgZm9udCBvcHRpb24gaWQuICovXG5mdW5jdGlvbiBmb250Q3NzKGlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gRk9OVF9PUFRJT05TLmZpbmQoKGYpID0+IGYuaWQgPT09IGlkKT8uY3NzID8/IEZPTlRfT1BUSU9OU1swXS5jc3Ncbn1cblxuLyoqIFBhbmVsIENTUyB2YXJpYWJsZXMgY2FycnlpbmcgdGhlIGZvbnQvc2l6ZSBwcmVmZXJlbmNlLiAqL1xuZnVuY3Rpb24gZGlmZlN0eWxlVmFycyhwcmVmczogUHJlZnMpOiBDU1NQcm9wZXJ0aWVzIHtcbiAgcmV0dXJuIHtcbiAgICAnLS1kc2RyLWRpZmYtZm9udCc6IGZvbnRDc3MocHJlZnMuZm9udCksXG4gICAgJy0tZHNkci1kaWZmLXNpemUnOiBgJHtwcmVmcy5zaXplfXB4YCxcbiAgfSBhcyBDU1NQcm9wZXJ0aWVzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2Vzc2lvbi1jaGFuZ2VzIGV4dHJhY3Rpb24gKGNsaWVudC1zaWRlLCB3b3JrcyB3aXRob3V0IGdpdCkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBiZWZvcmUvYWZ0ZXIgc2xpY2Ugb2YgYSBjaGFuZ2UgKGEgaHVuaykuICovXG5pbnRlcmZhY2UgSHVuayB7XG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBPbmUgZmlsZSBjaGFuZ2VkIGluc2lkZSBvbmUgcm91bmQuICovXG5pbnRlcmZhY2UgUm91bmRDaGFuZ2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgdG9vbDogc3RyaW5nXG4gIGh1bmtzOiBIdW5rW11cbiAgLyoqIEZhbHNlIHdoZW4gb25seSB0aGUgcGF0aCBpcyBrbm93biAobm8gZGlmZiBkYXRhIHBlcnNpc3RlZCkuICovXG4gIGhhc0RpZmY6IGJvb2xlYW5cbn1cblxuLyoqIE9uZSB1c2VyIHJvdW5kIGFuZCB0aGUgZmlsZXMgaXQgY2hhbmdlZC4gKi9cbmludGVyZmFjZSBTZXNzaW9uUm91bmQge1xuICByb3VuZDogbnVtYmVyXG4gIGxhYmVsOiBzdHJpbmdcbiAgY2hhbmdlczogUm91bmRDaGFuZ2VbXVxufVxuXG5pbnRlcmZhY2UgRmlsZURpZmZMaWtlIHtcbiAgcGF0aDogc3RyaW5nXG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBWYWxpZGF0ZSBhIHJhdyBGaWxlRGlmZi1zaGFwZWQgdmFsdWUgKHRoZSB0b29scycgYHtwYXRoLCBvbGRUZXh0LCBuZXdUZXh0fWAgY29udHJhY3QpLiAqL1xuZnVuY3Rpb24gYXNGaWxlRGlmZihyYXc6IHVua25vd24pOiBGaWxlRGlmZkxpa2UgfCBudWxsIHtcbiAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGNvbnN0IHJlYyA9IHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICBpZiAodHlwZW9mIHJlYy5wYXRoICE9PSAnc3RyaW5nJyB8fCAhcmVjLnBhdGgpIHJldHVybiBudWxsXG4gIGlmICh0eXBlb2YgcmVjLm5ld1RleHQgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbFxuICBjb25zdCBvbGRUZXh0ID0gcmVjLm9sZFRleHRcbiAgcmV0dXJuIHsgcGF0aDogcmVjLnBhdGgsIG9sZFRleHQ6IHR5cGVvZiBvbGRUZXh0ID09PSAnc3RyaW5nJyA/IG9sZFRleHQgOiBudWxsLCBuZXdUZXh0OiByZWMubmV3VGV4dCB9XG59XG5cbi8qKiBEaWZmIGh1bmtzIGNhcnJpZWQgYnkgYSBjb21wbGV0ZWQgdG9vbCByZXN1bHQgKGByZXN1bHRWaWV3LmNhcmQgPT09ICdkaWZmJ2ApLiAqL1xuZnVuY3Rpb24gZGlmZnNGcm9tUmVzdWx0VmlldyhyZXN1bHRWaWV3OiBUb29sUmVzdWx0VmlldyB8IG51bGwpOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghcmVzdWx0VmlldyB8fCByZXN1bHRWaWV3LmNhcmQgIT09ICdkaWZmJyB8fCAhQXJyYXkuaXNBcnJheShyZXN1bHRWaWV3LmRpZmZzKSkgcmV0dXJuIFtdXG4gIHJldHVybiByZXN1bHRWaWV3LmRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG4vKiogUmF3IGBtZXRhLmRpZmZzYCBmYWxsYmFjayAodGhlIHBlcnNpc3RlZCB0b29sL3Jlc3VsdCBtZXRhKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbU1ldGEobWV0YTogdW5rbm93bik6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCFtZXRhIHx8IHR5cGVvZiBtZXRhICE9PSAnb2JqZWN0JykgcmV0dXJuIFtdXG4gIGNvbnN0IGRpZmZzID0gKG1ldGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmRpZmZzXG4gIGlmICghQXJyYXkuaXNBcnJheShkaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbmNvbnN0IE1VVEFUSU9OX1RPT0xTID0gbmV3IFNldChbJ3N0cl9yZXBsYWNlX2VkaXRvcicsICdub3RlYm9va19lZGl0J10pXG5jb25zdCBNVVRBVElPTl9DT01NQU5EUyA9IG5ldyBTZXQoWyd3cml0ZScsICdlZGl0JywgJ3JlcGxhY2UnLCAnZGVsZXRlJywgJ21vdmUnXSlcblxuLyoqIFBhdGgtb25seSBmYWxsYmFjayBmb3Iga25vd24gZmlsZS1tdXRhdGluZyB0b29scyB3aG9zZSByZXN1bHQgY2FycmllZCBubyBkaWZmLiAqL1xuZnVuY3Rpb24gbXV0YXRpb25QYXRoKHRvb2w6IHN0cmluZywgYXJnc1Jhdzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGxldCBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwgPSBudWxsXG4gIHRyeSB7XG4gICAgYXJncyA9IEpTT04ucGFyc2UoYXJnc1JhdykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBpZiAoIWFyZ3MgfHwgdHlwZW9mIGFyZ3MgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBpZiAodG9vbCA9PT0gJ2ZzJyB8fCB0b29sID09PSAnZmlsZXN5c3RlbScpIHtcbiAgICBjb25zdCBjbWQgPSB0eXBlb2YgYXJncy5jb21tYW5kID09PSAnc3RyaW5nJyA/IGFyZ3MuY29tbWFuZCA6ICcnXG4gICAgaWYgKCFNVVRBVElPTl9DT01NQU5EUy5oYXMoY21kKSkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gdHlwZW9mIGFyZ3MuZmlsZV9wYXRoID09PSAnc3RyaW5nJyAmJiBhcmdzLmZpbGVfcGF0aCA/IGFyZ3MuZmlsZV9wYXRoIDogbnVsbFxuICB9XG4gIGlmIChNVVRBVElPTl9UT09MUy5oYXModG9vbCkgfHwgdG9vbC5zdGFydHNXaXRoKCdlZGl0JykpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbJ2ZpbGVfcGF0aCcsICdwYXRoJywgJ2ZpbGVuYW1lJ10pIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1trZXldID09PSAnc3RyaW5nJyAmJiBhcmdzW2tleV0pIHJldHVybiBhcmdzW2tleV0gYXMgc3RyaW5nXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbi8qKiBFeHRyYWN0IHRoZSBjaGFuZ2VkIGZpbGVzIGZyb20gb25lIHNldHRsZWQgdG9vbCByZXN1bHQgKGRpZmYgaHVua3MsIGVsc2UgcGF0aC1vbmx5KS4gKi9cbmZ1bmN0aW9uIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChjYWxsOiB7IG5hbWU6IHN0cmluZzsgYXJnc1Jhdzogc3RyaW5nIH0sIG5vZGU6IFRvb2xSZXN1bHROb2RlKTogUm91bmRDaGFuZ2VbXSB7XG4gIGNvbnN0IHRvb2wgPSBjYWxsLm5hbWVcbiAgY29uc3QgZGlmZnMgPSBkaWZmc0Zyb21SZXN1bHRWaWV3KG5vZGUucmVzdWx0VmlldylcbiAgY29uc3QgZmFsbGJhY2tEaWZmcyA9IGRpZmZzLmxlbmd0aCA9PT0gMCA/IGRpZmZzRnJvbU1ldGEobm9kZS5tZXRhKSA6IFtdXG4gIGNvbnN0IGFsbERpZmZzID0gZGlmZnMubGVuZ3RoID4gMCA/IGRpZmZzIDogZmFsbGJhY2tEaWZmc1xuICBpZiAoYWxsRGlmZnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSb3VuZENoYW5nZT4oKVxuICAgIGZvciAoY29uc3QgZCBvZiBhbGxEaWZmcykge1xuICAgICAgbGV0IGVudHJ5ID0gYnlQYXRoLmdldChkLnBhdGgpXG4gICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgIGVudHJ5ID0geyBwYXRoOiBkLnBhdGgsIHRvb2wsIGh1bmtzOiBbXSwgaGFzRGlmZjogdHJ1ZSB9XG4gICAgICAgIGJ5UGF0aC5zZXQoZC5wYXRoLCBlbnRyeSlcbiAgICAgIH1cbiAgICAgIGVudHJ5Lmh1bmtzLnB1c2goeyBvbGRUZXh0OiBkLm9sZFRleHQsIG5ld1RleHQ6IGQubmV3VGV4dCB9KVxuICAgIH1cbiAgICByZXR1cm4gWy4uLmJ5UGF0aC52YWx1ZXMoKV1cbiAgfVxuICBjb25zdCBwYXRoID0gbXV0YXRpb25QYXRoKHRvb2wsIGNhbGwuYXJnc1JhdylcbiAgcmV0dXJuIHBhdGggPyBbeyBwYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IGZhbHNlIH1dIDogW11cbn1cblxuLyoqIFBsYWluIHRleHQgb2YgYSB1c2VyIG1lc3NhZ2UgKGNvbnRlbnQgYmxvY2tzIG9mIHR5cGUgJ3RleHQnKS4gKi9cbmZ1bmN0aW9uIHVzZXJUZXh0KG5vZGU6IFVzZXJNZXNzYWdlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2Ygbm9kZS5jb250ZW50KSB7XG4gICAgaWYgKGJsb2NrICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcgJiYgKGJsb2NrIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiAoYmxvY2sgYXMgeyB0ZXh0PzogdW5rbm93biB9KS50ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgcGFydHMucHVzaCgoYmxvY2sgYXMgeyB0ZXh0OiBzdHJpbmcgfSkudGV4dClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG59XG5cbi8qKiBXYWxrIHRoZSBjb252ZXJzYXRpb24gbm9kZXMgYW5kIGdyb3VwIGNoYW5nZWQgZmlsZXMgYnkgdXNlciByb3VuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0U2Vzc2lvblJvdW5kcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogU2Vzc2lvblJvdW5kW10ge1xuICBjb25zdCByb3VuZHM6IFNlc3Npb25Sb3VuZFtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IFNlc3Npb25Sb3VuZCB8IG51bGwgPSBudWxsXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgPT09ICd1c2VyJykge1xuICAgICAgY3VycmVudCA9IHsgcm91bmQ6IHJvdW5kcy5sZW5ndGggKyAxLCBsYWJlbDogdXNlclRleHQobm9kZSkuc2xpY2UoMCwgNjApLCBjaGFuZ2VzOiBbXSB9XG4gICAgICByb3VuZHMucHVzaChjdXJyZW50KVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCAhY3VycmVudCB8fCAhbm9kZS5jYWxsKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnQuY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IGNoYW5nZS5wYXRoICYmIGMudG9vbCA9PT0gY2hhbmdlLnRvb2wpXG4gICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgaWYgKGNoYW5nZS5oYXNEaWZmKSB7XG4gICAgICAgICAgZXhpc3RpbmcuaHVua3MucHVzaCguLi5jaGFuZ2UuaHVua3MpXG4gICAgICAgICAgZXhpc3RpbmcuaGFzRGlmZiA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudC5jaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm91bmRzLmZpbHRlcigocikgPT4gci5jaGFuZ2VzLmxlbmd0aCA+IDApXG59XG5cbi8qKiBDb3VudCBvZiBjaGFuZ2VkIGZpbGVzIGFjcm9zcyBhbGwgcm91bmRzIChmb3IgdGhlIGhlYWRlciBiYWRnZSkuICovXG5leHBvcnQgZnVuY3Rpb24gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogbnVtYmVyIHtcbiAgbGV0IGNvdW50ID0gMFxuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCAhbm9kZS5jYWxsKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBrZXkgPSBgJHtjaGFuZ2UudG9vbH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICBpZiAoIXNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgc2Vlbi5hZGQoa2V5KVxuICAgICAgICBjb3VudCsrXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudFxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERpZmYgcmVuZGVyaW5nLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBTcGxpdCBvbmUgYGdpdCBzaG93IC0tZm9ybWF0PWAgZGlmZiBpbnRvIHBlci1maWxlIHNlZ21lbnRzLiAqL1xuZnVuY3Rpb24gc3BsaXRDb21taXREaWZmKGRpZmY6IHN0cmluZyk6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmcgfVtdIHtcbiAgY29uc3Qgc2VnbWVudHM6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBwYXRoOiBzdHJpbmc7IHRleHQ6IHN0cmluZ1tdIH0gfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IGxpbmUgb2YgZGlmZi5zcGxpdCgnXFxuJykpIHtcbiAgICBjb25zdCBtYXRjaCA9IC9eZGlmZiAtLWdpdCBhXFwvKC4qPykgYlxcLy8uZXhlYyhsaW5lKVxuICAgIGlmIChtYXRjaCkge1xuICAgICAgaWYgKGN1cnJlbnQpIHNlZ21lbnRzLnB1c2goY3VycmVudClcbiAgICAgIGN1cnJlbnQgPSB7IHBhdGg6IG1hdGNoWzFdLCB0ZXh0OiBbbGluZV0gfVxuICAgIH0gZWxzZSBpZiAoY3VycmVudCkge1xuICAgICAgY3VycmVudC50ZXh0LnB1c2gobGluZSlcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnQpIHNlZ21lbnRzLnB1c2goY3VycmVudClcbiAgcmV0dXJuIHNlZ21lbnRzLm1hcCgocykgPT4gKHsgcGF0aDogcy5wYXRoLCB0ZXh0OiBzLnRleHQuam9pbignXFxuJykgfSkpXG59XG5cbi8qKiBTdGF0dXMgbGV0dGVyIGZvciBhIGNvbW1pdCdzIGZpbGUsIGRlcml2ZWQgZnJvbSBpdHMgZGlmZiBzZWdtZW50IHRleHQuICovXG5mdW5jdGlvbiBjb21taXRGaWxlU3RhdHVzKHNlZ21lbnRUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoL15uZXcgZmlsZSBtb2RlLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdBJ1xuICBpZiAoL15kZWxldGVkIGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnRCdcbiAgaWYgKC9ecmVuYW1lIGZyb20gLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdSJ1xuICByZXR1cm4gJ00nXG59XG5cbnR5cGUgRGlmZlJvdyA9IHsga2luZDogJ2FkZCcgfCAnZGVsJyB8ICdjdHgnIHwgJ2h1bmsnIHwgJ2ZpbGUnIHwgJ25vdGUnOyB0ZXh0OiBzdHJpbmcgfVxuXG4vKiogQ2xhc3NpZnkgcmF3IHVuaWZpZWQtZGlmZiB0ZXh0IChnaXQgb3V0cHV0KSBpbnRvIHJvd3MuICovXG5mdW5jdGlvbiBnaXREaWZmUm93cyhkaWZmOiBzdHJpbmcpOiBEaWZmUm93W10ge1xuICByZXR1cm4gZGlmZi5zcGxpdCgnXFxuJykubWFwKChsaW5lKSA9PiB7XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKysrJykgfHwgbGluZS5zdGFydHNXaXRoKCctLS0nKSkgcmV0dXJuIHsga2luZDogJ2ZpbGUnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdAQCcpKSByZXR1cm4geyBraW5kOiAnaHVuaycgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysnKSkgcmV0dXJuIHsga2luZDogJ2FkZCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkgcmV0dXJuIHsga2luZDogJ2RlbCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ1xcXFwgJykpIHJldHVybiB7IGtpbmQ6ICdub3RlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgcmV0dXJuIHsga2luZDogJ2N0eCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICB9KVxufVxuXG4vKiogQ29tcHV0ZSBhZGQvZGVsL2N0eCByb3dzIGJldHdlZW4gdHdvIHRleHRzICh0aGUgdG9vbHMnIEZpbGVEaWZmIHNoYXBlKS4gKi9cbmZ1bmN0aW9uIHRleHREaWZmUm93cyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBEaWZmUm93W10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm93c1xufVxuXG4vKiogQWxsIHJvd3MgZm9yIG9uZSByb3VuZCBjaGFuZ2UgKG11bHRpcGxlIGh1bmtzIGdldCBgQEBgIHNlcGFyYXRvcnMpLiAqL1xuZnVuY3Rpb24gY2hhbmdlUm93cyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogRGlmZlJvd1tdIHtcbiAgaWYgKCFjaGFuZ2UuaGFzRGlmZiB8fCBjaGFuZ2UuaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgY2hhbmdlLmh1bmtzLmZvckVhY2goKGh1bmssIGkpID0+IHtcbiAgICBpZiAoY2hhbmdlLmh1bmtzLmxlbmd0aCA+IDEpIHJvd3MucHVzaCh7IGtpbmQ6ICdodW5rJywgdGV4dDogYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgfSlcbiAgICByb3dzLnB1c2goLi4udGV4dERpZmZSb3dzKGh1bmsub2xkVGV4dCwgaHVuay5uZXdUZXh0KSlcbiAgfSlcbiAgcmV0dXJuIHJvd3Ncbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTcGxpdCAodHdvLWNvbHVtbikgZGlmZiB2aWV3LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYWxpZ25lZCByb3cgb2YgdGhlIHNpZGUtYnktc2lkZSB2aWV3LiAqL1xuaW50ZXJmYWNlIFNwbGl0Um93IHtcbiAgbGVmdDogc3RyaW5nXG4gIHJpZ2h0OiBzdHJpbmdcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG9sZCBmaWxlLCBvciBudWxsIChwdXJlIGFkZGl0aW9uKS4gKi9cbiAgbGVmdE51bTogbnVtYmVyIHwgbnVsbFxuICAvKiogMS1iYXNlZCBsaW5lIG51bWJlciBpbiB0aGUgbmV3IGZpbGUsIG9yIG51bGwgKHB1cmUgZGVsZXRpb24pLiAqL1xuICByaWdodE51bTogbnVtYmVyIHwgbnVsbFxuICBraW5kOiAnY3R4JyB8ICdjaGFuZ2UnXG59XG5cbi8qKiBPbmUgc2lkZS1ieS1zaWRlIGJsb2NrIChhIGh1bmsgd2l0aCBpdHMgYEBAYCBoZWFkZXIpLiAqL1xuaW50ZXJmYWNlIFNwbGl0QmxvY2sge1xuICBoZWFkOiBzdHJpbmcgfCBudWxsXG4gIHJvd3M6IFNwbGl0Um93W11cbn1cblxuLyoqXG4gKiBQYWlyIGFkZC9kZWwgcm93cyBpbnRvIGFsaWduZWQgbGVmdC9yaWdodCBjb2x1bW5zLiBSZW1vdmVkIGxpbmVzIGJ1ZmZlclxuICogdW50aWwgdGhlIG1hdGNoaW5nIGFkZGl0aW9ucyBhcnJpdmUgKHVuaWZpZWQgZGlmZiBvcmRlcnMgZGVsZXRpb25zIGJlZm9yZVxuICogYWRkaXRpb25zKSwgc28gcHVyZSBkZWxldGlvbnMgYW5kIHB1cmUgYWRkaXRpb25zIHN0aWxsIGdldCB0aGVpciBvd24gcm93XG4gKiB3aXRoIGFuIGVtcHR5IGNlbGwgb24gdGhlIG9wcG9zaXRlIHNpZGUuIExpbmUgbnVtYmVycyB0cmFjayBmcm9tIHRoZSBodW5rXG4gKiBoZWFkZXIncyBgLWEsYiArYyxkYCBwb3NpdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIHBhaXJSb3dzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IFNwbGl0Um93W10ge1xuICBjb25zdCBvdXQ6IFNwbGl0Um93W10gPSBbXVxuICBsZXQgb2xkTGluZSA9IG9sZFN0YXJ0XG4gIGxldCBuZXdMaW5lID0gbmV3U3RhcnRcbiAgbGV0IHBlbmRpbmc6IHsgdGV4dDogc3RyaW5nOyBudW06IG51bWJlciB9W10gPSBbXVxuICBjb25zdCBmbHVzaCA9ICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGVuZGluZykgb3V0LnB1c2goeyBsZWZ0OiBwLnRleHQsIHJpZ2h0OiAnJywgbGVmdE51bTogcC5udW0sIHJpZ2h0TnVtOiBudWxsLCBraW5kOiAnY2hhbmdlJyB9KVxuICAgIHBlbmRpbmcgPSBbXVxuICB9XG4gIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSB7XG4gICAgICBwZW5kaW5nLnB1c2goeyB0ZXh0OiByb3cudGV4dC5zbGljZSgxKSwgbnVtOiBvbGRMaW5lKysgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnYWRkJykge1xuICAgICAgY29uc3QgcCA9IHBlbmRpbmcuc2hpZnQoKVxuICAgICAgb3V0LnB1c2goeyBsZWZ0OiBwPy50ZXh0ID8/ICcnLCByaWdodDogcm93LnRleHQuc2xpY2UoMSksIGxlZnROdW06IHA/Lm51bSA/PyBudWxsLCByaWdodE51bTogbmV3TGluZSsrLCBraW5kOiAnY2hhbmdlJyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdjdHgnKSB7XG4gICAgICBmbHVzaCgpXG4gICAgICAvLyBVbmlmaWVkLWRpZmYgY29udGV4dCBsaW5lcyBjYXJyeSBhIGxlYWRpbmcgc3BhY2UgXHUyMDE0IHN0cmlwIGl0IGZvciB0aGVcbiAgICAgIC8vIHNwbGl0IGNlbGxzIHNvIGJvdGggY29sdW1ucyByZW5kZXIgYmFyZSB0ZXh0LlxuICAgICAgY29uc3QgdGV4dCA9IHJvdy50ZXh0LnN0YXJ0c1dpdGgoJyAnKSA/IHJvdy50ZXh0LnNsaWNlKDEpIDogcm93LnRleHRcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogdGV4dCwgcmlnaHQ6IHRleHQsIGxlZnROdW06IG9sZExpbmUrKywgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2N0eCcgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZmx1c2goKSAvLyBub3RlcyAoXFwgTm8gbmV3bGluZVx1MjAyNikgYW5kIHN0cmF5IHJvd3M6IGp1c3QgYnJlYWsgdGhlIHBhaXJpbmdcbiAgICB9XG4gIH1cbiAgZmx1c2goKVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBQYXJzZSBnaXQgdW5pZmllZCBkaWZmIHRleHQgaW50byBibG9ja3MgKGAtLS0vKysrYCBmaWxlIHJvd3MgYW5kIGBAQGAgaHVua3MpLiAqL1xuY29uc3QgR0lUX01FVEEgPSAvXihkaWZmIC0tZ2l0IHxpbmRleCB8bmV3IGZpbGUgfGRlbGV0ZWQgZmlsZSB8b2xkIG1vZGUgfG5ldyBtb2RlIHxzaW1pbGFyaXR5IGluZGV4IHxyZW5hbWUgKGZyb218dG8pIHxCaW5hcnkgZmlsZXMgKS9cblxuZnVuY3Rpb24gcGFyc2VHaXRCbG9ja3MoZGlmZjogc3RyaW5nKTogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH1bXSB7XG4gIGNvbnN0IGJsb2NrczogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH1bXSA9IFtdXG4gIGxldCBjdXJyZW50OiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfSB8IG51bGwgPSBudWxsXG4gIGNvbnN0IGxpbmVzID0gZGlmZi5zcGxpdCgnXFxuJylcbiAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBsZXQga2luZDogRGlmZlJvd1sna2luZCddXG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKysrJykgfHwgbGluZS5zdGFydHNXaXRoKCctLS0nKSB8fCBHSVRfTUVUQS50ZXN0KGxpbmUpKSBraW5kID0gJ2ZpbGUnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdAQCcpKSBraW5kID0gJ2h1bmsnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIGtpbmQgPSAnYWRkJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnLScpKSBraW5kID0gJ2RlbCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ1xcXFwgJykpIGtpbmQgPSAnbm90ZSdcbiAgICBlbHNlIGtpbmQgPSAnY3R4J1xuICAgIGlmIChraW5kID09PSAnZmlsZScgfHwga2luZCA9PT0gJ2h1bmsnKSB7XG4gICAgICBjdXJyZW50ID0geyBoZWFkOiB7IGtpbmQsIHRleHQ6IGxpbmUgfSwgcm93czogW10gfVxuICAgICAgYmxvY2tzLnB1c2goY3VycmVudClcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnQgPSB7IGhlYWQ6IG51bGwsIHJvd3M6IFtdIH1cbiAgICAgICAgYmxvY2tzLnB1c2goY3VycmVudClcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQucm93cy5wdXNoKHsga2luZCwgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gYmxvY2tzXG59XG5cbi8qKiBIdW5rIHN0YXJ0IHBvc2l0aW9ucyBmcm9tIGEgYEBAIC1hLGIgK2MsZCBAQGAgaGVhZGVyLiAqL1xuZnVuY3Rpb24gaHVua1N0YXJ0cyhoZWFkOiBzdHJpbmcpOiB7IG9sZFN0YXJ0OiBudW1iZXI7IG5ld1N0YXJ0OiBudW1iZXIgfSB7XG4gIGNvbnN0IG0gPSAvXkBAIC0oXFxkKykoPzosXFxkKyk/IFxcKyhcXGQrKS8uZXhlYyhoZWFkKVxuICByZXR1cm4geyBvbGRTdGFydDogbSA/IE51bWJlcihtWzFdKSA6IDEsIG5ld1N0YXJ0OiBtID8gTnVtYmVyKG1bMl0pIDogMSB9XG59XG5cbi8qKiBTaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBhIGdpdCB1bmlmaWVkIGRpZmYgKHNraXBzIHB1cmUgZmlsZS1oZWFkZXIgYmxvY2tzKS4gKi9cbmZ1bmN0aW9uIGdpdFNwbGl0QmxvY2tzKGRpZmY6IHN0cmluZyk6IFNwbGl0QmxvY2tbXSB7XG4gIHJldHVybiBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICAgIC5maWx0ZXIoKGIpID0+IGIuaGVhZD8ua2luZCAhPT0gJ2ZpbGUnICYmIChiLnJvd3MubGVuZ3RoID4gMCB8fCBiLmhlYWQ/LmtpbmQgPT09ICdodW5rJykpXG4gICAgLm1hcCgoYikgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRzID0gYi5oZWFkID8gaHVua1N0YXJ0cyhiLmhlYWQudGV4dCkgOiB7IG9sZFN0YXJ0OiAxLCBuZXdTdGFydDogMSB9XG4gICAgICByZXR1cm4geyBoZWFkOiBiLmhlYWQ/LmtpbmQgPT09ICdodW5rJyA/IGIuaGVhZC50ZXh0IDogbnVsbCwgcm93czogcGFpclJvd3MoYi5yb3dzLCBzdGFydHMub2xkU3RhcnQsIHN0YXJ0cy5uZXdTdGFydCkgfVxuICAgIH0pXG59XG5cbi8qKiBTaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciB0aGUgdG9vbHMnIEZpbGVEaWZmIHNoYXBlIChvbGRUZXh0L25ld1RleHQpLiAqL1xuZnVuY3Rpb24gdGV4dFNwbGl0QmxvY2tzKG9sZFRleHQ6IHN0cmluZyB8IG51bGwsIG5ld1RleHQ6IHN0cmluZyk6IFNwbGl0QmxvY2tbXSB7XG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMob2xkVGV4dCA/PyAnJywgbmV3VGV4dCkpIHtcbiAgICBjb25zdCBsaW5lcyA9IHBhcnQudmFsdWUuc3BsaXQoJ1xcbicpXG4gICAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgaWYgKHBhcnQuYWRkZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdhZGQnLCB0ZXh0OiBgKyR7bGluZX1gIH0pXG4gICAgICBlbHNlIGlmIChwYXJ0LnJlbW92ZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdkZWwnLCB0ZXh0OiBgLSR7bGluZX1gIH0pXG4gICAgICBlbHNlIHJvd3MucHVzaCh7IGtpbmQ6ICdjdHgnLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBbeyBoZWFkOiBudWxsLCByb3dzOiBwYWlyUm93cyhyb3dzLCAxLCAxKSB9XVxufVxuXG4vKiogQWxsIHNpZGUtYnktc2lkZSBibG9ja3MgZm9yIG9uZSByb3VuZCBjaGFuZ2UuICovXG5mdW5jdGlvbiBjaGFuZ2VTcGxpdEJsb2NrcyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogU3BsaXRCbG9ja1tdIHtcbiAgaWYgKCFjaGFuZ2UuaGFzRGlmZiB8fCBjaGFuZ2UuaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgcmV0dXJuIGNoYW5nZS5odW5rcy5tYXAoKGh1bmssIGkpID0+ICh7XG4gICAgaGVhZDogY2hhbmdlLmh1bmtzLmxlbmd0aCA+IDEgPyBgQEAgaHVuayAke2kgKyAxfS8ke2NoYW5nZS5odW5rcy5sZW5ndGh9IEBAYCA6IG51bGwsXG4gICAgcm93czogdGV4dFNwbGl0QmxvY2tzKGh1bmsub2xkVGV4dCwgaHVuay5uZXdUZXh0KVswXS5yb3dzLFxuICB9KSlcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTdHlsZXMgKGRzZHItKjsgdGhlIGhlYWRlciB0cmlnZ2VyIG1pcnJvcnMgdGhlIGluLXRyZWUgYWN0aW9uIHJvd3MpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IFJFVklFV19DU1MgPSBgXG4uZHNkci10cmlnZ2Vye21pbi1oZWlnaHQ6MjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NHB4O3BhZGRpbmc6M3B4IDZweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItdHJpZ2dlcjpob3ZlciwuZHNkci10cmlnZ2VyOmZvY3VzLXZpc2libGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1sYWJlbHttYXJnaW4tbGVmdDoycHh9XG4uZHNkci1jb3VudHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtib3JkZXItcmFkaXVzOjk5OXB4O21pbi13aWR0aDoxNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDVweDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1vdmVybGF5e3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7ei1pbmRleDoyMDA7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLC40NSk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MzJweH1cbi5kc2RyLXBhbmVse2JveC1zaXppbmc6Ym9yZGVyLWJveDtwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDptaW4oMTEyMHB4LDEwMCUpO2hlaWdodDptaW4oNzIwcHgsY2FsYygxMDB2aCAtIDY0cHgpKTttYXgtd2lkdGg6Y2FsYygxMDB2dyAtIDY0cHgpO21heC1oZWlnaHQ6Y2FsYygxMDB2aCAtIDY0cHgpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjE0cHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1yZXNpemV7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDo1fVxuLmRzZHItcmVzaXplLWV7dG9wOjA7cmlnaHQ6LTNweDt3aWR0aDo3cHg7aGVpZ2h0OjEwMCU7Y3Vyc29yOmV3LXJlc2l6ZX1cbi5kc2RyLXJlc2l6ZS1ze2JvdHRvbTotM3B4O2xlZnQ6MDt3aWR0aDoxMDAlO2hlaWdodDo3cHg7Y3Vyc29yOm5zLXJlc2l6ZX1cbi5kc2RyLXJlc2l6ZS1zZXtyaWdodDotNHB4O2JvdHRvbTotNHB4O3dpZHRoOjE1cHg7aGVpZ2h0OjE1cHg7Y3Vyc29yOm53c2UtcmVzaXplfVxuLmRzZHItaGVhZGVye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzoxMnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItdGl0bGV7Zm9udC1zaXplOjE0cHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXN1YnRpdGxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEycHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci10YWJze2Rpc3BsYXk6ZmxleDtnYXA6NHB4O21hcmdpbi1sZWZ0OjE0cHh9XG4uZHNkci10YWJ7Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjZweDtib3JkZXI6MXB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjJweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItdGFiOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdGFiLWFjdGl2ZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNjb3Ble2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWFyZ2luLWxlZnQ6OHB4fVxuLmRzZHItc2NvcGUgLmRzZHItc2VsLXRyaWdnZXJ7bWluLXdpZHRoOjExMHB4O2hlaWdodDoyNnB4O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cGFkZGluZzowIDhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLXNwYWNlcntmbGV4OjF9XG4uZHNkci1idG57Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzozcHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnRuOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1idG46ZGlzYWJsZWR7b3BhY2l0eTouNTtjdXJzb3I6ZGVmYXVsdH1cbi5kc2RyLWJ0bi1wcmltYXJ5e2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTQwMCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tZGFuZ2VyOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1jb25maXJte2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1idG4tY29uZmlybTpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTUwKX1cbi5kc2RyLWNvbW1pdC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MjAwcHg7bWluLWhlaWdodDoyOHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci1jb21taXQtaW5wdXQ6OnBsYWNlaG9sZGVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1jYXB0aW9uKX1cbi5kc2RyLWNvbW1pdC1pbnB1dDpmb2N1c3tvdXRsaW5lOm5vbmU7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KX1cbi5kc2RyLXNlY3Rpb257Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6MTBweCA4cHggM3B4O2ZvbnQtd2VpZ2h0OjYwMDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHh9XG4uZHNkci1zZWN0aW9uOmZpcnN0LWNoaWxke3BhZGRpbmctdG9wOjRweH1cbi5kc2RyLWJyYW5jaHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo0cHggOHB4IDhweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLWJyYW5jaC1yZWZ7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO21pbi13aWR0aDowO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHh9XG4uZHNkci1icmFuY2gtYXJyb3d7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWJyYW5jaC1zdGF0e2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7Zm9udC1zaXplOjExcHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItYnJhbmNoLWFoZWFke2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItYnJhbmNoLWJlaGluZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtd2Fybi1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1zeW5je2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItY29tbWl0e2ZsZXg6MTttaW4td2lkdGg6MDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo1cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jb21taXQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItdGwtc2VsZWN0ZWQgLmRzZHItY29tbWl0e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRpbWVsaW5le2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci10bC1pdGVte2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2FsaWduLWl0ZW1zOnN0cmV0Y2g7Ym9yZGVyLXJhZGl1czo4cHh9XG4uZHNkci10bC1yYWlse3Bvc2l0aW9uOnJlbGF0aXZlO2ZsZXg6bm9uZTt3aWR0aDoxNHB4O2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyfVxuLmRzZHItdGwtcmFpbDo6YmVmb3Jle2NvbnRlbnQ6XCJcIjtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtib3R0b206MDtsZWZ0OjUwJTt3aWR0aDoxcHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKX1cbi5kc2RyLXRsLWl0ZW06Zmlyc3QtY2hpbGQgLmRzZHItdGwtcmFpbDo6YmVmb3Jle3RvcDo5cHh9XG4uZHNkci10bC1pdGVtOmxhc3QtY2hpbGQgLmRzZHItdGwtcmFpbDo6YmVmb3Jle2JvdHRvbTphdXRvO2hlaWdodDo5cHh9XG4uZHNkci10bC1kb3R7cG9zaXRpb246cmVsYXRpdmU7ei1pbmRleDoxO3RvcDo5cHg7ZmxleDpub25lO3dpZHRoOjdweDtoZWlnaHQ6N3B4O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSl9XG4uZHNkci10bC1kb3QtbG9jYWx7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWRvdC1yZW1vdGV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItY29tbWl0LWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21pbi13aWR0aDowfVxuLmRzZHItY29tbWl0LXNob3J0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LXN1YmplY3R7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWNvbW1pdC1tZXRhe2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZy1sZWZ0OjB9XG4uZHNkci10bC1iYWRnZXtmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDtib3JkZXItcmFkaXVzOjRweDtwYWRkaW5nOjAgNXB4fVxuLmRzZHItdGwtYmFkZ2UtbG9jYWx7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdGwtYmFkZ2UtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1kaWZmLWhhc2h7bWFyZ2luLWxlZnQ6OHB4O2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jb21taXQtZmlsZS1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci1jb21taXQtZmlsZS1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTttYXJnaW4tbGVmdDo0cHh9XG4uZHNkci1jZmctY2FyZHtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTMpO2JvcmRlci1yYWRpdXM6MTJweDtsaXN0LXN0eWxlOm5vbmU7dHJhbnNpdGlvbjpib3JkZXItY29sb3IgLjE2cyxiYWNrZ3JvdW5kIC4xNnN9XG4uZHNkci1jZmctY2FyZDpob3Zlcntib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jZmctY2FyZC1vcGVue2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLWNmZy1oZWFke2FwcGVhcmFuY2U6bm9uZTt3aWR0aDoxMDAlO2ZvbnQ6aW5oZXJpdDtjb2xvcjppbmhlcml0O3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjEycHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMnB4O3BhZGRpbmc6MTRweCAxNnB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWNmZy1oZWFkOmZvY3VzLXZpc2libGV7b3V0bGluZToycHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpO291dGxpbmUtb2Zmc2V0Oi0ycHh9XG4uZHNkci1jZmctaGVhZC10ZXh0e2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtmbGV4OjE7Z2FwOjRweDttaW4td2lkdGg6MDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctbmFtZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NjAwO2xpbmUtaGVpZ2h0OjEuNH1cbi5kc2RyLWNmZy1kZXNje2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLWNhcmV0e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7ZmxleDpub25lO3RyYW5zaXRpb246dHJhbnNmb3JtIC4xNnN9XG4uZHNkci1jZmctY2FyZXQtb3Blbnt0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9XG4uZHNkci1jZmctYm9keXtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTttYXJnaW46MCAxNnB4O3BhZGRpbmctYm90dG9tOjhweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItY2ZnLWZpZWxke2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3BhZGRpbmc6MTJweCAwO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWNmZy1maWVsZCsuZHNkci1jZmctZmllbGR7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMil9XG4uZHNkci1jZmctbGFiZWx7bWluLXdpZHRoOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZsZXg6MTtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo1MDA7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLWhpbnR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTttYXJnaW46MDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctcGVuZGluZ3t3aGl0ZS1zcGFjZTpub3dyYXA7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtib3JkZXItcmFkaXVzOjk5OXB4O2ZsZXg6bm9uZTtwYWRkaW5nOjFweCA4cHg7Zm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6NTAwO2xpbmUtaGVpZ2h0OjE3cHh9XG4uZHNkci1jZmctZmFpbGVke21pbi13aWR0aDowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1lcnJvcik7ZmxleDoxO21hcmdpbjowO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1hY3Rpb25ze2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2p1c3RpZnktY29udGVudDpmbGV4LWVuZDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjEycHggMCA0cHg7ZGlzcGxheTpmbGV4fVxuLmRzZHItYm9keXtkaXNwbGF5OmZsZXg7ZmxleDoxO21pbi1oZWlnaHQ6MH1cbi5kc2RyLWZpbGVze3dpZHRoOjMwMHB4O2ZsZXg6bm9uZTtib3JkZXItcmlnaHQ6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO292ZXJmbG93LXk6YXV0bztwYWRkaW5nOjhweH1cbi5kc2RyLXJvdW5ke2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjhweCA4cHggM3B4O2ZvbnQtd2VpZ2h0OjYwMH1cbi5kc2RyLXJvdW5kLWxhYmVse3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbjtmb250LXdlaWdodDo0MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1maWxle2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWZpbGU6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZmlsZS1zZWxlY3RlZHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1kaXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlci1yYWRpdXM6N3B4O3BhZGRpbmc6NXB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udC1zaXplOjEycHh9XG4uZHNkci1kaXI6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWRpci1jYXJldHtmbGV4Om5vbmU7d2lkdGg6MTJweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItZGlyLW5hbWV7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbjtmb250LXdlaWdodDo2MDB9XG4uZHNkci1kaXItY291bnR7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItZmlsZS1uYW1le2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1maWxlLXN0YXR7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItY2hpcHtmbGV4Om5vbmU7bWluLXdpZHRoOjIycHg7dGV4dC1hbGlnbjpjZW50ZXI7Ym9yZGVyLXJhZGl1czo1cHg7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtwYWRkaW5nOjAgNHB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY2hpcC1te2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjojMmVhMDQzfVxuLmRzZHItY2hpcC1he2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjojMmVhMDQzfVxuLmRzZHItY2hpcC1ke2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE2KTtjb2xvcjojZjg1MTQ5fVxuLmRzZHItY2hpcC1ye2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNik7Y29sb3I6IzU4YTZmZn1cbi5kc2RyLWNoaXAtdXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItdG9vbHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWRpZmZ7ZmxleDoxO21pbi13aWR0aDowO292ZXJmbG93OmF1dG87cGFkZGluZzoxMHB4IDB9XG4uZHNkci1kaWZmLWVtcHR5e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtoZWlnaHQ6MTAwJTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4fVxuLmRzZHItZGlmZi1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo2cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXBhdGh7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjEzcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1kaWZmLXN0YXRze2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO2ZsZXg6bm9uZX1cbi5kc2RyLWRpZmYtc2Nyb2xse2ZsZXg6MTttaW4taGVpZ2h0OjA7b3ZlcmZsb3c6YXV0bztkaXNwbGF5OmZsZXh9XG4uZHNkci1wcmV7bWFyZ2luOjA7cGFkZGluZzo4cHggMDtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZTp2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpO3doaXRlLXNwYWNlOnByZTttaW4td2lkdGg6MTAwJTtmbGV4OjF9XG4uZHNkci1saW5le2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDoxMHB4O3BhZGRpbmc6MCAxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwb3NpdGlvbjpyZWxhdGl2ZX1cbi5kc2RyLWxpbmUtbnVte2ZsZXg6bm9uZTt3aWR0aDozNHB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZTpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSAtIDFweCk7b3BhY2l0eTouNzV9XG4uZHNkci1saW5lLXRleHR7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOnByZX1cbi5kc2RyLWNvbW1lbnQtYWRke2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MThweDtoZWlnaHQ6MThweDtib3JkZXItcmFkaXVzOjZweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7bWFyZ2luLXRvcDoxcHg7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRkLC5kc2RyLWNvbW1lbnQtYWRkOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItY29tbWVudC1hZGQ6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLWNvbW1lbnQtaGFze3Zpc2liaWxpdHk6dmlzaWJsZTtiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTgpO2NvbG9yOiM1OGE2ZmY7Ym9yZGVyLWNvbG9yOnRyYW5zcGFyZW50O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWxpbmUtY29tbWVudGVke2JveC1zaGFkb3c6aW5zZXQgM3B4IDAgMCByZ2JhKDg4LDE2NiwyNTUsLjcpfVxuLmRzZHItY29tbWVudC1lZGl0b3J7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1jb21tZW50LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6NTJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6NnB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtyZXNpemU6dmVydGljYWx9XG4uZHNkci1jb21tZW50LWlucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpfVxuLmRzZHItY29tbWVudC1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2p1c3RpZnktY29udGVudDpmbGV4LWVuZH1cbi5kc2RyLWNvbW1lbnQtcG9we3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6MjA7cmlnaHQ6MTZweDt0b3A6Y2FsYygxMDAlICsgMnB4KTttaW4td2lkdGg6MjgwcHg7bWF4LXdpZHRoOjQ0MHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym9yZGVyLXJhZGl1czoxMHB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO3BhZGRpbmc6OHB4O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweH1cbi5kc2RyLWNvbW1lbnQtaXRlbXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7cGFkZGluZy1ib3R0b206NnB4fVxuLmRzZHItY29tbWVudC1pdGVtOmxhc3QtY2hpbGR7Ym9yZGVyLWJvdHRvbTowO3BhZGRpbmctYm90dG9tOjB9XG4uZHNkci1jb21tZW50LXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1lbnQtbWV0YXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1lbnQtbWV0YSAuZHNkci1idG57bWluLWhlaWdodDoyMHB4O3BhZGRpbmc6MCA2cHg7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDttYXJnaW4tbGVmdDphdXRvfVxuLmRzZHItb3BlbmxpbmV7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxOHB4O2hlaWdodDoxOHB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxO3BhZGRpbmc6MDt2aXNpYmlsaXR5OmhpZGRlbn1cbi5kc2RyLWxpbmU6aG92ZXIgLmRzZHItb3BlbmxpbmUsLmRzZHItb3BlbmxpbmU6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1vcGVubGluZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1saW5lLWZpbmRpbmd7Ym94LXNoYWRvdzppbnNldCAzcHggMCAwIHZhcigtLWRzZHItZmluZGluZy1jb2xvciwgcmdiYSgyNTUsMTY2LDg3LC43KSl9XG4uZHNkci1maW5kaW5nLVAwey0tZHNkci1maW5kaW5nLWNvbG9yOiNmODUxNDl9XG4uZHNkci1maW5kaW5nLVAxey0tZHNkci1maW5kaW5nLWNvbG9yOiNmZmE2NTd9XG4uZHNkci1maW5kaW5nLVAyey0tZHNkci1maW5kaW5nLWNvbG9yOiNkMjk5MjJ9XG4uZHNkci1maW5kaW5nLVAzey0tZHNkci1maW5kaW5nLWNvbG9yOiM4Yjk0OWV9XG4uZHNkci1maW5kaW5nLXRhZ3tmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDtib3JkZXItcmFkaXVzOjRweDtwYWRkaW5nOjAgNHB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtd2VpZ2h0OjYwMDthbGlnbi1zZWxmOmZsZXgtc3RhcnQ7bWFyZ2luLXRvcDoycHh9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDB7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTgpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDF7YmFja2dyb3VuZDpyZ2JhKDI1NSwxNjYsODcsLjE2KTtjb2xvcjojZmZhNjU3fVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAye2JhY2tncm91bmQ6cmdiYSgyMTAsMTUzLDM0LC4xNik7Y29sb3I6I2QyOTkyMn1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QM3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1qdW1we2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNil9XG4uZHNkci1yZXZpZXctc3RyaXB7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZTtmb250LXNpemU6MTJweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLXJldmlldy1va3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1iYWR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LW1vZGVse2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1yZXZpZXctdG9nZ2xlLW9ue2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmluZGluZ3N7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO21heC1oZWlnaHQ6MjYwcHg7b3ZlcmZsb3cteTphdXRvfVxuLmRzZHItZmluZGluZy1pdGVte2Rpc3BsYXk6ZmxleDtnYXA6OHB4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdH1cbi5kc2RyLWZpbmRpbmctaXRlbTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1maW5kaW5nLWJvZHl7ZmxleDoxO21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjNweH1cbi5kc2RyLWZpbmRpbmctdGl0bGV7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6YmFzZWxpbmU7Z2FwOjhweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLWZpbmRpbmctbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NDAwfVxuLmRzZHItZmluZGluZy1kZXRhaWx7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZmluZGluZy1tZXRhe2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1maW5kaW5nLXN1Z2dlc3Rpb257ZGlzcGxheTpibG9jazt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLXJhZGl1czo2cHg7cGFkZGluZzo0cHggOHB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItcHJ7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O3BhZGRpbmc6NHB4IDhweCA4cHh9XG4uZHNkci1wci1pdGVte2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjNweDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0fVxuLmRzZHItcHItaXRlbTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1wci1tZXRhe2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1wci10ZXh0e2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1kb2Nre2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjZweCAxNnB4O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1kb2NrLXBpbGx7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OTk5cHg7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjEyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtwYWRkaW5nOjJweCAxMnB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2N1cnNvcjpkZWZhdWx0O3VzZXItc2VsZWN0Om5vbmV9XG4uZHNkci1kb2NrLXBvcHtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjQwO2xlZnQ6MDt0b3A6Y2FsYygxMDAlICsgNnB4KTttaW4td2lkdGg6MzIwcHg7bWF4LXdpZHRoOm1pbig1MjBweCw5MHZ3KTttYXgtaGVpZ2h0OjI4MHB4O292ZXJmbG93LXk6YXV0bztib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLW1lbnUpO2JvcmRlci1yYWRpdXM6MTBweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtwYWRkaW5nOjhweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHh9XG4uZHNkci1kb2NrLWl0ZW17ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO3BhZGRpbmctYm90dG9tOjZweH1cbi5kc2RyLWRvY2staXRlbTpsYXN0LWNoaWxke2JvcmRlci1ib3R0b206MDtwYWRkaW5nLWJvdHRvbTowfVxuLmRzZHItZG9jay1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWRvY2stdGV4dHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZG9jay1zZW5ke21pbi1oZWlnaHQ6MjRweH1cbi5kc2RyLWRvY2stY2xvc2V7bWluLWhlaWdodDoyNHB4O3BhZGRpbmc6MCA2cHh9XG4uZHNkci1zZW5ke3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NDA7dG9wOjUycHg7cmlnaHQ6MTZweDt3aWR0aDptaW4oNDgwcHgsY2FsYygxMDAlIC0gMzJweCkpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym9yZGVyLXJhZGl1czoxMnB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO3BhZGRpbmc6MTJweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo4cHh9XG4uZHNkci1zZW5kLXRpdGxle2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZW5kLWhpbnR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc2VuZC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjE0MHB4O21heC1oZWlnaHQ6MzIwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cmVzaXplOnZlcnRpY2FsO3doaXRlLXNwYWNlOnByZS13cmFwfVxuLmRzZHItbGluZS1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItbGluZS1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItbGluZS1odW5re2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWZpbGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtbm90ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc3R5bGU6aXRhbGljfVxuLmRzZHItaHVuay1iYXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O3BhZGRpbmc6MnB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMil9XG4uZHNkci1odW5rLWJhciAuZHNkci1idG57bWluLWhlaWdodDoyMnB4O3BhZGRpbmc6MXB4IDhweDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4fVxuLmRzZHItaHVuay1sYXllcntmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7bWFyZ2luLXJpZ2h0OmF1dG99XG4uZHNkci1mb290e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWluLWhlaWdodDozNnB4fVxuLmRzZHItbm90aWNle2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbm90aWNlLW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItbm90aWNlLWVycm9ye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXNwaW5uZXJ7ZmxleDpub25lO3dpZHRoOjEycHg7aGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjJweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItdG9wLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2FuaW1hdGlvbjpkc2RyLXNwaW4gLjhzIGxpbmVhciBpbmZpbml0ZX1cbkBrZXlmcmFtZXMgZHNkci1zcGlue3Rve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19XG4uZHNkci1lbXB0eXtwYWRkaW5nOjQwcHg7dGV4dC1hbGlnbjpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLW5vZGlmZntwYWRkaW5nOjhweCAxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEycHh9XG4uZHNkci1zZWx7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXNlbC10cmlnZ2Vye2JveC1zaXppbmc6Y29udGVudC1ib3g7bWluLXdpZHRoOjE4MHB4O2hlaWdodDozNHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTMpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MCAxMnB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoxLjU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweH1cbi5kc2RyLXNlbC10cmlnZ2VyOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLXNlbC10cmlnZ2VyOmZvY3VzLXZpc2libGV7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lOm5vbmV9XG4uZHNkci1zZWwtdHJpZ2dlciBzdmd7ZmxleDpub25lO3RyYW5zaXRpb246dHJhbnNmb3JtIC4xMnN9XG4uZHNkci1zZWwtdHJpZ2dlclthcmlhLWV4cGFuZGVkPVwidHJ1ZVwiXSBzdmd7dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItc2VsLXZhbHVle2ZsZXg6MTttaW4td2lkdGg6MDt0ZXh0LWFsaWduOmxlZnQ7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItc2VsLW1lbnV7ei1pbmRleDoyMDA7Ym94LXNpemluZzpib3JkZXItYm94O21pbi13aWR0aDoxMDAlO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7Ym9yZGVyLXJhZGl1czoxMHB4O21hcmdpbjowO3BhZGRpbmc6NHB4O2xpc3Qtc3R5bGU6bm9uZTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoxcHg7cG9zaXRpb246YWJzb2x1dGU7dG9wOmNhbGMoMTAwJSArIDVweCk7bGVmdDowfVxuLmRzZHItc2VsLW9wdGlvbntib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjMwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JvcmRlci1yYWRpdXM6N3B4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NXB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDt0ZXh0LWFsaWduOmxlZnQ7ZGlzcGxheTpmbGV4fVxuLmRzZHItc2VsLW9wdGlvbjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1zZWwtb3B0aW9uLWFjdGl2ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZWwtb3B0aW9uLW1hcmt7ZmxleDpub25lO3dpZHRoOjE0cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbGFiZWx7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXZpZXctdG9nZ2xle2Rpc3BsYXk6ZmxleDtnYXA6MnB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzoycHg7ZmxleDpub25lfVxuLmRzZHItdmlldy1idG57Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjJweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjVweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoxcHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4fVxuLmRzZHItdmlldy1idG46aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci12aWV3LWJ0bi1hY3RpdmV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNwbGl0e21pbi13aWR0aDoxMDAlfVxuLmRzZHItc3BsaXQtaGVhZHtkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6NHB4IDhweDtwb3NpdGlvbjpzdGlja3k7dG9wOjA7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKX1cbi5kc2RyLXNwbGl0LWhlYWQgZGl2e2Rpc3BsYXk6ZmxleDtnYXA6OHB4fVxuLmRzZHItc3BsaXQtaHVua3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjJweCAxNnB4fVxuLmRzZHItc3BsaXQtcm93e2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZTp2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtY2VsbHtkaXNwbGF5OmZsZXg7Z2FwOjhweDtwYWRkaW5nOjAgOHB4O3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXQtbnVte2ZsZXg6bm9uZTt3aWR0aDozNnB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZTpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSAtIDFweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjB9XG4uZHNkci1jZWxsLWZpbmRpbmd7Ym94LXNoYWRvdzppbnNldCAwIDAgMCAxcHggdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKTtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMDgpfVxuLmRzZHItY2VsbC1qdW1we2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNil9XG4uZHNkci1zcGxpdC1maW5kaW5ne2ZsZXg6bm9uZTtmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czozcHg7cGFkZGluZzowIDNweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo2MDA7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDB7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTgpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMntiYWNrZ3JvdW5kOnJnYmEoMjEwLDE1MywzNCwuMTYpO2NvbG9yOiNkMjk5MjJ9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QM3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc3BsaXQtb3BlbmxpbmV7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxNnB4O2hlaWdodDoxNnB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxO3BhZGRpbmc6MDt2aXNpYmlsaXR5OmhpZGRlbn1cbi5kc2RyLXNwbGl0LWNlbGw6aG92ZXIgLmRzZHItc3BsaXQtb3BlbmxpbmUsLmRzZHItc3BsaXQtb3BlbmxpbmU6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1zcGxpdC1vcGVubGluZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jZWxsLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1jZWxsLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1jZWxsLWRpbXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwxLCByZ2JhKDEyOCwxMjgsMTI4LC4wNSkpfVxuYFxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc3R5bGVbZGF0YS1wbHVnaW4tY3NzPSR7SlNPTi5zdHJpbmdpZnkoU1RZTEVfVEFHKX1dYCkgPT09IG51bGwpIHtcbiAgY29uc3QgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICB0YWcuZGF0YXNldC5wbHVnaW4gPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldydcbiAgdGFnLmRhdGFzZXQucGx1Z2luQ3NzID0gU1RZTEVfVEFHXG4gIHRhZy50ZXh0Q29udGVudCA9IFJFVklFV19DU1NcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpXG59XG5cbi8qKiBTaW1wbGlmaWVkIENoaW5lc2UgZGljdGlvbmFyeSAoa2V5LXNldCBzb3VyY2Ugb2YgdHJ1dGgpLiAqL1xuY29uc3QgemggPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1x1NUJBMVx1NjdFNVx1NUY1M1x1NTI0RFx1OTg3OVx1NzZFRVx1NEUwRVx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOScsXG4gICd0YWIuc2Vzc2lvbic6ICdcdTRGMUFcdThCRERcdTY2RjRcdTY1MzknLFxuICAndGFiLndvcmtzcGFjZSc6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAncmV2aWV3LnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdyZXZpZXcuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnXHU2RTM4XHU3OUJCIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnXHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHU0RTBEXHU2NjJGIGdpdCBcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1x1MzAwQ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOVx1MzAwRFx1OTg3NVx1N0I3RVx1NEUwRFx1NTNEN1x1NUY3MVx1NTRDRFx1RkYwQ1x1NEVDRFx1NTNFRlx1NjdFNVx1NzcwQlx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOVx1MzAwMicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdcdThGRDlcdTRFMkFcdTRGMUFcdThCRERcdThGRDhcdTZDQTFcdTY3MDlcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzlcdThCQjBcdTVGNTUnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSBcdThGNkUgXHUwMEI3IHtmaWxlc30gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdcdTdCMkMge3JvdW5kfSBcdThGNkUnLFxuICAncmV2aWV3LmVtcHR5JzogJ1x1NkNBMVx1NjcwOVx1NjcyQVx1NjNEMFx1NEVBNFx1NzY4NFx1NjZGNFx1NjUzOSBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdcdTUxNjhcdTkwRThcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnXHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1x1NTE2OFx1OTBFOFx1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlJzogJ1x1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAnaHVuay51bnN0YWdlJzogJ1x1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAnaHVuay51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnXHU2M0QwXHU0RUE0XHU4QkY0XHU2NjBFXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1x1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnXHU1REYyXHU2M0QwXHU0RUE0IHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ1x1NjNEMFx1NEVBNFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucHVzaGVkJzogJ1x1NURGMlx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdcdTYzQThcdTkwMDFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFoZWFkJzogJ1x1OTg4Nlx1NTE0OCB7bn0nLFxuICAncmV2aWV3LmJlaGluZCc6ICdcdTg0M0RcdTU0MEUge259JyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ1x1NTIwNlx1NjUyRlx1NEUwRVx1OEZEQ1x1N0EwQicsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdcdTY3MkFcdThCQkVcdTdGNkVcdTRFMEFcdTZFMzhcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnXHU1Mzg2XHU1M0YyJyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdcdTUzRDhcdTUyQThcdTY1ODdcdTRFRjYnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdcdTY3MkNcdTU3MzAnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAnXHU4RkRDXHU3QTBCJyxcbiAgJ3RpbWUubm93JzogJ1x1NTIxQVx1NTIxQScsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IFx1NTIwNlx1OTQ5Rlx1NTI0RCcsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBcdTVDMEZcdTY1RjZcdTUyNEQnLFxuICAndGltZS5kYXlzJzogJ3tufSBcdTU5MjlcdTUyNEQnLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnXHU1MjM3XHU2NUIwJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdcdTUxNzNcdTk1RUQnLFxuICAncmV2aWV3LmJ1c3knOiAnXHU1OTA0XHU3NDA2XHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ1x1NURGMnthY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjZcdUZGMDhcdTUyMjBcdTk2NjQge2RlbGV0ZWR9IFx1NEUyQVx1NjcyQVx1OERERlx1OEUyQVx1NjU4N1x1NEVGNlx1RkYwOScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICdcdTY3MkFcdThEREZcdThFMkEnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdcdTRFOENcdThGREJcdTUyMzYnLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnXHU4QkU1XHU0RkVFXHU2NTM5XHU2Q0ExXHU2NzA5IGRpZmYgXHU2NTcwXHU2MzZFJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnXHU1MzU1XHU2ODBGJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnXHU1M0NDXHU2ODBGJyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ1x1NTM5Rlx1NjU4N1x1NEVGNicsXG4gICd2aWV3LmFmdGVyJzogJ1x1NjVCMFx1NjU4N1x1NEVGNicsXG4gICdjb21tZW50LmFkZCc6ICdcdThCQzRcdThCQkFcdTZCNjRcdTg4NEMnLFxuICAnY29tbWVudC5zaG93JzogJ1x1NjdFNVx1NzcwQlx1OEJDNFx1OEJCQScsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ1x1OEJDNFx1OEJCQVx1MjAyNlx1RkYwOEN0cmwvXHUyMzE4K0VudGVyIFx1NEZERFx1NUI1OFx1RkYwOScsXG4gICdjb21tZW50LnNhdmUnOiAnXHU0RkREXHU1QjU4JyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ1x1NTNENlx1NkQ4OCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdcdTUyMjBcdTk2NjQnLFxuICAnY29tbWVudC5zYXZlZCc6ICdcdTVERjJcdTRGRERcdTVCNThcdThCQzRcdThCQkEnLFxuICAnY29tbWVudC5mYWlsZWQnOiAnXHU4QkM0XHU4QkJBXHU0RkREXHU1QjU4XHU1OTMxXHU4RDI1JyxcbiAgJ3Njb3BlLmxhYmVsJzogJ1x1ODMwM1x1NTZGNCcsXG4gICdzY29wZS5hbGwnOiAnXHU1MTY4XHU5MEU4JyxcbiAgJ3Njb3BlLnVuc3RhZ2VkJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdzY29wZS5zdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ3Njb3BlLmNvbW1pdCc6ICdcdTYzRDBcdTRFQTQnLFxuICAnc2NvcGUuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdzY29wZS5sYXN0LXR1cm4nOiAnXHU2NzAwXHU1NDBFXHU0RTAwXHU4RjZFJyxcbiAgJ3Jldmlldy5sYXN0VHVybkVtcHR5JzogJ1x1NjcwMFx1NTQwRVx1NEUwMFx1OEY2RVx1NkNBMVx1NjcwOVx1OEJCMFx1NUY1NVx1NTIzMFx1NjU4N1x1NEVGNlx1NEZFRVx1NjUzOSBcdTIwMTRcdTIwMTQgXHU3RUM4XHU3QUVGXHU1NDdEXHU0RUU0XHVGRjA4YmFzaFx1RkYwOVx1NjUzOVx1NjU4N1x1NEVGNlx1NEUwRFx1NEYxQVx1OEJBMVx1NTE2NVx1NEYxQVx1OEJERFx1OEJCMFx1NUY1NVx1RkYxQlx1NTNFRlx1NTIwN1x1NTIzMFx1MzAwQ1x1NTE2OFx1OTBFOFx1MzAwRFx1NjdFNVx1NzcwQiBnaXQgXHU1M0Q4XHU2NkY0JyxcbiAgJ3Njb3BlLmJhc2UnOiAnXHU1N0ZBXHU3RUJGXHU1MjA2XHU2NTJGJyxcbiAgJ3Njb3BlLmJyYW5jaFJlYWRvbmx5JzogJ1x1NTIwNlx1NjUyRlx1ODMwM1x1NTZGNFx1NTNFQVx1OEJGQlx1RkYwOFx1NUJGOVx1NkJENCBtZXJnZS1iYXNlXHVGRjBDXHU0RTBEXHU2M0QwXHU0RjlCXHU5MUM3XHU3RUIzL1x1NEUyMlx1NUYwM1x1RkYwOScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1x1NEVDRVx1NURFNlx1NEZBN1x1OTAwOVx1NjJFOVx1NjNEMFx1NEVBNFx1NjdFNVx1NzcwQiBkaWZmJyxcbiAgJ3Jldmlldy5zZW5kVG9BZ2VudCc6ICdcdTUzRDFcdTkwMDFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdcdTUzRDFcdTkwMDFcdTg4NENcdTUxODVcdThCQzRcdThCQkFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ1x1OEJDNFx1OEJCQVx1NEYxQVx1NEY1Q1x1NEUzQVx1OEJDNFx1NUJBMVx1NjMwN1x1NUYxNVx1NkNFOFx1NTE2NVx1NUY1M1x1NTI0RFx1NEYxQVx1OEJERFx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwOVx1MzAwMlx1NTNEMVx1OTAwMVx1NTkzMVx1OEQyNVx1NjVGNlx1OTAwMFx1NTMxNlx1NEUzQVx1NTkwRFx1NTIzNlx1NjU4N1x1NjcyQ1x1MzAwMicsXG4gICdyZXZpZXcuc2VudFRvQWdlbnQnOiAnXHU1REYyXHU1M0QxXHU5MDAxXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5jb3B5JzogJ1x1NTkwRFx1NTIzNlx1NjU4N1x1NjcyQycsXG4gICdyZXZpZXcuY29waWVkJzogJ1x1NURGMlx1NTkwRFx1NTIzNicsXG4gICdyZXZpZXcuY29weUZhaWxlZCc6ICdcdTU5MERcdTUyMzZcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnJldmlldyc6ICdcdThCQzRcdTVCQTEnLFxuICAncmV2aWV3LnJldmlld2luZyc6ICdcdThCQzRcdTVCQTFcdTRFMkRcdTIwMjYnLFxuICAncmV2aWV3LnJldmlld0ZhaWxlZCc6ICdcdThCQzRcdTVCQTFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnZlcmRpY3RDb3JyZWN0JzogJ1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RSBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnXHU4ODY1XHU0RTAxXHU1QjU4XHU1NzI4XHU5NUVFXHU5ODk4IFx1MjcxNycsXG4gICdyZXZpZXcubm9GaW5kaW5ncyc6ICdcdTZDQTFcdTY3MDlcdTUzRDFcdTczQjBcdTk1RUVcdTk4OTgnLFxuICAncmV2aWV3LmZpbmRpbmdzJzogJ3tufSBcdTY3NjFcdTUzRDFcdTczQjAnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnXHU3RjZFXHU0RkUxXHU1RUE2IHtjb25maWRlbmNlfScsXG4gICdyZXZpZXcuc3VnZ2VzdGlvbic6ICdcdTVFRkFcdThCQUUnLFxuICAncmV2aWV3LnNlbmRGaW5kaW5ncyc6ICdcdTUzRDFcdTkwMDFcdTUzRDFcdTczQjBcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdcdTVERjJcdTUzRDFcdTkwMDFcdTUzRDFcdTczQjBcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnJldmlld1Njb3BlJzogJ1x1OEJDNFx1NUJBMVx1ODMwM1x1NTZGNCcsXG4gICdwci50aXRsZSc6ICdQUiAje251bWJlcn0nLFxuICAncHIuY29tbWVudHMnOiAnUFIgXHU4QkM0XHU4QkJBICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnXHU2NUUwXHU1MTczXHU4MDU0IFBSJyxcbiAgJ3ByLnNlbmRDb21tZW50cyc6ICdcdTUzRDFcdTkwMDEgUFIgXHU4QkM0XHU4QkJBXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ2VkaXRvci5vcGVuRmlsZSc6ICdcdTU3MjhcdTdGMTZcdThGOTFcdTU2NjhcdTRFMkRcdTYyNTNcdTVGMDAnLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ1x1NTcyOFx1N0YxNlx1OEY5MVx1NTY2OFx1NEUyRFx1NjI1M1x1NUYwMFx1OEJFNVx1ODg0QycsXG4gICdlZGl0b3IuZmFpbGVkJzogJ1x1NjI1M1x1NUYwMFx1NTkzMVx1OEQyNScsXG4gICdyZXBvLmxhYmVsJzogJ1x1NEVEM1x1NUU5MycsXG4gICdyZXZpZXcuZG9ja0NvbW1lbnRzJzogJ1x1ODg0Q1x1NTE4NVx1OEJDNFx1OEJCQSB7bn0gXHU2NzYxJyxcbiAgJ3Jldmlldy5zZW50JzogJ1x1NURGMlx1NTNEMVx1OTAwMSBcdTI3MTMnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnXHU1QjU3XHU0RjUzJyxcbiAgJ3NldHRpbmdzLnNpemUnOiAnXHU1QjU3XHU1M0Y3JyxcbiAgJ2NvbmZpZy50aXRsZSc6ICdcdTkxNERcdTdGNkUnLFxuICAnZm9udC5tb25vJzogJ1x1N0I0OVx1NUJCRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYwOScsXG4gICdmb250LnN5c3RlbSc6ICdcdTdDRkJcdTdFREZcdTVCNTdcdTRGNTMnLFxufSBhcyBjb25zdFxuXG4vKiogRW5nbGlzaCBkaWN0aW9uYXJ5LCBjaGVja2VkIGNvbXBsZXRlIGFnYWluc3QgdGhlIHpoIGtleSBzZXQuICovXG5jb25zdCBlbjogUmVjb3JkPGtleW9mIHR5cGVvZiB6aCwgc3RyaW5nPiA9IHtcbiAgJ2FjdGlvbi5sYWJlbCc6ICdDaGFuZ2VzJyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1JldmlldyB3b3Jrc3BhY2UgYW5kIHBlci1yb3VuZCBjaGFuZ2VzJyxcbiAgJ3RhYi5zZXNzaW9uJzogJ1Nlc3Npb24nLFxuICAndGFiLndvcmtzcGFjZSc6ICdXb3Jrc3BhY2UnLFxuICAncmV2aWV3LnRpdGxlJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdicmFuY2gnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ2RldGFjaGVkIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnVGhpcyBkaXJlY3RvcnkgaXMgbm90IGEgZ2l0IHJlcG9zaXRvcnknLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1RoZSBcIlNlc3Npb25cIiB0YWIgc3RpbGwgc2hvd3MgZXZlcnkgcm91bmRcXCdzIGNoYW5nZXMuJyxcbiAgJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBpbiB0aGlzIHNlc3Npb24geWV0JyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gcm91bmRzIFx1MDBCNyB7ZmlsZXN9IGZpbGVzJyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdSb3VuZCB7cm91bmR9JyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdObyB1bmNvbW1pdHRlZCBjaGFuZ2VzIFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ0ZhaWxlZCB0byBsb2FkJyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnQWNjZXB0JyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnQWNjZXB0IGFsbCcsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1JldmVydCBhbGwnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnVW5zdGFnZScsXG4gICdyZXZpZXcudW5zdGFnZUFsbCc6ICdVbnN0YWdlIGFsbCcsXG4gICdodW5rLnN0YWdlJzogJ1N0YWdlJyxcbiAgJ2h1bmsucmV2ZXJ0JzogJ1JldmVydCcsXG4gICdodW5rLnVuc3RhZ2UnOiAnVW5zdGFnZScsXG4gICdodW5rLnN0YWdlZCc6ICdzdGFnZWQnLFxuICAnaHVuay51bnN0YWdlZCc6ICd1bnN0YWdlZCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHJldmVydCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydEFsbCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHJldmVydCBhbGwnLFxuICAncmV2aWV3LmNvbW1pdCc6ICdDb21taXQnLFxuICAncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJzogJ0NvbW1pdCBtZXNzYWdlXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1B1c2gnLFxuICAncmV2aWV3LmNvbmZpcm1QdXNoJzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcHVzaCcsXG4gICdyZXZpZXcuY29tbWl0dGVkJzogJ0NvbW1pdHRlZCB7c3VtbWFyeX0nLFxuICAncmV2aWV3LmNvbW1pdEZhaWxlZCc6ICdDb21taXQgZmFpbGVkJyxcbiAgJ3Jldmlldy5wdXNoZWQnOiAnUHVzaGVkJyxcbiAgJ3Jldmlldy5wdXNoRmFpbGVkJzogJ1B1c2ggZmFpbGVkJyxcbiAgJ3Jldmlldy5haGVhZCc6ICd7bn0gYWhlYWQnLFxuICAncmV2aWV3LmJlaGluZCc6ICd7bn0gYmVoaW5kJyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1N0YWdlZCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnQ2hhbmdlcycsXG4gICdyZXZpZXcuc2VjdGlvbkJyYW5jaCc6ICdCcmFuY2ggdnMgcmVtb3RlJyxcbiAgJ3Jldmlldy5ub1Vwc3RyZWFtJzogJ25vIHVwc3RyZWFtJyxcbiAgJ3Jldmlldy5oaXN0b3J5JzogJ0hpc3RvcnknLFxuICAncmV2aWV3LmNvbW1pdEZpbGVzJzogJ0ZpbGVzJyxcbiAgJ2hpc3RvcnkubG9jYWwnOiAnbG9jYWwnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAncmVtb3RlJyxcbiAgJ3RpbWUubm93JzogJ2p1c3Qgbm93JyxcbiAgJ3RpbWUubWludXRlcyc6ICd7bn0gbWluIGFnbycsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBoIGFnbycsXG4gICd0aW1lLmRheXMnOiAne259IGQgYWdvJyxcbiAgJ3Jldmlldy5yZWZyZXNoJzogJ1JlZnJlc2gnLFxuICAncmV2aWV3LmNsb3NlJzogJ0Nsb3NlJyxcbiAgJ3Jldmlldy5idXN5JzogJ1dvcmtpbmdcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcycsXG4gICdyZXZpZXcuZG9uZU9uZSc6ICd7YWN0aW9ufSB7cGF0aH0nLFxuICAncmV2aWV3LmRvbmVEZWxldGVkJzogJ3thY3Rpb259IHtjb3VudH0gZmlsZXMgKHtkZWxldGVkfSB1bnRyYWNrZWQgZGVsZXRlZCknLFxuICAncmV2aWV3LmFjY2VwdGVkJzogJ0FjY2VwdGVkJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdSZXZlcnRlZCcsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ3VudHJhY2tlZCcsXG4gICdyZXZpZXcuYmluYXJ5JzogJ2JpbmFyeScsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdObyBkaWZmIGRhdGEgZm9yIHRoaXMgY2hhbmdlJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnU2luZ2xlJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnU3BsaXQnLFxuICAndmlldy5iZWZvcmUnOiAnQmVmb3JlJyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnQWZ0ZXInLFxuICAnY29tbWVudC5hZGQnOiAnQ29tbWVudCBvbiB0aGlzIGxpbmUnLFxuICAnY29tbWVudC5zaG93JzogJ1ZpZXcgY29tbWVudHMnLFxuICAnY29tbWVudC5wbGFjZWhvbGRlcic6ICdDb21tZW50XHUyMDI2IChDdHJsL1x1MjMxOCtFbnRlciB0byBzYXZlKScsXG4gICdjb21tZW50LnNhdmUnOiAnU2F2ZScsXG4gICdjb21tZW50LmNhbmNlbCc6ICdDYW5jZWwnLFxuICAnY29tbWVudC5kZWxldGUnOiAnRGVsZXRlJyxcbiAgJ2NvbW1lbnQuc2F2ZWQnOiAnQ29tbWVudCBzYXZlZCcsXG4gICdjb21tZW50LmZhaWxlZCc6ICdGYWlsZWQgdG8gc2F2ZSBjb21tZW50JyxcbiAgJ3Njb3BlLmxhYmVsJzogJ1Njb3BlJyxcbiAgJ3Njb3BlLmFsbCc6ICdBbGwnLFxuICAnc2NvcGUudW5zdGFnZWQnOiAnVW5zdGFnZWQnLFxuICAnc2NvcGUuc3RhZ2VkJzogJ1N0YWdlZCcsXG4gICdzY29wZS5jb21taXQnOiAnQ29tbWl0JyxcbiAgJ3Njb3BlLmJyYW5jaCc6ICdCcmFuY2gnLFxuICAnc2NvcGUubGFzdC10dXJuJzogJ0xhc3QgdHVybicsXG4gICdyZXZpZXcubGFzdFR1cm5FbXB0eSc6ICdObyBmaWxlIGNoYW5nZXMgcmVjb3JkZWQgZm9yIHRoZSBsYXN0IHR1cm4gXHUyMDE0IHRlcm1pbmFsIGNvbW1hbmRzIChiYXNoKSB0aGF0IGVkaXQgZmlsZXMgYXJlIG5vdCB0cmFja2VkIGluIHRoZSBzZXNzaW9uIGxvZzsgc3dpdGNoIHRvIFwiQWxsXCIgdG8gc2VlIGdpdCBjaGFuZ2VzJyxcbiAgJ3Njb3BlLmJhc2UnOiAnQmFzZSBicmFuY2gnLFxuICAnc2NvcGUuYnJhbmNoUmVhZG9ubHknOiAnQnJhbmNoIHNjb3BlIGlzIHJlYWQtb25seSAobWVyZ2UtYmFzZSBkaWZmOyBubyBhY2NlcHQvcmV2ZXJ0KScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1NlbGVjdCBhIGNvbW1pdCBmcm9tIHRoZSBsZWZ0IHRvIHZpZXcgaXRzIGRpZmYnLFxuICAncmV2aWV3LnNlbmRUb0FnZW50JzogJ1NlbmQgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdTZW5kIGlubGluZSBjb21tZW50cyB0byB0aGUgYWdlbnQnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ0NvbW1lbnRzIGFyZSBpbmplY3RlZCBpbnRvIHRoZSBjdXJyZW50IHNlc3Npb24gYXMgcmV2aWV3IGd1aWRhbmNlIChBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHMpLiBGYWxscyBiYWNrIHRvIGNvcHlhYmxlIHRleHQgaWYgc2VuZGluZyBmYWlscy4nLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1NlbnQgdG8gYWdlbnQnLFxuICAncmV2aWV3LmNvcHknOiAnQ29weSB0ZXh0JyxcbiAgJ3Jldmlldy5jb3BpZWQnOiAnQ29waWVkJyxcbiAgJ3Jldmlldy5jb3B5RmFpbGVkJzogJ0NvcHkgZmFpbGVkJyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnUmV2aWV3JyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnUmV2aWV3aW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnUmV2aWV3IGZhaWxlZCcsXG4gICdyZXZpZXcudmVyZGljdENvcnJlY3QnOiAnUGF0Y2ggaXMgY29ycmVjdCBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnUGF0Y2ggbmVlZHMgd29yayBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnTm8gaXNzdWVzIGZvdW5kJyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gZmluZGluZ3MnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnY29uZmlkZW5jZSB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnU3VnZ2VzdGlvbicsXG4gICdyZXZpZXcuc2VuZEZpbmRpbmdzJzogJ1NlbmQgZmluZGluZ3MgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdGaW5kaW5ncyBzZW50IHRvIGFnZW50JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdSZXZpZXcgc2NvcGUnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIGNvbW1lbnRzICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnTm8gYXNzb2NpYXRlZCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnU2VuZCBQUiBjb21tZW50cyB0byBhZ2VudCcsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnT3BlbiBpbiBlZGl0b3InLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ09wZW4gdGhpcyBsaW5lIGluIGVkaXRvcicsXG4gICdlZGl0b3IuZmFpbGVkJzogJ0ZhaWxlZCB0byBvcGVuJyxcbiAgJ3JlcG8ubGFiZWwnOiAnUmVwbycsXG4gICdyZXZpZXcuZG9ja0NvbW1lbnRzJzogJ3tufSBpbmxpbmUgY29tbWVudHMnLFxuICAncmV2aWV3LnNlbnQnOiAnU2VudCBcdTI3MTMnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnQ2hhbmdlcycsXG4gICdzZXR0aW5ncy5mb250JzogJ0ZvbnQnLFxuICAnc2V0dGluZ3Muc2l6ZSc6ICdGb250IHNpemUnLFxuICAnY29uZmlnLnRpdGxlJzogJ0NvbmZpZ3VyYXRpb24nLFxuICAnZm9udC5tb25vJzogJ01vbm9zcGFjZSAoZGVmYXVsdCknLFxuICAnZm9udC5zeXN0ZW0nOiAnU3lzdGVtIGZvbnQnLFxufVxuXG50eXBlIERpZmZSZXZpZXdBY3Rpb25Qcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+XG50eXBlIERpZmZSZXZpZXdPdmVybGF5UHJvcHMgPSBQcm9wc1J1bnRpbWU8J3NoZWxsLm92ZXJsYXknPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYgeyBzZXNzaW9uczogSVNlc3Npb25zIH1cblxuLyoqIERpZmYgaWNvbiAobHVjaWRlIGZpbGUtZGlmZikuICovXG5mdW5jdGlvbiBJY29uRGlmZigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTUgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjdaXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOSAxMGg2XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNMTIgN3Y2XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOSAxN2g2XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uWCgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTggNiA2IDE4XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJtNiA2IDEyIDEyXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ2hldnJvbkRvd24oKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjEyXCIgaGVpZ2h0PVwiMTJcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwibTYgOSA2IDYgNi02XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ2hlY2soKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjEyXCIgaGVpZ2h0PVwiMTJcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjIuNVwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMjAgNiA5IDE3bC01LTVcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbnR5cGUgVmlld01vZGUgPSAnc2luZ2xlJyB8ICdzcGxpdCdcblxuLyoqIFx1NTM1NVx1NjgwRiAvIFx1NTNDQ1x1NjgwRiBzZWdtZW50ZWQgdG9nZ2xlIChwZXJzaXN0ZWQgYWNyb3NzIG9wZW5zKS4gKi9cbmZ1bmN0aW9uIERpZmZWaWV3VG9nZ2xlKHsgdmlldywgb25DaGFuZ2UsIHQgfTogeyB2aWV3OiBWaWV3TW9kZTsgb25DaGFuZ2U6ICh2OiBWaWV3TW9kZSkgPT4gdm9pZDsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdmlldy10b2dnbGVcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPXt0KCd2aWV3LnNpbmdsZScpfT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRzZHItdmlldy1idG4ke3ZpZXcgPT09ICdzaW5nbGUnID8gJyBkc2RyLXZpZXctYnRuLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICBhcmlhLXByZXNzZWQ9e3ZpZXcgPT09ICdzaW5nbGUnfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgnc2luZ2xlJyl9XG4gICAgICA+XG4gICAgICAgIHt0KCd2aWV3LnNpbmdsZScpfVxuICAgICAgPC9idXR0b24+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXZpZXctYnRuJHt2aWV3ID09PSAnc3BsaXQnID8gJyBkc2RyLXZpZXctYnRuLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICBhcmlhLXByZXNzZWQ9e3ZpZXcgPT09ICdzcGxpdCd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKCdzcGxpdCcpfVxuICAgICAgPlxuICAgICAgICB7dCgndmlldy5zcGxpdCcpfVxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFR3by1jb2x1bW4gc2lkZS1ieS1zaWRlIGRpZmYgYm9keSAob2xkIGxlZnQsIG5ldyByaWdodCwgbGluZSBudW1iZXJzIGFsaWduZWQpLiAqL1xuZnVuY3Rpb24gU3BsaXREaWZmKHsgYmxvY2tzLCBiZWZvcmVMYWJlbCwgYWZ0ZXJMYWJlbCB9OiB7IGJsb2NrczogU3BsaXRCbG9ja1tdOyBiZWZvcmVMYWJlbDogc3RyaW5nOyBhZnRlckxhYmVsOiBzdHJpbmcgfSkge1xuICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICA8c3Bhbj57YmVmb3JlTGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICA8c3Bhbj57YWZ0ZXJMYWJlbH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7YmxvY2tzLm1hcCgoYmxvY2ssIGJpKSA9PiAoXG4gICAgICAgICAgPGRpdiBrZXk9e2JpfT5cbiAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtyaX0gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1yb3dcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5sZWZ0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1kZWwnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPntyb3cubGVmdE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LmxlZnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LnJpZ2h0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1hZGQnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPntyb3cucmlnaHROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5yaWdodH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFBlci1odW5rIGFjdGlvbiBiYXIgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkgZm9yIHdvcmtzcGFjZSBkaWZmcy4gKi9cbmZ1bmN0aW9uIEh1bmtUb29sYmFyKHtcbiAgaHVuayxcbiAgYnVzeSxcbiAgb25BY3Rpb24sXG4gIHQsXG59OiB7XG4gIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmsgfCB1bmRlZmluZWRcbiAgYnVzeTogYm9vbGVhblxuICBvbkFjdGlvbjogKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuaykgPT4gdm9pZFxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgaWYgKCFodW5rKSByZXR1cm4gbnVsbFxuICBjb25zdCBzdGFnZWQgPSBodW5rLmxheWVyID09PSAnc3RhZ2VkJ1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1odW5rLWJhclwiPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1odW5rLWxheWVyXCI+e3N0YWdlZCA/IHQoJ2h1bmsuc3RhZ2VkJykgOiB0KCdodW5rLnVuc3RhZ2VkJyl9PC9zcGFuPlxuICAgICAge3N0YWdlZCA/IChcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25BY3Rpb24oJ3Vuc3RhZ2UnLCBodW5rKX0+XG4gICAgICAgICAge3QoJ2h1bmsudW5zdGFnZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25BY3Rpb24oJ2FjY2VwdCcsIGh1bmspfT5cbiAgICAgICAgICB7dCgnaHVuay5zdGFnZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICl9XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25BY3Rpb24oJ3JldmVydCcsIGh1bmspfT5cbiAgICAgICAge3QoJ2h1bmsucmV2ZXJ0Jyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVW5pZmllZCBkaWZmIHJvd3Mgd2l0aCBvbGQvbmV3IGxpbmUgbnVtYmVycyB0cmFja2VkIHRocm91Z2ggaHVua3MuICovXG5mdW5jdGlvbiB1bmlmaWVkUm93c1dpdGhMaW5lcyhyb3dzOiBEaWZmUm93W10sIG9sZFN0YXJ0OiBudW1iZXIsIG5ld1N0YXJ0OiBudW1iZXIpOiB7IHJvdzogRGlmZlJvdzsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9W10ge1xuICBsZXQgb2xkTGluZSA9IG9sZFN0YXJ0XG4gIGxldCBuZXdMaW5lID0gbmV3U3RhcnRcbiAgcmV0dXJuIHJvd3MubWFwKChyb3cpID0+IHtcbiAgICBpZiAocm93LmtpbmQgPT09ICdjdHgnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbmV3TGluZSsrIH1cbiAgICBpZiAocm93LmtpbmQgPT09ICdhZGQnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG51bGwsIG5ld0xpbmU6IG5ld0xpbmUrKyB9XG4gICAgaWYgKHJvdy5raW5kID09PSAnZGVsJykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBvbGRMaW5lKyssIG5ld0xpbmU6IG51bGwgfVxuICAgIHJldHVybiB7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbnVsbCB9XG4gIH0pXG59XG5cbi8qKiBNYXRjaCBhIGNvbW1lbnQgYWdhaW5zdCBhIHJvdydzIGFuY2hvcnMgKGJvdGggbXVzdCBhZ3JlZSB3aGVuIHNldCkuICovXG5mdW5jdGlvbiBjb21tZW50TWF0Y2hlcyhjb21tZW50OiBSZXZpZXdDb21tZW50LCBvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKTogYm9vbGVhbiB7XG4gIGlmIChjb21tZW50LmxpbmVOZXcgIT09IG51bGwgJiYgY29tbWVudC5saW5lTmV3ICE9PSBuZXdMaW5lKSByZXR1cm4gZmFsc2VcbiAgaWYgKGNvbW1lbnQubGluZU9sZCAhPT0gbnVsbCAmJiBjb21tZW50LmxpbmVPbGQgIT09IG9sZExpbmUpIHJldHVybiBmYWxzZVxuICByZXR1cm4gdHJ1ZVxufVxuXG4vKiogSG92ZXItdG8tY29tbWVudCBhZmZvcmRhbmNlICsgY29tbWVudCBtYXJrZXIgZm9yIG9uZSBkaWZmIGxpbmUuICovXG5mdW5jdGlvbiBDb21tZW50TGluZSh7XG4gIGNvdW50LFxuICBvcGVuLFxuICBvbk9wZW4sXG4gIG9uVG9nZ2xlLFxuICB0LFxufToge1xuICBjb3VudDogbnVtYmVyXG4gIG9wZW46IGJvb2xlYW5cbiAgb25PcGVuOiAoKSA9PiB2b2lkXG4gIG9uVG9nZ2xlOiAoKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1jb21tZW50LWFkZCR7Y291bnQgPiAwID8gJyBkc2RyLWNvbW1lbnQtaGFzJyA6ICcnfWB9XG4gICAgICB0aXRsZT17Y291bnQgPiAwID8gdCgnY29tbWVudC5zaG93JykgOiB0KCdjb21tZW50LmFkZCcpfVxuICAgICAgYXJpYS1sYWJlbD17Y291bnQgPiAwID8gdCgnY29tbWVudC5zaG93JykgOiB0KCdjb21tZW50LmFkZCcpfVxuICAgICAgb25DbGljaz17Y291bnQgPiAwID8gb25Ub2dnbGUgOiBvbk9wZW59XG4gICAgPlxuICAgICAge2NvdW50ID4gMCA/IGNvdW50IDogJysnfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8qKiBUaGUgaW5saW5lIGNvbW1lbnQgZWRpdG9yLCByZW5kZXJlZCBhcyBpdHMgb3duIHJvdy4gKi9cbmZ1bmN0aW9uIENvbW1lbnRFZGl0b3Ioe1xuICB0ZXh0LFxuICBvblRleHQsXG4gIG9uU2F2ZSxcbiAgb25DYW5jZWwsXG4gIGJ1c3ksXG4gIHQsXG59OiB7XG4gIHRleHQ6IHN0cmluZ1xuICBvblRleHQ6ICh2OiBzdHJpbmcpID0+IHZvaWRcbiAgb25TYXZlOiAoKSA9PiB2b2lkXG4gIG9uQ2FuY2VsOiAoKSA9PiB2b2lkXG4gIGJ1c3k6IGJvb2xlYW5cbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtZWRpdG9yXCI+XG4gICAgICA8dGV4dGFyZWFcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWlucHV0XCJcbiAgICAgICAgdmFsdWU9e3RleHR9XG4gICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICByb3dzPXsyfVxuICAgICAgICBwbGFjZWhvbGRlcj17dCgnY29tbWVudC5wbGFjZWhvbGRlcicpfVxuICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblRleHQoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgb25DYW5jZWwoKVxuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicgJiYgKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSkpIG9uU2F2ZSgpXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIXRleHQudHJpbSgpfSBvbkNsaWNrPXtvblNhdmV9PlxuICAgICAgICAgIHt0KCdjb21tZW50LnNhdmUnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9e29uQ2FuY2VsfT5cbiAgICAgICAgICB7dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVW5pZmllZCBkaWZmIHdpdGggcGVyLWh1bmsgYWN0aW9uIGJhcnMgYW5kIGlubGluZSBjb21tZW50cyAod29ya3NwYWNlIGZpbGVzKS4gKi9cbmZ1bmN0aW9uIFVuaWZpZWREaWZmKHtcbiAgZGlmZixcbiAgaHVua3MsXG4gIGJ1c3ksXG4gIG9uSHVua0FjdGlvbixcbiAgdCxcbiAgY29tbWVudHMsXG4gIGNvbW1lbnRFZGl0b3IsXG4gIGNvbW1lbnRUZXh0LFxuICBvbkNvbW1lbnRUZXh0LFxuICBvbk9wZW5Db21tZW50LFxuICBvblNhdmVDb21tZW50LFxuICBvbkNhbmNlbENvbW1lbnQsXG4gIGNvbW1lbnRQb3BvdmVyLFxuICBvblRvZ2dsZVBvcG92ZXIsXG4gIG9uRGVsZXRlQ29tbWVudCxcbiAgcmVhZE9ubHksXG4gIHBhdGgsXG4gIHJldmlld0ZpbmRpbmdzLFxuICBvbk9wZW5MaW5lLFxuICBqdW1wTGluZSxcbn06IHtcbiAgZGlmZjogc3RyaW5nXG4gIGh1bmtzOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rW11cbiAgYnVzeTogYm9vbGVhblxuICBvbkh1bmtBY3Rpb246IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmspID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG4gIGNvbW1lbnRzPzogUmV2aWV3Q29tbWVudFtdXG4gIGNvbW1lbnRFZGl0b3I/OiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSB8IG51bGxcbiAgY29tbWVudFRleHQ/OiBzdHJpbmdcbiAgb25Db21tZW50VGV4dD86ICh2OiBzdHJpbmcpID0+IHZvaWRcbiAgb25PcGVuQ29tbWVudD86IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB2b2lkXG4gIG9uU2F2ZUNvbW1lbnQ/OiAoKSA9PiB2b2lkXG4gIG9uQ2FuY2VsQ29tbWVudD86ICgpID0+IHZvaWRcbiAgY29tbWVudFBvcG92ZXI/OiBzdHJpbmcgfCBudWxsXG4gIG9uVG9nZ2xlUG9wb3Zlcj86IChrZXk6IHN0cmluZykgPT4gdm9pZFxuICBvbkRlbGV0ZUNvbW1lbnQ/OiAoaWQ6IHN0cmluZykgPT4gdm9pZFxuICAvKiogSGlkZSBwZXItaHVuayBhY3Rpb24gYmFycyAoYnJhbmNoIHNjb3BlIGlzIGEgcmVhZC1vbmx5IGRpZmYpLiAqL1xuICByZWFkT25seT86IGJvb2xlYW5cbiAgLyoqIFJlcG8tcmVsYXRpdmUgZmlsZSBwYXRoIChmb3Igb3Blbi1pbi1lZGl0b3IgYW5kIG1hcmtlcnMpLiAqL1xuICBwYXRoPzogc3RyaW5nXG4gIC8qKiBBSS1yZXZpZXcgZmluZGluZ3MgdG8gbWFyayBvbiBtYXRjaGluZyBsaW5lcy4gKi9cbiAgcmV2aWV3RmluZGluZ3M/OiBSZXZpZXdGaW5kaW5nW11cbiAgLyoqIE9wZW4gdGhlIGZpbGUgYXQgYSBsaW5lIGluIHRoZSB1c2VyJ3MgZWRpdG9yLiAqL1xuICBvbk9wZW5MaW5lPzogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiB2b2lkXG4gIC8qKiBUZW1wb3JhcnkgbGluZSBoaWdobGlnaHQgKGUuZy4ganVtcCBmcm9tIGEgUFIgY29tbWVudCkuICovXG4gIGp1bXBMaW5lPzogbnVtYmVyIHwgbnVsbFxufSkge1xuICBjb25zdCBibG9ja3MgPSBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICBsZXQgaHVua0luZGV4ID0gMFxuICBjb25zdCBlZGl0aW5nS2V5ID0gY29tbWVudEVkaXRvciA/IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gIDogbnVsbFxuICBjb25zdCBmaW5kaW5nc0ZvciA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKTogUmV2aWV3RmluZGluZ1tdID0+IHtcbiAgICBpZiAoIXBhdGggfHwgIXJldmlld0ZpbmRpbmdzIHx8IHJldmlld0ZpbmRpbmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gICAgcmV0dXJuIHJldmlld0ZpbmRpbmdzLmZpbHRlcigoZikgPT4ge1xuICAgICAgaWYgKGYuZmlsZSAhPT0gcGF0aCkgcmV0dXJuIGZhbHNlXG4gICAgICBpZiAobmV3TGluZSAhPT0gbnVsbCkgcmV0dXJuIG5ld0xpbmUgPj0gZi5saW5lU3RhcnQgJiYgbmV3TGluZSA8PSBmLmxpbmVFbmRcbiAgICAgIHJldHVybiBvbGRMaW5lICE9PSBudWxsICYmIG9sZExpbmUgPj0gZi5saW5lU3RhcnQgJiYgb2xkTGluZSA8PSBmLmxpbmVFbmRcbiAgICB9KVxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IHtcbiAgICAgICAgICBjb25zdCBpc0h1bmsgPSBibG9jay5oZWFkPy5raW5kID09PSAnaHVuaydcbiAgICAgICAgICBjb25zdCBodW5rID0gaXNIdW5rID8gaHVua3NbaHVua0luZGV4KytdIDogdW5kZWZpbmVkXG4gICAgICAgICAgY29uc3Qgc3RhcnRzID0gYmxvY2suaGVhZD8ua2luZCA9PT0gJ2h1bmsnID8gaHVua1N0YXJ0cyhibG9jay5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgICAgIGNvbnN0IHJvd3MgPSBpc0h1bmsgPyB1bmlmaWVkUm93c1dpdGhMaW5lcyhibG9jay5yb3dzLCBzdGFydHMub2xkU3RhcnQsIHN0YXJ0cy5uZXdTdGFydCkgOiBbXVxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgIHtpc0h1bmsgJiYgIXJlYWRPbmx5ID8gPEh1bmtUb29sYmFyIGh1bms9e2h1bmt9IGJ1c3k9e2J1c3l9IG9uQWN0aW9uPXtvbkh1bmtBY3Rpb259IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtibG9jay5oZWFkLmtpbmR9YH0+e2Jsb2NrLmhlYWQudGV4dCB8fCAnICd9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAge2lzSHVua1xuICAgICAgICAgICAgICAgID8gcm93cy5tYXAoKHsgcm93LCBvbGRMaW5lLCBuZXdMaW5lIH0sIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke29sZExpbmUgPz8gJ28nfToke25ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93Q29tbWVudHMgPSBjb21tZW50cz8uZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBvbGRMaW5lLCBuZXdMaW5lKSkgPz8gW11cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ3MgPSBmaW5kaW5nc0ZvcihvbGRMaW5lLCBuZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlZGl0aW5nID0gZWRpdGluZ0tleSA9PT0ga2V5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3dBY3Rpb25zID0gcm93LmtpbmQgPT09ICdjdHgnIHx8IHJvdy5raW5kID09PSAnYWRkJyB8fCByb3cua2luZCA9PT0gJ2RlbCdcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ0NscyA9IGZpbmRpbmdzLmxlbmd0aCA+IDAgPyBgIGRzZHItbGluZS1maW5kaW5nIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wZWQgPSBqdW1wTGluZSAhPSBudWxsICYmIChuZXdMaW5lID09PSBqdW1wTGluZSB8fCAobmV3TGluZSA9PT0gbnVsbCAmJiBvbGRMaW5lID09PSBqdW1wTGluZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17cml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9JHtyb3dDb21tZW50cy5sZW5ndGggPiAwID8gJyBkc2RyLWxpbmUtY29tbWVudGVkJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1saW5lLWp1bXAnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS1udW1cIj57bmV3TGluZSA/PyBvbGRMaW5lID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLXRleHRcIj57cm93LnRleHQgfHwgJyAnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLXRhZyBkc2RyLWZpbmRpbmctJHtmaW5kaW5nc1swXS5wcmlvcml0eX1gfSB0aXRsZT17ZmluZGluZ3NbMF0udGl0bGV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nc1swXS5wcmlvcml0eX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3MubGVuZ3RoID4gMSA/IGBcdTAwRDcke2ZpbmRpbmdzLmxlbmd0aH1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3BhdGggJiYgb25PcGVuTGluZSAmJiAobmV3TGluZSA/PyBvbGRMaW5lKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItb3BlbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbk9wZW5MaW5lKHBhdGgsIG5ld0xpbmUgPz8gb2xkTGluZSA/PyAxKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50PXtyb3dDb21tZW50cy5sZW5ndGh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW49e2NvbW1lbnRQb3BvdmVyID09PSBrZXl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT3Blbj17KCkgPT4gb25PcGVuQ29tbWVudD8uKG9sZExpbmUsIG5ld0xpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gb25Ub2dnbGVQb3BvdmVyPy4oa2V5KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgJiYgcm93Q29tbWVudHMubGVuZ3RoID4gMCAmJiBjb21tZW50UG9wb3ZlciA9PT0ga2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1wb3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93Q29tbWVudHMubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17Y29tbWVudC5pZH0gY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtdGV4dFwiPntjb21tZW50LnRleHR9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Y29tbWVudC5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25EZWxldGVDb21tZW50Py4oY29tbWVudC5pZCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuZGVsZXRlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZWRpdGluZyA/IDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0ID8/ICcnfSBvblRleHQ9e29uQ29tbWVudFRleHQgPz8gKCgpID0+IHt9KX0gb25TYXZlPXtvblNhdmVDb21tZW50ID8/ICgoKSA9PiB7fSl9IG9uQ2FuY2VsPXtvbkNhbmNlbENvbW1lbnQgPz8gKCgpID0+IHt9KX0gYnVzeT17YnVzeX0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgOiBibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICA8L3ByZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbi8qKiBEcmFnIGhhbmRsZSBmb3IgcmVzaXppbmcgdGhlIHBhbmVsIChlYXN0IC8gc291dGggLyBzb3V0aC1lYXN0KS4gKi9cbmZ1bmN0aW9uIFJlc2l6ZUhhbmRsZSh7IG1vZGUsIG9uUmVzaXplIH06IHsgbW9kZTogJ2UnIHwgJ3MnIHwgJ3NlJzsgb25SZXNpemU6IChkeDogbnVtYmVyLCBkeTogbnVtYmVyKSA9PiB2b2lkIH0pIHtcbiAgY29uc3QgbGFzdCA9IHVzZVJlZjx7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsPihudWxsKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YGRzZHItcmVzaXplIGRzZHItcmVzaXplLSR7bW9kZX1gfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFsYXN0LmN1cnJlbnQpIHJldHVyblxuICAgICAgICBjb25zdCBkeCA9IGV2ZW50LmNsaWVudFggLSBsYXN0LmN1cnJlbnQueFxuICAgICAgICBjb25zdCBkeSA9IGV2ZW50LmNsaWVudFkgLSBsYXN0LmN1cnJlbnQueVxuICAgICAgICBsYXN0LmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfVxuICAgICAgICBpZiAoZHggIT09IDAgfHwgZHkgIT09IDApIG9uUmVzaXplKGR4LCBkeSlcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJVcD17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlckNhbmNlbD17KCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSBudWxsXG4gICAgICB9fVxuICAgIC8+XG4gIClcbn1cblxuLyoqIFN0YXR1cyBjaGlwIGNvbG9yIGNsYXNzIGZvciBhIHdvcmtzcGFjZSBjaGFuZ2UuICovXG5mdW5jdGlvbiBjaGlwQ2xhc3Moc3RhdHVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBzID0gc3RhdHVzLnJlcGxhY2UoL1xccy9nLCAnJylcbiAgaWYgKHMuaW5jbHVkZXMoJz8/JykpIHJldHVybiAnZHNkci1jaGlwLXUnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ0EnKSB8fCBzLmluY2x1ZGVzKCdBJykpIHJldHVybiAnZHNkci1jaGlwLWEnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ0QnKSB8fCBzLmluY2x1ZGVzKCdEJykpIHJldHVybiAnZHNkci1jaGlwLWQnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ1InKSB8fCBzLmluY2x1ZGVzKCdSJykpIHJldHVybiAnZHNkci1jaGlwLXInXG4gIHJldHVybiAnZHNkci1jaGlwLW0nXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRTdGF0dXMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFN0YXR1c1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1NUQVRVU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYHN0YXR1cyByZXF1ZXN0IGZhaWxlZDogJHtyZXMuc3RhdHVzfWApXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKSkgYXMgU3RhdHVzUmVzcG9uc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXBwbHlDaGFuZ2VzKGN3ZDogc3RyaW5nLCBhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPEFwcGx5UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQVBQTFlfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIGFjdGlvbiwgcGF0aCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEFwcGx5UmVzcG9uc2Vcbn1cblxuLyoqIEFwcGx5IG9uZSBodW5rIG9mIG9uZSBmaWxlIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpLiAqL1xuYXN5bmMgZnVuY3Rpb24gYXBwbHlIdW5rKGN3ZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogc3RyaW5nKTogUHJvbWlzZTxBcHBseUh1bmtSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9IVU5LX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBwYXRoLCBhY3Rpb24sIGh1bmsgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBBcHBseUh1bmtSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5HaXRBY3Rpb24oY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2NvbW1pdCcgfCAncHVzaCcsIG1lc3NhZ2U/OiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlc3BvbnNlPiB7XG4gIGNvbnN0IHVybCA9IGFjdGlvbiA9PT0gJ2NvbW1pdCcgPyBDT01NSVRfVVJMIDogUFVTSF9VUkxcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYWN0aW9uID09PSAnY29tbWl0JyA/IHsgY3dkLCBtZXNzYWdlIH0gOiB7IGN3ZCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEdpdFJlc3BvbnNlXG59XG5cbi8qKiBMb2NhbCAodW5wdXNoZWQpIGNvbW1pdHMgYWhlYWQgb2YgdGhlIHVwc3RyZWFtLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEhpc3RvcnkoY3dkOiBzdHJpbmcpOiBQcm9taXNlPEhpc3RvcnlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtISVNUT1JZX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWl0czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBIaXN0b3J5UmVzcG9uc2Vcbn1cblxuLyoqIE9uZSBjb21taXQncyB1bmlmaWVkIGRpZmYuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWl0RGlmZihjd2Q6IHN0cmluZywgaGFzaDogc3RyaW5nKTogUHJvbWlzZTxDb21taXREaWZmUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUlUX0RJRkZfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX0maGFzaD0ke2VuY29kZVVSSUNvbXBvbmVudChoYXNoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBkaWZmOiAnJywgZmlsZXM6IFtdLCBhZGRlZDogMCwgZGVsZXRlZDogMCwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIENvbW1pdERpZmZSZXNwb25zZVxufVxuXG4vKiogSW5saW5lIHJldmlldyBjb21tZW50cyBmb3IgdGhlIHdvcmtzcGFjZSAocmVwby1zY29wZWQpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZENvbW1lbnRzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxSZXZpZXdDb21tZW50W10+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUVOVFNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21tZW50czogW10gfSkpKSBhcyBDb21tZW50c1Jlc3BvbnNlXG4gIHJldHVybiBkYXRhLm9rID8gZGF0YS5jb21tZW50cyA6IFtdXG59XG5cbi8qKiBSZXBsYWNlIHRoZSB3aG9sZSBjb21tZW50IGxpc3QgKHNpbmdsZS11c2VyIHJlcGxhY2Ugc2VtYW50aWNzKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDb21tZW50cyhjd2Q6IHN0cmluZywgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChDT01NRU5UU19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgY29tbWVudHMgfSksXG4gIH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UgfSkpKSBhcyBDb21tZW50c1Jlc3BvbnNlXG4gIHJldHVybiBkYXRhLm9rID09PSB0cnVlXG59XG5cbi8qKiBMb2NhbCBicmFuY2ggbmFtZXMgKGZvciB0aGUgQnJhbmNoIHJldmlldyBzY29wZSkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQnJhbmNoZXMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0JSQU5DSEVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgYnJhbmNoZXM6IFtdIH0pKSkgYXMgeyBvazogYm9vbGVhbjsgYnJhbmNoZXM6IHN0cmluZ1tdIH1cbiAgcmV0dXJuIGRhdGEub2sgPyBkYXRhLmJyYW5jaGVzIDogW11cbn1cblxuLyoqIFJ1biBhbiBBSSByZXZpZXcgb3ZlciB0aGUgZ2l2ZW4gc2NvcGUuICovXG5hc3luYyBmdW5jdGlvbiBydW5SZXZpZXcoY3dkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCwgc2NvcGU6ICd1bmNvbW1pdHRlZCcgfCAnYnJhbmNoJyB8ICdjb21taXQnLCBiYXNlPzogc3RyaW5nLCBjb21taXRIYXNoPzogc3RyaW5nKTogUHJvbWlzZTxSZXZpZXdSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChSRVZJRVdfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHNlc3Npb25JZDogc2Vzc2lvbklkID8/IHVuZGVmaW5lZCwgc2NvcGUsIGJhc2UsIGNvbW1pdEhhc2ggfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGZpbmRpbmdzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFJldmlld1Jlc3BvbnNlXG59XG5cbi8qKiBDdXJyZW50IGJyYW5jaCdzIEdpdEh1YiBQUiBjb250ZXh0IChkZWdyYWRlcyBncmFjZWZ1bGx5IHdpdGhvdXQgZ2gpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZFByKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxQclJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1BSX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWVudHM6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUHJSZXNwb25zZVxufVxuXG4vKiogR2l0IHJlcG9zIHVuZGVyIGEgd29ya3NwYWNlIChtdWx0aS1yZXBvIHNlbGVjdG9yKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRSZXBvcyhjd2Q6IHN0cmluZyk6IFByb21pc2U8UmVwb3NSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtSRVBPU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIHJlcG9zOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFJlcG9zUmVzcG9uc2Vcbn1cblxuLyoqIE9wZW4gYSBmaWxlIChvcHRpb25hbGx5IGF0IGEgbGluZSkgaW4gdGhlIHVzZXIncyBlZGl0b3IgdmlhIG9wZW4tZWRpdG9yLiAqL1xuYXN5bmMgZnVuY3Rpb24gb3BlbkluRWRpdG9yKGN3ZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgY29uc3QgYWJzID0gcGF0aC5zdGFydHNXaXRoKCcvJykgfHwgL15bQS1aYS16XTpbXFxcXC9dLy50ZXN0KHBhdGgpID8gcGF0aCA6IGAke2N3ZH0vJHtwYXRofWBcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goT1BFTl9FRElUT1JfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBwYXRoOiBhYnMsIGxpbmUgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyB7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9XG59XG5cbi8qKiBTaG9ydCByZWxhdGl2ZSB0aW1lIGZvciBjb21taXQgcm93cyAoXCJqdXN0IG5vd1wiIC8gXCIzIG1pbiBhZ29cIiAvIFx1MjAyNikuICovXG5mdW5jdGlvbiByZWxhdGl2ZVRpbWUoaXNvOiBzdHJpbmcsIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKChEYXRlLm5vdygpIC0gbmV3IERhdGUoaXNvKS5nZXRUaW1lKCkpIC8gNjAwMDApXG4gIGlmIChtaW51dGVzIDwgMSkgcmV0dXJuIHQoJ3RpbWUubm93JylcbiAgaWYgKG1pbnV0ZXMgPCA2MCkgcmV0dXJuIHQoJ3RpbWUubWludXRlcycsIHsgbjogbWludXRlcyB9KVxuICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKVxuICBpZiAoaG91cnMgPCAyNCkgcmV0dXJuIHQoJ3RpbWUuaG91cnMnLCB7IG46IGhvdXJzIH0pXG4gIHJldHVybiB0KCd0aW1lLmRheXMnLCB7IG46IE1hdGguZmxvb3IoaG91cnMgLyAyNCkgfSlcbn1cblxuLyoqIFRoZW1lLWF3YXJlIGRyb3Bkb3duIHJlcGxhY2luZyBuYXRpdmUgPHNlbGVjdD4gKG5hdGl2ZSBwb3B1cHMgaWdub3JlIHRoZSB0aGVtZSkuICovXG5mdW5jdGlvbiBUaGVtZVNlbGVjdCh7XG4gIHZhbHVlLFxuICBvcHRpb25zLFxuICBvbkNoYW5nZSxcbiAgYXJpYUxhYmVsLFxufToge1xuICB2YWx1ZTogc3RyaW5nXG4gIG9wdGlvbnM6IHsgdmFsdWU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9W11cbiAgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkXG4gIGFyaWFMYWJlbD86IHN0cmluZ1xufSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3Qgcm9vdFJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgY3VycmVudCA9IG9wdGlvbnMuZmluZCgobykgPT4gby52YWx1ZSA9PT0gdmFsdWUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVyblxuICAgIGNvbnN0IGNsb3NlT3V0c2lkZSA9IChldmVudDogUG9pbnRlckV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiAhcm9vdFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBjb25zdCBjbG9zZU9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBjbG9zZU91dHNpZGUpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNsb3NlT25LZXkpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgY2xvc2VPdXRzaWRlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNsb3NlT25LZXkpXG4gICAgfVxuICB9LCBbb3Blbl0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VsXCIgcmVmPXtyb290UmVmfT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItc2VsLXRyaWdnZXJcIlxuICAgICAgICBhcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiXG4gICAgICAgIGFyaWEtZXhwYW5kZWQ9e29wZW59XG4gICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgICAgICAgb25DbGljaz17KCkgPT4gc2V0T3BlbigodikgPT4gIXYpfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC12YWx1ZVwiPntjdXJyZW50Py5sYWJlbCA/PyB2YWx1ZX08L3NwYW4+XG4gICAgICAgIDxJY29uQ2hldnJvbkRvd24gLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJkc2RyLXNlbC1tZW51XCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPXthcmlhTGFiZWx9PlxuICAgICAgICAgIHtvcHRpb25zLm1hcCgob3B0aW9uKSA9PiAoXG4gICAgICAgICAgICA8bGkga2V5PXtvcHRpb24udmFsdWV9IHJvbGU9XCJub25lXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtvcHRpb24udmFsdWUgPT09IHZhbHVlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc2VsLW9wdGlvbiR7b3B0aW9uLnZhbHVlID09PSB2YWx1ZSA/ICcgZHNkci1zZWwtb3B0aW9uLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKG9wdGlvbi52YWx1ZSlcbiAgICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLW9wdGlvbi1tYXJrXCI+e29wdGlvbi52YWx1ZSA9PT0gdmFsdWUgPyA8SWNvbkNoZWNrIC8+IDogbnVsbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtb3B0aW9uLWxhYmVsXCI+e29wdGlvbi5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC91bD5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBEaWZmIGZvbnQgKyBmb250IHNpemUgY29udHJvbHMgKHNoYXJlZCBwcmVmcyBzdG9yZSkuICovXG5mdW5jdGlvbiBEaWZmUmV2aWV3UHJlZnMoeyB0IH06IHsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgcHJlZnMgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwcmVmc1N0b3JlLnN1YnNjcmliZSwgcHJlZnNTdG9yZS5nZXRTbmFwc2hvdClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1maWVsZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1sYWJlbFwiIGlkPVwiZHNkci1wcmVmLWZvbnQtbGFiZWxcIj57dCgnc2V0dGluZ3MuZm9udCcpfTwvc3Bhbj5cbiAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgYXJpYUxhYmVsPXt0KCdzZXR0aW5ncy5mb250Jyl9XG4gICAgICAgICAgdmFsdWU9e3ByZWZzLmZvbnR9XG4gICAgICAgICAgb3B0aW9ucz17Rk9OVF9PUFRJT05TLm1hcCgoZikgPT4gKHsgdmFsdWU6IGYuaWQsIGxhYmVsOiBmLmxhYmVsLnN0YXJ0c1dpdGgoJ2ZvbnQuJykgPyB0KGYubGFiZWwgYXMga2V5b2YgdHlwZW9mIHpoKSA6IGYubGFiZWwgfSkpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZm9udCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuZm9udCA9IGZvbnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWZpZWxkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWxhYmVsXCIgaWQ9XCJkc2RyLXByZWYtc2l6ZS1sYWJlbFwiPnt0KCdzZXR0aW5ncy5zaXplJyl9PC9zcGFuPlxuICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLnNpemUnKX1cbiAgICAgICAgICB2YWx1ZT17U3RyaW5nKHByZWZzLnNpemUpfVxuICAgICAgICAgIG9wdGlvbnM9e1NJWkVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBTdHJpbmcocyksIGxhYmVsOiBgJHtzfXB4YCB9KSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyhzaXplKSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5zaXplID0gTnVtYmVyKHNpemUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSGVhZGVyIGFjdGlvbiAoc2Vzc2lvbiBzY29wZSk6IGJhZGdlICsgb3Blbi5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3QWN0aW9uKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgdXNlU2Vzc2lvbiwgdCB9OiBEaWZmUmV2aWV3QWN0aW9uUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IG5vZGVzID0gdXNlU2Vzc2lvbigocykgPT4gcy5ub2RlcylcbiAgY29uc3QgY2hhbmdlQ291bnQgPSB1c2VNZW1vKCgpID0+IGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXMpLCBbbm9kZXNdKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBvcGVuT3ZlcmxheSA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWIgPSBvdmVybGF5U3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHNldE9wZW4ob3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KCkub3BlbilcbiAgICB9KVxuICAgIHJldHVybiB1bnN1YlxuICB9LCBbXSlcblxuICBpZiAoIWN3ZCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItdHJpZ2dlclwiIGFyaWEtbGFiZWw9e3QoJ2FjdGlvbi5hcmlhJyl9IG9uQ2xpY2s9e29wZW5PdmVybGF5fT5cbiAgICAgIDxJY29uRGlmZiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1sYWJlbFwiPnt0KCdhY3Rpb24ubGFiZWwnKX08L3NwYW4+XG4gICAgICB7Y2hhbmdlQ291bnQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiPntjaGFuZ2VDb3VudH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtvcGVuID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlsZSB0cmVlOiBidWlsZCBhIGRpcmVjdG9yeSB0cmVlIGZyb20gZmxhdCBwYXRocyBhbmQgcmVuZGVyIGl0IHdpdGhcbi8vIGNvbGxhcHNpYmxlIGZvbGRlcnMgKHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHJldmlldyBzdXJmYWNlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIFRyZWVEaXI8VD4gPSB7IGtpbmQ6ICdkaXInOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY2hpbGRyZW46IFRyZWVOb2RlPFQ+W10gfVxudHlwZSBUcmVlTGVhZjxUPiA9IHsga2luZDogJ2xlYWYnOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgaXRlbTogVCB9XG50eXBlIFRyZWVOb2RlPFQ+ID0gVHJlZURpcjxUPiB8IFRyZWVMZWFmPFQ+XG5cbi8qKiBUdXJuIGEgZmxhdCBpdGVtIGxpc3QgaW50byBhIHNvcnRlZCBkaXJlY3RvcnkgdHJlZSAoZGlyZWN0b3JpZXMgZmlyc3QpLiAqL1xuZnVuY3Rpb24gYnVpbGRGaWxlVHJlZTxUPihpdGVtczogcmVhZG9ubHkgVFtdLCBwYXRoT2Y6IChpdGVtOiBUKSA9PiBzdHJpbmcpOiBUcmVlTm9kZTxUPltdIHtcbiAgY29uc3Qgcm9vdDogVHJlZU5vZGU8VD5bXSA9IFtdXG4gIGNvbnN0IGRpckluZGV4ID0gbmV3IE1hcDxzdHJpbmcsIFRyZWVEaXI8VD4+KClcbiAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgY29uc3QgcGF0aCA9IHBhdGhPZihpdGVtKVxuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDApIGNvbnRpbnVlXG4gICAgbGV0IHNpYmxpbmdzID0gcm9vdFxuICAgIGxldCBwcmVmaXggPSAnJ1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBwcmVmaXggPSBwcmVmaXggPyBgJHtwcmVmaXh9LyR7cGFydHNbaV19YCA6IHBhcnRzW2ldXG4gICAgICBsZXQgZGlyID0gZGlySW5kZXguZ2V0KHByZWZpeClcbiAgICAgIGlmICghZGlyKSB7XG4gICAgICAgIGRpciA9IHsga2luZDogJ2RpcicsIG5hbWU6IHBhcnRzW2ldLCBwYXRoOiBwcmVmaXgsIGNoaWxkcmVuOiBbXSB9XG4gICAgICAgIGRpckluZGV4LnNldChwcmVmaXgsIGRpcilcbiAgICAgICAgc2libGluZ3MucHVzaChkaXIpXG4gICAgICB9XG4gICAgICBzaWJsaW5ncyA9IGRpci5jaGlsZHJlblxuICAgIH1cbiAgICBzaWJsaW5ncy5wdXNoKHsga2luZDogJ2xlYWYnLCBuYW1lOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSwgcGF0aCwgaXRlbSB9KVxuICB9XG4gIGNvbnN0IHNvcnROb2RlcyA9IChub2RlczogVHJlZU5vZGU8VD5bXSk6IHZvaWQgPT4ge1xuICAgIG5vZGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLmtpbmQgIT09IGIua2luZCkgcmV0dXJuIGEua2luZCA9PT0gJ2RpcicgPyAtMSA6IDFcbiAgICAgIHJldHVybiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpXG4gICAgfSlcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIGlmIChub2RlLmtpbmQgPT09ICdkaXInKSBzb3J0Tm9kZXMobm9kZS5jaGlsZHJlbilcbiAgfVxuICBzb3J0Tm9kZXMocm9vdClcbiAgcmV0dXJuIHJvb3Rcbn1cblxuLyoqIFJlY3Vyc2l2ZSB0cmVlIHJlbmRlcmVyOiBjb2xsYXBzaWJsZSBkaXJlY3RvcmllcyArIGxlYWYgcm93cy4gKi9cbmZ1bmN0aW9uIEZpbGVUcmVlVmlldzxUPihwcm9wczoge1xuICBub2RlczogVHJlZU5vZGU8VD5bXVxuICBjb2xsYXBzZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz5cbiAgb25Ub2dnbGVEaXI6IChwYXRoOiBzdHJpbmcpID0+IHZvaWRcbiAgZGVwdGg6IG51bWJlclxuICByZW5kZXJMZWFmOiAobGVhZjogVHJlZUxlYWY8VD4pID0+IFJlYWN0Tm9kZVxufSk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IHsgbm9kZXMsIGNvbGxhcHNlZCwgb25Ub2dnbGVEaXIsIGRlcHRoLCByZW5kZXJMZWFmIH0gPSBwcm9wc1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7bm9kZXMubWFwKChub2RlKSA9PlxuICAgICAgICBub2RlLmtpbmQgPT09ICdkaXInID8gKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9PlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1kaXIke2NvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/ICcnIDogJyBkc2RyLWRpci1vcGVuJ31gfVxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nTGVmdDogZGVwdGggKiAxNCArIDggfX1cbiAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25Ub2dnbGVEaXIobm9kZS5wYXRoKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY2FyZXRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJ1x1MjVCOCcgOiAnXHUyNUJFJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLW5hbWVcIiB0aXRsZT17bm9kZS5wYXRofT57bm9kZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY291bnRcIj57bm9kZS5jaGlsZHJlbi5sZW5ndGh9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/IChcbiAgICAgICAgICAgICAgPEZpbGVUcmVlVmlldyBub2Rlcz17bm9kZS5jaGlsZHJlbn0gY29sbGFwc2VkPXtjb2xsYXBzZWR9IG9uVG9nZ2xlRGlyPXtvblRvZ2dsZURpcn0gZGVwdGg9e2RlcHRoICsgMX0gcmVuZGVyTGVhZj17cmVuZGVyTGVhZn0gLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9IHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0IH19PntyZW5kZXJMZWFmKG5vZGUpfTwvZGl2PlxuICAgICAgICApLFxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbXBvc2VyIGRvY2sgKHNlc3Npb24gc2NvcGUpOiBwZW5kaW5nIGlubGluZSBjb21tZW50cyBmbG9hdCBhYm92ZSB0aGVcbi8vIGlucHV0IGJveCwgQ29kZXgtc3R5bGUgXHUyMDE0IGhvdmVyIHRoZSBwaWxsIHRvIHByZXZpZXcsIGNsaWNrIHNlbmQgdG8gaW5qZWN0LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnR5cGUgRGlmZlJldmlld0NvbXBvc2VyRG9ja1Byb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uaW5wdXQuZG9jayc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7IHNlc3Npb25zOiBJU2Vzc2lvbnMgfVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgc2Vzc2lvbnMsIHQgfTogRGlmZlJldmlld0NvbXBvc2VyRG9ja1Byb3BzKSB7XG4gIGNvbnN0IGN3ZCA9IHVzZVNlc3Npb25zKChzOiBTZXNzaW9uTGlzdFN0YXRlKSA9PiBzLmJ5SWRbc2Vzc2lvbklkXT8uY3dkKVxuICBjb25zdCBwZW5kaW5nID0gdXNlU3luY0V4dGVybmFsU3RvcmUocGVuZGluZ0NvbW1lbnRzU3RvcmUuc3Vic2NyaWJlLCBwZW5kaW5nQ29tbWVudHNTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbmRpbmcsIHNldFNlbmRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtkaXNtaXNzZWQsIHNldERpc21pc3NlZF0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbnRGbGFzaCwgc2V0U2VudEZsYXNoXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBzZW50SWRzID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpXG5cbiAgLy8gU2VlZCB0aGUgc3RvcmUgZnJvbSBzZXJ2ZXIgc3RvcmFnZSB3aGVuIG5vdGhpbmcgaGFzIGJlZW4gc3luY2VkIGZvciB0aGlzXG4gIC8vIHdvcmtzcGFjZSB5ZXQgKHBhbmVsIG5ldmVyIG9wZW5lZCB0aGlzIHNlc3Npb24gXHUyMDE0IGNvbW1lbnRzIHBlcnNpc3QgaW4gLmdpdCkuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFjd2QgfHwgcGVuZGluZy5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCBsb2FkQ29tbWVudHMoY3dkKS50aGVuKChsaXN0KSA9PiB7XG4gICAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm5cbiAgICAgIHBlbmRpbmdDb21tZW50c1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICBpZiAoZC5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgICAgIGQuY3dkID0gY3dkXG4gICAgICAgIGQuY29tbWVudHMgPSBsaXN0XG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbY3dkLCBwZW5kaW5nLmN3ZF0pXG5cbiAgY29uc3QgY29tbWVudHMgPSBwZW5kaW5nLmN3ZCA9PT0gY3dkID8gcGVuZGluZy5jb21tZW50cyA6IFtdXG4gIGNvbnN0IGlkcyA9IGNvbW1lbnRzLm1hcCgoYykgPT4gYy5pZCkuam9pbignLCcpXG4gIGNvbnN0IGFscmVhZHlTZW50ID0gc2VudElkcy5jdXJyZW50ID09PSBpZHNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoY29tbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBzZXREaXNtaXNzZWQoZmFsc2UpXG4gICAgICBzZXRTZW50Rmxhc2goZmFsc2UpXG4gICAgICBzZW50SWRzLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY29tbWVudHMubGVuZ3RoXSlcblxuICBpZiAoIWN3ZCB8fCBjb21tZW50cy5sZW5ndGggPT09IDAgfHwgZGlzbWlzc2VkIHx8IGFscmVhZHlTZW50KSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHNlbmQgPSBhc3luYyAoKSA9PiB7XG4gICAgc2V0U2VuZGluZyh0cnVlKVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFsnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJywgJyddXG4gICAgZm9yIChjb25zdCBjIG9mIGNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBhbmNob3IgPSBjLmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Yy5saW5lTmV3fWAgOiBgIChvbGQgbGluZSAke2MubGluZU9sZH0pYFxuICAgICAgbGluZXMucHVzaChgLSAke2MucGF0aH0ke2FuY2hvcn06ICR7Yy50ZXh0fWApXG4gICAgfVxuICAgIGNvbnN0IG91dGNvbWUgPSBhd2FpdCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIHNlc3Npb25JZCwgbGluZXMuam9pbignXFxuJykpXG4gICAgc2V0U2VuZGluZyhmYWxzZSlcbiAgICBpZiAob3V0Y29tZSA9PT0gJ3NlbnQnKSB7XG4gICAgICBzZW50SWRzLmN1cnJlbnQgPSBjb21tZW50cy5tYXAoKGMpID0+IGMuaWQpLmpvaW4oJywnKVxuICAgICAgc2V0U2VudEZsYXNoKHRydWUpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldFNlbnRGbGFzaChmYWxzZSksIDIwMDApXG4gICAgfSBlbHNlIGlmIChvdXRjb21lID09PSAnY29waWVkJykge1xuICAgICAgc2VudElkcy5jdXJyZW50ID0gY29tbWVudHMubWFwKChjKSA9PiBjLmlkKS5qb2luKCcsJylcbiAgICAgIHNldFNlbnRGbGFzaCh0cnVlKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRTZW50Rmxhc2goZmFsc2UpLCAyMDAwKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2tcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kb2NrLXBpbGxcIiBvbk1vdXNlRW50ZXI9eygpID0+IHNldEhvdmVyKHRydWUpfSBvbk1vdXNlTGVhdmU9eygpID0+IHNldEhvdmVyKGZhbHNlKX0gcm9sZT1cImJ1dHRvblwiIHRhYkluZGV4PXswfSBhcmlhLWxhYmVsPXt0KCdyZXZpZXcuZG9ja0NvbW1lbnRzJywgeyBuOiBjb21tZW50cy5sZW5ndGggfSl9PlxuICAgICAgICBcdUQ4M0RcdURDQUMge3QoJ3Jldmlldy5kb2NrQ29tbWVudHMnLCB7IG46IGNvbW1lbnRzLmxlbmd0aCB9KX1cbiAgICAgICAge2hvdmVyID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kb2NrLXBvcFwiPlxuICAgICAgICAgICAge2NvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17Y29tbWVudC5pZH0gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stbG9jXCI+e2NvbW1lbnQucGF0aH17Y29tbWVudC5saW5lTmV3ICE9PSBudWxsID8gYDoke2NvbW1lbnQubGluZU5ld31gIDogJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay10ZXh0XCI+e2NvbW1lbnQudGV4dH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5IGRzZHItZG9jay1zZW5kXCIgZGlzYWJsZWQ9e3NlbmRpbmd9IG9uQ2xpY2s9eygpID0+IHZvaWQgc2VuZCgpfT5cbiAgICAgICAge3NlbnRGbGFzaCA/IHQoJ3Jldmlldy5zZW50JykgOiBzZW5kaW5nID8gdCgncmV2aWV3LmJ1c3knKSA6IHQoJ3Jldmlldy5zZW5kVG9BZ2VudCcpfVxuICAgICAgPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWRvY2stY2xvc2VcIiBhcmlhLWxhYmVsPXt0KCdjb21tZW50LmNhbmNlbCcpfSBvbkNsaWNrPXsoKSA9PiBzZXREaXNtaXNzZWQodHJ1ZSl9PlxuICAgICAgICBcdTI3MTVcbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IG92ZXJsYXkgKHJvb3Qgc2NvcGUpOiBzZXNzaW9uICsgd29ya3NwYWNlIHRhYnMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gRGlmZlJldmlld092ZXJsYXkoeyBzZXNzaW9ucywgdCB9OiBEaWZmUmV2aWV3T3ZlcmxheVByb3BzKSB7XG4gIGNvbnN0IHN0b3JlU3RhdGUgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShvdmVybGF5U3RvcmUuc3Vic2NyaWJlLCBvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IHByZWZzID0gdXNlU3luY0V4dGVybmFsU3RvcmUocHJlZnNTdG9yZS5zdWJzY3JpYmUsIHByZWZzU3RvcmUuZ2V0U25hcHNob3QpXG4gIC8vIEdpdC1maXJzdDogbGFuZCBvbiB0aGUgd29ya3NwYWNlIHRhYiAoc3RhZ2VkL3Vuc3RhZ2VkL2JyYW5jaCB0cmVlcykgc28gdGhlXG4gIC8vIGNoYW5nZSByZXZpZXcgaXMgb25lIGNsaWNrIGF3YXk7IHRoZSBzZXNzaW9uIHRhYiBzdGF5cyBhIGNsaWNrIGF3YXkuXG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSB1c2VTdGF0ZTwnc2Vzc2lvbicgfCAnd29ya3NwYWNlJz4oJ3dvcmtzcGFjZScpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IHVzZVN0YXRlPFZpZXdNb2RlPigoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJyAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZHNkci12aWV3JykgPT09ICdzcGxpdCcgPyAnc3BsaXQnIDogJ3NpbmdsZSdcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiAnc2luZ2xlJ1xuICAgIH1cbiAgfSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RzZHItdmlldycsIHZpZXcpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBwcml2YXRlIG1vZGUgLyB1bmF2YWlsYWJsZSBcdTIwMTQgbm9uLWZhdGFsXG4gICAgfVxuICB9LCBbdmlld10pXG5cbiAgLy8gV29ya3NwYWNlIHRhYiBzdGF0ZS5cbiAgY29uc3QgW3N0YXR1cywgc2V0U3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW25vdGljZSwgc2V0Tm90aWNlXSA9IHVzZVN0YXRlPHsga2luZDogJ29rJyB8ICdlcnJvcic7IHRleHQ6IHN0cmluZyB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbmZpcm0sIHNldENvbmZpcm1dID0gdXNlU3RhdGU8J2ZpbGUnIHwgJ2FsbCcgfCAncHVzaCcgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0TWVzc2FnZSwgc2V0Q29tbWl0TWVzc2FnZV0gPSB1c2VTdGF0ZSgnJylcbiAgLy8gTG9jYWwgKHVucHVzaGVkKSBjb21taXQgaGlzdG9yeTogbGlzdCArIHBlci1jb21taXQgZGlmZiB2aWV3LlxuICBjb25zdCBbaGlzdG9yeSwgc2V0SGlzdG9yeV0gPSB1c2VTdGF0ZTxDb21taXRJbmZvW10+KFtdKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXQsIHNldFNlbGVjdGVkQ29tbWl0XSA9IHVzZVN0YXRlPENvbW1pdEluZm8gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZiwgc2V0Q29tbWl0RGlmZl0gPSB1c2VTdGF0ZTxDb21taXREaWZmUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZkxvYWRpbmcsIHNldENvbW1pdERpZmZMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXRGaWxlLCBzZXRTZWxlY3RlZENvbW1pdEZpbGVdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgLy8gSW5saW5lIHJldmlldyBjb21tZW50cyAod29ya3NwYWNlIHRhYiwgc2luZ2xlIHZpZXcpLlxuICBjb25zdCBbY29tbWVudHMsIHNldENvbW1lbnRzXSA9IHVzZVN0YXRlPFJldmlld0NvbW1lbnRbXT4oW10pXG4gIGNvbnN0IFtjb21tZW50RWRpdG9yLCBzZXRDb21tZW50RWRpdG9yXSA9IHVzZVN0YXRlPHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1lbnRUZXh0LCBzZXRDb21tZW50VGV4dF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2NvbW1lbnRQb3BvdmVyLCBzZXRDb21tZW50UG9wb3Zlcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBSZXZpZXcgc2NvcGU6IHdoaWNoIHNsaWNlIG9mIHRoZSByZXBvc2l0b3J5IHRoZSB3b3Jrc3BhY2UgdGFiIHNob3dzLlxuICBjb25zdCBbc2NvcGUsIHNldFNjb3BlXSA9IHVzZVN0YXRlPFdvcmtzcGFjZVNjb3BlPignYWxsJylcbiAgY29uc3QgW2JyYW5jaGVzLCBzZXRCcmFuY2hlc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oW10pXG4gIGNvbnN0IFtiYXNlQnJhbmNoLCBzZXRCYXNlQnJhbmNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtiYXNlU3RhdHVzLCBzZXRCYXNlU3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gRmVlZGJhY2sgbG9vcDogc2VuZCBpbmxpbmUgY29tbWVudHMgdG8gdGhlIGFnZW50IChzZXNzaW9uLnByb21wdCwgY29weSBmYWxsYmFjaykuXG4gIGNvbnN0IFtzZW5kT3Blbiwgc2V0U2VuZE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZW5kVGV4dCwgc2V0U2VuZFRleHRdID0gdXNlU3RhdGUoJycpXG4gIC8vIEFJIHJldmlldyAoL3Jldmlldyk6IGZpbmRpbmdzICsgdmVyZGljdC5cbiAgY29uc3QgW3Jldmlldywgc2V0UmV2aWV3XSA9IHVzZVN0YXRlPFJldmlld1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3Jldmlld2luZywgc2V0UmV2aWV3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICAvLyBHaXRIdWIgUFIgY29udGV4dCAoZ2ggQ0xJKS5cbiAgY29uc3QgW3ByLCBzZXRQcl0gPSB1c2VTdGF0ZTxQclJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gTXVsdGktcmVwbzogcmVwb3MgZGV0ZWN0ZWQgdW5kZXIgdGhlIHdvcmtzcGFjZSArIHRoZSBzZWxlY3RlZCBvbmUuXG4gIGNvbnN0IFtyZXBvcywgc2V0UmVwb3NdID0gdXNlU3RhdGU8eyBwYXRoOiBzdHJpbmc7IGJyYW5jaDogc3RyaW5nIHwgbnVsbCB9W10+KFtdKVxuICBjb25zdCBbcmVwb1BhdGgsIHNldFJlcG9QYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoanVtcCB0YXJnZXQgZnJvbSBhIFBSIGNvbW1lbnQgb3IgYSBmaW5kaW5nKS5cbiAgY29uc3QgW2p1bXBMaW5lLCBzZXRKdW1wTGluZV0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICAvLyBGaW5kaW5ncyBsaXN0IHBhbmVsIHZpc2liaWxpdHkuXG4gIGNvbnN0IFtmaW5kaW5nc09wZW4sIHNldEZpbmRpbmdzT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICAvKiogU2VsZWN0IGEgZmlsZSBhbmQgZmxhc2ggaXRzIGxpbmUgKGZpbmRpbmdzIC8gUFIgY29tbWVudHMpLiAqL1xuICBjb25zdCBqdW1wVG8gPSAoZmlsZTogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWQoZmlsZSlcbiAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICBzZXRKdW1wTGluZShsaW5lID8/IG51bGwpXG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgfVxuICAvLyBDb2xsYXBzZWQgZGlyZWN0b3JpZXMgaW4gdGhlIGxlZnQtaGFuZCBmaWxlIHRyZWUgKHNoYXJlZCBhY3Jvc3MgdGFicykuXG4gIGNvbnN0IFtjb2xsYXBzZWREaXJzLCBzZXRDb2xsYXBzZWREaXJzXSA9IHVzZVN0YXRlPFJlYWRvbmx5U2V0PHN0cmluZz4+KCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgdG9nZ2xlRGlyID0gdXNlTWVtbyhcbiAgICAoKSA9PiAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBzZXRDb2xsYXBzZWREaXJzKChwcmV2KSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpXG4gICAgICAgIGlmIChuZXh0LmhhcyhwYXRoKSkgbmV4dC5kZWxldGUocGF0aClcbiAgICAgICAgZWxzZSBuZXh0LmFkZChwYXRoKVxuICAgICAgICByZXR1cm4gbmV4dFxuICAgICAgfSlcbiAgICB9LFxuICAgIFtdLFxuICApXG4gIGNvbnN0IG5vdGljZVRpbWVyID0gdXNlUmVmPFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkPih1bmRlZmluZWQpXG5cbiAgLy8gQ3VycmVudCBzZXNzaW9uJ3MgY29udmVyc2F0aW9uIHNuYXBzaG90IChyZWFjdGl2ZSksIGZvciB0aGUgc2Vzc2lvbiB0YWIuXG4gIGNvbnN0IGN1cnJlbnRJZCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4gKG5vdGlmeTogKCkgPT4gdm9pZCkgPT4gc2Vzc2lvbnMubGlzdC5zdWJzY3JpYmUobm90aWZ5KSwgW3Nlc3Npb25zXSksXG4gICAgdXNlTWVtbygoKSA9PiAoKSA9PiBzZXNzaW9ucy5saXN0LmdldFNuYXBzaG90KCkuY3VycmVudCwgW3Nlc3Npb25zXSksXG4gIClcbiAgY29uc3Qgc25hcHNob3QgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgaWYgKCFiaW5kaW5nKSByZXR1cm4gKCkgPT4ge31cbiAgICAgICAgcmV0dXJuIGJpbmRpbmcuc2Vzc2lvbi5zdWJzY3JpYmUobm90aWZ5KVxuICAgICAgfVxuICAgIH0sIFtzZXNzaW9ucywgY3VycmVudElkXSksXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiBiaW5kaW5nID8gYmluZGluZy5zZXNzaW9uLmdldFNuYXBzaG90KCkgOiBudWxsXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgKVxuXG4gIGNvbnN0IHJvdW5kcyA9IHVzZU1lbW8oKCkgPT4gKHNuYXBzaG90ID8gY29sbGVjdFNlc3Npb25Sb3VuZHMoc25hcHNob3Qubm9kZXMpIDogW10pLCBbc25hcHNob3RdKVxuICAvLyBMZWZ0LWhhbmQgZmlsZSB0cmVlczogcGVyLXJvdW5kIHRyZWVzIGZvciB0aGUgc2Vzc2lvbiB0YWIsIG9uZSB0cmVlIGZvclxuICAvLyB0aGUgZ2l0IHdvcmtpbmcgdHJlZSBvbiB0aGUgd29ya3NwYWNlIHRhYi5cbiAgY29uc3Qgc2Vzc2lvblRyZWVzID0gdXNlTWVtbygoKSA9PiBuZXcgTWFwKHJvdW5kcy5tYXAoKHIpID0+IFtyLnJvdW5kLCBidWlsZEZpbGVUcmVlKHIuY2hhbmdlcywgKGMpID0+IGMucGF0aCldKSksIFtyb3VuZHNdKVxuICBjb25zdCB0b3RhbFNlc3Npb25GaWxlcyA9IHVzZU1lbW8oKCkgPT4gcm91bmRzLnJlZHVjZSgobiwgcikgPT4gbiArIHIuY2hhbmdlcy5sZW5ndGgsIDApLCBbcm91bmRzXSlcbiAgY29uc3QgW3NlbGVjdGVkUm91bmQsIHNldFNlbGVjdGVkUm91bmRdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkUGF0aCwgc2V0U2VsZWN0ZWRQYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHNlbGVjdGVkQ2hhbmdlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgcm91bmQgPSByb3VuZHMuZmluZCgocikgPT4gci5yb3VuZCA9PT0gc2VsZWN0ZWRSb3VuZClcbiAgICByZXR1cm4gcm91bmQ/LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBzZWxlY3RlZFBhdGgpID8/IG51bGxcbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZCwgc2VsZWN0ZWRQYXRoXSlcblxuICBjb25zdCBjd2QgPSBzdG9yZVN0YXRlLmN3ZFxuICAvKiogQWN0aXZlIGdpdCByZXBvIGZvciB3b3Jrc3BhY2Ugb3BlcmF0aW9ucyAobXVsdGktcmVwbyBzZWxlY3RvciBvdmVycmlkZSkuICovXG4gIGNvbnN0IGFjdGl2ZUN3ZCA9IHJlcG9QYXRoID8/IGN3ZFxuXG4gIGNvbnN0IGxvYWRXb3Jrc3BhY2UgPSBhc3luYyAoc2lsZW50ID0gZmFsc2UpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKCFzaWxlbnQpIHNldExvYWRpbmcodHJ1ZSlcbiAgICBzZXRFcnJvcihudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBbbmV4dCwgaGlzdCwgbmV4dENvbW1lbnRzLCBicmFuY2hMaXN0LCBwckRhdGEsIHJlcG9MaXN0XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgbG9hZFN0YXR1cyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkSGlzdG9yeShhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkQ29tbWVudHMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEJyYW5jaGVzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRQcihhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUmVwb3MoYWN0aXZlQ3dkKSxcbiAgICAgIF0pXG4gICAgICBzZXRTdGF0dXMobmV4dClcbiAgICAgIGlmIChoaXN0Lm9rKSBzZXRIaXN0b3J5KGhpc3QuY29tbWl0cylcbiAgICAgIHNldENvbW1lbnRzKG5leHRDb21tZW50cylcbiAgICAgIHNldEJyYW5jaGVzKGJyYW5jaExpc3QpXG4gICAgICBzZXRQcihwckRhdGEpXG4gICAgICBzZXRSZXBvcyhyZXBvTGlzdC5yZXBvcylcbiAgICAgIC8vIERlZmF1bHQgdGhlIHJlcG8gc2VsZWN0b3IgdG8gdGhlIHdvcmtzcGFjZSByb290IHdoZW4gaXQgaXMgaXRzZWxmIGEgcmVwby5cbiAgICAgIGlmIChyZXBvUGF0aCA9PT0gbnVsbCAmJiAhcmVwb0xpc3QucmVwb3Muc29tZSgocikgPT4gci5wYXRoID09PSBhY3RpdmVDd2QpKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gcmVwb0xpc3QucmVwb3NbMF1cbiAgICAgICAgaWYgKGZpcnN0ICYmIGZpcnN0LnBhdGggIT09IGN3ZCkgc2V0UmVwb1BhdGgoZmlyc3QucGF0aClcbiAgICAgIH1cbiAgICAgIGlmIChuZXh0LmVycm9yICYmICFuZXh0LmlzUmVwbykgc2V0RXJyb3IobmV4dC5lcnJvcilcbiAgICAgIHNldFNlbGVjdGVkKChwcmV2KSA9PiAocHJldiAmJiBuZXh0LmZpbGVzLnNvbWUoKGYpID0+IGYucGF0aCA9PT0gcHJldikgPyBwcmV2IDogbmV4dC5maWxlc1swXT8ucGF0aCA/PyBudWxsKSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXRFcnJvcihlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gQXV0by1yZWZyZXNoIHRoZSB3b3Jrc3BhY2UgZGF0YTogcmVsb2FkIHdoZW5ldmVyIHRoZSB0YWIgYmVjb21lcyBhY3RpdmUgb3JcbiAgLy8gdGhlIHdvcmtzcGFjZSBjaGFuZ2VzLCBhbmQgcGVyaW9kaWNhbGx5IHdoaWxlIHRoZSBvdmVybGF5IGlzIG9wZW4uIEFcbiAgLy8gd29ya3NwYWNlIHN3aXRjaCBjbGVhcnMgc3RhbGUgY29tbWl0IHNlbGVjdGlvbiBhbmQgaGlzdG9yeSBmaXJzdC5cbiAgY29uc3Qgd29ya3NwYWNlQ3dkUmVmID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcHJldmlvdXMgPSB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudFxuICAgIHdvcmtzcGFjZUN3ZFJlZi5jdXJyZW50ID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICBpZiAodGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAocHJldmlvdXMgIT09IGFjdGl2ZUN3ZCkge1xuICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgc2V0SGlzdG9yeShbXSlcbiAgICAgIHNldENvbW1lbnRzKFtdKVxuICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgICAgIHNldFJldmlldyhudWxsKVxuICAgICAgc2V0UHIobnVsbClcbiAgICB9XG4gICAgdm9pZCBsb2FkV29ya3NwYWNlKClcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFt0YWIsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gS2VlcCBzdGFnZWQvdW5zdGFnZWQvaGlzdG9yeSBmcmVzaCB3aGlsZSB0aGUgd29ya3NwYWNlIHRhYiBpcyBvcGVuLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8IHRhYiAhPT0gJ3dvcmtzcGFjZScgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB2b2lkIGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICB9LCAxNTAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbCh0aW1lcilcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW4sIHRhYiwgYWN0aXZlQ3dkXSlcblxuICAvLyBCcmFuY2ggc2NvcGU6IGRpZmYgdGhlIHdvcmt0cmVlIGFnYWluc3QgdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAvLyBEZWZhdWx0IHRoZSBiYXNlIHRvIHRoZSBmaXJzdCBicmFuY2ggdGhhdCBpc24ndCB0aGUgY3VycmVudCBvbmUuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlICE9PSAnYnJhbmNoJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBjb25zdCBjdXJyZW50ID0gc3RhdHVzPy5icmFuY2ggPz8gbnVsbFxuICAgIGlmIChiYXNlQnJhbmNoID09PSBudWxsICYmIGJyYW5jaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZhbGxiYWNrID0gYnJhbmNoZXMuZmluZCgoYikgPT4gYiAhPT0gY3VycmVudCkgPz8gYnJhbmNoZXNbMF1cbiAgICAgIHNldEJhc2VCcmFuY2goZmFsbGJhY2spXG4gICAgfVxuICB9LCBbc2NvcGUsIGFjdGl2ZUN3ZCwgYnJhbmNoZXMsIGJhc2VCcmFuY2gsIHN0YXR1cz8uYnJhbmNoXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzY29wZSAhPT0gJ2JyYW5jaCcgfHwgIWFjdGl2ZUN3ZCB8fCAhYmFzZUJyYW5jaCkge1xuICAgICAgc2V0QmFzZVN0YXR1cyhudWxsKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZVxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1NUQVRVU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChhY3RpdmVDd2QpfSZiYXNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGJhc2VCcmFuY2gpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCkpIGFzIFN0YXR1c1Jlc3BvbnNlIHwgbnVsbFxuICAgICAgaWYgKCFjYW5jZWxsZWQgJiYgZGF0YSkge1xuICAgICAgICBzZXRCYXNlU3RhdHVzKGRhdGEpXG4gICAgICAgIGlmIChkYXRhLmVycm9yICYmIGJhc2VTdGF0dXM/LmVycm9yICE9PSBkYXRhLmVycm9yKSBzZXRFcnJvcihkYXRhLmVycm9yKVxuICAgICAgfVxuICAgIH0pKClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2FuY2VsbGVkID0gdHJ1ZVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzY29wZSwgYWN0aXZlQ3dkLCBiYXNlQnJhbmNoXSlcblxuICAvLyBEZWZhdWx0IHNlbGVjdGlvbiBmb3IgdGhlIHNlc3Npb24gdGFiIGZvbGxvd3MgdGhlIGZpcnN0IHJvdW5kIHdpdGggY2hhbmdlcy5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRSb3VuZCA9PT0gbnVsbCAmJiByb3VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZHNbMF0ucm91bmQpXG4gICAgICBzZXRTZWxlY3RlZFBhdGgocm91bmRzWzBdLmNoYW5nZXNbMF0/LnBhdGggPz8gbnVsbClcbiAgICB9XG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmRdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4pIHJldHVyblxuICAgIGNvbnN0IG9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5KVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW5dKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFub3RpY2UpIHJldHVyblxuICAgIG5vdGljZVRpbWVyLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHNldE5vdGljZShudWxsKSwgMzAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KG5vdGljZVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtub3RpY2VdKVxuXG4gIGNvbnN0IGZpbGVzID0gc3RhdHVzPy5pc1JlcG8gPyBzdGF0dXMuZmlsZXMgOiBbXVxuICBjb25zdCBzdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiBmLnN0YWdlZCksIFtmaWxlc10pXG4gIGNvbnN0IHVuc3RhZ2VkRmlsZXMgPSB1c2VNZW1vKCgpID0+IGZpbGVzLmZpbHRlcigoZikgPT4gIWYuc3RhZ2VkKSwgW2ZpbGVzXSlcblxuICAvLyBcIkxhc3QgdHVyblwiIHNjb3BlOiBwYXRocyB0aGUgYWdlbnQgdG91Y2hlZCBpbiB0aGUgbW9zdCByZWNlbnQgcm91bmQuXG4gIGNvbnN0IGxhc3RSb3VuZFBhdGhzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxzdHJpbmc+KClcbiAgICBjb25zdCBsYXN0ID0gcm91bmRzW3JvdW5kcy5sZW5ndGggLSAxXVxuICAgIGlmICghbGFzdCB8fCAhY3dkKSByZXR1cm4gc2V0XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgbGFzdC5jaGFuZ2VzKSB7XG4gICAgICBzZXQuYWRkKGNoYW5nZS5wYXRoKVxuICAgICAgY29uc3QgcCA9IGNoYW5nZS5wYXRoXG4gICAgICBpZiAoaXNBYnNQYXRoKHApKSB7XG4gICAgICAgIGNvbnN0IHJlbCA9IHAuc3RhcnRzV2l0aChjd2QpID8gcC5zbGljZShjd2QubGVuZ3RoKS5yZXBsYWNlKC9eW1xcXFwvXSsvLCAnJykgOiBwXG4gICAgICAgIHNldC5hZGQocmVsKVxuICAgICAgICBzZXQuYWRkKGJhc2VOYW1lKHApKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0LmFkZChiYXNlTmFtZShwKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNldFxuICB9LCBbcm91bmRzLCBjd2RdKVxuXG4gIC8qKiBUaGUgZmlsZSBzbGljZSB0aGUgY3VycmVudCBzY29wZSBzaG93cy4gKi9cbiAgY29uc3Qgc2NvcGVGaWxlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgIGNhc2UgJ3Vuc3RhZ2VkJzpcbiAgICAgICAgcmV0dXJuIHVuc3RhZ2VkRmlsZXNcbiAgICAgIGNhc2UgJ3N0YWdlZCc6XG4gICAgICAgIHJldHVybiBzdGFnZWRGaWxlc1xuICAgICAgY2FzZSAnYnJhbmNoJzpcbiAgICAgICAgcmV0dXJuIGJhc2VTdGF0dXM/LmZpbGVzID8/IFtdXG4gICAgICBjYXNlICdsYXN0LXR1cm4nOlxuICAgICAgICBpZiAobGFzdFJvdW5kUGF0aHMuc2l6ZSA9PT0gMCkgcmV0dXJuIFtdXG4gICAgICAgIHJldHVybiBmaWxlcy5maWx0ZXIoKGYpID0+IHtcbiAgICAgICAgICBpZiAobGFzdFJvdW5kUGF0aHMuaGFzKGYucGF0aCkgfHwgbGFzdFJvdW5kUGF0aHMuaGFzKGJhc2VOYW1lKGYucGF0aCkpKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIC8vIFNlc3Npb24gcGF0aHMgbWF5IGJlIHdvcmtzcGFjZS1yb290IHJlbGF0aXZlIG9yIGFic29sdXRlICh0aGUgcmVwbyBjYW5cbiAgICAgICAgICAvLyBiZSBhIHN1YmRpcmVjdG9yeSBvZiB0aGUgd29ya3NwYWNlKSBcdTIwMTQgbWF0Y2ggYW55IHN1ZmZpeCBmb3JtLlxuICAgICAgICAgIGNvbnN0IHN1ZmZpeCA9IGAvJHtmLnBhdGh9YFxuICAgICAgICAgIGZvciAoY29uc3QgcCBvZiBsYXN0Um91bmRQYXRocykge1xuICAgICAgICAgICAgaWYgKHAuZW5kc1dpdGgoc3VmZml4KSkgcmV0dXJuIHRydWVcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0pXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmlsZXNcbiAgICB9XG4gIH0sIFtzY29wZSwgdW5zdGFnZWRGaWxlcywgc3RhZ2VkRmlsZXMsIGJhc2VTdGF0dXMsIGZpbGVzLCBsYXN0Um91bmRQYXRoc10pXG5cbiAgLyoqIFNjb3BlcyB3aGVyZSBmaWxlL2h1bmsgYWNjZXB0XHUwMEI3cmV2ZXJ0XHUwMEI3dW5zdGFnZSBhbmQgY29tbWl0L3B1c2ggbWFrZSBzZW5zZS4gKi9cbiAgY29uc3QgYWxsb3dBY3Rpb25zID0gc2NvcGUgIT09ICdicmFuY2gnICYmIHNjb3BlICE9PSAnY29tbWl0J1xuXG4gIC8qKiBGaWxlcyB0aGUgY3VycmVudCBzY29wZSBjYW4gaGFuZCB0byB0aGUgQUkgcmV2aWV3LiAqL1xuICBjb25zdCByZXZpZXdhYmxlRmlsZXMgPSBzY29wZSA9PT0gJ2JyYW5jaCcgPyBiYXNlU3RhdHVzPy5maWxlcz8ubGVuZ3RoID8/IDAgOiBmaWxlcy5sZW5ndGhcbiAgY29uc3Qgc3RhZ2VkQ291bnQgPSBzdGFnZWRGaWxlcy5sZW5ndGhcbiAgLy8gTk9URTogaG9va3MgbXVzdCBhbGwgcnVuIGJlZm9yZSB0aGUgZWFybHkgcmV0dXJuIGJlbG93IChSZWFjdCBob29rIG9yZGVyKS5cbiAgY29uc3Qgc3RhZ2VkVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZShzdGFnZWRGaWxlcywgKGYpID0+IGYucGF0aCksIFtzdGFnZWRGaWxlc10pXG4gIGNvbnN0IHVuc3RhZ2VkVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZSh1bnN0YWdlZEZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3Vuc3RhZ2VkRmlsZXNdKVxuICBjb25zdCBzY29wZVRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc2NvcGVGaWxlcywgKGYpID0+IGYucGF0aCksIFtzY29wZUZpbGVzXSlcbiAgY29uc3QgY29tbWl0RmlsZXNUcmVlID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoY29tbWl0RGlmZj8ub2sgPyBidWlsZEZpbGVUcmVlKGNvbW1pdERpZmYuZmlsZXMsIChmKSA9PiBmLnBhdGgpIDogW10pLFxuICAgIFtjb21taXREaWZmXSxcbiAgKVxuXG4gIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8ICFjd2QpIHJldHVybiBudWxsXG5cbiAgY29uc3Qgc2VsZWN0ZWRGaWxlID0gc2NvcGVGaWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IHNlbGVjdGVkKSA/PyBudWxsXG4gIGNvbnN0IHRvdGFsQWRkZWQgPSBmaWxlcy5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLmFkZGVkLCAwKVxuICBjb25zdCB0b3RhbERlbGV0ZWQgPSBmaWxlcy5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLmRlbGV0ZWQsIDApXG5cbiAgLy8gQ29tbWl0LWRldGFpbCB2aWV3OiB0aGUgc2VsZWN0ZWQgZmlsZSB3aXRoaW4gdGhlIHNlbGVjdGVkIGNvbW1pdC5cbiAgY29uc3QgY29tbWl0U2VnbWVudHMgPSBjb21taXREaWZmPy5vayA/IHNwbGl0Q29tbWl0RGlmZihjb21taXREaWZmLmRpZmYpIDogW11cbiAgY29uc3QgY29tbWl0QWN0aXZlRmlsZSA9IHNlbGVjdGVkQ29tbWl0ICYmIGNvbW1pdERpZmY/Lm9rID8gY29tbWl0RGlmZi5maWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IHNlbGVjdGVkQ29tbWl0RmlsZSkgPz8gbnVsbCA6IG51bGxcbiAgY29uc3QgY29tbWl0QWN0aXZlVGV4dCA9IGNvbW1pdEFjdGl2ZUZpbGVcbiAgICA/IGNvbW1pdFNlZ21lbnRzLmZpbmQoKHMpID0+IHMucGF0aCA9PT0gY29tbWl0QWN0aXZlRmlsZS5wYXRoKT8udGV4dCA/PyBjb21taXREaWZmPy5kaWZmID8/ICcnXG4gICAgOiBjb21taXREaWZmPy5kaWZmID8/ICcnXG5cbiAgLyoqIExlYWYgcm93IHNoYXJlZCBieSB0aGUgc3RhZ2VkL3Vuc3RhZ2VkIGZpbGUgdHJlZXMuICovXG4gIGNvbnN0IHdvcmtzcGFjZUxlYWYgPSAoeyBpdGVtOiBmaWxlLCBuYW1lIH06IHsgaXRlbTogRGlmZkZpbGU7IG5hbWU6IHN0cmluZyB9KSA9PiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgIGFyaWEtc2VsZWN0ZWQ9e2ZpbGUucGF0aCA9PT0gc2VsZWN0ZWR9XG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2ZpbGUucGF0aCA9PT0gc2VsZWN0ZWQgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZChmaWxlLnBhdGgpXG4gICAgICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgICBzZXRDb21tZW50UG9wb3ZlcihudWxsKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWNoaXAgJHtjaGlwQ2xhc3MoZmlsZS5zdGF0dXMpfWB9PntmaWxlLnVudHJhY2tlZCA/ICc/PycgOiBmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1zdGF0XCI+XG4gICAgICAgIHtmaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogZmlsZS5hZGRlZCwgZGVsZXRlZDogZmlsZS5kZWxldGVkIH0pfVxuICAgICAgPC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG5cbiAgY29uc3QgcnVuQXBwbHkgPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoPzogc3RyaW5nKSA9PiB7XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlDaGFuZ2VzKGFjdGl2ZUN3ZCA/PyBjd2QgPz8gJycsIGFjdGlvbiwgcGF0aClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgY29uc3QgdmVyYiA9IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IGFjdGlvbiA9PT0gJ3Vuc3RhZ2UnID8gdCgncmV2aWV3LnVuc3RhZ2VkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKVxuICAgICAgICBzZXROb3RpY2Uoe1xuICAgICAgICAgIGtpbmQ6ICdvaycsXG4gICAgICAgICAgdGV4dDogcGF0aFxuICAgICAgICAgICAgPyB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiB2ZXJiLCBwYXRoIH0pXG4gICAgICAgICAgICA6IHJlc3VsdC5kZWxldGVkICYmIHJlc3VsdC5kZWxldGVkLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgPyB0KCdyZXZpZXcuZG9uZURlbGV0ZWQnLCB7IGFjdGlvbjogdmVyYiwgY291bnQ6IGZpbGVzLmxlbmd0aCwgZGVsZXRlZDogcmVzdWx0LmRlbGV0ZWQubGVuZ3RoIH0pXG4gICAgICAgICAgICAgIDogdCgncmV2aWV3LmRvbmUnLCB7IGFjdGlvbjogdmVyYiwgY291bnQ6IGZpbGVzLmxlbmd0aCB9KSxcbiAgICAgICAgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uRmlsZUFjdGlvbiA9IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg6IHN0cmluZykgPT4ge1xuICAgIGlmIChhY3Rpb24gPT09ICdyZXZlcnQnICYmIGNvbmZpcm0gIT09ICdmaWxlJykge1xuICAgICAgc2V0Q29uZmlybSgnZmlsZScpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAnZmlsZScgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uLCBwYXRoKVxuICB9XG5cbiAgY29uc3Qgb25BbGxBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnKSA9PiB7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ3JldmVydCcgJiYgY29uZmlybSAhPT0gJ2FsbCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ2FsbCcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAnYWxsJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCBydW5BcHBseShhY3Rpb24pXG4gIH1cblxuICAvKiogQXBwbHkgb25lIGh1bmsgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkgb2YgdGhlIHNlbGVjdGVkIGZpbGUuICovXG4gIGNvbnN0IG9uSHVua0FjdGlvbiA9IGFzeW5jIChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IERpZmZIdW5rKSA9PiB7XG4gICAgaWYgKCFzZWxlY3RlZEZpbGUgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcHBseUh1bmsoYWN0aXZlQ3dkID8/IGN3ZCA/PyAnJywgc2VsZWN0ZWRGaWxlLnBhdGgsIGFjdGlvbiwgaHVuay50ZXh0KVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBjb25zdCB2ZXJiID0gYWN0aW9uID09PSAnYWNjZXB0JyA/IHQoJ3Jldmlldy5hY2NlcHRlZCcpIDogYWN0aW9uID09PSAndW5zdGFnZScgPyB0KCdyZXZpZXcudW5zdGFnZWQnKSA6IHQoJ3Jldmlldy5yZXZlcnRlZCcpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5kb25lT25lJywgeyBhY3Rpb246IHZlcmIsIHBhdGg6IHNlbGVjdGVkRmlsZS5wYXRoIH0pIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIGlubGluZSBjb21tZW50cyAtLS0tXG4gIGNvbnN0IG9wZW5Db21tZW50ID0gKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuXG4gICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmUsIG5ld0xpbmUgfSlcbiAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICBzZXRDb21tZW50UG9wb3ZlcihudWxsKVxuICB9XG5cbiAgY29uc3Qgc2F2ZUNvbW1lbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFzZWxlY3RlZEZpbGUgfHwgIWNvbW1lbnRFZGl0b3IgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgdGV4dCA9IGNvbW1lbnRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCkgcmV0dXJuXG4gICAgY29uc3QgY29tbWVudDogUmV2aWV3Q29tbWVudCA9IHtcbiAgICAgIGlkOiB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8ucmFuZG9tVVVJRCA/IGNyeXB0by5yYW5kb21VVUlEKCkgOiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpfWAsXG4gICAgICBwYXRoOiBzZWxlY3RlZEZpbGUucGF0aCxcbiAgICAgIGxpbmVOZXc6IGNvbW1lbnRFZGl0b3IubmV3TGluZSxcbiAgICAgIGxpbmVPbGQ6IGNvbW1lbnRFZGl0b3Iub2xkTGluZSxcbiAgICAgIHRleHQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBuZXh0ID0gWy4uLmNvbW1lbnRzLCBjb21tZW50XVxuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ2NvbW1lbnQuc2F2ZWQnKSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBjYW5jZWxDb21tZW50ID0gKCkgPT4ge1xuICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgfVxuXG4gIGNvbnN0IGRlbGV0ZUNvbW1lbnQgPSBhc3luYyAoaWQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjLmlkICE9PSBpZClcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIEFJIHJldmlldyAoL3Jldmlldyk6IHJ1biwgcmUtcnVuLCBhbmQgaGFuZCBmaW5kaW5ncyB0byB0aGUgYWdlbnQgLS0tLVxuICBjb25zdCBvblJldmlldyA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCByZXZpZXdpbmcgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0UmV2aWV3aW5nKHRydWUpXG4gICAgc2V0UmV2aWV3KG51bGwpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldmlld1Njb3BlID0gc2NvcGUgPT09ICdicmFuY2gnID8gJ2JyYW5jaCcgOiBzY29wZSA9PT0gJ2NvbW1pdCcgJiYgc2VsZWN0ZWRDb21taXQgPyAnY29tbWl0JyA6ICd1bmNvbW1pdHRlZCdcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1blJldmlldyhhY3RpdmVDd2QsIGN1cnJlbnRJZCA/PyBudWxsLCByZXZpZXdTY29wZSwgYmFzZUJyYW5jaCA/PyB1bmRlZmluZWQsIHNlbGVjdGVkQ29tbWl0Py5oYXNoID8/IHVuZGVmaW5lZClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0UmV2aWV3KHJlc3VsdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0UmV2aWV3aW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21wb3NlIGEgXCJzZW5kIHRvIGFnZW50XCIgbWVzc2FnZSBmcm9tIGZpbmRpbmdzIG9yIFBSIGNvbW1lbnRzLiAqL1xuICBjb25zdCBjb21wb3NlRmluZGluZ3NNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0ZpbmRpbmdbXT4oKVxuICAgIGZvciAoY29uc3QgZiBvZiByZXZpZXc/LmZpbmRpbmdzID8/IFtdKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChmLmZpbGUpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGYpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoZi5maWxlLCBbZl0pXG4gICAgfVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFsnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCIEFJIFx1OEJDNFx1NUJBMVx1NTNEMVx1NzNCMFx1RkYwOEFkZHJlc3MgdGhlIHJldmlldyBmaW5kaW5nc1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsICcnXVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCByYW5nZSA9IGYubGluZVN0YXJ0ID09PSBmLmxpbmVFbmQgPyBgOiR7Zi5saW5lU3RhcnR9YCA6IGA6JHtmLmxpbmVTdGFydH0tJHtmLmxpbmVFbmR9YFxuICAgICAgICBsaW5lcy5wdXNoKGAtIFske2YucHJpb3JpdHl9XSAke3BhdGh9JHtyYW5nZX06ICR7Zi50aXRsZX0gXHUyMDE0ICR7Zi5kZXRhaWx9YClcbiAgICAgICAgaWYgKGYuc3VnZ2VzdGlvbikgbGluZXMucHVzaChgICBcXGBcXGBcXGBcXG4ke2Yuc3VnZ2VzdGlvbn1cXG4gIFxcYFxcYFxcYGApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IGNvbXBvc2VQck1lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoIXByPy5wciB8fCBwci5jb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtgXHU4QkY3XHU1OTA0XHU3NDA2IFBSICMke3ByLnByLm51bWJlcn1cdUZGMDgke3ByLnByLnRpdGxlfVx1RkYwOVx1NzY4NFx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIFBSIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBYCwgJyddXG4gICAgZm9yIChjb25zdCBjIG9mIHByLmNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBhbmNob3IgPSBjLnBhdGggPyBgJHtjLnBhdGh9JHtjLmxpbmUgPyBgOiR7Yy5saW5lfWAgOiAnJ31gIDogJ2dlbmVyYWwnXG4gICAgICBsaW5lcy5wdXNoKGAtICR7YW5jaG9yfSAoJHtjLmF1dGhvcn0pOiAke2MuYm9keX1gKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWxXaXRoID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgIHNldFNlbmRUZXh0KHRleHQpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIC8vIC0tLS0gZWRpdG9yIGludGVncmF0aW9uICh2aWEgZHNoLXBsdWdpbi1vcGVuLWVkaXRvcikgLS0tLVxuICBjb25zdCBvcGVuRmlsZSA9IGFzeW5jIChwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCBidXN5KSByZXR1cm5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvcGVuSW5FZGl0b3IoYWN0aXZlQ3dkLCBwYXRoLCBsaW5lKVxuICAgIGlmICghcmVzdWx0Lm9rKSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBgJHt0KCdlZGl0b3IuZmFpbGVkJyl9OiAke3Jlc3VsdC5lcnJvciA/PyAnJ31gIH0pXG4gIH1cblxuICAvKiogSnVtcCBmcm9tIGEgUFIgY29tbWVudCB0byB0aGUgZmlsZSAoYW5kIGhpZ2hsaWdodCB0aGUgbGluZSkuICovXG4gIGNvbnN0IG9uUHJDb21tZW50Q2xpY2sgPSAocGF0aDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCwgbGluZTogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuICAgIGlmIChwYXRoKSBqdW1wVG8ocGF0aCwgbGluZSA/PyB1bmRlZmluZWQpXG4gICAgZWxzZSBzZXRKdW1wTGluZShudWxsKVxuICB9XG5cbiAgLy8gU3VyZmFjZSB3b3Jrc3BhY2UgY29tbWVudHMgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSBkb2NrKS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBwZW5kaW5nQ29tbWVudHNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQuY3dkID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICAgIGQuY29tbWVudHMgPSBjb21tZW50c1xuICAgIH0pXG4gIH0sIFtjb21tZW50cywgYWN0aXZlQ3dkXSlcblxuICAvLyAtLS0tIGZlZWRiYWNrIGxvb3A6IGNvbW1lbnRzIFx1MjE5MiBhZ2VudCAocHJvbXB0IGluamVjdGlvbiwgY29weSBmYWxsYmFjaykgLS0tLVxuICBjb25zdCBjb21wb3NlUmV2aWV3TWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGlmIChjb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdDb21tZW50W10+KClcbiAgICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBieVBhdGguZ2V0KGMucGF0aClcbiAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goYylcbiAgICAgIGVsc2UgYnlQYXRoLnNldChjLnBhdGgsIFtjXSlcbiAgICB9XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW1xuICAgICAgJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQlx1OTQ4OFx1NUJGOVx1NUY1M1x1NTI0RFx1NURFNVx1NEY1Q1x1NTMzQVx1NzY4NFx1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMVx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsXG4gICAgICAnJyxcbiAgICBdXG4gICAgZm9yIChjb25zdCBbcGF0aCwgbGlzdF0gb2YgYnlQYXRoKSB7XG4gICAgICBsaW5lcy5wdXNoKGAjIyAke3BhdGh9YClcbiAgICAgIGZvciAoY29uc3QgYyBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IGFuY2hvciA9IGMubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjLmxpbmVOZXd9YCA6IGAgKG9sZCBsaW5lICR7Yy5saW5lT2xkfSlgXG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXRofSR7YW5jaG9yfTogJHtjLnRleHR9YClcbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpXG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgY29uc3Qgb3BlblNlbmRQYW5lbCA9ICgpID0+IHtcbiAgICBzZXRTZW5kVGV4dChjb21wb3NlUmV2aWV3TWVzc2FnZSgpKVxuICAgIHNldFNlbmRPcGVuKHRydWUpXG4gIH1cblxuICBjb25zdCBzZW5kVG9BZ2VudCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB0ZXh0ID0gc2VuZFRleHQudHJpbSgpXG4gICAgaWYgKCF0ZXh0IHx8IGJ1c3kpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGF3YWl0IGluamVjdFRvU2Vzc2lvbihzZXNzaW9ucywgY3VycmVudElkID8/IG51bGwsIHRleHQpXG4gICAgICBzZXRTZW5kT3BlbihmYWxzZSlcbiAgICAgIGlmIChvdXRjb21lID09PSAnc2VudCcpIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5zZW50VG9BZ2VudCcpIH0pXG4gICAgICBlbHNlIGlmIChvdXRjb21lID09PSAnY29waWVkJykgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmNvcGllZCcpIH0pXG4gICAgICBlbHNlIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ3Jldmlldy5jb3B5RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogQ29tbWl0IHRoZSBzdGFnZWQgY2hhbmdlcyB3aXRoIHRoZSBlbnRlcmVkIG1lc3NhZ2UuICovXG4gIGNvbnN0IG9uQ29tbWl0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBjb21taXRNZXNzYWdlLnRyaW0oKVxuICAgIGlmICghbWVzc2FnZSB8fCBidXN5IHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkdpdEFjdGlvbihhY3RpdmVDd2QsICdjb21taXQnLCBtZXNzYWdlKVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBzZXRDb21taXRNZXNzYWdlKCcnKVxuICAgICAgICBjb25zdCBzdW1tYXJ5ID0gcmVzdWx0Lmhhc2ggPyBgJHtyZXN1bHQuaGFzaH0gJHtyZXN1bHQuc3ViamVjdCA/PyAnJ31gLnRyaW0oKSA6IChyZXN1bHQuc3ViamVjdCA/PyAnJylcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmNvbW1pdHRlZCcsIHsgc3VtbWFyeSB9KSB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmNvbW1pdEZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmNvbW1pdEZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIFB1c2ggdGhlIGN1cnJlbnQgYnJhbmNoIChkb3VibGUtY2xpY2sgdG8gY29uZmlybSkuICovXG4gIGNvbnN0IG9uUHVzaCA9ICgpID0+IHtcbiAgICBpZiAoYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAoY29uZmlybSAhPT0gJ3B1c2gnKSB7XG4gICAgICBzZXRDb25maXJtKCdwdXNoJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdwdXNoJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgc2V0QnVzeSh0cnVlKVxuICAgICAgc2V0Tm90aWNlKG51bGwpXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAncHVzaCcpXG4gICAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcucHVzaGVkJykgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LnB1c2hGYWlsZWQnKSB9KVxuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LnB1c2hGYWlsZWQnKSB9KVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICAgIH1cbiAgICB9KSgpXG4gIH1cblxuICAvKiogU2VsZWN0IGEgbG9jYWwgY29tbWl0IGFuZCBsb2FkIGl0cyBkaWZmIGludG8gdGhlIHJpZ2h0IHBhbmUuICovXG4gIGNvbnN0IHNlbGVjdENvbW1pdCA9IChjb21taXQ6IENvbW1pdEluZm8pID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICBzZXRTZWxlY3RlZENvbW1pdChjb21taXQpXG4gICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICBzZXRDb21taXREaWZmTG9hZGluZyh0cnVlKVxuICAgIHZvaWQgbG9hZENvbW1pdERpZmYoYWN0aXZlQ3dkLCBjb21taXQuaGFzaClcbiAgICAgIC50aGVuKChkKSA9PiB7XG4gICAgICAgIHNldENvbW1pdERpZmYoZClcbiAgICAgICAgc2V0Q29tbWl0RGlmZkxvYWRpbmcoZmFsc2UpXG4gICAgICAgIC8vIERlZmF1bHQgdGhlIGZpbGUgdHJlZSB0byB0aGUgZmlyc3QgY2hhbmdlZCBmaWxlLlxuICAgICAgICBpZiAoZC5vayAmJiBkLmZpbGVzLmxlbmd0aCA+IDApIHNldFNlbGVjdGVkQ29tbWl0RmlsZShkLmZpbGVzWzBdLnBhdGgpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHNldENvbW1pdERpZmZMb2FkaW5nKGZhbHNlKSlcbiAgfVxuXG4gIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwiZHNkci1vdmVybGF5XCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jdXJyZW50VGFyZ2V0KSBjbG9zZSgpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1wYW5lbFwiXG4gICAgICAgIHJvbGU9XCJkaWFsb2dcIlxuICAgICAgICBhcmlhLW1vZGFsPVwidHJ1ZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfVxuICAgICAgICBzdHlsZT17eyB3aWR0aDogYCR7cHJlZnMud2lkdGh9cHhgLCBoZWlnaHQ6IGAke3ByZWZzLmhlaWdodH1weGAsIC4uLmRpZmZTdHlsZVZhcnMocHJlZnMpIH0gYXMgQ1NTUHJvcGVydGllc31cbiAgICAgID5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJlXCJcbiAgICAgICAgICBvblJlc2l6ZT17KGR4KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC53aWR0aCA9IE1hdGgubWF4KE1JTl9QQU5FTF9XLCBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCAtIDY0LCBkLndpZHRoICsgZHgpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwic1wiXG4gICAgICAgICAgb25SZXNpemU9eyhfZHgsIGR5KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5oZWlnaHQgPSBNYXRoLm1heChNSU5fUEFORUxfSCwgTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gNjQsIGQuaGVpZ2h0ICsgZHkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwic2VcIlxuICAgICAgICAgIG9uUmVzaXplPXsoZHgsIGR5KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC53aWR0aCA9IE1hdGgubWF4KE1JTl9QQU5FTF9XLCBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCAtIDY0LCBkLndpZHRoICsgZHgpKVxuICAgICAgICAgICAgICBkLmhlaWdodCA9IE1hdGgubWF4KE1JTl9QQU5FTF9ILCBNYXRoLm1pbih3aW5kb3cuaW5uZXJIZWlnaHQgLSA2NCwgZC5oZWlnaHQgKyBkeSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWhlYWRlclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdGl0bGVcIj57dCgncmV2aWV3LnRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdGFic1wiIHJvbGU9XCJ0YWJsaXN0XCIgYXJpYS1sYWJlbD17dCgncmV2aWV3LnRpdGxlJyl9PlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3RhYiA9PT0gJ3Nlc3Npb24nfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXRhYiR7dGFiID09PSAnc2Vzc2lvbicgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3Nlc3Npb24nKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3QoJ3RhYi5zZXNzaW9uJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0YWIgPT09ICd3b3Jrc3BhY2UnfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXRhYiR7dGFiID09PSAnd29ya3NwYWNlJyA/ICcgZHNkci10YWItYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFRhYignd29ya3NwYWNlJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0KCd0YWIud29ya3NwYWNlJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAge3RhYiA9PT0gJ3dvcmtzcGFjZScgJiYgc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNjb3BlXCI+XG4gICAgICAgICAgICAgIHtyZXBvcy5sZW5ndGggPiAxID8gKFxuICAgICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdyZXBvLmxhYmVsJyl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cmVwb1BhdGggPz8gYWN0aXZlQ3dkID8/ICcnfVxuICAgICAgICAgICAgICAgICAgb3B0aW9ucz17cmVwb3MubWFwKChyKSA9PiAoeyB2YWx1ZTogci5wYXRoLCBsYWJlbDogYCR7YmFzZU5hbWUoci5wYXRoKX0ke3IuYnJhbmNoID8gYCAoJHtyLmJyYW5jaH0pYCA6ICcnfWAgfSkpfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldFJlcG9QYXRoKHYpXG4gICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHNldFJldmlldyhudWxsKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdzY29wZS5sYWJlbCcpfVxuICAgICAgICAgICAgICAgIHZhbHVlPXtzY29wZX1cbiAgICAgICAgICAgICAgICBvcHRpb25zPXtTQ09QRV9PUFRJT05TLm1hcCgocykgPT4gKHsgdmFsdWU6IHMuaWQsIGxhYmVsOiB0KHMubGFiZWwpIH0pKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNldFNjb3BlKHYgYXMgV29ya3NwYWNlU2NvcGUpXG4gICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2JyYW5jaCcgPyAoXG4gICAgICAgICAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3Njb3BlLmJhc2UnKX1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtiYXNlQnJhbmNoID8/ICcnfVxuICAgICAgICAgICAgICAgICAgb3B0aW9ucz17YnJhbmNoZXMubWFwKChiKSA9PiAoeyB2YWx1ZTogYiwgbGFiZWw6IGIgfSkpfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldEJhc2VCcmFuY2h9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zdWJ0aXRsZVwiPlxuICAgICAgICAgICAge3RhYiA9PT0gJ3Nlc3Npb24nXG4gICAgICAgICAgICAgID8gdCgncmV2aWV3LnNlc3Npb25TdGF0cycsIHsgcm91bmRzOiByb3VuZHMubGVuZ3RoLCBmaWxlczogdG90YWxTZXNzaW9uRmlsZXMgfSlcbiAgICAgICAgICAgICAgOiBzdGF0dXM/LmlzUmVwb1xuICAgICAgICAgICAgICAgID8gYCR7c3RhdHVzLmJyYW5jaCA/PyB0KCdyZXZpZXcuZGV0YWNoZWQnKX0gXHUwMEI3ICR7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiB0b3RhbEFkZGVkLCBkZWxldGVkOiB0b3RhbERlbGV0ZWQgfSl9JHtzdGF0dXMuYWhlYWQgPiAwID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuYWhlYWQnLCB7IG46IHN0YXR1cy5haGVhZCB9KX1gIDogJyd9JHtzdGF0dXMuYmVoaW5kID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmJlaGluZCcsIHsgbjogc3RhdHVzLmJlaGluZCB9KX1gIDogJyd9YFxuICAgICAgICAgICAgICAgIDogdCgncmV2aWV3Lm5vdFJlcG8nKX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnICYmIGFsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCBmaWxlcy5sZW5ndGggPT09IDB9IG9uQ2xpY2s9eygpID0+IG9uQWxsQWN0aW9uKCdhY2NlcHQnKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5hY2NlcHRBbGwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIHtzdGFnZWRDb3VudCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBydW5BcHBseSgndW5zdGFnZScpfT5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcudW5zdGFnZUFsbCcpfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuIGRzZHItYnRuLWRhbmdlciR7Y29uZmlybSA9PT0gJ2FsbCcgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCBmaWxlcy5sZW5ndGggPT09IDB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25BbGxBY3Rpb24oJ3JldmVydCcpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdhbGwnID8gdCgncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnKSA6IHQoJ3Jldmlldy5yZXZlcnRBbGwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2NvbW1pdE1lc3NhZ2V9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3QoJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcicpfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldENvbW1pdE1lc3NhZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBvbktleURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykgdm9pZCBvbkNvbW1pdCgpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeSB8fCAhY29tbWl0TWVzc2FnZS50cmltKCkgfHwgc3RhZ2VkQ291bnQgPT09IDB9IG9uQ2xpY2s9eygpID0+IHZvaWQgb25Db21taXQoKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jb21taXQnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBzdGF0dXM/LmlzUmVwbyAmJiByZXZpZXdhYmxlRmlsZXMgPiAwID8gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5IHx8IHJldmlld2luZ31cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdm9pZCBvblJldmlldygpfVxuICAgICAgICAgICAgICB0aXRsZT17dCgncmV2aWV3LnJldmlld1Njb3BlJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtyZXZpZXdpbmcgPyB0KCdyZXZpZXcucmV2aWV3aW5nJykgOiB0KCdyZXZpZXcucmV2aWV3Jyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBzdGF0dXM/LmlzUmVwbyAmJiBjb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17b3BlblNlbmRQYW5lbH0+XG4gICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZFRvQWdlbnQnKX0gKHtjb21tZW50cy5sZW5ndGh9KVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcuY2xvc2UnKX0gb25DbGljaz17Y2xvc2V9PlxuICAgICAgICAgICAgPEljb25YIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtzZW5kT3BlbiA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VuZFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLXRpdGxlXCI+e3QoJ3Jldmlldy5zZW5kVGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbmQtaGludFwiPnt0KCdyZXZpZXcuc2VuZEhpbnQnKX08L3NwYW4+XG4gICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3NOYW1lPVwiZHNkci1zZW5kLWlucHV0XCIgcmVhZE9ubHkgdmFsdWU9e3NlbmRUZXh0fSBzcGVsbENoZWNrPXtmYWxzZX0gLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gc2V0U2VuZE9wZW4oZmFsc2UpfT5cbiAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWJ0blwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdm9pZCBuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQoc2VuZFRleHQpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4gc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgncmV2aWV3LmNvcHlGYWlsZWQnKSB9KSxcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jb3B5Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIXNlbmRUZXh0LnRyaW0oKX0gb25DbGljaz17KCkgPT4gdm9pZCBzZW5kVG9BZ2VudCgpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRUb0FnZW50Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnICYmIHJldmlldz8ub2sgJiYgcmV2aWV3YWJsZUZpbGVzID4gMCA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1zdHJpcFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3Jldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/ICdkc2RyLXJldmlldy1iYWQnIDogJ2RzZHItcmV2aWV3LW9rJ30+XG4gICAgICAgICAgICAgICAge3Jldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/IHQoJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JykgOiB0KCdyZXZpZXcudmVyZGljdENvcnJlY3QnKX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLXJldmlldy10b2dnbGUke2ZpbmRpbmdzT3BlbiA/ICcgZHNkci1yZXZpZXctdG9nZ2xlLW9uJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaW5kaW5nc09wZW4oKHYpID0+ICF2KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmZpbmRpbmdzJywgeyBuOiByZXZpZXcuZmluZGluZ3MubGVuZ3RoIH0pfVxuICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5ub0ZpbmRpbmdzJyl9XG4gICAgICAgICAgICAgICAgICB7cmV2aWV3LnRydW5jYXRlZCA/ICcgKHRydW5jYXRlZCknIDogJyd9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7cmV2aWV3Lm1vZGVsID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctbW9kZWxcIj57cmV2aWV3Lm1vZGVsLnByb3ZpZGVyfS97cmV2aWV3Lm1vZGVsLm1vZGVsfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICAgICAgIHtyZXZpZXcuZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvcGVuU2VuZFBhbmVsV2l0aChjb21wb3NlRmluZGluZ3NNZXNzYWdlKCkpfT5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZEZpbmRpbmdzJyl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7ZmluZGluZ3NPcGVuICYmIHJldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmluZGluZ3NcIj5cbiAgICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLm1hcCgoZmluZGluZywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBrZXk9e2Ake2ZpbmRpbmcuZmlsZX06JHtmaW5kaW5nLmxpbmVTdGFydH0tJHtmaW5kaW5nLmxpbmVFbmR9OiR7aX1gfVxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBqdW1wVG8oZmluZGluZy5maWxlLCBmaW5kaW5nLmxpbmVTdGFydCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItZmluZGluZy10YWcgZHNkci1maW5kaW5nLSR7ZmluZGluZy5wcmlvcml0eX1gfT57ZmluZGluZy5wcmlvcml0eX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZy50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1sb2NcIj57ZmluZGluZy5maWxlfTp7ZmluZGluZy5saW5lU3RhcnR9e2ZpbmRpbmcubGluZUVuZCAhPT0gZmluZGluZy5saW5lU3RhcnQgPyBgLSR7ZmluZGluZy5saW5lRW5kfWAgOiAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nLmRldGFpbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1kZXRhaWxcIj57ZmluZGluZy5kZXRhaWx9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29uZmlkZW5jZScsIHsgY29uZmlkZW5jZTogZmluZGluZy5jb25maWRlbmNlLnRvRml4ZWQoMikgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZy5zdWdnZXN0aW9uID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuc3VnZ2VzdGlvbicpfWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcuc3VnZ2VzdGlvbiA/IDxjb2RlIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1zdWdnZXN0aW9uXCI+e2ZpbmRpbmcuc3VnZ2VzdGlvbn08L2NvZGU+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJyA/IChcbiAgICAgICAgICByb3VuZHMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLnNlc3Npb24nKX0+XG4gICAgICAgICAgICAgICAge3JvdW5kcy5tYXAoKHJvdW5kKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cm91bmQucm91bmR9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnJvdW5kJywgeyByb3VuZDogcm91bmQucm91bmQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAge3JvdW5kLmxhYmVsID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kLWxhYmVsXCIgdGl0bGU9e3JvdW5kLmxhYmVsfT57cm91bmQubGFiZWx9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2Vzc2lvblRyZWVzLmdldChyb3VuZC5yb3VuZCkgPz8gW119XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogY2hhbmdlLCBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3JvdW5kLnJvdW5kfToke2NoYW5nZS5wYXRofWBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkS2V5ID0gc2VsZWN0ZWRDaGFuZ2UgPyBgJHtzZWxlY3RlZFJvdW5kfToke3NlbGVjdGVkQ2hhbmdlLnBhdGh9YCA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtrZXkgPT09IHNlbGVjdGVkS2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7a2V5ID09PSBzZWxlY3RlZEtleSA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZC5yb3VuZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUGF0aChjaGFuZ2UucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hhbmdlLmhhc0RpZmYgPyAnZHNkci1jaGlwLW0nIDogJ2RzZHItY2hpcC11J31gfT57Y2hhbmdlLmhhc0RpZmYgPyAnTScgOiAnXHUwMEI3J308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17Y2hhbmdlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIiB0aXRsZT17Y2hhbmdlLnRvb2x9PntjaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ2hhbmdlLnBhdGh9PntzZWxlY3RlZENoYW5nZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj57c2VsZWN0ZWRDaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlLmhhc0RpZmYgPyA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gKFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPT09ICdzcGxpdCcgJiYgY2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8U3BsaXREaWZmIGJsb2Nrcz17Y2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjaGFuZ2VSb3dzKHNlbGVjdGVkQ2hhbmdlKS5tYXAoKHJvdywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgICAgKSA6IGVycm9yICYmICFzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgIHtlcnJvcn1cbiAgICAgICAgICAgIDxkaXY+e3QoJ3Jldmlldy5ub3RSZXBvSGludCcpfTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJvZHlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLndvcmtzcGFjZScpfT5cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAge3N0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25TdGFnZWQnKX0gKHtzdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAge3Vuc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnKX0gKHt1bnN0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ3Vuc3RhZ2VkJyA/IChcbiAgICAgICAgICAgICAgICB1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnKX0gKHt1bnN0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17dW5zdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ3N0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2JyYW5jaCcgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgnc2NvcGUuYnJhbmNoJyl9IHtiYXNlQnJhbmNoID8gYFx1MjE5NCAke2Jhc2VCcmFuY2h9YCA6ICcnfSAoe3Njb3BlRmlsZXMubGVuZ3RofSlcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ub2RpZmZcIj57dCgnc2NvcGUuYnJhbmNoUmVhZG9ubHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzY29wZVRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj57dCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnbGFzdC10dXJuJyA/IChcbiAgICAgICAgICAgICAgICBzY29wZUZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdzY29wZS5sYXN0LXR1cm4nKX0gKHtzY29wZUZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5sYXN0VHVybkVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBoaXN0b3J5Lmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5oaXN0b3J5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGltZWxpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAge2hpc3RvcnkubWFwKChjb21taXQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2NvbW1pdC5oYXNofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10bC1pdGVtJHtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2ggPyAnIGRzZHItdGwtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGwtcmFpbFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWRvdCR7Y29tbWl0LmFoZWFkID8gJyBkc2RyLXRsLWRvdC1sb2NhbCcgOiAnIGRzZHItdGwtZG90LXJlbW90ZSd9YH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0Py5oYXNoID09PSBjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21taXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RDb21taXQoY29tbWl0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItdGwtYmFkZ2Uke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1iYWRnZS1sb2NhbCcgOiAnIGRzZHItdGwtYmFkZ2UtcmVtb3RlJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21taXQuYWhlYWQgPyB0KCdoaXN0b3J5LmxvY2FsJykgOiB0KCdoaXN0b3J5LnJlbW90ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zaG9ydFwiPntjb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LXN1YmplY3RcIiB0aXRsZT17Y29tbWl0LnN1YmplY3R9Pntjb21taXQuc3ViamVjdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtbWV0YVwiPntjb21taXQuYXV0aG9yfSBcdTAwQjcge3JlbGF0aXZlVGltZShjb21taXQuZGF0ZSwgdCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7KHNjb3BlID09PSAnYWxsJyB8fCBzY29wZSA9PT0gJ2NvbW1pdCcpICYmIHNlbGVjdGVkQ29tbWl0ICYmIGNvbW1pdERpZmY/Lm9rICYmIGNvbW1pdERpZmYuZmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LmNvbW1pdEZpbGVzJyl9ICh7Y29tbWl0RGlmZi5maWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICBub2Rlcz17Y29tbWl0RmlsZXNUcmVlfVxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXsoeyBpdGVtOiBmaWxlLCBuYW1lIH0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17c2VsZWN0ZWRDb21taXRGaWxlID09PSBmaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRoID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkQ29tbWl0RmlsZShmaWxlLnBhdGgpfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2hpcCBkc2RyLWNoaXAtbVwiPntmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdhbGwnID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkJyYW5jaCcpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1yZWZcIiB0aXRsZT17c3RhdHVzLnVwc3RyZWFtID8/IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtYXJyb3dcIj5cdTIxOTI8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy51cHN0cmVhbSA/PyB0KCdyZXZpZXcubm9VcHN0cmVhbScpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLXN0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFoZWFkXCI+e3QoJ3Jldmlldy5haGVhZCcsIHsgbjogc3RhdHVzLmFoZWFkIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYmVoaW5kID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWJlaGluZFwiPnt0KCdyZXZpZXcuYmVoaW5kJywgeyBuOiBzdGF0dXMuYmVoaW5kIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYWhlYWQgPT09IDAgJiYgc3RhdHVzLmJlaGluZCA9PT0gMCAmJiBzdGF0dXMudXBzdHJlYW0gPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zeW5jXCI+XHUyNzEzPC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuJHtjb25maXJtID09PSAncHVzaCcgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCAoc3RhdHVzPy5haGVhZCA/PyAwKSA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvblB1c2h9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7Y29uZmlybSA9PT0gJ3B1c2gnID8gdCgncmV2aWV3LmNvbmZpcm1QdXNoJykgOiBgJHt0KCdyZXZpZXcucHVzaCcpfSR7KHN0YXR1cz8uYWhlYWQgPz8gMCkgPiAwID8gYCAoJHtzdGF0dXM/LmFoZWFkID8/IDB9KWAgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3ByPy5wciA/IChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3ByLnRpdGxlJywgeyBudW1iZXI6IHByLnByLm51bWJlciB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5sZW5ndGggPiAwID8gYCBcdTAwQjcgJHt0KCdwci5jb21tZW50cycsIHsgbjogcHIuY29tbWVudHMubGVuZ3RoIH0pfWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcHJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5sZW5ndGggPT09IDAgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3ByLm5vUHInKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21tZW50LmlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItcHItaXRlbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QckNvbW1lbnRDbGljayhjb21tZW50LnBhdGgsIGNvbW1lbnQubGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXByLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50LnBhdGggPyBgJHtiYXNlTmFtZShjb21tZW50LnBhdGgpfSR7Y29tbWVudC5saW5lID8gYDoke2NvbW1lbnQubGluZX1gIDogJyd9YCA6ICdnZW5lcmFsJ30gXHUwMEI3IHtjb21tZW50LmF1dGhvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci10ZXh0XCI+e2NvbW1lbnQuYm9keX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb3BlblNlbmRQYW5lbFdpdGgoY29tcG9zZVByTWVzc2FnZSgpKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3ByLnNlbmRDb21tZW50cycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmZcIj5cbiAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0ID8gKFxuICAgICAgICAgICAgICAgIGNvbW1pdERpZmZMb2FkaW5nID8gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3LmJ1c3knKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApIDogY29tbWl0RGlmZj8ub2sgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRDb21taXQuc3ViamVjdH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQuc3ViamVjdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1oYXNoXCI+e3NlbGVjdGVkQ29tbWl0LnNob3J0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQuYXV0aG9yfSBcdTAwQjcge3JlbGF0aXZlVGltZShzZWxlY3RlZENvbW1pdC5kYXRlLCB0KX1cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBjb21taXREaWZmLmFkZGVkLCBkZWxldGVkOiBjb21taXREaWZmLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtjb21taXRBY3RpdmVGaWxlID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21taXQtZmlsZS1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtjb21taXRBY3RpdmVGaWxlLnBhdGh9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNoaXAgZHNkci1jaGlwLW1cIj57Y29tbWl0RmlsZVN0YXR1cyhjb21taXRTZWdtZW50cy5maW5kKChzKSA9PiBzLnBhdGggPT09IGNvbW1pdEFjdGl2ZUZpbGUucGF0aCk/LnRleHQgPz8gJycpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtZmlsZS1wYXRoXCI+e2NvbW1pdEFjdGl2ZUZpbGUucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogY29tbWl0QWN0aXZlRmlsZS5hZGRlZCwgZGVsZXRlZDogY29tbWl0QWN0aXZlRmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge3ZpZXcgPT09ICdzcGxpdCcgJiYgZ2l0U3BsaXRCbG9ja3MoY29tbWl0QWN0aXZlVGV4dCkubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8U3BsaXREaWZmIGJsb2Nrcz17Z2l0U3BsaXRCbG9ja3MoY29tbWl0QWN0aXZlVGV4dCl9IGJlZm9yZUxhYmVsPXt0KCd2aWV3LmJlZm9yZScpfSBhZnRlckxhYmVsPXt0KCd2aWV3LmFmdGVyJyl9IC8+XG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtnaXREaWZmUm93cyhjb21taXRBY3RpdmVUZXh0KS5tYXAoKHJvdywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntjb21taXREaWZmPy5lcnJvciA/PyB0KCdyZXZpZXcubm9EaWZmRGF0YScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IHNlbGVjdGVkRmlsZSA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZEZpbGUucGF0aH0+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUub3JpZ1BhdGggPyBgIFx1MjE5MCAke3NlbGVjdGVkRmlsZS5vcmlnUGF0aH1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5iaW5hcnkgPyB0KCdyZXZpZXcuYmluYXJ5JykgOiB0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IHNlbGVjdGVkRmlsZS5hZGRlZCwgZGVsZXRlZDogc2VsZWN0ZWRGaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkRmlsZS5wYXRoKX0gdGl0bGU9e3QoJ2VkaXRvci5vcGVuRmlsZScpfT5cbiAgICAgICAgICAgICAgICAgICAgICBcdTIxOTcge3QoJ2VkaXRvci5vcGVuRmlsZScpfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyAmJiBzZWxlY3RlZEZpbGUudW5zdGFnZWQgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ2FjY2VwdCcsIHNlbGVjdGVkRmlsZS5wYXRoKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmFjY2VwdCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyAmJiBzZWxlY3RlZEZpbGUuc3RhZ2VkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbigndW5zdGFnZScsIHNlbGVjdGVkRmlsZS5wYXRoKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnVuc3RhZ2UnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXIke2NvbmZpcm0gPT09ICdmaWxlJyA/ICcgZHNkci1idG4tY29uZmlybScgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3JldmVydCcsIHNlbGVjdGVkRmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y29uZmlybSA9PT0gJ2ZpbGUnID8gdCgncmV2aWV3LmNvbmZpcm1SZXZlcnQnKSA6IHQoJ3Jldmlldy5yZXZlcnQnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmICFzZWxlY3RlZEZpbGUuYmluYXJ5ICYmIGdpdFNwbGl0QmxvY2tzKHNlbGVjdGVkRmlsZS5kaWZmKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmJlZm9yZScpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmFmdGVyJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge2dpdFNwbGl0QmxvY2tzKHNlbGVjdGVkRmlsZS5kaWZmKS5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IDxIdW5rVG9vbGJhciBodW5rPXtzZWxlY3RlZEZpbGUuaHVua3NbYmldfSBidXN5PXtidXN5fSBvbkFjdGlvbj17b25IdW5rQWN0aW9ufSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dGaW5kaW5ncyA9IChyZXZpZXc/LmZpbmRpbmdzID8/IFtdKS5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYuZmlsZSA9PT0gc2VsZWN0ZWRGaWxlLnBhdGggJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocm93LnJpZ2h0TnVtICE9PSBudWxsID8gcm93LnJpZ2h0TnVtID49IGYubGluZVN0YXJ0ICYmIHJvdy5yaWdodE51bSA8PSBmLmxpbmVFbmQgOiByb3cubGVmdE51bSAhPT0gbnVsbCAmJiByb3cubGVmdE51bSA+PSBmLmxpbmVTdGFydCAmJiByb3cubGVmdE51bSA8PSBmLmxpbmVFbmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ0NscyA9IHJvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgPyBgIGRzZHItY2VsbC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganVtcGVkID0ganVtcExpbmUgIT0gbnVsbCAmJiAocm93LnJpZ2h0TnVtID09PSBqdW1wTGluZSB8fCAocm93LnJpZ2h0TnVtID09PSBudWxsICYmIHJvdy5sZWZ0TnVtID09PSBqdW1wTGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IGFuY2hvcnMgc3RheSBjb25zaXN0ZW50IHdpdGggdGhlIHVuaWZpZWQgdmlldzogY3R4IHJvd3MgZXhwb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3RoIGxpbmUgbnVtYmVycywgY2hhbmdlIHJvd3MgZXhwb3NlIHRoZSBzaWRlIHRoZXkgYmVsb25nIHRvLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEFuY2hvciA9IHsgb2xkTGluZTogcm93LmxlZnROdW0sIG5ld0xpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cubGVmdE51bSAhPT0gbnVsbCA/IHJvdy5sZWZ0TnVtIDogbnVsbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEFuY2hvciA9IHsgb2xkTGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA6IG51bGwsIG5ld0xpbmU6IHJvdy5yaWdodE51bSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0S2V5ID0gYCR7bGVmdEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtsZWZ0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0S2V5ID0gYCR7cmlnaHRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7cmlnaHRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBsZWZ0QW5jaG9yLm9sZExpbmUsIGxlZnRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCByaWdodEFuY2hvci5vbGRMaW5lLCByaWdodEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wZW5CdG4gPSAobGluZTogbnVtYmVyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEZpbGUucGF0aCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW9wZW5saW5lXCIgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCwgbGluZSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tZW50QnRuID0gKGFuY2hvcjogeyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0sIGNvdW50OiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e2NvdW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW49e2NvbW1lbnRQb3BvdmVyID09PSBgJHthbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7YW5jaG9yLm5ld0xpbmUgPz8gJ24nfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZTogYW5jaG9yLm9sZExpbmUsIG5ld0xpbmU6IGFuY2hvci5uZXdMaW5lIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbW1lbnRQb3BvdmVyKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0Q29tbWVudFBvcG92ZXIoKHByZXYpID0+IChwcmV2ID09PSBgJHthbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7YW5jaG9yLm5ld0xpbmUgPz8gJ24nfWAgPyBudWxsIDogYCR7YW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2FuY2hvci5uZXdMaW5lID8/ICduJ31gKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e3JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5sZWZ0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1kZWwnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWNlbGwtanVtcCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LmxlZnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5sZWZ0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dGaW5kaW5ncy5sZW5ndGggPiAwICYmIHJvdy5yaWdodE51bSA9PT0gbnVsbCA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gfT57cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKGxlZnRBbmNob3IsIGxlZnRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cucmlnaHROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9Pntyb3dGaW5kaW5nc1swXS5wcmlvcml0eX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsZWZ0Q29tbWVudHMubGVuZ3RoID4gMCAmJiBjb21tZW50UG9wb3ZlciA9PT0gbGVmdEtleSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXBvcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjb21tZW50LmlkfSBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtdGV4dFwiPntjb21tZW50LnRleHR9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjb21tZW50LnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGNvbW1lbnQuaWQpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5sZW5ndGggPiAwICYmIGNvbW1lbnRQb3BvdmVyID09PSByaWdodEtleSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXBvcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17Y29tbWVudC5pZH0gY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXRleHRcIj57Y29tbWVudC50ZXh0fTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Y29tbWVudC5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tZGFuZ2VyXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgZGVsZXRlQ29tbWVudChjb21tZW50LmlkKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuZGVsZXRlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgKGxlZnRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gIHx8IHJpZ2h0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPFVuaWZpZWREaWZmXG4gICAgICAgICAgICAgICAgICAgICAgZGlmZj17c2VsZWN0ZWRGaWxlLmRpZmZ9XG4gICAgICAgICAgICAgICAgICAgICAgaHVua3M9e3NlbGVjdGVkRmlsZS5odW5rc31cbiAgICAgICAgICAgICAgICAgICAgICBidXN5PXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgIG9uSHVua0FjdGlvbj17b25IdW5rQWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudHM9e2NvbW1lbnRzfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRFZGl0b3I9e2NvbW1lbnRFZGl0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFRleHQ9e2NvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tbWVudFRleHQ9e3NldENvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uT3BlbkNvbW1lbnQ9e29wZW5Db21tZW50fVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZUNvbW1lbnQ9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbENvbW1lbnQ9e2NhbmNlbENvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFBvcG92ZXI9e2NvbW1lbnRQb3BvdmVyfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlUG9wb3Zlcj17KGtleSkgPT4gc2V0Q29tbWVudFBvcG92ZXIoKHByZXYpID0+IChwcmV2ID09PSBrZXkgPyBudWxsIDoga2V5KSl9XG4gICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDb21tZW50PXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9XG4gICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk9eyFhbGxvd0FjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgcGF0aD17c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgcmV2aWV3RmluZGluZ3M9e3Jldmlldz8uZmluZGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuTGluZT17KHAsIGxpbmUpID0+IHZvaWQgb3BlbkZpbGUocCwgbGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAganVtcExpbmU9e2p1bXBMaW5lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntzY29wZSA9PT0gJ2NvbW1pdCcgPyB0KCdyZXZpZXcuc2VsZWN0Q29tbWl0JykgOiB0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yID8/IHQoJ3Jldmlldy5sb2FkRXJyb3InKX1cbiAgICAgICAgICAgIHshc3RhdHVzPy5pc1JlcG8gPyA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mb290XCI+XG4gICAgICAgICAgeyhsb2FkaW5nIHx8IGJ1c3kpICYmIHRhYiA9PT0gJ3dvcmtzcGFjZScgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwaW5uZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2J1c3kgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLW5vdGljZVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIHtub3RpY2UgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLW5vdGljZSBkc2RyLW5vdGljZS0ke25vdGljZS5raW5kfWB9Pntub3RpY2UudGV4dH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQ29uZmlnIGNhcmQgZm9yIHRoZSBQbHVnaW5zIGNvbmZpZ3VyYXRpb24gdGFiIChTZXR0aW5ncyBcdTIxOTIgUGx1Z2lucyBcdTIxOTIgXHU1M0VGXHU5MTREXHU3RjZFKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb25maWdDYXJkKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJkIGRzZHItY2ZnLWNhcmQtb3BlbicgOiAnZHNkci1jZmctY2FyZCd9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZFwiIGFyaWEtZXhwYW5kZWQ9e29wZW59IG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWhlYWQtdGV4dFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLW5hbWVcIj57dCgnc2V0dGluZ3MudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctZGVzY1wiPnt0KCdjb25maWcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93bk91dGxpbmUxNCBjbGFzc05hbWU9e29wZW4gPyAnZHNkci1jZmctY2FyZXQgZHNkci1jZmctY2FyZXQtb3BlbicgOiAnZHNkci1jZmctY2FyZXQnfSAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1ib2R5XCI+XG4gICAgICAgICAgPERpZmZSZXZpZXdQcmVmcyB0PXt0fSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbGk+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG4gIC8vIENvZGV4LXN0eWxlIHBlbmRpbmctY29tbWVudHMgYmFyIGFib3ZlIHRoZSBjb21wb3Nlci5cbiAgY3R4LnNsb3RzLmluamVjdCgnY29udmVyc2F0aW9uLmlucHV0LmRvY2snLCAoKSA9PlxuICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1jb21tZW50cy1kb2NrJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgICAgaW5qZWN0OiAoKSA9PiAoeyBzZXNzaW9uczogY3R4LnNlc3Npb25zIH0pLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdDb21wb3NlckRvY2ssXG4gICAgKSxcbiAgKVxuICAvLyBUaGUgcGx1Z2luJ3Mgb3duIHNldHRpbmdzIHRhYiBpbnNpZGUgXHU4QkJFXHU3RjZFIFx1MjE5MiBcdTYzRDJcdTRFRjYgKG5vdCB0aGUgR2VuZXJhbCBzZWN0aW9uKS5cbiAgLy8gVGhlIHBsdWdpbidzIHdob2xlIGNvbmZpZ3VyYXRpb24gbGl2ZXMgaW4gb25lIGNhcmQgaW5zaWRlXG4gIC8vIFx1OEJCRVx1N0Y2RSBcdTIxOTIgXHU2M0QyXHU0RUY2IFx1MjE5MiBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkUgKHNldHRpbmdzLnBsdWdpbi5pdGVtKTogZm9udC9zaXplLlxuICBjdHguc2xvdHMuaW5qZWN0KCdzZXR0aW5ncy5wbHVnaW4uaXRlbScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2V0dGluZ3MucGx1Z2luLml0ZW0nLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3LWNvbmZpZycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICB9LFxuICAgICAgRGlmZlJldmlld0NvbmZpZ0NhcmQsXG4gICAgKSxcbiAgKVxufVxuIiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmYge1xuICAgIGRpZmYob2xkU3RyLCBuZXdTdHIsIFxuICAgIC8vIFR5cGUgYmVsb3cgaXMgbm90IGFjY3VyYXRlL2NvbXBsZXRlIC0gc2VlIGFib3ZlIGZvciBmdWxsIHBvc3NpYmlsaXRpZXMgLSBidXQgaXQgY29tcGlsZXNcbiAgICBvcHRpb25zID0ge30pIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrO1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgnY2FsbGJhY2snIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaztcbiAgICAgICAgfVxuICAgICAgICAvLyBBbGxvdyBzdWJjbGFzc2VzIHRvIG1hc3NhZ2UgdGhlIGlucHV0IHByaW9yIHRvIHJ1bm5pbmdcbiAgICAgICAgY29uc3Qgb2xkU3RyaW5nID0gdGhpcy5jYXN0SW5wdXQob2xkU3RyLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgbmV3U3RyaW5nID0gdGhpcy5jYXN0SW5wdXQobmV3U3RyLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3Qgb2xkVG9rZW5zID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG9sZFN0cmluZywgb3B0aW9ucykpO1xuICAgICAgICBjb25zdCBuZXdUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUobmV3U3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spO1xuICAgIH1cbiAgICBkaWZmV2l0aE9wdGlvbnNPYmoob2xkVG9rZW5zLCBuZXdUb2tlbnMsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgZG9uZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnBvc3RQcm9jZXNzKHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBjYWxsYmFjayh2YWx1ZSk7IH0sIDApO1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IG5ld1Rva2Vucy5sZW5ndGgsIG9sZExlbiA9IG9sZFRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCBlZGl0TGVuZ3RoID0gMTtcbiAgICAgICAgbGV0IG1heEVkaXRMZW5ndGggPSBuZXdMZW4gKyBvbGRMZW47XG4gICAgICAgIGlmIChvcHRpb25zLm1heEVkaXRMZW5ndGggIT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4RWRpdExlbmd0aCA9IE1hdGgubWluKG1heEVkaXRMZW5ndGgsIG9wdGlvbnMubWF4RWRpdExlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4RXhlY3V0aW9uVGltZSA9IChfYSA9IG9wdGlvbnMudGltZW91dCkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogSW5maW5pdHk7XG4gICAgICAgIGNvbnN0IGFib3J0QWZ0ZXJUaW1lc3RhbXAgPSBEYXRlLm5vdygpICsgbWF4RXhlY3V0aW9uVGltZTtcbiAgICAgICAgY29uc3QgYmVzdFBhdGggPSBbeyBvbGRQb3M6IC0xLCBsYXN0Q29tcG9uZW50OiB1bmRlZmluZWQgfV07XG4gICAgICAgIC8vIFNlZWQgZWRpdExlbmd0aCA9IDAsIGkuZS4gdGhlIGNvbnRlbnQgc3RhcnRzIHdpdGggdGhlIHNhbWUgdmFsdWVzXG4gICAgICAgIGxldCBuZXdQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmVzdFBhdGhbMF0sIG5ld1Rva2Vucywgb2xkVG9rZW5zLCAwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKGJlc3RQYXRoWzBdLm9sZFBvcyArIDEgPj0gb2xkTGVuICYmIG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAvLyBJZGVudGl0eSBwZXIgdGhlIGVxdWFsaXR5IGFuZCB0b2tlbml6ZXJcbiAgICAgICAgICAgIHJldHVybiBkb25lKHRoaXMuYnVpbGRWYWx1ZXMoYmVzdFBhdGhbMF0ubGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmNlIHdlIGhpdCB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgZWRpdCBncmFwaCBvbiBzb21lIGRpYWdvbmFsIGssIHdlIGNhblxuICAgICAgICAvLyBkZWZpbml0ZWx5IHJlYWNoIHRoZSBlbmQgb2YgdGhlIGVkaXQgZ3JhcGggaW4gbm8gbW9yZSB0aGFuIGsgZWRpdHMsIHNvXG4gICAgICAgIC8vIHRoZXJlJ3Mgbm8gcG9pbnQgaW4gY29uc2lkZXJpbmcgYW55IG1vdmVzIHRvIGRpYWdvbmFsIGsrMSBhbnkgbW9yZSAoZnJvbVxuICAgICAgICAvLyB3aGljaCB3ZSdyZSBndWFyYW50ZWVkIHRvIG5lZWQgYXQgbGVhc3QgaysxIG1vcmUgZWRpdHMpLlxuICAgICAgICAvLyBTaW1pbGFybHksIG9uY2Ugd2UndmUgcmVhY2hlZCB0aGUgYm90dG9tIG9mIHRoZSBlZGl0IGdyYXBoLCB0aGVyZSdzIG5vXG4gICAgICAgIC8vIHBvaW50IGNvbnNpZGVyaW5nIG1vdmVzIHRvIGxvd2VyIGRpYWdvbmFscy5cbiAgICAgICAgLy8gV2UgcmVjb3JkIHRoaXMgZmFjdCBieSBzZXR0aW5nIG1pbkRpYWdvbmFsVG9Db25zaWRlciBhbmRcbiAgICAgICAgLy8gbWF4RGlhZ29uYWxUb0NvbnNpZGVyIHRvIHNvbWUgZmluaXRlIHZhbHVlIG9uY2Ugd2UndmUgaGl0IHRoZSBlZGdlIG9mXG4gICAgICAgIC8vIHRoZSBlZGl0IGdyYXBoLlxuICAgICAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBpcyBub3QgZmFpdGhmdWwgdG8gdGhlIG9yaWdpbmFsIGFsZ29yaXRobSBwcmVzZW50ZWQgaW5cbiAgICAgICAgLy8gTXllcnMncyBwYXBlciwgd2hpY2ggaW5zdGVhZCBwb2ludGxlc3NseSBleHRlbmRzIEQtcGF0aHMgb2ZmIHRoZSBlbmQgb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGggLSBzZWUgcGFnZSA3IG9mIE15ZXJzJ3MgcGFwZXIgd2hpY2ggbm90ZXMgdGhpcyBwb2ludFxuICAgICAgICAvLyBleHBsaWNpdGx5IGFuZCBpbGx1c3RyYXRlcyBpdCB3aXRoIGEgZGlhZ3JhbS4gVGhpcyBoYXMgbWFqb3IgcGVyZm9ybWFuY2VcbiAgICAgICAgLy8gaW1wbGljYXRpb25zIGZvciBzb21lIGNvbW1vbiBzY2VuYXJpb3MuIEZvciBpbnN0YW5jZSwgdG8gY29tcHV0ZSBhIGRpZmZcbiAgICAgICAgLy8gd2hlcmUgdGhlIG5ldyB0ZXh0IHNpbXBseSBhcHBlbmRzIGQgY2hhcmFjdGVycyBvbiB0aGUgZW5kIG9mIHRoZVxuICAgICAgICAvLyBvcmlnaW5hbCB0ZXh0IG9mIGxlbmd0aCBuLCB0aGUgdHJ1ZSBNeWVycyBhbGdvcml0aG0gd2lsbCB0YWtlIE8obitkXjIpXG4gICAgICAgIC8vIHRpbWUgd2hpbGUgdGhpcyBvcHRpbWl6YXRpb24gbmVlZHMgb25seSBPKG4rZCkgdGltZS5cbiAgICAgICAgbGV0IG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IC1JbmZpbml0eSwgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gSW5maW5pdHk7XG4gICAgICAgIC8vIE1haW4gd29ya2VyIG1ldGhvZC4gY2hlY2tzIGFsbCBwZXJtdXRhdGlvbnMgb2YgYSBnaXZlbiBlZGl0IGxlbmd0aCBmb3IgYWNjZXB0YW5jZS5cbiAgICAgICAgY29uc3QgZXhlY0VkaXRMZW5ndGggPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBkaWFnb25hbFBhdGggPSBNYXRoLm1heChtaW5EaWFnb25hbFRvQ29uc2lkZXIsIC1lZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoIDw9IE1hdGgubWluKG1heERpYWdvbmFsVG9Db25zaWRlciwgZWRpdExlbmd0aCk7IGRpYWdvbmFsUGF0aCArPSAyKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2VQYXRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZVBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSwgYWRkUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG9uZSBlbHNlIGlzIGdvaW5nIHRvIGF0dGVtcHQgdG8gdXNlIHRoaXMgdmFsdWUsIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwZXJmIG9wdGltaXNhdGlvbi4gVGhpcyB0eXBlLXZpb2xhdGluZyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY2FuQWRkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGFkZFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hhdCBuZXdQb3Mgd2lsbCBiZSBhZnRlciB3ZSBkbyBhbiBpbnNlcnRpb246XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZFBhdGhOZXdQb3MgPSBhZGRQYXRoLm9sZFBvcyAtIGRpYWdvbmFsUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgY2FuQWRkID0gYWRkUGF0aCAmJiAwIDw9IGFkZFBhdGhOZXdQb3MgJiYgYWRkUGF0aE5ld1BvcyA8IG5ld0xlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuUmVtb3ZlID0gcmVtb3ZlUGF0aCAmJiByZW1vdmVQYXRoLm9sZFBvcyArIDEgPCBvbGRMZW47XG4gICAgICAgICAgICAgICAgaWYgKCFjYW5BZGQgJiYgIWNhblJlbW92ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIHBhdGggaXMgYSB0ZXJtaW5hbCB0aGVuIHBydW5lXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwZXJmIG9wdGltaXNhdGlvbi4gVGhpcyB0eXBlLXZpb2xhdGluZyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgdGhlIGRpYWdvbmFsIHRoYXQgd2Ugd2FudCB0byBicmFuY2ggZnJvbS4gV2Ugc2VsZWN0IHRoZSBwcmlvclxuICAgICAgICAgICAgICAgIC8vIHBhdGggd2hvc2UgcG9zaXRpb24gaW4gdGhlIG9sZCBzdHJpbmcgaXMgdGhlIGZhcnRoZXN0IGZyb20gdGhlIG9yaWdpblxuICAgICAgICAgICAgICAgIC8vIGFuZCBkb2VzIG5vdCBwYXNzIHRoZSBib3VuZHMgb2YgdGhlIGRpZmYgZ3JhcGhcbiAgICAgICAgICAgICAgICBpZiAoIWNhblJlbW92ZSB8fCAoY2FuQWRkICYmIHJlbW92ZVBhdGgub2xkUG9zIDwgYWRkUGF0aC5vbGRQb3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gdGhpcy5hZGRUb1BhdGgoYWRkUGF0aCwgdHJ1ZSwgZmFsc2UsIDAsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChyZW1vdmVQYXRoLCBmYWxzZSwgdHJ1ZSwgMSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIGRpYWdvbmFsUGF0aCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm9sZFBvcyArIDEgPj0gb2xkTGVuICYmIG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgaGl0IHRoZSBlbmQgb2YgYm90aCBzdHJpbmdzLCB0aGVuIHdlIGFyZSBkb25lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb25lKHRoaXMuYnVpbGRWYWx1ZXMoYmFzZVBhdGgubGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpKSB8fCB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IGJhc2VQYXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heERpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWluKG1heERpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5EaWFnb25hbFRvQ29uc2lkZXIgPSBNYXRoLm1heChtaW5EaWFnb25hbFRvQ29uc2lkZXIsIGRpYWdvbmFsUGF0aCArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWRpdExlbmd0aCsrO1xuICAgICAgICB9O1xuICAgICAgICAvLyBQZXJmb3JtcyB0aGUgbGVuZ3RoIG9mIGVkaXQgaXRlcmF0aW9uLiBJcyBhIGJpdCBmdWdseSBhcyB0aGlzIGhhcyB0byBzdXBwb3J0IHRoZVxuICAgICAgICAvLyBzeW5jIGFuZCBhc3luYyBtb2RlIHdoaWNoIGlzIG5ldmVyIGZ1bi4gTG9vcHMgb3ZlciBleGVjRWRpdExlbmd0aCB1bnRpbCBhIHZhbHVlXG4gICAgICAgIC8vIGlzIHByb2R1Y2VkLCBvciB1bnRpbCB0aGUgZWRpdCBsZW5ndGggZXhjZWVkcyBvcHRpb25zLm1heEVkaXRMZW5ndGggKGlmIGdpdmVuKSxcbiAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSBpdCB3aWxsIHJldHVybiB1bmRlZmluZWQuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlZGl0TGVuZ3RoID4gbWF4RWRpdExlbmd0aCB8fCBEYXRlLm5vdygpID4gYWJvcnRBZnRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFleGVjRWRpdExlbmd0aCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoZWRpdExlbmd0aCA8PSBtYXhFZGl0TGVuZ3RoICYmIERhdGUubm93KCkgPD0gYWJvcnRBZnRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldCA9IGV4ZWNFZGl0TGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRUb1BhdGgocGF0aCwgYWRkZWQsIHJlbW92ZWQsIG9sZFBvc0luYywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBsYXN0ID0gcGF0aC5sYXN0Q29tcG9uZW50O1xuICAgICAgICBpZiAobGFzdCAmJiAhb3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbiAmJiBsYXN0LmFkZGVkID09PSBhZGRlZCAmJiBsYXN0LnJlbW92ZWQgPT09IHJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb2xkUG9zOiBwYXRoLm9sZFBvcyArIG9sZFBvc0luYyxcbiAgICAgICAgICAgICAgICBsYXN0Q29tcG9uZW50OiB7IGNvdW50OiBsYXN0LmNvdW50ICsgMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdC5wcmV2aW91c0NvbXBvbmVudCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCwgcHJldmlvdXNDb21wb25lbnQ6IGxhc3QgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IG5ld1Rva2Vucy5sZW5ndGgsIG9sZExlbiA9IG9sZFRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCBvbGRQb3MgPSBiYXNlUGF0aC5vbGRQb3MsIG5ld1BvcyA9IG9sZFBvcyAtIGRpYWdvbmFsUGF0aCwgY29tbW9uQ291bnQgPSAwO1xuICAgICAgICB3aGlsZSAobmV3UG9zICsgMSA8IG5ld0xlbiAmJiBvbGRQb3MgKyAxIDwgb2xkTGVuICYmIHRoaXMuZXF1YWxzKG9sZFRva2Vuc1tvbGRQb3MgKyAxXSwgbmV3VG9rZW5zW25ld1BvcyArIDFdLCBvcHRpb25zKSkge1xuICAgICAgICAgICAgbmV3UG9zKys7XG4gICAgICAgICAgICBvbGRQb3MrKztcbiAgICAgICAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbikge1xuICAgICAgICAgICAgICAgIGJhc2VQYXRoLmxhc3RDb21wb25lbnQgPSB7IGNvdW50OiAxLCBwcmV2aW91c0NvbXBvbmVudDogYmFzZVBhdGgubGFzdENvbXBvbmVudCwgYWRkZWQ6IGZhbHNlLCByZW1vdmVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tb25Db3VudCAmJiAhb3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbikge1xuICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IGNvbW1vbkNvdW50LCBwcmV2aW91c0NvbXBvbmVudDogYmFzZVBhdGgubGFzdENvbXBvbmVudCwgYWRkZWQ6IGZhbHNlLCByZW1vdmVkOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGJhc2VQYXRoLm9sZFBvcyA9IG9sZFBvcztcbiAgICAgICAgcmV0dXJuIG5ld1BvcztcbiAgICB9XG4gICAgZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNvbXBhcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNvbXBhcmF0b3IobGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0XG4gICAgICAgICAgICAgICAgfHwgKCEhb3B0aW9ucy5pZ25vcmVDYXNlICYmIGxlZnQudG9Mb3dlckNhc2UoKSA9PT0gcmlnaHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRW1wdHkoYXJyYXkpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXSkge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgY2FzdElucHV0KHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIHRva2VuaXplKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHZhbHVlKTtcbiAgICB9XG4gICAgam9pbihjaGFycykge1xuICAgICAgICAvLyBBc3N1bWVzIFZhbHVlVCBpcyBzdHJpbmcsIHdoaWNoIGlzIHRoZSBjYXNlIGZvciBtb3N0IHN1YmNsYXNzZXMuXG4gICAgICAgIC8vIFdoZW4gaXQncyBmYWxzZSwgZS5nLiBpbiBkaWZmQXJyYXlzLCB0aGlzIG1ldGhvZCBuZWVkcyB0byBiZSBvdmVycmlkZGVuIChlLmcuIHdpdGggYSBuby1vcClcbiAgICAgICAgLy8gWWVzLCB0aGUgY2FzdHMgYXJlIHZlcmJvc2UgYW5kIHVnbHksIGJlY2F1c2UgdGhpcyBwYXR0ZXJuIC0gb2YgaGF2aW5nIHRoZSBiYXNlIGNsYXNzIFNPUlQgT0ZcbiAgICAgICAgLy8gYXNzdW1lIHRva2VucyBhbmQgdmFsdWVzIGFyZSBzdHJpbmdzLCBidXQgbm90IGNvbXBsZXRlbHkgLSBpcyB3ZWlyZCBhbmQgamFua3kuXG4gICAgICAgIHJldHVybiBjaGFycy5qb2luKCcnKTtcbiAgICB9XG4gICAgcG9zdFByb2Nlc3MoY2hhbmdlT2JqZWN0cywgXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGNoYW5nZU9iamVjdHM7XG4gICAgfVxuICAgIGdldCB1c2VMb25nZXN0VG9rZW4oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYnVpbGRWYWx1ZXMobGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpIHtcbiAgICAgICAgLy8gRmlyc3Qgd2UgY29udmVydCBvdXIgbGlua2VkIGxpc3Qgb2YgY29tcG9uZW50cyBpbiByZXZlcnNlIG9yZGVyIHRvIGFuXG4gICAgICAgIC8vIGFycmF5IGluIHRoZSByaWdodCBvcmRlcjpcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IFtdO1xuICAgICAgICBsZXQgbmV4dENvbXBvbmVudDtcbiAgICAgICAgd2hpbGUgKGxhc3RDb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChsYXN0Q29tcG9uZW50KTtcbiAgICAgICAgICAgIG5leHRDb21wb25lbnQgPSBsYXN0Q29tcG9uZW50LnByZXZpb3VzQ29tcG9uZW50O1xuICAgICAgICAgICAgZGVsZXRlIGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBsYXN0Q29tcG9uZW50ID0gbmV4dENvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnRzLnJldmVyc2UoKTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50TGVuID0gY29tcG9uZW50cy5sZW5ndGg7XG4gICAgICAgIGxldCBjb21wb25lbnRQb3MgPSAwLCBuZXdQb3MgPSAwLCBvbGRQb3MgPSAwO1xuICAgICAgICBmb3IgKDsgY29tcG9uZW50UG9zIDwgY29tcG9uZW50TGVuOyBjb21wb25lbnRQb3MrKykge1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50c1tjb21wb25lbnRQb3NdO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkICYmIHRoaXMudXNlTG9uZ2VzdFRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IG5ld1Rva2Vucy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvbGRUb2tlbnNbb2xkUG9zICsgaV07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xkVmFsdWUubGVuZ3RoID4gdmFsdWUubGVuZ3RoID8gb2xkVmFsdWUgOiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4obmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1BvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgLy8gQ29tbW9uIGNhc2VcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCkge1xuICAgICAgICAgICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihvbGRUb2tlbnMuc2xpY2Uob2xkUG9zLCBvbGRQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgRGlmZiBmcm9tICcuL2Jhc2UuanMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVPcHRpb25zIH0gZnJvbSAnLi4vdXRpbC9wYXJhbXMuanMnO1xuY2xhc3MgTGluZURpZmYgZXh0ZW5kcyBEaWZmIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy50b2tlbml6ZSA9IHRva2VuaXplO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgaWdub3Jpbmcgd2hpdGVzcGFjZSwgd2UgbmVlZCB0byBub3JtYWxpc2UgbGluZXMgYnkgc3RyaXBwaW5nXG4gICAgICAgIC8vIHdoaXRlc3BhY2UgYmVmb3JlIGNoZWNraW5nIGVxdWFsaXR5LiAoVGhpcyBoYXMgYW4gYW5ub3lpbmcgaW50ZXJhY3Rpb25cbiAgICAgICAgLy8gd2l0aCBuZXdsaW5lSXNUb2tlbiB0aGF0IHJlcXVpcmVzIHNwZWNpYWwgaGFuZGxpbmc6IGlmIG5ld2xpbmVzIGdldCB0aGVpclxuICAgICAgICAvLyBvd24gdG9rZW4sIHRoZW4gd2UgRE9OJ1Qgd2FudCB0byB0cmltIHRoZSAqbmV3bGluZSogdG9rZW5zIGRvd24gdG8gZW1wdHlcbiAgICAgICAgLy8gc3RyaW5ncywgc2luY2UgdGhpcyB3b3VsZCBjYXVzZSB1cyB0byB0cmVhdCB3aGl0ZXNwYWNlLW9ubHkgbGluZSBjb250ZW50XG4gICAgICAgIC8vIGFzIGVxdWFsIHRvIGEgc2VwYXJhdG9yIGJldHdlZW4gbGluZXMsIHdoaWNoIHdvdWxkIGJlIHdlaXJkIGFuZFxuICAgICAgICAvLyBpbmNvbnNpc3RlbnQgd2l0aCB0aGUgZG9jdW1lbnRlZCBiZWhhdmlvciBvZiB0aGUgb3B0aW9ucy4pXG4gICAgICAgIGlmIChvcHRpb25zLmlnbm9yZVdoaXRlc3BhY2UpIHtcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhbGVmdC5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubmV3bGluZUlzVG9rZW4gfHwgIXJpZ2h0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuaWdub3JlTmV3bGluZUF0RW9mICYmICFvcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICAgICAgICBpZiAobGVmdC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmlnaHQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLmVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucyk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGxpbmVEaWZmID0gbmV3IExpbmVEaWZmKCk7XG5leHBvcnQgZnVuY3Rpb24gZGlmZkxpbmVzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZUcmltbWVkTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gZ2VuZXJhdGVPcHRpb25zKG9wdGlvbnMsIHsgaWdub3JlV2hpdGVzcGFjZTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG4vLyBFeHBvcnRlZCBzdGFuZGFsb25lIHNvIGl0IGNhbiBiZSB1c2VkIGZyb20ganNvbkRpZmYgdG9vLlxuZXhwb3J0IGZ1bmN0aW9uIHRva2VuaXplKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuc3RyaXBUcmFpbGluZ0NyKSB7XG4gICAgICAgIC8vIHJlbW92ZSBvbmUgXFxyIGJlZm9yZSBcXG4gdG8gbWF0Y2ggR05VIGRpZmYncyAtLXN0cmlwLXRyYWlsaW5nLWNyIGJlaGF2aW9yXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKTtcbiAgICB9XG4gICAgY29uc3QgcmV0TGluZXMgPSBbXSwgbGluZXNBbmROZXdsaW5lcyA9IHZhbHVlLnNwbGl0KC8oXFxufFxcclxcbikvKTtcbiAgICAvLyBJZ25vcmUgdGhlIGZpbmFsIGVtcHR5IHRva2VuIHRoYXQgb2NjdXJzIGlmIHRoZSBzdHJpbmcgZW5kcyB3aXRoIGEgbmV3IGxpbmVcbiAgICBpZiAoIWxpbmVzQW5kTmV3bGluZXNbbGluZXNBbmROZXdsaW5lcy5sZW5ndGggLSAxXSkge1xuICAgICAgICBsaW5lc0FuZE5ld2xpbmVzLnBvcCgpO1xuICAgIH1cbiAgICAvLyBNZXJnZSB0aGUgY29udGVudCBhbmQgbGluZSBzZXBhcmF0b3JzIGludG8gc2luZ2xlIHRva2Vuc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXNBbmROZXdsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBsaW5lID0gbGluZXNBbmROZXdsaW5lc1tpXTtcbiAgICAgICAgaWYgKGkgJSAyICYmICFvcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICAgICAgICByZXRMaW5lc1tyZXRMaW5lcy5sZW5ndGggLSAxXSArPSBsaW5lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0TGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0TGluZXM7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtQkEsbUJBQXFGOzs7QUNuQnJGLElBQXFCLE9BQXJCLE1BQTBCO0FBQUEsRUFDdEIsS0FBSyxRQUFRLFFBRWIsVUFBVSxDQUFDLEdBQUc7QUFD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QUFDNUQsTUFBSSxDQUFDLE9BQU8sV0FBVyxPQUFPLE1BQU0sV0FBVyxFQUFHLFFBQU8sQ0FBQztBQUMxRCxTQUFPLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxPQUFPO0FBQUEsSUFDcEMsTUFBTSxPQUFPLE1BQU0sU0FBUyxJQUFJLFdBQVcsSUFBSSxDQUFDLElBQUksT0FBTyxNQUFNLE1BQU0sUUFBUTtBQUFBLElBQy9FLE1BQU0sZ0JBQWdCLEtBQUssU0FBUyxLQUFLLE9BQU8sRUFBRSxDQUFDLEVBQUU7QUFBQSxFQUN2RCxFQUFFO0FBQ0o7QUFNQSxJQUFNLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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bEIsWUFBWTtBQUFBLEVBQ1osZ0JBQWdCO0FBQUEsRUFDaEIsY0FBYztBQUFBLEVBQ2QsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsZUFBZTtBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsb0JBQW9CO0FBQUEsRUFDcEIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsdUJBQXVCO0FBQUEsRUFDdkIsZ0JBQWdCO0FBQUEsRUFDaEIsa0JBQWtCO0FBQUEsRUFDbEIsa0JBQWtCO0FBQUEsRUFDbEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsbUJBQW1CO0FBQUEsRUFDbkIsd0JBQXdCO0FBQUEsRUFDeEIsY0FBYztBQUFBLEVBQ2Qsd0JBQXdCO0FBQUEsRUFDeEIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsbUJBQW1CO0FBQUEsRUFDbkIsc0JBQXNCO0FBQUEsRUFDdEIsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsaUJBQWlCO0FBQUEsRUFDakIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIseUJBQXlCO0FBQUEsRUFDekIsMkJBQTJCO0FBQUEsRUFDM0IscUJBQXFCO0FBQUEsRUFDckIsbUJB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

		})(module, module.exports, require);
		return module.exports;
	}
});
