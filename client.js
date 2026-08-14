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
var import_jsx_runtime = require("react/jsx-runtime");
var name = "diff-review";
var inject = ["sessions", "slots", "locale"];
var LOCALE_NS = "diff-review";
var STATUS_URL = "diff-review/status";
var APPLY_URL = "diff-review/apply";
var COMMIT_URL = "diff-review/commit";
var PUSH_URL = "diff-review/push";
var HISTORY_URL = "diff-review/history";
var COMMIT_DIFF_URL = "diff-review/commit-diff";
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
.dsdr-line{display:flex;padding:0 16px;color:var(--dsw-alias-label-primary)}
.dsdr-line-add{background:rgba(46,160,67,.13)}
.dsdr-line-del{background:rgba(248,81,73,.12)}
.dsdr-line-hunk{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-tertiary)}
.dsdr-line-file{color:var(--dsw-alias-label-tertiary)}
.dsdr-line-note{color:var(--dsw-alias-label-tertiary);font-style:italic}
.dsdr-foot{display:flex;align-items:center;gap:10px;padding:8px 16px;border-top:1px solid var(--dsw-alias-border-l1);flex:none;min-height:36px}
.dsdr-notice{font-size:12px;color:var(--dsw-alias-label-secondary)}
.dsdr-notice-ok{color:var(--dsw-alias-state-success-primary)}
.dsdr-notice-error{color:var(--dsw-alias-state-error-primary)}
.dsdr-spinner{flex:none;width:12px;height:12px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-label-secondary);animation:dsdr-spin .8s linear infinite}
@keyframes dsdr-spin{to{transform:rotate(360deg)}}
.dsdr-empty{padding:40px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsdr-nodiff{padding:8px 16px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsdr-set-row{border-bottom:1px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;gap:10px;padding:16px 0}
.dsdr-set-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.dsdr-set-grid{display:flex;flex-wrap:wrap;gap:12px}
.dsdr-set-field{display:flex;flex-direction:column;gap:4px;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dsdr-sel{position:relative;display:inline-flex}
.dsdr-sel-trigger{box-sizing:border-box;min-width:180px;min-height:28px;background:var(--dsw-alias-fill-l2);border:1px solid var(--dsw-alias-border-l2);border-radius:7px;color:var(--dsw-alias-label-primary);cursor:pointer;padding:2px 8px;font:inherit;font-size:12px;line-height:18px;display:inline-flex;align-items:center;gap:8px}
.dsdr-sel-trigger:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-sel-trigger:focus-visible{outline:1px solid var(--dsw-static-neutral-bluish-400)}
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
  "settings.title": "\u53D8\u52A8",
  "settings.font": "\u5B57\u4F53",
  "settings.size": "\u5B57\u53F7",
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
  "settings.title": "Changes",
  "settings.font": "Font",
  "settings.size": "Font size",
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
function IconRefresh() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 3v5h-5" })
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
function DiffReviewSettingsRow({ t }) {
  const prefs = (0, import_react.useSyncExternalStore)(prefsStore.subscribe, prefsStore.getSnapshot);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-set-row", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-set-title", children: t("settings.title") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-set-grid", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dsdr-set-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.font") }),
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dsdr-set-field", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("settings.size") }),
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
  const loadWorkspace = async (silent = false) => {
    if (!cwd) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [next, hist] = await Promise.all([loadStatus(cwd), loadHistory(cwd)]);
      setStatus(next);
      if (hist.ok) setHistory(hist.commits);
      if (next.error && !next.isRepo) setError(next.error);
      setSelected((prev) => prev && next.files.some((f) => f.path === prev) ? prev : next.files[0]?.path ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };
  const workspaceLoaded = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    if (tab === "workspace" && !workspaceLoaded.current && cwd) {
      workspaceLoaded.current = true;
      void loadWorkspace();
    }
  }, [tab, cwd]);
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
  const stagedCount = stagedFiles.length;
  const stagedTree = (0, import_react.useMemo)(() => buildFileTree(stagedFiles, (f) => f.path), [stagedFiles]);
  const unstagedTree = (0, import_react.useMemo)(() => buildFileTree(unstagedFiles, (f) => f.path), [unstagedFiles]);
  const commitFilesTree = (0, import_react.useMemo)(
    () => commitDiff?.ok ? buildFileTree(commitDiff.files, (f) => f.path) : [],
    [commitDiff]
  );
  if (!storeState.open || !cwd) return null;
  const selectedFile = files.find((f) => f.path === selected) ?? null;
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
      const result = await applyChanges(cwd, action, path);
      if (result.ok) {
        setNotice({
          kind: "ok",
          text: path ? t("review.doneOne", { action: action === "accept" ? t("review.accepted") : t("review.reverted"), path }) : t("review.done", { action: action === "accept" ? t("review.accepted") : t("review.reverted"), count: files.length })
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
  const onCommit = async () => {
    const message = commitMessage.trim();
    if (!message || busy) return;
    setBusy(true);
    setNotice(null);
    setConfirm(null);
    try {
      const result = await runGitAction(cwd, "commit", message);
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
    if (busy) return;
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
        const result = await runGitAction(cwd, "push");
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
    setSelected(null);
    setSelectedCommit(commit);
    setSelectedCommitFile(null);
    setConfirm(null);
    setCommitDiff(null);
    setCommitDiffLoading(true);
    void loadCommitDiff(cwd, commit.hash).then((d) => {
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
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-subtitle", children: tab === "session" ? t("review.sessionStats", { rounds: rounds.length, files: totalSessionFiles }) : status?.isRepo ? `${status.branch ?? t("review.detached")} \xB7 ${t("review.changes", { added: totalAdded, deleted: totalDeleted })}${status.ahead > 0 ? ` \xB7 ${t("review.ahead", { n: status.ahead })}` : ""}${status.behind > 0 ? ` \xB7 ${t("review.behind", { n: status.behind })}` : ""}` : t("review.notRepo") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spacer" }),
              tab === "workspace" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary", disabled: busy || files.length === 0, onClick: () => onAllAction("accept"), children: t("review.acceptAll") }),
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
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy || !commitMessage.trim() || stagedCount === 0, onClick: () => void onCommit(), children: t("review.commit") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => void loadWorkspace(), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconRefresh, {}),
                  t("review.refresh")
                ] })
              ] }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", "aria-label": t("review.close"), onClick: close, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconX, {}) })
            ] }),
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
                ] }) : null,
                history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
                selectedCommit && commitDiff?.ok && commitDiff.files.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
                ] })
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
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary", disabled: busy, onClick: () => onFileAction("accept", selectedFile.path), children: t("review.accept") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      type: "button",
                      className: `dsdr-btn dsdr-btn-danger${confirm === "file" ? " dsdr-btn-confirm" : ""}`,
                      disabled: busy,
                      onClick: () => onFileAction("revert", selectedFile.path),
                      children: confirm === "file" ? t("review.confirmRevert") : t("review.revert")
                    }
                  )
                ] }),
                view === "split" && !selectedFile.binary && gitSplitBlocks(selectedFile.diff).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplitDiff, { blocks: gitSplitBlocks(selectedFile.diff), beforeLabel: t("view.before"), afterLabel: t("view.after") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsdr-pre", children: gitDiffRows(selectedFile.diff).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `dsdr-line dsdr-line-${row.kind}`, children: row.text || " " }, i)) }) })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-empty", children: t("review.empty") }) })
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
    "settings.general.item",
    () => ctx.slots.register(
      {
        name: "settings.general.item",
        id: "diff-review-preferences",
        order: 30,
        locale: LOCALE_NS
      },
      DiffReviewSettingsRow
    )
  );
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERpZmYtcmV2aWV3IHBsdWdpbiBcdTIwMTQgY2xpZW50IGhhbGYuXG4gKlxuICogQ29kZXgtc3R5bGUgcmV2aWV3IHdpdGggdHdvIHNvdXJjZXM6XG4gKlxuICogMS4gKipcdTRGMUFcdThCRERcdTY2RjRcdTY1MzkgKFNlc3Npb24gY2hhbmdlcykqKiBcdTIwMTQgd2hhdCB0aGUgYWdlbnQgY2hhbmdlZCBpbiBlYWNoIHJvdW5kIG9mXG4gKiAgICB0aGlzIGNvbnZlcnNhdGlvbiwgZGVyaXZlZCBmcm9tIHRoZSBjb252ZXJzYXRpb24gc25hcHNob3QgKHRvb2wgcmVzdWx0c1xuICogICAgY2FycnkgdGhlIGhvc3QtY29tcHV0ZWQgYHJlc3VsdFZpZXdgIGRpZmYgaHVua3MpLiBXb3JrcyB3aXRoIG9yIHdpdGhvdXRcbiAqICAgIGdpdCwgYW5kIHNob3dzIGEgY2hhbmdlIGV2ZW4gd2hlbiBubyBkaWZmIHRleHQgaXMgYXZhaWxhYmxlIChwYXRoLW9ubHkpLlxuICogMi4gKipcdTVERTVcdTRGNUNcdTUzM0EgKFdvcmtzcGFjZSkqKiBcdTIwMTQgdGhlIGdpdCB3b3JraW5nIHRyZWUncyB1bmNvbW1pdHRlZCBjaGFuZ2VzXG4gKiAgICAoc3RhZ2VkICsgdW5zdGFnZWQgKyB1bnRyYWNrZWQpIHdpdGggcGVyLWZpbGUgLyBhbGwtZmlsZSBhY2NlcHQgKHN0YWdlKVxuICogICAgYW5kIHJldmVydCAoZGlzY2FyZCkgdGhyb3VnaCB0aGUgcGx1Z2luJ3Mgc2VydmVyIHJvdXRlcy5cbiAqXG4gKiBUaGUgcmV2aWV3IHN1cmZhY2UgbW91bnRzIGluIGBzaGVsbC5vdmVybGF5YCAocm9vdCBzY29wZSkuIFN0YXRlIGhhbmQtb2ZmXG4gKiBiZXR3ZWVuIHRoZSBzZXNzaW9uLXNjb3BlZCBoZWFkZXIgdHJpZ2dlciBhbmQgdGhlIHJvb3Qtc2NvcGVkIG92ZXJsYXkgZ29lc1xuICogdGhyb3VnaCBhIG1vZHVsZS1sZXZlbCBzbmFwc2hvdCBzdG9yZTsgdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCBmb3IgdGhlXG4gKiBjdXJyZW50IHNlc3Npb24gaXMgcmVhZCByZWFjdGl2ZWx5IHRocm91Z2ggYGN0eC5zZXNzaW9uc2AgKGluamVjdGVkIHZpYSB0aGVcbiAqIG92ZXJsYXkgcmVnaXN0cmF0aW9uJ3MgaW5qZWN0IGZhY2UpLlxuICovXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUsIHVzZVN5bmNFeHRlcm5hbFN0b3JlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENTU1Byb3BlcnRpZXMsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBkaWZmTGluZXMgfSBmcm9tICdkaWZmJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0LCBJU2Vzc2lvbnMsIFNlc3Npb25MaXN0U3RhdGUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB7IGNyZWF0ZVNuYXBzaG90U3RvcmUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgUHJvcHNMb2NhbGUsIFByb3BzUnVudGltZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNsb3RzJ1xuaW1wb3J0IHR5cGUgeyBDb252ZXJzYXRpb25Ob2RlLCBUb29sUmVzdWx0Tm9kZSwgVXNlck1lc3NhZ2VOb2RlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFRvb2xSZXN1bHRWaWV3IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hcGktcmVtb3Rlcy9jbGllbnQnXG4vLyBUeXBlLW9ubHkgaW1wb3J0cyBwdWxsaW5nIHRoZSBoZWFkZXItYWN0aW9uIHNsb3QgY29udHJhY3QsIHRoZSBzaGVsbC5vdmVybGF5XG4vLyBjb250cmFjdCwgdGhlIHNldHRpbmdzLmdlbmVyYWwuaXRlbSBzbG90IGNvbnRyYWN0IGFuZCB0aGUgc3RhbmRhcmQga2l0LlxuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktY29udmVyc2F0aW9uL2NsaWVudCdcbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWxheW91dC9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1zZXR0aW5ncy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseVJlc3BvbnNlLCBDb21taXREaWZmUmVzcG9uc2UsIENvbW1pdEluZm8sIERpZmZGaWxlLCBHaXRSZXNwb25zZSwgSGlzdG9yeVJlc3BvbnNlLCBTdGF0dXNSZXNwb25zZSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcy50cydcblxuZXhwb3J0IGNvbnN0IG5hbWUgPSAnZGlmZi1yZXZpZXcnXG5cbi8qKiBSZXF1aXJlZCBjbGllbnQgc2VydmljZXMgKGZpYmVyIGluamVjdCkuICovXG5leHBvcnQgY29uc3QgaW5qZWN0ID0gWydzZXNzaW9ucycsICdzbG90cycsICdsb2NhbGUnXVxuXG5jb25zdCBMT0NBTEVfTlMgPSAnZGlmZi1yZXZpZXcnXG5jb25zdCBTVEFUVVNfVVJMID0gJ2RpZmYtcmV2aWV3L3N0YXR1cydcbmNvbnN0IEFQUExZX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseSdcbmNvbnN0IENPTU1JVF9VUkwgPSAnZGlmZi1yZXZpZXcvY29tbWl0J1xuY29uc3QgUFVTSF9VUkwgPSAnZGlmZi1yZXZpZXcvcHVzaCdcbmNvbnN0IEhJU1RPUllfVVJMID0gJ2RpZmYtcmV2aWV3L2hpc3RvcnknXG5jb25zdCBDT01NSVRfRElGRl9VUkwgPSAnZGlmZi1yZXZpZXcvY29tbWl0LWRpZmYnXG5jb25zdCBTVFlMRV9UQUcgPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldy9yZXZpZXcuY3NzJ1xuXG4vKiogT3BlbiBzdGF0ZSBzaGFyZWQgYmV0d2VlbiB0aGUgaGVhZGVyIHRyaWdnZXIgKHNlc3Npb24gc2NvcGUpIGFuZCB0aGUgb3ZlcmxheSAocm9vdCBzY29wZSkuICovXG5jb25zdCBvdmVybGF5U3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPHsgb3BlbjogYm9vbGVhbjsgY3dkOiBzdHJpbmcgfCBudWxsOyBrZXk6IG51bWJlciB9Pih7XG4gIG9wZW46IGZhbHNlLFxuICBjd2Q6IG51bGwsXG4gIGtleTogMCxcbn0pXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IHByZWZlcmVuY2VzIChmb250IC8gc2l6ZSAvIHBhbmVsIGdlb21ldHJ5KSwgc2hhcmVkIGJ5IHRoZSBvdmVybGF5XG4vLyBhbmQgdGhlIFNldHRpbmdzIFx1MjE5MiBHZW5lcmFsIHJvdy4gUGVyc2lzdGVkIHRvIGxvY2FsU3RvcmFnZSBieSB0aGUgc3RvcmUuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFBhbmVsIGdlb21ldHJ5IGJvdW5kcy4gKi9cbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfVyA9IDY0MFxuZXhwb3J0IGNvbnN0IE1JTl9QQU5FTF9IID0gNDAwXG5cbmludGVyZmFjZSBQcmVmcyB7XG4gIC8qKiBGb250IG9wdGlvbiBpZCAoc2VlIEZPTlRfT1BUSU9OUykuICovXG4gIGZvbnQ6IHN0cmluZ1xuICAvKiogRGlmZiB0ZXh0IHNpemUgaW4gcHguICovXG4gIHNpemU6IG51bWJlclxuICAvKiogUGFuZWwgd2lkdGggaW4gcHguICovXG4gIHdpZHRoOiBudW1iZXJcbiAgLyoqIFBhbmVsIGhlaWdodCBpbiBweC4gKi9cbiAgaGVpZ2h0OiBudW1iZXJcbn1cblxuY29uc3QgRk9OVF9PUFRJT05TOiB7IGlkOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGNzczogc3RyaW5nIH1bXSA9IFtcbiAgeyBpZDogJ21vbm8nLCBsYWJlbDogJ2ZvbnQubW9ubycsIGNzczogJ3ZhcigtLWRzdy1mb250LW1vbm8pJyB9LFxuICB7IGlkOiAnc3lzdGVtJywgbGFiZWw6ICdmb250LnN5c3RlbScsIGNzczogJ3N5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZicgfSxcbiAgeyBpZDogJ2NvbnNvbGFzJywgbGFiZWw6ICdDb25zb2xhcycsIGNzczogJ0NvbnNvbGFzLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ2pldGJyYWlucycsIGxhYmVsOiAnSmV0QnJhaW5zIE1vbm8nLCBjc3M6ICdcIkpldEJyYWlucyBNb25vXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdmaXJhJywgbGFiZWw6ICdGaXJhIENvZGUnLCBjc3M6ICdcIkZpcmEgQ29kZVwiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnc291cmNlJywgbGFiZWw6ICdTb3VyY2UgQ29kZSBQcm8nLCBjc3M6ICdcIlNvdXJjZSBDb2RlIFByb1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuXVxuXG5jb25zdCBTSVpFX09QVElPTlMgPSBbMTEsIDEyLCAxMywgMTQsIDE2LCAxOF1cblxuY29uc3QgcHJlZnNTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UHJlZnM+KFxuICB7IGZvbnQ6ICdtb25vJywgc2l6ZTogMTIsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDcyMCB9LFxuICB7IHBlcnNpc3Q6IHsgbmFtZTogJ2RzZHItcHJlZnMnIH0gfSxcbilcblxuLyoqIENTUyBmb250LWZhbWlseSBmb3IgYSBzdG9yZWQgZm9udCBvcHRpb24gaWQuICovXG5mdW5jdGlvbiBmb250Q3NzKGlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gRk9OVF9PUFRJT05TLmZpbmQoKGYpID0+IGYuaWQgPT09IGlkKT8uY3NzID8/IEZPTlRfT1BUSU9OU1swXS5jc3Ncbn1cblxuLyoqIFBhbmVsIENTUyB2YXJpYWJsZXMgY2FycnlpbmcgdGhlIGZvbnQvc2l6ZSBwcmVmZXJlbmNlLiAqL1xuZnVuY3Rpb24gZGlmZlN0eWxlVmFycyhwcmVmczogUHJlZnMpOiBDU1NQcm9wZXJ0aWVzIHtcbiAgcmV0dXJuIHtcbiAgICAnLS1kc2RyLWRpZmYtZm9udCc6IGZvbnRDc3MocHJlZnMuZm9udCksXG4gICAgJy0tZHNkci1kaWZmLXNpemUnOiBgJHtwcmVmcy5zaXplfXB4YCxcbiAgfSBhcyBDU1NQcm9wZXJ0aWVzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2Vzc2lvbi1jaGFuZ2VzIGV4dHJhY3Rpb24gKGNsaWVudC1zaWRlLCB3b3JrcyB3aXRob3V0IGdpdCkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBiZWZvcmUvYWZ0ZXIgc2xpY2Ugb2YgYSBjaGFuZ2UgKGEgaHVuaykuICovXG5pbnRlcmZhY2UgSHVuayB7XG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBPbmUgZmlsZSBjaGFuZ2VkIGluc2lkZSBvbmUgcm91bmQuICovXG5pbnRlcmZhY2UgUm91bmRDaGFuZ2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgdG9vbDogc3RyaW5nXG4gIGh1bmtzOiBIdW5rW11cbiAgLyoqIEZhbHNlIHdoZW4gb25seSB0aGUgcGF0aCBpcyBrbm93biAobm8gZGlmZiBkYXRhIHBlcnNpc3RlZCkuICovXG4gIGhhc0RpZmY6IGJvb2xlYW5cbn1cblxuLyoqIE9uZSB1c2VyIHJvdW5kIGFuZCB0aGUgZmlsZXMgaXQgY2hhbmdlZC4gKi9cbmludGVyZmFjZSBTZXNzaW9uUm91bmQge1xuICByb3VuZDogbnVtYmVyXG4gIGxhYmVsOiBzdHJpbmdcbiAgY2hhbmdlczogUm91bmRDaGFuZ2VbXVxufVxuXG5pbnRlcmZhY2UgRmlsZURpZmZMaWtlIHtcbiAgcGF0aDogc3RyaW5nXG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBWYWxpZGF0ZSBhIHJhdyBGaWxlRGlmZi1zaGFwZWQgdmFsdWUgKHRoZSB0b29scycgYHtwYXRoLCBvbGRUZXh0LCBuZXdUZXh0fWAgY29udHJhY3QpLiAqL1xuZnVuY3Rpb24gYXNGaWxlRGlmZihyYXc6IHVua25vd24pOiBGaWxlRGlmZkxpa2UgfCBudWxsIHtcbiAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGNvbnN0IHJlYyA9IHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICBpZiAodHlwZW9mIHJlYy5wYXRoICE9PSAnc3RyaW5nJyB8fCAhcmVjLnBhdGgpIHJldHVybiBudWxsXG4gIGlmICh0eXBlb2YgcmVjLm5ld1RleHQgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbFxuICBjb25zdCBvbGRUZXh0ID0gcmVjLm9sZFRleHRcbiAgcmV0dXJuIHsgcGF0aDogcmVjLnBhdGgsIG9sZFRleHQ6IHR5cGVvZiBvbGRUZXh0ID09PSAnc3RyaW5nJyA/IG9sZFRleHQgOiBudWxsLCBuZXdUZXh0OiByZWMubmV3VGV4dCB9XG59XG5cbi8qKiBEaWZmIGh1bmtzIGNhcnJpZWQgYnkgYSBjb21wbGV0ZWQgdG9vbCByZXN1bHQgKGByZXN1bHRWaWV3LmNhcmQgPT09ICdkaWZmJ2ApLiAqL1xuZnVuY3Rpb24gZGlmZnNGcm9tUmVzdWx0VmlldyhyZXN1bHRWaWV3OiBUb29sUmVzdWx0VmlldyB8IG51bGwpOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghcmVzdWx0VmlldyB8fCByZXN1bHRWaWV3LmNhcmQgIT09ICdkaWZmJyB8fCAhQXJyYXkuaXNBcnJheShyZXN1bHRWaWV3LmRpZmZzKSkgcmV0dXJuIFtdXG4gIHJldHVybiByZXN1bHRWaWV3LmRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG4vKiogUmF3IGBtZXRhLmRpZmZzYCBmYWxsYmFjayAodGhlIHBlcnNpc3RlZCB0b29sL3Jlc3VsdCBtZXRhKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbU1ldGEobWV0YTogdW5rbm93bik6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCFtZXRhIHx8IHR5cGVvZiBtZXRhICE9PSAnb2JqZWN0JykgcmV0dXJuIFtdXG4gIGNvbnN0IGRpZmZzID0gKG1ldGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmRpZmZzXG4gIGlmICghQXJyYXkuaXNBcnJheShkaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbmNvbnN0IE1VVEFUSU9OX1RPT0xTID0gbmV3IFNldChbJ3N0cl9yZXBsYWNlX2VkaXRvcicsICdub3RlYm9va19lZGl0J10pXG5jb25zdCBNVVRBVElPTl9DT01NQU5EUyA9IG5ldyBTZXQoWyd3cml0ZScsICdlZGl0JywgJ3JlcGxhY2UnLCAnZGVsZXRlJywgJ21vdmUnXSlcblxuLyoqIFBhdGgtb25seSBmYWxsYmFjayBmb3Iga25vd24gZmlsZS1tdXRhdGluZyB0b29scyB3aG9zZSByZXN1bHQgY2FycmllZCBubyBkaWZmLiAqL1xuZnVuY3Rpb24gbXV0YXRpb25QYXRoKHRvb2w6IHN0cmluZywgYXJnc1Jhdzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGxldCBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwgPSBudWxsXG4gIHRyeSB7XG4gICAgYXJncyA9IEpTT04ucGFyc2UoYXJnc1JhdykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBpZiAoIWFyZ3MgfHwgdHlwZW9mIGFyZ3MgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBpZiAodG9vbCA9PT0gJ2ZzJyB8fCB0b29sID09PSAnZmlsZXN5c3RlbScpIHtcbiAgICBjb25zdCBjbWQgPSB0eXBlb2YgYXJncy5jb21tYW5kID09PSAnc3RyaW5nJyA/IGFyZ3MuY29tbWFuZCA6ICcnXG4gICAgaWYgKCFNVVRBVElPTl9DT01NQU5EUy5oYXMoY21kKSkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gdHlwZW9mIGFyZ3MuZmlsZV9wYXRoID09PSAnc3RyaW5nJyAmJiBhcmdzLmZpbGVfcGF0aCA/IGFyZ3MuZmlsZV9wYXRoIDogbnVsbFxuICB9XG4gIGlmIChNVVRBVElPTl9UT09MUy5oYXModG9vbCkgfHwgdG9vbC5zdGFydHNXaXRoKCdlZGl0JykpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbJ2ZpbGVfcGF0aCcsICdwYXRoJywgJ2ZpbGVuYW1lJ10pIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1trZXldID09PSAnc3RyaW5nJyAmJiBhcmdzW2tleV0pIHJldHVybiBhcmdzW2tleV0gYXMgc3RyaW5nXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbi8qKiBFeHRyYWN0IHRoZSBjaGFuZ2VkIGZpbGVzIGZyb20gb25lIHNldHRsZWQgdG9vbCByZXN1bHQgKGRpZmYgaHVua3MsIGVsc2UgcGF0aC1vbmx5KS4gKi9cbmZ1bmN0aW9uIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChjYWxsOiB7IG5hbWU6IHN0cmluZzsgYXJnc1Jhdzogc3RyaW5nIH0sIG5vZGU6IFRvb2xSZXN1bHROb2RlKTogUm91bmRDaGFuZ2VbXSB7XG4gIGNvbnN0IHRvb2wgPSBjYWxsLm5hbWVcbiAgY29uc3QgZGlmZnMgPSBkaWZmc0Zyb21SZXN1bHRWaWV3KG5vZGUucmVzdWx0VmlldylcbiAgY29uc3QgZmFsbGJhY2tEaWZmcyA9IGRpZmZzLmxlbmd0aCA9PT0gMCA/IGRpZmZzRnJvbU1ldGEobm9kZS5tZXRhKSA6IFtdXG4gIGNvbnN0IGFsbERpZmZzID0gZGlmZnMubGVuZ3RoID4gMCA/IGRpZmZzIDogZmFsbGJhY2tEaWZmc1xuICBpZiAoYWxsRGlmZnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSb3VuZENoYW5nZT4oKVxuICAgIGZvciAoY29uc3QgZCBvZiBhbGxEaWZmcykge1xuICAgICAgbGV0IGVudHJ5ID0gYnlQYXRoLmdldChkLnBhdGgpXG4gICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgIGVudHJ5ID0geyBwYXRoOiBkLnBhdGgsIHRvb2wsIGh1bmtzOiBbXSwgaGFzRGlmZjogdHJ1ZSB9XG4gICAgICAgIGJ5UGF0aC5zZXQoZC5wYXRoLCBlbnRyeSlcbiAgICAgIH1cbiAgICAgIGVudHJ5Lmh1bmtzLnB1c2goeyBvbGRUZXh0OiBkLm9sZFRleHQsIG5ld1RleHQ6IGQubmV3VGV4dCB9KVxuICAgIH1cbiAgICByZXR1cm4gWy4uLmJ5UGF0aC52YWx1ZXMoKV1cbiAgfVxuICBjb25zdCBwYXRoID0gbXV0YXRpb25QYXRoKHRvb2wsIGNhbGwuYXJnc1JhdylcbiAgcmV0dXJuIHBhdGggPyBbeyBwYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IGZhbHNlIH1dIDogW11cbn1cblxuLyoqIFBsYWluIHRleHQgb2YgYSB1c2VyIG1lc3NhZ2UgKGNvbnRlbnQgYmxvY2tzIG9mIHR5cGUgJ3RleHQnKS4gKi9cbmZ1bmN0aW9uIHVzZXJUZXh0KG5vZGU6IFVzZXJNZXNzYWdlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2Ygbm9kZS5jb250ZW50KSB7XG4gICAgaWYgKGJsb2NrICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcgJiYgKGJsb2NrIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiAoYmxvY2sgYXMgeyB0ZXh0PzogdW5rbm93biB9KS50ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgcGFydHMucHVzaCgoYmxvY2sgYXMgeyB0ZXh0OiBzdHJpbmcgfSkudGV4dClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG59XG5cbi8qKiBXYWxrIHRoZSBjb252ZXJzYXRpb24gbm9kZXMgYW5kIGdyb3VwIGNoYW5nZWQgZmlsZXMgYnkgdXNlciByb3VuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0U2Vzc2lvblJvdW5kcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogU2Vzc2lvblJvdW5kW10ge1xuICBjb25zdCByb3VuZHM6IFNlc3Npb25Sb3VuZFtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IFNlc3Npb25Sb3VuZCB8IG51bGwgPSBudWxsXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgPT09ICd1c2VyJykge1xuICAgICAgY3VycmVudCA9IHsgcm91bmQ6IHJvdW5kcy5sZW5ndGggKyAxLCBsYWJlbDogdXNlclRleHQobm9kZSkuc2xpY2UoMCwgNjApLCBjaGFuZ2VzOiBbXSB9XG4gICAgICByb3VuZHMucHVzaChjdXJyZW50KVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCAhY3VycmVudCB8fCAhbm9kZS5jYWxsKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnQuY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IGNoYW5nZS5wYXRoICYmIGMudG9vbCA9PT0gY2hhbmdlLnRvb2wpXG4gICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgaWYgKGNoYW5nZS5oYXNEaWZmKSB7XG4gICAgICAgICAgZXhpc3RpbmcuaHVua3MucHVzaCguLi5jaGFuZ2UuaHVua3MpXG4gICAgICAgICAgZXhpc3RpbmcuaGFzRGlmZiA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudC5jaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm91bmRzLmZpbHRlcigocikgPT4gci5jaGFuZ2VzLmxlbmd0aCA+IDApXG59XG5cbi8qKiBDb3VudCBvZiBjaGFuZ2VkIGZpbGVzIGFjcm9zcyBhbGwgcm91bmRzIChmb3IgdGhlIGhlYWRlciBiYWRnZSkuICovXG5leHBvcnQgZnVuY3Rpb24gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogbnVtYmVyIHtcbiAgbGV0IGNvdW50ID0gMFxuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCAhbm9kZS5jYWxsKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBrZXkgPSBgJHtjaGFuZ2UudG9vbH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICBpZiAoIXNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgc2Vlbi5hZGQoa2V5KVxuICAgICAgICBjb3VudCsrXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudFxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERpZmYgcmVuZGVyaW5nLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBTcGxpdCBvbmUgYGdpdCBzaG93IC0tZm9ybWF0PWAgZGlmZiBpbnRvIHBlci1maWxlIHNlZ21lbnRzLiAqL1xuZnVuY3Rpb24gc3BsaXRDb21taXREaWZmKGRpZmY6IHN0cmluZyk6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmcgfVtdIHtcbiAgY29uc3Qgc2VnbWVudHM6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBwYXRoOiBzdHJpbmc7IHRleHQ6IHN0cmluZ1tdIH0gfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IGxpbmUgb2YgZGlmZi5zcGxpdCgnXFxuJykpIHtcbiAgICBjb25zdCBtYXRjaCA9IC9eZGlmZiAtLWdpdCBhXFwvKC4qPykgYlxcLy8uZXhlYyhsaW5lKVxuICAgIGlmIChtYXRjaCkge1xuICAgICAgaWYgKGN1cnJlbnQpIHNlZ21lbnRzLnB1c2goY3VycmVudClcbiAgICAgIGN1cnJlbnQgPSB7IHBhdGg6IG1hdGNoWzFdLCB0ZXh0OiBbbGluZV0gfVxuICAgIH0gZWxzZSBpZiAoY3VycmVudCkge1xuICAgICAgY3VycmVudC50ZXh0LnB1c2gobGluZSlcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnQpIHNlZ21lbnRzLnB1c2goY3VycmVudClcbiAgcmV0dXJuIHNlZ21lbnRzLm1hcCgocykgPT4gKHsgcGF0aDogcy5wYXRoLCB0ZXh0OiBzLnRleHQuam9pbignXFxuJykgfSkpXG59XG5cbi8qKiBTdGF0dXMgbGV0dGVyIGZvciBhIGNvbW1pdCdzIGZpbGUsIGRlcml2ZWQgZnJvbSBpdHMgZGlmZiBzZWdtZW50IHRleHQuICovXG5mdW5jdGlvbiBjb21taXRGaWxlU3RhdHVzKHNlZ21lbnRUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoL15uZXcgZmlsZSBtb2RlLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdBJ1xuICBpZiAoL15kZWxldGVkIGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnRCdcbiAgaWYgKC9ecmVuYW1lIGZyb20gLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdSJ1xuICByZXR1cm4gJ00nXG59XG5cbnR5cGUgRGlmZlJvdyA9IHsga2luZDogJ2FkZCcgfCAnZGVsJyB8ICdjdHgnIHwgJ2h1bmsnIHwgJ2ZpbGUnIHwgJ25vdGUnOyB0ZXh0OiBzdHJpbmcgfVxuXG4vKiogQ2xhc3NpZnkgcmF3IHVuaWZpZWQtZGlmZiB0ZXh0IChnaXQgb3V0cHV0KSBpbnRvIHJvd3MuICovXG5mdW5jdGlvbiBnaXREaWZmUm93cyhkaWZmOiBzdHJpbmcpOiBEaWZmUm93W10ge1xuICByZXR1cm4gZGlmZi5zcGxpdCgnXFxuJykubWFwKChsaW5lKSA9PiB7XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKysrJykgfHwgbGluZS5zdGFydHNXaXRoKCctLS0nKSkgcmV0dXJuIHsga2luZDogJ2ZpbGUnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdAQCcpKSByZXR1cm4geyBraW5kOiAnaHVuaycgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysnKSkgcmV0dXJuIHsga2luZDogJ2FkZCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkgcmV0dXJuIHsga2luZDogJ2RlbCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ1xcXFwgJykpIHJldHVybiB7IGtpbmQ6ICdub3RlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgcmV0dXJuIHsga2luZDogJ2N0eCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICB9KVxufVxuXG4vKiogQ29tcHV0ZSBhZGQvZGVsL2N0eCByb3dzIGJldHdlZW4gdHdvIHRleHRzICh0aGUgdG9vbHMnIEZpbGVEaWZmIHNoYXBlKS4gKi9cbmZ1bmN0aW9uIHRleHREaWZmUm93cyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBEaWZmUm93W10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm93c1xufVxuXG4vKiogQWxsIHJvd3MgZm9yIG9uZSByb3VuZCBjaGFuZ2UgKG11bHRpcGxlIGh1bmtzIGdldCBgQEBgIHNlcGFyYXRvcnMpLiAqL1xuZnVuY3Rpb24gY2hhbmdlUm93cyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogRGlmZlJvd1tdIHtcbiAgaWYgKCFjaGFuZ2UuaGFzRGlmZiB8fCBjaGFuZ2UuaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgY2hhbmdlLmh1bmtzLmZvckVhY2goKGh1bmssIGkpID0+IHtcbiAgICBpZiAoY2hhbmdlLmh1bmtzLmxlbmd0aCA+IDEpIHJvd3MucHVzaCh7IGtpbmQ6ICdodW5rJywgdGV4dDogYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgfSlcbiAgICByb3dzLnB1c2goLi4udGV4dERpZmZSb3dzKGh1bmsub2xkVGV4dCwgaHVuay5uZXdUZXh0KSlcbiAgfSlcbiAgcmV0dXJuIHJvd3Ncbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTcGxpdCAodHdvLWNvbHVtbikgZGlmZiB2aWV3LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYWxpZ25lZCByb3cgb2YgdGhlIHNpZGUtYnktc2lkZSB2aWV3LiAqL1xuaW50ZXJmYWNlIFNwbGl0Um93IHtcbiAgbGVmdDogc3RyaW5nXG4gIHJpZ2h0OiBzdHJpbmdcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG9sZCBmaWxlLCBvciBudWxsIChwdXJlIGFkZGl0aW9uKS4gKi9cbiAgbGVmdE51bTogbnVtYmVyIHwgbnVsbFxuICAvKiogMS1iYXNlZCBsaW5lIG51bWJlciBpbiB0aGUgbmV3IGZpbGUsIG9yIG51bGwgKHB1cmUgZGVsZXRpb24pLiAqL1xuICByaWdodE51bTogbnVtYmVyIHwgbnVsbFxuICBraW5kOiAnY3R4JyB8ICdjaGFuZ2UnXG59XG5cbi8qKiBPbmUgc2lkZS1ieS1zaWRlIGJsb2NrIChhIGh1bmsgd2l0aCBpdHMgYEBAYCBoZWFkZXIpLiAqL1xuaW50ZXJmYWNlIFNwbGl0QmxvY2sge1xuICBoZWFkOiBzdHJpbmcgfCBudWxsXG4gIHJvd3M6IFNwbGl0Um93W11cbn1cblxuLyoqXG4gKiBQYWlyIGFkZC9kZWwgcm93cyBpbnRvIGFsaWduZWQgbGVmdC9yaWdodCBjb2x1bW5zLiBSZW1vdmVkIGxpbmVzIGJ1ZmZlclxuICogdW50aWwgdGhlIG1hdGNoaW5nIGFkZGl0aW9ucyBhcnJpdmUgKHVuaWZpZWQgZGlmZiBvcmRlcnMgZGVsZXRpb25zIGJlZm9yZVxuICogYWRkaXRpb25zKSwgc28gcHVyZSBkZWxldGlvbnMgYW5kIHB1cmUgYWRkaXRpb25zIHN0aWxsIGdldCB0aGVpciBvd24gcm93XG4gKiB3aXRoIGFuIGVtcHR5IGNlbGwgb24gdGhlIG9wcG9zaXRlIHNpZGUuIExpbmUgbnVtYmVycyB0cmFjayBmcm9tIHRoZSBodW5rXG4gKiBoZWFkZXIncyBgLWEsYiArYyxkYCBwb3NpdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIHBhaXJSb3dzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IFNwbGl0Um93W10ge1xuICBjb25zdCBvdXQ6IFNwbGl0Um93W10gPSBbXVxuICBsZXQgb2xkTGluZSA9IG9sZFN0YXJ0XG4gIGxldCBuZXdMaW5lID0gbmV3U3RhcnRcbiAgbGV0IHBlbmRpbmc6IHsgdGV4dDogc3RyaW5nOyBudW06IG51bWJlciB9W10gPSBbXVxuICBjb25zdCBmbHVzaCA9ICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGVuZGluZykgb3V0LnB1c2goeyBsZWZ0OiBwLnRleHQsIHJpZ2h0OiAnJywgbGVmdE51bTogcC5udW0sIHJpZ2h0TnVtOiBudWxsLCBraW5kOiAnY2hhbmdlJyB9KVxuICAgIHBlbmRpbmcgPSBbXVxuICB9XG4gIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSB7XG4gICAgICBwZW5kaW5nLnB1c2goeyB0ZXh0OiByb3cudGV4dC5zbGljZSgxKSwgbnVtOiBvbGRMaW5lKysgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnYWRkJykge1xuICAgICAgY29uc3QgcCA9IHBlbmRpbmcuc2hpZnQoKVxuICAgICAgb3V0LnB1c2goeyBsZWZ0OiBwPy50ZXh0ID8/ICcnLCByaWdodDogcm93LnRleHQuc2xpY2UoMSksIGxlZnROdW06IHA/Lm51bSA/PyBudWxsLCByaWdodE51bTogbmV3TGluZSsrLCBraW5kOiAnY2hhbmdlJyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdjdHgnKSB7XG4gICAgICBmbHVzaCgpXG4gICAgICAvLyBVbmlmaWVkLWRpZmYgY29udGV4dCBsaW5lcyBjYXJyeSBhIGxlYWRpbmcgc3BhY2UgXHUyMDE0IHN0cmlwIGl0IGZvciB0aGVcbiAgICAgIC8vIHNwbGl0IGNlbGxzIHNvIGJvdGggY29sdW1ucyByZW5kZXIgYmFyZSB0ZXh0LlxuICAgICAgY29uc3QgdGV4dCA9IHJvdy50ZXh0LnN0YXJ0c1dpdGgoJyAnKSA/IHJvdy50ZXh0LnNsaWNlKDEpIDogcm93LnRleHRcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogdGV4dCwgcmlnaHQ6IHRleHQsIGxlZnROdW06IG9sZExpbmUrKywgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2N0eCcgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZmx1c2goKSAvLyBub3RlcyAoXFwgTm8gbmV3bGluZVx1MjAyNikgYW5kIHN0cmF5IHJvd3M6IGp1c3QgYnJlYWsgdGhlIHBhaXJpbmdcbiAgICB9XG4gIH1cbiAgZmx1c2goKVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBQYXJzZSBnaXQgdW5pZmllZCBkaWZmIHRleHQgaW50byBibG9ja3MgKGAtLS0vKysrYCBmaWxlIHJvd3MgYW5kIGBAQGAgaHVua3MpLiAqL1xuY29uc3QgR0lUX01FVEEgPSAvXihkaWZmIC0tZ2l0IHxpbmRleCB8bmV3IGZpbGUgfGRlbGV0ZWQgZmlsZSB8b2xkIG1vZGUgfG5ldyBtb2RlIHxzaW1pbGFyaXR5IGluZGV4IHxyZW5hbWUgKGZyb218dG8pIHxCaW5hcnkgZmlsZXMgKS9cblxuZnVuY3Rpb24gcGFyc2VHaXRCbG9ja3MoZGlmZjogc3RyaW5nKTogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH1bXSB7XG4gIGNvbnN0IGJsb2NrczogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH1bXSA9IFtdXG4gIGxldCBjdXJyZW50OiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfSB8IG51bGwgPSBudWxsXG4gIGNvbnN0IGxpbmVzID0gZGlmZi5zcGxpdCgnXFxuJylcbiAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBsZXQga2luZDogRGlmZlJvd1sna2luZCddXG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKysrJykgfHwgbGluZS5zdGFydHNXaXRoKCctLS0nKSB8fCBHSVRfTUVUQS50ZXN0KGxpbmUpKSBraW5kID0gJ2ZpbGUnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdAQCcpKSBraW5kID0gJ2h1bmsnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIGtpbmQgPSAnYWRkJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnLScpKSBraW5kID0gJ2RlbCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ1xcXFwgJykpIGtpbmQgPSAnbm90ZSdcbiAgICBlbHNlIGtpbmQgPSAnY3R4J1xuICAgIGlmIChraW5kID09PSAnZmlsZScgfHwga2luZCA9PT0gJ2h1bmsnKSB7XG4gICAgICBjdXJyZW50ID0geyBoZWFkOiB7IGtpbmQsIHRleHQ6IGxpbmUgfSwgcm93czogW10gfVxuICAgICAgYmxvY2tzLnB1c2goY3VycmVudClcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnQgPSB7IGhlYWQ6IG51bGwsIHJvd3M6IFtdIH1cbiAgICAgICAgYmxvY2tzLnB1c2goY3VycmVudClcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQucm93cy5wdXNoKHsga2luZCwgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gYmxvY2tzXG59XG5cbi8qKiBIdW5rIHN0YXJ0IHBvc2l0aW9ucyBmcm9tIGEgYEBAIC1hLGIgK2MsZCBAQGAgaGVhZGVyLiAqL1xuZnVuY3Rpb24gaHVua1N0YXJ0cyhoZWFkOiBzdHJpbmcpOiB7IG9sZFN0YXJ0OiBudW1iZXI7IG5ld1N0YXJ0OiBudW1iZXIgfSB7XG4gIGNvbnN0IG0gPSAvXkBAIC0oXFxkKykoPzosXFxkKyk/IFxcKyhcXGQrKS8uZXhlYyhoZWFkKVxuICByZXR1cm4geyBvbGRTdGFydDogbSA/IE51bWJlcihtWzFdKSA6IDEsIG5ld1N0YXJ0OiBtID8gTnVtYmVyKG1bMl0pIDogMSB9XG59XG5cbi8qKiBTaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBhIGdpdCB1bmlmaWVkIGRpZmYgKHNraXBzIHB1cmUgZmlsZS1oZWFkZXIgYmxvY2tzKS4gKi9cbmZ1bmN0aW9uIGdpdFNwbGl0QmxvY2tzKGRpZmY6IHN0cmluZyk6IFNwbGl0QmxvY2tbXSB7XG4gIHJldHVybiBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICAgIC5maWx0ZXIoKGIpID0+IGIuaGVhZD8ua2luZCAhPT0gJ2ZpbGUnICYmIChiLnJvd3MubGVuZ3RoID4gMCB8fCBiLmhlYWQ/LmtpbmQgPT09ICdodW5rJykpXG4gICAgLm1hcCgoYikgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRzID0gYi5oZWFkID8gaHVua1N0YXJ0cyhiLmhlYWQudGV4dCkgOiB7IG9sZFN0YXJ0OiAxLCBuZXdTdGFydDogMSB9XG4gICAgICByZXR1cm4geyBoZWFkOiBiLmhlYWQ/LmtpbmQgPT09ICdodW5rJyA/IGIuaGVhZC50ZXh0IDogbnVsbCwgcm93czogcGFpclJvd3MoYi5yb3dzLCBzdGFydHMub2xkU3RhcnQsIHN0YXJ0cy5uZXdTdGFydCkgfVxuICAgIH0pXG59XG5cbi8qKiBTaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciB0aGUgdG9vbHMnIEZpbGVEaWZmIHNoYXBlIChvbGRUZXh0L25ld1RleHQpLiAqL1xuZnVuY3Rpb24gdGV4dFNwbGl0QmxvY2tzKG9sZFRleHQ6IHN0cmluZyB8IG51bGwsIG5ld1RleHQ6IHN0cmluZyk6IFNwbGl0QmxvY2tbXSB7XG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMob2xkVGV4dCA/PyAnJywgbmV3VGV4dCkpIHtcbiAgICBjb25zdCBsaW5lcyA9IHBhcnQudmFsdWUuc3BsaXQoJ1xcbicpXG4gICAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgaWYgKHBhcnQuYWRkZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdhZGQnLCB0ZXh0OiBgKyR7bGluZX1gIH0pXG4gICAgICBlbHNlIGlmIChwYXJ0LnJlbW92ZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdkZWwnLCB0ZXh0OiBgLSR7bGluZX1gIH0pXG4gICAgICBlbHNlIHJvd3MucHVzaCh7IGtpbmQ6ICdjdHgnLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBbeyBoZWFkOiBudWxsLCByb3dzOiBwYWlyUm93cyhyb3dzLCAxLCAxKSB9XVxufVxuXG4vKiogQWxsIHNpZGUtYnktc2lkZSBibG9ja3MgZm9yIG9uZSByb3VuZCBjaGFuZ2UuICovXG5mdW5jdGlvbiBjaGFuZ2VTcGxpdEJsb2NrcyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogU3BsaXRCbG9ja1tdIHtcbiAgaWYgKCFjaGFuZ2UuaGFzRGlmZiB8fCBjaGFuZ2UuaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgcmV0dXJuIGNoYW5nZS5odW5rcy5tYXAoKGh1bmssIGkpID0+ICh7XG4gICAgaGVhZDogY2hhbmdlLmh1bmtzLmxlbmd0aCA+IDEgPyBgQEAgaHVuayAke2kgKyAxfS8ke2NoYW5nZS5odW5rcy5sZW5ndGh9IEBAYCA6IG51bGwsXG4gICAgcm93czogdGV4dFNwbGl0QmxvY2tzKGh1bmsub2xkVGV4dCwgaHVuay5uZXdUZXh0KVswXS5yb3dzLFxuICB9KSlcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTdHlsZXMgKGRzZHItKjsgdGhlIGhlYWRlciB0cmlnZ2VyIG1pcnJvcnMgdGhlIGluLXRyZWUgYWN0aW9uIHJvd3MpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IFJFVklFV19DU1MgPSBgXG4uZHNkci10cmlnZ2Vye21pbi1oZWlnaHQ6MjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NHB4O3BhZGRpbmc6M3B4IDZweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItdHJpZ2dlcjpob3ZlciwuZHNkci10cmlnZ2VyOmZvY3VzLXZpc2libGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1sYWJlbHttYXJnaW4tbGVmdDoycHh9XG4uZHNkci1jb3VudHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtib3JkZXItcmFkaXVzOjk5OXB4O21pbi13aWR0aDoxNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDVweDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1vdmVybGF5e3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7ei1pbmRleDoyMDA7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLC40NSk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MzJweH1cbi5kc2RyLXBhbmVse2JveC1zaXppbmc6Ym9yZGVyLWJveDtwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDptaW4oMTEyMHB4LDEwMCUpO2hlaWdodDptaW4oNzIwcHgsY2FsYygxMDB2aCAtIDY0cHgpKTttYXgtd2lkdGg6Y2FsYygxMDB2dyAtIDY0cHgpO21heC1oZWlnaHQ6Y2FsYygxMDB2aCAtIDY0cHgpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjE0cHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1yZXNpemV7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDo1fVxuLmRzZHItcmVzaXplLWV7dG9wOjA7cmlnaHQ6LTNweDt3aWR0aDo3cHg7aGVpZ2h0OjEwMCU7Y3Vyc29yOmV3LXJlc2l6ZX1cbi5kc2RyLXJlc2l6ZS1ze2JvdHRvbTotM3B4O2xlZnQ6MDt3aWR0aDoxMDAlO2hlaWdodDo3cHg7Y3Vyc29yOm5zLXJlc2l6ZX1cbi5kc2RyLXJlc2l6ZS1zZXtyaWdodDotNHB4O2JvdHRvbTotNHB4O3dpZHRoOjE1cHg7aGVpZ2h0OjE1cHg7Y3Vyc29yOm53c2UtcmVzaXplfVxuLmRzZHItaGVhZGVye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzoxMnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItdGl0bGV7Zm9udC1zaXplOjE0cHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXN1YnRpdGxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEycHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci10YWJze2Rpc3BsYXk6ZmxleDtnYXA6NHB4O21hcmdpbi1sZWZ0OjE0cHh9XG4uZHNkci10YWJ7Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjZweDtib3JkZXI6MXB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjJweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItdGFiOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdGFiLWFjdGl2ZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNwYWNlcntmbGV4OjF9XG4uZHNkci1idG57Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzozcHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnRuOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1idG46ZGlzYWJsZWR7b3BhY2l0eTouNTtjdXJzb3I6ZGVmYXVsdH1cbi5kc2RyLWJ0bi1wcmltYXJ5e2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTQwMCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tZGFuZ2VyOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1jb25maXJte2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1idG4tY29uZmlybTpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTUwKX1cbi5kc2RyLWNvbW1pdC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MjAwcHg7bWluLWhlaWdodDoyOHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci1jb21taXQtaW5wdXQ6OnBsYWNlaG9sZGVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1jYXB0aW9uKX1cbi5kc2RyLWNvbW1pdC1pbnB1dDpmb2N1c3tvdXRsaW5lOm5vbmU7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KX1cbi5kc2RyLXNlY3Rpb257Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6MTBweCA4cHggM3B4O2ZvbnQtd2VpZ2h0OjYwMDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHh9XG4uZHNkci1zZWN0aW9uOmZpcnN0LWNoaWxke3BhZGRpbmctdG9wOjRweH1cbi5kc2RyLWJyYW5jaHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo0cHggOHB4IDhweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLWJyYW5jaC1yZWZ7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO21pbi13aWR0aDowO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHh9XG4uZHNkci1icmFuY2gtYXJyb3d7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWJyYW5jaC1zdGF0e2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7Zm9udC1zaXplOjExcHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItYnJhbmNoLWFoZWFke2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItYnJhbmNoLWJlaGluZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtd2Fybi1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1zeW5je2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItY29tbWl0e2ZsZXg6MTttaW4td2lkdGg6MDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo1cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jb21taXQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItdGwtc2VsZWN0ZWQgLmRzZHItY29tbWl0e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRpbWVsaW5le2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci10bC1pdGVte2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2FsaWduLWl0ZW1zOnN0cmV0Y2g7Ym9yZGVyLXJhZGl1czo4cHh9XG4uZHNkci10bC1yYWlse3Bvc2l0aW9uOnJlbGF0aXZlO2ZsZXg6bm9uZTt3aWR0aDoxNHB4O2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyfVxuLmRzZHItdGwtcmFpbDo6YmVmb3Jle2NvbnRlbnQ6XCJcIjtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MDtib3R0b206MDtsZWZ0OjUwJTt3aWR0aDoxcHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKX1cbi5kc2RyLXRsLWl0ZW06Zmlyc3QtY2hpbGQgLmRzZHItdGwtcmFpbDo6YmVmb3Jle3RvcDo5cHh9XG4uZHNkci10bC1pdGVtOmxhc3QtY2hpbGQgLmRzZHItdGwtcmFpbDo6YmVmb3Jle2JvdHRvbTphdXRvO2hlaWdodDo5cHh9XG4uZHNkci10bC1kb3R7cG9zaXRpb246cmVsYXRpdmU7ei1pbmRleDoxO3RvcDo5cHg7ZmxleDpub25lO3dpZHRoOjdweDtoZWlnaHQ6N3B4O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSl9XG4uZHNkci10bC1kb3QtbG9jYWx7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWRvdC1yZW1vdGV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItY29tbWl0LWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21pbi13aWR0aDowfVxuLmRzZHItY29tbWl0LXNob3J0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LXN1YmplY3R7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWNvbW1pdC1tZXRhe2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZy1sZWZ0OjB9XG4uZHNkci10bC1iYWRnZXtmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDtib3JkZXItcmFkaXVzOjRweDtwYWRkaW5nOjAgNXB4fVxuLmRzZHItdGwtYmFkZ2UtbG9jYWx7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdGwtYmFkZ2UtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1kaWZmLWhhc2h7bWFyZ2luLWxlZnQ6OHB4O2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jb21taXQtZmlsZS1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci1jb21taXQtZmlsZS1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTttYXJnaW4tbGVmdDo0cHh9XG4uZHNkci1ib2R5e2Rpc3BsYXk6ZmxleDtmbGV4OjE7bWluLWhlaWdodDowfVxuLmRzZHItZmlsZXN7d2lkdGg6MzAwcHg7ZmxleDpub25lO2JvcmRlci1yaWdodDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7b3ZlcmZsb3cteTphdXRvO3BhZGRpbmc6OHB4fVxuLmRzZHItcm91bmR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6OHB4IDhweCAzcHg7Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItcm91bmQtbGFiZWx7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjQwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWZpbGV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmlsZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1maWxlLXNlbGVjdGVke2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWRpcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzo1cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLWRpcjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZGlyLWNhcmV0e2ZsZXg6bm9uZTt3aWR0aDoxMnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1kaXItbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjYwMH1cbi5kc2RyLWRpci1jb3VudHtmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1maWxlLW5hbWV7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbjtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbGUtc3RhdHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1jaGlwe2ZsZXg6bm9uZTttaW4td2lkdGg6MjJweDt0ZXh0LWFsaWduOmNlbnRlcjtib3JkZXItcmFkaXVzOjVweDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jaGlwLW17YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOiMyZWEwNDN9XG4uZHNkci1jaGlwLWF7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOiMyZWEwNDN9XG4uZHNkci1jaGlwLWR7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTYpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1jaGlwLXJ7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KTtjb2xvcjojNThhNmZmfVxuLmRzZHItY2hpcC11e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci10b29se2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZGlmZntmbGV4OjE7bWluLXdpZHRoOjA7b3ZlcmZsb3c6YXV0bztwYWRkaW5nOjEwcHggMH1cbi5kc2RyLWRpZmYtZW1wdHl7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2hlaWdodDoxMDAlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1kaWZmLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjZweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLWRpZmYtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTNweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWRpZmYtc3RhdHN7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7ZmxleDpub25lfVxuLmRzZHItZGlmZi1zY3JvbGx7ZmxleDoxO21pbi1oZWlnaHQ6MDtvdmVyZmxvdzphdXRvO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLXByZXttYXJnaW46MDtwYWRkaW5nOjhweCAwO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCk7d2hpdGUtc3BhY2U6cHJlO21pbi13aWR0aDoxMDAlO2ZsZXg6MX1cbi5kc2RyLWxpbmV7ZGlzcGxheTpmbGV4O3BhZGRpbmc6MCAxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWxpbmUtYWRke2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjEzKX1cbi5kc2RyLWxpbmUtZGVse2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjEyKX1cbi5kc2RyLWxpbmUtaHVua3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1maWxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLW5vdGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXN0eWxlOml0YWxpY31cbi5kc2RyLWZvb3R7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZTttaW4taGVpZ2h0OjM2cHh9XG4uZHNkci1ub3RpY2V7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1ub3RpY2Utb2t7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1ub3RpY2UtZXJyb3J7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItc3Bpbm5lcntmbGV4Om5vbmU7d2lkdGg6MTJweDtoZWlnaHQ6MTJweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci10b3AtY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7YW5pbWF0aW9uOmRzZHItc3BpbiAuOHMgbGluZWFyIGluZmluaXRlfVxuQGtleWZyYW1lcyBkc2RyLXNwaW57dG97dHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX1cbi5kc2RyLWVtcHR5e3BhZGRpbmc6NDBweDt0ZXh0LWFsaWduOmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4fVxuLmRzZHItbm9kaWZme3BhZGRpbmc6OHB4IDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLXNldC1yb3d7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MTBweDtwYWRkaW5nOjE2cHggMH1cbi5kc2RyLXNldC10aXRsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Zm9udC1zaXplOjE0cHg7Zm9udC13ZWlnaHQ6NDAwO2xpbmUtaGVpZ2h0OjIycHh9XG4uZHNkci1zZXQtZ3JpZHtkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjEycHh9XG4uZHNkci1zZXQtZmllbGR7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEycHh9XG4uZHNkci1zZWx7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXNlbC10cmlnZ2Vye2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4td2lkdGg6MTgwcHg7bWluLWhlaWdodDoyOHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MnB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4fVxuLmRzZHItc2VsLXRyaWdnZXI6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItc2VsLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtvdXRsaW5lOjFweCBzb2xpZCB2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTQwMCl9XG4uZHNkci1zZWwtdHJpZ2dlciBzdmd7ZmxleDpub25lO3RyYW5zaXRpb246dHJhbnNmb3JtIC4xMnN9XG4uZHNkci1zZWwtdHJpZ2dlclthcmlhLWV4cGFuZGVkPVwidHJ1ZVwiXSBzdmd7dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItc2VsLXZhbHVle2ZsZXg6MTttaW4td2lkdGg6MDt0ZXh0LWFsaWduOmxlZnQ7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItc2VsLW1lbnV7ei1pbmRleDoyMDA7Ym94LXNpemluZzpib3JkZXItYm94O21pbi13aWR0aDoxMDAlO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7Ym9yZGVyLXJhZGl1czoxMHB4O21hcmdpbjowO3BhZGRpbmc6NHB4O2xpc3Qtc3R5bGU6bm9uZTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoxcHg7cG9zaXRpb246YWJzb2x1dGU7dG9wOmNhbGMoMTAwJSArIDVweCk7bGVmdDowfVxuLmRzZHItc2VsLW9wdGlvbntib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjMwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JvcmRlci1yYWRpdXM6N3B4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NXB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDt0ZXh0LWFsaWduOmxlZnQ7ZGlzcGxheTpmbGV4fVxuLmRzZHItc2VsLW9wdGlvbjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1zZWwtb3B0aW9uLWFjdGl2ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZWwtb3B0aW9uLW1hcmt7ZmxleDpub25lO3dpZHRoOjE0cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbGFiZWx7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXZpZXctdG9nZ2xle2Rpc3BsYXk6ZmxleDtnYXA6MnB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzoycHg7ZmxleDpub25lfVxuLmRzZHItdmlldy1idG57Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjJweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjVweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoxcHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4fVxuLmRzZHItdmlldy1idG46aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci12aWV3LWJ0bi1hY3RpdmV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNwbGl0e21pbi13aWR0aDoxMDAlfVxuLmRzZHItc3BsaXQtaGVhZHtkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6NHB4IDhweDtwb3NpdGlvbjpzdGlja3k7dG9wOjA7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKX1cbi5kc2RyLXNwbGl0LWhlYWQgZGl2e2Rpc3BsYXk6ZmxleDtnYXA6OHB4fVxuLmRzZHItc3BsaXQtaHVua3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjJweCAxNnB4fVxuLmRzZHItc3BsaXQtcm93e2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZTp2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtY2VsbHtkaXNwbGF5OmZsZXg7Z2FwOjhweDtwYWRkaW5nOjAgOHB4O3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXQtbnVte2ZsZXg6bm9uZTt3aWR0aDozNnB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZTpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSAtIDFweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjB9XG4uZHNkci1jZWxsLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1jZWxsLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1jZWxsLWRpbXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwxLCByZ2JhKDEyOCwxMjgsMTI4LC4wNSkpfVxuYFxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc3R5bGVbZGF0YS1wbHVnaW4tY3NzPSR7SlNPTi5zdHJpbmdpZnkoU1RZTEVfVEFHKX1dYCkgPT09IG51bGwpIHtcbiAgY29uc3QgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICB0YWcuZGF0YXNldC5wbHVnaW4gPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldydcbiAgdGFnLmRhdGFzZXQucGx1Z2luQ3NzID0gU1RZTEVfVEFHXG4gIHRhZy50ZXh0Q29udGVudCA9IFJFVklFV19DU1NcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpXG59XG5cbi8qKiBTaW1wbGlmaWVkIENoaW5lc2UgZGljdGlvbmFyeSAoa2V5LXNldCBzb3VyY2Ugb2YgdHJ1dGgpLiAqL1xuY29uc3QgemggPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1x1NUJBMVx1NjdFNVx1NUY1M1x1NTI0RFx1OTg3OVx1NzZFRVx1NEUwRVx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOScsXG4gICd0YWIuc2Vzc2lvbic6ICdcdTRGMUFcdThCRERcdTY2RjRcdTY1MzknLFxuICAndGFiLndvcmtzcGFjZSc6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAncmV2aWV3LnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdyZXZpZXcuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnXHU2RTM4XHU3OUJCIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnXHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHU0RTBEXHU2NjJGIGdpdCBcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1x1MzAwQ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOVx1MzAwRFx1OTg3NVx1N0I3RVx1NEUwRFx1NTNEN1x1NUY3MVx1NTRDRFx1RkYwQ1x1NEVDRFx1NTNFRlx1NjdFNVx1NzcwQlx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOVx1MzAwMicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdcdThGRDlcdTRFMkFcdTRGMUFcdThCRERcdThGRDhcdTZDQTFcdTY3MDlcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzlcdThCQjBcdTVGNTUnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSBcdThGNkUgXHUwMEI3IHtmaWxlc30gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdcdTdCMkMge3JvdW5kfSBcdThGNkUnLFxuICAncmV2aWV3LmVtcHR5JzogJ1x1NkNBMVx1NjcwOVx1NjcyQVx1NjNEMFx1NEVBNFx1NzY4NFx1NjZGNFx1NjUzOSBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdcdTUxNjhcdTkwRThcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnXHU2M0QwXHU0RUE0XHU4QkY0XHU2NjBFXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1x1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnXHU1REYyXHU2M0QwXHU0RUE0IHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ1x1NjNEMFx1NEVBNFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucHVzaGVkJzogJ1x1NURGMlx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdcdTYzQThcdTkwMDFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFoZWFkJzogJ1x1OTg4Nlx1NTE0OCB7bn0nLFxuICAncmV2aWV3LmJlaGluZCc6ICdcdTg0M0RcdTU0MEUge259JyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ1x1NTIwNlx1NjUyRlx1NEUwRVx1OEZEQ1x1N0EwQicsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdcdTY3MkFcdThCQkVcdTdGNkVcdTRFMEFcdTZFMzhcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnXHU1Mzg2XHU1M0YyJyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdcdTUzRDhcdTUyQThcdTY1ODdcdTRFRjYnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdcdTY3MkNcdTU3MzAnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAnXHU4RkRDXHU3QTBCJyxcbiAgJ3RpbWUubm93JzogJ1x1NTIxQVx1NTIxQScsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IFx1NTIwNlx1OTQ5Rlx1NTI0RCcsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBcdTVDMEZcdTY1RjZcdTUyNEQnLFxuICAndGltZS5kYXlzJzogJ3tufSBcdTU5MjlcdTUyNEQnLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnXHU1MjM3XHU2NUIwJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdcdTUxNzNcdTk1RUQnLFxuICAncmV2aWV3LmJ1c3knOiAnXHU1OTA0XHU3NDA2XHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ1x1NURGMnthY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICdcdTY3MkFcdThEREZcdThFMkEnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdcdTRFOENcdThGREJcdTUyMzYnLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnXHU4QkU1XHU0RkVFXHU2NTM5XHU2Q0ExXHU2NzA5IGRpZmYgXHU2NTcwXHU2MzZFJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnXHU1MzU1XHU2ODBGJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnXHU1M0NDXHU2ODBGJyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ1x1NTM5Rlx1NjU4N1x1NEVGNicsXG4gICd2aWV3LmFmdGVyJzogJ1x1NjVCMFx1NjU4N1x1NEVGNicsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdcdTUzRDhcdTUyQTgnLFxuICAnc2V0dGluZ3MuZm9udCc6ICdcdTVCNTdcdTRGNTMnLFxuICAnc2V0dGluZ3Muc2l6ZSc6ICdcdTVCNTdcdTUzRjcnLFxuICAnZm9udC5tb25vJzogJ1x1N0I0OVx1NUJCRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYwOScsXG4gICdmb250LnN5c3RlbSc6ICdcdTdDRkJcdTdFREZcdTVCNTdcdTRGNTMnLFxufSBhcyBjb25zdFxuXG4vKiogRW5nbGlzaCBkaWN0aW9uYXJ5LCBjaGVja2VkIGNvbXBsZXRlIGFnYWluc3QgdGhlIHpoIGtleSBzZXQuICovXG5jb25zdCBlbjogUmVjb3JkPGtleW9mIHR5cGVvZiB6aCwgc3RyaW5nPiA9IHtcbiAgJ2FjdGlvbi5sYWJlbCc6ICdDaGFuZ2VzJyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1JldmlldyB3b3Jrc3BhY2UgYW5kIHBlci1yb3VuZCBjaGFuZ2VzJyxcbiAgJ3RhYi5zZXNzaW9uJzogJ1Nlc3Npb24nLFxuICAndGFiLndvcmtzcGFjZSc6ICdXb3Jrc3BhY2UnLFxuICAncmV2aWV3LnRpdGxlJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdicmFuY2gnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ2RldGFjaGVkIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnVGhpcyBkaXJlY3RvcnkgaXMgbm90IGEgZ2l0IHJlcG9zaXRvcnknLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1RoZSBcIlNlc3Npb25cIiB0YWIgc3RpbGwgc2hvd3MgZXZlcnkgcm91bmRcXCdzIGNoYW5nZXMuJyxcbiAgJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBpbiB0aGlzIHNlc3Npb24geWV0JyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gcm91bmRzIFx1MDBCNyB7ZmlsZXN9IGZpbGVzJyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdSb3VuZCB7cm91bmR9JyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdObyB1bmNvbW1pdHRlZCBjaGFuZ2VzIFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ0ZhaWxlZCB0byBsb2FkJyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnQWNjZXB0JyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnQWNjZXB0IGFsbCcsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1JldmVydCBhbGwnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQgYWxsJyxcbiAgJ3Jldmlldy5jb21taXQnOiAnQ29tbWl0JyxcbiAgJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcic6ICdDb21taXQgbWVzc2FnZVx1MjAyNicsXG4gICdyZXZpZXcucHVzaCc6ICdQdXNoJyxcbiAgJ3Jldmlldy5jb25maXJtUHVzaCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHB1c2gnLFxuICAncmV2aWV3LmNvbW1pdHRlZCc6ICdDb21taXR0ZWQge3N1bW1hcnl9JyxcbiAgJ3Jldmlldy5jb21taXRGYWlsZWQnOiAnQ29tbWl0IGZhaWxlZCcsXG4gICdyZXZpZXcucHVzaGVkJzogJ1B1c2hlZCcsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdQdXNoIGZhaWxlZCcsXG4gICdyZXZpZXcuYWhlYWQnOiAne259IGFoZWFkJyxcbiAgJ3Jldmlldy5iZWhpbmQnOiAne259IGJlaGluZCcsXG4gICdyZXZpZXcuc2VjdGlvblN0YWdlZCc6ICdTdGFnZWQnLFxuICAncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LnNlY3Rpb25CcmFuY2gnOiAnQnJhbmNoIHZzIHJlbW90ZScsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdubyB1cHN0cmVhbScsXG4gICdyZXZpZXcuaGlzdG9yeSc6ICdIaXN0b3J5JyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdGaWxlcycsXG4gICdoaXN0b3J5LmxvY2FsJzogJ2xvY2FsJyxcbiAgJ2hpc3RvcnkucmVtb3RlJzogJ3JlbW90ZScsXG4gICd0aW1lLm5vdyc6ICdqdXN0IG5vdycsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IG1pbiBhZ28nLFxuICAndGltZS5ob3Vycyc6ICd7bn0gaCBhZ28nLFxuICAndGltZS5kYXlzJzogJ3tufSBkIGFnbycsXG4gICdyZXZpZXcucmVmcmVzaCc6ICdSZWZyZXNoJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdDbG9zZScsXG4gICdyZXZpZXcuYnVzeSc6ICdXb3JraW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ3thY3Rpb259IHtjb3VudH0gZmlsZXMnLFxuICAncmV2aWV3LmRvbmVPbmUnOiAne2FjdGlvbn0ge3BhdGh9JyxcbiAgJ3Jldmlldy5hY2NlcHRlZCc6ICdBY2NlcHRlZCcsXG4gICdyZXZpZXcucmV2ZXJ0ZWQnOiAnUmV2ZXJ0ZWQnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICd1bnRyYWNrZWQnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdiaW5hcnknLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnTm8gZGlmZiBkYXRhIGZvciB0aGlzIGNoYW5nZScsXG4gICdyZXZpZXcuY2hhbmdlcyc6ICd7YWRkZWR9KyB7ZGVsZXRlZH0tJyxcbiAgJ3ZpZXcuc2luZ2xlJzogJ1NpbmdsZScsXG4gICd2aWV3LnNwbGl0JzogJ1NwbGl0JyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ0JlZm9yZScsXG4gICd2aWV3LmFmdGVyJzogJ0FmdGVyJyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ0NoYW5nZXMnLFxuICAnc2V0dGluZ3MuZm9udCc6ICdGb250JyxcbiAgJ3NldHRpbmdzLnNpemUnOiAnRm9udCBzaXplJyxcbiAgJ2ZvbnQubW9ubyc6ICdNb25vc3BhY2UgKGRlZmF1bHQpJyxcbiAgJ2ZvbnQuc3lzdGVtJzogJ1N5c3RlbSBmb250Jyxcbn1cblxudHlwZSBEaWZmUmV2aWV3QWN0aW9uUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5zZXNzaW9uLmhlYWRlci5hY3Rpb25zJz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPlxudHlwZSBEaWZmUmV2aWV3T3ZlcmxheVByb3BzID0gUHJvcHNSdW50aW1lPCdzaGVsbC5vdmVybGF5Jz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPiAmIHsgc2Vzc2lvbnM6IElTZXNzaW9ucyB9XG5cbi8qKiBEaWZmIGljb24gKGx1Y2lkZSBmaWxlLWRpZmYpLiAqL1xuZnVuY3Rpb24gSWNvbkRpZmYoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE1IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY3WlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkgMTBoNlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTEyIDd2NlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkgMTdoNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvblgoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE4IDYgNiAxOFwiIC8+XG4gICAgICA8cGF0aCBkPVwibTYgNiAxMiAxMlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvblJlZnJlc2goKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjEzXCIgaGVpZ2h0PVwiMTNcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTIxIDEyYTkgOSAwIDEgMS05LTljMi41MiAwIDQuOTMgMSA2Ljc0IDIuNzRMMjEgOFwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTIxIDN2NWgtNVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNoZXZyb25Eb3duKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIm02IDkgNiA2IDYtNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNoZWNrKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyLjVcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTIwIDYgOSAxN2wtNS01XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG50eXBlIFZpZXdNb2RlID0gJ3NpbmdsZScgfCAnc3BsaXQnXG5cbi8qKiBcdTUzNTVcdTY4MEYgLyBcdTUzQ0NcdTY4MEYgc2VnbWVudGVkIHRvZ2dsZSAocGVyc2lzdGVkIGFjcm9zcyBvcGVucykuICovXG5mdW5jdGlvbiBEaWZmVmlld1RvZ2dsZSh7IHZpZXcsIG9uQ2hhbmdlLCB0IH06IHsgdmlldzogVmlld01vZGU7IG9uQ2hhbmdlOiAodjogVmlld01vZGUpID0+IHZvaWQ7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXZpZXctdG9nZ2xlXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD17dCgndmlldy5zaW5nbGUnKX0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXZpZXctYnRuJHt2aWV3ID09PSAnc2luZ2xlJyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc2luZ2xlJ31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NpbmdsZScpfVxuICAgICAgPlxuICAgICAgICB7dCgndmlldy5zaW5nbGUnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NwbGl0JyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc3BsaXQnfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgnc3BsaXQnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc3BsaXQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBUd28tY29sdW1uIHNpZGUtYnktc2lkZSBkaWZmIGJvZHkgKG9sZCBsZWZ0LCBuZXcgcmlnaHQsIGxpbmUgbnVtYmVycyBhbGlnbmVkKS4gKi9cbmZ1bmN0aW9uIFNwbGl0RGlmZih7IGJsb2NrcywgYmVmb3JlTGFiZWwsIGFmdGVyTGFiZWwgfTogeyBibG9ja3M6IFNwbGl0QmxvY2tbXTsgYmVmb3JlTGFiZWw6IHN0cmluZzsgYWZ0ZXJMYWJlbDogc3RyaW5nIH0pIHtcbiAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2JlZm9yZUxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2FmdGVyTGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgIDxkaXYga2V5PXtiaX0+XG4gICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LnJpZ2h0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuLyoqIERyYWcgaGFuZGxlIGZvciByZXNpemluZyB0aGUgcGFuZWwgKGVhc3QgLyBzb3V0aCAvIHNvdXRoLWVhc3QpLiAqL1xuZnVuY3Rpb24gUmVzaXplSGFuZGxlKHsgbW9kZSwgb25SZXNpemUgfTogeyBtb2RlOiAnZScgfCAncycgfCAnc2UnOyBvblJlc2l6ZTogKGR4OiBudW1iZXIsIGR5OiBudW1iZXIpID0+IHZvaWQgfSkge1xuICBjb25zdCBsYXN0ID0gdXNlUmVmPHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1yZXNpemUgZHNkci1yZXNpemUtJHttb2RlfWB9XG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWxhc3QuY3VycmVudCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGR4ID0gZXZlbnQuY2xpZW50WCAtIGxhc3QuY3VycmVudC54XG4gICAgICAgIGNvbnN0IGR5ID0gZXZlbnQuY2xpZW50WSAtIGxhc3QuY3VycmVudC55XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGlmIChkeCAhPT0gMCB8fCBkeSAhPT0gMCkgb25SZXNpemUoZHgsIGR5KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXsoZXZlbnQpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0gbnVsbFxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXsoKSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgIH19XG4gICAgLz5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoaXBDbGFzcyhzdGF0dXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHMgPSBzdGF0dXMucmVwbGFjZSgvXFxzL2csICcnKVxuICBpZiAocy5pbmNsdWRlcygnPz8nKSkgcmV0dXJuICdkc2RyLWNoaXAtdSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnQScpIHx8IHMuaW5jbHVkZXMoJ0EnKSkgcmV0dXJuICdkc2RyLWNoaXAtYSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnRCcpIHx8IHMuaW5jbHVkZXMoJ0QnKSkgcmV0dXJuICdkc2RyLWNoaXAtZCdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnUicpIHx8IHMuaW5jbHVkZXMoJ1InKSkgcmV0dXJuICdkc2RyLWNoaXAtcidcbiAgcmV0dXJuICdkc2RyLWNoaXAtbSdcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFN0YXR1cyhjd2Q6IHN0cmluZyk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgc3RhdHVzIHJlcXVlc3QgZmFpbGVkOiAke3Jlcy5zdGF0dXN9YClcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpKSBhcyBTdGF0dXNSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhcHBseUNoYW5nZXMoY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JywgcGF0aD86IHN0cmluZyk6IFByb21pc2U8QXBwbHlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgYWN0aW9uLCBwYXRoIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQXBwbHlSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5HaXRBY3Rpb24oY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2NvbW1pdCcgfCAncHVzaCcsIG1lc3NhZ2U/OiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlc3BvbnNlPiB7XG4gIGNvbnN0IHVybCA9IGFjdGlvbiA9PT0gJ2NvbW1pdCcgPyBDT01NSVRfVVJMIDogUFVTSF9VUkxcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYWN0aW9uID09PSAnY29tbWl0JyA/IHsgY3dkLCBtZXNzYWdlIH0gOiB7IGN3ZCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEdpdFJlc3BvbnNlXG59XG5cbi8qKiBMb2NhbCAodW5wdXNoZWQpIGNvbW1pdHMgYWhlYWQgb2YgdGhlIHVwc3RyZWFtLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEhpc3RvcnkoY3dkOiBzdHJpbmcpOiBQcm9taXNlPEhpc3RvcnlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtISVNUT1JZX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWl0czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBIaXN0b3J5UmVzcG9uc2Vcbn1cblxuLyoqIE9uZSBjb21taXQncyB1bmlmaWVkIGRpZmYuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWl0RGlmZihjd2Q6IHN0cmluZywgaGFzaDogc3RyaW5nKTogUHJvbWlzZTxDb21taXREaWZmUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUlUX0RJRkZfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX0maGFzaD0ke2VuY29kZVVSSUNvbXBvbmVudChoYXNoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBkaWZmOiAnJywgZmlsZXM6IFtdLCBhZGRlZDogMCwgZGVsZXRlZDogMCwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIENvbW1pdERpZmZSZXNwb25zZVxufVxuXG4vKiogU2hvcnQgcmVsYXRpdmUgdGltZSBmb3IgY29tbWl0IHJvd3MgKFwianVzdCBub3dcIiAvIFwiMyBtaW4gYWdvXCIgLyBcdTIwMjYpLiAqL1xuZnVuY3Rpb24gcmVsYXRpdmVUaW1lKGlzbzogc3RyaW5nLCB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKSAtIG5ldyBEYXRlKGlzbykuZ2V0VGltZSgpKSAvIDYwMDAwKVxuICBpZiAobWludXRlcyA8IDEpIHJldHVybiB0KCd0aW1lLm5vdycpXG4gIGlmIChtaW51dGVzIDwgNjApIHJldHVybiB0KCd0aW1lLm1pbnV0ZXMnLCB7IG46IG1pbnV0ZXMgfSlcbiAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MClcbiAgaWYgKGhvdXJzIDwgMjQpIHJldHVybiB0KCd0aW1lLmhvdXJzJywgeyBuOiBob3VycyB9KVxuICByZXR1cm4gdCgndGltZS5kYXlzJywgeyBuOiBNYXRoLmZsb29yKGhvdXJzIC8gMjQpIH0pXG59XG5cbi8qKiBUaGVtZS1hd2FyZSBkcm9wZG93biByZXBsYWNpbmcgbmF0aXZlIDxzZWxlY3Q+IChuYXRpdmUgcG9wdXBzIGlnbm9yZSB0aGUgdGhlbWUpLiAqL1xuZnVuY3Rpb24gVGhlbWVTZWxlY3Qoe1xuICB2YWx1ZSxcbiAgb3B0aW9ucyxcbiAgb25DaGFuZ2UsXG4gIGFyaWFMYWJlbCxcbn06IHtcbiAgdmFsdWU6IHN0cmluZ1xuICBvcHRpb25zOiB7IHZhbHVlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfVtdXG4gIG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZFxuICBhcmlhTGFiZWw/OiBzdHJpbmdcbn0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJvb3RSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IGN1cnJlbnQgPSBvcHRpb25zLmZpbmQoKG8pID0+IG8udmFsdWUgPT09IHZhbHVlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm5cbiAgICBjb25zdCBjbG9zZU91dHNpZGUgPSAoZXZlbnQ6IFBvaW50ZXJFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUgJiYgIXJvb3RSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgY29uc3QgY2xvc2VPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgY2xvc2VPdXRzaWRlKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjbG9zZU9uS2V5KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGNsb3NlT3V0c2lkZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjbG9zZU9uS2V5KVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbFwiIHJlZj17cm9vdFJlZn0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXNlbC10cmlnZ2VyXCJcbiAgICAgICAgYXJpYS1oYXNwb3B1cD1cImxpc3Rib3hcIlxuICAgICAgICBhcmlhLWV4cGFuZGVkPXtvcGVufVxuICAgICAgICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtdmFsdWVcIj57Y3VycmVudD8ubGFiZWwgPz8gdmFsdWV9PC9zcGFuPlxuICAgICAgICA8SWNvbkNoZXZyb25Eb3duIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwiZHNkci1zZWwtbWVudVwiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17YXJpYUxhYmVsfT5cbiAgICAgICAgICB7b3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gKFxuICAgICAgICAgICAgPGxpIGtleT17b3B0aW9uLnZhbHVlfSByb2xlPVwibm9uZVwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17b3B0aW9uLnZhbHVlID09PSB2YWx1ZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNlbC1vcHRpb24ke29wdGlvbi52YWx1ZSA9PT0gdmFsdWUgPyAnIGRzZHItc2VsLW9wdGlvbi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZShvcHRpb24udmFsdWUpXG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC1vcHRpb24tbWFya1wiPntvcHRpb24udmFsdWUgPT09IHZhbHVlID8gPEljb25DaGVjayAvPiA6IG51bGx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLW9wdGlvbi1sYWJlbFwiPntvcHRpb24ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogU2V0dGluZ3MgXHUyMTkyIEdlbmVyYWwgcHJlZmVyZW5jZSByb3c6IGRpZmYgZm9udCArIGZvbnQgc2l6ZSAoc2hhcmVkIHByZWZzIHN0b3JlKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdTZXR0aW5nc1Jvdyh7IHQgfTogeyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZXQtcm93XCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2V0LXRpdGxlXCI+e3QoJ3NldHRpbmdzLnRpdGxlJyl9PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2V0LWdyaWRcIj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImRzZHItc2V0LWZpZWxkXCI+XG4gICAgICAgICAgPHNwYW4+e3QoJ3NldHRpbmdzLmZvbnQnKX08L3NwYW4+XG4gICAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLmZvbnQnKX1cbiAgICAgICAgICAgIHZhbHVlPXtwcmVmcy5mb250fVxuICAgICAgICAgICAgb3B0aW9ucz17Rk9OVF9PUFRJT05TLm1hcCgoZikgPT4gKHsgdmFsdWU6IGYuaWQsIGxhYmVsOiBmLmxhYmVsLnN0YXJ0c1dpdGgoJ2ZvbnQuJykgPyB0KGYubGFiZWwgYXMga2V5b2YgdHlwZW9mIHpoKSA6IGYubGFiZWwgfSkpfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhmb250KSA9PlxuICAgICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICAgIGQuZm9udCA9IGZvbnRcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZHNkci1zZXQtZmllbGRcIj5cbiAgICAgICAgICA8c3Bhbj57dCgnc2V0dGluZ3Muc2l6ZScpfTwvc3Bhbj5cbiAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2V0dGluZ3Muc2l6ZScpfVxuICAgICAgICAgICAgdmFsdWU9e1N0cmluZyhwcmVmcy5zaXplKX1cbiAgICAgICAgICAgIG9wdGlvbnM9e1NJWkVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBTdHJpbmcocyksIGxhYmVsOiBgJHtzfXB4YCB9KSl9XG4gICAgICAgICAgICBvbkNoYW5nZT17KHNpemUpID0+XG4gICAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgICAgZC5zaXplID0gTnVtYmVyKHNpemUpXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSGVhZGVyIGFjdGlvbiAoc2Vzc2lvbiBzY29wZSk6IGJhZGdlICsgb3Blbi5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3QWN0aW9uKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgdXNlU2Vzc2lvbiwgdCB9OiBEaWZmUmV2aWV3QWN0aW9uUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IG5vZGVzID0gdXNlU2Vzc2lvbigocykgPT4gcy5ub2RlcylcbiAgY29uc3QgY2hhbmdlQ291bnQgPSB1c2VNZW1vKCgpID0+IGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXMpLCBbbm9kZXNdKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBvcGVuT3ZlcmxheSA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWIgPSBvdmVybGF5U3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHNldE9wZW4ob3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KCkub3BlbilcbiAgICB9KVxuICAgIHJldHVybiB1bnN1YlxuICB9LCBbXSlcblxuICBpZiAoIWN3ZCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItdHJpZ2dlclwiIGFyaWEtbGFiZWw9e3QoJ2FjdGlvbi5hcmlhJyl9IG9uQ2xpY2s9e29wZW5PdmVybGF5fT5cbiAgICAgIDxJY29uRGlmZiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1sYWJlbFwiPnt0KCdhY3Rpb24ubGFiZWwnKX08L3NwYW4+XG4gICAgICB7Y2hhbmdlQ291bnQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiPntjaGFuZ2VDb3VudH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtvcGVuID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlsZSB0cmVlOiBidWlsZCBhIGRpcmVjdG9yeSB0cmVlIGZyb20gZmxhdCBwYXRocyBhbmQgcmVuZGVyIGl0IHdpdGhcbi8vIGNvbGxhcHNpYmxlIGZvbGRlcnMgKHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHJldmlldyBzdXJmYWNlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIFRyZWVEaXI8VD4gPSB7IGtpbmQ6ICdkaXInOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY2hpbGRyZW46IFRyZWVOb2RlPFQ+W10gfVxudHlwZSBUcmVlTGVhZjxUPiA9IHsga2luZDogJ2xlYWYnOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgaXRlbTogVCB9XG50eXBlIFRyZWVOb2RlPFQ+ID0gVHJlZURpcjxUPiB8IFRyZWVMZWFmPFQ+XG5cbi8qKiBUdXJuIGEgZmxhdCBpdGVtIGxpc3QgaW50byBhIHNvcnRlZCBkaXJlY3RvcnkgdHJlZSAoZGlyZWN0b3JpZXMgZmlyc3QpLiAqL1xuZnVuY3Rpb24gYnVpbGRGaWxlVHJlZTxUPihpdGVtczogcmVhZG9ubHkgVFtdLCBwYXRoT2Y6IChpdGVtOiBUKSA9PiBzdHJpbmcpOiBUcmVlTm9kZTxUPltdIHtcbiAgY29uc3Qgcm9vdDogVHJlZU5vZGU8VD5bXSA9IFtdXG4gIGNvbnN0IGRpckluZGV4ID0gbmV3IE1hcDxzdHJpbmcsIFRyZWVEaXI8VD4+KClcbiAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgY29uc3QgcGF0aCA9IHBhdGhPZihpdGVtKVxuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDApIGNvbnRpbnVlXG4gICAgbGV0IHNpYmxpbmdzID0gcm9vdFxuICAgIGxldCBwcmVmaXggPSAnJ1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBwcmVmaXggPSBwcmVmaXggPyBgJHtwcmVmaXh9LyR7cGFydHNbaV19YCA6IHBhcnRzW2ldXG4gICAgICBsZXQgZGlyID0gZGlySW5kZXguZ2V0KHByZWZpeClcbiAgICAgIGlmICghZGlyKSB7XG4gICAgICAgIGRpciA9IHsga2luZDogJ2RpcicsIG5hbWU6IHBhcnRzW2ldLCBwYXRoOiBwcmVmaXgsIGNoaWxkcmVuOiBbXSB9XG4gICAgICAgIGRpckluZGV4LnNldChwcmVmaXgsIGRpcilcbiAgICAgICAgc2libGluZ3MucHVzaChkaXIpXG4gICAgICB9XG4gICAgICBzaWJsaW5ncyA9IGRpci5jaGlsZHJlblxuICAgIH1cbiAgICBzaWJsaW5ncy5wdXNoKHsga2luZDogJ2xlYWYnLCBuYW1lOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSwgcGF0aCwgaXRlbSB9KVxuICB9XG4gIGNvbnN0IHNvcnROb2RlcyA9IChub2RlczogVHJlZU5vZGU8VD5bXSk6IHZvaWQgPT4ge1xuICAgIG5vZGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLmtpbmQgIT09IGIua2luZCkgcmV0dXJuIGEua2luZCA9PT0gJ2RpcicgPyAtMSA6IDFcbiAgICAgIHJldHVybiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpXG4gICAgfSlcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIGlmIChub2RlLmtpbmQgPT09ICdkaXInKSBzb3J0Tm9kZXMobm9kZS5jaGlsZHJlbilcbiAgfVxuICBzb3J0Tm9kZXMocm9vdClcbiAgcmV0dXJuIHJvb3Rcbn1cblxuLyoqIFJlY3Vyc2l2ZSB0cmVlIHJlbmRlcmVyOiBjb2xsYXBzaWJsZSBkaXJlY3RvcmllcyArIGxlYWYgcm93cy4gKi9cbmZ1bmN0aW9uIEZpbGVUcmVlVmlldzxUPihwcm9wczoge1xuICBub2RlczogVHJlZU5vZGU8VD5bXVxuICBjb2xsYXBzZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz5cbiAgb25Ub2dnbGVEaXI6IChwYXRoOiBzdHJpbmcpID0+IHZvaWRcbiAgZGVwdGg6IG51bWJlclxuICByZW5kZXJMZWFmOiAobGVhZjogVHJlZUxlYWY8VD4pID0+IFJlYWN0Tm9kZVxufSk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IHsgbm9kZXMsIGNvbGxhcHNlZCwgb25Ub2dnbGVEaXIsIGRlcHRoLCByZW5kZXJMZWFmIH0gPSBwcm9wc1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7bm9kZXMubWFwKChub2RlKSA9PlxuICAgICAgICBub2RlLmtpbmQgPT09ICdkaXInID8gKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9PlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1kaXIke2NvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/ICcnIDogJyBkc2RyLWRpci1vcGVuJ31gfVxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nTGVmdDogZGVwdGggKiAxNCArIDggfX1cbiAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25Ub2dnbGVEaXIobm9kZS5wYXRoKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY2FyZXRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJ1x1MjVCOCcgOiAnXHUyNUJFJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLW5hbWVcIiB0aXRsZT17bm9kZS5wYXRofT57bm9kZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY291bnRcIj57bm9kZS5jaGlsZHJlbi5sZW5ndGh9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/IChcbiAgICAgICAgICAgICAgPEZpbGVUcmVlVmlldyBub2Rlcz17bm9kZS5jaGlsZHJlbn0gY29sbGFwc2VkPXtjb2xsYXBzZWR9IG9uVG9nZ2xlRGlyPXtvblRvZ2dsZURpcn0gZGVwdGg9e2RlcHRoICsgMX0gcmVuZGVyTGVhZj17cmVuZGVyTGVhZn0gLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9IHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0IH19PntyZW5kZXJMZWFmKG5vZGUpfTwvZGl2PlxuICAgICAgICApLFxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJldmlldyBvdmVybGF5IChyb290IHNjb3BlKTogc2Vzc2lvbiArIHdvcmtzcGFjZSB0YWJzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdPdmVybGF5KHsgc2Vzc2lvbnMsIHQgfTogRGlmZlJldmlld092ZXJsYXlQcm9wcykge1xuICBjb25zdCBzdG9yZVN0YXRlID0gdXNlU3luY0V4dGVybmFsU3RvcmUob3ZlcmxheVN0b3JlLnN1YnNjcmliZSwgb3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICAvLyBHaXQtZmlyc3Q6IGxhbmQgb24gdGhlIHdvcmtzcGFjZSB0YWIgKHN0YWdlZC91bnN0YWdlZC9icmFuY2ggdHJlZXMpIHNvIHRoZVxuICAvLyBjaGFuZ2UgcmV2aWV3IGlzIG9uZSBjbGljayBhd2F5OyB0aGUgc2Vzc2lvbiB0YWIgc3RheXMgYSBjbGljayBhd2F5LlxuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gdXNlU3RhdGU8J3Nlc3Npb24nIHwgJ3dvcmtzcGFjZSc+KCd3b3Jrc3BhY2UnKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSB1c2VTdGF0ZTxWaWV3TW9kZT4oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RzZHItdmlldycpID09PSAnc3BsaXQnID8gJ3NwbGl0JyA6ICdzaW5nbGUnXG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ3NpbmdsZSdcbiAgICB9XG4gIH0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkc2RyLXZpZXcnLCB2aWV3KVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gcHJpdmF0ZSBtb2RlIC8gdW5hdmFpbGFibGUgXHUyMDE0IG5vbi1mYXRhbFxuICAgIH1cbiAgfSwgW3ZpZXddKVxuXG4gIC8vIFdvcmtzcGFjZSB0YWIgc3RhdGUuXG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtub3RpY2UsIHNldE5vdGljZV0gPSB1c2VTdGF0ZTx7IGtpbmQ6ICdvaycgfCAnZXJyb3InOyB0ZXh0OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb25maXJtLCBzZXRDb25maXJtXSA9IHVzZVN0YXRlPCdmaWxlJyB8ICdhbGwnIHwgJ3B1c2gnIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdE1lc3NhZ2UsIHNldENvbW1pdE1lc3NhZ2VdID0gdXNlU3RhdGUoJycpXG4gIC8vIExvY2FsICh1bnB1c2hlZCkgY29tbWl0IGhpc3Rvcnk6IGxpc3QgKyBwZXItY29tbWl0IGRpZmYgdmlldy5cbiAgY29uc3QgW2hpc3RvcnksIHNldEhpc3RvcnldID0gdXNlU3RhdGU8Q29tbWl0SW5mb1tdPihbXSlcbiAgY29uc3QgW3NlbGVjdGVkQ29tbWl0LCBzZXRTZWxlY3RlZENvbW1pdF0gPSB1c2VTdGF0ZTxDb21taXRJbmZvIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdERpZmYsIHNldENvbW1pdERpZmZdID0gdXNlU3RhdGU8Q29tbWl0RGlmZlJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdERpZmZMb2FkaW5nLCBzZXRDb21taXREaWZmTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbGVjdGVkQ29tbWl0RmlsZSwgc2V0U2VsZWN0ZWRDb21taXRGaWxlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIENvbGxhcHNlZCBkaXJlY3RvcmllcyBpbiB0aGUgbGVmdC1oYW5kIGZpbGUgdHJlZSAoc2hhcmVkIGFjcm9zcyB0YWJzKS5cbiAgY29uc3QgW2NvbGxhcHNlZERpcnMsIHNldENvbGxhcHNlZERpcnNdID0gdXNlU3RhdGU8UmVhZG9ubHlTZXQ8c3RyaW5nPj4oKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCB0b2dnbGVEaXIgPSB1c2VNZW1vKFxuICAgICgpID0+IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgIHNldENvbGxhcHNlZERpcnMoKHByZXYpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQocHJldilcbiAgICAgICAgaWYgKG5leHQuaGFzKHBhdGgpKSBuZXh0LmRlbGV0ZShwYXRoKVxuICAgICAgICBlbHNlIG5leHQuYWRkKHBhdGgpXG4gICAgICAgIHJldHVybiBuZXh0XG4gICAgICB9KVxuICAgIH0sXG4gICAgW10sXG4gIClcbiAgY29uc3Qgbm90aWNlVGltZXIgPSB1c2VSZWY8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ+KHVuZGVmaW5lZClcblxuICAvLyBDdXJyZW50IHNlc3Npb24ncyBjb252ZXJzYXRpb24gc25hcHNob3QgKHJlYWN0aXZlKSwgZm9yIHRoZSBzZXNzaW9uIHRhYi5cbiAgY29uc3QgY3VycmVudElkID0gdXNlU3luY0V4dGVybmFsU3RvcmUoXG4gICAgdXNlTWVtbygoKSA9PiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiBzZXNzaW9ucy5saXN0LnN1YnNjcmliZShub3RpZnkpLCBbc2Vzc2lvbnNdKSxcbiAgICB1c2VNZW1vKCgpID0+ICgpID0+IHNlc3Npb25zLmxpc3QuZ2V0U25hcHNob3QoKS5jdXJyZW50LCBbc2Vzc2lvbnNdKSxcbiAgKVxuICBjb25zdCBzbmFwc2hvdCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgcmV0dXJuIChub3RpZnk6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IGN1cnJlbnRJZCA/IHNlc3Npb25zLmJpbmRpbmcoY3VycmVudElkKSA6IHVuZGVmaW5lZFxuICAgICAgICBpZiAoIWJpbmRpbmcpIHJldHVybiAoKSA9PiB7fVxuICAgICAgICByZXR1cm4gYmluZGluZy5zZXNzaW9uLnN1YnNjcmliZShub3RpZnkpXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIGJpbmRpbmcgPyBiaW5kaW5nLnNlc3Npb24uZ2V0U25hcHNob3QoKSA6IG51bGxcbiAgICAgIH1cbiAgICB9LCBbc2Vzc2lvbnMsIGN1cnJlbnRJZF0pLFxuICApXG5cbiAgY29uc3Qgcm91bmRzID0gdXNlTWVtbygoKSA9PiAoc25hcHNob3QgPyBjb2xsZWN0U2Vzc2lvblJvdW5kcyhzbmFwc2hvdC5ub2RlcykgOiBbXSksIFtzbmFwc2hvdF0pXG4gIC8vIExlZnQtaGFuZCBmaWxlIHRyZWVzOiBwZXItcm91bmQgdHJlZXMgZm9yIHRoZSBzZXNzaW9uIHRhYiwgb25lIHRyZWUgZm9yXG4gIC8vIHRoZSBnaXQgd29ya2luZyB0cmVlIG9uIHRoZSB3b3Jrc3BhY2UgdGFiLlxuICBjb25zdCBzZXNzaW9uVHJlZXMgPSB1c2VNZW1vKCgpID0+IG5ldyBNYXAocm91bmRzLm1hcCgocikgPT4gW3Iucm91bmQsIGJ1aWxkRmlsZVRyZWUoci5jaGFuZ2VzLCAoYykgPT4gYy5wYXRoKV0pKSwgW3JvdW5kc10pXG4gIGNvbnN0IHRvdGFsU2Vzc2lvbkZpbGVzID0gdXNlTWVtbygoKSA9PiByb3VuZHMucmVkdWNlKChuLCByKSA9PiBuICsgci5jaGFuZ2VzLmxlbmd0aCwgMCksIFtyb3VuZHNdKVxuICBjb25zdCBbc2VsZWN0ZWRSb3VuZCwgc2V0U2VsZWN0ZWRSb3VuZF0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWRQYXRoLCBzZXRTZWxlY3RlZFBhdGhdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRDaGFuZ2UgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCByb3VuZCA9IHJvdW5kcy5maW5kKChyKSA9PiByLnJvdW5kID09PSBzZWxlY3RlZFJvdW5kKVxuICAgIHJldHVybiByb3VuZD8uY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IHNlbGVjdGVkUGF0aCkgPz8gbnVsbFxuICB9LCBbcm91bmRzLCBzZWxlY3RlZFJvdW5kLCBzZWxlY3RlZFBhdGhdKVxuXG4gIGNvbnN0IGN3ZCA9IHN0b3JlU3RhdGUuY3dkXG5cbiAgY29uc3QgbG9hZFdvcmtzcGFjZSA9IGFzeW5jIChzaWxlbnQgPSBmYWxzZSkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBpZiAoIXNpbGVudCkgc2V0TG9hZGluZyh0cnVlKVxuICAgIHNldEVycm9yKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IFtuZXh0LCBoaXN0XSA9IGF3YWl0IFByb21pc2UuYWxsKFtsb2FkU3RhdHVzKGN3ZCksIGxvYWRIaXN0b3J5KGN3ZCldKVxuICAgICAgc2V0U3RhdHVzKG5leHQpXG4gICAgICBpZiAoaGlzdC5vaykgc2V0SGlzdG9yeShoaXN0LmNvbW1pdHMpXG4gICAgICBpZiAobmV4dC5lcnJvciAmJiAhbmV4dC5pc1JlcG8pIHNldEVycm9yKG5leHQuZXJyb3IpXG4gICAgICBzZXRTZWxlY3RlZCgocHJldikgPT4gKHByZXYgJiYgbmV4dC5maWxlcy5zb21lKChmKSA9PiBmLnBhdGggPT09IHByZXYpID8gcHJldiA6IG5leHQuZmlsZXNbMF0/LnBhdGggPz8gbnVsbCkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0RXJyb3IoZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIExvYWQgd29ya3NwYWNlIHN0YXR1cyBsYXppbHkgb24gZmlyc3QgdmlzaXQgb2YgdGhlIHRhYi5cbiAgY29uc3Qgd29ya3NwYWNlTG9hZGVkID0gdXNlUmVmKGZhbHNlKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICh0YWIgPT09ICd3b3Jrc3BhY2UnICYmICF3b3Jrc3BhY2VMb2FkZWQuY3VycmVudCAmJiBjd2QpIHtcbiAgICAgIHdvcmtzcGFjZUxvYWRlZC5jdXJyZW50ID0gdHJ1ZVxuICAgICAgdm9pZCBsb2FkV29ya3NwYWNlKClcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbdGFiLCBjd2RdKVxuXG4gIC8vIERlZmF1bHQgc2VsZWN0aW9uIGZvciB0aGUgc2Vzc2lvbiB0YWIgZm9sbG93cyB0aGUgZmlyc3Qgcm91bmQgd2l0aCBjaGFuZ2VzLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFJvdW5kID09PSBudWxsICYmIHJvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRTZWxlY3RlZFJvdW5kKHJvdW5kc1swXS5yb3VuZClcbiAgICAgIHNldFNlbGVjdGVkUGF0aChyb3VuZHNbMF0uY2hhbmdlc1swXT8ucGF0aCA/PyBudWxsKVxuICAgIH1cbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbikgcmV0dXJuXG4gICAgY29uc3Qgb25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICBkLm9wZW4gPSBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgfSwgW3N0b3JlU3RhdGUub3Blbl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW5vdGljZSkgcmV0dXJuXG4gICAgbm90aWNlVGltZXIuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4gc2V0Tm90aWNlKG51bGwpLCAzMDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQobm90aWNlVGltZXIuY3VycmVudClcbiAgfSwgW25vdGljZV0pXG5cbiAgY29uc3QgZmlsZXMgPSBzdGF0dXM/LmlzUmVwbyA/IHN0YXR1cy5maWxlcyA6IFtdXG4gIGNvbnN0IHN0YWdlZEZpbGVzID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGYpID0+IGYuc3RhZ2VkKSwgW2ZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiAhZi5zdGFnZWQpLCBbZmlsZXNdKVxuICBjb25zdCBzdGFnZWRDb3VudCA9IHN0YWdlZEZpbGVzLmxlbmd0aFxuICAvLyBOT1RFOiBob29rcyBtdXN0IGFsbCBydW4gYmVmb3JlIHRoZSBlYXJseSByZXR1cm4gYmVsb3cgKFJlYWN0IGhvb2sgb3JkZXIpLlxuICBjb25zdCBzdGFnZWRUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHN0YWdlZEZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3N0YWdlZEZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHVuc3RhZ2VkRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbdW5zdGFnZWRGaWxlc10pXG4gIGNvbnN0IGNvbW1pdEZpbGVzVHJlZSA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKGNvbW1pdERpZmY/Lm9rID8gYnVpbGRGaWxlVHJlZShjb21taXREaWZmLmZpbGVzLCAoZikgPT4gZi5wYXRoKSA6IFtdKSxcbiAgICBbY29tbWl0RGlmZl0sXG4gIClcblxuICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHNlbGVjdGVkRmlsZSA9IGZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWQpID8/IG51bGxcbiAgY29uc3QgdG90YWxBZGRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuYWRkZWQsIDApXG4gIGNvbnN0IHRvdGFsRGVsZXRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuZGVsZXRlZCwgMClcblxuICAvLyBDb21taXQtZGV0YWlsIHZpZXc6IHRoZSBzZWxlY3RlZCBmaWxlIHdpdGhpbiB0aGUgc2VsZWN0ZWQgY29tbWl0LlxuICBjb25zdCBjb21taXRTZWdtZW50cyA9IGNvbW1pdERpZmY/Lm9rID8gc3BsaXRDb21taXREaWZmKGNvbW1pdERpZmYuZGlmZikgOiBbXVxuICBjb25zdCBjb21taXRBY3RpdmVGaWxlID0gc2VsZWN0ZWRDb21taXQgJiYgY29tbWl0RGlmZj8ub2sgPyBjb21taXREaWZmLmZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWRDb21taXRGaWxlKSA/PyBudWxsIDogbnVsbFxuICBjb25zdCBjb21taXRBY3RpdmVUZXh0ID0gY29tbWl0QWN0aXZlRmlsZVxuICAgID8gY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/IGNvbW1pdERpZmY/LmRpZmYgPz8gJydcbiAgICA6IGNvbW1pdERpZmY/LmRpZmYgPz8gJydcblxuICAvKiogTGVhZiByb3cgc2hhcmVkIGJ5IHRoZSBzdGFnZWQvdW5zdGFnZWQgZmlsZSB0cmVlcy4gKi9cbiAgY29uc3Qgd29ya3NwYWNlTGVhZiA9ICh7IGl0ZW06IGZpbGUsIG5hbWUgfTogeyBpdGVtOiBEaWZmRmlsZTsgbmFtZTogc3RyaW5nIH0pID0+IChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgYXJpYS1zZWxlY3RlZD17ZmlsZS5wYXRoID09PSBzZWxlY3RlZH1cbiAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7ZmlsZS5wYXRoID09PSBzZWxlY3RlZCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkKGZpbGUucGF0aClcbiAgICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWNoaXAgJHtjaGlwQ2xhc3MoZmlsZS5zdGF0dXMpfWB9PntmaWxlLnVudHJhY2tlZCA/ICc/PycgOiBmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1zdGF0XCI+XG4gICAgICAgIHtmaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogZmlsZS5hZGRlZCwgZGVsZXRlZDogZmlsZS5kZWxldGVkIH0pfVxuICAgICAgPC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG5cbiAgY29uc3QgcnVuQXBwbHkgPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnLCBwYXRoPzogc3RyaW5nKSA9PiB7XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlDaGFuZ2VzKGN3ZCwgYWN0aW9uLCBwYXRoKVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBzZXROb3RpY2Uoe1xuICAgICAgICAgIGtpbmQ6ICdvaycsXG4gICAgICAgICAgdGV4dDogcGF0aFxuICAgICAgICAgICAgPyB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKSwgcGF0aCB9KVxuICAgICAgICAgICAgOiB0KCdyZXZpZXcuZG9uZScsIHsgYWN0aW9uOiBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKSwgY291bnQ6IGZpbGVzLmxlbmd0aCB9KSxcbiAgICAgICAgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uRmlsZUFjdGlvbiA9IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcsIHBhdGg6IHN0cmluZykgPT4ge1xuICAgIGlmIChhY3Rpb24gPT09ICdyZXZlcnQnICYmIGNvbmZpcm0gIT09ICdmaWxlJykge1xuICAgICAgc2V0Q29uZmlybSgnZmlsZScpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAnZmlsZScgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uLCBwYXRoKVxuICB9XG5cbiAgY29uc3Qgb25BbGxBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnKSA9PiB7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ3JldmVydCcgJiYgY29uZmlybSAhPT0gJ2FsbCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ2FsbCcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAnYWxsJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCBydW5BcHBseShhY3Rpb24pXG4gIH1cblxuICAvKiogQ29tbWl0IHRoZSBzdGFnZWQgY2hhbmdlcyB3aXRoIHRoZSBlbnRlcmVkIG1lc3NhZ2UuICovXG4gIGNvbnN0IG9uQ29tbWl0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBjb21taXRNZXNzYWdlLnRyaW0oKVxuICAgIGlmICghbWVzc2FnZSB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oY3dkLCAnY29tbWl0JywgbWVzc2FnZSlcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0Q29tbWl0TWVzc2FnZSgnJylcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHJlc3VsdC5oYXNoID8gYCR7cmVzdWx0Lmhhc2h9ICR7cmVzdWx0LnN1YmplY3QgPz8gJyd9YC50cmltKCkgOiAocmVzdWx0LnN1YmplY3QgPz8gJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb21taXR0ZWQnLCB7IHN1bW1hcnkgfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBQdXNoIHRoZSBjdXJyZW50IGJyYW5jaCAoZG91YmxlLWNsaWNrIHRvIGNvbmZpcm0pLiAqL1xuICBjb25zdCBvblB1c2ggPSAoKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVyblxuICAgIGlmIChjb25maXJtICE9PSAncHVzaCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ3B1c2gnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ3B1c2gnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICBzZXRCdXN5KHRydWUpXG4gICAgICBzZXROb3RpY2UobnVsbClcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkdpdEFjdGlvbihjd2QsICdwdXNoJylcbiAgICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5wdXNoZWQnKSB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgfVxuICAgIH0pKClcbiAgfVxuXG4gIC8qKiBTZWxlY3QgYSBsb2NhbCBjb21taXQgYW5kIGxvYWQgaXRzIGRpZmYgaW50byB0aGUgcmlnaHQgcGFuZS4gKi9cbiAgY29uc3Qgc2VsZWN0Q29tbWl0ID0gKGNvbW1pdDogQ29tbWl0SW5mbykgPT4ge1xuICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgc2V0U2VsZWN0ZWRDb21taXQoY29tbWl0KVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZkxvYWRpbmcodHJ1ZSlcbiAgICB2b2lkIGxvYWRDb21taXREaWZmKGN3ZCwgY29tbWl0Lmhhc2gpXG4gICAgICAudGhlbigoZCkgPT4ge1xuICAgICAgICBzZXRDb21taXREaWZmKGQpXG4gICAgICAgIHNldENvbW1pdERpZmZMb2FkaW5nKGZhbHNlKVxuICAgICAgICAvLyBEZWZhdWx0IHRoZSBmaWxlIHRyZWUgdG8gdGhlIGZpcnN0IGNoYW5nZWQgZmlsZS5cbiAgICAgICAgaWYgKGQub2sgJiYgZC5maWxlcy5sZW5ndGggPiAwKSBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZC5maWxlc1swXS5wYXRoKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSkpXG4gIH1cblxuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cImRzZHItb3ZlcmxheVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3VycmVudFRhcmdldCkgY2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItcGFuZWxcIlxuICAgICAgICByb2xlPVwiZGlhbG9nXCJcbiAgICAgICAgYXJpYS1tb2RhbD1cInRydWVcIlxuICAgICAgICBhcmlhLWxhYmVsPXt0KCdyZXZpZXcudGl0bGUnKX1cbiAgICAgICAgc3R5bGU9e3sgd2lkdGg6IGAke3ByZWZzLndpZHRofXB4YCwgaGVpZ2h0OiBgJHtwcmVmcy5oZWlnaHR9cHhgLCAuLi5kaWZmU3R5bGVWYXJzKHByZWZzKSB9IGFzIENTU1Byb3BlcnRpZXN9XG4gICAgICA+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwiZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNcIlxuICAgICAgICAgIG9uUmVzaXplPXsoX2R4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNlXCJcbiAgICAgICAgICBvblJlc2l6ZT17KGR4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgICAgZC5oZWlnaHQgPSBNYXRoLm1heChNSU5fUEFORUxfSCwgTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gNjQsIGQuaGVpZ2h0ICsgZHkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1oZWFkZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRpdGxlXCI+e3QoJ3Jldmlldy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRhYnNcIiByb2xlPVwidGFibGlzdFwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfT5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0YWIgPT09ICdzZXNzaW9uJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3Nlc3Npb24nID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VGFiKCdzZXNzaW9uJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0KCd0YWIuc2Vzc2lvbicpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGFiID09PSAnd29ya3NwYWNlJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3dvcmtzcGFjZScgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3dvcmtzcGFjZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dCgndGFiLndvcmtzcGFjZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3VidGl0bGVcIj5cbiAgICAgICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJ1xuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5zZXNzaW9uU3RhdHMnLCB7IHJvdW5kczogcm91bmRzLmxlbmd0aCwgZmlsZXM6IHRvdGFsU2Vzc2lvbkZpbGVzIH0pXG4gICAgICAgICAgICAgIDogc3RhdHVzPy5pc1JlcG9cbiAgICAgICAgICAgICAgICA/IGAke3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9IFx1MDBCNyAke3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogdG90YWxBZGRlZCwgZGVsZXRlZDogdG90YWxEZWxldGVkIH0pfSR7c3RhdHVzLmFoZWFkID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmFoZWFkJywgeyBuOiBzdGF0dXMuYWhlYWQgfSl9YCA6ICcnfSR7c3RhdHVzLmJlaGluZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9YCA6ICcnfWBcbiAgICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5ub3RSZXBvJyl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCBmaWxlcy5sZW5ndGggPT09IDB9IG9uQ2xpY2s9eygpID0+IG9uQWxsQWN0aW9uKCdhY2NlcHQnKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5hY2NlcHRBbGwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXIke2NvbmZpcm0gPT09ICdhbGwnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQWxsQWN0aW9uKCdyZXZlcnQnKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnYWxsJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJykgOiB0KCdyZXZpZXcucmV2ZXJ0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtjb21taXRNZXNzYWdlfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0KCdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRDb21taXRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHZvaWQgb25Db21taXQoKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3kgfHwgIWNvbW1pdE1lc3NhZ2UudHJpbSgpIHx8IHN0YWdlZENvdW50ID09PSAwfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9uQ29tbWl0KCl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29tbWl0Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIGxvYWRXb3Jrc3BhY2UoKX0+XG4gICAgICAgICAgICAgICAgPEljb25SZWZyZXNoIC8+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5yZWZyZXNoJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcuY2xvc2UnKX0gb25DbGljaz17Y2xvc2V9PlxuICAgICAgICAgICAgPEljb25YIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJyA/IChcbiAgICAgICAgICByb3VuZHMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLnNlc3Npb24nKX0+XG4gICAgICAgICAgICAgICAge3JvdW5kcy5tYXAoKHJvdW5kKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cm91bmQucm91bmR9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnJvdW5kJywgeyByb3VuZDogcm91bmQucm91bmQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAge3JvdW5kLmxhYmVsID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kLWxhYmVsXCIgdGl0bGU9e3JvdW5kLmxhYmVsfT57cm91bmQubGFiZWx9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2Vzc2lvblRyZWVzLmdldChyb3VuZC5yb3VuZCkgPz8gW119XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogY2hhbmdlLCBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3JvdW5kLnJvdW5kfToke2NoYW5nZS5wYXRofWBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkS2V5ID0gc2VsZWN0ZWRDaGFuZ2UgPyBgJHtzZWxlY3RlZFJvdW5kfToke3NlbGVjdGVkQ2hhbmdlLnBhdGh9YCA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtrZXkgPT09IHNlbGVjdGVkS2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7a2V5ID09PSBzZWxlY3RlZEtleSA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZC5yb3VuZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUGF0aChjaGFuZ2UucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hhbmdlLmhhc0RpZmYgPyAnZHNkci1jaGlwLW0nIDogJ2RzZHItY2hpcC11J31gfT57Y2hhbmdlLmhhc0RpZmYgPyAnTScgOiAnXHUwMEI3J308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17Y2hhbmdlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIiB0aXRsZT17Y2hhbmdlLnRvb2x9PntjaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ2hhbmdlLnBhdGh9PntzZWxlY3RlZENoYW5nZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj57c2VsZWN0ZWRDaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlLmhhc0RpZmYgPyA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gKFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPT09ICdzcGxpdCcgJiYgY2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8U3BsaXREaWZmIGJsb2Nrcz17Y2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjaGFuZ2VSb3dzKHNlbGVjdGVkQ2hhbmdlKS5tYXAoKHJvdywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgICAgKSA6IGVycm9yICYmICFzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgIHtlcnJvcn1cbiAgICAgICAgICAgIDxkaXY+e3QoJ3Jldmlldy5ub3RSZXBvSGludCcpfTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJvZHlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLndvcmtzcGFjZScpfT5cbiAgICAgICAgICAgICAge3N0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3N0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Vuc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICBub2Rlcz17dW5zdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtoaXN0b3J5Lmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5oaXN0b3J5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGltZWxpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAge2hpc3RvcnkubWFwKChjb21taXQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2NvbW1pdC5oYXNofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10bC1pdGVtJHtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2ggPyAnIGRzZHItdGwtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGwtcmFpbFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWRvdCR7Y29tbWl0LmFoZWFkID8gJyBkc2RyLXRsLWRvdC1sb2NhbCcgOiAnIGRzZHItdGwtZG90LXJlbW90ZSd9YH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0Py5oYXNoID09PSBjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21taXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RDb21taXQoY29tbWl0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItdGwtYmFkZ2Uke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1iYWRnZS1sb2NhbCcgOiAnIGRzZHItdGwtYmFkZ2UtcmVtb3RlJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21taXQuYWhlYWQgPyB0KCdoaXN0b3J5LmxvY2FsJykgOiB0KCdoaXN0b3J5LnJlbW90ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zaG9ydFwiPntjb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LXN1YmplY3RcIiB0aXRsZT17Y29tbWl0LnN1YmplY3R9Pntjb21taXQuc3ViamVjdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtbWV0YVwiPntjb21taXQuYXV0aG9yfSBcdTAwQjcge3JlbGF0aXZlVGltZShjb21taXQuZGF0ZSwgdCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQgJiYgY29tbWl0RGlmZj8ub2sgJiYgY29tbWl0RGlmZi5maWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuY29tbWl0RmlsZXMnKX0gKHtjb21taXREaWZmLmZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzPXtjb21taXRGaWxlc1RyZWV9XG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9eyh7IGl0ZW06IGZpbGUsIG5hbWUgfSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZENvbW1pdEZpbGUgPT09IGZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7c2VsZWN0ZWRDb21taXRGaWxlID09PSBmaWxlLnBhdGggPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWRDb21taXRGaWxlKGZpbGUucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jaGlwIGRzZHItY2hpcC1tXCI+e2ZpbGUuc3RhdHVzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2ZpbGUucGF0aH0+e25hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLXN0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogZmlsZS5hZGRlZCwgZGVsZXRlZDogZmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uQnJhbmNoJyl9PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1icmFuY2hcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1yZWZcIiB0aXRsZT17c3RhdHVzLnVwc3RyZWFtID8/IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICB7c3RhdHVzLmJyYW5jaCA/PyB0KCdyZXZpZXcuZGV0YWNoZWQnKX1cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFycm93XCI+XHUyMTkyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAge3N0YXR1cy51cHN0cmVhbSA/PyB0KCdyZXZpZXcubm9VcHN0cmVhbScpfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFoZWFkXCI+e3QoJ3Jldmlldy5haGVhZCcsIHsgbjogc3RhdHVzLmFoZWFkIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAge3N0YXR1cy5iZWhpbmQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtYmVoaW5kXCI+e3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID09PSAwICYmIHN0YXR1cy5iZWhpbmQgPT09IDAgJiYgc3RhdHVzLnVwc3RyZWFtID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtc3luY1wiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuJHtjb25maXJtID09PSAncHVzaCcgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5IHx8IChzdGF0dXM/LmFoZWFkID8/IDApID09PSAwfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17b25QdXNofVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAncHVzaCcgPyB0KCdyZXZpZXcuY29uZmlybVB1c2gnKSA6IGAke3QoJ3Jldmlldy5wdXNoJyl9JHsoc3RhdHVzPy5haGVhZCA/PyAwKSA+IDAgPyBgICgke3N0YXR1cz8uYWhlYWQgPz8gMH0pYCA6ICcnfWB9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZlwiPlxuICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQgPyAoXG4gICAgICAgICAgICAgICAgY29tbWl0RGlmZkxvYWRpbmcgPyAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiBjb21taXREaWZmPy5vayA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhhc2hcIj57c2VsZWN0ZWRDb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5hdXRob3J9IFx1MDBCNyB7cmVsYXRpdmVUaW1lKHNlbGVjdGVkQ29tbWl0LmRhdGUsIHQpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdERpZmYuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdERpZmYuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge2NvbW1pdEFjdGl2ZUZpbGUgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1maWxlLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e2NvbW1pdEFjdGl2ZUZpbGUucGF0aH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2hpcCBkc2RyLWNoaXAtbVwiPntjb21taXRGaWxlU3RhdHVzKGNvbW1pdFNlZ21lbnRzLmZpbmQoKHMpID0+IHMucGF0aCA9PT0gY29tbWl0QWN0aXZlRmlsZS5wYXRoKT8udGV4dCA/PyAnJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1maWxlLXBhdGhcIj57Y29tbWl0QWN0aXZlRmlsZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBjb21taXRBY3RpdmVGaWxlLmFkZGVkLCBkZWxldGVkOiBjb21taXRBY3RpdmVGaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7dmlldyA9PT0gJ3NwbGl0JyAmJiBnaXRTcGxpdEJsb2Nrcyhjb21taXRBY3RpdmVUZXh0KS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxTcGxpdERpZmYgYmxvY2tzPXtnaXRTcGxpdEJsb2Nrcyhjb21taXRBY3RpdmVUZXh0KX0gYmVmb3JlTGFiZWw9e3QoJ3ZpZXcuYmVmb3JlJyl9IGFmdGVyTGFiZWw9e3QoJ3ZpZXcuYWZ0ZXInKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge2dpdERpZmZSb3dzKGNvbW1pdEFjdGl2ZVRleHQpLm1hcCgocm93LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e2NvbW1pdERpZmY/LmVycm9yID8/IHQoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogc2VsZWN0ZWRGaWxlID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5vcmlnUGF0aCA/IGAgXHUyMTkwICR7c2VsZWN0ZWRGaWxlLm9yaWdQYXRofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogc2VsZWN0ZWRGaWxlLmFkZGVkLCBkZWxldGVkOiBzZWxlY3RlZEZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdhY2NlcHQnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0Jyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1idG4tZGFuZ2VyJHtjb25maXJtID09PSAnZmlsZScgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3JldmVydCcsIHNlbGVjdGVkRmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnZmlsZScgPyB0KCdyZXZpZXcuY29uZmlybVJldmVydCcpIDogdCgncmV2aWV3LnJldmVydCcpfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3ZpZXcgPT09ICdzcGxpdCcgJiYgIXNlbGVjdGVkRmlsZS5iaW5hcnkgJiYgZ2l0U3BsaXRCbG9ja3Moc2VsZWN0ZWRGaWxlLmRpZmYpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxTcGxpdERpZmYgYmxvY2tzPXtnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZil9IGJlZm9yZUxhYmVsPXt0KCd2aWV3LmJlZm9yZScpfSBhZnRlckxhYmVsPXt0KCd2aWV3LmFmdGVyJyl9IC8+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Z2l0RGlmZlJvd3Moc2VsZWN0ZWRGaWxlLmRpZmYpLm1hcCgocm93LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgIHtlcnJvciA/PyB0KCdyZXZpZXcubG9hZEVycm9yJyl9XG4gICAgICAgICAgICB7IXN0YXR1cz8uaXNSZXBvID8gPGRpdj57dCgncmV2aWV3Lm5vdFJlcG9IaW50Jyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZm9vdFwiPlxuICAgICAgICAgIHsobG9hZGluZyB8fCBidXN5KSAmJiB0YWIgPT09ICd3b3Jrc3BhY2UnID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGlubmVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgIHtidXN5ID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1ub3RpY2VcIj57dCgncmV2aWV3LmJ1c3knKX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICB7bm90aWNlID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1ub3RpY2UgZHNkci1ub3RpY2UtJHtub3RpY2Uua2luZH1gfT57bm90aWNlLnRleHR9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG4gIGN0eC5zbG90cy5pbmplY3QoJ3NldHRpbmdzLmdlbmVyYWwuaXRlbScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2V0dGluZ3MuZ2VuZXJhbC5pdGVtJyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1wcmVmZXJlbmNlcycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICB9LFxuICAgICAgRGlmZlJldmlld1NldHRpbmdzUm93LFxuICAgICksXG4gIClcbn1cbiIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBEaWZmIHtcbiAgICBkaWZmKG9sZFN0ciwgbmV3U3RyLCBcbiAgICAvLyBUeXBlIGJlbG93IGlzIG5vdCBhY2N1cmF0ZS9jb21wbGV0ZSAtIHNlZSBhYm92ZSBmb3IgZnVsbCBwb3NzaWJpbGl0aWVzIC0gYnV0IGl0IGNvbXBpbGVzXG4gICAgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIGxldCBjYWxsYmFjaztcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoJ2NhbGxiYWNrJyBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWxsb3cgc3ViY2xhc3NlcyB0byBtYXNzYWdlIHRoZSBpbnB1dCBwcmlvciB0byBydW5uaW5nXG4gICAgICAgIGNvbnN0IG9sZFN0cmluZyA9IHRoaXMuY2FzdElucHV0KG9sZFN0ciwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG5ld1N0cmluZyA9IHRoaXMuY2FzdElucHV0KG5ld1N0ciwgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IG9sZFRva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShvbGRTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgY29uc3QgbmV3VG9rZW5zID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG5ld1N0cmluZywgb3B0aW9ucykpO1xuICAgICAgICByZXR1cm4gdGhpcy5kaWZmV2l0aE9wdGlvbnNPYmoob2xkVG9rZW5zLCBuZXdUb2tlbnMsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGNvbnN0IGRvbmUgPSAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5wb3N0UHJvY2Vzcyh2YWx1ZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgY2FsbGJhY2sodmFsdWUpOyB9LCAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBuZXdUb2tlbnMubGVuZ3RoLCBvbGRMZW4gPSBvbGRUb2tlbnMubGVuZ3RoO1xuICAgICAgICBsZXQgZWRpdExlbmd0aCA9IDE7XG4gICAgICAgIGxldCBtYXhFZGl0TGVuZ3RoID0gbmV3TGVuICsgb2xkTGVuO1xuICAgICAgICBpZiAob3B0aW9ucy5tYXhFZGl0TGVuZ3RoICE9IG51bGwpIHtcbiAgICAgICAgICAgIG1heEVkaXRMZW5ndGggPSBNYXRoLm1pbihtYXhFZGl0TGVuZ3RoLCBvcHRpb25zLm1heEVkaXRMZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1heEV4ZWN1dGlvblRpbWUgPSAoX2EgPSBvcHRpb25zLnRpbWVvdXQpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IEluZmluaXR5O1xuICAgICAgICBjb25zdCBhYm9ydEFmdGVyVGltZXN0YW1wID0gRGF0ZS5ub3coKSArIG1heEV4ZWN1dGlvblRpbWU7XG4gICAgICAgIGNvbnN0IGJlc3RQYXRoID0gW3sgb2xkUG9zOiAtMSwgbGFzdENvbXBvbmVudDogdW5kZWZpbmVkIH1dO1xuICAgICAgICAvLyBTZWVkIGVkaXRMZW5ndGggPSAwLCBpLmUuIHRoZSBjb250ZW50IHN0YXJ0cyB3aXRoIHRoZSBzYW1lIHZhbHVlc1xuICAgICAgICBsZXQgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJlc3RQYXRoWzBdLCBuZXdUb2tlbnMsIG9sZFRva2VucywgMCwgb3B0aW9ucyk7XG4gICAgICAgIGlmIChiZXN0UGF0aFswXS5vbGRQb3MgKyAxID49IG9sZExlbiAmJiBuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgLy8gSWRlbnRpdHkgcGVyIHRoZSBlcXVhbGl0eSBhbmQgdG9rZW5pemVyXG4gICAgICAgICAgICByZXR1cm4gZG9uZSh0aGlzLmJ1aWxkVmFsdWVzKGJlc3RQYXRoWzBdLmxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25jZSB3ZSBoaXQgdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhlIGVkaXQgZ3JhcGggb24gc29tZSBkaWFnb25hbCBrLCB3ZSBjYW5cbiAgICAgICAgLy8gZGVmaW5pdGVseSByZWFjaCB0aGUgZW5kIG9mIHRoZSBlZGl0IGdyYXBoIGluIG5vIG1vcmUgdGhhbiBrIGVkaXRzLCBzb1xuICAgICAgICAvLyB0aGVyZSdzIG5vIHBvaW50IGluIGNvbnNpZGVyaW5nIGFueSBtb3ZlcyB0byBkaWFnb25hbCBrKzEgYW55IG1vcmUgKGZyb21cbiAgICAgICAgLy8gd2hpY2ggd2UncmUgZ3VhcmFudGVlZCB0byBuZWVkIGF0IGxlYXN0IGsrMSBtb3JlIGVkaXRzKS5cbiAgICAgICAgLy8gU2ltaWxhcmx5LCBvbmNlIHdlJ3ZlIHJlYWNoZWQgdGhlIGJvdHRvbSBvZiB0aGUgZWRpdCBncmFwaCwgdGhlcmUncyBub1xuICAgICAgICAvLyBwb2ludCBjb25zaWRlcmluZyBtb3ZlcyB0byBsb3dlciBkaWFnb25hbHMuXG4gICAgICAgIC8vIFdlIHJlY29yZCB0aGlzIGZhY3QgYnkgc2V0dGluZyBtaW5EaWFnb25hbFRvQ29uc2lkZXIgYW5kXG4gICAgICAgIC8vIG1heERpYWdvbmFsVG9Db25zaWRlciB0byBzb21lIGZpbml0ZSB2YWx1ZSBvbmNlIHdlJ3ZlIGhpdCB0aGUgZWRnZSBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaC5cbiAgICAgICAgLy8gVGhpcyBvcHRpbWl6YXRpb24gaXMgbm90IGZhaXRoZnVsIHRvIHRoZSBvcmlnaW5hbCBhbGdvcml0aG0gcHJlc2VudGVkIGluXG4gICAgICAgIC8vIE15ZXJzJ3MgcGFwZXIsIHdoaWNoIGluc3RlYWQgcG9pbnRsZXNzbHkgZXh0ZW5kcyBELXBhdGhzIG9mZiB0aGUgZW5kIG9mXG4gICAgICAgIC8vIHRoZSBlZGl0IGdyYXBoIC0gc2VlIHBhZ2UgNyBvZiBNeWVycydzIHBhcGVyIHdoaWNoIG5vdGVzIHRoaXMgcG9pbnRcbiAgICAgICAgLy8gZXhwbGljaXRseSBhbmQgaWxsdXN0cmF0ZXMgaXQgd2l0aCBhIGRpYWdyYW0uIFRoaXMgaGFzIG1ham9yIHBlcmZvcm1hbmNlXG4gICAgICAgIC8vIGltcGxpY2F0aW9ucyBmb3Igc29tZSBjb21tb24gc2NlbmFyaW9zLiBGb3IgaW5zdGFuY2UsIHRvIGNvbXB1dGUgYSBkaWZmXG4gICAgICAgIC8vIHdoZXJlIHRoZSBuZXcgdGV4dCBzaW1wbHkgYXBwZW5kcyBkIGNoYXJhY3RlcnMgb24gdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgLy8gb3JpZ2luYWwgdGV4dCBvZiBsZW5ndGggbiwgdGhlIHRydWUgTXllcnMgYWxnb3JpdGhtIHdpbGwgdGFrZSBPKG4rZF4yKVxuICAgICAgICAvLyB0aW1lIHdoaWxlIHRoaXMgb3B0aW1pemF0aW9uIG5lZWRzIG9ubHkgTyhuK2QpIHRpbWUuXG4gICAgICAgIGxldCBtaW5EaWFnb25hbFRvQ29uc2lkZXIgPSAtSW5maW5pdHksIG1heERpYWdvbmFsVG9Db25zaWRlciA9IEluZmluaXR5O1xuICAgICAgICAvLyBNYWluIHdvcmtlciBtZXRob2QuIGNoZWNrcyBhbGwgcGVybXV0YXRpb25zIG9mIGEgZ2l2ZW4gZWRpdCBsZW5ndGggZm9yIGFjY2VwdGFuY2UuXG4gICAgICAgIGNvbnN0IGV4ZWNFZGl0TGVuZ3RoID0gKCkgPT4ge1xuICAgICAgICAgICAgZm9yIChsZXQgZGlhZ29uYWxQYXRoID0gTWF0aC5tYXgobWluRGlhZ29uYWxUb0NvbnNpZGVyLCAtZWRpdExlbmd0aCk7IGRpYWdvbmFsUGF0aCA8PSBNYXRoLm1pbihtYXhEaWFnb25hbFRvQ29uc2lkZXIsIGVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggKz0gMikge1xuICAgICAgICAgICAgICAgIGxldCBiYXNlUGF0aDtcbiAgICAgICAgICAgICAgICBjb25zdCByZW1vdmVQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0sIGFkZFBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggKyAxXTtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBvbmUgZWxzZSBpcyBnb2luZyB0byBhdHRlbXB0IHRvIHVzZSB0aGlzIHZhbHVlLCBjbGVhciBpdFxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gcGVyZiBvcHRpbWlzYXRpb24uIFRoaXMgdHlwZS12aW9sYXRpbmcgdmFsdWUgd2lsbCBuZXZlciBiZSByZWFkLlxuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGV0IGNhbkFkZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChhZGRQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoYXQgbmV3UG9zIHdpbGwgYmUgYWZ0ZXIgd2UgZG8gYW4gaW5zZXJ0aW9uOlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRQYXRoTmV3UG9zID0gYWRkUGF0aC5vbGRQb3MgLSBkaWFnb25hbFBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGNhbkFkZCA9IGFkZFBhdGggJiYgMCA8PSBhZGRQYXRoTmV3UG9zICYmIGFkZFBhdGhOZXdQb3MgPCBuZXdMZW47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGNhblJlbW92ZSA9IHJlbW92ZVBhdGggJiYgcmVtb3ZlUGF0aC5vbGRQb3MgKyAxIDwgb2xkTGVuO1xuICAgICAgICAgICAgICAgIGlmICghY2FuQWRkICYmICFjYW5SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBwYXRoIGlzIGEgdGVybWluYWwgdGhlbiBwcnVuZVxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gcGVyZiBvcHRpbWlzYXRpb24uIFRoaXMgdHlwZS12aW9sYXRpbmcgdmFsdWUgd2lsbCBuZXZlciBiZSByZWFkLlxuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBkaWFnb25hbCB0aGF0IHdlIHdhbnQgdG8gYnJhbmNoIGZyb20uIFdlIHNlbGVjdCB0aGUgcHJpb3JcbiAgICAgICAgICAgICAgICAvLyBwYXRoIHdob3NlIHBvc2l0aW9uIGluIHRoZSBvbGQgc3RyaW5nIGlzIHRoZSBmYXJ0aGVzdCBmcm9tIHRoZSBvcmlnaW5cbiAgICAgICAgICAgICAgICAvLyBhbmQgZG9lcyBub3QgcGFzcyB0aGUgYm91bmRzIG9mIHRoZSBkaWZmIGdyYXBoXG4gICAgICAgICAgICAgICAgaWYgKCFjYW5SZW1vdmUgfHwgKGNhbkFkZCAmJiByZW1vdmVQYXRoLm9sZFBvcyA8IGFkZFBhdGgub2xkUG9zKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKGFkZFBhdGgsIHRydWUsIGZhbHNlLCAwLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gdGhpcy5hZGRUb1BhdGgocmVtb3ZlUGF0aCwgZmFsc2UsIHRydWUsIDEsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbiAmJiBuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGhpdCB0aGUgZW5kIG9mIGJvdGggc3RyaW5ncywgdGhlbiB3ZSBhcmUgZG9uZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZSh0aGlzLmJ1aWxkVmFsdWVzKGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSkgfHwgdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSBiYXNlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm9sZFBvcyArIDEgPj0gb2xkTGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBNYXRoLm1pbihtYXhEaWFnb25hbFRvQ29uc2lkZXIsIGRpYWdvbmFsUGF0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQb3MgKyAxID49IG5ld0xlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5tYXgobWluRGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVkaXRMZW5ndGgrKztcbiAgICAgICAgfTtcbiAgICAgICAgLy8gUGVyZm9ybXMgdGhlIGxlbmd0aCBvZiBlZGl0IGl0ZXJhdGlvbi4gSXMgYSBiaXQgZnVnbHkgYXMgdGhpcyBoYXMgdG8gc3VwcG9ydCB0aGVcbiAgICAgICAgLy8gc3luYyBhbmQgYXN5bmMgbW9kZSB3aGljaCBpcyBuZXZlciBmdW4uIExvb3BzIG92ZXIgZXhlY0VkaXRMZW5ndGggdW50aWwgYSB2YWx1ZVxuICAgICAgICAvLyBpcyBwcm9kdWNlZCwgb3IgdW50aWwgdGhlIGVkaXQgbGVuZ3RoIGV4Y2VlZHMgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoIChpZiBnaXZlbiksXG4gICAgICAgIC8vIGluIHdoaWNoIGNhc2UgaXQgd2lsbCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIChmdW5jdGlvbiBleGVjKCkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWRpdExlbmd0aCA+IG1heEVkaXRMZW5ndGggfHwgRGF0ZS5ub3coKSA+IGFib3J0QWZ0ZXJUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXhlY0VkaXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhlYygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9KCkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGVkaXRMZW5ndGggPD0gbWF4RWRpdExlbmd0aCAmJiBEYXRlLm5vdygpIDw9IGFib3J0QWZ0ZXJUaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXQgPSBleGVjRWRpdExlbmd0aCgpO1xuICAgICAgICAgICAgICAgIGlmIChyZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWRkVG9QYXRoKHBhdGgsIGFkZGVkLCByZW1vdmVkLCBvbGRQb3NJbmMsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbGFzdCA9IHBhdGgubGFzdENvbXBvbmVudDtcbiAgICAgICAgaWYgKGxhc3QgJiYgIW9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4gJiYgbGFzdC5hZGRlZCA9PT0gYWRkZWQgJiYgbGFzdC5yZW1vdmVkID09PSByZW1vdmVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogbGFzdC5jb3VudCArIDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCwgcHJldmlvdXNDb21wb25lbnQ6IGxhc3QucHJldmlvdXNDb21wb25lbnQgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb2xkUG9zOiBwYXRoLm9sZFBvcyArIG9sZFBvc0luYyxcbiAgICAgICAgICAgICAgICBsYXN0Q29tcG9uZW50OiB7IGNvdW50OiAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIGRpYWdvbmFsUGF0aCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBuZXdUb2tlbnMubGVuZ3RoLCBvbGRMZW4gPSBvbGRUb2tlbnMubGVuZ3RoO1xuICAgICAgICBsZXQgb2xkUG9zID0gYmFzZVBhdGgub2xkUG9zLCBuZXdQb3MgPSBvbGRQb3MgLSBkaWFnb25hbFBhdGgsIGNvbW1vbkNvdW50ID0gMDtcbiAgICAgICAgd2hpbGUgKG5ld1BvcyArIDEgPCBuZXdMZW4gJiYgb2xkUG9zICsgMSA8IG9sZExlbiAmJiB0aGlzLmVxdWFscyhvbGRUb2tlbnNbb2xkUG9zICsgMV0sIG5ld1Rva2Vuc1tuZXdQb3MgKyAxXSwgb3B0aW9ucykpIHtcbiAgICAgICAgICAgIG5ld1BvcysrO1xuICAgICAgICAgICAgb2xkUG9zKys7XG4gICAgICAgICAgICBjb21tb25Db3VudCsrO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4pIHtcbiAgICAgICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogMSwgcHJldmlvdXNDb21wb25lbnQ6IGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIGFkZGVkOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tbW9uQ291bnQgJiYgIW9wdGlvbnMub25lQ2hhbmdlUGVyVG9rZW4pIHtcbiAgICAgICAgICAgIGJhc2VQYXRoLmxhc3RDb21wb25lbnQgPSB7IGNvdW50OiBjb21tb25Db3VudCwgcHJldmlvdXNDb21wb25lbnQ6IGJhc2VQYXRoLmxhc3RDb21wb25lbnQsIGFkZGVkOiBmYWxzZSwgcmVtb3ZlZDogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBiYXNlUGF0aC5vbGRQb3MgPSBvbGRQb3M7XG4gICAgICAgIHJldHVybiBuZXdQb3M7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICBpZiAob3B0aW9ucy5jb21wYXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb21wYXJhdG9yKGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodFxuICAgICAgICAgICAgICAgIHx8ICghIW9wdGlvbnMuaWdub3JlQ2FzZSAmJiBsZWZ0LnRvTG93ZXJDYXNlKCkgPT09IHJpZ2h0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlbW92ZUVtcHR5KGFycmF5KSB7XG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlbaV0pIHtcbiAgICAgICAgICAgICAgICByZXQucHVzaChhcnJheVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIGNhc3RJbnB1dCh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICB0b2tlbml6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG4gICAgfVxuICAgIGpvaW4oY2hhcnMpIHtcbiAgICAgICAgLy8gQXNzdW1lcyBWYWx1ZVQgaXMgc3RyaW5nLCB3aGljaCBpcyB0aGUgY2FzZSBmb3IgbW9zdCBzdWJjbGFzc2VzLlxuICAgICAgICAvLyBXaGVuIGl0J3MgZmFsc2UsIGUuZy4gaW4gZGlmZkFycmF5cywgdGhpcyBtZXRob2QgbmVlZHMgdG8gYmUgb3ZlcnJpZGRlbiAoZS5nLiB3aXRoIGEgbm8tb3ApXG4gICAgICAgIC8vIFllcywgdGhlIGNhc3RzIGFyZSB2ZXJib3NlIGFuZCB1Z2x5LCBiZWNhdXNlIHRoaXMgcGF0dGVybiAtIG9mIGhhdmluZyB0aGUgYmFzZSBjbGFzcyBTT1JUIE9GXG4gICAgICAgIC8vIGFzc3VtZSB0b2tlbnMgYW5kIHZhbHVlcyBhcmUgc3RyaW5ncywgYnV0IG5vdCBjb21wbGV0ZWx5IC0gaXMgd2VpcmQgYW5kIGphbmt5LlxuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfVxuICAgIHBvc3RQcm9jZXNzKGNoYW5nZU9iamVjdHMsIFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBjaGFuZ2VPYmplY3RzO1xuICAgIH1cbiAgICBnZXQgdXNlTG9uZ2VzdFRva2VuKCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGJ1aWxkVmFsdWVzKGxhc3RDb21wb25lbnQsIG5ld1Rva2Vucywgb2xkVG9rZW5zKSB7XG4gICAgICAgIC8vIEZpcnN0IHdlIGNvbnZlcnQgb3VyIGxpbmtlZCBsaXN0IG9mIGNvbXBvbmVudHMgaW4gcmV2ZXJzZSBvcmRlciB0byBhblxuICAgICAgICAvLyBhcnJheSBpbiB0aGUgcmlnaHQgb3JkZXI6XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHMgPSBbXTtcbiAgICAgICAgbGV0IG5leHRDb21wb25lbnQ7XG4gICAgICAgIHdoaWxlIChsYXN0Q29tcG9uZW50KSB7XG4gICAgICAgICAgICBjb21wb25lbnRzLnB1c2gobGFzdENvbXBvbmVudCk7XG4gICAgICAgICAgICBuZXh0Q29tcG9uZW50ID0gbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGRlbGV0ZSBsYXN0Q29tcG9uZW50LnByZXZpb3VzQ29tcG9uZW50O1xuICAgICAgICAgICAgbGFzdENvbXBvbmVudCA9IG5leHRDb21wb25lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgY29tcG9uZW50cy5yZXZlcnNlKCk7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudExlbiA9IGNvbXBvbmVudHMubGVuZ3RoO1xuICAgICAgICBsZXQgY29tcG9uZW50UG9zID0gMCwgbmV3UG9zID0gMCwgb2xkUG9zID0gMDtcbiAgICAgICAgZm9yICg7IGNvbXBvbmVudFBvcyA8IGNvbXBvbmVudExlbjsgY29tcG9uZW50UG9zKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcbiAgICAgICAgICAgIGlmICghY29tcG9uZW50LnJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCAmJiB0aGlzLnVzZUxvbmdlc3RUb2tlbikge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gb2xkVG9rZW5zW29sZFBvcyArIGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4odmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG5ld1Rva2Vucy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgICAgIC8vIENvbW1vbiBjYXNlXG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4ob2xkVG9rZW5zLnNsaWNlKG9sZFBvcywgb2xkUG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICAgICAgICAgICAgb2xkUG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29tcG9uZW50cztcbiAgICB9XG59XG4iLCAiaW1wb3J0IERpZmYgZnJvbSAnLi9iYXNlLmpzJztcbmltcG9ydCB7IGdlbmVyYXRlT3B0aW9ucyB9IGZyb20gJy4uL3V0aWwvcGFyYW1zLmpzJztcbmNsYXNzIExpbmVEaWZmIGV4dGVuZHMgRGlmZiB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMudG9rZW5pemUgPSB0b2tlbml6ZTtcbiAgICB9XG4gICAgZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKSB7XG4gICAgICAgIC8vIElmIHdlJ3JlIGlnbm9yaW5nIHdoaXRlc3BhY2UsIHdlIG5lZWQgdG8gbm9ybWFsaXNlIGxpbmVzIGJ5IHN0cmlwcGluZ1xuICAgICAgICAvLyB3aGl0ZXNwYWNlIGJlZm9yZSBjaGVja2luZyBlcXVhbGl0eS4gKFRoaXMgaGFzIGFuIGFubm95aW5nIGludGVyYWN0aW9uXG4gICAgICAgIC8vIHdpdGggbmV3bGluZUlzVG9rZW4gdGhhdCByZXF1aXJlcyBzcGVjaWFsIGhhbmRsaW5nOiBpZiBuZXdsaW5lcyBnZXQgdGhlaXJcbiAgICAgICAgLy8gb3duIHRva2VuLCB0aGVuIHdlIERPTidUIHdhbnQgdG8gdHJpbSB0aGUgKm5ld2xpbmUqIHRva2VucyBkb3duIHRvIGVtcHR5XG4gICAgICAgIC8vIHN0cmluZ3MsIHNpbmNlIHRoaXMgd291bGQgY2F1c2UgdXMgdG8gdHJlYXQgd2hpdGVzcGFjZS1vbmx5IGxpbmUgY29udGVudFxuICAgICAgICAvLyBhcyBlcXVhbCB0byBhIHNlcGFyYXRvciBiZXR3ZWVuIGxpbmVzLCB3aGljaCB3b3VsZCBiZSB3ZWlyZCBhbmRcbiAgICAgICAgLy8gaW5jb25zaXN0ZW50IHdpdGggdGhlIGRvY3VtZW50ZWQgYmVoYXZpb3Igb2YgdGhlIG9wdGlvbnMuKVxuICAgICAgICBpZiAob3B0aW9ucy5pZ25vcmVXaGl0ZXNwYWNlKSB7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubmV3bGluZUlzVG9rZW4gfHwgIWxlZnQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFyaWdodC5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zLmlnbm9yZU5ld2xpbmVBdEVvZiAmJiAhb3B0aW9ucy5uZXdsaW5lSXNUb2tlbikge1xuICAgICAgICAgICAgaWYgKGxlZnQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJpZ2h0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdXBlci5lcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpO1xuICAgIH1cbn1cbmV4cG9ydCBjb25zdCBsaW5lRGlmZiA9IG5ldyBMaW5lRGlmZigpO1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkaWZmVHJpbW1lZExpbmVzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IGdlbmVyYXRlT3B0aW9ucyhvcHRpb25zLCB7IGlnbm9yZVdoaXRlc3BhY2U6IHRydWUgfSk7XG4gICAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuLy8gRXhwb3J0ZWQgc3RhbmRhbG9uZSBzbyBpdCBjYW4gYmUgdXNlZCBmcm9tIGpzb25EaWZmIHRvby5cbmV4cG9ydCBmdW5jdGlvbiB0b2tlbml6ZSh2YWx1ZSwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zLnN0cmlwVHJhaWxpbmdDcikge1xuICAgICAgICAvLyByZW1vdmUgb25lIFxcciBiZWZvcmUgXFxuIHRvIG1hdGNoIEdOVSBkaWZmJ3MgLS1zdHJpcC10cmFpbGluZy1jciBiZWhhdmlvclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1xcclxcbi9nLCAnXFxuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJldExpbmVzID0gW10sIGxpbmVzQW5kTmV3bGluZXMgPSB2YWx1ZS5zcGxpdCgvKFxcbnxcXHJcXG4pLyk7XG4gICAgLy8gSWdub3JlIHRoZSBmaW5hbCBlbXB0eSB0b2tlbiB0aGF0IG9jY3VycyBpZiB0aGUgc3RyaW5nIGVuZHMgd2l0aCBhIG5ldyBsaW5lXG4gICAgaWYgKCFsaW5lc0FuZE5ld2xpbmVzW2xpbmVzQW5kTmV3bGluZXMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgbGluZXNBbmROZXdsaW5lcy5wb3AoKTtcbiAgICB9XG4gICAgLy8gTWVyZ2UgdGhlIGNvbnRlbnQgYW5kIGxpbmUgc2VwYXJhdG9ycyBpbnRvIHNpbmdsZSB0b2tlbnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzQW5kTmV3bGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzQW5kTmV3bGluZXNbaV07XG4gICAgICAgIGlmIChpICUgMiAmJiAhb3B0aW9ucy5uZXdsaW5lSXNUb2tlbikge1xuICAgICAgICAgICAgcmV0TGluZXNbcmV0TGluZXMubGVuZ3RoIC0gMV0gKz0gbGluZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldExpbmVzLnB1c2gobGluZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldExpbmVzO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUJBLG1CQUEyRTs7O0FDbkIzRSxJQUFxQixPQUFyQixNQUEwQjtBQUFBLEVBQ3RCLEtBQUssUUFBUSxRQUViLFVBQVUsQ0FBQyxHQUFHO0FBQ1YsUUFBSTtBQUNKLFFBQUksT0FBTyxZQUFZLFlBQVk7QUFDL0IsaUJBQVc7QUFDWCxnQkFBVSxDQUFDO0FBQUEsSUFDZixXQUNTLGNBQWMsU0FBUztBQUM1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

		})(module, module.exports, require);
		return module.exports;
	}
});
