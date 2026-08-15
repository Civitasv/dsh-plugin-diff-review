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
      const result = await session.prompt([{ type: "text", text }], "steer");
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
.dsdr-saved-comment-jump{display:flex;flex-direction:column;gap:2px;width:100%;min-width:0;border:0;background:transparent;border-radius:6px;padding:2px;text-align:left;cursor:pointer;font:inherit}
.dsdr-saved-comment-jump:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsdr-saved-comment-jump:hover .dsdr-saved-comment-loc{color:var(--dsw-alias-label-secondary)}
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
  const jump = () => {
    overlayStore.update((d) => {
      d.open = true;
      d.focus = {
        path: comment.path,
        line: comment.lineNew ?? comment.lineOld ?? void 0,
        tab: comment.source === "session" ? "session" : "workspace"
      };
      d.key = d.key + 1;
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-editor", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: "dsdr-saved-comment-jump",
        title: t("review.dockJump"),
        onClick: jump,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-saved-comment-loc", children: [
            comment.path,
            comment.lineNew !== null ? `:${comment.lineNew}` : comment.lineOld !== null ? ` (old:${comment.lineOld})` : ""
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-comment-input dsdr-saved-comment-view", children: comment.text })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-comment-actions", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "dsdr-btn",
          disabled: busy,
          onClick: (e) => {
            e.stopPropagation();
            setText(comment.text);
            setEditing(true);
          },
          children: t("comment.edit")
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: "dsdr-btn dsdr-btn-danger",
          disabled: busy,
          onClick: (e) => {
            e.stopPropagation();
            onDelete(comment.id);
          },
          children: t("comment.delete")
        }
      )
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
      d.focus = {
        path: comment.path,
        line: comment.lineNew ?? comment.lineOld ?? void 0,
        tab: comment.source === "session" ? "session" : "workspace"
      };
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
    if (focus.tab === "session") {
      let targetRound = null;
      let targetChange = null;
      for (let i = rounds.length - 1; i >= 0; i--) {
        const change = rounds[i].changes.find((c) => {
          if (c.path === focus.path) return true;
          if (isAbsPath(c.path)) {
            const rel = c.path.startsWith(cwd) ? c.path.slice(cwd.length).replace(/^[\\/]+/, "") : c.path;
            if (rel === focus.path) return true;
          }
          return baseName(c.path) === baseName(focus.path);
        });
        if (change) {
          targetRound = rounds[i];
          targetChange = change;
          break;
        }
      }
      setTab("session");
      if (targetRound && targetChange) {
        setSelectedRound(targetRound.round);
        setSelectedPath(targetChange.path);
      } else {
        setSelectedRound(null);
        setSelectedPath(null);
      }
      setJumpLine(focus.line ?? null);
      const scrollTimer2 = setTimeout(() => {
        if (focus.line != null) {
          document.querySelector(`[data-dsdr-line="${focus.line}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }, 80);
      const clearTimer2 = setTimeout(() => setJumpLine(null), 2500);
      return () => {
        clearTimeout(scrollTimer2);
        clearTimeout(clearTimer2);
      };
    }
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
    let last = null;
    for (let i = rounds.length - 1; i >= 0; i--) {
      if (rounds[i].changes.length > 0) {
        last = rounds[i];
        break;
      }
    }
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
  const relativePath = (p) => {
    if (!activeCwd || !isAbsPath(p)) return p;
    if (p.startsWith(activeCwd)) return p.slice(activeCwd.length).replace(/^[\\/]+/, "");
    return p;
  };
  const saveComment = async () => {
    const commentPath = relativePath((tab === "workspace" ? selectedFile?.path : selectedChange?.path) ?? "");
    if (!commentPath || !commentEditor || busy) return;
    const text = commentText.trim();
    if (!text) return;
    const comment = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      path: commentPath,
      lineNew: commentEditor.newLine,
      lineOld: commentEditor.oldLine,
      text,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: tab === "session" ? "session" : "workspace"
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
  for (const key of ["user", "steering"]) {
    ctx.slots.inject(
      "conversation.chat.node",
      () => ctx.slots.register(
        {
          name: "conversation.chat.node",
          key,
          priority: -1,
          locale: LOCALE_NS
        },
        UserReviewNodeView
      )
    );
  }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIiwgInNyYy9jbGllbnQvcmV2aWV3LXBhY2thZ2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRGlmZi1yZXZpZXcgcGx1Z2luIFx1MjAxNCBjbGllbnQgaGFsZi5cbiAqXG4gKiBDb2RleC1zdHlsZSByZXZpZXcgd2l0aCB0d28gc291cmNlczpcbiAqXG4gKiAxLiAqKlx1NEYxQVx1OEJERFx1NjZGNFx1NjUzOSAoU2Vzc2lvbiBjaGFuZ2VzKSoqIFx1MjAxNCB3aGF0IHRoZSBhZ2VudCBjaGFuZ2VkIGluIGVhY2ggcm91bmQgb2ZcbiAqICAgIHRoaXMgY29udmVyc2F0aW9uLCBkZXJpdmVkIGZyb20gdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCAodG9vbCByZXN1bHRzXG4gKiAgICBjYXJyeSB0aGUgaG9zdC1jb21wdXRlZCBgcmVzdWx0Vmlld2AgZGlmZiBodW5rcykuIFdvcmtzIHdpdGggb3Igd2l0aG91dFxuICogICAgZ2l0LCBhbmQgc2hvd3MgYSBjaGFuZ2UgZXZlbiB3aGVuIG5vIGRpZmYgdGV4dCBpcyBhdmFpbGFibGUgKHBhdGgtb25seSkuXG4gKiAyLiAqKlx1NURFNVx1NEY1Q1x1NTMzQSAoV29ya3NwYWNlKSoqIFx1MjAxNCB0aGUgZ2l0IHdvcmtpbmcgdHJlZSdzIHVuY29tbWl0dGVkIGNoYW5nZXNcbiAqICAgIChzdGFnZWQgKyB1bnN0YWdlZCArIHVudHJhY2tlZCkgd2l0aCBwZXItZmlsZSAvIGFsbC1maWxlIGFjY2VwdCAoc3RhZ2UpXG4gKiAgICBhbmQgcmV2ZXJ0IChkaXNjYXJkKSB0aHJvdWdoIHRoZSBwbHVnaW4ncyBzZXJ2ZXIgcm91dGVzLlxuICpcbiAqIFRoZSByZXZpZXcgc3VyZmFjZSBtb3VudHMgaW4gYHNoZWxsLm92ZXJsYXlgIChyb290IHNjb3BlKS4gU3RhdGUgaGFuZC1vZmZcbiAqIGJldHdlZW4gdGhlIHNlc3Npb24tc2NvcGVkIGhlYWRlciB0cmlnZ2VyIGFuZCB0aGUgcm9vdC1zY29wZWQgb3ZlcmxheSBnb2VzXG4gKiB0aHJvdWdoIGEgbW9kdWxlLWxldmVsIHNuYXBzaG90IHN0b3JlOyB0aGUgY29udmVyc2F0aW9uIHNuYXBzaG90IGZvciB0aGVcbiAqIGN1cnJlbnQgc2Vzc2lvbiBpcyByZWFkIHJlYWN0aXZlbHkgdGhyb3VnaCBgY3R4LnNlc3Npb25zYCAoaW5qZWN0ZWQgdmlhIHRoZVxuICogb3ZlcmxheSByZWdpc3RyYXRpb24ncyBpbmplY3QgZmFjZSkuXG4gKi9cbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSwgdXNlU3luY0V4dGVybmFsU3RvcmUsIEZyYWdtZW50IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENTU1Byb3BlcnRpZXMsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBkaWZmTGluZXMgfSBmcm9tICdkaWZmJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0LCBJU2Vzc2lvbnMsIFNlc3Npb25MaXN0U3RhdGUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB7IGNyZWF0ZVNuYXBzaG90U3RvcmUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgUHJvcHNMb2NhbGUsIFByb3BzUnVudGltZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNsb3RzJ1xuaW1wb3J0IHR5cGUgeyBDb252ZXJzYXRpb25Ob2RlLCBUb29sUmVzdWx0Tm9kZSwgVXNlck1lc3NhZ2VOb2RlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFNlc3Npb25JZCwgVG9vbFJlc3VsdFZpZXcgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWFwaS1yZW1vdGVzL2NsaWVudCdcbmltcG9ydCB7IEljb25DaGV2cm9uRG93bk91dGxpbmUxNCwgd3JpdGVDbGlwYm9hcmQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuaW1wb3J0IHsgSW1hZ2VHYWxsZXJ5IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktYXR0YWNobWVudCdcbmltcG9ydCB0eXBlIHsgSW1hZ2VBdHRhY2htZW50UmVmIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hdHRhY2htZW50J1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEdpdFJlc3BvbnNlLCBIaXN0b3J5UmVzcG9uc2UsIFByUmVzcG9uc2UsIFJlcG9zUmVzcG9uc2UsIFJldmlld0NvbW1lbnQsIFJldmlld0ZpbmRpbmcsIFJldmlld1Jlc3BvbnNlLCBTdGF0dXNSZXNwb25zZSB9IGZyb20gJy4uL3NoYXJlZC90eXBlcy50cydcbmltcG9ydCB7IHBhcnNlUmV2aWV3UGFja2FnZSwgaXNSZXZpZXdQYWNrYWdlVGV4dCB9IGZyb20gJy4vcmV2aWV3LXBhY2thZ2UudHMnXG5pbXBvcnQgdHlwZSB7IFJldmlld1BhY2thZ2UsIFJldmlld1BhY2thZ2VDb21tZW50LCBSZXZpZXdQYWNrYWdlRmluZGluZyB9IGZyb20gJy4vcmV2aWV3LXBhY2thZ2UudHMnXG5cbmV4cG9ydCBjb25zdCBuYW1lID0gJ2RpZmYtcmV2aWV3J1xuXG4vKiogUmVxdWlyZWQgY2xpZW50IHNlcnZpY2VzIChmaWJlciBpbmplY3QpLiAqL1xuZXhwb3J0IGNvbnN0IGluamVjdCA9IFsnc2Vzc2lvbnMnLCAnc2xvdHMnLCAnbG9jYWxlJ11cblxuY29uc3QgTE9DQUxFX05TID0gJ2RpZmYtcmV2aWV3J1xuLyoqIE1heCBjb21tZW50IGNoaXBzIHNob3duIGluIHRoZSBkb2NrIHJvdyBiZWZvcmUgY29sbGFwc2luZyBpbnRvICtOLiAqL1xuY29uc3QgTUFYX0RPQ0tfQ0hJUFMgPSA0XG5jb25zdCBTVEFUVVNfVVJMID0gJ2RpZmYtcmV2aWV3L3N0YXR1cydcbmNvbnN0IEFQUExZX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseSdcbmNvbnN0IEFQUExZX0hVTktfVVJMID0gJ2RpZmYtcmV2aWV3L2FwcGx5LWh1bmsnXG5jb25zdCBDT01NSVRfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdCdcbmNvbnN0IFBVU0hfVVJMID0gJ2RpZmYtcmV2aWV3L3B1c2gnXG5jb25zdCBISVNUT1JZX1VSTCA9ICdkaWZmLXJldmlldy9oaXN0b3J5J1xuY29uc3QgQ09NTUlUX0RJRkZfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1pdC1kaWZmJ1xuY29uc3QgQ09NTUVOVFNfVVJMID0gJ2RpZmYtcmV2aWV3L2NvbW1lbnRzJ1xuY29uc3QgQlJBTkNIRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2JyYW5jaGVzJ1xuY29uc3QgUkVWSUVXX1VSTCA9ICdkaWZmLXJldmlldy9yZXZpZXcnXG5jb25zdCBQUl9VUkwgPSAnZGlmZi1yZXZpZXcvcHInXG5jb25zdCBSRVBPU19VUkwgPSAnZGlmZi1yZXZpZXcvcmVwb3MnXG5jb25zdCBPUEVOX0VESVRPUl9VUkwgPSAnb3Blbi1lZGl0b3Ivb3BlbidcbmNvbnN0IFNUWUxFX1RBRyA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3L3Jldmlldy5jc3MnXG5cbi8qKiBPcGVuIHN0YXRlIHNoYXJlZCBiZXR3ZWVuIHRoZSBoZWFkZXIgdHJpZ2dlciAoc2Vzc2lvbiBzY29wZSkgYW5kIHRoZSBvdmVybGF5IChyb290IHNjb3BlKS4gKi9cbmNvbnN0IG92ZXJsYXlTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8eyBvcGVuOiBib29sZWFuOyBjd2Q6IHN0cmluZyB8IG51bGw7IGtleTogbnVtYmVyOyBmb2N1cz86IHsgcGF0aDogc3RyaW5nOyBsaW5lPzogbnVtYmVyOyB0YWI/OiAnc2Vzc2lvbicgfCAnd29ya3NwYWNlJyB9IHwgbnVsbCB9Pih7XG4gIG9wZW46IGZhbHNlLFxuICBjd2Q6IG51bGwsXG4gIGtleTogMCxcbiAgZm9jdXM6IG51bGwsXG59KVxuXG4vKipcbiAqIFBlbmRpbmcgaW5saW5lIGNvbW1lbnRzIHN1cmZhY2VkIGFib3ZlIHRoZSBjb21wb3NlciAoQ29kZXgtc3R5bGUpLiBUaGVcbiAqIHJldmlldyBvdmVybGF5IHN5bmNzIGl0cyB3b3Jrc3BhY2UgY29tbWVudHMgKHBsdXMgdGhlIGRpZmYgY29udGV4dCBhbmQgdGhlXG4gKiBsYXN0IEFJIHJldmlldyByZXN1bHQpIGhlcmU7IHRoZSBjb21wb3NlciBkb2NrIHJlYWRzIHRoZW0gYW5kIGNhcnJpZXMgYVxuICogZnVsbCByZXZpZXcgcGFja2FnZSB3aXRoIHRoZSB1c2VyJ3MgbmV4dCBtZXNzYWdlLlxuICovXG5pbnRlcmZhY2UgUGVuZGluZ0NvbW1lbnRzIHtcbiAgY3dkOiBzdHJpbmcgfCBudWxsXG4gIGNvbW1lbnRzOiBSZXZpZXdDb21tZW50W11cbiAgLyoqIFVuaWZpZWQgZGlmZiB0ZXh0IHBlciBjb21tZW50ZWQgcGF0aCAoY29udGV4dCBmb3IgdGhlIGNhcnJpZWQgbWVzc2FnZSkuICovXG4gIGRpZmZzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gIC8qKiBMYXN0IEFJIHJldmlldyByZXN1bHQgKHZlcmRpY3QgKyBmaW5kaW5ncyksIGFwcGVuZGVkIHRvIHRoZSBjYXJyaWVkIG1lc3NhZ2UuICovXG4gIHJldmlldzogUmV2aWV3UmVzcG9uc2UgfCBudWxsXG59XG5jb25zdCBwZW5kaW5nQ29tbWVudHNTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UGVuZGluZ0NvbW1lbnRzPih7XG4gIGN3ZDogbnVsbCxcbiAgY29tbWVudHM6IFtdLFxuICBkaWZmczoge30sXG4gIHJldmlldzogbnVsbCxcbn0pXG5cbi8qKlxuICogRHVyYWJsZSwgcGVyLXdvcmtzcGFjZSBcImFscmVhZHkgY2FycmllZFwiIHN0YXRlIChzdXJ2aXZlcyByZWxvYWRzOyBpc29sYXRlZFxuICogcGVyIGN3ZCBzbyBjb21tZW50cyBzZW50IGluIG9uZSB3b3Jrc3BhY2UgbmV2ZXIgZmlsdGVyIGFub3RoZXIncykuXG4gKi9cbmNvbnN0IHNlbnRTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UmVjb3JkPHN0cmluZywgeyBzZW50Q29tbWVudElkczogc3RyaW5nW107IHNlbnRSZXZpZXdLZXk6IHN0cmluZyB8IG51bGwgfT4+KHt9LCB7IHBlcnNpc3Q6IHsgbmFtZTogJ2RzZHItcmV2aWV3LXNlbnQnIH0gfSlcblxuLyoqIEluamVjdCB0ZXh0IGludG8gYSBzZXNzaW9uIGFzIGEgdXNlciBtZXNzYWdlOyBmYWxscyBiYWNrIHRvIHRoZSBjbGlwYm9hcmQuICovXG5hc3luYyBmdW5jdGlvbiBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnM6IElTZXNzaW9ucyB8IHVuZGVmaW5lZCwgc2Vzc2lvbklkOiBTZXNzaW9uSWQgfCBudWxsLCB0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPCdzZW50JyB8ICdjb3BpZWQnIHwgJ2ZhaWxlZCc+IHtcbiAgY29uc3QgYmluZGluZyA9IHNlc3Npb25JZCA/IHNlc3Npb25zPy5iaW5kaW5nKHNlc3Npb25JZCkgOiB1bmRlZmluZWRcbiAgY29uc3Qgc2Vzc2lvbiA9IGJpbmRpbmc/LnNlc3Npb25cbiAgaWYgKHNlc3Npb24pIHtcbiAgICB0cnkge1xuICAgICAgLy8gJ3N0ZWVyJyAobm90ICdxdWV1ZScpOiB0aGUgcmV2aWV3IHBhY2thZ2UgaXMgaW5qZWN0ZWQgYXMgYSBzdGVlcmluZ1xuICAgICAgLy8gbWVzc2FnZSBcdTIwMTQgdGhlIGFnZW50IGhhbmRsZXMgaXQgb24gaXRzIG5leHQgc3RlcCAob3IgdGhlIGlkbGUgYWdlbnQgaXNcbiAgICAgIC8vIHdva2VuIGltbWVkaWF0ZWx5KSwgc28gaXQgbmV2ZXIgc2hvd3MgdXAgYXMgYSBxdWV1ZWQgaXRlbSBhYm92ZSB0aGVcbiAgICAgIC8vIGlucHV0LiAncXVldWUnIHdvdWxkIGFwcGVuZCBhZnRlciB0aGUgY3VycmVudCB0dXJuIGFuZCBzdXJmYWNlIGFzIGFcbiAgICAgIC8vIFwiXHU2MzkyXHU5NjFGXHU0RkUxXHU2MDZGXCIgc3RyaXAgaW5zdGVhZC5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlc3Npb24ucHJvbXB0KFt7IHR5cGU6ICd0ZXh0JywgdGV4dCB9XSwgJ3N0ZWVyJylcbiAgICAgIGlmIChyZXN1bHQub2spIHJldHVybiAnc2VudCdcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgY29weSBmYWxsYmFja1xuICAgIH1cbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gICAgcmV0dXJuICdjb3BpZWQnXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnZmFpbGVkJ1xuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IHByZWZlcmVuY2VzIChmb250IC8gc2l6ZSAvIHBhbmVsIGdlb21ldHJ5KSwgc2hhcmVkIGJ5IHRoZSBvdmVybGF5XG4vLyBhbmQgdGhlIFNldHRpbmdzIFx1MjE5MiBHZW5lcmFsIHJvdy4gUGVyc2lzdGVkIHRvIGxvY2FsU3RvcmFnZSBieSB0aGUgc3RvcmUuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFBhbmVsIGdlb21ldHJ5IGJvdW5kcy4gKi9cbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfVyA9IDY0MFxuZXhwb3J0IGNvbnN0IE1JTl9QQU5FTF9IID0gNDAwXG5cbmludGVyZmFjZSBQcmVmcyB7XG4gIC8qKiBGb250IG9wdGlvbiBpZCAoc2VlIEZPTlRfT1BUSU9OUykuICovXG4gIGZvbnQ6IHN0cmluZ1xuICAvKiogRGlmZiB0ZXh0IHNpemUgaW4gcHguICovXG4gIHNpemU6IG51bWJlclxuICAvKiogUGFuZWwgd2lkdGggaW4gcHguICovXG4gIHdpZHRoOiBudW1iZXJcbiAgLyoqIFBhbmVsIGhlaWdodCBpbiBweC4gKi9cbiAgaGVpZ2h0OiBudW1iZXJcbn1cblxuY29uc3QgRk9OVF9PUFRJT05TOiB7IGlkOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGNzczogc3RyaW5nIH1bXSA9IFtcbiAgeyBpZDogJ21vbm8nLCBsYWJlbDogJ2ZvbnQubW9ubycsIGNzczogJ3ZhcigtLWRzdy1mb250LW1vbm8pJyB9LFxuICB7IGlkOiAnc3lzdGVtJywgbGFiZWw6ICdmb250LnN5c3RlbScsIGNzczogJ3N5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZicgfSxcbiAgeyBpZDogJ2NvbnNvbGFzJywgbGFiZWw6ICdDb25zb2xhcycsIGNzczogJ0NvbnNvbGFzLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ2pldGJyYWlucycsIGxhYmVsOiAnSmV0QnJhaW5zIE1vbm8nLCBjc3M6ICdcIkpldEJyYWlucyBNb25vXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdmaXJhJywgbGFiZWw6ICdGaXJhIENvZGUnLCBjc3M6ICdcIkZpcmEgQ29kZVwiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnc291cmNlJywgbGFiZWw6ICdTb3VyY2UgQ29kZSBQcm8nLCBjc3M6ICdcIlNvdXJjZSBDb2RlIFByb1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuXVxuXG5jb25zdCBTSVpFX09QVElPTlMgPSBbMTEsIDEyLCAxMywgMTQsIDE2LCAxOF1cblxuLyoqIFJldmlldyBzY29wZXMgb2YgdGhlIHdvcmtzcGFjZSB0YWIgKGFsaWduZWQgd2l0aCB0aGUgQ29kZXggcmV2aWV3IHBhbmUpLiAqL1xudHlwZSBXb3Jrc3BhY2VTY29wZSA9ICdhbGwnIHwgJ3Vuc3RhZ2VkJyB8ICdzdGFnZWQnIHwgJ2NvbW1pdCcgfCAnYnJhbmNoJyB8ICdsYXN0LXR1cm4nXG5cbmNvbnN0IFNDT1BFX09QVElPTlM6IHsgaWQ6IFdvcmtzcGFjZVNjb3BlOyBsYWJlbDoga2V5b2YgdHlwZW9mIHpoIH1bXSA9IFtcbiAgeyBpZDogJ2FsbCcsIGxhYmVsOiAnc2NvcGUuYWxsJyB9LFxuICB7IGlkOiAndW5zdGFnZWQnLCBsYWJlbDogJ3Njb3BlLnVuc3RhZ2VkJyB9LFxuICB7IGlkOiAnc3RhZ2VkJywgbGFiZWw6ICdzY29wZS5zdGFnZWQnIH0sXG4gIHsgaWQ6ICdjb21taXQnLCBsYWJlbDogJ3Njb3BlLmNvbW1pdCcgfSxcbiAgeyBpZDogJ2JyYW5jaCcsIGxhYmVsOiAnc2NvcGUuYnJhbmNoJyB9LFxuICB7IGlkOiAnbGFzdC10dXJuJywgbGFiZWw6ICdzY29wZS5sYXN0LXR1cm4nIH0sXG5dXG5cbi8qKiBCcm93c2VyLXNpZGUgYWJzb2x1dGUgcGF0aCBjaGVjayAobm8gbm9kZTpwYXRoIGluIHRoZSBjbGllbnQgYnVuZGxlKS4gKi9cbmZ1bmN0aW9uIGlzQWJzUGF0aChwOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHAuc3RhcnRzV2l0aCgnLycpIHx8IC9eW0EtWmEtel06W1xcXFwvXS8udGVzdChwKVxufVxuXG4vKiogTGFyZ2VzdCBvZiB0aHJlZSBudW1iZXJzIChwcmVmZXJzIGIgb24gdGllcykuICovXG5mdW5jdGlvbiBtYXhPZjMoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChiID49IGEgJiYgYiA+PSBjKSByZXR1cm4gYlxuICBpZiAoYSA+PSBjKSByZXR1cm4gYVxuICByZXR1cm4gY1xufVxuXG5mdW5jdGlvbiBiYXNlTmFtZShwOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcC5zcGxpdCgvW1xcXFwvXS8pLnBvcCgpID8/IHBcbn1cblxuY29uc3QgcHJlZnNTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UHJlZnM+KFxuICB7IGZvbnQ6ICdtb25vJywgc2l6ZTogMTIsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDcyMCB9LFxuICB7IHBlcnNpc3Q6IHsgbmFtZTogJ2RzZHItcHJlZnMnIH0gfSxcbilcblxuLyoqIENTUyBmb250LWZhbWlseSBmb3IgYSBzdG9yZWQgZm9udCBvcHRpb24gaWQuICovXG5mdW5jdGlvbiBmb250Q3NzKGlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gRk9OVF9PUFRJT05TLmZpbmQoKGYpID0+IGYuaWQgPT09IGlkKT8uY3NzID8/IEZPTlRfT1BUSU9OU1swXS5jc3Ncbn1cblxuLyoqIFBhbmVsIENTUyB2YXJpYWJsZXMgY2FycnlpbmcgdGhlIGZvbnQvc2l6ZSBwcmVmZXJlbmNlLiAqL1xuZnVuY3Rpb24gZGlmZlN0eWxlVmFycyhwcmVmczogUHJlZnMpOiBDU1NQcm9wZXJ0aWVzIHtcbiAgcmV0dXJuIHtcbiAgICAnLS1kc2RyLWRpZmYtZm9udCc6IGZvbnRDc3MocHJlZnMuZm9udCksXG4gICAgJy0tZHNkci1kaWZmLXNpemUnOiBgJHtwcmVmcy5zaXplfXB4YCxcbiAgfSBhcyBDU1NQcm9wZXJ0aWVzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2Vzc2lvbi1jaGFuZ2VzIGV4dHJhY3Rpb24gKGNsaWVudC1zaWRlLCB3b3JrcyB3aXRob3V0IGdpdCkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBiZWZvcmUvYWZ0ZXIgc2xpY2Ugb2YgYSBjaGFuZ2UgKGEgaHVuaykuICovXG5pbnRlcmZhY2UgSHVuayB7XG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBPbmUgZmlsZSBjaGFuZ2VkIGluc2lkZSBvbmUgcm91bmQuICovXG5pbnRlcmZhY2UgUm91bmRDaGFuZ2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgdG9vbDogc3RyaW5nXG4gIGh1bmtzOiBIdW5rW11cbiAgLyoqIEZhbHNlIHdoZW4gb25seSB0aGUgcGF0aCBpcyBrbm93biAobm8gZGlmZiBkYXRhIHBlcnNpc3RlZCkuICovXG4gIGhhc0RpZmY6IGJvb2xlYW5cbn1cblxuLyoqIE9uZSB1c2VyIHJvdW5kIGFuZCB0aGUgZmlsZXMgaXQgY2hhbmdlZC4gKi9cbmludGVyZmFjZSBTZXNzaW9uUm91bmQge1xuICByb3VuZDogbnVtYmVyXG4gIGxhYmVsOiBzdHJpbmdcbiAgY2hhbmdlczogUm91bmRDaGFuZ2VbXVxufVxuXG5pbnRlcmZhY2UgRmlsZURpZmZMaWtlIHtcbiAgcGF0aDogc3RyaW5nXG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBWYWxpZGF0ZSBhIHJhdyBGaWxlRGlmZi1zaGFwZWQgdmFsdWUgKHRoZSB0b29scycgYHtwYXRoLCBvbGRUZXh0LCBuZXdUZXh0fWAgY29udHJhY3QpLiAqL1xuZnVuY3Rpb24gYXNGaWxlRGlmZihyYXc6IHVua25vd24pOiBGaWxlRGlmZkxpa2UgfCBudWxsIHtcbiAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGNvbnN0IHJlYyA9IHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICBpZiAodHlwZW9mIHJlYy5wYXRoICE9PSAnc3RyaW5nJyB8fCAhcmVjLnBhdGgpIHJldHVybiBudWxsXG4gIGlmICh0eXBlb2YgcmVjLm5ld1RleHQgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbFxuICBjb25zdCBvbGRUZXh0ID0gcmVjLm9sZFRleHRcbiAgcmV0dXJuIHsgcGF0aDogcmVjLnBhdGgsIG9sZFRleHQ6IHR5cGVvZiBvbGRUZXh0ID09PSAnc3RyaW5nJyA/IG9sZFRleHQgOiBudWxsLCBuZXdUZXh0OiByZWMubmV3VGV4dCB9XG59XG5cbi8qKiBEaWZmIGh1bmtzIGNhcnJpZWQgYnkgYSBkaWZmIGNhcmQgKGNhbGwgdmlldyBvciByZXN1bHQgdmlldykuICovXG5mdW5jdGlvbiBkaWZmc0Zyb21EaWZmQ2FyZCh2aWV3OiB7IGNhcmQ/OiB1bmtub3duOyBkaWZmcz86IHVua25vd24gfSB8IG51bGwgfCB1bmRlZmluZWQpOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghdmlldyB8fCB2aWV3LmNhcmQgIT09ICdkaWZmJyB8fCAhQXJyYXkuaXNBcnJheSh2aWV3LmRpZmZzKSkgcmV0dXJuIFtdXG4gIHJldHVybiB2aWV3LmRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG4vKiogSHVtYW4gbGFiZWwgZm9yIGEgY2FsbCB3aG9zZSBgY2FsbGAgaGVhZCB3YXMgdHJ1bmNhdGVkIG91dCBvZiB0aGUgd2luZG93LiAqL1xuZnVuY3Rpb24gZGlmZkNhcmRUaXRsZSh2aWV3OiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICghdmlldyB8fCB0eXBlb2YgdmlldyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGNvbnN0IHRpdGxlID0gKHZpZXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLnRpdGxlXG4gIHJldHVybiB0eXBlb2YgdGl0bGUgPT09ICdzdHJpbmcnICYmIHRpdGxlLnRyaW0oKSA/IHRpdGxlLnRyaW0oKSA6IG51bGxcbn1cblxuLyoqIFJhdyBgbWV0YS5kaWZmc2AgZmFsbGJhY2sgKHRoZSBwZXJzaXN0ZWQgdG9vbC9yZXN1bHQgbWV0YSkuICovXG5mdW5jdGlvbiBkaWZmc0Zyb21NZXRhKG1ldGE6IHVua25vd24pOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghbWV0YSB8fCB0eXBlb2YgbWV0YSAhPT0gJ29iamVjdCcpIHJldHVybiBbXVxuICBjb25zdCBkaWZmcyA9IChtZXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5kaWZmc1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZGlmZnMpKSByZXR1cm4gW11cbiAgcmV0dXJuIGRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG5jb25zdCBNVVRBVElPTl9UT09MUyA9IG5ldyBTZXQoWydzdHJfcmVwbGFjZV9lZGl0b3InLCAnbm90ZWJvb2tfZWRpdCddKVxuY29uc3QgTVVUQVRJT05fQ09NTUFORFMgPSBuZXcgU2V0KFsnd3JpdGUnLCAnZWRpdCcsICdyZXBsYWNlJywgJ2RlbGV0ZScsICdtb3ZlJ10pXG5cbi8qKiBQYXRoLW9ubHkgZmFsbGJhY2sgZm9yIGtub3duIGZpbGUtbXV0YXRpbmcgdG9vbHMgd2hvc2UgcmVzdWx0IGNhcnJpZWQgbm8gZGlmZi4gKi9cbmZ1bmN0aW9uIG11dGF0aW9uUGF0aCh0b29sOiBzdHJpbmcsIGFyZ3NSYXc6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBsZXQgYXJnczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsID0gbnVsbFxuICB0cnkge1xuICAgIGFyZ3MgPSBKU09OLnBhcnNlKGFyZ3NSYXcpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKCFhcmdzIHx8IHR5cGVvZiBhcmdzICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgaWYgKHRvb2wgPT09ICdmcycgfHwgdG9vbCA9PT0gJ2ZpbGVzeXN0ZW0nKSB7XG4gICAgY29uc3QgY21kID0gdHlwZW9mIGFyZ3MuY29tbWFuZCA9PT0gJ3N0cmluZycgPyBhcmdzLmNvbW1hbmQgOiAnJ1xuICAgIGlmICghTVVUQVRJT05fQ09NTUFORFMuaGFzKGNtZCkpIHJldHVybiBudWxsXG4gICAgcmV0dXJuIHR5cGVvZiBhcmdzLmZpbGVfcGF0aCA9PT0gJ3N0cmluZycgJiYgYXJncy5maWxlX3BhdGggPyBhcmdzLmZpbGVfcGF0aCA6IG51bGxcbiAgfVxuICBpZiAoTVVUQVRJT05fVE9PTFMuaGFzKHRvb2wpIHx8IHRvb2wuc3RhcnRzV2l0aCgnZWRpdCcpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgWydmaWxlX3BhdGgnLCAncGF0aCcsICdmaWxlbmFtZSddKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3Nba2V5XSA9PT0gJ3N0cmluZycgJiYgYXJnc1trZXldKSByZXR1cm4gYXJnc1trZXldIGFzIHN0cmluZ1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG4vKiogRXh0cmFjdCB0aGUgY2hhbmdlZCBmaWxlcyBmcm9tIG9uZSBzZXR0bGVkIHRvb2wgcmVzdWx0IChkaWZmIGh1bmtzLCBlbHNlIHBhdGgtb25seSkuICovXG5mdW5jdGlvbiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQoY2FsbDogeyBuYW1lOiBzdHJpbmc7IGFyZ3NSYXc6IHN0cmluZyB9IHwgbnVsbCwgbm9kZTogVG9vbFJlc3VsdE5vZGUpOiBSb3VuZENoYW5nZVtdIHtcbiAgLy8gTG9uZyBzZXNzaW9ucyB0cnVuY2F0ZSB0aGUgY2FsbCBoZWFkIG91dCBvZiB0aGUgd2luZG93IChjYWxsID09PSBudWxsKSwgYnV0XG4gIC8vIHRoZSBob3N0LWNvbXB1dGVkIGNhbGwvcmVzdWx0IGRpZmYgY2FyZHMgc3RpbGwgY2FycnkgdGhlIGNoYW5nZSBcdTIwMTQgcmVhZCB0aG9zZS5cbiAgY29uc3QgcmVzdWx0RGlmZnMgPSBkaWZmc0Zyb21EaWZmQ2FyZChub2RlLnJlc3VsdFZpZXcpXG4gIGNvbnN0IGNhbGxEaWZmcyA9IHJlc3VsdERpZmZzLmxlbmd0aCA9PT0gMCA/IGRpZmZzRnJvbURpZmZDYXJkKG5vZGUuY2FsbFZpZXcpIDogW11cbiAgY29uc3QgbWV0YURpZmZzID0gcmVzdWx0RGlmZnMubGVuZ3RoID09PSAwICYmIGNhbGxEaWZmcy5sZW5ndGggPT09IDAgPyBkaWZmc0Zyb21NZXRhKG5vZGUubWV0YSkgOiBbXVxuICBjb25zdCBhbGxEaWZmcyA9IHJlc3VsdERpZmZzLmxlbmd0aCA+IDAgPyByZXN1bHREaWZmcyA6IGNhbGxEaWZmcy5sZW5ndGggPiAwID8gY2FsbERpZmZzIDogbWV0YURpZmZzXG4gIGNvbnN0IHRvb2wgPSBjYWxsPy5uYW1lID8/IGRpZmZDYXJkVGl0bGUobm9kZS5jYWxsVmlldykgPz8gJ3Rvb2wnXG4gIGlmIChhbGxEaWZmcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJvdW5kQ2hhbmdlPigpXG4gICAgZm9yIChjb25zdCBkIG9mIGFsbERpZmZzKSB7XG4gICAgICBsZXQgZW50cnkgPSBieVBhdGguZ2V0KGQucGF0aClcbiAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgZW50cnkgPSB7IHBhdGg6IGQucGF0aCwgdG9vbCwgaHVua3M6IFtdLCBoYXNEaWZmOiB0cnVlIH1cbiAgICAgICAgYnlQYXRoLnNldChkLnBhdGgsIGVudHJ5KVxuICAgICAgfVxuICAgICAgZW50cnkuaHVua3MucHVzaCh7IG9sZFRleHQ6IGQub2xkVGV4dCwgbmV3VGV4dDogZC5uZXdUZXh0IH0pXG4gICAgfVxuICAgIHJldHVybiBbLi4uYnlQYXRoLnZhbHVlcygpXVxuICB9XG4gIGNvbnN0IHBhdGggPSBjYWxsID8gbXV0YXRpb25QYXRoKHRvb2wsIGNhbGwuYXJnc1JhdykgOiBudWxsXG4gIHJldHVybiBwYXRoID8gW3sgcGF0aCwgdG9vbCwgaHVua3M6IFtdLCBoYXNEaWZmOiBmYWxzZSB9XSA6IFtdXG59XG5cbi8qKiBQbGFpbiB0ZXh0IG9mIGEgdXNlciBtZXNzYWdlIChjb250ZW50IGJsb2NrcyBvZiB0eXBlICd0ZXh0JykuICovXG5mdW5jdGlvbiB1c2VyVGV4dChub2RlOiBVc2VyTWVzc2FnZU5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIG5vZGUuY29udGVudCkge1xuICAgIGlmIChibG9jayAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnICYmIChibG9jayBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICd0ZXh0JyAmJiB0eXBlb2YgKGJsb2NrIGFzIHsgdGV4dD86IHVua25vd24gfSkudGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBhcnRzLnB1c2goKGJsb2NrIGFzIHsgdGV4dDogc3RyaW5nIH0pLnRleHQpXG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJ0cy5qb2luKCcgJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxufVxuXG4vKiogV2FsayB0aGUgY29udmVyc2F0aW9uIG5vZGVzIGFuZCBncm91cCBjaGFuZ2VkIGZpbGVzIGJ5IHVzZXIgcm91bmQuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdFNlc3Npb25Sb3VuZHMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IFNlc3Npb25Sb3VuZFtdIHtcbiAgY29uc3Qgcm91bmRzOiBTZXNzaW9uUm91bmRbXSA9IFtdXG4gIGxldCBjdXJyZW50OiBTZXNzaW9uUm91bmQgfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBpZiAobm9kZS5raW5kID09PSAndXNlcicpIHtcbiAgICAgIGN1cnJlbnQgPSB7IHJvdW5kOiByb3VuZHMubGVuZ3RoICsgMSwgbGFiZWw6IHVzZXJUZXh0KG5vZGUpLnNsaWNlKDAsIDYwKSwgY2hhbmdlczogW10gfVxuICAgICAgcm91bmRzLnB1c2goY3VycmVudClcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcpIGNvbnRpbnVlXG4gICAgLy8gVGhlIHdpbmRvdyBjYW4gc3RhcnQgbWlkLXR1cm4gKHRoZSBsZWFkaW5nIHVzZXIgbWVzc2FnZSB0cnVuY2F0ZWQgb3V0KTtcbiAgICAvLyBzdGlsbCBzdXJmYWNlIHRoZSB0b29sIHJlc3VsdHMgdW5kZXIgYW4gaW1wbGljaXQgcm91bmQuXG4gICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICBjdXJyZW50ID0geyByb3VuZDogcm91bmRzLmxlbmd0aCArIDEsIGxhYmVsOiAnJywgY2hhbmdlczogW10gfVxuICAgICAgcm91bmRzLnB1c2goY3VycmVudClcbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgY2hhbmdlc0Zyb21Ub29sUmVzdWx0KG5vZGUuY2FsbCwgbm9kZSkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gY3VycmVudC5jaGFuZ2VzLmZpbmQoKGMpID0+IGMucGF0aCA9PT0gY2hhbmdlLnBhdGggJiYgYy50b29sID09PSBjaGFuZ2UudG9vbClcbiAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICBpZiAoY2hhbmdlLmhhc0RpZmYpIHtcbiAgICAgICAgICBleGlzdGluZy5odW5rcy5wdXNoKC4uLmNoYW5nZS5odW5rcylcbiAgICAgICAgICBleGlzdGluZy5oYXNEaWZmID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50LmNoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByb3VuZHMuZmlsdGVyKChyKSA9PiByLmNoYW5nZXMubGVuZ3RoID4gMClcbn1cblxuLyoqIENvdW50IG9mIGNoYW5nZWQgZmlsZXMgYWNyb3NzIGFsbCByb3VuZHMgKGZvciB0aGUgaGVhZGVyIGJhZGdlKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3VudFNlc3Npb25DaGFuZ2VzKG5vZGVzOiByZWFkb25seSBDb252ZXJzYXRpb25Ob2RlW10pOiBudW1iZXIge1xuICBsZXQgY291bnQgPSAwXG4gIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBpZiAobm9kZS5raW5kICE9PSAndG9vbC1yZXN1bHQnKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBrZXkgPSBgJHtjaGFuZ2UudG9vbH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICBpZiAoIXNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgc2Vlbi5hZGQoa2V5KVxuICAgICAgICBjb3VudCsrXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudFxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERpZmYgcmVuZGVyaW5nLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBTcGxpdCBvbmUgYGdpdCBzaG93IC0tZm9ybWF0PWAgZGlmZiBpbnRvIHBlci1maWxlIHNlZ21lbnRzLiAqL1xuZnVuY3Rpb24gc3BsaXRDb21taXREaWZmKGRpZmY6IHN0cmluZyk6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmcgfVtdIHtcbiAgY29uc3Qgc2VnbWVudHM6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBwYXRoOiBzdHJpbmc7IHRleHQ6IHN0cmluZ1tdIH0gfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IGxpbmUgb2YgZGlmZi5zcGxpdCgnXFxuJykpIHtcbiAgICBjb25zdCBtYXRjaCA9IC9eZGlmZiAtLWdpdCBhXFwvKC4qPykgYlxcLy8uZXhlYyhsaW5lKVxuICAgIGlmIChtYXRjaCkge1xuICAgICAgaWYgKGN1cnJlbnQpIHNlZ21lbnRzLnB1c2goY3VycmVudClcbiAgICAgIGN1cnJlbnQgPSB7IHBhdGg6IG1hdGNoWzFdLCB0ZXh0OiBbbGluZV0gfVxuICAgIH0gZWxzZSBpZiAoY3VycmVudCkge1xuICAgICAgY3VycmVudC50ZXh0LnB1c2gobGluZSlcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnQpIHNlZ21lbnRzLnB1c2goY3VycmVudClcbiAgcmV0dXJuIHNlZ21lbnRzLm1hcCgocykgPT4gKHsgcGF0aDogcy5wYXRoLCB0ZXh0OiBzLnRleHQuam9pbignXFxuJykgfSkpXG59XG5cbi8qKiBTdGF0dXMgbGV0dGVyIGZvciBhIGNvbW1pdCdzIGZpbGUsIGRlcml2ZWQgZnJvbSBpdHMgZGlmZiBzZWdtZW50IHRleHQuICovXG5mdW5jdGlvbiBjb21taXRGaWxlU3RhdHVzKHNlZ21lbnRUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoL15uZXcgZmlsZSBtb2RlLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdBJ1xuICBpZiAoL15kZWxldGVkIGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnRCdcbiAgaWYgKC9ecmVuYW1lIGZyb20gLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdSJ1xuICByZXR1cm4gJ00nXG59XG5cbnR5cGUgRGlmZlJvdyA9IHsga2luZDogJ2FkZCcgfCAnZGVsJyB8ICdjdHgnIHwgJ2h1bmsnIHwgJ2ZpbGUnIHwgJ25vdGUnOyB0ZXh0OiBzdHJpbmcgfVxuXG4vKiogQ2xhc3NpZnkgcmF3IHVuaWZpZWQtZGlmZiB0ZXh0IChnaXQgb3V0cHV0KSBpbnRvIHJvd3MuICovXG5mdW5jdGlvbiBnaXREaWZmUm93cyhkaWZmOiBzdHJpbmcpOiBEaWZmUm93W10ge1xuICByZXR1cm4gZGlmZi5zcGxpdCgnXFxuJykubWFwKChsaW5lKSA9PiB7XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKysrJykgfHwgbGluZS5zdGFydHNXaXRoKCctLS0nKSkgcmV0dXJuIHsga2luZDogJ2ZpbGUnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdAQCcpKSByZXR1cm4geyBraW5kOiAnaHVuaycgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysnKSkgcmV0dXJuIHsga2luZDogJ2FkZCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkgcmV0dXJuIHsga2luZDogJ2RlbCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ1xcXFwgJykpIHJldHVybiB7IGtpbmQ6ICdub3RlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgcmV0dXJuIHsga2luZDogJ2N0eCcgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICB9KVxufVxuXG4vKiogQ29tcHV0ZSBhZGQvZGVsL2N0eCByb3dzIGJldHdlZW4gdHdvIHRleHRzICh0aGUgdG9vbHMnIEZpbGVEaWZmIHNoYXBlKS4gKi9cbmZ1bmN0aW9uIHRleHREaWZmUm93cyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBEaWZmUm93W10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gcm93c1xufVxuXG4vKiogU2Vzc2lvbiBjaGFuZ2Ugcm93cyB3aXRoIHJlbGF0aXZlIG9sZC9uZXcgbGluZSBudW1iZXJzIChodW5rIHJvd3MgcmVzZXQpLiAqL1xuZnVuY3Rpb24gc2Vzc2lvblJvd3NXaXRoTGluZXMoY2hhbmdlOiBSb3VuZENoYW5nZSk6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSB7XG4gIGNvbnN0IG91dDogeyByb3c6IERpZmZSb3c7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfVtdID0gW11cbiAgbGV0IG9sZExpbmUgPSAxXG4gIGxldCBuZXdMaW5lID0gMVxuICBmb3IgKGNvbnN0IHJvdyBvZiBjaGFuZ2VSb3dzKGNoYW5nZSkpIHtcbiAgICBpZiAocm93LmtpbmQgPT09ICdjdHgnKSB7XG4gICAgICBvdXQucHVzaCh7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBuZXdMaW5lKysgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnYWRkJykge1xuICAgICAgb3V0LnB1c2goeyByb3csIG9sZExpbmU6IG51bGwsIG5ld0xpbmU6IG5ld0xpbmUrKyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdkZWwnKSB7XG4gICAgICBvdXQucHVzaCh7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBudWxsIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dC5wdXNoKHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBudWxsIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuLyoqIEFsbCByb3dzIGZvciBvbmUgcm91bmQgY2hhbmdlIChtdWx0aXBsZSBodW5rcyBnZXQgYEBAYCBzZXBhcmF0b3JzKS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVJvd3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IERpZmZSb3dbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGNoYW5nZS5odW5rcy5mb3JFYWNoKChodW5rLCBpKSA9PiB7XG4gICAgaWYgKGNoYW5nZS5odW5rcy5sZW5ndGggPiAxKSByb3dzLnB1c2goeyBraW5kOiAnaHVuaycsIHRleHQ6IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIH0pXG4gICAgcm93cy5wdXNoKC4uLnRleHREaWZmUm93cyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dCkpXG4gIH0pXG4gIHJldHVybiByb3dzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3BsaXQgKHR3by1jb2x1bW4pIGRpZmYgdmlldy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogT25lIGFsaWduZWQgcm93IG9mIHRoZSBzaWRlLWJ5LXNpZGUgdmlldy4gKi9cbmludGVyZmFjZSBTcGxpdFJvdyB7XG4gIGxlZnQ6IHN0cmluZ1xuICByaWdodDogc3RyaW5nXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBvbGQgZmlsZSwgb3IgbnVsbCAocHVyZSBhZGRpdGlvbikuICovXG4gIGxlZnROdW06IG51bWJlciB8IG51bGxcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG5ldyBmaWxlLCBvciBudWxsIChwdXJlIGRlbGV0aW9uKS4gKi9cbiAgcmlnaHROdW06IG51bWJlciB8IG51bGxcbiAga2luZDogJ2N0eCcgfCAnY2hhbmdlJ1xufVxuXG4vKiogT25lIHNpZGUtYnktc2lkZSBibG9jayAoYSBodW5rIHdpdGggaXRzIGBAQGAgaGVhZGVyKS4gKi9cbmludGVyZmFjZSBTcGxpdEJsb2NrIHtcbiAgaGVhZDogc3RyaW5nIHwgbnVsbFxuICByb3dzOiBTcGxpdFJvd1tdXG59XG5cbi8qKlxuICogUGFpciBhZGQvZGVsIHJvd3MgaW50byBhbGlnbmVkIGxlZnQvcmlnaHQgY29sdW1ucy4gUmVtb3ZlZCBsaW5lcyBidWZmZXJcbiAqIHVudGlsIHRoZSBtYXRjaGluZyBhZGRpdGlvbnMgYXJyaXZlICh1bmlmaWVkIGRpZmYgb3JkZXJzIGRlbGV0aW9ucyBiZWZvcmVcbiAqIGFkZGl0aW9ucyksIHNvIHB1cmUgZGVsZXRpb25zIGFuZCBwdXJlIGFkZGl0aW9ucyBzdGlsbCBnZXQgdGhlaXIgb3duIHJvd1xuICogd2l0aCBhbiBlbXB0eSBjZWxsIG9uIHRoZSBvcHBvc2l0ZSBzaWRlLiBMaW5lIG51bWJlcnMgdHJhY2sgZnJvbSB0aGUgaHVua1xuICogaGVhZGVyJ3MgYC1hLGIgK2MsZGAgcG9zaXRpb25zLlxuICovXG5mdW5jdGlvbiBwYWlyUm93cyhyb3dzOiBEaWZmUm93W10sIG9sZFN0YXJ0OiBudW1iZXIsIG5ld1N0YXJ0OiBudW1iZXIpOiBTcGxpdFJvd1tdIHtcbiAgY29uc3Qgb3V0OiBTcGxpdFJvd1tdID0gW11cbiAgbGV0IG9sZExpbmUgPSBvbGRTdGFydFxuICBsZXQgbmV3TGluZSA9IG5ld1N0YXJ0XG4gIGxldCBwZW5kaW5nOiB7IHRleHQ6IHN0cmluZzsgbnVtOiBudW1iZXIgfVtdID0gW11cbiAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBwIG9mIHBlbmRpbmcpIG91dC5wdXNoKHsgbGVmdDogcC50ZXh0LCByaWdodDogJycsIGxlZnROdW06IHAubnVtLCByaWdodE51bTogbnVsbCwga2luZDogJ2NoYW5nZScgfSlcbiAgICBwZW5kaW5nID0gW11cbiAgfVxuICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgcGVuZGluZy5wdXNoKHsgdGV4dDogcm93LnRleHQuc2xpY2UoMSksIG51bTogb2xkTGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgIGNvbnN0IHAgPSBwZW5kaW5nLnNoaWZ0KClcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogcD8udGV4dCA/PyAnJywgcmlnaHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBsZWZ0TnVtOiBwPy5udW0gPz8gbnVsbCwgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2NoYW5nZScgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgZmx1c2goKVxuICAgICAgLy8gVW5pZmllZC1kaWZmIGNvbnRleHQgbGluZXMgY2FycnkgYSBsZWFkaW5nIHNwYWNlIFx1MjAxNCBzdHJpcCBpdCBmb3IgdGhlXG4gICAgICAvLyBzcGxpdCBjZWxscyBzbyBib3RoIGNvbHVtbnMgcmVuZGVyIGJhcmUgdGV4dC5cbiAgICAgIGNvbnN0IHRleHQgPSByb3cudGV4dC5zdGFydHNXaXRoKCcgJykgPyByb3cudGV4dC5zbGljZSgxKSA6IHJvdy50ZXh0XG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHRleHQsIHJpZ2h0OiB0ZXh0LCBsZWZ0TnVtOiBvbGRMaW5lKyssIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjdHgnIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGZsdXNoKCkgLy8gbm90ZXMgKFxcIE5vIG5ld2xpbmVcdTIwMjYpIGFuZCBzdHJheSByb3dzOiBqdXN0IGJyZWFrIHRoZSBwYWlyaW5nXG4gICAgfVxuICB9XG4gIGZsdXNoKClcbiAgcmV0dXJuIG91dFxufVxuXG4vKiogUGFyc2UgZ2l0IHVuaWZpZWQgZGlmZiB0ZXh0IGludG8gYmxvY2tzIChgLS0tLysrK2AgZmlsZSByb3dzIGFuZCBgQEBgIGh1bmtzKS4gKi9cbmNvbnN0IEdJVF9NRVRBID0gL14oZGlmZiAtLWdpdCB8aW5kZXggfG5ldyBmaWxlIHxkZWxldGVkIGZpbGUgfG9sZCBtb2RlIHxuZXcgbW9kZSB8c2ltaWxhcml0eSBpbmRleCB8cmVuYW1lIChmcm9tfHRvKSB8QmluYXJ5IGZpbGVzICkvXG5cbmZ1bmN0aW9uIHBhcnNlR2l0QmxvY2tzKGRpZmY6IHN0cmluZyk6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10ge1xuICBjb25zdCBibG9ja3M6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9W10gPSBbXVxuICBsZXQgY3VycmVudDogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH0gfCBudWxsID0gbnVsbFxuICBjb25zdCBsaW5lcyA9IGRpZmYuc3BsaXQoJ1xcbicpXG4gIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgbGV0IGtpbmQ6IERpZmZSb3dbJ2tpbmQnXVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykgfHwgR0lUX01FVEEudGVzdChsaW5lKSkga2luZCA9ICdmaWxlJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkga2luZCA9ICdodW5rJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKycpKSBraW5kID0gJ2FkZCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJy0nKSkga2luZCA9ICdkZWwnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSBraW5kID0gJ25vdGUnXG4gICAgZWxzZSBraW5kID0gJ2N0eCdcbiAgICBpZiAoa2luZCA9PT0gJ2ZpbGUnIHx8IGtpbmQgPT09ICdodW5rJykge1xuICAgICAgY3VycmVudCA9IHsgaGVhZDogeyBraW5kLCB0ZXh0OiBsaW5lIH0sIHJvd3M6IFtdIH1cbiAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY3VycmVudCkge1xuICAgICAgICBjdXJyZW50ID0geyBoZWFkOiBudWxsLCByb3dzOiBbXSB9XG4gICAgICAgIGJsb2Nrcy5wdXNoKGN1cnJlbnQpXG4gICAgICB9XG4gICAgICBjdXJyZW50LnJvd3MucHVzaCh7IGtpbmQsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJsb2Nrc1xufVxuXG4vKiogSHVuayBzdGFydCBwb3NpdGlvbnMgZnJvbSBhIGBAQCAtYSxiICtjLGQgQEBgIGhlYWRlci4gKi9cbmZ1bmN0aW9uIGh1bmtTdGFydHMoaGVhZDogc3RyaW5nKTogeyBvbGRTdGFydDogbnVtYmVyOyBuZXdTdGFydDogbnVtYmVyIH0ge1xuICBjb25zdCBtID0gL15AQCAtKFxcZCspKD86LFxcZCspPyBcXCsoXFxkKykvLmV4ZWMoaGVhZClcbiAgcmV0dXJuIHsgb2xkU3RhcnQ6IG0gPyBOdW1iZXIobVsxXSkgOiAxLCBuZXdTdGFydDogbSA/IE51bWJlcihtWzJdKSA6IDEgfVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgYSBnaXQgdW5pZmllZCBkaWZmIChza2lwcyBwdXJlIGZpbGUtaGVhZGVyIGJsb2NrcykuICovXG5mdW5jdGlvbiBnaXRTcGxpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICByZXR1cm4gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgICAuZmlsdGVyKChiKSA9PiBiLmhlYWQ/LmtpbmQgIT09ICdmaWxlJyAmJiAoYi5yb3dzLmxlbmd0aCA+IDAgfHwgYi5oZWFkPy5raW5kID09PSAnaHVuaycpKVxuICAgIC5tYXAoKGIpID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0cyA9IGIuaGVhZCA/IGh1bmtTdGFydHMoYi5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgcmV0dXJuIHsgaGVhZDogYi5oZWFkPy5raW5kID09PSAnaHVuaycgPyBiLmhlYWQudGV4dCA6IG51bGwsIHJvd3M6IHBhaXJSb3dzKGIucm93cywgc3RhcnRzLm9sZFN0YXJ0LCBzdGFydHMubmV3U3RhcnQpIH1cbiAgICB9KVxufVxuXG4vKiogU2lkZS1ieS1zaWRlIGJsb2NrcyBmb3IgdGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSAob2xkVGV4dC9uZXdUZXh0KS4gKi9cbmZ1bmN0aW9uIHRleHRTcGxpdEJsb2NrcyhvbGRUZXh0OiBzdHJpbmcgfCBudWxsLCBuZXdUZXh0OiBzdHJpbmcpOiBTcGxpdEJsb2NrW10ge1xuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKG9sZFRleHQgPz8gJycsIG5ld1RleHQpKSB7XG4gICAgY29uc3QgbGluZXMgPSBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKVxuICAgIGlmIChsaW5lcy5sZW5ndGggPiAwICYmIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdID09PSAnJykgbGluZXMucG9wKClcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGlmIChwYXJ0LmFkZGVkKSByb3dzLnB1c2goeyBraW5kOiAnYWRkJywgdGV4dDogYCske2xpbmV9YCB9KVxuICAgICAgZWxzZSBpZiAocGFydC5yZW1vdmVkKSByb3dzLnB1c2goeyBraW5kOiAnZGVsJywgdGV4dDogYC0ke2xpbmV9YCB9KVxuICAgICAgZWxzZSByb3dzLnB1c2goeyBraW5kOiAnY3R4JywgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gW3sgaGVhZDogbnVsbCwgcm93czogcGFpclJvd3Mocm93cywgMSwgMSkgfV1cbn1cblxuLyoqIEFsbCBzaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBvbmUgcm91bmQgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hhbmdlU3BsaXRCbG9ja3MoY2hhbmdlOiBSb3VuZENoYW5nZSk6IFNwbGl0QmxvY2tbXSB7XG4gIGlmICghY2hhbmdlLmhhc0RpZmYgfHwgY2hhbmdlLmh1bmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gIHJldHVybiBjaGFuZ2UuaHVua3MubWFwKChodW5rLCBpKSA9PiAoe1xuICAgIGhlYWQ6IGNoYW5nZS5odW5rcy5sZW5ndGggPiAxID8gYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgOiBudWxsLFxuICAgIHJvd3M6IHRleHRTcGxpdEJsb2NrcyhodW5rLm9sZFRleHQsIGh1bmsubmV3VGV4dClbMF0ucm93cyxcbiAgfSkpXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU3R5bGVzIChkc2RyLSo7IHRoZSBoZWFkZXIgdHJpZ2dlciBtaXJyb3JzIHRoZSBpbi10cmVlIGFjdGlvbiByb3dzKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBSRVZJRVdfQ1NTID0gYFxuLmRzZHItdHJpZ2dlcnttaW4taGVpZ2h0OjI4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjRweDtwYWRkaW5nOjNweCA2cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXRyaWdnZXI6aG92ZXIsLmRzZHItdHJpZ2dlcjpmb2N1cy12aXNpYmxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbGFiZWx7bWFyZ2luLWxlZnQ6MnB4fVxuLmRzZHItY291bnR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDttaW4td2lkdGg6MTZweDt0ZXh0LWFsaWduOmNlbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA1cHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zfVxuLmRzZHItb3ZlcmxheXtwb3NpdGlvbjpmaXhlZDtpbnNldDowO3otaW5kZXg6MjAwO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNDUpO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtwYWRkaW5nOjMycHh9XG4uZHNkci1wYW5lbHtib3gtc2l6aW5nOmJvcmRlci1ib3g7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6bWluKDExMjBweCwxMDAlKTtoZWlnaHQ6bWluKDcyMHB4LGNhbGMoMTAwdmggLSA2NHB4KSk7bWF4LXdpZHRoOmNhbGMoMTAwdncgLSA2NHB4KTttYXgtaGVpZ2h0OmNhbGMoMTAwdmggLSA2NHB4KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czoxNHB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItcmVzaXple3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NX1cbi5kc2RyLXJlc2l6ZS1le3RvcDowO3JpZ2h0Oi0zcHg7d2lkdGg6N3B4O2hlaWdodDoxMDAlO2N1cnNvcjpldy1yZXNpemV9XG4uZHNkci1yZXNpemUtc3tib3R0b206LTNweDtsZWZ0OjA7d2lkdGg6MTAwJTtoZWlnaHQ6N3B4O2N1cnNvcjpucy1yZXNpemV9XG4uZHNkci1yZXNpemUtc2V7cmlnaHQ6LTRweDtib3R0b206LTRweDt3aWR0aDoxNXB4O2hlaWdodDoxNXB4O2N1cnNvcjpud3NlLXJlc2l6ZX1cbi5kc2RyLWhlYWRlcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6MTJweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLXRpdGxle2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zdWJ0aXRsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItdGFic3tkaXNwbGF5OmZsZXg7Z2FwOjRweDttYXJnaW4tbGVmdDoxNHB4fVxuLmRzZHItdGFie2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI2cHg7Ym9yZGVyOjFweCBzb2xpZCB0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoycHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLXRhYjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXRhYi1hY3RpdmV7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zY29wZXtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21hcmdpbi1sZWZ0OjhweH1cbi5kc2RyLXNjb3BlIC5kc2RyLXNlbC10cmlnZ2Vye21pbi13aWR0aDoxMTBweDtoZWlnaHQ6MjZweDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MCA4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1zcGFjZXJ7ZmxleDoxfVxuLmRzZHItYnRue2JveC1zaXppbmc6Ym9yZGVyLWJveDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweH1cbi5kc2RyLWJ0bjpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuOmRpc2FibGVke29wYWNpdHk6LjU7Y3Vyc29yOmRlZmF1bHR9XG4uZHNkci1idG4tcHJpbWFyeXtib3JkZXItY29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC00MDApO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcjpob3Zlcjpub3QoOmRpc2FibGVkKXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tY29uZmlybXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItYnRuLWNvbmZpcm06aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1jb21taXQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjIwMHB4O21pbi1oZWlnaHQ6MjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjNweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItY29tbWl0LWlucHV0OjpwbGFjZWhvbGRlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtY2FwdGlvbil9XG4uZHNkci1jb21taXQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1zZWN0aW9ue2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjEwcHggOHB4IDNweDtmb250LXdlaWdodDo2MDA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4fVxuLmRzZHItc2VjdGlvbjpmaXJzdC1jaGlsZHtwYWRkaW5nLXRvcDo0cHh9XG4uZHNkci1icmFuY2h7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NHB4IDhweCA4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1icmFuY2gtcmVme2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczttaW4td2lkdGg6MDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnJhbmNoLWFycm93e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1icmFuY2gtc3RhdHtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWJyYW5jaC1haGVhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1iZWhpbmR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXdhcm4tcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtc3luY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdHtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NXB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY29tbWl0OmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRsLXNlbGVjdGVkIC5kc2RyLWNvbW1pdHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10aW1lbGluZXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItdGwtaXRlbXtkaXNwbGF5OmZsZXg7Z2FwOjZweDthbGlnbi1pdGVtczpzdHJldGNoO2JvcmRlci1yYWRpdXM6OHB4fVxuLmRzZHItdGwtcmFpbHtwb3NpdGlvbjpyZWxhdGl2ZTtmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcn1cbi5kc2RyLXRsLXJhaWw6OmJlZm9yZXtjb250ZW50OlwiXCI7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7Ym90dG9tOjA7bGVmdDo1MCU7d2lkdGg6MXB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMil9XG4uZHNkci10bC1pdGVtOmZpcnN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXt0b3A6OXB4fVxuLmRzZHItdGwtaXRlbTpsYXN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXtib3R0b206YXV0bztoZWlnaHQ6OXB4fVxuLmRzZHItdGwtZG90e3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MTt0b3A6OXB4O2ZsZXg6bm9uZTt3aWR0aDo3cHg7aGVpZ2h0OjdweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItdGwtZG90LWxvY2Fse2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1kb3QtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWNvbW1pdC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4td2lkdGg6MH1cbi5kc2RyLWNvbW1pdC1zaG9ydHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1zdWJqZWN0e2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1jb21taXQtbWV0YXtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmctbGVmdDowfVxuLmRzZHItdGwtYmFkZ2V7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDVweH1cbi5kc2RyLXRsLWJhZGdlLWxvY2Fse2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWJhZGdlLXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItZGlmZi1oYXNoe21hcmdpbi1sZWZ0OjhweDtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LWZpbGUtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItY29tbWl0LWZpbGUtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7bWFyZ2luLWxlZnQ6NHB4fVxuLmRzZHItY2ZnLWNhcmR7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXItcmFkaXVzOjEycHg7bGlzdC1zdHlsZTpub25lO3RyYW5zaXRpb246Ym9yZGVyLWNvbG9yIC4xNnMsYmFja2dyb3VuZCAuMTZzfVxuLmRzZHItY2ZnLWNhcmQ6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWNhcmQtb3BlbntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jZmctaGVhZHthcHBlYXJhbmNlOm5vbmU7d2lkdGg6MTAwJTtmb250OmluaGVyaXQ7Y29sb3I6aW5oZXJpdDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czoxMnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtwYWRkaW5nOjE0cHggMTZweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctaGVhZDpmb2N1cy12aXNpYmxle291dGxpbmU6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lLW9mZnNldDotMnB4fVxuLmRzZHItY2ZnLWhlYWQtdGV4dHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47ZmxleDoxO2dhcDo0cHg7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLW5hbWV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjYwMDtsaW5lLWhlaWdodDoxLjR9XG4uZHNkci1jZmctZGVzY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1jYXJldHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTZzfVxuLmRzZHItY2ZnLWNhcmV0LW9wZW57dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItY2ZnLWJvZHl7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7bWFyZ2luOjAgMTZweDtwYWRkaW5nLWJvdHRvbTo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLWNmZy1maWVsZHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjEycHggMDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctZmllbGQrLmRzZHItY2ZnLWZpZWxke2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItY2ZnLWxhYmVse21pbi13aWR0aDowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NTAwO2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1oaW50e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLXBlbmRpbmd7d2hpdGUtc3BhY2U6bm93cmFwO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDtmbGV4Om5vbmU7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxN3B4fVxuLmRzZHItY2ZnLWZhaWxlZHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZXJyb3IpO2ZsZXg6MTttYXJnaW46MDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctYWN0aW9uc3tib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzoxMnB4IDAgNHB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWJvZHl7ZGlzcGxheTpmbGV4O2ZsZXg6MTttaW4taGVpZ2h0OjB9XG4uZHNkci1maWxlc3t3aWR0aDozMDBweDtmbGV4Om5vbmU7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtvdmVyZmxvdy15OmF1dG87cGFkZGluZzo4cHh9XG4uZHNkci1yb3VuZHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo4cHggOHB4IDNweDtmb250LXdlaWdodDo2MDB9XG4uZHNkci1yb3VuZC1sYWJlbHt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NDAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItZmlsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maWxlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbGUtc2VsZWN0ZWR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZGlye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItZGlyOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kaXItY2FyZXR7ZmxleDpub25lO3dpZHRoOjEycHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpci1uYW1le2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItZGlyLWNvdW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWZpbGUtbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmlsZS1zdGF0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWNoaXB7ZmxleDpub25lO21pbi13aWR0aDoyMnB4O3RleHQtYWxpZ246Y2VudGVyO2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNoaXAtbXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtYXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtZHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xNik7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWNoaXAtcntiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpO2NvbG9yOiM1OGE2ZmZ9XG4uZHNkci1jaGlwLXV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXRvb2x7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1kaWZme2ZsZXg6MTttaW4td2lkdGg6MDtvdmVyZmxvdzphdXRvO3BhZGRpbmc6MTBweCAwfVxuLmRzZHItZGlmZi1lbXB0eXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7aGVpZ2h0OjEwMCU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWRpZmYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6NnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItZGlmZi1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZGlmZi1zdGF0c3tmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXNjcm9sbHtmbGV4OjE7bWluLWhlaWdodDowO292ZXJmbG93OmF1dG87ZGlzcGxheTpmbGV4fVxuLmRzZHItcHJle21hcmdpbjowO3BhZGRpbmc6OHB4IDA7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KTt3aGl0ZS1zcGFjZTpwcmU7bWluLXdpZHRoOjEwMCU7ZmxleDoxfVxuLmRzZHItbGluZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MTBweDtwYWRkaW5nOjAgMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cG9zaXRpb246cmVsYXRpdmV9XG4uZHNkci1saW5lLW51bXtmbGV4Om5vbmU7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NDBweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO29wYWNpdHk6Ljc1fVxuLmRzZHItbGluZS10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpwcmV9XG4uZHNkci1jb21tZW50LWFkZHtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtNTAlKTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MTZweDtoZWlnaHQ6MTZweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjRweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRkLC5kc2RyLWNvbW1lbnQtYWRkOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItY29tbWVudC1hZGQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1lbnQtaGFze3Zpc2liaWxpdHk6dmlzaWJsZTtiYWNrZ3JvdW5kOmNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCkgMTYlLCB0cmFuc3BhcmVudCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmb250LXNpemU6MTBweH1cbi5kc2RyLWxpbmUtY29tbWVudGVke2JveC1zaGFkb3c6aW5zZXQgM3B4IDAgMCBjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDcwJSwgdHJhbnNwYXJlbnQpfVxuLmRzZHItY29tbWVudC1lZGl0b3J7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1jb21tZW50LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6NTJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6NnB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtyZXNpemU6dmVydGljYWx9XG4uZHNkci1jb21tZW50LWlucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpfVxuLmRzZHItY29tbWVudC1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2p1c3RpZnktY29udGVudDpmbGV4LWVuZH1cbi5kc2RyLW9wZW5saW5le2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MThweDtoZWlnaHQ6MThweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLW9wZW5saW5lLC5kc2RyLW9wZW5saW5lOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItb3BlbmxpbmU6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItbGluZS1maW5kaW5ne2JveC1zaGFkb3c6aW5zZXQgM3B4IDAgMCB2YXIoLS1kc2RyLWZpbmRpbmctY29sb3IsIHJnYmEoMjU1LDE2Niw4NywuNykpfVxuLmRzZHItZmluZGluZy1QMHstLWRzZHItZmluZGluZy1jb2xvcjojZjg1MTQ5fVxuLmRzZHItZmluZGluZy1QMXstLWRzZHItZmluZGluZy1jb2xvcjojZmZhNjU3fVxuLmRzZHItZmluZGluZy1QMnstLWRzZHItZmluZGluZy1jb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy1QM3stLWRzZHItZmluZGluZy1jb2xvcjojOGI5NDllfVxuLmRzZHItZmluZGluZy10YWd7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo2MDA7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0O21hcmdpbi10b3A6MnB4fVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAwe2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE4KTtjb2xvcjojZjg1MTQ5fVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAxe2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4xNik7Y29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMntiYWNrZ3JvdW5kOnJnYmEoMjEwLDE1MywzNCwuMTYpO2NvbG9yOiNkMjk5MjJ9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDN7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtanVtcHtiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpfVxuLmRzZHItdmVyZGljdHtwb3NpdGlvbjpzdGlja3k7dG9wOjA7ei1pbmRleDo2O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttYXJnaW46MCAwIDZweDtwYWRkaW5nOjhweCAxMnB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjEwcHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Mik7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLXZlcmRpY3QtbWFya3tmbGV4Om5vbmU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoyMHB4O2hlaWdodDoyMHB4O2JvcmRlci1yYWRpdXM6NTAlO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjcwMH1cbi5kc2RyLXZlcmRpY3Qtb2sgLmRzZHItdmVyZGljdC1tYXJre2JhY2tncm91bmQ6Y29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpIDE4JSwgdHJhbnNwYXJlbnQpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdmVyZGljdC1iYWQgLmRzZHItdmVyZGljdC1tYXJre2JhY2tncm91bmQ6Y29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KSAxOCUsIHRyYW5zcGFyZW50KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci12ZXJkaWN0LXRleHR7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3Qtb2sgLmRzZHItdmVyZGljdC10ZXh0e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdmVyZGljdC1iYWQgLmRzZHItdmVyZGljdC10ZXh0e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3QtbWV0YXtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci12ZXJkaWN0LW1vZGVse2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1maW5kaW5nLWNhcmR7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O21hcmdpbjo0cHggMCA2cHg7cGFkZGluZzo4cHggMTZweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLmRzZHItc2F2ZWQtY29tbWVudC1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXNhdmVkLWNvbW1lbnQtanVtcHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7d2lkdGg6MTAwJTttaW4td2lkdGg6MDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6NnB4O3BhZGRpbmc6MnB4O3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcjtmb250OmluaGVyaXR9XG4uZHNkci1zYXZlZC1jb21tZW50LWp1bXA6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItc2F2ZWQtY29tbWVudC1qdW1wOmhvdmVyIC5kc2RyLXNhdmVkLWNvbW1lbnQtbG9je2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItc2F2ZWQtY29tbWVudC12aWV3e3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7cmVzaXplOm5vbmV9XG4uZHNkci1maW5kaW5nLWNhcmQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1maW5kaW5nLWNhcmQtdGl0bGV7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maW5kaW5nLWNhcmQtbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfVxuLmRzZHItZmluZGluZy1jYXJkLWRldGFpbHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1maW5kaW5nLWNhcmQtbWV0YXtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmluZGluZy1jYXJkLXN1Z2dlc3Rpb257bWFyZ2luOjA7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXBye2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDtwYWRkaW5nOjRweCA4cHggOHB4fVxuLmRzZHItcHItaXRlbXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDozcHg7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdH1cbi5kc2RyLXByLWl0ZW06aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItcHItbWV0YXtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItcHItdGV4dHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZG9ja3tib3gtc2l6aW5nOmJvcmRlci1ib3g7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3dpZHRoOjEwMCU7bWF4LXdpZHRoOnZhcigtLWRzaC1jb21wb3Nlci1jYXJkLW1heC13aWR0aCwgNzgwcHgpO21hcmdpbjowIGF1dG8gY2FsYygtMSAqIHZhcigtLWRzaC1jb21wb3Nlci1zdGFjay1nYXAsIDZweCkgLSA4cHgpO3BhZGRpbmc6OHB4IDE2cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtaW5wdXQtbWFqb3IpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMi1kYXJrbW9kZS10aGluKTtib3JkZXItYm90dG9tOm5vbmU7Ym9yZGVyLXJhZGl1czoyMnB4IDIycHggMCAwO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZG9jay1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4taGVpZ2h0OjIycHg7bWFyZ2luOi04cHggLTE2cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItcmFkaXVzOjIycHggMjJweCAwIDA7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci1kb2NrLWhlYWQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZG9jay1pY29ue2Rpc3BsYXk6aW5saW5lLWZsZXg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpfVxuLmRzZHItZG9jay1jb3VudHtmb250LXdlaWdodDo2MDA7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci1kb2NrLWZsYXNoe2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpO2ZvbnQtc2l6ZToxMXB4O3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2stc2VuZC1oaW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCk7dmlzaWJpbGl0eTpoaWRkZW47d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItZG9jay1oZWFkOmhvdmVyIC5kc2RyLWRvY2stc2VuZC1oaW50e3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWRvY2stY2xvc2V7ZmxleDpub25lO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MjBweDtoZWlnaHQ6MjBweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowfVxuLmRzZHItZG9jay1jbG9zZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZG9jay1jaGlwc3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWluLWhlaWdodDoyNnB4O21hcmdpbjowIC0xNnB4O3BhZGRpbmc6MCAxNnB4O292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWRvY2stY2hpcHtmbGV4OjAgMSBhdXRvO21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjNweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0O3RleHQtYWxpZ246bGVmdH1cbi5kc2RyLWRvY2stY2hpcDpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1kb2NrLWNoaXAtbG9je2ZsZXg6bm9uZTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCk7d2hpdGUtc3BhY2U6bm93cmFwO21heC13aWR0aDo0MiU7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXN9XG4uZHNkci1kb2NrLWNoaXAtdGV4dHttaW4td2lkdGg6MDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc31cbi5kc2RyLWRvY2stY2hpcC1tb3Jle2ZsZXg6bm9uZTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzoycHggNnB4O2JvcmRlci1yYWRpdXM6NnB4O3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2stY2hpcC1tb3JlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZW5ke3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NDA7dG9wOjUycHg7cmlnaHQ6MTZweDt3aWR0aDptaW4oNDgwcHgsY2FsYygxMDAlIC0gMzJweCkpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym9yZGVyLXJhZGl1czoxMnB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO3BhZGRpbmc6MTJweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo4cHh9XG4uZHNkci1zZW5kLXRpdGxle2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZW5kLWhpbnR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc2VuZC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjE0MHB4O21heC1oZWlnaHQ6MzIwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cmVzaXplOnZlcnRpY2FsO3doaXRlLXNwYWNlOnByZS13cmFwfVxuLmRzZHItbGluZS1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItbGluZS1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItbGluZS1odW5re2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWZpbGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtbm90ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc3R5bGU6aXRhbGljfVxuLmRzZHItaHVuay1iYXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O3BhZGRpbmc6MnB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMil9XG4uZHNkci1odW5rLWJhciAuZHNkci1idG57bWluLWhlaWdodDoyMnB4O3BhZGRpbmc6MXB4IDhweDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4fVxuLmRzZHItaHVuay1sYXllcntmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7bWFyZ2luLXJpZ2h0OmF1dG99XG4uZHNkci1mb290e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWluLWhlaWdodDozNnB4fVxuLmRzZHItbm90aWNle2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbm90aWNlLW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItbm90aWNlLWVycm9ye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXNwaW5uZXJ7ZmxleDpub25lO3dpZHRoOjEycHg7aGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjJweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItdG9wLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2FuaW1hdGlvbjpkc2RyLXNwaW4gLjhzIGxpbmVhciBpbmZpbml0ZX1cbkBrZXlmcmFtZXMgZHNkci1zcGlue3Rve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19XG4uZHNkci1lbXB0eXtwYWRkaW5nOjQwcHg7dGV4dC1hbGlnbjpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWVtcHR5LWFjdGlvbnN7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpjZW50ZXI7bWFyZ2luLXRvcDoxMnB4fVxuLmRzZHItbm9kaWZme3BhZGRpbmc6OHB4IDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLXNlbHtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItc2VsLXRyaWdnZXJ7Ym94LXNpemluZzpjb250ZW50LWJveDttaW4td2lkdGg6MTgwcHg7aGVpZ2h0OjM0cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMyk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowIDEycHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4fVxuLmRzZHItc2VsLXRyaWdnZXI6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItc2VsLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpO291dGxpbmU6bm9uZX1cbi5kc2RyLXNlbC10cmlnZ2VyIHN2Z3tmbGV4Om5vbmU7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjEyc31cbi5kc2RyLXNlbC10cmlnZ2VyW2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdIHN2Z3t0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9XG4uZHNkci1zZWwtdmFsdWV7ZmxleDoxO21pbi13aWR0aDowO3RleHQtYWxpZ246bGVmdDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1zZWwtbWVudXt6LWluZGV4OjIwMDtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLXdpZHRoOjEwMCU7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtib3JkZXItcmFkaXVzOjEwcHg7bWFyZ2luOjA7cGFkZGluZzo0cHg7bGlzdC1zdHlsZTpub25lO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjFweDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6Y2FsYygxMDAlICsgNXB4KTtsZWZ0OjB9XG4uZHNkci1zZWwtb3B0aW9ue2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MzBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Ym9yZGVyLXJhZGl1czo3cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo1cHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO3RleHQtYWxpZ246bGVmdDtkaXNwbGF5OmZsZXh9XG4uZHNkci1zZWwtb3B0aW9uOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXNlbC1vcHRpb24tYWN0aXZle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbWFya3tmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItc2VsLW9wdGlvbi1sYWJlbHtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItdmlldy10b2dnbGV7ZGlzcGxheTpmbGV4O2dhcDoycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjJweDtmbGV4Om5vbmV9XG4uZHNkci12aWV3LWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyMnB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjFweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci12aWV3LWJ0bjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXZpZXctYnRuLWFjdGl2ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXR7bWluLXdpZHRoOjEwMCV9XG4uZHNkci1zcGxpdC1oZWFke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo0cHggOHB4O3Bvc2l0aW9uOnN0aWNreTt0b3A6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItc3BsaXQtaGVhZCBkaXZ7ZGlzcGxheTpmbGV4O2dhcDo4cHh9XG4uZHNkci1zcGxpdC1odW5re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MnB4IDE2cHh9XG4uZHNkci1zcGxpdC1yb3d7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCl9XG4uZHNkci1zcGxpdC1jZWxsOmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRkLC5kc2RyLXNwbGl0LXJvdzpob3ZlciAuZHNkci1jb21tZW50LWFkZHt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1zcGxpdC1jZWxse2Rpc3BsYXk6ZmxleDtmbGV4LXdyYXA6d3JhcDtnYXA6OHB4O3BhZGRpbmc6MCA4cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGxpdC1jZWxsPi5kc2RyLWNvbW1lbnQtZWRpdG9ye2ZsZXg6MCAwIDEwMCU7cGFkZGluZzo2cHggOHB4fVxuLmRzZHItc3BsaXQtbnVte2ZsZXg6bm9uZTtwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo0MnB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZTpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSAtIDFweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjB9XG4uZHNkci1jZWxsLWZpbmRpbmd7Ym94LXNoYWRvdzppbnNldCAwIDAgMCAxcHggdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKTtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMDgpfVxuLmRzZHItY2VsbC1qdW1we2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNil9XG4uZHNkci1zcGxpdC1maW5kaW5ne2ZsZXg6bm9uZTtmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czozcHg7cGFkZGluZzowIDNweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo2MDA7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDB7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTgpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMntiYWNrZ3JvdW5kOnJnYmEoMjEwLDE1MywzNCwuMTYpO2NvbG9yOiNkMjk5MjJ9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QM3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc3BsaXQtb3BlbmxpbmV7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxNnB4O2hlaWdodDoxNnB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxO3BhZGRpbmc6MDt2aXNpYmlsaXR5OmhpZGRlbn1cbi5kc2RyLXNwbGl0LWNlbGw6aG92ZXIgLmRzZHItc3BsaXQtb3BlbmxpbmUsLmRzZHItc3BsaXQtb3BlbmxpbmU6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1zcGxpdC1vcGVubGluZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jZWxsLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1jZWxsLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1jZWxsLWRpbXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwxLCByZ2JhKDEyOCwxMjgsMTI4LC4wNSkpfVxuLyogLS0tIGNvbnZlcnNhdGlvbiByZXZpZXcgY2FyZCAoQ29kZXgtc3R5bGUpIC0tLSAqL1xuLmRzZHItcmV2aWV3LWNhcmR7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O21heC13aWR0aDptaW4oNzIwcHgsMTAwJSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1yYWRpdXM6MTZweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYyKTtvdmVyZmxvdzpoaWRkZW47bWFyZ2luOjJweCAwfVxuLmRzZHItcmV2aWV3LWNhcmQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo4cHggMTJweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLXJldmlldy1jYXJkLWJhZGdle2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWJhZGdlIHN2Z3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCl9XG4uZHNkci1yZXZpZXctY2FyZC13b3Jrc3BhY2V7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfVxuLmRzZHItcmV2aWV3LWNhcmQtbWV0YXtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWdyb3Vwe2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDt3aWR0aDoxMDAlO21pbi13aWR0aDowO3BhZGRpbmc6NnB4IDEycHg7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoIHNwYW57bWluLXdpZHRoOjA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItcmV2aWV3LWNhcmQtaXRlbXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6OHB4O3dpZHRoOjEwMCU7bWluLXdpZHRoOjA7cGFkZGluZzo1cHggMTJweCA1cHggMjZweDtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci1yZXZpZXctY2FyZC1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXJldmlldy1jYXJkLWxvY3tmbGV4Om5vbmU7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpO3doaXRlLXNwYWNlOm5vd3JhcDtwYWRkaW5nLXRvcDoxcHh9XG4uZHNkci1yZXZpZXctY2FyZC10ZXh0e21pbi13aWR0aDowO292ZXJmbG93LXdyYXA6YW55d2hlcmU7d2hpdGUtc3BhY2U6cHJlLXdyYXB9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LXNlY3tkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo4cHggMTJweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3R7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjYwMDtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjFweCA2cHh9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LWNvcnJlY3R7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC1pbmNvcnJlY3R7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWZpbmRpbmd7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjZweDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtZmluZGluZy10ZXh0e21pbi13aWR0aDowO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1yZXZpZXctY2FyZC1maW5kaW5nLWxvY3tmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtZm9vdHtwYWRkaW5nOjZweCAxMnB4O2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4vKiAtLS0gZmFsbGJhY2sgdXNlciBidWJibGUgKG5hdGl2ZSBsb29rKSAtLS0gKi9cbi5kc2RyLWZhbGxiYWNrLXVzZXJ7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmZsZXgtZW5kO2dhcDo2cHg7ZGlzcGxheTpmbGV4fVxuLmRzZHItZmFsbGJhY2stdXNlci1zdGFja3tmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6ZmxleC1lbmQ7Z2FwOjhweDttaW4td2lkdGg6MDttYXgtd2lkdGg6bWluKDUyNXB4LDgyJSk7ZGlzcGxheTpmbGV4fVxuLmRzZHItZmFsbGJhY2stdXNlci1yb3d7ZmxleC1kaXJlY3Rpb246cm93O2FsaWduLWl0ZW1zOmZsZXgtZW5kO2dhcDo2cHg7bWF4LXdpZHRoOjEwMCU7ZGlzcGxheTpmbGV4fVxuLmRzZHItZmFsbGJhY2stdXNlci1idWJibGV7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtYnViYmxlKTttYXgtd2lkdGg6MTAwJTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Ym9yZGVyLXJhZGl1czoyMnB4O3BhZGRpbmc6MTBweCAxNnB4O2ZvbnQtc2l6ZToxNnB4O2xpbmUtaGVpZ2h0OjI0cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLWZhbGxiYWNrLXVzZXItY29weXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjI0cHg7aGVpZ2h0OjI0cHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDowIDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250OmluaGVyaXQ7Zm9udC1zaXplOjExcHg7dmlzaWJpbGl0eTpoaWRkZW47bWFyZ2luLWJvdHRvbToycHh9XG4uZHNkci1mYWxsYmFjay11c2VyOmhvdmVyIC5kc2RyLWZhbGxiYWNrLXVzZXItY29weSwuZHNkci1mYWxsYmFjay11c2VyLWNvcHk6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1mYWxsYmFjay11c2VyLWNvcHk6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbmBcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHN0eWxlW2RhdGEtcGx1Z2luLWNzcz0ke0pTT04uc3RyaW5naWZ5KFNUWUxFX1RBRyl9XWApID09PSBudWxsKSB7XG4gIGNvbnN0IHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgdGFnLmRhdGFzZXQucGx1Z2luID0gJ2RzaC1wbHVnaW4tZGlmZi1yZXZpZXcnXG4gIHRhZy5kYXRhc2V0LnBsdWdpbkNzcyA9IFNUWUxFX1RBR1xuICB0YWcudGV4dENvbnRlbnQgPSBSRVZJRVdfQ1NTXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGFnKVxufVxuXG4vKiogU2ltcGxpZmllZCBDaGluZXNlIGRpY3Rpb25hcnkgKGtleS1zZXQgc291cmNlIG9mIHRydXRoKS4gKi9cbmNvbnN0IHpoID0ge1xuICAnYWN0aW9uLmxhYmVsJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdhY3Rpb24uYXJpYSc6ICdcdTVCQTFcdTY3RTVcdTVGNTNcdTUyNERcdTk4NzlcdTc2RUVcdTRFMEVcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzknLFxuICAndGFiLnNlc3Npb24nOiAnXHU0RjFBXHU4QkREXHU2NkY0XHU2NTM5JyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnXHU1REU1XHU0RjVDXHU1MzNBJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdcdTUzRDhcdTUyQTgnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ1x1NkUzOFx1NzlCQiBIRUFEJyxcbiAgJ3Jldmlldy5ub3RSZXBvJzogJ1x1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1NEUwRFx1NjYyRiBnaXQgXHU0RUQzXHU1RTkzJyxcbiAgJ3Jldmlldy5ub3RSZXBvSGludCc6ICdcdTMwMENcdTRGMUFcdThCRERcdTY2RjRcdTY1MzlcdTMwMERcdTk4NzVcdTdCN0VcdTRFMERcdTUzRDdcdTVGNzFcdTU0Q0RcdUZGMENcdTRFQ0RcdTUzRUZcdTY3RTVcdTc3MEJcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzlcdTMwMDInLFxuICAncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnOiAnXHU4RkQ5XHU0RTJBXHU0RjFBXHU4QkREXHU4RkQ4XHU2Q0ExXHU2NzA5XHU2NTg3XHU0RUY2XHU0RkVFXHU2NTM5XHU4QkIwXHU1RjU1JyxcbiAgJ3Jldmlldy5zZXNzaW9uU2Nhbic6ICdcdTVERjJcdTYyNkJcdTYzQ0Yge3Jlc3VsdHN9IFx1NEUyQVx1NURFNVx1NTE3N1x1N0VEM1x1Njc5Q1x1RkYxQXtkaWZmfSBcdTRFMkFcdTY0M0FcdTVFMjYgZGlmZlx1MzAwMXtwYXRofSBcdTRFMkFcdTRFQzVcdTY3MDlcdThERUZcdTVGODRcdTIwMTRcdTIwMTRcdTdFQzhcdTdBRUZcdTU0N0RcdTRFRTRcdUZGMDhiYXNoXHVGRjA5XHU2NTM5XHU2NTg3XHU0RUY2XHU0RTBEXHU0RjFBXHU4QkExXHU1MTY1XHU0RjFBXHU4QkREXHU4QkIwXHU1RjU1XHUzMDAyJyxcbiAgJ3Jldmlldy5nb1dvcmtzcGFjZSc6ICdcdTY3RTVcdTc3MEJcdTVERTVcdTRGNUNcdTUzM0FcdTY1MzlcdTUyQTgnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSBcdThGNkUgXHUwMEI3IHtmaWxlc30gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdcdTdCMkMge3JvdW5kfSBcdThGNkUnLFxuICAncmV2aWV3LmVtcHR5JzogJ1x1NkNBMVx1NjcwOVx1NjcyQVx1NjNEMFx1NEVBNFx1NzY4NFx1NjZGNFx1NjUzOSBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdcdTUxNjhcdTkwRThcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnXHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1x1NTE2OFx1OTBFOFx1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlJzogJ1x1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAnaHVuay51bnN0YWdlJzogJ1x1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAnaHVuay51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnXHU2M0QwXHU0RUE0XHU4QkY0XHU2NjBFXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1x1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnXHU1REYyXHU2M0QwXHU0RUE0IHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ1x1NjNEMFx1NEVBNFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucHVzaGVkJzogJ1x1NURGMlx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdcdTYzQThcdTkwMDFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFoZWFkJzogJ1x1OTg4Nlx1NTE0OCB7bn0nLFxuICAncmV2aWV3LmJlaGluZCc6ICdcdTg0M0RcdTU0MEUge259JyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ1x1NTIwNlx1NjUyRlx1NEUwRVx1OEZEQ1x1N0EwQicsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdcdTY3MkFcdThCQkVcdTdGNkVcdTRFMEFcdTZFMzhcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnXHU1Mzg2XHU1M0YyJyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdcdTUzRDhcdTUyQThcdTY1ODdcdTRFRjYnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdcdTY3MkNcdTU3MzAnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAnXHU4RkRDXHU3QTBCJyxcbiAgJ3RpbWUubm93JzogJ1x1NTIxQVx1NTIxQScsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IFx1NTIwNlx1OTQ5Rlx1NTI0RCcsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBcdTVDMEZcdTY1RjZcdTUyNEQnLFxuICAndGltZS5kYXlzJzogJ3tufSBcdTU5MjlcdTUyNEQnLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnXHU1MjM3XHU2NUIwJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdcdTUxNzNcdTk1RUQnLFxuICAncmV2aWV3LmJ1c3knOiAnXHU1OTA0XHU3NDA2XHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ1x1NURGMnthY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjZcdUZGMDhcdTUyMjBcdTk2NjQge2RlbGV0ZWR9IFx1NEUyQVx1NjcyQVx1OERERlx1OEUyQVx1NjU4N1x1NEVGNlx1RkYwOScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICdcdTY3MkFcdThEREZcdThFMkEnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdcdTRFOENcdThGREJcdTUyMzYnLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnXHU4QkU1XHU0RkVFXHU2NTM5XHU2Q0ExXHU2NzA5IGRpZmYgXHU2NTcwXHU2MzZFJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnXHU1MzU1XHU2ODBGJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnXHU1M0NDXHU2ODBGJyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ1x1NTM5Rlx1NjU4N1x1NEVGNicsXG4gICd2aWV3LmFmdGVyJzogJ1x1NjVCMFx1NjU4N1x1NEVGNicsXG4gICdjb21tZW50LmFkZCc6ICdcdThCQzRcdThCQkFcdTZCNjRcdTg4NEMnLFxuICAnY29tbWVudC5zaG93JzogJ1x1NjdFNVx1NzcwQlx1OEJDNFx1OEJCQScsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ1x1OEJDNFx1OEJCQVx1MjAyNlx1RkYwOEN0cmwvXHUyMzE4K0VudGVyIFx1NEZERFx1NUI1OFx1RkYwOScsXG4gICdjb21tZW50LnNhdmUnOiAnXHU0RkREXHU1QjU4JyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ1x1NTNENlx1NkQ4OCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdcdTUyMjBcdTk2NjQnLFxuICAnY29tbWVudC5lZGl0JzogJ1x1N0YxNlx1OEY5MScsXG4gICdjb21tZW50LnNhdmVkJzogJ1x1NURGMlx1NEZERFx1NUI1OFx1OEJDNFx1OEJCQScsXG4gICdjb21tZW50LmZhaWxlZCc6ICdcdThCQzRcdThCQkFcdTRGRERcdTVCNThcdTU5MzFcdThEMjUnLFxuICAnc2NvcGUubGFiZWwnOiAnXHU4MzAzXHU1NkY0JyxcbiAgJ3Njb3BlLmFsbCc6ICdcdTUxNjhcdTkwRTgnLFxuICAnc2NvcGUudW5zdGFnZWQnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Njb3BlLnN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAnc2NvcGUuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdzY29wZS5icmFuY2gnOiAnXHU1MjA2XHU2NTJGJyxcbiAgJ3Njb3BlLmxhc3QtdHVybic6ICdcdTY3MDBcdTU0MEVcdTRFMDBcdThGNkUnLFxuICAncmV2aWV3Lmxhc3RUdXJuRW1wdHknOiAnXHU2NzAwXHU1NDBFXHU0RTAwXHU4RjZFXHU2Q0ExXHU2NzA5XHU4QkIwXHU1RjU1XHU1MjMwXHU2NTg3XHU0RUY2XHU0RkVFXHU2NTM5IFx1MjAxNFx1MjAxNCBcdTdFQzhcdTdBRUZcdTU0N0RcdTRFRTRcdUZGMDhiYXNoXHVGRjA5XHU2NTM5XHU2NTg3XHU0RUY2XHU0RTBEXHU0RjFBXHU4QkExXHU1MTY1XHU0RjFBXHU4QkREXHU4QkIwXHU1RjU1XHVGRjFCXHU1M0VGXHU1MjA3XHU1MjMwXHUzMDBDXHU1MTY4XHU5MEU4XHUzMDBEXHU2N0U1XHU3NzBCIGdpdCBcdTUzRDhcdTY2RjQnLFxuICAnc2NvcGUuYmFzZSc6ICdcdTU3RkFcdTdFQkZcdTUyMDZcdTY1MkYnLFxuICAnc2NvcGUuYnJhbmNoUmVhZG9ubHknOiAnXHU1MjA2XHU2NTJGXHU4MzAzXHU1NkY0XHU1M0VBXHU4QkZCXHVGRjA4XHU1QkY5XHU2QkQ0IG1lcmdlLWJhc2VcdUZGMENcdTRFMERcdTYzRDBcdTRGOUJcdTkxQzdcdTdFQjMvXHU0RTIyXHU1RjAzXHVGRjA5JyxcbiAgJ3Jldmlldy5zZWxlY3RDb21taXQnOiAnXHU0RUNFXHU1REU2XHU0RkE3XHU5MDA5XHU2MkU5XHU2M0QwXHU0RUE0XHU2N0U1XHU3NzBCIGRpZmYnLFxuICAncmV2aWV3LnNlbmRUb0FnZW50JzogJ1x1NTNEMVx1OTAwMVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VuZFRpdGxlJzogJ1x1NTNEMVx1OTAwMVx1ODg0Q1x1NTE4NVx1OEJDNFx1OEJCQVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VuZEhpbnQnOiAnXHU4QkM0XHU4QkJBXHU0RjFBXHU0RjVDXHU0RTNBXHU4QkM0XHU1QkExXHU2MzA3XHU1RjE1XHU2Q0U4XHU1MTY1XHU1RjUzXHU1MjREXHU0RjFBXHU4QkREXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjA5XHUzMDAyXHU1M0QxXHU5MDAxXHU1OTMxXHU4RDI1XHU2NUY2XHU5MDAwXHU1MzE2XHU0RTNBXHU1OTBEXHU1MjM2XHU2NTg3XHU2NzJDXHUzMDAyJyxcbiAgJ3Jldmlldy5zZW50VG9BZ2VudCc6ICdcdTVERjJcdTUzRDFcdTkwMDFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LmNvcHknOiAnXHU1OTBEXHU1MjM2XHU2NTg3XHU2NzJDJyxcbiAgJ3Jldmlldy5jb3BpZWQnOiAnXHU1REYyXHU1OTBEXHU1MjM2JyxcbiAgJ3Jldmlldy5jb3B5RmFpbGVkJzogJ1x1NTkwRFx1NTIzNlx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucmV2aWV3JzogJ1x1OEJDNFx1NUJBMScsXG4gICdyZXZpZXcucmV2aWV3aW5nJzogJ1x1OEJDNFx1NUJBMVx1NEUyRFx1MjAyNicsXG4gICdyZXZpZXcucmV2aWV3RmFpbGVkJzogJ1x1OEJDNFx1NUJBMVx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcudmVyZGljdENvcnJlY3QnOiAnXHU4ODY1XHU0RTAxXHU2QjYzXHU3ODZFIFx1MjcxMycsXG4gICdyZXZpZXcudmVyZGljdEluY29ycmVjdCc6ICdcdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OTggXHUyNzE3JyxcbiAgJ3Jldmlldy5ub0ZpbmRpbmdzJzogJ1x1NkNBMVx1NjcwOVx1NTNEMVx1NzNCMFx1OTVFRVx1OTg5OCcsXG4gICdyZXZpZXcuZmluZGluZ3MnOiAne259IFx1Njc2MVx1NTNEMVx1NzNCMCcsXG4gICdyZXZpZXcuY29uZmlkZW5jZSc6ICdcdTdGNkVcdTRGRTFcdTVFQTYge2NvbmZpZGVuY2V9JyxcbiAgJ3Jldmlldy5zdWdnZXN0aW9uJzogJ1x1NUVGQVx1OEJBRScsXG4gICdyZXZpZXcuc2VuZEZpbmRpbmdzJzogJ1x1NTNEMVx1OTAwMVx1NTNEMVx1NzNCMFx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VudEZpbmRpbmdzJzogJ1x1NURGMlx1NTNEMVx1OTAwMVx1NTNEMVx1NzNCMFx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcucmV2aWV3U2NvcGUnOiAnXHU4QkM0XHU1QkExXHU4MzAzXHU1NkY0JyxcbiAgJ3ByLnRpdGxlJzogJ1BSICN7bnVtYmVyfScsXG4gICdwci5jb21tZW50cyc6ICdQUiBcdThCQzRcdThCQkEgKHtufSknLFxuICAncHIubm9Qcic6ICdcdTY1RTBcdTUxNzNcdTgwNTQgUFInLFxuICAncHIuc2VuZENvbW1lbnRzJzogJ1x1NTNEMVx1OTAwMSBQUiBcdThCQzRcdThCQkFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAnZWRpdG9yLm9wZW5GaWxlJzogJ1x1NTcyOFx1N0YxNlx1OEY5MVx1NTY2OFx1NEUyRFx1NjI1M1x1NUYwMCcsXG4gICdlZGl0b3Iub3BlbkxpbmUnOiAnXHU1NzI4XHU3RjE2XHU4RjkxXHU1NjY4XHU0RTJEXHU2MjUzXHU1RjAwXHU4QkU1XHU4ODRDJyxcbiAgJ2VkaXRvci5mYWlsZWQnOiAnXHU2MjUzXHU1RjAwXHU1OTMxXHU4RDI1JyxcbiAgJ3JlcG8ubGFiZWwnOiAnXHU0RUQzXHU1RTkzJyxcbiAgJ3Jldmlldy5kb2NrQ29tbWVudHMnOiAnXHU4ODRDXHU1MTg1XHU4QkM0XHU4QkJBIHtufSBcdTY3NjEnLFxuICAncmV2aWV3LmRvY2tWZXJkaWN0JzogJ1x1OEJDNFx1NUJBMVx1N0VEM1x1OEJCQVx1NUY4NVx1NTNEMVx1OTAwMScsXG4gICdyZXZpZXcuZG9ja1NlbmQnOiAnXHU3MEI5XHU1MUZCXHU1M0QxXHU5MDAxXHU4QkM0XHU4QkJBJyxcbiAgJ3Jldmlldy5kb2NrTW9yZSc6ICdcdThGRDhcdTY3MDkge259IFx1Njc2MVx1OEJDNFx1OEJCQVx1RkYwQ1x1NzBCOVx1NTFGQlx1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NjdFNVx1NzcwQicsXG4gICdyZXZpZXcuY29waWVkRmFsbGJhY2snOiAnXHU0RjFBXHU4QkREXHU0RTBEXHU1M0VGXHU3NTI4XHVGRjBDXHU4QkM0XHU4QkJBXHU1REYyXHU1OTBEXHU1MjM2XHVGRjA4XHU4QkY3XHU3Qzk4XHU4RDM0XHU1M0QxXHU5MDAxXHVGRjA5JyxcbiAgJ3Jldmlldy5zZW5kRmFpbGVkJzogJ1x1OEJDNFx1OEJCQVx1NTNEMVx1OTAwMVx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcuZG9ja0p1bXAnOiAnXHU3MEI5XHU1MUZCXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU2MjUzXHU1RjAwXHU1QkY5XHU1RTk0XHU1M0Q4XHU2NkY0JyxcbiAgJ3Jldmlldy5jYXJkVGl0bGUnOiAnXHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExJyxcbiAgJ3Jldmlldy5jYXJkQ29tbWVudHMnOiAne259IFx1Njc2MVx1OEJDNFx1OEJCQScsXG4gICdyZXZpZXcuY2FyZFZlcmRpY3QnOiAnQUkgXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBJyxcbiAgJ3Jldmlldy5jYXJkSnVtcCc6ICdcdTcwQjlcdTUxRkJcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTVCOUFcdTRGNERcdTUyMzBcdTVCRjlcdTVFOTRcdTRFRTNcdTc4MDEnLFxuICAncmV2aWV3LmNhcmRPcGVuRmlsZSc6ICdcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTYyNTNcdTVGMDBcdThCRTVcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LmNhcmRIaW50JzogJ1x1NzBCOVx1NTFGQlx1OEJDNFx1OEJCQVx1NTNFRlx1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NUI5QVx1NEY0RFx1NTIzMFx1NUJGOVx1NUU5NFx1NEVFM1x1NzgwMScsXG4gICdmYWxsYmFjay5pbWFnZSc6ICdcdTU2RkVcdTcyNDcnLFxuICAnZmFsbGJhY2sub3Blbic6ICdcdTY3RTVcdTc3MEJcdTUzOUZcdTU2RkUnLFxuICAnZmFsbGJhY2sub3Blbk5hbWVkJzogJ1x1NjdFNVx1NzcwQlx1NTM5Rlx1NTZGRSB7bmFtZX0nLFxuICAnZmFsbGJhY2subG9hZGluZyc6ICdcdTUyQTBcdThGN0RcdTRFMkRcdTIwMjYnLFxuICAnZmFsbGJhY2subG9hZEZhaWxlZCc6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAnZmFsbGJhY2subGlnaHRib3hEaWFsb2cnOiAnXHU1NkZFXHU3MjQ3XHU5ODg0XHU4OUM4JyxcbiAgJ2ZhbGxiYWNrLmxpZ2h0Ym94Q2xvc2UnOiAnXHU1MTczXHU5NUVEJyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdzZXR0aW5ncy5mb250JzogJ1x1NUI1N1x1NEY1MycsXG4gICdzZXR0aW5ncy5zaXplJzogJ1x1NUI1N1x1NTNGNycsXG4gICdjb25maWcudGl0bGUnOiAnXHU5MTREXHU3RjZFJyxcbiAgJ2ZvbnQubW9ubyc6ICdcdTdCNDlcdTVCQkRcdUZGMDhcdTlFRDhcdThCQTRcdUZGMDknLFxuICAnZm9udC5zeXN0ZW0nOiAnXHU3Q0ZCXHU3RURGXHU1QjU3XHU0RjUzJyxcbn0gYXMgY29uc3RcblxuLyoqIEVuZ2xpc2ggZGljdGlvbmFyeSwgY2hlY2tlZCBjb21wbGV0ZSBhZ2FpbnN0IHRoZSB6aCBrZXkgc2V0LiAqL1xuY29uc3QgZW46IFJlY29yZDxrZXlvZiB0eXBlb2YgemgsIHN0cmluZz4gPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnQ2hhbmdlcycsXG4gICdhY3Rpb24uYXJpYSc6ICdSZXZpZXcgd29ya3NwYWNlIGFuZCBwZXItcm91bmQgY2hhbmdlcycsXG4gICd0YWIuc2Vzc2lvbic6ICdTZXNzaW9uJyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnV29ya3NwYWNlJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3Jldmlldy5icmFuY2gnOiAnYnJhbmNoJyxcbiAgJ3Jldmlldy5kZXRhY2hlZCc6ICdkZXRhY2hlZCBIRUFEJyxcbiAgJ3Jldmlldy5ub3RSZXBvJzogJ1RoaXMgZGlyZWN0b3J5IGlzIG5vdCBhIGdpdCByZXBvc2l0b3J5JyxcbiAgJ3Jldmlldy5ub3RSZXBvSGludCc6ICdUaGUgXCJTZXNzaW9uXCIgdGFiIHN0aWxsIHNob3dzIGV2ZXJ5IHJvdW5kXFwncyBjaGFuZ2VzLicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdObyBmaWxlIGNoYW5nZXMgcmVjb3JkZWQgaW4gdGhpcyBzZXNzaW9uIHlldCcsXG4gICdyZXZpZXcuc2Vzc2lvblNjYW4nOiAnU2Nhbm5lZCB7cmVzdWx0c30gdG9vbCByZXN1bHRzOiB7ZGlmZn0gd2l0aCBkaWZmcywge3BhdGh9IHBhdGgtb25seSBcdTIwMTQgdGVybWluYWwgKGJhc2gpIGVkaXRzIGFyZSBub3QgdHJhY2tlZCBpbiB0aGUgc2Vzc2lvbiBsb2cuJyxcbiAgJ3Jldmlldy5nb1dvcmtzcGFjZSc6ICdWaWV3IHdvcmtzcGFjZSBjaGFuZ2VzJyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gcm91bmRzIFx1MDBCNyB7ZmlsZXN9IGZpbGVzJyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdSb3VuZCB7cm91bmR9JyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdObyB1bmNvbW1pdHRlZCBjaGFuZ2VzIFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ0ZhaWxlZCB0byBsb2FkJyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnQWNjZXB0JyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnQWNjZXB0IGFsbCcsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1JldmVydCBhbGwnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnVW5zdGFnZScsXG4gICdyZXZpZXcudW5zdGFnZUFsbCc6ICdVbnN0YWdlIGFsbCcsXG4gICdodW5rLnN0YWdlJzogJ1N0YWdlJyxcbiAgJ2h1bmsucmV2ZXJ0JzogJ1JldmVydCcsXG4gICdodW5rLnVuc3RhZ2UnOiAnVW5zdGFnZScsXG4gICdodW5rLnN0YWdlZCc6ICdzdGFnZWQnLFxuICAnaHVuay51bnN0YWdlZCc6ICd1bnN0YWdlZCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHJldmVydCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydEFsbCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHJldmVydCBhbGwnLFxuICAncmV2aWV3LmNvbW1pdCc6ICdDb21taXQnLFxuICAncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJzogJ0NvbW1pdCBtZXNzYWdlXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1B1c2gnLFxuICAncmV2aWV3LmNvbmZpcm1QdXNoJzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcHVzaCcsXG4gICdyZXZpZXcuY29tbWl0dGVkJzogJ0NvbW1pdHRlZCB7c3VtbWFyeX0nLFxuICAncmV2aWV3LmNvbW1pdEZhaWxlZCc6ICdDb21taXQgZmFpbGVkJyxcbiAgJ3Jldmlldy5wdXNoZWQnOiAnUHVzaGVkJyxcbiAgJ3Jldmlldy5wdXNoRmFpbGVkJzogJ1B1c2ggZmFpbGVkJyxcbiAgJ3Jldmlldy5haGVhZCc6ICd7bn0gYWhlYWQnLFxuICAncmV2aWV3LmJlaGluZCc6ICd7bn0gYmVoaW5kJyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1N0YWdlZCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnQ2hhbmdlcycsXG4gICdyZXZpZXcuc2VjdGlvbkJyYW5jaCc6ICdCcmFuY2ggdnMgcmVtb3RlJyxcbiAgJ3Jldmlldy5ub1Vwc3RyZWFtJzogJ25vIHVwc3RyZWFtJyxcbiAgJ3Jldmlldy5oaXN0b3J5JzogJ0hpc3RvcnknLFxuICAncmV2aWV3LmNvbW1pdEZpbGVzJzogJ0ZpbGVzJyxcbiAgJ2hpc3RvcnkubG9jYWwnOiAnbG9jYWwnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAncmVtb3RlJyxcbiAgJ3RpbWUubm93JzogJ2p1c3Qgbm93JyxcbiAgJ3RpbWUubWludXRlcyc6ICd7bn0gbWluIGFnbycsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBoIGFnbycsXG4gICd0aW1lLmRheXMnOiAne259IGQgYWdvJyxcbiAgJ3Jldmlldy5yZWZyZXNoJzogJ1JlZnJlc2gnLFxuICAncmV2aWV3LmNsb3NlJzogJ0Nsb3NlJyxcbiAgJ3Jldmlldy5idXN5JzogJ1dvcmtpbmdcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcycsXG4gICdyZXZpZXcuZG9uZU9uZSc6ICd7YWN0aW9ufSB7cGF0aH0nLFxuICAncmV2aWV3LmRvbmVEZWxldGVkJzogJ3thY3Rpb259IHtjb3VudH0gZmlsZXMgKHtkZWxldGVkfSB1bnRyYWNrZWQgZGVsZXRlZCknLFxuICAncmV2aWV3LmFjY2VwdGVkJzogJ0FjY2VwdGVkJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdSZXZlcnRlZCcsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ3VudHJhY2tlZCcsXG4gICdyZXZpZXcuYmluYXJ5JzogJ2JpbmFyeScsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdObyBkaWZmIGRhdGEgZm9yIHRoaXMgY2hhbmdlJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnU2luZ2xlJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnU3BsaXQnLFxuICAndmlldy5iZWZvcmUnOiAnQmVmb3JlJyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnQWZ0ZXInLFxuICAnY29tbWVudC5hZGQnOiAnQ29tbWVudCBvbiB0aGlzIGxpbmUnLFxuICAnY29tbWVudC5zaG93JzogJ1ZpZXcgY29tbWVudHMnLFxuICAnY29tbWVudC5wbGFjZWhvbGRlcic6ICdDb21tZW50XHUyMDI2IChDdHJsL1x1MjMxOCtFbnRlciB0byBzYXZlKScsXG4gICdjb21tZW50LnNhdmUnOiAnU2F2ZScsXG4gICdjb21tZW50LmNhbmNlbCc6ICdDYW5jZWwnLFxuICAnY29tbWVudC5kZWxldGUnOiAnRGVsZXRlJyxcbiAgJ2NvbW1lbnQuZWRpdCc6ICdFZGl0JyxcbiAgJ2NvbW1lbnQuc2F2ZWQnOiAnQ29tbWVudCBzYXZlZCcsXG4gICdjb21tZW50LmZhaWxlZCc6ICdGYWlsZWQgdG8gc2F2ZSBjb21tZW50JyxcbiAgJ3Njb3BlLmxhYmVsJzogJ1Njb3BlJyxcbiAgJ3Njb3BlLmFsbCc6ICdBbGwnLFxuICAnc2NvcGUudW5zdGFnZWQnOiAnVW5zdGFnZWQnLFxuICAnc2NvcGUuc3RhZ2VkJzogJ1N0YWdlZCcsXG4gICdzY29wZS5jb21taXQnOiAnQ29tbWl0JyxcbiAgJ3Njb3BlLmJyYW5jaCc6ICdCcmFuY2gnLFxuICAnc2NvcGUubGFzdC10dXJuJzogJ0xhc3QgdHVybicsXG4gICdyZXZpZXcubGFzdFR1cm5FbXB0eSc6ICdObyBmaWxlIGNoYW5nZXMgcmVjb3JkZWQgZm9yIHRoZSBsYXN0IHR1cm4gXHUyMDE0IHRlcm1pbmFsIGNvbW1hbmRzIChiYXNoKSB0aGF0IGVkaXQgZmlsZXMgYXJlIG5vdCB0cmFja2VkIGluIHRoZSBzZXNzaW9uIGxvZzsgc3dpdGNoIHRvIFwiQWxsXCIgdG8gc2VlIGdpdCBjaGFuZ2VzJyxcbiAgJ3Njb3BlLmJhc2UnOiAnQmFzZSBicmFuY2gnLFxuICAnc2NvcGUuYnJhbmNoUmVhZG9ubHknOiAnQnJhbmNoIHNjb3BlIGlzIHJlYWQtb25seSAobWVyZ2UtYmFzZSBkaWZmOyBubyBhY2NlcHQvcmV2ZXJ0KScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1NlbGVjdCBhIGNvbW1pdCBmcm9tIHRoZSBsZWZ0IHRvIHZpZXcgaXRzIGRpZmYnLFxuICAncmV2aWV3LnNlbmRUb0FnZW50JzogJ1NlbmQgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdTZW5kIGlubGluZSBjb21tZW50cyB0byB0aGUgYWdlbnQnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ0NvbW1lbnRzIGFyZSBpbmplY3RlZCBpbnRvIHRoZSBjdXJyZW50IHNlc3Npb24gYXMgcmV2aWV3IGd1aWRhbmNlIChBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHMpLiBGYWxscyBiYWNrIHRvIGNvcHlhYmxlIHRleHQgaWYgc2VuZGluZyBmYWlscy4nLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1NlbnQgdG8gYWdlbnQnLFxuICAncmV2aWV3LmNvcHknOiAnQ29weSB0ZXh0JyxcbiAgJ3Jldmlldy5jb3BpZWQnOiAnQ29waWVkJyxcbiAgJ3Jldmlldy5jb3B5RmFpbGVkJzogJ0NvcHkgZmFpbGVkJyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnUmV2aWV3JyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnUmV2aWV3aW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnUmV2aWV3IGZhaWxlZCcsXG4gICdyZXZpZXcudmVyZGljdENvcnJlY3QnOiAnUGF0Y2ggaXMgY29ycmVjdCBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnUGF0Y2ggbmVlZHMgd29yayBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnTm8gaXNzdWVzIGZvdW5kJyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gZmluZGluZ3MnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnY29uZmlkZW5jZSB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnU3VnZ2VzdGlvbicsXG4gICdyZXZpZXcuc2VuZEZpbmRpbmdzJzogJ1NlbmQgZmluZGluZ3MgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdGaW5kaW5ncyBzZW50IHRvIGFnZW50JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdSZXZpZXcgc2NvcGUnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIGNvbW1lbnRzICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnTm8gYXNzb2NpYXRlZCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnU2VuZCBQUiBjb21tZW50cyB0byBhZ2VudCcsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnT3BlbiBpbiBlZGl0b3InLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ09wZW4gdGhpcyBsaW5lIGluIGVkaXRvcicsXG4gICdlZGl0b3IuZmFpbGVkJzogJ0ZhaWxlZCB0byBvcGVuJyxcbiAgJ3JlcG8ubGFiZWwnOiAnUmVwbycsXG4gICdyZXZpZXcuZG9ja0NvbW1lbnRzJzogJ3tufSBpbmxpbmUgY29tbWVudHMnLFxuICAncmV2aWV3LmRvY2tWZXJkaWN0JzogJ3ZlcmRpY3QgcGVuZGluZycsXG4gICdyZXZpZXcuZG9ja1NlbmQnOiAnQ2xpY2sgdG8gc2VuZCcsXG4gICdyZXZpZXcuY29waWVkRmFsbGJhY2snOiAnU2Vzc2lvbiB1bmF2YWlsYWJsZSBcdTIwMTQgY29tbWVudHMgY29waWVkIChwYXN0ZSB0byBzZW5kKScsXG4gICdyZXZpZXcuc2VuZEZhaWxlZCc6ICdGYWlsZWQgdG8gc2VuZCBjb21tZW50cycsXG4gICdyZXZpZXcuZG9ja0p1bXAnOiAnT3BlbiB0aGUgbWF0Y2hpbmcgY2hhbmdlIGluIHRoZSByZXZpZXcgcGFuZWwnLFxuICAncmV2aWV3LmRvY2tNb3JlJzogJ3tufSBtb3JlIGNvbW1lbnRzIFx1MjAxNCBvcGVuIHRoZSByZXZpZXcgcGFuZWwnLFxuICAncmV2aWV3LmNhcmRUaXRsZSc6ICdJbmxpbmUgcmV2aWV3JyxcbiAgJ3Jldmlldy5jYXJkQ29tbWVudHMnOiAne259IGNvbW1lbnRzJyxcbiAgJ3Jldmlldy5jYXJkVmVyZGljdCc6ICdBSSByZXZpZXcgdmVyZGljdCcsXG4gICdyZXZpZXcuY2FyZEp1bXAnOiAnSnVtcCB0byB0aGUgbWF0Y2hpbmcgY29kZSBpbiB0aGUgcmV2aWV3IHBhbmVsJyxcbiAgJ3Jldmlldy5jYXJkT3BlbkZpbGUnOiAnT3BlbiB0aGlzIGZpbGUgaW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuY2FyZEhpbnQnOiAnQ2xpY2sgYSBjb21tZW50IHRvIGp1bXAgdG8gdGhlIG1hdGNoaW5nIGNoYW5nZSBibG9jaycsXG4gICdmYWxsYmFjay5pbWFnZSc6ICdJbWFnZScsXG4gICdmYWxsYmFjay5vcGVuJzogJ1ZpZXcgb3JpZ2luYWwnLFxuICAnZmFsbGJhY2sub3Blbk5hbWVkJzogJ1ZpZXcgb3JpZ2luYWwge25hbWV9JyxcbiAgJ2ZhbGxiYWNrLmxvYWRpbmcnOiAnTG9hZGluZ1x1MjAyNicsXG4gICdmYWxsYmFjay5sb2FkRmFpbGVkJzogJ0ZhaWxlZCB0byBsb2FkJyxcbiAgJ2ZhbGxiYWNrLmxpZ2h0Ym94RGlhbG9nJzogJ0ltYWdlIHByZXZpZXcnLFxuICAnZmFsbGJhY2subGlnaHRib3hDbG9zZSc6ICdDbG9zZScsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnRm9udCcsXG4gICdzZXR0aW5ncy5zaXplJzogJ0ZvbnQgc2l6ZScsXG4gICdjb25maWcudGl0bGUnOiAnQ29uZmlndXJhdGlvbicsXG4gICdmb250Lm1vbm8nOiAnTW9ub3NwYWNlIChkZWZhdWx0KScsXG4gICdmb250LnN5c3RlbSc6ICdTeXN0ZW0gZm9udCcsXG59XG5cbnR5cGUgRGlmZlJldmlld0FjdGlvblByb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucyc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5cbnR5cGUgRGlmZlJldmlld092ZXJsYXlQcm9wcyA9IFByb3BzUnVudGltZTwnc2hlbGwub3ZlcmxheSc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7IHNlc3Npb25zOiBJU2Vzc2lvbnMgfVxuXG4vKiogRGlmZiBpY29uIChsdWNpZGUgZmlsZS1kaWZmKS4gKi9cbmZ1bmN0aW9uIEljb25EaWZmKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWN1pcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDEwaDZcIiAvPlxuICAgICAgPHBhdGggZD1cIk0xMiA3djZcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDE3aDZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25YKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xOCA2IDYgMThcIiAvPlxuICAgICAgPHBhdGggZD1cIm02IDYgMTIgMTJcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25Db21tZW50KCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMSAxNWEyIDIgMCAwIDEtMiAySDdsLTQgNFY1YTIgMiAwIDAgMSAyLTJoMTRhMiAyIDAgMCAxIDIgMnpcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGV2cm9uRG93bigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJtNiA5IDYgNiA2LTZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGVjaygpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMi41XCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMCA2IDkgMTdsLTUtNVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxudHlwZSBWaWV3TW9kZSA9ICdzaW5nbGUnIHwgJ3NwbGl0J1xuXG4vKiogXHU1MzU1XHU2ODBGIC8gXHU1M0NDXHU2ODBGIHNlZ21lbnRlZCB0b2dnbGUgKHBlcnNpc3RlZCBhY3Jvc3Mgb3BlbnMpLiAqL1xuZnVuY3Rpb24gRGlmZlZpZXdUb2dnbGUoeyB2aWV3LCBvbkNoYW5nZSwgdCB9OiB7IHZpZXc6IFZpZXdNb2RlOyBvbkNoYW5nZTogKHY6IFZpZXdNb2RlKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci12aWV3LXRvZ2dsZVwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9e3QoJ3ZpZXcuc2luZ2xlJyl9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NpbmdsZScgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NpbmdsZSd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKCdzaW5nbGUnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc2luZ2xlJyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRzZHItdmlldy1idG4ke3ZpZXcgPT09ICdzcGxpdCcgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NwbGl0J31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NwbGl0Jyl9XG4gICAgICA+XG4gICAgICAgIHt0KCd2aWV3LnNwbGl0Jyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVHdvLWNvbHVtbiBzaWRlLWJ5LXNpZGUgZGlmZiBib2R5IChvbGQgbGVmdCwgbmV3IHJpZ2h0LCBsaW5lIG51bWJlcnMgYWxpZ25lZCkuICovXG5mdW5jdGlvbiBTcGxpdERpZmYoeyBibG9ja3MsIGJlZm9yZUxhYmVsLCBhZnRlckxhYmVsIH06IHsgYmxvY2tzOiBTcGxpdEJsb2NrW107IGJlZm9yZUxhYmVsOiBzdHJpbmc7IGFmdGVyTGFiZWw6IHN0cmluZyB9KSB7XG4gIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPntiZWZvcmVMYWJlbH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPnthZnRlckxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICA8ZGl2IGtleT17Yml9PlxuICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IChcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e3JpfSBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5sZWZ0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogUGVyLWh1bmsgYWN0aW9uIGJhciAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KSBmb3Igd29ya3NwYWNlIGRpZmZzLiAqL1xuZnVuY3Rpb24gSHVua1Rvb2xiYXIoe1xuICBodW5rLFxuICBidXN5LFxuICBvbkFjdGlvbixcbiAgdCxcbn06IHtcbiAgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuayB8IHVuZGVmaW5lZFxuICBidXN5OiBib29sZWFuXG4gIG9uQWN0aW9uOiAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICBpZiAoIWh1bmspIHJldHVybiBudWxsXG4gIGNvbnN0IHN0YWdlZCA9IGh1bmsubGF5ZXIgPT09ICdzdGFnZWQnXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWh1bmstYmFyXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWh1bmstbGF5ZXJcIj57c3RhZ2VkID8gdCgnaHVuay5zdGFnZWQnKSA6IHQoJ2h1bmsudW5zdGFnZWQnKX08L3NwYW4+XG4gICAgICB7c3RhZ2VkID8gKFxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigndW5zdGFnZScsIGh1bmspfT5cbiAgICAgICAgICB7dCgnaHVuay51bnN0YWdlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IChcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbignYWNjZXB0JywgaHVuayl9PlxuICAgICAgICAgIHt0KCdodW5rLnN0YWdlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKX1cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigncmV2ZXJ0JywgaHVuayl9PlxuICAgICAgICB7dCgnaHVuay5yZXZlcnQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBIdW5rcyBvZiBgZGlmZmAgd2hvc2Ugb2xkIG9yIG5ldyBsaW5lIHJhbmdlIGNvdmVycyBhbnkgb2YgYGxpbmVzYC4gKi9cbmZ1bmN0aW9uIGh1bmtzRm9yTGluZXMoZGlmZjogc3RyaW5nLCBsaW5lczogKG51bWJlciB8IG51bGwpW10pOiBzdHJpbmcge1xuICBjb25zdCB0YXJnZXRzID0gbmV3IFNldChsaW5lcy5maWx0ZXIoKGwpOiBsIGlzIG51bWJlciA9PiBsICE9PSBudWxsKSlcbiAgaWYgKHRhcmdldHMuc2l6ZSA9PT0gMCkgcmV0dXJuICcnXG4gIGNvbnN0IGJsb2NrcyA9IHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2YgYmxvY2tzKSB7XG4gICAgaWYgKGJsb2NrLmhlYWQ/LmtpbmQgIT09ICdodW5rJykgY29udGludWVcbiAgICBjb25zdCBzdGFydHMgPSBodW5rU3RhcnRzKGJsb2NrLmhlYWQudGV4dClcbiAgICBsZXQgb2xkTGluZSA9IHN0YXJ0cy5vbGRTdGFydFxuICAgIGxldCBuZXdMaW5lID0gc3RhcnRzLm5ld1N0YXJ0XG4gICAgbGV0IG9NaW4gPSBJbmZpbml0eVxuICAgIGxldCBvTWF4ID0gLUluZmluaXR5XG4gICAgbGV0IG5NaW4gPSBJbmZpbml0eVxuICAgIGxldCBuTWF4ID0gLUluZmluaXR5XG4gICAgZm9yIChjb25zdCByb3cgb2YgYmxvY2sucm93cykge1xuICAgICAgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgICBpZiAob2xkTGluZSA8IG9NaW4pIG9NaW4gPSBvbGRMaW5lXG4gICAgICAgIGlmIChvbGRMaW5lID4gb01heCkgb01heCA9IG9sZExpbmVcbiAgICAgICAgaWYgKG5ld0xpbmUgPCBuTWluKSBuTWluID0gbmV3TGluZVxuICAgICAgICBpZiAobmV3TGluZSA+IG5NYXgpIG5NYXggPSBuZXdMaW5lXG4gICAgICAgIG9sZExpbmUrK1xuICAgICAgICBuZXdMaW5lKytcbiAgICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdhZGQnKSB7XG4gICAgICAgIGlmIChuZXdMaW5lIDwgbk1pbikgbk1pbiA9IG5ld0xpbmVcbiAgICAgICAgaWYgKG5ld0xpbmUgPiBuTWF4KSBuTWF4ID0gbmV3TGluZVxuICAgICAgICBuZXdMaW5lKytcbiAgICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdkZWwnKSB7XG4gICAgICAgIGlmIChvbGRMaW5lIDwgb01pbikgb01pbiA9IG9sZExpbmVcbiAgICAgICAgaWYgKG9sZExpbmUgPiBvTWF4KSBvTWF4ID0gb2xkTGluZVxuICAgICAgICBvbGRMaW5lKytcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGl0ID0gWy4uLnRhcmdldHNdLnNvbWUoXG4gICAgICAobCkgPT4gKG9NaW4gPD0gbCAmJiBsIDw9IG9NYXgpIHx8IChuTWluIDw9IGwgJiYgbCA8PSBuTWF4KSxcbiAgICApXG4gICAgaWYgKGhpdCkgcGFydHMucHVzaChbYmxvY2suaGVhZC50ZXh0LCAuLi5ibG9jay5yb3dzLm1hcCgocikgPT4gci50ZXh0KV0uam9pbignXFxuJykpXG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJ1xcbicpXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgcm93cyB3aXRoIG9sZC9uZXcgbGluZSBudW1iZXJzIHRyYWNrZWQgdGhyb3VnaCBodW5rcy4gKi9cbmZ1bmN0aW9uIHVuaWZpZWRSb3dzV2l0aExpbmVzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSB7XG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICByZXR1cm4gcm93cy5tYXAoKHJvdykgPT4ge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBuZXdMaW5lKysgfVxuICAgIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbmV3TGluZSsrIH1cbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbnVsbCB9XG4gICAgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBudWxsIH1cbiAgfSlcbn1cblxuLyoqIE1hdGNoIGEgY29tbWVudCBhZ2FpbnN0IGEgcm93J3MgYW5jaG9ycyAoYm90aCBtdXN0IGFncmVlIHdoZW4gc2V0KS4gKi9cbmZ1bmN0aW9uIGNvbW1lbnRNYXRjaGVzKGNvbW1lbnQ6IFJldmlld0NvbW1lbnQsIG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBib29sZWFuIHtcbiAgaWYgKGNvbW1lbnQubGluZU5ldyAhPT0gbnVsbCAmJiBjb21tZW50LmxpbmVOZXcgIT09IG5ld0xpbmUpIHJldHVybiBmYWxzZVxuICBpZiAoY29tbWVudC5saW5lT2xkICE9PSBudWxsICYmIGNvbW1lbnQubGluZU9sZCAhPT0gb2xkTGluZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB0cnVlXG59XG5cbi8qKiBIb3Zlci10by1jb21tZW50IGFmZm9yZGFuY2UgaW4gdGhlIGxpbmUtbnVtYmVyIGd1dHRlci4gTGluZXMgdGhhdCBhbHJlYWR5XG4gKiBoYXZlIGNvbW1lbnRzIHNob3cgYSBub24taW50ZXJhY3RpdmUgY291bnQgYmFkZ2UgKHRoZSBzYXZlZCBib3hlcyBiZWxvdyB0aGVcbiAqIGxpbmUgYXJlIHRoZSB2aWV3KTsgdGhlICsgb25seSBhcHBlYXJzIG9uIGNvbW1lbnQtZnJlZSBsaW5lcyB0byBhZGQgb25lLiAqL1xuZnVuY3Rpb24gQ29tbWVudExpbmUoeyBjb3VudCwgb25PcGVuLCB0IH06IHsgY291bnQ6IG51bWJlcjsgb25PcGVuOiAoKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBpZiAoY291bnQgPiAwKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hZGQgZHNkci1jb21tZW50LWhhc1wiIHRpdGxlPXt0KCdjb21tZW50LnNob3cnKX0gYXJpYS1sYWJlbD17dCgnY29tbWVudC5zaG93Jyl9PlxuICAgICAgICB7Y291bnR9XG4gICAgICA8L3NwYW4+XG4gICAgKVxuICB9XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFkZFwiIHRpdGxlPXt0KCdjb21tZW50LmFkZCcpfSBhcmlhLWxhYmVsPXt0KCdjb21tZW50LmFkZCcpfSBvbkNsaWNrPXtvbk9wZW59PlxuICAgICAgK1xuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8qKiBUaGUgaW5saW5lIGNvbW1lbnQgZWRpdG9yLCByZW5kZXJlZCBhcyBpdHMgb3duIHJvdy4gKi9cbmZ1bmN0aW9uIENvbW1lbnRFZGl0b3Ioe1xuICB0ZXh0LFxuICBvblRleHQsXG4gIG9uU2F2ZSxcbiAgb25DYW5jZWwsXG4gIGJ1c3ksXG4gIHQsXG59OiB7XG4gIHRleHQ6IHN0cmluZ1xuICBvblRleHQ6ICh2OiBzdHJpbmcpID0+IHZvaWRcbiAgb25TYXZlOiAoKSA9PiB2b2lkXG4gIG9uQ2FuY2VsOiAoKSA9PiB2b2lkXG4gIGJ1c3k6IGJvb2xlYW5cbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtZWRpdG9yXCI+XG4gICAgICA8dGV4dGFyZWFcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWlucHV0XCJcbiAgICAgICAgdmFsdWU9e3RleHR9XG4gICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICByb3dzPXsyfVxuICAgICAgICBwbGFjZWhvbGRlcj17dCgnY29tbWVudC5wbGFjZWhvbGRlcicpfVxuICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblRleHQoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgb25DYW5jZWwoKVxuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicgJiYgKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSkpIG9uU2F2ZSgpXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIXRleHQudHJpbSgpfSBvbkNsaWNrPXtvblNhdmV9PlxuICAgICAgICAgIHt0KCdjb21tZW50LnNhdmUnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9e29uQ2FuY2VsfT5cbiAgICAgICAgICB7dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQSBzYXZlZCBpbmxpbmUgY29tbWVudCwgcmVuZGVyZWQgZXhhY3RseSBsaWtlIHRoZSBjb21tZW50IGVkaXRvciBcdTIwMTQgdGhlIGJveFxuICogaXMgcmVhZC1vbmx5IHVudGlsIEVkaXQgaXMgcHJlc3NlZCwgdGhlbiBpdCBiZWNvbWVzIHRoZSBlZGl0YWJsZSBlZGl0b3IuICovXG5mdW5jdGlvbiBDb21tZW50Qm94KHsgY29tbWVudCwgYnVzeSwgb25VcGRhdGUsIG9uRGVsZXRlLCB0IH06IHsgY29tbWVudDogUmV2aWV3Q29tbWVudDsgYnVzeTogYm9vbGVhbjsgb25VcGRhdGU6IChpZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpID0+IFByb21pc2U8Ym9vbGVhbj47IG9uRGVsZXRlOiAoaWQ6IHN0cmluZykgPT4gdm9pZDsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFt0ZXh0LCBzZXRUZXh0XSA9IHVzZVN0YXRlKGNvbW1lbnQudGV4dClcbiAgaWYgKGVkaXRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPENvbW1lbnRFZGl0b3JcbiAgICAgICAgdGV4dD17dGV4dH1cbiAgICAgICAgb25UZXh0PXtzZXRUZXh0fVxuICAgICAgICBvblNhdmU9eygpID0+XG4gICAgICAgICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGF3YWl0IG9uVXBkYXRlKGNvbW1lbnQuaWQsIHRleHQudHJpbSgpKSkgc2V0RWRpdGluZyhmYWxzZSlcbiAgICAgICAgICB9KSgpXG4gICAgICAgIH1cbiAgICAgICAgb25DYW5jZWw9eygpID0+IHtcbiAgICAgICAgICBzZXRUZXh0KGNvbW1lbnQudGV4dClcbiAgICAgICAgICBzZXRFZGl0aW5nKGZhbHNlKVxuICAgICAgICB9fVxuICAgICAgICBidXN5PXtidXN5fVxuICAgICAgICB0PXt0fVxuICAgICAgLz5cbiAgICApXG4gIH1cbiAgLyoqIEp1bXAgdG8gdGhlIGNvbW1lbnQncyBjaGFuZ2UgYmxvY2sgaW4gdGhlIHJldmlldyBwYW5lbCAobGlrZSB0aGUgZG9jayBjaGlwcykuICovXG4gIGNvbnN0IGp1bXAgPSAoKSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5mb2N1cyA9IHtcbiAgICAgICAgcGF0aDogY29tbWVudC5wYXRoLFxuICAgICAgICBsaW5lOiBjb21tZW50LmxpbmVOZXcgPz8gY29tbWVudC5saW5lT2xkID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGFiOiBjb21tZW50LnNvdXJjZSA9PT0gJ3Nlc3Npb24nID8gJ3Nlc3Npb24nIDogJ3dvcmtzcGFjZScsXG4gICAgICB9XG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1lZGl0b3JcIj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItc2F2ZWQtY29tbWVudC1qdW1wXCJcbiAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5kb2NrSnVtcCcpfVxuICAgICAgICBvbkNsaWNrPXtqdW1wfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNhdmVkLWNvbW1lbnQtbG9jXCI+XG4gICAgICAgICAge2NvbW1lbnQucGF0aH1cbiAgICAgICAgICB7Y29tbWVudC5saW5lTmV3ICE9PSBudWxsID8gYDoke2NvbW1lbnQubGluZU5ld31gIDogY29tbWVudC5saW5lT2xkICE9PSBudWxsID8gYCAob2xkOiR7Y29tbWVudC5saW5lT2xkfSlgIDogJyd9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWlucHV0IGRzZHItc2F2ZWQtY29tbWVudC12aWV3XCI+e2NvbW1lbnQudGV4dH08L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFjdGlvbnNcIj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItYnRuXCJcbiAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0VGV4dChjb21tZW50LnRleHQpXG4gICAgICAgICAgICBzZXRFZGl0aW5nKHRydWUpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHt0KCdjb21tZW50LmVkaXQnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIlxuICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBvbkRlbGV0ZShjb21tZW50LmlkKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogT25lIEFJLXJldmlldyBmaW5kaW5nIHJlbmRlcmVkIGFzIGFuIGlubGluZSBjYXJkIChDb2RleC1zdHlsZSkuICovXG5mdW5jdGlvbiBGaW5kaW5nQ2FyZCh7IGZpbmRpbmcsIHQgfTogeyBmaW5kaW5nOiBSZXZpZXdGaW5kaW5nOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLWNhcmQgZHNkci1maW5kaW5nLSR7ZmluZGluZy5wcmlvcml0eX1gfT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtaGVhZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmcucHJpb3JpdHl9YH0+e2ZpbmRpbmcucHJpb3JpdHl9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC10aXRsZVwiPntmaW5kaW5nLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtbG9jXCI+XG4gICAgICAgICAge2ZpbmRpbmcuZmlsZX06e2ZpbmRpbmcubGluZVN0YXJ0fXtmaW5kaW5nLmxpbmVFbmQgIT09IGZpbmRpbmcubGluZVN0YXJ0ID8gYC0ke2ZpbmRpbmcubGluZUVuZH1gIDogJyd9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAge2ZpbmRpbmcuZGV0YWlsID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1kZXRhaWxcIj57ZmluZGluZy5kZXRhaWx9PC9kaXY+IDogbnVsbH1cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtbWV0YVwiPlxuICAgICAgICB7dCgncmV2aWV3LmNvbmZpZGVuY2UnLCB7IGNvbmZpZGVuY2U6IGZpbmRpbmcuY29uZmlkZW5jZS50b0ZpeGVkKDIpIH0pfVxuICAgICAgPC9kaXY+XG4gICAgICB7ZmluZGluZy5zdWdnZXN0aW9uID8gPHByZSBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1zdWdnZXN0aW9uXCI+e2ZpbmRpbmcuc3VnZ2VzdGlvbn08L3ByZT4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgd2l0aCBwZXItaHVuayBhY3Rpb24gYmFycyBhbmQgaW5saW5lIGNvbW1lbnRzICh3b3Jrc3BhY2UgZmlsZXMpLiAqL1xuZnVuY3Rpb24gVW5pZmllZERpZmYoe1xuICBkaWZmLFxuICBodW5rcyxcbiAgYnVzeSxcbiAgb25IdW5rQWN0aW9uLFxuICB0LFxuICBjb21tZW50cyxcbiAgY29tbWVudEVkaXRvcixcbiAgY29tbWVudFRleHQsXG4gIG9uQ29tbWVudFRleHQsXG4gIG9uT3BlbkNvbW1lbnQsXG4gIG9uU2F2ZUNvbW1lbnQsXG4gIG9uQ2FuY2VsQ29tbWVudCxcbiAgb25EZWxldGVDb21tZW50LFxuICBvblVwZGF0ZUNvbW1lbnQsXG4gIHJlYWRPbmx5LFxuICBwYXRoLFxuICByZXZpZXdGaW5kaW5ncyxcbiAgb25PcGVuTGluZSxcbiAganVtcExpbmUsXG59OiB7XG4gIGRpZmY6IHN0cmluZ1xuICBodW5rczogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVua1tdXG4gIGJ1c3k6IGJvb2xlYW5cbiAgb25IdW5rQWN0aW9uOiAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xuICBjb21tZW50cz86IFJldmlld0NvbW1lbnRbXVxuICBjb21tZW50RWRpdG9yPzogeyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0gfCBudWxsXG4gIGNvbW1lbnRUZXh0Pzogc3RyaW5nXG4gIG9uQ29tbWVudFRleHQ/OiAodjogc3RyaW5nKSA9PiB2b2lkXG4gIG9uT3BlbkNvbW1lbnQ/OiAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCkgPT4gdm9pZFxuICBvblNhdmVDb21tZW50PzogKCkgPT4gdm9pZFxuICBvbkNhbmNlbENvbW1lbnQ/OiAoKSA9PiB2b2lkXG4gIG9uRGVsZXRlQ29tbWVudD86IChpZDogc3RyaW5nKSA9PiB2b2lkXG4gIG9uVXBkYXRlQ29tbWVudD86IChpZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpID0+IFByb21pc2U8Ym9vbGVhbj5cbiAgLyoqIEhpZGUgcGVyLWh1bmsgYWN0aW9uIGJhcnMgKGJyYW5jaCBzY29wZSBpcyBhIHJlYWQtb25seSBkaWZmKS4gKi9cbiAgcmVhZE9ubHk/OiBib29sZWFuXG4gIC8qKiBSZXBvLXJlbGF0aXZlIGZpbGUgcGF0aCAoZm9yIG9wZW4taW4tZWRpdG9yIGFuZCBtYXJrZXJzKS4gKi9cbiAgcGF0aD86IHN0cmluZ1xuICAvKiogQUktcmV2aWV3IGZpbmRpbmdzIHRvIG1hcmsgb24gbWF0Y2hpbmcgbGluZXMuICovXG4gIHJldmlld0ZpbmRpbmdzPzogUmV2aWV3RmluZGluZ1tdXG4gIC8qKiBPcGVuIHRoZSBmaWxlIGF0IGEgbGluZSBpbiB0aGUgdXNlcidzIGVkaXRvci4gKi9cbiAgb25PcGVuTGluZT86IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4gdm9pZFxuICAvKiogVGVtcG9yYXJ5IGxpbmUgaGlnaGxpZ2h0IChlLmcuIGp1bXAgZnJvbSBhIFBSIGNvbW1lbnQpLiAqL1xuICBqdW1wTGluZT86IG51bWJlciB8IG51bGxcbn0pIHtcbiAgY29uc3QgYmxvY2tzID0gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgbGV0IGh1bmtJbmRleCA9IDBcbiAgY29uc3QgZWRpdGluZ0tleSA9IGNvbW1lbnRFZGl0b3IgPyBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA6IG51bGxcbiAgY29uc3QgZmluZGluZ3NGb3IgPSAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCk6IFJldmlld0ZpbmRpbmdbXSA9PiB7XG4gICAgaWYgKCFwYXRoIHx8ICFyZXZpZXdGaW5kaW5ncyB8fCByZXZpZXdGaW5kaW5ncy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICAgIHJldHVybiByZXZpZXdGaW5kaW5ncy5maWx0ZXIoKGYpID0+IHtcbiAgICAgIGlmIChmLmZpbGUgIT09IHBhdGgpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKG5ld0xpbmUgIT09IG51bGwpIHJldHVybiBuZXdMaW5lID49IGYubGluZVN0YXJ0ICYmIG5ld0xpbmUgPD0gZi5saW5lRW5kXG4gICAgICByZXR1cm4gb2xkTGluZSAhPT0gbnVsbCAmJiBvbGRMaW5lID49IGYubGluZVN0YXJ0ICYmIG9sZExpbmUgPD0gZi5saW5lRW5kXG4gICAgfSlcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICB7YmxvY2tzLm1hcCgoYmxvY2ssIGJpKSA9PiB7XG4gICAgICAgICAgY29uc3QgaXNIdW5rID0gYmxvY2suaGVhZD8ua2luZCA9PT0gJ2h1bmsnXG4gICAgICAgICAgY29uc3QgaHVuayA9IGlzSHVuayA/IGh1bmtzW2h1bmtJbmRleCsrXSA6IHVuZGVmaW5lZFxuICAgICAgICAgIGNvbnN0IHN0YXJ0cyA9IGJsb2NrLmhlYWQ/LmtpbmQgPT09ICdodW5rJyA/IGh1bmtTdGFydHMoYmxvY2suaGVhZC50ZXh0KSA6IHsgb2xkU3RhcnQ6IDEsIG5ld1N0YXJ0OiAxIH1cbiAgICAgICAgICBjb25zdCByb3dzID0gaXNIdW5rID8gdW5pZmllZFJvd3NXaXRoTGluZXMoYmxvY2sucm93cywgc3RhcnRzLm9sZFN0YXJ0LCBzdGFydHMubmV3U3RhcnQpIDogW11cbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICB7aXNIdW5rICYmICFyZWFkT25seSA/IDxIdW5rVG9vbGJhciBodW5rPXtodW5rfSBidXN5PXtidXN5fSBvbkFjdGlvbj17b25IdW5rQWN0aW9ufSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7YmxvY2suaGVhZC5raW5kfWB9PntibG9jay5oZWFkLnRleHQgfHwgJyAnfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgIHtpc0h1bmtcbiAgICAgICAgICAgICAgICA/IHJvd3MubWFwKCh7IHJvdywgb2xkTGluZSwgbmV3TGluZSB9LCByaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtvbGRMaW5lID8/ICdvJ306JHtuZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0NvbW1lbnRzID0gY29tbWVudHM/LmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgb2xkTGluZSwgbmV3TGluZSkpID8/IFtdXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdzID0gZmluZGluZ3NGb3Iob2xkTGluZSwgbmV3TGluZSlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWRpdGluZyA9IGVkaXRpbmdLZXkgPT09IGtleVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG93QWN0aW9ucyA9IHJvdy5raW5kID09PSAnY3R4JyB8fCByb3cua2luZCA9PT0gJ2FkZCcgfHwgcm93LmtpbmQgPT09ICdkZWwnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdDbHMgPSBmaW5kaW5ncy5sZW5ndGggPiAwID8gYCBkc2RyLWxpbmUtZmluZGluZyBkc2RyLWZpbmRpbmctJHtmaW5kaW5nc1swXS5wcmlvcml0eX1gIDogJydcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganVtcGVkID0ganVtcExpbmUgIT0gbnVsbCAmJiAobmV3TGluZSA9PT0ganVtcExpbmUgfHwgKG5ld0xpbmUgPT09IG51bGwgJiYgb2xkTGluZSA9PT0ganVtcExpbmUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e3JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfSR7cm93Q29tbWVudHMubGVuZ3RoID4gMCA/ICcgZHNkci1saW5lLWNvbW1lbnRlZCcgOiAnJ30ke2ZpbmRpbmdDbHN9JHtqdW1wZWQgPyAnIGRzZHItbGluZS1qdW1wJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtuZXdMaW5lID8/IG9sZExpbmUgPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtbnVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge25ld0xpbmUgPz8gb2xkTGluZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmUgY291bnQ9e3Jvd0NvbW1lbnRzLmxlbmd0aH0gb25PcGVuPXsoKSA9PiBvbk9wZW5Db21tZW50Py4ob2xkTGluZSwgbmV3TGluZSl9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLXRleHRcIj57cm93LnRleHQgfHwgJyAnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLXRhZyBkc2RyLWZpbmRpbmctJHtmaW5kaW5nc1swXS5wcmlvcml0eX1gfSB0aXRsZT17ZmluZGluZ3NbMF0udGl0bGV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nc1swXS5wcmlvcml0eX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3MubGVuZ3RoID4gMSA/IGBcdTAwRDcke2ZpbmRpbmdzLmxlbmd0aH1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3BhdGggJiYgb25PcGVuTGluZSAmJiAobmV3TGluZSA/PyBvbGRMaW5lKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItb3BlbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbk9wZW5MaW5lKHBhdGgsIG5ld0xpbmUgPz8gb2xkTGluZSA/PyAxKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zICYmIHJvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvd0NvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e29uVXBkYXRlQ29tbWVudCA/PyAoYXN5bmMgKCkgPT4gZmFsc2UpfSBvbkRlbGV0ZT17b25EZWxldGVDb21tZW50ID8/ICgoKSA9PiB7fSl9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlZGl0aW5nID8gPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHQgPz8gJyd9IG9uVGV4dD17b25Db21tZW50VGV4dCA/PyAoKCkgPT4ge30pfSBvblNhdmU9e29uU2F2ZUNvbW1lbnQgPz8gKCgpID0+IHt9KX0gb25DYW5jZWw9e29uQ2FuY2VsQ29tbWVudCA/PyAoKCkgPT4ge30pfSBidXN5PXtidXN5fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICB7KHJldmlld0ZpbmRpbmdzID8/IFtdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChmKSA9PiBmLmZpbGUgPT09IHBhdGggJiYgZi5saW5lU3RhcnQgPT09IChuZXdMaW5lID8/IG9sZExpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChmLCBmaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaW5kaW5nQ2FyZCBrZXk9e2Ake2YuZmlsZX06JHtmLmxpbmVTdGFydH06JHtmaX1gfSBmaW5kaW5nPXtmfSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogYmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgPC9wcmU+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFN0YXR1cyBjaGlwIGNvbG9yIGNsYXNzIGZvciBhIHdvcmtzcGFjZSBjaGFuZ2UuICovXG4vKiogRHJhZyBoYW5kbGUgZm9yIHJlc2l6aW5nIHRoZSBwYW5lbCAoZWFzdCAvIHNvdXRoIC8gc291dGgtZWFzdCkuICovXG5mdW5jdGlvbiBSZXNpemVIYW5kbGUoeyBtb2RlLCBvblJlc2l6ZSB9OiB7IG1vZGU6ICdlJyB8ICdzJyB8ICdzZSc7IG9uUmVzaXplOiAoZHg6IG51bWJlciwgZHk6IG51bWJlcikgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IGxhc3QgPSB1c2VSZWY8eyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbD4obnVsbClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLXJlc2l6ZSBkc2RyLXJlc2l6ZS0ke21vZGV9YH1cbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH1cbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghbGFzdC5jdXJyZW50KSByZXR1cm5cbiAgICAgICAgY29uc3QgZHggPSBldmVudC5jbGllbnRYIC0gbGFzdC5jdXJyZW50LnhcbiAgICAgICAgY29uc3QgZHkgPSBldmVudC5jbGllbnRZIC0gbGFzdC5jdXJyZW50LnlcbiAgICAgICAgbGFzdC5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH1cbiAgICAgICAgaWYgKGR4ICE9PSAwIHx8IGR5ICE9PSAwKSBvblJlc2l6ZShkeCwgZHkpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyVXA9eyhldmVudCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSBudWxsXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJDYW5jZWw9eygpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0gbnVsbFxuICAgICAgfX1cbiAgICAvPlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hpcENsYXNzKHN0YXR1czogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcyA9IHN0YXR1cy5yZXBsYWNlKC9cXHMvZywgJycpXG4gIGlmIChzLmluY2x1ZGVzKCc/PycpKSByZXR1cm4gJ2RzZHItY2hpcC11J1xuICBpZiAocy5zdGFydHNXaXRoKCdBJykgfHwgcy5pbmNsdWRlcygnQScpKSByZXR1cm4gJ2RzZHItY2hpcC1hJ1xuICBpZiAocy5zdGFydHNXaXRoKCdEJykgfHwgcy5pbmNsdWRlcygnRCcpKSByZXR1cm4gJ2RzZHItY2hpcC1kJ1xuICBpZiAocy5zdGFydHNXaXRoKCdSJykgfHwgcy5pbmNsdWRlcygnUicpKSByZXR1cm4gJ2RzZHItY2hpcC1yJ1xuICByZXR1cm4gJ2RzZHItY2hpcC1tJ1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkU3RhdHVzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxTdGF0dXNSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtTVEFUVVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGBzdGF0dXMgcmVxdWVzdCBmYWlsZWQ6ICR7cmVzLnN0YXR1c31gKVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkpIGFzIFN0YXR1c1Jlc3BvbnNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5Q2hhbmdlcyhjd2Q6IHN0cmluZywgYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoPzogc3RyaW5nKTogUHJvbWlzZTxBcHBseVJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEFQUExZX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBhY3Rpb24sIHBhdGggfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBBcHBseVJlc3BvbnNlXG59XG5cbi8qKiBBcHBseSBvbmUgaHVuayBvZiBvbmUgZmlsZSAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5SHVuayhjd2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IHN0cmluZyk6IFByb21pc2U8QXBwbHlIdW5rUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQVBQTFlfSFVOS19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgcGF0aCwgYWN0aW9uLCBodW5rIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQXBwbHlIdW5rUmVzcG9uc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuR2l0QWN0aW9uKGN3ZDogc3RyaW5nLCBhY3Rpb246ICdjb21taXQnIHwgJ3B1c2gnLCBtZXNzYWdlPzogc3RyaW5nKTogUHJvbWlzZTxHaXRSZXNwb25zZT4ge1xuICBjb25zdCB1cmwgPSBhY3Rpb24gPT09ICdjb21taXQnID8gQ09NTUlUX1VSTCA6IFBVU0hfVVJMXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGFjdGlvbiA9PT0gJ2NvbW1pdCcgPyB7IGN3ZCwgbWVzc2FnZSB9IDogeyBjd2QgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBHaXRSZXNwb25zZVxufVxuXG4vKiogTG9jYWwgKHVucHVzaGVkKSBjb21taXRzIGFoZWFkIG9mIHRoZSB1cHN0cmVhbS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRIaXN0b3J5KGN3ZDogc3RyaW5nKTogUHJvbWlzZTxIaXN0b3J5UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7SElTVE9SWV9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1pdHM6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgSGlzdG9yeVJlc3BvbnNlXG59XG5cbi8qKiBPbmUgY29tbWl0J3MgdW5pZmllZCBkaWZmLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZENvbW1pdERpZmYoY3dkOiBzdHJpbmcsIGhhc2g6IHN0cmluZyk6IFByb21pc2U8Q29tbWl0RGlmZlJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0NPTU1JVF9ESUZGX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9Jmhhc2g9JHtlbmNvZGVVUklDb21wb25lbnQoaGFzaCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZGlmZjogJycsIGZpbGVzOiBbXSwgYWRkZWQ6IDAsIGRlbGV0ZWQ6IDAsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBDb21taXREaWZmUmVzcG9uc2Vcbn1cblxuLyoqIElubGluZSByZXZpZXcgY29tbWVudHMgZm9yIHRoZSB3b3Jrc3BhY2UgKHJlcG8tc2NvcGVkKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRDb21tZW50cyhjd2Q6IHN0cmluZyk6IFByb21pc2U8UmV2aWV3Q29tbWVudFtdPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0NPTU1FTlRTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWVudHM6IFtdIH0pKSkgYXMgQ29tbWVudHNSZXNwb25zZVxuICByZXR1cm4gZGF0YS5vayA/IGRhdGEuY29tbWVudHMgOiBbXVxufVxuXG4vKiogUmVwbGFjZSB0aGUgd2hvbGUgY29tbWVudCBsaXN0IChzaW5nbGUtdXNlciByZXBsYWNlIHNlbWFudGljcykuICovXG5hc3luYyBmdW5jdGlvbiBzYXZlQ29tbWVudHMoY3dkOiBzdHJpbmcsIGNvbW1lbnRzOiBSZXZpZXdDb21tZW50W10pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQ09NTUVOVFNfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIGNvbW1lbnRzIH0pLFxuICB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlIH0pKSkgYXMgQ29tbWVudHNSZXNwb25zZVxuICByZXR1cm4gZGF0YS5vayA9PT0gdHJ1ZVxufVxuXG4vKiogTG9jYWwgYnJhbmNoIG5hbWVzIChmb3IgdGhlIEJyYW5jaCByZXZpZXcgc2NvcGUpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEJyYW5jaGVzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtCUkFOQ0hFU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGJyYW5jaGVzOiBbXSB9KSkpIGFzIHsgb2s6IGJvb2xlYW47IGJyYW5jaGVzOiBzdHJpbmdbXSB9XG4gIHJldHVybiBkYXRhLm9rID8gZGF0YS5icmFuY2hlcyA6IFtdXG59XG5cbi8qKiBSdW4gYW4gQUkgcmV2aWV3IG92ZXIgdGhlIGdpdmVuIHNjb3BlLiAqL1xuYXN5bmMgZnVuY3Rpb24gcnVuUmV2aWV3KGN3ZDogc3RyaW5nLCBzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwsIHNjb3BlOiAndW5jb21taXR0ZWQnIHwgJ2JyYW5jaCcgfCAnY29tbWl0JywgYmFzZT86IHN0cmluZywgY29tbWl0SGFzaD86IHN0cmluZyk6IFByb21pc2U8UmV2aWV3UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goUkVWSUVXX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBzZXNzaW9uSWQ6IHNlc3Npb25JZCA/PyB1bmRlZmluZWQsIHNjb3BlLCBiYXNlLCBjb21taXRIYXNoIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBmaW5kaW5nczogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBSZXZpZXdSZXNwb25zZVxufVxuXG4vKiogQ3VycmVudCBicmFuY2gncyBHaXRIdWIgUFIgY29udGV4dCAoZGVncmFkZXMgZ3JhY2VmdWxseSB3aXRob3V0IGdoKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQcihjd2Q6IHN0cmluZyk6IFByb21pc2U8UHJSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtQUl9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1lbnRzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFByUmVzcG9uc2Vcbn1cblxuLyoqIEdpdCByZXBvcyB1bmRlciBhIHdvcmtzcGFjZSAobXVsdGktcmVwbyBzZWxlY3RvcikuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkUmVwb3MoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFJlcG9zUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7UkVQT1NfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCByZXBvczogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBSZXBvc1Jlc3BvbnNlXG59XG5cbi8qKiBPcGVuIGEgZmlsZSAob3B0aW9uYWxseSBhdCBhIGxpbmUpIGluIHRoZSB1c2VyJ3MgZWRpdG9yIHZpYSBvcGVuLWVkaXRvci4gKi9cbmFzeW5jIGZ1bmN0aW9uIG9wZW5JbkVkaXRvcihjd2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBsaW5lPzogbnVtYmVyKTogUHJvbWlzZTx7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gIGNvbnN0IGFicyA9IHBhdGguc3RhcnRzV2l0aCgnLycpIHx8IC9eW0EtWmEtel06W1xcXFwvXS8udGVzdChwYXRoKSA/IHBhdGggOiBgJHtjd2R9LyR7cGF0aH1gXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKE9QRU5fRURJVE9SX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcGF0aDogYWJzLCBsaW5lIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgeyBvazogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfVxufVxuXG4vKiogU2hvcnQgcmVsYXRpdmUgdGltZSBmb3IgY29tbWl0IHJvd3MgKFwianVzdCBub3dcIiAvIFwiMyBtaW4gYWdvXCIgLyBcdTIwMjYpLiAqL1xuZnVuY3Rpb24gcmVsYXRpdmVUaW1lKGlzbzogc3RyaW5nLCB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKSAtIG5ldyBEYXRlKGlzbykuZ2V0VGltZSgpKSAvIDYwMDAwKVxuICBpZiAobWludXRlcyA8IDEpIHJldHVybiB0KCd0aW1lLm5vdycpXG4gIGlmIChtaW51dGVzIDwgNjApIHJldHVybiB0KCd0aW1lLm1pbnV0ZXMnLCB7IG46IG1pbnV0ZXMgfSlcbiAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MClcbiAgaWYgKGhvdXJzIDwgMjQpIHJldHVybiB0KCd0aW1lLmhvdXJzJywgeyBuOiBob3VycyB9KVxuICByZXR1cm4gdCgndGltZS5kYXlzJywgeyBuOiBNYXRoLmZsb29yKGhvdXJzIC8gMjQpIH0pXG59XG5cbi8qKiBUaGVtZS1hd2FyZSBkcm9wZG93biByZXBsYWNpbmcgbmF0aXZlIDxzZWxlY3Q+IChuYXRpdmUgcG9wdXBzIGlnbm9yZSB0aGUgdGhlbWUpLiAqL1xuZnVuY3Rpb24gVGhlbWVTZWxlY3Qoe1xuICB2YWx1ZSxcbiAgb3B0aW9ucyxcbiAgb25DaGFuZ2UsXG4gIGFyaWFMYWJlbCxcbn06IHtcbiAgdmFsdWU6IHN0cmluZ1xuICBvcHRpb25zOiB7IHZhbHVlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfVtdXG4gIG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZFxuICBhcmlhTGFiZWw/OiBzdHJpbmdcbn0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJvb3RSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IGN1cnJlbnQgPSBvcHRpb25zLmZpbmQoKG8pID0+IG8udmFsdWUgPT09IHZhbHVlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm5cbiAgICBjb25zdCBjbG9zZU91dHNpZGUgPSAoZXZlbnQ6IFBvaW50ZXJFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUgJiYgIXJvb3RSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgY29uc3QgY2xvc2VPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgY2xvc2VPdXRzaWRlKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjbG9zZU9uS2V5KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGNsb3NlT3V0c2lkZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjbG9zZU9uS2V5KVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbFwiIHJlZj17cm9vdFJlZn0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXNlbC10cmlnZ2VyXCJcbiAgICAgICAgYXJpYS1oYXNwb3B1cD1cImxpc3Rib3hcIlxuICAgICAgICBhcmlhLWV4cGFuZGVkPXtvcGVufVxuICAgICAgICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtdmFsdWVcIj57Y3VycmVudD8ubGFiZWwgPz8gdmFsdWV9PC9zcGFuPlxuICAgICAgICA8SWNvbkNoZXZyb25Eb3duIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwiZHNkci1zZWwtbWVudVwiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17YXJpYUxhYmVsfT5cbiAgICAgICAgICB7b3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gKFxuICAgICAgICAgICAgPGxpIGtleT17b3B0aW9uLnZhbHVlfSByb2xlPVwibm9uZVwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17b3B0aW9uLnZhbHVlID09PSB2YWx1ZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNlbC1vcHRpb24ke29wdGlvbi52YWx1ZSA9PT0gdmFsdWUgPyAnIGRzZHItc2VsLW9wdGlvbi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZShvcHRpb24udmFsdWUpXG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC1vcHRpb24tbWFya1wiPntvcHRpb24udmFsdWUgPT09IHZhbHVlID8gPEljb25DaGVjayAvPiA6IG51bGx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLW9wdGlvbi1sYWJlbFwiPntvcHRpb24ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogRGlmZiBmb250ICsgZm9udCBzaXplIGNvbnRyb2xzIChzaGFyZWQgcHJlZnMgc3RvcmUpLiAqL1xuZnVuY3Rpb24gRGlmZlJldmlld1ByZWZzKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IHByZWZzID0gdXNlU3luY0V4dGVybmFsU3RvcmUocHJlZnNTdG9yZS5zdWJzY3JpYmUsIHByZWZzU3RvcmUuZ2V0U25hcHNob3QpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jZmctZmllbGRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbGFiZWxcIiBpZD1cImRzZHItcHJlZi1mb250LWxhYmVsXCI+e3QoJ3NldHRpbmdzLmZvbnQnKX08L3NwYW4+XG4gICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2V0dGluZ3MuZm9udCcpfVxuICAgICAgICAgIHZhbHVlPXtwcmVmcy5mb250fVxuICAgICAgICAgIG9wdGlvbnM9e0ZPTlRfT1BUSU9OUy5tYXAoKGYpID0+ICh7IHZhbHVlOiBmLmlkLCBsYWJlbDogZi5sYWJlbC5zdGFydHNXaXRoKCdmb250LicpID8gdChmLmxhYmVsIGFzIGtleW9mIHR5cGVvZiB6aCkgOiBmLmxhYmVsIH0pKX1cbiAgICAgICAgICBvbkNoYW5nZT17KGZvbnQpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLmZvbnQgPSBmb250XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1maWVsZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1sYWJlbFwiIGlkPVwiZHNkci1wcmVmLXNpemUtbGFiZWxcIj57dCgnc2V0dGluZ3Muc2l6ZScpfTwvc3Bhbj5cbiAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgYXJpYUxhYmVsPXt0KCdzZXR0aW5ncy5zaXplJyl9XG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhwcmVmcy5zaXplKX1cbiAgICAgICAgICBvcHRpb25zPXtTSVpFX09QVElPTlMubWFwKChzKSA9PiAoeyB2YWx1ZTogU3RyaW5nKHMpLCBsYWJlbDogYCR7c31weGAgfSkpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoc2l6ZSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuc2l6ZSA9IE51bWJlcihzaXplKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEhlYWRlciBhY3Rpb24gKHNlc3Npb24gc2NvcGUpOiBiYWRnZSArIG9wZW4uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gRGlmZlJldmlld0FjdGlvbih7IHNlc3Npb25JZCwgdXNlU2Vzc2lvbnMsIHVzZVNlc3Npb24sIHQgfTogRGlmZlJldmlld0FjdGlvblByb3BzKSB7XG4gIGNvbnN0IGN3ZCA9IHVzZVNlc3Npb25zKChzOiBTZXNzaW9uTGlzdFN0YXRlKSA9PiBzLmJ5SWRbc2Vzc2lvbklkXT8uY3dkKVxuICBjb25zdCBub2RlcyA9IHVzZVNlc3Npb24oKHMpID0+IHMubm9kZXMpXG4gIGNvbnN0IGNoYW5nZUNvdW50ID0gdXNlTWVtbygoKSA9PiBjb3VudFNlc3Npb25DaGFuZ2VzKG5vZGVzKSwgW25vZGVzXSlcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3Qgb3Blbk92ZXJsYXkgPSAoKSA9PiB7XG4gICAgaWYgKCFjd2QpIHJldHVyblxuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHVuc3ViID0gb3ZlcmxheVN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBzZXRPcGVuKG92ZXJsYXlTdG9yZS5nZXRTbmFwc2hvdCgpLm9wZW4pXG4gICAgfSlcbiAgICByZXR1cm4gdW5zdWJcbiAgfSwgW10pXG5cbiAgaWYgKCFjd2QpIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXRyaWdnZXJcIiBhcmlhLWxhYmVsPXt0KCdhY3Rpb24uYXJpYScpfSBvbkNsaWNrPXtvcGVuT3ZlcmxheX0+XG4gICAgICA8SWNvbkRpZmYgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGFiZWxcIj57dCgnYWN0aW9uLmxhYmVsJyl9PC9zcGFuPlxuICAgICAge2NoYW5nZUNvdW50ID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY291bnRcIj57Y2hhbmdlQ291bnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7b3BlbiA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY291bnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cdTI3MTM8L3NwYW4+IDogbnVsbH1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZpbGUgdHJlZTogYnVpbGQgYSBkaXJlY3RvcnkgdHJlZSBmcm9tIGZsYXQgcGF0aHMgYW5kIHJlbmRlciBpdCB3aXRoXG4vLyBjb2xsYXBzaWJsZSBmb2xkZXJzICh0aGUgbGVmdCBzaWRlIG9mIHRoZSByZXZpZXcgc3VyZmFjZSkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudHlwZSBUcmVlRGlyPFQ+ID0geyBraW5kOiAnZGlyJzsgbmFtZTogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGNoaWxkcmVuOiBUcmVlTm9kZTxUPltdIH1cbnR5cGUgVHJlZUxlYWY8VD4gPSB7IGtpbmQ6ICdsZWFmJzsgbmFtZTogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGl0ZW06IFQgfVxudHlwZSBUcmVlTm9kZTxUPiA9IFRyZWVEaXI8VD4gfCBUcmVlTGVhZjxUPlxuXG4vKiogVHVybiBhIGZsYXQgaXRlbSBsaXN0IGludG8gYSBzb3J0ZWQgZGlyZWN0b3J5IHRyZWUgKGRpcmVjdG9yaWVzIGZpcnN0KS4gKi9cbmZ1bmN0aW9uIGJ1aWxkRmlsZVRyZWU8VD4oaXRlbXM6IHJlYWRvbmx5IFRbXSwgcGF0aE9mOiAoaXRlbTogVCkgPT4gc3RyaW5nKTogVHJlZU5vZGU8VD5bXSB7XG4gIGNvbnN0IHJvb3Q6IFRyZWVOb2RlPFQ+W10gPSBbXVxuICBjb25zdCBkaXJJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBUcmVlRGlyPFQ+PigpXG4gIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgIGNvbnN0IHBhdGggPSBwYXRoT2YoaXRlbSlcbiAgICBjb25zdCBwYXJ0cyA9IHBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbilcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAwKSBjb250aW51ZVxuICAgIGxldCBzaWJsaW5ncyA9IHJvb3RcbiAgICBsZXQgcHJlZml4ID0gJydcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgcHJlZml4ID0gcHJlZml4ID8gYCR7cHJlZml4fS8ke3BhcnRzW2ldfWAgOiBwYXJ0c1tpXVxuICAgICAgbGV0IGRpciA9IGRpckluZGV4LmdldChwcmVmaXgpXG4gICAgICBpZiAoIWRpcikge1xuICAgICAgICBkaXIgPSB7IGtpbmQ6ICdkaXInLCBuYW1lOiBwYXJ0c1tpXSwgcGF0aDogcHJlZml4LCBjaGlsZHJlbjogW10gfVxuICAgICAgICBkaXJJbmRleC5zZXQocHJlZml4LCBkaXIpXG4gICAgICAgIHNpYmxpbmdzLnB1c2goZGlyKVxuICAgICAgfVxuICAgICAgc2libGluZ3MgPSBkaXIuY2hpbGRyZW5cbiAgICB9XG4gICAgc2libGluZ3MucHVzaCh7IGtpbmQ6ICdsZWFmJywgbmFtZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV0sIHBhdGgsIGl0ZW0gfSlcbiAgfVxuICBjb25zdCBzb3J0Tm9kZXMgPSAobm9kZXM6IFRyZWVOb2RlPFQ+W10pOiB2b2lkID0+IHtcbiAgICBub2Rlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS5raW5kICE9PSBiLmtpbmQpIHJldHVybiBhLmtpbmQgPT09ICdkaXInID8gLTEgOiAxXG4gICAgICByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKVxuICAgIH0pXG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSBpZiAobm9kZS5raW5kID09PSAnZGlyJykgc29ydE5vZGVzKG5vZGUuY2hpbGRyZW4pXG4gIH1cbiAgc29ydE5vZGVzKHJvb3QpXG4gIHJldHVybiByb290XG59XG5cbi8qKiBSZWN1cnNpdmUgdHJlZSByZW5kZXJlcjogY29sbGFwc2libGUgZGlyZWN0b3JpZXMgKyBsZWFmIHJvd3MuICovXG5mdW5jdGlvbiBGaWxlVHJlZVZpZXc8VD4ocHJvcHM6IHtcbiAgbm9kZXM6IFRyZWVOb2RlPFQ+W11cbiAgY29sbGFwc2VkOiBSZWFkb25seVNldDxzdHJpbmc+XG4gIG9uVG9nZ2xlRGlyOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkXG4gIGRlcHRoOiBudW1iZXJcbiAgcmVuZGVyTGVhZjogKGxlYWY6IFRyZWVMZWFmPFQ+KSA9PiBSZWFjdE5vZGVcbn0pOiBSZWFjdEVsZW1lbnQge1xuICBjb25zdCB7IG5vZGVzLCBjb2xsYXBzZWQsIG9uVG9nZ2xlRGlyLCBkZXB0aCwgcmVuZGVyTGVhZiB9ID0gcHJvcHNcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge25vZGVzLm1hcCgobm9kZSkgPT5cbiAgICAgICAgbm9kZS5raW5kID09PSAnZGlyJyA/IChcbiAgICAgICAgICA8ZGl2IGtleT17bm9kZS5wYXRofT5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZGlyJHtjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAnJyA6ICcgZHNkci1kaXItb3Blbid9YH1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZ0xlZnQ6IGRlcHRoICogMTQgKyA4IH19XG4gICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9eyFjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVG9nZ2xlRGlyKG5vZGUucGF0aCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLWNhcmV0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+e2NvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/ICdcdTI1QjgnIDogJ1x1MjVCRSd9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1uYW1lXCIgdGl0bGU9e25vZGUucGF0aH0+e25vZGUubmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLWNvdW50XCI+e25vZGUuY2hpbGRyZW4ubGVuZ3RofTwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgeyFjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAoXG4gICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXcgbm9kZXM9e25vZGUuY2hpbGRyZW59IGNvbGxhcHNlZD17Y29sbGFwc2VkfSBvblRvZ2dsZURpcj17b25Ub2dnbGVEaXJ9IGRlcHRoPXtkZXB0aCArIDF9IHJlbmRlckxlYWY9e3JlbmRlckxlYWZ9IC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8ZGl2IGtleT17bm9kZS5wYXRofSBzdHlsZT17eyBwYWRkaW5nTGVmdDogZGVwdGggKiAxNCB9fT57cmVuZGVyTGVhZihub2RlKX08L2Rpdj5cbiAgICAgICAgKSxcbiAgICAgICl9XG4gICAgPC8+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb252ZXJzYXRpb24gY2FyZCAoc2Vzc2lvbiBzY29wZSk6IHRoZSBjYXJyaWVkIHJldmlldyBwYWNrYWdlIHJlbmRlcnMgaW4gdGhlXG4vLyB0cmFuc2NyaXB0IGFzIGEgQ29kZXgtc3R5bGUgY2FyZCBcdTIwMTQgZWFjaCBjb21tZW50IGNsaWNrYWJsZSB0byBqdW1wIHRvIHRoZVxuLy8gbWF0Y2hpbmcgY2hhbmdlIGJsb2NrIGluIHRoZSByZXZpZXcgcGFuZWwuIFRoZSB1c2VyLW5vZGUgcmVuZGVyZXIgaXNcbi8vIHNoYWRvd2VkIGF0IHByaW9yaXR5IC0xOyBub24tcGFja2FnZSBtZXNzYWdlcyBmYWxsIGJhY2sgdG8gYSBuYXRpdmUtbG9va1xuLy8gYnViYmxlICh0aGUgc2hlbGwncyBvd24gcmVuZGVyZXIgY2Fubm90IGJlIGRlbGVnYXRlZCB0bywgYmVjYXVzZSB0aGUgc2xvdFxuLy8gaGFuZHMgb3VyIG5hbWVzcGFjZS1ib3VuZCBgdGAgdG8gd2hhdGV2ZXIgY29tcG9uZW50IHdpbnMgdGhlIGNlbGwpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBTdHJ1Y3R1cmFsIHVzZXIgY29udGVudCBibG9jayAoQ29udGVudEJsb2NrIGlzIG5vdCBleHBvcnRlZCBmcm9tIHJ1bnRpbWUpLiAqL1xudHlwZSBVc2VyQmxvY2sgPSB7IHR5cGU6IHN0cmluZzsgdGV4dD86IHN0cmluZzsgYXR0YWNobWVudD86IEltYWdlQXR0YWNobWVudFJlZiB9XG5cbi8qKiBQbGFpbiB0ZXh0IG9mIGEgdXNlciBtZXNzYWdlJ3MgY29udGVudCBibG9ja3MgKHRleHQgYmxvY2tzIGNvbmNhdGVuYXRlZCkuICovXG5mdW5jdGlvbiB1c2VyTWVzc2FnZVRleHQoY29udGVudDogcmVhZG9ubHkgVXNlckJsb2NrW10pOiBzdHJpbmcge1xuICBsZXQgb3V0ID0gJydcbiAgZm9yIChjb25zdCBibG9jayBvZiBjb250ZW50KSB7XG4gICAgaWYgKGJsb2NrLnR5cGUgPT09ICd0ZXh0JyAmJiB0eXBlb2YgYmxvY2sudGV4dCA9PT0gJ3N0cmluZycpIG91dCArPSBibG9jay50ZXh0XG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG4vKiogRnVsbCBwcm9wcyBvZiBvdXIgc2hhZG93ZWQgdXNlci9zdGVlcmluZyBub2RlIHJlbmRlcmVycyAodCBib3VuZCB0byBvdXIgbmFtZXNwYWNlKS4gKi9cbnR5cGUgVXNlclJldmlld05vZGVQcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLmNoYXQubm9kZScsICd1c2VyJyB8ICdzdGVlcmluZyc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5cbi8qKiBUcmFuc2xhdG9yIGJvdW5kIHRvIHRoZSBwbHVnaW4gbmFtZXNwYWNlIChzaGFyZWQgYnkgdGhlIGNhcmQvYnViYmxlKS4gKi9cbnR5cGUgQ2FyZFQgPSBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPlsndCddXG5cbi8qKiBHcm91cCBjb21tZW50cyBieSBwYXRoLCBwcmVzZXJ2aW5nIGZpcnN0LXNlZW4gb3JkZXIuICovXG5mdW5jdGlvbiBncm91cENvbW1lbnRzKGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdKTogeyBwYXRoOiBzdHJpbmc7IGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdIH1bXSB7XG4gIGNvbnN0IGdyb3VwczogeyBwYXRoOiBzdHJpbmc7IGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdIH1bXSA9IFtdXG4gIGNvbnN0IGluZGV4ID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKVxuICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICBsZXQgZyA9IGluZGV4LmdldChjLnBhdGgpXG4gICAgaWYgKGcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZyA9IGdyb3Vwcy5sZW5ndGhcbiAgICAgIGluZGV4LnNldChjLnBhdGgsIGcpXG4gICAgICBncm91cHMucHVzaCh7IHBhdGg6IGMucGF0aCwgY29tbWVudHM6IFtdIH0pXG4gICAgfVxuICAgIGdyb3Vwc1tnXS5jb21tZW50cy5wdXNoKGMpXG4gIH1cbiAgcmV0dXJuIGdyb3Vwc1xufVxuXG5mdW5jdGlvbiBJY29uRmlsZSgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTQgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjh6XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNMTQgMnY2aDZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBDb2RleC1zdHlsZSByZXZpZXcgY2FyZCBmb3IgYSBjYXJyaWVkIHJldmlldyBwYWNrYWdlIG1lc3NhZ2UuICovXG5mdW5jdGlvbiBSZXZpZXdQYWNrYWdlQ2FyZCh7IHBrZywgY3dkLCB0IH06IHsgcGtnOiBSZXZpZXdQYWNrYWdlOyBjd2Q/OiBzdHJpbmc7IHQ6IENhcmRUIH0pIHtcbiAgY29uc3QgdGFyZ2V0Q3dkID0gcGtnLndvcmtzcGFjZSA/PyBjd2QgPz8gbnVsbFxuICBjb25zdCBqdW1wID0gKHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlcikgPT4ge1xuICAgIGlmICghdGFyZ2V0Q3dkKSByZXR1cm5cbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IHRhcmdldEN3ZFxuICAgICAgZC5mb2N1cyA9IHsgcGF0aCwgbGluZSB9XG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cbiAgY29uc3QgZ3JvdXBzID0gdXNlTWVtbygoKSA9PiBncm91cENvbW1lbnRzKHBrZy5jb21tZW50cyksIFtwa2cuY29tbWVudHNdKVxuICBjb25zdCBzaG93VmVyZGljdCA9IHBrZy52ZXJkaWN0ICE9PSBudWxsIHx8IHBrZy5maW5kaW5ncy5sZW5ndGggPiAwXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkXCIgZGF0YS10aW1lLWhvdmVyLXJvb3Q+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtaGVhZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWJhZGdlXCI+PEljb25Db21tZW50IC8+e3QoJ3Jldmlldy5jYXJkVGl0bGUnKX08L3NwYW4+XG4gICAgICAgIHt0YXJnZXRDd2QgPyAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC13b3Jrc3BhY2VcIiB0aXRsZT17dGFyZ2V0Q3dkfT57dGFyZ2V0Q3dkfTwvc3Bhbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAge3BrZy5jb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtbWV0YVwiPnt0KCdyZXZpZXcuY2FyZENvbW1lbnRzJywgeyBuOiBwa2cuY29tbWVudHMubGVuZ3RoIH0pfTwvc3Bhbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIHtncm91cHMubWFwKChnKSA9PiAoXG4gICAgICAgIDxkaXYga2V5PXtnLnBhdGh9IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZ3JvdXBcIj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLXBhdGhcIiB0aXRsZT17dCgncmV2aWV3LmNhcmRPcGVuRmlsZScpfSBvbkNsaWNrPXsoKSA9PiBqdW1wKGcucGF0aCl9PlxuICAgICAgICAgICAgPEljb25GaWxlIC8+PHNwYW4+e2cucGF0aH08L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAge2cuY29tbWVudHMubWFwKChjLCBpKSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtaXRlbVwiXG4gICAgICAgICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuY2FyZEp1bXAnKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ganVtcChjLnBhdGgsIGMubGluZSA/PyB1bmRlZmluZWQpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWxvY1wiPntjLmxpbmUgIT09IG51bGwgPyBgJHtjLnBhdGh9OiR7Yy5saW5lfWAgOiBgJHtjLnBhdGh9IChvbGQpYH08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtdGV4dFwiPntjLnRleHR9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSl9XG4gICAgICB7c2hvd1ZlcmRpY3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LXNlY1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LWhlYWRcIj5cbiAgICAgICAgICAgIDxzcGFuPnt0KCdyZXZpZXcuY2FyZFZlcmRpY3QnKX08L3NwYW4+XG4gICAgICAgICAgICB7cGtnLnZlcmRpY3QgPyAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItcmV2aWV3LWNhcmQtdmVyZGljdCBkc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtJHtwa2cudmVyZGljdH1gfT5cbiAgICAgICAgICAgICAgICB7cGtnLnZlcmRpY3QgPT09ICdjb3JyZWN0JyA/IHQoJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCcpIDogdCgncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnKX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3BrZy5maW5kaW5ncy5tYXAoKGY6IFJldmlld1BhY2thZ2VGaW5kaW5nLCBpOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWZpbmRpbmdcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLXRhZyBkc2RyLWZpbmRpbmctJHtmLnByaW9yaXR5fWB9PntmLnByaW9yaXR5fTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1maW5kaW5nLXRleHRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWZpbmRpbmctbG9jXCI+e2YuZmlsZX06e2YubGluZX08L3NwYW4+eycgJ31cbiAgICAgICAgICAgICAgICB7Zi50aXRsZX17Zi5kZXRhaWwgPyBgIFx1MjAxNCAke2YuZGV0YWlsfWAgOiAnJ31cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZm9vdFwiPnt0KCdyZXZpZXcuY2FyZEhpbnQnKX08L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogTmF0aXZlLWxvb2sgZmFsbGJhY2sgYnViYmxlIGZvciBvcmRpbmFyeSB1c2VyIG1lc3NhZ2VzIChzaGFkb3dlZCBjZWxsKS4gKi9cbmZ1bmN0aW9uIEZhbGxiYWNrVXNlckJ1YmJsZSh7XG4gIHRleHQsXG4gIGltYWdlcyxcbiAgbG9hZEltYWdlLFxuICB0LFxufToge1xuICB0ZXh0OiBzdHJpbmdcbiAgaW1hZ2VzOiByZWFkb25seSAoVXNlckJsb2NrICYgeyBhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYgfSlbXVxuICBsb2FkSW1hZ2U6IChhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYpID0+IFByb21pc2U8c3RyaW5nPlxuICB0OiBDYXJkVFxufSkge1xuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IG9uQ29weSA9ICgpID0+IHtcbiAgICB2b2lkIHdyaXRlQ2xpcGJvYXJkKHRleHQpLnRoZW4oKG9rKSA9PiB7XG4gICAgICBpZiAoIW9rKSByZXR1cm5cbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxMDAwKVxuICAgIH0pXG4gIH1cbiAgY29uc3QgbGFiZWxzID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoe1xuICAgICAgaW1hZ2U6IHQoJ2ZhbGxiYWNrLmltYWdlJyksXG4gICAgICBvcGVuOiB0KCdmYWxsYmFjay5vcGVuJyksXG4gICAgICBvcGVuTmFtZWQ6IChuYW1lOiBzdHJpbmcpID0+IHQoJ2ZhbGxiYWNrLm9wZW5OYW1lZCcsIHsgbmFtZSB9KSxcbiAgICAgIGxvYWRpbmc6IHQoJ2ZhbGxiYWNrLmxvYWRpbmcnKSxcbiAgICAgIGxvYWRGYWlsZWQ6IHQoJ2ZhbGxiYWNrLmxvYWRGYWlsZWQnKSxcbiAgICAgIGxpZ2h0Ym94OiB7IGRpYWxvZzogdCgnZmFsbGJhY2subGlnaHRib3hEaWFsb2cnKSwgY2xvc2U6IHQoJ2ZhbGxiYWNrLmxpZ2h0Ym94Q2xvc2UnKSB9LFxuICAgIH0pLFxuICAgIFt0XSxcbiAgKVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyXCIgZGF0YS10aW1lLWhvdmVyLXJvb3Q+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmFsbGJhY2stdXNlci1zdGFja1wiPlxuICAgICAgICB7aW1hZ2VzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgPEltYWdlR2FsbGVyeSBpbWFnZXM9e2ltYWdlc30gbG9hZD17bG9hZEltYWdlfSBhbGlnbj1cImVuZFwiIGxhYmVscz17bGFiZWxzfSAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge3RleHQgIT09ICcnID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyLXJvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXItYnViYmxlXCI+e3RleHR9PC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXItY29weVwiIHRpdGxlPXt0KCdyZXZpZXcuY29weScpfSBvbkNsaWNrPXtvbkNvcHl9PlxuICAgICAgICAgICAgICB7Y29waWVkID8gdCgncmV2aWV3LmNvcGllZCcpIDogPEljb25Db3B5IC8+fVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNvcHkoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cmVjdCB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB4PVwiOFwiIHk9XCI4XCIgcng9XCIyXCIgcnk9XCIyXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKipcbiAqIFVzZXItbm9kZSByZW5kZXJlciBzaGFkb3c6IGNhcnJpZWQgcmV2aWV3IHBhY2thZ2VzIHJlbmRlciBhcyBhIGNhcmQ7XG4gKiBldmVyeXRoaW5nIGVsc2UgcmVuZGVycyBhcyBhIG5hdGl2ZS1sb29rIGJ1YmJsZS5cbiAqL1xuZnVuY3Rpb24gVXNlclJldmlld05vZGVWaWV3KHByb3BzOiBVc2VyUmV2aWV3Tm9kZVByb3BzKSB7XG4gIGNvbnN0IGNvbnRlbnQgPSB1c2VNZW1vKCgpID0+IHByb3BzLm5vZGUuZGF0YS5jb250ZW50IGFzIHJlYWRvbmx5IFVzZXJCbG9ja1tdLCBbcHJvcHMubm9kZS5kYXRhLmNvbnRlbnRdKVxuICBjb25zdCB0ZXh0ID0gdXNlTWVtbygoKSA9PiB1c2VyTWVzc2FnZVRleHQoY29udGVudCksIFtjb250ZW50XSlcbiAgY29uc3QgaW1hZ2VzID0gdXNlTWVtbyhcbiAgICAoKSA9PiBjb250ZW50LmZpbHRlcigoYik6IGIgaXMgVXNlckJsb2NrICYgeyBhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYgfSA9PiBiLnR5cGUgPT09ICdpbWFnZScgJiYgYi5hdHRhY2htZW50ICE9PSB1bmRlZmluZWQpLFxuICAgIFtjb250ZW50XSxcbiAgKVxuICBjb25zdCBwa2cgPSB1c2VNZW1vKCgpID0+IChpc1Jldmlld1BhY2thZ2VUZXh0KHRleHQpID8gcGFyc2VSZXZpZXdQYWNrYWdlKHRleHQpIDogbnVsbCksIFt0ZXh0XSlcbiAgaWYgKHBrZykge1xuICAgIHJldHVybiA8UmV2aWV3UGFja2FnZUNhcmQgcGtnPXtwa2d9IGN3ZD17cHJvcHMuY3dkfSB0PXtwcm9wcy50fSAvPlxuICB9XG4gIHJldHVybiA8RmFsbGJhY2tVc2VyQnViYmxlIHRleHQ9e3RleHR9IGltYWdlcz17aW1hZ2VzfSBsb2FkSW1hZ2U9e3Byb3BzLmxvYWRJbWFnZX0gdD17cHJvcHMudH0gLz5cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb21wb3NlciBkb2NrIChzZXNzaW9uIHNjb3BlKTogcGVuZGluZyBpbmxpbmUgY29tbWVudHMgZmxvYXQgYWJvdmUgdGhlXG4vLyBpbnB1dCBib3gsIENvZGV4LXN0eWxlIFx1MjAxNCBob3ZlciB0aGUgcGlsbCB0byBwcmV2aWV3LCBjbGljayBzZW5kIHRvIGluamVjdC5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIERpZmZSZXZpZXdDb21wb3NlckRvY2tQcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLmlucHV0LmRvY2snPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYgeyBzZXNzaW9uczogSVNlc3Npb25zIH1cblxuZnVuY3Rpb24gRGlmZlJldmlld0NvbXBvc2VyRG9jayh7IHNlc3Npb25JZCwgdXNlU2Vzc2lvbnMsIHVzZVNlc3Npb24sIHNlc3Npb25zLCBpbnB1dCwgdCB9OiBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IHBlbmRpbmcgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwZW5kaW5nQ29tbWVudHNTdG9yZS5zdWJzY3JpYmUsIHBlbmRpbmdDb21tZW50c1N0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBbZGlzbWlzc2VkLCBzZXREaXNtaXNzZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYXJyeUZsYXNoLCBzZXRDYXJyeUZsYXNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGNhcnJpZWRJZHMgPSB1c2VSZWY8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgY2FycnlpbmcgPSB1c2VSZWYoZmFsc2UpXG5cbiAgLy8gU2VlZCB0aGUgc3RvcmUgZnJvbSBzZXJ2ZXIgc3RvcmFnZSB3aGVuIG5vdGhpbmcgaGFzIGJlZW4gc3luY2VkIGZvciB0aGlzXG4gIC8vIHdvcmtzcGFjZSB5ZXQgKHBhbmVsIG5ldmVyIG9wZW5lZCB0aGlzIHNlc3Npb24gXHUyMDE0IGNvbW1lbnRzIHBlcnNpc3QgaW4gLmdpdCkuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFjd2QgfHwgcGVuZGluZy5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCBsb2FkQ29tbWVudHMoY3dkKS50aGVuKChsaXN0KSA9PiB7XG4gICAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm5cbiAgICAgIHBlbmRpbmdDb21tZW50c1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICBpZiAoZC5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgICAgIGQuY3dkID0gY3dkXG4gICAgICAgIGQuY29tbWVudHMgPSBsaXN0XG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbY3dkLCBwZW5kaW5nLmN3ZF0pXG5cbiAgY29uc3QgY29tbWVudHMgPSBwZW5kaW5nLmN3ZCA9PT0gY3dkID8gcGVuZGluZy5jb21tZW50cyA6IFtdXG4gIGNvbnN0IHNlbnRTbmFwID0gdXNlU3luY0V4dGVybmFsU3RvcmUoc2VudFN0b3JlLnN1YnNjcmliZSwgc2VudFN0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBzZW50ID0gKGN3ZCAmJiBzZW50U25hcFtjd2RdKSB8fCB7IHNlbnRDb21tZW50SWRzOiBbXSwgc2VudFJldmlld0tleTogbnVsbCB9XG4gIGNvbnN0IHNlbnRTZXQgPSBuZXcgU2V0KHNlbnQuc2VudENvbW1lbnRJZHMpXG4gIGNvbnN0IHVuc2VudENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiAhc2VudFNldC5oYXMoYy5pZCkpXG4gIGNvbnN0IHJldmlld0tleSA9XG4gICAgcGVuZGluZy5yZXZpZXc/Lm9rICYmIChwZW5kaW5nLnJldmlldy5maW5kaW5ncy5sZW5ndGggPiAwIHx8IHBlbmRpbmcucmV2aWV3LnZlcmRpY3QpXG4gICAgICA/IGAke3BlbmRpbmcucmV2aWV3LnZlcmRpY3QgPz8gJyd9OiR7cGVuZGluZy5yZXZpZXcuZmluZGluZ3MubGVuZ3RofToke3BlbmRpbmcucmV2aWV3LmZpbmRpbmdzWzBdPy50aXRsZSA/PyAnJ31gXG4gICAgICA6IG51bGxcbiAgY29uc3QgcmV2aWV3UGVuZGluZyA9IHJldmlld0tleSAhPT0gbnVsbCAmJiByZXZpZXdLZXkgIT09IHNlbnQuc2VudFJldmlld0tleVxuICBjb25zdCBoYXNQZW5kaW5nID0gdW5zZW50Q29tbWVudHMubGVuZ3RoID4gMCB8fCByZXZpZXdQZW5kaW5nXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWhhc1BlbmRpbmcpIHtcbiAgICAgIHNldERpc21pc3NlZChmYWxzZSlcbiAgICB9XG4gIH0sIFtoYXNQZW5kaW5nXSlcblxuICAvKiogQ29tcG9zZSB0aGUgZnVsbCByZXZpZXcgcGFja2FnZTogY29tbWVudHMgKyB0aGVpciBkaWZmIGh1bmtzICsgQUkgdmVyZGljdC4gKi9cbiAgY29uc3QgY29tcG9zZUNhcnJpZWRNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gWydcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLCBgXHU1REU1XHU0RjVDXHU1MzNBXHVGRjFBJHtjd2R9YCwgJyddXG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0NvbW1lbnRbXT4oKVxuICAgIGZvciAoY29uc3QgYyBvZiB1bnNlbnRDb21tZW50cykge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoYy5wYXRoKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChjKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGMucGF0aCwgW2NdKVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBjIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgICAgbGluZXMucHVzaChgLSAke3BhdGh9JHthbmNob3J9OiAke2MudGV4dH1gKVxuICAgICAgfVxuICAgICAgY29uc3QgaHVua3MgPSBodW5rc0ZvckxpbmVzKHBlbmRpbmcuZGlmZnNbcGF0aF0gPz8gJycsIGxpc3QubWFwKChjKSA9PiBjLmxpbmVOZXcgPz8gYy5saW5lT2xkKSlcbiAgICAgIGlmIChodW5rcykge1xuICAgICAgICBsaW5lcy5wdXNoKCdgYGBkaWZmJylcbiAgICAgICAgbGluZXMucHVzaChodW5rcylcbiAgICAgICAgbGluZXMucHVzaCgnYGBgJylcbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpXG4gICAgfVxuICAgIGlmIChyZXZpZXdQZW5kaW5nICYmIHBlbmRpbmcucmV2aWV3KSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkEnKVxuICAgICAgbGluZXMucHVzaChwZW5kaW5nLnJldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/ICdcdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OThcdUZGMDhQYXRjaCBpcyBpbmNvcnJlY3RcdUZGMDknIDogJ1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RVx1RkYwOFBhdGNoIGlzIGNvcnJlY3RcdUZGMDknKVxuICAgICAgZm9yIChjb25zdCBmIG9mIHBlbmRpbmcucmV2aWV3LmZpbmRpbmdzKSB7XG4gICAgICAgIGxpbmVzLnB1c2goYC0gWyR7Zi5wcmlvcml0eX1dICR7Zi5maWxlfToke2YubGluZVN0YXJ0fSR7Zi5saW5lRW5kICE9PSBmLmxpbmVTdGFydCA/IGAtJHtmLmxpbmVFbmR9YCA6ICcnfSAke2YudGl0bGV9IFx1MjAxNCAke2YuZGV0YWlsfWApXG4gICAgICAgIGlmIChmLnN1Z2dlc3Rpb24pIGxpbmVzLnB1c2goYCAgXFxgXFxgXFxgXFxuJHtmLnN1Z2dlc3Rpb259XFxuICBcXGBcXGBcXGBgKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykuc2xpY2UoMCwgMTYwMDApXG4gIH1cblxuICAvLyBDb2RleC1zdHlsZSBhdXRvLWNhcnJ5OiB3aGVuIHRoZSB1c2VyIHN1Ym1pdHMgYSBtZXNzYWdlIHdoaWxlIGNvbW1lbnRzIGFyZVxuICAvLyBwZW5kaW5nLCBzdGVlciB0aGUgZnVsbCByZXZpZXcgcGFja2FnZSBpbnRvIHRoZSB0dXJuIHJpZ2h0IGJlaGluZCBpdCBcdTIwMTQgdGhlXG4gIC8vIGFnZW50IGhhbmRsZXMgaXQgb24gaXRzIG5leHQgc3RlcCwgd2l0aCBubyBxdWV1ZWQtaXRlbSBzdHJpcCBhYm92ZSB0aGUgaW5wdXQuXG4gIC8qKiBNYXJrIHRoZSBjYXJyaWVkIGl0ZW1zIGFzIHNlbnQgc28gdGhleSBhcmUgbmV2ZXIgcmUtc2VudCAocGVyc2lzdGVkIHBlciBjd2QpLiAqL1xuICBjb25zdCBtYXJrU2VudCA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgY29uc3QgY2FycmllZElkcyA9IHVuc2VudENvbW1lbnRzLm1hcCgoYykgPT4gYy5pZClcbiAgICBzZW50U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBjb25zdCBwcmV2ID0gZFtjd2RdID8/IHsgc2VudENvbW1lbnRJZHM6IFtdLCBzZW50UmV2aWV3S2V5OiBudWxsIH1cbiAgICAgIGRbY3dkXSA9IHtcbiAgICAgICAgc2VudENvbW1lbnRJZHM6IFsuLi5uZXcgU2V0KFsuLi5wcmV2LnNlbnRDb21tZW50SWRzLCAuLi5jYXJyaWVkSWRzXSldLFxuICAgICAgICBzZW50UmV2aWV3S2V5OiByZXZpZXdQZW5kaW5nID8gcmV2aWV3S2V5IDogcHJldi5zZW50UmV2aWV3S2V5LFxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBwaGFzZSA9IGlucHV0Py5waGFzZVxuICBjb25zdCBydW5uaW5nID0gdXNlU2Vzc2lvbigocykgPT4gcy5ydW5uaW5nKVxuICBjb25zdCB1c2VyQ291bnQgPSB1c2VTZXNzaW9uKChzKSA9PiBzLm5vZGVzLmZpbHRlcigobikgPT4gbi5raW5kID09PSAndXNlcicpLmxlbmd0aClcbiAgY29uc3QgcHJldlJ1bm5pbmcgPSB1c2VSZWYocnVubmluZylcbiAgY29uc3QgcHJldlVzZXJDb3VudCA9IHVzZVJlZih1c2VyQ291bnQpXG4gIC8qKiBTZW5kIHRoZSBwZW5kaW5nIHJldmlldyBwYWNrYWdlIG5vdyAoZG9jayBidXR0b24gb3IgYXV0by1jYXJyeSkuICovXG4gIGNvbnN0IGNhcnJ5ID0gKCkgPT4ge1xuICAgIGlmICghaGFzUGVuZGluZyB8fCBjYXJyeWluZy5jdXJyZW50KSByZXR1cm5cbiAgICBjYXJyeWluZy5jdXJyZW50ID0gdHJ1ZVxuICAgIHZvaWQgaW5qZWN0VG9TZXNzaW9uKHNlc3Npb25zLCBzZXNzaW9uSWQsIGNvbXBvc2VDYXJyaWVkTWVzc2FnZSgpKS50aGVuKChvdXRjb21lKSA9PiB7XG4gICAgICBpZiAob3V0Y29tZSAhPT0gJ2ZhaWxlZCcpIG1hcmtTZW50KClcbiAgICAgIGNhcnJ5aW5nLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgc2V0Q2FycnlGbGFzaChvdXRjb21lID09PSAnc2VudCcgPyB0KCdyZXZpZXcuc2VudFRvQWdlbnQnKSA6IG91dGNvbWUgPT09ICdjb3BpZWQnID8gdCgncmV2aWV3LmNvcGllZEZhbGxiYWNrJykgOiB0KCdyZXZpZXcuc2VuZEZhaWxlZCcpKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDYXJyeUZsYXNoKG51bGwpLCAzMjAwKVxuICAgIH0pXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHR1cm5TdGFydGVkID0gcHJldlJ1bm5pbmcuY3VycmVudCA9PT0gZmFsc2UgJiYgcnVubmluZyA9PT0gdHJ1ZVxuICAgIHByZXZSdW5uaW5nLmN1cnJlbnQgPSBydW5uaW5nXG4gICAgY29uc3QgbmV3VXNlck1zZyA9IHByZXZVc2VyQ291bnQuY3VycmVudCA8IHVzZXJDb3VudFxuICAgIHByZXZVc2VyQ291bnQuY3VycmVudCA9IHVzZXJDb3VudFxuICAgIGNvbnN0IHBoYXNlSGl0ID0gcGhhc2UgPT09ICdzdWJtaXR0aW5nJyB8fCBwaGFzZSA9PT0gJ2FkanVkaWNhdGluZydcbiAgICBpZiAoIWhhc1BlbmRpbmcpIHJldHVyblxuICAgIGlmICghdHVyblN0YXJ0ZWQgJiYgIW5ld1VzZXJNc2cgJiYgIXBoYXNlSGl0KSByZXR1cm5cbiAgICBjYXJyeSgpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbcnVubmluZywgdXNlckNvdW50LCBwaGFzZSwgaGFzUGVuZGluZ10pXG5cbiAgaWYgKCFjd2QgfHwgKCFoYXNQZW5kaW5nICYmICFjYXJyeUZsYXNoKSB8fCBkaXNtaXNzZWQpIHJldHVybiBudWxsXG5cbiAgLyoqIE9wZW4gdGhlIHJldmlldyBwYW5lbCBhdCB0aGUgY29tbWVudCdzIGNoYW5nZSBibG9jay4gKi9cbiAgY29uc3QgZm9jdXNDb21tZW50ID0gKGNvbW1lbnQ6IFJldmlld0NvbW1lbnQpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5mb2N1cyA9IHtcbiAgICAgICAgcGF0aDogY29tbWVudC5wYXRoLFxuICAgICAgICBsaW5lOiBjb21tZW50LmxpbmVOZXcgPz8gY29tbWVudC5saW5lT2xkID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGFiOiBjb21tZW50LnNvdXJjZSA9PT0gJ3Nlc3Npb24nID8gJ3Nlc3Npb24nIDogJ3dvcmtzcGFjZScsXG4gICAgICB9XG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cblxuICAvKiogT3BlbiB0aGUgcmV2aWV3IHBhbmVsIHdpdGhvdXQgYSBqdW1wIHRhcmdldCAoK04gY2hpcCkuICovXG4gIGNvbnN0IG9wZW5QYW5lbCA9ICgpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5mb2N1cyA9IG51bGxcbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2tcIj5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWhlYWRcIlxuICAgICAgICByb2xlPVwiYnV0dG9uXCJcbiAgICAgICAgdGFiSW5kZXg9ezB9XG4gICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuZG9ja1NlbmQnKX1cbiAgICAgICAgb25DbGljaz17Y2Fycnl9XG4gICAgICAgIG9uS2V5RG93bj17KGUpID0+IHtcbiAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgfHwgZS5rZXkgPT09ICcgJykge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBjYXJyeSgpXG4gICAgICAgICAgfVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2staWNvblwiPjxJY29uQ29tbWVudCAvPjwvc3Bhbj5cbiAgICAgICAge2NhcnJ5Rmxhc2ggPyAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWZsYXNoXCI+e2NhcnJ5Rmxhc2h9PC9zcGFuPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1jb3VudFwiPlxuICAgICAgICAgICAge3QoJ3Jldmlldy5kb2NrQ29tbWVudHMnLCB7IG46IHVuc2VudENvbW1lbnRzLmxlbmd0aCB9KX1cbiAgICAgICAgICAgIHtyZXZpZXdQZW5kaW5nID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuZG9ja1ZlcmRpY3QnKX1gIDogJyd9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1zZW5kLWhpbnRcIj57dCgncmV2aWV3LmRvY2tTZW5kJyl9PC9zcGFuPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNsb3NlXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPXt0KCdjb21tZW50LmNhbmNlbCcpfVxuICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBzZXREaXNtaXNzZWQodHJ1ZSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEljb25YIC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICB7dW5zZW50Q29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2hpcHNcIj5cbiAgICAgICAgICB7dW5zZW50Q29tbWVudHMuc2xpY2UoMCwgTUFYX0RPQ0tfQ0hJUFMpLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e2NvbW1lbnQuaWR9XG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2hpcFwiXG4gICAgICAgICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuZG9ja0p1bXAnKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZm9jdXNDb21tZW50KGNvbW1lbnQpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2hpcC1sb2NcIj57Y29tbWVudC5wYXRofXtjb21tZW50LmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Y29tbWVudC5saW5lTmV3fWAgOiAnJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwLXRleHRcIj57Y29tbWVudC50ZXh0fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkpfVxuICAgICAgICAgIHt1bnNlbnRDb21tZW50cy5sZW5ndGggPiBNQVhfRE9DS19DSElQUyA/IChcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwLW1vcmVcIiB0aXRsZT17dCgncmV2aWV3LmRvY2tNb3JlJywgeyBuOiB1bnNlbnRDb21tZW50cy5sZW5ndGggLSBNQVhfRE9DS19DSElQUyB9KX0gb25DbGljaz17b3BlblBhbmVsfT5cbiAgICAgICAgICAgICAgK3t1bnNlbnRDb21tZW50cy5sZW5ndGggLSBNQVhfRE9DS19DSElQU31cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IG92ZXJsYXkgKHJvb3Qgc2NvcGUpOiBzZXNzaW9uICsgd29ya3NwYWNlIHRhYnMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gRGlmZlJldmlld092ZXJsYXkoeyBzZXNzaW9ucywgdCB9OiBEaWZmUmV2aWV3T3ZlcmxheVByb3BzKSB7XG4gIGNvbnN0IHN0b3JlU3RhdGUgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShvdmVybGF5U3RvcmUuc3Vic2NyaWJlLCBvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IHByZWZzID0gdXNlU3luY0V4dGVybmFsU3RvcmUocHJlZnNTdG9yZS5zdWJzY3JpYmUsIHByZWZzU3RvcmUuZ2V0U25hcHNob3QpXG4gIC8vIEdpdC1maXJzdDogbGFuZCBvbiB0aGUgd29ya3NwYWNlIHRhYiAoc3RhZ2VkL3Vuc3RhZ2VkL2JyYW5jaCB0cmVlcykgc28gdGhlXG4gIC8vIGNoYW5nZSByZXZpZXcgaXMgb25lIGNsaWNrIGF3YXk7IHRoZSBzZXNzaW9uIHRhYiBzdGF5cyBhIGNsaWNrIGF3YXkuXG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSB1c2VTdGF0ZTwnc2Vzc2lvbicgfCAnd29ya3NwYWNlJz4oJ3dvcmtzcGFjZScpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IHVzZVN0YXRlPFZpZXdNb2RlPigoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJyAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZHNkci12aWV3JykgPT09ICdzcGxpdCcgPyAnc3BsaXQnIDogJ3NpbmdsZSdcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiAnc2luZ2xlJ1xuICAgIH1cbiAgfSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RzZHItdmlldycsIHZpZXcpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBwcml2YXRlIG1vZGUgLyB1bmF2YWlsYWJsZSBcdTIwMTQgbm9uLWZhdGFsXG4gICAgfVxuICB9LCBbdmlld10pXG5cbiAgLy8gV29ya3NwYWNlIHRhYiBzdGF0ZS5cbiAgY29uc3QgW3N0YXR1cywgc2V0U3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW25vdGljZSwgc2V0Tm90aWNlXSA9IHVzZVN0YXRlPHsga2luZDogJ29rJyB8ICdlcnJvcic7IHRleHQ6IHN0cmluZyB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbmZpcm0sIHNldENvbmZpcm1dID0gdXNlU3RhdGU8J2ZpbGUnIHwgJ2FsbCcgfCAncHVzaCcgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0TWVzc2FnZSwgc2V0Q29tbWl0TWVzc2FnZV0gPSB1c2VTdGF0ZSgnJylcbiAgLy8gTG9jYWwgKHVucHVzaGVkKSBjb21taXQgaGlzdG9yeTogbGlzdCArIHBlci1jb21taXQgZGlmZiB2aWV3LlxuICBjb25zdCBbaGlzdG9yeSwgc2V0SGlzdG9yeV0gPSB1c2VTdGF0ZTxDb21taXRJbmZvW10+KFtdKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXQsIHNldFNlbGVjdGVkQ29tbWl0XSA9IHVzZVN0YXRlPENvbW1pdEluZm8gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZiwgc2V0Q29tbWl0RGlmZl0gPSB1c2VTdGF0ZTxDb21taXREaWZmUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZkxvYWRpbmcsIHNldENvbW1pdERpZmZMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXRGaWxlLCBzZXRTZWxlY3RlZENvbW1pdEZpbGVdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgLy8gSW5saW5lIHJldmlldyBjb21tZW50cyAod29ya3NwYWNlIHRhYiwgc2luZ2xlIHZpZXcpLlxuICBjb25zdCBbY29tbWVudHMsIHNldENvbW1lbnRzXSA9IHVzZVN0YXRlPFJldmlld0NvbW1lbnRbXT4oW10pXG4gIGNvbnN0IFtjb21tZW50RWRpdG9yLCBzZXRDb21tZW50RWRpdG9yXSA9IHVzZVN0YXRlPHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1lbnRUZXh0LCBzZXRDb21tZW50VGV4dF0gPSB1c2VTdGF0ZSgnJylcbiAgLy8gUmV2aWV3IHNjb3BlOiB3aGljaCBzbGljZSBvZiB0aGUgcmVwb3NpdG9yeSB0aGUgd29ya3NwYWNlIHRhYiBzaG93cy5cbiAgY29uc3QgW3Njb3BlLCBzZXRTY29wZV0gPSB1c2VTdGF0ZTxXb3Jrc3BhY2VTY29wZT4oJ2FsbCcpXG4gIGNvbnN0IFticmFuY2hlcywgc2V0QnJhbmNoZXNdID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKVxuICBjb25zdCBbYmFzZUJyYW5jaCwgc2V0QmFzZUJyYW5jaF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbYmFzZVN0YXR1cywgc2V0QmFzZVN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIC8vIEZlZWRiYWNrIGxvb3A6IHNlbmQgaW5saW5lIGNvbW1lbnRzIHRvIHRoZSBhZ2VudCAoc2Vzc2lvbi5wcm9tcHQsIGNvcHkgZmFsbGJhY2spLlxuICBjb25zdCBbc2VuZE9wZW4sIHNldFNlbmRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VuZFRleHQsIHNldFNlbmRUZXh0XSA9IHVzZVN0YXRlKCcnKVxuICAvLyBBSSByZXZpZXcgKC9yZXZpZXcpOiBmaW5kaW5ncyArIHZlcmRpY3QuXG4gIGNvbnN0IFtyZXZpZXcsIHNldFJldmlld10gPSB1c2VTdGF0ZTxSZXZpZXdSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtyZXZpZXdpbmcsIHNldFJldmlld2luZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgLy8gR2l0SHViIFBSIGNvbnRleHQgKGdoIENMSSkuXG4gIGNvbnN0IFtwciwgc2V0UHJdID0gdXNlU3RhdGU8UHJSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIC8vIE11bHRpLXJlcG86IHJlcG9zIGRldGVjdGVkIHVuZGVyIHRoZSB3b3Jrc3BhY2UgKyB0aGUgc2VsZWN0ZWQgb25lLlxuICBjb25zdCBbcmVwb3MsIHNldFJlcG9zXSA9IHVzZVN0YXRlPHsgcGF0aDogc3RyaW5nOyBicmFuY2g6IHN0cmluZyB8IG51bGwgfVtdPihbXSlcbiAgY29uc3QgW3JlcG9QYXRoLCBzZXRSZXBvUGF0aF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBUZW1wb3JhcnkgbGluZSBoaWdobGlnaHQgKGp1bXAgdGFyZ2V0IGZyb20gYSBQUiBjb21tZW50IG9yIGEgZmluZGluZykuXG4gIGNvbnN0IFtqdW1wTGluZSwgc2V0SnVtcExpbmVdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcblxuICAvKiogU2VsZWN0IGEgZmlsZSBhbmQgZmxhc2ggaXRzIGxpbmUgKGZpbmRpbmdzIC8gUFIgY29tbWVudHMpLiAqL1xuICBjb25zdCBqdW1wVG8gPSAoZmlsZTogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWQoZmlsZSlcbiAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICBzZXRKdW1wTGluZShsaW5lID8/IG51bGwpXG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgfVxuICAvLyBDb2xsYXBzZWQgZGlyZWN0b3JpZXMgaW4gdGhlIGxlZnQtaGFuZCBmaWxlIHRyZWUgKHNoYXJlZCBhY3Jvc3MgdGFicykuXG4gIGNvbnN0IFtjb2xsYXBzZWREaXJzLCBzZXRDb2xsYXBzZWREaXJzXSA9IHVzZVN0YXRlPFJlYWRvbmx5U2V0PHN0cmluZz4+KCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgdG9nZ2xlRGlyID0gdXNlTWVtbyhcbiAgICAoKSA9PiAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBzZXRDb2xsYXBzZWREaXJzKChwcmV2KSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpXG4gICAgICAgIGlmIChuZXh0LmhhcyhwYXRoKSkgbmV4dC5kZWxldGUocGF0aClcbiAgICAgICAgZWxzZSBuZXh0LmFkZChwYXRoKVxuICAgICAgICByZXR1cm4gbmV4dFxuICAgICAgfSlcbiAgICB9LFxuICAgIFtdLFxuICApXG4gIGNvbnN0IG5vdGljZVRpbWVyID0gdXNlUmVmPFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkPih1bmRlZmluZWQpXG5cbiAgLy8gQ3VycmVudCBzZXNzaW9uJ3MgY29udmVyc2F0aW9uIHNuYXBzaG90IChyZWFjdGl2ZSksIGZvciB0aGUgc2Vzc2lvbiB0YWIuXG4gIGNvbnN0IGN1cnJlbnRJZCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4gKG5vdGlmeTogKCkgPT4gdm9pZCkgPT4gc2Vzc2lvbnMubGlzdC5zdWJzY3JpYmUobm90aWZ5KSwgW3Nlc3Npb25zXSksXG4gICAgdXNlTWVtbygoKSA9PiAoKSA9PiBzZXNzaW9ucy5saXN0LmdldFNuYXBzaG90KCkuY3VycmVudCwgW3Nlc3Npb25zXSksXG4gIClcbiAgY29uc3Qgc25hcHNob3QgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgaWYgKCFiaW5kaW5nKSByZXR1cm4gKCkgPT4ge31cbiAgICAgICAgcmV0dXJuIGJpbmRpbmcuc2Vzc2lvbi5zdWJzY3JpYmUobm90aWZ5KVxuICAgICAgfVxuICAgIH0sIFtzZXNzaW9ucywgY3VycmVudElkXSksXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiBiaW5kaW5nID8gYmluZGluZy5zZXNzaW9uLmdldFNuYXBzaG90KCkgOiBudWxsXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgKVxuXG4gIGNvbnN0IHJvdW5kcyA9IHVzZU1lbW8oKCkgPT4gKHNuYXBzaG90ID8gY29sbGVjdFNlc3Npb25Sb3VuZHMoc25hcHNob3Qubm9kZXMpIDogW10pLCBbc25hcHNob3RdKVxuICAvLyBMYXN0IHVzZXItbWVzc2FnZSB0aW1lc3RhbXAgXHUyMDE0IHRoZSBMYXN0LXR1cm4gc2NvcGUgZmFsbHMgYmFjayB0byBmaWxlcyB3aG9zZVxuICAvLyBtdGltZSBpcyBhZnRlciBpdCB3aGVuIHRoZSBzZXNzaW9uIGxvZyBoYXMgbm8gcmVjb3JkZWQgZGlmZiAoYmFzaCBlZGl0cykuXG4gIGNvbnN0IGxhc3RVc2VyVGltZSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghc25hcHNob3QpIHJldHVybiAwXG4gICAgbGV0IHQgPSAwXG4gICAgZm9yIChjb25zdCBuIG9mIHNuYXBzaG90Lm5vZGVzKSB7XG4gICAgICBpZiAobi5raW5kID09PSAndXNlcicgJiYgbi50aW1lID4gdCkgdCA9IG4udGltZVxuICAgIH1cbiAgICByZXR1cm4gdFxuICB9LCBbc25hcHNob3RdKVxuICAvLyBEaWFnbm9zdGljcyBmb3IgdGhlIGVtcHR5IHNlc3Npb24tY2hhbmdlcyBzdGF0ZTogd2hhdCB0aGUgc25hcHNob3Qgc2NhbiBmb3VuZC5cbiAgY29uc3Qgc2Vzc2lvblNjYW4gPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm4gbnVsbFxuICAgIGxldCByZXN1bHRzID0gMFxuICAgIGxldCBkaWZmQ2FyZHMgPSAwXG4gICAgbGV0IHBhdGhPbmx5ID0gMFxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBzbmFwc2hvdC5ub2Rlcykge1xuICAgICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JykgY29udGludWVcbiAgICAgIHJlc3VsdHMrK1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpXG4gICAgICBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChjaGFuZ2VzLnNvbWUoKHgpID0+IHguaGFzRGlmZikpIGRpZmZDYXJkcysrXG4gICAgICAgIGVsc2UgcGF0aE9ubHkrK1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyByZXN1bHRzLCBkaWZmQ2FyZHMsIHBhdGhPbmx5IH1cbiAgfSwgW3NuYXBzaG90XSlcbiAgLy8gTGVmdC1oYW5kIGZpbGUgdHJlZXM6IHBlci1yb3VuZCB0cmVlcyBmb3IgdGhlIHNlc3Npb24gdGFiLCBvbmUgdHJlZSBmb3JcbiAgLy8gdGhlIGdpdCB3b3JraW5nIHRyZWUgb24gdGhlIHdvcmtzcGFjZSB0YWIuXG4gIGNvbnN0IHNlc3Npb25UcmVlcyA9IHVzZU1lbW8oKCkgPT4gbmV3IE1hcChyb3VuZHMubWFwKChyKSA9PiBbci5yb3VuZCwgYnVpbGRGaWxlVHJlZShyLmNoYW5nZXMsIChjKSA9PiBjLnBhdGgpXSkpLCBbcm91bmRzXSlcbiAgY29uc3QgdG90YWxTZXNzaW9uRmlsZXMgPSB1c2VNZW1vKCgpID0+IHJvdW5kcy5yZWR1Y2UoKG4sIHIpID0+IG4gKyByLmNoYW5nZXMubGVuZ3RoLCAwKSwgW3JvdW5kc10pXG4gIGNvbnN0IFtzZWxlY3RlZFJvdW5kLCBzZXRTZWxlY3RlZFJvdW5kXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzZWxlY3RlZFBhdGgsIHNldFNlbGVjdGVkUGF0aF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBzZWxlY3RlZENoYW5nZSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IHJvdW5kID0gcm91bmRzLmZpbmQoKHIpID0+IHIucm91bmQgPT09IHNlbGVjdGVkUm91bmQpXG4gICAgcmV0dXJuIHJvdW5kPy5jaGFuZ2VzLmZpbmQoKGMpID0+IGMucGF0aCA9PT0gc2VsZWN0ZWRQYXRoKSA/PyBudWxsXG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmQsIHNlbGVjdGVkUGF0aF0pXG5cbiAgY29uc3QgY3dkID0gc3RvcmVTdGF0ZS5jd2RcbiAgLyoqIEFjdGl2ZSBnaXQgcmVwbyBmb3Igd29ya3NwYWNlIG9wZXJhdGlvbnMgKG11bHRpLXJlcG8gc2VsZWN0b3Igb3ZlcnJpZGUpLiAqL1xuICBjb25zdCBhY3RpdmVDd2QgPSByZXBvUGF0aCA/PyBjd2RcblxuICBjb25zdCBsb2FkV29ya3NwYWNlID0gYXN5bmMgKHNpbGVudCA9IGZhbHNlKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QpIHJldHVyblxuICAgIGlmICghc2lsZW50KSBzZXRMb2FkaW5nKHRydWUpXG4gICAgc2V0RXJyb3IobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgW25leHQsIGhpc3QsIG5leHRDb21tZW50cywgYnJhbmNoTGlzdCwgcHJEYXRhLCByZXBvTGlzdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGxvYWRTdGF0dXMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEhpc3RvcnkoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZENvbW1lbnRzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRCcmFuY2hlcyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUHIoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZFJlcG9zKGFjdGl2ZUN3ZCksXG4gICAgICBdKVxuICAgICAgc2V0U3RhdHVzKG5leHQpXG4gICAgICBpZiAoaGlzdC5vaykgc2V0SGlzdG9yeShoaXN0LmNvbW1pdHMpXG4gICAgICBzZXRDb21tZW50cyhuZXh0Q29tbWVudHMpXG4gICAgICBzZXRCcmFuY2hlcyhicmFuY2hMaXN0KVxuICAgICAgc2V0UHIocHJEYXRhKVxuICAgICAgc2V0UmVwb3MocmVwb0xpc3QucmVwb3MpXG4gICAgICAvLyBEZWZhdWx0IHRoZSByZXBvIHNlbGVjdG9yIHRvIHRoZSB3b3Jrc3BhY2Ugcm9vdCB3aGVuIGl0IGlzIGl0c2VsZiBhIHJlcG8uXG4gICAgICBpZiAocmVwb1BhdGggPT09IG51bGwgJiYgIXJlcG9MaXN0LnJlcG9zLnNvbWUoKHIpID0+IHIucGF0aCA9PT0gYWN0aXZlQ3dkKSkge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHJlcG9MaXN0LnJlcG9zWzBdXG4gICAgICAgIGlmIChmaXJzdCAmJiBmaXJzdC5wYXRoICE9PSBjd2QpIHNldFJlcG9QYXRoKGZpcnN0LnBhdGgpXG4gICAgICB9XG4gICAgICBpZiAobmV4dC5lcnJvciAmJiAhbmV4dC5pc1JlcG8pIHNldEVycm9yKG5leHQuZXJyb3IpXG4gICAgICBzZXRTZWxlY3RlZCgocHJldikgPT4gKHByZXYgJiYgbmV4dC5maWxlcy5zb21lKChmKSA9PiBmLnBhdGggPT09IHByZXYpID8gcHJldiA6IG5leHQuZmlsZXNbMF0/LnBhdGggPz8gbnVsbCkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0RXJyb3IoZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIEF1dG8tcmVmcmVzaCB0aGUgd29ya3NwYWNlIGRhdGE6IHJlbG9hZCB3aGVuZXZlciB0aGUgdGFiIGJlY29tZXMgYWN0aXZlIG9yXG4gIC8vIHRoZSB3b3Jrc3BhY2UgY2hhbmdlcywgYW5kIHBlcmlvZGljYWxseSB3aGlsZSB0aGUgb3ZlcmxheSBpcyBvcGVuLiBBXG4gIC8vIHdvcmtzcGFjZSBzd2l0Y2ggY2xlYXJzIHN0YWxlIGNvbW1pdCBzZWxlY3Rpb24gYW5kIGhpc3RvcnkgZmlyc3QuXG4gIGNvbnN0IHdvcmtzcGFjZUN3ZFJlZiA9IHVzZVJlZjxzdHJpbmcgfCBudWxsPihudWxsKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHByZXZpb3VzID0gd29ya3NwYWNlQ3dkUmVmLmN1cnJlbnRcbiAgICB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudCA9IGFjdGl2ZUN3ZCA/PyBudWxsXG4gICAgaWYgKHRhYiAhPT0gJ3dvcmtzcGFjZScgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKHByZXZpb3VzICE9PSBhY3RpdmVDd2QpIHtcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICAgIHNldEhpc3RvcnkoW10pXG4gICAgICBzZXRDb21tZW50cyhbXSlcbiAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgIHNldFJldmlldyhudWxsKVxuICAgICAgc2V0UHIobnVsbClcbiAgICB9XG4gICAgdm9pZCBsb2FkV29ya3NwYWNlKClcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFt0YWIsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gU3VyZmFjZSB3b3Jrc3BhY2UgY29tbWVudHMgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSBkb2NrKSwgYWxvbmdcbiAgLy8gd2l0aCB0aGUgZGlmZiBjb250ZXh0IGFuZCB0aGUgbGFzdCBBSSByZXZpZXcgcmVzdWx0LlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHBlbmRpbmdDb21tZW50c1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5jd2QgPSBhY3RpdmVDd2QgPz8gbnVsbFxuICAgICAgZC5jb21tZW50cyA9IGNvbW1lbnRzXG4gICAgICBjb25zdCBkaWZmczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG4gICAgICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHN0YXR1cz8uZmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBjLnBhdGgpXG4gICAgICAgIGlmIChmaWxlPy5kaWZmKSBkaWZmc1tjLnBhdGhdID0gZmlsZS5kaWZmXG4gICAgICB9XG4gICAgICBkLmRpZmZzID0gZGlmZnNcbiAgICAgIGQucmV2aWV3ID0gcmV2aWV3XG4gICAgfSlcbiAgfSwgW2NvbW1lbnRzLCBhY3RpdmVDd2QsIHN0YXR1cywgcmV2aWV3XSlcblxuICAvLyBKdW1wIHRvIGEgY2hhbmdlIGJsb2NrIGZyb20gdGhlIGNvbXBvc2VyIGRvY2sgKGNvbW1lbnQgY2xpY2spLiBDb21tZW50c1xuICAvLyBjcmVhdGVkIGluIHRoZSBzZXNzaW9uIHRhYiBhbmNob3IgdG8gUkVMQVRJVkUgaHVuayBsaW5lcywgc28gdGhvc2UganVtcHNcbiAgLy8gc3RheSBpbiB0aGUgc2Vzc2lvbiB0YWI7IHdvcmtzcGFjZSBjb21tZW50cyBqdW1wIHRvIHJlYWwgZmlsZSBsaW5lcy5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmb2N1cyA9IHN0b3JlU3RhdGUuZm9jdXNcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkIHx8ICFmb2N1cykgcmV0dXJuXG4gICAgaWYgKGZvY3VzLnRhYiA9PT0gJ3Nlc3Npb24nKSB7XG4gICAgICAvLyBTZXNzaW9uLXRhYiBqdW1wOiBwaWNrIHRoZSBtb3N0IHJlY2VudCByb3VuZCB0aGF0IGNoYW5nZWQgdGhpcyBmaWxlLlxuICAgICAgbGV0IHRhcmdldFJvdW5kOiBTZXNzaW9uUm91bmQgfCBudWxsID0gbnVsbFxuICAgICAgbGV0IHRhcmdldENoYW5nZTogUm91bmRDaGFuZ2UgfCBudWxsID0gbnVsbFxuICAgICAgZm9yIChsZXQgaSA9IHJvdW5kcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBjaGFuZ2UgPSByb3VuZHNbaV0uY2hhbmdlcy5maW5kKChjKSA9PiB7XG4gICAgICAgICAgaWYgKGMucGF0aCA9PT0gZm9jdXMucGF0aCkgcmV0dXJuIHRydWVcbiAgICAgICAgICBpZiAoaXNBYnNQYXRoKGMucGF0aCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlbCA9IGMucGF0aC5zdGFydHNXaXRoKGN3ZCkgPyBjLnBhdGguc2xpY2UoY3dkLmxlbmd0aCkucmVwbGFjZSgvXltcXFxcL10rLywgJycpIDogYy5wYXRoXG4gICAgICAgICAgICBpZiAocmVsID09PSBmb2N1cy5wYXRoKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYmFzZU5hbWUoYy5wYXRoKSA9PT0gYmFzZU5hbWUoZm9jdXMucGF0aClcbiAgICAgICAgfSlcbiAgICAgICAgaWYgKGNoYW5nZSkge1xuICAgICAgICAgIHRhcmdldFJvdW5kID0gcm91bmRzW2ldXG4gICAgICAgICAgdGFyZ2V0Q2hhbmdlID0gY2hhbmdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2V0VGFiKCdzZXNzaW9uJylcbiAgICAgIGlmICh0YXJnZXRSb3VuZCAmJiB0YXJnZXRDaGFuZ2UpIHtcbiAgICAgICAgc2V0U2VsZWN0ZWRSb3VuZCh0YXJnZXRSb3VuZC5yb3VuZClcbiAgICAgICAgc2V0U2VsZWN0ZWRQYXRoKHRhcmdldENoYW5nZS5wYXRoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0U2VsZWN0ZWRSb3VuZChudWxsKVxuICAgICAgICBzZXRTZWxlY3RlZFBhdGgobnVsbClcbiAgICAgIH1cbiAgICAgIHNldEp1bXBMaW5lKGZvY3VzLmxpbmUgPz8gbnVsbClcbiAgICAgIGNvbnN0IHNjcm9sbFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmIChmb2N1cy5saW5lICE9IG51bGwpIHtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kc2RyLWxpbmU9XCIke2ZvY3VzLmxpbmV9XCJdYCk/LnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdjZW50ZXInLCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgICAgICAgfVxuICAgICAgfSwgODApXG4gICAgICBjb25zdCBjbGVhclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChzY3JvbGxUaW1lcilcbiAgICAgICAgY2xlYXJUaW1lb3V0KGNsZWFyVGltZXIpXG4gICAgICB9XG4gICAgfVxuICAgIHNldFRhYignd29ya3NwYWNlJylcbiAgICBzZXRTZWxlY3RlZChmb2N1cy5wYXRoKVxuICAgIHNldEp1bXBMaW5lKGZvY3VzLmxpbmUgPz8gbnVsbClcbiAgICBjb25zdCBzY3JvbGxUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKGZvY3VzLmxpbmUgIT0gbnVsbCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kc2RyLWxpbmU9XCIke2ZvY3VzLmxpbmV9XCJdYCk/LnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdjZW50ZXInLCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgICAgIH1cbiAgICB9LCA4MClcbiAgICBjb25zdCBjbGVhclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbFRpbWVyKVxuICAgICAgY2xlYXJUaW1lb3V0KGNsZWFyVGltZXIpXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3N0b3JlU3RhdGUua2V5XSlcblxuICAvLyBLZWVwIHN0YWdlZC91bnN0YWdlZC9oaXN0b3J5IGZyZXNoIHdoaWxlIHRoZSB3b3Jrc3BhY2UgdGFiIGlzIG9wZW4uXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgdGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBjb25zdCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHZvaWQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgIH0sIDE1MDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKHRpbWVyKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3N0b3JlU3RhdGUub3BlbiwgdGFiLCBhY3RpdmVDd2RdKVxuXG4gIC8vIEJyYW5jaCBzY29wZTogZGlmZiB0aGUgd29ya3RyZWUgYWdhaW5zdCB0aGUgc2VsZWN0ZWQgYmFzZSBicmFuY2guXG4gIC8vIERlZmF1bHQgdGhlIGJhc2UgdG8gdGhlIGZpcnN0IGJyYW5jaCB0aGF0IGlzbid0IHRoZSBjdXJyZW50IG9uZS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2NvcGUgIT09ICdicmFuY2gnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGNvbnN0IGN1cnJlbnQgPSBzdGF0dXM/LmJyYW5jaCA/PyBudWxsXG4gICAgaWYgKGJhc2VCcmFuY2ggPT09IG51bGwgJiYgYnJhbmNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmFsbGJhY2sgPSBicmFuY2hlcy5maW5kKChiKSA9PiBiICE9PSBjdXJyZW50KSA/PyBicmFuY2hlc1swXVxuICAgICAgc2V0QmFzZUJyYW5jaChmYWxsYmFjaylcbiAgICB9XG4gIH0sIFtzY29wZSwgYWN0aXZlQ3dkLCBicmFuY2hlcywgYmFzZUJyYW5jaCwgc3RhdHVzPy5icmFuY2hdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlICE9PSAnYnJhbmNoJyB8fCAhYWN0aXZlQ3dkIHx8ICFiYXNlQnJhbmNoKSB7XG4gICAgICBzZXRCYXNlU3RhdHVzKG51bGwpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGFjdGl2ZUN3ZCl9JmJhc2U9JHtlbmNvZGVVUklDb21wb25lbnQoYmFzZUJyYW5jaCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiBudWxsKSkgYXMgU3RhdHVzUmVzcG9uc2UgfCBudWxsXG4gICAgICBpZiAoIWNhbmNlbGxlZCAmJiBkYXRhKSB7XG4gICAgICAgIHNldEJhc2VTdGF0dXMoZGF0YSlcbiAgICAgICAgaWYgKGRhdGEuZXJyb3IgJiYgYmFzZVN0YXR1cz8uZXJyb3IgIT09IGRhdGEuZXJyb3IpIHNldEVycm9yKGRhdGEuZXJyb3IpXG4gICAgICB9XG4gICAgfSkoKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjYW5jZWxsZWQgPSB0cnVlXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3Njb3BlLCBhY3RpdmVDd2QsIGJhc2VCcmFuY2hdKVxuXG4gIC8vIERlZmF1bHQgc2VsZWN0aW9uIGZvciB0aGUgc2Vzc2lvbiB0YWIgZm9sbG93cyB0aGUgZmlyc3Qgcm91bmQgd2l0aCBjaGFuZ2VzLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFJvdW5kID09PSBudWxsICYmIHJvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRTZWxlY3RlZFJvdW5kKHJvdW5kc1swXS5yb3VuZClcbiAgICAgIHNldFNlbGVjdGVkUGF0aChyb3VuZHNbMF0uY2hhbmdlc1swXT8ucGF0aCA/PyBudWxsKVxuICAgIH1cbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbikgcmV0dXJuXG4gICAgY29uc3Qgb25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICBkLm9wZW4gPSBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgfSwgW3N0b3JlU3RhdGUub3Blbl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW5vdGljZSkgcmV0dXJuXG4gICAgbm90aWNlVGltZXIuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4gc2V0Tm90aWNlKG51bGwpLCAzMDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQobm90aWNlVGltZXIuY3VycmVudClcbiAgfSwgW25vdGljZV0pXG5cbiAgY29uc3QgZmlsZXMgPSBzdGF0dXM/LmlzUmVwbyA/IHN0YXR1cy5maWxlcyA6IFtdXG4gIGNvbnN0IHN0YWdlZEZpbGVzID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGYpID0+IGYuc3RhZ2VkKSwgW2ZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiAhZi5zdGFnZWQpLCBbZmlsZXNdKVxuXG4gIC8vIFwiTGFzdCB0dXJuXCIgc2NvcGU6IHBhdGhzIHRoZSBhZ2VudCB0b3VjaGVkIGluIHRoZSBtb3N0IHJlY2VudCByb3VuZCB0aGF0XG4gIC8vIGFjdHVhbGx5IGNoYW5nZWQgZmlsZXMgKHRoZSBsaXRlcmFsIGxhc3Qgcm91bmQgaXMgb2Z0ZW4gYSBjaGF0LW9ubHkgdHVybikuXG4gIGNvbnN0IGxhc3RSb3VuZFBhdGhzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldDxzdHJpbmc+KClcbiAgICBsZXQgbGFzdDogU2Vzc2lvblJvdW5kIHwgbnVsbCA9IG51bGxcbiAgICBmb3IgKGxldCBpID0gcm91bmRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAocm91bmRzW2ldLmNoYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBsYXN0ID0gcm91bmRzW2ldXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbGFzdCB8fCAhY3dkKSByZXR1cm4gc2V0XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgbGFzdC5jaGFuZ2VzKSB7XG4gICAgICBzZXQuYWRkKGNoYW5nZS5wYXRoKVxuICAgICAgY29uc3QgcCA9IGNoYW5nZS5wYXRoXG4gICAgICBpZiAoaXNBYnNQYXRoKHApKSB7XG4gICAgICAgIGNvbnN0IHJlbCA9IHAuc3RhcnRzV2l0aChjd2QpID8gcC5zbGljZShjd2QubGVuZ3RoKS5yZXBsYWNlKC9eW1xcXFwvXSsvLCAnJykgOiBwXG4gICAgICAgIHNldC5hZGQocmVsKVxuICAgICAgICBzZXQuYWRkKGJhc2VOYW1lKHApKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0LmFkZChiYXNlTmFtZShwKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNldFxuICB9LCBbcm91bmRzLCBjd2RdKVxuXG4gIC8qKiBUaGUgZmlsZSBzbGljZSB0aGUgY3VycmVudCBzY29wZSBzaG93cy4gKi9cbiAgY29uc3Qgc2NvcGVGaWxlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgIGNhc2UgJ3Vuc3RhZ2VkJzpcbiAgICAgICAgcmV0dXJuIHVuc3RhZ2VkRmlsZXNcbiAgICAgIGNhc2UgJ3N0YWdlZCc6XG4gICAgICAgIHJldHVybiBzdGFnZWRGaWxlc1xuICAgICAgY2FzZSAnYnJhbmNoJzpcbiAgICAgICAgcmV0dXJuIGJhc2VTdGF0dXM/LmZpbGVzID8/IFtdXG4gICAgICBjYXNlICdsYXN0LXR1cm4nOiB7XG4gICAgICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICAgICAgICBjb25zdCBzdWZmaXhNYXRjaCA9IChmOiBEaWZmRmlsZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICAgIGlmIChsYXN0Um91bmRQYXRocy5zaXplID09PSAwKSByZXR1cm4gZmFsc2VcbiAgICAgICAgICBpZiAobGFzdFJvdW5kUGF0aHMuaGFzKGYucGF0aCkgfHwgbGFzdFJvdW5kUGF0aHMuaGFzKGJhc2VOYW1lKGYucGF0aCkpKSByZXR1cm4gdHJ1ZVxuICAgICAgICAgIGNvbnN0IHN1ZmZpeCA9IGAvJHtmLnBhdGh9YFxuICAgICAgICAgIGZvciAoY29uc3QgcCBvZiBsYXN0Um91bmRQYXRocykge1xuICAgICAgICAgICAgaWYgKHAuZW5kc1dpdGgoc3VmZml4KSkgcmV0dXJuIHRydWVcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVzLmZpbHRlcigoZikgPT4ge1xuICAgICAgICAgIGlmIChzdWZmaXhNYXRjaChmKSkgcmV0dXJuIHRydWVcbiAgICAgICAgICAvLyBHaXQgZmFsbGJhY2s6IGNoYW5nZWQgYWZ0ZXIgdGhlIGxhc3QgdXNlciBtZXNzYWdlIChzZXNzaW9uIGxvZyBtYXlcbiAgICAgICAgICAvLyBoYXZlIG5vIGRpZmYgZGF0YSwgZS5nLiB0ZXJtaW5hbC1kcml2ZW4gZWRpdHMpLlxuICAgICAgICAgIHJldHVybiBsYXN0VXNlclRpbWUgPiAwICYmIGYubXRpbWUgPj0gbGFzdFVzZXJUaW1lIC0gNTAwMFxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZpbGVzXG4gICAgfVxuICB9LCBbc2NvcGUsIHVuc3RhZ2VkRmlsZXMsIHN0YWdlZEZpbGVzLCBiYXNlU3RhdHVzLCBmaWxlcywgbGFzdFJvdW5kUGF0aHMsIGxhc3RVc2VyVGltZV0pXG5cbiAgLyoqIFNjb3BlcyB3aGVyZSBmaWxlL2h1bmsgYWNjZXB0XHUwMEI3cmV2ZXJ0XHUwMEI3dW5zdGFnZSBhbmQgY29tbWl0L3B1c2ggbWFrZSBzZW5zZS4gKi9cbiAgY29uc3QgYWxsb3dBY3Rpb25zID0gc2NvcGUgIT09ICdicmFuY2gnICYmIHNjb3BlICE9PSAnY29tbWl0J1xuXG4gIC8qKiBGaWxlcyB0aGUgY3VycmVudCBzY29wZSBjYW4gaGFuZCB0byB0aGUgQUkgcmV2aWV3LiAqL1xuICBjb25zdCByZXZpZXdhYmxlRmlsZXMgPSBzY29wZSA9PT0gJ2JyYW5jaCcgPyBiYXNlU3RhdHVzPy5maWxlcz8ubGVuZ3RoID8/IDAgOiBmaWxlcy5sZW5ndGhcbiAgY29uc3Qgc3RhZ2VkQ291bnQgPSBzdGFnZWRGaWxlcy5sZW5ndGhcbiAgLy8gTk9URTogaG9va3MgbXVzdCBhbGwgcnVuIGJlZm9yZSB0aGUgZWFybHkgcmV0dXJuIGJlbG93IChSZWFjdCBob29rIG9yZGVyKS5cbiAgY29uc3Qgc3RhZ2VkVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZShzdGFnZWRGaWxlcywgKGYpID0+IGYucGF0aCksIFtzdGFnZWRGaWxlc10pXG4gIGNvbnN0IHVuc3RhZ2VkVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZSh1bnN0YWdlZEZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3Vuc3RhZ2VkRmlsZXNdKVxuICBjb25zdCBzY29wZVRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc2NvcGVGaWxlcywgKGYpID0+IGYucGF0aCksIFtzY29wZUZpbGVzXSlcbiAgY29uc3QgY29tbWl0RmlsZXNUcmVlID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoY29tbWl0RGlmZj8ub2sgPyBidWlsZEZpbGVUcmVlKGNvbW1pdERpZmYuZmlsZXMsIChmKSA9PiBmLnBhdGgpIDogW10pLFxuICAgIFtjb21taXREaWZmXSxcbiAgKVxuXG4gIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8ICFjd2QpIHJldHVybiBudWxsXG5cbiAgY29uc3Qgc2VsZWN0ZWRGaWxlID0gc2NvcGVGaWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IHNlbGVjdGVkKSA/PyBudWxsXG4gIGNvbnN0IHRvdGFsQWRkZWQgPSBmaWxlcy5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLmFkZGVkLCAwKVxuICBjb25zdCB0b3RhbERlbGV0ZWQgPSBmaWxlcy5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLmRlbGV0ZWQsIDApXG5cbiAgLy8gQ29tbWl0LWRldGFpbCB2aWV3OiB0aGUgc2VsZWN0ZWQgZmlsZSB3aXRoaW4gdGhlIHNlbGVjdGVkIGNvbW1pdC5cbiAgY29uc3QgY29tbWl0U2VnbWVudHMgPSBjb21taXREaWZmPy5vayA/IHNwbGl0Q29tbWl0RGlmZihjb21taXREaWZmLmRpZmYpIDogW11cbiAgY29uc3QgY29tbWl0QWN0aXZlRmlsZSA9IHNlbGVjdGVkQ29tbWl0ICYmIGNvbW1pdERpZmY/Lm9rID8gY29tbWl0RGlmZi5maWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IHNlbGVjdGVkQ29tbWl0RmlsZSkgPz8gbnVsbCA6IG51bGxcbiAgY29uc3QgY29tbWl0QWN0aXZlVGV4dCA9IGNvbW1pdEFjdGl2ZUZpbGVcbiAgICA/IGNvbW1pdFNlZ21lbnRzLmZpbmQoKHMpID0+IHMucGF0aCA9PT0gY29tbWl0QWN0aXZlRmlsZS5wYXRoKT8udGV4dCA/PyBjb21taXREaWZmPy5kaWZmID8/ICcnXG4gICAgOiBjb21taXREaWZmPy5kaWZmID8/ICcnXG5cbiAgLyoqIExlYWYgcm93IHNoYXJlZCBieSB0aGUgc3RhZ2VkL3Vuc3RhZ2VkIGZpbGUgdHJlZXMuICovXG4gIGNvbnN0IHdvcmtzcGFjZUxlYWYgPSAoeyBpdGVtOiBmaWxlLCBuYW1lIH06IHsgaXRlbTogRGlmZkZpbGU7IG5hbWU6IHN0cmluZyB9KSA9PiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgIGFyaWEtc2VsZWN0ZWQ9e2ZpbGUucGF0aCA9PT0gc2VsZWN0ZWR9XG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2ZpbGUucGF0aCA9PT0gc2VsZWN0ZWQgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZChmaWxlLnBhdGgpXG4gICAgICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgICB9fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoaXBDbGFzcyhmaWxlLnN0YXR1cyl9YH0+e2ZpbGUudW50cmFja2VkID8gJz8/JyA6IGZpbGUuc3RhdHVzfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2ZpbGUucGF0aH0+e25hbWV9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLXN0YXRcIj5cbiAgICAgICAge2ZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICA8L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcblxuICBjb25zdCBydW5BcHBseSA9IGFzeW5jIChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg/OiBzdHJpbmcpID0+IHtcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcHBseUNoYW5nZXMoYWN0aXZlQ3dkID8/IGN3ZCA/PyAnJywgYWN0aW9uLCBwYXRoKVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBjb25zdCB2ZXJiID0gYWN0aW9uID09PSAnYWNjZXB0JyA/IHQoJ3Jldmlldy5hY2NlcHRlZCcpIDogYWN0aW9uID09PSAndW5zdGFnZScgPyB0KCdyZXZpZXcudW5zdGFnZWQnKSA6IHQoJ3Jldmlldy5yZXZlcnRlZCcpXG4gICAgICAgIHNldE5vdGljZSh7XG4gICAgICAgICAga2luZDogJ29rJyxcbiAgICAgICAgICB0ZXh0OiBwYXRoXG4gICAgICAgICAgICA/IHQoJ3Jldmlldy5kb25lT25lJywgeyBhY3Rpb246IHZlcmIsIHBhdGggfSlcbiAgICAgICAgICAgIDogcmVzdWx0LmRlbGV0ZWQgJiYgcmVzdWx0LmRlbGV0ZWQubGVuZ3RoID4gMFxuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5kb25lRGVsZXRlZCcsIHsgYWN0aW9uOiB2ZXJiLCBjb3VudDogZmlsZXMubGVuZ3RoLCBkZWxldGVkOiByZXN1bHQuZGVsZXRlZC5sZW5ndGggfSlcbiAgICAgICAgICAgICAgOiB0KCdyZXZpZXcuZG9uZScsIHsgYWN0aW9uOiB2ZXJiLCBjb3VudDogZmlsZXMubGVuZ3RoIH0pLFxuICAgICAgICB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb25GaWxlQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ3JldmVydCcgJiYgY29uZmlybSAhPT0gJ2ZpbGUnKSB7XG4gICAgICBzZXRDb25maXJtKCdmaWxlJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdmaWxlJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCBydW5BcHBseShhY3Rpb24sIHBhdGgpXG4gIH1cblxuICBjb25zdCBvbkFsbEFjdGlvbiA9IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnYWxsJykge1xuICAgICAgc2V0Q29uZmlybSgnYWxsJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdhbGwnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbilcbiAgfVxuXG4gIC8qKiBBcHBseSBvbmUgaHVuayAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KSBvZiB0aGUgc2VsZWN0ZWQgZmlsZS4gKi9cbiAgY29uc3Qgb25IdW5rQWN0aW9uID0gYXN5bmMgKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogRGlmZkh1bmspID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkRmlsZSB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcGx5SHVuayhhY3RpdmVDd2QgPz8gY3dkID8/ICcnLCBzZWxlY3RlZEZpbGUucGF0aCwgYWN0aW9uLCBodW5rLnRleHQpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIGNvbnN0IHZlcmIgPSBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiBhY3Rpb24gPT09ICd1bnN0YWdlJyA/IHQoJ3Jldmlldy51bnN0YWdlZCcpIDogdCgncmV2aWV3LnJldmVydGVkJylcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmRvbmVPbmUnLCB7IGFjdGlvbjogdmVyYiwgcGF0aDogc2VsZWN0ZWRGaWxlLnBhdGggfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gaW5saW5lIGNvbW1lbnRzIC0tLS1cbiAgY29uc3Qgb3BlbkNvbW1lbnQgPSAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCkgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm5cbiAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZSwgbmV3TGluZSB9KVxuICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICB9XG5cbiAgLyoqXG4gICAqIENvbW1lbnRzIGFyZSBzdG9yZWQgcmVwby1yZWxhdGl2ZSAoc2VydmVyIHJlamVjdHMgYWJzb2x1dGUgcGF0aHMpLCBidXRcbiAgICogdGhlIHNlc3Npb24gdGFiJ3MgY2hhbmdlIHBhdGhzIGNvbWUgZnJvbSB0aGUgaG9zdCB0b29sIGRpZmYgY2FyZHMsIHdoaWNoXG4gICAqIGNhcnJ5IHdoYXRldmVyIHBhdGggdGhlIGFnZW50IHBhc3NlZCAodXN1YWxseSBhYnNvbHV0ZSkuXG4gICAqL1xuICBjb25zdCByZWxhdGl2ZVBhdGggPSAocDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCAhaXNBYnNQYXRoKHApKSByZXR1cm4gcFxuICAgIGlmIChwLnN0YXJ0c1dpdGgoYWN0aXZlQ3dkKSkgcmV0dXJuIHAuc2xpY2UoYWN0aXZlQ3dkLmxlbmd0aCkucmVwbGFjZSgvXltcXFxcL10rLywgJycpXG4gICAgcmV0dXJuIHBcbiAgfVxuXG4gIGNvbnN0IHNhdmVDb21tZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGNvbW1lbnRQYXRoID0gcmVsYXRpdmVQYXRoKCh0YWIgPT09ICd3b3Jrc3BhY2UnID8gc2VsZWN0ZWRGaWxlPy5wYXRoIDogc2VsZWN0ZWRDaGFuZ2U/LnBhdGgpID8/ICcnKVxuICAgIGlmICghY29tbWVudFBhdGggfHwgIWNvbW1lbnRFZGl0b3IgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgdGV4dCA9IGNvbW1lbnRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCkgcmV0dXJuXG4gICAgY29uc3QgY29tbWVudDogUmV2aWV3Q29tbWVudCA9IHtcbiAgICAgIGlkOiB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8ucmFuZG9tVVVJRCA/IGNyeXB0by5yYW5kb21VVUlEKCkgOiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpfWAsXG4gICAgICBwYXRoOiBjb21tZW50UGF0aCxcbiAgICAgIGxpbmVOZXc6IGNvbW1lbnRFZGl0b3IubmV3TGluZSxcbiAgICAgIGxpbmVPbGQ6IGNvbW1lbnRFZGl0b3Iub2xkTGluZSxcbiAgICAgIHRleHQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHNvdXJjZTogdGFiID09PSAnc2Vzc2lvbicgPyAnc2Vzc2lvbicgOiAnd29ya3NwYWNlJyxcbiAgICB9XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBuZXh0ID0gWy4uLmNvbW1lbnRzLCBjb21tZW50XVxuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ2NvbW1lbnQuc2F2ZWQnKSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBjYW5jZWxDb21tZW50ID0gKCkgPT4ge1xuICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgfVxuXG4gIGNvbnN0IGRlbGV0ZUNvbW1lbnQgPSBhc3luYyAoaWQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjLmlkICE9PSBpZClcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlIG9uZSBzYXZlZCBjb21tZW50J3MgdGV4dCAoUFVUIHJlcGxhY2UpLiBSZXR1cm5zIHN1Y2Nlc3MuICovXG4gIGNvbnN0IHVwZGF0ZUNvbW1lbnQgPSBhc3luYyAoaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgaWYgKCF0ZXh0IHx8IGJ1c3kpIHJldHVybiBmYWxzZVxuICAgIGNvbnN0IG5leHQgPSBjb21tZW50cy5tYXAoKGMpID0+IChjLmlkID09PSBpZCA/IHsgLi4uYywgdGV4dCwgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSA6IGMpKVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIEFJIHJldmlldyAoL3Jldmlldyk6IHJ1biwgcmUtcnVuLCBhbmQgaGFuZCBmaW5kaW5ncyB0byB0aGUgYWdlbnQgLS0tLVxuICBjb25zdCBvblJldmlldyA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCByZXZpZXdpbmcgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0UmV2aWV3aW5nKHRydWUpXG4gICAgc2V0UmV2aWV3KG51bGwpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldmlld1Njb3BlID0gc2NvcGUgPT09ICdicmFuY2gnID8gJ2JyYW5jaCcgOiBzY29wZSA9PT0gJ2NvbW1pdCcgJiYgc2VsZWN0ZWRDb21taXQgPyAnY29tbWl0JyA6ICd1bmNvbW1pdHRlZCdcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1blJldmlldyhhY3RpdmVDd2QsIGN1cnJlbnRJZCA/PyBudWxsLCByZXZpZXdTY29wZSwgYmFzZUJyYW5jaCA/PyB1bmRlZmluZWQsIHNlbGVjdGVkQ29tbWl0Py5oYXNoID8/IHVuZGVmaW5lZClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0UmV2aWV3KHJlc3VsdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0UmV2aWV3aW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21wb3NlIGEgXCJzZW5kIHRvIGFnZW50XCIgbWVzc2FnZSBmcm9tIGZpbmRpbmdzIG9yIFBSIGNvbW1lbnRzLiAqL1xuICBjb25zdCBjb21wb3NlRmluZGluZ3NNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0ZpbmRpbmdbXT4oKVxuICAgIGZvciAoY29uc3QgZiBvZiByZXZpZXc/LmZpbmRpbmdzID8/IFtdKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChmLmZpbGUpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGYpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoZi5maWxlLCBbZl0pXG4gICAgfVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFsnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCIEFJIFx1OEJDNFx1NUJBMVx1NTNEMVx1NzNCMFx1RkYwOEFkZHJlc3MgdGhlIHJldmlldyBmaW5kaW5nc1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsICcnXVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCByYW5nZSA9IGYubGluZVN0YXJ0ID09PSBmLmxpbmVFbmQgPyBgOiR7Zi5saW5lU3RhcnR9YCA6IGA6JHtmLmxpbmVTdGFydH0tJHtmLmxpbmVFbmR9YFxuICAgICAgICBsaW5lcy5wdXNoKGAtIFske2YucHJpb3JpdHl9XSAke3BhdGh9JHtyYW5nZX06ICR7Zi50aXRsZX0gXHUyMDE0ICR7Zi5kZXRhaWx9YClcbiAgICAgICAgaWYgKGYuc3VnZ2VzdGlvbikgbGluZXMucHVzaChgICBcXGBcXGBcXGBcXG4ke2Yuc3VnZ2VzdGlvbn1cXG4gIFxcYFxcYFxcYGApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IGNvbXBvc2VQck1lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoIXByPy5wciB8fCBwci5jb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtgXHU4QkY3XHU1OTA0XHU3NDA2IFBSICMke3ByLnByLm51bWJlcn1cdUZGMDgke3ByLnByLnRpdGxlfVx1RkYwOVx1NzY4NFx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIFBSIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBYCwgJyddXG4gICAgZm9yIChjb25zdCBjIG9mIHByLmNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBhbmNob3IgPSBjLnBhdGggPyBgJHtjLnBhdGh9JHtjLmxpbmUgPyBgOiR7Yy5saW5lfWAgOiAnJ31gIDogJ2dlbmVyYWwnXG4gICAgICBsaW5lcy5wdXNoKGAtICR7YW5jaG9yfSAoJHtjLmF1dGhvcn0pOiAke2MuYm9keX1gKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWxXaXRoID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgIHNldFNlbmRUZXh0KHRleHQpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIC8vIC0tLS0gZWRpdG9yIGludGVncmF0aW9uICh2aWEgZHNoLXBsdWdpbi1vcGVuLWVkaXRvcikgLS0tLVxuICBjb25zdCBvcGVuRmlsZSA9IGFzeW5jIChwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCBidXN5KSByZXR1cm5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvcGVuSW5FZGl0b3IoYWN0aXZlQ3dkLCBwYXRoLCBsaW5lKVxuICAgIGlmICghcmVzdWx0Lm9rKSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBgJHt0KCdlZGl0b3IuZmFpbGVkJyl9OiAke3Jlc3VsdC5lcnJvciA/PyAnJ31gIH0pXG4gIH1cblxuICAvKiogSnVtcCBmcm9tIGEgUFIgY29tbWVudCB0byB0aGUgZmlsZSAoYW5kIGhpZ2hsaWdodCB0aGUgbGluZSkuICovXG4gIGNvbnN0IG9uUHJDb21tZW50Q2xpY2sgPSAocGF0aDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCwgbGluZTogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuICAgIGlmIChwYXRoKSBqdW1wVG8ocGF0aCwgbGluZSA/PyB1bmRlZmluZWQpXG4gICAgZWxzZSBzZXRKdW1wTGluZShudWxsKVxuICB9XG5cbiAgLy8gLS0tLSBmZWVkYmFjayBsb29wOiBjb21tZW50cyBcdTIxOTIgYWdlbnQgKHByb21wdCBpbmplY3Rpb24sIGNvcHkgZmFsbGJhY2spIC0tLS1cbiAgY29uc3QgY29tcG9zZVJldmlld01lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoY29tbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUmV2aWV3Q29tbWVudFtdPigpXG4gICAgZm9yIChjb25zdCBjIG9mIGNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChjLnBhdGgpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGMpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoYy5wYXRoLCBbY10pXG4gICAgfVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtcbiAgICAgICdcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLFxuICAgICAgJycsXG4gICAgXVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGMgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCBhbmNob3IgPSBjLmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Yy5saW5lTmV3fWAgOiBgIChvbGQgbGluZSAke2MubGluZU9sZH0pYFxuICAgICAgICBsaW5lcy5wdXNoKGAtICR7cGF0aH0ke2FuY2hvcn06ICR7Yy50ZXh0fWApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0U2VuZFRleHQoY29tcG9zZVJldmlld01lc3NhZ2UoKSlcbiAgICBzZXRTZW5kT3Blbih0cnVlKVxuICB9XG5cbiAgY29uc3Qgc2VuZFRvQWdlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdGV4dCA9IHNlbmRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBhd2FpdCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIGN1cnJlbnRJZCA/PyBudWxsLCB0ZXh0KVxuICAgICAgc2V0U2VuZE9wZW4oZmFsc2UpXG4gICAgICBpZiAob3V0Y29tZSA9PT0gJ3NlbnQnKSBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuc2VudFRvQWdlbnQnKSB9KVxuICAgICAgZWxzZSBpZiAob3V0Y29tZSA9PT0gJ2NvcGllZCcpIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KVxuICAgICAgZWxzZSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdyZXZpZXcuY29weUZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIENvbW1pdCB0aGUgc3RhZ2VkIGNoYW5nZXMgd2l0aCB0aGUgZW50ZXJlZCBtZXNzYWdlLiAqL1xuICBjb25zdCBvbkNvbW1pdCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0gY29tbWl0TWVzc2FnZS50cmltKClcbiAgICBpZiAoIW1lc3NhZ2UgfHwgYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAnY29tbWl0JywgbWVzc2FnZSlcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0Q29tbWl0TWVzc2FnZSgnJylcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHJlc3VsdC5oYXNoID8gYCR7cmVzdWx0Lmhhc2h9ICR7cmVzdWx0LnN1YmplY3QgPz8gJyd9YC50cmltKCkgOiAocmVzdWx0LnN1YmplY3QgPz8gJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb21taXR0ZWQnLCB7IHN1bW1hcnkgfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBQdXNoIHRoZSBjdXJyZW50IGJyYW5jaCAoZG91YmxlLWNsaWNrIHRvIGNvbmZpcm0pLiAqL1xuICBjb25zdCBvblB1c2ggPSAoKSA9PiB7XG4gICAgaWYgKGJ1c3kgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKGNvbmZpcm0gIT09ICdwdXNoJykge1xuICAgICAgc2V0Q29uZmlybSgncHVzaCcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAncHVzaCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgIHNldEJ1c3kodHJ1ZSlcbiAgICAgIHNldE5vdGljZShudWxsKVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuR2l0QWN0aW9uKGFjdGl2ZUN3ZCwgJ3B1c2gnKVxuICAgICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LnB1c2hlZCcpIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5wdXNoRmFpbGVkJykgfSlcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5wdXNoRmFpbGVkJykgfSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgICB9XG4gICAgfSkoKVxuICB9XG5cbiAgLyoqIFNlbGVjdCBhIGxvY2FsIGNvbW1pdCBhbmQgbG9hZCBpdHMgZGlmZiBpbnRvIHRoZSByaWdodCBwYW5lLiAqL1xuICBjb25zdCBzZWxlY3RDb21taXQgPSAoY29tbWl0OiBDb21taXRJbmZvKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QpIHJldHVyblxuICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgc2V0U2VsZWN0ZWRDb21taXQoY29tbWl0KVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZkxvYWRpbmcodHJ1ZSlcbiAgICB2b2lkIGxvYWRDb21taXREaWZmKGFjdGl2ZUN3ZCwgY29tbWl0Lmhhc2gpXG4gICAgICAudGhlbigoZCkgPT4ge1xuICAgICAgICBzZXRDb21taXREaWZmKGQpXG4gICAgICAgIHNldENvbW1pdERpZmZMb2FkaW5nKGZhbHNlKVxuICAgICAgICAvLyBEZWZhdWx0IHRoZSBmaWxlIHRyZWUgdG8gdGhlIGZpcnN0IGNoYW5nZWQgZmlsZS5cbiAgICAgICAgaWYgKGQub2sgJiYgZC5maWxlcy5sZW5ndGggPiAwKSBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZC5maWxlc1swXS5wYXRoKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSkpXG4gIH1cblxuICBjb25zdCBjbG9zZSA9ICgpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cImRzZHItb3ZlcmxheVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3VycmVudFRhcmdldCkgY2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItcGFuZWxcIlxuICAgICAgICByb2xlPVwiZGlhbG9nXCJcbiAgICAgICAgYXJpYS1tb2RhbD1cInRydWVcIlxuICAgICAgICBhcmlhLWxhYmVsPXt0KCdyZXZpZXcudGl0bGUnKX1cbiAgICAgICAgc3R5bGU9e3sgd2lkdGg6IGAke3ByZWZzLndpZHRofXB4YCwgaGVpZ2h0OiBgJHtwcmVmcy5oZWlnaHR9cHhgLCAuLi5kaWZmU3R5bGVWYXJzKHByZWZzKSB9IGFzIENTU1Byb3BlcnRpZXN9XG4gICAgICA+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwiZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNcIlxuICAgICAgICAgIG9uUmVzaXplPXsoX2R4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cInNlXCJcbiAgICAgICAgICBvblJlc2l6ZT17KGR4LCBkeSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQud2lkdGggPSBNYXRoLm1heChNSU5fUEFORUxfVywgTWF0aC5taW4od2luZG93LmlubmVyV2lkdGggLSA2NCwgZC53aWR0aCArIGR4KSlcbiAgICAgICAgICAgICAgZC5oZWlnaHQgPSBNYXRoLm1heChNSU5fUEFORUxfSCwgTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gNjQsIGQuaGVpZ2h0ICsgZHkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1oZWFkZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRpdGxlXCI+e3QoJ3Jldmlldy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRhYnNcIiByb2xlPVwidGFibGlzdFwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfT5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXt0YWIgPT09ICdzZXNzaW9uJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3Nlc3Npb24nID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0VGFiKCdzZXNzaW9uJyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0KCd0YWIuc2Vzc2lvbicpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17dGFiID09PSAnd29ya3NwYWNlJ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10YWIke3RhYiA9PT0gJ3dvcmtzcGFjZScgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3dvcmtzcGFjZScpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dCgndGFiLndvcmtzcGFjZScpfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHt0YWIgPT09ICd3b3Jrc3BhY2UnICYmIHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zY29wZVwiPlxuICAgICAgICAgICAgICB7cmVwb3MubGVuZ3RoID4gMSA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgncmVwby5sYWJlbCcpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlcG9QYXRoID8/IGFjdGl2ZUN3ZCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e3JlcG9zLm1hcCgocikgPT4gKHsgdmFsdWU6IHIucGF0aCwgbGFiZWw6IGAke2Jhc2VOYW1lKHIucGF0aCl9JHtyLmJyYW5jaCA/IGAgKCR7ci5icmFuY2h9KWAgOiAnJ31gIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRSZXBvUGF0aCh2KVxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgICAgICAgICAgICAgICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUubGFiZWwnKX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2NvcGV9XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17U0NPUEVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBzLmlkLCBsYWJlbDogdChzLmxhYmVsKSB9KSl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRTY29wZSh2IGFzIFdvcmtzcGFjZVNjb3BlKVxuICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdzY29wZS5iYXNlJyl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YmFzZUJyYW5jaCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2JyYW5jaGVzLm1hcCgoYikgPT4gKHsgdmFsdWU6IGIsIGxhYmVsOiBiIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRCYXNlQnJhbmNofVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3VidGl0bGVcIj5cbiAgICAgICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJ1xuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5zZXNzaW9uU3RhdHMnLCB7IHJvdW5kczogcm91bmRzLmxlbmd0aCwgZmlsZXM6IHRvdGFsU2Vzc2lvbkZpbGVzIH0pXG4gICAgICAgICAgICAgIDogc3RhdHVzPy5pc1JlcG9cbiAgICAgICAgICAgICAgICA/IGAke3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9IFx1MDBCNyAke3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogdG90YWxBZGRlZCwgZGVsZXRlZDogdG90YWxEZWxldGVkIH0pfSR7c3RhdHVzLmFoZWFkID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmFoZWFkJywgeyBuOiBzdGF0dXMuYWhlYWQgfSl9YCA6ICcnfSR7c3RhdHVzLmJlaGluZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9YCA6ICcnfWBcbiAgICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5ub3RSZXBvJyl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgICB7dGFiID09PSAnd29ya3NwYWNlJyAmJiBhbGxvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfSBvbkNsaWNrPXsoKSA9PiBvbkFsbEFjdGlvbignYWNjZXB0Jyl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c3RhZ2VkQ291bnQgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgcnVuQXBwbHkoJ3Vuc3RhZ2UnKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnVuc3RhZ2VBbGwnKX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXIke2NvbmZpcm0gPT09ICdhbGwnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgZmlsZXMubGVuZ3RoID09PSAwfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQWxsQWN0aW9uKCdyZXZlcnQnKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnYWxsJyA/IHQoJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJykgOiB0KCdyZXZpZXcucmV2ZXJ0QWxsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1pbnB1dFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtjb21taXRNZXNzYWdlfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0KCdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRDb21taXRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHZvaWQgb25Db21taXQoKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3kgfHwgIWNvbW1pdE1lc3NhZ2UudHJpbSgpIHx8IHN0YWdlZENvdW50ID09PSAwfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9uQ29tbWl0KCl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29tbWl0Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcuY2xvc2UnKX0gb25DbGljaz17Y2xvc2V9PlxuICAgICAgICAgICAgPEljb25YIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtzZW5kT3BlbiA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VuZFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLXRpdGxlXCI+e3QoJ3Jldmlldy5zZW5kVGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbmQtaGludFwiPnt0KCdyZXZpZXcuc2VuZEhpbnQnKX08L3NwYW4+XG4gICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3NOYW1lPVwiZHNkci1zZW5kLWlucHV0XCIgcmVhZE9ubHkgdmFsdWU9e3NlbmRUZXh0fSBzcGVsbENoZWNrPXtmYWxzZX0gLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gc2V0U2VuZE9wZW4oZmFsc2UpfT5cbiAgICAgICAgICAgICAgICB7dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWJ0blwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdm9pZCBuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQoc2VuZFRleHQpLnRoZW4oXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4gc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgncmV2aWV3LmNvcHlGYWlsZWQnKSB9KSxcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jb3B5Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIXNlbmRUZXh0LnRyaW0oKX0gb25DbGljaz17KCkgPT4gdm9pZCBzZW5kVG9BZ2VudCgpfT5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnNlbmRUb0FnZW50Jyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJyA/IChcbiAgICAgICAgICByb3VuZHMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICAgIHt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfVxuICAgICAgICAgICAgICB7c2Vzc2lvblNjYW4gJiYgc2Vzc2lvblNjYW4ucmVzdWx0cyA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdyZXZpZXcuc2Vzc2lvblNjYW4nLCB7IHJlc3VsdHM6IHNlc3Npb25TY2FuLnJlc3VsdHMsIGRpZmY6IHNlc3Npb25TY2FuLmRpZmZDYXJkcywgcGF0aDogc2Vzc2lvblNjYW4ucGF0aE9ubHkgfSl9PC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHktYWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgb25DbGljaz17KCkgPT4gc2V0VGFiKCd3b3Jrc3BhY2UnKX0+XG4gICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmdvV29ya3NwYWNlJyl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLnNlc3Npb24nKX0+XG4gICAgICAgICAgICAgICAge3JvdW5kcy5tYXAoKHJvdW5kKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cm91bmQucm91bmR9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LnJvdW5kJywgeyByb3VuZDogcm91bmQucm91bmQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAge3JvdW5kLmxhYmVsID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kLWxhYmVsXCIgdGl0bGU9e3JvdW5kLmxhYmVsfT57cm91bmQubGFiZWx9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2Vzc2lvblRyZWVzLmdldChyb3VuZC5yb3VuZCkgPz8gW119XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogY2hhbmdlLCBuYW1lIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke3JvdW5kLnJvdW5kfToke2NoYW5nZS5wYXRofWBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkS2V5ID0gc2VsZWN0ZWRDaGFuZ2UgPyBgJHtzZWxlY3RlZFJvdW5kfToke3NlbGVjdGVkQ2hhbmdlLnBhdGh9YCA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtrZXkgPT09IHNlbGVjdGVkS2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7a2V5ID09PSBzZWxlY3RlZEtleSA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZC5yb3VuZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUGF0aChjaGFuZ2UucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hhbmdlLmhhc0RpZmYgPyAnZHNkci1jaGlwLW0nIDogJ2RzZHItY2hpcC11J31gfT57Y2hhbmdlLmhhc0RpZmYgPyAnTScgOiAnXHUwMEI3J308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17Y2hhbmdlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIiB0aXRsZT17Y2hhbmdlLnRvb2x9PntjaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ2hhbmdlLnBhdGh9PntzZWxlY3RlZENoYW5nZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj57c2VsZWN0ZWRDaGFuZ2UudG9vbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlLmhhc0RpZmYgPyA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkQ2hhbmdlLnBhdGgpfSB0aXRsZT17dCgnZWRpdG9yLm9wZW5GaWxlJyl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3IHt0KCdlZGl0b3Iub3BlbkZpbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gKFxuICAgICAgICAgICAgICAgICAgICAgIHZpZXcgPT09ICdzcGxpdCcgJiYgY2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYmVmb3JlJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmFmdGVyJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2NoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKS5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEFuY2hvciA9IHsgb2xkTGluZTogcm93LmxlZnROdW0sIG5ld0xpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cubGVmdE51bSAhPT0gbnVsbCA/IHJvdy5sZWZ0TnVtIDogbnVsbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cucmlnaHROdW0gIT09IG51bGwgPyByb3cucmlnaHROdW0gOiBudWxsLCBuZXdMaW5lOiByb3cucmlnaHROdW0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRLZXkgPSBgJHtsZWZ0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2xlZnRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0S2V5ID0gYCR7cmlnaHRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7cmlnaHRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgbGVmdEFuY2hvci5vbGRMaW5lLCBsZWZ0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIHJpZ2h0QW5jaG9yLm9sZExpbmUsIHJpZ2h0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRCdG4gPSAoYW5jaG9yOiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSwgY291bnQ6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50PXtjb3VudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmU6IGFuY2hvci5vbGRMaW5lLCBuZXdMaW5lOiBhbmNob3IubmV3TGluZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0PXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlbkJ0biA9IChsaW5lOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtb3BlbmxpbmVcIiB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkQ2hhbmdlLnBhdGgsIGxpbmUpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e3JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5sZWZ0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1kZWwnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtyb3cubGVmdE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5sZWZ0TnVtID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEJ0bihsZWZ0QW5jaG9yLCBsZWZ0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5sZWZ0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLmxlbmd0aCA+IDAgPyBsZWZ0Q29tbWVudHMubWFwKChjb21tZW50KSA9PiA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXt1cGRhdGVDb21tZW50fSBvbkRlbGV0ZT17KGlkKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoaWQpfSB0PXt0fSAvPikgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgbGVmdEtleSA9PT0gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5yaWdodE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5yaWdodE51bSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5yaWdodE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LnJpZ2h0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5sZW5ndGggPiAwID8gcmlnaHRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e3VwZGF0ZUNvbW1lbnR9IG9uRGVsZXRlPXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9IHQ9e3R9IC8+KSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiByaWdodEtleSA9PT0gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nlc3Npb25Sb3dzV2l0aExpbmVzKHNlbGVjdGVkQ2hhbmdlKS5tYXAoKHsgcm93LCBvbGRMaW5lLCBuZXdMaW5lIH0sIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke29sZExpbmUgPz8gJ28nfToke25ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0NvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBvbGRMaW5lLCBuZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3dBY3Rpb25zID0gcm93LmtpbmQgPT09ICdjdHgnIHx8IHJvdy5raW5kID09PSAnYWRkJyB8fCByb3cua2luZCA9PT0gJ2RlbCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfSR7cm93Q29tbWVudHMubGVuZ3RoID4gMCA/ICcgZHNkci1saW5lLWNvbW1lbnRlZCcgOiAnJ31gfSBkYXRhLWRzZHItbGluZT17bmV3TGluZSA/PyBvbGRMaW5lID8/IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtbnVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtuZXdMaW5lID8/IG9sZExpbmUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyA/IDxDb21tZW50TGluZSBjb3VudD17cm93Q29tbWVudHMubGVuZ3RofSBvbk9wZW49eygpID0+IG9wZW5Db21tZW50KG9sZExpbmUsIG5ld0xpbmUpfSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtdGV4dFwiPntyb3cudGV4dCB8fCAnICd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zICYmIChuZXdMaW5lID8/IG9sZExpbmUpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLW9wZW5saW5lXCIgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZENoYW5nZS5wYXRoLCBuZXdMaW5lID8/IG9sZExpbmUgPz8gMSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyAmJiByb3dDb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93Q29tbWVudHMubWFwKChjb21tZW50KSA9PiA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXt1cGRhdGVDb21tZW50fSBvbkRlbGV0ZT17KGlkKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoaWQpfSB0PXt0fSAvPilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA9PT0ga2V5ID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHR9IG9uVGV4dD17c2V0Q29tbWVudFRleHR9IG9uU2F2ZT17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfSBvbkNhbmNlbD17Y2FuY2VsQ29tbWVudH0gYnVzeT17YnVzeX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdyZXZpZXcubm9EaWZmRGF0YScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApXG4gICAgICAgICkgOiBlcnJvciAmJiAhc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+XG4gICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgICA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ib2R5XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi53b3Jrc3BhY2UnKX0+XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2FsbCcgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIHtzdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIHt1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXt1bnN0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICd1bnN0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgdW5zdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJyl9ICh7dW5zdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdzdGFnZWQnID8gKFxuICAgICAgICAgICAgICAgIHN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvblN0YWdlZCcpfSAoe3N0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIHNjb3BlRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Njb3BlLmJyYW5jaCcpfSB7YmFzZUJyYW5jaCA/IGBcdTIxOTQgJHtiYXNlQnJhbmNofWAgOiAnJ30gKHtzY29wZUZpbGVzLmxlbmd0aH0pXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Njb3BlLmJyYW5jaFJlYWRvbmx5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2xhc3QtdHVybicgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgnc2NvcGUubGFzdC10dXJuJyl9ICh7c2NvcGVGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Njb3BlVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcubGFzdFR1cm5FbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHsoc2NvcGUgPT09ICdhbGwnIHx8IHNjb3BlID09PSAnY29tbWl0JykgJiYgaGlzdG9yeS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuaGlzdG9yeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRpbWVsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIHtoaXN0b3J5Lm1hcCgoY29tbWl0KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItdGwtaXRlbSR7c2VsZWN0ZWRDb21taXQ/Lmhhc2ggPT09IGNvbW1pdC5oYXNoID8gJyBkc2RyLXRsLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRsLXJhaWxcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci10bC1kb3Qke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1kb3QtbG9jYWwnIDogJyBkc2RyLXRsLWRvdC1yZW1vdGUnfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2h9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWl0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0Q29tbWl0KGNvbW1pdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWJhZGdlJHtjb21taXQuYWhlYWQgPyAnIGRzZHItdGwtYmFkZ2UtbG9jYWwnIDogJyBkc2RyLXRsLWJhZGdlLXJlbW90ZSd9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWl0LmFoZWFkID8gdCgnaGlzdG9yeS5sb2NhbCcpIDogdCgnaGlzdG9yeS5yZW1vdGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtc2hvcnRcIj57Y29tbWl0LnNob3J0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zdWJqZWN0XCIgdGl0bGU9e2NvbW1pdC5zdWJqZWN0fT57Y29tbWl0LnN1YmplY3R9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LW1ldGFcIj57Y29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoY29tbWl0LmRhdGUsIHQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayAmJiBjb21taXREaWZmLmZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5jb21taXRGaWxlcycpfSAoe2NvbW1pdERpZmYuZmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgbm9kZXM9e2NvbW1pdEZpbGVzVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17KHsgaXRlbTogZmlsZSwgbmFtZSB9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtzZWxlY3RlZENvbW1pdEZpbGUgPT09IGZpbGUucGF0aCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZENvbW1pdEZpbGUoZmlsZS5wYXRoKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNoaXAgZHNkci1jaGlwLW1cIj57ZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25CcmFuY2gnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1icmFuY2hcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtcmVmXCIgdGl0bGU9e3N0YXR1cy51cHN0cmVhbSA/PyB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFycm93XCI+XHUyMTkyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMudXBzdHJlYW0gPz8gdCgncmV2aWV3Lm5vVXBzdHJlYW0nKX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5haGVhZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1haGVhZFwiPnt0KCdyZXZpZXcuYWhlYWQnLCB7IG46IHN0YXR1cy5haGVhZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmJlaGluZCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1iZWhpbmRcIj57dCgncmV2aWV3LmJlaGluZCcsIHsgbjogc3RhdHVzLmJlaGluZCB9KX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID09PSAwICYmIHN0YXR1cy5iZWhpbmQgPT09IDAgJiYgc3RhdHVzLnVwc3RyZWFtID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtc3luY1wiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWJ0biR7Y29uZmlybSA9PT0gJ3B1c2gnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2J1c3kgfHwgKHN0YXR1cz8uYWhlYWQgPz8gMCkgPT09IDB9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25QdXNofVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdwdXNoJyA/IHQoJ3Jldmlldy5jb25maXJtUHVzaCcpIDogYCR7dCgncmV2aWV3LnB1c2gnKX0keyhzdGF0dXM/LmFoZWFkID8/IDApID4gMCA/IGAgKCR7c3RhdHVzPy5haGVhZCA/PyAwfSlgIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtwcj8ucHIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci50aXRsZScsIHsgbnVtYmVyOiBwci5wci5udW1iZXIgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IGAgXHUwMEI3ICR7dCgncHIuY29tbWVudHMnLCB7IG46IHByLmNvbW1lbnRzLmxlbmd0aCB9KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXByXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdwci5ub1ByJyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXByLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUHJDb21tZW50Q2xpY2soY29tbWVudC5wYXRoLCBjb21tZW50LmxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudC5wYXRoID8gYCR7YmFzZU5hbWUoY29tbWVudC5wYXRoKX0ke2NvbW1lbnQubGluZSA/IGA6JHtjb21tZW50LmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCd9IFx1MDBCNyB7Y29tbWVudC5hdXRob3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcHItdGV4dFwiPntjb21tZW50LmJvZHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VQck1lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci5zZW5kQ29tbWVudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgIHtyZXZpZXc/Lm9rID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci12ZXJkaWN0JHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnIGRzZHItdmVyZGljdC1iYWQnIDogJyBkc2RyLXZlcmRpY3Qtb2snfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1hcmtcIj57cmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gJ1x1MjcxNycgOiAnXHUyNzEzJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXZlcmRpY3QtdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7cmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gdCgncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnKSA6IHQoJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCcpfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gdCgncmV2aWV3LmZpbmRpbmdzJywgeyBuOiByZXZpZXcuZmluZGluZ3MubGVuZ3RoIH0pIDogdCgncmV2aWV3Lm5vRmluZGluZ3MnKX1cbiAgICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAge3Jldmlldy5tb2RlbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdmVyZGljdC1tb2RlbFwiPntyZXZpZXcubW9kZWwucHJvdmlkZXJ9L3tyZXZpZXcubW9kZWwubW9kZWx9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VGaW5kaW5nc01lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZEZpbmRpbmdzJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQgPyAoXG4gICAgICAgICAgICAgICAgY29tbWl0RGlmZkxvYWRpbmcgPyAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiBjb21taXREaWZmPy5vayA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhhc2hcIj57c2VsZWN0ZWRDb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5hdXRob3J9IFx1MDBCNyB7cmVsYXRpdmVUaW1lKHNlbGVjdGVkQ29tbWl0LmRhdGUsIHQpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdERpZmYuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdERpZmYuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge2NvbW1pdEFjdGl2ZUZpbGUgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1maWxlLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e2NvbW1pdEFjdGl2ZUZpbGUucGF0aH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2hpcCBkc2RyLWNoaXAtbVwiPntjb21taXRGaWxlU3RhdHVzKGNvbW1pdFNlZ21lbnRzLmZpbmQoKHMpID0+IHMucGF0aCA9PT0gY29tbWl0QWN0aXZlRmlsZS5wYXRoKT8udGV4dCA/PyAnJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1maWxlLXBhdGhcIj57Y29tbWl0QWN0aXZlRmlsZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBjb21taXRBY3RpdmVGaWxlLmFkZGVkLCBkZWxldGVkOiBjb21taXRBY3RpdmVGaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7dmlldyA9PT0gJ3NwbGl0JyAmJiBnaXRTcGxpdEJsb2Nrcyhjb21taXRBY3RpdmVUZXh0KS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxTcGxpdERpZmYgYmxvY2tzPXtnaXRTcGxpdEJsb2Nrcyhjb21taXRBY3RpdmVUZXh0KX0gYmVmb3JlTGFiZWw9e3QoJ3ZpZXcuYmVmb3JlJyl9IGFmdGVyTGFiZWw9e3QoJ3ZpZXcuYWZ0ZXInKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge2dpdERpZmZSb3dzKGNvbW1pdEFjdGl2ZVRleHQpLm1hcCgocm93LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e2NvbW1pdERpZmY/LmVycm9yID8/IHQoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogc2VsZWN0ZWRGaWxlID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5vcmlnUGF0aCA/IGAgXHUyMTkwICR7c2VsZWN0ZWRGaWxlLm9yaWdQYXRofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogc2VsZWN0ZWRGaWxlLmFkZGVkLCBkZWxldGVkOiBzZWxlY3RlZEZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRGaWxlLnBhdGgpfSB0aXRsZT17dCgnZWRpdG9yLm9wZW5GaWxlJyl9PlxuICAgICAgICAgICAgICAgICAgICAgIFx1MjE5NyB7dCgnZWRpdG9yLm9wZW5GaWxlJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zICYmIHNlbGVjdGVkRmlsZS51bnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbignYWNjZXB0Jywgc2VsZWN0ZWRGaWxlLnBhdGgpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zICYmIHNlbGVjdGVkRmlsZS5zdGFnZWQgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCd1bnN0YWdlJywgc2VsZWN0ZWRGaWxlLnBhdGgpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcudW5zdGFnZScpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuIGRzZHItYnRuLWRhbmdlciR7Y29uZmlybSA9PT0gJ2ZpbGUnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbigncmV2ZXJ0Jywgc2VsZWN0ZWRGaWxlLnBhdGgpfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnZmlsZScgPyB0KCdyZXZpZXcuY29uZmlybVJldmVydCcpIDogdCgncmV2aWV3LnJldmVydCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3ZpZXcgPT09ICdzcGxpdCcgJiYgIXNlbGVjdGVkRmlsZS5iaW5hcnkgJiYgZ2l0U3BsaXRCbG9ja3Moc2VsZWN0ZWRGaWxlLmRpZmYpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYmVmb3JlJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYWZ0ZXInKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Z2l0U3BsaXRCbG9ja3Moc2VsZWN0ZWRGaWxlLmRpZmYpLm1hcCgoYmxvY2ssIGJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zID8gPEh1bmtUb29sYmFyIGh1bms9e3NlbGVjdGVkRmlsZS5odW5rc1tiaV19IGJ1c3k9e2J1c3l9IG9uQWN0aW9uPXtvbkh1bmtBY3Rpb259IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0ZpbmRpbmdzID0gKHJldmlldz8uZmluZGluZ3MgPz8gW10pLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGYpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZi5maWxlID09PSBzZWxlY3RlZEZpbGUucGF0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyb3cucmlnaHROdW0gIT09IG51bGwgPyByb3cucmlnaHROdW0gPj0gZi5saW5lU3RhcnQgJiYgcm93LnJpZ2h0TnVtIDw9IGYubGluZUVuZCA6IHJvdy5sZWZ0TnVtICE9PSBudWxsICYmIHJvdy5sZWZ0TnVtID49IGYubGluZVN0YXJ0ICYmIHJvdy5sZWZ0TnVtIDw9IGYubGluZUVuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5nQ2xzID0gcm93RmluZGluZ3MubGVuZ3RoID4gMCA/IGAgZHNkci1jZWxsLWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YCA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wZWQgPSBqdW1wTGluZSAhPSBudWxsICYmIChyb3cucmlnaHROdW0gPT09IGp1bXBMaW5lIHx8IChyb3cucmlnaHROdW0gPT09IG51bGwgJiYgcm93LmxlZnROdW0gPT09IGp1bXBMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW1lbnQgYW5jaG9ycyBzdGF5IGNvbnNpc3RlbnQgd2l0aCB0aGUgdW5pZmllZCB2aWV3OiBjdHggcm93cyBleHBvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJvdGggbGluZSBudW1iZXJzLCBjaGFuZ2Ugcm93cyBleHBvc2UgdGhlIHNpZGUgdGhleSBiZWxvbmcgdG8uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0QW5jaG9yID0geyBvbGRMaW5lOiByb3cubGVmdE51bSwgbmV3TGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5sZWZ0TnVtICE9PSBudWxsID8gcm93LmxlZnROdW0gOiBudWxsIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0QW5jaG9yID0geyBvbGRMaW5lOiByb3cua2luZCA9PT0gJ2N0eCcgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gcm93LnJpZ2h0TnVtIDogbnVsbCwgbmV3TGluZTogcm93LnJpZ2h0TnVtIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRLZXkgPSBgJHtsZWZ0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2xlZnRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRLZXkgPSBgJHtyaWdodEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtyaWdodEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIGxlZnRBbmNob3Iub2xkTGluZSwgbGVmdEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIHJpZ2h0QW5jaG9yLm9sZExpbmUsIHJpZ2h0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlbkJ0biA9IChsaW5lOiBudW1iZXIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRmlsZS5wYXRoID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtb3BlbmxpbmVcIiB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkRmlsZS5wYXRoLCBsaW5lKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRCdG4gPSAoYW5jaG9yOiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSwgY291bnQ6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudD17Y291bnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZTogYW5jaG9yLm9sZExpbmUsIG5ld0xpbmU6IGFuY2hvci5uZXdMaW5lIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5sZWZ0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4obGVmdEFuY2hvciwgbGVmdENvbW1lbnRzLmxlbmd0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5sZWZ0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cubGVmdE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93RmluZGluZ3MubGVuZ3RoID4gMCAmJiByb3cucmlnaHROdW0gPT09IG51bGwgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YH0+e3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLmxlbmd0aCA+IDAgPyBsZWZ0Q29tbWVudHMubWFwKChjb21tZW50KSA9PiA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXt1cGRhdGVDb21tZW50fSBvbkRlbGV0ZT17KGlkKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoaWQpfSB0PXt0fSAvPikgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiBsZWZ0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ30ke2ZpbmRpbmdDbHN9JHtqdW1wZWQgPyAnIGRzZHItY2VsbC1qdW1wJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtyb3cucmlnaHROdW0gPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5yaWdodE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LnJpZ2h0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dGaW5kaW5ncy5sZW5ndGggPiAwICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gfT57cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLmxlbmd0aCA+IDAgPyByaWdodENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgcmlnaHRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KHJldmlldz8uZmluZGluZ3MgPz8gW10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChmKSA9PiBmLmZpbGUgPT09IHNlbGVjdGVkRmlsZS5wYXRoICYmIGYubGluZVN0YXJ0ID09PSAocm93LmxlZnROdW0gPz8gcm93LnJpZ2h0TnVtKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGYsIGZpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaW5kaW5nQ2FyZCBrZXk9e2Ake2YuZmlsZX06JHtmLmxpbmVTdGFydH06JHtmaX1gfSBmaW5kaW5nPXtmfSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8VW5pZmllZERpZmZcbiAgICAgICAgICAgICAgICAgICAgICBkaWZmPXtzZWxlY3RlZEZpbGUuZGlmZn1cbiAgICAgICAgICAgICAgICAgICAgICBodW5rcz17c2VsZWN0ZWRGaWxlLmh1bmtzfVxuICAgICAgICAgICAgICAgICAgICAgIGJ1c3k9e2J1c3l9XG4gICAgICAgICAgICAgICAgICAgICAgb25IdW5rQWN0aW9uPXtvbkh1bmtBY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50cz17Y29tbWVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudEVkaXRvcj17Y29tbWVudEVkaXRvcn1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50VGV4dD17Y29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25Db21tZW50VGV4dD17c2V0Q29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuQ29tbWVudD17b3BlbkNvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgb25TYXZlQ29tbWVudD17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsQ29tbWVudD17Y2FuY2VsQ29tbWVudH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUNvbW1lbnQ9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX1cbiAgICAgICAgICAgICAgICAgICAgICBvblVwZGF0ZUNvbW1lbnQ9e3VwZGF0ZUNvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk9eyFhbGxvd0FjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgcGF0aD17c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgcmV2aWV3RmluZGluZ3M9e3Jldmlldz8uZmluZGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuTGluZT17KHAsIGxpbmUpID0+IHZvaWQgb3BlbkZpbGUocCwgbGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAganVtcExpbmU9e2p1bXBMaW5lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntzY29wZSA9PT0gJ2NvbW1pdCcgPyB0KCdyZXZpZXcuc2VsZWN0Q29tbWl0JykgOiB0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yID8/IHQoJ3Jldmlldy5sb2FkRXJyb3InKX1cbiAgICAgICAgICAgIHshc3RhdHVzPy5pc1JlcG8gPyA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mb290XCI+XG4gICAgICAgICAgeyhsb2FkaW5nIHx8IGJ1c3kpICYmIHRhYiA9PT0gJ3dvcmtzcGFjZScgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwaW5uZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2J1c3kgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLW5vdGljZVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIHtub3RpY2UgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLW5vdGljZSBkc2RyLW5vdGljZS0ke25vdGljZS5raW5kfWB9Pntub3RpY2UudGV4dH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQ29uZmlnIGNhcmQgZm9yIHRoZSBQbHVnaW5zIGNvbmZpZ3VyYXRpb24gdGFiIChTZXR0aW5ncyBcdTIxOTIgUGx1Z2lucyBcdTIxOTIgXHU1M0VGXHU5MTREXHU3RjZFKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb25maWdDYXJkKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJkIGRzZHItY2ZnLWNhcmQtb3BlbicgOiAnZHNkci1jZmctY2FyZCd9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZFwiIGFyaWEtZXhwYW5kZWQ9e29wZW59IG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWhlYWQtdGV4dFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLW5hbWVcIj57dCgnc2V0dGluZ3MudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctZGVzY1wiPnt0KCdjb25maWcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93bk91dGxpbmUxNCBjbGFzc05hbWU9e29wZW4gPyAnZHNkci1jZmctY2FyZXQgZHNkci1jZmctY2FyZXQtb3BlbicgOiAnZHNkci1jZmctY2FyZXQnfSAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1ib2R5XCI+XG4gICAgICAgICAgPERpZmZSZXZpZXdQcmVmcyB0PXt0fSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbGk+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG4gIC8vIENvZGV4LXN0eWxlIHBlbmRpbmctY29tbWVudHMgc3RyaXAgYXQgdGhlIFRPUCBvZiB0aGUgY29tcG9zZXIsIHN0eWxlZCBhc1xuICAvLyB0aGUgY2FyZCdzIG93biBzdXJmYWNlIHNvIGl0IHJlYWRzIGFzIG9uZSBmdXNlZCBkaWFsb2cuXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uaW5wdXQuZG9jaycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29tbWVudHMtZG9jaycsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrLFxuICAgICksXG4gIClcbiAgLy8gVGhlIGNhcnJpZWQgcmV2aWV3IHBhY2thZ2UgcmVuZGVycyBpbiB0aGUgdHJhbnNjcmlwdCBhcyBhIENvZGV4LXN0eWxlXG4gIC8vIGNhcmQ6IHNoYWRvdyB0aGUgc2hlbGwncyB1c2VyLW5vZGUgcmVuZGVyZXIgKHByaW9yaXR5IC0xID0gbG93ZXN0IHdpbnMpXG4gIC8vIGFuZCByZS1yZW5kZXIgbm9uLXBhY2thZ2UgbWVzc2FnZXMgd2l0aCBhIG5hdGl2ZS1sb29rIGJ1YmJsZS4gVGhlXG4gIC8vIHN0ZWVyaW5nIGtpbmQgZ2V0cyB0aGUgc2FtZSB0cmVhdG1lbnQgXHUyMDE0IHRoZSBwYWNrYWdlIGlzIGluamVjdGVkIHdpdGhcbiAgLy8gcHJvbXB0KC4uLiwgJ3N0ZWVyJyksIHNvIGl0IGxhbmRzIGluIHRoZSB0cmFuc2NyaXB0IGFzIGEgc3RlZXJpbmcgbm9kZS5cbiAgZm9yIChjb25zdCBrZXkgb2YgWyd1c2VyJywgJ3N0ZWVyaW5nJ10gYXMgY29uc3QpIHtcbiAgICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uY2hhdC5ub2RlJywgKCkgPT5cbiAgICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uY2hhdC5ub2RlJyxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgcHJpb3JpdHk6IC0xLFxuICAgICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgICB9LFxuICAgICAgICBVc2VyUmV2aWV3Tm9kZVZpZXcsXG4gICAgICApLFxuICAgIClcbiAgfVxuICAvLyBUaGUgcGx1Z2luJ3Mgb3duIHNldHRpbmdzIHRhYiBpbnNpZGUgXHU4QkJFXHU3RjZFIFx1MjE5MiBcdTYzRDJcdTRFRjYgKG5vdCB0aGUgR2VuZXJhbCBzZWN0aW9uKS5cbiAgLy8gVGhlIHBsdWdpbidzIHdob2xlIGNvbmZpZ3VyYXRpb24gbGl2ZXMgaW4gb25lIGNhcmQgaW5zaWRlXG4gIC8vIFx1OEJCRVx1N0Y2RSBcdTIxOTIgXHU2M0QyXHU0RUY2IFx1MjE5MiBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkUgKHNldHRpbmdzLnBsdWdpbi5pdGVtKTogZm9udC9zaXplLlxuICBjdHguc2xvdHMuaW5qZWN0KCdzZXR0aW5ncy5wbHVnaW4uaXRlbScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2V0dGluZ3MucGx1Z2luLml0ZW0nLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3LWNvbmZpZycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICB9LFxuICAgICAgRGlmZlJldmlld0NvbmZpZ0NhcmQsXG4gICAgKSxcbiAgKVxufVxuIiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmYge1xuICAgIGRpZmYob2xkU3RyLCBuZXdTdHIsIFxuICAgIC8vIFR5cGUgYmVsb3cgaXMgbm90IGFjY3VyYXRlL2NvbXBsZXRlIC0gc2VlIGFib3ZlIGZvciBmdWxsIHBvc3NpYmlsaXRpZXMgLSBidXQgaXQgY29tcGlsZXNcbiAgICBvcHRpb25zID0ge30pIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrO1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgnY2FsbGJhY2snIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaztcbiAgICAgICAgfVxuICAgICAgICAvLyBBbGxvdyBzdWJjbGFzc2VzIHRvIG1hc3NhZ2UgdGhlIGlucHV0IHByaW9yIHRvIHJ1bm5pbmdcbiAgICAgICAgY29uc3Qgb2xkU3RyaW5nID0gdGhpcy5jYXN0SW5wdXQob2xkU3RyLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgbmV3U3RyaW5nID0gdGhpcy5jYXN0SW5wdXQobmV3U3RyLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3Qgb2xkVG9rZW5zID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG9sZFN0cmluZywgb3B0aW9ucykpO1xuICAgICAgICBjb25zdCBuZXdUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUobmV3U3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spO1xuICAgIH1cbiAgICBkaWZmV2l0aE9wdGlvbnNPYmoob2xkVG9rZW5zLCBuZXdUb2tlbnMsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgZG9uZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnBvc3RQcm9jZXNzKHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBjYWxsYmFjayh2YWx1ZSk7IH0sIDApO1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IG5ld1Rva2Vucy5sZW5ndGgsIG9sZExlbiA9IG9sZFRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCBlZGl0TGVuZ3RoID0gMTtcbiAgICAgICAgbGV0IG1heEVkaXRMZW5ndGggPSBuZXdMZW4gKyBvbGRMZW47XG4gICAgICAgIGlmIChvcHRpb25zLm1heEVkaXRMZW5ndGggIT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4RWRpdExlbmd0aCA9IE1hdGgubWluKG1heEVkaXRMZW5ndGgsIG9wdGlvbnMubWF4RWRpdExlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4RXhlY3V0aW9uVGltZSA9IChfYSA9IG9wdGlvbnMudGltZW91dCkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogSW5maW5pdHk7XG4gICAgICAgIGNvbnN0IGFib3J0QWZ0ZXJUaW1lc3RhbXAgPSBEYXRlLm5vdygpICsgbWF4RXhlY3V0aW9uVGltZTtcbiAgICAgICAgY29uc3QgYmVzdFBhdGggPSBbeyBvbGRQb3M6IC0xLCBsYXN0Q29tcG9uZW50OiB1bmRlZmluZWQgfV07XG4gICAgICAgIC8vIFNlZWQgZWRpdExlbmd0aCA9IDAsIGkuZS4gdGhlIGNvbnRlbnQgc3RhcnRzIHdpdGggdGhlIHNhbWUgdmFsdWVzXG4gICAgICAgIGxldCBuZXdQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmVzdFBhdGhbMF0sIG5ld1Rva2Vucywgb2xkVG9rZW5zLCAwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKGJlc3RQYXRoWzBdLm9sZFBvcyArIDEgPj0gb2xkTGVuICYmIG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAvLyBJZGVudGl0eSBwZXIgdGhlIGVxdWFsaXR5IGFuZCB0b2tlbml6ZXJcbiAgICAgICAgICAgIHJldHVybiBkb25lKHRoaXMuYnVpbGRWYWx1ZXMoYmVzdFBhdGhbMF0ubGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmNlIHdlIGhpdCB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgZWRpdCBncmFwaCBvbiBzb21lIGRpYWdvbmFsIGssIHdlIGNhblxuICAgICAgICAvLyBkZWZpbml0ZWx5IHJlYWNoIHRoZSBlbmQgb2YgdGhlIGVkaXQgZ3JhcGggaW4gbm8gbW9yZSB0aGFuIGsgZWRpdHMsIHNvXG4gICAgICAgIC8vIHRoZXJlJ3Mgbm8gcG9pbnQgaW4gY29uc2lkZXJpbmcgYW55IG1vdmVzIHRvIGRpYWdvbmFsIGsrMSBhbnkgbW9yZSAoZnJvbVxuICAgICAgICAvLyB3aGljaCB3ZSdyZSBndWFyYW50ZWVkIHRvIG5lZWQgYXQgbGVhc3QgaysxIG1vcmUgZWRpdHMpLlxuICAgICAgICAvLyBTaW1pbGFybHksIG9uY2Ugd2UndmUgcmVhY2hlZCB0aGUgYm90dG9tIG9mIHRoZSBlZGl0IGdyYXBoLCB0aGVyZSdzIG5vXG4gICAgICAgIC8vIHBvaW50IGNvbnNpZGVyaW5nIG1vdmVzIHRvIGxvd2VyIGRpYWdvbmFscy5cbiAgICAgICAgLy8gV2UgcmVjb3JkIHRoaXMgZmFjdCBieSBzZXR0aW5nIG1pbkRpYWdvbmFsVG9Db25zaWRlciBhbmRcbiAgICAgICAgLy8gbWF4RGlhZ29uYWxUb0NvbnNpZGVyIHRvIHNvbWUgZmluaXRlIHZhbHVlIG9uY2Ugd2UndmUgaGl0IHRoZSBlZGdlIG9mXG4gICAgICAgIC8vIHRoZSBlZGl0IGdyYXBoLlxuICAgICAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBpcyBub3QgZmFpdGhmdWwgdG8gdGhlIG9yaWdpbmFsIGFsZ29yaXRobSBwcmVzZW50ZWQgaW5cbiAgICAgICAgLy8gTXllcnMncyBwYXBlciwgd2hpY2ggaW5zdGVhZCBwb2ludGxlc3NseSBleHRlbmRzIEQtcGF0aHMgb2ZmIHRoZSBlbmQgb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGggLSBzZWUgcGFnZSA3IG9mIE15ZXJzJ3MgcGFwZXIgd2hpY2ggbm90ZXMgdGhpcyBwb2ludFxuICAgICAgICAvLyBleHBsaWNpdGx5IGFuZCBpbGx1c3RyYXRlcyBpdCB3aXRoIGEgZGlhZ3JhbS4gVGhpcyBoYXMgbWFqb3IgcGVyZm9ybWFuY2VcbiAgICAgICAgLy8gaW1wbGljYXRpb25zIGZvciBzb21lIGNvbW1vbiBzY2VuYXJpb3MuIEZvciBpbnN0YW5jZSwgdG8gY29tcHV0ZSBhIGRpZmZcbiAgICAgICAgLy8gd2hlcmUgdGhlIG5ldyB0ZXh0IHNpbXBseSBhcHBlbmRzIGQgY2hhcmFjdGVycyBvbiB0aGUgZW5kIG9mIHRoZVxuICAgICAgICAvLyBvcmlnaW5hbCB0ZXh0IG9mIGxlbmd0aCBuLCB0aGUgdHJ1ZSBNeWVycyBhbGdvcml0aG0gd2lsbCB0YWtlIE8obitkXjIpXG4gICAgICAgIC8vIHRpbWUgd2hpbGUgdGhpcyBvcHRpbWl6YXRpb24gbmVlZHMgb25seSBPKG4rZCkgdGltZS5cbiAgICAgICAgbGV0IG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IC1JbmZpbml0eSwgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gSW5maW5pdHk7XG4gICAgICAgIC8vIE1haW4gd29ya2VyIG1ldGhvZC4gY2hlY2tzIGFsbCBwZXJtdXRhdGlvbnMgb2YgYSBnaXZlbiBlZGl0IGxlbmd0aCBmb3IgYWNjZXB0YW5jZS5cbiAgICAgICAgY29uc3QgZXhlY0VkaXRMZW5ndGggPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBkaWFnb25hbFBhdGggPSBNYXRoLm1heChtaW5EaWFnb25hbFRvQ29uc2lkZXIsIC1lZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoIDw9IE1hdGgubWluKG1heERpYWdvbmFsVG9Db25zaWRlciwgZWRpdExlbmd0aCk7IGRpYWdvbmFsUGF0aCArPSAyKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2VQYXRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZVBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSwgYWRkUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG9uZSBlbHNlIGlzIGdvaW5nIHRvIGF0dGVtcHQgdG8gdXNlIHRoaXMgdmFsdWUsIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwZXJmIG9wdGltaXNhdGlvbi4gVGhpcyB0eXBlLXZpb2xhdGluZyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY2FuQWRkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGFkZFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hhdCBuZXdQb3Mgd2lsbCBiZSBhZnRlciB3ZSBkbyBhbiBpbnNlcnRpb246XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZFBhdGhOZXdQb3MgPSBhZGRQYXRoLm9sZFBvcyAtIGRpYWdvbmFsUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgY2FuQWRkID0gYWRkUGF0aCAmJiAwIDw9IGFkZFBhdGhOZXdQb3MgJiYgYWRkUGF0aE5ld1BvcyA8IG5ld0xlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuUmVtb3ZlID0gcmVtb3ZlUGF0aCAmJiByZW1vdmVQYXRoLm9sZFBvcyArIDEgPCBvbGRMZW47XG4gICAgICAgICAgICAgICAgaWYgKCFjYW5BZGQgJiYgIWNhblJlbW92ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIHBhdGggaXMgYSB0ZXJtaW5hbCB0aGVuIHBydW5lXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwZXJmIG9wdGltaXNhdGlvbi4gVGhpcyB0eXBlLXZpb2xhdGluZyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgdGhlIGRpYWdvbmFsIHRoYXQgd2Ugd2FudCB0byBicmFuY2ggZnJvbS4gV2Ugc2VsZWN0IHRoZSBwcmlvclxuICAgICAgICAgICAgICAgIC8vIHBhdGggd2hvc2UgcG9zaXRpb24gaW4gdGhlIG9sZCBzdHJpbmcgaXMgdGhlIGZhcnRoZXN0IGZyb20gdGhlIG9yaWdpblxuICAgICAgICAgICAgICAgIC8vIGFuZCBkb2VzIG5vdCBwYXNzIHRoZSBib3VuZHMgb2YgdGhlIGRpZmYgZ3JhcGhcbiAgICAgICAgICAgICAgICBpZiAoIWNhblJlbW92ZSB8fCAoY2FuQWRkICYmIHJlbW92ZVBhdGgub2xkUG9zIDwgYWRkUGF0aC5vbGRQb3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gdGhpcy5hZGRUb1BhdGgoYWRkUGF0aCwgdHJ1ZSwgZmFsc2UsIDAsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChyZW1vdmVQYXRoLCBmYWxzZSwgdHJ1ZSwgMSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIGRpYWdvbmFsUGF0aCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm9sZFBvcyArIDEgPj0gb2xkTGVuICYmIG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgaGl0IHRoZSBlbmQgb2YgYm90aCBzdHJpbmdzLCB0aGVuIHdlIGFyZSBkb25lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb25lKHRoaXMuYnVpbGRWYWx1ZXMoYmFzZVBhdGgubGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpKSB8fCB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IGJhc2VQYXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heERpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWluKG1heERpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5EaWFnb25hbFRvQ29uc2lkZXIgPSBNYXRoLm1heChtaW5EaWFnb25hbFRvQ29uc2lkZXIsIGRpYWdvbmFsUGF0aCArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWRpdExlbmd0aCsrO1xuICAgICAgICB9O1xuICAgICAgICAvLyBQZXJmb3JtcyB0aGUgbGVuZ3RoIG9mIGVkaXQgaXRlcmF0aW9uLiBJcyBhIGJpdCBmdWdseSBhcyB0aGlzIGhhcyB0byBzdXBwb3J0IHRoZVxuICAgICAgICAvLyBzeW5jIGFuZCBhc3luYyBtb2RlIHdoaWNoIGlzIG5ldmVyIGZ1bi4gTG9vcHMgb3ZlciBleGVjRWRpdExlbmd0aCB1bnRpbCBhIHZhbHVlXG4gICAgICAgIC8vIGlzIHByb2R1Y2VkLCBvciB1bnRpbCB0aGUgZWRpdCBsZW5ndGggZXhjZWVkcyBvcHRpb25zLm1heEVkaXRMZW5ndGggKGlmIGdpdmVuKSxcbiAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSBpdCB3aWxsIHJldHVybiB1bmRlZmluZWQuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlZGl0TGVuZ3RoID4gbWF4RWRpdExlbmd0aCB8fCBEYXRlLm5vdygpID4gYWJvcnRBZnRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFleGVjRWRpdExlbmd0aCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoZWRpdExlbmd0aCA8PSBtYXhFZGl0TGVuZ3RoICYmIERhdGUubm93KCkgPD0gYWJvcnRBZnRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldCA9IGV4ZWNFZGl0TGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRUb1BhdGgocGF0aCwgYWRkZWQsIHJlbW92ZWQsIG9sZFBvc0luYywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBsYXN0ID0gcGF0aC5sYXN0Q29tcG9uZW50O1xuICAgICAgICBpZiAobGFzdCAmJiAhb3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbiAmJiBsYXN0LmFkZGVkID09PSBhZGRlZCAmJiBsYXN0LnJlbW92ZWQgPT09IHJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb2xkUG9zOiBwYXRoLm9sZFBvcyArIG9sZFBvc0luYyxcbiAgICAgICAgICAgICAgICBsYXN0Q29tcG9uZW50OiB7IGNvdW50OiBsYXN0LmNvdW50ICsgMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdC5wcmV2aW91c0NvbXBvbmVudCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCwgcHJldmlvdXNDb21wb25lbnQ6IGxhc3QgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IG5ld1Rva2Vucy5sZW5ndGgsIG9sZExlbiA9IG9sZFRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCBvbGRQb3MgPSBiYXNlUGF0aC5vbGRQb3MsIG5ld1BvcyA9IG9sZFBvcyAtIGRpYWdvbmFsUGF0aCwgY29tbW9uQ291bnQgPSAwO1xuICAgICAgICB3aGlsZSAobmV3UG9zICsgMSA8IG5ld0xlbiAmJiBvbGRQb3MgKyAxIDwgb2xkTGVuICYmIHRoaXMuZXF1YWxzKG9sZFRva2Vuc1tvbGRQb3MgKyAxXSwgbmV3VG9rZW5zW25ld1BvcyArIDFdLCBvcHRpb25zKSkge1xuICAgICAgICAgICAgbmV3UG9zKys7XG4gICAgICAgICAgICBvbGRQb3MrKztcbiAgICAgICAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbikge1xuICAgICAgICAgICAgICAgIGJhc2VQYXRoLmxhc3RDb21wb25lbnQgPSB7IGNvdW50OiAxLCBwcmV2aW91c0NvbXBvbmVudDogYmFzZVBhdGgubGFzdENvbXBvbmVudCwgYWRkZWQ6IGZhbHNlLCByZW1vdmVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tb25Db3VudCAmJiAhb3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbikge1xuICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IGNvbW1vbkNvdW50LCBwcmV2aW91c0NvbXBvbmVudDogYmFzZVBhdGgubGFzdENvbXBvbmVudCwgYWRkZWQ6IGZhbHNlLCByZW1vdmVkOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGJhc2VQYXRoLm9sZFBvcyA9IG9sZFBvcztcbiAgICAgICAgcmV0dXJuIG5ld1BvcztcbiAgICB9XG4gICAgZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNvbXBhcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNvbXBhcmF0b3IobGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0XG4gICAgICAgICAgICAgICAgfHwgKCEhb3B0aW9ucy5pZ25vcmVDYXNlICYmIGxlZnQudG9Mb3dlckNhc2UoKSA9PT0gcmlnaHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRW1wdHkoYXJyYXkpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXSkge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgY2FzdElucHV0KHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIHRva2VuaXplKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHZhbHVlKTtcbiAgICB9XG4gICAgam9pbihjaGFycykge1xuICAgICAgICAvLyBBc3N1bWVzIFZhbHVlVCBpcyBzdHJpbmcsIHdoaWNoIGlzIHRoZSBjYXNlIGZvciBtb3N0IHN1YmNsYXNzZXMuXG4gICAgICAgIC8vIFdoZW4gaXQncyBmYWxzZSwgZS5nLiBpbiBkaWZmQXJyYXlzLCB0aGlzIG1ldGhvZCBuZWVkcyB0byBiZSBvdmVycmlkZGVuIChlLmcuIHdpdGggYSBuby1vcClcbiAgICAgICAgLy8gWWVzLCB0aGUgY2FzdHMgYXJlIHZlcmJvc2UgYW5kIHVnbHksIGJlY2F1c2UgdGhpcyBwYXR0ZXJuIC0gb2YgaGF2aW5nIHRoZSBiYXNlIGNsYXNzIFNPUlQgT0ZcbiAgICAgICAgLy8gYXNzdW1lIHRva2VucyBhbmQgdmFsdWVzIGFyZSBzdHJpbmdzLCBidXQgbm90IGNvbXBsZXRlbHkgLSBpcyB3ZWlyZCBhbmQgamFua3kuXG4gICAgICAgIHJldHVybiBjaGFycy5qb2luKCcnKTtcbiAgICB9XG4gICAgcG9zdFByb2Nlc3MoY2hhbmdlT2JqZWN0cywgXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGNoYW5nZU9iamVjdHM7XG4gICAgfVxuICAgIGdldCB1c2VMb25nZXN0VG9rZW4oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYnVpbGRWYWx1ZXMobGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpIHtcbiAgICAgICAgLy8gRmlyc3Qgd2UgY29udmVydCBvdXIgbGlua2VkIGxpc3Qgb2YgY29tcG9uZW50cyBpbiByZXZlcnNlIG9yZGVyIHRvIGFuXG4gICAgICAgIC8vIGFycmF5IGluIHRoZSByaWdodCBvcmRlcjpcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IFtdO1xuICAgICAgICBsZXQgbmV4dENvbXBvbmVudDtcbiAgICAgICAgd2hpbGUgKGxhc3RDb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChsYXN0Q29tcG9uZW50KTtcbiAgICAgICAgICAgIG5leHRDb21wb25lbnQgPSBsYXN0Q29tcG9uZW50LnByZXZpb3VzQ29tcG9uZW50O1xuICAgICAgICAgICAgZGVsZXRlIGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBsYXN0Q29tcG9uZW50ID0gbmV4dENvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnRzLnJldmVyc2UoKTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50TGVuID0gY29tcG9uZW50cy5sZW5ndGg7XG4gICAgICAgIGxldCBjb21wb25lbnRQb3MgPSAwLCBuZXdQb3MgPSAwLCBvbGRQb3MgPSAwO1xuICAgICAgICBmb3IgKDsgY29tcG9uZW50UG9zIDwgY29tcG9uZW50TGVuOyBjb21wb25lbnRQb3MrKykge1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50c1tjb21wb25lbnRQb3NdO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkICYmIHRoaXMudXNlTG9uZ2VzdFRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IG5ld1Rva2Vucy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvbGRUb2tlbnNbb2xkUG9zICsgaV07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xkVmFsdWUubGVuZ3RoID4gdmFsdWUubGVuZ3RoID8gb2xkVmFsdWUgOiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4obmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1BvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgLy8gQ29tbW9uIGNhc2VcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCkge1xuICAgICAgICAgICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihvbGRUb2tlbnMuc2xpY2Uob2xkUG9zLCBvbGRQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgRGlmZiBmcm9tICcuL2Jhc2UuanMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVPcHRpb25zIH0gZnJvbSAnLi4vdXRpbC9wYXJhbXMuanMnO1xuY2xhc3MgTGluZURpZmYgZXh0ZW5kcyBEaWZmIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy50b2tlbml6ZSA9IHRva2VuaXplO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgaWdub3Jpbmcgd2hpdGVzcGFjZSwgd2UgbmVlZCB0byBub3JtYWxpc2UgbGluZXMgYnkgc3RyaXBwaW5nXG4gICAgICAgIC8vIHdoaXRlc3BhY2UgYmVmb3JlIGNoZWNraW5nIGVxdWFsaXR5LiAoVGhpcyBoYXMgYW4gYW5ub3lpbmcgaW50ZXJhY3Rpb25cbiAgICAgICAgLy8gd2l0aCBuZXdsaW5lSXNUb2tlbiB0aGF0IHJlcXVpcmVzIHNwZWNpYWwgaGFuZGxpbmc6IGlmIG5ld2xpbmVzIGdldCB0aGVpclxuICAgICAgICAvLyBvd24gdG9rZW4sIHRoZW4gd2UgRE9OJ1Qgd2FudCB0byB0cmltIHRoZSAqbmV3bGluZSogdG9rZW5zIGRvd24gdG8gZW1wdHlcbiAgICAgICAgLy8gc3RyaW5ncywgc2luY2UgdGhpcyB3b3VsZCBjYXVzZSB1cyB0byB0cmVhdCB3aGl0ZXNwYWNlLW9ubHkgbGluZSBjb250ZW50XG4gICAgICAgIC8vIGFzIGVxdWFsIHRvIGEgc2VwYXJhdG9yIGJldHdlZW4gbGluZXMsIHdoaWNoIHdvdWxkIGJlIHdlaXJkIGFuZFxuICAgICAgICAvLyBpbmNvbnNpc3RlbnQgd2l0aCB0aGUgZG9jdW1lbnRlZCBiZWhhdmlvciBvZiB0aGUgb3B0aW9ucy4pXG4gICAgICAgIGlmIChvcHRpb25zLmlnbm9yZVdoaXRlc3BhY2UpIHtcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhbGVmdC5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubmV3bGluZUlzVG9rZW4gfHwgIXJpZ2h0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuaWdub3JlTmV3bGluZUF0RW9mICYmICFvcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICAgICAgICBpZiAobGVmdC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmlnaHQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLmVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucyk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGxpbmVEaWZmID0gbmV3IExpbmVEaWZmKCk7XG5leHBvcnQgZnVuY3Rpb24gZGlmZkxpbmVzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZUcmltbWVkTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gZ2VuZXJhdGVPcHRpb25zKG9wdGlvbnMsIHsgaWdub3JlV2hpdGVzcGFjZTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG4vLyBFeHBvcnRlZCBzdGFuZGFsb25lIHNvIGl0IGNhbiBiZSB1c2VkIGZyb20ganNvbkRpZmYgdG9vLlxuZXhwb3J0IGZ1bmN0aW9uIHRva2VuaXplKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuc3RyaXBUcmFpbGluZ0NyKSB7XG4gICAgICAgIC8vIHJlbW92ZSBvbmUgXFxyIGJlZm9yZSBcXG4gdG8gbWF0Y2ggR05VIGRpZmYncyAtLXN0cmlwLXRyYWlsaW5nLWNyIGJlaGF2aW9yXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKTtcbiAgICB9XG4gICAgY29uc3QgcmV0TGluZXMgPSBbXSwgbGluZXNBbmROZXdsaW5lcyA9IHZhbHVlLnNwbGl0KC8oXFxufFxcclxcbikvKTtcbiAgICAvLyBJZ25vcmUgdGhlIGZpbmFsIGVtcHR5IHRva2VuIHRoYXQgb2NjdXJzIGlmIHRoZSBzdHJpbmcgZW5kcyB3aXRoIGEgbmV3IGxpbmVcbiAgICBpZiAoIWxpbmVzQW5kTmV3bGluZXNbbGluZXNBbmROZXdsaW5lcy5sZW5ndGggLSAxXSkge1xuICAgICAgICBsaW5lc0FuZE5ld2xpbmVzLnBvcCgpO1xuICAgIH1cbiAgICAvLyBNZXJnZSB0aGUgY29udGVudCBhbmQgbGluZSBzZXBhcmF0b3JzIGludG8gc2luZ2xlIHRva2Vuc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXNBbmROZXdsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBsaW5lID0gbGluZXNBbmROZXdsaW5lc1tpXTtcbiAgICAgICAgaWYgKGkgJSAyICYmICFvcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICAgICAgICByZXRMaW5lc1tyZXRMaW5lcy5sZW5ndGggLSAxXSArPSBsaW5lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0TGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0TGluZXM7XG59XG4iLCAiLyoqXG4gKiBSZXZpZXctcGFja2FnZSBwYXJzaW5nIGZvciB0aGUgQ29kZXgtc3R5bGUgY29udmVyc2F0aW9uIGNhcmQuXG4gKlxuICogVGhlIHBsdWdpbiBpbmplY3RzIHRoZSBwZW5kaW5nIGlubGluZSBjb21tZW50cyAocGx1cyB0aGVpciBkaWZmIGh1bmtzIGFuZFxuICogdGhlIG9wdGlvbmFsIEFJIHZlcmRpY3QpIGFzIG9uZSBwbGFpbiB1c2VyIG1lc3NhZ2UuIFRoaXMgbW9kdWxlIHJlLXBhcnNlc1xuICogdGhhdCBtZXNzYWdlIHRleHQgc28gdGhlIGNvbnZlcnNhdGlvbiBjYW4gcmVuZGVyIGl0IGFzIGEgY2FyZCBcdTIwMTQgZWFjaFxuICogY29tbWVudCBjbGlja2FibGUgdG8ganVtcCB0byB0aGUgbWF0Y2hpbmcgY2hhbmdlIGJsb2NrIGluIHRoZSByZXZpZXcgcGFuZWwuXG4gKlxuICogUHVyZSBmdW5jdGlvbnMgb25seTogdGhlIGNsaWVudCBidW5kbGUgY2Fubm90IGJlIGltcG9ydGVkIGluIG5vZGUsIHNvIHRoZVxuICogdW5pdCB0ZXN0IChzY3JpcHRzL3Jldmlldy1wYWNrYWdlLXRlc3QubWpzKSBidW5kbGVzIHRoaXMgbW9kdWxlIHdpdGggZXNidWlsZFxuICogYW5kIGV4ZXJjaXNlcyB0aGUgZXhhY3Qgc2FtZSBjb2RlIHRoZSBicm93c2VyIHJ1bnMuXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBSZXZpZXdQYWNrYWdlQ29tbWVudCB7XG4gIC8qKiBSZXBvLXJlbGF0aXZlIHBhdGggKHNhbWUgYXMgdGhlIHNlY3Rpb24gaGVhZGVyIHBhdGgpLiAqL1xuICBwYXRoOiBzdHJpbmdcbiAgLyoqIFBvc3QtY2hhbmdlIGxpbmUgKDEtYmFzZWQpOyBudWxsIHdoZW4gb25seSB0aGUgb2xkLWxpbmUgYW5jaG9yIGV4aXN0cy4gKi9cbiAgbGluZTogbnVtYmVyIHwgbnVsbFxuICAvKiogQ29tbWVudCB0ZXh0LiAqL1xuICB0ZXh0OiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXZpZXdQYWNrYWdlRmluZGluZyB7XG4gIHByaW9yaXR5OiAnUDAnIHwgJ1AxJyB8ICdQMicgfCAnUDMnXG4gIGZpbGU6IHN0cmluZ1xuICBsaW5lOiBudW1iZXJcbiAgdGl0bGU6IHN0cmluZ1xuICBkZXRhaWw6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJldmlld1BhY2thZ2Uge1xuICAvKiogV29ya3NwYWNlIHJvb3QgZW1iZWRkZWQgaW4gdGhlIG1lc3NhZ2UgKFx1NURFNVx1NEY1Q1x1NTMzQVx1RkYxQS4uLiksIHdoZW4gcHJlc2VudC4gKi9cbiAgd29ya3NwYWNlOiBzdHJpbmcgfCBudWxsXG4gIGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdXG4gIHZlcmRpY3Q6ICdjb3JyZWN0JyB8ICdpbmNvcnJlY3QnIHwgbnVsbFxuICBmaW5kaW5nczogUmV2aWV3UGFja2FnZUZpbmRpbmdbXVxufVxuXG4vKiogRmlyc3Qgbm9uLWVtcHR5IGxpbmUgb2YgdGhlIG1lc3NhZ2UgKHRoZSBtZXNzYWdlIGhlYWRlciBsaW5lKS4gKi9cbmNvbnN0IFJFVklFV19QUkVGSVggPSAnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBJ1xuXG4vKiogQHJldHVybnMgdHJ1ZSB3aGVuIHRoZSB0ZXh0IGlzIGEgY2FycmllZCByZXZpZXcgcGFja2FnZSAoY2FyZC13b3J0aHkpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmV2aWV3UGFja2FnZVRleHQodGV4dDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGZpcnN0ID0gZmlyc3ROb25FbXB0eUxpbmUodGV4dClcbiAgcmV0dXJuIGZpcnN0ICE9PSBudWxsICYmIGZpcnN0LnN0YXJ0c1dpdGgoUkVWSUVXX1BSRUZJWClcbn1cblxuZnVuY3Rpb24gZmlyc3ROb25FbXB0eUxpbmUodGV4dDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGZvciAoY29uc3QgcmF3IG9mIHRleHQuc3BsaXQoJ1xcbicpKSB7XG4gICAgY29uc3QgdCA9IHJhdy50cmltKClcbiAgICBpZiAodCAhPT0gJycpIHJldHVybiB0XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuLyoqXG4gKiBQYXJzZSBhIGNhcnJpZWQgcmV2aWV3LXBhY2thZ2UgbWVzc2FnZSBiYWNrIGludG8gc3RydWN0dXJlZCBkYXRhLlxuICogUmV0dXJucyBudWxsIHdoZW4gdGhlIHRleHQgaXMgbm90IGEgcmV2aWV3IHBhY2thZ2UgKHBsYWluIHVzZXIgbWVzc2FnZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVJldmlld1BhY2thZ2UodGV4dDogc3RyaW5nKTogUmV2aWV3UGFja2FnZSB8IG51bGwge1xuICBpZiAoIWlzUmV2aWV3UGFja2FnZVRleHQodGV4dCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHBrZzogUmV2aWV3UGFja2FnZSA9IHsgd29ya3NwYWNlOiBudWxsLCBjb21tZW50czogW10sIHZlcmRpY3Q6IG51bGwsIGZpbmRpbmdzOiBbXSB9XG4gIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdCgnXFxuJylcbiAgbGV0IGkgPSAwXG5cbiAgLy8gMS4gaGVhZGVyIGxpbmUgKHRoZSBwcmVmaXgpIFx1MjAxNCBhbHJlYWR5IG1hdGNoZWQgYnkgaXNSZXZpZXdQYWNrYWdlVGV4dC5cbiAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGgpIHtcbiAgICBjb25zdCB0ID0gbGluZXNbaV0udHJpbSgpXG4gICAgaSArPSAxXG4gICAgaWYgKHQgIT09ICcnKSBicmVha1xuICB9XG5cbiAgLy8gMi4gb3B0aW9uYWwgd29ya3NwYWNlIGxpbmUgcmlnaHQgYWZ0ZXIgdGhlIGhlYWRlci5cbiAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGgpIHtcbiAgICBjb25zdCB0ID0gbGluZXNbaV0udHJpbSgpXG4gICAgaWYgKHQgPT09ICcnKSB7XG4gICAgICBpICs9IDFcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGNvbnN0IHcgPSAvXlx1NURFNVx1NEY1Q1x1NTMzQVs6XHVGRjFBXVxccyooLispJC8uZXhlYyh0KVxuICAgIGlmICh3KSB7XG4gICAgICBwa2cud29ya3NwYWNlID0gd1sxXS50cmltKCkgfHwgbnVsbFxuICAgICAgaSArPSAxXG4gICAgfVxuICAgIGJyZWFrXG4gIH1cblxuICAvLyAzLiBzZWN0aW9uczogYCMjIDxwYXRoPmAgKGNvbW1lbnRzICsgb3B0aW9uYWwgYGBgZGlmZiBodW5rKSBhbmRcbiAgLy8gICAgYCMjIEFJIFx1OEJDNFx1NUJBMVx1N0VEM1x1OEJCQWAgKHZlcmRpY3QgKyBmaW5kaW5ncykuXG4gIGxldCBzZWN0aW9uOiBzdHJpbmcgfCBudWxsID0gbnVsbFxuICBmb3IgKDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcmF3ID0gbGluZXNbaV1cbiAgICBjb25zdCB0ID0gcmF3LnRyaW0oKVxuICAgIGlmICh0ID09PSAnJykgY29udGludWVcbiAgICBpZiAodC5zdGFydHNXaXRoKCcjIyAnKSkge1xuICAgICAgY29uc3QgdGl0bGUgPSB0LnNsaWNlKDMpLnRyaW0oKVxuICAgICAgc2VjdGlvbiA9IHRpdGxlID09PSAnQUkgXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBJyA/ICd2ZXJkaWN0JyA6IHRpdGxlXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAodC5zdGFydHNXaXRoKCdgYGAnKSkge1xuICAgICAgLy8gZGlmZiBmZW5jZSBvciBzdWdnZXN0aW9uIGZlbmNlIFx1MjAxNCBjb25zdW1lIHVudGlsIHRoZSBjbG9zaW5nIGZlbmNlLlxuICAgICAgaSArPSAxXG4gICAgICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCAmJiAhbGluZXNbaV0udHJpbSgpLnN0YXJ0c1dpdGgoJ2BgYCcpKSBpICs9IDFcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChzZWN0aW9uID09PSAndmVyZGljdCcpIHtcbiAgICAgIGlmICgvXHU4ODY1XHU0RTAxXHU1QjU4XHU1NzI4XHU5NUVFXHU5ODk4Ly50ZXN0KHQpIHx8IC9wYXRjaCBpcyBpbmNvcnJlY3QvaS50ZXN0KHQpKSBwa2cudmVyZGljdCA9ICdpbmNvcnJlY3QnXG4gICAgICBlbHNlIGlmICgvXHU4ODY1XHU0RTAxXHU2QjYzXHU3ODZFLy50ZXN0KHQpIHx8IC9wYXRjaCBpcyBjb3JyZWN0L2kudGVzdCh0KSkgcGtnLnZlcmRpY3QgPSAnY29ycmVjdCdcbiAgICAgIGNvbnN0IGYgPSAvXi1cXHMqXFxbKFBbMC0zXSlcXF1cXHMqKC4rPyk6KFxcZCspKD86LShcXGQrKSk/XFxzKyguKz8pKD86XFxzKlx1MjAxNFxccyooLiopKT8kLy5leGVjKHQpXG4gICAgICBpZiAoZikge1xuICAgICAgICBwa2cuZmluZGluZ3MucHVzaCh7IHByaW9yaXR5OiBmWzFdIGFzIFJldmlld1BhY2thZ2VGaW5kaW5nWydwcmlvcml0eSddLCBmaWxlOiBmWzJdLCBsaW5lOiBOdW1iZXIoZlszXSksIHRpdGxlOiBmWzVdLCBkZXRhaWw6IGZbNl0gPz8gJycgfSlcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChzZWN0aW9uICE9PSBudWxsICYmIHQuc3RhcnRzV2l0aCgnLSAnKSkge1xuICAgICAgY29uc3QgYm9keSA9IHQuc2xpY2UoMikudHJpbSgpXG4gICAgICBjb25zdCBlc2MgPSBlc2NhcGVSZWdleChzZWN0aW9uKVxuICAgICAgLy8gYC0gPHBhdGg+OjxsaW5lTmV3PjogPHRleHQ+YFxuICAgICAgY29uc3QgbU5ldyA9IG5ldyBSZWdFeHAoYF4ke2VzY306KFxcXFxkKyk6XFxcXHMqKC4qKSRgKS5leGVjKGJvZHkpXG4gICAgICBpZiAobU5ldykge1xuICAgICAgICBwa2cuY29tbWVudHMucHVzaCh7IHBhdGg6IHNlY3Rpb24sIGxpbmU6IE51bWJlcihtTmV3WzFdKSwgdGV4dDogbU5ld1syXSB9KVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgLy8gYC0gPHBhdGg+IChvbGQgbGluZSA8bGluZU9sZD4pOiA8dGV4dD5gXG4gICAgICBjb25zdCBtT2xkID0gbmV3IFJlZ0V4cChgXiR7ZXNjfSBcXFxcKG9sZCBsaW5lIChcXFxcZCspXFxcXCk6XFxcXHMqKC4qKSRgKS5leGVjKGJvZHkpXG4gICAgICBpZiAobU9sZCkge1xuICAgICAgICBwa2cuY29tbWVudHMucHVzaCh7IHBhdGg6IHNlY3Rpb24sIGxpbmU6IG51bGwsIHRleHQ6IG1PbGRbMl0gfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBrZ1xufVxuXG5mdW5jdGlvbiBlc2NhcGVSZWdleChzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpXG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFtQkEsbUJBQXFGOzs7QUNuQnJGLElBQXFCLE9BQXJCLE1BQTBCO0FBQUEsRUFDdEIsS0FBSyxRQUFRLFFBRWIsVUFBVSxDQUFDLEdBQUc7QUFDVixRQUFJO0FBQ0osUUFBSSxPQUFPLFlBQVksWUFBWTtBQUMvQixpQkFBVztBQUNYLGdCQUFVLENBQUM7QUFBQSxJQUNmLFdBQ1MsY0FBYyxTQUFTO0FBQzVCLGlCQUFXLFFBQVE7QUFBQSxJQUN2QjtBQUVBLFVBQU0sWUFBWSxLQUFLLFVBQVUsUUFBUSxPQUFPO0FBQ2hELFVBQU0sWUFBWSxLQUFLLFVBQVUsUUFBUSxPQUFPO0FBQ2hELFVBQU0sWUFBWSxLQUFLLFlBQVksS0FBSyxTQUFTLFdBQVcsT0FBTyxDQUFDO0FBQ3BFLFVBQU0sWUFBWSxLQUFLLFlBQVksS0FBSyxTQUFTLFdBQVcsT0FBTyxDQUFDO0FBQ3BFLFdBQU8sS0FBSyxtQkFBbUIsV0FBVyxXQUFXLFNBQVMsUUFBUTtBQUFBLEVBQzFFO0FBQUEsRUFDQSxtQkFBbUIsV0FBVyxXQUFXLFNBQVMsVUFBVTtBQUN4RCxRQUFJO0FBQ0osVUFBTSxPQUFPLENBQUMsVUFBVTtBQUNwQixjQUFRLEtBQUssWUFBWSxPQUFPLE9BQU87QUFDdkMsVUFBSSxVQUFVO0FBQ1YsbUJBQVcsV0FBWTtBQUFFLG1CQUFTLEtBQUs7QUFBQSxRQUFHLEdBQUcsQ0FBQztBQUM5QyxlQUFPO0FBQUEsTUFDWCxPQUNLO0FBQ0QsZUFBTztBQUFBLE1BQ1g7QUFBQSxJQUNKO0FBQ0EsVUFBTSxTQUFTLFVBQVUsUUFBUSxTQUFTLFVBQVU7QUFDcEQsUUFBSSxhQUFhO0FBQ2pCLFFBQUksZ0JBQWdCLFNBQVM7QUFDN0IsUUFBSSxR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O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFB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O0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsd0JBQXdCO0FBQUEsRUFDeEIseUJBQXlCO0FBQUEsRUFDekIsd0JBQXdCO0FBQUEsRUFDeEIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsWUFBWTtBQUFBLEVBQ1osZ0JBQWdCO0FBQUEsRUFDaEIsY0FBYztBQUFBLEVBQ2QsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZUFBZTtBQUFBLEVBQ2YsZUFBZTtBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsc0JBQXNCO0FBQUEsRUFDdEIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsb0JBQW9CO0FBQUEsRUFDcEIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsY0FBYztBQUFBLEVBQ2QsZUFBZTtBQUFBLEVBQ2YsZ0JBQWdCO0FBQUEsRUFDaEIsdUJBQXVCO0FBQUEsRUFDdkIsZ0JBQWdCO0FBQUEsRUFDaEIsa0JBQWtCO0FBQUEsRUFDbEIsa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsaUJBQWlCO0FBQUEsRUFDakIsa0JBQWtCO0FBQUEsRUFDbEIsZUFBZTtBQUFBLEVBQ2YsYUFBYTtBQUFBLEVBQ2Isa0JBQWtCO0FBQUEsRUFDbEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsZ0JBQWdCO0FBQUEsRUFDaEIsbUJBQW1CO0FBQUEsRUFDbkIsd0JBQXdCO0FBQUEsRUFDeEIsY0FBYztBQUFBLEVBQ2Qsd0JBQXdCO0FBQUEsRUFDeEIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsbUJBQW1CO0FBQUEsRUFDbkIsc0JBQXNCO0FBQUEsRUFDdEIsZUFBZTtBQUFBLEVBQ2YsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsaUJBQWlCO0FBQUEsRUFDakIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIseUJBQXlCO0FBQUEsRUFDekIsMkJBQTJCO0FBQUEsRUFDM0IscUJBQXFCO0FBQUEsRUFDckIsbUJBQW1CO0FBQUEsRUFDbkIscUJBQXFCO0FBQUEsRUFDckIscUJBQXFCO0FBQUEsRUFDckIsdUJBQXVCO0FBQUEsRUFDdkIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsWUFBWTtBQUFBLEVBQ1osZUFBZTtBQUFBLEVBQ2YsV0FBVztBQUFBLEVBQ1gsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsaUJBQWlCO0FBQUEsRUFDakIsY0FBYztBQUFBLEVBQ2QsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsbUJBQW1CO0FBQUEsRUFDbkIseUJBQXlCO0FBQUEsRUFDekIscUJBQXFCO0FBQUEsRUFDckIsbUJBQW1CO0FBQUEsRUFDbkIsbUJBQW1CO0FBQUEsRUFDbkIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIsc0JBQXNCO0FBQUEsRUFDdEIsbUJBQW1CO0FBQUEsRUFDbkIsdUJBQXVCO0FBQUEsRUFDdkIsbUJBQW1CO0FBQUEsRUFDbkIsa0JBQWtCO0FBQUEsRUFDbEIsaUJBQWlCO0FBQUEsRUFDakIsc0JBQXNCO0FBQUEsRUFDdEIsb0JBQW9CO0FBQUEsRUFDcEIsdUJBQXVCO0FBQUEsRUFDdkIsMkJBQTJCO0FBQUEsRUFDM0IsMEJBQTBCO0FBQUEsRUFDMUIsa0JBQWtCO0FBQUEsRUFDbEIsaUJBQWlC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QUNFLE1BQU07QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFFBQVE7QUFBQSxRQUNSLFFBQVEsT0FBTyxFQUFFLFVBQVUsSUFBSSxTQUFTO0FBQUEsTUFDMUM7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFHQSxNQUFJLE1BQU07QUFBQSxJQUFPO0FBQUEsSUFBMkIsTUFDMUMsSUFBSSxNQUFNO0FBQUEsTUFDUjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsUUFBUSxPQUFPLEVBQUUsVUFBVSxJQUFJLFNBQVM7QUFBQSxNQUMxQztBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQU1BLGFBQVcsT0FBTyxDQUFDLFFBQVEsVUFBVSxHQUFZO0FBQy9DLFFBQUksTUFBTTtBQUFBLE1BQU87QUFBQSxNQUEwQixNQUN6QyxJQUFJLE1BQU07QUFBQSxRQUNSO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTjtBQUFBLFVBQ0EsVUFBVTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBSUEsTUFBSSxNQUFNO0FBQUEsSUFBTztBQUFBLElBQXdCLE1BQ3ZDLElBQUksTUFBTTtBQUFBLE1BQ1I7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInZhbHVlIiwgIm5hbWUiLCAiY2FycmllZElkcyIsICJ0IiwgInNjcm9sbFRpbWVyIiwgImNsZWFyVGltZXIiXQp9Cg==

		})(module, module.exports, require);
		return module.exports;
	}
});
