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
  key: 0,
  focus: null
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
.dsdr-comment-has{visibility:visible;background:color-mix(in srgb, var(--dsw-alias-button-info-fill) 16%, transparent);color:var(--dsw-alias-button-info-fill);border-color:transparent;font-variant-numeric:tabular-nums}
.dsdr-line-commented{box-shadow:inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-button-info-fill) 70%, transparent)}
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
.dsdr-dock{display:flex;flex-direction:column;gap:4px;margin:8px 12px 0;padding:8px 12px;background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:var(--dsw-shadow-lv3);font-size:12px;line-height:18px}
.dsdr-dock-head{display:flex;align-items:center;gap:8px;min-height:24px}
.dsdr-dock-icon{display:inline-flex;color:var(--dsw-alias-button-info-fill)}
.dsdr-dock-count{font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary)}
.dsdr-dock-hint{color:var(--dsw-alias-label-tertiary);font-size:11px}
.dsdr-dock-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0}
.dsdr-dock-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-dock-list{display:flex;flex-direction:column;gap:2px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:4px;margin-top:2px;max-height:248px;overflow-y:auto}
.dsdr-dock-item{display:flex;flex-direction:column;gap:2px;text-align:left;border:0;background:transparent;border-radius:7px;padding:5px 8px;cursor:pointer;font:inherit}
.dsdr-dock-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-dock-loc{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-dock-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere}
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
  "review.dockJump": "\u70B9\u51FB\u5728\u8BC4\u5BA1\u9762\u677F\u4E2D\u6253\u5F00\u5BF9\u5E94\u53D8\u66F4",
  "review.dockHint": "\u53D1\u9001\u6D88\u606F\u65F6\u81EA\u52A8\u9644\u5E26",
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
  "review.dockJump": "Open the matching change in the review panel",
  "review.dockHint": "Auto-carried with your next message",
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
function IconComment() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) });
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: `dsdr-line dsdr-line-${row.kind}${rowComments.length > 0 ? " dsdr-line-commented" : ""}${findingCls}${jumped ? " dsdr-line-jump" : ""}`,
              "data-dsdr-line": newLine ?? oldLine ?? void 0,
              children: [
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
              ]
            }
          ),
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
function DiffReviewComposerDock({ sessionId, useSessions, sessions, input, t }) {
  const cwd = useSessions((s) => s.byId[sessionId]?.cwd);
  const pending = (0, import_react.useSyncExternalStore)(pendingCommentsStore.subscribe, pendingCommentsStore.getSnapshot);
  const [hover, setHover] = (0, import_react.useState)(false);
  const [dismissed, setDismissed] = (0, import_react.useState)(false);
  const carriedIds = (0, import_react.useRef)(null);
  const carrying = (0, import_react.useRef)(false);
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
  (0, import_react.useEffect)(() => {
    if (comments.length === 0) {
      setDismissed(false);
      carriedIds.current = null;
    }
  }, [comments.length]);
  const phase = input?.phase;
  (0, import_react.useEffect)(() => {
    if (comments.length === 0 || carrying.current || carriedIds.current === ids) return;
    if (phase !== "submitting" && phase !== "adjudicating") return;
    carrying.current = true;
    const targetIds = ids;
    const lines = ["\u8BF7\u5904\u7406\u4EE5\u4E0B\u9488\u5BF9\u5F53\u524D\u5DE5\u4F5C\u533A\u7684\u884C\u5185\u8BC4\u5BA1\u8BC4\u8BBA\uFF08Address the inline comments\uFF0C\u4FDD\u6301\u6539\u52A8\u8303\u56F4\u6700\u5C0F\uFF09\uFF1A", ""];
    for (const c of comments) {
      const anchor = c.lineNew !== null ? `:${c.lineNew}` : ` (old line ${c.lineOld})`;
      lines.push(`- ${c.path}${anchor}: ${c.text}`);
    }
    void injectToSession(sessions, sessionId, lines.join("\n")).then((outcome) => {
      if (outcome !== "failed") carriedIds.current = targetIds;
      carrying.current = false;
    });
  }, [phase, ids]);
  if (!cwd || comments.length === 0 || dismissed) return null;
  const focusComment = (comment) => {
    overlayStore.update((d) => {
      d.open = true;
      d.cwd = cwd;
      d.focus = { path: comment.path, line: comment.lineNew ?? comment.lineOld ?? void 0 };
      d.key = d.key + 1;
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-dock", onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-dock-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComment, {}) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-count", children: t("review.dockComments", { n: comments.length }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-hint", children: t("review.dockHint") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-dock-close", "aria-label": t("comment.cancel"), onClick: () => setDismissed(true), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconX, {}) })
    ] }),
    hover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-dock-list", children: comments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: "dsdr-dock-item",
        title: t("review.dockJump"),
        onClick: () => focusComment(comment),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-dock-loc", children: [
            comment.path,
            comment.lineNew !== null ? `:${comment.lineNew}` : ""
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-text", children: comment.text })
        ]
      },
      comment.id
    )) }) : null
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
    pendingCommentsStore.update((d) => {
      d.cwd = activeCwd ?? null;
      d.comments = comments;
    });
  }, [comments, activeCwd]);
  (0, import_react.useEffect)(() => {
    const focus = storeState.focus;
    if (!storeState.open || !cwd || !focus) return;
    setTab("workspace");
    setSelected(focus.path);
    setJumpLine(focus.line ?? null);
    const scrollTimer = setTimeout(() => {
      if (focus.line != null) {
        document.querySelector(`[data-dsdr-line="${focus.line}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }, 80);
    const clearTimer = setTimeout(() => setJumpLine(null), 2500);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [storeState.key]);
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
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                            "div",
                            {
                              className: `dsdr-split-cell ${row.leftNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-del" : ""}${findingCls}${jumped ? " dsdr-cell-jump" : ""}`,
                              "data-dsdr-line": row.leftNum ?? void 0,
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", children: row.leftNum ?? "" }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.left }),
                                row.leftNum !== null ? openBtn(row.leftNum) : null,
                                rowFindings.length > 0 && row.rightNum === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`, children: rowFindings[0].priority }) : null,
                                commentBtn(leftAnchor, leftComments.length)
                              ]
                            }
                          ),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                            "div",
                            {
                              className: `dsdr-split-cell ${row.rightNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-add" : ""}${findingCls}${jumped ? " dsdr-cell-jump" : ""}`,
                              "data-dsdr-line": row.rightNum ?? void 0,
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", children: row.rightNum ?? "" }),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.right }),
                                row.rightNum !== null ? openBtn(row.rightNum) : null,
                                rowFindings.length > 0 && row.rightNum !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`, children: rowFindings[0].priority }) : null,
                                commentBtn(rightAnchor, rightComments.length)
                              ]
                            }
                          )
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERpZmYtcmV2aWV3IHBsdWdpbiBcdTIwMTQgY2xpZW50IGhhbGYuXG4gKlxuICogQ29kZXgtc3R5bGUgcmV2aWV3IHdpdGggdHdvIHNvdXJjZXM6XG4gKlxuICogMS4gKipcdTRGMUFcdThCRERcdTY2RjRcdTY1MzkgKFNlc3Npb24gY2hhbmdlcykqKiBcdTIwMTQgd2hhdCB0aGUgYWdlbnQgY2hhbmdlZCBpbiBlYWNoIHJvdW5kIG9mXG4gKiAgICB0aGlzIGNvbnZlcnNhdGlvbiwgZGVyaXZlZCBmcm9tIHRoZSBjb252ZXJzYXRpb24gc25hcHNob3QgKHRvb2wgcmVzdWx0c1xuICogICAgY2FycnkgdGhlIGhvc3QtY29tcHV0ZWQgYHJlc3VsdFZpZXdgIGRpZmYgaHVua3MpLiBXb3JrcyB3aXRoIG9yIHdpdGhvdXRcbiAqICAgIGdpdCwgYW5kIHNob3dzIGEgY2hhbmdlIGV2ZW4gd2hlbiBubyBkaWZmIHRleHQgaXMgYXZhaWxhYmxlIChwYXRoLW9ubHkpLlxuICogMi4gKipcdTVERTVcdTRGNUNcdTUzM0EgKFdvcmtzcGFjZSkqKiBcdTIwMTQgdGhlIGdpdCB3b3JraW5nIHRyZWUncyB1bmNvbW1pdHRlZCBjaGFuZ2VzXG4gKiAgICAoc3RhZ2VkICsgdW5zdGFnZWQgKyB1bnRyYWNrZWQpIHdpdGggcGVyLWZpbGUgLyBhbGwtZmlsZSBhY2NlcHQgKHN0YWdlKVxuICogICAgYW5kIHJldmVydCAoZGlzY2FyZCkgdGhyb3VnaCB0aGUgcGx1Z2luJ3Mgc2VydmVyIHJvdXRlcy5cbiAqXG4gKiBUaGUgcmV2aWV3IHN1cmZhY2UgbW91bnRzIGluIGBzaGVsbC5vdmVybGF5YCAocm9vdCBzY29wZSkuIFN0YXRlIGhhbmQtb2ZmXG4gKiBiZXR3ZWVuIHRoZSBzZXNzaW9uLXNjb3BlZCBoZWFkZXIgdHJpZ2dlciBhbmQgdGhlIHJvb3Qtc2NvcGVkIG92ZXJsYXkgZ29lc1xuICogdGhyb3VnaCBhIG1vZHVsZS1sZXZlbCBzbmFwc2hvdCBzdG9yZTsgdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCBmb3IgdGhlXG4gKiBjdXJyZW50IHNlc3Npb24gaXMgcmVhZCByZWFjdGl2ZWx5IHRocm91Z2ggYGN0eC5zZXNzaW9uc2AgKGluamVjdGVkIHZpYSB0aGVcbiAqIG92ZXJsYXkgcmVnaXN0cmF0aW9uJ3MgaW5qZWN0IGZhY2UpLlxuICovXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUsIHVzZVN5bmNFeHRlcm5hbFN0b3JlLCBGcmFnbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDU1NQcm9wZXJ0aWVzLCBSZWFjdEVsZW1lbnQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgZGlmZkxpbmVzIH0gZnJvbSAnZGlmZidcbmltcG9ydCB0eXBlIHsgQ2xpZW50Q29udGV4dCwgSVNlc3Npb25zLCBTZXNzaW9uTGlzdFN0YXRlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgeyBjcmVhdGVTbmFwc2hvdFN0b3JlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFByb3BzTG9jYWxlLCBQcm9wc1J1bnRpbWUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1zbG90cydcbmltcG9ydCB0eXBlIHsgQ29udmVyc2F0aW9uTm9kZSwgVG9vbFJlc3VsdE5vZGUsIFVzZXJNZXNzYWdlTm9kZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXJ1bnRpbWUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBTZXNzaW9uSWQsIFRvb2xSZXN1bHRWaWV3IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hcGktcmVtb3Rlcy9jbGllbnQnXG5pbXBvcnQgeyBJY29uQ2hldnJvbkRvd25PdXRsaW5lMTQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEdpdFJlc3BvbnNlLCBIaXN0b3J5UmVzcG9uc2UsIFByUmVzcG9uc2UsIFJlcG9zUmVzcG9uc2UsIFJldmlld0NvbW1lbnQsIFJldmlld0ZpbmRpbmcsIFJldmlld1Jlc3BvbnNlLCBTdGF0dXNSZXNwb25zZSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcy50cydcblxuZXhwb3J0IGNvbnN0IG5hbWUgPSAnZGlmZi1yZXZpZXcnXG5cbi8qKiBSZXF1aXJlZCBjbGllbnQgc2VydmljZXMgKGZpYmVyIGluamVjdCkuICovXG5leHBvcnQgY29uc3QgaW5qZWN0ID0gWydzZXNzaW9ucycsICdzbG90cycsICdsb2NhbGUnXVxuXG5jb25zdCBMT0NBTEVfTlMgPSAnZGlmZi1yZXZpZXcnXG5jb25zdCBTVEFUVVNfVVJMID0gJ2RpZmYtcmV2aWV3L3N0YXR1cydcbmNvbnN0IEFQUExZX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseSdcbmNvbnN0IEFQUExZX0hVTktfVVJMID0gJ2RpZmYtcmV2aWV3L2FwcGx5LWh1bmsnXG5jb25zdCBDT01NSVRfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdCdcbmNvbnN0IFBVU0hfVVJMID0gJ2RpZmYtcmV2aWV3L3B1c2gnXG5jb25zdCBISVNUT1JZX1VSTCA9ICdkaWZmLXJldmlldy9oaXN0b3J5J1xuY29uc3QgQ09NTUlUX0RJRkZfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdC1kaWZmJ1xuY29uc3QgQ09NTUVOVFNfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1lbnRzJ1xuY29uc3QgQlJBTkNIRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2JyYW5jaGVzJ1xuY29uc3QgUkVWSUVXX1VSTCA9ICdkaWZmLXJldmlldy9yZXZpZXcnXG5jb25zdCBQUl9VUkwgPSAnZGlmZi1yZXZpZXcvcHInXG5jb25zdCBSRVBPU19VUkwgPSAnZGlmZi1yZXZpZXcvcmVwb3MnXG5jb25zdCBPUEVOX0VESVRPUl9VUkwgPSAnb3Blbi1lZGl0b3Ivb3BlbidcbmNvbnN0IFNUWUxFX1RBRyA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3L3Jldmlldy5jc3MnXG5cbi8qKiBPcGVuIHN0YXRlIHNoYXJlZCBiZXR3ZWVuIHRoZSBoZWFkZXIgdHJpZ2dlciAoc2Vzc2lvbiBzY29wZSkgYW5kIHRoZSBvdmVybGF5IChyb290IHNjb3BlKS4gKi9cbmNvbnN0IG92ZXJsYXlTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8eyBvcGVuOiBib29sZWFuOyBjd2Q6IHN0cmluZyB8IG51bGw7IGtleTogbnVtYmVyOyBmb2N1cz86IHsgcGF0aDogc3RyaW5nOyBsaW5lPzogbnVtYmVyIH0gfCBudWxsIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxuICBmb2N1czogbnVsbCxcbn0pXG5cbi8qKlxuICogUGVuZGluZyBpbmxpbmUgY29tbWVudHMgc3VyZmFjZWQgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSkuIFRoZVxuICogcmV2aWV3IG92ZXJsYXkgc3luY3MgaXRzIHdvcmtzcGFjZSBjb21tZW50cyBoZXJlOyB0aGUgY29tcG9zZXIgZG9jayByZWFkc1xuICogdGhlbSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbidzIHdvcmtzcGFjZS5cbiAqL1xuY29uc3QgcGVuZGluZ0NvbW1lbnRzU3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPHsgY3dkOiBzdHJpbmcgfCBudWxsOyBjb21tZW50czogUmV2aWV3Q29tbWVudFtdIH0+KHtcbiAgY3dkOiBudWxsLFxuICBjb21tZW50czogW10sXG59KVxuXG4vKiogSW5qZWN0IHRleHQgaW50byBhIHNlc3Npb24gYXMgYSB1c2VyIG1lc3NhZ2U7IGZhbGxzIGJhY2sgdG8gdGhlIGNsaXBib2FyZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluamVjdFRvU2Vzc2lvbihzZXNzaW9uczogSVNlc3Npb25zIHwgdW5kZWZpbmVkLCBzZXNzaW9uSWQ6IFNlc3Npb25JZCB8IG51bGwsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8J3NlbnQnIHwgJ2NvcGllZCcgfCAnZmFpbGVkJz4ge1xuICBjb25zdCBiaW5kaW5nID0gc2Vzc2lvbklkID8gc2Vzc2lvbnM/LmJpbmRpbmcoc2Vzc2lvbklkKSA6IHVuZGVmaW5lZFxuICBjb25zdCBzZXNzaW9uID0gYmluZGluZz8uc2Vzc2lvblxuICBpZiAoc2Vzc2lvbikge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXNzaW9uLnByb21wdChbeyB0eXBlOiAndGV4dCcsIHRleHQgfV0sICdxdWV1ZScpXG4gICAgICBpZiAocmVzdWx0Lm9rKSByZXR1cm4gJ3NlbnQnXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGNvcHkgZmFsbGJhY2tcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICAgIHJldHVybiAnY29waWVkJ1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJ2ZhaWxlZCdcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJldmlldyBwcmVmZXJlbmNlcyAoZm9udCAvIHNpemUgLyBwYW5lbCBnZW9tZXRyeSksIHNoYXJlZCBieSB0aGUgb3ZlcmxheVxuLy8gYW5kIHRoZSBTZXR0aW5ncyBcdTIxOTIgR2VuZXJhbCByb3cuIFBlcnNpc3RlZCB0byBsb2NhbFN0b3JhZ2UgYnkgdGhlIHN0b3JlLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBQYW5lbCBnZW9tZXRyeSBib3VuZHMuICovXG5leHBvcnQgY29uc3QgTUlOX1BBTkVMX1cgPSA2NDBcbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfSCA9IDQwMFxuXG5pbnRlcmZhY2UgUHJlZnMge1xuICAvKiogRm9udCBvcHRpb24gaWQgKHNlZSBGT05UX09QVElPTlMpLiAqL1xuICBmb250OiBzdHJpbmdcbiAgLyoqIERpZmYgdGV4dCBzaXplIGluIHB4LiAqL1xuICBzaXplOiBudW1iZXJcbiAgLyoqIFBhbmVsIHdpZHRoIGluIHB4LiAqL1xuICB3aWR0aDogbnVtYmVyXG4gIC8qKiBQYW5lbCBoZWlnaHQgaW4gcHguICovXG4gIGhlaWdodDogbnVtYmVyXG59XG5cbmNvbnN0IEZPTlRfT1BUSU9OUzogeyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBjc3M6IHN0cmluZyB9W10gPSBbXG4gIHsgaWQ6ICdtb25vJywgbGFiZWw6ICdmb250Lm1vbm8nLCBjc3M6ICd2YXIoLS1kc3ctZm9udC1tb25vKScgfSxcbiAgeyBpZDogJ3N5c3RlbScsIGxhYmVsOiAnZm9udC5zeXN0ZW0nLCBjc3M6ICdzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYnIH0sXG4gIHsgaWQ6ICdjb25zb2xhcycsIGxhYmVsOiAnQ29uc29sYXMnLCBjc3M6ICdDb25zb2xhcywgXCJDb3VyaWVyIE5ld1wiLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdqZXRicmFpbnMnLCBsYWJlbDogJ0pldEJyYWlucyBNb25vJywgY3NzOiAnXCJKZXRCcmFpbnMgTW9ub1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnZmlyYScsIGxhYmVsOiAnRmlyYSBDb2RlJywgY3NzOiAnXCJGaXJhIENvZGVcIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ3NvdXJjZScsIGxhYmVsOiAnU291cmNlIENvZGUgUHJvJywgY3NzOiAnXCJTb3VyY2UgQ29kZSBQcm9cIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbl1cblxuY29uc3QgU0laRV9PUFRJT05TID0gWzExLCAxMiwgMTMsIDE0LCAxNiwgMThdXG5cbi8qKiBSZXZpZXcgc2NvcGVzIG9mIHRoZSB3b3Jrc3BhY2UgdGFiIChhbGlnbmVkIHdpdGggdGhlIENvZGV4IHJldmlldyBwYW5lKS4gKi9cbnR5cGUgV29ya3NwYWNlU2NvcGUgPSAnYWxsJyB8ICd1bnN0YWdlZCcgfCAnc3RhZ2VkJyB8ICdjb21taXQnIHwgJ2JyYW5jaCcgfCAnbGFzdC10dXJuJ1xuXG5jb25zdCBTQ09QRV9PUFRJT05TOiB7IGlkOiBXb3Jrc3BhY2VTY29wZTsgbGFiZWw6IGtleW9mIHR5cGVvZiB6aCB9W10gPSBbXG4gIHsgaWQ6ICdhbGwnLCBsYWJlbDogJ3Njb3BlLmFsbCcgfSxcbiAgeyBpZDogJ3Vuc3RhZ2VkJywgbGFiZWw6ICdzY29wZS51bnN0YWdlZCcgfSxcbiAgeyBpZDogJ3N0YWdlZCcsIGxhYmVsOiAnc2NvcGUuc3RhZ2VkJyB9LFxuICB7IGlkOiAnY29tbWl0JywgbGFiZWw6ICdzY29wZS5jb21taXQnIH0sXG4gIHsgaWQ6ICdicmFuY2gnLCBsYWJlbDogJ3Njb3BlLmJyYW5jaCcgfSxcbiAgeyBpZDogJ2xhc3QtdHVybicsIGxhYmVsOiAnc2NvcGUubGFzdC10dXJuJyB9LFxuXVxuXG4vKiogQnJvd3Nlci1zaWRlIGFic29sdXRlIHBhdGggY2hlY2sgKG5vIG5vZGU6cGF0aCBpbiB0aGUgY2xpZW50IGJ1bmRsZSkuICovXG5mdW5jdGlvbiBpc0Fic1BhdGgocDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocClcbn1cblxuZnVuY3Rpb24gYmFzZU5hbWUocDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHAuc3BsaXQoL1tcXFxcL10vKS5wb3AoKSA/PyBwXG59XG5cbmNvbnN0IHByZWZzU3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPFByZWZzPihcbiAgeyBmb250OiAnbW9ubycsIHNpemU6IDEyLCB3aWR0aDogMTEyMCwgaGVpZ2h0OiA3MjAgfSxcbiAgeyBwZXJzaXN0OiB7IG5hbWU6ICdkc2RyLXByZWZzJyB9IH0sXG4pXG5cbi8qKiBDU1MgZm9udC1mYW1pbHkgZm9yIGEgc3RvcmVkIGZvbnQgb3B0aW9uIGlkLiAqL1xuZnVuY3Rpb24gZm9udENzcyhpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIEZPTlRfT1BUSU9OUy5maW5kKChmKSA9PiBmLmlkID09PSBpZCk/LmNzcyA/PyBGT05UX09QVElPTlNbMF0uY3NzXG59XG5cbi8qKiBQYW5lbCBDU1MgdmFyaWFibGVzIGNhcnJ5aW5nIHRoZSBmb250L3NpemUgcHJlZmVyZW5jZS4gKi9cbmZ1bmN0aW9uIGRpZmZTdHlsZVZhcnMocHJlZnM6IFByZWZzKTogQ1NTUHJvcGVydGllcyB7XG4gIHJldHVybiB7XG4gICAgJy0tZHNkci1kaWZmLWZvbnQnOiBmb250Q3NzKHByZWZzLmZvbnQpLFxuICAgICctLWRzZHItZGlmZi1zaXplJzogYCR7cHJlZnMuc2l6ZX1weGAsXG4gIH0gYXMgQ1NTUHJvcGVydGllc1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlc3Npb24tY2hhbmdlcyBleHRyYWN0aW9uIChjbGllbnQtc2lkZSwgd29ya3Mgd2l0aG91dCBnaXQpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYmVmb3JlL2FmdGVyIHNsaWNlIG9mIGEgY2hhbmdlIChhIGh1bmspLiAqL1xuaW50ZXJmYWNlIEh1bmsge1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogT25lIGZpbGUgY2hhbmdlZCBpbnNpZGUgb25lIHJvdW5kLiAqL1xuaW50ZXJmYWNlIFJvdW5kQ2hhbmdlIHtcbiAgcGF0aDogc3RyaW5nXG4gIHRvb2w6IHN0cmluZ1xuICBodW5rczogSHVua1tdXG4gIC8qKiBGYWxzZSB3aGVuIG9ubHkgdGhlIHBhdGggaXMga25vd24gKG5vIGRpZmYgZGF0YSBwZXJzaXN0ZWQpLiAqL1xuICBoYXNEaWZmOiBib29sZWFuXG59XG5cbi8qKiBPbmUgdXNlciByb3VuZCBhbmQgdGhlIGZpbGVzIGl0IGNoYW5nZWQuICovXG5pbnRlcmZhY2UgU2Vzc2lvblJvdW5kIHtcbiAgcm91bmQ6IG51bWJlclxuICBsYWJlbDogc3RyaW5nXG4gIGNoYW5nZXM6IFJvdW5kQ2hhbmdlW11cbn1cblxuaW50ZXJmYWNlIEZpbGVEaWZmTGlrZSB7XG4gIHBhdGg6IHN0cmluZ1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogVmFsaWRhdGUgYSByYXcgRmlsZURpZmYtc2hhcGVkIHZhbHVlICh0aGUgdG9vbHMnIGB7cGF0aCwgb2xkVGV4dCwgbmV3VGV4dH1gIGNvbnRyYWN0KS4gKi9cbmZ1bmN0aW9uIGFzRmlsZURpZmYocmF3OiB1bmtub3duKTogRmlsZURpZmZMaWtlIHwgbnVsbCB7XG4gIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBjb25zdCByZWMgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgaWYgKHR5cGVvZiByZWMucGF0aCAhPT0gJ3N0cmluZycgfHwgIXJlYy5wYXRoKSByZXR1cm4gbnVsbFxuICBpZiAodHlwZW9mIHJlYy5uZXdUZXh0ICE9PSAnc3RyaW5nJykgcmV0dXJuIG51bGxcbiAgY29uc3Qgb2xkVGV4dCA9IHJlYy5vbGRUZXh0XG4gIHJldHVybiB7IHBhdGg6IHJlYy5wYXRoLCBvbGRUZXh0OiB0eXBlb2Ygb2xkVGV4dCA9PT0gJ3N0cmluZycgPyBvbGRUZXh0IDogbnVsbCwgbmV3VGV4dDogcmVjLm5ld1RleHQgfVxufVxuXG4vKiogRGlmZiBodW5rcyBjYXJyaWVkIGJ5IGEgY29tcGxldGVkIHRvb2wgcmVzdWx0IChgcmVzdWx0Vmlldy5jYXJkID09PSAnZGlmZidgKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbVJlc3VsdFZpZXcocmVzdWx0VmlldzogVG9vbFJlc3VsdFZpZXcgfCBudWxsKTogRmlsZURpZmZMaWtlW10ge1xuICBpZiAoIXJlc3VsdFZpZXcgfHwgcmVzdWx0Vmlldy5jYXJkICE9PSAnZGlmZicgfHwgIUFycmF5LmlzQXJyYXkocmVzdWx0Vmlldy5kaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gcmVzdWx0Vmlldy5kaWZmcy5tYXAoYXNGaWxlRGlmZikuZmlsdGVyKChkKTogZCBpcyBGaWxlRGlmZkxpa2UgPT4gZCAhPT0gbnVsbClcbn1cblxuLyoqIFJhdyBgbWV0YS5kaWZmc2AgZmFsbGJhY2sgKHRoZSBwZXJzaXN0ZWQgdG9vbC9yZXN1bHQgbWV0YSkuICovXG5mdW5jdGlvbiBkaWZmc0Zyb21NZXRhKG1ldGE6IHVua25vd24pOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghbWV0YSB8fCB0eXBlb2YgbWV0YSAhPT0gJ29iamVjdCcpIHJldHVybiBbXVxuICBjb25zdCBkaWZmcyA9IChtZXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5kaWZmc1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZGlmZnMpKSByZXR1cm4gW11cbiAgcmV0dXJuIGRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG5jb25zdCBNVVRBVElPTl9UT09MUyA9IG5ldyBTZXQoWydzdHJfcmVwbGFjZV9lZGl0b3InLCAnbm90ZWJvb2tfZWRpdCddKVxuY29uc3QgTVVUQVRJT05fQ09NTUFORFMgPSBuZXcgU2V0KFsnd3JpdGUnLCAnZWRpdCcsICdyZXBsYWNlJywgJ2RlbGV0ZScsICdtb3ZlJ10pXG5cbi8qKiBQYXRoLW9ubHkgZmFsbGJhY2sgZm9yIGtub3duIGZpbGUtbXV0YXRpbmcgdG9vbHMgd2hvc2UgcmVzdWx0IGNhcnJpZWQgbm8gZGlmZi4gKi9cbmZ1bmN0aW9uIG11dGF0aW9uUGF0aCh0b29sOiBzdHJpbmcsIGFyZ3NSYXc6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBsZXQgYXJnczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsID0gbnVsbFxuICB0cnkge1xuICAgIGFyZ3MgPSBKU09OLnBhcnNlKGFyZ3NSYXcpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKCFhcmdzIHx8IHR5cGVvZiBhcmdzICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgaWYgKHRvb2wgPT09ICdmcycgfHwgdG9vbCA9PT0gJ2ZpbGVzeXN0ZW0nKSB7XG4gICAgY29uc3QgY21kID0gdHlwZW9mIGFyZ3MuY29tbWFuZCA9PT0gJ3N0cmluZycgPyBhcmdzLmNvbW1hbmQgOiAnJ1xuICAgIGlmICghTVVUQVRJT05fQ09NTUFORFMuaGFzKGNtZCkpIHJldHVybiBudWxsXG4gICAgcmV0dXJuIHR5cGVvZiBhcmdzLmZpbGVfcGF0aCA9PT0gJ3N0cmluZycgJiYgYXJncy5maWxlX3BhdGggPyBhcmdzLmZpbGVfcGF0aCA6IG51bGxcbiAgfVxuICBpZiAoTVVUQVRJT05fVE9PTFMuaGFzKHRvb2wpIHx8IHRvb2wuc3RhcnRzV2l0aCgnZWRpdCcpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgWydmaWxlX3BhdGgnLCAncGF0aCcsICdmaWxlbmFtZSddKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3Nba2V5XSA9PT0gJ3N0cmluZycgJiYgYXJnc1trZXldKSByZXR1cm4gYXJnc1trZXldIGFzIHN0cmluZ1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG4vKiogRXh0cmFjdCB0aGUgY2hhbmdlZCBmaWxlcyBmcm9tIG9uZSBzZXR0bGVkIHRvb2wgcmVzdWx0IChkaWZmIGh1bmtzLCBlbHNlIHBhdGgtb25seSkuICovXG5mdW5jdGlvbiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQoY2FsbDogeyBuYW1lOiBzdHJpbmc7IGFyZ3NSYXc6IHN0cmluZyB9LCBub2RlOiBUb29sUmVzdWx0Tm9kZSk6IFJvdW5kQ2hhbmdlW10ge1xuICBjb25zdCB0b29sID0gY2FsbC5uYW1lXG4gIGNvbnN0IGRpZmZzID0gZGlmZnNGcm9tUmVzdWx0Vmlldyhub2RlLnJlc3VsdFZpZXcpXG4gIGNvbnN0IGZhbGxiYWNrRGlmZnMgPSBkaWZmcy5sZW5ndGggPT09IDAgPyBkaWZmc0Zyb21NZXRhKG5vZGUubWV0YSkgOiBbXVxuICBjb25zdCBhbGxEaWZmcyA9IGRpZmZzLmxlbmd0aCA+IDAgPyBkaWZmcyA6IGZhbGxiYWNrRGlmZnNcbiAgaWYgKGFsbERpZmZzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUm91bmRDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGQgb2YgYWxsRGlmZnMpIHtcbiAgICAgIGxldCBlbnRyeSA9IGJ5UGF0aC5nZXQoZC5wYXRoKVxuICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICBlbnRyeSA9IHsgcGF0aDogZC5wYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IHRydWUgfVxuICAgICAgICBieVBhdGguc2V0KGQucGF0aCwgZW50cnkpXG4gICAgICB9XG4gICAgICBlbnRyeS5odW5rcy5wdXNoKHsgb2xkVGV4dDogZC5vbGRUZXh0LCBuZXdUZXh0OiBkLm5ld1RleHQgfSlcbiAgICB9XG4gICAgcmV0dXJuIFsuLi5ieVBhdGgudmFsdWVzKCldXG4gIH1cbiAgY29uc3QgcGF0aCA9IG11dGF0aW9uUGF0aCh0b29sLCBjYWxsLmFyZ3NSYXcpXG4gIHJldHVybiBwYXRoID8gW3sgcGF0aCwgdG9vbCwgaHVua3M6IFtdLCBoYXNEaWZmOiBmYWxzZSB9XSA6IFtdXG59XG5cbi8qKiBQbGFpbiB0ZXh0IG9mIGEgdXNlciBtZXNzYWdlIChjb250ZW50IGJsb2NrcyBvZiB0eXBlICd0ZXh0JykuICovXG5mdW5jdGlvbiB1c2VyVGV4dChub2RlOiBVc2VyTWVzc2FnZU5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIG5vZGUuY29udGVudCkge1xuICAgIGlmIChibG9jayAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnICYmIChibG9jayBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICd0ZXh0JyAmJiB0eXBlb2YgKGJsb2NrIGFzIHsgdGV4dD86IHVua25vd24gfSkudGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBhcnRzLnB1c2goKGJsb2NrIGFzIHsgdGV4dDogc3RyaW5nIH0pLnRleHQpXG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJ0cy5qb2luKCcgJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxufVxuXG4vKiogV2FsayB0aGUgY29udmVyc2F0aW9uIG5vZGVzIGFuZCBncm91cCBjaGFuZ2VkIGZpbGVzIGJ5IHVzZXIgcm91bmQuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdFNlc3Npb25Sb3VuZHMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IFNlc3Npb25Sb3VuZFtdIHtcbiAgY29uc3Qgcm91bmRzOiBTZXNzaW9uUm91bmRbXSA9IFtdXG4gIGxldCBjdXJyZW50OiBTZXNzaW9uUm91bmQgfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBpZiAobm9kZS5raW5kID09PSAndXNlcicpIHtcbiAgICAgIGN1cnJlbnQgPSB7IHJvdW5kOiByb3VuZHMubGVuZ3RoICsgMSwgbGFiZWw6IHVzZXJUZXh0KG5vZGUpLnNsaWNlKDAsIDYwKSwgY2hhbmdlczogW10gfVxuICAgICAgcm91bmRzLnB1c2goY3VycmVudClcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcgfHwgIWN1cnJlbnQgfHwgIW5vZGUuY2FsbCkgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBjaGFuZ2UucGF0aCAmJiBjLnRvb2wgPT09IGNoYW5nZS50b29sKVxuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGlmIChjaGFuZ2UuaGFzRGlmZikge1xuICAgICAgICAgIGV4aXN0aW5nLmh1bmtzLnB1c2goLi4uY2hhbmdlLmh1bmtzKVxuICAgICAgICAgIGV4aXN0aW5nLmhhc0RpZmYgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQuY2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdW5kcy5maWx0ZXIoKHIpID0+IHIuY2hhbmdlcy5sZW5ndGggPiAwKVxufVxuXG4vKiogQ291bnQgb2YgY2hhbmdlZCBmaWxlcyBhY3Jvc3MgYWxsIHJvdW5kcyAoZm9yIHRoZSBoZWFkZXIgYmFkZ2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDBcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcgfHwgIW5vZGUuY2FsbCkgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhbmdlLnRvb2x9OiR7Y2hhbmdlLnBhdGh9YFxuICAgICAgaWYgKCFzZWVuLmhhcyhrZXkpKSB7XG4gICAgICAgIHNlZW4uYWRkKGtleSlcbiAgICAgICAgY291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnRcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWZmIHJlbmRlcmluZy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogU3BsaXQgb25lIGBnaXQgc2hvdyAtLWZvcm1hdD1gIGRpZmYgaW50byBwZXItZmlsZSBzZWdtZW50cy4gKi9cbmZ1bmN0aW9uIHNwbGl0Q29tbWl0RGlmZihkaWZmOiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXSB7XG4gIGNvbnN0IHNlZ21lbnRzOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nW10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9IHwgbnVsbCA9IG51bGxcbiAgZm9yIChjb25zdCBsaW5lIG9mIGRpZmYuc3BsaXQoJ1xcbicpKSB7XG4gICAgY29uc3QgbWF0Y2ggPSAvXmRpZmYgLS1naXQgYVxcLyguKj8pIGJcXC8vLmV4ZWMobGluZSlcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gICAgICBjdXJyZW50ID0geyBwYXRoOiBtYXRjaFsxXSwgdGV4dDogW2xpbmVdIH1cbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQudGV4dC5wdXNoKGxpbmUpXG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gIHJldHVybiBzZWdtZW50cy5tYXAoKHMpID0+ICh7IHBhdGg6IHMucGF0aCwgdGV4dDogcy50ZXh0LmpvaW4oJ1xcbicpIH0pKVxufVxuXG4vKiogU3RhdHVzIGxldHRlciBmb3IgYSBjb21taXQncyBmaWxlLCBkZXJpdmVkIGZyb20gaXRzIGRpZmYgc2VnbWVudCB0ZXh0LiAqL1xuZnVuY3Rpb24gY29tbWl0RmlsZVN0YXR1cyhzZWdtZW50VGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9ebmV3IGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnQSdcbiAgaWYgKC9eZGVsZXRlZCBmaWxlIG1vZGUvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ0QnXG4gIGlmICgvXnJlbmFtZSBmcm9tIC8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnUidcbiAgcmV0dXJuICdNJ1xufVxuXG50eXBlIERpZmZSb3cgPSB7IGtpbmQ6ICdhZGQnIHwgJ2RlbCcgfCAnY3R4JyB8ICdodW5rJyB8ICdmaWxlJyB8ICdub3RlJzsgdGV4dDogc3RyaW5nIH1cblxuLyoqIENsYXNzaWZ5IHJhdyB1bmlmaWVkLWRpZmYgdGV4dCAoZ2l0IG91dHB1dCkgaW50byByb3dzLiAqL1xuZnVuY3Rpb24gZ2l0RGlmZlJvd3MoZGlmZjogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgcmV0dXJuIGRpZmYuc3BsaXQoJ1xcbicpLm1hcCgobGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykpIHJldHVybiB7IGtpbmQ6ICdmaWxlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkgcmV0dXJuIHsga2luZDogJ2h1bmsnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIHJldHVybiB7IGtpbmQ6ICdhZGQnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIHJldHVybiB7IGtpbmQ6ICdkZWwnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSByZXR1cm4geyBraW5kOiAnbm90ZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIHJldHVybiB7IGtpbmQ6ICdjdHgnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgfSlcbn1cblxuLyoqIENvbXB1dGUgYWRkL2RlbC9jdHggcm93cyBiZXR3ZWVuIHR3byB0ZXh0cyAodGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSkuICovXG5mdW5jdGlvbiB0ZXh0RGlmZlJvd3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvd3Ncbn1cblxuLyoqIEFsbCByb3dzIGZvciBvbmUgcm91bmQgY2hhbmdlIChtdWx0aXBsZSBodW5rcyBnZXQgYEBAYCBzZXBhcmF0b3JzKS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVJvd3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IERpZmZSb3dbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGNoYW5nZS5odW5rcy5mb3JFYWNoKChodW5rLCBpKSA9PiB7XG4gICAgaWYgKGNoYW5nZS5odW5rcy5sZW5ndGggPiAxKSByb3dzLnB1c2goeyBraW5kOiAnaHVuaycsIHRleHQ6IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIH0pXG4gICAgcm93cy5wdXNoKC4uLnRleHREaWZmUm93cyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dCkpXG4gIH0pXG4gIHJldHVybiByb3dzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3BsaXQgKHR3by1jb2x1bW4pIGRpZmYgdmlldy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogT25lIGFsaWduZWQgcm93IG9mIHRoZSBzaWRlLWJ5LXNpZGUgdmlldy4gKi9cbmludGVyZmFjZSBTcGxpdFJvdyB7XG4gIGxlZnQ6IHN0cmluZ1xuICByaWdodDogc3RyaW5nXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBvbGQgZmlsZSwgb3IgbnVsbCAocHVyZSBhZGRpdGlvbikuICovXG4gIGxlZnROdW06IG51bWJlciB8IG51bGxcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG5ldyBmaWxlLCBvciBudWxsIChwdXJlIGRlbGV0aW9uKS4gKi9cbiAgcmlnaHROdW06IG51bWJlciB8IG51bGxcbiAga2luZDogJ2N0eCcgfCAnY2hhbmdlJ1xufVxuXG4vKiogT25lIHNpZGUtYnktc2lkZSBibG9jayAoYSBodW5rIHdpdGggaXRzIGBAQGAgaGVhZGVyKS4gKi9cbmludGVyZmFjZSBTcGxpdEJsb2NrIHtcbiAgaGVhZDogc3RyaW5nIHwgbnVsbFxuICByb3dzOiBTcGxpdFJvd1tdXG59XG5cbi8qKlxuICogUGFpciBhZGQvZGVsIHJvd3MgaW50byBhbGlnbmVkIGxlZnQvcmlnaHQgY29sdW1ucy4gUmVtb3ZlZCBsaW5lcyBidWZmZXJcbiAqIHVudGlsIHRoZSBtYXRjaGluZyBhZGRpdGlvbnMgYXJyaXZlICh1bmlmaWVkIGRpZmYgb3JkZXJzIGRlbGV0aW9ucyBiZWZvcmVcbiAqIGFkZGl0aW9ucyksIHNvIHB1cmUgZGVsZXRpb25zIGFuZCBwdXJlIGFkZGl0aW9ucyBzdGlsbCBnZXQgdGhlaXIgb3duIHJvd1xuICogd2l0aCBhbiBlbXB0eSBjZWxsIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLiBMaW5lIG51bWJlcnMgdHJhY2sgZnJvbSB0aGUgaHVua1xuICogaGVhZGVyJ3MgYC1hLGIgK2MsZGAgcG9zaXRpb25zLlxuICovXG5mdW5jdGlvbiBwYWlyUm93cyhyb3dzOiBEaWZmUm93W10sIG9sZFN0YXJ0OiBudW1iZXIsIG5ld1N0YXJ0OiBudW1iZXIpOiBTcGxpdFJvd1tdIHtcbiAgY29uc3Qgb3V0OiBTcGxpdFJvd1tdID0gW11cbiAgbGV0IG9sZExpbmUgPSBvbGRTdGFydFxuICBsZXQgbmV3TGluZSA9IG5ld1N0YXJ0XG4gIGxldCBwZW5kaW5nOiB7IHRleHQ6IHN0cmluZzsgbnVtOiBudW1iZXIgfVtdID0gW11cbiAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBwIG9mIHBlbmRpbmcpIG91dC5wdXNoKHsgbGVmdDogcC50ZXh0LCByaWdodDogJycsIGxlZnROdW06IHAubnVtLCByaWdodE51bTogbnVsbCwga2luZDogJ2NoYW5nZScgfSlcbiAgICBwZW5kaW5nID0gW11cbiAgfVxuICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgcGVuZGluZy5wdXNoKHsgdGV4dDogcm93LnRleHQuc2xpY2UoMSksIG51bTogb2xkTGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgIGNvbnN0IHAgPSBwZW5kaW5nLnNoaWZ0KClcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogcD8udGV4dCA/PyAnJywgcmlnaHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBsZWZ0TnVtOiBwPy5udW0gPz8gbnVsbCwgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2NoYW5nZScgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgZmx1c2goKVxuICAgICAgLy8gVW5pZmllZC1kaWZmIGNvbnRleHQgbGluZXMgY2FycnkgYSBsZWFkaW5nIHNwYWNlIFx1MjAxNCBzdHJpcCBpdCBmb3IgdGhlXG4gICAgICAvLyBzcGxpdCBjZWxscyBzbyBib3RoIGNvbHVtbnMgcmVuZGVyIGJhcmUgdGV4dC5cbiAgICAgIGNvbnN0IHRleHQgPSByb3cudGV4dC5zdGFydHNXaXRoKCcgJykgPyByb3cudGV4dC5zbGljZSgxKSA6IHJvdy50ZXh0XG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHRleHQsIHJpZ2h0OiB0ZXh0LCBsZWZ0TnVtOiBvbGRMaW5lKyssIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjdHgnIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGZsdXNoKCkgLy8gbm90ZXMgKFxcIE5vIG5ld2xpbmVcdTIwMjYpIGFuZCBzdHJheSByb3dzOiBqdXN0IGJyZWFrIHRoZSBwYWlyaW5nXG4gICAgfVxuICB9XG4gIGZsdXNoKClcbiAgcmV0dXJuIG91dFxufVxuXG4vKiogUGFyc2UgZ2l0IHVuaWZpZWQgZGlmZiB0ZXh0IGludG8gYmxvY2tzIChgLS0tLysrK2AgZmlsZSByb3dzIGFuZCBgQEBgIGh1bmtzKS4gKi9cbmNvbnN0IEdJVF9NRVRBID0gL14oZGlmZiAtLWdpdCB8aW5kZXggfG5ldyBmaWxlIHxkZWxldGVkIGZpbGUgfG9sZCBtb2RlIHxuZXcgbW9kZSB8c2ltaWxhcml0eSBpbmRleCB8cmVuYW1lIChmcm9tfHRvKSB8QmluYXJ5IGZpbGVzICkvXG5cbmZ1bmN0aW9uIHBhcnNlR2l0QmxvY2tzKGRpZmY6IHN0cmluZyk6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10ge1xuICBjb25zdCBibG9ja3M6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH0gfCBudWxsID0gbnVsbFxuICBjb25zdCBsaW5lcyA9IGRpZmYuc3BsaXQoJ1xcbicpXG4gIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgbGV0IGtpbmQ6IERpZmZSb3dbJ2tpbmQnXVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykgfHwgR0lUX01FVEEudGVzdChsaW5lKSkga2luZCA9ICdmaWxlJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkga2luZCA9ICdodW5rJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKycpKSBraW5kID0gJ2FkZCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkga2luZCA9ICdkZWwnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSBraW5kID0gJ25vdGUnXG4gICAgZWxzZSBraW5kID0gJ2N0eCdcbiAgICBpZiAoa2luZCA9PT0gJ2ZpbGUnIHx8IGtpbmQgPT09ICdodW5rJykge1xuICAgICAgY3VycmVudCA9IHsgaGVhZDogeyBraW5kLCB0ZXh0OiBsaW5lIH0sIHJvd3M6IFtdIH1cbiAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY3VycmVudCkge1xuICAgICAgICBjdXJyZW50ID0geyBoZWFkOiBudWxsLCByb3dzOiBbXSB9XG4gICAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgICB9XG4gICAgICBjdXJyZW50LnJvd3MucHVzaCh7IGtpbmQsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJsb2Nrc1xufVxuXG4vKiogSHVuayBzdGFydCBwb3NpdGlvbnMgZnJvbSBhIGBAQCAtYSxiICtjLGQgQEBgIGhlYWRlci4gKi9cbmZ1bmN0aW9uIGh1bmtTdGFydHMoaGVhZDogc3RyaW5nKTogeyBvbGRTdGFydDogbnVtYmVyOyBuZXdTdGFydDogbnVtYmVyIH0ge1xuICBjb25zdCBtID0gL15AQCAtKFxcZCspKD86LFxcZCspPyBcXCsoXFxkKykvLmV4ZWMoaGVhZClcbiAgcmV0dXJuIHsgb2xkU3RhcnQ6IG0gPyBOdW1iZXIobVsxXSkgOiAxLCBuZXdTdGFydDogbSA/IE51bWJlcihtWzJdKSA6IDEgfVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgYSBnaXQgdW5pZmllZCBkaWZmIChza2lwcyBwdXJlIGZpbGUtaGVhZGVyIGJsb2NrcykuICovXG5mdW5jdGlvbiBnaXRTcGxpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICByZXR1cm4gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgICAuZmlsdGVyKChiKSA9PiBiLmhlYWQ/LmtpbmQgIT09ICdmaWxlJyAmJiAoYi5yb3dzLmxlbmd0aCA+IDAgfHwgYi5oZWFkPy5raW5kID09PSAnaHVuaycpKVxuICAgIC5tYXAoKGIpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0cyA9IGIuaGVhZCA/IGh1bmtTdGFydHMoYi5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgcmV0dXJuIHsgaGVhZDogYi5oZWFkPy5raW5kID09PSAnaHVuaycgPyBiLmhlYWQudGV4dCA6IG51bGwsIHJvd3M6IHBhaXJSb3dzKGIucm93cywgc3RhcnRzLm9sZFN0YXJ0LCBzdGFydHMubmV3U3RhcnQpIH1cbiAgICB9KVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgdGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSAob2xkVGV4dC9uZXdUZXh0KS4gKi9cbmZ1bmN0aW9uIHRleHRTcGxpdEJsb2NrcyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gW3sgaGVhZDogbnVsbCwgcm93czogcGFpclJvd3Mocm93cywgMSwgMSkgfV1cbn1cblxuLyoqIEFsbCBzaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBvbmUgcm91bmQgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hhbmdlU3BsaXRCbG9ja3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IFNwbGl0QmxvY2tbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIHJldHVybiBjaGFuZ2UuaHVua3MubWFwKChodW5rLCBpKSA9PiAoe1xuICAgIGhlYWQ6IGNoYW5nZS5odW5rcy5sZW5ndGggPiAxID8gYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgOiBudWxsLFxuICAgIHJvd3M6IHRleHRTcGxpdEJsb2NrcyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dClbMF0ucm93cyxcbiAgfSkpXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3R5bGVzIChkc2RyLSo7IHRoZSBoZWFkZXIgdHJpZ2dlciBtaXJyb3JzIHRoZSBpbi10cmVlIGFjdGlvbiByb3dzKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBSRVZJRVdfQ1NTID0gYFxuLmRzZHItdHJpZ2dlcnttaW4taGVpZ2h0OjI4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjRweDtwYWRkaW5nOjNweCA2cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXRyaWdnZXI6aG92ZXIsLmRzZHItdHJpZ2dlcjpmb2N1cy12aXNpYmxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbGFiZWx7bWFyZ2luLWxlZnQ6MnB4fVxuLmRzZHItY291bnR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDttaW4td2lkdGg6MTZweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA1cHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItb3ZlcmxheXtwb3NpdGlvbjpmaXhlZDtpbnNldDowO3otaW5kZXg6MjAwO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNDUpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtwYWRkaW5nOjMycHh9XG4uZHNkci1wYW5lbHtib3gtc2l6aW5nOmJvcmRlci1ib3g7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6bWluKDExMjBweCwxMDAlKTtoZWlnaHQ6bWluKDcyMHB4LGNhbGMoMTAwdmggLSA2NHB4KSk7bWF4LXdpZHRoOmNhbGMoMTAwdncgLSA2NHB4KTttYXgtaGVpZ2h0OmNhbGMoMTAwdmggLSA2NHB4KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czoxNHB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItcmVzaXple3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NX1cbi5kc2RyLXJlc2l6ZS1le3RvcDowO3JpZ2h0Oi0zcHg7d2lkdGg6N3B4O2hlaWdodDoxMDAlO2N1cnNvcjpldy1yZXNpemV9XG4uZHNkci1yZXNpemUtc3tib3R0b206LTNweDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6N3B4O2N1cnNvcjpucy1yZXNpemV9XG4uZHNkci1yZXNpemUtc2V7cmlnaHQ6LTRweDtib3R0b206LTRweDt3aWR0aDoxNXB4O2hlaWdodDoxNXB4O2N1cnNvcjpud3NlLXJlc2l6ZX1cbi5kc2RyLWhlYWRlcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6MTJweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLXRpdGxle2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zdWJ0aXRsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItdGFic3tkaXNwbGF5OmZsZXg7Z2FwOjRweDttYXJnaW4tbGVmdDoxNHB4fVxuLmRzZHItdGFie2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI2cHg7Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoycHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLXRhYjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXRhYi1hY3RpdmV7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zY29wZXtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21hcmdpbi1sZWZ0OjhweH1cbi5kc2RyLXNjb3BlIC5kc2RyLXNlbC10cmlnZ2Vye21pbi13aWR0aDoxMTBweDtoZWlnaHQ6MjZweDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MCA4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1zcGFjZXJ7ZmxleDoxfVxuLmRzZHItYnRue2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweH1cbi5kc2RyLWJ0bjpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuOmRpc2FibGVke29wYWNpdHk6LjU7Y3Vyc29yOmRlZmF1bHR9XG4uZHNkci1idG4tcHJpbWFyeXtib3JkZXItY29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC00MDApO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcjpob3Zlcjpub3QoOmRpc2FibGVkKXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tY29uZmlybXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItYnRuLWNvbmZpcm06aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1jb21taXQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjIwMHB4O21pbi1oZWlnaHQ6MjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjNweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItY29tbWl0LWlucHV0OjpwbGFjZWhvbGRlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtY2FwdGlvbil9XG4uZHNkci1jb21taXQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1zZWN0aW9ue2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjEwcHggOHB4IDNweDtmb250LXdlaWdodDo2MDA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4fVxuLmRzZHItc2VjdGlvbjpmaXJzdC1jaGlsZHtwYWRkaW5nLXRvcDo0cHh9XG4uZHNkci1icmFuY2h7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NHB4IDhweCA4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1icmFuY2gtcmVme2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczttaW4td2lkdGg6MDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnJhbmNoLWFycm93e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1icmFuY2gtc3RhdHtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWJyYW5jaC1haGVhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1iZWhpbmR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXdhcm4tcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtc3luY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdHtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NXB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY29tbWl0OmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRsLXNlbGVjdGVkIC5kc2RyLWNvbW1pdHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10aW1lbGluZXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItdGwtaXRlbXtkaXNwbGF5OmZsZXg7Z2FwOjZweDthbGlnbi1pdGVtczpzdHJldGNoO2JvcmRlci1yYWRpdXM6OHB4fVxuLmRzZHItdGwtcmFpbHtwb3NpdGlvbjpyZWxhdGl2ZTtmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcn1cbi5kc2RyLXRsLXJhaWw6OmJlZm9yZXtjb250ZW50OlwiXCI7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7Ym90dG9tOjA7bGVmdDo1MCU7d2lkdGg6MXB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMil9XG4uZHNkci10bC1pdGVtOmZpcnN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXt0b3A6OXB4fVxuLmRzZHItdGwtaXRlbTpsYXN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXtib3R0b206YXV0bztoZWlnaHQ6OXB4fVxuLmRzZHItdGwtZG90e3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MTt0b3A6OXB4O2ZsZXg6bm9uZTt3aWR0aDo3cHg7aGVpZ2h0OjdweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItdGwtZG90LWxvY2Fse2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1kb3QtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWNvbW1pdC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4td2lkdGg6MH1cbi5kc2RyLWNvbW1pdC1zaG9ydHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1zdWJqZWN0e2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1jb21taXQtbWV0YXtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmctbGVmdDowfVxuLmRzZHItdGwtYmFkZ2V7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDVweH1cbi5kc2RyLXRsLWJhZGdlLWxvY2Fse2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWJhZGdlLXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItZGlmZi1oYXNoe21hcmdpbi1sZWZ0OjhweDtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LWZpbGUtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItY29tbWl0LWZpbGUtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7bWFyZ2luLWxlZnQ6NHB4fVxuLmRzZHItY2ZnLWNhcmR7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXItcmFkaXVzOjEycHg7bGlzdC1zdHlsZTpub25lO3RyYW5zaXRpb246Ym9yZGVyLWNvbG9yIC4xNnMsYmFja2dyb3VuZCAuMTZzfVxuLmRzZHItY2ZnLWNhcmQ6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWNhcmQtb3BlbntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jZmctaGVhZHthcHBlYXJhbmNlOm5vbmU7d2lkdGg6MTAwJTtmb250OmluaGVyaXQ7Y29sb3I6aW5oZXJpdDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czoxMnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtwYWRkaW5nOjE0cHggMTZweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctaGVhZDpmb2N1cy12aXNpYmxle291dGxpbmU6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lLW9mZnNldDotMnB4fVxuLmRzZHItY2ZnLWhlYWQtdGV4dHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47ZmxleDoxO2dhcDo0cHg7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLW5hbWV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjYwMDtsaW5lLWhlaWdodDoxLjR9XG4uZHNkci1jZmctZGVzY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1jYXJldHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTZzfVxuLmRzZHItY2ZnLWNhcmV0LW9wZW57dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItY2ZnLWJvZHl7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7bWFyZ2luOjAgMTZweDtwYWRkaW5nLWJvdHRvbTo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLWNmZy1maWVsZHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjEycHggMDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctZmllbGQrLmRzZHItY2ZnLWZpZWxke2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItY2ZnLWxhYmVse21pbi13aWR0aDowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NTAwO2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1oaW50e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLXBlbmRpbmd7d2hpdGUtc3BhY2U6bm93cmFwO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDtmbGV4Om5vbmU7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxN3B4fVxuLmRzZHItY2ZnLWZhaWxlZHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZXJyb3IpO2ZsZXg6MTttYXJnaW46MDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctYWN0aW9uc3tib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzoxMnB4IDAgNHB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWJvZHl7ZGlzcGxheTpmbGV4O2ZsZXg6MTttaW4taGVpZ2h0OjB9XG4uZHNkci1maWxlc3t3aWR0aDozMDBweDtmbGV4Om5vbmU7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtvdmVyZmxvdy15OmF1dG87cGFkZGluZzo4cHh9XG4uZHNkci1yb3VuZHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo4cHggOHB4IDNweDtmb250LXdlaWdodDo2MDB9XG4uZHNkci1yb3VuZC1sYWJlbHt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NDAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItZmlsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maWxlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbGUtc2VsZWN0ZWR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZGlye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItZGlyOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kaXItY2FyZXR7ZmxleDpub25lO3dpZHRoOjEycHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpci1uYW1le2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItZGlyLWNvdW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWZpbGUtbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmlsZS1zdGF0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWNoaXB7ZmxleDpub25lO21pbi13aWR0aDoyMnB4O3RleHQtYWxpZ246Y2VudGVyO2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNoaXAtbXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtYXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtZHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xNik7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWNoaXAtcntiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpO2NvbG9yOiM1OGE2ZmZ9XG4uZHNkci1jaGlwLXV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXRvb2x7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1kaWZme2ZsZXg6MTttaW4td2lkdGg6MDtvdmVyZmxvdzphdXRvO3BhZGRpbmc6MTBweCAwfVxuLmRzZHItZGlmZi1lbXB0eXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7aGVpZ2h0OjEwMCU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWRpZmYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6NnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItZGlmZi1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZGlmZi1zdGF0c3tmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXNjcm9sbHtmbGV4OjE7bWluLWhlaWdodDowO292ZXJmbG93OmF1dG87ZGlzcGxheTpmbGV4fVxuLmRzZHItcHJle21hcmdpbjowO3BhZGRpbmc6OHB4IDA7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KTt3aGl0ZS1zcGFjZTpwcmU7bWluLXdpZHRoOjEwMCU7ZmxleDoxfVxuLmRzZHItbGluZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MTBweDtwYWRkaW5nOjAgMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cG9zaXRpb246cmVsYXRpdmV9XG4uZHNkci1saW5lLW51bXtmbGV4Om5vbmU7d2lkdGg6MzRweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO29wYWNpdHk6Ljc1fVxuLmRzZHItbGluZS10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpwcmV9XG4uZHNkci1jb21tZW50LWFkZHtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE4cHg7aGVpZ2h0OjE4cHg7Ym9yZGVyLXJhZGl1czo2cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO21hcmdpbi10b3A6MXB4O3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1jb21tZW50LWFkZCwuZHNkci1jb21tZW50LWFkZDpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWNvbW1lbnQtYWRkOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jb21tZW50LWhhc3t2aXNpYmlsaXR5OnZpc2libGU7YmFja2dyb3VuZDpjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDE2JSwgdHJhbnNwYXJlbnQpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKTtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQ7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItbGluZS1jb21tZW50ZWR7Ym94LXNoYWRvdzppbnNldCAzcHggMCAwIGNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCkgNzAlLCB0cmFuc3BhcmVudCl9XG4uZHNkci1jb21tZW50LWVkaXRvcntkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLWNvbW1lbnQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDo1MnB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo2cHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3Jlc2l6ZTp2ZXJ0aWNhbH1cbi5kc2RyLWNvbW1lbnQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1jb21tZW50LWFjdGlvbnN7ZGlzcGxheTpmbGV4O2dhcDo2cHg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kfVxuLmRzZHItY29tbWVudC1wb3B7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoyMDtyaWdodDoxNnB4O3RvcDpjYWxjKDEwMCUgKyAycHgpO21pbi13aWR0aDoyODBweDttYXgtd2lkdGg6NDQwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3JkZXItcmFkaXVzOjEwcHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7cGFkZGluZzo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4fVxuLmRzZHItY29tbWVudC1pdGVte2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtwYWRkaW5nLWJvdHRvbTo2cHh9XG4uZHNkci1jb21tZW50LWl0ZW06bGFzdC1jaGlsZHtib3JkZXItYm90dG9tOjA7cGFkZGluZy1ib3R0b206MH1cbi5kc2RyLWNvbW1lbnQtdGV4dHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWVudC1tZXRhe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWVudC1tZXRhIC5kc2RyLWJ0bnttaW4taGVpZ2h0OjIwcHg7cGFkZGluZzowIDZweDtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O21hcmdpbi1sZWZ0OmF1dG99XG4uZHNkci1vcGVubGluZXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE4cHg7aGVpZ2h0OjE4cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1vcGVubGluZSwuZHNkci1vcGVubGluZTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLW9wZW5saW5lOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWxpbmUtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDNweCAwIDAgdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKX1cbi5kc2RyLWZpbmRpbmctUDB7LS1kc2RyLWZpbmRpbmctY29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctUDF7LS1kc2RyLWZpbmRpbmctY29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctUDJ7LS1kc2RyLWZpbmRpbmctY29sb3I6I2QyOTkyMn1cbi5kc2RyLWZpbmRpbmctUDN7LS1kc2RyLWZpbmRpbmctY29sb3I6IzhiOTQ5ZX1cbi5kc2RyLWZpbmRpbmctdGFne2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydDttYXJnaW4tdG9wOjJweH1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXJldmlldy1zdHJpcHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO2ZvbnQtc2l6ZToxMnB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItcmV2aWV3LW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWJhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctbW9kZWx7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXJldmlldy10b2dnbGUtb257Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maW5kaW5nc3tkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWF4LWhlaWdodDoyNjBweDtvdmVyZmxvdy15OmF1dG99XG4uZHNkci1maW5kaW5nLWl0ZW17ZGlzcGxheTpmbGV4O2dhcDo4cHg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0fVxuLmRzZHItZmluZGluZy1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbmRpbmctYm9keXtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4fVxuLmRzZHItZmluZGluZy10aXRsZXtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpiYXNlbGluZTtnYXA6OHB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItZmluZGluZy1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo0MDB9XG4uZHNkci1maW5kaW5nLWRldGFpbHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1maW5kaW5nLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbmRpbmctc3VnZ2VzdGlvbntkaXNwbGF5OmJsb2NrO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjRweCA4cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1wcntkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo0cHggOHB4IDhweH1cbi5kc2RyLXByLWl0ZW17ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXR9XG4uZHNkci1wci1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXByLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXByLXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLWRvY2t7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O21hcmdpbjo4cHggMTJweCAwO3BhZGRpbmc6OHB4IDEycHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6MTBweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItZG9jay1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttaW4taGVpZ2h0OjI0cHh9XG4uZHNkci1kb2NrLWljb257ZGlzcGxheTppbmxpbmUtZmxleDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCl9XG4uZHNkci1kb2NrLWNvdW50e2ZvbnQtd2VpZ2h0OjYwMDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZG9jay1oaW50e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjExcHh9XG4uZHNkci1kb2NrLWNsb3Nle2ZsZXg6bm9uZTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjIycHg7aGVpZ2h0OjIycHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MH1cbi5kc2RyLWRvY2stY2xvc2U6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWRvY2stbGlzdHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7cGFkZGluZy10b3A6NHB4O21hcmdpbi10b3A6MnB4O21heC1oZWlnaHQ6MjQ4cHg7b3ZlcmZsb3cteTphdXRvfVxuLmRzZHItZG9jay1pdGVte2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjJweDt0ZXh0LWFsaWduOmxlZnQ7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0fVxuLmRzZHItZG9jay1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWRvY2stbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1kb2NrLXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItc2VuZHtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjQwO3RvcDo1MnB4O3JpZ2h0OjE2cHg7d2lkdGg6bWluKDQ4MHB4LGNhbGMoMTAwJSAtIDMycHgpKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLW1lbnUpO2JvcmRlci1yYWRpdXM6MTJweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtwYWRkaW5nOjEycHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6OHB4fVxuLmRzZHItc2VuZC10aXRsZXtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2VuZC1oaW50e2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXNlbmQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDoxNDBweDttYXgtaGVpZ2h0OjMyMHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6OHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3Jlc2l6ZTp2ZXJ0aWNhbDt3aGl0ZS1zcGFjZTpwcmUtd3JhcH1cbi5kc2RyLWxpbmUtYWRke2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjEzKX1cbi5kc2RyLWxpbmUtZGVse2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjEyKX1cbi5kc2RyLWxpbmUtaHVua3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1maWxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLW5vdGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXN0eWxlOml0YWxpY31cbi5kc2RyLWh1bmstYmFye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtwYWRkaW5nOjJweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpfVxuLmRzZHItaHVuay1iYXIgLmRzZHItYnRue21pbi1oZWlnaHQ6MjJweDtwYWRkaW5nOjFweCA4cHg7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweH1cbi5kc2RyLWh1bmstbGF5ZXJ7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO21hcmdpbi1yaWdodDphdXRvfVxuLmRzZHItZm9vdHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO21pbi1oZWlnaHQ6MzZweH1cbi5kc2RyLW5vdGljZXtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLW5vdGljZS1va3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLW5vdGljZS1lcnJvcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1zcGlubmVye2ZsZXg6bm9uZTt3aWR0aDoxMnB4O2hlaWdodDoxMnB4O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlcjoycHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXRvcC1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTthbmltYXRpb246ZHNkci1zcGluIC44cyBsaW5lYXIgaW5maW5pdGV9XG5Aa2V5ZnJhbWVzIGRzZHItc3Bpbnt0b3t0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fVxuLmRzZHItZW1wdHl7cGFkZGluZzo0MHB4O3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1ub2RpZmZ7cGFkZGluZzo4cHggMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItc2Vse3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6aW5saW5lLWZsZXh9XG4uZHNkci1zZWwtdHJpZ2dlcntib3gtc2l6aW5nOmNvbnRlbnQtYm94O21pbi13aWR0aDoxODBweDtoZWlnaHQ6MzRweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjAgMTJweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEzcHg7bGluZS1oZWlnaHQ6MS41O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHh9XG4uZHNkci1zZWwtdHJpZ2dlcjpob3Zlcntib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1zZWwtdHJpZ2dlcjpmb2N1cy12aXNpYmxle2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSk7b3V0bGluZTpub25lfVxuLmRzZHItc2VsLXRyaWdnZXIgc3Zne2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTJzfVxuLmRzZHItc2VsLXRyaWdnZXJbYXJpYS1leHBhbmRlZD1cInRydWVcIl0gc3Zne3RyYW5zZm9ybTpyb3RhdGUoMTgwZGVnKX1cbi5kc2RyLXNlbC12YWx1ZXtmbGV4OjE7bWluLXdpZHRoOjA7dGV4dC1hbGlnbjpsZWZ0O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXNlbC1tZW51e3otaW5kZXg6MjAwO2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4td2lkdGg6MTAwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLW1lbnUpO2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO2JvcmRlci1yYWRpdXM6MTBweDttYXJnaW46MDtwYWRkaW5nOjRweDtsaXN0LXN0eWxlOm5vbmU7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MXB4O3Bvc2l0aW9uOmFic29sdXRlO3RvcDpjYWxjKDEwMCUgKyA1cHgpO2xlZnQ6MH1cbi5kc2RyLXNlbC1vcHRpb257Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDozMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItcmFkaXVzOjdweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjVweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7dGV4dC1hbGlnbjpsZWZ0O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLXNlbC1vcHRpb246aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItc2VsLW9wdGlvbi1hY3RpdmV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2VsLW9wdGlvbi1tYXJre2ZsZXg6bm9uZTt3aWR0aDoxNHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1zZWwtb3B0aW9uLWxhYmVse2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci12aWV3LXRvZ2dsZXtkaXNwbGF5OmZsZXg7Z2FwOjJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O3BhZGRpbmc6MnB4O2ZsZXg6bm9uZX1cbi5kc2RyLXZpZXctYnRue2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjIycHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo1cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MXB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweH1cbi5kc2RyLXZpZXctYnRuOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdmlldy1idG4tYWN0aXZle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGxpdHttaW4td2lkdGg6MTAwJX1cbi5kc2RyLXNwbGl0LWhlYWR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjRweCA4cHg7cG9zaXRpb246c3RpY2t5O3RvcDowO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSl9XG4uZHNkci1zcGxpdC1oZWFkIGRpdntkaXNwbGF5OmZsZXg7Z2FwOjhweH1cbi5kc2RyLXNwbGl0LWh1bmt7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE4cHg7cGFkZGluZzoycHggMTZweH1cbi5kc2RyLXNwbGl0LXJvd3tkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KX1cbi5kc2RyLXNwbGl0LWNlbGx7ZGlzcGxheTpmbGV4O2dhcDo4cHg7cGFkZGluZzowIDhweDt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNwbGl0LW51bXtmbGV4Om5vbmU7d2lkdGg6MzZweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KX1cbi5kc2RyLXNwbGl0LXRleHR7ZmxleDoxO21pbi13aWR0aDowfVxuLmRzZHItY2VsbC1maW5kaW5ne2JveC1zaGFkb3c6aW5zZXQgMCAwIDAgMXB4IHZhcigtLWRzZHItZmluZGluZy1jb2xvciwgcmdiYSgyNTUsMTY2LDg3LC43KSk7YmFja2dyb3VuZDpyZ2JhKDI1NSwxNjYsODcsLjA4KX1cbi5kc2RyLWNlbGwtanVtcHtiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpfVxuLmRzZHItc3BsaXQtZmluZGluZ3tmbGV4Om5vbmU7Zm9udC1zaXplOjlweDtsaW5lLWhlaWdodDoxMnB4O2JvcmRlci1yYWRpdXM6M3B4O3BhZGRpbmc6MCAzcHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydH1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAwe2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE4KTtjb2xvcjojZjg1MTQ5fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDF7YmFja2dyb3VuZDpyZ2JhKDI1NSwxNjYsODcsLjE2KTtjb2xvcjojZmZhNjU3fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDN7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXNwbGl0LW9wZW5saW5le2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MTZweDtoZWlnaHQ6MTZweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1zcGxpdC1jZWxsOmhvdmVyIC5kc2RyLXNwbGl0LW9wZW5saW5lLC5kc2RyLXNwbGl0LW9wZW5saW5lOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItc3BsaXQtb3BlbmxpbmU6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY2VsbC1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItY2VsbC1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItY2VsbC1kaW17YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMSwgcmdiYSgxMjgsMTI4LDEyOCwuMDUpKX1cbmBcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHN0eWxlW2RhdGEtcGx1Z2luLWNzcz0ke0pTT04uc3RyaW5naWZ5KFNUWUxFX1RBRyl9XWApID09PSBudWxsKSB7XG4gIGNvbnN0IHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgdGFnLmRhdGFzZXQucGx1Z2luID0gJ2RzaC1wbHVnaW4tZGlmZi1yZXZpZXcnXG4gIHRhZy5kYXRhc2V0LnBsdWdpbkNzcyA9IFNUWUxFX1RBR1xuICB0YWcudGV4dENvbnRlbnQgPSBSRVZJRVdfQ1NTXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGFnKVxufVxuXG4vKiogU2ltcGxpZmllZCBDaGluZXNlIGRpY3Rpb25hcnkgKGtleS1zZXQgc291cmNlIG9mIHRydXRoKS4gKi9cbmNvbnN0IHpoID0ge1xuICAnYWN0aW9uLmxhYmVsJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdhY3Rpb24uYXJpYSc6ICdcdTVCQTFcdTY3RTVcdTVGNTNcdTUyNERcdTk4NzlcdTc2RUVcdTRFMEVcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzknLFxuICAndGFiLnNlc3Npb24nOiAnXHU0RjFBXHU4QkREXHU2NkY0XHU2NTM5JyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnXHU1REU1XHU0RjVDXHU1MzNBJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdcdTUzRDhcdTUyQTgnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ1x1NkUzOFx1NzlCQiBIRUFEJyxcbiAgJ3Jldmlldy5ub3RSZXBvJzogJ1x1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1NEUwRFx1NjYyRiBnaXQgXHU0RUQzXHU1RTkzJyxcbiAgJ3Jldmlldy5ub3RSZXBvSGludCc6ICdcdTMwMENcdTRGMUFcdThCRERcdTY2RjRcdTY1MzlcdTMwMERcdTk4NzVcdTdCN0VcdTRFMERcdTUzRDdcdTVGNzFcdTU0Q0RcdUZGMENcdTRFQ0RcdTUzRUZcdTY3RTVcdTc3MEJcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzlcdTMwMDInLFxuICAncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnOiAnXHU4RkQ5XHU0RTJBXHU0RjFBXHU4QkREXHU4RkQ4XHU2Q0ExXHU2NzA5XHU2NTg3XHU0RUY2XHU0RkVFXHU2NTM5XHU4QkIwXHU1RjU1JyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gXHU4RjZFIFx1MDBCNyB7ZmlsZXN9IFx1NEUyQVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcucm91bmQnOiAnXHU3QjJDIHtyb3VuZH0gXHU4RjZFJyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdcdTZDQTFcdTY3MDlcdTY3MkFcdTYzRDBcdTRFQTRcdTc2ODRcdTY2RjRcdTY1MzkgXHVEODNDXHVERjg5JyxcbiAgJ3Jldmlldy5sb2FkRXJyb3InOiAnXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnXHU1MTY4XHU5MEU4XHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRBbGwnOiAnXHU1MTY4XHU5MEU4XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy51bnN0YWdlJzogJ1x1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcudW5zdGFnZUFsbCc6ICdcdTUxNjhcdTkwRThcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5zdGFnZSc6ICdcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5yZXZlcnQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ2h1bmsudW5zdGFnZSc6ICdcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5zdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsudW5zdGFnZWQnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0JzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29uZmlybVJldmVydEFsbCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmNvbW1pdCc6ICdcdTYzRDBcdTRFQTQnLFxuICAncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJzogJ1x1NjNEMFx1NEVBNFx1OEJGNFx1NjYwRVx1MjAyNicsXG4gICdyZXZpZXcucHVzaCc6ICdcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LmNvbmZpcm1QdXNoJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29tbWl0dGVkJzogJ1x1NURGMlx1NjNEMFx1NEVBNCB7c3VtbWFyeX0nLFxuICAncmV2aWV3LmNvbW1pdEZhaWxlZCc6ICdcdTYzRDBcdTRFQTRcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnB1c2hlZCc6ICdcdTVERjJcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LnB1c2hGYWlsZWQnOiAnXHU2M0E4XHU5MDAxXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5haGVhZCc6ICdcdTk4ODZcdTUxNDgge259JyxcbiAgJ3Jldmlldy5iZWhpbmQnOiAnXHU4NDNEXHU1NDBFIHtufScsXG4gICdyZXZpZXcuc2VjdGlvblN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkJyYW5jaCc6ICdcdTUyMDZcdTY1MkZcdTRFMEVcdThGRENcdTdBMEInLFxuICAncmV2aWV3Lm5vVXBzdHJlYW0nOiAnXHU2NzJBXHU4QkJFXHU3RjZFXHU0RTBBXHU2RTM4XHU1MjA2XHU2NTJGJyxcbiAgJ3Jldmlldy5oaXN0b3J5JzogJ1x1NTM4Nlx1NTNGMicsXG4gICdyZXZpZXcuY29tbWl0RmlsZXMnOiAnXHU1M0Q4XHU1MkE4XHU2NTg3XHU0RUY2JyxcbiAgJ2hpc3RvcnkubG9jYWwnOiAnXHU2NzJDXHU1NzMwJyxcbiAgJ2hpc3RvcnkucmVtb3RlJzogJ1x1OEZEQ1x1N0EwQicsXG4gICd0aW1lLm5vdyc6ICdcdTUyMUFcdTUyMUEnLFxuICAndGltZS5taW51dGVzJzogJ3tufSBcdTUyMDZcdTk0OUZcdTUyNEQnLFxuICAndGltZS5ob3Vycyc6ICd7bn0gXHU1QzBGXHU2NUY2XHU1MjREJyxcbiAgJ3RpbWUuZGF5cyc6ICd7bn0gXHU1OTI5XHU1MjREJyxcbiAgJ3Jldmlldy5yZWZyZXNoJzogJ1x1NTIzN1x1NjVCMCcsXG4gICdyZXZpZXcuY2xvc2UnOiAnXHU1MTczXHU5NUVEJyxcbiAgJ3Jldmlldy5idXN5JzogJ1x1NTkwNFx1NzQwNlx1NEUyRFx1MjAyNicsXG4gICdyZXZpZXcuZG9uZSc6ICdcdTVERjJ7YWN0aW9ufSB7Y291bnR9IFx1NEUyQVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcuZG9uZU9uZSc6ICdcdTVERjJ7YWN0aW9ufSB7cGF0aH0nLFxuICAncmV2aWV3LmRvbmVEZWxldGVkJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2XHVGRjA4XHU1MjIwXHU5NjY0IHtkZWxldGVkfSBcdTRFMkFcdTY3MkFcdThEREZcdThFMkFcdTY1ODdcdTRFRjZcdUZGMDknLFxuICAncmV2aWV3LmFjY2VwdGVkJzogJ1x1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0ZWQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy51bnRyYWNrZWQnOiAnXHU2NzJBXHU4RERGXHU4RTJBJyxcbiAgJ3Jldmlldy5iaW5hcnknOiAnXHU0RThDXHU4RkRCXHU1MjM2JyxcbiAgJ3Jldmlldy5ub0RpZmZEYXRhJzogJ1x1OEJFNVx1NEZFRVx1NjUzOVx1NkNBMVx1NjcwOSBkaWZmIFx1NjU3MFx1NjM2RScsXG4gICdyZXZpZXcuY2hhbmdlcyc6ICd7YWRkZWR9KyB7ZGVsZXRlZH0tJyxcbiAgJ3ZpZXcuc2luZ2xlJzogJ1x1NTM1NVx1NjgwRicsXG4gICd2aWV3LnNwbGl0JzogJ1x1NTNDQ1x1NjgwRicsXG4gICd2aWV3LmJlZm9yZSc6ICdcdTUzOUZcdTY1ODdcdTRFRjYnLFxuICAndmlldy5hZnRlcic6ICdcdTY1QjBcdTY1ODdcdTRFRjYnLFxuICAnY29tbWVudC5hZGQnOiAnXHU4QkM0XHU4QkJBXHU2QjY0XHU4ODRDJyxcbiAgJ2NvbW1lbnQuc2hvdyc6ICdcdTY3RTVcdTc3MEJcdThCQzRcdThCQkEnLFxuICAnY29tbWVudC5wbGFjZWhvbGRlcic6ICdcdThCQzRcdThCQkFcdTIwMjZcdUZGMDhDdHJsL1x1MjMxOCtFbnRlciBcdTRGRERcdTVCNThcdUZGMDknLFxuICAnY29tbWVudC5zYXZlJzogJ1x1NEZERFx1NUI1OCcsXG4gICdjb21tZW50LmNhbmNlbCc6ICdcdTUzRDZcdTZEODgnLFxuICAnY29tbWVudC5kZWxldGUnOiAnXHU1MjIwXHU5NjY0JyxcbiAgJ2NvbW1lbnQuc2F2ZWQnOiAnXHU1REYyXHU0RkREXHU1QjU4XHU4QkM0XHU4QkJBJyxcbiAgJ2NvbW1lbnQuZmFpbGVkJzogJ1x1OEJDNFx1OEJCQVx1NEZERFx1NUI1OFx1NTkzMVx1OEQyNScsXG4gICdzY29wZS5sYWJlbCc6ICdcdTgzMDNcdTU2RjQnLFxuICAnc2NvcGUuYWxsJzogJ1x1NTE2OFx1OTBFOCcsXG4gICdzY29wZS51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAnc2NvcGUuc3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdzY29wZS5jb21taXQnOiAnXHU2M0QwXHU0RUE0JyxcbiAgJ3Njb3BlLmJyYW5jaCc6ICdcdTUyMDZcdTY1MkYnLFxuICAnc2NvcGUubGFzdC10dXJuJzogJ1x1NjcwMFx1NTQwRVx1NEUwMFx1OEY2RScsXG4gICdyZXZpZXcubGFzdFR1cm5FbXB0eSc6ICdcdTY3MDBcdTU0MEVcdTRFMDBcdThGNkVcdTZDQTFcdTY3MDlcdThCQjBcdTVGNTVcdTUyMzBcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzkgXHUyMDE0XHUyMDE0IFx1N0VDOFx1N0FFRlx1NTQ3RFx1NEVFNFx1RkYwOGJhc2hcdUZGMDlcdTY1MzlcdTY1ODdcdTRFRjZcdTRFMERcdTRGMUFcdThCQTFcdTUxNjVcdTRGMUFcdThCRERcdThCQjBcdTVGNTVcdUZGMUJcdTUzRUZcdTUyMDdcdTUyMzBcdTMwMENcdTUxNjhcdTkwRThcdTMwMERcdTY3RTVcdTc3MEIgZ2l0IFx1NTNEOFx1NjZGNCcsXG4gICdzY29wZS5iYXNlJzogJ1x1NTdGQVx1N0VCRlx1NTIwNlx1NjUyRicsXG4gICdzY29wZS5icmFuY2hSZWFkb25seSc6ICdcdTUyMDZcdTY1MkZcdTgzMDNcdTU2RjRcdTUzRUFcdThCRkJcdUZGMDhcdTVCRjlcdTZCRDQgbWVyZ2UtYmFzZVx1RkYwQ1x1NEUwRFx1NjNEMFx1NEY5Qlx1OTFDN1x1N0VCMy9cdTRFMjJcdTVGMDNcdUZGMDknLFxuICAncmV2aWV3LnNlbGVjdENvbW1pdCc6ICdcdTRFQ0VcdTVERTZcdTRGQTdcdTkwMDlcdTYyRTlcdTYzRDBcdTRFQTRcdTY3RTVcdTc3MEIgZGlmZicsXG4gICdyZXZpZXcuc2VuZFRvQWdlbnQnOiAnXHU1M0QxXHU5MDAxXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW5kVGl0bGUnOiAnXHU1M0QxXHU5MDAxXHU4ODRDXHU1MTg1XHU4QkM0XHU4QkJBXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW5kSGludCc6ICdcdThCQzRcdThCQkFcdTRGMUFcdTRGNUNcdTRFM0FcdThCQzRcdTVCQTFcdTYzMDdcdTVGMTVcdTZDRThcdTUxNjVcdTVGNTNcdTUyNERcdTRGMUFcdThCRERcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMDlcdTMwMDJcdTUzRDFcdTkwMDFcdTU5MzFcdThEMjVcdTY1RjZcdTkwMDBcdTUzMTZcdTRFM0FcdTU5MERcdTUyMzZcdTY1ODdcdTY3MkNcdTMwMDInLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1x1NURGMlx1NTNEMVx1OTAwMVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuY29weSc6ICdcdTU5MERcdTUyMzZcdTY1ODdcdTY3MkMnLFxuICAncmV2aWV3LmNvcGllZCc6ICdcdTVERjJcdTU5MERcdTUyMzYnLFxuICAncmV2aWV3LmNvcHlGYWlsZWQnOiAnXHU1OTBEXHU1MjM2XHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnXHU4QkM0XHU1QkExJyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnXHU4QkM0XHU1QkExXHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnXHU4QkM0XHU1QkExXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCc6ICdcdTg4NjVcdTRFMDFcdTZCNjNcdTc4NkUgXHUyNzEzJyxcbiAgJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JzogJ1x1ODg2NVx1NEUwMVx1NUI1OFx1NTcyOFx1OTVFRVx1OTg5OCBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnXHU2Q0ExXHU2NzA5XHU1M0QxXHU3M0IwXHU5NUVFXHU5ODk4JyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gXHU2NzYxXHU1M0QxXHU3M0IwJyxcbiAgJ3Jldmlldy5jb25maWRlbmNlJzogJ1x1N0Y2RVx1NEZFMVx1NUVBNiB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnXHU1RUZBXHU4QkFFJyxcbiAgJ3Jldmlldy5zZW5kRmluZGluZ3MnOiAnXHU1M0QxXHU5MDAxXHU1M0QxXHU3M0IwXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW50RmluZGluZ3MnOiAnXHU1REYyXHU1M0QxXHU5MDAxXHU1M0QxXHU3M0IwXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdcdThCQzRcdTVCQTFcdTgzMDNcdTU2RjQnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIFx1OEJDNFx1OEJCQSAoe259KScsXG4gICdwci5ub1ByJzogJ1x1NjVFMFx1NTE3M1x1ODA1NCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnXHU1M0QxXHU5MDAxIFBSIFx1OEJDNFx1OEJCQVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnXHU1NzI4XHU3RjE2XHU4RjkxXHU1NjY4XHU0RTJEXHU2MjUzXHU1RjAwJyxcbiAgJ2VkaXRvci5vcGVuTGluZSc6ICdcdTU3MjhcdTdGMTZcdThGOTFcdTU2NjhcdTRFMkRcdTYyNTNcdTVGMDBcdThCRTVcdTg4NEMnLFxuICAnZWRpdG9yLmZhaWxlZCc6ICdcdTYyNTNcdTVGMDBcdTU5MzFcdThEMjUnLFxuICAncmVwby5sYWJlbCc6ICdcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3LmRvY2tDb21tZW50cyc6ICdcdTg4NENcdTUxODVcdThCQzRcdThCQkEge259IFx1Njc2MScsXG4gICdyZXZpZXcuZG9ja0p1bXAnOiAnXHU3MEI5XHU1MUZCXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU2MjUzXHU1RjAwXHU1QkY5XHU1RTk0XHU1M0Q4XHU2NkY0JyxcbiAgJ3Jldmlldy5kb2NrSGludCc6ICdcdTUzRDFcdTkwMDFcdTZEODhcdTYwNkZcdTY1RjZcdTgxRUFcdTUyQThcdTk2NDRcdTVFMjYnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnXHU1QjU3XHU0RjUzJyxcbiAgJ3NldHRpbmdzLnNpemUnOiAnXHU1QjU3XHU1M0Y3JyxcbiAgJ2NvbmZpZy50aXRsZSc6ICdcdTkxNERcdTdGNkUnLFxuICAnZm9udC5tb25vJzogJ1x1N0I0OVx1NUJCRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYwOScsXG4gICdmb250LnN5c3RlbSc6ICdcdTdDRkJcdTdFREZcdTVCNTdcdTRGNTMnLFxufSBhcyBjb25zdFxuXG4vKiogRW5nbGlzaCBkaWN0aW9uYXJ5LCBjaGVja2VkIGNvbXBsZXRlIGFnYWluc3QgdGhlIHpoIGtleSBzZXQuICovXG5jb25zdCBlbjogUmVjb3JkPGtleW9mIHR5cGVvZiB6aCwgc3RyaW5nPiA9IHtcbiAgJ2FjdGlvbi5sYWJlbCc6ICdDaGFuZ2VzJyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1JldmlldyB3b3Jrc3BhY2UgYW5kIHBlci1yb3VuZCBjaGFuZ2VzJyxcbiAgJ3RhYi5zZXNzaW9uJzogJ1Nlc3Npb24nLFxuICAndGFiLndvcmtzcGFjZSc6ICdXb3Jrc3BhY2UnLFxuICAncmV2aWV3LnRpdGxlJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdicmFuY2gnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ2RldGFjaGVkIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnVGhpcyBkaXJlY3RvcnkgaXMgbm90IGEgZ2l0IHJlcG9zaXRvcnknLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1RoZSBcIlNlc3Npb25cIiB0YWIgc3RpbGwgc2hvd3MgZXZlcnkgcm91bmRcXCdzIGNoYW5nZXMuJyxcbiAgJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBpbiB0aGlzIHNlc3Npb24geWV0JyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gcm91bmRzIFx1MDBCNyB7ZmlsZXN9IGZpbGVzJyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdSb3VuZCB7cm91bmR9JyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdObyB1bmNvbW1pdHRlZCBjaGFuZ2VzIFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ0ZhaWxlZCB0byBsb2FkJyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnQWNjZXB0JyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnQWNjZXB0IGFsbCcsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1JldmVydCBhbGwnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnVW5zdGFnZScsXG4gICdyZXZpZXcudW5zdGFnZUFsbCc6ICdVbnN0YWdlIGFsbCcsXG4gICdodW5rLnN0YWdlJzogJ1N0YWdlJyxcbiAgJ2h1bmsucmV2ZXJ0JzogJ1JldmVydCcsXG4gICdodW5rLnVuc3RhZ2UnOiAnVW5zdGFnZScsXG4gICdodW5rLnN0YWdlZCc6ICdzdGFnZWQnLFxuICAnaHVuay51bnN0YWdlZCc6ICd1bnN0YWdlZCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHJldmVydCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydEFsbCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHJldmVydCBhbGwnLFxuICAncmV2aWV3LmNvbW1pdCc6ICdDb21taXQnLFxuICAncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJzogJ0NvbW1pdCBtZXNzYWdlXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1B1c2gnLFxuICAncmV2aWV3LmNvbmZpcm1QdXNoJzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcHVzaCcsXG4gICdyZXZpZXcuY29tbWl0dGVkJzogJ0NvbW1pdHRlZCB7c3VtbWFyeX0nLFxuICAncmV2aWV3LmNvbW1pdEZhaWxlZCc6ICdDb21taXQgZmFpbGVkJyxcbiAgJ3Jldmlldy5wdXNoZWQnOiAnUHVzaGVkJyxcbiAgJ3Jldmlldy5wdXNoRmFpbGVkJzogJ1B1c2ggZmFpbGVkJyxcbiAgJ3Jldmlldy5haGVhZCc6ICd7bn0gYWhlYWQnLFxuICAncmV2aWV3LmJlaGluZCc6ICd7bn0gYmVoaW5kJyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1N0YWdlZCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnQ2hhbmdlcycsXG4gICdyZXZpZXcuc2VjdGlvbkJyYW5jaCc6ICdCcmFuY2ggdnMgcmVtb3RlJyxcbiAgJ3Jldmlldy5ub1Vwc3RyZWFtJzogJ25vIHVwc3RyZWFtJyxcbiAgJ3Jldmlldy5oaXN0b3J5JzogJ0hpc3RvcnknLFxuICAncmV2aWV3LmNvbW1pdEZpbGVzJzogJ0ZpbGVzJyxcbiAgJ2hpc3RvcnkubG9jYWwnOiAnbG9jYWwnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAncmVtb3RlJyxcbiAgJ3RpbWUubm93JzogJ2p1c3Qgbm93JyxcbiAgJ3RpbWUubWludXRlcyc6ICd7bn0gbWluIGFnbycsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBoIGFnbycsXG4gICd0aW1lLmRheXMnOiAne259IGQgYWdvJyxcbiAgJ3Jldmlldy5yZWZyZXNoJzogJ1JlZnJlc2gnLFxuICAncmV2aWV3LmNsb3NlJzogJ0Nsb3NlJyxcbiAgJ3Jldmlldy5idXN5JzogJ1dvcmtpbmdcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcycsXG4gICdyZXZpZXcuZG9uZU9uZSc6ICd7YWN0aW9ufSB7cGF0aH0nLFxuICAncmV2aWV3LmRvbmVEZWxldGVkJzogJ3thY3Rpb259IHtjb3VudH0gZmlsZXMgKHtkZWxldGVkfSB1bnRyYWNrZWQgZGVsZXRlZCknLFxuICAncmV2aWV3LmFjY2VwdGVkJzogJ0FjY2VwdGVkJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdSZXZlcnRlZCcsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ3VudHJhY2tlZCcsXG4gICdyZXZpZXcuYmluYXJ5JzogJ2JpbmFyeScsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdObyBkaWZmIGRhdGEgZm9yIHRoaXMgY2hhbmdlJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnU2luZ2xlJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnU3BsaXQnLFxuICAndmlldy5iZWZvcmUnOiAnQmVmb3JlJyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnQWZ0ZXInLFxuICAnY29tbWVudC5hZGQnOiAnQ29tbWVudCBvbiB0aGlzIGxpbmUnLFxuICAnY29tbWVudC5zaG93JzogJ1ZpZXcgY29tbWVudHMnLFxuICAnY29tbWVudC5wbGFjZWhvbGRlcic6ICdDb21tZW50XHUyMDI2IChDdHJsL1x1MjMxOCtFbnRlciB0byBzYXZlKScsXG4gICdjb21tZW50LnNhdmUnOiAnU2F2ZScsXG4gICdjb21tZW50LmNhbmNlbCc6ICdDYW5jZWwnLFxuICAnY29tbWVudC5kZWxldGUnOiAnRGVsZXRlJyxcbiAgJ2NvbW1lbnQuc2F2ZWQnOiAnQ29tbWVudCBzYXZlZCcsXG4gICdjb21tZW50LmZhaWxlZCc6ICdGYWlsZWQgdG8gc2F2ZSBjb21tZW50JyxcbiAgJ3Njb3BlLmxhYmVsJzogJ1Njb3BlJyxcbiAgJ3Njb3BlLmFsbCc6ICdBbGwnLFxuICAnc2NvcGUudW5zdGFnZWQnOiAnVW5zdGFnZWQnLFxuICAnc2NvcGUuc3RhZ2VkJzogJ1N0YWdlZCcsXG4gICdzY29wZS5jb21taXQnOiAnQ29tbWl0JyxcbiAgJ3Njb3BlLmJyYW5jaCc6ICdCcmFuY2gnLFxuICAnc2NvcGUubGFzdC10dXJuJzogJ0xhc3QgdHVybicsXG4gICdyZXZpZXcubGFzdFR1cm5FbXB0eSc6ICdObyBmaWxlIGNoYW5nZXMgcmVjb3JkZWQgZm9yIHRoZSBsYXN0IHR1cm4gXHUyMDE0IHRlcm1pbmFsIGNvbW1hbmRzIChiYXNoKSB0aGF0IGVkaXQgZmlsZXMgYXJlIG5vdCB0cmFja2VkIGluIHRoZSBzZXNzaW9uIGxvZzsgc3dpdGNoIHRvIFwiQWxsXCIgdG8gc2VlIGdpdCBjaGFuZ2VzJyxcbiAgJ3Njb3BlLmJhc2UnOiAnQmFzZSBicmFuY2gnLFxuICAnc2NvcGUuYnJhbmNoUmVhZG9ubHknOiAnQnJhbmNoIHNjb3BlIGlzIHJlYWQtb25seSAobWVyZ2UtYmFzZSBkaWZmOyBubyBhY2NlcHQvcmV2ZXJ0KScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1NlbGVjdCBhIGNvbW1pdCBmcm9tIHRoZSBsZWZ0IHRvIHZpZXcgaXRzIGRpZmYnLFxuICAncmV2aWV3LnNlbmRUb0FnZW50JzogJ1NlbmQgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdTZW5kIGlubGluZSBjb21tZW50cyB0byB0aGUgYWdlbnQnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ0NvbW1lbnRzIGFyZSBpbmplY3RlZCBpbnRvIHRoZSBjdXJyZW50IHNlc3Npb24gYXMgcmV2aWV3IGd1aWRhbmNlIChBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHMpLiBGYWxscyBiYWNrIHRvIGNvcHlhYmxlIHRleHQgaWYgc2VuZGluZyBmYWlscy4nLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1NlbnQgdG8gYWdlbnQnLFxuICAncmV2aWV3LmNvcHknOiAnQ29weSB0ZXh0JyxcbiAgJ3Jldmlldy5jb3BpZWQnOiAnQ29waWVkJyxcbiAgJ3Jldmlldy5jb3B5RmFpbGVkJzogJ0NvcHkgZmFpbGVkJyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnUmV2aWV3JyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnUmV2aWV3aW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnUmV2aWV3IGZhaWxlZCcsXG4gICdyZXZpZXcudmVyZGljdENvcnJlY3QnOiAnUGF0Y2ggaXMgY29ycmVjdCBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnUGF0Y2ggbmVlZHMgd29yayBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnTm8gaXNzdWVzIGZvdW5kJyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gZmluZGluZ3MnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnY29uZmlkZW5jZSB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnU3VnZ2VzdGlvbicsXG4gICdyZXZpZXcuc2VuZEZpbmRpbmdzJzogJ1NlbmQgZmluZGluZ3MgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdGaW5kaW5ncyBzZW50IHRvIGFnZW50JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdSZXZpZXcgc2NvcGUnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIGNvbW1lbnRzICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnTm8gYXNzb2NpYXRlZCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnU2VuZCBQUiBjb21tZW50cyB0byBhZ2VudCcsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnT3BlbiBpbiBlZGl0b3InLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ09wZW4gdGhpcyBsaW5lIGluIGVkaXRvcicsXG4gICdlZGl0b3IuZmFpbGVkJzogJ0ZhaWxlZCB0byBvcGVuJyxcbiAgJ3JlcG8ubGFiZWwnOiAnUmVwbycsXG4gICdyZXZpZXcuZG9ja0NvbW1lbnRzJzogJ3tufSBpbmxpbmUgY29tbWVudHMnLFxuICAncmV2aWV3LmRvY2tKdW1wJzogJ09wZW4gdGhlIG1hdGNoaW5nIGNoYW5nZSBpbiB0aGUgcmV2aWV3IHBhbmVsJyxcbiAgJ3Jldmlldy5kb2NrSGludCc6ICdBdXRvLWNhcnJpZWQgd2l0aCB5b3VyIG5leHQgbWVzc2FnZScsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnRm9udCcsXG4gICdzZXR0aW5ncy5zaXplJzogJ0ZvbnQgc2l6ZScsXG4gICdjb25maWcudGl0bGUnOiAnQ29uZmlndXJhdGlvbicsXG4gICdmb250Lm1vbm8nOiAnTW9ub3NwYWNlIChkZWZhdWx0KScsXG4gICdmb250LnN5c3RlbSc6ICdTeXN0ZW0gZm9udCcsXG59XG5cbnR5cGUgRGlmZlJldmlld0FjdGlvblByb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucyc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5cbnR5cGUgRGlmZlJldmlld092ZXJsYXlQcm9wcyA9IFByb3BzUnVudGltZTwnc2hlbGwub3ZlcmxheSc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7IHNlc3Npb25zOiBJU2Vzc2lvbnMgfVxuXG4vKiogRGlmZiBpY29uIChsdWNpZGUgZmlsZS1kaWZmKS4gKi9cbmZ1bmN0aW9uIEljb25EaWZmKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWN1pcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDEwaDZcIiAvPlxuICAgICAgPHBhdGggZD1cIk0xMiA3djZcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDE3aDZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25YKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xOCA2IDYgMThcIiAvPlxuICAgICAgPHBhdGggZD1cIm02IDYgMTIgMTJcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25Db21tZW50KCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMSAxNWEyIDIgMCAwIDEtMiAySDdsLTQgNFY1YTIgMiAwIDAgMSAyLTJoMTRhMiAyIDAgMCAxIDIgMnpcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGV2cm9uRG93bigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJtNiA5IDYgNiA2LTZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGVjaygpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMi41XCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMCA2IDkgMTdsLTUtNVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxudHlwZSBWaWV3TW9kZSA9ICdzaW5nbGUnIHwgJ3NwbGl0J1xuXG4vKiogXHU1MzU1XHU2ODBGIC8gXHU1M0NDXHU2ODBGIHNlZ21lbnRlZCB0b2dnbGUgKHBlcnNpc3RlZCBhY3Jvc3Mgb3BlbnMpLiAqL1xuZnVuY3Rpb24gRGlmZlZpZXdUb2dnbGUoeyB2aWV3LCBvbkNoYW5nZSwgdCB9OiB7IHZpZXc6IFZpZXdNb2RlOyBvbkNoYW5nZTogKHY6IFZpZXdNb2RlKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci12aWV3LXRvZ2dsZVwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9e3QoJ3ZpZXcuc2luZ2xlJyl9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NpbmdsZScgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NpbmdsZSd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKCdzaW5nbGUnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc2luZ2xlJyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRzZHItdmlldy1idG4ke3ZpZXcgPT09ICdzcGxpdCcgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NwbGl0J31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NwbGl0Jyl9XG4gICAgICA+XG4gICAgICAgIHt0KCd2aWV3LnNwbGl0Jyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVHdvLWNvbHVtbiBzaWRlLWJ5LXNpZGUgZGlmZiBib2R5IChvbGQgbGVmdCwgbmV3IHJpZ2h0LCBsaW5lIG51bWJlcnMgYWxpZ25lZCkuICovXG5mdW5jdGlvbiBTcGxpdERpZmYoeyBibG9ja3MsIGJlZm9yZUxhYmVsLCBhZnRlckxhYmVsIH06IHsgYmxvY2tzOiBTcGxpdEJsb2NrW107IGJlZm9yZUxhYmVsOiBzdHJpbmc7IGFmdGVyTGFiZWw6IHN0cmluZyB9KSB7XG4gIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPntiZWZvcmVMYWJlbH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPnthZnRlckxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICA8ZGl2IGtleT17Yml9PlxuICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IChcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e3JpfSBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5sZWZ0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogUGVyLWh1bmsgYWN0aW9uIGJhciAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KSBmb3Igd29ya3NwYWNlIGRpZmZzLiAqL1xuZnVuY3Rpb24gSHVua1Rvb2xiYXIoe1xuICBodW5rLFxuICBidXN5LFxuICBvbkFjdGlvbixcbiAgdCxcbn06IHtcbiAgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuayB8IHVuZGVmaW5lZFxuICBidXN5OiBib29sZWFuXG4gIG9uQWN0aW9uOiAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICBpZiAoIWh1bmspIHJldHVybiBudWxsXG4gIGNvbnN0IHN0YWdlZCA9IGh1bmsubGF5ZXIgPT09ICdzdGFnZWQnXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWh1bmstYmFyXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWh1bmstbGF5ZXJcIj57c3RhZ2VkID8gdCgnaHVuay5zdGFnZWQnKSA6IHQoJ2h1bmsudW5zdGFnZWQnKX08L3NwYW4+XG4gICAgICB7c3RhZ2VkID8gKFxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigndW5zdGFnZScsIGh1bmspfT5cbiAgICAgICAgICB7dCgnaHVuay51bnN0YWdlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IChcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbignYWNjZXB0JywgaHVuayl9PlxuICAgICAgICAgIHt0KCdodW5rLnN0YWdlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKX1cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigncmV2ZXJ0JywgaHVuayl9PlxuICAgICAgICB7dCgnaHVuay5yZXZlcnQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgcm93cyB3aXRoIG9sZC9uZXcgbGluZSBudW1iZXJzIHRyYWNrZWQgdGhyb3VnaCBodW5rcy4gKi9cbmZ1bmN0aW9uIHVuaWZpZWRSb3dzV2l0aExpbmVzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSB7XG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICByZXR1cm4gcm93cy5tYXAoKHJvdykgPT4ge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBuZXdMaW5lKysgfVxuICAgIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbmV3TGluZSsrIH1cbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbnVsbCB9XG4gICAgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBudWxsIH1cbiAgfSlcbn1cblxuLyoqIE1hdGNoIGEgY29tbWVudCBhZ2FpbnN0IGEgcm93J3MgYW5jaG9ycyAoYm90aCBtdXN0IGFncmVlIHdoZW4gc2V0KS4gKi9cbmZ1bmN0aW9uIGNvbW1lbnRNYXRjaGVzKGNvbW1lbnQ6IFJldmlld0NvbW1lbnQsIG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBib29sZWFuIHtcbiAgaWYgKGNvbW1lbnQubGluZU5ldyAhPT0gbnVsbCAmJiBjb21tZW50LmxpbmVOZXcgIT09IG5ld0xpbmUpIHJldHVybiBmYWxzZVxuICBpZiAoY29tbWVudC5saW5lT2xkICE9PSBudWxsICYmIGNvbW1lbnQubGluZU9sZCAhPT0gb2xkTGluZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB0cnVlXG59XG5cbi8qKiBIb3Zlci10by1jb21tZW50IGFmZm9yZGFuY2UgKyBjb21tZW50IG1hcmtlciBmb3Igb25lIGRpZmYgbGluZS4gKi9cbmZ1bmN0aW9uIENvbW1lbnRMaW5lKHtcbiAgY291bnQsXG4gIG9wZW4sXG4gIG9uT3BlbixcbiAgb25Ub2dnbGUsXG4gIHQsXG59OiB7XG4gIGNvdW50OiBudW1iZXJcbiAgb3BlbjogYm9vbGVhblxuICBvbk9wZW46ICgpID0+IHZvaWRcbiAgb25Ub2dnbGU6ICgpID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLWNvbW1lbnQtYWRkJHtjb3VudCA+IDAgPyAnIGRzZHItY29tbWVudC1oYXMnIDogJyd9YH1cbiAgICAgIHRpdGxlPXtjb3VudCA+IDAgPyB0KCdjb21tZW50LnNob3cnKSA6IHQoJ2NvbW1lbnQuYWRkJyl9XG4gICAgICBhcmlhLWxhYmVsPXtjb3VudCA+IDAgPyB0KCdjb21tZW50LnNob3cnKSA6IHQoJ2NvbW1lbnQuYWRkJyl9XG4gICAgICBvbkNsaWNrPXtjb3VudCA+IDAgPyBvblRvZ2dsZSA6IG9uT3Blbn1cbiAgICA+XG4gICAgICB7Y291bnQgPiAwID8gY291bnQgOiAnKyd9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLyoqIFRoZSBpbmxpbmUgY29tbWVudCBlZGl0b3IsIHJlbmRlcmVkIGFzIGl0cyBvd24gcm93LiAqL1xuZnVuY3Rpb24gQ29tbWVudEVkaXRvcih7XG4gIHRleHQsXG4gIG9uVGV4dCxcbiAgb25TYXZlLFxuICBvbkNhbmNlbCxcbiAgYnVzeSxcbiAgdCxcbn06IHtcbiAgdGV4dDogc3RyaW5nXG4gIG9uVGV4dDogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvblNhdmU6ICgpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgYnVzeTogYm9vbGVhblxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1lZGl0b3JcIj5cbiAgICAgIDx0ZXh0YXJlYVxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaW5wdXRcIlxuICAgICAgICB2YWx1ZT17dGV4dH1cbiAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgIHJvd3M9ezJ9XG4gICAgICAgIHBsYWNlaG9sZGVyPXt0KCdjb21tZW50LnBsYWNlaG9sZGVyJyl9XG4gICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uVGV4dChldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICBvbktleURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBvbkNhbmNlbCgpXG4gICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSkgb25TYXZlKClcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCAhdGV4dC50cmltKCl9IG9uQ2xpY2s9e29uU2F2ZX0+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuc2F2ZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17b25DYW5jZWx9PlxuICAgICAgICAgIHt0KCdjb21tZW50LmNhbmNlbCcpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgd2l0aCBwZXItaHVuayBhY3Rpb24gYmFycyBhbmQgaW5saW5lIGNvbW1lbnRzICh3b3Jrc3BhY2UgZmlsZXMpLiAqL1xuZnVuY3Rpb24gVW5pZmllZERpZmYoe1xuICBkaWZmLFxuICBodW5rcyxcbiAgYnVzeSxcbiAgb25IdW5rQWN0aW9uLFxuICB0LFxuICBjb21tZW50cyxcbiAgY29tbWVudEVkaXRvcixcbiAgY29tbWVudFRleHQsXG4gIG9uQ29tbWVudFRleHQsXG4gIG9uT3BlbkNvbW1lbnQsXG4gIG9uU2F2ZUNvbW1lbnQsXG4gIG9uQ2FuY2VsQ29tbWVudCxcbiAgY29tbWVudFBvcG92ZXIsXG4gIG9uVG9nZ2xlUG9wb3ZlcixcbiAgb25EZWxldGVDb21tZW50LFxuICByZWFkT25seSxcbiAgcGF0aCxcbiAgcmV2aWV3RmluZGluZ3MsXG4gIG9uT3BlbkxpbmUsXG4gIGp1bXBMaW5lLFxufToge1xuICBkaWZmOiBzdHJpbmdcbiAgaHVua3M6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmtbXVxuICBidXN5OiBib29sZWFuXG4gIG9uSHVua0FjdGlvbjogKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuaykgPT4gdm9pZFxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbiAgY29tbWVudHM/OiBSZXZpZXdDb21tZW50W11cbiAgY29tbWVudEVkaXRvcj86IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbFxuICBjb21tZW50VGV4dD86IHN0cmluZ1xuICBvbkNvbW1lbnRUZXh0PzogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvbk9wZW5Db21tZW50PzogKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpID0+IHZvaWRcbiAgb25TYXZlQ29tbWVudD86ICgpID0+IHZvaWRcbiAgb25DYW5jZWxDb21tZW50PzogKCkgPT4gdm9pZFxuICBjb21tZW50UG9wb3Zlcj86IHN0cmluZyB8IG51bGxcbiAgb25Ub2dnbGVQb3BvdmVyPzogKGtleTogc3RyaW5nKSA9PiB2b2lkXG4gIG9uRGVsZXRlQ29tbWVudD86IChpZDogc3RyaW5nKSA9PiB2b2lkXG4gIC8qKiBIaWRlIHBlci1odW5rIGFjdGlvbiBiYXJzIChicmFuY2ggc2NvcGUgaXMgYSByZWFkLW9ubHkgZGlmZikuICovXG4gIHJlYWRPbmx5PzogYm9vbGVhblxuICAvKiogUmVwby1yZWxhdGl2ZSBmaWxlIHBhdGggKGZvciBvcGVuLWluLWVkaXRvciBhbmQgbWFya2VycykuICovXG4gIHBhdGg/OiBzdHJpbmdcbiAgLyoqIEFJLXJldmlldyBmaW5kaW5ncyB0byBtYXJrIG9uIG1hdGNoaW5nIGxpbmVzLiAqL1xuICByZXZpZXdGaW5kaW5ncz86IFJldmlld0ZpbmRpbmdbXVxuICAvKiogT3BlbiB0aGUgZmlsZSBhdCBhIGxpbmUgaW4gdGhlIHVzZXIncyBlZGl0b3IuICovXG4gIG9uT3BlbkxpbmU/OiAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IHZvaWRcbiAgLyoqIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoZS5nLiBqdW1wIGZyb20gYSBQUiBjb21tZW50KS4gKi9cbiAganVtcExpbmU/OiBudW1iZXIgfCBudWxsXG59KSB7XG4gIGNvbnN0IGJsb2NrcyA9IHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gIGxldCBodW5rSW5kZXggPSAwXG4gIGNvbnN0IGVkaXRpbmdLZXkgPSBjb21tZW50RWRpdG9yID8gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgOiBudWxsXG4gIGNvbnN0IGZpbmRpbmdzRm9yID0gKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBSZXZpZXdGaW5kaW5nW10gPT4ge1xuICAgIGlmICghcGF0aCB8fCAhcmV2aWV3RmluZGluZ3MgfHwgcmV2aWV3RmluZGluZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgICByZXR1cm4gcmV2aWV3RmluZGluZ3MuZmlsdGVyKChmKSA9PiB7XG4gICAgICBpZiAoZi5maWxlICE9PSBwYXRoKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChuZXdMaW5lICE9PSBudWxsKSByZXR1cm4gbmV3TGluZSA+PSBmLmxpbmVTdGFydCAmJiBuZXdMaW5lIDw9IGYubGluZUVuZFxuICAgICAgcmV0dXJuIG9sZExpbmUgIT09IG51bGwgJiYgb2xkTGluZSA+PSBmLmxpbmVTdGFydCAmJiBvbGRMaW5lIDw9IGYubGluZUVuZFxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzSHVuayA9IGJsb2NrLmhlYWQ/LmtpbmQgPT09ICdodW5rJ1xuICAgICAgICAgIGNvbnN0IGh1bmsgPSBpc0h1bmsgPyBodW5rc1todW5rSW5kZXgrK10gOiB1bmRlZmluZWRcbiAgICAgICAgICBjb25zdCBzdGFydHMgPSBibG9jay5oZWFkPy5raW5kID09PSAnaHVuaycgPyBodW5rU3RhcnRzKGJsb2NrLmhlYWQudGV4dCkgOiB7IG9sZFN0YXJ0OiAxLCBuZXdTdGFydDogMSB9XG4gICAgICAgICAgY29uc3Qgcm93cyA9IGlzSHVuayA/IHVuaWZpZWRSb3dzV2l0aExpbmVzKGJsb2NrLnJvd3MsIHN0YXJ0cy5vbGRTdGFydCwgc3RhcnRzLm5ld1N0YXJ0KSA6IFtdXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2JpfT5cbiAgICAgICAgICAgICAge2lzSHVuayAmJiAhcmVhZE9ubHkgPyA8SHVua1Rvb2xiYXIgaHVuaz17aHVua30gYnVzeT17YnVzeX0gb25BY3Rpb249e29uSHVua0FjdGlvbn0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke2Jsb2NrLmhlYWQua2luZH1gfT57YmxvY2suaGVhZC50ZXh0IHx8ICcgJ308L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICB7aXNIdW5rXG4gICAgICAgICAgICAgICAgPyByb3dzLm1hcCgoeyByb3csIG9sZExpbmUsIG5ld0xpbmUgfSwgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7b2xkTGluZSA/PyAnbyd9OiR7bmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dDb21tZW50cyA9IGNvbW1lbnRzPy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIG9sZExpbmUsIG5ld0xpbmUpKSA/PyBbXVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IGZpbmRpbmdzRm9yKG9sZExpbmUsIG5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVkaXRpbmcgPSBlZGl0aW5nS2V5ID09PSBrZXlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvd0FjdGlvbnMgPSByb3cua2luZCA9PT0gJ2N0eCcgfHwgcm93LmtpbmQgPT09ICdhZGQnIHx8IHJvdy5raW5kID09PSAnZGVsJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5nQ2xzID0gZmluZGluZ3MubGVuZ3RoID4gMCA/IGAgZHNkci1saW5lLWZpbmRpbmcgZHNkci1maW5kaW5nLSR7ZmluZGluZ3NbMF0ucHJpb3JpdHl9YCA6ICcnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGp1bXBlZCA9IGp1bXBMaW5lICE9IG51bGwgJiYgKG5ld0xpbmUgPT09IGp1bXBMaW5lIHx8IChuZXdMaW5lID09PSBudWxsICYmIG9sZExpbmUgPT09IGp1bXBMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH0ke3Jvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAnIGRzZHItbGluZS1jb21tZW50ZWQnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWxpbmUtanVtcCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17bmV3TGluZSA/PyBvbGRMaW5lID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLW51bVwiPntuZXdMaW5lID8/IG9sZExpbmUgPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtdGV4dFwiPntyb3cudGV4dCB8fCAnICd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9IHRpdGxlPXtmaW5kaW5nc1swXS50aXRsZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzWzBdLnByaW9yaXR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAxID8gYFx1MDBENyR7ZmluZGluZ3MubGVuZ3RofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cGF0aCAmJiBvbk9wZW5MaW5lICYmIChuZXdMaW5lID8/IG9sZExpbmUpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1vcGVubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbkxpbmUocGF0aCwgbmV3TGluZSA/PyBvbGRMaW5lID8/IDEpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e3Jvd0NvbW1lbnRzLmxlbmd0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Blbj17Y29tbWVudFBvcG92ZXIgPT09IGtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiBvbk9wZW5Db21tZW50Py4ob2xkTGluZSwgbmV3TGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBvblRvZ2dsZVBvcG92ZXI/LihrZXkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0PXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyAmJiByb3dDb21tZW50cy5sZW5ndGggPiAwICYmIGNvbW1lbnRQb3BvdmVyID09PSBrZXkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXBvcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjb21tZW50LmlkfSBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC10ZXh0XCI+e2NvbW1lbnQudGV4dH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjb21tZW50LnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkRlbGV0ZUNvbW1lbnQ/Lihjb21tZW50LmlkKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlZGl0aW5nID8gPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHQgPz8gJyd9IG9uVGV4dD17b25Db21tZW50VGV4dCA/PyAoKCkgPT4ge30pfSBvblNhdmU9e29uU2F2ZUNvbW1lbnQgPz8gKCgpID0+IHt9KX0gb25DYW5jZWw9e29uQ2FuY2VsQ29tbWVudCA/PyAoKCkgPT4ge30pfSBidXN5PXtidXN5fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA6IGJsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyaX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgIDwvcHJlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuLyoqIERyYWcgaGFuZGxlIGZvciByZXNpemluZyB0aGUgcGFuZWwgKGVhc3QgLyBzb3V0aCAvIHNvdXRoLWVhc3QpLiAqL1xuZnVuY3Rpb24gUmVzaXplSGFuZGxlKHsgbW9kZSwgb25SZXNpemUgfTogeyBtb2RlOiAnZScgfCAncycgfCAnc2UnOyBvblJlc2l6ZTogKGR4OiBudW1iZXIsIGR5OiBudW1iZXIpID0+IHZvaWQgfSkge1xuICBjb25zdCBsYXN0ID0gdXNlUmVmPHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1yZXNpemUgZHNkci1yZXNpemUtJHttb2RlfWB9XG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWxhc3QuY3VycmVudCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGR4ID0gZXZlbnQuY2xpZW50WCAtIGxhc3QuY3VycmVudC54XG4gICAgICAgIGNvbnN0IGR5ID0gZXZlbnQuY2xpZW50WSAtIGxhc3QuY3VycmVudC55XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGlmIChkeCAhPT0gMCB8fCBkeSAhPT0gMCkgb25SZXNpemUoZHgsIGR5KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXsoZXZlbnQpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0gbnVsbFxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXsoKSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgIH19XG4gICAgLz5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoaXBDbGFzcyhzdGF0dXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHMgPSBzdGF0dXMucmVwbGFjZSgvXFxzL2csICcnKVxuICBpZiAocy5pbmNsdWRlcygnPz8nKSkgcmV0dXJuICdkc2RyLWNoaXAtdSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnQScpIHx8IHMuaW5jbHVkZXMoJ0EnKSkgcmV0dXJuICdkc2RyLWNoaXAtYSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnRCcpIHx8IHMuaW5jbHVkZXMoJ0QnKSkgcmV0dXJuICdkc2RyLWNoaXAtZCdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnUicpIHx8IHMuaW5jbHVkZXMoJ1InKSkgcmV0dXJuICdkc2RyLWNoaXAtcidcbiAgcmV0dXJuICdkc2RyLWNoaXAtbSdcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFN0YXR1cyhjd2Q6IHN0cmluZyk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgc3RhdHVzIHJlcXVlc3QgZmFpbGVkOiAke3Jlcy5zdGF0dXN9YClcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpKSBhcyBTdGF0dXNSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhcHBseUNoYW5nZXMoY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZyk6IFByb21pc2U8QXBwbHlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgYWN0aW9uLCBwYXRoIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQXBwbHlSZXNwb25zZVxufVxuXG4vKiogQXBwbHkgb25lIGh1bmsgb2Ygb25lIGZpbGUgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkuICovXG5hc3luYyBmdW5jdGlvbiBhcHBseUh1bmsoY3dkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBzdHJpbmcpOiBQcm9taXNlPEFwcGx5SHVua1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEFQUExZX0hVTktfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHBhdGgsIGFjdGlvbiwgaHVuayB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEFwcGx5SHVua1Jlc3BvbnNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bkdpdEFjdGlvbihjd2Q6IHN0cmluZywgYWN0aW9uOiAnY29tbWl0JyB8ICdwdXNoJywgbWVzc2FnZT86IHN0cmluZyk6IFByb21pc2U8R2l0UmVzcG9uc2U+IHtcbiAgY29uc3QgdXJsID0gYWN0aW9uID09PSAnY29tbWl0JyA/IENPTU1JVF9VUkwgOiBQVVNIX1VSTFxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShhY3Rpb24gPT09ICdjb21taXQnID8geyBjd2QsIG1lc3NhZ2UgfSA6IHsgY3dkIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgR2l0UmVzcG9uc2Vcbn1cblxuLyoqIExvY2FsICh1bnB1c2hlZCkgY29tbWl0cyBhaGVhZCBvZiB0aGUgdXBzdHJlYW0uICovXG5hc3luYyBmdW5jdGlvbiBsb2FkSGlzdG9yeShjd2Q6IHN0cmluZyk6IFByb21pc2U8SGlzdG9yeVJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0hJU1RPUllfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21taXRzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEhpc3RvcnlSZXNwb25zZVxufVxuXG4vKiogT25lIGNvbW1pdCdzIHVuaWZpZWQgZGlmZi4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRDb21taXREaWZmKGN3ZDogc3RyaW5nLCBoYXNoOiBzdHJpbmcpOiBQcm9taXNlPENvbW1pdERpZmZSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtDT01NSVRfRElGRl9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfSZoYXNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGhhc2gpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGRpZmY6ICcnLCBmaWxlczogW10sIGFkZGVkOiAwLCBkZWxldGVkOiAwLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQ29tbWl0RGlmZlJlc3BvbnNlXG59XG5cbi8qKiBJbmxpbmUgcmV2aWV3IGNvbW1lbnRzIGZvciB0aGUgd29ya3NwYWNlIChyZXBvLXNjb3BlZCkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWVudHMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFJldmlld0NvbW1lbnRbXT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtDT01NRU5UU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1lbnRzOiBbXSB9KSkpIGFzIENvbW1lbnRzUmVzcG9uc2VcbiAgcmV0dXJuIGRhdGEub2sgPyBkYXRhLmNvbW1lbnRzIDogW11cbn1cblxuLyoqIFJlcGxhY2UgdGhlIHdob2xlIGNvbW1lbnQgbGlzdCAoc2luZ2xlLXVzZXIgcmVwbGFjZSBzZW1hbnRpY3MpLiAqL1xuYXN5bmMgZnVuY3Rpb24gc2F2ZUNvbW1lbnRzKGN3ZDogc3RyaW5nLCBjb21tZW50czogUmV2aWV3Q29tbWVudFtdKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKENPTU1FTlRTX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBjb21tZW50cyB9KSxcbiAgfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSB9KSkpIGFzIENvbW1lbnRzUmVzcG9uc2VcbiAgcmV0dXJuIGRhdGEub2sgPT09IHRydWVcbn1cblxuLyoqIExvY2FsIGJyYW5jaCBuYW1lcyAoZm9yIHRoZSBCcmFuY2ggcmV2aWV3IHNjb3BlKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRCcmFuY2hlcyhjd2Q6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7QlJBTkNIRVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBicmFuY2hlczogW10gfSkpKSBhcyB7IG9rOiBib29sZWFuOyBicmFuY2hlczogc3RyaW5nW10gfVxuICByZXR1cm4gZGF0YS5vayA/IGRhdGEuYnJhbmNoZXMgOiBbXVxufVxuXG4vKiogUnVuIGFuIEFJIHJldmlldyBvdmVyIHRoZSBnaXZlbiBzY29wZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJ1blJldmlldyhjd2Q6IHN0cmluZywgc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBzY29wZTogJ3VuY29tbWl0dGVkJyB8ICdicmFuY2gnIHwgJ2NvbW1pdCcsIGJhc2U/OiBzdHJpbmcsIGNvbW1pdEhhc2g/OiBzdHJpbmcpOiBQcm9taXNlPFJldmlld1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFJFVklFV19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgc2Vzc2lvbklkOiBzZXNzaW9uSWQgPz8gdW5kZWZpbmVkLCBzY29wZSwgYmFzZSwgY29tbWl0SGFzaCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZmluZGluZ3M6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUmV2aWV3UmVzcG9uc2Vcbn1cblxuLyoqIEN1cnJlbnQgYnJhbmNoJ3MgR2l0SHViIFBSIGNvbnRleHQgKGRlZ3JhZGVzIGdyYWNlZnVsbHkgd2l0aG91dCBnaCkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkUHIoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFByUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7UFJfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21tZW50czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBQclJlc3BvbnNlXG59XG5cbi8qKiBHaXQgcmVwb3MgdW5kZXIgYSB3b3Jrc3BhY2UgKG11bHRpLXJlcG8gc2VsZWN0b3IpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZFJlcG9zKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxSZXBvc1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1JFUE9TX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgcmVwb3M6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUmVwb3NSZXNwb25zZVxufVxuXG4vKiogT3BlbiBhIGZpbGUgKG9wdGlvbmFsbHkgYXQgYSBsaW5lKSBpbiB0aGUgdXNlcidzIGVkaXRvciB2aWEgb3Blbi1lZGl0b3IuICovXG5hc3luYyBmdW5jdGlvbiBvcGVuSW5FZGl0b3IoY3dkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlcik6IFByb21pc2U8eyBvazogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICBjb25zdCBhYnMgPSBwYXRoLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocGF0aCkgPyBwYXRoIDogYCR7Y3dkfS8ke3BhdGh9YFxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChPUEVOX0VESVRPUl9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHBhdGg6IGFicywgbGluZSB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIHsgb2s6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH1cbn1cblxuLyoqIFNob3J0IHJlbGF0aXZlIHRpbWUgZm9yIGNvbW1pdCByb3dzIChcImp1c3Qgbm93XCIgLyBcIjMgbWluIGFnb1wiIC8gXHUyMDI2KS4gKi9cbmZ1bmN0aW9uIHJlbGF0aXZlVGltZShpc286IHN0cmluZywgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoKERhdGUubm93KCkgLSBuZXcgRGF0ZShpc28pLmdldFRpbWUoKSkgLyA2MDAwMClcbiAgaWYgKG1pbnV0ZXMgPCAxKSByZXR1cm4gdCgndGltZS5ub3cnKVxuICBpZiAobWludXRlcyA8IDYwKSByZXR1cm4gdCgndGltZS5taW51dGVzJywgeyBuOiBtaW51dGVzIH0pXG4gIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApXG4gIGlmIChob3VycyA8IDI0KSByZXR1cm4gdCgndGltZS5ob3VycycsIHsgbjogaG91cnMgfSlcbiAgcmV0dXJuIHQoJ3RpbWUuZGF5cycsIHsgbjogTWF0aC5mbG9vcihob3VycyAvIDI0KSB9KVxufVxuXG4vKiogVGhlbWUtYXdhcmUgZHJvcGRvd24gcmVwbGFjaW5nIG5hdGl2ZSA8c2VsZWN0PiAobmF0aXZlIHBvcHVwcyBpZ25vcmUgdGhlIHRoZW1lKS4gKi9cbmZ1bmN0aW9uIFRoZW1lU2VsZWN0KHtcbiAgdmFsdWUsXG4gIG9wdGlvbnMsXG4gIG9uQ2hhbmdlLFxuICBhcmlhTGFiZWwsXG59OiB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgb3B0aW9uczogeyB2YWx1ZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH1bXVxuICBvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWRcbiAgYXJpYUxhYmVsPzogc3RyaW5nXG59KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCByb290UmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKVxuICBjb25zdCBjdXJyZW50ID0gb3B0aW9ucy5maW5kKChvKSA9PiBvLnZhbHVlID09PSB2YWx1ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghb3BlbikgcmV0dXJuXG4gICAgY29uc3QgY2xvc2VPdXRzaWRlID0gKGV2ZW50OiBQb2ludGVyRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmICFyb290UmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGNvbnN0IGNsb3NlT25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGNsb3NlT3V0c2lkZSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2xvc2VPbktleSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBjbG9zZU91dHNpZGUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2xvc2VPbktleSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWxcIiByZWY9e3Jvb3RSZWZ9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1zZWwtdHJpZ2dlclwiXG4gICAgICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICAgICAgYXJpYS1leHBhbmRlZD17b3Blbn1cbiAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVsfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2KSA9PiAhdil9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLXZhbHVlXCI+e2N1cnJlbnQ/LmxhYmVsID8/IHZhbHVlfTwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93biAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cImRzZHItc2VsLW1lbnVcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgICAge29wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgICAgIDxsaSBrZXk9e29wdGlvbi52YWx1ZX0gcm9sZT1cIm5vbmVcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e29wdGlvbi52YWx1ZSA9PT0gdmFsdWV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zZWwtb3B0aW9uJHtvcHRpb24udmFsdWUgPT09IHZhbHVlID8gJyBkc2RyLXNlbC1vcHRpb24tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgb25DaGFuZ2Uob3B0aW9uLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtb3B0aW9uLW1hcmtcIj57b3B0aW9uLnZhbHVlID09PSB2YWx1ZSA/IDxJY29uQ2hlY2sgLz4gOiBudWxsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC1vcHRpb24tbGFiZWxcIj57b3B0aW9uLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3VsPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIERpZmYgZm9udCArIGZvbnQgc2l6ZSBjb250cm9scyAoc2hhcmVkIHByZWZzIHN0b3JlKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdQcmVmcyh7IHQgfTogeyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWZpZWxkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWxhYmVsXCIgaWQ9XCJkc2RyLXByZWYtZm9udC1sYWJlbFwiPnt0KCdzZXR0aW5ncy5mb250Jyl9PC9zcGFuPlxuICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLmZvbnQnKX1cbiAgICAgICAgICB2YWx1ZT17cHJlZnMuZm9udH1cbiAgICAgICAgICBvcHRpb25zPXtGT05UX09QVElPTlMubWFwKChmKSA9PiAoeyB2YWx1ZTogZi5pZCwgbGFiZWw6IGYubGFiZWwuc3RhcnRzV2l0aCgnZm9udC4nKSA/IHQoZi5sYWJlbCBhcyBrZXlvZiB0eXBlb2YgemgpIDogZi5sYWJlbCB9KSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyhmb250KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5mb250ID0gZm9udFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jZmctZmllbGRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbGFiZWxcIiBpZD1cImRzZHItcHJlZi1zaXplLWxhYmVsXCI+e3QoJ3NldHRpbmdzLnNpemUnKX08L3NwYW4+XG4gICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2V0dGluZ3Muc2l6ZScpfVxuICAgICAgICAgIHZhbHVlPXtTdHJpbmcocHJlZnMuc2l6ZSl9XG4gICAgICAgICAgb3B0aW9ucz17U0laRV9PUFRJT05TLm1hcCgocykgPT4gKHsgdmFsdWU6IFN0cmluZyhzKSwgbGFiZWw6IGAke3N9cHhgIH0pKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHNpemUpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLnNpemUgPSBOdW1iZXIoc2l6ZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgPC8+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBIZWFkZXIgYWN0aW9uIChzZXNzaW9uIHNjb3BlKTogYmFkZ2UgKyBvcGVuLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdBY3Rpb24oeyBzZXNzaW9uSWQsIHVzZVNlc3Npb25zLCB1c2VTZXNzaW9uLCB0IH06IERpZmZSZXZpZXdBY3Rpb25Qcm9wcykge1xuICBjb25zdCBjd2QgPSB1c2VTZXNzaW9ucygoczogU2Vzc2lvbkxpc3RTdGF0ZSkgPT4gcy5ieUlkW3Nlc3Npb25JZF0/LmN3ZClcbiAgY29uc3Qgbm9kZXMgPSB1c2VTZXNzaW9uKChzKSA9PiBzLm5vZGVzKVxuICBjb25zdCBjaGFuZ2VDb3VudCA9IHVzZU1lbW8oKCkgPT4gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlcyksIFtub2Rlc10pXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IG9wZW5PdmVybGF5ID0gKCkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1bnN1YiA9IG92ZXJsYXlTdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgc2V0T3BlbihvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QoKS5vcGVuKVxuICAgIH0pXG4gICAgcmV0dXJuIHVuc3ViXG4gIH0sIFtdKVxuXG4gIGlmICghY3dkKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci10cmlnZ2VyXCIgYXJpYS1sYWJlbD17dCgnYWN0aW9uLmFyaWEnKX0gb25DbGljaz17b3Blbk92ZXJsYXl9PlxuICAgICAgPEljb25EaWZmIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxhYmVsXCI+e3QoJ2FjdGlvbi5sYWJlbCcpfTwvc3Bhbj5cbiAgICAgIHtjaGFuZ2VDb3VudCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvdW50XCI+e2NoYW5nZUNvdW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAge29wZW4gPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XHUyNzEzPC9zcGFuPiA6IG51bGx9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaWxlIHRyZWU6IGJ1aWxkIGEgZGlyZWN0b3J5IHRyZWUgZnJvbSBmbGF0IHBhdGhzIGFuZCByZW5kZXIgaXQgd2l0aFxuLy8gY29sbGFwc2libGUgZm9sZGVycyAodGhlIGxlZnQgc2lkZSBvZiB0aGUgcmV2aWV3IHN1cmZhY2UpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnR5cGUgVHJlZURpcjxUPiA9IHsga2luZDogJ2Rpcic7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBjaGlsZHJlbjogVHJlZU5vZGU8VD5bXSB9XG50eXBlIFRyZWVMZWFmPFQ+ID0geyBraW5kOiAnbGVhZic7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBpdGVtOiBUIH1cbnR5cGUgVHJlZU5vZGU8VD4gPSBUcmVlRGlyPFQ+IHwgVHJlZUxlYWY8VD5cblxuLyoqIFR1cm4gYSBmbGF0IGl0ZW0gbGlzdCBpbnRvIGEgc29ydGVkIGRpcmVjdG9yeSB0cmVlIChkaXJlY3RvcmllcyBmaXJzdCkuICovXG5mdW5jdGlvbiBidWlsZEZpbGVUcmVlPFQ+KGl0ZW1zOiByZWFkb25seSBUW10sIHBhdGhPZjogKGl0ZW06IFQpID0+IHN0cmluZyk6IFRyZWVOb2RlPFQ+W10ge1xuICBjb25zdCByb290OiBUcmVlTm9kZTxUPltdID0gW11cbiAgY29uc3QgZGlySW5kZXggPSBuZXcgTWFwPHN0cmluZywgVHJlZURpcjxUPj4oKVxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBjb25zdCBwYXRoID0gcGF0aE9mKGl0ZW0pXG4gICAgY29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkgY29udGludWVcbiAgICBsZXQgc2libGluZ3MgPSByb290XG4gICAgbGV0IHByZWZpeCA9ICcnXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIHByZWZpeCA9IHByZWZpeCA/IGAke3ByZWZpeH0vJHtwYXJ0c1tpXX1gIDogcGFydHNbaV1cbiAgICAgIGxldCBkaXIgPSBkaXJJbmRleC5nZXQocHJlZml4KVxuICAgICAgaWYgKCFkaXIpIHtcbiAgICAgICAgZGlyID0geyBraW5kOiAnZGlyJywgbmFtZTogcGFydHNbaV0sIHBhdGg6IHByZWZpeCwgY2hpbGRyZW46IFtdIH1cbiAgICAgICAgZGlySW5kZXguc2V0KHByZWZpeCwgZGlyKVxuICAgICAgICBzaWJsaW5ncy5wdXNoKGRpcilcbiAgICAgIH1cbiAgICAgIHNpYmxpbmdzID0gZGlyLmNoaWxkcmVuXG4gICAgfVxuICAgIHNpYmxpbmdzLnB1c2goeyBraW5kOiAnbGVhZicsIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLCBwYXRoLCBpdGVtIH0pXG4gIH1cbiAgY29uc3Qgc29ydE5vZGVzID0gKG5vZGVzOiBUcmVlTm9kZTxUPltdKTogdm9pZCA9PiB7XG4gICAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYgKGEua2luZCAhPT0gYi5raW5kKSByZXR1cm4gYS5raW5kID09PSAnZGlyJyA/IC0xIDogMVxuICAgICAgcmV0dXJuIGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSlcbiAgICB9KVxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2RlcykgaWYgKG5vZGUua2luZCA9PT0gJ2RpcicpIHNvcnROb2Rlcyhub2RlLmNoaWxkcmVuKVxuICB9XG4gIHNvcnROb2Rlcyhyb290KVxuICByZXR1cm4gcm9vdFxufVxuXG4vKiogUmVjdXJzaXZlIHRyZWUgcmVuZGVyZXI6IGNvbGxhcHNpYmxlIGRpcmVjdG9yaWVzICsgbGVhZiByb3dzLiAqL1xuZnVuY3Rpb24gRmlsZVRyZWVWaWV3PFQ+KHByb3BzOiB7XG4gIG5vZGVzOiBUcmVlTm9kZTxUPltdXG4gIGNvbGxhcHNlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPlxuICBvblRvZ2dsZURpcjogKHBhdGg6IHN0cmluZykgPT4gdm9pZFxuICBkZXB0aDogbnVtYmVyXG4gIHJlbmRlckxlYWY6IChsZWFmOiBUcmVlTGVhZjxUPikgPT4gUmVhY3ROb2RlXG59KTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgeyBub2RlcywgY29sbGFwc2VkLCBvblRvZ2dsZURpciwgZGVwdGgsIHJlbmRlckxlYWYgfSA9IHByb3BzXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtub2Rlcy5tYXAoKG5vZGUpID0+XG4gICAgICAgIG5vZGUua2luZCA9PT0gJ2RpcicgPyAoXG4gICAgICAgICAgPGRpdiBrZXk9e25vZGUucGF0aH0+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWRpciR7Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJycgOiAnIGRzZHItZGlyLW9wZW4nfWB9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0ICsgOCB9fVxuICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXshY29sbGFwc2VkLmhhcyhub2RlLnBhdGgpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblRvZ2dsZURpcihub2RlLnBhdGgpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1jYXJldFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAnXHUyNUI4JyA6ICdcdTI1QkUnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItbmFtZVwiIHRpdGxlPXtub2RlLnBhdGh9Pntub2RlLm5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1jb3VudFwiPntub2RlLmNoaWxkcmVuLmxlbmd0aH08L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIHshY29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gKFxuICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3IG5vZGVzPXtub2RlLmNoaWxkcmVufSBjb2xsYXBzZWQ9e2NvbGxhcHNlZH0gb25Ub2dnbGVEaXI9e29uVG9nZ2xlRGlyfSBkZXB0aD17ZGVwdGggKyAxfSByZW5kZXJMZWFmPXtyZW5kZXJMZWFmfSAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPGRpdiBrZXk9e25vZGUucGF0aH0gc3R5bGU9e3sgcGFkZGluZ0xlZnQ6IGRlcHRoICogMTQgfX0+e3JlbmRlckxlYWYobm9kZSl9PC9kaXY+XG4gICAgICAgICksXG4gICAgICApfVxuICAgIDwvPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29tcG9zZXIgZG9jayAoc2Vzc2lvbiBzY29wZSk6IHBlbmRpbmcgaW5saW5lIGNvbW1lbnRzIGZsb2F0IGFib3ZlIHRoZVxuLy8gaW5wdXQgYm94LCBDb2RleC1zdHlsZSBcdTIwMTQgaG92ZXIgdGhlIHBpbGwgdG8gcHJldmlldywgY2xpY2sgc2VuZCB0byBpbmplY3QuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudHlwZSBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPiAmIHsgc2Vzc2lvbnM6IElTZXNzaW9ucyB9XG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb21wb3NlckRvY2soeyBzZXNzaW9uSWQsIHVzZVNlc3Npb25zLCBzZXNzaW9ucywgaW5wdXQsIHQgfTogRGlmZlJldmlld0NvbXBvc2VyRG9ja1Byb3BzKSB7XG4gIGNvbnN0IGN3ZCA9IHVzZVNlc3Npb25zKChzOiBTZXNzaW9uTGlzdFN0YXRlKSA9PiBzLmJ5SWRbc2Vzc2lvbklkXT8uY3dkKVxuICBjb25zdCBwZW5kaW5nID0gdXNlU3luY0V4dGVybmFsU3RvcmUocGVuZGluZ0NvbW1lbnRzU3RvcmUuc3Vic2NyaWJlLCBwZW5kaW5nQ29tbWVudHNTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Rpc21pc3NlZCwgc2V0RGlzbWlzc2VkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBjYXJyaWVkSWRzID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGNhcnJ5aW5nID0gdXNlUmVmKGZhbHNlKVxuXG4gIC8vIFNlZWQgdGhlIHN0b3JlIGZyb20gc2VydmVyIHN0b3JhZ2Ugd2hlbiBub3RoaW5nIGhhcyBiZWVuIHN5bmNlZCBmb3IgdGhpc1xuICAvLyB3b3Jrc3BhY2UgeWV0IChwYW5lbCBuZXZlciBvcGVuZWQgdGhpcyBzZXNzaW9uIFx1MjAxNCBjb21tZW50cyBwZXJzaXN0IGluIC5naXQpLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY3dkIHx8IHBlbmRpbmcuY3dkID09PSBjd2QpIHJldHVyblxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZVxuICAgIHZvaWQgbG9hZENvbW1lbnRzKGN3ZCkudGhlbigobGlzdCkgPT4ge1xuICAgICAgaWYgKGNhbmNlbGxlZCkgcmV0dXJuXG4gICAgICBwZW5kaW5nQ29tbWVudHNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgaWYgKGQuY3dkID09PSBjd2QpIHJldHVyblxuICAgICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgICBkLmNvbW1lbnRzID0gbGlzdFxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjYW5jZWxsZWQgPSB0cnVlXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW2N3ZCwgcGVuZGluZy5jd2RdKVxuXG4gIGNvbnN0IGNvbW1lbnRzID0gcGVuZGluZy5jd2QgPT09IGN3ZCA/IHBlbmRpbmcuY29tbWVudHMgOiBbXVxuICBjb25zdCBpZHMgPSBjb21tZW50cy5tYXAoKGMpID0+IGMuaWQpLmpvaW4oJywnKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChjb21tZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHNldERpc21pc3NlZChmYWxzZSlcbiAgICAgIGNhcnJpZWRJZHMuY3VycmVudCA9IG51bGxcbiAgICB9XG4gIH0sIFtjb21tZW50cy5sZW5ndGhdKVxuXG4gIC8vIENvZGV4LXN0eWxlIGF1dG8tY2Fycnk6IHdoZW4gdGhlIHVzZXIgc3VibWl0cyBhIG1lc3NhZ2Ugd2hpbGUgY29tbWVudHMgYXJlXG4gIC8vIHBlbmRpbmcsIHF1ZXVlIHRoZSBjb21tZW50cyByaWdodCBiZWhpbmQgaXQgKG5vIHNlbmQgYnV0dG9uIG5lZWRlZCkuXG4gIGNvbnN0IHBoYXNlID0gaW5wdXQ/LnBoYXNlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGNvbW1lbnRzLmxlbmd0aCA9PT0gMCB8fCBjYXJyeWluZy5jdXJyZW50IHx8IGNhcnJpZWRJZHMuY3VycmVudCA9PT0gaWRzKSByZXR1cm5cbiAgICBpZiAocGhhc2UgIT09ICdzdWJtaXR0aW5nJyAmJiBwaGFzZSAhPT0gJ2FkanVkaWNhdGluZycpIHJldHVyblxuICAgIGNhcnJ5aW5nLmN1cnJlbnQgPSB0cnVlXG4gICAgY29uc3QgdGFyZ2V0SWRzID0gaWRzXG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gWydcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLCAnJ11cbiAgICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICAgIGNvbnN0IGFuY2hvciA9IGMubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjLmxpbmVOZXd9YCA6IGAgKG9sZCBsaW5lICR7Yy5saW5lT2xkfSlgXG4gICAgICBsaW5lcy5wdXNoKGAtICR7Yy5wYXRofSR7YW5jaG9yfTogJHtjLnRleHR9YClcbiAgICB9XG4gICAgdm9pZCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIHNlc3Npb25JZCwgbGluZXMuam9pbignXFxuJykpLnRoZW4oKG91dGNvbWUpID0+IHtcbiAgICAgIGlmIChvdXRjb21lICE9PSAnZmFpbGVkJykgY2FycmllZElkcy5jdXJyZW50ID0gdGFyZ2V0SWRzXG4gICAgICBjYXJyeWluZy5jdXJyZW50ID0gZmFsc2VcbiAgICB9KVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3BoYXNlLCBpZHNdKVxuXG4gIGlmICghY3dkIHx8IGNvbW1lbnRzLmxlbmd0aCA9PT0gMCB8fCBkaXNtaXNzZWQpIHJldHVybiBudWxsXG5cbiAgLyoqIE9wZW4gdGhlIHJldmlldyBwYW5lbCBhdCB0aGUgY29tbWVudCdzIGNoYW5nZSBibG9jay4gKi9cbiAgY29uc3QgZm9jdXNDb21tZW50ID0gKGNvbW1lbnQ6IFJldmlld0NvbW1lbnQpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5mb2N1cyA9IHsgcGF0aDogY29tbWVudC5wYXRoLCBsaW5lOiBjb21tZW50LmxpbmVOZXcgPz8gY29tbWVudC5saW5lT2xkID8/IHVuZGVmaW5lZCB9XG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kb2NrXCIgb25Nb3VzZUVudGVyPXsoKSA9PiBzZXRIb3Zlcih0cnVlKX0gb25Nb3VzZUxlYXZlPXsoKSA9PiBzZXRIb3ZlcihmYWxzZSl9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2staGVhZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2staWNvblwiPjxJY29uQ29tbWVudCAvPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNvdW50XCI+e3QoJ3Jldmlldy5kb2NrQ29tbWVudHMnLCB7IG46IGNvbW1lbnRzLmxlbmd0aCB9KX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1oaW50XCI+e3QoJ3Jldmlldy5kb2NrSGludCcpfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2xvc2VcIiBhcmlhLWxhYmVsPXt0KCdjb21tZW50LmNhbmNlbCcpfSBvbkNsaWNrPXsoKSA9PiBzZXREaXNtaXNzZWQodHJ1ZSl9PlxuICAgICAgICAgIDxJY29uWCAvPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAge2hvdmVyID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZG9jay1saXN0XCI+XG4gICAgICAgICAge2NvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e2NvbW1lbnQuaWR9XG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWRvY2staXRlbVwiXG4gICAgICAgICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuZG9ja0p1bXAnKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZm9jdXNDb21tZW50KGNvbW1lbnQpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stbG9jXCI+e2NvbW1lbnQucGF0aH17Y29tbWVudC5saW5lTmV3ICE9PSBudWxsID8gYDoke2NvbW1lbnQubGluZU5ld31gIDogJyd9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stdGV4dFwiPntjb21tZW50LnRleHR9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSZXZpZXcgb3ZlcmxheSAocm9vdCBzY29wZSk6IHNlc3Npb24gKyB3b3Jrc3BhY2UgdGFicy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3T3ZlcmxheSh7IHNlc3Npb25zLCB0IH06IERpZmZSZXZpZXdPdmVybGF5UHJvcHMpIHtcbiAgY29uc3Qgc3RvcmVTdGF0ZSA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKG92ZXJsYXlTdG9yZS5zdWJzY3JpYmUsIG92ZXJsYXlTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3QgcHJlZnMgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwcmVmc1N0b3JlLnN1YnNjcmliZSwgcHJlZnNTdG9yZS5nZXRTbmFwc2hvdClcbiAgLy8gR2l0LWZpcnN0OiBsYW5kIG9uIHRoZSB3b3Jrc3BhY2UgdGFiIChzdGFnZWQvdW5zdGFnZWQvYnJhbmNoIHRyZWVzKSBzbyB0aGVcbiAgLy8gY2hhbmdlIHJldmlldyBpcyBvbmUgY2xpY2sgYXdheTsgdGhlIHNlc3Npb24gdGFiIHN0YXlzIGEgY2xpY2sgYXdheS5cbiAgY29uc3QgW3RhYiwgc2V0VGFiXSA9IHVzZVN0YXRlPCdzZXNzaW9uJyB8ICd3b3Jrc3BhY2UnPignd29ya3NwYWNlJylcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gdXNlU3RhdGU8Vmlld01vZGU+KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkc2RyLXZpZXcnKSA9PT0gJ3NwbGl0JyA/ICdzcGxpdCcgOiAnc2luZ2xlJ1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuICdzaW5nbGUnXG4gICAgfVxuICB9KVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZHNkci12aWV3JywgdmlldylcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIHByaXZhdGUgbW9kZSAvIHVuYXZhaWxhYmxlIFx1MjAxNCBub24tZmF0YWxcbiAgICB9XG4gIH0sIFt2aWV3XSlcblxuICAvLyBXb3Jrc3BhY2UgdGFiIHN0YXRlLlxuICBjb25zdCBbc3RhdHVzLCBzZXRTdGF0dXNdID0gdXNlU3RhdGU8U3RhdHVzUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzZWxlY3RlZCwgc2V0U2VsZWN0ZWRdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbm90aWNlLCBzZXROb3RpY2VdID0gdXNlU3RhdGU8eyBraW5kOiAnb2snIHwgJ2Vycm9yJzsgdGV4dDogc3RyaW5nIH0gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29uZmlybSwgc2V0Q29uZmlybV0gPSB1c2VTdGF0ZTwnZmlsZScgfCAnYWxsJyB8ICdwdXNoJyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXRNZXNzYWdlLCBzZXRDb21taXRNZXNzYWdlXSA9IHVzZVN0YXRlKCcnKVxuICAvLyBMb2NhbCAodW5wdXNoZWQpIGNvbW1pdCBoaXN0b3J5OiBsaXN0ICsgcGVyLWNvbW1pdCBkaWZmIHZpZXcuXG4gIGNvbnN0IFtoaXN0b3J5LCBzZXRIaXN0b3J5XSA9IHVzZVN0YXRlPENvbW1pdEluZm9bXT4oW10pXG4gIGNvbnN0IFtzZWxlY3RlZENvbW1pdCwgc2V0U2VsZWN0ZWRDb21taXRdID0gdXNlU3RhdGU8Q29tbWl0SW5mbyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXREaWZmLCBzZXRDb21taXREaWZmXSA9IHVzZVN0YXRlPENvbW1pdERpZmZSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXREaWZmTG9hZGluZywgc2V0Q29tbWl0RGlmZkxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZWxlY3RlZENvbW1pdEZpbGUsIHNldFNlbGVjdGVkQ29tbWl0RmlsZV0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBJbmxpbmUgcmV2aWV3IGNvbW1lbnRzICh3b3Jrc3BhY2UgdGFiLCBzaW5nbGUgdmlldykuXG4gIGNvbnN0IFtjb21tZW50cywgc2V0Q29tbWVudHNdID0gdXNlU3RhdGU8UmV2aWV3Q29tbWVudFtdPihbXSlcbiAgY29uc3QgW2NvbW1lbnRFZGl0b3IsIHNldENvbW1lbnRFZGl0b3JdID0gdXNlU3RhdGU8eyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWVudFRleHQsIHNldENvbW1lbnRUZXh0XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbY29tbWVudFBvcG92ZXIsIHNldENvbW1lbnRQb3BvdmVyXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIFJldmlldyBzY29wZTogd2hpY2ggc2xpY2Ugb2YgdGhlIHJlcG9zaXRvcnkgdGhlIHdvcmtzcGFjZSB0YWIgc2hvd3MuXG4gIGNvbnN0IFtzY29wZSwgc2V0U2NvcGVdID0gdXNlU3RhdGU8V29ya3NwYWNlU2NvcGU+KCdhbGwnKVxuICBjb25zdCBbYnJhbmNoZXMsIHNldEJyYW5jaGVzXSA9IHVzZVN0YXRlPHN0cmluZ1tdPihbXSlcbiAgY29uc3QgW2Jhc2VCcmFuY2gsIHNldEJhc2VCcmFuY2hdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2Jhc2VTdGF0dXMsIHNldEJhc2VTdGF0dXNdID0gdXNlU3RhdGU8U3RhdHVzUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICAvLyBGZWVkYmFjayBsb29wOiBzZW5kIGlubGluZSBjb21tZW50cyB0byB0aGUgYWdlbnQgKHNlc3Npb24ucHJvbXB0LCBjb3B5IGZhbGxiYWNrKS5cbiAgY29uc3QgW3NlbmRPcGVuLCBzZXRTZW5kT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbmRUZXh0LCBzZXRTZW5kVGV4dF0gPSB1c2VTdGF0ZSgnJylcbiAgLy8gQUkgcmV2aWV3ICgvcmV2aWV3KTogZmluZGluZ3MgKyB2ZXJkaWN0LlxuICBjb25zdCBbcmV2aWV3LCBzZXRSZXZpZXddID0gdXNlU3RhdGU8UmV2aWV3UmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbcmV2aWV3aW5nLCBzZXRSZXZpZXdpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIC8vIEdpdEh1YiBQUiBjb250ZXh0IChnaCBDTEkpLlxuICBjb25zdCBbcHIsIHNldFByXSA9IHVzZVN0YXRlPFByUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICAvLyBNdWx0aS1yZXBvOiByZXBvcyBkZXRlY3RlZCB1bmRlciB0aGUgd29ya3NwYWNlICsgdGhlIHNlbGVjdGVkIG9uZS5cbiAgY29uc3QgW3JlcG9zLCBzZXRSZXBvc10gPSB1c2VTdGF0ZTx7IHBhdGg6IHN0cmluZzsgYnJhbmNoOiBzdHJpbmcgfCBudWxsIH1bXT4oW10pXG4gIGNvbnN0IFtyZXBvUGF0aCwgc2V0UmVwb1BhdGhdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgLy8gVGVtcG9yYXJ5IGxpbmUgaGlnaGxpZ2h0IChqdW1wIHRhcmdldCBmcm9tIGEgUFIgY29tbWVudCBvciBhIGZpbmRpbmcpLlxuICBjb25zdCBbanVtcExpbmUsIHNldEp1bXBMaW5lXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpXG4gIC8vIEZpbmRpbmdzIGxpc3QgcGFuZWwgdmlzaWJpbGl0eS5cbiAgY29uc3QgW2ZpbmRpbmdzT3Blbiwgc2V0RmluZGluZ3NPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIC8qKiBTZWxlY3QgYSBmaWxlIGFuZCBmbGFzaCBpdHMgbGluZSAoZmluZGluZ3MgLyBQUiBjb21tZW50cykuICovXG4gIGNvbnN0IGp1bXBUbyA9IChmaWxlOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpID0+IHtcbiAgICBzZXRTZWxlY3RlZChmaWxlKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgIHNldEp1bXBMaW5lKGxpbmUgPz8gbnVsbClcbiAgICBzZXRUaW1lb3V0KCgpID0+IHNldEp1bXBMaW5lKG51bGwpLCAyNTAwKVxuICB9XG4gIC8vIENvbGxhcHNlZCBkaXJlY3RvcmllcyBpbiB0aGUgbGVmdC1oYW5kIGZpbGUgdHJlZSAoc2hhcmVkIGFjcm9zcyB0YWJzKS5cbiAgY29uc3QgW2NvbGxhcHNlZERpcnMsIHNldENvbGxhcHNlZERpcnNdID0gdXNlU3RhdGU8UmVhZG9ubHlTZXQ8c3RyaW5nPj4oKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCB0b2dnbGVEaXIgPSB1c2VNZW1vKFxuICAgICgpID0+IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgIHNldENvbGxhcHNlZERpcnMoKHByZXYpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQocHJldilcbiAgICAgICAgaWYgKG5leHQuaGFzKHBhdGgpKSBuZXh0LmRlbGV0ZShwYXRoKVxuICAgICAgICBlbHNlIG5leHQuYWRkKHBhdGgpXG4gICAgICAgIHJldHVybiBuZXh0XG4gICAgICB9KVxuICAgIH0sXG4gICAgW10sXG4gIClcbiAgY29uc3Qgbm90aWNlVGltZXIgPSB1c2VSZWY8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ+KHVuZGVmaW5lZClcblxuICAvLyBDdXJyZW50IHNlc3Npb24ncyBjb252ZXJzYXRpb24gc25hcHNob3QgKHJlYWN0aXZlKSwgZm9yIHRoZSBzZXNzaW9uIHRhYi5cbiAgY29uc3QgY3VycmVudElkID0gdXNlU3luY0V4dGVybmFsU3RvcmUoXG4gICAgdXNlTWVtbygoKSA9PiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiBzZXNzaW9ucy5saXN0LnN1YnNjcmliZShub3RpZnkpLCBbc2Vzc2lvbnNdKSxcbiAgICB1c2VNZW1vKCgpID0+ICgpID0+IHNlc3Npb25zLmxpc3QuZ2V0U25hcHNob3QoKS5jdXJyZW50LCBbc2Vzc2lvbnNdKSxcbiAgKVxuICBjb25zdCBzbmFwc2hvdCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgcmV0dXJuIChub3RpZnk6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IGN1cnJlbnRJZCA/IHNlc3Npb25zLmJpbmRpbmcoY3VycmVudElkKSA6IHVuZGVmaW5lZFxuICAgICAgICBpZiAoIWJpbmRpbmcpIHJldHVybiAoKSA9PiB7fVxuICAgICAgICByZXR1cm4gYmluZGluZy5zZXNzaW9uLnN1YnNjcmliZShub3RpZnkpXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIGJpbmRpbmcgPyBiaW5kaW5nLnNlc3Npb24uZ2V0U25hcHNob3QoKSA6IG51bGxcbiAgICAgIH1cbiAgICB9LCBbc2Vzc2lvbnMsIGN1cnJlbnRJZF0pLFxuICApXG5cbiAgY29uc3Qgcm91bmRzID0gdXNlTWVtbygoKSA9PiAoc25hcHNob3QgPyBjb2xsZWN0U2Vzc2lvblJvdW5kcyhzbmFwc2hvdC5ub2RlcykgOiBbXSksIFtzbmFwc2hvdF0pXG4gIC8vIExlZnQtaGFuZCBmaWxlIHRyZWVzOiBwZXItcm91bmQgdHJlZXMgZm9yIHRoZSBzZXNzaW9uIHRhYiwgb25lIHRyZWUgZm9yXG4gIC8vIHRoZSBnaXQgd29ya2luZyB0cmVlIG9uIHRoZSB3b3Jrc3BhY2UgdGFiLlxuICBjb25zdCBzZXNzaW9uVHJlZXMgPSB1c2VNZW1vKCgpID0+IG5ldyBNYXAocm91bmRzLm1hcCgocikgPT4gW3Iucm91bmQsIGJ1aWxkRmlsZVRyZWUoci5jaGFuZ2VzLCAoYykgPT4gYy5wYXRoKV0pKSwgW3JvdW5kc10pXG4gIGNvbnN0IHRvdGFsU2Vzc2lvbkZpbGVzID0gdXNlTWVtbygoKSA9PiByb3VuZHMucmVkdWNlKChuLCByKSA9PiBuICsgci5jaGFuZ2VzLmxlbmd0aCwgMCksIFtyb3VuZHNdKVxuICBjb25zdCBbc2VsZWN0ZWRSb3VuZCwgc2V0U2VsZWN0ZWRSb3VuZF0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWRQYXRoLCBzZXRTZWxlY3RlZFBhdGhdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRDaGFuZ2UgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCByb3VuZCA9IHJvdW5kcy5maW5kKChyKSA9PiByLnJvdW5kID09PSBzZWxlY3RlZFJvdW5kKVxuICAgIHJldHVybiByb3VuZD8uY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IHNlbGVjdGVkUGF0aCkgPz8gbnVsbFxuICB9LCBbcm91bmRzLCBzZWxlY3RlZFJvdW5kLCBzZWxlY3RlZFBhdGhdKVxuXG4gIGNvbnN0IGN3ZCA9IHN0b3JlU3RhdGUuY3dkXG4gIC8qKiBBY3RpdmUgZ2l0IHJlcG8gZm9yIHdvcmtzcGFjZSBvcGVyYXRpb25zIChtdWx0aS1yZXBvIHNlbGVjdG9yIG92ZXJyaWRlKS4gKi9cbiAgY29uc3QgYWN0aXZlQ3dkID0gcmVwb1BhdGggPz8gY3dkXG5cbiAgY29uc3QgbG9hZFdvcmtzcGFjZSA9IGFzeW5jIChzaWxlbnQgPSBmYWxzZSkgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAoIXNpbGVudCkgc2V0TG9hZGluZyh0cnVlKVxuICAgIHNldEVycm9yKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IFtuZXh0LCBoaXN0LCBuZXh0Q29tbWVudHMsIGJyYW5jaExpc3QsIHByRGF0YSwgcmVwb0xpc3RdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBsb2FkU3RhdHVzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRIaXN0b3J5KGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRDb21tZW50cyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkQnJhbmNoZXMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZFByKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRSZXBvcyhhY3RpdmVDd2QpLFxuICAgICAgXSlcbiAgICAgIHNldFN0YXR1cyhuZXh0KVxuICAgICAgaWYgKGhpc3Qub2spIHNldEhpc3RvcnkoaGlzdC5jb21taXRzKVxuICAgICAgc2V0Q29tbWVudHMobmV4dENvbW1lbnRzKVxuICAgICAgc2V0QnJhbmNoZXMoYnJhbmNoTGlzdClcbiAgICAgIHNldFByKHByRGF0YSlcbiAgICAgIHNldFJlcG9zKHJlcG9MaXN0LnJlcG9zKVxuICAgICAgLy8gRGVmYXVsdCB0aGUgcmVwbyBzZWxlY3RvciB0byB0aGUgd29ya3NwYWNlIHJvb3Qgd2hlbiBpdCBpcyBpdHNlbGYgYSByZXBvLlxuICAgICAgaWYgKHJlcG9QYXRoID09PSBudWxsICYmICFyZXBvTGlzdC5yZXBvcy5zb21lKChyKSA9PiByLnBhdGggPT09IGFjdGl2ZUN3ZCkpIHtcbiAgICAgICAgY29uc3QgZmlyc3QgPSByZXBvTGlzdC5yZXBvc1swXVxuICAgICAgICBpZiAoZmlyc3QgJiYgZmlyc3QucGF0aCAhPT0gY3dkKSBzZXRSZXBvUGF0aChmaXJzdC5wYXRoKVxuICAgICAgfVxuICAgICAgaWYgKG5leHQuZXJyb3IgJiYgIW5leHQuaXNSZXBvKSBzZXRFcnJvcihuZXh0LmVycm9yKVxuICAgICAgc2V0U2VsZWN0ZWQoKHByZXYpID0+IChwcmV2ICYmIG5leHQuZmlsZXMuc29tZSgoZikgPT4gZi5wYXRoID09PSBwcmV2KSA/IHByZXYgOiBuZXh0LmZpbGVzWzBdPy5wYXRoID8/IG51bGwpKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldEVycm9yKGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyBBdXRvLXJlZnJlc2ggdGhlIHdvcmtzcGFjZSBkYXRhOiByZWxvYWQgd2hlbmV2ZXIgdGhlIHRhYiBiZWNvbWVzIGFjdGl2ZSBvclxuICAvLyB0aGUgd29ya3NwYWNlIGNoYW5nZXMsIGFuZCBwZXJpb2RpY2FsbHkgd2hpbGUgdGhlIG92ZXJsYXkgaXMgb3Blbi4gQVxuICAvLyB3b3Jrc3BhY2Ugc3dpdGNoIGNsZWFycyBzdGFsZSBjb21taXQgc2VsZWN0aW9uIGFuZCBoaXN0b3J5IGZpcnN0LlxuICBjb25zdCB3b3Jrc3BhY2VDd2RSZWYgPSB1c2VSZWY8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBwcmV2aW91cyA9IHdvcmtzcGFjZUN3ZFJlZi5jdXJyZW50XG4gICAgd29ya3NwYWNlQ3dkUmVmLmN1cnJlbnQgPSBhY3RpdmVDd2QgPz8gbnVsbFxuICAgIGlmICh0YWIgIT09ICd3b3Jrc3BhY2UnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGlmIChwcmV2aW91cyAhPT0gYWN0aXZlQ3dkKSB7XG4gICAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgICBzZXRIaXN0b3J5KFtdKVxuICAgICAgc2V0Q29tbWVudHMoW10pXG4gICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICBzZXRDb21tZW50UG9wb3ZlcihudWxsKVxuICAgICAgc2V0UmV2aWV3KG51bGwpXG4gICAgICBzZXRQcihudWxsKVxuICAgIH1cbiAgICB2b2lkIGxvYWRXb3Jrc3BhY2UoKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3RhYiwgYWN0aXZlQ3dkXSlcblxuICAvLyBTdXJmYWNlIHdvcmtzcGFjZSBjb21tZW50cyBhYm92ZSB0aGUgY29tcG9zZXIgKENvZGV4LXN0eWxlIGRvY2spLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHBlbmRpbmdDb21tZW50c1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5jd2QgPSBhY3RpdmVDd2QgPz8gbnVsbFxuICAgICAgZC5jb21tZW50cyA9IGNvbW1lbnRzXG4gICAgfSlcbiAgfSwgW2NvbW1lbnRzLCBhY3RpdmVDd2RdKVxuXG4gIC8vIEp1bXAgdG8gYSBjaGFuZ2UgYmxvY2sgZnJvbSB0aGUgY29tcG9zZXIgZG9jayAoY29tbWVudCBjbGljaykuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZm9jdXMgPSBzdG9yZVN0YXRlLmZvY3VzXG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgIWN3ZCB8fCAhZm9jdXMpIHJldHVyblxuICAgIHNldFRhYignd29ya3NwYWNlJylcbiAgICBzZXRTZWxlY3RlZChmb2N1cy5wYXRoKVxuICAgIHNldEp1bXBMaW5lKGZvY3VzLmxpbmUgPz8gbnVsbClcbiAgICBjb25zdCBzY3JvbGxUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKGZvY3VzLmxpbmUgIT0gbnVsbCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kc2RyLWxpbmU9XCIke2ZvY3VzLmxpbmV9XCJdYCk/LnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdjZW50ZXInLCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgICAgIH1cbiAgICB9LCA4MClcbiAgICBjb25zdCBjbGVhclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbFRpbWVyKVxuICAgICAgY2xlYXJUaW1lb3V0KGNsZWFyVGltZXIpXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3N0b3JlU3RhdGUua2V5XSlcblxuICAvLyBLZWVwIHN0YWdlZC91bnN0YWdlZC9oaXN0b3J5IGZyZXNoIHdoaWxlIHRoZSB3b3Jrc3BhY2UgdGFiIGlzIG9wZW4uXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgdGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBjb25zdCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHZvaWQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgIH0sIDE1MDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKHRpbWVyKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3N0b3JlU3RhdGUub3BlbiwgdGFiLCBhY3RpdmVDd2RdKVxuXG4gIC8vIEJyYW5jaCBzY29wZTogZGlmZiB0aGUgd29ya3RyZWUgYWdhaW5zdCB0aGUgc2VsZWN0ZWQgYmFzZSBicmFuY2guXG4gIC8vIERlZmF1bHQgdGhlIGJhc2UgdG8gdGhlIGZpcnN0IGJyYW5jaCB0aGF0IGlzbid0IHRoZSBjdXJyZW50IG9uZS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2NvcGUgIT09ICdicmFuY2gnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGNvbnN0IGN1cnJlbnQgPSBzdGF0dXM/LmJyYW5jaCA/PyBudWxsXG4gICAgaWYgKGJhc2VCcmFuY2ggPT09IG51bGwgJiYgYnJhbmNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmFsbGJhY2sgPSBicmFuY2hlcy5maW5kKChiKSA9PiBiICE9PSBjdXJyZW50KSA/PyBicmFuY2hlc1swXVxuICAgICAgc2V0QmFzZUJyYW5jaChmYWxsYmFjaylcbiAgICB9XG4gIH0sIFtzY29wZSwgYWN0aXZlQ3dkLCBicmFuY2hlcywgYmFzZUJyYW5jaCwgc3RhdHVzPy5icmFuY2hdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlICE9PSAnYnJhbmNoJyB8fCAhYWN0aXZlQ3dkIHx8ICFiYXNlQnJhbmNoKSB7XG4gICAgICBzZXRCYXNlU3RhdHVzKG51bGwpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGFjdGl2ZUN3ZCl9JmJhc2U9JHtlbmNvZGVVUklDb21wb25lbnQoYmFzZUJyYW5jaCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiBudWxsKSkgYXMgU3RhdHVzUmVzcG9uc2UgfCBudWxsXG4gICAgICBpZiAoIWNhbmNlbGxlZCAmJiBkYXRhKSB7XG4gICAgICAgIHNldEJhc2VTdGF0dXMoZGF0YSlcbiAgICAgICAgaWYgKGRhdGEuZXJyb3IgJiYgYmFzZVN0YXR1cz8uZXJyb3IgIT09IGRhdGEuZXJyb3IpIHNldEVycm9yKGRhdGEuZXJyb3IpXG4gICAgICB9XG4gICAgfSkoKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjYW5jZWxsZWQgPSB0cnVlXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3Njb3BlLCBhY3RpdmVDd2QsIGJhc2VCcmFuY2hdKVxuXG4gIC8vIERlZmF1bHQgc2VsZWN0aW9uIGZvciB0aGUgc2Vzc2lvbiB0YWIgZm9sbG93cyB0aGUgZmlyc3Qgcm91bmQgd2l0aCBjaGFuZ2VzLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFJvdW5kID09PSBudWxsICYmIHJvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRTZWxlY3RlZFJvdW5kKHJvdW5kc1swXS5yb3VuZClcbiAgICAgIHNldFNlbGVjdGVkUGF0aChyb3VuZHNbMF0uY2hhbmdlc1swXT8ucGF0aCA/PyBudWxsKVxuICAgIH1cbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbikgcmV0dXJuXG4gICAgY29uc3Qgb25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICBkLm9wZW4gPSBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgfSwgW3N0b3JlU3RhdGUub3Blbl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW5vdGljZSkgcmV0dXJuXG4gICAgbm90aWNlVGltZXIuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4gc2V0Tm90aWNlKG51bGwpLCAzMDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQobm90aWNlVGltZXIuY3VycmVudClcbiAgfSwgW25vdGljZV0pXG5cbiAgY29uc3QgZmlsZXMgPSBzdGF0dXM/LmlzUmVwbyA/IHN0YXR1cy5maWxlcyA6IFtdXG4gIGNvbnN0IHN0YWdlZEZpbGVzID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGYpID0+IGYuc3RhZ2VkKSwgW2ZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiAhZi5zdGFnZWQpLCBbZmlsZXNdKVxuXG4gIC8vIFwiTGFzdCB0dXJuXCIgc2NvcGU6IHBhdGhzIHRoZSBhZ2VudCB0b3VjaGVkIGluIHRoZSBtb3N0IHJlY2VudCByb3VuZC5cbiAgY29uc3QgbGFzdFJvdW5kUGF0aHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgIGNvbnN0IGxhc3QgPSByb3VuZHNbcm91bmRzLmxlbmd0aCAtIDFdXG4gICAgaWYgKCFsYXN0IHx8ICFjd2QpIHJldHVybiBzZXRcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBsYXN0LmNoYW5nZXMpIHtcbiAgICAgIHNldC5hZGQoY2hhbmdlLnBhdGgpXG4gICAgICBjb25zdCBwID0gY2hhbmdlLnBhdGhcbiAgICAgIGlmIChpc0Fic1BhdGgocCkpIHtcbiAgICAgICAgY29uc3QgcmVsID0gcC5zdGFydHNXaXRoKGN3ZCkgPyBwLnNsaWNlKGN3ZC5sZW5ndGgpLnJlcGxhY2UoL15bXFxcXC9dKy8sICcnKSA6IHBcbiAgICAgICAgc2V0LmFkZChyZWwpXG4gICAgICAgIHNldC5hZGQoYmFzZU5hbWUocCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXQuYWRkKGJhc2VOYW1lKHApKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2V0XG4gIH0sIFtyb3VuZHMsIGN3ZF0pXG5cbiAgLyoqIFRoZSBmaWxlIHNsaWNlIHRoZSBjdXJyZW50IHNjb3BlIHNob3dzLiAqL1xuICBjb25zdCBzY29wZUZpbGVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgc3dpdGNoIChzY29wZSkge1xuICAgICAgY2FzZSAndW5zdGFnZWQnOlxuICAgICAgICByZXR1cm4gdW5zdGFnZWRGaWxlc1xuICAgICAgY2FzZSAnc3RhZ2VkJzpcbiAgICAgICAgcmV0dXJuIHN0YWdlZEZpbGVzXG4gICAgICBjYXNlICdicmFuY2gnOlxuICAgICAgICByZXR1cm4gYmFzZVN0YXR1cz8uZmlsZXMgPz8gW11cbiAgICAgIGNhc2UgJ2xhc3QtdHVybic6XG4gICAgICAgIGlmIChsYXN0Um91bmRQYXRocy5zaXplID09PSAwKSByZXR1cm4gW11cbiAgICAgICAgcmV0dXJuIGZpbGVzLmZpbHRlcigoZikgPT4ge1xuICAgICAgICAgIGlmIChsYXN0Um91bmRQYXRocy5oYXMoZi5wYXRoKSB8fCBsYXN0Um91bmRQYXRocy5oYXMoYmFzZU5hbWUoZi5wYXRoKSkpIHJldHVybiB0cnVlXG4gICAgICAgICAgLy8gU2Vzc2lvbiBwYXRocyBtYXkgYmUgd29ya3NwYWNlLXJvb3QgcmVsYXRpdmUgb3IgYWJzb2x1dGUgKHRoZSByZXBvIGNhblxuICAgICAgICAgIC8vIGJlIGEgc3ViZGlyZWN0b3J5IG9mIHRoZSB3b3Jrc3BhY2UpIFx1MjAxNCBtYXRjaCBhbnkgc3VmZml4IGZvcm0uXG4gICAgICAgICAgY29uc3Qgc3VmZml4ID0gYC8ke2YucGF0aH1gXG4gICAgICAgICAgZm9yIChjb25zdCBwIG9mIGxhc3RSb3VuZFBhdGhzKSB7XG4gICAgICAgICAgICBpZiAocC5lbmRzV2l0aChzdWZmaXgpKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmaWxlc1xuICAgIH1cbiAgfSwgW3Njb3BlLCB1bnN0YWdlZEZpbGVzLCBzdGFnZWRGaWxlcywgYmFzZVN0YXR1cywgZmlsZXMsIGxhc3RSb3VuZFBhdGhzXSlcblxuICAvKiogU2NvcGVzIHdoZXJlIGZpbGUvaHVuayBhY2NlcHRcdTAwQjdyZXZlcnRcdTAwQjd1bnN0YWdlIGFuZCBjb21taXQvcHVzaCBtYWtlIHNlbnNlLiAqL1xuICBjb25zdCBhbGxvd0FjdGlvbnMgPSBzY29wZSAhPT0gJ2JyYW5jaCcgJiYgc2NvcGUgIT09ICdjb21taXQnXG5cbiAgLyoqIEZpbGVzIHRoZSBjdXJyZW50IHNjb3BlIGNhbiBoYW5kIHRvIHRoZSBBSSByZXZpZXcuICovXG4gIGNvbnN0IHJldmlld2FibGVGaWxlcyA9IHNjb3BlID09PSAnYnJhbmNoJyA/IGJhc2VTdGF0dXM/LmZpbGVzPy5sZW5ndGggPz8gMCA6IGZpbGVzLmxlbmd0aFxuICBjb25zdCBzdGFnZWRDb3VudCA9IHN0YWdlZEZpbGVzLmxlbmd0aFxuICAvLyBOT1RFOiBob29rcyBtdXN0IGFsbCBydW4gYmVmb3JlIHRoZSBlYXJseSByZXR1cm4gYmVsb3cgKFJlYWN0IGhvb2sgb3JkZXIpLlxuICBjb25zdCBzdGFnZWRUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHN0YWdlZEZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3N0YWdlZEZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHVuc3RhZ2VkRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbdW5zdGFnZWRGaWxlc10pXG4gIGNvbnN0IHNjb3BlVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZShzY29wZUZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3Njb3BlRmlsZXNdKVxuICBjb25zdCBjb21taXRGaWxlc1RyZWUgPSB1c2VNZW1vKFxuICAgICgpID0+IChjb21taXREaWZmPy5vayA/IGJ1aWxkRmlsZVRyZWUoY29tbWl0RGlmZi5maWxlcywgKGYpID0+IGYucGF0aCkgOiBbXSksXG4gICAgW2NvbW1pdERpZmZdLFxuICApXG5cbiAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgIWN3ZCkgcmV0dXJuIG51bGxcblxuICBjb25zdCBzZWxlY3RlZEZpbGUgPSBzY29wZUZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWQpID8/IG51bGxcbiAgY29uc3QgdG90YWxBZGRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuYWRkZWQsIDApXG4gIGNvbnN0IHRvdGFsRGVsZXRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuZGVsZXRlZCwgMClcblxuICAvLyBDb21taXQtZGV0YWlsIHZpZXc6IHRoZSBzZWxlY3RlZCBmaWxlIHdpdGhpbiB0aGUgc2VsZWN0ZWQgY29tbWl0LlxuICBjb25zdCBjb21taXRTZWdtZW50cyA9IGNvbW1pdERpZmY/Lm9rID8gc3BsaXRDb21taXREaWZmKGNvbW1pdERpZmYuZGlmZikgOiBbXVxuICBjb25zdCBjb21taXRBY3RpdmVGaWxlID0gc2VsZWN0ZWRDb21taXQgJiYgY29tbWl0RGlmZj8ub2sgPyBjb21taXREaWZmLmZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWRDb21taXRGaWxlKSA/PyBudWxsIDogbnVsbFxuICBjb25zdCBjb21taXRBY3RpdmVUZXh0ID0gY29tbWl0QWN0aXZlRmlsZVxuICAgID8gY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/IGNvbW1pdERpZmY/LmRpZmYgPz8gJydcbiAgICA6IGNvbW1pdERpZmY/LmRpZmYgPz8gJydcblxuICAvKiogTGVhZiByb3cgc2hhcmVkIGJ5IHRoZSBzdGFnZWQvdW5zdGFnZWQgZmlsZSB0cmVlcy4gKi9cbiAgY29uc3Qgd29ya3NwYWNlTGVhZiA9ICh7IGl0ZW06IGZpbGUsIG5hbWUgfTogeyBpdGVtOiBEaWZmRmlsZTsgbmFtZTogc3RyaW5nIH0pID0+IChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgYXJpYS1zZWxlY3RlZD17ZmlsZS5wYXRoID09PSBzZWxlY3RlZH1cbiAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7ZmlsZS5wYXRoID09PSBzZWxlY3RlZCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkKGZpbGUucGF0aClcbiAgICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRQb3BvdmVyKG51bGwpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoaXBDbGFzcyhmaWxlLnN0YXR1cyl9YH0+e2ZpbGUudW50cmFja2VkID8gJz8/JyA6IGZpbGUuc3RhdHVzfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2ZpbGUucGF0aH0+e25hbWV9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLXN0YXRcIj5cbiAgICAgICAge2ZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICA8L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcblxuICBjb25zdCBydW5BcHBseSA9IGFzeW5jIChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg/OiBzdHJpbmcpID0+IHtcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcHBseUNoYW5nZXMoYWN0aXZlQ3dkID8/IGN3ZCA/PyAnJywgYWN0aW9uLCBwYXRoKVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBjb25zdCB2ZXJiID0gYWN0aW9uID09PSAnYWNjZXB0JyA/IHQoJ3Jldmlldy5hY2NlcHRlZCcpIDogYWN0aW9uID09PSAndW5zdGFnZScgPyB0KCdyZXZpZXcudW5zdGFnZWQnKSA6IHQoJ3Jldmlldy5yZXZlcnRlZCcpXG4gICAgICAgIHNldE5vdGljZSh7XG4gICAgICAgICAga2luZDogJ29rJyxcbiAgICAgICAgICB0ZXh0OiBwYXRoXG4gICAgICAgICAgICA/IHQoJ3Jldmlldy5kb25lT25lJywgeyBhY3Rpb246IHZlcmIsIHBhdGggfSlcbiAgICAgICAgICAgIDogcmVzdWx0LmRlbGV0ZWQgJiYgcmVzdWx0LmRlbGV0ZWQubGVuZ3RoID4gMFxuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5kb25lRGVsZXRlZCcsIHsgYWN0aW9uOiB2ZXJiLCBjb3VudDogZmlsZXMubGVuZ3RoLCBkZWxldGVkOiByZXN1bHQuZGVsZXRlZC5sZW5ndGggfSlcbiAgICAgICAgICAgICAgOiB0KCdyZXZpZXcuZG9uZScsIHsgYWN0aW9uOiB2ZXJiLCBjb3VudDogZmlsZXMubGVuZ3RoIH0pLFxuICAgICAgICB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb25GaWxlQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ3JldmVydCcgJiYgY29uZmlybSAhPT0gJ2ZpbGUnKSB7XG4gICAgICBzZXRDb25maXJtKCdmaWxlJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdmaWxlJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCBydW5BcHBseShhY3Rpb24sIHBhdGgpXG4gIH1cblxuICBjb25zdCBvbkFsbEFjdGlvbiA9IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnYWxsJykge1xuICAgICAgc2V0Q29uZmlybSgnYWxsJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdhbGwnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbilcbiAgfVxuXG4gIC8qKiBBcHBseSBvbmUgaHVuayAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KSBvZiB0aGUgc2VsZWN0ZWQgZmlsZS4gKi9cbiAgY29uc3Qgb25IdW5rQWN0aW9uID0gYXN5bmMgKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogRGlmZkh1bmspID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkRmlsZSB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcGx5SHVuayhhY3RpdmVDd2QgPz8gY3dkID8/ICcnLCBzZWxlY3RlZEZpbGUucGF0aCwgYWN0aW9uLCBodW5rLnRleHQpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIGNvbnN0IHZlcmIgPSBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiBhY3Rpb24gPT09ICd1bnN0YWdlJyA/IHQoJ3Jldmlldy51bnN0YWdlZCcpIDogdCgncmV2aWV3LnJldmVydGVkJylcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmRvbmVPbmUnLCB7IGFjdGlvbjogdmVyYiwgcGF0aDogc2VsZWN0ZWRGaWxlLnBhdGggfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gaW5saW5lIGNvbW1lbnRzIC0tLS1cbiAgY29uc3Qgb3BlbkNvbW1lbnQgPSAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCkgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm5cbiAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZSwgbmV3TGluZSB9KVxuICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICAgIHNldENvbW1lbnRQb3BvdmVyKG51bGwpXG4gIH1cblxuICBjb25zdCBzYXZlQ29tbWVudCA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkRmlsZSB8fCAhY29tbWVudEVkaXRvciB8fCBidXN5KSByZXR1cm5cbiAgICBjb25zdCB0ZXh0ID0gY29tbWVudFRleHQudHJpbSgpXG4gICAgaWYgKCF0ZXh0KSByZXR1cm5cbiAgICBjb25zdCBjb21tZW50OiBSZXZpZXdDb21tZW50ID0ge1xuICAgICAgaWQ6IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5yYW5kb21VVUlEID8gY3J5cHRvLnJhbmRvbVVVSUQoKSA6IGAke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMil9YCxcbiAgICAgIHBhdGg6IHNlbGVjdGVkRmlsZS5wYXRoLFxuICAgICAgbGluZU5ldzogY29tbWVudEVkaXRvci5uZXdMaW5lLFxuICAgICAgbGluZU9sZDogY29tbWVudEVkaXRvci5vbGRMaW5lLFxuICAgICAgdGV4dCxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIH1cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5leHQgPSBbLi4uY29tbWVudHMsIGNvbW1lbnRdXG4gICAgICBpZiAoYWN0aXZlQ3dkICYmIChhd2FpdCBzYXZlQ29tbWVudHMoYWN0aXZlQ3dkLCBuZXh0KSkpIHtcbiAgICAgICAgc2V0Q29tbWVudHMobmV4dClcbiAgICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgnY29tbWVudC5zYXZlZCcpIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNhbmNlbENvbW1lbnQgPSAoKSA9PiB7XG4gICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICB9XG5cbiAgY29uc3QgZGVsZXRlQ29tbWVudCA9IGFzeW5jIChpZDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVyblxuICAgIGNvbnN0IG5leHQgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGMuaWQgIT09IGlkKVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gQUkgcmV2aWV3ICgvcmV2aWV3KTogcnVuLCByZS1ydW4sIGFuZCBoYW5kIGZpbmRpbmdzIHRvIHRoZSBhZ2VudCAtLS0tXG4gIGNvbnN0IG9uUmV2aWV3ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkIHx8IHJldmlld2luZyB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRSZXZpZXdpbmcodHJ1ZSlcbiAgICBzZXRSZXZpZXcobnVsbClcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmV2aWV3U2NvcGUgPSBzY29wZSA9PT0gJ2JyYW5jaCcgPyAnYnJhbmNoJyA6IHNjb3BlID09PSAnY29tbWl0JyAmJiBzZWxlY3RlZENvbW1pdCA/ICdjb21taXQnIDogJ3VuY29tbWl0dGVkJ1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuUmV2aWV3KGFjdGl2ZUN3ZCwgY3VycmVudElkID8/IG51bGwsIHJldmlld1Njb3BlLCBiYXNlQnJhbmNoID8/IHVuZGVmaW5lZCwgc2VsZWN0ZWRDb21taXQ/Lmhhc2ggPz8gdW5kZWZpbmVkKVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBzZXRSZXZpZXcocmVzdWx0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5yZXZpZXdGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5yZXZpZXdGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRSZXZpZXdpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIENvbXBvc2UgYSBcInNlbmQgdG8gYWdlbnRcIiBtZXNzYWdlIGZyb20gZmluZGluZ3Mgb3IgUFIgY29tbWVudHMuICovXG4gIGNvbnN0IGNvbXBvc2VGaW5kaW5nc01lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUmV2aWV3RmluZGluZ1tdPigpXG4gICAgZm9yIChjb25zdCBmIG9mIHJldmlldz8uZmluZGluZ3MgPz8gW10pIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBieVBhdGguZ2V0KGYuZmlsZSlcbiAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goZilcbiAgICAgIGVsc2UgYnlQYXRoLnNldChmLmZpbGUsIFtmXSlcbiAgICB9XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gWydcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEIgQUkgXHU4QkM0XHU1QkExXHU1M0QxXHU3M0IwXHVGRjA4QWRkcmVzcyB0aGUgcmV2aWV3IGZpbmRpbmdzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJywgJyddXG4gICAgZm9yIChjb25zdCBbcGF0aCwgbGlzdF0gb2YgYnlQYXRoKSB7XG4gICAgICBsaW5lcy5wdXNoKGAjIyAke3BhdGh9YClcbiAgICAgIGZvciAoY29uc3QgZiBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gZi5saW5lU3RhcnQgPT09IGYubGluZUVuZCA/IGA6JHtmLmxpbmVTdGFydH1gIDogYDoke2YubGluZVN0YXJ0fS0ke2YubGluZUVuZH1gXG4gICAgICAgIGxpbmVzLnB1c2goYC0gWyR7Zi5wcmlvcml0eX1dICR7cGF0aH0ke3JhbmdlfTogJHtmLnRpdGxlfSBcdTIwMTQgJHtmLmRldGFpbH1gKVxuICAgICAgICBpZiAoZi5zdWdnZXN0aW9uKSBsaW5lcy5wdXNoKGAgIFxcYFxcYFxcYFxcbiR7Zi5zdWdnZXN0aW9ufVxcbiAgXFxgXFxgXFxgYClcbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpXG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgY29uc3QgY29tcG9zZVByTWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGlmICghcHI/LnByIHx8IHByLmNvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW2BcdThCRjdcdTU5MDRcdTc0MDYgUFIgIyR7cHIucHIubnVtYmVyfVx1RkYwOCR7cHIucHIudGl0bGV9XHVGRjA5XHU3Njg0XHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgUFIgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUFgLCAnJ11cbiAgICBmb3IgKGNvbnN0IGMgb2YgcHIuY29tbWVudHMpIHtcbiAgICAgIGNvbnN0IGFuY2hvciA9IGMucGF0aCA/IGAke2MucGF0aH0ke2MubGluZSA/IGA6JHtjLmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCdcbiAgICAgIGxpbmVzLnB1c2goYC0gJHthbmNob3J9ICgke2MuYXV0aG9yfSk6ICR7Yy5ib2R5fWApXG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgY29uc3Qgb3BlblNlbmRQYW5lbFdpdGggPSAodGV4dDogc3RyaW5nKSA9PiB7XG4gICAgc2V0U2VuZFRleHQodGV4dClcbiAgICBzZXRTZW5kT3Blbih0cnVlKVxuICB9XG5cbiAgLy8gLS0tLSBlZGl0b3IgaW50ZWdyYXRpb24gKHZpYSBkc2gtcGx1Z2luLW9wZW4tZWRpdG9yKSAtLS0tXG4gIGNvbnN0IG9wZW5GaWxlID0gYXN5bmMgKHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlcikgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkIHx8IGJ1c3kpIHJldHVyblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG9wZW5JbkVkaXRvcihhY3RpdmVDd2QsIHBhdGgsIGxpbmUpXG4gICAgaWYgKCFyZXN1bHQub2spIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGAke3QoJ2VkaXRvci5mYWlsZWQnKX06ICR7cmVzdWx0LmVycm9yID8/ICcnfWAgfSlcbiAgfVxuXG4gIC8qKiBKdW1wIGZyb20gYSBQUiBjb21tZW50IHRvIHRoZSBmaWxlIChhbmQgaGlnaGxpZ2h0IHRoZSBsaW5lKS4gKi9cbiAgY29uc3Qgb25QckNvbW1lbnRDbGljayA9IChwYXRoOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkLCBsaW5lOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgaWYgKHBhdGgpIGp1bXBUbyhwYXRoLCBsaW5lID8/IHVuZGVmaW5lZClcbiAgICBlbHNlIHNldEp1bXBMaW5lKG51bGwpXG4gIH1cblxuICAvLyAtLS0tIGZlZWRiYWNrIGxvb3A6IGNvbW1lbnRzIFx1MjE5MiBhZ2VudCAocHJvbXB0IGluamVjdGlvbiwgY29weSBmYWxsYmFjaykgLS0tLVxuICBjb25zdCBjb21wb3NlUmV2aWV3TWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGlmIChjb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdDb21tZW50W10+KClcbiAgICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBieVBhdGguZ2V0KGMucGF0aClcbiAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goYylcbiAgICAgIGVsc2UgYnlQYXRoLnNldChjLnBhdGgsIFtjXSlcbiAgICB9XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW1xuICAgICAgJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQlx1OTQ4OFx1NUJGOVx1NUY1M1x1NTI0RFx1NURFNVx1NEY1Q1x1NTMzQVx1NzY4NFx1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMVx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsXG4gICAgICAnJyxcbiAgICBdXG4gICAgZm9yIChjb25zdCBbcGF0aCwgbGlzdF0gb2YgYnlQYXRoKSB7XG4gICAgICBsaW5lcy5wdXNoKGAjIyAke3BhdGh9YClcbiAgICAgIGZvciAoY29uc3QgYyBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IGFuY2hvciA9IGMubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjLmxpbmVOZXd9YCA6IGAgKG9sZCBsaW5lICR7Yy5saW5lT2xkfSlgXG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXRofSR7YW5jaG9yfTogJHtjLnRleHR9YClcbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpXG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgY29uc3Qgb3BlblNlbmRQYW5lbCA9ICgpID0+IHtcbiAgICBzZXRTZW5kVGV4dChjb21wb3NlUmV2aWV3TWVzc2FnZSgpKVxuICAgIHNldFNlbmRPcGVuKHRydWUpXG4gIH1cblxuICBjb25zdCBzZW5kVG9BZ2VudCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB0ZXh0ID0gc2VuZFRleHQudHJpbSgpXG4gICAgaWYgKCF0ZXh0IHx8IGJ1c3kpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3Qgb3V0Y29tZSA9IGF3YWl0IGluamVjdFRvU2Vzc2lvbihzZXNzaW9ucywgY3VycmVudElkID8/IG51bGwsIHRleHQpXG4gICAgICBzZXRTZW5kT3BlbihmYWxzZSlcbiAgICAgIGlmIChvdXRjb21lID09PSAnc2VudCcpIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5zZW50VG9BZ2VudCcpIH0pXG4gICAgICBlbHNlIGlmIChvdXRjb21lID09PSAnY29waWVkJykgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmNvcGllZCcpIH0pXG4gICAgICBlbHNlIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ3Jldmlldy5jb3B5RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogQ29tbWl0IHRoZSBzdGFnZWQgY2hhbmdlcyB3aXRoIHRoZSBlbnRlcmVkIG1lc3NhZ2UuICovXG4gIGNvbnN0IG9uQ29tbWl0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBjb21taXRNZXNzYWdlLnRyaW0oKVxuICAgIGlmICghbWVzc2FnZSB8fCBidXN5IHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkdpdEFjdGlvbihhY3RpdmVDd2QsICdjb21taXQnLCBtZXNzYWdlKVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBzZXRDb21taXRNZXNzYWdlKCcnKVxuICAgICAgICBjb25zdCBzdW1tYXJ5ID0gcmVzdWx0Lmhhc2ggPyBgJHtyZXN1bHQuaGFzaH0gJHtyZXN1bHQuc3ViamVjdCA/PyAnJ31gLnRyaW0oKSA6IChyZXN1bHQuc3ViamVjdCA/PyAnJylcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmNvbW1pdHRlZCcsIHsgc3VtbWFyeSB9KSB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmNvbW1pdEZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmNvbW1pdEZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIFB1c2ggdGhlIGN1cnJlbnQgYnJhbmNoIChkb3VibGUtY2xpY2sgdG8gY29uZmlybSkuICovXG4gIGNvbnN0IG9uUHVzaCA9ICgpID0+IHtcbiAgICBpZiAoYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAoY29uZmlybSAhPT0gJ3B1c2gnKSB7XG4gICAgICBzZXRDb25maXJtKCdwdXNoJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdwdXNoJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgc2V0QnVzeSh0cnVlKVxuICAgICAgc2V0Tm90aWNlKG51bGwpXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAncHVzaCcpXG4gICAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcucHVzaGVkJykgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LnB1c2hGYWlsZWQnKSB9KVxuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LnB1c2hGYWlsZWQnKSB9KVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICAgIH1cbiAgICB9KSgpXG4gIH1cblxuICAvKiogU2VsZWN0IGEgbG9jYWwgY29tbWl0IGFuZCBsb2FkIGl0cyBkaWZmIGludG8gdGhlIHJpZ2h0IHBhbmUuICovXG4gIGNvbnN0IHNlbGVjdENvbW1pdCA9IChjb21taXQ6IENvbW1pdEluZm8pID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICBzZXRTZWxlY3RlZENvbW1pdChjb21taXQpXG4gICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICBzZXRDb21taXREaWZmTG9hZGluZyh0cnVlKVxuICAgIHZvaWQgbG9hZENvbW1pdERpZmYoYWN0aXZlQ3dkLCBjb21taXQuaGFzaClcbiAgICAgIC50aGVuKChkKSA9PiB7XG4gICAgICAgIHNldENvbW1pdERpZmYoZClcbiAgICAgICAgc2V0Q29tbWl0RGlmZkxvYWRpbmcoZmFsc2UpXG4gICAgICAgIC8vIERlZmF1bHQgdGhlIGZpbGUgdHJlZSB0byB0aGUgZmlyc3QgY2hhbmdlZCBmaWxlLlxuICAgICAgICBpZiAoZC5vayAmJiBkLmZpbGVzLmxlbmd0aCA+IDApIHNldFNlbGVjdGVkQ29tbWl0RmlsZShkLmZpbGVzWzBdLnBhdGgpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHNldENvbW1pdERpZmZMb2FkaW5nKGZhbHNlKSlcbiAgfVxuXG4gIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwiZHNkci1vdmVybGF5XCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jdXJyZW50VGFyZ2V0KSBjbG9zZSgpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1wYW5lbFwiXG4gICAgICAgIHJvbGU9XCJkaWFsb2dcIlxuICAgICAgICBhcmlhLW1vZGFsPVwidHJ1ZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfVxuICAgICAgICBzdHlsZT17eyB3aWR0aDogYCR7cHJlZnMud2lkdGh9cHhgLCBoZWlnaHQ6IGAke3ByZWZzLmhlaWdodH1weGAsIC4uLmRpZmZTdHlsZVZhcnMocHJlZnMpIH0gYXMgQ1NTUHJvcGVydGllc31cbiAgICAgID5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJlXCJcbiAgICAgICAgICBvblJlc2l6ZT17KGR4KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC53aWR0aCA9IE1hdGgubWF4KE1JTl9QQU5FTF9XLCBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCAtIDY0LCBkLndpZHRoICsgZHgpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwic1wiXG4gICAgICAgICAgb25SZXNpemU9eyhfZHgsIGR5KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5oZWlnaHQgPSBNYXRoLm1heChNSU5fUEFORUxfSCwgTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gNjQsIGQuaGVpZ2h0ICsgZHkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwic2VcIlxuICAgICAgICAgIG9uUmVzaXplPXsoZHgsIGR5KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC53aWR0aCA9IE1hdGgubWF4KE1JTl9QQU5FTF9XLCBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCAtIDY0LCBkLndpZHRoICsgZHgpKVxuICAgICAgICAgICAgICBkLmhlaWdodCA9IE1hdGgubWF4KE1JTl9QQU5FTF9ILCBNYXRoLm1pbih3aW5kb3cuaW5uZXJIZWlnaHQgLSA2NCwgZC5oZWlnaHQgKyBkeSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWhlYWRlclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdGl0bGVcIj57dCgncmV2aWV3LnRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdGFic1wiIHJvbGU9XCJ0YWJsaXN0XCIgYXJpYS1sYWJlbD17dCgncmV2aWV3LnRpdGxlJyl9PlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3RhYiA9PT0gJ3Nlc3Npb24nfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXRhYiR7dGFiID09PSAnc2Vzc2lvbicgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3Nlc3Npb24nKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3QoJ3RhYi5zZXNzaW9uJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0YWIgPT09ICd3b3Jrc3BhY2UnfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXRhYiR7dGFiID09PSAnd29ya3NwYWNlJyA/ICcgZHNkci10YWItYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFRhYignd29ya3NwYWNlJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0KCd0YWIud29ya3NwYWNlJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAge3RhYiA9PT0gJ3dvcmtzcGFjZScgJiYgc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNjb3BlXCI+XG4gICAgICAgICAgICAgIHtyZXBvcy5sZW5ndGggPiAxID8gKFxuICAgICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdyZXBvLmxhYmVsJyl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cmVwb1BhdGggPz8gYWN0aXZlQ3dkID8/ICcnfVxuICAgICAgICAgICAgICAgICAgb3B0aW9ucz17cmVwb3MubWFwKChyKSA9PiAoeyB2YWx1ZTogci5wYXRoLCBsYWJlbDogYCR7YmFzZU5hbWUoci5wYXRoKX0ke3IuYnJhbmNoID8gYCAoJHtyLmJyYW5jaH0pYCA6ICcnfWAgfSkpfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldFJlcG9QYXRoKHYpXG4gICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgICAgICAgICAgICAgICAgIHNldFJldmlldyhudWxsKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdzY29wZS5sYWJlbCcpfVxuICAgICAgICAgICAgICAgIHZhbHVlPXtzY29wZX1cbiAgICAgICAgICAgICAgICBvcHRpb25zPXtTQ09QRV9PUFRJT05TLm1hcCgocykgPT4gKHsgdmFsdWU6IHMuaWQsIGxhYmVsOiB0KHMubGFiZWwpIH0pKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNldFNjb3BlKHYgYXMgV29ya3NwYWNlU2NvcGUpXG4gICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2JyYW5jaCcgPyAoXG4gICAgICAgICAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3Njb3BlLmJhc2UnKX1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtiYXNlQnJhbmNoID8/ICcnfVxuICAgICAgICAgICAgICAgICAgb3B0aW9ucz17YnJhbmNoZXMubWFwKChiKSA9PiAoeyB2YWx1ZTogYiwgbGFiZWw6IGIgfSkpfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldEJhc2VCcmFuY2h9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zdWJ0aXRsZVwiPlxuICAgICAgICAgICAge3RhYiA9PT0gJ3Nlc3Npb24nXG4gICAgICAgICAgICAgID8gdCgncmV2aWV3LnNlc3Npb25TdGF0cycsIHsgcm91bmRzOiByb3VuZHMubGVuZ3RoLCBmaWxlczogdG90YWxTZXNzaW9uRmlsZXMgfSlcbiAgICAgICAgICAgICAgOiBzdGF0dXM/LmlzUmVwb1xuICAgICAgICAgICAgICAgID8gYCR7c3RhdHVzLmJyYW5jaCA/PyB0KCdyZXZpZXcuZGV0YWNoZWQnKX0gXHUwMEI3ICR7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiB0b3RhbEFkZGVkLCBkZWxldGVkOiB0b3RhbERlbGV0ZWQgfSl9JHtzdGF0dXMuYWhlYWQgPiAwID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuYWhlYWQnLCB7IG46IHN0YXR1cy5haGVhZCB9KX1gIDogJyd9JHtzdGF0dXMuYmVoaW5kID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmJlaGluZCcsIHsgbjogc3RhdHVzLmJlaGluZCB9KX1gIDogJyd9YFxuICAgICAgICAgICAgICAgIDogdCgncmV2aWV3Lm5vdFJlcG8nKX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnICYmIGFsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCBmaWxlcy5sZW5ndGggPT09IDB9IG9uQ2xpY2s9eygpID0+IG9uQWxsQWN0aW9uKCdhY2NlcHQnKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5hY2NlcHRBbGwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIHtzdGFnZWRDb3VudCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBydW5BcHBseSgndW5zdGFnZScpfT5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcudW5zdGFnZUFsbCcpfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuIGRzZHItYnRuLWRhbmdlciR7Y29uZmlybSA9PT0gJ2FsbCcgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCBmaWxlcy5sZW5ndGggPT09IDB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25BbGxBY3Rpb24oJ3JldmVydCcpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdhbGwnID8gdCgncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnKSA6IHQoJ3Jldmlldy5yZXZlcnRBbGwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2NvbW1pdE1lc3NhZ2V9XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3QoJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcicpfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldENvbW1pdE1lc3NhZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICBvbktleURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykgdm9pZCBvbkNvbW1pdCgpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeSB8fCAhY29tbWl0TWVzc2FnZS50cmltKCkgfHwgc3RhZ2VkQ291bnQgPT09IDB9IG9uQ2xpY2s9eygpID0+IHZvaWQgb25Db21taXQoKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jb21taXQnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBzdGF0dXM/LmlzUmVwbyAmJiByZXZpZXdhYmxlRmlsZXMgPiAwID8gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiXG4gICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5IHx8IHJldmlld2luZ31cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdm9pZCBvblJldmlldygpfVxuICAgICAgICAgICAgICB0aXRsZT17dCgncmV2aWV3LnJldmlld1Njb3BlJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtyZXZpZXdpbmcgPyB0KCdyZXZpZXcucmV2aWV3aW5nJykgOiB0KCdyZXZpZXcucmV2aWV3Jyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBzdGF0dXM/LmlzUmVwbyAmJiBjb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17b3BlblNlbmRQYW5lbH0+XG4gICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZFRvQWdlbnQnKX0gKHtjb21tZW50cy5sZW5ndGh9KVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcuY2xvc2UnKX0gb25DbGljaz17Y2xvc2V9PlxuICAgICAgICAgICAgPEljb25YIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtzZW5kT3BlbiA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VuZFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLXRpdGxlXCI+e3QoJ3Jldmlldy5zZW5kVGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbmQtaGludFwiPnt0KCdyZXZpZXcuc2VuZEhpbnQnKX08L3NwYW4+XG4gICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3NOYW1lPVwiZHNkci1zZW5kLWlucHV0XCIgcmVhZE9ubHkgdmFsdWU9e3NlbmRUZXh0fSBzcGVsbENoZWNrPXtmYWxzZX0gLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gc2V0U2VuZE9wZW4oZmFsc2UpfT5cbiAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWJ0blwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdm9pZCBuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQoc2VuZFRleHQpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4gc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgncmV2aWV3LmNvcHlGYWlsZWQnKSB9KSxcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jb3B5Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIXNlbmRUZXh0LnRyaW0oKX0gb25DbGljaz17KCkgPT4gdm9pZCBzZW5kVG9BZ2VudCgpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRUb0FnZW50Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnICYmIHJldmlldz8ub2sgJiYgcmV2aWV3YWJsZUZpbGVzID4gMCA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1zdHJpcFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e3Jldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/ICdkc2RyLXJldmlldy1iYWQnIDogJ2RzZHItcmV2aWV3LW9rJ30+XG4gICAgICAgICAgICAgICAge3Jldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/IHQoJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JykgOiB0KCdyZXZpZXcudmVyZGljdENvcnJlY3QnKX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLXJldmlldy10b2dnbGUke2ZpbmRpbmdzT3BlbiA/ICcgZHNkci1yZXZpZXctdG9nZ2xlLW9uJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRGaW5kaW5nc09wZW4oKHYpID0+ICF2KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmZpbmRpbmdzJywgeyBuOiByZXZpZXcuZmluZGluZ3MubGVuZ3RoIH0pfVxuICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5ub0ZpbmRpbmdzJyl9XG4gICAgICAgICAgICAgICAgICB7cmV2aWV3LnRydW5jYXRlZCA/ICcgKHRydW5jYXRlZCknIDogJyd9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7cmV2aWV3Lm1vZGVsID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctbW9kZWxcIj57cmV2aWV3Lm1vZGVsLnByb3ZpZGVyfS97cmV2aWV3Lm1vZGVsLm1vZGVsfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICAgICAgIHtyZXZpZXcuZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvcGVuU2VuZFBhbmVsV2l0aChjb21wb3NlRmluZGluZ3NNZXNzYWdlKCkpfT5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZEZpbmRpbmdzJyl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7ZmluZGluZ3NPcGVuICYmIHJldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmluZGluZ3NcIj5cbiAgICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLm1hcCgoZmluZGluZywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBrZXk9e2Ake2ZpbmRpbmcuZmlsZX06JHtmaW5kaW5nLmxpbmVTdGFydH0tJHtmaW5kaW5nLmxpbmVFbmR9OiR7aX1gfVxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBqdW1wVG8oZmluZGluZy5maWxlLCBmaW5kaW5nLmxpbmVTdGFydCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItZmluZGluZy10YWcgZHNkci1maW5kaW5nLSR7ZmluZGluZy5wcmlvcml0eX1gfT57ZmluZGluZy5wcmlvcml0eX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZy50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1sb2NcIj57ZmluZGluZy5maWxlfTp7ZmluZGluZy5saW5lU3RhcnR9e2ZpbmRpbmcubGluZUVuZCAhPT0gZmluZGluZy5saW5lU3RhcnQgPyBgLSR7ZmluZGluZy5saW5lRW5kfWAgOiAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nLmRldGFpbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1kZXRhaWxcIj57ZmluZGluZy5kZXRhaWx9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29uZmlkZW5jZScsIHsgY29uZmlkZW5jZTogZmluZGluZy5jb25maWRlbmNlLnRvRml4ZWQoMikgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZy5zdWdnZXN0aW9uID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuc3VnZ2VzdGlvbicpfWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcuc3VnZ2VzdGlvbiA/IDxjb2RlIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1zdWdnZXN0aW9uXCI+e2ZpbmRpbmcuc3VnZ2VzdGlvbn08L2NvZGU+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJyA/IChcbiAgICAgICAgICByb3VuZHMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLnNlc3Npb24nKX0+XG4gICAgICAgICAgICAgICAge3JvdW5kcy5tYXAoKHJvdW5kKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cm91bmQucm91bmR9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnJvdW5kJywgeyByb3VuZDogcm91bmQucm91bmQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAge3JvdW5kLmxhYmVsID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kLWxhYmVsXCIgdGl0bGU9e3JvdW5kLmxhYmVsfT57cm91bmQubGFiZWx9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2Vzc2lvblRyZWVzLmdldChyb3VuZC5yb3VuZCkgPz8gW119XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogY2hhbmdlLCBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3JvdW5kLnJvdW5kfToke2NoYW5nZS5wYXRofWBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkS2V5ID0gc2VsZWN0ZWRDaGFuZ2UgPyBgJHtzZWxlY3RlZFJvdW5kfToke3NlbGVjdGVkQ2hhbmdlLnBhdGh9YCA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtrZXkgPT09IHNlbGVjdGVkS2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7a2V5ID09PSBzZWxlY3RlZEtleSA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZC5yb3VuZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUGF0aChjaGFuZ2UucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hhbmdlLmhhc0RpZmYgPyAnZHNkci1jaGlwLW0nIDogJ2RzZHItY2hpcC11J31gfT57Y2hhbmdlLmhhc0RpZmYgPyAnTScgOiAnXHUwMEI3J308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17Y2hhbmdlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIiB0aXRsZT17Y2hhbmdlLnRvb2x9PntjaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ2hhbmdlLnBhdGh9PntzZWxlY3RlZENoYW5nZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj57c2VsZWN0ZWRDaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlLmhhc0RpZmYgPyA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gKFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPT09ICdzcGxpdCcgJiYgY2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8U3BsaXREaWZmIGJsb2Nrcz17Y2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjaGFuZ2VSb3dzKHNlbGVjdGVkQ2hhbmdlKS5tYXAoKHJvdywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgICAgKSA6IGVycm9yICYmICFzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgIHtlcnJvcn1cbiAgICAgICAgICAgIDxkaXY+e3QoJ3Jldmlldy5ub3RSZXBvSGludCcpfTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJvZHlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLndvcmtzcGFjZScpfT5cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAge3N0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25TdGFnZWQnKX0gKHtzdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAge3Vuc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnKX0gKHt1bnN0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ3Vuc3RhZ2VkJyA/IChcbiAgICAgICAgICAgICAgICB1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnKX0gKHt1bnN0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17dW5zdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ3N0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2JyYW5jaCcgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgnc2NvcGUuYnJhbmNoJyl9IHtiYXNlQnJhbmNoID8gYFx1MjE5NCAke2Jhc2VCcmFuY2h9YCA6ICcnfSAoe3Njb3BlRmlsZXMubGVuZ3RofSlcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ub2RpZmZcIj57dCgnc2NvcGUuYnJhbmNoUmVhZG9ubHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzY29wZVRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj57dCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnbGFzdC10dXJuJyA/IChcbiAgICAgICAgICAgICAgICBzY29wZUZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdzY29wZS5sYXN0LXR1cm4nKX0gKHtzY29wZUZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5sYXN0VHVybkVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBoaXN0b3J5Lmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5oaXN0b3J5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGltZWxpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAge2hpc3RvcnkubWFwKChjb21taXQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2NvbW1pdC5oYXNofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10bC1pdGVtJHtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2ggPyAnIGRzZHItdGwtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGwtcmFpbFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWRvdCR7Y29tbWl0LmFoZWFkID8gJyBkc2RyLXRsLWRvdC1sb2NhbCcgOiAnIGRzZHItdGwtZG90LXJlbW90ZSd9YH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0Py5oYXNoID09PSBjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21taXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RDb21taXQoY29tbWl0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItdGwtYmFkZ2Uke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1iYWRnZS1sb2NhbCcgOiAnIGRzZHItdGwtYmFkZ2UtcmVtb3RlJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21taXQuYWhlYWQgPyB0KCdoaXN0b3J5LmxvY2FsJykgOiB0KCdoaXN0b3J5LnJlbW90ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zaG9ydFwiPntjb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LXN1YmplY3RcIiB0aXRsZT17Y29tbWl0LnN1YmplY3R9Pntjb21taXQuc3ViamVjdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtbWV0YVwiPntjb21taXQuYXV0aG9yfSBcdTAwQjcge3JlbGF0aXZlVGltZShjb21taXQuZGF0ZSwgdCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7KHNjb3BlID09PSAnYWxsJyB8fCBzY29wZSA9PT0gJ2NvbW1pdCcpICYmIHNlbGVjdGVkQ29tbWl0ICYmIGNvbW1pdERpZmY/Lm9rICYmIGNvbW1pdERpZmYuZmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LmNvbW1pdEZpbGVzJyl9ICh7Y29tbWl0RGlmZi5maWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICBub2Rlcz17Y29tbWl0RmlsZXNUcmVlfVxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXsoeyBpdGVtOiBmaWxlLCBuYW1lIH0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17c2VsZWN0ZWRDb21taXRGaWxlID09PSBmaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRoID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkQ29tbWl0RmlsZShmaWxlLnBhdGgpfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2hpcCBkc2RyLWNoaXAtbVwiPntmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdhbGwnID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkJyYW5jaCcpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1yZWZcIiB0aXRsZT17c3RhdHVzLnVwc3RyZWFtID8/IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtYXJyb3dcIj5cdTIxOTI8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy51cHN0cmVhbSA/PyB0KCdyZXZpZXcubm9VcHN0cmVhbScpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLXN0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFoZWFkXCI+e3QoJ3Jldmlldy5haGVhZCcsIHsgbjogc3RhdHVzLmFoZWFkIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYmVoaW5kID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWJlaGluZFwiPnt0KCdyZXZpZXcuYmVoaW5kJywgeyBuOiBzdGF0dXMuYmVoaW5kIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYWhlYWQgPT09IDAgJiYgc3RhdHVzLmJlaGluZCA9PT0gMCAmJiBzdGF0dXMudXBzdHJlYW0gPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zeW5jXCI+XHUyNzEzPC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuJHtjb25maXJtID09PSAncHVzaCcgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCAoc3RhdHVzPy5haGVhZCA/PyAwKSA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvblB1c2h9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7Y29uZmlybSA9PT0gJ3B1c2gnID8gdCgncmV2aWV3LmNvbmZpcm1QdXNoJykgOiBgJHt0KCdyZXZpZXcucHVzaCcpfSR7KHN0YXR1cz8uYWhlYWQgPz8gMCkgPiAwID8gYCAoJHtzdGF0dXM/LmFoZWFkID8/IDB9KWAgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3ByPy5wciA/IChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3ByLnRpdGxlJywgeyBudW1iZXI6IHByLnByLm51bWJlciB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5sZW5ndGggPiAwID8gYCBcdTAwQjcgJHt0KCdwci5jb21tZW50cycsIHsgbjogcHIuY29tbWVudHMubGVuZ3RoIH0pfWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcHJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5sZW5ndGggPT09IDAgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3ByLm5vUHInKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21tZW50LmlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItcHItaXRlbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QckNvbW1lbnRDbGljayhjb21tZW50LnBhdGgsIGNvbW1lbnQubGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXByLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50LnBhdGggPyBgJHtiYXNlTmFtZShjb21tZW50LnBhdGgpfSR7Y29tbWVudC5saW5lID8gYDoke2NvbW1lbnQubGluZX1gIDogJyd9YCA6ICdnZW5lcmFsJ30gXHUwMEI3IHtjb21tZW50LmF1dGhvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci10ZXh0XCI+e2NvbW1lbnQuYm9keX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb3BlblNlbmRQYW5lbFdpdGgoY29tcG9zZVByTWVzc2FnZSgpKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3ByLnNlbmRDb21tZW50cycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmZcIj5cbiAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0ID8gKFxuICAgICAgICAgICAgICAgIGNvbW1pdERpZmZMb2FkaW5nID8gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3LmJ1c3knKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApIDogY29tbWl0RGlmZj8ub2sgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRDb21taXQuc3ViamVjdH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQuc3ViamVjdH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1oYXNoXCI+e3NlbGVjdGVkQ29tbWl0LnNob3J0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQuYXV0aG9yfSBcdTAwQjcge3JlbGF0aXZlVGltZShzZWxlY3RlZENvbW1pdC5kYXRlLCB0KX1cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBjb21taXREaWZmLmFkZGVkLCBkZWxldGVkOiBjb21taXREaWZmLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtjb21taXRBY3RpdmVGaWxlID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21taXQtZmlsZS1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtjb21taXRBY3RpdmVGaWxlLnBhdGh9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNoaXAgZHNkci1jaGlwLW1cIj57Y29tbWl0RmlsZVN0YXR1cyhjb21taXRTZWdtZW50cy5maW5kKChzKSA9PiBzLnBhdGggPT09IGNvbW1pdEFjdGl2ZUZpbGUucGF0aCk/LnRleHQgPz8gJycpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtZmlsZS1wYXRoXCI+e2NvbW1pdEFjdGl2ZUZpbGUucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogY29tbWl0QWN0aXZlRmlsZS5hZGRlZCwgZGVsZXRlZDogY29tbWl0QWN0aXZlRmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge3ZpZXcgPT09ICdzcGxpdCcgJiYgZ2l0U3BsaXRCbG9ja3MoY29tbWl0QWN0aXZlVGV4dCkubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8U3BsaXREaWZmIGJsb2Nrcz17Z2l0U3BsaXRCbG9ja3MoY29tbWl0QWN0aXZlVGV4dCl9IGJlZm9yZUxhYmVsPXt0KCd2aWV3LmJlZm9yZScpfSBhZnRlckxhYmVsPXt0KCd2aWV3LmFmdGVyJyl9IC8+XG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtnaXREaWZmUm93cyhjb21taXRBY3RpdmVUZXh0KS5tYXAoKHJvdywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntjb21taXREaWZmPy5lcnJvciA/PyB0KCdyZXZpZXcubm9EaWZmRGF0YScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IHNlbGVjdGVkRmlsZSA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZEZpbGUucGF0aH0+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUub3JpZ1BhdGggPyBgIFx1MjE5MCAke3NlbGVjdGVkRmlsZS5vcmlnUGF0aH1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5iaW5hcnkgPyB0KCdyZXZpZXcuYmluYXJ5JykgOiB0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IHNlbGVjdGVkRmlsZS5hZGRlZCwgZGVsZXRlZDogc2VsZWN0ZWRGaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkRmlsZS5wYXRoKX0gdGl0bGU9e3QoJ2VkaXRvci5vcGVuRmlsZScpfT5cbiAgICAgICAgICAgICAgICAgICAgICBcdTIxOTcge3QoJ2VkaXRvci5vcGVuRmlsZScpfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyAmJiBzZWxlY3RlZEZpbGUudW5zdGFnZWQgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ2FjY2VwdCcsIHNlbGVjdGVkRmlsZS5wYXRoKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmFjY2VwdCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyAmJiBzZWxlY3RlZEZpbGUuc3RhZ2VkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbigndW5zdGFnZScsIHNlbGVjdGVkRmlsZS5wYXRoKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnVuc3RhZ2UnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXIke2NvbmZpcm0gPT09ICdmaWxlJyA/ICcgZHNkci1idG4tY29uZmlybScgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3JldmVydCcsIHNlbGVjdGVkRmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y29uZmlybSA9PT0gJ2ZpbGUnID8gdCgncmV2aWV3LmNvbmZpcm1SZXZlcnQnKSA6IHQoJ3Jldmlldy5yZXZlcnQnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmICFzZWxlY3RlZEZpbGUuYmluYXJ5ICYmIGdpdFNwbGl0QmxvY2tzKHNlbGVjdGVkRmlsZS5kaWZmKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmJlZm9yZScpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmFmdGVyJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge2dpdFNwbGl0QmxvY2tzKHNlbGVjdGVkRmlsZS5kaWZmKS5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IDxIdW5rVG9vbGJhciBodW5rPXtzZWxlY3RlZEZpbGUuaHVua3NbYmldfSBidXN5PXtidXN5fSBvbkFjdGlvbj17b25IdW5rQWN0aW9ufSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dGaW5kaW5ncyA9IChyZXZpZXc/LmZpbmRpbmdzID8/IFtdKS5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYuZmlsZSA9PT0gc2VsZWN0ZWRGaWxlLnBhdGggJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocm93LnJpZ2h0TnVtICE9PSBudWxsID8gcm93LnJpZ2h0TnVtID49IGYubGluZVN0YXJ0ICYmIHJvdy5yaWdodE51bSA8PSBmLmxpbmVFbmQgOiByb3cubGVmdE51bSAhPT0gbnVsbCAmJiByb3cubGVmdE51bSA+PSBmLmxpbmVTdGFydCAmJiByb3cubGVmdE51bSA8PSBmLmxpbmVFbmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ0NscyA9IHJvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgPyBgIGRzZHItY2VsbC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganVtcGVkID0ganVtcExpbmUgIT0gbnVsbCAmJiAocm93LnJpZ2h0TnVtID09PSBqdW1wTGluZSB8fCAocm93LnJpZ2h0TnVtID09PSBudWxsICYmIHJvdy5sZWZ0TnVtID09PSBqdW1wTGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IGFuY2hvcnMgc3RheSBjb25zaXN0ZW50IHdpdGggdGhlIHVuaWZpZWQgdmlldzogY3R4IHJvd3MgZXhwb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3RoIGxpbmUgbnVtYmVycywgY2hhbmdlIHJvd3MgZXhwb3NlIHRoZSBzaWRlIHRoZXkgYmVsb25nIHRvLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEFuY2hvciA9IHsgb2xkTGluZTogcm93LmxlZnROdW0sIG5ld0xpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cubGVmdE51bSAhPT0gbnVsbCA/IHJvdy5sZWZ0TnVtIDogbnVsbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEFuY2hvciA9IHsgb2xkTGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA6IG51bGwsIG5ld0xpbmU6IHJvdy5yaWdodE51bSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0S2V5ID0gYCR7bGVmdEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtsZWZ0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0S2V5ID0gYCR7cmlnaHRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7cmlnaHRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBsZWZ0QW5jaG9yLm9sZExpbmUsIGxlZnRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCByaWdodEFuY2hvci5vbGRMaW5lLCByaWdodEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wZW5CdG4gPSAobGluZTogbnVtYmVyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEZpbGUucGF0aCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW9wZW5saW5lXCIgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCwgbGluZSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tZW50QnRuID0gKGFuY2hvcjogeyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0sIGNvdW50OiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e2NvdW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW49e2NvbW1lbnRQb3BvdmVyID09PSBgJHthbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7YW5jaG9yLm5ld0xpbmUgPz8gJ24nfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZTogYW5jaG9yLm9sZExpbmUsIG5ld0xpbmU6IGFuY2hvci5uZXdMaW5lIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbW1lbnRQb3BvdmVyKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0Q29tbWVudFBvcG92ZXIoKHByZXYpID0+IChwcmV2ID09PSBgJHthbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7YW5jaG9yLm5ld0xpbmUgPz8gJ24nfWAgPyBudWxsIDogYCR7YW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2FuY2hvci5uZXdMaW5lID8/ICduJ31gKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e3JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5sZWZ0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1kZWwnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWNlbGwtanVtcCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17cm93LmxlZnROdW0gPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPntyb3cubGVmdE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cubGVmdE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LmxlZnROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgJiYgcm93LnJpZ2h0TnVtID09PSBudWxsID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9Pntyb3dGaW5kaW5nc1swXS5wcmlvcml0eX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4obGVmdEFuY2hvciwgbGVmdENvbW1lbnRzLmxlbmd0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LnJpZ2h0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1hZGQnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWNlbGwtanVtcCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17cm93LnJpZ2h0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LnJpZ2h0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5yaWdodH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5yaWdodE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93RmluZGluZ3MubGVuZ3RoID4gMCAmJiByb3cucmlnaHROdW0gIT09IG51bGwgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YH0+e3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEJ0bihyaWdodEFuY2hvciwgcmlnaHRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xlZnRDb21tZW50cy5sZW5ndGggPiAwICYmIGNvbW1lbnRQb3BvdmVyID09PSBsZWZ0S2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtcG9wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsZWZ0Q29tbWVudHMubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2NvbW1lbnQuaWR9IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC10ZXh0XCI+e2NvbW1lbnQudGV4dH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2NvbW1lbnQucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoY29tbWVudC5pZCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdjb21tZW50LmRlbGV0ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLmxlbmd0aCA+IDAgJiYgY29tbWVudFBvcG92ZXIgPT09IHJpZ2h0S2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtcG9wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjb21tZW50LmlkfSBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtdGV4dFwiPntjb21tZW50LnRleHR9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjb21tZW50LnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGNvbW1lbnQuaWQpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiAobGVmdEtleSA9PT0gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgfHwgcmlnaHRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8VW5pZmllZERpZmZcbiAgICAgICAgICAgICAgICAgICAgICBkaWZmPXtzZWxlY3RlZEZpbGUuZGlmZn1cbiAgICAgICAgICAgICAgICAgICAgICBodW5rcz17c2VsZWN0ZWRGaWxlLmh1bmtzfVxuICAgICAgICAgICAgICAgICAgICAgIGJ1c3k9e2J1c3l9XG4gICAgICAgICAgICAgICAgICAgICAgb25IdW5rQWN0aW9uPXtvbkh1bmtBY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50cz17Y29tbWVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudEVkaXRvcj17Y29tbWVudEVkaXRvcn1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50VGV4dD17Y29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25Db21tZW50VGV4dD17c2V0Q29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuQ29tbWVudD17b3BlbkNvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgb25TYXZlQ29tbWVudD17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsQ29tbWVudD17Y2FuY2VsQ29tbWVudH1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50UG9wb3Zlcj17Y29tbWVudFBvcG92ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVQb3BvdmVyPXsoa2V5KSA9PiBzZXRDb21tZW50UG9wb3ZlcigocHJldikgPT4gKHByZXYgPT09IGtleSA/IG51bGwgOiBrZXkpKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUNvbW1lbnQ9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX1cbiAgICAgICAgICAgICAgICAgICAgICByZWFkT25seT17IWFsbG93QWN0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgICBwYXRoPXtzZWxlY3RlZEZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICByZXZpZXdGaW5kaW5ncz17cmV2aWV3Py5maW5kaW5nc31cbiAgICAgICAgICAgICAgICAgICAgICBvbk9wZW5MaW5lPXsocCwgbGluZSkgPT4gdm9pZCBvcGVuRmlsZShwLCBsaW5lKX1cbiAgICAgICAgICAgICAgICAgICAgICBqdW1wTGluZT17anVtcExpbmV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3Njb3BlID09PSAnY29tbWl0JyA/IHQoJ3Jldmlldy5zZWxlY3RDb21taXQnKSA6IHQoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICB7ZXJyb3IgPz8gdCgncmV2aWV3LmxvYWRFcnJvcicpfVxuICAgICAgICAgICAgeyFzdGF0dXM/LmlzUmVwbyA/IDxkaXY+e3QoJ3Jldmlldy5ub3RSZXBvSGludCcpfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZvb3RcIj5cbiAgICAgICAgICB7KGxvYWRpbmcgfHwgYnVzeSkgJiYgdGFiID09PSAnd29ya3NwYWNlJyA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3Bpbm5lclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7YnVzeSA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbm90aWNlXCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAge25vdGljZSA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItbm90aWNlIGRzZHItbm90aWNlLSR7bm90aWNlLmtpbmR9YH0+e25vdGljZS50ZXh0fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBDb25maWcgY2FyZCBmb3IgdGhlIFBsdWdpbnMgY29uZmlndXJhdGlvbiB0YWIgKFNldHRpbmdzIFx1MjE5MiBQbHVnaW5zIFx1MjE5MiBcdTUzRUZcdTkxNERcdTdGNkUpLiAqL1xuZnVuY3Rpb24gRGlmZlJldmlld0NvbmZpZ0NhcmQoeyB0IH06IHsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgcmV0dXJuIChcbiAgICA8bGkgY2xhc3NOYW1lPXtvcGVuID8gJ2RzZHItY2ZnLWNhcmQgZHNkci1jZmctY2FyZC1vcGVuJyA6ICdkc2RyLWNmZy1jYXJkJ30+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWNmZy1oZWFkXCIgYXJpYS1leHBhbmRlZD17b3Blbn0gb25DbGljaz17KCkgPT4gc2V0T3BlbigodikgPT4gIXYpfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZC10ZXh0XCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbmFtZVwiPnt0KCdzZXR0aW5ncy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1kZXNjXCI+e3QoJ2NvbmZpZy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8SWNvbkNoZXZyb25Eb3duT3V0bGluZTE0IGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJldCBkc2RyLWNmZy1jYXJldC1vcGVuJyA6ICdkc2RyLWNmZy1jYXJldCd9IC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWJvZHlcIj5cbiAgICAgICAgICA8RGlmZlJldmlld1ByZWZzIHQ9e3R9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9saT5cbiAgKVxufVxuXG4vKiogQ2xpZW50IHBsdWdpbiBib2R5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5KGN0eDogQ2xpZW50Q29udGV4dCk6IHZvaWQge1xuICBjdHguZWZmZWN0KCgpID0+IGN0eC5sb2NhbGUucmVnaXN0ZXIoTE9DQUxFX05TLCB7IHpoLCBlbiB9KSwgJ2RpZmYtcmV2aWV3OiBsb2NhbGUgZGljdGlvbmFyeScpXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5zZXNzaW9uLmhlYWRlci5hY3Rpb25zJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXcnLFxuICAgICAgICBvcmRlcjogNzAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdBY3Rpb24sXG4gICAgKSxcbiAgKVxuICBjdHguc2xvdHMuaW5qZWN0KCdzaGVsbC5vdmVybGF5JywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzaGVsbC5vdmVybGF5JyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1vdmVybGF5JyxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgICAgaW5qZWN0OiAoKSA9PiAoeyBzZXNzaW9uczogY3R4LnNlc3Npb25zIH0pLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdPdmVybGF5LFxuICAgICksXG4gIClcbiAgLy8gQ29kZXgtc3R5bGUgcGVuZGluZy1jb21tZW50cyBiYXIgYWJvdmUgdGhlIGNvbXBvc2VyLlxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uaW5wdXQuZG9jaycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLmlucHV0LmRvY2snLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3LWNvbW1lbnRzLWRvY2snLFxuICAgICAgICBvcmRlcjogMjAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgICBpbmplY3Q6ICgpID0+ICh7IHNlc3Npb25zOiBjdHguc2Vzc2lvbnMgfSksXG4gICAgICB9LFxuICAgICAgRGlmZlJldmlld0NvbXBvc2VyRG9jayxcbiAgICApLFxuICApXG4gIC8vIFRoZSBwbHVnaW4ncyBvd24gc2V0dGluZ3MgdGFiIGluc2lkZSBcdThCQkVcdTdGNkUgXHUyMTkyIFx1NjNEMlx1NEVGNiAobm90IHRoZSBHZW5lcmFsIHNlY3Rpb24pLlxuICAvLyBUaGUgcGx1Z2luJ3Mgd2hvbGUgY29uZmlndXJhdGlvbiBsaXZlcyBpbiBvbmUgY2FyZCBpbnNpZGVcbiAgLy8gXHU4QkJFXHU3RjZFIFx1MjE5MiBcdTYzRDJcdTRFRjYgXHUyMTkyIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RSAoc2V0dGluZ3MucGx1Z2luLml0ZW0pOiBmb250L3NpemUuXG4gIGN0eC5zbG90cy5pbmplY3QoJ3NldHRpbmdzLnBsdWdpbi5pdGVtJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzZXR0aW5ncy5wbHVnaW4uaXRlbScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29uZmlnJyxcbiAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29uZmlnQ2FyZCxcbiAgICApLFxuICApXG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZiB7XG4gICAgZGlmZihvbGRTdHIsIG5ld1N0ciwgXG4gICAgLy8gVHlwZSBiZWxvdyBpcyBub3QgYWNjdXJhdGUvY29tcGxldGUgLSBzZWUgYWJvdmUgZm9yIGZ1bGwgcG9zc2liaWxpdGllcyAtIGJ1dCBpdCBjb21waWxlc1xuICAgIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBsZXQgY2FsbGJhY2s7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCdjYWxsYmFjaycgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IHN1YmNsYXNzZXMgdG8gbWFzc2FnZSB0aGUgaW5wdXQgcHJpb3IgdG8gcnVubmluZ1xuICAgICAgICBjb25zdCBvbGRTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChvbGRTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBuZXdTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChuZXdTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBvbGRUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUob2xkU3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIGNvbnN0IG5ld1Rva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShuZXdTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBkb25lID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucG9zdFByb2Nlc3ModmFsdWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNhbGxiYWNrKHZhbHVlKTsgfSwgMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IGVkaXRMZW5ndGggPSAxO1xuICAgICAgICBsZXQgbWF4RWRpdExlbmd0aCA9IG5ld0xlbiArIG9sZExlbjtcbiAgICAgICAgaWYgKG9wdGlvbnMubWF4RWRpdExlbmd0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXhFZGl0TGVuZ3RoID0gTWF0aC5taW4obWF4RWRpdExlbmd0aCwgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhFeGVjdXRpb25UaW1lID0gKF9hID0gb3B0aW9ucy50aW1lb3V0KSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgYWJvcnRBZnRlclRpbWVzdGFtcCA9IERhdGUubm93KCkgKyBtYXhFeGVjdXRpb25UaW1lO1xuICAgICAgICBjb25zdCBiZXN0UGF0aCA9IFt7IG9sZFBvczogLTEsIGxhc3RDb21wb25lbnQ6IHVuZGVmaW5lZCB9XTtcbiAgICAgICAgLy8gU2VlZCBlZGl0TGVuZ3RoID0gMCwgaS5lLiB0aGUgY29udGVudCBzdGFydHMgd2l0aCB0aGUgc2FtZSB2YWx1ZXNcbiAgICAgICAgbGV0IG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiZXN0UGF0aFswXSwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIDAsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoYmVzdFBhdGhbMF0ub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgIC8vIElkZW50aXR5IHBlciB0aGUgZXF1YWxpdHkgYW5kIHRva2VuaXplclxuICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiZXN0UGF0aFswXS5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2Ugd2UgaGl0IHRoZSByaWdodCBlZGdlIG9mIHRoZSBlZGl0IGdyYXBoIG9uIHNvbWUgZGlhZ29uYWwgaywgd2UgY2FuXG4gICAgICAgIC8vIGRlZmluaXRlbHkgcmVhY2ggdGhlIGVuZCBvZiB0aGUgZWRpdCBncmFwaCBpbiBubyBtb3JlIHRoYW4gayBlZGl0cywgc29cbiAgICAgICAgLy8gdGhlcmUncyBubyBwb2ludCBpbiBjb25zaWRlcmluZyBhbnkgbW92ZXMgdG8gZGlhZ29uYWwgaysxIGFueSBtb3JlIChmcm9tXG4gICAgICAgIC8vIHdoaWNoIHdlJ3JlIGd1YXJhbnRlZWQgdG8gbmVlZCBhdCBsZWFzdCBrKzEgbW9yZSBlZGl0cykuXG4gICAgICAgIC8vIFNpbWlsYXJseSwgb25jZSB3ZSd2ZSByZWFjaGVkIHRoZSBib3R0b20gb2YgdGhlIGVkaXQgZ3JhcGgsIHRoZXJlJ3Mgbm9cbiAgICAgICAgLy8gcG9pbnQgY29uc2lkZXJpbmcgbW92ZXMgdG8gbG93ZXIgZGlhZ29uYWxzLlxuICAgICAgICAvLyBXZSByZWNvcmQgdGhpcyBmYWN0IGJ5IHNldHRpbmcgbWluRGlhZ29uYWxUb0NvbnNpZGVyIGFuZFxuICAgICAgICAvLyBtYXhEaWFnb25hbFRvQ29uc2lkZXIgdG8gc29tZSBmaW5pdGUgdmFsdWUgb25jZSB3ZSd2ZSBoaXQgdGhlIGVkZ2Ugb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGguXG4gICAgICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGlzIG5vdCBmYWl0aGZ1bCB0byB0aGUgb3JpZ2luYWwgYWxnb3JpdGhtIHByZXNlbnRlZCBpblxuICAgICAgICAvLyBNeWVycydzIHBhcGVyLCB3aGljaCBpbnN0ZWFkIHBvaW50bGVzc2x5IGV4dGVuZHMgRC1wYXRocyBvZmYgdGhlIGVuZCBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaCAtIHNlZSBwYWdlIDcgb2YgTXllcnMncyBwYXBlciB3aGljaCBub3RlcyB0aGlzIHBvaW50XG4gICAgICAgIC8vIGV4cGxpY2l0bHkgYW5kIGlsbHVzdHJhdGVzIGl0IHdpdGggYSBkaWFncmFtLiBUaGlzIGhhcyBtYWpvciBwZXJmb3JtYW5jZVxuICAgICAgICAvLyBpbXBsaWNhdGlvbnMgZm9yIHNvbWUgY29tbW9uIHNjZW5hcmlvcy4gRm9yIGluc3RhbmNlLCB0byBjb21wdXRlIGEgZGlmZlxuICAgICAgICAvLyB3aGVyZSB0aGUgbmV3IHRleHQgc2ltcGx5IGFwcGVuZHMgZCBjaGFyYWN0ZXJzIG9uIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIHRleHQgb2YgbGVuZ3RoIG4sIHRoZSB0cnVlIE15ZXJzIGFsZ29yaXRobSB3aWxsIHRha2UgTyhuK2ReMilcbiAgICAgICAgLy8gdGltZSB3aGlsZSB0aGlzIG9wdGltaXphdGlvbiBuZWVkcyBvbmx5IE8obitkKSB0aW1lLlxuICAgICAgICBsZXQgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gLUluZmluaXR5LCBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBJbmZpbml0eTtcbiAgICAgICAgLy8gTWFpbiB3b3JrZXIgbWV0aG9kLiBjaGVja3MgYWxsIHBlcm11dGF0aW9ucyBvZiBhIGdpdmVuIGVkaXQgbGVuZ3RoIGZvciBhY2NlcHRhbmNlLlxuICAgICAgICBjb25zdCBleGVjRWRpdExlbmd0aCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGRpYWdvbmFsUGF0aCA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgLWVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggPD0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBlZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoICs9IDIpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdLCBhZGRQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gb25lIGVsc2UgaXMgZ29pbmcgdG8gYXR0ZW1wdCB0byB1c2UgdGhpcyB2YWx1ZSwgY2xlYXIgaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjYW5BZGQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGF0IG5ld1BvcyB3aWxsIGJlIGFmdGVyIHdlIGRvIGFuIGluc2VydGlvbjpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkUGF0aE5ld1BvcyA9IGFkZFBhdGgub2xkUG9zIC0gZGlhZ29uYWxQYXRoO1xuICAgICAgICAgICAgICAgICAgICBjYW5BZGQgPSBhZGRQYXRoICYmIDAgPD0gYWRkUGF0aE5ld1BvcyAmJiBhZGRQYXRoTmV3UG9zIDwgbmV3TGVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBjYW5SZW1vdmUgPSByZW1vdmVQYXRoICYmIHJlbW92ZVBhdGgub2xkUG9zICsgMSA8IG9sZExlbjtcbiAgICAgICAgICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgcGF0aCBpcyBhIHRlcm1pbmFsIHRoZW4gcHJ1bmVcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgZGlhZ29uYWwgdGhhdCB3ZSB3YW50IHRvIGJyYW5jaCBmcm9tLiBXZSBzZWxlY3QgdGhlIHByaW9yXG4gICAgICAgICAgICAgICAgLy8gcGF0aCB3aG9zZSBwb3NpdGlvbiBpbiB0aGUgb2xkIHN0cmluZyBpcyB0aGUgZmFydGhlc3QgZnJvbSB0aGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRvZXMgbm90IHBhc3MgdGhlIGJvdW5kcyBvZiB0aGUgZGlmZiBncmFwaFxuICAgICAgICAgICAgICAgIGlmICghY2FuUmVtb3ZlIHx8IChjYW5BZGQgJiYgcmVtb3ZlUGF0aC5vbGRQb3MgPCBhZGRQYXRoLm9sZFBvcykpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChhZGRQYXRoLCB0cnVlLCBmYWxzZSwgMCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKHJlbW92ZVBhdGgsIGZhbHNlLCB0cnVlLCAxLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpIHx8IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlZGl0TGVuZ3RoKys7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcmZvcm1zIHRoZSBsZW5ndGggb2YgZWRpdCBpdGVyYXRpb24uIElzIGEgYml0IGZ1Z2x5IGFzIHRoaXMgaGFzIHRvIHN1cHBvcnQgdGhlXG4gICAgICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAgICAgLy8gaXMgcHJvZHVjZWQsIG9yIHVudGlsIHRoZSBlZGl0IGxlbmd0aCBleGNlZWRzIG9wdGlvbnMubWF4RWRpdExlbmd0aCAoaWYgZ2l2ZW4pLFxuICAgICAgICAvLyBpbiB3aGljaCBjYXNlIGl0IHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoIHx8IERhdGUubm93KCkgPiBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChlZGl0TGVuZ3RoIDw9IG1heEVkaXRMZW5ndGggJiYgRGF0ZS5ub3coKSA8PSBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFRvUGF0aChwYXRoLCBhZGRlZCwgcmVtb3ZlZCwgb2xkUG9zSW5jLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwYXRoLmxhc3RDb21wb25lbnQ7XG4gICAgICAgIGlmIChsYXN0ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IGxhc3QuY291bnQgKyAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0LnByZXZpb3VzQ29tcG9uZW50IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IG9sZFBvcyA9IGJhc2VQYXRoLm9sZFBvcywgbmV3UG9zID0gb2xkUG9zIC0gZGlhZ29uYWxQYXRoLCBjb21tb25Db3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChuZXdQb3MgKyAxIDwgbmV3TGVuICYmIG9sZFBvcyArIDEgPCBvbGRMZW4gJiYgdGhpcy5lcXVhbHMob2xkVG9rZW5zW29sZFBvcyArIDFdLCBuZXdUb2tlbnNbbmV3UG9zICsgMV0sIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBuZXdQb3MrKztcbiAgICAgICAgICAgIG9sZFBvcysrO1xuICAgICAgICAgICAgY29tbW9uQ291bnQrKztcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IDEsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbkNvdW50ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogY29tbW9uQ291bnQsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgYmFzZVBhdGgub2xkUG9zID0gb2xkUG9zO1xuICAgICAgICByZXR1cm4gbmV3UG9zO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29tcGFyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY29tcGFyYXRvcihsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHRcbiAgICAgICAgICAgICAgICB8fCAoISFvcHRpb25zLmlnbm9yZUNhc2UgJiYgbGVmdC50b0xvd2VyQ2FzZSgpID09PSByaWdodC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVFbXB0eShhcnJheSkge1xuICAgICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBjYXN0SW5wdXQodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xuICAgIH1cbiAgICBqb2luKGNoYXJzKSB7XG4gICAgICAgIC8vIEFzc3VtZXMgVmFsdWVUIGlzIHN0cmluZywgd2hpY2ggaXMgdGhlIGNhc2UgZm9yIG1vc3Qgc3ViY2xhc3Nlcy5cbiAgICAgICAgLy8gV2hlbiBpdCdzIGZhbHNlLCBlLmcuIGluIGRpZmZBcnJheXMsIHRoaXMgbWV0aG9kIG5lZWRzIHRvIGJlIG92ZXJyaWRkZW4gKGUuZy4gd2l0aCBhIG5vLW9wKVxuICAgICAgICAvLyBZZXMsIHRoZSBjYXN0cyBhcmUgdmVyYm9zZSBhbmQgdWdseSwgYmVjYXVzZSB0aGlzIHBhdHRlcm4gLSBvZiBoYXZpbmcgdGhlIGJhc2UgY2xhc3MgU09SVCBPRlxuICAgICAgICAvLyBhc3N1bWUgdG9rZW5zIGFuZCB2YWx1ZXMgYXJlIHN0cmluZ3MsIGJ1dCBub3QgY29tcGxldGVseSAtIGlzIHdlaXJkIGFuZCBqYW5reS5cbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH1cbiAgICBwb3N0UHJvY2VzcyhjaGFuZ2VPYmplY3RzLCBcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gY2hhbmdlT2JqZWN0cztcbiAgICB9XG4gICAgZ2V0IHVzZUxvbmdlc3RUb2tlbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBidWlsZFZhbHVlcyhsYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2Vucykge1xuICAgICAgICAvLyBGaXJzdCB3ZSBjb252ZXJ0IG91ciBsaW5rZWQgbGlzdCBvZiBjb21wb25lbnRzIGluIHJldmVyc2Ugb3JkZXIgdG8gYW5cbiAgICAgICAgLy8gYXJyYXkgaW4gdGhlIHJpZ2h0IG9yZGVyOlxuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gW107XG4gICAgICAgIGxldCBuZXh0Q29tcG9uZW50O1xuICAgICAgICB3aGlsZSAobGFzdENvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGxhc3RDb21wb25lbnQpO1xuICAgICAgICAgICAgbmV4dENvbXBvbmVudCA9IGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBkZWxldGUgbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGxhc3RDb21wb25lbnQgPSBuZXh0Q29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbXBvbmVudHMucmV2ZXJzZSgpO1xuICAgICAgICBjb25zdCBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aDtcbiAgICAgICAgbGV0IGNvbXBvbmVudFBvcyA9IDAsIG5ld1BvcyA9IDAsIG9sZFBvcyA9IDA7XG4gICAgICAgIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wb25lbnRzW2NvbXBvbmVudFBvc107XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQgJiYgdGhpcy51c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9sZFRva2Vuc1tvbGRQb3MgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGRWYWx1ZS5sZW5ndGggPiB2YWx1ZS5sZW5ndGggPyBvbGRWYWx1ZSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG9sZFRva2Vucy5zbGljZShvbGRQb3MsIG9sZFBvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHM7XG4gICAgfVxufVxuIiwgImltcG9ydCBEaWZmIGZyb20gJy4vYmFzZS5qcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZU9wdGlvbnMgfSBmcm9tICcuLi91dGlsL3BhcmFtcy5qcyc7XG5jbGFzcyBMaW5lRGlmZiBleHRlbmRzIERpZmYge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnRva2VuaXplID0gdG9rZW5pemU7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICAvLyBJZiB3ZSdyZSBpZ25vcmluZyB3aGl0ZXNwYWNlLCB3ZSBuZWVkIHRvIG5vcm1hbGlzZSBsaW5lcyBieSBzdHJpcHBpbmdcbiAgICAgICAgLy8gd2hpdGVzcGFjZSBiZWZvcmUgY2hlY2tpbmcgZXF1YWxpdHkuIChUaGlzIGhhcyBhbiBhbm5veWluZyBpbnRlcmFjdGlvblxuICAgICAgICAvLyB3aXRoIG5ld2xpbmVJc1Rva2VuIHRoYXQgcmVxdWlyZXMgc3BlY2lhbCBoYW5kbGluZzogaWYgbmV3bGluZXMgZ2V0IHRoZWlyXG4gICAgICAgIC8vIG93biB0b2tlbiwgdGhlbiB3ZSBET04nVCB3YW50IHRvIHRyaW0gdGhlICpuZXdsaW5lKiB0b2tlbnMgZG93biB0byBlbXB0eVxuICAgICAgICAvLyBzdHJpbmdzLCBzaW5jZSB0aGlzIHdvdWxkIGNhdXNlIHVzIHRvIHRyZWF0IHdoaXRlc3BhY2Utb25seSBsaW5lIGNvbnRlbnRcbiAgICAgICAgLy8gYXMgZXF1YWwgdG8gYSBzZXBhcmF0b3IgYmV0d2VlbiBsaW5lcywgd2hpY2ggd291bGQgYmUgd2VpcmQgYW5kXG4gICAgICAgIC8vIGluY29uc2lzdGVudCB3aXRoIHRoZSBkb2N1bWVudGVkIGJlaGF2aW9yIG9mIHRoZSBvcHRpb25zLilcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFsZWZ0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhcmlnaHQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5pZ25vcmVOZXdsaW5lQXRFb2YgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIGlmIChsZWZ0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyaWdodC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgbGluZURpZmYgPSBuZXcgTGluZURpZmYoKTtcbmV4cG9ydCBmdW5jdGlvbiBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZlRyaW1tZWRMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgeyBpZ25vcmVXaGl0ZXNwYWNlOiB0cnVlIH0pO1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbi8vIEV4cG9ydGVkIHN0YW5kYWxvbmUgc28gaXQgY2FuIGJlIHVzZWQgZnJvbSBqc29uRGlmZiB0b28uXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5zdHJpcFRyYWlsaW5nQ3IpIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9uZSBcXHIgYmVmb3JlIFxcbiB0byBtYXRjaCBHTlUgZGlmZidzIC0tc3RyaXAtdHJhaWxpbmctY3IgYmVoYXZpb3JcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuICAgIH1cbiAgICBjb25zdCByZXRMaW5lcyA9IFtdLCBsaW5lc0FuZE5ld2xpbmVzID0gdmFsdWUuc3BsaXQoLyhcXG58XFxyXFxuKS8pO1xuICAgIC8vIElnbm9yZSB0aGUgZmluYWwgZW1wdHkgdG9rZW4gdGhhdCBvY2N1cnMgaWYgdGhlIHN0cmluZyBlbmRzIHdpdGggYSBuZXcgbGluZVxuICAgIGlmICghbGluZXNBbmROZXdsaW5lc1tsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIGxpbmVzQW5kTmV3bGluZXMucG9wKCk7XG4gICAgfVxuICAgIC8vIE1lcmdlIHRoZSBjb250ZW50IGFuZCBsaW5lIHNlcGFyYXRvcnMgaW50byBzaW5nbGUgdG9rZW5zXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc0FuZE5ld2xpbmVzW2ldO1xuICAgICAgICBpZiAoaSAlIDIgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9IGxpbmU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRMaW5lcztcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1CQSxtQkFBcUY7OztBQ25CckYsSUFBcUIsT0FBckIsTUFBMEI7QUFBQSxFQUN0QixLQUFLLFFBQVEsUUFFYixVQUFVLENBQUMsR0FBRztBQUNWLFFBQUk7QUFDSixRQUFJLE9BQU8sWUFBWSxZQUFZO0FBQy9CLGlCQUFXO0FBQ1gs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TSxXQUFXLEVBQUcsUUFBTyxDQUFDO0FBQzFELFNBQU8sT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLE9BQU87QUFBQSxJQUNwQyxNQUFNLE9BQU8sTUFBTSxTQUFTLElBQUksV0FBVyxJQUFJLENBQUMsSUFBSSxPQUFPLE1BQU0sTUFBTSxRQUFRO0FBQUEsSUFDL0UsTUFBTSxnQkFBZ0IsS0FBSyxTQUFTLEtBQUssT0FBTyxFQUFFLENBQUMsRUFBRTtBQUFBLEVBQ3ZELEVBQUU7QUFDSjtBQU1BLElBQU0sYUFBYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUF1T25CLElBQUksT0FBTyxhQUFhLGVBQWUsU0FBUyxjQUFjLHlCQUF5QixLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQUcsTUFBTSxNQUFNO0FBQzdILFFBQU0sTUFBTSxTQUFTLGNBQWMsT0FBTztBQUMxQyxNQUFJLFFBQVEsU0FBUztBQUNyQixNQUFJLFFBQVEsWUFBWTtBQUN4QixNQUFJLGNBQWM7QUFDbEIsV0FBUyxLQUFLLFlBQVksR0FBRztBQUMvQjtBQUdBLElBQU0sS0FBSztBQUFBLEVBQ1QsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsbUJBQW1CO0FBQUEsRUFDbkIsa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsMkJBQTJCO0FBQUEsRUFDM0IsdUJBQXVCO0FBQUEsRUFDdkIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsb0JBQW9CO0FBQUEsRUFDcEIsaUJBQWlCO0FBQUEsRUFDakIsaUJBQWlCO0FBQUEsRUFDakIsb0JBQW9CO0FBQUEsRUFDcEIsb0JBQW9CO0FBQUEsRUFDcEIsa0JBQWtCO0FBQUEsRUFDbEIscUJBQXFCO0FBQUEsRUFDckIsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIsd0JBQXdCO0FBQUEsRUFDeEIsMkJBQTJCO0FBQUEsRUFDM0IsaUJBQWlCO0FBQUEsRUFDakIsNEJBQTRCO0FBQUEsRUFDNUIsZUFBZTtBQUFBLEVBQ2Ysc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsd0JBQXdCO0FBQUEsRUFDeEIseUJBQXlCO0FBQUEsRUFDekIsd0JBQXdCO0FBQUEsRUFDeEIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsWUFBWTtBQUFBLEVBQ1osZ0JBQWdCO0FBQUEsRUFDaEIsY0FBYztBQUFBLEVBQ2QsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsZUFBZTtBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsb0JBQW9CO0FBQUEsRUFDcEIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsdUJBQXVCO0FBQUEsRUFDdkIsZ0JBQWdCO0FBQUEsRUFDaEIsa0JBQWtCO0FBQUEsRUFDbEIsa0JBQWtCO0FBQUEsRUFDbEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsbUJBQW1CO0FBQUEsRUFDbkIsd0JBQXdCO0FBQUEsRUFDeEIsY0FBYztBQUFBLEVBQ2Qsd0JBQXdCO0FBQUEsRUFDeEIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsbUJBQW1CO0FBQUEsRUFDbkIsc0JBQXNCO0FBQUEsRUFDdEIsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsaUJBQWlCO0FBQUEsRUFDakIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIseUJBQXlCO0FBQUEsRUFDekIsMkJBQTJCO0FBQUEsRUFDM0IscUJBQXFCO0FBQUEsRUFDckIsbUJBQW1CO0FBQUEsRUFDbkIscUJBQXFCO0FBQUEsRUFDckIscUJBQXFCO0FBQUEsRUFDckIsdUJBQXVCO0FBQUEsRUFDdkIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsWUFBWTtBQUFBLEVBQ1osZUFBZTtBQUFBLEVBQ2YsV0FBVztBQUFBLEVBQ1gsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsaUJBQWlCO0FBQUEsRUFDakIsY0FBYztBQUFBLEVBQ2QsdUJBQXVCO0FBQUEsRUFDdkIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsa0JBQWtCO0FBQUEs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

		})(module, module.exports, require);
		return module.exports;
	}
});
