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
function diffsFromDiffCard(view) {
  if (!view || view.card !== "diff" || !Array.isArray(view.diffs)) return [];
  return view.diffs.map(asFileDiff).filter((d) => d !== null);
}
function diffCardTitle(view) {
  if (!view || typeof view !== "object") return null;
  const title = view.title;
  return typeof title === "string" && title.trim() ? title.trim() : null;
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
  const resultDiffs = diffsFromDiffCard(node.resultView);
  const callDiffs = resultDiffs.length === 0 ? diffsFromDiffCard(node.callView) : [];
  const metaDiffs = resultDiffs.length === 0 && callDiffs.length === 0 ? diffsFromMeta(node.meta) : [];
  const allDiffs = resultDiffs.length > 0 ? resultDiffs : callDiffs.length > 0 ? callDiffs : metaDiffs;
  const tool = call?.name ?? diffCardTitle(node.callView) ?? "tool";
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
  const path = call ? mutationPath(tool, call.argsRaw) : null;
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
    if (node.kind !== "tool-result" || !current) continue;
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
    if (node.kind !== "tool-result") continue;
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
.dsdr-dock{box-sizing:border-box;display:flex;flex-direction:column;gap:2px;width:100%;max-width:var(--dsh-composer-card-max-width, 780px);margin:0 auto calc(-1 * var(--dsh-composer-stack-gap, 6px) - 8px);padding:8px 16px;background:var(--dsw-specific-input-major);border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-bottom:none;border-radius:22px 22px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}
.dsdr-dock-head{display:flex;align-items:center;gap:6px;min-height:22px}
.dsdr-dock-icon{display:inline-flex;color:var(--dsw-alias-button-info-fill)}
.dsdr-dock-count{font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);white-space:nowrap}
.dsdr-dock-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0}
.dsdr-dock-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-dock-list{display:flex;flex-direction:column;gap:2px;padding-top:4px;margin-top:2px;max-height:168px;overflow-y:auto}
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
.dsdr-split-row{position:relative;display:grid;grid-template-columns:1fr 1fr;font-family:var(--dsdr-diff-font, var(--dsw-font-mono));font-size:var(--dsdr-diff-size, 12px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px)}
.dsdr-split-cell:hover .dsdr-comment-add,.dsdr-split-row:hover .dsdr-comment-add{visibility:visible}
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
                ] }) : null,
                showActions && rowComments.length > 0 && commentPopover === key ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-pop", children: rowComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-item", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-text", children: comment.text }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-meta", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: comment.path }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-danger", disabled: busy, onClick: () => onDeleteComment?.(comment.id), children: t("comment.delete") })
                  ] })
                ] }, comment.id)) }) : null
              ]
            }
          ),
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
                          ),
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
                          ] }, comment.id)) }) : null
                        ] }),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERpZmYtcmV2aWV3IHBsdWdpbiBcdTIwMTQgY2xpZW50IGhhbGYuXG4gKlxuICogQ29kZXgtc3R5bGUgcmV2aWV3IHdpdGggdHdvIHNvdXJjZXM6XG4gKlxuICogMS4gKipcdTRGMUFcdThCRERcdTY2RjRcdTY1MzkgKFNlc3Npb24gY2hhbmdlcykqKiBcdTIwMTQgd2hhdCB0aGUgYWdlbnQgY2hhbmdlZCBpbiBlYWNoIHJvdW5kIG9mXG4gKiAgICB0aGlzIGNvbnZlcnNhdGlvbiwgZGVyaXZlZCBmcm9tIHRoZSBjb252ZXJzYXRpb24gc25hcHNob3QgKHRvb2wgcmVzdWx0c1xuICogICAgY2FycnkgdGhlIGhvc3QtY29tcHV0ZWQgYHJlc3VsdFZpZXdgIGRpZmYgaHVua3MpLiBXb3JrcyB3aXRoIG9yIHdpdGhvdXRcbiAqICAgIGdpdCwgYW5kIHNob3dzIGEgY2hhbmdlIGV2ZW4gd2hlbiBubyBkaWZmIHRleHQgaXMgYXZhaWxhYmxlIChwYXRoLW9ubHkpLlxuICogMi4gKipcdTVERTVcdTRGNUNcdTUzM0EgKFdvcmtzcGFjZSkqKiBcdTIwMTQgdGhlIGdpdCB3b3JraW5nIHRyZWUncyB1bmNvbW1pdHRlZCBjaGFuZ2VzXG4gKiAgICAoc3RhZ2VkICsgdW5zdGFnZWQgKyB1bnRyYWNrZWQpIHdpdGggcGVyLWZpbGUgLyBhbGwtZmlsZSBhY2NlcHQgKHN0YWdlKVxuICogICAgYW5kIHJldmVydCAoZGlzY2FyZCkgdGhyb3VnaCB0aGUgcGx1Z2luJ3Mgc2VydmVyIHJvdXRlcy5cbiAqXG4gKiBUaGUgcmV2aWV3IHN1cmZhY2UgbW91bnRzIGluIGBzaGVsbC5vdmVybGF5YCAocm9vdCBzY29wZSkuIFN0YXRlIGhhbmQtb2ZmXG4gKiBiZXR3ZWVuIHRoZSBzZXNzaW9uLXNjb3BlZCBoZWFkZXIgdHJpZ2dlciBhbmQgdGhlIHJvb3Qtc2NvcGVkIG92ZXJsYXkgZ29lc1xuICogdGhyb3VnaCBhIG1vZHVsZS1sZXZlbCBzbmFwc2hvdCBzdG9yZTsgdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCBmb3IgdGhlXG4gKiBjdXJyZW50IHNlc3Npb24gaXMgcmVhZCByZWFjdGl2ZWx5IHRocm91Z2ggYGN0eC5zZXNzaW9uc2AgKGluamVjdGVkIHZpYSB0aGVcbiAqIG92ZXJsYXkgcmVnaXN0cmF0aW9uJ3MgaW5qZWN0IGZhY2UpLlxuICovXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUsIHVzZVN5bmNFeHRlcm5hbFN0b3JlLCBGcmFnbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDU1NQcm9wZXJ0aWVzLCBSZWFjdEVsZW1lbnQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgZGlmZkxpbmVzIH0gZnJvbSAnZGlmZidcbmltcG9ydCB0eXBlIHsgQ2xpZW50Q29udGV4dCwgSVNlc3Npb25zLCBTZXNzaW9uTGlzdFN0YXRlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgeyBjcmVhdGVTbmFwc2hvdFN0b3JlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFByb3BzTG9jYWxlLCBQcm9wc1J1bnRpbWUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1zbG90cydcbmltcG9ydCB0eXBlIHsgQ29udmVyc2F0aW9uTm9kZSwgVG9vbFJlc3VsdE5vZGUsIFVzZXJNZXNzYWdlTm9kZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXJ1bnRpbWUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBTZXNzaW9uSWQsIFRvb2xSZXN1bHRWaWV3IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hcGktcmVtb3Rlcy9jbGllbnQnXG5pbXBvcnQgeyBJY29uQ2hldnJvbkRvd25PdXRsaW5lMTQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEdpdFJlc3BvbnNlLCBIaXN0b3J5UmVzcG9uc2UsIFByUmVzcG9uc2UsIFJlcG9zUmVzcG9uc2UsIFJldmlld0NvbW1lbnQsIFJldmlld0ZpbmRpbmcsIFJldmlld1Jlc3BvbnNlLCBTdGF0dXNSZXNwb25zZSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcy50cydcblxuZXhwb3J0IGNvbnN0IG5hbWUgPSAnZGlmZi1yZXZpZXcnXG5cbi8qKiBSZXF1aXJlZCBjbGllbnQgc2VydmljZXMgKGZpYmVyIGluamVjdCkuICovXG5leHBvcnQgY29uc3QgaW5qZWN0ID0gWydzZXNzaW9ucycsICdzbG90cycsICdsb2NhbGUnXVxuXG5jb25zdCBMT0NBTEVfTlMgPSAnZGlmZi1yZXZpZXcnXG5jb25zdCBTVEFUVVNfVVJMID0gJ2RpZmYtcmV2aWV3L3N0YXR1cydcbmNvbnN0IEFQUExZX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseSdcbmNvbnN0IEFQUExZX0hVTktfVVJMID0gJ2RpZmYtcmV2aWV3L2FwcGx5LWh1bmsnXG5jb25zdCBDT01NSVRfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdCdcbmNvbnN0IFBVU0hfVVJMID0gJ2RpZmYtcmV2aWV3L3B1c2gnXG5jb25zdCBISVNUT1JZX1VSTCA9ICdkaWZmLXJldmlldy9oaXN0b3J5J1xuY29uc3QgQ09NTUlUX0RJRkZfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdC1kaWZmJ1xuY29uc3QgQ09NTUVOVFNfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1lbnRzJ1xuY29uc3QgQlJBTkNIRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2JyYW5jaGVzJ1xuY29uc3QgUkVWSUVXX1VSTCA9ICdkaWZmLXJldmlldy9yZXZpZXcnXG5jb25zdCBQUl9VUkwgPSAnZGlmZi1yZXZpZXcvcHInXG5jb25zdCBSRVBPU19VUkwgPSAnZGlmZi1yZXZpZXcvcmVwb3MnXG5jb25zdCBPUEVOX0VESVRPUl9VUkwgPSAnb3Blbi1lZGl0b3Ivb3BlbidcbmNvbnN0IFNUWUxFX1RBRyA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3L3Jldmlldy5jc3MnXG5cbi8qKiBPcGVuIHN0YXRlIHNoYXJlZCBiZXR3ZWVuIHRoZSBoZWFkZXIgdHJpZ2dlciAoc2Vzc2lvbiBzY29wZSkgYW5kIHRoZSBvdmVybGF5IChyb290IHNjb3BlKS4gKi9cbmNvbnN0IG92ZXJsYXlTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8eyBvcGVuOiBib29sZWFuOyBjd2Q6IHN0cmluZyB8IG51bGw7IGtleTogbnVtYmVyOyBmb2N1cz86IHsgcGF0aDogc3RyaW5nOyBsaW5lPzogbnVtYmVyIH0gfCBudWxsIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxuICBmb2N1czogbnVsbCxcbn0pXG5cbi8qKlxuICogUGVuZGluZyBpbmxpbmUgY29tbWVudHMgc3VyZmFjZWQgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSkuIFRoZVxuICogcmV2aWV3IG92ZXJsYXkgc3luY3MgaXRzIHdvcmtzcGFjZSBjb21tZW50cyBoZXJlOyB0aGUgY29tcG9zZXIgZG9jayByZWFkc1xuICogdGhlbSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbidzIHdvcmtzcGFjZS5cbiAqL1xuY29uc3QgcGVuZGluZ0NvbW1lbnRzU3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPHsgY3dkOiBzdHJpbmcgfCBudWxsOyBjb21tZW50czogUmV2aWV3Q29tbWVudFtdIH0+KHtcbiAgY3dkOiBudWxsLFxuICBjb21tZW50czogW10sXG59KVxuXG4vKiogSW5qZWN0IHRleHQgaW50byBhIHNlc3Npb24gYXMgYSB1c2VyIG1lc3NhZ2U7IGZhbGxzIGJhY2sgdG8gdGhlIGNsaXBib2FyZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluamVjdFRvU2Vzc2lvbihzZXNzaW9uczogSVNlc3Npb25zIHwgdW5kZWZpbmVkLCBzZXNzaW9uSWQ6IFNlc3Npb25JZCB8IG51bGwsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8J3NlbnQnIHwgJ2NvcGllZCcgfCAnZmFpbGVkJz4ge1xuICBjb25zdCBiaW5kaW5nID0gc2Vzc2lvbklkID8gc2Vzc2lvbnM/LmJpbmRpbmcoc2Vzc2lvbklkKSA6IHVuZGVmaW5lZFxuICBjb25zdCBzZXNzaW9uID0gYmluZGluZz8uc2Vzc2lvblxuICBpZiAoc2Vzc2lvbikge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXNzaW9uLnByb21wdChbeyB0eXBlOiAndGV4dCcsIHRleHQgfV0sICdxdWV1ZScpXG4gICAgICBpZiAocmVzdWx0Lm9rKSByZXR1cm4gJ3NlbnQnXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGNvcHkgZmFsbGJhY2tcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICAgIHJldHVybiAnY29waWVkJ1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJ2ZhaWxlZCdcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJldmlldyBwcmVmZXJlbmNlcyAoZm9udCAvIHNpemUgLyBwYW5lbCBnZW9tZXRyeSksIHNoYXJlZCBieSB0aGUgb3ZlcmxheVxuLy8gYW5kIHRoZSBTZXR0aW5ncyBcdTIxOTIgR2VuZXJhbCByb3cuIFBlcnNpc3RlZCB0byBsb2NhbFN0b3JhZ2UgYnkgdGhlIHN0b3JlLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBQYW5lbCBnZW9tZXRyeSBib3VuZHMuICovXG5leHBvcnQgY29uc3QgTUlOX1BBTkVMX1cgPSA2NDBcbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfSCA9IDQwMFxuXG5pbnRlcmZhY2UgUHJlZnMge1xuICAvKiogRm9udCBvcHRpb24gaWQgKHNlZSBGT05UX09QVElPTlMpLiAqL1xuICBmb250OiBzdHJpbmdcbiAgLyoqIERpZmYgdGV4dCBzaXplIGluIHB4LiAqL1xuICBzaXplOiBudW1iZXJcbiAgLyoqIFBhbmVsIHdpZHRoIGluIHB4LiAqL1xuICB3aWR0aDogbnVtYmVyXG4gIC8qKiBQYW5lbCBoZWlnaHQgaW4gcHguICovXG4gIGhlaWdodDogbnVtYmVyXG59XG5cbmNvbnN0IEZPTlRfT1BUSU9OUzogeyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBjc3M6IHN0cmluZyB9W10gPSBbXG4gIHsgaWQ6ICdtb25vJywgbGFiZWw6ICdmb250Lm1vbm8nLCBjc3M6ICd2YXIoLS1kc3ctZm9udC1tb25vKScgfSxcbiAgeyBpZDogJ3N5c3RlbScsIGxhYmVsOiAnZm9udC5zeXN0ZW0nLCBjc3M6ICdzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYnIH0sXG4gIHsgaWQ6ICdjb25zb2xhcycsIGxhYmVsOiAnQ29uc29sYXMnLCBjc3M6ICdDb25zb2xhcywgXCJDb3VyaWVyIE5ld1wiLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdqZXRicmFpbnMnLCBsYWJlbDogJ0pldEJyYWlucyBNb25vJywgY3NzOiAnXCJKZXRCcmFpbnMgTW9ub1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnZmlyYScsIGxhYmVsOiAnRmlyYSBDb2RlJywgY3NzOiAnXCJGaXJhIENvZGVcIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ3NvdXJjZScsIGxhYmVsOiAnU291cmNlIENvZGUgUHJvJywgY3NzOiAnXCJTb3VyY2UgQ29kZSBQcm9cIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbl1cblxuY29uc3QgU0laRV9PUFRJT05TID0gWzExLCAxMiwgMTMsIDE0LCAxNiwgMThdXG5cbi8qKiBSZXZpZXcgc2NvcGVzIG9mIHRoZSB3b3Jrc3BhY2UgdGFiIChhbGlnbmVkIHdpdGggdGhlIENvZGV4IHJldmlldyBwYW5lKS4gKi9cbnR5cGUgV29ya3NwYWNlU2NvcGUgPSAnYWxsJyB8ICd1bnN0YWdlZCcgfCAnc3RhZ2VkJyB8ICdjb21taXQnIHwgJ2JyYW5jaCcgfCAnbGFzdC10dXJuJ1xuXG5jb25zdCBTQ09QRV9PUFRJT05TOiB7IGlkOiBXb3Jrc3BhY2VTY29wZTsgbGFiZWw6IGtleW9mIHR5cGVvZiB6aCB9W10gPSBbXG4gIHsgaWQ6ICdhbGwnLCBsYWJlbDogJ3Njb3BlLmFsbCcgfSxcbiAgeyBpZDogJ3Vuc3RhZ2VkJywgbGFiZWw6ICdzY29wZS51bnN0YWdlZCcgfSxcbiAgeyBpZDogJ3N0YWdlZCcsIGxhYmVsOiAnc2NvcGUuc3RhZ2VkJyB9LFxuICB7IGlkOiAnY29tbWl0JywgbGFiZWw6ICdzY29wZS5jb21taXQnIH0sXG4gIHsgaWQ6ICdicmFuY2gnLCBsYWJlbDogJ3Njb3BlLmJyYW5jaCcgfSxcbiAgeyBpZDogJ2xhc3QtdHVybicsIGxhYmVsOiAnc2NvcGUubGFzdC10dXJuJyB9LFxuXVxuXG4vKiogQnJvd3Nlci1zaWRlIGFic29sdXRlIHBhdGggY2hlY2sgKG5vIG5vZGU6cGF0aCBpbiB0aGUgY2xpZW50IGJ1bmRsZSkuICovXG5mdW5jdGlvbiBpc0Fic1BhdGgocDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocClcbn1cblxuZnVuY3Rpb24gYmFzZU5hbWUocDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHAuc3BsaXQoL1tcXFxcL10vKS5wb3AoKSA/PyBwXG59XG5cbmNvbnN0IHByZWZzU3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPFByZWZzPihcbiAgeyBmb250OiAnbW9ubycsIHNpemU6IDEyLCB3aWR0aDogMTEyMCwgaGVpZ2h0OiA3MjAgfSxcbiAgeyBwZXJzaXN0OiB7IG5hbWU6ICdkc2RyLXByZWZzJyB9IH0sXG4pXG5cbi8qKiBDU1MgZm9udC1mYW1pbHkgZm9yIGEgc3RvcmVkIGZvbnQgb3B0aW9uIGlkLiAqL1xuZnVuY3Rpb24gZm9udENzcyhpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIEZPTlRfT1BUSU9OUy5maW5kKChmKSA9PiBmLmlkID09PSBpZCk/LmNzcyA/PyBGT05UX09QVElPTlNbMF0uY3NzXG59XG5cbi8qKiBQYW5lbCBDU1MgdmFyaWFibGVzIGNhcnJ5aW5nIHRoZSBmb250L3NpemUgcHJlZmVyZW5jZS4gKi9cbmZ1bmN0aW9uIGRpZmZTdHlsZVZhcnMocHJlZnM6IFByZWZzKTogQ1NTUHJvcGVydGllcyB7XG4gIHJldHVybiB7XG4gICAgJy0tZHNkci1kaWZmLWZvbnQnOiBmb250Q3NzKHByZWZzLmZvbnQpLFxuICAgICctLWRzZHItZGlmZi1zaXplJzogYCR7cHJlZnMuc2l6ZX1weGAsXG4gIH0gYXMgQ1NTUHJvcGVydGllc1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlc3Npb24tY2hhbmdlcyBleHRyYWN0aW9uIChjbGllbnQtc2lkZSwgd29ya3Mgd2l0aG91dCBnaXQpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYmVmb3JlL2FmdGVyIHNsaWNlIG9mIGEgY2hhbmdlIChhIGh1bmspLiAqL1xuaW50ZXJmYWNlIEh1bmsge1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogT25lIGZpbGUgY2hhbmdlZCBpbnNpZGUgb25lIHJvdW5kLiAqL1xuaW50ZXJmYWNlIFJvdW5kQ2hhbmdlIHtcbiAgcGF0aDogc3RyaW5nXG4gIHRvb2w6IHN0cmluZ1xuICBodW5rczogSHVua1tdXG4gIC8qKiBGYWxzZSB3aGVuIG9ubHkgdGhlIHBhdGggaXMga25vd24gKG5vIGRpZmYgZGF0YSBwZXJzaXN0ZWQpLiAqL1xuICBoYXNEaWZmOiBib29sZWFuXG59XG5cbi8qKiBPbmUgdXNlciByb3VuZCBhbmQgdGhlIGZpbGVzIGl0IGNoYW5nZWQuICovXG5pbnRlcmZhY2UgU2Vzc2lvblJvdW5kIHtcbiAgcm91bmQ6IG51bWJlclxuICBsYWJlbDogc3RyaW5nXG4gIGNoYW5nZXM6IFJvdW5kQ2hhbmdlW11cbn1cblxuaW50ZXJmYWNlIEZpbGVEaWZmTGlrZSB7XG4gIHBhdGg6IHN0cmluZ1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogVmFsaWRhdGUgYSByYXcgRmlsZURpZmYtc2hhcGVkIHZhbHVlICh0aGUgdG9vbHMnIGB7cGF0aCwgb2xkVGV4dCwgbmV3VGV4dH1gIGNvbnRyYWN0KS4gKi9cbmZ1bmN0aW9uIGFzRmlsZURpZmYocmF3OiB1bmtub3duKTogRmlsZURpZmZMaWtlIHwgbnVsbCB7XG4gIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBjb25zdCByZWMgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgaWYgKHR5cGVvZiByZWMucGF0aCAhPT0gJ3N0cmluZycgfHwgIXJlYy5wYXRoKSByZXR1cm4gbnVsbFxuICBpZiAodHlwZW9mIHJlYy5uZXdUZXh0ICE9PSAnc3RyaW5nJykgcmV0dXJuIG51bGxcbiAgY29uc3Qgb2xkVGV4dCA9IHJlYy5vbGRUZXh0XG4gIHJldHVybiB7IHBhdGg6IHJlYy5wYXRoLCBvbGRUZXh0OiB0eXBlb2Ygb2xkVGV4dCA9PT0gJ3N0cmluZycgPyBvbGRUZXh0IDogbnVsbCwgbmV3VGV4dDogcmVjLm5ld1RleHQgfVxufVxuXG4vKiogRGlmZiBodW5rcyBjYXJyaWVkIGJ5IGEgZGlmZiBjYXJkIChjYWxsIHZpZXcgb3IgcmVzdWx0IHZpZXcpLiAqL1xuZnVuY3Rpb24gZGlmZnNGcm9tRGlmZkNhcmQodmlldzogeyBjYXJkPzogdW5rbm93bjsgZGlmZnM/OiB1bmtub3duIH0gfCBudWxsIHwgdW5kZWZpbmVkKTogRmlsZURpZmZMaWtlW10ge1xuICBpZiAoIXZpZXcgfHwgdmlldy5jYXJkICE9PSAnZGlmZicgfHwgIUFycmF5LmlzQXJyYXkodmlldy5kaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gdmlldy5kaWZmcy5tYXAoYXNGaWxlRGlmZikuZmlsdGVyKChkKTogZCBpcyBGaWxlRGlmZkxpa2UgPT4gZCAhPT0gbnVsbClcbn1cblxuLyoqIEh1bWFuIGxhYmVsIGZvciBhIGNhbGwgd2hvc2UgYGNhbGxgIGhlYWQgd2FzIHRydW5jYXRlZCBvdXQgb2YgdGhlIHdpbmRvdy4gKi9cbmZ1bmN0aW9uIGRpZmZDYXJkVGl0bGUodmlldzogdW5rbm93bik6IHN0cmluZyB8IG51bGwge1xuICBpZiAoIXZpZXcgfHwgdHlwZW9mIHZpZXcgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBjb25zdCB0aXRsZSA9ICh2aWV3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS50aXRsZVxuICByZXR1cm4gdHlwZW9mIHRpdGxlID09PSAnc3RyaW5nJyAmJiB0aXRsZS50cmltKCkgPyB0aXRsZS50cmltKCkgOiBudWxsXG59XG5cbi8qKiBSYXcgYG1ldGEuZGlmZnNgIGZhbGxiYWNrICh0aGUgcGVyc2lzdGVkIHRvb2wvcmVzdWx0IG1ldGEpLiAqL1xuZnVuY3Rpb24gZGlmZnNGcm9tTWV0YShtZXRhOiB1bmtub3duKTogRmlsZURpZmZMaWtlW10ge1xuICBpZiAoIW1ldGEgfHwgdHlwZW9mIG1ldGEgIT09ICdvYmplY3QnKSByZXR1cm4gW11cbiAgY29uc3QgZGlmZnMgPSAobWV0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuZGlmZnNcbiAgaWYgKCFBcnJheS5pc0FycmF5KGRpZmZzKSkgcmV0dXJuIFtdXG4gIHJldHVybiBkaWZmcy5tYXAoYXNGaWxlRGlmZikuZmlsdGVyKChkKTogZCBpcyBGaWxlRGlmZkxpa2UgPT4gZCAhPT0gbnVsbClcbn1cblxuY29uc3QgTVVUQVRJT05fVE9PTFMgPSBuZXcgU2V0KFsnc3RyX3JlcGxhY2VfZWRpdG9yJywgJ25vdGVib29rX2VkaXQnXSlcbmNvbnN0IE1VVEFUSU9OX0NPTU1BTkRTID0gbmV3IFNldChbJ3dyaXRlJywgJ2VkaXQnLCAncmVwbGFjZScsICdkZWxldGUnLCAnbW92ZSddKVxuXG4vKiogUGF0aC1vbmx5IGZhbGxiYWNrIGZvciBrbm93biBmaWxlLW11dGF0aW5nIHRvb2xzIHdob3NlIHJlc3VsdCBjYXJyaWVkIG5vIGRpZmYuICovXG5mdW5jdGlvbiBtdXRhdGlvblBhdGgodG9vbDogc3RyaW5nLCBhcmdzUmF3OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgbGV0IGFyZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbCA9IG51bGxcbiAgdHJ5IHtcbiAgICBhcmdzID0gSlNPTi5wYXJzZShhcmdzUmF3KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGlmICghYXJncyB8fCB0eXBlb2YgYXJncyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGlmICh0b29sID09PSAnZnMnIHx8IHRvb2wgPT09ICdmaWxlc3lzdGVtJykge1xuICAgIGNvbnN0IGNtZCA9IHR5cGVvZiBhcmdzLmNvbW1hbmQgPT09ICdzdHJpbmcnID8gYXJncy5jb21tYW5kIDogJydcbiAgICBpZiAoIU1VVEFUSU9OX0NPTU1BTkRTLmhhcyhjbWQpKSByZXR1cm4gbnVsbFxuICAgIHJldHVybiB0eXBlb2YgYXJncy5maWxlX3BhdGggPT09ICdzdHJpbmcnICYmIGFyZ3MuZmlsZV9wYXRoID8gYXJncy5maWxlX3BhdGggOiBudWxsXG4gIH1cbiAgaWYgKE1VVEFUSU9OX1RPT0xTLmhhcyh0b29sKSB8fCB0b29sLnN0YXJ0c1dpdGgoJ2VkaXQnKSkge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFsnZmlsZV9wYXRoJywgJ3BhdGgnLCAnZmlsZW5hbWUnXSkge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzW2tleV0gPT09ICdzdHJpbmcnICYmIGFyZ3Nba2V5XSkgcmV0dXJuIGFyZ3Nba2V5XSBhcyBzdHJpbmdcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuLyoqIEV4dHJhY3QgdGhlIGNoYW5nZWQgZmlsZXMgZnJvbSBvbmUgc2V0dGxlZCB0b29sIHJlc3VsdCAoZGlmZiBodW5rcywgZWxzZSBwYXRoLW9ubHkpLiAqL1xuZnVuY3Rpb24gY2hhbmdlc0Zyb21Ub29sUmVzdWx0KGNhbGw6IHsgbmFtZTogc3RyaW5nOyBhcmdzUmF3OiBzdHJpbmcgfSB8IG51bGwsIG5vZGU6IFRvb2xSZXN1bHROb2RlKTogUm91bmRDaGFuZ2VbXSB7XG4gIC8vIExvbmcgc2Vzc2lvbnMgdHJ1bmNhdGUgdGhlIGNhbGwgaGVhZCBvdXQgb2YgdGhlIHdpbmRvdyAoY2FsbCA9PT0gbnVsbCksIGJ1dFxuICAvLyB0aGUgaG9zdC1jb21wdXRlZCBjYWxsL3Jlc3VsdCBkaWZmIGNhcmRzIHN0aWxsIGNhcnJ5IHRoZSBjaGFuZ2UgXHUyMDE0IHJlYWQgdGhvc2UuXG4gIGNvbnN0IHJlc3VsdERpZmZzID0gZGlmZnNGcm9tRGlmZkNhcmQobm9kZS5yZXN1bHRWaWV3KVxuICBjb25zdCBjYWxsRGlmZnMgPSByZXN1bHREaWZmcy5sZW5ndGggPT09IDAgPyBkaWZmc0Zyb21EaWZmQ2FyZChub2RlLmNhbGxWaWV3KSA6IFtdXG4gIGNvbnN0IG1ldGFEaWZmcyA9IHJlc3VsdERpZmZzLmxlbmd0aCA9PT0gMCAmJiBjYWxsRGlmZnMubGVuZ3RoID09PSAwID8gZGlmZnNGcm9tTWV0YShub2RlLm1ldGEpIDogW11cbiAgY29uc3QgYWxsRGlmZnMgPSByZXN1bHREaWZmcy5sZW5ndGggPiAwID8gcmVzdWx0RGlmZnMgOiBjYWxsRGlmZnMubGVuZ3RoID4gMCA/IGNhbGxEaWZmcyA6IG1ldGFEaWZmc1xuICBjb25zdCB0b29sID0gY2FsbD8ubmFtZSA/PyBkaWZmQ2FyZFRpdGxlKG5vZGUuY2FsbFZpZXcpID8/ICd0b29sJ1xuICBpZiAoYWxsRGlmZnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSb3VuZENoYW5nZT4oKVxuICAgIGZvciAoY29uc3QgZCBvZiBhbGxEaWZmcykge1xuICAgICAgbGV0IGVudHJ5ID0gYnlQYXRoLmdldChkLnBhdGgpXG4gICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgIGVudHJ5ID0geyBwYXRoOiBkLnBhdGgsIHRvb2wsIGh1bmtzOiBbXSwgaGFzRGlmZjogdHJ1ZSB9XG4gICAgICAgIGJ5UGF0aC5zZXQoZC5wYXRoLCBlbnRyeSlcbiAgICAgIH1cbiAgICAgIGVudHJ5Lmh1bmtzLnB1c2goeyBvbGRUZXh0OiBkLm9sZFRleHQsIG5ld1RleHQ6IGQubmV3VGV4dCB9KVxuICAgIH1cbiAgICByZXR1cm4gWy4uLmJ5UGF0aC52YWx1ZXMoKV1cbiAgfVxuICBjb25zdCBwYXRoID0gY2FsbCA/IG11dGF0aW9uUGF0aCh0b29sLCBjYWxsLmFyZ3NSYXcpIDogbnVsbFxuICByZXR1cm4gcGF0aCA/IFt7IHBhdGgsIHRvb2wsIGh1bmtzOiBbXSwgaGFzRGlmZjogZmFsc2UgfV0gOiBbXVxufVxuXG4vKiogUGxhaW4gdGV4dCBvZiBhIHVzZXIgbWVzc2FnZSAoY29udGVudCBibG9ja3Mgb2YgdHlwZSAndGV4dCcpLiAqL1xuZnVuY3Rpb24gdXNlclRleHQobm9kZTogVXNlck1lc3NhZ2VOb2RlKTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW11cbiAgZm9yIChjb25zdCBibG9jayBvZiBub2RlLmNvbnRlbnQpIHtcbiAgICBpZiAoYmxvY2sgJiYgdHlwZW9mIGJsb2NrID09PSAnb2JqZWN0JyAmJiAoYmxvY2sgYXMgeyB0eXBlPzogdW5rbm93biB9KS50eXBlID09PSAndGV4dCcgJiYgdHlwZW9mIChibG9jayBhcyB7IHRleHQ/OiB1bmtub3duIH0pLnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXJ0cy5wdXNoKChibG9jayBhcyB7IHRleHQ6IHN0cmluZyB9KS50ZXh0KVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGFydHMuam9pbignICcpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKClcbn1cblxuLyoqIFdhbGsgdGhlIGNvbnZlcnNhdGlvbiBub2RlcyBhbmQgZ3JvdXAgY2hhbmdlZCBmaWxlcyBieSB1c2VyIHJvdW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RTZXNzaW9uUm91bmRzKG5vZGVzOiByZWFkb25seSBDb252ZXJzYXRpb25Ob2RlW10pOiBTZXNzaW9uUm91bmRbXSB7XG4gIGNvbnN0IHJvdW5kczogU2Vzc2lvblJvdW5kW10gPSBbXVxuICBsZXQgY3VycmVudDogU2Vzc2lvblJvdW5kIHwgbnVsbCA9IG51bGxcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCA9PT0gJ3VzZXInKSB7XG4gICAgICBjdXJyZW50ID0geyByb3VuZDogcm91bmRzLmxlbmd0aCArIDEsIGxhYmVsOiB1c2VyVGV4dChub2RlKS5zbGljZSgwLCA2MCksIGNoYW5nZXM6IFtdIH1cbiAgICAgIHJvdW5kcy5wdXNoKGN1cnJlbnQpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAobm9kZS5raW5kICE9PSAndG9vbC1yZXN1bHQnIHx8ICFjdXJyZW50KSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnQuY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IGNoYW5nZS5wYXRoICYmIGMudG9vbCA9PT0gY2hhbmdlLnRvb2wpXG4gICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgaWYgKGNoYW5nZS5oYXNEaWZmKSB7XG4gICAgICAgICAgZXhpc3RpbmcuaHVua3MucHVzaCguLi5jaGFuZ2UuaHVua3MpXG4gICAgICAgICAgZXhpc3RpbmcuaGFzRGlmZiA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudC5jaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm91bmRzLmZpbHRlcigocikgPT4gci5jaGFuZ2VzLmxlbmd0aCA+IDApXG59XG5cbi8qKiBDb3VudCBvZiBjaGFuZ2VkIGZpbGVzIGFjcm9zcyBhbGwgcm91bmRzIChmb3IgdGhlIGhlYWRlciBiYWRnZSkuICovXG5leHBvcnQgZnVuY3Rpb24gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogbnVtYmVyIHtcbiAgbGV0IGNvdW50ID0gMFxuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JykgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhbmdlLnRvb2x9OiR7Y2hhbmdlLnBhdGh9YFxuICAgICAgaWYgKCFzZWVuLmhhcyhrZXkpKSB7XG4gICAgICAgIHNlZW4uYWRkKGtleSlcbiAgICAgICAgY291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnRcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWZmIHJlbmRlcmluZy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogU3BsaXQgb25lIGBnaXQgc2hvdyAtLWZvcm1hdD1gIGRpZmYgaW50byBwZXItZmlsZSBzZWdtZW50cy4gKi9cbmZ1bmN0aW9uIHNwbGl0Q29tbWl0RGlmZihkaWZmOiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXSB7XG4gIGNvbnN0IHNlZ21lbnRzOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nW10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9IHwgbnVsbCA9IG51bGxcbiAgZm9yIChjb25zdCBsaW5lIG9mIGRpZmYuc3BsaXQoJ1xcbicpKSB7XG4gICAgY29uc3QgbWF0Y2ggPSAvXmRpZmYgLS1naXQgYVxcLyguKj8pIGJcXC8vLmV4ZWMobGluZSlcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gICAgICBjdXJyZW50ID0geyBwYXRoOiBtYXRjaFsxXSwgdGV4dDogW2xpbmVdIH1cbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQudGV4dC5wdXNoKGxpbmUpXG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gIHJldHVybiBzZWdtZW50cy5tYXAoKHMpID0+ICh7IHBhdGg6IHMucGF0aCwgdGV4dDogcy50ZXh0LmpvaW4oJ1xcbicpIH0pKVxufVxuXG4vKiogU3RhdHVzIGxldHRlciBmb3IgYSBjb21taXQncyBmaWxlLCBkZXJpdmVkIGZyb20gaXRzIGRpZmYgc2VnbWVudCB0ZXh0LiAqL1xuZnVuY3Rpb24gY29tbWl0RmlsZVN0YXR1cyhzZWdtZW50VGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9ebmV3IGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnQSdcbiAgaWYgKC9eZGVsZXRlZCBmaWxlIG1vZGUvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ0QnXG4gIGlmICgvXnJlbmFtZSBmcm9tIC8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnUidcbiAgcmV0dXJuICdNJ1xufVxuXG50eXBlIERpZmZSb3cgPSB7IGtpbmQ6ICdhZGQnIHwgJ2RlbCcgfCAnY3R4JyB8ICdodW5rJyB8ICdmaWxlJyB8ICdub3RlJzsgdGV4dDogc3RyaW5nIH1cblxuLyoqIENsYXNzaWZ5IHJhdyB1bmlmaWVkLWRpZmYgdGV4dCAoZ2l0IG91dHB1dCkgaW50byByb3dzLiAqL1xuZnVuY3Rpb24gZ2l0RGlmZlJvd3MoZGlmZjogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgcmV0dXJuIGRpZmYuc3BsaXQoJ1xcbicpLm1hcCgobGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykpIHJldHVybiB7IGtpbmQ6ICdmaWxlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkgcmV0dXJuIHsga2luZDogJ2h1bmsnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIHJldHVybiB7IGtpbmQ6ICdhZGQnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIHJldHVybiB7IGtpbmQ6ICdkZWwnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSByZXR1cm4geyBraW5kOiAnbm90ZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIHJldHVybiB7IGtpbmQ6ICdjdHgnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgfSlcbn1cblxuLyoqIENvbXB1dGUgYWRkL2RlbC9jdHggcm93cyBiZXR3ZWVuIHR3byB0ZXh0cyAodGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSkuICovXG5mdW5jdGlvbiB0ZXh0RGlmZlJvd3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvd3Ncbn1cblxuLyoqIEFsbCByb3dzIGZvciBvbmUgcm91bmQgY2hhbmdlIChtdWx0aXBsZSBodW5rcyBnZXQgYEBAYCBzZXBhcmF0b3JzKS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVJvd3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IERpZmZSb3dbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGNoYW5nZS5odW5rcy5mb3JFYWNoKChodW5rLCBpKSA9PiB7XG4gICAgaWYgKGNoYW5nZS5odW5rcy5sZW5ndGggPiAxKSByb3dzLnB1c2goeyBraW5kOiAnaHVuaycsIHRleHQ6IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIH0pXG4gICAgcm93cy5wdXNoKC4uLnRleHREaWZmUm93cyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dCkpXG4gIH0pXG4gIHJldHVybiByb3dzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3BsaXQgKHR3by1jb2x1bW4pIGRpZmYgdmlldy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogT25lIGFsaWduZWQgcm93IG9mIHRoZSBzaWRlLWJ5LXNpZGUgdmlldy4gKi9cbmludGVyZmFjZSBTcGxpdFJvdyB7XG4gIGxlZnQ6IHN0cmluZ1xuICByaWdodDogc3RyaW5nXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBvbGQgZmlsZSwgb3IgbnVsbCAocHVyZSBhZGRpdGlvbikuICovXG4gIGxlZnROdW06IG51bWJlciB8IG51bGxcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG5ldyBmaWxlLCBvciBudWxsIChwdXJlIGRlbGV0aW9uKS4gKi9cbiAgcmlnaHROdW06IG51bWJlciB8IG51bGxcbiAga2luZDogJ2N0eCcgfCAnY2hhbmdlJ1xufVxuXG4vKiogT25lIHNpZGUtYnktc2lkZSBibG9jayAoYSBodW5rIHdpdGggaXRzIGBAQGAgaGVhZGVyKS4gKi9cbmludGVyZmFjZSBTcGxpdEJsb2NrIHtcbiAgaGVhZDogc3RyaW5nIHwgbnVsbFxuICByb3dzOiBTcGxpdFJvd1tdXG59XG5cbi8qKlxuICogUGFpciBhZGQvZGVsIHJvd3MgaW50byBhbGlnbmVkIGxlZnQvcmlnaHQgY29sdW1ucy4gUmVtb3ZlZCBsaW5lcyBidWZmZXJcbiAqIHVudGlsIHRoZSBtYXRjaGluZyBhZGRpdGlvbnMgYXJyaXZlICh1bmlmaWVkIGRpZmYgb3JkZXJzIGRlbGV0aW9ucyBiZWZvcmVcbiAqIGFkZGl0aW9ucyksIHNvIHB1cmUgZGVsZXRpb25zIGFuZCBwdXJlIGFkZGl0aW9ucyBzdGlsbCBnZXQgdGhlaXIgb3duIHJvd1xuICogd2l0aCBhbiBlbXB0eSBjZWxsIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLiBMaW5lIG51bWJlcnMgdHJhY2sgZnJvbSB0aGUgaHVua1xuICogaGVhZGVyJ3MgYC1hLGIgK2MsZGAgcG9zaXRpb25zLlxuICovXG5mdW5jdGlvbiBwYWlyUm93cyhyb3dzOiBEaWZmUm93W10sIG9sZFN0YXJ0OiBudW1iZXIsIG5ld1N0YXJ0OiBudW1iZXIpOiBTcGxpdFJvd1tdIHtcbiAgY29uc3Qgb3V0OiBTcGxpdFJvd1tdID0gW11cbiAgbGV0IG9sZExpbmUgPSBvbGRTdGFydFxuICBsZXQgbmV3TGluZSA9IG5ld1N0YXJ0XG4gIGxldCBwZW5kaW5nOiB7IHRleHQ6IHN0cmluZzsgbnVtOiBudW1iZXIgfVtdID0gW11cbiAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBwIG9mIHBlbmRpbmcpIG91dC5wdXNoKHsgbGVmdDogcC50ZXh0LCByaWdodDogJycsIGxlZnROdW06IHAubnVtLCByaWdodE51bTogbnVsbCwga2luZDogJ2NoYW5nZScgfSlcbiAgICBwZW5kaW5nID0gW11cbiAgfVxuICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgcGVuZGluZy5wdXNoKHsgdGV4dDogcm93LnRleHQuc2xpY2UoMSksIG51bTogb2xkTGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgIGNvbnN0IHAgPSBwZW5kaW5nLnNoaWZ0KClcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogcD8udGV4dCA/PyAnJywgcmlnaHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBsZWZ0TnVtOiBwPy5udW0gPz8gbnVsbCwgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2NoYW5nZScgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgZmx1c2goKVxuICAgICAgLy8gVW5pZmllZC1kaWZmIGNvbnRleHQgbGluZXMgY2FycnkgYSBsZWFkaW5nIHNwYWNlIFx1MjAxNCBzdHJpcCBpdCBmb3IgdGhlXG4gICAgICAvLyBzcGxpdCBjZWxscyBzbyBib3RoIGNvbHVtbnMgcmVuZGVyIGJhcmUgdGV4dC5cbiAgICAgIGNvbnN0IHRleHQgPSByb3cudGV4dC5zdGFydHNXaXRoKCcgJykgPyByb3cudGV4dC5zbGljZSgxKSA6IHJvdy50ZXh0XG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHRleHQsIHJpZ2h0OiB0ZXh0LCBsZWZ0TnVtOiBvbGRMaW5lKyssIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjdHgnIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGZsdXNoKCkgLy8gbm90ZXMgKFxcIE5vIG5ld2xpbmVcdTIwMjYpIGFuZCBzdHJheSByb3dzOiBqdXN0IGJyZWFrIHRoZSBwYWlyaW5nXG4gICAgfVxuICB9XG4gIGZsdXNoKClcbiAgcmV0dXJuIG91dFxufVxuXG4vKiogUGFyc2UgZ2l0IHVuaWZpZWQgZGlmZiB0ZXh0IGludG8gYmxvY2tzIChgLS0tLysrK2AgZmlsZSByb3dzIGFuZCBgQEBgIGh1bmtzKS4gKi9cbmNvbnN0IEdJVF9NRVRBID0gL14oZGlmZiAtLWdpdCB8aW5kZXggfG5ldyBmaWxlIHxkZWxldGVkIGZpbGUgfG9sZCBtb2RlIHxuZXcgbW9kZSB8c2ltaWxhcml0eSBpbmRleCB8cmVuYW1lIChmcm9tfHRvKSB8QmluYXJ5IGZpbGVzICkvXG5cbmZ1bmN0aW9uIHBhcnNlR2l0QmxvY2tzKGRpZmY6IHN0cmluZyk6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10ge1xuICBjb25zdCBibG9ja3M6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH0gfCBudWxsID0gbnVsbFxuICBjb25zdCBsaW5lcyA9IGRpZmYuc3BsaXQoJ1xcbicpXG4gIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgbGV0IGtpbmQ6IERpZmZSb3dbJ2tpbmQnXVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykgfHwgR0lUX01FVEEudGVzdChsaW5lKSkga2luZCA9ICdmaWxlJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkga2luZCA9ICdodW5rJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKycpKSBraW5kID0gJ2FkZCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkga2luZCA9ICdkZWwnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSBraW5kID0gJ25vdGUnXG4gICAgZWxzZSBraW5kID0gJ2N0eCdcbiAgICBpZiAoa2luZCA9PT0gJ2ZpbGUnIHx8IGtpbmQgPT09ICdodW5rJykge1xuICAgICAgY3VycmVudCA9IHsgaGVhZDogeyBraW5kLCB0ZXh0OiBsaW5lIH0sIHJvd3M6IFtdIH1cbiAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY3VycmVudCkge1xuICAgICAgICBjdXJyZW50ID0geyBoZWFkOiBudWxsLCByb3dzOiBbXSB9XG4gICAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgICB9XG4gICAgICBjdXJyZW50LnJvd3MucHVzaCh7IGtpbmQsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJsb2Nrc1xufVxuXG4vKiogSHVuayBzdGFydCBwb3NpdGlvbnMgZnJvbSBhIGBAQCAtYSxiICtjLGQgQEBgIGhlYWRlci4gKi9cbmZ1bmN0aW9uIGh1bmtTdGFydHMoaGVhZDogc3RyaW5nKTogeyBvbGRTdGFydDogbnVtYmVyOyBuZXdTdGFydDogbnVtYmVyIH0ge1xuICBjb25zdCBtID0gL15AQCAtKFxcZCspKD86LFxcZCspPyBcXCsoXFxkKykvLmV4ZWMoaGVhZClcbiAgcmV0dXJuIHsgb2xkU3RhcnQ6IG0gPyBOdW1iZXIobVsxXSkgOiAxLCBuZXdTdGFydDogbSA/IE51bWJlcihtWzJdKSA6IDEgfVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgYSBnaXQgdW5pZmllZCBkaWZmIChza2lwcyBwdXJlIGZpbGUtaGVhZGVyIGJsb2NrcykuICovXG5mdW5jdGlvbiBnaXRTcGxpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICByZXR1cm4gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgICAuZmlsdGVyKChiKSA9PiBiLmhlYWQ/LmtpbmQgIT09ICdmaWxlJyAmJiAoYi5yb3dzLmxlbmd0aCA+IDAgfHwgYi5oZWFkPy5raW5kID09PSAnaHVuaycpKVxuICAgIC5tYXAoKGIpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0cyA9IGIuaGVhZCA/IGh1bmtTdGFydHMoYi5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgcmV0dXJuIHsgaGVhZDogYi5oZWFkPy5raW5kID09PSAnaHVuaycgPyBiLmhlYWQudGV4dCA6IG51bGwsIHJvd3M6IHBhaXJSb3dzKGIucm93cywgc3RhcnRzLm9sZFN0YXJ0LCBzdGFydHMubmV3U3RhcnQpIH1cbiAgICB9KVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgdGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSAob2xkVGV4dC9uZXdUZXh0KS4gKi9cbmZ1bmN0aW9uIHRleHRTcGxpdEJsb2NrcyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gW3sgaGVhZDogbnVsbCwgcm93czogcGFpclJvd3Mocm93cywgMSwgMSkgfV1cbn1cblxuLyoqIEFsbCBzaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBvbmUgcm91bmQgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hhbmdlU3BsaXRCbG9ja3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IFNwbGl0QmxvY2tbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIHJldHVybiBjaGFuZ2UuaHVua3MubWFwKChodW5rLCBpKSA9PiAoe1xuICAgIGhlYWQ6IGNoYW5nZS5odW5rcy5sZW5ndGggPiAxID8gYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgOiBudWxsLFxuICAgIHJvd3M6IHRleHRTcGxpdEJsb2NrcyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dClbMF0ucm93cyxcbiAgfSkpXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3R5bGVzIChkc2RyLSo7IHRoZSBoZWFkZXIgdHJpZ2dlciBtaXJyb3JzIHRoZSBpbi10cmVlIGFjdGlvbiByb3dzKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBSRVZJRVdfQ1NTID0gYFxuLmRzZHItdHJpZ2dlcnttaW4taGVpZ2h0OjI4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjRweDtwYWRkaW5nOjNweCA2cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXRyaWdnZXI6aG92ZXIsLmRzZHItdHJpZ2dlcjpmb2N1cy12aXNpYmxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbGFiZWx7bWFyZ2luLWxlZnQ6MnB4fVxuLmRzZHItY291bnR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDttaW4td2lkdGg6MTZweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA1cHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItb3ZlcmxheXtwb3NpdGlvbjpmaXhlZDtpbnNldDowO3otaW5kZXg6MjAwO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNDUpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtwYWRkaW5nOjMycHh9XG4uZHNkci1wYW5lbHtib3gtc2l6aW5nOmJvcmRlci1ib3g7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6bWluKDExMjBweCwxMDAlKTtoZWlnaHQ6bWluKDcyMHB4LGNhbGMoMTAwdmggLSA2NHB4KSk7bWF4LXdpZHRoOmNhbGMoMTAwdncgLSA2NHB4KTttYXgtaGVpZ2h0OmNhbGMoMTAwdmggLSA2NHB4KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czoxNHB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItcmVzaXple3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NX1cbi5kc2RyLXJlc2l6ZS1le3RvcDowO3JpZ2h0Oi0zcHg7d2lkdGg6N3B4O2hlaWdodDoxMDAlO2N1cnNvcjpldy1yZXNpemV9XG4uZHNkci1yZXNpemUtc3tib3R0b206LTNweDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6N3B4O2N1cnNvcjpucy1yZXNpemV9XG4uZHNkci1yZXNpemUtc2V7cmlnaHQ6LTRweDtib3R0b206LTRweDt3aWR0aDoxNXB4O2hlaWdodDoxNXB4O2N1cnNvcjpud3NlLXJlc2l6ZX1cbi5kc2RyLWhlYWRlcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6MTJweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLXRpdGxle2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zdWJ0aXRsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItdGFic3tkaXNwbGF5OmZsZXg7Z2FwOjRweDttYXJnaW4tbGVmdDoxNHB4fVxuLmRzZHItdGFie2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI2cHg7Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoycHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLXRhYjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXRhYi1hY3RpdmV7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zY29wZXtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21hcmdpbi1sZWZ0OjhweH1cbi5kc2RyLXNjb3BlIC5kc2RyLXNlbC10cmlnZ2Vye21pbi13aWR0aDoxMTBweDtoZWlnaHQ6MjZweDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MCA4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1zcGFjZXJ7ZmxleDoxfVxuLmRzZHItYnRue2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweH1cbi5kc2RyLWJ0bjpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuOmRpc2FibGVke29wYWNpdHk6LjU7Y3Vyc29yOmRlZmF1bHR9XG4uZHNkci1idG4tcHJpbWFyeXtib3JkZXItY29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC00MDApO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcjpob3Zlcjpub3QoOmRpc2FibGVkKXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tY29uZmlybXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItYnRuLWNvbmZpcm06aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1jb21taXQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjIwMHB4O21pbi1oZWlnaHQ6MjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjNweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItY29tbWl0LWlucHV0OjpwbGFjZWhvbGRlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtY2FwdGlvbil9XG4uZHNkci1jb21taXQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1zZWN0aW9ue2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjEwcHggOHB4IDNweDtmb250LXdlaWdodDo2MDA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4fVxuLmRzZHItc2VjdGlvbjpmaXJzdC1jaGlsZHtwYWRkaW5nLXRvcDo0cHh9XG4uZHNkci1icmFuY2h7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NHB4IDhweCA4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1icmFuY2gtcmVme2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczttaW4td2lkdGg6MDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnJhbmNoLWFycm93e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1icmFuY2gtc3RhdHtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWJyYW5jaC1haGVhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1iZWhpbmR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXdhcm4tcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtc3luY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdHtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NXB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY29tbWl0OmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRsLXNlbGVjdGVkIC5kc2RyLWNvbW1pdHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10aW1lbGluZXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItdGwtaXRlbXtkaXNwbGF5OmZsZXg7Z2FwOjZweDthbGlnbi1pdGVtczpzdHJldGNoO2JvcmRlci1yYWRpdXM6OHB4fVxuLmRzZHItdGwtcmFpbHtwb3NpdGlvbjpyZWxhdGl2ZTtmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcn1cbi5kc2RyLXRsLXJhaWw6OmJlZm9yZXtjb250ZW50OlwiXCI7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7Ym90dG9tOjA7bGVmdDo1MCU7d2lkdGg6MXB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMil9XG4uZHNkci10bC1pdGVtOmZpcnN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXt0b3A6OXB4fVxuLmRzZHItdGwtaXRlbTpsYXN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXtib3R0b206YXV0bztoZWlnaHQ6OXB4fVxuLmRzZHItdGwtZG90e3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MTt0b3A6OXB4O2ZsZXg6bm9uZTt3aWR0aDo3cHg7aGVpZ2h0OjdweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItdGwtZG90LWxvY2Fse2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1kb3QtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWNvbW1pdC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4td2lkdGg6MH1cbi5kc2RyLWNvbW1pdC1zaG9ydHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1zdWJqZWN0e2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1jb21taXQtbWV0YXtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmctbGVmdDowfVxuLmRzZHItdGwtYmFkZ2V7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDVweH1cbi5kc2RyLXRsLWJhZGdlLWxvY2Fse2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWJhZGdlLXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItZGlmZi1oYXNoe21hcmdpbi1sZWZ0OjhweDtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LWZpbGUtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItY29tbWl0LWZpbGUtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7bWFyZ2luLWxlZnQ6NHB4fVxuLmRzZHItY2ZnLWNhcmR7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXItcmFkaXVzOjEycHg7bGlzdC1zdHlsZTpub25lO3RyYW5zaXRpb246Ym9yZGVyLWNvbG9yIC4xNnMsYmFja2dyb3VuZCAuMTZzfVxuLmRzZHItY2ZnLWNhcmQ6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWNhcmQtb3BlbntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jZmctaGVhZHthcHBlYXJhbmNlOm5vbmU7d2lkdGg6MTAwJTtmb250OmluaGVyaXQ7Y29sb3I6aW5oZXJpdDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czoxMnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtwYWRkaW5nOjE0cHggMTZweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctaGVhZDpmb2N1cy12aXNpYmxle291dGxpbmU6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lLW9mZnNldDotMnB4fVxuLmRzZHItY2ZnLWhlYWQtdGV4dHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47ZmxleDoxO2dhcDo0cHg7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLW5hbWV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjYwMDtsaW5lLWhlaWdodDoxLjR9XG4uZHNkci1jZmctZGVzY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1jYXJldHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTZzfVxuLmRzZHItY2ZnLWNhcmV0LW9wZW57dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItY2ZnLWJvZHl7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7bWFyZ2luOjAgMTZweDtwYWRkaW5nLWJvdHRvbTo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLWNmZy1maWVsZHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjEycHggMDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctZmllbGQrLmRzZHItY2ZnLWZpZWxke2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItY2ZnLWxhYmVse21pbi13aWR0aDowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NTAwO2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1oaW50e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLXBlbmRpbmd7d2hpdGUtc3BhY2U6bm93cmFwO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDtmbGV4Om5vbmU7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxN3B4fVxuLmRzZHItY2ZnLWZhaWxlZHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZXJyb3IpO2ZsZXg6MTttYXJnaW46MDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctYWN0aW9uc3tib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzoxMnB4IDAgNHB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWJvZHl7ZGlzcGxheTpmbGV4O2ZsZXg6MTttaW4taGVpZ2h0OjB9XG4uZHNkci1maWxlc3t3aWR0aDozMDBweDtmbGV4Om5vbmU7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtvdmVyZmxvdy15OmF1dG87cGFkZGluZzo4cHh9XG4uZHNkci1yb3VuZHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo4cHggOHB4IDNweDtmb250LXdlaWdodDo2MDB9XG4uZHNkci1yb3VuZC1sYWJlbHt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NDAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItZmlsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maWxlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbGUtc2VsZWN0ZWR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZGlye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItZGlyOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kaXItY2FyZXR7ZmxleDpub25lO3dpZHRoOjEycHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpci1uYW1le2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItZGlyLWNvdW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWZpbGUtbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmlsZS1zdGF0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWNoaXB7ZmxleDpub25lO21pbi13aWR0aDoyMnB4O3RleHQtYWxpZ246Y2VudGVyO2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNoaXAtbXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtYXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtZHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xNik7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWNoaXAtcntiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpO2NvbG9yOiM1OGE2ZmZ9XG4uZHNkci1jaGlwLXV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXRvb2x7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1kaWZme2ZsZXg6MTttaW4td2lkdGg6MDtvdmVyZmxvdzphdXRvO3BhZGRpbmc6MTBweCAwfVxuLmRzZHItZGlmZi1lbXB0eXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7aGVpZ2h0OjEwMCU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWRpZmYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6NnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItZGlmZi1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZGlmZi1zdGF0c3tmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXNjcm9sbHtmbGV4OjE7bWluLWhlaWdodDowO292ZXJmbG93OmF1dG87ZGlzcGxheTpmbGV4fVxuLmRzZHItcHJle21hcmdpbjowO3BhZGRpbmc6OHB4IDA7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KTt3aGl0ZS1zcGFjZTpwcmU7bWluLXdpZHRoOjEwMCU7ZmxleDoxfVxuLmRzZHItbGluZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MTBweDtwYWRkaW5nOjAgMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cG9zaXRpb246cmVsYXRpdmV9XG4uZHNkci1saW5lLW51bXtmbGV4Om5vbmU7d2lkdGg6MzRweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO29wYWNpdHk6Ljc1fVxuLmRzZHItbGluZS10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpwcmV9XG4uZHNkci1jb21tZW50LWFkZHtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE4cHg7aGVpZ2h0OjE4cHg7Ym9yZGVyLXJhZGl1czo2cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO21hcmdpbi10b3A6MXB4O3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1jb21tZW50LWFkZCwuZHNkci1jb21tZW50LWFkZDpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWNvbW1lbnQtYWRkOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jb21tZW50LWhhc3t2aXNpYmlsaXR5OnZpc2libGU7YmFja2dyb3VuZDpjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDE2JSwgdHJhbnNwYXJlbnQpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKTtib3JkZXItY29sb3I6dHJhbnNwYXJlbnQ7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItbGluZS1jb21tZW50ZWR7Ym94LXNoYWRvdzppbnNldCAzcHggMCAwIGNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCkgNzAlLCB0cmFuc3BhcmVudCl9XG4uZHNkci1jb21tZW50LWVkaXRvcntkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLWNvbW1lbnQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDo1MnB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo2cHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3Jlc2l6ZTp2ZXJ0aWNhbH1cbi5kc2RyLWNvbW1lbnQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1jb21tZW50LWFjdGlvbnN7ZGlzcGxheTpmbGV4O2dhcDo2cHg7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kfVxuLmRzZHItY29tbWVudC1wb3B7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoyMDtyaWdodDoxNnB4O3RvcDpjYWxjKDEwMCUgKyAycHgpO21pbi13aWR0aDoyODBweDttYXgtd2lkdGg6NDQwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3JkZXItcmFkaXVzOjEwcHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7cGFkZGluZzo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4fVxuLmRzZHItY29tbWVudC1pdGVte2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtwYWRkaW5nLWJvdHRvbTo2cHh9XG4uZHNkci1jb21tZW50LWl0ZW06bGFzdC1jaGlsZHtib3JkZXItYm90dG9tOjA7cGFkZGluZy1ib3R0b206MH1cbi5kc2RyLWNvbW1lbnQtdGV4dHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWVudC1tZXRhe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWVudC1tZXRhIC5kc2RyLWJ0bnttaW4taGVpZ2h0OjIwcHg7cGFkZGluZzowIDZweDtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O21hcmdpbi1sZWZ0OmF1dG99XG4uZHNkci1vcGVubGluZXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE4cHg7aGVpZ2h0OjE4cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1vcGVubGluZSwuZHNkci1vcGVubGluZTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLW9wZW5saW5lOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWxpbmUtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDNweCAwIDAgdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKX1cbi5kc2RyLWZpbmRpbmctUDB7LS1kc2RyLWZpbmRpbmctY29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctUDF7LS1kc2RyLWZpbmRpbmctY29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctUDJ7LS1kc2RyLWZpbmRpbmctY29sb3I6I2QyOTkyMn1cbi5kc2RyLWZpbmRpbmctUDN7LS1kc2RyLWZpbmRpbmctY29sb3I6IzhiOTQ5ZX1cbi5kc2RyLWZpbmRpbmctdGFne2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydDttYXJnaW4tdG9wOjJweH1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXJldmlldy1zdHJpcHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO2ZvbnQtc2l6ZToxMnB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItcmV2aWV3LW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWJhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctbW9kZWx7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXJldmlldy10b2dnbGUtb257Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maW5kaW5nc3tkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWF4LWhlaWdodDoyNjBweDtvdmVyZmxvdy15OmF1dG99XG4uZHNkci1maW5kaW5nLWl0ZW17ZGlzcGxheTpmbGV4O2dhcDo4cHg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0fVxuLmRzZHItZmluZGluZy1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbmRpbmctYm9keXtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4fVxuLmRzZHItZmluZGluZy10aXRsZXtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpiYXNlbGluZTtnYXA6OHB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItZmluZGluZy1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo0MDB9XG4uZHNkci1maW5kaW5nLWRldGFpbHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1maW5kaW5nLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbmRpbmctc3VnZ2VzdGlvbntkaXNwbGF5OmJsb2NrO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjRweCA4cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1wcntkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo0cHggOHB4IDhweH1cbi5kc2RyLXByLWl0ZW17ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXR9XG4uZHNkci1wci1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXByLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXByLXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLWRvY2t7Ym94LXNpemluZzpib3JkZXItYm94O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjJweDt3aWR0aDoxMDAlO21heC13aWR0aDp2YXIoLS1kc2gtY29tcG9zZXItY2FyZC1tYXgtd2lkdGgsIDc4MHB4KTttYXJnaW46MCBhdXRvIGNhbGMoLTEgKiB2YXIoLS1kc2gtY29tcG9zZXItc3RhY2stZ2FwLCA2cHgpIC0gOHB4KTtwYWRkaW5nOjhweCAxNnB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLWlucHV0LW1ham9yKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDItZGFya21vZGUtdGhpbik7Ym9yZGVyLWJvdHRvbTpub25lO2JvcmRlci1yYWRpdXM6MjJweCAyMnB4IDAgMDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWRvY2staGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWluLWhlaWdodDoyMnB4fVxuLmRzZHItZG9jay1pY29ue2Rpc3BsYXk6aW5saW5lLWZsZXg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpfVxuLmRzZHItZG9jay1jb3VudHtmb250LXdlaWdodDo2MDA7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci1kb2NrLWNsb3Nle2ZsZXg6bm9uZTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjIwcHg7aGVpZ2h0OjIwcHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MH1cbi5kc2RyLWRvY2stY2xvc2U6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWRvY2stbGlzdHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7cGFkZGluZy10b3A6NHB4O21hcmdpbi10b3A6MnB4O21heC1oZWlnaHQ6MTY4cHg7b3ZlcmZsb3cteTphdXRvfVxuLmRzZHItZG9jay1pdGVte2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjFweDt0ZXh0LWFsaWduOmxlZnQ7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjRweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0fVxuLmRzZHItZG9jay1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWRvY2stbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZG9jay10ZXh0e2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7ZGlzcGxheTotd2Via2l0LWJveDstd2Via2l0LWxpbmUtY2xhbXA6Mjstd2Via2l0LWJveC1vcmllbnQ6dmVydGljYWw7b3ZlcmZsb3c6aGlkZGVuO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1zZW5ke3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NDA7dG9wOjUycHg7cmlnaHQ6MTZweDt3aWR0aDptaW4oNDgwcHgsY2FsYygxMDAlIC0gMzJweCkpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym9yZGVyLXJhZGl1czoxMnB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO3BhZGRpbmc6MTJweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo4cHh9XG4uZHNkci1zZW5kLXRpdGxle2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZW5kLWhpbnR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc2VuZC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjE0MHB4O21heC1oZWlnaHQ6MzIwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cmVzaXplOnZlcnRpY2FsO3doaXRlLXNwYWNlOnByZS13cmFwfVxuLmRzZHItbGluZS1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItbGluZS1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItbGluZS1odW5re2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWZpbGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtbm90ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc3R5bGU6aXRhbGljfVxuLmRzZHItaHVuay1iYXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O3BhZGRpbmc6MnB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMil9XG4uZHNkci1odW5rLWJhciAuZHNkci1idG57bWluLWhlaWdodDoyMnB4O3BhZGRpbmc6MXB4IDhweDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4fVxuLmRzZHItaHVuay1sYXllcntmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7bWFyZ2luLXJpZ2h0OmF1dG99XG4uZHNkci1mb290e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWluLWhlaWdodDozNnB4fVxuLmRzZHItbm90aWNle2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbm90aWNlLW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItbm90aWNlLWVycm9ye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXNwaW5uZXJ7ZmxleDpub25lO3dpZHRoOjEycHg7aGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjJweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItdG9wLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2FuaW1hdGlvbjpkc2RyLXNwaW4gLjhzIGxpbmVhciBpbmZpbml0ZX1cbkBrZXlmcmFtZXMgZHNkci1zcGlue3Rve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19XG4uZHNkci1lbXB0eXtwYWRkaW5nOjQwcHg7dGV4dC1hbGlnbjpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLW5vZGlmZntwYWRkaW5nOjhweCAxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEycHh9XG4uZHNkci1zZWx7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXNlbC10cmlnZ2Vye2JveC1zaXppbmc6Y29udGVudC1ib3g7bWluLXdpZHRoOjE4MHB4O2hlaWdodDozNHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTMpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MCAxMnB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoxLjU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweH1cbi5kc2RyLXNlbC10cmlnZ2VyOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLXNlbC10cmlnZ2VyOmZvY3VzLXZpc2libGV7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lOm5vbmV9XG4uZHNkci1zZWwtdHJpZ2dlciBzdmd7ZmxleDpub25lO3RyYW5zaXRpb246dHJhbnNmb3JtIC4xMnN9XG4uZHNkci1zZWwtdHJpZ2dlclthcmlhLWV4cGFuZGVkPVwidHJ1ZVwiXSBzdmd7dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItc2VsLXZhbHVle2ZsZXg6MTttaW4td2lkdGg6MDt0ZXh0LWFsaWduOmxlZnQ7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItc2VsLW1lbnV7ei1pbmRleDoyMDA7Ym94LXNpemluZzpib3JkZXItYm94O21pbi13aWR0aDoxMDAlO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7Ym9yZGVyLXJhZGl1czoxMHB4O21hcmdpbjowO3BhZGRpbmc6NHB4O2xpc3Qtc3R5bGU6bm9uZTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoxcHg7cG9zaXRpb246YWJzb2x1dGU7dG9wOmNhbGMoMTAwJSArIDVweCk7bGVmdDowfVxuLmRzZHItc2VsLW9wdGlvbntib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjMwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JvcmRlci1yYWRpdXM6N3B4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NXB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDt0ZXh0LWFsaWduOmxlZnQ7ZGlzcGxheTpmbGV4fVxuLmRzZHItc2VsLW9wdGlvbjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1zZWwtb3B0aW9uLWFjdGl2ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZWwtb3B0aW9uLW1hcmt7ZmxleDpub25lO3dpZHRoOjE0cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbGFiZWx7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXZpZXctdG9nZ2xle2Rpc3BsYXk6ZmxleDtnYXA6MnB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzoycHg7ZmxleDpub25lfVxuLmRzZHItdmlldy1idG57Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjJweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjVweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoxcHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4fVxuLmRzZHItdmlldy1idG46aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci12aWV3LWJ0bi1hY3RpdmV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNwbGl0e21pbi13aWR0aDoxMDAlfVxuLmRzZHItc3BsaXQtaGVhZHtkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6NHB4IDhweDtwb3NpdGlvbjpzdGlja3k7dG9wOjA7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKX1cbi5kc2RyLXNwbGl0LWhlYWQgZGl2e2Rpc3BsYXk6ZmxleDtnYXA6OHB4fVxuLmRzZHItc3BsaXQtaHVua3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjJweCAxNnB4fVxuLmRzZHItc3BsaXQtcm93e3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZTp2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtY2VsbDpob3ZlciAuZHNkci1jb21tZW50LWFkZCwuZHNkci1zcGxpdC1yb3c6aG92ZXIgLmRzZHItY29tbWVudC1hZGR7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItc3BsaXQtY2VsbHtkaXNwbGF5OmZsZXg7Z2FwOjhweDtwYWRkaW5nOjAgOHB4O3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXQtbnVte2ZsZXg6bm9uZTt3aWR0aDozNnB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZTpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSAtIDFweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjB9XG4uZHNkci1jZWxsLWZpbmRpbmd7Ym94LXNoYWRvdzppbnNldCAwIDAgMCAxcHggdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKTtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMDgpfVxuLmRzZHItY2VsbC1qdW1we2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNil9XG4uZHNkci1zcGxpdC1maW5kaW5ne2ZsZXg6bm9uZTtmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czozcHg7cGFkZGluZzowIDNweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo2MDA7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDB7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTgpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMntiYWNrZ3JvdW5kOnJnYmEoMjEwLDE1MywzNCwuMTYpO2NvbG9yOiNkMjk5MjJ9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QM3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc3BsaXQtb3BlbmxpbmV7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxNnB4O2hlaWdodDoxNnB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxO3BhZGRpbmc6MDt2aXNpYmlsaXR5OmhpZGRlbn1cbi5kc2RyLXNwbGl0LWNlbGw6aG92ZXIgLmRzZHItc3BsaXQtb3BlbmxpbmUsLmRzZHItc3BsaXQtb3BlbmxpbmU6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1zcGxpdC1vcGVubGluZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jZWxsLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1jZWxsLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1jZWxsLWRpbXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwxLCByZ2JhKDEyOCwxMjgsMTI4LC4wNSkpfVxuYFxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc3R5bGVbZGF0YS1wbHVnaW4tY3NzPSR7SlNPTi5zdHJpbmdpZnkoU1RZTEVfVEFHKX1dYCkgPT09IG51bGwpIHtcbiAgY29uc3QgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICB0YWcuZGF0YXNldC5wbHVnaW4gPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldydcbiAgdGFnLmRhdGFzZXQucGx1Z2luQ3NzID0gU1RZTEVfVEFHXG4gIHRhZy50ZXh0Q29udGVudCA9IFJFVklFV19DU1NcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpXG59XG5cbi8qKiBTaW1wbGlmaWVkIENoaW5lc2UgZGljdGlvbmFyeSAoa2V5LXNldCBzb3VyY2Ugb2YgdHJ1dGgpLiAqL1xuY29uc3QgemggPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1x1NUJBMVx1NjdFNVx1NUY1M1x1NTI0RFx1OTg3OVx1NzZFRVx1NEUwRVx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOScsXG4gICd0YWIuc2Vzc2lvbic6ICdcdTRGMUFcdThCRERcdTY2RjRcdTY1MzknLFxuICAndGFiLndvcmtzcGFjZSc6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAncmV2aWV3LnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdyZXZpZXcuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnXHU2RTM4XHU3OUJCIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnXHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHU0RTBEXHU2NjJGIGdpdCBcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1x1MzAwQ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOVx1MzAwRFx1OTg3NVx1N0I3RVx1NEUwRFx1NTNEN1x1NUY3MVx1NTRDRFx1RkYwQ1x1NEVDRFx1NTNFRlx1NjdFNVx1NzcwQlx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOVx1MzAwMicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdcdThGRDlcdTRFMkFcdTRGMUFcdThCRERcdThGRDhcdTZDQTFcdTY3MDlcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzlcdThCQjBcdTVGNTUnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSBcdThGNkUgXHUwMEI3IHtmaWxlc30gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdcdTdCMkMge3JvdW5kfSBcdThGNkUnLFxuICAncmV2aWV3LmVtcHR5JzogJ1x1NkNBMVx1NjcwOVx1NjcyQVx1NjNEMFx1NEVBNFx1NzY4NFx1NjZGNFx1NjUzOSBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdcdTUxNjhcdTkwRThcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnXHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1x1NTE2OFx1OTBFOFx1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlJzogJ1x1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAnaHVuay51bnN0YWdlJzogJ1x1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAnaHVuay51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnXHU2M0QwXHU0RUE0XHU4QkY0XHU2NjBFXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1x1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnXHU1REYyXHU2M0QwXHU0RUE0IHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ1x1NjNEMFx1NEVBNFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucHVzaGVkJzogJ1x1NURGMlx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdcdTYzQThcdTkwMDFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFoZWFkJzogJ1x1OTg4Nlx1NTE0OCB7bn0nLFxuICAncmV2aWV3LmJlaGluZCc6ICdcdTg0M0RcdTU0MEUge259JyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ1x1NTIwNlx1NjUyRlx1NEUwRVx1OEZEQ1x1N0EwQicsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdcdTY3MkFcdThCQkVcdTdGNkVcdTRFMEFcdTZFMzhcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnXHU1Mzg2XHU1M0YyJyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdcdTUzRDhcdTUyQThcdTY1ODdcdTRFRjYnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdcdTY3MkNcdTU3MzAnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAnXHU4RkRDXHU3QTBCJyxcbiAgJ3RpbWUubm93JzogJ1x1NTIxQVx1NTIxQScsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IFx1NTIwNlx1OTQ5Rlx1NTI0RCcsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBcdTVDMEZcdTY1RjZcdTUyNEQnLFxuICAndGltZS5kYXlzJzogJ3tufSBcdTU5MjlcdTUyNEQnLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnXHU1MjM3XHU2NUIwJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdcdTUxNzNcdTk1RUQnLFxuICAncmV2aWV3LmJ1c3knOiAnXHU1OTA0XHU3NDA2XHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ1x1NURGMnthY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjZcdUZGMDhcdTUyMjBcdTk2NjQge2RlbGV0ZWR9IFx1NEUyQVx1NjcyQVx1OERERlx1OEUyQVx1NjU4N1x1NEVGNlx1RkYwOScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICdcdTY3MkFcdThEREZcdThFMkEnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdcdTRFOENcdThGREJcdTUyMzYnLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnXHU4QkU1XHU0RkVFXHU2NTM5XHU2Q0ExXHU2NzA5IGRpZmYgXHU2NTcwXHU2MzZFJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnXHU1MzU1XHU2ODBGJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnXHU1M0NDXHU2ODBGJyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ1x1NTM5Rlx1NjU4N1x1NEVGNicsXG4gICd2aWV3LmFmdGVyJzogJ1x1NjVCMFx1NjU4N1x1NEVGNicsXG4gICdjb21tZW50LmFkZCc6ICdcdThCQzRcdThCQkFcdTZCNjRcdTg4NEMnLFxuICAnY29tbWVudC5zaG93JzogJ1x1NjdFNVx1NzcwQlx1OEJDNFx1OEJCQScsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ1x1OEJDNFx1OEJCQVx1MjAyNlx1RkYwOEN0cmwvXHUyMzE4K0VudGVyIFx1NEZERFx1NUI1OFx1RkYwOScsXG4gICdjb21tZW50LnNhdmUnOiAnXHU0RkREXHU1QjU4JyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ1x1NTNENlx1NkQ4OCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdcdTUyMjBcdTk2NjQnLFxuICAnY29tbWVudC5zYXZlZCc6ICdcdTVERjJcdTRGRERcdTVCNThcdThCQzRcdThCQkEnLFxuICAnY29tbWVudC5mYWlsZWQnOiAnXHU4QkM0XHU4QkJBXHU0RkREXHU1QjU4XHU1OTMxXHU4RDI1JyxcbiAgJ3Njb3BlLmxhYmVsJzogJ1x1ODMwM1x1NTZGNCcsXG4gICdzY29wZS5hbGwnOiAnXHU1MTY4XHU5MEU4JyxcbiAgJ3Njb3BlLnVuc3RhZ2VkJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdzY29wZS5zdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ3Njb3BlLmNvbW1pdCc6ICdcdTYzRDBcdTRFQTQnLFxuICAnc2NvcGUuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdzY29wZS5sYXN0LXR1cm4nOiAnXHU2NzAwXHU1NDBFXHU0RTAwXHU4RjZFJyxcbiAgJ3Jldmlldy5sYXN0VHVybkVtcHR5JzogJ1x1NjcwMFx1NTQwRVx1NEUwMFx1OEY2RVx1NkNBMVx1NjcwOVx1OEJCMFx1NUY1NVx1NTIzMFx1NjU4N1x1NEVGNlx1NEZFRVx1NjUzOSBcdTIwMTRcdTIwMTQgXHU3RUM4XHU3QUVGXHU1NDdEXHU0RUU0XHVGRjA4YmFzaFx1RkYwOVx1NjUzOVx1NjU4N1x1NEVGNlx1NEUwRFx1NEYxQVx1OEJBMVx1NTE2NVx1NEYxQVx1OEJERFx1OEJCMFx1NUY1NVx1RkYxQlx1NTNFRlx1NTIwN1x1NTIzMFx1MzAwQ1x1NTE2OFx1OTBFOFx1MzAwRFx1NjdFNVx1NzcwQiBnaXQgXHU1M0Q4XHU2NkY0JyxcbiAgJ3Njb3BlLmJhc2UnOiAnXHU1N0ZBXHU3RUJGXHU1MjA2XHU2NTJGJyxcbiAgJ3Njb3BlLmJyYW5jaFJlYWRvbmx5JzogJ1x1NTIwNlx1NjUyRlx1ODMwM1x1NTZGNFx1NTNFQVx1OEJGQlx1RkYwOFx1NUJGOVx1NkJENCBtZXJnZS1iYXNlXHVGRjBDXHU0RTBEXHU2M0QwXHU0RjlCXHU5MUM3XHU3RUIzL1x1NEUyMlx1NUYwM1x1RkYwOScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1x1NEVDRVx1NURFNlx1NEZBN1x1OTAwOVx1NjJFOVx1NjNEMFx1NEVBNFx1NjdFNVx1NzcwQiBkaWZmJyxcbiAgJ3Jldmlldy5zZW5kVG9BZ2VudCc6ICdcdTUzRDFcdTkwMDFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdcdTUzRDFcdTkwMDFcdTg4NENcdTUxODVcdThCQzRcdThCQkFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ1x1OEJDNFx1OEJCQVx1NEYxQVx1NEY1Q1x1NEUzQVx1OEJDNFx1NUJBMVx1NjMwN1x1NUYxNVx1NkNFOFx1NTE2NVx1NUY1M1x1NTI0RFx1NEYxQVx1OEJERFx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwOVx1MzAwMlx1NTNEMVx1OTAwMVx1NTkzMVx1OEQyNVx1NjVGNlx1OTAwMFx1NTMxNlx1NEUzQVx1NTkwRFx1NTIzNlx1NjU4N1x1NjcyQ1x1MzAwMicsXG4gICdyZXZpZXcuc2VudFRvQWdlbnQnOiAnXHU1REYyXHU1M0QxXHU5MDAxXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5jb3B5JzogJ1x1NTkwRFx1NTIzNlx1NjU4N1x1NjcyQycsXG4gICdyZXZpZXcuY29waWVkJzogJ1x1NURGMlx1NTkwRFx1NTIzNicsXG4gICdyZXZpZXcuY29weUZhaWxlZCc6ICdcdTU5MERcdTUyMzZcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnJldmlldyc6ICdcdThCQzRcdTVCQTEnLFxuICAncmV2aWV3LnJldmlld2luZyc6ICdcdThCQzRcdTVCQTFcdTRFMkRcdTIwMjYnLFxuICAncmV2aWV3LnJldmlld0ZhaWxlZCc6ICdcdThCQzRcdTVCQTFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnZlcmRpY3RDb3JyZWN0JzogJ1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RSBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnXHU4ODY1XHU0RTAxXHU1QjU4XHU1NzI4XHU5NUVFXHU5ODk4IFx1MjcxNycsXG4gICdyZXZpZXcubm9GaW5kaW5ncyc6ICdcdTZDQTFcdTY3MDlcdTUzRDFcdTczQjBcdTk1RUVcdTk4OTgnLFxuICAncmV2aWV3LmZpbmRpbmdzJzogJ3tufSBcdTY3NjFcdTUzRDFcdTczQjAnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnXHU3RjZFXHU0RkUxXHU1RUE2IHtjb25maWRlbmNlfScsXG4gICdyZXZpZXcuc3VnZ2VzdGlvbic6ICdcdTVFRkFcdThCQUUnLFxuICAncmV2aWV3LnNlbmRGaW5kaW5ncyc6ICdcdTUzRDFcdTkwMDFcdTUzRDFcdTczQjBcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdcdTVERjJcdTUzRDFcdTkwMDFcdTUzRDFcdTczQjBcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnJldmlld1Njb3BlJzogJ1x1OEJDNFx1NUJBMVx1ODMwM1x1NTZGNCcsXG4gICdwci50aXRsZSc6ICdQUiAje251bWJlcn0nLFxuICAncHIuY29tbWVudHMnOiAnUFIgXHU4QkM0XHU4QkJBICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnXHU2NUUwXHU1MTczXHU4MDU0IFBSJyxcbiAgJ3ByLnNlbmRDb21tZW50cyc6ICdcdTUzRDFcdTkwMDEgUFIgXHU4QkM0XHU4QkJBXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ2VkaXRvci5vcGVuRmlsZSc6ICdcdTU3MjhcdTdGMTZcdThGOTFcdTU2NjhcdTRFMkRcdTYyNTNcdTVGMDAnLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ1x1NTcyOFx1N0YxNlx1OEY5MVx1NTY2OFx1NEUyRFx1NjI1M1x1NUYwMFx1OEJFNVx1ODg0QycsXG4gICdlZGl0b3IuZmFpbGVkJzogJ1x1NjI1M1x1NUYwMFx1NTkzMVx1OEQyNScsXG4gICdyZXBvLmxhYmVsJzogJ1x1NEVEM1x1NUU5MycsXG4gICdyZXZpZXcuZG9ja0NvbW1lbnRzJzogJ1x1ODg0Q1x1NTE4NVx1OEJDNFx1OEJCQSB7bn0gXHU2NzYxJyxcbiAgJ3Jldmlldy5kb2NrSnVtcCc6ICdcdTcwQjlcdTUxRkJcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTYyNTNcdTVGMDBcdTVCRjlcdTVFOTRcdTUzRDhcdTY2RjQnLFxuICAncmV2aWV3LmRvY2tIaW50JzogJ1x1NTNEMVx1OTAwMVx1NkQ4OFx1NjA2Rlx1NjVGNlx1ODFFQVx1NTJBOFx1OTY0NFx1NUUyNicsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdcdTUzRDhcdTUyQTgnLFxuICAnc2V0dGluZ3MuZm9udCc6ICdcdTVCNTdcdTRGNTMnLFxuICAnc2V0dGluZ3Muc2l6ZSc6ICdcdTVCNTdcdTUzRjcnLFxuICAnY29uZmlnLnRpdGxlJzogJ1x1OTE0RFx1N0Y2RScsXG4gICdmb250Lm1vbm8nOiAnXHU3QjQ5XHU1QkJEXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjA5JyxcbiAgJ2ZvbnQuc3lzdGVtJzogJ1x1N0NGQlx1N0VERlx1NUI1N1x1NEY1MycsXG59IGFzIGNvbnN0XG5cbi8qKiBFbmdsaXNoIGRpY3Rpb25hcnksIGNoZWNrZWQgY29tcGxldGUgYWdhaW5zdCB0aGUgemgga2V5IHNldC4gKi9cbmNvbnN0IGVuOiBSZWNvcmQ8a2V5b2YgdHlwZW9mIHpoLCBzdHJpbmc+ID0ge1xuICAnYWN0aW9uLmxhYmVsJzogJ0NoYW5nZXMnLFxuICAnYWN0aW9uLmFyaWEnOiAnUmV2aWV3IHdvcmtzcGFjZSBhbmQgcGVyLXJvdW5kIGNoYW5nZXMnLFxuICAndGFiLnNlc3Npb24nOiAnU2Vzc2lvbicsXG4gICd0YWIud29ya3NwYWNlJzogJ1dvcmtzcGFjZScsXG4gICdyZXZpZXcudGl0bGUnOiAnQ2hhbmdlcycsXG4gICdyZXZpZXcuYnJhbmNoJzogJ2JyYW5jaCcsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnZGV0YWNoZWQgSEVBRCcsXG4gICdyZXZpZXcubm90UmVwbyc6ICdUaGlzIGRpcmVjdG9yeSBpcyBub3QgYSBnaXQgcmVwb3NpdG9yeScsXG4gICdyZXZpZXcubm90UmVwb0hpbnQnOiAnVGhlIFwiU2Vzc2lvblwiIHRhYiBzdGlsbCBzaG93cyBldmVyeSByb3VuZFxcJ3MgY2hhbmdlcy4nLFxuICAncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnOiAnTm8gZmlsZSBjaGFuZ2VzIHJlY29yZGVkIGluIHRoaXMgc2Vzc2lvbiB5ZXQnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSByb3VuZHMgXHUwMEI3IHtmaWxlc30gZmlsZXMnLFxuICAncmV2aWV3LnJvdW5kJzogJ1JvdW5kIHtyb3VuZH0nLFxuICAncmV2aWV3LmVtcHR5JzogJ05vIHVuY29tbWl0dGVkIGNoYW5nZXMgXHVEODNDXHVERjg5JyxcbiAgJ3Jldmlldy5sb2FkRXJyb3InOiAnRmFpbGVkIHRvIGxvYWQnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdBY2NlcHQnLFxuICAncmV2aWV3LnJldmVydCc6ICdSZXZlcnQnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdBY2NlcHQgYWxsJyxcbiAgJ3Jldmlldy5yZXZlcnRBbGwnOiAnUmV2ZXJ0IGFsbCcsXG4gICdyZXZpZXcudW5zdGFnZSc6ICdVbnN0YWdlJyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1Vuc3RhZ2UgYWxsJyxcbiAgJ2h1bmsuc3RhZ2UnOiAnU3RhZ2UnLFxuICAnaHVuay5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ2h1bmsudW5zdGFnZSc6ICdVbnN0YWdlJyxcbiAgJ2h1bmsuc3RhZ2VkJzogJ3N0YWdlZCcsXG4gICdodW5rLnVuc3RhZ2VkJzogJ3Vuc3RhZ2VkJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0JzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcmV2ZXJ0JyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcmV2ZXJ0IGFsbCcsXG4gICdyZXZpZXcuY29tbWl0JzogJ0NvbW1pdCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnQ29tbWl0IG1lc3NhZ2VcdTIwMjYnLFxuICAncmV2aWV3LnB1c2gnOiAnUHVzaCcsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSBwdXNoJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnQ29tbWl0dGVkIHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ0NvbW1pdCBmYWlsZWQnLFxuICAncmV2aWV3LnB1c2hlZCc6ICdQdXNoZWQnLFxuICAncmV2aWV3LnB1c2hGYWlsZWQnOiAnUHVzaCBmYWlsZWQnLFxuICAncmV2aWV3LmFoZWFkJzogJ3tufSBhaGVhZCcsXG4gICdyZXZpZXcuYmVoaW5kJzogJ3tufSBiZWhpbmQnLFxuICAncmV2aWV3LnNlY3Rpb25TdGFnZWQnOiAnU3RhZ2VkJyxcbiAgJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcyc6ICdDaGFuZ2VzJyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ0JyYW5jaCB2cyByZW1vdGUnLFxuICAncmV2aWV3Lm5vVXBzdHJlYW0nOiAnbm8gdXBzdHJlYW0nLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnSGlzdG9yeScsXG4gICdyZXZpZXcuY29tbWl0RmlsZXMnOiAnRmlsZXMnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdsb2NhbCcsXG4gICdoaXN0b3J5LnJlbW90ZSc6ICdyZW1vdGUnLFxuICAndGltZS5ub3cnOiAnanVzdCBub3cnLFxuICAndGltZS5taW51dGVzJzogJ3tufSBtaW4gYWdvJyxcbiAgJ3RpbWUuaG91cnMnOiAne259IGggYWdvJyxcbiAgJ3RpbWUuZGF5cyc6ICd7bn0gZCBhZ28nLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnUmVmcmVzaCcsXG4gICdyZXZpZXcuY2xvc2UnOiAnQ2xvc2UnLFxuICAncmV2aWV3LmJ1c3knOiAnV29ya2luZ1x1MjAyNicsXG4gICdyZXZpZXcuZG9uZSc6ICd7YWN0aW9ufSB7Y291bnR9IGZpbGVzJyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ3thY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcyAoe2RlbGV0ZWR9IHVudHJhY2tlZCBkZWxldGVkKScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnQWNjZXB0ZWQnLFxuICAncmV2aWV3LnJldmVydGVkJzogJ1JldmVydGVkJyxcbiAgJ3Jldmlldy51bnRyYWNrZWQnOiAndW50cmFja2VkJyxcbiAgJ3Jldmlldy5iaW5hcnknOiAnYmluYXJ5JyxcbiAgJ3Jldmlldy5ub0RpZmZEYXRhJzogJ05vIGRpZmYgZGF0YSBmb3IgdGhpcyBjaGFuZ2UnLFxuICAncmV2aWV3LmNoYW5nZXMnOiAne2FkZGVkfSsge2RlbGV0ZWR9LScsXG4gICd2aWV3LnNpbmdsZSc6ICdTaW5nbGUnLFxuICAndmlldy5zcGxpdCc6ICdTcGxpdCcsXG4gICd2aWV3LmJlZm9yZSc6ICdCZWZvcmUnLFxuICAndmlldy5hZnRlcic6ICdBZnRlcicsXG4gICdjb21tZW50LmFkZCc6ICdDb21tZW50IG9uIHRoaXMgbGluZScsXG4gICdjb21tZW50LnNob3cnOiAnVmlldyBjb21tZW50cycsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ0NvbW1lbnRcdTIwMjYgKEN0cmwvXHUyMzE4K0VudGVyIHRvIHNhdmUpJyxcbiAgJ2NvbW1lbnQuc2F2ZSc6ICdTYXZlJyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ0NhbmNlbCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdEZWxldGUnLFxuICAnY29tbWVudC5zYXZlZCc6ICdDb21tZW50IHNhdmVkJyxcbiAgJ2NvbW1lbnQuZmFpbGVkJzogJ0ZhaWxlZCB0byBzYXZlIGNvbW1lbnQnLFxuICAnc2NvcGUubGFiZWwnOiAnU2NvcGUnLFxuICAnc2NvcGUuYWxsJzogJ0FsbCcsXG4gICdzY29wZS51bnN0YWdlZCc6ICdVbnN0YWdlZCcsXG4gICdzY29wZS5zdGFnZWQnOiAnU3RhZ2VkJyxcbiAgJ3Njb3BlLmNvbW1pdCc6ICdDb21taXQnLFxuICAnc2NvcGUuYnJhbmNoJzogJ0JyYW5jaCcsXG4gICdzY29wZS5sYXN0LXR1cm4nOiAnTGFzdCB0dXJuJyxcbiAgJ3Jldmlldy5sYXN0VHVybkVtcHR5JzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBmb3IgdGhlIGxhc3QgdHVybiBcdTIwMTQgdGVybWluYWwgY29tbWFuZHMgKGJhc2gpIHRoYXQgZWRpdCBmaWxlcyBhcmUgbm90IHRyYWNrZWQgaW4gdGhlIHNlc3Npb24gbG9nOyBzd2l0Y2ggdG8gXCJBbGxcIiB0byBzZWUgZ2l0IGNoYW5nZXMnLFxuICAnc2NvcGUuYmFzZSc6ICdCYXNlIGJyYW5jaCcsXG4gICdzY29wZS5icmFuY2hSZWFkb25seSc6ICdCcmFuY2ggc2NvcGUgaXMgcmVhZC1vbmx5IChtZXJnZS1iYXNlIGRpZmY7IG5vIGFjY2VwdC9yZXZlcnQpJyxcbiAgJ3Jldmlldy5zZWxlY3RDb21taXQnOiAnU2VsZWN0IGEgY29tbWl0IGZyb20gdGhlIGxlZnQgdG8gdmlldyBpdHMgZGlmZicsXG4gICdyZXZpZXcuc2VuZFRvQWdlbnQnOiAnU2VuZCB0byBhZ2VudCcsXG4gICdyZXZpZXcuc2VuZFRpdGxlJzogJ1NlbmQgaW5saW5lIGNvbW1lbnRzIHRvIHRoZSBhZ2VudCcsXG4gICdyZXZpZXcuc2VuZEhpbnQnOiAnQ29tbWVudHMgYXJlIGluamVjdGVkIGludG8gdGhlIGN1cnJlbnQgc2Vzc2lvbiBhcyByZXZpZXcgZ3VpZGFuY2UgKEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50cykuIEZhbGxzIGJhY2sgdG8gY29weWFibGUgdGV4dCBpZiBzZW5kaW5nIGZhaWxzLicsXG4gICdyZXZpZXcuc2VudFRvQWdlbnQnOiAnU2VudCB0byBhZ2VudCcsXG4gICdyZXZpZXcuY29weSc6ICdDb3B5IHRleHQnLFxuICAncmV2aWV3LmNvcGllZCc6ICdDb3BpZWQnLFxuICAncmV2aWV3LmNvcHlGYWlsZWQnOiAnQ29weSBmYWlsZWQnLFxuICAncmV2aWV3LnJldmlldyc6ICdSZXZpZXcnLFxuICAncmV2aWV3LnJldmlld2luZyc6ICdSZXZpZXdpbmdcdTIwMjYnLFxuICAncmV2aWV3LnJldmlld0ZhaWxlZCc6ICdSZXZpZXcgZmFpbGVkJyxcbiAgJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCc6ICdQYXRjaCBpcyBjb3JyZWN0IFx1MjcxMycsXG4gICdyZXZpZXcudmVyZGljdEluY29ycmVjdCc6ICdQYXRjaCBuZWVkcyB3b3JrIFx1MjcxNycsXG4gICdyZXZpZXcubm9GaW5kaW5ncyc6ICdObyBpc3N1ZXMgZm91bmQnLFxuICAncmV2aWV3LmZpbmRpbmdzJzogJ3tufSBmaW5kaW5ncycsXG4gICdyZXZpZXcuY29uZmlkZW5jZSc6ICdjb25maWRlbmNlIHtjb25maWRlbmNlfScsXG4gICdyZXZpZXcuc3VnZ2VzdGlvbic6ICdTdWdnZXN0aW9uJyxcbiAgJ3Jldmlldy5zZW5kRmluZGluZ3MnOiAnU2VuZCBmaW5kaW5ncyB0byBhZ2VudCcsXG4gICdyZXZpZXcuc2VudEZpbmRpbmdzJzogJ0ZpbmRpbmdzIHNlbnQgdG8gYWdlbnQnLFxuICAncmV2aWV3LnJldmlld1Njb3BlJzogJ1JldmlldyBzY29wZScsXG4gICdwci50aXRsZSc6ICdQUiAje251bWJlcn0nLFxuICAncHIuY29tbWVudHMnOiAnUFIgY29tbWVudHMgKHtufSknLFxuICAncHIubm9Qcic6ICdObyBhc3NvY2lhdGVkIFBSJyxcbiAgJ3ByLnNlbmRDb21tZW50cyc6ICdTZW5kIFBSIGNvbW1lbnRzIHRvIGFnZW50JyxcbiAgJ2VkaXRvci5vcGVuRmlsZSc6ICdPcGVuIGluIGVkaXRvcicsXG4gICdlZGl0b3Iub3BlbkxpbmUnOiAnT3BlbiB0aGlzIGxpbmUgaW4gZWRpdG9yJyxcbiAgJ2VkaXRvci5mYWlsZWQnOiAnRmFpbGVkIHRvIG9wZW4nLFxuICAncmVwby5sYWJlbCc6ICdSZXBvJyxcbiAgJ3Jldmlldy5kb2NrQ29tbWVudHMnOiAne259IGlubGluZSBjb21tZW50cycsXG4gICdyZXZpZXcuZG9ja0p1bXAnOiAnT3BlbiB0aGUgbWF0Y2hpbmcgY2hhbmdlIGluIHRoZSByZXZpZXcgcGFuZWwnLFxuICAncmV2aWV3LmRvY2tIaW50JzogJ0F1dG8tY2FycmllZCB3aXRoIHlvdXIgbmV4dCBtZXNzYWdlJyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ0NoYW5nZXMnLFxuICAnc2V0dGluZ3MuZm9udCc6ICdGb250JyxcbiAgJ3NldHRpbmdzLnNpemUnOiAnRm9udCBzaXplJyxcbiAgJ2NvbmZpZy50aXRsZSc6ICdDb25maWd1cmF0aW9uJyxcbiAgJ2ZvbnQubW9ubyc6ICdNb25vc3BhY2UgKGRlZmF1bHQpJyxcbiAgJ2ZvbnQuc3lzdGVtJzogJ1N5c3RlbSBmb250Jyxcbn1cblxudHlwZSBEaWZmUmV2aWV3QWN0aW9uUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5zZXNzaW9uLmhlYWRlci5hY3Rpb25zJz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPlxudHlwZSBEaWZmUmV2aWV3T3ZlcmxheVByb3BzID0gUHJvcHNSdW50aW1lPCdzaGVsbC5vdmVybGF5Jz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPiAmIHsgc2Vzc2lvbnM6IElTZXNzaW9ucyB9XG5cbi8qKiBEaWZmIGljb24gKGx1Y2lkZSBmaWxlLWRpZmYpLiAqL1xuZnVuY3Rpb24gSWNvbkRpZmYoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE1IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY3WlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkgMTBoNlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTEyIDd2NlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkgMTdoNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvblgoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE4IDYgNiAxOFwiIC8+XG4gICAgICA8cGF0aCBkPVwibTYgNiAxMiAxMlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNvbW1lbnQoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTIxIDE1YTIgMiAwIDAgMS0yIDJIN2wtNCA0VjVhMiAyIDAgMCAxIDItMmgxNGEyIDIgMCAwIDEgMiAyelwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNoZXZyb25Eb3duKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIm02IDkgNiA2IDYtNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNoZWNrKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyLjVcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTIwIDYgOSAxN2wtNS01XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG50eXBlIFZpZXdNb2RlID0gJ3NpbmdsZScgfCAnc3BsaXQnXG5cbi8qKiBcdTUzNTVcdTY4MEYgLyBcdTUzQ0NcdTY4MEYgc2VnbWVudGVkIHRvZ2dsZSAocGVyc2lzdGVkIGFjcm9zcyBvcGVucykuICovXG5mdW5jdGlvbiBEaWZmVmlld1RvZ2dsZSh7IHZpZXcsIG9uQ2hhbmdlLCB0IH06IHsgdmlldzogVmlld01vZGU7IG9uQ2hhbmdlOiAodjogVmlld01vZGUpID0+IHZvaWQ7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXZpZXctdG9nZ2xlXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD17dCgndmlldy5zaW5nbGUnKX0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXZpZXctYnRuJHt2aWV3ID09PSAnc2luZ2xlJyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc2luZ2xlJ31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NpbmdsZScpfVxuICAgICAgPlxuICAgICAgICB7dCgndmlldy5zaW5nbGUnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NwbGl0JyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc3BsaXQnfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgnc3BsaXQnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc3BsaXQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBUd28tY29sdW1uIHNpZGUtYnktc2lkZSBkaWZmIGJvZHkgKG9sZCBsZWZ0LCBuZXcgcmlnaHQsIGxpbmUgbnVtYmVycyBhbGlnbmVkKS4gKi9cbmZ1bmN0aW9uIFNwbGl0RGlmZih7IGJsb2NrcywgYmVmb3JlTGFiZWwsIGFmdGVyTGFiZWwgfTogeyBibG9ja3M6IFNwbGl0QmxvY2tbXTsgYmVmb3JlTGFiZWw6IHN0cmluZzsgYWZ0ZXJMYWJlbDogc3RyaW5nIH0pIHtcbiAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2JlZm9yZUxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2FmdGVyTGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgIDxkaXYga2V5PXtiaX0+XG4gICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LnJpZ2h0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBQZXItaHVuayBhY3Rpb24gYmFyIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpIGZvciB3b3Jrc3BhY2UgZGlmZnMuICovXG5mdW5jdGlvbiBIdW5rVG9vbGJhcih7XG4gIGh1bmssXG4gIGJ1c3ksXG4gIG9uQWN0aW9uLFxuICB0LFxufToge1xuICBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rIHwgdW5kZWZpbmVkXG4gIGJ1c3k6IGJvb2xlYW5cbiAgb25BY3Rpb246IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmspID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIGlmICghaHVuaykgcmV0dXJuIG51bGxcbiAgY29uc3Qgc3RhZ2VkID0gaHVuay5sYXllciA9PT0gJ3N0YWdlZCdcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItaHVuay1iYXJcIj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItaHVuay1sYXllclwiPntzdGFnZWQgPyB0KCdodW5rLnN0YWdlZCcpIDogdCgnaHVuay51bnN0YWdlZCcpfTwvc3Bhbj5cbiAgICAgIHtzdGFnZWQgPyAoXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uQWN0aW9uKCd1bnN0YWdlJywgaHVuayl9PlxuICAgICAgICAgIHt0KCdodW5rLnVuc3RhZ2UnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApIDogKFxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uQWN0aW9uKCdhY2NlcHQnLCBodW5rKX0+XG4gICAgICAgICAge3QoJ2h1bmsuc3RhZ2UnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApfVxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tZGFuZ2VyXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uQWN0aW9uKCdyZXZlcnQnLCBodW5rKX0+XG4gICAgICAgIHt0KCdodW5rLnJldmVydCcpfVxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFVuaWZpZWQgZGlmZiByb3dzIHdpdGggb2xkL25ldyBsaW5lIG51bWJlcnMgdHJhY2tlZCB0aHJvdWdoIGh1bmtzLiAqL1xuZnVuY3Rpb24gdW5pZmllZFJvd3NXaXRoTGluZXMocm93czogRGlmZlJvd1tdLCBvbGRTdGFydDogbnVtYmVyLCBuZXdTdGFydDogbnVtYmVyKTogeyByb3c6IERpZmZSb3c7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfVtdIHtcbiAgbGV0IG9sZExpbmUgPSBvbGRTdGFydFxuICBsZXQgbmV3TGluZSA9IG5ld1N0YXJ0XG4gIHJldHVybiByb3dzLm1hcCgocm93KSA9PiB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnY3R4JykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBvbGRMaW5lKyssIG5ld0xpbmU6IG5ld0xpbmUrKyB9XG4gICAgaWYgKHJvdy5raW5kID09PSAnYWRkJykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBuZXdMaW5lKysgfVxuICAgIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBudWxsIH1cbiAgICByZXR1cm4geyByb3csIG9sZExpbmU6IG51bGwsIG5ld0xpbmU6IG51bGwgfVxuICB9KVxufVxuXG4vKiogTWF0Y2ggYSBjb21tZW50IGFnYWluc3QgYSByb3cncyBhbmNob3JzIChib3RoIG11c3QgYWdyZWUgd2hlbiBzZXQpLiAqL1xuZnVuY3Rpb24gY29tbWVudE1hdGNoZXMoY29tbWVudDogUmV2aWV3Q29tbWVudCwgb2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCk6IGJvb2xlYW4ge1xuICBpZiAoY29tbWVudC5saW5lTmV3ICE9PSBudWxsICYmIGNvbW1lbnQubGluZU5ldyAhPT0gbmV3TGluZSkgcmV0dXJuIGZhbHNlXG4gIGlmIChjb21tZW50LmxpbmVPbGQgIT09IG51bGwgJiYgY29tbWVudC5saW5lT2xkICE9PSBvbGRMaW5lKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqIEhvdmVyLXRvLWNvbW1lbnQgYWZmb3JkYW5jZSArIGNvbW1lbnQgbWFya2VyIGZvciBvbmUgZGlmZiBsaW5lLiAqL1xuZnVuY3Rpb24gQ29tbWVudExpbmUoe1xuICBjb3VudCxcbiAgb3BlbixcbiAgb25PcGVuLFxuICBvblRvZ2dsZSxcbiAgdCxcbn06IHtcbiAgY291bnQ6IG51bWJlclxuICBvcGVuOiBib29sZWFuXG4gIG9uT3BlbjogKCkgPT4gdm9pZFxuICBvblRvZ2dsZTogKCkgPT4gdm9pZFxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YGRzZHItY29tbWVudC1hZGQke2NvdW50ID4gMCA/ICcgZHNkci1jb21tZW50LWhhcycgOiAnJ31gfVxuICAgICAgdGl0bGU9e2NvdW50ID4gMCA/IHQoJ2NvbW1lbnQuc2hvdycpIDogdCgnY29tbWVudC5hZGQnKX1cbiAgICAgIGFyaWEtbGFiZWw9e2NvdW50ID4gMCA/IHQoJ2NvbW1lbnQuc2hvdycpIDogdCgnY29tbWVudC5hZGQnKX1cbiAgICAgIG9uQ2xpY2s9e2NvdW50ID4gMCA/IG9uVG9nZ2xlIDogb25PcGVufVxuICAgID5cbiAgICAgIHtjb3VudCA+IDAgPyBjb3VudCA6ICcrJ31cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG4vKiogVGhlIGlubGluZSBjb21tZW50IGVkaXRvciwgcmVuZGVyZWQgYXMgaXRzIG93biByb3cuICovXG5mdW5jdGlvbiBDb21tZW50RWRpdG9yKHtcbiAgdGV4dCxcbiAgb25UZXh0LFxuICBvblNhdmUsXG4gIG9uQ2FuY2VsLFxuICBidXN5LFxuICB0LFxufToge1xuICB0ZXh0OiBzdHJpbmdcbiAgb25UZXh0OiAodjogc3RyaW5nKSA9PiB2b2lkXG4gIG9uU2F2ZTogKCkgPT4gdm9pZFxuICBvbkNhbmNlbDogKCkgPT4gdm9pZFxuICBidXN5OiBib29sZWFuXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWVkaXRvclwiPlxuICAgICAgPHRleHRhcmVhXG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1pbnB1dFwiXG4gICAgICAgIHZhbHVlPXt0ZXh0fVxuICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgcm93cz17Mn1cbiAgICAgICAgcGxhY2Vob2xkZXI9e3QoJ2NvbW1lbnQucGxhY2Vob2xkZXInKX1cbiAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25UZXh0KGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgIG9uS2V5RG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIG9uQ2FuY2VsKClcbiAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInICYmIChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkpKSBvblNhdmUoKVxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFjdGlvbnNcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8ICF0ZXh0LnRyaW0oKX0gb25DbGljaz17b25TYXZlfT5cbiAgICAgICAgICB7dCgnY29tbWVudC5zYXZlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXtvbkNhbmNlbH0+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFVuaWZpZWQgZGlmZiB3aXRoIHBlci1odW5rIGFjdGlvbiBiYXJzIGFuZCBpbmxpbmUgY29tbWVudHMgKHdvcmtzcGFjZSBmaWxlcykuICovXG5mdW5jdGlvbiBVbmlmaWVkRGlmZih7XG4gIGRpZmYsXG4gIGh1bmtzLFxuICBidXN5LFxuICBvbkh1bmtBY3Rpb24sXG4gIHQsXG4gIGNvbW1lbnRzLFxuICBjb21tZW50RWRpdG9yLFxuICBjb21tZW50VGV4dCxcbiAgb25Db21tZW50VGV4dCxcbiAgb25PcGVuQ29tbWVudCxcbiAgb25TYXZlQ29tbWVudCxcbiAgb25DYW5jZWxDb21tZW50LFxuICBjb21tZW50UG9wb3ZlcixcbiAgb25Ub2dnbGVQb3BvdmVyLFxuICBvbkRlbGV0ZUNvbW1lbnQsXG4gIHJlYWRPbmx5LFxuICBwYXRoLFxuICByZXZpZXdGaW5kaW5ncyxcbiAgb25PcGVuTGluZSxcbiAganVtcExpbmUsXG59OiB7XG4gIGRpZmY6IHN0cmluZ1xuICBodW5rczogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVua1tdXG4gIGJ1c3k6IGJvb2xlYW5cbiAgb25IdW5rQWN0aW9uOiAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xuICBjb21tZW50cz86IFJldmlld0NvbW1lbnRbXVxuICBjb21tZW50RWRpdG9yPzogeyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0gfCBudWxsXG4gIGNvbW1lbnRUZXh0Pzogc3RyaW5nXG4gIG9uQ29tbWVudFRleHQ/OiAodjogc3RyaW5nKSA9PiB2b2lkXG4gIG9uT3BlbkNvbW1lbnQ/OiAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCkgPT4gdm9pZFxuICBvblNhdmVDb21tZW50PzogKCkgPT4gdm9pZFxuICBvbkNhbmNlbENvbW1lbnQ/OiAoKSA9PiB2b2lkXG4gIGNvbW1lbnRQb3BvdmVyPzogc3RyaW5nIHwgbnVsbFxuICBvblRvZ2dsZVBvcG92ZXI/OiAoa2V5OiBzdHJpbmcpID0+IHZvaWRcbiAgb25EZWxldGVDb21tZW50PzogKGlkOiBzdHJpbmcpID0+IHZvaWRcbiAgLyoqIEhpZGUgcGVyLWh1bmsgYWN0aW9uIGJhcnMgKGJyYW5jaCBzY29wZSBpcyBhIHJlYWQtb25seSBkaWZmKS4gKi9cbiAgcmVhZE9ubHk/OiBib29sZWFuXG4gIC8qKiBSZXBvLXJlbGF0aXZlIGZpbGUgcGF0aCAoZm9yIG9wZW4taW4tZWRpdG9yIGFuZCBtYXJrZXJzKS4gKi9cbiAgcGF0aD86IHN0cmluZ1xuICAvKiogQUktcmV2aWV3IGZpbmRpbmdzIHRvIG1hcmsgb24gbWF0Y2hpbmcgbGluZXMuICovXG4gIHJldmlld0ZpbmRpbmdzPzogUmV2aWV3RmluZGluZ1tdXG4gIC8qKiBPcGVuIHRoZSBmaWxlIGF0IGEgbGluZSBpbiB0aGUgdXNlcidzIGVkaXRvci4gKi9cbiAgb25PcGVuTGluZT86IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4gdm9pZFxuICAvKiogVGVtcG9yYXJ5IGxpbmUgaGlnaGxpZ2h0IChlLmcuIGp1bXAgZnJvbSBhIFBSIGNvbW1lbnQpLiAqL1xuICBqdW1wTGluZT86IG51bWJlciB8IG51bGxcbn0pIHtcbiAgY29uc3QgYmxvY2tzID0gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgbGV0IGh1bmtJbmRleCA9IDBcbiAgY29uc3QgZWRpdGluZ0tleSA9IGNvbW1lbnRFZGl0b3IgPyBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA6IG51bGxcbiAgY29uc3QgZmluZGluZ3NGb3IgPSAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCk6IFJldmlld0ZpbmRpbmdbXSA9PiB7XG4gICAgaWYgKCFwYXRoIHx8ICFyZXZpZXdGaW5kaW5ncyB8fCByZXZpZXdGaW5kaW5ncy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICAgIHJldHVybiByZXZpZXdGaW5kaW5ncy5maWx0ZXIoKGYpID0+IHtcbiAgICAgIGlmIChmLmZpbGUgIT09IHBhdGgpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKG5ld0xpbmUgIT09IG51bGwpIHJldHVybiBuZXdMaW5lID49IGYubGluZVN0YXJ0ICYmIG5ld0xpbmUgPD0gZi5saW5lRW5kXG4gICAgICByZXR1cm4gb2xkTGluZSAhPT0gbnVsbCAmJiBvbGRMaW5lID49IGYubGluZVN0YXJ0ICYmIG9sZExpbmUgPD0gZi5saW5lRW5kXG4gICAgfSlcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICB7YmxvY2tzLm1hcCgoYmxvY2ssIGJpKSA9PiB7XG4gICAgICAgICAgY29uc3QgaXNIdW5rID0gYmxvY2suaGVhZD8ua2luZCA9PT0gJ2h1bmsnXG4gICAgICAgICAgY29uc3QgaHVuayA9IGlzSHVuayA/IGh1bmtzW2h1bmtJbmRleCsrXSA6IHVuZGVmaW5lZFxuICAgICAgICAgIGNvbnN0IHN0YXJ0cyA9IGJsb2NrLmhlYWQ/LmtpbmQgPT09ICdodW5rJyA/IGh1bmtTdGFydHMoYmxvY2suaGVhZC50ZXh0KSA6IHsgb2xkU3RhcnQ6IDEsIG5ld1N0YXJ0OiAxIH1cbiAgICAgICAgICBjb25zdCByb3dzID0gaXNIdW5rID8gdW5pZmllZFJvd3NXaXRoTGluZXMoYmxvY2sucm93cywgc3RhcnRzLm9sZFN0YXJ0LCBzdGFydHMubmV3U3RhcnQpIDogW11cbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICB7aXNIdW5rICYmICFyZWFkT25seSA/IDxIdW5rVG9vbGJhciBodW5rPXtodW5rfSBidXN5PXtidXN5fSBvbkFjdGlvbj17b25IdW5rQWN0aW9ufSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7YmxvY2suaGVhZC5raW5kfWB9PntibG9jay5oZWFkLnRleHQgfHwgJyAnfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgIHtpc0h1bmtcbiAgICAgICAgICAgICAgICA/IHJvd3MubWFwKCh7IHJvdywgb2xkTGluZSwgbmV3TGluZSB9LCByaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtvbGRMaW5lID8/ICdvJ306JHtuZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0NvbW1lbnRzID0gY29tbWVudHM/LmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgb2xkTGluZSwgbmV3TGluZSkpID8/IFtdXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdzID0gZmluZGluZ3NGb3Iob2xkTGluZSwgbmV3TGluZSlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWRpdGluZyA9IGVkaXRpbmdLZXkgPT09IGtleVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG93QWN0aW9ucyA9IHJvdy5raW5kID09PSAnY3R4JyB8fCByb3cua2luZCA9PT0gJ2FkZCcgfHwgcm93LmtpbmQgPT09ICdkZWwnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdDbHMgPSBmaW5kaW5ncy5sZW5ndGggPiAwID8gYCBkc2RyLWxpbmUtZmluZGluZyBkc2RyLWZpbmRpbmctJHtmaW5kaW5nc1swXS5wcmlvcml0eX1gIDogJydcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganVtcGVkID0ganVtcExpbmUgIT0gbnVsbCAmJiAobmV3TGluZSA9PT0ganVtcExpbmUgfHwgKG5ld0xpbmUgPT09IG51bGwgJiYgb2xkTGluZSA9PT0ganVtcExpbmUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e3JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfSR7cm93Q29tbWVudHMubGVuZ3RoID4gMCA/ICcgZHNkci1saW5lLWNvbW1lbnRlZCcgOiAnJ30ke2ZpbmRpbmdDbHN9JHtqdW1wZWQgPyAnIGRzZHItbGluZS1qdW1wJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtuZXdMaW5lID8/IG9sZExpbmUgPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtbnVtXCI+e25ld0xpbmUgPz8gb2xkTGluZSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS10ZXh0XCI+e3Jvdy50ZXh0IHx8ICcgJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItZmluZGluZy10YWcgZHNkci1maW5kaW5nLSR7ZmluZGluZ3NbMF0ucHJpb3JpdHl9YH0gdGl0bGU9e2ZpbmRpbmdzWzBdLnRpdGxlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3NbMF0ucHJpb3JpdHl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzLmxlbmd0aCA+IDEgPyBgXHUwMEQ3JHtmaW5kaW5ncy5sZW5ndGh9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtwYXRoICYmIG9uT3BlbkxpbmUgJiYgKG5ld0xpbmUgPz8gb2xkTGluZSkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLW9wZW5saW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dCgnZWRpdG9yLm9wZW5MaW5lJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25PcGVuTGluZShwYXRoLCBuZXdMaW5lID8/IG9sZExpbmUgPz8gMSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50TGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudD17cm93Q29tbWVudHMubGVuZ3RofVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuPXtjb21tZW50UG9wb3ZlciA9PT0ga2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk9wZW49eygpID0+IG9uT3BlbkNvbW1lbnQ/LihvbGRMaW5lLCBuZXdMaW5lKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IG9uVG9nZ2xlUG9wb3Zlcj8uKGtleSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zICYmIHJvd0NvbW1lbnRzLmxlbmd0aCA+IDAgJiYgY29tbWVudFBvcG92ZXIgPT09IGtleSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1wb3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2NvbW1lbnQuaWR9IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtdGV4dFwiPntjb21tZW50LnRleHR9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2NvbW1lbnQucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25EZWxldGVDb21tZW50Py4oY29tbWVudC5pZCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge2VkaXRpbmcgPyA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dCA/PyAnJ30gb25UZXh0PXtvbkNvbW1lbnRUZXh0ID8/ICgoKSA9PiB7fSl9IG9uU2F2ZT17b25TYXZlQ29tbWVudCA/PyAoKCkgPT4ge30pfSBvbkNhbmNlbD17b25DYW5jZWxDb21tZW50ID8/ICgoKSA9PiB7fSl9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogYmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgPC9wcmU+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFN0YXR1cyBjaGlwIGNvbG9yIGNsYXNzIGZvciBhIHdvcmtzcGFjZSBjaGFuZ2UuICovXG4vKiogRHJhZyBoYW5kbGUgZm9yIHJlc2l6aW5nIHRoZSBwYW5lbCAoZWFzdCAvIHNvdXRoIC8gc291dGgtZWFzdCkuICovXG5mdW5jdGlvbiBSZXNpemVIYW5kbGUoeyBtb2RlLCBvblJlc2l6ZSB9OiB7IG1vZGU6ICdlJyB8ICdzJyB8ICdzZSc7IG9uUmVzaXplOiAoZHg6IG51bWJlciwgZHk6IG51bWJlcikgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IGxhc3QgPSB1c2VSZWY8eyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbD4obnVsbClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLXJlc2l6ZSBkc2RyLXJlc2l6ZS0ke21vZGV9YH1cbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH1cbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghbGFzdC5jdXJyZW50KSByZXR1cm5cbiAgICAgICAgY29uc3QgZHggPSBldmVudC5jbGllbnRYIC0gbGFzdC5jdXJyZW50LnhcbiAgICAgICAgY29uc3QgZHkgPSBldmVudC5jbGllbnRZIC0gbGFzdC5jdXJyZW50LnlcbiAgICAgICAgbGFzdC5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH1cbiAgICAgICAgaWYgKGR4ICE9PSAwIHx8IGR5ICE9PSAwKSBvblJlc2l6ZShkeCwgZHkpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyVXA9eyhldmVudCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSBudWxsXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJDYW5jZWw9eygpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0gbnVsbFxuICAgICAgfX1cbiAgICAvPlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hpcENsYXNzKHN0YXR1czogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcyA9IHN0YXR1cy5yZXBsYWNlKC9cXHMvZywgJycpXG4gIGlmIChzLmluY2x1ZGVzKCc/PycpKSByZXR1cm4gJ2RzZHItY2hpcC11J1xuICBpZiAocy5zdGFydHNXaXRoKCdBJykgfHwgcy5pbmNsdWRlcygnQScpKSByZXR1cm4gJ2RzZHItY2hpcC1hJ1xuICBpZiAocy5zdGFydHNXaXRoKCdEJykgfHwgcy5pbmNsdWRlcygnRCcpKSByZXR1cm4gJ2RzZHItY2hpcC1kJ1xuICBpZiAocy5zdGFydHNXaXRoKCdSJykgfHwgcy5pbmNsdWRlcygnUicpKSByZXR1cm4gJ2RzZHItY2hpcC1yJ1xuICByZXR1cm4gJ2RzZHItY2hpcC1tJ1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkU3RhdHVzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxTdGF0dXNSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtTVEFUVVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGBzdGF0dXMgcmVxdWVzdCBmYWlsZWQ6ICR7cmVzLnN0YXR1c31gKVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkpIGFzIFN0YXR1c1Jlc3BvbnNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5Q2hhbmdlcyhjd2Q6IHN0cmluZywgYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoPzogc3RyaW5nKTogUHJvbWlzZTxBcHBseVJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEFQUExZX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBhY3Rpb24sIHBhdGggfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBBcHBseVJlc3BvbnNlXG59XG5cbi8qKiBBcHBseSBvbmUgaHVuayBvZiBvbmUgZmlsZSAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5SHVuayhjd2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IHN0cmluZyk6IFByb21pc2U8QXBwbHlIdW5rUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQVBQTFlfSFVOS19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgcGF0aCwgYWN0aW9uLCBodW5rIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQXBwbHlIdW5rUmVzcG9uc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuR2l0QWN0aW9uKGN3ZDogc3RyaW5nLCBhY3Rpb246ICdjb21taXQnIHwgJ3B1c2gnLCBtZXNzYWdlPzogc3RyaW5nKTogUHJvbWlzZTxHaXRSZXNwb25zZT4ge1xuICBjb25zdCB1cmwgPSBhY3Rpb24gPT09ICdjb21taXQnID8gQ09NTUlUX1VSTCA6IFBVU0hfVVJMXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGFjdGlvbiA9PT0gJ2NvbW1pdCcgPyB7IGN3ZCwgbWVzc2FnZSB9IDogeyBjd2QgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBHaXRSZXNwb25zZVxufVxuXG4vKiogTG9jYWwgKHVucHVzaGVkKSBjb21taXRzIGFoZWFkIG9mIHRoZSB1cHN0cmVhbS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRIaXN0b3J5KGN3ZDogc3RyaW5nKTogUHJvbWlzZTxIaXN0b3J5UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7SElTVE9SWV9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1pdHM6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgSGlzdG9yeVJlc3BvbnNlXG59XG5cbi8qKiBPbmUgY29tbWl0J3MgdW5pZmllZCBkaWZmLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZENvbW1pdERpZmYoY3dkOiBzdHJpbmcsIGhhc2g6IHN0cmluZyk6IFByb21pc2U8Q29tbWl0RGlmZlJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0NPTU1JVF9ESUZGX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9Jmhhc2g9JHtlbmNvZGVVUklDb21wb25lbnQoaGFzaCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZGlmZjogJycsIGZpbGVzOiBbXSwgYWRkZWQ6IDAsIGRlbGV0ZWQ6IDAsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBDb21taXREaWZmUmVzcG9uc2Vcbn1cblxuLyoqIElubGluZSByZXZpZXcgY29tbWVudHMgZm9yIHRoZSB3b3Jrc3BhY2UgKHJlcG8tc2NvcGVkKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRDb21tZW50cyhjd2Q6IHN0cmluZyk6IFByb21pc2U8UmV2aWV3Q29tbWVudFtdPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0NPTU1FTlRTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWVudHM6IFtdIH0pKSkgYXMgQ29tbWVudHNSZXNwb25zZVxuICByZXR1cm4gZGF0YS5vayA/IGRhdGEuY29tbWVudHMgOiBbXVxufVxuXG4vKiogUmVwbGFjZSB0aGUgd2hvbGUgY29tbWVudCBsaXN0IChzaW5nbGUtdXNlciByZXBsYWNlIHNlbWFudGljcykuICovXG5hc3luYyBmdW5jdGlvbiBzYXZlQ29tbWVudHMoY3dkOiBzdHJpbmcsIGNvbW1lbnRzOiBSZXZpZXdDb21tZW50W10pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQ09NTUVOVFNfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIGNvbW1lbnRzIH0pLFxuICB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlIH0pKSkgYXMgQ29tbWVudHNSZXNwb25zZVxuICByZXR1cm4gZGF0YS5vayA9PT0gdHJ1ZVxufVxuXG4vKiogTG9jYWwgYnJhbmNoIG5hbWVzIChmb3IgdGhlIEJyYW5jaCByZXZpZXcgc2NvcGUpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEJyYW5jaGVzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtCUkFOQ0hFU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGJyYW5jaGVzOiBbXSB9KSkpIGFzIHsgb2s6IGJvb2xlYW47IGJyYW5jaGVzOiBzdHJpbmdbXSB9XG4gIHJldHVybiBkYXRhLm9rID8gZGF0YS5icmFuY2hlcyA6IFtdXG59XG5cbi8qKiBSdW4gYW4gQUkgcmV2aWV3IG92ZXIgdGhlIGdpdmVuIHNjb3BlLiAqL1xuYXN5bmMgZnVuY3Rpb24gcnVuUmV2aWV3KGN3ZDogc3RyaW5nLCBzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwsIHNjb3BlOiAndW5jb21taXR0ZWQnIHwgJ2JyYW5jaCcgfCAnY29tbWl0JywgYmFzZT86IHN0cmluZywgY29tbWl0SGFzaD86IHN0cmluZyk6IFByb21pc2U8UmV2aWV3UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goUkVWSUVXX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBzZXNzaW9uSWQ6IHNlc3Npb25JZCA/PyB1bmRlZmluZWQsIHNjb3BlLCBiYXNlLCBjb21taXRIYXNoIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBmaW5kaW5nczogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBSZXZpZXdSZXNwb25zZVxufVxuXG4vKiogQ3VycmVudCBicmFuY2gncyBHaXRIdWIgUFIgY29udGV4dCAoZGVncmFkZXMgZ3JhY2VmdWxseSB3aXRob3V0IGdoKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQcihjd2Q6IHN0cmluZyk6IFByb21pc2U8UHJSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtQUl9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1lbnRzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFByUmVzcG9uc2Vcbn1cblxuLyoqIEdpdCByZXBvcyB1bmRlciBhIHdvcmtzcGFjZSAobXVsdGktcmVwbyBzZWxlY3RvcikuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkUmVwb3MoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFJlcG9zUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7UkVQT1NfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCByZXBvczogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBSZXBvc1Jlc3BvbnNlXG59XG5cbi8qKiBPcGVuIGEgZmlsZSAob3B0aW9uYWxseSBhdCBhIGxpbmUpIGluIHRoZSB1c2VyJ3MgZWRpdG9yIHZpYSBvcGVuLWVkaXRvci4gKi9cbmFzeW5jIGZ1bmN0aW9uIG9wZW5JbkVkaXRvcihjd2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBsaW5lPzogbnVtYmVyKTogUHJvbWlzZTx7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gIGNvbnN0IGFicyA9IHBhdGguc3RhcnRzV2l0aCgnLycpIHx8IC9eW0EtWmEtel06W1xcXFwvXS8udGVzdChwYXRoKSA/IHBhdGggOiBgJHtjd2R9LyR7cGF0aH1gXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKE9QRU5fRURJVE9SX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcGF0aDogYWJzLCBsaW5lIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgeyBvazogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfVxufVxuXG4vKiogU2hvcnQgcmVsYXRpdmUgdGltZSBmb3IgY29tbWl0IHJvd3MgKFwianVzdCBub3dcIiAvIFwiMyBtaW4gYWdvXCIgLyBcdTIwMjYpLiAqL1xuZnVuY3Rpb24gcmVsYXRpdmVUaW1lKGlzbzogc3RyaW5nLCB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKSAtIG5ldyBEYXRlKGlzbykuZ2V0VGltZSgpKSAvIDYwMDAwKVxuICBpZiAobWludXRlcyA8IDEpIHJldHVybiB0KCd0aW1lLm5vdycpXG4gIGlmIChtaW51dGVzIDwgNjApIHJldHVybiB0KCd0aW1lLm1pbnV0ZXMnLCB7IG46IG1pbnV0ZXMgfSlcbiAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MClcbiAgaWYgKGhvdXJzIDwgMjQpIHJldHVybiB0KCd0aW1lLmhvdXJzJywgeyBuOiBob3VycyB9KVxuICByZXR1cm4gdCgndGltZS5kYXlzJywgeyBuOiBNYXRoLmZsb29yKGhvdXJzIC8gMjQpIH0pXG59XG5cbi8qKiBUaGVtZS1hd2FyZSBkcm9wZG93biByZXBsYWNpbmcgbmF0aXZlIDxzZWxlY3Q+IChuYXRpdmUgcG9wdXBzIGlnbm9yZSB0aGUgdGhlbWUpLiAqL1xuZnVuY3Rpb24gVGhlbWVTZWxlY3Qoe1xuICB2YWx1ZSxcbiAgb3B0aW9ucyxcbiAgb25DaGFuZ2UsXG4gIGFyaWFMYWJlbCxcbn06IHtcbiAgdmFsdWU6IHN0cmluZ1xuICBvcHRpb25zOiB7IHZhbHVlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfVtdXG4gIG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZFxuICBhcmlhTGFiZWw/OiBzdHJpbmdcbn0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJvb3RSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IGN1cnJlbnQgPSBvcHRpb25zLmZpbmQoKG8pID0+IG8udmFsdWUgPT09IHZhbHVlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm5cbiAgICBjb25zdCBjbG9zZU91dHNpZGUgPSAoZXZlbnQ6IFBvaW50ZXJFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUgJiYgIXJvb3RSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgY29uc3QgY2xvc2VPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgY2xvc2VPdXRzaWRlKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjbG9zZU9uS2V5KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGNsb3NlT3V0c2lkZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjbG9zZU9uS2V5KVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbFwiIHJlZj17cm9vdFJlZn0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXNlbC10cmlnZ2VyXCJcbiAgICAgICAgYXJpYS1oYXNwb3B1cD1cImxpc3Rib3hcIlxuICAgICAgICBhcmlhLWV4cGFuZGVkPXtvcGVufVxuICAgICAgICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtdmFsdWVcIj57Y3VycmVudD8ubGFiZWwgPz8gdmFsdWV9PC9zcGFuPlxuICAgICAgICA8SWNvbkNoZXZyb25Eb3duIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwiZHNkci1zZWwtbWVudVwiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17YXJpYUxhYmVsfT5cbiAgICAgICAgICB7b3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gKFxuICAgICAgICAgICAgPGxpIGtleT17b3B0aW9uLnZhbHVlfSByb2xlPVwibm9uZVwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17b3B0aW9uLnZhbHVlID09PSB2YWx1ZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNlbC1vcHRpb24ke29wdGlvbi52YWx1ZSA9PT0gdmFsdWUgPyAnIGRzZHItc2VsLW9wdGlvbi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZShvcHRpb24udmFsdWUpXG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC1vcHRpb24tbWFya1wiPntvcHRpb24udmFsdWUgPT09IHZhbHVlID8gPEljb25DaGVjayAvPiA6IG51bGx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLW9wdGlvbi1sYWJlbFwiPntvcHRpb24ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogRGlmZiBmb250ICsgZm9udCBzaXplIGNvbnRyb2xzIChzaGFyZWQgcHJlZnMgc3RvcmUpLiAqL1xuZnVuY3Rpb24gRGlmZlJldmlld1ByZWZzKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IHByZWZzID0gdXNlU3luY0V4dGVybmFsU3RvcmUocHJlZnNTdG9yZS5zdWJzY3JpYmUsIHByZWZzU3RvcmUuZ2V0U25hcHNob3QpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jZmctZmllbGRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbGFiZWxcIiBpZD1cImRzZHItcHJlZi1mb250LWxhYmVsXCI+e3QoJ3NldHRpbmdzLmZvbnQnKX08L3NwYW4+XG4gICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2V0dGluZ3MuZm9udCcpfVxuICAgICAgICAgIHZhbHVlPXtwcmVmcy5mb250fVxuICAgICAgICAgIG9wdGlvbnM9e0ZPTlRfT1BUSU9OUy5tYXAoKGYpID0+ICh7IHZhbHVlOiBmLmlkLCBsYWJlbDogZi5sYWJlbC5zdGFydHNXaXRoKCdmb250LicpID8gdChmLmxhYmVsIGFzIGtleW9mIHR5cGVvZiB6aCkgOiBmLmxhYmVsIH0pKX1cbiAgICAgICAgICBvbkNoYW5nZT17KGZvbnQpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLmZvbnQgPSBmb250XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1maWVsZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1sYWJlbFwiIGlkPVwiZHNkci1wcmVmLXNpemUtbGFiZWxcIj57dCgnc2V0dGluZ3Muc2l6ZScpfTwvc3Bhbj5cbiAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgYXJpYUxhYmVsPXt0KCdzZXR0aW5ncy5zaXplJyl9XG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhwcmVmcy5zaXplKX1cbiAgICAgICAgICBvcHRpb25zPXtTSVpFX09QVElPTlMubWFwKChzKSA9PiAoeyB2YWx1ZTogU3RyaW5nKHMpLCBsYWJlbDogYCR7c31weGAgfSkpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoc2l6ZSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuc2l6ZSA9IE51bWJlcihzaXplKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEhlYWRlciBhY3Rpb24gKHNlc3Npb24gc2NvcGUpOiBiYWRnZSArIG9wZW4uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gRGlmZlJldmlld0FjdGlvbih7IHNlc3Npb25JZCwgdXNlU2Vzc2lvbnMsIHVzZVNlc3Npb24sIHQgfTogRGlmZlJldmlld0FjdGlvblByb3BzKSB7XG4gIGNvbnN0IGN3ZCA9IHVzZVNlc3Npb25zKChzOiBTZXNzaW9uTGlzdFN0YXRlKSA9PiBzLmJ5SWRbc2Vzc2lvbklkXT8uY3dkKVxuICBjb25zdCBub2RlcyA9IHVzZVNlc3Npb24oKHMpID0+IHMubm9kZXMpXG4gIGNvbnN0IGNoYW5nZUNvdW50ID0gdXNlTWVtbygoKSA9PiBjb3VudFNlc3Npb25DaGFuZ2VzKG5vZGVzKSwgW25vZGVzXSlcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3Qgb3Blbk92ZXJsYXkgPSAoKSA9PiB7XG4gICAgaWYgKCFjd2QpIHJldHVyblxuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHVuc3ViID0gb3ZlcmxheVN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBzZXRPcGVuKG92ZXJsYXlTdG9yZS5nZXRTbmFwc2hvdCgpLm9wZW4pXG4gICAgfSlcbiAgICByZXR1cm4gdW5zdWJcbiAgfSwgW10pXG5cbiAgaWYgKCFjd2QpIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXRyaWdnZXJcIiBhcmlhLWxhYmVsPXt0KCdhY3Rpb24uYXJpYScpfSBvbkNsaWNrPXtvcGVuT3ZlcmxheX0+XG4gICAgICA8SWNvbkRpZmYgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGFiZWxcIj57dCgnYWN0aW9uLmxhYmVsJyl9PC9zcGFuPlxuICAgICAge2NoYW5nZUNvdW50ID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY291bnRcIj57Y2hhbmdlQ291bnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7b3BlbiA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY291bnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cdTI3MTM8L3NwYW4+IDogbnVsbH1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZpbGUgdHJlZTogYnVpbGQgYSBkaXJlY3RvcnkgdHJlZSBmcm9tIGZsYXQgcGF0aHMgYW5kIHJlbmRlciBpdCB3aXRoXG4vLyBjb2xsYXBzaWJsZSBmb2xkZXJzICh0aGUgbGVmdCBzaWRlIG9mIHRoZSByZXZpZXcgc3VyZmFjZSkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudHlwZSBUcmVlRGlyPFQ+ID0geyBraW5kOiAnZGlyJzsgbmFtZTogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGNoaWxkcmVuOiBUcmVlTm9kZTxUPltdIH1cbnR5cGUgVHJlZUxlYWY8VD4gPSB7IGtpbmQ6ICdsZWFmJzsgbmFtZTogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGl0ZW06IFQgfVxudHlwZSBUcmVlTm9kZTxUPiA9IFRyZWVEaXI8VD4gfCBUcmVlTGVhZjxUPlxuXG4vKiogVHVybiBhIGZsYXQgaXRlbSBsaXN0IGludG8gYSBzb3J0ZWQgZGlyZWN0b3J5IHRyZWUgKGRpcmVjdG9yaWVzIGZpcnN0KS4gKi9cbmZ1bmN0aW9uIGJ1aWxkRmlsZVRyZWU8VD4oaXRlbXM6IHJlYWRvbmx5IFRbXSwgcGF0aE9mOiAoaXRlbTogVCkgPT4gc3RyaW5nKTogVHJlZU5vZGU8VD5bXSB7XG4gIGNvbnN0IHJvb3Q6IFRyZWVOb2RlPFQ+W10gPSBbXVxuICBjb25zdCBkaXJJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBUcmVlRGlyPFQ+PigpXG4gIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgIGNvbnN0IHBhdGggPSBwYXRoT2YoaXRlbSlcbiAgICBjb25zdCBwYXJ0cyA9IHBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbilcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAwKSBjb250aW51ZVxuICAgIGxldCBzaWJsaW5ncyA9IHJvb3RcbiAgICBsZXQgcHJlZml4ID0gJydcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgcHJlZml4ID0gcHJlZml4ID8gYCR7cHJlZml4fS8ke3BhcnRzW2ldfWAgOiBwYXJ0c1tpXVxuICAgICAgbGV0IGRpciA9IGRpckluZGV4LmdldChwcmVmaXgpXG4gICAgICBpZiAoIWRpcikge1xuICAgICAgICBkaXIgPSB7IGtpbmQ6ICdkaXInLCBuYW1lOiBwYXJ0c1tpXSwgcGF0aDogcHJlZml4LCBjaGlsZHJlbjogW10gfVxuICAgICAgICBkaXJJbmRleC5zZXQocHJlZml4LCBkaXIpXG4gICAgICAgIHNpYmxpbmdzLnB1c2goZGlyKVxuICAgICAgfVxuICAgICAgc2libGluZ3MgPSBkaXIuY2hpbGRyZW5cbiAgICB9XG4gICAgc2libGluZ3MucHVzaCh7IGtpbmQ6ICdsZWFmJywgbmFtZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV0sIHBhdGgsIGl0ZW0gfSlcbiAgfVxuICBjb25zdCBzb3J0Tm9kZXMgPSAobm9kZXM6IFRyZWVOb2RlPFQ+W10pOiB2b2lkID0+IHtcbiAgICBub2Rlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS5raW5kICE9PSBiLmtpbmQpIHJldHVybiBhLmtpbmQgPT09ICdkaXInID8gLTEgOiAxXG4gICAgICByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKVxuICAgIH0pXG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSBpZiAobm9kZS5raW5kID09PSAnZGlyJykgc29ydE5vZGVzKG5vZGUuY2hpbGRyZW4pXG4gIH1cbiAgc29ydE5vZGVzKHJvb3QpXG4gIHJldHVybiByb290XG59XG5cbi8qKiBSZWN1cnNpdmUgdHJlZSByZW5kZXJlcjogY29sbGFwc2libGUgZGlyZWN0b3JpZXMgKyBsZWFmIHJvd3MuICovXG5mdW5jdGlvbiBGaWxlVHJlZVZpZXc8VD4ocHJvcHM6IHtcbiAgbm9kZXM6IFRyZWVOb2RlPFQ+W11cbiAgY29sbGFwc2VkOiBSZWFkb25seVNldDxzdHJpbmc+XG4gIG9uVG9nZ2xlRGlyOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkXG4gIGRlcHRoOiBudW1iZXJcbiAgcmVuZGVyTGVhZjogKGxlYWY6IFRyZWVMZWFmPFQ+KSA9PiBSZWFjdE5vZGVcbn0pOiBSZWFjdEVsZW1lbnQge1xuICBjb25zdCB7IG5vZGVzLCBjb2xsYXBzZWQsIG9uVG9nZ2xlRGlyLCBkZXB0aCwgcmVuZGVyTGVhZiB9ID0gcHJvcHNcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge25vZGVzLm1hcCgobm9kZSkgPT5cbiAgICAgICAgbm9kZS5raW5kID09PSAnZGlyJyA/IChcbiAgICAgICAgICA8ZGl2IGtleT17bm9kZS5wYXRofT5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZGlyJHtjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAnJyA6ICcgZHNkci1kaXItb3Blbid9YH1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZ0xlZnQ6IGRlcHRoICogMTQgKyA4IH19XG4gICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9eyFjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVG9nZ2xlRGlyKG5vZGUucGF0aCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLWNhcmV0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+e2NvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/ICdcdTI1QjgnIDogJ1x1MjVCRSd9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1uYW1lXCIgdGl0bGU9e25vZGUucGF0aH0+e25vZGUubmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLWNvdW50XCI+e25vZGUuY2hpbGRyZW4ubGVuZ3RofTwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgeyFjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAoXG4gICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXcgbm9kZXM9e25vZGUuY2hpbGRyZW59IGNvbGxhcHNlZD17Y29sbGFwc2VkfSBvblRvZ2dsZURpcj17b25Ub2dnbGVEaXJ9IGRlcHRoPXtkZXB0aCArIDF9IHJlbmRlckxlYWY9e3JlbmRlckxlYWZ9IC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8ZGl2IGtleT17bm9kZS5wYXRofSBzdHlsZT17eyBwYWRkaW5nTGVmdDogZGVwdGggKiAxNCB9fT57cmVuZGVyTGVhZihub2RlKX08L2Rpdj5cbiAgICAgICAgKSxcbiAgICAgICl9XG4gICAgPC8+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb21wb3NlciBkb2NrIChzZXNzaW9uIHNjb3BlKTogcGVuZGluZyBpbmxpbmUgY29tbWVudHMgZmxvYXQgYWJvdmUgdGhlXG4vLyBpbnB1dCBib3gsIENvZGV4LXN0eWxlIFx1MjAxNCBob3ZlciB0aGUgcGlsbCB0byBwcmV2aWV3LCBjbGljayBzZW5kIHRvIGluamVjdC5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIERpZmZSZXZpZXdDb21wb3NlckRvY2tQcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLmlucHV0LmRvY2snPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYgeyBzZXNzaW9uczogSVNlc3Npb25zIH1cblxuZnVuY3Rpb24gRGlmZlJldmlld0NvbXBvc2VyRG9jayh7IHNlc3Npb25JZCwgdXNlU2Vzc2lvbnMsIHNlc3Npb25zLCBpbnB1dCwgdCB9OiBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IHBlbmRpbmcgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwZW5kaW5nQ29tbWVudHNTdG9yZS5zdWJzY3JpYmUsIHBlbmRpbmdDb21tZW50c1N0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBbaG92ZXIsIHNldEhvdmVyXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZGlzbWlzc2VkLCBzZXREaXNtaXNzZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGNhcnJpZWRJZHMgPSB1c2VSZWY8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgY2FycnlpbmcgPSB1c2VSZWYoZmFsc2UpXG5cbiAgLy8gU2VlZCB0aGUgc3RvcmUgZnJvbSBzZXJ2ZXIgc3RvcmFnZSB3aGVuIG5vdGhpbmcgaGFzIGJlZW4gc3luY2VkIGZvciB0aGlzXG4gIC8vIHdvcmtzcGFjZSB5ZXQgKHBhbmVsIG5ldmVyIG9wZW5lZCB0aGlzIHNlc3Npb24gXHUyMDE0IGNvbW1lbnRzIHBlcnNpc3QgaW4gLmdpdCkuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFjd2QgfHwgcGVuZGluZy5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCBsb2FkQ29tbWVudHMoY3dkKS50aGVuKChsaXN0KSA9PiB7XG4gICAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm5cbiAgICAgIHBlbmRpbmdDb21tZW50c1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICBpZiAoZC5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgICAgIGQuY3dkID0gY3dkXG4gICAgICAgIGQuY29tbWVudHMgPSBsaXN0XG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbY3dkLCBwZW5kaW5nLmN3ZF0pXG5cbiAgY29uc3QgY29tbWVudHMgPSBwZW5kaW5nLmN3ZCA9PT0gY3dkID8gcGVuZGluZy5jb21tZW50cyA6IFtdXG4gIGNvbnN0IGlkcyA9IGNvbW1lbnRzLm1hcCgoYykgPT4gYy5pZCkuam9pbignLCcpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGNvbW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgc2V0RGlzbWlzc2VkKGZhbHNlKVxuICAgICAgY2FycmllZElkcy5jdXJyZW50ID0gbnVsbFxuICAgIH1cbiAgfSwgW2NvbW1lbnRzLmxlbmd0aF0pXG5cbiAgLy8gQ29kZXgtc3R5bGUgYXV0by1jYXJyeTogd2hlbiB0aGUgdXNlciBzdWJtaXRzIGEgbWVzc2FnZSB3aGlsZSBjb21tZW50cyBhcmVcbiAgLy8gcGVuZGluZywgcXVldWUgdGhlIGNvbW1lbnRzIHJpZ2h0IGJlaGluZCBpdCAobm8gc2VuZCBidXR0b24gbmVlZGVkKS5cbiAgY29uc3QgcGhhc2UgPSBpbnB1dD8ucGhhc2VcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoY29tbWVudHMubGVuZ3RoID09PSAwIHx8IGNhcnJ5aW5nLmN1cnJlbnQgfHwgY2FycmllZElkcy5jdXJyZW50ID09PSBpZHMpIHJldHVyblxuICAgIGlmIChwaGFzZSAhPT0gJ3N1Ym1pdHRpbmcnICYmIHBoYXNlICE9PSAnYWRqdWRpY2F0aW5nJykgcmV0dXJuXG4gICAgY2FycnlpbmcuY3VycmVudCA9IHRydWVcbiAgICBjb25zdCB0YXJnZXRJZHMgPSBpZHNcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQlx1OTQ4OFx1NUJGOVx1NUY1M1x1NTI0RFx1NURFNVx1NEY1Q1x1NTMzQVx1NzY4NFx1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMVx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsICcnXVxuICAgIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgIGxpbmVzLnB1c2goYC0gJHtjLnBhdGh9JHthbmNob3J9OiAke2MudGV4dH1gKVxuICAgIH1cbiAgICB2b2lkIGluamVjdFRvU2Vzc2lvbihzZXNzaW9ucywgc2Vzc2lvbklkLCBsaW5lcy5qb2luKCdcXG4nKSkudGhlbigob3V0Y29tZSkgPT4ge1xuICAgICAgaWYgKG91dGNvbWUgIT09ICdmYWlsZWQnKSBjYXJyaWVkSWRzLmN1cnJlbnQgPSB0YXJnZXRJZHNcbiAgICAgIGNhcnJ5aW5nLmN1cnJlbnQgPSBmYWxzZVxuICAgIH0pXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbcGhhc2UsIGlkc10pXG5cbiAgaWYgKCFjd2QgfHwgY29tbWVudHMubGVuZ3RoID09PSAwIHx8IGRpc21pc3NlZCkgcmV0dXJuIG51bGxcblxuICAvKiogT3BlbiB0aGUgcmV2aWV3IHBhbmVsIGF0IHRoZSBjb21tZW50J3MgY2hhbmdlIGJsb2NrLiAqL1xuICBjb25zdCBmb2N1c0NvbW1lbnQgPSAoY29tbWVudDogUmV2aWV3Q29tbWVudCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmZvY3VzID0geyBwYXRoOiBjb21tZW50LnBhdGgsIGxpbmU6IGNvbW1lbnQubGluZU5ldyA/PyBjb21tZW50LmxpbmVPbGQgPz8gdW5kZWZpbmVkIH1cbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2tcIiBvbk1vdXNlRW50ZXI9eygpID0+IHNldEhvdmVyKHRydWUpfSBvbk1vdXNlTGVhdmU9eygpID0+IHNldEhvdmVyKGZhbHNlKX0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZG9jay1oZWFkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1pY29uXCI+PEljb25Db21tZW50IC8+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY291bnRcIiB0aXRsZT17dCgncmV2aWV3LmRvY2tIaW50Jyl9Pnt0KCdyZXZpZXcuZG9ja0NvbW1lbnRzJywgeyBuOiBjb21tZW50cy5sZW5ndGggfSl9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZG9jay1jbG9zZVwiIGFyaWEtbGFiZWw9e3QoJ2NvbW1lbnQuY2FuY2VsJyl9IG9uQ2xpY2s9eygpID0+IHNldERpc21pc3NlZCh0cnVlKX0+XG4gICAgICAgICAgPEljb25YIC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICB7aG92ZXIgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWxpc3RcIj5cbiAgICAgICAgICB7Y29tbWVudHMubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZG9jay1pdGVtXCJcbiAgICAgICAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5kb2NrSnVtcCcpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBmb2N1c0NvbW1lbnQoY29tbWVudCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1sb2NcIj57Y29tbWVudC5wYXRofXtjb21tZW50LmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Y29tbWVudC5saW5lTmV3fWAgOiAnJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay10ZXh0XCI+e2NvbW1lbnQudGV4dH08L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJldmlldyBvdmVybGF5IChyb290IHNjb3BlKTogc2Vzc2lvbiArIHdvcmtzcGFjZSB0YWJzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdPdmVybGF5KHsgc2Vzc2lvbnMsIHQgfTogRGlmZlJldmlld092ZXJsYXlQcm9wcykge1xuICBjb25zdCBzdG9yZVN0YXRlID0gdXNlU3luY0V4dGVybmFsU3RvcmUob3ZlcmxheVN0b3JlLnN1YnNjcmliZSwgb3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICAvLyBHaXQtZmlyc3Q6IGxhbmQgb24gdGhlIHdvcmtzcGFjZSB0YWIgKHN0YWdlZC91bnN0YWdlZC9icmFuY2ggdHJlZXMpIHNvIHRoZVxuICAvLyBjaGFuZ2UgcmV2aWV3IGlzIG9uZSBjbGljayBhd2F5OyB0aGUgc2Vzc2lvbiB0YWIgc3RheXMgYSBjbGljayBhd2F5LlxuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gdXNlU3RhdGU8J3Nlc3Npb24nIHwgJ3dvcmtzcGFjZSc+KCd3b3Jrc3BhY2UnKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSB1c2VTdGF0ZTxWaWV3TW9kZT4oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RzZHItdmlldycpID09PSAnc3BsaXQnID8gJ3NwbGl0JyA6ICdzaW5nbGUnXG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ3NpbmdsZSdcbiAgICB9XG4gIH0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkc2RyLXZpZXcnLCB2aWV3KVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gcHJpdmF0ZSBtb2RlIC8gdW5hdmFpbGFibGUgXHUyMDE0IG5vbi1mYXRhbFxuICAgIH1cbiAgfSwgW3ZpZXddKVxuXG4gIC8vIFdvcmtzcGFjZSB0YWIgc3RhdGUuXG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtub3RpY2UsIHNldE5vdGljZV0gPSB1c2VTdGF0ZTx7IGtpbmQ6ICdvaycgfCAnZXJyb3InOyB0ZXh0OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb25maXJtLCBzZXRDb25maXJtXSA9IHVzZVN0YXRlPCdmaWxlJyB8ICdhbGwnIHwgJ3B1c2gnIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdE1lc3NhZ2UsIHNldENvbW1pdE1lc3NhZ2VdID0gdXNlU3RhdGUoJycpXG4gIC8vIExvY2FsICh1bnB1c2hlZCkgY29tbWl0IGhpc3Rvcnk6IGxpc3QgKyBwZXItY29tbWl0IGRpZmYgdmlldy5cbiAgY29uc3QgW2hpc3RvcnksIHNldEhpc3RvcnldID0gdXNlU3RhdGU8Q29tbWl0SW5mb1tdPihbXSlcbiAgY29uc3QgW3NlbGVjdGVkQ29tbWl0LCBzZXRTZWxlY3RlZENvbW1pdF0gPSB1c2VTdGF0ZTxDb21taXRJbmZvIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdERpZmYsIHNldENvbW1pdERpZmZdID0gdXNlU3RhdGU8Q29tbWl0RGlmZlJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdERpZmZMb2FkaW5nLCBzZXRDb21taXREaWZmTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbGVjdGVkQ29tbWl0RmlsZSwgc2V0U2VsZWN0ZWRDb21taXRGaWxlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIElubGluZSByZXZpZXcgY29tbWVudHMgKHdvcmtzcGFjZSB0YWIsIHNpbmdsZSB2aWV3KS5cbiAgY29uc3QgW2NvbW1lbnRzLCBzZXRDb21tZW50c10gPSB1c2VTdGF0ZTxSZXZpZXdDb21tZW50W10+KFtdKVxuICBjb25zdCBbY29tbWVudEVkaXRvciwgc2V0Q29tbWVudEVkaXRvcl0gPSB1c2VTdGF0ZTx7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21tZW50VGV4dCwgc2V0Q29tbWVudFRleHRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjb21tZW50UG9wb3Zlciwgc2V0Q29tbWVudFBvcG92ZXJdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgLy8gUmV2aWV3IHNjb3BlOiB3aGljaCBzbGljZSBvZiB0aGUgcmVwb3NpdG9yeSB0aGUgd29ya3NwYWNlIHRhYiBzaG93cy5cbiAgY29uc3QgW3Njb3BlLCBzZXRTY29wZV0gPSB1c2VTdGF0ZTxXb3Jrc3BhY2VTY29wZT4oJ2FsbCcpXG4gIGNvbnN0IFticmFuY2hlcywgc2V0QnJhbmNoZXNdID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKVxuICBjb25zdCBbYmFzZUJyYW5jaCwgc2V0QmFzZUJyYW5jaF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbYmFzZVN0YXR1cywgc2V0QmFzZVN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIC8vIEZlZWRiYWNrIGxvb3A6IHNlbmQgaW5saW5lIGNvbW1lbnRzIHRvIHRoZSBhZ2VudCAoc2Vzc2lvbi5wcm9tcHQsIGNvcHkgZmFsbGJhY2spLlxuICBjb25zdCBbc2VuZE9wZW4sIHNldFNlbmRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VuZFRleHQsIHNldFNlbmRUZXh0XSA9IHVzZVN0YXRlKCcnKVxuICAvLyBBSSByZXZpZXcgKC9yZXZpZXcpOiBmaW5kaW5ncyArIHZlcmRpY3QuXG4gIGNvbnN0IFtyZXZpZXcsIHNldFJldmlld10gPSB1c2VTdGF0ZTxSZXZpZXdSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtyZXZpZXdpbmcsIHNldFJldmlld2luZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgLy8gR2l0SHViIFBSIGNvbnRleHQgKGdoIENMSSkuXG4gIGNvbnN0IFtwciwgc2V0UHJdID0gdXNlU3RhdGU8UHJSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIC8vIE11bHRpLXJlcG86IHJlcG9zIGRldGVjdGVkIHVuZGVyIHRoZSB3b3Jrc3BhY2UgKyB0aGUgc2VsZWN0ZWQgb25lLlxuICBjb25zdCBbcmVwb3MsIHNldFJlcG9zXSA9IHVzZVN0YXRlPHsgcGF0aDogc3RyaW5nOyBicmFuY2g6IHN0cmluZyB8IG51bGwgfVtdPihbXSlcbiAgY29uc3QgW3JlcG9QYXRoLCBzZXRSZXBvUGF0aF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBUZW1wb3JhcnkgbGluZSBoaWdobGlnaHQgKGp1bXAgdGFyZ2V0IGZyb20gYSBQUiBjb21tZW50IG9yIGEgZmluZGluZykuXG4gIGNvbnN0IFtqdW1wTGluZSwgc2V0SnVtcExpbmVdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgLy8gRmluZGluZ3MgbGlzdCBwYW5lbCB2aXNpYmlsaXR5LlxuICBjb25zdCBbZmluZGluZ3NPcGVuLCBzZXRGaW5kaW5nc09wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgLyoqIFNlbGVjdCBhIGZpbGUgYW5kIGZsYXNoIGl0cyBsaW5lIChmaW5kaW5ncyAvIFBSIGNvbW1lbnRzKS4gKi9cbiAgY29uc3QganVtcFRvID0gKGZpbGU6IHN0cmluZywgbGluZT86IG51bWJlcikgPT4ge1xuICAgIHNldFNlbGVjdGVkKGZpbGUpXG4gICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgc2V0SnVtcExpbmUobGluZSA/PyBudWxsKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0SnVtcExpbmUobnVsbCksIDI1MDApXG4gIH1cbiAgLy8gQ29sbGFwc2VkIGRpcmVjdG9yaWVzIGluIHRoZSBsZWZ0LWhhbmQgZmlsZSB0cmVlIChzaGFyZWQgYWNyb3NzIHRhYnMpLlxuICBjb25zdCBbY29sbGFwc2VkRGlycywgc2V0Q29sbGFwc2VkRGlyc10gPSB1c2VTdGF0ZTxSZWFkb25seVNldDxzdHJpbmc+PigoKSA9PiBuZXcgU2V0KCkpXG4gIGNvbnN0IHRvZ2dsZURpciA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKHBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgc2V0Q29sbGFwc2VkRGlycygocHJldikgPT4ge1xuICAgICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChwcmV2KVxuICAgICAgICBpZiAobmV4dC5oYXMocGF0aCkpIG5leHQuZGVsZXRlKHBhdGgpXG4gICAgICAgIGVsc2UgbmV4dC5hZGQocGF0aClcbiAgICAgICAgcmV0dXJuIG5leHRcbiAgICAgIH0pXG4gICAgfSxcbiAgICBbXSxcbiAgKVxuICBjb25zdCBub3RpY2VUaW1lciA9IHVzZVJlZjxSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKVxuXG4gIC8vIEN1cnJlbnQgc2Vzc2lvbidzIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCAocmVhY3RpdmUpLCBmb3IgdGhlIHNlc3Npb24gdGFiLlxuICBjb25zdCBjdXJyZW50SWQgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICB1c2VNZW1vKCgpID0+IChub3RpZnk6ICgpID0+IHZvaWQpID0+IHNlc3Npb25zLmxpc3Quc3Vic2NyaWJlKG5vdGlmeSksIFtzZXNzaW9uc10pLFxuICAgIHVzZU1lbW8oKCkgPT4gKCkgPT4gc2Vzc2lvbnMubGlzdC5nZXRTbmFwc2hvdCgpLmN1cnJlbnQsIFtzZXNzaW9uc10pLFxuICApXG4gIGNvbnN0IHNuYXBzaG90ID0gdXNlU3luY0V4dGVybmFsU3RvcmUoXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICByZXR1cm4gKG5vdGlmeTogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICAgIGlmICghYmluZGluZykgcmV0dXJuICgpID0+IHt9XG4gICAgICAgIHJldHVybiBiaW5kaW5nLnNlc3Npb24uc3Vic2NyaWJlKG5vdGlmeSlcbiAgICAgIH1cbiAgICB9LCBbc2Vzc2lvbnMsIGN1cnJlbnRJZF0pLFxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IGN1cnJlbnRJZCA/IHNlc3Npb25zLmJpbmRpbmcoY3VycmVudElkKSA6IHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gYmluZGluZyA/IGJpbmRpbmcuc2Vzc2lvbi5nZXRTbmFwc2hvdCgpIDogbnVsbFxuICAgICAgfVxuICAgIH0sIFtzZXNzaW9ucywgY3VycmVudElkXSksXG4gIClcblxuICBjb25zdCByb3VuZHMgPSB1c2VNZW1vKCgpID0+IChzbmFwc2hvdCA/IGNvbGxlY3RTZXNzaW9uUm91bmRzKHNuYXBzaG90Lm5vZGVzKSA6IFtdKSwgW3NuYXBzaG90XSlcbiAgLy8gTGVmdC1oYW5kIGZpbGUgdHJlZXM6IHBlci1yb3VuZCB0cmVlcyBmb3IgdGhlIHNlc3Npb24gdGFiLCBvbmUgdHJlZSBmb3JcbiAgLy8gdGhlIGdpdCB3b3JraW5nIHRyZWUgb24gdGhlIHdvcmtzcGFjZSB0YWIuXG4gIGNvbnN0IHNlc3Npb25UcmVlcyA9IHVzZU1lbW8oKCkgPT4gbmV3IE1hcChyb3VuZHMubWFwKChyKSA9PiBbci5yb3VuZCwgYnVpbGRGaWxlVHJlZShyLmNoYW5nZXMsIChjKSA9PiBjLnBhdGgpXSkpLCBbcm91bmRzXSlcbiAgY29uc3QgdG90YWxTZXNzaW9uRmlsZXMgPSB1c2VNZW1vKCgpID0+IHJvdW5kcy5yZWR1Y2UoKG4sIHIpID0+IG4gKyByLmNoYW5nZXMubGVuZ3RoLCAwKSwgW3JvdW5kc10pXG4gIGNvbnN0IFtzZWxlY3RlZFJvdW5kLCBzZXRTZWxlY3RlZFJvdW5kXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzZWxlY3RlZFBhdGgsIHNldFNlbGVjdGVkUGF0aF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBzZWxlY3RlZENoYW5nZSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IHJvdW5kID0gcm91bmRzLmZpbmQoKHIpID0+IHIucm91bmQgPT09IHNlbGVjdGVkUm91bmQpXG4gICAgcmV0dXJuIHJvdW5kPy5jaGFuZ2VzLmZpbmQoKGMpID0+IGMucGF0aCA9PT0gc2VsZWN0ZWRQYXRoKSA/PyBudWxsXG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmQsIHNlbGVjdGVkUGF0aF0pXG5cbiAgY29uc3QgY3dkID0gc3RvcmVTdGF0ZS5jd2RcbiAgLyoqIEFjdGl2ZSBnaXQgcmVwbyBmb3Igd29ya3NwYWNlIG9wZXJhdGlvbnMgKG11bHRpLXJlcG8gc2VsZWN0b3Igb3ZlcnJpZGUpLiAqL1xuICBjb25zdCBhY3RpdmVDd2QgPSByZXBvUGF0aCA/PyBjd2RcblxuICBjb25zdCBsb2FkV29ya3NwYWNlID0gYXN5bmMgKHNpbGVudCA9IGZhbHNlKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QpIHJldHVyblxuICAgIGlmICghc2lsZW50KSBzZXRMb2FkaW5nKHRydWUpXG4gICAgc2V0RXJyb3IobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgW25leHQsIGhpc3QsIG5leHRDb21tZW50cywgYnJhbmNoTGlzdCwgcHJEYXRhLCByZXBvTGlzdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGxvYWRTdGF0dXMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEhpc3RvcnkoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZENvbW1lbnRzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRCcmFuY2hlcyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUHIoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZFJlcG9zKGFjdGl2ZUN3ZCksXG4gICAgICBdKVxuICAgICAgc2V0U3RhdHVzKG5leHQpXG4gICAgICBpZiAoaGlzdC5vaykgc2V0SGlzdG9yeShoaXN0LmNvbW1pdHMpXG4gICAgICBzZXRDb21tZW50cyhuZXh0Q29tbWVudHMpXG4gICAgICBzZXRCcmFuY2hlcyhicmFuY2hMaXN0KVxuICAgICAgc2V0UHIocHJEYXRhKVxuICAgICAgc2V0UmVwb3MocmVwb0xpc3QucmVwb3MpXG4gICAgICAvLyBEZWZhdWx0IHRoZSByZXBvIHNlbGVjdG9yIHRvIHRoZSB3b3Jrc3BhY2Ugcm9vdCB3aGVuIGl0IGlzIGl0c2VsZiBhIHJlcG8uXG4gICAgICBpZiAocmVwb1BhdGggPT09IG51bGwgJiYgIXJlcG9MaXN0LnJlcG9zLnNvbWUoKHIpID0+IHIucGF0aCA9PT0gYWN0aXZlQ3dkKSkge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHJlcG9MaXN0LnJlcG9zWzBdXG4gICAgICAgIGlmIChmaXJzdCAmJiBmaXJzdC5wYXRoICE9PSBjd2QpIHNldFJlcG9QYXRoKGZpcnN0LnBhdGgpXG4gICAgICB9XG4gICAgICBpZiAobmV4dC5lcnJvciAmJiAhbmV4dC5pc1JlcG8pIHNldEVycm9yKG5leHQuZXJyb3IpXG4gICAgICBzZXRTZWxlY3RlZCgocHJldikgPT4gKHByZXYgJiYgbmV4dC5maWxlcy5zb21lKChmKSA9PiBmLnBhdGggPT09IHByZXYpID8gcHJldiA6IG5leHQuZmlsZXNbMF0/LnBhdGggPz8gbnVsbCkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0RXJyb3IoZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIEF1dG8tcmVmcmVzaCB0aGUgd29ya3NwYWNlIGRhdGE6IHJlbG9hZCB3aGVuZXZlciB0aGUgdGFiIGJlY29tZXMgYWN0aXZlIG9yXG4gIC8vIHRoZSB3b3Jrc3BhY2UgY2hhbmdlcywgYW5kIHBlcmlvZGljYWxseSB3aGlsZSB0aGUgb3ZlcmxheSBpcyBvcGVuLiBBXG4gIC8vIHdvcmtzcGFjZSBzd2l0Y2ggY2xlYXJzIHN0YWxlIGNvbW1pdCBzZWxlY3Rpb24gYW5kIGhpc3RvcnkgZmlyc3QuXG4gIGNvbnN0IHdvcmtzcGFjZUN3ZFJlZiA9IHVzZVJlZjxzdHJpbmcgfCBudWxsPihudWxsKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHByZXZpb3VzID0gd29ya3NwYWNlQ3dkUmVmLmN1cnJlbnRcbiAgICB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudCA9IGFjdGl2ZUN3ZCA/PyBudWxsXG4gICAgaWYgKHRhYiAhPT0gJ3dvcmtzcGFjZScgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKHByZXZpb3VzICE9PSBhY3RpdmVDd2QpIHtcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICAgIHNldEhpc3RvcnkoW10pXG4gICAgICBzZXRDb21tZW50cyhbXSlcbiAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgIHNldENvbW1lbnRQb3BvdmVyKG51bGwpXG4gICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgIHNldFByKG51bGwpXG4gICAgfVxuICAgIHZvaWQgbG9hZFdvcmtzcGFjZSgpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbdGFiLCBhY3RpdmVDd2RdKVxuXG4gIC8vIFN1cmZhY2Ugd29ya3NwYWNlIGNvbW1lbnRzIGFib3ZlIHRoZSBjb21wb3NlciAoQ29kZXgtc3R5bGUgZG9jaykuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcGVuZGluZ0NvbW1lbnRzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLmN3ZCA9IGFjdGl2ZUN3ZCA/PyBudWxsXG4gICAgICBkLmNvbW1lbnRzID0gY29tbWVudHNcbiAgICB9KVxuICB9LCBbY29tbWVudHMsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gSnVtcCB0byBhIGNoYW5nZSBibG9jayBmcm9tIHRoZSBjb21wb3NlciBkb2NrIChjb21tZW50IGNsaWNrKS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmb2N1cyA9IHN0b3JlU3RhdGUuZm9jdXNcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkIHx8ICFmb2N1cykgcmV0dXJuXG4gICAgc2V0VGFiKCd3b3Jrc3BhY2UnKVxuICAgIHNldFNlbGVjdGVkKGZvY3VzLnBhdGgpXG4gICAgc2V0SnVtcExpbmUoZm9jdXMubGluZSA/PyBudWxsKVxuICAgIGNvbnN0IHNjcm9sbFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoZm9jdXMubGluZSAhPSBudWxsKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWRzZHItbGluZT1cIiR7Zm9jdXMubGluZX1cIl1gKT8uc2Nyb2xsSW50b1ZpZXcoeyBibG9jazogJ2NlbnRlcicsIGJlaGF2aW9yOiAnc21vb3RoJyB9KVxuICAgICAgfVxuICAgIH0sIDgwKVxuICAgIGNvbnN0IGNsZWFyVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHNldEp1bXBMaW5lKG51bGwpLCAyNTAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZXIpXG4gICAgICBjbGVhclRpbWVvdXQoY2xlYXJUaW1lcilcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc3RvcmVTdGF0ZS5rZXldKVxuXG4gIC8vIEtlZXAgc3RhZ2VkL3Vuc3RhZ2VkL2hpc3RvcnkgZnJlc2ggd2hpbGUgdGhlIHdvcmtzcGFjZSB0YWIgaXMgb3Blbi5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCB0YWIgIT09ICd3b3Jrc3BhY2UnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGNvbnN0IHRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdm9pZCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgfSwgMTUwMDApXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwodGltZXIpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc3RvcmVTdGF0ZS5vcGVuLCB0YWIsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gQnJhbmNoIHNjb3BlOiBkaWZmIHRoZSB3b3JrdHJlZSBhZ2FpbnN0IHRoZSBzZWxlY3RlZCBiYXNlIGJyYW5jaC5cbiAgLy8gRGVmYXVsdCB0aGUgYmFzZSB0byB0aGUgZmlyc3QgYnJhbmNoIHRoYXQgaXNuJ3QgdGhlIGN1cnJlbnQgb25lLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzY29wZSAhPT0gJ2JyYW5jaCcgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgY29uc3QgY3VycmVudCA9IHN0YXR1cz8uYnJhbmNoID8/IG51bGxcbiAgICBpZiAoYmFzZUJyYW5jaCA9PT0gbnVsbCAmJiBicmFuY2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBmYWxsYmFjayA9IGJyYW5jaGVzLmZpbmQoKGIpID0+IGIgIT09IGN1cnJlbnQpID8/IGJyYW5jaGVzWzBdXG4gICAgICBzZXRCYXNlQnJhbmNoKGZhbGxiYWNrKVxuICAgIH1cbiAgfSwgW3Njb3BlLCBhY3RpdmVDd2QsIGJyYW5jaGVzLCBiYXNlQnJhbmNoLCBzdGF0dXM/LmJyYW5jaF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2NvcGUgIT09ICdicmFuY2gnIHx8ICFhY3RpdmVDd2QgfHwgIWJhc2VCcmFuY2gpIHtcbiAgICAgIHNldEJhc2VTdGF0dXMobnVsbClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgY2FuY2VsbGVkID0gZmFsc2VcbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtTVEFUVVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoYWN0aXZlQ3dkKX0mYmFzZT0ke2VuY29kZVVSSUNvbXBvbmVudChiYXNlQnJhbmNoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+IG51bGwpKSBhcyBTdGF0dXNSZXNwb25zZSB8IG51bGxcbiAgICAgIGlmICghY2FuY2VsbGVkICYmIGRhdGEpIHtcbiAgICAgICAgc2V0QmFzZVN0YXR1cyhkYXRhKVxuICAgICAgICBpZiAoZGF0YS5lcnJvciAmJiBiYXNlU3RhdHVzPy5lcnJvciAhPT0gZGF0YS5lcnJvcikgc2V0RXJyb3IoZGF0YS5lcnJvcilcbiAgICAgIH1cbiAgICB9KSgpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc2NvcGUsIGFjdGl2ZUN3ZCwgYmFzZUJyYW5jaF0pXG5cbiAgLy8gRGVmYXVsdCBzZWxlY3Rpb24gZm9yIHRoZSBzZXNzaW9uIHRhYiBmb2xsb3dzIHRoZSBmaXJzdCByb3VuZCB3aXRoIGNoYW5nZXMuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkUm91bmQgPT09IG51bGwgJiYgcm91bmRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmRzWzBdLnJvdW5kKVxuICAgICAgc2V0U2VsZWN0ZWRQYXRoKHJvdW5kc1swXS5jaGFuZ2VzWzBdPy5wYXRoID8/IG51bGwpXG4gICAgfVxuICB9LCBbcm91bmRzLCBzZWxlY3RlZFJvdW5kXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuKSByZXR1cm5cbiAgICBjb25zdCBvbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgIGQub3BlbiA9IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5KVxuICB9LCBbc3RvcmVTdGF0ZS5vcGVuXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghbm90aWNlKSByZXR1cm5cbiAgICBub3RpY2VUaW1lci5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiBzZXROb3RpY2UobnVsbCksIDMwMDApXG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dChub3RpY2VUaW1lci5jdXJyZW50KVxuICB9LCBbbm90aWNlXSlcblxuICBjb25zdCBmaWxlcyA9IHN0YXR1cz8uaXNSZXBvID8gc3RhdHVzLmZpbGVzIDogW11cbiAgY29uc3Qgc3RhZ2VkRmlsZXMgPSB1c2VNZW1vKCgpID0+IGZpbGVzLmZpbHRlcigoZikgPT4gZi5zdGFnZWQpLCBbZmlsZXNdKVxuICBjb25zdCB1bnN0YWdlZEZpbGVzID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGYpID0+ICFmLnN0YWdlZCksIFtmaWxlc10pXG5cbiAgLy8gXCJMYXN0IHR1cm5cIiBzY29wZTogcGF0aHMgdGhlIGFnZW50IHRvdWNoZWQgaW4gdGhlIG1vc3QgcmVjZW50IHJvdW5kLlxuICBjb25zdCBsYXN0Um91bmRQYXRocyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gICAgY29uc3QgbGFzdCA9IHJvdW5kc1tyb3VuZHMubGVuZ3RoIC0gMV1cbiAgICBpZiAoIWxhc3QgfHwgIWN3ZCkgcmV0dXJuIHNldFxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGxhc3QuY2hhbmdlcykge1xuICAgICAgc2V0LmFkZChjaGFuZ2UucGF0aClcbiAgICAgIGNvbnN0IHAgPSBjaGFuZ2UucGF0aFxuICAgICAgaWYgKGlzQWJzUGF0aChwKSkge1xuICAgICAgICBjb25zdCByZWwgPSBwLnN0YXJ0c1dpdGgoY3dkKSA/IHAuc2xpY2UoY3dkLmxlbmd0aCkucmVwbGFjZSgvXltcXFxcL10rLywgJycpIDogcFxuICAgICAgICBzZXQuYWRkKHJlbClcbiAgICAgICAgc2V0LmFkZChiYXNlTmFtZShwKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldC5hZGQoYmFzZU5hbWUocCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZXRcbiAgfSwgW3JvdW5kcywgY3dkXSlcblxuICAvKiogVGhlIGZpbGUgc2xpY2UgdGhlIGN1cnJlbnQgc2NvcGUgc2hvd3MuICovXG4gIGNvbnN0IHNjb3BlRmlsZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICBjYXNlICd1bnN0YWdlZCc6XG4gICAgICAgIHJldHVybiB1bnN0YWdlZEZpbGVzXG4gICAgICBjYXNlICdzdGFnZWQnOlxuICAgICAgICByZXR1cm4gc3RhZ2VkRmlsZXNcbiAgICAgIGNhc2UgJ2JyYW5jaCc6XG4gICAgICAgIHJldHVybiBiYXNlU3RhdHVzPy5maWxlcyA/PyBbXVxuICAgICAgY2FzZSAnbGFzdC10dXJuJzpcbiAgICAgICAgaWYgKGxhc3RSb3VuZFBhdGhzLnNpemUgPT09IDApIHJldHVybiBbXVxuICAgICAgICByZXR1cm4gZmlsZXMuZmlsdGVyKChmKSA9PiB7XG4gICAgICAgICAgaWYgKGxhc3RSb3VuZFBhdGhzLmhhcyhmLnBhdGgpIHx8IGxhc3RSb3VuZFBhdGhzLmhhcyhiYXNlTmFtZShmLnBhdGgpKSkgcmV0dXJuIHRydWVcbiAgICAgICAgICAvLyBTZXNzaW9uIHBhdGhzIG1heSBiZSB3b3Jrc3BhY2Utcm9vdCByZWxhdGl2ZSBvciBhYnNvbHV0ZSAodGhlIHJlcG8gY2FuXG4gICAgICAgICAgLy8gYmUgYSBzdWJkaXJlY3Rvcnkgb2YgdGhlIHdvcmtzcGFjZSkgXHUyMDE0IG1hdGNoIGFueSBzdWZmaXggZm9ybS5cbiAgICAgICAgICBjb25zdCBzdWZmaXggPSBgLyR7Zi5wYXRofWBcbiAgICAgICAgICBmb3IgKGNvbnN0IHAgb2YgbGFzdFJvdW5kUGF0aHMpIHtcbiAgICAgICAgICAgIGlmIChwLmVuZHNXaXRoKHN1ZmZpeCkpIHJldHVybiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9KVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZpbGVzXG4gICAgfVxuICB9LCBbc2NvcGUsIHVuc3RhZ2VkRmlsZXMsIHN0YWdlZEZpbGVzLCBiYXNlU3RhdHVzLCBmaWxlcywgbGFzdFJvdW5kUGF0aHNdKVxuXG4gIC8qKiBTY29wZXMgd2hlcmUgZmlsZS9odW5rIGFjY2VwdFx1MDBCN3JldmVydFx1MDBCN3Vuc3RhZ2UgYW5kIGNvbW1pdC9wdXNoIG1ha2Ugc2Vuc2UuICovXG4gIGNvbnN0IGFsbG93QWN0aW9ucyA9IHNjb3BlICE9PSAnYnJhbmNoJyAmJiBzY29wZSAhPT0gJ2NvbW1pdCdcblxuICAvKiogRmlsZXMgdGhlIGN1cnJlbnQgc2NvcGUgY2FuIGhhbmQgdG8gdGhlIEFJIHJldmlldy4gKi9cbiAgY29uc3QgcmV2aWV3YWJsZUZpbGVzID0gc2NvcGUgPT09ICdicmFuY2gnID8gYmFzZVN0YXR1cz8uZmlsZXM/Lmxlbmd0aCA/PyAwIDogZmlsZXMubGVuZ3RoXG4gIGNvbnN0IHN0YWdlZENvdW50ID0gc3RhZ2VkRmlsZXMubGVuZ3RoXG4gIC8vIE5PVEU6IGhvb2tzIG11c3QgYWxsIHJ1biBiZWZvcmUgdGhlIGVhcmx5IHJldHVybiBiZWxvdyAoUmVhY3QgaG9vayBvcmRlcikuXG4gIGNvbnN0IHN0YWdlZFRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc3RhZ2VkRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbc3RhZ2VkRmlsZXNdKVxuICBjb25zdCB1bnN0YWdlZFRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUodW5zdGFnZWRGaWxlcywgKGYpID0+IGYucGF0aCksIFt1bnN0YWdlZEZpbGVzXSlcbiAgY29uc3Qgc2NvcGVUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHNjb3BlRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbc2NvcGVGaWxlc10pXG4gIGNvbnN0IGNvbW1pdEZpbGVzVHJlZSA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKGNvbW1pdERpZmY/Lm9rID8gYnVpbGRGaWxlVHJlZShjb21taXREaWZmLmZpbGVzLCAoZikgPT4gZi5wYXRoKSA6IFtdKSxcbiAgICBbY29tbWl0RGlmZl0sXG4gIClcblxuICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHNlbGVjdGVkRmlsZSA9IHNjb3BlRmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBzZWxlY3RlZCkgPz8gbnVsbFxuICBjb25zdCB0b3RhbEFkZGVkID0gZmlsZXMucmVkdWNlKChuLCBmKSA9PiBuICsgZi5hZGRlZCwgMClcbiAgY29uc3QgdG90YWxEZWxldGVkID0gZmlsZXMucmVkdWNlKChuLCBmKSA9PiBuICsgZi5kZWxldGVkLCAwKVxuXG4gIC8vIENvbW1pdC1kZXRhaWwgdmlldzogdGhlIHNlbGVjdGVkIGZpbGUgd2l0aGluIHRoZSBzZWxlY3RlZCBjb21taXQuXG4gIGNvbnN0IGNvbW1pdFNlZ21lbnRzID0gY29tbWl0RGlmZj8ub2sgPyBzcGxpdENvbW1pdERpZmYoY29tbWl0RGlmZi5kaWZmKSA6IFtdXG4gIGNvbnN0IGNvbW1pdEFjdGl2ZUZpbGUgPSBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayA/IGNvbW1pdERpZmYuZmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBzZWxlY3RlZENvbW1pdEZpbGUpID8/IG51bGwgOiBudWxsXG4gIGNvbnN0IGNvbW1pdEFjdGl2ZVRleHQgPSBjb21taXRBY3RpdmVGaWxlXG4gICAgPyBjb21taXRTZWdtZW50cy5maW5kKChzKSA9PiBzLnBhdGggPT09IGNvbW1pdEFjdGl2ZUZpbGUucGF0aCk/LnRleHQgPz8gY29tbWl0RGlmZj8uZGlmZiA/PyAnJ1xuICAgIDogY29tbWl0RGlmZj8uZGlmZiA/PyAnJ1xuXG4gIC8qKiBMZWFmIHJvdyBzaGFyZWQgYnkgdGhlIHN0YWdlZC91bnN0YWdlZCBmaWxlIHRyZWVzLiAqL1xuICBjb25zdCB3b3Jrc3BhY2VMZWFmID0gKHsgaXRlbTogZmlsZSwgbmFtZSB9OiB7IGl0ZW06IERpZmZGaWxlOyBuYW1lOiBzdHJpbmcgfSkgPT4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICBhcmlhLXNlbGVjdGVkPXtmaWxlLnBhdGggPT09IHNlbGVjdGVkfVxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtmaWxlLnBhdGggPT09IHNlbGVjdGVkID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWQoZmlsZS5wYXRoKVxuICAgICAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgICAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICAgICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hpcENsYXNzKGZpbGUuc3RhdHVzKX1gfT57ZmlsZS51bnRyYWNrZWQgPyAnPz8nIDogZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICB7ZmlsZS5iaW5hcnkgPyB0KCdyZXZpZXcuYmluYXJ5JykgOiB0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxuXG4gIGNvbnN0IHJ1bkFwcGx5ID0gYXN5bmMgKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZykgPT4ge1xuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcGx5Q2hhbmdlcyhhY3RpdmVDd2QgPz8gY3dkID8/ICcnLCBhY3Rpb24sIHBhdGgpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIGNvbnN0IHZlcmIgPSBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiBhY3Rpb24gPT09ICd1bnN0YWdlJyA/IHQoJ3Jldmlldy51bnN0YWdlZCcpIDogdCgncmV2aWV3LnJldmVydGVkJylcbiAgICAgICAgc2V0Tm90aWNlKHtcbiAgICAgICAgICBraW5kOiAnb2snLFxuICAgICAgICAgIHRleHQ6IHBhdGhcbiAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVPbmUnLCB7IGFjdGlvbjogdmVyYiwgcGF0aCB9KVxuICAgICAgICAgICAgOiByZXN1bHQuZGVsZXRlZCAmJiByZXN1bHQuZGVsZXRlZC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVEZWxldGVkJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGgsIGRlbGV0ZWQ6IHJlc3VsdC5kZWxldGVkLmxlbmd0aCB9KVxuICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5kb25lJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGggfSksXG4gICAgICAgIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBvbkZpbGVBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnZmlsZScpIHtcbiAgICAgIHNldENvbmZpcm0oJ2ZpbGUnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2ZpbGUnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbiwgcGF0aClcbiAgfVxuXG4gIGNvbnN0IG9uQWxsQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JykgPT4ge1xuICAgIGlmIChhY3Rpb24gPT09ICdyZXZlcnQnICYmIGNvbmZpcm0gIT09ICdhbGwnKSB7XG4gICAgICBzZXRDb25maXJtKCdhbGwnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2FsbCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uKVxuICB9XG5cbiAgLyoqIEFwcGx5IG9uZSBodW5rIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpIG9mIHRoZSBzZWxlY3RlZCBmaWxlLiAqL1xuICBjb25zdCBvbkh1bmtBY3Rpb24gPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBEaWZmSHVuaykgPT4ge1xuICAgIGlmICghc2VsZWN0ZWRGaWxlIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlIdW5rKGFjdGl2ZUN3ZCA/PyBjd2QgPz8gJycsIHNlbGVjdGVkRmlsZS5wYXRoLCBhY3Rpb24sIGh1bmsudGV4dClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgY29uc3QgdmVyYiA9IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IGFjdGlvbiA9PT0gJ3Vuc3RhZ2UnID8gdCgncmV2aWV3LnVuc3RhZ2VkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiB2ZXJiLCBwYXRoOiBzZWxlY3RlZEZpbGUucGF0aCB9KSB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBpbmxpbmUgY29tbWVudHMgLS0tLVxuICBjb25zdCBvcGVuQ29tbWVudCA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVyblxuICAgIHNldENvbW1lbnRFZGl0b3IoeyBvbGRMaW5lLCBuZXdMaW5lIH0pXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgfVxuXG4gIGNvbnN0IHNhdmVDb21tZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghc2VsZWN0ZWRGaWxlIHx8ICFjb21tZW50RWRpdG9yIHx8IGJ1c3kpIHJldHVyblxuICAgIGNvbnN0IHRleHQgPSBjb21tZW50VGV4dC50cmltKClcbiAgICBpZiAoIXRleHQpIHJldHVyblxuICAgIGNvbnN0IGNvbW1lbnQ6IFJldmlld0NvbW1lbnQgPSB7XG4gICAgICBpZDogdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gLFxuICAgICAgcGF0aDogc2VsZWN0ZWRGaWxlLnBhdGgsXG4gICAgICBsaW5lTmV3OiBjb21tZW50RWRpdG9yLm5ld0xpbmUsXG4gICAgICBsaW5lT2xkOiBjb21tZW50RWRpdG9yLm9sZExpbmUsXG4gICAgICB0ZXh0LFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmV4dCA9IFsuLi5jb21tZW50cywgY29tbWVudF1cbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdjb21tZW50LnNhdmVkJykgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2FuY2VsQ29tbWVudCA9ICgpID0+IHtcbiAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gIH1cblxuICBjb25zdCBkZWxldGVDb21tZW50ID0gYXN5bmMgKGlkOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gYy5pZCAhPT0gaWQpXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBpZiAoYWN0aXZlQ3dkICYmIChhd2FpdCBzYXZlQ29tbWVudHMoYWN0aXZlQ3dkLCBuZXh0KSkpIHtcbiAgICAgICAgc2V0Q29tbWVudHMobmV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBBSSByZXZpZXcgKC9yZXZpZXcpOiBydW4sIHJlLXJ1biwgYW5kIGhhbmQgZmluZGluZ3MgdG8gdGhlIGFnZW50IC0tLS1cbiAgY29uc3Qgb25SZXZpZXcgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgcmV2aWV3aW5nIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldFJldmlld2luZyh0cnVlKVxuICAgIHNldFJldmlldyhudWxsKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXZpZXdTY29wZSA9IHNjb3BlID09PSAnYnJhbmNoJyA/ICdicmFuY2gnIDogc2NvcGUgPT09ICdjb21taXQnICYmIHNlbGVjdGVkQ29tbWl0ID8gJ2NvbW1pdCcgOiAndW5jb21taXR0ZWQnXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5SZXZpZXcoYWN0aXZlQ3dkLCBjdXJyZW50SWQgPz8gbnVsbCwgcmV2aWV3U2NvcGUsIGJhc2VCcmFuY2ggPz8gdW5kZWZpbmVkLCBzZWxlY3RlZENvbW1pdD8uaGFzaCA/PyB1bmRlZmluZWQpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIHNldFJldmlldyhyZXN1bHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LnJldmlld0ZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LnJldmlld0ZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFJldmlld2luZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogQ29tcG9zZSBhIFwic2VuZCB0byBhZ2VudFwiIG1lc3NhZ2UgZnJvbSBmaW5kaW5ncyBvciBQUiBjb21tZW50cy4gKi9cbiAgY29uc3QgY29tcG9zZUZpbmRpbmdzTWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdGaW5kaW5nW10+KClcbiAgICBmb3IgKGNvbnN0IGYgb2YgcmV2aWV3Py5maW5kaW5ncyA/PyBbXSkge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoZi5maWxlKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChmKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGYuZmlsZSwgW2ZdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQiBBSSBcdThCQzRcdTVCQTFcdTUzRDFcdTczQjBcdUZGMDhBZGRyZXNzIHRoZSByZXZpZXcgZmluZGluZ3NcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLCAnJ11cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBmIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBmLmxpbmVTdGFydCA9PT0gZi5saW5lRW5kID8gYDoke2YubGluZVN0YXJ0fWAgOiBgOiR7Zi5saW5lU3RhcnR9LSR7Zi5saW5lRW5kfWBcbiAgICAgICAgbGluZXMucHVzaChgLSBbJHtmLnByaW9yaXR5fV0gJHtwYXRofSR7cmFuZ2V9OiAke2YudGl0bGV9IFx1MjAxNCAke2YuZGV0YWlsfWApXG4gICAgICAgIGlmIChmLnN1Z2dlc3Rpb24pIGxpbmVzLnB1c2goYCAgXFxgXFxgXFxgXFxuJHtmLnN1Z2dlc3Rpb259XFxuICBcXGBcXGBcXGBgKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBjb21wb3NlUHJNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKCFwcj8ucHIgfHwgcHIuY29tbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbYFx1OEJGN1x1NTkwNFx1NzQwNiBQUiAjJHtwci5wci5udW1iZXJ9XHVGRjA4JHtwci5wci50aXRsZX1cdUZGMDlcdTc2ODRcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBQUiBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQWAsICcnXVxuICAgIGZvciAoY29uc3QgYyBvZiBwci5jb21tZW50cykge1xuICAgICAgY29uc3QgYW5jaG9yID0gYy5wYXRoID8gYCR7Yy5wYXRofSR7Yy5saW5lID8gYDoke2MubGluZX1gIDogJyd9YCA6ICdnZW5lcmFsJ1xuICAgICAgbGluZXMucHVzaChgLSAke2FuY2hvcn0gKCR7Yy5hdXRob3J9KTogJHtjLmJvZHl9YClcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBvcGVuU2VuZFBhbmVsV2l0aCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgICBzZXRTZW5kVGV4dCh0ZXh0KVxuICAgIHNldFNlbmRPcGVuKHRydWUpXG4gIH1cblxuICAvLyAtLS0tIGVkaXRvciBpbnRlZ3JhdGlvbiAodmlhIGRzaC1wbHVnaW4tb3Blbi1lZGl0b3IpIC0tLS1cbiAgY29uc3Qgb3BlbkZpbGUgPSBhc3luYyAocGF0aDogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3BlbkluRWRpdG9yKGFjdGl2ZUN3ZCwgcGF0aCwgbGluZSlcbiAgICBpZiAoIXJlc3VsdC5vaykgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogYCR7dCgnZWRpdG9yLmZhaWxlZCcpfTogJHtyZXN1bHQuZXJyb3IgPz8gJyd9YCB9KVxuICB9XG5cbiAgLyoqIEp1bXAgZnJvbSBhIFBSIGNvbW1lbnQgdG8gdGhlIGZpbGUgKGFuZCBoaWdobGlnaHQgdGhlIGxpbmUpLiAqL1xuICBjb25zdCBvblByQ29tbWVudENsaWNrID0gKHBhdGg6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsIGxpbmU6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpID0+IHtcbiAgICBpZiAocGF0aCkganVtcFRvKHBhdGgsIGxpbmUgPz8gdW5kZWZpbmVkKVxuICAgIGVsc2Ugc2V0SnVtcExpbmUobnVsbClcbiAgfVxuXG4gIC8vIC0tLS0gZmVlZGJhY2sgbG9vcDogY29tbWVudHMgXHUyMTkyIGFnZW50IChwcm9tcHQgaW5qZWN0aW9uLCBjb3B5IGZhbGxiYWNrKSAtLS0tXG4gIGNvbnN0IGNvbXBvc2VSZXZpZXdNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKGNvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0NvbW1lbnRbXT4oKVxuICAgIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoYy5wYXRoKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChjKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGMucGF0aCwgW2NdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXG4gICAgICAnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJyxcbiAgICAgICcnLFxuICAgIF1cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBjIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhdGh9JHthbmNob3J9OiAke2MudGV4dH1gKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBvcGVuU2VuZFBhbmVsID0gKCkgPT4ge1xuICAgIHNldFNlbmRUZXh0KGNvbXBvc2VSZXZpZXdNZXNzYWdlKCkpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIGNvbnN0IHNlbmRUb0FnZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRleHQgPSBzZW5kVGV4dC50cmltKClcbiAgICBpZiAoIXRleHQgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRjb21lID0gYXdhaXQgaW5qZWN0VG9TZXNzaW9uKHNlc3Npb25zLCBjdXJyZW50SWQgPz8gbnVsbCwgdGV4dClcbiAgICAgIHNldFNlbmRPcGVuKGZhbHNlKVxuICAgICAgaWYgKG91dGNvbWUgPT09ICdzZW50Jykgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LnNlbnRUb0FnZW50JykgfSlcbiAgICAgIGVsc2UgaWYgKG91dGNvbWUgPT09ICdjb3BpZWQnKSBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSlcbiAgICAgIGVsc2Ugc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgncmV2aWV3LmNvcHlGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21taXQgdGhlIHN0YWdlZCBjaGFuZ2VzIHdpdGggdGhlIGVudGVyZWQgbWVzc2FnZS4gKi9cbiAgY29uc3Qgb25Db21taXQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGNvbW1pdE1lc3NhZ2UudHJpbSgpXG4gICAgaWYgKCFtZXNzYWdlIHx8IGJ1c3kgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuR2l0QWN0aW9uKGFjdGl2ZUN3ZCwgJ2NvbW1pdCcsIG1lc3NhZ2UpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIHNldENvbW1pdE1lc3NhZ2UoJycpXG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSByZXN1bHQuaGFzaCA/IGAke3Jlc3VsdC5oYXNofSAke3Jlc3VsdC5zdWJqZWN0ID8/ICcnfWAudHJpbSgpIDogKHJlc3VsdC5zdWJqZWN0ID8/ICcnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29tbWl0dGVkJywgeyBzdW1tYXJ5IH0pIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcuY29tbWl0RmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcuY29tbWl0RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogUHVzaCB0aGUgY3VycmVudCBicmFuY2ggKGRvdWJsZS1jbGljayB0byBjb25maXJtKS4gKi9cbiAgY29uc3Qgb25QdXNoID0gKCkgPT4ge1xuICAgIGlmIChidXN5IHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGlmIChjb25maXJtICE9PSAncHVzaCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ3B1c2gnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ3B1c2gnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICBzZXRCdXN5KHRydWUpXG4gICAgICBzZXROb3RpY2UobnVsbClcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkdpdEFjdGlvbihhY3RpdmVDd2QsICdwdXNoJylcbiAgICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5wdXNoZWQnKSB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgfVxuICAgIH0pKClcbiAgfVxuXG4gIC8qKiBTZWxlY3QgYSBsb2NhbCBjb21taXQgYW5kIGxvYWQgaXRzIGRpZmYgaW50byB0aGUgcmlnaHQgcGFuZS4gKi9cbiAgY29uc3Qgc2VsZWN0Q29tbWl0ID0gKGNvbW1pdDogQ29tbWl0SW5mbykgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0KGNvbW1pdClcbiAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgIHNldENvbW1pdERpZmZMb2FkaW5nKHRydWUpXG4gICAgdm9pZCBsb2FkQ29tbWl0RGlmZihhY3RpdmVDd2QsIGNvbW1pdC5oYXNoKVxuICAgICAgLnRoZW4oKGQpID0+IHtcbiAgICAgICAgc2V0Q29tbWl0RGlmZihkKVxuICAgICAgICBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSlcbiAgICAgICAgLy8gRGVmYXVsdCB0aGUgZmlsZSB0cmVlIHRvIHRoZSBmaXJzdCBjaGFuZ2VkIGZpbGUuXG4gICAgICAgIGlmIChkLm9rICYmIGQuZmlsZXMubGVuZ3RoID4gMCkgc2V0U2VsZWN0ZWRDb21taXRGaWxlKGQuZmlsZXNbMF0ucGF0aClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4gc2V0Q29tbWl0RGlmZkxvYWRpbmcoZmFsc2UpKVxuICB9XG5cbiAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9XCJkc2RyLW92ZXJsYXlcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQpIGNsb3NlKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXBhbmVsXCJcbiAgICAgICAgcm9sZT1cImRpYWxvZ1wiXG4gICAgICAgIGFyaWEtbW9kYWw9XCJ0cnVlXCJcbiAgICAgICAgYXJpYS1sYWJlbD17dCgncmV2aWV3LnRpdGxlJyl9XG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiBgJHtwcmVmcy53aWR0aH1weGAsIGhlaWdodDogYCR7cHJlZnMuaGVpZ2h0fXB4YCwgLi4uZGlmZlN0eWxlVmFycyhwcmVmcykgfSBhcyBDU1NQcm9wZXJ0aWVzfVxuICAgICAgPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cImVcIlxuICAgICAgICAgIG9uUmVzaXplPXsoZHgpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLndpZHRoID0gTWF0aC5tYXgoTUlOX1BBTkVMX1csIE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gNjQsIGQud2lkdGggKyBkeCkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJzXCJcbiAgICAgICAgICBvblJlc2l6ZT17KF9keCwgZHkpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLmhlaWdodCA9IE1hdGgubWF4KE1JTl9QQU5FTF9ILCBNYXRoLm1pbih3aW5kb3cuaW5uZXJIZWlnaHQgLSA2NCwgZC5oZWlnaHQgKyBkeSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJzZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCwgZHkpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLndpZHRoID0gTWF0aC5tYXgoTUlOX1BBTkVMX1csIE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gNjQsIGQud2lkdGggKyBkeCkpXG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItaGVhZGVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10aXRsZVwiPnt0KCdyZXZpZXcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10YWJzXCIgcm9sZT1cInRhYmxpc3RcIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcudGl0bGUnKX0+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGFiID09PSAnc2Vzc2lvbid9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGFiJHt0YWIgPT09ICdzZXNzaW9uJyA/ICcgZHNkci10YWItYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFRhYignc2Vzc2lvbicpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dCgndGFiLnNlc3Npb24nKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3RhYiA9PT0gJ3dvcmtzcGFjZSd9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGFiJHt0YWIgPT09ICd3b3Jrc3BhY2UnID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VGFiKCd3b3Jrc3BhY2UnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3QoJ3RhYi53b3Jrc3BhY2UnKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2NvcGVcIj5cbiAgICAgICAgICAgICAge3JlcG9zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3JlcG8ubGFiZWwnKX1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZXBvUGF0aCA/PyBhY3RpdmVDd2QgPz8gJyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXtyZXBvcy5tYXAoKHIpID0+ICh7IHZhbHVlOiByLnBhdGgsIGxhYmVsOiBgJHtiYXNlTmFtZShyLnBhdGgpfSR7ci5icmFuY2ggPyBgICgke3IuYnJhbmNofSlgIDogJyd9YCB9KSl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0UmVwb1BhdGgodilcbiAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICAgICAgc2V0UmV2aWV3KG51bGwpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3Njb3BlLmxhYmVsJyl9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3Njb3BlfVxuICAgICAgICAgICAgICAgIG9wdGlvbnM9e1NDT1BFX09QVElPTlMubWFwKChzKSA9PiAoeyB2YWx1ZTogcy5pZCwgbGFiZWw6IHQocy5sYWJlbCkgfSkpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0U2NvcGUodiBhcyBXb3Jrc3BhY2VTY29wZSlcbiAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYnJhbmNoJyA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUuYmFzZScpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2Jhc2VCcmFuY2ggPz8gJyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXticmFuY2hlcy5tYXAoKGIpID0+ICh7IHZhbHVlOiBiLCBsYWJlbDogYiB9KSl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0QmFzZUJyYW5jaH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXN1YnRpdGxlXCI+XG4gICAgICAgICAgICB7dGFiID09PSAnc2Vzc2lvbidcbiAgICAgICAgICAgICAgPyB0KCdyZXZpZXcuc2Vzc2lvblN0YXRzJywgeyByb3VuZHM6IHJvdW5kcy5sZW5ndGgsIGZpbGVzOiB0b3RhbFNlc3Npb25GaWxlcyB9KVxuICAgICAgICAgICAgICA6IHN0YXR1cz8uaXNSZXBvXG4gICAgICAgICAgICAgICAgPyBgJHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfSBcdTAwQjcgJHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IHRvdGFsQWRkZWQsIGRlbGV0ZWQ6IHRvdGFsRGVsZXRlZCB9KX0ke3N0YXR1cy5haGVhZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5haGVhZCcsIHsgbjogc3RhdHVzLmFoZWFkIH0pfWAgOiAnJ30ke3N0YXR1cy5iZWhpbmQgPiAwID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuYmVoaW5kJywgeyBuOiBzdGF0dXMuYmVoaW5kIH0pfWAgOiAnJ31gXG4gICAgICAgICAgICAgICAgOiB0KCdyZXZpZXcubm90UmVwbycpfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICAge3RhYiA9PT0gJ3dvcmtzcGFjZScgJiYgYWxsb3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8IGZpbGVzLmxlbmd0aCA9PT0gMH0gb25DbGljaz17KCkgPT4gb25BbGxBY3Rpb24oJ2FjY2VwdCcpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmFjY2VwdEFsbCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge3N0YWdlZENvdW50ID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIHJ1bkFwcGx5KCd1bnN0YWdlJyl9PlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy51bnN0YWdlQWxsJyl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1idG4tZGFuZ2VyJHtjb25maXJtID09PSAnYWxsJyA/ICcgZHNkci1idG4tY29uZmlybScgOiAnJ31gfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5IHx8IGZpbGVzLmxlbmd0aCA9PT0gMH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkFsbEFjdGlvbigncmV2ZXJ0Jyl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7Y29uZmlybSA9PT0gJ2FsbCcgPyB0KCdyZXZpZXcuY29uZmlybVJldmVydEFsbCcpIDogdCgncmV2aWV3LnJldmVydEFsbCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21taXQtaW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17Y29tbWl0TWVzc2FnZX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dCgncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJyl9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0Q29tbWl0TWVzc2FnZShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB2b2lkIG9uQ29tbWl0KClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5IHx8ICFjb21taXRNZXNzYWdlLnRyaW0oKSB8fCBzdGFnZWRDb3VudCA9PT0gMH0gb25DbGljaz17KCkgPT4gdm9pZCBvbkNvbW1pdCgpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNvbW1pdCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgYXJpYS1sYWJlbD17dCgncmV2aWV3LmNsb3NlJyl9IG9uQ2xpY2s9e2Nsb3NlfT5cbiAgICAgICAgICAgIDxJY29uWCAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7c2VuZE9wZW4gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbmRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VuZC10aXRsZVwiPnt0KCdyZXZpZXcuc2VuZFRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLWhpbnRcIj57dCgncmV2aWV3LnNlbmRIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzTmFtZT1cImRzZHItc2VuZC1pbnB1dFwiIHJlYWRPbmx5IHZhbHVlPXtzZW5kVGV4dH0gc3BlbGxDaGVjaz17ZmFsc2V9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHNldFNlbmRPcGVuKGZhbHNlKX0+XG4gICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG5cIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHZvaWQgbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KHNlbmRUZXh0KS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSksXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ3Jldmlldy5jb3B5RmFpbGVkJykgfSksXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29weScpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8ICFzZW5kVGV4dC50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc2VuZFRvQWdlbnQoKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5zZW5kVG9BZ2VudCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiByZXZpZXc/Lm9rICYmIHJldmlld2FibGVGaWxlcyA+IDAgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctc3RyaXBcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnZHNkci1yZXZpZXctYmFkJyA6ICdkc2RyLXJldmlldy1vayd9PlxuICAgICAgICAgICAgICAgIHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyB0KCdyZXZpZXcudmVyZGljdEluY29ycmVjdCcpIDogdCgncmV2aWV3LnZlcmRpY3RDb3JyZWN0Jyl9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1yZXZpZXctdG9nZ2xlJHtmaW5kaW5nc09wZW4gPyAnIGRzZHItcmV2aWV3LXRvZ2dsZS1vbicgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmluZGluZ3NPcGVuKCh2KSA9PiAhdil9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5maW5kaW5ncycsIHsgbjogcmV2aWV3LmZpbmRpbmdzLmxlbmd0aCB9KX1cbiAgICAgICAgICAgICAgICAgIHtyZXZpZXcudHJ1bmNhdGVkID8gJyAodHJ1bmNhdGVkKScgOiAnJ31cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcubm9GaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAge3Jldmlldy5tb2RlbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LW1vZGVsXCI+e3Jldmlldy5tb2RlbC5wcm92aWRlcn0ve3Jldmlldy5tb2RlbC5tb2RlbH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb3BlblNlbmRQYW5lbFdpdGgoY29tcG9zZUZpbmRpbmdzTWVzc2FnZSgpKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRGaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2ZpbmRpbmdzT3BlbiAmJiByZXZpZXcuZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmdzXCI+XG4gICAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5tYXAoKGZpbmRpbmcsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAga2V5PXtgJHtmaW5kaW5nLmZpbGV9OiR7ZmluZGluZy5saW5lU3RhcnR9LSR7ZmluZGluZy5saW5lRW5kfToke2l9YH1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1pdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ganVtcFRvKGZpbmRpbmcuZmlsZSwgZmluZGluZy5saW5lU3RhcnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmcucHJpb3JpdHl9YH0+e2ZpbmRpbmcucHJpb3JpdHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcudGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctbG9jXCI+e2ZpbmRpbmcuZmlsZX06e2ZpbmRpbmcubGluZVN0YXJ0fXtmaW5kaW5nLmxpbmVFbmQgIT09IGZpbmRpbmcubGluZVN0YXJ0ID8gYC0ke2ZpbmRpbmcubGluZUVuZH1gIDogJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZy5kZXRhaWwgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctZGV0YWlsXCI+e2ZpbmRpbmcuZGV0YWlsfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNvbmZpZGVuY2UnLCB7IGNvbmZpZGVuY2U6IGZpbmRpbmcuY29uZmlkZW5jZS50b0ZpeGVkKDIpIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcuc3VnZ2VzdGlvbiA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LnN1Z2dlc3Rpb24nKX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nLnN1Z2dlc3Rpb24gPyA8Y29kZSBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctc3VnZ2VzdGlvblwiPntmaW5kaW5nLnN1Z2dlc3Rpb259PC9jb2RlPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnc2Vzc2lvbicgPyAoXG4gICAgICAgICAgcm91bmRzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfTwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYm9keVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi5zZXNzaW9uJyl9PlxuICAgICAgICAgICAgICAgIHtyb3VuZHMubWFwKChyb3VuZCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JvdW5kLnJvdW5kfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5yb3VuZCcsIHsgcm91bmQ6IHJvdW5kLnJvdW5kIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIHtyb3VuZC5sYWJlbCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yb3VuZC1sYWJlbFwiIHRpdGxlPXtyb3VuZC5sYWJlbH0+e3JvdW5kLmxhYmVsfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Nlc3Npb25UcmVlcy5nZXQocm91bmQucm91bmQpID8/IFtdfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9eyh7IGl0ZW06IGNoYW5nZSwgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtyb3VuZC5yb3VuZH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZEtleSA9IHNlbGVjdGVkQ2hhbmdlID8gYCR7c2VsZWN0ZWRSb3VuZH06JHtzZWxlY3RlZENoYW5nZS5wYXRofWAgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17a2V5ID09PSBzZWxlY3RlZEtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2tleSA9PT0gc2VsZWN0ZWRLZXkgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmQucm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZFBhdGgoY2hhbmdlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoYW5nZS5oYXNEaWZmID8gJ2RzZHItY2hpcC1tJyA6ICdkc2RyLWNoaXAtdSd9YH0+e2NoYW5nZS5oYXNEaWZmID8gJ00nIDogJ1x1MDBCNyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2NoYW5nZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCIgdGl0bGU9e2NoYW5nZS50b29sfT57Y2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZlwiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZSA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENoYW5nZS5wYXRofT57c2VsZWN0ZWRDaGFuZ2UucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCI+e3NlbGVjdGVkQ2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UuaGFzRGlmZiA/IChcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID09PSAnc3BsaXQnICYmIGNoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2NoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKX0gYmVmb3JlTGFiZWw9e3QoJ3ZpZXcuYmVmb3JlJyl9IGFmdGVyTGFiZWw9e3QoJ3ZpZXcuYWZ0ZXInKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hhbmdlUm93cyhzZWxlY3RlZENoYW5nZSkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdyZXZpZXcubm9EaWZmRGF0YScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgICkgOiBlcnJvciAmJiAhc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgICA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi53b3Jrc3BhY2UnKX0+XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2FsbCcgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIHtzdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIHt1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXt1bnN0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICd1bnN0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgdW5zdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdzdGFnZWQnID8gKFxuICAgICAgICAgICAgICAgIHN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvblN0YWdlZCcpfSAoe3N0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIHNjb3BlRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Njb3BlLmJyYW5jaCcpfSB7YmFzZUJyYW5jaCA/IGBcdTIxOTQgJHtiYXNlQnJhbmNofWAgOiAnJ30gKHtzY29wZUZpbGVzLmxlbmd0aH0pXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Njb3BlLmJyYW5jaFJlYWRvbmx5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2xhc3QtdHVybicgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgnc2NvcGUubGFzdC10dXJuJyl9ICh7c2NvcGVGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Njb3BlVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubGFzdFR1cm5FbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHsoc2NvcGUgPT09ICdhbGwnIHx8IHNjb3BlID09PSAnY29tbWl0JykgJiYgaGlzdG9yeS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuaGlzdG9yeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRpbWVsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIHtoaXN0b3J5Lm1hcCgoY29tbWl0KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGwtaXRlbSR7c2VsZWN0ZWRDb21taXQ/Lmhhc2ggPT09IGNvbW1pdC5oYXNoID8gJyBkc2RyLXRsLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRsLXJhaWxcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci10bC1kb3Qke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1kb3QtbG9jYWwnIDogJyBkc2RyLXRsLWRvdC1yZW1vdGUnfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2h9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0Q29tbWl0KGNvbW1pdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWJhZGdlJHtjb21taXQuYWhlYWQgPyAnIGRzZHItdGwtYmFkZ2UtbG9jYWwnIDogJyBkc2RyLXRsLWJhZGdlLXJlbW90ZSd9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWl0LmFoZWFkID8gdCgnaGlzdG9yeS5sb2NhbCcpIDogdCgnaGlzdG9yeS5yZW1vdGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtc2hvcnRcIj57Y29tbWl0LnNob3J0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zdWJqZWN0XCIgdGl0bGU9e2NvbW1pdC5zdWJqZWN0fT57Y29tbWl0LnN1YmplY3R9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LW1ldGFcIj57Y29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoY29tbWl0LmRhdGUsIHQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayAmJiBjb21taXREaWZmLmZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5jb21taXRGaWxlcycpfSAoe2NvbW1pdERpZmYuZmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgbm9kZXM9e2NvbW1pdEZpbGVzVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogZmlsZSwgbmFtZSB9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtzZWxlY3RlZENvbW1pdEZpbGUgPT09IGZpbGUucGF0aCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNoaXAgZHNkci1jaGlwLW1cIj57ZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25CcmFuY2gnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1icmFuY2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtcmVmXCIgdGl0bGU9e3N0YXR1cy51cHN0cmVhbSA/PyB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFycm93XCI+XHUyMTkyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMudXBzdHJlYW0gPz8gdCgncmV2aWV3Lm5vVXBzdHJlYW0nKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5haGVhZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1haGVhZFwiPnt0KCdyZXZpZXcuYWhlYWQnLCB7IG46IHN0YXR1cy5haGVhZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmJlaGluZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1iZWhpbmRcIj57dCgncmV2aWV3LmJlaGluZCcsIHsgbjogc3RhdHVzLmJlaGluZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID09PSAwICYmIHN0YXR1cy5iZWhpbmQgPT09IDAgJiYgc3RhdHVzLnVwc3RyZWFtID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtc3luY1wiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biR7Y29uZmlybSA9PT0gJ3B1c2gnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgKHN0YXR1cz8uYWhlYWQgPz8gMCkgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25QdXNofVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdwdXNoJyA/IHQoJ3Jldmlldy5jb25maXJtUHVzaCcpIDogYCR7dCgncmV2aWV3LnB1c2gnKX0keyhzdGF0dXM/LmFoZWFkID8/IDApID4gMCA/IGAgKCR7c3RhdHVzPy5haGVhZCA/PyAwfSlgIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtwcj8ucHIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci50aXRsZScsIHsgbnVtYmVyOiBwci5wci5udW1iZXIgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IGAgXHUwMEI3ICR7dCgncHIuY29tbWVudHMnLCB7IG46IHByLmNvbW1lbnRzLmxlbmd0aCB9KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXByXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdwci5ub1ByJyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXByLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUHJDb21tZW50Q2xpY2soY29tbWVudC5wYXRoLCBjb21tZW50LmxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudC5wYXRoID8gYCR7YmFzZU5hbWUoY29tbWVudC5wYXRoKX0ke2NvbW1lbnQubGluZSA/IGA6JHtjb21tZW50LmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCd9IFx1MDBCNyB7Y29tbWVudC5hdXRob3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcHItdGV4dFwiPntjb21tZW50LmJvZHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VQck1lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci5zZW5kQ29tbWVudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdCA/IChcbiAgICAgICAgICAgICAgICBjb21taXREaWZmTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKSA6IGNvbW1pdERpZmY/Lm9rID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGFzaFwiPntzZWxlY3RlZENvbW1pdC5zaG9ydH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdG9vbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoc2VsZWN0ZWRDb21taXQuZGF0ZSwgdCl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogY29tbWl0RGlmZi5hZGRlZCwgZGVsZXRlZDogY29tbWl0RGlmZi5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7Y29tbWl0QWN0aXZlRmlsZSA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17Y29tbWl0QWN0aXZlRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jaGlwIGRzZHItY2hpcC1tXCI+e2NvbW1pdEZpbGVTdGF0dXMoY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/ICcnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtcGF0aFwiPntjb21taXRBY3RpdmVGaWxlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmIGdpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2dpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Z2l0RGlmZlJvd3MoY29tbWl0QWN0aXZlVGV4dCkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57Y29tbWl0RGlmZj8uZXJyb3IgPz8gdCgncmV2aWV3Lm5vRGlmZkRhdGEnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBzZWxlY3RlZEZpbGUgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRGaWxlLnBhdGh9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLm9yaWdQYXRoID8gYCBcdTIxOTAgJHtzZWxlY3RlZEZpbGUub3JpZ1BhdGh9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBzZWxlY3RlZEZpbGUuYWRkZWQsIGRlbGV0ZWQ6IHNlbGVjdGVkRmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCl9IHRpdGxlPXt0KCdlZGl0b3Iub3BlbkZpbGUnKX0+XG4gICAgICAgICAgICAgICAgICAgICAgXHUyMTk3IHt0KCdlZGl0b3Iub3BlbkZpbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnVuc3RhZ2VkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdhY2NlcHQnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5hY2NlcHQnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3Vuc3RhZ2UnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy51bnN0YWdlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1idG4tZGFuZ2VyJHtjb25maXJtID09PSAnZmlsZScgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdyZXZlcnQnLCBzZWxlY3RlZEZpbGUucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdmaWxlJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0JykgOiB0KCdyZXZpZXcucmV2ZXJ0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7dmlldyA9PT0gJ3NwbGl0JyAmJiAhc2VsZWN0ZWRGaWxlLmJpbmFyeSAmJiBnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZikubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5iZWZvcmUnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5hZnRlcicpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZikubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgPyA8SHVua1Rvb2xiYXIgaHVuaz17c2VsZWN0ZWRGaWxlLmh1bmtzW2JpXX0gYnVzeT17YnVzeX0gb25BY3Rpb249e29uSHVua0FjdGlvbn0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93RmluZGluZ3MgPSAocmV2aWV3Py5maW5kaW5ncyA/PyBbXSkuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmLmZpbGUgPT09IHNlbGVjdGVkRmlsZS5wYXRoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA+PSBmLmxpbmVTdGFydCAmJiByb3cucmlnaHROdW0gPD0gZi5saW5lRW5kIDogcm93LmxlZnROdW0gIT09IG51bGwgJiYgcm93LmxlZnROdW0gPj0gZi5saW5lU3RhcnQgJiYgcm93LmxlZnROdW0gPD0gZi5saW5lRW5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdDbHMgPSByb3dGaW5kaW5ncy5sZW5ndGggPiAwID8gYCBkc2RyLWNlbGwtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGp1bXBlZCA9IGp1bXBMaW5lICE9IG51bGwgJiYgKHJvdy5yaWdodE51bSA9PT0ganVtcExpbmUgfHwgKHJvdy5yaWdodE51bSA9PT0gbnVsbCAmJiByb3cubGVmdE51bSA9PT0ganVtcExpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tbWVudCBhbmNob3JzIHN0YXkgY29uc2lzdGVudCB3aXRoIHRoZSB1bmlmaWVkIHZpZXc6IGN0eCByb3dzIGV4cG9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYm90aCBsaW5lIG51bWJlcnMsIGNoYW5nZSByb3dzIGV4cG9zZSB0aGUgc2lkZSB0aGV5IGJlbG9uZyB0by5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5sZWZ0TnVtLCBuZXdMaW5lOiByb3cua2luZCA9PT0gJ2N0eCcgJiYgcm93LmxlZnROdW0gIT09IG51bGwgPyByb3cubGVmdE51bSA6IG51bGwgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cucmlnaHROdW0gIT09IG51bGwgPyByb3cucmlnaHROdW0gOiBudWxsLCBuZXdMaW5lOiByb3cucmlnaHROdW0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEtleSA9IGAke2xlZnRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7bGVmdEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEtleSA9IGAke3JpZ2h0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke3JpZ2h0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgbGVmdEFuY2hvci5vbGRMaW5lLCBsZWZ0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgcmlnaHRBbmNob3Iub2xkTGluZSwgcmlnaHRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGVuQnRuID0gKGxpbmU6IG51bWJlcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxlLnBhdGggPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1vcGVubGluZVwiIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gYXJpYS1sYWJlbD17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRGaWxlLnBhdGgsIGxpbmUpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWVudEJ0biA9IChhbmNob3I6IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9LCBjb3VudDogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50TGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50PXtjb3VudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuPXtjb21tZW50UG9wb3ZlciA9PT0gYCR7YW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2FuY2hvci5uZXdMaW5lID8/ICduJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT3Blbj17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmU6IGFuY2hvci5vbGRMaW5lLCBuZXdMaW5lOiBhbmNob3IubmV3TGluZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50UG9wb3ZlcihudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldENvbW1lbnRQb3BvdmVyKChwcmV2KSA9PiAocHJldiA9PT0gYCR7YW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2FuY2hvci5uZXdMaW5lID8/ICduJ31gID8gbnVsbCA6IGAke2FuY2hvci5vbGRMaW5lID8/ICdvJ306JHthbmNob3IubmV3TGluZSA/PyAnbid9YCkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5sZWZ0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LmxlZnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5sZWZ0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dGaW5kaW5ncy5sZW5ndGggPiAwICYmIHJvdy5yaWdodE51bSA9PT0gbnVsbCA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gfT57cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKGxlZnRBbmNob3IsIGxlZnRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5yaWdodE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cucmlnaHROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9Pntyb3dGaW5kaW5nc1swXS5wcmlvcml0eX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xlZnRDb21tZW50cy5sZW5ndGggPiAwICYmIGNvbW1lbnRQb3BvdmVyID09PSBsZWZ0S2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1wb3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2NvbW1lbnQuaWR9IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXRleHRcIj57Y29tbWVudC50ZXh0fTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2NvbW1lbnQucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tZGFuZ2VyXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgZGVsZXRlQ29tbWVudChjb21tZW50LmlkKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLmxlbmd0aCA+IDAgJiYgY29tbWVudFBvcG92ZXIgPT09IHJpZ2h0S2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1wb3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjb21tZW50LmlkfSBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC10ZXh0XCI+e2NvbW1lbnQudGV4dH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjb21tZW50LnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoY29tbWVudC5pZCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuZGVsZXRlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgKGxlZnRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gIHx8IHJpZ2h0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPFVuaWZpZWREaWZmXG4gICAgICAgICAgICAgICAgICAgICAgZGlmZj17c2VsZWN0ZWRGaWxlLmRpZmZ9XG4gICAgICAgICAgICAgICAgICAgICAgaHVua3M9e3NlbGVjdGVkRmlsZS5odW5rc31cbiAgICAgICAgICAgICAgICAgICAgICBidXN5PXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgIG9uSHVua0FjdGlvbj17b25IdW5rQWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudHM9e2NvbW1lbnRzfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRFZGl0b3I9e2NvbW1lbnRFZGl0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFRleHQ9e2NvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tbWVudFRleHQ9e3NldENvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uT3BlbkNvbW1lbnQ9e29wZW5Db21tZW50fVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZUNvbW1lbnQ9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbENvbW1lbnQ9e2NhbmNlbENvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFBvcG92ZXI9e2NvbW1lbnRQb3BvdmVyfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlUG9wb3Zlcj17KGtleSkgPT4gc2V0Q29tbWVudFBvcG92ZXIoKHByZXYpID0+IChwcmV2ID09PSBrZXkgPyBudWxsIDoga2V5KSl9XG4gICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDb21tZW50PXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9XG4gICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk9eyFhbGxvd0FjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgcGF0aD17c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgcmV2aWV3RmluZGluZ3M9e3Jldmlldz8uZmluZGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuTGluZT17KHAsIGxpbmUpID0+IHZvaWQgb3BlbkZpbGUocCwgbGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAganVtcExpbmU9e2p1bXBMaW5lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntzY29wZSA9PT0gJ2NvbW1pdCcgPyB0KCdyZXZpZXcuc2VsZWN0Q29tbWl0JykgOiB0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yID8/IHQoJ3Jldmlldy5sb2FkRXJyb3InKX1cbiAgICAgICAgICAgIHshc3RhdHVzPy5pc1JlcG8gPyA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mb290XCI+XG4gICAgICAgICAgeyhsb2FkaW5nIHx8IGJ1c3kpICYmIHRhYiA9PT0gJ3dvcmtzcGFjZScgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwaW5uZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2J1c3kgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLW5vdGljZVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIHtub3RpY2UgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLW5vdGljZSBkc2RyLW5vdGljZS0ke25vdGljZS5raW5kfWB9Pntub3RpY2UudGV4dH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQ29uZmlnIGNhcmQgZm9yIHRoZSBQbHVnaW5zIGNvbmZpZ3VyYXRpb24gdGFiIChTZXR0aW5ncyBcdTIxOTIgUGx1Z2lucyBcdTIxOTIgXHU1M0VGXHU5MTREXHU3RjZFKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb25maWdDYXJkKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJkIGRzZHItY2ZnLWNhcmQtb3BlbicgOiAnZHNkci1jZmctY2FyZCd9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZFwiIGFyaWEtZXhwYW5kZWQ9e29wZW59IG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWhlYWQtdGV4dFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLW5hbWVcIj57dCgnc2V0dGluZ3MudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctZGVzY1wiPnt0KCdjb25maWcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93bk91dGxpbmUxNCBjbGFzc05hbWU9e29wZW4gPyAnZHNkci1jZmctY2FyZXQgZHNkci1jZmctY2FyZXQtb3BlbicgOiAnZHNkci1jZmctY2FyZXQnfSAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1ib2R5XCI+XG4gICAgICAgICAgPERpZmZSZXZpZXdQcmVmcyB0PXt0fSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbGk+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG4gIC8vIENvZGV4LXN0eWxlIHBlbmRpbmctY29tbWVudHMgc3RyaXAgYXQgdGhlIFRPUCBvZiB0aGUgY29tcG9zZXIsIHN0eWxlZCBhc1xuICAvLyB0aGUgY2FyZCdzIG93biBzdXJmYWNlIHNvIGl0IHJlYWRzIGFzIG9uZSBmdXNlZCBkaWFsb2cuXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uaW5wdXQuZG9jaycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29tbWVudHMtZG9jaycsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrLFxuICAgICksXG4gIClcbiAgLy8gVGhlIHBsdWdpbidzIG93biBzZXR0aW5ncyB0YWIgaW5zaWRlIFx1OEJCRVx1N0Y2RSBcdTIxOTIgXHU2M0QyXHU0RUY2IChub3QgdGhlIEdlbmVyYWwgc2VjdGlvbikuXG4gIC8vIFRoZSBwbHVnaW4ncyB3aG9sZSBjb25maWd1cmF0aW9uIGxpdmVzIGluIG9uZSBjYXJkIGluc2lkZVxuICAvLyBcdThCQkVcdTdGNkUgXHUyMTkyIFx1NjNEMlx1NEVGNiBcdTIxOTIgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFIChzZXR0aW5ncy5wbHVnaW4uaXRlbSk6IGZvbnQvc2l6ZS5cbiAgY3R4LnNsb3RzLmluamVjdCgnc2V0dGluZ3MucGx1Z2luLml0ZW0nLCAoKSA9PlxuICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3NldHRpbmdzLnBsdWdpbi5pdGVtJyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1jb25maWcnLFxuICAgICAgICBvcmRlcjogMzAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdDb25maWdDYXJkLFxuICAgICksXG4gIClcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmIHtcbiAgICBkaWZmKG9sZFN0ciwgbmV3U3RyLCBcbiAgICAvLyBUeXBlIGJlbG93IGlzIG5vdCBhY2N1cmF0ZS9jb21wbGV0ZSAtIHNlZSBhYm92ZSBmb3IgZnVsbCBwb3NzaWJpbGl0aWVzIC0gYnV0IGl0IGNvbXBpbGVzXG4gICAgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGxldCBjYWxsYmFjaztcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoJ2NhbGxiYWNrJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWxsb3cgc3ViY2xhc3NlcyB0byBtYXNzYWdlIHRoZSBpbnB1dCBwcmlvciB0byBydW5uaW5nXG4gICAgICAgIGNvbnN0IG9sZFN0cmluZyA9IHRoaXMuY2FzdElucHV0KG9sZFN0ciwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG5ld1N0cmluZyA9IHRoaXMuY2FzdElucHV0KG5ld1N0ciwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG9sZFRva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShvbGRTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgY29uc3QgbmV3VG9rZW5zID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG5ld1N0cmluZywgb3B0aW9ucykpO1xuICAgICAgICByZXR1cm4gdGhpcy5kaWZmV2l0aE9wdGlvbnNPYmoob2xkVG9rZW5zLCBuZXdUb2tlbnMsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGRvbmUgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5wb3N0UHJvY2Vzcyh2YWx1ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgY2FsbGJhY2sodmFsdWUpOyB9LCAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBuZXdUb2tlbnMubGVuZ3RoLCBvbGRMZW4gPSBvbGRUb2tlbnMubGVuZ3RoO1xuICAgICAgICBsZXQgZWRpdExlbmd0aCA9IDE7XG4gICAgICAgIGxldCBtYXhFZGl0TGVuZ3RoID0gbmV3TGVuICsgb2xkTGVuO1xuICAgICAgICBpZiAob3B0aW9ucy5tYXhFZGl0TGVuZ3RoICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1heEVkaXRMZW5ndGggPSBNYXRoLm1pbihtYXhFZGl0TGVuZ3RoLCBvcHRpb25zLm1heEVkaXRMZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heEV4ZWN1dGlvblRpbWUgPSAoX2EgPSBvcHRpb25zLnRpbWVvdXQpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IEluZmluaXR5O1xuICAgICAgICBjb25zdCBhYm9ydEFmdGVyVGltZXN0YW1wID0gRGF0ZS5ub3coKSArIG1heEV4ZWN1dGlvblRpbWU7XG4gICAgICAgIGNvbnN0IGJlc3RQYXRoID0gW3sgb2xkUG9zOiAtMSwgbGFzdENvbXBvbmVudDogdW5kZWZpbmVkIH1dO1xuICAgICAgICAvLyBTZWVkIGVkaXRMZW5ndGggPSAwLCBpLmUuIHRoZSBjb250ZW50IHN0YXJ0cyB3aXRoIHRoZSBzYW1lIHZhbHVlc1xuICAgICAgICBsZXQgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJlc3RQYXRoWzBdLCBuZXdUb2tlbnMsIG9sZFRva2VucywgMCwgb3B0aW9ucyk7XG4gICAgICAgIGlmIChiZXN0UGF0aFswXS5vbGRQb3MgKyAxID49IG9sZExlbiAmJiBuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgLy8gSWRlbnRpdHkgcGVyIHRoZSBlcXVhbGl0eSBhbmQgdG9rZW5pemVyXG4gICAgICAgICAgICByZXR1cm4gZG9uZSh0aGlzLmJ1aWxkVmFsdWVzKGJlc3RQYXRoWzBdLmxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25jZSB3ZSBoaXQgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGVkaXQgZ3JhcGggb24gc29tZSBkaWFnb25hbCBrLCB3ZSBjYW5cbiAgICAgICAgLy8gZGVmaW5pdGVseSByZWFjaCB0aGUgZW5kIG9mIHRoZSBlZGl0IGdyYXBoIGluIG5vIG1vcmUgdGhhbiBrIGVkaXRzLCBzb1xuICAgICAgICAvLyB0aGVyZSdzIG5vIHBvaW50IGluIGNvbnNpZGVyaW5nIGFueSBtb3ZlcyB0byBkaWFnb25hbCBrKzEgYW55IG1vcmUgKGZyb21cbiAgICAgICAgLy8gd2hpY2ggd2UncmUgZ3VhcmFudGVlZCB0byBuZWVkIGF0IGxlYXN0IGsrMSBtb3JlIGVkaXRzKS5cbiAgICAgICAgLy8gU2ltaWxhcmx5LCBvbmNlIHdlJ3ZlIHJlYWNoZWQgdGhlIGJvdHRvbSBvZiB0aGUgZWRpdCBncmFwaCwgdGhlcmUncyBub1xuICAgICAgICAvLyBwb2ludCBjb25zaWRlcmluZyBtb3ZlcyB0byBsb3dlciBkaWFnb25hbHMuXG4gICAgICAgIC8vIFdlIHJlY29yZCB0aGlzIGZhY3QgYnkgc2V0dGluZyBtaW5EaWFnb25hbFRvQ29uc2lkZXIgYW5kXG4gICAgICAgIC8vIG1heERpYWdvbmFsVG9Db25zaWRlciB0byBzb21lIGZpbml0ZSB2YWx1ZSBvbmNlIHdlJ3ZlIGhpdCB0aGUgZWRnZSBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaC5cbiAgICAgICAgLy8gVGhpcyBvcHRpbWl6YXRpb24gaXMgbm90IGZhaXRoZnVsIHRvIHRoZSBvcmlnaW5hbCBhbGdvcml0aG0gcHJlc2VudGVkIGluXG4gICAgICAgIC8vIE15ZXJzJ3MgcGFwZXIsIHdoaWNoIGluc3RlYWQgcG9pbnRsZXNzbHkgZXh0ZW5kcyBELXBhdGhzIG9mZiB0aGUgZW5kIG9mXG4gICAgICAgIC8vIHRoZSBlZGl0IGdyYXBoIC0gc2VlIHBhZ2UgNyBvZiBNeWVycydzIHBhcGVyIHdoaWNoIG5vdGVzIHRoaXMgcG9pbnRcbiAgICAgICAgLy8gZXhwbGljaXRseSBhbmQgaWxsdXN0cmF0ZXMgaXQgd2l0aCBhIGRpYWdyYW0uIFRoaXMgaGFzIG1ham9yIHBlcmZvcm1hbmNlXG4gICAgICAgIC8vIGltcGxpY2F0aW9ucyBmb3Igc29tZSBjb21tb24gc2NlbmFyaW9zLiBGb3IgaW5zdGFuY2UsIHRvIGNvbXB1dGUgYSBkaWZmXG4gICAgICAgIC8vIHdoZXJlIHRoZSBuZXcgdGV4dCBzaW1wbHkgYXBwZW5kcyBkIGNoYXJhY3RlcnMgb24gdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgLy8gb3JpZ2luYWwgdGV4dCBvZiBsZW5ndGggbiwgdGhlIHRydWUgTXllcnMgYWxnb3JpdGhtIHdpbGwgdGFrZSBPKG4rZF4yKVxuICAgICAgICAvLyB0aW1lIHdoaWxlIHRoaXMgb3B0aW1pemF0aW9uIG5lZWRzIG9ubHkgTyhuK2QpIHRpbWUuXG4gICAgICAgIGxldCBtaW5EaWFnb25hbFRvQ29uc2lkZXIgPSAtSW5maW5pdHksIG1heERpYWdvbmFsVG9Db25zaWRlciA9IEluZmluaXR5O1xuICAgICAgICAvLyBNYWluIHdvcmtlciBtZXRob2QuIGNoZWNrcyBhbGwgcGVybXV0YXRpb25zIG9mIGEgZ2l2ZW4gZWRpdCBsZW5ndGggZm9yIGFjY2VwdGFuY2UuXG4gICAgICAgIGNvbnN0IGV4ZWNFZGl0TGVuZ3RoID0gKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZGlhZ29uYWxQYXRoID0gTWF0aC5tYXgobWluRGlhZ29uYWxUb0NvbnNpZGVyLCAtZWRpdExlbmd0aCk7IGRpYWdvbmFsUGF0aCA8PSBNYXRoLm1pbihtYXhEaWFnb25hbFRvQ29uc2lkZXIsIGVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggKz0gMikge1xuICAgICAgICAgICAgICAgIGxldCBiYXNlUGF0aDtcbiAgICAgICAgICAgICAgICBjb25zdCByZW1vdmVQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0sIGFkZFBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBvbmUgZWxzZSBpcyBnb2luZyB0byBhdHRlbXB0IHRvIHVzZSB0aGlzIHZhbHVlLCBjbGVhciBpdFxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gcGVyZiBvcHRpbWlzYXRpb24uIFRoaXMgdHlwZS12aW9sYXRpbmcgdmFsdWUgd2lsbCBuZXZlciBiZSByZWFkLlxuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGNhbkFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChhZGRQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoYXQgbmV3UG9zIHdpbGwgYmUgYWZ0ZXIgd2UgZG8gYW4gaW5zZXJ0aW9uOlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRQYXRoTmV3UG9zID0gYWRkUGF0aC5vbGRQb3MgLSBkaWFnb25hbFBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGNhbkFkZCA9IGFkZFBhdGggJiYgMCA8PSBhZGRQYXRoTmV3UG9zICYmIGFkZFBhdGhOZXdQb3MgPCBuZXdMZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGNhblJlbW92ZSA9IHJlbW92ZVBhdGggJiYgcmVtb3ZlUGF0aC5vbGRQb3MgKyAxIDwgb2xkTGVuO1xuICAgICAgICAgICAgICAgIGlmICghY2FuQWRkICYmICFjYW5SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBwYXRoIGlzIGEgdGVybWluYWwgdGhlbiBwcnVuZVxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gcGVyZiBvcHRpbWlzYXRpb24uIFRoaXMgdHlwZS12aW9sYXRpbmcgdmFsdWUgd2lsbCBuZXZlciBiZSByZWFkLlxuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBkaWFnb25hbCB0aGF0IHdlIHdhbnQgdG8gYnJhbmNoIGZyb20uIFdlIHNlbGVjdCB0aGUgcHJpb3JcbiAgICAgICAgICAgICAgICAvLyBwYXRoIHdob3NlIHBvc2l0aW9uIGluIHRoZSBvbGQgc3RyaW5nIGlzIHRoZSBmYXJ0aGVzdCBmcm9tIHRoZSBvcmlnaW5cbiAgICAgICAgICAgICAgICAvLyBhbmQgZG9lcyBub3QgcGFzcyB0aGUgYm91bmRzIG9mIHRoZSBkaWZmIGdyYXBoXG4gICAgICAgICAgICAgICAgaWYgKCFjYW5SZW1vdmUgfHwgKGNhbkFkZCAmJiByZW1vdmVQYXRoLm9sZFBvcyA8IGFkZFBhdGgub2xkUG9zKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKGFkZFBhdGgsIHRydWUsIGZhbHNlLCAwLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gdGhpcy5hZGRUb1BhdGgocmVtb3ZlUGF0aCwgZmFsc2UsIHRydWUsIDEsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbiAmJiBuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGhpdCB0aGUgZW5kIG9mIGJvdGggc3RyaW5ncywgdGhlbiB3ZSBhcmUgZG9uZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZSh0aGlzLmJ1aWxkVmFsdWVzKGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSkgfHwgdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSBiYXNlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm9sZFBvcyArIDEgPj0gb2xkTGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBNYXRoLm1pbihtYXhEaWFnb25hbFRvQ29uc2lkZXIsIGRpYWdvbmFsUGF0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5tYXgobWluRGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVkaXRMZW5ndGgrKztcbiAgICAgICAgfTtcbiAgICAgICAgLy8gUGVyZm9ybXMgdGhlIGxlbmd0aCBvZiBlZGl0IGl0ZXJhdGlvbi4gSXMgYSBiaXQgZnVnbHkgYXMgdGhpcyBoYXMgdG8gc3VwcG9ydCB0aGVcbiAgICAgICAgLy8gc3luYyBhbmQgYXN5bmMgbW9kZSB3aGljaCBpcyBuZXZlciBmdW4uIExvb3BzIG92ZXIgZXhlY0VkaXRMZW5ndGggdW50aWwgYSB2YWx1ZVxuICAgICAgICAvLyBpcyBwcm9kdWNlZCwgb3IgdW50aWwgdGhlIGVkaXQgbGVuZ3RoIGV4Y2VlZHMgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoIChpZiBnaXZlbiksXG4gICAgICAgIC8vIGluIHdoaWNoIGNhc2UgaXQgd2lsbCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiBleGVjKCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWRpdExlbmd0aCA+IG1heEVkaXRMZW5ndGggfHwgRGF0ZS5ub3coKSA+IGFib3J0QWZ0ZXJUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXhlY0VkaXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhlYygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9KCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGVkaXRMZW5ndGggPD0gbWF4RWRpdExlbmd0aCAmJiBEYXRlLm5vdygpIDw9IGFib3J0QWZ0ZXJUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXQgPSBleGVjRWRpdExlbmd0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWRkVG9QYXRoKHBhdGgsIGFkZGVkLCByZW1vdmVkLCBvbGRQb3NJbmMsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBhdGgubGFzdENvbXBvbmVudDtcbiAgICAgICAgaWYgKGxhc3QgJiYgIW9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4gJiYgbGFzdC5hZGRlZCA9PT0gYWRkZWQgJiYgbGFzdC5yZW1vdmVkID09PSByZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogbGFzdC5jb3VudCArIDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCwgcHJldmlvdXNDb21wb25lbnQ6IGxhc3QucHJldmlvdXNDb21wb25lbnQgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb2xkUG9zOiBwYXRoLm9sZFBvcyArIG9sZFBvc0luYyxcbiAgICAgICAgICAgICAgICBsYXN0Q29tcG9uZW50OiB7IGNvdW50OiAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIGRpYWdvbmFsUGF0aCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBuZXdUb2tlbnMubGVuZ3RoLCBvbGRMZW4gPSBvbGRUb2tlbnMubGVuZ3RoO1xuICAgICAgICBsZXQgb2xkUG9zID0gYmFzZVBhdGgub2xkUG9zLCBuZXdQb3MgPSBvbGRQb3MgLSBkaWFnb25hbFBhdGgsIGNvbW1vbkNvdW50ID0gMDtcbiAgICAgICAgd2hpbGUgKG5ld1BvcyArIDEgPCBuZXdMZW4gJiYgb2xkUG9zICsgMSA8IG9sZExlbiAmJiB0aGlzLmVxdWFscyhvbGRUb2tlbnNbb2xkUG9zICsgMV0sIG5ld1Rva2Vuc1tuZXdQb3MgKyAxXSwgb3B0aW9ucykpIHtcbiAgICAgICAgICAgIG5ld1BvcysrO1xuICAgICAgICAgICAgb2xkUG9zKys7XG4gICAgICAgICAgICBjb21tb25Db3VudCsrO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogMSwgcHJldmlvdXNDb21wb25lbnQ6IGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIGFkZGVkOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbW9uQ291bnQgJiYgIW9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4pIHtcbiAgICAgICAgICAgIGJhc2VQYXRoLmxhc3RDb21wb25lbnQgPSB7IGNvdW50OiBjb21tb25Db3VudCwgcHJldmlvdXNDb21wb25lbnQ6IGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIGFkZGVkOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBiYXNlUGF0aC5vbGRQb3MgPSBvbGRQb3M7XG4gICAgICAgIHJldHVybiBuZXdQb3M7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucy5jb21wYXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb21wYXJhdG9yKGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodFxuICAgICAgICAgICAgICAgIHx8ICghIW9wdGlvbnMuaWdub3JlQ2FzZSAmJiBsZWZ0LnRvTG93ZXJDYXNlKCkgPT09IHJpZ2h0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlbW92ZUVtcHR5KGFycmF5KSB7XG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV0pIHtcbiAgICAgICAgICAgICAgICByZXQucHVzaChhcnJheVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIGNhc3RJbnB1dCh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICB0b2tlbml6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG4gICAgfVxuICAgIGpvaW4oY2hhcnMpIHtcbiAgICAgICAgLy8gQXNzdW1lcyBWYWx1ZVQgaXMgc3RyaW5nLCB3aGljaCBpcyB0aGUgY2FzZSBmb3IgbW9zdCBzdWJjbGFzc2VzLlxuICAgICAgICAvLyBXaGVuIGl0J3MgZmFsc2UsIGUuZy4gaW4gZGlmZkFycmF5cywgdGhpcyBtZXRob2QgbmVlZHMgdG8gYmUgb3ZlcnJpZGRlbiAoZS5nLiB3aXRoIGEgbm8tb3ApXG4gICAgICAgIC8vIFllcywgdGhlIGNhc3RzIGFyZSB2ZXJib3NlIGFuZCB1Z2x5LCBiZWNhdXNlIHRoaXMgcGF0dGVybiAtIG9mIGhhdmluZyB0aGUgYmFzZSBjbGFzcyBTT1JUIE9GXG4gICAgICAgIC8vIGFzc3VtZSB0b2tlbnMgYW5kIHZhbHVlcyBhcmUgc3RyaW5ncywgYnV0IG5vdCBjb21wbGV0ZWx5IC0gaXMgd2VpcmQgYW5kIGphbmt5LlxuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfVxuICAgIHBvc3RQcm9jZXNzKGNoYW5nZU9iamVjdHMsIFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBjaGFuZ2VPYmplY3RzO1xuICAgIH1cbiAgICBnZXQgdXNlTG9uZ2VzdFRva2VuKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGJ1aWxkVmFsdWVzKGxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSB7XG4gICAgICAgIC8vIEZpcnN0IHdlIGNvbnZlcnQgb3VyIGxpbmtlZCBsaXN0IG9mIGNvbXBvbmVudHMgaW4gcmV2ZXJzZSBvcmRlciB0byBhblxuICAgICAgICAvLyBhcnJheSBpbiB0aGUgcmlnaHQgb3JkZXI6XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgbGV0IG5leHRDb21wb25lbnQ7XG4gICAgICAgIHdoaWxlIChsYXN0Q29tcG9uZW50KSB7XG4gICAgICAgICAgICBjb21wb25lbnRzLnB1c2gobGFzdENvbXBvbmVudCk7XG4gICAgICAgICAgICBuZXh0Q29tcG9uZW50ID0gbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGRlbGV0ZSBsYXN0Q29tcG9uZW50LnByZXZpb3VzQ29tcG9uZW50O1xuICAgICAgICAgICAgbGFzdENvbXBvbmVudCA9IG5leHRDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29tcG9uZW50cy5yZXZlcnNlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudExlbiA9IGNvbXBvbmVudHMubGVuZ3RoO1xuICAgICAgICBsZXQgY29tcG9uZW50UG9zID0gMCwgbmV3UG9zID0gMCwgb2xkUG9zID0gMDtcbiAgICAgICAgZm9yICg7IGNvbXBvbmVudFBvcyA8IGNvbXBvbmVudExlbjsgY29tcG9uZW50UG9zKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LnJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCAmJiB0aGlzLnVzZUxvbmdlc3RUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gb2xkVG9rZW5zW29sZFBvcyArIGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4odmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG5ld1Rva2Vucy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgICAgIC8vIENvbW1vbiBjYXNlXG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4ob2xkVG9rZW5zLnNsaWNlKG9sZFBvcywgb2xkUG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICB9XG59XG4iLCAiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlLmpzJztcbmltcG9ydCB7IGdlbmVyYXRlT3B0aW9ucyB9IGZyb20gJy4uL3V0aWwvcGFyYW1zLmpzJztcbmNsYXNzIExpbmVEaWZmIGV4dGVuZHMgRGlmZiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMudG9rZW5pemUgPSB0b2tlbml6ZTtcbiAgICB9XG4gICAgZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIElmIHdlJ3JlIGlnbm9yaW5nIHdoaXRlc3BhY2UsIHdlIG5lZWQgdG8gbm9ybWFsaXNlIGxpbmVzIGJ5IHN0cmlwcGluZ1xuICAgICAgICAvLyB3aGl0ZXNwYWNlIGJlZm9yZSBjaGVja2luZyBlcXVhbGl0eS4gKFRoaXMgaGFzIGFuIGFubm95aW5nIGludGVyYWN0aW9uXG4gICAgICAgIC8vIHdpdGggbmV3bGluZUlzVG9rZW4gdGhhdCByZXF1aXJlcyBzcGVjaWFsIGhhbmRsaW5nOiBpZiBuZXdsaW5lcyBnZXQgdGhlaXJcbiAgICAgICAgLy8gb3duIHRva2VuLCB0aGVuIHdlIERPTidUIHdhbnQgdG8gdHJpbSB0aGUgKm5ld2xpbmUqIHRva2VucyBkb3duIHRvIGVtcHR5XG4gICAgICAgIC8vIHN0cmluZ3MsIHNpbmNlIHRoaXMgd291bGQgY2F1c2UgdXMgdG8gdHJlYXQgd2hpdGVzcGFjZS1vbmx5IGxpbmUgY29udGVudFxuICAgICAgICAvLyBhcyBlcXVhbCB0byBhIHNlcGFyYXRvciBiZXR3ZWVuIGxpbmVzLCB3aGljaCB3b3VsZCBiZSB3ZWlyZCBhbmRcbiAgICAgICAgLy8gaW5jb25zaXN0ZW50IHdpdGggdGhlIGRvY3VtZW50ZWQgYmVoYXZpb3Igb2YgdGhlIG9wdGlvbnMuKVxuICAgICAgICBpZiAob3B0aW9ucy5pZ25vcmVXaGl0ZXNwYWNlKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubmV3bGluZUlzVG9rZW4gfHwgIWxlZnQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFyaWdodC5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmlnbm9yZU5ld2xpbmVBdEVvZiAmJiAhb3B0aW9ucy5uZXdsaW5lSXNUb2tlbikge1xuICAgICAgICAgICAgaWYgKGxlZnQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJpZ2h0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5lcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBsaW5lRGlmZiA9IG5ldyBMaW5lRGlmZigpO1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmVHJpbW1lZExpbmVzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IGdlbmVyYXRlT3B0aW9ucyhvcHRpb25zLCB7IGlnbm9yZVdoaXRlc3BhY2U6IHRydWUgfSk7XG4gICAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuLy8gRXhwb3J0ZWQgc3RhbmRhbG9uZSBzbyBpdCBjYW4gYmUgdXNlZCBmcm9tIGpzb25EaWZmIHRvby5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbml6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnN0cmlwVHJhaWxpbmdDcikge1xuICAgICAgICAvLyByZW1vdmUgb25lIFxcciBiZWZvcmUgXFxuIHRvIG1hdGNoIEdOVSBkaWZmJ3MgLS1zdHJpcC10cmFpbGluZy1jciBiZWhhdmlvclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcclxcbi9nLCAnXFxuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldExpbmVzID0gW10sIGxpbmVzQW5kTmV3bGluZXMgPSB2YWx1ZS5zcGxpdCgvKFxcbnxcXHJcXG4pLyk7XG4gICAgLy8gSWdub3JlIHRoZSBmaW5hbCBlbXB0eSB0b2tlbiB0aGF0IG9jY3VycyBpZiB0aGUgc3RyaW5nIGVuZHMgd2l0aCBhIG5ldyBsaW5lXG4gICAgaWYgKCFsaW5lc0FuZE5ld2xpbmVzW2xpbmVzQW5kTmV3bGluZXMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgbGluZXNBbmROZXdsaW5lcy5wb3AoKTtcbiAgICB9XG4gICAgLy8gTWVyZ2UgdGhlIGNvbnRlbnQgYW5kIGxpbmUgc2VwYXJhdG9ycyBpbnRvIHNpbmdsZSB0b2tlbnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzQW5kTmV3bGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzQW5kTmV3bGluZXNbaV07XG4gICAgICAgIGlmIChpICUgMiAmJiAhb3B0aW9ucy5uZXdsaW5lSXNUb2tlbikge1xuICAgICAgICAgICAgcmV0TGluZXNbcmV0TGluZXMubGVuZ3RoIC0gMV0gKz0gbGluZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldExpbmVzLnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldExpbmVzO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUJBLG1CQUFxRjs7O0FDbkJyRixJQUFxQixPQUFyQixNQUEwQjtBQUFBLEVBQ3RCLEtBQUssUUFBUSxRQUViLFVBQVUsQ0FBQyxHQUFHO0FBQ1YsUUFBSTtBQUNKLFFBQUksT0FBTyxZQUFZLFlBQVk7QUFDL0IsaUJBQVc7QUFDWCxnQkFBVSxDQUFDO0FBQUEsSUFDZixXQUNTLGNBQWMsU0FBUztBQUM1QixpQkFBVyxRQUFRO0FBQUEsSUFDdkI7QUFFQSxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxXQUFPLEtBQUssbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFFBQVE7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFVBQVU7QUFDeEQsUUFBSTtBQUNKLFVBQU0sT0FBTyxDQUFDLFVBQVU7QUFDcEIsY0FBUSxLQUFLLFlBQVksT0FBTyxPQUFPO0FBQ3ZDLFVBQUksVUFBVTtBQUNWLG1CQUFXLFdBQVk7QUFBRSxtQkFBUyxLQUFLO0FBQUEsUUFBRyxHQUFHLENBQUM7QUFDOUMsZUFBTztBQUFBLE1BQ1gsT0FDSztBQUNELGVBQU87QUFBQSxNQUNYO0FB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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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

		})(module, module.exports, require);
		return module.exports;
	}
});
