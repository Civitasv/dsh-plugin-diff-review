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
  comments: [],
  diffs: {},
  review: null
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
  "review.dockHint": "\u968F\u4E0B\u4E00\u6761\u6D88\u606F\u81EA\u52A8\u9644\u5E26\uFF08\u542B diff \u4E0E AI \u8BC4\u5BA1\u7ED3\u8BBA\uFF09",
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
  "review.dockHint": "Auto-carried with your next message (diff + AI verdict included)",
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
function hunksForLines(diff, lines) {
  const targets = new Set(lines.filter((l) => l !== null));
  if (targets.size === 0) return "";
  const blocks = parseGitBlocks(diff);
  const parts = [];
  for (const block of blocks) {
    if (block.head?.kind !== "hunk") continue;
    const starts = hunkStarts(block.head.text);
    let oldLine = starts.oldStart;
    let newLine = starts.newStart;
    let oMin = Infinity;
    let oMax = -Infinity;
    let nMin = Infinity;
    let nMax = -Infinity;
    for (const row of block.rows) {
      if (row.kind === "ctx") {
        if (oldLine < oMin) oMin = oldLine;
        if (oldLine > oMax) oMax = oldLine;
        if (newLine < nMin) nMin = newLine;
        if (newLine > nMax) nMax = newLine;
        oldLine++;
        newLine++;
      } else if (row.kind === "add") {
        if (newLine < nMin) nMin = newLine;
        if (newLine > nMax) nMax = newLine;
        newLine++;
      } else if (row.kind === "del") {
        if (oldLine < oMin) oMin = oldLine;
        if (oldLine > oMax) oMax = oldLine;
        oldLine++;
      }
    }
    const hit = [...targets].some(
      (l) => oMin <= l && l <= oMax || nMin <= l && l <= nMax
    );
    if (hit) parts.push([block.head.text, ...block.rows.map((r) => r.text)].join("\n"));
  }
  return parts.join("\n");
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
  const composeCarriedMessage = () => {
    const lines = ["\u8BF7\u5904\u7406\u4EE5\u4E0B\u9488\u5BF9\u5F53\u524D\u5DE5\u4F5C\u533A\u7684\u884C\u5185\u8BC4\u5BA1\u8BC4\u8BBA\uFF08Address the inline comments\uFF0C\u4FDD\u6301\u6539\u52A8\u8303\u56F4\u6700\u5C0F\uFF09\uFF1A", ""];
    const byPath = /* @__PURE__ */ new Map();
    for (const c of comments) {
      const list = byPath.get(c.path);
      if (list) list.push(c);
      else byPath.set(c.path, [c]);
    }
    for (const [path, list] of byPath) {
      lines.push(`## ${path}`);
      for (const c of list) {
        const anchor = c.lineNew !== null ? `:${c.lineNew}` : ` (old line ${c.lineOld})`;
        lines.push(`- ${path}${anchor}: ${c.text}`);
      }
      const hunks = hunksForLines(pending.diffs[path] ?? "", list.map((c) => c.lineNew ?? c.lineOld));
      if (hunks) {
        lines.push("```diff");
        lines.push(hunks);
        lines.push("```");
      }
      lines.push("");
    }
    if (pending.review?.ok && (pending.review.findings.length > 0 || pending.review.verdict)) {
      lines.push("## AI \u8BC4\u5BA1\u7ED3\u8BBA");
      lines.push(pending.review.verdict === "incorrect" ? "\u8865\u4E01\u5B58\u5728\u95EE\u9898\uFF08Patch is incorrect\uFF09" : "\u8865\u4E01\u6B63\u786E\uFF08Patch is correct\uFF09");
      for (const f of pending.review.findings) {
        lines.push(`- [${f.priority}] ${f.file}:${f.lineStart}${f.lineEnd !== f.lineStart ? `-${f.lineEnd}` : ""} ${f.title} \u2014 ${f.detail}`);
        if (f.suggestion) lines.push(`  \`\`\`
${f.suggestion}
  \`\`\``);
      }
    }
    return lines.join("\n").slice(0, 16e3);
  };
  const phase = input?.phase;
  (0, import_react.useEffect)(() => {
    if (comments.length === 0 || carrying.current || carriedIds.current === ids) return;
    if (phase !== "submitting" && phase !== "adjudicating") return;
    carrying.current = true;
    const targetIds = ids;
    void injectToSession(sessions, sessionId, composeCarriedMessage()).then((outcome) => {
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
      const diffs = {};
      for (const c of comments) {
        const file = status?.files.find((f) => f.path === c.path);
        if (file?.diff) diffs[c.path] = file.diff;
      }
      d.diffs = diffs;
      d.review = review;
    });
  }, [comments, activeCwd, status, review]);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERpZmYtcmV2aWV3IHBsdWdpbiBcdTIwMTQgY2xpZW50IGhhbGYuXG4gKlxuICogQ29kZXgtc3R5bGUgcmV2aWV3IHdpdGggdHdvIHNvdXJjZXM6XG4gKlxuICogMS4gKipcdTRGMUFcdThCRERcdTY2RjRcdTY1MzkgKFNlc3Npb24gY2hhbmdlcykqKiBcdTIwMTQgd2hhdCB0aGUgYWdlbnQgY2hhbmdlZCBpbiBlYWNoIHJvdW5kIG9mXG4gKiAgICB0aGlzIGNvbnZlcnNhdGlvbiwgZGVyaXZlZCBmcm9tIHRoZSBjb252ZXJzYXRpb24gc25hcHNob3QgKHRvb2wgcmVzdWx0c1xuICogICAgY2FycnkgdGhlIGhvc3QtY29tcHV0ZWQgYHJlc3VsdFZpZXdgIGRpZmYgaHVua3MpLiBXb3JrcyB3aXRoIG9yIHdpdGhvdXRcbiAqICAgIGdpdCwgYW5kIHNob3dzIGEgY2hhbmdlIGV2ZW4gd2hlbiBubyBkaWZmIHRleHQgaXMgYXZhaWxhYmxlIChwYXRoLW9ubHkpLlxuICogMi4gKipcdTVERTVcdTRGNUNcdTUzM0EgKFdvcmtzcGFjZSkqKiBcdTIwMTQgdGhlIGdpdCB3b3JraW5nIHRyZWUncyB1bmNvbW1pdHRlZCBjaGFuZ2VzXG4gKiAgICAoc3RhZ2VkICsgdW5zdGFnZWQgKyB1bnRyYWNrZWQpIHdpdGggcGVyLWZpbGUgLyBhbGwtZmlsZSBhY2NlcHQgKHN0YWdlKVxuICogICAgYW5kIHJldmVydCAoZGlzY2FyZCkgdGhyb3VnaCB0aGUgcGx1Z2luJ3Mgc2VydmVyIHJvdXRlcy5cbiAqXG4gKiBUaGUgcmV2aWV3IHN1cmZhY2UgbW91bnRzIGluIGBzaGVsbC5vdmVybGF5YCAocm9vdCBzY29wZSkuIFN0YXRlIGhhbmQtb2ZmXG4gKiBiZXR3ZWVuIHRoZSBzZXNzaW9uLXNjb3BlZCBoZWFkZXIgdHJpZ2dlciBhbmQgdGhlIHJvb3Qtc2NvcGVkIG92ZXJsYXkgZ29lc1xuICogdGhyb3VnaCBhIG1vZHVsZS1sZXZlbCBzbmFwc2hvdCBzdG9yZTsgdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCBmb3IgdGhlXG4gKiBjdXJyZW50IHNlc3Npb24gaXMgcmVhZCByZWFjdGl2ZWx5IHRocm91Z2ggYGN0eC5zZXNzaW9uc2AgKGluamVjdGVkIHZpYSB0aGVcbiAqIG92ZXJsYXkgcmVnaXN0cmF0aW9uJ3MgaW5qZWN0IGZhY2UpLlxuICovXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUsIHVzZVN5bmNFeHRlcm5hbFN0b3JlLCBGcmFnbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDU1NQcm9wZXJ0aWVzLCBSZWFjdEVsZW1lbnQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgZGlmZkxpbmVzIH0gZnJvbSAnZGlmZidcbmltcG9ydCB0eXBlIHsgQ2xpZW50Q29udGV4dCwgSVNlc3Npb25zLCBTZXNzaW9uTGlzdFN0YXRlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgeyBjcmVhdGVTbmFwc2hvdFN0b3JlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFByb3BzTG9jYWxlLCBQcm9wc1J1bnRpbWUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1zbG90cydcbmltcG9ydCB0eXBlIHsgQ29udmVyc2F0aW9uTm9kZSwgVG9vbFJlc3VsdE5vZGUsIFVzZXJNZXNzYWdlTm9kZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXJ1bnRpbWUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBTZXNzaW9uSWQsIFRvb2xSZXN1bHRWaWV3IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hcGktcmVtb3Rlcy9jbGllbnQnXG5pbXBvcnQgeyBJY29uQ2hldnJvbkRvd25PdXRsaW5lMTQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEdpdFJlc3BvbnNlLCBIaXN0b3J5UmVzcG9uc2UsIFByUmVzcG9uc2UsIFJlcG9zUmVzcG9uc2UsIFJldmlld0NvbW1lbnQsIFJldmlld0ZpbmRpbmcsIFJldmlld1Jlc3BvbnNlLCBTdGF0dXNSZXNwb25zZSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcy50cydcblxuZXhwb3J0IGNvbnN0IG5hbWUgPSAnZGlmZi1yZXZpZXcnXG5cbi8qKiBSZXF1aXJlZCBjbGllbnQgc2VydmljZXMgKGZpYmVyIGluamVjdCkuICovXG5leHBvcnQgY29uc3QgaW5qZWN0ID0gWydzZXNzaW9ucycsICdzbG90cycsICdsb2NhbGUnXVxuXG5jb25zdCBMT0NBTEVfTlMgPSAnZGlmZi1yZXZpZXcnXG5jb25zdCBTVEFUVVNfVVJMID0gJ2RpZmYtcmV2aWV3L3N0YXR1cydcbmNvbnN0IEFQUExZX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseSdcbmNvbnN0IEFQUExZX0hVTktfVVJMID0gJ2RpZmYtcmV2aWV3L2FwcGx5LWh1bmsnXG5jb25zdCBDT01NSVRfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdCdcbmNvbnN0IFBVU0hfVVJMID0gJ2RpZmYtcmV2aWV3L3B1c2gnXG5jb25zdCBISVNUT1JZX1VSTCA9ICdkaWZmLXJldmlldy9oaXN0b3J5J1xuY29uc3QgQ09NTUlUX0RJRkZfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdC1kaWZmJ1xuY29uc3QgQ09NTUVOVFNfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1lbnRzJ1xuY29uc3QgQlJBTkNIRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2JyYW5jaGVzJ1xuY29uc3QgUkVWSUVXX1VSTCA9ICdkaWZmLXJldmlldy9yZXZpZXcnXG5jb25zdCBQUl9VUkwgPSAnZGlmZi1yZXZpZXcvcHInXG5jb25zdCBSRVBPU19VUkwgPSAnZGlmZi1yZXZpZXcvcmVwb3MnXG5jb25zdCBPUEVOX0VESVRPUl9VUkwgPSAnb3Blbi1lZGl0b3Ivb3BlbidcbmNvbnN0IFNUWUxFX1RBRyA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3L3Jldmlldy5jc3MnXG5cbi8qKiBPcGVuIHN0YXRlIHNoYXJlZCBiZXR3ZWVuIHRoZSBoZWFkZXIgdHJpZ2dlciAoc2Vzc2lvbiBzY29wZSkgYW5kIHRoZSBvdmVybGF5IChyb290IHNjb3BlKS4gKi9cbmNvbnN0IG92ZXJsYXlTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8eyBvcGVuOiBib29sZWFuOyBjd2Q6IHN0cmluZyB8IG51bGw7IGtleTogbnVtYmVyOyBmb2N1cz86IHsgcGF0aDogc3RyaW5nOyBsaW5lPzogbnVtYmVyIH0gfCBudWxsIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxuICBmb2N1czogbnVsbCxcbn0pXG5cbi8qKlxuICogUGVuZGluZyBpbmxpbmUgY29tbWVudHMgc3VyZmFjZWQgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSkuIFRoZVxuICogcmV2aWV3IG92ZXJsYXkgc3luY3MgaXRzIHdvcmtzcGFjZSBjb21tZW50cyAocGx1cyB0aGUgZGlmZiBjb250ZXh0IGFuZCB0aGVcbiAqIGxhc3QgQUkgcmV2aWV3IHJlc3VsdCkgaGVyZTsgdGhlIGNvbXBvc2VyIGRvY2sgcmVhZHMgdGhlbSBhbmQgY2FycmllcyBhXG4gKiBmdWxsIHJldmlldyBwYWNrYWdlIHdpdGggdGhlIHVzZXIncyBuZXh0IG1lc3NhZ2UuXG4gKi9cbmludGVyZmFjZSBQZW5kaW5nQ29tbWVudHMge1xuICBjd2Q6IHN0cmluZyB8IG51bGxcbiAgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXVxuICAvKiogVW5pZmllZCBkaWZmIHRleHQgcGVyIGNvbW1lbnRlZCBwYXRoIChjb250ZXh0IGZvciB0aGUgY2FycmllZCBtZXNzYWdlKS4gKi9cbiAgZGlmZnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgLyoqIExhc3QgQUkgcmV2aWV3IHJlc3VsdCAodmVyZGljdCArIGZpbmRpbmdzKSwgYXBwZW5kZWQgdG8gdGhlIGNhcnJpZWQgbWVzc2FnZS4gKi9cbiAgcmV2aWV3OiBSZXZpZXdSZXNwb25zZSB8IG51bGxcbn1cbmNvbnN0IHBlbmRpbmdDb21tZW50c1N0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxQZW5kaW5nQ29tbWVudHM+KHtcbiAgY3dkOiBudWxsLFxuICBjb21tZW50czogW10sXG4gIGRpZmZzOiB7fSxcbiAgcmV2aWV3OiBudWxsLFxufSlcblxuLyoqIEluamVjdCB0ZXh0IGludG8gYSBzZXNzaW9uIGFzIGEgdXNlciBtZXNzYWdlOyBmYWxscyBiYWNrIHRvIHRoZSBjbGlwYm9hcmQuICovXG5hc3luYyBmdW5jdGlvbiBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnM6IElTZXNzaW9ucyB8IHVuZGVmaW5lZCwgc2Vzc2lvbklkOiBTZXNzaW9uSWQgfCBudWxsLCB0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPCdzZW50JyB8ICdjb3BpZWQnIHwgJ2ZhaWxlZCc+IHtcbiAgY29uc3QgYmluZGluZyA9IHNlc3Npb25JZCA/IHNlc3Npb25zPy5iaW5kaW5nKHNlc3Npb25JZCkgOiB1bmRlZmluZWRcbiAgY29uc3Qgc2Vzc2lvbiA9IGJpbmRpbmc/LnNlc3Npb25cbiAgaWYgKHNlc3Npb24pIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2Vzc2lvbi5wcm9tcHQoW3sgdHlwZTogJ3RleHQnLCB0ZXh0IH1dLCAncXVldWUnKVxuICAgICAgaWYgKHJlc3VsdC5vaykgcmV0dXJuICdzZW50J1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBjb3B5IGZhbGxiYWNrXG4gICAgfVxuICB9XG4gIHRyeSB7XG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgICByZXR1cm4gJ2NvcGllZCdcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICdmYWlsZWQnXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSZXZpZXcgcHJlZmVyZW5jZXMgKGZvbnQgLyBzaXplIC8gcGFuZWwgZ2VvbWV0cnkpLCBzaGFyZWQgYnkgdGhlIG92ZXJsYXlcbi8vIGFuZCB0aGUgU2V0dGluZ3MgXHUyMTkyIEdlbmVyYWwgcm93LiBQZXJzaXN0ZWQgdG8gbG9jYWxTdG9yYWdlIGJ5IHRoZSBzdG9yZS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogUGFuZWwgZ2VvbWV0cnkgYm91bmRzLiAqL1xuZXhwb3J0IGNvbnN0IE1JTl9QQU5FTF9XID0gNjQwXG5leHBvcnQgY29uc3QgTUlOX1BBTkVMX0ggPSA0MDBcblxuaW50ZXJmYWNlIFByZWZzIHtcbiAgLyoqIEZvbnQgb3B0aW9uIGlkIChzZWUgRk9OVF9PUFRJT05TKS4gKi9cbiAgZm9udDogc3RyaW5nXG4gIC8qKiBEaWZmIHRleHQgc2l6ZSBpbiBweC4gKi9cbiAgc2l6ZTogbnVtYmVyXG4gIC8qKiBQYW5lbCB3aWR0aCBpbiBweC4gKi9cbiAgd2lkdGg6IG51bWJlclxuICAvKiogUGFuZWwgaGVpZ2h0IGluIHB4LiAqL1xuICBoZWlnaHQ6IG51bWJlclxufVxuXG5jb25zdCBGT05UX09QVElPTlM6IHsgaWQ6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgY3NzOiBzdHJpbmcgfVtdID0gW1xuICB7IGlkOiAnbW9ubycsIGxhYmVsOiAnZm9udC5tb25vJywgY3NzOiAndmFyKC0tZHN3LWZvbnQtbW9ubyknIH0sXG4gIHsgaWQ6ICdzeXN0ZW0nLCBsYWJlbDogJ2ZvbnQuc3lzdGVtJywgY3NzOiAnc3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBzYW5zLXNlcmlmJyB9LFxuICB7IGlkOiAnY29uc29sYXMnLCBsYWJlbDogJ0NvbnNvbGFzJywgY3NzOiAnQ29uc29sYXMsIFwiQ291cmllciBOZXdcIiwgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnamV0YnJhaW5zJywgbGFiZWw6ICdKZXRCcmFpbnMgTW9ubycsIGNzczogJ1wiSmV0QnJhaW5zIE1vbm9cIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ2ZpcmEnLCBsYWJlbDogJ0ZpcmEgQ29kZScsIGNzczogJ1wiRmlyYSBDb2RlXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdzb3VyY2UnLCBsYWJlbDogJ1NvdXJjZSBDb2RlIFBybycsIGNzczogJ1wiU291cmNlIENvZGUgUHJvXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG5dXG5cbmNvbnN0IFNJWkVfT1BUSU9OUyA9IFsxMSwgMTIsIDEzLCAxNCwgMTYsIDE4XVxuXG4vKiogUmV2aWV3IHNjb3BlcyBvZiB0aGUgd29ya3NwYWNlIHRhYiAoYWxpZ25lZCB3aXRoIHRoZSBDb2RleCByZXZpZXcgcGFuZSkuICovXG50eXBlIFdvcmtzcGFjZVNjb3BlID0gJ2FsbCcgfCAndW5zdGFnZWQnIHwgJ3N0YWdlZCcgfCAnY29tbWl0JyB8ICdicmFuY2gnIHwgJ2xhc3QtdHVybidcblxuY29uc3QgU0NPUEVfT1BUSU9OUzogeyBpZDogV29ya3NwYWNlU2NvcGU7IGxhYmVsOiBrZXlvZiB0eXBlb2YgemggfVtdID0gW1xuICB7IGlkOiAnYWxsJywgbGFiZWw6ICdzY29wZS5hbGwnIH0sXG4gIHsgaWQ6ICd1bnN0YWdlZCcsIGxhYmVsOiAnc2NvcGUudW5zdGFnZWQnIH0sXG4gIHsgaWQ6ICdzdGFnZWQnLCBsYWJlbDogJ3Njb3BlLnN0YWdlZCcgfSxcbiAgeyBpZDogJ2NvbW1pdCcsIGxhYmVsOiAnc2NvcGUuY29tbWl0JyB9LFxuICB7IGlkOiAnYnJhbmNoJywgbGFiZWw6ICdzY29wZS5icmFuY2gnIH0sXG4gIHsgaWQ6ICdsYXN0LXR1cm4nLCBsYWJlbDogJ3Njb3BlLmxhc3QtdHVybicgfSxcbl1cblxuLyoqIEJyb3dzZXItc2lkZSBhYnNvbHV0ZSBwYXRoIGNoZWNrIChubyBub2RlOnBhdGggaW4gdGhlIGNsaWVudCBidW5kbGUpLiAqL1xuZnVuY3Rpb24gaXNBYnNQYXRoKHA6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gcC5zdGFydHNXaXRoKCcvJykgfHwgL15bQS1aYS16XTpbXFxcXC9dLy50ZXN0KHApXG59XG5cbmZ1bmN0aW9uIGJhc2VOYW1lKHA6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBwLnNwbGl0KC9bXFxcXC9dLykucG9wKCkgPz8gcFxufVxuXG5jb25zdCBwcmVmc1N0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxQcmVmcz4oXG4gIHsgZm9udDogJ21vbm8nLCBzaXplOiAxMiwgd2lkdGg6IDExMjAsIGhlaWdodDogNzIwIH0sXG4gIHsgcGVyc2lzdDogeyBuYW1lOiAnZHNkci1wcmVmcycgfSB9LFxuKVxuXG4vKiogQ1NTIGZvbnQtZmFtaWx5IGZvciBhIHN0b3JlZCBmb250IG9wdGlvbiBpZC4gKi9cbmZ1bmN0aW9uIGZvbnRDc3MoaWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBGT05UX09QVElPTlMuZmluZCgoZikgPT4gZi5pZCA9PT0gaWQpPy5jc3MgPz8gRk9OVF9PUFRJT05TWzBdLmNzc1xufVxuXG4vKiogUGFuZWwgQ1NTIHZhcmlhYmxlcyBjYXJyeWluZyB0aGUgZm9udC9zaXplIHByZWZlcmVuY2UuICovXG5mdW5jdGlvbiBkaWZmU3R5bGVWYXJzKHByZWZzOiBQcmVmcyk6IENTU1Byb3BlcnRpZXMge1xuICByZXR1cm4ge1xuICAgICctLWRzZHItZGlmZi1mb250JzogZm9udENzcyhwcmVmcy5mb250KSxcbiAgICAnLS1kc2RyLWRpZmYtc2l6ZSc6IGAke3ByZWZzLnNpemV9cHhgLFxuICB9IGFzIENTU1Byb3BlcnRpZXNcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTZXNzaW9uLWNoYW5nZXMgZXh0cmFjdGlvbiAoY2xpZW50LXNpZGUsIHdvcmtzIHdpdGhvdXQgZ2l0KS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogT25lIGJlZm9yZS9hZnRlciBzbGljZSBvZiBhIGNoYW5nZSAoYSBodW5rKS4gKi9cbmludGVyZmFjZSBIdW5rIHtcbiAgb2xkVGV4dDogc3RyaW5nIHwgbnVsbFxuICBuZXdUZXh0OiBzdHJpbmdcbn1cblxuLyoqIE9uZSBmaWxlIGNoYW5nZWQgaW5zaWRlIG9uZSByb3VuZC4gKi9cbmludGVyZmFjZSBSb3VuZENoYW5nZSB7XG4gIHBhdGg6IHN0cmluZ1xuICB0b29sOiBzdHJpbmdcbiAgaHVua3M6IEh1bmtbXVxuICAvKiogRmFsc2Ugd2hlbiBvbmx5IHRoZSBwYXRoIGlzIGtub3duIChubyBkaWZmIGRhdGEgcGVyc2lzdGVkKS4gKi9cbiAgaGFzRGlmZjogYm9vbGVhblxufVxuXG4vKiogT25lIHVzZXIgcm91bmQgYW5kIHRoZSBmaWxlcyBpdCBjaGFuZ2VkLiAqL1xuaW50ZXJmYWNlIFNlc3Npb25Sb3VuZCB7XG4gIHJvdW5kOiBudW1iZXJcbiAgbGFiZWw6IHN0cmluZ1xuICBjaGFuZ2VzOiBSb3VuZENoYW5nZVtdXG59XG5cbmludGVyZmFjZSBGaWxlRGlmZkxpa2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgb2xkVGV4dDogc3RyaW5nIHwgbnVsbFxuICBuZXdUZXh0OiBzdHJpbmdcbn1cblxuLyoqIFZhbGlkYXRlIGEgcmF3IEZpbGVEaWZmLXNoYXBlZCB2YWx1ZSAodGhlIHRvb2xzJyBge3BhdGgsIG9sZFRleHQsIG5ld1RleHR9YCBjb250cmFjdCkuICovXG5mdW5jdGlvbiBhc0ZpbGVEaWZmKHJhdzogdW5rbm93bik6IEZpbGVEaWZmTGlrZSB8IG51bGwge1xuICBpZiAoIXJhdyB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgY29uc3QgcmVjID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gIGlmICh0eXBlb2YgcmVjLnBhdGggIT09ICdzdHJpbmcnIHx8ICFyZWMucGF0aCkgcmV0dXJuIG51bGxcbiAgaWYgKHR5cGVvZiByZWMubmV3VGV4dCAhPT0gJ3N0cmluZycpIHJldHVybiBudWxsXG4gIGNvbnN0IG9sZFRleHQgPSByZWMub2xkVGV4dFxuICByZXR1cm4geyBwYXRoOiByZWMucGF0aCwgb2xkVGV4dDogdHlwZW9mIG9sZFRleHQgPT09ICdzdHJpbmcnID8gb2xkVGV4dCA6IG51bGwsIG5ld1RleHQ6IHJlYy5uZXdUZXh0IH1cbn1cblxuLyoqIERpZmYgaHVua3MgY2FycmllZCBieSBhIGRpZmYgY2FyZCAoY2FsbCB2aWV3IG9yIHJlc3VsdCB2aWV3KS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbURpZmZDYXJkKHZpZXc6IHsgY2FyZD86IHVua25vd247IGRpZmZzPzogdW5rbm93biB9IHwgbnVsbCB8IHVuZGVmaW5lZCk6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCF2aWV3IHx8IHZpZXcuY2FyZCAhPT0gJ2RpZmYnIHx8ICFBcnJheS5pc0FycmF5KHZpZXcuZGlmZnMpKSByZXR1cm4gW11cbiAgcmV0dXJuIHZpZXcuZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbi8qKiBIdW1hbiBsYWJlbCBmb3IgYSBjYWxsIHdob3NlIGBjYWxsYCBoZWFkIHdhcyB0cnVuY2F0ZWQgb3V0IG9mIHRoZSB3aW5kb3cuICovXG5mdW5jdGlvbiBkaWZmQ2FyZFRpdGxlKHZpZXc6IHVua25vd24pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKCF2aWV3IHx8IHR5cGVvZiB2aWV3ICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgY29uc3QgdGl0bGUgPSAodmlldyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikudGl0bGVcbiAgcmV0dXJuIHR5cGVvZiB0aXRsZSA9PT0gJ3N0cmluZycgJiYgdGl0bGUudHJpbSgpID8gdGl0bGUudHJpbSgpIDogbnVsbFxufVxuXG4vKiogUmF3IGBtZXRhLmRpZmZzYCBmYWxsYmFjayAodGhlIHBlcnNpc3RlZCB0b29sL3Jlc3VsdCBtZXRhKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbU1ldGEobWV0YTogdW5rbm93bik6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCFtZXRhIHx8IHR5cGVvZiBtZXRhICE9PSAnb2JqZWN0JykgcmV0dXJuIFtdXG4gIGNvbnN0IGRpZmZzID0gKG1ldGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmRpZmZzXG4gIGlmICghQXJyYXkuaXNBcnJheShkaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbmNvbnN0IE1VVEFUSU9OX1RPT0xTID0gbmV3IFNldChbJ3N0cl9yZXBsYWNlX2VkaXRvcicsICdub3RlYm9va19lZGl0J10pXG5jb25zdCBNVVRBVElPTl9DT01NQU5EUyA9IG5ldyBTZXQoWyd3cml0ZScsICdlZGl0JywgJ3JlcGxhY2UnLCAnZGVsZXRlJywgJ21vdmUnXSlcblxuLyoqIFBhdGgtb25seSBmYWxsYmFjayBmb3Iga25vd24gZmlsZS1tdXRhdGluZyB0b29scyB3aG9zZSByZXN1bHQgY2FycmllZCBubyBkaWZmLiAqL1xuZnVuY3Rpb24gbXV0YXRpb25QYXRoKHRvb2w6IHN0cmluZywgYXJnc1Jhdzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGxldCBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwgPSBudWxsXG4gIHRyeSB7XG4gICAgYXJncyA9IEpTT04ucGFyc2UoYXJnc1JhdykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBpZiAoIWFyZ3MgfHwgdHlwZW9mIGFyZ3MgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBpZiAodG9vbCA9PT0gJ2ZzJyB8fCB0b29sID09PSAnZmlsZXN5c3RlbScpIHtcbiAgICBjb25zdCBjbWQgPSB0eXBlb2YgYXJncy5jb21tYW5kID09PSAnc3RyaW5nJyA/IGFyZ3MuY29tbWFuZCA6ICcnXG4gICAgaWYgKCFNVVRBVElPTl9DT01NQU5EUy5oYXMoY21kKSkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gdHlwZW9mIGFyZ3MuZmlsZV9wYXRoID09PSAnc3RyaW5nJyAmJiBhcmdzLmZpbGVfcGF0aCA/IGFyZ3MuZmlsZV9wYXRoIDogbnVsbFxuICB9XG4gIGlmIChNVVRBVElPTl9UT09MUy5oYXModG9vbCkgfHwgdG9vbC5zdGFydHNXaXRoKCdlZGl0JykpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbJ2ZpbGVfcGF0aCcsICdwYXRoJywgJ2ZpbGVuYW1lJ10pIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1trZXldID09PSAnc3RyaW5nJyAmJiBhcmdzW2tleV0pIHJldHVybiBhcmdzW2tleV0gYXMgc3RyaW5nXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbi8qKiBFeHRyYWN0IHRoZSBjaGFuZ2VkIGZpbGVzIGZyb20gb25lIHNldHRsZWQgdG9vbCByZXN1bHQgKGRpZmYgaHVua3MsIGVsc2UgcGF0aC1vbmx5KS4gKi9cbmZ1bmN0aW9uIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChjYWxsOiB7IG5hbWU6IHN0cmluZzsgYXJnc1Jhdzogc3RyaW5nIH0gfCBudWxsLCBub2RlOiBUb29sUmVzdWx0Tm9kZSk6IFJvdW5kQ2hhbmdlW10ge1xuICAvLyBMb25nIHNlc3Npb25zIHRydW5jYXRlIHRoZSBjYWxsIGhlYWQgb3V0IG9mIHRoZSB3aW5kb3cgKGNhbGwgPT09IG51bGwpLCBidXRcbiAgLy8gdGhlIGhvc3QtY29tcHV0ZWQgY2FsbC9yZXN1bHQgZGlmZiBjYXJkcyBzdGlsbCBjYXJyeSB0aGUgY2hhbmdlIFx1MjAxNCByZWFkIHRob3NlLlxuICBjb25zdCByZXN1bHREaWZmcyA9IGRpZmZzRnJvbURpZmZDYXJkKG5vZGUucmVzdWx0VmlldylcbiAgY29uc3QgY2FsbERpZmZzID0gcmVzdWx0RGlmZnMubGVuZ3RoID09PSAwID8gZGlmZnNGcm9tRGlmZkNhcmQobm9kZS5jYWxsVmlldykgOiBbXVxuICBjb25zdCBtZXRhRGlmZnMgPSByZXN1bHREaWZmcy5sZW5ndGggPT09IDAgJiYgY2FsbERpZmZzLmxlbmd0aCA9PT0gMCA/IGRpZmZzRnJvbU1ldGEobm9kZS5tZXRhKSA6IFtdXG4gIGNvbnN0IGFsbERpZmZzID0gcmVzdWx0RGlmZnMubGVuZ3RoID4gMCA/IHJlc3VsdERpZmZzIDogY2FsbERpZmZzLmxlbmd0aCA+IDAgPyBjYWxsRGlmZnMgOiBtZXRhRGlmZnNcbiAgY29uc3QgdG9vbCA9IGNhbGw/Lm5hbWUgPz8gZGlmZkNhcmRUaXRsZShub2RlLmNhbGxWaWV3KSA/PyAndG9vbCdcbiAgaWYgKGFsbERpZmZzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUm91bmRDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGQgb2YgYWxsRGlmZnMpIHtcbiAgICAgIGxldCBlbnRyeSA9IGJ5UGF0aC5nZXQoZC5wYXRoKVxuICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICBlbnRyeSA9IHsgcGF0aDogZC5wYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IHRydWUgfVxuICAgICAgICBieVBhdGguc2V0KGQucGF0aCwgZW50cnkpXG4gICAgICB9XG4gICAgICBlbnRyeS5odW5rcy5wdXNoKHsgb2xkVGV4dDogZC5vbGRUZXh0LCBuZXdUZXh0OiBkLm5ld1RleHQgfSlcbiAgICB9XG4gICAgcmV0dXJuIFsuLi5ieVBhdGgudmFsdWVzKCldXG4gIH1cbiAgY29uc3QgcGF0aCA9IGNhbGwgPyBtdXRhdGlvblBhdGgodG9vbCwgY2FsbC5hcmdzUmF3KSA6IG51bGxcbiAgcmV0dXJuIHBhdGggPyBbeyBwYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IGZhbHNlIH1dIDogW11cbn1cblxuLyoqIFBsYWluIHRleHQgb2YgYSB1c2VyIG1lc3NhZ2UgKGNvbnRlbnQgYmxvY2tzIG9mIHR5cGUgJ3RleHQnKS4gKi9cbmZ1bmN0aW9uIHVzZXJUZXh0KG5vZGU6IFVzZXJNZXNzYWdlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2Ygbm9kZS5jb250ZW50KSB7XG4gICAgaWYgKGJsb2NrICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcgJiYgKGJsb2NrIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiAoYmxvY2sgYXMgeyB0ZXh0PzogdW5rbm93biB9KS50ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgcGFydHMucHVzaCgoYmxvY2sgYXMgeyB0ZXh0OiBzdHJpbmcgfSkudGV4dClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG59XG5cbi8qKiBXYWxrIHRoZSBjb252ZXJzYXRpb24gbm9kZXMgYW5kIGdyb3VwIGNoYW5nZWQgZmlsZXMgYnkgdXNlciByb3VuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0U2Vzc2lvblJvdW5kcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogU2Vzc2lvblJvdW5kW10ge1xuICBjb25zdCByb3VuZHM6IFNlc3Npb25Sb3VuZFtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IFNlc3Npb25Sb3VuZCB8IG51bGwgPSBudWxsXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgPT09ICd1c2VyJykge1xuICAgICAgY3VycmVudCA9IHsgcm91bmQ6IHJvdW5kcy5sZW5ndGggKyAxLCBsYWJlbDogdXNlclRleHQobm9kZSkuc2xpY2UoMCwgNjApLCBjaGFuZ2VzOiBbXSB9XG4gICAgICByb3VuZHMucHVzaChjdXJyZW50KVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCAhY3VycmVudCkgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBjaGFuZ2UucGF0aCAmJiBjLnRvb2wgPT09IGNoYW5nZS50b29sKVxuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGlmIChjaGFuZ2UuaGFzRGlmZikge1xuICAgICAgICAgIGV4aXN0aW5nLmh1bmtzLnB1c2goLi4uY2hhbmdlLmh1bmtzKVxuICAgICAgICAgIGV4aXN0aW5nLmhhc0RpZmYgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQuY2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdW5kcy5maWx0ZXIoKHIpID0+IHIuY2hhbmdlcy5sZW5ndGggPiAwKVxufVxuXG4vKiogQ291bnQgb2YgY2hhbmdlZCBmaWxlcyBhY3Jvc3MgYWxsIHJvdW5kcyAoZm9yIHRoZSBoZWFkZXIgYmFkZ2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDBcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcpIGNvbnRpbnVlXG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgY2hhbmdlc0Zyb21Ub29sUmVzdWx0KG5vZGUuY2FsbCwgbm9kZSkpIHtcbiAgICAgIGNvbnN0IGtleSA9IGAke2NoYW5nZS50b29sfToke2NoYW5nZS5wYXRofWBcbiAgICAgIGlmICghc2Vlbi5oYXMoa2V5KSkge1xuICAgICAgICBzZWVuLmFkZChrZXkpXG4gICAgICAgIGNvdW50KytcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvdW50XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGlmZiByZW5kZXJpbmcuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFNwbGl0IG9uZSBgZ2l0IHNob3cgLS1mb3JtYXQ9YCBkaWZmIGludG8gcGVyLWZpbGUgc2VnbWVudHMuICovXG5mdW5jdGlvbiBzcGxpdENvbW1pdERpZmYoZGlmZjogc3RyaW5nKTogeyBwYXRoOiBzdHJpbmc7IHRleHQ6IHN0cmluZyB9W10ge1xuICBjb25zdCBzZWdtZW50czogeyBwYXRoOiBzdHJpbmc7IHRleHQ6IHN0cmluZ1tdIH1bXSA9IFtdXG4gIGxldCBjdXJyZW50OiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nW10gfSB8IG51bGwgPSBudWxsXG4gIGZvciAoY29uc3QgbGluZSBvZiBkaWZmLnNwbGl0KCdcXG4nKSkge1xuICAgIGNvbnN0IG1hdGNoID0gL15kaWZmIC0tZ2l0IGFcXC8oLio/KSBiXFwvLy5leGVjKGxpbmUpXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICBpZiAoY3VycmVudCkgc2VnbWVudHMucHVzaChjdXJyZW50KVxuICAgICAgY3VycmVudCA9IHsgcGF0aDogbWF0Y2hbMV0sIHRleHQ6IFtsaW5lXSB9XG4gICAgfSBlbHNlIGlmIChjdXJyZW50KSB7XG4gICAgICBjdXJyZW50LnRleHQucHVzaChsaW5lKVxuICAgIH1cbiAgfVxuICBpZiAoY3VycmVudCkgc2VnbWVudHMucHVzaChjdXJyZW50KVxuICByZXR1cm4gc2VnbWVudHMubWFwKChzKSA9PiAoeyBwYXRoOiBzLnBhdGgsIHRleHQ6IHMudGV4dC5qb2luKCdcXG4nKSB9KSlcbn1cblxuLyoqIFN0YXR1cyBsZXR0ZXIgZm9yIGEgY29tbWl0J3MgZmlsZSwgZGVyaXZlZCBmcm9tIGl0cyBkaWZmIHNlZ21lbnQgdGV4dC4gKi9cbmZ1bmN0aW9uIGNvbW1pdEZpbGVTdGF0dXMoc2VnbWVudFRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICgvXm5ldyBmaWxlIG1vZGUvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ0EnXG4gIGlmICgvXmRlbGV0ZWQgZmlsZSBtb2RlLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdEJ1xuICBpZiAoL15yZW5hbWUgZnJvbSAvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ1InXG4gIHJldHVybiAnTSdcbn1cblxudHlwZSBEaWZmUm93ID0geyBraW5kOiAnYWRkJyB8ICdkZWwnIHwgJ2N0eCcgfCAnaHVuaycgfCAnZmlsZScgfCAnbm90ZSc7IHRleHQ6IHN0cmluZyB9XG5cbi8qKiBDbGFzc2lmeSByYXcgdW5pZmllZC1kaWZmIHRleHQgKGdpdCBvdXRwdXQpIGludG8gcm93cy4gKi9cbmZ1bmN0aW9uIGdpdERpZmZSb3dzKGRpZmY6IHN0cmluZyk6IERpZmZSb3dbXSB7XG4gIHJldHVybiBkaWZmLnNwbGl0KCdcXG4nKS5tYXAoKGxpbmUpID0+IHtcbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrKysnKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy0tLScpKSByZXR1cm4geyBraW5kOiAnZmlsZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ0BAJykpIHJldHVybiB7IGtpbmQ6ICdodW5rJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKycpKSByZXR1cm4geyBraW5kOiAnYWRkJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnLScpKSByZXR1cm4geyBraW5kOiAnZGVsJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnXFxcXCAnKSkgcmV0dXJuIHsga2luZDogJ25vdGUnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICByZXR1cm4geyBraW5kOiAnY3R4JyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gIH0pXG59XG5cbi8qKiBDb21wdXRlIGFkZC9kZWwvY3R4IHJvd3MgYmV0d2VlbiB0d28gdGV4dHMgKHRoZSB0b29scycgRmlsZURpZmYgc2hhcGUpLiAqL1xuZnVuY3Rpb24gdGV4dERpZmZSb3dzKG9sZFRleHQ6IHN0cmluZyB8IG51bGwsIG5ld1RleHQ6IHN0cmluZyk6IERpZmZSb3dbXSB7XG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMob2xkVGV4dCA/PyAnJywgbmV3VGV4dCkpIHtcbiAgICBjb25zdCBsaW5lcyA9IHBhcnQudmFsdWUuc3BsaXQoJ1xcbicpXG4gICAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgaWYgKHBhcnQuYWRkZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdhZGQnLCB0ZXh0OiBgKyR7bGluZX1gIH0pXG4gICAgICBlbHNlIGlmIChwYXJ0LnJlbW92ZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdkZWwnLCB0ZXh0OiBgLSR7bGluZX1gIH0pXG4gICAgICBlbHNlIHJvd3MucHVzaCh7IGtpbmQ6ICdjdHgnLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiByb3dzXG59XG5cbi8qKiBBbGwgcm93cyBmb3Igb25lIHJvdW5kIGNoYW5nZSAobXVsdGlwbGUgaHVua3MgZ2V0IGBAQGAgc2VwYXJhdG9ycykuICovXG5mdW5jdGlvbiBjaGFuZ2VSb3dzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBEaWZmUm93W10ge1xuICBpZiAoIWNoYW5nZS5oYXNEaWZmIHx8IGNoYW5nZS5odW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBjaGFuZ2UuaHVua3MuZm9yRWFjaCgoaHVuaywgaSkgPT4ge1xuICAgIGlmIChjaGFuZ2UuaHVua3MubGVuZ3RoID4gMSkgcm93cy5wdXNoKHsga2luZDogJ2h1bmsnLCB0ZXh0OiBgQEAgaHVuayAke2kgKyAxfS8ke2NoYW5nZS5odW5rcy5sZW5ndGh9IEBAYCB9KVxuICAgIHJvd3MucHVzaCguLi50ZXh0RGlmZlJvd3MoaHVuay5vbGRUZXh0LCBodW5rLm5ld1RleHQpKVxuICB9KVxuICByZXR1cm4gcm93c1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNwbGl0ICh0d28tY29sdW1uKSBkaWZmIHZpZXcuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBhbGlnbmVkIHJvdyBvZiB0aGUgc2lkZS1ieS1zaWRlIHZpZXcuICovXG5pbnRlcmZhY2UgU3BsaXRSb3cge1xuICBsZWZ0OiBzdHJpbmdcbiAgcmlnaHQ6IHN0cmluZ1xuICAvKiogMS1iYXNlZCBsaW5lIG51bWJlciBpbiB0aGUgb2xkIGZpbGUsIG9yIG51bGwgKHB1cmUgYWRkaXRpb24pLiAqL1xuICBsZWZ0TnVtOiBudW1iZXIgfCBudWxsXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBuZXcgZmlsZSwgb3IgbnVsbCAocHVyZSBkZWxldGlvbikuICovXG4gIHJpZ2h0TnVtOiBudW1iZXIgfCBudWxsXG4gIGtpbmQ6ICdjdHgnIHwgJ2NoYW5nZSdcbn1cblxuLyoqIE9uZSBzaWRlLWJ5LXNpZGUgYmxvY2sgKGEgaHVuayB3aXRoIGl0cyBgQEBgIGhlYWRlcikuICovXG5pbnRlcmZhY2UgU3BsaXRCbG9jayB7XG4gIGhlYWQ6IHN0cmluZyB8IG51bGxcbiAgcm93czogU3BsaXRSb3dbXVxufVxuXG4vKipcbiAqIFBhaXIgYWRkL2RlbCByb3dzIGludG8gYWxpZ25lZCBsZWZ0L3JpZ2h0IGNvbHVtbnMuIFJlbW92ZWQgbGluZXMgYnVmZmVyXG4gKiB1bnRpbCB0aGUgbWF0Y2hpbmcgYWRkaXRpb25zIGFycml2ZSAodW5pZmllZCBkaWZmIG9yZGVycyBkZWxldGlvbnMgYmVmb3JlXG4gKiBhZGRpdGlvbnMpLCBzbyBwdXJlIGRlbGV0aW9ucyBhbmQgcHVyZSBhZGRpdGlvbnMgc3RpbGwgZ2V0IHRoZWlyIG93biByb3dcbiAqIHdpdGggYW4gZW1wdHkgY2VsbCBvbiB0aGUgb3Bwb3NpdGUgc2lkZS4gTGluZSBudW1iZXJzIHRyYWNrIGZyb20gdGhlIGh1bmtcbiAqIGhlYWRlcidzIGAtYSxiICtjLGRgIHBvc2l0aW9ucy5cbiAqL1xuZnVuY3Rpb24gcGFpclJvd3Mocm93czogRGlmZlJvd1tdLCBvbGRTdGFydDogbnVtYmVyLCBuZXdTdGFydDogbnVtYmVyKTogU3BsaXRSb3dbXSB7XG4gIGNvbnN0IG91dDogU3BsaXRSb3dbXSA9IFtdXG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICBsZXQgcGVuZGluZzogeyB0ZXh0OiBzdHJpbmc7IG51bTogbnVtYmVyIH1bXSA9IFtdXG4gIGNvbnN0IGZsdXNoID0gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgcCBvZiBwZW5kaW5nKSBvdXQucHVzaCh7IGxlZnQ6IHAudGV4dCwgcmlnaHQ6ICcnLCBsZWZ0TnVtOiBwLm51bSwgcmlnaHROdW06IG51bGwsIGtpbmQ6ICdjaGFuZ2UnIH0pXG4gICAgcGVuZGluZyA9IFtdXG4gIH1cbiAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHtcbiAgICAgIHBlbmRpbmcucHVzaCh7IHRleHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBudW06IG9sZExpbmUrKyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdhZGQnKSB7XG4gICAgICBjb25zdCBwID0gcGVuZGluZy5zaGlmdCgpXG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHA/LnRleHQgPz8gJycsIHJpZ2h0OiByb3cudGV4dC5zbGljZSgxKSwgbGVmdE51bTogcD8ubnVtID8/IG51bGwsIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjaGFuZ2UnIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHtcbiAgICAgIGZsdXNoKClcbiAgICAgIC8vIFVuaWZpZWQtZGlmZiBjb250ZXh0IGxpbmVzIGNhcnJ5IGEgbGVhZGluZyBzcGFjZSBcdTIwMTQgc3RyaXAgaXQgZm9yIHRoZVxuICAgICAgLy8gc3BsaXQgY2VsbHMgc28gYm90aCBjb2x1bW5zIHJlbmRlciBiYXJlIHRleHQuXG4gICAgICBjb25zdCB0ZXh0ID0gcm93LnRleHQuc3RhcnRzV2l0aCgnICcpID8gcm93LnRleHQuc2xpY2UoMSkgOiByb3cudGV4dFxuICAgICAgb3V0LnB1c2goeyBsZWZ0OiB0ZXh0LCByaWdodDogdGV4dCwgbGVmdE51bTogb2xkTGluZSsrLCByaWdodE51bTogbmV3TGluZSsrLCBraW5kOiAnY3R4JyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBmbHVzaCgpIC8vIG5vdGVzIChcXCBObyBuZXdsaW5lXHUyMDI2KSBhbmQgc3RyYXkgcm93czoganVzdCBicmVhayB0aGUgcGFpcmluZ1xuICAgIH1cbiAgfVxuICBmbHVzaCgpXG4gIHJldHVybiBvdXRcbn1cblxuLyoqIFBhcnNlIGdpdCB1bmlmaWVkIGRpZmYgdGV4dCBpbnRvIGJsb2NrcyAoYC0tLS8rKytgIGZpbGUgcm93cyBhbmQgYEBAYCBodW5rcykuICovXG5jb25zdCBHSVRfTUVUQSA9IC9eKGRpZmYgLS1naXQgfGluZGV4IHxuZXcgZmlsZSB8ZGVsZXRlZCBmaWxlIHxvbGQgbW9kZSB8bmV3IG1vZGUgfHNpbWlsYXJpdHkgaW5kZXggfHJlbmFtZSAoZnJvbXx0bykgfEJpbmFyeSBmaWxlcyApL1xuXG5mdW5jdGlvbiBwYXJzZUdpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfVtdIHtcbiAgY29uc3QgYmxvY2tzOiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9IHwgbnVsbCA9IG51bGxcbiAgY29uc3QgbGluZXMgPSBkaWZmLnNwbGl0KCdcXG4nKVxuICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBraW5kOiBEaWZmUm93WydraW5kJ11cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrKysnKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy0tLScpIHx8IEdJVF9NRVRBLnRlc3QobGluZSkpIGtpbmQgPSAnZmlsZSdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ0BAJykpIGtpbmQgPSAnaHVuaydcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysnKSkga2luZCA9ICdhZGQnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIGtpbmQgPSAnZGVsJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnXFxcXCAnKSkga2luZCA9ICdub3RlJ1xuICAgIGVsc2Uga2luZCA9ICdjdHgnXG4gICAgaWYgKGtpbmQgPT09ICdmaWxlJyB8fCBraW5kID09PSAnaHVuaycpIHtcbiAgICAgIGN1cnJlbnQgPSB7IGhlYWQ6IHsga2luZCwgdGV4dDogbGluZSB9LCByb3dzOiBbXSB9XG4gICAgICBibG9ja3MucHVzaChjdXJyZW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudCA9IHsgaGVhZDogbnVsbCwgcm93czogW10gfVxuICAgICAgICBibG9ja3MucHVzaChjdXJyZW50KVxuICAgICAgfVxuICAgICAgY3VycmVudC5yb3dzLnB1c2goeyBraW5kLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBibG9ja3Ncbn1cblxuLyoqIEh1bmsgc3RhcnQgcG9zaXRpb25zIGZyb20gYSBgQEAgLWEsYiArYyxkIEBAYCBoZWFkZXIuICovXG5mdW5jdGlvbiBodW5rU3RhcnRzKGhlYWQ6IHN0cmluZyk6IHsgb2xkU3RhcnQ6IG51bWJlcjsgbmV3U3RhcnQ6IG51bWJlciB9IHtcbiAgY29uc3QgbSA9IC9eQEAgLShcXGQrKSg/OixcXGQrKT8gXFwrKFxcZCspLy5leGVjKGhlYWQpXG4gIHJldHVybiB7IG9sZFN0YXJ0OiBtID8gTnVtYmVyKG1bMV0pIDogMSwgbmV3U3RhcnQ6IG0gPyBOdW1iZXIobVsyXSkgOiAxIH1cbn1cblxuLyoqIFNpZGUtYnktc2lkZSBibG9ja3MgZm9yIGEgZ2l0IHVuaWZpZWQgZGlmZiAoc2tpcHMgcHVyZSBmaWxlLWhlYWRlciBibG9ja3MpLiAqL1xuZnVuY3Rpb24gZ2l0U3BsaXRCbG9ja3MoZGlmZjogc3RyaW5nKTogU3BsaXRCbG9ja1tdIHtcbiAgcmV0dXJuIHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gICAgLmZpbHRlcigoYikgPT4gYi5oZWFkPy5raW5kICE9PSAnZmlsZScgJiYgKGIucm93cy5sZW5ndGggPiAwIHx8IGIuaGVhZD8ua2luZCA9PT0gJ2h1bmsnKSlcbiAgICAubWFwKChiKSA9PiB7XG4gICAgICBjb25zdCBzdGFydHMgPSBiLmhlYWQgPyBodW5rU3RhcnRzKGIuaGVhZC50ZXh0KSA6IHsgb2xkU3RhcnQ6IDEsIG5ld1N0YXJ0OiAxIH1cbiAgICAgIHJldHVybiB7IGhlYWQ6IGIuaGVhZD8ua2luZCA9PT0gJ2h1bmsnID8gYi5oZWFkLnRleHQgOiBudWxsLCByb3dzOiBwYWlyUm93cyhiLnJvd3MsIHN0YXJ0cy5vbGRTdGFydCwgc3RhcnRzLm5ld1N0YXJ0KSB9XG4gICAgfSlcbn1cblxuLyoqIFNpZGUtYnktc2lkZSBibG9ja3MgZm9yIHRoZSB0b29scycgRmlsZURpZmYgc2hhcGUgKG9sZFRleHQvbmV3VGV4dCkuICovXG5mdW5jdGlvbiB0ZXh0U3BsaXRCbG9ja3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogU3BsaXRCbG9ja1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFt7IGhlYWQ6IG51bGwsIHJvd3M6IHBhaXJSb3dzKHJvd3MsIDEsIDEpIH1dXG59XG5cbi8qKiBBbGwgc2lkZS1ieS1zaWRlIGJsb2NrcyBmb3Igb25lIHJvdW5kIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVNwbGl0QmxvY2tzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBTcGxpdEJsb2NrW10ge1xuICBpZiAoIWNoYW5nZS5oYXNEaWZmIHx8IGNoYW5nZS5odW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICByZXR1cm4gY2hhbmdlLmh1bmtzLm1hcCgoaHVuaywgaSkgPT4gKHtcbiAgICBoZWFkOiBjaGFuZ2UuaHVua3MubGVuZ3RoID4gMSA/IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIDogbnVsbCxcbiAgICByb3dzOiB0ZXh0U3BsaXRCbG9ja3MoaHVuay5vbGRUZXh0LCBodW5rLm5ld1RleHQpWzBdLnJvd3MsXG4gIH0pKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFN0eWxlcyAoZHNkci0qOyB0aGUgaGVhZGVyIHRyaWdnZXIgbWlycm9ycyB0aGUgaW4tdHJlZSBhY3Rpb24gcm93cykuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgUkVWSUVXX0NTUyA9IGBcbi5kc2RyLXRyaWdnZXJ7bWluLWhlaWdodDoyOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo0cHg7cGFkZGluZzozcHggNnB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2Rpc3BsYXk6aW5saW5lLWZsZXh9XG4uZHNkci10cmlnZ2VyOmhvdmVyLC5kc2RyLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWxhYmVse21hcmdpbi1sZWZ0OjJweH1cbi5kc2RyLWNvdW50e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2JvcmRlci1yYWRpdXM6OTk5cHg7bWluLXdpZHRoOjE2cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtwYWRkaW5nOjAgNXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLW92ZXJsYXl7cG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDt6LWluZGV4OjIwMDtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjQ1KTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7cGFkZGluZzozMnB4fVxuLmRzZHItcGFuZWx7Ym94LXNpemluZzpib3JkZXItYm94O3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOm1pbigxMTIwcHgsMTAwJSk7aGVpZ2h0Om1pbig3MjBweCxjYWxjKDEwMHZoIC0gNjRweCkpO21heC13aWR0aDpjYWxjKDEwMHZ3IC0gNjRweCk7bWF4LWhlaWdodDpjYWxjKDEwMHZoIC0gNjRweCk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6MTRweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXJlc2l6ZXtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjV9XG4uZHNkci1yZXNpemUtZXt0b3A6MDtyaWdodDotM3B4O3dpZHRoOjdweDtoZWlnaHQ6MTAwJTtjdXJzb3I6ZXctcmVzaXplfVxuLmRzZHItcmVzaXplLXN7Ym90dG9tOi0zcHg7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjdweDtjdXJzb3I6bnMtcmVzaXplfVxuLmRzZHItcmVzaXplLXNle3JpZ2h0Oi00cHg7Ym90dG9tOi00cHg7d2lkdGg6MTVweDtoZWlnaHQ6MTVweDtjdXJzb3I6bndzZS1yZXNpemV9XG4uZHNkci1oZWFkZXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjEycHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci10aXRsZXtmb250LXNpemU6MTRweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3VidGl0bGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXRhYnN7ZGlzcGxheTpmbGV4O2dhcDo0cHg7bWFyZ2luLWxlZnQ6MTRweH1cbi5kc2RyLXRhYntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyNnB4O2JvcmRlcjoxcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MnB4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci10YWI6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci10YWItYWN0aXZle2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2NvcGV7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttYXJnaW4tbGVmdDo4cHh9XG4uZHNkci1zY29wZSAuZHNkci1zZWwtdHJpZ2dlcnttaW4td2lkdGg6MTEwcHg7aGVpZ2h0OjI2cHg7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjAgOHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpfVxuLmRzZHItc3BhY2Vye2ZsZXg6MX1cbi5kc2RyLWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyOHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjNweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHh9XG4uZHNkci1idG46aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bjpkaXNhYmxlZHtvcGFjaXR5Oi41O2N1cnNvcjpkZWZhdWx0fVxuLmRzZHItYnRuLXByaW1hcnl7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNDAwKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1idG4tZGFuZ2Vye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXI6aG92ZXI6bm90KDpkaXNhYmxlZCl7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWNvbmZpcm17Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTUwKX1cbi5kc2RyLWJ0bi1jb25maXJtOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItY29tbWl0LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoyMDBweDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzozcHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLWNvbW1pdC1pbnB1dDo6cGxhY2Vob2xkZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWNhcHRpb24pfVxuLmRzZHItY29tbWl0LWlucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpfVxuLmRzZHItc2VjdGlvbntmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzoxMHB4IDhweCAzcHg7Zm9udC13ZWlnaHQ6NjAwO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweH1cbi5kc2RyLXNlY3Rpb246Zmlyc3QtY2hpbGR7cGFkZGluZy10b3A6NHB4fVxuLmRzZHItYnJhbmNoe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjRweCA4cHggOHB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItYnJhbmNoLXJlZntmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7bWluLXdpZHRoOjA7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweH1cbi5kc2RyLWJyYW5jaC1hcnJvd3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItYnJhbmNoLXN0YXR7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtmb250LXNpemU6MTFweDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1icmFuY2gtYWhlYWR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtYmVoaW5ke2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS13YXJuLXByaW1hcnkpfVxuLmRzZHItYnJhbmNoLXN5bmN7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1jb21taXR7ZmxleDoxO21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjJweDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdDpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10bC1zZWxlY3RlZCAuZHNkci1jb21taXR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItdGltZWxpbmV7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLXRsLWl0ZW17ZGlzcGxheTpmbGV4O2dhcDo2cHg7YWxpZ24taXRlbXM6c3RyZXRjaDtib3JkZXItcmFkaXVzOjhweH1cbi5kc2RyLXRsLXJhaWx7cG9zaXRpb246cmVsYXRpdmU7ZmxleDpub25lO3dpZHRoOjE0cHg7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpjZW50ZXJ9XG4uZHNkci10bC1yYWlsOjpiZWZvcmV7Y29udGVudDpcIlwiO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2JvdHRvbTowO2xlZnQ6NTAlO3dpZHRoOjFweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItdGwtaXRlbTpmaXJzdC1jaGlsZCAuZHNkci10bC1yYWlsOjpiZWZvcmV7dG9wOjlweH1cbi5kc2RyLXRsLWl0ZW06bGFzdC1jaGlsZCAuZHNkci10bC1yYWlsOjpiZWZvcmV7Ym90dG9tOmF1dG87aGVpZ2h0OjlweH1cbi5kc2RyLXRsLWRvdHtwb3NpdGlvbjpyZWxhdGl2ZTt6LWluZGV4OjE7dG9wOjlweDtmbGV4Om5vbmU7d2lkdGg6N3B4O2hlaWdodDo3cHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKX1cbi5kc2RyLXRsLWRvdC1sb2NhbHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdGwtZG90LXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1jb21taXQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWluLXdpZHRoOjB9XG4uZHNkci1jb21taXQtc2hvcnR7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jb21taXQtc3ViamVjdHtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItY29tbWl0LW1ldGF7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nLWxlZnQ6MH1cbi5kc2RyLXRsLWJhZGdle2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA1cHh9XG4uZHNkci10bC1iYWRnZS1sb2NhbHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1iYWRnZS1yZW1vdGV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpZmYtaGFzaHttYXJnaW4tbGVmdDo4cHg7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1maWxlLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLWNvbW1pdC1maWxlLXBhdGh7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO21hcmdpbi1sZWZ0OjRweH1cbi5kc2RyLWNmZy1jYXJke2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMyk7Ym9yZGVyLXJhZGl1czoxMnB4O2xpc3Qtc3R5bGU6bm9uZTt0cmFuc2l0aW9uOmJvcmRlci1jb2xvciAuMTZzLGJhY2tncm91bmQgLjE2c31cbi5kc2RyLWNmZy1jYXJkOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLWNmZy1jYXJkLW9wZW57YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWhlYWR7YXBwZWFyYW5jZTpub25lO3dpZHRoOjEwMCU7Zm9udDppbmhlcml0O2NvbG9yOmluaGVyaXQ7dGV4dC1hbGlnbjpsZWZ0O2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6MTJweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEycHg7cGFkZGluZzoxNHB4IDE2cHg7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLWhlYWQ6Zm9jdXMtdmlzaWJsZXtvdXRsaW5lOjJweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSk7b3V0bGluZS1vZmZzZXQ6LTJweH1cbi5kc2RyLWNmZy1oZWFkLXRleHR7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2ZsZXg6MTtnYXA6NHB4O21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWNmZy1uYW1le2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo2MDA7bGluZS1oZWlnaHQ6MS40fVxuLmRzZHItY2ZnLWRlc2N7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctY2FyZXR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmbGV4Om5vbmU7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjE2c31cbi5kc2RyLWNmZy1jYXJldC1vcGVue3RyYW5zZm9ybTpyb3RhdGUoMTgwZGVnKX1cbi5kc2RyLWNmZy1ib2R5e2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO21hcmdpbjowIDE2cHg7cGFkZGluZy1ib3R0b206OHB4O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci1jZmctZmllbGR7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHg7cGFkZGluZzoxMnB4IDA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLWZpZWxkKy5kc2RyLWNmZy1maWVsZHtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKX1cbi5kc2RyLWNmZy1sYWJlbHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7ZmxleDoxO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctaGludHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO21hcmdpbjowO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1wZW5kaW5ne3doaXRlLXNwYWNlOm5vd3JhcDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2JvcmRlci1yYWRpdXM6OTk5cHg7ZmxleDpub25lO3BhZGRpbmc6MXB4IDhweDtmb250LXNpemU6MTFweDtmb250LXdlaWdodDo1MDA7bGluZS1oZWlnaHQ6MTdweH1cbi5kc2RyLWNmZy1mYWlsZWR7bWluLXdpZHRoOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWVycm9yKTtmbGV4OjE7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLWFjdGlvbnN7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6MTJweCAwIDRweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1ib2R5e2Rpc3BsYXk6ZmxleDtmbGV4OjE7bWluLWhlaWdodDowfVxuLmRzZHItZmlsZXN7d2lkdGg6MzAwcHg7ZmxleDpub25lO2JvcmRlci1yaWdodDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7b3ZlcmZsb3cteTphdXRvO3BhZGRpbmc6OHB4fVxuLmRzZHItcm91bmR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6OHB4IDhweCAzcHg7Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItcm91bmQtbGFiZWx7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjQwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWZpbGV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmlsZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1maWxlLXNlbGVjdGVke2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWRpcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzo1cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLWRpcjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZGlyLWNhcmV0e2ZsZXg6bm9uZTt3aWR0aDoxMnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1kaXItbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjYwMH1cbi5kc2RyLWRpci1jb3VudHtmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1maWxlLW5hbWV7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbjtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbGUtc3RhdHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1jaGlwe2ZsZXg6bm9uZTttaW4td2lkdGg6MjJweDt0ZXh0LWFsaWduOmNlbnRlcjtib3JkZXItcmFkaXVzOjVweDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jaGlwLW17YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOiMyZWEwNDN9XG4uZHNkci1jaGlwLWF7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOiMyZWEwNDN9XG4uZHNkci1jaGlwLWR7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTYpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1jaGlwLXJ7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KTtjb2xvcjojNThhNmZmfVxuLmRzZHItY2hpcC11e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci10b29se2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZGlmZntmbGV4OjE7bWluLXdpZHRoOjA7b3ZlcmZsb3c6YXV0bztwYWRkaW5nOjEwcHggMH1cbi5kc2RyLWRpZmYtZW1wdHl7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2hlaWdodDoxMDAlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1kaWZmLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjZweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLWRpZmYtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTNweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWRpZmYtc3RhdHN7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7ZmxleDpub25lfVxuLmRzZHItZGlmZi1zY3JvbGx7ZmxleDoxO21pbi1oZWlnaHQ6MDtvdmVyZmxvdzphdXRvO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLXByZXttYXJnaW46MDtwYWRkaW5nOjhweCAwO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCk7d2hpdGUtc3BhY2U6cHJlO21pbi13aWR0aDoxMDAlO2ZsZXg6MX1cbi5kc2RyLWxpbmV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjEwcHg7cGFkZGluZzowIDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3Bvc2l0aW9uOnJlbGF0aXZlfVxuLmRzZHItbGluZS1udW17ZmxleDpub25lO3dpZHRoOjM0cHg7dGV4dC1hbGlnbjpyaWdodDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3VzZXItc2VsZWN0Om5vbmU7Zm9udC1zaXplOmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpIC0gMXB4KTtvcGFjaXR5Oi43NX1cbi5kc2RyLWxpbmUtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6cHJlfVxuLmRzZHItY29tbWVudC1hZGR7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxOHB4O2hlaWdodDoxOHB4O2JvcmRlci1yYWRpdXM6NnB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxO3BhZGRpbmc6MDttYXJnaW4tdG9wOjFweDt2aXNpYmlsaXR5OmhpZGRlbn1cbi5kc2RyLWxpbmU6aG92ZXIgLmRzZHItY29tbWVudC1hZGQsLmRzZHItY29tbWVudC1hZGQ6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1jb21tZW50LWFkZDpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY29tbWVudC1oYXN7dmlzaWJpbGl0eTp2aXNpYmxlO2JhY2tncm91bmQ6Y29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKSAxNiUsIHRyYW5zcGFyZW50KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCk7Ym9yZGVyLWNvbG9yOnRyYW5zcGFyZW50O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWxpbmUtY29tbWVudGVke2JveC1zaGFkb3c6aW5zZXQgM3B4IDAgMCBjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDcwJSwgdHJhbnNwYXJlbnQpfVxuLmRzZHItY29tbWVudC1lZGl0b3J7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1jb21tZW50LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6NTJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6NnB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtyZXNpemU6dmVydGljYWx9XG4uZHNkci1jb21tZW50LWlucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpfVxuLmRzZHItY29tbWVudC1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2p1c3RpZnktY29udGVudDpmbGV4LWVuZH1cbi5kc2RyLWNvbW1lbnQtcG9we3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6MjA7cmlnaHQ6MTZweDt0b3A6Y2FsYygxMDAlICsgMnB4KTttaW4td2lkdGg6MjgwcHg7bWF4LXdpZHRoOjQ0MHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym9yZGVyLXJhZGl1czoxMHB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO3BhZGRpbmc6OHB4O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweH1cbi5kc2RyLWNvbW1lbnQtaXRlbXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7cGFkZGluZy1ib3R0b206NnB4fVxuLmRzZHItY29tbWVudC1pdGVtOmxhc3QtY2hpbGR7Ym9yZGVyLWJvdHRvbTowO3BhZGRpbmctYm90dG9tOjB9XG4uZHNkci1jb21tZW50LXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1lbnQtbWV0YXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1lbnQtbWV0YSAuZHNkci1idG57bWluLWhlaWdodDoyMHB4O3BhZGRpbmc6MCA2cHg7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDttYXJnaW4tbGVmdDphdXRvfVxuLmRzZHItb3BlbmxpbmV7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxOHB4O2hlaWdodDoxOHB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxO3BhZGRpbmc6MDt2aXNpYmlsaXR5OmhpZGRlbn1cbi5kc2RyLWxpbmU6aG92ZXIgLmRzZHItb3BlbmxpbmUsLmRzZHItb3BlbmxpbmU6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1vcGVubGluZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1saW5lLWZpbmRpbmd7Ym94LXNoYWRvdzppbnNldCAzcHggMCAwIHZhcigtLWRzZHItZmluZGluZy1jb2xvciwgcmdiYSgyNTUsMTY2LDg3LC43KSl9XG4uZHNkci1maW5kaW5nLVAwey0tZHNkci1maW5kaW5nLWNvbG9yOiNmODUxNDl9XG4uZHNkci1maW5kaW5nLVAxey0tZHNkci1maW5kaW5nLWNvbG9yOiNmZmE2NTd9XG4uZHNkci1maW5kaW5nLVAyey0tZHNkci1maW5kaW5nLWNvbG9yOiNkMjk5MjJ9XG4uZHNkci1maW5kaW5nLVAzey0tZHNkci1maW5kaW5nLWNvbG9yOiM4Yjk0OWV9XG4uZHNkci1maW5kaW5nLXRhZ3tmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDtib3JkZXItcmFkaXVzOjRweDtwYWRkaW5nOjAgNHB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtd2VpZ2h0OjYwMDthbGlnbi1zZWxmOmZsZXgtc3RhcnQ7bWFyZ2luLXRvcDoycHh9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDB7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTgpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDF7YmFja2dyb3VuZDpyZ2JhKDI1NSwxNjYsODcsLjE2KTtjb2xvcjojZmZhNjU3fVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAye2JhY2tncm91bmQ6cmdiYSgyMTAsMTUzLDM0LC4xNik7Y29sb3I6I2QyOTkyMn1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QM3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1qdW1we2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNil9XG4uZHNkci1yZXZpZXctc3RyaXB7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZTtmb250LXNpemU6MTJweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLXJldmlldy1va3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1iYWR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LW1vZGVse2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1yZXZpZXctdG9nZ2xlLW9ue2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmluZGluZ3N7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO21heC1oZWlnaHQ6MjYwcHg7b3ZlcmZsb3cteTphdXRvfVxuLmRzZHItZmluZGluZy1pdGVte2Rpc3BsYXk6ZmxleDtnYXA6OHB4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdH1cbi5kc2RyLWZpbmRpbmctaXRlbTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1maW5kaW5nLWJvZHl7ZmxleDoxO21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjNweH1cbi5kc2RyLWZpbmRpbmctdGl0bGV7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6YmFzZWxpbmU7Z2FwOjhweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLWZpbmRpbmctbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NDAwfVxuLmRzZHItZmluZGluZy1kZXRhaWx7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZmluZGluZy1tZXRhe2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1maW5kaW5nLXN1Z2dlc3Rpb257ZGlzcGxheTpibG9jazt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLXJhZGl1czo2cHg7cGFkZGluZzo0cHggOHB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItcHJ7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O3BhZGRpbmc6NHB4IDhweCA4cHh9XG4uZHNkci1wci1pdGVte2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjNweDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0fVxuLmRzZHItcHItaXRlbTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1wci1tZXRhe2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1wci10ZXh0e2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1kb2Nre2JveC1zaXppbmc6Ym9yZGVyLWJveDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7d2lkdGg6MTAwJTttYXgtd2lkdGg6dmFyKC0tZHNoLWNvbXBvc2VyLWNhcmQtbWF4LXdpZHRoLCA3ODBweCk7bWFyZ2luOjAgYXV0byBjYWxjKC0xICogdmFyKC0tZHNoLWNvbXBvc2VyLXN0YWNrLWdhcCwgNnB4KSAtIDhweCk7cGFkZGluZzo4cHggMTZweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1pbnB1dC1tYWpvcik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyLWRhcmttb2RlLXRoaW4pO2JvcmRlci1ib3R0b206bm9uZTtib3JkZXItcmFkaXVzOjIycHggMjJweCAwIDA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kb2NrLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21pbi1oZWlnaHQ6MjJweH1cbi5kc2RyLWRvY2staWNvbntkaXNwbGF5OmlubGluZS1mbGV4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKX1cbi5kc2RyLWRvY2stY291bnR7Zm9udC13ZWlnaHQ6NjAwO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItZG9jay1jbG9zZXtmbGV4Om5vbmU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoyMHB4O2hlaWdodDoyMHB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NnB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjB9XG4uZHNkci1kb2NrLWNsb3NlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kb2NrLWxpc3R7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O3BhZGRpbmctdG9wOjRweDttYXJnaW4tdG9wOjJweDttYXgtaGVpZ2h0OjE2OHB4O292ZXJmbG93LXk6YXV0b31cbi5kc2RyLWRvY2staXRlbXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoxcHg7dGV4dC1hbGlnbjpsZWZ0O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzo0cHggOHB4O2N1cnNvcjpwb2ludGVyO2ZvbnQ6aW5oZXJpdH1cbi5kc2RyLWRvY2staXRlbTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1kb2NrLWxvY3tmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWRvY2stdGV4dHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2Rpc3BsYXk6LXdlYmtpdC1ib3g7LXdlYmtpdC1saW5lLWNsYW1wOjI7LXdlYmtpdC1ib3gtb3JpZW50OnZlcnRpY2FsO292ZXJmbG93OmhpZGRlbjtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItc2VuZHtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjQwO3RvcDo1MnB4O3JpZ2h0OjE2cHg7d2lkdGg6bWluKDQ4MHB4LGNhbGMoMTAwJSAtIDMycHgpKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLW1lbnUpO2JvcmRlci1yYWRpdXM6MTJweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtwYWRkaW5nOjEycHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6OHB4fVxuLmRzZHItc2VuZC10aXRsZXtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2VuZC1oaW50e2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXNlbmQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDoxNDBweDttYXgtaGVpZ2h0OjMyMHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6OHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3Jlc2l6ZTp2ZXJ0aWNhbDt3aGl0ZS1zcGFjZTpwcmUtd3JhcH1cbi5kc2RyLWxpbmUtYWRke2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjEzKX1cbi5kc2RyLWxpbmUtZGVse2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjEyKX1cbi5kc2RyLWxpbmUtaHVua3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1maWxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLW5vdGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXN0eWxlOml0YWxpY31cbi5kc2RyLWh1bmstYmFye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtwYWRkaW5nOjJweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpfVxuLmRzZHItaHVuay1iYXIgLmRzZHItYnRue21pbi1oZWlnaHQ6MjJweDtwYWRkaW5nOjFweCA4cHg7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweH1cbi5kc2RyLWh1bmstbGF5ZXJ7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO21hcmdpbi1yaWdodDphdXRvfVxuLmRzZHItZm9vdHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO21pbi1oZWlnaHQ6MzZweH1cbi5kc2RyLW5vdGljZXtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLW5vdGljZS1va3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLW5vdGljZS1lcnJvcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1zcGlubmVye2ZsZXg6bm9uZTt3aWR0aDoxMnB4O2hlaWdodDoxMnB4O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlcjoycHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXRvcC1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTthbmltYXRpb246ZHNkci1zcGluIC44cyBsaW5lYXIgaW5maW5pdGV9XG5Aa2V5ZnJhbWVzIGRzZHItc3Bpbnt0b3t0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fVxuLmRzZHItZW1wdHl7cGFkZGluZzo0MHB4O3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1ub2RpZmZ7cGFkZGluZzo4cHggMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItc2Vse3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6aW5saW5lLWZsZXh9XG4uZHNkci1zZWwtdHJpZ2dlcntib3gtc2l6aW5nOmNvbnRlbnQtYm94O21pbi13aWR0aDoxODBweDtoZWlnaHQ6MzRweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjAgMTJweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEzcHg7bGluZS1oZWlnaHQ6MS41O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHh9XG4uZHNkci1zZWwtdHJpZ2dlcjpob3Zlcntib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1zZWwtdHJpZ2dlcjpmb2N1cy12aXNpYmxle2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSk7b3V0bGluZTpub25lfVxuLmRzZHItc2VsLXRyaWdnZXIgc3Zne2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTJzfVxuLmRzZHItc2VsLXRyaWdnZXJbYXJpYS1leHBhbmRlZD1cInRydWVcIl0gc3Zne3RyYW5zZm9ybTpyb3RhdGUoMTgwZGVnKX1cbi5kc2RyLXNlbC12YWx1ZXtmbGV4OjE7bWluLXdpZHRoOjA7dGV4dC1hbGlnbjpsZWZ0O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXNlbC1tZW51e3otaW5kZXg6MjAwO2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4td2lkdGg6MTAwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLW1lbnUpO2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO2JvcmRlci1yYWRpdXM6MTBweDttYXJnaW46MDtwYWRkaW5nOjRweDtsaXN0LXN0eWxlOm5vbmU7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MXB4O3Bvc2l0aW9uOmFic29sdXRlO3RvcDpjYWxjKDEwMCUgKyA1cHgpO2xlZnQ6MH1cbi5kc2RyLXNlbC1vcHRpb257Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDozMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItcmFkaXVzOjdweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjVweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7dGV4dC1hbGlnbjpsZWZ0O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLXNlbC1vcHRpb246aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItc2VsLW9wdGlvbi1hY3RpdmV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2VsLW9wdGlvbi1tYXJre2ZsZXg6bm9uZTt3aWR0aDoxNHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1zZWwtb3B0aW9uLWxhYmVse2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci12aWV3LXRvZ2dsZXtkaXNwbGF5OmZsZXg7Z2FwOjJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O3BhZGRpbmc6MnB4O2ZsZXg6bm9uZX1cbi5kc2RyLXZpZXctYnRue2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjIycHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo1cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MXB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweH1cbi5kc2RyLXZpZXctYnRuOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdmlldy1idG4tYWN0aXZle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGxpdHttaW4td2lkdGg6MTAwJX1cbi5kc2RyLXNwbGl0LWhlYWR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjRweCA4cHg7cG9zaXRpb246c3RpY2t5O3RvcDowO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSl9XG4uZHNkci1zcGxpdC1oZWFkIGRpdntkaXNwbGF5OmZsZXg7Z2FwOjhweH1cbi5kc2RyLXNwbGl0LWh1bmt7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE4cHg7cGFkZGluZzoycHggMTZweH1cbi5kc2RyLXNwbGl0LXJvd3twb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KX1cbi5kc2RyLXNwbGl0LWNlbGw6aG92ZXIgLmRzZHItY29tbWVudC1hZGQsLmRzZHItc3BsaXQtcm93OmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRke3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLXNwbGl0LWNlbGx7ZGlzcGxheTpmbGV4O2dhcDo4cHg7cGFkZGluZzowIDhweDt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNwbGl0LW51bXtmbGV4Om5vbmU7d2lkdGg6MzZweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KX1cbi5kc2RyLXNwbGl0LXRleHR7ZmxleDoxO21pbi13aWR0aDowfVxuLmRzZHItY2VsbC1maW5kaW5ne2JveC1zaGFkb3c6aW5zZXQgMCAwIDAgMXB4IHZhcigtLWRzZHItZmluZGluZy1jb2xvciwgcmdiYSgyNTUsMTY2LDg3LC43KSk7YmFja2dyb3VuZDpyZ2JhKDI1NSwxNjYsODcsLjA4KX1cbi5kc2RyLWNlbGwtanVtcHtiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpfVxuLmRzZHItc3BsaXQtZmluZGluZ3tmbGV4Om5vbmU7Zm9udC1zaXplOjlweDtsaW5lLWhlaWdodDoxMnB4O2JvcmRlci1yYWRpdXM6M3B4O3BhZGRpbmc6MCAzcHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydH1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAwe2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE4KTtjb2xvcjojZjg1MTQ5fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDF7YmFja2dyb3VuZDpyZ2JhKDI1NSwxNjYsODcsLjE2KTtjb2xvcjojZmZhNjU3fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDN7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXNwbGl0LW9wZW5saW5le2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MTZweDtoZWlnaHQ6MTZweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1zcGxpdC1jZWxsOmhvdmVyIC5kc2RyLXNwbGl0LW9wZW5saW5lLC5kc2RyLXNwbGl0LW9wZW5saW5lOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItc3BsaXQtb3BlbmxpbmU6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY2VsbC1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItY2VsbC1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItY2VsbC1kaW17YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMSwgcmdiYSgxMjgsMTI4LDEyOCwuMDUpKX1cbmBcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHN0eWxlW2RhdGEtcGx1Z2luLWNzcz0ke0pTT04uc3RyaW5naWZ5KFNUWUxFX1RBRyl9XWApID09PSBudWxsKSB7XG4gIGNvbnN0IHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgdGFnLmRhdGFzZXQucGx1Z2luID0gJ2RzaC1wbHVnaW4tZGlmZi1yZXZpZXcnXG4gIHRhZy5kYXRhc2V0LnBsdWdpbkNzcyA9IFNUWUxFX1RBR1xuICB0YWcudGV4dENvbnRlbnQgPSBSRVZJRVdfQ1NTXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGFnKVxufVxuXG4vKiogU2ltcGxpZmllZCBDaGluZXNlIGRpY3Rpb25hcnkgKGtleS1zZXQgc291cmNlIG9mIHRydXRoKS4gKi9cbmNvbnN0IHpoID0ge1xuICAnYWN0aW9uLmxhYmVsJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdhY3Rpb24uYXJpYSc6ICdcdTVCQTFcdTY3RTVcdTVGNTNcdTUyNERcdTk4NzlcdTc2RUVcdTRFMEVcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzknLFxuICAndGFiLnNlc3Npb24nOiAnXHU0RjFBXHU4QkREXHU2NkY0XHU2NTM5JyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnXHU1REU1XHU0RjVDXHU1MzNBJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdcdTUzRDhcdTUyQTgnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ1x1NkUzOFx1NzlCQiBIRUFEJyxcbiAgJ3Jldmlldy5ub3RSZXBvJzogJ1x1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1NEUwRFx1NjYyRiBnaXQgXHU0RUQzXHU1RTkzJyxcbiAgJ3Jldmlldy5ub3RSZXBvSGludCc6ICdcdTMwMENcdTRGMUFcdThCRERcdTY2RjRcdTY1MzlcdTMwMERcdTk4NzVcdTdCN0VcdTRFMERcdTUzRDdcdTVGNzFcdTU0Q0RcdUZGMENcdTRFQ0RcdTUzRUZcdTY3RTVcdTc3MEJcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzlcdTMwMDInLFxuICAncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnOiAnXHU4RkQ5XHU0RTJBXHU0RjFBXHU4QkREXHU4RkQ4XHU2Q0ExXHU2NzA5XHU2NTg3XHU0RUY2XHU0RkVFXHU2NTM5XHU4QkIwXHU1RjU1JyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gXHU4RjZFIFx1MDBCNyB7ZmlsZXN9IFx1NEUyQVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcucm91bmQnOiAnXHU3QjJDIHtyb3VuZH0gXHU4RjZFJyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdcdTZDQTFcdTY3MDlcdTY3MkFcdTYzRDBcdTRFQTRcdTc2ODRcdTY2RjRcdTY1MzkgXHVEODNDXHVERjg5JyxcbiAgJ3Jldmlldy5sb2FkRXJyb3InOiAnXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnXHU1MTY4XHU5MEU4XHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRBbGwnOiAnXHU1MTY4XHU5MEU4XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy51bnN0YWdlJzogJ1x1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcudW5zdGFnZUFsbCc6ICdcdTUxNjhcdTkwRThcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5zdGFnZSc6ICdcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5yZXZlcnQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ2h1bmsudW5zdGFnZSc6ICdcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5zdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsudW5zdGFnZWQnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0JzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29uZmlybVJldmVydEFsbCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmNvbW1pdCc6ICdcdTYzRDBcdTRFQTQnLFxuICAncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJzogJ1x1NjNEMFx1NEVBNFx1OEJGNFx1NjYwRVx1MjAyNicsXG4gICdyZXZpZXcucHVzaCc6ICdcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LmNvbmZpcm1QdXNoJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29tbWl0dGVkJzogJ1x1NURGMlx1NjNEMFx1NEVBNCB7c3VtbWFyeX0nLFxuICAncmV2aWV3LmNvbW1pdEZhaWxlZCc6ICdcdTYzRDBcdTRFQTRcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnB1c2hlZCc6ICdcdTVERjJcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LnB1c2hGYWlsZWQnOiAnXHU2M0E4XHU5MDAxXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5haGVhZCc6ICdcdTk4ODZcdTUxNDgge259JyxcbiAgJ3Jldmlldy5iZWhpbmQnOiAnXHU4NDNEXHU1NDBFIHtufScsXG4gICdyZXZpZXcuc2VjdGlvblN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkJyYW5jaCc6ICdcdTUyMDZcdTY1MkZcdTRFMEVcdThGRENcdTdBMEInLFxuICAncmV2aWV3Lm5vVXBzdHJlYW0nOiAnXHU2NzJBXHU4QkJFXHU3RjZFXHU0RTBBXHU2RTM4XHU1MjA2XHU2NTJGJyxcbiAgJ3Jldmlldy5oaXN0b3J5JzogJ1x1NTM4Nlx1NTNGMicsXG4gICdyZXZpZXcuY29tbWl0RmlsZXMnOiAnXHU1M0Q4XHU1MkE4XHU2NTg3XHU0RUY2JyxcbiAgJ2hpc3RvcnkubG9jYWwnOiAnXHU2NzJDXHU1NzMwJyxcbiAgJ2hpc3RvcnkucmVtb3RlJzogJ1x1OEZEQ1x1N0EwQicsXG4gICd0aW1lLm5vdyc6ICdcdTUyMUFcdTUyMUEnLFxuICAndGltZS5taW51dGVzJzogJ3tufSBcdTUyMDZcdTk0OUZcdTUyNEQnLFxuICAndGltZS5ob3Vycyc6ICd7bn0gXHU1QzBGXHU2NUY2XHU1MjREJyxcbiAgJ3RpbWUuZGF5cyc6ICd7bn0gXHU1OTI5XHU1MjREJyxcbiAgJ3Jldmlldy5yZWZyZXNoJzogJ1x1NTIzN1x1NjVCMCcsXG4gICdyZXZpZXcuY2xvc2UnOiAnXHU1MTczXHU5NUVEJyxcbiAgJ3Jldmlldy5idXN5JzogJ1x1NTkwNFx1NzQwNlx1NEUyRFx1MjAyNicsXG4gICdyZXZpZXcuZG9uZSc6ICdcdTVERjJ7YWN0aW9ufSB7Y291bnR9IFx1NEUyQVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcuZG9uZU9uZSc6ICdcdTVERjJ7YWN0aW9ufSB7cGF0aH0nLFxuICAncmV2aWV3LmRvbmVEZWxldGVkJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2XHVGRjA4XHU1MjIwXHU5NjY0IHtkZWxldGVkfSBcdTRFMkFcdTY3MkFcdThEREZcdThFMkFcdTY1ODdcdTRFRjZcdUZGMDknLFxuICAncmV2aWV3LmFjY2VwdGVkJzogJ1x1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0ZWQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy51bnRyYWNrZWQnOiAnXHU2NzJBXHU4RERGXHU4RTJBJyxcbiAgJ3Jldmlldy5iaW5hcnknOiAnXHU0RThDXHU4RkRCXHU1MjM2JyxcbiAgJ3Jldmlldy5ub0RpZmZEYXRhJzogJ1x1OEJFNVx1NEZFRVx1NjUzOVx1NkNBMVx1NjcwOSBkaWZmIFx1NjU3MFx1NjM2RScsXG4gICdyZXZpZXcuY2hhbmdlcyc6ICd7YWRkZWR9KyB7ZGVsZXRlZH0tJyxcbiAgJ3ZpZXcuc2luZ2xlJzogJ1x1NTM1NVx1NjgwRicsXG4gICd2aWV3LnNwbGl0JzogJ1x1NTNDQ1x1NjgwRicsXG4gICd2aWV3LmJlZm9yZSc6ICdcdTUzOUZcdTY1ODdcdTRFRjYnLFxuICAndmlldy5hZnRlcic6ICdcdTY1QjBcdTY1ODdcdTRFRjYnLFxuICAnY29tbWVudC5hZGQnOiAnXHU4QkM0XHU4QkJBXHU2QjY0XHU4ODRDJyxcbiAgJ2NvbW1lbnQuc2hvdyc6ICdcdTY3RTVcdTc3MEJcdThCQzRcdThCQkEnLFxuICAnY29tbWVudC5wbGFjZWhvbGRlcic6ICdcdThCQzRcdThCQkFcdTIwMjZcdUZGMDhDdHJsL1x1MjMxOCtFbnRlciBcdTRGRERcdTVCNThcdUZGMDknLFxuICAnY29tbWVudC5zYXZlJzogJ1x1NEZERFx1NUI1OCcsXG4gICdjb21tZW50LmNhbmNlbCc6ICdcdTUzRDZcdTZEODgnLFxuICAnY29tbWVudC5kZWxldGUnOiAnXHU1MjIwXHU5NjY0JyxcbiAgJ2NvbW1lbnQuc2F2ZWQnOiAnXHU1REYyXHU0RkREXHU1QjU4XHU4QkM0XHU4QkJBJyxcbiAgJ2NvbW1lbnQuZmFpbGVkJzogJ1x1OEJDNFx1OEJCQVx1NEZERFx1NUI1OFx1NTkzMVx1OEQyNScsXG4gICdzY29wZS5sYWJlbCc6ICdcdTgzMDNcdTU2RjQnLFxuICAnc2NvcGUuYWxsJzogJ1x1NTE2OFx1OTBFOCcsXG4gICdzY29wZS51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAnc2NvcGUuc3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdzY29wZS5jb21taXQnOiAnXHU2M0QwXHU0RUE0JyxcbiAgJ3Njb3BlLmJyYW5jaCc6ICdcdTUyMDZcdTY1MkYnLFxuICAnc2NvcGUubGFzdC10dXJuJzogJ1x1NjcwMFx1NTQwRVx1NEUwMFx1OEY2RScsXG4gICdyZXZpZXcubGFzdFR1cm5FbXB0eSc6ICdcdTY3MDBcdTU0MEVcdTRFMDBcdThGNkVcdTZDQTFcdTY3MDlcdThCQjBcdTVGNTVcdTUyMzBcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzkgXHUyMDE0XHUyMDE0IFx1N0VDOFx1N0FFRlx1NTQ3RFx1NEVFNFx1RkYwOGJhc2hcdUZGMDlcdTY1MzlcdTY1ODdcdTRFRjZcdTRFMERcdTRGMUFcdThCQTFcdTUxNjVcdTRGMUFcdThCRERcdThCQjBcdTVGNTVcdUZGMUJcdTUzRUZcdTUyMDdcdTUyMzBcdTMwMENcdTUxNjhcdTkwRThcdTMwMERcdTY3RTVcdTc3MEIgZ2l0IFx1NTNEOFx1NjZGNCcsXG4gICdzY29wZS5iYXNlJzogJ1x1NTdGQVx1N0VCRlx1NTIwNlx1NjUyRicsXG4gICdzY29wZS5icmFuY2hSZWFkb25seSc6ICdcdTUyMDZcdTY1MkZcdTgzMDNcdTU2RjRcdTUzRUFcdThCRkJcdUZGMDhcdTVCRjlcdTZCRDQgbWVyZ2UtYmFzZVx1RkYwQ1x1NEUwRFx1NjNEMFx1NEY5Qlx1OTFDN1x1N0VCMy9cdTRFMjJcdTVGMDNcdUZGMDknLFxuICAncmV2aWV3LnNlbGVjdENvbW1pdCc6ICdcdTRFQ0VcdTVERTZcdTRGQTdcdTkwMDlcdTYyRTlcdTYzRDBcdTRFQTRcdTY3RTVcdTc3MEIgZGlmZicsXG4gICdyZXZpZXcuc2VuZFRvQWdlbnQnOiAnXHU1M0QxXHU5MDAxXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW5kVGl0bGUnOiAnXHU1M0QxXHU5MDAxXHU4ODRDXHU1MTg1XHU4QkM0XHU4QkJBXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW5kSGludCc6ICdcdThCQzRcdThCQkFcdTRGMUFcdTRGNUNcdTRFM0FcdThCQzRcdTVCQTFcdTYzMDdcdTVGMTVcdTZDRThcdTUxNjVcdTVGNTNcdTUyNERcdTRGMUFcdThCRERcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMDlcdTMwMDJcdTUzRDFcdTkwMDFcdTU5MzFcdThEMjVcdTY1RjZcdTkwMDBcdTUzMTZcdTRFM0FcdTU5MERcdTUyMzZcdTY1ODdcdTY3MkNcdTMwMDInLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1x1NURGMlx1NTNEMVx1OTAwMVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuY29weSc6ICdcdTU5MERcdTUyMzZcdTY1ODdcdTY3MkMnLFxuICAncmV2aWV3LmNvcGllZCc6ICdcdTVERjJcdTU5MERcdTUyMzYnLFxuICAncmV2aWV3LmNvcHlGYWlsZWQnOiAnXHU1OTBEXHU1MjM2XHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnXHU4QkM0XHU1QkExJyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnXHU4QkM0XHU1QkExXHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnXHU4QkM0XHU1QkExXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCc6ICdcdTg4NjVcdTRFMDFcdTZCNjNcdTc4NkUgXHUyNzEzJyxcbiAgJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JzogJ1x1ODg2NVx1NEUwMVx1NUI1OFx1NTcyOFx1OTVFRVx1OTg5OCBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnXHU2Q0ExXHU2NzA5XHU1M0QxXHU3M0IwXHU5NUVFXHU5ODk4JyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gXHU2NzYxXHU1M0QxXHU3M0IwJyxcbiAgJ3Jldmlldy5jb25maWRlbmNlJzogJ1x1N0Y2RVx1NEZFMVx1NUVBNiB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnXHU1RUZBXHU4QkFFJyxcbiAgJ3Jldmlldy5zZW5kRmluZGluZ3MnOiAnXHU1M0QxXHU5MDAxXHU1M0QxXHU3M0IwXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW50RmluZGluZ3MnOiAnXHU1REYyXHU1M0QxXHU5MDAxXHU1M0QxXHU3M0IwXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdcdThCQzRcdTVCQTFcdTgzMDNcdTU2RjQnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIFx1OEJDNFx1OEJCQSAoe259KScsXG4gICdwci5ub1ByJzogJ1x1NjVFMFx1NTE3M1x1ODA1NCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnXHU1M0QxXHU5MDAxIFBSIFx1OEJDNFx1OEJCQVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnXHU1NzI4XHU3RjE2XHU4RjkxXHU1NjY4XHU0RTJEXHU2MjUzXHU1RjAwJyxcbiAgJ2VkaXRvci5vcGVuTGluZSc6ICdcdTU3MjhcdTdGMTZcdThGOTFcdTU2NjhcdTRFMkRcdTYyNTNcdTVGMDBcdThCRTVcdTg4NEMnLFxuICAnZWRpdG9yLmZhaWxlZCc6ICdcdTYyNTNcdTVGMDBcdTU5MzFcdThEMjUnLFxuICAncmVwby5sYWJlbCc6ICdcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3LmRvY2tDb21tZW50cyc6ICdcdTg4NENcdTUxODVcdThCQzRcdThCQkEge259IFx1Njc2MScsXG4gICdyZXZpZXcuZG9ja0p1bXAnOiAnXHU3MEI5XHU1MUZCXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU2MjUzXHU1RjAwXHU1QkY5XHU1RTk0XHU1M0Q4XHU2NkY0JyxcbiAgJ3Jldmlldy5kb2NrSGludCc6ICdcdTk2OEZcdTRFMEJcdTRFMDBcdTY3NjFcdTZEODhcdTYwNkZcdTgxRUFcdTUyQThcdTk2NDRcdTVFMjZcdUZGMDhcdTU0MkIgZGlmZiBcdTRFMEUgQUkgXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBXHVGRjA5JyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdzZXR0aW5ncy5mb250JzogJ1x1NUI1N1x1NEY1MycsXG4gICdzZXR0aW5ncy5zaXplJzogJ1x1NUI1N1x1NTNGNycsXG4gICdjb25maWcudGl0bGUnOiAnXHU5MTREXHU3RjZFJyxcbiAgJ2ZvbnQubW9ubyc6ICdcdTdCNDlcdTVCQkRcdUZGMDhcdTlFRDhcdThCQTRcdUZGMDknLFxuICAnZm9udC5zeXN0ZW0nOiAnXHU3Q0ZCXHU3RURGXHU1QjU3XHU0RjUzJyxcbn0gYXMgY29uc3RcblxuLyoqIEVuZ2xpc2ggZGljdGlvbmFyeSwgY2hlY2tlZCBjb21wbGV0ZSBhZ2FpbnN0IHRoZSB6aCBrZXkgc2V0LiAqL1xuY29uc3QgZW46IFJlY29yZDxrZXlvZiB0eXBlb2YgemgsIHN0cmluZz4gPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnQ2hhbmdlcycsXG4gICdhY3Rpb24uYXJpYSc6ICdSZXZpZXcgd29ya3NwYWNlIGFuZCBwZXItcm91bmQgY2hhbmdlcycsXG4gICd0YWIuc2Vzc2lvbic6ICdTZXNzaW9uJyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnV29ya3NwYWNlJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3Jldmlldy5icmFuY2gnOiAnYnJhbmNoJyxcbiAgJ3Jldmlldy5kZXRhY2hlZCc6ICdkZXRhY2hlZCBIRUFEJyxcbiAgJ3Jldmlldy5ub3RSZXBvJzogJ1RoaXMgZGlyZWN0b3J5IGlzIG5vdCBhIGdpdCByZXBvc2l0b3J5JyxcbiAgJ3Jldmlldy5ub3RSZXBvSGludCc6ICdUaGUgXCJTZXNzaW9uXCIgdGFiIHN0aWxsIHNob3dzIGV2ZXJ5IHJvdW5kXFwncyBjaGFuZ2VzLicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdObyBmaWxlIGNoYW5nZXMgcmVjb3JkZWQgaW4gdGhpcyBzZXNzaW9uIHlldCcsXG4gICdyZXZpZXcuc2Vzc2lvblN0YXRzJzogJ3tyb3VuZHN9IHJvdW5kcyBcdTAwQjcge2ZpbGVzfSBmaWxlcycsXG4gICdyZXZpZXcucm91bmQnOiAnUm91bmQge3JvdW5kfScsXG4gICdyZXZpZXcuZW1wdHknOiAnTm8gdW5jb21taXR0ZWQgY2hhbmdlcyBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdGYWlsZWQgdG8gbG9hZCcsXG4gICdyZXZpZXcuYWNjZXB0JzogJ0FjY2VwdCcsXG4gICdyZXZpZXcucmV2ZXJ0JzogJ1JldmVydCcsXG4gICdyZXZpZXcuYWNjZXB0QWxsJzogJ0FjY2VwdCBhbGwnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdSZXZlcnQgYWxsJyxcbiAgJ3Jldmlldy51bnN0YWdlJzogJ1Vuc3RhZ2UnLFxuICAncmV2aWV3LnVuc3RhZ2VBbGwnOiAnVW5zdGFnZSBhbGwnLFxuICAnaHVuay5zdGFnZSc6ICdTdGFnZScsXG4gICdodW5rLnJldmVydCc6ICdSZXZlcnQnLFxuICAnaHVuay51bnN0YWdlJzogJ1Vuc3RhZ2UnLFxuICAnaHVuay5zdGFnZWQnOiAnc3RhZ2VkJyxcbiAgJ2h1bmsudW5zdGFnZWQnOiAndW5zdGFnZWQnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQgYWxsJyxcbiAgJ3Jldmlldy5jb21taXQnOiAnQ29tbWl0JyxcbiAgJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcic6ICdDb21taXQgbWVzc2FnZVx1MjAyNicsXG4gICdyZXZpZXcucHVzaCc6ICdQdXNoJyxcbiAgJ3Jldmlldy5jb25maXJtUHVzaCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHB1c2gnLFxuICAncmV2aWV3LmNvbW1pdHRlZCc6ICdDb21taXR0ZWQge3N1bW1hcnl9JyxcbiAgJ3Jldmlldy5jb21taXRGYWlsZWQnOiAnQ29tbWl0IGZhaWxlZCcsXG4gICdyZXZpZXcucHVzaGVkJzogJ1B1c2hlZCcsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdQdXNoIGZhaWxlZCcsXG4gICdyZXZpZXcuYWhlYWQnOiAne259IGFoZWFkJyxcbiAgJ3Jldmlldy5iZWhpbmQnOiAne259IGJlaGluZCcsXG4gICdyZXZpZXcuc2VjdGlvblN0YWdlZCc6ICdTdGFnZWQnLFxuICAncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LnNlY3Rpb25CcmFuY2gnOiAnQnJhbmNoIHZzIHJlbW90ZScsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdubyB1cHN0cmVhbScsXG4gICdyZXZpZXcuaGlzdG9yeSc6ICdIaXN0b3J5JyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdGaWxlcycsXG4gICdoaXN0b3J5LmxvY2FsJzogJ2xvY2FsJyxcbiAgJ2hpc3RvcnkucmVtb3RlJzogJ3JlbW90ZScsXG4gICd0aW1lLm5vdyc6ICdqdXN0IG5vdycsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IG1pbiBhZ28nLFxuICAndGltZS5ob3Vycyc6ICd7bn0gaCBhZ28nLFxuICAndGltZS5kYXlzJzogJ3tufSBkIGFnbycsXG4gICdyZXZpZXcucmVmcmVzaCc6ICdSZWZyZXNoJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdDbG9zZScsXG4gICdyZXZpZXcuYnVzeSc6ICdXb3JraW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ3thY3Rpb259IHtjb3VudH0gZmlsZXMnLFxuICAncmV2aWV3LmRvbmVPbmUnOiAne2FjdGlvbn0ge3BhdGh9JyxcbiAgJ3Jldmlldy5kb25lRGVsZXRlZCc6ICd7YWN0aW9ufSB7Y291bnR9IGZpbGVzICh7ZGVsZXRlZH0gdW50cmFja2VkIGRlbGV0ZWQpJyxcbiAgJ3Jldmlldy5hY2NlcHRlZCc6ICdBY2NlcHRlZCcsXG4gICdyZXZpZXcucmV2ZXJ0ZWQnOiAnUmV2ZXJ0ZWQnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICd1bnRyYWNrZWQnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdiaW5hcnknLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnTm8gZGlmZiBkYXRhIGZvciB0aGlzIGNoYW5nZScsXG4gICdyZXZpZXcuY2hhbmdlcyc6ICd7YWRkZWR9KyB7ZGVsZXRlZH0tJyxcbiAgJ3ZpZXcuc2luZ2xlJzogJ1NpbmdsZScsXG4gICd2aWV3LnNwbGl0JzogJ1NwbGl0JyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ0JlZm9yZScsXG4gICd2aWV3LmFmdGVyJzogJ0FmdGVyJyxcbiAgJ2NvbW1lbnQuYWRkJzogJ0NvbW1lbnQgb24gdGhpcyBsaW5lJyxcbiAgJ2NvbW1lbnQuc2hvdyc6ICdWaWV3IGNvbW1lbnRzJyxcbiAgJ2NvbW1lbnQucGxhY2Vob2xkZXInOiAnQ29tbWVudFx1MjAyNiAoQ3RybC9cdTIzMTgrRW50ZXIgdG8gc2F2ZSknLFxuICAnY29tbWVudC5zYXZlJzogJ1NhdmUnLFxuICAnY29tbWVudC5jYW5jZWwnOiAnQ2FuY2VsJyxcbiAgJ2NvbW1lbnQuZGVsZXRlJzogJ0RlbGV0ZScsXG4gICdjb21tZW50LnNhdmVkJzogJ0NvbW1lbnQgc2F2ZWQnLFxuICAnY29tbWVudC5mYWlsZWQnOiAnRmFpbGVkIHRvIHNhdmUgY29tbWVudCcsXG4gICdzY29wZS5sYWJlbCc6ICdTY29wZScsXG4gICdzY29wZS5hbGwnOiAnQWxsJyxcbiAgJ3Njb3BlLnVuc3RhZ2VkJzogJ1Vuc3RhZ2VkJyxcbiAgJ3Njb3BlLnN0YWdlZCc6ICdTdGFnZWQnLFxuICAnc2NvcGUuY29tbWl0JzogJ0NvbW1pdCcsXG4gICdzY29wZS5icmFuY2gnOiAnQnJhbmNoJyxcbiAgJ3Njb3BlLmxhc3QtdHVybic6ICdMYXN0IHR1cm4nLFxuICAncmV2aWV3Lmxhc3RUdXJuRW1wdHknOiAnTm8gZmlsZSBjaGFuZ2VzIHJlY29yZGVkIGZvciB0aGUgbGFzdCB0dXJuIFx1MjAxNCB0ZXJtaW5hbCBjb21tYW5kcyAoYmFzaCkgdGhhdCBlZGl0IGZpbGVzIGFyZSBub3QgdHJhY2tlZCBpbiB0aGUgc2Vzc2lvbiBsb2c7IHN3aXRjaCB0byBcIkFsbFwiIHRvIHNlZSBnaXQgY2hhbmdlcycsXG4gICdzY29wZS5iYXNlJzogJ0Jhc2UgYnJhbmNoJyxcbiAgJ3Njb3BlLmJyYW5jaFJlYWRvbmx5JzogJ0JyYW5jaCBzY29wZSBpcyByZWFkLW9ubHkgKG1lcmdlLWJhc2UgZGlmZjsgbm8gYWNjZXB0L3JldmVydCknLFxuICAncmV2aWV3LnNlbGVjdENvbW1pdCc6ICdTZWxlY3QgYSBjb21taXQgZnJvbSB0aGUgbGVmdCB0byB2aWV3IGl0cyBkaWZmJyxcbiAgJ3Jldmlldy5zZW5kVG9BZ2VudCc6ICdTZW5kIHRvIGFnZW50JyxcbiAgJ3Jldmlldy5zZW5kVGl0bGUnOiAnU2VuZCBpbmxpbmUgY29tbWVudHMgdG8gdGhlIGFnZW50JyxcbiAgJ3Jldmlldy5zZW5kSGludCc6ICdDb21tZW50cyBhcmUgaW5qZWN0ZWQgaW50byB0aGUgY3VycmVudCBzZXNzaW9uIGFzIHJldmlldyBndWlkYW5jZSAoQWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzKS4gRmFsbHMgYmFjayB0byBjb3B5YWJsZSB0ZXh0IGlmIHNlbmRpbmcgZmFpbHMuJyxcbiAgJ3Jldmlldy5zZW50VG9BZ2VudCc6ICdTZW50IHRvIGFnZW50JyxcbiAgJ3Jldmlldy5jb3B5JzogJ0NvcHkgdGV4dCcsXG4gICdyZXZpZXcuY29waWVkJzogJ0NvcGllZCcsXG4gICdyZXZpZXcuY29weUZhaWxlZCc6ICdDb3B5IGZhaWxlZCcsXG4gICdyZXZpZXcucmV2aWV3JzogJ1JldmlldycsXG4gICdyZXZpZXcucmV2aWV3aW5nJzogJ1Jldmlld2luZ1x1MjAyNicsXG4gICdyZXZpZXcucmV2aWV3RmFpbGVkJzogJ1JldmlldyBmYWlsZWQnLFxuICAncmV2aWV3LnZlcmRpY3RDb3JyZWN0JzogJ1BhdGNoIGlzIGNvcnJlY3QgXHUyNzEzJyxcbiAgJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JzogJ1BhdGNoIG5lZWRzIHdvcmsgXHUyNzE3JyxcbiAgJ3Jldmlldy5ub0ZpbmRpbmdzJzogJ05vIGlzc3VlcyBmb3VuZCcsXG4gICdyZXZpZXcuZmluZGluZ3MnOiAne259IGZpbmRpbmdzJyxcbiAgJ3Jldmlldy5jb25maWRlbmNlJzogJ2NvbmZpZGVuY2Uge2NvbmZpZGVuY2V9JyxcbiAgJ3Jldmlldy5zdWdnZXN0aW9uJzogJ1N1Z2dlc3Rpb24nLFxuICAncmV2aWV3LnNlbmRGaW5kaW5ncyc6ICdTZW5kIGZpbmRpbmdzIHRvIGFnZW50JyxcbiAgJ3Jldmlldy5zZW50RmluZGluZ3MnOiAnRmluZGluZ3Mgc2VudCB0byBhZ2VudCcsXG4gICdyZXZpZXcucmV2aWV3U2NvcGUnOiAnUmV2aWV3IHNjb3BlJyxcbiAgJ3ByLnRpdGxlJzogJ1BSICN7bnVtYmVyfScsXG4gICdwci5jb21tZW50cyc6ICdQUiBjb21tZW50cyAoe259KScsXG4gICdwci5ub1ByJzogJ05vIGFzc29jaWF0ZWQgUFInLFxuICAncHIuc2VuZENvbW1lbnRzJzogJ1NlbmQgUFIgY29tbWVudHMgdG8gYWdlbnQnLFxuICAnZWRpdG9yLm9wZW5GaWxlJzogJ09wZW4gaW4gZWRpdG9yJyxcbiAgJ2VkaXRvci5vcGVuTGluZSc6ICdPcGVuIHRoaXMgbGluZSBpbiBlZGl0b3InLFxuICAnZWRpdG9yLmZhaWxlZCc6ICdGYWlsZWQgdG8gb3BlbicsXG4gICdyZXBvLmxhYmVsJzogJ1JlcG8nLFxuICAncmV2aWV3LmRvY2tDb21tZW50cyc6ICd7bn0gaW5saW5lIGNvbW1lbnRzJyxcbiAgJ3Jldmlldy5kb2NrSnVtcCc6ICdPcGVuIHRoZSBtYXRjaGluZyBjaGFuZ2UgaW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuZG9ja0hpbnQnOiAnQXV0by1jYXJyaWVkIHdpdGggeW91ciBuZXh0IG1lc3NhZ2UgKGRpZmYgKyBBSSB2ZXJkaWN0IGluY2x1ZGVkKScsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnRm9udCcsXG4gICdzZXR0aW5ncy5zaXplJzogJ0ZvbnQgc2l6ZScsXG4gICdjb25maWcudGl0bGUnOiAnQ29uZmlndXJhdGlvbicsXG4gICdmb250Lm1vbm8nOiAnTW9ub3NwYWNlIChkZWZhdWx0KScsXG4gICdmb250LnN5c3RlbSc6ICdTeXN0ZW0gZm9udCcsXG59XG5cbnR5cGUgRGlmZlJldmlld0FjdGlvblByb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucyc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5cbnR5cGUgRGlmZlJldmlld092ZXJsYXlQcm9wcyA9IFByb3BzUnVudGltZTwnc2hlbGwub3ZlcmxheSc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7IHNlc3Npb25zOiBJU2Vzc2lvbnMgfVxuXG4vKiogRGlmZiBpY29uIChsdWNpZGUgZmlsZS1kaWZmKS4gKi9cbmZ1bmN0aW9uIEljb25EaWZmKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWN1pcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDEwaDZcIiAvPlxuICAgICAgPHBhdGggZD1cIk0xMiA3djZcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDE3aDZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25YKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xOCA2IDYgMThcIiAvPlxuICAgICAgPHBhdGggZD1cIm02IDYgMTIgMTJcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25Db21tZW50KCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMSAxNWEyIDIgMCAwIDEtMiAySDdsLTQgNFY1YTIgMiAwIDAgMSAyLTJoMTRhMiAyIDAgMCAxIDIgMnpcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGV2cm9uRG93bigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJtNiA5IDYgNiA2LTZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGVjaygpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMi41XCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMCA2IDkgMTdsLTUtNVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxudHlwZSBWaWV3TW9kZSA9ICdzaW5nbGUnIHwgJ3NwbGl0J1xuXG4vKiogXHU1MzU1XHU2ODBGIC8gXHU1M0NDXHU2ODBGIHNlZ21lbnRlZCB0b2dnbGUgKHBlcnNpc3RlZCBhY3Jvc3Mgb3BlbnMpLiAqL1xuZnVuY3Rpb24gRGlmZlZpZXdUb2dnbGUoeyB2aWV3LCBvbkNoYW5nZSwgdCB9OiB7IHZpZXc6IFZpZXdNb2RlOyBvbkNoYW5nZTogKHY6IFZpZXdNb2RlKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci12aWV3LXRvZ2dsZVwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9e3QoJ3ZpZXcuc2luZ2xlJyl9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NpbmdsZScgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NpbmdsZSd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKCdzaW5nbGUnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc2luZ2xlJyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRzZHItdmlldy1idG4ke3ZpZXcgPT09ICdzcGxpdCcgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NwbGl0J31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NwbGl0Jyl9XG4gICAgICA+XG4gICAgICAgIHt0KCd2aWV3LnNwbGl0Jyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVHdvLWNvbHVtbiBzaWRlLWJ5LXNpZGUgZGlmZiBib2R5IChvbGQgbGVmdCwgbmV3IHJpZ2h0LCBsaW5lIG51bWJlcnMgYWxpZ25lZCkuICovXG5mdW5jdGlvbiBTcGxpdERpZmYoeyBibG9ja3MsIGJlZm9yZUxhYmVsLCBhZnRlckxhYmVsIH06IHsgYmxvY2tzOiBTcGxpdEJsb2NrW107IGJlZm9yZUxhYmVsOiBzdHJpbmc7IGFmdGVyTGFiZWw6IHN0cmluZyB9KSB7XG4gIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPntiZWZvcmVMYWJlbH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPnthZnRlckxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICA8ZGl2IGtleT17Yml9PlxuICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IChcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e3JpfSBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5sZWZ0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogUGVyLWh1bmsgYWN0aW9uIGJhciAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KSBmb3Igd29ya3NwYWNlIGRpZmZzLiAqL1xuZnVuY3Rpb24gSHVua1Rvb2xiYXIoe1xuICBodW5rLFxuICBidXN5LFxuICBvbkFjdGlvbixcbiAgdCxcbn06IHtcbiAgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuayB8IHVuZGVmaW5lZFxuICBidXN5OiBib29sZWFuXG4gIG9uQWN0aW9uOiAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICBpZiAoIWh1bmspIHJldHVybiBudWxsXG4gIGNvbnN0IHN0YWdlZCA9IGh1bmsubGF5ZXIgPT09ICdzdGFnZWQnXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWh1bmstYmFyXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWh1bmstbGF5ZXJcIj57c3RhZ2VkID8gdCgnaHVuay5zdGFnZWQnKSA6IHQoJ2h1bmsudW5zdGFnZWQnKX08L3NwYW4+XG4gICAgICB7c3RhZ2VkID8gKFxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigndW5zdGFnZScsIGh1bmspfT5cbiAgICAgICAgICB7dCgnaHVuay51bnN0YWdlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IChcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbignYWNjZXB0JywgaHVuayl9PlxuICAgICAgICAgIHt0KCdodW5rLnN0YWdlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKX1cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigncmV2ZXJ0JywgaHVuayl9PlxuICAgICAgICB7dCgnaHVuay5yZXZlcnQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBIdW5rcyBvZiBgZGlmZmAgd2hvc2Ugb2xkIG9yIG5ldyBsaW5lIHJhbmdlIGNvdmVycyBhbnkgb2YgYGxpbmVzYC4gKi9cbmZ1bmN0aW9uIGh1bmtzRm9yTGluZXMoZGlmZjogc3RyaW5nLCBsaW5lczogKG51bWJlciB8IG51bGwpW10pOiBzdHJpbmcge1xuICBjb25zdCB0YXJnZXRzID0gbmV3IFNldChsaW5lcy5maWx0ZXIoKGwpOiBsIGlzIG51bWJlciA9PiBsICE9PSBudWxsKSlcbiAgaWYgKHRhcmdldHMuc2l6ZSA9PT0gMCkgcmV0dXJuICcnXG4gIGNvbnN0IGJsb2NrcyA9IHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2YgYmxvY2tzKSB7XG4gICAgaWYgKGJsb2NrLmhlYWQ/LmtpbmQgIT09ICdodW5rJykgY29udGludWVcbiAgICBjb25zdCBzdGFydHMgPSBodW5rU3RhcnRzKGJsb2NrLmhlYWQudGV4dClcbiAgICBsZXQgb2xkTGluZSA9IHN0YXJ0cy5vbGRTdGFydFxuICAgIGxldCBuZXdMaW5lID0gc3RhcnRzLm5ld1N0YXJ0XG4gICAgbGV0IG9NaW4gPSBJbmZpbml0eVxuICAgIGxldCBvTWF4ID0gLUluZmluaXR5XG4gICAgbGV0IG5NaW4gPSBJbmZpbml0eVxuICAgIGxldCBuTWF4ID0gLUluZmluaXR5XG4gICAgZm9yIChjb25zdCByb3cgb2YgYmxvY2sucm93cykge1xuICAgICAgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgICBpZiAob2xkTGluZSA8IG9NaW4pIG9NaW4gPSBvbGRMaW5lXG4gICAgICAgIGlmIChvbGRMaW5lID4gb01heCkgb01heCA9IG9sZExpbmVcbiAgICAgICAgaWYgKG5ld0xpbmUgPCBuTWluKSBuTWluID0gbmV3TGluZVxuICAgICAgICBpZiAobmV3TGluZSA+IG5NYXgpIG5NYXggPSBuZXdMaW5lXG4gICAgICAgIG9sZExpbmUrK1xuICAgICAgICBuZXdMaW5lKytcbiAgICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdhZGQnKSB7XG4gICAgICAgIGlmIChuZXdMaW5lIDwgbk1pbikgbk1pbiA9IG5ld0xpbmVcbiAgICAgICAgaWYgKG5ld0xpbmUgPiBuTWF4KSBuTWF4ID0gbmV3TGluZVxuICAgICAgICBuZXdMaW5lKytcbiAgICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdkZWwnKSB7XG4gICAgICAgIGlmIChvbGRMaW5lIDwgb01pbikgb01pbiA9IG9sZExpbmVcbiAgICAgICAgaWYgKG9sZExpbmUgPiBvTWF4KSBvTWF4ID0gb2xkTGluZVxuICAgICAgICBvbGRMaW5lKytcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGl0ID0gWy4uLnRhcmdldHNdLnNvbWUoXG4gICAgICAobCkgPT4gKG9NaW4gPD0gbCAmJiBsIDw9IG9NYXgpIHx8IChuTWluIDw9IGwgJiYgbCA8PSBuTWF4KSxcbiAgICApXG4gICAgaWYgKGhpdCkgcGFydHMucHVzaChbYmxvY2suaGVhZC50ZXh0LCAuLi5ibG9jay5yb3dzLm1hcCgocikgPT4gci50ZXh0KV0uam9pbignXFxuJykpXG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJ1xcbicpXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgcm93cyB3aXRoIG9sZC9uZXcgbGluZSBudW1iZXJzIHRyYWNrZWQgdGhyb3VnaCBodW5rcy4gKi9cbmZ1bmN0aW9uIHVuaWZpZWRSb3dzV2l0aExpbmVzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSB7XG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICByZXR1cm4gcm93cy5tYXAoKHJvdykgPT4ge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBuZXdMaW5lKysgfVxuICAgIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbmV3TGluZSsrIH1cbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbnVsbCB9XG4gICAgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBudWxsIH1cbiAgfSlcbn1cblxuLyoqIE1hdGNoIGEgY29tbWVudCBhZ2FpbnN0IGEgcm93J3MgYW5jaG9ycyAoYm90aCBtdXN0IGFncmVlIHdoZW4gc2V0KS4gKi9cbmZ1bmN0aW9uIGNvbW1lbnRNYXRjaGVzKGNvbW1lbnQ6IFJldmlld0NvbW1lbnQsIG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBib29sZWFuIHtcbiAgaWYgKGNvbW1lbnQubGluZU5ldyAhPT0gbnVsbCAmJiBjb21tZW50LmxpbmVOZXcgIT09IG5ld0xpbmUpIHJldHVybiBmYWxzZVxuICBpZiAoY29tbWVudC5saW5lT2xkICE9PSBudWxsICYmIGNvbW1lbnQubGluZU9sZCAhPT0gb2xkTGluZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB0cnVlXG59XG5cbi8qKiBIb3Zlci10by1jb21tZW50IGFmZm9yZGFuY2UgKyBjb21tZW50IG1hcmtlciBmb3Igb25lIGRpZmYgbGluZS4gKi9cbmZ1bmN0aW9uIENvbW1lbnRMaW5lKHtcbiAgY291bnQsXG4gIG9wZW4sXG4gIG9uT3BlbixcbiAgb25Ub2dnbGUsXG4gIHQsXG59OiB7XG4gIGNvdW50OiBudW1iZXJcbiAgb3BlbjogYm9vbGVhblxuICBvbk9wZW46ICgpID0+IHZvaWRcbiAgb25Ub2dnbGU6ICgpID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLWNvbW1lbnQtYWRkJHtjb3VudCA+IDAgPyAnIGRzZHItY29tbWVudC1oYXMnIDogJyd9YH1cbiAgICAgIHRpdGxlPXtjb3VudCA+IDAgPyB0KCdjb21tZW50LnNob3cnKSA6IHQoJ2NvbW1lbnQuYWRkJyl9XG4gICAgICBhcmlhLWxhYmVsPXtjb3VudCA+IDAgPyB0KCdjb21tZW50LnNob3cnKSA6IHQoJ2NvbW1lbnQuYWRkJyl9XG4gICAgICBvbkNsaWNrPXtjb3VudCA+IDAgPyBvblRvZ2dsZSA6IG9uT3Blbn1cbiAgICA+XG4gICAgICB7Y291bnQgPiAwID8gY291bnQgOiAnKyd9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLyoqIFRoZSBpbmxpbmUgY29tbWVudCBlZGl0b3IsIHJlbmRlcmVkIGFzIGl0cyBvd24gcm93LiAqL1xuZnVuY3Rpb24gQ29tbWVudEVkaXRvcih7XG4gIHRleHQsXG4gIG9uVGV4dCxcbiAgb25TYXZlLFxuICBvbkNhbmNlbCxcbiAgYnVzeSxcbiAgdCxcbn06IHtcbiAgdGV4dDogc3RyaW5nXG4gIG9uVGV4dDogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvblNhdmU6ICgpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgYnVzeTogYm9vbGVhblxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1lZGl0b3JcIj5cbiAgICAgIDx0ZXh0YXJlYVxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaW5wdXRcIlxuICAgICAgICB2YWx1ZT17dGV4dH1cbiAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgIHJvd3M9ezJ9XG4gICAgICAgIHBsYWNlaG9sZGVyPXt0KCdjb21tZW50LnBsYWNlaG9sZGVyJyl9XG4gICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uVGV4dChldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICBvbktleURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBvbkNhbmNlbCgpXG4gICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSkgb25TYXZlKClcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCAhdGV4dC50cmltKCl9IG9uQ2xpY2s9e29uU2F2ZX0+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuc2F2ZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17b25DYW5jZWx9PlxuICAgICAgICAgIHt0KCdjb21tZW50LmNhbmNlbCcpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgd2l0aCBwZXItaHVuayBhY3Rpb24gYmFycyBhbmQgaW5saW5lIGNvbW1lbnRzICh3b3Jrc3BhY2UgZmlsZXMpLiAqL1xuZnVuY3Rpb24gVW5pZmllZERpZmYoe1xuICBkaWZmLFxuICBodW5rcyxcbiAgYnVzeSxcbiAgb25IdW5rQWN0aW9uLFxuICB0LFxuICBjb21tZW50cyxcbiAgY29tbWVudEVkaXRvcixcbiAgY29tbWVudFRleHQsXG4gIG9uQ29tbWVudFRleHQsXG4gIG9uT3BlbkNvbW1lbnQsXG4gIG9uU2F2ZUNvbW1lbnQsXG4gIG9uQ2FuY2VsQ29tbWVudCxcbiAgY29tbWVudFBvcG92ZXIsXG4gIG9uVG9nZ2xlUG9wb3ZlcixcbiAgb25EZWxldGVDb21tZW50LFxuICByZWFkT25seSxcbiAgcGF0aCxcbiAgcmV2aWV3RmluZGluZ3MsXG4gIG9uT3BlbkxpbmUsXG4gIGp1bXBMaW5lLFxufToge1xuICBkaWZmOiBzdHJpbmdcbiAgaHVua3M6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmtbXVxuICBidXN5OiBib29sZWFuXG4gIG9uSHVua0FjdGlvbjogKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuaykgPT4gdm9pZFxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbiAgY29tbWVudHM/OiBSZXZpZXdDb21tZW50W11cbiAgY29tbWVudEVkaXRvcj86IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbFxuICBjb21tZW50VGV4dD86IHN0cmluZ1xuICBvbkNvbW1lbnRUZXh0PzogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvbk9wZW5Db21tZW50PzogKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpID0+IHZvaWRcbiAgb25TYXZlQ29tbWVudD86ICgpID0+IHZvaWRcbiAgb25DYW5jZWxDb21tZW50PzogKCkgPT4gdm9pZFxuICBjb21tZW50UG9wb3Zlcj86IHN0cmluZyB8IG51bGxcbiAgb25Ub2dnbGVQb3BvdmVyPzogKGtleTogc3RyaW5nKSA9PiB2b2lkXG4gIG9uRGVsZXRlQ29tbWVudD86IChpZDogc3RyaW5nKSA9PiB2b2lkXG4gIC8qKiBIaWRlIHBlci1odW5rIGFjdGlvbiBiYXJzIChicmFuY2ggc2NvcGUgaXMgYSByZWFkLW9ubHkgZGlmZikuICovXG4gIHJlYWRPbmx5PzogYm9vbGVhblxuICAvKiogUmVwby1yZWxhdGl2ZSBmaWxlIHBhdGggKGZvciBvcGVuLWluLWVkaXRvciBhbmQgbWFya2VycykuICovXG4gIHBhdGg/OiBzdHJpbmdcbiAgLyoqIEFJLXJldmlldyBmaW5kaW5ncyB0byBtYXJrIG9uIG1hdGNoaW5nIGxpbmVzLiAqL1xuICByZXZpZXdGaW5kaW5ncz86IFJldmlld0ZpbmRpbmdbXVxuICAvKiogT3BlbiB0aGUgZmlsZSBhdCBhIGxpbmUgaW4gdGhlIHVzZXIncyBlZGl0b3IuICovXG4gIG9uT3BlbkxpbmU/OiAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IHZvaWRcbiAgLyoqIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoZS5nLiBqdW1wIGZyb20gYSBQUiBjb21tZW50KS4gKi9cbiAganVtcExpbmU/OiBudW1iZXIgfCBudWxsXG59KSB7XG4gIGNvbnN0IGJsb2NrcyA9IHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gIGxldCBodW5rSW5kZXggPSAwXG4gIGNvbnN0IGVkaXRpbmdLZXkgPSBjb21tZW50RWRpdG9yID8gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgOiBudWxsXG4gIGNvbnN0IGZpbmRpbmdzRm9yID0gKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBSZXZpZXdGaW5kaW5nW10gPT4ge1xuICAgIGlmICghcGF0aCB8fCAhcmV2aWV3RmluZGluZ3MgfHwgcmV2aWV3RmluZGluZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgICByZXR1cm4gcmV2aWV3RmluZGluZ3MuZmlsdGVyKChmKSA9PiB7XG4gICAgICBpZiAoZi5maWxlICE9PSBwYXRoKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChuZXdMaW5lICE9PSBudWxsKSByZXR1cm4gbmV3TGluZSA+PSBmLmxpbmVTdGFydCAmJiBuZXdMaW5lIDw9IGYubGluZUVuZFxuICAgICAgcmV0dXJuIG9sZExpbmUgIT09IG51bGwgJiYgb2xkTGluZSA+PSBmLmxpbmVTdGFydCAmJiBvbGRMaW5lIDw9IGYubGluZUVuZFxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzSHVuayA9IGJsb2NrLmhlYWQ/LmtpbmQgPT09ICdodW5rJ1xuICAgICAgICAgIGNvbnN0IGh1bmsgPSBpc0h1bmsgPyBodW5rc1todW5rSW5kZXgrK10gOiB1bmRlZmluZWRcbiAgICAgICAgICBjb25zdCBzdGFydHMgPSBibG9jay5oZWFkPy5raW5kID09PSAnaHVuaycgPyBodW5rU3RhcnRzKGJsb2NrLmhlYWQudGV4dCkgOiB7IG9sZFN0YXJ0OiAxLCBuZXdTdGFydDogMSB9XG4gICAgICAgICAgY29uc3Qgcm93cyA9IGlzSHVuayA/IHVuaWZpZWRSb3dzV2l0aExpbmVzKGJsb2NrLnJvd3MsIHN0YXJ0cy5vbGRTdGFydCwgc3RhcnRzLm5ld1N0YXJ0KSA6IFtdXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2JpfT5cbiAgICAgICAgICAgICAge2lzSHVuayAmJiAhcmVhZE9ubHkgPyA8SHVua1Rvb2xiYXIgaHVuaz17aHVua30gYnVzeT17YnVzeX0gb25BY3Rpb249e29uSHVua0FjdGlvbn0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke2Jsb2NrLmhlYWQua2luZH1gfT57YmxvY2suaGVhZC50ZXh0IHx8ICcgJ308L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICB7aXNIdW5rXG4gICAgICAgICAgICAgICAgPyByb3dzLm1hcCgoeyByb3csIG9sZExpbmUsIG5ld0xpbmUgfSwgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7b2xkTGluZSA/PyAnbyd9OiR7bmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dDb21tZW50cyA9IGNvbW1lbnRzPy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIG9sZExpbmUsIG5ld0xpbmUpKSA/PyBbXVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IGZpbmRpbmdzRm9yKG9sZExpbmUsIG5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVkaXRpbmcgPSBlZGl0aW5nS2V5ID09PSBrZXlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvd0FjdGlvbnMgPSByb3cua2luZCA9PT0gJ2N0eCcgfHwgcm93LmtpbmQgPT09ICdhZGQnIHx8IHJvdy5raW5kID09PSAnZGVsJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5nQ2xzID0gZmluZGluZ3MubGVuZ3RoID4gMCA/IGAgZHNkci1saW5lLWZpbmRpbmcgZHNkci1maW5kaW5nLSR7ZmluZGluZ3NbMF0ucHJpb3JpdHl9YCA6ICcnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGp1bXBlZCA9IGp1bXBMaW5lICE9IG51bGwgJiYgKG5ld0xpbmUgPT09IGp1bXBMaW5lIHx8IChuZXdMaW5lID09PSBudWxsICYmIG9sZExpbmUgPT09IGp1bXBMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH0ke3Jvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAnIGRzZHItbGluZS1jb21tZW50ZWQnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWxpbmUtanVtcCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17bmV3TGluZSA/PyBvbGRMaW5lID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLW51bVwiPntuZXdMaW5lID8/IG9sZExpbmUgPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtdGV4dFwiPntyb3cudGV4dCB8fCAnICd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9IHRpdGxlPXtmaW5kaW5nc1swXS50aXRsZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzWzBdLnByaW9yaXR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAxID8gYFx1MDBENyR7ZmluZGluZ3MubGVuZ3RofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cGF0aCAmJiBvbk9wZW5MaW5lICYmIChuZXdMaW5lID8/IG9sZExpbmUpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1vcGVubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbkxpbmUocGF0aCwgbmV3TGluZSA/PyBvbGRMaW5lID8/IDEpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e3Jvd0NvbW1lbnRzLmxlbmd0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Blbj17Y29tbWVudFBvcG92ZXIgPT09IGtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiBvbk9wZW5Db21tZW50Py4ob2xkTGluZSwgbmV3TGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBvblRvZ2dsZVBvcG92ZXI/LihrZXkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0PXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyAmJiByb3dDb21tZW50cy5sZW5ndGggPiAwICYmIGNvbW1lbnRQb3BvdmVyID09PSBrZXkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtcG9wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93Q29tbWVudHMubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjb21tZW50LmlkfSBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXRleHRcIj57Y29tbWVudC50ZXh0fTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjb21tZW50LnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tZGFuZ2VyXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRGVsZXRlQ29tbWVudD8uKGNvbW1lbnQuaWQpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuZGVsZXRlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlZGl0aW5nID8gPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHQgPz8gJyd9IG9uVGV4dD17b25Db21tZW50VGV4dCA/PyAoKCkgPT4ge30pfSBvblNhdmU9e29uU2F2ZUNvbW1lbnQgPz8gKCgpID0+IHt9KX0gb25DYW5jZWw9e29uQ2FuY2VsQ29tbWVudCA/PyAoKCkgPT4ge30pfSBidXN5PXtidXN5fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA6IGJsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyaX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgIDwvcHJlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuLyoqIERyYWcgaGFuZGxlIGZvciByZXNpemluZyB0aGUgcGFuZWwgKGVhc3QgLyBzb3V0aCAvIHNvdXRoLWVhc3QpLiAqL1xuZnVuY3Rpb24gUmVzaXplSGFuZGxlKHsgbW9kZSwgb25SZXNpemUgfTogeyBtb2RlOiAnZScgfCAncycgfCAnc2UnOyBvblJlc2l6ZTogKGR4OiBudW1iZXIsIGR5OiBudW1iZXIpID0+IHZvaWQgfSkge1xuICBjb25zdCBsYXN0ID0gdXNlUmVmPHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1yZXNpemUgZHNkci1yZXNpemUtJHttb2RlfWB9XG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWxhc3QuY3VycmVudCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGR4ID0gZXZlbnQuY2xpZW50WCAtIGxhc3QuY3VycmVudC54XG4gICAgICAgIGNvbnN0IGR5ID0gZXZlbnQuY2xpZW50WSAtIGxhc3QuY3VycmVudC55XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGlmIChkeCAhPT0gMCB8fCBkeSAhPT0gMCkgb25SZXNpemUoZHgsIGR5KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXsoZXZlbnQpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0gbnVsbFxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXsoKSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgIH19XG4gICAgLz5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoaXBDbGFzcyhzdGF0dXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHMgPSBzdGF0dXMucmVwbGFjZSgvXFxzL2csICcnKVxuICBpZiAocy5pbmNsdWRlcygnPz8nKSkgcmV0dXJuICdkc2RyLWNoaXAtdSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnQScpIHx8IHMuaW5jbHVkZXMoJ0EnKSkgcmV0dXJuICdkc2RyLWNoaXAtYSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnRCcpIHx8IHMuaW5jbHVkZXMoJ0QnKSkgcmV0dXJuICdkc2RyLWNoaXAtZCdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnUicpIHx8IHMuaW5jbHVkZXMoJ1InKSkgcmV0dXJuICdkc2RyLWNoaXAtcidcbiAgcmV0dXJuICdkc2RyLWNoaXAtbSdcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFN0YXR1cyhjd2Q6IHN0cmluZyk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgc3RhdHVzIHJlcXVlc3QgZmFpbGVkOiAke3Jlcy5zdGF0dXN9YClcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpKSBhcyBTdGF0dXNSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhcHBseUNoYW5nZXMoY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZyk6IFByb21pc2U8QXBwbHlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgYWN0aW9uLCBwYXRoIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQXBwbHlSZXNwb25zZVxufVxuXG4vKiogQXBwbHkgb25lIGh1bmsgb2Ygb25lIGZpbGUgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkuICovXG5hc3luYyBmdW5jdGlvbiBhcHBseUh1bmsoY3dkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBzdHJpbmcpOiBQcm9taXNlPEFwcGx5SHVua1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEFQUExZX0hVTktfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHBhdGgsIGFjdGlvbiwgaHVuayB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEFwcGx5SHVua1Jlc3BvbnNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bkdpdEFjdGlvbihjd2Q6IHN0cmluZywgYWN0aW9uOiAnY29tbWl0JyB8ICdwdXNoJywgbWVzc2FnZT86IHN0cmluZyk6IFByb21pc2U8R2l0UmVzcG9uc2U+IHtcbiAgY29uc3QgdXJsID0gYWN0aW9uID09PSAnY29tbWl0JyA/IENPTU1JVF9VUkwgOiBQVVNIX1VSTFxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShhY3Rpb24gPT09ICdjb21taXQnID8geyBjd2QsIG1lc3NhZ2UgfSA6IHsgY3dkIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgR2l0UmVzcG9uc2Vcbn1cblxuLyoqIExvY2FsICh1bnB1c2hlZCkgY29tbWl0cyBhaGVhZCBvZiB0aGUgdXBzdHJlYW0uICovXG5hc3luYyBmdW5jdGlvbiBsb2FkSGlzdG9yeShjd2Q6IHN0cmluZyk6IFByb21pc2U8SGlzdG9yeVJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0hJU1RPUllfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21taXRzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEhpc3RvcnlSZXNwb25zZVxufVxuXG4vKiogT25lIGNvbW1pdCdzIHVuaWZpZWQgZGlmZi4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRDb21taXREaWZmKGN3ZDogc3RyaW5nLCBoYXNoOiBzdHJpbmcpOiBQcm9taXNlPENvbW1pdERpZmZSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtDT01NSVRfRElGRl9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfSZoYXNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGhhc2gpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGRpZmY6ICcnLCBmaWxlczogW10sIGFkZGVkOiAwLCBkZWxldGVkOiAwLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQ29tbWl0RGlmZlJlc3BvbnNlXG59XG5cbi8qKiBJbmxpbmUgcmV2aWV3IGNvbW1lbnRzIGZvciB0aGUgd29ya3NwYWNlIChyZXBvLXNjb3BlZCkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWVudHMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFJldmlld0NvbW1lbnRbXT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtDT01NRU5UU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1lbnRzOiBbXSB9KSkpIGFzIENvbW1lbnRzUmVzcG9uc2VcbiAgcmV0dXJuIGRhdGEub2sgPyBkYXRhLmNvbW1lbnRzIDogW11cbn1cblxuLyoqIFJlcGxhY2UgdGhlIHdob2xlIGNvbW1lbnQgbGlzdCAoc2luZ2xlLXVzZXIgcmVwbGFjZSBzZW1hbnRpY3MpLiAqL1xuYXN5bmMgZnVuY3Rpb24gc2F2ZUNvbW1lbnRzKGN3ZDogc3RyaW5nLCBjb21tZW50czogUmV2aWV3Q29tbWVudFtdKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKENPTU1FTlRTX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBjb21tZW50cyB9KSxcbiAgfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSB9KSkpIGFzIENvbW1lbnRzUmVzcG9uc2VcbiAgcmV0dXJuIGRhdGEub2sgPT09IHRydWVcbn1cblxuLyoqIExvY2FsIGJyYW5jaCBuYW1lcyAoZm9yIHRoZSBCcmFuY2ggcmV2aWV3IHNjb3BlKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRCcmFuY2hlcyhjd2Q6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7QlJBTkNIRVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBicmFuY2hlczogW10gfSkpKSBhcyB7IG9rOiBib29sZWFuOyBicmFuY2hlczogc3RyaW5nW10gfVxuICByZXR1cm4gZGF0YS5vayA/IGRhdGEuYnJhbmNoZXMgOiBbXVxufVxuXG4vKiogUnVuIGFuIEFJIHJldmlldyBvdmVyIHRoZSBnaXZlbiBzY29wZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJ1blJldmlldyhjd2Q6IHN0cmluZywgc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBzY29wZTogJ3VuY29tbWl0dGVkJyB8ICdicmFuY2gnIHwgJ2NvbW1pdCcsIGJhc2U/OiBzdHJpbmcsIGNvbW1pdEhhc2g/OiBzdHJpbmcpOiBQcm9taXNlPFJldmlld1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFJFVklFV19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgc2Vzc2lvbklkOiBzZXNzaW9uSWQgPz8gdW5kZWZpbmVkLCBzY29wZSwgYmFzZSwgY29tbWl0SGFzaCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZmluZGluZ3M6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUmV2aWV3UmVzcG9uc2Vcbn1cblxuLyoqIEN1cnJlbnQgYnJhbmNoJ3MgR2l0SHViIFBSIGNvbnRleHQgKGRlZ3JhZGVzIGdyYWNlZnVsbHkgd2l0aG91dCBnaCkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkUHIoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFByUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7UFJfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21tZW50czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBQclJlc3BvbnNlXG59XG5cbi8qKiBHaXQgcmVwb3MgdW5kZXIgYSB3b3Jrc3BhY2UgKG11bHRpLXJlcG8gc2VsZWN0b3IpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZFJlcG9zKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxSZXBvc1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1JFUE9TX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgcmVwb3M6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUmVwb3NSZXNwb25zZVxufVxuXG4vKiogT3BlbiBhIGZpbGUgKG9wdGlvbmFsbHkgYXQgYSBsaW5lKSBpbiB0aGUgdXNlcidzIGVkaXRvciB2aWEgb3Blbi1lZGl0b3IuICovXG5hc3luYyBmdW5jdGlvbiBvcGVuSW5FZGl0b3IoY3dkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlcik6IFByb21pc2U8eyBvazogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICBjb25zdCBhYnMgPSBwYXRoLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocGF0aCkgPyBwYXRoIDogYCR7Y3dkfS8ke3BhdGh9YFxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChPUEVOX0VESVRPUl9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHBhdGg6IGFicywgbGluZSB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIHsgb2s6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH1cbn1cblxuLyoqIFNob3J0IHJlbGF0aXZlIHRpbWUgZm9yIGNvbW1pdCByb3dzIChcImp1c3Qgbm93XCIgLyBcIjMgbWluIGFnb1wiIC8gXHUyMDI2KS4gKi9cbmZ1bmN0aW9uIHJlbGF0aXZlVGltZShpc286IHN0cmluZywgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoKERhdGUubm93KCkgLSBuZXcgRGF0ZShpc28pLmdldFRpbWUoKSkgLyA2MDAwMClcbiAgaWYgKG1pbnV0ZXMgPCAxKSByZXR1cm4gdCgndGltZS5ub3cnKVxuICBpZiAobWludXRlcyA8IDYwKSByZXR1cm4gdCgndGltZS5taW51dGVzJywgeyBuOiBtaW51dGVzIH0pXG4gIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApXG4gIGlmIChob3VycyA8IDI0KSByZXR1cm4gdCgndGltZS5ob3VycycsIHsgbjogaG91cnMgfSlcbiAgcmV0dXJuIHQoJ3RpbWUuZGF5cycsIHsgbjogTWF0aC5mbG9vcihob3VycyAvIDI0KSB9KVxufVxuXG4vKiogVGhlbWUtYXdhcmUgZHJvcGRvd24gcmVwbGFjaW5nIG5hdGl2ZSA8c2VsZWN0PiAobmF0aXZlIHBvcHVwcyBpZ25vcmUgdGhlIHRoZW1lKS4gKi9cbmZ1bmN0aW9uIFRoZW1lU2VsZWN0KHtcbiAgdmFsdWUsXG4gIG9wdGlvbnMsXG4gIG9uQ2hhbmdlLFxuICBhcmlhTGFiZWwsXG59OiB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgb3B0aW9uczogeyB2YWx1ZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH1bXVxuICBvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWRcbiAgYXJpYUxhYmVsPzogc3RyaW5nXG59KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCByb290UmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKVxuICBjb25zdCBjdXJyZW50ID0gb3B0aW9ucy5maW5kKChvKSA9PiBvLnZhbHVlID09PSB2YWx1ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghb3BlbikgcmV0dXJuXG4gICAgY29uc3QgY2xvc2VPdXRzaWRlID0gKGV2ZW50OiBQb2ludGVyRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmICFyb290UmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGNvbnN0IGNsb3NlT25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGNsb3NlT3V0c2lkZSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2xvc2VPbktleSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBjbG9zZU91dHNpZGUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2xvc2VPbktleSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWxcIiByZWY9e3Jvb3RSZWZ9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1zZWwtdHJpZ2dlclwiXG4gICAgICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICAgICAgYXJpYS1leHBhbmRlZD17b3Blbn1cbiAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVsfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2KSA9PiAhdil9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLXZhbHVlXCI+e2N1cnJlbnQ/LmxhYmVsID8/IHZhbHVlfTwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93biAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cImRzZHItc2VsLW1lbnVcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgICAge29wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgICAgIDxsaSBrZXk9e29wdGlvbi52YWx1ZX0gcm9sZT1cIm5vbmVcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e29wdGlvbi52YWx1ZSA9PT0gdmFsdWV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zZWwtb3B0aW9uJHtvcHRpb24udmFsdWUgPT09IHZhbHVlID8gJyBkc2RyLXNlbC1vcHRpb24tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgb25DaGFuZ2Uob3B0aW9uLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtb3B0aW9uLW1hcmtcIj57b3B0aW9uLnZhbHVlID09PSB2YWx1ZSA/IDxJY29uQ2hlY2sgLz4gOiBudWxsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC1vcHRpb24tbGFiZWxcIj57b3B0aW9uLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3VsPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIERpZmYgZm9udCArIGZvbnQgc2l6ZSBjb250cm9scyAoc2hhcmVkIHByZWZzIHN0b3JlKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdQcmVmcyh7IHQgfTogeyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWZpZWxkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWxhYmVsXCIgaWQ9XCJkc2RyLXByZWYtZm9udC1sYWJlbFwiPnt0KCdzZXR0aW5ncy5mb250Jyl9PC9zcGFuPlxuICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLmZvbnQnKX1cbiAgICAgICAgICB2YWx1ZT17cHJlZnMuZm9udH1cbiAgICAgICAgICBvcHRpb25zPXtGT05UX09QVElPTlMubWFwKChmKSA9PiAoeyB2YWx1ZTogZi5pZCwgbGFiZWw6IGYubGFiZWwuc3RhcnRzV2l0aCgnZm9udC4nKSA/IHQoZi5sYWJlbCBhcyBrZXlvZiB0eXBlb2YgemgpIDogZi5sYWJlbCB9KSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyhmb250KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5mb250ID0gZm9udFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jZmctZmllbGRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbGFiZWxcIiBpZD1cImRzZHItcHJlZi1zaXplLWxhYmVsXCI+e3QoJ3NldHRpbmdzLnNpemUnKX08L3NwYW4+XG4gICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2V0dGluZ3Muc2l6ZScpfVxuICAgICAgICAgIHZhbHVlPXtTdHJpbmcocHJlZnMuc2l6ZSl9XG4gICAgICAgICAgb3B0aW9ucz17U0laRV9PUFRJT05TLm1hcCgocykgPT4gKHsgdmFsdWU6IFN0cmluZyhzKSwgbGFiZWw6IGAke3N9cHhgIH0pKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHNpemUpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLnNpemUgPSBOdW1iZXIoc2l6ZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgPC8+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBIZWFkZXIgYWN0aW9uIChzZXNzaW9uIHNjb3BlKTogYmFkZ2UgKyBvcGVuLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdBY3Rpb24oeyBzZXNzaW9uSWQsIHVzZVNlc3Npb25zLCB1c2VTZXNzaW9uLCB0IH06IERpZmZSZXZpZXdBY3Rpb25Qcm9wcykge1xuICBjb25zdCBjd2QgPSB1c2VTZXNzaW9ucygoczogU2Vzc2lvbkxpc3RTdGF0ZSkgPT4gcy5ieUlkW3Nlc3Npb25JZF0/LmN3ZClcbiAgY29uc3Qgbm9kZXMgPSB1c2VTZXNzaW9uKChzKSA9PiBzLm5vZGVzKVxuICBjb25zdCBjaGFuZ2VDb3VudCA9IHVzZU1lbW8oKCkgPT4gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlcyksIFtub2Rlc10pXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IG9wZW5PdmVybGF5ID0gKCkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1bnN1YiA9IG92ZXJsYXlTdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgc2V0T3BlbihvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QoKS5vcGVuKVxuICAgIH0pXG4gICAgcmV0dXJuIHVuc3ViXG4gIH0sIFtdKVxuXG4gIGlmICghY3dkKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci10cmlnZ2VyXCIgYXJpYS1sYWJlbD17dCgnYWN0aW9uLmFyaWEnKX0gb25DbGljaz17b3Blbk92ZXJsYXl9PlxuICAgICAgPEljb25EaWZmIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxhYmVsXCI+e3QoJ2FjdGlvbi5sYWJlbCcpfTwvc3Bhbj5cbiAgICAgIHtjaGFuZ2VDb3VudCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvdW50XCI+e2NoYW5nZUNvdW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAge29wZW4gPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XHUyNzEzPC9zcGFuPiA6IG51bGx9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaWxlIHRyZWU6IGJ1aWxkIGEgZGlyZWN0b3J5IHRyZWUgZnJvbSBmbGF0IHBhdGhzIGFuZCByZW5kZXIgaXQgd2l0aFxuLy8gY29sbGFwc2libGUgZm9sZGVycyAodGhlIGxlZnQgc2lkZSBvZiB0aGUgcmV2aWV3IHN1cmZhY2UpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnR5cGUgVHJlZURpcjxUPiA9IHsga2luZDogJ2Rpcic7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBjaGlsZHJlbjogVHJlZU5vZGU8VD5bXSB9XG50eXBlIFRyZWVMZWFmPFQ+ID0geyBraW5kOiAnbGVhZic7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBpdGVtOiBUIH1cbnR5cGUgVHJlZU5vZGU8VD4gPSBUcmVlRGlyPFQ+IHwgVHJlZUxlYWY8VD5cblxuLyoqIFR1cm4gYSBmbGF0IGl0ZW0gbGlzdCBpbnRvIGEgc29ydGVkIGRpcmVjdG9yeSB0cmVlIChkaXJlY3RvcmllcyBmaXJzdCkuICovXG5mdW5jdGlvbiBidWlsZEZpbGVUcmVlPFQ+KGl0ZW1zOiByZWFkb25seSBUW10sIHBhdGhPZjogKGl0ZW06IFQpID0+IHN0cmluZyk6IFRyZWVOb2RlPFQ+W10ge1xuICBjb25zdCByb290OiBUcmVlTm9kZTxUPltdID0gW11cbiAgY29uc3QgZGlySW5kZXggPSBuZXcgTWFwPHN0cmluZywgVHJlZURpcjxUPj4oKVxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBjb25zdCBwYXRoID0gcGF0aE9mKGl0ZW0pXG4gICAgY29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkgY29udGludWVcbiAgICBsZXQgc2libGluZ3MgPSByb290XG4gICAgbGV0IHByZWZpeCA9ICcnXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIHByZWZpeCA9IHByZWZpeCA/IGAke3ByZWZpeH0vJHtwYXJ0c1tpXX1gIDogcGFydHNbaV1cbiAgICAgIGxldCBkaXIgPSBkaXJJbmRleC5nZXQocHJlZml4KVxuICAgICAgaWYgKCFkaXIpIHtcbiAgICAgICAgZGlyID0geyBraW5kOiAnZGlyJywgbmFtZTogcGFydHNbaV0sIHBhdGg6IHByZWZpeCwgY2hpbGRyZW46IFtdIH1cbiAgICAgICAgZGlySW5kZXguc2V0KHByZWZpeCwgZGlyKVxuICAgICAgICBzaWJsaW5ncy5wdXNoKGRpcilcbiAgICAgIH1cbiAgICAgIHNpYmxpbmdzID0gZGlyLmNoaWxkcmVuXG4gICAgfVxuICAgIHNpYmxpbmdzLnB1c2goeyBraW5kOiAnbGVhZicsIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLCBwYXRoLCBpdGVtIH0pXG4gIH1cbiAgY29uc3Qgc29ydE5vZGVzID0gKG5vZGVzOiBUcmVlTm9kZTxUPltdKTogdm9pZCA9PiB7XG4gICAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYgKGEua2luZCAhPT0gYi5raW5kKSByZXR1cm4gYS5raW5kID09PSAnZGlyJyA/IC0xIDogMVxuICAgICAgcmV0dXJuIGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSlcbiAgICB9KVxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2RlcykgaWYgKG5vZGUua2luZCA9PT0gJ2RpcicpIHNvcnROb2Rlcyhub2RlLmNoaWxkcmVuKVxuICB9XG4gIHNvcnROb2Rlcyhyb290KVxuICByZXR1cm4gcm9vdFxufVxuXG4vKiogUmVjdXJzaXZlIHRyZWUgcmVuZGVyZXI6IGNvbGxhcHNpYmxlIGRpcmVjdG9yaWVzICsgbGVhZiByb3dzLiAqL1xuZnVuY3Rpb24gRmlsZVRyZWVWaWV3PFQ+KHByb3BzOiB7XG4gIG5vZGVzOiBUcmVlTm9kZTxUPltdXG4gIGNvbGxhcHNlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPlxuICBvblRvZ2dsZURpcjogKHBhdGg6IHN0cmluZykgPT4gdm9pZFxuICBkZXB0aDogbnVtYmVyXG4gIHJlbmRlckxlYWY6IChsZWFmOiBUcmVlTGVhZjxUPikgPT4gUmVhY3ROb2RlXG59KTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgeyBub2RlcywgY29sbGFwc2VkLCBvblRvZ2dsZURpciwgZGVwdGgsIHJlbmRlckxlYWYgfSA9IHByb3BzXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtub2Rlcy5tYXAoKG5vZGUpID0+XG4gICAgICAgIG5vZGUua2luZCA9PT0gJ2RpcicgPyAoXG4gICAgICAgICAgPGRpdiBrZXk9e25vZGUucGF0aH0+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWRpciR7Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJycgOiAnIGRzZHItZGlyLW9wZW4nfWB9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0ICsgOCB9fVxuICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXshY29sbGFwc2VkLmhhcyhub2RlLnBhdGgpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblRvZ2dsZURpcihub2RlLnBhdGgpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1jYXJldFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAnXHUyNUI4JyA6ICdcdTI1QkUnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItbmFtZVwiIHRpdGxlPXtub2RlLnBhdGh9Pntub2RlLm5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1jb3VudFwiPntub2RlLmNoaWxkcmVuLmxlbmd0aH08L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIHshY29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gKFxuICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3IG5vZGVzPXtub2RlLmNoaWxkcmVufSBjb2xsYXBzZWQ9e2NvbGxhcHNlZH0gb25Ub2dnbGVEaXI9e29uVG9nZ2xlRGlyfSBkZXB0aD17ZGVwdGggKyAxfSByZW5kZXJMZWFmPXtyZW5kZXJMZWFmfSAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPGRpdiBrZXk9e25vZGUucGF0aH0gc3R5bGU9e3sgcGFkZGluZ0xlZnQ6IGRlcHRoICogMTQgfX0+e3JlbmRlckxlYWYobm9kZSl9PC9kaXY+XG4gICAgICAgICksXG4gICAgICApfVxuICAgIDwvPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29tcG9zZXIgZG9jayAoc2Vzc2lvbiBzY29wZSk6IHBlbmRpbmcgaW5saW5lIGNvbW1lbnRzIGZsb2F0IGFib3ZlIHRoZVxuLy8gaW5wdXQgYm94LCBDb2RleC1zdHlsZSBcdTIwMTQgaG92ZXIgdGhlIHBpbGwgdG8gcHJldmlldywgY2xpY2sgc2VuZCB0byBpbmplY3QuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudHlwZSBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPiAmIHsgc2Vzc2lvbnM6IElTZXNzaW9ucyB9XG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb21wb3NlckRvY2soeyBzZXNzaW9uSWQsIHVzZVNlc3Npb25zLCBzZXNzaW9ucywgaW5wdXQsIHQgfTogRGlmZlJldmlld0NvbXBvc2VyRG9ja1Byb3BzKSB7XG4gIGNvbnN0IGN3ZCA9IHVzZVNlc3Npb25zKChzOiBTZXNzaW9uTGlzdFN0YXRlKSA9PiBzLmJ5SWRbc2Vzc2lvbklkXT8uY3dkKVxuICBjb25zdCBwZW5kaW5nID0gdXNlU3luY0V4dGVybmFsU3RvcmUocGVuZGluZ0NvbW1lbnRzU3RvcmUuc3Vic2NyaWJlLCBwZW5kaW5nQ29tbWVudHNTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Rpc21pc3NlZCwgc2V0RGlzbWlzc2VkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBjYXJyaWVkSWRzID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGNhcnJ5aW5nID0gdXNlUmVmKGZhbHNlKVxuXG4gIC8vIFNlZWQgdGhlIHN0b3JlIGZyb20gc2VydmVyIHN0b3JhZ2Ugd2hlbiBub3RoaW5nIGhhcyBiZWVuIHN5bmNlZCBmb3IgdGhpc1xuICAvLyB3b3Jrc3BhY2UgeWV0IChwYW5lbCBuZXZlciBvcGVuZWQgdGhpcyBzZXNzaW9uIFx1MjAxNCBjb21tZW50cyBwZXJzaXN0IGluIC5naXQpLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY3dkIHx8IHBlbmRpbmcuY3dkID09PSBjd2QpIHJldHVyblxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZVxuICAgIHZvaWQgbG9hZENvbW1lbnRzKGN3ZCkudGhlbigobGlzdCkgPT4ge1xuICAgICAgaWYgKGNhbmNlbGxlZCkgcmV0dXJuXG4gICAgICBwZW5kaW5nQ29tbWVudHNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgaWYgKGQuY3dkID09PSBjd2QpIHJldHVyblxuICAgICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgICBkLmNvbW1lbnRzID0gbGlzdFxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjYW5jZWxsZWQgPSB0cnVlXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW2N3ZCwgcGVuZGluZy5jd2RdKVxuXG4gIGNvbnN0IGNvbW1lbnRzID0gcGVuZGluZy5jd2QgPT09IGN3ZCA/IHBlbmRpbmcuY29tbWVudHMgOiBbXVxuICBjb25zdCBpZHMgPSBjb21tZW50cy5tYXAoKGMpID0+IGMuaWQpLmpvaW4oJywnKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChjb21tZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHNldERpc21pc3NlZChmYWxzZSlcbiAgICAgIGNhcnJpZWRJZHMuY3VycmVudCA9IG51bGxcbiAgICB9XG4gIH0sIFtjb21tZW50cy5sZW5ndGhdKVxuXG4gIC8qKiBDb21wb3NlIHRoZSBmdWxsIHJldmlldyBwYWNrYWdlOiBjb21tZW50cyArIHRoZWlyIGRpZmYgaHVua3MgKyBBSSB2ZXJkaWN0LiAqL1xuICBjb25zdCBjb21wb3NlQ2FycmllZE1lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQlx1OTQ4OFx1NUJGOVx1NUY1M1x1NTI0RFx1NURFNVx1NEY1Q1x1NTMzQVx1NzY4NFx1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMVx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsICcnXVxuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdDb21tZW50W10+KClcbiAgICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBieVBhdGguZ2V0KGMucGF0aClcbiAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goYylcbiAgICAgIGVsc2UgYnlQYXRoLnNldChjLnBhdGgsIFtjXSlcbiAgICB9XG4gICAgZm9yIChjb25zdCBbcGF0aCwgbGlzdF0gb2YgYnlQYXRoKSB7XG4gICAgICBsaW5lcy5wdXNoKGAjIyAke3BhdGh9YClcbiAgICAgIGZvciAoY29uc3QgYyBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IGFuY2hvciA9IGMubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjLmxpbmVOZXd9YCA6IGAgKG9sZCBsaW5lICR7Yy5saW5lT2xkfSlgXG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHtwYXRofSR7YW5jaG9yfTogJHtjLnRleHR9YClcbiAgICAgIH1cbiAgICAgIGNvbnN0IGh1bmtzID0gaHVua3NGb3JMaW5lcyhwZW5kaW5nLmRpZmZzW3BhdGhdID8/ICcnLCBsaXN0Lm1hcCgoYykgPT4gYy5saW5lTmV3ID8/IGMubGluZU9sZCkpXG4gICAgICBpZiAoaHVua3MpIHtcbiAgICAgICAgbGluZXMucHVzaCgnYGBgZGlmZicpXG4gICAgICAgIGxpbmVzLnB1c2goaHVua3MpXG4gICAgICAgIGxpbmVzLnB1c2goJ2BgYCcpXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICBpZiAocGVuZGluZy5yZXZpZXc/Lm9rICYmIChwZW5kaW5nLnJldmlldy5maW5kaW5ncy5sZW5ndGggPiAwIHx8IHBlbmRpbmcucmV2aWV3LnZlcmRpY3QpKSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkEnKVxuICAgICAgbGluZXMucHVzaChwZW5kaW5nLnJldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/ICdcdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OThcdUZGMDhQYXRjaCBpcyBpbmNvcnJlY3RcdUZGMDknIDogJ1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RVx1RkYwOFBhdGNoIGlzIGNvcnJlY3RcdUZGMDknKVxuICAgICAgZm9yIChjb25zdCBmIG9mIHBlbmRpbmcucmV2aWV3LmZpbmRpbmdzKSB7XG4gICAgICAgIGxpbmVzLnB1c2goYC0gWyR7Zi5wcmlvcml0eX1dICR7Zi5maWxlfToke2YubGluZVN0YXJ0fSR7Zi5saW5lRW5kICE9PSBmLmxpbmVTdGFydCA/IGAtJHtmLmxpbmVFbmR9YCA6ICcnfSAke2YudGl0bGV9IFx1MjAxNCAke2YuZGV0YWlsfWApXG4gICAgICAgIGlmIChmLnN1Z2dlc3Rpb24pIGxpbmVzLnB1c2goYCAgXFxgXFxgXFxgXFxuJHtmLnN1Z2dlc3Rpb259XFxuICBcXGBcXGBcXGBgKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykuc2xpY2UoMCwgMTYwMDApXG4gIH1cblxuICAvLyBDb2RleC1zdHlsZSBhdXRvLWNhcnJ5OiB3aGVuIHRoZSB1c2VyIHN1Ym1pdHMgYSBtZXNzYWdlIHdoaWxlIGNvbW1lbnRzIGFyZVxuICAvLyBwZW5kaW5nLCBxdWV1ZSB0aGUgZnVsbCByZXZpZXcgcGFja2FnZSByaWdodCBiZWhpbmQgaXQgKG5vIHNlbmQgYnV0dG9uKS5cbiAgY29uc3QgcGhhc2UgPSBpbnB1dD8ucGhhc2VcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoY29tbWVudHMubGVuZ3RoID09PSAwIHx8IGNhcnJ5aW5nLmN1cnJlbnQgfHwgY2FycmllZElkcy5jdXJyZW50ID09PSBpZHMpIHJldHVyblxuICAgIGlmIChwaGFzZSAhPT0gJ3N1Ym1pdHRpbmcnICYmIHBoYXNlICE9PSAnYWRqdWRpY2F0aW5nJykgcmV0dXJuXG4gICAgY2FycnlpbmcuY3VycmVudCA9IHRydWVcbiAgICBjb25zdCB0YXJnZXRJZHMgPSBpZHNcbiAgICB2b2lkIGluamVjdFRvU2Vzc2lvbihzZXNzaW9ucywgc2Vzc2lvbklkLCBjb21wb3NlQ2FycmllZE1lc3NhZ2UoKSkudGhlbigob3V0Y29tZSkgPT4ge1xuICAgICAgaWYgKG91dGNvbWUgIT09ICdmYWlsZWQnKSBjYXJyaWVkSWRzLmN1cnJlbnQgPSB0YXJnZXRJZHNcbiAgICAgIGNhcnJ5aW5nLmN1cnJlbnQgPSBmYWxzZVxuICAgIH0pXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbcGhhc2UsIGlkc10pXG5cbiAgaWYgKCFjd2QgfHwgY29tbWVudHMubGVuZ3RoID09PSAwIHx8IGRpc21pc3NlZCkgcmV0dXJuIG51bGxcblxuICAvKiogT3BlbiB0aGUgcmV2aWV3IHBhbmVsIGF0IHRoZSBjb21tZW50J3MgY2hhbmdlIGJsb2NrLiAqL1xuICBjb25zdCBmb2N1c0NvbW1lbnQgPSAoY29tbWVudDogUmV2aWV3Q29tbWVudCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmZvY3VzID0geyBwYXRoOiBjb21tZW50LnBhdGgsIGxpbmU6IGNvbW1lbnQubGluZU5ldyA/PyBjb21tZW50LmxpbmVPbGQgPz8gdW5kZWZpbmVkIH1cbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2tcIiBvbk1vdXNlRW50ZXI9eygpID0+IHNldEhvdmVyKHRydWUpfSBvbk1vdXNlTGVhdmU9eygpID0+IHNldEhvdmVyKGZhbHNlKX0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZG9jay1oZWFkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1pY29uXCI+PEljb25Db21tZW50IC8+PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY291bnRcIiB0aXRsZT17dCgncmV2aWV3LmRvY2tIaW50Jyl9Pnt0KCdyZXZpZXcuZG9ja0NvbW1lbnRzJywgeyBuOiBjb21tZW50cy5sZW5ndGggfSl9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZG9jay1jbG9zZVwiIGFyaWEtbGFiZWw9e3QoJ2NvbW1lbnQuY2FuY2VsJyl9IG9uQ2xpY2s9eygpID0+IHNldERpc21pc3NlZCh0cnVlKX0+XG4gICAgICAgICAgPEljb25YIC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICB7aG92ZXIgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWxpc3RcIj5cbiAgICAgICAgICB7Y29tbWVudHMubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZG9jay1pdGVtXCJcbiAgICAgICAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5kb2NrSnVtcCcpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBmb2N1c0NvbW1lbnQoY29tbWVudCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1sb2NcIj57Y29tbWVudC5wYXRofXtjb21tZW50LmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Y29tbWVudC5saW5lTmV3fWAgOiAnJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay10ZXh0XCI+e2NvbW1lbnQudGV4dH08L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJldmlldyBvdmVybGF5IChyb290IHNjb3BlKTogc2Vzc2lvbiArIHdvcmtzcGFjZSB0YWJzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdPdmVybGF5KHsgc2Vzc2lvbnMsIHQgfTogRGlmZlJldmlld092ZXJsYXlQcm9wcykge1xuICBjb25zdCBzdG9yZVN0YXRlID0gdXNlU3luY0V4dGVybmFsU3RvcmUob3ZlcmxheVN0b3JlLnN1YnNjcmliZSwgb3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICAvLyBHaXQtZmlyc3Q6IGxhbmQgb24gdGhlIHdvcmtzcGFjZSB0YWIgKHN0YWdlZC91bnN0YWdlZC9icmFuY2ggdHJlZXMpIHNvIHRoZVxuICAvLyBjaGFuZ2UgcmV2aWV3IGlzIG9uZSBjbGljayBhd2F5OyB0aGUgc2Vzc2lvbiB0YWIgc3RheXMgYSBjbGljayBhd2F5LlxuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gdXNlU3RhdGU8J3Nlc3Npb24nIHwgJ3dvcmtzcGFjZSc+KCd3b3Jrc3BhY2UnKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSB1c2VTdGF0ZTxWaWV3TW9kZT4oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RzZHItdmlldycpID09PSAnc3BsaXQnID8gJ3NwbGl0JyA6ICdzaW5nbGUnXG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ3NpbmdsZSdcbiAgICB9XG4gIH0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkc2RyLXZpZXcnLCB2aWV3KVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gcHJpdmF0ZSBtb2RlIC8gdW5hdmFpbGFibGUgXHUyMDE0IG5vbi1mYXRhbFxuICAgIH1cbiAgfSwgW3ZpZXddKVxuXG4gIC8vIFdvcmtzcGFjZSB0YWIgc3RhdGUuXG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtub3RpY2UsIHNldE5vdGljZV0gPSB1c2VTdGF0ZTx7IGtpbmQ6ICdvaycgfCAnZXJyb3InOyB0ZXh0OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb25maXJtLCBzZXRDb25maXJtXSA9IHVzZVN0YXRlPCdmaWxlJyB8ICdhbGwnIHwgJ3B1c2gnIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdE1lc3NhZ2UsIHNldENvbW1pdE1lc3NhZ2VdID0gdXNlU3RhdGUoJycpXG4gIC8vIExvY2FsICh1bnB1c2hlZCkgY29tbWl0IGhpc3Rvcnk6IGxpc3QgKyBwZXItY29tbWl0IGRpZmYgdmlldy5cbiAgY29uc3QgW2hpc3RvcnksIHNldEhpc3RvcnldID0gdXNlU3RhdGU8Q29tbWl0SW5mb1tdPihbXSlcbiAgY29uc3QgW3NlbGVjdGVkQ29tbWl0LCBzZXRTZWxlY3RlZENvbW1pdF0gPSB1c2VTdGF0ZTxDb21taXRJbmZvIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdERpZmYsIHNldENvbW1pdERpZmZdID0gdXNlU3RhdGU8Q29tbWl0RGlmZlJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdERpZmZMb2FkaW5nLCBzZXRDb21taXREaWZmTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbGVjdGVkQ29tbWl0RmlsZSwgc2V0U2VsZWN0ZWRDb21taXRGaWxlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIElubGluZSByZXZpZXcgY29tbWVudHMgKHdvcmtzcGFjZSB0YWIsIHNpbmdsZSB2aWV3KS5cbiAgY29uc3QgW2NvbW1lbnRzLCBzZXRDb21tZW50c10gPSB1c2VTdGF0ZTxSZXZpZXdDb21tZW50W10+KFtdKVxuICBjb25zdCBbY29tbWVudEVkaXRvciwgc2V0Q29tbWVudEVkaXRvcl0gPSB1c2VTdGF0ZTx7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21tZW50VGV4dCwgc2V0Q29tbWVudFRleHRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjb21tZW50UG9wb3Zlciwgc2V0Q29tbWVudFBvcG92ZXJdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgLy8gUmV2aWV3IHNjb3BlOiB3aGljaCBzbGljZSBvZiB0aGUgcmVwb3NpdG9yeSB0aGUgd29ya3NwYWNlIHRhYiBzaG93cy5cbiAgY29uc3QgW3Njb3BlLCBzZXRTY29wZV0gPSB1c2VTdGF0ZTxXb3Jrc3BhY2VTY29wZT4oJ2FsbCcpXG4gIGNvbnN0IFticmFuY2hlcywgc2V0QnJhbmNoZXNdID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKVxuICBjb25zdCBbYmFzZUJyYW5jaCwgc2V0QmFzZUJyYW5jaF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbYmFzZVN0YXR1cywgc2V0QmFzZVN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIC8vIEZlZWRiYWNrIGxvb3A6IHNlbmQgaW5saW5lIGNvbW1lbnRzIHRvIHRoZSBhZ2VudCAoc2Vzc2lvbi5wcm9tcHQsIGNvcHkgZmFsbGJhY2spLlxuICBjb25zdCBbc2VuZE9wZW4sIHNldFNlbmRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VuZFRleHQsIHNldFNlbmRUZXh0XSA9IHVzZVN0YXRlKCcnKVxuICAvLyBBSSByZXZpZXcgKC9yZXZpZXcpOiBmaW5kaW5ncyArIHZlcmRpY3QuXG4gIGNvbnN0IFtyZXZpZXcsIHNldFJldmlld10gPSB1c2VTdGF0ZTxSZXZpZXdSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtyZXZpZXdpbmcsIHNldFJldmlld2luZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgLy8gR2l0SHViIFBSIGNvbnRleHQgKGdoIENMSSkuXG4gIGNvbnN0IFtwciwgc2V0UHJdID0gdXNlU3RhdGU8UHJSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIC8vIE11bHRpLXJlcG86IHJlcG9zIGRldGVjdGVkIHVuZGVyIHRoZSB3b3Jrc3BhY2UgKyB0aGUgc2VsZWN0ZWQgb25lLlxuICBjb25zdCBbcmVwb3MsIHNldFJlcG9zXSA9IHVzZVN0YXRlPHsgcGF0aDogc3RyaW5nOyBicmFuY2g6IHN0cmluZyB8IG51bGwgfVtdPihbXSlcbiAgY29uc3QgW3JlcG9QYXRoLCBzZXRSZXBvUGF0aF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBUZW1wb3JhcnkgbGluZSBoaWdobGlnaHQgKGp1bXAgdGFyZ2V0IGZyb20gYSBQUiBjb21tZW50IG9yIGEgZmluZGluZykuXG4gIGNvbnN0IFtqdW1wTGluZSwgc2V0SnVtcExpbmVdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgLy8gRmluZGluZ3MgbGlzdCBwYW5lbCB2aXNpYmlsaXR5LlxuICBjb25zdCBbZmluZGluZ3NPcGVuLCBzZXRGaW5kaW5nc09wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgLyoqIFNlbGVjdCBhIGZpbGUgYW5kIGZsYXNoIGl0cyBsaW5lIChmaW5kaW5ncyAvIFBSIGNvbW1lbnRzKS4gKi9cbiAgY29uc3QganVtcFRvID0gKGZpbGU6IHN0cmluZywgbGluZT86IG51bWJlcikgPT4ge1xuICAgIHNldFNlbGVjdGVkKGZpbGUpXG4gICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgc2V0SnVtcExpbmUobGluZSA/PyBudWxsKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0SnVtcExpbmUobnVsbCksIDI1MDApXG4gIH1cbiAgLy8gQ29sbGFwc2VkIGRpcmVjdG9yaWVzIGluIHRoZSBsZWZ0LWhhbmQgZmlsZSB0cmVlIChzaGFyZWQgYWNyb3NzIHRhYnMpLlxuICBjb25zdCBbY29sbGFwc2VkRGlycywgc2V0Q29sbGFwc2VkRGlyc10gPSB1c2VTdGF0ZTxSZWFkb25seVNldDxzdHJpbmc+PigoKSA9PiBuZXcgU2V0KCkpXG4gIGNvbnN0IHRvZ2dsZURpciA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKHBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgc2V0Q29sbGFwc2VkRGlycygocHJldikgPT4ge1xuICAgICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChwcmV2KVxuICAgICAgICBpZiAobmV4dC5oYXMocGF0aCkpIG5leHQuZGVsZXRlKHBhdGgpXG4gICAgICAgIGVsc2UgbmV4dC5hZGQocGF0aClcbiAgICAgICAgcmV0dXJuIG5leHRcbiAgICAgIH0pXG4gICAgfSxcbiAgICBbXSxcbiAgKVxuICBjb25zdCBub3RpY2VUaW1lciA9IHVzZVJlZjxSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKVxuXG4gIC8vIEN1cnJlbnQgc2Vzc2lvbidzIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCAocmVhY3RpdmUpLCBmb3IgdGhlIHNlc3Npb24gdGFiLlxuICBjb25zdCBjdXJyZW50SWQgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICB1c2VNZW1vKCgpID0+IChub3RpZnk6ICgpID0+IHZvaWQpID0+IHNlc3Npb25zLmxpc3Quc3Vic2NyaWJlKG5vdGlmeSksIFtzZXNzaW9uc10pLFxuICAgIHVzZU1lbW8oKCkgPT4gKCkgPT4gc2Vzc2lvbnMubGlzdC5nZXRTbmFwc2hvdCgpLmN1cnJlbnQsIFtzZXNzaW9uc10pLFxuICApXG4gIGNvbnN0IHNuYXBzaG90ID0gdXNlU3luY0V4dGVybmFsU3RvcmUoXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICByZXR1cm4gKG5vdGlmeTogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICAgIGlmICghYmluZGluZykgcmV0dXJuICgpID0+IHt9XG4gICAgICAgIHJldHVybiBiaW5kaW5nLnNlc3Npb24uc3Vic2NyaWJlKG5vdGlmeSlcbiAgICAgIH1cbiAgICB9LCBbc2Vzc2lvbnMsIGN1cnJlbnRJZF0pLFxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IGN1cnJlbnRJZCA/IHNlc3Npb25zLmJpbmRpbmcoY3VycmVudElkKSA6IHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gYmluZGluZyA/IGJpbmRpbmcuc2Vzc2lvbi5nZXRTbmFwc2hvdCgpIDogbnVsbFxuICAgICAgfVxuICAgIH0sIFtzZXNzaW9ucywgY3VycmVudElkXSksXG4gIClcblxuICBjb25zdCByb3VuZHMgPSB1c2VNZW1vKCgpID0+IChzbmFwc2hvdCA/IGNvbGxlY3RTZXNzaW9uUm91bmRzKHNuYXBzaG90Lm5vZGVzKSA6IFtdKSwgW3NuYXBzaG90XSlcbiAgLy8gTGVmdC1oYW5kIGZpbGUgdHJlZXM6IHBlci1yb3VuZCB0cmVlcyBmb3IgdGhlIHNlc3Npb24gdGFiLCBvbmUgdHJlZSBmb3JcbiAgLy8gdGhlIGdpdCB3b3JraW5nIHRyZWUgb24gdGhlIHdvcmtzcGFjZSB0YWIuXG4gIGNvbnN0IHNlc3Npb25UcmVlcyA9IHVzZU1lbW8oKCkgPT4gbmV3IE1hcChyb3VuZHMubWFwKChyKSA9PiBbci5yb3VuZCwgYnVpbGRGaWxlVHJlZShyLmNoYW5nZXMsIChjKSA9PiBjLnBhdGgpXSkpLCBbcm91bmRzXSlcbiAgY29uc3QgdG90YWxTZXNzaW9uRmlsZXMgPSB1c2VNZW1vKCgpID0+IHJvdW5kcy5yZWR1Y2UoKG4sIHIpID0+IG4gKyByLmNoYW5nZXMubGVuZ3RoLCAwKSwgW3JvdW5kc10pXG4gIGNvbnN0IFtzZWxlY3RlZFJvdW5kLCBzZXRTZWxlY3RlZFJvdW5kXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzZWxlY3RlZFBhdGgsIHNldFNlbGVjdGVkUGF0aF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBzZWxlY3RlZENoYW5nZSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IHJvdW5kID0gcm91bmRzLmZpbmQoKHIpID0+IHIucm91bmQgPT09IHNlbGVjdGVkUm91bmQpXG4gICAgcmV0dXJuIHJvdW5kPy5jaGFuZ2VzLmZpbmQoKGMpID0+IGMucGF0aCA9PT0gc2VsZWN0ZWRQYXRoKSA/PyBudWxsXG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmQsIHNlbGVjdGVkUGF0aF0pXG5cbiAgY29uc3QgY3dkID0gc3RvcmVTdGF0ZS5jd2RcbiAgLyoqIEFjdGl2ZSBnaXQgcmVwbyBmb3Igd29ya3NwYWNlIG9wZXJhdGlvbnMgKG11bHRpLXJlcG8gc2VsZWN0b3Igb3ZlcnJpZGUpLiAqL1xuICBjb25zdCBhY3RpdmVDd2QgPSByZXBvUGF0aCA/PyBjd2RcblxuICBjb25zdCBsb2FkV29ya3NwYWNlID0gYXN5bmMgKHNpbGVudCA9IGZhbHNlKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QpIHJldHVyblxuICAgIGlmICghc2lsZW50KSBzZXRMb2FkaW5nKHRydWUpXG4gICAgc2V0RXJyb3IobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgW25leHQsIGhpc3QsIG5leHRDb21tZW50cywgYnJhbmNoTGlzdCwgcHJEYXRhLCByZXBvTGlzdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGxvYWRTdGF0dXMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEhpc3RvcnkoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZENvbW1lbnRzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRCcmFuY2hlcyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUHIoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZFJlcG9zKGFjdGl2ZUN3ZCksXG4gICAgICBdKVxuICAgICAgc2V0U3RhdHVzKG5leHQpXG4gICAgICBpZiAoaGlzdC5vaykgc2V0SGlzdG9yeShoaXN0LmNvbW1pdHMpXG4gICAgICBzZXRDb21tZW50cyhuZXh0Q29tbWVudHMpXG4gICAgICBzZXRCcmFuY2hlcyhicmFuY2hMaXN0KVxuICAgICAgc2V0UHIocHJEYXRhKVxuICAgICAgc2V0UmVwb3MocmVwb0xpc3QucmVwb3MpXG4gICAgICAvLyBEZWZhdWx0IHRoZSByZXBvIHNlbGVjdG9yIHRvIHRoZSB3b3Jrc3BhY2Ugcm9vdCB3aGVuIGl0IGlzIGl0c2VsZiBhIHJlcG8uXG4gICAgICBpZiAocmVwb1BhdGggPT09IG51bGwgJiYgIXJlcG9MaXN0LnJlcG9zLnNvbWUoKHIpID0+IHIucGF0aCA9PT0gYWN0aXZlQ3dkKSkge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHJlcG9MaXN0LnJlcG9zWzBdXG4gICAgICAgIGlmIChmaXJzdCAmJiBmaXJzdC5wYXRoICE9PSBjd2QpIHNldFJlcG9QYXRoKGZpcnN0LnBhdGgpXG4gICAgICB9XG4gICAgICBpZiAobmV4dC5lcnJvciAmJiAhbmV4dC5pc1JlcG8pIHNldEVycm9yKG5leHQuZXJyb3IpXG4gICAgICBzZXRTZWxlY3RlZCgocHJldikgPT4gKHByZXYgJiYgbmV4dC5maWxlcy5zb21lKChmKSA9PiBmLnBhdGggPT09IHByZXYpID8gcHJldiA6IG5leHQuZmlsZXNbMF0/LnBhdGggPz8gbnVsbCkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0RXJyb3IoZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIEF1dG8tcmVmcmVzaCB0aGUgd29ya3NwYWNlIGRhdGE6IHJlbG9hZCB3aGVuZXZlciB0aGUgdGFiIGJlY29tZXMgYWN0aXZlIG9yXG4gIC8vIHRoZSB3b3Jrc3BhY2UgY2hhbmdlcywgYW5kIHBlcmlvZGljYWxseSB3aGlsZSB0aGUgb3ZlcmxheSBpcyBvcGVuLiBBXG4gIC8vIHdvcmtzcGFjZSBzd2l0Y2ggY2xlYXJzIHN0YWxlIGNvbW1pdCBzZWxlY3Rpb24gYW5kIGhpc3RvcnkgZmlyc3QuXG4gIGNvbnN0IHdvcmtzcGFjZUN3ZFJlZiA9IHVzZVJlZjxzdHJpbmcgfCBudWxsPihudWxsKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHByZXZpb3VzID0gd29ya3NwYWNlQ3dkUmVmLmN1cnJlbnRcbiAgICB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudCA9IGFjdGl2ZUN3ZCA/PyBudWxsXG4gICAgaWYgKHRhYiAhPT0gJ3dvcmtzcGFjZScgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKHByZXZpb3VzICE9PSBhY3RpdmVDd2QpIHtcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICAgIHNldEhpc3RvcnkoW10pXG4gICAgICBzZXRDb21tZW50cyhbXSlcbiAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgIHNldENvbW1lbnRQb3BvdmVyKG51bGwpXG4gICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgIHNldFByKG51bGwpXG4gICAgfVxuICAgIHZvaWQgbG9hZFdvcmtzcGFjZSgpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbdGFiLCBhY3RpdmVDd2RdKVxuXG4gIC8vIFN1cmZhY2Ugd29ya3NwYWNlIGNvbW1lbnRzIGFib3ZlIHRoZSBjb21wb3NlciAoQ29kZXgtc3R5bGUgZG9jayksIGFsb25nXG4gIC8vIHdpdGggdGhlIGRpZmYgY29udGV4dCBhbmQgdGhlIGxhc3QgQUkgcmV2aWV3IHJlc3VsdC5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBwZW5kaW5nQ29tbWVudHNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQuY3dkID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICAgIGQuY29tbWVudHMgPSBjb21tZW50c1xuICAgICAgY29uc3QgZGlmZnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuICAgICAgZm9yIChjb25zdCBjIG9mIGNvbW1lbnRzKSB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBzdGF0dXM/LmZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gYy5wYXRoKVxuICAgICAgICBpZiAoZmlsZT8uZGlmZikgZGlmZnNbYy5wYXRoXSA9IGZpbGUuZGlmZlxuICAgICAgfVxuICAgICAgZC5kaWZmcyA9IGRpZmZzXG4gICAgICBkLnJldmlldyA9IHJldmlld1xuICAgIH0pXG4gIH0sIFtjb21tZW50cywgYWN0aXZlQ3dkLCBzdGF0dXMsIHJldmlld10pXG5cbiAgLy8gSnVtcCB0byBhIGNoYW5nZSBibG9jayBmcm9tIHRoZSBjb21wb3NlciBkb2NrIChjb21tZW50IGNsaWNrKS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmb2N1cyA9IHN0b3JlU3RhdGUuZm9jdXNcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkIHx8ICFmb2N1cykgcmV0dXJuXG4gICAgc2V0VGFiKCd3b3Jrc3BhY2UnKVxuICAgIHNldFNlbGVjdGVkKGZvY3VzLnBhdGgpXG4gICAgc2V0SnVtcExpbmUoZm9jdXMubGluZSA/PyBudWxsKVxuICAgIGNvbnN0IHNjcm9sbFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoZm9jdXMubGluZSAhPSBudWxsKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWRzZHItbGluZT1cIiR7Zm9jdXMubGluZX1cIl1gKT8uc2Nyb2xsSW50b1ZpZXcoeyBibG9jazogJ2NlbnRlcicsIGJlaGF2aW9yOiAnc21vb3RoJyB9KVxuICAgICAgfVxuICAgIH0sIDgwKVxuICAgIGNvbnN0IGNsZWFyVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHNldEp1bXBMaW5lKG51bGwpLCAyNTAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZXIpXG4gICAgICBjbGVhclRpbWVvdXQoY2xlYXJUaW1lcilcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc3RvcmVTdGF0ZS5rZXldKVxuXG4gIC8vIEtlZXAgc3RhZ2VkL3Vuc3RhZ2VkL2hpc3RvcnkgZnJlc2ggd2hpbGUgdGhlIHdvcmtzcGFjZSB0YWIgaXMgb3Blbi5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCB0YWIgIT09ICd3b3Jrc3BhY2UnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGNvbnN0IHRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdm9pZCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgfSwgMTUwMDApXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwodGltZXIpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc3RvcmVTdGF0ZS5vcGVuLCB0YWIsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gQnJhbmNoIHNjb3BlOiBkaWZmIHRoZSB3b3JrdHJlZSBhZ2FpbnN0IHRoZSBzZWxlY3RlZCBiYXNlIGJyYW5jaC5cbiAgLy8gRGVmYXVsdCB0aGUgYmFzZSB0byB0aGUgZmlyc3QgYnJhbmNoIHRoYXQgaXNuJ3QgdGhlIGN1cnJlbnQgb25lLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzY29wZSAhPT0gJ2JyYW5jaCcgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgY29uc3QgY3VycmVudCA9IHN0YXR1cz8uYnJhbmNoID8/IG51bGxcbiAgICBpZiAoYmFzZUJyYW5jaCA9PT0gbnVsbCAmJiBicmFuY2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBmYWxsYmFjayA9IGJyYW5jaGVzLmZpbmQoKGIpID0+IGIgIT09IGN1cnJlbnQpID8/IGJyYW5jaGVzWzBdXG4gICAgICBzZXRCYXNlQnJhbmNoKGZhbGxiYWNrKVxuICAgIH1cbiAgfSwgW3Njb3BlLCBhY3RpdmVDd2QsIGJyYW5jaGVzLCBiYXNlQnJhbmNoLCBzdGF0dXM/LmJyYW5jaF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2NvcGUgIT09ICdicmFuY2gnIHx8ICFhY3RpdmVDd2QgfHwgIWJhc2VCcmFuY2gpIHtcbiAgICAgIHNldEJhc2VTdGF0dXMobnVsbClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgY2FuY2VsbGVkID0gZmFsc2VcbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtTVEFUVVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoYWN0aXZlQ3dkKX0mYmFzZT0ke2VuY29kZVVSSUNvbXBvbmVudChiYXNlQnJhbmNoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+IG51bGwpKSBhcyBTdGF0dXNSZXNwb25zZSB8IG51bGxcbiAgICAgIGlmICghY2FuY2VsbGVkICYmIGRhdGEpIHtcbiAgICAgICAgc2V0QmFzZVN0YXR1cyhkYXRhKVxuICAgICAgICBpZiAoZGF0YS5lcnJvciAmJiBiYXNlU3RhdHVzPy5lcnJvciAhPT0gZGF0YS5lcnJvcikgc2V0RXJyb3IoZGF0YS5lcnJvcilcbiAgICAgIH1cbiAgICB9KSgpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc2NvcGUsIGFjdGl2ZUN3ZCwgYmFzZUJyYW5jaF0pXG5cbiAgLy8gRGVmYXVsdCBzZWxlY3Rpb24gZm9yIHRoZSBzZXNzaW9uIHRhYiBmb2xsb3dzIHRoZSBmaXJzdCByb3VuZCB3aXRoIGNoYW5nZXMuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkUm91bmQgPT09IG51bGwgJiYgcm91bmRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmRzWzBdLnJvdW5kKVxuICAgICAgc2V0U2VsZWN0ZWRQYXRoKHJvdW5kc1swXS5jaGFuZ2VzWzBdPy5wYXRoID8/IG51bGwpXG4gICAgfVxuICB9LCBbcm91bmRzLCBzZWxlY3RlZFJvdW5kXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuKSByZXR1cm5cbiAgICBjb25zdCBvbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgIGQub3BlbiA9IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5KVxuICB9LCBbc3RvcmVTdGF0ZS5vcGVuXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghbm90aWNlKSByZXR1cm5cbiAgICBub3RpY2VUaW1lci5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiBzZXROb3RpY2UobnVsbCksIDMwMDApXG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dChub3RpY2VUaW1lci5jdXJyZW50KVxuICB9LCBbbm90aWNlXSlcblxuICBjb25zdCBmaWxlcyA9IHN0YXR1cz8uaXNSZXBvID8gc3RhdHVzLmZpbGVzIDogW11cbiAgY29uc3Qgc3RhZ2VkRmlsZXMgPSB1c2VNZW1vKCgpID0+IGZpbGVzLmZpbHRlcigoZikgPT4gZi5zdGFnZWQpLCBbZmlsZXNdKVxuICBjb25zdCB1bnN0YWdlZEZpbGVzID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGYpID0+ICFmLnN0YWdlZCksIFtmaWxlc10pXG5cbiAgLy8gXCJMYXN0IHR1cm5cIiBzY29wZTogcGF0aHMgdGhlIGFnZW50IHRvdWNoZWQgaW4gdGhlIG1vc3QgcmVjZW50IHJvdW5kLlxuICBjb25zdCBsYXN0Um91bmRQYXRocyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gICAgY29uc3QgbGFzdCA9IHJvdW5kc1tyb3VuZHMubGVuZ3RoIC0gMV1cbiAgICBpZiAoIWxhc3QgfHwgIWN3ZCkgcmV0dXJuIHNldFxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGxhc3QuY2hhbmdlcykge1xuICAgICAgc2V0LmFkZChjaGFuZ2UucGF0aClcbiAgICAgIGNvbnN0IHAgPSBjaGFuZ2UucGF0aFxuICAgICAgaWYgKGlzQWJzUGF0aChwKSkge1xuICAgICAgICBjb25zdCByZWwgPSBwLnN0YXJ0c1dpdGgoY3dkKSA/IHAuc2xpY2UoY3dkLmxlbmd0aCkucmVwbGFjZSgvXltcXFxcL10rLywgJycpIDogcFxuICAgICAgICBzZXQuYWRkKHJlbClcbiAgICAgICAgc2V0LmFkZChiYXNlTmFtZShwKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldC5hZGQoYmFzZU5hbWUocCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZXRcbiAgfSwgW3JvdW5kcywgY3dkXSlcblxuICAvKiogVGhlIGZpbGUgc2xpY2UgdGhlIGN1cnJlbnQgc2NvcGUgc2hvd3MuICovXG4gIGNvbnN0IHNjb3BlRmlsZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICBjYXNlICd1bnN0YWdlZCc6XG4gICAgICAgIHJldHVybiB1bnN0YWdlZEZpbGVzXG4gICAgICBjYXNlICdzdGFnZWQnOlxuICAgICAgICByZXR1cm4gc3RhZ2VkRmlsZXNcbiAgICAgIGNhc2UgJ2JyYW5jaCc6XG4gICAgICAgIHJldHVybiBiYXNlU3RhdHVzPy5maWxlcyA/PyBbXVxuICAgICAgY2FzZSAnbGFzdC10dXJuJzpcbiAgICAgICAgaWYgKGxhc3RSb3VuZFBhdGhzLnNpemUgPT09IDApIHJldHVybiBbXVxuICAgICAgICByZXR1cm4gZmlsZXMuZmlsdGVyKChmKSA9PiB7XG4gICAgICAgICAgaWYgKGxhc3RSb3VuZFBhdGhzLmhhcyhmLnBhdGgpIHx8IGxhc3RSb3VuZFBhdGhzLmhhcyhiYXNlTmFtZShmLnBhdGgpKSkgcmV0dXJuIHRydWVcbiAgICAgICAgICAvLyBTZXNzaW9uIHBhdGhzIG1heSBiZSB3b3Jrc3BhY2Utcm9vdCByZWxhdGl2ZSBvciBhYnNvbHV0ZSAodGhlIHJlcG8gY2FuXG4gICAgICAgICAgLy8gYmUgYSBzdWJkaXJlY3Rvcnkgb2YgdGhlIHdvcmtzcGFjZSkgXHUyMDE0IG1hdGNoIGFueSBzdWZmaXggZm9ybS5cbiAgICAgICAgICBjb25zdCBzdWZmaXggPSBgLyR7Zi5wYXRofWBcbiAgICAgICAgICBmb3IgKGNvbnN0IHAgb2YgbGFzdFJvdW5kUGF0aHMpIHtcbiAgICAgICAgICAgIGlmIChwLmVuZHNXaXRoKHN1ZmZpeCkpIHJldHVybiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9KVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZpbGVzXG4gICAgfVxuICB9LCBbc2NvcGUsIHVuc3RhZ2VkRmlsZXMsIHN0YWdlZEZpbGVzLCBiYXNlU3RhdHVzLCBmaWxlcywgbGFzdFJvdW5kUGF0aHNdKVxuXG4gIC8qKiBTY29wZXMgd2hlcmUgZmlsZS9odW5rIGFjY2VwdFx1MDBCN3JldmVydFx1MDBCN3Vuc3RhZ2UgYW5kIGNvbW1pdC9wdXNoIG1ha2Ugc2Vuc2UuICovXG4gIGNvbnN0IGFsbG93QWN0aW9ucyA9IHNjb3BlICE9PSAnYnJhbmNoJyAmJiBzY29wZSAhPT0gJ2NvbW1pdCdcblxuICAvKiogRmlsZXMgdGhlIGN1cnJlbnQgc2NvcGUgY2FuIGhhbmQgdG8gdGhlIEFJIHJldmlldy4gKi9cbiAgY29uc3QgcmV2aWV3YWJsZUZpbGVzID0gc2NvcGUgPT09ICdicmFuY2gnID8gYmFzZVN0YXR1cz8uZmlsZXM/Lmxlbmd0aCA/PyAwIDogZmlsZXMubGVuZ3RoXG4gIGNvbnN0IHN0YWdlZENvdW50ID0gc3RhZ2VkRmlsZXMubGVuZ3RoXG4gIC8vIE5PVEU6IGhvb2tzIG11c3QgYWxsIHJ1biBiZWZvcmUgdGhlIGVhcmx5IHJldHVybiBiZWxvdyAoUmVhY3QgaG9vayBvcmRlcikuXG4gIGNvbnN0IHN0YWdlZFRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc3RhZ2VkRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbc3RhZ2VkRmlsZXNdKVxuICBjb25zdCB1bnN0YWdlZFRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUodW5zdGFnZWRGaWxlcywgKGYpID0+IGYucGF0aCksIFt1bnN0YWdlZEZpbGVzXSlcbiAgY29uc3Qgc2NvcGVUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHNjb3BlRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbc2NvcGVGaWxlc10pXG4gIGNvbnN0IGNvbW1pdEZpbGVzVHJlZSA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKGNvbW1pdERpZmY/Lm9rID8gYnVpbGRGaWxlVHJlZShjb21taXREaWZmLmZpbGVzLCAoZikgPT4gZi5wYXRoKSA6IFtdKSxcbiAgICBbY29tbWl0RGlmZl0sXG4gIClcblxuICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHNlbGVjdGVkRmlsZSA9IHNjb3BlRmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBzZWxlY3RlZCkgPz8gbnVsbFxuICBjb25zdCB0b3RhbEFkZGVkID0gZmlsZXMucmVkdWNlKChuLCBmKSA9PiBuICsgZi5hZGRlZCwgMClcbiAgY29uc3QgdG90YWxEZWxldGVkID0gZmlsZXMucmVkdWNlKChuLCBmKSA9PiBuICsgZi5kZWxldGVkLCAwKVxuXG4gIC8vIENvbW1pdC1kZXRhaWwgdmlldzogdGhlIHNlbGVjdGVkIGZpbGUgd2l0aGluIHRoZSBzZWxlY3RlZCBjb21taXQuXG4gIGNvbnN0IGNvbW1pdFNlZ21lbnRzID0gY29tbWl0RGlmZj8ub2sgPyBzcGxpdENvbW1pdERpZmYoY29tbWl0RGlmZi5kaWZmKSA6IFtdXG4gIGNvbnN0IGNvbW1pdEFjdGl2ZUZpbGUgPSBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayA/IGNvbW1pdERpZmYuZmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBzZWxlY3RlZENvbW1pdEZpbGUpID8/IG51bGwgOiBudWxsXG4gIGNvbnN0IGNvbW1pdEFjdGl2ZVRleHQgPSBjb21taXRBY3RpdmVGaWxlXG4gICAgPyBjb21taXRTZWdtZW50cy5maW5kKChzKSA9PiBzLnBhdGggPT09IGNvbW1pdEFjdGl2ZUZpbGUucGF0aCk/LnRleHQgPz8gY29tbWl0RGlmZj8uZGlmZiA/PyAnJ1xuICAgIDogY29tbWl0RGlmZj8uZGlmZiA/PyAnJ1xuXG4gIC8qKiBMZWFmIHJvdyBzaGFyZWQgYnkgdGhlIHN0YWdlZC91bnN0YWdlZCBmaWxlIHRyZWVzLiAqL1xuICBjb25zdCB3b3Jrc3BhY2VMZWFmID0gKHsgaXRlbTogZmlsZSwgbmFtZSB9OiB7IGl0ZW06IERpZmZGaWxlOyBuYW1lOiBzdHJpbmcgfSkgPT4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICBhcmlhLXNlbGVjdGVkPXtmaWxlLnBhdGggPT09IHNlbGVjdGVkfVxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtmaWxlLnBhdGggPT09IHNlbGVjdGVkID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWQoZmlsZS5wYXRoKVxuICAgICAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgICAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICAgICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hpcENsYXNzKGZpbGUuc3RhdHVzKX1gfT57ZmlsZS51bnRyYWNrZWQgPyAnPz8nIDogZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICB7ZmlsZS5iaW5hcnkgPyB0KCdyZXZpZXcuYmluYXJ5JykgOiB0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxuXG4gIGNvbnN0IHJ1bkFwcGx5ID0gYXN5bmMgKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZykgPT4ge1xuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcGx5Q2hhbmdlcyhhY3RpdmVDd2QgPz8gY3dkID8/ICcnLCBhY3Rpb24sIHBhdGgpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIGNvbnN0IHZlcmIgPSBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiBhY3Rpb24gPT09ICd1bnN0YWdlJyA/IHQoJ3Jldmlldy51bnN0YWdlZCcpIDogdCgncmV2aWV3LnJldmVydGVkJylcbiAgICAgICAgc2V0Tm90aWNlKHtcbiAgICAgICAgICBraW5kOiAnb2snLFxuICAgICAgICAgIHRleHQ6IHBhdGhcbiAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVPbmUnLCB7IGFjdGlvbjogdmVyYiwgcGF0aCB9KVxuICAgICAgICAgICAgOiByZXN1bHQuZGVsZXRlZCAmJiByZXN1bHQuZGVsZXRlZC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVEZWxldGVkJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGgsIGRlbGV0ZWQ6IHJlc3VsdC5kZWxldGVkLmxlbmd0aCB9KVxuICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5kb25lJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGggfSksXG4gICAgICAgIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBvbkZpbGVBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnZmlsZScpIHtcbiAgICAgIHNldENvbmZpcm0oJ2ZpbGUnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2ZpbGUnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbiwgcGF0aClcbiAgfVxuXG4gIGNvbnN0IG9uQWxsQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JykgPT4ge1xuICAgIGlmIChhY3Rpb24gPT09ICdyZXZlcnQnICYmIGNvbmZpcm0gIT09ICdhbGwnKSB7XG4gICAgICBzZXRDb25maXJtKCdhbGwnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2FsbCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uKVxuICB9XG5cbiAgLyoqIEFwcGx5IG9uZSBodW5rIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpIG9mIHRoZSBzZWxlY3RlZCBmaWxlLiAqL1xuICBjb25zdCBvbkh1bmtBY3Rpb24gPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBEaWZmSHVuaykgPT4ge1xuICAgIGlmICghc2VsZWN0ZWRGaWxlIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlIdW5rKGFjdGl2ZUN3ZCA/PyBjd2QgPz8gJycsIHNlbGVjdGVkRmlsZS5wYXRoLCBhY3Rpb24sIGh1bmsudGV4dClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgY29uc3QgdmVyYiA9IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IGFjdGlvbiA9PT0gJ3Vuc3RhZ2UnID8gdCgncmV2aWV3LnVuc3RhZ2VkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiB2ZXJiLCBwYXRoOiBzZWxlY3RlZEZpbGUucGF0aCB9KSB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBpbmxpbmUgY29tbWVudHMgLS0tLVxuICBjb25zdCBvcGVuQ29tbWVudCA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVyblxuICAgIHNldENvbW1lbnRFZGl0b3IoeyBvbGRMaW5lLCBuZXdMaW5lIH0pXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgfVxuXG4gIGNvbnN0IHNhdmVDb21tZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghc2VsZWN0ZWRGaWxlIHx8ICFjb21tZW50RWRpdG9yIHx8IGJ1c3kpIHJldHVyblxuICAgIGNvbnN0IHRleHQgPSBjb21tZW50VGV4dC50cmltKClcbiAgICBpZiAoIXRleHQpIHJldHVyblxuICAgIGNvbnN0IGNvbW1lbnQ6IFJldmlld0NvbW1lbnQgPSB7XG4gICAgICBpZDogdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gLFxuICAgICAgcGF0aDogc2VsZWN0ZWRGaWxlLnBhdGgsXG4gICAgICBsaW5lTmV3OiBjb21tZW50RWRpdG9yLm5ld0xpbmUsXG4gICAgICBsaW5lT2xkOiBjb21tZW50RWRpdG9yLm9sZExpbmUsXG4gICAgICB0ZXh0LFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmV4dCA9IFsuLi5jb21tZW50cywgY29tbWVudF1cbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdjb21tZW50LnNhdmVkJykgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2FuY2VsQ29tbWVudCA9ICgpID0+IHtcbiAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gIH1cblxuICBjb25zdCBkZWxldGVDb21tZW50ID0gYXN5bmMgKGlkOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gYy5pZCAhPT0gaWQpXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBpZiAoYWN0aXZlQ3dkICYmIChhd2FpdCBzYXZlQ29tbWVudHMoYWN0aXZlQ3dkLCBuZXh0KSkpIHtcbiAgICAgICAgc2V0Q29tbWVudHMobmV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBBSSByZXZpZXcgKC9yZXZpZXcpOiBydW4sIHJlLXJ1biwgYW5kIGhhbmQgZmluZGluZ3MgdG8gdGhlIGFnZW50IC0tLS1cbiAgY29uc3Qgb25SZXZpZXcgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgcmV2aWV3aW5nIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldFJldmlld2luZyh0cnVlKVxuICAgIHNldFJldmlldyhudWxsKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXZpZXdTY29wZSA9IHNjb3BlID09PSAnYnJhbmNoJyA/ICdicmFuY2gnIDogc2NvcGUgPT09ICdjb21taXQnICYmIHNlbGVjdGVkQ29tbWl0ID8gJ2NvbW1pdCcgOiAndW5jb21taXR0ZWQnXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5SZXZpZXcoYWN0aXZlQ3dkLCBjdXJyZW50SWQgPz8gbnVsbCwgcmV2aWV3U2NvcGUsIGJhc2VCcmFuY2ggPz8gdW5kZWZpbmVkLCBzZWxlY3RlZENvbW1pdD8uaGFzaCA/PyB1bmRlZmluZWQpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIHNldFJldmlldyhyZXN1bHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LnJldmlld0ZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LnJldmlld0ZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFJldmlld2luZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogQ29tcG9zZSBhIFwic2VuZCB0byBhZ2VudFwiIG1lc3NhZ2UgZnJvbSBmaW5kaW5ncyBvciBQUiBjb21tZW50cy4gKi9cbiAgY29uc3QgY29tcG9zZUZpbmRpbmdzTWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdGaW5kaW5nW10+KClcbiAgICBmb3IgKGNvbnN0IGYgb2YgcmV2aWV3Py5maW5kaW5ncyA/PyBbXSkge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoZi5maWxlKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChmKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGYuZmlsZSwgW2ZdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQiBBSSBcdThCQzRcdTVCQTFcdTUzRDFcdTczQjBcdUZGMDhBZGRyZXNzIHRoZSByZXZpZXcgZmluZGluZ3NcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLCAnJ11cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBmIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBmLmxpbmVTdGFydCA9PT0gZi5saW5lRW5kID8gYDoke2YubGluZVN0YXJ0fWAgOiBgOiR7Zi5saW5lU3RhcnR9LSR7Zi5saW5lRW5kfWBcbiAgICAgICAgbGluZXMucHVzaChgLSBbJHtmLnByaW9yaXR5fV0gJHtwYXRofSR7cmFuZ2V9OiAke2YudGl0bGV9IFx1MjAxNCAke2YuZGV0YWlsfWApXG4gICAgICAgIGlmIChmLnN1Z2dlc3Rpb24pIGxpbmVzLnB1c2goYCAgXFxgXFxgXFxgXFxuJHtmLnN1Z2dlc3Rpb259XFxuICBcXGBcXGBcXGBgKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBjb21wb3NlUHJNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKCFwcj8ucHIgfHwgcHIuY29tbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbYFx1OEJGN1x1NTkwNFx1NzQwNiBQUiAjJHtwci5wci5udW1iZXJ9XHVGRjA4JHtwci5wci50aXRsZX1cdUZGMDlcdTc2ODRcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBQUiBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQWAsICcnXVxuICAgIGZvciAoY29uc3QgYyBvZiBwci5jb21tZW50cykge1xuICAgICAgY29uc3QgYW5jaG9yID0gYy5wYXRoID8gYCR7Yy5wYXRofSR7Yy5saW5lID8gYDoke2MubGluZX1gIDogJyd9YCA6ICdnZW5lcmFsJ1xuICAgICAgbGluZXMucHVzaChgLSAke2FuY2hvcn0gKCR7Yy5hdXRob3J9KTogJHtjLmJvZHl9YClcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBvcGVuU2VuZFBhbmVsV2l0aCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgICBzZXRTZW5kVGV4dCh0ZXh0KVxuICAgIHNldFNlbmRPcGVuKHRydWUpXG4gIH1cblxuICAvLyAtLS0tIGVkaXRvciBpbnRlZ3JhdGlvbiAodmlhIGRzaC1wbHVnaW4tb3Blbi1lZGl0b3IpIC0tLS1cbiAgY29uc3Qgb3BlbkZpbGUgPSBhc3luYyAocGF0aDogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3BlbkluRWRpdG9yKGFjdGl2ZUN3ZCwgcGF0aCwgbGluZSlcbiAgICBpZiAoIXJlc3VsdC5vaykgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogYCR7dCgnZWRpdG9yLmZhaWxlZCcpfTogJHtyZXN1bHQuZXJyb3IgPz8gJyd9YCB9KVxuICB9XG5cbiAgLyoqIEp1bXAgZnJvbSBhIFBSIGNvbW1lbnQgdG8gdGhlIGZpbGUgKGFuZCBoaWdobGlnaHQgdGhlIGxpbmUpLiAqL1xuICBjb25zdCBvblByQ29tbWVudENsaWNrID0gKHBhdGg6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsIGxpbmU6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpID0+IHtcbiAgICBpZiAocGF0aCkganVtcFRvKHBhdGgsIGxpbmUgPz8gdW5kZWZpbmVkKVxuICAgIGVsc2Ugc2V0SnVtcExpbmUobnVsbClcbiAgfVxuXG4gIC8vIC0tLS0gZmVlZGJhY2sgbG9vcDogY29tbWVudHMgXHUyMTkyIGFnZW50IChwcm9tcHQgaW5qZWN0aW9uLCBjb3B5IGZhbGxiYWNrKSAtLS0tXG4gIGNvbnN0IGNvbXBvc2VSZXZpZXdNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKGNvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0NvbW1lbnRbXT4oKVxuICAgIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoYy5wYXRoKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChjKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGMucGF0aCwgW2NdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXG4gICAgICAnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJyxcbiAgICAgICcnLFxuICAgIF1cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBjIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhdGh9JHthbmNob3J9OiAke2MudGV4dH1gKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBvcGVuU2VuZFBhbmVsID0gKCkgPT4ge1xuICAgIHNldFNlbmRUZXh0KGNvbXBvc2VSZXZpZXdNZXNzYWdlKCkpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIGNvbnN0IHNlbmRUb0FnZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRleHQgPSBzZW5kVGV4dC50cmltKClcbiAgICBpZiAoIXRleHQgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRjb21lID0gYXdhaXQgaW5qZWN0VG9TZXNzaW9uKHNlc3Npb25zLCBjdXJyZW50SWQgPz8gbnVsbCwgdGV4dClcbiAgICAgIHNldFNlbmRPcGVuKGZhbHNlKVxuICAgICAgaWYgKG91dGNvbWUgPT09ICdzZW50Jykgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LnNlbnRUb0FnZW50JykgfSlcbiAgICAgIGVsc2UgaWYgKG91dGNvbWUgPT09ICdjb3BpZWQnKSBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSlcbiAgICAgIGVsc2Ugc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgncmV2aWV3LmNvcHlGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21taXQgdGhlIHN0YWdlZCBjaGFuZ2VzIHdpdGggdGhlIGVudGVyZWQgbWVzc2FnZS4gKi9cbiAgY29uc3Qgb25Db21taXQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGNvbW1pdE1lc3NhZ2UudHJpbSgpXG4gICAgaWYgKCFtZXNzYWdlIHx8IGJ1c3kgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuR2l0QWN0aW9uKGFjdGl2ZUN3ZCwgJ2NvbW1pdCcsIG1lc3NhZ2UpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIHNldENvbW1pdE1lc3NhZ2UoJycpXG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSByZXN1bHQuaGFzaCA/IGAke3Jlc3VsdC5oYXNofSAke3Jlc3VsdC5zdWJqZWN0ID8/ICcnfWAudHJpbSgpIDogKHJlc3VsdC5zdWJqZWN0ID8/ICcnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29tbWl0dGVkJywgeyBzdW1tYXJ5IH0pIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcuY29tbWl0RmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcuY29tbWl0RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogUHVzaCB0aGUgY3VycmVudCBicmFuY2ggKGRvdWJsZS1jbGljayB0byBjb25maXJtKS4gKi9cbiAgY29uc3Qgb25QdXNoID0gKCkgPT4ge1xuICAgIGlmIChidXN5IHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGlmIChjb25maXJtICE9PSAncHVzaCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ3B1c2gnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ3B1c2gnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICBzZXRCdXN5KHRydWUpXG4gICAgICBzZXROb3RpY2UobnVsbClcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkdpdEFjdGlvbihhY3RpdmVDd2QsICdwdXNoJylcbiAgICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5wdXNoZWQnKSB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgfVxuICAgIH0pKClcbiAgfVxuXG4gIC8qKiBTZWxlY3QgYSBsb2NhbCBjb21taXQgYW5kIGxvYWQgaXRzIGRpZmYgaW50byB0aGUgcmlnaHQgcGFuZS4gKi9cbiAgY29uc3Qgc2VsZWN0Q29tbWl0ID0gKGNvbW1pdDogQ29tbWl0SW5mbykgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0KGNvbW1pdClcbiAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgIHNldENvbW1pdERpZmZMb2FkaW5nKHRydWUpXG4gICAgdm9pZCBsb2FkQ29tbWl0RGlmZihhY3RpdmVDd2QsIGNvbW1pdC5oYXNoKVxuICAgICAgLnRoZW4oKGQpID0+IHtcbiAgICAgICAgc2V0Q29tbWl0RGlmZihkKVxuICAgICAgICBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSlcbiAgICAgICAgLy8gRGVmYXVsdCB0aGUgZmlsZSB0cmVlIHRvIHRoZSBmaXJzdCBjaGFuZ2VkIGZpbGUuXG4gICAgICAgIGlmIChkLm9rICYmIGQuZmlsZXMubGVuZ3RoID4gMCkgc2V0U2VsZWN0ZWRDb21taXRGaWxlKGQuZmlsZXNbMF0ucGF0aClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4gc2V0Q29tbWl0RGlmZkxvYWRpbmcoZmFsc2UpKVxuICB9XG5cbiAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9XCJkc2RyLW92ZXJsYXlcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQpIGNsb3NlKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXBhbmVsXCJcbiAgICAgICAgcm9sZT1cImRpYWxvZ1wiXG4gICAgICAgIGFyaWEtbW9kYWw9XCJ0cnVlXCJcbiAgICAgICAgYXJpYS1sYWJlbD17dCgncmV2aWV3LnRpdGxlJyl9XG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiBgJHtwcmVmcy53aWR0aH1weGAsIGhlaWdodDogYCR7cHJlZnMuaGVpZ2h0fXB4YCwgLi4uZGlmZlN0eWxlVmFycyhwcmVmcykgfSBhcyBDU1NQcm9wZXJ0aWVzfVxuICAgICAgPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cImVcIlxuICAgICAgICAgIG9uUmVzaXplPXsoZHgpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLndpZHRoID0gTWF0aC5tYXgoTUlOX1BBTkVMX1csIE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gNjQsIGQud2lkdGggKyBkeCkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJzXCJcbiAgICAgICAgICBvblJlc2l6ZT17KF9keCwgZHkpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLmhlaWdodCA9IE1hdGgubWF4KE1JTl9QQU5FTF9ILCBNYXRoLm1pbih3aW5kb3cuaW5uZXJIZWlnaHQgLSA2NCwgZC5oZWlnaHQgKyBkeSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJzZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCwgZHkpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLndpZHRoID0gTWF0aC5tYXgoTUlOX1BBTkVMX1csIE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gNjQsIGQud2lkdGggKyBkeCkpXG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItaGVhZGVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10aXRsZVwiPnt0KCdyZXZpZXcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10YWJzXCIgcm9sZT1cInRhYmxpc3RcIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcudGl0bGUnKX0+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGFiID09PSAnc2Vzc2lvbid9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGFiJHt0YWIgPT09ICdzZXNzaW9uJyA/ICcgZHNkci10YWItYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFRhYignc2Vzc2lvbicpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dCgndGFiLnNlc3Npb24nKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3RhYiA9PT0gJ3dvcmtzcGFjZSd9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGFiJHt0YWIgPT09ICd3b3Jrc3BhY2UnID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VGFiKCd3b3Jrc3BhY2UnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3QoJ3RhYi53b3Jrc3BhY2UnKX1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2NvcGVcIj5cbiAgICAgICAgICAgICAge3JlcG9zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3JlcG8ubGFiZWwnKX1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZXBvUGF0aCA/PyBhY3RpdmVDd2QgPz8gJyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXtyZXBvcy5tYXAoKHIpID0+ICh7IHZhbHVlOiByLnBhdGgsIGxhYmVsOiBgJHtiYXNlTmFtZShyLnBhdGgpfSR7ci5icmFuY2ggPyBgICgke3IuYnJhbmNofSlgIDogJyd9YCB9KSl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0UmVwb1BhdGgodilcbiAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICAgICAgc2V0UmV2aWV3KG51bGwpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3Njb3BlLmxhYmVsJyl9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3Njb3BlfVxuICAgICAgICAgICAgICAgIG9wdGlvbnM9e1NDT1BFX09QVElPTlMubWFwKChzKSA9PiAoeyB2YWx1ZTogcy5pZCwgbGFiZWw6IHQocy5sYWJlbCkgfSkpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0U2NvcGUodiBhcyBXb3Jrc3BhY2VTY29wZSlcbiAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYnJhbmNoJyA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUuYmFzZScpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2Jhc2VCcmFuY2ggPz8gJyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXticmFuY2hlcy5tYXAoKGIpID0+ICh7IHZhbHVlOiBiLCBsYWJlbDogYiB9KSl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0QmFzZUJyYW5jaH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXN1YnRpdGxlXCI+XG4gICAgICAgICAgICB7dGFiID09PSAnc2Vzc2lvbidcbiAgICAgICAgICAgICAgPyB0KCdyZXZpZXcuc2Vzc2lvblN0YXRzJywgeyByb3VuZHM6IHJvdW5kcy5sZW5ndGgsIGZpbGVzOiB0b3RhbFNlc3Npb25GaWxlcyB9KVxuICAgICAgICAgICAgICA6IHN0YXR1cz8uaXNSZXBvXG4gICAgICAgICAgICAgICAgPyBgJHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfSBcdTAwQjcgJHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IHRvdGFsQWRkZWQsIGRlbGV0ZWQ6IHRvdGFsRGVsZXRlZCB9KX0ke3N0YXR1cy5haGVhZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5haGVhZCcsIHsgbjogc3RhdHVzLmFoZWFkIH0pfWAgOiAnJ30ke3N0YXR1cy5iZWhpbmQgPiAwID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuYmVoaW5kJywgeyBuOiBzdGF0dXMuYmVoaW5kIH0pfWAgOiAnJ31gXG4gICAgICAgICAgICAgICAgOiB0KCdyZXZpZXcubm90UmVwbycpfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICAge3RhYiA9PT0gJ3dvcmtzcGFjZScgJiYgYWxsb3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8IGZpbGVzLmxlbmd0aCA9PT0gMH0gb25DbGljaz17KCkgPT4gb25BbGxBY3Rpb24oJ2FjY2VwdCcpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmFjY2VwdEFsbCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge3N0YWdlZENvdW50ID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIHJ1bkFwcGx5KCd1bnN0YWdlJyl9PlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy51bnN0YWdlQWxsJyl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1idG4tZGFuZ2VyJHtjb25maXJtID09PSAnYWxsJyA/ICcgZHNkci1idG4tY29uZmlybScgOiAnJ31gfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5IHx8IGZpbGVzLmxlbmd0aCA9PT0gMH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkFsbEFjdGlvbigncmV2ZXJ0Jyl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7Y29uZmlybSA9PT0gJ2FsbCcgPyB0KCdyZXZpZXcuY29uZmlybVJldmVydEFsbCcpIDogdCgncmV2aWV3LnJldmVydEFsbCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21taXQtaW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17Y29tbWl0TWVzc2FnZX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dCgncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJyl9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0Q29tbWl0TWVzc2FnZShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB2b2lkIG9uQ29tbWl0KClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5IHx8ICFjb21taXRNZXNzYWdlLnRyaW0oKSB8fCBzdGFnZWRDb3VudCA9PT0gMH0gb25DbGljaz17KCkgPT4gdm9pZCBvbkNvbW1pdCgpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNvbW1pdCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgYXJpYS1sYWJlbD17dCgncmV2aWV3LmNsb3NlJyl9IG9uQ2xpY2s9e2Nsb3NlfT5cbiAgICAgICAgICAgIDxJY29uWCAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7c2VuZE9wZW4gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbmRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VuZC10aXRsZVwiPnt0KCdyZXZpZXcuc2VuZFRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLWhpbnRcIj57dCgncmV2aWV3LnNlbmRIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzTmFtZT1cImRzZHItc2VuZC1pbnB1dFwiIHJlYWRPbmx5IHZhbHVlPXtzZW5kVGV4dH0gc3BlbGxDaGVjaz17ZmFsc2V9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHNldFNlbmRPcGVuKGZhbHNlKX0+XG4gICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG5cIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHZvaWQgbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KHNlbmRUZXh0KS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSksXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ3Jldmlldy5jb3B5RmFpbGVkJykgfSksXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29weScpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8ICFzZW5kVGV4dC50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc2VuZFRvQWdlbnQoKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5zZW5kVG9BZ2VudCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiByZXZpZXc/Lm9rICYmIHJldmlld2FibGVGaWxlcyA+IDAgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctc3RyaXBcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnZHNkci1yZXZpZXctYmFkJyA6ICdkc2RyLXJldmlldy1vayd9PlxuICAgICAgICAgICAgICAgIHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyB0KCdyZXZpZXcudmVyZGljdEluY29ycmVjdCcpIDogdCgncmV2aWV3LnZlcmRpY3RDb3JyZWN0Jyl9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1yZXZpZXctdG9nZ2xlJHtmaW5kaW5nc09wZW4gPyAnIGRzZHItcmV2aWV3LXRvZ2dsZS1vbicgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmluZGluZ3NPcGVuKCh2KSA9PiAhdil9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5maW5kaW5ncycsIHsgbjogcmV2aWV3LmZpbmRpbmdzLmxlbmd0aCB9KX1cbiAgICAgICAgICAgICAgICAgIHtyZXZpZXcudHJ1bmNhdGVkID8gJyAodHJ1bmNhdGVkKScgOiAnJ31cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcubm9GaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAge3Jldmlldy5tb2RlbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LW1vZGVsXCI+e3Jldmlldy5tb2RlbC5wcm92aWRlcn0ve3Jldmlldy5tb2RlbC5tb2RlbH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb3BlblNlbmRQYW5lbFdpdGgoY29tcG9zZUZpbmRpbmdzTWVzc2FnZSgpKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRGaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2ZpbmRpbmdzT3BlbiAmJiByZXZpZXcuZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmdzXCI+XG4gICAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5tYXAoKGZpbmRpbmcsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAga2V5PXtgJHtmaW5kaW5nLmZpbGV9OiR7ZmluZGluZy5saW5lU3RhcnR9LSR7ZmluZGluZy5saW5lRW5kfToke2l9YH1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1pdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ganVtcFRvKGZpbmRpbmcuZmlsZSwgZmluZGluZy5saW5lU3RhcnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmcucHJpb3JpdHl9YH0+e2ZpbmRpbmcucHJpb3JpdHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcudGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctbG9jXCI+e2ZpbmRpbmcuZmlsZX06e2ZpbmRpbmcubGluZVN0YXJ0fXtmaW5kaW5nLmxpbmVFbmQgIT09IGZpbmRpbmcubGluZVN0YXJ0ID8gYC0ke2ZpbmRpbmcubGluZUVuZH1gIDogJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZy5kZXRhaWwgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctZGV0YWlsXCI+e2ZpbmRpbmcuZGV0YWlsfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNvbmZpZGVuY2UnLCB7IGNvbmZpZGVuY2U6IGZpbmRpbmcuY29uZmlkZW5jZS50b0ZpeGVkKDIpIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcuc3VnZ2VzdGlvbiA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LnN1Z2dlc3Rpb24nKX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nLnN1Z2dlc3Rpb24gPyA8Y29kZSBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctc3VnZ2VzdGlvblwiPntmaW5kaW5nLnN1Z2dlc3Rpb259PC9jb2RlPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnc2Vzc2lvbicgPyAoXG4gICAgICAgICAgcm91bmRzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfTwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYm9keVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi5zZXNzaW9uJyl9PlxuICAgICAgICAgICAgICAgIHtyb3VuZHMubWFwKChyb3VuZCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JvdW5kLnJvdW5kfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5yb3VuZCcsIHsgcm91bmQ6IHJvdW5kLnJvdW5kIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIHtyb3VuZC5sYWJlbCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yb3VuZC1sYWJlbFwiIHRpdGxlPXtyb3VuZC5sYWJlbH0+e3JvdW5kLmxhYmVsfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Nlc3Npb25UcmVlcy5nZXQocm91bmQucm91bmQpID8/IFtdfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9eyh7IGl0ZW06IGNoYW5nZSwgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtyb3VuZC5yb3VuZH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZEtleSA9IHNlbGVjdGVkQ2hhbmdlID8gYCR7c2VsZWN0ZWRSb3VuZH06JHtzZWxlY3RlZENoYW5nZS5wYXRofWAgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17a2V5ID09PSBzZWxlY3RlZEtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2tleSA9PT0gc2VsZWN0ZWRLZXkgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmQucm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZFBhdGgoY2hhbmdlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoYW5nZS5oYXNEaWZmID8gJ2RzZHItY2hpcC1tJyA6ICdkc2RyLWNoaXAtdSd9YH0+e2NoYW5nZS5oYXNEaWZmID8gJ00nIDogJ1x1MDBCNyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2NoYW5nZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCIgdGl0bGU9e2NoYW5nZS50b29sfT57Y2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZlwiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZSA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENoYW5nZS5wYXRofT57c2VsZWN0ZWRDaGFuZ2UucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCI+e3NlbGVjdGVkQ2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UuaGFzRGlmZiA/IChcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID09PSAnc3BsaXQnICYmIGNoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2NoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKX0gYmVmb3JlTGFiZWw9e3QoJ3ZpZXcuYmVmb3JlJyl9IGFmdGVyTGFiZWw9e3QoJ3ZpZXcuYWZ0ZXInKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hhbmdlUm93cyhzZWxlY3RlZENoYW5nZSkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdyZXZpZXcubm9EaWZmRGF0YScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgICkgOiBlcnJvciAmJiAhc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgICA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi53b3Jrc3BhY2UnKX0+XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2FsbCcgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIHtzdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIHt1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXt1bnN0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICd1bnN0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgdW5zdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdzdGFnZWQnID8gKFxuICAgICAgICAgICAgICAgIHN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvblN0YWdlZCcpfSAoe3N0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIHNjb3BlRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Njb3BlLmJyYW5jaCcpfSB7YmFzZUJyYW5jaCA/IGBcdTIxOTQgJHtiYXNlQnJhbmNofWAgOiAnJ30gKHtzY29wZUZpbGVzLmxlbmd0aH0pXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Njb3BlLmJyYW5jaFJlYWRvbmx5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2xhc3QtdHVybicgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgnc2NvcGUubGFzdC10dXJuJyl9ICh7c2NvcGVGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Njb3BlVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubGFzdFR1cm5FbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHsoc2NvcGUgPT09ICdhbGwnIHx8IHNjb3BlID09PSAnY29tbWl0JykgJiYgaGlzdG9yeS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuaGlzdG9yeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRpbWVsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIHtoaXN0b3J5Lm1hcCgoY29tbWl0KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGwtaXRlbSR7c2VsZWN0ZWRDb21taXQ/Lmhhc2ggPT09IGNvbW1pdC5oYXNoID8gJyBkc2RyLXRsLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRsLXJhaWxcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci10bC1kb3Qke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1kb3QtbG9jYWwnIDogJyBkc2RyLXRsLWRvdC1yZW1vdGUnfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2h9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0Q29tbWl0KGNvbW1pdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWJhZGdlJHtjb21taXQuYWhlYWQgPyAnIGRzZHItdGwtYmFkZ2UtbG9jYWwnIDogJyBkc2RyLXRsLWJhZGdlLXJlbW90ZSd9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWl0LmFoZWFkID8gdCgnaGlzdG9yeS5sb2NhbCcpIDogdCgnaGlzdG9yeS5yZW1vdGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtc2hvcnRcIj57Y29tbWl0LnNob3J0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zdWJqZWN0XCIgdGl0bGU9e2NvbW1pdC5zdWJqZWN0fT57Y29tbWl0LnN1YmplY3R9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LW1ldGFcIj57Y29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoY29tbWl0LmRhdGUsIHQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayAmJiBjb21taXREaWZmLmZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5jb21taXRGaWxlcycpfSAoe2NvbW1pdERpZmYuZmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgbm9kZXM9e2NvbW1pdEZpbGVzVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogZmlsZSwgbmFtZSB9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtzZWxlY3RlZENvbW1pdEZpbGUgPT09IGZpbGUucGF0aCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNoaXAgZHNkci1jaGlwLW1cIj57ZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25CcmFuY2gnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1icmFuY2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtcmVmXCIgdGl0bGU9e3N0YXR1cy51cHN0cmVhbSA/PyB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFycm93XCI+XHUyMTkyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMudXBzdHJlYW0gPz8gdCgncmV2aWV3Lm5vVXBzdHJlYW0nKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5haGVhZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1haGVhZFwiPnt0KCdyZXZpZXcuYWhlYWQnLCB7IG46IHN0YXR1cy5haGVhZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmJlaGluZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1iZWhpbmRcIj57dCgncmV2aWV3LmJlaGluZCcsIHsgbjogc3RhdHVzLmJlaGluZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID09PSAwICYmIHN0YXR1cy5iZWhpbmQgPT09IDAgJiYgc3RhdHVzLnVwc3RyZWFtID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtc3luY1wiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biR7Y29uZmlybSA9PT0gJ3B1c2gnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgKHN0YXR1cz8uYWhlYWQgPz8gMCkgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25QdXNofVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdwdXNoJyA/IHQoJ3Jldmlldy5jb25maXJtUHVzaCcpIDogYCR7dCgncmV2aWV3LnB1c2gnKX0keyhzdGF0dXM/LmFoZWFkID8/IDApID4gMCA/IGAgKCR7c3RhdHVzPy5haGVhZCA/PyAwfSlgIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtwcj8ucHIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci50aXRsZScsIHsgbnVtYmVyOiBwci5wci5udW1iZXIgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IGAgXHUwMEI3ICR7dCgncHIuY29tbWVudHMnLCB7IG46IHByLmNvbW1lbnRzLmxlbmd0aCB9KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXByXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdwci5ub1ByJyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXByLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUHJDb21tZW50Q2xpY2soY29tbWVudC5wYXRoLCBjb21tZW50LmxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudC5wYXRoID8gYCR7YmFzZU5hbWUoY29tbWVudC5wYXRoKX0ke2NvbW1lbnQubGluZSA/IGA6JHtjb21tZW50LmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCd9IFx1MDBCNyB7Y29tbWVudC5hdXRob3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcHItdGV4dFwiPntjb21tZW50LmJvZHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VQck1lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci5zZW5kQ29tbWVudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdCA/IChcbiAgICAgICAgICAgICAgICBjb21taXREaWZmTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKSA6IGNvbW1pdERpZmY/Lm9rID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGFzaFwiPntzZWxlY3RlZENvbW1pdC5zaG9ydH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdG9vbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoc2VsZWN0ZWRDb21taXQuZGF0ZSwgdCl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogY29tbWl0RGlmZi5hZGRlZCwgZGVsZXRlZDogY29tbWl0RGlmZi5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7Y29tbWl0QWN0aXZlRmlsZSA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17Y29tbWl0QWN0aXZlRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jaGlwIGRzZHItY2hpcC1tXCI+e2NvbW1pdEZpbGVTdGF0dXMoY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/ICcnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtcGF0aFwiPntjb21taXRBY3RpdmVGaWxlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmIGdpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2dpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Z2l0RGlmZlJvd3MoY29tbWl0QWN0aXZlVGV4dCkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57Y29tbWl0RGlmZj8uZXJyb3IgPz8gdCgncmV2aWV3Lm5vRGlmZkRhdGEnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBzZWxlY3RlZEZpbGUgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRGaWxlLnBhdGh9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLm9yaWdQYXRoID8gYCBcdTIxOTAgJHtzZWxlY3RlZEZpbGUub3JpZ1BhdGh9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBzZWxlY3RlZEZpbGUuYWRkZWQsIGRlbGV0ZWQ6IHNlbGVjdGVkRmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCl9IHRpdGxlPXt0KCdlZGl0b3Iub3BlbkZpbGUnKX0+XG4gICAgICAgICAgICAgICAgICAgICAgXHUyMTk3IHt0KCdlZGl0b3Iub3BlbkZpbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnVuc3RhZ2VkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdhY2NlcHQnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5hY2NlcHQnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3Vuc3RhZ2UnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy51bnN0YWdlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1idG4tZGFuZ2VyJHtjb25maXJtID09PSAnZmlsZScgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdyZXZlcnQnLCBzZWxlY3RlZEZpbGUucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdmaWxlJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0JykgOiB0KCdyZXZpZXcucmV2ZXJ0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7dmlldyA9PT0gJ3NwbGl0JyAmJiAhc2VsZWN0ZWRGaWxlLmJpbmFyeSAmJiBnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZikubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5iZWZvcmUnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5hZnRlcicpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZikubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgPyA8SHVua1Rvb2xiYXIgaHVuaz17c2VsZWN0ZWRGaWxlLmh1bmtzW2JpXX0gYnVzeT17YnVzeX0gb25BY3Rpb249e29uSHVua0FjdGlvbn0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93RmluZGluZ3MgPSAocmV2aWV3Py5maW5kaW5ncyA/PyBbXSkuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmLmZpbGUgPT09IHNlbGVjdGVkRmlsZS5wYXRoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA+PSBmLmxpbmVTdGFydCAmJiByb3cucmlnaHROdW0gPD0gZi5saW5lRW5kIDogcm93LmxlZnROdW0gIT09IG51bGwgJiYgcm93LmxlZnROdW0gPj0gZi5saW5lU3RhcnQgJiYgcm93LmxlZnROdW0gPD0gZi5saW5lRW5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdDbHMgPSByb3dGaW5kaW5ncy5sZW5ndGggPiAwID8gYCBkc2RyLWNlbGwtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGp1bXBlZCA9IGp1bXBMaW5lICE9IG51bGwgJiYgKHJvdy5yaWdodE51bSA9PT0ganVtcExpbmUgfHwgKHJvdy5yaWdodE51bSA9PT0gbnVsbCAmJiByb3cubGVmdE51bSA9PT0ganVtcExpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tbWVudCBhbmNob3JzIHN0YXkgY29uc2lzdGVudCB3aXRoIHRoZSB1bmlmaWVkIHZpZXc6IGN0eCByb3dzIGV4cG9zZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYm90aCBsaW5lIG51bWJlcnMsIGNoYW5nZSByb3dzIGV4cG9zZSB0aGUgc2lkZSB0aGV5IGJlbG9uZyB0by5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5sZWZ0TnVtLCBuZXdMaW5lOiByb3cua2luZCA9PT0gJ2N0eCcgJiYgcm93LmxlZnROdW0gIT09IG51bGwgPyByb3cubGVmdE51bSA6IG51bGwgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cucmlnaHROdW0gIT09IG51bGwgPyByb3cucmlnaHROdW0gOiBudWxsLCBuZXdMaW5lOiByb3cucmlnaHROdW0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEtleSA9IGAke2xlZnRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7bGVmdEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEtleSA9IGAke3JpZ2h0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke3JpZ2h0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgbGVmdEFuY2hvci5vbGRMaW5lLCBsZWZ0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgcmlnaHRBbmNob3Iub2xkTGluZSwgcmlnaHRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGVuQnRuID0gKGxpbmU6IG51bWJlcikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRGaWxlLnBhdGggPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1vcGVubGluZVwiIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gYXJpYS1sYWJlbD17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRGaWxlLnBhdGgsIGxpbmUpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWVudEJ0biA9IChhbmNob3I6IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9LCBjb3VudDogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50TGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50PXtjb3VudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuPXtjb21tZW50UG9wb3ZlciA9PT0gYCR7YW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2FuY2hvci5uZXdMaW5lID8/ICduJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT3Blbj17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmU6IGFuY2hvci5vbGRMaW5lLCBuZXdMaW5lOiBhbmNob3IubmV3TGluZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50UG9wb3ZlcihudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldENvbW1lbnRQb3BvdmVyKChwcmV2KSA9PiAocHJldiA9PT0gYCR7YW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2FuY2hvci5uZXdMaW5lID8/ICduJ31gID8gbnVsbCA6IGAke2FuY2hvci5vbGRMaW5lID8/ICdvJ306JHthbmNob3IubmV3TGluZSA/PyAnbid9YCkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5sZWZ0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LmxlZnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5sZWZ0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dGaW5kaW5ncy5sZW5ndGggPiAwICYmIHJvdy5yaWdodE51bSA9PT0gbnVsbCA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gfT57cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKGxlZnRBbmNob3IsIGxlZnRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5yaWdodE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cucmlnaHROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9Pntyb3dGaW5kaW5nc1swXS5wcmlvcml0eX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xlZnRDb21tZW50cy5sZW5ndGggPiAwICYmIGNvbW1lbnRQb3BvdmVyID09PSBsZWZ0S2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1wb3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2NvbW1lbnQuaWR9IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXRleHRcIj57Y29tbWVudC50ZXh0fTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2NvbW1lbnQucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tZGFuZ2VyXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgZGVsZXRlQ29tbWVudChjb21tZW50LmlkKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLmxlbmd0aCA+IDAgJiYgY29tbWVudFBvcG92ZXIgPT09IHJpZ2h0S2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1wb3BcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjb21tZW50LmlkfSBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC10ZXh0XCI+e2NvbW1lbnQudGV4dH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjb21tZW50LnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoY29tbWVudC5pZCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuZGVsZXRlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgKGxlZnRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gIHx8IHJpZ2h0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPFVuaWZpZWREaWZmXG4gICAgICAgICAgICAgICAgICAgICAgZGlmZj17c2VsZWN0ZWRGaWxlLmRpZmZ9XG4gICAgICAgICAgICAgICAgICAgICAgaHVua3M9e3NlbGVjdGVkRmlsZS5odW5rc31cbiAgICAgICAgICAgICAgICAgICAgICBidXN5PXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgIG9uSHVua0FjdGlvbj17b25IdW5rQWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudHM9e2NvbW1lbnRzfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRFZGl0b3I9e2NvbW1lbnRFZGl0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFRleHQ9e2NvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tbWVudFRleHQ9e3NldENvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uT3BlbkNvbW1lbnQ9e29wZW5Db21tZW50fVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZUNvbW1lbnQ9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbENvbW1lbnQ9e2NhbmNlbENvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFBvcG92ZXI9e2NvbW1lbnRQb3BvdmVyfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlUG9wb3Zlcj17KGtleSkgPT4gc2V0Q29tbWVudFBvcG92ZXIoKHByZXYpID0+IChwcmV2ID09PSBrZXkgPyBudWxsIDoga2V5KSl9XG4gICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDb21tZW50PXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9XG4gICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk9eyFhbGxvd0FjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgcGF0aD17c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgcmV2aWV3RmluZGluZ3M9e3Jldmlldz8uZmluZGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuTGluZT17KHAsIGxpbmUpID0+IHZvaWQgb3BlbkZpbGUocCwgbGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAganVtcExpbmU9e2p1bXBMaW5lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntzY29wZSA9PT0gJ2NvbW1pdCcgPyB0KCdyZXZpZXcuc2VsZWN0Q29tbWl0JykgOiB0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yID8/IHQoJ3Jldmlldy5sb2FkRXJyb3InKX1cbiAgICAgICAgICAgIHshc3RhdHVzPy5pc1JlcG8gPyA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mb290XCI+XG4gICAgICAgICAgeyhsb2FkaW5nIHx8IGJ1c3kpICYmIHRhYiA9PT0gJ3dvcmtzcGFjZScgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwaW5uZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2J1c3kgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLW5vdGljZVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIHtub3RpY2UgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLW5vdGljZSBkc2RyLW5vdGljZS0ke25vdGljZS5raW5kfWB9Pntub3RpY2UudGV4dH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQ29uZmlnIGNhcmQgZm9yIHRoZSBQbHVnaW5zIGNvbmZpZ3VyYXRpb24gdGFiIChTZXR0aW5ncyBcdTIxOTIgUGx1Z2lucyBcdTIxOTIgXHU1M0VGXHU5MTREXHU3RjZFKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb25maWdDYXJkKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJkIGRzZHItY2ZnLWNhcmQtb3BlbicgOiAnZHNkci1jZmctY2FyZCd9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZFwiIGFyaWEtZXhwYW5kZWQ9e29wZW59IG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWhlYWQtdGV4dFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLW5hbWVcIj57dCgnc2V0dGluZ3MudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctZGVzY1wiPnt0KCdjb25maWcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93bk91dGxpbmUxNCBjbGFzc05hbWU9e29wZW4gPyAnZHNkci1jZmctY2FyZXQgZHNkci1jZmctY2FyZXQtb3BlbicgOiAnZHNkci1jZmctY2FyZXQnfSAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1ib2R5XCI+XG4gICAgICAgICAgPERpZmZSZXZpZXdQcmVmcyB0PXt0fSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbGk+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG4gIC8vIENvZGV4LXN0eWxlIHBlbmRpbmctY29tbWVudHMgc3RyaXAgYXQgdGhlIFRPUCBvZiB0aGUgY29tcG9zZXIsIHN0eWxlZCBhc1xuICAvLyB0aGUgY2FyZCdzIG93biBzdXJmYWNlIHNvIGl0IHJlYWRzIGFzIG9uZSBmdXNlZCBkaWFsb2cuXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uaW5wdXQuZG9jaycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29tbWVudHMtZG9jaycsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrLFxuICAgICksXG4gIClcbiAgLy8gVGhlIHBsdWdpbidzIG93biBzZXR0aW5ncyB0YWIgaW5zaWRlIFx1OEJCRVx1N0Y2RSBcdTIxOTIgXHU2M0QyXHU0RUY2IChub3QgdGhlIEdlbmVyYWwgc2VjdGlvbikuXG4gIC8vIFRoZSBwbHVnaW4ncyB3aG9sZSBjb25maWd1cmF0aW9uIGxpdmVzIGluIG9uZSBjYXJkIGluc2lkZVxuICAvLyBcdThCQkVcdTdGNkUgXHUyMTkyIFx1NjNEMlx1NEVGNiBcdTIxOTIgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFIChzZXR0aW5ncy5wbHVnaW4uaXRlbSk6IGZvbnQvc2l6ZS5cbiAgY3R4LnNsb3RzLmluamVjdCgnc2V0dGluZ3MucGx1Z2luLml0ZW0nLCAoKSA9PlxuICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3NldHRpbmdzLnBsdWdpbi5pdGVtJyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1jb25maWcnLFxuICAgICAgICBvcmRlcjogMzAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdDb25maWdDYXJkLFxuICAgICksXG4gIClcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmIHtcbiAgICBkaWZmKG9sZFN0ciwgbmV3U3RyLCBcbiAgICAvLyBUeXBlIGJlbG93IGlzIG5vdCBhY2N1cmF0ZS9jb21wbGV0ZSAtIHNlZSBhYm92ZSBmb3IgZnVsbCBwb3NzaWJpbGl0aWVzIC0gYnV0IGl0IGNvbXBpbGVzXG4gICAgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGxldCBjYWxsYmFjaztcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoJ2NhbGxiYWNrJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWxsb3cgc3ViY2xhc3NlcyB0byBtYXNzYWdlIHRoZSBpbnB1dCBwcmlvciB0byBydW5uaW5nXG4gICAgICAgIGNvbnN0IG9sZFN0cmluZyA9IHRoaXMuY2FzdElucHV0KG9sZFN0ciwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG5ld1N0cmluZyA9IHRoaXMuY2FzdElucHV0KG5ld1N0ciwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG9sZFRva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShvbGRTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgY29uc3QgbmV3VG9rZW5zID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG5ld1N0cmluZywgb3B0aW9ucykpO1xuICAgICAgICByZXR1cm4gdGhpcy5kaWZmV2l0aE9wdGlvbnNPYmoob2xkVG9rZW5zLCBuZXdUb2tlbnMsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGRvbmUgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5wb3N0UHJvY2Vzcyh2YWx1ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgY2FsbGJhY2sodmFsdWUpOyB9LCAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBuZXdUb2tlbnMubGVuZ3RoLCBvbGRMZW4gPSBvbGRUb2tlbnMubGVuZ3RoO1xuICAgICAgICBsZXQgZWRpdExlbmd0aCA9IDE7XG4gICAgICAgIGxldCBtYXhFZGl0TGVuZ3RoID0gbmV3TGVuICsgb2xkTGVuO1xuICAgICAgICBpZiAob3B0aW9ucy5tYXhFZGl0TGVuZ3RoICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1heEVkaXRMZW5ndGggPSBNYXRoLm1pbihtYXhFZGl0TGVuZ3RoLCBvcHRpb25zLm1heEVkaXRMZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heEV4ZWN1dGlvblRpbWUgPSAoX2EgPSBvcHRpb25zLnRpbWVvdXQpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IEluZmluaXR5O1xuICAgICAgICBjb25zdCBhYm9ydEFmdGVyVGltZXN0YW1wID0gRGF0ZS5ub3coKSArIG1heEV4ZWN1dGlvblRpbWU7XG4gICAgICAgIGNvbnN0IGJlc3RQYXRoID0gW3sgb2xkUG9zOiAtMSwgbGFzdENvbXBvbmVudDogdW5kZWZpbmVkIH1dO1xuICAgICAgICAvLyBTZWVkIGVkaXRMZW5ndGggPSAwLCBpLmUuIHRoZSBjb250ZW50IHN0YXJ0cyB3aXRoIHRoZSBzYW1lIHZhbHVlc1xuICAgICAgICBsZXQgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJlc3RQYXRoWzBdLCBuZXdUb2tlbnMsIG9sZFRva2VucywgMCwgb3B0aW9ucyk7XG4gICAgICAgIGlmIChiZXN0UGF0aFswXS5vbGRQb3MgKyAxID49IG9sZExlbiAmJiBuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgLy8gSWRlbnRpdHkgcGVyIHRoZSBlcXVhbGl0eSBhbmQgdG9rZW5pemVyXG4gICAgICAgICAgICByZXR1cm4gZG9uZSh0aGlzLmJ1aWxkVmFsdWVzKGJlc3RQYXRoWzBdLmxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25jZSB3ZSBoaXQgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGVkaXQgZ3JhcGggb24gc29tZSBkaWFnb25hbCBrLCB3ZSBjYW5cbiAgICAgICAgLy8gZGVmaW5pdGVseSByZWFjaCB0aGUgZW5kIG9mIHRoZSBlZGl0IGdyYXBoIGluIG5vIG1vcmUgdGhhbiBrIGVkaXRzLCBzb1xuICAgICAgICAvLyB0aGVyZSdzIG5vIHBvaW50IGluIGNvbnNpZGVyaW5nIGFueSBtb3ZlcyB0byBkaWFnb25hbCBrKzEgYW55IG1vcmUgKGZyb21cbiAgICAgICAgLy8gd2hpY2ggd2UncmUgZ3VhcmFudGVlZCB0byBuZWVkIGF0IGxlYXN0IGsrMSBtb3JlIGVkaXRzKS5cbiAgICAgICAgLy8gU2ltaWxhcmx5LCBvbmNlIHdlJ3ZlIHJlYWNoZWQgdGhlIGJvdHRvbSBvZiB0aGUgZWRpdCBncmFwaCwgdGhlcmUncyBub1xuICAgICAgICAvLyBwb2ludCBjb25zaWRlcmluZyBtb3ZlcyB0byBsb3dlciBkaWFnb25hbHMuXG4gICAgICAgIC8vIFdlIHJlY29yZCB0aGlzIGZhY3QgYnkgc2V0dGluZyBtaW5EaWFnb25hbFRvQ29uc2lkZXIgYW5kXG4gICAgICAgIC8vIG1heERpYWdvbmFsVG9Db25zaWRlciB0byBzb21lIGZpbml0ZSB2YWx1ZSBvbmNlIHdlJ3ZlIGhpdCB0aGUgZWRnZSBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaC5cbiAgICAgICAgLy8gVGhpcyBvcHRpbWl6YXRpb24gaXMgbm90IGZhaXRoZnVsIHRvIHRoZSBvcmlnaW5hbCBhbGdvcml0aG0gcHJlc2VudGVkIGluXG4gICAgICAgIC8vIE15ZXJzJ3MgcGFwZXIsIHdoaWNoIGluc3RlYWQgcG9pbnRsZXNzbHkgZXh0ZW5kcyBELXBhdGhzIG9mZiB0aGUgZW5kIG9mXG4gICAgICAgIC8vIHRoZSBlZGl0IGdyYXBoIC0gc2VlIHBhZ2UgNyBvZiBNeWVycydzIHBhcGVyIHdoaWNoIG5vdGVzIHRoaXMgcG9pbnRcbiAgICAgICAgLy8gZXhwbGljaXRseSBhbmQgaWxsdXN0cmF0ZXMgaXQgd2l0aCBhIGRpYWdyYW0uIFRoaXMgaGFzIG1ham9yIHBlcmZvcm1hbmNlXG4gICAgICAgIC8vIGltcGxpY2F0aW9ucyBmb3Igc29tZSBjb21tb24gc2NlbmFyaW9zLiBGb3IgaW5zdGFuY2UsIHRvIGNvbXB1dGUgYSBkaWZmXG4gICAgICAgIC8vIHdoZXJlIHRoZSBuZXcgdGV4dCBzaW1wbHkgYXBwZW5kcyBkIGNoYXJhY3RlcnMgb24gdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgLy8gb3JpZ2luYWwgdGV4dCBvZiBsZW5ndGggbiwgdGhlIHRydWUgTXllcnMgYWxnb3JpdGhtIHdpbGwgdGFrZSBPKG4rZF4yKVxuICAgICAgICAvLyB0aW1lIHdoaWxlIHRoaXMgb3B0aW1pemF0aW9uIG5lZWRzIG9ubHkgTyhuK2QpIHRpbWUuXG4gICAgICAgIGxldCBtaW5EaWFnb25hbFRvQ29uc2lkZXIgPSAtSW5maW5pdHksIG1heERpYWdvbmFsVG9Db25zaWRlciA9IEluZmluaXR5O1xuICAgICAgICAvLyBNYWluIHdvcmtlciBtZXRob2QuIGNoZWNrcyBhbGwgcGVybXV0YXRpb25zIG9mIGEgZ2l2ZW4gZWRpdCBsZW5ndGggZm9yIGFjY2VwdGFuY2UuXG4gICAgICAgIGNvbnN0IGV4ZWNFZGl0TGVuZ3RoID0gKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZGlhZ29uYWxQYXRoID0gTWF0aC5tYXgobWluRGlhZ29uYWxUb0NvbnNpZGVyLCAtZWRpdExlbmd0aCk7IGRpYWdvbmFsUGF0aCA8PSBNYXRoLm1pbihtYXhEaWFnb25hbFRvQ29uc2lkZXIsIGVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggKz0gMikge1xuICAgICAgICAgICAgICAgIGxldCBiYXNlUGF0aDtcbiAgICAgICAgICAgICAgICBjb25zdCByZW1vdmVQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0sIGFkZFBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBvbmUgZWxzZSBpcyBnb2luZyB0byBhdHRlbXB0IHRvIHVzZSB0aGlzIHZhbHVlLCBjbGVhciBpdFxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gcGVyZiBvcHRpbWlzYXRpb24uIFRoaXMgdHlwZS12aW9sYXRpbmcgdmFsdWUgd2lsbCBuZXZlciBiZSByZWFkLlxuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGNhbkFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChhZGRQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoYXQgbmV3UG9zIHdpbGwgYmUgYWZ0ZXIgd2UgZG8gYW4gaW5zZXJ0aW9uOlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRQYXRoTmV3UG9zID0gYWRkUGF0aC5vbGRQb3MgLSBkaWFnb25hbFBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGNhbkFkZCA9IGFkZFBhdGggJiYgMCA8PSBhZGRQYXRoTmV3UG9zICYmIGFkZFBhdGhOZXdQb3MgPCBuZXdMZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGNhblJlbW92ZSA9IHJlbW92ZVBhdGggJiYgcmVtb3ZlUGF0aC5vbGRQb3MgKyAxIDwgb2xkTGVuO1xuICAgICAgICAgICAgICAgIGlmICghY2FuQWRkICYmICFjYW5SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBwYXRoIGlzIGEgdGVybWluYWwgdGhlbiBwcnVuZVxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gcGVyZiBvcHRpbWlzYXRpb24uIFRoaXMgdHlwZS12aW9sYXRpbmcgdmFsdWUgd2lsbCBuZXZlciBiZSByZWFkLlxuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBkaWFnb25hbCB0aGF0IHdlIHdhbnQgdG8gYnJhbmNoIGZyb20uIFdlIHNlbGVjdCB0aGUgcHJpb3JcbiAgICAgICAgICAgICAgICAvLyBwYXRoIHdob3NlIHBvc2l0aW9uIGluIHRoZSBvbGQgc3RyaW5nIGlzIHRoZSBmYXJ0aGVzdCBmcm9tIHRoZSBvcmlnaW5cbiAgICAgICAgICAgICAgICAvLyBhbmQgZG9lcyBub3QgcGFzcyB0aGUgYm91bmRzIG9mIHRoZSBkaWZmIGdyYXBoXG4gICAgICAgICAgICAgICAgaWYgKCFjYW5SZW1vdmUgfHwgKGNhbkFkZCAmJiByZW1vdmVQYXRoLm9sZFBvcyA8IGFkZFBhdGgub2xkUG9zKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKGFkZFBhdGgsIHRydWUsIGZhbHNlLCAwLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gdGhpcy5hZGRUb1BhdGgocmVtb3ZlUGF0aCwgZmFsc2UsIHRydWUsIDEsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbiAmJiBuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGhpdCB0aGUgZW5kIG9mIGJvdGggc3RyaW5ncywgdGhlbiB3ZSBhcmUgZG9uZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZSh0aGlzLmJ1aWxkVmFsdWVzKGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSkgfHwgdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSBiYXNlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm9sZFBvcyArIDEgPj0gb2xkTGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBNYXRoLm1pbihtYXhEaWFnb25hbFRvQ29uc2lkZXIsIGRpYWdvbmFsUGF0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5tYXgobWluRGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVkaXRMZW5ndGgrKztcbiAgICAgICAgfTtcbiAgICAgICAgLy8gUGVyZm9ybXMgdGhlIGxlbmd0aCBvZiBlZGl0IGl0ZXJhdGlvbi4gSXMgYSBiaXQgZnVnbHkgYXMgdGhpcyBoYXMgdG8gc3VwcG9ydCB0aGVcbiAgICAgICAgLy8gc3luYyBhbmQgYXN5bmMgbW9kZSB3aGljaCBpcyBuZXZlciBmdW4uIExvb3BzIG92ZXIgZXhlY0VkaXRMZW5ndGggdW50aWwgYSB2YWx1ZVxuICAgICAgICAvLyBpcyBwcm9kdWNlZCwgb3IgdW50aWwgdGhlIGVkaXQgbGVuZ3RoIGV4Y2VlZHMgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoIChpZiBnaXZlbiksXG4gICAgICAgIC8vIGluIHdoaWNoIGNhc2UgaXQgd2lsbCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiBleGVjKCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWRpdExlbmd0aCA+IG1heEVkaXRMZW5ndGggfHwgRGF0ZS5ub3coKSA+IGFib3J0QWZ0ZXJUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXhlY0VkaXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhlYygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9KCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGVkaXRMZW5ndGggPD0gbWF4RWRpdExlbmd0aCAmJiBEYXRlLm5vdygpIDw9IGFib3J0QWZ0ZXJUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXQgPSBleGVjRWRpdExlbmd0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWRkVG9QYXRoKHBhdGgsIGFkZGVkLCByZW1vdmVkLCBvbGRQb3NJbmMsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBhdGgubGFzdENvbXBvbmVudDtcbiAgICAgICAgaWYgKGxhc3QgJiYgIW9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4gJiYgbGFzdC5hZGRlZCA9PT0gYWRkZWQgJiYgbGFzdC5yZW1vdmVkID09PSByZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogbGFzdC5jb3VudCArIDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCwgcHJldmlvdXNDb21wb25lbnQ6IGxhc3QucHJldmlvdXNDb21wb25lbnQgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb2xkUG9zOiBwYXRoLm9sZFBvcyArIG9sZFBvc0luYyxcbiAgICAgICAgICAgICAgICBsYXN0Q29tcG9uZW50OiB7IGNvdW50OiAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIGRpYWdvbmFsUGF0aCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBuZXdUb2tlbnMubGVuZ3RoLCBvbGRMZW4gPSBvbGRUb2tlbnMubGVuZ3RoO1xuICAgICAgICBsZXQgb2xkUG9zID0gYmFzZVBhdGgub2xkUG9zLCBuZXdQb3MgPSBvbGRQb3MgLSBkaWFnb25hbFBhdGgsIGNvbW1vbkNvdW50ID0gMDtcbiAgICAgICAgd2hpbGUgKG5ld1BvcyArIDEgPCBuZXdMZW4gJiYgb2xkUG9zICsgMSA8IG9sZExlbiAmJiB0aGlzLmVxdWFscyhvbGRUb2tlbnNbb2xkUG9zICsgMV0sIG5ld1Rva2Vuc1tuZXdQb3MgKyAxXSwgb3B0aW9ucykpIHtcbiAgICAgICAgICAgIG5ld1BvcysrO1xuICAgICAgICAgICAgb2xkUG9zKys7XG4gICAgICAgICAgICBjb21tb25Db3VudCsrO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogMSwgcHJldmlvdXNDb21wb25lbnQ6IGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIGFkZGVkOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbW9uQ291bnQgJiYgIW9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4pIHtcbiAgICAgICAgICAgIGJhc2VQYXRoLmxhc3RDb21wb25lbnQgPSB7IGNvdW50OiBjb21tb25Db3VudCwgcHJldmlvdXNDb21wb25lbnQ6IGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIGFkZGVkOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBiYXNlUGF0aC5vbGRQb3MgPSBvbGRQb3M7XG4gICAgICAgIHJldHVybiBuZXdQb3M7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucy5jb21wYXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb21wYXJhdG9yKGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodFxuICAgICAgICAgICAgICAgIHx8ICghIW9wdGlvbnMuaWdub3JlQ2FzZSAmJiBsZWZ0LnRvTG93ZXJDYXNlKCkgPT09IHJpZ2h0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlbW92ZUVtcHR5KGFycmF5KSB7XG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV0pIHtcbiAgICAgICAgICAgICAgICByZXQucHVzaChhcnJheVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIGNhc3RJbnB1dCh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICB0b2tlbml6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG4gICAgfVxuICAgIGpvaW4oY2hhcnMpIHtcbiAgICAgICAgLy8gQXNzdW1lcyBWYWx1ZVQgaXMgc3RyaW5nLCB3aGljaCBpcyB0aGUgY2FzZSBmb3IgbW9zdCBzdWJjbGFzc2VzLlxuICAgICAgICAvLyBXaGVuIGl0J3MgZmFsc2UsIGUuZy4gaW4gZGlmZkFycmF5cywgdGhpcyBtZXRob2QgbmVlZHMgdG8gYmUgb3ZlcnJpZGRlbiAoZS5nLiB3aXRoIGEgbm8tb3ApXG4gICAgICAgIC8vIFllcywgdGhlIGNhc3RzIGFyZSB2ZXJib3NlIGFuZCB1Z2x5LCBiZWNhdXNlIHRoaXMgcGF0dGVybiAtIG9mIGhhdmluZyB0aGUgYmFzZSBjbGFzcyBTT1JUIE9GXG4gICAgICAgIC8vIGFzc3VtZSB0b2tlbnMgYW5kIHZhbHVlcyBhcmUgc3RyaW5ncywgYnV0IG5vdCBjb21wbGV0ZWx5IC0gaXMgd2VpcmQgYW5kIGphbmt5LlxuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfVxuICAgIHBvc3RQcm9jZXNzKGNoYW5nZU9iamVjdHMsIFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBjaGFuZ2VPYmplY3RzO1xuICAgIH1cbiAgICBnZXQgdXNlTG9uZ2VzdFRva2VuKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGJ1aWxkVmFsdWVzKGxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSB7XG4gICAgICAgIC8vIEZpcnN0IHdlIGNvbnZlcnQgb3VyIGxpbmtlZCBsaXN0IG9mIGNvbXBvbmVudHMgaW4gcmV2ZXJzZSBvcmRlciB0byBhblxuICAgICAgICAvLyBhcnJheSBpbiB0aGUgcmlnaHQgb3JkZXI6XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgbGV0IG5leHRDb21wb25lbnQ7XG4gICAgICAgIHdoaWxlIChsYXN0Q29tcG9uZW50KSB7XG4gICAgICAgICAgICBjb21wb25lbnRzLnB1c2gobGFzdENvbXBvbmVudCk7XG4gICAgICAgICAgICBuZXh0Q29tcG9uZW50ID0gbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGRlbGV0ZSBsYXN0Q29tcG9uZW50LnByZXZpb3VzQ29tcG9uZW50O1xuICAgICAgICAgICAgbGFzdENvbXBvbmVudCA9IG5leHRDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29tcG9uZW50cy5yZXZlcnNlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudExlbiA9IGNvbXBvbmVudHMubGVuZ3RoO1xuICAgICAgICBsZXQgY29tcG9uZW50UG9zID0gMCwgbmV3UG9zID0gMCwgb2xkUG9zID0gMDtcbiAgICAgICAgZm9yICg7IGNvbXBvbmVudFBvcyA8IGNvbXBvbmVudExlbjsgY29tcG9uZW50UG9zKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LnJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCAmJiB0aGlzLnVzZUxvbmdlc3RUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gb2xkVG9rZW5zW29sZFBvcyArIGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4odmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG5ld1Rva2Vucy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgICAgIC8vIENvbW1vbiBjYXNlXG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4ob2xkVG9rZW5zLnNsaWNlKG9sZFBvcywgb2xkUG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICB9XG59XG4iLCAiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlLmpzJztcbmltcG9ydCB7IGdlbmVyYXRlT3B0aW9ucyB9IGZyb20gJy4uL3V0aWwvcGFyYW1zLmpzJztcbmNsYXNzIExpbmVEaWZmIGV4dGVuZHMgRGlmZiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMudG9rZW5pemUgPSB0b2tlbml6ZTtcbiAgICB9XG4gICAgZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIElmIHdlJ3JlIGlnbm9yaW5nIHdoaXRlc3BhY2UsIHdlIG5lZWQgdG8gbm9ybWFsaXNlIGxpbmVzIGJ5IHN0cmlwcGluZ1xuICAgICAgICAvLyB3aGl0ZXNwYWNlIGJlZm9yZSBjaGVja2luZyBlcXVhbGl0eS4gKFRoaXMgaGFzIGFuIGFubm95aW5nIGludGVyYWN0aW9uXG4gICAgICAgIC8vIHdpdGggbmV3bGluZUlzVG9rZW4gdGhhdCByZXF1aXJlcyBzcGVjaWFsIGhhbmRsaW5nOiBpZiBuZXdsaW5lcyBnZXQgdGhlaXJcbiAgICAgICAgLy8gb3duIHRva2VuLCB0aGVuIHdlIERPTidUIHdhbnQgdG8gdHJpbSB0aGUgKm5ld2xpbmUqIHRva2VucyBkb3duIHRvIGVtcHR5XG4gICAgICAgIC8vIHN0cmluZ3MsIHNpbmNlIHRoaXMgd291bGQgY2F1c2UgdXMgdG8gdHJlYXQgd2hpdGVzcGFjZS1vbmx5IGxpbmUgY29udGVudFxuICAgICAgICAvLyBhcyBlcXVhbCB0byBhIHNlcGFyYXRvciBiZXR3ZWVuIGxpbmVzLCB3aGljaCB3b3VsZCBiZSB3ZWlyZCBhbmRcbiAgICAgICAgLy8gaW5jb25zaXN0ZW50IHdpdGggdGhlIGRvY3VtZW50ZWQgYmVoYXZpb3Igb2YgdGhlIG9wdGlvbnMuKVxuICAgICAgICBpZiAob3B0aW9ucy5pZ25vcmVXaGl0ZXNwYWNlKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubmV3bGluZUlzVG9rZW4gfHwgIWxlZnQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFyaWdodC5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmlnbm9yZU5ld2xpbmVBdEVvZiAmJiAhb3B0aW9ucy5uZXdsaW5lSXNUb2tlbikge1xuICAgICAgICAgICAgaWYgKGxlZnQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJpZ2h0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5lcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBsaW5lRGlmZiA9IG5ldyBMaW5lRGlmZigpO1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmVHJpbW1lZExpbmVzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IGdlbmVyYXRlT3B0aW9ucyhvcHRpb25zLCB7IGlnbm9yZVdoaXRlc3BhY2U6IHRydWUgfSk7XG4gICAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuLy8gRXhwb3J0ZWQgc3RhbmRhbG9uZSBzbyBpdCBjYW4gYmUgdXNlZCBmcm9tIGpzb25EaWZmIHRvby5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbml6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnN0cmlwVHJhaWxpbmdDcikge1xuICAgICAgICAvLyByZW1vdmUgb25lIFxcciBiZWZvcmUgXFxuIHRvIG1hdGNoIEdOVSBkaWZmJ3MgLS1zdHJpcC10cmFpbGluZy1jciBiZWhhdmlvclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcclxcbi9nLCAnXFxuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldExpbmVzID0gW10sIGxpbmVzQW5kTmV3bGluZXMgPSB2YWx1ZS5zcGxpdCgvKFxcbnxcXHJcXG4pLyk7XG4gICAgLy8gSWdub3JlIHRoZSBmaW5hbCBlbXB0eSB0b2tlbiB0aGF0IG9jY3VycyBpZiB0aGUgc3RyaW5nIGVuZHMgd2l0aCBhIG5ldyBsaW5lXG4gICAgaWYgKCFsaW5lc0FuZE5ld2xpbmVzW2xpbmVzQW5kTmV3bGluZXMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgbGluZXNBbmROZXdsaW5lcy5wb3AoKTtcbiAgICB9XG4gICAgLy8gTWVyZ2UgdGhlIGNvbnRlbnQgYW5kIGxpbmUgc2VwYXJhdG9ycyBpbnRvIHNpbmdsZSB0b2tlbnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzQW5kTmV3bGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzQW5kTmV3bGluZXNbaV07XG4gICAgICAgIGlmIChpICUgMiAmJiAhb3B0aW9ucy5uZXdsaW5lSXNUb2tlbikge1xuICAgICAgICAgICAgcmV0TGluZXNbcmV0TGluZXMubGVuZ3RoIC0gMV0gKz0gbGluZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldExpbmVzLnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldExpbmVzO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUJBLG1CQUFxRjs7O0FDbkJyRixJQUFxQixPQUFyQixNQUEwQjtBQUFBLEVBQ3RCLEtBQUssUUFBUSxRQUViLFVBQVUsQ0FBQyxHQUFHO0FBQ1YsUUFBSTtBQUNKLFFBQUksT0FBTyxZQUFZLFlBQVk7QUFDL0IsaUJBQVc7QUFDWCxnQkFBVSxDQUFDO0FBQUEsSUFDZixXQUNTLGNBQWMsU0FBUztBQUM1QixpQkFBVyxRQUFRO0FBQUEsSUFDdkI7QUFFQSxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxXQUFPLEtBQUssbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFFBQVE7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFVBQVU7QUFDeEQsUUFBSTtBQUNKLFVBQU0sT0FBTyxDQUFDLFVBQVU7QUFDcEIsY0FBUSxLQUFLLFlBQVksT0FBTyxPQUFPO0FBQ3ZDLFVBQUksVUFBVTtBQUNWLG1CQUFXLFdBQVk7QUFBRSxtQkFBUyxLQUFLO0FBQUEsUUFBRyxHQUFHLENBQUM7QUFD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QyxFQUFFO0FBQUEsRUFDdkQsRUFBRTtBQUNKO0FBTUEsSUFBTSxhQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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ekQ7QUFBQSxpREFBQyxZQUFPLE1BQUssVUFBUyxXQUFVLGlCQUFnQixpQkFBZSxNQUFNLFNBQVMsTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsR0FDbkc7QUFBQSxtREFBQyxVQUFLLFdBQVUsc0JBQ2Q7QUFBQSxvREFBQyxVQUFLLFdBQVUsaUJBQWlCLFlBQUUsZ0JBQWdCLEdBQUU7QUFBQSxRQUNyRCw0Q0FBQyxVQUFLLFdBQVUsaUJBQWlCLFlBQUUsY0FBYyxHQUFFO0FBQUEsU0FDckQ7QUFBQSxNQUNBLDRDQUFDLDREQUF5QixXQUFXLE9BQU8sdUNBQXVDLGtCQUFrQjtBQUFBLE9BQ3ZHO0FBQUEsSUFDQyxPQUNDLDRDQUFDLFNBQUksV0FBVSxpQkFDYixzREFBQyxtQkFBZ0IsR0FBTSxHQUN6QixJQUNFO0FBQUEsS0FDTjtBQUVKO0FBR08sU0FBUyxNQUFNLEtBQTBCO0FBQzlDLE1BQUksT0FBTyxNQUFNLElBQUksT0FBTyxTQUFTLFdBQVcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxHQUFHLGdDQUFnQztBQUM3RixNQUFJLE1BQU07QUFBQSxJQUFPO0FBQUEsSUFBdUMsTUFDdEQsSUFBSSxNQUFNO0FBQUEsTUFDUjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxNQUFJLE1BQU07QUFBQSxJQUFPO0FBQUEsSUFBaUIsTUFDaEMsSUFBSSxNQUFNO0FBQUEsTUFDUjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsUUFBUSxPQUFPLEVBQUUsVUFBVSxJQUFJLFNBQVM7QUFBQSxNQUMxQztBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUdBLE1BQUksTUFBTTtBQUFBLElBQU87QUFBQSxJQUEyQixNQUMxQyxJQUFJLE1BQU07QUFBQSxNQUNSO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixRQUFRLE9BQU8sRUFBRSxVQUFVLElBQUksU0FBUztBQUFBLE1BQzFDO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBSUEsTUFBSSxNQUFNO0FBQUEsSUFBTztBQUFBLElBQXdCLE1BQ3ZDLElBQUksTUFBTTtBQUFBLE1BQ1I7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInZhbHVlIiwgIm5hbWUiXQp9Cg==

		})(module, module.exports, require);
		return module.exports;
	}
});
