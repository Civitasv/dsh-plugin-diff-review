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
.dsdr-comment-add{flex:none;display:none;align-items:center;justify-content:center;width:18px;height:18px;border-radius:6px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:11px;line-height:1;padding:0;margin-top:1px}
.dsdr-line:hover .dsdr-comment-add{display:flex}
.dsdr-comment-add:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}
.dsdr-comment-has{display:flex;background:rgba(88,166,255,.18);color:#58a6ff;border-color:transparent;font-variant-numeric:tabular-nums}
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
.dsdr-openline{flex:none;display:none;align-items:center;justify-content:center;width:18px;height:18px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:12px;line-height:1;padding:0}
.dsdr-line:hover .dsdr-openline{display:flex}
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
.dsdr-split-openline{flex:none;display:none;align-items:center;justify-content:center;width:16px;height:16px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:11px;line-height:1;padding:0}
.dsdr-split-cell:hover .dsdr-split-openline{display:flex}
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
        return lastRoundPaths.size > 0 ? files.filter((f) => lastRoundPaths.has(f.path) || lastRoundPaths.has(baseName(f.path))) : [];
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
      const binding = currentId ? sessions.binding(currentId) : void 0;
      const session = binding?.session;
      if (session) {
        const result = await session.prompt([{ type: "text", text }], "queue");
        if (result.ok) {
          setSendOpen(false);
          setNotice({ kind: "ok", text: t("review.sentToAgent") });
          return;
        }
      }
    } catch {
    } finally {
      setBusy(false);
    }
    try {
      await navigator.clipboard.writeText(text);
      setSendOpen(false);
      setNotice({ kind: "ok", text: t("review.copied") });
    } catch {
      setNotice({ kind: "error", text: t("review.copyFailed") });
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
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty", children: t("review.noSessionChanges") }) : null,
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
                      const openBtn = (line) => selectedFile.path ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-split-openline", title: t("editor.openLine"), "aria-label": t("editor.openLine"), onClick: () => void openFile(selectedFile.path, line), children: "\u2197" }) : null;
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split-row", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-split-cell ${row.leftNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-del" : ""}${findingCls}${jumped ? " dsdr-cell-jump" : ""}`, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", children: row.leftNum ?? "" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.left }),
                          row.leftNum !== null ? openBtn(row.leftNum) : null,
                          rowFindings.length > 0 && row.rightNum === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`, children: rowFindings[0].priority }) : null
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-split-cell ${row.rightNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-add" : ""}${findingCls}${jumped ? " dsdr-cell-jump" : ""}`, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-num", children: row.rightNum ?? "" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.right }),
                          row.rightNum !== null ? openBtn(row.rightNum) : null,
                          rowFindings.length > 0 && row.rightNum !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`, children: rowFindings[0].priority }) : null
                        ] })
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERpZmYtcmV2aWV3IHBsdWdpbiBcdTIwMTQgY2xpZW50IGhhbGYuXG4gKlxuICogQ29kZXgtc3R5bGUgcmV2aWV3IHdpdGggdHdvIHNvdXJjZXM6XG4gKlxuICogMS4gKipcdTRGMUFcdThCRERcdTY2RjRcdTY1MzkgKFNlc3Npb24gY2hhbmdlcykqKiBcdTIwMTQgd2hhdCB0aGUgYWdlbnQgY2hhbmdlZCBpbiBlYWNoIHJvdW5kIG9mXG4gKiAgICB0aGlzIGNvbnZlcnNhdGlvbiwgZGVyaXZlZCBmcm9tIHRoZSBjb252ZXJzYXRpb24gc25hcHNob3QgKHRvb2wgcmVzdWx0c1xuICogICAgY2FycnkgdGhlIGhvc3QtY29tcHV0ZWQgYHJlc3VsdFZpZXdgIGRpZmYgaHVua3MpLiBXb3JrcyB3aXRoIG9yIHdpdGhvdXRcbiAqICAgIGdpdCwgYW5kIHNob3dzIGEgY2hhbmdlIGV2ZW4gd2hlbiBubyBkaWZmIHRleHQgaXMgYXZhaWxhYmxlIChwYXRoLW9ubHkpLlxuICogMi4gKipcdTVERTVcdTRGNUNcdTUzM0EgKFdvcmtzcGFjZSkqKiBcdTIwMTQgdGhlIGdpdCB3b3JraW5nIHRyZWUncyB1bmNvbW1pdHRlZCBjaGFuZ2VzXG4gKiAgICAoc3RhZ2VkICsgdW5zdGFnZWQgKyB1bnRyYWNrZWQpIHdpdGggcGVyLWZpbGUgLyBhbGwtZmlsZSBhY2NlcHQgKHN0YWdlKVxuICogICAgYW5kIHJldmVydCAoZGlzY2FyZCkgdGhyb3VnaCB0aGUgcGx1Z2luJ3Mgc2VydmVyIHJvdXRlcy5cbiAqXG4gKiBUaGUgcmV2aWV3IHN1cmZhY2UgbW91bnRzIGluIGBzaGVsbC5vdmVybGF5YCAocm9vdCBzY29wZSkuIFN0YXRlIGhhbmQtb2ZmXG4gKiBiZXR3ZWVuIHRoZSBzZXNzaW9uLXNjb3BlZCBoZWFkZXIgdHJpZ2dlciBhbmQgdGhlIHJvb3Qtc2NvcGVkIG92ZXJsYXkgZ29lc1xuICogdGhyb3VnaCBhIG1vZHVsZS1sZXZlbCBzbmFwc2hvdCBzdG9yZTsgdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCBmb3IgdGhlXG4gKiBjdXJyZW50IHNlc3Npb24gaXMgcmVhZCByZWFjdGl2ZWx5IHRocm91Z2ggYGN0eC5zZXNzaW9uc2AgKGluamVjdGVkIHZpYSB0aGVcbiAqIG92ZXJsYXkgcmVnaXN0cmF0aW9uJ3MgaW5qZWN0IGZhY2UpLlxuICovXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUsIHVzZVN5bmNFeHRlcm5hbFN0b3JlLCBGcmFnbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDU1NQcm9wZXJ0aWVzLCBSZWFjdEVsZW1lbnQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgZGlmZkxpbmVzIH0gZnJvbSAnZGlmZidcbmltcG9ydCB0eXBlIHsgQ2xpZW50Q29udGV4dCwgSVNlc3Npb25zLCBTZXNzaW9uTGlzdFN0YXRlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgeyBjcmVhdGVTbmFwc2hvdFN0b3JlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFByb3BzTG9jYWxlLCBQcm9wc1J1bnRpbWUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1zbG90cydcbmltcG9ydCB0eXBlIHsgQ29udmVyc2F0aW9uTm9kZSwgVG9vbFJlc3VsdE5vZGUsIFVzZXJNZXNzYWdlTm9kZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXJ1bnRpbWUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBUb29sUmVzdWx0VmlldyB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtYXBpLXJlbW90ZXMvY2xpZW50J1xuaW1wb3J0IHsgSWNvbkNoZXZyb25Eb3duT3V0bGluZTE0IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktcHJpbWl0aXZlcydcbi8vIFR5cGUtb25seSBpbXBvcnRzIHB1bGxpbmcgdGhlIGhlYWRlci1hY3Rpb24gc2xvdCBjb250cmFjdCwgdGhlIHNoZWxsLm92ZXJsYXlcbi8vIGNvbnRyYWN0LCB0aGUgc2V0dGluZ3MuZ2VuZXJhbC5pdGVtIHNsb3QgY29udHJhY3QgYW5kIHRoZSBzdGFuZGFyZCBraXQuXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1jb252ZXJzYXRpb24vY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktbGF5b3V0L2NsaWVudCdcbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNldHRpbmdzL2NsaWVudCdcbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNldHRpbmdzLXBsdWdpbnMvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtbG9jYWxlL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgQXBwbHlIdW5rUmVzcG9uc2UsIEFwcGx5UmVzcG9uc2UsIENvbW1lbnRzUmVzcG9uc2UsIENvbW1pdERpZmZSZXNwb25zZSwgQ29tbWl0SW5mbywgRGlmZkZpbGUsIERpZmZIdW5rLCBHaXRSZXNwb25zZSwgSGlzdG9yeVJlc3BvbnNlLCBQclJlc3BvbnNlLCBSZXBvc1Jlc3BvbnNlLCBSZXZpZXdDb21tZW50LCBSZXZpZXdGaW5kaW5nLCBSZXZpZXdSZXNwb25zZSwgU3RhdHVzUmVzcG9uc2UgfSBmcm9tICcuLi9zaGFyZWQvdHlwZXMudHMnXG5cbmV4cG9ydCBjb25zdCBuYW1lID0gJ2RpZmYtcmV2aWV3J1xuXG4vKiogUmVxdWlyZWQgY2xpZW50IHNlcnZpY2VzIChmaWJlciBpbmplY3QpLiAqL1xuZXhwb3J0IGNvbnN0IGluamVjdCA9IFsnc2Vzc2lvbnMnLCAnc2xvdHMnLCAnbG9jYWxlJ11cblxuY29uc3QgTE9DQUxFX05TID0gJ2RpZmYtcmV2aWV3J1xuY29uc3QgU1RBVFVTX1VSTCA9ICdkaWZmLXJldmlldy9zdGF0dXMnXG5jb25zdCBBUFBMWV9VUkwgPSAnZGlmZi1yZXZpZXcvYXBwbHknXG5jb25zdCBBUFBMWV9IVU5LX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseS1odW5rJ1xuY29uc3QgQ09NTUlUX1VSTCA9ICdkaWZmLXJldmlldy9jb21taXQnXG5jb25zdCBQVVNIX1VSTCA9ICdkaWZmLXJldmlldy9wdXNoJ1xuY29uc3QgSElTVE9SWV9VUkwgPSAnZGlmZi1yZXZpZXcvaGlzdG9yeSdcbmNvbnN0IENPTU1JVF9ESUZGX1VSTCA9ICdkaWZmLXJldmlldy9jb21taXQtZGlmZidcbmNvbnN0IENPTU1FTlRTX1VSTCA9ICdkaWZmLXJldmlldy9jb21tZW50cydcbmNvbnN0IEJSQU5DSEVTX1VSTCA9ICdkaWZmLXJldmlldy9icmFuY2hlcydcbmNvbnN0IFJFVklFV19VUkwgPSAnZGlmZi1yZXZpZXcvcmV2aWV3J1xuY29uc3QgUFJfVVJMID0gJ2RpZmYtcmV2aWV3L3ByJ1xuY29uc3QgUkVQT1NfVVJMID0gJ2RpZmYtcmV2aWV3L3JlcG9zJ1xuY29uc3QgT1BFTl9FRElUT1JfVVJMID0gJ29wZW4tZWRpdG9yL29wZW4nXG5jb25zdCBTVFlMRV9UQUcgPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldy9yZXZpZXcuY3NzJ1xuXG4vKiogT3BlbiBzdGF0ZSBzaGFyZWQgYmV0d2VlbiB0aGUgaGVhZGVyIHRyaWdnZXIgKHNlc3Npb24gc2NvcGUpIGFuZCB0aGUgb3ZlcmxheSAocm9vdCBzY29wZSkuICovXG5jb25zdCBvdmVybGF5U3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPHsgb3BlbjogYm9vbGVhbjsgY3dkOiBzdHJpbmcgfCBudWxsOyBrZXk6IG51bWJlciB9Pih7XG4gIG9wZW46IGZhbHNlLFxuICBjd2Q6IG51bGwsXG4gIGtleTogMCxcbn0pXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IHByZWZlcmVuY2VzIChmb250IC8gc2l6ZSAvIHBhbmVsIGdlb21ldHJ5KSwgc2hhcmVkIGJ5IHRoZSBvdmVybGF5XG4vLyBhbmQgdGhlIFNldHRpbmdzIFx1MjE5MiBHZW5lcmFsIHJvdy4gUGVyc2lzdGVkIHRvIGxvY2FsU3RvcmFnZSBieSB0aGUgc3RvcmUuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFBhbmVsIGdlb21ldHJ5IGJvdW5kcy4gKi9cbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfVyA9IDY0MFxuZXhwb3J0IGNvbnN0IE1JTl9QQU5FTF9IID0gNDAwXG5cbmludGVyZmFjZSBQcmVmcyB7XG4gIC8qKiBGb250IG9wdGlvbiBpZCAoc2VlIEZPTlRfT1BUSU9OUykuICovXG4gIGZvbnQ6IHN0cmluZ1xuICAvKiogRGlmZiB0ZXh0IHNpemUgaW4gcHguICovXG4gIHNpemU6IG51bWJlclxuICAvKiogUGFuZWwgd2lkdGggaW4gcHguICovXG4gIHdpZHRoOiBudW1iZXJcbiAgLyoqIFBhbmVsIGhlaWdodCBpbiBweC4gKi9cbiAgaGVpZ2h0OiBudW1iZXJcbn1cblxuY29uc3QgRk9OVF9PUFRJT05TOiB7IGlkOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGNzczogc3RyaW5nIH1bXSA9IFtcbiAgeyBpZDogJ21vbm8nLCBsYWJlbDogJ2ZvbnQubW9ubycsIGNzczogJ3ZhcigtLWRzdy1mb250LW1vbm8pJyB9LFxuICB7IGlkOiAnc3lzdGVtJywgbGFiZWw6ICdmb250LnN5c3RlbScsIGNzczogJ3N5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZicgfSxcbiAgeyBpZDogJ2NvbnNvbGFzJywgbGFiZWw6ICdDb25zb2xhcycsIGNzczogJ0NvbnNvbGFzLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ2pldGJyYWlucycsIGxhYmVsOiAnSmV0QnJhaW5zIE1vbm8nLCBjc3M6ICdcIkpldEJyYWlucyBNb25vXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdmaXJhJywgbGFiZWw6ICdGaXJhIENvZGUnLCBjc3M6ICdcIkZpcmEgQ29kZVwiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnc291cmNlJywgbGFiZWw6ICdTb3VyY2UgQ29kZSBQcm8nLCBjc3M6ICdcIlNvdXJjZSBDb2RlIFByb1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuXVxuXG5jb25zdCBTSVpFX09QVElPTlMgPSBbMTEsIDEyLCAxMywgMTQsIDE2LCAxOF1cblxuLyoqIFJldmlldyBzY29wZXMgb2YgdGhlIHdvcmtzcGFjZSB0YWIgKGFsaWduZWQgd2l0aCB0aGUgQ29kZXggcmV2aWV3IHBhbmUpLiAqL1xudHlwZSBXb3Jrc3BhY2VTY29wZSA9ICdhbGwnIHwgJ3Vuc3RhZ2VkJyB8ICdzdGFnZWQnIHwgJ2NvbW1pdCcgfCAnYnJhbmNoJyB8ICdsYXN0LXR1cm4nXG5cbmNvbnN0IFNDT1BFX09QVElPTlM6IHsgaWQ6IFdvcmtzcGFjZVNjb3BlOyBsYWJlbDoga2V5b2YgdHlwZW9mIHpoIH1bXSA9IFtcbiAgeyBpZDogJ2FsbCcsIGxhYmVsOiAnc2NvcGUuYWxsJyB9LFxuICB7IGlkOiAndW5zdGFnZWQnLCBsYWJlbDogJ3Njb3BlLnVuc3RhZ2VkJyB9LFxuICB7IGlkOiAnc3RhZ2VkJywgbGFiZWw6ICdzY29wZS5zdGFnZWQnIH0sXG4gIHsgaWQ6ICdjb21taXQnLCBsYWJlbDogJ3Njb3BlLmNvbW1pdCcgfSxcbiAgeyBpZDogJ2JyYW5jaCcsIGxhYmVsOiAnc2NvcGUuYnJhbmNoJyB9LFxuICB7IGlkOiAnbGFzdC10dXJuJywgbGFiZWw6ICdzY29wZS5sYXN0LXR1cm4nIH0sXG5dXG5cbi8qKiBCcm93c2VyLXNpZGUgYWJzb2x1dGUgcGF0aCBjaGVjayAobm8gbm9kZTpwYXRoIGluIHRoZSBjbGllbnQgYnVuZGxlKS4gKi9cbmZ1bmN0aW9uIGlzQWJzUGF0aChwOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHAuc3RhcnRzV2l0aCgnLycpIHx8IC9eW0EtWmEtel06W1xcXFwvXS8udGVzdChwKVxufVxuXG5mdW5jdGlvbiBiYXNlTmFtZShwOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcC5zcGxpdCgvW1xcXFwvXS8pLnBvcCgpID8/IHBcbn1cblxuY29uc3QgcHJlZnNTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UHJlZnM+KFxuICB7IGZvbnQ6ICdtb25vJywgc2l6ZTogMTIsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDcyMCB9LFxuICB7IHBlcnNpc3Q6IHsgbmFtZTogJ2RzZHItcHJlZnMnIH0gfSxcbilcblxuLyoqIENTUyBmb250LWZhbWlseSBmb3IgYSBzdG9yZWQgZm9udCBvcHRpb24gaWQuICovXG5mdW5jdGlvbiBmb250Q3NzKGlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gRk9OVF9PUFRJT05TLmZpbmQoKGYpID0+IGYuaWQgPT09IGlkKT8uY3NzID8/IEZPTlRfT1BUSU9OU1swXS5jc3Ncbn1cblxuLyoqIFBhbmVsIENTUyB2YXJpYWJsZXMgY2FycnlpbmcgdGhlIGZvbnQvc2l6ZSBwcmVmZXJlbmNlLiAqL1xuZnVuY3Rpb24gZGlmZlN0eWxlVmFycyhwcmVmczogUHJlZnMpOiBDU1NQcm9wZXJ0aWVzIHtcbiAgcmV0dXJuIHtcbiAgICAnLS1kc2RyLWRpZmYtZm9udCc6IGZvbnRDc3MocHJlZnMuZm9udCksXG4gICAgJy0tZHNkci1kaWZmLXNpemUnOiBgJHtwcmVmcy5zaXplfXB4YCxcbiAgfSBhcyBDU1NQcm9wZXJ0aWVzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2Vzc2lvbi1jaGFuZ2VzIGV4dHJhY3Rpb24gKGNsaWVudC1zaWRlLCB3b3JrcyB3aXRob3V0IGdpdCkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBiZWZvcmUvYWZ0ZXIgc2xpY2Ugb2YgYSBjaGFuZ2UgKGEgaHVuaykuICovXG5pbnRlcmZhY2UgSHVuayB7XG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBPbmUgZmlsZSBjaGFuZ2VkIGluc2lkZSBvbmUgcm91bmQuICovXG5pbnRlcmZhY2UgUm91bmRDaGFuZ2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgdG9vbDogc3RyaW5nXG4gIGh1bmtzOiBIdW5rW11cbiAgLyoqIEZhbHNlIHdoZW4gb25seSB0aGUgcGF0aCBpcyBrbm93biAobm8gZGlmZiBkYXRhIHBlcnNpc3RlZCkuICovXG4gIGhhc0RpZmY6IGJvb2xlYW5cbn1cblxuLyoqIE9uZSB1c2VyIHJvdW5kIGFuZCB0aGUgZmlsZXMgaXQgY2hhbmdlZC4gKi9cbmludGVyZmFjZSBTZXNzaW9uUm91bmQge1xuICByb3VuZDogbnVtYmVyXG4gIGxhYmVsOiBzdHJpbmdcbiAgY2hhbmdlczogUm91bmRDaGFuZ2VbXVxufVxuXG5pbnRlcmZhY2UgRmlsZURpZmZMaWtlIHtcbiAgcGF0aDogc3RyaW5nXG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBWYWxpZGF0ZSBhIHJhdyBGaWxlRGlmZi1zaGFwZWQgdmFsdWUgKHRoZSB0b29scycgYHtwYXRoLCBvbGRUZXh0LCBuZXdUZXh0fWAgY29udHJhY3QpLiAqL1xuZnVuY3Rpb24gYXNGaWxlRGlmZihyYXc6IHVua25vd24pOiBGaWxlRGlmZkxpa2UgfCBudWxsIHtcbiAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGNvbnN0IHJlYyA9IHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICBpZiAodHlwZW9mIHJlYy5wYXRoICE9PSAnc3RyaW5nJyB8fCAhcmVjLnBhdGgpIHJldHVybiBudWxsXG4gIGlmICh0eXBlb2YgcmVjLm5ld1RleHQgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbFxuICBjb25zdCBvbGRUZXh0ID0gcmVjLm9sZFRleHRcbiAgcmV0dXJuIHsgcGF0aDogcmVjLnBhdGgsIG9sZFRleHQ6IHR5cGVvZiBvbGRUZXh0ID09PSAnc3RyaW5nJyA/IG9sZFRleHQgOiBudWxsLCBuZXdUZXh0OiByZWMubmV3VGV4dCB9XG59XG5cbi8qKiBEaWZmIGh1bmtzIGNhcnJpZWQgYnkgYSBjb21wbGV0ZWQgdG9vbCByZXN1bHQgKGByZXN1bHRWaWV3LmNhcmQgPT09ICdkaWZmJ2ApLiAqL1xuZnVuY3Rpb24gZGlmZnNGcm9tUmVzdWx0VmlldyhyZXN1bHRWaWV3OiBUb29sUmVzdWx0VmlldyB8IG51bGwpOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghcmVzdWx0VmlldyB8fCByZXN1bHRWaWV3LmNhcmQgIT09ICdkaWZmJyB8fCAhQXJyYXkuaXNBcnJheShyZXN1bHRWaWV3LmRpZmZzKSkgcmV0dXJuIFtdXG4gIHJldHVybiByZXN1bHRWaWV3LmRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG4vKiogUmF3IGBtZXRhLmRpZmZzYCBmYWxsYmFjayAodGhlIHBlcnNpc3RlZCB0b29sL3Jlc3VsdCBtZXRhKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbU1ldGEobWV0YTogdW5rbm93bik6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCFtZXRhIHx8IHR5cGVvZiBtZXRhICE9PSAnb2JqZWN0JykgcmV0dXJuIFtdXG4gIGNvbnN0IGRpZmZzID0gKG1ldGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmRpZmZzXG4gIGlmICghQXJyYXkuaXNBcnJheShkaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbmNvbnN0IE1VVEFUSU9OX1RPT0xTID0gbmV3IFNldChbJ3N0cl9yZXBsYWNlX2VkaXRvcicsICdub3RlYm9va19lZGl0J10pXG5jb25zdCBNVVRBVElPTl9DT01NQU5EUyA9IG5ldyBTZXQoWyd3cml0ZScsICdlZGl0JywgJ3JlcGxhY2UnLCAnZGVsZXRlJywgJ21vdmUnXSlcblxuLyoqIFBhdGgtb25seSBmYWxsYmFjayBmb3Iga25vd24gZmlsZS1tdXRhdGluZyB0b29scyB3aG9zZSByZXN1bHQgY2FycmllZCBubyBkaWZmLiAqL1xuZnVuY3Rpb24gbXV0YXRpb25QYXRoKHRvb2w6IHN0cmluZywgYXJnc1Jhdzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGxldCBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwgPSBudWxsXG4gIHRyeSB7XG4gICAgYXJncyA9IEpTT04ucGFyc2UoYXJnc1JhdykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBpZiAoIWFyZ3MgfHwgdHlwZW9mIGFyZ3MgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBpZiAodG9vbCA9PT0gJ2ZzJyB8fCB0b29sID09PSAnZmlsZXN5c3RlbScpIHtcbiAgICBjb25zdCBjbWQgPSB0eXBlb2YgYXJncy5jb21tYW5kID09PSAnc3RyaW5nJyA/IGFyZ3MuY29tbWFuZCA6ICcnXG4gICAgaWYgKCFNVVRBVElPTl9DT01NQU5EUy5oYXMoY21kKSkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gdHlwZW9mIGFyZ3MuZmlsZV9wYXRoID09PSAnc3RyaW5nJyAmJiBhcmdzLmZpbGVfcGF0aCA/IGFyZ3MuZmlsZV9wYXRoIDogbnVsbFxuICB9XG4gIGlmIChNVVRBVElPTl9UT09MUy5oYXModG9vbCkgfHwgdG9vbC5zdGFydHNXaXRoKCdlZGl0JykpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbJ2ZpbGVfcGF0aCcsICdwYXRoJywgJ2ZpbGVuYW1lJ10pIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1trZXldID09PSAnc3RyaW5nJyAmJiBhcmdzW2tleV0pIHJldHVybiBhcmdzW2tleV0gYXMgc3RyaW5nXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbi8qKiBFeHRyYWN0IHRoZSBjaGFuZ2VkIGZpbGVzIGZyb20gb25lIHNldHRsZWQgdG9vbCByZXN1bHQgKGRpZmYgaHVua3MsIGVsc2UgcGF0aC1vbmx5KS4gKi9cbmZ1bmN0aW9uIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChjYWxsOiB7IG5hbWU6IHN0cmluZzsgYXJnc1Jhdzogc3RyaW5nIH0sIG5vZGU6IFRvb2xSZXN1bHROb2RlKTogUm91bmRDaGFuZ2VbXSB7XG4gIGNvbnN0IHRvb2wgPSBjYWxsLm5hbWVcbiAgY29uc3QgZGlmZnMgPSBkaWZmc0Zyb21SZXN1bHRWaWV3KG5vZGUucmVzdWx0VmlldylcbiAgY29uc3QgZmFsbGJhY2tEaWZmcyA9IGRpZmZzLmxlbmd0aCA9PT0gMCA/IGRpZmZzRnJvbU1ldGEobm9kZS5tZXRhKSA6IFtdXG4gIGNvbnN0IGFsbERpZmZzID0gZGlmZnMubGVuZ3RoID4gMCA/IGRpZmZzIDogZmFsbGJhY2tEaWZmc1xuICBpZiAoYWxsRGlmZnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSb3VuZENoYW5nZT4oKVxuICAgIGZvciAoY29uc3QgZCBvZiBhbGxEaWZmcykge1xuICAgICAgbGV0IGVudHJ5ID0gYnlQYXRoLmdldChkLnBhdGgpXG4gICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgIGVudHJ5ID0geyBwYXRoOiBkLnBhdGgsIHRvb2wsIGh1bmtzOiBbXSwgaGFzRGlmZjogdHJ1ZSB9XG4gICAgICAgIGJ5UGF0aC5zZXQoZC5wYXRoLCBlbnRyeSlcbiAgICAgIH1cbiAgICAgIGVudHJ5Lmh1bmtzLnB1c2goeyBvbGRUZXh0OiBkLm9sZFRleHQsIG5ld1RleHQ6IGQubmV3VGV4dCB9KVxuICAgIH1cbiAgICByZXR1cm4gWy4uLmJ5UGF0aC52YWx1ZXMoKV1cbiAgfVxuICBjb25zdCBwYXRoID0gbXV0YXRpb25QYXRoKHRvb2wsIGNhbGwuYXJnc1JhdylcbiAgcmV0dXJuIHBhdGggPyBbeyBwYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IGZhbHNlIH1dIDogW11cbn1cblxuLyoqIFBsYWluIHRleHQgb2YgYSB1c2VyIG1lc3NhZ2UgKGNvbnRlbnQgYmxvY2tzIG9mIHR5cGUgJ3RleHQnKS4gKi9cbmZ1bmN0aW9uIHVzZXJUZXh0KG5vZGU6IFVzZXJNZXNzYWdlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2Ygbm9kZS5jb250ZW50KSB7XG4gICAgaWYgKGJsb2NrICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcgJiYgKGJsb2NrIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiAoYmxvY2sgYXMgeyB0ZXh0PzogdW5rbm93biB9KS50ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgcGFydHMucHVzaCgoYmxvY2sgYXMgeyB0ZXh0OiBzdHJpbmcgfSkudGV4dClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG59XG5cbi8qKiBXYWxrIHRoZSBjb252ZXJzYXRpb24gbm9kZXMgYW5kIGdyb3VwIGNoYW5nZWQgZmlsZXMgYnkgdXNlciByb3VuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0U2Vzc2lvblJvdW5kcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogU2Vzc2lvblJvdW5kW10ge1xuICBjb25zdCByb3VuZHM6IFNlc3Npb25Sb3VuZFtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IFNlc3Npb25Sb3VuZCB8IG51bGwgPSBudWxsXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgPT09ICd1c2VyJykge1xuICAgICAgY3VycmVudCA9IHsgcm91bmQ6IHJvdW5kcy5sZW5ndGggKyAxLCBsYWJlbDogdXNlclRleHQobm9kZSkuc2xpY2UoMCwgNjApLCBjaGFuZ2VzOiBbXSB9XG4gICAgICByb3VuZHMucHVzaChjdXJyZW50KVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCAhY3VycmVudCB8fCAhbm9kZS5jYWxsKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnQuY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IGNoYW5nZS5wYXRoICYmIGMudG9vbCA9PT0gY2hhbmdlLnRvb2wpXG4gICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgaWYgKGNoYW5nZS5oYXNEaWZmKSB7XG4gICAgICAgICAgZXhpc3RpbmcuaHVua3MucHVzaCguLi5jaGFuZ2UuaHVua3MpXG4gICAgICAgICAgZXhpc3RpbmcuaGFzRGlmZiA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudC5jaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm91bmRzLmZpbHRlcigocikgPT4gci5jaGFuZ2VzLmxlbmd0aCA+IDApXG59XG5cbi8qKiBDb3VudCBvZiBjaGFuZ2VkIGZpbGVzIGFjcm9zcyBhbGwgcm91bmRzIChmb3IgdGhlIGhlYWRlciBiYWRnZSkuICovXG5leHBvcnQgZnVuY3Rpb24gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogbnVtYmVyIHtcbiAgbGV0IGNvdW50ID0gMFxuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCAhbm9kZS5jYWxsKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBrZXkgPSBgJHtjaGFuZ2UudG9vbH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICBpZiAoIXNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgc2Vlbi5hZGQoa2V5KVxuICAgICAgICBjb3VudCsrXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudFxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERpZmYgcmVuZGVyaW5nLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBTcGxpdCBvbmUgYGdpdCBzaG93IC0tZm9ybWF0PWAgZGlmZiBpbnRvIHBlci1maWxlIHNlZ21lbnRzLiAqL1xuZnVuY3Rpb24gc3BsaXRDb21taXREaWZmKGRpZmY6IHN0cmluZyk6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmcgfVtdIHtcbiAgY29uc3Qgc2VnbWVudHM6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBwYXRoOiBzdHJpbmc7IHRleHQ6IHN0cmluZ1tdIH0gfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IGxpbmUgb2YgZGlmZi5zcGxpdCgnXFxuJykpIHtcbiAgICBjb25zdCBtYXRjaCA9IC9eZGlmZiAtLWdpdCBhXFwvKC4qPykgYlxcLy8uZXhlYyhsaW5lKVxuICAgIGlmIChtYXRjaCkge1xuICAgICAgaWYgKGN1cnJlbnQpIHNlZ21lbnRzLnB1c2goY3VycmVudClcbiAgICAgIGN1cnJlbnQgPSB7IHBhdGg6IG1hdGNoWzFdLCB0ZXh0OiBbbGluZV0gfVxuICAgIH0gZWxzZSBpZiAoY3VycmVudCkge1xuICAgICAgY3VycmVudC50ZXh0LnB1c2gobGluZSlcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnQpIHNlZ21lbnRzLnB1c2goY3VycmVudClcbiAgcmV0dXJuIHNlZ21lbnRzLm1hcCgocykgPT4gKHsgcGF0aDogcy5wYXRoLCB0ZXh0OiBzLnRleHQuam9pbignXFxuJykgfSkpXG59XG5cbi8qKiBTdGF0dXMgbGV0dGVyIGZvciBhIGNvbW1pdCdzIGZpbGUsIGRlcml2ZWQgZnJvbSBpdHMgZGlmZiBzZWdtZW50IHRleHQuICovXG5mdW5jdGlvbiBjb21taXRGaWxlU3RhdHVzKHNlZ21lbnRUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoL15uZXcgZmlsZSBtb2RlLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdBJ1xuICBpZiAoL15kZWxldGVkIGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnRCdcbiAgaWYgKC9ecmVuYW1lIGZyb20gLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdSJ1xuICByZXR1cm4gJ00nXG59XG5cbnR5cGUgRGlmZlJvdyA9IHsga2luZDogJ2FkZCcgfCAnZGVsJyB8ICdjdHgnIHwgJ2h1bmsnIHwgJ2ZpbGUnIHwgJ25vdGUnOyB0ZXh0OiBzdHJpbmcgfVxuXG4vKiogQ2xhc3NpZnkgcmF3IHVuaWZpZWQtZGlmZiB0ZXh0IChnaXQgb3V0cHV0KSBpbnRvIHJvd3MuICovXG5mdW5jdGlvbiBnaXREaWZmUm93cyhkaWZmOiBzdHJpbmcpOiBEaWZmUm93W10ge1xuICByZXR1cm4gZGlmZi5zcGxpdCgnXFxuJykubWFwKChsaW5lKSA9PiB7XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKysrJykgfHwgbGluZS5zdGFydHNXaXRoKCctLS0nKSkgcmV0dXJuIHsga2luZDogJ2ZpbGUnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdAQCcpKSByZXR1cm4geyBraW5kOiAnaHVuaycgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysnKSkgcmV0dXJuIHsga2luZDogJ2FkZCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkgcmV0dXJuIHsga2luZDogJ2RlbCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ1xcXFwgJykpIHJldHVybiB7IGtpbmQ6ICdub3RlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgcmV0dXJuIHsga2luZDogJ2N0eCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICB9KVxufVxuXG4vKiogQ29tcHV0ZSBhZGQvZGVsL2N0eCByb3dzIGJldHdlZW4gdHdvIHRleHRzICh0aGUgdG9vbHMnIEZpbGVEaWZmIHNoYXBlKS4gKi9cbmZ1bmN0aW9uIHRleHREaWZmUm93cyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBEaWZmUm93W10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm93c1xufVxuXG4vKiogQWxsIHJvd3MgZm9yIG9uZSByb3VuZCBjaGFuZ2UgKG11bHRpcGxlIGh1bmtzIGdldCBgQEBgIHNlcGFyYXRvcnMpLiAqL1xuZnVuY3Rpb24gY2hhbmdlUm93cyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogRGlmZlJvd1tdIHtcbiAgaWYgKCFjaGFuZ2UuaGFzRGlmZiB8fCBjaGFuZ2UuaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgY2hhbmdlLmh1bmtzLmZvckVhY2goKGh1bmssIGkpID0+IHtcbiAgICBpZiAoY2hhbmdlLmh1bmtzLmxlbmd0aCA+IDEpIHJvd3MucHVzaCh7IGtpbmQ6ICdodW5rJywgdGV4dDogYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgfSlcbiAgICByb3dzLnB1c2goLi4udGV4dERpZmZSb3dzKGh1bmsub2xkVGV4dCwgaHVuay5uZXdUZXh0KSlcbiAgfSlcbiAgcmV0dXJuIHJvd3Ncbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTcGxpdCAodHdvLWNvbHVtbikgZGlmZiB2aWV3LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYWxpZ25lZCByb3cgb2YgdGhlIHNpZGUtYnktc2lkZSB2aWV3LiAqL1xuaW50ZXJmYWNlIFNwbGl0Um93IHtcbiAgbGVmdDogc3RyaW5nXG4gIHJpZ2h0OiBzdHJpbmdcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG9sZCBmaWxlLCBvciBudWxsIChwdXJlIGFkZGl0aW9uKS4gKi9cbiAgbGVmdE51bTogbnVtYmVyIHwgbnVsbFxuICAvKiogMS1iYXNlZCBsaW5lIG51bWJlciBpbiB0aGUgbmV3IGZpbGUsIG9yIG51bGwgKHB1cmUgZGVsZXRpb24pLiAqL1xuICByaWdodE51bTogbnVtYmVyIHwgbnVsbFxuICBraW5kOiAnY3R4JyB8ICdjaGFuZ2UnXG59XG5cbi8qKiBPbmUgc2lkZS1ieS1zaWRlIGJsb2NrIChhIGh1bmsgd2l0aCBpdHMgYEBAYCBoZWFkZXIpLiAqL1xuaW50ZXJmYWNlIFNwbGl0QmxvY2sge1xuICBoZWFkOiBzdHJpbmcgfCBudWxsXG4gIHJvd3M6IFNwbGl0Um93W11cbn1cblxuLyoqXG4gKiBQYWlyIGFkZC9kZWwgcm93cyBpbnRvIGFsaWduZWQgbGVmdC9yaWdodCBjb2x1bW5zLiBSZW1vdmVkIGxpbmVzIGJ1ZmZlclxuICogdW50aWwgdGhlIG1hdGNoaW5nIGFkZGl0aW9ucyBhcnJpdmUgKHVuaWZpZWQgZGlmZiBvcmRlcnMgZGVsZXRpb25zIGJlZm9yZVxuICogYWRkaXRpb25zKSwgc28gcHVyZSBkZWxldGlvbnMgYW5kIHB1cmUgYWRkaXRpb25zIHN0aWxsIGdldCB0aGVpciBvd24gcm93XG4gKiB3aXRoIGFuIGVtcHR5IGNlbGwgb24gdGhlIG9wcG9zaXRlIHNpZGUuIExpbmUgbnVtYmVycyB0cmFjayBmcm9tIHRoZSBodW5rXG4gKiBoZWFkZXIncyBgLWEsYiArYyxkYCBwb3NpdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIHBhaXJSb3dzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IFNwbGl0Um93W10ge1xuICBjb25zdCBvdXQ6IFNwbGl0Um93W10gPSBbXVxuICBsZXQgb2xkTGluZSA9IG9sZFN0YXJ0XG4gIGxldCBuZXdMaW5lID0gbmV3U3RhcnRcbiAgbGV0IHBlbmRpbmc6IHsgdGV4dDogc3RyaW5nOyBudW06IG51bWJlciB9W10gPSBbXVxuICBjb25zdCBmbHVzaCA9ICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGVuZGluZykgb3V0LnB1c2goeyBsZWZ0OiBwLnRleHQsIHJpZ2h0OiAnJywgbGVmdE51bTogcC5udW0sIHJpZ2h0TnVtOiBudWxsLCBraW5kOiAnY2hhbmdlJyB9KVxuICAgIHBlbmRpbmcgPSBbXVxuICB9XG4gIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSB7XG4gICAgICBwZW5kaW5nLnB1c2goeyB0ZXh0OiByb3cudGV4dC5zbGljZSgxKSwgbnVtOiBvbGRMaW5lKysgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnYWRkJykge1xuICAgICAgY29uc3QgcCA9IHBlbmRpbmcuc2hpZnQoKVxuICAgICAgb3V0LnB1c2goeyBsZWZ0OiBwPy50ZXh0ID8/ICcnLCByaWdodDogcm93LnRleHQuc2xpY2UoMSksIGxlZnROdW06IHA/Lm51bSA/PyBudWxsLCByaWdodE51bTogbmV3TGluZSsrLCBraW5kOiAnY2hhbmdlJyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdjdHgnKSB7XG4gICAgICBmbHVzaCgpXG4gICAgICAvLyBVbmlmaWVkLWRpZmYgY29udGV4dCBsaW5lcyBjYXJyeSBhIGxlYWRpbmcgc3BhY2UgXHUyMDE0IHN0cmlwIGl0IGZvciB0aGVcbiAgICAgIC8vIHNwbGl0IGNlbGxzIHNvIGJvdGggY29sdW1ucyByZW5kZXIgYmFyZSB0ZXh0LlxuICAgICAgY29uc3QgdGV4dCA9IHJvdy50ZXh0LnN0YXJ0c1dpdGgoJyAnKSA/IHJvdy50ZXh0LnNsaWNlKDEpIDogcm93LnRleHRcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogdGV4dCwgcmlnaHQ6IHRleHQsIGxlZnROdW06IG9sZExpbmUrKywgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2N0eCcgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZmx1c2goKSAvLyBub3RlcyAoXFwgTm8gbmV3bGluZVx1MjAyNikgYW5kIHN0cmF5IHJvd3M6IGp1c3QgYnJlYWsgdGhlIHBhaXJpbmdcbiAgICB9XG4gIH1cbiAgZmx1c2goKVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBQYXJzZSBnaXQgdW5pZmllZCBkaWZmIHRleHQgaW50byBibG9ja3MgKGAtLS0vKysrYCBmaWxlIHJvd3MgYW5kIGBAQGAgaHVua3MpLiAqL1xuY29uc3QgR0lUX01FVEEgPSAvXihkaWZmIC0tZ2l0IHxpbmRleCB8bmV3IGZpbGUgfGRlbGV0ZWQgZmlsZSB8b2xkIG1vZGUgfG5ldyBtb2RlIHxzaW1pbGFyaXR5IGluZGV4IHxyZW5hbWUgKGZyb218dG8pIHxCaW5hcnkgZmlsZXMgKS9cblxuZnVuY3Rpb24gcGFyc2VHaXRCbG9ja3MoZGlmZjogc3RyaW5nKTogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH1bXSB7XG4gIGNvbnN0IGJsb2NrczogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH1bXSA9IFtdXG4gIGxldCBjdXJyZW50OiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfSB8IG51bGwgPSBudWxsXG4gIGNvbnN0IGxpbmVzID0gZGlmZi5zcGxpdCgnXFxuJylcbiAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBsZXQga2luZDogRGlmZlJvd1sna2luZCddXG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKysrJykgfHwgbGluZS5zdGFydHNXaXRoKCctLS0nKSB8fCBHSVRfTUVUQS50ZXN0KGxpbmUpKSBraW5kID0gJ2ZpbGUnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdAQCcpKSBraW5kID0gJ2h1bmsnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIGtpbmQgPSAnYWRkJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnLScpKSBraW5kID0gJ2RlbCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ1xcXFwgJykpIGtpbmQgPSAnbm90ZSdcbiAgICBlbHNlIGtpbmQgPSAnY3R4J1xuICAgIGlmIChraW5kID09PSAnZmlsZScgfHwga2luZCA9PT0gJ2h1bmsnKSB7XG4gICAgICBjdXJyZW50ID0geyBoZWFkOiB7IGtpbmQsIHRleHQ6IGxpbmUgfSwgcm93czogW10gfVxuICAgICAgYmxvY2tzLnB1c2goY3VycmVudClcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnQgPSB7IGhlYWQ6IG51bGwsIHJvd3M6IFtdIH1cbiAgICAgICAgYmxvY2tzLnB1c2goY3VycmVudClcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQucm93cy5wdXNoKHsga2luZCwgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gYmxvY2tzXG59XG5cbi8qKiBIdW5rIHN0YXJ0IHBvc2l0aW9ucyBmcm9tIGEgYEBAIC1hLGIgK2MsZCBAQGAgaGVhZGVyLiAqL1xuZnVuY3Rpb24gaHVua1N0YXJ0cyhoZWFkOiBzdHJpbmcpOiB7IG9sZFN0YXJ0OiBudW1iZXI7IG5ld1N0YXJ0OiBudW1iZXIgfSB7XG4gIGNvbnN0IG0gPSAvXkBAIC0oXFxkKykoPzosXFxkKyk/IFxcKyhcXGQrKS8uZXhlYyhoZWFkKVxuICByZXR1cm4geyBvbGRTdGFydDogbSA/IE51bWJlcihtWzFdKSA6IDEsIG5ld1N0YXJ0OiBtID8gTnVtYmVyKG1bMl0pIDogMSB9XG59XG5cbi8qKiBTaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBhIGdpdCB1bmlmaWVkIGRpZmYgKHNraXBzIHB1cmUgZmlsZS1oZWFkZXIgYmxvY2tzKS4gKi9cbmZ1bmN0aW9uIGdpdFNwbGl0QmxvY2tzKGRpZmY6IHN0cmluZyk6IFNwbGl0QmxvY2tbXSB7XG4gIHJldHVybiBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICAgIC5maWx0ZXIoKGIpID0+IGIuaGVhZD8ua2luZCAhPT0gJ2ZpbGUnICYmIChiLnJvd3MubGVuZ3RoID4gMCB8fCBiLmhlYWQ/LmtpbmQgPT09ICdodW5rJykpXG4gICAgLm1hcCgoYikgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRzID0gYi5oZWFkID8gaHVua1N0YXJ0cyhiLmhlYWQudGV4dCkgOiB7IG9sZFN0YXJ0OiAxLCBuZXdTdGFydDogMSB9XG4gICAgICByZXR1cm4geyBoZWFkOiBiLmhlYWQ/LmtpbmQgPT09ICdodW5rJyA/IGIuaGVhZC50ZXh0IDogbnVsbCwgcm93czogcGFpclJvd3MoYi5yb3dzLCBzdGFydHMub2xkU3RhcnQsIHN0YXJ0cy5uZXdTdGFydCkgfVxuICAgIH0pXG59XG5cbi8qKiBTaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciB0aGUgdG9vbHMnIEZpbGVEaWZmIHNoYXBlIChvbGRUZXh0L25ld1RleHQpLiAqL1xuZnVuY3Rpb24gdGV4dFNwbGl0QmxvY2tzKG9sZFRleHQ6IHN0cmluZyB8IG51bGwsIG5ld1RleHQ6IHN0cmluZyk6IFNwbGl0QmxvY2tbXSB7XG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMob2xkVGV4dCA/PyAnJywgbmV3VGV4dCkpIHtcbiAgICBjb25zdCBsaW5lcyA9IHBhcnQudmFsdWUuc3BsaXQoJ1xcbicpXG4gICAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgaWYgKHBhcnQuYWRkZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdhZGQnLCB0ZXh0OiBgKyR7bGluZX1gIH0pXG4gICAgICBlbHNlIGlmIChwYXJ0LnJlbW92ZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdkZWwnLCB0ZXh0OiBgLSR7bGluZX1gIH0pXG4gICAgICBlbHNlIHJvd3MucHVzaCh7IGtpbmQ6ICdjdHgnLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBbeyBoZWFkOiBudWxsLCByb3dzOiBwYWlyUm93cyhyb3dzLCAxLCAxKSB9XVxufVxuXG4vKiogQWxsIHNpZGUtYnktc2lkZSBibG9ja3MgZm9yIG9uZSByb3VuZCBjaGFuZ2UuICovXG5mdW5jdGlvbiBjaGFuZ2VTcGxpdEJsb2NrcyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogU3BsaXRCbG9ja1tdIHtcbiAgaWYgKCFjaGFuZ2UuaGFzRGlmZiB8fCBjaGFuZ2UuaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgcmV0dXJuIGNoYW5nZS5odW5rcy5tYXAoKGh1bmssIGkpID0+ICh7XG4gICAgaGVhZDogY2hhbmdlLmh1bmtzLmxlbmd0aCA+IDEgPyBgQEAgaHVuayAke2kgKyAxfS8ke2NoYW5nZS5odW5rcy5sZW5ndGh9IEBAYCA6IG51bGwsXG4gICAgcm93czogdGV4dFNwbGl0QmxvY2tzKGh1bmsub2xkVGV4dCwgaHVuay5uZXdUZXh0KVswXS5yb3dzLFxuICB9KSlcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTdHlsZXMgKGRzZHItKjsgdGhlIGhlYWRlciB0cmlnZ2VyIG1pcnJvcnMgdGhlIGluLXRyZWUgYWN0aW9uIHJvd3MpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IFJFVklFV19DU1MgPSBgXG4uZHNkci10cmlnZ2Vye21pbi1oZWlnaHQ6MjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NHB4O3BhZGRpbmc6M3B4IDZweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItdHJpZ2dlcjpob3ZlciwuZHNkci10cmlnZ2VyOmZvY3VzLXZpc2libGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1sYWJlbHttYXJnaW4tbGVmdDoycHh9XG4uZHNkci1jb3VudHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtib3JkZXItcmFkaXVzOjk5OXB4O21pbi13aWR0aDoxNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDVweDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1vdmVybGF5e3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7ei1pbmRleDoyMDA7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLC40NSk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MzJweH1cbi5kc2RyLXBhbmVse2JveC1zaXppbmc6Ym9yZGVyLWJveDtwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDptaW4oMTEyMHB4LDEwMCUpO2hlaWdodDptaW4oNzIwcHgsY2FsYygxMDB2aCAtIDY0cHgpKTttYXgtd2lkdGg6Y2FsYygxMDB2dyAtIDY0cHgpO21heC1oZWlnaHQ6Y2FsYygxMDB2aCAtIDY0cHgpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjE0cHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1yZXNpemV7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDo1fVxuLmRzZHItcmVzaXplLWV7dG9wOjA7cmlnaHQ6LTNweDt3aWR0aDo3cHg7aGVpZ2h0OjEwMCU7Y3Vyc29yOmV3LXJlc2l6ZX1cbi5kc2RyLXJlc2l6ZS1ze2JvdHRvbTotM3B4O2xlZnQ6MDt3aWR0aDoxMDAlO2hlaWdodDo3cHg7Y3Vyc29yOm5zLXJlc2l6ZX1cbi5kc2RyLXJlc2l6ZS1zZXtyaWdodDotNHB4O2JvdHRvbTotNHB4O3dpZHRoOjE1cHg7aGVpZ2h0OjE1cHg7Y3Vyc29yOm53c2UtcmVzaXplfVxuLmRzZHItaGVhZGVye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzoxMnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItdGl0bGV7Zm9udC1zaXplOjE0cHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXN1YnRpdGxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEycHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci10YWJze2Rpc3BsYXk6ZmxleDtnYXA6NHB4O21hcmdpbi1sZWZ0OjE0cHh9XG4uZHNkci10YWJ7Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjZweDtib3JkZXI6MXB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjJweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItdGFiOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdGFiLWFjdGl2ZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNjb3Ble2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWFyZ2luLWxlZnQ6OHB4fVxuLmRzZHItc2NvcGUgLmRzZHItc2VsLXRyaWdnZXJ7bWluLXdpZHRoOjExMHB4O2hlaWdodDoyNnB4O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cGFkZGluZzowIDhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLXNwYWNlcntmbGV4OjF9XG4uZHNkci1idG57Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzozcHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnRuOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1idG46ZGlzYWJsZWR7b3BhY2l0eTouNTtjdXJzb3I6ZGVmYXVsdH1cbi5kc2RyLWJ0bi1wcmltYXJ5e2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTQwMCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tZGFuZ2VyOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1jb25maXJte2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1idG4tY29uZmlybTpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTUwKX1cbi5kc2RyLWNvbW1pdC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MjAwcHg7bWluLWhlaWdodDoyOHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci1jb21taXQtaW5wdXQ6OnBsYWNlaG9sZGVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1jYXB0aW9uKX1cbi5kc2RyLWNvbW1pdC1pbnB1dDpmb2N1c3tvdXRsaW5lOm5vbmU7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KX1cbi5kc2RyLXNlY3Rpb257Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6MTBweCA4cHggM3B4O2ZvbnQtd2VpZ2h0OjYwMDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHh9XG4uZHNkci1zZWN0aW9uOmZpcnN0LWNoaWxke3BhZGRpbmctdG9wOjRweH1cbi5kc2RyLWJyYW5jaHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo0cHggOHB4IDhweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLWJyYW5jaC1yZWZ7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO21pbi13aWR0aDowO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHh9XG4uZHNkci1icmFuY2gtYXJyb3d7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWJyYW5jaC1zdGF0e2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7Zm9udC1zaXplOjExcHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItYnJhbmNoLWFoZWFke2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItYnJhbmNoLWJlaGluZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtd2Fybi1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1zeW5je2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItY29tbWl0e2ZsZXg6MTttaW4td2lkdGg6MDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo1cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jb21taXQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItdGwtc2VsZWN0ZWQgLmRzZHItY29tbWl0e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRpbWVsaW5le2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci10bC1pdGVte2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2FsaWduLWl0ZW1zOnN0cmV0Y2g7Ym9yZGVyLXJhZGl1czo4cHh9XG4uZHNkci10bC1yYWlse3Bvc2l0aW9uOnJlbGF0aXZlO2ZsZXg6bm9uZTt3aWR0aDoxNHB4O2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyfVxuLmRzZHItdGwtcmFpbDo6YmVmb3Jle2NvbnRlbnQ6XCJcIjtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtib3R0b206MDtsZWZ0OjUwJTt3aWR0aDoxcHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKX1cbi5kc2RyLXRsLWl0ZW06Zmlyc3QtY2hpbGQgLmRzZHItdGwtcmFpbDo6YmVmb3Jle3RvcDo5cHh9XG4uZHNkci10bC1pdGVtOmxhc3QtY2hpbGQgLmRzZHItdGwtcmFpbDo6YmVmb3Jle2JvdHRvbTphdXRvO2hlaWdodDo5cHh9XG4uZHNkci10bC1kb3R7cG9zaXRpb246cmVsYXRpdmU7ei1pbmRleDoxO3RvcDo5cHg7ZmxleDpub25lO3dpZHRoOjdweDtoZWlnaHQ6N3B4O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSl9XG4uZHNkci10bC1kb3QtbG9jYWx7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWRvdC1yZW1vdGV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItY29tbWl0LWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21pbi13aWR0aDowfVxuLmRzZHItY29tbWl0LXNob3J0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LXN1YmplY3R7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWNvbW1pdC1tZXRhe2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZy1sZWZ0OjB9XG4uZHNkci10bC1iYWRnZXtmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDtib3JkZXItcmFkaXVzOjRweDtwYWRkaW5nOjAgNXB4fVxuLmRzZHItdGwtYmFkZ2UtbG9jYWx7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdGwtYmFkZ2UtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1kaWZmLWhhc2h7bWFyZ2luLWxlZnQ6OHB4O2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jb21taXQtZmlsZS1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci1jb21taXQtZmlsZS1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTttYXJnaW4tbGVmdDo0cHh9XG4uZHNkci1jZmctY2FyZHtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTMpO2JvcmRlci1yYWRpdXM6MTJweDtsaXN0LXN0eWxlOm5vbmU7dHJhbnNpdGlvbjpib3JkZXItY29sb3IgLjE2cyxiYWNrZ3JvdW5kIC4xNnN9XG4uZHNkci1jZmctY2FyZDpob3Zlcntib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jZmctY2FyZC1vcGVue2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLWNmZy1oZWFke2FwcGVhcmFuY2U6bm9uZTt3aWR0aDoxMDAlO2ZvbnQ6aW5oZXJpdDtjb2xvcjppbmhlcml0O3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjEycHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMnB4O3BhZGRpbmc6MTRweCAxNnB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWNmZy1oZWFkOmZvY3VzLXZpc2libGV7b3V0bGluZToycHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpO291dGxpbmUtb2Zmc2V0Oi0ycHh9XG4uZHNkci1jZmctaGVhZC10ZXh0e2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtmbGV4OjE7Z2FwOjRweDttaW4td2lkdGg6MDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctbmFtZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Zm9udC1zaXplOjE1cHg7Zm9udC13ZWlnaHQ6NjAwO2xpbmUtaGVpZ2h0OjEuNH1cbi5kc2RyLWNmZy1kZXNje2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLWNhcmV0e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7ZmxleDpub25lO3RyYW5zaXRpb246dHJhbnNmb3JtIC4xNnN9XG4uZHNkci1jZmctY2FyZXQtb3Blbnt0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9XG4uZHNkci1jZmctYm9keXtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTttYXJnaW46MCAxNnB4O3BhZGRpbmctYm90dG9tOjhweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItY2ZnLWZpZWxke2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3BhZGRpbmc6MTJweCAwO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWNmZy1maWVsZCsuZHNkci1jZmctZmllbGR7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMil9XG4uZHNkci1jZmctbGFiZWx7bWluLXdpZHRoOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZsZXg6MTtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo1MDA7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLWhpbnR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTttYXJnaW46MDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctcGVuZGluZ3t3aGl0ZS1zcGFjZTpub3dyYXA7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtib3JkZXItcmFkaXVzOjk5OXB4O2ZsZXg6bm9uZTtwYWRkaW5nOjFweCA4cHg7Zm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6NTAwO2xpbmUtaGVpZ2h0OjE3cHh9XG4uZHNkci1jZmctZmFpbGVke21pbi13aWR0aDowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1lcnJvcik7ZmxleDoxO21hcmdpbjowO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1hY3Rpb25ze2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2p1c3RpZnktY29udGVudDpmbGV4LWVuZDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjEycHggMCA0cHg7ZGlzcGxheTpmbGV4fVxuLmRzZHItYm9keXtkaXNwbGF5OmZsZXg7ZmxleDoxO21pbi1oZWlnaHQ6MH1cbi5kc2RyLWZpbGVze3dpZHRoOjMwMHB4O2ZsZXg6bm9uZTtib3JkZXItcmlnaHQ6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO292ZXJmbG93LXk6YXV0bztwYWRkaW5nOjhweH1cbi5kc2RyLXJvdW5ke2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjhweCA4cHggM3B4O2ZvbnQtd2VpZ2h0OjYwMH1cbi5kc2RyLXJvdW5kLWxhYmVse3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbjtmb250LXdlaWdodDo0MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1maWxle2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWZpbGU6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZmlsZS1zZWxlY3RlZHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1kaXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlci1yYWRpdXM6N3B4O3BhZGRpbmc6NXB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udC1zaXplOjEycHh9XG4uZHNkci1kaXI6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWRpci1jYXJldHtmbGV4Om5vbmU7d2lkdGg6MTJweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItZGlyLW5hbWV7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbjtmb250LXdlaWdodDo2MDB9XG4uZHNkci1kaXItY291bnR7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItZmlsZS1uYW1le2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1maWxlLXN0YXR7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItY2hpcHtmbGV4Om5vbmU7bWluLXdpZHRoOjIycHg7dGV4dC1hbGlnbjpjZW50ZXI7Ym9yZGVyLXJhZGl1czo1cHg7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtwYWRkaW5nOjAgNHB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY2hpcC1te2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjojMmVhMDQzfVxuLmRzZHItY2hpcC1he2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjojMmVhMDQzfVxuLmRzZHItY2hpcC1ke2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE2KTtjb2xvcjojZjg1MTQ5fVxuLmRzZHItY2hpcC1ye2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNik7Y29sb3I6IzU4YTZmZn1cbi5kc2RyLWNoaXAtdXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItdG9vbHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWRpZmZ7ZmxleDoxO21pbi13aWR0aDowO292ZXJmbG93OmF1dG87cGFkZGluZzoxMHB4IDB9XG4uZHNkci1kaWZmLWVtcHR5e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtoZWlnaHQ6MTAwJTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4fVxuLmRzZHItZGlmZi1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo2cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXBhdGh7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjEzcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1kaWZmLXN0YXRze2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO2ZsZXg6bm9uZX1cbi5kc2RyLWRpZmYtc2Nyb2xse2ZsZXg6MTttaW4taGVpZ2h0OjA7b3ZlcmZsb3c6YXV0bztkaXNwbGF5OmZsZXh9XG4uZHNkci1wcmV7bWFyZ2luOjA7cGFkZGluZzo4cHggMDtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZTp2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpO3doaXRlLXNwYWNlOnByZTttaW4td2lkdGg6MTAwJTtmbGV4OjF9XG4uZHNkci1saW5le2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDoxMHB4O3BhZGRpbmc6MCAxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwb3NpdGlvbjpyZWxhdGl2ZX1cbi5kc2RyLWxpbmUtbnVte2ZsZXg6bm9uZTt3aWR0aDozNHB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZTpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSAtIDFweCk7b3BhY2l0eTouNzV9XG4uZHNkci1saW5lLXRleHR7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOnByZX1cbi5kc2RyLWNvbW1lbnQtYWRke2ZsZXg6bm9uZTtkaXNwbGF5Om5vbmU7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MThweDtoZWlnaHQ6MThweDtib3JkZXItcmFkaXVzOjZweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7bWFyZ2luLXRvcDoxcHh9XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRke2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWNvbW1lbnQtYWRkOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jb21tZW50LWhhc3tkaXNwbGF5OmZsZXg7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE4KTtjb2xvcjojNThhNmZmO2JvcmRlci1jb2xvcjp0cmFuc3BhcmVudDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1saW5lLWNvbW1lbnRlZHtib3gtc2hhZG93Omluc2V0IDNweCAwIDAgcmdiYSg4OCwxNjYsMjU1LC43KX1cbi5kc2RyLWNvbW1lbnQtZWRpdG9ye2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpfVxuLmRzZHItY29tbWVudC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjUycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjZweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cmVzaXplOnZlcnRpY2FsfVxuLmRzZHItY29tbWVudC1pbnB1dDpmb2N1c3tvdXRsaW5lOm5vbmU7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1lbnQtYWN0aW9uc3tkaXNwbGF5OmZsZXg7Z2FwOjZweDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmR9XG4uZHNkci1jb21tZW50LXBvcHtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjIwO3JpZ2h0OjE2cHg7dG9wOmNhbGMoMTAwJSArIDJweCk7bWluLXdpZHRoOjI4MHB4O21heC13aWR0aDo0NDBweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLW1lbnUpO2JvcmRlci1yYWRpdXM6MTBweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtwYWRkaW5nOjhweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHh9XG4uZHNkci1jb21tZW50LWl0ZW17ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO3BhZGRpbmctYm90dG9tOjZweH1cbi5kc2RyLWNvbW1lbnQtaXRlbTpsYXN0LWNoaWxke2JvcmRlci1ib3R0b206MDtwYWRkaW5nLWJvdHRvbTowfVxuLmRzZHItY29tbWVudC10ZXh0e2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jb21tZW50LW1ldGF7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jb21tZW50LW1ldGEgLmRzZHItYnRue21pbi1oZWlnaHQ6MjBweDtwYWRkaW5nOjAgNnB4O2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7bWFyZ2luLWxlZnQ6YXV0b31cbi5kc2RyLW9wZW5saW5le2ZsZXg6bm9uZTtkaXNwbGF5Om5vbmU7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MThweDtoZWlnaHQ6MThweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjB9XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLW9wZW5saW5le2Rpc3BsYXk6ZmxleH1cbi5kc2RyLW9wZW5saW5lOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWxpbmUtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDNweCAwIDAgdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKX1cbi5kc2RyLWZpbmRpbmctUDB7LS1kc2RyLWZpbmRpbmctY29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctUDF7LS1kc2RyLWZpbmRpbmctY29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctUDJ7LS1kc2RyLWZpbmRpbmctY29sb3I6I2QyOTkyMn1cbi5kc2RyLWZpbmRpbmctUDN7LS1kc2RyLWZpbmRpbmctY29sb3I6IzhiOTQ5ZX1cbi5kc2RyLWZpbmRpbmctdGFne2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydDttYXJnaW4tdG9wOjJweH1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXJldmlldy1zdHJpcHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO2ZvbnQtc2l6ZToxMnB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItcmV2aWV3LW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWJhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctbW9kZWx7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXJldmlldy10b2dnbGUtb257Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maW5kaW5nc3tkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWF4LWhlaWdodDoyNjBweDtvdmVyZmxvdy15OmF1dG99XG4uZHNkci1maW5kaW5nLWl0ZW17ZGlzcGxheTpmbGV4O2dhcDo4cHg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0fVxuLmRzZHItZmluZGluZy1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbmRpbmctYm9keXtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4fVxuLmRzZHItZmluZGluZy10aXRsZXtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpiYXNlbGluZTtnYXA6OHB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItZmluZGluZy1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo0MDB9XG4uZHNkci1maW5kaW5nLWRldGFpbHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1maW5kaW5nLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbmRpbmctc3VnZ2VzdGlvbntkaXNwbGF5OmJsb2NrO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjRweCA4cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1wcntkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo0cHggOHB4IDhweH1cbi5kc2RyLXByLWl0ZW17ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXR9XG4uZHNkci1wci1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXByLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXByLXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLXNlbmR7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDo0MDt0b3A6NTJweDtyaWdodDoxNnB4O3dpZHRoOm1pbig0ODBweCxjYWxjKDEwMCUgLSAzMnB4KSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3JkZXItcmFkaXVzOjEycHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7cGFkZGluZzoxMnB4O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjhweH1cbi5kc2RyLXNlbmQtdGl0bGV7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbmQtaGludHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1zZW5kLWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MTQwcHg7bWF4LWhlaWdodDozMjBweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtyZXNpemU6dmVydGljYWw7d2hpdGUtc3BhY2U6cHJlLXdyYXB9XG4uZHNkci1saW5lLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1saW5lLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1saW5lLWh1bmt7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtZmlsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1ub3Rle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zdHlsZTppdGFsaWN9XG4uZHNkci1odW5rLWJhcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7cGFkZGluZzoycHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKX1cbi5kc2RyLWh1bmstYmFyIC5kc2RyLWJ0bnttaW4taGVpZ2h0OjIycHg7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci1odW5rLWxheWVye2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTttYXJnaW4tcmlnaHQ6YXV0b31cbi5kc2RyLWZvb3R7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZTttaW4taGVpZ2h0OjM2cHh9XG4uZHNkci1ub3RpY2V7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1ub3RpY2Utb2t7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1ub3RpY2UtZXJyb3J7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItc3Bpbm5lcntmbGV4Om5vbmU7d2lkdGg6MTJweDtoZWlnaHQ6MTJweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci10b3AtY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7YW5pbWF0aW9uOmRzZHItc3BpbiAuOHMgbGluZWFyIGluZmluaXRlfVxuQGtleWZyYW1lcyBkc2RyLXNwaW57dG97dHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX1cbi5kc2RyLWVtcHR5e3BhZGRpbmc6NDBweDt0ZXh0LWFsaWduOmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4fVxuLmRzZHItbm9kaWZme3BhZGRpbmc6OHB4IDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLXNlbHtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItc2VsLXRyaWdnZXJ7Ym94LXNpemluZzpjb250ZW50LWJveDttaW4td2lkdGg6MTgwcHg7aGVpZ2h0OjM0cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMyk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowIDEycHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4fVxuLmRzZHItc2VsLXRyaWdnZXI6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItc2VsLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpO291dGxpbmU6bm9uZX1cbi5kc2RyLXNlbC10cmlnZ2VyIHN2Z3tmbGV4Om5vbmU7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjEyc31cbi5kc2RyLXNlbC10cmlnZ2VyW2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdIHN2Z3t0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9XG4uZHNkci1zZWwtdmFsdWV7ZmxleDoxO21pbi13aWR0aDowO3RleHQtYWxpZ246bGVmdDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1zZWwtbWVudXt6LWluZGV4OjIwMDtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLXdpZHRoOjEwMCU7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtib3JkZXItcmFkaXVzOjEwcHg7bWFyZ2luOjA7cGFkZGluZzo0cHg7bGlzdC1zdHlsZTpub25lO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjFweDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6Y2FsYygxMDAlICsgNXB4KTtsZWZ0OjB9XG4uZHNkci1zZWwtb3B0aW9ue2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MzBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Ym9yZGVyLXJhZGl1czo3cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo1cHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO3RleHQtYWxpZ246bGVmdDtkaXNwbGF5OmZsZXh9XG4uZHNkci1zZWwtb3B0aW9uOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXNlbC1vcHRpb24tYWN0aXZle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbWFya3tmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItc2VsLW9wdGlvbi1sYWJlbHtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItdmlldy10b2dnbGV7ZGlzcGxheTpmbGV4O2dhcDoycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjJweDtmbGV4Om5vbmV9XG4uZHNkci12aWV3LWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyMnB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjFweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci12aWV3LWJ0bjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXZpZXctYnRuLWFjdGl2ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXR7bWluLXdpZHRoOjEwMCV9XG4uZHNkci1zcGxpdC1oZWFke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo0cHggOHB4O3Bvc2l0aW9uOnN0aWNreTt0b3A6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItc3BsaXQtaGVhZCBkaXZ7ZGlzcGxheTpmbGV4O2dhcDo4cHh9XG4uZHNkci1zcGxpdC1odW5re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MnB4IDE2cHh9XG4uZHNkci1zcGxpdC1yb3d7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCl9XG4uZHNkci1zcGxpdC1jZWxse2Rpc3BsYXk6ZmxleDtnYXA6OHB4O3BhZGRpbmc6MCA4cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGxpdC1udW17ZmxleDpub25lO3dpZHRoOjM2cHg7dGV4dC1hbGlnbjpyaWdodDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3VzZXItc2VsZWN0Om5vbmU7Zm9udC1zaXplOmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpIC0gMXB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCl9XG4uZHNkci1zcGxpdC10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MH1cbi5kc2RyLWNlbGwtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDAgMCAwIDFweCB2YXIoLS1kc2RyLWZpbmRpbmctY29sb3IsIHJnYmEoMjU1LDE2Niw4NywuNykpO2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4wOCl9XG4uZHNkci1jZWxsLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXNwbGl0LWZpbmRpbmd7ZmxleDpub25lO2ZvbnQtc2l6ZTo5cHg7bGluZS1oZWlnaHQ6MTJweDtib3JkZXItcmFkaXVzOjNweDtwYWRkaW5nOjAgM3B4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtd2VpZ2h0OjYwMDthbGlnbi1zZWxmOmZsZXgtc3RhcnR9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAxe2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4xNik7Y29sb3I6I2ZmYTY1N31cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAye2JhY2tncm91bmQ6cmdiYSgyMTAsMTUzLDM0LC4xNik7Y29sb3I6I2QyOTkyMn1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1zcGxpdC1vcGVubGluZXtmbGV4Om5vbmU7ZGlzcGxheTpub25lO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowfVxuLmRzZHItc3BsaXQtY2VsbDpob3ZlciAuZHNkci1zcGxpdC1vcGVubGluZXtkaXNwbGF5OmZsZXh9XG4uZHNkci1zcGxpdC1vcGVubGluZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jZWxsLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1jZWxsLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1jZWxsLWRpbXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwxLCByZ2JhKDEyOCwxMjgsMTI4LC4wNSkpfVxuYFxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc3R5bGVbZGF0YS1wbHVnaW4tY3NzPSR7SlNPTi5zdHJpbmdpZnkoU1RZTEVfVEFHKX1dYCkgPT09IG51bGwpIHtcbiAgY29uc3QgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICB0YWcuZGF0YXNldC5wbHVnaW4gPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldydcbiAgdGFnLmRhdGFzZXQucGx1Z2luQ3NzID0gU1RZTEVfVEFHXG4gIHRhZy50ZXh0Q29udGVudCA9IFJFVklFV19DU1NcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpXG59XG5cbi8qKiBTaW1wbGlmaWVkIENoaW5lc2UgZGljdGlvbmFyeSAoa2V5LXNldCBzb3VyY2Ugb2YgdHJ1dGgpLiAqL1xuY29uc3QgemggPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1x1NUJBMVx1NjdFNVx1NUY1M1x1NTI0RFx1OTg3OVx1NzZFRVx1NEUwRVx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOScsXG4gICd0YWIuc2Vzc2lvbic6ICdcdTRGMUFcdThCRERcdTY2RjRcdTY1MzknLFxuICAndGFiLndvcmtzcGFjZSc6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAncmV2aWV3LnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdyZXZpZXcuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnXHU2RTM4XHU3OUJCIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnXHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHU0RTBEXHU2NjJGIGdpdCBcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1x1MzAwQ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOVx1MzAwRFx1OTg3NVx1N0I3RVx1NEUwRFx1NTNEN1x1NUY3MVx1NTRDRFx1RkYwQ1x1NEVDRFx1NTNFRlx1NjdFNVx1NzcwQlx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOVx1MzAwMicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdcdThGRDlcdTRFMkFcdTRGMUFcdThCRERcdThGRDhcdTZDQTFcdTY3MDlcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzlcdThCQjBcdTVGNTUnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSBcdThGNkUgXHUwMEI3IHtmaWxlc30gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdcdTdCMkMge3JvdW5kfSBcdThGNkUnLFxuICAncmV2aWV3LmVtcHR5JzogJ1x1NkNBMVx1NjcwOVx1NjcyQVx1NjNEMFx1NEVBNFx1NzY4NFx1NjZGNFx1NjUzOSBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdcdTUxNjhcdTkwRThcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnXHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1x1NTE2OFx1OTBFOFx1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlJzogJ1x1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAnaHVuay51bnN0YWdlJzogJ1x1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAnaHVuay51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnXHU2M0QwXHU0RUE0XHU4QkY0XHU2NjBFXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1x1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnXHU1REYyXHU2M0QwXHU0RUE0IHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ1x1NjNEMFx1NEVBNFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucHVzaGVkJzogJ1x1NURGMlx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdcdTYzQThcdTkwMDFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFoZWFkJzogJ1x1OTg4Nlx1NTE0OCB7bn0nLFxuICAncmV2aWV3LmJlaGluZCc6ICdcdTg0M0RcdTU0MEUge259JyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ1x1NTIwNlx1NjUyRlx1NEUwRVx1OEZEQ1x1N0EwQicsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdcdTY3MkFcdThCQkVcdTdGNkVcdTRFMEFcdTZFMzhcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnXHU1Mzg2XHU1M0YyJyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdcdTUzRDhcdTUyQThcdTY1ODdcdTRFRjYnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdcdTY3MkNcdTU3MzAnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAnXHU4RkRDXHU3QTBCJyxcbiAgJ3RpbWUubm93JzogJ1x1NTIxQVx1NTIxQScsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IFx1NTIwNlx1OTQ5Rlx1NTI0RCcsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBcdTVDMEZcdTY1RjZcdTUyNEQnLFxuICAndGltZS5kYXlzJzogJ3tufSBcdTU5MjlcdTUyNEQnLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnXHU1MjM3XHU2NUIwJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdcdTUxNzNcdTk1RUQnLFxuICAncmV2aWV3LmJ1c3knOiAnXHU1OTA0XHU3NDA2XHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ1x1NURGMnthY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjZcdUZGMDhcdTUyMjBcdTk2NjQge2RlbGV0ZWR9IFx1NEUyQVx1NjcyQVx1OERERlx1OEUyQVx1NjU4N1x1NEVGNlx1RkYwOScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICdcdTY3MkFcdThEREZcdThFMkEnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdcdTRFOENcdThGREJcdTUyMzYnLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnXHU4QkU1XHU0RkVFXHU2NTM5XHU2Q0ExXHU2NzA5IGRpZmYgXHU2NTcwXHU2MzZFJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnXHU1MzU1XHU2ODBGJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnXHU1M0NDXHU2ODBGJyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ1x1NTM5Rlx1NjU4N1x1NEVGNicsXG4gICd2aWV3LmFmdGVyJzogJ1x1NjVCMFx1NjU4N1x1NEVGNicsXG4gICdjb21tZW50LmFkZCc6ICdcdThCQzRcdThCQkFcdTZCNjRcdTg4NEMnLFxuICAnY29tbWVudC5zaG93JzogJ1x1NjdFNVx1NzcwQlx1OEJDNFx1OEJCQScsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ1x1OEJDNFx1OEJCQVx1MjAyNlx1RkYwOEN0cmwvXHUyMzE4K0VudGVyIFx1NEZERFx1NUI1OFx1RkYwOScsXG4gICdjb21tZW50LnNhdmUnOiAnXHU0RkREXHU1QjU4JyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ1x1NTNENlx1NkQ4OCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdcdTUyMjBcdTk2NjQnLFxuICAnY29tbWVudC5zYXZlZCc6ICdcdTVERjJcdTRGRERcdTVCNThcdThCQzRcdThCQkEnLFxuICAnY29tbWVudC5mYWlsZWQnOiAnXHU4QkM0XHU4QkJBXHU0RkREXHU1QjU4XHU1OTMxXHU4RDI1JyxcbiAgJ3Njb3BlLmxhYmVsJzogJ1x1ODMwM1x1NTZGNCcsXG4gICdzY29wZS5hbGwnOiAnXHU1MTY4XHU5MEU4JyxcbiAgJ3Njb3BlLnVuc3RhZ2VkJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdzY29wZS5zdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ3Njb3BlLmNvbW1pdCc6ICdcdTYzRDBcdTRFQTQnLFxuICAnc2NvcGUuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdzY29wZS5sYXN0LXR1cm4nOiAnXHU2NzAwXHU1NDBFXHU0RTAwXHU4RjZFJyxcbiAgJ3Njb3BlLmJhc2UnOiAnXHU1N0ZBXHU3RUJGXHU1MjA2XHU2NTJGJyxcbiAgJ3Njb3BlLmJyYW5jaFJlYWRvbmx5JzogJ1x1NTIwNlx1NjUyRlx1ODMwM1x1NTZGNFx1NTNFQVx1OEJGQlx1RkYwOFx1NUJGOVx1NkJENCBtZXJnZS1iYXNlXHVGRjBDXHU0RTBEXHU2M0QwXHU0RjlCXHU5MUM3XHU3RUIzL1x1NEUyMlx1NUYwM1x1RkYwOScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1x1NEVDRVx1NURFNlx1NEZBN1x1OTAwOVx1NjJFOVx1NjNEMFx1NEVBNFx1NjdFNVx1NzcwQiBkaWZmJyxcbiAgJ3Jldmlldy5zZW5kVG9BZ2VudCc6ICdcdTUzRDFcdTkwMDFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdcdTUzRDFcdTkwMDFcdTg4NENcdTUxODVcdThCQzRcdThCQkFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ1x1OEJDNFx1OEJCQVx1NEYxQVx1NEY1Q1x1NEUzQVx1OEJDNFx1NUJBMVx1NjMwN1x1NUYxNVx1NkNFOFx1NTE2NVx1NUY1M1x1NTI0RFx1NEYxQVx1OEJERFx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwOVx1MzAwMlx1NTNEMVx1OTAwMVx1NTkzMVx1OEQyNVx1NjVGNlx1OTAwMFx1NTMxNlx1NEUzQVx1NTkwRFx1NTIzNlx1NjU4N1x1NjcyQ1x1MzAwMicsXG4gICdyZXZpZXcuc2VudFRvQWdlbnQnOiAnXHU1REYyXHU1M0QxXHU5MDAxXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5jb3B5JzogJ1x1NTkwRFx1NTIzNlx1NjU4N1x1NjcyQycsXG4gICdyZXZpZXcuY29waWVkJzogJ1x1NURGMlx1NTkwRFx1NTIzNicsXG4gICdyZXZpZXcuY29weUZhaWxlZCc6ICdcdTU5MERcdTUyMzZcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnJldmlldyc6ICdcdThCQzRcdTVCQTEnLFxuICAncmV2aWV3LnJldmlld2luZyc6ICdcdThCQzRcdTVCQTFcdTRFMkRcdTIwMjYnLFxuICAncmV2aWV3LnJldmlld0ZhaWxlZCc6ICdcdThCQzRcdTVCQTFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnZlcmRpY3RDb3JyZWN0JzogJ1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RSBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnXHU4ODY1XHU0RTAxXHU1QjU4XHU1NzI4XHU5NUVFXHU5ODk4IFx1MjcxNycsXG4gICdyZXZpZXcubm9GaW5kaW5ncyc6ICdcdTZDQTFcdTY3MDlcdTUzRDFcdTczQjBcdTk1RUVcdTk4OTgnLFxuICAncmV2aWV3LmZpbmRpbmdzJzogJ3tufSBcdTY3NjFcdTUzRDFcdTczQjAnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnXHU3RjZFXHU0RkUxXHU1RUE2IHtjb25maWRlbmNlfScsXG4gICdyZXZpZXcuc3VnZ2VzdGlvbic6ICdcdTVFRkFcdThCQUUnLFxuICAncmV2aWV3LnNlbmRGaW5kaW5ncyc6ICdcdTUzRDFcdTkwMDFcdTUzRDFcdTczQjBcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdcdTVERjJcdTUzRDFcdTkwMDFcdTUzRDFcdTczQjBcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnJldmlld1Njb3BlJzogJ1x1OEJDNFx1NUJBMVx1ODMwM1x1NTZGNCcsXG4gICdwci50aXRsZSc6ICdQUiAje251bWJlcn0nLFxuICAncHIuY29tbWVudHMnOiAnUFIgXHU4QkM0XHU4QkJBICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnXHU2NUUwXHU1MTczXHU4MDU0IFBSJyxcbiAgJ3ByLnNlbmRDb21tZW50cyc6ICdcdTUzRDFcdTkwMDEgUFIgXHU4QkM0XHU4QkJBXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ2VkaXRvci5vcGVuRmlsZSc6ICdcdTU3MjhcdTdGMTZcdThGOTFcdTU2NjhcdTRFMkRcdTYyNTNcdTVGMDAnLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ1x1NTcyOFx1N0YxNlx1OEY5MVx1NTY2OFx1NEUyRFx1NjI1M1x1NUYwMFx1OEJFNVx1ODg0QycsXG4gICdlZGl0b3IuZmFpbGVkJzogJ1x1NjI1M1x1NUYwMFx1NTkzMVx1OEQyNScsXG4gICdyZXBvLmxhYmVsJzogJ1x1NEVEM1x1NUU5MycsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdcdTUzRDhcdTUyQTgnLFxuICAnc2V0dGluZ3MuZm9udCc6ICdcdTVCNTdcdTRGNTMnLFxuICAnc2V0dGluZ3Muc2l6ZSc6ICdcdTVCNTdcdTUzRjcnLFxuICAnY29uZmlnLnRpdGxlJzogJ1x1OTE0RFx1N0Y2RScsXG4gICdmb250Lm1vbm8nOiAnXHU3QjQ5XHU1QkJEXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjA5JyxcbiAgJ2ZvbnQuc3lzdGVtJzogJ1x1N0NGQlx1N0VERlx1NUI1N1x1NEY1MycsXG59IGFzIGNvbnN0XG5cbi8qKiBFbmdsaXNoIGRpY3Rpb25hcnksIGNoZWNrZWQgY29tcGxldGUgYWdhaW5zdCB0aGUgemgga2V5IHNldC4gKi9cbmNvbnN0IGVuOiBSZWNvcmQ8a2V5b2YgdHlwZW9mIHpoLCBzdHJpbmc+ID0ge1xuICAnYWN0aW9uLmxhYmVsJzogJ0NoYW5nZXMnLFxuICAnYWN0aW9uLmFyaWEnOiAnUmV2aWV3IHdvcmtzcGFjZSBhbmQgcGVyLXJvdW5kIGNoYW5nZXMnLFxuICAndGFiLnNlc3Npb24nOiAnU2Vzc2lvbicsXG4gICd0YWIud29ya3NwYWNlJzogJ1dvcmtzcGFjZScsXG4gICdyZXZpZXcudGl0bGUnOiAnQ2hhbmdlcycsXG4gICdyZXZpZXcuYnJhbmNoJzogJ2JyYW5jaCcsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnZGV0YWNoZWQgSEVBRCcsXG4gICdyZXZpZXcubm90UmVwbyc6ICdUaGlzIGRpcmVjdG9yeSBpcyBub3QgYSBnaXQgcmVwb3NpdG9yeScsXG4gICdyZXZpZXcubm90UmVwb0hpbnQnOiAnVGhlIFwiU2Vzc2lvblwiIHRhYiBzdGlsbCBzaG93cyBldmVyeSByb3VuZFxcJ3MgY2hhbmdlcy4nLFxuICAncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnOiAnTm8gZmlsZSBjaGFuZ2VzIHJlY29yZGVkIGluIHRoaXMgc2Vzc2lvbiB5ZXQnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSByb3VuZHMgXHUwMEI3IHtmaWxlc30gZmlsZXMnLFxuICAncmV2aWV3LnJvdW5kJzogJ1JvdW5kIHtyb3VuZH0nLFxuICAncmV2aWV3LmVtcHR5JzogJ05vIHVuY29tbWl0dGVkIGNoYW5nZXMgXHVEODNDXHVERjg5JyxcbiAgJ3Jldmlldy5sb2FkRXJyb3InOiAnRmFpbGVkIHRvIGxvYWQnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdBY2NlcHQnLFxuICAncmV2aWV3LnJldmVydCc6ICdSZXZlcnQnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdBY2NlcHQgYWxsJyxcbiAgJ3Jldmlldy5yZXZlcnRBbGwnOiAnUmV2ZXJ0IGFsbCcsXG4gICdyZXZpZXcudW5zdGFnZSc6ICdVbnN0YWdlJyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1Vuc3RhZ2UgYWxsJyxcbiAgJ2h1bmsuc3RhZ2UnOiAnU3RhZ2UnLFxuICAnaHVuay5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ2h1bmsudW5zdGFnZSc6ICdVbnN0YWdlJyxcbiAgJ2h1bmsuc3RhZ2VkJzogJ3N0YWdlZCcsXG4gICdodW5rLnVuc3RhZ2VkJzogJ3Vuc3RhZ2VkJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0JzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcmV2ZXJ0JyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcmV2ZXJ0IGFsbCcsXG4gICdyZXZpZXcuY29tbWl0JzogJ0NvbW1pdCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnQ29tbWl0IG1lc3NhZ2VcdTIwMjYnLFxuICAncmV2aWV3LnB1c2gnOiAnUHVzaCcsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSBwdXNoJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnQ29tbWl0dGVkIHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ0NvbW1pdCBmYWlsZWQnLFxuICAncmV2aWV3LnB1c2hlZCc6ICdQdXNoZWQnLFxuICAncmV2aWV3LnB1c2hGYWlsZWQnOiAnUHVzaCBmYWlsZWQnLFxuICAncmV2aWV3LmFoZWFkJzogJ3tufSBhaGVhZCcsXG4gICdyZXZpZXcuYmVoaW5kJzogJ3tufSBiZWhpbmQnLFxuICAncmV2aWV3LnNlY3Rpb25TdGFnZWQnOiAnU3RhZ2VkJyxcbiAgJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcyc6ICdDaGFuZ2VzJyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ0JyYW5jaCB2cyByZW1vdGUnLFxuICAncmV2aWV3Lm5vVXBzdHJlYW0nOiAnbm8gdXBzdHJlYW0nLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnSGlzdG9yeScsXG4gICdyZXZpZXcuY29tbWl0RmlsZXMnOiAnRmlsZXMnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdsb2NhbCcsXG4gICdoaXN0b3J5LnJlbW90ZSc6ICdyZW1vdGUnLFxuICAndGltZS5ub3cnOiAnanVzdCBub3cnLFxuICAndGltZS5taW51dGVzJzogJ3tufSBtaW4gYWdvJyxcbiAgJ3RpbWUuaG91cnMnOiAne259IGggYWdvJyxcbiAgJ3RpbWUuZGF5cyc6ICd7bn0gZCBhZ28nLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnUmVmcmVzaCcsXG4gICdyZXZpZXcuY2xvc2UnOiAnQ2xvc2UnLFxuICAncmV2aWV3LmJ1c3knOiAnV29ya2luZ1x1MjAyNicsXG4gICdyZXZpZXcuZG9uZSc6ICd7YWN0aW9ufSB7Y291bnR9IGZpbGVzJyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ3thY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcyAoe2RlbGV0ZWR9IHVudHJhY2tlZCBkZWxldGVkKScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnQWNjZXB0ZWQnLFxuICAncmV2aWV3LnJldmVydGVkJzogJ1JldmVydGVkJyxcbiAgJ3Jldmlldy51bnRyYWNrZWQnOiAndW50cmFja2VkJyxcbiAgJ3Jldmlldy5iaW5hcnknOiAnYmluYXJ5JyxcbiAgJ3Jldmlldy5ub0RpZmZEYXRhJzogJ05vIGRpZmYgZGF0YSBmb3IgdGhpcyBjaGFuZ2UnLFxuICAncmV2aWV3LmNoYW5nZXMnOiAne2FkZGVkfSsge2RlbGV0ZWR9LScsXG4gICd2aWV3LnNpbmdsZSc6ICdTaW5nbGUnLFxuICAndmlldy5zcGxpdCc6ICdTcGxpdCcsXG4gICd2aWV3LmJlZm9yZSc6ICdCZWZvcmUnLFxuICAndmlldy5hZnRlcic6ICdBZnRlcicsXG4gICdjb21tZW50LmFkZCc6ICdDb21tZW50IG9uIHRoaXMgbGluZScsXG4gICdjb21tZW50LnNob3cnOiAnVmlldyBjb21tZW50cycsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ0NvbW1lbnRcdTIwMjYgKEN0cmwvXHUyMzE4K0VudGVyIHRvIHNhdmUpJyxcbiAgJ2NvbW1lbnQuc2F2ZSc6ICdTYXZlJyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ0NhbmNlbCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdEZWxldGUnLFxuICAnY29tbWVudC5zYXZlZCc6ICdDb21tZW50IHNhdmVkJyxcbiAgJ2NvbW1lbnQuZmFpbGVkJzogJ0ZhaWxlZCB0byBzYXZlIGNvbW1lbnQnLFxuICAnc2NvcGUubGFiZWwnOiAnU2NvcGUnLFxuICAnc2NvcGUuYWxsJzogJ0FsbCcsXG4gICdzY29wZS51bnN0YWdlZCc6ICdVbnN0YWdlZCcsXG4gICdzY29wZS5zdGFnZWQnOiAnU3RhZ2VkJyxcbiAgJ3Njb3BlLmNvbW1pdCc6ICdDb21taXQnLFxuICAnc2NvcGUuYnJhbmNoJzogJ0JyYW5jaCcsXG4gICdzY29wZS5sYXN0LXR1cm4nOiAnTGFzdCB0dXJuJyxcbiAgJ3Njb3BlLmJhc2UnOiAnQmFzZSBicmFuY2gnLFxuICAnc2NvcGUuYnJhbmNoUmVhZG9ubHknOiAnQnJhbmNoIHNjb3BlIGlzIHJlYWQtb25seSAobWVyZ2UtYmFzZSBkaWZmOyBubyBhY2NlcHQvcmV2ZXJ0KScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1NlbGVjdCBhIGNvbW1pdCBmcm9tIHRoZSBsZWZ0IHRvIHZpZXcgaXRzIGRpZmYnLFxuICAncmV2aWV3LnNlbmRUb0FnZW50JzogJ1NlbmQgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdTZW5kIGlubGluZSBjb21tZW50cyB0byB0aGUgYWdlbnQnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ0NvbW1lbnRzIGFyZSBpbmplY3RlZCBpbnRvIHRoZSBjdXJyZW50IHNlc3Npb24gYXMgcmV2aWV3IGd1aWRhbmNlIChBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHMpLiBGYWxscyBiYWNrIHRvIGNvcHlhYmxlIHRleHQgaWYgc2VuZGluZyBmYWlscy4nLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1NlbnQgdG8gYWdlbnQnLFxuICAncmV2aWV3LmNvcHknOiAnQ29weSB0ZXh0JyxcbiAgJ3Jldmlldy5jb3BpZWQnOiAnQ29waWVkJyxcbiAgJ3Jldmlldy5jb3B5RmFpbGVkJzogJ0NvcHkgZmFpbGVkJyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnUmV2aWV3JyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnUmV2aWV3aW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnUmV2aWV3IGZhaWxlZCcsXG4gICdyZXZpZXcudmVyZGljdENvcnJlY3QnOiAnUGF0Y2ggaXMgY29ycmVjdCBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnUGF0Y2ggbmVlZHMgd29yayBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnTm8gaXNzdWVzIGZvdW5kJyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gZmluZGluZ3MnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnY29uZmlkZW5jZSB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnU3VnZ2VzdGlvbicsXG4gICdyZXZpZXcuc2VuZEZpbmRpbmdzJzogJ1NlbmQgZmluZGluZ3MgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdGaW5kaW5ncyBzZW50IHRvIGFnZW50JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdSZXZpZXcgc2NvcGUnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIGNvbW1lbnRzICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnTm8gYXNzb2NpYXRlZCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnU2VuZCBQUiBjb21tZW50cyB0byBhZ2VudCcsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnT3BlbiBpbiBlZGl0b3InLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ09wZW4gdGhpcyBsaW5lIGluIGVkaXRvcicsXG4gICdlZGl0b3IuZmFpbGVkJzogJ0ZhaWxlZCB0byBvcGVuJyxcbiAgJ3JlcG8ubGFiZWwnOiAnUmVwbycsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnRm9udCcsXG4gICdzZXR0aW5ncy5zaXplJzogJ0ZvbnQgc2l6ZScsXG4gICdjb25maWcudGl0bGUnOiAnQ29uZmlndXJhdGlvbicsXG4gICdmb250Lm1vbm8nOiAnTW9ub3NwYWNlIChkZWZhdWx0KScsXG4gICdmb250LnN5c3RlbSc6ICdTeXN0ZW0gZm9udCcsXG59XG5cbnR5cGUgRGlmZlJldmlld0FjdGlvblByb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucyc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5cbnR5cGUgRGlmZlJldmlld092ZXJsYXlQcm9wcyA9IFByb3BzUnVudGltZTwnc2hlbGwub3ZlcmxheSc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7IHNlc3Npb25zOiBJU2Vzc2lvbnMgfVxuXG4vKiogRGlmZiBpY29uIChsdWNpZGUgZmlsZS1kaWZmKS4gKi9cbmZ1bmN0aW9uIEljb25EaWZmKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWN1pcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDEwaDZcIiAvPlxuICAgICAgPHBhdGggZD1cIk0xMiA3djZcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDE3aDZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25YKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xOCA2IDYgMThcIiAvPlxuICAgICAgPHBhdGggZD1cIm02IDYgMTIgMTJcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGV2cm9uRG93bigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJtNiA5IDYgNiA2LTZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGVjaygpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMi41XCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMCA2IDkgMTdsLTUtNVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxudHlwZSBWaWV3TW9kZSA9ICdzaW5nbGUnIHwgJ3NwbGl0J1xuXG4vKiogXHU1MzU1XHU2ODBGIC8gXHU1M0NDXHU2ODBGIHNlZ21lbnRlZCB0b2dnbGUgKHBlcnNpc3RlZCBhY3Jvc3Mgb3BlbnMpLiAqL1xuZnVuY3Rpb24gRGlmZlZpZXdUb2dnbGUoeyB2aWV3LCBvbkNoYW5nZSwgdCB9OiB7IHZpZXc6IFZpZXdNb2RlOyBvbkNoYW5nZTogKHY6IFZpZXdNb2RlKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci12aWV3LXRvZ2dsZVwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9e3QoJ3ZpZXcuc2luZ2xlJyl9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NpbmdsZScgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NpbmdsZSd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKCdzaW5nbGUnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc2luZ2xlJyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRzZHItdmlldy1idG4ke3ZpZXcgPT09ICdzcGxpdCcgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NwbGl0J31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NwbGl0Jyl9XG4gICAgICA+XG4gICAgICAgIHt0KCd2aWV3LnNwbGl0Jyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVHdvLWNvbHVtbiBzaWRlLWJ5LXNpZGUgZGlmZiBib2R5IChvbGQgbGVmdCwgbmV3IHJpZ2h0LCBsaW5lIG51bWJlcnMgYWxpZ25lZCkuICovXG5mdW5jdGlvbiBTcGxpdERpZmYoeyBibG9ja3MsIGJlZm9yZUxhYmVsLCBhZnRlckxhYmVsIH06IHsgYmxvY2tzOiBTcGxpdEJsb2NrW107IGJlZm9yZUxhYmVsOiBzdHJpbmc7IGFmdGVyTGFiZWw6IHN0cmluZyB9KSB7XG4gIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPntiZWZvcmVMYWJlbH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPnthZnRlckxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICA8ZGl2IGtleT17Yml9PlxuICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IChcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e3JpfSBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5sZWZ0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogUGVyLWh1bmsgYWN0aW9uIGJhciAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KSBmb3Igd29ya3NwYWNlIGRpZmZzLiAqL1xuZnVuY3Rpb24gSHVua1Rvb2xiYXIoe1xuICBodW5rLFxuICBidXN5LFxuICBvbkFjdGlvbixcbiAgdCxcbn06IHtcbiAgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuayB8IHVuZGVmaW5lZFxuICBidXN5OiBib29sZWFuXG4gIG9uQWN0aW9uOiAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICBpZiAoIWh1bmspIHJldHVybiBudWxsXG4gIGNvbnN0IHN0YWdlZCA9IGh1bmsubGF5ZXIgPT09ICdzdGFnZWQnXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWh1bmstYmFyXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWh1bmstbGF5ZXJcIj57c3RhZ2VkID8gdCgnaHVuay5zdGFnZWQnKSA6IHQoJ2h1bmsudW5zdGFnZWQnKX08L3NwYW4+XG4gICAgICB7c3RhZ2VkID8gKFxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigndW5zdGFnZScsIGh1bmspfT5cbiAgICAgICAgICB7dCgnaHVuay51bnN0YWdlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IChcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbignYWNjZXB0JywgaHVuayl9PlxuICAgICAgICAgIHt0KCdodW5rLnN0YWdlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKX1cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigncmV2ZXJ0JywgaHVuayl9PlxuICAgICAgICB7dCgnaHVuay5yZXZlcnQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgcm93cyB3aXRoIG9sZC9uZXcgbGluZSBudW1iZXJzIHRyYWNrZWQgdGhyb3VnaCBodW5rcy4gKi9cbmZ1bmN0aW9uIHVuaWZpZWRSb3dzV2l0aExpbmVzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSB7XG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICByZXR1cm4gcm93cy5tYXAoKHJvdykgPT4ge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBuZXdMaW5lKysgfVxuICAgIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbmV3TGluZSsrIH1cbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbnVsbCB9XG4gICAgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBudWxsIH1cbiAgfSlcbn1cblxuLyoqIE1hdGNoIGEgY29tbWVudCBhZ2FpbnN0IGEgcm93J3MgYW5jaG9ycyAoYm90aCBtdXN0IGFncmVlIHdoZW4gc2V0KS4gKi9cbmZ1bmN0aW9uIGNvbW1lbnRNYXRjaGVzKGNvbW1lbnQ6IFJldmlld0NvbW1lbnQsIG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBib29sZWFuIHtcbiAgaWYgKGNvbW1lbnQubGluZU5ldyAhPT0gbnVsbCAmJiBjb21tZW50LmxpbmVOZXcgIT09IG5ld0xpbmUpIHJldHVybiBmYWxzZVxuICBpZiAoY29tbWVudC5saW5lT2xkICE9PSBudWxsICYmIGNvbW1lbnQubGluZU9sZCAhPT0gb2xkTGluZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB0cnVlXG59XG5cbi8qKiBIb3Zlci10by1jb21tZW50IGFmZm9yZGFuY2UgKyBjb21tZW50IG1hcmtlciBmb3Igb25lIGRpZmYgbGluZS4gKi9cbmZ1bmN0aW9uIENvbW1lbnRMaW5lKHtcbiAgY291bnQsXG4gIG9wZW4sXG4gIG9uT3BlbixcbiAgb25Ub2dnbGUsXG4gIHQsXG59OiB7XG4gIGNvdW50OiBudW1iZXJcbiAgb3BlbjogYm9vbGVhblxuICBvbk9wZW46ICgpID0+IHZvaWRcbiAgb25Ub2dnbGU6ICgpID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLWNvbW1lbnQtYWRkJHtjb3VudCA+IDAgPyAnIGRzZHItY29tbWVudC1oYXMnIDogJyd9YH1cbiAgICAgIHRpdGxlPXtjb3VudCA+IDAgPyB0KCdjb21tZW50LnNob3cnKSA6IHQoJ2NvbW1lbnQuYWRkJyl9XG4gICAgICBhcmlhLWxhYmVsPXtjb3VudCA+IDAgPyB0KCdjb21tZW50LnNob3cnKSA6IHQoJ2NvbW1lbnQuYWRkJyl9XG4gICAgICBvbkNsaWNrPXtjb3VudCA+IDAgPyBvblRvZ2dsZSA6IG9uT3Blbn1cbiAgICA+XG4gICAgICB7Y291bnQgPiAwID8gY291bnQgOiAnKyd9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLyoqIFRoZSBpbmxpbmUgY29tbWVudCBlZGl0b3IsIHJlbmRlcmVkIGFzIGl0cyBvd24gcm93LiAqL1xuZnVuY3Rpb24gQ29tbWVudEVkaXRvcih7XG4gIHRleHQsXG4gIG9uVGV4dCxcbiAgb25TYXZlLFxuICBvbkNhbmNlbCxcbiAgYnVzeSxcbiAgdCxcbn06IHtcbiAgdGV4dDogc3RyaW5nXG4gIG9uVGV4dDogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvblNhdmU6ICgpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgYnVzeTogYm9vbGVhblxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1lZGl0b3JcIj5cbiAgICAgIDx0ZXh0YXJlYVxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaW5wdXRcIlxuICAgICAgICB2YWx1ZT17dGV4dH1cbiAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgIHJvd3M9ezJ9XG4gICAgICAgIHBsYWNlaG9sZGVyPXt0KCdjb21tZW50LnBsYWNlaG9sZGVyJyl9XG4gICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uVGV4dChldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICBvbktleURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBvbkNhbmNlbCgpXG4gICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSkgb25TYXZlKClcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCAhdGV4dC50cmltKCl9IG9uQ2xpY2s9e29uU2F2ZX0+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuc2F2ZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17b25DYW5jZWx9PlxuICAgICAgICAgIHt0KCdjb21tZW50LmNhbmNlbCcpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgd2l0aCBwZXItaHVuayBhY3Rpb24gYmFycyBhbmQgaW5saW5lIGNvbW1lbnRzICh3b3Jrc3BhY2UgZmlsZXMpLiAqL1xuZnVuY3Rpb24gVW5pZmllZERpZmYoe1xuICBkaWZmLFxuICBodW5rcyxcbiAgYnVzeSxcbiAgb25IdW5rQWN0aW9uLFxuICB0LFxuICBjb21tZW50cyxcbiAgY29tbWVudEVkaXRvcixcbiAgY29tbWVudFRleHQsXG4gIG9uQ29tbWVudFRleHQsXG4gIG9uT3BlbkNvbW1lbnQsXG4gIG9uU2F2ZUNvbW1lbnQsXG4gIG9uQ2FuY2VsQ29tbWVudCxcbiAgY29tbWVudFBvcG92ZXIsXG4gIG9uVG9nZ2xlUG9wb3ZlcixcbiAgb25EZWxldGVDb21tZW50LFxuICByZWFkT25seSxcbiAgcGF0aCxcbiAgcmV2aWV3RmluZGluZ3MsXG4gIG9uT3BlbkxpbmUsXG4gIGp1bXBMaW5lLFxufToge1xuICBkaWZmOiBzdHJpbmdcbiAgaHVua3M6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmtbXVxuICBidXN5OiBib29sZWFuXG4gIG9uSHVua0FjdGlvbjogKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuaykgPT4gdm9pZFxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbiAgY29tbWVudHM/OiBSZXZpZXdDb21tZW50W11cbiAgY29tbWVudEVkaXRvcj86IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbFxuICBjb21tZW50VGV4dD86IHN0cmluZ1xuICBvbkNvbW1lbnRUZXh0PzogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvbk9wZW5Db21tZW50PzogKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpID0+IHZvaWRcbiAgb25TYXZlQ29tbWVudD86ICgpID0+IHZvaWRcbiAgb25DYW5jZWxDb21tZW50PzogKCkgPT4gdm9pZFxuICBjb21tZW50UG9wb3Zlcj86IHN0cmluZyB8IG51bGxcbiAgb25Ub2dnbGVQb3BvdmVyPzogKGtleTogc3RyaW5nKSA9PiB2b2lkXG4gIG9uRGVsZXRlQ29tbWVudD86IChpZDogc3RyaW5nKSA9PiB2b2lkXG4gIC8qKiBIaWRlIHBlci1odW5rIGFjdGlvbiBiYXJzIChicmFuY2ggc2NvcGUgaXMgYSByZWFkLW9ubHkgZGlmZikuICovXG4gIHJlYWRPbmx5PzogYm9vbGVhblxuICAvKiogUmVwby1yZWxhdGl2ZSBmaWxlIHBhdGggKGZvciBvcGVuLWluLWVkaXRvciBhbmQgbWFya2VycykuICovXG4gIHBhdGg/OiBzdHJpbmdcbiAgLyoqIEFJLXJldmlldyBmaW5kaW5ncyB0byBtYXJrIG9uIG1hdGNoaW5nIGxpbmVzLiAqL1xuICByZXZpZXdGaW5kaW5ncz86IFJldmlld0ZpbmRpbmdbXVxuICAvKiogT3BlbiB0aGUgZmlsZSBhdCBhIGxpbmUgaW4gdGhlIHVzZXIncyBlZGl0b3IuICovXG4gIG9uT3BlbkxpbmU/OiAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IHZvaWRcbiAgLyoqIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoZS5nLiBqdW1wIGZyb20gYSBQUiBjb21tZW50KS4gKi9cbiAganVtcExpbmU/OiBudW1iZXIgfCBudWxsXG59KSB7XG4gIGNvbnN0IGJsb2NrcyA9IHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gIGxldCBodW5rSW5kZXggPSAwXG4gIGNvbnN0IGVkaXRpbmdLZXkgPSBjb21tZW50RWRpdG9yID8gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgOiBudWxsXG4gIGNvbnN0IGZpbmRpbmdzRm9yID0gKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBSZXZpZXdGaW5kaW5nW10gPT4ge1xuICAgIGlmICghcGF0aCB8fCAhcmV2aWV3RmluZGluZ3MgfHwgcmV2aWV3RmluZGluZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgICByZXR1cm4gcmV2aWV3RmluZGluZ3MuZmlsdGVyKChmKSA9PiB7XG4gICAgICBpZiAoZi5maWxlICE9PSBwYXRoKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChuZXdMaW5lICE9PSBudWxsKSByZXR1cm4gbmV3TGluZSA+PSBmLmxpbmVTdGFydCAmJiBuZXdMaW5lIDw9IGYubGluZUVuZFxuICAgICAgcmV0dXJuIG9sZExpbmUgIT09IG51bGwgJiYgb2xkTGluZSA+PSBmLmxpbmVTdGFydCAmJiBvbGRMaW5lIDw9IGYubGluZUVuZFxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzSHVuayA9IGJsb2NrLmhlYWQ/LmtpbmQgPT09ICdodW5rJ1xuICAgICAgICAgIGNvbnN0IGh1bmsgPSBpc0h1bmsgPyBodW5rc1todW5rSW5kZXgrK10gOiB1bmRlZmluZWRcbiAgICAgICAgICBjb25zdCBzdGFydHMgPSBibG9jay5oZWFkPy5raW5kID09PSAnaHVuaycgPyBodW5rU3RhcnRzKGJsb2NrLmhlYWQudGV4dCkgOiB7IG9sZFN0YXJ0OiAxLCBuZXdTdGFydDogMSB9XG4gICAgICAgICAgY29uc3Qgcm93cyA9IGlzSHVuayA/IHVuaWZpZWRSb3dzV2l0aExpbmVzKGJsb2NrLnJvd3MsIHN0YXJ0cy5vbGRTdGFydCwgc3RhcnRzLm5ld1N0YXJ0KSA6IFtdXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2JpfT5cbiAgICAgICAgICAgICAge2lzSHVuayAmJiAhcmVhZE9ubHkgPyA8SHVua1Rvb2xiYXIgaHVuaz17aHVua30gYnVzeT17YnVzeX0gb25BY3Rpb249e29uSHVua0FjdGlvbn0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke2Jsb2NrLmhlYWQua2luZH1gfT57YmxvY2suaGVhZC50ZXh0IHx8ICcgJ308L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICB7aXNIdW5rXG4gICAgICAgICAgICAgICAgPyByb3dzLm1hcCgoeyByb3csIG9sZExpbmUsIG5ld0xpbmUgfSwgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7b2xkTGluZSA/PyAnbyd9OiR7bmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dDb21tZW50cyA9IGNvbW1lbnRzPy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIG9sZExpbmUsIG5ld0xpbmUpKSA/PyBbXVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IGZpbmRpbmdzRm9yKG9sZExpbmUsIG5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVkaXRpbmcgPSBlZGl0aW5nS2V5ID09PSBrZXlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvd0FjdGlvbnMgPSByb3cua2luZCA9PT0gJ2N0eCcgfHwgcm93LmtpbmQgPT09ICdhZGQnIHx8IHJvdy5raW5kID09PSAnZGVsJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5nQ2xzID0gZmluZGluZ3MubGVuZ3RoID4gMCA/IGAgZHNkci1saW5lLWZpbmRpbmcgZHNkci1maW5kaW5nLSR7ZmluZGluZ3NbMF0ucHJpb3JpdHl9YCA6ICcnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGp1bXBlZCA9IGp1bXBMaW5lICE9IG51bGwgJiYgKG5ld0xpbmUgPT09IGp1bXBMaW5lIHx8IChuZXdMaW5lID09PSBudWxsICYmIG9sZExpbmUgPT09IGp1bXBMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH0ke3Jvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAnIGRzZHItbGluZS1jb21tZW50ZWQnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWxpbmUtanVtcCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLW51bVwiPntuZXdMaW5lID8/IG9sZExpbmUgPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtdGV4dFwiPntyb3cudGV4dCB8fCAnICd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9IHRpdGxlPXtmaW5kaW5nc1swXS50aXRsZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzWzBdLnByaW9yaXR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAxID8gYFx1MDBENyR7ZmluZGluZ3MubGVuZ3RofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cGF0aCAmJiBvbk9wZW5MaW5lICYmIChuZXdMaW5lID8/IG9sZExpbmUpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1vcGVubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbkxpbmUocGF0aCwgbmV3TGluZSA/PyBvbGRMaW5lID8/IDEpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e3Jvd0NvbW1lbnRzLmxlbmd0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Blbj17Y29tbWVudFBvcG92ZXIgPT09IGtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiBvbk9wZW5Db21tZW50Py4ob2xkTGluZSwgbmV3TGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBvblRvZ2dsZVBvcG92ZXI/LihrZXkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0PXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyAmJiByb3dDb21tZW50cy5sZW5ndGggPiAwICYmIGNvbW1lbnRQb3BvdmVyID09PSBrZXkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LXBvcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjb21tZW50LmlkfSBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC10ZXh0XCI+e2NvbW1lbnQudGV4dH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjb21tZW50LnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkRlbGV0ZUNvbW1lbnQ/Lihjb21tZW50LmlkKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlZGl0aW5nID8gPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHQgPz8gJyd9IG9uVGV4dD17b25Db21tZW50VGV4dCA/PyAoKCkgPT4ge30pfSBvblNhdmU9e29uU2F2ZUNvbW1lbnQgPz8gKCgpID0+IHt9KX0gb25DYW5jZWw9e29uQ2FuY2VsQ29tbWVudCA/PyAoKCkgPT4ge30pfSBidXN5PXtidXN5fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA6IGJsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyaX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgIDwvcHJlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuLyoqIERyYWcgaGFuZGxlIGZvciByZXNpemluZyB0aGUgcGFuZWwgKGVhc3QgLyBzb3V0aCAvIHNvdXRoLWVhc3QpLiAqL1xuZnVuY3Rpb24gUmVzaXplSGFuZGxlKHsgbW9kZSwgb25SZXNpemUgfTogeyBtb2RlOiAnZScgfCAncycgfCAnc2UnOyBvblJlc2l6ZTogKGR4OiBudW1iZXIsIGR5OiBudW1iZXIpID0+IHZvaWQgfSkge1xuICBjb25zdCBsYXN0ID0gdXNlUmVmPHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1yZXNpemUgZHNkci1yZXNpemUtJHttb2RlfWB9XG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWxhc3QuY3VycmVudCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGR4ID0gZXZlbnQuY2xpZW50WCAtIGxhc3QuY3VycmVudC54XG4gICAgICAgIGNvbnN0IGR5ID0gZXZlbnQuY2xpZW50WSAtIGxhc3QuY3VycmVudC55XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGlmIChkeCAhPT0gMCB8fCBkeSAhPT0gMCkgb25SZXNpemUoZHgsIGR5KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXsoZXZlbnQpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0gbnVsbFxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXsoKSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgIH19XG4gICAgLz5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoaXBDbGFzcyhzdGF0dXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHMgPSBzdGF0dXMucmVwbGFjZSgvXFxzL2csICcnKVxuICBpZiAocy5pbmNsdWRlcygnPz8nKSkgcmV0dXJuICdkc2RyLWNoaXAtdSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnQScpIHx8IHMuaW5jbHVkZXMoJ0EnKSkgcmV0dXJuICdkc2RyLWNoaXAtYSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnRCcpIHx8IHMuaW5jbHVkZXMoJ0QnKSkgcmV0dXJuICdkc2RyLWNoaXAtZCdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnUicpIHx8IHMuaW5jbHVkZXMoJ1InKSkgcmV0dXJuICdkc2RyLWNoaXAtcidcbiAgcmV0dXJuICdkc2RyLWNoaXAtbSdcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFN0YXR1cyhjd2Q6IHN0cmluZyk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgc3RhdHVzIHJlcXVlc3QgZmFpbGVkOiAke3Jlcy5zdGF0dXN9YClcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpKSBhcyBTdGF0dXNSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhcHBseUNoYW5nZXMoY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZyk6IFByb21pc2U8QXBwbHlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgYWN0aW9uLCBwYXRoIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQXBwbHlSZXNwb25zZVxufVxuXG4vKiogQXBwbHkgb25lIGh1bmsgb2Ygb25lIGZpbGUgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkuICovXG5hc3luYyBmdW5jdGlvbiBhcHBseUh1bmsoY3dkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBzdHJpbmcpOiBQcm9taXNlPEFwcGx5SHVua1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEFQUExZX0hVTktfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHBhdGgsIGFjdGlvbiwgaHVuayB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEFwcGx5SHVua1Jlc3BvbnNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bkdpdEFjdGlvbihjd2Q6IHN0cmluZywgYWN0aW9uOiAnY29tbWl0JyB8ICdwdXNoJywgbWVzc2FnZT86IHN0cmluZyk6IFByb21pc2U8R2l0UmVzcG9uc2U+IHtcbiAgY29uc3QgdXJsID0gYWN0aW9uID09PSAnY29tbWl0JyA/IENPTU1JVF9VUkwgOiBQVVNIX1VSTFxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShhY3Rpb24gPT09ICdjb21taXQnID8geyBjd2QsIG1lc3NhZ2UgfSA6IHsgY3dkIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgR2l0UmVzcG9uc2Vcbn1cblxuLyoqIExvY2FsICh1bnB1c2hlZCkgY29tbWl0cyBhaGVhZCBvZiB0aGUgdXBzdHJlYW0uICovXG5hc3luYyBmdW5jdGlvbiBsb2FkSGlzdG9yeShjd2Q6IHN0cmluZyk6IFByb21pc2U8SGlzdG9yeVJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0hJU1RPUllfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21taXRzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEhpc3RvcnlSZXNwb25zZVxufVxuXG4vKiogT25lIGNvbW1pdCdzIHVuaWZpZWQgZGlmZi4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRDb21taXREaWZmKGN3ZDogc3RyaW5nLCBoYXNoOiBzdHJpbmcpOiBQcm9taXNlPENvbW1pdERpZmZSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtDT01NSVRfRElGRl9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfSZoYXNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGhhc2gpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGRpZmY6ICcnLCBmaWxlczogW10sIGFkZGVkOiAwLCBkZWxldGVkOiAwLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQ29tbWl0RGlmZlJlc3BvbnNlXG59XG5cbi8qKiBJbmxpbmUgcmV2aWV3IGNvbW1lbnRzIGZvciB0aGUgd29ya3NwYWNlIChyZXBvLXNjb3BlZCkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWVudHMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFJldmlld0NvbW1lbnRbXT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtDT01NRU5UU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1lbnRzOiBbXSB9KSkpIGFzIENvbW1lbnRzUmVzcG9uc2VcbiAgcmV0dXJuIGRhdGEub2sgPyBkYXRhLmNvbW1lbnRzIDogW11cbn1cblxuLyoqIFJlcGxhY2UgdGhlIHdob2xlIGNvbW1lbnQgbGlzdCAoc2luZ2xlLXVzZXIgcmVwbGFjZSBzZW1hbnRpY3MpLiAqL1xuYXN5bmMgZnVuY3Rpb24gc2F2ZUNvbW1lbnRzKGN3ZDogc3RyaW5nLCBjb21tZW50czogUmV2aWV3Q29tbWVudFtdKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKENPTU1FTlRTX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBjb21tZW50cyB9KSxcbiAgfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSB9KSkpIGFzIENvbW1lbnRzUmVzcG9uc2VcbiAgcmV0dXJuIGRhdGEub2sgPT09IHRydWVcbn1cblxuLyoqIExvY2FsIGJyYW5jaCBuYW1lcyAoZm9yIHRoZSBCcmFuY2ggcmV2aWV3IHNjb3BlKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRCcmFuY2hlcyhjd2Q6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7QlJBTkNIRVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBicmFuY2hlczogW10gfSkpKSBhcyB7IG9rOiBib29sZWFuOyBicmFuY2hlczogc3RyaW5nW10gfVxuICByZXR1cm4gZGF0YS5vayA/IGRhdGEuYnJhbmNoZXMgOiBbXVxufVxuXG4vKiogUnVuIGFuIEFJIHJldmlldyBvdmVyIHRoZSBnaXZlbiBzY29wZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJ1blJldmlldyhjd2Q6IHN0cmluZywgc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBzY29wZTogJ3VuY29tbWl0dGVkJyB8ICdicmFuY2gnIHwgJ2NvbW1pdCcsIGJhc2U/OiBzdHJpbmcsIGNvbW1pdEhhc2g/OiBzdHJpbmcpOiBQcm9taXNlPFJldmlld1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFJFVklFV19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgc2Vzc2lvbklkOiBzZXNzaW9uSWQgPz8gdW5kZWZpbmVkLCBzY29wZSwgYmFzZSwgY29tbWl0SGFzaCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZmluZGluZ3M6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUmV2aWV3UmVzcG9uc2Vcbn1cblxuLyoqIEN1cnJlbnQgYnJhbmNoJ3MgR2l0SHViIFBSIGNvbnRleHQgKGRlZ3JhZGVzIGdyYWNlZnVsbHkgd2l0aG91dCBnaCkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkUHIoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFByUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7UFJfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21tZW50czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBQclJlc3BvbnNlXG59XG5cbi8qKiBHaXQgcmVwb3MgdW5kZXIgYSB3b3Jrc3BhY2UgKG11bHRpLXJlcG8gc2VsZWN0b3IpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZFJlcG9zKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxSZXBvc1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1JFUE9TX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgcmVwb3M6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUmVwb3NSZXNwb25zZVxufVxuXG4vKiogT3BlbiBhIGZpbGUgKG9wdGlvbmFsbHkgYXQgYSBsaW5lKSBpbiB0aGUgdXNlcidzIGVkaXRvciB2aWEgb3Blbi1lZGl0b3IuICovXG5hc3luYyBmdW5jdGlvbiBvcGVuSW5FZGl0b3IoY3dkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlcik6IFByb21pc2U8eyBvazogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICBjb25zdCBhYnMgPSBwYXRoLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocGF0aCkgPyBwYXRoIDogYCR7Y3dkfS8ke3BhdGh9YFxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChPUEVOX0VESVRPUl9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHBhdGg6IGFicywgbGluZSB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIHsgb2s6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH1cbn1cblxuLyoqIFNob3J0IHJlbGF0aXZlIHRpbWUgZm9yIGNvbW1pdCByb3dzIChcImp1c3Qgbm93XCIgLyBcIjMgbWluIGFnb1wiIC8gXHUyMDI2KS4gKi9cbmZ1bmN0aW9uIHJlbGF0aXZlVGltZShpc286IHN0cmluZywgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoKERhdGUubm93KCkgLSBuZXcgRGF0ZShpc28pLmdldFRpbWUoKSkgLyA2MDAwMClcbiAgaWYgKG1pbnV0ZXMgPCAxKSByZXR1cm4gdCgndGltZS5ub3cnKVxuICBpZiAobWludXRlcyA8IDYwKSByZXR1cm4gdCgndGltZS5taW51dGVzJywgeyBuOiBtaW51dGVzIH0pXG4gIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApXG4gIGlmIChob3VycyA8IDI0KSByZXR1cm4gdCgndGltZS5ob3VycycsIHsgbjogaG91cnMgfSlcbiAgcmV0dXJuIHQoJ3RpbWUuZGF5cycsIHsgbjogTWF0aC5mbG9vcihob3VycyAvIDI0KSB9KVxufVxuXG4vKiogVGhlbWUtYXdhcmUgZHJvcGRvd24gcmVwbGFjaW5nIG5hdGl2ZSA8c2VsZWN0PiAobmF0aXZlIHBvcHVwcyBpZ25vcmUgdGhlIHRoZW1lKS4gKi9cbmZ1bmN0aW9uIFRoZW1lU2VsZWN0KHtcbiAgdmFsdWUsXG4gIG9wdGlvbnMsXG4gIG9uQ2hhbmdlLFxuICBhcmlhTGFiZWwsXG59OiB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgb3B0aW9uczogeyB2YWx1ZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH1bXVxuICBvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWRcbiAgYXJpYUxhYmVsPzogc3RyaW5nXG59KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCByb290UmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKVxuICBjb25zdCBjdXJyZW50ID0gb3B0aW9ucy5maW5kKChvKSA9PiBvLnZhbHVlID09PSB2YWx1ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghb3BlbikgcmV0dXJuXG4gICAgY29uc3QgY2xvc2VPdXRzaWRlID0gKGV2ZW50OiBQb2ludGVyRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmICFyb290UmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGNvbnN0IGNsb3NlT25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGNsb3NlT3V0c2lkZSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2xvc2VPbktleSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBjbG9zZU91dHNpZGUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2xvc2VPbktleSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWxcIiByZWY9e3Jvb3RSZWZ9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1zZWwtdHJpZ2dlclwiXG4gICAgICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICAgICAgYXJpYS1leHBhbmRlZD17b3Blbn1cbiAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVsfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2KSA9PiAhdil9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLXZhbHVlXCI+e2N1cnJlbnQ/LmxhYmVsID8/IHZhbHVlfTwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93biAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cImRzZHItc2VsLW1lbnVcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgICAge29wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgICAgIDxsaSBrZXk9e29wdGlvbi52YWx1ZX0gcm9sZT1cIm5vbmVcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e29wdGlvbi52YWx1ZSA9PT0gdmFsdWV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zZWwtb3B0aW9uJHtvcHRpb24udmFsdWUgPT09IHZhbHVlID8gJyBkc2RyLXNlbC1vcHRpb24tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgb25DaGFuZ2Uob3B0aW9uLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtb3B0aW9uLW1hcmtcIj57b3B0aW9uLnZhbHVlID09PSB2YWx1ZSA/IDxJY29uQ2hlY2sgLz4gOiBudWxsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC1vcHRpb24tbGFiZWxcIj57b3B0aW9uLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3VsPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIERpZmYgZm9udCArIGZvbnQgc2l6ZSBjb250cm9scyAoc2hhcmVkIHByZWZzIHN0b3JlKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdQcmVmcyh7IHQgfTogeyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWZpZWxkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWxhYmVsXCIgaWQ9XCJkc2RyLXByZWYtZm9udC1sYWJlbFwiPnt0KCdzZXR0aW5ncy5mb250Jyl9PC9zcGFuPlxuICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLmZvbnQnKX1cbiAgICAgICAgICB2YWx1ZT17cHJlZnMuZm9udH1cbiAgICAgICAgICBvcHRpb25zPXtGT05UX09QVElPTlMubWFwKChmKSA9PiAoeyB2YWx1ZTogZi5pZCwgbGFiZWw6IGYubGFiZWwuc3RhcnRzV2l0aCgnZm9udC4nKSA/IHQoZi5sYWJlbCBhcyBrZXlvZiB0eXBlb2YgemgpIDogZi5sYWJlbCB9KSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyhmb250KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5mb250ID0gZm9udFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jZmctZmllbGRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbGFiZWxcIiBpZD1cImRzZHItcHJlZi1zaXplLWxhYmVsXCI+e3QoJ3NldHRpbmdzLnNpemUnKX08L3NwYW4+XG4gICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2V0dGluZ3Muc2l6ZScpfVxuICAgICAgICAgIHZhbHVlPXtTdHJpbmcocHJlZnMuc2l6ZSl9XG4gICAgICAgICAgb3B0aW9ucz17U0laRV9PUFRJT05TLm1hcCgocykgPT4gKHsgdmFsdWU6IFN0cmluZyhzKSwgbGFiZWw6IGAke3N9cHhgIH0pKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHNpemUpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLnNpemUgPSBOdW1iZXIoc2l6ZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgPC8+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBIZWFkZXIgYWN0aW9uIChzZXNzaW9uIHNjb3BlKTogYmFkZ2UgKyBvcGVuLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdBY3Rpb24oeyBzZXNzaW9uSWQsIHVzZVNlc3Npb25zLCB1c2VTZXNzaW9uLCB0IH06IERpZmZSZXZpZXdBY3Rpb25Qcm9wcykge1xuICBjb25zdCBjd2QgPSB1c2VTZXNzaW9ucygoczogU2Vzc2lvbkxpc3RTdGF0ZSkgPT4gcy5ieUlkW3Nlc3Npb25JZF0/LmN3ZClcbiAgY29uc3Qgbm9kZXMgPSB1c2VTZXNzaW9uKChzKSA9PiBzLm5vZGVzKVxuICBjb25zdCBjaGFuZ2VDb3VudCA9IHVzZU1lbW8oKCkgPT4gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlcyksIFtub2Rlc10pXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IG9wZW5PdmVybGF5ID0gKCkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1bnN1YiA9IG92ZXJsYXlTdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgc2V0T3BlbihvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QoKS5vcGVuKVxuICAgIH0pXG4gICAgcmV0dXJuIHVuc3ViXG4gIH0sIFtdKVxuXG4gIGlmICghY3dkKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci10cmlnZ2VyXCIgYXJpYS1sYWJlbD17dCgnYWN0aW9uLmFyaWEnKX0gb25DbGljaz17b3Blbk92ZXJsYXl9PlxuICAgICAgPEljb25EaWZmIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxhYmVsXCI+e3QoJ2FjdGlvbi5sYWJlbCcpfTwvc3Bhbj5cbiAgICAgIHtjaGFuZ2VDb3VudCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvdW50XCI+e2NoYW5nZUNvdW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAge29wZW4gPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XHUyNzEzPC9zcGFuPiA6IG51bGx9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaWxlIHRyZWU6IGJ1aWxkIGEgZGlyZWN0b3J5IHRyZWUgZnJvbSBmbGF0IHBhdGhzIGFuZCByZW5kZXIgaXQgd2l0aFxuLy8gY29sbGFwc2libGUgZm9sZGVycyAodGhlIGxlZnQgc2lkZSBvZiB0aGUgcmV2aWV3IHN1cmZhY2UpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnR5cGUgVHJlZURpcjxUPiA9IHsga2luZDogJ2Rpcic7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBjaGlsZHJlbjogVHJlZU5vZGU8VD5bXSB9XG50eXBlIFRyZWVMZWFmPFQ+ID0geyBraW5kOiAnbGVhZic7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBpdGVtOiBUIH1cbnR5cGUgVHJlZU5vZGU8VD4gPSBUcmVlRGlyPFQ+IHwgVHJlZUxlYWY8VD5cblxuLyoqIFR1cm4gYSBmbGF0IGl0ZW0gbGlzdCBpbnRvIGEgc29ydGVkIGRpcmVjdG9yeSB0cmVlIChkaXJlY3RvcmllcyBmaXJzdCkuICovXG5mdW5jdGlvbiBidWlsZEZpbGVUcmVlPFQ+KGl0ZW1zOiByZWFkb25seSBUW10sIHBhdGhPZjogKGl0ZW06IFQpID0+IHN0cmluZyk6IFRyZWVOb2RlPFQ+W10ge1xuICBjb25zdCByb290OiBUcmVlTm9kZTxUPltdID0gW11cbiAgY29uc3QgZGlySW5kZXggPSBuZXcgTWFwPHN0cmluZywgVHJlZURpcjxUPj4oKVxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBjb25zdCBwYXRoID0gcGF0aE9mKGl0ZW0pXG4gICAgY29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkgY29udGludWVcbiAgICBsZXQgc2libGluZ3MgPSByb290XG4gICAgbGV0IHByZWZpeCA9ICcnXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIHByZWZpeCA9IHByZWZpeCA/IGAke3ByZWZpeH0vJHtwYXJ0c1tpXX1gIDogcGFydHNbaV1cbiAgICAgIGxldCBkaXIgPSBkaXJJbmRleC5nZXQocHJlZml4KVxuICAgICAgaWYgKCFkaXIpIHtcbiAgICAgICAgZGlyID0geyBraW5kOiAnZGlyJywgbmFtZTogcGFydHNbaV0sIHBhdGg6IHByZWZpeCwgY2hpbGRyZW46IFtdIH1cbiAgICAgICAgZGlySW5kZXguc2V0KHByZWZpeCwgZGlyKVxuICAgICAgICBzaWJsaW5ncy5wdXNoKGRpcilcbiAgICAgIH1cbiAgICAgIHNpYmxpbmdzID0gZGlyLmNoaWxkcmVuXG4gICAgfVxuICAgIHNpYmxpbmdzLnB1c2goeyBraW5kOiAnbGVhZicsIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLCBwYXRoLCBpdGVtIH0pXG4gIH1cbiAgY29uc3Qgc29ydE5vZGVzID0gKG5vZGVzOiBUcmVlTm9kZTxUPltdKTogdm9pZCA9PiB7XG4gICAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYgKGEua2luZCAhPT0gYi5raW5kKSByZXR1cm4gYS5raW5kID09PSAnZGlyJyA/IC0xIDogMVxuICAgICAgcmV0dXJuIGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSlcbiAgICB9KVxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2RlcykgaWYgKG5vZGUua2luZCA9PT0gJ2RpcicpIHNvcnROb2Rlcyhub2RlLmNoaWxkcmVuKVxuICB9XG4gIHNvcnROb2Rlcyhyb290KVxuICByZXR1cm4gcm9vdFxufVxuXG4vKiogUmVjdXJzaXZlIHRyZWUgcmVuZGVyZXI6IGNvbGxhcHNpYmxlIGRpcmVjdG9yaWVzICsgbGVhZiByb3dzLiAqL1xuZnVuY3Rpb24gRmlsZVRyZWVWaWV3PFQ+KHByb3BzOiB7XG4gIG5vZGVzOiBUcmVlTm9kZTxUPltdXG4gIGNvbGxhcHNlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPlxuICBvblRvZ2dsZURpcjogKHBhdGg6IHN0cmluZykgPT4gdm9pZFxuICBkZXB0aDogbnVtYmVyXG4gIHJlbmRlckxlYWY6IChsZWFmOiBUcmVlTGVhZjxUPikgPT4gUmVhY3ROb2RlXG59KTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgeyBub2RlcywgY29sbGFwc2VkLCBvblRvZ2dsZURpciwgZGVwdGgsIHJlbmRlckxlYWYgfSA9IHByb3BzXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtub2Rlcy5tYXAoKG5vZGUpID0+XG4gICAgICAgIG5vZGUua2luZCA9PT0gJ2RpcicgPyAoXG4gICAgICAgICAgPGRpdiBrZXk9e25vZGUucGF0aH0+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWRpciR7Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJycgOiAnIGRzZHItZGlyLW9wZW4nfWB9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0ICsgOCB9fVxuICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXshY29sbGFwc2VkLmhhcyhub2RlLnBhdGgpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblRvZ2dsZURpcihub2RlLnBhdGgpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1jYXJldFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAnXHUyNUI4JyA6ICdcdTI1QkUnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItbmFtZVwiIHRpdGxlPXtub2RlLnBhdGh9Pntub2RlLm5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1jb3VudFwiPntub2RlLmNoaWxkcmVuLmxlbmd0aH08L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIHshY29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gKFxuICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3IG5vZGVzPXtub2RlLmNoaWxkcmVufSBjb2xsYXBzZWQ9e2NvbGxhcHNlZH0gb25Ub2dnbGVEaXI9e29uVG9nZ2xlRGlyfSBkZXB0aD17ZGVwdGggKyAxfSByZW5kZXJMZWFmPXtyZW5kZXJMZWFmfSAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPGRpdiBrZXk9e25vZGUucGF0aH0gc3R5bGU9e3sgcGFkZGluZ0xlZnQ6IGRlcHRoICogMTQgfX0+e3JlbmRlckxlYWYobm9kZSl9PC9kaXY+XG4gICAgICAgICksXG4gICAgICApfVxuICAgIDwvPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IG92ZXJsYXkgKHJvb3Qgc2NvcGUpOiBzZXNzaW9uICsgd29ya3NwYWNlIHRhYnMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gRGlmZlJldmlld092ZXJsYXkoeyBzZXNzaW9ucywgdCB9OiBEaWZmUmV2aWV3T3ZlcmxheVByb3BzKSB7XG4gIGNvbnN0IHN0b3JlU3RhdGUgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShvdmVybGF5U3RvcmUuc3Vic2NyaWJlLCBvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IHByZWZzID0gdXNlU3luY0V4dGVybmFsU3RvcmUocHJlZnNTdG9yZS5zdWJzY3JpYmUsIHByZWZzU3RvcmUuZ2V0U25hcHNob3QpXG4gIC8vIEdpdC1maXJzdDogbGFuZCBvbiB0aGUgd29ya3NwYWNlIHRhYiAoc3RhZ2VkL3Vuc3RhZ2VkL2JyYW5jaCB0cmVlcykgc28gdGhlXG4gIC8vIGNoYW5nZSByZXZpZXcgaXMgb25lIGNsaWNrIGF3YXk7IHRoZSBzZXNzaW9uIHRhYiBzdGF5cyBhIGNsaWNrIGF3YXkuXG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSB1c2VTdGF0ZTwnc2Vzc2lvbicgfCAnd29ya3NwYWNlJz4oJ3dvcmtzcGFjZScpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IHVzZVN0YXRlPFZpZXdNb2RlPigoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJyAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZHNkci12aWV3JykgPT09ICdzcGxpdCcgPyAnc3BsaXQnIDogJ3NpbmdsZSdcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiAnc2luZ2xlJ1xuICAgIH1cbiAgfSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RzZHItdmlldycsIHZpZXcpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBwcml2YXRlIG1vZGUgLyB1bmF2YWlsYWJsZSBcdTIwMTQgbm9uLWZhdGFsXG4gICAgfVxuICB9LCBbdmlld10pXG5cbiAgLy8gV29ya3NwYWNlIHRhYiBzdGF0ZS5cbiAgY29uc3QgW3N0YXR1cywgc2V0U3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW25vdGljZSwgc2V0Tm90aWNlXSA9IHVzZVN0YXRlPHsga2luZDogJ29rJyB8ICdlcnJvcic7IHRleHQ6IHN0cmluZyB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbmZpcm0sIHNldENvbmZpcm1dID0gdXNlU3RhdGU8J2ZpbGUnIHwgJ2FsbCcgfCAncHVzaCcgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0TWVzc2FnZSwgc2V0Q29tbWl0TWVzc2FnZV0gPSB1c2VTdGF0ZSgnJylcbiAgLy8gTG9jYWwgKHVucHVzaGVkKSBjb21taXQgaGlzdG9yeTogbGlzdCArIHBlci1jb21taXQgZGlmZiB2aWV3LlxuICBjb25zdCBbaGlzdG9yeSwgc2V0SGlzdG9yeV0gPSB1c2VTdGF0ZTxDb21taXRJbmZvW10+KFtdKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXQsIHNldFNlbGVjdGVkQ29tbWl0XSA9IHVzZVN0YXRlPENvbW1pdEluZm8gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZiwgc2V0Q29tbWl0RGlmZl0gPSB1c2VTdGF0ZTxDb21taXREaWZmUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZkxvYWRpbmcsIHNldENvbW1pdERpZmZMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXRGaWxlLCBzZXRTZWxlY3RlZENvbW1pdEZpbGVdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgLy8gSW5saW5lIHJldmlldyBjb21tZW50cyAod29ya3NwYWNlIHRhYiwgc2luZ2xlIHZpZXcpLlxuICBjb25zdCBbY29tbWVudHMsIHNldENvbW1lbnRzXSA9IHVzZVN0YXRlPFJldmlld0NvbW1lbnRbXT4oW10pXG4gIGNvbnN0IFtjb21tZW50RWRpdG9yLCBzZXRDb21tZW50RWRpdG9yXSA9IHVzZVN0YXRlPHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1lbnRUZXh0LCBzZXRDb21tZW50VGV4dF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2NvbW1lbnRQb3BvdmVyLCBzZXRDb21tZW50UG9wb3Zlcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBSZXZpZXcgc2NvcGU6IHdoaWNoIHNsaWNlIG9mIHRoZSByZXBvc2l0b3J5IHRoZSB3b3Jrc3BhY2UgdGFiIHNob3dzLlxuICBjb25zdCBbc2NvcGUsIHNldFNjb3BlXSA9IHVzZVN0YXRlPFdvcmtzcGFjZVNjb3BlPignYWxsJylcbiAgY29uc3QgW2JyYW5jaGVzLCBzZXRCcmFuY2hlc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oW10pXG4gIGNvbnN0IFtiYXNlQnJhbmNoLCBzZXRCYXNlQnJhbmNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtiYXNlU3RhdHVzLCBzZXRCYXNlU3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gRmVlZGJhY2sgbG9vcDogc2VuZCBpbmxpbmUgY29tbWVudHMgdG8gdGhlIGFnZW50IChzZXNzaW9uLnByb21wdCwgY29weSBmYWxsYmFjaykuXG4gIGNvbnN0IFtzZW5kT3Blbiwgc2V0U2VuZE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZW5kVGV4dCwgc2V0U2VuZFRleHRdID0gdXNlU3RhdGUoJycpXG4gIC8vIEFJIHJldmlldyAoL3Jldmlldyk6IGZpbmRpbmdzICsgdmVyZGljdC5cbiAgY29uc3QgW3Jldmlldywgc2V0UmV2aWV3XSA9IHVzZVN0YXRlPFJldmlld1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3Jldmlld2luZywgc2V0UmV2aWV3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICAvLyBHaXRIdWIgUFIgY29udGV4dCAoZ2ggQ0xJKS5cbiAgY29uc3QgW3ByLCBzZXRQcl0gPSB1c2VTdGF0ZTxQclJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gTXVsdGktcmVwbzogcmVwb3MgZGV0ZWN0ZWQgdW5kZXIgdGhlIHdvcmtzcGFjZSArIHRoZSBzZWxlY3RlZCBvbmUuXG4gIGNvbnN0IFtyZXBvcywgc2V0UmVwb3NdID0gdXNlU3RhdGU8eyBwYXRoOiBzdHJpbmc7IGJyYW5jaDogc3RyaW5nIHwgbnVsbCB9W10+KFtdKVxuICBjb25zdCBbcmVwb1BhdGgsIHNldFJlcG9QYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoanVtcCB0YXJnZXQgZnJvbSBhIFBSIGNvbW1lbnQgb3IgYSBmaW5kaW5nKS5cbiAgY29uc3QgW2p1bXBMaW5lLCBzZXRKdW1wTGluZV0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICAvLyBGaW5kaW5ncyBsaXN0IHBhbmVsIHZpc2liaWxpdHkuXG4gIGNvbnN0IFtmaW5kaW5nc09wZW4sIHNldEZpbmRpbmdzT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICAvKiogU2VsZWN0IGEgZmlsZSBhbmQgZmxhc2ggaXRzIGxpbmUgKGZpbmRpbmdzIC8gUFIgY29tbWVudHMpLiAqL1xuICBjb25zdCBqdW1wVG8gPSAoZmlsZTogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWQoZmlsZSlcbiAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICBzZXRKdW1wTGluZShsaW5lID8/IG51bGwpXG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgfVxuICAvLyBDb2xsYXBzZWQgZGlyZWN0b3JpZXMgaW4gdGhlIGxlZnQtaGFuZCBmaWxlIHRyZWUgKHNoYXJlZCBhY3Jvc3MgdGFicykuXG4gIGNvbnN0IFtjb2xsYXBzZWREaXJzLCBzZXRDb2xsYXBzZWREaXJzXSA9IHVzZVN0YXRlPFJlYWRvbmx5U2V0PHN0cmluZz4+KCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgdG9nZ2xlRGlyID0gdXNlTWVtbyhcbiAgICAoKSA9PiAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBzZXRDb2xsYXBzZWREaXJzKChwcmV2KSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpXG4gICAgICAgIGlmIChuZXh0LmhhcyhwYXRoKSkgbmV4dC5kZWxldGUocGF0aClcbiAgICAgICAgZWxzZSBuZXh0LmFkZChwYXRoKVxuICAgICAgICByZXR1cm4gbmV4dFxuICAgICAgfSlcbiAgICB9LFxuICAgIFtdLFxuICApXG4gIGNvbnN0IG5vdGljZVRpbWVyID0gdXNlUmVmPFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkPih1bmRlZmluZWQpXG5cbiAgLy8gQ3VycmVudCBzZXNzaW9uJ3MgY29udmVyc2F0aW9uIHNuYXBzaG90IChyZWFjdGl2ZSksIGZvciB0aGUgc2Vzc2lvbiB0YWIuXG4gIGNvbnN0IGN1cnJlbnRJZCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4gKG5vdGlmeTogKCkgPT4gdm9pZCkgPT4gc2Vzc2lvbnMubGlzdC5zdWJzY3JpYmUobm90aWZ5KSwgW3Nlc3Npb25zXSksXG4gICAgdXNlTWVtbygoKSA9PiAoKSA9PiBzZXNzaW9ucy5saXN0LmdldFNuYXBzaG90KCkuY3VycmVudCwgW3Nlc3Npb25zXSksXG4gIClcbiAgY29uc3Qgc25hcHNob3QgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgaWYgKCFiaW5kaW5nKSByZXR1cm4gKCkgPT4ge31cbiAgICAgICAgcmV0dXJuIGJpbmRpbmcuc2Vzc2lvbi5zdWJzY3JpYmUobm90aWZ5KVxuICAgICAgfVxuICAgIH0sIFtzZXNzaW9ucywgY3VycmVudElkXSksXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiBiaW5kaW5nID8gYmluZGluZy5zZXNzaW9uLmdldFNuYXBzaG90KCkgOiBudWxsXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgKVxuXG4gIGNvbnN0IHJvdW5kcyA9IHVzZU1lbW8oKCkgPT4gKHNuYXBzaG90ID8gY29sbGVjdFNlc3Npb25Sb3VuZHMoc25hcHNob3Qubm9kZXMpIDogW10pLCBbc25hcHNob3RdKVxuICAvLyBMZWZ0LWhhbmQgZmlsZSB0cmVlczogcGVyLXJvdW5kIHRyZWVzIGZvciB0aGUgc2Vzc2lvbiB0YWIsIG9uZSB0cmVlIGZvclxuICAvLyB0aGUgZ2l0IHdvcmtpbmcgdHJlZSBvbiB0aGUgd29ya3NwYWNlIHRhYi5cbiAgY29uc3Qgc2Vzc2lvblRyZWVzID0gdXNlTWVtbygoKSA9PiBuZXcgTWFwKHJvdW5kcy5tYXAoKHIpID0+IFtyLnJvdW5kLCBidWlsZEZpbGVUcmVlKHIuY2hhbmdlcywgKGMpID0+IGMucGF0aCldKSksIFtyb3VuZHNdKVxuICBjb25zdCB0b3RhbFNlc3Npb25GaWxlcyA9IHVzZU1lbW8oKCkgPT4gcm91bmRzLnJlZHVjZSgobiwgcikgPT4gbiArIHIuY2hhbmdlcy5sZW5ndGgsIDApLCBbcm91bmRzXSlcbiAgY29uc3QgW3NlbGVjdGVkUm91bmQsIHNldFNlbGVjdGVkUm91bmRdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkUGF0aCwgc2V0U2VsZWN0ZWRQYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHNlbGVjdGVkQ2hhbmdlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgcm91bmQgPSByb3VuZHMuZmluZCgocikgPT4gci5yb3VuZCA9PT0gc2VsZWN0ZWRSb3VuZClcbiAgICByZXR1cm4gcm91bmQ/LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBzZWxlY3RlZFBhdGgpID8/IG51bGxcbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZCwgc2VsZWN0ZWRQYXRoXSlcblxuICBjb25zdCBjd2QgPSBzdG9yZVN0YXRlLmN3ZFxuICAvKiogQWN0aXZlIGdpdCByZXBvIGZvciB3b3Jrc3BhY2Ugb3BlcmF0aW9ucyAobXVsdGktcmVwbyBzZWxlY3RvciBvdmVycmlkZSkuICovXG4gIGNvbnN0IGFjdGl2ZUN3ZCA9IHJlcG9QYXRoID8/IGN3ZFxuXG4gIGNvbnN0IGxvYWRXb3Jrc3BhY2UgPSBhc3luYyAoc2lsZW50ID0gZmFsc2UpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKCFzaWxlbnQpIHNldExvYWRpbmcodHJ1ZSlcbiAgICBzZXRFcnJvcihudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBbbmV4dCwgaGlzdCwgbmV4dENvbW1lbnRzLCBicmFuY2hMaXN0LCBwckRhdGEsIHJlcG9MaXN0XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgbG9hZFN0YXR1cyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkSGlzdG9yeShhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkQ29tbWVudHMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEJyYW5jaGVzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRQcihhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUmVwb3MoYWN0aXZlQ3dkKSxcbiAgICAgIF0pXG4gICAgICBzZXRTdGF0dXMobmV4dClcbiAgICAgIGlmIChoaXN0Lm9rKSBzZXRIaXN0b3J5KGhpc3QuY29tbWl0cylcbiAgICAgIHNldENvbW1lbnRzKG5leHRDb21tZW50cylcbiAgICAgIHNldEJyYW5jaGVzKGJyYW5jaExpc3QpXG4gICAgICBzZXRQcihwckRhdGEpXG4gICAgICBzZXRSZXBvcyhyZXBvTGlzdC5yZXBvcylcbiAgICAgIC8vIERlZmF1bHQgdGhlIHJlcG8gc2VsZWN0b3IgdG8gdGhlIHdvcmtzcGFjZSByb290IHdoZW4gaXQgaXMgaXRzZWxmIGEgcmVwby5cbiAgICAgIGlmIChyZXBvUGF0aCA9PT0gbnVsbCAmJiAhcmVwb0xpc3QucmVwb3Muc29tZSgocikgPT4gci5wYXRoID09PSBhY3RpdmVDd2QpKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gcmVwb0xpc3QucmVwb3NbMF1cbiAgICAgICAgaWYgKGZpcnN0ICYmIGZpcnN0LnBhdGggIT09IGN3ZCkgc2V0UmVwb1BhdGgoZmlyc3QucGF0aClcbiAgICAgIH1cbiAgICAgIGlmIChuZXh0LmVycm9yICYmICFuZXh0LmlzUmVwbykgc2V0RXJyb3IobmV4dC5lcnJvcilcbiAgICAgIHNldFNlbGVjdGVkKChwcmV2KSA9PiAocHJldiAmJiBuZXh0LmZpbGVzLnNvbWUoKGYpID0+IGYucGF0aCA9PT0gcHJldikgPyBwcmV2IDogbmV4dC5maWxlc1swXT8ucGF0aCA/PyBudWxsKSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXRFcnJvcihlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gQXV0by1yZWZyZXNoIHRoZSB3b3Jrc3BhY2UgZGF0YTogcmVsb2FkIHdoZW5ldmVyIHRoZSB0YWIgYmVjb21lcyBhY3RpdmUgb3JcbiAgLy8gdGhlIHdvcmtzcGFjZSBjaGFuZ2VzLCBhbmQgcGVyaW9kaWNhbGx5IHdoaWxlIHRoZSBvdmVybGF5IGlzIG9wZW4uIEFcbiAgLy8gd29ya3NwYWNlIHN3aXRjaCBjbGVhcnMgc3RhbGUgY29tbWl0IHNlbGVjdGlvbiBhbmQgaGlzdG9yeSBmaXJzdC5cbiAgY29uc3Qgd29ya3NwYWNlQ3dkUmVmID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcHJldmlvdXMgPSB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudFxuICAgIHdvcmtzcGFjZUN3ZFJlZi5jdXJyZW50ID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICBpZiAodGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAocHJldmlvdXMgIT09IGFjdGl2ZUN3ZCkge1xuICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgc2V0SGlzdG9yeShbXSlcbiAgICAgIHNldENvbW1lbnRzKFtdKVxuICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgICAgIHNldFJldmlldyhudWxsKVxuICAgICAgc2V0UHIobnVsbClcbiAgICB9XG4gICAgdm9pZCBsb2FkV29ya3NwYWNlKClcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFt0YWIsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gS2VlcCBzdGFnZWQvdW5zdGFnZWQvaGlzdG9yeSBmcmVzaCB3aGlsZSB0aGUgd29ya3NwYWNlIHRhYiBpcyBvcGVuLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8IHRhYiAhPT0gJ3dvcmtzcGFjZScgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB2b2lkIGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICB9LCAxNTAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbCh0aW1lcilcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW4sIHRhYiwgYWN0aXZlQ3dkXSlcblxuICAvLyBCcmFuY2ggc2NvcGU6IGRpZmYgdGhlIHdvcmt0cmVlIGFnYWluc3QgdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAvLyBEZWZhdWx0IHRoZSBiYXNlIHRvIHRoZSBmaXJzdCBicmFuY2ggdGhhdCBpc24ndCB0aGUgY3VycmVudCBvbmUuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlICE9PSAnYnJhbmNoJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBjb25zdCBjdXJyZW50ID0gc3RhdHVzPy5icmFuY2ggPz8gbnVsbFxuICAgIGlmIChiYXNlQnJhbmNoID09PSBudWxsICYmIGJyYW5jaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZhbGxiYWNrID0gYnJhbmNoZXMuZmluZCgoYikgPT4gYiAhPT0gY3VycmVudCkgPz8gYnJhbmNoZXNbMF1cbiAgICAgIHNldEJhc2VCcmFuY2goZmFsbGJhY2spXG4gICAgfVxuICB9LCBbc2NvcGUsIGFjdGl2ZUN3ZCwgYnJhbmNoZXMsIGJhc2VCcmFuY2gsIHN0YXR1cz8uYnJhbmNoXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzY29wZSAhPT0gJ2JyYW5jaCcgfHwgIWFjdGl2ZUN3ZCB8fCAhYmFzZUJyYW5jaCkge1xuICAgICAgc2V0QmFzZVN0YXR1cyhudWxsKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZVxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1NUQVRVU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChhY3RpdmVDd2QpfSZiYXNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGJhc2VCcmFuY2gpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCkpIGFzIFN0YXR1c1Jlc3BvbnNlIHwgbnVsbFxuICAgICAgaWYgKCFjYW5jZWxsZWQgJiYgZGF0YSkge1xuICAgICAgICBzZXRCYXNlU3RhdHVzKGRhdGEpXG4gICAgICAgIGlmIChkYXRhLmVycm9yICYmIGJhc2VTdGF0dXM/LmVycm9yICE9PSBkYXRhLmVycm9yKSBzZXRFcnJvcihkYXRhLmVycm9yKVxuICAgICAgfVxuICAgIH0pKClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2FuY2VsbGVkID0gdHJ1ZVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzY29wZSwgYWN0aXZlQ3dkLCBiYXNlQnJhbmNoXSlcblxuICAvLyBEZWZhdWx0IHNlbGVjdGlvbiBmb3IgdGhlIHNlc3Npb24gdGFiIGZvbGxvd3MgdGhlIGZpcnN0IHJvdW5kIHdpdGggY2hhbmdlcy5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRSb3VuZCA9PT0gbnVsbCAmJiByb3VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZHNbMF0ucm91bmQpXG4gICAgICBzZXRTZWxlY3RlZFBhdGgocm91bmRzWzBdLmNoYW5nZXNbMF0/LnBhdGggPz8gbnVsbClcbiAgICB9XG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmRdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4pIHJldHVyblxuICAgIGNvbnN0IG9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5KVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW5dKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFub3RpY2UpIHJldHVyblxuICAgIG5vdGljZVRpbWVyLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHNldE5vdGljZShudWxsKSwgMzAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KG5vdGljZVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtub3RpY2VdKVxuXG4gIGNvbnN0IGZpbGVzID0gc3RhdHVzPy5pc1JlcG8gPyBzdGF0dXMuZmlsZXMgOiBbXVxuICBjb25zdCBzdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiBmLnN0YWdlZCksIFtmaWxlc10pXG4gIGNvbnN0IHVuc3RhZ2VkRmlsZXMgPSB1c2VNZW1vKCgpID0+IGZpbGVzLmZpbHRlcigoZikgPT4gIWYuc3RhZ2VkKSwgW2ZpbGVzXSlcblxuICAvLyBcIkxhc3QgdHVyblwiIHNjb3BlOiBwYXRocyB0aGUgYWdlbnQgdG91Y2hlZCBpbiB0aGUgbW9zdCByZWNlbnQgcm91bmQuXG4gIGNvbnN0IGxhc3RSb3VuZFBhdGhzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxzdHJpbmc+KClcbiAgICBjb25zdCBsYXN0ID0gcm91bmRzW3JvdW5kcy5sZW5ndGggLSAxXVxuICAgIGlmICghbGFzdCB8fCAhY3dkKSByZXR1cm4gc2V0XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgbGFzdC5jaGFuZ2VzKSB7XG4gICAgICBzZXQuYWRkKGNoYW5nZS5wYXRoKVxuICAgICAgY29uc3QgcCA9IGNoYW5nZS5wYXRoXG4gICAgICBpZiAoaXNBYnNQYXRoKHApKSB7XG4gICAgICAgIGNvbnN0IHJlbCA9IHAuc3RhcnRzV2l0aChjd2QpID8gcC5zbGljZShjd2QubGVuZ3RoKS5yZXBsYWNlKC9eW1xcXFwvXSsvLCAnJykgOiBwXG4gICAgICAgIHNldC5hZGQocmVsKVxuICAgICAgICBzZXQuYWRkKGJhc2VOYW1lKHApKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0LmFkZChiYXNlTmFtZShwKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNldFxuICB9LCBbcm91bmRzLCBjd2RdKVxuXG4gIC8qKiBUaGUgZmlsZSBzbGljZSB0aGUgY3VycmVudCBzY29wZSBzaG93cy4gKi9cbiAgY29uc3Qgc2NvcGVGaWxlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgIGNhc2UgJ3Vuc3RhZ2VkJzpcbiAgICAgICAgcmV0dXJuIHVuc3RhZ2VkRmlsZXNcbiAgICAgIGNhc2UgJ3N0YWdlZCc6XG4gICAgICAgIHJldHVybiBzdGFnZWRGaWxlc1xuICAgICAgY2FzZSAnYnJhbmNoJzpcbiAgICAgICAgcmV0dXJuIGJhc2VTdGF0dXM/LmZpbGVzID8/IFtdXG4gICAgICBjYXNlICdsYXN0LXR1cm4nOlxuICAgICAgICByZXR1cm4gbGFzdFJvdW5kUGF0aHMuc2l6ZSA+IDAgPyBmaWxlcy5maWx0ZXIoKGYpID0+IGxhc3RSb3VuZFBhdGhzLmhhcyhmLnBhdGgpIHx8IGxhc3RSb3VuZFBhdGhzLmhhcyhiYXNlTmFtZShmLnBhdGgpKSkgOiBbXVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZpbGVzXG4gICAgfVxuICB9LCBbc2NvcGUsIHVuc3RhZ2VkRmlsZXMsIHN0YWdlZEZpbGVzLCBiYXNlU3RhdHVzLCBmaWxlcywgbGFzdFJvdW5kUGF0aHNdKVxuXG4gIC8qKiBTY29wZXMgd2hlcmUgZmlsZS9odW5rIGFjY2VwdFx1MDBCN3JldmVydFx1MDBCN3Vuc3RhZ2UgYW5kIGNvbW1pdC9wdXNoIG1ha2Ugc2Vuc2UuICovXG4gIGNvbnN0IGFsbG93QWN0aW9ucyA9IHNjb3BlICE9PSAnYnJhbmNoJyAmJiBzY29wZSAhPT0gJ2NvbW1pdCdcblxuICAvKiogRmlsZXMgdGhlIGN1cnJlbnQgc2NvcGUgY2FuIGhhbmQgdG8gdGhlIEFJIHJldmlldy4gKi9cbiAgY29uc3QgcmV2aWV3YWJsZUZpbGVzID0gc2NvcGUgPT09ICdicmFuY2gnID8gYmFzZVN0YXR1cz8uZmlsZXM/Lmxlbmd0aCA/PyAwIDogZmlsZXMubGVuZ3RoXG4gIGNvbnN0IHN0YWdlZENvdW50ID0gc3RhZ2VkRmlsZXMubGVuZ3RoXG4gIC8vIE5PVEU6IGhvb2tzIG11c3QgYWxsIHJ1biBiZWZvcmUgdGhlIGVhcmx5IHJldHVybiBiZWxvdyAoUmVhY3QgaG9vayBvcmRlcikuXG4gIGNvbnN0IHN0YWdlZFRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc3RhZ2VkRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbc3RhZ2VkRmlsZXNdKVxuICBjb25zdCB1bnN0YWdlZFRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUodW5zdGFnZWRGaWxlcywgKGYpID0+IGYucGF0aCksIFt1bnN0YWdlZEZpbGVzXSlcbiAgY29uc3Qgc2NvcGVUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHNjb3BlRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbc2NvcGVGaWxlc10pXG4gIGNvbnN0IGNvbW1pdEZpbGVzVHJlZSA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKGNvbW1pdERpZmY/Lm9rID8gYnVpbGRGaWxlVHJlZShjb21taXREaWZmLmZpbGVzLCAoZikgPT4gZi5wYXRoKSA6IFtdKSxcbiAgICBbY29tbWl0RGlmZl0sXG4gIClcblxuICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHNlbGVjdGVkRmlsZSA9IHNjb3BlRmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBzZWxlY3RlZCkgPz8gbnVsbFxuICBjb25zdCB0b3RhbEFkZGVkID0gZmlsZXMucmVkdWNlKChuLCBmKSA9PiBuICsgZi5hZGRlZCwgMClcbiAgY29uc3QgdG90YWxEZWxldGVkID0gZmlsZXMucmVkdWNlKChuLCBmKSA9PiBuICsgZi5kZWxldGVkLCAwKVxuXG4gIC8vIENvbW1pdC1kZXRhaWwgdmlldzogdGhlIHNlbGVjdGVkIGZpbGUgd2l0aGluIHRoZSBzZWxlY3RlZCBjb21taXQuXG4gIGNvbnN0IGNvbW1pdFNlZ21lbnRzID0gY29tbWl0RGlmZj8ub2sgPyBzcGxpdENvbW1pdERpZmYoY29tbWl0RGlmZi5kaWZmKSA6IFtdXG4gIGNvbnN0IGNvbW1pdEFjdGl2ZUZpbGUgPSBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayA/IGNvbW1pdERpZmYuZmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBzZWxlY3RlZENvbW1pdEZpbGUpID8/IG51bGwgOiBudWxsXG4gIGNvbnN0IGNvbW1pdEFjdGl2ZVRleHQgPSBjb21taXRBY3RpdmVGaWxlXG4gICAgPyBjb21taXRTZWdtZW50cy5maW5kKChzKSA9PiBzLnBhdGggPT09IGNvbW1pdEFjdGl2ZUZpbGUucGF0aCk/LnRleHQgPz8gY29tbWl0RGlmZj8uZGlmZiA/PyAnJ1xuICAgIDogY29tbWl0RGlmZj8uZGlmZiA/PyAnJ1xuXG4gIC8qKiBMZWFmIHJvdyBzaGFyZWQgYnkgdGhlIHN0YWdlZC91bnN0YWdlZCBmaWxlIHRyZWVzLiAqL1xuICBjb25zdCB3b3Jrc3BhY2VMZWFmID0gKHsgaXRlbTogZmlsZSwgbmFtZSB9OiB7IGl0ZW06IERpZmZGaWxlOyBuYW1lOiBzdHJpbmcgfSkgPT4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICBhcmlhLXNlbGVjdGVkPXtmaWxlLnBhdGggPT09IHNlbGVjdGVkfVxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtmaWxlLnBhdGggPT09IHNlbGVjdGVkID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWQoZmlsZS5wYXRoKVxuICAgICAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgICAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICAgICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hpcENsYXNzKGZpbGUuc3RhdHVzKX1gfT57ZmlsZS51bnRyYWNrZWQgPyAnPz8nIDogZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICB7ZmlsZS5iaW5hcnkgPyB0KCdyZXZpZXcuYmluYXJ5JykgOiB0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxuXG4gIGNvbnN0IHJ1bkFwcGx5ID0gYXN5bmMgKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZykgPT4ge1xuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcGx5Q2hhbmdlcyhhY3RpdmVDd2QgPz8gY3dkID8/ICcnLCBhY3Rpb24sIHBhdGgpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIGNvbnN0IHZlcmIgPSBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiBhY3Rpb24gPT09ICd1bnN0YWdlJyA/IHQoJ3Jldmlldy51bnN0YWdlZCcpIDogdCgncmV2aWV3LnJldmVydGVkJylcbiAgICAgICAgc2V0Tm90aWNlKHtcbiAgICAgICAgICBraW5kOiAnb2snLFxuICAgICAgICAgIHRleHQ6IHBhdGhcbiAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVPbmUnLCB7IGFjdGlvbjogdmVyYiwgcGF0aCB9KVxuICAgICAgICAgICAgOiByZXN1bHQuZGVsZXRlZCAmJiByZXN1bHQuZGVsZXRlZC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVEZWxldGVkJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGgsIGRlbGV0ZWQ6IHJlc3VsdC5kZWxldGVkLmxlbmd0aCB9KVxuICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5kb25lJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGggfSksXG4gICAgICAgIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBvbkZpbGVBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnZmlsZScpIHtcbiAgICAgIHNldENvbmZpcm0oJ2ZpbGUnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2ZpbGUnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbiwgcGF0aClcbiAgfVxuXG4gIGNvbnN0IG9uQWxsQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JykgPT4ge1xuICAgIGlmIChhY3Rpb24gPT09ICdyZXZlcnQnICYmIGNvbmZpcm0gIT09ICdhbGwnKSB7XG4gICAgICBzZXRDb25maXJtKCdhbGwnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2FsbCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uKVxuICB9XG5cbiAgLyoqIEFwcGx5IG9uZSBodW5rIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpIG9mIHRoZSBzZWxlY3RlZCBmaWxlLiAqL1xuICBjb25zdCBvbkh1bmtBY3Rpb24gPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBEaWZmSHVuaykgPT4ge1xuICAgIGlmICghc2VsZWN0ZWRGaWxlIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlIdW5rKGFjdGl2ZUN3ZCA/PyBjd2QgPz8gJycsIHNlbGVjdGVkRmlsZS5wYXRoLCBhY3Rpb24sIGh1bmsudGV4dClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgY29uc3QgdmVyYiA9IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IGFjdGlvbiA9PT0gJ3Vuc3RhZ2UnID8gdCgncmV2aWV3LnVuc3RhZ2VkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiB2ZXJiLCBwYXRoOiBzZWxlY3RlZEZpbGUucGF0aCB9KSB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBpbmxpbmUgY29tbWVudHMgLS0tLVxuICBjb25zdCBvcGVuQ29tbWVudCA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVyblxuICAgIHNldENvbW1lbnRFZGl0b3IoeyBvbGRMaW5lLCBuZXdMaW5lIH0pXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgc2V0Q29tbWVudFBvcG92ZXIobnVsbClcbiAgfVxuXG4gIGNvbnN0IHNhdmVDb21tZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghc2VsZWN0ZWRGaWxlIHx8ICFjb21tZW50RWRpdG9yIHx8IGJ1c3kpIHJldHVyblxuICAgIGNvbnN0IHRleHQgPSBjb21tZW50VGV4dC50cmltKClcbiAgICBpZiAoIXRleHQpIHJldHVyblxuICAgIGNvbnN0IGNvbW1lbnQ6IFJldmlld0NvbW1lbnQgPSB7XG4gICAgICBpZDogdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gLFxuICAgICAgcGF0aDogc2VsZWN0ZWRGaWxlLnBhdGgsXG4gICAgICBsaW5lTmV3OiBjb21tZW50RWRpdG9yLm5ld0xpbmUsXG4gICAgICBsaW5lT2xkOiBjb21tZW50RWRpdG9yLm9sZExpbmUsXG4gICAgICB0ZXh0LFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgfVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmV4dCA9IFsuLi5jb21tZW50cywgY29tbWVudF1cbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdjb21tZW50LnNhdmVkJykgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2FuY2VsQ29tbWVudCA9ICgpID0+IHtcbiAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gIH1cblxuICBjb25zdCBkZWxldGVDb21tZW50ID0gYXN5bmMgKGlkOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gYy5pZCAhPT0gaWQpXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBpZiAoYWN0aXZlQ3dkICYmIChhd2FpdCBzYXZlQ29tbWVudHMoYWN0aXZlQ3dkLCBuZXh0KSkpIHtcbiAgICAgICAgc2V0Q29tbWVudHMobmV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBBSSByZXZpZXcgKC9yZXZpZXcpOiBydW4sIHJlLXJ1biwgYW5kIGhhbmQgZmluZGluZ3MgdG8gdGhlIGFnZW50IC0tLS1cbiAgY29uc3Qgb25SZXZpZXcgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgcmV2aWV3aW5nIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldFJldmlld2luZyh0cnVlKVxuICAgIHNldFJldmlldyhudWxsKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXZpZXdTY29wZSA9IHNjb3BlID09PSAnYnJhbmNoJyA/ICdicmFuY2gnIDogc2NvcGUgPT09ICdjb21taXQnICYmIHNlbGVjdGVkQ29tbWl0ID8gJ2NvbW1pdCcgOiAndW5jb21taXR0ZWQnXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5SZXZpZXcoYWN0aXZlQ3dkLCBjdXJyZW50SWQgPz8gbnVsbCwgcmV2aWV3U2NvcGUsIGJhc2VCcmFuY2ggPz8gdW5kZWZpbmVkLCBzZWxlY3RlZENvbW1pdD8uaGFzaCA/PyB1bmRlZmluZWQpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIHNldFJldmlldyhyZXN1bHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LnJldmlld0ZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LnJldmlld0ZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFJldmlld2luZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogQ29tcG9zZSBhIFwic2VuZCB0byBhZ2VudFwiIG1lc3NhZ2UgZnJvbSBmaW5kaW5ncyBvciBQUiBjb21tZW50cy4gKi9cbiAgY29uc3QgY29tcG9zZUZpbmRpbmdzTWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdGaW5kaW5nW10+KClcbiAgICBmb3IgKGNvbnN0IGYgb2YgcmV2aWV3Py5maW5kaW5ncyA/PyBbXSkge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoZi5maWxlKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChmKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGYuZmlsZSwgW2ZdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQiBBSSBcdThCQzRcdTVCQTFcdTUzRDFcdTczQjBcdUZGMDhBZGRyZXNzIHRoZSByZXZpZXcgZmluZGluZ3NcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLCAnJ11cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBmIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBmLmxpbmVTdGFydCA9PT0gZi5saW5lRW5kID8gYDoke2YubGluZVN0YXJ0fWAgOiBgOiR7Zi5saW5lU3RhcnR9LSR7Zi5saW5lRW5kfWBcbiAgICAgICAgbGluZXMucHVzaChgLSBbJHtmLnByaW9yaXR5fV0gJHtwYXRofSR7cmFuZ2V9OiAke2YudGl0bGV9IFx1MjAxNCAke2YuZGV0YWlsfWApXG4gICAgICAgIGlmIChmLnN1Z2dlc3Rpb24pIGxpbmVzLnB1c2goYCAgXFxgXFxgXFxgXFxuJHtmLnN1Z2dlc3Rpb259XFxuICBcXGBcXGBcXGBgKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBjb21wb3NlUHJNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKCFwcj8ucHIgfHwgcHIuY29tbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbYFx1OEJGN1x1NTkwNFx1NzQwNiBQUiAjJHtwci5wci5udW1iZXJ9XHVGRjA4JHtwci5wci50aXRsZX1cdUZGMDlcdTc2ODRcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBQUiBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQWAsICcnXVxuICAgIGZvciAoY29uc3QgYyBvZiBwci5jb21tZW50cykge1xuICAgICAgY29uc3QgYW5jaG9yID0gYy5wYXRoID8gYCR7Yy5wYXRofSR7Yy5saW5lID8gYDoke2MubGluZX1gIDogJyd9YCA6ICdnZW5lcmFsJ1xuICAgICAgbGluZXMucHVzaChgLSAke2FuY2hvcn0gKCR7Yy5hdXRob3J9KTogJHtjLmJvZHl9YClcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBvcGVuU2VuZFBhbmVsV2l0aCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgICBzZXRTZW5kVGV4dCh0ZXh0KVxuICAgIHNldFNlbmRPcGVuKHRydWUpXG4gIH1cblxuICAvLyAtLS0tIGVkaXRvciBpbnRlZ3JhdGlvbiAodmlhIGRzaC1wbHVnaW4tb3Blbi1lZGl0b3IpIC0tLS1cbiAgY29uc3Qgb3BlbkZpbGUgPSBhc3luYyAocGF0aDogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3BlbkluRWRpdG9yKGFjdGl2ZUN3ZCwgcGF0aCwgbGluZSlcbiAgICBpZiAoIXJlc3VsdC5vaykgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogYCR7dCgnZWRpdG9yLmZhaWxlZCcpfTogJHtyZXN1bHQuZXJyb3IgPz8gJyd9YCB9KVxuICB9XG5cbiAgLyoqIEp1bXAgZnJvbSBhIFBSIGNvbW1lbnQgdG8gdGhlIGZpbGUgKGFuZCBoaWdobGlnaHQgdGhlIGxpbmUpLiAqL1xuICBjb25zdCBvblByQ29tbWVudENsaWNrID0gKHBhdGg6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsIGxpbmU6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpID0+IHtcbiAgICBpZiAocGF0aCkganVtcFRvKHBhdGgsIGxpbmUgPz8gdW5kZWZpbmVkKVxuICAgIGVsc2Ugc2V0SnVtcExpbmUobnVsbClcbiAgfVxuXG4gIC8vIC0tLS0gZmVlZGJhY2sgbG9vcDogY29tbWVudHMgXHUyMTkyIGFnZW50IChwcm9tcHQgaW5qZWN0aW9uLCBjb3B5IGZhbGxiYWNrKSAtLS0tXG4gIGNvbnN0IGNvbXBvc2VSZXZpZXdNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKGNvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0NvbW1lbnRbXT4oKVxuICAgIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoYy5wYXRoKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChjKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGMucGF0aCwgW2NdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXG4gICAgICAnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJyxcbiAgICAgICcnLFxuICAgIF1cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBjIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhdGh9JHthbmNob3J9OiAke2MudGV4dH1gKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBvcGVuU2VuZFBhbmVsID0gKCkgPT4ge1xuICAgIHNldFNlbmRUZXh0KGNvbXBvc2VSZXZpZXdNZXNzYWdlKCkpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIGNvbnN0IHNlbmRUb0FnZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRleHQgPSBzZW5kVGV4dC50cmltKClcbiAgICBpZiAoIXRleHQgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICBjb25zdCBzZXNzaW9uID0gYmluZGluZz8uc2Vzc2lvblxuICAgICAgaWYgKHNlc3Npb24pIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2Vzc2lvbi5wcm9tcHQoW3sgdHlwZTogJ3RleHQnLCB0ZXh0IH1dLCAncXVldWUnKVxuICAgICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgICAgc2V0U2VuZE9wZW4oZmFsc2UpXG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LnNlbnRUb0FnZW50JykgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBjb3B5IGZhbGxiYWNrXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICAgIC8vIEZhbGxiYWNrOiBjb3B5IHRoZSBjb21wb3NlZCByZXZpZXcgdGV4dC5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgICAgIHNldFNlbmRPcGVuKGZhbHNlKVxuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmNvcGllZCcpIH0pXG4gICAgfSBjYXRjaCB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdyZXZpZXcuY29weUZhaWxlZCcpIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqIENvbW1pdCB0aGUgc3RhZ2VkIGNoYW5nZXMgd2l0aCB0aGUgZW50ZXJlZCBtZXNzYWdlLiAqL1xuICBjb25zdCBvbkNvbW1pdCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0gY29tbWl0TWVzc2FnZS50cmltKClcbiAgICBpZiAoIW1lc3NhZ2UgfHwgYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAnY29tbWl0JywgbWVzc2FnZSlcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0Q29tbWl0TWVzc2FnZSgnJylcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHJlc3VsdC5oYXNoID8gYCR7cmVzdWx0Lmhhc2h9ICR7cmVzdWx0LnN1YmplY3QgPz8gJyd9YC50cmltKCkgOiAocmVzdWx0LnN1YmplY3QgPz8gJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb21taXR0ZWQnLCB7IHN1bW1hcnkgfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBQdXNoIHRoZSBjdXJyZW50IGJyYW5jaCAoZG91YmxlLWNsaWNrIHRvIGNvbmZpcm0pLiAqL1xuICBjb25zdCBvblB1c2ggPSAoKSA9PiB7XG4gICAgaWYgKGJ1c3kgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKGNvbmZpcm0gIT09ICdwdXNoJykge1xuICAgICAgc2V0Q29uZmlybSgncHVzaCcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAncHVzaCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgIHNldEJ1c3kodHJ1ZSlcbiAgICAgIHNldE5vdGljZShudWxsKVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuR2l0QWN0aW9uKGFjdGl2ZUN3ZCwgJ3B1c2gnKVxuICAgICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LnB1c2hlZCcpIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5wdXNoRmFpbGVkJykgfSlcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5wdXNoRmFpbGVkJykgfSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgICB9XG4gICAgfSkoKVxuICB9XG5cbiAgLyoqIFNlbGVjdCBhIGxvY2FsIGNvbW1pdCBhbmQgbG9hZCBpdHMgZGlmZiBpbnRvIHRoZSByaWdodCBwYW5lLiAqL1xuICBjb25zdCBzZWxlY3RDb21taXQgPSAoY29tbWl0OiBDb21taXRJbmZvKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QpIHJldHVyblxuICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgc2V0U2VsZWN0ZWRDb21taXQoY29tbWl0KVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZkxvYWRpbmcodHJ1ZSlcbiAgICB2b2lkIGxvYWRDb21taXREaWZmKGFjdGl2ZUN3ZCwgY29tbWl0Lmhhc2gpXG4gICAgICAudGhlbigoZCkgPT4ge1xuICAgICAgICBzZXRDb21taXREaWZmKGQpXG4gICAgICAgIHNldENvbW1pdERpZmZMb2FkaW5nKGZhbHNlKVxuICAgICAgICAvLyBEZWZhdWx0IHRoZSBmaWxlIHRyZWUgdG8gdGhlIGZpcnN0IGNoYW5nZWQgZmlsZS5cbiAgICAgICAgaWYgKGQub2sgJiYgZC5maWxlcy5sZW5ndGggPiAwKSBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZC5maWxlc1swXS5wYXRoKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSkpXG4gIH1cblxuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cImRzZHItb3ZlcmxheVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3VycmVudFRhcmdldCkgY2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItcGFuZWxcIlxuICAgICAgICByb2xlPVwiZGlhbG9nXCJcbiAgICAgICAgYXJpYS1tb2RhbD1cInRydWVcIlxuICAgICAgICBhcmlhLWxhYmVsPXt0KCdyZXZpZXcudGl0bGUnKX1cbiAgICAgICAgc3R5bGU9e3sgd2lkdGg6IGAke3ByZWZzLndpZHRofXB4YCwgaGVpZ2h0OiBgJHtwcmVmcy5oZWlnaHR9cHhgLCAuLi5kaWZmU3R5bGVWYXJzKHByZWZzKSB9IGFzIENTU1Byb3BlcnRpZXN9XG4gICAgICA+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwiZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNcIlxuICAgICAgICAgIG9uUmVzaXplPXsoX2R4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNlXCJcbiAgICAgICAgICBvblJlc2l6ZT17KGR4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgICAgZC5oZWlnaHQgPSBNYXRoLm1heChNSU5fUEFORUxfSCwgTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gNjQsIGQuaGVpZ2h0ICsgZHkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1oZWFkZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRpdGxlXCI+e3QoJ3Jldmlldy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRhYnNcIiByb2xlPVwidGFibGlzdFwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfT5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0YWIgPT09ICdzZXNzaW9uJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3Nlc3Npb24nID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VGFiKCdzZXNzaW9uJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0KCd0YWIuc2Vzc2lvbicpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGFiID09PSAnd29ya3NwYWNlJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3dvcmtzcGFjZScgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3dvcmtzcGFjZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dCgndGFiLndvcmtzcGFjZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnICYmIHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zY29wZVwiPlxuICAgICAgICAgICAgICB7cmVwb3MubGVuZ3RoID4gMSA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgncmVwby5sYWJlbCcpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlcG9QYXRoID8/IGFjdGl2ZUN3ZCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e3JlcG9zLm1hcCgocikgPT4gKHsgdmFsdWU6IHIucGF0aCwgbGFiZWw6IGAke2Jhc2VOYW1lKHIucGF0aCl9JHtyLmJyYW5jaCA/IGAgKCR7ci5icmFuY2h9KWAgOiAnJ31gIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRSZXBvUGF0aCh2KVxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgICAgICAgICAgICAgICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUubGFiZWwnKX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2NvcGV9XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17U0NPUEVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBzLmlkLCBsYWJlbDogdChzLmxhYmVsKSB9KSl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRTY29wZSh2IGFzIFdvcmtzcGFjZVNjb3BlKVxuICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdzY29wZS5iYXNlJyl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YmFzZUJyYW5jaCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2JyYW5jaGVzLm1hcCgoYikgPT4gKHsgdmFsdWU6IGIsIGxhYmVsOiBiIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRCYXNlQnJhbmNofVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3VidGl0bGVcIj5cbiAgICAgICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJ1xuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5zZXNzaW9uU3RhdHMnLCB7IHJvdW5kczogcm91bmRzLmxlbmd0aCwgZmlsZXM6IHRvdGFsU2Vzc2lvbkZpbGVzIH0pXG4gICAgICAgICAgICAgIDogc3RhdHVzPy5pc1JlcG9cbiAgICAgICAgICAgICAgICA/IGAke3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9IFx1MDBCNyAke3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogdG90YWxBZGRlZCwgZGVsZXRlZDogdG90YWxEZWxldGVkIH0pfSR7c3RhdHVzLmFoZWFkID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmFoZWFkJywgeyBuOiBzdGF0dXMuYWhlYWQgfSl9YCA6ICcnfSR7c3RhdHVzLmJlaGluZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9YCA6ICcnfWBcbiAgICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5ub3RSZXBvJyl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBhbGxvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfSBvbkNsaWNrPXsoKSA9PiBvbkFsbEFjdGlvbignYWNjZXB0Jyl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c3RhZ2VkQ291bnQgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgcnVuQXBwbHkoJ3Vuc3RhZ2UnKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnVuc3RhZ2VBbGwnKX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXIke2NvbmZpcm0gPT09ICdhbGwnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQWxsQWN0aW9uKCdyZXZlcnQnKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnYWxsJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJykgOiB0KCdyZXZpZXcucmV2ZXJ0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtjb21taXRNZXNzYWdlfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0KCdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRDb21taXRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHZvaWQgb25Db21taXQoKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3kgfHwgIWNvbW1pdE1lc3NhZ2UudHJpbSgpIHx8IHN0YWdlZENvdW50ID09PSAwfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9uQ29tbWl0KCl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29tbWl0Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3RhYiA9PT0gJ3dvcmtzcGFjZScgJiYgc3RhdHVzPy5pc1JlcG8gJiYgcmV2aWV3YWJsZUZpbGVzID4gMCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCByZXZpZXdpbmd9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHZvaWQgb25SZXZpZXcoKX1cbiAgICAgICAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5yZXZpZXdTY29wZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7cmV2aWV3aW5nID8gdCgncmV2aWV3LnJldmlld2luZycpIDogdCgncmV2aWV3LnJldmlldycpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3RhYiA9PT0gJ3dvcmtzcGFjZScgJiYgc3RhdHVzPy5pc1JlcG8gJiYgY29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9e29wZW5TZW5kUGFuZWx9PlxuICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRUb0FnZW50Jyl9ICh7Y29tbWVudHMubGVuZ3RofSlcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgYXJpYS1sYWJlbD17dCgncmV2aWV3LmNsb3NlJyl9IG9uQ2xpY2s9e2Nsb3NlfT5cbiAgICAgICAgICAgIDxJY29uWCAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7c2VuZE9wZW4gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbmRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VuZC10aXRsZVwiPnt0KCdyZXZpZXcuc2VuZFRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLWhpbnRcIj57dCgncmV2aWV3LnNlbmRIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzTmFtZT1cImRzZHItc2VuZC1pbnB1dFwiIHJlYWRPbmx5IHZhbHVlPXtzZW5kVGV4dH0gc3BlbGxDaGVjaz17ZmFsc2V9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHNldFNlbmRPcGVuKGZhbHNlKX0+XG4gICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG5cIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHZvaWQgbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KHNlbmRUZXh0KS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSksXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ3Jldmlldy5jb3B5RmFpbGVkJykgfSksXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29weScpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8ICFzZW5kVGV4dC50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc2VuZFRvQWdlbnQoKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5zZW5kVG9BZ2VudCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiByZXZpZXc/Lm9rICYmIHJldmlld2FibGVGaWxlcyA+IDAgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctc3RyaXBcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnZHNkci1yZXZpZXctYmFkJyA6ICdkc2RyLXJldmlldy1vayd9PlxuICAgICAgICAgICAgICAgIHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyB0KCdyZXZpZXcudmVyZGljdEluY29ycmVjdCcpIDogdCgncmV2aWV3LnZlcmRpY3RDb3JyZWN0Jyl9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1yZXZpZXctdG9nZ2xlJHtmaW5kaW5nc09wZW4gPyAnIGRzZHItcmV2aWV3LXRvZ2dsZS1vbicgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0RmluZGluZ3NPcGVuKCh2KSA9PiAhdil9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5maW5kaW5ncycsIHsgbjogcmV2aWV3LmZpbmRpbmdzLmxlbmd0aCB9KX1cbiAgICAgICAgICAgICAgICAgIHtyZXZpZXcudHJ1bmNhdGVkID8gJyAodHJ1bmNhdGVkKScgOiAnJ31cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcubm9GaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAge3Jldmlldy5tb2RlbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LW1vZGVsXCI+e3Jldmlldy5tb2RlbC5wcm92aWRlcn0ve3Jldmlldy5tb2RlbC5tb2RlbH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb3BlblNlbmRQYW5lbFdpdGgoY29tcG9zZUZpbmRpbmdzTWVzc2FnZSgpKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRGaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2ZpbmRpbmdzT3BlbiAmJiByZXZpZXcuZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmdzXCI+XG4gICAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5tYXAoKGZpbmRpbmcsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAga2V5PXtgJHtmaW5kaW5nLmZpbGV9OiR7ZmluZGluZy5saW5lU3RhcnR9LSR7ZmluZGluZy5saW5lRW5kfToke2l9YH1cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1pdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ganVtcFRvKGZpbmRpbmcuZmlsZSwgZmluZGluZy5saW5lU3RhcnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmcucHJpb3JpdHl9YH0+e2ZpbmRpbmcucHJpb3JpdHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctYm9keVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy10aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcudGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctbG9jXCI+e2ZpbmRpbmcuZmlsZX06e2ZpbmRpbmcubGluZVN0YXJ0fXtmaW5kaW5nLmxpbmVFbmQgIT09IGZpbmRpbmcubGluZVN0YXJ0ID8gYC0ke2ZpbmRpbmcubGluZUVuZH1gIDogJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZy5kZXRhaWwgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctZGV0YWlsXCI+e2ZpbmRpbmcuZGV0YWlsfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNvbmZpZGVuY2UnLCB7IGNvbmZpZGVuY2U6IGZpbmRpbmcuY29uZmlkZW5jZS50b0ZpeGVkKDIpIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmcuc3VnZ2VzdGlvbiA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LnN1Z2dlc3Rpb24nKX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nLnN1Z2dlc3Rpb24gPyA8Y29kZSBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctc3VnZ2VzdGlvblwiPntmaW5kaW5nLnN1Z2dlc3Rpb259PC9jb2RlPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnc2Vzc2lvbicgPyAoXG4gICAgICAgICAgcm91bmRzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfTwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYm9keVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi5zZXNzaW9uJyl9PlxuICAgICAgICAgICAgICAgIHtyb3VuZHMubWFwKChyb3VuZCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JvdW5kLnJvdW5kfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5yb3VuZCcsIHsgcm91bmQ6IHJvdW5kLnJvdW5kIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIHtyb3VuZC5sYWJlbCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yb3VuZC1sYWJlbFwiIHRpdGxlPXtyb3VuZC5sYWJlbH0+e3JvdW5kLmxhYmVsfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Nlc3Npb25UcmVlcy5nZXQocm91bmQucm91bmQpID8/IFtdfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9eyh7IGl0ZW06IGNoYW5nZSwgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtyb3VuZC5yb3VuZH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZEtleSA9IHNlbGVjdGVkQ2hhbmdlID8gYCR7c2VsZWN0ZWRSb3VuZH06JHtzZWxlY3RlZENoYW5nZS5wYXRofWAgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17a2V5ID09PSBzZWxlY3RlZEtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2tleSA9PT0gc2VsZWN0ZWRLZXkgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmQucm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZFBhdGgoY2hhbmdlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoYW5nZS5oYXNEaWZmID8gJ2RzZHItY2hpcC1tJyA6ICdkc2RyLWNoaXAtdSd9YH0+e2NoYW5nZS5oYXNEaWZmID8gJ00nIDogJ1x1MDBCNyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2NoYW5nZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCIgdGl0bGU9e2NoYW5nZS50b29sfT57Y2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZlwiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZSA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENoYW5nZS5wYXRofT57c2VsZWN0ZWRDaGFuZ2UucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCI+e3NlbGVjdGVkQ2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UuaGFzRGlmZiA/IChcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID09PSAnc3BsaXQnICYmIGNoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2NoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKX0gYmVmb3JlTGFiZWw9e3QoJ3ZpZXcuYmVmb3JlJyl9IGFmdGVyTGFiZWw9e3QoJ3ZpZXcuYWZ0ZXInKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hhbmdlUm93cyhzZWxlY3RlZENoYW5nZSkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdyZXZpZXcubm9EaWZmRGF0YScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgICkgOiBlcnJvciAmJiAhc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgICA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi53b3Jrc3BhY2UnKX0+XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2FsbCcgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIHtzdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIHt1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXt1bnN0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICd1bnN0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgdW5zdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdzdGFnZWQnID8gKFxuICAgICAgICAgICAgICAgIHN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvblN0YWdlZCcpfSAoe3N0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIHNjb3BlRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Njb3BlLmJyYW5jaCcpfSB7YmFzZUJyYW5jaCA/IGBcdTIxOTQgJHtiYXNlQnJhbmNofWAgOiAnJ30gKHtzY29wZUZpbGVzLmxlbmd0aH0pXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Njb3BlLmJyYW5jaFJlYWRvbmx5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2xhc3QtdHVybicgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgnc2NvcGUubGFzdC10dXJuJyl9ICh7c2NvcGVGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Njb3BlVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHsoc2NvcGUgPT09ICdhbGwnIHx8IHNjb3BlID09PSAnY29tbWl0JykgJiYgaGlzdG9yeS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuaGlzdG9yeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRpbWVsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIHtoaXN0b3J5Lm1hcCgoY29tbWl0KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGwtaXRlbSR7c2VsZWN0ZWRDb21taXQ/Lmhhc2ggPT09IGNvbW1pdC5oYXNoID8gJyBkc2RyLXRsLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRsLXJhaWxcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci10bC1kb3Qke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1kb3QtbG9jYWwnIDogJyBkc2RyLXRsLWRvdC1yZW1vdGUnfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2h9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0Q29tbWl0KGNvbW1pdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWJhZGdlJHtjb21taXQuYWhlYWQgPyAnIGRzZHItdGwtYmFkZ2UtbG9jYWwnIDogJyBkc2RyLXRsLWJhZGdlLXJlbW90ZSd9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWl0LmFoZWFkID8gdCgnaGlzdG9yeS5sb2NhbCcpIDogdCgnaGlzdG9yeS5yZW1vdGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtc2hvcnRcIj57Y29tbWl0LnNob3J0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zdWJqZWN0XCIgdGl0bGU9e2NvbW1pdC5zdWJqZWN0fT57Y29tbWl0LnN1YmplY3R9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LW1ldGFcIj57Y29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoY29tbWl0LmRhdGUsIHQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayAmJiBjb21taXREaWZmLmZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5jb21taXRGaWxlcycpfSAoe2NvbW1pdERpZmYuZmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgbm9kZXM9e2NvbW1pdEZpbGVzVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogZmlsZSwgbmFtZSB9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtzZWxlY3RlZENvbW1pdEZpbGUgPT09IGZpbGUucGF0aCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNoaXAgZHNkci1jaGlwLW1cIj57ZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25CcmFuY2gnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1icmFuY2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtcmVmXCIgdGl0bGU9e3N0YXR1cy51cHN0cmVhbSA/PyB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFycm93XCI+XHUyMTkyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMudXBzdHJlYW0gPz8gdCgncmV2aWV3Lm5vVXBzdHJlYW0nKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5haGVhZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1haGVhZFwiPnt0KCdyZXZpZXcuYWhlYWQnLCB7IG46IHN0YXR1cy5haGVhZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmJlaGluZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1iZWhpbmRcIj57dCgncmV2aWV3LmJlaGluZCcsIHsgbjogc3RhdHVzLmJlaGluZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID09PSAwICYmIHN0YXR1cy5iZWhpbmQgPT09IDAgJiYgc3RhdHVzLnVwc3RyZWFtID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtc3luY1wiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biR7Y29uZmlybSA9PT0gJ3B1c2gnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgKHN0YXR1cz8uYWhlYWQgPz8gMCkgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25QdXNofVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdwdXNoJyA/IHQoJ3Jldmlldy5jb25maXJtUHVzaCcpIDogYCR7dCgncmV2aWV3LnB1c2gnKX0keyhzdGF0dXM/LmFoZWFkID8/IDApID4gMCA/IGAgKCR7c3RhdHVzPy5haGVhZCA/PyAwfSlgIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtwcj8ucHIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci50aXRsZScsIHsgbnVtYmVyOiBwci5wci5udW1iZXIgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IGAgXHUwMEI3ICR7dCgncHIuY29tbWVudHMnLCB7IG46IHByLmNvbW1lbnRzLmxlbmd0aCB9KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXByXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdwci5ub1ByJyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXByLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUHJDb21tZW50Q2xpY2soY29tbWVudC5wYXRoLCBjb21tZW50LmxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudC5wYXRoID8gYCR7YmFzZU5hbWUoY29tbWVudC5wYXRoKX0ke2NvbW1lbnQubGluZSA/IGA6JHtjb21tZW50LmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCd9IFx1MDBCNyB7Y29tbWVudC5hdXRob3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcHItdGV4dFwiPntjb21tZW50LmJvZHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VQck1lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci5zZW5kQ29tbWVudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdCA/IChcbiAgICAgICAgICAgICAgICBjb21taXREaWZmTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKSA6IGNvbW1pdERpZmY/Lm9rID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGFzaFwiPntzZWxlY3RlZENvbW1pdC5zaG9ydH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdG9vbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoc2VsZWN0ZWRDb21taXQuZGF0ZSwgdCl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogY29tbWl0RGlmZi5hZGRlZCwgZGVsZXRlZDogY29tbWl0RGlmZi5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7Y29tbWl0QWN0aXZlRmlsZSA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17Y29tbWl0QWN0aXZlRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jaGlwIGRzZHItY2hpcC1tXCI+e2NvbW1pdEZpbGVTdGF0dXMoY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/ICcnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtcGF0aFwiPntjb21taXRBY3RpdmVGaWxlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmIGdpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2dpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Z2l0RGlmZlJvd3MoY29tbWl0QWN0aXZlVGV4dCkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57Y29tbWl0RGlmZj8uZXJyb3IgPz8gdCgncmV2aWV3Lm5vRGlmZkRhdGEnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBzZWxlY3RlZEZpbGUgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRGaWxlLnBhdGh9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLm9yaWdQYXRoID8gYCBcdTIxOTAgJHtzZWxlY3RlZEZpbGUub3JpZ1BhdGh9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBzZWxlY3RlZEZpbGUuYWRkZWQsIGRlbGV0ZWQ6IHNlbGVjdGVkRmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCl9IHRpdGxlPXt0KCdlZGl0b3Iub3BlbkZpbGUnKX0+XG4gICAgICAgICAgICAgICAgICAgICAgXHUyMTk3IHt0KCdlZGl0b3Iub3BlbkZpbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnVuc3RhZ2VkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdhY2NlcHQnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5hY2NlcHQnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3Vuc3RhZ2UnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy51bnN0YWdlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1idG4tZGFuZ2VyJHtjb25maXJtID09PSAnZmlsZScgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdyZXZlcnQnLCBzZWxlY3RlZEZpbGUucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdmaWxlJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0JykgOiB0KCdyZXZpZXcucmV2ZXJ0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7dmlldyA9PT0gJ3NwbGl0JyAmJiAhc2VsZWN0ZWRGaWxlLmJpbmFyeSAmJiBnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZikubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5iZWZvcmUnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5hZnRlcicpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZikubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgPyA8SHVua1Rvb2xiYXIgaHVuaz17c2VsZWN0ZWRGaWxlLmh1bmtzW2JpXX0gYnVzeT17YnVzeX0gb25BY3Rpb249e29uSHVua0FjdGlvbn0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93RmluZGluZ3MgPSAocmV2aWV3Py5maW5kaW5ncyA/PyBbXSkuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmLmZpbGUgPT09IHNlbGVjdGVkRmlsZS5wYXRoICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA+PSBmLmxpbmVTdGFydCAmJiByb3cucmlnaHROdW0gPD0gZi5saW5lRW5kIDogcm93LmxlZnROdW0gIT09IG51bGwgJiYgcm93LmxlZnROdW0gPj0gZi5saW5lU3RhcnQgJiYgcm93LmxlZnROdW0gPD0gZi5saW5lRW5kKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdDbHMgPSByb3dGaW5kaW5ncy5sZW5ndGggPiAwID8gYCBkc2RyLWNlbGwtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGp1bXBlZCA9IGp1bXBMaW5lICE9IG51bGwgJiYgKHJvdy5yaWdodE51bSA9PT0ganVtcExpbmUgfHwgKHJvdy5yaWdodE51bSA9PT0gbnVsbCAmJiByb3cubGVmdE51bSA9PT0ganVtcExpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlbkJ0biA9IChsaW5lOiBudW1iZXIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRmlsZS5wYXRoID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtb3BlbmxpbmVcIiB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkRmlsZS5wYXRoLCBsaW5lKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyaX0gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5sZWZ0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1kZWwnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWNlbGwtanVtcCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5sZWZ0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5sZWZ0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93RmluZGluZ3MubGVuZ3RoID4gMCAmJiByb3cucmlnaHROdW0gPT09IG51bGwgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YH0+e3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LnJpZ2h0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1hZGQnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWNlbGwtanVtcCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5yaWdodE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9Pntyb3dGaW5kaW5nc1swXS5wcmlvcml0eX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8VW5pZmllZERpZmZcbiAgICAgICAgICAgICAgICAgICAgICBkaWZmPXtzZWxlY3RlZEZpbGUuZGlmZn1cbiAgICAgICAgICAgICAgICAgICAgICBodW5rcz17c2VsZWN0ZWRGaWxlLmh1bmtzfVxuICAgICAgICAgICAgICAgICAgICAgIGJ1c3k9e2J1c3l9XG4gICAgICAgICAgICAgICAgICAgICAgb25IdW5rQWN0aW9uPXtvbkh1bmtBY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50cz17Y29tbWVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudEVkaXRvcj17Y29tbWVudEVkaXRvcn1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50VGV4dD17Y29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25Db21tZW50VGV4dD17c2V0Q29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuQ29tbWVudD17b3BlbkNvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgb25TYXZlQ29tbWVudD17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsQ29tbWVudD17Y2FuY2VsQ29tbWVudH1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50UG9wb3Zlcj17Y29tbWVudFBvcG92ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVQb3BvdmVyPXsoa2V5KSA9PiBzZXRDb21tZW50UG9wb3ZlcigocHJldikgPT4gKHByZXYgPT09IGtleSA/IG51bGwgOiBrZXkpKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUNvbW1lbnQ9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX1cbiAgICAgICAgICAgICAgICAgICAgICByZWFkT25seT17IWFsbG93QWN0aW9uc31cbiAgICAgICAgICAgICAgICAgICAgICBwYXRoPXtzZWxlY3RlZEZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICByZXZpZXdGaW5kaW5ncz17cmV2aWV3Py5maW5kaW5nc31cbiAgICAgICAgICAgICAgICAgICAgICBvbk9wZW5MaW5lPXsocCwgbGluZSkgPT4gdm9pZCBvcGVuRmlsZShwLCBsaW5lKX1cbiAgICAgICAgICAgICAgICAgICAgICBqdW1wTGluZT17anVtcExpbmV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3Njb3BlID09PSAnY29tbWl0JyA/IHQoJ3Jldmlldy5zZWxlY3RDb21taXQnKSA6IHQoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICB7ZXJyb3IgPz8gdCgncmV2aWV3LmxvYWRFcnJvcicpfVxuICAgICAgICAgICAgeyFzdGF0dXM/LmlzUmVwbyA/IDxkaXY+e3QoJ3Jldmlldy5ub3RSZXBvSGludCcpfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZvb3RcIj5cbiAgICAgICAgICB7KGxvYWRpbmcgfHwgYnVzeSkgJiYgdGFiID09PSAnd29ya3NwYWNlJyA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3Bpbm5lclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7YnVzeSA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbm90aWNlXCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAge25vdGljZSA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItbm90aWNlIGRzZHItbm90aWNlLSR7bm90aWNlLmtpbmR9YH0+e25vdGljZS50ZXh0fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBDb25maWcgY2FyZCBmb3IgdGhlIFBsdWdpbnMgY29uZmlndXJhdGlvbiB0YWIgKFNldHRpbmdzIFx1MjE5MiBQbHVnaW5zIFx1MjE5MiBcdTUzRUZcdTkxNERcdTdGNkUpLiAqL1xuZnVuY3Rpb24gRGlmZlJldmlld0NvbmZpZ0NhcmQoeyB0IH06IHsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgcmV0dXJuIChcbiAgICA8bGkgY2xhc3NOYW1lPXtvcGVuID8gJ2RzZHItY2ZnLWNhcmQgZHNkci1jZmctY2FyZC1vcGVuJyA6ICdkc2RyLWNmZy1jYXJkJ30+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWNmZy1oZWFkXCIgYXJpYS1leHBhbmRlZD17b3Blbn0gb25DbGljaz17KCkgPT4gc2V0T3BlbigodikgPT4gIXYpfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZC10ZXh0XCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbmFtZVwiPnt0KCdzZXR0aW5ncy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1kZXNjXCI+e3QoJ2NvbmZpZy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8SWNvbkNoZXZyb25Eb3duT3V0bGluZTE0IGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJldCBkc2RyLWNmZy1jYXJldC1vcGVuJyA6ICdkc2RyLWNmZy1jYXJldCd9IC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWJvZHlcIj5cbiAgICAgICAgICA8RGlmZlJldmlld1ByZWZzIHQ9e3R9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9saT5cbiAgKVxufVxuXG4vKiogQ2xpZW50IHBsdWdpbiBib2R5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5KGN0eDogQ2xpZW50Q29udGV4dCk6IHZvaWQge1xuICBjdHguZWZmZWN0KCgpID0+IGN0eC5sb2NhbGUucmVnaXN0ZXIoTE9DQUxFX05TLCB7IHpoLCBlbiB9KSwgJ2RpZmYtcmV2aWV3OiBsb2NhbGUgZGljdGlvbmFyeScpXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5zZXNzaW9uLmhlYWRlci5hY3Rpb25zJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXcnLFxuICAgICAgICBvcmRlcjogNzAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdBY3Rpb24sXG4gICAgKSxcbiAgKVxuICBjdHguc2xvdHMuaW5qZWN0KCdzaGVsbC5vdmVybGF5JywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzaGVsbC5vdmVybGF5JyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1vdmVybGF5JyxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgICAgaW5qZWN0OiAoKSA9PiAoeyBzZXNzaW9uczogY3R4LnNlc3Npb25zIH0pLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdPdmVybGF5LFxuICAgICksXG4gIClcbiAgLy8gVGhlIHBsdWdpbidzIG93biBzZXR0aW5ncyB0YWIgaW5zaWRlIFx1OEJCRVx1N0Y2RSBcdTIxOTIgXHU2M0QyXHU0RUY2IChub3QgdGhlIEdlbmVyYWwgc2VjdGlvbikuXG4gIC8vIFRoZSBwbHVnaW4ncyB3aG9sZSBjb25maWd1cmF0aW9uIGxpdmVzIGluIG9uZSBjYXJkIGluc2lkZVxuICAvLyBcdThCQkVcdTdGNkUgXHUyMTkyIFx1NjNEMlx1NEVGNiBcdTIxOTIgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFIChzZXR0aW5ncy5wbHVnaW4uaXRlbSk6IGZvbnQvc2l6ZS5cbiAgY3R4LnNsb3RzLmluamVjdCgnc2V0dGluZ3MucGx1Z2luLml0ZW0nLCAoKSA9PlxuICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ3NldHRpbmdzLnBsdWdpbi5pdGVtJyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1jb25maWcnLFxuICAgICAgICBvcmRlcjogMzAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdDb25maWdDYXJkLFxuICAgICksXG4gIClcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmIHtcbiAgICBkaWZmKG9sZFN0ciwgbmV3U3RyLCBcbiAgICAvLyBUeXBlIGJlbG93IGlzIG5vdCBhY2N1cmF0ZS9jb21wbGV0ZSAtIHNlZSBhYm92ZSBmb3IgZnVsbCBwb3NzaWJpbGl0aWVzIC0gYnV0IGl0IGNvbXBpbGVzXG4gICAgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGxldCBjYWxsYmFjaztcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoJ2NhbGxiYWNrJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWxsb3cgc3ViY2xhc3NlcyB0byBtYXNzYWdlIHRoZSBpbnB1dCBwcmlvciB0byBydW5uaW5nXG4gICAgICAgIGNvbnN0IG9sZFN0cmluZyA9IHRoaXMuY2FzdElucHV0KG9sZFN0ciwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG5ld1N0cmluZyA9IHRoaXMuY2FzdElucHV0KG5ld1N0ciwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG9sZFRva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShvbGRTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgY29uc3QgbmV3VG9rZW5zID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG5ld1N0cmluZywgb3B0aW9ucykpO1xuICAgICAgICByZXR1cm4gdGhpcy5kaWZmV2l0aE9wdGlvbnNPYmoob2xkVG9rZW5zLCBuZXdUb2tlbnMsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGRvbmUgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5wb3N0UHJvY2Vzcyh2YWx1ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgY2FsbGJhY2sodmFsdWUpOyB9LCAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBuZXdUb2tlbnMubGVuZ3RoLCBvbGRMZW4gPSBvbGRUb2tlbnMubGVuZ3RoO1xuICAgICAgICBsZXQgZWRpdExlbmd0aCA9IDE7XG4gICAgICAgIGxldCBtYXhFZGl0TGVuZ3RoID0gbmV3TGVuICsgb2xkTGVuO1xuICAgICAgICBpZiAob3B0aW9ucy5tYXhFZGl0TGVuZ3RoICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1heEVkaXRMZW5ndGggPSBNYXRoLm1pbihtYXhFZGl0TGVuZ3RoLCBvcHRpb25zLm1heEVkaXRMZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heEV4ZWN1dGlvblRpbWUgPSAoX2EgPSBvcHRpb25zLnRpbWVvdXQpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IEluZmluaXR5O1xuICAgICAgICBjb25zdCBhYm9ydEFmdGVyVGltZXN0YW1wID0gRGF0ZS5ub3coKSArIG1heEV4ZWN1dGlvblRpbWU7XG4gICAgICAgIGNvbnN0IGJlc3RQYXRoID0gW3sgb2xkUG9zOiAtMSwgbGFzdENvbXBvbmVudDogdW5kZWZpbmVkIH1dO1xuICAgICAgICAvLyBTZWVkIGVkaXRMZW5ndGggPSAwLCBpLmUuIHRoZSBjb250ZW50IHN0YXJ0cyB3aXRoIHRoZSBzYW1lIHZhbHVlc1xuICAgICAgICBsZXQgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJlc3RQYXRoWzBdLCBuZXdUb2tlbnMsIG9sZFRva2VucywgMCwgb3B0aW9ucyk7XG4gICAgICAgIGlmIChiZXN0UGF0aFswXS5vbGRQb3MgKyAxID49IG9sZExlbiAmJiBuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgLy8gSWRlbnRpdHkgcGVyIHRoZSBlcXVhbGl0eSBhbmQgdG9rZW5pemVyXG4gICAgICAgICAgICByZXR1cm4gZG9uZSh0aGlzLmJ1aWxkVmFsdWVzKGJlc3RQYXRoWzBdLmxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25jZSB3ZSBoaXQgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGVkaXQgZ3JhcGggb24gc29tZSBkaWFnb25hbCBrLCB3ZSBjYW5cbiAgICAgICAgLy8gZGVmaW5pdGVseSByZWFjaCB0aGUgZW5kIG9mIHRoZSBlZGl0IGdyYXBoIGluIG5vIG1vcmUgdGhhbiBrIGVkaXRzLCBzb1xuICAgICAgICAvLyB0aGVyZSdzIG5vIHBvaW50IGluIGNvbnNpZGVyaW5nIGFueSBtb3ZlcyB0byBkaWFnb25hbCBrKzEgYW55IG1vcmUgKGZyb21cbiAgICAgICAgLy8gd2hpY2ggd2UncmUgZ3VhcmFudGVlZCB0byBuZWVkIGF0IGxlYXN0IGsrMSBtb3JlIGVkaXRzKS5cbiAgICAgICAgLy8gU2ltaWxhcmx5LCBvbmNlIHdlJ3ZlIHJlYWNoZWQgdGhlIGJvdHRvbSBvZiB0aGUgZWRpdCBncmFwaCwgdGhlcmUncyBub1xuICAgICAgICAvLyBwb2ludCBjb25zaWRlcmluZyBtb3ZlcyB0byBsb3dlciBkaWFnb25hbHMuXG4gICAgICAgIC8vIFdlIHJlY29yZCB0aGlzIGZhY3QgYnkgc2V0dGluZyBtaW5EaWFnb25hbFRvQ29uc2lkZXIgYW5kXG4gICAgICAgIC8vIG1heERpYWdvbmFsVG9Db25zaWRlciB0byBzb21lIGZpbml0ZSB2YWx1ZSBvbmNlIHdlJ3ZlIGhpdCB0aGUgZWRnZSBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaC5cbiAgICAgICAgLy8gVGhpcyBvcHRpbWl6YXRpb24gaXMgbm90IGZhaXRoZnVsIHRvIHRoZSBvcmlnaW5hbCBhbGdvcml0aG0gcHJlc2VudGVkIGluXG4gICAgICAgIC8vIE15ZXJzJ3MgcGFwZXIsIHdoaWNoIGluc3RlYWQgcG9pbnRsZXNzbHkgZXh0ZW5kcyBELXBhdGhzIG9mZiB0aGUgZW5kIG9mXG4gICAgICAgIC8vIHRoZSBlZGl0IGdyYXBoIC0gc2VlIHBhZ2UgNyBvZiBNeWVycydzIHBhcGVyIHdoaWNoIG5vdGVzIHRoaXMgcG9pbnRcbiAgICAgICAgLy8gZXhwbGljaXRseSBhbmQgaWxsdXN0cmF0ZXMgaXQgd2l0aCBhIGRpYWdyYW0uIFRoaXMgaGFzIG1ham9yIHBlcmZvcm1hbmNlXG4gICAgICAgIC8vIGltcGxpY2F0aW9ucyBmb3Igc29tZSBjb21tb24gc2NlbmFyaW9zLiBGb3IgaW5zdGFuY2UsIHRvIGNvbXB1dGUgYSBkaWZmXG4gICAgICAgIC8vIHdoZXJlIHRoZSBuZXcgdGV4dCBzaW1wbHkgYXBwZW5kcyBkIGNoYXJhY3RlcnMgb24gdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgLy8gb3JpZ2luYWwgdGV4dCBvZiBsZW5ndGggbiwgdGhlIHRydWUgTXllcnMgYWxnb3JpdGhtIHdpbGwgdGFrZSBPKG4rZF4yKVxuICAgICAgICAvLyB0aW1lIHdoaWxlIHRoaXMgb3B0aW1pemF0aW9uIG5lZWRzIG9ubHkgTyhuK2QpIHRpbWUuXG4gICAgICAgIGxldCBtaW5EaWFnb25hbFRvQ29uc2lkZXIgPSAtSW5maW5pdHksIG1heERpYWdvbmFsVG9Db25zaWRlciA9IEluZmluaXR5O1xuICAgICAgICAvLyBNYWluIHdvcmtlciBtZXRob2QuIGNoZWNrcyBhbGwgcGVybXV0YXRpb25zIG9mIGEgZ2l2ZW4gZWRpdCBsZW5ndGggZm9yIGFjY2VwdGFuY2UuXG4gICAgICAgIGNvbnN0IGV4ZWNFZGl0TGVuZ3RoID0gKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZGlhZ29uYWxQYXRoID0gTWF0aC5tYXgobWluRGlhZ29uYWxUb0NvbnNpZGVyLCAtZWRpdExlbmd0aCk7IGRpYWdvbmFsUGF0aCA8PSBNYXRoLm1pbihtYXhEaWFnb25hbFRvQ29uc2lkZXIsIGVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggKz0gMikge1xuICAgICAgICAgICAgICAgIGxldCBiYXNlUGF0aDtcbiAgICAgICAgICAgICAgICBjb25zdCByZW1vdmVQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0sIGFkZFBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBvbmUgZWxzZSBpcyBnb2luZyB0byBhdHRlbXB0IHRvIHVzZSB0aGlzIHZhbHVlLCBjbGVhciBpdFxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gcGVyZiBvcHRpbWlzYXRpb24uIFRoaXMgdHlwZS12aW9sYXRpbmcgdmFsdWUgd2lsbCBuZXZlciBiZSByZWFkLlxuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGNhbkFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChhZGRQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoYXQgbmV3UG9zIHdpbGwgYmUgYWZ0ZXIgd2UgZG8gYW4gaW5zZXJ0aW9uOlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRQYXRoTmV3UG9zID0gYWRkUGF0aC5vbGRQb3MgLSBkaWFnb25hbFBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGNhbkFkZCA9IGFkZFBhdGggJiYgMCA8PSBhZGRQYXRoTmV3UG9zICYmIGFkZFBhdGhOZXdQb3MgPCBuZXdMZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGNhblJlbW92ZSA9IHJlbW92ZVBhdGggJiYgcmVtb3ZlUGF0aC5vbGRQb3MgKyAxIDwgb2xkTGVuO1xuICAgICAgICAgICAgICAgIGlmICghY2FuQWRkICYmICFjYW5SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBwYXRoIGlzIGEgdGVybWluYWwgdGhlbiBwcnVuZVxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gcGVyZiBvcHRpbWlzYXRpb24uIFRoaXMgdHlwZS12aW9sYXRpbmcgdmFsdWUgd2lsbCBuZXZlciBiZSByZWFkLlxuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBkaWFnb25hbCB0aGF0IHdlIHdhbnQgdG8gYnJhbmNoIGZyb20uIFdlIHNlbGVjdCB0aGUgcHJpb3JcbiAgICAgICAgICAgICAgICAvLyBwYXRoIHdob3NlIHBvc2l0aW9uIGluIHRoZSBvbGQgc3RyaW5nIGlzIHRoZSBmYXJ0aGVzdCBmcm9tIHRoZSBvcmlnaW5cbiAgICAgICAgICAgICAgICAvLyBhbmQgZG9lcyBub3QgcGFzcyB0aGUgYm91bmRzIG9mIHRoZSBkaWZmIGdyYXBoXG4gICAgICAgICAgICAgICAgaWYgKCFjYW5SZW1vdmUgfHwgKGNhbkFkZCAmJiByZW1vdmVQYXRoLm9sZFBvcyA8IGFkZFBhdGgub2xkUG9zKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKGFkZFBhdGgsIHRydWUsIGZhbHNlLCAwLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gdGhpcy5hZGRUb1BhdGgocmVtb3ZlUGF0aCwgZmFsc2UsIHRydWUsIDEsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbiAmJiBuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGhpdCB0aGUgZW5kIG9mIGJvdGggc3RyaW5ncywgdGhlbiB3ZSBhcmUgZG9uZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZSh0aGlzLmJ1aWxkVmFsdWVzKGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSkgfHwgdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSBiYXNlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm9sZFBvcyArIDEgPj0gb2xkTGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBNYXRoLm1pbihtYXhEaWFnb25hbFRvQ29uc2lkZXIsIGRpYWdvbmFsUGF0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5tYXgobWluRGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVkaXRMZW5ndGgrKztcbiAgICAgICAgfTtcbiAgICAgICAgLy8gUGVyZm9ybXMgdGhlIGxlbmd0aCBvZiBlZGl0IGl0ZXJhdGlvbi4gSXMgYSBiaXQgZnVnbHkgYXMgdGhpcyBoYXMgdG8gc3VwcG9ydCB0aGVcbiAgICAgICAgLy8gc3luYyBhbmQgYXN5bmMgbW9kZSB3aGljaCBpcyBuZXZlciBmdW4uIExvb3BzIG92ZXIgZXhlY0VkaXRMZW5ndGggdW50aWwgYSB2YWx1ZVxuICAgICAgICAvLyBpcyBwcm9kdWNlZCwgb3IgdW50aWwgdGhlIGVkaXQgbGVuZ3RoIGV4Y2VlZHMgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoIChpZiBnaXZlbiksXG4gICAgICAgIC8vIGluIHdoaWNoIGNhc2UgaXQgd2lsbCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiBleGVjKCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWRpdExlbmd0aCA+IG1heEVkaXRMZW5ndGggfHwgRGF0ZS5ub3coKSA+IGFib3J0QWZ0ZXJUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXhlY0VkaXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhlYygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9KCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGVkaXRMZW5ndGggPD0gbWF4RWRpdExlbmd0aCAmJiBEYXRlLm5vdygpIDw9IGFib3J0QWZ0ZXJUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXQgPSBleGVjRWRpdExlbmd0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWRkVG9QYXRoKHBhdGgsIGFkZGVkLCByZW1vdmVkLCBvbGRQb3NJbmMsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBhdGgubGFzdENvbXBvbmVudDtcbiAgICAgICAgaWYgKGxhc3QgJiYgIW9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4gJiYgbGFzdC5hZGRlZCA9PT0gYWRkZWQgJiYgbGFzdC5yZW1vdmVkID09PSByZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogbGFzdC5jb3VudCArIDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCwgcHJldmlvdXNDb21wb25lbnQ6IGxhc3QucHJldmlvdXNDb21wb25lbnQgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb2xkUG9zOiBwYXRoLm9sZFBvcyArIG9sZFBvc0luYyxcbiAgICAgICAgICAgICAgICBsYXN0Q29tcG9uZW50OiB7IGNvdW50OiAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIGRpYWdvbmFsUGF0aCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBuZXdUb2tlbnMubGVuZ3RoLCBvbGRMZW4gPSBvbGRUb2tlbnMubGVuZ3RoO1xuICAgICAgICBsZXQgb2xkUG9zID0gYmFzZVBhdGgub2xkUG9zLCBuZXdQb3MgPSBvbGRQb3MgLSBkaWFnb25hbFBhdGgsIGNvbW1vbkNvdW50ID0gMDtcbiAgICAgICAgd2hpbGUgKG5ld1BvcyArIDEgPCBuZXdMZW4gJiYgb2xkUG9zICsgMSA8IG9sZExlbiAmJiB0aGlzLmVxdWFscyhvbGRUb2tlbnNbb2xkUG9zICsgMV0sIG5ld1Rva2Vuc1tuZXdQb3MgKyAxXSwgb3B0aW9ucykpIHtcbiAgICAgICAgICAgIG5ld1BvcysrO1xuICAgICAgICAgICAgb2xkUG9zKys7XG4gICAgICAgICAgICBjb21tb25Db3VudCsrO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogMSwgcHJldmlvdXNDb21wb25lbnQ6IGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIGFkZGVkOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbW9uQ291bnQgJiYgIW9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4pIHtcbiAgICAgICAgICAgIGJhc2VQYXRoLmxhc3RDb21wb25lbnQgPSB7IGNvdW50OiBjb21tb25Db3VudCwgcHJldmlvdXNDb21wb25lbnQ6IGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIGFkZGVkOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBiYXNlUGF0aC5vbGRQb3MgPSBvbGRQb3M7XG4gICAgICAgIHJldHVybiBuZXdQb3M7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucy5jb21wYXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb21wYXJhdG9yKGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodFxuICAgICAgICAgICAgICAgIHx8ICghIW9wdGlvbnMuaWdub3JlQ2FzZSAmJiBsZWZ0LnRvTG93ZXJDYXNlKCkgPT09IHJpZ2h0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlbW92ZUVtcHR5KGFycmF5KSB7XG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV0pIHtcbiAgICAgICAgICAgICAgICByZXQucHVzaChhcnJheVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIGNhc3RJbnB1dCh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICB0b2tlbml6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG4gICAgfVxuICAgIGpvaW4oY2hhcnMpIHtcbiAgICAgICAgLy8gQXNzdW1lcyBWYWx1ZVQgaXMgc3RyaW5nLCB3aGljaCBpcyB0aGUgY2FzZSBmb3IgbW9zdCBzdWJjbGFzc2VzLlxuICAgICAgICAvLyBXaGVuIGl0J3MgZmFsc2UsIGUuZy4gaW4gZGlmZkFycmF5cywgdGhpcyBtZXRob2QgbmVlZHMgdG8gYmUgb3ZlcnJpZGRlbiAoZS5nLiB3aXRoIGEgbm8tb3ApXG4gICAgICAgIC8vIFllcywgdGhlIGNhc3RzIGFyZSB2ZXJib3NlIGFuZCB1Z2x5LCBiZWNhdXNlIHRoaXMgcGF0dGVybiAtIG9mIGhhdmluZyB0aGUgYmFzZSBjbGFzcyBTT1JUIE9GXG4gICAgICAgIC8vIGFzc3VtZSB0b2tlbnMgYW5kIHZhbHVlcyBhcmUgc3RyaW5ncywgYnV0IG5vdCBjb21wbGV0ZWx5IC0gaXMgd2VpcmQgYW5kIGphbmt5LlxuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfVxuICAgIHBvc3RQcm9jZXNzKGNoYW5nZU9iamVjdHMsIFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBjaGFuZ2VPYmplY3RzO1xuICAgIH1cbiAgICBnZXQgdXNlTG9uZ2VzdFRva2VuKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGJ1aWxkVmFsdWVzKGxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSB7XG4gICAgICAgIC8vIEZpcnN0IHdlIGNvbnZlcnQgb3VyIGxpbmtlZCBsaXN0IG9mIGNvbXBvbmVudHMgaW4gcmV2ZXJzZSBvcmRlciB0byBhblxuICAgICAgICAvLyBhcnJheSBpbiB0aGUgcmlnaHQgb3JkZXI6XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgbGV0IG5leHRDb21wb25lbnQ7XG4gICAgICAgIHdoaWxlIChsYXN0Q29tcG9uZW50KSB7XG4gICAgICAgICAgICBjb21wb25lbnRzLnB1c2gobGFzdENvbXBvbmVudCk7XG4gICAgICAgICAgICBuZXh0Q29tcG9uZW50ID0gbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGRlbGV0ZSBsYXN0Q29tcG9uZW50LnByZXZpb3VzQ29tcG9uZW50O1xuICAgICAgICAgICAgbGFzdENvbXBvbmVudCA9IG5leHRDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29tcG9uZW50cy5yZXZlcnNlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudExlbiA9IGNvbXBvbmVudHMubGVuZ3RoO1xuICAgICAgICBsZXQgY29tcG9uZW50UG9zID0gMCwgbmV3UG9zID0gMCwgb2xkUG9zID0gMDtcbiAgICAgICAgZm9yICg7IGNvbXBvbmVudFBvcyA8IGNvbXBvbmVudExlbjsgY29tcG9uZW50UG9zKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LnJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCAmJiB0aGlzLnVzZUxvbmdlc3RUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gb2xkVG9rZW5zW29sZFBvcyArIGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4odmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG5ld1Rva2Vucy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgICAgIC8vIENvbW1vbiBjYXNlXG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4ob2xkVG9rZW5zLnNsaWNlKG9sZFBvcywgb2xkUG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICB9XG59XG4iLCAiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlLmpzJztcbmltcG9ydCB7IGdlbmVyYXRlT3B0aW9ucyB9IGZyb20gJy4uL3V0aWwvcGFyYW1zLmpzJztcbmNsYXNzIExpbmVEaWZmIGV4dGVuZHMgRGlmZiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMudG9rZW5pemUgPSB0b2tlbml6ZTtcbiAgICB9XG4gICAgZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIElmIHdlJ3JlIGlnbm9yaW5nIHdoaXRlc3BhY2UsIHdlIG5lZWQgdG8gbm9ybWFsaXNlIGxpbmVzIGJ5IHN0cmlwcGluZ1xuICAgICAgICAvLyB3aGl0ZXNwYWNlIGJlZm9yZSBjaGVja2luZyBlcXVhbGl0eS4gKFRoaXMgaGFzIGFuIGFubm95aW5nIGludGVyYWN0aW9uXG4gICAgICAgIC8vIHdpdGggbmV3bGluZUlzVG9rZW4gdGhhdCByZXF1aXJlcyBzcGVjaWFsIGhhbmRsaW5nOiBpZiBuZXdsaW5lcyBnZXQgdGhlaXJcbiAgICAgICAgLy8gb3duIHRva2VuLCB0aGVuIHdlIERPTidUIHdhbnQgdG8gdHJpbSB0aGUgKm5ld2xpbmUqIHRva2VucyBkb3duIHRvIGVtcHR5XG4gICAgICAgIC8vIHN0cmluZ3MsIHNpbmNlIHRoaXMgd291bGQgY2F1c2UgdXMgdG8gdHJlYXQgd2hpdGVzcGFjZS1vbmx5IGxpbmUgY29udGVudFxuICAgICAgICAvLyBhcyBlcXVhbCB0byBhIHNlcGFyYXRvciBiZXR3ZWVuIGxpbmVzLCB3aGljaCB3b3VsZCBiZSB3ZWlyZCBhbmRcbiAgICAgICAgLy8gaW5jb25zaXN0ZW50IHdpdGggdGhlIGRvY3VtZW50ZWQgYmVoYXZpb3Igb2YgdGhlIG9wdGlvbnMuKVxuICAgICAgICBpZiAob3B0aW9ucy5pZ25vcmVXaGl0ZXNwYWNlKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubmV3bGluZUlzVG9rZW4gfHwgIWxlZnQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFyaWdodC5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmlnbm9yZU5ld2xpbmVBdEVvZiAmJiAhb3B0aW9ucy5uZXdsaW5lSXNUb2tlbikge1xuICAgICAgICAgICAgaWYgKGxlZnQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJpZ2h0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5lcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBsaW5lRGlmZiA9IG5ldyBMaW5lRGlmZigpO1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmVHJpbW1lZExpbmVzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IGdlbmVyYXRlT3B0aW9ucyhvcHRpb25zLCB7IGlnbm9yZVdoaXRlc3BhY2U6IHRydWUgfSk7XG4gICAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuLy8gRXhwb3J0ZWQgc3RhbmRhbG9uZSBzbyBpdCBjYW4gYmUgdXNlZCBmcm9tIGpzb25EaWZmIHRvby5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbml6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnN0cmlwVHJhaWxpbmdDcikge1xuICAgICAgICAvLyByZW1vdmUgb25lIFxcciBiZWZvcmUgXFxuIHRvIG1hdGNoIEdOVSBkaWZmJ3MgLS1zdHJpcC10cmFpbGluZy1jciBiZWhhdmlvclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcclxcbi9nLCAnXFxuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldExpbmVzID0gW10sIGxpbmVzQW5kTmV3bGluZXMgPSB2YWx1ZS5zcGxpdCgvKFxcbnxcXHJcXG4pLyk7XG4gICAgLy8gSWdub3JlIHRoZSBmaW5hbCBlbXB0eSB0b2tlbiB0aGF0IG9jY3VycyBpZiB0aGUgc3RyaW5nIGVuZHMgd2l0aCBhIG5ldyBsaW5lXG4gICAgaWYgKCFsaW5lc0FuZE5ld2xpbmVzW2xpbmVzQW5kTmV3bGluZXMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgbGluZXNBbmROZXdsaW5lcy5wb3AoKTtcbiAgICB9XG4gICAgLy8gTWVyZ2UgdGhlIGNvbnRlbnQgYW5kIGxpbmUgc2VwYXJhdG9ycyBpbnRvIHNpbmdsZSB0b2tlbnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzQW5kTmV3bGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzQW5kTmV3bGluZXNbaV07XG4gICAgICAgIGlmIChpICUgMiAmJiAhb3B0aW9ucy5uZXdsaW5lSXNUb2tlbikge1xuICAgICAgICAgICAgcmV0TGluZXNbcmV0TGluZXMubGVuZ3RoIC0gMV0gKz0gbGluZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldExpbmVzLnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldExpbmVzO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUJBLG1CQUFxRjs7O0FDbkJyRixJQUFxQixPQUFyQixNQUEwQjtBQUFBLEVBQ3RCLEtBQUssUUFBUSxRQUViLFVBQVUsQ0FBQyxHQUFHO0FBQ1YsUUFBSTtBQUNKLFFBQUksT0FBTyxZQUFZLFlBQVk7QUFDL0IsaUJBQVc7QUFDWCxnQkFBVSxDQUFDO0FBQUEsSUFDZixXQUNTLGNBQWMsU0FBUztBQUM1QixpQkFBVyxRQUFRO0FBQUEsSUFDdkI7QUFFQSxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxXQUFPLEtBQUssbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFFBQVE7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsbUJBQW1C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O0FBQUEsRUFDakIsbUJBQW1CO0FBQUEsRUFDbkIsa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsMkJBQTJCO0FBQUEsRUFDM0IsdUJBQXVCO0FBQUEsRUFDdkIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsb0JBQW9CO0FBQUEsRUFDcEIsaUJBQWlCO0FBQUEsRUFDakIsaUJBQWlCO0FBQUEsRUFDakIsb0JBQW9CO0FBQUEsRUFDcEIsb0JBQW9CO0FBQUEsRUFDcEIsa0JBQWtCO0FBQUEsRUFDbEIscUJBQXFCO0FBQUEsRUFDckIsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIsd0JBQXdCO0FBQUEsRUFDeEIsMkJBQTJCO0FBQUEsRUFDM0IsaUJBQWlCO0FBQUEsRUFDakIsNEJBQTRCO0FBQUEsRUFDNUIsZUFBZTtBQUFBLEVBQ2Ysc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsd0JBQXdCO0FBQUEsRUFDeEIseUJBQXlCO0FBQUEsRUFDekIsd0JBQXdCO0FBQUEsRUFDeEIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsWUFBWTtBQUFBLEVBQ1osZ0JBQWdCO0FBQUEsRUFDaEIsY0FBYztBQUFBLEVBQ2QsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsZUFBZTtBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsb0JBQW9CO0FBQUEsRUFDcEIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsdUJBQXVCO0FBQUEsRUFDdkIsZ0JBQWdCO0FBQUEsRUFDaEIsa0JBQWtCO0FBQUEsRUFDbEIsa0JBQWtCO0FBQUEsRUFDbEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsbUJBQW1CO0FBQUEsRUFDbkIsY0FBYztBQUFBLEVBQ2Qsd0JBQXdCO0FBQUEsRUFDeEIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsbUJBQW1CO0FBQUEsRUFDbkIsc0JBQXNCO0FBQUEsRUFDdEIsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsaUJBQWlCO0FBQUEsRUFDakIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIseUJBQXlCO0FBQUEsRUFDekIsMkJBQTJCO0FBQUEsRUFDM0IscUJBQXFCO0FBQUEsRUFDckIsbUJBQW1CO0FBQUEsRUFDbkIscUJBQXFCO0FBQUEsRUFDckIscUJBQXFCO0FBQUEsRUFDckIsdUJBQXVCO0FBQUEsRUFDdkIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsWUFBWTtBQUFBLEVBQ1osZUFBZTtBQUFBLEVBQ2YsV0FBVztBQUFBLEVBQ1gsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsaUJBQWlCO0FBQUEsRUFD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

		})(module, module.exports, require);
		return module.exports;
	}
});
