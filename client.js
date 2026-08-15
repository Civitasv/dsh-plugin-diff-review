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
var import_dsh_client_ui_attachment = require("@deepseek-ai/dsh-client-ui-attachment");

// src/client/review-package.ts
var REVIEW_PREFIX = "\u8BF7\u5904\u7406\u4EE5\u4E0B\u9488\u5BF9\u5F53\u524D\u5DE5\u4F5C\u533A\u7684\u884C\u5185\u8BC4\u5BA1\u8BC4\u8BBA";
function isReviewPackageText(text) {
  const first = firstNonEmptyLine(text);
  return first !== null && first.startsWith(REVIEW_PREFIX);
}
function firstNonEmptyLine(text) {
  for (const raw of text.split("\n")) {
    const t = raw.trim();
    if (t !== "") return t;
  }
  return null;
}
function parseReviewPackage(text) {
  if (!isReviewPackageText(text)) return null;
  const pkg = { workspace: null, comments: [], verdict: null, findings: [] };
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    i += 1;
    if (t !== "") break;
  }
  while (i < lines.length) {
    const t = lines[i].trim();
    if (t === "") {
      i += 1;
      continue;
    }
    const w = /^工作区[:：]\s*(.+)$/.exec(t);
    if (w) {
      pkg.workspace = w[1].trim() || null;
      i += 1;
    }
    break;
  }
  let section = null;
  for (; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (t === "") continue;
    if (t.startsWith("## ")) {
      const title = t.slice(3).trim();
      section = title === "AI \u8BC4\u5BA1\u7ED3\u8BBA" ? "verdict" : title;
      continue;
    }
    if (t.startsWith("```")) {
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) i += 1;
      continue;
    }
    if (section === "verdict") {
      if (/补丁存在问题/.test(t) || /patch is incorrect/i.test(t)) pkg.verdict = "incorrect";
      else if (/补丁正确/.test(t) || /patch is correct/i.test(t)) pkg.verdict = "correct";
      const f = /^-\s*\[(P[0-3])\]\s*(.+?):(\d+)(?:-(\d+))?\s+(.+?)(?:\s*—\s*(.*))?$/.exec(t);
      if (f) {
        pkg.findings.push({ priority: f[1], file: f[2], line: Number(f[3]), title: f[5], detail: f[6] ?? "" });
      }
      continue;
    }
    if (section !== null && t.startsWith("- ")) {
      const body = t.slice(2).trim();
      const esc = escapeRegex(section);
      const mNew = new RegExp(`^${esc}:(\\d+):\\s*(.*)$`).exec(body);
      if (mNew) {
        pkg.comments.push({ path: section, line: Number(mNew[1]), text: mNew[2] });
        continue;
      }
      const mOld = new RegExp(`^${esc} \\(old line (\\d+)\\):\\s*(.*)$`).exec(body);
      if (mOld) {
        pkg.comments.push({ path: section, line: null, text: mOld[2] });
      }
    }
  }
  return pkg;
}
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// src/client/index.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var name = "diff-review";
var inject = ["sessions", "slots", "locale"];
var LOCALE_NS = "diff-review";
var MAX_DOCK_CHIPS = 4;
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
var sentStore = (0, import_client.createSnapshotStore)({}, { persist: { name: "dsdr-review-sent" } });
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
    if (node.kind !== "tool-result") continue;
    if (!current) {
      current = { round: rounds.length + 1, label: "", changes: [] };
      rounds.push(current);
    }
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
function sessionRowsWithLines(change) {
  const out = [];
  let oldLine = 1;
  let newLine = 1;
  for (const row of changeRows(change)) {
    if (row.kind === "ctx") {
      out.push({ row, oldLine: oldLine++, newLine: newLine++ });
    } else if (row.kind === "add") {
      out.push({ row, oldLine: null, newLine: newLine++ });
    } else if (row.kind === "del") {
      out.push({ row, oldLine: oldLine++, newLine: null });
    } else {
      out.push({ row, oldLine: null, newLine: null });
    }
  }
  return out;
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
.dsdr-line-num{flex:none;position:relative;width:40px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;font-size:calc(var(--dsdr-diff-size, 12px) - 1px);opacity:.75}
.dsdr-line-text{flex:1;min-width:0;white-space:pre}
.dsdr-comment-add{position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;width:16px;height:16px;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:12px;line-height:1;padding:0;visibility:hidden}
.dsdr-line:hover .dsdr-comment-add,.dsdr-comment-add:focus-visible{visibility:visible}
.dsdr-comment-add:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-comment-has{visibility:visible;background:color-mix(in srgb, var(--dsw-alias-button-info-fill) 16%, transparent);color:var(--dsw-alias-button-info-fill);font-variant-numeric:tabular-nums;font-size:10px}
.dsdr-line-commented{box-shadow:inset 3px 0 0 color-mix(in srgb, var(--dsw-alias-button-info-fill) 70%, transparent)}
.dsdr-comment-editor{display:flex;flex-direction:column;gap:6px;padding:8px 16px;border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.dsdr-comment-input{box-sizing:border-box;width:100%;min-height:52px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-primary);padding:6px 8px;font:inherit;font-size:12px;line-height:18px;resize:vertical}
.dsdr-comment-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}
.dsdr-comment-actions{display:flex;gap:6px;justify-content:flex-end}
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
.dsdr-verdict{position:sticky;top:0;z-index:6;display:flex;align-items:center;gap:8px;margin:0 0 6px;padding:8px 12px;background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:var(--dsw-shadow-lv2);font-size:12px;line-height:18px;flex-wrap:wrap}
.dsdr-verdict-mark{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;font-size:12px;font-weight:700}
.dsdr-verdict-ok .dsdr-verdict-mark{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 18%, transparent);color:var(--dsw-alias-state-success-primary)}
.dsdr-verdict-bad .dsdr-verdict-mark{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 18%, transparent);color:var(--dsw-alias-state-error-primary)}
.dsdr-verdict-text{font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-verdict-ok .dsdr-verdict-text{color:var(--dsw-alias-state-success-primary)}
.dsdr-verdict-bad .dsdr-verdict-text{color:var(--dsw-alias-state-error-primary)}
.dsdr-verdict-meta{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary)}
.dsdr-verdict-model{font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-finding-card{display:flex;flex-direction:column;gap:4px;margin:4px 0 6px;padding:8px 16px;background:var(--dsw-alias-bg-module-platform);border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsdr-saved-comment-loc{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-saved-comment-view{white-space:pre-wrap;overflow-wrap:anywhere;resize:none}
.dsdr-finding-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsdr-finding-card-title{flex:1;min-width:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-finding-card-loc{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsdr-finding-card-detail{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsdr-finding-card-meta{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-finding-card-suggestion{margin:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;line-height:16px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 8px;font-family:var(--dsw-font-mono)}
.dsdr-pr{display:flex;flex-direction:column;gap:4px;padding:4px 8px 8px}
.dsdr-pr-item{display:flex;flex-direction:column;gap:3px;border-radius:8px;padding:6px 8px;cursor:pointer;border:0;background:transparent;text-align:left;font:inherit}
.dsdr-pr-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-pr-meta{font-size:10px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono)}
.dsdr-pr-text{font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary);white-space:pre-wrap;overflow-wrap:anywhere}
.dsdr-dock{box-sizing:border-box;display:flex;flex-direction:column;gap:6px;width:100%;max-width:var(--dsh-composer-card-max-width, 780px);margin:0 auto calc(-1 * var(--dsh-composer-stack-gap, 6px) - 8px);padding:8px 16px;background:var(--dsw-specific-input-major);border:1px solid var(--dsw-alias-border-l2-darkmode-thin);border-bottom:none;border-radius:22px 22px 0 0;font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}
.dsdr-dock-head{display:flex;align-items:center;gap:6px;min-height:22px;margin:-8px -16px;padding:8px 16px;border-radius:22px 22px 0 0;cursor:pointer}
.dsdr-dock-head:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-dock-icon{display:inline-flex;color:var(--dsw-alias-button-info-fill)}
.dsdr-dock-count{font-weight:600;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);white-space:nowrap}
.dsdr-dock-flash{color:var(--dsw-alias-state-success-primary);font-size:11px;white-space:nowrap}
.dsdr-dock-send-hint{flex:none;font-size:11px;color:var(--dsw-alias-button-info-fill);visibility:hidden;white-space:nowrap}
.dsdr-dock-head:hover .dsdr-dock-send-hint{visibility:visible}
.dsdr-dock-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;padding:0}
.dsdr-dock-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-dock-chips{display:flex;align-items:center;gap:6px;min-height:26px;margin:0 -16px;padding:0 16px;overflow:hidden}
.dsdr-dock-chip{flex:0 1 auto;min-width:0;display:flex;align-items:center;gap:6px;border:0;background:var(--dsw-alias-bg-layer-2);border-radius:7px;padding:3px 8px;cursor:pointer;font:inherit;text-align:left}
.dsdr-dock-chip:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-dock-chip-loc{flex:none;font-family:var(--dsw-font-mono);font-size:10px;color:var(--dsw-alias-button-info-fill);white-space:nowrap;max-width:42%;overflow:hidden;text-overflow:ellipsis}
.dsdr-dock-chip-text{min-width:0;font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsdr-dock-chip-more{flex:none;display:inline-flex;align-items:center;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font:inherit;font-size:11px;line-height:16px;padding:2px 6px;border-radius:6px;white-space:nowrap}
.dsdr-dock-chip-more:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
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
.dsdr-empty-actions{display:flex;justify-content:center;margin-top:12px}
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
.dsdr-split-cell{display:flex;flex-wrap:wrap;gap:8px;padding:0 8px;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary)}
.dsdr-split-cell>.dsdr-comment-editor{flex:0 0 100%;padding:6px 8px}
.dsdr-split-num{flex:none;position:relative;width:42px;text-align:right;color:var(--dsw-alias-label-tertiary);user-select:none;font-size:calc(var(--dsdr-diff-size, 12px) - 1px);line-height:calc(var(--dsdr-diff-size, 12px) + 6px)}
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
/* --- conversation review card (Codex-style) --- */
.dsdr-review-card{display:flex;flex-direction:column;gap:2px;max-width:min(720px,100%);background:var(--dsw-alias-bg-module-platform);border:1px solid var(--dsw-alias-border-l1);border-radius:16px;box-shadow:var(--dsw-shadow-lv2);overflow:hidden;margin:2px 0}
.dsdr-review-card-head{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap}
.dsdr-review-card-badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-review-card-badge svg{color:var(--dsw-alias-button-info-fill)}
.dsdr-review-card-workspace{flex:1;min-width:0;font-size:11px;color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsdr-review-card-meta{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dsdr-review-card-group{display:flex;flex-direction:column}
.dsdr-review-card-path{display:flex;align-items:center;gap:6px;width:100%;min-width:0;padding:6px 12px;background:0 0;border:0;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;font-weight:600;text-align:left;cursor:pointer;font-family:var(--dsw-font-mono)}
.dsdr-review-card-path:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-review-card-path span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsdr-review-card-item{display:flex;align-items:flex-start;gap:8px;width:100%;min-width:0;padding:5px 12px 5px 26px;background:0 0;border:0;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;text-align:left;cursor:pointer}
.dsdr-review-card-item:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-review-card-loc{flex:none;font-family:var(--dsw-font-mono);font-size:11px;color:var(--dsw-alias-button-info-fill);white-space:nowrap;padding-top:1px}
.dsdr-review-card-text{min-width:0;overflow-wrap:anywhere;white-space:pre-wrap}
.dsdr-review-card-verdict-sec{display:flex;flex-direction:column;gap:4px;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.dsdr-review-card-verdict-head{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-review-card-verdict{flex:none;font-size:11px;font-weight:600;border-radius:6px;padding:1px 6px}
.dsdr-review-card-verdict-correct{background:rgba(46,160,67,.16);color:var(--dsw-alias-state-success-primary)}
.dsdr-review-card-verdict-incorrect{background:rgba(248,81,73,.16);color:var(--dsw-alias-state-error-primary)}
.dsdr-review-card-finding{display:flex;align-items:flex-start;gap:6px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.dsdr-review-card-finding-text{min-width:0;overflow-wrap:anywhere}
.dsdr-review-card-finding-loc{font-family:var(--dsw-font-mono);font-size:11px;color:var(--dsw-alias-label-tertiary)}
.dsdr-review-card-foot{padding:6px 12px;font-size:11px;color:var(--dsw-alias-label-tertiary);border-top:1px solid var(--dsw-alias-border-l1)}
/* --- fallback user bubble (native look) --- */
.dsdr-fallback-user{flex-direction:column;align-items:flex-end;gap:6px;display:flex}
.dsdr-fallback-user-stack{flex-direction:column;align-items:flex-end;gap:8px;min-width:0;max-width:min(525px,82%);display:flex}
.dsdr-fallback-user-row{flex-direction:row;align-items:flex-end;gap:6px;max-width:100%;display:flex}
.dsdr-fallback-user-bubble{background:var(--dsw-specific-bubble);max-width:100%;color:var(--dsw-alias-label-primary);border-radius:22px;padding:10px 16px;font-size:16px;line-height:24px;white-space:pre-wrap;overflow-wrap:anywhere}
.dsdr-fallback-user-copy{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:0;border-radius:6px;background:0 0;color:var(--dsw-alias-label-tertiary);cursor:pointer;font:inherit;font-size:11px;visibility:hidden;margin-bottom:2px}
.dsdr-fallback-user:hover .dsdr-fallback-user-copy,.dsdr-fallback-user-copy:focus-visible{visibility:visible}
.dsdr-fallback-user-copy:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
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
  "review.sessionScan": "\u5DF2\u626B\u63CF {results} \u4E2A\u5DE5\u5177\u7ED3\u679C\uFF1A{diff} \u4E2A\u643A\u5E26 diff\u3001{path} \u4E2A\u4EC5\u6709\u8DEF\u5F84\u2014\u2014\u7EC8\u7AEF\u547D\u4EE4\uFF08bash\uFF09\u6539\u6587\u4EF6\u4E0D\u4F1A\u8BA1\u5165\u4F1A\u8BDD\u8BB0\u5F55\u3002",
  "review.goWorkspace": "\u67E5\u770B\u5DE5\u4F5C\u533A\u6539\u52A8",
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
  "comment.edit": "\u7F16\u8F91",
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
  "review.dockVerdict": "\u8BC4\u5BA1\u7ED3\u8BBA\u5F85\u53D1\u9001",
  "review.dockSend": "\u70B9\u51FB\u53D1\u9001\u8BC4\u8BBA",
  "review.dockMore": "\u8FD8\u6709 {n} \u6761\u8BC4\u8BBA\uFF0C\u70B9\u51FB\u5728\u8BC4\u5BA1\u9762\u677F\u4E2D\u67E5\u770B",
  "review.copiedFallback": "\u4F1A\u8BDD\u4E0D\u53EF\u7528\uFF0C\u8BC4\u8BBA\u5DF2\u590D\u5236\uFF08\u8BF7\u7C98\u8D34\u53D1\u9001\uFF09",
  "review.sendFailed": "\u8BC4\u8BBA\u53D1\u9001\u5931\u8D25",
  "review.dockJump": "\u70B9\u51FB\u5728\u8BC4\u5BA1\u9762\u677F\u4E2D\u6253\u5F00\u5BF9\u5E94\u53D8\u66F4",
  "review.cardTitle": "\u884C\u5185\u8BC4\u5BA1",
  "review.cardComments": "{n} \u6761\u8BC4\u8BBA",
  "review.cardVerdict": "AI \u8BC4\u5BA1\u7ED3\u8BBA",
  "review.cardJump": "\u70B9\u51FB\u5728\u8BC4\u5BA1\u9762\u677F\u4E2D\u5B9A\u4F4D\u5230\u5BF9\u5E94\u4EE3\u7801",
  "review.cardOpenFile": "\u5728\u8BC4\u5BA1\u9762\u677F\u4E2D\u6253\u5F00\u8BE5\u6587\u4EF6",
  "review.cardHint": "\u70B9\u51FB\u8BC4\u8BBA\u53EF\u5728\u8BC4\u5BA1\u9762\u677F\u4E2D\u5B9A\u4F4D\u5230\u5BF9\u5E94\u4EE3\u7801",
  "fallback.image": "\u56FE\u7247",
  "fallback.open": "\u67E5\u770B\u539F\u56FE",
  "fallback.openNamed": "\u67E5\u770B\u539F\u56FE {name}",
  "fallback.loading": "\u52A0\u8F7D\u4E2D\u2026",
  "fallback.loadFailed": "\u52A0\u8F7D\u5931\u8D25",
  "fallback.lightboxDialog": "\u56FE\u7247\u9884\u89C8",
  "fallback.lightboxClose": "\u5173\u95ED",
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
  "review.sessionScan": "Scanned {results} tool results: {diff} with diffs, {path} path-only \u2014 terminal (bash) edits are not tracked in the session log.",
  "review.goWorkspace": "View workspace changes",
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
  "comment.edit": "Edit",
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
  "review.dockVerdict": "verdict pending",
  "review.dockSend": "Click to send",
  "review.copiedFallback": "Session unavailable \u2014 comments copied (paste to send)",
  "review.sendFailed": "Failed to send comments",
  "review.dockJump": "Open the matching change in the review panel",
  "review.dockMore": "{n} more comments \u2014 open the review panel",
  "review.cardTitle": "Inline review",
  "review.cardComments": "{n} comments",
  "review.cardVerdict": "AI review verdict",
  "review.cardJump": "Jump to the matching code in the review panel",
  "review.cardOpenFile": "Open this file in the review panel",
  "review.cardHint": "Click a comment to jump to the matching change block",
  "fallback.image": "Image",
  "fallback.open": "View original",
  "fallback.openNamed": "View original {name}",
  "fallback.loading": "Loading\u2026",
  "fallback.loadFailed": "Failed to load",
  "fallback.lightboxDialog": "Image preview",
  "fallback.lightboxClose": "Close",
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
function CommentLine({ count, onOpen, t }) {
  if (count > 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-comment-add dsdr-comment-has", title: t("comment.show"), "aria-label": t("comment.show"), children: count });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-comment-add", title: t("comment.add"), "aria-label": t("comment.add"), onClick: onOpen, children: "+" });
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
function CommentBox({ comment, busy, onUpdate, onDelete, t }) {
  const [editing, setEditing] = (0, import_react.useState)(false);
  const [text, setText] = (0, import_react.useState)(comment.text);
  if (editing) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      CommentEditor,
      {
        text,
        onText: setText,
        onSave: () => void (async () => {
          if (await onUpdate(comment.id, text.trim())) setEditing(false);
        })(),
        onCancel: () => {
          setText(comment.text);
          setEditing(false);
        },
        busy,
        t
      }
    );
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-editor", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-saved-comment-loc", children: [
      comment.path,
      comment.lineNew !== null ? `:${comment.lineNew}` : comment.lineOld !== null ? ` (old:${comment.lineOld})` : ""
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-comment-input dsdr-saved-comment-view", children: comment.text }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => {
        setText(comment.text);
        setEditing(true);
      }, children: t("comment.edit") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn dsdr-btn-danger", disabled: busy, onClick: () => onDelete(comment.id), children: t("comment.delete") })
    ] })
  ] });
}
function FindingCard({ finding, t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-finding-card dsdr-finding-${finding.priority}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-finding-card-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-finding-tag dsdr-finding-${finding.priority}`, children: finding.priority }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-finding-card-title", children: finding.title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-finding-card-loc", children: [
        finding.file,
        ":",
        finding.lineStart,
        finding.lineEnd !== finding.lineStart ? `-${finding.lineEnd}` : ""
      ] })
    ] }),
    finding.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-finding-card-detail", children: finding.detail }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-finding-card-meta", children: t("review.confidence", { confidence: finding.confidence.toFixed(2) }) }),
    finding.suggestion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsdr-finding-card-suggestion", children: finding.suggestion }) : null
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
  onDeleteComment,
  onUpdateComment,
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
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-line-num", children: [
                  newLine ?? oldLine ?? "",
                  showActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentLine, { count: rowComments.length, onOpen: () => onOpenComment?.(oldLine, newLine), t }) : null
                ] }),
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
                  ) : null
                ] }) : null
              ]
            }
          ),
          showActions && rowComments.length > 0 ? rowComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentBox, { comment, busy, onUpdate: onUpdateComment ?? (async () => false), onDelete: onDeleteComment ?? (() => {
          }), t }, comment.id)) : null,
          editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEditor, { text: commentText ?? "", onText: onCommentText ?? (() => {
          }), onSave: onSaveComment ?? (() => {
          }), onCancel: onCancelComment ?? (() => {
          }), busy, t }) : null,
          (reviewFindings ?? []).filter((f) => f.file === path && f.lineStart === (newLine ?? oldLine)).map((f, fi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FindingCard, { finding: f, t }, `${f.file}:${f.lineStart}:${fi}`))
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
function userMessageText(content) {
  let out = "";
  for (const block of content) {
    if (block.type === "text" && typeof block.text === "string") out += block.text;
  }
  return out;
}
function groupComments(comments) {
  const groups = [];
  const index = /* @__PURE__ */ new Map();
  for (const c of comments) {
    let g = index.get(c.path);
    if (g === void 0) {
      g = groups.length;
      index.set(c.path, g);
      groups.push({ path: c.path, comments: [] });
    }
    groups[g].comments.push(c);
  }
  return groups;
}
function IconFile() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M14 2v6h6" })
  ] });
}
function ReviewPackageCard({ pkg, cwd, t }) {
  const targetCwd = pkg.workspace ?? cwd ?? null;
  const jump = (path, line) => {
    if (!targetCwd) return;
    overlayStore.update((d) => {
      d.open = true;
      d.cwd = targetCwd;
      d.focus = { path, line };
      d.key = d.key + 1;
    });
  };
  const groups = (0, import_react.useMemo)(() => groupComments(pkg.comments), [pkg.comments]);
  const showVerdict = pkg.verdict !== null || pkg.findings.length > 0;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-review-card", "data-time-hover-root": true, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-review-card-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-review-card-badge", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComment, {}),
        t("review.cardTitle")
      ] }),
      targetCwd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-review-card-workspace", title: targetCwd, children: targetCwd }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spacer" }),
      pkg.comments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-review-card-meta", children: t("review.cardComments", { n: pkg.comments.length }) }) : null
    ] }),
    groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-review-card-group", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-review-card-path", title: t("review.cardOpenFile"), onClick: () => jump(g.path), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconFile, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: g.path })
      ] }),
      g.comments.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: "dsdr-review-card-item",
          title: t("review.cardJump"),
          onClick: () => jump(c.path, c.line ?? void 0),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-review-card-loc", children: c.line !== null ? `${c.path}:${c.line}` : `${c.path} (old)` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-review-card-text", children: c.text })
          ]
        },
        i
      ))
    ] }, g.path)),
    showVerdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-review-card-verdict-sec", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-review-card-verdict-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("review.cardVerdict") }),
        pkg.verdict ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-review-card-verdict dsdr-review-card-verdict-${pkg.verdict}`, children: pkg.verdict === "correct" ? t("review.verdictCorrect") : t("review.verdictIncorrect") }) : null
      ] }),
      pkg.findings.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-review-card-finding", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-finding-tag dsdr-finding-${f.priority}`, children: f.priority }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-review-card-finding-text", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-review-card-finding-loc", children: [
            f.file,
            ":",
            f.line
          ] }),
          " ",
          f.title,
          f.detail ? ` \u2014 ${f.detail}` : ""
        ] })
      ] }, i))
    ] }) : null,
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-review-card-foot", children: t("review.cardHint") })
  ] });
}
function FallbackUserBubble({
  text,
  images,
  loadImage,
  t
}) {
  const [copied, setCopied] = (0, import_react.useState)(false);
  const onCopy = () => {
    void (0, import_dsh_client_ui_primitives.writeClipboard)(text).then((ok) => {
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 1e3);
    });
  };
  const labels = (0, import_react.useMemo)(
    () => ({
      image: t("fallback.image"),
      open: t("fallback.open"),
      openNamed: (name2) => t("fallback.openNamed", { name: name2 }),
      loading: t("fallback.loading"),
      loadFailed: t("fallback.loadFailed"),
      lightbox: { dialog: t("fallback.lightboxDialog"), close: t("fallback.lightboxClose") }
    }),
    [t]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-fallback-user", "data-time-hover-root": true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-fallback-user-stack", children: [
    images.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_attachment.ImageGallery, { images, load: loadImage, align: "end", labels }) : null,
    text !== "" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-fallback-user-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-fallback-user-bubble", children: text }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-fallback-user-copy", title: t("review.copy"), onClick: onCopy, children: copied ? t("review.copied") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconCopy, {}) })
    ] }) : null
  ] }) });
}
function IconCopy() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
  ] });
}
function UserReviewNodeView(props) {
  const content = (0, import_react.useMemo)(() => props.node.data.content, [props.node.data.content]);
  const text = (0, import_react.useMemo)(() => userMessageText(content), [content]);
  const images = (0, import_react.useMemo)(
    () => content.filter((b) => b.type === "image" && b.attachment !== void 0),
    [content]
  );
  const pkg = (0, import_react.useMemo)(() => isReviewPackageText(text) ? parseReviewPackage(text) : null, [text]);
  if (pkg) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewPackageCard, { pkg, cwd: props.cwd, t: props.t });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FallbackUserBubble, { text, images, loadImage: props.loadImage, t: props.t });
}
function DiffReviewComposerDock({ sessionId, useSessions, useSession, sessions, input, t }) {
  const cwd = useSessions((s) => s.byId[sessionId]?.cwd);
  const pending = (0, import_react.useSyncExternalStore)(pendingCommentsStore.subscribe, pendingCommentsStore.getSnapshot);
  const [dismissed, setDismissed] = (0, import_react.useState)(false);
  const [carryFlash, setCarryFlash] = (0, import_react.useState)(null);
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
  const sentSnap = (0, import_react.useSyncExternalStore)(sentStore.subscribe, sentStore.getSnapshot);
  const sent = cwd && sentSnap[cwd] || { sentCommentIds: [], sentReviewKey: null };
  const sentSet = new Set(sent.sentCommentIds);
  const unsentComments = comments.filter((c) => !sentSet.has(c.id));
  const reviewKey = pending.review?.ok && (pending.review.findings.length > 0 || pending.review.verdict) ? `${pending.review.verdict ?? ""}:${pending.review.findings.length}:${pending.review.findings[0]?.title ?? ""}` : null;
  const reviewPending = reviewKey !== null && reviewKey !== sent.sentReviewKey;
  const hasPending = unsentComments.length > 0 || reviewPending;
  (0, import_react.useEffect)(() => {
    if (!hasPending) {
      setDismissed(false);
    }
  }, [hasPending]);
  const composeCarriedMessage = () => {
    const lines = ["\u8BF7\u5904\u7406\u4EE5\u4E0B\u9488\u5BF9\u5F53\u524D\u5DE5\u4F5C\u533A\u7684\u884C\u5185\u8BC4\u5BA1\u8BC4\u8BBA\uFF08Address the inline comments\uFF0C\u4FDD\u6301\u6539\u52A8\u8303\u56F4\u6700\u5C0F\uFF09\uFF1A", `\u5DE5\u4F5C\u533A\uFF1A${cwd}`, ""];
    const byPath = /* @__PURE__ */ new Map();
    for (const c of unsentComments) {
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
    if (reviewPending && pending.review) {
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
  const markSent = () => {
    if (!cwd) return;
    const carriedIds2 = unsentComments.map((c) => c.id);
    sentStore.update((d) => {
      const prev = d[cwd] ?? { sentCommentIds: [], sentReviewKey: null };
      d[cwd] = {
        sentCommentIds: [.../* @__PURE__ */ new Set([...prev.sentCommentIds, ...carriedIds2])],
        sentReviewKey: reviewPending ? reviewKey : prev.sentReviewKey
      };
    });
  };
  const phase = input?.phase;
  const running = useSession((s) => s.running);
  const userCount = useSession((s) => s.nodes.filter((n) => n.kind === "user").length);
  const prevRunning = (0, import_react.useRef)(running);
  const prevUserCount = (0, import_react.useRef)(userCount);
  const carry = () => {
    if (!hasPending || carrying.current) return;
    carrying.current = true;
    void injectToSession(sessions, sessionId, composeCarriedMessage()).then((outcome) => {
      if (outcome !== "failed") markSent();
      carrying.current = false;
      setCarryFlash(outcome === "sent" ? t("review.sentToAgent") : outcome === "copied" ? t("review.copiedFallback") : t("review.sendFailed"));
      setTimeout(() => setCarryFlash(null), 3200);
    });
  };
  (0, import_react.useEffect)(() => {
    const turnStarted = prevRunning.current === false && running === true;
    prevRunning.current = running;
    const newUserMsg = prevUserCount.current < userCount;
    prevUserCount.current = userCount;
    const phaseHit = phase === "submitting" || phase === "adjudicating";
    if (!hasPending) return;
    if (!turnStarted && !newUserMsg && !phaseHit) return;
    carry();
  }, [running, userCount, phase, hasPending]);
  if (!cwd || !hasPending && !carryFlash || dismissed) return null;
  const focusComment = (comment) => {
    overlayStore.update((d) => {
      d.open = true;
      d.cwd = cwd;
      d.focus = { path: comment.path, line: comment.lineNew ?? comment.lineOld ?? void 0 };
      d.key = d.key + 1;
    });
  };
  const openPanel = () => {
    overlayStore.update((d) => {
      d.open = true;
      d.cwd = cwd;
      d.focus = null;
      d.key = d.key + 1;
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-dock", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: "dsdr-dock-head",
        role: "button",
        tabIndex: 0,
        title: t("review.dockSend"),
        onClick: carry,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            carry();
          }
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComment, {}) }),
          carryFlash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-flash", children: carryFlash }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-dock-count", children: [
            t("review.dockComments", { n: unsentComments.length }),
            reviewPending ? ` \xB7 ${t("review.dockVerdict")}` : ""
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spacer" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-send-hint", children: t("review.dockSend") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              type: "button",
              className: "dsdr-dock-close",
              "aria-label": t("comment.cancel"),
              onClick: (e) => {
                e.stopPropagation();
                setDismissed(true);
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconX, {})
            }
          )
        ]
      }
    ),
    unsentComments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-dock-chips", children: [
      unsentComments.slice(0, MAX_DOCK_CHIPS).map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "button",
        {
          type: "button",
          className: "dsdr-dock-chip",
          title: t("review.dockJump"),
          onClick: () => focusComment(comment),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-dock-chip-loc", children: [
              comment.path,
              comment.lineNew !== null ? `:${comment.lineNew}` : ""
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-dock-chip-text", children: comment.text })
          ]
        },
        comment.id
      )),
      unsentComments.length > MAX_DOCK_CHIPS ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-dock-chip-more", title: t("review.dockMore", { n: unsentComments.length - MAX_DOCK_CHIPS }), onClick: openPanel, children: [
        "+",
        unsentComments.length - MAX_DOCK_CHIPS
      ] }) : null
    ] }) : null
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
  const lastUserTime = (0, import_react.useMemo)(() => {
    if (!snapshot) return 0;
    let t2 = 0;
    for (const n of snapshot.nodes) {
      if (n.kind === "user" && n.time > t2) t2 = n.time;
    }
    return t2;
  }, [snapshot]);
  const sessionScan = (0, import_react.useMemo)(() => {
    if (!snapshot) return null;
    let results = 0;
    let diffCards = 0;
    let pathOnly = 0;
    for (const node of snapshot.nodes) {
      if (node.kind !== "tool-result") continue;
      results++;
      const changes = changesFromToolResult(node.call, node);
      if (changes.length > 0) {
        if (changes.some((x) => x.hasDiff)) diffCards++;
        else pathOnly++;
      }
    }
    return { results, diffCards, pathOnly };
  }, [snapshot]);
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
      case "last-turn": {
        if (files.length === 0) return [];
        const suffixMatch = (f) => {
          if (lastRoundPaths.size === 0) return false;
          if (lastRoundPaths.has(f.path) || lastRoundPaths.has(baseName(f.path))) return true;
          const suffix = `/${f.path}`;
          for (const p of lastRoundPaths) {
            if (p.endsWith(suffix)) return true;
          }
          return false;
        };
        return files.filter((f) => {
          if (suffixMatch(f)) return true;
          return lastUserTime > 0 && f.mtime >= lastUserTime - 5e3;
        });
      }
      default:
        return files;
    }
  }, [scope, unstagedFiles, stagedFiles, baseStatus, files, lastRoundPaths, lastUserTime]);
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
  };
  const saveComment = async () => {
    const commentPath = tab === "workspace" ? selectedFile?.path : selectedChange?.path;
    if (!commentPath || !commentEditor || busy) return;
    const text = commentText.trim();
    if (!text) return;
    const comment = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      path: commentPath,
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
  const updateComment = async (id, text) => {
    if (!text || busy) return false;
    const next = comments.map((c) => c.id === id ? { ...c, text, createdAt: (/* @__PURE__ */ new Date()).toISOString() } : c);
    setBusy(true);
    try {
      if (activeCwd && await saveComments(activeCwd, next)) {
        setComments(next);
        return true;
      }
      setNotice({ kind: "error", text: t("comment.failed") });
      return false;
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : t("comment.failed") });
      return false;
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
            tab === "session" ? rounds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-empty", children: [
              t("review.noSessionChanges"),
              sessionScan && sessionScan.results > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-nodiff", children: t("review.sessionScan", { results: sessionScan.results, diff: sessionScan.diffCards, path: sessionScan.pathOnly }) }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty-actions", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", onClick: () => setTab("workspace"), children: t("review.goWorkspace") }) })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-body", children: [
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
                  selectedChange.hasDiff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiffViewToggle, { view, onChange: setView, t }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => void openFile(selectedChange.path), title: t("editor.openFile"), children: [
                    "\u2197 ",
                    t("editor.openFile")
                  ] })
                ] }),
                selectedChange.hasDiff ? view === "split" && changeSplitBlocks(selectedChange).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split", children: [
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
                  changeSplitBlocks(selectedChange).map((block, bi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
                    block.head ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-split-hunk", children: block.head }) : null,
                    block.rows.map((row, ri) => {
                      const leftAnchor = { oldLine: row.leftNum, newLine: row.kind === "ctx" && row.leftNum !== null ? row.leftNum : null };
                      const rightAnchor = { oldLine: row.kind === "ctx" && row.rightNum !== null ? row.rightNum : null, newLine: row.rightNum };
                      const leftKey = `${leftAnchor.oldLine ?? "o"}:${leftAnchor.newLine ?? "n"}`;
                      const rightKey = `${rightAnchor.oldLine ?? "o"}:${rightAnchor.newLine ?? "n"}`;
                      const leftComments = comments.filter((c) => commentMatches(c, leftAnchor.oldLine, leftAnchor.newLine));
                      const rightComments = comments.filter((c) => commentMatches(c, rightAnchor.oldLine, rightAnchor.newLine));
                      const commentBtn = (anchor, count) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        CommentLine,
                        {
                          count,
                          onOpen: () => {
                            setCommentEditor({ oldLine: anchor.oldLine, newLine: anchor.newLine });
                            setCommentText("");
                          },
                          t
                        }
                      );
                      const openBtn = (line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-split-openline", title: t("editor.openLine"), "aria-label": t("editor.openLine"), onClick: () => void openFile(selectedChange.path, line), children: "\u2197" });
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split-row", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "div",
                          {
                            className: `dsdr-split-cell ${row.leftNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-del" : ""}`,
                            "data-dsdr-line": row.leftNum ?? void 0,
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-split-num", children: [
                                row.leftNum ?? "",
                                commentBtn(leftAnchor, leftComments.length)
                              ] }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.left }),
                              row.leftNum !== null ? openBtn(row.leftNum) : null,
                              leftComments.length > 0 ? leftComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentBox, { comment, busy, onUpdate: updateComment, onDelete: (id) => void deleteComment(id), t }, comment.id)) : null,
                              commentEditor && leftKey === `${commentEditor.oldLine ?? "o"}:${commentEditor.newLine ?? "n"}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEditor, { text: commentText, onText: setCommentText, onSave: () => void saveComment(), onCancel: cancelComment, busy, t }) : null
                            ]
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "div",
                          {
                            className: `dsdr-split-cell ${row.rightNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-add" : ""}`,
                            "data-dsdr-line": row.rightNum ?? void 0,
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-split-num", children: [
                                row.rightNum ?? "",
                                commentBtn(rightAnchor, rightComments.length)
                              ] }),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.right }),
                              row.rightNum !== null ? openBtn(row.rightNum) : null,
                              rightComments.length > 0 ? rightComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentBox, { comment, busy, onUpdate: updateComment, onDelete: (id) => void deleteComment(id), t }, comment.id)) : null,
                              commentEditor && rightKey === `${commentEditor.oldLine ?? "o"}:${commentEditor.newLine ?? "n"}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEditor, { text: commentText, onText: setCommentText, onSave: () => void saveComment(), onCancel: cancelComment, busy, t }) : null
                            ]
                          }
                        )
                      ] }) }, ri);
                    })
                  ] }, bi))
                ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsdr-pre", children: sessionRowsWithLines(selectedChange).map(({ row, oldLine, newLine }, i) => {
                  const key = `${oldLine ?? "o"}:${newLine ?? "n"}`;
                  const rowComments = comments.filter((c) => commentMatches(c, oldLine, newLine));
                  const showActions = row.kind === "ctx" || row.kind === "add" || row.kind === "del";
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-line dsdr-line-${row.kind}${rowComments.length > 0 ? " dsdr-line-commented" : ""}`, "data-dsdr-line": newLine ?? oldLine ?? void 0, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-line-num", children: [
                        newLine ?? oldLine ?? "",
                        showActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentLine, { count: rowComments.length, onOpen: () => openComment(oldLine, newLine), t }) : null
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-line-text", children: row.text || " " }),
                      showActions && (newLine ?? oldLine) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-openline", title: t("editor.openLine"), "aria-label": t("editor.openLine"), onClick: () => void openFile(selectedChange.path, newLine ?? oldLine ?? 1), children: "\u2197" }) : null
                    ] }),
                    showActions && rowComments.length > 0 ? rowComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentBox, { comment, busy, onUpdate: updateComment, onDelete: (id) => void deleteComment(id), t }, comment.id)) : null,
                    commentEditor && `${commentEditor.oldLine ?? "o"}:${commentEditor.newLine ?? "n"}` === key ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEditor, { text: commentText, onText: setCommentText, onSave: () => void saveComment(), onCancel: cancelComment, busy, t }) : null
                  ] }, i);
                }) }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-nodiff", children: t("review.noDiffData") })
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
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-diff", children: [
                review?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dsdr-verdict${review.verdict === "incorrect" ? " dsdr-verdict-bad" : " dsdr-verdict-ok"}`, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-verdict-mark", children: review.verdict === "incorrect" ? "\u2717" : "\u2713" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-verdict-text", children: review.verdict === "incorrect" ? t("review.verdictIncorrect") : t("review.verdictCorrect") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-verdict-meta", children: [
                    review.findings.length > 0 ? t("review.findings", { n: review.findings.length }) : t("review.noFindings"),
                    review.truncated ? " (truncated)" : ""
                  ] }),
                  review.model ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-verdict-model", children: [
                    review.model.provider,
                    "/",
                    review.model.model
                  ] }) : null,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spacer" }),
                  review.findings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy, onClick: () => openSendPanelWith(composeFindingsMessage()), children: t("review.sendFindings") }) : null
                ] }) : null,
                selectedCommit ? commitDiffLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-empty", children: t("review.busy") }) : commitDiff?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
                            onOpen: () => {
                              setCommentEditor({ oldLine: anchor.oldLine, newLine: anchor.newLine });
                              setCommentText("");
                            },
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
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-split-num", children: [
                                    row.leftNum ?? "",
                                    commentBtn(leftAnchor, leftComments.length)
                                  ] }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.left }),
                                  row.leftNum !== null ? openBtn(row.leftNum) : null,
                                  rowFindings.length > 0 && row.rightNum === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`, children: rowFindings[0].priority }) : null,
                                  leftComments.length > 0 ? leftComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentBox, { comment, busy, onUpdate: updateComment, onDelete: (id) => void deleteComment(id), t }, comment.id)) : null,
                                  commentEditor && leftKey === `${commentEditor.oldLine ?? "o"}:${commentEditor.newLine ?? "n"}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEditor, { text: commentText, onText: setCommentText, onSave: () => void saveComment(), onCancel: cancelComment, busy, t }) : null
                                ]
                              }
                            ),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                              "div",
                              {
                                className: `dsdr-split-cell ${row.rightNum === null ? "dsdr-cell-dim" : row.kind === "change" ? "dsdr-cell-add" : ""}${findingCls}${jumped ? " dsdr-cell-jump" : ""}`,
                                "data-dsdr-line": row.rightNum ?? void 0,
                                children: [
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-split-num", children: [
                                    row.rightNum ?? "",
                                    commentBtn(rightAnchor, rightComments.length)
                                  ] }),
                                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-split-text", children: row.right }),
                                  row.rightNum !== null ? openBtn(row.rightNum) : null,
                                  rowFindings.length > 0 && row.rightNum !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dsdr-split-finding dsdr-finding-${rowFindings[0].priority}`, children: rowFindings[0].priority }) : null,
                                  rightComments.length > 0 ? rightComments.map((comment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentBox, { comment, busy, onUpdate: updateComment, onDelete: (id) => void deleteComment(id), t }, comment.id)) : null,
                                  commentEditor && rightKey === `${commentEditor.oldLine ?? "o"}:${commentEditor.newLine ?? "n"}` ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentEditor, { text: commentText, onText: setCommentText, onSave: () => void saveComment(), onCancel: cancelComment, busy, t }) : null
                                ]
                              }
                            )
                          ] }),
                          (review?.findings ?? []).filter((f) => f.file === selectedFile.path && f.lineStart === (row.leftNum ?? row.rightNum)).map((f, fi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FindingCard, { finding: f, t }, `${f.file}:${f.lineStart}:${fi}`))
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
                      onDeleteComment: (id) => void deleteComment(id),
                      onUpdateComment: updateComment,
                      readOnly: !allowActions,
                      path: selectedFile.path,
                      reviewFindings: review?.findings,
                      onOpenLine: (p, line) => void openFile(p, line),
                      jumpLine
                    }
                  )
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-empty", children: scope === "commit" ? t("review.selectCommit") : t("review.empty") })
              ] })
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
    "conversation.chat.node",
    () => ctx.slots.register(
      {
        name: "conversation.chat.node",
        key: "user",
        priority: -1,
        locale: LOCALE_NS
      },
      UserReviewNodeView
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIiwgInNyYy9jbGllbnQvcmV2aWV3LXBhY2thZ2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRGlmZi1yZXZpZXcgcGx1Z2luIFx1MjAxNCBjbGllbnQgaGFsZi5cbiAqXG4gKiBDb2RleC1zdHlsZSByZXZpZXcgd2l0aCB0d28gc291cmNlczpcbiAqXG4gKiAxLiAqKlx1NEYxQVx1OEJERFx1NjZGNFx1NjUzOSAoU2Vzc2lvbiBjaGFuZ2VzKSoqIFx1MjAxNCB3aGF0IHRoZSBhZ2VudCBjaGFuZ2VkIGluIGVhY2ggcm91bmQgb2ZcbiAqICAgIHRoaXMgY29udmVyc2F0aW9uLCBkZXJpdmVkIGZyb20gdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCAodG9vbCByZXN1bHRzXG4gKiAgICBjYXJyeSB0aGUgaG9zdC1jb21wdXRlZCBgcmVzdWx0Vmlld2AgZGlmZiBodW5rcykuIFdvcmtzIHdpdGggb3Igd2l0aG91dFxuICogICAgZ2l0LCBhbmQgc2hvd3MgYSBjaGFuZ2UgZXZlbiB3aGVuIG5vIGRpZmYgdGV4dCBpcyBhdmFpbGFibGUgKHBhdGgtb25seSkuXG4gKiAyLiAqKlx1NURFNVx1NEY1Q1x1NTMzQSAoV29ya3NwYWNlKSoqIFx1MjAxNCB0aGUgZ2l0IHdvcmtpbmcgdHJlZSdzIHVuY29tbWl0dGVkIGNoYW5nZXNcbiAqICAgIChzdGFnZWQgKyB1bnN0YWdlZCArIHVudHJhY2tlZCkgd2l0aCBwZXItZmlsZSAvIGFsbC1maWxlIGFjY2VwdCAoc3RhZ2UpXG4gKiAgICBhbmQgcmV2ZXJ0IChkaXNjYXJkKSB0aHJvdWdoIHRoZSBwbHVnaW4ncyBzZXJ2ZXIgcm91dGVzLlxuICpcbiAqIFRoZSByZXZpZXcgc3VyZmFjZSBtb3VudHMgaW4gYHNoZWxsLm92ZXJsYXlgIChyb290IHNjb3BlKS4gU3RhdGUgaGFuZC1vZmZcbiAqIGJldHdlZW4gdGhlIHNlc3Npb24tc2NvcGVkIGhlYWRlciB0cmlnZ2VyIGFuZCB0aGUgcm9vdC1zY29wZWQgb3ZlcmxheSBnb2VzXG4gKiB0aHJvdWdoIGEgbW9kdWxlLWxldmVsIHNuYXBzaG90IHN0b3JlOyB0aGUgY29udmVyc2F0aW9uIHNuYXBzaG90IGZvciB0aGVcbiAqIGN1cnJlbnQgc2Vzc2lvbiBpcyByZWFkIHJlYWN0aXZlbHkgdGhyb3VnaCBgY3R4LnNlc3Npb25zYCAoaW5qZWN0ZWQgdmlhIHRoZVxuICogb3ZlcmxheSByZWdpc3RyYXRpb24ncyBpbmplY3QgZmFjZSkuXG4gKi9cbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSwgdXNlU3luY0V4dGVybmFsU3RvcmUsIEZyYWdtZW50IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENTU1Byb3BlcnRpZXMsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBkaWZmTGluZXMgfSBmcm9tICdkaWZmJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0LCBJU2Vzc2lvbnMsIFNlc3Npb25MaXN0U3RhdGUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB7IGNyZWF0ZVNuYXBzaG90U3RvcmUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgUHJvcHNMb2NhbGUsIFByb3BzUnVudGltZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNsb3RzJ1xuaW1wb3J0IHR5cGUgeyBDb252ZXJzYXRpb25Ob2RlLCBUb29sUmVzdWx0Tm9kZSwgVXNlck1lc3NhZ2VOb2RlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFNlc3Npb25JZCwgVG9vbFJlc3VsdFZpZXcgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWFwaS1yZW1vdGVzL2NsaWVudCdcbmltcG9ydCB7IEljb25DaGV2cm9uRG93bk91dGxpbmUxNCwgd3JpdGVDbGlwYm9hcmQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuaW1wb3J0IHsgSW1hZ2VHYWxsZXJ5IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktYXR0YWNobWVudCdcbmltcG9ydCB0eXBlIHsgSW1hZ2VBdHRhY2htZW50UmVmIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hdHRhY2htZW50J1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEdpdFJlc3BvbnNlLCBIaXN0b3J5UmVzcG9uc2UsIFByUmVzcG9uc2UsIFJlcG9zUmVzcG9uc2UsIFJldmlld0NvbW1lbnQsIFJldmlld0ZpbmRpbmcsIFJldmlld1Jlc3BvbnNlLCBTdGF0dXNSZXNwb25zZSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcy50cydcbmltcG9ydCB7IHBhcnNlUmV2aWV3UGFja2FnZSwgaXNSZXZpZXdQYWNrYWdlVGV4dCB9IGZyb20gJy4vcmV2aWV3LXBhY2thZ2UudHMnXG5pbXBvcnQgdHlwZSB7IFJldmlld1BhY2thZ2UsIFJldmlld1BhY2thZ2VDb21tZW50LCBSZXZpZXdQYWNrYWdlRmluZGluZyB9IGZyb20gJy4vcmV2aWV3LXBhY2thZ2UudHMnXG5cbmV4cG9ydCBjb25zdCBuYW1lID0gJ2RpZmYtcmV2aWV3J1xuXG4vKiogUmVxdWlyZWQgY2xpZW50IHNlcnZpY2VzIChmaWJlciBpbmplY3QpLiAqL1xuZXhwb3J0IGNvbnN0IGluamVjdCA9IFsnc2Vzc2lvbnMnLCAnc2xvdHMnLCAnbG9jYWxlJ11cblxuY29uc3QgTE9DQUxFX05TID0gJ2RpZmYtcmV2aWV3J1xuLyoqIE1heCBjb21tZW50IGNoaXBzIHNob3duIGluIHRoZSBkb2NrIHJvdyBiZWZvcmUgY29sbGFwc2luZyBpbnRvICtOLiAqL1xuY29uc3QgTUFYX0RPQ0tfQ0hJUFMgPSA0XG5jb25zdCBTVEFUVVNfVVJMID0gJ2RpZmYtcmV2aWV3L3N0YXR1cydcbmNvbnN0IEFQUExZX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseSdcbmNvbnN0IEFQUExZX0hVTktfVVJMID0gJ2RpZmYtcmV2aWV3L2FwcGx5LWh1bmsnXG5jb25zdCBDT01NSVRfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdCdcbmNvbnN0IFBVU0hfVVJMID0gJ2RpZmYtcmV2aWV3L3B1c2gnXG5jb25zdCBISVNUT1JZX1VSTCA9ICdkaWZmLXJldmlldy9oaXN0b3J5J1xuY29uc3QgQ09NTUlUX0RJRkZfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdC1kaWZmJ1xuY29uc3QgQ09NTUVOVFNfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1lbnRzJ1xuY29uc3QgQlJBTkNIRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2JyYW5jaGVzJ1xuY29uc3QgUkVWSUVXX1VSTCA9ICdkaWZmLXJldmlldy9yZXZpZXcnXG5jb25zdCBQUl9VUkwgPSAnZGlmZi1yZXZpZXcvcHInXG5jb25zdCBSRVBPU19VUkwgPSAnZGlmZi1yZXZpZXcvcmVwb3MnXG5jb25zdCBPUEVOX0VESVRPUl9VUkwgPSAnb3Blbi1lZGl0b3Ivb3BlbidcbmNvbnN0IFNUWUxFX1RBRyA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3L3Jldmlldy5jc3MnXG5cbi8qKiBPcGVuIHN0YXRlIHNoYXJlZCBiZXR3ZWVuIHRoZSBoZWFkZXIgdHJpZ2dlciAoc2Vzc2lvbiBzY29wZSkgYW5kIHRoZSBvdmVybGF5IChyb290IHNjb3BlKS4gKi9cbmNvbnN0IG92ZXJsYXlTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8eyBvcGVuOiBib29sZWFuOyBjd2Q6IHN0cmluZyB8IG51bGw7IGtleTogbnVtYmVyOyBmb2N1cz86IHsgcGF0aDogc3RyaW5nOyBsaW5lPzogbnVtYmVyIH0gfCBudWxsIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxuICBmb2N1czogbnVsbCxcbn0pXG5cbi8qKlxuICogUGVuZGluZyBpbmxpbmUgY29tbWVudHMgc3VyZmFjZWQgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSkuIFRoZVxuICogcmV2aWV3IG92ZXJsYXkgc3luY3MgaXRzIHdvcmtzcGFjZSBjb21tZW50cyAocGx1cyB0aGUgZGlmZiBjb250ZXh0IGFuZCB0aGVcbiAqIGxhc3QgQUkgcmV2aWV3IHJlc3VsdCkgaGVyZTsgdGhlIGNvbXBvc2VyIGRvY2sgcmVhZHMgdGhlbSBhbmQgY2FycmllcyBhXG4gKiBmdWxsIHJldmlldyBwYWNrYWdlIHdpdGggdGhlIHVzZXIncyBuZXh0IG1lc3NhZ2UuXG4gKi9cbmludGVyZmFjZSBQZW5kaW5nQ29tbWVudHMge1xuICBjd2Q6IHN0cmluZyB8IG51bGxcbiAgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXVxuICAvKiogVW5pZmllZCBkaWZmIHRleHQgcGVyIGNvbW1lbnRlZCBwYXRoIChjb250ZXh0IGZvciB0aGUgY2FycmllZCBtZXNzYWdlKS4gKi9cbiAgZGlmZnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgLyoqIExhc3QgQUkgcmV2aWV3IHJlc3VsdCAodmVyZGljdCArIGZpbmRpbmdzKSwgYXBwZW5kZWQgdG8gdGhlIGNhcnJpZWQgbWVzc2FnZS4gKi9cbiAgcmV2aWV3OiBSZXZpZXdSZXNwb25zZSB8IG51bGxcbn1cbmNvbnN0IHBlbmRpbmdDb21tZW50c1N0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxQZW5kaW5nQ29tbWVudHM+KHtcbiAgY3dkOiBudWxsLFxuICBjb21tZW50czogW10sXG4gIGRpZmZzOiB7fSxcbiAgcmV2aWV3OiBudWxsLFxufSlcblxuLyoqXG4gKiBEdXJhYmxlLCBwZXItd29ya3NwYWNlIFwiYWxyZWFkeSBjYXJyaWVkXCIgc3RhdGUgKHN1cnZpdmVzIHJlbG9hZHM7IGlzb2xhdGVkXG4gKiBwZXIgY3dkIHNvIGNvbW1lbnRzIHNlbnQgaW4gb25lIHdvcmtzcGFjZSBuZXZlciBmaWx0ZXIgYW5vdGhlcidzKS5cbiAqL1xuY29uc3Qgc2VudFN0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxSZWNvcmQ8c3RyaW5nLCB7IHNlbnRDb21tZW50SWRzOiBzdHJpbmdbXTsgc2VudFJldmlld0tleTogc3RyaW5nIHwgbnVsbCB9Pj4oe30sIHsgcGVyc2lzdDogeyBuYW1lOiAnZHNkci1yZXZpZXctc2VudCcgfSB9KVxuXG4vKiogSW5qZWN0IHRleHQgaW50byBhIHNlc3Npb24gYXMgYSB1c2VyIG1lc3NhZ2U7IGZhbGxzIGJhY2sgdG8gdGhlIGNsaXBib2FyZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluamVjdFRvU2Vzc2lvbihzZXNzaW9uczogSVNlc3Npb25zIHwgdW5kZWZpbmVkLCBzZXNzaW9uSWQ6IFNlc3Npb25JZCB8IG51bGwsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8J3NlbnQnIHwgJ2NvcGllZCcgfCAnZmFpbGVkJz4ge1xuICBjb25zdCBiaW5kaW5nID0gc2Vzc2lvbklkID8gc2Vzc2lvbnM/LmJpbmRpbmcoc2Vzc2lvbklkKSA6IHVuZGVmaW5lZFxuICBjb25zdCBzZXNzaW9uID0gYmluZGluZz8uc2Vzc2lvblxuICBpZiAoc2Vzc2lvbikge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzZXNzaW9uLnByb21wdChbeyB0eXBlOiAndGV4dCcsIHRleHQgfV0sICdxdWV1ZScpXG4gICAgICBpZiAocmVzdWx0Lm9rKSByZXR1cm4gJ3NlbnQnXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBmYWxsIHRocm91Z2ggdG8gdGhlIGNvcHkgZmFsbGJhY2tcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICAgIHJldHVybiAnY29waWVkJ1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJ2ZhaWxlZCdcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJldmlldyBwcmVmZXJlbmNlcyAoZm9udCAvIHNpemUgLyBwYW5lbCBnZW9tZXRyeSksIHNoYXJlZCBieSB0aGUgb3ZlcmxheVxuLy8gYW5kIHRoZSBTZXR0aW5ncyBcdTIxOTIgR2VuZXJhbCByb3cuIFBlcnNpc3RlZCB0byBsb2NhbFN0b3JhZ2UgYnkgdGhlIHN0b3JlLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBQYW5lbCBnZW9tZXRyeSBib3VuZHMuICovXG5leHBvcnQgY29uc3QgTUlOX1BBTkVMX1cgPSA2NDBcbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfSCA9IDQwMFxuXG5pbnRlcmZhY2UgUHJlZnMge1xuICAvKiogRm9udCBvcHRpb24gaWQgKHNlZSBGT05UX09QVElPTlMpLiAqL1xuICBmb250OiBzdHJpbmdcbiAgLyoqIERpZmYgdGV4dCBzaXplIGluIHB4LiAqL1xuICBzaXplOiBudW1iZXJcbiAgLyoqIFBhbmVsIHdpZHRoIGluIHB4LiAqL1xuICB3aWR0aDogbnVtYmVyXG4gIC8qKiBQYW5lbCBoZWlnaHQgaW4gcHguICovXG4gIGhlaWdodDogbnVtYmVyXG59XG5cbmNvbnN0IEZPTlRfT1BUSU9OUzogeyBpZDogc3RyaW5nOyBsYWJlbDogc3RyaW5nOyBjc3M6IHN0cmluZyB9W10gPSBbXG4gIHsgaWQ6ICdtb25vJywgbGFiZWw6ICdmb250Lm1vbm8nLCBjc3M6ICd2YXIoLS1kc3ctZm9udC1tb25vKScgfSxcbiAgeyBpZDogJ3N5c3RlbScsIGxhYmVsOiAnZm9udC5zeXN0ZW0nLCBjc3M6ICdzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIHNhbnMtc2VyaWYnIH0sXG4gIHsgaWQ6ICdjb25zb2xhcycsIGxhYmVsOiAnQ29uc29sYXMnLCBjc3M6ICdDb25zb2xhcywgXCJDb3VyaWVyIE5ld1wiLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdqZXRicmFpbnMnLCBsYWJlbDogJ0pldEJyYWlucyBNb25vJywgY3NzOiAnXCJKZXRCcmFpbnMgTW9ub1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnZmlyYScsIGxhYmVsOiAnRmlyYSBDb2RlJywgY3NzOiAnXCJGaXJhIENvZGVcIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ3NvdXJjZScsIGxhYmVsOiAnU291cmNlIENvZGUgUHJvJywgY3NzOiAnXCJTb3VyY2UgQ29kZSBQcm9cIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbl1cblxuY29uc3QgU0laRV9PUFRJT05TID0gWzExLCAxMiwgMTMsIDE0LCAxNiwgMThdXG5cbi8qKiBSZXZpZXcgc2NvcGVzIG9mIHRoZSB3b3Jrc3BhY2UgdGFiIChhbGlnbmVkIHdpdGggdGhlIENvZGV4IHJldmlldyBwYW5lKS4gKi9cbnR5cGUgV29ya3NwYWNlU2NvcGUgPSAnYWxsJyB8ICd1bnN0YWdlZCcgfCAnc3RhZ2VkJyB8ICdjb21taXQnIHwgJ2JyYW5jaCcgfCAnbGFzdC10dXJuJ1xuXG5jb25zdCBTQ09QRV9PUFRJT05TOiB7IGlkOiBXb3Jrc3BhY2VTY29wZTsgbGFiZWw6IGtleW9mIHR5cGVvZiB6aCB9W10gPSBbXG4gIHsgaWQ6ICdhbGwnLCBsYWJlbDogJ3Njb3BlLmFsbCcgfSxcbiAgeyBpZDogJ3Vuc3RhZ2VkJywgbGFiZWw6ICdzY29wZS51bnN0YWdlZCcgfSxcbiAgeyBpZDogJ3N0YWdlZCcsIGxhYmVsOiAnc2NvcGUuc3RhZ2VkJyB9LFxuICB7IGlkOiAnY29tbWl0JywgbGFiZWw6ICdzY29wZS5jb21taXQnIH0sXG4gIHsgaWQ6ICdicmFuY2gnLCBsYWJlbDogJ3Njb3BlLmJyYW5jaCcgfSxcbiAgeyBpZDogJ2xhc3QtdHVybicsIGxhYmVsOiAnc2NvcGUubGFzdC10dXJuJyB9LFxuXVxuXG4vKiogQnJvd3Nlci1zaWRlIGFic29sdXRlIHBhdGggY2hlY2sgKG5vIG5vZGU6cGF0aCBpbiB0aGUgY2xpZW50IGJ1bmRsZSkuICovXG5mdW5jdGlvbiBpc0Fic1BhdGgocDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocClcbn1cblxuLyoqIExhcmdlc3Qgb2YgdGhyZWUgbnVtYmVycyAocHJlZmVycyBiIG9uIHRpZXMpLiAqL1xuZnVuY3Rpb24gbWF4T2YzKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoYiA+PSBhICYmIGIgPj0gYykgcmV0dXJuIGJcbiAgaWYgKGEgPj0gYykgcmV0dXJuIGFcbiAgcmV0dXJuIGNcbn1cblxuZnVuY3Rpb24gYmFzZU5hbWUocDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHAuc3BsaXQoL1tcXFxcL10vKS5wb3AoKSA/PyBwXG59XG5cbmNvbnN0IHByZWZzU3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPFByZWZzPihcbiAgeyBmb250OiAnbW9ubycsIHNpemU6IDEyLCB3aWR0aDogMTEyMCwgaGVpZ2h0OiA3MjAgfSxcbiAgeyBwZXJzaXN0OiB7IG5hbWU6ICdkc2RyLXByZWZzJyB9IH0sXG4pXG5cbi8qKiBDU1MgZm9udC1mYW1pbHkgZm9yIGEgc3RvcmVkIGZvbnQgb3B0aW9uIGlkLiAqL1xuZnVuY3Rpb24gZm9udENzcyhpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIEZPTlRfT1BUSU9OUy5maW5kKChmKSA9PiBmLmlkID09PSBpZCk/LmNzcyA/PyBGT05UX09QVElPTlNbMF0uY3NzXG59XG5cbi8qKiBQYW5lbCBDU1MgdmFyaWFibGVzIGNhcnJ5aW5nIHRoZSBmb250L3NpemUgcHJlZmVyZW5jZS4gKi9cbmZ1bmN0aW9uIGRpZmZTdHlsZVZhcnMocHJlZnM6IFByZWZzKTogQ1NTUHJvcGVydGllcyB7XG4gIHJldHVybiB7XG4gICAgJy0tZHNkci1kaWZmLWZvbnQnOiBmb250Q3NzKHByZWZzLmZvbnQpLFxuICAgICctLWRzZHItZGlmZi1zaXplJzogYCR7cHJlZnMuc2l6ZX1weGAsXG4gIH0gYXMgQ1NTUHJvcGVydGllc1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlc3Npb24tY2hhbmdlcyBleHRyYWN0aW9uIChjbGllbnQtc2lkZSwgd29ya3Mgd2l0aG91dCBnaXQpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYmVmb3JlL2FmdGVyIHNsaWNlIG9mIGEgY2hhbmdlIChhIGh1bmspLiAqL1xuaW50ZXJmYWNlIEh1bmsge1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogT25lIGZpbGUgY2hhbmdlZCBpbnNpZGUgb25lIHJvdW5kLiAqL1xuaW50ZXJmYWNlIFJvdW5kQ2hhbmdlIHtcbiAgcGF0aDogc3RyaW5nXG4gIHRvb2w6IHN0cmluZ1xuICBodW5rczogSHVua1tdXG4gIC8qKiBGYWxzZSB3aGVuIG9ubHkgdGhlIHBhdGggaXMga25vd24gKG5vIGRpZmYgZGF0YSBwZXJzaXN0ZWQpLiAqL1xuICBoYXNEaWZmOiBib29sZWFuXG59XG5cbi8qKiBPbmUgdXNlciByb3VuZCBhbmQgdGhlIGZpbGVzIGl0IGNoYW5nZWQuICovXG5pbnRlcmZhY2UgU2Vzc2lvblJvdW5kIHtcbiAgcm91bmQ6IG51bWJlclxuICBsYWJlbDogc3RyaW5nXG4gIGNoYW5nZXM6IFJvdW5kQ2hhbmdlW11cbn1cblxuaW50ZXJmYWNlIEZpbGVEaWZmTGlrZSB7XG4gIHBhdGg6IHN0cmluZ1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogVmFsaWRhdGUgYSByYXcgRmlsZURpZmYtc2hhcGVkIHZhbHVlICh0aGUgdG9vbHMnIGB7cGF0aCwgb2xkVGV4dCwgbmV3VGV4dH1gIGNvbnRyYWN0KS4gKi9cbmZ1bmN0aW9uIGFzRmlsZURpZmYocmF3OiB1bmtub3duKTogRmlsZURpZmZMaWtlIHwgbnVsbCB7XG4gIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBjb25zdCByZWMgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgaWYgKHR5cGVvZiByZWMucGF0aCAhPT0gJ3N0cmluZycgfHwgIXJlYy5wYXRoKSByZXR1cm4gbnVsbFxuICBpZiAodHlwZW9mIHJlYy5uZXdUZXh0ICE9PSAnc3RyaW5nJykgcmV0dXJuIG51bGxcbiAgY29uc3Qgb2xkVGV4dCA9IHJlYy5vbGRUZXh0XG4gIHJldHVybiB7IHBhdGg6IHJlYy5wYXRoLCBvbGRUZXh0OiB0eXBlb2Ygb2xkVGV4dCA9PT0gJ3N0cmluZycgPyBvbGRUZXh0IDogbnVsbCwgbmV3VGV4dDogcmVjLm5ld1RleHQgfVxufVxuXG4vKiogRGlmZiBodW5rcyBjYXJyaWVkIGJ5IGEgZGlmZiBjYXJkIChjYWxsIHZpZXcgb3IgcmVzdWx0IHZpZXcpLiAqL1xuZnVuY3Rpb24gZGlmZnNGcm9tRGlmZkNhcmQodmlldzogeyBjYXJkPzogdW5rbm93bjsgZGlmZnM/OiB1bmtub3duIH0gfCBudWxsIHwgdW5kZWZpbmVkKTogRmlsZURpZmZMaWtlW10ge1xuICBpZiAoIXZpZXcgfHwgdmlldy5jYXJkICE9PSAnZGlmZicgfHwgIUFycmF5LmlzQXJyYXkodmlldy5kaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gdmlldy5kaWZmcy5tYXAoYXNGaWxlRGlmZikuZmlsdGVyKChkKTogZCBpcyBGaWxlRGlmZkxpa2UgPT4gZCAhPT0gbnVsbClcbn1cblxuLyoqIEh1bWFuIGxhYmVsIGZvciBhIGNhbGwgd2hvc2UgYGNhbGxgIGhlYWQgd2FzIHRydW5jYXRlZCBvdXQgb2YgdGhlIHdpbmRvdy4gKi9cbmZ1bmN0aW9uIGRpZmZDYXJkVGl0bGUodmlldzogdW5rbm93bik6IHN0cmluZyB8IG51bGwge1xuICBpZiAoIXZpZXcgfHwgdHlwZW9mIHZpZXcgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBjb25zdCB0aXRsZSA9ICh2aWV3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS50aXRsZVxuICByZXR1cm4gdHlwZW9mIHRpdGxlID09PSAnc3RyaW5nJyAmJiB0aXRsZS50cmltKCkgPyB0aXRsZS50cmltKCkgOiBudWxsXG59XG5cbi8qKiBSYXcgYG1ldGEuZGlmZnNgIGZhbGxiYWNrICh0aGUgcGVyc2lzdGVkIHRvb2wvcmVzdWx0IG1ldGEpLiAqL1xuZnVuY3Rpb24gZGlmZnNGcm9tTWV0YShtZXRhOiB1bmtub3duKTogRmlsZURpZmZMaWtlW10ge1xuICBpZiAoIW1ldGEgfHwgdHlwZW9mIG1ldGEgIT09ICdvYmplY3QnKSByZXR1cm4gW11cbiAgY29uc3QgZGlmZnMgPSAobWV0YSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuZGlmZnNcbiAgaWYgKCFBcnJheS5pc0FycmF5KGRpZmZzKSkgcmV0dXJuIFtdXG4gIHJldHVybiBkaWZmcy5tYXAoYXNGaWxlRGlmZikuZmlsdGVyKChkKTogZCBpcyBGaWxlRGlmZkxpa2UgPT4gZCAhPT0gbnVsbClcbn1cblxuY29uc3QgTVVUQVRJT05fVE9PTFMgPSBuZXcgU2V0KFsnc3RyX3JlcGxhY2VfZWRpdG9yJywgJ25vdGVib29rX2VkaXQnXSlcbmNvbnN0IE1VVEFUSU9OX0NPTU1BTkRTID0gbmV3IFNldChbJ3dyaXRlJywgJ2VkaXQnLCAncmVwbGFjZScsICdkZWxldGUnLCAnbW92ZSddKVxuXG4vKiogUGF0aC1vbmx5IGZhbGxiYWNrIGZvciBrbm93biBmaWxlLW11dGF0aW5nIHRvb2xzIHdob3NlIHJlc3VsdCBjYXJyaWVkIG5vIGRpZmYuICovXG5mdW5jdGlvbiBtdXRhdGlvblBhdGgodG9vbDogc3RyaW5nLCBhcmdzUmF3OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgbGV0IGFyZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbCA9IG51bGxcbiAgdHJ5IHtcbiAgICBhcmdzID0gSlNPTi5wYXJzZShhcmdzUmF3KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGlmICghYXJncyB8fCB0eXBlb2YgYXJncyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGlmICh0b29sID09PSAnZnMnIHx8IHRvb2wgPT09ICdmaWxlc3lzdGVtJykge1xuICAgIGNvbnN0IGNtZCA9IHR5cGVvZiBhcmdzLmNvbW1hbmQgPT09ICdzdHJpbmcnID8gYXJncy5jb21tYW5kIDogJydcbiAgICBpZiAoIU1VVEFUSU9OX0NPTU1BTkRTLmhhcyhjbWQpKSByZXR1cm4gbnVsbFxuICAgIHJldHVybiB0eXBlb2YgYXJncy5maWxlX3BhdGggPT09ICdzdHJpbmcnICYmIGFyZ3MuZmlsZV9wYXRoID8gYXJncy5maWxlX3BhdGggOiBudWxsXG4gIH1cbiAgaWYgKE1VVEFUSU9OX1RPT0xTLmhhcyh0b29sKSB8fCB0b29sLnN0YXJ0c1dpdGgoJ2VkaXQnKSkge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFsnZmlsZV9wYXRoJywgJ3BhdGgnLCAnZmlsZW5hbWUnXSkge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzW2tleV0gPT09ICdzdHJpbmcnICYmIGFyZ3Nba2V5XSkgcmV0dXJuIGFyZ3Nba2V5XSBhcyBzdHJpbmdcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuLyoqIEV4dHJhY3QgdGhlIGNoYW5nZWQgZmlsZXMgZnJvbSBvbmUgc2V0dGxlZCB0b29sIHJlc3VsdCAoZGlmZiBodW5rcywgZWxzZSBwYXRoLW9ubHkpLiAqL1xuZnVuY3Rpb24gY2hhbmdlc0Zyb21Ub29sUmVzdWx0KGNhbGw6IHsgbmFtZTogc3RyaW5nOyBhcmdzUmF3OiBzdHJpbmcgfSB8IG51bGwsIG5vZGU6IFRvb2xSZXN1bHROb2RlKTogUm91bmRDaGFuZ2VbXSB7XG4gIC8vIExvbmcgc2Vzc2lvbnMgdHJ1bmNhdGUgdGhlIGNhbGwgaGVhZCBvdXQgb2YgdGhlIHdpbmRvdyAoY2FsbCA9PT0gbnVsbCksIGJ1dFxuICAvLyB0aGUgaG9zdC1jb21wdXRlZCBjYWxsL3Jlc3VsdCBkaWZmIGNhcmRzIHN0aWxsIGNhcnJ5IHRoZSBjaGFuZ2UgXHUyMDE0IHJlYWQgdGhvc2UuXG4gIGNvbnN0IHJlc3VsdERpZmZzID0gZGlmZnNGcm9tRGlmZkNhcmQobm9kZS5yZXN1bHRWaWV3KVxuICBjb25zdCBjYWxsRGlmZnMgPSByZXN1bHREaWZmcy5sZW5ndGggPT09IDAgPyBkaWZmc0Zyb21EaWZmQ2FyZChub2RlLmNhbGxWaWV3KSA6IFtdXG4gIGNvbnN0IG1ldGFEaWZmcyA9IHJlc3VsdERpZmZzLmxlbmd0aCA9PT0gMCAmJiBjYWxsRGlmZnMubGVuZ3RoID09PSAwID8gZGlmZnNGcm9tTWV0YShub2RlLm1ldGEpIDogW11cbiAgY29uc3QgYWxsRGlmZnMgPSByZXN1bHREaWZmcy5sZW5ndGggPiAwID8gcmVzdWx0RGlmZnMgOiBjYWxsRGlmZnMubGVuZ3RoID4gMCA/IGNhbGxEaWZmcyA6IG1ldGFEaWZmc1xuICBjb25zdCB0b29sID0gY2FsbD8ubmFtZSA/PyBkaWZmQ2FyZFRpdGxlKG5vZGUuY2FsbFZpZXcpID8/ICd0b29sJ1xuICBpZiAoYWxsRGlmZnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSb3VuZENoYW5nZT4oKVxuICAgIGZvciAoY29uc3QgZCBvZiBhbGxEaWZmcykge1xuICAgICAgbGV0IGVudHJ5ID0gYnlQYXRoLmdldChkLnBhdGgpXG4gICAgICBpZiAoIWVudHJ5KSB7XG4gICAgICAgIGVudHJ5ID0geyBwYXRoOiBkLnBhdGgsIHRvb2wsIGh1bmtzOiBbXSwgaGFzRGlmZjogdHJ1ZSB9XG4gICAgICAgIGJ5UGF0aC5zZXQoZC5wYXRoLCBlbnRyeSlcbiAgICAgIH1cbiAgICAgIGVudHJ5Lmh1bmtzLnB1c2goeyBvbGRUZXh0OiBkLm9sZFRleHQsIG5ld1RleHQ6IGQubmV3VGV4dCB9KVxuICAgIH1cbiAgICByZXR1cm4gWy4uLmJ5UGF0aC52YWx1ZXMoKV1cbiAgfVxuICBjb25zdCBwYXRoID0gY2FsbCA/IG11dGF0aW9uUGF0aCh0b29sLCBjYWxsLmFyZ3NSYXcpIDogbnVsbFxuICByZXR1cm4gcGF0aCA/IFt7IHBhdGgsIHRvb2wsIGh1bmtzOiBbXSwgaGFzRGlmZjogZmFsc2UgfV0gOiBbXVxufVxuXG4vKiogUGxhaW4gdGV4dCBvZiBhIHVzZXIgbWVzc2FnZSAoY29udGVudCBibG9ja3Mgb2YgdHlwZSAndGV4dCcpLiAqL1xuZnVuY3Rpb24gdXNlclRleHQobm9kZTogVXNlck1lc3NhZ2VOb2RlKTogc3RyaW5nIHtcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW11cbiAgZm9yIChjb25zdCBibG9jayBvZiBub2RlLmNvbnRlbnQpIHtcbiAgICBpZiAoYmxvY2sgJiYgdHlwZW9mIGJsb2NrID09PSAnb2JqZWN0JyAmJiAoYmxvY2sgYXMgeyB0eXBlPzogdW5rbm93biB9KS50eXBlID09PSAndGV4dCcgJiYgdHlwZW9mIChibG9jayBhcyB7IHRleHQ/OiB1bmtub3duIH0pLnRleHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXJ0cy5wdXNoKChibG9jayBhcyB7IHRleHQ6IHN0cmluZyB9KS50ZXh0KVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGFydHMuam9pbignICcpLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKClcbn1cblxuLyoqIFdhbGsgdGhlIGNvbnZlcnNhdGlvbiBub2RlcyBhbmQgZ3JvdXAgY2hhbmdlZCBmaWxlcyBieSB1c2VyIHJvdW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RTZXNzaW9uUm91bmRzKG5vZGVzOiByZWFkb25seSBDb252ZXJzYXRpb25Ob2RlW10pOiBTZXNzaW9uUm91bmRbXSB7XG4gIGNvbnN0IHJvdW5kczogU2Vzc2lvblJvdW5kW10gPSBbXVxuICBsZXQgY3VycmVudDogU2Vzc2lvblJvdW5kIHwgbnVsbCA9IG51bGxcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCA9PT0gJ3VzZXInKSB7XG4gICAgICBjdXJyZW50ID0geyByb3VuZDogcm91bmRzLmxlbmd0aCArIDEsIGxhYmVsOiB1c2VyVGV4dChub2RlKS5zbGljZSgwLCA2MCksIGNoYW5nZXM6IFtdIH1cbiAgICAgIHJvdW5kcy5wdXNoKGN1cnJlbnQpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAobm9kZS5raW5kICE9PSAndG9vbC1yZXN1bHQnKSBjb250aW51ZVxuICAgIC8vIFRoZSB3aW5kb3cgY2FuIHN0YXJ0IG1pZC10dXJuICh0aGUgbGVhZGluZyB1c2VyIG1lc3NhZ2UgdHJ1bmNhdGVkIG91dCk7XG4gICAgLy8gc3RpbGwgc3VyZmFjZSB0aGUgdG9vbCByZXN1bHRzIHVuZGVyIGFuIGltcGxpY2l0IHJvdW5kLlxuICAgIGlmICghY3VycmVudCkge1xuICAgICAgY3VycmVudCA9IHsgcm91bmQ6IHJvdW5kcy5sZW5ndGggKyAxLCBsYWJlbDogJycsIGNoYW5nZXM6IFtdIH1cbiAgICAgIHJvdW5kcy5wdXNoKGN1cnJlbnQpXG4gICAgfVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBleGlzdGluZyA9IGN1cnJlbnQuY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IGNoYW5nZS5wYXRoICYmIGMudG9vbCA9PT0gY2hhbmdlLnRvb2wpXG4gICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgaWYgKGNoYW5nZS5oYXNEaWZmKSB7XG4gICAgICAgICAgZXhpc3RpbmcuaHVua3MucHVzaCguLi5jaGFuZ2UuaHVua3MpXG4gICAgICAgICAgZXhpc3RpbmcuaGFzRGlmZiA9IHRydWVcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudC5jaGFuZ2VzLnB1c2goY2hhbmdlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm91bmRzLmZpbHRlcigocikgPT4gci5jaGFuZ2VzLmxlbmd0aCA+IDApXG59XG5cbi8qKiBDb3VudCBvZiBjaGFuZ2VkIGZpbGVzIGFjcm9zcyBhbGwgcm91bmRzIChmb3IgdGhlIGhlYWRlciBiYWRnZSkuICovXG5leHBvcnQgZnVuY3Rpb24gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogbnVtYmVyIHtcbiAgbGV0IGNvdW50ID0gMFxuICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JykgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3Qga2V5ID0gYCR7Y2hhbmdlLnRvb2x9OiR7Y2hhbmdlLnBhdGh9YFxuICAgICAgaWYgKCFzZWVuLmhhcyhrZXkpKSB7XG4gICAgICAgIHNlZW4uYWRkKGtleSlcbiAgICAgICAgY291bnQrK1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gY291bnRcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWZmIHJlbmRlcmluZy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogU3BsaXQgb25lIGBnaXQgc2hvdyAtLWZvcm1hdD1gIGRpZmYgaW50byBwZXItZmlsZSBzZWdtZW50cy4gKi9cbmZ1bmN0aW9uIHNwbGl0Q29tbWl0RGlmZihkaWZmOiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXSB7XG4gIGNvbnN0IHNlZ21lbnRzOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nW10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9IHwgbnVsbCA9IG51bGxcbiAgZm9yIChjb25zdCBsaW5lIG9mIGRpZmYuc3BsaXQoJ1xcbicpKSB7XG4gICAgY29uc3QgbWF0Y2ggPSAvXmRpZmYgLS1naXQgYVxcLyguKj8pIGJcXC8vLmV4ZWMobGluZSlcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gICAgICBjdXJyZW50ID0geyBwYXRoOiBtYXRjaFsxXSwgdGV4dDogW2xpbmVdIH1cbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQudGV4dC5wdXNoKGxpbmUpXG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gIHJldHVybiBzZWdtZW50cy5tYXAoKHMpID0+ICh7IHBhdGg6IHMucGF0aCwgdGV4dDogcy50ZXh0LmpvaW4oJ1xcbicpIH0pKVxufVxuXG4vKiogU3RhdHVzIGxldHRlciBmb3IgYSBjb21taXQncyBmaWxlLCBkZXJpdmVkIGZyb20gaXRzIGRpZmYgc2VnbWVudCB0ZXh0LiAqL1xuZnVuY3Rpb24gY29tbWl0RmlsZVN0YXR1cyhzZWdtZW50VGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9ebmV3IGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnQSdcbiAgaWYgKC9eZGVsZXRlZCBmaWxlIG1vZGUvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ0QnXG4gIGlmICgvXnJlbmFtZSBmcm9tIC8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnUidcbiAgcmV0dXJuICdNJ1xufVxuXG50eXBlIERpZmZSb3cgPSB7IGtpbmQ6ICdhZGQnIHwgJ2RlbCcgfCAnY3R4JyB8ICdodW5rJyB8ICdmaWxlJyB8ICdub3RlJzsgdGV4dDogc3RyaW5nIH1cblxuLyoqIENsYXNzaWZ5IHJhdyB1bmlmaWVkLWRpZmYgdGV4dCAoZ2l0IG91dHB1dCkgaW50byByb3dzLiAqL1xuZnVuY3Rpb24gZ2l0RGlmZlJvd3MoZGlmZjogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgcmV0dXJuIGRpZmYuc3BsaXQoJ1xcbicpLm1hcCgobGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykpIHJldHVybiB7IGtpbmQ6ICdmaWxlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkgcmV0dXJuIHsga2luZDogJ2h1bmsnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIHJldHVybiB7IGtpbmQ6ICdhZGQnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIHJldHVybiB7IGtpbmQ6ICdkZWwnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSByZXR1cm4geyBraW5kOiAnbm90ZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIHJldHVybiB7IGtpbmQ6ICdjdHgnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgfSlcbn1cblxuLyoqIENvbXB1dGUgYWRkL2RlbC9jdHggcm93cyBiZXR3ZWVuIHR3byB0ZXh0cyAodGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSkuICovXG5mdW5jdGlvbiB0ZXh0RGlmZlJvd3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvd3Ncbn1cblxuLyoqIFNlc3Npb24gY2hhbmdlIHJvd3Mgd2l0aCByZWxhdGl2ZSBvbGQvbmV3IGxpbmUgbnVtYmVycyAoaHVuayByb3dzIHJlc2V0KS4gKi9cbmZ1bmN0aW9uIHNlc3Npb25Sb3dzV2l0aExpbmVzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiB7IHJvdzogRGlmZlJvdzsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9W10ge1xuICBjb25zdCBvdXQ6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSA9IFtdXG4gIGxldCBvbGRMaW5lID0gMVxuICBsZXQgbmV3TGluZSA9IDFcbiAgZm9yIChjb25zdCByb3cgb2YgY2hhbmdlUm93cyhjaGFuZ2UpKSB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgb3V0LnB1c2goeyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbmV3TGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgIG91dC5wdXNoKHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBuZXdMaW5lKysgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgb3V0LnB1c2goeyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbnVsbCB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaCh7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbnVsbCB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBBbGwgcm93cyBmb3Igb25lIHJvdW5kIGNoYW5nZSAobXVsdGlwbGUgaHVua3MgZ2V0IGBAQGAgc2VwYXJhdG9ycykuICovXG5mdW5jdGlvbiBjaGFuZ2VSb3dzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBEaWZmUm93W10ge1xuICBpZiAoIWNoYW5nZS5oYXNEaWZmIHx8IGNoYW5nZS5odW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBjaGFuZ2UuaHVua3MuZm9yRWFjaCgoaHVuaywgaSkgPT4ge1xuICAgIGlmIChjaGFuZ2UuaHVua3MubGVuZ3RoID4gMSkgcm93cy5wdXNoKHsga2luZDogJ2h1bmsnLCB0ZXh0OiBgQEAgaHVuayAke2kgKyAxfS8ke2NoYW5nZS5odW5rcy5sZW5ndGh9IEBAYCB9KVxuICAgIHJvd3MucHVzaCguLi50ZXh0RGlmZlJvd3MoaHVuay5vbGRUZXh0LCBodW5rLm5ld1RleHQpKVxuICB9KVxuICByZXR1cm4gcm93c1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNwbGl0ICh0d28tY29sdW1uKSBkaWZmIHZpZXcuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBhbGlnbmVkIHJvdyBvZiB0aGUgc2lkZS1ieS1zaWRlIHZpZXcuICovXG5pbnRlcmZhY2UgU3BsaXRSb3cge1xuICBsZWZ0OiBzdHJpbmdcbiAgcmlnaHQ6IHN0cmluZ1xuICAvKiogMS1iYXNlZCBsaW5lIG51bWJlciBpbiB0aGUgb2xkIGZpbGUsIG9yIG51bGwgKHB1cmUgYWRkaXRpb24pLiAqL1xuICBsZWZ0TnVtOiBudW1iZXIgfCBudWxsXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBuZXcgZmlsZSwgb3IgbnVsbCAocHVyZSBkZWxldGlvbikuICovXG4gIHJpZ2h0TnVtOiBudW1iZXIgfCBudWxsXG4gIGtpbmQ6ICdjdHgnIHwgJ2NoYW5nZSdcbn1cblxuLyoqIE9uZSBzaWRlLWJ5LXNpZGUgYmxvY2sgKGEgaHVuayB3aXRoIGl0cyBgQEBgIGhlYWRlcikuICovXG5pbnRlcmZhY2UgU3BsaXRCbG9jayB7XG4gIGhlYWQ6IHN0cmluZyB8IG51bGxcbiAgcm93czogU3BsaXRSb3dbXVxufVxuXG4vKipcbiAqIFBhaXIgYWRkL2RlbCByb3dzIGludG8gYWxpZ25lZCBsZWZ0L3JpZ2h0IGNvbHVtbnMuIFJlbW92ZWQgbGluZXMgYnVmZmVyXG4gKiB1bnRpbCB0aGUgbWF0Y2hpbmcgYWRkaXRpb25zIGFycml2ZSAodW5pZmllZCBkaWZmIG9yZGVycyBkZWxldGlvbnMgYmVmb3JlXG4gKiBhZGRpdGlvbnMpLCBzbyBwdXJlIGRlbGV0aW9ucyBhbmQgcHVyZSBhZGRpdGlvbnMgc3RpbGwgZ2V0IHRoZWlyIG93biByb3dcbiAqIHdpdGggYW4gZW1wdHkgY2VsbCBvbiB0aGUgb3Bwb3NpdGUgc2lkZS4gTGluZSBudW1iZXJzIHRyYWNrIGZyb20gdGhlIGh1bmtcbiAqIGhlYWRlcidzIGAtYSxiICtjLGRgIHBvc2l0aW9ucy5cbiAqL1xuZnVuY3Rpb24gcGFpclJvd3Mocm93czogRGlmZlJvd1tdLCBvbGRTdGFydDogbnVtYmVyLCBuZXdTdGFydDogbnVtYmVyKTogU3BsaXRSb3dbXSB7XG4gIGNvbnN0IG91dDogU3BsaXRSb3dbXSA9IFtdXG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICBsZXQgcGVuZGluZzogeyB0ZXh0OiBzdHJpbmc7IG51bTogbnVtYmVyIH1bXSA9IFtdXG4gIGNvbnN0IGZsdXNoID0gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgcCBvZiBwZW5kaW5nKSBvdXQucHVzaCh7IGxlZnQ6IHAudGV4dCwgcmlnaHQ6ICcnLCBsZWZ0TnVtOiBwLm51bSwgcmlnaHROdW06IG51bGwsIGtpbmQ6ICdjaGFuZ2UnIH0pXG4gICAgcGVuZGluZyA9IFtdXG4gIH1cbiAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHtcbiAgICAgIHBlbmRpbmcucHVzaCh7IHRleHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBudW06IG9sZExpbmUrKyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdhZGQnKSB7XG4gICAgICBjb25zdCBwID0gcGVuZGluZy5zaGlmdCgpXG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHA/LnRleHQgPz8gJycsIHJpZ2h0OiByb3cudGV4dC5zbGljZSgxKSwgbGVmdE51bTogcD8ubnVtID8/IG51bGwsIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjaGFuZ2UnIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHtcbiAgICAgIGZsdXNoKClcbiAgICAgIC8vIFVuaWZpZWQtZGlmZiBjb250ZXh0IGxpbmVzIGNhcnJ5IGEgbGVhZGluZyBzcGFjZSBcdTIwMTQgc3RyaXAgaXQgZm9yIHRoZVxuICAgICAgLy8gc3BsaXQgY2VsbHMgc28gYm90aCBjb2x1bW5zIHJlbmRlciBiYXJlIHRleHQuXG4gICAgICBjb25zdCB0ZXh0ID0gcm93LnRleHQuc3RhcnRzV2l0aCgnICcpID8gcm93LnRleHQuc2xpY2UoMSkgOiByb3cudGV4dFxuICAgICAgb3V0LnB1c2goeyBsZWZ0OiB0ZXh0LCByaWdodDogdGV4dCwgbGVmdE51bTogb2xkTGluZSsrLCByaWdodE51bTogbmV3TGluZSsrLCBraW5kOiAnY3R4JyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBmbHVzaCgpIC8vIG5vdGVzIChcXCBObyBuZXdsaW5lXHUyMDI2KSBhbmQgc3RyYXkgcm93czoganVzdCBicmVhayB0aGUgcGFpcmluZ1xuICAgIH1cbiAgfVxuICBmbHVzaCgpXG4gIHJldHVybiBvdXRcbn1cblxuLyoqIFBhcnNlIGdpdCB1bmlmaWVkIGRpZmYgdGV4dCBpbnRvIGJsb2NrcyAoYC0tLS8rKytgIGZpbGUgcm93cyBhbmQgYEBAYCBodW5rcykuICovXG5jb25zdCBHSVRfTUVUQSA9IC9eKGRpZmYgLS1naXQgfGluZGV4IHxuZXcgZmlsZSB8ZGVsZXRlZCBmaWxlIHxvbGQgbW9kZSB8bmV3IG1vZGUgfHNpbWlsYXJpdHkgaW5kZXggfHJlbmFtZSAoZnJvbXx0bykgfEJpbmFyeSBmaWxlcyApL1xuXG5mdW5jdGlvbiBwYXJzZUdpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfVtdIHtcbiAgY29uc3QgYmxvY2tzOiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9IHwgbnVsbCA9IG51bGxcbiAgY29uc3QgbGluZXMgPSBkaWZmLnNwbGl0KCdcXG4nKVxuICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBraW5kOiBEaWZmUm93WydraW5kJ11cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrKysnKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy0tLScpIHx8IEdJVF9NRVRBLnRlc3QobGluZSkpIGtpbmQgPSAnZmlsZSdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ0BAJykpIGtpbmQgPSAnaHVuaydcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysnKSkga2luZCA9ICdhZGQnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIGtpbmQgPSAnZGVsJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnXFxcXCAnKSkga2luZCA9ICdub3RlJ1xuICAgIGVsc2Uga2luZCA9ICdjdHgnXG4gICAgaWYgKGtpbmQgPT09ICdmaWxlJyB8fCBraW5kID09PSAnaHVuaycpIHtcbiAgICAgIGN1cnJlbnQgPSB7IGhlYWQ6IHsga2luZCwgdGV4dDogbGluZSB9LCByb3dzOiBbXSB9XG4gICAgICBibG9ja3MucHVzaChjdXJyZW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudCA9IHsgaGVhZDogbnVsbCwgcm93czogW10gfVxuICAgICAgICBibG9ja3MucHVzaChjdXJyZW50KVxuICAgICAgfVxuICAgICAgY3VycmVudC5yb3dzLnB1c2goeyBraW5kLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBibG9ja3Ncbn1cblxuLyoqIEh1bmsgc3RhcnQgcG9zaXRpb25zIGZyb20gYSBgQEAgLWEsYiArYyxkIEBAYCBoZWFkZXIuICovXG5mdW5jdGlvbiBodW5rU3RhcnRzKGhlYWQ6IHN0cmluZyk6IHsgb2xkU3RhcnQ6IG51bWJlcjsgbmV3U3RhcnQ6IG51bWJlciB9IHtcbiAgY29uc3QgbSA9IC9eQEAgLShcXGQrKSg/OixcXGQrKT8gXFwrKFxcZCspLy5leGVjKGhlYWQpXG4gIHJldHVybiB7IG9sZFN0YXJ0OiBtID8gTnVtYmVyKG1bMV0pIDogMSwgbmV3U3RhcnQ6IG0gPyBOdW1iZXIobVsyXSkgOiAxIH1cbn1cblxuLyoqIFNpZGUtYnktc2lkZSBibG9ja3MgZm9yIGEgZ2l0IHVuaWZpZWQgZGlmZiAoc2tpcHMgcHVyZSBmaWxlLWhlYWRlciBibG9ja3MpLiAqL1xuZnVuY3Rpb24gZ2l0U3BsaXRCbG9ja3MoZGlmZjogc3RyaW5nKTogU3BsaXRCbG9ja1tdIHtcbiAgcmV0dXJuIHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gICAgLmZpbHRlcigoYikgPT4gYi5oZWFkPy5raW5kICE9PSAnZmlsZScgJiYgKGIucm93cy5sZW5ndGggPiAwIHx8IGIuaGVhZD8ua2luZCA9PT0gJ2h1bmsnKSlcbiAgICAubWFwKChiKSA9PiB7XG4gICAgICBjb25zdCBzdGFydHMgPSBiLmhlYWQgPyBodW5rU3RhcnRzKGIuaGVhZC50ZXh0KSA6IHsgb2xkU3RhcnQ6IDEsIG5ld1N0YXJ0OiAxIH1cbiAgICAgIHJldHVybiB7IGhlYWQ6IGIuaGVhZD8ua2luZCA9PT0gJ2h1bmsnID8gYi5oZWFkLnRleHQgOiBudWxsLCByb3dzOiBwYWlyUm93cyhiLnJvd3MsIHN0YXJ0cy5vbGRTdGFydCwgc3RhcnRzLm5ld1N0YXJ0KSB9XG4gICAgfSlcbn1cblxuLyoqIFNpZGUtYnktc2lkZSBibG9ja3MgZm9yIHRoZSB0b29scycgRmlsZURpZmYgc2hhcGUgKG9sZFRleHQvbmV3VGV4dCkuICovXG5mdW5jdGlvbiB0ZXh0U3BsaXRCbG9ja3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogU3BsaXRCbG9ja1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFt7IGhlYWQ6IG51bGwsIHJvd3M6IHBhaXJSb3dzKHJvd3MsIDEsIDEpIH1dXG59XG5cbi8qKiBBbGwgc2lkZS1ieS1zaWRlIGJsb2NrcyBmb3Igb25lIHJvdW5kIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVNwbGl0QmxvY2tzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBTcGxpdEJsb2NrW10ge1xuICBpZiAoIWNoYW5nZS5oYXNEaWZmIHx8IGNoYW5nZS5odW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICByZXR1cm4gY2hhbmdlLmh1bmtzLm1hcCgoaHVuaywgaSkgPT4gKHtcbiAgICBoZWFkOiBjaGFuZ2UuaHVua3MubGVuZ3RoID4gMSA/IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIDogbnVsbCxcbiAgICByb3dzOiB0ZXh0U3BsaXRCbG9ja3MoaHVuay5vbGRUZXh0LCBodW5rLm5ld1RleHQpWzBdLnJvd3MsXG4gIH0pKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFN0eWxlcyAoZHNkci0qOyB0aGUgaGVhZGVyIHRyaWdnZXIgbWlycm9ycyB0aGUgaW4tdHJlZSBhY3Rpb24gcm93cykuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgUkVWSUVXX0NTUyA9IGBcbi5kc2RyLXRyaWdnZXJ7bWluLWhlaWdodDoyOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo0cHg7cGFkZGluZzozcHggNnB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2Rpc3BsYXk6aW5saW5lLWZsZXh9XG4uZHNkci10cmlnZ2VyOmhvdmVyLC5kc2RyLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWxhYmVse21hcmdpbi1sZWZ0OjJweH1cbi5kc2RyLWNvdW50e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2JvcmRlci1yYWRpdXM6OTk5cHg7bWluLXdpZHRoOjE2cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtwYWRkaW5nOjAgNXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLW92ZXJsYXl7cG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDt6LWluZGV4OjIwMDtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjQ1KTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7cGFkZGluZzozMnB4fVxuLmRzZHItcGFuZWx7Ym94LXNpemluZzpib3JkZXItYm94O3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOm1pbigxMTIwcHgsMTAwJSk7aGVpZ2h0Om1pbig3MjBweCxjYWxjKDEwMHZoIC0gNjRweCkpO21heC13aWR0aDpjYWxjKDEwMHZ3IC0gNjRweCk7bWF4LWhlaWdodDpjYWxjKDEwMHZoIC0gNjRweCk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6MTRweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXJlc2l6ZXtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjV9XG4uZHNkci1yZXNpemUtZXt0b3A6MDtyaWdodDotM3B4O3dpZHRoOjdweDtoZWlnaHQ6MTAwJTtjdXJzb3I6ZXctcmVzaXplfVxuLmRzZHItcmVzaXplLXN7Ym90dG9tOi0zcHg7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjdweDtjdXJzb3I6bnMtcmVzaXplfVxuLmRzZHItcmVzaXplLXNle3JpZ2h0Oi00cHg7Ym90dG9tOi00cHg7d2lkdGg6MTVweDtoZWlnaHQ6MTVweDtjdXJzb3I6bndzZS1yZXNpemV9XG4uZHNkci1oZWFkZXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjEycHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci10aXRsZXtmb250LXNpemU6MTRweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3VidGl0bGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXRhYnN7ZGlzcGxheTpmbGV4O2dhcDo0cHg7bWFyZ2luLWxlZnQ6MTRweH1cbi5kc2RyLXRhYntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyNnB4O2JvcmRlcjoxcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MnB4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci10YWI6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci10YWItYWN0aXZle2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2NvcGV7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttYXJnaW4tbGVmdDo4cHh9XG4uZHNkci1zY29wZSAuZHNkci1zZWwtdHJpZ2dlcnttaW4td2lkdGg6MTEwcHg7aGVpZ2h0OjI2cHg7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjAgOHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpfVxuLmRzZHItc3BhY2Vye2ZsZXg6MX1cbi5kc2RyLWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyOHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjNweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHh9XG4uZHNkci1idG46aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bjpkaXNhYmxlZHtvcGFjaXR5Oi41O2N1cnNvcjpkZWZhdWx0fVxuLmRzZHItYnRuLXByaW1hcnl7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNDAwKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1idG4tZGFuZ2Vye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXI6aG92ZXI6bm90KDpkaXNhYmxlZCl7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWNvbmZpcm17Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTUwKX1cbi5kc2RyLWJ0bi1jb25maXJtOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItY29tbWl0LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoyMDBweDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzozcHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLWNvbW1pdC1pbnB1dDo6cGxhY2Vob2xkZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWNhcHRpb24pfVxuLmRzZHItY29tbWl0LWlucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpfVxuLmRzZHItc2VjdGlvbntmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzoxMHB4IDhweCAzcHg7Zm9udC13ZWlnaHQ6NjAwO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweH1cbi5kc2RyLXNlY3Rpb246Zmlyc3QtY2hpbGR7cGFkZGluZy10b3A6NHB4fVxuLmRzZHItYnJhbmNoe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjRweCA4cHggOHB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItYnJhbmNoLXJlZntmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7bWluLXdpZHRoOjA7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweH1cbi5kc2RyLWJyYW5jaC1hcnJvd3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItYnJhbmNoLXN0YXR7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtmb250LXNpemU6MTFweDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1icmFuY2gtYWhlYWR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtYmVoaW5ke2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS13YXJuLXByaW1hcnkpfVxuLmRzZHItYnJhbmNoLXN5bmN7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1jb21taXR7ZmxleDoxO21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjJweDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdDpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10bC1zZWxlY3RlZCAuZHNkci1jb21taXR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItdGltZWxpbmV7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLXRsLWl0ZW17ZGlzcGxheTpmbGV4O2dhcDo2cHg7YWxpZ24taXRlbXM6c3RyZXRjaDtib3JkZXItcmFkaXVzOjhweH1cbi5kc2RyLXRsLXJhaWx7cG9zaXRpb246cmVsYXRpdmU7ZmxleDpub25lO3dpZHRoOjE0cHg7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpjZW50ZXJ9XG4uZHNkci10bC1yYWlsOjpiZWZvcmV7Y29udGVudDpcIlwiO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2JvdHRvbTowO2xlZnQ6NTAlO3dpZHRoOjFweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItdGwtaXRlbTpmaXJzdC1jaGlsZCAuZHNkci10bC1yYWlsOjpiZWZvcmV7dG9wOjlweH1cbi5kc2RyLXRsLWl0ZW06bGFzdC1jaGlsZCAuZHNkci10bC1yYWlsOjpiZWZvcmV7Ym90dG9tOmF1dG87aGVpZ2h0OjlweH1cbi5kc2RyLXRsLWRvdHtwb3NpdGlvbjpyZWxhdGl2ZTt6LWluZGV4OjE7dG9wOjlweDtmbGV4Om5vbmU7d2lkdGg6N3B4O2hlaWdodDo3cHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKX1cbi5kc2RyLXRsLWRvdC1sb2NhbHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdGwtZG90LXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1jb21taXQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWluLXdpZHRoOjB9XG4uZHNkci1jb21taXQtc2hvcnR7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jb21taXQtc3ViamVjdHtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItY29tbWl0LW1ldGF7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nLWxlZnQ6MH1cbi5kc2RyLXRsLWJhZGdle2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA1cHh9XG4uZHNkci10bC1iYWRnZS1sb2NhbHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1iYWRnZS1yZW1vdGV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpZmYtaGFzaHttYXJnaW4tbGVmdDo4cHg7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1maWxlLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLWNvbW1pdC1maWxlLXBhdGh7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO21hcmdpbi1sZWZ0OjRweH1cbi5kc2RyLWNmZy1jYXJke2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMyk7Ym9yZGVyLXJhZGl1czoxMnB4O2xpc3Qtc3R5bGU6bm9uZTt0cmFuc2l0aW9uOmJvcmRlci1jb2xvciAuMTZzLGJhY2tncm91bmQgLjE2c31cbi5kc2RyLWNmZy1jYXJkOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLWNmZy1jYXJkLW9wZW57YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWhlYWR7YXBwZWFyYW5jZTpub25lO3dpZHRoOjEwMCU7Zm9udDppbmhlcml0O2NvbG9yOmluaGVyaXQ7dGV4dC1hbGlnbjpsZWZ0O2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6MTJweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEycHg7cGFkZGluZzoxNHB4IDE2cHg7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLWhlYWQ6Zm9jdXMtdmlzaWJsZXtvdXRsaW5lOjJweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSk7b3V0bGluZS1vZmZzZXQ6LTJweH1cbi5kc2RyLWNmZy1oZWFkLXRleHR7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2ZsZXg6MTtnYXA6NHB4O21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWNmZy1uYW1le2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo2MDA7bGluZS1oZWlnaHQ6MS40fVxuLmRzZHItY2ZnLWRlc2N7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctY2FyZXR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmbGV4Om5vbmU7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjE2c31cbi5kc2RyLWNmZy1jYXJldC1vcGVue3RyYW5zZm9ybTpyb3RhdGUoMTgwZGVnKX1cbi5kc2RyLWNmZy1ib2R5e2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO21hcmdpbjowIDE2cHg7cGFkZGluZy1ib3R0b206OHB4O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci1jZmctZmllbGR7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHg7cGFkZGluZzoxMnB4IDA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLWZpZWxkKy5kc2RyLWNmZy1maWVsZHtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKX1cbi5kc2RyLWNmZy1sYWJlbHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7ZmxleDoxO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctaGludHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO21hcmdpbjowO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1wZW5kaW5ne3doaXRlLXNwYWNlOm5vd3JhcDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2JvcmRlci1yYWRpdXM6OTk5cHg7ZmxleDpub25lO3BhZGRpbmc6MXB4IDhweDtmb250LXNpemU6MTFweDtmb250LXdlaWdodDo1MDA7bGluZS1oZWlnaHQ6MTdweH1cbi5kc2RyLWNmZy1mYWlsZWR7bWluLXdpZHRoOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWVycm9yKTtmbGV4OjE7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLWFjdGlvbnN7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6MTJweCAwIDRweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1ib2R5e2Rpc3BsYXk6ZmxleDtmbGV4OjE7bWluLWhlaWdodDowfVxuLmRzZHItZmlsZXN7d2lkdGg6MzAwcHg7ZmxleDpub25lO2JvcmRlci1yaWdodDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7b3ZlcmZsb3cteTphdXRvO3BhZGRpbmc6OHB4fVxuLmRzZHItcm91bmR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6OHB4IDhweCAzcHg7Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItcm91bmQtbGFiZWx7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjQwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWZpbGV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmlsZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1maWxlLXNlbGVjdGVke2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWRpcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzo1cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLWRpcjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZGlyLWNhcmV0e2ZsZXg6bm9uZTt3aWR0aDoxMnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1kaXItbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjYwMH1cbi5kc2RyLWRpci1jb3VudHtmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1maWxlLW5hbWV7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbjtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbGUtc3RhdHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1jaGlwe2ZsZXg6bm9uZTttaW4td2lkdGg6MjJweDt0ZXh0LWFsaWduOmNlbnRlcjtib3JkZXItcmFkaXVzOjVweDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jaGlwLW17YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOiMyZWEwNDN9XG4uZHNkci1jaGlwLWF7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOiMyZWEwNDN9XG4uZHNkci1jaGlwLWR7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTYpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1jaGlwLXJ7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KTtjb2xvcjojNThhNmZmfVxuLmRzZHItY2hpcC11e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci10b29se2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZGlmZntmbGV4OjE7bWluLXdpZHRoOjA7b3ZlcmZsb3c6YXV0bztwYWRkaW5nOjEwcHggMH1cbi5kc2RyLWRpZmYtZW1wdHl7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2hlaWdodDoxMDAlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1kaWZmLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjZweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLWRpZmYtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTNweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWRpZmYtc3RhdHN7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7ZmxleDpub25lfVxuLmRzZHItZGlmZi1zY3JvbGx7ZmxleDoxO21pbi1oZWlnaHQ6MDtvdmVyZmxvdzphdXRvO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLXByZXttYXJnaW46MDtwYWRkaW5nOjhweCAwO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCk7d2hpdGUtc3BhY2U6cHJlO21pbi13aWR0aDoxMDAlO2ZsZXg6MX1cbi5kc2RyLWxpbmV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjEwcHg7cGFkZGluZzowIDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3Bvc2l0aW9uOnJlbGF0aXZlfVxuLmRzZHItbGluZS1udW17ZmxleDpub25lO3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjQwcHg7dGV4dC1hbGlnbjpyaWdodDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3VzZXItc2VsZWN0Om5vbmU7Zm9udC1zaXplOmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpIC0gMXB4KTtvcGFjaXR5Oi43NX1cbi5kc2RyLWxpbmUtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6cHJlfVxuLmRzZHItY29tbWVudC1hZGR7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTUwJSk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo0cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1jb21tZW50LWFkZCwuZHNkci1jb21tZW50LWFkZDpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWNvbW1lbnQtYWRkOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jb21tZW50LWhhc3t2aXNpYmlsaXR5OnZpc2libGU7YmFja2dyb3VuZDpjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDE2JSwgdHJhbnNwYXJlbnQpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7Zm9udC1zaXplOjEwcHh9XG4uZHNkci1saW5lLWNvbW1lbnRlZHtib3gtc2hhZG93Omluc2V0IDNweCAwIDAgY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKSA3MCUsIHRyYW5zcGFyZW50KX1cbi5kc2RyLWNvbW1lbnQtZWRpdG9ye2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpfVxuLmRzZHItY29tbWVudC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjUycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjZweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cmVzaXplOnZlcnRpY2FsfVxuLmRzZHItY29tbWVudC1pbnB1dDpmb2N1c3tvdXRsaW5lOm5vbmU7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1lbnQtYWN0aW9uc3tkaXNwbGF5OmZsZXg7Z2FwOjZweDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmR9XG4uZHNkci1vcGVubGluZXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE4cHg7aGVpZ2h0OjE4cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1vcGVubGluZSwuZHNkci1vcGVubGluZTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLW9wZW5saW5lOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWxpbmUtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDNweCAwIDAgdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKX1cbi5kc2RyLWZpbmRpbmctUDB7LS1kc2RyLWZpbmRpbmctY29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctUDF7LS1kc2RyLWZpbmRpbmctY29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctUDJ7LS1kc2RyLWZpbmRpbmctY29sb3I6I2QyOTkyMn1cbi5kc2RyLWZpbmRpbmctUDN7LS1kc2RyLWZpbmRpbmctY29sb3I6IzhiOTQ5ZX1cbi5kc2RyLWZpbmRpbmctdGFne2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydDttYXJnaW4tdG9wOjJweH1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXZlcmRpY3R7cG9zaXRpb246c3RpY2t5O3RvcDowO3otaW5kZXg6NjtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7bWFyZ2luOjAgMCA2cHg7cGFkZGluZzo4cHggMTJweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czoxMHB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjIpO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci12ZXJkaWN0LW1hcmt7ZmxleDpub25lO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MjBweDtoZWlnaHQ6MjBweDtib3JkZXItcmFkaXVzOjUwJTtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo3MDB9XG4uZHNkci12ZXJkaWN0LW9rIC5kc2RyLXZlcmRpY3QtbWFya3tiYWNrZ3JvdW5kOmNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KSAxOCUsIHRyYW5zcGFyZW50KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3QtYmFkIC5kc2RyLXZlcmRpY3QtbWFya3tiYWNrZ3JvdW5kOmNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSkgMTglLCB0cmFuc3BhcmVudCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItdmVyZGljdC10ZXh0e2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci12ZXJkaWN0LW9rIC5kc2RyLXZlcmRpY3QtdGV4dHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3QtYmFkIC5kc2RyLXZlcmRpY3QtdGV4dHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci12ZXJkaWN0LW1ldGF7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdmVyZGljdC1tb2RlbHtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmluZGluZy1jYXJke2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDttYXJnaW46NHB4IDAgNnB4O3BhZGRpbmc6OHB4IDE2cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKX1cbi5kc2RyLXNhdmVkLWNvbW1lbnQtbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1zYXZlZC1jb21tZW50LXZpZXd7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtyZXNpemU6bm9uZX1cbi5kc2RyLWZpbmRpbmctY2FyZC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLWZpbmRpbmctY2FyZC10aXRsZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWZpbmRpbmctY2FyZC1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXN9XG4uZHNkci1maW5kaW5nLWNhcmQtZGV0YWlse2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLWZpbmRpbmctY2FyZC1tZXRhe2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1maW5kaW5nLWNhcmQtc3VnZ2VzdGlvbnttYXJnaW46MDt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItcHJ7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O3BhZGRpbmc6NHB4IDhweCA4cHh9XG4uZHNkci1wci1pdGVte2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjNweDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0fVxuLmRzZHItcHItaXRlbTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1wci1tZXRhe2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1wci10ZXh0e2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1kb2Nre2JveC1zaXppbmc6Ym9yZGVyLWJveDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHg7d2lkdGg6MTAwJTttYXgtd2lkdGg6dmFyKC0tZHNoLWNvbXBvc2VyLWNhcmQtbWF4LXdpZHRoLCA3ODBweCk7bWFyZ2luOjAgYXV0byBjYWxjKC0xICogdmFyKC0tZHNoLWNvbXBvc2VyLXN0YWNrLWdhcCwgNnB4KSAtIDhweCk7cGFkZGluZzo4cHggMTZweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1pbnB1dC1tYWpvcik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyLWRhcmttb2RlLXRoaW4pO2JvcmRlci1ib3R0b206bm9uZTtib3JkZXItcmFkaXVzOjIycHggMjJweCAwIDA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kb2NrLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21pbi1oZWlnaHQ6MjJweDttYXJnaW46LThweCAtMTZweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci1yYWRpdXM6MjJweCAyMnB4IDAgMDtjdXJzb3I6cG9pbnRlcn1cbi5kc2RyLWRvY2staGVhZDpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1kb2NrLWljb257ZGlzcGxheTppbmxpbmUtZmxleDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCl9XG4uZHNkci1kb2NrLWNvdW50e2ZvbnQtd2VpZ2h0OjYwMDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2stZmxhc2h7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSk7Zm9udC1zaXplOjExcHg7d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItZG9jay1zZW5kLWhpbnR7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKTt2aXNpYmlsaXR5OmhpZGRlbjt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci1kb2NrLWhlYWQ6aG92ZXIgLmRzZHItZG9jay1zZW5kLWhpbnR7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItZG9jay1jbG9zZXtmbGV4Om5vbmU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoyMHB4O2hlaWdodDoyMHB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NnB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjB9XG4uZHNkci1kb2NrLWNsb3NlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kb2NrLWNoaXBze2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4taGVpZ2h0OjI2cHg7bWFyZ2luOjAgLTE2cHg7cGFkZGluZzowIDE2cHg7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZG9jay1jaGlwe2ZsZXg6MCAxIGF1dG87bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O2JvcmRlcjowO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2JvcmRlci1yYWRpdXM6N3B4O3BhZGRpbmc6M3B4IDhweDtjdXJzb3I6cG9pbnRlcjtmb250OmluaGVyaXQ7dGV4dC1hbGlnbjpsZWZ0fVxuLmRzZHItZG9jay1jaGlwOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWRvY2stY2hpcC1sb2N7ZmxleDpub25lO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKTt3aGl0ZS1zcGFjZTpub3dyYXA7bWF4LXdpZHRoOjQyJTtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc31cbi5kc2RyLWRvY2stY2hpcC10ZXh0e21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfVxuLmRzZHItZG9jay1jaGlwLW1vcmV7ZmxleDpub25lO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250OmluaGVyaXQ7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtwYWRkaW5nOjJweCA2cHg7Ym9yZGVyLXJhZGl1czo2cHg7d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItZG9jay1jaGlwLW1vcmU6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbmR7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDo0MDt0b3A6NTJweDtyaWdodDoxNnB4O3dpZHRoOm1pbig0ODBweCxjYWxjKDEwMCUgLSAzMnB4KSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3JkZXItcmFkaXVzOjEycHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7cGFkZGluZzoxMnB4O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjhweH1cbi5kc2RyLXNlbmQtdGl0bGV7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbmQtaGludHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1zZW5kLWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MTQwcHg7bWF4LWhlaWdodDozMjBweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtyZXNpemU6dmVydGljYWw7d2hpdGUtc3BhY2U6cHJlLXdyYXB9XG4uZHNkci1saW5lLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1saW5lLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1saW5lLWh1bmt7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtZmlsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1ub3Rle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zdHlsZTppdGFsaWN9XG4uZHNkci1odW5rLWJhcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7cGFkZGluZzoycHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKX1cbi5kc2RyLWh1bmstYmFyIC5kc2RyLWJ0bnttaW4taGVpZ2h0OjIycHg7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci1odW5rLWxheWVye2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTttYXJnaW4tcmlnaHQ6YXV0b31cbi5kc2RyLWZvb3R7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZTttaW4taGVpZ2h0OjM2cHh9XG4uZHNkci1ub3RpY2V7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1ub3RpY2Utb2t7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1ub3RpY2UtZXJyb3J7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItc3Bpbm5lcntmbGV4Om5vbmU7d2lkdGg6MTJweDtoZWlnaHQ6MTJweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci10b3AtY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7YW5pbWF0aW9uOmRzZHItc3BpbiAuOHMgbGluZWFyIGluZmluaXRlfVxuQGtleWZyYW1lcyBkc2RyLXNwaW57dG97dHJhbnNmb3JtOnJvdGF0ZSgzNjBkZWcpfX1cbi5kc2RyLWVtcHR5e3BhZGRpbmc6NDBweDt0ZXh0LWFsaWduOmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4fVxuLmRzZHItZW1wdHktYWN0aW9uc3tkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcjttYXJnaW4tdG9wOjEycHh9XG4uZHNkci1ub2RpZmZ7cGFkZGluZzo4cHggMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItc2Vse3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6aW5saW5lLWZsZXh9XG4uZHNkci1zZWwtdHJpZ2dlcntib3gtc2l6aW5nOmNvbnRlbnQtYm94O21pbi13aWR0aDoxODBweDtoZWlnaHQ6MzRweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjAgMTJweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEzcHg7bGluZS1oZWlnaHQ6MS41O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHh9XG4uZHNkci1zZWwtdHJpZ2dlcjpob3Zlcntib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1zZWwtdHJpZ2dlcjpmb2N1cy12aXNpYmxle2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSk7b3V0bGluZTpub25lfVxuLmRzZHItc2VsLXRyaWdnZXIgc3Zne2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTJzfVxuLmRzZHItc2VsLXRyaWdnZXJbYXJpYS1leHBhbmRlZD1cInRydWVcIl0gc3Zne3RyYW5zZm9ybTpyb3RhdGUoMTgwZGVnKX1cbi5kc2RyLXNlbC12YWx1ZXtmbGV4OjE7bWluLXdpZHRoOjA7dGV4dC1hbGlnbjpsZWZ0O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXNlbC1tZW51e3otaW5kZXg6MjAwO2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4td2lkdGg6MTAwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLW1lbnUpO2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO2JvcmRlci1yYWRpdXM6MTBweDttYXJnaW46MDtwYWRkaW5nOjRweDtsaXN0LXN0eWxlOm5vbmU7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MXB4O3Bvc2l0aW9uOmFic29sdXRlO3RvcDpjYWxjKDEwMCUgKyA1cHgpO2xlZnQ6MH1cbi5kc2RyLXNlbC1vcHRpb257Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDozMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItcmFkaXVzOjdweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjVweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7dGV4dC1hbGlnbjpsZWZ0O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLXNlbC1vcHRpb246aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItc2VsLW9wdGlvbi1hY3RpdmV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2VsLW9wdGlvbi1tYXJre2ZsZXg6bm9uZTt3aWR0aDoxNHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1zZWwtb3B0aW9uLWxhYmVse2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci12aWV3LXRvZ2dsZXtkaXNwbGF5OmZsZXg7Z2FwOjJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O3BhZGRpbmc6MnB4O2ZsZXg6bm9uZX1cbi5kc2RyLXZpZXctYnRue2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjIycHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo1cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MXB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweH1cbi5kc2RyLXZpZXctYnRuOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdmlldy1idG4tYWN0aXZle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGxpdHttaW4td2lkdGg6MTAwJX1cbi5kc2RyLXNwbGl0LWhlYWR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjRweCA4cHg7cG9zaXRpb246c3RpY2t5O3RvcDowO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSl9XG4uZHNkci1zcGxpdC1oZWFkIGRpdntkaXNwbGF5OmZsZXg7Z2FwOjhweH1cbi5kc2RyLXNwbGl0LWh1bmt7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE4cHg7cGFkZGluZzoycHggMTZweH1cbi5kc2RyLXNwbGl0LXJvd3twb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KX1cbi5kc2RyLXNwbGl0LWNlbGw6aG92ZXIgLmRzZHItY29tbWVudC1hZGQsLmRzZHItc3BsaXQtcm93OmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRke3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLXNwbGl0LWNlbGx7ZGlzcGxheTpmbGV4O2ZsZXgtd3JhcDp3cmFwO2dhcDo4cHg7cGFkZGluZzowIDhweDt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNwbGl0LWNlbGw+LmRzZHItY29tbWVudC1lZGl0b3J7ZmxleDowIDAgMTAwJTtwYWRkaW5nOjZweCA4cHh9XG4uZHNkci1zcGxpdC1udW17ZmxleDpub25lO3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjQycHg7dGV4dC1hbGlnbjpyaWdodDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3VzZXItc2VsZWN0Om5vbmU7Zm9udC1zaXplOmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpIC0gMXB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCl9XG4uZHNkci1zcGxpdC10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MH1cbi5kc2RyLWNlbGwtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDAgMCAwIDFweCB2YXIoLS1kc2RyLWZpbmRpbmctY29sb3IsIHJnYmEoMjU1LDE2Niw4NywuNykpO2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4wOCl9XG4uZHNkci1jZWxsLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXNwbGl0LWZpbmRpbmd7ZmxleDpub25lO2ZvbnQtc2l6ZTo5cHg7bGluZS1oZWlnaHQ6MTJweDtib3JkZXItcmFkaXVzOjNweDtwYWRkaW5nOjAgM3B4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtd2VpZ2h0OjYwMDthbGlnbi1zZWxmOmZsZXgtc3RhcnR9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAxe2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4xNik7Y29sb3I6I2ZmYTY1N31cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAye2JhY2tncm91bmQ6cmdiYSgyMTAsMTUzLDM0LC4xNik7Y29sb3I6I2QyOTkyMn1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1zcGxpdC1vcGVubGluZXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItc3BsaXQtY2VsbDpob3ZlciAuZHNkci1zcGxpdC1vcGVubGluZSwuZHNkci1zcGxpdC1vcGVubGluZTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLXNwbGl0LW9wZW5saW5lOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWNlbGwtYWRke2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjEzKX1cbi5kc2RyLWNlbGwtZGVse2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjEyKX1cbi5kc2RyLWNlbGwtZGlte2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDEsIHJnYmEoMTI4LDEyOCwxMjgsLjA1KSl9XG4vKiAtLS0gY29udmVyc2F0aW9uIHJldmlldyBjYXJkIChDb2RleC1zdHlsZSkgLS0tICovXG4uZHNkci1yZXZpZXctY2FyZHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7bWF4LXdpZHRoOm1pbig3MjBweCwxMDAlKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLXJhZGl1czoxNnB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjIpO292ZXJmbG93OmhpZGRlbjttYXJnaW46MnB4IDB9XG4uZHNkci1yZXZpZXctY2FyZC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjhweCAxMnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItcmV2aWV3LWNhcmQtYmFkZ2V7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtYmFkZ2Ugc3Zne2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKX1cbi5kc2RyLXJldmlldy1jYXJkLXdvcmtzcGFjZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXN9XG4uZHNkci1yZXZpZXctY2FyZC1tZXRhe2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtZ3JvdXB7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLXJldmlldy1jYXJkLXBhdGh7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O3dpZHRoOjEwMCU7bWluLXdpZHRoOjA7cGFkZGluZzo2cHggMTJweDtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcjtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXJldmlldy1jYXJkLXBhdGg6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLXBhdGggc3BhbnttaW4td2lkdGg6MDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci1yZXZpZXctY2FyZC1pdGVte2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDo4cHg7d2lkdGg6MTAwJTttaW4td2lkdGg6MDtwYWRkaW5nOjVweCAxMnB4IDVweCAyNnB4O2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcn1cbi5kc2RyLXJldmlldy1jYXJkLWl0ZW06aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItcmV2aWV3LWNhcmQtbG9je2ZsZXg6bm9uZTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCk7d2hpdGUtc3BhY2U6bm93cmFwO3BhZGRpbmctdG9wOjFweH1cbi5kc2RyLXJldmlldy1jYXJkLXRleHR7bWluLXdpZHRoOjA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTt3aGl0ZS1zcGFjZTpwcmUtd3JhcH1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3Qtc2Vje2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDtwYWRkaW5nOjhweCAxMnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpfVxuLmRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtdmVyZGljdHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Zm9udC13ZWlnaHQ6NjAwO2JvcmRlci1yYWRpdXM6NnB4O3BhZGRpbmc6MXB4IDZweH1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtY29ycmVjdHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LWluY29ycmVjdHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xNik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtZmluZGluZ3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6NnB4O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC1maW5kaW5nLXRleHR7bWluLXdpZHRoOjA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLXJldmlldy1jYXJkLWZpbmRpbmctbG9je2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC1mb290e3BhZGRpbmc6NnB4IDEycHg7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKX1cbi8qIC0tLSBmYWxsYmFjayB1c2VyIGJ1YmJsZSAobmF0aXZlIGxvb2spIC0tLSAqL1xuLmRzZHItZmFsbGJhY2stdXNlcntmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6ZmxleC1lbmQ7Z2FwOjZweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1mYWxsYmFjay11c2VyLXN0YWNre2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjthbGlnbi1pdGVtczpmbGV4LWVuZDtnYXA6OHB4O21pbi13aWR0aDowO21heC13aWR0aDptaW4oNTI1cHgsODIlKTtkaXNwbGF5OmZsZXh9XG4uZHNkci1mYWxsYmFjay11c2VyLXJvd3tmbGV4LWRpcmVjdGlvbjpyb3c7YWxpZ24taXRlbXM6ZmxleC1lbmQ7Z2FwOjZweDttYXgtd2lkdGg6MTAwJTtkaXNwbGF5OmZsZXh9XG4uZHNkci1mYWxsYmFjay11c2VyLWJ1YmJsZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1idWJibGUpO21heC13aWR0aDoxMDAlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItcmFkaXVzOjIycHg7cGFkZGluZzoxMHB4IDE2cHg7Zm9udC1zaXplOjE2cHg7bGluZS1oZWlnaHQ6MjRweDt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZmFsbGJhY2stdXNlci1jb3B5e2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MjRweDtoZWlnaHQ6MjRweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDtiYWNrZ3JvdW5kOjAgMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTFweDt2aXNpYmlsaXR5OmhpZGRlbjttYXJnaW4tYm90dG9tOjJweH1cbi5kc2RyLWZhbGxiYWNrLXVzZXI6aG92ZXIgLmRzZHItZmFsbGJhY2stdXNlci1jb3B5LC5kc2RyLWZhbGxiYWNrLXVzZXItY29weTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWZhbGxiYWNrLXVzZXItY29weTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuYFxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc3R5bGVbZGF0YS1wbHVnaW4tY3NzPSR7SlNPTi5zdHJpbmdpZnkoU1RZTEVfVEFHKX1dYCkgPT09IG51bGwpIHtcbiAgY29uc3QgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICB0YWcuZGF0YXNldC5wbHVnaW4gPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldydcbiAgdGFnLmRhdGFzZXQucGx1Z2luQ3NzID0gU1RZTEVfVEFHXG4gIHRhZy50ZXh0Q29udGVudCA9IFJFVklFV19DU1NcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpXG59XG5cbi8qKiBTaW1wbGlmaWVkIENoaW5lc2UgZGljdGlvbmFyeSAoa2V5LXNldCBzb3VyY2Ugb2YgdHJ1dGgpLiAqL1xuY29uc3QgemggPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1x1NUJBMVx1NjdFNVx1NUY1M1x1NTI0RFx1OTg3OVx1NzZFRVx1NEUwRVx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOScsXG4gICd0YWIuc2Vzc2lvbic6ICdcdTRGMUFcdThCRERcdTY2RjRcdTY1MzknLFxuICAndGFiLndvcmtzcGFjZSc6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAncmV2aWV3LnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdyZXZpZXcuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnXHU2RTM4XHU3OUJCIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnXHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHU0RTBEXHU2NjJGIGdpdCBcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1x1MzAwQ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOVx1MzAwRFx1OTg3NVx1N0I3RVx1NEUwRFx1NTNEN1x1NUY3MVx1NTRDRFx1RkYwQ1x1NEVDRFx1NTNFRlx1NjdFNVx1NzcwQlx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOVx1MzAwMicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdcdThGRDlcdTRFMkFcdTRGMUFcdThCRERcdThGRDhcdTZDQTFcdTY3MDlcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzlcdThCQjBcdTVGNTUnLFxuICAncmV2aWV3LnNlc3Npb25TY2FuJzogJ1x1NURGMlx1NjI2Qlx1NjNDRiB7cmVzdWx0c30gXHU0RTJBXHU1REU1XHU1MTc3XHU3RUQzXHU2NzlDXHVGRjFBe2RpZmZ9IFx1NEUyQVx1NjQzQVx1NUUyNiBkaWZmXHUzMDAxe3BhdGh9IFx1NEUyQVx1NEVDNVx1NjcwOVx1OERFRlx1NUY4NFx1MjAxNFx1MjAxNFx1N0VDOFx1N0FFRlx1NTQ3RFx1NEVFNFx1RkYwOGJhc2hcdUZGMDlcdTY1MzlcdTY1ODdcdTRFRjZcdTRFMERcdTRGMUFcdThCQTFcdTUxNjVcdTRGMUFcdThCRERcdThCQjBcdTVGNTVcdTMwMDInLFxuICAncmV2aWV3LmdvV29ya3NwYWNlJzogJ1x1NjdFNVx1NzcwQlx1NURFNVx1NEY1Q1x1NTMzQVx1NjUzOVx1NTJBOCcsXG4gICdyZXZpZXcuc2Vzc2lvblN0YXRzJzogJ3tyb3VuZHN9IFx1OEY2RSBcdTAwQjcge2ZpbGVzfSBcdTRFMkFcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LnJvdW5kJzogJ1x1N0IyQyB7cm91bmR9IFx1OEY2RScsXG4gICdyZXZpZXcuZW1wdHknOiAnXHU2Q0ExXHU2NzA5XHU2NzJBXHU2M0QwXHU0RUE0XHU3Njg0XHU2NkY0XHU2NTM5IFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ1x1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcuYWNjZXB0JzogJ1x1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0JzogJ1x1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuYWNjZXB0QWxsJzogJ1x1NTE2OFx1OTBFOFx1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1x1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcudW5zdGFnZSc6ICdcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnVuc3RhZ2VBbGwnOiAnXHU1MTY4XHU5MEU4XHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsuc3RhZ2UnOiAnXHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsucmV2ZXJ0JzogJ1x1NEUyMlx1NUYwMycsXG4gICdodW5rLnVuc3RhZ2UnOiAnXHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsuc3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnVuc3RhZ2VkJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU1MTY4XHU5MEU4XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb21taXQnOiAnXHU2M0QwXHU0RUE0JyxcbiAgJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcic6ICdcdTYzRDBcdTRFQTRcdThCRjRcdTY2MEVcdTIwMjYnLFxuICAncmV2aWV3LnB1c2gnOiAnXHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb25maXJtUHVzaCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LmNvbW1pdHRlZCc6ICdcdTVERjJcdTYzRDBcdTRFQTQge3N1bW1hcnl9JyxcbiAgJ3Jldmlldy5jb21taXRGYWlsZWQnOiAnXHU2M0QwXHU0RUE0XHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5wdXNoZWQnOiAnXHU1REYyXHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5wdXNoRmFpbGVkJzogJ1x1NjNBOFx1OTAwMVx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcuYWhlYWQnOiAnXHU5ODg2XHU1MTQ4IHtufScsXG4gICdyZXZpZXcuYmVoaW5kJzogJ1x1ODQzRFx1NTQwRSB7bn0nLFxuICAncmV2aWV3LnNlY3Rpb25TdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcyc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnNlY3Rpb25CcmFuY2gnOiAnXHU1MjA2XHU2NTJGXHU0RTBFXHU4RkRDXHU3QTBCJyxcbiAgJ3Jldmlldy5ub1Vwc3RyZWFtJzogJ1x1NjcyQVx1OEJCRVx1N0Y2RVx1NEUwQVx1NkUzOFx1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuaGlzdG9yeSc6ICdcdTUzODZcdTUzRjInLFxuICAncmV2aWV3LmNvbW1pdEZpbGVzJzogJ1x1NTNEOFx1NTJBOFx1NjU4N1x1NEVGNicsXG4gICdoaXN0b3J5LmxvY2FsJzogJ1x1NjcyQ1x1NTczMCcsXG4gICdoaXN0b3J5LnJlbW90ZSc6ICdcdThGRENcdTdBMEInLFxuICAndGltZS5ub3cnOiAnXHU1MjFBXHU1MjFBJyxcbiAgJ3RpbWUubWludXRlcyc6ICd7bn0gXHU1MjA2XHU5NDlGXHU1MjREJyxcbiAgJ3RpbWUuaG91cnMnOiAne259IFx1NUMwRlx1NjVGNlx1NTI0RCcsXG4gICd0aW1lLmRheXMnOiAne259IFx1NTkyOVx1NTI0RCcsXG4gICdyZXZpZXcucmVmcmVzaCc6ICdcdTUyMzdcdTY1QjAnLFxuICAncmV2aWV3LmNsb3NlJzogJ1x1NTE3M1x1OTVFRCcsXG4gICdyZXZpZXcuYnVzeSc6ICdcdTU5MDRcdTc0MDZcdTRFMkRcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LmRvbmVPbmUnOiAnXHU1REYye2FjdGlvbn0ge3BhdGh9JyxcbiAgJ3Jldmlldy5kb25lRGVsZXRlZCc6ICdcdTVERjJ7YWN0aW9ufSB7Y291bnR9IFx1NEUyQVx1NjU4N1x1NEVGNlx1RkYwOFx1NTIyMFx1OTY2NCB7ZGVsZXRlZH0gXHU0RTJBXHU2NzJBXHU4RERGXHU4RTJBXHU2NTg3XHU0RUY2XHVGRjA5JyxcbiAgJ3Jldmlldy5hY2NlcHRlZCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydGVkJzogJ1x1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ1x1NjcyQVx1OERERlx1OEUyQScsXG4gICdyZXZpZXcuYmluYXJ5JzogJ1x1NEU4Q1x1OEZEQlx1NTIzNicsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdcdThCRTVcdTRGRUVcdTY1MzlcdTZDQTFcdTY3MDkgZGlmZiBcdTY1NzBcdTYzNkUnLFxuICAncmV2aWV3LmNoYW5nZXMnOiAne2FkZGVkfSsge2RlbGV0ZWR9LScsXG4gICd2aWV3LnNpbmdsZSc6ICdcdTUzNTVcdTY4MEYnLFxuICAndmlldy5zcGxpdCc6ICdcdTUzQ0NcdTY4MEYnLFxuICAndmlldy5iZWZvcmUnOiAnXHU1MzlGXHU2NTg3XHU0RUY2JyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnXHU2NUIwXHU2NTg3XHU0RUY2JyxcbiAgJ2NvbW1lbnQuYWRkJzogJ1x1OEJDNFx1OEJCQVx1NkI2NFx1ODg0QycsXG4gICdjb21tZW50LnNob3cnOiAnXHU2N0U1XHU3NzBCXHU4QkM0XHU4QkJBJyxcbiAgJ2NvbW1lbnQucGxhY2Vob2xkZXInOiAnXHU4QkM0XHU4QkJBXHUyMDI2XHVGRjA4Q3RybC9cdTIzMTgrRW50ZXIgXHU0RkREXHU1QjU4XHVGRjA5JyxcbiAgJ2NvbW1lbnQuc2F2ZSc6ICdcdTRGRERcdTVCNTgnLFxuICAnY29tbWVudC5jYW5jZWwnOiAnXHU1M0Q2XHU2RDg4JyxcbiAgJ2NvbW1lbnQuZGVsZXRlJzogJ1x1NTIyMFx1OTY2NCcsXG4gICdjb21tZW50LmVkaXQnOiAnXHU3RjE2XHU4RjkxJyxcbiAgJ2NvbW1lbnQuc2F2ZWQnOiAnXHU1REYyXHU0RkREXHU1QjU4XHU4QkM0XHU4QkJBJyxcbiAgJ2NvbW1lbnQuZmFpbGVkJzogJ1x1OEJDNFx1OEJCQVx1NEZERFx1NUI1OFx1NTkzMVx1OEQyNScsXG4gICdzY29wZS5sYWJlbCc6ICdcdTgzMDNcdTU2RjQnLFxuICAnc2NvcGUuYWxsJzogJ1x1NTE2OFx1OTBFOCcsXG4gICdzY29wZS51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAnc2NvcGUuc3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdzY29wZS5jb21taXQnOiAnXHU2M0QwXHU0RUE0JyxcbiAgJ3Njb3BlLmJyYW5jaCc6ICdcdTUyMDZcdTY1MkYnLFxuICAnc2NvcGUubGFzdC10dXJuJzogJ1x1NjcwMFx1NTQwRVx1NEUwMFx1OEY2RScsXG4gICdyZXZpZXcubGFzdFR1cm5FbXB0eSc6ICdcdTY3MDBcdTU0MEVcdTRFMDBcdThGNkVcdTZDQTFcdTY3MDlcdThCQjBcdTVGNTVcdTUyMzBcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzkgXHUyMDE0XHUyMDE0IFx1N0VDOFx1N0FFRlx1NTQ3RFx1NEVFNFx1RkYwOGJhc2hcdUZGMDlcdTY1MzlcdTY1ODdcdTRFRjZcdTRFMERcdTRGMUFcdThCQTFcdTUxNjVcdTRGMUFcdThCRERcdThCQjBcdTVGNTVcdUZGMUJcdTUzRUZcdTUyMDdcdTUyMzBcdTMwMENcdTUxNjhcdTkwRThcdTMwMERcdTY3RTVcdTc3MEIgZ2l0IFx1NTNEOFx1NjZGNCcsXG4gICdzY29wZS5iYXNlJzogJ1x1NTdGQVx1N0VCRlx1NTIwNlx1NjUyRicsXG4gICdzY29wZS5icmFuY2hSZWFkb25seSc6ICdcdTUyMDZcdTY1MkZcdTgzMDNcdTU2RjRcdTUzRUFcdThCRkJcdUZGMDhcdTVCRjlcdTZCRDQgbWVyZ2UtYmFzZVx1RkYwQ1x1NEUwRFx1NjNEMFx1NEY5Qlx1OTFDN1x1N0VCMy9cdTRFMjJcdTVGMDNcdUZGMDknLFxuICAncmV2aWV3LnNlbGVjdENvbW1pdCc6ICdcdTRFQ0VcdTVERTZcdTRGQTdcdTkwMDlcdTYyRTlcdTYzRDBcdTRFQTRcdTY3RTVcdTc3MEIgZGlmZicsXG4gICdyZXZpZXcuc2VuZFRvQWdlbnQnOiAnXHU1M0QxXHU5MDAxXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW5kVGl0bGUnOiAnXHU1M0QxXHU5MDAxXHU4ODRDXHU1MTg1XHU4QkM0XHU4QkJBXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW5kSGludCc6ICdcdThCQzRcdThCQkFcdTRGMUFcdTRGNUNcdTRFM0FcdThCQzRcdTVCQTFcdTYzMDdcdTVGMTVcdTZDRThcdTUxNjVcdTVGNTNcdTUyNERcdTRGMUFcdThCRERcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMDlcdTMwMDJcdTUzRDFcdTkwMDFcdTU5MzFcdThEMjVcdTY1RjZcdTkwMDBcdTUzMTZcdTRFM0FcdTU5MERcdTUyMzZcdTY1ODdcdTY3MkNcdTMwMDInLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1x1NURGMlx1NTNEMVx1OTAwMVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuY29weSc6ICdcdTU5MERcdTUyMzZcdTY1ODdcdTY3MkMnLFxuICAncmV2aWV3LmNvcGllZCc6ICdcdTVERjJcdTU5MERcdTUyMzYnLFxuICAncmV2aWV3LmNvcHlGYWlsZWQnOiAnXHU1OTBEXHU1MjM2XHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnXHU4QkM0XHU1QkExJyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnXHU4QkM0XHU1QkExXHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnXHU4QkM0XHU1QkExXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCc6ICdcdTg4NjVcdTRFMDFcdTZCNjNcdTc4NkUgXHUyNzEzJyxcbiAgJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JzogJ1x1ODg2NVx1NEUwMVx1NUI1OFx1NTcyOFx1OTVFRVx1OTg5OCBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnXHU2Q0ExXHU2NzA5XHU1M0QxXHU3M0IwXHU5NUVFXHU5ODk4JyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gXHU2NzYxXHU1M0QxXHU3M0IwJyxcbiAgJ3Jldmlldy5jb25maWRlbmNlJzogJ1x1N0Y2RVx1NEZFMVx1NUVBNiB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnXHU1RUZBXHU4QkFFJyxcbiAgJ3Jldmlldy5zZW5kRmluZGluZ3MnOiAnXHU1M0QxXHU5MDAxXHU1M0QxXHU3M0IwXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW50RmluZGluZ3MnOiAnXHU1REYyXHU1M0QxXHU5MDAxXHU1M0QxXHU3M0IwXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdcdThCQzRcdTVCQTFcdTgzMDNcdTU2RjQnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIFx1OEJDNFx1OEJCQSAoe259KScsXG4gICdwci5ub1ByJzogJ1x1NjVFMFx1NTE3M1x1ODA1NCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnXHU1M0QxXHU5MDAxIFBSIFx1OEJDNFx1OEJCQVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnXHU1NzI4XHU3RjE2XHU4RjkxXHU1NjY4XHU0RTJEXHU2MjUzXHU1RjAwJyxcbiAgJ2VkaXRvci5vcGVuTGluZSc6ICdcdTU3MjhcdTdGMTZcdThGOTFcdTU2NjhcdTRFMkRcdTYyNTNcdTVGMDBcdThCRTVcdTg4NEMnLFxuICAnZWRpdG9yLmZhaWxlZCc6ICdcdTYyNTNcdTVGMDBcdTU5MzFcdThEMjUnLFxuICAncmVwby5sYWJlbCc6ICdcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3LmRvY2tDb21tZW50cyc6ICdcdTg4NENcdTUxODVcdThCQzRcdThCQkEge259IFx1Njc2MScsXG4gICdyZXZpZXcuZG9ja1ZlcmRpY3QnOiAnXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBXHU1Rjg1XHU1M0QxXHU5MDAxJyxcbiAgJ3Jldmlldy5kb2NrU2VuZCc6ICdcdTcwQjlcdTUxRkJcdTUzRDFcdTkwMDFcdThCQzRcdThCQkEnLFxuICAncmV2aWV3LmRvY2tNb3JlJzogJ1x1OEZEOFx1NjcwOSB7bn0gXHU2NzYxXHU4QkM0XHU4QkJBXHVGRjBDXHU3MEI5XHU1MUZCXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU2N0U1XHU3NzBCJyxcbiAgJ3Jldmlldy5jb3BpZWRGYWxsYmFjayc6ICdcdTRGMUFcdThCRERcdTRFMERcdTUzRUZcdTc1MjhcdUZGMENcdThCQzRcdThCQkFcdTVERjJcdTU5MERcdTUyMzZcdUZGMDhcdThCRjdcdTdDOThcdThEMzRcdTUzRDFcdTkwMDFcdUZGMDknLFxuICAncmV2aWV3LnNlbmRGYWlsZWQnOiAnXHU4QkM0XHU4QkJBXHU1M0QxXHU5MDAxXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5kb2NrSnVtcCc6ICdcdTcwQjlcdTUxRkJcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTYyNTNcdTVGMDBcdTVCRjlcdTVFOTRcdTUzRDhcdTY2RjQnLFxuICAncmV2aWV3LmNhcmRUaXRsZSc6ICdcdTg4NENcdTUxODVcdThCQzRcdTVCQTEnLFxuICAncmV2aWV3LmNhcmRDb21tZW50cyc6ICd7bn0gXHU2NzYxXHU4QkM0XHU4QkJBJyxcbiAgJ3Jldmlldy5jYXJkVmVyZGljdCc6ICdBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkEnLFxuICAncmV2aWV3LmNhcmRKdW1wJzogJ1x1NzBCOVx1NTFGQlx1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NUI5QVx1NEY0RFx1NTIzMFx1NUJGOVx1NUU5NFx1NEVFM1x1NzgwMScsXG4gICdyZXZpZXcuY2FyZE9wZW5GaWxlJzogJ1x1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NjI1M1x1NUYwMFx1OEJFNVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcuY2FyZEhpbnQnOiAnXHU3MEI5XHU1MUZCXHU4QkM0XHU4QkJBXHU1M0VGXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU1QjlBXHU0RjREXHU1MjMwXHU1QkY5XHU1RTk0XHU0RUUzXHU3ODAxJyxcbiAgJ2ZhbGxiYWNrLmltYWdlJzogJ1x1NTZGRVx1NzI0NycsXG4gICdmYWxsYmFjay5vcGVuJzogJ1x1NjdFNVx1NzcwQlx1NTM5Rlx1NTZGRScsXG4gICdmYWxsYmFjay5vcGVuTmFtZWQnOiAnXHU2N0U1XHU3NzBCXHU1MzlGXHU1NkZFIHtuYW1lfScsXG4gICdmYWxsYmFjay5sb2FkaW5nJzogJ1x1NTJBMFx1OEY3RFx1NEUyRFx1MjAyNicsXG4gICdmYWxsYmFjay5sb2FkRmFpbGVkJzogJ1x1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNScsXG4gICdmYWxsYmFjay5saWdodGJveERpYWxvZyc6ICdcdTU2RkVcdTcyNDdcdTk4ODRcdTg5QzgnLFxuICAnZmFsbGJhY2subGlnaHRib3hDbG9zZSc6ICdcdTUxNzNcdTk1RUQnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnXHU1QjU3XHU0RjUzJyxcbiAgJ3NldHRpbmdzLnNpemUnOiAnXHU1QjU3XHU1M0Y3JyxcbiAgJ2NvbmZpZy50aXRsZSc6ICdcdTkxNERcdTdGNkUnLFxuICAnZm9udC5tb25vJzogJ1x1N0I0OVx1NUJCRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYwOScsXG4gICdmb250LnN5c3RlbSc6ICdcdTdDRkJcdTdFREZcdTVCNTdcdTRGNTMnLFxufSBhcyBjb25zdFxuXG4vKiogRW5nbGlzaCBkaWN0aW9uYXJ5LCBjaGVja2VkIGNvbXBsZXRlIGFnYWluc3QgdGhlIHpoIGtleSBzZXQuICovXG5jb25zdCBlbjogUmVjb3JkPGtleW9mIHR5cGVvZiB6aCwgc3RyaW5nPiA9IHtcbiAgJ2FjdGlvbi5sYWJlbCc6ICdDaGFuZ2VzJyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1JldmlldyB3b3Jrc3BhY2UgYW5kIHBlci1yb3VuZCBjaGFuZ2VzJyxcbiAgJ3RhYi5zZXNzaW9uJzogJ1Nlc3Npb24nLFxuICAndGFiLndvcmtzcGFjZSc6ICdXb3Jrc3BhY2UnLFxuICAncmV2aWV3LnRpdGxlJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdicmFuY2gnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ2RldGFjaGVkIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnVGhpcyBkaXJlY3RvcnkgaXMgbm90IGEgZ2l0IHJlcG9zaXRvcnknLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1RoZSBcIlNlc3Npb25cIiB0YWIgc3RpbGwgc2hvd3MgZXZlcnkgcm91bmRcXCdzIGNoYW5nZXMuJyxcbiAgJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBpbiB0aGlzIHNlc3Npb24geWV0JyxcbiAgJ3Jldmlldy5zZXNzaW9uU2Nhbic6ICdTY2FubmVkIHtyZXN1bHRzfSB0b29sIHJlc3VsdHM6IHtkaWZmfSB3aXRoIGRpZmZzLCB7cGF0aH0gcGF0aC1vbmx5IFx1MjAxNCB0ZXJtaW5hbCAoYmFzaCkgZWRpdHMgYXJlIG5vdCB0cmFja2VkIGluIHRoZSBzZXNzaW9uIGxvZy4nLFxuICAncmV2aWV3LmdvV29ya3NwYWNlJzogJ1ZpZXcgd29ya3NwYWNlIGNoYW5nZXMnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSByb3VuZHMgXHUwMEI3IHtmaWxlc30gZmlsZXMnLFxuICAncmV2aWV3LnJvdW5kJzogJ1JvdW5kIHtyb3VuZH0nLFxuICAncmV2aWV3LmVtcHR5JzogJ05vIHVuY29tbWl0dGVkIGNoYW5nZXMgXHVEODNDXHVERjg5JyxcbiAgJ3Jldmlldy5sb2FkRXJyb3InOiAnRmFpbGVkIHRvIGxvYWQnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdBY2NlcHQnLFxuICAncmV2aWV3LnJldmVydCc6ICdSZXZlcnQnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdBY2NlcHQgYWxsJyxcbiAgJ3Jldmlldy5yZXZlcnRBbGwnOiAnUmV2ZXJ0IGFsbCcsXG4gICdyZXZpZXcudW5zdGFnZSc6ICdVbnN0YWdlJyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1Vuc3RhZ2UgYWxsJyxcbiAgJ2h1bmsuc3RhZ2UnOiAnU3RhZ2UnLFxuICAnaHVuay5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ2h1bmsudW5zdGFnZSc6ICdVbnN0YWdlJyxcbiAgJ2h1bmsuc3RhZ2VkJzogJ3N0YWdlZCcsXG4gICdodW5rLnVuc3RhZ2VkJzogJ3Vuc3RhZ2VkJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0JzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcmV2ZXJ0JyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcmV2ZXJ0IGFsbCcsXG4gICdyZXZpZXcuY29tbWl0JzogJ0NvbW1pdCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnQ29tbWl0IG1lc3NhZ2VcdTIwMjYnLFxuICAncmV2aWV3LnB1c2gnOiAnUHVzaCcsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSBwdXNoJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnQ29tbWl0dGVkIHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ0NvbW1pdCBmYWlsZWQnLFxuICAncmV2aWV3LnB1c2hlZCc6ICdQdXNoZWQnLFxuICAncmV2aWV3LnB1c2hGYWlsZWQnOiAnUHVzaCBmYWlsZWQnLFxuICAncmV2aWV3LmFoZWFkJzogJ3tufSBhaGVhZCcsXG4gICdyZXZpZXcuYmVoaW5kJzogJ3tufSBiZWhpbmQnLFxuICAncmV2aWV3LnNlY3Rpb25TdGFnZWQnOiAnU3RhZ2VkJyxcbiAgJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcyc6ICdDaGFuZ2VzJyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ0JyYW5jaCB2cyByZW1vdGUnLFxuICAncmV2aWV3Lm5vVXBzdHJlYW0nOiAnbm8gdXBzdHJlYW0nLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnSGlzdG9yeScsXG4gICdyZXZpZXcuY29tbWl0RmlsZXMnOiAnRmlsZXMnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdsb2NhbCcsXG4gICdoaXN0b3J5LnJlbW90ZSc6ICdyZW1vdGUnLFxuICAndGltZS5ub3cnOiAnanVzdCBub3cnLFxuICAndGltZS5taW51dGVzJzogJ3tufSBtaW4gYWdvJyxcbiAgJ3RpbWUuaG91cnMnOiAne259IGggYWdvJyxcbiAgJ3RpbWUuZGF5cyc6ICd7bn0gZCBhZ28nLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnUmVmcmVzaCcsXG4gICdyZXZpZXcuY2xvc2UnOiAnQ2xvc2UnLFxuICAncmV2aWV3LmJ1c3knOiAnV29ya2luZ1x1MjAyNicsXG4gICdyZXZpZXcuZG9uZSc6ICd7YWN0aW9ufSB7Y291bnR9IGZpbGVzJyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ3thY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcyAoe2RlbGV0ZWR9IHVudHJhY2tlZCBkZWxldGVkKScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnQWNjZXB0ZWQnLFxuICAncmV2aWV3LnJldmVydGVkJzogJ1JldmVydGVkJyxcbiAgJ3Jldmlldy51bnRyYWNrZWQnOiAndW50cmFja2VkJyxcbiAgJ3Jldmlldy5iaW5hcnknOiAnYmluYXJ5JyxcbiAgJ3Jldmlldy5ub0RpZmZEYXRhJzogJ05vIGRpZmYgZGF0YSBmb3IgdGhpcyBjaGFuZ2UnLFxuICAncmV2aWV3LmNoYW5nZXMnOiAne2FkZGVkfSsge2RlbGV0ZWR9LScsXG4gICd2aWV3LnNpbmdsZSc6ICdTaW5nbGUnLFxuICAndmlldy5zcGxpdCc6ICdTcGxpdCcsXG4gICd2aWV3LmJlZm9yZSc6ICdCZWZvcmUnLFxuICAndmlldy5hZnRlcic6ICdBZnRlcicsXG4gICdjb21tZW50LmFkZCc6ICdDb21tZW50IG9uIHRoaXMgbGluZScsXG4gICdjb21tZW50LnNob3cnOiAnVmlldyBjb21tZW50cycsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ0NvbW1lbnRcdTIwMjYgKEN0cmwvXHUyMzE4K0VudGVyIHRvIHNhdmUpJyxcbiAgJ2NvbW1lbnQuc2F2ZSc6ICdTYXZlJyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ0NhbmNlbCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdEZWxldGUnLFxuICAnY29tbWVudC5lZGl0JzogJ0VkaXQnLFxuICAnY29tbWVudC5zYXZlZCc6ICdDb21tZW50IHNhdmVkJyxcbiAgJ2NvbW1lbnQuZmFpbGVkJzogJ0ZhaWxlZCB0byBzYXZlIGNvbW1lbnQnLFxuICAnc2NvcGUubGFiZWwnOiAnU2NvcGUnLFxuICAnc2NvcGUuYWxsJzogJ0FsbCcsXG4gICdzY29wZS51bnN0YWdlZCc6ICdVbnN0YWdlZCcsXG4gICdzY29wZS5zdGFnZWQnOiAnU3RhZ2VkJyxcbiAgJ3Njb3BlLmNvbW1pdCc6ICdDb21taXQnLFxuICAnc2NvcGUuYnJhbmNoJzogJ0JyYW5jaCcsXG4gICdzY29wZS5sYXN0LXR1cm4nOiAnTGFzdCB0dXJuJyxcbiAgJ3Jldmlldy5sYXN0VHVybkVtcHR5JzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBmb3IgdGhlIGxhc3QgdHVybiBcdTIwMTQgdGVybWluYWwgY29tbWFuZHMgKGJhc2gpIHRoYXQgZWRpdCBmaWxlcyBhcmUgbm90IHRyYWNrZWQgaW4gdGhlIHNlc3Npb24gbG9nOyBzd2l0Y2ggdG8gXCJBbGxcIiB0byBzZWUgZ2l0IGNoYW5nZXMnLFxuICAnc2NvcGUuYmFzZSc6ICdCYXNlIGJyYW5jaCcsXG4gICdzY29wZS5icmFuY2hSZWFkb25seSc6ICdCcmFuY2ggc2NvcGUgaXMgcmVhZC1vbmx5IChtZXJnZS1iYXNlIGRpZmY7IG5vIGFjY2VwdC9yZXZlcnQpJyxcbiAgJ3Jldmlldy5zZWxlY3RDb21taXQnOiAnU2VsZWN0IGEgY29tbWl0IGZyb20gdGhlIGxlZnQgdG8gdmlldyBpdHMgZGlmZicsXG4gICdyZXZpZXcuc2VuZFRvQWdlbnQnOiAnU2VuZCB0byBhZ2VudCcsXG4gICdyZXZpZXcuc2VuZFRpdGxlJzogJ1NlbmQgaW5saW5lIGNvbW1lbnRzIHRvIHRoZSBhZ2VudCcsXG4gICdyZXZpZXcuc2VuZEhpbnQnOiAnQ29tbWVudHMgYXJlIGluamVjdGVkIGludG8gdGhlIGN1cnJlbnQgc2Vzc2lvbiBhcyByZXZpZXcgZ3VpZGFuY2UgKEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50cykuIEZhbGxzIGJhY2sgdG8gY29weWFibGUgdGV4dCBpZiBzZW5kaW5nIGZhaWxzLicsXG4gICdyZXZpZXcuc2VudFRvQWdlbnQnOiAnU2VudCB0byBhZ2VudCcsXG4gICdyZXZpZXcuY29weSc6ICdDb3B5IHRleHQnLFxuICAncmV2aWV3LmNvcGllZCc6ICdDb3BpZWQnLFxuICAncmV2aWV3LmNvcHlGYWlsZWQnOiAnQ29weSBmYWlsZWQnLFxuICAncmV2aWV3LnJldmlldyc6ICdSZXZpZXcnLFxuICAncmV2aWV3LnJldmlld2luZyc6ICdSZXZpZXdpbmdcdTIwMjYnLFxuICAncmV2aWV3LnJldmlld0ZhaWxlZCc6ICdSZXZpZXcgZmFpbGVkJyxcbiAgJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCc6ICdQYXRjaCBpcyBjb3JyZWN0IFx1MjcxMycsXG4gICdyZXZpZXcudmVyZGljdEluY29ycmVjdCc6ICdQYXRjaCBuZWVkcyB3b3JrIFx1MjcxNycsXG4gICdyZXZpZXcubm9GaW5kaW5ncyc6ICdObyBpc3N1ZXMgZm91bmQnLFxuICAncmV2aWV3LmZpbmRpbmdzJzogJ3tufSBmaW5kaW5ncycsXG4gICdyZXZpZXcuY29uZmlkZW5jZSc6ICdjb25maWRlbmNlIHtjb25maWRlbmNlfScsXG4gICdyZXZpZXcuc3VnZ2VzdGlvbic6ICdTdWdnZXN0aW9uJyxcbiAgJ3Jldmlldy5zZW5kRmluZGluZ3MnOiAnU2VuZCBmaW5kaW5ncyB0byBhZ2VudCcsXG4gICdyZXZpZXcuc2VudEZpbmRpbmdzJzogJ0ZpbmRpbmdzIHNlbnQgdG8gYWdlbnQnLFxuICAncmV2aWV3LnJldmlld1Njb3BlJzogJ1JldmlldyBzY29wZScsXG4gICdwci50aXRsZSc6ICdQUiAje251bWJlcn0nLFxuICAncHIuY29tbWVudHMnOiAnUFIgY29tbWVudHMgKHtufSknLFxuICAncHIubm9Qcic6ICdObyBhc3NvY2lhdGVkIFBSJyxcbiAgJ3ByLnNlbmRDb21tZW50cyc6ICdTZW5kIFBSIGNvbW1lbnRzIHRvIGFnZW50JyxcbiAgJ2VkaXRvci5vcGVuRmlsZSc6ICdPcGVuIGluIGVkaXRvcicsXG4gICdlZGl0b3Iub3BlbkxpbmUnOiAnT3BlbiB0aGlzIGxpbmUgaW4gZWRpdG9yJyxcbiAgJ2VkaXRvci5mYWlsZWQnOiAnRmFpbGVkIHRvIG9wZW4nLFxuICAncmVwby5sYWJlbCc6ICdSZXBvJyxcbiAgJ3Jldmlldy5kb2NrQ29tbWVudHMnOiAne259IGlubGluZSBjb21tZW50cycsXG4gICdyZXZpZXcuZG9ja1ZlcmRpY3QnOiAndmVyZGljdCBwZW5kaW5nJyxcbiAgJ3Jldmlldy5kb2NrU2VuZCc6ICdDbGljayB0byBzZW5kJyxcbiAgJ3Jldmlldy5jb3BpZWRGYWxsYmFjayc6ICdTZXNzaW9uIHVuYXZhaWxhYmxlIFx1MjAxNCBjb21tZW50cyBjb3BpZWQgKHBhc3RlIHRvIHNlbmQpJyxcbiAgJ3Jldmlldy5zZW5kRmFpbGVkJzogJ0ZhaWxlZCB0byBzZW5kIGNvbW1lbnRzJyxcbiAgJ3Jldmlldy5kb2NrSnVtcCc6ICdPcGVuIHRoZSBtYXRjaGluZyBjaGFuZ2UgaW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuZG9ja01vcmUnOiAne259IG1vcmUgY29tbWVudHMgXHUyMDE0IG9wZW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuY2FyZFRpdGxlJzogJ0lubGluZSByZXZpZXcnLFxuICAncmV2aWV3LmNhcmRDb21tZW50cyc6ICd7bn0gY29tbWVudHMnLFxuICAncmV2aWV3LmNhcmRWZXJkaWN0JzogJ0FJIHJldmlldyB2ZXJkaWN0JyxcbiAgJ3Jldmlldy5jYXJkSnVtcCc6ICdKdW1wIHRvIHRoZSBtYXRjaGluZyBjb2RlIGluIHRoZSByZXZpZXcgcGFuZWwnLFxuICAncmV2aWV3LmNhcmRPcGVuRmlsZSc6ICdPcGVuIHRoaXMgZmlsZSBpbiB0aGUgcmV2aWV3IHBhbmVsJyxcbiAgJ3Jldmlldy5jYXJkSGludCc6ICdDbGljayBhIGNvbW1lbnQgdG8ganVtcCB0byB0aGUgbWF0Y2hpbmcgY2hhbmdlIGJsb2NrJyxcbiAgJ2ZhbGxiYWNrLmltYWdlJzogJ0ltYWdlJyxcbiAgJ2ZhbGxiYWNrLm9wZW4nOiAnVmlldyBvcmlnaW5hbCcsXG4gICdmYWxsYmFjay5vcGVuTmFtZWQnOiAnVmlldyBvcmlnaW5hbCB7bmFtZX0nLFxuICAnZmFsbGJhY2subG9hZGluZyc6ICdMb2FkaW5nXHUyMDI2JyxcbiAgJ2ZhbGxiYWNrLmxvYWRGYWlsZWQnOiAnRmFpbGVkIHRvIGxvYWQnLFxuICAnZmFsbGJhY2subGlnaHRib3hEaWFsb2cnOiAnSW1hZ2UgcHJldmlldycsXG4gICdmYWxsYmFjay5saWdodGJveENsb3NlJzogJ0Nsb3NlJyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ0NoYW5nZXMnLFxuICAnc2V0dGluZ3MuZm9udCc6ICdGb250JyxcbiAgJ3NldHRpbmdzLnNpemUnOiAnRm9udCBzaXplJyxcbiAgJ2NvbmZpZy50aXRsZSc6ICdDb25maWd1cmF0aW9uJyxcbiAgJ2ZvbnQubW9ubyc6ICdNb25vc3BhY2UgKGRlZmF1bHQpJyxcbiAgJ2ZvbnQuc3lzdGVtJzogJ1N5c3RlbSBmb250Jyxcbn1cblxudHlwZSBEaWZmUmV2aWV3QWN0aW9uUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5zZXNzaW9uLmhlYWRlci5hY3Rpb25zJz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPlxudHlwZSBEaWZmUmV2aWV3T3ZlcmxheVByb3BzID0gUHJvcHNSdW50aW1lPCdzaGVsbC5vdmVybGF5Jz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPiAmIHsgc2Vzc2lvbnM6IElTZXNzaW9ucyB9XG5cbi8qKiBEaWZmIGljb24gKGx1Y2lkZSBmaWxlLWRpZmYpLiAqL1xuZnVuY3Rpb24gSWNvbkRpZmYoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE1IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY3WlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkgMTBoNlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTEyIDd2NlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkgMTdoNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvblgoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE4IDYgNiAxOFwiIC8+XG4gICAgICA8cGF0aCBkPVwibTYgNiAxMiAxMlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNvbW1lbnQoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTIxIDE1YTIgMiAwIDAgMS0yIDJIN2wtNCA0VjVhMiAyIDAgMCAxIDItMmgxNGEyIDIgMCAwIDEgMiAyelwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNoZXZyb25Eb3duKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIm02IDkgNiA2IDYtNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNoZWNrKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyLjVcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTIwIDYgOSAxN2wtNS01XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG50eXBlIFZpZXdNb2RlID0gJ3NpbmdsZScgfCAnc3BsaXQnXG5cbi8qKiBcdTUzNTVcdTY4MEYgLyBcdTUzQ0NcdTY4MEYgc2VnbWVudGVkIHRvZ2dsZSAocGVyc2lzdGVkIGFjcm9zcyBvcGVucykuICovXG5mdW5jdGlvbiBEaWZmVmlld1RvZ2dsZSh7IHZpZXcsIG9uQ2hhbmdlLCB0IH06IHsgdmlldzogVmlld01vZGU7IG9uQ2hhbmdlOiAodjogVmlld01vZGUpID0+IHZvaWQ7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXZpZXctdG9nZ2xlXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD17dCgndmlldy5zaW5nbGUnKX0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXZpZXctYnRuJHt2aWV3ID09PSAnc2luZ2xlJyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc2luZ2xlJ31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NpbmdsZScpfVxuICAgICAgPlxuICAgICAgICB7dCgndmlldy5zaW5nbGUnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NwbGl0JyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc3BsaXQnfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgnc3BsaXQnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc3BsaXQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBUd28tY29sdW1uIHNpZGUtYnktc2lkZSBkaWZmIGJvZHkgKG9sZCBsZWZ0LCBuZXcgcmlnaHQsIGxpbmUgbnVtYmVycyBhbGlnbmVkKS4gKi9cbmZ1bmN0aW9uIFNwbGl0RGlmZih7IGJsb2NrcywgYmVmb3JlTGFiZWwsIGFmdGVyTGFiZWwgfTogeyBibG9ja3M6IFNwbGl0QmxvY2tbXTsgYmVmb3JlTGFiZWw6IHN0cmluZzsgYWZ0ZXJMYWJlbDogc3RyaW5nIH0pIHtcbiAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2JlZm9yZUxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2FmdGVyTGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgIDxkaXYga2V5PXtiaX0+XG4gICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LnJpZ2h0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBQZXItaHVuayBhY3Rpb24gYmFyIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpIGZvciB3b3Jrc3BhY2UgZGlmZnMuICovXG5mdW5jdGlvbiBIdW5rVG9vbGJhcih7XG4gIGh1bmssXG4gIGJ1c3ksXG4gIG9uQWN0aW9uLFxuICB0LFxufToge1xuICBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rIHwgdW5kZWZpbmVkXG4gIGJ1c3k6IGJvb2xlYW5cbiAgb25BY3Rpb246IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmspID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIGlmICghaHVuaykgcmV0dXJuIG51bGxcbiAgY29uc3Qgc3RhZ2VkID0gaHVuay5sYXllciA9PT0gJ3N0YWdlZCdcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItaHVuay1iYXJcIj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItaHVuay1sYXllclwiPntzdGFnZWQgPyB0KCdodW5rLnN0YWdlZCcpIDogdCgnaHVuay51bnN0YWdlZCcpfTwvc3Bhbj5cbiAgICAgIHtzdGFnZWQgPyAoXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uQWN0aW9uKCd1bnN0YWdlJywgaHVuayl9PlxuICAgICAgICAgIHt0KCdodW5rLnVuc3RhZ2UnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApIDogKFxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uQWN0aW9uKCdhY2NlcHQnLCBodW5rKX0+XG4gICAgICAgICAge3QoJ2h1bmsuc3RhZ2UnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApfVxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tZGFuZ2VyXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uQWN0aW9uKCdyZXZlcnQnLCBodW5rKX0+XG4gICAgICAgIHt0KCdodW5rLnJldmVydCcpfVxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIEh1bmtzIG9mIGBkaWZmYCB3aG9zZSBvbGQgb3IgbmV3IGxpbmUgcmFuZ2UgY292ZXJzIGFueSBvZiBgbGluZXNgLiAqL1xuZnVuY3Rpb24gaHVua3NGb3JMaW5lcyhkaWZmOiBzdHJpbmcsIGxpbmVzOiAobnVtYmVyIHwgbnVsbClbXSk6IHN0cmluZyB7XG4gIGNvbnN0IHRhcmdldHMgPSBuZXcgU2V0KGxpbmVzLmZpbHRlcigobCk6IGwgaXMgbnVtYmVyID0+IGwgIT09IG51bGwpKVxuICBpZiAodGFyZ2V0cy5zaXplID09PSAwKSByZXR1cm4gJydcbiAgY29uc3QgYmxvY2tzID0gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW11cbiAgZm9yIChjb25zdCBibG9jayBvZiBibG9ja3MpIHtcbiAgICBpZiAoYmxvY2suaGVhZD8ua2luZCAhPT0gJ2h1bmsnKSBjb250aW51ZVxuICAgIGNvbnN0IHN0YXJ0cyA9IGh1bmtTdGFydHMoYmxvY2suaGVhZC50ZXh0KVxuICAgIGxldCBvbGRMaW5lID0gc3RhcnRzLm9sZFN0YXJ0XG4gICAgbGV0IG5ld0xpbmUgPSBzdGFydHMubmV3U3RhcnRcbiAgICBsZXQgb01pbiA9IEluZmluaXR5XG4gICAgbGV0IG9NYXggPSAtSW5maW5pdHlcbiAgICBsZXQgbk1pbiA9IEluZmluaXR5XG4gICAgbGV0IG5NYXggPSAtSW5maW5pdHlcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBibG9jay5yb3dzKSB7XG4gICAgICBpZiAocm93LmtpbmQgPT09ICdjdHgnKSB7XG4gICAgICAgIGlmIChvbGRMaW5lIDwgb01pbikgb01pbiA9IG9sZExpbmVcbiAgICAgICAgaWYgKG9sZExpbmUgPiBvTWF4KSBvTWF4ID0gb2xkTGluZVxuICAgICAgICBpZiAobmV3TGluZSA8IG5NaW4pIG5NaW4gPSBuZXdMaW5lXG4gICAgICAgIGlmIChuZXdMaW5lID4gbk1heCkgbk1heCA9IG5ld0xpbmVcbiAgICAgICAgb2xkTGluZSsrXG4gICAgICAgIG5ld0xpbmUrK1xuICAgICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgICAgaWYgKG5ld0xpbmUgPCBuTWluKSBuTWluID0gbmV3TGluZVxuICAgICAgICBpZiAobmV3TGluZSA+IG5NYXgpIG5NYXggPSBuZXdMaW5lXG4gICAgICAgIG5ld0xpbmUrK1xuICAgICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHtcbiAgICAgICAgaWYgKG9sZExpbmUgPCBvTWluKSBvTWluID0gb2xkTGluZVxuICAgICAgICBpZiAob2xkTGluZSA+IG9NYXgpIG9NYXggPSBvbGRMaW5lXG4gICAgICAgIG9sZExpbmUrK1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoaXQgPSBbLi4udGFyZ2V0c10uc29tZShcbiAgICAgIChsKSA9PiAob01pbiA8PSBsICYmIGwgPD0gb01heCkgfHwgKG5NaW4gPD0gbCAmJiBsIDw9IG5NYXgpLFxuICAgIClcbiAgICBpZiAoaGl0KSBwYXJ0cy5wdXNoKFtibG9jay5oZWFkLnRleHQsIC4uLmJsb2NrLnJvd3MubWFwKChyKSA9PiByLnRleHQpXS5qb2luKCdcXG4nKSlcbiAgfVxuICByZXR1cm4gcGFydHMuam9pbignXFxuJylcbn1cblxuLyoqIFVuaWZpZWQgZGlmZiByb3dzIHdpdGggb2xkL25ldyBsaW5lIG51bWJlcnMgdHJhY2tlZCB0aHJvdWdoIGh1bmtzLiAqL1xuZnVuY3Rpb24gdW5pZmllZFJvd3NXaXRoTGluZXMocm93czogRGlmZlJvd1tdLCBvbGRTdGFydDogbnVtYmVyLCBuZXdTdGFydDogbnVtYmVyKTogeyByb3c6IERpZmZSb3c7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfVtdIHtcbiAgbGV0IG9sZExpbmUgPSBvbGRTdGFydFxuICBsZXQgbmV3TGluZSA9IG5ld1N0YXJ0XG4gIHJldHVybiByb3dzLm1hcCgocm93KSA9PiB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnY3R4JykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBvbGRMaW5lKyssIG5ld0xpbmU6IG5ld0xpbmUrKyB9XG4gICAgaWYgKHJvdy5raW5kID09PSAnYWRkJykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBuZXdMaW5lKysgfVxuICAgIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBudWxsIH1cbiAgICByZXR1cm4geyByb3csIG9sZExpbmU6IG51bGwsIG5ld0xpbmU6IG51bGwgfVxuICB9KVxufVxuXG4vKiogTWF0Y2ggYSBjb21tZW50IGFnYWluc3QgYSByb3cncyBhbmNob3JzIChib3RoIG11c3QgYWdyZWUgd2hlbiBzZXQpLiAqL1xuZnVuY3Rpb24gY29tbWVudE1hdGNoZXMoY29tbWVudDogUmV2aWV3Q29tbWVudCwgb2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCk6IGJvb2xlYW4ge1xuICBpZiAoY29tbWVudC5saW5lTmV3ICE9PSBudWxsICYmIGNvbW1lbnQubGluZU5ldyAhPT0gbmV3TGluZSkgcmV0dXJuIGZhbHNlXG4gIGlmIChjb21tZW50LmxpbmVPbGQgIT09IG51bGwgJiYgY29tbWVudC5saW5lT2xkICE9PSBvbGRMaW5lKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqIEhvdmVyLXRvLWNvbW1lbnQgYWZmb3JkYW5jZSBpbiB0aGUgbGluZS1udW1iZXIgZ3V0dGVyLiBMaW5lcyB0aGF0IGFscmVhZHlcbiAqIGhhdmUgY29tbWVudHMgc2hvdyBhIG5vbi1pbnRlcmFjdGl2ZSBjb3VudCBiYWRnZSAodGhlIHNhdmVkIGJveGVzIGJlbG93IHRoZVxuICogbGluZSBhcmUgdGhlIHZpZXcpOyB0aGUgKyBvbmx5IGFwcGVhcnMgb24gY29tbWVudC1mcmVlIGxpbmVzIHRvIGFkZCBvbmUuICovXG5mdW5jdGlvbiBDb21tZW50TGluZSh7IGNvdW50LCBvbk9wZW4sIHQgfTogeyBjb3VudDogbnVtYmVyOyBvbk9wZW46ICgpID0+IHZvaWQ7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGlmIChjb3VudCA+IDApIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFkZCBkc2RyLWNvbW1lbnQtaGFzXCIgdGl0bGU9e3QoJ2NvbW1lbnQuc2hvdycpfSBhcmlhLWxhYmVsPXt0KCdjb21tZW50LnNob3cnKX0+XG4gICAgICAgIHtjb3VudH1cbiAgICAgIDwvc3Bhbj5cbiAgICApXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWRkXCIgdGl0bGU9e3QoJ2NvbW1lbnQuYWRkJyl9IGFyaWEtbGFiZWw9e3QoJ2NvbW1lbnQuYWRkJyl9IG9uQ2xpY2s9e29uT3Blbn0+XG4gICAgICArXG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLyoqIFRoZSBpbmxpbmUgY29tbWVudCBlZGl0b3IsIHJlbmRlcmVkIGFzIGl0cyBvd24gcm93LiAqL1xuZnVuY3Rpb24gQ29tbWVudEVkaXRvcih7XG4gIHRleHQsXG4gIG9uVGV4dCxcbiAgb25TYXZlLFxuICBvbkNhbmNlbCxcbiAgYnVzeSxcbiAgdCxcbn06IHtcbiAgdGV4dDogc3RyaW5nXG4gIG9uVGV4dDogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvblNhdmU6ICgpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgYnVzeTogYm9vbGVhblxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1lZGl0b3JcIj5cbiAgICAgIDx0ZXh0YXJlYVxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaW5wdXRcIlxuICAgICAgICB2YWx1ZT17dGV4dH1cbiAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgIHJvd3M9ezJ9XG4gICAgICAgIHBsYWNlaG9sZGVyPXt0KCdjb21tZW50LnBsYWNlaG9sZGVyJyl9XG4gICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uVGV4dChldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICBvbktleURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBvbkNhbmNlbCgpXG4gICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSkgb25TYXZlKClcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCAhdGV4dC50cmltKCl9IG9uQ2xpY2s9e29uU2F2ZX0+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuc2F2ZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17b25DYW5jZWx9PlxuICAgICAgICAgIHt0KCdjb21tZW50LmNhbmNlbCcpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBBIHNhdmVkIGlubGluZSBjb21tZW50LCByZW5kZXJlZCBleGFjdGx5IGxpa2UgdGhlIGNvbW1lbnQgZWRpdG9yIFx1MjAxNCB0aGUgYm94XG4gKiBpcyByZWFkLW9ubHkgdW50aWwgRWRpdCBpcyBwcmVzc2VkLCB0aGVuIGl0IGJlY29tZXMgdGhlIGVkaXRhYmxlIGVkaXRvci4gKi9cbmZ1bmN0aW9uIENvbW1lbnRCb3goeyBjb21tZW50LCBidXN5LCBvblVwZGF0ZSwgb25EZWxldGUsIHQgfTogeyBjb21tZW50OiBSZXZpZXdDb21tZW50OyBidXN5OiBib29sZWFuOyBvblVwZGF0ZTogKGlkOiBzdHJpbmcsIHRleHQ6IHN0cmluZykgPT4gUHJvbWlzZTxib29sZWFuPjsgb25EZWxldGU6IChpZDogc3RyaW5nKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBjb25zdCBbZWRpdGluZywgc2V0RWRpdGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3RleHQsIHNldFRleHRdID0gdXNlU3RhdGUoY29tbWVudC50ZXh0KVxuICBpZiAoZWRpdGluZykge1xuICAgIHJldHVybiAoXG4gICAgICA8Q29tbWVudEVkaXRvclxuICAgICAgICB0ZXh0PXt0ZXh0fVxuICAgICAgICBvblRleHQ9e3NldFRleHR9XG4gICAgICAgIG9uU2F2ZT17KCkgPT5cbiAgICAgICAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXdhaXQgb25VcGRhdGUoY29tbWVudC5pZCwgdGV4dC50cmltKCkpKSBzZXRFZGl0aW5nKGZhbHNlKVxuICAgICAgICAgIH0pKClcbiAgICAgICAgfVxuICAgICAgICBvbkNhbmNlbD17KCkgPT4ge1xuICAgICAgICAgIHNldFRleHQoY29tbWVudC50ZXh0KVxuICAgICAgICAgIHNldEVkaXRpbmcoZmFsc2UpXG4gICAgICAgIH19XG4gICAgICAgIGJ1c3k9e2J1c3l9XG4gICAgICAgIHQ9e3R9XG4gICAgICAvPlxuICAgIClcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWVkaXRvclwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNhdmVkLWNvbW1lbnQtbG9jXCI+XG4gICAgICAgIHtjb21tZW50LnBhdGh9XG4gICAgICAgIHtjb21tZW50LmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Y29tbWVudC5saW5lTmV3fWAgOiBjb21tZW50LmxpbmVPbGQgIT09IG51bGwgPyBgIChvbGQ6JHtjb21tZW50LmxpbmVPbGR9KWAgOiAnJ31cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaW5wdXQgZHNkci1zYXZlZC1jb21tZW50LXZpZXdcIj57Y29tbWVudC50ZXh0fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgc2V0VGV4dChjb21tZW50LnRleHQpXG4gICAgICAgICAgc2V0RWRpdGluZyh0cnVlKVxuICAgICAgICB9fT5cbiAgICAgICAgICB7dCgnY29tbWVudC5lZGl0Jyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25EZWxldGUoY29tbWVudC5pZCl9PlxuICAgICAgICAgIHt0KCdjb21tZW50LmRlbGV0ZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBPbmUgQUktcmV2aWV3IGZpbmRpbmcgcmVuZGVyZWQgYXMgYW4gaW5saW5lIGNhcmQgKENvZGV4LXN0eWxlKS4gKi9cbmZ1bmN0aW9uIEZpbmRpbmdDYXJkKHsgZmluZGluZywgdCB9OiB7IGZpbmRpbmc6IFJldmlld0ZpbmRpbmc7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctY2FyZCBkc2RyLWZpbmRpbmctJHtmaW5kaW5nLnByaW9yaXR5fWB9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1oZWFkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItZmluZGluZy10YWcgZHNkci1maW5kaW5nLSR7ZmluZGluZy5wcmlvcml0eX1gfT57ZmluZGluZy5wcmlvcml0eX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLXRpdGxlXCI+e2ZpbmRpbmcudGl0bGV9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1sb2NcIj5cbiAgICAgICAgICB7ZmluZGluZy5maWxlfTp7ZmluZGluZy5saW5lU3RhcnR9e2ZpbmRpbmcubGluZUVuZCAhPT0gZmluZGluZy5saW5lU3RhcnQgPyBgLSR7ZmluZGluZy5saW5lRW5kfWAgOiAnJ31cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICB7ZmluZGluZy5kZXRhaWwgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLWRldGFpbFwiPntmaW5kaW5nLmRldGFpbH08L2Rpdj4gOiBudWxsfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1tZXRhXCI+XG4gICAgICAgIHt0KCdyZXZpZXcuY29uZmlkZW5jZScsIHsgY29uZmlkZW5jZTogZmluZGluZy5jb25maWRlbmNlLnRvRml4ZWQoMikgfSl9XG4gICAgICA8L2Rpdj5cbiAgICAgIHtmaW5kaW5nLnN1Z2dlc3Rpb24gPyA8cHJlIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLXN1Z2dlc3Rpb25cIj57ZmluZGluZy5zdWdnZXN0aW9ufTwvcHJlPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFVuaWZpZWQgZGlmZiB3aXRoIHBlci1odW5rIGFjdGlvbiBiYXJzIGFuZCBpbmxpbmUgY29tbWVudHMgKHdvcmtzcGFjZSBmaWxlcykuICovXG5mdW5jdGlvbiBVbmlmaWVkRGlmZih7XG4gIGRpZmYsXG4gIGh1bmtzLFxuICBidXN5LFxuICBvbkh1bmtBY3Rpb24sXG4gIHQsXG4gIGNvbW1lbnRzLFxuICBjb21tZW50RWRpdG9yLFxuICBjb21tZW50VGV4dCxcbiAgb25Db21tZW50VGV4dCxcbiAgb25PcGVuQ29tbWVudCxcbiAgb25TYXZlQ29tbWVudCxcbiAgb25DYW5jZWxDb21tZW50LFxuICBvbkRlbGV0ZUNvbW1lbnQsXG4gIG9uVXBkYXRlQ29tbWVudCxcbiAgcmVhZE9ubHksXG4gIHBhdGgsXG4gIHJldmlld0ZpbmRpbmdzLFxuICBvbk9wZW5MaW5lLFxuICBqdW1wTGluZSxcbn06IHtcbiAgZGlmZjogc3RyaW5nXG4gIGh1bmtzOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rW11cbiAgYnVzeTogYm9vbGVhblxuICBvbkh1bmtBY3Rpb246IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmspID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG4gIGNvbW1lbnRzPzogUmV2aWV3Q29tbWVudFtdXG4gIGNvbW1lbnRFZGl0b3I/OiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSB8IG51bGxcbiAgY29tbWVudFRleHQ/OiBzdHJpbmdcbiAgb25Db21tZW50VGV4dD86ICh2OiBzdHJpbmcpID0+IHZvaWRcbiAgb25PcGVuQ29tbWVudD86IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB2b2lkXG4gIG9uU2F2ZUNvbW1lbnQ/OiAoKSA9PiB2b2lkXG4gIG9uQ2FuY2VsQ29tbWVudD86ICgpID0+IHZvaWRcbiAgb25EZWxldGVDb21tZW50PzogKGlkOiBzdHJpbmcpID0+IHZvaWRcbiAgb25VcGRhdGVDb21tZW50PzogKGlkOiBzdHJpbmcsIHRleHQ6IHN0cmluZykgPT4gUHJvbWlzZTxib29sZWFuPlxuICAvKiogSGlkZSBwZXItaHVuayBhY3Rpb24gYmFycyAoYnJhbmNoIHNjb3BlIGlzIGEgcmVhZC1vbmx5IGRpZmYpLiAqL1xuICByZWFkT25seT86IGJvb2xlYW5cbiAgLyoqIFJlcG8tcmVsYXRpdmUgZmlsZSBwYXRoIChmb3Igb3Blbi1pbi1lZGl0b3IgYW5kIG1hcmtlcnMpLiAqL1xuICBwYXRoPzogc3RyaW5nXG4gIC8qKiBBSS1yZXZpZXcgZmluZGluZ3MgdG8gbWFyayBvbiBtYXRjaGluZyBsaW5lcy4gKi9cbiAgcmV2aWV3RmluZGluZ3M/OiBSZXZpZXdGaW5kaW5nW11cbiAgLyoqIE9wZW4gdGhlIGZpbGUgYXQgYSBsaW5lIGluIHRoZSB1c2VyJ3MgZWRpdG9yLiAqL1xuICBvbk9wZW5MaW5lPzogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiB2b2lkXG4gIC8qKiBUZW1wb3JhcnkgbGluZSBoaWdobGlnaHQgKGUuZy4ganVtcCBmcm9tIGEgUFIgY29tbWVudCkuICovXG4gIGp1bXBMaW5lPzogbnVtYmVyIHwgbnVsbFxufSkge1xuICBjb25zdCBibG9ja3MgPSBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICBsZXQgaHVua0luZGV4ID0gMFxuICBjb25zdCBlZGl0aW5nS2V5ID0gY29tbWVudEVkaXRvciA/IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gIDogbnVsbFxuICBjb25zdCBmaW5kaW5nc0ZvciA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKTogUmV2aWV3RmluZGluZ1tdID0+IHtcbiAgICBpZiAoIXBhdGggfHwgIXJldmlld0ZpbmRpbmdzIHx8IHJldmlld0ZpbmRpbmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gICAgcmV0dXJuIHJldmlld0ZpbmRpbmdzLmZpbHRlcigoZikgPT4ge1xuICAgICAgaWYgKGYuZmlsZSAhPT0gcGF0aCkgcmV0dXJuIGZhbHNlXG4gICAgICBpZiAobmV3TGluZSAhPT0gbnVsbCkgcmV0dXJuIG5ld0xpbmUgPj0gZi5saW5lU3RhcnQgJiYgbmV3TGluZSA8PSBmLmxpbmVFbmRcbiAgICAgIHJldHVybiBvbGRMaW5lICE9PSBudWxsICYmIG9sZExpbmUgPj0gZi5saW5lU3RhcnQgJiYgb2xkTGluZSA8PSBmLmxpbmVFbmRcbiAgICB9KVxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IHtcbiAgICAgICAgICBjb25zdCBpc0h1bmsgPSBibG9jay5oZWFkPy5raW5kID09PSAnaHVuaydcbiAgICAgICAgICBjb25zdCBodW5rID0gaXNIdW5rID8gaHVua3NbaHVua0luZGV4KytdIDogdW5kZWZpbmVkXG4gICAgICAgICAgY29uc3Qgc3RhcnRzID0gYmxvY2suaGVhZD8ua2luZCA9PT0gJ2h1bmsnID8gaHVua1N0YXJ0cyhibG9jay5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgICAgIGNvbnN0IHJvd3MgPSBpc0h1bmsgPyB1bmlmaWVkUm93c1dpdGhMaW5lcyhibG9jay5yb3dzLCBzdGFydHMub2xkU3RhcnQsIHN0YXJ0cy5uZXdTdGFydCkgOiBbXVxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgIHtpc0h1bmsgJiYgIXJlYWRPbmx5ID8gPEh1bmtUb29sYmFyIGh1bms9e2h1bmt9IGJ1c3k9e2J1c3l9IG9uQWN0aW9uPXtvbkh1bmtBY3Rpb259IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtibG9jay5oZWFkLmtpbmR9YH0+e2Jsb2NrLmhlYWQudGV4dCB8fCAnICd9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAge2lzSHVua1xuICAgICAgICAgICAgICAgID8gcm93cy5tYXAoKHsgcm93LCBvbGRMaW5lLCBuZXdMaW5lIH0sIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke29sZExpbmUgPz8gJ28nfToke25ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93Q29tbWVudHMgPSBjb21tZW50cz8uZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBvbGRMaW5lLCBuZXdMaW5lKSkgPz8gW11cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ3MgPSBmaW5kaW5nc0ZvcihvbGRMaW5lLCBuZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlZGl0aW5nID0gZWRpdGluZ0tleSA9PT0ga2V5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3dBY3Rpb25zID0gcm93LmtpbmQgPT09ICdjdHgnIHx8IHJvdy5raW5kID09PSAnYWRkJyB8fCByb3cua2luZCA9PT0gJ2RlbCdcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ0NscyA9IGZpbmRpbmdzLmxlbmd0aCA+IDAgPyBgIGRzZHItbGluZS1maW5kaW5nIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wZWQgPSBqdW1wTGluZSAhPSBudWxsICYmIChuZXdMaW5lID09PSBqdW1wTGluZSB8fCAobmV3TGluZSA9PT0gbnVsbCAmJiBvbGRMaW5lID09PSBqdW1wTGluZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17cml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9JHtyb3dDb21tZW50cy5sZW5ndGggPiAwID8gJyBkc2RyLWxpbmUtY29tbWVudGVkJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1saW5lLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e25ld0xpbmUgPz8gb2xkTGluZSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bmV3TGluZSA/PyBvbGRMaW5lID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50TGluZSBjb3VudD17cm93Q29tbWVudHMubGVuZ3RofSBvbk9wZW49eygpID0+IG9uT3BlbkNvbW1lbnQ/LihvbGRMaW5lLCBuZXdMaW5lKX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtdGV4dFwiPntyb3cudGV4dCB8fCAnICd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9IHRpdGxlPXtmaW5kaW5nc1swXS50aXRsZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzWzBdLnByaW9yaXR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAxID8gYFx1MDBENyR7ZmluZGluZ3MubGVuZ3RofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cGF0aCAmJiBvbk9wZW5MaW5lICYmIChuZXdMaW5lID8/IG9sZExpbmUpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1vcGVubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbkxpbmUocGF0aCwgbmV3TGluZSA/PyBvbGRMaW5lID8/IDEpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgJiYgcm93Q29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm93Q29tbWVudHMubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17b25VcGRhdGVDb21tZW50ID8/IChhc3luYyAoKSA9PiBmYWxzZSl9IG9uRGVsZXRlPXtvbkRlbGV0ZUNvbW1lbnQgPz8gKCgpID0+IHt9KX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAge2VkaXRpbmcgPyA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dCA/PyAnJ30gb25UZXh0PXtvbkNvbW1lbnRUZXh0ID8/ICgoKSA9PiB7fSl9IG9uU2F2ZT17b25TYXZlQ29tbWVudCA/PyAoKCkgPT4ge30pfSBvbkNhbmNlbD17b25DYW5jZWxDb21tZW50ID8/ICgoKSA9PiB7fSl9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsocmV2aWV3RmluZGluZ3MgPz8gW10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGYpID0+IGYuZmlsZSA9PT0gcGF0aCAmJiBmLmxpbmVTdGFydCA9PT0gKG5ld0xpbmUgPz8gb2xkTGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGYsIGZpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpbmRpbmdDYXJkIGtleT17YCR7Zi5maWxlfToke2YubGluZVN0YXJ0fToke2ZpfWB9IGZpbmRpbmc9e2Z9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgOiBibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICA8L3ByZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbi8qKiBEcmFnIGhhbmRsZSBmb3IgcmVzaXppbmcgdGhlIHBhbmVsIChlYXN0IC8gc291dGggLyBzb3V0aC1lYXN0KS4gKi9cbmZ1bmN0aW9uIFJlc2l6ZUhhbmRsZSh7IG1vZGUsIG9uUmVzaXplIH06IHsgbW9kZTogJ2UnIHwgJ3MnIHwgJ3NlJzsgb25SZXNpemU6IChkeDogbnVtYmVyLCBkeTogbnVtYmVyKSA9PiB2b2lkIH0pIHtcbiAgY29uc3QgbGFzdCA9IHVzZVJlZjx7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsPihudWxsKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YGRzZHItcmVzaXplIGRzZHItcmVzaXplLSR7bW9kZX1gfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFsYXN0LmN1cnJlbnQpIHJldHVyblxuICAgICAgICBjb25zdCBkeCA9IGV2ZW50LmNsaWVudFggLSBsYXN0LmN1cnJlbnQueFxuICAgICAgICBjb25zdCBkeSA9IGV2ZW50LmNsaWVudFkgLSBsYXN0LmN1cnJlbnQueVxuICAgICAgICBsYXN0LmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfVxuICAgICAgICBpZiAoZHggIT09IDAgfHwgZHkgIT09IDApIG9uUmVzaXplKGR4LCBkeSlcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJVcD17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlckNhbmNlbD17KCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSBudWxsXG4gICAgICB9fVxuICAgIC8+XG4gIClcbn1cblxuLyoqIFN0YXR1cyBjaGlwIGNvbG9yIGNsYXNzIGZvciBhIHdvcmtzcGFjZSBjaGFuZ2UuICovXG5mdW5jdGlvbiBjaGlwQ2xhc3Moc3RhdHVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBzID0gc3RhdHVzLnJlcGxhY2UoL1xccy9nLCAnJylcbiAgaWYgKHMuaW5jbHVkZXMoJz8/JykpIHJldHVybiAnZHNkci1jaGlwLXUnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ0EnKSB8fCBzLmluY2x1ZGVzKCdBJykpIHJldHVybiAnZHNkci1jaGlwLWEnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ0QnKSB8fCBzLmluY2x1ZGVzKCdEJykpIHJldHVybiAnZHNkci1jaGlwLWQnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ1InKSB8fCBzLmluY2x1ZGVzKCdSJykpIHJldHVybiAnZHNkci1jaGlwLXInXG4gIHJldHVybiAnZHNkci1jaGlwLW0nXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRTdGF0dXMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFN0YXR1c1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1NUQVRVU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYHN0YXR1cyByZXF1ZXN0IGZhaWxlZDogJHtyZXMuc3RhdHVzfWApXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKSkgYXMgU3RhdHVzUmVzcG9uc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXBwbHlDaGFuZ2VzKGN3ZDogc3RyaW5nLCBhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPEFwcGx5UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQVBQTFlfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIGFjdGlvbiwgcGF0aCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEFwcGx5UmVzcG9uc2Vcbn1cblxuLyoqIEFwcGx5IG9uZSBodW5rIG9mIG9uZSBmaWxlIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpLiAqL1xuYXN5bmMgZnVuY3Rpb24gYXBwbHlIdW5rKGN3ZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogc3RyaW5nKTogUHJvbWlzZTxBcHBseUh1bmtSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9IVU5LX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBwYXRoLCBhY3Rpb24sIGh1bmsgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBBcHBseUh1bmtSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5HaXRBY3Rpb24oY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2NvbW1pdCcgfCAncHVzaCcsIG1lc3NhZ2U/OiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlc3BvbnNlPiB7XG4gIGNvbnN0IHVybCA9IGFjdGlvbiA9PT0gJ2NvbW1pdCcgPyBDT01NSVRfVVJMIDogUFVTSF9VUkxcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYWN0aW9uID09PSAnY29tbWl0JyA/IHsgY3dkLCBtZXNzYWdlIH0gOiB7IGN3ZCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEdpdFJlc3BvbnNlXG59XG5cbi8qKiBMb2NhbCAodW5wdXNoZWQpIGNvbW1pdHMgYWhlYWQgb2YgdGhlIHVwc3RyZWFtLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEhpc3RvcnkoY3dkOiBzdHJpbmcpOiBQcm9taXNlPEhpc3RvcnlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtISVNUT1JZX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWl0czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBIaXN0b3J5UmVzcG9uc2Vcbn1cblxuLyoqIE9uZSBjb21taXQncyB1bmlmaWVkIGRpZmYuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWl0RGlmZihjd2Q6IHN0cmluZywgaGFzaDogc3RyaW5nKTogUHJvbWlzZTxDb21taXREaWZmUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUlUX0RJRkZfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX0maGFzaD0ke2VuY29kZVVSSUNvbXBvbmVudChoYXNoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBkaWZmOiAnJywgZmlsZXM6IFtdLCBhZGRlZDogMCwgZGVsZXRlZDogMCwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIENvbW1pdERpZmZSZXNwb25zZVxufVxuXG4vKiogSW5saW5lIHJldmlldyBjb21tZW50cyBmb3IgdGhlIHdvcmtzcGFjZSAocmVwby1zY29wZWQpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZENvbW1lbnRzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxSZXZpZXdDb21tZW50W10+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUVOVFNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21tZW50czogW10gfSkpKSBhcyBDb21tZW50c1Jlc3BvbnNlXG4gIHJldHVybiBkYXRhLm9rID8gZGF0YS5jb21tZW50cyA6IFtdXG59XG5cbi8qKiBSZXBsYWNlIHRoZSB3aG9sZSBjb21tZW50IGxpc3QgKHNpbmdsZS11c2VyIHJlcGxhY2Ugc2VtYW50aWNzKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDb21tZW50cyhjd2Q6IHN0cmluZywgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChDT01NRU5UU19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgY29tbWVudHMgfSksXG4gIH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UgfSkpKSBhcyBDb21tZW50c1Jlc3BvbnNlXG4gIHJldHVybiBkYXRhLm9rID09PSB0cnVlXG59XG5cbi8qKiBMb2NhbCBicmFuY2ggbmFtZXMgKGZvciB0aGUgQnJhbmNoIHJldmlldyBzY29wZSkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQnJhbmNoZXMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0JSQU5DSEVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgYnJhbmNoZXM6IFtdIH0pKSkgYXMgeyBvazogYm9vbGVhbjsgYnJhbmNoZXM6IHN0cmluZ1tdIH1cbiAgcmV0dXJuIGRhdGEub2sgPyBkYXRhLmJyYW5jaGVzIDogW11cbn1cblxuLyoqIFJ1biBhbiBBSSByZXZpZXcgb3ZlciB0aGUgZ2l2ZW4gc2NvcGUuICovXG5hc3luYyBmdW5jdGlvbiBydW5SZXZpZXcoY3dkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCwgc2NvcGU6ICd1bmNvbW1pdHRlZCcgfCAnYnJhbmNoJyB8ICdjb21taXQnLCBiYXNlPzogc3RyaW5nLCBjb21taXRIYXNoPzogc3RyaW5nKTogUHJvbWlzZTxSZXZpZXdSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChSRVZJRVdfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHNlc3Npb25JZDogc2Vzc2lvbklkID8/IHVuZGVmaW5lZCwgc2NvcGUsIGJhc2UsIGNvbW1pdEhhc2ggfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGZpbmRpbmdzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFJldmlld1Jlc3BvbnNlXG59XG5cbi8qKiBDdXJyZW50IGJyYW5jaCdzIEdpdEh1YiBQUiBjb250ZXh0IChkZWdyYWRlcyBncmFjZWZ1bGx5IHdpdGhvdXQgZ2gpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZFByKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxQclJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1BSX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWVudHM6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUHJSZXNwb25zZVxufVxuXG4vKiogR2l0IHJlcG9zIHVuZGVyIGEgd29ya3NwYWNlIChtdWx0aS1yZXBvIHNlbGVjdG9yKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRSZXBvcyhjd2Q6IHN0cmluZyk6IFByb21pc2U8UmVwb3NSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtSRVBPU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIHJlcG9zOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFJlcG9zUmVzcG9uc2Vcbn1cblxuLyoqIE9wZW4gYSBmaWxlIChvcHRpb25hbGx5IGF0IGEgbGluZSkgaW4gdGhlIHVzZXIncyBlZGl0b3IgdmlhIG9wZW4tZWRpdG9yLiAqL1xuYXN5bmMgZnVuY3Rpb24gb3BlbkluRWRpdG9yKGN3ZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgY29uc3QgYWJzID0gcGF0aC5zdGFydHNXaXRoKCcvJykgfHwgL15bQS1aYS16XTpbXFxcXC9dLy50ZXN0KHBhdGgpID8gcGF0aCA6IGAke2N3ZH0vJHtwYXRofWBcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goT1BFTl9FRElUT1JfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBwYXRoOiBhYnMsIGxpbmUgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyB7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9XG59XG5cbi8qKiBTaG9ydCByZWxhdGl2ZSB0aW1lIGZvciBjb21taXQgcm93cyAoXCJqdXN0IG5vd1wiIC8gXCIzIG1pbiBhZ29cIiAvIFx1MjAyNikuICovXG5mdW5jdGlvbiByZWxhdGl2ZVRpbWUoaXNvOiBzdHJpbmcsIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKChEYXRlLm5vdygpIC0gbmV3IERhdGUoaXNvKS5nZXRUaW1lKCkpIC8gNjAwMDApXG4gIGlmIChtaW51dGVzIDwgMSkgcmV0dXJuIHQoJ3RpbWUubm93JylcbiAgaWYgKG1pbnV0ZXMgPCA2MCkgcmV0dXJuIHQoJ3RpbWUubWludXRlcycsIHsgbjogbWludXRlcyB9KVxuICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKVxuICBpZiAoaG91cnMgPCAyNCkgcmV0dXJuIHQoJ3RpbWUuaG91cnMnLCB7IG46IGhvdXJzIH0pXG4gIHJldHVybiB0KCd0aW1lLmRheXMnLCB7IG46IE1hdGguZmxvb3IoaG91cnMgLyAyNCkgfSlcbn1cblxuLyoqIFRoZW1lLWF3YXJlIGRyb3Bkb3duIHJlcGxhY2luZyBuYXRpdmUgPHNlbGVjdD4gKG5hdGl2ZSBwb3B1cHMgaWdub3JlIHRoZSB0aGVtZSkuICovXG5mdW5jdGlvbiBUaGVtZVNlbGVjdCh7XG4gIHZhbHVlLFxuICBvcHRpb25zLFxuICBvbkNoYW5nZSxcbiAgYXJpYUxhYmVsLFxufToge1xuICB2YWx1ZTogc3RyaW5nXG4gIG9wdGlvbnM6IHsgdmFsdWU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9W11cbiAgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkXG4gIGFyaWFMYWJlbD86IHN0cmluZ1xufSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3Qgcm9vdFJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgY3VycmVudCA9IG9wdGlvbnMuZmluZCgobykgPT4gby52YWx1ZSA9PT0gdmFsdWUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVyblxuICAgIGNvbnN0IGNsb3NlT3V0c2lkZSA9IChldmVudDogUG9pbnRlckV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiAhcm9vdFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBjb25zdCBjbG9zZU9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBjbG9zZU91dHNpZGUpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNsb3NlT25LZXkpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgY2xvc2VPdXRzaWRlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNsb3NlT25LZXkpXG4gICAgfVxuICB9LCBbb3Blbl0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VsXCIgcmVmPXtyb290UmVmfT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItc2VsLXRyaWdnZXJcIlxuICAgICAgICBhcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiXG4gICAgICAgIGFyaWEtZXhwYW5kZWQ9e29wZW59XG4gICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgICAgICAgb25DbGljaz17KCkgPT4gc2V0T3BlbigodikgPT4gIXYpfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC12YWx1ZVwiPntjdXJyZW50Py5sYWJlbCA/PyB2YWx1ZX08L3NwYW4+XG4gICAgICAgIDxJY29uQ2hldnJvbkRvd24gLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJkc2RyLXNlbC1tZW51XCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPXthcmlhTGFiZWx9PlxuICAgICAgICAgIHtvcHRpb25zLm1hcCgob3B0aW9uKSA9PiAoXG4gICAgICAgICAgICA8bGkga2V5PXtvcHRpb24udmFsdWV9IHJvbGU9XCJub25lXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtvcHRpb24udmFsdWUgPT09IHZhbHVlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc2VsLW9wdGlvbiR7b3B0aW9uLnZhbHVlID09PSB2YWx1ZSA/ICcgZHNkci1zZWwtb3B0aW9uLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKG9wdGlvbi52YWx1ZSlcbiAgICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLW9wdGlvbi1tYXJrXCI+e29wdGlvbi52YWx1ZSA9PT0gdmFsdWUgPyA8SWNvbkNoZWNrIC8+IDogbnVsbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtb3B0aW9uLWxhYmVsXCI+e29wdGlvbi5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC91bD5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBEaWZmIGZvbnQgKyBmb250IHNpemUgY29udHJvbHMgKHNoYXJlZCBwcmVmcyBzdG9yZSkuICovXG5mdW5jdGlvbiBEaWZmUmV2aWV3UHJlZnMoeyB0IH06IHsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgcHJlZnMgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwcmVmc1N0b3JlLnN1YnNjcmliZSwgcHJlZnNTdG9yZS5nZXRTbmFwc2hvdClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1maWVsZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1sYWJlbFwiIGlkPVwiZHNkci1wcmVmLWZvbnQtbGFiZWxcIj57dCgnc2V0dGluZ3MuZm9udCcpfTwvc3Bhbj5cbiAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgYXJpYUxhYmVsPXt0KCdzZXR0aW5ncy5mb250Jyl9XG4gICAgICAgICAgdmFsdWU9e3ByZWZzLmZvbnR9XG4gICAgICAgICAgb3B0aW9ucz17Rk9OVF9PUFRJT05TLm1hcCgoZikgPT4gKHsgdmFsdWU6IGYuaWQsIGxhYmVsOiBmLmxhYmVsLnN0YXJ0c1dpdGgoJ2ZvbnQuJykgPyB0KGYubGFiZWwgYXMga2V5b2YgdHlwZW9mIHpoKSA6IGYubGFiZWwgfSkpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZm9udCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuZm9udCA9IGZvbnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWZpZWxkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWxhYmVsXCIgaWQ9XCJkc2RyLXByZWYtc2l6ZS1sYWJlbFwiPnt0KCdzZXR0aW5ncy5zaXplJyl9PC9zcGFuPlxuICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLnNpemUnKX1cbiAgICAgICAgICB2YWx1ZT17U3RyaW5nKHByZWZzLnNpemUpfVxuICAgICAgICAgIG9wdGlvbnM9e1NJWkVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBTdHJpbmcocyksIGxhYmVsOiBgJHtzfXB4YCB9KSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyhzaXplKSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5zaXplID0gTnVtYmVyKHNpemUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSGVhZGVyIGFjdGlvbiAoc2Vzc2lvbiBzY29wZSk6IGJhZGdlICsgb3Blbi5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3QWN0aW9uKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgdXNlU2Vzc2lvbiwgdCB9OiBEaWZmUmV2aWV3QWN0aW9uUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IG5vZGVzID0gdXNlU2Vzc2lvbigocykgPT4gcy5ub2RlcylcbiAgY29uc3QgY2hhbmdlQ291bnQgPSB1c2VNZW1vKCgpID0+IGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXMpLCBbbm9kZXNdKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBvcGVuT3ZlcmxheSA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWIgPSBvdmVybGF5U3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHNldE9wZW4ob3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KCkub3BlbilcbiAgICB9KVxuICAgIHJldHVybiB1bnN1YlxuICB9LCBbXSlcblxuICBpZiAoIWN3ZCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItdHJpZ2dlclwiIGFyaWEtbGFiZWw9e3QoJ2FjdGlvbi5hcmlhJyl9IG9uQ2xpY2s9e29wZW5PdmVybGF5fT5cbiAgICAgIDxJY29uRGlmZiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1sYWJlbFwiPnt0KCdhY3Rpb24ubGFiZWwnKX08L3NwYW4+XG4gICAgICB7Y2hhbmdlQ291bnQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiPntjaGFuZ2VDb3VudH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtvcGVuID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlsZSB0cmVlOiBidWlsZCBhIGRpcmVjdG9yeSB0cmVlIGZyb20gZmxhdCBwYXRocyBhbmQgcmVuZGVyIGl0IHdpdGhcbi8vIGNvbGxhcHNpYmxlIGZvbGRlcnMgKHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHJldmlldyBzdXJmYWNlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIFRyZWVEaXI8VD4gPSB7IGtpbmQ6ICdkaXInOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY2hpbGRyZW46IFRyZWVOb2RlPFQ+W10gfVxudHlwZSBUcmVlTGVhZjxUPiA9IHsga2luZDogJ2xlYWYnOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgaXRlbTogVCB9XG50eXBlIFRyZWVOb2RlPFQ+ID0gVHJlZURpcjxUPiB8IFRyZWVMZWFmPFQ+XG5cbi8qKiBUdXJuIGEgZmxhdCBpdGVtIGxpc3QgaW50byBhIHNvcnRlZCBkaXJlY3RvcnkgdHJlZSAoZGlyZWN0b3JpZXMgZmlyc3QpLiAqL1xuZnVuY3Rpb24gYnVpbGRGaWxlVHJlZTxUPihpdGVtczogcmVhZG9ubHkgVFtdLCBwYXRoT2Y6IChpdGVtOiBUKSA9PiBzdHJpbmcpOiBUcmVlTm9kZTxUPltdIHtcbiAgY29uc3Qgcm9vdDogVHJlZU5vZGU8VD5bXSA9IFtdXG4gIGNvbnN0IGRpckluZGV4ID0gbmV3IE1hcDxzdHJpbmcsIFRyZWVEaXI8VD4+KClcbiAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgY29uc3QgcGF0aCA9IHBhdGhPZihpdGVtKVxuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDApIGNvbnRpbnVlXG4gICAgbGV0IHNpYmxpbmdzID0gcm9vdFxuICAgIGxldCBwcmVmaXggPSAnJ1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBwcmVmaXggPSBwcmVmaXggPyBgJHtwcmVmaXh9LyR7cGFydHNbaV19YCA6IHBhcnRzW2ldXG4gICAgICBsZXQgZGlyID0gZGlySW5kZXguZ2V0KHByZWZpeClcbiAgICAgIGlmICghZGlyKSB7XG4gICAgICAgIGRpciA9IHsga2luZDogJ2RpcicsIG5hbWU6IHBhcnRzW2ldLCBwYXRoOiBwcmVmaXgsIGNoaWxkcmVuOiBbXSB9XG4gICAgICAgIGRpckluZGV4LnNldChwcmVmaXgsIGRpcilcbiAgICAgICAgc2libGluZ3MucHVzaChkaXIpXG4gICAgICB9XG4gICAgICBzaWJsaW5ncyA9IGRpci5jaGlsZHJlblxuICAgIH1cbiAgICBzaWJsaW5ncy5wdXNoKHsga2luZDogJ2xlYWYnLCBuYW1lOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSwgcGF0aCwgaXRlbSB9KVxuICB9XG4gIGNvbnN0IHNvcnROb2RlcyA9IChub2RlczogVHJlZU5vZGU8VD5bXSk6IHZvaWQgPT4ge1xuICAgIG5vZGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLmtpbmQgIT09IGIua2luZCkgcmV0dXJuIGEua2luZCA9PT0gJ2RpcicgPyAtMSA6IDFcbiAgICAgIHJldHVybiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpXG4gICAgfSlcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIGlmIChub2RlLmtpbmQgPT09ICdkaXInKSBzb3J0Tm9kZXMobm9kZS5jaGlsZHJlbilcbiAgfVxuICBzb3J0Tm9kZXMocm9vdClcbiAgcmV0dXJuIHJvb3Rcbn1cblxuLyoqIFJlY3Vyc2l2ZSB0cmVlIHJlbmRlcmVyOiBjb2xsYXBzaWJsZSBkaXJlY3RvcmllcyArIGxlYWYgcm93cy4gKi9cbmZ1bmN0aW9uIEZpbGVUcmVlVmlldzxUPihwcm9wczoge1xuICBub2RlczogVHJlZU5vZGU8VD5bXVxuICBjb2xsYXBzZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz5cbiAgb25Ub2dnbGVEaXI6IChwYXRoOiBzdHJpbmcpID0+IHZvaWRcbiAgZGVwdGg6IG51bWJlclxuICByZW5kZXJMZWFmOiAobGVhZjogVHJlZUxlYWY8VD4pID0+IFJlYWN0Tm9kZVxufSk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IHsgbm9kZXMsIGNvbGxhcHNlZCwgb25Ub2dnbGVEaXIsIGRlcHRoLCByZW5kZXJMZWFmIH0gPSBwcm9wc1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7bm9kZXMubWFwKChub2RlKSA9PlxuICAgICAgICBub2RlLmtpbmQgPT09ICdkaXInID8gKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9PlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1kaXIke2NvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/ICcnIDogJyBkc2RyLWRpci1vcGVuJ31gfVxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nTGVmdDogZGVwdGggKiAxNCArIDggfX1cbiAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25Ub2dnbGVEaXIobm9kZS5wYXRoKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY2FyZXRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJ1x1MjVCOCcgOiAnXHUyNUJFJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLW5hbWVcIiB0aXRsZT17bm9kZS5wYXRofT57bm9kZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY291bnRcIj57bm9kZS5jaGlsZHJlbi5sZW5ndGh9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/IChcbiAgICAgICAgICAgICAgPEZpbGVUcmVlVmlldyBub2Rlcz17bm9kZS5jaGlsZHJlbn0gY29sbGFwc2VkPXtjb2xsYXBzZWR9IG9uVG9nZ2xlRGlyPXtvblRvZ2dsZURpcn0gZGVwdGg9e2RlcHRoICsgMX0gcmVuZGVyTGVhZj17cmVuZGVyTGVhZn0gLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9IHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0IH19PntyZW5kZXJMZWFmKG5vZGUpfTwvZGl2PlxuICAgICAgICApLFxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnZlcnNhdGlvbiBjYXJkIChzZXNzaW9uIHNjb3BlKTogdGhlIGNhcnJpZWQgcmV2aWV3IHBhY2thZ2UgcmVuZGVycyBpbiB0aGVcbi8vIHRyYW5zY3JpcHQgYXMgYSBDb2RleC1zdHlsZSBjYXJkIFx1MjAxNCBlYWNoIGNvbW1lbnQgY2xpY2thYmxlIHRvIGp1bXAgdG8gdGhlXG4vLyBtYXRjaGluZyBjaGFuZ2UgYmxvY2sgaW4gdGhlIHJldmlldyBwYW5lbC4gVGhlIHVzZXItbm9kZSByZW5kZXJlciBpc1xuLy8gc2hhZG93ZWQgYXQgcHJpb3JpdHkgLTE7IG5vbi1wYWNrYWdlIG1lc3NhZ2VzIGZhbGwgYmFjayB0byBhIG5hdGl2ZS1sb29rXG4vLyBidWJibGUgKHRoZSBzaGVsbCdzIG93biByZW5kZXJlciBjYW5ub3QgYmUgZGVsZWdhdGVkIHRvLCBiZWNhdXNlIHRoZSBzbG90XG4vLyBoYW5kcyBvdXIgbmFtZXNwYWNlLWJvdW5kIGB0YCB0byB3aGF0ZXZlciBjb21wb25lbnQgd2lucyB0aGUgY2VsbCkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFN0cnVjdHVyYWwgdXNlciBjb250ZW50IGJsb2NrIChDb250ZW50QmxvY2sgaXMgbm90IGV4cG9ydGVkIGZyb20gcnVudGltZSkuICovXG50eXBlIFVzZXJCbG9jayA9IHsgdHlwZTogc3RyaW5nOyB0ZXh0Pzogc3RyaW5nOyBhdHRhY2htZW50PzogSW1hZ2VBdHRhY2htZW50UmVmIH1cblxuLyoqIFBsYWluIHRleHQgb2YgYSB1c2VyIG1lc3NhZ2UncyBjb250ZW50IGJsb2NrcyAodGV4dCBibG9ja3MgY29uY2F0ZW5hdGVkKS4gKi9cbmZ1bmN0aW9uIHVzZXJNZXNzYWdlVGV4dChjb250ZW50OiByZWFkb25seSBVc2VyQmxvY2tbXSk6IHN0cmluZyB7XG4gIGxldCBvdXQgPSAnJ1xuICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbnRlbnQpIHtcbiAgICBpZiAoYmxvY2sudHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiBibG9jay50ZXh0ID09PSAnc3RyaW5nJykgb3V0ICs9IGJsb2NrLnRleHRcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBGdWxsIHByb3BzIG9mIG91ciBzaGFkb3dlZCB1c2VyLW5vZGUgcmVuZGVyZXIgKHQgYm91bmQgdG8gb3VyIG5hbWVzcGFjZSkuICovXG50eXBlIFVzZXJSZXZpZXdOb2RlUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5jaGF0Lm5vZGUnLCAndXNlcic+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5cbi8qKiBUcmFuc2xhdG9yIGJvdW5kIHRvIHRoZSBwbHVnaW4gbmFtZXNwYWNlIChzaGFyZWQgYnkgdGhlIGNhcmQvYnViYmxlKS4gKi9cbnR5cGUgQ2FyZFQgPSBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPlsndCddXG5cbi8qKiBHcm91cCBjb21tZW50cyBieSBwYXRoLCBwcmVzZXJ2aW5nIGZpcnN0LXNlZW4gb3JkZXIuICovXG5mdW5jdGlvbiBncm91cENvbW1lbnRzKGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdKTogeyBwYXRoOiBzdHJpbmc7IGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdIH1bXSB7XG4gIGNvbnN0IGdyb3VwczogeyBwYXRoOiBzdHJpbmc7IGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdIH1bXSA9IFtdXG4gIGNvbnN0IGluZGV4ID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKVxuICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICBsZXQgZyA9IGluZGV4LmdldChjLnBhdGgpXG4gICAgaWYgKGcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZyA9IGdyb3Vwcy5sZW5ndGhcbiAgICAgIGluZGV4LnNldChjLnBhdGgsIGcpXG4gICAgICBncm91cHMucHVzaCh7IHBhdGg6IGMucGF0aCwgY29tbWVudHM6IFtdIH0pXG4gICAgfVxuICAgIGdyb3Vwc1tnXS5jb21tZW50cy5wdXNoKGMpXG4gIH1cbiAgcmV0dXJuIGdyb3Vwc1xufVxuXG5mdW5jdGlvbiBJY29uRmlsZSgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTQgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjh6XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNMTQgMnY2aDZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBDb2RleC1zdHlsZSByZXZpZXcgY2FyZCBmb3IgYSBjYXJyaWVkIHJldmlldyBwYWNrYWdlIG1lc3NhZ2UuICovXG5mdW5jdGlvbiBSZXZpZXdQYWNrYWdlQ2FyZCh7IHBrZywgY3dkLCB0IH06IHsgcGtnOiBSZXZpZXdQYWNrYWdlOyBjd2Q/OiBzdHJpbmc7IHQ6IENhcmRUIH0pIHtcbiAgY29uc3QgdGFyZ2V0Q3dkID0gcGtnLndvcmtzcGFjZSA/PyBjd2QgPz8gbnVsbFxuICBjb25zdCBqdW1wID0gKHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlcikgPT4ge1xuICAgIGlmICghdGFyZ2V0Q3dkKSByZXR1cm5cbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IHRhcmdldEN3ZFxuICAgICAgZC5mb2N1cyA9IHsgcGF0aCwgbGluZSB9XG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cbiAgY29uc3QgZ3JvdXBzID0gdXNlTWVtbygoKSA9PiBncm91cENvbW1lbnRzKHBrZy5jb21tZW50cyksIFtwa2cuY29tbWVudHNdKVxuICBjb25zdCBzaG93VmVyZGljdCA9IHBrZy52ZXJkaWN0ICE9PSBudWxsIHx8IHBrZy5maW5kaW5ncy5sZW5ndGggPiAwXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkXCIgZGF0YS10aW1lLWhvdmVyLXJvb3Q+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtaGVhZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWJhZGdlXCI+PEljb25Db21tZW50IC8+e3QoJ3Jldmlldy5jYXJkVGl0bGUnKX08L3NwYW4+XG4gICAgICAgIHt0YXJnZXRDd2QgPyAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC13b3Jrc3BhY2VcIiB0aXRsZT17dGFyZ2V0Q3dkfT57dGFyZ2V0Q3dkfTwvc3Bhbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAge3BrZy5jb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtbWV0YVwiPnt0KCdyZXZpZXcuY2FyZENvbW1lbnRzJywgeyBuOiBwa2cuY29tbWVudHMubGVuZ3RoIH0pfTwvc3Bhbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIHtncm91cHMubWFwKChnKSA9PiAoXG4gICAgICAgIDxkaXYga2V5PXtnLnBhdGh9IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZ3JvdXBcIj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLXBhdGhcIiB0aXRsZT17dCgncmV2aWV3LmNhcmRPcGVuRmlsZScpfSBvbkNsaWNrPXsoKSA9PiBqdW1wKGcucGF0aCl9PlxuICAgICAgICAgICAgPEljb25GaWxlIC8+PHNwYW4+e2cucGF0aH08L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAge2cuY29tbWVudHMubWFwKChjLCBpKSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtaXRlbVwiXG4gICAgICAgICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuY2FyZEp1bXAnKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ganVtcChjLnBhdGgsIGMubGluZSA/PyB1bmRlZmluZWQpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWxvY1wiPntjLmxpbmUgIT09IG51bGwgPyBgJHtjLnBhdGh9OiR7Yy5saW5lfWAgOiBgJHtjLnBhdGh9IChvbGQpYH08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtdGV4dFwiPntjLnRleHR9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSl9XG4gICAgICB7c2hvd1ZlcmRpY3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LXNlY1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LWhlYWRcIj5cbiAgICAgICAgICAgIDxzcGFuPnt0KCdyZXZpZXcuY2FyZFZlcmRpY3QnKX08L3NwYW4+XG4gICAgICAgICAgICB7cGtnLnZlcmRpY3QgPyAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItcmV2aWV3LWNhcmQtdmVyZGljdCBkc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtJHtwa2cudmVyZGljdH1gfT5cbiAgICAgICAgICAgICAgICB7cGtnLnZlcmRpY3QgPT09ICdjb3JyZWN0JyA/IHQoJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCcpIDogdCgncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnKX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3BrZy5maW5kaW5ncy5tYXAoKGY6IFJldmlld1BhY2thZ2VGaW5kaW5nLCBpOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWZpbmRpbmdcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLXRhZyBkc2RyLWZpbmRpbmctJHtmLnByaW9yaXR5fWB9PntmLnByaW9yaXR5fTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1maW5kaW5nLXRleHRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWZpbmRpbmctbG9jXCI+e2YuZmlsZX06e2YubGluZX08L3NwYW4+eycgJ31cbiAgICAgICAgICAgICAgICB7Zi50aXRsZX17Zi5kZXRhaWwgPyBgIFx1MjAxNCAke2YuZGV0YWlsfWAgOiAnJ31cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZm9vdFwiPnt0KCdyZXZpZXcuY2FyZEhpbnQnKX08L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogTmF0aXZlLWxvb2sgZmFsbGJhY2sgYnViYmxlIGZvciBvcmRpbmFyeSB1c2VyIG1lc3NhZ2VzIChzaGFkb3dlZCBjZWxsKS4gKi9cbmZ1bmN0aW9uIEZhbGxiYWNrVXNlckJ1YmJsZSh7XG4gIHRleHQsXG4gIGltYWdlcyxcbiAgbG9hZEltYWdlLFxuICB0LFxufToge1xuICB0ZXh0OiBzdHJpbmdcbiAgaW1hZ2VzOiByZWFkb25seSAoVXNlckJsb2NrICYgeyBhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYgfSlbXVxuICBsb2FkSW1hZ2U6IChhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYpID0+IFByb21pc2U8c3RyaW5nPlxuICB0OiBDYXJkVFxufSkge1xuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IG9uQ29weSA9ICgpID0+IHtcbiAgICB2b2lkIHdyaXRlQ2xpcGJvYXJkKHRleHQpLnRoZW4oKG9rKSA9PiB7XG4gICAgICBpZiAoIW9rKSByZXR1cm5cbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxMDAwKVxuICAgIH0pXG4gIH1cbiAgY29uc3QgbGFiZWxzID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoe1xuICAgICAgaW1hZ2U6IHQoJ2ZhbGxiYWNrLmltYWdlJyksXG4gICAgICBvcGVuOiB0KCdmYWxsYmFjay5vcGVuJyksXG4gICAgICBvcGVuTmFtZWQ6IChuYW1lOiBzdHJpbmcpID0+IHQoJ2ZhbGxiYWNrLm9wZW5OYW1lZCcsIHsgbmFtZSB9KSxcbiAgICAgIGxvYWRpbmc6IHQoJ2ZhbGxiYWNrLmxvYWRpbmcnKSxcbiAgICAgIGxvYWRGYWlsZWQ6IHQoJ2ZhbGxiYWNrLmxvYWRGYWlsZWQnKSxcbiAgICAgIGxpZ2h0Ym94OiB7IGRpYWxvZzogdCgnZmFsbGJhY2subGlnaHRib3hEaWFsb2cnKSwgY2xvc2U6IHQoJ2ZhbGxiYWNrLmxpZ2h0Ym94Q2xvc2UnKSB9LFxuICAgIH0pLFxuICAgIFt0XSxcbiAgKVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyXCIgZGF0YS10aW1lLWhvdmVyLXJvb3Q+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmFsbGJhY2stdXNlci1zdGFja1wiPlxuICAgICAgICB7aW1hZ2VzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgPEltYWdlR2FsbGVyeSBpbWFnZXM9e2ltYWdlc30gbG9hZD17bG9hZEltYWdlfSBhbGlnbj1cImVuZFwiIGxhYmVscz17bGFiZWxzfSAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge3RleHQgIT09ICcnID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyLXJvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXItYnViYmxlXCI+e3RleHR9PC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXItY29weVwiIHRpdGxlPXt0KCdyZXZpZXcuY29weScpfSBvbkNsaWNrPXtvbkNvcHl9PlxuICAgICAgICAgICAgICB7Y29waWVkID8gdCgncmV2aWV3LmNvcGllZCcpIDogPEljb25Db3B5IC8+fVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNvcHkoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cmVjdCB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB4PVwiOFwiIHk9XCI4XCIgcng9XCIyXCIgcnk9XCIyXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKipcbiAqIFVzZXItbm9kZSByZW5kZXJlciBzaGFkb3c6IGNhcnJpZWQgcmV2aWV3IHBhY2thZ2VzIHJlbmRlciBhcyBhIGNhcmQ7XG4gKiBldmVyeXRoaW5nIGVsc2UgcmVuZGVycyBhcyBhIG5hdGl2ZS1sb29rIGJ1YmJsZS5cbiAqL1xuZnVuY3Rpb24gVXNlclJldmlld05vZGVWaWV3KHByb3BzOiBVc2VyUmV2aWV3Tm9kZVByb3BzKSB7XG4gIGNvbnN0IGNvbnRlbnQgPSB1c2VNZW1vKCgpID0+IHByb3BzLm5vZGUuZGF0YS5jb250ZW50IGFzIHJlYWRvbmx5IFVzZXJCbG9ja1tdLCBbcHJvcHMubm9kZS5kYXRhLmNvbnRlbnRdKVxuICBjb25zdCB0ZXh0ID0gdXNlTWVtbygoKSA9PiB1c2VyTWVzc2FnZVRleHQoY29udGVudCksIFtjb250ZW50XSlcbiAgY29uc3QgaW1hZ2VzID0gdXNlTWVtbyhcbiAgICAoKSA9PiBjb250ZW50LmZpbHRlcigoYik6IGIgaXMgVXNlckJsb2NrICYgeyBhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYgfSA9PiBiLnR5cGUgPT09ICdpbWFnZScgJiYgYi5hdHRhY2htZW50ICE9PSB1bmRlZmluZWQpLFxuICAgIFtjb250ZW50XSxcbiAgKVxuICBjb25zdCBwa2cgPSB1c2VNZW1vKCgpID0+IChpc1Jldmlld1BhY2thZ2VUZXh0KHRleHQpID8gcGFyc2VSZXZpZXdQYWNrYWdlKHRleHQpIDogbnVsbCksIFt0ZXh0XSlcbiAgaWYgKHBrZykge1xuICAgIHJldHVybiA8UmV2aWV3UGFja2FnZUNhcmQgcGtnPXtwa2d9IGN3ZD17cHJvcHMuY3dkfSB0PXtwcm9wcy50fSAvPlxuICB9XG4gIHJldHVybiA8RmFsbGJhY2tVc2VyQnViYmxlIHRleHQ9e3RleHR9IGltYWdlcz17aW1hZ2VzfSBsb2FkSW1hZ2U9e3Byb3BzLmxvYWRJbWFnZX0gdD17cHJvcHMudH0gLz5cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb21wb3NlciBkb2NrIChzZXNzaW9uIHNjb3BlKTogcGVuZGluZyBpbmxpbmUgY29tbWVudHMgZmxvYXQgYWJvdmUgdGhlXG4vLyBpbnB1dCBib3gsIENvZGV4LXN0eWxlIFx1MjAxNCBob3ZlciB0aGUgcGlsbCB0byBwcmV2aWV3LCBjbGljayBzZW5kIHRvIGluamVjdC5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIERpZmZSZXZpZXdDb21wb3NlckRvY2tQcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLmlucHV0LmRvY2snPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYgeyBzZXNzaW9uczogSVNlc3Npb25zIH1cblxuZnVuY3Rpb24gRGlmZlJldmlld0NvbXBvc2VyRG9jayh7IHNlc3Npb25JZCwgdXNlU2Vzc2lvbnMsIHVzZVNlc3Npb24sIHNlc3Npb25zLCBpbnB1dCwgdCB9OiBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IHBlbmRpbmcgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwZW5kaW5nQ29tbWVudHNTdG9yZS5zdWJzY3JpYmUsIHBlbmRpbmdDb21tZW50c1N0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBbZGlzbWlzc2VkLCBzZXREaXNtaXNzZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYXJyeUZsYXNoLCBzZXRDYXJyeUZsYXNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGNhcnJpZWRJZHMgPSB1c2VSZWY8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgY2FycnlpbmcgPSB1c2VSZWYoZmFsc2UpXG5cbiAgLy8gU2VlZCB0aGUgc3RvcmUgZnJvbSBzZXJ2ZXIgc3RvcmFnZSB3aGVuIG5vdGhpbmcgaGFzIGJlZW4gc3luY2VkIGZvciB0aGlzXG4gIC8vIHdvcmtzcGFjZSB5ZXQgKHBhbmVsIG5ldmVyIG9wZW5lZCB0aGlzIHNlc3Npb24gXHUyMDE0IGNvbW1lbnRzIHBlcnNpc3QgaW4gLmdpdCkuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFjd2QgfHwgcGVuZGluZy5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCBsb2FkQ29tbWVudHMoY3dkKS50aGVuKChsaXN0KSA9PiB7XG4gICAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm5cbiAgICAgIHBlbmRpbmdDb21tZW50c1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICBpZiAoZC5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgICAgIGQuY3dkID0gY3dkXG4gICAgICAgIGQuY29tbWVudHMgPSBsaXN0XG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbY3dkLCBwZW5kaW5nLmN3ZF0pXG5cbiAgY29uc3QgY29tbWVudHMgPSBwZW5kaW5nLmN3ZCA9PT0gY3dkID8gcGVuZGluZy5jb21tZW50cyA6IFtdXG4gIGNvbnN0IHNlbnRTbmFwID0gdXNlU3luY0V4dGVybmFsU3RvcmUoc2VudFN0b3JlLnN1YnNjcmliZSwgc2VudFN0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBzZW50ID0gKGN3ZCAmJiBzZW50U25hcFtjd2RdKSB8fCB7IHNlbnRDb21tZW50SWRzOiBbXSwgc2VudFJldmlld0tleTogbnVsbCB9XG4gIGNvbnN0IHNlbnRTZXQgPSBuZXcgU2V0KHNlbnQuc2VudENvbW1lbnRJZHMpXG4gIGNvbnN0IHVuc2VudENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiAhc2VudFNldC5oYXMoYy5pZCkpXG4gIGNvbnN0IHJldmlld0tleSA9XG4gICAgcGVuZGluZy5yZXZpZXc/Lm9rICYmIChwZW5kaW5nLnJldmlldy5maW5kaW5ncy5sZW5ndGggPiAwIHx8IHBlbmRpbmcucmV2aWV3LnZlcmRpY3QpXG4gICAgICA/IGAke3BlbmRpbmcucmV2aWV3LnZlcmRpY3QgPz8gJyd9OiR7cGVuZGluZy5yZXZpZXcuZmluZGluZ3MubGVuZ3RofToke3BlbmRpbmcucmV2aWV3LmZpbmRpbmdzWzBdPy50aXRsZSA/PyAnJ31gXG4gICAgICA6IG51bGxcbiAgY29uc3QgcmV2aWV3UGVuZGluZyA9IHJldmlld0tleSAhPT0gbnVsbCAmJiByZXZpZXdLZXkgIT09IHNlbnQuc2VudFJldmlld0tleVxuICBjb25zdCBoYXNQZW5kaW5nID0gdW5zZW50Q29tbWVudHMubGVuZ3RoID4gMCB8fCByZXZpZXdQZW5kaW5nXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWhhc1BlbmRpbmcpIHtcbiAgICAgIHNldERpc21pc3NlZChmYWxzZSlcbiAgICB9XG4gIH0sIFtoYXNQZW5kaW5nXSlcblxuICAvKiogQ29tcG9zZSB0aGUgZnVsbCByZXZpZXcgcGFja2FnZTogY29tbWVudHMgKyB0aGVpciBkaWZmIGh1bmtzICsgQUkgdmVyZGljdC4gKi9cbiAgY29uc3QgY29tcG9zZUNhcnJpZWRNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gWydcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLCBgXHU1REU1XHU0RjVDXHU1MzNBXHVGRjFBJHtjd2R9YCwgJyddXG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0NvbW1lbnRbXT4oKVxuICAgIGZvciAoY29uc3QgYyBvZiB1bnNlbnRDb21tZW50cykge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoYy5wYXRoKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChjKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGMucGF0aCwgW2NdKVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBjIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhdGh9JHthbmNob3J9OiAke2MudGV4dH1gKVxuICAgICAgfVxuICAgICAgY29uc3QgaHVua3MgPSBodW5rc0ZvckxpbmVzKHBlbmRpbmcuZGlmZnNbcGF0aF0gPz8gJycsIGxpc3QubWFwKChjKSA9PiBjLmxpbmVOZXcgPz8gYy5saW5lT2xkKSlcbiAgICAgIGlmIChodW5rcykge1xuICAgICAgICBsaW5lcy5wdXNoKCdgYGBkaWZmJylcbiAgICAgICAgbGluZXMucHVzaChodW5rcylcbiAgICAgICAgbGluZXMucHVzaCgnYGBgJylcbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpXG4gICAgfVxuICAgIGlmIChyZXZpZXdQZW5kaW5nICYmIHBlbmRpbmcucmV2aWV3KSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkEnKVxuICAgICAgbGluZXMucHVzaChwZW5kaW5nLnJldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/ICdcdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OThcdUZGMDhQYXRjaCBpcyBpbmNvcnJlY3RcdUZGMDknIDogJ1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RVx1RkYwOFBhdGNoIGlzIGNvcnJlY3RcdUZGMDknKVxuICAgICAgZm9yIChjb25zdCBmIG9mIHBlbmRpbmcucmV2aWV3LmZpbmRpbmdzKSB7XG4gICAgICAgIGxpbmVzLnB1c2goYC0gWyR7Zi5wcmlvcml0eX1dICR7Zi5maWxlfToke2YubGluZVN0YXJ0fSR7Zi5saW5lRW5kICE9PSBmLmxpbmVTdGFydCA/IGAtJHtmLmxpbmVFbmR9YCA6ICcnfSAke2YudGl0bGV9IFx1MjAxNCAke2YuZGV0YWlsfWApXG4gICAgICAgIGlmIChmLnN1Z2dlc3Rpb24pIGxpbmVzLnB1c2goYCAgXFxgXFxgXFxgXFxuJHtmLnN1Z2dlc3Rpb259XFxuICBcXGBcXGBcXGBgKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykuc2xpY2UoMCwgMTYwMDApXG4gIH1cblxuICAvLyBDb2RleC1zdHlsZSBhdXRvLWNhcnJ5OiB3aGVuIHRoZSB1c2VyIHN1Ym1pdHMgYSBtZXNzYWdlIHdoaWxlIGNvbW1lbnRzIGFyZVxuICAvLyBwZW5kaW5nLCBxdWV1ZSB0aGUgZnVsbCByZXZpZXcgcGFja2FnZSByaWdodCBiZWhpbmQgaXQgKG5vIHNlbmQgYnV0dG9uKS5cbiAgLyoqIE1hcmsgdGhlIGNhcnJpZWQgaXRlbXMgYXMgc2VudCBzbyB0aGV5IGFyZSBuZXZlciByZS1zZW50IChwZXJzaXN0ZWQgcGVyIGN3ZCkuICovXG4gIGNvbnN0IG1hcmtTZW50ID0gKCkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBjb25zdCBjYXJyaWVkSWRzID0gdW5zZW50Q29tbWVudHMubWFwKChjKSA9PiBjLmlkKVxuICAgIHNlbnRTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGNvbnN0IHByZXYgPSBkW2N3ZF0gPz8geyBzZW50Q29tbWVudElkczogW10sIHNlbnRSZXZpZXdLZXk6IG51bGwgfVxuICAgICAgZFtjd2RdID0ge1xuICAgICAgICBzZW50Q29tbWVudElkczogWy4uLm5ldyBTZXQoWy4uLnByZXYuc2VudENvbW1lbnRJZHMsIC4uLmNhcnJpZWRJZHNdKV0sXG4gICAgICAgIHNlbnRSZXZpZXdLZXk6IHJldmlld1BlbmRpbmcgPyByZXZpZXdLZXkgOiBwcmV2LnNlbnRSZXZpZXdLZXksXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHBoYXNlID0gaW5wdXQ/LnBoYXNlXG4gIGNvbnN0IHJ1bm5pbmcgPSB1c2VTZXNzaW9uKChzKSA9PiBzLnJ1bm5pbmcpXG4gIGNvbnN0IHVzZXJDb3VudCA9IHVzZVNlc3Npb24oKHMpID0+IHMubm9kZXMuZmlsdGVyKChuKSA9PiBuLmtpbmQgPT09ICd1c2VyJykubGVuZ3RoKVxuICBjb25zdCBwcmV2UnVubmluZyA9IHVzZVJlZihydW5uaW5nKVxuICBjb25zdCBwcmV2VXNlckNvdW50ID0gdXNlUmVmKHVzZXJDb3VudClcbiAgLyoqIFNlbmQgdGhlIHBlbmRpbmcgcmV2aWV3IHBhY2thZ2Ugbm93IChkb2NrIGJ1dHRvbiBvciBhdXRvLWNhcnJ5KS4gKi9cbiAgY29uc3QgY2FycnkgPSAoKSA9PiB7XG4gICAgaWYgKCFoYXNQZW5kaW5nIHx8IGNhcnJ5aW5nLmN1cnJlbnQpIHJldHVyblxuICAgIGNhcnJ5aW5nLmN1cnJlbnQgPSB0cnVlXG4gICAgdm9pZCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIHNlc3Npb25JZCwgY29tcG9zZUNhcnJpZWRNZXNzYWdlKCkpLnRoZW4oKG91dGNvbWUpID0+IHtcbiAgICAgIGlmIChvdXRjb21lICE9PSAnZmFpbGVkJykgbWFya1NlbnQoKVxuICAgICAgY2FycnlpbmcuY3VycmVudCA9IGZhbHNlXG4gICAgICBzZXRDYXJyeUZsYXNoKG91dGNvbWUgPT09ICdzZW50JyA/IHQoJ3Jldmlldy5zZW50VG9BZ2VudCcpIDogb3V0Y29tZSA9PT0gJ2NvcGllZCcgPyB0KCdyZXZpZXcuY29waWVkRmFsbGJhY2snKSA6IHQoJ3Jldmlldy5zZW5kRmFpbGVkJykpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENhcnJ5Rmxhc2gobnVsbCksIDMyMDApXG4gICAgfSlcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdHVyblN0YXJ0ZWQgPSBwcmV2UnVubmluZy5jdXJyZW50ID09PSBmYWxzZSAmJiBydW5uaW5nID09PSB0cnVlXG4gICAgcHJldlJ1bm5pbmcuY3VycmVudCA9IHJ1bm5pbmdcbiAgICBjb25zdCBuZXdVc2VyTXNnID0gcHJldlVzZXJDb3VudC5jdXJyZW50IDwgdXNlckNvdW50XG4gICAgcHJldlVzZXJDb3VudC5jdXJyZW50ID0gdXNlckNvdW50XG4gICAgY29uc3QgcGhhc2VIaXQgPSBwaGFzZSA9PT0gJ3N1Ym1pdHRpbmcnIHx8IHBoYXNlID09PSAnYWRqdWRpY2F0aW5nJ1xuICAgIGlmICghaGFzUGVuZGluZykgcmV0dXJuXG4gICAgaWYgKCF0dXJuU3RhcnRlZCAmJiAhbmV3VXNlck1zZyAmJiAhcGhhc2VIaXQpIHJldHVyblxuICAgIGNhcnJ5KClcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtydW5uaW5nLCB1c2VyQ291bnQsIHBoYXNlLCBoYXNQZW5kaW5nXSlcblxuICBpZiAoIWN3ZCB8fCAoIWhhc1BlbmRpbmcgJiYgIWNhcnJ5Rmxhc2gpIHx8IGRpc21pc3NlZCkgcmV0dXJuIG51bGxcblxuICAvKiogT3BlbiB0aGUgcmV2aWV3IHBhbmVsIGF0IHRoZSBjb21tZW50J3MgY2hhbmdlIGJsb2NrLiAqL1xuICBjb25zdCBmb2N1c0NvbW1lbnQgPSAoY29tbWVudDogUmV2aWV3Q29tbWVudCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmZvY3VzID0geyBwYXRoOiBjb21tZW50LnBhdGgsIGxpbmU6IGNvbW1lbnQubGluZU5ldyA/PyBjb21tZW50LmxpbmVPbGQgPz8gdW5kZWZpbmVkIH1cbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIC8qKiBPcGVuIHRoZSByZXZpZXcgcGFuZWwgd2l0aG91dCBhIGp1bXAgdGFyZ2V0ICgrTiBjaGlwKS4gKi9cbiAgY29uc3Qgb3BlblBhbmVsID0gKCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmZvY3VzID0gbnVsbFxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZG9ja1wiPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWRvY2staGVhZFwiXG4gICAgICAgIHJvbGU9XCJidXR0b25cIlxuICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5kb2NrU2VuZCcpfVxuICAgICAgICBvbkNsaWNrPXtjYXJyeX1cbiAgICAgICAgb25LZXlEb3duPXsoZSkgPT4ge1xuICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJyB8fCBlLmtleSA9PT0gJyAnKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGNhcnJ5KClcbiAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1pY29uXCI+PEljb25Db21tZW50IC8+PC9zcGFuPlxuICAgICAgICB7Y2FycnlGbGFzaCA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stZmxhc2hcIj57Y2FycnlGbGFzaH08L3NwYW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNvdW50XCI+XG4gICAgICAgICAgICB7dCgncmV2aWV3LmRvY2tDb21tZW50cycsIHsgbjogdW5zZW50Q29tbWVudHMubGVuZ3RoIH0pfVxuICAgICAgICAgICAge3Jldmlld1BlbmRpbmcgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5kb2NrVmVyZGljdCcpfWAgOiAnJ31cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICl9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLXNlbmQtaGludFwiPnt0KCdyZXZpZXcuZG9ja1NlbmQnKX08L3NwYW4+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2xvc2VcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9e3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIHNldERpc21pc3NlZCh0cnVlKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SWNvblggLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIHt1bnNlbnRDb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwc1wiPlxuICAgICAgICAgIHt1bnNlbnRDb21tZW50cy5zbGljZSgwLCBNQVhfRE9DS19DSElQUykubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwXCJcbiAgICAgICAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5kb2NrSnVtcCcpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBmb2N1c0NvbW1lbnQoY29tbWVudCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwLWxvY1wiPntjb21tZW50LnBhdGh9e2NvbW1lbnQubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjb21tZW50LmxpbmVOZXd9YCA6ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNoaXAtdGV4dFwiPntjb21tZW50LnRleHR9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgICAge3Vuc2VudENvbW1lbnRzLmxlbmd0aCA+IE1BWF9ET0NLX0NISVBTID8gKFxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNoaXAtbW9yZVwiIHRpdGxlPXt0KCdyZXZpZXcuZG9ja01vcmUnLCB7IG46IHVuc2VudENvbW1lbnRzLmxlbmd0aCAtIE1BWF9ET0NLX0NISVBTIH0pfSBvbkNsaWNrPXtvcGVuUGFuZWx9PlxuICAgICAgICAgICAgICAre3Vuc2VudENvbW1lbnRzLmxlbmd0aCAtIE1BWF9ET0NLX0NISVBTfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSZXZpZXcgb3ZlcmxheSAocm9vdCBzY29wZSk6IHNlc3Npb24gKyB3b3Jrc3BhY2UgdGFicy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3T3ZlcmxheSh7IHNlc3Npb25zLCB0IH06IERpZmZSZXZpZXdPdmVybGF5UHJvcHMpIHtcbiAgY29uc3Qgc3RvcmVTdGF0ZSA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKG92ZXJsYXlTdG9yZS5zdWJzY3JpYmUsIG92ZXJsYXlTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3QgcHJlZnMgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwcmVmc1N0b3JlLnN1YnNjcmliZSwgcHJlZnNTdG9yZS5nZXRTbmFwc2hvdClcbiAgLy8gR2l0LWZpcnN0OiBsYW5kIG9uIHRoZSB3b3Jrc3BhY2UgdGFiIChzdGFnZWQvdW5zdGFnZWQvYnJhbmNoIHRyZWVzKSBzbyB0aGVcbiAgLy8gY2hhbmdlIHJldmlldyBpcyBvbmUgY2xpY2sgYXdheTsgdGhlIHNlc3Npb24gdGFiIHN0YXlzIGEgY2xpY2sgYXdheS5cbiAgY29uc3QgW3RhYiwgc2V0VGFiXSA9IHVzZVN0YXRlPCdzZXNzaW9uJyB8ICd3b3Jrc3BhY2UnPignd29ya3NwYWNlJylcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gdXNlU3RhdGU8Vmlld01vZGU+KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkc2RyLXZpZXcnKSA9PT0gJ3NwbGl0JyA/ICdzcGxpdCcgOiAnc2luZ2xlJ1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuICdzaW5nbGUnXG4gICAgfVxuICB9KVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZHNkci12aWV3JywgdmlldylcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIHByaXZhdGUgbW9kZSAvIHVuYXZhaWxhYmxlIFx1MjAxNCBub24tZmF0YWxcbiAgICB9XG4gIH0sIFt2aWV3XSlcblxuICAvLyBXb3Jrc3BhY2UgdGFiIHN0YXRlLlxuICBjb25zdCBbc3RhdHVzLCBzZXRTdGF0dXNdID0gdXNlU3RhdGU8U3RhdHVzUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzZWxlY3RlZCwgc2V0U2VsZWN0ZWRdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbm90aWNlLCBzZXROb3RpY2VdID0gdXNlU3RhdGU8eyBraW5kOiAnb2snIHwgJ2Vycm9yJzsgdGV4dDogc3RyaW5nIH0gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29uZmlybSwgc2V0Q29uZmlybV0gPSB1c2VTdGF0ZTwnZmlsZScgfCAnYWxsJyB8ICdwdXNoJyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXRNZXNzYWdlLCBzZXRDb21taXRNZXNzYWdlXSA9IHVzZVN0YXRlKCcnKVxuICAvLyBMb2NhbCAodW5wdXNoZWQpIGNvbW1pdCBoaXN0b3J5OiBsaXN0ICsgcGVyLWNvbW1pdCBkaWZmIHZpZXcuXG4gIGNvbnN0IFtoaXN0b3J5LCBzZXRIaXN0b3J5XSA9IHVzZVN0YXRlPENvbW1pdEluZm9bXT4oW10pXG4gIGNvbnN0IFtzZWxlY3RlZENvbW1pdCwgc2V0U2VsZWN0ZWRDb21taXRdID0gdXNlU3RhdGU8Q29tbWl0SW5mbyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXREaWZmLCBzZXRDb21taXREaWZmXSA9IHVzZVN0YXRlPENvbW1pdERpZmZSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXREaWZmTG9hZGluZywgc2V0Q29tbWl0RGlmZkxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZWxlY3RlZENvbW1pdEZpbGUsIHNldFNlbGVjdGVkQ29tbWl0RmlsZV0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBJbmxpbmUgcmV2aWV3IGNvbW1lbnRzICh3b3Jrc3BhY2UgdGFiLCBzaW5nbGUgdmlldykuXG4gIGNvbnN0IFtjb21tZW50cywgc2V0Q29tbWVudHNdID0gdXNlU3RhdGU8UmV2aWV3Q29tbWVudFtdPihbXSlcbiAgY29uc3QgW2NvbW1lbnRFZGl0b3IsIHNldENvbW1lbnRFZGl0b3JdID0gdXNlU3RhdGU8eyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWVudFRleHQsIHNldENvbW1lbnRUZXh0XSA9IHVzZVN0YXRlKCcnKVxuICAvLyBSZXZpZXcgc2NvcGU6IHdoaWNoIHNsaWNlIG9mIHRoZSByZXBvc2l0b3J5IHRoZSB3b3Jrc3BhY2UgdGFiIHNob3dzLlxuICBjb25zdCBbc2NvcGUsIHNldFNjb3BlXSA9IHVzZVN0YXRlPFdvcmtzcGFjZVNjb3BlPignYWxsJylcbiAgY29uc3QgW2JyYW5jaGVzLCBzZXRCcmFuY2hlc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oW10pXG4gIGNvbnN0IFtiYXNlQnJhbmNoLCBzZXRCYXNlQnJhbmNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtiYXNlU3RhdHVzLCBzZXRCYXNlU3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gRmVlZGJhY2sgbG9vcDogc2VuZCBpbmxpbmUgY29tbWVudHMgdG8gdGhlIGFnZW50IChzZXNzaW9uLnByb21wdCwgY29weSBmYWxsYmFjaykuXG4gIGNvbnN0IFtzZW5kT3Blbiwgc2V0U2VuZE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZW5kVGV4dCwgc2V0U2VuZFRleHRdID0gdXNlU3RhdGUoJycpXG4gIC8vIEFJIHJldmlldyAoL3Jldmlldyk6IGZpbmRpbmdzICsgdmVyZGljdC5cbiAgY29uc3QgW3Jldmlldywgc2V0UmV2aWV3XSA9IHVzZVN0YXRlPFJldmlld1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3Jldmlld2luZywgc2V0UmV2aWV3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICAvLyBHaXRIdWIgUFIgY29udGV4dCAoZ2ggQ0xJKS5cbiAgY29uc3QgW3ByLCBzZXRQcl0gPSB1c2VTdGF0ZTxQclJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gTXVsdGktcmVwbzogcmVwb3MgZGV0ZWN0ZWQgdW5kZXIgdGhlIHdvcmtzcGFjZSArIHRoZSBzZWxlY3RlZCBvbmUuXG4gIGNvbnN0IFtyZXBvcywgc2V0UmVwb3NdID0gdXNlU3RhdGU8eyBwYXRoOiBzdHJpbmc7IGJyYW5jaDogc3RyaW5nIHwgbnVsbCB9W10+KFtdKVxuICBjb25zdCBbcmVwb1BhdGgsIHNldFJlcG9QYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoanVtcCB0YXJnZXQgZnJvbSBhIFBSIGNvbW1lbnQgb3IgYSBmaW5kaW5nKS5cbiAgY29uc3QgW2p1bXBMaW5lLCBzZXRKdW1wTGluZV0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuXG4gIC8qKiBTZWxlY3QgYSBmaWxlIGFuZCBmbGFzaCBpdHMgbGluZSAoZmluZGluZ3MgLyBQUiBjb21tZW50cykuICovXG4gIGNvbnN0IGp1bXBUbyA9IChmaWxlOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpID0+IHtcbiAgICBzZXRTZWxlY3RlZChmaWxlKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgIHNldEp1bXBMaW5lKGxpbmUgPz8gbnVsbClcbiAgICBzZXRUaW1lb3V0KCgpID0+IHNldEp1bXBMaW5lKG51bGwpLCAyNTAwKVxuICB9XG4gIC8vIENvbGxhcHNlZCBkaXJlY3RvcmllcyBpbiB0aGUgbGVmdC1oYW5kIGZpbGUgdHJlZSAoc2hhcmVkIGFjcm9zcyB0YWJzKS5cbiAgY29uc3QgW2NvbGxhcHNlZERpcnMsIHNldENvbGxhcHNlZERpcnNdID0gdXNlU3RhdGU8UmVhZG9ubHlTZXQ8c3RyaW5nPj4oKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCB0b2dnbGVEaXIgPSB1c2VNZW1vKFxuICAgICgpID0+IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgIHNldENvbGxhcHNlZERpcnMoKHByZXYpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQocHJldilcbiAgICAgICAgaWYgKG5leHQuaGFzKHBhdGgpKSBuZXh0LmRlbGV0ZShwYXRoKVxuICAgICAgICBlbHNlIG5leHQuYWRkKHBhdGgpXG4gICAgICAgIHJldHVybiBuZXh0XG4gICAgICB9KVxuICAgIH0sXG4gICAgW10sXG4gIClcbiAgY29uc3Qgbm90aWNlVGltZXIgPSB1c2VSZWY8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ+KHVuZGVmaW5lZClcblxuICAvLyBDdXJyZW50IHNlc3Npb24ncyBjb252ZXJzYXRpb24gc25hcHNob3QgKHJlYWN0aXZlKSwgZm9yIHRoZSBzZXNzaW9uIHRhYi5cbiAgY29uc3QgY3VycmVudElkID0gdXNlU3luY0V4dGVybmFsU3RvcmUoXG4gICAgdXNlTWVtbygoKSA9PiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiBzZXNzaW9ucy5saXN0LnN1YnNjcmliZShub3RpZnkpLCBbc2Vzc2lvbnNdKSxcbiAgICB1c2VNZW1vKCgpID0+ICgpID0+IHNlc3Npb25zLmxpc3QuZ2V0U25hcHNob3QoKS5jdXJyZW50LCBbc2Vzc2lvbnNdKSxcbiAgKVxuICBjb25zdCBzbmFwc2hvdCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgcmV0dXJuIChub3RpZnk6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IGN1cnJlbnRJZCA/IHNlc3Npb25zLmJpbmRpbmcoY3VycmVudElkKSA6IHVuZGVmaW5lZFxuICAgICAgICBpZiAoIWJpbmRpbmcpIHJldHVybiAoKSA9PiB7fVxuICAgICAgICByZXR1cm4gYmluZGluZy5zZXNzaW9uLnN1YnNjcmliZShub3RpZnkpXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIGJpbmRpbmcgPyBiaW5kaW5nLnNlc3Npb24uZ2V0U25hcHNob3QoKSA6IG51bGxcbiAgICAgIH1cbiAgICB9LCBbc2Vzc2lvbnMsIGN1cnJlbnRJZF0pLFxuICApXG5cbiAgY29uc3Qgcm91bmRzID0gdXNlTWVtbygoKSA9PiAoc25hcHNob3QgPyBjb2xsZWN0U2Vzc2lvblJvdW5kcyhzbmFwc2hvdC5ub2RlcykgOiBbXSksIFtzbmFwc2hvdF0pXG4gIC8vIExhc3QgdXNlci1tZXNzYWdlIHRpbWVzdGFtcCBcdTIwMTQgdGhlIExhc3QtdHVybiBzY29wZSBmYWxscyBiYWNrIHRvIGZpbGVzIHdob3NlXG4gIC8vIG10aW1lIGlzIGFmdGVyIGl0IHdoZW4gdGhlIHNlc3Npb24gbG9nIGhhcyBubyByZWNvcmRlZCBkaWZmIChiYXNoIGVkaXRzKS5cbiAgY29uc3QgbGFzdFVzZXJUaW1lID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuIDBcbiAgICBsZXQgdCA9IDBcbiAgICBmb3IgKGNvbnN0IG4gb2Ygc25hcHNob3Qubm9kZXMpIHtcbiAgICAgIGlmIChuLmtpbmQgPT09ICd1c2VyJyAmJiBuLnRpbWUgPiB0KSB0ID0gbi50aW1lXG4gICAgfVxuICAgIHJldHVybiB0XG4gIH0sIFtzbmFwc2hvdF0pXG4gIC8vIERpYWdub3N0aWNzIGZvciB0aGUgZW1wdHkgc2Vzc2lvbi1jaGFuZ2VzIHN0YXRlOiB3aGF0IHRoZSBzbmFwc2hvdCBzY2FuIGZvdW5kLlxuICBjb25zdCBzZXNzaW9uU2NhbiA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghc25hcHNob3QpIHJldHVybiBudWxsXG4gICAgbGV0IHJlc3VsdHMgPSAwXG4gICAgbGV0IGRpZmZDYXJkcyA9IDBcbiAgICBsZXQgcGF0aE9ubHkgPSAwXG4gICAgZm9yIChjb25zdCBub2RlIG9mIHNuYXBzaG90Lm5vZGVzKSB7XG4gICAgICBpZiAobm9kZS5raW5kICE9PSAndG9vbC1yZXN1bHQnKSBjb250aW51ZVxuICAgICAgcmVzdWx0cysrXG4gICAgICBjb25zdCBjaGFuZ2VzID0gY2hhbmdlc0Zyb21Ub29sUmVzdWx0KG5vZGUuY2FsbCwgbm9kZSlcbiAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuc29tZSgoeCkgPT4geC5oYXNEaWZmKSkgZGlmZkNhcmRzKytcbiAgICAgICAgZWxzZSBwYXRoT25seSsrXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHJlc3VsdHMsIGRpZmZDYXJkcywgcGF0aE9ubHkgfVxuICB9LCBbc25hcHNob3RdKVxuICAvLyBMZWZ0LWhhbmQgZmlsZSB0cmVlczogcGVyLXJvdW5kIHRyZWVzIGZvciB0aGUgc2Vzc2lvbiB0YWIsIG9uZSB0cmVlIGZvclxuICAvLyB0aGUgZ2l0IHdvcmtpbmcgdHJlZSBvbiB0aGUgd29ya3NwYWNlIHRhYi5cbiAgY29uc3Qgc2Vzc2lvblRyZWVzID0gdXNlTWVtbygoKSA9PiBuZXcgTWFwKHJvdW5kcy5tYXAoKHIpID0+IFtyLnJvdW5kLCBidWlsZEZpbGVUcmVlKHIuY2hhbmdlcywgKGMpID0+IGMucGF0aCldKSksIFtyb3VuZHNdKVxuICBjb25zdCB0b3RhbFNlc3Npb25GaWxlcyA9IHVzZU1lbW8oKCkgPT4gcm91bmRzLnJlZHVjZSgobiwgcikgPT4gbiArIHIuY2hhbmdlcy5sZW5ndGgsIDApLCBbcm91bmRzXSlcbiAgY29uc3QgW3NlbGVjdGVkUm91bmQsIHNldFNlbGVjdGVkUm91bmRdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkUGF0aCwgc2V0U2VsZWN0ZWRQYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHNlbGVjdGVkQ2hhbmdlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgcm91bmQgPSByb3VuZHMuZmluZCgocikgPT4gci5yb3VuZCA9PT0gc2VsZWN0ZWRSb3VuZClcbiAgICByZXR1cm4gcm91bmQ/LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBzZWxlY3RlZFBhdGgpID8/IG51bGxcbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZCwgc2VsZWN0ZWRQYXRoXSlcblxuICBjb25zdCBjd2QgPSBzdG9yZVN0YXRlLmN3ZFxuICAvKiogQWN0aXZlIGdpdCByZXBvIGZvciB3b3Jrc3BhY2Ugb3BlcmF0aW9ucyAobXVsdGktcmVwbyBzZWxlY3RvciBvdmVycmlkZSkuICovXG4gIGNvbnN0IGFjdGl2ZUN3ZCA9IHJlcG9QYXRoID8/IGN3ZFxuXG4gIGNvbnN0IGxvYWRXb3Jrc3BhY2UgPSBhc3luYyAoc2lsZW50ID0gZmFsc2UpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKCFzaWxlbnQpIHNldExvYWRpbmcodHJ1ZSlcbiAgICBzZXRFcnJvcihudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBbbmV4dCwgaGlzdCwgbmV4dENvbW1lbnRzLCBicmFuY2hMaXN0LCBwckRhdGEsIHJlcG9MaXN0XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgbG9hZFN0YXR1cyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkSGlzdG9yeShhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkQ29tbWVudHMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEJyYW5jaGVzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRQcihhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUmVwb3MoYWN0aXZlQ3dkKSxcbiAgICAgIF0pXG4gICAgICBzZXRTdGF0dXMobmV4dClcbiAgICAgIGlmIChoaXN0Lm9rKSBzZXRIaXN0b3J5KGhpc3QuY29tbWl0cylcbiAgICAgIHNldENvbW1lbnRzKG5leHRDb21tZW50cylcbiAgICAgIHNldEJyYW5jaGVzKGJyYW5jaExpc3QpXG4gICAgICBzZXRQcihwckRhdGEpXG4gICAgICBzZXRSZXBvcyhyZXBvTGlzdC5yZXBvcylcbiAgICAgIC8vIERlZmF1bHQgdGhlIHJlcG8gc2VsZWN0b3IgdG8gdGhlIHdvcmtzcGFjZSByb290IHdoZW4gaXQgaXMgaXRzZWxmIGEgcmVwby5cbiAgICAgIGlmIChyZXBvUGF0aCA9PT0gbnVsbCAmJiAhcmVwb0xpc3QucmVwb3Muc29tZSgocikgPT4gci5wYXRoID09PSBhY3RpdmVDd2QpKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gcmVwb0xpc3QucmVwb3NbMF1cbiAgICAgICAgaWYgKGZpcnN0ICYmIGZpcnN0LnBhdGggIT09IGN3ZCkgc2V0UmVwb1BhdGgoZmlyc3QucGF0aClcbiAgICAgIH1cbiAgICAgIGlmIChuZXh0LmVycm9yICYmICFuZXh0LmlzUmVwbykgc2V0RXJyb3IobmV4dC5lcnJvcilcbiAgICAgIHNldFNlbGVjdGVkKChwcmV2KSA9PiAocHJldiAmJiBuZXh0LmZpbGVzLnNvbWUoKGYpID0+IGYucGF0aCA9PT0gcHJldikgPyBwcmV2IDogbmV4dC5maWxlc1swXT8ucGF0aCA/PyBudWxsKSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXRFcnJvcihlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gQXV0by1yZWZyZXNoIHRoZSB3b3Jrc3BhY2UgZGF0YTogcmVsb2FkIHdoZW5ldmVyIHRoZSB0YWIgYmVjb21lcyBhY3RpdmUgb3JcbiAgLy8gdGhlIHdvcmtzcGFjZSBjaGFuZ2VzLCBhbmQgcGVyaW9kaWNhbGx5IHdoaWxlIHRoZSBvdmVybGF5IGlzIG9wZW4uIEFcbiAgLy8gd29ya3NwYWNlIHN3aXRjaCBjbGVhcnMgc3RhbGUgY29tbWl0IHNlbGVjdGlvbiBhbmQgaGlzdG9yeSBmaXJzdC5cbiAgY29uc3Qgd29ya3NwYWNlQ3dkUmVmID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcHJldmlvdXMgPSB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudFxuICAgIHdvcmtzcGFjZUN3ZFJlZi5jdXJyZW50ID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICBpZiAodGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAocHJldmlvdXMgIT09IGFjdGl2ZUN3ZCkge1xuICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgc2V0SGlzdG9yeShbXSlcbiAgICAgIHNldENvbW1lbnRzKFtdKVxuICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgc2V0UmV2aWV3KG51bGwpXG4gICAgICBzZXRQcihudWxsKVxuICAgIH1cbiAgICB2b2lkIGxvYWRXb3Jrc3BhY2UoKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3RhYiwgYWN0aXZlQ3dkXSlcblxuICAvLyBTdXJmYWNlIHdvcmtzcGFjZSBjb21tZW50cyBhYm92ZSB0aGUgY29tcG9zZXIgKENvZGV4LXN0eWxlIGRvY2spLCBhbG9uZ1xuICAvLyB3aXRoIHRoZSBkaWZmIGNvbnRleHQgYW5kIHRoZSBsYXN0IEFJIHJldmlldyByZXN1bHQuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcGVuZGluZ0NvbW1lbnRzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLmN3ZCA9IGFjdGl2ZUN3ZCA/PyBudWxsXG4gICAgICBkLmNvbW1lbnRzID0gY29tbWVudHNcbiAgICAgIGNvbnN0IGRpZmZzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbiAgICAgIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgICAgICBjb25zdCBmaWxlID0gc3RhdHVzPy5maWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IGMucGF0aClcbiAgICAgICAgaWYgKGZpbGU/LmRpZmYpIGRpZmZzW2MucGF0aF0gPSBmaWxlLmRpZmZcbiAgICAgIH1cbiAgICAgIGQuZGlmZnMgPSBkaWZmc1xuICAgICAgZC5yZXZpZXcgPSByZXZpZXdcbiAgICB9KVxuICB9LCBbY29tbWVudHMsIGFjdGl2ZUN3ZCwgc3RhdHVzLCByZXZpZXddKVxuXG4gIC8vIEp1bXAgdG8gYSBjaGFuZ2UgYmxvY2sgZnJvbSB0aGUgY29tcG9zZXIgZG9jayAoY29tbWVudCBjbGljaykuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZm9jdXMgPSBzdG9yZVN0YXRlLmZvY3VzXG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgIWN3ZCB8fCAhZm9jdXMpIHJldHVyblxuICAgIHNldFRhYignd29ya3NwYWNlJylcbiAgICBzZXRTZWxlY3RlZChmb2N1cy5wYXRoKVxuICAgIHNldEp1bXBMaW5lKGZvY3VzLmxpbmUgPz8gbnVsbClcbiAgICBjb25zdCBzY3JvbGxUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKGZvY3VzLmxpbmUgIT0gbnVsbCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kc2RyLWxpbmU9XCIke2ZvY3VzLmxpbmV9XCJdYCk/LnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdjZW50ZXInLCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgICAgIH1cbiAgICB9LCA4MClcbiAgICBjb25zdCBjbGVhclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbFRpbWVyKVxuICAgICAgY2xlYXJUaW1lb3V0KGNsZWFyVGltZXIpXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3N0b3JlU3RhdGUua2V5XSlcblxuICAvLyBLZWVwIHN0YWdlZC91bnN0YWdlZC9oaXN0b3J5IGZyZXNoIHdoaWxlIHRoZSB3b3Jrc3BhY2UgdGFiIGlzIG9wZW4uXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgdGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBjb25zdCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHZvaWQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgIH0sIDE1MDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKHRpbWVyKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3N0b3JlU3RhdGUub3BlbiwgdGFiLCBhY3RpdmVDd2RdKVxuXG4gIC8vIEJyYW5jaCBzY29wZTogZGlmZiB0aGUgd29ya3RyZWUgYWdhaW5zdCB0aGUgc2VsZWN0ZWQgYmFzZSBicmFuY2guXG4gIC8vIERlZmF1bHQgdGhlIGJhc2UgdG8gdGhlIGZpcnN0IGJyYW5jaCB0aGF0IGlzbid0IHRoZSBjdXJyZW50IG9uZS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2NvcGUgIT09ICdicmFuY2gnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGNvbnN0IGN1cnJlbnQgPSBzdGF0dXM/LmJyYW5jaCA/PyBudWxsXG4gICAgaWYgKGJhc2VCcmFuY2ggPT09IG51bGwgJiYgYnJhbmNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmFsbGJhY2sgPSBicmFuY2hlcy5maW5kKChiKSA9PiBiICE9PSBjdXJyZW50KSA/PyBicmFuY2hlc1swXVxuICAgICAgc2V0QmFzZUJyYW5jaChmYWxsYmFjaylcbiAgICB9XG4gIH0sIFtzY29wZSwgYWN0aXZlQ3dkLCBicmFuY2hlcywgYmFzZUJyYW5jaCwgc3RhdHVzPy5icmFuY2hdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlICE9PSAnYnJhbmNoJyB8fCAhYWN0aXZlQ3dkIHx8ICFiYXNlQnJhbmNoKSB7XG4gICAgICBzZXRCYXNlU3RhdHVzKG51bGwpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGFjdGl2ZUN3ZCl9JmJhc2U9JHtlbmNvZGVVUklDb21wb25lbnQoYmFzZUJyYW5jaCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiBudWxsKSkgYXMgU3RhdHVzUmVzcG9uc2UgfCBudWxsXG4gICAgICBpZiAoIWNhbmNlbGxlZCAmJiBkYXRhKSB7XG4gICAgICAgIHNldEJhc2VTdGF0dXMoZGF0YSlcbiAgICAgICAgaWYgKGRhdGEuZXJyb3IgJiYgYmFzZVN0YXR1cz8uZXJyb3IgIT09IGRhdGEuZXJyb3IpIHNldEVycm9yKGRhdGEuZXJyb3IpXG4gICAgICB9XG4gICAgfSkoKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjYW5jZWxsZWQgPSB0cnVlXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3Njb3BlLCBhY3RpdmVDd2QsIGJhc2VCcmFuY2hdKVxuXG4gIC8vIERlZmF1bHQgc2VsZWN0aW9uIGZvciB0aGUgc2Vzc2lvbiB0YWIgZm9sbG93cyB0aGUgZmlyc3Qgcm91bmQgd2l0aCBjaGFuZ2VzLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFJvdW5kID09PSBudWxsICYmIHJvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRTZWxlY3RlZFJvdW5kKHJvdW5kc1swXS5yb3VuZClcbiAgICAgIHNldFNlbGVjdGVkUGF0aChyb3VuZHNbMF0uY2hhbmdlc1swXT8ucGF0aCA/PyBudWxsKVxuICAgIH1cbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbikgcmV0dXJuXG4gICAgY29uc3Qgb25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICBkLm9wZW4gPSBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgfSwgW3N0b3JlU3RhdGUub3Blbl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW5vdGljZSkgcmV0dXJuXG4gICAgbm90aWNlVGltZXIuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4gc2V0Tm90aWNlKG51bGwpLCAzMDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQobm90aWNlVGltZXIuY3VycmVudClcbiAgfSwgW25vdGljZV0pXG5cbiAgY29uc3QgZmlsZXMgPSBzdGF0dXM/LmlzUmVwbyA/IHN0YXR1cy5maWxlcyA6IFtdXG4gIGNvbnN0IHN0YWdlZEZpbGVzID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGYpID0+IGYuc3RhZ2VkKSwgW2ZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiAhZi5zdGFnZWQpLCBbZmlsZXNdKVxuXG4gIC8vIFwiTGFzdCB0dXJuXCIgc2NvcGU6IHBhdGhzIHRoZSBhZ2VudCB0b3VjaGVkIGluIHRoZSBtb3N0IHJlY2VudCByb3VuZC5cbiAgY29uc3QgbGFzdFJvdW5kUGF0aHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCBzZXQgPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgIGNvbnN0IGxhc3QgPSByb3VuZHNbcm91bmRzLmxlbmd0aCAtIDFdXG4gICAgaWYgKCFsYXN0IHx8ICFjd2QpIHJldHVybiBzZXRcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBsYXN0LmNoYW5nZXMpIHtcbiAgICAgIHNldC5hZGQoY2hhbmdlLnBhdGgpXG4gICAgICBjb25zdCBwID0gY2hhbmdlLnBhdGhcbiAgICAgIGlmIChpc0Fic1BhdGgocCkpIHtcbiAgICAgICAgY29uc3QgcmVsID0gcC5zdGFydHNXaXRoKGN3ZCkgPyBwLnNsaWNlKGN3ZC5sZW5ndGgpLnJlcGxhY2UoL15bXFxcXC9dKy8sICcnKSA6IHBcbiAgICAgICAgc2V0LmFkZChyZWwpXG4gICAgICAgIHNldC5hZGQoYmFzZU5hbWUocCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXQuYWRkKGJhc2VOYW1lKHApKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2V0XG4gIH0sIFtyb3VuZHMsIGN3ZF0pXG5cbiAgLyoqIFRoZSBmaWxlIHNsaWNlIHRoZSBjdXJyZW50IHNjb3BlIHNob3dzLiAqL1xuICBjb25zdCBzY29wZUZpbGVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgc3dpdGNoIChzY29wZSkge1xuICAgICAgY2FzZSAndW5zdGFnZWQnOlxuICAgICAgICByZXR1cm4gdW5zdGFnZWRGaWxlc1xuICAgICAgY2FzZSAnc3RhZ2VkJzpcbiAgICAgICAgcmV0dXJuIHN0YWdlZEZpbGVzXG4gICAgICBjYXNlICdicmFuY2gnOlxuICAgICAgICByZXR1cm4gYmFzZVN0YXR1cz8uZmlsZXMgPz8gW11cbiAgICAgIGNhc2UgJ2xhc3QtdHVybic6IHtcbiAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gICAgICAgIGNvbnN0IHN1ZmZpeE1hdGNoID0gKGY6IERpZmZGaWxlKTogYm9vbGVhbiA9PiB7XG4gICAgICAgICAgaWYgKGxhc3RSb3VuZFBhdGhzLnNpemUgPT09IDApIHJldHVybiBmYWxzZVxuICAgICAgICAgIGlmIChsYXN0Um91bmRQYXRocy5oYXMoZi5wYXRoKSB8fCBsYXN0Um91bmRQYXRocy5oYXMoYmFzZU5hbWUoZi5wYXRoKSkpIHJldHVybiB0cnVlXG4gICAgICAgICAgY29uc3Qgc3VmZml4ID0gYC8ke2YucGF0aH1gXG4gICAgICAgICAgZm9yIChjb25zdCBwIG9mIGxhc3RSb3VuZFBhdGhzKSB7XG4gICAgICAgICAgICBpZiAocC5lbmRzV2l0aChzdWZmaXgpKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsZXMuZmlsdGVyKChmKSA9PiB7XG4gICAgICAgICAgaWYgKHN1ZmZpeE1hdGNoKGYpKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIC8vIEdpdCBmYWxsYmFjazogY2hhbmdlZCBhZnRlciB0aGUgbGFzdCB1c2VyIG1lc3NhZ2UgKHNlc3Npb24gbG9nIG1heVxuICAgICAgICAgIC8vIGhhdmUgbm8gZGlmZiBkYXRhLCBlLmcuIHRlcm1pbmFsLWRyaXZlbiBlZGl0cykuXG4gICAgICAgICAgcmV0dXJuIGxhc3RVc2VyVGltZSA+IDAgJiYgZi5tdGltZSA+PSBsYXN0VXNlclRpbWUgLSA1MDAwXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmlsZXNcbiAgICB9XG4gIH0sIFtzY29wZSwgdW5zdGFnZWRGaWxlcywgc3RhZ2VkRmlsZXMsIGJhc2VTdGF0dXMsIGZpbGVzLCBsYXN0Um91bmRQYXRocywgbGFzdFVzZXJUaW1lXSlcblxuICAvKiogU2NvcGVzIHdoZXJlIGZpbGUvaHVuayBhY2NlcHRcdTAwQjdyZXZlcnRcdTAwQjd1bnN0YWdlIGFuZCBjb21taXQvcHVzaCBtYWtlIHNlbnNlLiAqL1xuICBjb25zdCBhbGxvd0FjdGlvbnMgPSBzY29wZSAhPT0gJ2JyYW5jaCcgJiYgc2NvcGUgIT09ICdjb21taXQnXG5cbiAgLyoqIEZpbGVzIHRoZSBjdXJyZW50IHNjb3BlIGNhbiBoYW5kIHRvIHRoZSBBSSByZXZpZXcuICovXG4gIGNvbnN0IHJldmlld2FibGVGaWxlcyA9IHNjb3BlID09PSAnYnJhbmNoJyA/IGJhc2VTdGF0dXM/LmZpbGVzPy5sZW5ndGggPz8gMCA6IGZpbGVzLmxlbmd0aFxuICBjb25zdCBzdGFnZWRDb3VudCA9IHN0YWdlZEZpbGVzLmxlbmd0aFxuICAvLyBOT1RFOiBob29rcyBtdXN0IGFsbCBydW4gYmVmb3JlIHRoZSBlYXJseSByZXR1cm4gYmVsb3cgKFJlYWN0IGhvb2sgb3JkZXIpLlxuICBjb25zdCBzdGFnZWRUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHN0YWdlZEZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3N0YWdlZEZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHVuc3RhZ2VkRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbdW5zdGFnZWRGaWxlc10pXG4gIGNvbnN0IHNjb3BlVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZShzY29wZUZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3Njb3BlRmlsZXNdKVxuICBjb25zdCBjb21taXRGaWxlc1RyZWUgPSB1c2VNZW1vKFxuICAgICgpID0+IChjb21taXREaWZmPy5vayA/IGJ1aWxkRmlsZVRyZWUoY29tbWl0RGlmZi5maWxlcywgKGYpID0+IGYucGF0aCkgOiBbXSksXG4gICAgW2NvbW1pdERpZmZdLFxuICApXG5cbiAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgIWN3ZCkgcmV0dXJuIG51bGxcblxuICBjb25zdCBzZWxlY3RlZEZpbGUgPSBzY29wZUZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWQpID8/IG51bGxcbiAgY29uc3QgdG90YWxBZGRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuYWRkZWQsIDApXG4gIGNvbnN0IHRvdGFsRGVsZXRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuZGVsZXRlZCwgMClcblxuICAvLyBDb21taXQtZGV0YWlsIHZpZXc6IHRoZSBzZWxlY3RlZCBmaWxlIHdpdGhpbiB0aGUgc2VsZWN0ZWQgY29tbWl0LlxuICBjb25zdCBjb21taXRTZWdtZW50cyA9IGNvbW1pdERpZmY/Lm9rID8gc3BsaXRDb21taXREaWZmKGNvbW1pdERpZmYuZGlmZikgOiBbXVxuICBjb25zdCBjb21taXRBY3RpdmVGaWxlID0gc2VsZWN0ZWRDb21taXQgJiYgY29tbWl0RGlmZj8ub2sgPyBjb21taXREaWZmLmZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWRDb21taXRGaWxlKSA/PyBudWxsIDogbnVsbFxuICBjb25zdCBjb21taXRBY3RpdmVUZXh0ID0gY29tbWl0QWN0aXZlRmlsZVxuICAgID8gY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/IGNvbW1pdERpZmY/LmRpZmYgPz8gJydcbiAgICA6IGNvbW1pdERpZmY/LmRpZmYgPz8gJydcblxuICAvKiogTGVhZiByb3cgc2hhcmVkIGJ5IHRoZSBzdGFnZWQvdW5zdGFnZWQgZmlsZSB0cmVlcy4gKi9cbiAgY29uc3Qgd29ya3NwYWNlTGVhZiA9ICh7IGl0ZW06IGZpbGUsIG5hbWUgfTogeyBpdGVtOiBEaWZmRmlsZTsgbmFtZTogc3RyaW5nIH0pID0+IChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgYXJpYS1zZWxlY3RlZD17ZmlsZS5wYXRoID09PSBzZWxlY3RlZH1cbiAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7ZmlsZS5wYXRoID09PSBzZWxlY3RlZCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkKGZpbGUucGF0aClcbiAgICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICAgIH19XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hpcENsYXNzKGZpbGUuc3RhdHVzKX1gfT57ZmlsZS51bnRyYWNrZWQgPyAnPz8nIDogZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICB7ZmlsZS5iaW5hcnkgPyB0KCdyZXZpZXcuYmluYXJ5JykgOiB0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxuXG4gIGNvbnN0IHJ1bkFwcGx5ID0gYXN5bmMgKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZykgPT4ge1xuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcGx5Q2hhbmdlcyhhY3RpdmVDd2QgPz8gY3dkID8/ICcnLCBhY3Rpb24sIHBhdGgpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIGNvbnN0IHZlcmIgPSBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiBhY3Rpb24gPT09ICd1bnN0YWdlJyA/IHQoJ3Jldmlldy51bnN0YWdlZCcpIDogdCgncmV2aWV3LnJldmVydGVkJylcbiAgICAgICAgc2V0Tm90aWNlKHtcbiAgICAgICAgICBraW5kOiAnb2snLFxuICAgICAgICAgIHRleHQ6IHBhdGhcbiAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVPbmUnLCB7IGFjdGlvbjogdmVyYiwgcGF0aCB9KVxuICAgICAgICAgICAgOiByZXN1bHQuZGVsZXRlZCAmJiByZXN1bHQuZGVsZXRlZC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVEZWxldGVkJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGgsIGRlbGV0ZWQ6IHJlc3VsdC5kZWxldGVkLmxlbmd0aCB9KVxuICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5kb25lJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGggfSksXG4gICAgICAgIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBvbkZpbGVBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnZmlsZScpIHtcbiAgICAgIHNldENvbmZpcm0oJ2ZpbGUnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2ZpbGUnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbiwgcGF0aClcbiAgfVxuXG4gIGNvbnN0IG9uQWxsQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JykgPT4ge1xuICAgIGlmIChhY3Rpb24gPT09ICdyZXZlcnQnICYmIGNvbmZpcm0gIT09ICdhbGwnKSB7XG4gICAgICBzZXRDb25maXJtKCdhbGwnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2FsbCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uKVxuICB9XG5cbiAgLyoqIEFwcGx5IG9uZSBodW5rIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpIG9mIHRoZSBzZWxlY3RlZCBmaWxlLiAqL1xuICBjb25zdCBvbkh1bmtBY3Rpb24gPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBEaWZmSHVuaykgPT4ge1xuICAgIGlmICghc2VsZWN0ZWRGaWxlIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlIdW5rKGFjdGl2ZUN3ZCA/PyBjd2QgPz8gJycsIHNlbGVjdGVkRmlsZS5wYXRoLCBhY3Rpb24sIGh1bmsudGV4dClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgY29uc3QgdmVyYiA9IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IGFjdGlvbiA9PT0gJ3Vuc3RhZ2UnID8gdCgncmV2aWV3LnVuc3RhZ2VkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiB2ZXJiLCBwYXRoOiBzZWxlY3RlZEZpbGUucGF0aCB9KSB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBpbmxpbmUgY29tbWVudHMgLS0tLVxuICBjb25zdCBvcGVuQ29tbWVudCA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVyblxuICAgIHNldENvbW1lbnRFZGl0b3IoeyBvbGRMaW5lLCBuZXdMaW5lIH0pXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gIH1cblxuICBjb25zdCBzYXZlQ29tbWVudCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBjb21tZW50UGF0aCA9IHRhYiA9PT0gJ3dvcmtzcGFjZScgPyBzZWxlY3RlZEZpbGU/LnBhdGggOiBzZWxlY3RlZENoYW5nZT8ucGF0aFxuICAgIGlmICghY29tbWVudFBhdGggfHwgIWNvbW1lbnRFZGl0b3IgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgdGV4dCA9IGNvbW1lbnRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCkgcmV0dXJuXG4gICAgY29uc3QgY29tbWVudDogUmV2aWV3Q29tbWVudCA9IHtcbiAgICAgIGlkOiB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8ucmFuZG9tVVVJRCA/IGNyeXB0by5yYW5kb21VVUlEKCkgOiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpfWAsXG4gICAgICBwYXRoOiBjb21tZW50UGF0aCxcbiAgICAgIGxpbmVOZXc6IGNvbW1lbnRFZGl0b3IubmV3TGluZSxcbiAgICAgIGxpbmVPbGQ6IGNvbW1lbnRFZGl0b3Iub2xkTGluZSxcbiAgICAgIHRleHQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB9XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBuZXh0ID0gWy4uLmNvbW1lbnRzLCBjb21tZW50XVxuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ2NvbW1lbnQuc2F2ZWQnKSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBjYW5jZWxDb21tZW50ID0gKCkgPT4ge1xuICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgfVxuXG4gIGNvbnN0IGRlbGV0ZUNvbW1lbnQgPSBhc3luYyAoaWQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjLmlkICE9PSBpZClcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlIG9uZSBzYXZlZCBjb21tZW50J3MgdGV4dCAoUFVUIHJlcGxhY2UpLiBSZXR1cm5zIHN1Y2Nlc3MuICovXG4gIGNvbnN0IHVwZGF0ZUNvbW1lbnQgPSBhc3luYyAoaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgaWYgKCF0ZXh0IHx8IGJ1c3kpIHJldHVybiBmYWxzZVxuICAgIGNvbnN0IG5leHQgPSBjb21tZW50cy5tYXAoKGMpID0+IChjLmlkID09PSBpZCA/IHsgLi4uYywgdGV4dCwgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSA6IGMpKVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIEFJIHJldmlldyAoL3Jldmlldyk6IHJ1biwgcmUtcnVuLCBhbmQgaGFuZCBmaW5kaW5ncyB0byB0aGUgYWdlbnQgLS0tLVxuICBjb25zdCBvblJldmlldyA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCByZXZpZXdpbmcgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0UmV2aWV3aW5nKHRydWUpXG4gICAgc2V0UmV2aWV3KG51bGwpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldmlld1Njb3BlID0gc2NvcGUgPT09ICdicmFuY2gnID8gJ2JyYW5jaCcgOiBzY29wZSA9PT0gJ2NvbW1pdCcgJiYgc2VsZWN0ZWRDb21taXQgPyAnY29tbWl0JyA6ICd1bmNvbW1pdHRlZCdcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1blJldmlldyhhY3RpdmVDd2QsIGN1cnJlbnRJZCA/PyBudWxsLCByZXZpZXdTY29wZSwgYmFzZUJyYW5jaCA/PyB1bmRlZmluZWQsIHNlbGVjdGVkQ29tbWl0Py5oYXNoID8/IHVuZGVmaW5lZClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0UmV2aWV3KHJlc3VsdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0UmV2aWV3aW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21wb3NlIGEgXCJzZW5kIHRvIGFnZW50XCIgbWVzc2FnZSBmcm9tIGZpbmRpbmdzIG9yIFBSIGNvbW1lbnRzLiAqL1xuICBjb25zdCBjb21wb3NlRmluZGluZ3NNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0ZpbmRpbmdbXT4oKVxuICAgIGZvciAoY29uc3QgZiBvZiByZXZpZXc/LmZpbmRpbmdzID8/IFtdKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChmLmZpbGUpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGYpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoZi5maWxlLCBbZl0pXG4gICAgfVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFsnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCIEFJIFx1OEJDNFx1NUJBMVx1NTNEMVx1NzNCMFx1RkYwOEFkZHJlc3MgdGhlIHJldmlldyBmaW5kaW5nc1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsICcnXVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCByYW5nZSA9IGYubGluZVN0YXJ0ID09PSBmLmxpbmVFbmQgPyBgOiR7Zi5saW5lU3RhcnR9YCA6IGA6JHtmLmxpbmVTdGFydH0tJHtmLmxpbmVFbmR9YFxuICAgICAgICBsaW5lcy5wdXNoKGAtIFske2YucHJpb3JpdHl9XSAke3BhdGh9JHtyYW5nZX06ICR7Zi50aXRsZX0gXHUyMDE0ICR7Zi5kZXRhaWx9YClcbiAgICAgICAgaWYgKGYuc3VnZ2VzdGlvbikgbGluZXMucHVzaChgICBcXGBcXGBcXGBcXG4ke2Yuc3VnZ2VzdGlvbn1cXG4gIFxcYFxcYFxcYGApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IGNvbXBvc2VQck1lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoIXByPy5wciB8fCBwci5jb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtgXHU4QkY3XHU1OTA0XHU3NDA2IFBSICMke3ByLnByLm51bWJlcn1cdUZGMDgke3ByLnByLnRpdGxlfVx1RkYwOVx1NzY4NFx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIFBSIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBYCwgJyddXG4gICAgZm9yIChjb25zdCBjIG9mIHByLmNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBhbmNob3IgPSBjLnBhdGggPyBgJHtjLnBhdGh9JHtjLmxpbmUgPyBgOiR7Yy5saW5lfWAgOiAnJ31gIDogJ2dlbmVyYWwnXG4gICAgICBsaW5lcy5wdXNoKGAtICR7YW5jaG9yfSAoJHtjLmF1dGhvcn0pOiAke2MuYm9keX1gKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWxXaXRoID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgIHNldFNlbmRUZXh0KHRleHQpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIC8vIC0tLS0gZWRpdG9yIGludGVncmF0aW9uICh2aWEgZHNoLXBsdWdpbi1vcGVuLWVkaXRvcikgLS0tLVxuICBjb25zdCBvcGVuRmlsZSA9IGFzeW5jIChwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCBidXN5KSByZXR1cm5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvcGVuSW5FZGl0b3IoYWN0aXZlQ3dkLCBwYXRoLCBsaW5lKVxuICAgIGlmICghcmVzdWx0Lm9rKSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBgJHt0KCdlZGl0b3IuZmFpbGVkJyl9OiAke3Jlc3VsdC5lcnJvciA/PyAnJ31gIH0pXG4gIH1cblxuICAvKiogSnVtcCBmcm9tIGEgUFIgY29tbWVudCB0byB0aGUgZmlsZSAoYW5kIGhpZ2hsaWdodCB0aGUgbGluZSkuICovXG4gIGNvbnN0IG9uUHJDb21tZW50Q2xpY2sgPSAocGF0aDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCwgbGluZTogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuICAgIGlmIChwYXRoKSBqdW1wVG8ocGF0aCwgbGluZSA/PyB1bmRlZmluZWQpXG4gICAgZWxzZSBzZXRKdW1wTGluZShudWxsKVxuICB9XG5cbiAgLy8gLS0tLSBmZWVkYmFjayBsb29wOiBjb21tZW50cyBcdTIxOTIgYWdlbnQgKHByb21wdCBpbmplY3Rpb24sIGNvcHkgZmFsbGJhY2spIC0tLS1cbiAgY29uc3QgY29tcG9zZVJldmlld01lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoY29tbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUmV2aWV3Q29tbWVudFtdPigpXG4gICAgZm9yIChjb25zdCBjIG9mIGNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChjLnBhdGgpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGMpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoYy5wYXRoLCBbY10pXG4gICAgfVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtcbiAgICAgICdcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLFxuICAgICAgJycsXG4gICAgXVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGMgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCBhbmNob3IgPSBjLmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Yy5saW5lTmV3fWAgOiBgIChvbGQgbGluZSAke2MubGluZU9sZH0pYFxuICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGF0aH0ke2FuY2hvcn06ICR7Yy50ZXh0fWApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0U2VuZFRleHQoY29tcG9zZVJldmlld01lc3NhZ2UoKSlcbiAgICBzZXRTZW5kT3Blbih0cnVlKVxuICB9XG5cbiAgY29uc3Qgc2VuZFRvQWdlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdGV4dCA9IHNlbmRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBhd2FpdCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIGN1cnJlbnRJZCA/PyBudWxsLCB0ZXh0KVxuICAgICAgc2V0U2VuZE9wZW4oZmFsc2UpXG4gICAgICBpZiAob3V0Y29tZSA9PT0gJ3NlbnQnKSBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuc2VudFRvQWdlbnQnKSB9KVxuICAgICAgZWxzZSBpZiAob3V0Y29tZSA9PT0gJ2NvcGllZCcpIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KVxuICAgICAgZWxzZSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdyZXZpZXcuY29weUZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIENvbW1pdCB0aGUgc3RhZ2VkIGNoYW5nZXMgd2l0aCB0aGUgZW50ZXJlZCBtZXNzYWdlLiAqL1xuICBjb25zdCBvbkNvbW1pdCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0gY29tbWl0TWVzc2FnZS50cmltKClcbiAgICBpZiAoIW1lc3NhZ2UgfHwgYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAnY29tbWl0JywgbWVzc2FnZSlcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0Q29tbWl0TWVzc2FnZSgnJylcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHJlc3VsdC5oYXNoID8gYCR7cmVzdWx0Lmhhc2h9ICR7cmVzdWx0LnN1YmplY3QgPz8gJyd9YC50cmltKCkgOiAocmVzdWx0LnN1YmplY3QgPz8gJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb21taXR0ZWQnLCB7IHN1bW1hcnkgfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBQdXNoIHRoZSBjdXJyZW50IGJyYW5jaCAoZG91YmxlLWNsaWNrIHRvIGNvbmZpcm0pLiAqL1xuICBjb25zdCBvblB1c2ggPSAoKSA9PiB7XG4gICAgaWYgKGJ1c3kgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKGNvbmZpcm0gIT09ICdwdXNoJykge1xuICAgICAgc2V0Q29uZmlybSgncHVzaCcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAncHVzaCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgIHNldEJ1c3kodHJ1ZSlcbiAgICAgIHNldE5vdGljZShudWxsKVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuR2l0QWN0aW9uKGFjdGl2ZUN3ZCwgJ3B1c2gnKVxuICAgICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LnB1c2hlZCcpIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5wdXNoRmFpbGVkJykgfSlcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5wdXNoRmFpbGVkJykgfSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgICB9XG4gICAgfSkoKVxuICB9XG5cbiAgLyoqIFNlbGVjdCBhIGxvY2FsIGNvbW1pdCBhbmQgbG9hZCBpdHMgZGlmZiBpbnRvIHRoZSByaWdodCBwYW5lLiAqL1xuICBjb25zdCBzZWxlY3RDb21taXQgPSAoY29tbWl0OiBDb21taXRJbmZvKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QpIHJldHVyblxuICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgc2V0U2VsZWN0ZWRDb21taXQoY29tbWl0KVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZkxvYWRpbmcodHJ1ZSlcbiAgICB2b2lkIGxvYWRDb21taXREaWZmKGFjdGl2ZUN3ZCwgY29tbWl0Lmhhc2gpXG4gICAgICAudGhlbigoZCkgPT4ge1xuICAgICAgICBzZXRDb21taXREaWZmKGQpXG4gICAgICAgIHNldENvbW1pdERpZmZMb2FkaW5nKGZhbHNlKVxuICAgICAgICAvLyBEZWZhdWx0IHRoZSBmaWxlIHRyZWUgdG8gdGhlIGZpcnN0IGNoYW5nZWQgZmlsZS5cbiAgICAgICAgaWYgKGQub2sgJiYgZC5maWxlcy5sZW5ndGggPiAwKSBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZC5maWxlc1swXS5wYXRoKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSkpXG4gIH1cblxuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cImRzZHItb3ZlcmxheVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3VycmVudFRhcmdldCkgY2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItcGFuZWxcIlxuICAgICAgICByb2xlPVwiZGlhbG9nXCJcbiAgICAgICAgYXJpYS1tb2RhbD1cInRydWVcIlxuICAgICAgICBhcmlhLWxhYmVsPXt0KCdyZXZpZXcudGl0bGUnKX1cbiAgICAgICAgc3R5bGU9e3sgd2lkdGg6IGAke3ByZWZzLndpZHRofXB4YCwgaGVpZ2h0OiBgJHtwcmVmcy5oZWlnaHR9cHhgLCAuLi5kaWZmU3R5bGVWYXJzKHByZWZzKSB9IGFzIENTU1Byb3BlcnRpZXN9XG4gICAgICA+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwiZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNcIlxuICAgICAgICAgIG9uUmVzaXplPXsoX2R4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNlXCJcbiAgICAgICAgICBvblJlc2l6ZT17KGR4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgICAgZC5oZWlnaHQgPSBNYXRoLm1heChNSU5fUEFORUxfSCwgTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gNjQsIGQuaGVpZ2h0ICsgZHkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1oZWFkZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRpdGxlXCI+e3QoJ3Jldmlldy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRhYnNcIiByb2xlPVwidGFibGlzdFwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfT5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0YWIgPT09ICdzZXNzaW9uJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3Nlc3Npb24nID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VGFiKCdzZXNzaW9uJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0KCd0YWIuc2Vzc2lvbicpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGFiID09PSAnd29ya3NwYWNlJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3dvcmtzcGFjZScgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3dvcmtzcGFjZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dCgndGFiLndvcmtzcGFjZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnICYmIHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zY29wZVwiPlxuICAgICAgICAgICAgICB7cmVwb3MubGVuZ3RoID4gMSA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgncmVwby5sYWJlbCcpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlcG9QYXRoID8/IGFjdGl2ZUN3ZCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e3JlcG9zLm1hcCgocikgPT4gKHsgdmFsdWU6IHIucGF0aCwgbGFiZWw6IGAke2Jhc2VOYW1lKHIucGF0aCl9JHtyLmJyYW5jaCA/IGAgKCR7ci5icmFuY2h9KWAgOiAnJ31gIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRSZXBvUGF0aCh2KVxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgICAgICAgICAgICAgICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUubGFiZWwnKX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2NvcGV9XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17U0NPUEVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBzLmlkLCBsYWJlbDogdChzLmxhYmVsKSB9KSl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRTY29wZSh2IGFzIFdvcmtzcGFjZVNjb3BlKVxuICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdzY29wZS5iYXNlJyl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YmFzZUJyYW5jaCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2JyYW5jaGVzLm1hcCgoYikgPT4gKHsgdmFsdWU6IGIsIGxhYmVsOiBiIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRCYXNlQnJhbmNofVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3VidGl0bGVcIj5cbiAgICAgICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJ1xuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5zZXNzaW9uU3RhdHMnLCB7IHJvdW5kczogcm91bmRzLmxlbmd0aCwgZmlsZXM6IHRvdGFsU2Vzc2lvbkZpbGVzIH0pXG4gICAgICAgICAgICAgIDogc3RhdHVzPy5pc1JlcG9cbiAgICAgICAgICAgICAgICA/IGAke3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9IFx1MDBCNyAke3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogdG90YWxBZGRlZCwgZGVsZXRlZDogdG90YWxEZWxldGVkIH0pfSR7c3RhdHVzLmFoZWFkID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmFoZWFkJywgeyBuOiBzdGF0dXMuYWhlYWQgfSl9YCA6ICcnfSR7c3RhdHVzLmJlaGluZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9YCA6ICcnfWBcbiAgICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5ub3RSZXBvJyl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBhbGxvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfSBvbkNsaWNrPXsoKSA9PiBvbkFsbEFjdGlvbignYWNjZXB0Jyl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c3RhZ2VkQ291bnQgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgcnVuQXBwbHkoJ3Vuc3RhZ2UnKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnVuc3RhZ2VBbGwnKX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXIke2NvbmZpcm0gPT09ICdhbGwnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQWxsQWN0aW9uKCdyZXZlcnQnKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnYWxsJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJykgOiB0KCdyZXZpZXcucmV2ZXJ0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtjb21taXRNZXNzYWdlfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0KCdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRDb21taXRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHZvaWQgb25Db21taXQoKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3kgfHwgIWNvbW1pdE1lc3NhZ2UudHJpbSgpIHx8IHN0YWdlZENvdW50ID09PSAwfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9uQ29tbWl0KCl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29tbWl0Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcuY2xvc2UnKX0gb25DbGljaz17Y2xvc2V9PlxuICAgICAgICAgICAgPEljb25YIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtzZW5kT3BlbiA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VuZFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLXRpdGxlXCI+e3QoJ3Jldmlldy5zZW5kVGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbmQtaGludFwiPnt0KCdyZXZpZXcuc2VuZEhpbnQnKX08L3NwYW4+XG4gICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3NOYW1lPVwiZHNkci1zZW5kLWlucHV0XCIgcmVhZE9ubHkgdmFsdWU9e3NlbmRUZXh0fSBzcGVsbENoZWNrPXtmYWxzZX0gLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gc2V0U2VuZE9wZW4oZmFsc2UpfT5cbiAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWJ0blwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdm9pZCBuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQoc2VuZFRleHQpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4gc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgncmV2aWV3LmNvcHlGYWlsZWQnKSB9KSxcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jb3B5Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIXNlbmRUZXh0LnRyaW0oKX0gb25DbGljaz17KCkgPT4gdm9pZCBzZW5kVG9BZ2VudCgpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRUb0FnZW50Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJyA/IChcbiAgICAgICAgICByb3VuZHMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICAgIHt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfVxuICAgICAgICAgICAgICB7c2Vzc2lvblNjYW4gJiYgc2Vzc2lvblNjYW4ucmVzdWx0cyA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdyZXZpZXcuc2Vzc2lvblNjYW4nLCB7IHJlc3VsdHM6IHNlc3Npb25TY2FuLnJlc3VsdHMsIGRpZmY6IHNlc3Npb25TY2FuLmRpZmZDYXJkcywgcGF0aDogc2Vzc2lvblNjYW4ucGF0aE9ubHkgfSl9PC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHktYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgb25DbGljaz17KCkgPT4gc2V0VGFiKCd3b3Jrc3BhY2UnKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmdvV29ya3NwYWNlJyl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLnNlc3Npb24nKX0+XG4gICAgICAgICAgICAgICAge3JvdW5kcy5tYXAoKHJvdW5kKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cm91bmQucm91bmR9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnJvdW5kJywgeyByb3VuZDogcm91bmQucm91bmQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAge3JvdW5kLmxhYmVsID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kLWxhYmVsXCIgdGl0bGU9e3JvdW5kLmxhYmVsfT57cm91bmQubGFiZWx9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2Vzc2lvblRyZWVzLmdldChyb3VuZC5yb3VuZCkgPz8gW119XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogY2hhbmdlLCBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3JvdW5kLnJvdW5kfToke2NoYW5nZS5wYXRofWBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkS2V5ID0gc2VsZWN0ZWRDaGFuZ2UgPyBgJHtzZWxlY3RlZFJvdW5kfToke3NlbGVjdGVkQ2hhbmdlLnBhdGh9YCA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtrZXkgPT09IHNlbGVjdGVkS2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7a2V5ID09PSBzZWxlY3RlZEtleSA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZC5yb3VuZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUGF0aChjaGFuZ2UucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hhbmdlLmhhc0RpZmYgPyAnZHNkci1jaGlwLW0nIDogJ2RzZHItY2hpcC11J31gfT57Y2hhbmdlLmhhc0RpZmYgPyAnTScgOiAnXHUwMEI3J308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17Y2hhbmdlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIiB0aXRsZT17Y2hhbmdlLnRvb2x9PntjaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ2hhbmdlLnBhdGh9PntzZWxlY3RlZENoYW5nZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj57c2VsZWN0ZWRDaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlLmhhc0RpZmYgPyA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkQ2hhbmdlLnBhdGgpfSB0aXRsZT17dCgnZWRpdG9yLm9wZW5GaWxlJyl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3IHt0KCdlZGl0b3Iub3BlbkZpbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gKFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPT09ICdzcGxpdCcgJiYgY2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYmVmb3JlJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmFmdGVyJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2NoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKS5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEFuY2hvciA9IHsgb2xkTGluZTogcm93LmxlZnROdW0sIG5ld0xpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cubGVmdE51bSAhPT0gbnVsbCA/IHJvdy5sZWZ0TnVtIDogbnVsbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cucmlnaHROdW0gIT09IG51bGwgPyByb3cucmlnaHROdW0gOiBudWxsLCBuZXdMaW5lOiByb3cucmlnaHROdW0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRLZXkgPSBgJHtsZWZ0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2xlZnRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0S2V5ID0gYCR7cmlnaHRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7cmlnaHRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgbGVmdEFuY2hvci5vbGRMaW5lLCBsZWZ0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIHJpZ2h0QW5jaG9yLm9sZExpbmUsIHJpZ2h0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRCdG4gPSAoYW5jaG9yOiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSwgY291bnQ6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50PXtjb3VudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmU6IGFuY2hvci5vbGRMaW5lLCBuZXdMaW5lOiBhbmNob3IubmV3TGluZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0PXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlbkJ0biA9IChsaW5lOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtb3BlbmxpbmVcIiB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkQ2hhbmdlLnBhdGgsIGxpbmUpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e3JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5sZWZ0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1kZWwnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtyb3cubGVmdE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5sZWZ0TnVtID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEJ0bihsZWZ0QW5jaG9yLCBsZWZ0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5sZWZ0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLmxlbmd0aCA+IDAgPyBsZWZ0Q29tbWVudHMubWFwKChjb21tZW50KSA9PiA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXt1cGRhdGVDb21tZW50fSBvbkRlbGV0ZT17KGlkKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoaWQpfSB0PXt0fSAvPikgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgbGVmdEtleSA9PT0gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5yaWdodE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5yaWdodE51bSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5yaWdodE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LnJpZ2h0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5sZW5ndGggPiAwID8gcmlnaHRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e3VwZGF0ZUNvbW1lbnR9IG9uRGVsZXRlPXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9IHQ9e3R9IC8+KSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiByaWdodEtleSA9PT0gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nlc3Npb25Sb3dzV2l0aExpbmVzKHNlbGVjdGVkQ2hhbmdlKS5tYXAoKHsgcm93LCBvbGRMaW5lLCBuZXdMaW5lIH0sIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke29sZExpbmUgPz8gJ28nfToke25ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0NvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBvbGRMaW5lLCBuZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3dBY3Rpb25zID0gcm93LmtpbmQgPT09ICdjdHgnIHx8IHJvdy5raW5kID09PSAnYWRkJyB8fCByb3cua2luZCA9PT0gJ2RlbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfSR7cm93Q29tbWVudHMubGVuZ3RoID4gMCA/ICcgZHNkci1saW5lLWNvbW1lbnRlZCcgOiAnJ31gfSBkYXRhLWRzZHItbGluZT17bmV3TGluZSA/PyBvbGRMaW5lID8/IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtbnVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtuZXdMaW5lID8/IG9sZExpbmUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyA/IDxDb21tZW50TGluZSBjb3VudD17cm93Q29tbWVudHMubGVuZ3RofSBvbk9wZW49eygpID0+IG9wZW5Db21tZW50KG9sZExpbmUsIG5ld0xpbmUpfSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtdGV4dFwiPntyb3cudGV4dCB8fCAnICd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zICYmIChuZXdMaW5lID8/IG9sZExpbmUpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLW9wZW5saW5lXCIgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZENoYW5nZS5wYXRoLCBuZXdMaW5lID8/IG9sZExpbmUgPz8gMSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyAmJiByb3dDb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93Q29tbWVudHMubWFwKChjb21tZW50KSA9PiA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXt1cGRhdGVDb21tZW50fSBvbkRlbGV0ZT17KGlkKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoaWQpfSB0PXt0fSAvPilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA9PT0ga2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHR9IG9uVGV4dD17c2V0Q29tbWVudFRleHR9IG9uU2F2ZT17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfSBvbkNhbmNlbD17Y2FuY2VsQ29tbWVudH0gYnVzeT17YnVzeX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdyZXZpZXcubm9EaWZmRGF0YScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgICkgOiBlcnJvciAmJiAhc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgICA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi53b3Jrc3BhY2UnKX0+XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2FsbCcgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIHtzdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIHt1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXt1bnN0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICd1bnN0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgdW5zdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdzdGFnZWQnID8gKFxuICAgICAgICAgICAgICAgIHN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvblN0YWdlZCcpfSAoe3N0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIHNjb3BlRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Njb3BlLmJyYW5jaCcpfSB7YmFzZUJyYW5jaCA/IGBcdTIxOTQgJHtiYXNlQnJhbmNofWAgOiAnJ30gKHtzY29wZUZpbGVzLmxlbmd0aH0pXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Njb3BlLmJyYW5jaFJlYWRvbmx5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2xhc3QtdHVybicgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgnc2NvcGUubGFzdC10dXJuJyl9ICh7c2NvcGVGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Njb3BlVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubGFzdFR1cm5FbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHsoc2NvcGUgPT09ICdhbGwnIHx8IHNjb3BlID09PSAnY29tbWl0JykgJiYgaGlzdG9yeS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuaGlzdG9yeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRpbWVsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIHtoaXN0b3J5Lm1hcCgoY29tbWl0KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGwtaXRlbSR7c2VsZWN0ZWRDb21taXQ/Lmhhc2ggPT09IGNvbW1pdC5oYXNoID8gJyBkc2RyLXRsLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRsLXJhaWxcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci10bC1kb3Qke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1kb3QtbG9jYWwnIDogJyBkc2RyLXRsLWRvdC1yZW1vdGUnfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2h9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0Q29tbWl0KGNvbW1pdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWJhZGdlJHtjb21taXQuYWhlYWQgPyAnIGRzZHItdGwtYmFkZ2UtbG9jYWwnIDogJyBkc2RyLXRsLWJhZGdlLXJlbW90ZSd9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWl0LmFoZWFkID8gdCgnaGlzdG9yeS5sb2NhbCcpIDogdCgnaGlzdG9yeS5yZW1vdGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtc2hvcnRcIj57Y29tbWl0LnNob3J0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zdWJqZWN0XCIgdGl0bGU9e2NvbW1pdC5zdWJqZWN0fT57Y29tbWl0LnN1YmplY3R9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LW1ldGFcIj57Y29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoY29tbWl0LmRhdGUsIHQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayAmJiBjb21taXREaWZmLmZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5jb21taXRGaWxlcycpfSAoe2NvbW1pdERpZmYuZmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgbm9kZXM9e2NvbW1pdEZpbGVzVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogZmlsZSwgbmFtZSB9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtzZWxlY3RlZENvbW1pdEZpbGUgPT09IGZpbGUucGF0aCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNoaXAgZHNkci1jaGlwLW1cIj57ZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25CcmFuY2gnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1icmFuY2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtcmVmXCIgdGl0bGU9e3N0YXR1cy51cHN0cmVhbSA/PyB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFycm93XCI+XHUyMTkyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMudXBzdHJlYW0gPz8gdCgncmV2aWV3Lm5vVXBzdHJlYW0nKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5haGVhZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1haGVhZFwiPnt0KCdyZXZpZXcuYWhlYWQnLCB7IG46IHN0YXR1cy5haGVhZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmJlaGluZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1iZWhpbmRcIj57dCgncmV2aWV3LmJlaGluZCcsIHsgbjogc3RhdHVzLmJlaGluZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID09PSAwICYmIHN0YXR1cy5iZWhpbmQgPT09IDAgJiYgc3RhdHVzLnVwc3RyZWFtID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtc3luY1wiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biR7Y29uZmlybSA9PT0gJ3B1c2gnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgKHN0YXR1cz8uYWhlYWQgPz8gMCkgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25QdXNofVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdwdXNoJyA/IHQoJ3Jldmlldy5jb25maXJtUHVzaCcpIDogYCR7dCgncmV2aWV3LnB1c2gnKX0keyhzdGF0dXM/LmFoZWFkID8/IDApID4gMCA/IGAgKCR7c3RhdHVzPy5haGVhZCA/PyAwfSlgIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtwcj8ucHIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci50aXRsZScsIHsgbnVtYmVyOiBwci5wci5udW1iZXIgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IGAgXHUwMEI3ICR7dCgncHIuY29tbWVudHMnLCB7IG46IHByLmNvbW1lbnRzLmxlbmd0aCB9KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXByXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdwci5ub1ByJyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXByLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUHJDb21tZW50Q2xpY2soY29tbWVudC5wYXRoLCBjb21tZW50LmxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudC5wYXRoID8gYCR7YmFzZU5hbWUoY29tbWVudC5wYXRoKX0ke2NvbW1lbnQubGluZSA/IGA6JHtjb21tZW50LmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCd9IFx1MDBCNyB7Y29tbWVudC5hdXRob3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcHItdGV4dFwiPntjb21tZW50LmJvZHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VQck1lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci5zZW5kQ29tbWVudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgIHtyZXZpZXc/Lm9rID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci12ZXJkaWN0JHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnIGRzZHItdmVyZGljdC1iYWQnIDogJyBkc2RyLXZlcmRpY3Qtb2snfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1hcmtcIj57cmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gJ1x1MjcxNycgOiAnXHUyNzEzJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXZlcmRpY3QtdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7cmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gdCgncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnKSA6IHQoJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCcpfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gdCgncmV2aWV3LmZpbmRpbmdzJywgeyBuOiByZXZpZXcuZmluZGluZ3MubGVuZ3RoIH0pIDogdCgncmV2aWV3Lm5vRmluZGluZ3MnKX1cbiAgICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAge3Jldmlldy5tb2RlbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdmVyZGljdC1tb2RlbFwiPntyZXZpZXcubW9kZWwucHJvdmlkZXJ9L3tyZXZpZXcubW9kZWwubW9kZWx9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VGaW5kaW5nc01lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZEZpbmRpbmdzJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQgPyAoXG4gICAgICAgICAgICAgICAgY29tbWl0RGlmZkxvYWRpbmcgPyAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiBjb21taXREaWZmPy5vayA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhhc2hcIj57c2VsZWN0ZWRDb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5hdXRob3J9IFx1MDBCNyB7cmVsYXRpdmVUaW1lKHNlbGVjdGVkQ29tbWl0LmRhdGUsIHQpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdERpZmYuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdERpZmYuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge2NvbW1pdEFjdGl2ZUZpbGUgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1maWxlLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e2NvbW1pdEFjdGl2ZUZpbGUucGF0aH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2hpcCBkc2RyLWNoaXAtbVwiPntjb21taXRGaWxlU3RhdHVzKGNvbW1pdFNlZ21lbnRzLmZpbmQoKHMpID0+IHMucGF0aCA9PT0gY29tbWl0QWN0aXZlRmlsZS5wYXRoKT8udGV4dCA/PyAnJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1maWxlLXBhdGhcIj57Y29tbWl0QWN0aXZlRmlsZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBjb21taXRBY3RpdmVGaWxlLmFkZGVkLCBkZWxldGVkOiBjb21taXRBY3RpdmVGaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7dmlldyA9PT0gJ3NwbGl0JyAmJiBnaXRTcGxpdEJsb2Nrcyhjb21taXRBY3RpdmVUZXh0KS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxTcGxpdERpZmYgYmxvY2tzPXtnaXRTcGxpdEJsb2Nrcyhjb21taXRBY3RpdmVUZXh0KX0gYmVmb3JlTGFiZWw9e3QoJ3ZpZXcuYmVmb3JlJyl9IGFmdGVyTGFiZWw9e3QoJ3ZpZXcuYWZ0ZXInKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge2dpdERpZmZSb3dzKGNvbW1pdEFjdGl2ZVRleHQpLm1hcCgocm93LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e2NvbW1pdERpZmY/LmVycm9yID8/IHQoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogc2VsZWN0ZWRGaWxlID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5vcmlnUGF0aCA/IGAgXHUyMTkwICR7c2VsZWN0ZWRGaWxlLm9yaWdQYXRofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogc2VsZWN0ZWRGaWxlLmFkZGVkLCBkZWxldGVkOiBzZWxlY3RlZEZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRGaWxlLnBhdGgpfSB0aXRsZT17dCgnZWRpdG9yLm9wZW5GaWxlJyl9PlxuICAgICAgICAgICAgICAgICAgICAgIFx1MjE5NyB7dCgnZWRpdG9yLm9wZW5GaWxlJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zICYmIHNlbGVjdGVkRmlsZS51bnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbignYWNjZXB0Jywgc2VsZWN0ZWRGaWxlLnBhdGgpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zICYmIHNlbGVjdGVkRmlsZS5zdGFnZWQgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCd1bnN0YWdlJywgc2VsZWN0ZWRGaWxlLnBhdGgpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcudW5zdGFnZScpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuIGRzZHItYnRuLWRhbmdlciR7Y29uZmlybSA9PT0gJ2ZpbGUnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbigncmV2ZXJ0Jywgc2VsZWN0ZWRGaWxlLnBhdGgpfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnZmlsZScgPyB0KCdyZXZpZXcuY29uZmlybVJldmVydCcpIDogdCgncmV2aWV3LnJldmVydCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3ZpZXcgPT09ICdzcGxpdCcgJiYgIXNlbGVjdGVkRmlsZS5iaW5hcnkgJiYgZ2l0U3BsaXRCbG9ja3Moc2VsZWN0ZWRGaWxlLmRpZmYpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYmVmb3JlJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYWZ0ZXInKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Z2l0U3BsaXRCbG9ja3Moc2VsZWN0ZWRGaWxlLmRpZmYpLm1hcCgoYmxvY2ssIGJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zID8gPEh1bmtUb29sYmFyIGh1bms9e3NlbGVjdGVkRmlsZS5odW5rc1tiaV19IGJ1c3k9e2J1c3l9IG9uQWN0aW9uPXtvbkh1bmtBY3Rpb259IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0ZpbmRpbmdzID0gKHJldmlldz8uZmluZGluZ3MgPz8gW10pLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGYpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZi5maWxlID09PSBzZWxlY3RlZEZpbGUucGF0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyb3cucmlnaHROdW0gIT09IG51bGwgPyByb3cucmlnaHROdW0gPj0gZi5saW5lU3RhcnQgJiYgcm93LnJpZ2h0TnVtIDw9IGYubGluZUVuZCA6IHJvdy5sZWZ0TnVtICE9PSBudWxsICYmIHJvdy5sZWZ0TnVtID49IGYubGluZVN0YXJ0ICYmIHJvdy5sZWZ0TnVtIDw9IGYubGluZUVuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5nQ2xzID0gcm93RmluZGluZ3MubGVuZ3RoID4gMCA/IGAgZHNkci1jZWxsLWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YCA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wZWQgPSBqdW1wTGluZSAhPSBudWxsICYmIChyb3cucmlnaHROdW0gPT09IGp1bXBMaW5lIHx8IChyb3cucmlnaHROdW0gPT09IG51bGwgJiYgcm93LmxlZnROdW0gPT09IGp1bXBMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW1lbnQgYW5jaG9ycyBzdGF5IGNvbnNpc3RlbnQgd2l0aCB0aGUgdW5pZmllZCB2aWV3OiBjdHggcm93cyBleHBvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJvdGggbGluZSBudW1iZXJzLCBjaGFuZ2Ugcm93cyBleHBvc2UgdGhlIHNpZGUgdGhleSBiZWxvbmcgdG8uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0QW5jaG9yID0geyBvbGRMaW5lOiByb3cubGVmdE51bSwgbmV3TGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5sZWZ0TnVtICE9PSBudWxsID8gcm93LmxlZnROdW0gOiBudWxsIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0QW5jaG9yID0geyBvbGRMaW5lOiByb3cua2luZCA9PT0gJ2N0eCcgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gcm93LnJpZ2h0TnVtIDogbnVsbCwgbmV3TGluZTogcm93LnJpZ2h0TnVtIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRLZXkgPSBgJHtsZWZ0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2xlZnRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRLZXkgPSBgJHtyaWdodEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtyaWdodEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIGxlZnRBbmNob3Iub2xkTGluZSwgbGVmdEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIHJpZ2h0QW5jaG9yLm9sZExpbmUsIHJpZ2h0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlbkJ0biA9IChsaW5lOiBudW1iZXIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRmlsZS5wYXRoID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtb3BlbmxpbmVcIiB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkRmlsZS5wYXRoLCBsaW5lKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRCdG4gPSAoYW5jaG9yOiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSwgY291bnQ6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudD17Y291bnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZTogYW5jaG9yLm9sZExpbmUsIG5ld0xpbmU6IGFuY2hvci5uZXdMaW5lIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5sZWZ0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4obGVmdEFuY2hvciwgbGVmdENvbW1lbnRzLmxlbmd0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5sZWZ0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cubGVmdE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93RmluZGluZ3MubGVuZ3RoID4gMCAmJiByb3cucmlnaHROdW0gPT09IG51bGwgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YH0+e3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLmxlbmd0aCA+IDAgPyBsZWZ0Q29tbWVudHMubWFwKChjb21tZW50KSA9PiA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXt1cGRhdGVDb21tZW50fSBvbkRlbGV0ZT17KGlkKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoaWQpfSB0PXt0fSAvPikgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiBsZWZ0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ30ke2ZpbmRpbmdDbHN9JHtqdW1wZWQgPyAnIGRzZHItY2VsbC1qdW1wJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtyb3cucmlnaHROdW0gPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5yaWdodE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LnJpZ2h0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dGaW5kaW5ncy5sZW5ndGggPiAwICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gfT57cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLmxlbmd0aCA+IDAgPyByaWdodENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgcmlnaHRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KHJldmlldz8uZmluZGluZ3MgPz8gW10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChmKSA9PiBmLmZpbGUgPT09IHNlbGVjdGVkRmlsZS5wYXRoICYmIGYubGluZVN0YXJ0ID09PSAocm93LmxlZnROdW0gPz8gcm93LnJpZ2h0TnVtKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGYsIGZpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaW5kaW5nQ2FyZCBrZXk9e2Ake2YuZmlsZX06JHtmLmxpbmVTdGFydH06JHtmaX1gfSBmaW5kaW5nPXtmfSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8VW5pZmllZERpZmZcbiAgICAgICAgICAgICAgICAgICAgICBkaWZmPXtzZWxlY3RlZEZpbGUuZGlmZn1cbiAgICAgICAgICAgICAgICAgICAgICBodW5rcz17c2VsZWN0ZWRGaWxlLmh1bmtzfVxuICAgICAgICAgICAgICAgICAgICAgIGJ1c3k9e2J1c3l9XG4gICAgICAgICAgICAgICAgICAgICAgb25IdW5rQWN0aW9uPXtvbkh1bmtBY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50cz17Y29tbWVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudEVkaXRvcj17Y29tbWVudEVkaXRvcn1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50VGV4dD17Y29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25Db21tZW50VGV4dD17c2V0Q29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuQ29tbWVudD17b3BlbkNvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgb25TYXZlQ29tbWVudD17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsQ29tbWVudD17Y2FuY2VsQ29tbWVudH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUNvbW1lbnQ9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX1cbiAgICAgICAgICAgICAgICAgICAgICBvblVwZGF0ZUNvbW1lbnQ9e3VwZGF0ZUNvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk9eyFhbGxvd0FjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgcGF0aD17c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgcmV2aWV3RmluZGluZ3M9e3Jldmlldz8uZmluZGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuTGluZT17KHAsIGxpbmUpID0+IHZvaWQgb3BlbkZpbGUocCwgbGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAganVtcExpbmU9e2p1bXBMaW5lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntzY29wZSA9PT0gJ2NvbW1pdCcgPyB0KCdyZXZpZXcuc2VsZWN0Q29tbWl0JykgOiB0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yID8/IHQoJ3Jldmlldy5sb2FkRXJyb3InKX1cbiAgICAgICAgICAgIHshc3RhdHVzPy5pc1JlcG8gPyA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mb290XCI+XG4gICAgICAgICAgeyhsb2FkaW5nIHx8IGJ1c3kpICYmIHRhYiA9PT0gJ3dvcmtzcGFjZScgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwaW5uZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2J1c3kgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLW5vdGljZVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIHtub3RpY2UgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLW5vdGljZSBkc2RyLW5vdGljZS0ke25vdGljZS5raW5kfWB9Pntub3RpY2UudGV4dH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQ29uZmlnIGNhcmQgZm9yIHRoZSBQbHVnaW5zIGNvbmZpZ3VyYXRpb24gdGFiIChTZXR0aW5ncyBcdTIxOTIgUGx1Z2lucyBcdTIxOTIgXHU1M0VGXHU5MTREXHU3RjZFKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb25maWdDYXJkKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJkIGRzZHItY2ZnLWNhcmQtb3BlbicgOiAnZHNkci1jZmctY2FyZCd9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZFwiIGFyaWEtZXhwYW5kZWQ9e29wZW59IG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWhlYWQtdGV4dFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLW5hbWVcIj57dCgnc2V0dGluZ3MudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctZGVzY1wiPnt0KCdjb25maWcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93bk91dGxpbmUxNCBjbGFzc05hbWU9e29wZW4gPyAnZHNkci1jZmctY2FyZXQgZHNkci1jZmctY2FyZXQtb3BlbicgOiAnZHNkci1jZmctY2FyZXQnfSAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1ib2R5XCI+XG4gICAgICAgICAgPERpZmZSZXZpZXdQcmVmcyB0PXt0fSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbGk+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG4gIC8vIENvZGV4LXN0eWxlIHBlbmRpbmctY29tbWVudHMgc3RyaXAgYXQgdGhlIFRPUCBvZiB0aGUgY29tcG9zZXIsIHN0eWxlZCBhc1xuICAvLyB0aGUgY2FyZCdzIG93biBzdXJmYWNlIHNvIGl0IHJlYWRzIGFzIG9uZSBmdXNlZCBkaWFsb2cuXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uaW5wdXQuZG9jaycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29tbWVudHMtZG9jaycsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrLFxuICAgICksXG4gIClcbiAgLy8gVGhlIGNhcnJpZWQgcmV2aWV3IHBhY2thZ2UgcmVuZGVycyBpbiB0aGUgdHJhbnNjcmlwdCBhcyBhIENvZGV4LXN0eWxlXG4gIC8vIGNhcmQ6IHNoYWRvdyB0aGUgc2hlbGwncyB1c2VyLW5vZGUgcmVuZGVyZXIgKHByaW9yaXR5IC0xID0gbG93ZXN0IHdpbnMpXG4gIC8vIGFuZCByZS1yZW5kZXIgbm9uLXBhY2thZ2UgbWVzc2FnZXMgd2l0aCBhIG5hdGl2ZS1sb29rIGJ1YmJsZS5cbiAgY3R4LnNsb3RzLmluamVjdCgnY29udmVyc2F0aW9uLmNoYXQubm9kZScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLmNoYXQubm9kZScsXG4gICAgICAgIGtleTogJ3VzZXInLFxuICAgICAgICBwcmlvcml0eTogLTEsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIFVzZXJSZXZpZXdOb2RlVmlldyxcbiAgICApLFxuICApXG4gIC8vIFRoZSBwbHVnaW4ncyBvd24gc2V0dGluZ3MgdGFiIGluc2lkZSBcdThCQkVcdTdGNkUgXHUyMTkyIFx1NjNEMlx1NEVGNiAobm90IHRoZSBHZW5lcmFsIHNlY3Rpb24pLlxuICAvLyBUaGUgcGx1Z2luJ3Mgd2hvbGUgY29uZmlndXJhdGlvbiBsaXZlcyBpbiBvbmUgY2FyZCBpbnNpZGVcbiAgLy8gXHU4QkJFXHU3RjZFIFx1MjE5MiBcdTYzRDJcdTRFRjYgXHUyMTkyIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RSAoc2V0dGluZ3MucGx1Z2luLml0ZW0pOiBmb250L3NpemUuXG4gIGN0eC5zbG90cy5pbmplY3QoJ3NldHRpbmdzLnBsdWdpbi5pdGVtJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzZXR0aW5ncy5wbHVnaW4uaXRlbScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29uZmlnJyxcbiAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29uZmlnQ2FyZCxcbiAgICApLFxuICApXG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZiB7XG4gICAgZGlmZihvbGRTdHIsIG5ld1N0ciwgXG4gICAgLy8gVHlwZSBiZWxvdyBpcyBub3QgYWNjdXJhdGUvY29tcGxldGUgLSBzZWUgYWJvdmUgZm9yIGZ1bGwgcG9zc2liaWxpdGllcyAtIGJ1dCBpdCBjb21waWxlc1xuICAgIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBsZXQgY2FsbGJhY2s7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCdjYWxsYmFjaycgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IHN1YmNsYXNzZXMgdG8gbWFzc2FnZSB0aGUgaW5wdXQgcHJpb3IgdG8gcnVubmluZ1xuICAgICAgICBjb25zdCBvbGRTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChvbGRTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBuZXdTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChuZXdTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBvbGRUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUob2xkU3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIGNvbnN0IG5ld1Rva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShuZXdTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBkb25lID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucG9zdFByb2Nlc3ModmFsdWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNhbGxiYWNrKHZhbHVlKTsgfSwgMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IGVkaXRMZW5ndGggPSAxO1xuICAgICAgICBsZXQgbWF4RWRpdExlbmd0aCA9IG5ld0xlbiArIG9sZExlbjtcbiAgICAgICAgaWYgKG9wdGlvbnMubWF4RWRpdExlbmd0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXhFZGl0TGVuZ3RoID0gTWF0aC5taW4obWF4RWRpdExlbmd0aCwgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhFeGVjdXRpb25UaW1lID0gKF9hID0gb3B0aW9ucy50aW1lb3V0KSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgYWJvcnRBZnRlclRpbWVzdGFtcCA9IERhdGUubm93KCkgKyBtYXhFeGVjdXRpb25UaW1lO1xuICAgICAgICBjb25zdCBiZXN0UGF0aCA9IFt7IG9sZFBvczogLTEsIGxhc3RDb21wb25lbnQ6IHVuZGVmaW5lZCB9XTtcbiAgICAgICAgLy8gU2VlZCBlZGl0TGVuZ3RoID0gMCwgaS5lLiB0aGUgY29udGVudCBzdGFydHMgd2l0aCB0aGUgc2FtZSB2YWx1ZXNcbiAgICAgICAgbGV0IG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiZXN0UGF0aFswXSwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIDAsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoYmVzdFBhdGhbMF0ub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgIC8vIElkZW50aXR5IHBlciB0aGUgZXF1YWxpdHkgYW5kIHRva2VuaXplclxuICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiZXN0UGF0aFswXS5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2Ugd2UgaGl0IHRoZSByaWdodCBlZGdlIG9mIHRoZSBlZGl0IGdyYXBoIG9uIHNvbWUgZGlhZ29uYWwgaywgd2UgY2FuXG4gICAgICAgIC8vIGRlZmluaXRlbHkgcmVhY2ggdGhlIGVuZCBvZiB0aGUgZWRpdCBncmFwaCBpbiBubyBtb3JlIHRoYW4gayBlZGl0cywgc29cbiAgICAgICAgLy8gdGhlcmUncyBubyBwb2ludCBpbiBjb25zaWRlcmluZyBhbnkgbW92ZXMgdG8gZGlhZ29uYWwgaysxIGFueSBtb3JlIChmcm9tXG4gICAgICAgIC8vIHdoaWNoIHdlJ3JlIGd1YXJhbnRlZWQgdG8gbmVlZCBhdCBsZWFzdCBrKzEgbW9yZSBlZGl0cykuXG4gICAgICAgIC8vIFNpbWlsYXJseSwgb25jZSB3ZSd2ZSByZWFjaGVkIHRoZSBib3R0b20gb2YgdGhlIGVkaXQgZ3JhcGgsIHRoZXJlJ3Mgbm9cbiAgICAgICAgLy8gcG9pbnQgY29uc2lkZXJpbmcgbW92ZXMgdG8gbG93ZXIgZGlhZ29uYWxzLlxuICAgICAgICAvLyBXZSByZWNvcmQgdGhpcyBmYWN0IGJ5IHNldHRpbmcgbWluRGlhZ29uYWxUb0NvbnNpZGVyIGFuZFxuICAgICAgICAvLyBtYXhEaWFnb25hbFRvQ29uc2lkZXIgdG8gc29tZSBmaW5pdGUgdmFsdWUgb25jZSB3ZSd2ZSBoaXQgdGhlIGVkZ2Ugb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGguXG4gICAgICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGlzIG5vdCBmYWl0aGZ1bCB0byB0aGUgb3JpZ2luYWwgYWxnb3JpdGhtIHByZXNlbnRlZCBpblxuICAgICAgICAvLyBNeWVycydzIHBhcGVyLCB3aGljaCBpbnN0ZWFkIHBvaW50bGVzc2x5IGV4dGVuZHMgRC1wYXRocyBvZmYgdGhlIGVuZCBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaCAtIHNlZSBwYWdlIDcgb2YgTXllcnMncyBwYXBlciB3aGljaCBub3RlcyB0aGlzIHBvaW50XG4gICAgICAgIC8vIGV4cGxpY2l0bHkgYW5kIGlsbHVzdHJhdGVzIGl0IHdpdGggYSBkaWFncmFtLiBUaGlzIGhhcyBtYWpvciBwZXJmb3JtYW5jZVxuICAgICAgICAvLyBpbXBsaWNhdGlvbnMgZm9yIHNvbWUgY29tbW9uIHNjZW5hcmlvcy4gRm9yIGluc3RhbmNlLCB0byBjb21wdXRlIGEgZGlmZlxuICAgICAgICAvLyB3aGVyZSB0aGUgbmV3IHRleHQgc2ltcGx5IGFwcGVuZHMgZCBjaGFyYWN0ZXJzIG9uIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIHRleHQgb2YgbGVuZ3RoIG4sIHRoZSB0cnVlIE15ZXJzIGFsZ29yaXRobSB3aWxsIHRha2UgTyhuK2ReMilcbiAgICAgICAgLy8gdGltZSB3aGlsZSB0aGlzIG9wdGltaXphdGlvbiBuZWVkcyBvbmx5IE8obitkKSB0aW1lLlxuICAgICAgICBsZXQgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gLUluZmluaXR5LCBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBJbmZpbml0eTtcbiAgICAgICAgLy8gTWFpbiB3b3JrZXIgbWV0aG9kLiBjaGVja3MgYWxsIHBlcm11dGF0aW9ucyBvZiBhIGdpdmVuIGVkaXQgbGVuZ3RoIGZvciBhY2NlcHRhbmNlLlxuICAgICAgICBjb25zdCBleGVjRWRpdExlbmd0aCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGRpYWdvbmFsUGF0aCA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgLWVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggPD0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBlZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoICs9IDIpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdLCBhZGRQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gb25lIGVsc2UgaXMgZ29pbmcgdG8gYXR0ZW1wdCB0byB1c2UgdGhpcyB2YWx1ZSwgY2xlYXIgaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjYW5BZGQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGF0IG5ld1BvcyB3aWxsIGJlIGFmdGVyIHdlIGRvIGFuIGluc2VydGlvbjpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkUGF0aE5ld1BvcyA9IGFkZFBhdGgub2xkUG9zIC0gZGlhZ29uYWxQYXRoO1xuICAgICAgICAgICAgICAgICAgICBjYW5BZGQgPSBhZGRQYXRoICYmIDAgPD0gYWRkUGF0aE5ld1BvcyAmJiBhZGRQYXRoTmV3UG9zIDwgbmV3TGVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBjYW5SZW1vdmUgPSByZW1vdmVQYXRoICYmIHJlbW92ZVBhdGgub2xkUG9zICsgMSA8IG9sZExlbjtcbiAgICAgICAgICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgcGF0aCBpcyBhIHRlcm1pbmFsIHRoZW4gcHJ1bmVcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgZGlhZ29uYWwgdGhhdCB3ZSB3YW50IHRvIGJyYW5jaCBmcm9tLiBXZSBzZWxlY3QgdGhlIHByaW9yXG4gICAgICAgICAgICAgICAgLy8gcGF0aCB3aG9zZSBwb3NpdGlvbiBpbiB0aGUgb2xkIHN0cmluZyBpcyB0aGUgZmFydGhlc3QgZnJvbSB0aGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRvZXMgbm90IHBhc3MgdGhlIGJvdW5kcyBvZiB0aGUgZGlmZiBncmFwaFxuICAgICAgICAgICAgICAgIGlmICghY2FuUmVtb3ZlIHx8IChjYW5BZGQgJiYgcmVtb3ZlUGF0aC5vbGRQb3MgPCBhZGRQYXRoLm9sZFBvcykpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChhZGRQYXRoLCB0cnVlLCBmYWxzZSwgMCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKHJlbW92ZVBhdGgsIGZhbHNlLCB0cnVlLCAxLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpIHx8IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlZGl0TGVuZ3RoKys7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcmZvcm1zIHRoZSBsZW5ndGggb2YgZWRpdCBpdGVyYXRpb24uIElzIGEgYml0IGZ1Z2x5IGFzIHRoaXMgaGFzIHRvIHN1cHBvcnQgdGhlXG4gICAgICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAgICAgLy8gaXMgcHJvZHVjZWQsIG9yIHVudGlsIHRoZSBlZGl0IGxlbmd0aCBleGNlZWRzIG9wdGlvbnMubWF4RWRpdExlbmd0aCAoaWYgZ2l2ZW4pLFxuICAgICAgICAvLyBpbiB3aGljaCBjYXNlIGl0IHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoIHx8IERhdGUubm93KCkgPiBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChlZGl0TGVuZ3RoIDw9IG1heEVkaXRMZW5ndGggJiYgRGF0ZS5ub3coKSA8PSBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFRvUGF0aChwYXRoLCBhZGRlZCwgcmVtb3ZlZCwgb2xkUG9zSW5jLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwYXRoLmxhc3RDb21wb25lbnQ7XG4gICAgICAgIGlmIChsYXN0ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IGxhc3QuY291bnQgKyAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0LnByZXZpb3VzQ29tcG9uZW50IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IG9sZFBvcyA9IGJhc2VQYXRoLm9sZFBvcywgbmV3UG9zID0gb2xkUG9zIC0gZGlhZ29uYWxQYXRoLCBjb21tb25Db3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChuZXdQb3MgKyAxIDwgbmV3TGVuICYmIG9sZFBvcyArIDEgPCBvbGRMZW4gJiYgdGhpcy5lcXVhbHMob2xkVG9rZW5zW29sZFBvcyArIDFdLCBuZXdUb2tlbnNbbmV3UG9zICsgMV0sIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBuZXdQb3MrKztcbiAgICAgICAgICAgIG9sZFBvcysrO1xuICAgICAgICAgICAgY29tbW9uQ291bnQrKztcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IDEsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbkNvdW50ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogY29tbW9uQ291bnQsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgYmFzZVBhdGgub2xkUG9zID0gb2xkUG9zO1xuICAgICAgICByZXR1cm4gbmV3UG9zO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29tcGFyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY29tcGFyYXRvcihsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHRcbiAgICAgICAgICAgICAgICB8fCAoISFvcHRpb25zLmlnbm9yZUNhc2UgJiYgbGVmdC50b0xvd2VyQ2FzZSgpID09PSByaWdodC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVFbXB0eShhcnJheSkge1xuICAgICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBjYXN0SW5wdXQodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xuICAgIH1cbiAgICBqb2luKGNoYXJzKSB7XG4gICAgICAgIC8vIEFzc3VtZXMgVmFsdWVUIGlzIHN0cmluZywgd2hpY2ggaXMgdGhlIGNhc2UgZm9yIG1vc3Qgc3ViY2xhc3Nlcy5cbiAgICAgICAgLy8gV2hlbiBpdCdzIGZhbHNlLCBlLmcuIGluIGRpZmZBcnJheXMsIHRoaXMgbWV0aG9kIG5lZWRzIHRvIGJlIG92ZXJyaWRkZW4gKGUuZy4gd2l0aCBhIG5vLW9wKVxuICAgICAgICAvLyBZZXMsIHRoZSBjYXN0cyBhcmUgdmVyYm9zZSBhbmQgdWdseSwgYmVjYXVzZSB0aGlzIHBhdHRlcm4gLSBvZiBoYXZpbmcgdGhlIGJhc2UgY2xhc3MgU09SVCBPRlxuICAgICAgICAvLyBhc3N1bWUgdG9rZW5zIGFuZCB2YWx1ZXMgYXJlIHN0cmluZ3MsIGJ1dCBub3QgY29tcGxldGVseSAtIGlzIHdlaXJkIGFuZCBqYW5reS5cbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH1cbiAgICBwb3N0UHJvY2VzcyhjaGFuZ2VPYmplY3RzLCBcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gY2hhbmdlT2JqZWN0cztcbiAgICB9XG4gICAgZ2V0IHVzZUxvbmdlc3RUb2tlbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBidWlsZFZhbHVlcyhsYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2Vucykge1xuICAgICAgICAvLyBGaXJzdCB3ZSBjb252ZXJ0IG91ciBsaW5rZWQgbGlzdCBvZiBjb21wb25lbnRzIGluIHJldmVyc2Ugb3JkZXIgdG8gYW5cbiAgICAgICAgLy8gYXJyYXkgaW4gdGhlIHJpZ2h0IG9yZGVyOlxuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gW107XG4gICAgICAgIGxldCBuZXh0Q29tcG9uZW50O1xuICAgICAgICB3aGlsZSAobGFzdENvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGxhc3RDb21wb25lbnQpO1xuICAgICAgICAgICAgbmV4dENvbXBvbmVudCA9IGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBkZWxldGUgbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGxhc3RDb21wb25lbnQgPSBuZXh0Q29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbXBvbmVudHMucmV2ZXJzZSgpO1xuICAgICAgICBjb25zdCBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aDtcbiAgICAgICAgbGV0IGNvbXBvbmVudFBvcyA9IDAsIG5ld1BvcyA9IDAsIG9sZFBvcyA9IDA7XG4gICAgICAgIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wb25lbnRzW2NvbXBvbmVudFBvc107XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQgJiYgdGhpcy51c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9sZFRva2Vuc1tvbGRQb3MgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGRWYWx1ZS5sZW5ndGggPiB2YWx1ZS5sZW5ndGggPyBvbGRWYWx1ZSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG9sZFRva2Vucy5zbGljZShvbGRQb3MsIG9sZFBvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHM7XG4gICAgfVxufVxuIiwgImltcG9ydCBEaWZmIGZyb20gJy4vYmFzZS5qcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZU9wdGlvbnMgfSBmcm9tICcuLi91dGlsL3BhcmFtcy5qcyc7XG5jbGFzcyBMaW5lRGlmZiBleHRlbmRzIERpZmYge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnRva2VuaXplID0gdG9rZW5pemU7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICAvLyBJZiB3ZSdyZSBpZ25vcmluZyB3aGl0ZXNwYWNlLCB3ZSBuZWVkIHRvIG5vcm1hbGlzZSBsaW5lcyBieSBzdHJpcHBpbmdcbiAgICAgICAgLy8gd2hpdGVzcGFjZSBiZWZvcmUgY2hlY2tpbmcgZXF1YWxpdHkuIChUaGlzIGhhcyBhbiBhbm5veWluZyBpbnRlcmFjdGlvblxuICAgICAgICAvLyB3aXRoIG5ld2xpbmVJc1Rva2VuIHRoYXQgcmVxdWlyZXMgc3BlY2lhbCBoYW5kbGluZzogaWYgbmV3bGluZXMgZ2V0IHRoZWlyXG4gICAgICAgIC8vIG93biB0b2tlbiwgdGhlbiB3ZSBET04nVCB3YW50IHRvIHRyaW0gdGhlICpuZXdsaW5lKiB0b2tlbnMgZG93biB0byBlbXB0eVxuICAgICAgICAvLyBzdHJpbmdzLCBzaW5jZSB0aGlzIHdvdWxkIGNhdXNlIHVzIHRvIHRyZWF0IHdoaXRlc3BhY2Utb25seSBsaW5lIGNvbnRlbnRcbiAgICAgICAgLy8gYXMgZXF1YWwgdG8gYSBzZXBhcmF0b3IgYmV0d2VlbiBsaW5lcywgd2hpY2ggd291bGQgYmUgd2VpcmQgYW5kXG4gICAgICAgIC8vIGluY29uc2lzdGVudCB3aXRoIHRoZSBkb2N1bWVudGVkIGJlaGF2aW9yIG9mIHRoZSBvcHRpb25zLilcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFsZWZ0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhcmlnaHQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5pZ25vcmVOZXdsaW5lQXRFb2YgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIGlmIChsZWZ0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyaWdodC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgbGluZURpZmYgPSBuZXcgTGluZURpZmYoKTtcbmV4cG9ydCBmdW5jdGlvbiBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZlRyaW1tZWRMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgeyBpZ25vcmVXaGl0ZXNwYWNlOiB0cnVlIH0pO1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbi8vIEV4cG9ydGVkIHN0YW5kYWxvbmUgc28gaXQgY2FuIGJlIHVzZWQgZnJvbSBqc29uRGlmZiB0b28uXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5zdHJpcFRyYWlsaW5nQ3IpIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9uZSBcXHIgYmVmb3JlIFxcbiB0byBtYXRjaCBHTlUgZGlmZidzIC0tc3RyaXAtdHJhaWxpbmctY3IgYmVoYXZpb3JcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuICAgIH1cbiAgICBjb25zdCByZXRMaW5lcyA9IFtdLCBsaW5lc0FuZE5ld2xpbmVzID0gdmFsdWUuc3BsaXQoLyhcXG58XFxyXFxuKS8pO1xuICAgIC8vIElnbm9yZSB0aGUgZmluYWwgZW1wdHkgdG9rZW4gdGhhdCBvY2N1cnMgaWYgdGhlIHN0cmluZyBlbmRzIHdpdGggYSBuZXcgbGluZVxuICAgIGlmICghbGluZXNBbmROZXdsaW5lc1tsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIGxpbmVzQW5kTmV3bGluZXMucG9wKCk7XG4gICAgfVxuICAgIC8vIE1lcmdlIHRoZSBjb250ZW50IGFuZCBsaW5lIHNlcGFyYXRvcnMgaW50byBzaW5nbGUgdG9rZW5zXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc0FuZE5ld2xpbmVzW2ldO1xuICAgICAgICBpZiAoaSAlIDIgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9IGxpbmU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRMaW5lcztcbn1cbiIsICIvKipcbiAqIFJldmlldy1wYWNrYWdlIHBhcnNpbmcgZm9yIHRoZSBDb2RleC1zdHlsZSBjb252ZXJzYXRpb24gY2FyZC5cbiAqXG4gKiBUaGUgcGx1Z2luIGluamVjdHMgdGhlIHBlbmRpbmcgaW5saW5lIGNvbW1lbnRzIChwbHVzIHRoZWlyIGRpZmYgaHVua3MgYW5kXG4gKiB0aGUgb3B0aW9uYWwgQUkgdmVyZGljdCkgYXMgb25lIHBsYWluIHVzZXIgbWVzc2FnZS4gVGhpcyBtb2R1bGUgcmUtcGFyc2VzXG4gKiB0aGF0IG1lc3NhZ2UgdGV4dCBzbyB0aGUgY29udmVyc2F0aW9uIGNhbiByZW5kZXIgaXQgYXMgYSBjYXJkIFx1MjAxNCBlYWNoXG4gKiBjb21tZW50IGNsaWNrYWJsZSB0byBqdW1wIHRvIHRoZSBtYXRjaGluZyBjaGFuZ2UgYmxvY2sgaW4gdGhlIHJldmlldyBwYW5lbC5cbiAqXG4gKiBQdXJlIGZ1bmN0aW9ucyBvbmx5OiB0aGUgY2xpZW50IGJ1bmRsZSBjYW5ub3QgYmUgaW1wb3J0ZWQgaW4gbm9kZSwgc28gdGhlXG4gKiB1bml0IHRlc3QgKHNjcmlwdHMvcmV2aWV3LXBhY2thZ2UtdGVzdC5tanMpIGJ1bmRsZXMgdGhpcyBtb2R1bGUgd2l0aCBlc2J1aWxkXG4gKiBhbmQgZXhlcmNpc2VzIHRoZSBleGFjdCBzYW1lIGNvZGUgdGhlIGJyb3dzZXIgcnVucy5cbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFJldmlld1BhY2thZ2VDb21tZW50IHtcbiAgLyoqIFJlcG8tcmVsYXRpdmUgcGF0aCAoc2FtZSBhcyB0aGUgc2VjdGlvbiBoZWFkZXIgcGF0aCkuICovXG4gIHBhdGg6IHN0cmluZ1xuICAvKiogUG9zdC1jaGFuZ2UgbGluZSAoMS1iYXNlZCk7IG51bGwgd2hlbiBvbmx5IHRoZSBvbGQtbGluZSBhbmNob3IgZXhpc3RzLiAqL1xuICBsaW5lOiBudW1iZXIgfCBudWxsXG4gIC8qKiBDb21tZW50IHRleHQuICovXG4gIHRleHQ6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJldmlld1BhY2thZ2VGaW5kaW5nIHtcbiAgcHJpb3JpdHk6ICdQMCcgfCAnUDEnIHwgJ1AyJyB8ICdQMydcbiAgZmlsZTogc3RyaW5nXG4gIGxpbmU6IG51bWJlclxuICB0aXRsZTogc3RyaW5nXG4gIGRldGFpbDogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmV2aWV3UGFja2FnZSB7XG4gIC8qKiBXb3Jrc3BhY2Ugcm9vdCBlbWJlZGRlZCBpbiB0aGUgbWVzc2FnZSAoXHU1REU1XHU0RjVDXHU1MzNBXHVGRjFBLi4uKSwgd2hlbiBwcmVzZW50LiAqL1xuICB3b3Jrc3BhY2U6IHN0cmluZyB8IG51bGxcbiAgY29tbWVudHM6IFJldmlld1BhY2thZ2VDb21tZW50W11cbiAgdmVyZGljdDogJ2NvcnJlY3QnIHwgJ2luY29ycmVjdCcgfCBudWxsXG4gIGZpbmRpbmdzOiBSZXZpZXdQYWNrYWdlRmluZGluZ1tdXG59XG5cbi8qKiBGaXJzdCBub24tZW1wdHkgbGluZSBvZiB0aGUgbWVzc2FnZSAodGhlIG1lc3NhZ2UgaGVhZGVyIGxpbmUpLiAqL1xuY29uc3QgUkVWSUVXX1BSRUZJWCA9ICdcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkEnXG5cbi8qKiBAcmV0dXJucyB0cnVlIHdoZW4gdGhlIHRleHQgaXMgYSBjYXJyaWVkIHJldmlldyBwYWNrYWdlIChjYXJkLXdvcnRoeSkuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXZpZXdQYWNrYWdlVGV4dCh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgZmlyc3QgPSBmaXJzdE5vbkVtcHR5TGluZSh0ZXh0KVxuICByZXR1cm4gZmlyc3QgIT09IG51bGwgJiYgZmlyc3Quc3RhcnRzV2l0aChSRVZJRVdfUFJFRklYKVxufVxuXG5mdW5jdGlvbiBmaXJzdE5vbkVtcHR5TGluZSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgZm9yIChjb25zdCByYXcgb2YgdGV4dC5zcGxpdCgnXFxuJykpIHtcbiAgICBjb25zdCB0ID0gcmF3LnRyaW0oKVxuICAgIGlmICh0ICE9PSAnJykgcmV0dXJuIHRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG4vKipcbiAqIFBhcnNlIGEgY2FycmllZCByZXZpZXctcGFja2FnZSBtZXNzYWdlIGJhY2sgaW50byBzdHJ1Y3R1cmVkIGRhdGEuXG4gKiBSZXR1cm5zIG51bGwgd2hlbiB0aGUgdGV4dCBpcyBub3QgYSByZXZpZXcgcGFja2FnZSAocGxhaW4gdXNlciBtZXNzYWdlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUmV2aWV3UGFja2FnZSh0ZXh0OiBzdHJpbmcpOiBSZXZpZXdQYWNrYWdlIHwgbnVsbCB7XG4gIGlmICghaXNSZXZpZXdQYWNrYWdlVGV4dCh0ZXh0KSkgcmV0dXJuIG51bGxcbiAgY29uc3QgcGtnOiBSZXZpZXdQYWNrYWdlID0geyB3b3Jrc3BhY2U6IG51bGwsIGNvbW1lbnRzOiBbXSwgdmVyZGljdDogbnVsbCwgZmluZGluZ3M6IFtdIH1cbiAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICBsZXQgaSA9IDBcblxuICAvLyAxLiBoZWFkZXIgbGluZSAodGhlIHByZWZpeCkgXHUyMDE0IGFscmVhZHkgbWF0Y2hlZCBieSBpc1Jldmlld1BhY2thZ2VUZXh0LlxuICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCkge1xuICAgIGNvbnN0IHQgPSBsaW5lc1tpXS50cmltKClcbiAgICBpICs9IDFcbiAgICBpZiAodCAhPT0gJycpIGJyZWFrXG4gIH1cblxuICAvLyAyLiBvcHRpb25hbCB3b3Jrc3BhY2UgbGluZSByaWdodCBhZnRlciB0aGUgaGVhZGVyLlxuICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCkge1xuICAgIGNvbnN0IHQgPSBsaW5lc1tpXS50cmltKClcbiAgICBpZiAodCA9PT0gJycpIHtcbiAgICAgIGkgKz0gMVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgY29uc3QgdyA9IC9eXHU1REU1XHU0RjVDXHU1MzNBWzpcdUZGMUFdXFxzKiguKykkLy5leGVjKHQpXG4gICAgaWYgKHcpIHtcbiAgICAgIHBrZy53b3Jrc3BhY2UgPSB3WzFdLnRyaW0oKSB8fCBudWxsXG4gICAgICBpICs9IDFcbiAgICB9XG4gICAgYnJlYWtcbiAgfVxuXG4gIC8vIDMuIHNlY3Rpb25zOiBgIyMgPHBhdGg+YCAoY29tbWVudHMgKyBvcHRpb25hbCBgYGBkaWZmIGh1bmspIGFuZFxuICAvLyAgICBgIyMgQUkgXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBYCAodmVyZGljdCArIGZpbmRpbmdzKS5cbiAgbGV0IHNlY3Rpb246IHN0cmluZyB8IG51bGwgPSBudWxsXG4gIGZvciAoOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByYXcgPSBsaW5lc1tpXVxuICAgIGNvbnN0IHQgPSByYXcudHJpbSgpXG4gICAgaWYgKHQgPT09ICcnKSBjb250aW51ZVxuICAgIGlmICh0LnN0YXJ0c1dpdGgoJyMjICcpKSB7XG4gICAgICBjb25zdCB0aXRsZSA9IHQuc2xpY2UoMykudHJpbSgpXG4gICAgICBzZWN0aW9uID0gdGl0bGUgPT09ICdBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkEnID8gJ3ZlcmRpY3QnIDogdGl0bGVcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmICh0LnN0YXJ0c1dpdGgoJ2BgYCcpKSB7XG4gICAgICAvLyBkaWZmIGZlbmNlIG9yIHN1Z2dlc3Rpb24gZmVuY2UgXHUyMDE0IGNvbnN1bWUgdW50aWwgdGhlIGNsb3NpbmcgZmVuY2UuXG4gICAgICBpICs9IDFcbiAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoICYmICFsaW5lc1tpXS50cmltKCkuc3RhcnRzV2l0aCgnYGBgJykpIGkgKz0gMVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKHNlY3Rpb24gPT09ICd2ZXJkaWN0Jykge1xuICAgICAgaWYgKC9cdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OTgvLnRlc3QodCkgfHwgL3BhdGNoIGlzIGluY29ycmVjdC9pLnRlc3QodCkpIHBrZy52ZXJkaWN0ID0gJ2luY29ycmVjdCdcbiAgICAgIGVsc2UgaWYgKC9cdTg4NjVcdTRFMDFcdTZCNjNcdTc4NkUvLnRlc3QodCkgfHwgL3BhdGNoIGlzIGNvcnJlY3QvaS50ZXN0KHQpKSBwa2cudmVyZGljdCA9ICdjb3JyZWN0J1xuICAgICAgY29uc3QgZiA9IC9eLVxccypcXFsoUFswLTNdKVxcXVxccyooLis/KTooXFxkKykoPzotKFxcZCspKT9cXHMrKC4rPykoPzpcXHMqXHUyMDE0XFxzKiguKikpPyQvLmV4ZWModClcbiAgICAgIGlmIChmKSB7XG4gICAgICAgIHBrZy5maW5kaW5ncy5wdXNoKHsgcHJpb3JpdHk6IGZbMV0gYXMgUmV2aWV3UGFja2FnZUZpbmRpbmdbJ3ByaW9yaXR5J10sIGZpbGU6IGZbMl0sIGxpbmU6IE51bWJlcihmWzNdKSwgdGl0bGU6IGZbNV0sIGRldGFpbDogZls2XSA/PyAnJyB9KVxuICAgICAgfVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKHNlY3Rpb24gIT09IG51bGwgJiYgdC5zdGFydHNXaXRoKCctICcpKSB7XG4gICAgICBjb25zdCBib2R5ID0gdC5zbGljZSgyKS50cmltKClcbiAgICAgIGNvbnN0IGVzYyA9IGVzY2FwZVJlZ2V4KHNlY3Rpb24pXG4gICAgICAvLyBgLSA8cGF0aD46PGxpbmVOZXc+OiA8dGV4dD5gXG4gICAgICBjb25zdCBtTmV3ID0gbmV3IFJlZ0V4cChgXiR7ZXNjfTooXFxcXGQrKTpcXFxccyooLiopJGApLmV4ZWMoYm9keSlcbiAgICAgIGlmIChtTmV3KSB7XG4gICAgICAgIHBrZy5jb21tZW50cy5wdXNoKHsgcGF0aDogc2VjdGlvbiwgbGluZTogTnVtYmVyKG1OZXdbMV0pLCB0ZXh0OiBtTmV3WzJdIH0pXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICAvLyBgLSA8cGF0aD4gKG9sZCBsaW5lIDxsaW5lT2xkPik6IDx0ZXh0PmBcbiAgICAgIGNvbnN0IG1PbGQgPSBuZXcgUmVnRXhwKGBeJHtlc2N9IFxcXFwob2xkIGxpbmUgKFxcXFxkKylcXFxcKTpcXFxccyooLiopJGApLmV4ZWMoYm9keSlcbiAgICAgIGlmIChtT2xkKSB7XG4gICAgICAgIHBrZy5jb21tZW50cy5wdXNoKHsgcGF0aDogc2VjdGlvbiwgbGluZTogbnVsbCwgdGV4dDogbU9sZFsyXSB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGtnXG59XG5cbmZ1bmN0aW9uIGVzY2FwZVJlZ2V4KHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJylcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1CQSxtQkFBcUY7OztBQ25CckYsSUFBcUIsT0FBckIsTUFBMEI7QUFBQSxFQUN0QixLQUFLLFFBQVEsUUFFYixVQUFVLENBQUMsR0FBRztBQUNWLFFBQUk7QUFDSixRQUFJLE9BQU8sWUFBWSxZQUFZO0FBQy9CLGlCQUFXO0FBQ1gsZ0JBQVUsQ0FBQztBQUFBLElBQ2YsV0FDUyxjQUFjLFNBQVM7QUFDNUIsaUJBQVcsUUFBUTtBQUFBLElBQ3ZCO0FBRUEsVUFBTSxZQUFZLEtBQUssVUFBVSxRQUFRLE9BQU87QUFDaEQsVUFBTSxZQUFZLEtBQUssVUFBVSxRQUFRLE9BQU87QUFDaEQsVUFBTSxZQUFZLEtBQUssWUFBWSxLQUFLLFNBQVMsV0FBVyxPQUFPLENBQUM7QUFDcEUsVUFBTSxZQUFZLEtBQUssWUFBWSxLQUFLLFNBQVMsV0FBVyxPQUFPLENBQUM7QUFDcEUsV0FBTyxLQUFLLG1CQUFtQixXQUFXLFdBQVcsU0FBUyxRQUFRO0FBQUEsRUFDMUU7QUFBQSxFQUNBLG1CQUFtQixXQUFXLFdBQVcsU0FBUyxVQUFVO0FBQ3hELFFBQUk7QUFDSixVQUFNLE9BQU8sQ0FBQyxVQUFVO0FBQ3BCLGNBQVEsS0FBSyxZQUFZLE9BQU8sT0FBTztBQUN2QyxVQUFJLFVBQVU7QUFDVixtQkFBVyxXQUFZO0FBQUUsbUJBQVMsS0FBSztBQUFBLFFBQUcsR0FBRyxDQUFDO0FBQzlDLGVBQU87QUFBQSxNQUNYLE9BQ0s7QUFDRCxlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFDQSxV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O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUE2UW5CLElBQUksT0FBTyxhQUFhLGVBQWUsU0FBUyxjQUFjLHlCQUF5QixLQUFLLFVBQVUsU0FBUyxDQUFDLEdBQUcsTUFBTSxNQUFNO0FBQzdILFFBQU0sTUFBTSxTQUFTLGNBQWMsT0FBTztBQUMxQyxNQUFJLFFBQVEsU0FBUztBQUNyQixNQUFJLFFBQVEsWUFBWTtBQUN4QixNQUFJLGNBQWM7QUFDbEIsV0FBUyxLQUFLLFlBQVksR0FBRztBQUMvQjtBQUdBLElBQU0sS0FBSztBQUFBLEVBQ1QsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsbUJBQW1CO0FBQUEsRUFDbkIsa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsMkJBQTJCO0FBQUEsRUFDM0Isc0JBQXNCO0FBQUEsRUFDdEIsc0JBQXNCO0FBQUEsRUFDdEIsdUJBQXVCO0FBQUEsRUFDdkIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsb0JBQW9CO0FBQUEsRUFDcEIsaUJBQWlCO0FBQUEsRUFDakIsaUJBQWlCO0FBQUEsRUFDakIsb0JBQW9CO0FBQUEsRUFDcEIsb0JBQW9CO0FBQUEsRUFDcEIsa0JBQWtCO0FBQUEsRUFDbEIscUJBQXFCO0FBQUEsRUFDckIsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIsd0JBQXdCO0FBQUEsRUFDeEIsMkJBQTJCO0FBQUEsRUFDM0IsaUJBQWlCO0FBQUEsRUFDakIsNEJBQTRCO0FBQUEsRUFDNUIsZUFBZTtBQUFBLEVBQ2Ysc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsd0JBQXdCO0FBQUEsRUFDeEIseUJBQXlCO0FBQUEsRUFDekIsd0JBQXdCO0FBQUEsRUFDeEIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsWUFBWTtBQUFBLEVBQ1osZ0JBQWdCO0FBQUEsRUFDaEIsY0FBYztBQUFBLEVBQ2QsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsZUFBZTtBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsb0JBQW9CO0FBQUEsRUFDcEIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsdUJBQXVCO0FBQUEsRUFDdkIsZ0JBQWdCO0FBQUEsRUFDaEIsa0JBQWtCO0FBQUEsRUFDbEIsa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsbUJBQW1CO0FBQUEsRUFDbkIsd0JBQXdCO0FBQUEsRUFDeEIsY0FBYztBQUFBLEVBQ2Qsd0JBQXdCO0FBQUEsRUFDeEIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsbUJBQW1CO0FBQUEsRUFDbkIsc0JBQXNCO0FBQUEsRUFDdEIsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsaUJBQWlCO0FBQUEsRUFDakIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIseUJBQXlCO0FBQUEsRUFDekIsMkJBQTJCO0FBQUEsRUFDM0IscUJBQXFCO0FBQUEsRUFDckIsbUJBQW1CO0FBQUEsRUFDbkIscUJBQXFCO0FBQUEsRUFDckIscUJBQXFCO0FBQUEsRUFDckIsdUJBQXVCO0FBQUEsRUFDdkIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsWUFBWTtBQUFBLEVBQ1osZUFBZTtBQUFBLEVBQ2YsV0FBVztBQUFBLEVBQ1gsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsaUJBQWlCO0FBQUEsRUFDakIsY0FBYztBQUFBLEVBQ2QsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIseUJBQXlCO0FBQUEs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

		})(module, module.exports, require);
		return module.exports;
	}
});
