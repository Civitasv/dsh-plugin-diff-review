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
var STYLE_TAG = "dsh-plugin-diff-review/review.css";
var overlayStore = (0, import_client.createSnapshotStore)({
  open: false,
  cwd: null,
  key: 0
});
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
.dsdr-panel{box-sizing:border-box;width:min(1120px,100%);height:min(720px,calc(100vh - 64px));background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;box-shadow:var(--dsw-shadow-lv3);display:flex;flex-direction:column;overflow:hidden}
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
.dsdr-body{display:flex;flex:1;min-height:0}
.dsdr-files{width:300px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow-y:auto;padding:8px}
.dsdr-round{font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);padding:8px 8px 3px;font-weight:600}
.dsdr-round-label{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-weight:400;color:var(--dsw-alias-label-secondary)}
.dsdr-file{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;border-radius:8px;padding:6px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit;color:var(--dsw-alias-label-primary)}
.dsdr-file:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-file-selected{background:var(--dsw-alias-interactive-bg-hover)}
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
.dsdr-pre{margin:0;padding:8px 0;font-family:var(--dsw-font-mono);font-size:12px;line-height:18px;white-space:pre;min-width:100%;flex:1}
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
.dsdr-view-toggle{display:flex;gap:2px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;padding:2px;flex:none}
.dsdr-view-btn{box-sizing:border-box;min-height:22px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:1px 8px;font:inherit;font-size:11px;line-height:16px}
.dsdr-view-btn:hover{color:var(--dsw-alias-label-secondary)}
.dsdr-view-btn-active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-split{min-width:100%}
.dsdr-split-head{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:11px;line-height:18px;color:var(--dsw-alias-label-tertiary);padding:4px 8px;position:sticky;top:0;background:var(--dsw-alias-bg-module-platform)}
.dsdr-split-head div{display:flex;gap:8px}
.dsdr-split-hunk{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-fill-l2);font-family:var(--dsw-font-mono);font-size:11px;line-height:18px;padding:2px 16px}
.dsdr-split-row{display:grid;grid-template-columns:1fr 1fr;font-family:var(--dsw-font-mono);font-size:12px;line-height:18px}
.dsdr-split-cell{display:flex;gap:8px;padding:0 8px;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}
.dsdr-split-num{flex:none;width:36px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;font-size:11px;line-height:18px}
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
  "action.label": "Diff \u5BA1\u67E5",
  "action.aria": "\u5BA1\u67E5\u5F53\u524D\u9879\u76EE\u4E0E\u6BCF\u8F6E\u4FEE\u6539",
  "tab.session": "\u4F1A\u8BDD\u66F4\u6539",
  "tab.workspace": "\u5DE5\u4F5C\u533A",
  "review.title": "Diff \u5BA1\u67E5",
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
  "view.after": "\u65B0\u6587\u4EF6"
};
var en = {
  "action.label": "Diff Review",
  "action.aria": "Review workspace and per-round changes",
  "tab.session": "Session",
  "tab.workspace": "Workspace",
  "review.title": "Diff Review",
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
  "view.after": "After"
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
function DiffReviewOverlay({ sessions, t }) {
  const storeState = (0, import_react.useSyncExternalStore)(overlayStore.subscribe, overlayStore.getSnapshot);
  const [tab, setTab] = (0, import_react.useState)("session");
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
      const next = await loadStatus(cwd);
      setStatus(next);
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
  if (!storeState.open || !cwd) return null;
  const files = status?.isRepo ? status.files : [];
  const selectedFile = files.find((f) => f.path === selected) ?? null;
  const totalAdded = files.reduce((n, f) => n + f.added, 0);
  const totalDeleted = files.reduce((n, f) => n + f.deleted, 0);
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
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-panel", role: "dialog", "aria-modal": "true", "aria-label": t("review.title"), children: [
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-subtitle", children: tab === "session" ? t("review.sessionStats", { rounds: rounds.length, files: totalSessionFiles }) : status?.isRepo ? `${status.branch ?? t("review.detached")} \xB7 ${t("review.changes", { added: totalAdded, deleted: totalDeleted })}` : t("review.notRepo") }),
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
            round.changes.map((change) => {
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
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-name", title: change.path, children: change.path }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-tool", title: change.tool, children: change.tool })
                  ]
                },
                key
              );
            })
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
        ] }) : status?.isRepo && files.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty", children: t("review.empty") }) : status?.isRepo && files.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-body", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-files", role: "listbox", "aria-label": t("tab.workspace"), children: files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              role: "option",
              "aria-selected": file.path === selected,
              className: `dsdr-file${file.path === selected ? " dsdr-file-selected" : ""}`,
              onClick: () => {
                setSelected(file.path);
                setConfirm(null);
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-chip ${chipClass(file.status)}`, children: file.untracked ? "??" : file.status }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-name", title: file.path, children: file.path }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-stat", children: file.binary ? t("review.binary") : t("review.changes", { added: file.added, deleted: file.deleted }) })
              ]
            },
            file.path
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff", children: selectedFile ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
      ] })
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
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERpZmYtcmV2aWV3IHBsdWdpbiBcdTIwMTQgY2xpZW50IGhhbGYuXG4gKlxuICogQ29kZXgtc3R5bGUgcmV2aWV3IHdpdGggdHdvIHNvdXJjZXM6XG4gKlxuICogMS4gKipcdTRGMUFcdThCRERcdTY2RjRcdTY1MzkgKFNlc3Npb24gY2hhbmdlcykqKiBcdTIwMTQgd2hhdCB0aGUgYWdlbnQgY2hhbmdlZCBpbiBlYWNoIHJvdW5kIG9mXG4gKiAgICB0aGlzIGNvbnZlcnNhdGlvbiwgZGVyaXZlZCBmcm9tIHRoZSBjb252ZXJzYXRpb24gc25hcHNob3QgKHRvb2wgcmVzdWx0c1xuICogICAgY2FycnkgdGhlIGhvc3QtY29tcHV0ZWQgYHJlc3VsdFZpZXdgIGRpZmYgaHVua3MpLiBXb3JrcyB3aXRoIG9yIHdpdGhvdXRcbiAqICAgIGdpdCwgYW5kIHNob3dzIGEgY2hhbmdlIGV2ZW4gd2hlbiBubyBkaWZmIHRleHQgaXMgYXZhaWxhYmxlIChwYXRoLW9ubHkpLlxuICogMi4gKipcdTVERTVcdTRGNUNcdTUzM0EgKFdvcmtzcGFjZSkqKiBcdTIwMTQgdGhlIGdpdCB3b3JraW5nIHRyZWUncyB1bmNvbW1pdHRlZCBjaGFuZ2VzXG4gKiAgICAoc3RhZ2VkICsgdW5zdGFnZWQgKyB1bnRyYWNrZWQpIHdpdGggcGVyLWZpbGUgLyBhbGwtZmlsZSBhY2NlcHQgKHN0YWdlKVxuICogICAgYW5kIHJldmVydCAoZGlzY2FyZCkgdGhyb3VnaCB0aGUgcGx1Z2luJ3Mgc2VydmVyIHJvdXRlcy5cbiAqXG4gKiBUaGUgcmV2aWV3IHN1cmZhY2UgbW91bnRzIGluIGBzaGVsbC5vdmVybGF5YCAocm9vdCBzY29wZSkuIFN0YXRlIGhhbmQtb2ZmXG4gKiBiZXR3ZWVuIHRoZSBzZXNzaW9uLXNjb3BlZCBoZWFkZXIgdHJpZ2dlciBhbmQgdGhlIHJvb3Qtc2NvcGVkIG92ZXJsYXkgZ29lc1xuICogdGhyb3VnaCBhIG1vZHVsZS1sZXZlbCBzbmFwc2hvdCBzdG9yZTsgdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCBmb3IgdGhlXG4gKiBjdXJyZW50IHNlc3Npb24gaXMgcmVhZCByZWFjdGl2ZWx5IHRocm91Z2ggYGN0eC5zZXNzaW9uc2AgKGluamVjdGVkIHZpYSB0aGVcbiAqIG92ZXJsYXkgcmVnaXN0cmF0aW9uJ3MgaW5qZWN0IGZhY2UpLlxuICovXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUsIHVzZVN5bmNFeHRlcm5hbFN0b3JlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBkaWZmTGluZXMgfSBmcm9tICdkaWZmJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0LCBJU2Vzc2lvbnMsIFNlc3Npb25MaXN0U3RhdGUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB7IGNyZWF0ZVNuYXBzaG90U3RvcmUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgUHJvcHNMb2NhbGUsIFByb3BzUnVudGltZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNsb3RzJ1xuaW1wb3J0IHR5cGUgeyBDb252ZXJzYXRpb25Ob2RlLCBUb29sUmVzdWx0Tm9kZSwgVXNlck1lc3NhZ2VOb2RlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFRvb2xSZXN1bHRWaWV3IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hcGktcmVtb3Rlcy9jbGllbnQnXG4vLyBUeXBlLW9ubHkgaW1wb3J0cyBwdWxsaW5nIHRoZSBoZWFkZXItYWN0aW9uIHNsb3QgY29udHJhY3QsIHRoZSBzaGVsbC5vdmVybGF5XG4vLyBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdCBpbnRvIHRoaXMgcHJvZ3JhbS5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtbG9jYWxlL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgQXBwbHlSZXNwb25zZSwgRGlmZkZpbGUsIFN0YXR1c1Jlc3BvbnNlIH0gZnJvbSAnLi4vc2hhcmVkL3R5cGVzLnRzJ1xuXG5leHBvcnQgY29uc3QgbmFtZSA9ICdkaWZmLXJldmlldydcblxuLyoqIFJlcXVpcmVkIGNsaWVudCBzZXJ2aWNlcyAoZmliZXIgaW5qZWN0KS4gKi9cbmV4cG9ydCBjb25zdCBpbmplY3QgPSBbJ3Nlc3Npb25zJywgJ3Nsb3RzJywgJ2xvY2FsZSddXG5cbmNvbnN0IExPQ0FMRV9OUyA9ICdkaWZmLXJldmlldydcbmNvbnN0IFNUQVRVU19VUkwgPSAnZGlmZi1yZXZpZXcvc3RhdHVzJ1xuY29uc3QgQVBQTFlfVVJMID0gJ2RpZmYtcmV2aWV3L2FwcGx5J1xuY29uc3QgU1RZTEVfVEFHID0gJ2RzaC1wbHVnaW4tZGlmZi1yZXZpZXcvcmV2aWV3LmNzcydcblxuLyoqIE9wZW4gc3RhdGUgc2hhcmVkIGJldHdlZW4gdGhlIGhlYWRlciB0cmlnZ2VyIChzZXNzaW9uIHNjb3BlKSBhbmQgdGhlIG92ZXJsYXkgKHJvb3Qgc2NvcGUpLiAqL1xuY29uc3Qgb3ZlcmxheVN0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTx7IG9wZW46IGJvb2xlYW47IGN3ZDogc3RyaW5nIHwgbnVsbDsga2V5OiBudW1iZXIgfT4oe1xuICBvcGVuOiBmYWxzZSxcbiAgY3dkOiBudWxsLFxuICBrZXk6IDAsXG59KVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlc3Npb24tY2hhbmdlcyBleHRyYWN0aW9uIChjbGllbnQtc2lkZSwgd29ya3Mgd2l0aG91dCBnaXQpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYmVmb3JlL2FmdGVyIHNsaWNlIG9mIGEgY2hhbmdlIChhIGh1bmspLiAqL1xuaW50ZXJmYWNlIEh1bmsge1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogT25lIGZpbGUgY2hhbmdlZCBpbnNpZGUgb25lIHJvdW5kLiAqL1xuaW50ZXJmYWNlIFJvdW5kQ2hhbmdlIHtcbiAgcGF0aDogc3RyaW5nXG4gIHRvb2w6IHN0cmluZ1xuICBodW5rczogSHVua1tdXG4gIC8qKiBGYWxzZSB3aGVuIG9ubHkgdGhlIHBhdGggaXMga25vd24gKG5vIGRpZmYgZGF0YSBwZXJzaXN0ZWQpLiAqL1xuICBoYXNEaWZmOiBib29sZWFuXG59XG5cbi8qKiBPbmUgdXNlciByb3VuZCBhbmQgdGhlIGZpbGVzIGl0IGNoYW5nZWQuICovXG5pbnRlcmZhY2UgU2Vzc2lvblJvdW5kIHtcbiAgcm91bmQ6IG51bWJlclxuICBsYWJlbDogc3RyaW5nXG4gIGNoYW5nZXM6IFJvdW5kQ2hhbmdlW11cbn1cblxuaW50ZXJmYWNlIEZpbGVEaWZmTGlrZSB7XG4gIHBhdGg6IHN0cmluZ1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogVmFsaWRhdGUgYSByYXcgRmlsZURpZmYtc2hhcGVkIHZhbHVlICh0aGUgdG9vbHMnIGB7cGF0aCwgb2xkVGV4dCwgbmV3VGV4dH1gIGNvbnRyYWN0KS4gKi9cbmZ1bmN0aW9uIGFzRmlsZURpZmYocmF3OiB1bmtub3duKTogRmlsZURpZmZMaWtlIHwgbnVsbCB7XG4gIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBjb25zdCByZWMgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgaWYgKHR5cGVvZiByZWMucGF0aCAhPT0gJ3N0cmluZycgfHwgIXJlYy5wYXRoKSByZXR1cm4gbnVsbFxuICBpZiAodHlwZW9mIHJlYy5uZXdUZXh0ICE9PSAnc3RyaW5nJykgcmV0dXJuIG51bGxcbiAgY29uc3Qgb2xkVGV4dCA9IHJlYy5vbGRUZXh0XG4gIHJldHVybiB7IHBhdGg6IHJlYy5wYXRoLCBvbGRUZXh0OiB0eXBlb2Ygb2xkVGV4dCA9PT0gJ3N0cmluZycgPyBvbGRUZXh0IDogbnVsbCwgbmV3VGV4dDogcmVjLm5ld1RleHQgfVxufVxuXG4vKiogRGlmZiBodW5rcyBjYXJyaWVkIGJ5IGEgY29tcGxldGVkIHRvb2wgcmVzdWx0IChgcmVzdWx0Vmlldy5jYXJkID09PSAnZGlmZidgKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbVJlc3VsdFZpZXcocmVzdWx0VmlldzogVG9vbFJlc3VsdFZpZXcgfCBudWxsKTogRmlsZURpZmZMaWtlW10ge1xuICBpZiAoIXJlc3VsdFZpZXcgfHwgcmVzdWx0Vmlldy5jYXJkICE9PSAnZGlmZicgfHwgIUFycmF5LmlzQXJyYXkocmVzdWx0Vmlldy5kaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gcmVzdWx0Vmlldy5kaWZmcy5tYXAoYXNGaWxlRGlmZikuZmlsdGVyKChkKTogZCBpcyBGaWxlRGlmZkxpa2UgPT4gZCAhPT0gbnVsbClcbn1cblxuLyoqIFJhdyBgbWV0YS5kaWZmc2AgZmFsbGJhY2sgKHRoZSBwZXJzaXN0ZWQgdG9vbC9yZXN1bHQgbWV0YSkuICovXG5mdW5jdGlvbiBkaWZmc0Zyb21NZXRhKG1ldGE6IHVua25vd24pOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghbWV0YSB8fCB0eXBlb2YgbWV0YSAhPT0gJ29iamVjdCcpIHJldHVybiBbXVxuICBjb25zdCBkaWZmcyA9IChtZXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5kaWZmc1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZGlmZnMpKSByZXR1cm4gW11cbiAgcmV0dXJuIGRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG5jb25zdCBNVVRBVElPTl9UT09MUyA9IG5ldyBTZXQoWydzdHJfcmVwbGFjZV9lZGl0b3InLCAnbm90ZWJvb2tfZWRpdCddKVxuY29uc3QgTVVUQVRJT05fQ09NTUFORFMgPSBuZXcgU2V0KFsnd3JpdGUnLCAnZWRpdCcsICdyZXBsYWNlJywgJ2RlbGV0ZScsICdtb3ZlJ10pXG5cbi8qKiBQYXRoLW9ubHkgZmFsbGJhY2sgZm9yIGtub3duIGZpbGUtbXV0YXRpbmcgdG9vbHMgd2hvc2UgcmVzdWx0IGNhcnJpZWQgbm8gZGlmZi4gKi9cbmZ1bmN0aW9uIG11dGF0aW9uUGF0aCh0b29sOiBzdHJpbmcsIGFyZ3NSYXc6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBsZXQgYXJnczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsID0gbnVsbFxuICB0cnkge1xuICAgIGFyZ3MgPSBKU09OLnBhcnNlKGFyZ3NSYXcpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKCFhcmdzIHx8IHR5cGVvZiBhcmdzICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgaWYgKHRvb2wgPT09ICdmcycgfHwgdG9vbCA9PT0gJ2ZpbGVzeXN0ZW0nKSB7XG4gICAgY29uc3QgY21kID0gdHlwZW9mIGFyZ3MuY29tbWFuZCA9PT0gJ3N0cmluZycgPyBhcmdzLmNvbW1hbmQgOiAnJ1xuICAgIGlmICghTVVUQVRJT05fQ09NTUFORFMuaGFzKGNtZCkpIHJldHVybiBudWxsXG4gICAgcmV0dXJuIHR5cGVvZiBhcmdzLmZpbGVfcGF0aCA9PT0gJ3N0cmluZycgJiYgYXJncy5maWxlX3BhdGggPyBhcmdzLmZpbGVfcGF0aCA6IG51bGxcbiAgfVxuICBpZiAoTVVUQVRJT05fVE9PTFMuaGFzKHRvb2wpIHx8IHRvb2wuc3RhcnRzV2l0aCgnZWRpdCcpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgWydmaWxlX3BhdGgnLCAncGF0aCcsICdmaWxlbmFtZSddKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3Nba2V5XSA9PT0gJ3N0cmluZycgJiYgYXJnc1trZXldKSByZXR1cm4gYXJnc1trZXldIGFzIHN0cmluZ1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG4vKiogRXh0cmFjdCB0aGUgY2hhbmdlZCBmaWxlcyBmcm9tIG9uZSBzZXR0bGVkIHRvb2wgcmVzdWx0IChkaWZmIGh1bmtzLCBlbHNlIHBhdGgtb25seSkuICovXG5mdW5jdGlvbiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQoY2FsbDogeyBuYW1lOiBzdHJpbmc7IGFyZ3NSYXc6IHN0cmluZyB9LCBub2RlOiBUb29sUmVzdWx0Tm9kZSk6IFJvdW5kQ2hhbmdlW10ge1xuICBjb25zdCB0b29sID0gY2FsbC5uYW1lXG4gIGNvbnN0IGRpZmZzID0gZGlmZnNGcm9tUmVzdWx0Vmlldyhub2RlLnJlc3VsdFZpZXcpXG4gIGNvbnN0IGZhbGxiYWNrRGlmZnMgPSBkaWZmcy5sZW5ndGggPT09IDAgPyBkaWZmc0Zyb21NZXRhKG5vZGUubWV0YSkgOiBbXVxuICBjb25zdCBhbGxEaWZmcyA9IGRpZmZzLmxlbmd0aCA+IDAgPyBkaWZmcyA6IGZhbGxiYWNrRGlmZnNcbiAgaWYgKGFsbERpZmZzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUm91bmRDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGQgb2YgYWxsRGlmZnMpIHtcbiAgICAgIGxldCBlbnRyeSA9IGJ5UGF0aC5nZXQoZC5wYXRoKVxuICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICBlbnRyeSA9IHsgcGF0aDogZC5wYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IHRydWUgfVxuICAgICAgICBieVBhdGguc2V0KGQucGF0aCwgZW50cnkpXG4gICAgICB9XG4gICAgICBlbnRyeS5odW5rcy5wdXNoKHsgb2xkVGV4dDogZC5vbGRUZXh0LCBuZXdUZXh0OiBkLm5ld1RleHQgfSlcbiAgICB9XG4gICAgcmV0dXJuIFsuLi5ieVBhdGgudmFsdWVzKCldXG4gIH1cbiAgY29uc3QgcGF0aCA9IG11dGF0aW9uUGF0aCh0b29sLCBjYWxsLmFyZ3NSYXcpXG4gIHJldHVybiBwYXRoID8gW3sgcGF0aCwgdG9vbCwgaHVua3M6IFtdLCBoYXNEaWZmOiBmYWxzZSB9XSA6IFtdXG59XG5cbi8qKiBQbGFpbiB0ZXh0IG9mIGEgdXNlciBtZXNzYWdlIChjb250ZW50IGJsb2NrcyBvZiB0eXBlICd0ZXh0JykuICovXG5mdW5jdGlvbiB1c2VyVGV4dChub2RlOiBVc2VyTWVzc2FnZU5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIG5vZGUuY29udGVudCkge1xuICAgIGlmIChibG9jayAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnICYmIChibG9jayBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICd0ZXh0JyAmJiB0eXBlb2YgKGJsb2NrIGFzIHsgdGV4dD86IHVua25vd24gfSkudGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBhcnRzLnB1c2goKGJsb2NrIGFzIHsgdGV4dDogc3RyaW5nIH0pLnRleHQpXG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJ0cy5qb2luKCcgJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxufVxuXG4vKiogV2FsayB0aGUgY29udmVyc2F0aW9uIG5vZGVzIGFuZCBncm91cCBjaGFuZ2VkIGZpbGVzIGJ5IHVzZXIgcm91bmQuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdFNlc3Npb25Sb3VuZHMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IFNlc3Npb25Sb3VuZFtdIHtcbiAgY29uc3Qgcm91bmRzOiBTZXNzaW9uUm91bmRbXSA9IFtdXG4gIGxldCBjdXJyZW50OiBTZXNzaW9uUm91bmQgfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBpZiAobm9kZS5raW5kID09PSAndXNlcicpIHtcbiAgICAgIGN1cnJlbnQgPSB7IHJvdW5kOiByb3VuZHMubGVuZ3RoICsgMSwgbGFiZWw6IHVzZXJUZXh0KG5vZGUpLnNsaWNlKDAsIDYwKSwgY2hhbmdlczogW10gfVxuICAgICAgcm91bmRzLnB1c2goY3VycmVudClcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcgfHwgIWN1cnJlbnQgfHwgIW5vZGUuY2FsbCkgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBjaGFuZ2UucGF0aCAmJiBjLnRvb2wgPT09IGNoYW5nZS50b29sKVxuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGlmIChjaGFuZ2UuaGFzRGlmZikge1xuICAgICAgICAgIGV4aXN0aW5nLmh1bmtzLnB1c2goLi4uY2hhbmdlLmh1bmtzKVxuICAgICAgICAgIGV4aXN0aW5nLmhhc0RpZmYgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQuY2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdW5kcy5maWx0ZXIoKHIpID0+IHIuY2hhbmdlcy5sZW5ndGggPiAwKVxufVxuXG4vKiogQ291bnQgb2YgY2hhbmdlZCBmaWxlcyBhY3Jvc3MgYWxsIHJvdW5kcyAoZm9yIHRoZSBoZWFkZXIgYmFkZ2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDBcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcgfHwgIW5vZGUuY2FsbCkgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhbmdlLnRvb2x9OiR7Y2hhbmdlLnBhdGh9YFxuICAgICAgaWYgKCFzZWVuLmhhcyhrZXkpKSB7XG4gICAgICAgIHNlZW4uYWRkKGtleSlcbiAgICAgICAgY291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnRcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWZmIHJlbmRlcmluZy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIERpZmZSb3cgPSB7IGtpbmQ6ICdhZGQnIHwgJ2RlbCcgfCAnY3R4JyB8ICdodW5rJyB8ICdmaWxlJyB8ICdub3RlJzsgdGV4dDogc3RyaW5nIH1cblxuLyoqIENsYXNzaWZ5IHJhdyB1bmlmaWVkLWRpZmYgdGV4dCAoZ2l0IG91dHB1dCkgaW50byByb3dzLiAqL1xuZnVuY3Rpb24gZ2l0RGlmZlJvd3MoZGlmZjogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgcmV0dXJuIGRpZmYuc3BsaXQoJ1xcbicpLm1hcCgobGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykpIHJldHVybiB7IGtpbmQ6ICdmaWxlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkgcmV0dXJuIHsga2luZDogJ2h1bmsnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIHJldHVybiB7IGtpbmQ6ICdhZGQnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIHJldHVybiB7IGtpbmQ6ICdkZWwnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSByZXR1cm4geyBraW5kOiAnbm90ZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIHJldHVybiB7IGtpbmQ6ICdjdHgnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgfSlcbn1cblxuLyoqIENvbXB1dGUgYWRkL2RlbC9jdHggcm93cyBiZXR3ZWVuIHR3byB0ZXh0cyAodGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSkuICovXG5mdW5jdGlvbiB0ZXh0RGlmZlJvd3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvd3Ncbn1cblxuLyoqIEFsbCByb3dzIGZvciBvbmUgcm91bmQgY2hhbmdlIChtdWx0aXBsZSBodW5rcyBnZXQgYEBAYCBzZXBhcmF0b3JzKS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVJvd3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IERpZmZSb3dbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGNoYW5nZS5odW5rcy5mb3JFYWNoKChodW5rLCBpKSA9PiB7XG4gICAgaWYgKGNoYW5nZS5odW5rcy5sZW5ndGggPiAxKSByb3dzLnB1c2goeyBraW5kOiAnaHVuaycsIHRleHQ6IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIH0pXG4gICAgcm93cy5wdXNoKC4uLnRleHREaWZmUm93cyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dCkpXG4gIH0pXG4gIHJldHVybiByb3dzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3BsaXQgKHR3by1jb2x1bW4pIGRpZmYgdmlldy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogT25lIGFsaWduZWQgcm93IG9mIHRoZSBzaWRlLWJ5LXNpZGUgdmlldy4gKi9cbmludGVyZmFjZSBTcGxpdFJvdyB7XG4gIGxlZnQ6IHN0cmluZ1xuICByaWdodDogc3RyaW5nXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBvbGQgZmlsZSwgb3IgbnVsbCAocHVyZSBhZGRpdGlvbikuICovXG4gIGxlZnROdW06IG51bWJlciB8IG51bGxcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG5ldyBmaWxlLCBvciBudWxsIChwdXJlIGRlbGV0aW9uKS4gKi9cbiAgcmlnaHROdW06IG51bWJlciB8IG51bGxcbiAga2luZDogJ2N0eCcgfCAnY2hhbmdlJ1xufVxuXG4vKiogT25lIHNpZGUtYnktc2lkZSBibG9jayAoYSBodW5rIHdpdGggaXRzIGBAQGAgaGVhZGVyKS4gKi9cbmludGVyZmFjZSBTcGxpdEJsb2NrIHtcbiAgaGVhZDogc3RyaW5nIHwgbnVsbFxuICByb3dzOiBTcGxpdFJvd1tdXG59XG5cbi8qKlxuICogUGFpciBhZGQvZGVsIHJvd3MgaW50byBhbGlnbmVkIGxlZnQvcmlnaHQgY29sdW1ucy4gUmVtb3ZlZCBsaW5lcyBidWZmZXJcbiAqIHVudGlsIHRoZSBtYXRjaGluZyBhZGRpdGlvbnMgYXJyaXZlICh1bmlmaWVkIGRpZmYgb3JkZXJzIGRlbGV0aW9ucyBiZWZvcmVcbiAqIGFkZGl0aW9ucyksIHNvIHB1cmUgZGVsZXRpb25zIGFuZCBwdXJlIGFkZGl0aW9ucyBzdGlsbCBnZXQgdGhlaXIgb3duIHJvd1xuICogd2l0aCBhbiBlbXB0eSBjZWxsIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLiBMaW5lIG51bWJlcnMgdHJhY2sgZnJvbSB0aGUgaHVua1xuICogaGVhZGVyJ3MgYC1hLGIgK2MsZGAgcG9zaXRpb25zLlxuICovXG5mdW5jdGlvbiBwYWlyUm93cyhyb3dzOiBEaWZmUm93W10sIG9sZFN0YXJ0OiBudW1iZXIsIG5ld1N0YXJ0OiBudW1iZXIpOiBTcGxpdFJvd1tdIHtcbiAgY29uc3Qgb3V0OiBTcGxpdFJvd1tdID0gW11cbiAgbGV0IG9sZExpbmUgPSBvbGRTdGFydFxuICBsZXQgbmV3TGluZSA9IG5ld1N0YXJ0XG4gIGxldCBwZW5kaW5nOiB7IHRleHQ6IHN0cmluZzsgbnVtOiBudW1iZXIgfVtdID0gW11cbiAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBwIG9mIHBlbmRpbmcpIG91dC5wdXNoKHsgbGVmdDogcC50ZXh0LCByaWdodDogJycsIGxlZnROdW06IHAubnVtLCByaWdodE51bTogbnVsbCwga2luZDogJ2NoYW5nZScgfSlcbiAgICBwZW5kaW5nID0gW11cbiAgfVxuICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgcGVuZGluZy5wdXNoKHsgdGV4dDogcm93LnRleHQuc2xpY2UoMSksIG51bTogb2xkTGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgIGNvbnN0IHAgPSBwZW5kaW5nLnNoaWZ0KClcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogcD8udGV4dCA/PyAnJywgcmlnaHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBsZWZ0TnVtOiBwPy5udW0gPz8gbnVsbCwgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2NoYW5nZScgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgZmx1c2goKVxuICAgICAgLy8gVW5pZmllZC1kaWZmIGNvbnRleHQgbGluZXMgY2FycnkgYSBsZWFkaW5nIHNwYWNlIFx1MjAxNCBzdHJpcCBpdCBmb3IgdGhlXG4gICAgICAvLyBzcGxpdCBjZWxscyBzbyBib3RoIGNvbHVtbnMgcmVuZGVyIGJhcmUgdGV4dC5cbiAgICAgIGNvbnN0IHRleHQgPSByb3cudGV4dC5zdGFydHNXaXRoKCcgJykgPyByb3cudGV4dC5zbGljZSgxKSA6IHJvdy50ZXh0XG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHRleHQsIHJpZ2h0OiB0ZXh0LCBsZWZ0TnVtOiBvbGRMaW5lKyssIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjdHgnIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGZsdXNoKCkgLy8gbm90ZXMgKFxcIE5vIG5ld2xpbmVcdTIwMjYpIGFuZCBzdHJheSByb3dzOiBqdXN0IGJyZWFrIHRoZSBwYWlyaW5nXG4gICAgfVxuICB9XG4gIGZsdXNoKClcbiAgcmV0dXJuIG91dFxufVxuXG4vKiogUGFyc2UgZ2l0IHVuaWZpZWQgZGlmZiB0ZXh0IGludG8gYmxvY2tzIChgLS0tLysrK2AgZmlsZSByb3dzIGFuZCBgQEBgIGh1bmtzKS4gKi9cbmNvbnN0IEdJVF9NRVRBID0gL14oZGlmZiAtLWdpdCB8aW5kZXggfG5ldyBmaWxlIHxkZWxldGVkIGZpbGUgfG9sZCBtb2RlIHxuZXcgbW9kZSB8c2ltaWxhcml0eSBpbmRleCB8cmVuYW1lIChmcm9tfHRvKSB8QmluYXJ5IGZpbGVzICkvXG5cbmZ1bmN0aW9uIHBhcnNlR2l0QmxvY2tzKGRpZmY6IHN0cmluZyk6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10ge1xuICBjb25zdCBibG9ja3M6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH0gfCBudWxsID0gbnVsbFxuICBjb25zdCBsaW5lcyA9IGRpZmYuc3BsaXQoJ1xcbicpXG4gIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgbGV0IGtpbmQ6IERpZmZSb3dbJ2tpbmQnXVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykgfHwgR0lUX01FVEEudGVzdChsaW5lKSkga2luZCA9ICdmaWxlJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkga2luZCA9ICdodW5rJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKycpKSBraW5kID0gJ2FkZCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkga2luZCA9ICdkZWwnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSBraW5kID0gJ25vdGUnXG4gICAgZWxzZSBraW5kID0gJ2N0eCdcbiAgICBpZiAoa2luZCA9PT0gJ2ZpbGUnIHx8IGtpbmQgPT09ICdodW5rJykge1xuICAgICAgY3VycmVudCA9IHsgaGVhZDogeyBraW5kLCB0ZXh0OiBsaW5lIH0sIHJvd3M6IFtdIH1cbiAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY3VycmVudCkge1xuICAgICAgICBjdXJyZW50ID0geyBoZWFkOiBudWxsLCByb3dzOiBbXSB9XG4gICAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgICB9XG4gICAgICBjdXJyZW50LnJvd3MucHVzaCh7IGtpbmQsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJsb2Nrc1xufVxuXG4vKiogSHVuayBzdGFydCBwb3NpdGlvbnMgZnJvbSBhIGBAQCAtYSxiICtjLGQgQEBgIGhlYWRlci4gKi9cbmZ1bmN0aW9uIGh1bmtTdGFydHMoaGVhZDogc3RyaW5nKTogeyBvbGRTdGFydDogbnVtYmVyOyBuZXdTdGFydDogbnVtYmVyIH0ge1xuICBjb25zdCBtID0gL15AQCAtKFxcZCspKD86LFxcZCspPyBcXCsoXFxkKykvLmV4ZWMoaGVhZClcbiAgcmV0dXJuIHsgb2xkU3RhcnQ6IG0gPyBOdW1iZXIobVsxXSkgOiAxLCBuZXdTdGFydDogbSA/IE51bWJlcihtWzJdKSA6IDEgfVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgYSBnaXQgdW5pZmllZCBkaWZmIChza2lwcyBwdXJlIGZpbGUtaGVhZGVyIGJsb2NrcykuICovXG5mdW5jdGlvbiBnaXRTcGxpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICByZXR1cm4gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgICAuZmlsdGVyKChiKSA9PiBiLmhlYWQ/LmtpbmQgIT09ICdmaWxlJyAmJiAoYi5yb3dzLmxlbmd0aCA+IDAgfHwgYi5oZWFkPy5raW5kID09PSAnaHVuaycpKVxuICAgIC5tYXAoKGIpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0cyA9IGIuaGVhZCA/IGh1bmtTdGFydHMoYi5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgcmV0dXJuIHsgaGVhZDogYi5oZWFkPy5raW5kID09PSAnaHVuaycgPyBiLmhlYWQudGV4dCA6IG51bGwsIHJvd3M6IHBhaXJSb3dzKGIucm93cywgc3RhcnRzLm9sZFN0YXJ0LCBzdGFydHMubmV3U3RhcnQpIH1cbiAgICB9KVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgdGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSAob2xkVGV4dC9uZXdUZXh0KS4gKi9cbmZ1bmN0aW9uIHRleHRTcGxpdEJsb2NrcyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gW3sgaGVhZDogbnVsbCwgcm93czogcGFpclJvd3Mocm93cywgMSwgMSkgfV1cbn1cblxuLyoqIEFsbCBzaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBvbmUgcm91bmQgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hhbmdlU3BsaXRCbG9ja3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IFNwbGl0QmxvY2tbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIHJldHVybiBjaGFuZ2UuaHVua3MubWFwKChodW5rLCBpKSA9PiAoe1xuICAgIGhlYWQ6IGNoYW5nZS5odW5rcy5sZW5ndGggPiAxID8gYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgOiBudWxsLFxuICAgIHJvd3M6IHRleHRTcGxpdEJsb2NrcyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dClbMF0ucm93cyxcbiAgfSkpXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3R5bGVzIChkc2RyLSo7IHRoZSBoZWFkZXIgdHJpZ2dlciBtaXJyb3JzIHRoZSBpbi10cmVlIGFjdGlvbiByb3dzKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBSRVZJRVdfQ1NTID0gYFxuLmRzZHItdHJpZ2dlcnttaW4taGVpZ2h0OjI4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjRweDtwYWRkaW5nOjNweCA2cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXRyaWdnZXI6aG92ZXIsLmRzZHItdHJpZ2dlcjpmb2N1cy12aXNpYmxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbGFiZWx7bWFyZ2luLWxlZnQ6MnB4fVxuLmRzZHItY291bnR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDttaW4td2lkdGg6MTZweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA1cHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItb3ZlcmxheXtwb3NpdGlvbjpmaXhlZDtpbnNldDowO3otaW5kZXg6MjAwO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNDUpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtwYWRkaW5nOjMycHh9XG4uZHNkci1wYW5lbHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6bWluKDExMjBweCwxMDAlKTtoZWlnaHQ6bWluKDcyMHB4LGNhbGMoMTAwdmggLSA2NHB4KSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6MTRweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWhlYWRlcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6MTJweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLXRpdGxle2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zdWJ0aXRsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItdGFic3tkaXNwbGF5OmZsZXg7Z2FwOjRweDttYXJnaW4tbGVmdDoxNHB4fVxuLmRzZHItdGFie2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI2cHg7Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoycHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLXRhYjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXRhYi1hY3RpdmV7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGFjZXJ7ZmxleDoxfVxuLmRzZHItYnRue2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweH1cbi5kc2RyLWJ0bjpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuOmRpc2FibGVke29wYWNpdHk6LjU7Y3Vyc29yOmRlZmF1bHR9XG4uZHNkci1idG4tcHJpbWFyeXtib3JkZXItY29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC00MDApO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcjpob3Zlcjpub3QoOmRpc2FibGVkKXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tY29uZmlybXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItYnRuLWNvbmZpcm06aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1ib2R5e2Rpc3BsYXk6ZmxleDtmbGV4OjE7bWluLWhlaWdodDowfVxuLmRzZHItZmlsZXN7d2lkdGg6MzAwcHg7ZmxleDpub25lO2JvcmRlci1yaWdodDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7b3ZlcmZsb3cteTphdXRvO3BhZGRpbmc6OHB4fVxuLmRzZHItcm91bmR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6OHB4IDhweCAzcHg7Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItcm91bmQtbGFiZWx7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjQwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWZpbGV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmlsZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1maWxlLXNlbGVjdGVke2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbGUtbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmlsZS1zdGF0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWNoaXB7ZmxleDpub25lO21pbi13aWR0aDoyMnB4O3RleHQtYWxpZ246Y2VudGVyO2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNoaXAtbXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtYXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtZHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xNik7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWNoaXAtcntiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpO2NvbG9yOiM1OGE2ZmZ9XG4uZHNkci1jaGlwLXV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXRvb2x7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1kaWZme2ZsZXg6MTttaW4td2lkdGg6MDtvdmVyZmxvdzphdXRvO3BhZGRpbmc6MTBweCAwfVxuLmRzZHItZGlmZi1lbXB0eXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7aGVpZ2h0OjEwMCU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWRpZmYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6NnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItZGlmZi1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZGlmZi1zdGF0c3tmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXNjcm9sbHtmbGV4OjE7bWluLWhlaWdodDowO292ZXJmbG93OmF1dG87ZGlzcGxheTpmbGV4fVxuLmRzZHItcHJle21hcmdpbjowO3BhZGRpbmc6OHB4IDA7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDt3aGl0ZS1zcGFjZTpwcmU7bWluLXdpZHRoOjEwMCU7ZmxleDoxfVxuLmRzZHItbGluZXtkaXNwbGF5OmZsZXg7cGFkZGluZzowIDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItbGluZS1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItbGluZS1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItbGluZS1odW5re2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWZpbGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtbm90ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc3R5bGU6aXRhbGljfVxuLmRzZHItZm9vdHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO21pbi1oZWlnaHQ6MzZweH1cbi5kc2RyLW5vdGljZXtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLW5vdGljZS1va3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLW5vdGljZS1lcnJvcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1zcGlubmVye2ZsZXg6bm9uZTt3aWR0aDoxMnB4O2hlaWdodDoxMnB4O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlcjoycHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXRvcC1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTthbmltYXRpb246ZHNkci1zcGluIC44cyBsaW5lYXIgaW5maW5pdGV9XG5Aa2V5ZnJhbWVzIGRzZHItc3Bpbnt0b3t0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fVxuLmRzZHItZW1wdHl7cGFkZGluZzo0MHB4O3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1ub2RpZmZ7cGFkZGluZzo4cHggMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItdmlldy10b2dnbGV7ZGlzcGxheTpmbGV4O2dhcDoycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjJweDtmbGV4Om5vbmV9XG4uZHNkci12aWV3LWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyMnB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjFweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci12aWV3LWJ0bjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXZpZXctYnRuLWFjdGl2ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXR7bWluLXdpZHRoOjEwMCV9XG4uZHNkci1zcGxpdC1oZWFke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo0cHggOHB4O3Bvc2l0aW9uOnN0aWNreTt0b3A6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItc3BsaXQtaGVhZCBkaXZ7ZGlzcGxheTpmbGV4O2dhcDo4cHh9XG4uZHNkci1zcGxpdC1odW5re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjJweCAxNnB4fVxuLmRzZHItc3BsaXQtcm93e2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItc3BsaXQtY2VsbHtkaXNwbGF5OmZsZXg7Z2FwOjhweDtwYWRkaW5nOjAgOHB4O3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXQtbnVte2ZsZXg6bm9uZTt3aWR0aDozNnB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci1zcGxpdC10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MH1cbi5kc2RyLWNlbGwtYWRke2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjEzKX1cbi5kc2RyLWNlbGwtZGVse2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjEyKX1cbi5kc2RyLWNlbGwtZGlte2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDEsIHJnYmEoMTI4LDEyOCwxMjgsLjA1KSl9XG5gXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZVtkYXRhLXBsdWdpbi1jc3M9JHtKU09OLnN0cmluZ2lmeShTVFlMRV9UQUcpfV1gKSA9PT0gbnVsbCkge1xuICBjb25zdCB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gIHRhZy5kYXRhc2V0LnBsdWdpbiA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3J1xuICB0YWcuZGF0YXNldC5wbHVnaW5Dc3MgPSBTVFlMRV9UQUdcbiAgdGFnLnRleHRDb250ZW50ID0gUkVWSUVXX0NTU1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRhZylcbn1cblxuLyoqIFNpbXBsaWZpZWQgQ2hpbmVzZSBkaWN0aW9uYXJ5IChrZXktc2V0IHNvdXJjZSBvZiB0cnV0aCkuICovXG5jb25zdCB6aCA9IHtcbiAgJ2FjdGlvbi5sYWJlbCc6ICdEaWZmIFx1NUJBMVx1NjdFNScsXG4gICdhY3Rpb24uYXJpYSc6ICdcdTVCQTFcdTY3RTVcdTVGNTNcdTUyNERcdTk4NzlcdTc2RUVcdTRFMEVcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzknLFxuICAndGFiLnNlc3Npb24nOiAnXHU0RjFBXHU4QkREXHU2NkY0XHU2NTM5JyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnXHU1REU1XHU0RjVDXHU1MzNBJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdEaWZmIFx1NUJBMVx1NjdFNScsXG4gICdyZXZpZXcuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnXHU2RTM4XHU3OUJCIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnXHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHU0RTBEXHU2NjJGIGdpdCBcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1x1MzAwQ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOVx1MzAwRFx1OTg3NVx1N0I3RVx1NEUwRFx1NTNEN1x1NUY3MVx1NTRDRFx1RkYwQ1x1NEVDRFx1NTNFRlx1NjdFNVx1NzcwQlx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOVx1MzAwMicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdcdThGRDlcdTRFMkFcdTRGMUFcdThCRERcdThGRDhcdTZDQTFcdTY3MDlcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzlcdThCQjBcdTVGNTUnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSBcdThGNkUgXHUwMEI3IHtmaWxlc30gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdcdTdCMkMge3JvdW5kfSBcdThGNkUnLFxuICAncmV2aWV3LmVtcHR5JzogJ1x1NkNBMVx1NjcwOVx1NjcyQVx1NjNEMFx1NEVBNFx1NzY4NFx1NjZGNFx1NjUzOSBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdcdTUxNjhcdTkwRThcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcucmVmcmVzaCc6ICdcdTUyMzdcdTY1QjAnLFxuICAncmV2aWV3LmNsb3NlJzogJ1x1NTE3M1x1OTVFRCcsXG4gICdyZXZpZXcuYnVzeSc6ICdcdTU5MDRcdTc0MDZcdTRFMkRcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LmRvbmVPbmUnOiAnXHU1REYye2FjdGlvbn0ge3BhdGh9JyxcbiAgJ3Jldmlldy5hY2NlcHRlZCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydGVkJzogJ1x1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ1x1NjcyQVx1OERERlx1OEUyQScsXG4gICdyZXZpZXcuYmluYXJ5JzogJ1x1NEU4Q1x1OEZEQlx1NTIzNicsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdcdThCRTVcdTRGRUVcdTY1MzlcdTZDQTFcdTY3MDkgZGlmZiBcdTY1NzBcdTYzNkUnLFxuICAncmV2aWV3LmNoYW5nZXMnOiAne2FkZGVkfSsge2RlbGV0ZWR9LScsXG4gICd2aWV3LnNpbmdsZSc6ICdcdTUzNTVcdTY4MEYnLFxuICAndmlldy5zcGxpdCc6ICdcdTUzQ0NcdTY4MEYnLFxuICAndmlldy5iZWZvcmUnOiAnXHU1MzlGXHU2NTg3XHU0RUY2JyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnXHU2NUIwXHU2NTg3XHU0RUY2Jyxcbn0gYXMgY29uc3RcblxuLyoqIEVuZ2xpc2ggZGljdGlvbmFyeSwgY2hlY2tlZCBjb21wbGV0ZSBhZ2FpbnN0IHRoZSB6aCBrZXkgc2V0LiAqL1xuY29uc3QgZW46IFJlY29yZDxrZXlvZiB0eXBlb2YgemgsIHN0cmluZz4gPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnRGlmZiBSZXZpZXcnLFxuICAnYWN0aW9uLmFyaWEnOiAnUmV2aWV3IHdvcmtzcGFjZSBhbmQgcGVyLXJvdW5kIGNoYW5nZXMnLFxuICAndGFiLnNlc3Npb24nOiAnU2Vzc2lvbicsXG4gICd0YWIud29ya3NwYWNlJzogJ1dvcmtzcGFjZScsXG4gICdyZXZpZXcudGl0bGUnOiAnRGlmZiBSZXZpZXcnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdicmFuY2gnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ2RldGFjaGVkIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnVGhpcyBkaXJlY3RvcnkgaXMgbm90IGEgZ2l0IHJlcG9zaXRvcnknLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1RoZSBcIlNlc3Npb25cIiB0YWIgc3RpbGwgc2hvd3MgZXZlcnkgcm91bmRcXCdzIGNoYW5nZXMuJyxcbiAgJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBpbiB0aGlzIHNlc3Npb24geWV0JyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gcm91bmRzIFx1MDBCNyB7ZmlsZXN9IGZpbGVzJyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdSb3VuZCB7cm91bmR9JyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdObyB1bmNvbW1pdHRlZCBjaGFuZ2VzIFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ0ZhaWxlZCB0byBsb2FkJyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnQWNjZXB0JyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnQWNjZXB0IGFsbCcsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1JldmVydCBhbGwnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQgYWxsJyxcbiAgJ3Jldmlldy5yZWZyZXNoJzogJ1JlZnJlc2gnLFxuICAncmV2aWV3LmNsb3NlJzogJ0Nsb3NlJyxcbiAgJ3Jldmlldy5idXN5JzogJ1dvcmtpbmdcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcycsXG4gICdyZXZpZXcuZG9uZU9uZSc6ICd7YWN0aW9ufSB7cGF0aH0nLFxuICAncmV2aWV3LmFjY2VwdGVkJzogJ0FjY2VwdGVkJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdSZXZlcnRlZCcsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ3VudHJhY2tlZCcsXG4gICdyZXZpZXcuYmluYXJ5JzogJ2JpbmFyeScsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdObyBkaWZmIGRhdGEgZm9yIHRoaXMgY2hhbmdlJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnU2luZ2xlJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnU3BsaXQnLFxuICAndmlldy5iZWZvcmUnOiAnQmVmb3JlJyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnQWZ0ZXInLFxufVxuXG50eXBlIERpZmZSZXZpZXdBY3Rpb25Qcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+XG50eXBlIERpZmZSZXZpZXdPdmVybGF5UHJvcHMgPSBQcm9wc1J1bnRpbWU8J3NoZWxsLm92ZXJsYXknPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYgeyBzZXNzaW9uczogSVNlc3Npb25zIH1cblxuLyoqIERpZmYgaWNvbiAobHVjaWRlIGZpbGUtZGlmZikuICovXG5mdW5jdGlvbiBJY29uRGlmZigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTUgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjdaXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOSAxMGg2XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNMTIgN3Y2XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOSAxN2g2XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uWCgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTggNiA2IDE4XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJtNiA2IDEyIDEyXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uUmVmcmVzaCgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTNcIiBoZWlnaHQ9XCIxM1wiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMjEgMTJhOSA5IDAgMSAxLTktOWMyLjUyIDAgNC45MyAxIDYuNzQgMi43NEwyMSA4XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNMjEgM3Y1aC01XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG50eXBlIFZpZXdNb2RlID0gJ3NpbmdsZScgfCAnc3BsaXQnXG5cbi8qKiBcdTUzNTVcdTY4MEYgLyBcdTUzQ0NcdTY4MEYgc2VnbWVudGVkIHRvZ2dsZSAocGVyc2lzdGVkIGFjcm9zcyBvcGVucykuICovXG5mdW5jdGlvbiBEaWZmVmlld1RvZ2dsZSh7IHZpZXcsIG9uQ2hhbmdlLCB0IH06IHsgdmlldzogVmlld01vZGU7IG9uQ2hhbmdlOiAodjogVmlld01vZGUpID0+IHZvaWQ7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXZpZXctdG9nZ2xlXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD17dCgndmlldy5zaW5nbGUnKX0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXZpZXctYnRuJHt2aWV3ID09PSAnc2luZ2xlJyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc2luZ2xlJ31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NpbmdsZScpfVxuICAgICAgPlxuICAgICAgICB7dCgndmlldy5zaW5nbGUnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NwbGl0JyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc3BsaXQnfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgnc3BsaXQnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc3BsaXQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBUd28tY29sdW1uIHNpZGUtYnktc2lkZSBkaWZmIGJvZHkgKG9sZCBsZWZ0LCBuZXcgcmlnaHQsIGxpbmUgbnVtYmVycyBhbGlnbmVkKS4gKi9cbmZ1bmN0aW9uIFNwbGl0RGlmZih7IGJsb2NrcywgYmVmb3JlTGFiZWwsIGFmdGVyTGFiZWwgfTogeyBibG9ja3M6IFNwbGl0QmxvY2tbXTsgYmVmb3JlTGFiZWw6IHN0cmluZzsgYWZ0ZXJMYWJlbDogc3RyaW5nIH0pIHtcbiAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2JlZm9yZUxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2FmdGVyTGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgIDxkaXYga2V5PXtiaX0+XG4gICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LnJpZ2h0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hpcENsYXNzKHN0YXR1czogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcyA9IHN0YXR1cy5yZXBsYWNlKC9cXHMvZywgJycpXG4gIGlmIChzLmluY2x1ZGVzKCc/PycpKSByZXR1cm4gJ2RzZHItY2hpcC11J1xuICBpZiAocy5zdGFydHNXaXRoKCdBJykgfHwgcy5pbmNsdWRlcygnQScpKSByZXR1cm4gJ2RzZHItY2hpcC1hJ1xuICBpZiAocy5zdGFydHNXaXRoKCdEJykgfHwgcy5pbmNsdWRlcygnRCcpKSByZXR1cm4gJ2RzZHItY2hpcC1kJ1xuICBpZiAocy5zdGFydHNXaXRoKCdSJykgfHwgcy5pbmNsdWRlcygnUicpKSByZXR1cm4gJ2RzZHItY2hpcC1yJ1xuICByZXR1cm4gJ2RzZHItY2hpcC1tJ1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkU3RhdHVzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxTdGF0dXNSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtTVEFUVVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGBzdGF0dXMgcmVxdWVzdCBmYWlsZWQ6ICR7cmVzLnN0YXR1c31gKVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkpIGFzIFN0YXR1c1Jlc3BvbnNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5Q2hhbmdlcyhjd2Q6IHN0cmluZywgYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnLCBwYXRoPzogc3RyaW5nKTogUHJvbWlzZTxBcHBseVJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEFQUExZX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBhY3Rpb24sIHBhdGggfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBBcHBseVJlc3BvbnNlXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSGVhZGVyIGFjdGlvbiAoc2Vzc2lvbiBzY29wZSk6IGJhZGdlICsgb3Blbi5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3QWN0aW9uKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgdXNlU2Vzc2lvbiwgdCB9OiBEaWZmUmV2aWV3QWN0aW9uUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IG5vZGVzID0gdXNlU2Vzc2lvbigocykgPT4gcy5ub2RlcylcbiAgY29uc3QgY2hhbmdlQ291bnQgPSB1c2VNZW1vKCgpID0+IGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXMpLCBbbm9kZXNdKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBvcGVuT3ZlcmxheSA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWIgPSBvdmVybGF5U3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHNldE9wZW4ob3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KCkub3BlbilcbiAgICB9KVxuICAgIHJldHVybiB1bnN1YlxuICB9LCBbXSlcblxuICBpZiAoIWN3ZCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItdHJpZ2dlclwiIGFyaWEtbGFiZWw9e3QoJ2FjdGlvbi5hcmlhJyl9IG9uQ2xpY2s9e29wZW5PdmVybGF5fT5cbiAgICAgIDxJY29uRGlmZiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1sYWJlbFwiPnt0KCdhY3Rpb24ubGFiZWwnKX08L3NwYW4+XG4gICAgICB7Y2hhbmdlQ291bnQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiPntjaGFuZ2VDb3VudH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtvcGVuID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IG92ZXJsYXkgKHJvb3Qgc2NvcGUpOiBzZXNzaW9uICsgd29ya3NwYWNlIHRhYnMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gRGlmZlJldmlld092ZXJsYXkoeyBzZXNzaW9ucywgdCB9OiBEaWZmUmV2aWV3T3ZlcmxheVByb3BzKSB7XG4gIGNvbnN0IHN0b3JlU3RhdGUgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShvdmVybGF5U3RvcmUuc3Vic2NyaWJlLCBvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSB1c2VTdGF0ZTwnc2Vzc2lvbicgfCAnd29ya3NwYWNlJz4oJ3Nlc3Npb24nKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSB1c2VTdGF0ZTxWaWV3TW9kZT4oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RzZHItdmlldycpID09PSAnc3BsaXQnID8gJ3NwbGl0JyA6ICdzaW5nbGUnXG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ3NpbmdsZSdcbiAgICB9XG4gIH0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkc2RyLXZpZXcnLCB2aWV3KVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gcHJpdmF0ZSBtb2RlIC8gdW5hdmFpbGFibGUgXHUyMDE0IG5vbi1mYXRhbFxuICAgIH1cbiAgfSwgW3ZpZXddKVxuXG4gIC8vIFdvcmtzcGFjZSB0YWIgc3RhdGUuXG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtub3RpY2UsIHNldE5vdGljZV0gPSB1c2VTdGF0ZTx7IGtpbmQ6ICdvaycgfCAnZXJyb3InOyB0ZXh0OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb25maXJtLCBzZXRDb25maXJtXSA9IHVzZVN0YXRlPCdmaWxlJyB8ICdhbGwnIHwgbnVsbD4obnVsbClcbiAgY29uc3Qgbm90aWNlVGltZXIgPSB1c2VSZWY8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ+KHVuZGVmaW5lZClcblxuICAvLyBDdXJyZW50IHNlc3Npb24ncyBjb252ZXJzYXRpb24gc25hcHNob3QgKHJlYWN0aXZlKSwgZm9yIHRoZSBzZXNzaW9uIHRhYi5cbiAgY29uc3QgY3VycmVudElkID0gdXNlU3luY0V4dGVybmFsU3RvcmUoXG4gICAgdXNlTWVtbygoKSA9PiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiBzZXNzaW9ucy5saXN0LnN1YnNjcmliZShub3RpZnkpLCBbc2Vzc2lvbnNdKSxcbiAgICB1c2VNZW1vKCgpID0+ICgpID0+IHNlc3Npb25zLmxpc3QuZ2V0U25hcHNob3QoKS5jdXJyZW50LCBbc2Vzc2lvbnNdKSxcbiAgKVxuICBjb25zdCBzbmFwc2hvdCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgcmV0dXJuIChub3RpZnk6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IGN1cnJlbnRJZCA/IHNlc3Npb25zLmJpbmRpbmcoY3VycmVudElkKSA6IHVuZGVmaW5lZFxuICAgICAgICBpZiAoIWJpbmRpbmcpIHJldHVybiAoKSA9PiB7fVxuICAgICAgICByZXR1cm4gYmluZGluZy5zZXNzaW9uLnN1YnNjcmliZShub3RpZnkpXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIGJpbmRpbmcgPyBiaW5kaW5nLnNlc3Npb24uZ2V0U25hcHNob3QoKSA6IG51bGxcbiAgICAgIH1cbiAgICB9LCBbc2Vzc2lvbnMsIGN1cnJlbnRJZF0pLFxuICApXG5cbiAgY29uc3Qgcm91bmRzID0gdXNlTWVtbygoKSA9PiAoc25hcHNob3QgPyBjb2xsZWN0U2Vzc2lvblJvdW5kcyhzbmFwc2hvdC5ub2RlcykgOiBbXSksIFtzbmFwc2hvdF0pXG4gIGNvbnN0IHRvdGFsU2Vzc2lvbkZpbGVzID0gdXNlTWVtbygoKSA9PiByb3VuZHMucmVkdWNlKChuLCByKSA9PiBuICsgci5jaGFuZ2VzLmxlbmd0aCwgMCksIFtyb3VuZHNdKVxuICBjb25zdCBbc2VsZWN0ZWRSb3VuZCwgc2V0U2VsZWN0ZWRSb3VuZF0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWRQYXRoLCBzZXRTZWxlY3RlZFBhdGhdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRDaGFuZ2UgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCByb3VuZCA9IHJvdW5kcy5maW5kKChyKSA9PiByLnJvdW5kID09PSBzZWxlY3RlZFJvdW5kKVxuICAgIHJldHVybiByb3VuZD8uY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IHNlbGVjdGVkUGF0aCkgPz8gbnVsbFxuICB9LCBbcm91bmRzLCBzZWxlY3RlZFJvdW5kLCBzZWxlY3RlZFBhdGhdKVxuXG4gIGNvbnN0IGN3ZCA9IHN0b3JlU3RhdGUuY3dkXG5cbiAgY29uc3QgbG9hZFdvcmtzcGFjZSA9IGFzeW5jIChzaWxlbnQgPSBmYWxzZSkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBpZiAoIXNpbGVudCkgc2V0TG9hZGluZyh0cnVlKVxuICAgIHNldEVycm9yKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5leHQgPSBhd2FpdCBsb2FkU3RhdHVzKGN3ZClcbiAgICAgIHNldFN0YXR1cyhuZXh0KVxuICAgICAgaWYgKG5leHQuZXJyb3IgJiYgIW5leHQuaXNSZXBvKSBzZXRFcnJvcihuZXh0LmVycm9yKVxuICAgICAgc2V0U2VsZWN0ZWQoKHByZXYpID0+IChwcmV2ICYmIG5leHQuZmlsZXMuc29tZSgoZikgPT4gZi5wYXRoID09PSBwcmV2KSA/IHByZXYgOiBuZXh0LmZpbGVzWzBdPy5wYXRoID8/IG51bGwpKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldEVycm9yKGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyBMb2FkIHdvcmtzcGFjZSBzdGF0dXMgbGF6aWx5IG9uIGZpcnN0IHZpc2l0IG9mIHRoZSB0YWIuXG4gIGNvbnN0IHdvcmtzcGFjZUxvYWRlZCA9IHVzZVJlZihmYWxzZSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAodGFiID09PSAnd29ya3NwYWNlJyAmJiAhd29ya3NwYWNlTG9hZGVkLmN1cnJlbnQgJiYgY3dkKSB7XG4gICAgICB3b3Jrc3BhY2VMb2FkZWQuY3VycmVudCA9IHRydWVcbiAgICAgIHZvaWQgbG9hZFdvcmtzcGFjZSgpXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3RhYiwgY3dkXSlcblxuICAvLyBEZWZhdWx0IHNlbGVjdGlvbiBmb3IgdGhlIHNlc3Npb24gdGFiIGZvbGxvd3MgdGhlIGZpcnN0IHJvdW5kIHdpdGggY2hhbmdlcy5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRSb3VuZCA9PT0gbnVsbCAmJiByb3VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZHNbMF0ucm91bmQpXG4gICAgICBzZXRTZWxlY3RlZFBhdGgocm91bmRzWzBdLmNoYW5nZXNbMF0/LnBhdGggPz8gbnVsbClcbiAgICB9XG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmRdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4pIHJldHVyblxuICAgIGNvbnN0IG9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5KVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW5dKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFub3RpY2UpIHJldHVyblxuICAgIG5vdGljZVRpbWVyLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHNldE5vdGljZShudWxsKSwgMzAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KG5vdGljZVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtub3RpY2VdKVxuXG4gIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8ICFjd2QpIHJldHVybiBudWxsXG5cbiAgY29uc3QgZmlsZXMgPSBzdGF0dXM/LmlzUmVwbyA/IHN0YXR1cy5maWxlcyA6IFtdXG4gIGNvbnN0IHNlbGVjdGVkRmlsZSA9IGZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWQpID8/IG51bGxcbiAgY29uc3QgdG90YWxBZGRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuYWRkZWQsIDApXG4gIGNvbnN0IHRvdGFsRGVsZXRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuZGVsZXRlZCwgMClcblxuICBjb25zdCBydW5BcHBseSA9IGFzeW5jIChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcsIHBhdGg/OiBzdHJpbmcpID0+IHtcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcHBseUNoYW5nZXMoY3dkLCBhY3Rpb24sIHBhdGgpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIHNldE5vdGljZSh7XG4gICAgICAgICAga2luZDogJ29rJyxcbiAgICAgICAgICB0ZXh0OiBwYXRoXG4gICAgICAgICAgICA/IHQoJ3Jldmlldy5kb25lT25lJywgeyBhY3Rpb246IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IHQoJ3Jldmlldy5yZXZlcnRlZCcpLCBwYXRoIH0pXG4gICAgICAgICAgICA6IHQoJ3Jldmlldy5kb25lJywgeyBhY3Rpb246IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IHQoJ3Jldmlldy5yZXZlcnRlZCcpLCBjb3VudDogZmlsZXMubGVuZ3RoIH0pLFxuICAgICAgICB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb25GaWxlQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JywgcGF0aDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ3JldmVydCcgJiYgY29uZmlybSAhPT0gJ2ZpbGUnKSB7XG4gICAgICBzZXRDb25maXJtKCdmaWxlJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdmaWxlJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCBydW5BcHBseShhY3Rpb24sIHBhdGgpXG4gIH1cblxuICBjb25zdCBvbkFsbEFjdGlvbiA9IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnYWxsJykge1xuICAgICAgc2V0Q29uZmlybSgnYWxsJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdhbGwnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbilcbiAgfVxuXG4gIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwiZHNkci1vdmVybGF5XCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jdXJyZW50VGFyZ2V0KSBjbG9zZSgpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1wYW5lbFwiIHJvbGU9XCJkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWhlYWRlclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdGl0bGVcIj57dCgncmV2aWV3LnRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdGFic1wiIHJvbGU9XCJ0YWJsaXN0XCIgYXJpYS1sYWJlbD17dCgncmV2aWV3LnRpdGxlJyl9PlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3RhYiA9PT0gJ3Nlc3Npb24nfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXRhYiR7dGFiID09PSAnc2Vzc2lvbicgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3Nlc3Npb24nKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge3QoJ3RhYi5zZXNzaW9uJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0YWIgPT09ICd3b3Jrc3BhY2UnfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXRhYiR7dGFiID09PSAnd29ya3NwYWNlJyA/ICcgZHNkci10YWItYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFRhYignd29ya3NwYWNlJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0KCd0YWIud29ya3NwYWNlJyl9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zdWJ0aXRsZVwiPlxuICAgICAgICAgICAge3RhYiA9PT0gJ3Nlc3Npb24nXG4gICAgICAgICAgICAgID8gdCgncmV2aWV3LnNlc3Npb25TdGF0cycsIHsgcm91bmRzOiByb3VuZHMubGVuZ3RoLCBmaWxlczogdG90YWxTZXNzaW9uRmlsZXMgfSlcbiAgICAgICAgICAgICAgOiBzdGF0dXM/LmlzUmVwb1xuICAgICAgICAgICAgICAgID8gYCR7c3RhdHVzLmJyYW5jaCA/PyB0KCdyZXZpZXcuZGV0YWNoZWQnKX0gXHUwMEI3ICR7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiB0b3RhbEFkZGVkLCBkZWxldGVkOiB0b3RhbERlbGV0ZWQgfSl9YFxuICAgICAgICAgICAgICAgIDogdCgncmV2aWV3Lm5vdFJlcG8nKX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8IGZpbGVzLmxlbmd0aCA9PT0gMH0gb25DbGljaz17KCkgPT4gb25BbGxBY3Rpb24oJ2FjY2VwdCcpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmFjY2VwdEFsbCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuIGRzZHItYnRuLWRhbmdlciR7Y29uZmlybSA9PT0gJ2FsbCcgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCBmaWxlcy5sZW5ndGggPT09IDB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25BbGxBY3Rpb24oJ3JldmVydCcpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdhbGwnID8gdCgncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnKSA6IHQoJ3Jldmlldy5yZXZlcnRBbGwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgbG9hZFdvcmtzcGFjZSgpfT5cbiAgICAgICAgICAgICAgICA8SWNvblJlZnJlc2ggLz5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnJlZnJlc2gnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy5jbG9zZScpfSBvbkNsaWNrPXtjbG9zZX0+XG4gICAgICAgICAgICA8SWNvblggLz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge3RhYiA9PT0gJ3Nlc3Npb24nID8gKFxuICAgICAgICAgIHJvdW5kcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj57dCgncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnKX08L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJvZHlcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbGVzXCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPXt0KCd0YWIuc2Vzc2lvbicpfT5cbiAgICAgICAgICAgICAgICB7cm91bmRzLm1hcCgocm91bmQpID0+IChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyb3VuZC5yb3VuZH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcucm91bmQnLCB7IHJvdW5kOiByb3VuZC5yb3VuZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICB7cm91bmQubGFiZWwgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcm91bmQtbGFiZWxcIiB0aXRsZT17cm91bmQubGFiZWx9Pntyb3VuZC5sYWJlbH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge3JvdW5kLmNoYW5nZXMubWFwKChjaGFuZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtyb3VuZC5yb3VuZH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRLZXkgPSBzZWxlY3RlZENoYW5nZSA/IGAke3NlbGVjdGVkUm91bmR9OiR7c2VsZWN0ZWRDaGFuZ2UucGF0aH1gIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17a2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2tleSA9PT0gc2VsZWN0ZWRLZXl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7a2V5ID09PSBzZWxlY3RlZEtleSA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZFJvdW5kKHJvdW5kLnJvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUGF0aChjaGFuZ2UucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoYW5nZS5oYXNEaWZmID8gJ2RzZHItY2hpcC1tJyA6ICdkc2RyLWNoaXAtdSd9YH0+e2NoYW5nZS5oYXNEaWZmID8gJ00nIDogJ1x1MDBCNyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtjaGFuZ2UucGF0aH0+e2NoYW5nZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCIgdGl0bGU9e2NoYW5nZS50b29sfT57Y2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmZcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRDaGFuZ2UucGF0aH0+e3NlbGVjdGVkQ2hhbmdlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdG9vbFwiPntzZWxlY3RlZENoYW5nZS50b29sfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UuaGFzRGlmZiA/IDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlLmhhc0RpZmYgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgdmlldyA9PT0gJ3NwbGl0JyAmJiBjaGFuZ2VTcGxpdEJsb2NrcyhzZWxlY3RlZENoYW5nZSkubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxTcGxpdERpZmYgYmxvY2tzPXtjaGFuZ2VTcGxpdEJsb2NrcyhzZWxlY3RlZENoYW5nZSl9IGJlZm9yZUxhYmVsPXt0KCd2aWV3LmJlZm9yZScpfSBhZnRlckxhYmVsPXt0KCd2aWV3LmFmdGVyJyl9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2NoYW5nZVJvd3Moc2VsZWN0ZWRDaGFuZ2UpLm1hcCgocm93LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ub2RpZmZcIj57dCgncmV2aWV3Lm5vRGlmZkRhdGEnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPnt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfTwvZGl2PlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKVxuICAgICAgICApIDogZXJyb3IgJiYgIXN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yfVxuICAgICAgICAgICAgPGRpdj57dCgncmV2aWV3Lm5vdFJlcG9IaW50Jyl9PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBzdGF0dXM/LmlzUmVwbyAmJiBmaWxlcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICApIDogc3RhdHVzPy5pc1JlcG8gJiYgZmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYm9keVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbGVzXCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPXt0KCd0YWIud29ya3NwYWNlJyl9PlxuICAgICAgICAgICAgICB7ZmlsZXMubWFwKChmaWxlKSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAga2V5PXtmaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17ZmlsZS5wYXRoID09PSBzZWxlY3RlZH1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7ZmlsZS5wYXRoID09PSBzZWxlY3RlZCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkKGZpbGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWNoaXAgJHtjaGlwQ2xhc3MoZmlsZS5zdGF0dXMpfWB9PntmaWxlLnVudHJhY2tlZCA/ICc/PycgOiBmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntmaWxlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLXN0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAge2ZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZlwiPlxuICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5vcmlnUGF0aCA/IGAgXHUyMTkwICR7c2VsZWN0ZWRGaWxlLm9yaWdQYXRofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogc2VsZWN0ZWRGaWxlLmFkZGVkLCBkZWxldGVkOiBzZWxlY3RlZEZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdhY2NlcHQnLCBzZWxlY3RlZEZpbGUucGF0aCl9PlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0Jyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4gZHNkci1idG4tZGFuZ2VyJHtjb25maXJtID09PSAnZmlsZScgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3JldmVydCcsIHNlbGVjdGVkRmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnZmlsZScgPyB0KCdyZXZpZXcuY29uZmlybVJldmVydCcpIDogdCgncmV2aWV3LnJldmVydCcpfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3ZpZXcgPT09ICdzcGxpdCcgJiYgIXNlbGVjdGVkRmlsZS5iaW5hcnkgJiYgZ2l0U3BsaXRCbG9ja3Moc2VsZWN0ZWRGaWxlLmRpZmYpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxTcGxpdERpZmYgYmxvY2tzPXtnaXRTcGxpdEJsb2NrcyhzZWxlY3RlZEZpbGUuZGlmZil9IGJlZm9yZUxhYmVsPXt0KCd2aWV3LmJlZm9yZScpfSBhZnRlckxhYmVsPXt0KCd2aWV3LmFmdGVyJyl9IC8+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Z2l0RGlmZlJvd3Moc2VsZWN0ZWRGaWxlLmRpZmYpLm1hcCgocm93LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgIHtlcnJvciA/PyB0KCdyZXZpZXcubG9hZEVycm9yJyl9XG4gICAgICAgICAgICB7IXN0YXR1cz8uaXNSZXBvID8gPGRpdj57dCgncmV2aWV3Lm5vdFJlcG9IaW50Jyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZm9vdFwiPlxuICAgICAgICAgIHsobG9hZGluZyB8fCBidXN5KSAmJiB0YWIgPT09ICd3b3Jrc3BhY2UnID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGlubmVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgIHtidXN5ID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1ub3RpY2VcIj57dCgncmV2aWV3LmJ1c3knKX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICB7bm90aWNlID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1ub3RpY2UgZHNkci1ub3RpY2UtJHtub3RpY2Uua2luZH1gfT57bm90aWNlLnRleHR9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZiB7XG4gICAgZGlmZihvbGRTdHIsIG5ld1N0ciwgXG4gICAgLy8gVHlwZSBiZWxvdyBpcyBub3QgYWNjdXJhdGUvY29tcGxldGUgLSBzZWUgYWJvdmUgZm9yIGZ1bGwgcG9zc2liaWxpdGllcyAtIGJ1dCBpdCBjb21waWxlc1xuICAgIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBsZXQgY2FsbGJhY2s7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCdjYWxsYmFjaycgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IHN1YmNsYXNzZXMgdG8gbWFzc2FnZSB0aGUgaW5wdXQgcHJpb3IgdG8gcnVubmluZ1xuICAgICAgICBjb25zdCBvbGRTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChvbGRTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBuZXdTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChuZXdTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBvbGRUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUob2xkU3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIGNvbnN0IG5ld1Rva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShuZXdTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBkb25lID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucG9zdFByb2Nlc3ModmFsdWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNhbGxiYWNrKHZhbHVlKTsgfSwgMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IGVkaXRMZW5ndGggPSAxO1xuICAgICAgICBsZXQgbWF4RWRpdExlbmd0aCA9IG5ld0xlbiArIG9sZExlbjtcbiAgICAgICAgaWYgKG9wdGlvbnMubWF4RWRpdExlbmd0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXhFZGl0TGVuZ3RoID0gTWF0aC5taW4obWF4RWRpdExlbmd0aCwgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhFeGVjdXRpb25UaW1lID0gKF9hID0gb3B0aW9ucy50aW1lb3V0KSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgYWJvcnRBZnRlclRpbWVzdGFtcCA9IERhdGUubm93KCkgKyBtYXhFeGVjdXRpb25UaW1lO1xuICAgICAgICBjb25zdCBiZXN0UGF0aCA9IFt7IG9sZFBvczogLTEsIGxhc3RDb21wb25lbnQ6IHVuZGVmaW5lZCB9XTtcbiAgICAgICAgLy8gU2VlZCBlZGl0TGVuZ3RoID0gMCwgaS5lLiB0aGUgY29udGVudCBzdGFydHMgd2l0aCB0aGUgc2FtZSB2YWx1ZXNcbiAgICAgICAgbGV0IG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiZXN0UGF0aFswXSwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIDAsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoYmVzdFBhdGhbMF0ub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgIC8vIElkZW50aXR5IHBlciB0aGUgZXF1YWxpdHkgYW5kIHRva2VuaXplclxuICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiZXN0UGF0aFswXS5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2Ugd2UgaGl0IHRoZSByaWdodCBlZGdlIG9mIHRoZSBlZGl0IGdyYXBoIG9uIHNvbWUgZGlhZ29uYWwgaywgd2UgY2FuXG4gICAgICAgIC8vIGRlZmluaXRlbHkgcmVhY2ggdGhlIGVuZCBvZiB0aGUgZWRpdCBncmFwaCBpbiBubyBtb3JlIHRoYW4gayBlZGl0cywgc29cbiAgICAgICAgLy8gdGhlcmUncyBubyBwb2ludCBpbiBjb25zaWRlcmluZyBhbnkgbW92ZXMgdG8gZGlhZ29uYWwgaysxIGFueSBtb3JlIChmcm9tXG4gICAgICAgIC8vIHdoaWNoIHdlJ3JlIGd1YXJhbnRlZWQgdG8gbmVlZCBhdCBsZWFzdCBrKzEgbW9yZSBlZGl0cykuXG4gICAgICAgIC8vIFNpbWlsYXJseSwgb25jZSB3ZSd2ZSByZWFjaGVkIHRoZSBib3R0b20gb2YgdGhlIGVkaXQgZ3JhcGgsIHRoZXJlJ3Mgbm9cbiAgICAgICAgLy8gcG9pbnQgY29uc2lkZXJpbmcgbW92ZXMgdG8gbG93ZXIgZGlhZ29uYWxzLlxuICAgICAgICAvLyBXZSByZWNvcmQgdGhpcyBmYWN0IGJ5IHNldHRpbmcgbWluRGlhZ29uYWxUb0NvbnNpZGVyIGFuZFxuICAgICAgICAvLyBtYXhEaWFnb25hbFRvQ29uc2lkZXIgdG8gc29tZSBmaW5pdGUgdmFsdWUgb25jZSB3ZSd2ZSBoaXQgdGhlIGVkZ2Ugb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGguXG4gICAgICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGlzIG5vdCBmYWl0aGZ1bCB0byB0aGUgb3JpZ2luYWwgYWxnb3JpdGhtIHByZXNlbnRlZCBpblxuICAgICAgICAvLyBNeWVycydzIHBhcGVyLCB3aGljaCBpbnN0ZWFkIHBvaW50bGVzc2x5IGV4dGVuZHMgRC1wYXRocyBvZmYgdGhlIGVuZCBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaCAtIHNlZSBwYWdlIDcgb2YgTXllcnMncyBwYXBlciB3aGljaCBub3RlcyB0aGlzIHBvaW50XG4gICAgICAgIC8vIGV4cGxpY2l0bHkgYW5kIGlsbHVzdHJhdGVzIGl0IHdpdGggYSBkaWFncmFtLiBUaGlzIGhhcyBtYWpvciBwZXJmb3JtYW5jZVxuICAgICAgICAvLyBpbXBsaWNhdGlvbnMgZm9yIHNvbWUgY29tbW9uIHNjZW5hcmlvcy4gRm9yIGluc3RhbmNlLCB0byBjb21wdXRlIGEgZGlmZlxuICAgICAgICAvLyB3aGVyZSB0aGUgbmV3IHRleHQgc2ltcGx5IGFwcGVuZHMgZCBjaGFyYWN0ZXJzIG9uIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIHRleHQgb2YgbGVuZ3RoIG4sIHRoZSB0cnVlIE15ZXJzIGFsZ29yaXRobSB3aWxsIHRha2UgTyhuK2ReMilcbiAgICAgICAgLy8gdGltZSB3aGlsZSB0aGlzIG9wdGltaXphdGlvbiBuZWVkcyBvbmx5IE8obitkKSB0aW1lLlxuICAgICAgICBsZXQgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gLUluZmluaXR5LCBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBJbmZpbml0eTtcbiAgICAgICAgLy8gTWFpbiB3b3JrZXIgbWV0aG9kLiBjaGVja3MgYWxsIHBlcm11dGF0aW9ucyBvZiBhIGdpdmVuIGVkaXQgbGVuZ3RoIGZvciBhY2NlcHRhbmNlLlxuICAgICAgICBjb25zdCBleGVjRWRpdExlbmd0aCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGRpYWdvbmFsUGF0aCA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgLWVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggPD0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBlZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoICs9IDIpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdLCBhZGRQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gb25lIGVsc2UgaXMgZ29pbmcgdG8gYXR0ZW1wdCB0byB1c2UgdGhpcyB2YWx1ZSwgY2xlYXIgaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjYW5BZGQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGF0IG5ld1BvcyB3aWxsIGJlIGFmdGVyIHdlIGRvIGFuIGluc2VydGlvbjpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkUGF0aE5ld1BvcyA9IGFkZFBhdGgub2xkUG9zIC0gZGlhZ29uYWxQYXRoO1xuICAgICAgICAgICAgICAgICAgICBjYW5BZGQgPSBhZGRQYXRoICYmIDAgPD0gYWRkUGF0aE5ld1BvcyAmJiBhZGRQYXRoTmV3UG9zIDwgbmV3TGVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBjYW5SZW1vdmUgPSByZW1vdmVQYXRoICYmIHJlbW92ZVBhdGgub2xkUG9zICsgMSA8IG9sZExlbjtcbiAgICAgICAgICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgcGF0aCBpcyBhIHRlcm1pbmFsIHRoZW4gcHJ1bmVcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgZGlhZ29uYWwgdGhhdCB3ZSB3YW50IHRvIGJyYW5jaCBmcm9tLiBXZSBzZWxlY3QgdGhlIHByaW9yXG4gICAgICAgICAgICAgICAgLy8gcGF0aCB3aG9zZSBwb3NpdGlvbiBpbiB0aGUgb2xkIHN0cmluZyBpcyB0aGUgZmFydGhlc3QgZnJvbSB0aGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRvZXMgbm90IHBhc3MgdGhlIGJvdW5kcyBvZiB0aGUgZGlmZiBncmFwaFxuICAgICAgICAgICAgICAgIGlmICghY2FuUmVtb3ZlIHx8IChjYW5BZGQgJiYgcmVtb3ZlUGF0aC5vbGRQb3MgPCBhZGRQYXRoLm9sZFBvcykpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChhZGRQYXRoLCB0cnVlLCBmYWxzZSwgMCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKHJlbW92ZVBhdGgsIGZhbHNlLCB0cnVlLCAxLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpIHx8IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlZGl0TGVuZ3RoKys7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcmZvcm1zIHRoZSBsZW5ndGggb2YgZWRpdCBpdGVyYXRpb24uIElzIGEgYml0IGZ1Z2x5IGFzIHRoaXMgaGFzIHRvIHN1cHBvcnQgdGhlXG4gICAgICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAgICAgLy8gaXMgcHJvZHVjZWQsIG9yIHVudGlsIHRoZSBlZGl0IGxlbmd0aCBleGNlZWRzIG9wdGlvbnMubWF4RWRpdExlbmd0aCAoaWYgZ2l2ZW4pLFxuICAgICAgICAvLyBpbiB3aGljaCBjYXNlIGl0IHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoIHx8IERhdGUubm93KCkgPiBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChlZGl0TGVuZ3RoIDw9IG1heEVkaXRMZW5ndGggJiYgRGF0ZS5ub3coKSA8PSBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFRvUGF0aChwYXRoLCBhZGRlZCwgcmVtb3ZlZCwgb2xkUG9zSW5jLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwYXRoLmxhc3RDb21wb25lbnQ7XG4gICAgICAgIGlmIChsYXN0ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IGxhc3QuY291bnQgKyAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0LnByZXZpb3VzQ29tcG9uZW50IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IG9sZFBvcyA9IGJhc2VQYXRoLm9sZFBvcywgbmV3UG9zID0gb2xkUG9zIC0gZGlhZ29uYWxQYXRoLCBjb21tb25Db3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChuZXdQb3MgKyAxIDwgbmV3TGVuICYmIG9sZFBvcyArIDEgPCBvbGRMZW4gJiYgdGhpcy5lcXVhbHMob2xkVG9rZW5zW29sZFBvcyArIDFdLCBuZXdUb2tlbnNbbmV3UG9zICsgMV0sIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBuZXdQb3MrKztcbiAgICAgICAgICAgIG9sZFBvcysrO1xuICAgICAgICAgICAgY29tbW9uQ291bnQrKztcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IDEsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbkNvdW50ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogY29tbW9uQ291bnQsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgYmFzZVBhdGgub2xkUG9zID0gb2xkUG9zO1xuICAgICAgICByZXR1cm4gbmV3UG9zO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29tcGFyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY29tcGFyYXRvcihsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHRcbiAgICAgICAgICAgICAgICB8fCAoISFvcHRpb25zLmlnbm9yZUNhc2UgJiYgbGVmdC50b0xvd2VyQ2FzZSgpID09PSByaWdodC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVFbXB0eShhcnJheSkge1xuICAgICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBjYXN0SW5wdXQodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xuICAgIH1cbiAgICBqb2luKGNoYXJzKSB7XG4gICAgICAgIC8vIEFzc3VtZXMgVmFsdWVUIGlzIHN0cmluZywgd2hpY2ggaXMgdGhlIGNhc2UgZm9yIG1vc3Qgc3ViY2xhc3Nlcy5cbiAgICAgICAgLy8gV2hlbiBpdCdzIGZhbHNlLCBlLmcuIGluIGRpZmZBcnJheXMsIHRoaXMgbWV0aG9kIG5lZWRzIHRvIGJlIG92ZXJyaWRkZW4gKGUuZy4gd2l0aCBhIG5vLW9wKVxuICAgICAgICAvLyBZZXMsIHRoZSBjYXN0cyBhcmUgdmVyYm9zZSBhbmQgdWdseSwgYmVjYXVzZSB0aGlzIHBhdHRlcm4gLSBvZiBoYXZpbmcgdGhlIGJhc2UgY2xhc3MgU09SVCBPRlxuICAgICAgICAvLyBhc3N1bWUgdG9rZW5zIGFuZCB2YWx1ZXMgYXJlIHN0cmluZ3MsIGJ1dCBub3QgY29tcGxldGVseSAtIGlzIHdlaXJkIGFuZCBqYW5reS5cbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH1cbiAgICBwb3N0UHJvY2VzcyhjaGFuZ2VPYmplY3RzLCBcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gY2hhbmdlT2JqZWN0cztcbiAgICB9XG4gICAgZ2V0IHVzZUxvbmdlc3RUb2tlbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBidWlsZFZhbHVlcyhsYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2Vucykge1xuICAgICAgICAvLyBGaXJzdCB3ZSBjb252ZXJ0IG91ciBsaW5rZWQgbGlzdCBvZiBjb21wb25lbnRzIGluIHJldmVyc2Ugb3JkZXIgdG8gYW5cbiAgICAgICAgLy8gYXJyYXkgaW4gdGhlIHJpZ2h0IG9yZGVyOlxuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gW107XG4gICAgICAgIGxldCBuZXh0Q29tcG9uZW50O1xuICAgICAgICB3aGlsZSAobGFzdENvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGxhc3RDb21wb25lbnQpO1xuICAgICAgICAgICAgbmV4dENvbXBvbmVudCA9IGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBkZWxldGUgbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGxhc3RDb21wb25lbnQgPSBuZXh0Q29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbXBvbmVudHMucmV2ZXJzZSgpO1xuICAgICAgICBjb25zdCBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aDtcbiAgICAgICAgbGV0IGNvbXBvbmVudFBvcyA9IDAsIG5ld1BvcyA9IDAsIG9sZFBvcyA9IDA7XG4gICAgICAgIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wb25lbnRzW2NvbXBvbmVudFBvc107XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQgJiYgdGhpcy51c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9sZFRva2Vuc1tvbGRQb3MgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGRWYWx1ZS5sZW5ndGggPiB2YWx1ZS5sZW5ndGggPyBvbGRWYWx1ZSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG9sZFRva2Vucy5zbGljZShvbGRQb3MsIG9sZFBvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHM7XG4gICAgfVxufVxuIiwgImltcG9ydCBEaWZmIGZyb20gJy4vYmFzZS5qcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZU9wdGlvbnMgfSBmcm9tICcuLi91dGlsL3BhcmFtcy5qcyc7XG5jbGFzcyBMaW5lRGlmZiBleHRlbmRzIERpZmYge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnRva2VuaXplID0gdG9rZW5pemU7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICAvLyBJZiB3ZSdyZSBpZ25vcmluZyB3aGl0ZXNwYWNlLCB3ZSBuZWVkIHRvIG5vcm1hbGlzZSBsaW5lcyBieSBzdHJpcHBpbmdcbiAgICAgICAgLy8gd2hpdGVzcGFjZSBiZWZvcmUgY2hlY2tpbmcgZXF1YWxpdHkuIChUaGlzIGhhcyBhbiBhbm5veWluZyBpbnRlcmFjdGlvblxuICAgICAgICAvLyB3aXRoIG5ld2xpbmVJc1Rva2VuIHRoYXQgcmVxdWlyZXMgc3BlY2lhbCBoYW5kbGluZzogaWYgbmV3bGluZXMgZ2V0IHRoZWlyXG4gICAgICAgIC8vIG93biB0b2tlbiwgdGhlbiB3ZSBET04nVCB3YW50IHRvIHRyaW0gdGhlICpuZXdsaW5lKiB0b2tlbnMgZG93biB0byBlbXB0eVxuICAgICAgICAvLyBzdHJpbmdzLCBzaW5jZSB0aGlzIHdvdWxkIGNhdXNlIHVzIHRvIHRyZWF0IHdoaXRlc3BhY2Utb25seSBsaW5lIGNvbnRlbnRcbiAgICAgICAgLy8gYXMgZXF1YWwgdG8gYSBzZXBhcmF0b3IgYmV0d2VlbiBsaW5lcywgd2hpY2ggd291bGQgYmUgd2VpcmQgYW5kXG4gICAgICAgIC8vIGluY29uc2lzdGVudCB3aXRoIHRoZSBkb2N1bWVudGVkIGJlaGF2aW9yIG9mIHRoZSBvcHRpb25zLilcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFsZWZ0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhcmlnaHQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5pZ25vcmVOZXdsaW5lQXRFb2YgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIGlmIChsZWZ0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyaWdodC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgbGluZURpZmYgPSBuZXcgTGluZURpZmYoKTtcbmV4cG9ydCBmdW5jdGlvbiBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZlRyaW1tZWRMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgeyBpZ25vcmVXaGl0ZXNwYWNlOiB0cnVlIH0pO1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbi8vIEV4cG9ydGVkIHN0YW5kYWxvbmUgc28gaXQgY2FuIGJlIHVzZWQgZnJvbSBqc29uRGlmZiB0b28uXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5zdHJpcFRyYWlsaW5nQ3IpIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9uZSBcXHIgYmVmb3JlIFxcbiB0byBtYXRjaCBHTlUgZGlmZidzIC0tc3RyaXAtdHJhaWxpbmctY3IgYmVoYXZpb3JcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuICAgIH1cbiAgICBjb25zdCByZXRMaW5lcyA9IFtdLCBsaW5lc0FuZE5ld2xpbmVzID0gdmFsdWUuc3BsaXQoLyhcXG58XFxyXFxuKS8pO1xuICAgIC8vIElnbm9yZSB0aGUgZmluYWwgZW1wdHkgdG9rZW4gdGhhdCBvY2N1cnMgaWYgdGhlIHN0cmluZyBlbmRzIHdpdGggYSBuZXcgbGluZVxuICAgIGlmICghbGluZXNBbmROZXdsaW5lc1tsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIGxpbmVzQW5kTmV3bGluZXMucG9wKCk7XG4gICAgfVxuICAgIC8vIE1lcmdlIHRoZSBjb250ZW50IGFuZCBsaW5lIHNlcGFyYXRvcnMgaW50byBzaW5nbGUgdG9rZW5zXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc0FuZE5ld2xpbmVzW2ldO1xuICAgICAgICBpZiAoaSAlIDIgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9IGxpbmU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRMaW5lcztcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBbUJBLG1CQUEyRTs7O0FDbkIzRSxJQUFxQixPQUFyQixNQUEwQjtBQUFBLEVBQ3RCLEtBQUssUUFBUSxRQUViLFVBQVUsQ0FBQyxHQUFHO0FBQ1YsUUFBSTtBQUNKLFFBQUksT0FBTyxZQUFZLFlBQVk7QUFDL0IsaUJBQVc7QUFDWCxnQkFBVSxDQUFDO0FBQUEsSUFDZixXQUNTLGNBQWMsU0FBUztBQUM1QixpQkFBVyxRQUFRO0FBQUEsSUFDdkI7QUFFQSxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxXQUFPLEtBQUssbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFFBQVE7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFVBQVU7QUFDeEQsUUFBSTtBQUNKLFVBQU0sT0FBTyxDQUFDLFVBQVU7QUFDcEIsY0FBUSxLQUFLLFlBQVksT0FBTyxPQUFPO0FBQ3ZDLFVBQUksVUFBVTtBQUNWLG1CQUFXLFdBQVk7QUFBRSxtQkFBUyxLQUFLO0FBQUEsUUFBRyxHQUFHLENBQUM7QUFDOUMsZUFBTztBQUFBLE1BQ1gsT0FDSztBQUNELGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUNBLFVBQU0sU0FBUyxVQUFVLFFBQVEsU0FBUyxVQUFVO0FBQ3BELFFBQUksYUFBYTtBQUNqQixRQUFJLGdCQUFnQixTQUFTO0FBQzdCLFFBQUksUUFBUSxpQkFBaUIs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

		})(module, module.exports, require);
		return module.exports;
	}
});
