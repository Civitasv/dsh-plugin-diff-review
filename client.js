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
.dsdr-dock{display:flex;flex-direction:column;gap:2px;margin:6px 12px 0;padding:6px 10px;background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:var(--dsw-shadow-lv3);font-size:12px;line-height:18px}
.dsdr-dock-head{display:flex;align-items:center;gap:6px;min-height:22px}
.dsdr-dock-icon{display:inline-flex;color:var(--dsw-alias-button-info-fill)}
.dsdr-dock-count{font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);white-space:nowrap}
.dsdr-dock-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0}
.dsdr-dock-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-dock-list{display:flex;flex-direction:column;gap:2px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:4px;margin-top:2px;max-height:168px;overflow-y:auto}
.dsdr-dock-item{display:flex;flex-direction:column;gap:1px;text-align:left;border:0;background:transparent;border-radius:7px;padding:4px 8px;cursor:pointer;font:inherit}
.dsdr-dock-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-dock-loc{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.dsdr-dock-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-count", title: t("review.dockHint"), children: t("review.dockComments", { n: comments.length }) }),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERpZmYtcmV2aWV3IHBsdWdpbiBcdTIwMTQgY2xpZW50IGhhbGYuXG4gKlxuICogQ29kZXgtc3R5bGUgcmV2aWV3IHdpdGggdHdvIHNvdXJjZXM6XG4gKlxuICogMS4gKipcdTRGMUFcdThCRERcdTY2RjRcdTY1MzkgKFNlc3Npb24gY2hhbmdlcykqKiBcdTIwMTQgd2hhdCB0aGUgYWdlbnQgY2hhbmdlZCBpbiBlYWNoIHJvdW5kIG9mXG4gKiAgICB0aGlzIGNvbnZlcnNhdGlvbiwgZGVyaXZlZCBmcm9tIHRoZSBjb252ZXJzYXRpb24gc25hcHNob3QgKHRvb2wgcmVzdWx0c1xuICogICAgY2FycnkgdGhlIGhvc3QtY29tcHV0ZWQgYHJlc3VsdFZpZXdgIGRpZmYgaHVua3MpLiBXb3JrcyB3aXRoIG9yIHdpdGhvdXRcbiAqICAgIGdpdCwgYW5kIHNob3dzIGEgY2hhbmdlIGV2ZW4gd2hlbiBubyBkaWZmIHRleHQgaXMgYXZhaWxhYmxlIChwYXRoLW9ubHkpLlxuICogMi4gKipcdTVERTVcdTRGNUNcdTUzM0EgKFdvcmtzcGFjZSkqKiBcdTIwMTQgdGhlIGdpdCB3b3JraW5nIHRyZWUncyB1bmNvbW1pdHRlZCBjaGFuZ2VzXG4gKiAgICAoc3RhZ2VkICsgdW5zdGFnZWQgKyB1bnRyYWNrZWQpIHdpdGggcGVyLWZpbGUgLyBhbGwtZmlsZSBhY2NlcHQgKHN0YWdlKVxuICogICAgYW5kIHJldmVydCAoZGlzY2FyZCkgdGhyb3VnaCB0aGUgcGx1Z2luJ3Mgc2VydmVyIHJvdXRlcy5cbiAqXG4gKiBUaGUgcmV2aWV3IHN1cmZhY2UgbW91bnRzIGluIGBzaGVsbC5vdmVybGF5YCAocm9vdCBzY29wZSkuIFN0YXRlIGhhbmQtb2ZmXG4gKiBiZXR3ZWVuIHRoZSBzZXNzaW9uLXNjb3BlZCBoZWFkZXIgdHJpZ2dlciBhbmQgdGhlIHJvb3Qtc2NvcGVkIG92ZXJsYXkgZ29lc1xuICogdGhyb3VnaCBhIG1vZHVsZS1sZXZlbCBzbmFwc2hvdCBzdG9yZTsgdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCBmb3IgdGhlXG4gKiBjdXJyZW50IHNlc3Npb24gaXMgcmVhZCByZWFjdGl2ZWx5IHRocm91Z2ggYGN0eC5zZXNzaW9uc2AgKGluamVjdGVkIHZpYSB0aGVcbiAqIG92ZXJsYXkgcmVnaXN0cmF0aW9uJ3MgaW5qZWN0IGZhY2UpLlxuICovXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUsIHVzZVN5bmNFeHRlcm5hbFN0b3JlLCBGcmFnbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDU1NQcm9wZXJ0aWVzLCBSZWFjdEVsZW1lbnQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgZGlmZkxpbmVzIH0gZnJvbSAnZGlmZidcbmltcG9ydCB0eXBlIHsgQ2xpZW50Q29udGV4dCwgSVNlc3Npb25zLCBTZXNzaW9uTGlzdFN0YXRlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgeyBjcmVhdGVTbmFwc2hvdFN0b3JlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFByb3BzTG9jYWxlLCBQcm9wc1J1bnRpbWUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1zbG90cydcbmltcG9ydCB0eXBlIHsgQ29udmVyc2F0aW9uTm9kZSwgVG9vbFJlc3VsdE5vZGUsIFVzZXJNZXNzYWdlTm9kZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXJ1bnRpbWUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBTZXNzaW9uSWQsIFRvb2xSZXN1bHRWaWV3IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hcGktcmVtb3Rlcy9jbGllbnQnXG5pbXBvcnQgeyBJY29uQ2hldnJvbkRvd25PdXRsaW5lMTQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEdpdFJlc3BvbnNlLCBIaXN0b3J5UmVzcG9uc2UsIFByUmVzcG9uc2UsIFJlcG9zUmVzcG9uc2UsIFJldmlld0NvbW1lbnQsIFJldmlld0ZpbmRpbmcsIFJldmlld1Jlc3BvbnNlLCBTdGF0dXNSZXNwb25zZSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcy50cydcblxuZXhwb3J0IGNvbnN0IG5hbWUgPSAnZGlmZi1yZXZpZXcnXG5cbi8qKiBSZXF1aXJlZCBjbGllbnQgc2VydmljZXMgKGZpYmVyIGluamVjdCkuICovXG5leHBvcnQgY29uc3QgaW5qZWN0ID0gWydzZXNzaW9ucycsICdzbG90cycsICdsb2NhbGUnXVxuXG5jb25zdCBMT0NBTEVfTlMgPSAnZGlmZi1yZXZpZXcnXG5jb25zdCBTVEFUVVNfVVJMID0gJ2RpZmYtcmV2aWV3L3N0YXR1cydcbmNvbnN0IEFQUExZX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseSdcbmNvbnN0IEFQUExZX0hVTktfVVJMID0gJ2RpZmYtcmV2aWV3L2FwcGx5LWh1bmsnXG5jb25zdCBDT01NSVRfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdCdcbmNvbnN0IFBVU0hfVVJMID0gJ2RpZmYtcmV2aWV3L3B1c2gnXG5jb25zdCBISVNUT1JZX1VSTCA9ICdkaWZmLXJldmlldy9oaXN0b3J5J1xuY29uc3QgQ09NTUlUX0RJRkZfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdC1kaWZmJ1xuY29uc3QgQ09NTUVOVFNfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1lbnRzJ1xuY29uc3QgQlJBTkNIRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2JyYW5jaGVzJ1xuY29uc3QgUkVWSUVXX1VSTCA9ICdkaWZmLXJldmlldy9yZXZpZXcnXG5jb25zdCBQUl9VUkwgPSAnZGlmZi1yZXZpZXcvcHInXG5jb25zdCBSRVBPU19VUkwgPSAnZGlmZi1yZXZpZXcvcmVwb3MnXG5jb25zdCBPUEVOX0VESVRPUl9VUkwgPSAnb3Blbi1lZGl0b3Ivb3BlbidcbmNvbnN0IFNUWUxFX1RBRyA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3L3Jldmlldy5jc3MnXG5cbi8qKiBPcGVuIHN0YXRlIHNoYXJlZCBiZXR3ZWVuIHRoZSBoZWFkZXIgdHJpZ2dlciAoc2Vzc2lvbiBzY29wZSkgYW5kIHRoZSBvdmVybGF5IChyb290IHNjb3BlKS4gKi9cbmNvbnN0IG92ZXJsYXlTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8eyBvcGVuOiBib29sZWFuOyBjd2Q6IHN0cmluZyB8IG51bGw7IGtleTogbnVtYmVyOyBmb2N1cz86IHsgcGF0aDogc3RyaW5nOyBsaW5lPzogbnVtYmVyIH0gfCBudWxsIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxuICBmb2N1czogbnVsbCxcbn0pXG5cbi8qKlxuICogUGVuZGluZyBpbmxpbmUgY29tbWVudHMgc3VyZmFjZWQgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSkuIFRoZVxuICogcmV2aWV3IG92ZXJsYXkgc3luY3MgaXRzIHdvcmtzcGFjZSBjb21tZW50cyBoZXJlOyB0aGUgY29tcG9zZXIgZG9jayByZWFkc1xuICogdGhlbSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbidzIHdvcmtzcGFjZS5cbiAqL1xuY29uc3QgcGVuZGluZ0NvbW1lbnRzU3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPHsgY3dkOiBzdHJpbmcgfCBudWxsOyBjb21tZW50czogUmV2aWV3Q29tbWVudFtdIH0+KHtcbiAgY3dkOiBudWxsLFxuICBjb21tZW50czogW10sXG59KVxuXG4vKiogSW5qZWN0IHRleHQgaW50byBhIHNlc3Npb24gYXMgYSB1c2VyIG1lc3NhZ2U7IGZhbGxzIGJhY2sgdG8gdGhlIGNsaXBib2FyZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluamVjdFRvU2Vzc2lvbihzZXNzaW9uczogSVNlc3Npb25zIHwgdW5kZWZpbmVkLCBzZXNzaW9uSWQ6IFNlc3Npb25JZCB8IG51bGwsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8J3NlbnQnIHwgJ2NvcGllZCcgfCAnZmFpbGVkJz4ge1xuICBjb25zdCBiaW5kaW5nID0gc2Vzc2lvbklkID8gc2Vzc2lvbnM/LmJpbmRpbmcoc2Vzc2lvbklkKSA6IHVuZGVmaW5lZFxuICBjb25zdCBzZXNzaW9uID0gYmluZGluZz8uc2Vzc2lvblxuICBpZiAoc2Vzc2lvbikge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXNzaW9uLnByb21wdChbeyB0eXBlOiAndGV4dCcsIHRleHQgfV0sICdxdWV1ZScpXG4gICAgICBpZiAocmVzdWx0Lm9rKSByZXR1cm4gJ3NlbnQnXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGNvcHkgZmFsbGJhY2tcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICAgIHJldHVybiAnY29waWVkJ1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJ2ZhaWxlZCdcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJldmlldyBwcmVmZXJlbmNlcyAoZm9udCAvIHNpemUgLyBwYW5lbCBnZW9tZXRyeSksIHNoYXJlZCBieSB0aGUgb3ZlcmxheVxuLy8gYW5kIHRoZSBTZXR0aW5ncyBcdTIxOTIgR2VuZXJhbCByb3cuIFBlcnNpc3RlZCB0byBsb2NhbFN0b3JhZ2UgYnkgdGhlIHN0b3JlLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBQYW5lbCBnZW9tZXRyeSBib3VuZHMuICovXG5leHBvcnQgY29uc3QgTUlOX1BBTkVMX1cgPSA2NDBcbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfSCA9IDQwMFxuXG5pbnRlcmZhY2UgUHJlZnMge1xuICAvKiogRm9udCBvcHRpb24gaWQgKHNlZSBGT05UX09QVElPTlMpLiAqL1xuICBmb250OiBzdHJpbmdcbiAgLyoqIERpZmYgdGV4dCBzaXplIGluIHB4LiAqL1xuICBzaXplOiBudW1iZXJcbiAgLyoqIFBhbmVsIHdpZHRoIGluIHB4LiAqL1xuICB3aWR0aDogbnVtYmVyXG4gIC8qKiBQYW5lbCBoZWlnaHQgaW4gcHguICovXG4gIGhlaWdodDogbnVtYmVyXG59XG5cbmNvbnN0IEZPTlRfT1BUSU9OUzogeyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBjc3M6IHN0cmluZyB9W10gPSBbXG4gIHsgaWQ6ICdtb25vJywgbGFiZWw6ICdmb250Lm1vbm8nLCBjc3M6ICd2YXIoLS1kc3ctZm9udC1tb25vKScgfSxcbiAgeyBpZDogJ3N5c3RlbScsIGxhYmVsOiAnZm9udC5zeXN0ZW0nLCBjc3M6ICdzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYnIH0sXG4gIHsgaWQ6ICdjb25zb2xhcycsIGxhYmVsOiAnQ29uc29sYXMnLCBjc3M6ICdDb25zb2xhcywgXCJDb3VyaWVyIE5ld1wiLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdqZXRicmFpbnMnLCBsYWJlbDogJ0pldEJyYWlucyBNb25vJywgY3NzOiAnXCJKZXRCcmFpbnMgTW9ub1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnZmlyYScsIGxhYmVsOiAnRmlyYSBDb2RlJywgY3NzOiAnXCJGaXJhIENvZGVcIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ3NvdXJjZScsIGxhYmVsOiAnU291cmNlIENvZGUgUHJvJywgY3NzOiAnXCJTb3VyY2UgQ29kZSBQcm9cIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbl1cblxuY29uc3QgU0laRV9PUFRJT05TID0gWzExLCAxMiwgMTMsIDE0LCAxNiwgMThdXG5cbi8qKiBSZXZpZXcgc2NvcGVzIG9mIHRoZSB3b3Jrc3BhY2UgdGFiIChhbGlnbmVkIHdpdGggdGhlIENvZGV4IHJldmlldyBwYW5lKS4gKi9cbnR5cGUgV29ya3NwYWNlU2NvcGUgPSAnYWxsJyB8ICd1bnN0YWdlZCcgfCAnc3RhZ2VkJyB8ICdjb21taXQnIHwgJ2JyYW5jaCcgfCAnbGFzdC10dXJuJ1xuXG5jb25zdCBTQ09QRV9PUFRJT05TOiB7IGlkOiBXb3Jrc3BhY2VTY29wZTsgbGFiZWw6IGtleW9mIHR5cGVvZiB6aCB9W10gPSBbXG4gIHsgaWQ6ICdhbGwnLCBsYWJlbDogJ3Njb3BlLmFsbCcgfSxcbiAgeyBpZDogJ3Vuc3RhZ2VkJywgbGFiZWw6ICdzY29wZS51bnN0YWdlZCcgfSxcbiAgeyBpZDogJ3N0YWdlZCcsIGxhYmVsOiAnc2NvcGUuc3RhZ2VkJyB9LFxuICB7IGlkOiAnY29tbWl0JywgbGFiZWw6ICdzY29wZS5jb21taXQnIH0sXG4gIHsgaWQ6ICdicmFuY2gnLCBsYWJlbDogJ3Njb3BlLmJyYW5jaCcgfSxcbiAgeyBpZDogJ2xhc3QtdHVybicsIGxhYmVsOiAnc2NvcGUubGFzdC10dXJuJyB9LFxuXVxuXG4vKiogQnJvd3Nlci1zaWRlIGFic29sdXRlIHBhdGggY2hlY2sgKG5vIG5vZGU6cGF0aCBpbiB0aGUgY2xpZW50IGJ1bmRsZSkuICovXG5mdW5jdGlvbiBpc0Fic1BhdGgocDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocClcbn1cblxuZnVuY3Rpb24gYmFzZU5hbWUocDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHAuc3BsaXQoL1tcXFxcL10vKS5wb3AoKSA/PyBwXG59XG5cbmNvbnN0IHByZWZzU3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPFByZWZzPihcbiAgeyBmb250OiAnbW9ubycsIHNpemU6IDEyLCB3aWR0aDogMTEyMCwgaGVpZ2h0OiA3MjAgfSxcbiAgeyBwZXJzaXN0OiB7IG5hbWU6ICdkc2RyLXByZWZzJyB9IH0sXG4pXG5cbi8qKiBDU1MgZm9udC1mYW1pbHkgZm9yIGEgc3RvcmVkIGZvbnQgb3B0aW9uIGlkLiAqL1xuZnVuY3Rpb24gZm9udENzcyhpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIEZPTlRfT1BUSU9OUy5maW5kKChmKSA9PiBmLmlkID09PSBpZCk/LmNzcyA/PyBGT05UX09QVElPTlNbMF0uY3NzXG59XG5cbi8qKiBQYW5lbCBDU1MgdmFyaWFibGVzIGNhcnJ5aW5nIHRoZSBmb250L3NpemUgcHJlZmVyZW5jZS4gKi9cbmZ1bmN0aW9uIGRpZmZTdHlsZVZhcnMocHJlZnM6IFByZWZzKTogQ1NTUHJvcGVydGllcyB7XG4gIHJldHVybiB7XG4gICAgJy0tZHNkci1kaWZmLWZvbnQnOiBmb250Q3NzKHByZWZzLmZvbnQpLFxuICAgICctLWRzZHItZGlmZi1zaXplJzogYCR7cHJlZnMuc2l6ZX1weGAsXG4gIH0gYXMgQ1NTUHJvcGVydGllc1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlc3Npb24tY2hhbmdlcyBleHRyYWN0aW9uIChjbGllbnQtc2lkZSwgd29ya3Mgd2l0aG91dCBnaXQpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYmVmb3JlL2FmdGVyIHNsaWNlIG9mIGEgY2hhbmdlIChhIGh1bmspLiAqL1xuaW50ZXJmYWNlIEh1bmsge1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogT25lIGZpbGUgY2hhbmdlZCBpbnNpZGUgb25lIHJvdW5kLiAqL1xuaW50ZXJmYWNlIFJvdW5kQ2hhbmdlIHtcbiAgcGF0aDogc3RyaW5nXG4gIHRvb2w6IHN0cmluZ1xuICBodW5rczogSHVua1tdXG4gIC8qKiBGYWxzZSB3aGVuIG9ubHkgdGhlIHBhdGggaXMga25vd24gKG5vIGRpZmYgZGF0YSBwZXJzaXN0ZWQpLiAqL1xuICBoYXNEaWZmOiBib29sZWFuXG59XG5cbi8qKiBPbmUgdXNlciByb3VuZCBhbmQgdGhlIGZpbGVzIGl0IGNoYW5nZWQuICovXG5pbnRlcmZhY2UgU2Vzc2lvblJvdW5kIHtcbiAgcm91bmQ6IG51bWJlclxuICBsYWJlbDogc3RyaW5nXG4gIGNoYW5nZXM6IFJvdW5kQ2hhbmdlW11cbn1cblxuaW50ZXJmYWNlIEZpbGVEaWZmTGlrZSB7XG4gIHBhdGg6IHN0cmluZ1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogVmFsaWRhdGUgYSByYXcgRmlsZURpZmYtc2hhcGVkIHZhbHVlICh0aGUgdG9vbHMnIGB7cGF0aCwgb2xkVGV4dCwgbmV3VGV4dH1gIGNvbnRyYWN0KS4gKi9cbmZ1bmN0aW9uIGFzRmlsZURpZmYocmF3OiB1bmtub3duKTogRmlsZURpZmZMaWtlIHwgbnVsbCB7XG4gIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBjb25zdCByZWMgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgaWYgKHR5cGVvZiByZWMucGF0aCAhPT0gJ3N0cmluZycgfHwgIXJlYy5wYXRoKSByZXR1cm4gbnVsbFxuICBpZiAodHlwZW9mIHJlYy5uZXdUZXh0ICE9PSAnc3RyaW5nJykgcmV0dXJuIG51bGxcbiAgY29uc3Qgb2xkVGV4dCA9IHJlYy5vbGRUZXh0XG4gIHJldHVybiB7IHBhdGg6IHJlYy5wYXRoLCBvbGRUZXh0OiB0eXBlb2Ygb2xkVGV4dCA9PT0gJ3N0cmluZycgPyBvbGRUZXh0IDogbnVsbCwgbmV3VGV4dDogcmVjLm5ld1RleHQgfVxufVxuXG4vKiogRGlmZiBodW5rcyBjYXJyaWVkIGJ5IGEgY29tcGxldGVkIHRvb2wgcmVzdWx0IChgcmVzdWx0Vmlldy5jYXJkID09PSAnZGlmZidgKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbVJlc3VsdFZpZXcocmVzdWx0VmlldzogVG9vbFJlc3VsdFZpZXcgfCBudWxsKTogRmlsZURpZmZMaWtlW10ge1xuICBpZiAoIXJlc3VsdFZpZXcgfHwgcmVzdWx0Vmlldy5jYXJkICE9PSAnZGlmZicgfHwgIUFycmF5LmlzQXJyYXkocmVzdWx0Vmlldy5kaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gcmVzdWx0Vmlldy5kaWZmcy5tYXAoYXNGaWxlRGlmZikuZmlsdGVyKChkKTogZCBpcyBGaWxlRGlmZkxpa2UgPT4gZCAhPT0gbnVsbClcbn1cblxuLyoqIFJhdyBgbWV0YS5kaWZmc2AgZmFsbGJhY2sgKHRoZSBwZXJzaXN0ZWQgdG9vbC9yZXN1bHQgbWV0YSkuICovXG5mdW5jdGlvbiBkaWZmc0Zyb21NZXRhKG1ldGE6IHVua25vd24pOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghbWV0YSB8fCB0eXBlb2YgbWV0YSAhPT0gJ29iamVjdCcpIHJldHVybiBbXVxuICBjb25zdCBkaWZmcyA9IChtZXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5kaWZmc1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZGlmZnMpKSByZXR1cm4gW11cbiAgcmV0dXJuIGRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG5jb25zdCBNVVRBVElPTl9UT09MUyA9IG5ldyBTZXQoWydzdHJfcmVwbGFjZV9lZGl0b3InLCAnbm90ZWJvb2tfZWRpdCddKVxuY29uc3QgTVVUQVRJT05fQ09NTUFORFMgPSBuZXcgU2V0KFsnd3JpdGUnLCAnZWRpdCcsICdyZXBsYWNlJywgJ2RlbGV0ZScsICdtb3ZlJ10pXG5cbi8qKiBQYXRoLW9ubHkgZmFsbGJhY2sgZm9yIGtub3duIGZpbGUtbXV0YXRpbmcgdG9vbHMgd2hvc2UgcmVzdWx0IGNhcnJpZWQgbm8gZGlmZi4gKi9cbmZ1bmN0aW9uIG11dGF0aW9uUGF0aCh0b29sOiBzdHJpbmcsIGFyZ3NSYXc6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBsZXQgYXJnczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsID0gbnVsbFxuICB0cnkge1xuICAgIGFyZ3MgPSBKU09OLnBhcnNlKGFyZ3NSYXcpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKCFhcmdzIHx8IHR5cGVvZiBhcmdzICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgaWYgKHRvb2wgPT09ICdmcycgfHwgdG9vbCA9PT0gJ2ZpbGVzeXN0ZW0nKSB7XG4gICAgY29uc3QgY21kID0gdHlwZW9mIGFyZ3MuY29tbWFuZCA9PT0gJ3N0cmluZycgPyBhcmdzLmNvbW1hbmQgOiAnJ1xuICAgIGlmICghTVVUQVRJT05fQ09NTUFORFMuaGFzKGNtZCkpIHJldHVybiBudWxsXG4gICAgcmV0dXJuIHR5cGVvZiBhcmdzLmZpbGVfcGF0aCA9PT0gJ3N0cmluZycgJiYgYXJncy5maWxlX3BhdGggPyBhcmdzLmZpbGVfcGF0aCA6IG51bGxcbiAgfVxuICBpZiAoTVVUQVRJT05fVE9PTFMuaGFzKHRvb2wpIHx8IHRvb2wuc3RhcnRzV2l0aCgnZWRpdCcpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgWydmaWxlX3BhdGgnLCAncGF0aCcsICdmaWxlbmFtZSddKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3Nba2V5XSA9PT0gJ3N0cmluZycgJiYgYXJnc1trZXldKSByZXR1cm4gYXJnc1trZXldIGFzIHN0cmluZ1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG4vKiogRXh0cmFjdCB0aGUgY2hhbmdlZCBmaWxlcyBmcm9tIG9uZSBzZXR0bGVkIHRvb2wgcmVzdWx0IChkaWZmIGh1bmtzLCBlbHNlIHBhdGgtb25seSkuICovXG5mdW5jdGlvbiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQoY2FsbDogeyBuYW1lOiBzdHJpbmc7IGFyZ3NSYXc6IHN0cmluZyB9LCBub2RlOiBUb29sUmVzdWx0Tm9kZSk6IFJvdW5kQ2hhbmdlW10ge1xuICBjb25zdCB0b29sID0gY2FsbC5uYW1lXG4gIGNvbnN0IGRpZmZzID0gZGlmZnNGcm9tUmVzdWx0Vmlldyhub2RlLnJlc3VsdFZpZXcpXG4gIGNvbnN0IGZhbGxiYWNrRGlmZnMgPSBkaWZmcy5sZW5ndGggPT09IDAgPyBkaWZmc0Zyb21NZXRhKG5vZGUubWV0YSkgOiBbXVxuICBjb25zdCBhbGxEaWZmcyA9IGRpZmZzLmxlbmd0aCA+IDAgPyBkaWZmcyA6IGZhbGxiYWNrRGlmZnNcbiAgaWYgKGFsbERpZmZzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUm91bmRDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGQgb2YgYWxsRGlmZnMpIHtcbiAgICAgIGxldCBlbnRyeSA9IGJ5UGF0aC5nZXQoZC5wYXRoKVxuICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICBlbnRyeSA9IHsgcGF0aDogZC5wYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IHRydWUgfVxuICAgICAgICBieVBhdGguc2V0KGQucGF0aCwgZW50cnkpXG4gICAgICB9XG4gICAgICBlbnRyeS5odW5rcy5wdXNoKHsgb2xkVGV4dDogZC5vbGRUZXh0LCBuZXdUZXh0OiBkLm5ld1RleHQgfSlcbiAgICB9XG4gICAgcmV0dXJuIFsuLi5ieVBhdGgudmFsdWVzKCldXG4gIH1cbiAgY29uc3QgcGF0aCA9IG11dGF0aW9uUGF0aCh0b29sLCBjYWxsLmFyZ3NSYXcpXG4gIHJldHVybiBwYXRoID8gW3sgcGF0aCwgdG9vbCwgaHVua3M6IFtdLCBoYXNEaWZmOiBmYWxzZSB9XSA6IFtdXG59XG5cbi8qKiBQbGFpbiB0ZXh0IG9mIGEgdXNlciBtZXNzYWdlIChjb250ZW50IGJsb2NrcyBvZiB0eXBlICd0ZXh0JykuICovXG5mdW5jdGlvbiB1c2VyVGV4dChub2RlOiBVc2VyTWVzc2FnZU5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIG5vZGUuY29udGVudCkge1xuICAgIGlmIChibG9jayAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnICYmIChibG9jayBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICd0ZXh0JyAmJiB0eXBlb2YgKGJsb2NrIGFzIHsgdGV4dD86IHVua25vd24gfSkudGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBhcnRzLnB1c2goKGJsb2NrIGFzIHsgdGV4dDogc3RyaW5nIH0pLnRleHQpXG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJ0cy5qb2luKCcgJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxufVxuXG4vKiogV2FsayB0aGUgY29udmVyc2F0aW9uIG5vZGVzIGFuZCBncm91cCBjaGFuZ2VkIGZpbGVzIGJ5IHVzZXIgcm91bmQuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdFNlc3Npb25Sb3VuZHMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IFNlc3Npb25Sb3VuZFtdIHtcbiAgY29uc3Qgcm91bmRzOiBTZXNzaW9uUm91bmRbXSA9IFtdXG4gIGxldCBjdXJyZW50OiBTZXNzaW9uUm91bmQgfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBpZiAobm9kZS5raW5kID09PSAndXNlcicpIHtcbiAgICAgIGN1cnJlbnQgPSB7IHJvdW5kOiByb3VuZHMubGVuZ3RoICsgMSwgbGFiZWw6IHVzZXJUZXh0KG5vZGUpLnNsaWNlKDAsIDYwKSwgY2hhbmdlczogW10gfVxuICAgICAgcm91bmRzLnB1c2goY3VycmVudClcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcgfHwgIWN1cnJlbnQgfHwgIW5vZGUuY2FsbCkgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBjaGFuZ2UucGF0aCAmJiBjLnRvb2wgPT09IGNoYW5nZS50b29sKVxuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGlmIChjaGFuZ2UuaGFzRGlmZikge1xuICAgICAgICAgIGV4aXN0aW5nLmh1bmtzLnB1c2goLi4uY2hhbmdlLmh1bmtzKVxuICAgICAgICAgIGV4aXN0aW5nLmhhc0RpZmYgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQuY2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdW5kcy5maWx0ZXIoKHIpID0+IHIuY2hhbmdlcy5sZW5ndGggPiAwKVxufVxuXG4vKiogQ291bnQgb2YgY2hhbmdlZCBmaWxlcyBhY3Jvc3MgYWxsIHJvdW5kcyAoZm9yIHRoZSBoZWFkZXIgYmFkZ2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDBcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcgfHwgIW5vZGUuY2FsbCkgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhbmdlLnRvb2x9OiR7Y2hhbmdlLnBhdGh9YFxuICAgICAgaWYgKCFzZWVuLmhhcyhrZXkpKSB7XG4gICAgICAgIHNlZW4uYWRkKGtleSlcbiAgICAgICAgY291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnRcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWZmIHJlbmRlcmluZy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogU3BsaXQgb25lIGBnaXQgc2hvdyAtLWZvcm1hdD1gIGRpZmYgaW50byBwZXItZmlsZSBzZWdtZW50cy4gKi9cbmZ1bmN0aW9uIHNwbGl0Q29tbWl0RGlmZihkaWZmOiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXSB7XG4gIGNvbnN0IHNlZ21lbnRzOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nW10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9IHwgbnVsbCA9IG51bGxcbiAgZm9yIChjb25zdCBsaW5lIG9mIGRpZmYuc3BsaXQoJ1xcbicpKSB7XG4gICAgY29uc3QgbWF0Y2ggPSAvXmRpZmYgLS1naXQgYVxcLyguKj8pIGJcXC8vLmV4ZWMobGluZSlcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gICAgICBjdXJyZW50ID0geyBwYXRoOiBtYXRjaFsxXSwgdGV4dDogW2xpbmVdIH1cbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQudGV4dC5wdXNoKGxpbmUpXG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gIHJldHVybiBzZWdtZW50cy5tYXAoKHMpID0+ICh7IHBhdGg6IHMucGF0aCwgdGV4dDogcy50ZXh0LmpvaW4oJ1xcbicpIH0pKVxufVxuXG4vKiogU3RhdHVzIGxldHRlciBmb3IgYSBjb21taXQncyBmaWxlLCBkZXJpdmVkIGZyb20gaXRzIGRpZmYgc2VnbWVudCB0ZXh0LiAqL1xuZnVuY3Rpb24gY29tbWl0RmlsZVN0YXR1cyhzZWdtZW50VGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9ebmV3IGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnQSdcbiAgaWYgKC9eZGVsZXRlZCBmaWxlIG1vZGUvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ0QnXG4gIGlmICgvXnJlbmFtZSBmcm9tIC8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnUidcbiAgcmV0dXJuICdNJ1xufVxuXG50eXBlIERpZmZSb3cgPSB7IGtpbmQ6ICdhZGQnIHwgJ2RlbCcgfCAnY3R4JyB8ICdodW5rJyB8ICdmaWxlJyB8ICdub3RlJzsgdGV4dDogc3RyaW5nIH1cblxuLyoqIENsYXNzaWZ5IHJhdyB1bmlmaWVkLWRpZmYgdGV4dCAoZ2l0IG91dHB1dCkgaW50byByb3dzLiAqL1xuZnVuY3Rpb24gZ2l0RGlmZlJvd3MoZGlmZjogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgcmV0dXJuIGRpZmYuc3BsaXQoJ1xcbicpLm1hcCgobGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykpIHJldHVybiB7IGtpbmQ6ICdmaWxlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkgcmV0dXJuIHsga2luZDogJ2h1bmsnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIHJldHVybiB7IGtpbmQ6ICdhZGQnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIHJldHVybiB7IGtpbmQ6ICdkZWwnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSByZXR1cm4geyBraW5kOiAnbm90ZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIHJldHVybiB7IGtpbmQ6ICdjdHgnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgfSlcbn1cblxuLyoqIENvbXB1dGUgYWRkL2RlbC9jdHggcm93cyBiZXR3ZWVuIHR3byB0ZXh0cyAodGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSkuICovXG5mdW5jdGlvbiB0ZXh0RGlmZlJvd3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvd3Ncbn1cblxuLyoqIEFsbCByb3dzIGZvciBvbmUgcm91bmQgY2hhbmdlIChtdWx0aXBsZSBodW5rcyBnZXQgYEBAYCBzZXBhcmF0b3JzKS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVJvd3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IERpZmZSb3dbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGNoYW5nZS5odW5rcy5mb3JFYWNoKChodW5rLCBpKSA9PiB7XG4gICAgaWYgKGNoYW5nZS5odW5rcy5sZW5ndGggPiAxKSByb3dzLnB1c2goeyBraW5kOiAnaHVuaycsIHRleHQ6IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIH0pXG4gICAgcm93cy5wdXNoKC4uLnRleHREaWZmUm93cyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dCkpXG4gIH0pXG4gIHJldHVybiByb3dzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3BsaXQgKHR3by1jb2x1bW4pIGRpZmYgdmlldy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogT25lIGFsaWduZWQgcm93IG9mIHRoZSBzaWRlLWJ5LXNpZGUgdmlldy4gKi9cbmludGVyZmFjZSBTcGxpdFJvdyB7XG4gIGxlZnQ6IHN0cmluZ1xuICByaWdodDogc3RyaW5nXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBvbGQgZmlsZSwgb3IgbnVsbCAocHVyZSBhZGRpdGlvbikuICovXG4gIGxlZnROdW06IG51bWJlciB8IG51bGxcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG5ldyBmaWxlLCBvciBudWxsIChwdXJlIGRlbGV0aW9uKS4gKi9cbiAgcmlnaHROdW06IG51bWJlciB8IG51bGxcbiAga2luZDogJ2N0eCcgfCAnY2hhbmdlJ1xufVxuXG4vKiogT25lIHNpZGUtYnktc2lkZSBibG9jayAoYSBodW5rIHdpdGggaXRzIGBAQGAgaGVhZGVyKS4gKi9cbmludGVyZmFjZSBTcGxpdEJsb2NrIHtcbiAgaGVhZDogc3RyaW5nIHwgbnVsbFxuICByb3dzOiBTcGxpdFJvd1tdXG59XG5cbi8qKlxuICogUGFpciBhZGQvZGVsIHJvd3MgaW50byBhbGlnbmVkIGxlZnQvcmlnaHQgY29sdW1ucy4gUmVtb3ZlZCBsaW5lcyBidWZmZXJcbiAqIHVudGlsIHRoZSBtYXRjaGluZyBhZGRpdGlvbnMgYXJyaXZlICh1bmlmaWVkIGRpZmYgb3JkZXJzIGRlbGV0aW9ucyBiZWZvcmVcbiAqIGFkZGl0aW9ucyksIHNvIHB1cmUgZGVsZXRpb25zIGFuZCBwdXJlIGFkZGl0aW9ucyBzdGlsbCBnZXQgdGhlaXIgb3duIHJvd1xuICogd2l0aCBhbiBlbXB0eSBjZWxsIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLiBMaW5lIG51bWJlcnMgdHJhY2sgZnJvbSB0aGUgaHVua1xuICogaGVhZGVyJ3MgYC1hLGIgK2MsZGAgcG9zaXRpb25zLlxuICovXG5mdW5jdGlvbiBwYWlyUm93cyhyb3dzOiBEaWZmUm93W10sIG9sZFN0YXJ0OiBudW1iZXIsIG5ld1N0YXJ0OiBudW1iZXIpOiBTcGxpdFJvd1tdIHtcbiAgY29uc3Qgb3V0OiBTcGxpdFJvd1tdID0gW11cbiAgbGV0IG9sZExpbmUgPSBvbGRTdGFydFxuICBsZXQgbmV3TGluZSA9IG5ld1N0YXJ0XG4gIGxldCBwZW5kaW5nOiB7IHRleHQ6IHN0cmluZzsgbnVtOiBudW1iZXIgfVtdID0gW11cbiAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBwIG9mIHBlbmRpbmcpIG91dC5wdXNoKHsgbGVmdDogcC50ZXh0LCByaWdodDogJycsIGxlZnROdW06IHAubnVtLCByaWdodE51bTogbnVsbCwga2luZDogJ2NoYW5nZScgfSlcbiAgICBwZW5kaW5nID0gW11cbiAgfVxuICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgcGVuZGluZy5wdXNoKHsgdGV4dDogcm93LnRleHQuc2xpY2UoMSksIG51bTogb2xkTGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgIGNvbnN0IHAgPSBwZW5kaW5nLnNoaWZ0KClcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogcD8udGV4dCA/PyAnJywgcmlnaHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBsZWZ0TnVtOiBwPy5udW0gPz8gbnVsbCwgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2NoYW5nZScgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgZmx1c2goKVxuICAgICAgLy8gVW5pZmllZC1kaWZmIGNvbnRleHQgbGluZXMgY2FycnkgYSBsZWFkaW5nIHNwYWNlIFx1MjAxNCBzdHJpcCBpdCBmb3IgdGhlXG4gICAgICAvLyBzcGxpdCBjZWxscyBzbyBib3RoIGNvbHVtbnMgcmVuZGVyIGJhcmUgdGV4dC5cbiAgICAgIGNvbnN0IHRleHQgPSByb3cudGV4dC5zdGFydHNXaXRoKCcgJykgPyByb3cudGV4dC5zbGljZSgxKSA6IHJvdy50ZXh0XG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHRleHQsIHJpZ2h0OiB0ZXh0LCBsZWZ0TnVtOiBvbGRMaW5lKyssIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjdHgnIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGZsdXNoKCkgLy8gbm90ZXMgKFxcIE5vIG5ld2xpbmVcdTIwMjYpIGFuZCBzdHJheSByb3dzOiBqdXN0IGJyZWFrIHRoZSBwYWlyaW5nXG4gICAgfVxuICB9XG4gIGZsdXNoKClcbiAgcmV0dXJuIG91dFxufVxuXG4vKiogUGFyc2UgZ2l0IHVuaWZpZWQgZGlmZiB0ZXh0IGludG8gYmxvY2tzIChgLS0tLysrK2AgZmlsZSByb3dzIGFuZCBgQEBgIGh1bmtzKS4gKi9cbmNvbnN0IEdJVF9NRVRBID0gL14oZGlmZiAtLWdpdCB8aW5kZXggfG5ldyBmaWxlIHxkZWxldGVkIGZpbGUgfG9sZCBtb2RlIHxuZXcgbW9kZSB8c2ltaWxhcml0eSBpbmRleCB8cmVuYW1lIChmcm9tfHRvKSB8QmluYXJ5IGZpbGVzICkvXG5cbmZ1bmN0aW9uIHBhcnNlR2l0QmxvY2tzKGRpZmY6IHN0cmluZyk6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10ge1xuICBjb25zdCBibG9ja3M6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH0gfCBudWxsID0gbnVsbFxuICBjb25zdCBsaW5lcyA9IGRpZmYuc3BsaXQoJ1xcbicpXG4gIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgbGV0IGtpbmQ6IERpZmZSb3dbJ2tpbmQnXVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykgfHwgR0lUX01FVEEudGVzdChsaW5lKSkga2luZCA9ICdmaWxlJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkga2luZCA9ICdodW5rJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKycpKSBraW5kID0gJ2FkZCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkga2luZCA9ICdkZWwnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSBraW5kID0gJ25vdGUnXG4gICAgZWxzZSBraW5kID0gJ2N0eCdcbiAgICBpZiAoa2luZCA9PT0gJ2ZpbGUnIHx8IGtpbmQgPT09ICdodW5rJykge1xuICAgICAgY3VycmVudCA9IHsgaGVhZDogeyBraW5kLCB0ZXh0OiBsaW5lIH0sIHJvd3M6IFtdIH1cbiAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY3VycmVudCkge1xuICAgICAgICBjdXJyZW50ID0geyBoZWFkOiBudWxsLCByb3dzOiBbXSB9XG4gICAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgICB9XG4gICAgICBjdXJyZW50LnJvd3MucHVzaCh7IGtpbmQsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJsb2Nrc1xufVxuXG4vKiogSHVuayBzdGFydCBwb3NpdGlvbnMgZnJvbSBhIGBAQCAtYSxiICtjLGQgQEBgIGhlYWRlci4gKi9cbmZ1bmN0aW9uIGh1bmtTdGFydHMoaGVhZDogc3RyaW5nKTogeyBvbGRTdGFydDogbnVtYmVyOyBuZXdTdGFydDogbnVtYmVyIH0ge1xuICBjb25zdCBtID0gL15AQCAtKFxcZCspKD86LFxcZCspPyBcXCsoXFxkKykvLmV4ZWMoaGVhZClcbiAgcmV0dXJuIHsgb2xkU3RhcnQ6IG0gPyBOdW1iZXIobVsxXSkgOiAxLCBuZXdTdGFydDogbSA/IE51bWJlcihtWzJdKSA6IDEgfVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgYSBnaXQgdW5pZmllZCBkaWZmIChza2lwcyBwdXJlIGZpbGUtaGVhZGVyIGJsb2NrcykuICovXG5mdW5jdGlvbiBnaXRTcGxpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICByZXR1cm4gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgICAuZmlsdGVyKChiKSA9PiBiLmhlYWQ/LmtpbmQgIT09ICdmaWxlJyAmJiAoYi5yb3dzLmxlbmd0aCA+IDAgfHwgYi5oZWFkPy5raW5kID09PSAnaHVuaycpKVxuICAgIC5tYXAoKGIpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0cyA9IGIuaGVhZCA/IGh1bmtTdGFydHMoYi5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgcmV0dXJuIHsgaGVhZDogYi5oZWFkPy5raW5kID09PSAnaHVuaycgPyBiLmhlYWQudGV4dCA6IG51bGwsIHJvd3M6IHBhaXJSb3dzKGIucm93cywgc3RhcnRzLm9sZFN0YXJ0LCBzdGFydHMubmV3U3RhcnQpIH1cbiAgICB9KVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgdGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSAob2xkVGV4dC9uZXdUZXh0KS4gKi9cbmZ1bmN0aW9uIHRleHRTcGxpdEJsb2NrcyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gW3sgaGVhZDogbnVsbCwgcm93czogcGFpclJvd3Mocm93cywgMSwgMSkgfV1cbn1cblxuLyoqIEFsbCBzaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBvbmUgcm91bmQgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hhbmdlU3BsaXRCbG9ja3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IFNwbGl0QmxvY2tbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIHJldHVybiBjaGFuZ2UuaHVua3MubWFwKChodW5rLCBpKSA9PiAoe1xuICAgIGhlYWQ6IGNoYW5nZS5odW5rcy5sZW5ndGggPiAxID8gYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgOiBudWxsLFxuICAgIHJvd3M6IHRleHRTcGxpdEJsb2NrcyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dClbMF0ucm93cyxcbiAgfSkpXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3R5bGVzIChkc2RyLSo7IHRoZSBoZWFkZXIgdHJpZ2dlciBtaXJyb3JzIHRoZSBpbi10cmVlIGFjdGlvbiByb3dzKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBSRVZJRVdfQ1NTID0gYFxuLmRzZHItdHJpZ2dlcnttaW4taGVpZ2h0OjI4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjRweDtwYWRkaW5nOjNweCA2cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXRyaWdnZXI6aG92ZXIsLmRzZHItdHJpZ2dlcjpmb2N1cy12aXNpYmxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbGFiZWx7bWFyZ2luLWxlZnQ6MnB4fVxuLmRzZHItY291bnR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDttaW4td2lkdGg6MTZweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA1cHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItb3ZlcmxheXtwb3NpdGlvbjpmaXhlZDtpbnNldDowO3otaW5kZXg6MjAwO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNDUpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtwYWRkaW5nOjMycHh9XG4uZHNkci1wYW5lbHtib3gtc2l6aW5nOmJvcmRlci1ib3g7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6bWluKDExMjBweCwxMDAlKTtoZWlnaHQ6bWluKDcyMHB4LGNhbGMoMTAwdmggLSA2NHB4KSk7bWF4LXdpZHRoOmNhbGMoMTAwdncgLSA2NHB4KTttYXgtaGVpZ2h0OmNhbGMoMTAwdmggLSA2NHB4KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czoxNHB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItcmVzaXple3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NX1cbi5kc2RyLXJlc2l6ZS1le3RvcDowO3JpZ2h0Oi0zcHg7d2lkdGg6N3B4O2hlaWdodDoxMDAlO2N1cnNvcjpldy1yZXNpemV9XG4uZHNkci1yZXNpemUtc3tib3R0b206LTNweDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6N3B4O2N1cnNvcjpucy1yZXNpemV9XG4uZHNkci1yZXNpemUtc2V7cmlnaHQ6LTRweDtib3R0b206LTRweDt3aWR0aDoxNXB4O2hlaWdodDoxNXB4O2N1cnNvcjpud3NlLXJlc2l6ZX1cbi5kc2RyLWhlYWRlcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6MTJweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLXRpdGxle2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zdWJ0aXRsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItdGFic3tkaXNwbGF5OmZsZXg7Z2FwOjRweDttYXJnaW4tbGVmdDoxNHB4fVxuLmRzZHItdGFie2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI2cHg7Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoycHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLXRhYjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXRhYi1hY3RpdmV7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zY29wZXtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21hcmdpbi1sZWZ0OjhweH1cbi5kc2RyLXNjb3BlIC5kc2RyLXNlbC10cmlnZ2Vye21pbi13aWR0aDoxMTBweDtoZWlnaHQ6MjZweDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MCA4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1zcGFjZXJ7ZmxleDoxfVxuLmRzZHItYnRue2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweH1cbi5kc2RyLWJ0bjpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuOmRpc2FibGVke29wYWNpdHk6LjU7Y3Vyc29yOmRlZmF1bHR9XG4uZHNkci1idG4tcHJpbWFyeXtib3JkZXItY29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC00MDApO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcjpob3Zlcjpub3QoOmRpc2FibGVkKXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tY29uZmlybXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItYnRuLWNvbmZpcm06aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1jb21taXQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjIwMHB4O21pbi1oZWlnaHQ6MjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjNweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItY29tbWl0LWlucHV0OjpwbGFjZWhvbGRlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtY2FwdGlvbil9XG4uZHNkci1jb21taXQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1zZWN0aW9ue2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjEwcHggOHB4IDNweDtmb250LXdlaWdodDo2MDA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4fVxuLmRzZHItc2VjdGlvbjpmaXJzdC1jaGlsZHtwYWRkaW5nLXRvcDo0cHh9XG4uZHNkci1icmFuY2h7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NHB4IDhweCA4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1icmFuY2gtcmVme2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczttaW4td2lkdGg6MDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnJhbmNoLWFycm93e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1icmFuY2gtc3RhdHtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWJyYW5jaC1haGVhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1iZWhpbmR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXdhcm4tcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtc3luY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdHtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NXB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY29tbWl0OmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRsLXNlbGVjdGVkIC5kc2RyLWNvbW1pdHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10aW1lbGluZXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItdGwtaXRlbXtkaXNwbGF5OmZsZXg7Z2FwOjZweDthbGlnbi1pdGVtczpzdHJldGNoO2JvcmRlci1yYWRpdXM6OHB4fVxuLmRzZHItdGwtcmFpbHtwb3NpdGlvbjpyZWxhdGl2ZTtmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcn1cbi5kc2RyLXRsLXJhaWw6OmJlZm9yZXtjb250ZW50OlwiXCI7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7Ym90dG9tOjA7bGVmdDo1MCU7d2lkdGg6MXB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMil9XG4uZHNkci10bC1pdGVtOmZpcnN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXt0b3A6OXB4fVxuLmRzZHItdGwtaXRlbTpsYXN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXtib3R0b206YXV0bztoZWlnaHQ6OXB4fVxuLmRzZHItdGwtZG90e3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MTt0b3A6OXB4O2ZsZXg6bm9uZTt3aWR0aDo3cHg7aGVpZ2h0OjdweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItdGwtZG90LWxvY2Fse2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1kb3QtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWNvbW1pdC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4td2lkdGg6MH1cbi5kc2RyLWNvbW1pdC1zaG9ydHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1zdWJqZWN0e2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1jb21taXQtbWV0YXtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmctbGVmdDowfVxuLmRzZHItdGwtYmFkZ2V7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDVweH1cbi5kc2RyLXRsLWJhZGdlLWxvY2Fse2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWJhZGdlLXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItZGlmZi1oYXNoe21hcmdpbi1sZWZ0OjhweDtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LWZpbGUtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItY29tbWl0LWZpbGUtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7bWFyZ2luLWxlZnQ6NHB4fVxuLmRzZHItY2ZnLWNhcmR7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXItcmFkaXVzOjEycHg7bGlzdC1zdHlsZTpub25lO3RyYW5zaXRpb246Ym9yZGVyLWNvbG9yIC4xNnMsYmFja2dyb3VuZCAuMTZzfVxuLmRzZHItY2ZnLWNhcmQ6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWNhcmQtb3BlbntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jZmctaGVhZHthcHBlYXJhbmNlOm5vbmU7d2lkdGg6MTAwJTtmb250OmluaGVyaXQ7Y29sb3I6aW5oZXJpdDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czoxMnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtwYWRkaW5nOjE0cHggMTZweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctaGVhZDpmb2N1cy12aXNpYmxle291dGxpbmU6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lLW9mZnNldDotMnB4fVxuLmRzZHItY2ZnLWhlYWQtdGV4dHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47ZmxleDoxO2dhcDo0cHg7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLW5hbWV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjYwMDtsaW5lLWhlaWdodDoxLjR9XG4uZHNkci1jZmctZGVzY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1jYXJldHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTZzfVxuLmRzZHItY2ZnLWNhcmV0LW9wZW57dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItY2ZnLWJvZHl7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7bWFyZ2luOjAgMTZweDtwYWRkaW5nLWJvdHRvbTo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLWNmZy1maWVsZHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjEycHggMDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctZmllbGQrLmRzZHItY2ZnLWZpZWxke2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItY2ZnLWxhYmVse21pbi13aWR0aDowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NTAwO2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1oaW50e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLXBlbmRpbmd7d2hpdGUtc3BhY2U6bm93cmFwO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDtmbGV4Om5vbmU7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxN3B4fVxuLmRzZHItY2ZnLWZhaWxlZHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZXJyb3IpO2ZsZXg6MTttYXJnaW46MDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctYWN0aW9uc3tib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzoxMnB4IDAgNHB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWJvZHl7ZGlzcGxheTpmbGV4O2ZsZXg6MTttaW4taGVpZ2h0OjB9XG4uZHNkci1maWxlc3t3aWR0aDozMDBweDtmbGV4Om5vbmU7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtvdmVyZmxvdy15OmF1dG87cGFkZGluZzo4cHh9XG4uZHNkci1yb3VuZHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo4cHggOHB4IDNweDtmb250LXdlaWdodDo2MDB9XG4uZHNkci1yb3VuZC1sYWJlbHt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NDAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItZmlsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maWxlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbGUtc2VsZWN0ZWR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZGlye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItZGlyOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kaXItY2FyZXR7ZmxleDpub25lO3dpZHRoOjEycHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpci1uYW1le2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItZGlyLWNvdW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWZpbGUtbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmlsZS1zdGF0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWNoaXB7ZmxleDpub25lO21pbi13aWR0aDoyMnB4O3RleHQtYWxpZ246Y2VudGVyO2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNoaXAtbXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtYXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtZHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xNik7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWNoaXAtcntiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpO2NvbG9yOiM1OGE2ZmZ9XG4uZHNkci1jaGlwLXV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXRvb2x7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1kaWZme2ZsZXg6MTttaW4td2lkdGg6MDtvdmVyZmxvdzphdXRvO3BhZGRpbmc6MTBweCAwfVxuLmRzZHItZGlmZi1lbXB0eXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7aGVpZ2h0OjEwMCU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWRpZmYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6NnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItZGlmZi1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZGlmZi1zdGF0c3tmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXNjcm9sbHtmbGV4OjE7bWluLWhlaWdodDowO292ZXJmbG93OmF1dG87ZGlzcGxheTpmbGV4fVxuLmRzZHItcHJle21hcmdpbjowO3BhZGRpbmc6OHB4IDA7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KTt3aGl0ZS1zcGFjZTpwcmU7bWluLXdpZHRoOjEwMCU7ZmxleDoxfVxuLmRzZHItbGluZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MTBweDtwYWRkaW5nOjAgMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cG9zaXRpb246cmVsYXRpdmV9XG4uZHNkci1saW5lLW51bXtmbGV4Om5vbmU7d2lkdGg6MzRweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO29wYWNpdHk6Ljc1fVxuLmRzZHItbGluZS10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpwcmV9XG4uZHNkci1jb21tZW50LWFkZHtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE4cHg7aGVpZ2h0OjE4cHg7Ym9yZGVyLXJhZGl1czo2cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO21hcmdpbi10b3A6MXB4O3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1jb21tZW50LWFkZCwuZHNkci1jb21tZW50LWFkZDpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWNvbW1lbnQtYWRkOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jb21tZW50LWhhc3t2aXNpYmlsaXR5OnZpc2libGU7YmFja2dyb3VuZDpjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDE2JSwgdHJhbnNwYXJlbnQpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKTtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQ7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItbGluZS1jb21tZW50ZWR7Ym94LXNoYWRvdzppbnNldCAzcHggMCAwIGNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCkgNzAlLCB0cmFuc3BhcmVudCl9XG4uZHNkci1jb21tZW50LWVkaXRvcntkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLWNvbW1lbnQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDo1MnB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo2cHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3Jlc2l6ZTp2ZXJ0aWNhbH1cbi5kc2RyLWNvbW1lbnQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1jb21tZW50LWFjdGlvbnN7ZGlzcGxheTpmbGV4O2dhcDo2cHg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kfVxuLmRzZHItY29tbWVudC1wb3B7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoyMDtyaWdodDoxNnB4O3RvcDpjYWxjKDEwMCUgKyAycHgpO21pbi13aWR0aDoyODBweDttYXgtd2lkdGg6NDQwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3JkZXItcmFkaXVzOjEwcHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7cGFkZGluZzo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4fVxuLmRzZHItY29tbWVudC1pdGVte2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtwYWRkaW5nLWJvdHRvbTo2cHh9XG4uZHNkci1jb21tZW50LWl0ZW06bGFzdC1jaGlsZHtib3JkZXItYm90dG9tOjA7cGFkZGluZy1ib3R0b206MH1cbi5kc2RyLWNvbW1lbnQtdGV4dHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWVudC1tZXRhe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWVudC1tZXRhIC5kc2RyLWJ0bnttaW4taGVpZ2h0OjIwcHg7cGFkZGluZzowIDZweDtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O21hcmdpbi1sZWZ0OmF1dG99XG4uZHNkci1vcGVubGluZXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE4cHg7aGVpZ2h0OjE4cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1vcGVubGluZSwuZHNkci1vcGVubGluZTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLW9wZW5saW5lOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWxpbmUtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDNweCAwIDAgdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKX1cbi5kc2RyLWZpbmRpbmctUDB7LS1kc2RyLWZpbmRpbmctY29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctUDF7LS1kc2RyLWZpbmRpbmctY29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctUDJ7LS1kc2RyLWZpbmRpbmctY29sb3I6I2QyOTkyMn1cbi5kc2RyLWZpbmRpbmctUDN7LS1kc2RyLWZpbmRpbmctY29sb3I6IzhiOTQ5ZX1cbi5kc2RyLWZpbmRpbmctdGFne2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydDttYXJnaW4tdG9wOjJweH1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXJldmlldy1zdHJpcHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO2ZvbnQtc2l6ZToxMnB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItcmV2aWV3LW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWJhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctbW9kZWx7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXJldmlldy10b2dnbGUtb257Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maW5kaW5nc3tkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWF4LWhlaWdodDoyNjBweDtvdmVyZmxvdy15OmF1dG99XG4uZHNkci1maW5kaW5nLWl0ZW17ZGlzcGxheTpmbGV4O2dhcDo4cHg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0fVxuLmRzZHItZmluZGluZy1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbmRpbmctYm9keXtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4fVxuLmRzZHItZmluZGluZy10aXRsZXtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpiYXNlbGluZTtnYXA6OHB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItZmluZGluZy1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo0MDB9XG4uZHNkci1maW5kaW5nLWRldGFpbHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1maW5kaW5nLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbmRpbmctc3VnZ2VzdGlvbntkaXNwbGF5OmJsb2NrO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjRweCA4cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1wcntkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo0cHggOHB4IDhweH1cbi5kc2RyLXByLWl0ZW17ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXR9XG4uZHNkci1wci1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXByLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXByLXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLWRvY2t7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O21hcmdpbjo2cHggMTJweCAwO3BhZGRpbmc6NnB4IDEwcHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6MTBweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItZG9jay1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4taGVpZ2h0OjIycHh9XG4uZHNkci1kb2NrLWljb257ZGlzcGxheTppbmxpbmUtZmxleDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCl9XG4uZHNkci1kb2NrLWNvdW50e2ZvbnQtd2VpZ2h0OjYwMDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2stY2xvc2V7ZmxleDpub25lO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MjBweDtoZWlnaHQ6MjBweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowfVxuLmRzZHItZG9jay1jbG9zZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZG9jay1saXN0e2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjJweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtwYWRkaW5nLXRvcDo0cHg7bWFyZ2luLXRvcDoycHg7bWF4LWhlaWdodDoxNjhweDtvdmVyZmxvdy15OmF1dG99XG4uZHNkci1kb2NrLWl0ZW17ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MXB4O3RleHQtYWxpZ246bGVmdDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6N3B4O3BhZGRpbmc6NHB4IDhweDtjdXJzb3I6cG9pbnRlcjtmb250OmluaGVyaXR9XG4uZHNkci1kb2NrLWl0ZW06aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZG9jay1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1kb2NrLXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtkaXNwbGF5Oi13ZWJraXQtYm94Oy13ZWJraXQtbGluZS1jbGFtcDoyOy13ZWJraXQtYm94LW9yaWVudDp2ZXJ0aWNhbDtvdmVyZmxvdzpoaWRkZW47b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLXNlbmR7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDo0MDt0b3A6NTJweDtyaWdodDoxNnB4O3dpZHRoOm1pbig0ODBweCxjYWxjKDEwMCUgLSAzMnB4KSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3JkZXItcmFkaXVzOjEycHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7cGFkZGluZzoxMnB4O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjhweH1cbi5kc2RyLXNlbmQtdGl0bGV7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbmQtaGludHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1zZW5kLWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MTQwcHg7bWF4LWhlaWdodDozMjBweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtyZXNpemU6dmVydGljYWw7d2hpdGUtc3BhY2U6cHJlLXdyYXB9XG4uZHNkci1saW5lLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1saW5lLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1saW5lLWh1bmt7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtZmlsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1ub3Rle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zdHlsZTppdGFsaWN9XG4uZHNkci1odW5rLWJhcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7cGFkZGluZzoycHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKX1cbi5kc2RyLWh1bmstYmFyIC5kc2RyLWJ0bnttaW4taGVpZ2h0OjIycHg7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci1odW5rLWxheWVye2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTttYXJnaW4tcmlnaHQ6YXV0b31cbi5kc2RyLWZvb3R7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZTttaW4taGVpZ2h0OjM2cHh9XG4uZHNkci1ub3RpY2V7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1ub3RpY2Utb2t7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1ub3RpY2UtZXJyb3J7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItc3Bpbm5lcntmbGV4Om5vbmU7d2lkdGg6MTJweDtoZWlnaHQ6MTJweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci10b3AtY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7YW5pbWF0aW9uOmRzZHItc3BpbiAuOHMgbGluZWFyIGluZmluaXRlfVxuQGtleWZyYW1lcyBkc2RyLXNwaW57dG97dHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX1cbi5kc2RyLWVtcHR5e3BhZGRpbmc6NDBweDt0ZXh0LWFsaWduOmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4fVxuLmRzZHItbm9kaWZme3BhZGRpbmc6OHB4IDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLXNlbHtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItc2VsLXRyaWdnZXJ7Ym94LXNpemluZzpjb250ZW50LWJveDttaW4td2lkdGg6MTgwcHg7aGVpZ2h0OjM0cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMyk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowIDEycHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4fVxuLmRzZHItc2VsLXRyaWdnZXI6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItc2VsLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpO291dGxpbmU6bm9uZX1cbi5kc2RyLXNlbC10cmlnZ2VyIHN2Z3tmbGV4Om5vbmU7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjEyc31cbi5kc2RyLXNlbC10cmlnZ2VyW2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdIHN2Z3t0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9XG4uZHNkci1zZWwtdmFsdWV7ZmxleDoxO21pbi13aWR0aDowO3RleHQtYWxpZ246bGVmdDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1zZWwtbWVudXt6LWluZGV4OjIwMDtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLXdpZHRoOjEwMCU7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtib3JkZXItcmFkaXVzOjEwcHg7bWFyZ2luOjA7cGFkZGluZzo0cHg7bGlzdC1zdHlsZTpub25lO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjFweDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6Y2FsYygxMDAlICsgNXB4KTtsZWZ0OjB9XG4uZHNkci1zZWwtb3B0aW9ue2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MzBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Ym9yZGVyLXJhZGl1czo3cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo1cHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO3RleHQtYWxpZ246bGVmdDtkaXNwbGF5OmZsZXh9XG4uZHNkci1zZWwtb3B0aW9uOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXNlbC1vcHRpb24tYWN0aXZle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbWFya3tmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItc2VsLW9wdGlvbi1sYWJlbHtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItdmlldy10b2dnbGV7ZGlzcGxheTpmbGV4O2dhcDoycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjJweDtmbGV4Om5vbmV9XG4uZHNkci12aWV3LWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyMnB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjFweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci12aWV3LWJ0bjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXZpZXctYnRuLWFjdGl2ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXR7bWluLXdpZHRoOjEwMCV9XG4uZHNkci1zcGxpdC1oZWFke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo0cHggOHB4O3Bvc2l0aW9uOnN0aWNreTt0b3A6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItc3BsaXQtaGVhZCBkaXZ7ZGlzcGxheTpmbGV4O2dhcDo4cHh9XG4uZHNkci1zcGxpdC1odW5re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MnB4IDE2cHh9XG4uZHNkci1zcGxpdC1yb3d7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCl9XG4uZHNkci1zcGxpdC1jZWxse2Rpc3BsYXk6ZmxleDtnYXA6OHB4O3BhZGRpbmc6MCA4cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGxpdC1udW17ZmxleDpub25lO3dpZHRoOjM2cHg7dGV4dC1hbGlnbjpyaWdodDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3VzZXItc2VsZWN0Om5vbmU7Zm9udC1zaXplOmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpIC0gMXB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCl9XG4uZHNkci1zcGxpdC10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MH1cbi5kc2RyLWNlbGwtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDAgMCAwIDFweCB2YXIoLS1kc2RyLWZpbmRpbmctY29sb3IsIHJnYmEoMjU1LDE2Niw4NywuNykpO2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4wOCl9XG4uZHNkci1jZWxsLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXNwbGl0LWZpbmRpbmd7ZmxleDpub25lO2ZvbnQtc2l6ZTo5cHg7bGluZS1oZWlnaHQ6MTJweDtib3JkZXItcmFkaXVzOjNweDtwYWRkaW5nOjAgM3B4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtd2VpZ2h0OjYwMDthbGlnbi1zZWxmOmZsZXgtc3RhcnR9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAxe2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4xNik7Y29sb3I6I2ZmYTY1N31cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAye2JhY2tncm91bmQ6cmdiYSgyMTAsMTUzLDM0LC4xNik7Y29sb3I6I2QyOTkyMn1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1zcGxpdC1vcGVubGluZXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItc3BsaXQtY2VsbDpob3ZlciAuZHNkci1zcGxpdC1vcGVubGluZSwuZHNkci1zcGxpdC1vcGVubGluZTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLXNwbGl0LW9wZW5saW5lOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWNlbGwtYWRke2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjEzKX1cbi5kc2RyLWNlbGwtZGVse2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjEyKX1cbi5kc2RyLWNlbGwtZGlte2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDEsIHJnYmEoMTI4LDEyOCwxMjgsLjA1KSl9XG5gXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZVtkYXRhLXBsdWdpbi1jc3M9JHtKU09OLnN0cmluZ2lmeShTVFlMRV9UQUcpfV1gKSA9PT0gbnVsbCkge1xuICBjb25zdCB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gIHRhZy5kYXRhc2V0LnBsdWdpbiA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3J1xuICB0YWcuZGF0YXNldC5wbHVnaW5Dc3MgPSBTVFlMRV9UQUdcbiAgdGFnLnRleHRDb250ZW50ID0gUkVWSUVXX0NTU1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRhZylcbn1cblxuLyoqIFNpbXBsaWZpZWQgQ2hpbmVzZSBkaWN0aW9uYXJ5IChrZXktc2V0IHNvdXJjZSBvZiB0cnV0aCkuICovXG5jb25zdCB6aCA9IHtcbiAgJ2FjdGlvbi5sYWJlbCc6ICdcdTUzRDhcdTUyQTgnLFxuICAnYWN0aW9uLmFyaWEnOiAnXHU1QkExXHU2N0U1XHU1RjUzXHU1MjREXHU5ODc5XHU3NkVFXHU0RTBFXHU2QkNGXHU4RjZFXHU0RkVFXHU2NTM5JyxcbiAgJ3RhYi5zZXNzaW9uJzogJ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOScsXG4gICd0YWIud29ya3NwYWNlJzogJ1x1NURFNVx1NEY1Q1x1NTMzQScsXG4gICdyZXZpZXcudGl0bGUnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ3Jldmlldy5icmFuY2gnOiAnXHU1MjA2XHU2NTJGJyxcbiAgJ3Jldmlldy5kZXRhY2hlZCc6ICdcdTZFMzhcdTc5QkIgSEVBRCcsXG4gICdyZXZpZXcubm90UmVwbyc6ICdcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcdTRFMERcdTY2MkYgZ2l0IFx1NEVEM1x1NUU5MycsXG4gICdyZXZpZXcubm90UmVwb0hpbnQnOiAnXHUzMDBDXHU0RjFBXHU4QkREXHU2NkY0XHU2NTM5XHUzMDBEXHU5ODc1XHU3QjdFXHU0RTBEXHU1M0Q3XHU1RjcxXHU1NENEXHVGRjBDXHU0RUNEXHU1M0VGXHU2N0U1XHU3NzBCXHU2QkNGXHU4RjZFXHU0RkVFXHU2NTM5XHUzMDAyJyxcbiAgJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJzogJ1x1OEZEOVx1NEUyQVx1NEYxQVx1OEJERFx1OEZEOFx1NkNBMVx1NjcwOVx1NjU4N1x1NEVGNlx1NEZFRVx1NjUzOVx1OEJCMFx1NUY1NScsXG4gICdyZXZpZXcuc2Vzc2lvblN0YXRzJzogJ3tyb3VuZHN9IFx1OEY2RSBcdTAwQjcge2ZpbGVzfSBcdTRFMkFcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LnJvdW5kJzogJ1x1N0IyQyB7cm91bmR9IFx1OEY2RScsXG4gICdyZXZpZXcuZW1wdHknOiAnXHU2Q0ExXHU2NzA5XHU2NzJBXHU2M0QwXHU0RUE0XHU3Njg0XHU2NkY0XHU2NTM5IFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ1x1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcuYWNjZXB0JzogJ1x1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0JzogJ1x1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuYWNjZXB0QWxsJzogJ1x1NTE2OFx1OTBFOFx1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1x1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcudW5zdGFnZSc6ICdcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnVuc3RhZ2VBbGwnOiAnXHU1MTY4XHU5MEU4XHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsuc3RhZ2UnOiAnXHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsucmV2ZXJ0JzogJ1x1NEUyMlx1NUYwMycsXG4gICdodW5rLnVuc3RhZ2UnOiAnXHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsuc3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnVuc3RhZ2VkJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU1MTY4XHU5MEU4XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb21taXQnOiAnXHU2M0QwXHU0RUE0JyxcbiAgJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcic6ICdcdTYzRDBcdTRFQTRcdThCRjRcdTY2MEVcdTIwMjYnLFxuICAncmV2aWV3LnB1c2gnOiAnXHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb25maXJtUHVzaCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LmNvbW1pdHRlZCc6ICdcdTVERjJcdTYzRDBcdTRFQTQge3N1bW1hcnl9JyxcbiAgJ3Jldmlldy5jb21taXRGYWlsZWQnOiAnXHU2M0QwXHU0RUE0XHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5wdXNoZWQnOiAnXHU1REYyXHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5wdXNoRmFpbGVkJzogJ1x1NjNBOFx1OTAwMVx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcuYWhlYWQnOiAnXHU5ODg2XHU1MTQ4IHtufScsXG4gICdyZXZpZXcuYmVoaW5kJzogJ1x1ODQzRFx1NTQwRSB7bn0nLFxuICAncmV2aWV3LnNlY3Rpb25TdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcyc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnNlY3Rpb25CcmFuY2gnOiAnXHU1MjA2XHU2NTJGXHU0RTBFXHU4RkRDXHU3QTBCJyxcbiAgJ3Jldmlldy5ub1Vwc3RyZWFtJzogJ1x1NjcyQVx1OEJCRVx1N0Y2RVx1NEUwQVx1NkUzOFx1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuaGlzdG9yeSc6ICdcdTUzODZcdTUzRjInLFxuICAncmV2aWV3LmNvbW1pdEZpbGVzJzogJ1x1NTNEOFx1NTJBOFx1NjU4N1x1NEVGNicsXG4gICdoaXN0b3J5LmxvY2FsJzogJ1x1NjcyQ1x1NTczMCcsXG4gICdoaXN0b3J5LnJlbW90ZSc6ICdcdThGRENcdTdBMEInLFxuICAndGltZS5ub3cnOiAnXHU1MjFBXHU1MjFBJyxcbiAgJ3RpbWUubWludXRlcyc6ICd7bn0gXHU1MjA2XHU5NDlGXHU1MjREJyxcbiAgJ3RpbWUuaG91cnMnOiAne259IFx1NUMwRlx1NjVGNlx1NTI0RCcsXG4gICd0aW1lLmRheXMnOiAne259IFx1NTkyOVx1NTI0RCcsXG4gICdyZXZpZXcucmVmcmVzaCc6ICdcdTUyMzdcdTY1QjAnLFxuICAncmV2aWV3LmNsb3NlJzogJ1x1NTE3M1x1OTVFRCcsXG4gICdyZXZpZXcuYnVzeSc6ICdcdTU5MDRcdTc0MDZcdTRFMkRcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LmRvbmVPbmUnOiAnXHU1REYye2FjdGlvbn0ge3BhdGh9JyxcbiAgJ3Jldmlldy5kb25lRGVsZXRlZCc6ICdcdTVERjJ7YWN0aW9ufSB7Y291bnR9IFx1NEUyQVx1NjU4N1x1NEVGNlx1RkYwOFx1NTIyMFx1OTY2NCB7ZGVsZXRlZH0gXHU0RTJBXHU2NzJBXHU4RERGXHU4RTJBXHU2NTg3XHU0RUY2XHVGRjA5JyxcbiAgJ3Jldmlldy5hY2NlcHRlZCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydGVkJzogJ1x1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ1x1NjcyQVx1OERERlx1OEUyQScsXG4gICdyZXZpZXcuYmluYXJ5JzogJ1x1NEU4Q1x1OEZEQlx1NTIzNicsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdcdThCRTVcdTRGRUVcdTY1MzlcdTZDQTFcdTY3MDkgZGlmZiBcdTY1NzBcdTYzNkUnLFxuICAncmV2aWV3LmNoYW5nZXMnOiAne2FkZGVkfSsge2RlbGV0ZWR9LScsXG4gICd2aWV3LnNpbmdsZSc6ICdcdTUzNTVcdTY4MEYnLFxuICAndmlldy5zcGxpdCc6ICdcdTUzQ0NcdTY4MEYnLFxuICAndmlldy5iZWZvcmUnOiAnXHU1MzlGXHU2NTg3XHU0RUY2JyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnXHU2NUIwXHU2NTg3XHU0RUY2JyxcbiAgJ2NvbW1lbnQuYWRkJzogJ1x1OEJDNFx1OEJCQVx1NkI2NFx1ODg0QycsXG4gICdjb21tZW50LnNob3cnOiAnXHU2N0U1XHU3NzBCXHU4QkM0XHU4QkJBJyxcbiAgJ2NvbW1lbnQucGxhY2Vob2xkZXInOiAnXHU4QkM0XHU4QkJBXHUyMDI2XHVGRjA4Q3RybC9cdTIzMTgrRW50ZXIgXHU0RkREXHU1QjU4XHVGRjA5JyxcbiAgJ2NvbW1lbnQuc2F2ZSc6ICdcdTRGRERcdTVCNTgnLFxuICAnY29tbWVudC5jYW5jZWwnOiAnXHU1M0Q2XHU2RDg4JyxcbiAgJ2NvbW1lbnQuZGVsZXRlJzogJ1x1NTIyMFx1OTY2NCcsXG4gICdjb21tZW50LnNhdmVkJzogJ1x1NURGMlx1NEZERFx1NUI1OFx1OEJDNFx1OEJCQScsXG4gICdjb21tZW50LmZhaWxlZCc6ICdcdThCQzRcdThCQkFcdTRGRERcdTVCNThcdTU5MzFcdThEMjUnLFxuICAnc2NvcGUubGFiZWwnOiAnXHU4MzAzXHU1NkY0JyxcbiAgJ3Njb3BlLmFsbCc6ICdcdTUxNjhcdTkwRTgnLFxuICAnc2NvcGUudW5zdGFnZWQnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Njb3BlLnN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAnc2NvcGUuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdzY29wZS5icmFuY2gnOiAnXHU1MjA2XHU2NTJGJyxcbiAgJ3Njb3BlLmxhc3QtdHVybic6ICdcdTY3MDBcdTU0MEVcdTRFMDBcdThGNkUnLFxuICAncmV2aWV3Lmxhc3RUdXJuRW1wdHknOiAnXHU2NzAwXHU1NDBFXHU0RTAwXHU4RjZFXHU2Q0ExXHU2NzA5XHU4QkIwXHU1RjU1XHU1MjMwXHU2NTg3XHU0RUY2XHU0RkVFXHU2NTM5IFx1MjAxNFx1MjAxNCBcdTdFQzhcdTdBRUZcdTU0N0RcdTRFRTRcdUZGMDhiYXNoXHVGRjA5XHU2NTM5XHU2NTg3XHU0RUY2XHU0RTBEXHU0RjFBXHU4QkExXHU1MTY1XHU0RjFBXHU4QkREXHU4QkIwXHU1RjU1XHVGRjFCXHU1M0VGXHU1MjA3XHU1MjMwXHUzMDBDXHU1MTY4XHU5MEU4XHUzMDBEXHU2N0U1XHU3NzBCIGdpdCBcdTUzRDhcdTY2RjQnLFxuICAnc2NvcGUuYmFzZSc6ICdcdTU3RkFcdTdFQkZcdTUyMDZcdTY1MkYnLFxuICAnc2NvcGUuYnJhbmNoUmVhZG9ubHknOiAnXHU1MjA2XHU2NTJGXHU4MzAzXHU1NkY0XHU1M0VBXHU4QkZCXHVGRjA4XHU1QkY5XHU2QkQ0IG1lcmdlLWJhc2VcdUZGMENcdTRFMERcdTYzRDBcdTRGOUJcdTkxQzdcdTdFQjMvXHU0RTIyXHU1RjAzXHVGRjA5JyxcbiAgJ3Jldmlldy5zZWxlY3RDb21taXQnOiAnXHU0RUNFXHU1REU2XHU0RkE3XHU5MDA5XHU2MkU5XHU2M0QwXHU0RUE0XHU2N0U1XHU3NzBCIGRpZmYnLFxuICAncmV2aWV3LnNlbmRUb0FnZW50JzogJ1x1NTNEMVx1OTAwMVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VuZFRpdGxlJzogJ1x1NTNEMVx1OTAwMVx1ODg0Q1x1NTE4NVx1OEJDNFx1OEJCQVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VuZEhpbnQnOiAnXHU4QkM0XHU4QkJBXHU0RjFBXHU0RjVDXHU0RTNBXHU4QkM0XHU1QkExXHU2MzA3XHU1RjE1XHU2Q0U4XHU1MTY1XHU1RjUzXHU1MjREXHU0RjFBXHU4QkREXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjA5XHUzMDAyXHU1M0QxXHU5MDAxXHU1OTMxXHU4RDI1XHU2NUY2XHU5MDAwXHU1MzE2XHU0RTNBXHU1OTBEXHU1MjM2XHU2NTg3XHU2NzJDXHUzMDAyJyxcbiAgJ3Jldmlldy5zZW50VG9BZ2VudCc6ICdcdTVERjJcdTUzRDFcdTkwMDFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LmNvcHknOiAnXHU1OTBEXHU1MjM2XHU2NTg3XHU2NzJDJyxcbiAgJ3Jldmlldy5jb3BpZWQnOiAnXHU1REYyXHU1OTBEXHU1MjM2JyxcbiAgJ3Jldmlldy5jb3B5RmFpbGVkJzogJ1x1NTkwRFx1NTIzNlx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucmV2aWV3JzogJ1x1OEJDNFx1NUJBMScsXG4gICdyZXZpZXcucmV2aWV3aW5nJzogJ1x1OEJDNFx1NUJBMVx1NEUyRFx1MjAyNicsXG4gICdyZXZpZXcucmV2aWV3RmFpbGVkJzogJ1x1OEJDNFx1NUJBMVx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcudmVyZGljdENvcnJlY3QnOiAnXHU4ODY1XHU0RTAxXHU2QjYzXHU3ODZFIFx1MjcxMycsXG4gICdyZXZpZXcudmVyZGljdEluY29ycmVjdCc6ICdcdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OTggXHUyNzE3JyxcbiAgJ3Jldmlldy5ub0ZpbmRpbmdzJzogJ1x1NkNBMVx1NjcwOVx1NTNEMVx1NzNCMFx1OTVFRVx1OTg5OCcsXG4gICdyZXZpZXcuZmluZGluZ3MnOiAne259IFx1Njc2MVx1NTNEMVx1NzNCMCcsXG4gICdyZXZpZXcuY29uZmlkZW5jZSc6ICdcdTdGNkVcdTRGRTFcdTVFQTYge2NvbmZpZGVuY2V9JyxcbiAgJ3Jldmlldy5zdWdnZXN0aW9uJzogJ1x1NUVGQVx1OEJBRScsXG4gICdyZXZpZXcuc2VuZEZpbmRpbmdzJzogJ1x1NTNEMVx1OTAwMVx1NTNEMVx1NzNCMFx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VudEZpbmRpbmdzJzogJ1x1NURGMlx1NTNEMVx1OTAwMVx1NTNEMVx1NzNCMFx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcucmV2aWV3U2NvcGUnOiAnXHU4QkM0XHU1QkExXHU4MzAzXHU1NkY0JyxcbiAgJ3ByLnRpdGxlJzogJ1BSICN7bnVtYmVyfScsXG4gICdwci5jb21tZW50cyc6ICdQUiBcdThCQzRcdThCQkEgKHtufSknLFxuICAncHIubm9Qcic6ICdcdTY1RTBcdTUxNzNcdTgwNTQgUFInLFxuICAncHIuc2VuZENvbW1lbnRzJzogJ1x1NTNEMVx1OTAwMSBQUiBcdThCQzRcdThCQkFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAnZWRpdG9yLm9wZW5GaWxlJzogJ1x1NTcyOFx1N0YxNlx1OEY5MVx1NTY2OFx1NEUyRFx1NjI1M1x1NUYwMCcsXG4gICdlZGl0b3Iub3BlbkxpbmUnOiAnXHU1NzI4XHU3RjE2XHU4RjkxXHU1NjY4XHU0RTJEXHU2MjUzXHU1RjAwXHU4QkU1XHU4ODRDJyxcbiAgJ2VkaXRvci5mYWlsZWQnOiAnXHU2MjUzXHU1RjAwXHU1OTMxXHU4RDI1JyxcbiAgJ3JlcG8ubGFiZWwnOiAnXHU0RUQzXHU1RTkzJyxcbiAgJ3Jldmlldy5kb2NrQ29tbWVudHMnOiAnXHU4ODRDXHU1MTg1XHU4QkM0XHU4QkJBIHtufSBcdTY3NjEnLFxuICAncmV2aWV3LmRvY2tKdW1wJzogJ1x1NzBCOVx1NTFGQlx1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NjI1M1x1NUYwMFx1NUJGOVx1NUU5NFx1NTNEOFx1NjZGNCcsXG4gICdyZXZpZXcuZG9ja0hpbnQnOiAnXHU1M0QxXHU5MDAxXHU2RDg4XHU2MDZGXHU2NUY2XHU4MUVBXHU1MkE4XHU5NjQ0XHU1RTI2JyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdzZXR0aW5ncy5mb250JzogJ1x1NUI1N1x1NEY1MycsXG4gICdzZXR0aW5ncy5zaXplJzogJ1x1NUI1N1x1NTNGNycsXG4gICdjb25maWcudGl0bGUnOiAnXHU5MTREXHU3RjZFJyxcbiAgJ2ZvbnQubW9ubyc6ICdcdTdCNDlcdTVCQkRcdUZGMDhcdTlFRDhcdThCQTRcdUZGMDknLFxuICAnZm9udC5zeXN0ZW0nOiAnXHU3Q0ZCXHU3RURGXHU1QjU3XHU0RjUzJyxcbn0gYXMgY29uc3RcblxuLyoqIEVuZ2xpc2ggZGljdGlvbmFyeSwgY2hlY2tlZCBjb21wbGV0ZSBhZ2FpbnN0IHRoZSB6aCBrZXkgc2V0LiAqL1xuY29uc3QgZW46IFJlY29yZDxrZXlvZiB0eXBlb2YgemgsIHN0cmluZz4gPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnQ2hhbmdlcycsXG4gICdhY3Rpb24uYXJpYSc6ICdSZXZpZXcgd29ya3NwYWNlIGFuZCBwZXItcm91bmQgY2hhbmdlcycsXG4gICd0YWIuc2Vzc2lvbic6ICdTZXNzaW9uJyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnV29ya3NwYWNlJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3Jldmlldy5icmFuY2gnOiAnYnJhbmNoJyxcbiAgJ3Jldmlldy5kZXRhY2hlZCc6ICdkZXRhY2hlZCBIRUFEJyxcbiAgJ3Jldmlldy5ub3RSZXBvJzogJ1RoaXMgZGlyZWN0b3J5IGlzIG5vdCBhIGdpdCByZXBvc2l0b3J5JyxcbiAgJ3Jldmlldy5ub3RSZXBvSGludCc6ICdUaGUgXCJTZXNzaW9uXCIgdGFiIHN0aWxsIHNob3dzIGV2ZXJ5IHJvdW5kXFwncyBjaGFuZ2VzLicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdObyBmaWxlIGNoYW5nZXMgcmVjb3JkZWQgaW4gdGhpcyBzZXNzaW9uIHlldCcsXG4gICdyZXZpZXcuc2Vzc2lvblN0YXRzJzogJ3tyb3VuZHN9IHJvdW5kcyBcdTAwQjcge2ZpbGVzfSBmaWxlcycsXG4gICdyZXZpZXcucm91bmQnOiAnUm91bmQge3JvdW5kfScsXG4gICdyZXZpZXcuZW1wdHknOiAnTm8gdW5jb21taXR0ZWQgY2hhbmdlcyBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdGYWlsZWQgdG8gbG9hZCcsXG4gICdyZXZpZXcuYWNjZXB0JzogJ0FjY2VwdCcsXG4gICdyZXZpZXcucmV2ZXJ0JzogJ1JldmVydCcsXG4gICdyZXZpZXcuYWNjZXB0QWxsJzogJ0FjY2VwdCBhbGwnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdSZXZlcnQgYWxsJyxcbiAgJ3Jldmlldy51bnN0YWdlJzogJ1Vuc3RhZ2UnLFxuICAncmV2aWV3LnVuc3RhZ2VBbGwnOiAnVW5zdGFnZSBhbGwnLFxuICAnaHVuay5zdGFnZSc6ICdTdGFnZScsXG4gICdodW5rLnJldmVydCc6ICdSZXZlcnQnLFxuICAnaHVuay51bnN0YWdlJzogJ1Vuc3RhZ2UnLFxuICAnaHVuay5zdGFnZWQnOiAnc3RhZ2VkJyxcbiAgJ2h1bmsudW5zdGFnZWQnOiAndW5zdGFnZWQnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQgYWxsJyxcbiAgJ3Jldmlldy5jb21taXQnOiAnQ29tbWl0JyxcbiAgJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcic6ICdDb21taXQgbWVzc2FnZVx1MjAyNicsXG4gICdyZXZpZXcucHVzaCc6ICdQdXNoJyxcbiAgJ3Jldmlldy5jb25maXJtUHVzaCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHB1c2gnLFxuICAncmV2aWV3LmNvbW1pdHRlZCc6ICdDb21taXR0ZWQge3N1bW1hcnl9JyxcbiAgJ3Jldmlldy5jb21taXRGYWlsZWQnOiAnQ29tbWl0IGZhaWxlZCcsXG4gICdyZXZpZXcucHVzaGVkJzogJ1B1c2hlZCcsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdQdXNoIGZhaWxlZCcsXG4gICdyZXZpZXcuYWhlYWQnOiAne259IGFoZWFkJyxcbiAgJ3Jldmlldy5iZWhpbmQnOiAne259IGJlaGluZCcsXG4gICdyZXZpZXcuc2VjdGlvblN0YWdlZCc6ICdTdGFnZWQnLFxuICAncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LnNlY3Rpb25CcmFuY2gnOiAnQnJhbmNoIHZzIHJlbW90ZScsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdubyB1cHN0cmVhbScsXG4gICdyZXZpZXcuaGlzdG9yeSc6ICdIaXN0b3J5JyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdGaWxlcycsXG4gICdoaXN0b3J5LmxvY2FsJzogJ2xvY2FsJyxcbiAgJ2hpc3RvcnkucmVtb3RlJzogJ3JlbW90ZScsXG4gICd0aW1lLm5vdyc6ICdqdXN0IG5vdycsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IG1pbiBhZ28nLFxuICAndGltZS5ob3Vycyc6ICd7bn0gaCBhZ28nLFxuICAndGltZS5kYXlzJzogJ3tufSBkIGFnbycsXG4gICdyZXZpZXcucmVmcmVzaCc6ICdSZWZyZXNoJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdDbG9zZScsXG4gICdyZXZpZXcuYnVzeSc6ICdXb3JraW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ3thY3Rpb259IHtjb3VudH0gZmlsZXMnLFxuICAncmV2aWV3LmRvbmVPbmUnOiAne2FjdGlvbn0ge3BhdGh9JyxcbiAgJ3Jldmlldy5kb25lRGVsZXRlZCc6ICd7YWN0aW9ufSB7Y291bnR9IGZpbGVzICh7ZGVsZXRlZH0gdW50cmFja2VkIGRlbGV0ZWQpJyxcbiAgJ3Jldmlldy5hY2NlcHRlZCc6ICdBY2NlcHRlZCcsXG4gICdyZXZpZXcucmV2ZXJ0ZWQnOiAnUmV2ZXJ0ZWQnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICd1bnRyYWNrZWQnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdiaW5hcnknLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnTm8gZGlmZiBkYXRhIGZvciB0aGlzIGNoYW5nZScsXG4gICdyZXZpZXcuY2hhbmdlcyc6ICd7YWRkZWR9KyB7ZGVsZXRlZH0tJyxcbiAgJ3ZpZXcuc2luZ2xlJzogJ1NpbmdsZScsXG4gICd2aWV3LnNwbGl0JzogJ1NwbGl0JyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ0JlZm9yZScsXG4gICd2aWV3LmFmdGVyJzogJ0FmdGVyJyxcbiAgJ2NvbW1lbnQuYWRkJzogJ0NvbW1lbnQgb24gdGhpcyBsaW5lJyxcbiAgJ2NvbW1lbnQuc2hvdyc6ICdWaWV3IGNvbW1lbnRzJyxcbiAgJ2NvbW1lbnQucGxhY2Vob2xkZXInOiAnQ29tbWVudFx1MjAyNiAoQ3RybC9cdTIzMTgrRW50ZXIgdG8gc2F2ZSknLFxuICAnY29tbWVudC5zYXZlJzogJ1NhdmUnLFxuICAnY29tbWVudC5jYW5jZWwnOiAnQ2FuY2VsJyxcbiAgJ2NvbW1lbnQuZGVsZXRlJzogJ0RlbGV0ZScsXG4gICdjb21tZW50LnNhdmVkJzogJ0NvbW1lbnQgc2F2ZWQnLFxuICAnY29tbWVudC5mYWlsZWQnOiAnRmFpbGVkIHRvIHNhdmUgY29tbWVudCcsXG4gICdzY29wZS5sYWJlbCc6ICdTY29wZScsXG4gICdzY29wZS5hbGwnOiAnQWxsJyxcbiAgJ3Njb3BlLnVuc3RhZ2VkJzogJ1Vuc3RhZ2VkJyxcbiAgJ3Njb3BlLnN0YWdlZCc6ICdTdGFnZWQnLFxuICAnc2NvcGUuY29tbWl0JzogJ0NvbW1pdCcsXG4gICdzY29wZS5icmFuY2gnOiAnQnJhbmNoJyxcbiAgJ3Njb3BlLmxhc3QtdHVybic6ICdMYXN0IHR1cm4nLFxuICAncmV2aWV3Lmxhc3RUdXJuRW1wdHknOiAnTm8gZmlsZSBjaGFuZ2VzIHJlY29yZGVkIGZvciB0aGUgbGFzdCB0dXJuIFx1MjAxNCB0ZXJtaW5hbCBjb21tYW5kcyAoYmFzaCkgdGhhdCBlZGl0IGZpbGVzIGFyZSBub3QgdHJhY2tlZCBpbiB0aGUgc2Vzc2lvbiBsb2c7IHN3aXRjaCB0byBcIkFsbFwiIHRvIHNlZSBnaXQgY2hhbmdlcycsXG4gICdzY29wZS5iYXNlJzogJ0Jhc2UgYnJhbmNoJyxcbiAgJ3Njb3BlLmJyYW5jaFJlYWRvbmx5JzogJ0JyYW5jaCBzY29wZSBpcyByZWFkLW9ubHkgKG1lcmdlLWJhc2UgZGlmZjsgbm8gYWNjZXB0L3JldmVydCknLFxuICAncmV2aWV3LnNlbGVjdENvbW1pdCc6ICdTZWxlY3QgYSBjb21taXQgZnJvbSB0aGUgbGVmdCB0byB2aWV3IGl0cyBkaWZmJyxcbiAgJ3Jldmlldy5zZW5kVG9BZ2VudCc6ICdTZW5kIHRvIGFnZW50JyxcbiAgJ3Jldmlldy5zZW5kVGl0bGUnOiAnU2VuZCBpbmxpbmUgY29tbWVudHMgdG8gdGhlIGFnZW50JyxcbiAgJ3Jldmlldy5zZW5kSGludCc6ICdDb21tZW50cyBhcmUgaW5qZWN0ZWQgaW50byB0aGUgY3VycmVudCBzZXNzaW9uIGFzIHJldmlldyBndWlkYW5jZSAoQWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzKS4gRmFsbHMgYmFjayB0byBjb3B5YWJsZSB0ZXh0IGlmIHNlbmRpbmcgZmFpbHMuJyxcbiAgJ3Jldmlldy5zZW50VG9BZ2VudCc6ICdTZW50IHRvIGFnZW50JyxcbiAgJ3Jldmlldy5jb3B5JzogJ0NvcHkgdGV4dCcsXG4gICdyZXZpZXcuY29waWVkJzogJ0NvcGllZCcsXG4gICdyZXZpZXcuY29weUZhaWxlZCc6ICdDb3B5IGZhaWxlZCcsXG4gICdyZXZpZXcucmV2aWV3JzogJ1JldmlldycsXG4gICdyZXZpZXcucmV2aWV3aW5nJzogJ1Jldmlld2luZ1x1MjAyNicsXG4gICdyZXZpZXcucmV2aWV3RmFpbGVkJzogJ1JldmlldyBmYWlsZWQnLFxuICAncmV2aWV3LnZlcmRpY3RDb3JyZWN0JzogJ1BhdGNoIGlzIGNvcnJlY3QgXHUyNzEzJyxcbiAgJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JzogJ1BhdGNoIG5lZWRzIHdvcmsgXHUyNzE3JyxcbiAgJ3Jldmlldy5ub0ZpbmRpbmdzJzogJ05vIGlzc3VlcyBmb3VuZCcsXG4gICdyZXZpZXcuZmluZGluZ3MnOiAne259IGZpbmRpbmdzJyxcbiAgJ3Jldmlldy5jb25maWRlbmNlJzogJ2NvbmZpZGVuY2Uge2NvbmZpZGVuY2V9JyxcbiAgJ3Jldmlldy5zdWdnZXN0aW9uJzogJ1N1Z2dlc3Rpb24nLFxuICAncmV2aWV3LnNlbmRGaW5kaW5ncyc6ICdTZW5kIGZpbmRpbmdzIHRvIGFnZW50JyxcbiAgJ3Jldmlldy5zZW50RmluZGluZ3MnOiAnRmluZGluZ3Mgc2VudCB0byBhZ2VudCcsXG4gICdyZXZpZXcucmV2aWV3U2NvcGUnOiAnUmV2aWV3IHNjb3BlJyxcbiAgJ3ByLnRpdGxlJzogJ1BSICN7bnVtYmVyfScsXG4gICdwci5jb21tZW50cyc6ICdQUiBjb21tZW50cyAoe259KScsXG4gICdwci5ub1ByJzogJ05vIGFzc29jaWF0ZWQgUFInLFxuICAncHIuc2VuZENvbW1lbnRzJzogJ1NlbmQgUFIgY29tbWVudHMgdG8gYWdlbnQnLFxuICAnZWRpdG9yLm9wZW5GaWxlJzogJ09wZW4gaW4gZWRpdG9yJyxcbiAgJ2VkaXRvci5vcGVuTGluZSc6ICdPcGVuIHRoaXMgbGluZSBpbiBlZGl0b3InLFxuICAnZWRpdG9yLmZhaWxlZCc6ICdGYWlsZWQgdG8gb3BlbicsXG4gICdyZXBvLmxhYmVsJzogJ1JlcG8nLFxuICAncmV2aWV3LmRvY2tDb21tZW50cyc6ICd7bn0gaW5saW5lIGNvbW1lbnRzJyxcbiAgJ3Jldmlldy5kb2NrSnVtcCc6ICdPcGVuIHRoZSBtYXRjaGluZyBjaGFuZ2UgaW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuZG9ja0hpbnQnOiAnQXV0by1jYXJyaWVkIHdpdGggeW91ciBuZXh0IG1lc3NhZ2UnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnQ2hhbmdlcycsXG4gICdzZXR0aW5ncy5mb250JzogJ0ZvbnQnLFxuICAnc2V0dGluZ3Muc2l6ZSc6ICdGb250IHNpemUnLFxuICAnY29uZmlnLnRpdGxlJzogJ0NvbmZpZ3VyYXRpb24nLFxuICAnZm9udC5tb25vJzogJ01vbm9zcGFjZSAoZGVmYXVsdCknLFxuICAnZm9udC5zeXN0ZW0nOiAnU3lzdGVtIGZvbnQnLFxufVxuXG50eXBlIERpZmZSZXZpZXdBY3Rpb25Qcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+XG50eXBlIERpZmZSZXZpZXdPdmVybGF5UHJvcHMgPSBQcm9wc1J1bnRpbWU8J3NoZWxsLm92ZXJsYXknPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYgeyBzZXNzaW9uczogSVNlc3Npb25zIH1cblxuLyoqIERpZmYgaWNvbiAobHVjaWRlIGZpbGUtZGlmZikuICovXG5mdW5jdGlvbiBJY29uRGlmZigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTUgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjdaXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOSAxMGg2XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNMTIgN3Y2XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOSAxN2g2XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uWCgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTggNiA2IDE4XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJtNiA2IDEyIDEyXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ29tbWVudCgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMjEgMTVhMiAyIDAgMCAxLTIgMkg3bC00IDRWNWEyIDIgMCAwIDEgMi0yaDE0YTIgMiAwIDAgMSAyIDJ6XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ2hldnJvbkRvd24oKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjEyXCIgaGVpZ2h0PVwiMTJcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwibTYgOSA2IDYgNi02XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ2hlY2soKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjEyXCIgaGVpZ2h0PVwiMTJcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjIuNVwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMjAgNiA5IDE3bC01LTVcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbnR5cGUgVmlld01vZGUgPSAnc2luZ2xlJyB8ICdzcGxpdCdcblxuLyoqIFx1NTM1NVx1NjgwRiAvIFx1NTNDQ1x1NjgwRiBzZWdtZW50ZWQgdG9nZ2xlIChwZXJzaXN0ZWQgYWNyb3NzIG9wZW5zKS4gKi9cbmZ1bmN0aW9uIERpZmZWaWV3VG9nZ2xlKHsgdmlldywgb25DaGFuZ2UsIHQgfTogeyB2aWV3OiBWaWV3TW9kZTsgb25DaGFuZ2U6ICh2OiBWaWV3TW9kZSkgPT4gdm9pZDsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdmlldy10b2dnbGVcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPXt0KCd2aWV3LnNpbmdsZScpfT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRzZHItdmlldy1idG4ke3ZpZXcgPT09ICdzaW5nbGUnID8gJyBkc2RyLXZpZXctYnRuLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICBhcmlhLXByZXNzZWQ9e3ZpZXcgPT09ICdzaW5nbGUnfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgnc2luZ2xlJyl9XG4gICAgICA+XG4gICAgICAgIHt0KCd2aWV3LnNpbmdsZScpfVxuICAgICAgPC9idXR0b24+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXZpZXctYnRuJHt2aWV3ID09PSAnc3BsaXQnID8gJyBkc2RyLXZpZXctYnRuLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICBhcmlhLXByZXNzZWQ9e3ZpZXcgPT09ICdzcGxpdCd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKCdzcGxpdCcpfVxuICAgICAgPlxuICAgICAgICB7dCgndmlldy5zcGxpdCcpfVxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFR3by1jb2x1bW4gc2lkZS1ieS1zaWRlIGRpZmYgYm9keSAob2xkIGxlZnQsIG5ldyByaWdodCwgbGluZSBudW1iZXJzIGFsaWduZWQpLiAqL1xuZnVuY3Rpb24gU3BsaXREaWZmKHsgYmxvY2tzLCBiZWZvcmVMYWJlbCwgYWZ0ZXJMYWJlbCB9OiB7IGJsb2NrczogU3BsaXRCbG9ja1tdOyBiZWZvcmVMYWJlbDogc3RyaW5nOyBhZnRlckxhYmVsOiBzdHJpbmcgfSkge1xuICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICA8c3Bhbj57YmVmb3JlTGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICA8c3Bhbj57YWZ0ZXJMYWJlbH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7YmxvY2tzLm1hcCgoYmxvY2ssIGJpKSA9PiAoXG4gICAgICAgICAgPGRpdiBrZXk9e2JpfT5cbiAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtyaX0gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1yb3dcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5sZWZ0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1kZWwnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPntyb3cubGVmdE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LmxlZnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LnJpZ2h0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1hZGQnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPntyb3cucmlnaHROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5yaWdodH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFBlci1odW5rIGFjdGlvbiBiYXIgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkgZm9yIHdvcmtzcGFjZSBkaWZmcy4gKi9cbmZ1bmN0aW9uIEh1bmtUb29sYmFyKHtcbiAgaHVuayxcbiAgYnVzeSxcbiAgb25BY3Rpb24sXG4gIHQsXG59OiB7XG4gIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmsgfCB1bmRlZmluZWRcbiAgYnVzeTogYm9vbGVhblxuICBvbkFjdGlvbjogKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuaykgPT4gdm9pZFxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgaWYgKCFodW5rKSByZXR1cm4gbnVsbFxuICBjb25zdCBzdGFnZWQgPSBodW5rLmxheWVyID09PSAnc3RhZ2VkJ1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1odW5rLWJhclwiPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1odW5rLWxheWVyXCI+e3N0YWdlZCA/IHQoJ2h1bmsuc3RhZ2VkJykgOiB0KCdodW5rLnVuc3RhZ2VkJyl9PC9zcGFuPlxuICAgICAge3N0YWdlZCA/IChcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25BY3Rpb24oJ3Vuc3RhZ2UnLCBodW5rKX0+XG4gICAgICAgICAge3QoJ2h1bmsudW5zdGFnZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25BY3Rpb24oJ2FjY2VwdCcsIGh1bmspfT5cbiAgICAgICAgICB7dCgnaHVuay5zdGFnZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICl9XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25BY3Rpb24oJ3JldmVydCcsIGh1bmspfT5cbiAgICAgICAge3QoJ2h1bmsucmV2ZXJ0Jyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVW5pZmllZCBkaWZmIHJvd3Mgd2l0aCBvbGQvbmV3IGxpbmUgbnVtYmVycyB0cmFja2VkIHRocm91Z2ggaHVua3MuICovXG5mdW5jdGlvbiB1bmlmaWVkUm93c1dpdGhMaW5lcyhyb3dzOiBEaWZmUm93W10sIG9sZFN0YXJ0OiBudW1iZXIsIG5ld1N0YXJ0OiBudW1iZXIpOiB7IHJvdzogRGlmZlJvdzsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9W10ge1xuICBsZXQgb2xkTGluZSA9IG9sZFN0YXJ0XG4gIGxldCBuZXdMaW5lID0gbmV3U3RhcnRcbiAgcmV0dXJuIHJvd3MubWFwKChyb3cpID0+IHtcbiAgICBpZiAocm93LmtpbmQgPT09ICdjdHgnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbmV3TGluZSsrIH1cbiAgICBpZiAocm93LmtpbmQgPT09ICdhZGQnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG51bGwsIG5ld0xpbmU6IG5ld0xpbmUrKyB9XG4gICAgaWYgKHJvdy5raW5kID09PSAnZGVsJykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBvbGRMaW5lKyssIG5ld0xpbmU6IG51bGwgfVxuICAgIHJldHVybiB7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbnVsbCB9XG4gIH0pXG59XG5cbi8qKiBNYXRjaCBhIGNvbW1lbnQgYWdhaW5zdCBhIHJvdydzIGFuY2hvcnMgKGJvdGggbXVzdCBhZ3JlZSB3aGVuIHNldCkuICovXG5mdW5jdGlvbiBjb21tZW50TWF0Y2hlcyhjb21tZW50OiBSZXZpZXdDb21tZW50LCBvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKTogYm9vbGVhbiB7XG4gIGlmIChjb21tZW50LmxpbmVOZXcgIT09IG51bGwgJiYgY29tbWVudC5saW5lTmV3ICE9PSBuZXdMaW5lKSByZXR1cm4gZmFsc2VcbiAgaWYgKGNvbW1lbnQubGluZU9sZCAhPT0gbnVsbCAmJiBjb21tZW50LmxpbmVPbGQgIT09IG9sZExpbmUpIHJldHVybiBmYWxzZVxuICByZXR1cm4gdHJ1ZVxufVxuXG4vKiogSG92ZXItdG8tY29tbWVudCBhZmZvcmRhbmNlICsgY29tbWVudCBtYXJrZXIgZm9yIG9uZSBkaWZmIGxpbmUuICovXG5mdW5jdGlvbiBDb21tZW50TGluZSh7XG4gIGNvdW50LFxuICBvcGVuLFxuICBvbk9wZW4sXG4gIG9uVG9nZ2xlLFxuICB0LFxufToge1xuICBjb3VudDogbnVtYmVyXG4gIG9wZW46IGJvb2xlYW5cbiAgb25PcGVuOiAoKSA9PiB2b2lkXG4gIG9uVG9nZ2xlOiAoKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1jb21tZW50LWFkZCR7Y291bnQgPiAwID8gJyBkc2RyLWNvbW1lbnQtaGFzJyA6ICcnfWB9XG4gICAgICB0aXRsZT17Y291bnQgPiAwID8gdCgnY29tbWVudC5zaG93JykgOiB0KCdjb21tZW50LmFkZCcpfVxuICAgICAgYXJpYS1sYWJlbD17Y291bnQgPiAwID8gdCgnY29tbWVudC5zaG93JykgOiB0KCdjb21tZW50LmFkZCcpfVxuICAgICAgb25DbGljaz17Y291bnQgPiAwID8gb25Ub2dnbGUgOiBvbk9wZW59XG4gICAgPlxuICAgICAge2NvdW50ID4gMCA/IGNvdW50IDogJysnfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8qKiBUaGUgaW5saW5lIGNvbW1lbnQgZWRpdG9yLCByZW5kZXJlZCBhcyBpdHMgb3duIHJvdy4gKi9cbmZ1bmN0aW9uIENvbW1lbnRFZGl0b3Ioe1xuICB0ZXh0LFxuICBvblRleHQsXG4gIG9uU2F2ZSxcbiAgb25DYW5jZWwsXG4gIGJ1c3ksXG4gIHQsXG59OiB7XG4gIHRleHQ6IHN0cmluZ1xuICBvblRleHQ6ICh2OiBzdHJpbmcpID0+IHZvaWRcbiAgb25TYXZlOiAoKSA9PiB2b2lkXG4gIG9uQ2FuY2VsOiAoKSA9PiB2b2lkXG4gIGJ1c3k6IGJvb2xlYW5cbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtZWRpdG9yXCI+XG4gICAgICA8dGV4dGFyZWFcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWlucHV0XCJcbiAgICAgICAgdmFsdWU9e3RleHR9XG4gICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICByb3dzPXsyfVxuICAgICAgICBwbGFjZWhvbGRlcj17dCgnY29tbWVudC5wbGFjZWhvbGRlcicpfVxuICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblRleHQoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgb25DYW5jZWwoKVxuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicgJiYgKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSkpIG9uU2F2ZSgpXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIXRleHQudHJpbSgpfSBvbkNsaWNrPXtvblNhdmV9PlxuICAgICAgICAgIHt0KCdjb21tZW50LnNhdmUnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9e29uQ2FuY2VsfT5cbiAgICAgICAgICB7dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVW5pZmllZCBkaWZmIHdpdGggcGVyLWh1bmsgYWN0aW9uIGJhcnMgYW5kIGlubGluZSBjb21tZW50cyAod29ya3NwYWNlIGZpbGVzKS4gKi9cbmZ1bmN0aW9uIFVuaWZpZWREaWZmKHtcbiAgZGlmZixcbiAgaHVua3MsXG4gIGJ1c3ksXG4gIG9uSHVua0FjdGlvbixcbiAgdCxcbiAgY29tbWVudHMsXG4gIGNvbW1lbnRFZGl0b3IsXG4gIGNvbW1lbnRUZXh0LFxuICBvbkNvbW1lbnRUZXh0LFxuICBvbk9wZW5Db21tZW50LFxuICBvblNhdmVDb21tZW50LFxuICBvbkNhbmNlbENvbW1lbnQsXG4gIGNvbW1lbnRQb3BvdmVyLFxuICBvblRvZ2dsZVBvcG92ZXIsXG4gIG9uRGVsZXRlQ29tbWVudCxcbiAgcmVhZE9ubHksXG4gIHBhdGgsXG4gIHJldmlld0ZpbmRpbmdzLFxuICBvbk9wZW5MaW5lLFxuICBqdW1wTGluZSxcbn06IHtcbiAgZGlmZjogc3RyaW5nXG4gIGh1bmtzOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rW11cbiAgYnVzeTogYm9vbGVhblxuICBvbkh1bmtBY3Rpb246IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmspID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG4gIGNvbW1lbnRzPzogUmV2aWV3Q29tbWVudFtdXG4gIGNvbW1lbnRFZGl0b3I/OiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSB8IG51bGxcbiAgY29tbWVudFRleHQ/OiBzdHJpbmdcbiAgb25Db21tZW50VGV4dD86ICh2OiBzdHJpbmcpID0+IHZvaWRcbiAgb25PcGVuQ29tbWVudD86IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB2b2lkXG4gIG9uU2F2ZUNvbW1lbnQ/OiAoKSA9PiB2b2lkXG4gIG9uQ2FuY2VsQ29tbWVudD86ICgpID0+IHZvaWRcbiAgY29tbWVudFBvcG92ZXI/OiBzdHJpbmcgfCBudWxsXG4gIG9uVG9nZ2xlUG9wb3Zlcj86IChrZXk6IHN0cmluZykgPT4gdm9pZFxuICBvbkRlbGV0ZUNvbW1lbnQ/OiAoaWQ6IHN0cmluZykgPT4gdm9pZFxuICAvKiogSGlkZSBwZXItaHVuayBhY3Rpb24gYmFycyAoYnJhbmNoIHNjb3BlIGlzIGEgcmVhZC1vbmx5IGRpZmYpLiAqL1xuICByZWFkT25seT86IGJvb2xlYW5cbiAgLyoqIFJlcG8tcmVsYXRpdmUgZmlsZSBwYXRoIChmb3Igb3Blbi1pbi1lZGl0b3IgYW5kIG1hcmtlcnMpLiAqL1xuICBwYXRoPzogc3RyaW5nXG4gIC8qKiBBSS1yZXZpZXcgZmluZGluZ3MgdG8gbWFyayBvbiBtYXRjaGluZyBsaW5lcy4gKi9cbiAgcmV2aWV3RmluZGluZ3M/OiBSZXZpZXdGaW5kaW5nW11cbiAgLyoqIE9wZW4gdGhlIGZpbGUgYXQgYSBsaW5lIGluIHRoZSB1c2VyJ3MgZWRpdG9yLiAqL1xuICBvbk9wZW5MaW5lPzogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiB2b2lkXG4gIC8qKiBUZW1wb3JhcnkgbGluZSBoaWdobGlnaHQgKGUuZy4ganVtcCBmcm9tIGEgUFIgY29tbWVudCkuICovXG4gIGp1bXBMaW5lPzogbnVtYmVyIHwgbnVsbFxufSkge1xuICBjb25zdCBibG9ja3MgPSBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICBsZXQgaHVua0luZGV4ID0gMFxuICBjb25zdCBlZGl0aW5nS2V5ID0gY29tbWVudEVkaXRvciA/IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gIDogbnVsbFxuICBjb25zdCBmaW5kaW5nc0ZvciA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKTogUmV2aWV3RmluZGluZ1tdID0+IHtcbiAgICBpZiAoIXBhdGggfHwgIXJldmlld0ZpbmRpbmdzIHx8IHJldmlld0ZpbmRpbmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gICAgcmV0dXJuIHJldmlld0ZpbmRpbmdzLmZpbHRlcigoZikgPT4ge1xuICAgICAgaWYgKGYuZmlsZSAhPT0gcGF0aCkgcmV0dXJuIGZhbHNlXG4gICAgICBpZiAobmV3TGluZSAhPT0gbnVsbCkgcmV0dXJuIG5ld0xpbmUgPj0gZi5saW5lU3RhcnQgJiYgbmV3TGluZSA8PSBmLmxpbmVFbmRcbiAgICAgIHJldHVybiBvbGRMaW5lICE9PSBudWxsICYmIG9sZExpbmUgPj0gZi5saW5lU3RhcnQgJiYgb2xkTGluZSA8PSBmLmxpbmVFbmRcbiAgICB9KVxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IHtcbiAgICAgICAgICBjb25zdCBpc0h1bmsgPSBibG9jay5oZWFkPy5raW5kID09PSAnaHVuaydcbiAgICAgICAgICBjb25zdCBodW5rID0gaXNIdW5rID8gaHVua3NbaHVua0luZGV4KytdIDogdW5kZWZpbmVkXG4gICAgICAgICAgY29uc3Qgc3RhcnRzID0gYmxvY2suaGVhZD8ua2luZCA9PT0gJ2h1bmsnID8gaHVua1N0YXJ0cyhibG9jay5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgICAgIGNvbnN0IHJvd3MgPSBpc0h1bmsgPyB1bmlmaWVkUm93c1dpdGhMaW5lcyhibG9jay5yb3dzLCBzdGFydHMub2xkU3RhcnQsIHN0YXJ0cy5uZXdTdGFydCkgOiBbXVxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgIHtpc0h1bmsgJiYgIXJlYWRPbmx5ID8gPEh1bmtUb29sYmFyIGh1bms9e2h1bmt9IGJ1c3k9e2J1c3l9IG9uQWN0aW9uPXtvbkh1bmtBY3Rpb259IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtibG9jay5oZWFkLmtpbmR9YH0+e2Jsb2NrLmhlYWQudGV4dCB8fCAnICd9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAge2lzSHVua1xuICAgICAgICAgICAgICAgID8gcm93cy5tYXAoKHsgcm93LCBvbGRMaW5lLCBuZXdMaW5lIH0sIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke29sZExpbmUgPz8gJ28nfToke25ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93Q29tbWVudHMgPSBjb21tZW50cz8uZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBvbGRMaW5lLCBuZXdMaW5lKSkgPz8gW11cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ3MgPSBmaW5kaW5nc0ZvcihvbGRMaW5lLCBuZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlZGl0aW5nID0gZWRpdGluZ0tleSA9PT0ga2V5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3dBY3Rpb25zID0gcm93LmtpbmQgPT09ICdjdHgnIHx8IHJvdy5raW5kID09PSAnYWRkJyB8fCByb3cua2luZCA9PT0gJ2RlbCdcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ0NscyA9IGZpbmRpbmdzLmxlbmd0aCA+IDAgPyBgIGRzZHItbGluZS1maW5kaW5nIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wZWQgPSBqdW1wTGluZSAhPSBudWxsICYmIChuZXdMaW5lID09PSBqdW1wTGluZSB8fCAobmV3TGluZSA9PT0gbnVsbCAmJiBvbGRMaW5lID09PSBqdW1wTGluZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17cml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9JHtyb3dDb21tZW50cy5sZW5ndGggPiAwID8gJyBkc2RyLWxpbmUtY29tbWVudGVkJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1saW5lLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e25ld0xpbmUgPz8gb2xkTGluZSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS1udW1cIj57bmV3TGluZSA/PyBvbGRMaW5lID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLXRleHRcIj57cm93LnRleHQgfHwgJyAnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLXRhZyBkc2RyLWZpbmRpbmctJHtmaW5kaW5nc1swXS5wcmlvcml0eX1gfSB0aXRsZT17ZmluZGluZ3NbMF0udGl0bGV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nc1swXS5wcmlvcml0eX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3MubGVuZ3RoID4gMSA/IGBcdTAwRDcke2ZpbmRpbmdzLmxlbmd0aH1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3BhdGggJiYgb25PcGVuTGluZSAmJiAobmV3TGluZSA/PyBvbGRMaW5lKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItb3BlbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbk9wZW5MaW5lKHBhdGgsIG5ld0xpbmUgPz8gb2xkTGluZSA/PyAxKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50PXtyb3dDb21tZW50cy5sZW5ndGh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW49e2NvbW1lbnRQb3BvdmVyID09PSBrZXl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT3Blbj17KCkgPT4gb25PcGVuQ29tbWVudD8uKG9sZExpbmUsIG5ld0xpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gb25Ub2dnbGVQb3BvdmVyPy4oa2V5KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgJiYgcm93Q29tbWVudHMubGVuZ3RoID4gMCAmJiBjb21tZW50UG9wb3ZlciA9PT0ga2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1wb3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93Q29tbWVudHMubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17Y29tbWVudC5pZH0gY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtdGV4dFwiPntjb21tZW50LnRleHR9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Y29tbWVudC5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25EZWxldGVDb21tZW50Py4oY29tbWVudC5pZCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuZGVsZXRlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZWRpdGluZyA/IDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0ID8/ICcnfSBvblRleHQ9e29uQ29tbWVudFRleHQgPz8gKCgpID0+IHt9KX0gb25TYXZlPXtvblNhdmVDb21tZW50ID8/ICgoKSA9PiB7fSl9IG9uQ2FuY2VsPXtvbkNhbmNlbENvbW1lbnQgPz8gKCgpID0+IHt9KX0gYnVzeT17YnVzeX0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgOiBibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICA8L3ByZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbi8qKiBEcmFnIGhhbmRsZSBmb3IgcmVzaXppbmcgdGhlIHBhbmVsIChlYXN0IC8gc291dGggLyBzb3V0aC1lYXN0KS4gKi9cbmZ1bmN0aW9uIFJlc2l6ZUhhbmRsZSh7IG1vZGUsIG9uUmVzaXplIH06IHsgbW9kZTogJ2UnIHwgJ3MnIHwgJ3NlJzsgb25SZXNpemU6IChkeDogbnVtYmVyLCBkeTogbnVtYmVyKSA9PiB2b2lkIH0pIHtcbiAgY29uc3QgbGFzdCA9IHVzZVJlZjx7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsPihudWxsKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YGRzZHItcmVzaXplIGRzZHItcmVzaXplLSR7bW9kZX1gfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFsYXN0LmN1cnJlbnQpIHJldHVyblxuICAgICAgICBjb25zdCBkeCA9IGV2ZW50LmNsaWVudFggLSBsYXN0LmN1cnJlbnQueFxuICAgICAgICBjb25zdCBkeSA9IGV2ZW50LmNsaWVudFkgLSBsYXN0LmN1cnJlbnQueVxuICAgICAgICBsYXN0LmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfVxuICAgICAgICBpZiAoZHggIT09IDAgfHwgZHkgIT09IDApIG9uUmVzaXplKGR4LCBkeSlcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJVcD17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlckNhbmNlbD17KCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSBudWxsXG4gICAgICB9fVxuICAgIC8+XG4gIClcbn1cblxuLyoqIFN0YXR1cyBjaGlwIGNvbG9yIGNsYXNzIGZvciBhIHdvcmtzcGFjZSBjaGFuZ2UuICovXG5mdW5jdGlvbiBjaGlwQ2xhc3Moc3RhdHVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBzID0gc3RhdHVzLnJlcGxhY2UoL1xccy9nLCAnJylcbiAgaWYgKHMuaW5jbHVkZXMoJz8/JykpIHJldHVybiAnZHNkci1jaGlwLXUnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ0EnKSB8fCBzLmluY2x1ZGVzKCdBJykpIHJldHVybiAnZHNkci1jaGlwLWEnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ0QnKSB8fCBzLmluY2x1ZGVzKCdEJykpIHJldHVybiAnZHNkci1jaGlwLWQnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ1InKSB8fCBzLmluY2x1ZGVzKCdSJykpIHJldHVybiAnZHNkci1jaGlwLXInXG4gIHJldHVybiAnZHNkci1jaGlwLW0nXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRTdGF0dXMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFN0YXR1c1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1NUQVRVU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYHN0YXR1cyByZXF1ZXN0IGZhaWxlZDogJHtyZXMuc3RhdHVzfWApXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKSkgYXMgU3RhdHVzUmVzcG9uc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXBwbHlDaGFuZ2VzKGN3ZDogc3RyaW5nLCBhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPEFwcGx5UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQVBQTFlfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIGFjdGlvbiwgcGF0aCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEFwcGx5UmVzcG9uc2Vcbn1cblxuLyoqIEFwcGx5IG9uZSBodW5rIG9mIG9uZSBmaWxlIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpLiAqL1xuYXN5bmMgZnVuY3Rpb24gYXBwbHlIdW5rKGN3ZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogc3RyaW5nKTogUHJvbWlzZTxBcHBseUh1bmtSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9IVU5LX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBwYXRoLCBhY3Rpb24sIGh1bmsgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBBcHBseUh1bmtSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5HaXRBY3Rpb24oY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2NvbW1pdCcgfCAncHVzaCcsIG1lc3NhZ2U/OiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlc3BvbnNlPiB7XG4gIGNvbnN0IHVybCA9IGFjdGlvbiA9PT0gJ2NvbW1pdCcgPyBDT01NSVRfVVJMIDogUFVTSF9VUkxcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYWN0aW9uID09PSAnY29tbWl0JyA/IHsgY3dkLCBtZXNzYWdlIH0gOiB7IGN3ZCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEdpdFJlc3BvbnNlXG59XG5cbi8qKiBMb2NhbCAodW5wdXNoZWQpIGNvbW1pdHMgYWhlYWQgb2YgdGhlIHVwc3RyZWFtLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEhpc3RvcnkoY3dkOiBzdHJpbmcpOiBQcm9taXNlPEhpc3RvcnlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtISVNUT1JZX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWl0czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBIaXN0b3J5UmVzcG9uc2Vcbn1cblxuLyoqIE9uZSBjb21taXQncyB1bmlmaWVkIGRpZmYuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWl0RGlmZihjd2Q6IHN0cmluZywgaGFzaDogc3RyaW5nKTogUHJvbWlzZTxDb21taXREaWZmUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUlUX0RJRkZfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX0maGFzaD0ke2VuY29kZVVSSUNvbXBvbmVudChoYXNoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBkaWZmOiAnJywgZmlsZXM6IFtdLCBhZGRlZDogMCwgZGVsZXRlZDogMCwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIENvbW1pdERpZmZSZXNwb25zZVxufVxuXG4vKiogSW5saW5lIHJldmlldyBjb21tZW50cyBmb3IgdGhlIHdvcmtzcGFjZSAocmVwby1zY29wZWQpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZENvbW1lbnRzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxSZXZpZXdDb21tZW50W10+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUVOVFNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21tZW50czogW10gfSkpKSBhcyBDb21tZW50c1Jlc3BvbnNlXG4gIHJldHVybiBkYXRhLm9rID8gZGF0YS5jb21tZW50cyA6IFtdXG59XG5cbi8qKiBSZXBsYWNlIHRoZSB3aG9sZSBjb21tZW50IGxpc3QgKHNpbmdsZS11c2VyIHJlcGxhY2Ugc2VtYW50aWNzKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDb21tZW50cyhjd2Q6IHN0cmluZywgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChDT01NRU5UU19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgY29tbWVudHMgfSksXG4gIH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UgfSkpKSBhcyBDb21tZW50c1Jlc3BvbnNlXG4gIHJldHVybiBkYXRhLm9rID09PSB0cnVlXG59XG5cbi8qKiBMb2NhbCBicmFuY2ggbmFtZXMgKGZvciB0aGUgQnJhbmNoIHJldmlldyBzY29wZSkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQnJhbmNoZXMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0JSQU5DSEVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgYnJhbmNoZXM6IFtdIH0pKSkgYXMgeyBvazogYm9vbGVhbjsgYnJhbmNoZXM6IHN0cmluZ1tdIH1cbiAgcmV0dXJuIGRhdGEub2sgPyBkYXRhLmJyYW5jaGVzIDogW11cbn1cblxuLyoqIFJ1biBhbiBBSSByZXZpZXcgb3ZlciB0aGUgZ2l2ZW4gc2NvcGUuICovXG5hc3luYyBmdW5jdGlvbiBydW5SZXZpZXcoY3dkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCwgc2NvcGU6ICd1bmNvbW1pdHRlZCcgfCAnYnJhbmNoJyB8ICdjb21taXQnLCBiYXNlPzogc3RyaW5nLCBjb21taXRIYXNoPzogc3RyaW5nKTogUHJvbWlzZTxSZXZpZXdSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChSRVZJRVdfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHNlc3Npb25JZDogc2Vzc2lvbklkID8/IHVuZGVmaW5lZCwgc2NvcGUsIGJhc2UsIGNvbW1pdEhhc2ggfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGZpbmRpbmdzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFJldmlld1Jlc3BvbnNlXG59XG5cbi8qKiBDdXJyZW50IGJyYW5jaCdzIEdpdEh1YiBQUiBjb250ZXh0IChkZWdyYWRlcyBncmFjZWZ1bGx5IHdpdGhvdXQgZ2gpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZFByKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxQclJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1BSX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWVudHM6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUHJSZXNwb25zZVxufVxuXG4vKiogR2l0IHJlcG9zIHVuZGVyIGEgd29ya3NwYWNlIChtdWx0aS1yZXBvIHNlbGVjdG9yKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRSZXBvcyhjd2Q6IHN0cmluZyk6IFByb21pc2U8UmVwb3NSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtSRVBPU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIHJlcG9zOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFJlcG9zUmVzcG9uc2Vcbn1cblxuLyoqIE9wZW4gYSBmaWxlIChvcHRpb25hbGx5IGF0IGEgbGluZSkgaW4gdGhlIHVzZXIncyBlZGl0b3IgdmlhIG9wZW4tZWRpdG9yLiAqL1xuYXN5bmMgZnVuY3Rpb24gb3BlbkluRWRpdG9yKGN3ZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgY29uc3QgYWJzID0gcGF0aC5zdGFydHNXaXRoKCcvJykgfHwgL15bQS1aYS16XTpbXFxcXC9dLy50ZXN0KHBhdGgpID8gcGF0aCA6IGAke2N3ZH0vJHtwYXRofWBcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goT1BFTl9FRElUT1JfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBwYXRoOiBhYnMsIGxpbmUgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyB7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9XG59XG5cbi8qKiBTaG9ydCByZWxhdGl2ZSB0aW1lIGZvciBjb21taXQgcm93cyAoXCJqdXN0IG5vd1wiIC8gXCIzIG1pbiBhZ29cIiAvIFx1MjAyNikuICovXG5mdW5jdGlvbiByZWxhdGl2ZVRpbWUoaXNvOiBzdHJpbmcsIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKChEYXRlLm5vdygpIC0gbmV3IERhdGUoaXNvKS5nZXRUaW1lKCkpIC8gNjAwMDApXG4gIGlmIChtaW51dGVzIDwgMSkgcmV0dXJuIHQoJ3RpbWUubm93JylcbiAgaWYgKG1pbnV0ZXMgPCA2MCkgcmV0dXJuIHQoJ3RpbWUubWludXRlcycsIHsgbjogbWludXRlcyB9KVxuICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKVxuICBpZiAoaG91cnMgPCAyNCkgcmV0dXJuIHQoJ3RpbWUuaG91cnMnLCB7IG46IGhvdXJzIH0pXG4gIHJldHVybiB0KCd0aW1lLmRheXMnLCB7IG46IE1hdGguZmxvb3IoaG91cnMgLyAyNCkgfSlcbn1cblxuLyoqIFRoZW1lLWF3YXJlIGRyb3Bkb3duIHJlcGxhY2luZyBuYXRpdmUgPHNlbGVjdD4gKG5hdGl2ZSBwb3B1cHMgaWdub3JlIHRoZSB0aGVtZSkuICovXG5mdW5jdGlvbiBUaGVtZVNlbGVjdCh7XG4gIHZhbHVlLFxuICBvcHRpb25zLFxuICBvbkNoYW5nZSxcbiAgYXJpYUxhYmVsLFxufToge1xuICB2YWx1ZTogc3RyaW5nXG4gIG9wdGlvbnM6IHsgdmFsdWU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9W11cbiAgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkXG4gIGFyaWFMYWJlbD86IHN0cmluZ1xufSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3Qgcm9vdFJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgY3VycmVudCA9IG9wdGlvbnMuZmluZCgobykgPT4gby52YWx1ZSA9PT0gdmFsdWUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVyblxuICAgIGNvbnN0IGNsb3NlT3V0c2lkZSA9IChldmVudDogUG9pbnRlckV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiAhcm9vdFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBjb25zdCBjbG9zZU9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBjbG9zZU91dHNpZGUpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNsb3NlT25LZXkpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgY2xvc2VPdXRzaWRlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNsb3NlT25LZXkpXG4gICAgfVxuICB9LCBbb3Blbl0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VsXCIgcmVmPXtyb290UmVmfT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItc2VsLXRyaWdnZXJcIlxuICAgICAgICBhcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiXG4gICAgICAgIGFyaWEtZXhwYW5kZWQ9e29wZW59XG4gICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgICAgICAgb25DbGljaz17KCkgPT4gc2V0T3BlbigodikgPT4gIXYpfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC12YWx1ZVwiPntjdXJyZW50Py5sYWJlbCA/PyB2YWx1ZX08L3NwYW4+XG4gICAgICAgIDxJY29uQ2hldnJvbkRvd24gLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJkc2RyLXNlbC1tZW51XCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPXthcmlhTGFiZWx9PlxuICAgICAgICAgIHtvcHRpb25zLm1hcCgob3B0aW9uKSA9PiAoXG4gICAgICAgICAgICA8bGkga2V5PXtvcHRpb24udmFsdWV9IHJvbGU9XCJub25lXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtvcHRpb24udmFsdWUgPT09IHZhbHVlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc2VsLW9wdGlvbiR7b3B0aW9uLnZhbHVlID09PSB2YWx1ZSA/ICcgZHNkci1zZWwtb3B0aW9uLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKG9wdGlvbi52YWx1ZSlcbiAgICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLW9wdGlvbi1tYXJrXCI+e29wdGlvbi52YWx1ZSA9PT0gdmFsdWUgPyA8SWNvbkNoZWNrIC8+IDogbnVsbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtb3B0aW9uLWxhYmVsXCI+e29wdGlvbi5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC91bD5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBEaWZmIGZvbnQgKyBmb250IHNpemUgY29udHJvbHMgKHNoYXJlZCBwcmVmcyBzdG9yZSkuICovXG5mdW5jdGlvbiBEaWZmUmV2aWV3UHJlZnMoeyB0IH06IHsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgcHJlZnMgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwcmVmc1N0b3JlLnN1YnNjcmliZSwgcHJlZnNTdG9yZS5nZXRTbmFwc2hvdClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1maWVsZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1sYWJlbFwiIGlkPVwiZHNkci1wcmVmLWZvbnQtbGFiZWxcIj57dCgnc2V0dGluZ3MuZm9udCcpfTwvc3Bhbj5cbiAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgYXJpYUxhYmVsPXt0KCdzZXR0aW5ncy5mb250Jyl9XG4gICAgICAgICAgdmFsdWU9e3ByZWZzLmZvbnR9XG4gICAgICAgICAgb3B0aW9ucz17Rk9OVF9PUFRJT05TLm1hcCgoZikgPT4gKHsgdmFsdWU6IGYuaWQsIGxhYmVsOiBmLmxhYmVsLnN0YXJ0c1dpdGgoJ2ZvbnQuJykgPyB0KGYubGFiZWwgYXMga2V5b2YgdHlwZW9mIHpoKSA6IGYubGFiZWwgfSkpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZm9udCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuZm9udCA9IGZvbnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWZpZWxkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWxhYmVsXCIgaWQ9XCJkc2RyLXByZWYtc2l6ZS1sYWJlbFwiPnt0KCdzZXR0aW5ncy5zaXplJyl9PC9zcGFuPlxuICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLnNpemUnKX1cbiAgICAgICAgICB2YWx1ZT17U3RyaW5nKHByZWZzLnNpemUpfVxuICAgICAgICAgIG9wdGlvbnM9e1NJWkVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBTdHJpbmcocyksIGxhYmVsOiBgJHtzfXB4YCB9KSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyhzaXplKSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5zaXplID0gTnVtYmVyKHNpemUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSGVhZGVyIGFjdGlvbiAoc2Vzc2lvbiBzY29wZSk6IGJhZGdlICsgb3Blbi5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3QWN0aW9uKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgdXNlU2Vzc2lvbiwgdCB9OiBEaWZmUmV2aWV3QWN0aW9uUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IG5vZGVzID0gdXNlU2Vzc2lvbigocykgPT4gcy5ub2RlcylcbiAgY29uc3QgY2hhbmdlQ291bnQgPSB1c2VNZW1vKCgpID0+IGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXMpLCBbbm9kZXNdKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBvcGVuT3ZlcmxheSA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWIgPSBvdmVybGF5U3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHNldE9wZW4ob3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KCkub3BlbilcbiAgICB9KVxuICAgIHJldHVybiB1bnN1YlxuICB9LCBbXSlcblxuICBpZiAoIWN3ZCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItdHJpZ2dlclwiIGFyaWEtbGFiZWw9e3QoJ2FjdGlvbi5hcmlhJyl9IG9uQ2xpY2s9e29wZW5PdmVybGF5fT5cbiAgICAgIDxJY29uRGlmZiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1sYWJlbFwiPnt0KCdhY3Rpb24ubGFiZWwnKX08L3NwYW4+XG4gICAgICB7Y2hhbmdlQ291bnQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiPntjaGFuZ2VDb3VudH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtvcGVuID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlsZSB0cmVlOiBidWlsZCBhIGRpcmVjdG9yeSB0cmVlIGZyb20gZmxhdCBwYXRocyBhbmQgcmVuZGVyIGl0IHdpdGhcbi8vIGNvbGxhcHNpYmxlIGZvbGRlcnMgKHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHJldmlldyBzdXJmYWNlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIFRyZWVEaXI8VD4gPSB7IGtpbmQ6ICdkaXInOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY2hpbGRyZW46IFRyZWVOb2RlPFQ+W10gfVxudHlwZSBUcmVlTGVhZjxUPiA9IHsga2luZDogJ2xlYWYnOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgaXRlbTogVCB9XG50eXBlIFRyZWVOb2RlPFQ+ID0gVHJlZURpcjxUPiB8IFRyZWVMZWFmPFQ+XG5cbi8qKiBUdXJuIGEgZmxhdCBpdGVtIGxpc3QgaW50byBhIHNvcnRlZCBkaXJlY3RvcnkgdHJlZSAoZGlyZWN0b3JpZXMgZmlyc3QpLiAqL1xuZnVuY3Rpb24gYnVpbGRGaWxlVHJlZTxUPihpdGVtczogcmVhZG9ubHkgVFtdLCBwYXRoT2Y6IChpdGVtOiBUKSA9PiBzdHJpbmcpOiBUcmVlTm9kZTxUPltdIHtcbiAgY29uc3Qgcm9vdDogVHJlZU5vZGU8VD5bXSA9IFtdXG4gIGNvbnN0IGRpckluZGV4ID0gbmV3IE1hcDxzdHJpbmcsIFRyZWVEaXI8VD4+KClcbiAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgY29uc3QgcGF0aCA9IHBhdGhPZihpdGVtKVxuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDApIGNvbnRpbnVlXG4gICAgbGV0IHNpYmxpbmdzID0gcm9vdFxuICAgIGxldCBwcmVmaXggPSAnJ1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBwcmVmaXggPSBwcmVmaXggPyBgJHtwcmVmaXh9LyR7cGFydHNbaV19YCA6IHBhcnRzW2ldXG4gICAgICBsZXQgZGlyID0gZGlySW5kZXguZ2V0KHByZWZpeClcbiAgICAgIGlmICghZGlyKSB7XG4gICAgICAgIGRpciA9IHsga2luZDogJ2RpcicsIG5hbWU6IHBhcnRzW2ldLCBwYXRoOiBwcmVmaXgsIGNoaWxkcmVuOiBbXSB9XG4gICAgICAgIGRpckluZGV4LnNldChwcmVmaXgsIGRpcilcbiAgICAgICAgc2libGluZ3MucHVzaChkaXIpXG4gICAgICB9XG4gICAgICBzaWJsaW5ncyA9IGRpci5jaGlsZHJlblxuICAgIH1cbiAgICBzaWJsaW5ncy5wdXNoKHsga2luZDogJ2xlYWYnLCBuYW1lOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSwgcGF0aCwgaXRlbSB9KVxuICB9XG4gIGNvbnN0IHNvcnROb2RlcyA9IChub2RlczogVHJlZU5vZGU8VD5bXSk6IHZvaWQgPT4ge1xuICAgIG5vZGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLmtpbmQgIT09IGIua2luZCkgcmV0dXJuIGEua2luZCA9PT0gJ2RpcicgPyAtMSA6IDFcbiAgICAgIHJldHVybiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpXG4gICAgfSlcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIGlmIChub2RlLmtpbmQgPT09ICdkaXInKSBzb3J0Tm9kZXMobm9kZS5jaGlsZHJlbilcbiAgfVxuICBzb3J0Tm9kZXMocm9vdClcbiAgcmV0dXJuIHJvb3Rcbn1cblxuLyoqIFJlY3Vyc2l2ZSB0cmVlIHJlbmRlcmVyOiBjb2xsYXBzaWJsZSBkaXJlY3RvcmllcyArIGxlYWYgcm93cy4gKi9cbmZ1bmN0aW9uIEZpbGVUcmVlVmlldzxUPihwcm9wczoge1xuICBub2RlczogVHJlZU5vZGU8VD5bXVxuICBjb2xsYXBzZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz5cbiAgb25Ub2dnbGVEaXI6IChwYXRoOiBzdHJpbmcpID0+IHZvaWRcbiAgZGVwdGg6IG51bWJlclxuICByZW5kZXJMZWFmOiAobGVhZjogVHJlZUxlYWY8VD4pID0+IFJlYWN0Tm9kZVxufSk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IHsgbm9kZXMsIGNvbGxhcHNlZCwgb25Ub2dnbGVEaXIsIGRlcHRoLCByZW5kZXJMZWFmIH0gPSBwcm9wc1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7bm9kZXMubWFwKChub2RlKSA9PlxuICAgICAgICBub2RlLmtpbmQgPT09ICdkaXInID8gKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9PlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1kaXIke2NvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/ICcnIDogJyBkc2RyLWRpci1vcGVuJ31gfVxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nTGVmdDogZGVwdGggKiAxNCArIDggfX1cbiAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25Ub2dnbGVEaXIobm9kZS5wYXRoKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY2FyZXRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJ1x1MjVCOCcgOiAnXHUyNUJFJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLW5hbWVcIiB0aXRsZT17bm9kZS5wYXRofT57bm9kZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY291bnRcIj57bm9kZS5jaGlsZHJlbi5sZW5ndGh9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/IChcbiAgICAgICAgICAgICAgPEZpbGVUcmVlVmlldyBub2Rlcz17bm9kZS5jaGlsZHJlbn0gY29sbGFwc2VkPXtjb2xsYXBzZWR9IG9uVG9nZ2xlRGlyPXtvblRvZ2dsZURpcn0gZGVwdGg9e2RlcHRoICsgMX0gcmVuZGVyTGVhZj17cmVuZGVyTGVhZn0gLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9IHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0IH19PntyZW5kZXJMZWFmKG5vZGUpfTwvZGl2PlxuICAgICAgICApLFxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbXBvc2VyIGRvY2sgKHNlc3Npb24gc2NvcGUpOiBwZW5kaW5nIGlubGluZSBjb21tZW50cyBmbG9hdCBhYm92ZSB0aGVcbi8vIGlucHV0IGJveCwgQ29kZXgtc3R5bGUgXHUyMDE0IGhvdmVyIHRoZSBwaWxsIHRvIHByZXZpZXcsIGNsaWNrIHNlbmQgdG8gaW5qZWN0LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnR5cGUgRGlmZlJldmlld0NvbXBvc2VyRG9ja1Byb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uaW5wdXQuZG9jayc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7IHNlc3Npb25zOiBJU2Vzc2lvbnMgfVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgc2Vzc2lvbnMsIGlucHV0LCB0IH06IERpZmZSZXZpZXdDb21wb3NlckRvY2tQcm9wcykge1xuICBjb25zdCBjd2QgPSB1c2VTZXNzaW9ucygoczogU2Vzc2lvbkxpc3RTdGF0ZSkgPT4gcy5ieUlkW3Nlc3Npb25JZF0/LmN3ZClcbiAgY29uc3QgcGVuZGluZyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHBlbmRpbmdDb21tZW50c1N0b3JlLnN1YnNjcmliZSwgcGVuZGluZ0NvbW1lbnRzU3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtkaXNtaXNzZWQsIHNldERpc21pc3NlZF0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgY2FycmllZElkcyA9IHVzZVJlZjxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBjYXJyeWluZyA9IHVzZVJlZihmYWxzZSlcblxuICAvLyBTZWVkIHRoZSBzdG9yZSBmcm9tIHNlcnZlciBzdG9yYWdlIHdoZW4gbm90aGluZyBoYXMgYmVlbiBzeW5jZWQgZm9yIHRoaXNcbiAgLy8gd29ya3NwYWNlIHlldCAocGFuZWwgbmV2ZXIgb3BlbmVkIHRoaXMgc2Vzc2lvbiBcdTIwMTQgY29tbWVudHMgcGVyc2lzdCBpbiAuZ2l0KS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWN3ZCB8fCBwZW5kaW5nLmN3ZCA9PT0gY3dkKSByZXR1cm5cbiAgICBsZXQgY2FuY2VsbGVkID0gZmFsc2VcbiAgICB2b2lkIGxvYWRDb21tZW50cyhjd2QpLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgIGlmIChjYW5jZWxsZWQpIHJldHVyblxuICAgICAgcGVuZGluZ0NvbW1lbnRzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgIGlmIChkLmN3ZCA9PT0gY3dkKSByZXR1cm5cbiAgICAgICAgZC5jd2QgPSBjd2RcbiAgICAgICAgZC5jb21tZW50cyA9IGxpc3RcbiAgICAgIH0pXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2FuY2VsbGVkID0gdHJ1ZVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtjd2QsIHBlbmRpbmcuY3dkXSlcblxuICBjb25zdCBjb21tZW50cyA9IHBlbmRpbmcuY3dkID09PSBjd2QgPyBwZW5kaW5nLmNvbW1lbnRzIDogW11cbiAgY29uc3QgaWRzID0gY29tbWVudHMubWFwKChjKSA9PiBjLmlkKS5qb2luKCcsJylcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoY29tbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBzZXREaXNtaXNzZWQoZmFsc2UpXG4gICAgICBjYXJyaWVkSWRzLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY29tbWVudHMubGVuZ3RoXSlcblxuICAvLyBDb2RleC1zdHlsZSBhdXRvLWNhcnJ5OiB3aGVuIHRoZSB1c2VyIHN1Ym1pdHMgYSBtZXNzYWdlIHdoaWxlIGNvbW1lbnRzIGFyZVxuICAvLyBwZW5kaW5nLCBxdWV1ZSB0aGUgY29tbWVudHMgcmlnaHQgYmVoaW5kIGl0IChubyBzZW5kIGJ1dHRvbiBuZWVkZWQpLlxuICBjb25zdCBwaGFzZSA9IGlucHV0Py5waGFzZVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChjb21tZW50cy5sZW5ndGggPT09IDAgfHwgY2FycnlpbmcuY3VycmVudCB8fCBjYXJyaWVkSWRzLmN1cnJlbnQgPT09IGlkcykgcmV0dXJuXG4gICAgaWYgKHBoYXNlICE9PSAnc3VibWl0dGluZycgJiYgcGhhc2UgIT09ICdhZGp1ZGljYXRpbmcnKSByZXR1cm5cbiAgICBjYXJyeWluZy5jdXJyZW50ID0gdHJ1ZVxuICAgIGNvbnN0IHRhcmdldElkcyA9IGlkc1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFsnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJywgJyddXG4gICAgZm9yIChjb25zdCBjIG9mIGNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBhbmNob3IgPSBjLmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Yy5saW5lTmV3fWAgOiBgIChvbGQgbGluZSAke2MubGluZU9sZH0pYFxuICAgICAgbGluZXMucHVzaChgLSAke2MucGF0aH0ke2FuY2hvcn06ICR7Yy50ZXh0fWApXG4gICAgfVxuICAgIHZvaWQgaW5qZWN0VG9TZXNzaW9uKHNlc3Npb25zLCBzZXNzaW9uSWQsIGxpbmVzLmpvaW4oJ1xcbicpKS50aGVuKChvdXRjb21lKSA9PiB7XG4gICAgICBpZiAob3V0Y29tZSAhPT0gJ2ZhaWxlZCcpIGNhcnJpZWRJZHMuY3VycmVudCA9IHRhcmdldElkc1xuICAgICAgY2FycnlpbmcuY3VycmVudCA9IGZhbHNlXG4gICAgfSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtwaGFzZSwgaWRzXSlcblxuICBpZiAoIWN3ZCB8fCBjb21tZW50cy5sZW5ndGggPT09IDAgfHwgZGlzbWlzc2VkKSByZXR1cm4gbnVsbFxuXG4gIC8qKiBPcGVuIHRoZSByZXZpZXcgcGFuZWwgYXQgdGhlIGNvbW1lbnQncyBjaGFuZ2UgYmxvY2suICovXG4gIGNvbnN0IGZvY3VzQ29tbWVudCA9IChjb21tZW50OiBSZXZpZXdDb21tZW50KSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQuZm9jdXMgPSB7IHBhdGg6IGNvbW1lbnQucGF0aCwgbGluZTogY29tbWVudC5saW5lTmV3ID8/IGNvbW1lbnQubGluZU9sZCA/PyB1bmRlZmluZWQgfVxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZG9ja1wiIG9uTW91c2VFbnRlcj17KCkgPT4gc2V0SG92ZXIodHJ1ZSl9IG9uTW91c2VMZWF2ZT17KCkgPT4gc2V0SG92ZXIoZmFsc2UpfT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWhlYWRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWljb25cIj48SWNvbkNvbW1lbnQgLz48L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1jb3VudFwiIHRpdGxlPXt0KCdyZXZpZXcuZG9ja0hpbnQnKX0+e3QoJ3Jldmlldy5kb2NrQ29tbWVudHMnLCB7IG46IGNvbW1lbnRzLmxlbmd0aCB9KX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNsb3NlXCIgYXJpYS1sYWJlbD17dCgnY29tbWVudC5jYW5jZWwnKX0gb25DbGljaz17KCkgPT4gc2V0RGlzbWlzc2VkKHRydWUpfT5cbiAgICAgICAgICA8SWNvblggLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIHtob3ZlciA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2stbGlzdFwiPlxuICAgICAgICAgIHtjb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAga2V5PXtjb21tZW50LmlkfVxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWl0ZW1cIlxuICAgICAgICAgICAgICB0aXRsZT17dCgncmV2aWV3LmRvY2tKdW1wJyl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGZvY3VzQ29tbWVudChjb21tZW50KX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWxvY1wiPntjb21tZW50LnBhdGh9e2NvbW1lbnQubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjb21tZW50LmxpbmVOZXd9YCA6ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLXRleHRcIj57Y29tbWVudC50ZXh0fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IG92ZXJsYXkgKHJvb3Qgc2NvcGUpOiBzZXNzaW9uICsgd29ya3NwYWNlIHRhYnMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gRGlmZlJldmlld092ZXJsYXkoeyBzZXNzaW9ucywgdCB9OiBEaWZmUmV2aWV3T3ZlcmxheVByb3BzKSB7XG4gIGNvbnN0IHN0b3JlU3RhdGUgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShvdmVybGF5U3RvcmUuc3Vic2NyaWJlLCBvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IHByZWZzID0gdXNlU3luY0V4dGVybmFsU3RvcmUocHJlZnNTdG9yZS5zdWJzY3JpYmUsIHByZWZzU3RvcmUuZ2V0U25hcHNob3QpXG4gIC8vIEdpdC1maXJzdDogbGFuZCBvbiB0aGUgd29ya3NwYWNlIHRhYiAoc3RhZ2VkL3Vuc3RhZ2VkL2JyYW5jaCB0cmVlcykgc28gdGhlXG4gIC8vIGNoYW5nZSByZXZpZXcgaXMgb25lIGNsaWNrIGF3YXk7IHRoZSBzZXNzaW9uIHRhYiBzdGF5cyBhIGNsaWNrIGF3YXkuXG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSB1c2VTdGF0ZTwnc2Vzc2lvbicgfCAnd29ya3NwYWNlJz4oJ3dvcmtzcGFjZScpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IHVzZVN0YXRlPFZpZXdNb2RlPigoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJyAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZHNkci12aWV3JykgPT09ICdzcGxpdCcgPyAnc3BsaXQnIDogJ3NpbmdsZSdcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiAnc2luZ2xlJ1xuICAgIH1cbiAgfSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RzZHItdmlldycsIHZpZXcpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBwcml2YXRlIG1vZGUgLyB1bmF2YWlsYWJsZSBcdTIwMTQgbm9uLWZhdGFsXG4gICAgfVxuICB9LCBbdmlld10pXG5cbiAgLy8gV29ya3NwYWNlIHRhYiBzdGF0ZS5cbiAgY29uc3QgW3N0YXR1cywgc2V0U3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW25vdGljZSwgc2V0Tm90aWNlXSA9IHVzZVN0YXRlPHsga2luZDogJ29rJyB8ICdlcnJvcic7IHRleHQ6IHN0cmluZyB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbmZpcm0sIHNldENvbmZpcm1dID0gdXNlU3RhdGU8J2ZpbGUnIHwgJ2FsbCcgfCAncHVzaCcgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0TWVzc2FnZSwgc2V0Q29tbWl0TWVzc2FnZV0gPSB1c2VTdGF0ZSgnJylcbiAgLy8gTG9jYWwgKHVucHVzaGVkKSBjb21taXQgaGlzdG9yeTogbGlzdCArIHBlci1jb21taXQgZGlmZiB2aWV3LlxuICBjb25zdCBbaGlzdG9yeSwgc2V0SGlzdG9yeV0gPSB1c2VTdGF0ZTxDb21taXRJbmZvW10+KFtdKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXQsIHNldFNlbGVjdGVkQ29tbWl0XSA9IHVzZVN0YXRlPENvbW1pdEluZm8gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZiwgc2V0Q29tbWl0RGlmZl0gPSB1c2VTdGF0ZTxDb21taXREaWZmUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZkxvYWRpbmcsIHNldENvbW1pdERpZmZMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXRGaWxlLCBzZXRTZWxlY3RlZENvbW1pdEZpbGVdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgLy8gSW5saW5lIHJldmlldyBjb21tZW50cyAod29ya3NwYWNlIHRhYiwgc2luZ2xlIHZpZXcpLlxuICBjb25zdCBbY29tbWVudHMsIHNldENvbW1lbnRzXSA9IHVzZVN0YXRlPFJldmlld0NvbW1lbnRbXT4oW10pXG4gIGNvbnN0IFtjb21tZW50RWRpdG9yLCBzZXRDb21tZW50RWRpdG9yXSA9IHVzZVN0YXRlPHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1lbnRUZXh0LCBzZXRDb21tZW50VGV4dF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2NvbW1lbnRQb3BvdmVyLCBzZXRDb21tZW50UG9wb3Zlcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBSZXZpZXcgc2NvcGU6IHdoaWNoIHNsaWNlIG9mIHRoZSByZXBvc2l0b3J5IHRoZSB3b3Jrc3BhY2UgdGFiIHNob3dzLlxuICBjb25zdCBbc2NvcGUsIHNldFNjb3BlXSA9IHVzZVN0YXRlPFdvcmtzcGFjZVNjb3BlPignYWxsJylcbiAgY29uc3QgW2JyYW5jaGVzLCBzZXRCcmFuY2hlc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oW10pXG4gIGNvbnN0IFtiYXNlQnJhbmNoLCBzZXRCYXNlQnJhbmNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtiYXNlU3RhdHVzLCBzZXRCYXNlU3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gRmVlZGJhY2sgbG9vcDogc2VuZCBpbmxpbmUgY29tbWVudHMgdG8gdGhlIGFnZW50IChzZXNzaW9uLnByb21wdCwgY29weSBmYWxsYmFjaykuXG4gIGNvbnN0IFtzZW5kT3Blbiwgc2V0U2VuZE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZW5kVGV4dCwgc2V0U2VuZFRleHRdID0gdXNlU3RhdGUoJycpXG4gIC8vIEFJIHJldmlldyAoL3Jldmlldyk6IGZpbmRpbmdzICsgdmVyZGljdC5cbiAgY29uc3QgW3Jldmlldywgc2V0UmV2aWV3XSA9IHVzZVN0YXRlPFJldmlld1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3Jldmlld2luZywgc2V0UmV2aWV3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICAvLyBHaXRIdWIgUFIgY29udGV4dCAoZ2ggQ0xJKS5cbiAgY29uc3QgW3ByLCBzZXRQcl0gPSB1c2VTdGF0ZTxQclJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gTXVsdGktcmVwbzogcmVwb3MgZGV0ZWN0ZWQgdW5kZXIgdGhlIHdvcmtzcGFjZSArIHRoZSBzZWxlY3RlZCBvbmUuXG4gIGNvbnN0IFtyZXBvcywgc2V0UmVwb3NdID0gdXNlU3RhdGU8eyBwYXRoOiBzdHJpbmc7IGJyYW5jaDogc3RyaW5nIHwgbnVsbCB9W10+KFtdKVxuICBjb25zdCBbcmVwb1BhdGgsIHNldFJlcG9QYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoanVtcCB0YXJnZXQgZnJvbSBhIFBSIGNvbW1lbnQgb3IgYSBmaW5kaW5nKS5cbiAgY29uc3QgW2p1bXBMaW5lLCBzZXRKdW1wTGluZV0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICAvLyBGaW5kaW5ncyBsaXN0IHBhbmVsIHZpc2liaWxpdHkuXG4gIGNvbnN0IFtmaW5kaW5nc09wZW4sIHNldEZpbmRpbmdzT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICAvKiogU2VsZWN0IGEgZmlsZSBhbmQgZmxhc2ggaXRzIGxpbmUgKGZpbmRpbmdzIC8gUFIgY29tbWVudHMpLiAqL1xuICBjb25zdCBqdW1wVG8gPSAoZmlsZTogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWQoZmlsZSlcbiAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICBzZXRKdW1wTGluZShsaW5lID8/IG51bGwpXG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgfVxuICAvLyBDb2xsYXBzZWQgZGlyZWN0b3JpZXMgaW4gdGhlIGxlZnQtaGFuZCBmaWxlIHRyZWUgKHNoYXJlZCBhY3Jvc3MgdGFicykuXG4gIGNvbnN0IFtjb2xsYXBzZWREaXJzLCBzZXRDb2xsYXBzZWREaXJzXSA9IHVzZVN0YXRlPFJlYWRvbmx5U2V0PHN0cmluZz4+KCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgdG9nZ2xlRGlyID0gdXNlTWVtbyhcbiAgICAoKSA9PiAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBzZXRDb2xsYXBzZWREaXJzKChwcmV2KSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpXG4gICAgICAgIGlmIChuZXh0LmhhcyhwYXRoKSkgbmV4dC5kZWxldGUocGF0aClcbiAgICAgICAgZWxzZSBuZXh0LmFkZChwYXRoKVxuICAgICAgICByZXR1cm4gbmV4dFxuICAgICAgfSlcbiAgICB9LFxuICAgIFtdLFxuICApXG4gIGNvbnN0IG5vdGljZVRpbWVyID0gdXNlUmVmPFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkPih1bmRlZmluZWQpXG5cbiAgLy8gQ3VycmVudCBzZXNzaW9uJ3MgY29udmVyc2F0aW9uIHNuYXBzaG90IChyZWFjdGl2ZSksIGZvciB0aGUgc2Vzc2lvbiB0YWIuXG4gIGNvbnN0IGN1cnJlbnRJZCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4gKG5vdGlmeTogKCkgPT4gdm9pZCkgPT4gc2Vzc2lvbnMubGlzdC5zdWJzY3JpYmUobm90aWZ5KSwgW3Nlc3Npb25zXSksXG4gICAgdXNlTWVtbygoKSA9PiAoKSA9PiBzZXNzaW9ucy5saXN0LmdldFNuYXBzaG90KCkuY3VycmVudCwgW3Nlc3Npb25zXSksXG4gIClcbiAgY29uc3Qgc25hcHNob3QgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgaWYgKCFiaW5kaW5nKSByZXR1cm4gKCkgPT4ge31cbiAgICAgICAgcmV0dXJuIGJpbmRpbmcuc2Vzc2lvbi5zdWJzY3JpYmUobm90aWZ5KVxuICAgICAgfVxuICAgIH0sIFtzZXNzaW9ucywgY3VycmVudElkXSksXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiBiaW5kaW5nID8gYmluZGluZy5zZXNzaW9uLmdldFNuYXBzaG90KCkgOiBudWxsXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgKVxuXG4gIGNvbnN0IHJvdW5kcyA9IHVzZU1lbW8oKCkgPT4gKHNuYXBzaG90ID8gY29sbGVjdFNlc3Npb25Sb3VuZHMoc25hcHNob3Qubm9kZXMpIDogW10pLCBbc25hcHNob3RdKVxuICAvLyBMZWZ0LWhhbmQgZmlsZSB0cmVlczogcGVyLXJvdW5kIHRyZWVzIGZvciB0aGUgc2Vzc2lvbiB0YWIsIG9uZSB0cmVlIGZvclxuICAvLyB0aGUgZ2l0IHdvcmtpbmcgdHJlZSBvbiB0aGUgd29ya3NwYWNlIHRhYi5cbiAgY29uc3Qgc2Vzc2lvblRyZWVzID0gdXNlTWVtbygoKSA9PiBuZXcgTWFwKHJvdW5kcy5tYXAoKHIpID0+IFtyLnJvdW5kLCBidWlsZEZpbGVUcmVlKHIuY2hhbmdlcywgKGMpID0+IGMucGF0aCldKSksIFtyb3VuZHNdKVxuICBjb25zdCB0b3RhbFNlc3Npb25GaWxlcyA9IHVzZU1lbW8oKCkgPT4gcm91bmRzLnJlZHVjZSgobiwgcikgPT4gbiArIHIuY2hhbmdlcy5sZW5ndGgsIDApLCBbcm91bmRzXSlcbiAgY29uc3QgW3NlbGVjdGVkUm91bmQsIHNldFNlbGVjdGVkUm91bmRdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkUGF0aCwgc2V0U2VsZWN0ZWRQYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHNlbGVjdGVkQ2hhbmdlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgcm91bmQgPSByb3VuZHMuZmluZCgocikgPT4gci5yb3VuZCA9PT0gc2VsZWN0ZWRSb3VuZClcbiAgICByZXR1cm4gcm91bmQ/LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBzZWxlY3RlZFBhdGgpID8/IG51bGxcbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZCwgc2VsZWN0ZWRQYXRoXSlcblxuICBjb25zdCBjd2QgPSBzdG9yZVN0YXRlLmN3ZFxuICAvKiogQWN0aXZlIGdpdCByZXBvIGZvciB3b3Jrc3BhY2Ugb3BlcmF0aW9ucyAobXVsdGktcmVwbyBzZWxlY3RvciBvdmVycmlkZSkuICovXG4gIGNvbnN0IGFjdGl2ZUN3ZCA9IHJlcG9QYXRoID8/IGN3ZFxuXG4gIGNvbnN0IGxvYWRXb3Jrc3BhY2UgPSBhc3luYyAoc2lsZW50ID0gZmFsc2UpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKCFzaWxlbnQpIHNldExvYWRpbmcodHJ1ZSlcbiAgICBzZXRFcnJvcihudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBbbmV4dCwgaGlzdCwgbmV4dENvbW1lbnRzLCBicmFuY2hMaXN0LCBwckRhdGEsIHJlcG9MaXN0XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgbG9hZFN0YXR1cyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkSGlzdG9yeShhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkQ29tbWVudHMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEJyYW5jaGVzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRQcihhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUmVwb3MoYWN0aXZlQ3dkKSxcbiAgICAgIF0pXG4gICAgICBzZXRTdGF0dXMobmV4dClcbiAgICAgIGlmIChoaXN0Lm9rKSBzZXRIaXN0b3J5KGhpc3QuY29tbWl0cylcbiAgICAgIHNldENvbW1lbnRzKG5leHRDb21tZW50cylcbiAgICAgIHNldEJyYW5jaGVzKGJyYW5jaExpc3QpXG4gICAgICBzZXRQcihwckRhdGEpXG4gICAgICBzZXRSZXBvcyhyZXBvTGlzdC5yZXBvcylcbiAgICAgIC8vIERlZmF1bHQgdGhlIHJlcG8gc2VsZWN0b3IgdG8gdGhlIHdvcmtzcGFjZSByb290IHdoZW4gaXQgaXMgaXRzZWxmIGEgcmVwby5cbiAgICAgIGlmIChyZXBvUGF0aCA9PT0gbnVsbCAmJiAhcmVwb0xpc3QucmVwb3Muc29tZSgocikgPT4gci5wYXRoID09PSBhY3RpdmVDd2QpKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gcmVwb0xpc3QucmVwb3NbMF1cbiAgICAgICAgaWYgKGZpcnN0ICYmIGZpcnN0LnBhdGggIT09IGN3ZCkgc2V0UmVwb1BhdGgoZmlyc3QucGF0aClcbiAgICAgIH1cbiAgICAgIGlmIChuZXh0LmVycm9yICYmICFuZXh0LmlzUmVwbykgc2V0RXJyb3IobmV4dC5lcnJvcilcbiAgICAgIHNldFNlbGVjdGVkKChwcmV2KSA9PiAocHJldiAmJiBuZXh0LmZpbGVzLnNvbWUoKGYpID0+IGYucGF0aCA9PT0gcHJldikgPyBwcmV2IDogbmV4dC5maWxlc1swXT8ucGF0aCA/PyBudWxsKSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXRFcnJvcihlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gQXV0by1yZWZyZXNoIHRoZSB3b3Jrc3BhY2UgZGF0YTogcmVsb2FkIHdoZW5ldmVyIHRoZSB0YWIgYmVjb21lcyBhY3RpdmUgb3JcbiAgLy8gdGhlIHdvcmtzcGFjZSBjaGFuZ2VzLCBhbmQgcGVyaW9kaWNhbGx5IHdoaWxlIHRoZSBvdmVybGF5IGlzIG9wZW4uIEFcbiAgLy8gd29ya3NwYWNlIHN3aXRjaCBjbGVhcnMgc3RhbGUgY29tbWl0IHNlbGVjdGlvbiBhbmQgaGlzdG9yeSBmaXJzdC5cbiAgY29uc3Qgd29ya3NwYWNlQ3dkUmVmID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcHJldmlvdXMgPSB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudFxuICAgIHdvcmtzcGFjZUN3ZFJlZi5jdXJyZW50ID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICBpZiAodGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAocHJldmlvdXMgIT09IGFjdGl2ZUN3ZCkge1xuICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgc2V0SGlzdG9yeShbXSlcbiAgICAgIHNldENvbW1lbnRzKFtdKVxuICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgICAgIHNldFJldmlldyhudWxsKVxuICAgICAgc2V0UHIobnVsbClcbiAgICB9XG4gICAgdm9pZCBsb2FkV29ya3NwYWNlKClcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFt0YWIsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gU3VyZmFjZSB3b3Jrc3BhY2UgY29tbWVudHMgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSBkb2NrKS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBwZW5kaW5nQ29tbWVudHNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQuY3dkID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICAgIGQuY29tbWVudHMgPSBjb21tZW50c1xuICAgIH0pXG4gIH0sIFtjb21tZW50cywgYWN0aXZlQ3dkXSlcblxuICAvLyBKdW1wIHRvIGEgY2hhbmdlIGJsb2NrIGZyb20gdGhlIGNvbXBvc2VyIGRvY2sgKGNvbW1lbnQgY2xpY2spLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGZvY3VzID0gc3RvcmVTdGF0ZS5mb2N1c1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8ICFjd2QgfHwgIWZvY3VzKSByZXR1cm5cbiAgICBzZXRUYWIoJ3dvcmtzcGFjZScpXG4gICAgc2V0U2VsZWN0ZWQoZm9jdXMucGF0aClcbiAgICBzZXRKdW1wTGluZShmb2N1cy5saW5lID8/IG51bGwpXG4gICAgY29uc3Qgc2Nyb2xsVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChmb2N1cy5saW5lICE9IG51bGwpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtZHNkci1saW5lPVwiJHtmb2N1cy5saW5lfVwiXWApPy5zY3JvbGxJbnRvVmlldyh7IGJsb2NrOiAnY2VudGVyJywgYmVoYXZpb3I6ICdzbW9vdGgnIH0pXG4gICAgICB9XG4gICAgfSwgODApXG4gICAgY29uc3QgY2xlYXJUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gc2V0SnVtcExpbmUobnVsbCksIDI1MDApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dChzY3JvbGxUaW1lcilcbiAgICAgIGNsZWFyVGltZW91dChjbGVhclRpbWVyKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzdG9yZVN0YXRlLmtleV0pXG5cbiAgLy8gS2VlcCBzdGFnZWQvdW5zdGFnZWQvaGlzdG9yeSBmcmVzaCB3aGlsZSB0aGUgd29ya3NwYWNlIHRhYiBpcyBvcGVuLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8IHRhYiAhPT0gJ3dvcmtzcGFjZScgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB2b2lkIGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICB9LCAxNTAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbCh0aW1lcilcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW4sIHRhYiwgYWN0aXZlQ3dkXSlcblxuICAvLyBCcmFuY2ggc2NvcGU6IGRpZmYgdGhlIHdvcmt0cmVlIGFnYWluc3QgdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAvLyBEZWZhdWx0IHRoZSBiYXNlIHRvIHRoZSBmaXJzdCBicmFuY2ggdGhhdCBpc24ndCB0aGUgY3VycmVudCBvbmUuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlICE9PSAnYnJhbmNoJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBjb25zdCBjdXJyZW50ID0gc3RhdHVzPy5icmFuY2ggPz8gbnVsbFxuICAgIGlmIChiYXNlQnJhbmNoID09PSBudWxsICYmIGJyYW5jaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZhbGxiYWNrID0gYnJhbmNoZXMuZmluZCgoYikgPT4gYiAhPT0gY3VycmVudCkgPz8gYnJhbmNoZXNbMF1cbiAgICAgIHNldEJhc2VCcmFuY2goZmFsbGJhY2spXG4gICAgfVxuICB9LCBbc2NvcGUsIGFjdGl2ZUN3ZCwgYnJhbmNoZXMsIGJhc2VCcmFuY2gsIHN0YXR1cz8uYnJhbmNoXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzY29wZSAhPT0gJ2JyYW5jaCcgfHwgIWFjdGl2ZUN3ZCB8fCAhYmFzZUJyYW5jaCkge1xuICAgICAgc2V0QmFzZVN0YXR1cyhudWxsKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZVxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1NUQVRVU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChhY3RpdmVDd2QpfSZiYXNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGJhc2VCcmFuY2gpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCkpIGFzIFN0YXR1c1Jlc3BvbnNlIHwgbnVsbFxuICAgICAgaWYgKCFjYW5jZWxsZWQgJiYgZGF0YSkge1xuICAgICAgICBzZXRCYXNlU3RhdHVzKGRhdGEpXG4gICAgICAgIGlmIChkYXRhLmVycm9yICYmIGJhc2VTdGF0dXM/LmVycm9yICE9PSBkYXRhLmVycm9yKSBzZXRFcnJvcihkYXRhLmVycm9yKVxuICAgICAgfVxuICAgIH0pKClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2FuY2VsbGVkID0gdHJ1ZVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzY29wZSwgYWN0aXZlQ3dkLCBiYXNlQnJhbmNoXSlcblxuICAvLyBEZWZhdWx0IHNlbGVjdGlvbiBmb3IgdGhlIHNlc3Npb24gdGFiIGZvbGxvd3MgdGhlIGZpcnN0IHJvdW5kIHdpdGggY2hhbmdlcy5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRSb3VuZCA9PT0gbnVsbCAmJiByb3VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZHNbMF0ucm91bmQpXG4gICAgICBzZXRTZWxlY3RlZFBhdGgocm91bmRzWzBdLmNoYW5nZXNbMF0/LnBhdGggPz8gbnVsbClcbiAgICB9XG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmRdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4pIHJldHVyblxuICAgIGNvbnN0IG9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5KVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW5dKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFub3RpY2UpIHJldHVyblxuICAgIG5vdGljZVRpbWVyLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHNldE5vdGljZShudWxsKSwgMzAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KG5vdGljZVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtub3RpY2VdKVxuXG4gIGNvbnN0IGZpbGVzID0gc3RhdHVzPy5pc1JlcG8gPyBzdGF0dXMuZmlsZXMgOiBbXVxuICBjb25zdCBzdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiBmLnN0YWdlZCksIFtmaWxlc10pXG4gIGNvbnN0IHVuc3RhZ2VkRmlsZXMgPSB1c2VNZW1vKCgpID0+IGZpbGVzLmZpbHRlcigoZikgPT4gIWYuc3RhZ2VkKSwgW2ZpbGVzXSlcblxuICAvLyBcIkxhc3QgdHVyblwiIHNjb3BlOiBwYXRocyB0aGUgYWdlbnQgdG91Y2hlZCBpbiB0aGUgbW9zdCByZWNlbnQgcm91bmQuXG4gIGNvbnN0IGxhc3RSb3VuZFBhdGhzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxzdHJpbmc+KClcbiAgICBjb25zdCBsYXN0ID0gcm91bmRzW3JvdW5kcy5sZW5ndGggLSAxXVxuICAgIGlmICghbGFzdCB8fCAhY3dkKSByZXR1cm4gc2V0XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgbGFzdC5jaGFuZ2VzKSB7XG4gICAgICBzZXQuYWRkKGNoYW5nZS5wYXRoKVxuICAgICAgY29uc3QgcCA9IGNoYW5nZS5wYXRoXG4gICAgICBpZiAoaXNBYnNQYXRoKHApKSB7XG4gICAgICAgIGNvbnN0IHJlbCA9IHAuc3RhcnRzV2l0aChjd2QpID8gcC5zbGljZShjd2QubGVuZ3RoKS5yZXBsYWNlKC9eW1xcXFwvXSsvLCAnJykgOiBwXG4gICAgICAgIHNldC5hZGQocmVsKVxuICAgICAgICBzZXQuYWRkKGJhc2VOYW1lKHApKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0LmFkZChiYXNlTmFtZShwKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNldFxuICB9LCBbcm91bmRzLCBjd2RdKVxuXG4gIC8qKiBUaGUgZmlsZSBzbGljZSB0aGUgY3VycmVudCBzY29wZSBzaG93cy4gKi9cbiAgY29uc3Qgc2NvcGVGaWxlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgIGNhc2UgJ3Vuc3RhZ2VkJzpcbiAgICAgICAgcmV0dXJuIHVuc3RhZ2VkRmlsZXNcbiAgICAgIGNhc2UgJ3N0YWdlZCc6XG4gICAgICAgIHJldHVybiBzdGFnZWRGaWxlc1xuICAgICAgY2FzZSAnYnJhbmNoJzpcbiAgICAgICAgcmV0dXJuIGJhc2VTdGF0dXM/LmZpbGVzID8/IFtdXG4gICAgICBjYXNlICdsYXN0LXR1cm4nOlxuICAgICAgICBpZiAobGFzdFJvdW5kUGF0aHMuc2l6ZSA9PT0gMCkgcmV0dXJuIFtdXG4gICAgICAgIHJldHVybiBmaWxlcy5maWx0ZXIoKGYpID0+IHtcbiAgICAgICAgICBpZiAobGFzdFJvdW5kUGF0aHMuaGFzKGYucGF0aCkgfHwgbGFzdFJvdW5kUGF0aHMuaGFzKGJhc2VOYW1lKGYucGF0aCkpKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIC8vIFNlc3Npb24gcGF0aHMgbWF5IGJlIHdvcmtzcGFjZS1yb290IHJlbGF0aXZlIG9yIGFic29sdXRlICh0aGUgcmVwbyBjYW5cbiAgICAgICAgICAvLyBiZSBhIHN1YmRpcmVjdG9yeSBvZiB0aGUgd29ya3NwYWNlKSBcdTIwMTQgbWF0Y2ggYW55IHN1ZmZpeCBmb3JtLlxuICAgICAgICAgIGNvbnN0IHN1ZmZpeCA9IGAvJHtmLnBhdGh9YFxuICAgICAgICAgIGZvciAoY29uc3QgcCBvZiBsYXN0Um91bmRQYXRocykge1xuICAgICAgICAgICAgaWYgKHAuZW5kc1dpdGgoc3VmZml4KSkgcmV0dXJuIHRydWVcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0pXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmlsZXNcbiAgICB9XG4gIH0sIFtzY29wZSwgdW5zdGFnZWRGaWxlcywgc3RhZ2VkRmlsZXMsIGJhc2VTdGF0dXMsIGZpbGVzLCBsYXN0Um91bmRQYXRoc10pXG5cbiAgLyoqIFNjb3BlcyB3aGVyZSBmaWxlL2h1bmsgYWNjZXB0XHUwMEI3cmV2ZXJ0XHUwMEI3dW5zdGFnZSBhbmQgY29tbWl0L3B1c2ggbWFrZSBzZW5zZS4gKi9cbiAgY29uc3QgYWxsb3dBY3Rpb25zID0gc2NvcGUgIT09ICdicmFuY2gnICYmIHNjb3BlICE9PSAnY29tbWl0J1xuXG4gIC8qKiBGaWxlcyB0aGUgY3VycmVudCBzY29wZSBjYW4gaGFuZCB0byB0aGUgQUkgcmV2aWV3LiAqL1xuICBjb25zdCByZXZpZXdhYmxlRmlsZXMgPSBzY29wZSA9PT0gJ2JyYW5jaCcgPyBiYXNlU3RhdHVzPy5maWxlcz8ubGVuZ3RoID8/IDAgOiBmaWxlcy5sZW5ndGhcbiAgY29uc3Qgc3RhZ2VkQ291bnQgPSBzdGFnZWRGaWxlcy5sZW5ndGhcbiAgLy8gTk9URTogaG9va3MgbXVzdCBhbGwgcnVuIGJlZm9yZSB0aGUgZWFybHkgcmV0dXJuIGJlbG93IChSZWFjdCBob29rIG9yZGVyKS5cbiAgY29uc3Qgc3RhZ2VkVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZShzdGFnZWRGaWxlcywgKGYpID0+IGYucGF0aCksIFtzdGFnZWRGaWxlc10pXG4gIGNvbnN0IHVuc3RhZ2VkVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZSh1bnN0YWdlZEZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3Vuc3RhZ2VkRmlsZXNdKVxuICBjb25zdCBzY29wZVRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc2NvcGVGaWxlcywgKGYpID0+IGYucGF0aCksIFtzY29wZUZpbGVzXSlcbiAgY29uc3QgY29tbWl0RmlsZXNUcmVlID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoY29tbWl0RGlmZj8ub2sgPyBidWlsZEZpbGVUcmVlKGNvbW1pdERpZmYuZmlsZXMsIChmKSA9PiBmLnBhdGgpIDogW10pLFxuICAgIFtjb21taXREaWZmXSxcbiAgKVxuXG4gIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8ICFjd2QpIHJldHVybiBudWxsXG5cbiAgY29uc3Qgc2VsZWN0ZWRGaWxlID0gc2NvcGVGaWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IHNlbGVjdGVkKSA/PyBudWxsXG4gIGNvbnN0IHRvdGFsQWRkZWQgPSBmaWxlcy5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLmFkZGVkLCAwKVxuICBjb25zdCB0b3RhbERlbGV0ZWQgPSBmaWxlcy5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLmRlbGV0ZWQsIDApXG5cbiAgLy8gQ29tbWl0LWRldGFpbCB2aWV3OiB0aGUgc2VsZWN0ZWQgZmlsZSB3aXRoaW4gdGhlIHNlbGVjdGVkIGNvbW1pdC5cbiAgY29uc3QgY29tbWl0U2VnbWVudHMgPSBjb21taXREaWZmPy5vayA/IHNwbGl0Q29tbWl0RGlmZihjb21taXREaWZmLmRpZmYpIDogW11cbiAgY29uc3QgY29tbWl0QWN0aXZlRmlsZSA9IHNlbGVjdGVkQ29tbWl0ICYmIGNvbW1pdERpZmY/Lm9rID8gY29tbWl0RGlmZi5maWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IHNlbGVjdGVkQ29tbWl0RmlsZSkgPz8gbnVsbCA6IG51bGxcbiAgY29uc3QgY29tbWl0QWN0aXZlVGV4dCA9IGNvbW1pdEFjdGl2ZUZpbGVcbiAgICA/IGNvbW1pdFNlZ21lbnRzLmZpbmQoKHMpID0+IHMucGF0aCA9PT0gY29tbWl0QWN0aXZlRmlsZS5wYXRoKT8udGV4dCA/PyBjb21taXREaWZmPy5kaWZmID8/ICcnXG4gICAgOiBjb21taXREaWZmPy5kaWZmID8/ICcnXG5cbiAgLyoqIExlYWYgcm93IHNoYXJlZCBieSB0aGUgc3RhZ2VkL3Vuc3RhZ2VkIGZpbGUgdHJlZXMuICovXG4gIGNvbnN0IHdvcmtzcGFjZUxlYWYgPSAoeyBpdGVtOiBmaWxlLCBuYW1lIH06IHsgaXRlbTogRGlmZkZpbGU7IG5hbWU6IHN0cmluZyB9KSA9PiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgIGFyaWEtc2VsZWN0ZWQ9e2ZpbGUucGF0aCA9PT0gc2VsZWN0ZWR9XG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2ZpbGUucGF0aCA9PT0gc2VsZWN0ZWQgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZChmaWxlLnBhdGgpXG4gICAgICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgICBzZXRDb21tZW50UG9wb3ZlcihudWxsKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWNoaXAgJHtjaGlwQ2xhc3MoZmlsZS5zdGF0dXMpfWB9PntmaWxlLnVudHJhY2tlZCA/ICc/PycgOiBmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1zdGF0XCI+XG4gICAgICAgIHtmaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogZmlsZS5hZGRlZCwgZGVsZXRlZDogZmlsZS5kZWxldGVkIH0pfVxuICAgICAgPC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG5cbiAgY29uc3QgcnVuQXBwbHkgPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoPzogc3RyaW5nKSA9PiB7XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlDaGFuZ2VzKGFjdGl2ZUN3ZCA/PyBjd2QgPz8gJycsIGFjdGlvbiwgcGF0aClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgY29uc3QgdmVyYiA9IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IGFjdGlvbiA9PT0gJ3Vuc3RhZ2UnID8gdCgncmV2aWV3LnVuc3RhZ2VkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKVxuICAgICAgICBzZXROb3RpY2Uoe1xuICAgICAgICAgIGtpbmQ6ICdvaycsXG4gICAgICAgICAgdGV4dDogcGF0aFxuICAgICAgICAgICAgPyB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiB2ZXJiLCBwYXRoIH0pXG4gICAgICAgICAgICA6IHJlc3VsdC5kZWxldGVkICYmIHJlc3VsdC5kZWxldGVkLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgPyB0KCdyZXZpZXcuZG9uZURlbGV0ZWQnLCB7IGFjdGlvbjogdmVyYiwgY291bnQ6IGZpbGVzLmxlbmd0aCwgZGVsZXRlZDogcmVzdWx0LmRlbGV0ZWQubGVuZ3RoIH0pXG4gICAgICAgICAgICAgIDogdCgncmV2aWV3LmRvbmUnLCB7IGFjdGlvbjogdmVyYiwgY291bnQ6IGZpbGVzLmxlbmd0aCB9KSxcbiAgICAgICAgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uRmlsZUFjdGlvbiA9IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg6IHN0cmluZykgPT4ge1xuICAgIGlmIChhY3Rpb24gPT09ICdyZXZlcnQnICYmIGNvbmZpcm0gIT09ICdmaWxlJykge1xuICAgICAgc2V0Q29uZmlybSgnZmlsZScpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAnZmlsZScgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uLCBwYXRoKVxuICB9XG5cbiAgY29uc3Qgb25BbGxBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnKSA9PiB7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ3JldmVydCcgJiYgY29uZmlybSAhPT0gJ2FsbCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ2FsbCcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAnYWxsJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCBydW5BcHBseShhY3Rpb24pXG4gIH1cblxuICAvKiogQXBwbHkgb25lIGh1bmsgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkgb2YgdGhlIHNlbGVjdGVkIGZpbGUuICovXG4gIGNvbnN0IG9uSHVua0FjdGlvbiA9IGFzeW5jIChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IERpZmZIdW5rKSA9PiB7XG4gICAgaWYgKCFzZWxlY3RlZEZpbGUgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcHBseUh1bmsoYWN0aXZlQ3dkID8/IGN3ZCA/PyAnJywgc2VsZWN0ZWRGaWxlLnBhdGgsIGFjdGlvbiwgaHVuay50ZXh0KVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBjb25zdCB2ZXJiID0gYWN0aW9uID09PSAnYWNjZXB0JyA/IHQoJ3Jldmlldy5hY2NlcHRlZCcpIDogYWN0aW9uID09PSAndW5zdGFnZScgPyB0KCdyZXZpZXcudW5zdGFnZWQnKSA6IHQoJ3Jldmlldy5yZXZlcnRlZCcpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5kb25lT25lJywgeyBhY3Rpb246IHZlcmIsIHBhdGg6IHNlbGVjdGVkRmlsZS5wYXRoIH0pIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIGlubGluZSBjb21tZW50cyAtLS0tXG4gIGNvbnN0IG9wZW5Db21tZW50ID0gKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuXG4gICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmUsIG5ld0xpbmUgfSlcbiAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICBzZXRDb21tZW50UG9wb3ZlcihudWxsKVxuICB9XG5cbiAgY29uc3Qgc2F2ZUNvbW1lbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFzZWxlY3RlZEZpbGUgfHwgIWNvbW1lbnRFZGl0b3IgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgdGV4dCA9IGNvbW1lbnRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCkgcmV0dXJuXG4gICAgY29uc3QgY29tbWVudDogUmV2aWV3Q29tbWVudCA9IHtcbiAgICAgIGlkOiB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8ucmFuZG9tVVVJRCA/IGNyeXB0by5yYW5kb21VVUlEKCkgOiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpfWAsXG4gICAgICBwYXRoOiBzZWxlY3RlZEZpbGUucGF0aCxcbiAgICAgIGxpbmVOZXc6IGNvbW1lbnRFZGl0b3IubmV3TGluZSxcbiAgICAgIGxpbmVPbGQ6IGNvbW1lbnRFZGl0b3Iub2xkTGluZSxcbiAgICAgIHRleHQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBuZXh0ID0gWy4uLmNvbW1lbnRzLCBjb21tZW50XVxuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ2NvbW1lbnQuc2F2ZWQnKSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBjYW5jZWxDb21tZW50ID0gKCkgPT4ge1xuICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgfVxuXG4gIGNvbnN0IGRlbGV0ZUNvbW1lbnQgPSBhc3luYyAoaWQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjLmlkICE9PSBpZClcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIEFJIHJldmlldyAoL3Jldmlldyk6IHJ1biwgcmUtcnVuLCBhbmQgaGFuZCBmaW5kaW5ncyB0byB0aGUgYWdlbnQgLS0tLVxuICBjb25zdCBvblJldmlldyA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCByZXZpZXdpbmcgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0UmV2aWV3aW5nKHRydWUpXG4gICAgc2V0UmV2aWV3KG51bGwpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldmlld1Njb3BlID0gc2NvcGUgPT09ICdicmFuY2gnID8gJ2JyYW5jaCcgOiBzY29wZSA9PT0gJ2NvbW1pdCcgJiYgc2VsZWN0ZWRDb21taXQgPyAnY29tbWl0JyA6ICd1bmNvbW1pdHRlZCdcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1blJldmlldyhhY3RpdmVDd2QsIGN1cnJlbnRJZCA/PyBudWxsLCByZXZpZXdTY29wZSwgYmFzZUJyYW5jaCA/PyB1bmRlZmluZWQsIHNlbGVjdGVkQ29tbWl0Py5oYXNoID8/IHVuZGVmaW5lZClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0UmV2aWV3KHJlc3VsdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0UmV2aWV3aW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21wb3NlIGEgXCJzZW5kIHRvIGFnZW50XCIgbWVzc2FnZSBmcm9tIGZpbmRpbmdzIG9yIFBSIGNvbW1lbnRzLiAqL1xuICBjb25zdCBjb21wb3NlRmluZGluZ3NNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0ZpbmRpbmdbXT4oKVxuICAgIGZvciAoY29uc3QgZiBvZiByZXZpZXc/LmZpbmRpbmdzID8/IFtdKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChmLmZpbGUpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGYpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoZi5maWxlLCBbZl0pXG4gICAgfVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFsnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCIEFJIFx1OEJDNFx1NUJBMVx1NTNEMVx1NzNCMFx1RkYwOEFkZHJlc3MgdGhlIHJldmlldyBmaW5kaW5nc1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsICcnXVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCByYW5nZSA9IGYubGluZVN0YXJ0ID09PSBmLmxpbmVFbmQgPyBgOiR7Zi5saW5lU3RhcnR9YCA6IGA6JHtmLmxpbmVTdGFydH0tJHtmLmxpbmVFbmR9YFxuICAgICAgICBsaW5lcy5wdXNoKGAtIFske2YucHJpb3JpdHl9XSAke3BhdGh9JHtyYW5nZX06ICR7Zi50aXRsZX0gXHUyMDE0ICR7Zi5kZXRhaWx9YClcbiAgICAgICAgaWYgKGYuc3VnZ2VzdGlvbikgbGluZXMucHVzaChgICBcXGBcXGBcXGBcXG4ke2Yuc3VnZ2VzdGlvbn1cXG4gIFxcYFxcYFxcYGApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IGNvbXBvc2VQck1lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoIXByPy5wciB8fCBwci5jb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtgXHU4QkY3XHU1OTA0XHU3NDA2IFBSICMke3ByLnByLm51bWJlcn1cdUZGMDgke3ByLnByLnRpdGxlfVx1RkYwOVx1NzY4NFx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIFBSIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBYCwgJyddXG4gICAgZm9yIChjb25zdCBjIG9mIHByLmNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBhbmNob3IgPSBjLnBhdGggPyBgJHtjLnBhdGh9JHtjLmxpbmUgPyBgOiR7Yy5saW5lfWAgOiAnJ31gIDogJ2dlbmVyYWwnXG4gICAgICBsaW5lcy5wdXNoKGAtICR7YW5jaG9yfSAoJHtjLmF1dGhvcn0pOiAke2MuYm9keX1gKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWxXaXRoID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgIHNldFNlbmRUZXh0KHRleHQpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIC8vIC0tLS0gZWRpdG9yIGludGVncmF0aW9uICh2aWEgZHNoLXBsdWdpbi1vcGVuLWVkaXRvcikgLS0tLVxuICBjb25zdCBvcGVuRmlsZSA9IGFzeW5jIChwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCBidXN5KSByZXR1cm5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvcGVuSW5FZGl0b3IoYWN0aXZlQ3dkLCBwYXRoLCBsaW5lKVxuICAgIGlmICghcmVzdWx0Lm9rKSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBgJHt0KCdlZGl0b3IuZmFpbGVkJyl9OiAke3Jlc3VsdC5lcnJvciA/PyAnJ31gIH0pXG4gIH1cblxuICAvKiogSnVtcCBmcm9tIGEgUFIgY29tbWVudCB0byB0aGUgZmlsZSAoYW5kIGhpZ2hsaWdodCB0aGUgbGluZSkuICovXG4gIGNvbnN0IG9uUHJDb21tZW50Q2xpY2sgPSAocGF0aDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCwgbGluZTogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuICAgIGlmIChwYXRoKSBqdW1wVG8ocGF0aCwgbGluZSA/PyB1bmRlZmluZWQpXG4gICAgZWxzZSBzZXRKdW1wTGluZShudWxsKVxuICB9XG5cbiAgLy8gLS0tLSBmZWVkYmFjayBsb29wOiBjb21tZW50cyBcdTIxOTIgYWdlbnQgKHByb21wdCBpbmplY3Rpb24sIGNvcHkgZmFsbGJhY2spIC0tLS1cbiAgY29uc3QgY29tcG9zZVJldmlld01lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoY29tbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUmV2aWV3Q29tbWVudFtdPigpXG4gICAgZm9yIChjb25zdCBjIG9mIGNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChjLnBhdGgpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGMpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoYy5wYXRoLCBbY10pXG4gICAgfVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtcbiAgICAgICdcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLFxuICAgICAgJycsXG4gICAgXVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGMgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCBhbmNob3IgPSBjLmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Yy5saW5lTmV3fWAgOiBgIChvbGQgbGluZSAke2MubGluZU9sZH0pYFxuICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGF0aH0ke2FuY2hvcn06ICR7Yy50ZXh0fWApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0U2VuZFRleHQoY29tcG9zZVJldmlld01lc3NhZ2UoKSlcbiAgICBzZXRTZW5kT3Blbih0cnVlKVxuICB9XG5cbiAgY29uc3Qgc2VuZFRvQWdlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdGV4dCA9IHNlbmRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBhd2FpdCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIGN1cnJlbnRJZCA/PyBudWxsLCB0ZXh0KVxuICAgICAgc2V0U2VuZE9wZW4oZmFsc2UpXG4gICAgICBpZiAob3V0Y29tZSA9PT0gJ3NlbnQnKSBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuc2VudFRvQWdlbnQnKSB9KVxuICAgICAgZWxzZSBpZiAob3V0Y29tZSA9PT0gJ2NvcGllZCcpIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KVxuICAgICAgZWxzZSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdyZXZpZXcuY29weUZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIENvbW1pdCB0aGUgc3RhZ2VkIGNoYW5nZXMgd2l0aCB0aGUgZW50ZXJlZCBtZXNzYWdlLiAqL1xuICBjb25zdCBvbkNvbW1pdCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0gY29tbWl0TWVzc2FnZS50cmltKClcbiAgICBpZiAoIW1lc3NhZ2UgfHwgYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAnY29tbWl0JywgbWVzc2FnZSlcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0Q29tbWl0TWVzc2FnZSgnJylcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHJlc3VsdC5oYXNoID8gYCR7cmVzdWx0Lmhhc2h9ICR7cmVzdWx0LnN1YmplY3QgPz8gJyd9YC50cmltKCkgOiAocmVzdWx0LnN1YmplY3QgPz8gJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb21taXR0ZWQnLCB7IHN1bW1hcnkgfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBQdXNoIHRoZSBjdXJyZW50IGJyYW5jaCAoZG91YmxlLWNsaWNrIHRvIGNvbmZpcm0pLiAqL1xuICBjb25zdCBvblB1c2ggPSAoKSA9PiB7XG4gICAgaWYgKGJ1c3kgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKGNvbmZpcm0gIT09ICdwdXNoJykge1xuICAgICAgc2V0Q29uZmlybSgncHVzaCcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAncHVzaCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgIHNldEJ1c3kodHJ1ZSlcbiAgICAgIHNldE5vdGljZShudWxsKVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuR2l0QWN0aW9uKGFjdGl2ZUN3ZCwgJ3B1c2gnKVxuICAgICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LnB1c2hlZCcpIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5wdXNoRmFpbGVkJykgfSlcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5wdXNoRmFpbGVkJykgfSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgICB9XG4gICAgfSkoKVxuICB9XG5cbiAgLyoqIFNlbGVjdCBhIGxvY2FsIGNvbW1pdCBhbmQgbG9hZCBpdHMgZGlmZiBpbnRvIHRoZSByaWdodCBwYW5lLiAqL1xuICBjb25zdCBzZWxlY3RDb21taXQgPSAoY29tbWl0OiBDb21taXRJbmZvKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QpIHJldHVyblxuICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgc2V0U2VsZWN0ZWRDb21taXQoY29tbWl0KVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZkxvYWRpbmcodHJ1ZSlcbiAgICB2b2lkIGxvYWRDb21taXREaWZmKGFjdGl2ZUN3ZCwgY29tbWl0Lmhhc2gpXG4gICAgICAudGhlbigoZCkgPT4ge1xuICAgICAgICBzZXRDb21taXREaWZmKGQpXG4gICAgICAgIHNldENvbW1pdERpZmZMb2FkaW5nKGZhbHNlKVxuICAgICAgICAvLyBEZWZhdWx0IHRoZSBmaWxlIHRyZWUgdG8gdGhlIGZpcnN0IGNoYW5nZWQgZmlsZS5cbiAgICAgICAgaWYgKGQub2sgJiYgZC5maWxlcy5sZW5ndGggPiAwKSBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZC5maWxlc1swXS5wYXRoKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSkpXG4gIH1cblxuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cImRzZHItb3ZlcmxheVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3VycmVudFRhcmdldCkgY2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItcGFuZWxcIlxuICAgICAgICByb2xlPVwiZGlhbG9nXCJcbiAgICAgICAgYXJpYS1tb2RhbD1cInRydWVcIlxuICAgICAgICBhcmlhLWxhYmVsPXt0KCdyZXZpZXcudGl0bGUnKX1cbiAgICAgICAgc3R5bGU9e3sgd2lkdGg6IGAke3ByZWZzLndpZHRofXB4YCwgaGVpZ2h0OiBgJHtwcmVmcy5oZWlnaHR9cHhgLCAuLi5kaWZmU3R5bGVWYXJzKHByZWZzKSB9IGFzIENTU1Byb3BlcnRpZXN9XG4gICAgICA+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwiZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNcIlxuICAgICAgICAgIG9uUmVzaXplPXsoX2R4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNlXCJcbiAgICAgICAgICBvblJlc2l6ZT17KGR4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgICAgZC5oZWlnaHQgPSBNYXRoLm1heChNSU5fUEFORUxfSCwgTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gNjQsIGQuaGVpZ2h0ICsgZHkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1oZWFkZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRpdGxlXCI+e3QoJ3Jldmlldy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRhYnNcIiByb2xlPVwidGFibGlzdFwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfT5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0YWIgPT09ICdzZXNzaW9uJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3Nlc3Npb24nID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VGFiKCdzZXNzaW9uJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0KCd0YWIuc2Vzc2lvbicpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGFiID09PSAnd29ya3NwYWNlJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3dvcmtzcGFjZScgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3dvcmtzcGFjZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dCgndGFiLndvcmtzcGFjZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnICYmIHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zY29wZVwiPlxuICAgICAgICAgICAgICB7cmVwb3MubGVuZ3RoID4gMSA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgncmVwby5sYWJlbCcpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlcG9QYXRoID8/IGFjdGl2ZUN3ZCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e3JlcG9zLm1hcCgocikgPT4gKHsgdmFsdWU6IHIucGF0aCwgbGFiZWw6IGAke2Jhc2VOYW1lKHIucGF0aCl9JHtyLmJyYW5jaCA/IGAgKCR7ci5icmFuY2h9KWAgOiAnJ31gIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRSZXBvUGF0aCh2KVxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgICAgICAgICAgICAgICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUubGFiZWwnKX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2NvcGV9XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17U0NPUEVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBzLmlkLCBsYWJlbDogdChzLmxhYmVsKSB9KSl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRTY29wZSh2IGFzIFdvcmtzcGFjZVNjb3BlKVxuICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdzY29wZS5iYXNlJyl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YmFzZUJyYW5jaCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2JyYW5jaGVzLm1hcCgoYikgPT4gKHsgdmFsdWU6IGIsIGxhYmVsOiBiIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRCYXNlQnJhbmNofVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3VidGl0bGVcIj5cbiAgICAgICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJ1xuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5zZXNzaW9uU3RhdHMnLCB7IHJvdW5kczogcm91bmRzLmxlbmd0aCwgZmlsZXM6IHRvdGFsU2Vzc2lvbkZpbGVzIH0pXG4gICAgICAgICAgICAgIDogc3RhdHVzPy5pc1JlcG9cbiAgICAgICAgICAgICAgICA/IGAke3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9IFx1MDBCNyAke3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogdG90YWxBZGRlZCwgZGVsZXRlZDogdG90YWxEZWxldGVkIH0pfSR7c3RhdHVzLmFoZWFkID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmFoZWFkJywgeyBuOiBzdGF0dXMuYWhlYWQgfSl9YCA6ICcnfSR7c3RhdHVzLmJlaGluZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9YCA6ICcnfWBcbiAgICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5ub3RSZXBvJyl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBhbGxvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfSBvbkNsaWNrPXsoKSA9PiBvbkFsbEFjdGlvbignYWNjZXB0Jyl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c3RhZ2VkQ291bnQgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgcnVuQXBwbHkoJ3Vuc3RhZ2UnKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnVuc3RhZ2VBbGwnKX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXIke2NvbmZpcm0gPT09ICdhbGwnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQWxsQWN0aW9uKCdyZXZlcnQnKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnYWxsJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJykgOiB0KCdyZXZpZXcucmV2ZXJ0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtjb21taXRNZXNzYWdlfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0KCdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRDb21taXRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHZvaWQgb25Db21taXQoKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3kgfHwgIWNvbW1pdE1lc3NhZ2UudHJpbSgpIHx8IHN0YWdlZENvdW50ID09PSAwfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9uQ29tbWl0KCl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29tbWl0Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3RhYiA9PT0gJ3dvcmtzcGFjZScgJiYgc3RhdHVzPy5pc1JlcG8gJiYgcmV2aWV3YWJsZUZpbGVzID4gMCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCByZXZpZXdpbmd9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHZvaWQgb25SZXZpZXcoKX1cbiAgICAgICAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5yZXZpZXdTY29wZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7cmV2aWV3aW5nID8gdCgncmV2aWV3LnJldmlld2luZycpIDogdCgncmV2aWV3LnJldmlldycpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3RhYiA9PT0gJ3dvcmtzcGFjZScgJiYgc3RhdHVzPy5pc1JlcG8gJiYgY29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9e29wZW5TZW5kUGFuZWx9PlxuICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRUb0FnZW50Jyl9ICh7Y29tbWVudHMubGVuZ3RofSlcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgYXJpYS1sYWJlbD17dCgncmV2aWV3LmNsb3NlJyl9IG9uQ2xpY2s9e2Nsb3NlfT5cbiAgICAgICAgICAgIDxJY29uWCAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7c2VuZE9wZW4gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbmRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VuZC10aXRsZVwiPnt0KCdyZXZpZXcuc2VuZFRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLWhpbnRcIj57dCgncmV2aWV3LnNlbmRIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzTmFtZT1cImRzZHItc2VuZC1pbnB1dFwiIHJlYWRPbmx5IHZhbHVlPXtzZW5kVGV4dH0gc3BlbGxDaGVjaz17ZmFsc2V9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHNldFNlbmRPcGVuKGZhbHNlKX0+XG4gICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG5cIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHZvaWQgbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KHNlbmRUZXh0KS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSksXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ3Jldmlldy5jb3B5RmFpbGVkJykgfSksXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29weScpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8ICFzZW5kVGV4dC50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc2VuZFRvQWdlbnQoKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5zZW5kVG9BZ2VudCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiByZXZpZXc/Lm9rICYmIHJldmlld2FibGVGaWxlcyA+IDAgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctc3RyaXBcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnZHNkci1yZXZpZXctYmFkJyA6ICdkc2RyLXJldmlldy1vayd9PlxuICAgICAgICAgICAgICAgIHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyB0KCdyZXZpZXcudmVyZGljdEluY29ycmVjdCcpIDogdCgncmV2aWV3LnZlcmRpY3RDb3JyZWN0Jyl9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1yZXZpZXctdG9nZ2xlJHtmaW5kaW5nc09wZW4gPyAnIGRzZHItcmV2aWV3LXRvZ2dsZS1vbicgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmluZGluZ3NPcGVuKCh2KSA9PiAhdil9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5maW5kaW5ncycsIHsgbjogcmV2aWV3LmZpbmRpbmdzLmxlbmd0aCB9KX1cbiAgICAgICAgICAgICAgICAgIHtyZXZpZXcudHJ1bmNhdGVkID8gJyAodHJ1bmNhdGVkKScgOiAnJ31cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcubm9GaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAge3Jldmlldy5tb2RlbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LW1vZGVsXCI+e3Jldmlldy5tb2RlbC5wcm92aWRlcn0ve3Jldmlldy5tb2RlbC5tb2RlbH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb3BlblNlbmRQYW5lbFdpdGgoY29tcG9zZUZpbmRpbmdzTWVzc2FnZSgpKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRGaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2ZpbmRpbmdzT3BlbiAmJiByZXZpZXcuZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmdzXCI+XG4gICAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5tYXAoKGZpbmRpbmcsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAga2V5PXtgJHtmaW5kaW5nLmZpbGV9OiR7ZmluZGluZy5saW5lU3RhcnR9LSR7ZmluZGluZy5saW5lRW5kfToke2l9YH1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1pdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ganVtcFRvKGZpbmRpbmcuZmlsZSwgZmluZGluZy5saW5lU3RhcnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmcucHJpb3JpdHl9YH0+e2ZpbmRpbmcucHJpb3JpdHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcudGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctbG9jXCI+e2ZpbmRpbmcuZmlsZX06e2ZpbmRpbmcubGluZVN0YXJ0fXtmaW5kaW5nLmxpbmVFbmQgIT09IGZpbmRpbmcubGluZVN0YXJ0ID8gYC0ke2ZpbmRpbmcubGluZUVuZH1gIDogJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZy5kZXRhaWwgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctZGV0YWlsXCI+e2ZpbmRpbmcuZGV0YWlsfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNvbmZpZGVuY2UnLCB7IGNvbmZpZGVuY2U6IGZpbmRpbmcuY29uZmlkZW5jZS50b0ZpeGVkKDIpIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcuc3VnZ2VzdGlvbiA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LnN1Z2dlc3Rpb24nKX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nLnN1Z2dlc3Rpb24gPyA8Y29kZSBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctc3VnZ2VzdGlvblwiPntmaW5kaW5nLnN1Z2dlc3Rpb259PC9jb2RlPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnc2Vzc2lvbicgPyAoXG4gICAgICAgICAgcm91bmRzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfTwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYm9keVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi5zZXNzaW9uJyl9PlxuICAgICAgICAgICAgICAgIHtyb3VuZHMubWFwKChyb3VuZCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JvdW5kLnJvdW5kfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5yb3VuZCcsIHsgcm91bmQ6IHJvdW5kLnJvdW5kIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIHtyb3VuZC5sYWJlbCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yb3VuZC1sYWJlbFwiIHRpdGxlPXtyb3VuZC5sYWJlbH0+e3JvdW5kLmxhYmVsfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Nlc3Npb25UcmVlcy5nZXQocm91bmQucm91bmQpID8/IFtdfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9eyh7IGl0ZW06IGNoYW5nZSwgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtyb3VuZC5yb3VuZH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZEtleSA9IHNlbGVjdGVkQ2hhbmdlID8gYCR7c2VsZWN0ZWRSb3VuZH06JHtzZWxlY3RlZENoYW5nZS5wYXRofWAgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17a2V5ID09PSBzZWxlY3RlZEtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2tleSA9PT0gc2VsZWN0ZWRLZXkgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmQucm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZFBhdGgoY2hhbmdlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoYW5nZS5oYXNEaWZmID8gJ2RzZHItY2hpcC1tJyA6ICdkc2RyLWNoaXAtdSd9YH0+e2NoYW5nZS5oYXNEaWZmID8gJ00nIDogJ1x1MDBCNyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2NoYW5nZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCIgdGl0bGU9e2NoYW5nZS50b29sfT57Y2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZlwiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZSA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENoYW5nZS5wYXRofT57c2VsZWN0ZWRDaGFuZ2UucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCI+e3NlbGVjdGVkQ2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UuaGFzRGlmZiA/IChcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID09PSAnc3BsaXQnICYmIGNoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2NoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKX0gYmVmb3JlTGFiZWw9e3QoJ3ZpZXcuYmVmb3JlJyl9IGFmdGVyTGFiZWw9e3QoJ3ZpZXcuYWZ0ZXInKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hhbmdlUm93cyhzZWxlY3RlZENoYW5nZSkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdyZXZpZXcubm9EaWZmRGF0YScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgICkgOiBlcnJvciAmJiAhc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgICA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi53b3Jrc3BhY2UnKX0+XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2FsbCcgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIHtzdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIHt1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXt1bnN0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICd1bnN0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgdW5zdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdzdGFnZWQnID8gKFxuICAgICAgICAgICAgICAgIHN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvblN0YWdlZCcpfSAoe3N0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIHNjb3BlRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Njb3BlLmJyYW5jaCcpfSB7YmFzZUJyYW5jaCA/IGBcdTIxOTQgJHtiYXNlQnJhbmNofWAgOiAnJ30gKHtzY29wZUZpbGVzLmxlbmd0aH0pXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Njb3BlLmJyYW5jaFJlYWRvbmx5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2xhc3QtdHVybicgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgnc2NvcGUubGFzdC10dXJuJyl9ICh7c2NvcGVGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Njb3BlVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubGFzdFR1cm5FbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHsoc2NvcGUgPT09ICdhbGwnIHx8IHNjb3BlID09PSAnY29tbWl0JykgJiYgaGlzdG9yeS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuaGlzdG9yeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRpbWVsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIHtoaXN0b3J5Lm1hcCgoY29tbWl0KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGwtaXRlbSR7c2VsZWN0ZWRDb21taXQ/Lmhhc2ggPT09IGNvbW1pdC5oYXNoID8gJyBkc2RyLXRsLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRsLXJhaWxcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci10bC1kb3Qke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1kb3QtbG9jYWwnIDogJyBkc2RyLXRsLWRvdC1yZW1vdGUnfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2h9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0Q29tbWl0KGNvbW1pdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWJhZGdlJHtjb21taXQuYWhlYWQgPyAnIGRzZHItdGwtYmFkZ2UtbG9jYWwnIDogJyBkc2RyLXRsLWJhZGdlLXJlbW90ZSd9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWl0LmFoZWFkID8gdCgnaGlzdG9yeS5sb2NhbCcpIDogdCgnaGlzdG9yeS5yZW1vdGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtc2hvcnRcIj57Y29tbWl0LnNob3J0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zdWJqZWN0XCIgdGl0bGU9e2NvbW1pdC5zdWJqZWN0fT57Y29tbWl0LnN1YmplY3R9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LW1ldGFcIj57Y29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoY29tbWl0LmRhdGUsIHQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayAmJiBjb21taXREaWZmLmZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5jb21taXRGaWxlcycpfSAoe2NvbW1pdERpZmYuZmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgbm9kZXM9e2NvbW1pdEZpbGVzVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogZmlsZSwgbmFtZSB9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtzZWxlY3RlZENvbW1pdEZpbGUgPT09IGZpbGUucGF0aCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNoaXAgZHNkci1jaGlwLW1cIj57ZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25CcmFuY2gnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1icmFuY2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtcmVmXCIgdGl0bGU9e3N0YXR1cy51cHN0cmVhbSA/PyB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFycm93XCI+XHUyMTkyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMudXBzdHJlYW0gPz8gdCgncmV2aWV3Lm5vVXBzdHJlYW0nKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5haGVhZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1haGVhZFwiPnt0KCdyZXZpZXcuYWhlYWQnLCB7IG46IHN0YXR1cy5haGVhZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmJlaGluZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1iZWhpbmRcIj57dCgncmV2aWV3LmJlaGluZCcsIHsgbjogc3RhdHVzLmJlaGluZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID09PSAwICYmIHN0YXR1cy5iZWhpbmQgPT09IDAgJiYgc3RhdHVzLnVwc3RyZWFtID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtc3luY1wiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biR7Y29uZmlybSA9PT0gJ3B1c2gnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgKHN0YXR1cz8uYWhlYWQgPz8gMCkgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25QdXNofVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdwdXNoJyA/IHQoJ3Jldmlldy5jb25maXJtUHVzaCcpIDogYCR7dCgncmV2aWV3LnB1c2gnKX0keyhzdGF0dXM/LmFoZWFkID8/IDApID4gMCA/IGAgKCR7c3RhdHVzPy5haGVhZCA/PyAwfSlgIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtwcj8ucHIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci50aXRsZScsIHsgbnVtYmVyOiBwci5wci5udW1iZXIgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IGAgXHUwMEI3ICR7dCgncHIuY29tbWVudHMnLCB7IG46IHByLmNvbW1lbnRzLmxlbmd0aCB9KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXByXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdwci5ub1ByJyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXByLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUHJDb21tZW50Q2xpY2soY29tbWVudC5wYXRoLCBjb21tZW50LmxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudC5wYXRoID8gYCR7YmFzZU5hbWUoY29tbWVudC5wYXRoKX0ke2NvbW1lbnQubGluZSA/IGA6JHtjb21tZW50LmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCd9IFx1MDBCNyB7Y29tbWVudC5hdXRob3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcHItdGV4dFwiPntjb21tZW50LmJvZHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VQck1lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci5zZW5kQ29tbWVudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdCA/IChcbiAgICAgICAgICAgICAgICBjb21taXREaWZmTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKSA6IGNvbW1pdERpZmY/Lm9rID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGFzaFwiPntzZWxlY3RlZENvbW1pdC5zaG9ydH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdG9vbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoc2VsZWN0ZWRDb21taXQuZGF0ZSwgdCl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogY29tbWl0RGlmZi5hZGRlZCwgZGVsZXRlZDogY29tbWl0RGlmZi5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7Y29tbWl0QWN0aXZlRmlsZSA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17Y29tbWl0QWN0aXZlRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jaGlwIGRzZHItY2hpcC1tXCI+e2NvbW1pdEZpbGVTdGF0dXMoY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/ICcnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtcGF0aFwiPntjb21taXRBY3RpdmVGaWxlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmIGdpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2dpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Z2l0RGlmZlJvd3MoY29tbWl0QWN0aXZlVGV4dCkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57Y29tbWl0RGlmZj8uZXJyb3IgPz8gdCgncmV2aWV3Lm5vRGlmZkRhdGEnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBzZWxlY3RlZEZpbGUgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRGaWxlLnBhdGh9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLm9yaWdQYXRoID8gYCBcdTIxOTAgJHtzZWxlY3RlZEZpbGUub3JpZ1BhdGh9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBzZWxlY3RlZEZpbGUuYWRkZWQsIGRlbGV0ZWQ6IHNlbGVjdGVkRmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCl9IHRpdGxlPXt0KCdlZGl0b3Iub3BlbkZpbGUnKX0+XG4gICAgICAgICAgICAgICAgICAgICAgXHUyMTk3IHt0KCdlZGl0b3Iub3BlbkZpbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnVuc3RhZ2VkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdhY2NlcHQnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5hY2NlcHQnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3Vuc3RhZ2UnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy51bnN0YWdlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1idG4tZGFuZ2VyJHtjb25maXJtID09PSAnZmlsZScgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdyZXZlcnQnLCBzZWxlY3RlZEZpbGUucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdmaWxlJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0JykgOiB0KCdyZXZpZXcucmV2ZXJ0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7dmlldyA9PT0gJ3NwbGl0JyAmJiAhc2VsZWN0ZWRGaWxlLmJpbmFyeSAmJiBnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZikubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5iZWZvcmUnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5hZnRlcicpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZikubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgPyA8SHVua1Rvb2xiYXIgaHVuaz17c2VsZWN0ZWRGaWxlLmh1bmtzW2JpXX0gYnVzeT17YnVzeX0gb25BY3Rpb249e29uSHVua0FjdGlvbn0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93RmluZGluZ3MgPSAocmV2aWV3Py5maW5kaW5ncyA/PyBbXSkuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmLmZpbGUgPT09IHNlbGVjdGVkRmlsZS5wYXRoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA+PSBmLmxpbmVTdGFydCAmJiByb3cucmlnaHROdW0gPD0gZi5saW5lRW5kIDogcm93LmxlZnROdW0gIT09IG51bGwgJiYgcm93LmxlZnROdW0gPj0gZi5saW5lU3RhcnQgJiYgcm93LmxlZnROdW0gPD0gZi5saW5lRW5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdDbHMgPSByb3dGaW5kaW5ncy5sZW5ndGggPiAwID8gYCBkc2RyLWNlbGwtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGp1bXBlZCA9IGp1bXBMaW5lICE9IG51bGwgJiYgKHJvdy5yaWdodE51bSA9PT0ganVtcExpbmUgfHwgKHJvdy5yaWdodE51bSA9PT0gbnVsbCAmJiByb3cubGVmdE51bSA9PT0ganVtcExpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tbWVudCBhbmNob3JzIHN0YXkgY29uc2lzdGVudCB3aXRoIHRoZSB1bmlmaWVkIHZpZXc6IGN0eCByb3dzIGV4cG9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYm90aCBsaW5lIG51bWJlcnMsIGNoYW5nZSByb3dzIGV4cG9zZSB0aGUgc2lkZSB0aGV5IGJlbG9uZyB0by5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5sZWZ0TnVtLCBuZXdMaW5lOiByb3cua2luZCA9PT0gJ2N0eCcgJiYgcm93LmxlZnROdW0gIT09IG51bGwgPyByb3cubGVmdE51bSA6IG51bGwgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cucmlnaHROdW0gIT09IG51bGwgPyByb3cucmlnaHROdW0gOiBudWxsLCBuZXdMaW5lOiByb3cucmlnaHROdW0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEtleSA9IGAke2xlZnRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7bGVmdEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEtleSA9IGAke3JpZ2h0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke3JpZ2h0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgbGVmdEFuY2hvci5vbGRMaW5lLCBsZWZ0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgcmlnaHRBbmNob3Iub2xkTGluZSwgcmlnaHRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGVuQnRuID0gKGxpbmU6IG51bWJlcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxlLnBhdGggPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1vcGVubGluZVwiIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gYXJpYS1sYWJlbD17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRGaWxlLnBhdGgsIGxpbmUpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWVudEJ0biA9IChhbmNob3I6IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9LCBjb3VudDogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50TGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50PXtjb3VudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuPXtjb21tZW50UG9wb3ZlciA9PT0gYCR7YW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2FuY2hvci5uZXdMaW5lID8/ICduJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT3Blbj17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmU6IGFuY2hvci5vbGRMaW5lLCBuZXdMaW5lOiBhbmNob3IubmV3TGluZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50UG9wb3ZlcihudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldENvbW1lbnRQb3BvdmVyKChwcmV2KSA9PiAocHJldiA9PT0gYCR7YW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2FuY2hvci5uZXdMaW5lID8/ICduJ31gID8gbnVsbCA6IGAke2FuY2hvci5vbGRMaW5lID8/ICdvJ306JHthbmNob3IubmV3TGluZSA/PyAnbid9YCkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5sZWZ0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LmxlZnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5sZWZ0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dGaW5kaW5ncy5sZW5ndGggPiAwICYmIHJvdy5yaWdodE51bSA9PT0gbnVsbCA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gfT57cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKGxlZnRBbmNob3IsIGxlZnRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5yaWdodE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cucmlnaHROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9Pntyb3dGaW5kaW5nc1swXS5wcmlvcml0eX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsZWZ0Q29tbWVudHMubGVuZ3RoID4gMCAmJiBjb21tZW50UG9wb3ZlciA9PT0gbGVmdEtleSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXBvcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjb21tZW50LmlkfSBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtdGV4dFwiPntjb21tZW50LnRleHR9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjb21tZW50LnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGNvbW1lbnQuaWQpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5sZW5ndGggPiAwICYmIGNvbW1lbnRQb3BvdmVyID09PSByaWdodEtleSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXBvcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17Y29tbWVudC5pZH0gY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXRleHRcIj57Y29tbWVudC50ZXh0fTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Y29tbWVudC5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tZGFuZ2VyXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgZGVsZXRlQ29tbWVudChjb21tZW50LmlkKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuZGVsZXRlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgKGxlZnRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gIHx8IHJpZ2h0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPFVuaWZpZWREaWZmXG4gICAgICAgICAgICAgICAgICAgICAgZGlmZj17c2VsZWN0ZWRGaWxlLmRpZmZ9XG4gICAgICAgICAgICAgICAgICAgICAgaHVua3M9e3NlbGVjdGVkRmlsZS5odW5rc31cbiAgICAgICAgICAgICAgICAgICAgICBidXN5PXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgIG9uSHVua0FjdGlvbj17b25IdW5rQWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudHM9e2NvbW1lbnRzfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRFZGl0b3I9e2NvbW1lbnRFZGl0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFRleHQ9e2NvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tbWVudFRleHQ9e3NldENvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uT3BlbkNvbW1lbnQ9e29wZW5Db21tZW50fVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZUNvbW1lbnQ9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbENvbW1lbnQ9e2NhbmNlbENvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFBvcG92ZXI9e2NvbW1lbnRQb3BvdmVyfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlUG9wb3Zlcj17KGtleSkgPT4gc2V0Q29tbWVudFBvcG92ZXIoKHByZXYpID0+IChwcmV2ID09PSBrZXkgPyBudWxsIDoga2V5KSl9XG4gICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDb21tZW50PXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9XG4gICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk9eyFhbGxvd0FjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgcGF0aD17c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgcmV2aWV3RmluZGluZ3M9e3Jldmlldz8uZmluZGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuTGluZT17KHAsIGxpbmUpID0+IHZvaWQgb3BlbkZpbGUocCwgbGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAganVtcExpbmU9e2p1bXBMaW5lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntzY29wZSA9PT0gJ2NvbW1pdCcgPyB0KCdyZXZpZXcuc2VsZWN0Q29tbWl0JykgOiB0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yID8/IHQoJ3Jldmlldy5sb2FkRXJyb3InKX1cbiAgICAgICAgICAgIHshc3RhdHVzPy5pc1JlcG8gPyA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mb290XCI+XG4gICAgICAgICAgeyhsb2FkaW5nIHx8IGJ1c3kpICYmIHRhYiA9PT0gJ3dvcmtzcGFjZScgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwaW5uZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2J1c3kgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLW5vdGljZVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIHtub3RpY2UgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLW5vdGljZSBkc2RyLW5vdGljZS0ke25vdGljZS5raW5kfWB9Pntub3RpY2UudGV4dH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQ29uZmlnIGNhcmQgZm9yIHRoZSBQbHVnaW5zIGNvbmZpZ3VyYXRpb24gdGFiIChTZXR0aW5ncyBcdTIxOTIgUGx1Z2lucyBcdTIxOTIgXHU1M0VGXHU5MTREXHU3RjZFKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb25maWdDYXJkKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJkIGRzZHItY2ZnLWNhcmQtb3BlbicgOiAnZHNkci1jZmctY2FyZCd9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZFwiIGFyaWEtZXhwYW5kZWQ9e29wZW59IG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWhlYWQtdGV4dFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLW5hbWVcIj57dCgnc2V0dGluZ3MudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctZGVzY1wiPnt0KCdjb25maWcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93bk91dGxpbmUxNCBjbGFzc05hbWU9e29wZW4gPyAnZHNkci1jZmctY2FyZXQgZHNkci1jZmctY2FyZXQtb3BlbicgOiAnZHNkci1jZmctY2FyZXQnfSAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1ib2R5XCI+XG4gICAgICAgICAgPERpZmZSZXZpZXdQcmVmcyB0PXt0fSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbGk+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG4gIC8vIENvZGV4LXN0eWxlIHBlbmRpbmctY29tbWVudHMgYmFyIGFib3ZlIHRoZSBjb21wb3Nlci5cbiAgY3R4LnNsb3RzLmluamVjdCgnY29udmVyc2F0aW9uLmlucHV0LmRvY2snLCAoKSA9PlxuICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1jb21tZW50cy1kb2NrJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgICAgaW5qZWN0OiAoKSA9PiAoeyBzZXNzaW9uczogY3R4LnNlc3Npb25zIH0pLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdDb21wb3NlckRvY2ssXG4gICAgKSxcbiAgKVxuICAvLyBUaGUgcGx1Z2luJ3Mgb3duIHNldHRpbmdzIHRhYiBpbnNpZGUgXHU4QkJFXHU3RjZFIFx1MjE5MiBcdTYzRDJcdTRFRjYgKG5vdCB0aGUgR2VuZXJhbCBzZWN0aW9uKS5cbiAgLy8gVGhlIHBsdWdpbidzIHdob2xlIGNvbmZpZ3VyYXRpb24gbGl2ZXMgaW4gb25lIGNhcmQgaW5zaWRlXG4gIC8vIFx1OEJCRVx1N0Y2RSBcdTIxOTIgXHU2M0QyXHU0RUY2IFx1MjE5MiBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkUgKHNldHRpbmdzLnBsdWdpbi5pdGVtKTogZm9udC9zaXplLlxuICBjdHguc2xvdHMuaW5qZWN0KCdzZXR0aW5ncy5wbHVnaW4uaXRlbScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2V0dGluZ3MucGx1Z2luLml0ZW0nLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3LWNvbmZpZycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICB9LFxuICAgICAgRGlmZlJldmlld0NvbmZpZ0NhcmQsXG4gICAgKSxcbiAgKVxufVxuIiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmYge1xuICAgIGRpZmYob2xkU3RyLCBuZXdTdHIsIFxuICAgIC8vIFR5cGUgYmVsb3cgaXMgbm90IGFjY3VyYXRlL2NvbXBsZXRlIC0gc2VlIGFib3ZlIGZvciBmdWxsIHBvc3NpYmlsaXRpZXMgLSBidXQgaXQgY29tcGlsZXNcbiAgICBvcHRpb25zID0ge30pIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrO1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgnY2FsbGJhY2snIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaztcbiAgICAgICAgfVxuICAgICAgICAvLyBBbGxvdyBzdWJjbGFzc2VzIHRvIG1hc3NhZ2UgdGhlIGlucHV0IHByaW9yIHRvIHJ1bm5pbmdcbiAgICAgICAgY29uc3Qgb2xkU3RyaW5nID0gdGhpcy5jYXN0SW5wdXQob2xkU3RyLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgbmV3U3RyaW5nID0gdGhpcy5jYXN0SW5wdXQobmV3U3RyLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3Qgb2xkVG9rZW5zID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG9sZFN0cmluZywgb3B0aW9ucykpO1xuICAgICAgICBjb25zdCBuZXdUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUobmV3U3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spO1xuICAgIH1cbiAgICBkaWZmV2l0aE9wdGlvbnNPYmoob2xkVG9rZW5zLCBuZXdUb2tlbnMsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgZG9uZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnBvc3RQcm9jZXNzKHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBjYWxsYmFjayh2YWx1ZSk7IH0sIDApO1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IG5ld1Rva2Vucy5sZW5ndGgsIG9sZExlbiA9IG9sZFRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCBlZGl0TGVuZ3RoID0gMTtcbiAgICAgICAgbGV0IG1heEVkaXRMZW5ndGggPSBuZXdMZW4gKyBvbGRMZW47XG4gICAgICAgIGlmIChvcHRpb25zLm1heEVkaXRMZW5ndGggIT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4RWRpdExlbmd0aCA9IE1hdGgubWluKG1heEVkaXRMZW5ndGgsIG9wdGlvbnMubWF4RWRpdExlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4RXhlY3V0aW9uVGltZSA9IChfYSA9IG9wdGlvbnMudGltZW91dCkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogSW5maW5pdHk7XG4gICAgICAgIGNvbnN0IGFib3J0QWZ0ZXJUaW1lc3RhbXAgPSBEYXRlLm5vdygpICsgbWF4RXhlY3V0aW9uVGltZTtcbiAgICAgICAgY29uc3QgYmVzdFBhdGggPSBbeyBvbGRQb3M6IC0xLCBsYXN0Q29tcG9uZW50OiB1bmRlZmluZWQgfV07XG4gICAgICAgIC8vIFNlZWQgZWRpdExlbmd0aCA9IDAsIGkuZS4gdGhlIGNvbnRlbnQgc3RhcnRzIHdpdGggdGhlIHNhbWUgdmFsdWVzXG4gICAgICAgIGxldCBuZXdQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmVzdFBhdGhbMF0sIG5ld1Rva2Vucywgb2xkVG9rZW5zLCAwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKGJlc3RQYXRoWzBdLm9sZFBvcyArIDEgPj0gb2xkTGVuICYmIG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAvLyBJZGVudGl0eSBwZXIgdGhlIGVxdWFsaXR5IGFuZCB0b2tlbml6ZXJcbiAgICAgICAgICAgIHJldHVybiBkb25lKHRoaXMuYnVpbGRWYWx1ZXMoYmVzdFBhdGhbMF0ubGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmNlIHdlIGhpdCB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgZWRpdCBncmFwaCBvbiBzb21lIGRpYWdvbmFsIGssIHdlIGNhblxuICAgICAgICAvLyBkZWZpbml0ZWx5IHJlYWNoIHRoZSBlbmQgb2YgdGhlIGVkaXQgZ3JhcGggaW4gbm8gbW9yZSB0aGFuIGsgZWRpdHMsIHNvXG4gICAgICAgIC8vIHRoZXJlJ3Mgbm8gcG9pbnQgaW4gY29uc2lkZXJpbmcgYW55IG1vdmVzIHRvIGRpYWdvbmFsIGsrMSBhbnkgbW9yZSAoZnJvbVxuICAgICAgICAvLyB3aGljaCB3ZSdyZSBndWFyYW50ZWVkIHRvIG5lZWQgYXQgbGVhc3QgaysxIG1vcmUgZWRpdHMpLlxuICAgICAgICAvLyBTaW1pbGFybHksIG9uY2Ugd2UndmUgcmVhY2hlZCB0aGUgYm90dG9tIG9mIHRoZSBlZGl0IGdyYXBoLCB0aGVyZSdzIG5vXG4gICAgICAgIC8vIHBvaW50IGNvbnNpZGVyaW5nIG1vdmVzIHRvIGxvd2VyIGRpYWdvbmFscy5cbiAgICAgICAgLy8gV2UgcmVjb3JkIHRoaXMgZmFjdCBieSBzZXR0aW5nIG1pbkRpYWdvbmFsVG9Db25zaWRlciBhbmRcbiAgICAgICAgLy8gbWF4RGlhZ29uYWxUb0NvbnNpZGVyIHRvIHNvbWUgZmluaXRlIHZhbHVlIG9uY2Ugd2UndmUgaGl0IHRoZSBlZGdlIG9mXG4gICAgICAgIC8vIHRoZSBlZGl0IGdyYXBoLlxuICAgICAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBpcyBub3QgZmFpdGhmdWwgdG8gdGhlIG9yaWdpbmFsIGFsZ29yaXRobSBwcmVzZW50ZWQgaW5cbiAgICAgICAgLy8gTXllcnMncyBwYXBlciwgd2hpY2ggaW5zdGVhZCBwb2ludGxlc3NseSBleHRlbmRzIEQtcGF0aHMgb2ZmIHRoZSBlbmQgb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGggLSBzZWUgcGFnZSA3IG9mIE15ZXJzJ3MgcGFwZXIgd2hpY2ggbm90ZXMgdGhpcyBwb2ludFxuICAgICAgICAvLyBleHBsaWNpdGx5IGFuZCBpbGx1c3RyYXRlcyBpdCB3aXRoIGEgZGlhZ3JhbS4gVGhpcyBoYXMgbWFqb3IgcGVyZm9ybWFuY2VcbiAgICAgICAgLy8gaW1wbGljYXRpb25zIGZvciBzb21lIGNvbW1vbiBzY2VuYXJpb3MuIEZvciBpbnN0YW5jZSwgdG8gY29tcHV0ZSBhIGRpZmZcbiAgICAgICAgLy8gd2hlcmUgdGhlIG5ldyB0ZXh0IHNpbXBseSBhcHBlbmRzIGQgY2hhcmFjdGVycyBvbiB0aGUgZW5kIG9mIHRoZVxuICAgICAgICAvLyBvcmlnaW5hbCB0ZXh0IG9mIGxlbmd0aCBuLCB0aGUgdHJ1ZSBNeWVycyBhbGdvcml0aG0gd2lsbCB0YWtlIE8obitkXjIpXG4gICAgICAgIC8vIHRpbWUgd2hpbGUgdGhpcyBvcHRpbWl6YXRpb24gbmVlZHMgb25seSBPKG4rZCkgdGltZS5cbiAgICAgICAgbGV0IG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IC1JbmZpbml0eSwgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gSW5maW5pdHk7XG4gICAgICAgIC8vIE1haW4gd29ya2VyIG1ldGhvZC4gY2hlY2tzIGFsbCBwZXJtdXRhdGlvbnMgb2YgYSBnaXZlbiBlZGl0IGxlbmd0aCBmb3IgYWNjZXB0YW5jZS5cbiAgICAgICAgY29uc3QgZXhlY0VkaXRMZW5ndGggPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBkaWFnb25hbFBhdGggPSBNYXRoLm1heChtaW5EaWFnb25hbFRvQ29uc2lkZXIsIC1lZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoIDw9IE1hdGgubWluKG1heERpYWdvbmFsVG9Db25zaWRlciwgZWRpdExlbmd0aCk7IGRpYWdvbmFsUGF0aCArPSAyKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2VQYXRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZVBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSwgYWRkUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG9uZSBlbHNlIGlzIGdvaW5nIHRvIGF0dGVtcHQgdG8gdXNlIHRoaXMgdmFsdWUsIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwZXJmIG9wdGltaXNhdGlvbi4gVGhpcyB0eXBlLXZpb2xhdGluZyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY2FuQWRkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGFkZFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hhdCBuZXdQb3Mgd2lsbCBiZSBhZnRlciB3ZSBkbyBhbiBpbnNlcnRpb246XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZFBhdGhOZXdQb3MgPSBhZGRQYXRoLm9sZFBvcyAtIGRpYWdvbmFsUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgY2FuQWRkID0gYWRkUGF0aCAmJiAwIDw9IGFkZFBhdGhOZXdQb3MgJiYgYWRkUGF0aE5ld1BvcyA8IG5ld0xlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuUmVtb3ZlID0gcmVtb3ZlUGF0aCAmJiByZW1vdmVQYXRoLm9sZFBvcyArIDEgPCBvbGRMZW47XG4gICAgICAgICAgICAgICAgaWYgKCFjYW5BZGQgJiYgIWNhblJlbW92ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIHBhdGggaXMgYSB0ZXJtaW5hbCB0aGVuIHBydW5lXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwZXJmIG9wdGltaXNhdGlvbi4gVGhpcyB0eXBlLXZpb2xhdGluZyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgdGhlIGRpYWdvbmFsIHRoYXQgd2Ugd2FudCB0byBicmFuY2ggZnJvbS4gV2Ugc2VsZWN0IHRoZSBwcmlvclxuICAgICAgICAgICAgICAgIC8vIHBhdGggd2hvc2UgcG9zaXRpb24gaW4gdGhlIG9sZCBzdHJpbmcgaXMgdGhlIGZhcnRoZXN0IGZyb20gdGhlIG9yaWdpblxuICAgICAgICAgICAgICAgIC8vIGFuZCBkb2VzIG5vdCBwYXNzIHRoZSBib3VuZHMgb2YgdGhlIGRpZmYgZ3JhcGhcbiAgICAgICAgICAgICAgICBpZiAoIWNhblJlbW92ZSB8fCAoY2FuQWRkICYmIHJlbW92ZVBhdGgub2xkUG9zIDwgYWRkUGF0aC5vbGRQb3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gdGhpcy5hZGRUb1BhdGgoYWRkUGF0aCwgdHJ1ZSwgZmFsc2UsIDAsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChyZW1vdmVQYXRoLCBmYWxzZSwgdHJ1ZSwgMSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIGRpYWdvbmFsUGF0aCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm9sZFBvcyArIDEgPj0gb2xkTGVuICYmIG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgaGl0IHRoZSBlbmQgb2YgYm90aCBzdHJpbmdzLCB0aGVuIHdlIGFyZSBkb25lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb25lKHRoaXMuYnVpbGRWYWx1ZXMoYmFzZVBhdGgubGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpKSB8fCB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IGJhc2VQYXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heERpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWluKG1heERpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5EaWFnb25hbFRvQ29uc2lkZXIgPSBNYXRoLm1heChtaW5EaWFnb25hbFRvQ29uc2lkZXIsIGRpYWdvbmFsUGF0aCArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWRpdExlbmd0aCsrO1xuICAgICAgICB9O1xuICAgICAgICAvLyBQZXJmb3JtcyB0aGUgbGVuZ3RoIG9mIGVkaXQgaXRlcmF0aW9uLiBJcyBhIGJpdCBmdWdseSBhcyB0aGlzIGhhcyB0byBzdXBwb3J0IHRoZVxuICAgICAgICAvLyBzeW5jIGFuZCBhc3luYyBtb2RlIHdoaWNoIGlzIG5ldmVyIGZ1bi4gTG9vcHMgb3ZlciBleGVjRWRpdExlbmd0aCB1bnRpbCBhIHZhbHVlXG4gICAgICAgIC8vIGlzIHByb2R1Y2VkLCBvciB1bnRpbCB0aGUgZWRpdCBsZW5ndGggZXhjZWVkcyBvcHRpb25zLm1heEVkaXRMZW5ndGggKGlmIGdpdmVuKSxcbiAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSBpdCB3aWxsIHJldHVybiB1bmRlZmluZWQuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlZGl0TGVuZ3RoID4gbWF4RWRpdExlbmd0aCB8fCBEYXRlLm5vdygpID4gYWJvcnRBZnRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFleGVjRWRpdExlbmd0aCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoZWRpdExlbmd0aCA8PSBtYXhFZGl0TGVuZ3RoICYmIERhdGUubm93KCkgPD0gYWJvcnRBZnRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldCA9IGV4ZWNFZGl0TGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRUb1BhdGgocGF0aCwgYWRkZWQsIHJlbW92ZWQsIG9sZFBvc0luYywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBsYXN0ID0gcGF0aC5sYXN0Q29tcG9uZW50O1xuICAgICAgICBpZiAobGFzdCAmJiAhb3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbiAmJiBsYXN0LmFkZGVkID09PSBhZGRlZCAmJiBsYXN0LnJlbW92ZWQgPT09IHJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb2xkUG9zOiBwYXRoLm9sZFBvcyArIG9sZFBvc0luYyxcbiAgICAgICAgICAgICAgICBsYXN0Q29tcG9uZW50OiB7IGNvdW50OiBsYXN0LmNvdW50ICsgMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdC5wcmV2aW91c0NvbXBvbmVudCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCwgcHJldmlvdXNDb21wb25lbnQ6IGxhc3QgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IG5ld1Rva2Vucy5sZW5ndGgsIG9sZExlbiA9IG9sZFRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCBvbGRQb3MgPSBiYXNlUGF0aC5vbGRQb3MsIG5ld1BvcyA9IG9sZFBvcyAtIGRpYWdvbmFsUGF0aCwgY29tbW9uQ291bnQgPSAwO1xuICAgICAgICB3aGlsZSAobmV3UG9zICsgMSA8IG5ld0xlbiAmJiBvbGRQb3MgKyAxIDwgb2xkTGVuICYmIHRoaXMuZXF1YWxzKG9sZFRva2Vuc1tvbGRQb3MgKyAxXSwgbmV3VG9rZW5zW25ld1BvcyArIDFdLCBvcHRpb25zKSkge1xuICAgICAgICAgICAgbmV3UG9zKys7XG4gICAgICAgICAgICBvbGRQb3MrKztcbiAgICAgICAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbikge1xuICAgICAgICAgICAgICAgIGJhc2VQYXRoLmxhc3RDb21wb25lbnQgPSB7IGNvdW50OiAxLCBwcmV2aW91c0NvbXBvbmVudDogYmFzZVBhdGgubGFzdENvbXBvbmVudCwgYWRkZWQ6IGZhbHNlLCByZW1vdmVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tb25Db3VudCAmJiAhb3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbikge1xuICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IGNvbW1vbkNvdW50LCBwcmV2aW91c0NvbXBvbmVudDogYmFzZVBhdGgubGFzdENvbXBvbmVudCwgYWRkZWQ6IGZhbHNlLCByZW1vdmVkOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGJhc2VQYXRoLm9sZFBvcyA9IG9sZFBvcztcbiAgICAgICAgcmV0dXJuIG5ld1BvcztcbiAgICB9XG4gICAgZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNvbXBhcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNvbXBhcmF0b3IobGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0XG4gICAgICAgICAgICAgICAgfHwgKCEhb3B0aW9ucy5pZ25vcmVDYXNlICYmIGxlZnQudG9Mb3dlckNhc2UoKSA9PT0gcmlnaHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRW1wdHkoYXJyYXkpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXSkge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgY2FzdElucHV0KHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIHRva2VuaXplKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHZhbHVlKTtcbiAgICB9XG4gICAgam9pbihjaGFycykge1xuICAgICAgICAvLyBBc3N1bWVzIFZhbHVlVCBpcyBzdHJpbmcsIHdoaWNoIGlzIHRoZSBjYXNlIGZvciBtb3N0IHN1YmNsYXNzZXMuXG4gICAgICAgIC8vIFdoZW4gaXQncyBmYWxzZSwgZS5nLiBpbiBkaWZmQXJyYXlzLCB0aGlzIG1ldGhvZCBuZWVkcyB0byBiZSBvdmVycmlkZGVuIChlLmcuIHdpdGggYSBuby1vcClcbiAgICAgICAgLy8gWWVzLCB0aGUgY2FzdHMgYXJlIHZlcmJvc2UgYW5kIHVnbHksIGJlY2F1c2UgdGhpcyBwYXR0ZXJuIC0gb2YgaGF2aW5nIHRoZSBiYXNlIGNsYXNzIFNPUlQgT0ZcbiAgICAgICAgLy8gYXNzdW1lIHRva2VucyBhbmQgdmFsdWVzIGFyZSBzdHJpbmdzLCBidXQgbm90IGNvbXBsZXRlbHkgLSBpcyB3ZWlyZCBhbmQgamFua3kuXG4gICAgICAgIHJldHVybiBjaGFycy5qb2luKCcnKTtcbiAgICB9XG4gICAgcG9zdFByb2Nlc3MoY2hhbmdlT2JqZWN0cywgXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGNoYW5nZU9iamVjdHM7XG4gICAgfVxuICAgIGdldCB1c2VMb25nZXN0VG9rZW4oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYnVpbGRWYWx1ZXMobGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpIHtcbiAgICAgICAgLy8gRmlyc3Qgd2UgY29udmVydCBvdXIgbGlua2VkIGxpc3Qgb2YgY29tcG9uZW50cyBpbiByZXZlcnNlIG9yZGVyIHRvIGFuXG4gICAgICAgIC8vIGFycmF5IGluIHRoZSByaWdodCBvcmRlcjpcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IFtdO1xuICAgICAgICBsZXQgbmV4dENvbXBvbmVudDtcbiAgICAgICAgd2hpbGUgKGxhc3RDb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChsYXN0Q29tcG9uZW50KTtcbiAgICAgICAgICAgIG5leHRDb21wb25lbnQgPSBsYXN0Q29tcG9uZW50LnByZXZpb3VzQ29tcG9uZW50O1xuICAgICAgICAgICAgZGVsZXRlIGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBsYXN0Q29tcG9uZW50ID0gbmV4dENvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnRzLnJldmVyc2UoKTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50TGVuID0gY29tcG9uZW50cy5sZW5ndGg7XG4gICAgICAgIGxldCBjb21wb25lbnRQb3MgPSAwLCBuZXdQb3MgPSAwLCBvbGRQb3MgPSAwO1xuICAgICAgICBmb3IgKDsgY29tcG9uZW50UG9zIDwgY29tcG9uZW50TGVuOyBjb21wb25lbnRQb3MrKykge1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50c1tjb21wb25lbnRQb3NdO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkICYmIHRoaXMudXNlTG9uZ2VzdFRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IG5ld1Rva2Vucy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvbGRUb2tlbnNbb2xkUG9zICsgaV07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xkVmFsdWUubGVuZ3RoID4gdmFsdWUubGVuZ3RoID8gb2xkVmFsdWUgOiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4obmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1BvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgLy8gQ29tbW9uIGNhc2VcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCkge1xuICAgICAgICAgICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihvbGRUb2tlbnMuc2xpY2Uob2xkUG9zLCBvbGRQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgRGlmZiBmcm9tICcuL2Jhc2UuanMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVPcHRpb25zIH0gZnJvbSAnLi4vdXRpbC9wYXJhbXMuanMnO1xuY2xhc3MgTGluZURpZmYgZXh0ZW5kcyBEaWZmIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy50b2tlbml6ZSA9IHRva2VuaXplO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgaWdub3Jpbmcgd2hpdGVzcGFjZSwgd2UgbmVlZCB0byBub3JtYWxpc2UgbGluZXMgYnkgc3RyaXBwaW5nXG4gICAgICAgIC8vIHdoaXRlc3BhY2UgYmVmb3JlIGNoZWNraW5nIGVxdWFsaXR5LiAoVGhpcyBoYXMgYW4gYW5ub3lpbmcgaW50ZXJhY3Rpb25cbiAgICAgICAgLy8gd2l0aCBuZXdsaW5lSXNUb2tlbiB0aGF0IHJlcXVpcmVzIHNwZWNpYWwgaGFuZGxpbmc6IGlmIG5ld2xpbmVzIGdldCB0aGVpclxuICAgICAgICAvLyBvd24gdG9rZW4sIHRoZW4gd2UgRE9OJ1Qgd2FudCB0byB0cmltIHRoZSAqbmV3bGluZSogdG9rZW5zIGRvd24gdG8gZW1wdHlcbiAgICAgICAgLy8gc3RyaW5ncywgc2luY2UgdGhpcyB3b3VsZCBjYXVzZSB1cyB0byB0cmVhdCB3aGl0ZXNwYWNlLW9ubHkgbGluZSBjb250ZW50XG4gICAgICAgIC8vIGFzIGVxdWFsIHRvIGEgc2VwYXJhdG9yIGJldHdlZW4gbGluZXMsIHdoaWNoIHdvdWxkIGJlIHdlaXJkIGFuZFxuICAgICAgICAvLyBpbmNvbnNpc3RlbnQgd2l0aCB0aGUgZG9jdW1lbnRlZCBiZWhhdmlvciBvZiB0aGUgb3B0aW9ucy4pXG4gICAgICAgIGlmIChvcHRpb25zLmlnbm9yZVdoaXRlc3BhY2UpIHtcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhbGVmdC5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubmV3bGluZUlzVG9rZW4gfHwgIXJpZ2h0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuaWdub3JlTmV3bGluZUF0RW9mICYmICFvcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICAgICAgICBpZiAobGVmdC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmlnaHQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLmVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucyk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGxpbmVEaWZmID0gbmV3IExpbmVEaWZmKCk7XG5leHBvcnQgZnVuY3Rpb24gZGlmZkxpbmVzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZUcmltbWVkTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gZ2VuZXJhdGVPcHRpb25zKG9wdGlvbnMsIHsgaWdub3JlV2hpdGVzcGFjZTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG4vLyBFeHBvcnRlZCBzdGFuZGFsb25lIHNvIGl0IGNhbiBiZSB1c2VkIGZyb20ganNvbkRpZmYgdG9vLlxuZXhwb3J0IGZ1bmN0aW9uIHRva2VuaXplKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuc3RyaXBUcmFpbGluZ0NyKSB7XG4gICAgICAgIC8vIHJlbW92ZSBvbmUgXFxyIGJlZm9yZSBcXG4gdG8gbWF0Y2ggR05VIGRpZmYncyAtLXN0cmlwLXRyYWlsaW5nLWNyIGJlaGF2aW9yXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKTtcbiAgICB9XG4gICAgY29uc3QgcmV0TGluZXMgPSBbXSwgbGluZXNBbmROZXdsaW5lcyA9IHZhbHVlLnNwbGl0KC8oXFxufFxcclxcbikvKTtcbiAgICAvLyBJZ25vcmUgdGhlIGZpbmFsIGVtcHR5IHRva2VuIHRoYXQgb2NjdXJzIGlmIHRoZSBzdHJpbmcgZW5kcyB3aXRoIGEgbmV3IGxpbmVcbiAgICBpZiAoIWxpbmVzQW5kTmV3bGluZXNbbGluZXNBbmROZXdsaW5lcy5sZW5ndGggLSAxXSkge1xuICAgICAgICBsaW5lc0FuZE5ld2xpbmVzLnBvcCgpO1xuICAgIH1cbiAgICAvLyBNZXJnZSB0aGUgY29udGVudCBhbmQgbGluZSBzZXBhcmF0b3JzIGludG8gc2luZ2xlIHRva2Vuc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXNBbmROZXdsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBsaW5lID0gbGluZXNBbmROZXdsaW5lc1tpXTtcbiAgICAgICAgaWYgKGkgJSAyICYmICFvcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICAgICAgICByZXRMaW5lc1tyZXRMaW5lcy5sZW5ndGggLSAxXSArPSBsaW5lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0TGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0TGluZXM7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtQkEsbUJBQXFGOzs7QUNuQnJGLElBQXFCLE9BQXJCLE1BQTBCO0FBQUEsRUFDdEIsS0FBSyxRQUFRLFFBRWIsVUFBVSxDQUFDLEdBQUc7QUFDVixRQUFJO0FBQ0osUUFBSSxPQUFPLFlB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SSxDQUFDLE9BQU8sV0FBVyxPQUFPLE1BQU0sV0FBVyxFQUFHLFFBQU8sQ0FBQztBQUMxRCxTQUFPLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxPQUFPO0FBQUEsSUFDcEMsTUFBTSxPQUFPLE1BQU0sU0FBUyxJQUFJLFdBQVcsSUFBSSxDQUFDLElBQUksT0FBTyxNQUFNLE1BQU0sUUFBUTtBQUFBLElBQy9FLE1BQU0sZ0JBQWdCLEtBQUssU0FBUyxLQUFLLE9BQU8sRUFBRSxDQUFDLEVBQUU7QUFBQSxFQUN2RCxFQUFFO0FBQ0o7QUFNQSxJQUFNLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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

		})(module, module.exports, require);
		return module.exports;
	}
});
