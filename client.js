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
      let body = t.slice(2).trim();
      let source;
      const mTag = /^\[([sw])\]\s*(.+)$/.exec(body);
      if (mTag) {
        source = mTag[1] === "s" ? "session" : "workspace";
        body = mTag[2].trim();
      }
      const esc = escapeRegex(section);
      const mNew = new RegExp(`^${esc}:(\\d+):\\s*(.*)$`).exec(body);
      if (mNew) {
        pkg.comments.push({ path: section, line: Number(mNew[1]), text: mNew[2], source });
        continue;
      }
      const mOld = new RegExp(`^${esc} \\(old line (\\d+)\\):\\s*(.*)$`).exec(body);
      if (mOld) {
        pkg.comments.push({ path: section, line: null, text: mOld[2], source });
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
var FILES_URL = "diff-review/files";
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
function textLineCount(text) {
  if (text === "") return 0;
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}
function collectTurnChanges(nodes, startSeq, endSeq) {
  const files = /* @__PURE__ */ new Map();
  for (const node of nodes) {
    if (node.kind !== "tool-result" || node.seq < startSeq || node.seq > endSeq) continue;
    for (const change of changesFromToolResult(node.call, node)) {
      const current = files.get(change.path) ?? { path: change.path, added: 0, deleted: 0 };
      for (const hunk of change.hunks) {
        for (const part of diffLines(hunk.oldText ?? "", hunk.newText)) {
          if (part.added) current.added += textLineCount(part.value);
          else if (part.removed) current.deleted += textLineCount(part.value);
        }
      }
      files.set(change.path, current);
    }
  }
  return [...files.values()];
}
function sessionChangeToDiffFile(change) {
  let added = 0;
  let deleted = 0;
  const chunks = [`diff --git a/${change.path} b/${change.path}`, `--- a/${change.path}`, `+++ b/${change.path}`];
  for (const hunk of change.hunks) {
    const before = hunk.oldText ?? "";
    const after = hunk.newText;
    const beforeLines = textLineCount(before);
    const afterLines = textLineCount(after);
    chunks.push(`@@ -1,${beforeLines} +1,${afterLines} @@`);
    for (const part of diffLines(before, after)) {
      const prefix = part.added ? "+" : part.removed ? "-" : " ";
      const count = textLineCount(part.value);
      if (part.added) added += count;
      else if (part.removed) deleted += count;
      for (const line of part.value.split("\n").slice(0, part.value.endsWith("\n") ? -1 : void 0)) chunks.push(`${prefix}${line}`);
    }
  }
  return {
    path: change.path,
    xy: "M",
    status: "M",
    untracked: change.hunks.some((hunk) => hunk.oldText === null),
    staged: false,
    unstaged: true,
    added,
    deleted,
    diff: chunks.join("\n"),
    binary: false,
    mtime: 0,
    hunks: []
  };
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
.dsdr-commit-modal{position:absolute;z-index:10;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.42)}.dsdr-commit-card{display:flex;flex-direction:column;gap:16px;width:min(520px,calc(100% - 48px));padding:24px;border-radius:16px;background:var(--dsw-alias-bg-module-platform);box-shadow:var(--dsw-shadow-lv3)}.dsdr-commit-title{font-weight:600;color:var(--dsw-alias-label-primary)}.dsdr-commit-card .dsdr-commit-input{width:100%;min-height:38px}.dsdr-commit-include{display:flex;gap:9px;align-items:center;color:var(--dsw-alias-label-secondary);font-size:13px}.dsdr-commit-actions{display:flex;flex-wrap:wrap;gap:8px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:14px}
.dsdr-file-actions{display:flex;gap:3px;margin-left:6px}.dsdr-file-icon{width:22px;height:22px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font:16px/20px var(--dsw-font-sans);cursor:pointer}.dsdr-file-icon:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dsdr-file-icon-danger:hover{color:var(--dsw-alias-status-danger)}
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
.dsdr-hunk-bar{display:flex;align-items:center;gap:5px;padding:4px 12px;border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-fill-l2)}
.dsdr-hunk-action{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);font:18px/1 var(--dsw-font-sans);cursor:pointer}.dsdr-hunk-action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dsdr-hunk-action-stage:hover{color:var(--dsw-alias-state-success-primary)}.dsdr-hunk-action-revert:hover{color:var(--dsw-alias-status-danger)}.dsdr-hunk-action:disabled{cursor:default;opacity:.45}
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
/* --- Codex-style reply change summary (turn tail) --- */
.dsdr-turn-summary{max-width:min(720px,100%);margin:2px 0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-module-platform);overflow:hidden}
.dsdr-turn-summary-head{display:flex;align-items:center;gap:10px;padding:12px 14px}
.dsdr-turn-summary-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary)}
.dsdr-turn-summary-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}
.dsdr-turn-summary-stats{font-size:13px;font-variant-numeric:tabular-nums;white-space:nowrap}
.dsdr-turn-summary-add{color:var(--dsw-alias-state-success-primary)}
.dsdr-turn-summary-del{color:var(--dsw-alias-state-error-primary);margin-left:4px}
.dsdr-turn-summary-files{border-top:1px solid var(--dsw-alias-border-l1)}
.dsdr-turn-summary-file{display:flex;align-items:center;gap:8px;width:100%;padding:8px 14px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-family:var(--dsw-font-mono);font-size:12px;text-align:left;cursor:pointer}
.dsdr-turn-summary-file:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-turn-summary-file span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsdr-turn-summary-file-stats{margin-left:auto;flex:none;font-family:var(--dsw-font-sans,system-ui);font-size:12px}
/* --- Files drawer --- */
.dsdr-files-workspace{display:flex;min-height:0;flex:1;flex-direction:column;background:var(--dsw-alias-bg-module-platform)}
.dsdr-files-toolbar{display:flex;align-items:center;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsdr-files-search{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);padding:7px 9px;font:inherit;font-size:12px}
.dsdr-files-content{display:grid;grid-template-columns:minmax(230px,31%) 1fr;min-height:0;flex:1}
.dsdr-files-list{overflow:auto;border-right:1px solid var(--dsw-alias-border-l1);padding:8px 6px}
.dsdr-files-item{display:flex;width:100%;box-sizing:border-box;border:0;border-radius:7px;background:transparent;padding:6px 8px;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-mono);font-size:11px;line-height:16px;text-align:left;cursor:pointer}
.dsdr-files-item:hover,.dsdr-files-item-active{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsdr-files-editor{display:flex;min-width:0;flex-direction:column}.dsdr-files-path{padding:8px 12px;color:var(--dsw-alias-label-tertiary);font:11px var(--dsw-font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dsdr-code-editor{display:flex;min-height:0;flex:1;background:var(--dsw-alias-bg-layer-1);overflow:hidden}.dsdr-code-lines{flex:none;width:48px;box-sizing:border-box;overflow:hidden;padding:12px 8px 12px 0;border-right:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);font:12px/20px var(--dsw-font-mono);text-align:right;user-select:none}.dsdr-code-lines span{display:block;height:20px}
.dsdr-code-layer{position:relative;min-width:0;min-height:0;flex:1;overflow:hidden}.dsdr-code-highlight,.dsdr-files-text{box-sizing:border-box;position:absolute;inset:0;margin:0;padding:12px 14px;border:0;font:12px/20px var(--dsw-font-mono);tab-size:2;white-space:pre;overflow:auto}.dsdr-code-highlight{pointer-events:none;color:var(--dsw-alias-label-primary);background:transparent}.dsdr-files-text{resize:none;background:transparent;color:transparent;caret-color:var(--dsw-alias-label-primary);outline:0;-webkit-text-fill-color:transparent}.dsdr-files-text::selection{background:rgba(91,140,255,.35)}
.dsdr-code-keyword{color:#c586c0}.dsdr-code-string{color:#ce9178}.dsdr-code-comment{color:#6a9955}.dsdr-code-number{color:#b5cea8}.dsdr-code-plain{color:var(--dsw-alias-label-primary)}
.dsdr-image-preview{display:flex;align-items:center;justify-content:center;min-height:0;flex:1;overflow:auto;padding:24px;background:var(--dsw-alias-bg-layer-1)}.dsdr-image-preview img{max-width:100%;max-height:100%;object-fit:contain;box-shadow:var(--dsw-shadow-lv2)}.dsdr-files-unavailable{display:flex;align-items:center;justify-content:center;min-height:0;flex:1;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsdr-files-actions{display:flex;align-items:center;gap:6px;padding:8px 10px;border-top:1px solid var(--dsw-alias-border-l1)}
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
  "review.turnSummaryTitle": "\u5DF2\u4FEE\u6539 {n} \u4E2A\u6587\u4EF6",
  "review.turnSummaryReview": "\u8BC4\u5BA1",
  "files.title": "\u6587\u4EF6",
  "files.search": "\u7B5B\u9009\u6587\u4EF6\u2026",
  "files.save": "\u4FDD\u5B58",
  "files.saved": "\u5DF2\u4FDD\u5B58",
  "files.loading": "\u6B63\u5728\u8BFB\u53D6\u2026",
  "files.empty": "\u6CA1\u6709\u5339\u914D\u6587\u4EF6",
  // fallback.*: labels of the built-in image fallback viewer (FallbackUserBubble),
  // used when a plain user message carries images.
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
  "review.turnSummaryTitle": "Edited {n} files",
  "review.turnSummaryReview": "Review",
  "files.title": "Files",
  "files.search": "Filter files\u2026",
  "files.save": "Save",
  "files.saved": "Saved",
  "files.loading": "Loading\u2026",
  "files.empty": "No matching files",
  // fallback.*: labels of the built-in image fallback viewer (FallbackUserBubble),
  // used when a plain user message carries images.
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-hunk-action dsdr-hunk-action-stage", title: staged ? t("hunk.unstage") : t("hunk.stage"), "aria-label": staged ? t("hunk.unstage") : t("hunk.stage"), disabled: busy, onClick: () => onAction(staged ? "unstage" : "accept", hunk), children: staged ? "\u2212" : "+" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-hunk-action dsdr-hunk-action-revert", title: t("hunk.revert"), "aria-label": t("hunk.revert"), disabled: busy, onClick: () => onAction("revert", hunk), children: "\u21B6" })
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
function TurnChangeSummary({ matched, sessionId, useSession, useSessions, t }) {
  const nodes = useSession((snapshot) => snapshot.nodes);
  const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd);
  const turn = matched.turn;
  const files = (0, import_react.useMemo)(() => collectTurnChanges(nodes, turn.start?.seq ?? -Infinity, turn.end?.seq ?? Infinity), [nodes, turn]);
  const added = (0, import_react.useMemo)(() => files.reduce((total, file) => total + file.added, 0), [files]);
  const deleted = (0, import_react.useMemo)(() => files.reduce((total, file) => total + file.deleted, 0), [files]);
  if (files.length === 0) return null;
  const review = () => {
    if (!cwd) return;
    overlayStore.update((state) => {
      state.open = true;
      state.cwd = cwd;
      state.focus = { path: files[0].path, round: turn.turn, tab: "session" };
      state.key = state.key + 1;
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-turn-summary", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-turn-summary-head", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-turn-summary-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconDiff, {}) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-turn-summary-title", children: t("review.turnSummaryTitle", { n: files.length }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-turn-summary-stats", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-turn-summary-add", children: [
            "+",
            added
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-turn-summary-del", children: [
            "-",
            deleted
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-spacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", onClick: review, children: t("review.turnSummaryReview") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-turn-summary-files", children: files.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-turn-summary-file", onClick: review, title: file.path, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: file.path }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-turn-summary-file-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-turn-summary-add", children: [
          "+",
          file.added
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-turn-summary-del", children: [
          "-",
          file.deleted
        ] })
      ] })
    ] }, file.path)) })
  ] });
}
function highlightCode(value) {
  const token = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b(?:const|let|var|function|return|if|else|for|while|async|await|import|from|export|type|interface|class|new|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b)/g;
  return value.split(token).filter(Boolean).map((part, index) => {
    const kind = part.startsWith("//") || part.startsWith("/*") ? "comment" : part.startsWith('"') || part.startsWith("'") ? "string" : /^\d/.test(part) ? "number" : /^(const|let|var|function|return|if|else|for|while|async|await|import|from|export|type|interface|class|new|true|false|null|undefined)$/.test(part) ? "keyword" : "plain";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-code-" + kind, children: part }, index);
  });
}
function FilesWorkspace({ cwd, t, collapsed, onToggleDir }) {
  const [files, setFiles] = (0, import_react.useState)([]);
  const [filter, setFilter] = (0, import_react.useState)("");
  const [selected, setSelected] = (0, import_react.useState)(null);
  const [content, setContent] = (0, import_react.useState)("");
  const [fileKind, setFileKind] = (0, import_react.useState)("text");
  const [imageUrl, setImageUrl] = (0, import_react.useState)(null);
  const [mtime, setMtime] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(true);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [notice, setNotice] = (0, import_react.useState)(null);
  const savedContent = (0, import_react.useRef)("");
  const codeRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    let alive = true;
    void fetch(`${FILES_URL}?cwd=${encodeURIComponent(cwd)}`, { headers: { accept: "application/json" } }).then((res) => res.json()).then((data) => {
      if (alive) {
        setFiles(data.files ?? []);
        setLoading(false);
      }
    }).catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [cwd]);
  const shown = (0, import_react.useMemo)(() => files.filter((file) => file.path.toLowerCase().includes(filter.trim().toLowerCase())), [files, filter]);
  const tree = (0, import_react.useMemo)(() => buildFileTree(shown, (file) => file.path), [shown]);
  const open = async (path) => {
    setSelected(path);
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch(`${FILES_URL}?cwd=${encodeURIComponent(cwd)}&path=${encodeURIComponent(path)}`, { headers: { accept: "application/json" } });
      const data = await res.json();
      if (data.ok) {
        const next = data.content ?? "";
        savedContent.current = next;
        setContent(next);
        setFileKind(data.kind ?? "text");
        setImageUrl(data.dataUrl ?? null);
        setMtime(data.mtime ?? null);
      } else setNotice(data.error ?? "Failed to read file");
    } catch {
      setNotice("Failed to read file");
    } finally {
      setLoading(false);
    }
  };
  const save = async () => {
    if (!selected || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch(FILES_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cwd, path: selected, content, mtime }) });
      const data = await res.json();
      if (data.ok) {
        savedContent.current = content;
        setMtime(data.mtime ?? mtime);
        setNotice(t("files.saved"));
      } else setNotice(data.error ?? "Failed to save file");
    } catch {
      setNotice("Failed to save file");
    } finally {
      setSaving(false);
    }
  };
  (0, import_react.useEffect)(() => {
    if (!selected || loading || saving || content === savedContent.current) return;
    const timer = window.setTimeout(() => void save(), 800);
    return () => window.clearTimeout(timer);
  }, [content, selected, loading, saving, mtime]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dsdr-files-workspace", "aria-label": t("files.title"), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-files-toolbar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dsdr-files-search", value: filter, onChange: (event) => setFilter(event.target.value), placeholder: t("files.search"), autoFocus: true }) }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-files-content", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-files-list", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          FileTreeView,
          {
            nodes: tree,
            collapsed,
            onToggleDir,
            depth: 0,
            renderLeaf: (leaf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: `dsdr-files-item${selected === leaf.path ? " dsdr-files-item-active" : ""}`, onClick: () => void open(leaf.path), title: leaf.path, children: leaf.name })
          }
        ),
        !loading && shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-empty", children: t("files.empty") }) : null
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-files-editor", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-files-path", children: selected ?? (loading ? t("files.loading") : "") }),
        selected && fileKind === "text" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-code-editor", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-code-lines", "aria-hidden": "true", children: content.split("\n").map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: index + 1 }, index)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-code-layer", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { ref: codeRef, className: "dsdr-code-highlight", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: highlightCode(content) }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { className: "dsdr-files-text", value: content, onChange: (event) => setContent(event.target.value), onScroll: (event) => {
              if (codeRef.current) {
                codeRef.current.scrollTop = event.currentTarget.scrollTop;
                codeRef.current.scrollLeft = event.currentTarget.scrollLeft;
              }
            }, spellCheck: false })
          ] })
        ] }) : null,
        selected && fileKind === "image" && imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-image-preview", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: imageUrl, alt: selected }) }) : null,
        selected && fileKind === "binary" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-files-unavailable", children: "\u6B64\u4E8C\u8FDB\u5236\u6587\u4EF6\u4E0D\u53EF\u9884\u89C8" }) : null,
        selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-files-actions", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-notice", children: saving ? t("files.loading") : notice ?? "" }) }) : null
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
  const jump = (path, line, source) => {
    if (!targetCwd) return;
    overlayStore.update((d) => {
      d.open = true;
      d.cwd = targetCwd;
      d.focus = { path, line, tab: source === "session" ? "session" : "workspace" };
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
          onClick: () => jump(c.path, c.line ?? void 0, c.source),
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
function DiffReviewComposerDock({ sessionId, useSessions, sessions, t }) {
  const cwd = useSessions((s) => s.byId[sessionId]?.cwd);
  const pending = (0, import_react.useSyncExternalStore)(pendingCommentsStore.subscribe, pendingCommentsStore.getSnapshot);
  const [dismissed, setDismissed] = (0, import_react.useState)(false);
  const [carryFlash, setCarryFlash] = (0, import_react.useState)(null);
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
        const tag = c.source === "session" ? "[s]" : "[w]";
        lines.push(`- ${tag} ${path}${anchor}: ${c.text}`);
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
    const carriedIds = unsentComments.map((c) => c.id);
    sentStore.update((d) => {
      const prev = d[cwd] ?? { sentCommentIds: [], sentReviewKey: null };
      d[cwd] = {
        sentCommentIds: [.../* @__PURE__ */ new Set([...prev.sentCommentIds, ...carriedIds])],
        sentReviewKey: reviewPending ? reviewKey : prev.sentReviewKey
      };
    });
  };
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
  const [commitOpen, setCommitOpen] = (0, import_react.useState)(false);
  const [includeUnstaged, setIncludeUnstaged] = (0, import_react.useState)(false);
  const [history, setHistory] = (0, import_react.useState)([]);
  const [selectedCommit, setSelectedCommit] = (0, import_react.useState)(null);
  const [commitDiff, setCommitDiff] = (0, import_react.useState)(null);
  const [commitDiffLoading, setCommitDiffLoading] = (0, import_react.useState)(false);
  const [selectedCommitFile, setSelectedCommitFile] = (0, import_react.useState)(null);
  const [comments, setComments] = (0, import_react.useState)([]);
  const [commentEditor, setCommentEditor] = (0, import_react.useState)(null);
  const [commentText, setCommentText] = (0, import_react.useState)("");
  const [scope, setScope] = (0, import_react.useState)("last-turn");
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
  const [surface, setSurface] = (0, import_react.useState)("review");
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
  const lastTurnFiles = (0, import_react.useMemo)(() => {
    const last = rounds.at(-1);
    return last ? last.changes.filter((change) => change.hasDiff).map(sessionChangeToDiffFile) : [];
  }, [rounds]);
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
      setTab("workspace");
      setScope("last-turn");
      setSelected(focus.path);
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
  const scopeFiles = (0, import_react.useMemo)(() => {
    switch (scope) {
      case "unstaged":
        return unstagedFiles;
      case "staged":
        return stagedFiles;
      case "branch":
        return baseStatus?.files ?? [];
      case "last-turn": {
        return lastTurnFiles;
      }
      default:
        return files;
    }
  }, [scope, unstagedFiles, stagedFiles, baseStatus, files, lastTurnFiles]);
  const allowActions = scope !== "branch" && scope !== "commit" && scope !== "last-turn";
  const reviewableFiles = scope === "branch" ? baseStatus?.files?.length ?? 0 : files.length;
  const stagedCount = stagedFiles.length;
  const stagedTree = (0, import_react.useMemo)(() => buildFileTree(stagedFiles, (f) => f.path), [stagedFiles]);
  const unstagedTree = (0, import_react.useMemo)(() => buildFileTree(unstagedFiles, (f) => f.path), [unstagedFiles]);
  const scopeTree = (0, import_react.useMemo)(() => buildFileTree(scopeFiles, (f) => f.path), [scopeFiles]);
  const commitFilesTree = (0, import_react.useMemo)(
    () => commitDiff?.ok ? buildFileTree(commitDiff.files, (f) => f.path) : [],
    [commitDiff]
  );
  (0, import_react.useEffect)(() => {
    if (scope === "last-turn" && selected === null && lastTurnFiles.length > 0) setSelected(lastTurnFiles[0].path);
  }, [scope, selected, lastTurnFiles]);
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-file-stat", children: file.binary ? t("review.binary") : t("review.changes", { added: file.added, deleted: file.deleted }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-file-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon", title: t("hunk.stage"), disabled: busy, onClick: (event) => {
            event.stopPropagation();
            void runApply("accept", file.path);
          }, children: "+" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon dsdr-file-icon-danger", title: t("hunk.revert"), disabled: busy, onClick: (event) => {
            event.stopPropagation();
            void runApply("revert", file.path);
          }, children: "\u21B6" })
        ] })
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
        const tag = c.source === "session" ? "[s]" : "[w]";
        lines.push(`- ${tag} ${path}${anchor}: ${c.text}`);
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
  const submitCommit = async (pushAfter) => {
    if (!activeCwd || busy) return;
    if (includeUnstaged) {
      setBusy(true);
      const staged = await applyChanges(activeCwd, "accept");
      setBusy(false);
      if (!staged.ok) {
        setNotice({ kind: "error", text: staged.error || t("review.loadError") });
        return;
      }
    }
    await onCommit();
    if (pushAfter) onPush(true);
    setCommitOpen(false);
  };
  const onPush = (immediate = false) => {
    if (busy || !activeCwd) return;
    if (!immediate && confirm !== "push") {
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
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-tabs", role: "tablist", "aria-label": t("review.title"), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", role: "tab", "aria-selected": surface === "review", className: `dsdr-tab${surface === "review" ? " dsdr-tab-active" : ""}`, onClick: () => setSurface("review"), children: t("review.title") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", role: "tab", "aria-selected": surface === "files", className: `dsdr-tab${surface === "files" ? " dsdr-tab-active" : ""}`, onClick: () => setSurface("files"), children: t("files.title") })
              ] }),
              surface === "review" && tab === "workspace" && status?.isRepo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-scope", children: [
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
              surface === "review" && tab === "workspace" && allowActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy || files.length === 0 && stagedCount === 0, onClick: () => setCommitOpen(true), children: t("review.commit") }) : null,
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", "aria-label": t("review.close"), onClick: close, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconX, {}) })
            ] }),
            commitOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-commit-modal", role: "dialog", "aria-modal": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-commit-card", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-commit-title", children: status?.branch ?? t("review.commit") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "dsdr-commit-input", autoFocus: true, value: commitMessage, placeholder: t("review.commitPlaceholder"), onChange: (event) => setCommitMessage(event.target.value) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dsdr-commit-include", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: includeUnstaged, onChange: (event) => setIncludeUnstaged(event.target.checked) }),
                " Include unstaged changes"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-commit-actions", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", onClick: () => setCommitOpen(false), children: t("comment.cancel") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy || !commitMessage.trim(), onClick: () => void submitCommit(false), children: t("review.commit") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsdr-btn dsdr-btn-primary", disabled: busy || !commitMessage.trim(), onClick: () => void submitCommit(true), children: [
                  t("review.commit"),
                  " and ",
                  t("review.push")
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-btn", disabled: busy || (status?.ahead ?? 0) === 0, onClick: () => {
                  setCommitOpen(false);
                  onPush(true);
                }, children: t("review.push") })
              ] })
            ] }) }) : null,
            surface === "files" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilesWorkspace, { cwd, t, collapsed: collapsedDirs, onToggleDir: toggleDir }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
                          onClick: () => setCommitOpen(true),
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
                      allowActions && selectedFile.unstaged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon", title: t("hunk.stage"), "aria-label": t("hunk.stage"), disabled: busy, onClick: () => onFileAction("accept", selectedFile.path), children: "+" }) : null,
                      allowActions && selectedFile.staged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon", title: t("hunk.unstage"), "aria-label": t("hunk.unstage"), disabled: busy, onClick: () => onFileAction("unstage", selectedFile.path), children: "\u2212" }) : null,
                      allowActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon dsdr-file-icon-danger", title: t("hunk.revert"), "aria-label": t("hunk.revert"), disabled: busy, onClick: () => onFileAction("revert", selectedFile.path), children: "\u21B6" }) : null
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
              ] })
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
    "conversation.chat.turnTail",
    () => ctx.slots.register(
      {
        name: "conversation.chat.turnTail",
        select: (owner) => owner,
        priority: -10,
        locale: LOCALE_NS
      },
      TurnChangeSummary
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIiwgInNyYy9jbGllbnQvcmV2aWV3LXBhY2thZ2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRGlmZi1yZXZpZXcgcGx1Z2luIFx1MjAxNCBjbGllbnQgaGFsZi5cbiAqXG4gKiBDb2RleC1zdHlsZSByZXZpZXcgd2l0aCB0d28gc291cmNlczpcbiAqXG4gKiAxLiAqKlx1NEYxQVx1OEJERFx1NjZGNFx1NjUzOSAoU2Vzc2lvbiBjaGFuZ2VzKSoqIFx1MjAxNCB3aGF0IHRoZSBhZ2VudCBjaGFuZ2VkIGluIGVhY2ggcm91bmQgb2ZcbiAqICAgIHRoaXMgY29udmVyc2F0aW9uLCBkZXJpdmVkIGZyb20gdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdDogZWFjaCB0b29sXG4gKiAgICByZXN1bHQgdGhhdCBjYXJyaWVkIGZpbGUgZGlmZnMgYmVjb21lcyBjaGFuZ2UgZW50cmllcyAoaG9zdC1jb21wdXRlZFxuICogICAgYHJlc3VsdFZpZXdgIGh1bmtzLCBlbHNlIGNhbGwtdmlldy9tZXRhIGRpZmZzLCBlbHNlIGEgcGF0aC1vbmx5IGVudHJ5KS5cbiAqICAgIFdvcmtzIHdpdGggb3Igd2l0aG91dCBnaXQsIGFuZCBzaG93cyBhIGNoYW5nZSBldmVuIHdoZW4gbm8gZGlmZiB0ZXh0IGlzXG4gKiAgICBhdmFpbGFibGUgKHBhdGgtb25seSkuXG4gKiAyLiAqKlx1NURFNVx1NEY1Q1x1NTMzQSAoV29ya3NwYWNlKSoqIFx1MjAxNCB0aGUgZ2l0IHdvcmtpbmcgdHJlZSdzIHVuY29tbWl0dGVkIGNoYW5nZXNcbiAqICAgIChzdGFnZWQgKyB1bnN0YWdlZCArIHVudHJhY2tlZCkgd2l0aCBwZXItZmlsZSAvIGFsbC1maWxlIGFjY2VwdCAoc3RhZ2UpXG4gKiAgICBhbmQgcmV2ZXJ0IChkaXNjYXJkKSB0aHJvdWdoIHRoZSBwbHVnaW4ncyBzZXJ2ZXIgcm91dGVzLlxuICpcbiAqIFRoZSByZXZpZXcgc3VyZmFjZSBtb3VudHMgaW4gYHNoZWxsLm92ZXJsYXlgIChyb290IHNjb3BlKS4gU3RhdGUgaGFuZC1vZmZcbiAqIGJldHdlZW4gdGhlIHNlc3Npb24tc2NvcGVkIGhlYWRlciB0cmlnZ2VyIGFuZCB0aGUgcm9vdC1zY29wZWQgb3ZlcmxheSBnb2VzXG4gKiB0aHJvdWdoIGEgbW9kdWxlLWxldmVsIHNuYXBzaG90IHN0b3JlOyB0aGUgY29udmVyc2F0aW9uIHNuYXBzaG90IGZvciB0aGVcbiAqIGN1cnJlbnQgc2Vzc2lvbiBpcyByZWFkIHJlYWN0aXZlbHkgdGhyb3VnaCBgY3R4LnNlc3Npb25zYCAoaW5qZWN0ZWQgdmlhIHRoZVxuICogb3ZlcmxheSByZWdpc3RyYXRpb24ncyBpbmplY3QgZmFjZSkuXG4gKi9cbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSwgdXNlU3luY0V4dGVybmFsU3RvcmUsIEZyYWdtZW50IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENTU1Byb3BlcnRpZXMsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBkaWZmTGluZXMgfSBmcm9tICdkaWZmJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0LCBJU2Vzc2lvbnMsIFNlc3Npb25MaXN0U3RhdGUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB7IGNyZWF0ZVNuYXBzaG90U3RvcmUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgUHJvcHNMb2NhbGUsIFByb3BzUnVudGltZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNsb3RzJ1xuaW1wb3J0IHR5cGUgeyBDb252ZXJzYXRpb25Ob2RlLCBUb29sUmVzdWx0Tm9kZSwgVXNlck1lc3NhZ2VOb2RlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFNlc3Npb25JZCwgVG9vbFJlc3VsdFZpZXcgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWFwaS1yZW1vdGVzL2NsaWVudCdcbmltcG9ydCB7IEljb25DaGV2cm9uRG93bk91dGxpbmUxNCwgd3JpdGVDbGlwYm9hcmQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuaW1wb3J0IHsgSW1hZ2VHYWxsZXJ5IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktYXR0YWNobWVudCdcbmltcG9ydCB0eXBlIHsgSW1hZ2VBdHRhY2htZW50UmVmIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hdHRhY2htZW50J1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEZpbGVSZWFkUmVzcG9uc2UsIEZpbGVzTGlzdFJlc3BvbnNlLCBGaWxlV3JpdGVSZXNwb25zZSwgR2l0UmVzcG9uc2UsIEhpc3RvcnlSZXNwb25zZSwgUHJSZXNwb25zZSwgUmVwb3NSZXNwb25zZSwgUmV2aWV3Q29tbWVudCwgUmV2aWV3RmluZGluZywgUmV2aWV3UmVzcG9uc2UsIFN0YXR1c1Jlc3BvbnNlLCBXb3Jrc3BhY2VGaWxlRW50cnkgfSBmcm9tICcuLi9zaGFyZWQvdHlwZXMudHMnXG5pbXBvcnQgeyBwYXJzZVJldmlld1BhY2thZ2UsIGlzUmV2aWV3UGFja2FnZVRleHQgfSBmcm9tICcuL3Jldmlldy1wYWNrYWdlLnRzJ1xuaW1wb3J0IHR5cGUgeyBSZXZpZXdQYWNrYWdlLCBSZXZpZXdQYWNrYWdlQ29tbWVudCwgUmV2aWV3UGFja2FnZUZpbmRpbmcgfSBmcm9tICcuL3Jldmlldy1wYWNrYWdlLnRzJ1xuXG5leHBvcnQgY29uc3QgbmFtZSA9ICdkaWZmLXJldmlldydcblxuLyoqIFJlcXVpcmVkIGNsaWVudCBzZXJ2aWNlcyAoZmliZXIgaW5qZWN0KS4gKi9cbmV4cG9ydCBjb25zdCBpbmplY3QgPSBbJ3Nlc3Npb25zJywgJ3Nsb3RzJywgJ2xvY2FsZSddXG5cbmNvbnN0IExPQ0FMRV9OUyA9ICdkaWZmLXJldmlldydcbi8qKiBNYXggY29tbWVudCBjaGlwcyBzaG93biBpbiB0aGUgZG9jayByb3cgYmVmb3JlIGNvbGxhcHNpbmcgaW50byArTi4gKi9cbmNvbnN0IE1BWF9ET0NLX0NISVBTID0gNFxuY29uc3QgU1RBVFVTX1VSTCA9ICdkaWZmLXJldmlldy9zdGF0dXMnXG5jb25zdCBBUFBMWV9VUkwgPSAnZGlmZi1yZXZpZXcvYXBwbHknXG5jb25zdCBBUFBMWV9IVU5LX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseS1odW5rJ1xuY29uc3QgQ09NTUlUX1VSTCA9ICdkaWZmLXJldmlldy9jb21taXQnXG5jb25zdCBQVVNIX1VSTCA9ICdkaWZmLXJldmlldy9wdXNoJ1xuY29uc3QgSElTVE9SWV9VUkwgPSAnZGlmZi1yZXZpZXcvaGlzdG9yeSdcbmNvbnN0IENPTU1JVF9ESUZGX1VSTCA9ICdkaWZmLXJldmlldy9jb21taXQtZGlmZidcbmNvbnN0IENPTU1FTlRTX1VSTCA9ICdkaWZmLXJldmlldy9jb21tZW50cydcbmNvbnN0IEJSQU5DSEVTX1VSTCA9ICdkaWZmLXJldmlldy9icmFuY2hlcydcbmNvbnN0IFJFVklFV19VUkwgPSAnZGlmZi1yZXZpZXcvcmV2aWV3J1xuY29uc3QgUFJfVVJMID0gJ2RpZmYtcmV2aWV3L3ByJ1xuY29uc3QgUkVQT1NfVVJMID0gJ2RpZmYtcmV2aWV3L3JlcG9zJ1xuY29uc3QgRklMRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2ZpbGVzJ1xuY29uc3QgT1BFTl9FRElUT1JfVVJMID0gJ29wZW4tZWRpdG9yL29wZW4nXG5jb25zdCBTVFlMRV9UQUcgPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldy9yZXZpZXcuY3NzJ1xuXG4vKiogT3BlbiBzdGF0ZSBzaGFyZWQgYmV0d2VlbiB0aGUgaGVhZGVyIHRyaWdnZXIgKHNlc3Npb24gc2NvcGUpIGFuZCB0aGUgb3ZlcmxheSAocm9vdCBzY29wZSkuICovXG5jb25zdCBvdmVybGF5U3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPHsgb3BlbjogYm9vbGVhbjsgY3dkOiBzdHJpbmcgfCBudWxsOyBrZXk6IG51bWJlcjsgZm9jdXM/OiB7IHBhdGg6IHN0cmluZzsgbGluZT86IG51bWJlcjsgcm91bmQ/OiBudW1iZXI7IHRhYj86ICdzZXNzaW9uJyB8ICd3b3Jrc3BhY2UnIH0gfCBudWxsIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxuICBmb2N1czogbnVsbCxcbn0pXG5cbi8qKlxuICogUGVuZGluZyBpbmxpbmUgY29tbWVudHMgc3VyZmFjZWQgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSkuIFRoZVxuICogcmV2aWV3IG92ZXJsYXkgc3luY3MgaXRzIHdvcmtzcGFjZSBjb21tZW50cyAocGx1cyB0aGUgZGlmZiBjb250ZXh0IGFuZCB0aGVcbiAqIGxhc3QgQUkgcmV2aWV3IHJlc3VsdCkgaGVyZTsgdGhlIGNvbXBvc2VyIGRvY2sgcmVhZHMgdGhlbSBhbmQgY2FycmllcyBhXG4gKiBmdWxsIHJldmlldyBwYWNrYWdlIHdpdGggdGhlIHVzZXIncyBuZXh0IG1lc3NhZ2UuXG4gKi9cbmludGVyZmFjZSBQZW5kaW5nQ29tbWVudHMge1xuICBjd2Q6IHN0cmluZyB8IG51bGxcbiAgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXVxuICAvKiogVW5pZmllZCBkaWZmIHRleHQgcGVyIGNvbW1lbnRlZCBwYXRoIChjb250ZXh0IGZvciB0aGUgY2FycmllZCBtZXNzYWdlKS4gKi9cbiAgZGlmZnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgLyoqIExhc3QgQUkgcmV2aWV3IHJlc3VsdCAodmVyZGljdCArIGZpbmRpbmdzKSwgYXBwZW5kZWQgdG8gdGhlIGNhcnJpZWQgbWVzc2FnZS4gKi9cbiAgcmV2aWV3OiBSZXZpZXdSZXNwb25zZSB8IG51bGxcbn1cbmNvbnN0IHBlbmRpbmdDb21tZW50c1N0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxQZW5kaW5nQ29tbWVudHM+KHtcbiAgY3dkOiBudWxsLFxuICBjb21tZW50czogW10sXG4gIGRpZmZzOiB7fSxcbiAgcmV2aWV3OiBudWxsLFxufSlcblxuLyoqXG4gKiBEdXJhYmxlLCBwZXItd29ya3NwYWNlIFwiYWxyZWFkeSBjYXJyaWVkXCIgc3RhdGUgKHN1cnZpdmVzIHJlbG9hZHM7IGlzb2xhdGVkXG4gKiBwZXIgY3dkIHNvIGNvbW1lbnRzIHNlbnQgaW4gb25lIHdvcmtzcGFjZSBuZXZlciBmaWx0ZXIgYW5vdGhlcidzKS5cbiAqL1xuY29uc3Qgc2VudFN0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxSZWNvcmQ8c3RyaW5nLCB7IHNlbnRDb21tZW50SWRzOiBzdHJpbmdbXTsgc2VudFJldmlld0tleTogc3RyaW5nIHwgbnVsbCB9Pj4oe30sIHsgcGVyc2lzdDogeyBuYW1lOiAnZHNkci1yZXZpZXctc2VudCcgfSB9KVxuXG4vKiogSW5qZWN0IHRleHQgaW50byBhIHNlc3Npb24gYXMgYSB1c2VyIG1lc3NhZ2U7IGZhbGxzIGJhY2sgdG8gdGhlIGNsaXBib2FyZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluamVjdFRvU2Vzc2lvbihzZXNzaW9uczogSVNlc3Npb25zIHwgdW5kZWZpbmVkLCBzZXNzaW9uSWQ6IFNlc3Npb25JZCB8IG51bGwsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8J3NlbnQnIHwgJ2NvcGllZCcgfCAnZmFpbGVkJz4ge1xuICBjb25zdCBiaW5kaW5nID0gc2Vzc2lvbklkID8gc2Vzc2lvbnM/LmJpbmRpbmcoc2Vzc2lvbklkKSA6IHVuZGVmaW5lZFxuICBjb25zdCBzZXNzaW9uID0gYmluZGluZz8uc2Vzc2lvblxuICBpZiAoc2Vzc2lvbikge1xuICAgIHRyeSB7XG4gICAgICAvLyAnc3RlZXInIChub3QgJ3F1ZXVlJyk6IHRoZSByZXZpZXcgcGFja2FnZSBpcyBpbmplY3RlZCBhcyBhIHN0ZWVyaW5nXG4gICAgICAvLyBtZXNzYWdlIFx1MjAxNCB0aGUgYWdlbnQgaGFuZGxlcyBpdCBvbiBpdHMgbmV4dCBzdGVwIChvciB0aGUgaWRsZSBhZ2VudCBpc1xuICAgICAgLy8gd29rZW4gaW1tZWRpYXRlbHkpLCBzbyBpdCBuZXZlciBzaG93cyB1cCBhcyBhIHF1ZXVlZCBpdGVtIGFib3ZlIHRoZVxuICAgICAgLy8gaW5wdXQuICdxdWV1ZScgd291bGQgYXBwZW5kIGFmdGVyIHRoZSBjdXJyZW50IHR1cm4gYW5kIHN1cmZhY2UgYXMgYVxuICAgICAgLy8gXCJcdTYzOTJcdTk2MUZcdTRGRTFcdTYwNkZcIiBzdHJpcCBpbnN0ZWFkLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2Vzc2lvbi5wcm9tcHQoW3sgdHlwZTogJ3RleHQnLCB0ZXh0IH1dLCAnc3RlZXInKVxuICAgICAgaWYgKHJlc3VsdC5vaykgcmV0dXJuICdzZW50J1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBjb3B5IGZhbGxiYWNrXG4gICAgfVxuICB9XG4gIHRyeSB7XG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgICByZXR1cm4gJ2NvcGllZCdcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICdmYWlsZWQnXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSZXZpZXcgcHJlZmVyZW5jZXMgKGZvbnQgLyBzaXplIC8gcGFuZWwgZ2VvbWV0cnkpLCBzaGFyZWQgYnkgdGhlIG92ZXJsYXlcbi8vIGFuZCB0aGUgU2V0dGluZ3MgXHUyMTkyIEdlbmVyYWwgcm93LiBQZXJzaXN0ZWQgdG8gbG9jYWxTdG9yYWdlIGJ5IHRoZSBzdG9yZS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogUGFuZWwgZ2VvbWV0cnkgYm91bmRzLiAqL1xuZXhwb3J0IGNvbnN0IE1JTl9QQU5FTF9XID0gNjQwXG5leHBvcnQgY29uc3QgTUlOX1BBTkVMX0ggPSA0MDBcblxuaW50ZXJmYWNlIFByZWZzIHtcbiAgLyoqIEZvbnQgb3B0aW9uIGlkIChzZWUgRk9OVF9PUFRJT05TKS4gKi9cbiAgZm9udDogc3RyaW5nXG4gIC8qKiBEaWZmIHRleHQgc2l6ZSBpbiBweC4gKi9cbiAgc2l6ZTogbnVtYmVyXG4gIC8qKiBQYW5lbCB3aWR0aCBpbiBweC4gKi9cbiAgd2lkdGg6IG51bWJlclxuICAvKiogUGFuZWwgaGVpZ2h0IGluIHB4LiAqL1xuICBoZWlnaHQ6IG51bWJlclxufVxuXG5jb25zdCBGT05UX09QVElPTlM6IHsgaWQ6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgY3NzOiBzdHJpbmcgfVtdID0gW1xuICB7IGlkOiAnbW9ubycsIGxhYmVsOiAnZm9udC5tb25vJywgY3NzOiAndmFyKC0tZHN3LWZvbnQtbW9ubyknIH0sXG4gIHsgaWQ6ICdzeXN0ZW0nLCBsYWJlbDogJ2ZvbnQuc3lzdGVtJywgY3NzOiAnc3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBzYW5zLXNlcmlmJyB9LFxuICB7IGlkOiAnY29uc29sYXMnLCBsYWJlbDogJ0NvbnNvbGFzJywgY3NzOiAnQ29uc29sYXMsIFwiQ291cmllciBOZXdcIiwgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnamV0YnJhaW5zJywgbGFiZWw6ICdKZXRCcmFpbnMgTW9ubycsIGNzczogJ1wiSmV0QnJhaW5zIE1vbm9cIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ2ZpcmEnLCBsYWJlbDogJ0ZpcmEgQ29kZScsIGNzczogJ1wiRmlyYSBDb2RlXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdzb3VyY2UnLCBsYWJlbDogJ1NvdXJjZSBDb2RlIFBybycsIGNzczogJ1wiU291cmNlIENvZGUgUHJvXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG5dXG5cbmNvbnN0IFNJWkVfT1BUSU9OUyA9IFsxMSwgMTIsIDEzLCAxNCwgMTYsIDE4XVxuXG4vKiogUmV2aWV3IHNjb3BlcyBvZiB0aGUgd29ya3NwYWNlIHRhYiAoYWxpZ25lZCB3aXRoIHRoZSBDb2RleCByZXZpZXcgcGFuZSkuICovXG50eXBlIFdvcmtzcGFjZVNjb3BlID0gJ2FsbCcgfCAndW5zdGFnZWQnIHwgJ3N0YWdlZCcgfCAnY29tbWl0JyB8ICdicmFuY2gnIHwgJ2xhc3QtdHVybidcblxuLyoqIFJldmlldy1zY29wZSBkcm9wZG93biBvcHRpb25zOiBlYWNoIGlkIG1hcHMgdG8gYSBsb2NhbGUgbGFiZWwgaW4gYHpoYC9gZW5gLiAqL1xuY29uc3QgU0NPUEVfT1BUSU9OUzogeyBpZDogV29ya3NwYWNlU2NvcGU7IGxhYmVsOiBrZXlvZiB0eXBlb2YgemggfVtdID0gW1xuICB7IGlkOiAndW5zdGFnZWQnLCBsYWJlbDogJ3Njb3BlLnVuc3RhZ2VkJyB9LFxuICB7IGlkOiAnc3RhZ2VkJywgbGFiZWw6ICdzY29wZS5zdGFnZWQnIH0sXG4gIHsgaWQ6ICdjb21taXQnLCBsYWJlbDogJ3Njb3BlLmNvbW1pdCcgfSxcbiAgeyBpZDogJ2JyYW5jaCcsIGxhYmVsOiAnc2NvcGUuYnJhbmNoJyB9LFxuICB7IGlkOiAnbGFzdC10dXJuJywgbGFiZWw6ICdzY29wZS5sYXN0LXR1cm4nIH0sXG5dXG5cbi8qKiBCcm93c2VyLXNpZGUgYWJzb2x1dGUgcGF0aCBjaGVjayAobm8gbm9kZTpwYXRoIGluIHRoZSBjbGllbnQgYnVuZGxlKS4gKi9cbmZ1bmN0aW9uIGlzQWJzUGF0aChwOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHAuc3RhcnRzV2l0aCgnLycpIHx8IC9eW0EtWmEtel06W1xcXFwvXS8udGVzdChwKVxufVxuXG4vKiogTGFyZ2VzdCBvZiB0aHJlZSBudW1iZXJzIChwcmVmZXJzIGIgb24gdGllcykuICovXG5mdW5jdGlvbiBtYXhPZjMoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChiID49IGEgJiYgYiA+PSBjKSByZXR1cm4gYlxuICBpZiAoYSA+PSBjKSByZXR1cm4gYVxuICByZXR1cm4gY1xufVxuXG5mdW5jdGlvbiBiYXNlTmFtZShwOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcC5zcGxpdCgvW1xcXFwvXS8pLnBvcCgpID8/IHBcbn1cblxuY29uc3QgcHJlZnNTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UHJlZnM+KFxuICB7IGZvbnQ6ICdtb25vJywgc2l6ZTogMTIsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDcyMCB9LFxuICB7IHBlcnNpc3Q6IHsgbmFtZTogJ2RzZHItcHJlZnMnIH0gfSxcbilcblxuLyoqIENTUyBmb250LWZhbWlseSBmb3IgYSBzdG9yZWQgZm9udCBvcHRpb24gaWQuICovXG5mdW5jdGlvbiBmb250Q3NzKGlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gRk9OVF9PUFRJT05TLmZpbmQoKGYpID0+IGYuaWQgPT09IGlkKT8uY3NzID8/IEZPTlRfT1BUSU9OU1swXS5jc3Ncbn1cblxuLyoqIFBhbmVsIENTUyB2YXJpYWJsZXMgY2FycnlpbmcgdGhlIGZvbnQvc2l6ZSBwcmVmZXJlbmNlLiAqL1xuZnVuY3Rpb24gZGlmZlN0eWxlVmFycyhwcmVmczogUHJlZnMpOiBDU1NQcm9wZXJ0aWVzIHtcbiAgcmV0dXJuIHtcbiAgICAnLS1kc2RyLWRpZmYtZm9udCc6IGZvbnRDc3MocHJlZnMuZm9udCksXG4gICAgJy0tZHNkci1kaWZmLXNpemUnOiBgJHtwcmVmcy5zaXplfXB4YCxcbiAgfSBhcyBDU1NQcm9wZXJ0aWVzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2Vzc2lvbi1jaGFuZ2VzIGV4dHJhY3Rpb24gKGNsaWVudC1zaWRlLCB3b3JrcyB3aXRob3V0IGdpdCkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBiZWZvcmUvYWZ0ZXIgc2xpY2Ugb2YgYSBjaGFuZ2UgKGEgaHVuaykuICovXG5pbnRlcmZhY2UgSHVuayB7XG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBPbmUgZmlsZSBjaGFuZ2VkIGluc2lkZSBvbmUgcm91bmQuICovXG5pbnRlcmZhY2UgUm91bmRDaGFuZ2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgdG9vbDogc3RyaW5nXG4gIGh1bmtzOiBIdW5rW11cbiAgLyoqIEZhbHNlIHdoZW4gb25seSB0aGUgcGF0aCBpcyBrbm93biAobm8gZGlmZiBkYXRhIHBlcnNpc3RlZCkuICovXG4gIGhhc0RpZmY6IGJvb2xlYW5cbn1cblxuLyoqIE9uZSB1c2VyIHJvdW5kIGFuZCB0aGUgZmlsZXMgaXQgY2hhbmdlZC4gKi9cbmludGVyZmFjZSBTZXNzaW9uUm91bmQge1xuICByb3VuZDogbnVtYmVyXG4gIGxhYmVsOiBzdHJpbmdcbiAgY2hhbmdlczogUm91bmRDaGFuZ2VbXVxufVxuXG4vKiogT25lIGZpbGUgc3VtbWFyaXplZCBpbiB0aGUgcmVwbHktbG9jYWwgY2hhbmdlcyBjYXJkLiAqL1xuaW50ZXJmYWNlIFR1cm5DaGFuZ2VTdW1tYXJ5IHtcbiAgcGF0aDogc3RyaW5nXG4gIGFkZGVkOiBudW1iZXJcbiAgZGVsZXRlZDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBGaWxlRGlmZkxpa2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgb2xkVGV4dDogc3RyaW5nIHwgbnVsbFxuICBuZXdUZXh0OiBzdHJpbmdcbn1cblxuLyoqIFZhbGlkYXRlIGEgcmF3IEZpbGVEaWZmLXNoYXBlZCB2YWx1ZSAodGhlIHRvb2xzJyBge3BhdGgsIG9sZFRleHQsIG5ld1RleHR9YCBjb250cmFjdCkuICovXG5mdW5jdGlvbiBhc0ZpbGVEaWZmKHJhdzogdW5rbm93bik6IEZpbGVEaWZmTGlrZSB8IG51bGwge1xuICBpZiAoIXJhdyB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgY29uc3QgcmVjID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gIGlmICh0eXBlb2YgcmVjLnBhdGggIT09ICdzdHJpbmcnIHx8ICFyZWMucGF0aCkgcmV0dXJuIG51bGxcbiAgaWYgKHR5cGVvZiByZWMubmV3VGV4dCAhPT0gJ3N0cmluZycpIHJldHVybiBudWxsXG4gIGNvbnN0IG9sZFRleHQgPSByZWMub2xkVGV4dFxuICByZXR1cm4geyBwYXRoOiByZWMucGF0aCwgb2xkVGV4dDogdHlwZW9mIG9sZFRleHQgPT09ICdzdHJpbmcnID8gb2xkVGV4dCA6IG51bGwsIG5ld1RleHQ6IHJlYy5uZXdUZXh0IH1cbn1cblxuLyoqIERpZmYgaHVua3MgY2FycmllZCBieSBhIGRpZmYgY2FyZCAoY2FsbCB2aWV3IG9yIHJlc3VsdCB2aWV3KS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbURpZmZDYXJkKHZpZXc6IHsgY2FyZD86IHVua25vd247IGRpZmZzPzogdW5rbm93biB9IHwgbnVsbCB8IHVuZGVmaW5lZCk6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCF2aWV3IHx8IHZpZXcuY2FyZCAhPT0gJ2RpZmYnIHx8ICFBcnJheS5pc0FycmF5KHZpZXcuZGlmZnMpKSByZXR1cm4gW11cbiAgcmV0dXJuIHZpZXcuZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbi8qKiBIdW1hbiBsYWJlbCBmb3IgYSBjYWxsIHdob3NlIGBjYWxsYCBoZWFkIHdhcyB0cnVuY2F0ZWQgb3V0IG9mIHRoZSB3aW5kb3cuICovXG5mdW5jdGlvbiBkaWZmQ2FyZFRpdGxlKHZpZXc6IHVua25vd24pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKCF2aWV3IHx8IHR5cGVvZiB2aWV3ICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgY29uc3QgdGl0bGUgPSAodmlldyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikudGl0bGVcbiAgcmV0dXJuIHR5cGVvZiB0aXRsZSA9PT0gJ3N0cmluZycgJiYgdGl0bGUudHJpbSgpID8gdGl0bGUudHJpbSgpIDogbnVsbFxufVxuXG4vKiogUmF3IGBtZXRhLmRpZmZzYCBmYWxsYmFjayAodGhlIHBlcnNpc3RlZCB0b29sL3Jlc3VsdCBtZXRhKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbU1ldGEobWV0YTogdW5rbm93bik6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCFtZXRhIHx8IHR5cGVvZiBtZXRhICE9PSAnb2JqZWN0JykgcmV0dXJuIFtdXG4gIGNvbnN0IGRpZmZzID0gKG1ldGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmRpZmZzXG4gIGlmICghQXJyYXkuaXNBcnJheShkaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbmNvbnN0IE1VVEFUSU9OX1RPT0xTID0gbmV3IFNldChbJ3N0cl9yZXBsYWNlX2VkaXRvcicsICdub3RlYm9va19lZGl0J10pXG5jb25zdCBNVVRBVElPTl9DT01NQU5EUyA9IG5ldyBTZXQoWyd3cml0ZScsICdlZGl0JywgJ3JlcGxhY2UnLCAnZGVsZXRlJywgJ21vdmUnXSlcblxuLyoqIFBhdGgtb25seSBmYWxsYmFjayBmb3Iga25vd24gZmlsZS1tdXRhdGluZyB0b29scyB3aG9zZSByZXN1bHQgY2FycmllZCBubyBkaWZmLiAqL1xuZnVuY3Rpb24gbXV0YXRpb25QYXRoKHRvb2w6IHN0cmluZywgYXJnc1Jhdzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGxldCBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwgPSBudWxsXG4gIHRyeSB7XG4gICAgYXJncyA9IEpTT04ucGFyc2UoYXJnc1JhdykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBpZiAoIWFyZ3MgfHwgdHlwZW9mIGFyZ3MgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBpZiAodG9vbCA9PT0gJ2ZzJyB8fCB0b29sID09PSAnZmlsZXN5c3RlbScpIHtcbiAgICBjb25zdCBjbWQgPSB0eXBlb2YgYXJncy5jb21tYW5kID09PSAnc3RyaW5nJyA/IGFyZ3MuY29tbWFuZCA6ICcnXG4gICAgaWYgKCFNVVRBVElPTl9DT01NQU5EUy5oYXMoY21kKSkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gdHlwZW9mIGFyZ3MuZmlsZV9wYXRoID09PSAnc3RyaW5nJyAmJiBhcmdzLmZpbGVfcGF0aCA/IGFyZ3MuZmlsZV9wYXRoIDogbnVsbFxuICB9XG4gIGlmIChNVVRBVElPTl9UT09MUy5oYXModG9vbCkgfHwgdG9vbC5zdGFydHNXaXRoKCdlZGl0JykpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbJ2ZpbGVfcGF0aCcsICdwYXRoJywgJ2ZpbGVuYW1lJ10pIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1trZXldID09PSAnc3RyaW5nJyAmJiBhcmdzW2tleV0pIHJldHVybiBhcmdzW2tleV0gYXMgc3RyaW5nXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbi8qKiBFeHRyYWN0IHRoZSBjaGFuZ2VkIGZpbGVzIGZyb20gb25lIHNldHRsZWQgdG9vbCByZXN1bHQgKGRpZmYgaHVua3MsIGVsc2UgcGF0aC1vbmx5KS4gKi9cbmZ1bmN0aW9uIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChjYWxsOiB7IG5hbWU6IHN0cmluZzsgYXJnc1Jhdzogc3RyaW5nIH0gfCBudWxsLCBub2RlOiBUb29sUmVzdWx0Tm9kZSk6IFJvdW5kQ2hhbmdlW10ge1xuICAvLyBMb25nIHNlc3Npb25zIHRydW5jYXRlIHRoZSBjYWxsIGhlYWQgb3V0IG9mIHRoZSB3aW5kb3cgKGNhbGwgPT09IG51bGwpLCBidXRcbiAgLy8gdGhlIGhvc3QtY29tcHV0ZWQgY2FsbC9yZXN1bHQgZGlmZiBjYXJkcyBzdGlsbCBjYXJyeSB0aGUgY2hhbmdlIFx1MjAxNCByZWFkIHRob3NlLlxuICBjb25zdCByZXN1bHREaWZmcyA9IGRpZmZzRnJvbURpZmZDYXJkKG5vZGUucmVzdWx0VmlldylcbiAgY29uc3QgY2FsbERpZmZzID0gcmVzdWx0RGlmZnMubGVuZ3RoID09PSAwID8gZGlmZnNGcm9tRGlmZkNhcmQobm9kZS5jYWxsVmlldykgOiBbXVxuICBjb25zdCBtZXRhRGlmZnMgPSByZXN1bHREaWZmcy5sZW5ndGggPT09IDAgJiYgY2FsbERpZmZzLmxlbmd0aCA9PT0gMCA/IGRpZmZzRnJvbU1ldGEobm9kZS5tZXRhKSA6IFtdXG4gIGNvbnN0IGFsbERpZmZzID0gcmVzdWx0RGlmZnMubGVuZ3RoID4gMCA/IHJlc3VsdERpZmZzIDogY2FsbERpZmZzLmxlbmd0aCA+IDAgPyBjYWxsRGlmZnMgOiBtZXRhRGlmZnNcbiAgY29uc3QgdG9vbCA9IGNhbGw/Lm5hbWUgPz8gZGlmZkNhcmRUaXRsZShub2RlLmNhbGxWaWV3KSA/PyAndG9vbCdcbiAgaWYgKGFsbERpZmZzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUm91bmRDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGQgb2YgYWxsRGlmZnMpIHtcbiAgICAgIGxldCBlbnRyeSA9IGJ5UGF0aC5nZXQoZC5wYXRoKVxuICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICBlbnRyeSA9IHsgcGF0aDogZC5wYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IHRydWUgfVxuICAgICAgICBieVBhdGguc2V0KGQucGF0aCwgZW50cnkpXG4gICAgICB9XG4gICAgICBlbnRyeS5odW5rcy5wdXNoKHsgb2xkVGV4dDogZC5vbGRUZXh0LCBuZXdUZXh0OiBkLm5ld1RleHQgfSlcbiAgICB9XG4gICAgcmV0dXJuIFsuLi5ieVBhdGgudmFsdWVzKCldXG4gIH1cbiAgY29uc3QgcGF0aCA9IGNhbGwgPyBtdXRhdGlvblBhdGgodG9vbCwgY2FsbC5hcmdzUmF3KSA6IG51bGxcbiAgcmV0dXJuIHBhdGggPyBbeyBwYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IGZhbHNlIH1dIDogW11cbn1cblxuLyoqIFBsYWluIHRleHQgb2YgYSB1c2VyIG1lc3NhZ2UgKGNvbnRlbnQgYmxvY2tzIG9mIHR5cGUgJ3RleHQnKS4gKi9cbmZ1bmN0aW9uIHVzZXJUZXh0KG5vZGU6IFVzZXJNZXNzYWdlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2Ygbm9kZS5jb250ZW50KSB7XG4gICAgaWYgKGJsb2NrICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcgJiYgKGJsb2NrIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiAoYmxvY2sgYXMgeyB0ZXh0PzogdW5rbm93biB9KS50ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgcGFydHMucHVzaCgoYmxvY2sgYXMgeyB0ZXh0OiBzdHJpbmcgfSkudGV4dClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG59XG5cbi8qKiBXYWxrIHRoZSBjb252ZXJzYXRpb24gbm9kZXMgYW5kIGdyb3VwIGNoYW5nZWQgZmlsZXMgYnkgdXNlciByb3VuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0U2Vzc2lvblJvdW5kcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogU2Vzc2lvblJvdW5kW10ge1xuICBjb25zdCByb3VuZHM6IFNlc3Npb25Sb3VuZFtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IFNlc3Npb25Sb3VuZCB8IG51bGwgPSBudWxsXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgPT09ICd1c2VyJykge1xuICAgICAgY3VycmVudCA9IHsgcm91bmQ6IHJvdW5kcy5sZW5ndGggKyAxLCBsYWJlbDogdXNlclRleHQobm9kZSkuc2xpY2UoMCwgNjApLCBjaGFuZ2VzOiBbXSB9XG4gICAgICByb3VuZHMucHVzaChjdXJyZW50KVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JykgY29udGludWVcbiAgICAvLyBUaGUgd2luZG93IGNhbiBzdGFydCBtaWQtdHVybiAodGhlIGxlYWRpbmcgdXNlciBtZXNzYWdlIHRydW5jYXRlZCBvdXQpO1xuICAgIC8vIHN0aWxsIHN1cmZhY2UgdGhlIHRvb2wgcmVzdWx0cyB1bmRlciBhbiBpbXBsaWNpdCByb3VuZC5cbiAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQgPSB7IHJvdW5kOiByb3VuZHMubGVuZ3RoICsgMSwgbGFiZWw6ICcnLCBjaGFuZ2VzOiBbXSB9XG4gICAgICByb3VuZHMucHVzaChjdXJyZW50KVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBjaGFuZ2UucGF0aCAmJiBjLnRvb2wgPT09IGNoYW5nZS50b29sKVxuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGlmIChjaGFuZ2UuaGFzRGlmZikge1xuICAgICAgICAgIGV4aXN0aW5nLmh1bmtzLnB1c2goLi4uY2hhbmdlLmh1bmtzKVxuICAgICAgICAgIGV4aXN0aW5nLmhhc0RpZmYgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQuY2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdW5kcy5maWx0ZXIoKHIpID0+IHIuY2hhbmdlcy5sZW5ndGggPiAwKVxufVxuXG4vKiogQ291bnQgb2YgY2hhbmdlZCBmaWxlcyBhY3Jvc3MgYWxsIHJvdW5kcyAoZm9yIHRoZSBoZWFkZXIgYmFkZ2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDBcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcpIGNvbnRpbnVlXG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgY2hhbmdlc0Zyb21Ub29sUmVzdWx0KG5vZGUuY2FsbCwgbm9kZSkpIHtcbiAgICAgIGNvbnN0IGtleSA9IGAke2NoYW5nZS50b29sfToke2NoYW5nZS5wYXRofWBcbiAgICAgIGlmICghc2Vlbi5oYXMoa2V5KSkge1xuICAgICAgICBzZWVuLmFkZChrZXkpXG4gICAgICAgIGNvdW50KytcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvdW50XG59XG5cbmZ1bmN0aW9uIHRleHRMaW5lQ291bnQodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgaWYgKHRleHQgPT09ICcnKSByZXR1cm4gMFxuICByZXR1cm4gdGV4dC5zcGxpdCgnXFxuJykubGVuZ3RoIC0gKHRleHQuZW5kc1dpdGgoJ1xcbicpID8gMSA6IDApXG59XG5cbi8qKiBNZXJnZSBhbGwgZmlsZSBtdXRhdGlvbnMgYm91bmRlZCBieSBvbmUgZW5naW5lLW93bmVkIGFnZW50IHR1cm4uICovXG5mdW5jdGlvbiBjb2xsZWN0VHVybkNoYW5nZXMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSwgc3RhcnRTZXE6IG51bWJlciwgZW5kU2VxOiBudW1iZXIpOiBUdXJuQ2hhbmdlU3VtbWFyeVtdIHtcbiAgY29uc3QgZmlsZXMgPSBuZXcgTWFwPHN0cmluZywgVHVybkNoYW5nZVN1bW1hcnk+KClcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCBub2RlLnNlcSA8IHN0YXJ0U2VxIHx8IG5vZGUuc2VxID4gZW5kU2VxKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBjdXJyZW50ID0gZmlsZXMuZ2V0KGNoYW5nZS5wYXRoKSA/PyB7IHBhdGg6IGNoYW5nZS5wYXRoLCBhZGRlZDogMCwgZGVsZXRlZDogMCB9XG4gICAgICBmb3IgKGNvbnN0IGh1bmsgb2YgY2hhbmdlLmh1bmtzKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMoaHVuay5vbGRUZXh0ID8/ICcnLCBodW5rLm5ld1RleHQpKSB7XG4gICAgICAgICAgaWYgKHBhcnQuYWRkZWQpIGN1cnJlbnQuYWRkZWQgKz0gdGV4dExpbmVDb3VudChwYXJ0LnZhbHVlKVxuICAgICAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgY3VycmVudC5kZWxldGVkICs9IHRleHRMaW5lQ291bnQocGFydC52YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZmlsZXMuc2V0KGNoYW5nZS5wYXRoLCBjdXJyZW50KVxuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLmZpbGVzLnZhbHVlcygpXVxufVxuXG4vKiogQWRhcHQgYSBwZXJzaXN0ZWQgc2Vzc2lvbiBkaWZmIHRvIHRoZSByZWFkLW9ubHkgZmlsZSBzaGFwZSB1c2VkIGJ5IExhc3QgVHVybi4gKi9cbmZ1bmN0aW9uIHNlc3Npb25DaGFuZ2VUb0RpZmZGaWxlKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBEaWZmRmlsZSB7XG4gIGxldCBhZGRlZCA9IDBcbiAgbGV0IGRlbGV0ZWQgPSAwXG4gIGNvbnN0IGNodW5rczogc3RyaW5nW10gPSBbYGRpZmYgLS1naXQgYS8ke2NoYW5nZS5wYXRofSBiLyR7Y2hhbmdlLnBhdGh9YCwgYC0tLSBhLyR7Y2hhbmdlLnBhdGh9YCwgYCsrKyBiLyR7Y2hhbmdlLnBhdGh9YF1cbiAgZm9yIChjb25zdCBodW5rIG9mIGNoYW5nZS5odW5rcykge1xuICAgIGNvbnN0IGJlZm9yZSA9IGh1bmsub2xkVGV4dCA/PyAnJ1xuICAgIGNvbnN0IGFmdGVyID0gaHVuay5uZXdUZXh0XG4gICAgY29uc3QgYmVmb3JlTGluZXMgPSB0ZXh0TGluZUNvdW50KGJlZm9yZSlcbiAgICBjb25zdCBhZnRlckxpbmVzID0gdGV4dExpbmVDb3VudChhZnRlcilcbiAgICBjaHVua3MucHVzaChgQEAgLTEsJHtiZWZvcmVMaW5lc30gKzEsJHthZnRlckxpbmVzfSBAQGApXG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhiZWZvcmUsIGFmdGVyKSkge1xuICAgICAgY29uc3QgcHJlZml4ID0gcGFydC5hZGRlZCA/ICcrJyA6IHBhcnQucmVtb3ZlZCA/ICctJyA6ICcgJ1xuICAgICAgY29uc3QgY291bnQgPSB0ZXh0TGluZUNvdW50KHBhcnQudmFsdWUpXG4gICAgICBpZiAocGFydC5hZGRlZCkgYWRkZWQgKz0gY291bnRcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgZGVsZXRlZCArPSBjb3VudFxuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIHBhcnQudmFsdWUuc3BsaXQoJ1xcbicpLnNsaWNlKDAsIHBhcnQudmFsdWUuZW5kc1dpdGgoJ1xcbicpID8gLTEgOiB1bmRlZmluZWQpKSBjaHVua3MucHVzaChgJHtwcmVmaXh9JHtsaW5lfWApXG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgcGF0aDogY2hhbmdlLnBhdGgsXG4gICAgeHk6ICdNJyxcbiAgICBzdGF0dXM6ICdNJyxcbiAgICB1bnRyYWNrZWQ6IGNoYW5nZS5odW5rcy5zb21lKChodW5rKSA9PiBodW5rLm9sZFRleHQgPT09IG51bGwpLFxuICAgIHN0YWdlZDogZmFsc2UsXG4gICAgdW5zdGFnZWQ6IHRydWUsXG4gICAgYWRkZWQsXG4gICAgZGVsZXRlZCxcbiAgICBkaWZmOiBjaHVua3Muam9pbignXFxuJyksXG4gICAgYmluYXJ5OiBmYWxzZSxcbiAgICBtdGltZTogMCxcbiAgICBodW5rczogW10sXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWZmIHJlbmRlcmluZy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogU3BsaXQgb25lIGBnaXQgc2hvdyAtLWZvcm1hdD1gIGRpZmYgaW50byBwZXItZmlsZSBzZWdtZW50cy4gKi9cbmZ1bmN0aW9uIHNwbGl0Q29tbWl0RGlmZihkaWZmOiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXSB7XG4gIGNvbnN0IHNlZ21lbnRzOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nW10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9IHwgbnVsbCA9IG51bGxcbiAgZm9yIChjb25zdCBsaW5lIG9mIGRpZmYuc3BsaXQoJ1xcbicpKSB7XG4gICAgY29uc3QgbWF0Y2ggPSAvXmRpZmYgLS1naXQgYVxcLyguKj8pIGJcXC8vLmV4ZWMobGluZSlcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gICAgICBjdXJyZW50ID0geyBwYXRoOiBtYXRjaFsxXSwgdGV4dDogW2xpbmVdIH1cbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQudGV4dC5wdXNoKGxpbmUpXG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gIHJldHVybiBzZWdtZW50cy5tYXAoKHMpID0+ICh7IHBhdGg6IHMucGF0aCwgdGV4dDogcy50ZXh0LmpvaW4oJ1xcbicpIH0pKVxufVxuXG4vKiogU3RhdHVzIGxldHRlciBmb3IgYSBjb21taXQncyBmaWxlLCBkZXJpdmVkIGZyb20gaXRzIGRpZmYgc2VnbWVudCB0ZXh0LiAqL1xuZnVuY3Rpb24gY29tbWl0RmlsZVN0YXR1cyhzZWdtZW50VGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9ebmV3IGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnQSdcbiAgaWYgKC9eZGVsZXRlZCBmaWxlIG1vZGUvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ0QnXG4gIGlmICgvXnJlbmFtZSBmcm9tIC8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnUidcbiAgcmV0dXJuICdNJ1xufVxuXG50eXBlIERpZmZSb3cgPSB7IGtpbmQ6ICdhZGQnIHwgJ2RlbCcgfCAnY3R4JyB8ICdodW5rJyB8ICdmaWxlJyB8ICdub3RlJzsgdGV4dDogc3RyaW5nIH1cblxuLyoqIENsYXNzaWZ5IHJhdyB1bmlmaWVkLWRpZmYgdGV4dCAoZ2l0IG91dHB1dCkgaW50byByb3dzLiAqL1xuZnVuY3Rpb24gZ2l0RGlmZlJvd3MoZGlmZjogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgcmV0dXJuIGRpZmYuc3BsaXQoJ1xcbicpLm1hcCgobGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykpIHJldHVybiB7IGtpbmQ6ICdmaWxlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkgcmV0dXJuIHsga2luZDogJ2h1bmsnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIHJldHVybiB7IGtpbmQ6ICdhZGQnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIHJldHVybiB7IGtpbmQ6ICdkZWwnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSByZXR1cm4geyBraW5kOiAnbm90ZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIHJldHVybiB7IGtpbmQ6ICdjdHgnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgfSlcbn1cblxuLyoqIENvbXB1dGUgYWRkL2RlbC9jdHggcm93cyBiZXR3ZWVuIHR3byB0ZXh0cyAodGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSkuICovXG5mdW5jdGlvbiB0ZXh0RGlmZlJvd3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvd3Ncbn1cblxuLyoqIFNlc3Npb24gY2hhbmdlIHJvd3Mgd2l0aCByZWxhdGl2ZSBvbGQvbmV3IGxpbmUgbnVtYmVycyAoaHVuayByb3dzIHJlc2V0KS4gKi9cbmZ1bmN0aW9uIHNlc3Npb25Sb3dzV2l0aExpbmVzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiB7IHJvdzogRGlmZlJvdzsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9W10ge1xuICBjb25zdCBvdXQ6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSA9IFtdXG4gIGxldCBvbGRMaW5lID0gMVxuICBsZXQgbmV3TGluZSA9IDFcbiAgZm9yIChjb25zdCByb3cgb2YgY2hhbmdlUm93cyhjaGFuZ2UpKSB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgb3V0LnB1c2goeyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbmV3TGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgIG91dC5wdXNoKHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBuZXdMaW5lKysgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgb3V0LnB1c2goeyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbnVsbCB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaCh7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbnVsbCB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBBbGwgcm93cyBmb3Igb25lIHJvdW5kIGNoYW5nZSAobXVsdGlwbGUgaHVua3MgZ2V0IGBAQGAgc2VwYXJhdG9ycykuICovXG5mdW5jdGlvbiBjaGFuZ2VSb3dzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBEaWZmUm93W10ge1xuICBpZiAoIWNoYW5nZS5oYXNEaWZmIHx8IGNoYW5nZS5odW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBjaGFuZ2UuaHVua3MuZm9yRWFjaCgoaHVuaywgaSkgPT4ge1xuICAgIGlmIChjaGFuZ2UuaHVua3MubGVuZ3RoID4gMSkgcm93cy5wdXNoKHsga2luZDogJ2h1bmsnLCB0ZXh0OiBgQEAgaHVuayAke2kgKyAxfS8ke2NoYW5nZS5odW5rcy5sZW5ndGh9IEBAYCB9KVxuICAgIHJvd3MucHVzaCguLi50ZXh0RGlmZlJvd3MoaHVuay5vbGRUZXh0LCBodW5rLm5ld1RleHQpKVxuICB9KVxuICByZXR1cm4gcm93c1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNwbGl0ICh0d28tY29sdW1uKSBkaWZmIHZpZXcuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBhbGlnbmVkIHJvdyBvZiB0aGUgc2lkZS1ieS1zaWRlIHZpZXcuICovXG5pbnRlcmZhY2UgU3BsaXRSb3cge1xuICBsZWZ0OiBzdHJpbmdcbiAgcmlnaHQ6IHN0cmluZ1xuICAvKiogMS1iYXNlZCBsaW5lIG51bWJlciBpbiB0aGUgb2xkIGZpbGUsIG9yIG51bGwgKHB1cmUgYWRkaXRpb24pLiAqL1xuICBsZWZ0TnVtOiBudW1iZXIgfCBudWxsXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBuZXcgZmlsZSwgb3IgbnVsbCAocHVyZSBkZWxldGlvbikuICovXG4gIHJpZ2h0TnVtOiBudW1iZXIgfCBudWxsXG4gIGtpbmQ6ICdjdHgnIHwgJ2NoYW5nZSdcbn1cblxuLyoqIE9uZSBzaWRlLWJ5LXNpZGUgYmxvY2sgKGEgaHVuayB3aXRoIGl0cyBgQEBgIGhlYWRlcikuICovXG5pbnRlcmZhY2UgU3BsaXRCbG9jayB7XG4gIGhlYWQ6IHN0cmluZyB8IG51bGxcbiAgcm93czogU3BsaXRSb3dbXVxufVxuXG4vKipcbiAqIFBhaXIgYWRkL2RlbCByb3dzIGludG8gYWxpZ25lZCBsZWZ0L3JpZ2h0IGNvbHVtbnMuIFJlbW92ZWQgbGluZXMgYnVmZmVyXG4gKiB1bnRpbCB0aGUgbWF0Y2hpbmcgYWRkaXRpb25zIGFycml2ZSAodW5pZmllZCBkaWZmIG9yZGVycyBkZWxldGlvbnMgYmVmb3JlXG4gKiBhZGRpdGlvbnMpLCBzbyBwdXJlIGRlbGV0aW9ucyBhbmQgcHVyZSBhZGRpdGlvbnMgc3RpbGwgZ2V0IHRoZWlyIG93biByb3dcbiAqIHdpdGggYW4gZW1wdHkgY2VsbCBvbiB0aGUgb3Bwb3NpdGUgc2lkZS4gTGluZSBudW1iZXJzIHRyYWNrIGZyb20gdGhlIGh1bmtcbiAqIGhlYWRlcidzIGAtYSxiICtjLGRgIHBvc2l0aW9ucy5cbiAqL1xuZnVuY3Rpb24gcGFpclJvd3Mocm93czogRGlmZlJvd1tdLCBvbGRTdGFydDogbnVtYmVyLCBuZXdTdGFydDogbnVtYmVyKTogU3BsaXRSb3dbXSB7XG4gIGNvbnN0IG91dDogU3BsaXRSb3dbXSA9IFtdXG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICBsZXQgcGVuZGluZzogeyB0ZXh0OiBzdHJpbmc7IG51bTogbnVtYmVyIH1bXSA9IFtdXG4gIGNvbnN0IGZsdXNoID0gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgcCBvZiBwZW5kaW5nKSBvdXQucHVzaCh7IGxlZnQ6IHAudGV4dCwgcmlnaHQ6ICcnLCBsZWZ0TnVtOiBwLm51bSwgcmlnaHROdW06IG51bGwsIGtpbmQ6ICdjaGFuZ2UnIH0pXG4gICAgcGVuZGluZyA9IFtdXG4gIH1cbiAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHtcbiAgICAgIHBlbmRpbmcucHVzaCh7IHRleHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBudW06IG9sZExpbmUrKyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdhZGQnKSB7XG4gICAgICBjb25zdCBwID0gcGVuZGluZy5zaGlmdCgpXG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHA/LnRleHQgPz8gJycsIHJpZ2h0OiByb3cudGV4dC5zbGljZSgxKSwgbGVmdE51bTogcD8ubnVtID8/IG51bGwsIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjaGFuZ2UnIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHtcbiAgICAgIGZsdXNoKClcbiAgICAgIC8vIFVuaWZpZWQtZGlmZiBjb250ZXh0IGxpbmVzIGNhcnJ5IGEgbGVhZGluZyBzcGFjZSBcdTIwMTQgc3RyaXAgaXQgZm9yIHRoZVxuICAgICAgLy8gc3BsaXQgY2VsbHMgc28gYm90aCBjb2x1bW5zIHJlbmRlciBiYXJlIHRleHQuXG4gICAgICBjb25zdCB0ZXh0ID0gcm93LnRleHQuc3RhcnRzV2l0aCgnICcpID8gcm93LnRleHQuc2xpY2UoMSkgOiByb3cudGV4dFxuICAgICAgb3V0LnB1c2goeyBsZWZ0OiB0ZXh0LCByaWdodDogdGV4dCwgbGVmdE51bTogb2xkTGluZSsrLCByaWdodE51bTogbmV3TGluZSsrLCBraW5kOiAnY3R4JyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBmbHVzaCgpIC8vIG5vdGVzIChcXCBObyBuZXdsaW5lXHUyMDI2KSBhbmQgc3RyYXkgcm93czoganVzdCBicmVhayB0aGUgcGFpcmluZ1xuICAgIH1cbiAgfVxuICBmbHVzaCgpXG4gIHJldHVybiBvdXRcbn1cblxuLyoqIFBhcnNlIGdpdCB1bmlmaWVkIGRpZmYgdGV4dCBpbnRvIGJsb2NrcyAoYC0tLS8rKytgIGZpbGUgcm93cyBhbmQgYEBAYCBodW5rcykuICovXG5jb25zdCBHSVRfTUVUQSA9IC9eKGRpZmYgLS1naXQgfGluZGV4IHxuZXcgZmlsZSB8ZGVsZXRlZCBmaWxlIHxvbGQgbW9kZSB8bmV3IG1vZGUgfHNpbWlsYXJpdHkgaW5kZXggfHJlbmFtZSAoZnJvbXx0bykgfEJpbmFyeSBmaWxlcyApL1xuXG5mdW5jdGlvbiBwYXJzZUdpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfVtdIHtcbiAgY29uc3QgYmxvY2tzOiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9IHwgbnVsbCA9IG51bGxcbiAgY29uc3QgbGluZXMgPSBkaWZmLnNwbGl0KCdcXG4nKVxuICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBraW5kOiBEaWZmUm93WydraW5kJ11cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrKysnKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy0tLScpIHx8IEdJVF9NRVRBLnRlc3QobGluZSkpIGtpbmQgPSAnZmlsZSdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ0BAJykpIGtpbmQgPSAnaHVuaydcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysnKSkga2luZCA9ICdhZGQnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIGtpbmQgPSAnZGVsJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnXFxcXCAnKSkga2luZCA9ICdub3RlJ1xuICAgIGVsc2Uga2luZCA9ICdjdHgnXG4gICAgaWYgKGtpbmQgPT09ICdmaWxlJyB8fCBraW5kID09PSAnaHVuaycpIHtcbiAgICAgIGN1cnJlbnQgPSB7IGhlYWQ6IHsga2luZCwgdGV4dDogbGluZSB9LCByb3dzOiBbXSB9XG4gICAgICBibG9ja3MucHVzaChjdXJyZW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudCA9IHsgaGVhZDogbnVsbCwgcm93czogW10gfVxuICAgICAgICBibG9ja3MucHVzaChjdXJyZW50KVxuICAgICAgfVxuICAgICAgY3VycmVudC5yb3dzLnB1c2goeyBraW5kLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBibG9ja3Ncbn1cblxuLyoqIEh1bmsgc3RhcnQgcG9zaXRpb25zIGZyb20gYSBgQEAgLWEsYiArYyxkIEBAYCBoZWFkZXIuICovXG5mdW5jdGlvbiBodW5rU3RhcnRzKGhlYWQ6IHN0cmluZyk6IHsgb2xkU3RhcnQ6IG51bWJlcjsgbmV3U3RhcnQ6IG51bWJlciB9IHtcbiAgY29uc3QgbSA9IC9eQEAgLShcXGQrKSg/OixcXGQrKT8gXFwrKFxcZCspLy5leGVjKGhlYWQpXG4gIHJldHVybiB7IG9sZFN0YXJ0OiBtID8gTnVtYmVyKG1bMV0pIDogMSwgbmV3U3RhcnQ6IG0gPyBOdW1iZXIobVsyXSkgOiAxIH1cbn1cblxuLyoqIFNpZGUtYnktc2lkZSBibG9ja3MgZm9yIGEgZ2l0IHVuaWZpZWQgZGlmZiAoc2tpcHMgcHVyZSBmaWxlLWhlYWRlciBibG9ja3MpLiAqL1xuZnVuY3Rpb24gZ2l0U3BsaXRCbG9ja3MoZGlmZjogc3RyaW5nKTogU3BsaXRCbG9ja1tdIHtcbiAgcmV0dXJuIHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gICAgLmZpbHRlcigoYikgPT4gYi5oZWFkPy5raW5kICE9PSAnZmlsZScgJiYgKGIucm93cy5sZW5ndGggPiAwIHx8IGIuaGVhZD8ua2luZCA9PT0gJ2h1bmsnKSlcbiAgICAubWFwKChiKSA9PiB7XG4gICAgICBjb25zdCBzdGFydHMgPSBiLmhlYWQgPyBodW5rU3RhcnRzKGIuaGVhZC50ZXh0KSA6IHsgb2xkU3RhcnQ6IDEsIG5ld1N0YXJ0OiAxIH1cbiAgICAgIHJldHVybiB7IGhlYWQ6IGIuaGVhZD8ua2luZCA9PT0gJ2h1bmsnID8gYi5oZWFkLnRleHQgOiBudWxsLCByb3dzOiBwYWlyUm93cyhiLnJvd3MsIHN0YXJ0cy5vbGRTdGFydCwgc3RhcnRzLm5ld1N0YXJ0KSB9XG4gICAgfSlcbn1cblxuLyoqIFNpZGUtYnktc2lkZSBibG9ja3MgZm9yIHRoZSB0b29scycgRmlsZURpZmYgc2hhcGUgKG9sZFRleHQvbmV3VGV4dCkuICovXG5mdW5jdGlvbiB0ZXh0U3BsaXRCbG9ja3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogU3BsaXRCbG9ja1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFt7IGhlYWQ6IG51bGwsIHJvd3M6IHBhaXJSb3dzKHJvd3MsIDEsIDEpIH1dXG59XG5cbi8qKiBBbGwgc2lkZS1ieS1zaWRlIGJsb2NrcyBmb3Igb25lIHJvdW5kIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVNwbGl0QmxvY2tzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBTcGxpdEJsb2NrW10ge1xuICBpZiAoIWNoYW5nZS5oYXNEaWZmIHx8IGNoYW5nZS5odW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICByZXR1cm4gY2hhbmdlLmh1bmtzLm1hcCgoaHVuaywgaSkgPT4gKHtcbiAgICBoZWFkOiBjaGFuZ2UuaHVua3MubGVuZ3RoID4gMSA/IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIDogbnVsbCxcbiAgICByb3dzOiB0ZXh0U3BsaXRCbG9ja3MoaHVuay5vbGRUZXh0LCBodW5rLm5ld1RleHQpWzBdLnJvd3MsXG4gIH0pKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFN0eWxlcyAoZHNkci0qOyB0aGUgaGVhZGVyIHRyaWdnZXIgbWlycm9ycyB0aGUgaW4tdHJlZSBhY3Rpb24gcm93cykuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgUkVWSUVXX0NTUyA9IGBcbi5kc2RyLXRyaWdnZXJ7bWluLWhlaWdodDoyOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo0cHg7cGFkZGluZzozcHggNnB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2Rpc3BsYXk6aW5saW5lLWZsZXh9XG4uZHNkci10cmlnZ2VyOmhvdmVyLC5kc2RyLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWxhYmVse21hcmdpbi1sZWZ0OjJweH1cbi5kc2RyLWNvdW50e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2JvcmRlci1yYWRpdXM6OTk5cHg7bWluLXdpZHRoOjE2cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtwYWRkaW5nOjAgNXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLW92ZXJsYXl7cG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDt6LWluZGV4OjIwMDtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjQ1KTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7cGFkZGluZzozMnB4fVxuLmRzZHItcGFuZWx7Ym94LXNpemluZzpib3JkZXItYm94O3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOm1pbigxMTIwcHgsMTAwJSk7aGVpZ2h0Om1pbig3MjBweCxjYWxjKDEwMHZoIC0gNjRweCkpO21heC13aWR0aDpjYWxjKDEwMHZ3IC0gNjRweCk7bWF4LWhlaWdodDpjYWxjKDEwMHZoIC0gNjRweCk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6MTRweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXJlc2l6ZXtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjV9XG4uZHNkci1yZXNpemUtZXt0b3A6MDtyaWdodDotM3B4O3dpZHRoOjdweDtoZWlnaHQ6MTAwJTtjdXJzb3I6ZXctcmVzaXplfVxuLmRzZHItcmVzaXplLXN7Ym90dG9tOi0zcHg7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjdweDtjdXJzb3I6bnMtcmVzaXplfVxuLmRzZHItcmVzaXplLXNle3JpZ2h0Oi00cHg7Ym90dG9tOi00cHg7d2lkdGg6MTVweDtoZWlnaHQ6MTVweDtjdXJzb3I6bndzZS1yZXNpemV9XG4uZHNkci1oZWFkZXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjEycHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci10aXRsZXtmb250LXNpemU6MTRweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3VidGl0bGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXRhYnN7ZGlzcGxheTpmbGV4O2dhcDo0cHg7bWFyZ2luLWxlZnQ6MTRweH1cbi5kc2RyLXRhYntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyNnB4O2JvcmRlcjoxcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MnB4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci10YWI6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci10YWItYWN0aXZle2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2NvcGV7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttYXJnaW4tbGVmdDo4cHh9XG4uZHNkci1zY29wZSAuZHNkci1zZWwtdHJpZ2dlcnttaW4td2lkdGg6MTEwcHg7aGVpZ2h0OjI2cHg7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjAgOHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpfVxuLmRzZHItc3BhY2Vye2ZsZXg6MX1cbi5kc2RyLWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyOHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjNweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHh9XG4uZHNkci1idG46aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bjpkaXNhYmxlZHtvcGFjaXR5Oi41O2N1cnNvcjpkZWZhdWx0fVxuLmRzZHItYnRuLXByaW1hcnl7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNDAwKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1idG4tZGFuZ2Vye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXI6aG92ZXI6bm90KDpkaXNhYmxlZCl7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWNvbmZpcm17Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTUwKX1cbi5kc2RyLWJ0bi1jb25maXJtOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItY29tbWl0LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoyMDBweDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzozcHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLWNvbW1pdC1tb2RhbHtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjEwO2luc2V0OjA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNDIpfS5kc2RyLWNvbW1pdC1jYXJke2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjE2cHg7d2lkdGg6bWluKDUyMHB4LGNhbGMoMTAwJSAtIDQ4cHgpKTtwYWRkaW5nOjI0cHg7Ym9yZGVyLXJhZGl1czoxNnB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myl9LmRzZHItY29tbWl0LXRpdGxle2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9LmRzZHItY29tbWl0LWNhcmQgLmRzZHItY29tbWl0LWlucHV0e3dpZHRoOjEwMCU7bWluLWhlaWdodDozOHB4fS5kc2RyLWNvbW1pdC1pbmNsdWRle2Rpc3BsYXk6ZmxleDtnYXA6OXB4O2FsaWduLWl0ZW1zOmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LXNpemU6MTNweH0uZHNkci1jb21taXQtYWN0aW9uc3tkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjhweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtwYWRkaW5nLXRvcDoxNHB4fVxuLmRzZHItZmlsZS1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6M3B4O21hcmdpbi1sZWZ0OjZweH0uZHNkci1maWxlLWljb257d2lkdGg6MjJweDtoZWlnaHQ6MjJweDtwYWRkaW5nOjA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQ6MTZweC8yMHB4IHZhcigtLWRzdy1mb250LXNhbnMpO2N1cnNvcjpwb2ludGVyfS5kc2RyLWZpbGUtaWNvbjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfS5kc2RyLWZpbGUtaWNvbi1kYW5nZXI6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXR1cy1kYW5nZXIpfVxuLmRzZHItY29tbWl0LWlucHV0OjpwbGFjZWhvbGRlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtY2FwdGlvbil9XG4uZHNkci1jb21taXQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1zZWN0aW9ue2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjEwcHggOHB4IDNweDtmb250LXdlaWdodDo2MDA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4fVxuLmRzZHItc2VjdGlvbjpmaXJzdC1jaGlsZHtwYWRkaW5nLXRvcDo0cHh9XG4uZHNkci1icmFuY2h7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NHB4IDhweCA4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1icmFuY2gtcmVme2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczttaW4td2lkdGg6MDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnJhbmNoLWFycm93e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1icmFuY2gtc3RhdHtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWJyYW5jaC1haGVhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1iZWhpbmR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXdhcm4tcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtc3luY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdHtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NXB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY29tbWl0OmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRsLXNlbGVjdGVkIC5kc2RyLWNvbW1pdHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10aW1lbGluZXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItdGwtaXRlbXtkaXNwbGF5OmZsZXg7Z2FwOjZweDthbGlnbi1pdGVtczpzdHJldGNoO2JvcmRlci1yYWRpdXM6OHB4fVxuLmRzZHItdGwtcmFpbHtwb3NpdGlvbjpyZWxhdGl2ZTtmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcn1cbi5kc2RyLXRsLXJhaWw6OmJlZm9yZXtjb250ZW50OlwiXCI7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7Ym90dG9tOjA7bGVmdDo1MCU7d2lkdGg6MXB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMil9XG4uZHNkci10bC1pdGVtOmZpcnN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXt0b3A6OXB4fVxuLmRzZHItdGwtaXRlbTpsYXN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXtib3R0b206YXV0bztoZWlnaHQ6OXB4fVxuLmRzZHItdGwtZG90e3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MTt0b3A6OXB4O2ZsZXg6bm9uZTt3aWR0aDo3cHg7aGVpZ2h0OjdweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItdGwtZG90LWxvY2Fse2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1kb3QtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWNvbW1pdC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4td2lkdGg6MH1cbi5kc2RyLWNvbW1pdC1zaG9ydHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1zdWJqZWN0e2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1jb21taXQtbWV0YXtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmctbGVmdDowfVxuLmRzZHItdGwtYmFkZ2V7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDVweH1cbi5kc2RyLXRsLWJhZGdlLWxvY2Fse2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWJhZGdlLXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItZGlmZi1oYXNoe21hcmdpbi1sZWZ0OjhweDtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LWZpbGUtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItY29tbWl0LWZpbGUtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7bWFyZ2luLWxlZnQ6NHB4fVxuLmRzZHItY2ZnLWNhcmR7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXItcmFkaXVzOjEycHg7bGlzdC1zdHlsZTpub25lO3RyYW5zaXRpb246Ym9yZGVyLWNvbG9yIC4xNnMsYmFja2dyb3VuZCAuMTZzfVxuLmRzZHItY2ZnLWNhcmQ6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWNhcmQtb3BlbntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jZmctaGVhZHthcHBlYXJhbmNlOm5vbmU7d2lkdGg6MTAwJTtmb250OmluaGVyaXQ7Y29sb3I6aW5oZXJpdDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czoxMnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtwYWRkaW5nOjE0cHggMTZweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctaGVhZDpmb2N1cy12aXNpYmxle291dGxpbmU6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lLW9mZnNldDotMnB4fVxuLmRzZHItY2ZnLWhlYWQtdGV4dHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47ZmxleDoxO2dhcDo0cHg7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLW5hbWV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjYwMDtsaW5lLWhlaWdodDoxLjR9XG4uZHNkci1jZmctZGVzY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1jYXJldHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTZzfVxuLmRzZHItY2ZnLWNhcmV0LW9wZW57dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItY2ZnLWJvZHl7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7bWFyZ2luOjAgMTZweDtwYWRkaW5nLWJvdHRvbTo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLWNmZy1maWVsZHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjEycHggMDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctZmllbGQrLmRzZHItY2ZnLWZpZWxke2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItY2ZnLWxhYmVse21pbi13aWR0aDowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NTAwO2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1oaW50e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLXBlbmRpbmd7d2hpdGUtc3BhY2U6bm93cmFwO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDtmbGV4Om5vbmU7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxN3B4fVxuLmRzZHItY2ZnLWZhaWxlZHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZXJyb3IpO2ZsZXg6MTttYXJnaW46MDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctYWN0aW9uc3tib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzoxMnB4IDAgNHB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWJvZHl7ZGlzcGxheTpmbGV4O2ZsZXg6MTttaW4taGVpZ2h0OjB9XG4uZHNkci1maWxlc3t3aWR0aDozMDBweDtmbGV4Om5vbmU7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtvdmVyZmxvdy15OmF1dG87cGFkZGluZzo4cHh9XG4uZHNkci1yb3VuZHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo4cHggOHB4IDNweDtmb250LXdlaWdodDo2MDB9XG4uZHNkci1yb3VuZC1sYWJlbHt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NDAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItZmlsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maWxlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbGUtc2VsZWN0ZWR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZGlye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItZGlyOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kaXItY2FyZXR7ZmxleDpub25lO3dpZHRoOjEycHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpci1uYW1le2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItZGlyLWNvdW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWZpbGUtbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmlsZS1zdGF0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWNoaXB7ZmxleDpub25lO21pbi13aWR0aDoyMnB4O3RleHQtYWxpZ246Y2VudGVyO2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNoaXAtbXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtYXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtZHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xNik7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWNoaXAtcntiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpO2NvbG9yOiM1OGE2ZmZ9XG4uZHNkci1jaGlwLXV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXRvb2x7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1kaWZme2ZsZXg6MTttaW4td2lkdGg6MDtvdmVyZmxvdzphdXRvO3BhZGRpbmc6MTBweCAwfVxuLmRzZHItZGlmZi1lbXB0eXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7aGVpZ2h0OjEwMCU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWRpZmYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6NnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItZGlmZi1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZGlmZi1zdGF0c3tmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXNjcm9sbHtmbGV4OjE7bWluLWhlaWdodDowO292ZXJmbG93OmF1dG87ZGlzcGxheTpmbGV4fVxuLmRzZHItcHJle21hcmdpbjowO3BhZGRpbmc6OHB4IDA7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KTt3aGl0ZS1zcGFjZTpwcmU7bWluLXdpZHRoOjEwMCU7ZmxleDoxfVxuLmRzZHItbGluZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MTBweDtwYWRkaW5nOjAgMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cG9zaXRpb246cmVsYXRpdmV9XG4uZHNkci1saW5lLW51bXtmbGV4Om5vbmU7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NDBweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO29wYWNpdHk6Ljc1fVxuLmRzZHItbGluZS10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpwcmV9XG4uZHNkci1jb21tZW50LWFkZHtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtNTAlKTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MTZweDtoZWlnaHQ6MTZweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjRweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRkLC5kc2RyLWNvbW1lbnQtYWRkOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItY29tbWVudC1hZGQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1lbnQtaGFze3Zpc2liaWxpdHk6dmlzaWJsZTtiYWNrZ3JvdW5kOmNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCkgMTYlLCB0cmFuc3BhcmVudCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmb250LXNpemU6MTBweH1cbi5kc2RyLWxpbmUtY29tbWVudGVke2JveC1zaGFkb3c6aW5zZXQgM3B4IDAgMCBjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDcwJSwgdHJhbnNwYXJlbnQpfVxuLmRzZHItY29tbWVudC1lZGl0b3J7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1jb21tZW50LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6NTJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6NnB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtyZXNpemU6dmVydGljYWx9XG4uZHNkci1jb21tZW50LWlucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpfVxuLmRzZHItY29tbWVudC1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2p1c3RpZnktY29udGVudDpmbGV4LWVuZH1cbi5kc2RyLW9wZW5saW5le2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MThweDtoZWlnaHQ6MThweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLW9wZW5saW5lLC5kc2RyLW9wZW5saW5lOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItb3BlbmxpbmU6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItbGluZS1maW5kaW5ne2JveC1zaGFkb3c6aW5zZXQgM3B4IDAgMCB2YXIoLS1kc2RyLWZpbmRpbmctY29sb3IsIHJnYmEoMjU1LDE2Niw4NywuNykpfVxuLmRzZHItZmluZGluZy1QMHstLWRzZHItZmluZGluZy1jb2xvcjojZjg1MTQ5fVxuLmRzZHItZmluZGluZy1QMXstLWRzZHItZmluZGluZy1jb2xvcjojZmZhNjU3fVxuLmRzZHItZmluZGluZy1QMnstLWRzZHItZmluZGluZy1jb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy1QM3stLWRzZHItZmluZGluZy1jb2xvcjojOGI5NDllfVxuLmRzZHItZmluZGluZy10YWd7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo2MDA7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0O21hcmdpbi10b3A6MnB4fVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAwe2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE4KTtjb2xvcjojZjg1MTQ5fVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAxe2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4xNik7Y29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMntiYWNrZ3JvdW5kOnJnYmEoMjEwLDE1MywzNCwuMTYpO2NvbG9yOiNkMjk5MjJ9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDN7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtanVtcHtiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpfVxuLmRzZHItdmVyZGljdHtwb3NpdGlvbjpzdGlja3k7dG9wOjA7ei1pbmRleDo2O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttYXJnaW46MCAwIDZweDtwYWRkaW5nOjhweCAxMnB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjEwcHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Mik7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLXZlcmRpY3QtbWFya3tmbGV4Om5vbmU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoyMHB4O2hlaWdodDoyMHB4O2JvcmRlci1yYWRpdXM6NTAlO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjcwMH1cbi5kc2RyLXZlcmRpY3Qtb2sgLmRzZHItdmVyZGljdC1tYXJre2JhY2tncm91bmQ6Y29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpIDE4JSwgdHJhbnNwYXJlbnQpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdmVyZGljdC1iYWQgLmRzZHItdmVyZGljdC1tYXJre2JhY2tncm91bmQ6Y29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KSAxOCUsIHRyYW5zcGFyZW50KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci12ZXJkaWN0LXRleHR7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3Qtb2sgLmRzZHItdmVyZGljdC10ZXh0e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdmVyZGljdC1iYWQgLmRzZHItdmVyZGljdC10ZXh0e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3QtbWV0YXtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci12ZXJkaWN0LW1vZGVse2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1maW5kaW5nLWNhcmR7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O21hcmdpbjo0cHggMCA2cHg7cGFkZGluZzo4cHggMTZweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLmRzZHItc2F2ZWQtY29tbWVudC1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXNhdmVkLWNvbW1lbnQtanVtcHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7d2lkdGg6MTAwJTttaW4td2lkdGg6MDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6NnB4O3BhZGRpbmc6MnB4O3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcjtmb250OmluaGVyaXR9XG4uZHNkci1zYXZlZC1jb21tZW50LWp1bXA6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItc2F2ZWQtY29tbWVudC1qdW1wOmhvdmVyIC5kc2RyLXNhdmVkLWNvbW1lbnQtbG9je2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItc2F2ZWQtY29tbWVudC12aWV3e3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7cmVzaXplOm5vbmV9XG4uZHNkci1maW5kaW5nLWNhcmQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1maW5kaW5nLWNhcmQtdGl0bGV7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maW5kaW5nLWNhcmQtbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfVxuLmRzZHItZmluZGluZy1jYXJkLWRldGFpbHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1maW5kaW5nLWNhcmQtbWV0YXtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmluZGluZy1jYXJkLXN1Z2dlc3Rpb257bWFyZ2luOjA7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXBye2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDtwYWRkaW5nOjRweCA4cHggOHB4fVxuLmRzZHItcHItaXRlbXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDozcHg7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdH1cbi5kc2RyLXByLWl0ZW06aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItcHItbWV0YXtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItcHItdGV4dHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZG9ja3tib3gtc2l6aW5nOmJvcmRlci1ib3g7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3dpZHRoOjEwMCU7bWF4LXdpZHRoOnZhcigtLWRzaC1jb21wb3Nlci1jYXJkLW1heC13aWR0aCwgNzgwcHgpO21hcmdpbjowIGF1dG8gY2FsYygtMSAqIHZhcigtLWRzaC1jb21wb3Nlci1zdGFjay1nYXAsIDZweCkgLSA4cHgpO3BhZGRpbmc6OHB4IDE2cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtaW5wdXQtbWFqb3IpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMi1kYXJrbW9kZS10aGluKTtib3JkZXItYm90dG9tOm5vbmU7Ym9yZGVyLXJhZGl1czoyMnB4IDIycHggMCAwO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZG9jay1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4taGVpZ2h0OjIycHg7bWFyZ2luOi04cHggLTE2cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItcmFkaXVzOjIycHggMjJweCAwIDA7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci1kb2NrLWhlYWQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZG9jay1pY29ue2Rpc3BsYXk6aW5saW5lLWZsZXg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpfVxuLmRzZHItZG9jay1jb3VudHtmb250LXdlaWdodDo2MDA7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci1kb2NrLWZsYXNoe2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpO2ZvbnQtc2l6ZToxMXB4O3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2stc2VuZC1oaW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCk7dmlzaWJpbGl0eTpoaWRkZW47d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItZG9jay1oZWFkOmhvdmVyIC5kc2RyLWRvY2stc2VuZC1oaW50e3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWRvY2stY2xvc2V7ZmxleDpub25lO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MjBweDtoZWlnaHQ6MjBweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowfVxuLmRzZHItZG9jay1jbG9zZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZG9jay1jaGlwc3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWluLWhlaWdodDoyNnB4O21hcmdpbjowIC0xNnB4O3BhZGRpbmc6MCAxNnB4O292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWRvY2stY2hpcHtmbGV4OjAgMSBhdXRvO21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjNweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0O3RleHQtYWxpZ246bGVmdH1cbi5kc2RyLWRvY2stY2hpcDpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1kb2NrLWNoaXAtbG9je2ZsZXg6bm9uZTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCk7d2hpdGUtc3BhY2U6bm93cmFwO21heC13aWR0aDo0MiU7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXN9XG4uZHNkci1kb2NrLWNoaXAtdGV4dHttaW4td2lkdGg6MDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc31cbi5kc2RyLWRvY2stY2hpcC1tb3Jle2ZsZXg6bm9uZTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzoycHggNnB4O2JvcmRlci1yYWRpdXM6NnB4O3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2stY2hpcC1tb3JlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZW5ke3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NDA7dG9wOjUycHg7cmlnaHQ6MTZweDt3aWR0aDptaW4oNDgwcHgsY2FsYygxMDAlIC0gMzJweCkpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym9yZGVyLXJhZGl1czoxMnB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO3BhZGRpbmc6MTJweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo4cHh9XG4uZHNkci1zZW5kLXRpdGxle2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZW5kLWhpbnR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc2VuZC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjE0MHB4O21heC1oZWlnaHQ6MzIwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cmVzaXplOnZlcnRpY2FsO3doaXRlLXNwYWNlOnByZS13cmFwfVxuLmRzZHItbGluZS1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItbGluZS1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItbGluZS1odW5re2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWZpbGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtbm90ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc3R5bGU6aXRhbGljfVxuLmRzZHItaHVuay1iYXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4O3BhZGRpbmc6NHB4IDEycHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMil9XG4uZHNkci1odW5rLWFjdGlvbntkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjI4cHg7aGVpZ2h0OjI4cHg7cGFkZGluZzowO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udDoxOHB4LzEgdmFyKC0tZHN3LWZvbnQtc2Fucyk7Y3Vyc29yOnBvaW50ZXJ9LmRzZHItaHVuay1hY3Rpb246aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX0uZHNkci1odW5rLWFjdGlvbi1zdGFnZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX0uZHNkci1odW5rLWFjdGlvbi1yZXZlcnQ6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXR1cy1kYW5nZXIpfS5kc2RyLWh1bmstYWN0aW9uOmRpc2FibGVke2N1cnNvcjpkZWZhdWx0O29wYWNpdHk6LjQ1fVxuLmRzZHItaHVuay1sYXllcntmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7bWFyZ2luLXJpZ2h0OmF1dG99XG4uZHNkci1mb290e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWluLWhlaWdodDozNnB4fVxuLmRzZHItbm90aWNle2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbm90aWNlLW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItbm90aWNlLWVycm9ye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXNwaW5uZXJ7ZmxleDpub25lO3dpZHRoOjEycHg7aGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjJweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItdG9wLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2FuaW1hdGlvbjpkc2RyLXNwaW4gLjhzIGxpbmVhciBpbmZpbml0ZX1cbkBrZXlmcmFtZXMgZHNkci1zcGlue3Rve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19XG4uZHNkci1lbXB0eXtwYWRkaW5nOjQwcHg7dGV4dC1hbGlnbjpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWVtcHR5LWFjdGlvbnN7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpjZW50ZXI7bWFyZ2luLXRvcDoxMnB4fVxuLmRzZHItbm9kaWZme3BhZGRpbmc6OHB4IDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLXNlbHtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItc2VsLXRyaWdnZXJ7Ym94LXNpemluZzpjb250ZW50LWJveDttaW4td2lkdGg6MTgwcHg7aGVpZ2h0OjM0cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMyk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowIDEycHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4fVxuLmRzZHItc2VsLXRyaWdnZXI6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItc2VsLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpO291dGxpbmU6bm9uZX1cbi5kc2RyLXNlbC10cmlnZ2VyIHN2Z3tmbGV4Om5vbmU7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjEyc31cbi5kc2RyLXNlbC10cmlnZ2VyW2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdIHN2Z3t0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9XG4uZHNkci1zZWwtdmFsdWV7ZmxleDoxO21pbi13aWR0aDowO3RleHQtYWxpZ246bGVmdDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1zZWwtbWVudXt6LWluZGV4OjIwMDtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLXdpZHRoOjEwMCU7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtib3JkZXItcmFkaXVzOjEwcHg7bWFyZ2luOjA7cGFkZGluZzo0cHg7bGlzdC1zdHlsZTpub25lO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjFweDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6Y2FsYygxMDAlICsgNXB4KTtsZWZ0OjB9XG4uZHNkci1zZWwtb3B0aW9ue2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MzBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Ym9yZGVyLXJhZGl1czo3cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo1cHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO3RleHQtYWxpZ246bGVmdDtkaXNwbGF5OmZsZXh9XG4uZHNkci1zZWwtb3B0aW9uOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXNlbC1vcHRpb24tYWN0aXZle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbWFya3tmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItc2VsLW9wdGlvbi1sYWJlbHtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItdmlldy10b2dnbGV7ZGlzcGxheTpmbGV4O2dhcDoycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjJweDtmbGV4Om5vbmV9XG4uZHNkci12aWV3LWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyMnB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjFweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci12aWV3LWJ0bjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXZpZXctYnRuLWFjdGl2ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXR7bWluLXdpZHRoOjEwMCV9XG4uZHNkci1zcGxpdC1oZWFke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo0cHggOHB4O3Bvc2l0aW9uOnN0aWNreTt0b3A6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItc3BsaXQtaGVhZCBkaXZ7ZGlzcGxheTpmbGV4O2dhcDo4cHh9XG4uZHNkci1zcGxpdC1odW5re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MnB4IDE2cHh9XG4uZHNkci1zcGxpdC1yb3d7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCl9XG4uZHNkci1zcGxpdC1jZWxsOmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRkLC5kc2RyLXNwbGl0LXJvdzpob3ZlciAuZHNkci1jb21tZW50LWFkZHt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1zcGxpdC1jZWxse2Rpc3BsYXk6ZmxleDtmbGV4LXdyYXA6d3JhcDtnYXA6OHB4O3BhZGRpbmc6MCA4cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGxpdC1jZWxsPi5kc2RyLWNvbW1lbnQtZWRpdG9ye2ZsZXg6MCAwIDEwMCU7cGFkZGluZzo2cHggOHB4fVxuLmRzZHItc3BsaXQtbnVte2ZsZXg6bm9uZTtwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo0MnB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZTpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSAtIDFweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjB9XG4uZHNkci1jZWxsLWZpbmRpbmd7Ym94LXNoYWRvdzppbnNldCAwIDAgMCAxcHggdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKTtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMDgpfVxuLmRzZHItY2VsbC1qdW1we2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNil9XG4uZHNkci1zcGxpdC1maW5kaW5ne2ZsZXg6bm9uZTtmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czozcHg7cGFkZGluZzowIDNweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo2MDA7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDB7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTgpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMntiYWNrZ3JvdW5kOnJnYmEoMjEwLDE1MywzNCwuMTYpO2NvbG9yOiNkMjk5MjJ9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QM3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc3BsaXQtb3BlbmxpbmV7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxNnB4O2hlaWdodDoxNnB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxO3BhZGRpbmc6MDt2aXNpYmlsaXR5OmhpZGRlbn1cbi5kc2RyLXNwbGl0LWNlbGw6aG92ZXIgLmRzZHItc3BsaXQtb3BlbmxpbmUsLmRzZHItc3BsaXQtb3BlbmxpbmU6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1zcGxpdC1vcGVubGluZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jZWxsLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1jZWxsLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1jZWxsLWRpbXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwxLCByZ2JhKDEyOCwxMjgsMTI4LC4wNSkpfVxuLyogLS0tIGNvbnZlcnNhdGlvbiByZXZpZXcgY2FyZCAoQ29kZXgtc3R5bGUpIC0tLSAqL1xuLmRzZHItcmV2aWV3LWNhcmR7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O21heC13aWR0aDptaW4oNzIwcHgsMTAwJSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1yYWRpdXM6MTZweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYyKTtvdmVyZmxvdzpoaWRkZW47bWFyZ2luOjJweCAwfVxuLmRzZHItcmV2aWV3LWNhcmQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo4cHggMTJweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLXJldmlldy1jYXJkLWJhZGdle2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWJhZGdlIHN2Z3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCl9XG4uZHNkci1yZXZpZXctY2FyZC13b3Jrc3BhY2V7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfVxuLmRzZHItcmV2aWV3LWNhcmQtbWV0YXtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWdyb3Vwe2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDt3aWR0aDoxMDAlO21pbi13aWR0aDowO3BhZGRpbmc6NnB4IDEycHg7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoIHNwYW57bWluLXdpZHRoOjA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItcmV2aWV3LWNhcmQtaXRlbXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6OHB4O3dpZHRoOjEwMCU7bWluLXdpZHRoOjA7cGFkZGluZzo1cHggMTJweCA1cHggMjZweDtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci1yZXZpZXctY2FyZC1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXJldmlldy1jYXJkLWxvY3tmbGV4Om5vbmU7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpO3doaXRlLXNwYWNlOm5vd3JhcDtwYWRkaW5nLXRvcDoxcHh9XG4uZHNkci1yZXZpZXctY2FyZC10ZXh0e21pbi13aWR0aDowO292ZXJmbG93LXdyYXA6YW55d2hlcmU7d2hpdGUtc3BhY2U6cHJlLXdyYXB9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LXNlY3tkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo4cHggMTJweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3R7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjYwMDtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjFweCA2cHh9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LWNvcnJlY3R7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC1pbmNvcnJlY3R7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWZpbmRpbmd7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjZweDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtZmluZGluZy10ZXh0e21pbi13aWR0aDowO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1yZXZpZXctY2FyZC1maW5kaW5nLWxvY3tmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtZm9vdHtwYWRkaW5nOjZweCAxMnB4O2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4vKiAtLS0gQ29kZXgtc3R5bGUgcmVwbHkgY2hhbmdlIHN1bW1hcnkgKHR1cm4gdGFpbCkgLS0tICovXG4uZHNkci10dXJuLXN1bW1hcnl7bWF4LXdpZHRoOm1pbig3MjBweCwxMDAlKTttYXJnaW46MnB4IDAgMTBweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1yYWRpdXM6MTRweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXR1cm4tc3VtbWFyeS1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzoxMnB4IDE0cHh9XG4uZHNkci10dXJuLXN1bW1hcnktaWNvbntkaXNwbGF5OmdyaWQ7cGxhY2UtaXRlbXM6Y2VudGVyO3dpZHRoOjM0cHg7aGVpZ2h0OjM0cHg7Ym9yZGVyLXJhZGl1czoxMHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdHVybi1zdW1tYXJ5LXRpdGxle2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci10dXJuLXN1bW1hcnktc3RhdHN7Zm9udC1zaXplOjEzcHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLXR1cm4tc3VtbWFyeS1hZGR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10dXJuLXN1bW1hcnktZGVse2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTttYXJnaW4tbGVmdDo0cHh9XG4uZHNkci10dXJuLXN1bW1hcnktZmlsZXN7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4uZHNkci10dXJuLXN1bW1hcnktZmlsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7d2lkdGg6MTAwJTtwYWRkaW5nOjhweCAxNHB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udDppbmhlcml0O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMnB4O3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcn1cbi5kc2RyLXR1cm4tc3VtbWFyeS1maWxlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci10dXJuLXN1bW1hcnktZmlsZSBzcGFuOmZpcnN0LWNoaWxke21pbi13aWR0aDowO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLXR1cm4tc3VtbWFyeS1maWxlLXN0YXRze21hcmdpbi1sZWZ0OmF1dG87ZmxleDpub25lO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LXNhbnMsc3lzdGVtLXVpKTtmb250LXNpemU6MTJweH1cbi8qIC0tLSBGaWxlcyBkcmF3ZXIgLS0tICovXG4uZHNkci1maWxlcy13b3Jrc3BhY2V7ZGlzcGxheTpmbGV4O21pbi1oZWlnaHQ6MDtmbGV4OjE7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSl9XG4uZHNkci1maWxlcy10b29sYmFye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzoxMHB4IDEycHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4uZHNkci1maWxlcy1zZWFyY2h7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo3cHggOXB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweH1cbi5kc2RyLWZpbGVzLWNvbnRlbnR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczptaW5tYXgoMjMwcHgsMzElKSAxZnI7bWluLWhlaWdodDowO2ZsZXg6MX1cbi5kc2RyLWZpbGVzLWxpc3R7b3ZlcmZsb3c6YXV0bztib3JkZXItcmlnaHQ6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO3BhZGRpbmc6OHB4IDZweH1cbi5kc2RyLWZpbGVzLWl0ZW17ZGlzcGxheTpmbGV4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7cGFkZGluZzo2cHggOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQ6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci1maWxlcy1pdGVtOmhvdmVyLC5kc2RyLWZpbGVzLWl0ZW0tYWN0aXZle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maWxlcy1lZGl0b3J7ZGlzcGxheTpmbGV4O21pbi13aWR0aDowO2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn0uZHNkci1maWxlcy1wYXRoe3BhZGRpbmc6OHB4IDEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250OjExcHggdmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLmRzZHItY29kZS1lZGl0b3J7ZGlzcGxheTpmbGV4O21pbi1oZWlnaHQ6MDtmbGV4OjE7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMSk7b3ZlcmZsb3c6aGlkZGVufS5kc2RyLWNvZGUtbGluZXN7ZmxleDpub25lO3dpZHRoOjQ4cHg7Ym94LXNpemluZzpib3JkZXItYm94O292ZXJmbG93OmhpZGRlbjtwYWRkaW5nOjEycHggOHB4IDEycHggMDtib3JkZXItcmlnaHQ6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udDoxMnB4LzIwcHggdmFyKC0tZHN3LWZvbnQtbW9ubyk7dGV4dC1hbGlnbjpyaWdodDt1c2VyLXNlbGVjdDpub25lfS5kc2RyLWNvZGUtbGluZXMgc3BhbntkaXNwbGF5OmJsb2NrO2hlaWdodDoyMHB4fVxuLmRzZHItY29kZS1sYXllcntwb3NpdGlvbjpyZWxhdGl2ZTttaW4td2lkdGg6MDttaW4taGVpZ2h0OjA7ZmxleDoxO292ZXJmbG93OmhpZGRlbn0uZHNkci1jb2RlLWhpZ2hsaWdodCwuZHNkci1maWxlcy10ZXh0e2JveC1zaXppbmc6Ym9yZGVyLWJveDtwb3NpdGlvbjphYnNvbHV0ZTtpbnNldDowO21hcmdpbjowO3BhZGRpbmc6MTJweCAxNHB4O2JvcmRlcjowO2ZvbnQ6MTJweC8yMHB4IHZhcigtLWRzdy1mb250LW1vbm8pO3RhYi1zaXplOjI7d2hpdGUtc3BhY2U6cHJlO292ZXJmbG93OmF1dG99LmRzZHItY29kZS1oaWdobGlnaHR7cG9pbnRlci1ldmVudHM6bm9uZTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7YmFja2dyb3VuZDp0cmFuc3BhcmVudH0uZHNkci1maWxlcy10ZXh0e3Jlc2l6ZTpub25lO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dHJhbnNwYXJlbnQ7Y2FyZXQtY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO291dGxpbmU6MDstd2Via2l0LXRleHQtZmlsbC1jb2xvcjp0cmFuc3BhcmVudH0uZHNkci1maWxlcy10ZXh0OjpzZWxlY3Rpb257YmFja2dyb3VuZDpyZ2JhKDkxLDE0MCwyNTUsLjM1KX1cbi5kc2RyLWNvZGUta2V5d29yZHtjb2xvcjojYzU4NmMwfS5kc2RyLWNvZGUtc3RyaW5ne2NvbG9yOiNjZTkxNzh9LmRzZHItY29kZS1jb21tZW50e2NvbG9yOiM2YTk5NTV9LmRzZHItY29kZS1udW1iZXJ7Y29sb3I6I2I1Y2VhOH0uZHNkci1jb2RlLXBsYWlue2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWltYWdlLXByZXZpZXd7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO21pbi1oZWlnaHQ6MDtmbGV4OjE7b3ZlcmZsb3c6YXV0bztwYWRkaW5nOjI0cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMSl9LmRzZHItaW1hZ2UtcHJldmlldyBpbWd7bWF4LXdpZHRoOjEwMCU7bWF4LWhlaWdodDoxMDAlO29iamVjdC1maXQ6Y29udGFpbjtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYyKX0uZHNkci1maWxlcy11bmF2YWlsYWJsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7bWluLWhlaWdodDowO2ZsZXg6MTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4fVxuLmRzZHItZmlsZXMtYWN0aW9uc3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7cGFkZGluZzo4cHggMTBweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKX1cbi8qIC0tLSBmYWxsYmFjayB1c2VyIGJ1YmJsZSAobmF0aXZlIGxvb2spIC0tLSAqL1xuLmRzZHItZmFsbGJhY2stdXNlcntmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6ZmxleC1lbmQ7Z2FwOjZweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1mYWxsYmFjay11c2VyLXN0YWNre2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjthbGlnbi1pdGVtczpmbGV4LWVuZDtnYXA6OHB4O21pbi13aWR0aDowO21heC13aWR0aDptaW4oNTI1cHgsODIlKTtkaXNwbGF5OmZsZXh9XG4uZHNkci1mYWxsYmFjay11c2VyLXJvd3tmbGV4LWRpcmVjdGlvbjpyb3c7YWxpZ24taXRlbXM6ZmxleC1lbmQ7Z2FwOjZweDttYXgtd2lkdGg6MTAwJTtkaXNwbGF5OmZsZXh9XG4uZHNkci1mYWxsYmFjay11c2VyLWJ1YmJsZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1idWJibGUpO21heC13aWR0aDoxMDAlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtib3JkZXItcmFkaXVzOjIycHg7cGFkZGluZzoxMHB4IDE2cHg7Zm9udC1zaXplOjE2cHg7bGluZS1oZWlnaHQ6MjRweDt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZmFsbGJhY2stdXNlci1jb3B5e2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MjRweDtoZWlnaHQ6MjRweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDtiYWNrZ3JvdW5kOjAgMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTFweDt2aXNpYmlsaXR5OmhpZGRlbjttYXJnaW4tYm90dG9tOjJweH1cbi5kc2RyLWZhbGxiYWNrLXVzZXI6aG92ZXIgLmRzZHItZmFsbGJhY2stdXNlci1jb3B5LC5kc2RyLWZhbGxiYWNrLXVzZXItY29weTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWZhbGxiYWNrLXVzZXItY29weTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuYFxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc3R5bGVbZGF0YS1wbHVnaW4tY3NzPSR7SlNPTi5zdHJpbmdpZnkoU1RZTEVfVEFHKX1dYCkgPT09IG51bGwpIHtcbiAgY29uc3QgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICB0YWcuZGF0YXNldC5wbHVnaW4gPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldydcbiAgdGFnLmRhdGFzZXQucGx1Z2luQ3NzID0gU1RZTEVfVEFHXG4gIHRhZy50ZXh0Q29udGVudCA9IFJFVklFV19DU1NcbiAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0YWcpXG59XG5cbi8qKiBTaW1wbGlmaWVkIENoaW5lc2UgZGljdGlvbmFyeSAoa2V5LXNldCBzb3VyY2Ugb2YgdHJ1dGgpLiAqL1xuY29uc3QgemggPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1x1NUJBMVx1NjdFNVx1NUY1M1x1NTI0RFx1OTg3OVx1NzZFRVx1NEUwRVx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOScsXG4gICd0YWIuc2Vzc2lvbic6ICdcdTRGMUFcdThCRERcdTY2RjRcdTY1MzknLFxuICAndGFiLndvcmtzcGFjZSc6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAncmV2aWV3LnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdyZXZpZXcuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnXHU2RTM4XHU3OUJCIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnXHU1RjUzXHU1MjREXHU3NkVFXHU1RjU1XHU0RTBEXHU2NjJGIGdpdCBcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1x1MzAwQ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOVx1MzAwRFx1OTg3NVx1N0I3RVx1NEUwRFx1NTNEN1x1NUY3MVx1NTRDRFx1RkYwQ1x1NEVDRFx1NTNFRlx1NjdFNVx1NzcwQlx1NkJDRlx1OEY2RVx1NEZFRVx1NjUzOVx1MzAwMicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdcdThGRDlcdTRFMkFcdTRGMUFcdThCRERcdThGRDhcdTZDQTFcdTY3MDlcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzlcdThCQjBcdTVGNTUnLFxuICAncmV2aWV3LnNlc3Npb25TY2FuJzogJ1x1NURGMlx1NjI2Qlx1NjNDRiB7cmVzdWx0c30gXHU0RTJBXHU1REU1XHU1MTc3XHU3RUQzXHU2NzlDXHVGRjFBe2RpZmZ9IFx1NEUyQVx1NjQzQVx1NUUyNiBkaWZmXHUzMDAxe3BhdGh9IFx1NEUyQVx1NEVDNVx1NjcwOVx1OERFRlx1NUY4NFx1MjAxNFx1MjAxNFx1N0VDOFx1N0FFRlx1NTQ3RFx1NEVFNFx1RkYwOGJhc2hcdUZGMDlcdTY1MzlcdTY1ODdcdTRFRjZcdTRFMERcdTRGMUFcdThCQTFcdTUxNjVcdTRGMUFcdThCRERcdThCQjBcdTVGNTVcdTMwMDInLFxuICAncmV2aWV3LmdvV29ya3NwYWNlJzogJ1x1NjdFNVx1NzcwQlx1NURFNVx1NEY1Q1x1NTMzQVx1NjUzOVx1NTJBOCcsXG4gICdyZXZpZXcuc2Vzc2lvblN0YXRzJzogJ3tyb3VuZHN9IFx1OEY2RSBcdTAwQjcge2ZpbGVzfSBcdTRFMkFcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LnJvdW5kJzogJ1x1N0IyQyB7cm91bmR9IFx1OEY2RScsXG4gICdyZXZpZXcuZW1wdHknOiAnXHU2Q0ExXHU2NzA5XHU2NzJBXHU2M0QwXHU0RUE0XHU3Njg0XHU2NkY0XHU2NTM5IFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ1x1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcuYWNjZXB0JzogJ1x1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0JzogJ1x1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuYWNjZXB0QWxsJzogJ1x1NTE2OFx1OTBFOFx1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1x1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcudW5zdGFnZSc6ICdcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnVuc3RhZ2VBbGwnOiAnXHU1MTY4XHU5MEU4XHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsuc3RhZ2UnOiAnXHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsucmV2ZXJ0JzogJ1x1NEUyMlx1NUYwMycsXG4gICdodW5rLnVuc3RhZ2UnOiAnXHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsuc3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnVuc3RhZ2VkJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU1MTY4XHU5MEU4XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb21taXQnOiAnXHU2M0QwXHU0RUE0JyxcbiAgJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcic6ICdcdTYzRDBcdTRFQTRcdThCRjRcdTY2MEVcdTIwMjYnLFxuICAncmV2aWV3LnB1c2gnOiAnXHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb25maXJtUHVzaCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LmNvbW1pdHRlZCc6ICdcdTVERjJcdTYzRDBcdTRFQTQge3N1bW1hcnl9JyxcbiAgJ3Jldmlldy5jb21taXRGYWlsZWQnOiAnXHU2M0QwXHU0RUE0XHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5wdXNoZWQnOiAnXHU1REYyXHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5wdXNoRmFpbGVkJzogJ1x1NjNBOFx1OTAwMVx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcuYWhlYWQnOiAnXHU5ODg2XHU1MTQ4IHtufScsXG4gICdyZXZpZXcuYmVoaW5kJzogJ1x1ODQzRFx1NTQwRSB7bn0nLFxuICAncmV2aWV3LnNlY3Rpb25TdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcyc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnNlY3Rpb25CcmFuY2gnOiAnXHU1MjA2XHU2NTJGXHU0RTBFXHU4RkRDXHU3QTBCJyxcbiAgJ3Jldmlldy5ub1Vwc3RyZWFtJzogJ1x1NjcyQVx1OEJCRVx1N0Y2RVx1NEUwQVx1NkUzOFx1NTIwNlx1NjUyRicsXG4gICdyZXZpZXcuaGlzdG9yeSc6ICdcdTUzODZcdTUzRjInLFxuICAncmV2aWV3LmNvbW1pdEZpbGVzJzogJ1x1NTNEOFx1NTJBOFx1NjU4N1x1NEVGNicsXG4gICdoaXN0b3J5LmxvY2FsJzogJ1x1NjcyQ1x1NTczMCcsXG4gICdoaXN0b3J5LnJlbW90ZSc6ICdcdThGRENcdTdBMEInLFxuICAndGltZS5ub3cnOiAnXHU1MjFBXHU1MjFBJyxcbiAgJ3RpbWUubWludXRlcyc6ICd7bn0gXHU1MjA2XHU5NDlGXHU1MjREJyxcbiAgJ3RpbWUuaG91cnMnOiAne259IFx1NUMwRlx1NjVGNlx1NTI0RCcsXG4gICd0aW1lLmRheXMnOiAne259IFx1NTkyOVx1NTI0RCcsXG4gICdyZXZpZXcucmVmcmVzaCc6ICdcdTUyMzdcdTY1QjAnLFxuICAncmV2aWV3LmNsb3NlJzogJ1x1NTE3M1x1OTVFRCcsXG4gICdyZXZpZXcuYnVzeSc6ICdcdTU5MDRcdTc0MDZcdTRFMkRcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LmRvbmVPbmUnOiAnXHU1REYye2FjdGlvbn0ge3BhdGh9JyxcbiAgJ3Jldmlldy5kb25lRGVsZXRlZCc6ICdcdTVERjJ7YWN0aW9ufSB7Y291bnR9IFx1NEUyQVx1NjU4N1x1NEVGNlx1RkYwOFx1NTIyMFx1OTY2NCB7ZGVsZXRlZH0gXHU0RTJBXHU2NzJBXHU4RERGXHU4RTJBXHU2NTg3XHU0RUY2XHVGRjA5JyxcbiAgJ3Jldmlldy5hY2NlcHRlZCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydGVkJzogJ1x1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ1x1NjcyQVx1OERERlx1OEUyQScsXG4gICdyZXZpZXcuYmluYXJ5JzogJ1x1NEU4Q1x1OEZEQlx1NTIzNicsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdcdThCRTVcdTRGRUVcdTY1MzlcdTZDQTFcdTY3MDkgZGlmZiBcdTY1NzBcdTYzNkUnLFxuICAncmV2aWV3LmNoYW5nZXMnOiAne2FkZGVkfSsge2RlbGV0ZWR9LScsXG4gICd2aWV3LnNpbmdsZSc6ICdcdTUzNTVcdTY4MEYnLFxuICAndmlldy5zcGxpdCc6ICdcdTUzQ0NcdTY4MEYnLFxuICAndmlldy5iZWZvcmUnOiAnXHU1MzlGXHU2NTg3XHU0RUY2JyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnXHU2NUIwXHU2NTg3XHU0RUY2JyxcbiAgJ2NvbW1lbnQuYWRkJzogJ1x1OEJDNFx1OEJCQVx1NkI2NFx1ODg0QycsXG4gICdjb21tZW50LnNob3cnOiAnXHU2N0U1XHU3NzBCXHU4QkM0XHU4QkJBJyxcbiAgJ2NvbW1lbnQucGxhY2Vob2xkZXInOiAnXHU4QkM0XHU4QkJBXHUyMDI2XHVGRjA4Q3RybC9cdTIzMTgrRW50ZXIgXHU0RkREXHU1QjU4XHVGRjA5JyxcbiAgJ2NvbW1lbnQuc2F2ZSc6ICdcdTRGRERcdTVCNTgnLFxuICAnY29tbWVudC5jYW5jZWwnOiAnXHU1M0Q2XHU2RDg4JyxcbiAgJ2NvbW1lbnQuZGVsZXRlJzogJ1x1NTIyMFx1OTY2NCcsXG4gICdjb21tZW50LmVkaXQnOiAnXHU3RjE2XHU4RjkxJyxcbiAgJ2NvbW1lbnQuc2F2ZWQnOiAnXHU1REYyXHU0RkREXHU1QjU4XHU4QkM0XHU4QkJBJyxcbiAgJ2NvbW1lbnQuZmFpbGVkJzogJ1x1OEJDNFx1OEJCQVx1NEZERFx1NUI1OFx1NTkzMVx1OEQyNScsXG4gICdzY29wZS5sYWJlbCc6ICdcdTgzMDNcdTU2RjQnLFxuICAnc2NvcGUuYWxsJzogJ1x1NTE2OFx1OTBFOCcsXG4gICdzY29wZS51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAnc2NvcGUuc3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdzY29wZS5jb21taXQnOiAnXHU2M0QwXHU0RUE0JyxcbiAgJ3Njb3BlLmJyYW5jaCc6ICdcdTUyMDZcdTY1MkYnLFxuICAnc2NvcGUubGFzdC10dXJuJzogJ1x1NjcwMFx1NTQwRVx1NEUwMFx1OEY2RScsXG4gICdyZXZpZXcubGFzdFR1cm5FbXB0eSc6ICdcdTY3MDBcdTU0MEVcdTRFMDBcdThGNkVcdTZDQTFcdTY3MDlcdThCQjBcdTVGNTVcdTUyMzBcdTY1ODdcdTRFRjZcdTRGRUVcdTY1MzkgXHUyMDE0XHUyMDE0IFx1N0VDOFx1N0FFRlx1NTQ3RFx1NEVFNFx1RkYwOGJhc2hcdUZGMDlcdTY1MzlcdTY1ODdcdTRFRjZcdTRFMERcdTRGMUFcdThCQTFcdTUxNjVcdTRGMUFcdThCRERcdThCQjBcdTVGNTVcdUZGMUJcdTUzRUZcdTUyMDdcdTUyMzBcdTMwMENcdTUxNjhcdTkwRThcdTMwMERcdTY3RTVcdTc3MEIgZ2l0IFx1NTNEOFx1NjZGNCcsXG4gICdzY29wZS5iYXNlJzogJ1x1NTdGQVx1N0VCRlx1NTIwNlx1NjUyRicsXG4gICdzY29wZS5icmFuY2hSZWFkb25seSc6ICdcdTUyMDZcdTY1MkZcdTgzMDNcdTU2RjRcdTUzRUFcdThCRkJcdUZGMDhcdTVCRjlcdTZCRDQgbWVyZ2UtYmFzZVx1RkYwQ1x1NEUwRFx1NjNEMFx1NEY5Qlx1OTFDN1x1N0VCMy9cdTRFMjJcdTVGMDNcdUZGMDknLFxuICAncmV2aWV3LnNlbGVjdENvbW1pdCc6ICdcdTRFQ0VcdTVERTZcdTRGQTdcdTkwMDlcdTYyRTlcdTYzRDBcdTRFQTRcdTY3RTVcdTc3MEIgZGlmZicsXG4gICdyZXZpZXcuc2VuZFRvQWdlbnQnOiAnXHU1M0QxXHU5MDAxXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW5kVGl0bGUnOiAnXHU1M0QxXHU5MDAxXHU4ODRDXHU1MTg1XHU4QkM0XHU4QkJBXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW5kSGludCc6ICdcdThCQzRcdThCQkFcdTRGMUFcdTRGNUNcdTRFM0FcdThCQzRcdTVCQTFcdTYzMDdcdTVGMTVcdTZDRThcdTUxNjVcdTVGNTNcdTUyNERcdTRGMUFcdThCRERcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMDlcdTMwMDJcdTUzRDFcdTkwMDFcdTU5MzFcdThEMjVcdTY1RjZcdTkwMDBcdTUzMTZcdTRFM0FcdTU5MERcdTUyMzZcdTY1ODdcdTY3MkNcdTMwMDInLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1x1NURGMlx1NTNEMVx1OTAwMVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuY29weSc6ICdcdTU5MERcdTUyMzZcdTY1ODdcdTY3MkMnLFxuICAncmV2aWV3LmNvcGllZCc6ICdcdTVERjJcdTU5MERcdTUyMzYnLFxuICAncmV2aWV3LmNvcHlGYWlsZWQnOiAnXHU1OTBEXHU1MjM2XHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnXHU4QkM0XHU1QkExJyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnXHU4QkM0XHU1QkExXHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnXHU4QkM0XHU1QkExXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCc6ICdcdTg4NjVcdTRFMDFcdTZCNjNcdTc4NkUgXHUyNzEzJyxcbiAgJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JzogJ1x1ODg2NVx1NEUwMVx1NUI1OFx1NTcyOFx1OTVFRVx1OTg5OCBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnXHU2Q0ExXHU2NzA5XHU1M0QxXHU3M0IwXHU5NUVFXHU5ODk4JyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gXHU2NzYxXHU1M0QxXHU3M0IwJyxcbiAgJ3Jldmlldy5jb25maWRlbmNlJzogJ1x1N0Y2RVx1NEZFMVx1NUVBNiB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnXHU1RUZBXHU4QkFFJyxcbiAgJ3Jldmlldy5zZW5kRmluZGluZ3MnOiAnXHU1M0QxXHU5MDAxXHU1M0QxXHU3M0IwXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5zZW50RmluZGluZ3MnOiAnXHU1REYyXHU1M0QxXHU5MDAxXHU1M0QxXHU3M0IwXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdcdThCQzRcdTVCQTFcdTgzMDNcdTU2RjQnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIFx1OEJDNFx1OEJCQSAoe259KScsXG4gICdwci5ub1ByJzogJ1x1NjVFMFx1NTE3M1x1ODA1NCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnXHU1M0QxXHU5MDAxIFBSIFx1OEJDNFx1OEJCQVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnXHU1NzI4XHU3RjE2XHU4RjkxXHU1NjY4XHU0RTJEXHU2MjUzXHU1RjAwJyxcbiAgJ2VkaXRvci5vcGVuTGluZSc6ICdcdTU3MjhcdTdGMTZcdThGOTFcdTU2NjhcdTRFMkRcdTYyNTNcdTVGMDBcdThCRTVcdTg4NEMnLFxuICAnZWRpdG9yLmZhaWxlZCc6ICdcdTYyNTNcdTVGMDBcdTU5MzFcdThEMjUnLFxuICAncmVwby5sYWJlbCc6ICdcdTRFRDNcdTVFOTMnLFxuICAncmV2aWV3LmRvY2tDb21tZW50cyc6ICdcdTg4NENcdTUxODVcdThCQzRcdThCQkEge259IFx1Njc2MScsXG4gICdyZXZpZXcuZG9ja1ZlcmRpY3QnOiAnXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBXHU1Rjg1XHU1M0QxXHU5MDAxJyxcbiAgJ3Jldmlldy5kb2NrU2VuZCc6ICdcdTcwQjlcdTUxRkJcdTUzRDFcdTkwMDFcdThCQzRcdThCQkEnLFxuICAncmV2aWV3LmRvY2tNb3JlJzogJ1x1OEZEOFx1NjcwOSB7bn0gXHU2NzYxXHU4QkM0XHU4QkJBXHVGRjBDXHU3MEI5XHU1MUZCXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU2N0U1XHU3NzBCJyxcbiAgJ3Jldmlldy5jb3BpZWRGYWxsYmFjayc6ICdcdTRGMUFcdThCRERcdTRFMERcdTUzRUZcdTc1MjhcdUZGMENcdThCQzRcdThCQkFcdTVERjJcdTU5MERcdTUyMzZcdUZGMDhcdThCRjdcdTdDOThcdThEMzRcdTUzRDFcdTkwMDFcdUZGMDknLFxuICAncmV2aWV3LnNlbmRGYWlsZWQnOiAnXHU4QkM0XHU4QkJBXHU1M0QxXHU5MDAxXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5kb2NrSnVtcCc6ICdcdTcwQjlcdTUxRkJcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTYyNTNcdTVGMDBcdTVCRjlcdTVFOTRcdTUzRDhcdTY2RjQnLFxuICAncmV2aWV3LmNhcmRUaXRsZSc6ICdcdTg4NENcdTUxODVcdThCQzRcdTVCQTEnLFxuICAncmV2aWV3LmNhcmRDb21tZW50cyc6ICd7bn0gXHU2NzYxXHU4QkM0XHU4QkJBJyxcbiAgJ3Jldmlldy5jYXJkVmVyZGljdCc6ICdBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkEnLFxuICAncmV2aWV3LmNhcmRKdW1wJzogJ1x1NzBCOVx1NTFGQlx1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NUI5QVx1NEY0RFx1NTIzMFx1NUJGOVx1NUU5NFx1NEVFM1x1NzgwMScsXG4gICdyZXZpZXcuY2FyZE9wZW5GaWxlJzogJ1x1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NjI1M1x1NUYwMFx1OEJFNVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcuY2FyZEhpbnQnOiAnXHU3MEI5XHU1MUZCXHU4QkM0XHU4QkJBXHU1M0VGXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU1QjlBXHU0RjREXHU1MjMwXHU1QkY5XHU1RTk0XHU0RUUzXHU3ODAxJyxcbiAgJ3Jldmlldy50dXJuU3VtbWFyeVRpdGxlJzogJ1x1NURGMlx1NEZFRVx1NjUzOSB7bn0gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy50dXJuU3VtbWFyeVJldmlldyc6ICdcdThCQzRcdTVCQTEnLFxuICAnZmlsZXMudGl0bGUnOiAnXHU2NTg3XHU0RUY2JyxcbiAgJ2ZpbGVzLnNlYXJjaCc6ICdcdTdCNUJcdTkwMDlcdTY1ODdcdTRFRjZcdTIwMjYnLFxuICAnZmlsZXMuc2F2ZSc6ICdcdTRGRERcdTVCNTgnLFxuICAnZmlsZXMuc2F2ZWQnOiAnXHU1REYyXHU0RkREXHU1QjU4JyxcbiAgJ2ZpbGVzLmxvYWRpbmcnOiAnXHU2QjYzXHU1NzI4XHU4QkZCXHU1M0Q2XHUyMDI2JyxcbiAgJ2ZpbGVzLmVtcHR5JzogJ1x1NkNBMVx1NjcwOVx1NTMzOVx1OTE0RFx1NjU4N1x1NEVGNicsXG4gIC8vIGZhbGxiYWNrLio6IGxhYmVscyBvZiB0aGUgYnVpbHQtaW4gaW1hZ2UgZmFsbGJhY2sgdmlld2VyIChGYWxsYmFja1VzZXJCdWJibGUpLFxuICAvLyB1c2VkIHdoZW4gYSBwbGFpbiB1c2VyIG1lc3NhZ2UgY2FycmllcyBpbWFnZXMuXG4gICdmYWxsYmFjay5pbWFnZSc6ICdcdTU2RkVcdTcyNDcnLFxuICAnZmFsbGJhY2sub3Blbic6ICdcdTY3RTVcdTc3MEJcdTUzOUZcdTU2RkUnLFxuICAnZmFsbGJhY2sub3Blbk5hbWVkJzogJ1x1NjdFNVx1NzcwQlx1NTM5Rlx1NTZGRSB7bmFtZX0nLFxuICAnZmFsbGJhY2subG9hZGluZyc6ICdcdTUyQTBcdThGN0RcdTRFMkRcdTIwMjYnLFxuICAnZmFsbGJhY2subG9hZEZhaWxlZCc6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAnZmFsbGJhY2subGlnaHRib3hEaWFsb2cnOiAnXHU1NkZFXHU3MjQ3XHU5ODg0XHU4OUM4JyxcbiAgJ2ZhbGxiYWNrLmxpZ2h0Ym94Q2xvc2UnOiAnXHU1MTczXHU5NUVEJyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdzZXR0aW5ncy5mb250JzogJ1x1NUI1N1x1NEY1MycsXG4gICdzZXR0aW5ncy5zaXplJzogJ1x1NUI1N1x1NTNGNycsXG4gICdjb25maWcudGl0bGUnOiAnXHU5MTREXHU3RjZFJyxcbiAgJ2ZvbnQubW9ubyc6ICdcdTdCNDlcdTVCQkRcdUZGMDhcdTlFRDhcdThCQTRcdUZGMDknLFxuICAnZm9udC5zeXN0ZW0nOiAnXHU3Q0ZCXHU3RURGXHU1QjU3XHU0RjUzJyxcbn0gYXMgY29uc3RcblxuLyoqIEVuZ2xpc2ggZGljdGlvbmFyeSwgY2hlY2tlZCBjb21wbGV0ZSBhZ2FpbnN0IHRoZSB6aCBrZXkgc2V0LiAqL1xuY29uc3QgZW46IFJlY29yZDxrZXlvZiB0eXBlb2YgemgsIHN0cmluZz4gPSB7XG4gICdhY3Rpb24ubGFiZWwnOiAnQ2hhbmdlcycsXG4gICdhY3Rpb24uYXJpYSc6ICdSZXZpZXcgd29ya3NwYWNlIGFuZCBwZXItcm91bmQgY2hhbmdlcycsXG4gICd0YWIuc2Vzc2lvbic6ICdTZXNzaW9uJyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnV29ya3NwYWNlJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3Jldmlldy5icmFuY2gnOiAnYnJhbmNoJyxcbiAgJ3Jldmlldy5kZXRhY2hlZCc6ICdkZXRhY2hlZCBIRUFEJyxcbiAgJ3Jldmlldy5ub3RSZXBvJzogJ1RoaXMgZGlyZWN0b3J5IGlzIG5vdCBhIGdpdCByZXBvc2l0b3J5JyxcbiAgJ3Jldmlldy5ub3RSZXBvSGludCc6ICdUaGUgXCJTZXNzaW9uXCIgdGFiIHN0aWxsIHNob3dzIGV2ZXJ5IHJvdW5kXFwncyBjaGFuZ2VzLicsXG4gICdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcyc6ICdObyBmaWxlIGNoYW5nZXMgcmVjb3JkZWQgaW4gdGhpcyBzZXNzaW9uIHlldCcsXG4gICdyZXZpZXcuc2Vzc2lvblNjYW4nOiAnU2Nhbm5lZCB7cmVzdWx0c30gdG9vbCByZXN1bHRzOiB7ZGlmZn0gd2l0aCBkaWZmcywge3BhdGh9IHBhdGgtb25seSBcdTIwMTQgdGVybWluYWwgKGJhc2gpIGVkaXRzIGFyZSBub3QgdHJhY2tlZCBpbiB0aGUgc2Vzc2lvbiBsb2cuJyxcbiAgJ3Jldmlldy5nb1dvcmtzcGFjZSc6ICdWaWV3IHdvcmtzcGFjZSBjaGFuZ2VzJyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gcm91bmRzIFx1MDBCNyB7ZmlsZXN9IGZpbGVzJyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdSb3VuZCB7cm91bmR9JyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdObyB1bmNvbW1pdHRlZCBjaGFuZ2VzIFx1RDgzQ1x1REY4OScsXG4gICdyZXZpZXcubG9hZEVycm9yJzogJ0ZhaWxlZCB0byBsb2FkJyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnQWNjZXB0JyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnQWNjZXB0IGFsbCcsXG4gICdyZXZpZXcucmV2ZXJ0QWxsJzogJ1JldmVydCBhbGwnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnVW5zdGFnZScsXG4gICdyZXZpZXcudW5zdGFnZUFsbCc6ICdVbnN0YWdlIGFsbCcsXG4gICdodW5rLnN0YWdlJzogJ1N0YWdlJyxcbiAgJ2h1bmsucmV2ZXJ0JzogJ1JldmVydCcsXG4gICdodW5rLnVuc3RhZ2UnOiAnVW5zdGFnZScsXG4gICdodW5rLnN0YWdlZCc6ICdzdGFnZWQnLFxuICAnaHVuay51bnN0YWdlZCc6ICd1bnN0YWdlZCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHJldmVydCcsXG4gICdyZXZpZXcuY29uZmlybVJldmVydEFsbCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHJldmVydCBhbGwnLFxuICAncmV2aWV3LmNvbW1pdCc6ICdDb21taXQnLFxuICAncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJzogJ0NvbW1pdCBtZXNzYWdlXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1B1c2gnLFxuICAncmV2aWV3LmNvbmZpcm1QdXNoJzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcHVzaCcsXG4gICdyZXZpZXcuY29tbWl0dGVkJzogJ0NvbW1pdHRlZCB7c3VtbWFyeX0nLFxuICAncmV2aWV3LmNvbW1pdEZhaWxlZCc6ICdDb21taXQgZmFpbGVkJyxcbiAgJ3Jldmlldy5wdXNoZWQnOiAnUHVzaGVkJyxcbiAgJ3Jldmlldy5wdXNoRmFpbGVkJzogJ1B1c2ggZmFpbGVkJyxcbiAgJ3Jldmlldy5haGVhZCc6ICd7bn0gYWhlYWQnLFxuICAncmV2aWV3LmJlaGluZCc6ICd7bn0gYmVoaW5kJyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1N0YWdlZCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnQ2hhbmdlcycsXG4gICdyZXZpZXcuc2VjdGlvbkJyYW5jaCc6ICdCcmFuY2ggdnMgcmVtb3RlJyxcbiAgJ3Jldmlldy5ub1Vwc3RyZWFtJzogJ25vIHVwc3RyZWFtJyxcbiAgJ3Jldmlldy5oaXN0b3J5JzogJ0hpc3RvcnknLFxuICAncmV2aWV3LmNvbW1pdEZpbGVzJzogJ0ZpbGVzJyxcbiAgJ2hpc3RvcnkubG9jYWwnOiAnbG9jYWwnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAncmVtb3RlJyxcbiAgJ3RpbWUubm93JzogJ2p1c3Qgbm93JyxcbiAgJ3RpbWUubWludXRlcyc6ICd7bn0gbWluIGFnbycsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBoIGFnbycsXG4gICd0aW1lLmRheXMnOiAne259IGQgYWdvJyxcbiAgJ3Jldmlldy5yZWZyZXNoJzogJ1JlZnJlc2gnLFxuICAncmV2aWV3LmNsb3NlJzogJ0Nsb3NlJyxcbiAgJ3Jldmlldy5idXN5JzogJ1dvcmtpbmdcdTIwMjYnLFxuICAncmV2aWV3LmRvbmUnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcycsXG4gICdyZXZpZXcuZG9uZU9uZSc6ICd7YWN0aW9ufSB7cGF0aH0nLFxuICAncmV2aWV3LmRvbmVEZWxldGVkJzogJ3thY3Rpb259IHtjb3VudH0gZmlsZXMgKHtkZWxldGVkfSB1bnRyYWNrZWQgZGVsZXRlZCknLFxuICAncmV2aWV3LmFjY2VwdGVkJzogJ0FjY2VwdGVkJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdSZXZlcnRlZCcsXG4gICdyZXZpZXcudW50cmFja2VkJzogJ3VudHJhY2tlZCcsXG4gICdyZXZpZXcuYmluYXJ5JzogJ2JpbmFyeScsXG4gICdyZXZpZXcubm9EaWZmRGF0YSc6ICdObyBkaWZmIGRhdGEgZm9yIHRoaXMgY2hhbmdlJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnU2luZ2xlJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnU3BsaXQnLFxuICAndmlldy5iZWZvcmUnOiAnQmVmb3JlJyxcbiAgJ3ZpZXcuYWZ0ZXInOiAnQWZ0ZXInLFxuICAnY29tbWVudC5hZGQnOiAnQ29tbWVudCBvbiB0aGlzIGxpbmUnLFxuICAnY29tbWVudC5zaG93JzogJ1ZpZXcgY29tbWVudHMnLFxuICAnY29tbWVudC5wbGFjZWhvbGRlcic6ICdDb21tZW50XHUyMDI2IChDdHJsL1x1MjMxOCtFbnRlciB0byBzYXZlKScsXG4gICdjb21tZW50LnNhdmUnOiAnU2F2ZScsXG4gICdjb21tZW50LmNhbmNlbCc6ICdDYW5jZWwnLFxuICAnY29tbWVudC5kZWxldGUnOiAnRGVsZXRlJyxcbiAgJ2NvbW1lbnQuZWRpdCc6ICdFZGl0JyxcbiAgJ2NvbW1lbnQuc2F2ZWQnOiAnQ29tbWVudCBzYXZlZCcsXG4gICdjb21tZW50LmZhaWxlZCc6ICdGYWlsZWQgdG8gc2F2ZSBjb21tZW50JyxcbiAgJ3Njb3BlLmxhYmVsJzogJ1Njb3BlJyxcbiAgJ3Njb3BlLmFsbCc6ICdBbGwnLFxuICAnc2NvcGUudW5zdGFnZWQnOiAnVW5zdGFnZWQnLFxuICAnc2NvcGUuc3RhZ2VkJzogJ1N0YWdlZCcsXG4gICdzY29wZS5jb21taXQnOiAnQ29tbWl0JyxcbiAgJ3Njb3BlLmJyYW5jaCc6ICdCcmFuY2gnLFxuICAnc2NvcGUubGFzdC10dXJuJzogJ0xhc3QgdHVybicsXG4gICdyZXZpZXcubGFzdFR1cm5FbXB0eSc6ICdObyBmaWxlIGNoYW5nZXMgcmVjb3JkZWQgZm9yIHRoZSBsYXN0IHR1cm4gXHUyMDE0IHRlcm1pbmFsIGNvbW1hbmRzIChiYXNoKSB0aGF0IGVkaXQgZmlsZXMgYXJlIG5vdCB0cmFja2VkIGluIHRoZSBzZXNzaW9uIGxvZzsgc3dpdGNoIHRvIFwiQWxsXCIgdG8gc2VlIGdpdCBjaGFuZ2VzJyxcbiAgJ3Njb3BlLmJhc2UnOiAnQmFzZSBicmFuY2gnLFxuICAnc2NvcGUuYnJhbmNoUmVhZG9ubHknOiAnQnJhbmNoIHNjb3BlIGlzIHJlYWQtb25seSAobWVyZ2UtYmFzZSBkaWZmOyBubyBhY2NlcHQvcmV2ZXJ0KScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1NlbGVjdCBhIGNvbW1pdCBmcm9tIHRoZSBsZWZ0IHRvIHZpZXcgaXRzIGRpZmYnLFxuICAncmV2aWV3LnNlbmRUb0FnZW50JzogJ1NlbmQgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdTZW5kIGlubGluZSBjb21tZW50cyB0byB0aGUgYWdlbnQnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ0NvbW1lbnRzIGFyZSBpbmplY3RlZCBpbnRvIHRoZSBjdXJyZW50IHNlc3Npb24gYXMgcmV2aWV3IGd1aWRhbmNlIChBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHMpLiBGYWxscyBiYWNrIHRvIGNvcHlhYmxlIHRleHQgaWYgc2VuZGluZyBmYWlscy4nLFxuICAncmV2aWV3LnNlbnRUb0FnZW50JzogJ1NlbnQgdG8gYWdlbnQnLFxuICAncmV2aWV3LmNvcHknOiAnQ29weSB0ZXh0JyxcbiAgJ3Jldmlldy5jb3BpZWQnOiAnQ29waWVkJyxcbiAgJ3Jldmlldy5jb3B5RmFpbGVkJzogJ0NvcHkgZmFpbGVkJyxcbiAgJ3Jldmlldy5yZXZpZXcnOiAnUmV2aWV3JyxcbiAgJ3Jldmlldy5yZXZpZXdpbmcnOiAnUmV2aWV3aW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5yZXZpZXdGYWlsZWQnOiAnUmV2aWV3IGZhaWxlZCcsXG4gICdyZXZpZXcudmVyZGljdENvcnJlY3QnOiAnUGF0Y2ggaXMgY29ycmVjdCBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnUGF0Y2ggbmVlZHMgd29yayBcdTI3MTcnLFxuICAncmV2aWV3Lm5vRmluZGluZ3MnOiAnTm8gaXNzdWVzIGZvdW5kJyxcbiAgJ3Jldmlldy5maW5kaW5ncyc6ICd7bn0gZmluZGluZ3MnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnY29uZmlkZW5jZSB7Y29uZmlkZW5jZX0nLFxuICAncmV2aWV3LnN1Z2dlc3Rpb24nOiAnU3VnZ2VzdGlvbicsXG4gICdyZXZpZXcuc2VuZEZpbmRpbmdzJzogJ1NlbmQgZmluZGluZ3MgdG8gYWdlbnQnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdGaW5kaW5ncyBzZW50IHRvIGFnZW50JyxcbiAgJ3Jldmlldy5yZXZpZXdTY29wZSc6ICdSZXZpZXcgc2NvcGUnLFxuICAncHIudGl0bGUnOiAnUFIgI3tudW1iZXJ9JyxcbiAgJ3ByLmNvbW1lbnRzJzogJ1BSIGNvbW1lbnRzICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnTm8gYXNzb2NpYXRlZCBQUicsXG4gICdwci5zZW5kQ29tbWVudHMnOiAnU2VuZCBQUiBjb21tZW50cyB0byBhZ2VudCcsXG4gICdlZGl0b3Iub3BlbkZpbGUnOiAnT3BlbiBpbiBlZGl0b3InLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ09wZW4gdGhpcyBsaW5lIGluIGVkaXRvcicsXG4gICdlZGl0b3IuZmFpbGVkJzogJ0ZhaWxlZCB0byBvcGVuJyxcbiAgJ3JlcG8ubGFiZWwnOiAnUmVwbycsXG4gICdyZXZpZXcuZG9ja0NvbW1lbnRzJzogJ3tufSBpbmxpbmUgY29tbWVudHMnLFxuICAncmV2aWV3LmRvY2tWZXJkaWN0JzogJ3ZlcmRpY3QgcGVuZGluZycsXG4gICdyZXZpZXcuZG9ja1NlbmQnOiAnQ2xpY2sgdG8gc2VuZCcsXG4gICdyZXZpZXcuY29waWVkRmFsbGJhY2snOiAnU2Vzc2lvbiB1bmF2YWlsYWJsZSBcdTIwMTQgY29tbWVudHMgY29waWVkIChwYXN0ZSB0byBzZW5kKScsXG4gICdyZXZpZXcuc2VuZEZhaWxlZCc6ICdGYWlsZWQgdG8gc2VuZCBjb21tZW50cycsXG4gICdyZXZpZXcuZG9ja0p1bXAnOiAnT3BlbiB0aGUgbWF0Y2hpbmcgY2hhbmdlIGluIHRoZSByZXZpZXcgcGFuZWwnLFxuICAncmV2aWV3LmRvY2tNb3JlJzogJ3tufSBtb3JlIGNvbW1lbnRzIFx1MjAxNCBvcGVuIHRoZSByZXZpZXcgcGFuZWwnLFxuICAncmV2aWV3LmNhcmRUaXRsZSc6ICdJbmxpbmUgcmV2aWV3JyxcbiAgJ3Jldmlldy5jYXJkQ29tbWVudHMnOiAne259IGNvbW1lbnRzJyxcbiAgJ3Jldmlldy5jYXJkVmVyZGljdCc6ICdBSSByZXZpZXcgdmVyZGljdCcsXG4gICdyZXZpZXcuY2FyZEp1bXAnOiAnSnVtcCB0byB0aGUgbWF0Y2hpbmcgY29kZSBpbiB0aGUgcmV2aWV3IHBhbmVsJyxcbiAgJ3Jldmlldy5jYXJkT3BlbkZpbGUnOiAnT3BlbiB0aGlzIGZpbGUgaW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuY2FyZEhpbnQnOiAnQ2xpY2sgYSBjb21tZW50IHRvIGp1bXAgdG8gdGhlIG1hdGNoaW5nIGNoYW5nZSBibG9jaycsXG4gICdyZXZpZXcudHVyblN1bW1hcnlUaXRsZSc6ICdFZGl0ZWQge259IGZpbGVzJyxcbiAgJ3Jldmlldy50dXJuU3VtbWFyeVJldmlldyc6ICdSZXZpZXcnLFxuICAnZmlsZXMudGl0bGUnOiAnRmlsZXMnLFxuICAnZmlsZXMuc2VhcmNoJzogJ0ZpbHRlciBmaWxlc1x1MjAyNicsXG4gICdmaWxlcy5zYXZlJzogJ1NhdmUnLFxuICAnZmlsZXMuc2F2ZWQnOiAnU2F2ZWQnLFxuICAnZmlsZXMubG9hZGluZyc6ICdMb2FkaW5nXHUyMDI2JyxcbiAgJ2ZpbGVzLmVtcHR5JzogJ05vIG1hdGNoaW5nIGZpbGVzJyxcbiAgLy8gZmFsbGJhY2suKjogbGFiZWxzIG9mIHRoZSBidWlsdC1pbiBpbWFnZSBmYWxsYmFjayB2aWV3ZXIgKEZhbGxiYWNrVXNlckJ1YmJsZSksXG4gIC8vIHVzZWQgd2hlbiBhIHBsYWluIHVzZXIgbWVzc2FnZSBjYXJyaWVzIGltYWdlcy5cbiAgJ2ZhbGxiYWNrLmltYWdlJzogJ0ltYWdlJyxcbiAgJ2ZhbGxiYWNrLm9wZW4nOiAnVmlldyBvcmlnaW5hbCcsXG4gICdmYWxsYmFjay5vcGVuTmFtZWQnOiAnVmlldyBvcmlnaW5hbCB7bmFtZX0nLFxuICAnZmFsbGJhY2subG9hZGluZyc6ICdMb2FkaW5nXHUyMDI2JyxcbiAgJ2ZhbGxiYWNrLmxvYWRGYWlsZWQnOiAnRmFpbGVkIHRvIGxvYWQnLFxuICAnZmFsbGJhY2subGlnaHRib3hEaWFsb2cnOiAnSW1hZ2UgcHJldmlldycsXG4gICdmYWxsYmFjay5saWdodGJveENsb3NlJzogJ0Nsb3NlJyxcbiAgJ3NldHRpbmdzLnRpdGxlJzogJ0NoYW5nZXMnLFxuICAnc2V0dGluZ3MuZm9udCc6ICdGb250JyxcbiAgJ3NldHRpbmdzLnNpemUnOiAnRm9udCBzaXplJyxcbiAgJ2NvbmZpZy50aXRsZSc6ICdDb25maWd1cmF0aW9uJyxcbiAgJ2ZvbnQubW9ubyc6ICdNb25vc3BhY2UgKGRlZmF1bHQpJyxcbiAgJ2ZvbnQuc3lzdGVtJzogJ1N5c3RlbSBmb250Jyxcbn1cblxudHlwZSBEaWZmUmV2aWV3QWN0aW9uUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5zZXNzaW9uLmhlYWRlci5hY3Rpb25zJz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPlxudHlwZSBEaWZmUmV2aWV3T3ZlcmxheVByb3BzID0gUHJvcHNSdW50aW1lPCdzaGVsbC5vdmVybGF5Jz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPiAmIHsgc2Vzc2lvbnM6IElTZXNzaW9ucyB9XG50eXBlIFR1cm5TdW1tYXJ5UHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5jaGF0LnR1cm5UYWlsJz4gJlxuICBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPiAmIHtcbiAgICBtYXRjaGVkOiB7IHR1cm46IHsgdHVybjogbnVtYmVyOyBzdGFydD86IHsgc2VxOiBudW1iZXIgfTsgZW5kPzogeyBzZXE6IG51bWJlciB9IH0gfVxuICB9XG5cbi8qKiBEaWZmIGljb24gKGx1Y2lkZSBmaWxlLWRpZmYpLiAqL1xuZnVuY3Rpb24gSWNvbkRpZmYoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE1IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY3WlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkgMTBoNlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTEyIDd2NlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTkgMTdoNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvblgoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE4IDYgNiAxOFwiIC8+XG4gICAgICA8cGF0aCBkPVwibTYgNiAxMiAxMlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNvbW1lbnQoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTIxIDE1YTIgMiAwIDAgMS0yIDJIN2wtNCA0VjVhMiAyIDAgMCAxIDItMmgxNGEyIDIgMCAwIDEgMiAyelwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNoZXZyb25Eb3duKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIm02IDkgNiA2IDYtNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNoZWNrKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyLjVcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTIwIDYgOSAxN2wtNS01XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG50eXBlIFZpZXdNb2RlID0gJ3NpbmdsZScgfCAnc3BsaXQnXG5cbi8qKiBcdTUzNTVcdTY4MEYgLyBcdTUzQ0NcdTY4MEYgc2VnbWVudGVkIHRvZ2dsZSAocGVyc2lzdGVkIGFjcm9zcyBvcGVucykuICovXG5mdW5jdGlvbiBEaWZmVmlld1RvZ2dsZSh7IHZpZXcsIG9uQ2hhbmdlLCB0IH06IHsgdmlldzogVmlld01vZGU7IG9uQ2hhbmdlOiAodjogVmlld01vZGUpID0+IHZvaWQ7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXZpZXctdG9nZ2xlXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD17dCgndmlldy5zaW5nbGUnKX0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXZpZXctYnRuJHt2aWV3ID09PSAnc2luZ2xlJyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc2luZ2xlJ31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NpbmdsZScpfVxuICAgICAgPlxuICAgICAgICB7dCgndmlldy5zaW5nbGUnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NwbGl0JyA/ICcgZHNkci12aWV3LWJ0bi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgYXJpYS1wcmVzc2VkPXt2aWV3ID09PSAnc3BsaXQnfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgnc3BsaXQnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc3BsaXQnKX1cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBUd28tY29sdW1uIHNpZGUtYnktc2lkZSBkaWZmIGJvZHkgKG9sZCBsZWZ0LCBuZXcgcmlnaHQsIGxpbmUgbnVtYmVycyBhbGlnbmVkKS4gKi9cbmZ1bmN0aW9uIFNwbGl0RGlmZih7IGJsb2NrcywgYmVmb3JlTGFiZWwsIGFmdGVyTGFiZWwgfTogeyBibG9ja3M6IFNwbGl0QmxvY2tbXTsgYmVmb3JlTGFiZWw6IHN0cmluZzsgYWZ0ZXJMYWJlbDogc3RyaW5nIH0pIHtcbiAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2JlZm9yZUxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e2FmdGVyTGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgIDxkaXYga2V5PXtiaX0+XG4gICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LmxlZnROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj57cm93LnJpZ2h0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cucmlnaHR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBQZXItaHVuayBhY3Rpb24gYmFyIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpIGZvciB3b3Jrc3BhY2UgZGlmZnMuICovXG5mdW5jdGlvbiBIdW5rVG9vbGJhcih7XG4gIGh1bmssXG4gIGJ1c3ksXG4gIG9uQWN0aW9uLFxuICB0LFxufToge1xuICBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rIHwgdW5kZWZpbmVkXG4gIGJ1c3k6IGJvb2xlYW5cbiAgb25BY3Rpb246IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmspID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIGlmICghaHVuaykgcmV0dXJuIG51bGxcbiAgY29uc3Qgc3RhZ2VkID0gaHVuay5sYXllciA9PT0gJ3N0YWdlZCdcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItaHVuay1iYXJcIj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItaHVuay1sYXllclwiPntzdGFnZWQgPyB0KCdodW5rLnN0YWdlZCcpIDogdCgnaHVuay51bnN0YWdlZCcpfTwvc3Bhbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItaHVuay1hY3Rpb24gZHNkci1odW5rLWFjdGlvbi1zdGFnZVwiIHRpdGxlPXtzdGFnZWQgPyB0KCdodW5rLnVuc3RhZ2UnKSA6IHQoJ2h1bmsuc3RhZ2UnKX0gYXJpYS1sYWJlbD17c3RhZ2VkID8gdCgnaHVuay51bnN0YWdlJykgOiB0KCdodW5rLnN0YWdlJyl9IGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbihzdGFnZWQgPyAndW5zdGFnZScgOiAnYWNjZXB0JywgaHVuayl9PlxuICAgICAgICB7c3RhZ2VkID8gJ1x1MjIxMicgOiAnKyd9XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItaHVuay1hY3Rpb24gZHNkci1odW5rLWFjdGlvbi1yZXZlcnRcIiB0aXRsZT17dCgnaHVuay5yZXZlcnQnKX0gYXJpYS1sYWJlbD17dCgnaHVuay5yZXZlcnQnKX0gZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uQWN0aW9uKCdyZXZlcnQnLCBodW5rKX0+XHUyMUI2PC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIEh1bmtzIG9mIGBkaWZmYCB3aG9zZSBvbGQgb3IgbmV3IGxpbmUgcmFuZ2UgY292ZXJzIGFueSBvZiBgbGluZXNgLiAqL1xuZnVuY3Rpb24gaHVua3NGb3JMaW5lcyhkaWZmOiBzdHJpbmcsIGxpbmVzOiAobnVtYmVyIHwgbnVsbClbXSk6IHN0cmluZyB7XG4gIGNvbnN0IHRhcmdldHMgPSBuZXcgU2V0KGxpbmVzLmZpbHRlcigobCk6IGwgaXMgbnVtYmVyID0+IGwgIT09IG51bGwpKVxuICBpZiAodGFyZ2V0cy5zaXplID09PSAwKSByZXR1cm4gJydcbiAgY29uc3QgYmxvY2tzID0gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gW11cbiAgZm9yIChjb25zdCBibG9jayBvZiBibG9ja3MpIHtcbiAgICBpZiAoYmxvY2suaGVhZD8ua2luZCAhPT0gJ2h1bmsnKSBjb250aW51ZVxuICAgIGNvbnN0IHN0YXJ0cyA9IGh1bmtTdGFydHMoYmxvY2suaGVhZC50ZXh0KVxuICAgIGxldCBvbGRMaW5lID0gc3RhcnRzLm9sZFN0YXJ0XG4gICAgbGV0IG5ld0xpbmUgPSBzdGFydHMubmV3U3RhcnRcbiAgICBsZXQgb01pbiA9IEluZmluaXR5XG4gICAgbGV0IG9NYXggPSAtSW5maW5pdHlcbiAgICBsZXQgbk1pbiA9IEluZmluaXR5XG4gICAgbGV0IG5NYXggPSAtSW5maW5pdHlcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiBibG9jay5yb3dzKSB7XG4gICAgICBpZiAocm93LmtpbmQgPT09ICdjdHgnKSB7XG4gICAgICAgIGlmIChvbGRMaW5lIDwgb01pbikgb01pbiA9IG9sZExpbmVcbiAgICAgICAgaWYgKG9sZExpbmUgPiBvTWF4KSBvTWF4ID0gb2xkTGluZVxuICAgICAgICBpZiAobmV3TGluZSA8IG5NaW4pIG5NaW4gPSBuZXdMaW5lXG4gICAgICAgIGlmIChuZXdMaW5lID4gbk1heCkgbk1heCA9IG5ld0xpbmVcbiAgICAgICAgb2xkTGluZSsrXG4gICAgICAgIG5ld0xpbmUrK1xuICAgICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgICAgaWYgKG5ld0xpbmUgPCBuTWluKSBuTWluID0gbmV3TGluZVxuICAgICAgICBpZiAobmV3TGluZSA+IG5NYXgpIG5NYXggPSBuZXdMaW5lXG4gICAgICAgIG5ld0xpbmUrK1xuICAgICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHtcbiAgICAgICAgaWYgKG9sZExpbmUgPCBvTWluKSBvTWluID0gb2xkTGluZVxuICAgICAgICBpZiAob2xkTGluZSA+IG9NYXgpIG9NYXggPSBvbGRMaW5lXG4gICAgICAgIG9sZExpbmUrK1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBoaXQgPSBbLi4udGFyZ2V0c10uc29tZShcbiAgICAgIChsKSA9PiAob01pbiA8PSBsICYmIGwgPD0gb01heCkgfHwgKG5NaW4gPD0gbCAmJiBsIDw9IG5NYXgpLFxuICAgIClcbiAgICBpZiAoaGl0KSBwYXJ0cy5wdXNoKFtibG9jay5oZWFkLnRleHQsIC4uLmJsb2NrLnJvd3MubWFwKChyKSA9PiByLnRleHQpXS5qb2luKCdcXG4nKSlcbiAgfVxuICByZXR1cm4gcGFydHMuam9pbignXFxuJylcbn1cblxuLyoqIFVuaWZpZWQgZGlmZiByb3dzIHdpdGggb2xkL25ldyBsaW5lIG51bWJlcnMgdHJhY2tlZCB0aHJvdWdoIGh1bmtzLiAqL1xuZnVuY3Rpb24gdW5pZmllZFJvd3NXaXRoTGluZXMocm93czogRGlmZlJvd1tdLCBvbGRTdGFydDogbnVtYmVyLCBuZXdTdGFydDogbnVtYmVyKTogeyByb3c6IERpZmZSb3c7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfVtdIHtcbiAgbGV0IG9sZExpbmUgPSBvbGRTdGFydFxuICBsZXQgbmV3TGluZSA9IG5ld1N0YXJ0XG4gIHJldHVybiByb3dzLm1hcCgocm93KSA9PiB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnY3R4JykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBvbGRMaW5lKyssIG5ld0xpbmU6IG5ld0xpbmUrKyB9XG4gICAgaWYgKHJvdy5raW5kID09PSAnYWRkJykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBuZXdMaW5lKysgfVxuICAgIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBudWxsIH1cbiAgICByZXR1cm4geyByb3csIG9sZExpbmU6IG51bGwsIG5ld0xpbmU6IG51bGwgfVxuICB9KVxufVxuXG4vKiogTWF0Y2ggYSBjb21tZW50IGFnYWluc3QgYSByb3cncyBhbmNob3JzIChib3RoIG11c3QgYWdyZWUgd2hlbiBzZXQpLiAqL1xuZnVuY3Rpb24gY29tbWVudE1hdGNoZXMoY29tbWVudDogUmV2aWV3Q29tbWVudCwgb2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCk6IGJvb2xlYW4ge1xuICBpZiAoY29tbWVudC5saW5lTmV3ICE9PSBudWxsICYmIGNvbW1lbnQubGluZU5ldyAhPT0gbmV3TGluZSkgcmV0dXJuIGZhbHNlXG4gIGlmIChjb21tZW50LmxpbmVPbGQgIT09IG51bGwgJiYgY29tbWVudC5saW5lT2xkICE9PSBvbGRMaW5lKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqIEhvdmVyLXRvLWNvbW1lbnQgYWZmb3JkYW5jZSBpbiB0aGUgbGluZS1udW1iZXIgZ3V0dGVyLiBMaW5lcyB0aGF0IGFscmVhZHlcbiAqIGhhdmUgY29tbWVudHMgc2hvdyBhIG5vbi1pbnRlcmFjdGl2ZSBjb3VudCBiYWRnZSAodGhlIHNhdmVkIGJveGVzIGJlbG93IHRoZVxuICogbGluZSBhcmUgdGhlIHZpZXcpOyB0aGUgKyBvbmx5IGFwcGVhcnMgb24gY29tbWVudC1mcmVlIGxpbmVzIHRvIGFkZCBvbmUuICovXG5mdW5jdGlvbiBDb21tZW50TGluZSh7IGNvdW50LCBvbk9wZW4sIHQgfTogeyBjb3VudDogbnVtYmVyOyBvbk9wZW46ICgpID0+IHZvaWQ7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGlmIChjb3VudCA+IDApIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFkZCBkc2RyLWNvbW1lbnQtaGFzXCIgdGl0bGU9e3QoJ2NvbW1lbnQuc2hvdycpfSBhcmlhLWxhYmVsPXt0KCdjb21tZW50LnNob3cnKX0+XG4gICAgICAgIHtjb3VudH1cbiAgICAgIDwvc3Bhbj5cbiAgICApXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWRkXCIgdGl0bGU9e3QoJ2NvbW1lbnQuYWRkJyl9IGFyaWEtbGFiZWw9e3QoJ2NvbW1lbnQuYWRkJyl9IG9uQ2xpY2s9e29uT3Blbn0+XG4gICAgICArXG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLyoqIFRoZSBpbmxpbmUgY29tbWVudCBlZGl0b3IsIHJlbmRlcmVkIGFzIGl0cyBvd24gcm93LiAqL1xuZnVuY3Rpb24gQ29tbWVudEVkaXRvcih7XG4gIHRleHQsXG4gIG9uVGV4dCxcbiAgb25TYXZlLFxuICBvbkNhbmNlbCxcbiAgYnVzeSxcbiAgdCxcbn06IHtcbiAgdGV4dDogc3RyaW5nXG4gIG9uVGV4dDogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvblNhdmU6ICgpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgYnVzeTogYm9vbGVhblxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1lZGl0b3JcIj5cbiAgICAgIDx0ZXh0YXJlYVxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaW5wdXRcIlxuICAgICAgICB2YWx1ZT17dGV4dH1cbiAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgIHJvd3M9ezJ9XG4gICAgICAgIHBsYWNlaG9sZGVyPXt0KCdjb21tZW50LnBsYWNlaG9sZGVyJyl9XG4gICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uVGV4dChldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICBvbktleURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBvbkNhbmNlbCgpXG4gICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJyAmJiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5KSkgb25TYXZlKClcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCAhdGV4dC50cmltKCl9IG9uQ2xpY2s9e29uU2F2ZX0+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuc2F2ZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17b25DYW5jZWx9PlxuICAgICAgICAgIHt0KCdjb21tZW50LmNhbmNlbCcpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBBIHNhdmVkIGlubGluZSBjb21tZW50LCByZW5kZXJlZCBleGFjdGx5IGxpa2UgdGhlIGNvbW1lbnQgZWRpdG9yIFx1MjAxNCB0aGUgYm94XG4gKiBpcyByZWFkLW9ubHkgdW50aWwgRWRpdCBpcyBwcmVzc2VkLCB0aGVuIGl0IGJlY29tZXMgdGhlIGVkaXRhYmxlIGVkaXRvci4gKi9cbmZ1bmN0aW9uIENvbW1lbnRCb3goeyBjb21tZW50LCBidXN5LCBvblVwZGF0ZSwgb25EZWxldGUsIHQgfTogeyBjb21tZW50OiBSZXZpZXdDb21tZW50OyBidXN5OiBib29sZWFuOyBvblVwZGF0ZTogKGlkOiBzdHJpbmcsIHRleHQ6IHN0cmluZykgPT4gUHJvbWlzZTxib29sZWFuPjsgb25EZWxldGU6IChpZDogc3RyaW5nKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBjb25zdCBbZWRpdGluZywgc2V0RWRpdGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3RleHQsIHNldFRleHRdID0gdXNlU3RhdGUoY29tbWVudC50ZXh0KVxuICBpZiAoZWRpdGluZykge1xuICAgIHJldHVybiAoXG4gICAgICA8Q29tbWVudEVkaXRvclxuICAgICAgICB0ZXh0PXt0ZXh0fVxuICAgICAgICBvblRleHQ9e3NldFRleHR9XG4gICAgICAgIG9uU2F2ZT17KCkgPT5cbiAgICAgICAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXdhaXQgb25VcGRhdGUoY29tbWVudC5pZCwgdGV4dC50cmltKCkpKSBzZXRFZGl0aW5nKGZhbHNlKVxuICAgICAgICAgIH0pKClcbiAgICAgICAgfVxuICAgICAgICBvbkNhbmNlbD17KCkgPT4ge1xuICAgICAgICAgIHNldFRleHQoY29tbWVudC50ZXh0KVxuICAgICAgICAgIHNldEVkaXRpbmcoZmFsc2UpXG4gICAgICAgIH19XG4gICAgICAgIGJ1c3k9e2J1c3l9XG4gICAgICAgIHQ9e3R9XG4gICAgICAvPlxuICAgIClcbiAgfVxuICAvKiogSnVtcCB0byB0aGUgY29tbWVudCdzIGNoYW5nZSBibG9jayBpbiB0aGUgcmV2aWV3IHBhbmVsIChsaWtlIHRoZSBkb2NrIGNoaXBzKS4gKi9cbiAgY29uc3QganVtcCA9ICgpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmZvY3VzID0ge1xuICAgICAgICBwYXRoOiBjb21tZW50LnBhdGgsXG4gICAgICAgIGxpbmU6IGNvbW1lbnQubGluZU5ldyA/PyBjb21tZW50LmxpbmVPbGQgPz8gdW5kZWZpbmVkLFxuICAgICAgICB0YWI6IGNvbW1lbnQuc291cmNlID09PSAnc2Vzc2lvbicgPyAnc2Vzc2lvbicgOiAnd29ya3NwYWNlJyxcbiAgICAgIH1cbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWVkaXRvclwiPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1zYXZlZC1jb21tZW50LWp1bXBcIlxuICAgICAgICB0aXRsZT17dCgncmV2aWV3LmRvY2tKdW1wJyl9XG4gICAgICAgIG9uQ2xpY2s9e2p1bXB9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2F2ZWQtY29tbWVudC1sb2NcIj5cbiAgICAgICAgICB7Y29tbWVudC5wYXRofVxuICAgICAgICAgIHtjb21tZW50LmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Y29tbWVudC5saW5lTmV3fWAgOiBjb21tZW50LmxpbmVPbGQgIT09IG51bGwgPyBgIChvbGQ6JHtjb21tZW50LmxpbmVPbGR9KWAgOiAnJ31cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtaW5wdXQgZHNkci1zYXZlZC1jb21tZW50LXZpZXdcIj57Y29tbWVudC50ZXh0fTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG5cIlxuICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBzZXRUZXh0KGNvbW1lbnQudGV4dClcbiAgICAgICAgICAgIHNldEVkaXRpbmcodHJ1ZSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuZWRpdCcpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLWRhbmdlclwiXG4gICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIG9uRGVsZXRlKGNvbW1lbnQuaWQpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHt0KCdjb21tZW50LmRlbGV0ZScpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBPbmUgQUktcmV2aWV3IGZpbmRpbmcgcmVuZGVyZWQgYXMgYW4gaW5saW5lIGNhcmQgKENvZGV4LXN0eWxlKS4gKi9cbmZ1bmN0aW9uIEZpbmRpbmdDYXJkKHsgZmluZGluZywgdCB9OiB7IGZpbmRpbmc6IFJldmlld0ZpbmRpbmc7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctY2FyZCBkc2RyLWZpbmRpbmctJHtmaW5kaW5nLnByaW9yaXR5fWB9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1oZWFkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItZmluZGluZy10YWcgZHNkci1maW5kaW5nLSR7ZmluZGluZy5wcmlvcml0eX1gfT57ZmluZGluZy5wcmlvcml0eX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLXRpdGxlXCI+e2ZpbmRpbmcudGl0bGV9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1sb2NcIj5cbiAgICAgICAgICB7ZmluZGluZy5maWxlfTp7ZmluZGluZy5saW5lU3RhcnR9e2ZpbmRpbmcubGluZUVuZCAhPT0gZmluZGluZy5saW5lU3RhcnQgPyBgLSR7ZmluZGluZy5saW5lRW5kfWAgOiAnJ31cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICB7ZmluZGluZy5kZXRhaWwgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLWRldGFpbFwiPntmaW5kaW5nLmRldGFpbH08L2Rpdj4gOiBudWxsfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1tZXRhXCI+XG4gICAgICAgIHt0KCdyZXZpZXcuY29uZmlkZW5jZScsIHsgY29uZmlkZW5jZTogZmluZGluZy5jb25maWRlbmNlLnRvRml4ZWQoMikgfSl9XG4gICAgICA8L2Rpdj5cbiAgICAgIHtmaW5kaW5nLnN1Z2dlc3Rpb24gPyA8cHJlIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLXN1Z2dlc3Rpb25cIj57ZmluZGluZy5zdWdnZXN0aW9ufTwvcHJlPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFVuaWZpZWQgZGlmZiB3aXRoIHBlci1odW5rIGFjdGlvbiBiYXJzIGFuZCBpbmxpbmUgY29tbWVudHMgKHdvcmtzcGFjZSBmaWxlcykuICovXG5mdW5jdGlvbiBVbmlmaWVkRGlmZih7XG4gIGRpZmYsXG4gIGh1bmtzLFxuICBidXN5LFxuICBvbkh1bmtBY3Rpb24sXG4gIHQsXG4gIGNvbW1lbnRzLFxuICBjb21tZW50RWRpdG9yLFxuICBjb21tZW50VGV4dCxcbiAgb25Db21tZW50VGV4dCxcbiAgb25PcGVuQ29tbWVudCxcbiAgb25TYXZlQ29tbWVudCxcbiAgb25DYW5jZWxDb21tZW50LFxuICBvbkRlbGV0ZUNvbW1lbnQsXG4gIG9uVXBkYXRlQ29tbWVudCxcbiAgcmVhZE9ubHksXG4gIHBhdGgsXG4gIHJldmlld0ZpbmRpbmdzLFxuICBvbk9wZW5MaW5lLFxuICBqdW1wTGluZSxcbn06IHtcbiAgZGlmZjogc3RyaW5nXG4gIGh1bmtzOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rW11cbiAgYnVzeTogYm9vbGVhblxuICBvbkh1bmtBY3Rpb246IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmspID0+IHZvaWRcbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG4gIGNvbW1lbnRzPzogUmV2aWV3Q29tbWVudFtdXG4gIGNvbW1lbnRFZGl0b3I/OiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSB8IG51bGxcbiAgY29tbWVudFRleHQ/OiBzdHJpbmdcbiAgb25Db21tZW50VGV4dD86ICh2OiBzdHJpbmcpID0+IHZvaWRcbiAgb25PcGVuQ29tbWVudD86IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB2b2lkXG4gIG9uU2F2ZUNvbW1lbnQ/OiAoKSA9PiB2b2lkXG4gIG9uQ2FuY2VsQ29tbWVudD86ICgpID0+IHZvaWRcbiAgb25EZWxldGVDb21tZW50PzogKGlkOiBzdHJpbmcpID0+IHZvaWRcbiAgb25VcGRhdGVDb21tZW50PzogKGlkOiBzdHJpbmcsIHRleHQ6IHN0cmluZykgPT4gUHJvbWlzZTxib29sZWFuPlxuICAvKiogSGlkZSBwZXItaHVuayBhY3Rpb24gYmFycyAoYnJhbmNoIHNjb3BlIGlzIGEgcmVhZC1vbmx5IGRpZmYpLiAqL1xuICByZWFkT25seT86IGJvb2xlYW5cbiAgLyoqIFJlcG8tcmVsYXRpdmUgZmlsZSBwYXRoIChmb3Igb3Blbi1pbi1lZGl0b3IgYW5kIG1hcmtlcnMpLiAqL1xuICBwYXRoPzogc3RyaW5nXG4gIC8qKiBBSS1yZXZpZXcgZmluZGluZ3MgdG8gbWFyayBvbiBtYXRjaGluZyBsaW5lcy4gKi9cbiAgcmV2aWV3RmluZGluZ3M/OiBSZXZpZXdGaW5kaW5nW11cbiAgLyoqIE9wZW4gdGhlIGZpbGUgYXQgYSBsaW5lIGluIHRoZSB1c2VyJ3MgZWRpdG9yLiAqL1xuICBvbk9wZW5MaW5lPzogKHBhdGg6IHN0cmluZywgbGluZTogbnVtYmVyKSA9PiB2b2lkXG4gIC8qKiBUZW1wb3JhcnkgbGluZSBoaWdobGlnaHQgKGUuZy4ganVtcCBmcm9tIGEgUFIgY29tbWVudCkuICovXG4gIGp1bXBMaW5lPzogbnVtYmVyIHwgbnVsbFxufSkge1xuICBjb25zdCBibG9ja3MgPSBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICBsZXQgaHVua0luZGV4ID0gMFxuICBjb25zdCBlZGl0aW5nS2V5ID0gY29tbWVudEVkaXRvciA/IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gIDogbnVsbFxuICBjb25zdCBmaW5kaW5nc0ZvciA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKTogUmV2aWV3RmluZGluZ1tdID0+IHtcbiAgICBpZiAoIXBhdGggfHwgIXJldmlld0ZpbmRpbmdzIHx8IHJldmlld0ZpbmRpbmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdXG4gICAgcmV0dXJuIHJldmlld0ZpbmRpbmdzLmZpbHRlcigoZikgPT4ge1xuICAgICAgaWYgKGYuZmlsZSAhPT0gcGF0aCkgcmV0dXJuIGZhbHNlXG4gICAgICBpZiAobmV3TGluZSAhPT0gbnVsbCkgcmV0dXJuIG5ld0xpbmUgPj0gZi5saW5lU3RhcnQgJiYgbmV3TGluZSA8PSBmLmxpbmVFbmRcbiAgICAgIHJldHVybiBvbGRMaW5lICE9PSBudWxsICYmIG9sZExpbmUgPj0gZi5saW5lU3RhcnQgJiYgb2xkTGluZSA8PSBmLmxpbmVFbmRcbiAgICB9KVxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICA8cHJlIGNsYXNzTmFtZT1cImRzZHItcHJlXCI+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IHtcbiAgICAgICAgICBjb25zdCBpc0h1bmsgPSBibG9jay5oZWFkPy5raW5kID09PSAnaHVuaydcbiAgICAgICAgICBjb25zdCBodW5rID0gaXNIdW5rID8gaHVua3NbaHVua0luZGV4KytdIDogdW5kZWZpbmVkXG4gICAgICAgICAgY29uc3Qgc3RhcnRzID0gYmxvY2suaGVhZD8ua2luZCA9PT0gJ2h1bmsnID8gaHVua1N0YXJ0cyhibG9jay5oZWFkLnRleHQpIDogeyBvbGRTdGFydDogMSwgbmV3U3RhcnQ6IDEgfVxuICAgICAgICAgIGNvbnN0IHJvd3MgPSBpc0h1bmsgPyB1bmlmaWVkUm93c1dpdGhMaW5lcyhibG9jay5yb3dzLCBzdGFydHMub2xkU3RhcnQsIHN0YXJ0cy5uZXdTdGFydCkgOiBbXVxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgIHtpc0h1bmsgJiYgIXJlYWRPbmx5ID8gPEh1bmtUb29sYmFyIGh1bms9e2h1bmt9IGJ1c3k9e2J1c3l9IG9uQWN0aW9uPXtvbkh1bmtBY3Rpb259IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtibG9jay5oZWFkLmtpbmR9YH0+e2Jsb2NrLmhlYWQudGV4dCB8fCAnICd9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAge2lzSHVua1xuICAgICAgICAgICAgICAgID8gcm93cy5tYXAoKHsgcm93LCBvbGRMaW5lLCBuZXdMaW5lIH0sIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGAke29sZExpbmUgPz8gJ28nfToke25ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93Q29tbWVudHMgPSBjb21tZW50cz8uZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBvbGRMaW5lLCBuZXdMaW5lKSkgPz8gW11cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ3MgPSBmaW5kaW5nc0ZvcihvbGRMaW5lLCBuZXdMaW5lKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlZGl0aW5nID0gZWRpdGluZ0tleSA9PT0ga2V5XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3dBY3Rpb25zID0gcm93LmtpbmQgPT09ICdjdHgnIHx8IHJvdy5raW5kID09PSAnYWRkJyB8fCByb3cua2luZCA9PT0gJ2RlbCdcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ0NscyA9IGZpbmRpbmdzLmxlbmd0aCA+IDAgPyBgIGRzZHItbGluZS1maW5kaW5nIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wZWQgPSBqdW1wTGluZSAhPSBudWxsICYmIChuZXdMaW5lID09PSBqdW1wTGluZSB8fCAobmV3TGluZSA9PT0gbnVsbCAmJiBvbGRMaW5lID09PSBqdW1wTGluZSkpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17cml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9JHtyb3dDb21tZW50cy5sZW5ndGggPiAwID8gJyBkc2RyLWxpbmUtY29tbWVudGVkJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1saW5lLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e25ld0xpbmUgPz8gb2xkTGluZSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bmV3TGluZSA/PyBvbGRMaW5lID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50TGluZSBjb3VudD17cm93Q29tbWVudHMubGVuZ3RofSBvbk9wZW49eygpID0+IG9uT3BlbkNvbW1lbnQ/LihvbGRMaW5lLCBuZXdMaW5lKX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtdGV4dFwiPntyb3cudGV4dCB8fCAnICd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9IHRpdGxlPXtmaW5kaW5nc1swXS50aXRsZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzWzBdLnByaW9yaXR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5ncy5sZW5ndGggPiAxID8gYFx1MDBENyR7ZmluZGluZ3MubGVuZ3RofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cGF0aCAmJiBvbk9wZW5MaW5lICYmIChuZXdMaW5lID8/IG9sZExpbmUpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1vcGVubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uT3BlbkxpbmUocGF0aCwgbmV3TGluZSA/PyBvbGRMaW5lID8/IDEpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgJiYgcm93Q29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm93Q29tbWVudHMubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17b25VcGRhdGVDb21tZW50ID8/IChhc3luYyAoKSA9PiBmYWxzZSl9IG9uRGVsZXRlPXtvbkRlbGV0ZUNvbW1lbnQgPz8gKCgpID0+IHt9KX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAge2VkaXRpbmcgPyA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dCA/PyAnJ30gb25UZXh0PXtvbkNvbW1lbnRUZXh0ID8/ICgoKSA9PiB7fSl9IG9uU2F2ZT17b25TYXZlQ29tbWVudCA/PyAoKCkgPT4ge30pfSBvbkNhbmNlbD17b25DYW5jZWxDb21tZW50ID8/ICgoKSA9PiB7fSl9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsocmV2aWV3RmluZGluZ3MgPz8gW10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGYpID0+IGYuZmlsZSA9PT0gcGF0aCAmJiBmLmxpbmVTdGFydCA9PT0gKG5ld0xpbmUgPz8gb2xkTGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGYsIGZpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpbmRpbmdDYXJkIGtleT17YCR7Zi5maWxlfToke2YubGluZVN0YXJ0fToke2ZpfWB9IGZpbmRpbmc9e2Z9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgOiBibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cml9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgIClcbiAgICAgICAgfSl9XG4gICAgICA8L3ByZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbi8qKiBEcmFnIGhhbmRsZSBmb3IgcmVzaXppbmcgdGhlIHBhbmVsIChlYXN0IC8gc291dGggLyBzb3V0aC1lYXN0KS4gKi9cbmZ1bmN0aW9uIFJlc2l6ZUhhbmRsZSh7IG1vZGUsIG9uUmVzaXplIH06IHsgbW9kZTogJ2UnIHwgJ3MnIHwgJ3NlJzsgb25SZXNpemU6IChkeDogbnVtYmVyLCBkeTogbnVtYmVyKSA9PiB2b2lkIH0pIHtcbiAgY29uc3QgbGFzdCA9IHVzZVJlZjx7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsPihudWxsKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YGRzZHItcmVzaXplIGRzZHItcmVzaXplLSR7bW9kZX1gfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKCFsYXN0LmN1cnJlbnQpIHJldHVyblxuICAgICAgICBjb25zdCBkeCA9IGV2ZW50LmNsaWVudFggLSBsYXN0LmN1cnJlbnQueFxuICAgICAgICBjb25zdCBkeSA9IGV2ZW50LmNsaWVudFkgLSBsYXN0LmN1cnJlbnQueVxuICAgICAgICBsYXN0LmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfVxuICAgICAgICBpZiAoZHggIT09IDAgfHwgZHkgIT09IDApIG9uUmVzaXplKGR4LCBkeSlcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJVcD17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlckNhbmNlbD17KCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSBudWxsXG4gICAgICB9fVxuICAgIC8+XG4gIClcbn1cblxuLyoqIFN0YXR1cyBjaGlwIGNvbG9yIGNsYXNzIGZvciBhIHdvcmtzcGFjZSBjaGFuZ2UuICovXG5mdW5jdGlvbiBjaGlwQ2xhc3Moc3RhdHVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBzID0gc3RhdHVzLnJlcGxhY2UoL1xccy9nLCAnJylcbiAgaWYgKHMuaW5jbHVkZXMoJz8/JykpIHJldHVybiAnZHNkci1jaGlwLXUnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ0EnKSB8fCBzLmluY2x1ZGVzKCdBJykpIHJldHVybiAnZHNkci1jaGlwLWEnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ0QnKSB8fCBzLmluY2x1ZGVzKCdEJykpIHJldHVybiAnZHNkci1jaGlwLWQnXG4gIGlmIChzLnN0YXJ0c1dpdGgoJ1InKSB8fCBzLmluY2x1ZGVzKCdSJykpIHJldHVybiAnZHNkci1jaGlwLXInXG4gIHJldHVybiAnZHNkci1jaGlwLW0nXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRTdGF0dXMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFN0YXR1c1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1NUQVRVU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYHN0YXR1cyByZXF1ZXN0IGZhaWxlZDogJHtyZXMuc3RhdHVzfWApXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKSkgYXMgU3RhdHVzUmVzcG9uc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gYXBwbHlDaGFuZ2VzKGN3ZDogc3RyaW5nLCBhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg/OiBzdHJpbmcpOiBQcm9taXNlPEFwcGx5UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQVBQTFlfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIGFjdGlvbiwgcGF0aCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEFwcGx5UmVzcG9uc2Vcbn1cblxuLyoqIEFwcGx5IG9uZSBodW5rIG9mIG9uZSBmaWxlIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpLiAqL1xuYXN5bmMgZnVuY3Rpb24gYXBwbHlIdW5rKGN3ZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogc3RyaW5nKTogUHJvbWlzZTxBcHBseUh1bmtSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9IVU5LX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBwYXRoLCBhY3Rpb24sIGh1bmsgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBBcHBseUh1bmtSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5HaXRBY3Rpb24oY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2NvbW1pdCcgfCAncHVzaCcsIG1lc3NhZ2U/OiBzdHJpbmcpOiBQcm9taXNlPEdpdFJlc3BvbnNlPiB7XG4gIGNvbnN0IHVybCA9IGFjdGlvbiA9PT0gJ2NvbW1pdCcgPyBDT01NSVRfVVJMIDogUFVTSF9VUkxcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYWN0aW9uID09PSAnY29tbWl0JyA/IHsgY3dkLCBtZXNzYWdlIH0gOiB7IGN3ZCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEdpdFJlc3BvbnNlXG59XG5cbi8qKiBMb2NhbCAodW5wdXNoZWQpIGNvbW1pdHMgYWhlYWQgb2YgdGhlIHVwc3RyZWFtLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEhpc3RvcnkoY3dkOiBzdHJpbmcpOiBQcm9taXNlPEhpc3RvcnlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtISVNUT1JZX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWl0czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBIaXN0b3J5UmVzcG9uc2Vcbn1cblxuLyoqIE9uZSBjb21taXQncyB1bmlmaWVkIGRpZmYuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWl0RGlmZihjd2Q6IHN0cmluZywgaGFzaDogc3RyaW5nKTogUHJvbWlzZTxDb21taXREaWZmUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUlUX0RJRkZfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX0maGFzaD0ke2VuY29kZVVSSUNvbXBvbmVudChoYXNoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBkaWZmOiAnJywgZmlsZXM6IFtdLCBhZGRlZDogMCwgZGVsZXRlZDogMCwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIENvbW1pdERpZmZSZXNwb25zZVxufVxuXG4vKiogSW5saW5lIHJldmlldyBjb21tZW50cyBmb3IgdGhlIHdvcmtzcGFjZSAocmVwby1zY29wZWQpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZENvbW1lbnRzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxSZXZpZXdDb21tZW50W10+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7Q09NTUVOVFNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21tZW50czogW10gfSkpKSBhcyBDb21tZW50c1Jlc3BvbnNlXG4gIHJldHVybiBkYXRhLm9rID8gZGF0YS5jb21tZW50cyA6IFtdXG59XG5cbi8qKiBSZXBsYWNlIHRoZSB3aG9sZSBjb21tZW50IGxpc3QgKHNpbmdsZS11c2VyIHJlcGxhY2Ugc2VtYW50aWNzKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDb21tZW50cyhjd2Q6IHN0cmluZywgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChDT01NRU5UU19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgY29tbWVudHMgfSksXG4gIH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UgfSkpKSBhcyBDb21tZW50c1Jlc3BvbnNlXG4gIHJldHVybiBkYXRhLm9rID09PSB0cnVlXG59XG5cbi8qKiBMb2NhbCBicmFuY2ggbmFtZXMgKGZvciB0aGUgQnJhbmNoIHJldmlldyBzY29wZSkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQnJhbmNoZXMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0JSQU5DSEVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgYnJhbmNoZXM6IFtdIH0pKSkgYXMgeyBvazogYm9vbGVhbjsgYnJhbmNoZXM6IHN0cmluZ1tdIH1cbiAgcmV0dXJuIGRhdGEub2sgPyBkYXRhLmJyYW5jaGVzIDogW11cbn1cblxuLyoqIFJ1biBhbiBBSSByZXZpZXcgb3ZlciB0aGUgZ2l2ZW4gc2NvcGUuICovXG5hc3luYyBmdW5jdGlvbiBydW5SZXZpZXcoY3dkOiBzdHJpbmcsIHNlc3Npb25JZDogc3RyaW5nIHwgbnVsbCwgc2NvcGU6ICd1bmNvbW1pdHRlZCcgfCAnYnJhbmNoJyB8ICdjb21taXQnLCBiYXNlPzogc3RyaW5nLCBjb21taXRIYXNoPzogc3RyaW5nKTogUHJvbWlzZTxSZXZpZXdSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChSRVZJRVdfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHNlc3Npb25JZDogc2Vzc2lvbklkID8/IHVuZGVmaW5lZCwgc2NvcGUsIGJhc2UsIGNvbW1pdEhhc2ggfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGZpbmRpbmdzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFJldmlld1Jlc3BvbnNlXG59XG5cbi8qKiBDdXJyZW50IGJyYW5jaCdzIEdpdEh1YiBQUiBjb250ZXh0IChkZWdyYWRlcyBncmFjZWZ1bGx5IHdpdGhvdXQgZ2gpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZFByKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxQclJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1BSX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWVudHM6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUHJSZXNwb25zZVxufVxuXG4vKiogR2l0IHJlcG9zIHVuZGVyIGEgd29ya3NwYWNlIChtdWx0aS1yZXBvIHNlbGVjdG9yKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRSZXBvcyhjd2Q6IHN0cmluZyk6IFByb21pc2U8UmVwb3NSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtSRVBPU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIHJlcG9zOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFJlcG9zUmVzcG9uc2Vcbn1cblxuLyoqIE9wZW4gYSBmaWxlIChvcHRpb25hbGx5IGF0IGEgbGluZSkgaW4gdGhlIHVzZXIncyBlZGl0b3IgdmlhIG9wZW4tZWRpdG9yLiAqL1xuYXN5bmMgZnVuY3Rpb24gb3BlbkluRWRpdG9yKGN3ZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpOiBQcm9taXNlPHsgb2s6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH0+IHtcbiAgY29uc3QgYWJzID0gcGF0aC5zdGFydHNXaXRoKCcvJykgfHwgL15bQS1aYS16XTpbXFxcXC9dLy50ZXN0KHBhdGgpID8gcGF0aCA6IGAke2N3ZH0vJHtwYXRofWBcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goT1BFTl9FRElUT1JfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBwYXRoOiBhYnMsIGxpbmUgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyB7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9XG59XG5cbi8qKiBTaG9ydCByZWxhdGl2ZSB0aW1lIGZvciBjb21taXQgcm93cyAoXCJqdXN0IG5vd1wiIC8gXCIzIG1pbiBhZ29cIiAvIFx1MjAyNikuICovXG5mdW5jdGlvbiByZWxhdGl2ZVRpbWUoaXNvOiBzdHJpbmcsIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKChEYXRlLm5vdygpIC0gbmV3IERhdGUoaXNvKS5nZXRUaW1lKCkpIC8gNjAwMDApXG4gIGlmIChtaW51dGVzIDwgMSkgcmV0dXJuIHQoJ3RpbWUubm93JylcbiAgaWYgKG1pbnV0ZXMgPCA2MCkgcmV0dXJuIHQoJ3RpbWUubWludXRlcycsIHsgbjogbWludXRlcyB9KVxuICBjb25zdCBob3VycyA9IE1hdGguZmxvb3IobWludXRlcyAvIDYwKVxuICBpZiAoaG91cnMgPCAyNCkgcmV0dXJuIHQoJ3RpbWUuaG91cnMnLCB7IG46IGhvdXJzIH0pXG4gIHJldHVybiB0KCd0aW1lLmRheXMnLCB7IG46IE1hdGguZmxvb3IoaG91cnMgLyAyNCkgfSlcbn1cblxuLyoqIFRoZW1lLWF3YXJlIGRyb3Bkb3duIHJlcGxhY2luZyBuYXRpdmUgPHNlbGVjdD4gKG5hdGl2ZSBwb3B1cHMgaWdub3JlIHRoZSB0aGVtZSkuICovXG5mdW5jdGlvbiBUaGVtZVNlbGVjdCh7XG4gIHZhbHVlLFxuICBvcHRpb25zLFxuICBvbkNoYW5nZSxcbiAgYXJpYUxhYmVsLFxufToge1xuICB2YWx1ZTogc3RyaW5nXG4gIG9wdGlvbnM6IHsgdmFsdWU6IHN0cmluZzsgbGFiZWw6IHN0cmluZyB9W11cbiAgb25DaGFuZ2U6ICh2YWx1ZTogc3RyaW5nKSA9PiB2b2lkXG4gIGFyaWFMYWJlbD86IHN0cmluZ1xufSkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3Qgcm9vdFJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgY3VycmVudCA9IG9wdGlvbnMuZmluZCgobykgPT4gby52YWx1ZSA9PT0gdmFsdWUpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW9wZW4pIHJldHVyblxuICAgIGNvbnN0IGNsb3NlT3V0c2lkZSA9IChldmVudDogUG9pbnRlckV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiAhcm9vdFJlZi5jdXJyZW50Py5jb250YWlucyhldmVudC50YXJnZXQpKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBjb25zdCBjbG9zZU9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBjbG9zZU91dHNpZGUpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNsb3NlT25LZXkpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgY2xvc2VPdXRzaWRlKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGNsb3NlT25LZXkpXG4gICAgfVxuICB9LCBbb3Blbl0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VsXCIgcmVmPXtyb290UmVmfT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItc2VsLXRyaWdnZXJcIlxuICAgICAgICBhcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiXG4gICAgICAgIGFyaWEtZXhwYW5kZWQ9e29wZW59XG4gICAgICAgIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH1cbiAgICAgICAgb25DbGljaz17KCkgPT4gc2V0T3BlbigodikgPT4gIXYpfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC12YWx1ZVwiPntjdXJyZW50Py5sYWJlbCA/PyB2YWx1ZX08L3NwYW4+XG4gICAgICAgIDxJY29uQ2hldnJvbkRvd24gLz5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJkc2RyLXNlbC1tZW51XCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPXthcmlhTGFiZWx9PlxuICAgICAgICAgIHtvcHRpb25zLm1hcCgob3B0aW9uKSA9PiAoXG4gICAgICAgICAgICA8bGkga2V5PXtvcHRpb24udmFsdWV9IHJvbGU9XCJub25lXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtvcHRpb24udmFsdWUgPT09IHZhbHVlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc2VsLW9wdGlvbiR7b3B0aW9uLnZhbHVlID09PSB2YWx1ZSA/ICcgZHNkci1zZWwtb3B0aW9uLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlKG9wdGlvbi52YWx1ZSlcbiAgICAgICAgICAgICAgICAgIHNldE9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLW9wdGlvbi1tYXJrXCI+e29wdGlvbi52YWx1ZSA9PT0gdmFsdWUgPyA8SWNvbkNoZWNrIC8+IDogbnVsbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtb3B0aW9uLWxhYmVsXCI+e29wdGlvbi5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC91bD5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBEaWZmIGZvbnQgKyBmb250IHNpemUgY29udHJvbHMgKHNoYXJlZCBwcmVmcyBzdG9yZSkuICovXG5mdW5jdGlvbiBEaWZmUmV2aWV3UHJlZnMoeyB0IH06IHsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgcHJlZnMgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwcmVmc1N0b3JlLnN1YnNjcmliZSwgcHJlZnNTdG9yZS5nZXRTbmFwc2hvdClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1maWVsZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1sYWJlbFwiIGlkPVwiZHNkci1wcmVmLWZvbnQtbGFiZWxcIj57dCgnc2V0dGluZ3MuZm9udCcpfTwvc3Bhbj5cbiAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgYXJpYUxhYmVsPXt0KCdzZXR0aW5ncy5mb250Jyl9XG4gICAgICAgICAgdmFsdWU9e3ByZWZzLmZvbnR9XG4gICAgICAgICAgb3B0aW9ucz17Rk9OVF9PUFRJT05TLm1hcCgoZikgPT4gKHsgdmFsdWU6IGYuaWQsIGxhYmVsOiBmLmxhYmVsLnN0YXJ0c1dpdGgoJ2ZvbnQuJykgPyB0KGYubGFiZWwgYXMga2V5b2YgdHlwZW9mIHpoKSA6IGYubGFiZWwgfSkpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZm9udCkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuZm9udCA9IGZvbnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWZpZWxkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWxhYmVsXCIgaWQ9XCJkc2RyLXByZWYtc2l6ZS1sYWJlbFwiPnt0KCdzZXR0aW5ncy5zaXplJyl9PC9zcGFuPlxuICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLnNpemUnKX1cbiAgICAgICAgICB2YWx1ZT17U3RyaW5nKHByZWZzLnNpemUpfVxuICAgICAgICAgIG9wdGlvbnM9e1NJWkVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBTdHJpbmcocyksIGxhYmVsOiBgJHtzfXB4YCB9KSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyhzaXplKSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5zaXplID0gTnVtYmVyKHNpemUpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgIDwvPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gSGVhZGVyIGFjdGlvbiAoc2Vzc2lvbiBzY29wZSk6IGJhZGdlICsgb3Blbi5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogUmVwbHktbG9jYWwgY2hhbmdlIHN1bW1hcnkgbW91bnRlZCBiZW5lYXRoIGEgY29tcGxldGVkIGFnZW50IHR1cm4uICovXG5mdW5jdGlvbiBUdXJuQ2hhbmdlU3VtbWFyeSh7IG1hdGNoZWQsIHNlc3Npb25JZCwgdXNlU2Vzc2lvbiwgdXNlU2Vzc2lvbnMsIHQgfTogVHVyblN1bW1hcnlQcm9wcykge1xuICBjb25zdCBub2RlcyA9IHVzZVNlc3Npb24oKHNuYXBzaG90KSA9PiBzbmFwc2hvdC5ub2RlcylcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHNlc3Npb25zOiBTZXNzaW9uTGlzdFN0YXRlKSA9PiBzZXNzaW9ucy5ieUlkW3Nlc3Npb25JZF0/LmN3ZClcbiAgY29uc3QgdHVybiA9IG1hdGNoZWQudHVyblxuICBjb25zdCBmaWxlcyA9IHVzZU1lbW8oKCkgPT4gY29sbGVjdFR1cm5DaGFuZ2VzKG5vZGVzLCB0dXJuLnN0YXJ0Py5zZXEgPz8gLUluZmluaXR5LCB0dXJuLmVuZD8uc2VxID8/IEluZmluaXR5KSwgW25vZGVzLCB0dXJuXSlcbiAgY29uc3QgYWRkZWQgPSB1c2VNZW1vKCgpID0+IGZpbGVzLnJlZHVjZSgodG90YWwsIGZpbGUpID0+IHRvdGFsICsgZmlsZS5hZGRlZCwgMCksIFtmaWxlc10pXG4gIGNvbnN0IGRlbGV0ZWQgPSB1c2VNZW1vKCgpID0+IGZpbGVzLnJlZHVjZSgodG90YWwsIGZpbGUpID0+IHRvdGFsICsgZmlsZS5kZWxldGVkLCAwKSwgW2ZpbGVzXSlcblxuICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHJldmlldyA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoc3RhdGUpID0+IHtcbiAgICAgIHN0YXRlLm9wZW4gPSB0cnVlXG4gICAgICBzdGF0ZS5jd2QgPSBjd2RcbiAgICAgIHN0YXRlLmZvY3VzID0geyBwYXRoOiBmaWxlc1swXS5wYXRoLCByb3VuZDogdHVybi50dXJuLCB0YWI6ICdzZXNzaW9uJyB9XG4gICAgICBzdGF0ZS5rZXkgPSBzdGF0ZS5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeVwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1oZWFkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWljb25cIj48SWNvbkRpZmYgLz48L3NwYW4+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS10aXRsZVwiPnt0KCdyZXZpZXcudHVyblN1bW1hcnlUaXRsZScsIHsgbjogZmlsZXMubGVuZ3RoIH0pfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktc3RhdHNcIj48c3BhbiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1hZGRcIj4re2FkZGVkfTwvc3Bhbj48c3BhbiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1kZWxcIj4te2RlbGV0ZWR9PC9zcGFuPjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIG9uQ2xpY2s9e3Jldmlld30+e3QoJ3Jldmlldy50dXJuU3VtbWFyeVJldmlldycpfTwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWZpbGVzXCI+XG4gICAgICAgIHtmaWxlcy5tYXAoKGZpbGUpID0+IChcbiAgICAgICAgICA8YnV0dG9uIGtleT17ZmlsZS5wYXRofSB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktZmlsZVwiIG9uQ2xpY2s9e3Jldmlld30gdGl0bGU9e2ZpbGUucGF0aH0+XG4gICAgICAgICAgICA8c3Bhbj57ZmlsZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWZpbGUtc3RhdHNcIj48c3BhbiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1hZGRcIj4re2ZpbGUuYWRkZWR9PC9zcGFuPjxzcGFuIGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWRlbFwiPi17ZmlsZS5kZWxldGVkfTwvc3Bhbj48L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gaGlnaGxpZ2h0Q29kZSh2YWx1ZTogc3RyaW5nKTogUmVhY3ROb2RlW10ge1xuICBjb25zdCB0b2tlbiA9IC8oXFwvXFwvW15cXG5dKnxcXC9cXCpbXFxzXFxTXSo/XFwqXFwvfFwiKD86XFxcXC58W15cIl0pKlwifCcoPzpcXFxcLnxbXiddKSonfFxcYig/OmNvbnN0fGxldHx2YXJ8ZnVuY3Rpb258cmV0dXJufGlmfGVsc2V8Zm9yfHdoaWxlfGFzeW5jfGF3YWl0fGltcG9ydHxmcm9tfGV4cG9ydHx0eXBlfGludGVyZmFjZXxjbGFzc3xuZXd8dHJ1ZXxmYWxzZXxudWxsfHVuZGVmaW5lZClcXGJ8XFxiXFxkKyg/OlxcLlxcZCspP1xcYikvZ1xuICByZXR1cm4gdmFsdWUuc3BsaXQodG9rZW4pLmZpbHRlcihCb29sZWFuKS5tYXAoKHBhcnQsIGluZGV4KSA9PiB7XG4gICAgY29uc3Qga2luZCA9IHBhcnQuc3RhcnRzV2l0aCgnLy8nKSB8fCBwYXJ0LnN0YXJ0c1dpdGgoJy8qJykgPyAnY29tbWVudCcgOiBwYXJ0LnN0YXJ0c1dpdGgoJ1wiJykgfHwgcGFydC5zdGFydHNXaXRoKFwiJ1wiKSA/ICdzdHJpbmcnIDogL15cXGQvLnRlc3QocGFydCkgPyAnbnVtYmVyJyA6IC9eKGNvbnN0fGxldHx2YXJ8ZnVuY3Rpb258cmV0dXJufGlmfGVsc2V8Zm9yfHdoaWxlfGFzeW5jfGF3YWl0fGltcG9ydHxmcm9tfGV4cG9ydHx0eXBlfGludGVyZmFjZXxjbGFzc3xuZXd8dHJ1ZXxmYWxzZXxudWxsfHVuZGVmaW5lZCkkLy50ZXN0KHBhcnQpID8gJ2tleXdvcmQnIDogJ3BsYWluJ1xuICAgIHJldHVybiA8c3BhbiBjbGFzc05hbWU9eydkc2RyLWNvZGUtJyArIGtpbmR9IGtleT17aW5kZXh9PntwYXJ0fTwvc3Bhbj5cbiAgfSlcbn1cblxuZnVuY3Rpb24gRmlsZXNXb3Jrc3BhY2UoeyBjd2QsIHQsIGNvbGxhcHNlZCwgb25Ub2dnbGVEaXIgfTogeyBjd2Q6IHN0cmluZzsgdDogQ2FyZFQ7IGNvbGxhcHNlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPjsgb25Ub2dnbGVEaXI6IChwYXRoOiBzdHJpbmcpID0+IHZvaWQgfSkge1xuICBjb25zdCBbZmlsZXMsIHNldEZpbGVzXSA9IHVzZVN0YXRlPFdvcmtzcGFjZUZpbGVFbnRyeVtdPihbXSlcbiAgY29uc3QgW2ZpbHRlciwgc2V0RmlsdGVyXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb250ZW50LCBzZXRDb250ZW50XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbZmlsZUtpbmQsIHNldEZpbGVLaW5kXSA9IHVzZVN0YXRlPCd0ZXh0JyB8ICdpbWFnZScgfCAnYmluYXJ5Jz4oJ3RleHQnKVxuICBjb25zdCBbaW1hZ2VVcmwsIHNldEltYWdlVXJsXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFttdGltZSwgc2V0TXRpbWVdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbm90aWNlLCBzZXROb3RpY2VdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3Qgc2F2ZWRDb250ZW50ID0gdXNlUmVmKCcnKVxuICBjb25zdCBjb2RlUmVmID0gdXNlUmVmPEhUTUxQcmVFbGVtZW50PihudWxsKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGFsaXZlID0gdHJ1ZVxuICAgIHZvaWQgZmV0Y2goYCR7RklMRVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICAgICAgLnRoZW4oKHJlcykgPT4gcmVzLmpzb24oKSBhcyBQcm9taXNlPEZpbGVzTGlzdFJlc3BvbnNlPilcbiAgICAgIC50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgIGlmIChhbGl2ZSkge1xuICAgICAgICAgIHNldEZpbGVzKGRhdGEuZmlsZXMgPz8gW10pXG4gICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoKSA9PiBhbGl2ZSAmJiBzZXRMb2FkaW5nKGZhbHNlKSlcbiAgICByZXR1cm4gKCkgPT4geyBhbGl2ZSA9IGZhbHNlIH1cbiAgfSwgW2N3ZF0pXG5cbiAgY29uc3Qgc2hvd24gPSB1c2VNZW1vKCgpID0+IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gZmlsZS5wYXRoLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVyLnRyaW0oKS50b0xvd2VyQ2FzZSgpKSksIFtmaWxlcywgZmlsdGVyXSlcbiAgY29uc3QgdHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZShzaG93biwgKGZpbGUpID0+IGZpbGUucGF0aCksIFtzaG93bl0pXG4gIGNvbnN0IG9wZW4gPSBhc3luYyAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWQocGF0aCk7IHNldExvYWRpbmcodHJ1ZSk7IHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtGSUxFU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfSZwYXRoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHBhdGgpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkpIGFzIEZpbGVSZWFkUmVzcG9uc2VcbiAgICAgIGlmIChkYXRhLm9rKSB7IGNvbnN0IG5leHQgPSBkYXRhLmNvbnRlbnQgPz8gJyc7IHNhdmVkQ29udGVudC5jdXJyZW50ID0gbmV4dDsgc2V0Q29udGVudChuZXh0KTsgc2V0RmlsZUtpbmQoZGF0YS5raW5kID8/ICd0ZXh0Jyk7IHNldEltYWdlVXJsKGRhdGEuZGF0YVVybCA/PyBudWxsKTsgc2V0TXRpbWUoZGF0YS5tdGltZSA/PyBudWxsKSB9IGVsc2Ugc2V0Tm90aWNlKGRhdGEuZXJyb3IgPz8gJ0ZhaWxlZCB0byByZWFkIGZpbGUnKVxuICAgIH0gY2F0Y2ggeyBzZXROb3RpY2UoJ0ZhaWxlZCB0byByZWFkIGZpbGUnKSB9IGZpbmFsbHkgeyBzZXRMb2FkaW5nKGZhbHNlKSB9XG4gIH1cbiAgY29uc3Qgc2F2ZSA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkIHx8IHNhdmluZykgcmV0dXJuXG4gICAgc2V0U2F2aW5nKHRydWUpOyBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goRklMRVNfVVJMLCB7IG1ldGhvZDogJ1BPU1QnLCBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSwgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHBhdGg6IHNlbGVjdGVkLCBjb250ZW50LCBtdGltZSB9KSB9KVxuICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpKSBhcyBGaWxlV3JpdGVSZXNwb25zZVxuICAgICAgaWYgKGRhdGEub2spIHsgc2F2ZWRDb250ZW50LmN1cnJlbnQgPSBjb250ZW50OyBzZXRNdGltZShkYXRhLm10aW1lID8/IG10aW1lKTsgc2V0Tm90aWNlKHQoJ2ZpbGVzLnNhdmVkJykpIH0gZWxzZSBzZXROb3RpY2UoZGF0YS5lcnJvciA/PyAnRmFpbGVkIHRvIHNhdmUgZmlsZScpXG4gICAgfSBjYXRjaCB7IHNldE5vdGljZSgnRmFpbGVkIHRvIHNhdmUgZmlsZScpIH0gZmluYWxseSB7IHNldFNhdmluZyhmYWxzZSkgfVxuICB9XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzZWxlY3RlZCB8fCBsb2FkaW5nIHx8IHNhdmluZyB8fCBjb250ZW50ID09PSBzYXZlZENvbnRlbnQuY3VycmVudCkgcmV0dXJuXG4gICAgY29uc3QgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB2b2lkIHNhdmUoKSwgODAwKVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKVxuICB9LCBbY29udGVudCwgc2VsZWN0ZWQsIGxvYWRpbmcsIHNhdmluZywgbXRpbWVdKVxuXG4gIHJldHVybiAoXG4gICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiZHNkci1maWxlcy13b3Jrc3BhY2VcIiBhcmlhLWxhYmVsPXt0KCdmaWxlcy50aXRsZScpfT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy10b29sYmFyXCI+PGlucHV0IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtc2VhcmNoXCIgdmFsdWU9e2ZpbHRlcn0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmlsdGVyKGV2ZW50LnRhcmdldC52YWx1ZSl9IHBsYWNlaG9sZGVyPXt0KCdmaWxlcy5zZWFyY2gnKX0gYXV0b0ZvY3VzIC8+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtY29udGVudFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtbGlzdFwiPlxuICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgIG5vZGVzPXt0cmVlfVxuICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWR9XG4gICAgICAgICAgICBvblRvZ2dsZURpcj17b25Ub2dnbGVEaXJ9XG4gICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgIHJlbmRlckxlYWY9eyhsZWFmKSA9PiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9e2Bkc2RyLWZpbGVzLWl0ZW0ke3NlbGVjdGVkID09PSBsZWFmLnBhdGggPyAnIGRzZHItZmlsZXMtaXRlbS1hY3RpdmUnIDogJyd9YH0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuKGxlYWYucGF0aCl9IHRpdGxlPXtsZWFmLnBhdGh9PntsZWFmLm5hbWV9PC9idXR0b24+fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgeyFsb2FkaW5nICYmIHNob3duLmxlbmd0aCA9PT0gMCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdmaWxlcy5lbXB0eScpfTwvZGl2PiA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtZWRpdG9yXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbGVzLXBhdGhcIj57c2VsZWN0ZWQgPz8gKGxvYWRpbmcgPyB0KCdmaWxlcy5sb2FkaW5nJykgOiAnJyl9PC9kaXY+XG4gICAgICAgICAge3NlbGVjdGVkICYmIGZpbGVLaW5kID09PSAndGV4dCcgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29kZS1lZGl0b3JcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvZGUtbGluZXNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y29udGVudC5zcGxpdCgnXFxuJykubWFwKChfLCBpbmRleCkgPT4gPHNwYW4ga2V5PXtpbmRleH0+e2luZGV4ICsgMX08L3NwYW4+KX08L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvZGUtbGF5ZXJcIj5cbiAgICAgICAgICAgICAgICA8cHJlIHJlZj17Y29kZVJlZn0gY2xhc3NOYW1lPVwiZHNkci1jb2RlLWhpZ2hsaWdodFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjxjb2RlPntoaWdobGlnaHRDb2RlKGNvbnRlbnQpfTwvY29kZT48L3ByZT5cbiAgICAgICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3NOYW1lPVwiZHNkci1maWxlcy10ZXh0XCIgdmFsdWU9e2NvbnRlbnR9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldENvbnRlbnQoZXZlbnQudGFyZ2V0LnZhbHVlKX0gb25TY3JvbGw9eyhldmVudCkgPT4geyBpZiAoY29kZVJlZi5jdXJyZW50KSB7IGNvZGVSZWYuY3VycmVudC5zY3JvbGxUb3AgPSBldmVudC5jdXJyZW50VGFyZ2V0LnNjcm9sbFRvcDsgY29kZVJlZi5jdXJyZW50LnNjcm9sbExlZnQgPSBldmVudC5jdXJyZW50VGFyZ2V0LnNjcm9sbExlZnQgfSB9fSBzcGVsbENoZWNrPXtmYWxzZX0gLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7c2VsZWN0ZWQgJiYgZmlsZUtpbmQgPT09ICdpbWFnZScgJiYgaW1hZ2VVcmwgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItaW1hZ2UtcHJldmlld1wiPjxpbWcgc3JjPXtpbWFnZVVybH0gYWx0PXtzZWxlY3RlZH0gLz48L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCAmJiBmaWxlS2luZCA9PT0gJ2JpbmFyeScgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtdW5hdmFpbGFibGVcIj5cdTZCNjRcdTRFOENcdThGREJcdTUyMzZcdTY1ODdcdTRFRjZcdTRFMERcdTUzRUZcdTk4ODRcdTg5Qzg8L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy1hY3Rpb25zXCI+PHNwYW4gY2xhc3NOYW1lPVwiZHNkci1ub3RpY2VcIj57c2F2aW5nID8gdCgnZmlsZXMubG9hZGluZycpIDogbm90aWNlID8/ICcnfTwvc3Bhbj48L2Rpdj4gOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3QWN0aW9uKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgdXNlU2Vzc2lvbiwgdCB9OiBEaWZmUmV2aWV3QWN0aW9uUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IG5vZGVzID0gdXNlU2Vzc2lvbigocykgPT4gcy5ub2RlcylcbiAgY29uc3QgY2hhbmdlQ291bnQgPSB1c2VNZW1vKCgpID0+IGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXMpLCBbbm9kZXNdKVxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBvcGVuT3ZlcmxheSA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWIgPSBvdmVybGF5U3RvcmUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHNldE9wZW4ob3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KCkub3BlbilcbiAgICB9KVxuICAgIHJldHVybiB1bnN1YlxuICB9LCBbXSlcblxuICBpZiAoIWN3ZCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItdHJpZ2dlclwiIGFyaWEtbGFiZWw9e3QoJ2FjdGlvbi5hcmlhJyl9IG9uQ2xpY2s9e29wZW5PdmVybGF5fT5cbiAgICAgIDxJY29uRGlmZiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1sYWJlbFwiPnt0KCdhY3Rpb24ubGFiZWwnKX08L3NwYW4+XG4gICAgICB7Y2hhbmdlQ291bnQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiPntjaGFuZ2VDb3VudH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtvcGVuID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlx1MjcxMzwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRmlsZSB0cmVlOiBidWlsZCBhIGRpcmVjdG9yeSB0cmVlIGZyb20gZmxhdCBwYXRocyBhbmQgcmVuZGVyIGl0IHdpdGhcbi8vIGNvbGxhcHNpYmxlIGZvbGRlcnMgKHRoZSBsZWZ0IHNpZGUgb2YgdGhlIHJldmlldyBzdXJmYWNlKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIFRyZWVEaXI8VD4gPSB7IGtpbmQ6ICdkaXInOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgY2hpbGRyZW46IFRyZWVOb2RlPFQ+W10gfVxudHlwZSBUcmVlTGVhZjxUPiA9IHsga2luZDogJ2xlYWYnOyBuYW1lOiBzdHJpbmc7IHBhdGg6IHN0cmluZzsgaXRlbTogVCB9XG50eXBlIFRyZWVOb2RlPFQ+ID0gVHJlZURpcjxUPiB8IFRyZWVMZWFmPFQ+XG5cbi8qKiBUdXJuIGEgZmxhdCBpdGVtIGxpc3QgaW50byBhIHNvcnRlZCBkaXJlY3RvcnkgdHJlZSAoZGlyZWN0b3JpZXMgZmlyc3QpLiAqL1xuZnVuY3Rpb24gYnVpbGRGaWxlVHJlZTxUPihpdGVtczogcmVhZG9ubHkgVFtdLCBwYXRoT2Y6IChpdGVtOiBUKSA9PiBzdHJpbmcpOiBUcmVlTm9kZTxUPltdIHtcbiAgY29uc3Qgcm9vdDogVHJlZU5vZGU8VD5bXSA9IFtdXG4gIGNvbnN0IGRpckluZGV4ID0gbmV3IE1hcDxzdHJpbmcsIFRyZWVEaXI8VD4+KClcbiAgZm9yIChjb25zdCBpdGVtIG9mIGl0ZW1zKSB7XG4gICAgY29uc3QgcGF0aCA9IHBhdGhPZihpdGVtKVxuICAgIGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDApIGNvbnRpbnVlXG4gICAgbGV0IHNpYmxpbmdzID0gcm9vdFxuICAgIGxldCBwcmVmaXggPSAnJ1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBwcmVmaXggPSBwcmVmaXggPyBgJHtwcmVmaXh9LyR7cGFydHNbaV19YCA6IHBhcnRzW2ldXG4gICAgICBsZXQgZGlyID0gZGlySW5kZXguZ2V0KHByZWZpeClcbiAgICAgIGlmICghZGlyKSB7XG4gICAgICAgIGRpciA9IHsga2luZDogJ2RpcicsIG5hbWU6IHBhcnRzW2ldLCBwYXRoOiBwcmVmaXgsIGNoaWxkcmVuOiBbXSB9XG4gICAgICAgIGRpckluZGV4LnNldChwcmVmaXgsIGRpcilcbiAgICAgICAgc2libGluZ3MucHVzaChkaXIpXG4gICAgICB9XG4gICAgICBzaWJsaW5ncyA9IGRpci5jaGlsZHJlblxuICAgIH1cbiAgICBzaWJsaW5ncy5wdXNoKHsga2luZDogJ2xlYWYnLCBuYW1lOiBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSwgcGF0aCwgaXRlbSB9KVxuICB9XG4gIGNvbnN0IHNvcnROb2RlcyA9IChub2RlczogVHJlZU5vZGU8VD5bXSk6IHZvaWQgPT4ge1xuICAgIG5vZGVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGlmIChhLmtpbmQgIT09IGIua2luZCkgcmV0dXJuIGEua2luZCA9PT0gJ2RpcicgPyAtMSA6IDFcbiAgICAgIHJldHVybiBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpXG4gICAgfSlcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIGlmIChub2RlLmtpbmQgPT09ICdkaXInKSBzb3J0Tm9kZXMobm9kZS5jaGlsZHJlbilcbiAgfVxuICBzb3J0Tm9kZXMocm9vdClcbiAgcmV0dXJuIHJvb3Rcbn1cblxuLyoqIFJlY3Vyc2l2ZSB0cmVlIHJlbmRlcmVyOiBjb2xsYXBzaWJsZSBkaXJlY3RvcmllcyArIGxlYWYgcm93cy4gKi9cbmZ1bmN0aW9uIEZpbGVUcmVlVmlldzxUPihwcm9wczoge1xuICBub2RlczogVHJlZU5vZGU8VD5bXVxuICBjb2xsYXBzZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz5cbiAgb25Ub2dnbGVEaXI6IChwYXRoOiBzdHJpbmcpID0+IHZvaWRcbiAgZGVwdGg6IG51bWJlclxuICByZW5kZXJMZWFmOiAobGVhZjogVHJlZUxlYWY8VD4pID0+IFJlYWN0Tm9kZVxufSk6IFJlYWN0RWxlbWVudCB7XG4gIGNvbnN0IHsgbm9kZXMsIGNvbGxhcHNlZCwgb25Ub2dnbGVEaXIsIGRlcHRoLCByZW5kZXJMZWFmIH0gPSBwcm9wc1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7bm9kZXMubWFwKChub2RlKSA9PlxuICAgICAgICBub2RlLmtpbmQgPT09ICdkaXInID8gKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9PlxuICAgICAgICAgICAgey8qIERpcmVjdG9yeSByb3c6IGNsaWNrIHRvZ2dsZXMgdGhpcyBkaXJlY3RvcnkncyBjb2xsYXBzZSBzdGF0ZVxuICAgICAgICAgICAgICAgIChjb2xsYXBzZWQgXHUyMTkyIGV4cGFuZCwgZXhwYW5kZWQgXHUyMTkyIGNvbGxhcHNlKS4gKi99XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWRpciR7Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJycgOiAnIGRzZHItZGlyLW9wZW4nfWB9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0ICsgOCB9fVxuICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXshY29sbGFwc2VkLmhhcyhub2RlLnBhdGgpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblRvZ2dsZURpcihub2RlLnBhdGgpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1jYXJldFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAnXHUyNUI4JyA6ICdcdTI1QkUnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItbmFtZVwiIHRpdGxlPXtub2RlLnBhdGh9Pntub2RlLm5hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1jb3VudFwiPntub2RlLmNoaWxkcmVuLmxlbmd0aH08L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIHshY29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gKFxuICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3IG5vZGVzPXtub2RlLmNoaWxkcmVufSBjb2xsYXBzZWQ9e2NvbGxhcHNlZH0gb25Ub2dnbGVEaXI9e29uVG9nZ2xlRGlyfSBkZXB0aD17ZGVwdGggKyAxfSByZW5kZXJMZWFmPXtyZW5kZXJMZWFmfSAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPGRpdiBrZXk9e25vZGUucGF0aH0gc3R5bGU9e3sgcGFkZGluZ0xlZnQ6IGRlcHRoICogMTQgfX0+e3JlbmRlckxlYWYobm9kZSl9PC9kaXY+XG4gICAgICAgICksXG4gICAgICApfVxuICAgIDwvPlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29udmVyc2F0aW9uIGNhcmQgKHNlc3Npb24gc2NvcGUpOiB0aGUgY2FycmllZCByZXZpZXcgcGFja2FnZSByZW5kZXJzIGluIHRoZVxuLy8gdHJhbnNjcmlwdCBhcyBhIENvZGV4LXN0eWxlIGNhcmQgXHUyMDE0IGVhY2ggY29tbWVudCBjbGlja2FibGUgdG8ganVtcCB0byB0aGVcbi8vIG1hdGNoaW5nIGNoYW5nZSBibG9jayBpbiB0aGUgcmV2aWV3IHBhbmVsLiBUaGUgdXNlci1ub2RlIHJlbmRlcmVyIGlzXG4vLyBzaGFkb3dlZCBhdCBwcmlvcml0eSAtMTsgbm9uLXBhY2thZ2UgbWVzc2FnZXMgZmFsbCBiYWNrIHRvIGEgbmF0aXZlLWxvb2tcbi8vIGJ1YmJsZSAodGhlIHNoZWxsJ3Mgb3duIHJlbmRlcmVyIGNhbm5vdCBiZSBkZWxlZ2F0ZWQgdG8sIGJlY2F1c2UgdGhlIHNsb3Rcbi8vIGhhbmRzIG91ciBuYW1lc3BhY2UtYm91bmQgYHRgIHRvIHdoYXRldmVyIGNvbXBvbmVudCB3aW5zIHRoZSBjZWxsKS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogU3RydWN0dXJhbCB1c2VyIGNvbnRlbnQgYmxvY2sgKENvbnRlbnRCbG9jayBpcyBub3QgZXhwb3J0ZWQgZnJvbSBydW50aW1lKS4gKi9cbnR5cGUgVXNlckJsb2NrID0geyB0eXBlOiBzdHJpbmc7IHRleHQ/OiBzdHJpbmc7IGF0dGFjaG1lbnQ/OiBJbWFnZUF0dGFjaG1lbnRSZWYgfVxuXG4vKiogUGxhaW4gdGV4dCBvZiBhIHVzZXIgbWVzc2FnZSdzIGNvbnRlbnQgYmxvY2tzICh0ZXh0IGJsb2NrcyBjb25jYXRlbmF0ZWQpLiAqL1xuZnVuY3Rpb24gdXNlck1lc3NhZ2VUZXh0KGNvbnRlbnQ6IHJlYWRvbmx5IFVzZXJCbG9ja1tdKTogc3RyaW5nIHtcbiAgbGV0IG91dCA9ICcnXG4gIGZvciAoY29uc3QgYmxvY2sgb2YgY29udGVudCkge1xuICAgIGlmIChibG9jay50eXBlID09PSAndGV4dCcgJiYgdHlwZW9mIGJsb2NrLnRleHQgPT09ICdzdHJpbmcnKSBvdXQgKz0gYmxvY2sudGV4dFxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuLyoqIEZ1bGwgcHJvcHMgb2Ygb3VyIHNoYWRvd2VkIHVzZXIvc3RlZXJpbmcgbm9kZSByZW5kZXJlcnMgKHQgYm91bmQgdG8gb3VyIG5hbWVzcGFjZSkuICovXG50eXBlIFVzZXJSZXZpZXdOb2RlUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5jaGF0Lm5vZGUnLCAndXNlcicgfCAnc3RlZXJpbmcnPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+XG4vKiogVHJhbnNsYXRvciBib3VuZCB0byB0aGUgcGx1Z2luIG5hbWVzcGFjZSAoc2hhcmVkIGJ5IHRoZSBjYXJkL2J1YmJsZSkuICovXG50eXBlIENhcmRUID0gUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5bJ3QnXVxuXG4vKiogR3JvdXAgY29tbWVudHMgYnkgcGF0aCwgcHJlc2VydmluZyBmaXJzdC1zZWVuIG9yZGVyLiAqL1xuZnVuY3Rpb24gZ3JvdXBDb21tZW50cyhjb21tZW50czogUmV2aWV3UGFja2FnZUNvbW1lbnRbXSk6IHsgcGF0aDogc3RyaW5nOyBjb21tZW50czogUmV2aWV3UGFja2FnZUNvbW1lbnRbXSB9W10ge1xuICBjb25zdCBncm91cHM6IHsgcGF0aDogc3RyaW5nOyBjb21tZW50czogUmV2aWV3UGFja2FnZUNvbW1lbnRbXSB9W10gPSBbXVxuICBjb25zdCBpbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KClcbiAgZm9yIChjb25zdCBjIG9mIGNvbW1lbnRzKSB7XG4gICAgbGV0IGcgPSBpbmRleC5nZXQoYy5wYXRoKVxuICAgIGlmIChnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGcgPSBncm91cHMubGVuZ3RoXG4gICAgICBpbmRleC5zZXQoYy5wYXRoLCBnKVxuICAgICAgZ3JvdXBzLnB1c2goeyBwYXRoOiBjLnBhdGgsIGNvbW1lbnRzOiBbXSB9KVxuICAgIH1cbiAgICBncm91cHNbZ10uY29tbWVudHMucHVzaChjKVxuICB9XG4gIHJldHVybiBncm91cHNcbn1cblxuZnVuY3Rpb24gSWNvbkZpbGUoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTE0IDJINmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMlY4elwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTE0IDJ2Nmg2XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogQ29kZXgtc3R5bGUgcmV2aWV3IGNhcmQgZm9yIGEgY2FycmllZCByZXZpZXcgcGFja2FnZSBtZXNzYWdlLiAqL1xuZnVuY3Rpb24gUmV2aWV3UGFja2FnZUNhcmQoeyBwa2csIGN3ZCwgdCB9OiB7IHBrZzogUmV2aWV3UGFja2FnZTsgY3dkPzogc3RyaW5nOyB0OiBDYXJkVCB9KSB7XG4gIGNvbnN0IHRhcmdldEN3ZCA9IHBrZy53b3Jrc3BhY2UgPz8gY3dkID8/IG51bGxcbiAgY29uc3QganVtcCA9IChwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIsIHNvdXJjZT86IFJldmlld1BhY2thZ2VDb21tZW50Wydzb3VyY2UnXSkgPT4ge1xuICAgIGlmICghdGFyZ2V0Q3dkKSByZXR1cm5cbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IHRhcmdldEN3ZFxuICAgICAgLy8gU2Vzc2lvbi1zb3VyY2VkIGNvbW1lbnRzIGFuY2hvciB0byByZWxhdGl2ZSBodW5rIGxpbmVzIGFuZCBqdW1wIHRvXG4gICAgICAvLyB0aGUgc2Vzc2lvbiB0YWI7IHdvcmtzcGFjZSBjb21tZW50cyBqdW1wIHRvIHJlYWwgZmlsZSBsaW5lcy5cbiAgICAgIGQuZm9jdXMgPSB7IHBhdGgsIGxpbmUsIHRhYjogc291cmNlID09PSAnc2Vzc2lvbicgPyAnc2Vzc2lvbicgOiAnd29ya3NwYWNlJyB9XG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cbiAgY29uc3QgZ3JvdXBzID0gdXNlTWVtbygoKSA9PiBncm91cENvbW1lbnRzKHBrZy5jb21tZW50cyksIFtwa2cuY29tbWVudHNdKVxuICBjb25zdCBzaG93VmVyZGljdCA9IHBrZy52ZXJkaWN0ICE9PSBudWxsIHx8IHBrZy5maW5kaW5ncy5sZW5ndGggPiAwXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkXCIgZGF0YS10aW1lLWhvdmVyLXJvb3Q+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtaGVhZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWJhZGdlXCI+PEljb25Db21tZW50IC8+e3QoJ3Jldmlldy5jYXJkVGl0bGUnKX08L3NwYW4+XG4gICAgICAgIHt0YXJnZXRDd2QgPyAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC13b3Jrc3BhY2VcIiB0aXRsZT17dGFyZ2V0Q3dkfT57dGFyZ2V0Q3dkfTwvc3Bhbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAge3BrZy5jb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtbWV0YVwiPnt0KCdyZXZpZXcuY2FyZENvbW1lbnRzJywgeyBuOiBwa2cuY29tbWVudHMubGVuZ3RoIH0pfTwvc3Bhbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIHtncm91cHMubWFwKChnKSA9PiAoXG4gICAgICAgIDxkaXYga2V5PXtnLnBhdGh9IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZ3JvdXBcIj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLXBhdGhcIiB0aXRsZT17dCgncmV2aWV3LmNhcmRPcGVuRmlsZScpfSBvbkNsaWNrPXsoKSA9PiBqdW1wKGcucGF0aCl9PlxuICAgICAgICAgICAgPEljb25GaWxlIC8+PHNwYW4+e2cucGF0aH08L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAge2cuY29tbWVudHMubWFwKChjLCBpKSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtaXRlbVwiXG4gICAgICAgICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuY2FyZEp1bXAnKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ganVtcChjLnBhdGgsIGMubGluZSA/PyB1bmRlZmluZWQsIGMuc291cmNlKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1sb2NcIj57Yy5saW5lICE9PSBudWxsID8gYCR7Yy5wYXRofToke2MubGluZX1gIDogYCR7Yy5wYXRofSAob2xkKWB9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLXRleHRcIj57Yy50ZXh0fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkpfVxuICAgICAge3Nob3dWZXJkaWN0ID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC1zZWNcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC1oZWFkXCI+XG4gICAgICAgICAgICA8c3Bhbj57dCgncmV2aWV3LmNhcmRWZXJkaWN0Jyl9PC9zcGFuPlxuICAgICAgICAgICAge3BrZy52ZXJkaWN0ID8gKFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXJldmlldy1jYXJkLXZlcmRpY3QgZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LSR7cGtnLnZlcmRpY3R9YH0+XG4gICAgICAgICAgICAgICAge3BrZy52ZXJkaWN0ID09PSAnY29ycmVjdCcgPyB0KCdyZXZpZXcudmVyZGljdENvcnJlY3QnKSA6IHQoJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0Jyl9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtwa2cuZmluZGluZ3MubWFwKChmOiBSZXZpZXdQYWNrYWdlRmluZGluZywgaTogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1maW5kaW5nXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItZmluZGluZy10YWcgZHNkci1maW5kaW5nLSR7Zi5wcmlvcml0eX1gfT57Zi5wcmlvcml0eX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZmluZGluZy10ZXh0XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1maW5kaW5nLWxvY1wiPntmLmZpbGV9OntmLmxpbmV9PC9zcGFuPnsnICd9XG4gICAgICAgICAgICAgICAge2YudGl0bGV9e2YuZGV0YWlsID8gYCBcdTIwMTQgJHtmLmRldGFpbH1gIDogJyd9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWZvb3RcIj57dCgncmV2aWV3LmNhcmRIaW50Jyl9PC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIE5hdGl2ZS1sb29rIGZhbGxiYWNrIGJ1YmJsZSBmb3Igb3JkaW5hcnkgdXNlciBtZXNzYWdlcyAoc2hhZG93ZWQgY2VsbCkuICovXG5mdW5jdGlvbiBGYWxsYmFja1VzZXJCdWJibGUoe1xuICB0ZXh0LFxuICBpbWFnZXMsXG4gIGxvYWRJbWFnZSxcbiAgdCxcbn06IHtcbiAgdGV4dDogc3RyaW5nXG4gIGltYWdlczogcmVhZG9ubHkgKFVzZXJCbG9jayAmIHsgYXR0YWNobWVudDogSW1hZ2VBdHRhY2htZW50UmVmIH0pW11cbiAgbG9hZEltYWdlOiAoYXR0YWNobWVudDogSW1hZ2VBdHRhY2htZW50UmVmKSA9PiBQcm9taXNlPHN0cmluZz5cbiAgdDogQ2FyZFRcbn0pIHtcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBvbkNvcHkgPSAoKSA9PiB7XG4gICAgdm9pZCB3cml0ZUNsaXBib2FyZCh0ZXh0KS50aGVuKChvaykgPT4ge1xuICAgICAgaWYgKCFvaykgcmV0dXJuXG4gICAgICBzZXRDb3BpZWQodHJ1ZSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29waWVkKGZhbHNlKSwgMTAwMClcbiAgICB9KVxuICB9XG4gIGNvbnN0IGxhYmVscyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKHtcbiAgICAgIGltYWdlOiB0KCdmYWxsYmFjay5pbWFnZScpLFxuICAgICAgb3BlbjogdCgnZmFsbGJhY2sub3BlbicpLFxuICAgICAgb3Blbk5hbWVkOiAobmFtZTogc3RyaW5nKSA9PiB0KCdmYWxsYmFjay5vcGVuTmFtZWQnLCB7IG5hbWUgfSksXG4gICAgICBsb2FkaW5nOiB0KCdmYWxsYmFjay5sb2FkaW5nJyksXG4gICAgICBsb2FkRmFpbGVkOiB0KCdmYWxsYmFjay5sb2FkRmFpbGVkJyksXG4gICAgICBsaWdodGJveDogeyBkaWFsb2c6IHQoJ2ZhbGxiYWNrLmxpZ2h0Ym94RGlhbG9nJyksIGNsb3NlOiB0KCdmYWxsYmFjay5saWdodGJveENsb3NlJykgfSxcbiAgICB9KSxcbiAgICBbdF0sXG4gIClcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmFsbGJhY2stdXNlclwiIGRhdGEtdGltZS1ob3Zlci1yb290PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXItc3RhY2tcIj5cbiAgICAgICAge2ltYWdlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgIDxJbWFnZUdhbGxlcnkgaW1hZ2VzPXtpbWFnZXN9IGxvYWQ9e2xvYWRJbWFnZX0gYWxpZ249XCJlbmRcIiBsYWJlbHM9e2xhYmVsc30gLz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHt0ZXh0ICE9PSAnJyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmFsbGJhY2stdXNlci1yb3dcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyLWJ1YmJsZVwiPnt0ZXh0fTwvZGl2PlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyLWNvcHlcIiB0aXRsZT17dCgncmV2aWV3LmNvcHknKX0gb25DbGljaz17b25Db3B5fT5cbiAgICAgICAgICAgICAge2NvcGllZCA/IHQoJ3Jldmlldy5jb3BpZWQnKSA6IDxJY29uQ29weSAvPn1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25Db3B5KCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHJlY3Qgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgeD1cIjhcIiB5PVwiOFwiIHJ4PVwiMlwiIHJ5PVwiMlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTQgMTZjLTEuMSAwLTItLjktMi0yVjRjMC0xLjEuOS0yIDItMmgxMGMxLjEgMCAyIC45IDIgMlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqXG4gKiBVc2VyLW5vZGUgcmVuZGVyZXIgc2hhZG93OiBjYXJyaWVkIHJldmlldyBwYWNrYWdlcyByZW5kZXIgYXMgYSBjYXJkO1xuICogZXZlcnl0aGluZyBlbHNlIHJlbmRlcnMgYXMgYSBuYXRpdmUtbG9vayBidWJibGUuXG4gKi9cbmZ1bmN0aW9uIFVzZXJSZXZpZXdOb2RlVmlldyhwcm9wczogVXNlclJldmlld05vZGVQcm9wcykge1xuICBjb25zdCBjb250ZW50ID0gdXNlTWVtbygoKSA9PiBwcm9wcy5ub2RlLmRhdGEuY29udGVudCBhcyByZWFkb25seSBVc2VyQmxvY2tbXSwgW3Byb3BzLm5vZGUuZGF0YS5jb250ZW50XSlcbiAgY29uc3QgdGV4dCA9IHVzZU1lbW8oKCkgPT4gdXNlck1lc3NhZ2VUZXh0KGNvbnRlbnQpLCBbY29udGVudF0pXG4gIGNvbnN0IGltYWdlcyA9IHVzZU1lbW8oXG4gICAgKCkgPT4gY29udGVudC5maWx0ZXIoKGIpOiBiIGlzIFVzZXJCbG9jayAmIHsgYXR0YWNobWVudDogSW1hZ2VBdHRhY2htZW50UmVmIH0gPT4gYi50eXBlID09PSAnaW1hZ2UnICYmIGIuYXR0YWNobWVudCAhPT0gdW5kZWZpbmVkKSxcbiAgICBbY29udGVudF0sXG4gIClcbiAgY29uc3QgcGtnID0gdXNlTWVtbygoKSA9PiAoaXNSZXZpZXdQYWNrYWdlVGV4dCh0ZXh0KSA/IHBhcnNlUmV2aWV3UGFja2FnZSh0ZXh0KSA6IG51bGwpLCBbdGV4dF0pXG4gIGlmIChwa2cpIHtcbiAgICByZXR1cm4gPFJldmlld1BhY2thZ2VDYXJkIHBrZz17cGtnfSBjd2Q9e3Byb3BzLmN3ZH0gdD17cHJvcHMudH0gLz5cbiAgfVxuICByZXR1cm4gPEZhbGxiYWNrVXNlckJ1YmJsZSB0ZXh0PXt0ZXh0fSBpbWFnZXM9e2ltYWdlc30gbG9hZEltYWdlPXtwcm9wcy5sb2FkSW1hZ2V9IHQ9e3Byb3BzLnR9IC8+XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29tcG9zZXIgZG9jayAoc2Vzc2lvbiBzY29wZSk6IHBlbmRpbmcgaW5saW5lIGNvbW1lbnRzIGZsb2F0IGFib3ZlIHRoZVxuLy8gaW5wdXQgYm94LCBDb2RleC1zdHlsZSBcdTIwMTQgaG92ZXIgdGhlIHBpbGwgdG8gcHJldmlldywgY2xpY2sgc2VuZCB0byBpbmplY3QuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudHlwZSBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrUHJvcHMgPSBQcm9wc1J1bnRpbWU8J2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPiAmIHsgc2Vzc2lvbnM6IElTZXNzaW9ucyB9XG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb21wb3NlckRvY2soeyBzZXNzaW9uSWQsIHVzZVNlc3Npb25zLCBzZXNzaW9ucywgdCB9OiBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrUHJvcHMpIHtcbiAgY29uc3QgY3dkID0gdXNlU2Vzc2lvbnMoKHM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IHBlbmRpbmcgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwZW5kaW5nQ29tbWVudHNTdG9yZS5zdWJzY3JpYmUsIHBlbmRpbmdDb21tZW50c1N0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBbZGlzbWlzc2VkLCBzZXREaXNtaXNzZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYXJyeUZsYXNoLCBzZXRDYXJyeUZsYXNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGNhcnJ5aW5nID0gdXNlUmVmKGZhbHNlKVxuXG4gIC8vIFNlZWQgdGhlIHN0b3JlIGZyb20gc2VydmVyIHN0b3JhZ2Ugd2hlbiBub3RoaW5nIGhhcyBiZWVuIHN5bmNlZCBmb3IgdGhpc1xuICAvLyB3b3Jrc3BhY2UgeWV0IChwYW5lbCBuZXZlciBvcGVuZWQgdGhpcyBzZXNzaW9uIFx1MjAxNCBjb21tZW50cyBwZXJzaXN0IGluIC5naXQpLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY3dkIHx8IHBlbmRpbmcuY3dkID09PSBjd2QpIHJldHVyblxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZVxuICAgIHZvaWQgbG9hZENvbW1lbnRzKGN3ZCkudGhlbigobGlzdCkgPT4ge1xuICAgICAgaWYgKGNhbmNlbGxlZCkgcmV0dXJuXG4gICAgICBwZW5kaW5nQ29tbWVudHNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgaWYgKGQuY3dkID09PSBjd2QpIHJldHVyblxuICAgICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgICBkLmNvbW1lbnRzID0gbGlzdFxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjYW5jZWxsZWQgPSB0cnVlXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW2N3ZCwgcGVuZGluZy5jd2RdKVxuXG4gIGNvbnN0IGNvbW1lbnRzID0gcGVuZGluZy5jd2QgPT09IGN3ZCA/IHBlbmRpbmcuY29tbWVudHMgOiBbXVxuICBjb25zdCBzZW50U25hcCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHNlbnRTdG9yZS5zdWJzY3JpYmUsIHNlbnRTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3Qgc2VudCA9IChjd2QgJiYgc2VudFNuYXBbY3dkXSkgfHwgeyBzZW50Q29tbWVudElkczogW10sIHNlbnRSZXZpZXdLZXk6IG51bGwgfVxuICBjb25zdCBzZW50U2V0ID0gbmV3IFNldChzZW50LnNlbnRDb21tZW50SWRzKVxuICBjb25zdCB1bnNlbnRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gIXNlbnRTZXQuaGFzKGMuaWQpKVxuICBjb25zdCByZXZpZXdLZXkgPVxuICAgIHBlbmRpbmcucmV2aWV3Py5vayAmJiAocGVuZGluZy5yZXZpZXcuZmluZGluZ3MubGVuZ3RoID4gMCB8fCBwZW5kaW5nLnJldmlldy52ZXJkaWN0KVxuICAgICAgPyBgJHtwZW5kaW5nLnJldmlldy52ZXJkaWN0ID8/ICcnfToke3BlbmRpbmcucmV2aWV3LmZpbmRpbmdzLmxlbmd0aH06JHtwZW5kaW5nLnJldmlldy5maW5kaW5nc1swXT8udGl0bGUgPz8gJyd9YFxuICAgICAgOiBudWxsXG4gIGNvbnN0IHJldmlld1BlbmRpbmcgPSByZXZpZXdLZXkgIT09IG51bGwgJiYgcmV2aWV3S2V5ICE9PSBzZW50LnNlbnRSZXZpZXdLZXlcbiAgY29uc3QgaGFzUGVuZGluZyA9IHVuc2VudENvbW1lbnRzLmxlbmd0aCA+IDAgfHwgcmV2aWV3UGVuZGluZ1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFoYXNQZW5kaW5nKSB7XG4gICAgICBzZXREaXNtaXNzZWQoZmFsc2UpXG4gICAgfVxuICB9LCBbaGFzUGVuZGluZ10pXG5cbiAgLyoqIENvbXBvc2UgdGhlIGZ1bGwgcmV2aWV3IHBhY2thZ2U6IGNvbW1lbnRzICsgdGhlaXIgZGlmZiBodW5rcyArIEFJIHZlcmRpY3QuICovXG4gIGNvbnN0IGNvbXBvc2VDYXJyaWVkTWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFsnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJywgYFx1NURFNVx1NEY1Q1x1NTMzQVx1RkYxQSR7Y3dkfWAsICcnXVxuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdDb21tZW50W10+KClcbiAgICBmb3IgKGNvbnN0IGMgb2YgdW5zZW50Q29tbWVudHMpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBieVBhdGguZ2V0KGMucGF0aClcbiAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goYylcbiAgICAgIGVsc2UgYnlQYXRoLnNldChjLnBhdGgsIFtjXSlcbiAgICB9XG4gICAgZm9yIChjb25zdCBbcGF0aCwgbGlzdF0gb2YgYnlQYXRoKSB7XG4gICAgICBsaW5lcy5wdXNoKGAjIyAke3BhdGh9YClcbiAgICAgIGZvciAoY29uc3QgYyBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IGFuY2hvciA9IGMubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjLmxpbmVOZXd9YCA6IGAgKG9sZCBsaW5lICR7Yy5saW5lT2xkfSlgXG4gICAgICAgIC8vIE9yaWdpbiB0YWIgdGFnIHNvIHRoZSBjb252ZXJzYXRpb24gY2FyZCByb3V0ZXMgaXRzIGp1bXAgKCdzJyA9XG4gICAgICAgIC8vIHNlc3Npb24gcmVsYXRpdmUgaHVuayBsaW5lcywgJ3cnID0gd29ya3NwYWNlIHJlYWwgbGluZXMpLlxuICAgICAgICBjb25zdCB0YWcgPSBjLnNvdXJjZSA9PT0gJ3Nlc3Npb24nID8gJ1tzXScgOiAnW3ddJ1xuICAgICAgICBsaW5lcy5wdXNoKGAtICR7dGFnfSAke3BhdGh9JHthbmNob3J9OiAke2MudGV4dH1gKVxuICAgICAgfVxuICAgICAgY29uc3QgaHVua3MgPSBodW5rc0ZvckxpbmVzKHBlbmRpbmcuZGlmZnNbcGF0aF0gPz8gJycsIGxpc3QubWFwKChjKSA9PiBjLmxpbmVOZXcgPz8gYy5saW5lT2xkKSlcbiAgICAgIGlmIChodW5rcykge1xuICAgICAgICBsaW5lcy5wdXNoKCdgYGBkaWZmJylcbiAgICAgICAgbGluZXMucHVzaChodW5rcylcbiAgICAgICAgbGluZXMucHVzaCgnYGBgJylcbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpXG4gICAgfVxuICAgIGlmIChyZXZpZXdQZW5kaW5nICYmIHBlbmRpbmcucmV2aWV3KSB7XG4gICAgICBsaW5lcy5wdXNoKCcjIyBBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkEnKVxuICAgICAgbGluZXMucHVzaChwZW5kaW5nLnJldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/ICdcdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OThcdUZGMDhQYXRjaCBpcyBpbmNvcnJlY3RcdUZGMDknIDogJ1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RVx1RkYwOFBhdGNoIGlzIGNvcnJlY3RcdUZGMDknKVxuICAgICAgZm9yIChjb25zdCBmIG9mIHBlbmRpbmcucmV2aWV3LmZpbmRpbmdzKSB7XG4gICAgICAgIGxpbmVzLnB1c2goYC0gWyR7Zi5wcmlvcml0eX1dICR7Zi5maWxlfToke2YubGluZVN0YXJ0fSR7Zi5saW5lRW5kICE9PSBmLmxpbmVTdGFydCA/IGAtJHtmLmxpbmVFbmR9YCA6ICcnfSAke2YudGl0bGV9IFx1MjAxNCAke2YuZGV0YWlsfWApXG4gICAgICAgIGlmIChmLnN1Z2dlc3Rpb24pIGxpbmVzLnB1c2goYCAgXFxgXFxgXFxgXFxuJHtmLnN1Z2dlc3Rpb259XFxuICBcXGBcXGBcXGBgKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJykuc2xpY2UoMCwgMTYwMDApXG4gIH1cblxuICAvKiogTWFyayB0aGUgY2FycmllZCBpdGVtcyBhcyBzZW50IHNvIHRoZXkgYXJlIG5ldmVyIHJlLXNlbnQgKHBlcnNpc3RlZCBwZXIgY3dkKS4gKi9cbiAgY29uc3QgbWFya1NlbnQgPSAoKSA9PiB7XG4gICAgaWYgKCFjd2QpIHJldHVyblxuICAgIGNvbnN0IGNhcnJpZWRJZHMgPSB1bnNlbnRDb21tZW50cy5tYXAoKGMpID0+IGMuaWQpXG4gICAgc2VudFN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgY29uc3QgcHJldiA9IGRbY3dkXSA/PyB7IHNlbnRDb21tZW50SWRzOiBbXSwgc2VudFJldmlld0tleTogbnVsbCB9XG4gICAgICBkW2N3ZF0gPSB7XG4gICAgICAgIHNlbnRDb21tZW50SWRzOiBbLi4ubmV3IFNldChbLi4ucHJldi5zZW50Q29tbWVudElkcywgLi4uY2FycmllZElkc10pXSxcbiAgICAgICAgc2VudFJldmlld0tleTogcmV2aWV3UGVuZGluZyA/IHJldmlld0tleSA6IHByZXYuc2VudFJldmlld0tleSxcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqIFNlbmQgdGhlIHBlbmRpbmcgcmV2aWV3IHBhY2thZ2Ugbm93IChleHBsaWNpdCBjbGljayBvbmx5IFx1MjAxNCBuZXZlciBhdXRvLWNhcnJpZWQpLiAqL1xuICBjb25zdCBjYXJyeSA9ICgpID0+IHtcbiAgICBpZiAoIWhhc1BlbmRpbmcgfHwgY2FycnlpbmcuY3VycmVudCkgcmV0dXJuXG4gICAgY2FycnlpbmcuY3VycmVudCA9IHRydWVcbiAgICB2b2lkIGluamVjdFRvU2Vzc2lvbihzZXNzaW9ucywgc2Vzc2lvbklkLCBjb21wb3NlQ2FycmllZE1lc3NhZ2UoKSkudGhlbigob3V0Y29tZSkgPT4ge1xuICAgICAgaWYgKG91dGNvbWUgIT09ICdmYWlsZWQnKSBtYXJrU2VudCgpXG4gICAgICBjYXJyeWluZy5jdXJyZW50ID0gZmFsc2VcbiAgICAgIHNldENhcnJ5Rmxhc2gob3V0Y29tZSA9PT0gJ3NlbnQnID8gdCgncmV2aWV3LnNlbnRUb0FnZW50JykgOiBvdXRjb21lID09PSAnY29waWVkJyA/IHQoJ3Jldmlldy5jb3BpZWRGYWxsYmFjaycpIDogdCgncmV2aWV3LnNlbmRGYWlsZWQnKSlcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q2FycnlGbGFzaChudWxsKSwgMzIwMClcbiAgICB9KVxuICB9XG5cbiAgaWYgKCFjd2QgfHwgKCFoYXNQZW5kaW5nICYmICFjYXJyeUZsYXNoKSB8fCBkaXNtaXNzZWQpIHJldHVybiBudWxsXG5cbiAgLyoqIE9wZW4gdGhlIHJldmlldyBwYW5lbCBhdCB0aGUgY29tbWVudCdzIGNoYW5nZSBibG9jay4gKi9cbiAgY29uc3QgZm9jdXNDb21tZW50ID0gKGNvbW1lbnQ6IFJldmlld0NvbW1lbnQpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5mb2N1cyA9IHtcbiAgICAgICAgcGF0aDogY29tbWVudC5wYXRoLFxuICAgICAgICBsaW5lOiBjb21tZW50LmxpbmVOZXcgPz8gY29tbWVudC5saW5lT2xkID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGFiOiBjb21tZW50LnNvdXJjZSA9PT0gJ3Nlc3Npb24nID8gJ3Nlc3Npb24nIDogJ3dvcmtzcGFjZScsXG4gICAgICB9XG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cblxuICAvKiogT3BlbiB0aGUgcmV2aWV3IHBhbmVsIHdpdGhvdXQgYSBqdW1wIHRhcmdldCAoK04gY2hpcCkuICovXG4gIGNvbnN0IG9wZW5QYW5lbCA9ICgpID0+IHtcbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5mb2N1cyA9IG51bGxcbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2tcIj5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWhlYWRcIlxuICAgICAgICByb2xlPVwiYnV0dG9uXCJcbiAgICAgICAgdGFiSW5kZXg9ezB9XG4gICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuZG9ja1NlbmQnKX1cbiAgICAgICAgb25DbGljaz17Y2Fycnl9XG4gICAgICAgIG9uS2V5RG93bj17KGUpID0+IHtcbiAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFbnRlcicgfHwgZS5rZXkgPT09ICcgJykge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBjYXJyeSgpXG4gICAgICAgICAgfVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2staWNvblwiPjxJY29uQ29tbWVudCAvPjwvc3Bhbj5cbiAgICAgICAge2NhcnJ5Rmxhc2ggPyAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWZsYXNoXCI+e2NhcnJ5Rmxhc2h9PC9zcGFuPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1jb3VudFwiPlxuICAgICAgICAgICAge3QoJ3Jldmlldy5kb2NrQ29tbWVudHMnLCB7IG46IHVuc2VudENvbW1lbnRzLmxlbmd0aCB9KX1cbiAgICAgICAgICAgIHtyZXZpZXdQZW5kaW5nID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuZG9ja1ZlcmRpY3QnKX1gIDogJyd9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICApfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1zZW5kLWhpbnRcIj57dCgncmV2aWV3LmRvY2tTZW5kJyl9PC9zcGFuPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNsb3NlXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPXt0KCdjb21tZW50LmNhbmNlbCcpfVxuICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBzZXREaXNtaXNzZWQodHJ1ZSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEljb25YIC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgICB7dW5zZW50Q29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2hpcHNcIj5cbiAgICAgICAgICB7dW5zZW50Q29tbWVudHMuc2xpY2UoMCwgTUFYX0RPQ0tfQ0hJUFMpLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e2NvbW1lbnQuaWR9XG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2hpcFwiXG4gICAgICAgICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuZG9ja0p1bXAnKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZm9jdXNDb21tZW50KGNvbW1lbnQpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2hpcC1sb2NcIj57Y29tbWVudC5wYXRofXtjb21tZW50LmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Y29tbWVudC5saW5lTmV3fWAgOiAnJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwLXRleHRcIj57Y29tbWVudC50ZXh0fTwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkpfVxuICAgICAgICAgIHt1bnNlbnRDb21tZW50cy5sZW5ndGggPiBNQVhfRE9DS19DSElQUyA/IChcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwLW1vcmVcIiB0aXRsZT17dCgncmV2aWV3LmRvY2tNb3JlJywgeyBuOiB1bnNlbnRDb21tZW50cy5sZW5ndGggLSBNQVhfRE9DS19DSElQUyB9KX0gb25DbGljaz17b3BlblBhbmVsfT5cbiAgICAgICAgICAgICAgK3t1bnNlbnRDb21tZW50cy5sZW5ndGggLSBNQVhfRE9DS19DSElQU31cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IG92ZXJsYXkgKHJvb3Qgc2NvcGUpOiBzZXNzaW9uICsgd29ya3NwYWNlIHRhYnMuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gRGlmZlJldmlld092ZXJsYXkoeyBzZXNzaW9ucywgdCB9OiBEaWZmUmV2aWV3T3ZlcmxheVByb3BzKSB7XG4gIGNvbnN0IHN0b3JlU3RhdGUgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShvdmVybGF5U3RvcmUuc3Vic2NyaWJlLCBvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IHByZWZzID0gdXNlU3luY0V4dGVybmFsU3RvcmUocHJlZnNTdG9yZS5zdWJzY3JpYmUsIHByZWZzU3RvcmUuZ2V0U25hcHNob3QpXG4gIC8vIEdpdC1maXJzdDogbGFuZCBvbiB0aGUgd29ya3NwYWNlIHRhYiAoc3RhZ2VkL3Vuc3RhZ2VkL2JyYW5jaCB0cmVlcykgc28gdGhlXG4gIC8vIGNoYW5nZSByZXZpZXcgaXMgb25lIGNsaWNrIGF3YXk7IHRoZSBzZXNzaW9uIHRhYiBzdGF5cyBhIGNsaWNrIGF3YXkuXG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSB1c2VTdGF0ZTwnc2Vzc2lvbicgfCAnd29ya3NwYWNlJz4oJ3dvcmtzcGFjZScpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IHVzZVN0YXRlPFZpZXdNb2RlPigoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0eXBlb2YgbG9jYWxTdG9yYWdlICE9PSAndW5kZWZpbmVkJyAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZHNkci12aWV3JykgPT09ICdzcGxpdCcgPyAnc3BsaXQnIDogJ3NpbmdsZSdcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiAnc2luZ2xlJ1xuICAgIH1cbiAgfSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2RzZHItdmlldycsIHZpZXcpXG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBwcml2YXRlIG1vZGUgLyB1bmF2YWlsYWJsZSBcdTIwMTQgbm9uLWZhdGFsXG4gICAgfVxuICB9LCBbdmlld10pXG5cbiAgLy8gV29ya3NwYWNlIHRhYiBzdGF0ZS5cbiAgY29uc3QgW3N0YXR1cywgc2V0U3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWQsIHNldFNlbGVjdGVkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbYnVzeSwgc2V0QnVzeV0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW25vdGljZSwgc2V0Tm90aWNlXSA9IHVzZVN0YXRlPHsga2luZDogJ29rJyB8ICdlcnJvcic7IHRleHQ6IHN0cmluZyB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbmZpcm0sIHNldENvbmZpcm1dID0gdXNlU3RhdGU8J2ZpbGUnIHwgJ2FsbCcgfCAncHVzaCcgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0TWVzc2FnZSwgc2V0Q29tbWl0TWVzc2FnZV0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2NvbW1pdE9wZW4sIHNldENvbW1pdE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtpbmNsdWRlVW5zdGFnZWQsIHNldEluY2x1ZGVVbnN0YWdlZF0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgLy8gTG9jYWwgKHVucHVzaGVkKSBjb21taXQgaGlzdG9yeTogbGlzdCArIHBlci1jb21taXQgZGlmZiB2aWV3LlxuICBjb25zdCBbaGlzdG9yeSwgc2V0SGlzdG9yeV0gPSB1c2VTdGF0ZTxDb21taXRJbmZvW10+KFtdKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXQsIHNldFNlbGVjdGVkQ29tbWl0XSA9IHVzZVN0YXRlPENvbW1pdEluZm8gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZiwgc2V0Q29tbWl0RGlmZl0gPSB1c2VTdGF0ZTxDb21taXREaWZmUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWl0RGlmZkxvYWRpbmcsIHNldENvbW1pdERpZmZMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VsZWN0ZWRDb21taXRGaWxlLCBzZXRTZWxlY3RlZENvbW1pdEZpbGVdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgLy8gSW5saW5lIHJldmlldyBjb21tZW50cyAod29ya3NwYWNlIHRhYiwgc2luZ2xlIHZpZXcpLlxuICBjb25zdCBbY29tbWVudHMsIHNldENvbW1lbnRzXSA9IHVzZVN0YXRlPFJldmlld0NvbW1lbnRbXT4oW10pXG4gIGNvbnN0IFtjb21tZW50RWRpdG9yLCBzZXRDb21tZW50RWRpdG9yXSA9IHVzZVN0YXRlPHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1lbnRUZXh0LCBzZXRDb21tZW50VGV4dF0gPSB1c2VTdGF0ZSgnJylcbiAgLy8gUmV2aWV3IHNjb3BlOiB3aGljaCBzbGljZSBvZiB0aGUgcmVwb3NpdG9yeSB0aGUgd29ya3NwYWNlIHRhYiBzaG93cy5cbiAgY29uc3QgW3Njb3BlLCBzZXRTY29wZV0gPSB1c2VTdGF0ZTxXb3Jrc3BhY2VTY29wZT4oJ2xhc3QtdHVybicpXG4gIGNvbnN0IFticmFuY2hlcywgc2V0QnJhbmNoZXNdID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKVxuICBjb25zdCBbYmFzZUJyYW5jaCwgc2V0QmFzZUJyYW5jaF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbYmFzZVN0YXR1cywgc2V0QmFzZVN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIC8vIEZlZWRiYWNrIGxvb3A6IHNlbmQgaW5saW5lIGNvbW1lbnRzIHRvIHRoZSBhZ2VudCAoc2Vzc2lvbi5wcm9tcHQsIGNvcHkgZmFsbGJhY2spLlxuICBjb25zdCBbc2VuZE9wZW4sIHNldFNlbmRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2VuZFRleHQsIHNldFNlbmRUZXh0XSA9IHVzZVN0YXRlKCcnKVxuICAvLyBBSSByZXZpZXcgKC9yZXZpZXcpOiBmaW5kaW5ncyArIHZlcmRpY3QuXG4gIGNvbnN0IFtyZXZpZXcsIHNldFJldmlld10gPSB1c2VTdGF0ZTxSZXZpZXdSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtyZXZpZXdpbmcsIHNldFJldmlld2luZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgLy8gR2l0SHViIFBSIGNvbnRleHQgKGdoIENMSSkuXG4gIGNvbnN0IFtwciwgc2V0UHJdID0gdXNlU3RhdGU8UHJSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIC8vIE11bHRpLXJlcG86IHJlcG9zIGRldGVjdGVkIHVuZGVyIHRoZSB3b3Jrc3BhY2UgKyB0aGUgc2VsZWN0ZWQgb25lLlxuICBjb25zdCBbcmVwb3MsIHNldFJlcG9zXSA9IHVzZVN0YXRlPHsgcGF0aDogc3RyaW5nOyBicmFuY2g6IHN0cmluZyB8IG51bGwgfVtdPihbXSlcbiAgY29uc3QgW3JlcG9QYXRoLCBzZXRSZXBvUGF0aF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbc3VyZmFjZSwgc2V0U3VyZmFjZV0gPSB1c2VTdGF0ZTwncmV2aWV3JyB8ICdmaWxlcyc+KCdyZXZpZXcnKVxuICAvLyBUZW1wb3JhcnkgbGluZSBoaWdobGlnaHQgKGp1bXAgdGFyZ2V0IGZyb20gYSBQUiBjb21tZW50IG9yIGEgZmluZGluZykuXG4gIGNvbnN0IFtqdW1wTGluZSwgc2V0SnVtcExpbmVdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcblxuICAvKiogU2VsZWN0IGEgZmlsZSBhbmQgZmxhc2ggaXRzIGxpbmUgKGZpbmRpbmdzIC8gUFIgY29tbWVudHMpLiAqL1xuICBjb25zdCBqdW1wVG8gPSAoZmlsZTogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWQoZmlsZSlcbiAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICBzZXRKdW1wTGluZShsaW5lID8/IG51bGwpXG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgfVxuICAvLyBDb2xsYXBzZWQgZGlyZWN0b3JpZXMgaW4gdGhlIGxlZnQtaGFuZCBmaWxlIHRyZWUgKHNoYXJlZCBhY3Jvc3MgdGFicykuXG4gIGNvbnN0IFtjb2xsYXBzZWREaXJzLCBzZXRDb2xsYXBzZWREaXJzXSA9IHVzZVN0YXRlPFJlYWRvbmx5U2V0PHN0cmluZz4+KCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgdG9nZ2xlRGlyID0gdXNlTWVtbyhcbiAgICAoKSA9PiAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBzZXRDb2xsYXBzZWREaXJzKChwcmV2KSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpXG4gICAgICAgIGlmIChuZXh0LmhhcyhwYXRoKSkgbmV4dC5kZWxldGUocGF0aClcbiAgICAgICAgZWxzZSBuZXh0LmFkZChwYXRoKVxuICAgICAgICByZXR1cm4gbmV4dFxuICAgICAgfSlcbiAgICB9LFxuICAgIFtdLFxuICApXG4gIGNvbnN0IG5vdGljZVRpbWVyID0gdXNlUmVmPFJldHVyblR5cGU8dHlwZW9mIHNldFRpbWVvdXQ+IHwgdW5kZWZpbmVkPih1bmRlZmluZWQpXG5cbiAgLy8gQ3VycmVudCBzZXNzaW9uJ3MgY29udmVyc2F0aW9uIHNuYXBzaG90IChyZWFjdGl2ZSksIGZvciB0aGUgc2Vzc2lvbiB0YWIuXG4gIGNvbnN0IGN1cnJlbnRJZCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4gKG5vdGlmeTogKCkgPT4gdm9pZCkgPT4gc2Vzc2lvbnMubGlzdC5zdWJzY3JpYmUobm90aWZ5KSwgW3Nlc3Npb25zXSksXG4gICAgdXNlTWVtbygoKSA9PiAoKSA9PiBzZXNzaW9ucy5saXN0LmdldFNuYXBzaG90KCkuY3VycmVudCwgW3Nlc3Npb25zXSksXG4gIClcbiAgY29uc3Qgc25hcHNob3QgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgaWYgKCFiaW5kaW5nKSByZXR1cm4gKCkgPT4ge31cbiAgICAgICAgcmV0dXJuIGJpbmRpbmcuc2Vzc2lvbi5zdWJzY3JpYmUobm90aWZ5KVxuICAgICAgfVxuICAgIH0sIFtzZXNzaW9ucywgY3VycmVudElkXSksXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICAgIHJldHVybiBiaW5kaW5nID8gYmluZGluZy5zZXNzaW9uLmdldFNuYXBzaG90KCkgOiBudWxsXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgKVxuXG4gIGNvbnN0IHJvdW5kcyA9IHVzZU1lbW8oKCkgPT4gKHNuYXBzaG90ID8gY29sbGVjdFNlc3Npb25Sb3VuZHMoc25hcHNob3Qubm9kZXMpIDogW10pLCBbc25hcHNob3RdKVxuICAvLyBEaWFnbm9zdGljcyBmb3IgdGhlIGVtcHR5IHNlc3Npb24tY2hhbmdlcyBzdGF0ZTogd2hhdCB0aGUgc25hcHNob3Qgc2NhbiBmb3VuZC5cbiAgY29uc3Qgc2Vzc2lvblNjYW4gPSB1c2VNZW1vKCgpID0+IHtcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm4gbnVsbFxuICAgIGxldCByZXN1bHRzID0gMFxuICAgIGxldCBkaWZmQ2FyZHMgPSAwXG4gICAgbGV0IHBhdGhPbmx5ID0gMFxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBzbmFwc2hvdC5ub2Rlcykge1xuICAgICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JykgY29udGludWVcbiAgICAgIHJlc3VsdHMrK1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpXG4gICAgICBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGlmIChjaGFuZ2VzLnNvbWUoKHgpID0+IHguaGFzRGlmZikpIGRpZmZDYXJkcysrXG4gICAgICAgIGVsc2UgcGF0aE9ubHkrK1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyByZXN1bHRzLCBkaWZmQ2FyZHMsIHBhdGhPbmx5IH1cbiAgfSwgW3NuYXBzaG90XSlcbiAgLy8gTGVmdC1oYW5kIGZpbGUgdHJlZXM6IHBlci1yb3VuZCB0cmVlcyBmb3IgdGhlIHNlc3Npb24gdGFiLCBvbmUgdHJlZSBmb3JcbiAgLy8gdGhlIGdpdCB3b3JraW5nIHRyZWUgb24gdGhlIHdvcmtzcGFjZSB0YWIuXG4gIGNvbnN0IHNlc3Npb25UcmVlcyA9IHVzZU1lbW8oKCkgPT4gbmV3IE1hcChyb3VuZHMubWFwKChyKSA9PiBbci5yb3VuZCwgYnVpbGRGaWxlVHJlZShyLmNoYW5nZXMsIChjKSA9PiBjLnBhdGgpXSkpLCBbcm91bmRzXSlcbiAgY29uc3QgdG90YWxTZXNzaW9uRmlsZXMgPSB1c2VNZW1vKCgpID0+IHJvdW5kcy5yZWR1Y2UoKG4sIHIpID0+IG4gKyByLmNoYW5nZXMubGVuZ3RoLCAwKSwgW3JvdW5kc10pXG4gIGNvbnN0IFtzZWxlY3RlZFJvdW5kLCBzZXRTZWxlY3RlZFJvdW5kXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzZWxlY3RlZFBhdGgsIHNldFNlbGVjdGVkUGF0aF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBzZWxlY3RlZENoYW5nZSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IHJvdW5kID0gcm91bmRzLmZpbmQoKHIpID0+IHIucm91bmQgPT09IHNlbGVjdGVkUm91bmQpXG4gICAgcmV0dXJuIHJvdW5kPy5jaGFuZ2VzLmZpbmQoKGMpID0+IGMucGF0aCA9PT0gc2VsZWN0ZWRQYXRoKSA/PyBudWxsXG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmQsIHNlbGVjdGVkUGF0aF0pXG4gIC8qKiBMYXN0IFR1cm4gaXMgc291cmNlZCBmcm9tIHBlcnNpc3RlZCBzZXNzaW9uIGRpZmZzLCBub3QgdGhlIGFjdGl2ZSBnaXQgcmVwby4gKi9cbiAgY29uc3QgbGFzdFR1cm5GaWxlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGNvbnN0IGxhc3QgPSByb3VuZHMuYXQoLTEpXG4gICAgcmV0dXJuIGxhc3QgPyBsYXN0LmNoYW5nZXMuZmlsdGVyKChjaGFuZ2UpID0+IGNoYW5nZS5oYXNEaWZmKS5tYXAoc2Vzc2lvbkNoYW5nZVRvRGlmZkZpbGUpIDogW11cbiAgfSwgW3JvdW5kc10pXG5cbiAgY29uc3QgY3dkID0gc3RvcmVTdGF0ZS5jd2RcbiAgLyoqIEFjdGl2ZSBnaXQgcmVwbyBmb3Igd29ya3NwYWNlIG9wZXJhdGlvbnMgKG11bHRpLXJlcG8gc2VsZWN0b3Igb3ZlcnJpZGUpLiAqL1xuICBjb25zdCBhY3RpdmVDd2QgPSByZXBvUGF0aCA/PyBjd2RcblxuICBjb25zdCBsb2FkV29ya3NwYWNlID0gYXN5bmMgKHNpbGVudCA9IGZhbHNlKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QpIHJldHVyblxuICAgIGlmICghc2lsZW50KSBzZXRMb2FkaW5nKHRydWUpXG4gICAgc2V0RXJyb3IobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgW25leHQsIGhpc3QsIG5leHRDb21tZW50cywgYnJhbmNoTGlzdCwgcHJEYXRhLCByZXBvTGlzdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGxvYWRTdGF0dXMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEhpc3RvcnkoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZENvbW1lbnRzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRCcmFuY2hlcyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUHIoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZFJlcG9zKGFjdGl2ZUN3ZCksXG4gICAgICBdKVxuICAgICAgc2V0U3RhdHVzKG5leHQpXG4gICAgICBpZiAoaGlzdC5vaykgc2V0SGlzdG9yeShoaXN0LmNvbW1pdHMpXG4gICAgICBzZXRDb21tZW50cyhuZXh0Q29tbWVudHMpXG4gICAgICBzZXRCcmFuY2hlcyhicmFuY2hMaXN0KVxuICAgICAgc2V0UHIocHJEYXRhKVxuICAgICAgc2V0UmVwb3MocmVwb0xpc3QucmVwb3MpXG4gICAgICAvLyBEZWZhdWx0IHRoZSByZXBvIHNlbGVjdG9yIHRvIHRoZSB3b3Jrc3BhY2Ugcm9vdCB3aGVuIGl0IGlzIGl0c2VsZiBhIHJlcG8uXG4gICAgICBpZiAocmVwb1BhdGggPT09IG51bGwgJiYgIXJlcG9MaXN0LnJlcG9zLnNvbWUoKHIpID0+IHIucGF0aCA9PT0gYWN0aXZlQ3dkKSkge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHJlcG9MaXN0LnJlcG9zWzBdXG4gICAgICAgIGlmIChmaXJzdCAmJiBmaXJzdC5wYXRoICE9PSBjd2QpIHNldFJlcG9QYXRoKGZpcnN0LnBhdGgpXG4gICAgICB9XG4gICAgICBpZiAobmV4dC5lcnJvciAmJiAhbmV4dC5pc1JlcG8pIHNldEVycm9yKG5leHQuZXJyb3IpXG4gICAgICBzZXRTZWxlY3RlZCgocHJldikgPT4gKHByZXYgJiYgbmV4dC5maWxlcy5zb21lKChmKSA9PiBmLnBhdGggPT09IHByZXYpID8gcHJldiA6IG5leHQuZmlsZXNbMF0/LnBhdGggPz8gbnVsbCkpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0RXJyb3IoZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogU3RyaW5nKGUpKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIEF1dG8tcmVmcmVzaCB0aGUgd29ya3NwYWNlIGRhdGE6IHJlbG9hZCB3aGVuZXZlciB0aGUgdGFiIGJlY29tZXMgYWN0aXZlIG9yXG4gIC8vIHRoZSB3b3Jrc3BhY2UgY2hhbmdlcywgYW5kIHBlcmlvZGljYWxseSB3aGlsZSB0aGUgb3ZlcmxheSBpcyBvcGVuLiBBXG4gIC8vIHdvcmtzcGFjZSBzd2l0Y2ggY2xlYXJzIHN0YWxlIGNvbW1pdCBzZWxlY3Rpb24gYW5kIGhpc3RvcnkgZmlyc3QuXG4gIGNvbnN0IHdvcmtzcGFjZUN3ZFJlZiA9IHVzZVJlZjxzdHJpbmcgfCBudWxsPihudWxsKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHByZXZpb3VzID0gd29ya3NwYWNlQ3dkUmVmLmN1cnJlbnRcbiAgICB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudCA9IGFjdGl2ZUN3ZCA/PyBudWxsXG4gICAgaWYgKHRhYiAhPT0gJ3dvcmtzcGFjZScgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKHByZXZpb3VzICE9PSBhY3RpdmVDd2QpIHtcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICAgIHNldEhpc3RvcnkoW10pXG4gICAgICBzZXRDb21tZW50cyhbXSlcbiAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgIHNldFJldmlldyhudWxsKVxuICAgICAgc2V0UHIobnVsbClcbiAgICB9XG4gICAgdm9pZCBsb2FkV29ya3NwYWNlKClcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFt0YWIsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gU3VyZmFjZSB3b3Jrc3BhY2UgY29tbWVudHMgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSBkb2NrKSwgYWxvbmdcbiAgLy8gd2l0aCB0aGUgZGlmZiBjb250ZXh0IGFuZCB0aGUgbGFzdCBBSSByZXZpZXcgcmVzdWx0LlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHBlbmRpbmdDb21tZW50c1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5jd2QgPSBhY3RpdmVDd2QgPz8gbnVsbFxuICAgICAgZC5jb21tZW50cyA9IGNvbW1lbnRzXG4gICAgICBjb25zdCBkaWZmczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG4gICAgICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHN0YXR1cz8uZmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBjLnBhdGgpXG4gICAgICAgIGlmIChmaWxlPy5kaWZmKSBkaWZmc1tjLnBhdGhdID0gZmlsZS5kaWZmXG4gICAgICB9XG4gICAgICBkLmRpZmZzID0gZGlmZnNcbiAgICAgIGQucmV2aWV3ID0gcmV2aWV3XG4gICAgfSlcbiAgfSwgW2NvbW1lbnRzLCBhY3RpdmVDd2QsIHN0YXR1cywgcmV2aWV3XSlcblxuICAvLyBKdW1wIHRvIGEgY2hhbmdlIGJsb2NrIGZyb20gdGhlIGNvbXBvc2VyIGRvY2sgKGNvbW1lbnQgY2xpY2spLiBDb21tZW50c1xuICAvLyBjcmVhdGVkIGluIHRoZSBzZXNzaW9uIHRhYiBhbmNob3IgdG8gUkVMQVRJVkUgaHVuayBsaW5lcywgc28gdGhvc2UganVtcHNcbiAgLy8gc3RheSBpbiB0aGUgc2Vzc2lvbiB0YWI7IHdvcmtzcGFjZSBjb21tZW50cyBqdW1wIHRvIHJlYWwgZmlsZSBsaW5lcy5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmb2N1cyA9IHN0b3JlU3RhdGUuZm9jdXNcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkIHx8ICFmb2N1cykgcmV0dXJuXG4gICAgaWYgKGZvY3VzLnRhYiA9PT0gJ3Nlc3Npb24nKSB7XG4gICAgICAvLyBSZXBseSBjYXJkcyBhbHdheXMgb3BlbiB0aGUgc2FtZSBMYXN0IFR1cm4gdmlldzsgaXQgaXMgaW50ZW50aW9uYWxseVxuICAgICAgLy8gaW5kZXBlbmRlbnQgZnJvbSB0aGUgYWN0aXZlIEdpdCByZXBvc2l0b3J5IHNlbGVjdGlvbi5cbiAgICAgIHNldFRhYignd29ya3NwYWNlJylcbiAgICAgIHNldFNjb3BlKCdsYXN0LXR1cm4nKVxuICAgICAgc2V0U2VsZWN0ZWQoZm9jdXMucGF0aClcbiAgICAgIHNldEp1bXBMaW5lKGZvY3VzLmxpbmUgPz8gbnVsbClcbiAgICAgIGNvbnN0IHNjcm9sbFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmIChmb2N1cy5saW5lICE9IG51bGwpIHtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kc2RyLWxpbmU9XCIke2ZvY3VzLmxpbmV9XCJdYCk/LnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdjZW50ZXInLCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgICAgICAgfVxuICAgICAgfSwgODApXG4gICAgICBjb25zdCBjbGVhclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dChzY3JvbGxUaW1lcilcbiAgICAgICAgY2xlYXJUaW1lb3V0KGNsZWFyVGltZXIpXG4gICAgICB9XG4gICAgfVxuICAgIHNldFRhYignd29ya3NwYWNlJylcbiAgICBzZXRTZWxlY3RlZChmb2N1cy5wYXRoKVxuICAgIHNldEp1bXBMaW5lKGZvY3VzLmxpbmUgPz8gbnVsbClcbiAgICBjb25zdCBzY3JvbGxUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKGZvY3VzLmxpbmUgIT0gbnVsbCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1kc2RyLWxpbmU9XCIke2ZvY3VzLmxpbmV9XCJdYCk/LnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdjZW50ZXInLCBiZWhhdmlvcjogJ3Ntb290aCcgfSlcbiAgICAgIH1cbiAgICB9LCA4MClcbiAgICBjb25zdCBjbGVhclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBzZXRKdW1wTGluZShudWxsKSwgMjUwMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbFRpbWVyKVxuICAgICAgY2xlYXJUaW1lb3V0KGNsZWFyVGltZXIpXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3N0b3JlU3RhdGUua2V5XSlcblxuICAvLyBLZWVwIHN0YWdlZC91bnN0YWdlZC9oaXN0b3J5IGZyZXNoIHdoaWxlIHRoZSB3b3Jrc3BhY2UgdGFiIGlzIG9wZW4uXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgdGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBjb25zdCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHZvaWQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgIH0sIDE1MDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKHRpbWVyKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3N0b3JlU3RhdGUub3BlbiwgdGFiLCBhY3RpdmVDd2RdKVxuXG4gIC8vIEJyYW5jaCBzY29wZTogZGlmZiB0aGUgd29ya3RyZWUgYWdhaW5zdCB0aGUgc2VsZWN0ZWQgYmFzZSBicmFuY2guXG4gIC8vIERlZmF1bHQgdGhlIGJhc2UgdG8gdGhlIGZpcnN0IGJyYW5jaCB0aGF0IGlzbid0IHRoZSBjdXJyZW50IG9uZS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2NvcGUgIT09ICdicmFuY2gnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGNvbnN0IGN1cnJlbnQgPSBzdGF0dXM/LmJyYW5jaCA/PyBudWxsXG4gICAgaWYgKGJhc2VCcmFuY2ggPT09IG51bGwgJiYgYnJhbmNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmFsbGJhY2sgPSBicmFuY2hlcy5maW5kKChiKSA9PiBiICE9PSBjdXJyZW50KSA/PyBicmFuY2hlc1swXVxuICAgICAgc2V0QmFzZUJyYW5jaChmYWxsYmFjaylcbiAgICB9XG4gIH0sIFtzY29wZSwgYWN0aXZlQ3dkLCBicmFuY2hlcywgYmFzZUJyYW5jaCwgc3RhdHVzPy5icmFuY2hdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlICE9PSAnYnJhbmNoJyB8fCAhYWN0aXZlQ3dkIHx8ICFiYXNlQnJhbmNoKSB7XG4gICAgICBzZXRCYXNlU3RhdHVzKG51bGwpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGFjdGl2ZUN3ZCl9JmJhc2U9JHtlbmNvZGVVUklDb21wb25lbnQoYmFzZUJyYW5jaCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiBudWxsKSkgYXMgU3RhdHVzUmVzcG9uc2UgfCBudWxsXG4gICAgICBpZiAoIWNhbmNlbGxlZCAmJiBkYXRhKSB7XG4gICAgICAgIHNldEJhc2VTdGF0dXMoZGF0YSlcbiAgICAgICAgaWYgKGRhdGEuZXJyb3IgJiYgYmFzZVN0YXR1cz8uZXJyb3IgIT09IGRhdGEuZXJyb3IpIHNldEVycm9yKGRhdGEuZXJyb3IpXG4gICAgICB9XG4gICAgfSkoKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjYW5jZWxsZWQgPSB0cnVlXG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3Njb3BlLCBhY3RpdmVDd2QsIGJhc2VCcmFuY2hdKVxuXG4gIC8vIERlZmF1bHQgc2VsZWN0aW9uIGZvciB0aGUgc2Vzc2lvbiB0YWIgZm9sbG93cyB0aGUgZmlyc3Qgcm91bmQgd2l0aCBjaGFuZ2VzLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3RlZFJvdW5kID09PSBudWxsICYmIHJvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRTZWxlY3RlZFJvdW5kKHJvdW5kc1swXS5yb3VuZClcbiAgICAgIHNldFNlbGVjdGVkUGF0aChyb3VuZHNbMF0uY2hhbmdlc1swXT8ucGF0aCA/PyBudWxsKVxuICAgIH1cbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbikgcmV0dXJuXG4gICAgY29uc3Qgb25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSB7XG4gICAgICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICBkLm9wZW4gPSBmYWxzZVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgfSwgW3N0b3JlU3RhdGUub3Blbl0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIW5vdGljZSkgcmV0dXJuXG4gICAgbm90aWNlVGltZXIuY3VycmVudCA9IHNldFRpbWVvdXQoKCkgPT4gc2V0Tm90aWNlKG51bGwpLCAzMDAwKVxuICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQobm90aWNlVGltZXIuY3VycmVudClcbiAgfSwgW25vdGljZV0pXG5cbiAgY29uc3QgZmlsZXMgPSBzdGF0dXM/LmlzUmVwbyA/IHN0YXR1cy5maWxlcyA6IFtdXG4gIGNvbnN0IHN0YWdlZEZpbGVzID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGYpID0+IGYuc3RhZ2VkKSwgW2ZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiAhZi5zdGFnZWQpLCBbZmlsZXNdKVxuXG4gIC8qKiBUaGUgZmlsZSBzbGljZSB0aGUgY3VycmVudCBzY29wZSBzaG93cy4gKi9cbiAgY29uc3Qgc2NvcGVGaWxlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHN3aXRjaCAoc2NvcGUpIHtcbiAgICAgIGNhc2UgJ3Vuc3RhZ2VkJzpcbiAgICAgICAgcmV0dXJuIHVuc3RhZ2VkRmlsZXNcbiAgICAgIGNhc2UgJ3N0YWdlZCc6XG4gICAgICAgIHJldHVybiBzdGFnZWRGaWxlc1xuICAgICAgY2FzZSAnYnJhbmNoJzpcbiAgICAgICAgcmV0dXJuIGJhc2VTdGF0dXM/LmZpbGVzID8/IFtdXG4gICAgICBjYXNlICdsYXN0LXR1cm4nOiB7XG4gICAgICAgIHJldHVybiBsYXN0VHVybkZpbGVzXG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmlsZXNcbiAgICB9XG4gIH0sIFtzY29wZSwgdW5zdGFnZWRGaWxlcywgc3RhZ2VkRmlsZXMsIGJhc2VTdGF0dXMsIGZpbGVzLCBsYXN0VHVybkZpbGVzXSlcblxuICAvKiogU2NvcGVzIHdoZXJlIGZpbGUvaHVuayBhY2NlcHRcdTAwQjdyZXZlcnRcdTAwQjd1bnN0YWdlIGFuZCBjb21taXQvcHVzaCBtYWtlIHNlbnNlLiAqL1xuICBjb25zdCBhbGxvd0FjdGlvbnMgPSBzY29wZSAhPT0gJ2JyYW5jaCcgJiYgc2NvcGUgIT09ICdjb21taXQnICYmIHNjb3BlICE9PSAnbGFzdC10dXJuJ1xuXG4gIC8qKiBGaWxlcyB0aGUgY3VycmVudCBzY29wZSBjYW4gaGFuZCB0byB0aGUgQUkgcmV2aWV3LiAqL1xuICBjb25zdCByZXZpZXdhYmxlRmlsZXMgPSBzY29wZSA9PT0gJ2JyYW5jaCcgPyBiYXNlU3RhdHVzPy5maWxlcz8ubGVuZ3RoID8/IDAgOiBmaWxlcy5sZW5ndGhcbiAgY29uc3Qgc3RhZ2VkQ291bnQgPSBzdGFnZWRGaWxlcy5sZW5ndGhcbiAgLy8gTk9URTogaG9va3MgbXVzdCBhbGwgcnVuIGJlZm9yZSB0aGUgZWFybHkgcmV0dXJuIGJlbG93IChSZWFjdCBob29rIG9yZGVyKS5cbiAgY29uc3Qgc3RhZ2VkVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZShzdGFnZWRGaWxlcywgKGYpID0+IGYucGF0aCksIFtzdGFnZWRGaWxlc10pXG4gIGNvbnN0IHVuc3RhZ2VkVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZSh1bnN0YWdlZEZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3Vuc3RhZ2VkRmlsZXNdKVxuICBjb25zdCBzY29wZVRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc2NvcGVGaWxlcywgKGYpID0+IGYucGF0aCksIFtzY29wZUZpbGVzXSlcbiAgY29uc3QgY29tbWl0RmlsZXNUcmVlID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoY29tbWl0RGlmZj8ub2sgPyBidWlsZEZpbGVUcmVlKGNvbW1pdERpZmYuZmlsZXMsIChmKSA9PiBmLnBhdGgpIDogW10pLFxuICAgIFtjb21taXREaWZmXSxcbiAgKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlID09PSAnbGFzdC10dXJuJyAmJiBzZWxlY3RlZCA9PT0gbnVsbCAmJiBsYXN0VHVybkZpbGVzLmxlbmd0aCA+IDApIHNldFNlbGVjdGVkKGxhc3RUdXJuRmlsZXNbMF0ucGF0aClcbiAgfSwgW3Njb3BlLCBzZWxlY3RlZCwgbGFzdFR1cm5GaWxlc10pXG5cbiAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgIWN3ZCkgcmV0dXJuIG51bGxcblxuICBjb25zdCBzZWxlY3RlZEZpbGUgPSBzY29wZUZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWQpID8/IG51bGxcbiAgY29uc3QgdG90YWxBZGRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuYWRkZWQsIDApXG4gIGNvbnN0IHRvdGFsRGVsZXRlZCA9IGZpbGVzLnJlZHVjZSgobiwgZikgPT4gbiArIGYuZGVsZXRlZCwgMClcblxuICAvLyBDb21taXQtZGV0YWlsIHZpZXc6IHRoZSBzZWxlY3RlZCBmaWxlIHdpdGhpbiB0aGUgc2VsZWN0ZWQgY29tbWl0LlxuICBjb25zdCBjb21taXRTZWdtZW50cyA9IGNvbW1pdERpZmY/Lm9rID8gc3BsaXRDb21taXREaWZmKGNvbW1pdERpZmYuZGlmZikgOiBbXVxuICBjb25zdCBjb21taXRBY3RpdmVGaWxlID0gc2VsZWN0ZWRDb21taXQgJiYgY29tbWl0RGlmZj8ub2sgPyBjb21taXREaWZmLmZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gc2VsZWN0ZWRDb21taXRGaWxlKSA/PyBudWxsIDogbnVsbFxuICBjb25zdCBjb21taXRBY3RpdmVUZXh0ID0gY29tbWl0QWN0aXZlRmlsZVxuICAgID8gY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/IGNvbW1pdERpZmY/LmRpZmYgPz8gJydcbiAgICA6IGNvbW1pdERpZmY/LmRpZmYgPz8gJydcblxuICAvKiogTGVhZiByb3cgc2hhcmVkIGJ5IHRoZSBzdGFnZWQvdW5zdGFnZWQgZmlsZSB0cmVlcy4gKi9cbiAgY29uc3Qgd29ya3NwYWNlTGVhZiA9ICh7IGl0ZW06IGZpbGUsIG5hbWUgfTogeyBpdGVtOiBEaWZmRmlsZTsgbmFtZTogc3RyaW5nIH0pID0+IChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgYXJpYS1zZWxlY3RlZD17ZmlsZS5wYXRoID09PSBzZWxlY3RlZH1cbiAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7ZmlsZS5wYXRoID09PSBzZWxlY3RlZCA/ICcgZHNkci1maWxlLXNlbGVjdGVkJyA6ICcnfWB9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIHNldFNlbGVjdGVkKGZpbGUucGF0aClcbiAgICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICAgIH19XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1jaGlwICR7Y2hpcENsYXNzKGZpbGUuc3RhdHVzKX1gfT57ZmlsZS51bnRyYWNrZWQgPyAnPz8nIDogZmlsZS5zdGF0dXN9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLW5hbWVcIiB0aXRsZT17ZmlsZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtc3RhdFwiPlxuICAgICAgICB7ZmlsZS5iaW5hcnkgPyB0KCdyZXZpZXcuYmluYXJ5JykgOiB0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgIDwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1hY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZmlsZS1pY29uXCIgdGl0bGU9e3QoJ2h1bmsuc3RhZ2UnKX0gZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eyhldmVudCkgPT4geyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgdm9pZCBydW5BcHBseSgnYWNjZXB0JywgZmlsZS5wYXRoKSB9fT4rPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZmlsZS1pY29uIGRzZHItZmlsZS1pY29uLWRhbmdlclwiIHRpdGxlPXt0KCdodW5rLnJldmVydCcpfSBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KGV2ZW50KSA9PiB7IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyB2b2lkIHJ1bkFwcGx5KCdyZXZlcnQnLCBmaWxlLnBhdGgpIH19Plx1MjFCNjwvYnV0dG9uPlxuICAgICAgPC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG5cbiAgY29uc3QgcnVuQXBwbHkgPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoPzogc3RyaW5nKSA9PiB7XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlDaGFuZ2VzKGFjdGl2ZUN3ZCA/PyBjd2QgPz8gJycsIGFjdGlvbiwgcGF0aClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgY29uc3QgdmVyYiA9IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IGFjdGlvbiA9PT0gJ3Vuc3RhZ2UnID8gdCgncmV2aWV3LnVuc3RhZ2VkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKVxuICAgICAgICBzZXROb3RpY2Uoe1xuICAgICAgICAgIGtpbmQ6ICdvaycsXG4gICAgICAgICAgdGV4dDogcGF0aFxuICAgICAgICAgICAgPyB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiB2ZXJiLCBwYXRoIH0pXG4gICAgICAgICAgICA6IHJlc3VsdC5kZWxldGVkICYmIHJlc3VsdC5kZWxldGVkLmxlbmd0aCA+IDBcbiAgICAgICAgICAgICAgPyB0KCdyZXZpZXcuZG9uZURlbGV0ZWQnLCB7IGFjdGlvbjogdmVyYiwgY291bnQ6IGZpbGVzLmxlbmd0aCwgZGVsZXRlZDogcmVzdWx0LmRlbGV0ZWQubGVuZ3RoIH0pXG4gICAgICAgICAgICAgIDogdCgncmV2aWV3LmRvbmUnLCB7IGFjdGlvbjogdmVyYiwgY291bnQ6IGZpbGVzLmxlbmd0aCB9KSxcbiAgICAgICAgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uRmlsZUFjdGlvbiA9IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg6IHN0cmluZykgPT4ge1xuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uLCBwYXRoKVxuICB9XG5cbiAgY29uc3Qgb25BbGxBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnKSA9PiB7XG4gICAgaWYgKGFjdGlvbiA9PT0gJ3JldmVydCcgJiYgY29uZmlybSAhPT0gJ2FsbCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ2FsbCcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvbmZpcm0oKGMpID0+IChjID09PSAnYWxsJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCBydW5BcHBseShhY3Rpb24pXG4gIH1cblxuICAvKiogQXBwbHkgb25lIGh1bmsgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkgb2YgdGhlIHNlbGVjdGVkIGZpbGUuICovXG4gIGNvbnN0IG9uSHVua0FjdGlvbiA9IGFzeW5jIChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IERpZmZIdW5rKSA9PiB7XG4gICAgaWYgKCFzZWxlY3RlZEZpbGUgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcHBseUh1bmsoYWN0aXZlQ3dkID8/IGN3ZCA/PyAnJywgc2VsZWN0ZWRGaWxlLnBhdGgsIGFjdGlvbiwgaHVuay50ZXh0KVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBjb25zdCB2ZXJiID0gYWN0aW9uID09PSAnYWNjZXB0JyA/IHQoJ3Jldmlldy5hY2NlcHRlZCcpIDogYWN0aW9uID09PSAndW5zdGFnZScgPyB0KCdyZXZpZXcudW5zdGFnZWQnKSA6IHQoJ3Jldmlldy5yZXZlcnRlZCcpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5kb25lT25lJywgeyBhY3Rpb246IHZlcmIsIHBhdGg6IHNlbGVjdGVkRmlsZS5wYXRoIH0pIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIGlubGluZSBjb21tZW50cyAtLS0tXG4gIGNvbnN0IG9wZW5Db21tZW50ID0gKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuXG4gICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmUsIG5ld0xpbmUgfSlcbiAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21tZW50cyBhcmUgc3RvcmVkIHJlcG8tcmVsYXRpdmUgKHNlcnZlciByZWplY3RzIGFic29sdXRlIHBhdGhzKSwgYnV0XG4gICAqIHRoZSBzZXNzaW9uIHRhYidzIGNoYW5nZSBwYXRocyBjb21lIGZyb20gdGhlIGhvc3QgdG9vbCBkaWZmIGNhcmRzLCB3aGljaFxuICAgKiBjYXJyeSB3aGF0ZXZlciBwYXRoIHRoZSBhZ2VudCBwYXNzZWQgKHVzdWFsbHkgYWJzb2x1dGUpLlxuICAgKi9cbiAgY29uc3QgcmVsYXRpdmVQYXRoID0gKHA6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgIWlzQWJzUGF0aChwKSkgcmV0dXJuIHBcbiAgICBpZiAocC5zdGFydHNXaXRoKGFjdGl2ZUN3ZCkpIHJldHVybiBwLnNsaWNlKGFjdGl2ZUN3ZC5sZW5ndGgpLnJlcGxhY2UoL15bXFxcXC9dKy8sICcnKVxuICAgIHJldHVybiBwXG4gIH1cblxuICBjb25zdCBzYXZlQ29tbWVudCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBjb21tZW50UGF0aCA9IHJlbGF0aXZlUGF0aCgodGFiID09PSAnd29ya3NwYWNlJyA/IHNlbGVjdGVkRmlsZT8ucGF0aCA6IHNlbGVjdGVkQ2hhbmdlPy5wYXRoKSA/PyAnJylcbiAgICBpZiAoIWNvbW1lbnRQYXRoIHx8ICFjb21tZW50RWRpdG9yIHx8IGJ1c3kpIHJldHVyblxuICAgIGNvbnN0IHRleHQgPSBjb21tZW50VGV4dC50cmltKClcbiAgICBpZiAoIXRleHQpIHJldHVyblxuICAgIGNvbnN0IGNvbW1lbnQ6IFJldmlld0NvbW1lbnQgPSB7XG4gICAgICBpZDogdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLnJhbmRvbVVVSUQgPyBjcnlwdG8ucmFuZG9tVVVJRCgpIDogYCR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyKX1gLFxuICAgICAgcGF0aDogY29tbWVudFBhdGgsXG4gICAgICBsaW5lTmV3OiBjb21tZW50RWRpdG9yLm5ld0xpbmUsXG4gICAgICBsaW5lT2xkOiBjb21tZW50RWRpdG9yLm9sZExpbmUsXG4gICAgICB0ZXh0LFxuICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBzb3VyY2U6IHRhYiA9PT0gJ3Nlc3Npb24nID8gJ3Nlc3Npb24nIDogJ3dvcmtzcGFjZScsXG4gICAgfVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3QgbmV4dCA9IFsuLi5jb21tZW50cywgY29tbWVudF1cbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdjb21tZW50LnNhdmVkJykgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2FuY2VsQ29tbWVudCA9ICgpID0+IHtcbiAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gIH1cblxuICBjb25zdCBkZWxldGVDb21tZW50ID0gYXN5bmMgKGlkOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gYy5pZCAhPT0gaWQpXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBpZiAoYWN0aXZlQ3dkICYmIChhd2FpdCBzYXZlQ29tbWVudHMoYWN0aXZlQ3dkLCBuZXh0KSkpIHtcbiAgICAgICAgc2V0Q29tbWVudHMobmV4dClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIFVwZGF0ZSBvbmUgc2F2ZWQgY29tbWVudCdzIHRleHQgKFBVVCByZXBsYWNlKS4gUmV0dXJucyBzdWNjZXNzLiAqL1xuICBjb25zdCB1cGRhdGVDb21tZW50ID0gYXN5bmMgKGlkOiBzdHJpbmcsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGlmICghdGV4dCB8fCBidXN5KSByZXR1cm4gZmFsc2VcbiAgICBjb25zdCBuZXh0ID0gY29tbWVudHMubWFwKChjKSA9PiAoYy5pZCA9PT0gaWQgPyB7IC4uLmMsIHRleHQsIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0gOiBjKSlcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBBSSByZXZpZXcgKC9yZXZpZXcpOiBydW4sIHJlLXJ1biwgYW5kIGhhbmQgZmluZGluZ3MgdG8gdGhlIGFnZW50IC0tLS1cbiAgY29uc3Qgb25SZXZpZXcgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgcmV2aWV3aW5nIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldFJldmlld2luZyh0cnVlKVxuICAgIHNldFJldmlldyhudWxsKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXZpZXdTY29wZSA9IHNjb3BlID09PSAnYnJhbmNoJyA/ICdicmFuY2gnIDogc2NvcGUgPT09ICdjb21taXQnICYmIHNlbGVjdGVkQ29tbWl0ID8gJ2NvbW1pdCcgOiAndW5jb21taXR0ZWQnXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5SZXZpZXcoYWN0aXZlQ3dkLCBjdXJyZW50SWQgPz8gbnVsbCwgcmV2aWV3U2NvcGUsIGJhc2VCcmFuY2ggPz8gdW5kZWZpbmVkLCBzZWxlY3RlZENvbW1pdD8uaGFzaCA/PyB1bmRlZmluZWQpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIHNldFJldmlldyhyZXN1bHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LnJldmlld0ZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LnJldmlld0ZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFJldmlld2luZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogQ29tcG9zZSBhIFwic2VuZCB0byBhZ2VudFwiIG1lc3NhZ2UgZnJvbSBmaW5kaW5ncyBvciBQUiBjb21tZW50cy4gKi9cbiAgY29uc3QgY29tcG9zZUZpbmRpbmdzTWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdGaW5kaW5nW10+KClcbiAgICBmb3IgKGNvbnN0IGYgb2YgcmV2aWV3Py5maW5kaW5ncyA/PyBbXSkge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoZi5maWxlKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChmKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGYuZmlsZSwgW2ZdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQiBBSSBcdThCQzRcdTVCQTFcdTUzRDFcdTczQjBcdUZGMDhBZGRyZXNzIHRoZSByZXZpZXcgZmluZGluZ3NcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLCAnJ11cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBmIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBmLmxpbmVTdGFydCA9PT0gZi5saW5lRW5kID8gYDoke2YubGluZVN0YXJ0fWAgOiBgOiR7Zi5saW5lU3RhcnR9LSR7Zi5saW5lRW5kfWBcbiAgICAgICAgbGluZXMucHVzaChgLSBbJHtmLnByaW9yaXR5fV0gJHtwYXRofSR7cmFuZ2V9OiAke2YudGl0bGV9IFx1MjAxNCAke2YuZGV0YWlsfWApXG4gICAgICAgIGlmIChmLnN1Z2dlc3Rpb24pIGxpbmVzLnB1c2goYCAgXFxgXFxgXFxgXFxuJHtmLnN1Z2dlc3Rpb259XFxuICBcXGBcXGBcXGBgKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBjb21wb3NlUHJNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKCFwcj8ucHIgfHwgcHIuY29tbWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbYFx1OEJGN1x1NTkwNFx1NzQwNiBQUiAjJHtwci5wci5udW1iZXJ9XHVGRjA4JHtwci5wci50aXRsZX1cdUZGMDlcdTc2ODRcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBQUiBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQWAsICcnXVxuICAgIGZvciAoY29uc3QgYyBvZiBwci5jb21tZW50cykge1xuICAgICAgY29uc3QgYW5jaG9yID0gYy5wYXRoID8gYCR7Yy5wYXRofSR7Yy5saW5lID8gYDoke2MubGluZX1gIDogJyd9YCA6ICdnZW5lcmFsJ1xuICAgICAgbGluZXMucHVzaChgLSAke2FuY2hvcn0gKCR7Yy5hdXRob3J9KTogJHtjLmJvZHl9YClcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBvcGVuU2VuZFBhbmVsV2l0aCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgICBzZXRTZW5kVGV4dCh0ZXh0KVxuICAgIHNldFNlbmRPcGVuKHRydWUpXG4gIH1cblxuICAvLyAtLS0tIGVkaXRvciBpbnRlZ3JhdGlvbiAodmlhIGRzaC1wbHVnaW4tb3Blbi1lZGl0b3IpIC0tLS1cbiAgY29uc3Qgb3BlbkZpbGUgPSBhc3luYyAocGF0aDogc3RyaW5nLCBsaW5lPzogbnVtYmVyKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3BlbkluRWRpdG9yKGFjdGl2ZUN3ZCwgcGF0aCwgbGluZSlcbiAgICBpZiAoIXJlc3VsdC5vaykgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogYCR7dCgnZWRpdG9yLmZhaWxlZCcpfTogJHtyZXN1bHQuZXJyb3IgPz8gJyd9YCB9KVxuICB9XG5cbiAgLyoqIEp1bXAgZnJvbSBhIFBSIGNvbW1lbnQgdG8gdGhlIGZpbGUgKGFuZCBoaWdobGlnaHQgdGhlIGxpbmUpLiAqL1xuICBjb25zdCBvblByQ29tbWVudENsaWNrID0gKHBhdGg6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsIGxpbmU6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpID0+IHtcbiAgICBpZiAocGF0aCkganVtcFRvKHBhdGgsIGxpbmUgPz8gdW5kZWZpbmVkKVxuICAgIGVsc2Ugc2V0SnVtcExpbmUobnVsbClcbiAgfVxuXG4gIC8vIC0tLS0gZmVlZGJhY2sgbG9vcDogY29tbWVudHMgXHUyMTkyIGFnZW50IChwcm9tcHQgaW5qZWN0aW9uLCBjb3B5IGZhbGxiYWNrKSAtLS0tXG4gIGNvbnN0IGNvbXBvc2VSZXZpZXdNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKGNvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0NvbW1lbnRbXT4oKVxuICAgIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoYy5wYXRoKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChjKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGMucGF0aCwgW2NdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXG4gICAgICAnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJyxcbiAgICAgICcnLFxuICAgIF1cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBjIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgICAgLy8gT3JpZ2luIHRhYiB0YWcgc28gdGhlIGNvbnZlcnNhdGlvbiBjYXJkIHJvdXRlcyBpdHMganVtcCAoJ3MnID1cbiAgICAgICAgLy8gc2Vzc2lvbiByZWxhdGl2ZSBodW5rIGxpbmVzLCAndycgPSB3b3Jrc3BhY2UgcmVhbCBsaW5lcykuXG4gICAgICAgIGNvbnN0IHRhZyA9IGMuc291cmNlID09PSAnc2Vzc2lvbicgPyAnW3NdJyA6ICdbd10nXG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHt0YWd9ICR7cGF0aH0ke2FuY2hvcn06ICR7Yy50ZXh0fWApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0U2VuZFRleHQoY29tcG9zZVJldmlld01lc3NhZ2UoKSlcbiAgICBzZXRTZW5kT3Blbih0cnVlKVxuICB9XG5cbiAgY29uc3Qgc2VuZFRvQWdlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdGV4dCA9IHNlbmRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBhd2FpdCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIGN1cnJlbnRJZCA/PyBudWxsLCB0ZXh0KVxuICAgICAgc2V0U2VuZE9wZW4oZmFsc2UpXG4gICAgICBpZiAob3V0Y29tZSA9PT0gJ3NlbnQnKSBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuc2VudFRvQWdlbnQnKSB9KVxuICAgICAgZWxzZSBpZiAob3V0Y29tZSA9PT0gJ2NvcGllZCcpIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KVxuICAgICAgZWxzZSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdyZXZpZXcuY29weUZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIENvbW1pdCB0aGUgc3RhZ2VkIGNoYW5nZXMgd2l0aCB0aGUgZW50ZXJlZCBtZXNzYWdlLiAqL1xuICBjb25zdCBvbkNvbW1pdCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0gY29tbWl0TWVzc2FnZS50cmltKClcbiAgICBpZiAoIW1lc3NhZ2UgfHwgYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAnY29tbWl0JywgbWVzc2FnZSlcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0Q29tbWl0TWVzc2FnZSgnJylcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHJlc3VsdC5oYXNoID8gYCR7cmVzdWx0Lmhhc2h9ICR7cmVzdWx0LnN1YmplY3QgPz8gJyd9YC50cmltKCkgOiAocmVzdWx0LnN1YmplY3QgPz8gJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb21taXR0ZWQnLCB7IHN1bW1hcnkgfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdENvbW1pdCA9IGFzeW5jIChwdXNoQWZ0ZXI6IGJvb2xlYW4pID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCBidXN5KSByZXR1cm5cbiAgICBpZiAoaW5jbHVkZVVuc3RhZ2VkKSB7XG4gICAgICBzZXRCdXN5KHRydWUpXG4gICAgICBjb25zdCBzdGFnZWQgPSBhd2FpdCBhcHBseUNoYW5nZXMoYWN0aXZlQ3dkLCAnYWNjZXB0JylcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgICBpZiAoIXN0YWdlZC5vaykgeyBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBzdGFnZWQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pOyByZXR1cm4gfVxuICAgIH1cbiAgICBhd2FpdCBvbkNvbW1pdCgpXG4gICAgaWYgKHB1c2hBZnRlcikgb25QdXNoKHRydWUpXG4gICAgc2V0Q29tbWl0T3BlbihmYWxzZSlcbiAgfVxuXG4gIC8qKiBQdXNoIHRoZSBjdXJyZW50IGJyYW5jaCAoZG91YmxlLWNsaWNrIHRvIGNvbmZpcm0pLiAqL1xuICBjb25zdCBvblB1c2ggPSAoaW1tZWRpYXRlID0gZmFsc2UpID0+IHtcbiAgICBpZiAoYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAoIWltbWVkaWF0ZSAmJiBjb25maXJtICE9PSAncHVzaCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ3B1c2gnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ3B1c2gnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICBzZXRCdXN5KHRydWUpXG4gICAgICBzZXROb3RpY2UobnVsbClcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkdpdEFjdGlvbihhY3RpdmVDd2QsICdwdXNoJylcbiAgICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5wdXNoZWQnKSB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgfVxuICAgIH0pKClcbiAgfVxuXG4gIC8qKiBTZWxlY3QgYSBsb2NhbCBjb21taXQgYW5kIGxvYWQgaXRzIGRpZmYgaW50byB0aGUgcmlnaHQgcGFuZS4gKi9cbiAgY29uc3Qgc2VsZWN0Q29tbWl0ID0gKGNvbW1pdDogQ29tbWl0SW5mbykgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0KGNvbW1pdClcbiAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgIHNldENvbW1pdERpZmZMb2FkaW5nKHRydWUpXG4gICAgdm9pZCBsb2FkQ29tbWl0RGlmZihhY3RpdmVDd2QsIGNvbW1pdC5oYXNoKVxuICAgICAgLnRoZW4oKGQpID0+IHtcbiAgICAgICAgc2V0Q29tbWl0RGlmZihkKVxuICAgICAgICBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSlcbiAgICAgICAgLy8gRGVmYXVsdCB0aGUgZmlsZSB0cmVlIHRvIHRoZSBmaXJzdCBjaGFuZ2VkIGZpbGUuXG4gICAgICAgIGlmIChkLm9rICYmIGQuZmlsZXMubGVuZ3RoID4gMCkgc2V0U2VsZWN0ZWRDb21taXRGaWxlKGQuZmlsZXNbMF0ucGF0aClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4gc2V0Q29tbWl0RGlmZkxvYWRpbmcoZmFsc2UpKVxuICB9XG5cbiAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9XCJkc2RyLW92ZXJsYXlcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQpIGNsb3NlKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXBhbmVsXCJcbiAgICAgICAgcm9sZT1cImRpYWxvZ1wiXG4gICAgICAgIGFyaWEtbW9kYWw9XCJ0cnVlXCJcbiAgICAgICAgYXJpYS1sYWJlbD17dCgncmV2aWV3LnRpdGxlJyl9XG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiBgJHtwcmVmcy53aWR0aH1weGAsIGhlaWdodDogYCR7cHJlZnMuaGVpZ2h0fXB4YCwgLi4uZGlmZlN0eWxlVmFycyhwcmVmcykgfSBhcyBDU1NQcm9wZXJ0aWVzfVxuICAgICAgPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cImVcIlxuICAgICAgICAgIG9uUmVzaXplPXsoZHgpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLndpZHRoID0gTWF0aC5tYXgoTUlOX1BBTkVMX1csIE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gNjQsIGQud2lkdGggKyBkeCkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJzXCJcbiAgICAgICAgICBvblJlc2l6ZT17KF9keCwgZHkpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLmhlaWdodCA9IE1hdGgubWF4KE1JTl9QQU5FTF9ILCBNYXRoLm1pbih3aW5kb3cuaW5uZXJIZWlnaHQgLSA2NCwgZC5oZWlnaHQgKyBkeSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJzZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCwgZHkpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLndpZHRoID0gTWF0aC5tYXgoTUlOX1BBTkVMX1csIE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gNjQsIGQud2lkdGggKyBkeCkpXG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItaGVhZGVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10aXRsZVwiPnt0KCdyZXZpZXcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRhYnNcIiByb2xlPVwidGFibGlzdFwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfT5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHJvbGU9XCJ0YWJcIiBhcmlhLXNlbGVjdGVkPXtzdXJmYWNlID09PSAncmV2aWV3J30gY2xhc3NOYW1lPXtgZHNkci10YWIke3N1cmZhY2UgPT09ICdyZXZpZXcnID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH0gb25DbGljaz17KCkgPT4gc2V0U3VyZmFjZSgncmV2aWV3Jyl9Pnt0KCdyZXZpZXcudGl0bGUnKX08L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHJvbGU9XCJ0YWJcIiBhcmlhLXNlbGVjdGVkPXtzdXJmYWNlID09PSAnZmlsZXMnfSBjbGFzc05hbWU9e2Bkc2RyLXRhYiR7c3VyZmFjZSA9PT0gJ2ZpbGVzJyA/ICcgZHNkci10YWItYWN0aXZlJyA6ICcnfWB9IG9uQ2xpY2s9eygpID0+IHNldFN1cmZhY2UoJ2ZpbGVzJyl9Pnt0KCdmaWxlcy50aXRsZScpfTwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtzdXJmYWNlID09PSAncmV2aWV3JyAmJiB0YWIgPT09ICd3b3Jrc3BhY2UnICYmIHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zY29wZVwiPlxuICAgICAgICAgICAgICB7cmVwb3MubGVuZ3RoID4gMSA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgncmVwby5sYWJlbCcpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlcG9QYXRoID8/IGFjdGl2ZUN3ZCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e3JlcG9zLm1hcCgocikgPT4gKHsgdmFsdWU6IHIucGF0aCwgbGFiZWw6IGAke2Jhc2VOYW1lKHIucGF0aCl9JHtyLmJyYW5jaCA/IGAgKCR7ci5icmFuY2h9KWAgOiAnJ31gIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRSZXBvUGF0aCh2KVxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgICAgICAgICAgICAgICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUubGFiZWwnKX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2NvcGV9XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17U0NPUEVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBzLmlkLCBsYWJlbDogdChzLmxhYmVsKSB9KSl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRTY29wZSh2IGFzIFdvcmtzcGFjZVNjb3BlKVxuICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdzY29wZS5iYXNlJyl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YmFzZUJyYW5jaCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2JyYW5jaGVzLm1hcCgoYikgPT4gKHsgdmFsdWU6IGIsIGxhYmVsOiBiIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRCYXNlQnJhbmNofVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3VidGl0bGVcIj5cbiAgICAgICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJ1xuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5zZXNzaW9uU3RhdHMnLCB7IHJvdW5kczogcm91bmRzLmxlbmd0aCwgZmlsZXM6IHRvdGFsU2Vzc2lvbkZpbGVzIH0pXG4gICAgICAgICAgICAgIDogc3RhdHVzPy5pc1JlcG9cbiAgICAgICAgICAgICAgICA/IGAke3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9IFx1MDBCNyAke3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogdG90YWxBZGRlZCwgZGVsZXRlZDogdG90YWxEZWxldGVkIH0pfSR7c3RhdHVzLmFoZWFkID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmFoZWFkJywgeyBuOiBzdGF0dXMuYWhlYWQgfSl9YCA6ICcnfSR7c3RhdHVzLmJlaGluZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9YCA6ICcnfWBcbiAgICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5ub3RSZXBvJyl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgIHtzdXJmYWNlID09PSAncmV2aWV3JyAmJiB0YWIgPT09ICd3b3Jrc3BhY2UnICYmIGFsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3kgfHwgKGZpbGVzLmxlbmd0aCA9PT0gMCAmJiBzdGFnZWRDb3VudCA9PT0gMCl9IG9uQ2xpY2s9eygpID0+IHNldENvbW1pdE9wZW4odHJ1ZSl9Pnt0KCdyZXZpZXcuY29tbWl0Jyl9PC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcuY2xvc2UnKX0gb25DbGljaz17Y2xvc2V9PlxuICAgICAgICAgICAgPEljb25YIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtjb21taXRPcGVuID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21taXQtbW9kYWxcIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21taXQtY2FyZFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LXRpdGxlXCI+e3N0YXR1cz8uYnJhbmNoID8/IHQoJ3Jldmlldy5jb21taXQnKX08L2Rpdj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWlucHV0XCIgYXV0b0ZvY3VzIHZhbHVlPXtjb21taXRNZXNzYWdlfSBwbGFjZWhvbGRlcj17dCgncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJyl9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldENvbW1pdE1lc3NhZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKX0gLz5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWluY2x1ZGVcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD17aW5jbHVkZVVuc3RhZ2VkfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJbmNsdWRlVW5zdGFnZWQoZXZlbnQudGFyZ2V0LmNoZWNrZWQpfSAvPiBJbmNsdWRlIHVuc3RhZ2VkIGNoYW5nZXM8L2xhYmVsPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWFjdGlvbnNcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIG9uQ2xpY2s9eygpID0+IHNldENvbW1pdE9wZW4oZmFsc2UpfT57dCgnY29tbWVudC5jYW5jZWwnKX08L2J1dHRvbj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5IHx8ICFjb21taXRNZXNzYWdlLnRyaW0oKX0gb25DbGljaz17KCkgPT4gdm9pZCBzdWJtaXRDb21taXQoZmFsc2UpfT57dCgncmV2aWV3LmNvbW1pdCcpfTwvYnV0dG9uPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCAhY29tbWl0TWVzc2FnZS50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc3VibWl0Q29tbWl0KHRydWUpfT57dCgncmV2aWV3LmNvbW1pdCcpfSBhbmQge3QoJ3Jldmlldy5wdXNoJyl9PC9idXR0b24+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeSB8fCAoc3RhdHVzPy5haGVhZCA/PyAwKSA9PT0gMH0gb25DbGljaz17KCkgPT4geyBzZXRDb21taXRPcGVuKGZhbHNlKTsgb25QdXNoKHRydWUpIH19Pnt0KCdyZXZpZXcucHVzaCcpfTwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7c3VyZmFjZSA9PT0gJ2ZpbGVzJyA/IChcbiAgICAgICAgICA8RmlsZXNXb3Jrc3BhY2UgY3dkPXtjd2R9IHQ9e3R9IGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc30gb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn0gLz5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8PlxuICAgICAgICB7c2VuZE9wZW4gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbmRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VuZC10aXRsZVwiPnt0KCdyZXZpZXcuc2VuZFRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLWhpbnRcIj57dCgncmV2aWV3LnNlbmRIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzTmFtZT1cImRzZHItc2VuZC1pbnB1dFwiIHJlYWRPbmx5IHZhbHVlPXtzZW5kVGV4dH0gc3BlbGxDaGVjaz17ZmFsc2V9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHNldFNlbmRPcGVuKGZhbHNlKX0+XG4gICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG5cIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHZvaWQgbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KHNlbmRUZXh0KS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSksXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ3Jldmlldy5jb3B5RmFpbGVkJykgfSksXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29weScpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8ICFzZW5kVGV4dC50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc2VuZFRvQWdlbnQoKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5zZW5kVG9BZ2VudCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnc2Vzc2lvbicgPyAoXG4gICAgICAgICAgcm91bmRzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAgICB7dCgncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnKX1cbiAgICAgICAgICAgICAge3Nlc3Npb25TY2FuICYmIHNlc3Npb25TY2FuLnJlc3VsdHMgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ub2RpZmZcIj57dCgncmV2aWV3LnNlc3Npb25TY2FuJywgeyByZXN1bHRzOiBzZXNzaW9uU2Nhbi5yZXN1bHRzLCBkaWZmOiBzZXNzaW9uU2Nhbi5kaWZmQ2FyZHMsIHBhdGg6IHNlc3Npb25TY2FuLnBhdGhPbmx5IH0pfTwvZGl2PlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5LWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIG9uQ2xpY2s9eygpID0+IHNldFRhYignd29ya3NwYWNlJyl9PlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5nb1dvcmtzcGFjZScpfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYm9keVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi5zZXNzaW9uJyl9PlxuICAgICAgICAgICAgICAgIHtyb3VuZHMubWFwKChyb3VuZCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JvdW5kLnJvdW5kfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5yb3VuZCcsIHsgcm91bmQ6IHJvdW5kLnJvdW5kIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIHtyb3VuZC5sYWJlbCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yb3VuZC1sYWJlbFwiIHRpdGxlPXtyb3VuZC5sYWJlbH0+e3JvdW5kLmxhYmVsfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Nlc3Npb25UcmVlcy5nZXQocm91bmQucm91bmQpID8/IFtdfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9eyh7IGl0ZW06IGNoYW5nZSwgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtyb3VuZC5yb3VuZH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZEtleSA9IHNlbGVjdGVkQ2hhbmdlID8gYCR7c2VsZWN0ZWRSb3VuZH06JHtzZWxlY3RlZENoYW5nZS5wYXRofWAgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17a2V5ID09PSBzZWxlY3RlZEtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2tleSA9PT0gc2VsZWN0ZWRLZXkgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmQucm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZFBhdGgoY2hhbmdlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoYW5nZS5oYXNEaWZmID8gJ2RzZHItY2hpcC1tJyA6ICdkc2RyLWNoaXAtdSd9YH0+e2NoYW5nZS5oYXNEaWZmID8gJ00nIDogJ1x1MDBCNyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2NoYW5nZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCIgdGl0bGU9e2NoYW5nZS50b29sfT57Y2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZlwiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZSA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENoYW5nZS5wYXRofT57c2VsZWN0ZWRDaGFuZ2UucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCI+e3NlbGVjdGVkQ2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZS5oYXNEaWZmID8gPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZENoYW5nZS5wYXRoKX0gdGl0bGU9e3QoJ2VkaXRvci5vcGVuRmlsZScpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5NyB7dCgnZWRpdG9yLm9wZW5GaWxlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UuaGFzRGlmZiA/IChcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3ID09PSAnc3BsaXQnICYmIGNoYW5nZVNwbGl0QmxvY2tzKHNlbGVjdGVkQ2hhbmdlKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmJlZm9yZScpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5hZnRlcicpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjaGFuZ2VTcGxpdEJsb2NrcyhzZWxlY3RlZENoYW5nZSkubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5yb3dzLm1hcCgocm93LCByaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRBbmNob3IgPSB7IG9sZExpbmU6IHJvdy5sZWZ0TnVtLCBuZXdMaW5lOiByb3cua2luZCA9PT0gJ2N0eCcgJiYgcm93LmxlZnROdW0gIT09IG51bGwgPyByb3cubGVmdE51bSA6IG51bGwgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0QW5jaG9yID0geyBvbGRMaW5lOiByb3cua2luZCA9PT0gJ2N0eCcgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gcm93LnJpZ2h0TnVtIDogbnVsbCwgbmV3TGluZTogcm93LnJpZ2h0TnVtIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0S2V5ID0gYCR7bGVmdEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtsZWZ0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEtleSA9IGAke3JpZ2h0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke3JpZ2h0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIGxlZnRBbmNob3Iub2xkTGluZSwgbGVmdEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCByaWdodEFuY2hvci5vbGRMaW5lLCByaWdodEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tZW50QnRuID0gKGFuY2hvcjogeyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0sIGNvdW50OiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50TGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudD17Y291bnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT3Blbj17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldENvbW1lbnRFZGl0b3IoeyBvbGRMaW5lOiBhbmNob3Iub2xkTGluZSwgbmV3TGluZTogYW5jaG9yLm5ld0xpbmUgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wZW5CdG4gPSAobGluZTogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW9wZW5saW5lXCIgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZENoYW5nZS5wYXRoLCBsaW5lKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17cm93LmxlZnROdW0gPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cubGVmdE51bSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4obGVmdEFuY2hvciwgbGVmdENvbW1lbnRzLmxlbmd0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LmxlZnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5sZWZ0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cubGVmdE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xlZnRDb21tZW50cy5sZW5ndGggPiAwID8gbGVmdENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50RWRpdG9yICYmIGxlZnRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LnJpZ2h0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1hZGQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtyb3cucmlnaHROdW0gPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKHJpZ2h0QW5jaG9yLCByaWdodENvbW1lbnRzLmxlbmd0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5yaWdodE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3JpZ2h0Q29tbWVudHMubGVuZ3RoID4gMCA/IHJpZ2h0Q29tbWVudHMubWFwKChjb21tZW50KSA9PiA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXt1cGRhdGVDb21tZW50fSBvbkRlbGV0ZT17KGlkKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoaWQpfSB0PXt0fSAvPikgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgcmlnaHRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzZXNzaW9uUm93c1dpdGhMaW5lcyhzZWxlY3RlZENoYW5nZSkubWFwKCh7IHJvdywgb2xkTGluZSwgbmV3TGluZSB9LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtvbGRMaW5lID8/ICdvJ306JHtuZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgb2xkTGluZSwgbmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG93QWN0aW9ucyA9IHJvdy5raW5kID09PSAnY3R4JyB8fCByb3cua2luZCA9PT0gJ2FkZCcgfHwgcm93LmtpbmQgPT09ICdkZWwnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH0ke3Jvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAnIGRzZHItbGluZS1jb21tZW50ZWQnIDogJyd9YH0gZGF0YS1kc2RyLWxpbmU9e25ld0xpbmUgPz8gb2xkTGluZSA/PyB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bmV3TGluZSA/PyBvbGRMaW5lID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgPyA8Q29tbWVudExpbmUgY291bnQ9e3Jvd0NvbW1lbnRzLmxlbmd0aH0gb25PcGVuPXsoKSA9PiBvcGVuQ29tbWVudChvbGRMaW5lLCBuZXdMaW5lKX0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLXRleHRcIj57cm93LnRleHQgfHwgJyAnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyAmJiAobmV3TGluZSA/PyBvbGRMaW5lKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1vcGVubGluZVwiIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gYXJpYS1sYWJlbD17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRDaGFuZ2UucGF0aCwgbmV3TGluZSA/PyBvbGRMaW5lID8/IDEpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgJiYgcm93Q29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd0NvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgPT09IGtleSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ub2RpZmZcIj57dCgncmV2aWV3Lm5vRGlmZkRhdGEnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPnt0KCdyZXZpZXcubm9TZXNzaW9uQ2hhbmdlcycpfTwvZGl2PlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKVxuICAgICAgICApIDogZXJyb3IgJiYgIXN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yfVxuICAgICAgICAgICAgPGRpdj57dCgncmV2aWV3Lm5vdFJlcG9IaW50Jyl9PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYm9keVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbGVzXCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPXt0KCd0YWIud29ya3NwYWNlJyl9PlxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdhbGwnID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICB7c3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvblN0YWdlZCcpfSAoe3N0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3N0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICB7dW5zdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcycpfSAoe3Vuc3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17dW5zdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAndW5zdGFnZWQnID8gKFxuICAgICAgICAgICAgICAgIHVuc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcycpfSAoe3Vuc3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXt1bnN0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj57dCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnc3RhZ2VkJyA/IChcbiAgICAgICAgICAgICAgICBzdGFnZWRGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25TdGFnZWQnKX0gKHtzdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3N0YWdlZFRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj57dCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYnJhbmNoJyA/IChcbiAgICAgICAgICAgICAgICBzY29wZUZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdzY29wZS5icmFuY2gnKX0ge2Jhc2VCcmFuY2ggPyBgXHUyMTk0ICR7YmFzZUJyYW5jaH1gIDogJyd9ICh7c2NvcGVGaWxlcy5sZW5ndGh9KVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdzY29wZS5icmFuY2hSZWFkb25seScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Njb3BlVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXt3b3Jrc3BhY2VMZWFmfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPnt0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdsYXN0LXR1cm4nID8gKFxuICAgICAgICAgICAgICAgIHNjb3BlRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Njb3BlLmxhc3QtdHVybicpfSAoe3Njb3BlRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzY29wZVRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj57dCgncmV2aWV3Lmxhc3RUdXJuRW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7KHNjb3BlID09PSAnYWxsJyB8fCBzY29wZSA9PT0gJ2NvbW1pdCcpICYmIGhpc3RvcnkubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3Lmhpc3RvcnknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci10aW1lbGluZVwiPlxuICAgICAgICAgICAgICAgICAgICB7aGlzdG9yeS5tYXAoKGNvbW1pdCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWl0Lmhhc2h9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXRsLWl0ZW0ke3NlbGVjdGVkQ29tbWl0Py5oYXNoID09PSBjb21taXQuaGFzaCA/ICcgZHNkci10bC1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci10bC1yYWlsXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItdGwtZG90JHtjb21taXQuYWhlYWQgPyAnIGRzZHItdGwtZG90LWxvY2FsJyA6ICcgZHNkci10bC1kb3QtcmVtb3RlJ31gfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17c2VsZWN0ZWRDb21taXQ/Lmhhc2ggPT09IGNvbW1pdC5oYXNofVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNlbGVjdENvbW1pdChjb21taXQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci10bC1iYWRnZSR7Y29tbWl0LmFoZWFkID8gJyBkc2RyLXRsLWJhZGdlLWxvY2FsJyA6ICcgZHNkci10bC1iYWRnZS1yZW1vdGUnfWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1pdC5haGVhZCA/IHQoJ2hpc3RvcnkubG9jYWwnKSA6IHQoJ2hpc3RvcnkucmVtb3RlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LXNob3J0XCI+e2NvbW1pdC5zaG9ydH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtc3ViamVjdFwiIHRpdGxlPXtjb21taXQuc3ViamVjdH0+e2NvbW1pdC5zdWJqZWN0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1tZXRhXCI+e2NvbW1pdC5hdXRob3J9IFx1MDBCNyB7cmVsYXRpdmVUaW1lKGNvbW1pdC5kYXRlLCB0KX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHsoc2NvcGUgPT09ICdhbGwnIHx8IHNjb3BlID09PSAnY29tbWl0JykgJiYgc2VsZWN0ZWRDb21taXQgJiYgY29tbWl0RGlmZj8ub2sgJiYgY29tbWl0RGlmZi5maWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuY29tbWl0RmlsZXMnKX0gKHtjb21taXREaWZmLmZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzPXtjb21taXRGaWxlc1RyZWV9XG4gICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9eyh7IGl0ZW06IGZpbGUsIG5hbWUgfSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZENvbW1pdEZpbGUgPT09IGZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZmlsZSR7c2VsZWN0ZWRDb21taXRGaWxlID09PSBmaWxlLnBhdGggPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWRDb21taXRGaWxlKGZpbGUucGF0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jaGlwIGRzZHItY2hpcC1tXCI+e2ZpbGUuc3RhdHVzfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2ZpbGUucGF0aH0+e25hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLXN0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogZmlsZS5hZGRlZCwgZGVsZXRlZDogZmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2FsbCcgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uQnJhbmNoJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYnJhbmNoXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLXJlZlwiIHRpdGxlPXtzdGF0dXMudXBzdHJlYW0gPz8gdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmJyYW5jaCA/PyB0KCdyZXZpZXcuZGV0YWNoZWQnKX1cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1hcnJvd1wiPlx1MjE5Mjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLnVwc3RyZWFtID8/IHQoJ3Jldmlldy5ub1Vwc3RyZWFtJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtc3RhdFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYWhlYWQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtYWhlYWRcIj57dCgncmV2aWV3LmFoZWFkJywgeyBuOiBzdGF0dXMuYWhlYWQgfSl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5iZWhpbmQgPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtYmVoaW5kXCI+e3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5haGVhZCA9PT0gMCAmJiBzdGF0dXMuYmVoaW5kID09PSAwICYmIHN0YXR1cy51cHN0cmVhbSA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLXN5bmNcIj5cdTI3MTM8L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1idG4ke2NvbmZpcm0gPT09ICdwdXNoJyA/ICcgZHNkci1idG4tY29uZmlybScgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5IHx8IChzdGF0dXM/LmFoZWFkID8/IDApID09PSAwfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldENvbW1pdE9wZW4odHJ1ZSl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7Y29uZmlybSA9PT0gJ3B1c2gnID8gdCgncmV2aWV3LmNvbmZpcm1QdXNoJykgOiBgJHt0KCdyZXZpZXcucHVzaCcpfSR7KHN0YXR1cz8uYWhlYWQgPz8gMCkgPiAwID8gYCAoJHtzdGF0dXM/LmFoZWFkID8/IDB9KWAgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3ByPy5wciA/IChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3ByLnRpdGxlJywgeyBudW1iZXI6IHByLnByLm51bWJlciB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5sZW5ndGggPiAwID8gYCBcdTAwQjcgJHt0KCdwci5jb21tZW50cycsIHsgbjogcHIuY29tbWVudHMubGVuZ3RoIH0pfWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcHJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5sZW5ndGggPT09IDAgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3ByLm5vUHInKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtjb21tZW50LmlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItcHItaXRlbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25QckNvbW1lbnRDbGljayhjb21tZW50LnBhdGgsIGNvbW1lbnQubGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXByLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50LnBhdGggPyBgJHtiYXNlTmFtZShjb21tZW50LnBhdGgpfSR7Y29tbWVudC5saW5lID8gYDoke2NvbW1lbnQubGluZX1gIDogJyd9YCA6ICdnZW5lcmFsJ30gXHUwMEI3IHtjb21tZW50LmF1dGhvcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci10ZXh0XCI+e2NvbW1lbnQuYm9keX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb3BlblNlbmRQYW5lbFdpdGgoY29tcG9zZVByTWVzc2FnZSgpKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3ByLnNlbmRDb21tZW50cycpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmZcIj5cbiAgICAgICAgICAgICAge3Jldmlldz8ub2sgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXZlcmRpY3Qke3Jldmlldy52ZXJkaWN0ID09PSAnaW5jb3JyZWN0JyA/ICcgZHNkci12ZXJkaWN0LWJhZCcgOiAnIGRzZHItdmVyZGljdC1vayd9YH0+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXZlcmRpY3QtbWFya1wiPntyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnXHUyNzE3JyA6ICdcdTI3MTMnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdmVyZGljdC10ZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgIHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyB0KCdyZXZpZXcudmVyZGljdEluY29ycmVjdCcpIDogdCgncmV2aWV3LnZlcmRpY3RDb3JyZWN0Jyl9XG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXZlcmRpY3QtbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyB0KCdyZXZpZXcuZmluZGluZ3MnLCB7IG46IHJldmlldy5maW5kaW5ncy5sZW5ndGggfSkgOiB0KCdyZXZpZXcubm9GaW5kaW5ncycpfVxuICAgICAgICAgICAgICAgICAgICB7cmV2aWV3LnRydW5jYXRlZCA/ICcgKHRydW5jYXRlZCknIDogJyd9XG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICB7cmV2aWV3Lm1vZGVsID8gPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1vZGVsXCI+e3Jldmlldy5tb2RlbC5wcm92aWRlcn0ve3Jldmlldy5tb2RlbC5tb2RlbH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgICAgICAgICAgIHtyZXZpZXcuZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb3BlblNlbmRQYW5lbFdpdGgoY29tcG9zZUZpbmRpbmdzTWVzc2FnZSgpKX0+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5zZW5kRmluZGluZ3MnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdCA/IChcbiAgICAgICAgICAgICAgICBjb21taXREaWZmTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKSA6IGNvbW1pdERpZmY/Lm9rID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LnN1YmplY3R9XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtaGFzaFwiPntzZWxlY3RlZENvbW1pdC5zaG9ydH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdG9vbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ29tbWl0LmF1dGhvcn0gXHUwMEI3IHtyZWxhdGl2ZVRpbWUoc2VsZWN0ZWRDb21taXQuZGF0ZSwgdCl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogY29tbWl0RGlmZi5hZGRlZCwgZGVsZXRlZDogY29tbWl0RGlmZi5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7Y29tbWl0QWN0aXZlRmlsZSA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17Y29tbWl0QWN0aXZlRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jaGlwIGRzZHItY2hpcC1tXCI+e2NvbW1pdEZpbGVTdGF0dXMoY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/ICcnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtcGF0aFwiPntjb21taXRBY3RpdmVGaWxlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmIGdpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2dpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Z2l0RGlmZlJvd3MoY29tbWl0QWN0aXZlVGV4dCkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57Y29tbWl0RGlmZj8uZXJyb3IgPz8gdCgncmV2aWV3Lm5vRGlmZkRhdGEnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBzZWxlY3RlZEZpbGUgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRGaWxlLnBhdGh9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLm9yaWdQYXRoID8gYCBcdTIxOTAgJHtzZWxlY3RlZEZpbGUub3JpZ1BhdGh9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBzZWxlY3RlZEZpbGUuYWRkZWQsIGRlbGV0ZWQ6IHNlbGVjdGVkRmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCl9IHRpdGxlPXt0KCdlZGl0b3Iub3BlbkZpbGUnKX0+XG4gICAgICAgICAgICAgICAgICAgICAgXHUyMTk3IHt0KCdlZGl0b3Iub3BlbkZpbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnVuc3RhZ2VkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZmlsZS1pY29uXCIgdGl0bGU9e3QoJ2h1bmsuc3RhZ2UnKX0gYXJpYS1sYWJlbD17dCgnaHVuay5zdGFnZScpfSBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdhY2NlcHQnLCBzZWxlY3RlZEZpbGUucGF0aCl9Pis8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtaWNvblwiIHRpdGxlPXt0KCdodW5rLnVuc3RhZ2UnKX0gYXJpYS1sYWJlbD17dCgnaHVuay51bnN0YWdlJyl9IGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3Vuc3RhZ2UnLCBzZWxlY3RlZEZpbGUucGF0aCl9Plx1MjIxMjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtaWNvbiBkc2RyLWZpbGUtaWNvbi1kYW5nZXJcIiB0aXRsZT17dCgnaHVuay5yZXZlcnQnKX0gYXJpYS1sYWJlbD17dCgnaHVuay5yZXZlcnQnKX0gZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbigncmV2ZXJ0Jywgc2VsZWN0ZWRGaWxlLnBhdGgpfT5cdTIxQjY8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmICFzZWxlY3RlZEZpbGUuYmluYXJ5ICYmIGdpdFNwbGl0QmxvY2tzKHNlbGVjdGVkRmlsZS5kaWZmKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmJlZm9yZScpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmFmdGVyJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge2dpdFNwbGl0QmxvY2tzKHNlbGVjdGVkRmlsZS5kaWZmKS5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IDxIdW5rVG9vbGJhciBodW5rPXtzZWxlY3RlZEZpbGUuaHVua3NbYmldfSBidXN5PXtidXN5fSBvbkFjdGlvbj17b25IdW5rQWN0aW9ufSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dGaW5kaW5ncyA9IChyZXZpZXc/LmZpbmRpbmdzID8/IFtdKS5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYuZmlsZSA9PT0gc2VsZWN0ZWRGaWxlLnBhdGggJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocm93LnJpZ2h0TnVtICE9PSBudWxsID8gcm93LnJpZ2h0TnVtID49IGYubGluZVN0YXJ0ICYmIHJvdy5yaWdodE51bSA8PSBmLmxpbmVFbmQgOiByb3cubGVmdE51bSAhPT0gbnVsbCAmJiByb3cubGVmdE51bSA+PSBmLmxpbmVTdGFydCAmJiByb3cubGVmdE51bSA8PSBmLmxpbmVFbmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ0NscyA9IHJvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgPyBgIGRzZHItY2VsbC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganVtcGVkID0ganVtcExpbmUgIT0gbnVsbCAmJiAocm93LnJpZ2h0TnVtID09PSBqdW1wTGluZSB8fCAocm93LnJpZ2h0TnVtID09PSBudWxsICYmIHJvdy5sZWZ0TnVtID09PSBqdW1wTGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IGFuY2hvcnMgc3RheSBjb25zaXN0ZW50IHdpdGggdGhlIHVuaWZpZWQgdmlldzogY3R4IHJvd3MgZXhwb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3RoIGxpbmUgbnVtYmVycywgY2hhbmdlIHJvd3MgZXhwb3NlIHRoZSBzaWRlIHRoZXkgYmVsb25nIHRvLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEFuY2hvciA9IHsgb2xkTGluZTogcm93LmxlZnROdW0sIG5ld0xpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cubGVmdE51bSAhPT0gbnVsbCA/IHJvdy5sZWZ0TnVtIDogbnVsbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEFuY2hvciA9IHsgb2xkTGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA6IG51bGwsIG5ld0xpbmU6IHJvdy5yaWdodE51bSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0S2V5ID0gYCR7bGVmdEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtsZWZ0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0S2V5ID0gYCR7cmlnaHRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7cmlnaHRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBsZWZ0QW5jaG9yLm9sZExpbmUsIGxlZnRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCByaWdodEFuY2hvci5vbGRMaW5lLCByaWdodEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wZW5CdG4gPSAobGluZTogbnVtYmVyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEZpbGUucGF0aCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW9wZW5saW5lXCIgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCwgbGluZSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tZW50QnRuID0gKGFuY2hvcjogeyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0sIGNvdW50OiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e2NvdW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT3Blbj17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmU6IGFuY2hvci5vbGRMaW5lLCBuZXdMaW5lOiBhbmNob3IubmV3TGluZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0PXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17cml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ30ke2ZpbmRpbmdDbHN9JHtqdW1wZWQgPyAnIGRzZHItY2VsbC1qdW1wJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtyb3cubGVmdE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5sZWZ0TnVtID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKGxlZnRBbmNob3IsIGxlZnRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cubGVmdE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LmxlZnROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgJiYgcm93LnJpZ2h0TnVtID09PSBudWxsID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9Pntyb3dGaW5kaW5nc1swXS5wcmlvcml0eX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xlZnRDb21tZW50cy5sZW5ndGggPiAwID8gbGVmdENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgbGVmdEtleSA9PT0gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHR9IG9uVGV4dD17c2V0Q29tbWVudFRleHR9IG9uU2F2ZT17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfSBvbkNhbmNlbD17Y2FuY2VsQ29tbWVudH0gYnVzeT17YnVzeX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LnJpZ2h0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1hZGQnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWNlbGwtanVtcCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17cm93LnJpZ2h0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKHJpZ2h0QW5jaG9yLCByaWdodENvbW1lbnRzLmxlbmd0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5yaWdodH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5yaWdodE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93RmluZGluZ3MubGVuZ3RoID4gMCAmJiByb3cucmlnaHROdW0gIT09IG51bGwgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YH0+e3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5sZW5ndGggPiAwID8gcmlnaHRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e3VwZGF0ZUNvbW1lbnR9IG9uRGVsZXRlPXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9IHQ9e3R9IC8+KSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50RWRpdG9yICYmIHJpZ2h0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyhyZXZpZXc/LmZpbmRpbmdzID8/IFtdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZikgPT4gZi5maWxlID09PSBzZWxlY3RlZEZpbGUucGF0aCAmJiBmLmxpbmVTdGFydCA9PT0gKHJvdy5sZWZ0TnVtID8/IHJvdy5yaWdodE51bSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChmLCBmaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmluZGluZ0NhcmQga2V5PXtgJHtmLmZpbGV9OiR7Zi5saW5lU3RhcnR9OiR7Zml9YH0gZmluZGluZz17Zn0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPFVuaWZpZWREaWZmXG4gICAgICAgICAgICAgICAgICAgICAgZGlmZj17c2VsZWN0ZWRGaWxlLmRpZmZ9XG4gICAgICAgICAgICAgICAgICAgICAgaHVua3M9e3NlbGVjdGVkRmlsZS5odW5rc31cbiAgICAgICAgICAgICAgICAgICAgICBidXN5PXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgIG9uSHVua0FjdGlvbj17b25IdW5rQWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudHM9e2NvbW1lbnRzfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRFZGl0b3I9e2NvbW1lbnRFZGl0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFRleHQ9e2NvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tbWVudFRleHQ9e3NldENvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uT3BlbkNvbW1lbnQ9e29wZW5Db21tZW50fVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZUNvbW1lbnQ9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbENvbW1lbnQ9e2NhbmNlbENvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDb21tZW50PXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGVDb21tZW50PXt1cGRhdGVDb21tZW50fVxuICAgICAgICAgICAgICAgICAgICAgIHJlYWRPbmx5PXshYWxsb3dBY3Rpb25zfVxuICAgICAgICAgICAgICAgICAgICAgIHBhdGg9e3NlbGVjdGVkRmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgIHJldmlld0ZpbmRpbmdzPXtyZXZpZXc/LmZpbmRpbmdzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uT3BlbkxpbmU9eyhwLCBsaW5lKSA9PiB2b2lkIG9wZW5GaWxlKHAsIGxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgIGp1bXBMaW5lPXtqdW1wTGluZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57c2NvcGUgPT09ICdjb21taXQnID8gdCgncmV2aWV3LnNlbGVjdENvbW1pdCcpIDogdCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgIHtlcnJvciA/PyB0KCdyZXZpZXcubG9hZEVycm9yJyl9XG4gICAgICAgICAgICB7IXN0YXR1cz8uaXNSZXBvID8gPGRpdj57dCgncmV2aWV3Lm5vdFJlcG9IaW50Jyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICAgIDwvPlxuICAgICAgICApfVxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mb290XCI+XG4gICAgICAgICAgeyhsb2FkaW5nIHx8IGJ1c3kpICYmIHRhYiA9PT0gJ3dvcmtzcGFjZScgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwaW5uZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2J1c3kgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLW5vdGljZVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgIHtub3RpY2UgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLW5vdGljZSBkc2RyLW5vdGljZS0ke25vdGljZS5raW5kfWB9Pntub3RpY2UudGV4dH08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQ29uZmlnIGNhcmQgZm9yIHRoZSBQbHVnaW5zIGNvbmZpZ3VyYXRpb24gdGFiIChTZXR0aW5ncyBcdTIxOTIgUGx1Z2lucyBcdTIxOTIgXHU1M0VGXHU5MTREXHU3RjZFKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdDb25maWdDYXJkKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJkIGRzZHItY2ZnLWNhcmQtb3BlbicgOiAnZHNkci1jZmctY2FyZCd9PlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZFwiIGFyaWEtZXhwYW5kZWQ9e29wZW59IG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWhlYWQtdGV4dFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLW5hbWVcIj57dCgnc2V0dGluZ3MudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctZGVzY1wiPnt0KCdjb25maWcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93bk91dGxpbmUxNCBjbGFzc05hbWU9e29wZW4gPyAnZHNkci1jZmctY2FyZXQgZHNkci1jZmctY2FyZXQtb3BlbicgOiAnZHNkci1jZmctY2FyZXQnfSAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1ib2R5XCI+XG4gICAgICAgICAgPERpZmZSZXZpZXdQcmVmcyB0PXt0fSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbGk+XG4gIClcbn1cblxuLyoqIENsaWVudCBwbHVnaW4gYm9keS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseShjdHg6IENsaWVudENvbnRleHQpOiB2b2lkIHtcbiAgY3R4LmVmZmVjdCgoKSA9PiBjdHgubG9jYWxlLnJlZ2lzdGVyKExPQ0FMRV9OUywgeyB6aCwgZW4gfSksICdkaWZmLXJldmlldzogbG9jYWxlIGRpY3Rpb25hcnknKVxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3JyxcbiAgICAgICAgb3JkZXI6IDcwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3QWN0aW9uLFxuICAgICksXG4gIClcbiAgY3R4LnNsb3RzLmluamVjdCgnc2hlbGwub3ZlcmxheScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2hlbGwub3ZlcmxheScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctb3ZlcmxheScsXG4gICAgICAgIG9yZGVyOiAxMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3T3ZlcmxheSxcbiAgICApLFxuICApXG4gIC8vIENvZGV4LXN0eWxlIHBlbmRpbmctY29tbWVudHMgc3RyaXAgYXQgdGhlIFRPUCBvZiB0aGUgY29tcG9zZXIsIHN0eWxlZCBhc1xuICAvLyB0aGUgY2FyZCdzIG93biBzdXJmYWNlIHNvIGl0IHJlYWRzIGFzIG9uZSBmdXNlZCBkaWFsb2cuXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uaW5wdXQuZG9jaycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29tbWVudHMtZG9jaycsXG4gICAgICAgIG9yZGVyOiAyMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIGluamVjdDogKCkgPT4gKHsgc2Vzc2lvbnM6IGN0eC5zZXNzaW9ucyB9KSxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrLFxuICAgICksXG4gIClcbiAgLy8gVGhlIGVuZ2luZSdzIHR1cm4gdGFpbCBzaXRzIGRpcmVjdGx5IGFmdGVyIGEgY29tcGxldGVkIGFnZW50IHJlc3BvbnNlLlxuICAvLyBJdHMgY2hhaW4gc2VsZWN0b3IgcmV0dXJucyB0aGUgb3duZXIgY3VycmVuY3k7IHRoZSBjb21wb25lbnQgZGVjbGluZXNcbiAgLy8gdHVybnMgd2l0aG91dCBwZXJzaXN0ZWQgZmlsZSBjaGFuZ2VzLlxuICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uY2hhdC50dXJuVGFpbCcsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnY29udmVyc2F0aW9uLmNoYXQudHVyblRhaWwnLFxuICAgICAgICBzZWxlY3Q6IChvd25lcikgPT4gb3duZXIsXG4gICAgICAgIHByaW9yaXR5OiAtMTAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIFR1cm5DaGFuZ2VTdW1tYXJ5LFxuICAgICksXG4gIClcbiAgLy8gVGhlIGNhcnJpZWQgcmV2aWV3IHBhY2thZ2UgcmVuZGVycyBpbiB0aGUgdHJhbnNjcmlwdCBhcyBhIENvZGV4LXN0eWxlXG4gIC8vIGNhcmQ6IHNoYWRvdyB0aGUgc2hlbGwncyB1c2VyLW5vZGUgcmVuZGVyZXIgKHByaW9yaXR5IC0xID0gbG93ZXN0IHdpbnMpXG4gIC8vIGFuZCByZS1yZW5kZXIgbm9uLXBhY2thZ2UgbWVzc2FnZXMgd2l0aCBhIG5hdGl2ZS1sb29rIGJ1YmJsZS4gVGhlXG4gIC8vIHN0ZWVyaW5nIGtpbmQgZ2V0cyB0aGUgc2FtZSB0cmVhdG1lbnQgXHUyMDE0IHRoZSBwYWNrYWdlIGlzIGluamVjdGVkIHdpdGhcbiAgLy8gcHJvbXB0KC4uLiwgJ3N0ZWVyJyksIHNvIGl0IGxhbmRzIGluIHRoZSB0cmFuc2NyaXB0IGFzIGEgc3RlZXJpbmcgbm9kZS5cbiAgZm9yIChjb25zdCBrZXkgb2YgWyd1c2VyJywgJ3N0ZWVyaW5nJ10gYXMgY29uc3QpIHtcbiAgICBjdHguc2xvdHMuaW5qZWN0KCdjb252ZXJzYXRpb24uY2hhdC5ub2RlJywgKCkgPT5cbiAgICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uY2hhdC5ub2RlJyxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgcHJpb3JpdHk6IC0xLFxuICAgICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgICB9LFxuICAgICAgICBVc2VyUmV2aWV3Tm9kZVZpZXcsXG4gICAgICApLFxuICAgIClcbiAgfVxuICAvLyBUaGUgcGx1Z2luJ3Mgb3duIHNldHRpbmdzIHRhYiBpbnNpZGUgXHU4QkJFXHU3RjZFIFx1MjE5MiBcdTYzRDJcdTRFRjYgKG5vdCB0aGUgR2VuZXJhbCBzZWN0aW9uKS5cbiAgLy8gVGhlIHBsdWdpbidzIHdob2xlIGNvbmZpZ3VyYXRpb24gbGl2ZXMgaW4gb25lIGNhcmQgaW5zaWRlXG4gIC8vIFx1OEJCRVx1N0Y2RSBcdTIxOTIgXHU2M0QyXHU0RUY2IFx1MjE5MiBcdTYzRDJcdTRFRjZcdTkxNERcdTdGNkUgKHNldHRpbmdzLnBsdWdpbi5pdGVtKTogZm9udC9zaXplLlxuICBjdHguc2xvdHMuaW5qZWN0KCdzZXR0aW5ncy5wbHVnaW4uaXRlbScsICgpID0+XG4gICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAge1xuICAgICAgICBuYW1lOiAnc2V0dGluZ3MucGx1Z2luLml0ZW0nLFxuICAgICAgICBpZDogJ2RpZmYtcmV2aWV3LWNvbmZpZycsXG4gICAgICAgIG9yZGVyOiAzMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICB9LFxuICAgICAgRGlmZlJldmlld0NvbmZpZ0NhcmQsXG4gICAgKSxcbiAgKVxufVxuIiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERpZmYge1xuICAgIGRpZmYob2xkU3RyLCBuZXdTdHIsIFxuICAgIC8vIFR5cGUgYmVsb3cgaXMgbm90IGFjY3VyYXRlL2NvbXBsZXRlIC0gc2VlIGFib3ZlIGZvciBmdWxsIHBvc3NpYmlsaXRpZXMgLSBidXQgaXQgY29tcGlsZXNcbiAgICBvcHRpb25zID0ge30pIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrO1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgnY2FsbGJhY2snIGluIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb3B0aW9ucy5jYWxsYmFjaztcbiAgICAgICAgfVxuICAgICAgICAvLyBBbGxvdyBzdWJjbGFzc2VzIHRvIG1hc3NhZ2UgdGhlIGlucHV0IHByaW9yIHRvIHJ1bm5pbmdcbiAgICAgICAgY29uc3Qgb2xkU3RyaW5nID0gdGhpcy5jYXN0SW5wdXQob2xkU3RyLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgbmV3U3RyaW5nID0gdGhpcy5jYXN0SW5wdXQobmV3U3RyLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3Qgb2xkVG9rZW5zID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG9sZFN0cmluZywgb3B0aW9ucykpO1xuICAgICAgICBjb25zdCBuZXdUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUobmV3U3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIHJldHVybiB0aGlzLmRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spO1xuICAgIH1cbiAgICBkaWZmV2l0aE9wdGlvbnNPYmoob2xkVG9rZW5zLCBuZXdUb2tlbnMsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgY29uc3QgZG9uZSA9ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnBvc3RQcm9jZXNzKHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBjYWxsYmFjayh2YWx1ZSk7IH0sIDApO1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IG5ld1Rva2Vucy5sZW5ndGgsIG9sZExlbiA9IG9sZFRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCBlZGl0TGVuZ3RoID0gMTtcbiAgICAgICAgbGV0IG1heEVkaXRMZW5ndGggPSBuZXdMZW4gKyBvbGRMZW47XG4gICAgICAgIGlmIChvcHRpb25zLm1heEVkaXRMZW5ndGggIT0gbnVsbCkge1xuICAgICAgICAgICAgbWF4RWRpdExlbmd0aCA9IE1hdGgubWluKG1heEVkaXRMZW5ndGgsIG9wdGlvbnMubWF4RWRpdExlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF4RXhlY3V0aW9uVGltZSA9IChfYSA9IG9wdGlvbnMudGltZW91dCkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogSW5maW5pdHk7XG4gICAgICAgIGNvbnN0IGFib3J0QWZ0ZXJUaW1lc3RhbXAgPSBEYXRlLm5vdygpICsgbWF4RXhlY3V0aW9uVGltZTtcbiAgICAgICAgY29uc3QgYmVzdFBhdGggPSBbeyBvbGRQb3M6IC0xLCBsYXN0Q29tcG9uZW50OiB1bmRlZmluZWQgfV07XG4gICAgICAgIC8vIFNlZWQgZWRpdExlbmd0aCA9IDAsIGkuZS4gdGhlIGNvbnRlbnQgc3RhcnRzIHdpdGggdGhlIHNhbWUgdmFsdWVzXG4gICAgICAgIGxldCBuZXdQb3MgPSB0aGlzLmV4dHJhY3RDb21tb24oYmVzdFBhdGhbMF0sIG5ld1Rva2Vucywgb2xkVG9rZW5zLCAwLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKGJlc3RQYXRoWzBdLm9sZFBvcyArIDEgPj0gb2xkTGVuICYmIG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAvLyBJZGVudGl0eSBwZXIgdGhlIGVxdWFsaXR5IGFuZCB0b2tlbml6ZXJcbiAgICAgICAgICAgIHJldHVybiBkb25lKHRoaXMuYnVpbGRWYWx1ZXMoYmVzdFBhdGhbMF0ubGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmNlIHdlIGhpdCB0aGUgcmlnaHQgZWRnZSBvZiB0aGUgZWRpdCBncmFwaCBvbiBzb21lIGRpYWdvbmFsIGssIHdlIGNhblxuICAgICAgICAvLyBkZWZpbml0ZWx5IHJlYWNoIHRoZSBlbmQgb2YgdGhlIGVkaXQgZ3JhcGggaW4gbm8gbW9yZSB0aGFuIGsgZWRpdHMsIHNvXG4gICAgICAgIC8vIHRoZXJlJ3Mgbm8gcG9pbnQgaW4gY29uc2lkZXJpbmcgYW55IG1vdmVzIHRvIGRpYWdvbmFsIGsrMSBhbnkgbW9yZSAoZnJvbVxuICAgICAgICAvLyB3aGljaCB3ZSdyZSBndWFyYW50ZWVkIHRvIG5lZWQgYXQgbGVhc3QgaysxIG1vcmUgZWRpdHMpLlxuICAgICAgICAvLyBTaW1pbGFybHksIG9uY2Ugd2UndmUgcmVhY2hlZCB0aGUgYm90dG9tIG9mIHRoZSBlZGl0IGdyYXBoLCB0aGVyZSdzIG5vXG4gICAgICAgIC8vIHBvaW50IGNvbnNpZGVyaW5nIG1vdmVzIHRvIGxvd2VyIGRpYWdvbmFscy5cbiAgICAgICAgLy8gV2UgcmVjb3JkIHRoaXMgZmFjdCBieSBzZXR0aW5nIG1pbkRpYWdvbmFsVG9Db25zaWRlciBhbmRcbiAgICAgICAgLy8gbWF4RGlhZ29uYWxUb0NvbnNpZGVyIHRvIHNvbWUgZmluaXRlIHZhbHVlIG9uY2Ugd2UndmUgaGl0IHRoZSBlZGdlIG9mXG4gICAgICAgIC8vIHRoZSBlZGl0IGdyYXBoLlxuICAgICAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBpcyBub3QgZmFpdGhmdWwgdG8gdGhlIG9yaWdpbmFsIGFsZ29yaXRobSBwcmVzZW50ZWQgaW5cbiAgICAgICAgLy8gTXllcnMncyBwYXBlciwgd2hpY2ggaW5zdGVhZCBwb2ludGxlc3NseSBleHRlbmRzIEQtcGF0aHMgb2ZmIHRoZSBlbmQgb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGggLSBzZWUgcGFnZSA3IG9mIE15ZXJzJ3MgcGFwZXIgd2hpY2ggbm90ZXMgdGhpcyBwb2ludFxuICAgICAgICAvLyBleHBsaWNpdGx5IGFuZCBpbGx1c3RyYXRlcyBpdCB3aXRoIGEgZGlhZ3JhbS4gVGhpcyBoYXMgbWFqb3IgcGVyZm9ybWFuY2VcbiAgICAgICAgLy8gaW1wbGljYXRpb25zIGZvciBzb21lIGNvbW1vbiBzY2VuYXJpb3MuIEZvciBpbnN0YW5jZSwgdG8gY29tcHV0ZSBhIGRpZmZcbiAgICAgICAgLy8gd2hlcmUgdGhlIG5ldyB0ZXh0IHNpbXBseSBhcHBlbmRzIGQgY2hhcmFjdGVycyBvbiB0aGUgZW5kIG9mIHRoZVxuICAgICAgICAvLyBvcmlnaW5hbCB0ZXh0IG9mIGxlbmd0aCBuLCB0aGUgdHJ1ZSBNeWVycyBhbGdvcml0aG0gd2lsbCB0YWtlIE8obitkXjIpXG4gICAgICAgIC8vIHRpbWUgd2hpbGUgdGhpcyBvcHRpbWl6YXRpb24gbmVlZHMgb25seSBPKG4rZCkgdGltZS5cbiAgICAgICAgbGV0IG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IC1JbmZpbml0eSwgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gSW5maW5pdHk7XG4gICAgICAgIC8vIE1haW4gd29ya2VyIG1ldGhvZC4gY2hlY2tzIGFsbCBwZXJtdXRhdGlvbnMgb2YgYSBnaXZlbiBlZGl0IGxlbmd0aCBmb3IgYWNjZXB0YW5jZS5cbiAgICAgICAgY29uc3QgZXhlY0VkaXRMZW5ndGggPSAoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBkaWFnb25hbFBhdGggPSBNYXRoLm1heChtaW5EaWFnb25hbFRvQ29uc2lkZXIsIC1lZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoIDw9IE1hdGgubWluKG1heERpYWdvbmFsVG9Db25zaWRlciwgZWRpdExlbmd0aCk7IGRpYWdvbmFsUGF0aCArPSAyKSB7XG4gICAgICAgICAgICAgICAgbGV0IGJhc2VQYXRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZVBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSwgYWRkUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCArIDFdO1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmVQYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG9uZSBlbHNlIGlzIGdvaW5nIHRvIGF0dGVtcHQgdG8gdXNlIHRoaXMgdmFsdWUsIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwZXJmIG9wdGltaXNhdGlvbi4gVGhpcyB0eXBlLXZpb2xhdGluZyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgY2FuQWRkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGFkZFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hhdCBuZXdQb3Mgd2lsbCBiZSBhZnRlciB3ZSBkbyBhbiBpbnNlcnRpb246XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZFBhdGhOZXdQb3MgPSBhZGRQYXRoLm9sZFBvcyAtIGRpYWdvbmFsUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgY2FuQWRkID0gYWRkUGF0aCAmJiAwIDw9IGFkZFBhdGhOZXdQb3MgJiYgYWRkUGF0aE5ld1BvcyA8IG5ld0xlbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuUmVtb3ZlID0gcmVtb3ZlUGF0aCAmJiByZW1vdmVQYXRoLm9sZFBvcyArIDEgPCBvbGRMZW47XG4gICAgICAgICAgICAgICAgaWYgKCFjYW5BZGQgJiYgIWNhblJlbW92ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIHBhdGggaXMgYSB0ZXJtaW5hbCB0aGVuIHBydW5lXG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBwZXJmIG9wdGltaXNhdGlvbi4gVGhpcyB0eXBlLXZpb2xhdGluZyB2YWx1ZSB3aWxsIG5ldmVyIGJlIHJlYWQuXG4gICAgICAgICAgICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTZWxlY3QgdGhlIGRpYWdvbmFsIHRoYXQgd2Ugd2FudCB0byBicmFuY2ggZnJvbS4gV2Ugc2VsZWN0IHRoZSBwcmlvclxuICAgICAgICAgICAgICAgIC8vIHBhdGggd2hvc2UgcG9zaXRpb24gaW4gdGhlIG9sZCBzdHJpbmcgaXMgdGhlIGZhcnRoZXN0IGZyb20gdGhlIG9yaWdpblxuICAgICAgICAgICAgICAgIC8vIGFuZCBkb2VzIG5vdCBwYXNzIHRoZSBib3VuZHMgb2YgdGhlIGRpZmYgZ3JhcGhcbiAgICAgICAgICAgICAgICBpZiAoIWNhblJlbW92ZSB8fCAoY2FuQWRkICYmIHJlbW92ZVBhdGgub2xkUG9zIDwgYWRkUGF0aC5vbGRQb3MpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2VQYXRoID0gdGhpcy5hZGRUb1BhdGgoYWRkUGF0aCwgdHJ1ZSwgZmFsc2UsIDAsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChyZW1vdmVQYXRoLCBmYWxzZSwgdHJ1ZSwgMSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiYXNlUGF0aCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIGRpYWdvbmFsUGF0aCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2VQYXRoLm9sZFBvcyArIDEgPj0gb2xkTGVuICYmIG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgaGl0IHRoZSBlbmQgb2YgYm90aCBzdHJpbmdzLCB0aGVuIHdlIGFyZSBkb25lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb25lKHRoaXMuYnVpbGRWYWx1ZXMoYmFzZVBhdGgubGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpKSB8fCB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IGJhc2VQYXRoO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heERpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWluKG1heERpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1BvcyArIDEgPj0gbmV3TGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5EaWFnb25hbFRvQ29uc2lkZXIgPSBNYXRoLm1heChtaW5EaWFnb25hbFRvQ29uc2lkZXIsIGRpYWdvbmFsUGF0aCArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWRpdExlbmd0aCsrO1xuICAgICAgICB9O1xuICAgICAgICAvLyBQZXJmb3JtcyB0aGUgbGVuZ3RoIG9mIGVkaXQgaXRlcmF0aW9uLiBJcyBhIGJpdCBmdWdseSBhcyB0aGlzIGhhcyB0byBzdXBwb3J0IHRoZVxuICAgICAgICAvLyBzeW5jIGFuZCBhc3luYyBtb2RlIHdoaWNoIGlzIG5ldmVyIGZ1bi4gTG9vcHMgb3ZlciBleGVjRWRpdExlbmd0aCB1bnRpbCBhIHZhbHVlXG4gICAgICAgIC8vIGlzIHByb2R1Y2VkLCBvciB1bnRpbCB0aGUgZWRpdCBsZW5ndGggZXhjZWVkcyBvcHRpb25zLm1heEVkaXRMZW5ndGggKGlmIGdpdmVuKSxcbiAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSBpdCB3aWxsIHJldHVybiB1bmRlZmluZWQuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgKGZ1bmN0aW9uIGV4ZWMoKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlZGl0TGVuZ3RoID4gbWF4RWRpdExlbmd0aCB8fCBEYXRlLm5vdygpID4gYWJvcnRBZnRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFleGVjRWRpdExlbmd0aCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH0oKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3aGlsZSAoZWRpdExlbmd0aCA8PSBtYXhFZGl0TGVuZ3RoICYmIERhdGUubm93KCkgPD0gYWJvcnRBZnRlclRpbWVzdGFtcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldCA9IGV4ZWNFZGl0TGVuZ3RoKCk7XG4gICAgICAgICAgICAgICAgaWYgKHJldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhZGRUb1BhdGgocGF0aCwgYWRkZWQsIHJlbW92ZWQsIG9sZFBvc0luYywgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBsYXN0ID0gcGF0aC5sYXN0Q29tcG9uZW50O1xuICAgICAgICBpZiAobGFzdCAmJiAhb3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbiAmJiBsYXN0LmFkZGVkID09PSBhZGRlZCAmJiBsYXN0LnJlbW92ZWQgPT09IHJlbW92ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb2xkUG9zOiBwYXRoLm9sZFBvcyArIG9sZFBvc0luYyxcbiAgICAgICAgICAgICAgICBsYXN0Q29tcG9uZW50OiB7IGNvdW50OiBsYXN0LmNvdW50ICsgMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdC5wcmV2aW91c0NvbXBvbmVudCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IDEsIGFkZGVkOiBhZGRlZCwgcmVtb3ZlZDogcmVtb3ZlZCwgcHJldmlvdXNDb21wb25lbnQ6IGxhc3QgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IG5ld1Rva2Vucy5sZW5ndGgsIG9sZExlbiA9IG9sZFRva2Vucy5sZW5ndGg7XG4gICAgICAgIGxldCBvbGRQb3MgPSBiYXNlUGF0aC5vbGRQb3MsIG5ld1BvcyA9IG9sZFBvcyAtIGRpYWdvbmFsUGF0aCwgY29tbW9uQ291bnQgPSAwO1xuICAgICAgICB3aGlsZSAobmV3UG9zICsgMSA8IG5ld0xlbiAmJiBvbGRQb3MgKyAxIDwgb2xkTGVuICYmIHRoaXMuZXF1YWxzKG9sZFRva2Vuc1tvbGRQb3MgKyAxXSwgbmV3VG9rZW5zW25ld1BvcyArIDFdLCBvcHRpb25zKSkge1xuICAgICAgICAgICAgbmV3UG9zKys7XG4gICAgICAgICAgICBvbGRQb3MrKztcbiAgICAgICAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbikge1xuICAgICAgICAgICAgICAgIGJhc2VQYXRoLmxhc3RDb21wb25lbnQgPSB7IGNvdW50OiAxLCBwcmV2aW91c0NvbXBvbmVudDogYmFzZVBhdGgubGFzdENvbXBvbmVudCwgYWRkZWQ6IGZhbHNlLCByZW1vdmVkOiBmYWxzZSB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjb21tb25Db3VudCAmJiAhb3B0aW9ucy5vbmVDaGFuZ2VQZXJUb2tlbikge1xuICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IGNvbW1vbkNvdW50LCBwcmV2aW91c0NvbXBvbmVudDogYmFzZVBhdGgubGFzdENvbXBvbmVudCwgYWRkZWQ6IGZhbHNlLCByZW1vdmVkOiBmYWxzZSB9O1xuICAgICAgICB9XG4gICAgICAgIGJhc2VQYXRoLm9sZFBvcyA9IG9sZFBvcztcbiAgICAgICAgcmV0dXJuIG5ld1BvcztcbiAgICB9XG4gICAgZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmNvbXBhcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmNvbXBhcmF0b3IobGVmdCwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0XG4gICAgICAgICAgICAgICAgfHwgKCEhb3B0aW9ucy5pZ25vcmVDYXNlICYmIGxlZnQudG9Mb3dlckNhc2UoKSA9PT0gcmlnaHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlRW1wdHkoYXJyYXkpIHtcbiAgICAgICAgY29uc3QgcmV0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJheVtpXSkge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgY2FzdElucHV0KHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIHRva2VuaXplKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHZhbHVlKTtcbiAgICB9XG4gICAgam9pbihjaGFycykge1xuICAgICAgICAvLyBBc3N1bWVzIFZhbHVlVCBpcyBzdHJpbmcsIHdoaWNoIGlzIHRoZSBjYXNlIGZvciBtb3N0IHN1YmNsYXNzZXMuXG4gICAgICAgIC8vIFdoZW4gaXQncyBmYWxzZSwgZS5nLiBpbiBkaWZmQXJyYXlzLCB0aGlzIG1ldGhvZCBuZWVkcyB0byBiZSBvdmVycmlkZGVuIChlLmcuIHdpdGggYSBuby1vcClcbiAgICAgICAgLy8gWWVzLCB0aGUgY2FzdHMgYXJlIHZlcmJvc2UgYW5kIHVnbHksIGJlY2F1c2UgdGhpcyBwYXR0ZXJuIC0gb2YgaGF2aW5nIHRoZSBiYXNlIGNsYXNzIFNPUlQgT0ZcbiAgICAgICAgLy8gYXNzdW1lIHRva2VucyBhbmQgdmFsdWVzIGFyZSBzdHJpbmdzLCBidXQgbm90IGNvbXBsZXRlbHkgLSBpcyB3ZWlyZCBhbmQgamFua3kuXG4gICAgICAgIHJldHVybiBjaGFycy5qb2luKCcnKTtcbiAgICB9XG4gICAgcG9zdFByb2Nlc3MoY2hhbmdlT2JqZWN0cywgXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGNoYW5nZU9iamVjdHM7XG4gICAgfVxuICAgIGdldCB1c2VMb25nZXN0VG9rZW4oKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYnVpbGRWYWx1ZXMobGFzdENvbXBvbmVudCwgbmV3VG9rZW5zLCBvbGRUb2tlbnMpIHtcbiAgICAgICAgLy8gRmlyc3Qgd2UgY29udmVydCBvdXIgbGlua2VkIGxpc3Qgb2YgY29tcG9uZW50cyBpbiByZXZlcnNlIG9yZGVyIHRvIGFuXG4gICAgICAgIC8vIGFycmF5IGluIHRoZSByaWdodCBvcmRlcjpcbiAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IFtdO1xuICAgICAgICBsZXQgbmV4dENvbXBvbmVudDtcbiAgICAgICAgd2hpbGUgKGxhc3RDb21wb25lbnQpIHtcbiAgICAgICAgICAgIGNvbXBvbmVudHMucHVzaChsYXN0Q29tcG9uZW50KTtcbiAgICAgICAgICAgIG5leHRDb21wb25lbnQgPSBsYXN0Q29tcG9uZW50LnByZXZpb3VzQ29tcG9uZW50O1xuICAgICAgICAgICAgZGVsZXRlIGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBsYXN0Q29tcG9uZW50ID0gbmV4dENvbXBvbmVudDtcbiAgICAgICAgfVxuICAgICAgICBjb21wb25lbnRzLnJldmVyc2UoKTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50TGVuID0gY29tcG9uZW50cy5sZW5ndGg7XG4gICAgICAgIGxldCBjb21wb25lbnRQb3MgPSAwLCBuZXdQb3MgPSAwLCBvbGRQb3MgPSAwO1xuICAgICAgICBmb3IgKDsgY29tcG9uZW50UG9zIDwgY29tcG9uZW50TGVuOyBjb21wb25lbnRQb3MrKykge1xuICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gY29tcG9uZW50c1tjb21wb25lbnRQb3NdO1xuICAgICAgICAgICAgaWYgKCFjb21wb25lbnQucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkICYmIHRoaXMudXNlTG9uZ2VzdFRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IG5ld1Rva2Vucy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvbGRUb2tlbnNbb2xkUG9zICsgaV07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2xkVmFsdWUubGVuZ3RoID4gdmFsdWUubGVuZ3RoID8gb2xkVmFsdWUgOiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQudmFsdWUgPSB0aGlzLmpvaW4obmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1BvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgLy8gQ29tbW9uIGNhc2VcbiAgICAgICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCkge1xuICAgICAgICAgICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihvbGRUb2tlbnMuc2xpY2Uob2xkUG9zLCBvbGRQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb21wb25lbnRzO1xuICAgIH1cbn1cbiIsICJpbXBvcnQgRGlmZiBmcm9tICcuL2Jhc2UuanMnO1xuaW1wb3J0IHsgZ2VuZXJhdGVPcHRpb25zIH0gZnJvbSAnLi4vdXRpbC9wYXJhbXMuanMnO1xuY2xhc3MgTGluZURpZmYgZXh0ZW5kcyBEaWZmIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy50b2tlbml6ZSA9IHRva2VuaXplO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgaWdub3Jpbmcgd2hpdGVzcGFjZSwgd2UgbmVlZCB0byBub3JtYWxpc2UgbGluZXMgYnkgc3RyaXBwaW5nXG4gICAgICAgIC8vIHdoaXRlc3BhY2UgYmVmb3JlIGNoZWNraW5nIGVxdWFsaXR5LiAoVGhpcyBoYXMgYW4gYW5ub3lpbmcgaW50ZXJhY3Rpb25cbiAgICAgICAgLy8gd2l0aCBuZXdsaW5lSXNUb2tlbiB0aGF0IHJlcXVpcmVzIHNwZWNpYWwgaGFuZGxpbmc6IGlmIG5ld2xpbmVzIGdldCB0aGVpclxuICAgICAgICAvLyBvd24gdG9rZW4sIHRoZW4gd2UgRE9OJ1Qgd2FudCB0byB0cmltIHRoZSAqbmV3bGluZSogdG9rZW5zIGRvd24gdG8gZW1wdHlcbiAgICAgICAgLy8gc3RyaW5ncywgc2luY2UgdGhpcyB3b3VsZCBjYXVzZSB1cyB0byB0cmVhdCB3aGl0ZXNwYWNlLW9ubHkgbGluZSBjb250ZW50XG4gICAgICAgIC8vIGFzIGVxdWFsIHRvIGEgc2VwYXJhdG9yIGJldHdlZW4gbGluZXMsIHdoaWNoIHdvdWxkIGJlIHdlaXJkIGFuZFxuICAgICAgICAvLyBpbmNvbnNpc3RlbnQgd2l0aCB0aGUgZG9jdW1lbnRlZCBiZWhhdmlvciBvZiB0aGUgb3B0aW9ucy4pXG4gICAgICAgIGlmIChvcHRpb25zLmlnbm9yZVdoaXRlc3BhY2UpIHtcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhbGVmdC5pbmNsdWRlcygnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMubmV3bGluZUlzVG9rZW4gfHwgIXJpZ2h0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIHJpZ2h0ID0gcmlnaHQudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9wdGlvbnMuaWdub3JlTmV3bGluZUF0RW9mICYmICFvcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICAgICAgICBpZiAobGVmdC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbGVmdC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmlnaHQuZW5kc1dpdGgoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN1cGVyLmVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucyk7XG4gICAgfVxufVxuZXhwb3J0IGNvbnN0IGxpbmVEaWZmID0gbmV3IExpbmVEaWZmKCk7XG5leHBvcnQgZnVuY3Rpb24gZGlmZkxpbmVzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZUcmltbWVkTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gZ2VuZXJhdGVPcHRpb25zKG9wdGlvbnMsIHsgaWdub3JlV2hpdGVzcGFjZTogdHJ1ZSB9KTtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG4vLyBFeHBvcnRlZCBzdGFuZGFsb25lIHNvIGl0IGNhbiBiZSB1c2VkIGZyb20ganNvbkRpZmYgdG9vLlxuZXhwb3J0IGZ1bmN0aW9uIHRva2VuaXplKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuc3RyaXBUcmFpbGluZ0NyKSB7XG4gICAgICAgIC8vIHJlbW92ZSBvbmUgXFxyIGJlZm9yZSBcXG4gdG8gbWF0Y2ggR05VIGRpZmYncyAtLXN0cmlwLXRyYWlsaW5nLWNyIGJlaGF2aW9yXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKTtcbiAgICB9XG4gICAgY29uc3QgcmV0TGluZXMgPSBbXSwgbGluZXNBbmROZXdsaW5lcyA9IHZhbHVlLnNwbGl0KC8oXFxufFxcclxcbikvKTtcbiAgICAvLyBJZ25vcmUgdGhlIGZpbmFsIGVtcHR5IHRva2VuIHRoYXQgb2NjdXJzIGlmIHRoZSBzdHJpbmcgZW5kcyB3aXRoIGEgbmV3IGxpbmVcbiAgICBpZiAoIWxpbmVzQW5kTmV3bGluZXNbbGluZXNBbmROZXdsaW5lcy5sZW5ndGggLSAxXSkge1xuICAgICAgICBsaW5lc0FuZE5ld2xpbmVzLnBvcCgpO1xuICAgIH1cbiAgICAvLyBNZXJnZSB0aGUgY29udGVudCBhbmQgbGluZSBzZXBhcmF0b3JzIGludG8gc2luZ2xlIHRva2Vuc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXNBbmROZXdsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBsaW5lID0gbGluZXNBbmROZXdsaW5lc1tpXTtcbiAgICAgICAgaWYgKGkgJSAyICYmICFvcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICAgICAgICByZXRMaW5lc1tyZXRMaW5lcy5sZW5ndGggLSAxXSArPSBsaW5lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0TGluZXMucHVzaChsaW5lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0TGluZXM7XG59XG4iLCAiLyoqXG4gKiBSZXZpZXctcGFja2FnZSBwYXJzaW5nIGZvciB0aGUgQ29kZXgtc3R5bGUgY29udmVyc2F0aW9uIGNhcmQuXG4gKlxuICogVGhlIHBsdWdpbiBpbmplY3RzIHRoZSBwZW5kaW5nIGlubGluZSBjb21tZW50cyAocGx1cyB0aGVpciBkaWZmIGh1bmtzIGFuZFxuICogdGhlIG9wdGlvbmFsIEFJIHZlcmRpY3QpIGFzIG9uZSBwbGFpbiB1c2VyIG1lc3NhZ2UuIFRoaXMgbW9kdWxlIHJlLXBhcnNlc1xuICogdGhhdCBtZXNzYWdlIHRleHQgc28gdGhlIGNvbnZlcnNhdGlvbiBjYW4gcmVuZGVyIGl0IGFzIGEgY2FyZCBcdTIwMTQgZWFjaFxuICogY29tbWVudCBjbGlja2FibGUgdG8ganVtcCB0byB0aGUgbWF0Y2hpbmcgY2hhbmdlIGJsb2NrIGluIHRoZSByZXZpZXcgcGFuZWwuXG4gKlxuICogUHVyZSBmdW5jdGlvbnMgb25seTogdGhlIGNsaWVudCBidW5kbGUgY2Fubm90IGJlIGltcG9ydGVkIGluIG5vZGUsIHNvIHRoZVxuICogdW5pdCB0ZXN0IChzY3JpcHRzL3Jldmlldy1wYWNrYWdlLXRlc3QubWpzKSBidW5kbGVzIHRoaXMgbW9kdWxlIHdpdGggZXNidWlsZFxuICogYW5kIGV4ZXJjaXNlcyB0aGUgZXhhY3Qgc2FtZSBjb2RlIHRoZSBicm93c2VyIHJ1bnMuXG4gKi9cblxuZXhwb3J0IGludGVyZmFjZSBSZXZpZXdQYWNrYWdlQ29tbWVudCB7XG4gIC8qKiBSZXBvLXJlbGF0aXZlIHBhdGggKHNhbWUgYXMgdGhlIHNlY3Rpb24gaGVhZGVyIHBhdGgpLiAqL1xuICBwYXRoOiBzdHJpbmdcbiAgLyoqIFBvc3QtY2hhbmdlIGxpbmUgKDEtYmFzZWQpOyBudWxsIHdoZW4gb25seSB0aGUgb2xkLWxpbmUgYW5jaG9yIGV4aXN0cy4gKi9cbiAgbGluZTogbnVtYmVyIHwgbnVsbFxuICAvKiogQ29tbWVudCB0ZXh0LiAqL1xuICB0ZXh0OiBzdHJpbmdcbiAgLyoqXG4gICAqIE9yaWdpbiByZXZpZXcgdGFiLCBjYXJyaWVkIGluIHRoZSBtZXNzYWdlIGFzIGEgYFtzXWAvYFt3XWAgdGFnIHNvIHRoZVxuICAgKiBjYXJkIGNhbiByb3V0ZSBpdHMganVtcDogJ3Nlc3Npb24nIGFuY2hvcnMgdG8gcmVsYXRpdmUgaHVuayBsaW5lcyxcbiAgICogJ3dvcmtzcGFjZScgdG8gcmVhbCBmaWxlIGxpbmVzLiBBYnNlbnQgb24gb2xkZXIgbWVzc2FnZXMuXG4gICAqL1xuICBzb3VyY2U/OiAnc2Vzc2lvbicgfCAnd29ya3NwYWNlJ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJldmlld1BhY2thZ2VGaW5kaW5nIHtcbiAgcHJpb3JpdHk6ICdQMCcgfCAnUDEnIHwgJ1AyJyB8ICdQMydcbiAgZmlsZTogc3RyaW5nXG4gIGxpbmU6IG51bWJlclxuICB0aXRsZTogc3RyaW5nXG4gIGRldGFpbDogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmV2aWV3UGFja2FnZSB7XG4gIC8qKiBXb3Jrc3BhY2Ugcm9vdCBlbWJlZGRlZCBpbiB0aGUgbWVzc2FnZSAoXHU1REU1XHU0RjVDXHU1MzNBXHVGRjFBLi4uKSwgd2hlbiBwcmVzZW50LiAqL1xuICB3b3Jrc3BhY2U6IHN0cmluZyB8IG51bGxcbiAgY29tbWVudHM6IFJldmlld1BhY2thZ2VDb21tZW50W11cbiAgdmVyZGljdDogJ2NvcnJlY3QnIHwgJ2luY29ycmVjdCcgfCBudWxsXG4gIGZpbmRpbmdzOiBSZXZpZXdQYWNrYWdlRmluZGluZ1tdXG59XG5cbi8qKiBGaXJzdCBub24tZW1wdHkgbGluZSBvZiB0aGUgbWVzc2FnZSAodGhlIG1lc3NhZ2UgaGVhZGVyIGxpbmUpLiAqL1xuY29uc3QgUkVWSUVXX1BSRUZJWCA9ICdcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkEnXG5cbi8qKiBAcmV0dXJucyB0cnVlIHdoZW4gdGhlIHRleHQgaXMgYSBjYXJyaWVkIHJldmlldyBwYWNrYWdlIChjYXJkLXdvcnRoeSkuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXZpZXdQYWNrYWdlVGV4dCh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgZmlyc3QgPSBmaXJzdE5vbkVtcHR5TGluZSh0ZXh0KVxuICByZXR1cm4gZmlyc3QgIT09IG51bGwgJiYgZmlyc3Quc3RhcnRzV2l0aChSRVZJRVdfUFJFRklYKVxufVxuXG5mdW5jdGlvbiBmaXJzdE5vbkVtcHR5TGluZSh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgZm9yIChjb25zdCByYXcgb2YgdGV4dC5zcGxpdCgnXFxuJykpIHtcbiAgICBjb25zdCB0ID0gcmF3LnRyaW0oKVxuICAgIGlmICh0ICE9PSAnJykgcmV0dXJuIHRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG4vKipcbiAqIFBhcnNlIGEgY2FycmllZCByZXZpZXctcGFja2FnZSBtZXNzYWdlIGJhY2sgaW50byBzdHJ1Y3R1cmVkIGRhdGEuXG4gKiBSZXR1cm5zIG51bGwgd2hlbiB0aGUgdGV4dCBpcyBub3QgYSByZXZpZXcgcGFja2FnZSAocGxhaW4gdXNlciBtZXNzYWdlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUmV2aWV3UGFja2FnZSh0ZXh0OiBzdHJpbmcpOiBSZXZpZXdQYWNrYWdlIHwgbnVsbCB7XG4gIGlmICghaXNSZXZpZXdQYWNrYWdlVGV4dCh0ZXh0KSkgcmV0dXJuIG51bGxcbiAgY29uc3QgcGtnOiBSZXZpZXdQYWNrYWdlID0geyB3b3Jrc3BhY2U6IG51bGwsIGNvbW1lbnRzOiBbXSwgdmVyZGljdDogbnVsbCwgZmluZGluZ3M6IFtdIH1cbiAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KCdcXG4nKVxuICBsZXQgaSA9IDBcblxuICAvLyAxLiBoZWFkZXIgbGluZSAodGhlIHByZWZpeCkgXHUyMDE0IGFscmVhZHkgbWF0Y2hlZCBieSBpc1Jldmlld1BhY2thZ2VUZXh0LlxuICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCkge1xuICAgIGNvbnN0IHQgPSBsaW5lc1tpXS50cmltKClcbiAgICBpICs9IDFcbiAgICBpZiAodCAhPT0gJycpIGJyZWFrXG4gIH1cblxuICAvLyAyLiBvcHRpb25hbCB3b3Jrc3BhY2UgbGluZSByaWdodCBhZnRlciB0aGUgaGVhZGVyLlxuICB3aGlsZSAoaSA8IGxpbmVzLmxlbmd0aCkge1xuICAgIGNvbnN0IHQgPSBsaW5lc1tpXS50cmltKClcbiAgICBpZiAodCA9PT0gJycpIHtcbiAgICAgIGkgKz0gMVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgY29uc3QgdyA9IC9eXHU1REU1XHU0RjVDXHU1MzNBWzpcdUZGMUFdXFxzKiguKykkLy5leGVjKHQpXG4gICAgaWYgKHcpIHtcbiAgICAgIHBrZy53b3Jrc3BhY2UgPSB3WzFdLnRyaW0oKSB8fCBudWxsXG4gICAgICBpICs9IDFcbiAgICB9XG4gICAgYnJlYWtcbiAgfVxuXG4gIC8vIDMuIHNlY3Rpb25zOiBgIyMgPHBhdGg+YCAoY29tbWVudHMgKyBvcHRpb25hbCBgYGBkaWZmIGh1bmspIGFuZFxuICAvLyAgICBgIyMgQUkgXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBYCAodmVyZGljdCArIGZpbmRpbmdzKS5cbiAgbGV0IHNlY3Rpb246IHN0cmluZyB8IG51bGwgPSBudWxsXG4gIGZvciAoOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByYXcgPSBsaW5lc1tpXVxuICAgIGNvbnN0IHQgPSByYXcudHJpbSgpXG4gICAgaWYgKHQgPT09ICcnKSBjb250aW51ZVxuICAgIGlmICh0LnN0YXJ0c1dpdGgoJyMjICcpKSB7XG4gICAgICBjb25zdCB0aXRsZSA9IHQuc2xpY2UoMykudHJpbSgpXG4gICAgICBzZWN0aW9uID0gdGl0bGUgPT09ICdBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkEnID8gJ3ZlcmRpY3QnIDogdGl0bGVcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmICh0LnN0YXJ0c1dpdGgoJ2BgYCcpKSB7XG4gICAgICAvLyBkaWZmIGZlbmNlIG9yIHN1Z2dlc3Rpb24gZmVuY2UgXHUyMDE0IGNvbnN1bWUgdW50aWwgdGhlIGNsb3NpbmcgZmVuY2UuXG4gICAgICBpICs9IDFcbiAgICAgIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoICYmICFsaW5lc1tpXS50cmltKCkuc3RhcnRzV2l0aCgnYGBgJykpIGkgKz0gMVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKHNlY3Rpb24gPT09ICd2ZXJkaWN0Jykge1xuICAgICAgaWYgKC9cdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OTgvLnRlc3QodCkgfHwgL3BhdGNoIGlzIGluY29ycmVjdC9pLnRlc3QodCkpIHBrZy52ZXJkaWN0ID0gJ2luY29ycmVjdCdcbiAgICAgIGVsc2UgaWYgKC9cdTg4NjVcdTRFMDFcdTZCNjNcdTc4NkUvLnRlc3QodCkgfHwgL3BhdGNoIGlzIGNvcnJlY3QvaS50ZXN0KHQpKSBwa2cudmVyZGljdCA9ICdjb3JyZWN0J1xuICAgICAgY29uc3QgZiA9IC9eLVxccypcXFsoUFswLTNdKVxcXVxccyooLis/KTooXFxkKykoPzotKFxcZCspKT9cXHMrKC4rPykoPzpcXHMqXHUyMDE0XFxzKiguKikpPyQvLmV4ZWModClcbiAgICAgIGlmIChmKSB7XG4gICAgICAgIHBrZy5maW5kaW5ncy5wdXNoKHsgcHJpb3JpdHk6IGZbMV0gYXMgUmV2aWV3UGFja2FnZUZpbmRpbmdbJ3ByaW9yaXR5J10sIGZpbGU6IGZbMl0sIGxpbmU6IE51bWJlcihmWzNdKSwgdGl0bGU6IGZbNV0sIGRldGFpbDogZls2XSA/PyAnJyB9KVxuICAgICAgfVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKHNlY3Rpb24gIT09IG51bGwgJiYgdC5zdGFydHNXaXRoKCctICcpKSB7XG4gICAgICBsZXQgYm9keSA9IHQuc2xpY2UoMikudHJpbSgpXG4gICAgICAvLyBPcHRpb25hbCBvcmlnaW4tdGFiIHRhZyAoYC0gW3NdIHBhdGg6XHUyMDI2YCAvIGAtIFt3XSBwYXRoOlx1MjAyNmApLlxuICAgICAgbGV0IHNvdXJjZTogUmV2aWV3UGFja2FnZUNvbW1lbnRbJ3NvdXJjZSddXG4gICAgICBjb25zdCBtVGFnID0gL15cXFsoW3N3XSlcXF1cXHMqKC4rKSQvLmV4ZWMoYm9keSlcbiAgICAgIGlmIChtVGFnKSB7XG4gICAgICAgIHNvdXJjZSA9IG1UYWdbMV0gPT09ICdzJyA/ICdzZXNzaW9uJyA6ICd3b3Jrc3BhY2UnXG4gICAgICAgIGJvZHkgPSBtVGFnWzJdLnRyaW0oKVxuICAgICAgfVxuICAgICAgY29uc3QgZXNjID0gZXNjYXBlUmVnZXgoc2VjdGlvbilcbiAgICAgIC8vIGAtIDxwYXRoPjo8bGluZU5ldz46IDx0ZXh0PmBcbiAgICAgIGNvbnN0IG1OZXcgPSBuZXcgUmVnRXhwKGBeJHtlc2N9OihcXFxcZCspOlxcXFxzKiguKikkYCkuZXhlYyhib2R5KVxuICAgICAgaWYgKG1OZXcpIHtcbiAgICAgICAgcGtnLmNvbW1lbnRzLnB1c2goeyBwYXRoOiBzZWN0aW9uLCBsaW5lOiBOdW1iZXIobU5ld1sxXSksIHRleHQ6IG1OZXdbMl0sIHNvdXJjZSB9KVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgLy8gYC0gPHBhdGg+IChvbGQgbGluZSA8bGluZU9sZD4pOiA8dGV4dD5gXG4gICAgICBjb25zdCBtT2xkID0gbmV3IFJlZ0V4cChgXiR7ZXNjfSBcXFxcKG9sZCBsaW5lIChcXFxcZCspXFxcXCk6XFxcXHMqKC4qKSRgKS5leGVjKGJvZHkpXG4gICAgICBpZiAobU9sZCkge1xuICAgICAgICBwa2cuY29tbWVudHMucHVzaCh7IHBhdGg6IHNlY3Rpb24sIGxpbmU6IG51bGwsIHRleHQ6IG1PbGRbMl0sIHNvdXJjZSB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGtnXG59XG5cbmZ1bmN0aW9uIGVzY2FwZVJlZ2V4KHM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJylcbn1cbiJdLAog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QTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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QUEsUUFDTixRQUFRLENBQUMsVUFBVTtBQUFBLFFBQ25CLFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBTUEsYUFBVyxPQUFPLENBQUMsUUFBUSxVQUFVLEdBQVk7QUFDL0MsUUFBSSxNQUFNO0FBQUEsTUFBTztBQUFBLE1BQTBCLE1BQ3pDLElBQUksTUFBTTtBQUFBLFFBQ1I7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOO0FBQUEsVUFDQSxVQUFVO0FBQUEsVUFDVixRQUFRO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFJQSxNQUFJLE1BQU07QUFBQSxJQUFPO0FBQUEsSUFBd0IsTUFDdkMsSUFBSSxNQUFNO0FBQUEsTUFDUjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFsidmFsdWUiLCAibmFtZSIsICJzY3JvbGxUaW1lciIsICJjbGVhclRpbWVyIl0KfQo=

		})(module, module.exports, require);
		return module.exports;
	}
});
