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
        selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-code-editor", children: [
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIiwgInNyYy9jbGllbnQvcmV2aWV3LXBhY2thZ2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRGlmZi1yZXZpZXcgcGx1Z2luIFx1MjAxNCBjbGllbnQgaGFsZi5cbiAqXG4gKiBDb2RleC1zdHlsZSByZXZpZXcgd2l0aCB0d28gc291cmNlczpcbiAqXG4gKiAxLiAqKlx1NEYxQVx1OEJERFx1NjZGNFx1NjUzOSAoU2Vzc2lvbiBjaGFuZ2VzKSoqIFx1MjAxNCB3aGF0IHRoZSBhZ2VudCBjaGFuZ2VkIGluIGVhY2ggcm91bmQgb2ZcbiAqICAgIHRoaXMgY29udmVyc2F0aW9uLCBkZXJpdmVkIGZyb20gdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdDogZWFjaCB0b29sXG4gKiAgICByZXN1bHQgdGhhdCBjYXJyaWVkIGZpbGUgZGlmZnMgYmVjb21lcyBjaGFuZ2UgZW50cmllcyAoaG9zdC1jb21wdXRlZFxuICogICAgYHJlc3VsdFZpZXdgIGh1bmtzLCBlbHNlIGNhbGwtdmlldy9tZXRhIGRpZmZzLCBlbHNlIGEgcGF0aC1vbmx5IGVudHJ5KS5cbiAqICAgIFdvcmtzIHdpdGggb3Igd2l0aG91dCBnaXQsIGFuZCBzaG93cyBhIGNoYW5nZSBldmVuIHdoZW4gbm8gZGlmZiB0ZXh0IGlzXG4gKiAgICBhdmFpbGFibGUgKHBhdGgtb25seSkuXG4gKiAyLiAqKlx1NURFNVx1NEY1Q1x1NTMzQSAoV29ya3NwYWNlKSoqIFx1MjAxNCB0aGUgZ2l0IHdvcmtpbmcgdHJlZSdzIHVuY29tbWl0dGVkIGNoYW5nZXNcbiAqICAgIChzdGFnZWQgKyB1bnN0YWdlZCArIHVudHJhY2tlZCkgd2l0aCBwZXItZmlsZSAvIGFsbC1maWxlIGFjY2VwdCAoc3RhZ2UpXG4gKiAgICBhbmQgcmV2ZXJ0IChkaXNjYXJkKSB0aHJvdWdoIHRoZSBwbHVnaW4ncyBzZXJ2ZXIgcm91dGVzLlxuICpcbiAqIFRoZSByZXZpZXcgc3VyZmFjZSBtb3VudHMgaW4gYHNoZWxsLm92ZXJsYXlgIChyb290IHNjb3BlKS4gU3RhdGUgaGFuZC1vZmZcbiAqIGJldHdlZW4gdGhlIHNlc3Npb24tc2NvcGVkIGhlYWRlciB0cmlnZ2VyIGFuZCB0aGUgcm9vdC1zY29wZWQgb3ZlcmxheSBnb2VzXG4gKiB0aHJvdWdoIGEgbW9kdWxlLWxldmVsIHNuYXBzaG90IHN0b3JlOyB0aGUgY29udmVyc2F0aW9uIHNuYXBzaG90IGZvciB0aGVcbiAqIGN1cnJlbnQgc2Vzc2lvbiBpcyByZWFkIHJlYWN0aXZlbHkgdGhyb3VnaCBgY3R4LnNlc3Npb25zYCAoaW5qZWN0ZWQgdmlhIHRoZVxuICogb3ZlcmxheSByZWdpc3RyYXRpb24ncyBpbmplY3QgZmFjZSkuXG4gKi9cbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSwgdXNlU3luY0V4dGVybmFsU3RvcmUsIEZyYWdtZW50IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENTU1Byb3BlcnRpZXMsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBkaWZmTGluZXMgfSBmcm9tICdkaWZmJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0LCBJU2Vzc2lvbnMsIFNlc3Npb25MaXN0U3RhdGUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB7IGNyZWF0ZVNuYXBzaG90U3RvcmUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgUHJvcHNMb2NhbGUsIFByb3BzUnVudGltZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNsb3RzJ1xuaW1wb3J0IHR5cGUgeyBDb252ZXJzYXRpb25Ob2RlLCBUb29sUmVzdWx0Tm9kZSwgVXNlck1lc3NhZ2VOb2RlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFNlc3Npb25JZCwgVG9vbFJlc3VsdFZpZXcgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWFwaS1yZW1vdGVzL2NsaWVudCdcbmltcG9ydCB7IEljb25DaGV2cm9uRG93bk91dGxpbmUxNCwgd3JpdGVDbGlwYm9hcmQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuaW1wb3J0IHsgSW1hZ2VHYWxsZXJ5IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktYXR0YWNobWVudCdcbmltcG9ydCB0eXBlIHsgSW1hZ2VBdHRhY2htZW50UmVmIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hdHRhY2htZW50J1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEZpbGVSZWFkUmVzcG9uc2UsIEZpbGVzTGlzdFJlc3BvbnNlLCBGaWxlV3JpdGVSZXNwb25zZSwgR2l0UmVzcG9uc2UsIEhpc3RvcnlSZXNwb25zZSwgUHJSZXNwb25zZSwgUmVwb3NSZXNwb25zZSwgUmV2aWV3Q29tbWVudCwgUmV2aWV3RmluZGluZywgUmV2aWV3UmVzcG9uc2UsIFN0YXR1c1Jlc3BvbnNlLCBXb3Jrc3BhY2VGaWxlRW50cnkgfSBmcm9tICcuLi9zaGFyZWQvdHlwZXMudHMnXG5pbXBvcnQgeyBwYXJzZVJldmlld1BhY2thZ2UsIGlzUmV2aWV3UGFja2FnZVRleHQgfSBmcm9tICcuL3Jldmlldy1wYWNrYWdlLnRzJ1xuaW1wb3J0IHR5cGUgeyBSZXZpZXdQYWNrYWdlLCBSZXZpZXdQYWNrYWdlQ29tbWVudCwgUmV2aWV3UGFja2FnZUZpbmRpbmcgfSBmcm9tICcuL3Jldmlldy1wYWNrYWdlLnRzJ1xuXG5leHBvcnQgY29uc3QgbmFtZSA9ICdkaWZmLXJldmlldydcblxuLyoqIFJlcXVpcmVkIGNsaWVudCBzZXJ2aWNlcyAoZmliZXIgaW5qZWN0KS4gKi9cbmV4cG9ydCBjb25zdCBpbmplY3QgPSBbJ3Nlc3Npb25zJywgJ3Nsb3RzJywgJ2xvY2FsZSddXG5cbmNvbnN0IExPQ0FMRV9OUyA9ICdkaWZmLXJldmlldydcbi8qKiBNYXggY29tbWVudCBjaGlwcyBzaG93biBpbiB0aGUgZG9jayByb3cgYmVmb3JlIGNvbGxhcHNpbmcgaW50byArTi4gKi9cbmNvbnN0IE1BWF9ET0NLX0NISVBTID0gNFxuY29uc3QgU1RBVFVTX1VSTCA9ICdkaWZmLXJldmlldy9zdGF0dXMnXG5jb25zdCBBUFBMWV9VUkwgPSAnZGlmZi1yZXZpZXcvYXBwbHknXG5jb25zdCBBUFBMWV9IVU5LX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseS1odW5rJ1xuY29uc3QgQ09NTUlUX1VSTCA9ICdkaWZmLXJldmlldy9jb21taXQnXG5jb25zdCBQVVNIX1VSTCA9ICdkaWZmLXJldmlldy9wdXNoJ1xuY29uc3QgSElTVE9SWV9VUkwgPSAnZGlmZi1yZXZpZXcvaGlzdG9yeSdcbmNvbnN0IENPTU1JVF9ESUZGX1VSTCA9ICdkaWZmLXJldmlldy9jb21taXQtZGlmZidcbmNvbnN0IENPTU1FTlRTX1VSTCA9ICdkaWZmLXJldmlldy9jb21tZW50cydcbmNvbnN0IEJSQU5DSEVTX1VSTCA9ICdkaWZmLXJldmlldy9icmFuY2hlcydcbmNvbnN0IFJFVklFV19VUkwgPSAnZGlmZi1yZXZpZXcvcmV2aWV3J1xuY29uc3QgUFJfVVJMID0gJ2RpZmYtcmV2aWV3L3ByJ1xuY29uc3QgUkVQT1NfVVJMID0gJ2RpZmYtcmV2aWV3L3JlcG9zJ1xuY29uc3QgRklMRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2ZpbGVzJ1xuY29uc3QgT1BFTl9FRElUT1JfVVJMID0gJ29wZW4tZWRpdG9yL29wZW4nXG5jb25zdCBTVFlMRV9UQUcgPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldy9yZXZpZXcuY3NzJ1xuXG4vKiogT3BlbiBzdGF0ZSBzaGFyZWQgYmV0d2VlbiB0aGUgaGVhZGVyIHRyaWdnZXIgKHNlc3Npb24gc2NvcGUpIGFuZCB0aGUgb3ZlcmxheSAocm9vdCBzY29wZSkuICovXG5jb25zdCBvdmVybGF5U3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPHsgb3BlbjogYm9vbGVhbjsgY3dkOiBzdHJpbmcgfCBudWxsOyBrZXk6IG51bWJlcjsgZm9jdXM/OiB7IHBhdGg6IHN0cmluZzsgbGluZT86IG51bWJlcjsgcm91bmQ/OiBudW1iZXI7IHRhYj86ICdzZXNzaW9uJyB8ICd3b3Jrc3BhY2UnIH0gfCBudWxsIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxuICBmb2N1czogbnVsbCxcbn0pXG5cbi8qKlxuICogUGVuZGluZyBpbmxpbmUgY29tbWVudHMgc3VyZmFjZWQgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSkuIFRoZVxuICogcmV2aWV3IG92ZXJsYXkgc3luY3MgaXRzIHdvcmtzcGFjZSBjb21tZW50cyAocGx1cyB0aGUgZGlmZiBjb250ZXh0IGFuZCB0aGVcbiAqIGxhc3QgQUkgcmV2aWV3IHJlc3VsdCkgaGVyZTsgdGhlIGNvbXBvc2VyIGRvY2sgcmVhZHMgdGhlbSBhbmQgY2FycmllcyBhXG4gKiBmdWxsIHJldmlldyBwYWNrYWdlIHdpdGggdGhlIHVzZXIncyBuZXh0IG1lc3NhZ2UuXG4gKi9cbmludGVyZmFjZSBQZW5kaW5nQ29tbWVudHMge1xuICBjd2Q6IHN0cmluZyB8IG51bGxcbiAgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXVxuICAvKiogVW5pZmllZCBkaWZmIHRleHQgcGVyIGNvbW1lbnRlZCBwYXRoIChjb250ZXh0IGZvciB0aGUgY2FycmllZCBtZXNzYWdlKS4gKi9cbiAgZGlmZnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgLyoqIExhc3QgQUkgcmV2aWV3IHJlc3VsdCAodmVyZGljdCArIGZpbmRpbmdzKSwgYXBwZW5kZWQgdG8gdGhlIGNhcnJpZWQgbWVzc2FnZS4gKi9cbiAgcmV2aWV3OiBSZXZpZXdSZXNwb25zZSB8IG51bGxcbn1cbmNvbnN0IHBlbmRpbmdDb21tZW50c1N0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxQZW5kaW5nQ29tbWVudHM+KHtcbiAgY3dkOiBudWxsLFxuICBjb21tZW50czogW10sXG4gIGRpZmZzOiB7fSxcbiAgcmV2aWV3OiBudWxsLFxufSlcblxuLyoqXG4gKiBEdXJhYmxlLCBwZXItd29ya3NwYWNlIFwiYWxyZWFkeSBjYXJyaWVkXCIgc3RhdGUgKHN1cnZpdmVzIHJlbG9hZHM7IGlzb2xhdGVkXG4gKiBwZXIgY3dkIHNvIGNvbW1lbnRzIHNlbnQgaW4gb25lIHdvcmtzcGFjZSBuZXZlciBmaWx0ZXIgYW5vdGhlcidzKS5cbiAqL1xuY29uc3Qgc2VudFN0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxSZWNvcmQ8c3RyaW5nLCB7IHNlbnRDb21tZW50SWRzOiBzdHJpbmdbXTsgc2VudFJldmlld0tleTogc3RyaW5nIHwgbnVsbCB9Pj4oe30sIHsgcGVyc2lzdDogeyBuYW1lOiAnZHNkci1yZXZpZXctc2VudCcgfSB9KVxuXG4vKiogSW5qZWN0IHRleHQgaW50byBhIHNlc3Npb24gYXMgYSB1c2VyIG1lc3NhZ2U7IGZhbGxzIGJhY2sgdG8gdGhlIGNsaXBib2FyZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluamVjdFRvU2Vzc2lvbihzZXNzaW9uczogSVNlc3Npb25zIHwgdW5kZWZpbmVkLCBzZXNzaW9uSWQ6IFNlc3Npb25JZCB8IG51bGwsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8J3NlbnQnIHwgJ2NvcGllZCcgfCAnZmFpbGVkJz4ge1xuICBjb25zdCBiaW5kaW5nID0gc2Vzc2lvbklkID8gc2Vzc2lvbnM/LmJpbmRpbmcoc2Vzc2lvbklkKSA6IHVuZGVmaW5lZFxuICBjb25zdCBzZXNzaW9uID0gYmluZGluZz8uc2Vzc2lvblxuICBpZiAoc2Vzc2lvbikge1xuICAgIHRyeSB7XG4gICAgICAvLyAnc3RlZXInIChub3QgJ3F1ZXVlJyk6IHRoZSByZXZpZXcgcGFja2FnZSBpcyBpbmplY3RlZCBhcyBhIHN0ZWVyaW5nXG4gICAgICAvLyBtZXNzYWdlIFx1MjAxNCB0aGUgYWdlbnQgaGFuZGxlcyBpdCBvbiBpdHMgbmV4dCBzdGVwIChvciB0aGUgaWRsZSBhZ2VudCBpc1xuICAgICAgLy8gd29rZW4gaW1tZWRpYXRlbHkpLCBzbyBpdCBuZXZlciBzaG93cyB1cCBhcyBhIHF1ZXVlZCBpdGVtIGFib3ZlIHRoZVxuICAgICAgLy8gaW5wdXQuICdxdWV1ZScgd291bGQgYXBwZW5kIGFmdGVyIHRoZSBjdXJyZW50IHR1cm4gYW5kIHN1cmZhY2UgYXMgYVxuICAgICAgLy8gXCJcdTYzOTJcdTk2MUZcdTRGRTFcdTYwNkZcIiBzdHJpcCBpbnN0ZWFkLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgc2Vzc2lvbi5wcm9tcHQoW3sgdHlwZTogJ3RleHQnLCB0ZXh0IH1dLCAnc3RlZXInKVxuICAgICAgaWYgKHJlc3VsdC5vaykgcmV0dXJuICdzZW50J1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBjb3B5IGZhbGxiYWNrXG4gICAgfVxuICB9XG4gIHRyeSB7XG4gICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgICByZXR1cm4gJ2NvcGllZCdcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICdmYWlsZWQnXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSZXZpZXcgcHJlZmVyZW5jZXMgKGZvbnQgLyBzaXplIC8gcGFuZWwgZ2VvbWV0cnkpLCBzaGFyZWQgYnkgdGhlIG92ZXJsYXlcbi8vIGFuZCB0aGUgU2V0dGluZ3MgXHUyMTkyIEdlbmVyYWwgcm93LiBQZXJzaXN0ZWQgdG8gbG9jYWxTdG9yYWdlIGJ5IHRoZSBzdG9yZS5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogUGFuZWwgZ2VvbWV0cnkgYm91bmRzLiAqL1xuZXhwb3J0IGNvbnN0IE1JTl9QQU5FTF9XID0gNjQwXG5leHBvcnQgY29uc3QgTUlOX1BBTkVMX0ggPSA0MDBcblxuaW50ZXJmYWNlIFByZWZzIHtcbiAgLyoqIEZvbnQgb3B0aW9uIGlkIChzZWUgRk9OVF9PUFRJT05TKS4gKi9cbiAgZm9udDogc3RyaW5nXG4gIC8qKiBEaWZmIHRleHQgc2l6ZSBpbiBweC4gKi9cbiAgc2l6ZTogbnVtYmVyXG4gIC8qKiBQYW5lbCB3aWR0aCBpbiBweC4gKi9cbiAgd2lkdGg6IG51bWJlclxuICAvKiogUGFuZWwgaGVpZ2h0IGluIHB4LiAqL1xuICBoZWlnaHQ6IG51bWJlclxufVxuXG5jb25zdCBGT05UX09QVElPTlM6IHsgaWQ6IHN0cmluZzsgbGFiZWw6IHN0cmluZzsgY3NzOiBzdHJpbmcgfVtdID0gW1xuICB7IGlkOiAnbW9ubycsIGxhYmVsOiAnZm9udC5tb25vJywgY3NzOiAndmFyKC0tZHN3LWZvbnQtbW9ubyknIH0sXG4gIHsgaWQ6ICdzeXN0ZW0nLCBsYWJlbDogJ2ZvbnQuc3lzdGVtJywgY3NzOiAnc3lzdGVtLXVpLCAtYXBwbGUtc3lzdGVtLCBzYW5zLXNlcmlmJyB9LFxuICB7IGlkOiAnY29uc29sYXMnLCBsYWJlbDogJ0NvbnNvbGFzJywgY3NzOiAnQ29uc29sYXMsIFwiQ291cmllciBOZXdcIiwgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnamV0YnJhaW5zJywgbGFiZWw6ICdKZXRCcmFpbnMgTW9ubycsIGNzczogJ1wiSmV0QnJhaW5zIE1vbm9cIiwgQ29uc29sYXMsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ2ZpcmEnLCBsYWJlbDogJ0ZpcmEgQ29kZScsIGNzczogJ1wiRmlyYSBDb2RlXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdzb3VyY2UnLCBsYWJlbDogJ1NvdXJjZSBDb2RlIFBybycsIGNzczogJ1wiU291cmNlIENvZGUgUHJvXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG5dXG5cbmNvbnN0IFNJWkVfT1BUSU9OUyA9IFsxMSwgMTIsIDEzLCAxNCwgMTYsIDE4XVxuXG4vKiogUmV2aWV3IHNjb3BlcyBvZiB0aGUgd29ya3NwYWNlIHRhYiAoYWxpZ25lZCB3aXRoIHRoZSBDb2RleCByZXZpZXcgcGFuZSkuICovXG50eXBlIFdvcmtzcGFjZVNjb3BlID0gJ2FsbCcgfCAndW5zdGFnZWQnIHwgJ3N0YWdlZCcgfCAnY29tbWl0JyB8ICdicmFuY2gnIHwgJ2xhc3QtdHVybidcblxuLyoqIFJldmlldy1zY29wZSBkcm9wZG93biBvcHRpb25zOiBlYWNoIGlkIG1hcHMgdG8gYSBsb2NhbGUgbGFiZWwgaW4gYHpoYC9gZW5gLiAqL1xuY29uc3QgU0NPUEVfT1BUSU9OUzogeyBpZDogV29ya3NwYWNlU2NvcGU7IGxhYmVsOiBrZXlvZiB0eXBlb2YgemggfVtdID0gW1xuICB7IGlkOiAndW5zdGFnZWQnLCBsYWJlbDogJ3Njb3BlLnVuc3RhZ2VkJyB9LFxuICB7IGlkOiAnc3RhZ2VkJywgbGFiZWw6ICdzY29wZS5zdGFnZWQnIH0sXG4gIHsgaWQ6ICdjb21taXQnLCBsYWJlbDogJ3Njb3BlLmNvbW1pdCcgfSxcbiAgeyBpZDogJ2JyYW5jaCcsIGxhYmVsOiAnc2NvcGUuYnJhbmNoJyB9LFxuICB7IGlkOiAnbGFzdC10dXJuJywgbGFiZWw6ICdzY29wZS5sYXN0LXR1cm4nIH0sXG5dXG5cbi8qKiBCcm93c2VyLXNpZGUgYWJzb2x1dGUgcGF0aCBjaGVjayAobm8gbm9kZTpwYXRoIGluIHRoZSBjbGllbnQgYnVuZGxlKS4gKi9cbmZ1bmN0aW9uIGlzQWJzUGF0aChwOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHAuc3RhcnRzV2l0aCgnLycpIHx8IC9eW0EtWmEtel06W1xcXFwvXS8udGVzdChwKVxufVxuXG4vKiogTGFyZ2VzdCBvZiB0aHJlZSBudW1iZXJzIChwcmVmZXJzIGIgb24gdGllcykuICovXG5mdW5jdGlvbiBtYXhPZjMoYTogbnVtYmVyLCBiOiBudW1iZXIsIGM6IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChiID49IGEgJiYgYiA+PSBjKSByZXR1cm4gYlxuICBpZiAoYSA+PSBjKSByZXR1cm4gYVxuICByZXR1cm4gY1xufVxuXG5mdW5jdGlvbiBiYXNlTmFtZShwOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcC5zcGxpdCgvW1xcXFwvXS8pLnBvcCgpID8/IHBcbn1cblxuY29uc3QgcHJlZnNTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UHJlZnM+KFxuICB7IGZvbnQ6ICdtb25vJywgc2l6ZTogMTIsIHdpZHRoOiAxMTIwLCBoZWlnaHQ6IDcyMCB9LFxuICB7IHBlcnNpc3Q6IHsgbmFtZTogJ2RzZHItcHJlZnMnIH0gfSxcbilcblxuLyoqIENTUyBmb250LWZhbWlseSBmb3IgYSBzdG9yZWQgZm9udCBvcHRpb24gaWQuICovXG5mdW5jdGlvbiBmb250Q3NzKGlkOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gRk9OVF9PUFRJT05TLmZpbmQoKGYpID0+IGYuaWQgPT09IGlkKT8uY3NzID8/IEZPTlRfT1BUSU9OU1swXS5jc3Ncbn1cblxuLyoqIFBhbmVsIENTUyB2YXJpYWJsZXMgY2FycnlpbmcgdGhlIGZvbnQvc2l6ZSBwcmVmZXJlbmNlLiAqL1xuZnVuY3Rpb24gZGlmZlN0eWxlVmFycyhwcmVmczogUHJlZnMpOiBDU1NQcm9wZXJ0aWVzIHtcbiAgcmV0dXJuIHtcbiAgICAnLS1kc2RyLWRpZmYtZm9udCc6IGZvbnRDc3MocHJlZnMuZm9udCksXG4gICAgJy0tZHNkci1kaWZmLXNpemUnOiBgJHtwcmVmcy5zaXplfXB4YCxcbiAgfSBhcyBDU1NQcm9wZXJ0aWVzXG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gU2Vzc2lvbi1jaGFuZ2VzIGV4dHJhY3Rpb24gKGNsaWVudC1zaWRlLCB3b3JrcyB3aXRob3V0IGdpdCkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBiZWZvcmUvYWZ0ZXIgc2xpY2Ugb2YgYSBjaGFuZ2UgKGEgaHVuaykuICovXG5pbnRlcmZhY2UgSHVuayB7XG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBPbmUgZmlsZSBjaGFuZ2VkIGluc2lkZSBvbmUgcm91bmQuICovXG5pbnRlcmZhY2UgUm91bmRDaGFuZ2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgdG9vbDogc3RyaW5nXG4gIGh1bmtzOiBIdW5rW11cbiAgLyoqIEZhbHNlIHdoZW4gb25seSB0aGUgcGF0aCBpcyBrbm93biAobm8gZGlmZiBkYXRhIHBlcnNpc3RlZCkuICovXG4gIGhhc0RpZmY6IGJvb2xlYW5cbn1cblxuLyoqIE9uZSB1c2VyIHJvdW5kIGFuZCB0aGUgZmlsZXMgaXQgY2hhbmdlZC4gKi9cbmludGVyZmFjZSBTZXNzaW9uUm91bmQge1xuICByb3VuZDogbnVtYmVyXG4gIGxhYmVsOiBzdHJpbmdcbiAgY2hhbmdlczogUm91bmRDaGFuZ2VbXVxufVxuXG4vKiogT25lIGZpbGUgc3VtbWFyaXplZCBpbiB0aGUgcmVwbHktbG9jYWwgY2hhbmdlcyBjYXJkLiAqL1xuaW50ZXJmYWNlIFR1cm5DaGFuZ2VTdW1tYXJ5IHtcbiAgcGF0aDogc3RyaW5nXG4gIGFkZGVkOiBudW1iZXJcbiAgZGVsZXRlZDogbnVtYmVyXG59XG5cbmludGVyZmFjZSBGaWxlRGlmZkxpa2Uge1xuICBwYXRoOiBzdHJpbmdcbiAgb2xkVGV4dDogc3RyaW5nIHwgbnVsbFxuICBuZXdUZXh0OiBzdHJpbmdcbn1cblxuLyoqIFZhbGlkYXRlIGEgcmF3IEZpbGVEaWZmLXNoYXBlZCB2YWx1ZSAodGhlIHRvb2xzJyBge3BhdGgsIG9sZFRleHQsIG5ld1RleHR9YCBjb250cmFjdCkuICovXG5mdW5jdGlvbiBhc0ZpbGVEaWZmKHJhdzogdW5rbm93bik6IEZpbGVEaWZmTGlrZSB8IG51bGwge1xuICBpZiAoIXJhdyB8fCB0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgY29uc3QgcmVjID0gcmF3IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gIGlmICh0eXBlb2YgcmVjLnBhdGggIT09ICdzdHJpbmcnIHx8ICFyZWMucGF0aCkgcmV0dXJuIG51bGxcbiAgaWYgKHR5cGVvZiByZWMubmV3VGV4dCAhPT0gJ3N0cmluZycpIHJldHVybiBudWxsXG4gIGNvbnN0IG9sZFRleHQgPSByZWMub2xkVGV4dFxuICByZXR1cm4geyBwYXRoOiByZWMucGF0aCwgb2xkVGV4dDogdHlwZW9mIG9sZFRleHQgPT09ICdzdHJpbmcnID8gb2xkVGV4dCA6IG51bGwsIG5ld1RleHQ6IHJlYy5uZXdUZXh0IH1cbn1cblxuLyoqIERpZmYgaHVua3MgY2FycmllZCBieSBhIGRpZmYgY2FyZCAoY2FsbCB2aWV3IG9yIHJlc3VsdCB2aWV3KS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbURpZmZDYXJkKHZpZXc6IHsgY2FyZD86IHVua25vd247IGRpZmZzPzogdW5rbm93biB9IHwgbnVsbCB8IHVuZGVmaW5lZCk6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCF2aWV3IHx8IHZpZXcuY2FyZCAhPT0gJ2RpZmYnIHx8ICFBcnJheS5pc0FycmF5KHZpZXcuZGlmZnMpKSByZXR1cm4gW11cbiAgcmV0dXJuIHZpZXcuZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbi8qKiBIdW1hbiBsYWJlbCBmb3IgYSBjYWxsIHdob3NlIGBjYWxsYCBoZWFkIHdhcyB0cnVuY2F0ZWQgb3V0IG9mIHRoZSB3aW5kb3cuICovXG5mdW5jdGlvbiBkaWZmQ2FyZFRpdGxlKHZpZXc6IHVua25vd24pOiBzdHJpbmcgfCBudWxsIHtcbiAgaWYgKCF2aWV3IHx8IHR5cGVvZiB2aWV3ICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgY29uc3QgdGl0bGUgPSAodmlldyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikudGl0bGVcbiAgcmV0dXJuIHR5cGVvZiB0aXRsZSA9PT0gJ3N0cmluZycgJiYgdGl0bGUudHJpbSgpID8gdGl0bGUudHJpbSgpIDogbnVsbFxufVxuXG4vKiogUmF3IGBtZXRhLmRpZmZzYCBmYWxsYmFjayAodGhlIHBlcnNpc3RlZCB0b29sL3Jlc3VsdCBtZXRhKS4gKi9cbmZ1bmN0aW9uIGRpZmZzRnJvbU1ldGEobWV0YTogdW5rbm93bik6IEZpbGVEaWZmTGlrZVtdIHtcbiAgaWYgKCFtZXRhIHx8IHR5cGVvZiBtZXRhICE9PSAnb2JqZWN0JykgcmV0dXJuIFtdXG4gIGNvbnN0IGRpZmZzID0gKG1ldGEgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLmRpZmZzXG4gIGlmICghQXJyYXkuaXNBcnJheShkaWZmcykpIHJldHVybiBbXVxuICByZXR1cm4gZGlmZnMubWFwKGFzRmlsZURpZmYpLmZpbHRlcigoZCk6IGQgaXMgRmlsZURpZmZMaWtlID0+IGQgIT09IG51bGwpXG59XG5cbmNvbnN0IE1VVEFUSU9OX1RPT0xTID0gbmV3IFNldChbJ3N0cl9yZXBsYWNlX2VkaXRvcicsICdub3RlYm9va19lZGl0J10pXG5jb25zdCBNVVRBVElPTl9DT01NQU5EUyA9IG5ldyBTZXQoWyd3cml0ZScsICdlZGl0JywgJ3JlcGxhY2UnLCAnZGVsZXRlJywgJ21vdmUnXSlcblxuLyoqIFBhdGgtb25seSBmYWxsYmFjayBmb3Iga25vd24gZmlsZS1tdXRhdGluZyB0b29scyB3aG9zZSByZXN1bHQgY2FycmllZCBubyBkaWZmLiAqL1xuZnVuY3Rpb24gbXV0YXRpb25QYXRoKHRvb2w6IHN0cmluZywgYXJnc1Jhdzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gIGxldCBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwgPSBudWxsXG4gIHRyeSB7XG4gICAgYXJncyA9IEpTT04ucGFyc2UoYXJnc1JhdykgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICBpZiAoIWFyZ3MgfHwgdHlwZW9mIGFyZ3MgIT09ICdvYmplY3QnKSByZXR1cm4gbnVsbFxuICBpZiAodG9vbCA9PT0gJ2ZzJyB8fCB0b29sID09PSAnZmlsZXN5c3RlbScpIHtcbiAgICBjb25zdCBjbWQgPSB0eXBlb2YgYXJncy5jb21tYW5kID09PSAnc3RyaW5nJyA/IGFyZ3MuY29tbWFuZCA6ICcnXG4gICAgaWYgKCFNVVRBVElPTl9DT01NQU5EUy5oYXMoY21kKSkgcmV0dXJuIG51bGxcbiAgICByZXR1cm4gdHlwZW9mIGFyZ3MuZmlsZV9wYXRoID09PSAnc3RyaW5nJyAmJiBhcmdzLmZpbGVfcGF0aCA/IGFyZ3MuZmlsZV9wYXRoIDogbnVsbFxuICB9XG4gIGlmIChNVVRBVElPTl9UT09MUy5oYXModG9vbCkgfHwgdG9vbC5zdGFydHNXaXRoKCdlZGl0JykpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbJ2ZpbGVfcGF0aCcsICdwYXRoJywgJ2ZpbGVuYW1lJ10pIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1trZXldID09PSAnc3RyaW5nJyAmJiBhcmdzW2tleV0pIHJldHVybiBhcmdzW2tleV0gYXMgc3RyaW5nXG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbi8qKiBFeHRyYWN0IHRoZSBjaGFuZ2VkIGZpbGVzIGZyb20gb25lIHNldHRsZWQgdG9vbCByZXN1bHQgKGRpZmYgaHVua3MsIGVsc2UgcGF0aC1vbmx5KS4gKi9cbmZ1bmN0aW9uIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChjYWxsOiB7IG5hbWU6IHN0cmluZzsgYXJnc1Jhdzogc3RyaW5nIH0gfCBudWxsLCBub2RlOiBUb29sUmVzdWx0Tm9kZSk6IFJvdW5kQ2hhbmdlW10ge1xuICAvLyBMb25nIHNlc3Npb25zIHRydW5jYXRlIHRoZSBjYWxsIGhlYWQgb3V0IG9mIHRoZSB3aW5kb3cgKGNhbGwgPT09IG51bGwpLCBidXRcbiAgLy8gdGhlIGhvc3QtY29tcHV0ZWQgY2FsbC9yZXN1bHQgZGlmZiBjYXJkcyBzdGlsbCBjYXJyeSB0aGUgY2hhbmdlIFx1MjAxNCByZWFkIHRob3NlLlxuICBjb25zdCByZXN1bHREaWZmcyA9IGRpZmZzRnJvbURpZmZDYXJkKG5vZGUucmVzdWx0VmlldylcbiAgY29uc3QgY2FsbERpZmZzID0gcmVzdWx0RGlmZnMubGVuZ3RoID09PSAwID8gZGlmZnNGcm9tRGlmZkNhcmQobm9kZS5jYWxsVmlldykgOiBbXVxuICBjb25zdCBtZXRhRGlmZnMgPSByZXN1bHREaWZmcy5sZW5ndGggPT09IDAgJiYgY2FsbERpZmZzLmxlbmd0aCA9PT0gMCA/IGRpZmZzRnJvbU1ldGEobm9kZS5tZXRhKSA6IFtdXG4gIGNvbnN0IGFsbERpZmZzID0gcmVzdWx0RGlmZnMubGVuZ3RoID4gMCA/IHJlc3VsdERpZmZzIDogY2FsbERpZmZzLmxlbmd0aCA+IDAgPyBjYWxsRGlmZnMgOiBtZXRhRGlmZnNcbiAgY29uc3QgdG9vbCA9IGNhbGw/Lm5hbWUgPz8gZGlmZkNhcmRUaXRsZShub2RlLmNhbGxWaWV3KSA/PyAndG9vbCdcbiAgaWYgKGFsbERpZmZzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUm91bmRDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGQgb2YgYWxsRGlmZnMpIHtcbiAgICAgIGxldCBlbnRyeSA9IGJ5UGF0aC5nZXQoZC5wYXRoKVxuICAgICAgaWYgKCFlbnRyeSkge1xuICAgICAgICBlbnRyeSA9IHsgcGF0aDogZC5wYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IHRydWUgfVxuICAgICAgICBieVBhdGguc2V0KGQucGF0aCwgZW50cnkpXG4gICAgICB9XG4gICAgICBlbnRyeS5odW5rcy5wdXNoKHsgb2xkVGV4dDogZC5vbGRUZXh0LCBuZXdUZXh0OiBkLm5ld1RleHQgfSlcbiAgICB9XG4gICAgcmV0dXJuIFsuLi5ieVBhdGgudmFsdWVzKCldXG4gIH1cbiAgY29uc3QgcGF0aCA9IGNhbGwgPyBtdXRhdGlvblBhdGgodG9vbCwgY2FsbC5hcmdzUmF3KSA6IG51bGxcbiAgcmV0dXJuIHBhdGggPyBbeyBwYXRoLCB0b29sLCBodW5rczogW10sIGhhc0RpZmY6IGZhbHNlIH1dIDogW11cbn1cblxuLyoqIFBsYWluIHRleHQgb2YgYSB1c2VyIG1lc3NhZ2UgKGNvbnRlbnQgYmxvY2tzIG9mIHR5cGUgJ3RleHQnKS4gKi9cbmZ1bmN0aW9uIHVzZXJUZXh0KG5vZGU6IFVzZXJNZXNzYWdlTm9kZSk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2Ygbm9kZS5jb250ZW50KSB7XG4gICAgaWYgKGJsb2NrICYmIHR5cGVvZiBibG9jayA9PT0gJ29iamVjdCcgJiYgKGJsb2NrIGFzIHsgdHlwZT86IHVua25vd24gfSkudHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiAoYmxvY2sgYXMgeyB0ZXh0PzogdW5rbm93biB9KS50ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgcGFydHMucHVzaCgoYmxvY2sgYXMgeyB0ZXh0OiBzdHJpbmcgfSkudGV4dClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJyAnKS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG59XG5cbi8qKiBXYWxrIHRoZSBjb252ZXJzYXRpb24gbm9kZXMgYW5kIGdyb3VwIGNoYW5nZWQgZmlsZXMgYnkgdXNlciByb3VuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb2xsZWN0U2Vzc2lvblJvdW5kcyhub2RlczogcmVhZG9ubHkgQ29udmVyc2F0aW9uTm9kZVtdKTogU2Vzc2lvblJvdW5kW10ge1xuICBjb25zdCByb3VuZHM6IFNlc3Npb25Sb3VuZFtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IFNlc3Npb25Sb3VuZCB8IG51bGwgPSBudWxsXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgPT09ICd1c2VyJykge1xuICAgICAgY3VycmVudCA9IHsgcm91bmQ6IHJvdW5kcy5sZW5ndGggKyAxLCBsYWJlbDogdXNlclRleHQobm9kZSkuc2xpY2UoMCwgNjApLCBjaGFuZ2VzOiBbXSB9XG4gICAgICByb3VuZHMucHVzaChjdXJyZW50KVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JykgY29udGludWVcbiAgICAvLyBUaGUgd2luZG93IGNhbiBzdGFydCBtaWQtdHVybiAodGhlIGxlYWRpbmcgdXNlciBtZXNzYWdlIHRydW5jYXRlZCBvdXQpO1xuICAgIC8vIHN0aWxsIHN1cmZhY2UgdGhlIHRvb2wgcmVzdWx0cyB1bmRlciBhbiBpbXBsaWNpdCByb3VuZC5cbiAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQgPSB7IHJvdW5kOiByb3VuZHMubGVuZ3RoICsgMSwgbGFiZWw6ICcnLCBjaGFuZ2VzOiBbXSB9XG4gICAgICByb3VuZHMucHVzaChjdXJyZW50KVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdXJyZW50LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBjaGFuZ2UucGF0aCAmJiBjLnRvb2wgPT09IGNoYW5nZS50b29sKVxuICAgICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICAgIGlmIChjaGFuZ2UuaGFzRGlmZikge1xuICAgICAgICAgIGV4aXN0aW5nLmh1bmtzLnB1c2goLi4uY2hhbmdlLmh1bmtzKVxuICAgICAgICAgIGV4aXN0aW5nLmhhc0RpZmYgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnQuY2hhbmdlcy5wdXNoKGNoYW5nZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdW5kcy5maWx0ZXIoKHIpID0+IHIuY2hhbmdlcy5sZW5ndGggPiAwKVxufVxuXG4vKiogQ291bnQgb2YgY2hhbmdlZCBmaWxlcyBhY3Jvc3MgYWxsIHJvdW5kcyAoZm9yIHRoZSBoZWFkZXIgYmFkZ2UpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50U2Vzc2lvbkNoYW5nZXMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IG51bWJlciB7XG4gIGxldCBjb3VudCA9IDBcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcpIGNvbnRpbnVlXG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgY2hhbmdlc0Zyb21Ub29sUmVzdWx0KG5vZGUuY2FsbCwgbm9kZSkpIHtcbiAgICAgIGNvbnN0IGtleSA9IGAke2NoYW5nZS50b29sfToke2NoYW5nZS5wYXRofWBcbiAgICAgIGlmICghc2Vlbi5oYXMoa2V5KSkge1xuICAgICAgICBzZWVuLmFkZChrZXkpXG4gICAgICAgIGNvdW50KytcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNvdW50XG59XG5cbmZ1bmN0aW9uIHRleHRMaW5lQ291bnQodGV4dDogc3RyaW5nKTogbnVtYmVyIHtcbiAgaWYgKHRleHQgPT09ICcnKSByZXR1cm4gMFxuICByZXR1cm4gdGV4dC5zcGxpdCgnXFxuJykubGVuZ3RoIC0gKHRleHQuZW5kc1dpdGgoJ1xcbicpID8gMSA6IDApXG59XG5cbi8qKiBNZXJnZSBhbGwgZmlsZSBtdXRhdGlvbnMgYm91bmRlZCBieSBvbmUgZW5naW5lLW93bmVkIGFnZW50IHR1cm4uICovXG5mdW5jdGlvbiBjb2xsZWN0VHVybkNoYW5nZXMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSwgc3RhcnRTZXE6IG51bWJlciwgZW5kU2VxOiBudW1iZXIpOiBUdXJuQ2hhbmdlU3VtbWFyeVtdIHtcbiAgY29uc3QgZmlsZXMgPSBuZXcgTWFwPHN0cmluZywgVHVybkNoYW5nZVN1bW1hcnk+KClcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgaWYgKG5vZGUua2luZCAhPT0gJ3Rvb2wtcmVzdWx0JyB8fCBub2RlLnNlcSA8IHN0YXJ0U2VxIHx8IG5vZGUuc2VxID4gZW5kU2VxKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBjdXJyZW50ID0gZmlsZXMuZ2V0KGNoYW5nZS5wYXRoKSA/PyB7IHBhdGg6IGNoYW5nZS5wYXRoLCBhZGRlZDogMCwgZGVsZXRlZDogMCB9XG4gICAgICBmb3IgKGNvbnN0IGh1bmsgb2YgY2hhbmdlLmh1bmtzKSB7XG4gICAgICAgIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMoaHVuay5vbGRUZXh0ID8/ICcnLCBodW5rLm5ld1RleHQpKSB7XG4gICAgICAgICAgaWYgKHBhcnQuYWRkZWQpIGN1cnJlbnQuYWRkZWQgKz0gdGV4dExpbmVDb3VudChwYXJ0LnZhbHVlKVxuICAgICAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgY3VycmVudC5kZWxldGVkICs9IHRleHRMaW5lQ291bnQocGFydC52YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZmlsZXMuc2V0KGNoYW5nZS5wYXRoLCBjdXJyZW50KVxuICAgIH1cbiAgfVxuICByZXR1cm4gWy4uLmZpbGVzLnZhbHVlcygpXVxufVxuXG4vKiogQWRhcHQgYSBwZXJzaXN0ZWQgc2Vzc2lvbiBkaWZmIHRvIHRoZSByZWFkLW9ubHkgZmlsZSBzaGFwZSB1c2VkIGJ5IExhc3QgVHVybi4gKi9cbmZ1bmN0aW9uIHNlc3Npb25DaGFuZ2VUb0RpZmZGaWxlKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBEaWZmRmlsZSB7XG4gIGxldCBhZGRlZCA9IDBcbiAgbGV0IGRlbGV0ZWQgPSAwXG4gIGNvbnN0IGNodW5rczogc3RyaW5nW10gPSBbYGRpZmYgLS1naXQgYS8ke2NoYW5nZS5wYXRofSBiLyR7Y2hhbmdlLnBhdGh9YCwgYC0tLSBhLyR7Y2hhbmdlLnBhdGh9YCwgYCsrKyBiLyR7Y2hhbmdlLnBhdGh9YF1cbiAgZm9yIChjb25zdCBodW5rIG9mIGNoYW5nZS5odW5rcykge1xuICAgIGNvbnN0IGJlZm9yZSA9IGh1bmsub2xkVGV4dCA/PyAnJ1xuICAgIGNvbnN0IGFmdGVyID0gaHVuay5uZXdUZXh0XG4gICAgY29uc3QgYmVmb3JlTGluZXMgPSB0ZXh0TGluZUNvdW50KGJlZm9yZSlcbiAgICBjb25zdCBhZnRlckxpbmVzID0gdGV4dExpbmVDb3VudChhZnRlcilcbiAgICBjaHVua3MucHVzaChgQEAgLTEsJHtiZWZvcmVMaW5lc30gKzEsJHthZnRlckxpbmVzfSBAQGApXG4gICAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhiZWZvcmUsIGFmdGVyKSkge1xuICAgICAgY29uc3QgcHJlZml4ID0gcGFydC5hZGRlZCA/ICcrJyA6IHBhcnQucmVtb3ZlZCA/ICctJyA6ICcgJ1xuICAgICAgY29uc3QgY291bnQgPSB0ZXh0TGluZUNvdW50KHBhcnQudmFsdWUpXG4gICAgICBpZiAocGFydC5hZGRlZCkgYWRkZWQgKz0gY291bnRcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgZGVsZXRlZCArPSBjb3VudFxuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIHBhcnQudmFsdWUuc3BsaXQoJ1xcbicpLnNsaWNlKDAsIHBhcnQudmFsdWUuZW5kc1dpdGgoJ1xcbicpID8gLTEgOiB1bmRlZmluZWQpKSBjaHVua3MucHVzaChgJHtwcmVmaXh9JHtsaW5lfWApXG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgcGF0aDogY2hhbmdlLnBhdGgsXG4gICAgeHk6ICdNJyxcbiAgICBzdGF0dXM6ICdNJyxcbiAgICB1bnRyYWNrZWQ6IGNoYW5nZS5odW5rcy5zb21lKChodW5rKSA9PiBodW5rLm9sZFRleHQgPT09IG51bGwpLFxuICAgIHN0YWdlZDogZmFsc2UsXG4gICAgdW5zdGFnZWQ6IHRydWUsXG4gICAgYWRkZWQsXG4gICAgZGVsZXRlZCxcbiAgICBkaWZmOiBjaHVua3Muam9pbignXFxuJyksXG4gICAgYmluYXJ5OiBmYWxzZSxcbiAgICBtdGltZTogMCxcbiAgICBodW5rczogW10sXG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEaWZmIHJlbmRlcmluZy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiogU3BsaXQgb25lIGBnaXQgc2hvdyAtLWZvcm1hdD1gIGRpZmYgaW50byBwZXItZmlsZSBzZWdtZW50cy4gKi9cbmZ1bmN0aW9uIHNwbGl0Q29tbWl0RGlmZihkaWZmOiBzdHJpbmcpOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXSB7XG4gIGNvbnN0IHNlZ21lbnRzOiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nW10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgcGF0aDogc3RyaW5nOyB0ZXh0OiBzdHJpbmdbXSB9IHwgbnVsbCA9IG51bGxcbiAgZm9yIChjb25zdCBsaW5lIG9mIGRpZmYuc3BsaXQoJ1xcbicpKSB7XG4gICAgY29uc3QgbWF0Y2ggPSAvXmRpZmYgLS1naXQgYVxcLyguKj8pIGJcXC8vLmV4ZWMobGluZSlcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gICAgICBjdXJyZW50ID0geyBwYXRoOiBtYXRjaFsxXSwgdGV4dDogW2xpbmVdIH1cbiAgICB9IGVsc2UgaWYgKGN1cnJlbnQpIHtcbiAgICAgIGN1cnJlbnQudGV4dC5wdXNoKGxpbmUpXG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50KSBzZWdtZW50cy5wdXNoKGN1cnJlbnQpXG4gIHJldHVybiBzZWdtZW50cy5tYXAoKHMpID0+ICh7IHBhdGg6IHMucGF0aCwgdGV4dDogcy50ZXh0LmpvaW4oJ1xcbicpIH0pKVxufVxuXG4vKiogU3RhdHVzIGxldHRlciBmb3IgYSBjb21taXQncyBmaWxlLCBkZXJpdmVkIGZyb20gaXRzIGRpZmYgc2VnbWVudCB0ZXh0LiAqL1xuZnVuY3Rpb24gY29tbWl0RmlsZVN0YXR1cyhzZWdtZW50VGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKC9ebmV3IGZpbGUgbW9kZS8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnQSdcbiAgaWYgKC9eZGVsZXRlZCBmaWxlIG1vZGUvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ0QnXG4gIGlmICgvXnJlbmFtZSBmcm9tIC8udGVzdChzZWdtZW50VGV4dCkpIHJldHVybiAnUidcbiAgcmV0dXJuICdNJ1xufVxuXG50eXBlIERpZmZSb3cgPSB7IGtpbmQ6ICdhZGQnIHwgJ2RlbCcgfCAnY3R4JyB8ICdodW5rJyB8ICdmaWxlJyB8ICdub3RlJzsgdGV4dDogc3RyaW5nIH1cblxuLyoqIENsYXNzaWZ5IHJhdyB1bmlmaWVkLWRpZmYgdGV4dCAoZ2l0IG91dHB1dCkgaW50byByb3dzLiAqL1xuZnVuY3Rpb24gZ2l0RGlmZlJvd3MoZGlmZjogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgcmV0dXJuIGRpZmYuc3BsaXQoJ1xcbicpLm1hcCgobGluZSkgPT4ge1xuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysrKycpIHx8IGxpbmUuc3RhcnRzV2l0aCgnLS0tJykpIHJldHVybiB7IGtpbmQ6ICdmaWxlJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnQEAnKSkgcmV0dXJuIHsga2luZDogJ2h1bmsnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIHJldHVybiB7IGtpbmQ6ICdhZGQnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIHJldHVybiB7IGtpbmQ6ICdkZWwnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdcXFxcICcpKSByZXR1cm4geyBraW5kOiAnbm90ZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIHJldHVybiB7IGtpbmQ6ICdjdHgnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgfSlcbn1cblxuLyoqIENvbXB1dGUgYWRkL2RlbC9jdHggcm93cyBiZXR3ZWVuIHR3byB0ZXh0cyAodGhlIHRvb2xzJyBGaWxlRGlmZiBzaGFwZSkuICovXG5mdW5jdGlvbiB0ZXh0RGlmZlJvd3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogRGlmZlJvd1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvd3Ncbn1cblxuLyoqIFNlc3Npb24gY2hhbmdlIHJvd3Mgd2l0aCByZWxhdGl2ZSBvbGQvbmV3IGxpbmUgbnVtYmVycyAoaHVuayByb3dzIHJlc2V0KS4gKi9cbmZ1bmN0aW9uIHNlc3Npb25Sb3dzV2l0aExpbmVzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiB7IHJvdzogRGlmZlJvdzsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9W10ge1xuICBjb25zdCBvdXQ6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSA9IFtdXG4gIGxldCBvbGRMaW5lID0gMVxuICBsZXQgbmV3TGluZSA9IDFcbiAgZm9yIChjb25zdCByb3cgb2YgY2hhbmdlUm93cyhjaGFuZ2UpKSB7XG4gICAgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgb3V0LnB1c2goeyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbmV3TGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHtcbiAgICAgIG91dC5wdXNoKHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBuZXdMaW5lKysgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgb3V0LnB1c2goeyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbnVsbCB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaCh7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbnVsbCB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBBbGwgcm93cyBmb3Igb25lIHJvdW5kIGNoYW5nZSAobXVsdGlwbGUgaHVua3MgZ2V0IGBAQGAgc2VwYXJhdG9ycykuICovXG5mdW5jdGlvbiBjaGFuZ2VSb3dzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBEaWZmUm93W10ge1xuICBpZiAoIWNoYW5nZS5oYXNEaWZmIHx8IGNoYW5nZS5odW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICBjb25zdCByb3dzOiBEaWZmUm93W10gPSBbXVxuICBjaGFuZ2UuaHVua3MuZm9yRWFjaCgoaHVuaywgaSkgPT4ge1xuICAgIGlmIChjaGFuZ2UuaHVua3MubGVuZ3RoID4gMSkgcm93cy5wdXNoKHsga2luZDogJ2h1bmsnLCB0ZXh0OiBgQEAgaHVuayAke2kgKyAxfS8ke2NoYW5nZS5odW5rcy5sZW5ndGh9IEBAYCB9KVxuICAgIHJvd3MucHVzaCguLi50ZXh0RGlmZlJvd3MoaHVuay5vbGRUZXh0LCBodW5rLm5ld1RleHQpKVxuICB9KVxuICByZXR1cm4gcm93c1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNwbGl0ICh0d28tY29sdW1uKSBkaWZmIHZpZXcuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIE9uZSBhbGlnbmVkIHJvdyBvZiB0aGUgc2lkZS1ieS1zaWRlIHZpZXcuICovXG5pbnRlcmZhY2UgU3BsaXRSb3cge1xuICBsZWZ0OiBzdHJpbmdcbiAgcmlnaHQ6IHN0cmluZ1xuICAvKiogMS1iYXNlZCBsaW5lIG51bWJlciBpbiB0aGUgb2xkIGZpbGUsIG9yIG51bGwgKHB1cmUgYWRkaXRpb24pLiAqL1xuICBsZWZ0TnVtOiBudW1iZXIgfCBudWxsXG4gIC8qKiAxLWJhc2VkIGxpbmUgbnVtYmVyIGluIHRoZSBuZXcgZmlsZSwgb3IgbnVsbCAocHVyZSBkZWxldGlvbikuICovXG4gIHJpZ2h0TnVtOiBudW1iZXIgfCBudWxsXG4gIGtpbmQ6ICdjdHgnIHwgJ2NoYW5nZSdcbn1cblxuLyoqIE9uZSBzaWRlLWJ5LXNpZGUgYmxvY2sgKGEgaHVuayB3aXRoIGl0cyBgQEBgIGhlYWRlcikuICovXG5pbnRlcmZhY2UgU3BsaXRCbG9jayB7XG4gIGhlYWQ6IHN0cmluZyB8IG51bGxcbiAgcm93czogU3BsaXRSb3dbXVxufVxuXG4vKipcbiAqIFBhaXIgYWRkL2RlbCByb3dzIGludG8gYWxpZ25lZCBsZWZ0L3JpZ2h0IGNvbHVtbnMuIFJlbW92ZWQgbGluZXMgYnVmZmVyXG4gKiB1bnRpbCB0aGUgbWF0Y2hpbmcgYWRkaXRpb25zIGFycml2ZSAodW5pZmllZCBkaWZmIG9yZGVycyBkZWxldGlvbnMgYmVmb3JlXG4gKiBhZGRpdGlvbnMpLCBzbyBwdXJlIGRlbGV0aW9ucyBhbmQgcHVyZSBhZGRpdGlvbnMgc3RpbGwgZ2V0IHRoZWlyIG93biByb3dcbiAqIHdpdGggYW4gZW1wdHkgY2VsbCBvbiB0aGUgb3Bwb3NpdGUgc2lkZS4gTGluZSBudW1iZXJzIHRyYWNrIGZyb20gdGhlIGh1bmtcbiAqIGhlYWRlcidzIGAtYSxiICtjLGRgIHBvc2l0aW9ucy5cbiAqL1xuZnVuY3Rpb24gcGFpclJvd3Mocm93czogRGlmZlJvd1tdLCBvbGRTdGFydDogbnVtYmVyLCBuZXdTdGFydDogbnVtYmVyKTogU3BsaXRSb3dbXSB7XG4gIGNvbnN0IG91dDogU3BsaXRSb3dbXSA9IFtdXG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICBsZXQgcGVuZGluZzogeyB0ZXh0OiBzdHJpbmc7IG51bTogbnVtYmVyIH1bXSA9IFtdXG4gIGNvbnN0IGZsdXNoID0gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgcCBvZiBwZW5kaW5nKSBvdXQucHVzaCh7IGxlZnQ6IHAudGV4dCwgcmlnaHQ6ICcnLCBsZWZ0TnVtOiBwLm51bSwgcmlnaHROdW06IG51bGwsIGtpbmQ6ICdjaGFuZ2UnIH0pXG4gICAgcGVuZGluZyA9IFtdXG4gIH1cbiAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHtcbiAgICAgIHBlbmRpbmcucHVzaCh7IHRleHQ6IHJvdy50ZXh0LnNsaWNlKDEpLCBudW06IG9sZExpbmUrKyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdhZGQnKSB7XG4gICAgICBjb25zdCBwID0gcGVuZGluZy5zaGlmdCgpXG4gICAgICBvdXQucHVzaCh7IGxlZnQ6IHA/LnRleHQgPz8gJycsIHJpZ2h0OiByb3cudGV4dC5zbGljZSgxKSwgbGVmdE51bTogcD8ubnVtID8/IG51bGwsIHJpZ2h0TnVtOiBuZXdMaW5lKyssIGtpbmQ6ICdjaGFuZ2UnIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHtcbiAgICAgIGZsdXNoKClcbiAgICAgIC8vIFVuaWZpZWQtZGlmZiBjb250ZXh0IGxpbmVzIGNhcnJ5IGEgbGVhZGluZyBzcGFjZSBcdTIwMTQgc3RyaXAgaXQgZm9yIHRoZVxuICAgICAgLy8gc3BsaXQgY2VsbHMgc28gYm90aCBjb2x1bW5zIHJlbmRlciBiYXJlIHRleHQuXG4gICAgICBjb25zdCB0ZXh0ID0gcm93LnRleHQuc3RhcnRzV2l0aCgnICcpID8gcm93LnRleHQuc2xpY2UoMSkgOiByb3cudGV4dFxuICAgICAgb3V0LnB1c2goeyBsZWZ0OiB0ZXh0LCByaWdodDogdGV4dCwgbGVmdE51bTogb2xkTGluZSsrLCByaWdodE51bTogbmV3TGluZSsrLCBraW5kOiAnY3R4JyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBmbHVzaCgpIC8vIG5vdGVzIChcXCBObyBuZXdsaW5lXHUyMDI2KSBhbmQgc3RyYXkgcm93czoganVzdCBicmVhayB0aGUgcGFpcmluZ1xuICAgIH1cbiAgfVxuICBmbHVzaCgpXG4gIHJldHVybiBvdXRcbn1cblxuLyoqIFBhcnNlIGdpdCB1bmlmaWVkIGRpZmYgdGV4dCBpbnRvIGJsb2NrcyAoYC0tLS8rKytgIGZpbGUgcm93cyBhbmQgYEBAYCBodW5rcykuICovXG5jb25zdCBHSVRfTUVUQSA9IC9eKGRpZmYgLS1naXQgfGluZGV4IHxuZXcgZmlsZSB8ZGVsZXRlZCBmaWxlIHxvbGQgbW9kZSB8bmV3IG1vZGUgfHNpbWlsYXJpdHkgaW5kZXggfHJlbmFtZSAoZnJvbXx0bykgfEJpbmFyeSBmaWxlcyApL1xuXG5mdW5jdGlvbiBwYXJzZUdpdEJsb2NrcyhkaWZmOiBzdHJpbmcpOiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfVtdIHtcbiAgY29uc3QgYmxvY2tzOiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfVtdID0gW11cbiAgbGV0IGN1cnJlbnQ6IHsgaGVhZDogRGlmZlJvdyB8IG51bGw7IHJvd3M6IERpZmZSb3dbXSB9IHwgbnVsbCA9IG51bGxcbiAgY29uc3QgbGluZXMgPSBkaWZmLnNwbGl0KCdcXG4nKVxuICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGxldCBraW5kOiBEaWZmUm93WydraW5kJ11cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrKysnKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy0tLScpIHx8IEdJVF9NRVRBLnRlc3QobGluZSkpIGtpbmQgPSAnZmlsZSdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ0BAJykpIGtpbmQgPSAnaHVuaydcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJysnKSkga2luZCA9ICdhZGQnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCctJykpIGtpbmQgPSAnZGVsJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnXFxcXCAnKSkga2luZCA9ICdub3RlJ1xuICAgIGVsc2Uga2luZCA9ICdjdHgnXG4gICAgaWYgKGtpbmQgPT09ICdmaWxlJyB8fCBraW5kID09PSAnaHVuaycpIHtcbiAgICAgIGN1cnJlbnQgPSB7IGhlYWQ6IHsga2luZCwgdGV4dDogbGluZSB9LCByb3dzOiBbXSB9XG4gICAgICBibG9ja3MucHVzaChjdXJyZW50KVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudCA9IHsgaGVhZDogbnVsbCwgcm93czogW10gfVxuICAgICAgICBibG9ja3MucHVzaChjdXJyZW50KVxuICAgICAgfVxuICAgICAgY3VycmVudC5yb3dzLnB1c2goeyBraW5kLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBibG9ja3Ncbn1cblxuLyoqIEh1bmsgc3RhcnQgcG9zaXRpb25zIGZyb20gYSBgQEAgLWEsYiArYyxkIEBAYCBoZWFkZXIuICovXG5mdW5jdGlvbiBodW5rU3RhcnRzKGhlYWQ6IHN0cmluZyk6IHsgb2xkU3RhcnQ6IG51bWJlcjsgbmV3U3RhcnQ6IG51bWJlciB9IHtcbiAgY29uc3QgbSA9IC9eQEAgLShcXGQrKSg/OixcXGQrKT8gXFwrKFxcZCspLy5leGVjKGhlYWQpXG4gIHJldHVybiB7IG9sZFN0YXJ0OiBtID8gTnVtYmVyKG1bMV0pIDogMSwgbmV3U3RhcnQ6IG0gPyBOdW1iZXIobVsyXSkgOiAxIH1cbn1cblxuLyoqIFNpZGUtYnktc2lkZSBibG9ja3MgZm9yIGEgZ2l0IHVuaWZpZWQgZGlmZiAoc2tpcHMgcHVyZSBmaWxlLWhlYWRlciBibG9ja3MpLiAqL1xuZnVuY3Rpb24gZ2l0U3BsaXRCbG9ja3MoZGlmZjogc3RyaW5nKTogU3BsaXRCbG9ja1tdIHtcbiAgcmV0dXJuIHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gICAgLmZpbHRlcigoYikgPT4gYi5oZWFkPy5raW5kICE9PSAnZmlsZScgJiYgKGIucm93cy5sZW5ndGggPiAwIHx8IGIuaGVhZD8ua2luZCA9PT0gJ2h1bmsnKSlcbiAgICAubWFwKChiKSA9PiB7XG4gICAgICBjb25zdCBzdGFydHMgPSBiLmhlYWQgPyBodW5rU3RhcnRzKGIuaGVhZC50ZXh0KSA6IHsgb2xkU3RhcnQ6IDEsIG5ld1N0YXJ0OiAxIH1cbiAgICAgIHJldHVybiB7IGhlYWQ6IGIuaGVhZD8ua2luZCA9PT0gJ2h1bmsnID8gYi5oZWFkLnRleHQgOiBudWxsLCByb3dzOiBwYWlyUm93cyhiLnJvd3MsIHN0YXJ0cy5vbGRTdGFydCwgc3RhcnRzLm5ld1N0YXJ0KSB9XG4gICAgfSlcbn1cblxuLyoqIFNpZGUtYnktc2lkZSBibG9ja3MgZm9yIHRoZSB0b29scycgRmlsZURpZmYgc2hhcGUgKG9sZFRleHQvbmV3VGV4dCkuICovXG5mdW5jdGlvbiB0ZXh0U3BsaXRCbG9ja3Mob2xkVGV4dDogc3RyaW5nIHwgbnVsbCwgbmV3VGV4dDogc3RyaW5nKTogU3BsaXRCbG9ja1tdIHtcbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgZm9yIChjb25zdCBwYXJ0IG9mIGRpZmZMaW5lcyhvbGRUZXh0ID8/ICcnLCBuZXdUZXh0KSkge1xuICAgIGNvbnN0IGxpbmVzID0gcGFydC52YWx1ZS5zcGxpdCgnXFxuJylcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMCAmJiBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXSA9PT0gJycpIGxpbmVzLnBvcCgpXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBpZiAocGFydC5hZGRlZCkgcm93cy5wdXNoKHsga2luZDogJ2FkZCcsIHRleHQ6IGArJHtsaW5lfWAgfSlcbiAgICAgIGVsc2UgaWYgKHBhcnQucmVtb3ZlZCkgcm93cy5wdXNoKHsga2luZDogJ2RlbCcsIHRleHQ6IGAtJHtsaW5lfWAgfSlcbiAgICAgIGVsc2Ugcm93cy5wdXNoKHsga2luZDogJ2N0eCcsIHRleHQ6IGxpbmUgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFt7IGhlYWQ6IG51bGwsIHJvd3M6IHBhaXJSb3dzKHJvd3MsIDEsIDEpIH1dXG59XG5cbi8qKiBBbGwgc2lkZS1ieS1zaWRlIGJsb2NrcyBmb3Igb25lIHJvdW5kIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoYW5nZVNwbGl0QmxvY2tzKGNoYW5nZTogUm91bmRDaGFuZ2UpOiBTcGxpdEJsb2NrW10ge1xuICBpZiAoIWNoYW5nZS5oYXNEaWZmIHx8IGNoYW5nZS5odW5rcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICByZXR1cm4gY2hhbmdlLmh1bmtzLm1hcCgoaHVuaywgaSkgPT4gKHtcbiAgICBoZWFkOiBjaGFuZ2UuaHVua3MubGVuZ3RoID4gMSA/IGBAQCBodW5rICR7aSArIDF9LyR7Y2hhbmdlLmh1bmtzLmxlbmd0aH0gQEBgIDogbnVsbCxcbiAgICByb3dzOiB0ZXh0U3BsaXRCbG9ja3MoaHVuay5vbGRUZXh0LCBodW5rLm5ld1RleHQpWzBdLnJvd3MsXG4gIH0pKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFN0eWxlcyAoZHNkci0qOyB0aGUgaGVhZGVyIHRyaWdnZXIgbWlycm9ycyB0aGUgaW4tdHJlZSBhY3Rpb24gcm93cykuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgUkVWSUVXX0NTUyA9IGBcbi5kc2RyLXRyaWdnZXJ7bWluLWhlaWdodDoyOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo0cHg7cGFkZGluZzozcHggNnB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2Rpc3BsYXk6aW5saW5lLWZsZXh9XG4uZHNkci10cmlnZ2VyOmhvdmVyLC5kc2RyLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWxhYmVse21hcmdpbi1sZWZ0OjJweH1cbi5kc2RyLWNvdW50e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2JvcmRlci1yYWRpdXM6OTk5cHg7bWluLXdpZHRoOjE2cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtwYWRkaW5nOjAgNXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLW92ZXJsYXl7cG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDt6LWluZGV4OjIwMDtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjQ1KTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7cGFkZGluZzozMnB4fVxuLmRzZHItcGFuZWx7Ym94LXNpemluZzpib3JkZXItYm94O3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOm1pbigxMTIwcHgsMTAwJSk7aGVpZ2h0Om1pbig3MjBweCxjYWxjKDEwMHZoIC0gNjRweCkpO21heC13aWR0aDpjYWxjKDEwMHZ3IC0gNjRweCk7bWF4LWhlaWdodDpjYWxjKDEwMHZoIC0gNjRweCk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6MTRweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXJlc2l6ZXtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjV9XG4uZHNkci1yZXNpemUtZXt0b3A6MDtyaWdodDotM3B4O3dpZHRoOjdweDtoZWlnaHQ6MTAwJTtjdXJzb3I6ZXctcmVzaXplfVxuLmRzZHItcmVzaXplLXN7Ym90dG9tOi0zcHg7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjdweDtjdXJzb3I6bnMtcmVzaXplfVxuLmRzZHItcmVzaXplLXNle3JpZ2h0Oi00cHg7Ym90dG9tOi00cHg7d2lkdGg6MTVweDtoZWlnaHQ6MTVweDtjdXJzb3I6bndzZS1yZXNpemV9XG4uZHNkci1oZWFkZXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjEycHggMTZweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmV9XG4uZHNkci10aXRsZXtmb250LXNpemU6MTRweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3VidGl0bGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXRhYnN7ZGlzcGxheTpmbGV4O2dhcDo0cHg7bWFyZ2luLWxlZnQ6MTRweH1cbi5kc2RyLXRhYntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyNnB4O2JvcmRlcjoxcHggc29saWQgdHJhbnNwYXJlbnQ7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MnB4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci10YWI6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci10YWItYWN0aXZle2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2NvcGV7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttYXJnaW4tbGVmdDo4cHh9XG4uZHNkci1zY29wZSAuZHNkci1zZWwtdHJpZ2dlcnttaW4td2lkdGg6MTEwcHg7aGVpZ2h0OjI2cHg7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjAgOHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpfVxuLmRzZHItc3BhY2Vye2ZsZXg6MX1cbi5kc2RyLWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyOHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjNweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHh9XG4uZHNkci1idG46aG92ZXI6bm90KDpkaXNhYmxlZCl7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWJ0bjpkaXNhYmxlZHtvcGFjaXR5Oi41O2N1cnNvcjpkZWZhdWx0fVxuLmRzZHItYnRuLXByaW1hcnl7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNDAwKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1idG4tZGFuZ2Vye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1kYW5nZXI6aG92ZXI6bm90KDpkaXNhYmxlZCl7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItYnRuLWNvbmZpcm17Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTUwKX1cbi5kc2RyLWJ0bi1jb25maXJtOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpO2NvbG9yOnZhcigtLWRzdy1zdGF0aWMtbmV1dHJhbC1ibHVpc2gtNTApfVxuLmRzZHItY29tbWl0LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoyMDBweDttaW4taGVpZ2h0OjI4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzozcHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweH1cbi5kc2RyLWNvbW1pdC1tb2RhbHtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjEwO2luc2V0OjA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNDIpfS5kc2RyLWNvbW1pdC1jYXJke2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjE2cHg7d2lkdGg6bWluKDUyMHB4LGNhbGMoMTAwJSAtIDQ4cHgpKTtwYWRkaW5nOjI0cHg7Ym9yZGVyLXJhZGl1czoxNnB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myl9LmRzZHItY29tbWl0LXRpdGxle2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9LmRzZHItY29tbWl0LWNhcmQgLmRzZHItY29tbWl0LWlucHV0e3dpZHRoOjEwMCU7bWluLWhlaWdodDozOHB4fS5kc2RyLWNvbW1pdC1pbmNsdWRle2Rpc3BsYXk6ZmxleDtnYXA6OXB4O2FsaWduLWl0ZW1zOmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LXNpemU6MTNweH0uZHNkci1jb21taXQtYWN0aW9uc3tkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjhweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtwYWRkaW5nLXRvcDoxNHB4fVxuLmRzZHItZmlsZS1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6M3B4O21hcmdpbi1sZWZ0OjZweH0uZHNkci1maWxlLWljb257d2lkdGg6MjJweDtoZWlnaHQ6MjJweDtwYWRkaW5nOjA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQ6MTZweC8yMHB4IHZhcigtLWRzdy1mb250LXNhbnMpO2N1cnNvcjpwb2ludGVyfS5kc2RyLWZpbGUtaWNvbjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfS5kc2RyLWZpbGUtaWNvbi1kYW5nZXI6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXR1cy1kYW5nZXIpfVxuLmRzZHItY29tbWl0LWlucHV0OjpwbGFjZWhvbGRlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtY2FwdGlvbil9XG4uZHNkci1jb21taXQtaW5wdXQ6Zm9jdXN7b3V0bGluZTpub25lO2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSl9XG4uZHNkci1zZWN0aW9ue2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nOjEwcHggOHB4IDNweDtmb250LXdlaWdodDo2MDA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4fVxuLmRzZHItc2VjdGlvbjpmaXJzdC1jaGlsZHtwYWRkaW5nLXRvcDo0cHh9XG4uZHNkci1icmFuY2h7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NHB4IDhweCA4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1icmFuY2gtcmVme2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczttaW4td2lkdGg6MDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnJhbmNoLWFycm93e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1icmFuY2gtc3RhdHtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWJyYW5jaC1haGVhZHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWJyYW5jaC1iZWhpbmR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXdhcm4tcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtc3luY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdHtmbGV4OjE7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NXB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY29tbWl0OmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXRsLXNlbGVjdGVkIC5kc2RyLWNvbW1pdHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10aW1lbGluZXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItdGwtaXRlbXtkaXNwbGF5OmZsZXg7Z2FwOjZweDthbGlnbi1pdGVtczpzdHJldGNoO2JvcmRlci1yYWRpdXM6OHB4fVxuLmRzZHItdGwtcmFpbHtwb3NpdGlvbjpyZWxhdGl2ZTtmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcn1cbi5kc2RyLXRsLXJhaWw6OmJlZm9yZXtjb250ZW50OlwiXCI7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7Ym90dG9tOjA7bGVmdDo1MCU7d2lkdGg6MXB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMil9XG4uZHNkci10bC1pdGVtOmZpcnN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXt0b3A6OXB4fVxuLmRzZHItdGwtaXRlbTpsYXN0LWNoaWxkIC5kc2RyLXRsLXJhaWw6OmJlZm9yZXtib3R0b206YXV0bztoZWlnaHQ6OXB4fVxuLmRzZHItdGwtZG90e3Bvc2l0aW9uOnJlbGF0aXZlO3otaW5kZXg6MTt0b3A6OXB4O2ZsZXg6bm9uZTt3aWR0aDo3cHg7aGVpZ2h0OjdweDtib3JkZXItcmFkaXVzOjUwJTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItdGwtZG90LWxvY2Fse2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1kb3QtcmVtb3Rle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWNvbW1pdC1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4td2lkdGg6MH1cbi5kc2RyLWNvbW1pdC1zaG9ydHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1zdWJqZWN0e2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1jb21taXQtbWV0YXtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmctbGVmdDowfVxuLmRzZHItdGwtYmFkZ2V7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDVweH1cbi5kc2RyLXRsLWJhZGdlLWxvY2Fse2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXRsLWJhZGdlLXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItZGlmZi1oYXNoe21hcmdpbi1sZWZ0OjhweDtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItY29tbWl0LWZpbGUtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItY29tbWl0LWZpbGUtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7bWFyZ2luLWxlZnQ6NHB4fVxuLmRzZHItY2ZnLWNhcmR7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0zKTtib3JkZXItcmFkaXVzOjEycHg7bGlzdC1zdHlsZTpub25lO3RyYW5zaXRpb246Ym9yZGVyLWNvbG9yIC4xNnMsYmFja2dyb3VuZCAuMTZzfVxuLmRzZHItY2ZnLWNhcmQ6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWNhcmQtb3BlbntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWRpbW1lZCl9XG4uZHNkci1jZmctaGVhZHthcHBlYXJhbmNlOm5vbmU7d2lkdGg6MTAwJTtmb250OmluaGVyaXQ7Y29sb3I6aW5oZXJpdDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czoxMnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtwYWRkaW5nOjE0cHggMTZweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctaGVhZDpmb2N1cy12aXNpYmxle291dGxpbmU6MnB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lLW9mZnNldDotMnB4fVxuLmRzZHItY2ZnLWhlYWQtdGV4dHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47ZmxleDoxO2dhcDo0cHg7bWluLXdpZHRoOjA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLW5hbWV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2ZvbnQtc2l6ZToxNXB4O2ZvbnQtd2VpZ2h0OjYwMDtsaW5lLWhlaWdodDoxLjR9XG4uZHNkci1jZmctZGVzY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1jYXJldHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZsZXg6bm9uZTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMTZzfVxuLmRzZHItY2ZnLWNhcmV0LW9wZW57dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItY2ZnLWJvZHl7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7bWFyZ2luOjAgMTZweDtwYWRkaW5nLWJvdHRvbTo4cHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLWNmZy1maWVsZHtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjEycHggMDtkaXNwbGF5OmZsZXh9XG4uZHNkci1jZmctZmllbGQrLmRzZHItY2ZnLWZpZWxke2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItY2ZnLWxhYmVse21pbi13aWR0aDowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7Zm9udC1zaXplOjEzcHg7Zm9udC13ZWlnaHQ6NTAwO2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1oaW50e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLXBlbmRpbmd7d2hpdGUtc3BhY2U6bm93cmFwO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Ym9yZGVyLXJhZGl1czo5OTlweDtmbGV4Om5vbmU7cGFkZGluZzoxcHggOHB4O2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxN3B4fVxuLmRzZHItY2ZnLWZhaWxlZHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZXJyb3IpO2ZsZXg6MTttYXJnaW46MDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctYWN0aW9uc3tib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmQ7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzoxMnB4IDAgNHB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWJvZHl7ZGlzcGxheTpmbGV4O2ZsZXg6MTttaW4taGVpZ2h0OjB9XG4uZHNkci1maWxlc3t3aWR0aDozMDBweDtmbGV4Om5vbmU7Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtvdmVyZmxvdy15OmF1dG87cGFkZGluZzo4cHh9XG4uZHNkci1yb3VuZHtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo4cHggOHB4IDNweDtmb250LXdlaWdodDo2MDB9XG4uZHNkci1yb3VuZC1sYWJlbHt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NDAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItZmlsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maWxlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbGUtc2VsZWN0ZWR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZGlye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQtc2l6ZToxMnB4fVxuLmRzZHItZGlyOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1kaXItY2FyZXR7ZmxleDpub25lO3dpZHRoOjEycHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpci1uYW1le2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW47Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItZGlyLWNvdW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWZpbGUtbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmlsZS1zdGF0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtc31cbi5kc2RyLWNoaXB7ZmxleDpub25lO21pbi13aWR0aDoyMnB4O3RleHQtYWxpZ246Y2VudGVyO2JvcmRlci1yYWRpdXM6NXB4O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNoaXAtbXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtYXtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6IzJlYTA0M31cbi5kc2RyLWNoaXAtZHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xNik7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWNoaXAtcntiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpO2NvbG9yOiM1OGE2ZmZ9XG4uZHNkci1jaGlwLXV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXRvb2x7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1kaWZme2ZsZXg6MTttaW4td2lkdGg6MDtvdmVyZmxvdzphdXRvO3BhZGRpbmc6MTBweCAwfVxuLmRzZHItZGlmZi1lbXB0eXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7aGVpZ2h0OjEwMCU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWRpZmYtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6NnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItZGlmZi1wYXRoe2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxM3B4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItZGlmZi1zdGF0c3tmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmbGV4Om5vbmV9XG4uZHNkci1kaWZmLXNjcm9sbHtmbGV4OjE7bWluLWhlaWdodDowO292ZXJmbG93OmF1dG87ZGlzcGxheTpmbGV4fVxuLmRzZHItcHJle21hcmdpbjowO3BhZGRpbmc6OHB4IDA7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6dmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KTt3aGl0ZS1zcGFjZTpwcmU7bWluLXdpZHRoOjEwMCU7ZmxleDoxfVxuLmRzZHItbGluZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MTBweDtwYWRkaW5nOjAgMTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cG9zaXRpb246cmVsYXRpdmV9XG4uZHNkci1saW5lLW51bXtmbGV4Om5vbmU7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NDBweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO29wYWNpdHk6Ljc1fVxuLmRzZHItbGluZS10ZXh0e2ZsZXg6MTttaW4td2lkdGg6MDt3aGl0ZS1zcGFjZTpwcmV9XG4uZHNkci1jb21tZW50LWFkZHtwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgtNTAlKTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MTZweDtoZWlnaHQ6MTZweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjRweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRkLC5kc2RyLWNvbW1lbnQtYWRkOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItY29tbWVudC1hZGQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1lbnQtaGFze3Zpc2liaWxpdHk6dmlzaWJsZTtiYWNrZ3JvdW5kOmNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCkgMTYlLCB0cmFuc3BhcmVudCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztmb250LXNpemU6MTBweH1cbi5kc2RyLWxpbmUtY29tbWVudGVke2JveC1zaGFkb3c6aW5zZXQgM3B4IDAgMCBjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDcwJSwgdHJhbnNwYXJlbnQpfVxuLmRzZHItY29tbWVudC1lZGl0b3J7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1jb21tZW50LWlucHV0e2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6NTJweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6NnB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtyZXNpemU6dmVydGljYWx9XG4uZHNkci1jb21tZW50LWlucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpfVxuLmRzZHItY29tbWVudC1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6NnB4O2p1c3RpZnktY29udGVudDpmbGV4LWVuZH1cbi5kc2RyLW9wZW5saW5le2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MThweDtoZWlnaHQ6MThweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1saW5lOmhvdmVyIC5kc2RyLW9wZW5saW5lLC5kc2RyLW9wZW5saW5lOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItb3BlbmxpbmU6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItbGluZS1maW5kaW5ne2JveC1zaGFkb3c6aW5zZXQgM3B4IDAgMCB2YXIoLS1kc2RyLWZpbmRpbmctY29sb3IsIHJnYmEoMjU1LDE2Niw4NywuNykpfVxuLmRzZHItZmluZGluZy1QMHstLWRzZHItZmluZGluZy1jb2xvcjojZjg1MTQ5fVxuLmRzZHItZmluZGluZy1QMXstLWRzZHItZmluZGluZy1jb2xvcjojZmZhNjU3fVxuLmRzZHItZmluZGluZy1QMnstLWRzZHItZmluZGluZy1jb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy1QM3stLWRzZHItZmluZGluZy1jb2xvcjojOGI5NDllfVxuLmRzZHItZmluZGluZy10YWd7ZmxleDpub25lO2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjE0cHg7Ym9yZGVyLXJhZGl1czo0cHg7cGFkZGluZzowIDRweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo2MDA7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0O21hcmdpbi10b3A6MnB4fVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAwe2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE4KTtjb2xvcjojZjg1MTQ5fVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAxe2JhY2tncm91bmQ6cmdiYSgyNTUsMTY2LDg3LC4xNik7Y29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMntiYWNrZ3JvdW5kOnJnYmEoMjEwLDE1MywzNCwuMTYpO2NvbG9yOiNkMjk5MjJ9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDN7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtanVtcHtiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpfVxuLmRzZHItdmVyZGljdHtwb3NpdGlvbjpzdGlja3k7dG9wOjA7ei1pbmRleDo2O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDttYXJnaW46MCAwIDZweDtwYWRkaW5nOjhweCAxMnB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjEwcHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Mik7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLXZlcmRpY3QtbWFya3tmbGV4Om5vbmU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoyMHB4O2hlaWdodDoyMHB4O2JvcmRlci1yYWRpdXM6NTAlO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjcwMH1cbi5kc2RyLXZlcmRpY3Qtb2sgLmRzZHItdmVyZGljdC1tYXJre2JhY2tncm91bmQ6Y29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpIDE4JSwgdHJhbnNwYXJlbnQpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdmVyZGljdC1iYWQgLmRzZHItdmVyZGljdC1tYXJre2JhY2tncm91bmQ6Y29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KSAxOCUsIHRyYW5zcGFyZW50KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci12ZXJkaWN0LXRleHR7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3Qtb2sgLmRzZHItdmVyZGljdC10ZXh0e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdmVyZGljdC1iYWQgLmRzZHItdmVyZGljdC10ZXh0e2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3QtbWV0YXtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci12ZXJkaWN0LW1vZGVse2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1maW5kaW5nLWNhcmR7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O21hcmdpbjo0cHggMCA2cHg7cGFkZGluZzo4cHggMTZweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLmRzZHItc2F2ZWQtY29tbWVudC1sb2N7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXNhdmVkLWNvbW1lbnQtanVtcHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7d2lkdGg6MTAwJTttaW4td2lkdGg6MDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6NnB4O3BhZGRpbmc6MnB4O3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcjtmb250OmluaGVyaXR9XG4uZHNkci1zYXZlZC1jb21tZW50LWp1bXA6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItc2F2ZWQtY29tbWVudC1qdW1wOmhvdmVyIC5kc2RyLXNhdmVkLWNvbW1lbnQtbG9je2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItc2F2ZWQtY29tbWVudC12aWV3e3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7cmVzaXplOm5vbmV9XG4uZHNkci1maW5kaW5nLWNhcmQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci1maW5kaW5nLWNhcmQtdGl0bGV7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maW5kaW5nLWNhcmQtbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfVxuLmRzZHItZmluZGluZy1jYXJkLWRldGFpbHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1maW5kaW5nLWNhcmQtbWV0YXtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmluZGluZy1jYXJkLXN1Z2dlc3Rpb257bWFyZ2luOjA7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXBye2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDtwYWRkaW5nOjRweCA4cHggOHB4fVxuLmRzZHItcHItaXRlbXtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDozcHg7Ym9yZGVyLXJhZGl1czo4cHg7cGFkZGluZzo2cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdH1cbi5kc2RyLXByLWl0ZW06aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItcHItbWV0YXtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItcHItdGV4dHtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZG9ja3tib3gtc2l6aW5nOmJvcmRlci1ib3g7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NnB4O3dpZHRoOjEwMCU7bWF4LXdpZHRoOnZhcigtLWRzaC1jb21wb3Nlci1jYXJkLW1heC13aWR0aCwgNzgwcHgpO21hcmdpbjowIGF1dG8gY2FsYygtMSAqIHZhcigtLWRzaC1jb21wb3Nlci1zdGFjay1nYXAsIDZweCkgLSA4cHgpO3BhZGRpbmc6OHB4IDE2cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtaW5wdXQtbWFqb3IpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMi1kYXJrbW9kZS10aGluKTtib3JkZXItYm90dG9tOm5vbmU7Ym9yZGVyLXJhZGl1czoyMnB4IDIycHggMCAwO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZG9jay1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDttaW4taGVpZ2h0OjIycHg7bWFyZ2luOi04cHggLTE2cHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItcmFkaXVzOjIycHggMjJweCAwIDA7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci1kb2NrLWhlYWQ6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZG9jay1pY29ue2Rpc3BsYXk6aW5saW5lLWZsZXg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpfVxuLmRzZHItZG9jay1jb3VudHtmb250LXdlaWdodDo2MDA7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci1kb2NrLWZsYXNoe2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpO2ZvbnQtc2l6ZToxMXB4O3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2stc2VuZC1oaW50e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCk7dmlzaWJpbGl0eTpoaWRkZW47d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItZG9jay1oZWFkOmhvdmVyIC5kc2RyLWRvY2stc2VuZC1oaW50e3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWRvY2stY2xvc2V7ZmxleDpub25lO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MjBweDtoZWlnaHQ6MjBweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjZweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowfVxuLmRzZHItZG9jay1jbG9zZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZG9jay1jaGlwc3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWluLWhlaWdodDoyNnB4O21hcmdpbjowIC0xNnB4O3BhZGRpbmc6MCAxNnB4O292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWRvY2stY2hpcHtmbGV4OjAgMSBhdXRvO21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjNweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0O3RleHQtYWxpZ246bGVmdH1cbi5kc2RyLWRvY2stY2hpcDpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1kb2NrLWNoaXAtbG9je2ZsZXg6bm9uZTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCk7d2hpdGUtc3BhY2U6bm93cmFwO21heC13aWR0aDo0MiU7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXN9XG4uZHNkci1kb2NrLWNoaXAtdGV4dHttaW4td2lkdGg6MDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc31cbi5kc2RyLWRvY2stY2hpcC1tb3Jle2ZsZXg6bm9uZTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzoycHggNnB4O2JvcmRlci1yYWRpdXM6NnB4O3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2stY2hpcC1tb3JlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZW5ke3Bvc2l0aW9uOmFic29sdXRlO3otaW5kZXg6NDA7dG9wOjUycHg7cmlnaHQ6MTZweDt3aWR0aDptaW4oNDgwcHgsY2FsYygxMDAlIC0gMzJweCkpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym9yZGVyLXJhZGl1czoxMnB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpO3BhZGRpbmc6MTJweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo4cHh9XG4uZHNkci1zZW5kLXRpdGxle2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZW5kLWhpbnR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc2VuZC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjE0MHB4O21heC1oZWlnaHQ6MzIwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cmVzaXplOnZlcnRpY2FsO3doaXRlLXNwYWNlOnByZS13cmFwfVxuLmRzZHItbGluZS1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItbGluZS1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItbGluZS1odW5re2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWZpbGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWxpbmUtbm90ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtc3R5bGU6aXRhbGljfVxuLmRzZHItaHVuay1iYXJ7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4O3BhZGRpbmc6NHB4IDEycHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMil9XG4uZHNkci1odW5rLWFjdGlvbntkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjI4cHg7aGVpZ2h0OjI4cHg7cGFkZGluZzowO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udDoxOHB4LzEgdmFyKC0tZHN3LWZvbnQtc2Fucyk7Y3Vyc29yOnBvaW50ZXJ9LmRzZHItaHVuay1hY3Rpb246aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX0uZHNkci1odW5rLWFjdGlvbi1zdGFnZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX0uZHNkci1odW5rLWFjdGlvbi1yZXZlcnQ6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXR1cy1kYW5nZXIpfS5kc2RyLWh1bmstYWN0aW9uOmRpc2FibGVke2N1cnNvcjpkZWZhdWx0O29wYWNpdHk6LjQ1fVxuLmRzZHItaHVuay1sYXllcntmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7bWFyZ2luLXJpZ2h0OmF1dG99XG4uZHNkci1mb290e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzo4cHggMTZweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4Om5vbmU7bWluLWhlaWdodDozNnB4fVxuLmRzZHItbm90aWNle2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItbm90aWNlLW9re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItbm90aWNlLWVycm9ye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXNwaW5uZXJ7ZmxleDpub25lO3dpZHRoOjEycHg7aGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjJweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItdG9wLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2FuaW1hdGlvbjpkc2RyLXNwaW4gLjhzIGxpbmVhciBpbmZpbml0ZX1cbkBrZXlmcmFtZXMgZHNkci1zcGlue3Rve3RyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKX19XG4uZHNkci1lbXB0eXtwYWRkaW5nOjQwcHg7dGV4dC1hbGlnbjpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweH1cbi5kc2RyLWVtcHR5LWFjdGlvbnN7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpjZW50ZXI7bWFyZ2luLXRvcDoxMnB4fVxuLmRzZHItbm9kaWZme3BhZGRpbmc6OHB4IDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLXNlbHtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItc2VsLXRyaWdnZXJ7Ym94LXNpemluZzpjb250ZW50LWJveDttaW4td2lkdGg6MTgwcHg7aGVpZ2h0OjM0cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMyk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzowIDEycHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxM3B4O2xpbmUtaGVpZ2h0OjEuNTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4fVxuLmRzZHItc2VsLXRyaWdnZXI6aG92ZXJ7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItc2VsLXRyaWdnZXI6Zm9jdXMtdmlzaWJsZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpO291dGxpbmU6bm9uZX1cbi5kc2RyLXNlbC10cmlnZ2VyIHN2Z3tmbGV4Om5vbmU7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjEyc31cbi5kc2RyLXNlbC10cmlnZ2VyW2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdIHN2Z3t0cmFuc2Zvcm06cm90YXRlKDE4MGRlZyl9XG4uZHNkci1zZWwtdmFsdWV7ZmxleDoxO21pbi13aWR0aDowO3RleHQtYWxpZ246bGVmdDt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpcztvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1zZWwtbWVudXt6LWluZGV4OjIwMDtib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLXdpZHRoOjEwMCU7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1zcGVjaWZpYy1tZW51KTtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtib3JkZXItcmFkaXVzOjEwcHg7bWFyZ2luOjA7cGFkZGluZzo0cHg7bGlzdC1zdHlsZTpub25lO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjFweDtwb3NpdGlvbjphYnNvbHV0ZTt0b3A6Y2FsYygxMDAlICsgNXB4KTtsZWZ0OjB9XG4uZHNkci1zZWwtb3B0aW9ue2JveC1zaXppbmc6Ym9yZGVyLWJveDt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MzBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Ym9yZGVyLXJhZGl1czo3cHg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo1cHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO3RleHQtYWxpZ246bGVmdDtkaXNwbGF5OmZsZXh9XG4uZHNkci1zZWwtb3B0aW9uOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXNlbC1vcHRpb24tYWN0aXZle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbWFya3tmbGV4Om5vbmU7d2lkdGg6MTRweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItc2VsLW9wdGlvbi1sYWJlbHtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItdmlldy10b2dnbGV7ZGlzcGxheTpmbGV4O2dhcDoycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjdweDtwYWRkaW5nOjJweDtmbGV4Om5vbmV9XG4uZHNkci12aWV3LWJ0bntib3gtc2l6aW5nOmJvcmRlci1ib3g7bWluLWhlaWdodDoyMnB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NXB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjFweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHh9XG4uZHNkci12aWV3LWJ0bjpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXZpZXctYnRuLWFjdGl2ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXR7bWluLXdpZHRoOjEwMCV9XG4uZHNkci1zcGxpdC1oZWFke2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzo0cHggOHB4O3Bvc2l0aW9uOnN0aWNreTt0b3A6MDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItc3BsaXQtaGVhZCBkaXZ7ZGlzcGxheTpmbGV4O2dhcDo4cHh9XG4uZHNkci1zcGxpdC1odW5re2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Zm9udC1mYW1pbHk6dmFyKC0tZHNkci1kaWZmLWZvbnQsIHZhcigtLWRzdy1mb250LW1vbm8pKTtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxOHB4O3BhZGRpbmc6MnB4IDE2cHh9XG4uZHNkci1zcGxpdC1yb3d7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCl9XG4uZHNkci1zcGxpdC1jZWxsOmhvdmVyIC5kc2RyLWNvbW1lbnQtYWRkLC5kc2RyLXNwbGl0LXJvdzpob3ZlciAuZHNkci1jb21tZW50LWFkZHt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1zcGxpdC1jZWxse2Rpc3BsYXk6ZmxleDtmbGV4LXdyYXA6d3JhcDtnYXA6OHB4O3BhZGRpbmc6MCA4cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zcGxpdC1jZWxsPi5kc2RyLWNvbW1lbnQtZWRpdG9ye2ZsZXg6MCAwIDEwMCU7cGFkZGluZzo2cHggOHB4fVxuLmRzZHItc3BsaXQtbnVte2ZsZXg6bm9uZTtwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDo0MnB4O3RleHQtYWxpZ246cmlnaHQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTt1c2VyLXNlbGVjdDpub25lO2ZvbnQtc2l6ZTpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSAtIDFweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjB9XG4uZHNkci1jZWxsLWZpbmRpbmd7Ym94LXNoYWRvdzppbnNldCAwIDAgMCAxcHggdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKTtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMDgpfVxuLmRzZHItY2VsbC1qdW1we2JhY2tncm91bmQ6cmdiYSg4OCwxNjYsMjU1LC4xNil9XG4uZHNkci1zcGxpdC1maW5kaW5ne2ZsZXg6bm9uZTtmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEycHg7Ym9yZGVyLXJhZGl1czozcHg7cGFkZGluZzowIDNweDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXdlaWdodDo2MDA7YWxpZ24tc2VsZjpmbGV4LXN0YXJ0fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDB7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTgpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QMntiYWNrZ3JvdW5kOnJnYmEoMjEwLDE1MywzNCwuMTYpO2NvbG9yOiNkMjk5MjJ9XG4uZHNkci1zcGxpdC1maW5kaW5nLmRzZHItZmluZGluZy1QM3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItc3BsaXQtb3BlbmxpbmV7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoxNnB4O2hlaWdodDoxNnB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxO3BhZGRpbmc6MDt2aXNpYmlsaXR5OmhpZGRlbn1cbi5kc2RyLXNwbGl0LWNlbGw6aG92ZXIgLmRzZHItc3BsaXQtb3BlbmxpbmUsLmRzZHItc3BsaXQtb3BlbmxpbmU6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1zcGxpdC1vcGVubGluZTpob3Zlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jZWxsLWFkZHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xMyl9XG4uZHNkci1jZWxsLWRlbHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xMil9XG4uZHNkci1jZWxsLWRpbXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwxLCByZ2JhKDEyOCwxMjgsMTI4LC4wNSkpfVxuLyogLS0tIGNvbnZlcnNhdGlvbiByZXZpZXcgY2FyZCAoQ29kZXgtc3R5bGUpIC0tLSAqL1xuLmRzZHItcmV2aWV3LWNhcmR7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O21heC13aWR0aDptaW4oNzIwcHgsMTAwJSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1yYWRpdXM6MTZweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYyKTtvdmVyZmxvdzpoaWRkZW47bWFyZ2luOjJweCAwfVxuLmRzZHItcmV2aWV3LWNhcmQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo4cHggMTJweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtmbGV4LXdyYXA6d3JhcH1cbi5kc2RyLXJldmlldy1jYXJkLWJhZGdle2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWJhZGdlIHN2Z3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtYnV0dG9uLWluZm8tZmlsbCl9XG4uZHNkci1yZXZpZXctY2FyZC13b3Jrc3BhY2V7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfVxuLmRzZHItcmV2aWV3LWNhcmQtbWV0YXtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWdyb3Vwe2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDt3aWR0aDoxMDAlO21pbi13aWR0aDowO3BhZGRpbmc6NnB4IDEycHg7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC1wYXRoIHNwYW57bWluLXdpZHRoOjA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItcmV2aWV3LWNhcmQtaXRlbXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6OHB4O3dpZHRoOjEwMCU7bWluLXdpZHRoOjA7cGFkZGluZzo1cHggMTJweCA1cHggMjZweDtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci1yZXZpZXctY2FyZC1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXJldmlldy1jYXJkLWxvY3tmbGV4Om5vbmU7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpO3doaXRlLXNwYWNlOm5vd3JhcDtwYWRkaW5nLXRvcDoxcHh9XG4uZHNkci1yZXZpZXctY2FyZC10ZXh0e21pbi13aWR0aDowO292ZXJmbG93LXdyYXA6YW55d2hlcmU7d2hpdGUtc3BhY2U6cHJlLXdyYXB9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LXNlY3tkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo4cHggMTJweDtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7Zm9udC1zaXplOjEycHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3R7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2ZvbnQtd2VpZ2h0OjYwMDtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjFweCA2cHh9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LWNvcnJlY3R7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC1pbmNvcnJlY3R7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTYpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWZpbmRpbmd7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjZweDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtZmluZGluZy10ZXh0e21pbi13aWR0aDowO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1yZXZpZXctY2FyZC1maW5kaW5nLWxvY3tmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtZm9vdHtwYWRkaW5nOjZweCAxMnB4O2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4vKiAtLS0gQ29kZXgtc3R5bGUgcmVwbHkgY2hhbmdlIHN1bW1hcnkgKHR1cm4gdGFpbCkgLS0tICovXG4uZHNkci10dXJuLXN1bW1hcnl7bWF4LXdpZHRoOm1pbig3MjBweCwxMDAlKTttYXJnaW46MnB4IDAgMTBweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1yYWRpdXM6MTRweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXR1cm4tc3VtbWFyeS1oZWFke2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzoxMnB4IDE0cHh9XG4uZHNkci10dXJuLXN1bW1hcnktaWNvbntkaXNwbGF5OmdyaWQ7cGxhY2UtaXRlbXM6Y2VudGVyO3dpZHRoOjM0cHg7aGVpZ2h0OjM0cHg7Ym9yZGVyLXJhZGl1czoxMHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdHVybi1zdW1tYXJ5LXRpdGxle2ZvbnQtc2l6ZToxNHB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci10dXJuLXN1bW1hcnktc3RhdHN7Zm9udC1zaXplOjEzcHg7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLXR1cm4tc3VtbWFyeS1hZGR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10dXJuLXN1bW1hcnktZGVse2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTttYXJnaW4tbGVmdDo0cHh9XG4uZHNkci10dXJuLXN1bW1hcnktZmlsZXN7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4uZHNkci10dXJuLXN1bW1hcnktZmlsZXtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7d2lkdGg6MTAwJTtwYWRkaW5nOjhweCAxNHB4O2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udDppbmhlcml0O2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMnB4O3RleHQtYWxpZ246bGVmdDtjdXJzb3I6cG9pbnRlcn1cbi5kc2RyLXR1cm4tc3VtbWFyeS1maWxlOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci10dXJuLXN1bW1hcnktZmlsZSBzcGFuOmZpcnN0LWNoaWxke21pbi13aWR0aDowO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLXR1cm4tc3VtbWFyeS1maWxlLXN0YXRze21hcmdpbi1sZWZ0OmF1dG87ZmxleDpub25lO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LXNhbnMsc3lzdGVtLXVpKTtmb250LXNpemU6MTJweH1cbi8qIC0tLSBGaWxlcyBkcmF3ZXIgLS0tICovXG4uZHNkci1maWxlcy13b3Jrc3BhY2V7ZGlzcGxheTpmbGV4O21pbi1oZWlnaHQ6MDtmbGV4OjE7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSl9XG4uZHNkci1maWxlcy10b29sYmFye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7cGFkZGluZzoxMHB4IDEycHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4uZHNkci1maWxlcy1zZWFyY2h7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo3cHggOXB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweH1cbi5kc2RyLWZpbGVzLWNvbnRlbnR7ZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczptaW5tYXgoMjMwcHgsMzElKSAxZnI7bWluLWhlaWdodDowO2ZsZXg6MX1cbi5kc2RyLWZpbGVzLWxpc3R7b3ZlcmZsb3c6YXV0bztib3JkZXItcmlnaHQ6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO3BhZGRpbmc6OHB4IDZweH1cbi5kc2RyLWZpbGVzLWl0ZW17ZGlzcGxheTpmbGV4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7cGFkZGluZzo2cHggOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQ6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci1maWxlcy1pdGVtOmhvdmVyLC5kc2RyLWZpbGVzLWl0ZW0tYWN0aXZle2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1maWxlcy1lZGl0b3J7ZGlzcGxheTpmbGV4O21pbi13aWR0aDowO2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn0uZHNkci1maWxlcy1wYXRoe3BhZGRpbmc6OHB4IDEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250OjExcHggdmFyKC0tZHN3LWZvbnQtbW9ubyk7d2hpdGUtc3BhY2U6bm93cmFwO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLmRzZHItY29kZS1lZGl0b3J7ZGlzcGxheTpmbGV4O21pbi1oZWlnaHQ6MDtmbGV4OjE7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMSk7b3ZlcmZsb3c6aGlkZGVufS5kc2RyLWNvZGUtbGluZXN7ZmxleDpub25lO3dpZHRoOjQ4cHg7Ym94LXNpemluZzpib3JkZXItYm94O292ZXJmbG93OmhpZGRlbjtwYWRkaW5nOjEycHggOHB4IDEycHggMDtib3JkZXItcmlnaHQ6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udDoxMnB4LzIwcHggdmFyKC0tZHN3LWZvbnQtbW9ubyk7dGV4dC1hbGlnbjpyaWdodDt1c2VyLXNlbGVjdDpub25lfS5kc2RyLWNvZGUtbGluZXMgc3BhbntkaXNwbGF5OmJsb2NrO2hlaWdodDoyMHB4fVxuLmRzZHItY29kZS1sYXllcntwb3NpdGlvbjpyZWxhdGl2ZTttaW4td2lkdGg6MDttaW4taGVpZ2h0OjA7ZmxleDoxO292ZXJmbG93OmhpZGRlbn0uZHNkci1jb2RlLWhpZ2hsaWdodCwuZHNkci1maWxlcy10ZXh0e2JveC1zaXppbmc6Ym9yZGVyLWJveDtwb3NpdGlvbjphYnNvbHV0ZTtpbnNldDowO21hcmdpbjowO3BhZGRpbmc6MTJweCAxNHB4O2JvcmRlcjowO2ZvbnQ6MTJweC8yMHB4IHZhcigtLWRzdy1mb250LW1vbm8pO3RhYi1zaXplOjI7d2hpdGUtc3BhY2U6cHJlO292ZXJmbG93OmF1dG99LmRzZHItY29kZS1oaWdobGlnaHR7cG9pbnRlci1ldmVudHM6bm9uZTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7YmFja2dyb3VuZDp0cmFuc3BhcmVudH0uZHNkci1maWxlcy10ZXh0e3Jlc2l6ZTpub25lO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dHJhbnNwYXJlbnQ7Y2FyZXQtY29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO291dGxpbmU6MDstd2Via2l0LXRleHQtZmlsbC1jb2xvcjp0cmFuc3BhcmVudH0uZHNkci1maWxlcy10ZXh0OjpzZWxlY3Rpb257YmFja2dyb3VuZDpyZ2JhKDkxLDE0MCwyNTUsLjM1KX1cbi5kc2RyLWNvZGUta2V5d29yZHtjb2xvcjojYzU4NmMwfS5kc2RyLWNvZGUtc3RyaW5ne2NvbG9yOiNjZTkxNzh9LmRzZHItY29kZS1jb21tZW50e2NvbG9yOiM2YTk5NTV9LmRzZHItY29kZS1udW1iZXJ7Y29sb3I6I2I1Y2VhOH0uZHNkci1jb2RlLXBsYWlue2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWZpbGVzLWFjdGlvbnN7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O3BhZGRpbmc6OHB4IDEwcHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4vKiAtLS0gZmFsbGJhY2sgdXNlciBidWJibGUgKG5hdGl2ZSBsb29rKSAtLS0gKi9cbi5kc2RyLWZhbGxiYWNrLXVzZXJ7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmZsZXgtZW5kO2dhcDo2cHg7ZGlzcGxheTpmbGV4fVxuLmRzZHItZmFsbGJhY2stdXNlci1zdGFja3tmbGV4LWRpcmVjdGlvbjpjb2x1bW47YWxpZ24taXRlbXM6ZmxleC1lbmQ7Z2FwOjhweDttaW4td2lkdGg6MDttYXgtd2lkdGg6bWluKDUyNXB4LDgyJSk7ZGlzcGxheTpmbGV4fVxuLmRzZHItZmFsbGJhY2stdXNlci1yb3d7ZmxleC1kaXJlY3Rpb246cm93O2FsaWduLWl0ZW1zOmZsZXgtZW5kO2dhcDo2cHg7bWF4LXdpZHRoOjEwMCU7ZGlzcGxheTpmbGV4fVxuLmRzZHItZmFsbGJhY2stdXNlci1idWJibGV7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtYnViYmxlKTttYXgtd2lkdGg6MTAwJTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7Ym9yZGVyLXJhZGl1czoyMnB4O3BhZGRpbmc6MTBweCAxNnB4O2ZvbnQtc2l6ZToxNnB4O2xpbmUtaGVpZ2h0OjI0cHg7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLWZhbGxiYWNrLXVzZXItY29weXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjI0cHg7aGVpZ2h0OjI0cHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDowIDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtmb250OmluaGVyaXQ7Zm9udC1zaXplOjExcHg7dmlzaWJpbGl0eTpoaWRkZW47bWFyZ2luLWJvdHRvbToycHh9XG4uZHNkci1mYWxsYmFjay11c2VyOmhvdmVyIC5kc2RyLWZhbGxiYWNrLXVzZXItY29weSwuZHNkci1mYWxsYmFjay11c2VyLWNvcHk6Zm9jdXMtdmlzaWJsZXt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1mYWxsYmFjay11c2VyLWNvcHk6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbmBcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHN0eWxlW2RhdGEtcGx1Z2luLWNzcz0ke0pTT04uc3RyaW5naWZ5KFNUWUxFX1RBRyl9XWApID09PSBudWxsKSB7XG4gIGNvbnN0IHRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgdGFnLmRhdGFzZXQucGx1Z2luID0gJ2RzaC1wbHVnaW4tZGlmZi1yZXZpZXcnXG4gIHRhZy5kYXRhc2V0LnBsdWdpbkNzcyA9IFNUWUxFX1RBR1xuICB0YWcudGV4dENvbnRlbnQgPSBSRVZJRVdfQ1NTXG4gIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGFnKVxufVxuXG4vKiogU2ltcGxpZmllZCBDaGluZXNlIGRpY3Rpb25hcnkgKGtleS1zZXQgc291cmNlIG9mIHRydXRoKS4gKi9cbmNvbnN0IHpoID0ge1xuICAnYWN0aW9uLmxhYmVsJzogJ1x1NTNEOFx1NTJBOCcsXG4gICdhY3Rpb24uYXJpYSc6ICdcdTVCQTFcdTY3RTVcdTVGNTNcdTUyNERcdTk4NzlcdTc2RUVcdTRFMEVcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzknLFxuICAndGFiLnNlc3Npb24nOiAnXHU0RjFBXHU4QkREXHU2NkY0XHU2NTM5JyxcbiAgJ3RhYi53b3Jrc3BhY2UnOiAnXHU1REU1XHU0RjVDXHU1MzNBJyxcbiAgJ3Jldmlldy50aXRsZSc6ICdcdTUzRDhcdTUyQTgnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ1x1NkUzOFx1NzlCQiBIRUFEJyxcbiAgJ3Jldmlldy5ub3RSZXBvJzogJ1x1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVx1NEUwRFx1NjYyRiBnaXQgXHU0RUQzXHU1RTkzJyxcbiAgJ3Jldmlldy5ub3RSZXBvSGludCc6ICdcdTMwMENcdTRGMUFcdThCRERcdTY2RjRcdTY1MzlcdTMwMERcdTk4NzVcdTdCN0VcdTRFMERcdTUzRDdcdTVGNzFcdTU0Q0RcdUZGMENcdTRFQ0RcdTUzRUZcdTY3RTVcdTc3MEJcdTZCQ0ZcdThGNkVcdTRGRUVcdTY1MzlcdTMwMDInLFxuICAncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnOiAnXHU4RkQ5XHU0RTJBXHU0RjFBXHU4QkREXHU4RkQ4XHU2Q0ExXHU2NzA5XHU2NTg3XHU0RUY2XHU0RkVFXHU2NTM5XHU4QkIwXHU1RjU1JyxcbiAgJ3Jldmlldy5zZXNzaW9uU2Nhbic6ICdcdTVERjJcdTYyNkJcdTYzQ0Yge3Jlc3VsdHN9IFx1NEUyQVx1NURFNVx1NTE3N1x1N0VEM1x1Njc5Q1x1RkYxQXtkaWZmfSBcdTRFMkFcdTY0M0FcdTVFMjYgZGlmZlx1MzAwMXtwYXRofSBcdTRFMkFcdTRFQzVcdTY3MDlcdThERUZcdTVGODRcdTIwMTRcdTIwMTRcdTdFQzhcdTdBRUZcdTU0N0RcdTRFRTRcdUZGMDhiYXNoXHVGRjA5XHU2NTM5XHU2NTg3XHU0RUY2XHU0RTBEXHU0RjFBXHU4QkExXHU1MTY1XHU0RjFBXHU4QkREXHU4QkIwXHU1RjU1XHUzMDAyJyxcbiAgJ3Jldmlldy5nb1dvcmtzcGFjZSc6ICdcdTY3RTVcdTc3MEJcdTVERTVcdTRGNUNcdTUzM0FcdTY1MzlcdTUyQTgnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSBcdThGNkUgXHUwMEI3IHtmaWxlc30gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5yb3VuZCc6ICdcdTdCMkMge3JvdW5kfSBcdThGNkUnLFxuICAncmV2aWV3LmVtcHR5JzogJ1x1NkNBMVx1NjcwOVx1NjcyQVx1NjNEMFx1NEVBNFx1NzY4NFx1NjZGNFx1NjUzOSBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdcdTUyQTBcdThGN0RcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdcdTUxNjhcdTkwRThcdTkxQzdcdTdFQjMnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVuc3RhZ2UnOiAnXHU1M0Q2XHU2RDg4XHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1x1NTE2OFx1OTBFOFx1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlJzogJ1x1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnJldmVydCc6ICdcdTRFMjJcdTVGMDMnLFxuICAnaHVuay51bnN0YWdlJzogJ1x1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdodW5rLnN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAnaHVuay51bnN0YWdlZCc6ICdcdTY3MkFcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NTE2OFx1OTBFOFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnXHU2M0QwXHU0RUE0XHU4QkY0XHU2NjBFXHUyMDI2JyxcbiAgJ3Jldmlldy5wdXNoJzogJ1x1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU2M0E4XHU5MDAxJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnXHU1REYyXHU2M0QwXHU0RUE0IHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ1x1NjNEMFx1NEVBNFx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucHVzaGVkJzogJ1x1NURGMlx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdcdTYzQThcdTkwMDFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmFoZWFkJzogJ1x1OTg4Nlx1NTE0OCB7bn0nLFxuICAncmV2aWV3LmJlaGluZCc6ICdcdTg0M0RcdTU0MEUge259JyxcbiAgJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJzogJ1x1NURGMlx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ1x1NTIwNlx1NjUyRlx1NEUwRVx1OEZEQ1x1N0EwQicsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdcdTY3MkFcdThCQkVcdTdGNkVcdTRFMEFcdTZFMzhcdTUyMDZcdTY1MkYnLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnXHU1Mzg2XHU1M0YyJyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdcdTUzRDhcdTUyQThcdTY1ODdcdTRFRjYnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdcdTY3MkNcdTU3MzAnLFxuICAnaGlzdG9yeS5yZW1vdGUnOiAnXHU4RkRDXHU3QTBCJyxcbiAgJ3RpbWUubm93JzogJ1x1NTIxQVx1NTIxQScsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IFx1NTIwNlx1OTQ5Rlx1NTI0RCcsXG4gICd0aW1lLmhvdXJzJzogJ3tufSBcdTVDMEZcdTY1RjZcdTUyNEQnLFxuICAndGltZS5kYXlzJzogJ3tufSBcdTU5MjlcdTUyNEQnLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnXHU1MjM3XHU2NUIwJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdcdTUxNzNcdTk1RUQnLFxuICAncmV2aWV3LmJ1c3knOiAnXHU1OTA0XHU3NDA2XHU0RTJEXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ1x1NURGMnthY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAnXHU1REYye2FjdGlvbn0ge2NvdW50fSBcdTRFMkFcdTY1ODdcdTRFRjZcdUZGMDhcdTUyMjBcdTk2NjQge2RlbGV0ZWR9IFx1NEUyQVx1NjcyQVx1OERERlx1OEUyQVx1NjU4N1x1NEVGNlx1RkYwOScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRlZCc6ICdcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICdcdTY3MkFcdThEREZcdThFMkEnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdcdTRFOENcdThGREJcdTUyMzYnLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnXHU4QkU1XHU0RkVFXHU2NTM5XHU2Q0ExXHU2NzA5IGRpZmYgXHU2NTcwXHU2MzZFJyxcbiAgJ3Jldmlldy5jaGFuZ2VzJzogJ3thZGRlZH0rIHtkZWxldGVkfS0nLFxuICAndmlldy5zaW5nbGUnOiAnXHU1MzU1XHU2ODBGJyxcbiAgJ3ZpZXcuc3BsaXQnOiAnXHU1M0NDXHU2ODBGJyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ1x1NTM5Rlx1NjU4N1x1NEVGNicsXG4gICd2aWV3LmFmdGVyJzogJ1x1NjVCMFx1NjU4N1x1NEVGNicsXG4gICdjb21tZW50LmFkZCc6ICdcdThCQzRcdThCQkFcdTZCNjRcdTg4NEMnLFxuICAnY29tbWVudC5zaG93JzogJ1x1NjdFNVx1NzcwQlx1OEJDNFx1OEJCQScsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ1x1OEJDNFx1OEJCQVx1MjAyNlx1RkYwOEN0cmwvXHUyMzE4K0VudGVyIFx1NEZERFx1NUI1OFx1RkYwOScsXG4gICdjb21tZW50LnNhdmUnOiAnXHU0RkREXHU1QjU4JyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ1x1NTNENlx1NkQ4OCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdcdTUyMjBcdTk2NjQnLFxuICAnY29tbWVudC5lZGl0JzogJ1x1N0YxNlx1OEY5MScsXG4gICdjb21tZW50LnNhdmVkJzogJ1x1NURGMlx1NEZERFx1NUI1OFx1OEJDNFx1OEJCQScsXG4gICdjb21tZW50LmZhaWxlZCc6ICdcdThCQzRcdThCQkFcdTRGRERcdTVCNThcdTU5MzFcdThEMjUnLFxuICAnc2NvcGUubGFiZWwnOiAnXHU4MzAzXHU1NkY0JyxcbiAgJ3Njb3BlLmFsbCc6ICdcdTUxNjhcdTkwRTgnLFxuICAnc2NvcGUudW5zdGFnZWQnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Njb3BlLnN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAnc2NvcGUuY29tbWl0JzogJ1x1NjNEMFx1NEVBNCcsXG4gICdzY29wZS5icmFuY2gnOiAnXHU1MjA2XHU2NTJGJyxcbiAgJ3Njb3BlLmxhc3QtdHVybic6ICdcdTY3MDBcdTU0MEVcdTRFMDBcdThGNkUnLFxuICAncmV2aWV3Lmxhc3RUdXJuRW1wdHknOiAnXHU2NzAwXHU1NDBFXHU0RTAwXHU4RjZFXHU2Q0ExXHU2NzA5XHU4QkIwXHU1RjU1XHU1MjMwXHU2NTg3XHU0RUY2XHU0RkVFXHU2NTM5IFx1MjAxNFx1MjAxNCBcdTdFQzhcdTdBRUZcdTU0N0RcdTRFRTRcdUZGMDhiYXNoXHVGRjA5XHU2NTM5XHU2NTg3XHU0RUY2XHU0RTBEXHU0RjFBXHU4QkExXHU1MTY1XHU0RjFBXHU4QkREXHU4QkIwXHU1RjU1XHVGRjFCXHU1M0VGXHU1MjA3XHU1MjMwXHUzMDBDXHU1MTY4XHU5MEU4XHUzMDBEXHU2N0U1XHU3NzBCIGdpdCBcdTUzRDhcdTY2RjQnLFxuICAnc2NvcGUuYmFzZSc6ICdcdTU3RkFcdTdFQkZcdTUyMDZcdTY1MkYnLFxuICAnc2NvcGUuYnJhbmNoUmVhZG9ubHknOiAnXHU1MjA2XHU2NTJGXHU4MzAzXHU1NkY0XHU1M0VBXHU4QkZCXHVGRjA4XHU1QkY5XHU2QkQ0IG1lcmdlLWJhc2VcdUZGMENcdTRFMERcdTYzRDBcdTRGOUJcdTkxQzdcdTdFQjMvXHU0RTIyXHU1RjAzXHVGRjA5JyxcbiAgJ3Jldmlldy5zZWxlY3RDb21taXQnOiAnXHU0RUNFXHU1REU2XHU0RkE3XHU5MDA5XHU2MkU5XHU2M0QwXHU0RUE0XHU2N0U1XHU3NzBCIGRpZmYnLFxuICAncmV2aWV3LnNlbmRUb0FnZW50JzogJ1x1NTNEMVx1OTAwMVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VuZFRpdGxlJzogJ1x1NTNEMVx1OTAwMVx1ODg0Q1x1NTE4NVx1OEJDNFx1OEJCQVx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VuZEhpbnQnOiAnXHU4QkM0XHU4QkJBXHU0RjFBXHU0RjVDXHU0RTNBXHU4QkM0XHU1QkExXHU2MzA3XHU1RjE1XHU2Q0U4XHU1MTY1XHU1RjUzXHU1MjREXHU0RjFBXHU4QkREXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjA5XHUzMDAyXHU1M0QxXHU5MDAxXHU1OTMxXHU4RDI1XHU2NUY2XHU5MDAwXHU1MzE2XHU0RTNBXHU1OTBEXHU1MjM2XHU2NTg3XHU2NzJDXHUzMDAyJyxcbiAgJ3Jldmlldy5zZW50VG9BZ2VudCc6ICdcdTVERjJcdTUzRDFcdTkwMDFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LmNvcHknOiAnXHU1OTBEXHU1MjM2XHU2NTg3XHU2NzJDJyxcbiAgJ3Jldmlldy5jb3BpZWQnOiAnXHU1REYyXHU1OTBEXHU1MjM2JyxcbiAgJ3Jldmlldy5jb3B5RmFpbGVkJzogJ1x1NTkwRFx1NTIzNlx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcucmV2aWV3JzogJ1x1OEJDNFx1NUJBMScsXG4gICdyZXZpZXcucmV2aWV3aW5nJzogJ1x1OEJDNFx1NUJBMVx1NEUyRFx1MjAyNicsXG4gICdyZXZpZXcucmV2aWV3RmFpbGVkJzogJ1x1OEJDNFx1NUJBMVx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcudmVyZGljdENvcnJlY3QnOiAnXHU4ODY1XHU0RTAxXHU2QjYzXHU3ODZFIFx1MjcxMycsXG4gICdyZXZpZXcudmVyZGljdEluY29ycmVjdCc6ICdcdTg4NjVcdTRFMDFcdTVCNThcdTU3MjhcdTk1RUVcdTk4OTggXHUyNzE3JyxcbiAgJ3Jldmlldy5ub0ZpbmRpbmdzJzogJ1x1NkNBMVx1NjcwOVx1NTNEMVx1NzNCMFx1OTVFRVx1OTg5OCcsXG4gICdyZXZpZXcuZmluZGluZ3MnOiAne259IFx1Njc2MVx1NTNEMVx1NzNCMCcsXG4gICdyZXZpZXcuY29uZmlkZW5jZSc6ICdcdTdGNkVcdTRGRTFcdTVFQTYge2NvbmZpZGVuY2V9JyxcbiAgJ3Jldmlldy5zdWdnZXN0aW9uJzogJ1x1NUVGQVx1OEJBRScsXG4gICdyZXZpZXcuc2VuZEZpbmRpbmdzJzogJ1x1NTNEMVx1OTAwMVx1NTNEMVx1NzNCMFx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcuc2VudEZpbmRpbmdzJzogJ1x1NURGMlx1NTNEMVx1OTAwMVx1NTNEMVx1NzNCMFx1N0VEOVx1NEVFM1x1NzQwNicsXG4gICdyZXZpZXcucmV2aWV3U2NvcGUnOiAnXHU4QkM0XHU1QkExXHU4MzAzXHU1NkY0JyxcbiAgJ3ByLnRpdGxlJzogJ1BSICN7bnVtYmVyfScsXG4gICdwci5jb21tZW50cyc6ICdQUiBcdThCQzRcdThCQkEgKHtufSknLFxuICAncHIubm9Qcic6ICdcdTY1RTBcdTUxNzNcdTgwNTQgUFInLFxuICAncHIuc2VuZENvbW1lbnRzJzogJ1x1NTNEMVx1OTAwMSBQUiBcdThCQzRcdThCQkFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAnZWRpdG9yLm9wZW5GaWxlJzogJ1x1NTcyOFx1N0YxNlx1OEY5MVx1NTY2OFx1NEUyRFx1NjI1M1x1NUYwMCcsXG4gICdlZGl0b3Iub3BlbkxpbmUnOiAnXHU1NzI4XHU3RjE2XHU4RjkxXHU1NjY4XHU0RTJEXHU2MjUzXHU1RjAwXHU4QkU1XHU4ODRDJyxcbiAgJ2VkaXRvci5mYWlsZWQnOiAnXHU2MjUzXHU1RjAwXHU1OTMxXHU4RDI1JyxcbiAgJ3JlcG8ubGFiZWwnOiAnXHU0RUQzXHU1RTkzJyxcbiAgJ3Jldmlldy5kb2NrQ29tbWVudHMnOiAnXHU4ODRDXHU1MTg1XHU4QkM0XHU4QkJBIHtufSBcdTY3NjEnLFxuICAncmV2aWV3LmRvY2tWZXJkaWN0JzogJ1x1OEJDNFx1NUJBMVx1N0VEM1x1OEJCQVx1NUY4NVx1NTNEMVx1OTAwMScsXG4gICdyZXZpZXcuZG9ja1NlbmQnOiAnXHU3MEI5XHU1MUZCXHU1M0QxXHU5MDAxXHU4QkM0XHU4QkJBJyxcbiAgJ3Jldmlldy5kb2NrTW9yZSc6ICdcdThGRDhcdTY3MDkge259IFx1Njc2MVx1OEJDNFx1OEJCQVx1RkYwQ1x1NzBCOVx1NTFGQlx1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NjdFNVx1NzcwQicsXG4gICdyZXZpZXcuY29waWVkRmFsbGJhY2snOiAnXHU0RjFBXHU4QkREXHU0RTBEXHU1M0VGXHU3NTI4XHVGRjBDXHU4QkM0XHU4QkJBXHU1REYyXHU1OTBEXHU1MjM2XHVGRjA4XHU4QkY3XHU3Qzk4XHU4RDM0XHU1M0QxXHU5MDAxXHVGRjA5JyxcbiAgJ3Jldmlldy5zZW5kRmFpbGVkJzogJ1x1OEJDNFx1OEJCQVx1NTNEMVx1OTAwMVx1NTkzMVx1OEQyNScsXG4gICdyZXZpZXcuZG9ja0p1bXAnOiAnXHU3MEI5XHU1MUZCXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU2MjUzXHU1RjAwXHU1QkY5XHU1RTk0XHU1M0Q4XHU2NkY0JyxcbiAgJ3Jldmlldy5jYXJkVGl0bGUnOiAnXHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExJyxcbiAgJ3Jldmlldy5jYXJkQ29tbWVudHMnOiAne259IFx1Njc2MVx1OEJDNFx1OEJCQScsXG4gICdyZXZpZXcuY2FyZFZlcmRpY3QnOiAnQUkgXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBJyxcbiAgJ3Jldmlldy5jYXJkSnVtcCc6ICdcdTcwQjlcdTUxRkJcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTVCOUFcdTRGNERcdTUyMzBcdTVCRjlcdTVFOTRcdTRFRTNcdTc4MDEnLFxuICAncmV2aWV3LmNhcmRPcGVuRmlsZSc6ICdcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTYyNTNcdTVGMDBcdThCRTVcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LmNhcmRIaW50JzogJ1x1NzBCOVx1NTFGQlx1OEJDNFx1OEJCQVx1NTNFRlx1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NUI5QVx1NEY0RFx1NTIzMFx1NUJGOVx1NUU5NFx1NEVFM1x1NzgwMScsXG4gICdyZXZpZXcudHVyblN1bW1hcnlUaXRsZSc6ICdcdTVERjJcdTRGRUVcdTY1Mzkge259IFx1NEUyQVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcudHVyblN1bW1hcnlSZXZpZXcnOiAnXHU4QkM0XHU1QkExJyxcbiAgJ2ZpbGVzLnRpdGxlJzogJ1x1NjU4N1x1NEVGNicsXG4gICdmaWxlcy5zZWFyY2gnOiAnXHU3QjVCXHU5MDA5XHU2NTg3XHU0RUY2XHUyMDI2JyxcbiAgJ2ZpbGVzLnNhdmUnOiAnXHU0RkREXHU1QjU4JyxcbiAgJ2ZpbGVzLnNhdmVkJzogJ1x1NURGMlx1NEZERFx1NUI1OCcsXG4gICdmaWxlcy5sb2FkaW5nJzogJ1x1NkI2M1x1NTcyOFx1OEJGQlx1NTNENlx1MjAyNicsXG4gICdmaWxlcy5lbXB0eSc6ICdcdTZDQTFcdTY3MDlcdTUzMzlcdTkxNERcdTY1ODdcdTRFRjYnLFxuICAvLyBmYWxsYmFjay4qOiBsYWJlbHMgb2YgdGhlIGJ1aWx0LWluIGltYWdlIGZhbGxiYWNrIHZpZXdlciAoRmFsbGJhY2tVc2VyQnViYmxlKSxcbiAgLy8gdXNlZCB3aGVuIGEgcGxhaW4gdXNlciBtZXNzYWdlIGNhcnJpZXMgaW1hZ2VzLlxuICAnZmFsbGJhY2suaW1hZ2UnOiAnXHU1NkZFXHU3MjQ3JyxcbiAgJ2ZhbGxiYWNrLm9wZW4nOiAnXHU2N0U1XHU3NzBCXHU1MzlGXHU1NkZFJyxcbiAgJ2ZhbGxiYWNrLm9wZW5OYW1lZCc6ICdcdTY3RTVcdTc3MEJcdTUzOUZcdTU2RkUge25hbWV9JyxcbiAgJ2ZhbGxiYWNrLmxvYWRpbmcnOiAnXHU1MkEwXHU4RjdEXHU0RTJEXHUyMDI2JyxcbiAgJ2ZhbGxiYWNrLmxvYWRGYWlsZWQnOiAnXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1JyxcbiAgJ2ZhbGxiYWNrLmxpZ2h0Ym94RGlhbG9nJzogJ1x1NTZGRVx1NzI0N1x1OTg4NFx1ODlDOCcsXG4gICdmYWxsYmFjay5saWdodGJveENsb3NlJzogJ1x1NTE3M1x1OTVFRCcsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdcdTUzRDhcdTUyQTgnLFxuICAnc2V0dGluZ3MuZm9udCc6ICdcdTVCNTdcdTRGNTMnLFxuICAnc2V0dGluZ3Muc2l6ZSc6ICdcdTVCNTdcdTUzRjcnLFxuICAnY29uZmlnLnRpdGxlJzogJ1x1OTE0RFx1N0Y2RScsXG4gICdmb250Lm1vbm8nOiAnXHU3QjQ5XHU1QkJEXHVGRjA4XHU5RUQ4XHU4QkE0XHVGRjA5JyxcbiAgJ2ZvbnQuc3lzdGVtJzogJ1x1N0NGQlx1N0VERlx1NUI1N1x1NEY1MycsXG59IGFzIGNvbnN0XG5cbi8qKiBFbmdsaXNoIGRpY3Rpb25hcnksIGNoZWNrZWQgY29tcGxldGUgYWdhaW5zdCB0aGUgemgga2V5IHNldC4gKi9cbmNvbnN0IGVuOiBSZWNvcmQ8a2V5b2YgdHlwZW9mIHpoLCBzdHJpbmc+ID0ge1xuICAnYWN0aW9uLmxhYmVsJzogJ0NoYW5nZXMnLFxuICAnYWN0aW9uLmFyaWEnOiAnUmV2aWV3IHdvcmtzcGFjZSBhbmQgcGVyLXJvdW5kIGNoYW5nZXMnLFxuICAndGFiLnNlc3Npb24nOiAnU2Vzc2lvbicsXG4gICd0YWIud29ya3NwYWNlJzogJ1dvcmtzcGFjZScsXG4gICdyZXZpZXcudGl0bGUnOiAnQ2hhbmdlcycsXG4gICdyZXZpZXcuYnJhbmNoJzogJ2JyYW5jaCcsXG4gICdyZXZpZXcuZGV0YWNoZWQnOiAnZGV0YWNoZWQgSEVBRCcsXG4gICdyZXZpZXcubm90UmVwbyc6ICdUaGlzIGRpcmVjdG9yeSBpcyBub3QgYSBnaXQgcmVwb3NpdG9yeScsXG4gICdyZXZpZXcubm90UmVwb0hpbnQnOiAnVGhlIFwiU2Vzc2lvblwiIHRhYiBzdGlsbCBzaG93cyBldmVyeSByb3VuZFxcJ3MgY2hhbmdlcy4nLFxuICAncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnOiAnTm8gZmlsZSBjaGFuZ2VzIHJlY29yZGVkIGluIHRoaXMgc2Vzc2lvbiB5ZXQnLFxuICAncmV2aWV3LnNlc3Npb25TY2FuJzogJ1NjYW5uZWQge3Jlc3VsdHN9IHRvb2wgcmVzdWx0czoge2RpZmZ9IHdpdGggZGlmZnMsIHtwYXRofSBwYXRoLW9ubHkgXHUyMDE0IHRlcm1pbmFsIChiYXNoKSBlZGl0cyBhcmUgbm90IHRyYWNrZWQgaW4gdGhlIHNlc3Npb24gbG9nLicsXG4gICdyZXZpZXcuZ29Xb3Jrc3BhY2UnOiAnVmlldyB3b3Jrc3BhY2UgY2hhbmdlcycsXG4gICdyZXZpZXcuc2Vzc2lvblN0YXRzJzogJ3tyb3VuZHN9IHJvdW5kcyBcdTAwQjcge2ZpbGVzfSBmaWxlcycsXG4gICdyZXZpZXcucm91bmQnOiAnUm91bmQge3JvdW5kfScsXG4gICdyZXZpZXcuZW1wdHknOiAnTm8gdW5jb21taXR0ZWQgY2hhbmdlcyBcdUQ4M0NcdURGODknLFxuICAncmV2aWV3LmxvYWRFcnJvcic6ICdGYWlsZWQgdG8gbG9hZCcsXG4gICdyZXZpZXcuYWNjZXB0JzogJ0FjY2VwdCcsXG4gICdyZXZpZXcucmV2ZXJ0JzogJ1JldmVydCcsXG4gICdyZXZpZXcuYWNjZXB0QWxsJzogJ0FjY2VwdCBhbGwnLFxuICAncmV2aWV3LnJldmVydEFsbCc6ICdSZXZlcnQgYWxsJyxcbiAgJ3Jldmlldy51bnN0YWdlJzogJ1Vuc3RhZ2UnLFxuICAncmV2aWV3LnVuc3RhZ2VBbGwnOiAnVW5zdGFnZSBhbGwnLFxuICAnaHVuay5zdGFnZSc6ICdTdGFnZScsXG4gICdodW5rLnJldmVydCc6ICdSZXZlcnQnLFxuICAnaHVuay51bnN0YWdlJzogJ1Vuc3RhZ2UnLFxuICAnaHVuay5zdGFnZWQnOiAnc3RhZ2VkJyxcbiAgJ2h1bmsudW5zdGFnZWQnOiAndW5zdGFnZWQnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnQnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQnLFxuICAncmV2aWV3LmNvbmZpcm1SZXZlcnRBbGwnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSByZXZlcnQgYWxsJyxcbiAgJ3Jldmlldy5jb21taXQnOiAnQ29tbWl0JyxcbiAgJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcic6ICdDb21taXQgbWVzc2FnZVx1MjAyNicsXG4gICdyZXZpZXcucHVzaCc6ICdQdXNoJyxcbiAgJ3Jldmlldy5jb25maXJtUHVzaCc6ICdDbGljayBhZ2FpbiB0byBjb25maXJtIHB1c2gnLFxuICAncmV2aWV3LmNvbW1pdHRlZCc6ICdDb21taXR0ZWQge3N1bW1hcnl9JyxcbiAgJ3Jldmlldy5jb21taXRGYWlsZWQnOiAnQ29tbWl0IGZhaWxlZCcsXG4gICdyZXZpZXcucHVzaGVkJzogJ1B1c2hlZCcsXG4gICdyZXZpZXcucHVzaEZhaWxlZCc6ICdQdXNoIGZhaWxlZCcsXG4gICdyZXZpZXcuYWhlYWQnOiAne259IGFoZWFkJyxcbiAgJ3Jldmlldy5iZWhpbmQnOiAne259IGJlaGluZCcsXG4gICdyZXZpZXcuc2VjdGlvblN0YWdlZCc6ICdTdGFnZWQnLFxuICAncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LnNlY3Rpb25CcmFuY2gnOiAnQnJhbmNoIHZzIHJlbW90ZScsXG4gICdyZXZpZXcubm9VcHN0cmVhbSc6ICdubyB1cHN0cmVhbScsXG4gICdyZXZpZXcuaGlzdG9yeSc6ICdIaXN0b3J5JyxcbiAgJ3Jldmlldy5jb21taXRGaWxlcyc6ICdGaWxlcycsXG4gICdoaXN0b3J5LmxvY2FsJzogJ2xvY2FsJyxcbiAgJ2hpc3RvcnkucmVtb3RlJzogJ3JlbW90ZScsXG4gICd0aW1lLm5vdyc6ICdqdXN0IG5vdycsXG4gICd0aW1lLm1pbnV0ZXMnOiAne259IG1pbiBhZ28nLFxuICAndGltZS5ob3Vycyc6ICd7bn0gaCBhZ28nLFxuICAndGltZS5kYXlzJzogJ3tufSBkIGFnbycsXG4gICdyZXZpZXcucmVmcmVzaCc6ICdSZWZyZXNoJyxcbiAgJ3Jldmlldy5jbG9zZSc6ICdDbG9zZScsXG4gICdyZXZpZXcuYnVzeSc6ICdXb3JraW5nXHUyMDI2JyxcbiAgJ3Jldmlldy5kb25lJzogJ3thY3Rpb259IHtjb3VudH0gZmlsZXMnLFxuICAncmV2aWV3LmRvbmVPbmUnOiAne2FjdGlvbn0ge3BhdGh9JyxcbiAgJ3Jldmlldy5kb25lRGVsZXRlZCc6ICd7YWN0aW9ufSB7Y291bnR9IGZpbGVzICh7ZGVsZXRlZH0gdW50cmFja2VkIGRlbGV0ZWQpJyxcbiAgJ3Jldmlldy5hY2NlcHRlZCc6ICdBY2NlcHRlZCcsXG4gICdyZXZpZXcucmV2ZXJ0ZWQnOiAnUmV2ZXJ0ZWQnLFxuICAncmV2aWV3LnVudHJhY2tlZCc6ICd1bnRyYWNrZWQnLFxuICAncmV2aWV3LmJpbmFyeSc6ICdiaW5hcnknLFxuICAncmV2aWV3Lm5vRGlmZkRhdGEnOiAnTm8gZGlmZiBkYXRhIGZvciB0aGlzIGNoYW5nZScsXG4gICdyZXZpZXcuY2hhbmdlcyc6ICd7YWRkZWR9KyB7ZGVsZXRlZH0tJyxcbiAgJ3ZpZXcuc2luZ2xlJzogJ1NpbmdsZScsXG4gICd2aWV3LnNwbGl0JzogJ1NwbGl0JyxcbiAgJ3ZpZXcuYmVmb3JlJzogJ0JlZm9yZScsXG4gICd2aWV3LmFmdGVyJzogJ0FmdGVyJyxcbiAgJ2NvbW1lbnQuYWRkJzogJ0NvbW1lbnQgb24gdGhpcyBsaW5lJyxcbiAgJ2NvbW1lbnQuc2hvdyc6ICdWaWV3IGNvbW1lbnRzJyxcbiAgJ2NvbW1lbnQucGxhY2Vob2xkZXInOiAnQ29tbWVudFx1MjAyNiAoQ3RybC9cdTIzMTgrRW50ZXIgdG8gc2F2ZSknLFxuICAnY29tbWVudC5zYXZlJzogJ1NhdmUnLFxuICAnY29tbWVudC5jYW5jZWwnOiAnQ2FuY2VsJyxcbiAgJ2NvbW1lbnQuZGVsZXRlJzogJ0RlbGV0ZScsXG4gICdjb21tZW50LmVkaXQnOiAnRWRpdCcsXG4gICdjb21tZW50LnNhdmVkJzogJ0NvbW1lbnQgc2F2ZWQnLFxuICAnY29tbWVudC5mYWlsZWQnOiAnRmFpbGVkIHRvIHNhdmUgY29tbWVudCcsXG4gICdzY29wZS5sYWJlbCc6ICdTY29wZScsXG4gICdzY29wZS5hbGwnOiAnQWxsJyxcbiAgJ3Njb3BlLnVuc3RhZ2VkJzogJ1Vuc3RhZ2VkJyxcbiAgJ3Njb3BlLnN0YWdlZCc6ICdTdGFnZWQnLFxuICAnc2NvcGUuY29tbWl0JzogJ0NvbW1pdCcsXG4gICdzY29wZS5icmFuY2gnOiAnQnJhbmNoJyxcbiAgJ3Njb3BlLmxhc3QtdHVybic6ICdMYXN0IHR1cm4nLFxuICAncmV2aWV3Lmxhc3RUdXJuRW1wdHknOiAnTm8gZmlsZSBjaGFuZ2VzIHJlY29yZGVkIGZvciB0aGUgbGFzdCB0dXJuIFx1MjAxNCB0ZXJtaW5hbCBjb21tYW5kcyAoYmFzaCkgdGhhdCBlZGl0IGZpbGVzIGFyZSBub3QgdHJhY2tlZCBpbiB0aGUgc2Vzc2lvbiBsb2c7IHN3aXRjaCB0byBcIkFsbFwiIHRvIHNlZSBnaXQgY2hhbmdlcycsXG4gICdzY29wZS5iYXNlJzogJ0Jhc2UgYnJhbmNoJyxcbiAgJ3Njb3BlLmJyYW5jaFJlYWRvbmx5JzogJ0JyYW5jaCBzY29wZSBpcyByZWFkLW9ubHkgKG1lcmdlLWJhc2UgZGlmZjsgbm8gYWNjZXB0L3JldmVydCknLFxuICAncmV2aWV3LnNlbGVjdENvbW1pdCc6ICdTZWxlY3QgYSBjb21taXQgZnJvbSB0aGUgbGVmdCB0byB2aWV3IGl0cyBkaWZmJyxcbiAgJ3Jldmlldy5zZW5kVG9BZ2VudCc6ICdTZW5kIHRvIGFnZW50JyxcbiAgJ3Jldmlldy5zZW5kVGl0bGUnOiAnU2VuZCBpbmxpbmUgY29tbWVudHMgdG8gdGhlIGFnZW50JyxcbiAgJ3Jldmlldy5zZW5kSGludCc6ICdDb21tZW50cyBhcmUgaW5qZWN0ZWQgaW50byB0aGUgY3VycmVudCBzZXNzaW9uIGFzIHJldmlldyBndWlkYW5jZSAoQWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzKS4gRmFsbHMgYmFjayB0byBjb3B5YWJsZSB0ZXh0IGlmIHNlbmRpbmcgZmFpbHMuJyxcbiAgJ3Jldmlldy5zZW50VG9BZ2VudCc6ICdTZW50IHRvIGFnZW50JyxcbiAgJ3Jldmlldy5jb3B5JzogJ0NvcHkgdGV4dCcsXG4gICdyZXZpZXcuY29waWVkJzogJ0NvcGllZCcsXG4gICdyZXZpZXcuY29weUZhaWxlZCc6ICdDb3B5IGZhaWxlZCcsXG4gICdyZXZpZXcucmV2aWV3JzogJ1JldmlldycsXG4gICdyZXZpZXcucmV2aWV3aW5nJzogJ1Jldmlld2luZ1x1MjAyNicsXG4gICdyZXZpZXcucmV2aWV3RmFpbGVkJzogJ1JldmlldyBmYWlsZWQnLFxuICAncmV2aWV3LnZlcmRpY3RDb3JyZWN0JzogJ1BhdGNoIGlzIGNvcnJlY3QgXHUyNzEzJyxcbiAgJ3Jldmlldy52ZXJkaWN0SW5jb3JyZWN0JzogJ1BhdGNoIG5lZWRzIHdvcmsgXHUyNzE3JyxcbiAgJ3Jldmlldy5ub0ZpbmRpbmdzJzogJ05vIGlzc3VlcyBmb3VuZCcsXG4gICdyZXZpZXcuZmluZGluZ3MnOiAne259IGZpbmRpbmdzJyxcbiAgJ3Jldmlldy5jb25maWRlbmNlJzogJ2NvbmZpZGVuY2Uge2NvbmZpZGVuY2V9JyxcbiAgJ3Jldmlldy5zdWdnZXN0aW9uJzogJ1N1Z2dlc3Rpb24nLFxuICAncmV2aWV3LnNlbmRGaW5kaW5ncyc6ICdTZW5kIGZpbmRpbmdzIHRvIGFnZW50JyxcbiAgJ3Jldmlldy5zZW50RmluZGluZ3MnOiAnRmluZGluZ3Mgc2VudCB0byBhZ2VudCcsXG4gICdyZXZpZXcucmV2aWV3U2NvcGUnOiAnUmV2aWV3IHNjb3BlJyxcbiAgJ3ByLnRpdGxlJzogJ1BSICN7bnVtYmVyfScsXG4gICdwci5jb21tZW50cyc6ICdQUiBjb21tZW50cyAoe259KScsXG4gICdwci5ub1ByJzogJ05vIGFzc29jaWF0ZWQgUFInLFxuICAncHIuc2VuZENvbW1lbnRzJzogJ1NlbmQgUFIgY29tbWVudHMgdG8gYWdlbnQnLFxuICAnZWRpdG9yLm9wZW5GaWxlJzogJ09wZW4gaW4gZWRpdG9yJyxcbiAgJ2VkaXRvci5vcGVuTGluZSc6ICdPcGVuIHRoaXMgbGluZSBpbiBlZGl0b3InLFxuICAnZWRpdG9yLmZhaWxlZCc6ICdGYWlsZWQgdG8gb3BlbicsXG4gICdyZXBvLmxhYmVsJzogJ1JlcG8nLFxuICAncmV2aWV3LmRvY2tDb21tZW50cyc6ICd7bn0gaW5saW5lIGNvbW1lbnRzJyxcbiAgJ3Jldmlldy5kb2NrVmVyZGljdCc6ICd2ZXJkaWN0IHBlbmRpbmcnLFxuICAncmV2aWV3LmRvY2tTZW5kJzogJ0NsaWNrIHRvIHNlbmQnLFxuICAncmV2aWV3LmNvcGllZEZhbGxiYWNrJzogJ1Nlc3Npb24gdW5hdmFpbGFibGUgXHUyMDE0IGNvbW1lbnRzIGNvcGllZCAocGFzdGUgdG8gc2VuZCknLFxuICAncmV2aWV3LnNlbmRGYWlsZWQnOiAnRmFpbGVkIHRvIHNlbmQgY29tbWVudHMnLFxuICAncmV2aWV3LmRvY2tKdW1wJzogJ09wZW4gdGhlIG1hdGNoaW5nIGNoYW5nZSBpbiB0aGUgcmV2aWV3IHBhbmVsJyxcbiAgJ3Jldmlldy5kb2NrTW9yZSc6ICd7bn0gbW9yZSBjb21tZW50cyBcdTIwMTQgb3BlbiB0aGUgcmV2aWV3IHBhbmVsJyxcbiAgJ3Jldmlldy5jYXJkVGl0bGUnOiAnSW5saW5lIHJldmlldycsXG4gICdyZXZpZXcuY2FyZENvbW1lbnRzJzogJ3tufSBjb21tZW50cycsXG4gICdyZXZpZXcuY2FyZFZlcmRpY3QnOiAnQUkgcmV2aWV3IHZlcmRpY3QnLFxuICAncmV2aWV3LmNhcmRKdW1wJzogJ0p1bXAgdG8gdGhlIG1hdGNoaW5nIGNvZGUgaW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuY2FyZE9wZW5GaWxlJzogJ09wZW4gdGhpcyBmaWxlIGluIHRoZSByZXZpZXcgcGFuZWwnLFxuICAncmV2aWV3LmNhcmRIaW50JzogJ0NsaWNrIGEgY29tbWVudCB0byBqdW1wIHRvIHRoZSBtYXRjaGluZyBjaGFuZ2UgYmxvY2snLFxuICAncmV2aWV3LnR1cm5TdW1tYXJ5VGl0bGUnOiAnRWRpdGVkIHtufSBmaWxlcycsXG4gICdyZXZpZXcudHVyblN1bW1hcnlSZXZpZXcnOiAnUmV2aWV3JyxcbiAgJ2ZpbGVzLnRpdGxlJzogJ0ZpbGVzJyxcbiAgJ2ZpbGVzLnNlYXJjaCc6ICdGaWx0ZXIgZmlsZXNcdTIwMjYnLFxuICAnZmlsZXMuc2F2ZSc6ICdTYXZlJyxcbiAgJ2ZpbGVzLnNhdmVkJzogJ1NhdmVkJyxcbiAgJ2ZpbGVzLmxvYWRpbmcnOiAnTG9hZGluZ1x1MjAyNicsXG4gICdmaWxlcy5lbXB0eSc6ICdObyBtYXRjaGluZyBmaWxlcycsXG4gIC8vIGZhbGxiYWNrLio6IGxhYmVscyBvZiB0aGUgYnVpbHQtaW4gaW1hZ2UgZmFsbGJhY2sgdmlld2VyIChGYWxsYmFja1VzZXJCdWJibGUpLFxuICAvLyB1c2VkIHdoZW4gYSBwbGFpbiB1c2VyIG1lc3NhZ2UgY2FycmllcyBpbWFnZXMuXG4gICdmYWxsYmFjay5pbWFnZSc6ICdJbWFnZScsXG4gICdmYWxsYmFjay5vcGVuJzogJ1ZpZXcgb3JpZ2luYWwnLFxuICAnZmFsbGJhY2sub3Blbk5hbWVkJzogJ1ZpZXcgb3JpZ2luYWwge25hbWV9JyxcbiAgJ2ZhbGxiYWNrLmxvYWRpbmcnOiAnTG9hZGluZ1x1MjAyNicsXG4gICdmYWxsYmFjay5sb2FkRmFpbGVkJzogJ0ZhaWxlZCB0byBsb2FkJyxcbiAgJ2ZhbGxiYWNrLmxpZ2h0Ym94RGlhbG9nJzogJ0ltYWdlIHByZXZpZXcnLFxuICAnZmFsbGJhY2subGlnaHRib3hDbG9zZSc6ICdDbG9zZScsXG4gICdzZXR0aW5ncy50aXRsZSc6ICdDaGFuZ2VzJyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnRm9udCcsXG4gICdzZXR0aW5ncy5zaXplJzogJ0ZvbnQgc2l6ZScsXG4gICdjb25maWcudGl0bGUnOiAnQ29uZmlndXJhdGlvbicsXG4gICdmb250Lm1vbm8nOiAnTW9ub3NwYWNlIChkZWZhdWx0KScsXG4gICdmb250LnN5c3RlbSc6ICdTeXN0ZW0gZm9udCcsXG59XG5cbnR5cGUgRGlmZlJldmlld0FjdGlvblByb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucyc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5cbnR5cGUgRGlmZlJldmlld092ZXJsYXlQcm9wcyA9IFByb3BzUnVudGltZTwnc2hlbGwub3ZlcmxheSc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7IHNlc3Npb25zOiBJU2Vzc2lvbnMgfVxudHlwZSBUdXJuU3VtbWFyeVByb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uY2hhdC50dXJuVGFpbCc+ICZcbiAgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7XG4gICAgbWF0Y2hlZDogeyB0dXJuOiB7IHR1cm46IG51bWJlcjsgc3RhcnQ/OiB7IHNlcTogbnVtYmVyIH07IGVuZD86IHsgc2VxOiBudW1iZXIgfSB9IH1cbiAgfVxuXG4vKiogRGlmZiBpY29uIChsdWNpZGUgZmlsZS1kaWZmKS4gKi9cbmZ1bmN0aW9uIEljb25EaWZmKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xNSAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWN1pcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDEwaDZcIiAvPlxuICAgICAgPHBhdGggZD1cIk0xMiA3djZcIiAvPlxuICAgICAgPHBhdGggZD1cIk05IDE3aDZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25YKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xOCA2IDYgMThcIiAvPlxuICAgICAgPHBhdGggZD1cIm02IDYgMTIgMTJcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25Db21tZW50KCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMSAxNWEyIDIgMCAwIDEtMiAySDdsLTQgNFY1YTIgMiAwIDAgMSAyLTJoMTRhMiAyIDAgMCAxIDIgMnpcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGV2cm9uRG93bigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJtNiA5IDYgNiA2LTZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIEljb25DaGVjaygpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMi41XCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0yMCA2IDkgMTdsLTUtNVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxudHlwZSBWaWV3TW9kZSA9ICdzaW5nbGUnIHwgJ3NwbGl0J1xuXG4vKiogXHU1MzU1XHU2ODBGIC8gXHU1M0NDXHU2ODBGIHNlZ21lbnRlZCB0b2dnbGUgKHBlcnNpc3RlZCBhY3Jvc3Mgb3BlbnMpLiAqL1xuZnVuY3Rpb24gRGlmZlZpZXdUb2dnbGUoeyB2aWV3LCBvbkNoYW5nZSwgdCB9OiB7IHZpZXc6IFZpZXdNb2RlOyBvbkNoYW5nZTogKHY6IFZpZXdNb2RlKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci12aWV3LXRvZ2dsZVwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9e3QoJ3ZpZXcuc2luZ2xlJyl9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPXtgZHNkci12aWV3LWJ0biR7dmlldyA9PT0gJ3NpbmdsZScgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NpbmdsZSd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKCdzaW5nbGUnKX1cbiAgICAgID5cbiAgICAgICAge3QoJ3ZpZXcuc2luZ2xlJyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRzZHItdmlldy1idG4ke3ZpZXcgPT09ICdzcGxpdCcgPyAnIGRzZHItdmlldy1idG4tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgIGFyaWEtcHJlc3NlZD17dmlldyA9PT0gJ3NwbGl0J31cbiAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2UoJ3NwbGl0Jyl9XG4gICAgICA+XG4gICAgICAgIHt0KCd2aWV3LnNwbGl0Jyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVHdvLWNvbHVtbiBzaWRlLWJ5LXNpZGUgZGlmZiBib2R5IChvbGQgbGVmdCwgbmV3IHJpZ2h0LCBsaW5lIG51bWJlcnMgYWxpZ25lZCkuICovXG5mdW5jdGlvbiBTcGxpdERpZmYoeyBibG9ja3MsIGJlZm9yZUxhYmVsLCBhZnRlckxhYmVsIH06IHsgYmxvY2tzOiBTcGxpdEJsb2NrW107IGJlZm9yZUxhYmVsOiBzdHJpbmc7IGFmdGVyTGFiZWw6IHN0cmluZyB9KSB7XG4gIGlmIChibG9ja3MubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPntiZWZvcmVMYWJlbH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuPnthZnRlckxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtibG9ja3MubWFwKChibG9jaywgYmkpID0+IChcbiAgICAgICAgICA8ZGl2IGtleT17Yml9PlxuICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IChcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e3JpfSBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5sZWZ0TnVtID8/ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ31gfT5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+e3Jvdy5yaWdodE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogUGVyLWh1bmsgYWN0aW9uIGJhciAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KSBmb3Igd29ya3NwYWNlIGRpZmZzLiAqL1xuZnVuY3Rpb24gSHVua1Rvb2xiYXIoe1xuICBodW5rLFxuICBidXN5LFxuICBvbkFjdGlvbixcbiAgdCxcbn06IHtcbiAgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuayB8IHVuZGVmaW5lZFxuICBidXN5OiBib29sZWFuXG4gIG9uQWN0aW9uOiAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICBpZiAoIWh1bmspIHJldHVybiBudWxsXG4gIGNvbnN0IHN0YWdlZCA9IGh1bmsubGF5ZXIgPT09ICdzdGFnZWQnXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWh1bmstYmFyXCI+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWh1bmstbGF5ZXJcIj57c3RhZ2VkID8gdCgnaHVuay5zdGFnZWQnKSA6IHQoJ2h1bmsudW5zdGFnZWQnKX08L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWh1bmstYWN0aW9uIGRzZHItaHVuay1hY3Rpb24tc3RhZ2VcIiB0aXRsZT17c3RhZ2VkID8gdCgnaHVuay51bnN0YWdlJykgOiB0KCdodW5rLnN0YWdlJyl9IGFyaWEtbGFiZWw9e3N0YWdlZCA/IHQoJ2h1bmsudW5zdGFnZScpIDogdCgnaHVuay5zdGFnZScpfSBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25BY3Rpb24oc3RhZ2VkID8gJ3Vuc3RhZ2UnIDogJ2FjY2VwdCcsIGh1bmspfT5cbiAgICAgICAge3N0YWdlZCA/ICdcdTIyMTInIDogJysnfVxuICAgICAgPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWh1bmstYWN0aW9uIGRzZHItaHVuay1hY3Rpb24tcmV2ZXJ0XCIgdGl0bGU9e3QoJ2h1bmsucmV2ZXJ0Jyl9IGFyaWEtbGFiZWw9e3QoJ2h1bmsucmV2ZXJ0Jyl9IGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkFjdGlvbigncmV2ZXJ0JywgaHVuayl9Plx1MjFCNjwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBIdW5rcyBvZiBgZGlmZmAgd2hvc2Ugb2xkIG9yIG5ldyBsaW5lIHJhbmdlIGNvdmVycyBhbnkgb2YgYGxpbmVzYC4gKi9cbmZ1bmN0aW9uIGh1bmtzRm9yTGluZXMoZGlmZjogc3RyaW5nLCBsaW5lczogKG51bWJlciB8IG51bGwpW10pOiBzdHJpbmcge1xuICBjb25zdCB0YXJnZXRzID0gbmV3IFNldChsaW5lcy5maWx0ZXIoKGwpOiBsIGlzIG51bWJlciA9PiBsICE9PSBudWxsKSlcbiAgaWYgKHRhcmdldHMuc2l6ZSA9PT0gMCkgcmV0dXJuICcnXG4gIGNvbnN0IGJsb2NrcyA9IHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciAoY29uc3QgYmxvY2sgb2YgYmxvY2tzKSB7XG4gICAgaWYgKGJsb2NrLmhlYWQ/LmtpbmQgIT09ICdodW5rJykgY29udGludWVcbiAgICBjb25zdCBzdGFydHMgPSBodW5rU3RhcnRzKGJsb2NrLmhlYWQudGV4dClcbiAgICBsZXQgb2xkTGluZSA9IHN0YXJ0cy5vbGRTdGFydFxuICAgIGxldCBuZXdMaW5lID0gc3RhcnRzLm5ld1N0YXJ0XG4gICAgbGV0IG9NaW4gPSBJbmZpbml0eVxuICAgIGxldCBvTWF4ID0gLUluZmluaXR5XG4gICAgbGV0IG5NaW4gPSBJbmZpbml0eVxuICAgIGxldCBuTWF4ID0gLUluZmluaXR5XG4gICAgZm9yIChjb25zdCByb3cgb2YgYmxvY2sucm93cykge1xuICAgICAgaWYgKHJvdy5raW5kID09PSAnY3R4Jykge1xuICAgICAgICBpZiAob2xkTGluZSA8IG9NaW4pIG9NaW4gPSBvbGRMaW5lXG4gICAgICAgIGlmIChvbGRMaW5lID4gb01heCkgb01heCA9IG9sZExpbmVcbiAgICAgICAgaWYgKG5ld0xpbmUgPCBuTWluKSBuTWluID0gbmV3TGluZVxuICAgICAgICBpZiAobmV3TGluZSA+IG5NYXgpIG5NYXggPSBuZXdMaW5lXG4gICAgICAgIG9sZExpbmUrK1xuICAgICAgICBuZXdMaW5lKytcbiAgICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdhZGQnKSB7XG4gICAgICAgIGlmIChuZXdMaW5lIDwgbk1pbikgbk1pbiA9IG5ld0xpbmVcbiAgICAgICAgaWYgKG5ld0xpbmUgPiBuTWF4KSBuTWF4ID0gbmV3TGluZVxuICAgICAgICBuZXdMaW5lKytcbiAgICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdkZWwnKSB7XG4gICAgICAgIGlmIChvbGRMaW5lIDwgb01pbikgb01pbiA9IG9sZExpbmVcbiAgICAgICAgaWYgKG9sZExpbmUgPiBvTWF4KSBvTWF4ID0gb2xkTGluZVxuICAgICAgICBvbGRMaW5lKytcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGl0ID0gWy4uLnRhcmdldHNdLnNvbWUoXG4gICAgICAobCkgPT4gKG9NaW4gPD0gbCAmJiBsIDw9IG9NYXgpIHx8IChuTWluIDw9IGwgJiYgbCA8PSBuTWF4KSxcbiAgICApXG4gICAgaWYgKGhpdCkgcGFydHMucHVzaChbYmxvY2suaGVhZC50ZXh0LCAuLi5ibG9jay5yb3dzLm1hcCgocikgPT4gci50ZXh0KV0uam9pbignXFxuJykpXG4gIH1cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJ1xcbicpXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgcm93cyB3aXRoIG9sZC9uZXcgbGluZSBudW1iZXJzIHRyYWNrZWQgdGhyb3VnaCBodW5rcy4gKi9cbmZ1bmN0aW9uIHVuaWZpZWRSb3dzV2l0aExpbmVzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IHsgcm93OiBEaWZmUm93OyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH1bXSB7XG4gIGxldCBvbGRMaW5lID0gb2xkU3RhcnRcbiAgbGV0IG5ld0xpbmUgPSBuZXdTdGFydFxuICByZXR1cm4gcm93cy5tYXAoKHJvdykgPT4ge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogb2xkTGluZSsrLCBuZXdMaW5lOiBuZXdMaW5lKysgfVxuICAgIGlmIChyb3cua2luZCA9PT0gJ2FkZCcpIHJldHVybiB7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbmV3TGluZSsrIH1cbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbnVsbCB9XG4gICAgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBudWxsLCBuZXdMaW5lOiBudWxsIH1cbiAgfSlcbn1cblxuLyoqIE1hdGNoIGEgY29tbWVudCBhZ2FpbnN0IGEgcm93J3MgYW5jaG9ycyAoYm90aCBtdXN0IGFncmVlIHdoZW4gc2V0KS4gKi9cbmZ1bmN0aW9uIGNvbW1lbnRNYXRjaGVzKGNvbW1lbnQ6IFJldmlld0NvbW1lbnQsIG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBib29sZWFuIHtcbiAgaWYgKGNvbW1lbnQubGluZU5ldyAhPT0gbnVsbCAmJiBjb21tZW50LmxpbmVOZXcgIT09IG5ld0xpbmUpIHJldHVybiBmYWxzZVxuICBpZiAoY29tbWVudC5saW5lT2xkICE9PSBudWxsICYmIGNvbW1lbnQubGluZU9sZCAhPT0gb2xkTGluZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB0cnVlXG59XG5cbi8qKiBIb3Zlci10by1jb21tZW50IGFmZm9yZGFuY2UgaW4gdGhlIGxpbmUtbnVtYmVyIGd1dHRlci4gTGluZXMgdGhhdCBhbHJlYWR5XG4gKiBoYXZlIGNvbW1lbnRzIHNob3cgYSBub24taW50ZXJhY3RpdmUgY291bnQgYmFkZ2UgKHRoZSBzYXZlZCBib3hlcyBiZWxvdyB0aGVcbiAqIGxpbmUgYXJlIHRoZSB2aWV3KTsgdGhlICsgb25seSBhcHBlYXJzIG9uIGNvbW1lbnQtZnJlZSBsaW5lcyB0byBhZGQgb25lLiAqL1xuZnVuY3Rpb24gQ29tbWVudExpbmUoeyBjb3VudCwgb25PcGVuLCB0IH06IHsgY291bnQ6IG51bWJlcjsgb25PcGVuOiAoKSA9PiB2b2lkOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBpZiAoY291bnQgPiAwKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hZGQgZHNkci1jb21tZW50LWhhc1wiIHRpdGxlPXt0KCdjb21tZW50LnNob3cnKX0gYXJpYS1sYWJlbD17dCgnY29tbWVudC5zaG93Jyl9PlxuICAgICAgICB7Y291bnR9XG4gICAgICA8L3NwYW4+XG4gICAgKVxuICB9XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFkZFwiIHRpdGxlPXt0KCdjb21tZW50LmFkZCcpfSBhcmlhLWxhYmVsPXt0KCdjb21tZW50LmFkZCcpfSBvbkNsaWNrPXtvbk9wZW59PlxuICAgICAgK1xuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbi8qKiBUaGUgaW5saW5lIGNvbW1lbnQgZWRpdG9yLCByZW5kZXJlZCBhcyBpdHMgb3duIHJvdy4gKi9cbmZ1bmN0aW9uIENvbW1lbnRFZGl0b3Ioe1xuICB0ZXh0LFxuICBvblRleHQsXG4gIG9uU2F2ZSxcbiAgb25DYW5jZWwsXG4gIGJ1c3ksXG4gIHQsXG59OiB7XG4gIHRleHQ6IHN0cmluZ1xuICBvblRleHQ6ICh2OiBzdHJpbmcpID0+IHZvaWRcbiAgb25TYXZlOiAoKSA9PiB2b2lkXG4gIG9uQ2FuY2VsOiAoKSA9PiB2b2lkXG4gIGJ1c3k6IGJvb2xlYW5cbiAgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nXG59KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtZWRpdG9yXCI+XG4gICAgICA8dGV4dGFyZWFcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWlucHV0XCJcbiAgICAgICAgdmFsdWU9e3RleHR9XG4gICAgICAgIGF1dG9Gb2N1c1xuICAgICAgICByb3dzPXsyfVxuICAgICAgICBwbGFjZWhvbGRlcj17dCgnY29tbWVudC5wbGFjZWhvbGRlcicpfVxuICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblRleHQoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgb25LZXlEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykgb25DYW5jZWwoKVxuICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicgJiYgKGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSkpIG9uU2F2ZSgpXG4gICAgICAgIH19XG4gICAgICAvPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIXRleHQudHJpbSgpfSBvbkNsaWNrPXtvblNhdmV9PlxuICAgICAgICAgIHt0KCdjb21tZW50LnNhdmUnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9e29uQ2FuY2VsfT5cbiAgICAgICAgICB7dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogQSBzYXZlZCBpbmxpbmUgY29tbWVudCwgcmVuZGVyZWQgZXhhY3RseSBsaWtlIHRoZSBjb21tZW50IGVkaXRvciBcdTIwMTQgdGhlIGJveFxuICogaXMgcmVhZC1vbmx5IHVudGlsIEVkaXQgaXMgcHJlc3NlZCwgdGhlbiBpdCBiZWNvbWVzIHRoZSBlZGl0YWJsZSBlZGl0b3IuICovXG5mdW5jdGlvbiBDb21tZW50Qm94KHsgY29tbWVudCwgYnVzeSwgb25VcGRhdGUsIG9uRGVsZXRlLCB0IH06IHsgY29tbWVudDogUmV2aWV3Q29tbWVudDsgYnVzeTogYm9vbGVhbjsgb25VcGRhdGU6IChpZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpID0+IFByb21pc2U8Ym9vbGVhbj47IG9uRGVsZXRlOiAoaWQ6IHN0cmluZykgPT4gdm9pZDsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFt0ZXh0LCBzZXRUZXh0XSA9IHVzZVN0YXRlKGNvbW1lbnQudGV4dClcbiAgaWYgKGVkaXRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPENvbW1lbnRFZGl0b3JcbiAgICAgICAgdGV4dD17dGV4dH1cbiAgICAgICAgb25UZXh0PXtzZXRUZXh0fVxuICAgICAgICBvblNhdmU9eygpID0+XG4gICAgICAgICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGF3YWl0IG9uVXBkYXRlKGNvbW1lbnQuaWQsIHRleHQudHJpbSgpKSkgc2V0RWRpdGluZyhmYWxzZSlcbiAgICAgICAgICB9KSgpXG4gICAgICAgIH1cbiAgICAgICAgb25DYW5jZWw9eygpID0+IHtcbiAgICAgICAgICBzZXRUZXh0KGNvbW1lbnQudGV4dClcbiAgICAgICAgICBzZXRFZGl0aW5nKGZhbHNlKVxuICAgICAgICB9fVxuICAgICAgICBidXN5PXtidXN5fVxuICAgICAgICB0PXt0fVxuICAgICAgLz5cbiAgICApXG4gIH1cbiAgLyoqIEp1bXAgdG8gdGhlIGNvbW1lbnQncyBjaGFuZ2UgYmxvY2sgaW4gdGhlIHJldmlldyBwYW5lbCAobGlrZSB0aGUgZG9jayBjaGlwcykuICovXG4gIGNvbnN0IGp1bXAgPSAoKSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5mb2N1cyA9IHtcbiAgICAgICAgcGF0aDogY29tbWVudC5wYXRoLFxuICAgICAgICBsaW5lOiBjb21tZW50LmxpbmVOZXcgPz8gY29tbWVudC5saW5lT2xkID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGFiOiBjb21tZW50LnNvdXJjZSA9PT0gJ3Nlc3Npb24nID8gJ3Nlc3Npb24nIDogJ3dvcmtzcGFjZScsXG4gICAgICB9XG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1lZGl0b3JcIj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItc2F2ZWQtY29tbWVudC1qdW1wXCJcbiAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5kb2NrSnVtcCcpfVxuICAgICAgICBvbkNsaWNrPXtqdW1wfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNhdmVkLWNvbW1lbnQtbG9jXCI+XG4gICAgICAgICAge2NvbW1lbnQucGF0aH1cbiAgICAgICAgICB7Y29tbWVudC5saW5lTmV3ICE9PSBudWxsID8gYDoke2NvbW1lbnQubGluZU5ld31gIDogY29tbWVudC5saW5lT2xkICE9PSBudWxsID8gYCAob2xkOiR7Y29tbWVudC5saW5lT2xkfSlgIDogJyd9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWlucHV0IGRzZHItc2F2ZWQtY29tbWVudC12aWV3XCI+e2NvbW1lbnQudGV4dH08L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFjdGlvbnNcIj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItYnRuXCJcbiAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0VGV4dChjb21tZW50LnRleHQpXG4gICAgICAgICAgICBzZXRFZGl0aW5nKHRydWUpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHt0KCdjb21tZW50LmVkaXQnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1kYW5nZXJcIlxuICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBvbkRlbGV0ZShjb21tZW50LmlkKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7dCgnY29tbWVudC5kZWxldGUnKX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogT25lIEFJLXJldmlldyBmaW5kaW5nIHJlbmRlcmVkIGFzIGFuIGlubGluZSBjYXJkIChDb2RleC1zdHlsZSkuICovXG5mdW5jdGlvbiBGaW5kaW5nQ2FyZCh7IGZpbmRpbmcsIHQgfTogeyBmaW5kaW5nOiBSZXZpZXdGaW5kaW5nOyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLWNhcmQgZHNkci1maW5kaW5nLSR7ZmluZGluZy5wcmlvcml0eX1gfT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtaGVhZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2ZpbmRpbmcucHJpb3JpdHl9YH0+e2ZpbmRpbmcucHJpb3JpdHl9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC10aXRsZVwiPntmaW5kaW5nLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtbG9jXCI+XG4gICAgICAgICAge2ZpbmRpbmcuZmlsZX06e2ZpbmRpbmcubGluZVN0YXJ0fXtmaW5kaW5nLmxpbmVFbmQgIT09IGZpbmRpbmcubGluZVN0YXJ0ID8gYC0ke2ZpbmRpbmcubGluZUVuZH1gIDogJyd9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAge2ZpbmRpbmcuZGV0YWlsID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1kZXRhaWxcIj57ZmluZGluZy5kZXRhaWx9PC9kaXY+IDogbnVsbH1cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtbWV0YVwiPlxuICAgICAgICB7dCgncmV2aWV3LmNvbmZpZGVuY2UnLCB7IGNvbmZpZGVuY2U6IGZpbmRpbmcuY29uZmlkZW5jZS50b0ZpeGVkKDIpIH0pfVxuICAgICAgPC9kaXY+XG4gICAgICB7ZmluZGluZy5zdWdnZXN0aW9uID8gPHByZSBjbGFzc05hbWU9XCJkc2RyLWZpbmRpbmctY2FyZC1zdWdnZXN0aW9uXCI+e2ZpbmRpbmcuc3VnZ2VzdGlvbn08L3ByZT4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBVbmlmaWVkIGRpZmYgd2l0aCBwZXItaHVuayBhY3Rpb24gYmFycyBhbmQgaW5saW5lIGNvbW1lbnRzICh3b3Jrc3BhY2UgZmlsZXMpLiAqL1xuZnVuY3Rpb24gVW5pZmllZERpZmYoe1xuICBkaWZmLFxuICBodW5rcyxcbiAgYnVzeSxcbiAgb25IdW5rQWN0aW9uLFxuICB0LFxuICBjb21tZW50cyxcbiAgY29tbWVudEVkaXRvcixcbiAgY29tbWVudFRleHQsXG4gIG9uQ29tbWVudFRleHQsXG4gIG9uT3BlbkNvbW1lbnQsXG4gIG9uU2F2ZUNvbW1lbnQsXG4gIG9uQ2FuY2VsQ29tbWVudCxcbiAgb25EZWxldGVDb21tZW50LFxuICBvblVwZGF0ZUNvbW1lbnQsXG4gIHJlYWRPbmx5LFxuICBwYXRoLFxuICByZXZpZXdGaW5kaW5ncyxcbiAgb25PcGVuTGluZSxcbiAganVtcExpbmUsXG59OiB7XG4gIGRpZmY6IHN0cmluZ1xuICBodW5rczogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVua1tdXG4gIGJ1c3k6IGJvb2xlYW5cbiAgb25IdW5rQWN0aW9uOiAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBpbXBvcnQoJy4uL3NoYXJlZC90eXBlcy50cycpLkRpZmZIdW5rKSA9PiB2b2lkXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xuICBjb21tZW50cz86IFJldmlld0NvbW1lbnRbXVxuICBjb21tZW50RWRpdG9yPzogeyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0gfCBudWxsXG4gIGNvbW1lbnRUZXh0Pzogc3RyaW5nXG4gIG9uQ29tbWVudFRleHQ/OiAodjogc3RyaW5nKSA9PiB2b2lkXG4gIG9uT3BlbkNvbW1lbnQ/OiAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCkgPT4gdm9pZFxuICBvblNhdmVDb21tZW50PzogKCkgPT4gdm9pZFxuICBvbkNhbmNlbENvbW1lbnQ/OiAoKSA9PiB2b2lkXG4gIG9uRGVsZXRlQ29tbWVudD86IChpZDogc3RyaW5nKSA9PiB2b2lkXG4gIG9uVXBkYXRlQ29tbWVudD86IChpZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpID0+IFByb21pc2U8Ym9vbGVhbj5cbiAgLyoqIEhpZGUgcGVyLWh1bmsgYWN0aW9uIGJhcnMgKGJyYW5jaCBzY29wZSBpcyBhIHJlYWQtb25seSBkaWZmKS4gKi9cbiAgcmVhZE9ubHk/OiBib29sZWFuXG4gIC8qKiBSZXBvLXJlbGF0aXZlIGZpbGUgcGF0aCAoZm9yIG9wZW4taW4tZWRpdG9yIGFuZCBtYXJrZXJzKS4gKi9cbiAgcGF0aD86IHN0cmluZ1xuICAvKiogQUktcmV2aWV3IGZpbmRpbmdzIHRvIG1hcmsgb24gbWF0Y2hpbmcgbGluZXMuICovXG4gIHJldmlld0ZpbmRpbmdzPzogUmV2aWV3RmluZGluZ1tdXG4gIC8qKiBPcGVuIHRoZSBmaWxlIGF0IGEgbGluZSBpbiB0aGUgdXNlcidzIGVkaXRvci4gKi9cbiAgb25PcGVuTGluZT86IChwYXRoOiBzdHJpbmcsIGxpbmU6IG51bWJlcikgPT4gdm9pZFxuICAvKiogVGVtcG9yYXJ5IGxpbmUgaGlnaGxpZ2h0IChlLmcuIGp1bXAgZnJvbSBhIFBSIGNvbW1lbnQpLiAqL1xuICBqdW1wTGluZT86IG51bWJlciB8IG51bGxcbn0pIHtcbiAgY29uc3QgYmxvY2tzID0gcGFyc2VHaXRCbG9ja3MoZGlmZilcbiAgbGV0IGh1bmtJbmRleCA9IDBcbiAgY29uc3QgZWRpdGluZ0tleSA9IGNvbW1lbnRFZGl0b3IgPyBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA6IG51bGxcbiAgY29uc3QgZmluZGluZ3NGb3IgPSAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCk6IFJldmlld0ZpbmRpbmdbXSA9PiB7XG4gICAgaWYgKCFwYXRoIHx8ICFyZXZpZXdGaW5kaW5ncyB8fCByZXZpZXdGaW5kaW5ncy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuICAgIHJldHVybiByZXZpZXdGaW5kaW5ncy5maWx0ZXIoKGYpID0+IHtcbiAgICAgIGlmIChmLmZpbGUgIT09IHBhdGgpIHJldHVybiBmYWxzZVxuICAgICAgaWYgKG5ld0xpbmUgIT09IG51bGwpIHJldHVybiBuZXdMaW5lID49IGYubGluZVN0YXJ0ICYmIG5ld0xpbmUgPD0gZi5saW5lRW5kXG4gICAgICByZXR1cm4gb2xkTGluZSAhPT0gbnVsbCAmJiBvbGRMaW5lID49IGYubGluZVN0YXJ0ICYmIG9sZExpbmUgPD0gZi5saW5lRW5kXG4gICAgfSlcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICB7YmxvY2tzLm1hcCgoYmxvY2ssIGJpKSA9PiB7XG4gICAgICAgICAgY29uc3QgaXNIdW5rID0gYmxvY2suaGVhZD8ua2luZCA9PT0gJ2h1bmsnXG4gICAgICAgICAgY29uc3QgaHVuayA9IGlzSHVuayA/IGh1bmtzW2h1bmtJbmRleCsrXSA6IHVuZGVmaW5lZFxuICAgICAgICAgIGNvbnN0IHN0YXJ0cyA9IGJsb2NrLmhlYWQ/LmtpbmQgPT09ICdodW5rJyA/IGh1bmtTdGFydHMoYmxvY2suaGVhZC50ZXh0KSA6IHsgb2xkU3RhcnQ6IDEsIG5ld1N0YXJ0OiAxIH1cbiAgICAgICAgICBjb25zdCByb3dzID0gaXNIdW5rID8gdW5pZmllZFJvd3NXaXRoTGluZXMoYmxvY2sucm93cywgc3RhcnRzLm9sZFN0YXJ0LCBzdGFydHMubmV3U3RhcnQpIDogW11cbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEZyYWdtZW50IGtleT17Yml9PlxuICAgICAgICAgICAgICB7aXNIdW5rICYmICFyZWFkT25seSA/IDxIdW5rVG9vbGJhciBodW5rPXtodW5rfSBidXN5PXtidXN5fSBvbkFjdGlvbj17b25IdW5rQWN0aW9ufSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7YmxvY2suaGVhZC5raW5kfWB9PntibG9jay5oZWFkLnRleHQgfHwgJyAnfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgIHtpc0h1bmtcbiAgICAgICAgICAgICAgICA/IHJvd3MubWFwKCh7IHJvdywgb2xkTGluZSwgbmV3TGluZSB9LCByaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtvbGRMaW5lID8/ICdvJ306JHtuZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0NvbW1lbnRzID0gY29tbWVudHM/LmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgb2xkTGluZSwgbmV3TGluZSkpID8/IFtdXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdzID0gZmluZGluZ3NGb3Iob2xkTGluZSwgbmV3TGluZSlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWRpdGluZyA9IGVkaXRpbmdLZXkgPT09IGtleVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG93QWN0aW9ucyA9IHJvdy5raW5kID09PSAnY3R4JyB8fCByb3cua2luZCA9PT0gJ2FkZCcgfHwgcm93LmtpbmQgPT09ICdkZWwnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbmRpbmdDbHMgPSBmaW5kaW5ncy5sZW5ndGggPiAwID8gYCBkc2RyLWxpbmUtZmluZGluZyBkc2RyLWZpbmRpbmctJHtmaW5kaW5nc1swXS5wcmlvcml0eX1gIDogJydcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganVtcGVkID0ganVtcExpbmUgIT0gbnVsbCAmJiAobmV3TGluZSA9PT0ganVtcExpbmUgfHwgKG5ld0xpbmUgPT09IG51bGwgJiYgb2xkTGluZSA9PT0ganVtcExpbmUpKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e3JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfSR7cm93Q29tbWVudHMubGVuZ3RoID4gMCA/ICcgZHNkci1saW5lLWNvbW1lbnRlZCcgOiAnJ30ke2ZpbmRpbmdDbHN9JHtqdW1wZWQgPyAnIGRzZHItbGluZS1qdW1wJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtuZXdMaW5lID8/IG9sZExpbmUgPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxpbmUtbnVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge25ld0xpbmUgPz8gb2xkTGluZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmUgY291bnQ9e3Jvd0NvbW1lbnRzLmxlbmd0aH0gb25PcGVuPXsoKSA9PiBvbk9wZW5Db21tZW50Py4ob2xkTGluZSwgbmV3TGluZSl9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLXRleHRcIj57cm93LnRleHQgfHwgJyAnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3MubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLXRhZyBkc2RyLWZpbmRpbmctJHtmaW5kaW5nc1swXS5wcmlvcml0eX1gfSB0aXRsZT17ZmluZGluZ3NbMF0udGl0bGV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmaW5kaW5nc1swXS5wcmlvcml0eX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3MubGVuZ3RoID4gMSA/IGBcdTAwRDcke2ZpbmRpbmdzLmxlbmd0aH1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3BhdGggJiYgb25PcGVuTGluZSAmJiAobmV3TGluZSA/PyBvbGRMaW5lKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItb3BlbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbk9wZW5MaW5lKHBhdGgsIG5ld0xpbmUgPz8gb2xkTGluZSA/PyAxKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MjE5N1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zICYmIHJvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvd0NvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e29uVXBkYXRlQ29tbWVudCA/PyAoYXN5bmMgKCkgPT4gZmFsc2UpfSBvbkRlbGV0ZT17b25EZWxldGVDb21tZW50ID8/ICgoKSA9PiB7fSl9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlZGl0aW5nID8gPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHQgPz8gJyd9IG9uVGV4dD17b25Db21tZW50VGV4dCA/PyAoKCkgPT4ge30pfSBvblNhdmU9e29uU2F2ZUNvbW1lbnQgPz8gKCgpID0+IHt9KX0gb25DYW5jZWw9e29uQ2FuY2VsQ29tbWVudCA/PyAoKCkgPT4ge30pfSBidXN5PXtidXN5fSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICB7KHJldmlld0ZpbmRpbmdzID8/IFtdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChmKSA9PiBmLmZpbGUgPT09IHBhdGggJiYgZi5saW5lU3RhcnQgPT09IChuZXdMaW5lID8/IG9sZExpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChmLCBmaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaW5kaW5nQ2FyZCBrZXk9e2Ake2YuZmlsZX06JHtmLmxpbmVTdGFydH06JHtmaX1gfSBmaW5kaW5nPXtmfSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDogYmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JpfSBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9YH0+e3Jvdy50ZXh0IHx8ICcgJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgPC9wcmU+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFN0YXR1cyBjaGlwIGNvbG9yIGNsYXNzIGZvciBhIHdvcmtzcGFjZSBjaGFuZ2UuICovXG4vKiogRHJhZyBoYW5kbGUgZm9yIHJlc2l6aW5nIHRoZSBwYW5lbCAoZWFzdCAvIHNvdXRoIC8gc291dGgtZWFzdCkuICovXG5mdW5jdGlvbiBSZXNpemVIYW5kbGUoeyBtb2RlLCBvblJlc2l6ZSB9OiB7IG1vZGU6ICdlJyB8ICdzJyB8ICdzZSc7IG9uUmVzaXplOiAoZHg6IG51bWJlciwgZHk6IG51bWJlcikgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IGxhc3QgPSB1c2VSZWY8eyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbD4obnVsbClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLXJlc2l6ZSBkc2RyLXJlc2l6ZS0ke21vZGV9YH1cbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH1cbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmICghbGFzdC5jdXJyZW50KSByZXR1cm5cbiAgICAgICAgY29uc3QgZHggPSBldmVudC5jbGllbnRYIC0gbGFzdC5jdXJyZW50LnhcbiAgICAgICAgY29uc3QgZHkgPSBldmVudC5jbGllbnRZIC0gbGFzdC5jdXJyZW50LnlcbiAgICAgICAgbGFzdC5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZIH1cbiAgICAgICAgaWYgKGR4ICE9PSAwIHx8IGR5ICE9PSAwKSBvblJlc2l6ZShkeCwgZHkpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyVXA9eyhldmVudCkgPT4ge1xuICAgICAgICBsYXN0LmN1cnJlbnQgPSBudWxsXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJDYW5jZWw9eygpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0gbnVsbFxuICAgICAgfX1cbiAgICAvPlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuZnVuY3Rpb24gY2hpcENsYXNzKHN0YXR1czogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcyA9IHN0YXR1cy5yZXBsYWNlKC9cXHMvZywgJycpXG4gIGlmIChzLmluY2x1ZGVzKCc/PycpKSByZXR1cm4gJ2RzZHItY2hpcC11J1xuICBpZiAocy5zdGFydHNXaXRoKCdBJykgfHwgcy5pbmNsdWRlcygnQScpKSByZXR1cm4gJ2RzZHItY2hpcC1hJ1xuICBpZiAocy5zdGFydHNXaXRoKCdEJykgfHwgcy5pbmNsdWRlcygnRCcpKSByZXR1cm4gJ2RzZHItY2hpcC1kJ1xuICBpZiAocy5zdGFydHNXaXRoKCdSJykgfHwgcy5pbmNsdWRlcygnUicpKSByZXR1cm4gJ2RzZHItY2hpcC1yJ1xuICByZXR1cm4gJ2RzZHItY2hpcC1tJ1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkU3RhdHVzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxTdGF0dXNSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtTVEFUVVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGBzdGF0dXMgcmVxdWVzdCBmYWlsZWQ6ICR7cmVzLnN0YXR1c31gKVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkpIGFzIFN0YXR1c1Jlc3BvbnNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5Q2hhbmdlcyhjd2Q6IHN0cmluZywgYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoPzogc3RyaW5nKTogUHJvbWlzZTxBcHBseVJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEFQUExZX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBhY3Rpb24sIHBhdGggfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBBcHBseVJlc3BvbnNlXG59XG5cbi8qKiBBcHBseSBvbmUgaHVuayBvZiBvbmUgZmlsZSAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5SHVuayhjd2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIGh1bms6IHN0cmluZyk6IFByb21pc2U8QXBwbHlIdW5rUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQVBQTFlfSFVOS19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgcGF0aCwgYWN0aW9uLCBodW5rIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQXBwbHlIdW5rUmVzcG9uc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuR2l0QWN0aW9uKGN3ZDogc3RyaW5nLCBhY3Rpb246ICdjb21taXQnIHwgJ3B1c2gnLCBtZXNzYWdlPzogc3RyaW5nKTogUHJvbWlzZTxHaXRSZXNwb25zZT4ge1xuICBjb25zdCB1cmwgPSBhY3Rpb24gPT09ICdjb21taXQnID8gQ09NTUlUX1VSTCA6IFBVU0hfVVJMXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGFjdGlvbiA9PT0gJ2NvbW1pdCcgPyB7IGN3ZCwgbWVzc2FnZSB9IDogeyBjd2QgfSksXG4gIH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBHaXRSZXNwb25zZVxufVxuXG4vKiogTG9jYWwgKHVucHVzaGVkKSBjb21taXRzIGFoZWFkIG9mIHRoZSB1cHN0cmVhbS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRIaXN0b3J5KGN3ZDogc3RyaW5nKTogUHJvbWlzZTxIaXN0b3J5UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7SElTVE9SWV9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1pdHM6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgSGlzdG9yeVJlc3BvbnNlXG59XG5cbi8qKiBPbmUgY29tbWl0J3MgdW5pZmllZCBkaWZmLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZENvbW1pdERpZmYoY3dkOiBzdHJpbmcsIGhhc2g6IHN0cmluZyk6IFByb21pc2U8Q29tbWl0RGlmZlJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0NPTU1JVF9ESUZGX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9Jmhhc2g9JHtlbmNvZGVVUklDb21wb25lbnQoaGFzaCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZGlmZjogJycsIGZpbGVzOiBbXSwgYWRkZWQ6IDAsIGRlbGV0ZWQ6IDAsIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBDb21taXREaWZmUmVzcG9uc2Vcbn1cblxuLyoqIElubGluZSByZXZpZXcgY29tbWVudHMgZm9yIHRoZSB3b3Jrc3BhY2UgKHJlcG8tc2NvcGVkKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRDb21tZW50cyhjd2Q6IHN0cmluZyk6IFByb21pc2U8UmV2aWV3Q29tbWVudFtdPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0NPTU1FTlRTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgY29tbWVudHM6IFtdIH0pKSkgYXMgQ29tbWVudHNSZXNwb25zZVxuICByZXR1cm4gZGF0YS5vayA/IGRhdGEuY29tbWVudHMgOiBbXVxufVxuXG4vKiogUmVwbGFjZSB0aGUgd2hvbGUgY29tbWVudCBsaXN0IChzaW5nbGUtdXNlciByZXBsYWNlIHNlbWFudGljcykuICovXG5hc3luYyBmdW5jdGlvbiBzYXZlQ29tbWVudHMoY3dkOiBzdHJpbmcsIGNvbW1lbnRzOiBSZXZpZXdDb21tZW50W10pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQ09NTUVOVFNfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIGNvbW1lbnRzIH0pLFxuICB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlIH0pKSkgYXMgQ29tbWVudHNSZXNwb25zZVxuICByZXR1cm4gZGF0YS5vayA9PT0gdHJ1ZVxufVxuXG4vKiogTG9jYWwgYnJhbmNoIG5hbWVzIChmb3IgdGhlIEJyYW5jaCByZXZpZXcgc2NvcGUpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZEJyYW5jaGVzKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtCUkFOQ0hFU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGJyYW5jaGVzOiBbXSB9KSkpIGFzIHsgb2s6IGJvb2xlYW47IGJyYW5jaGVzOiBzdHJpbmdbXSB9XG4gIHJldHVybiBkYXRhLm9rID8gZGF0YS5icmFuY2hlcyA6IFtdXG59XG5cbi8qKiBSdW4gYW4gQUkgcmV2aWV3IG92ZXIgdGhlIGdpdmVuIHNjb3BlLiAqL1xuYXN5bmMgZnVuY3Rpb24gcnVuUmV2aWV3KGN3ZDogc3RyaW5nLCBzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGwsIHNjb3BlOiAndW5jb21taXR0ZWQnIHwgJ2JyYW5jaCcgfCAnY29tbWl0JywgYmFzZT86IHN0cmluZywgY29tbWl0SGFzaD86IHN0cmluZyk6IFByb21pc2U8UmV2aWV3UmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goUkVWSUVXX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBzZXNzaW9uSWQ6IHNlc3Npb25JZCA/PyB1bmRlZmluZWQsIHNjb3BlLCBiYXNlLCBjb21taXRIYXNoIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBmaW5kaW5nczogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBSZXZpZXdSZXNwb25zZVxufVxuXG4vKiogQ3VycmVudCBicmFuY2gncyBHaXRIdWIgUFIgY29udGV4dCAoZGVncmFkZXMgZ3JhY2VmdWxseSB3aXRob3V0IGdoKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRQcihjd2Q6IHN0cmluZyk6IFByb21pc2U8UHJSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtQUl9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1lbnRzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIFByUmVzcG9uc2Vcbn1cblxuLyoqIEdpdCByZXBvcyB1bmRlciBhIHdvcmtzcGFjZSAobXVsdGktcmVwbyBzZWxlY3RvcikuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkUmVwb3MoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFJlcG9zUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7UkVQT1NfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCByZXBvczogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBSZXBvc1Jlc3BvbnNlXG59XG5cbi8qKiBPcGVuIGEgZmlsZSAob3B0aW9uYWxseSBhdCBhIGxpbmUpIGluIHRoZSB1c2VyJ3MgZWRpdG9yIHZpYSBvcGVuLWVkaXRvci4gKi9cbmFzeW5jIGZ1bmN0aW9uIG9wZW5JbkVkaXRvcihjd2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBsaW5lPzogbnVtYmVyKTogUHJvbWlzZTx7IG9rOiBib29sZWFuOyBlcnJvcj86IHN0cmluZyB9PiB7XG4gIGNvbnN0IGFicyA9IHBhdGguc3RhcnRzV2l0aCgnLycpIHx8IC9eW0EtWmEtel06W1xcXFwvXS8udGVzdChwYXRoKSA/IHBhdGggOiBgJHtjd2R9LyR7cGF0aH1gXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKE9QRU5fRURJVE9SX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgcGF0aDogYWJzLCBsaW5lIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgeyBvazogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfVxufVxuXG4vKiogU2hvcnQgcmVsYXRpdmUgdGltZSBmb3IgY29tbWl0IHJvd3MgKFwianVzdCBub3dcIiAvIFwiMyBtaW4gYWdvXCIgLyBcdTIwMjYpLiAqL1xuZnVuY3Rpb24gcmVsYXRpdmVUaW1lKGlzbzogc3RyaW5nLCB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcigoRGF0ZS5ub3coKSAtIG5ldyBEYXRlKGlzbykuZ2V0VGltZSgpKSAvIDYwMDAwKVxuICBpZiAobWludXRlcyA8IDEpIHJldHVybiB0KCd0aW1lLm5vdycpXG4gIGlmIChtaW51dGVzIDwgNjApIHJldHVybiB0KCd0aW1lLm1pbnV0ZXMnLCB7IG46IG1pbnV0ZXMgfSlcbiAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKG1pbnV0ZXMgLyA2MClcbiAgaWYgKGhvdXJzIDwgMjQpIHJldHVybiB0KCd0aW1lLmhvdXJzJywgeyBuOiBob3VycyB9KVxuICByZXR1cm4gdCgndGltZS5kYXlzJywgeyBuOiBNYXRoLmZsb29yKGhvdXJzIC8gMjQpIH0pXG59XG5cbi8qKiBUaGVtZS1hd2FyZSBkcm9wZG93biByZXBsYWNpbmcgbmF0aXZlIDxzZWxlY3Q+IChuYXRpdmUgcG9wdXBzIGlnbm9yZSB0aGUgdGhlbWUpLiAqL1xuZnVuY3Rpb24gVGhlbWVTZWxlY3Qoe1xuICB2YWx1ZSxcbiAgb3B0aW9ucyxcbiAgb25DaGFuZ2UsXG4gIGFyaWFMYWJlbCxcbn06IHtcbiAgdmFsdWU6IHN0cmluZ1xuICBvcHRpb25zOiB7IHZhbHVlOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfVtdXG4gIG9uQ2hhbmdlOiAodmFsdWU6IHN0cmluZykgPT4gdm9pZFxuICBhcmlhTGFiZWw/OiBzdHJpbmdcbn0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHJvb3RSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IGN1cnJlbnQgPSBvcHRpb25zLmZpbmQoKG8pID0+IG8udmFsdWUgPT09IHZhbHVlKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm5cbiAgICBjb25zdCBjbG9zZU91dHNpZGUgPSAoZXZlbnQ6IFBvaW50ZXJFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIE5vZGUgJiYgIXJvb3RSZWYuY3VycmVudD8uY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgc2V0T3BlbihmYWxzZSlcbiAgICB9XG4gICAgY29uc3QgY2xvc2VPbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgY2xvc2VPdXRzaWRlKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjbG9zZU9uS2V5KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGNsb3NlT3V0c2lkZSlcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBjbG9zZU9uS2V5KVxuICAgIH1cbiAgfSwgW29wZW5dKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbFwiIHJlZj17cm9vdFJlZn0+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXNlbC10cmlnZ2VyXCJcbiAgICAgICAgYXJpYS1oYXNwb3B1cD1cImxpc3Rib3hcIlxuICAgICAgICBhcmlhLWV4cGFuZGVkPXtvcGVufVxuICAgICAgICBhcmlhLWxhYmVsPXthcmlhTGFiZWx9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oKHYpID0+ICF2KX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtdmFsdWVcIj57Y3VycmVudD8ubGFiZWwgPz8gdmFsdWV9PC9zcGFuPlxuICAgICAgICA8SWNvbkNoZXZyb25Eb3duIC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwiZHNkci1zZWwtbWVudVwiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17YXJpYUxhYmVsfT5cbiAgICAgICAgICB7b3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gKFxuICAgICAgICAgICAgPGxpIGtleT17b3B0aW9uLnZhbHVlfSByb2xlPVwibm9uZVwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17b3B0aW9uLnZhbHVlID09PSB2YWx1ZX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNlbC1vcHRpb24ke29wdGlvbi52YWx1ZSA9PT0gdmFsdWUgPyAnIGRzZHItc2VsLW9wdGlvbi1hY3RpdmUnIDogJyd9YH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZShvcHRpb24udmFsdWUpXG4gICAgICAgICAgICAgICAgICBzZXRPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC1vcHRpb24tbWFya1wiPntvcHRpb24udmFsdWUgPT09IHZhbHVlID8gPEljb25DaGVjayAvPiA6IG51bGx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLW9wdGlvbi1sYWJlbFwiPntvcHRpb24ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogRGlmZiBmb250ICsgZm9udCBzaXplIGNvbnRyb2xzIChzaGFyZWQgcHJlZnMgc3RvcmUpLiAqL1xuZnVuY3Rpb24gRGlmZlJldmlld1ByZWZzKHsgdCB9OiB7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IHByZWZzID0gdXNlU3luY0V4dGVybmFsU3RvcmUocHJlZnNTdG9yZS5zdWJzY3JpYmUsIHByZWZzU3RvcmUuZ2V0U25hcHNob3QpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jZmctZmllbGRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbGFiZWxcIiBpZD1cImRzZHItcHJlZi1mb250LWxhYmVsXCI+e3QoJ3NldHRpbmdzLmZvbnQnKX08L3NwYW4+XG4gICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2V0dGluZ3MuZm9udCcpfVxuICAgICAgICAgIHZhbHVlPXtwcmVmcy5mb250fVxuICAgICAgICAgIG9wdGlvbnM9e0ZPTlRfT1BUSU9OUy5tYXAoKGYpID0+ICh7IHZhbHVlOiBmLmlkLCBsYWJlbDogZi5sYWJlbC5zdGFydHNXaXRoKCdmb250LicpID8gdChmLmxhYmVsIGFzIGtleW9mIHR5cGVvZiB6aCkgOiBmLmxhYmVsIH0pKX1cbiAgICAgICAgICBvbkNoYW5nZT17KGZvbnQpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLmZvbnQgPSBmb250XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNmZy1maWVsZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1sYWJlbFwiIGlkPVwiZHNkci1wcmVmLXNpemUtbGFiZWxcIj57dCgnc2V0dGluZ3Muc2l6ZScpfTwvc3Bhbj5cbiAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgYXJpYUxhYmVsPXt0KCdzZXR0aW5ncy5zaXplJyl9XG4gICAgICAgICAgdmFsdWU9e1N0cmluZyhwcmVmcy5zaXplKX1cbiAgICAgICAgICBvcHRpb25zPXtTSVpFX09QVElPTlMubWFwKChzKSA9PiAoeyB2YWx1ZTogU3RyaW5nKHMpLCBsYWJlbDogYCR7c31weGAgfSkpfVxuICAgICAgICAgIG9uQ2hhbmdlPXsoc2l6ZSkgPT5cbiAgICAgICAgICAgIHByZWZzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgICAgIGQuc2l6ZSA9IE51bWJlcihzaXplKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEhlYWRlciBhY3Rpb24gKHNlc3Npb24gc2NvcGUpOiBiYWRnZSArIG9wZW4uXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFJlcGx5LWxvY2FsIGNoYW5nZSBzdW1tYXJ5IG1vdW50ZWQgYmVuZWF0aCBhIGNvbXBsZXRlZCBhZ2VudCB0dXJuLiAqL1xuZnVuY3Rpb24gVHVybkNoYW5nZVN1bW1hcnkoeyBtYXRjaGVkLCBzZXNzaW9uSWQsIHVzZVNlc3Npb24sIHVzZVNlc3Npb25zLCB0IH06IFR1cm5TdW1tYXJ5UHJvcHMpIHtcbiAgY29uc3Qgbm9kZXMgPSB1c2VTZXNzaW9uKChzbmFwc2hvdCkgPT4gc25hcHNob3Qubm9kZXMpXG4gIGNvbnN0IGN3ZCA9IHVzZVNlc3Npb25zKChzZXNzaW9uczogU2Vzc2lvbkxpc3RTdGF0ZSkgPT4gc2Vzc2lvbnMuYnlJZFtzZXNzaW9uSWRdPy5jd2QpXG4gIGNvbnN0IHR1cm4gPSBtYXRjaGVkLnR1cm5cbiAgY29uc3QgZmlsZXMgPSB1c2VNZW1vKCgpID0+IGNvbGxlY3RUdXJuQ2hhbmdlcyhub2RlcywgdHVybi5zdGFydD8uc2VxID8/IC1JbmZpbml0eSwgdHVybi5lbmQ/LnNlcSA/PyBJbmZpbml0eSksIFtub2RlcywgdHVybl0pXG4gIGNvbnN0IGFkZGVkID0gdXNlTWVtbygoKSA9PiBmaWxlcy5yZWR1Y2UoKHRvdGFsLCBmaWxlKSA9PiB0b3RhbCArIGZpbGUuYWRkZWQsIDApLCBbZmlsZXNdKVxuICBjb25zdCBkZWxldGVkID0gdXNlTWVtbygoKSA9PiBmaWxlcy5yZWR1Y2UoKHRvdGFsLCBmaWxlKSA9PiB0b3RhbCArIGZpbGUuZGVsZXRlZCwgMCksIFtmaWxlc10pXG5cbiAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGxcblxuICBjb25zdCByZXZpZXcgPSAoKSA9PiB7XG4gICAgaWYgKCFjd2QpIHJldHVyblxuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKHN0YXRlKSA9PiB7XG4gICAgICBzdGF0ZS5vcGVuID0gdHJ1ZVxuICAgICAgc3RhdGUuY3dkID0gY3dkXG4gICAgICBzdGF0ZS5mb2N1cyA9IHsgcGF0aDogZmlsZXNbMF0ucGF0aCwgcm91bmQ6IHR1cm4udHVybiwgdGFiOiAnc2Vzc2lvbicgfVxuICAgICAgc3RhdGUua2V5ID0gc3RhdGUua2V5ICsgMVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnlcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktaGVhZFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1pY29uXCI+PEljb25EaWZmIC8+PC9zcGFuPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktdGl0bGVcIj57dCgncmV2aWV3LnR1cm5TdW1tYXJ5VGl0bGUnLCB7IG46IGZpbGVzLmxlbmd0aCB9KX08L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LXN0YXRzXCI+PHNwYW4gY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktYWRkXCI+K3thZGRlZH08L3NwYW4+PHNwYW4gY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktZGVsXCI+LXtkZWxldGVkfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBvbkNsaWNrPXtyZXZpZXd9Pnt0KCdyZXZpZXcudHVyblN1bW1hcnlSZXZpZXcnKX08L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1maWxlc1wiPlxuICAgICAgICB7ZmlsZXMubWFwKChmaWxlKSA9PiAoXG4gICAgICAgICAgPGJ1dHRvbiBrZXk9e2ZpbGUucGF0aH0gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWZpbGVcIiBvbkNsaWNrPXtyZXZpZXd9IHRpdGxlPXtmaWxlLnBhdGh9PlxuICAgICAgICAgICAgPHNwYW4+e2ZpbGUucGF0aH08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1maWxlLXN0YXRzXCI+PHNwYW4gY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktYWRkXCI+K3tmaWxlLmFkZGVkfTwvc3Bhbj48c3BhbiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1kZWxcIj4te2ZpbGUuZGVsZXRlZH08L3NwYW4+PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIGhpZ2hsaWdodENvZGUodmFsdWU6IHN0cmluZyk6IFJlYWN0Tm9kZVtdIHtcbiAgY29uc3QgdG9rZW4gPSAvKFxcL1xcL1teXFxuXSp8XFwvXFwqW1xcc1xcU10qP1xcKlxcL3xcIig/OlxcXFwufFteXCJdKSpcInwnKD86XFxcXC58W14nXSkqJ3xcXGIoPzpjb25zdHxsZXR8dmFyfGZ1bmN0aW9ufHJldHVybnxpZnxlbHNlfGZvcnx3aGlsZXxhc3luY3xhd2FpdHxpbXBvcnR8ZnJvbXxleHBvcnR8dHlwZXxpbnRlcmZhY2V8Y2xhc3N8bmV3fHRydWV8ZmFsc2V8bnVsbHx1bmRlZmluZWQpXFxifFxcYlxcZCsoPzpcXC5cXGQrKT9cXGIpL2dcbiAgcmV0dXJuIHZhbHVlLnNwbGl0KHRva2VuKS5maWx0ZXIoQm9vbGVhbikubWFwKChwYXJ0LCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGtpbmQgPSBwYXJ0LnN0YXJ0c1dpdGgoJy8vJykgfHwgcGFydC5zdGFydHNXaXRoKCcvKicpID8gJ2NvbW1lbnQnIDogcGFydC5zdGFydHNXaXRoKCdcIicpIHx8IHBhcnQuc3RhcnRzV2l0aChcIidcIikgPyAnc3RyaW5nJyA6IC9eXFxkLy50ZXN0KHBhcnQpID8gJ251bWJlcicgOiAvXihjb25zdHxsZXR8dmFyfGZ1bmN0aW9ufHJldHVybnxpZnxlbHNlfGZvcnx3aGlsZXxhc3luY3xhd2FpdHxpbXBvcnR8ZnJvbXxleHBvcnR8dHlwZXxpbnRlcmZhY2V8Y2xhc3N8bmV3fHRydWV8ZmFsc2V8bnVsbHx1bmRlZmluZWQpJC8udGVzdChwYXJ0KSA/ICdrZXl3b3JkJyA6ICdwbGFpbidcbiAgICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXsnZHNkci1jb2RlLScgKyBraW5kfSBrZXk9e2luZGV4fT57cGFydH08L3NwYW4+XG4gIH0pXG59XG5cbmZ1bmN0aW9uIEZpbGVzV29ya3NwYWNlKHsgY3dkLCB0LCBjb2xsYXBzZWQsIG9uVG9nZ2xlRGlyIH06IHsgY3dkOiBzdHJpbmc7IHQ6IENhcmRUOyBjb2xsYXBzZWQ6IFJlYWRvbmx5U2V0PHN0cmluZz47IG9uVG9nZ2xlRGlyOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkIH0pIHtcbiAgY29uc3QgW2ZpbGVzLCBzZXRGaWxlc10gPSB1c2VTdGF0ZTxXb3Jrc3BhY2VGaWxlRW50cnlbXT4oW10pXG4gIGNvbnN0IFtmaWx0ZXIsIHNldEZpbHRlcl0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbY29udGVudCwgc2V0Q29udGVudF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW210aW1lLCBzZXRNdGltZV0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtub3RpY2UsIHNldE5vdGljZV0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBzYXZlZENvbnRlbnQgPSB1c2VSZWYoJycpXG4gIGNvbnN0IGNvZGVSZWYgPSB1c2VSZWY8SFRNTFByZUVsZW1lbnQ+KG51bGwpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgYWxpdmUgPSB0cnVlXG4gICAgdm9pZCBmZXRjaChgJHtGSUxFU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gICAgICAudGhlbigocmVzKSA9PiByZXMuanNvbigpIGFzIFByb21pc2U8RmlsZXNMaXN0UmVzcG9uc2U+KVxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgaWYgKGFsaXZlKSB7XG4gICAgICAgICAgc2V0RmlsZXMoZGF0YS5maWxlcyA/PyBbXSlcbiAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IGFsaXZlICYmIHNldExvYWRpbmcoZmFsc2UpKVxuICAgIHJldHVybiAoKSA9PiB7IGFsaXZlID0gZmFsc2UgfVxuICB9LCBbY3dkXSlcblxuICBjb25zdCBzaG93biA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnBhdGgudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXIudHJpbSgpLnRvTG93ZXJDYXNlKCkpKSwgW2ZpbGVzLCBmaWx0ZXJdKVxuICBjb25zdCB0cmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHNob3duLCAoZmlsZSkgPT4gZmlsZS5wYXRoKSwgW3Nob3duXSlcbiAgY29uc3Qgb3BlbiA9IGFzeW5jIChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICBzZXRTZWxlY3RlZChwYXRoKTsgc2V0TG9hZGluZyh0cnVlKTsgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0ZJTEVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9JnBhdGg9JHtlbmNvZGVVUklDb21wb25lbnQocGF0aCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKSkgYXMgRmlsZVJlYWRSZXNwb25zZVxuICAgICAgaWYgKGRhdGEub2spIHsgY29uc3QgbmV4dCA9IGRhdGEuY29udGVudCA/PyAnJzsgc2F2ZWRDb250ZW50LmN1cnJlbnQgPSBuZXh0OyBzZXRDb250ZW50KG5leHQpOyBzZXRNdGltZShkYXRhLm10aW1lID8/IG51bGwpIH0gZWxzZSBzZXROb3RpY2UoZGF0YS5lcnJvciA/PyAnRmFpbGVkIHRvIHJlYWQgZmlsZScpXG4gICAgfSBjYXRjaCB7IHNldE5vdGljZSgnRmFpbGVkIHRvIHJlYWQgZmlsZScpIH0gZmluYWxseSB7IHNldExvYWRpbmcoZmFsc2UpIH1cbiAgfVxuICBjb25zdCBzYXZlID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghc2VsZWN0ZWQgfHwgc2F2aW5nKSByZXR1cm5cbiAgICBzZXRTYXZpbmcodHJ1ZSk7IHNldE5vdGljZShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChGSUxFU19VUkwsIHsgbWV0aG9kOiAnUE9TVCcsIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LCBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgcGF0aDogc2VsZWN0ZWQsIGNvbnRlbnQsIG10aW1lIH0pIH0pXG4gICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkpIGFzIEZpbGVXcml0ZVJlc3BvbnNlXG4gICAgICBpZiAoZGF0YS5vaykgeyBzYXZlZENvbnRlbnQuY3VycmVudCA9IGNvbnRlbnQ7IHNldE10aW1lKGRhdGEubXRpbWUgPz8gbXRpbWUpOyBzZXROb3RpY2UodCgnZmlsZXMuc2F2ZWQnKSkgfSBlbHNlIHNldE5vdGljZShkYXRhLmVycm9yID8/ICdGYWlsZWQgdG8gc2F2ZSBmaWxlJylcbiAgICB9IGNhdGNoIHsgc2V0Tm90aWNlKCdGYWlsZWQgdG8gc2F2ZSBmaWxlJykgfSBmaW5hbGx5IHsgc2V0U2F2aW5nKGZhbHNlKSB9XG4gIH1cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkIHx8IGxvYWRpbmcgfHwgc2F2aW5nIHx8IGNvbnRlbnQgPT09IHNhdmVkQ29udGVudC5jdXJyZW50KSByZXR1cm5cbiAgICBjb25zdCB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHZvaWQgc2F2ZSgpLCA4MDApXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpXG4gIH0sIFtjb250ZW50LCBzZWxlY3RlZCwgbG9hZGluZywgc2F2aW5nLCBtdGltZV0pXG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJkc2RyLWZpbGVzLXdvcmtzcGFjZVwiIGFyaWEtbGFiZWw9e3QoJ2ZpbGVzLnRpdGxlJyl9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbGVzLXRvb2xiYXJcIj48aW5wdXQgY2xhc3NOYW1lPVwiZHNkci1maWxlcy1zZWFyY2hcIiB2YWx1ZT17ZmlsdGVyfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWx0ZXIoZXZlbnQudGFyZ2V0LnZhbHVlKX0gcGxhY2Vob2xkZXI9e3QoJ2ZpbGVzLnNlYXJjaCcpfSBhdXRvRm9jdXMgLz48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy1jb250ZW50XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy1saXN0XCI+XG4gICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgbm9kZXM9e3RyZWV9XG4gICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZH1cbiAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXtvblRvZ2dsZURpcn1cbiAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgcmVuZGVyTGVhZj17KGxlYWYpID0+IDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT17YGRzZHItZmlsZXMtaXRlbSR7c2VsZWN0ZWQgPT09IGxlYWYucGF0aCA/ICcgZHNkci1maWxlcy1pdGVtLWFjdGl2ZScgOiAnJ31gfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW4obGVhZi5wYXRoKX0gdGl0bGU9e2xlYWYucGF0aH0+e2xlYWYubmFtZX08L2J1dHRvbj59XG4gICAgICAgICAgLz5cbiAgICAgICAgICB7IWxvYWRpbmcgJiYgc2hvd24ubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ2ZpbGVzLmVtcHR5Jyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy1lZGl0b3JcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtcGF0aFwiPntzZWxlY3RlZCA/PyAobG9hZGluZyA/IHQoJ2ZpbGVzLmxvYWRpbmcnKSA6ICcnKX08L2Rpdj5cbiAgICAgICAgICB7c2VsZWN0ZWQgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29kZS1lZGl0b3JcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvZGUtbGluZXNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y29udGVudC5zcGxpdCgnXFxuJykubWFwKChfLCBpbmRleCkgPT4gPHNwYW4ga2V5PXtpbmRleH0+e2luZGV4ICsgMX08L3NwYW4+KX08L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvZGUtbGF5ZXJcIj5cbiAgICAgICAgICAgICAgICA8cHJlIHJlZj17Y29kZVJlZn0gY2xhc3NOYW1lPVwiZHNkci1jb2RlLWhpZ2hsaWdodFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjxjb2RlPntoaWdobGlnaHRDb2RlKGNvbnRlbnQpfTwvY29kZT48L3ByZT5cbiAgICAgICAgICAgICAgICA8dGV4dGFyZWEgY2xhc3NOYW1lPVwiZHNkci1maWxlcy10ZXh0XCIgdmFsdWU9e2NvbnRlbnR9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldENvbnRlbnQoZXZlbnQudGFyZ2V0LnZhbHVlKX0gb25TY3JvbGw9eyhldmVudCkgPT4geyBpZiAoY29kZVJlZi5jdXJyZW50KSB7IGNvZGVSZWYuY3VycmVudC5zY3JvbGxUb3AgPSBldmVudC5jdXJyZW50VGFyZ2V0LnNjcm9sbFRvcDsgY29kZVJlZi5jdXJyZW50LnNjcm9sbExlZnQgPSBldmVudC5jdXJyZW50VGFyZ2V0LnNjcm9sbExlZnQgfSB9fSBzcGVsbENoZWNrPXtmYWxzZX0gLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7c2VsZWN0ZWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtYWN0aW9uc1wiPjxzcGFuIGNsYXNzTmFtZT1cImRzZHItbm90aWNlXCI+e3NhdmluZyA/IHQoJ2ZpbGVzLmxvYWRpbmcnKSA6IG5vdGljZSA/PyAnJ308L3NwYW4+PC9kaXY+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG4gIClcbn1cblxuZnVuY3Rpb24gRGlmZlJldmlld0FjdGlvbih7IHNlc3Npb25JZCwgdXNlU2Vzc2lvbnMsIHVzZVNlc3Npb24sIHQgfTogRGlmZlJldmlld0FjdGlvblByb3BzKSB7XG4gIGNvbnN0IGN3ZCA9IHVzZVNlc3Npb25zKChzOiBTZXNzaW9uTGlzdFN0YXRlKSA9PiBzLmJ5SWRbc2Vzc2lvbklkXT8uY3dkKVxuICBjb25zdCBub2RlcyA9IHVzZVNlc3Npb24oKHMpID0+IHMubm9kZXMpXG4gIGNvbnN0IGNoYW5nZUNvdW50ID0gdXNlTWVtbygoKSA9PiBjb3VudFNlc3Npb25DaGFuZ2VzKG5vZGVzKSwgW25vZGVzXSlcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3Qgb3Blbk92ZXJsYXkgPSAoKSA9PiB7XG4gICAgaWYgKCFjd2QpIHJldHVyblxuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHVuc3ViID0gb3ZlcmxheVN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBzZXRPcGVuKG92ZXJsYXlTdG9yZS5nZXRTbmFwc2hvdCgpLm9wZW4pXG4gICAgfSlcbiAgICByZXR1cm4gdW5zdWJcbiAgfSwgW10pXG5cbiAgaWYgKCFjd2QpIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXRyaWdnZXJcIiBhcmlhLWxhYmVsPXt0KCdhY3Rpb24uYXJpYScpfSBvbkNsaWNrPXtvcGVuT3ZlcmxheX0+XG4gICAgICA8SWNvbkRpZmYgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGFiZWxcIj57dCgnYWN0aW9uLmxhYmVsJyl9PC9zcGFuPlxuICAgICAge2NoYW5nZUNvdW50ID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY291bnRcIj57Y2hhbmdlQ291bnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7b3BlbiA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY291bnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cdTI3MTM8L3NwYW4+IDogbnVsbH1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEZpbGUgdHJlZTogYnVpbGQgYSBkaXJlY3RvcnkgdHJlZSBmcm9tIGZsYXQgcGF0aHMgYW5kIHJlbmRlciBpdCB3aXRoXG4vLyBjb2xsYXBzaWJsZSBmb2xkZXJzICh0aGUgbGVmdCBzaWRlIG9mIHRoZSByZXZpZXcgc3VyZmFjZSkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudHlwZSBUcmVlRGlyPFQ+ID0geyBraW5kOiAnZGlyJzsgbmFtZTogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGNoaWxkcmVuOiBUcmVlTm9kZTxUPltdIH1cbnR5cGUgVHJlZUxlYWY8VD4gPSB7IGtpbmQ6ICdsZWFmJzsgbmFtZTogc3RyaW5nOyBwYXRoOiBzdHJpbmc7IGl0ZW06IFQgfVxudHlwZSBUcmVlTm9kZTxUPiA9IFRyZWVEaXI8VD4gfCBUcmVlTGVhZjxUPlxuXG4vKiogVHVybiBhIGZsYXQgaXRlbSBsaXN0IGludG8gYSBzb3J0ZWQgZGlyZWN0b3J5IHRyZWUgKGRpcmVjdG9yaWVzIGZpcnN0KS4gKi9cbmZ1bmN0aW9uIGJ1aWxkRmlsZVRyZWU8VD4oaXRlbXM6IHJlYWRvbmx5IFRbXSwgcGF0aE9mOiAoaXRlbTogVCkgPT4gc3RyaW5nKTogVHJlZU5vZGU8VD5bXSB7XG4gIGNvbnN0IHJvb3Q6IFRyZWVOb2RlPFQ+W10gPSBbXVxuICBjb25zdCBkaXJJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBUcmVlRGlyPFQ+PigpXG4gIGZvciAoY29uc3QgaXRlbSBvZiBpdGVtcykge1xuICAgIGNvbnN0IHBhdGggPSBwYXRoT2YoaXRlbSlcbiAgICBjb25zdCBwYXJ0cyA9IHBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbilcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAwKSBjb250aW51ZVxuICAgIGxldCBzaWJsaW5ncyA9IHJvb3RcbiAgICBsZXQgcHJlZml4ID0gJydcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgcHJlZml4ID0gcHJlZml4ID8gYCR7cHJlZml4fS8ke3BhcnRzW2ldfWAgOiBwYXJ0c1tpXVxuICAgICAgbGV0IGRpciA9IGRpckluZGV4LmdldChwcmVmaXgpXG4gICAgICBpZiAoIWRpcikge1xuICAgICAgICBkaXIgPSB7IGtpbmQ6ICdkaXInLCBuYW1lOiBwYXJ0c1tpXSwgcGF0aDogcHJlZml4LCBjaGlsZHJlbjogW10gfVxuICAgICAgICBkaXJJbmRleC5zZXQocHJlZml4LCBkaXIpXG4gICAgICAgIHNpYmxpbmdzLnB1c2goZGlyKVxuICAgICAgfVxuICAgICAgc2libGluZ3MgPSBkaXIuY2hpbGRyZW5cbiAgICB9XG4gICAgc2libGluZ3MucHVzaCh7IGtpbmQ6ICdsZWFmJywgbmFtZTogcGFydHNbcGFydHMubGVuZ3RoIC0gMV0sIHBhdGgsIGl0ZW0gfSlcbiAgfVxuICBjb25zdCBzb3J0Tm9kZXMgPSAobm9kZXM6IFRyZWVOb2RlPFQ+W10pOiB2b2lkID0+IHtcbiAgICBub2Rlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICBpZiAoYS5raW5kICE9PSBiLmtpbmQpIHJldHVybiBhLmtpbmQgPT09ICdkaXInID8gLTEgOiAxXG4gICAgICByZXR1cm4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKVxuICAgIH0pXG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSBpZiAobm9kZS5raW5kID09PSAnZGlyJykgc29ydE5vZGVzKG5vZGUuY2hpbGRyZW4pXG4gIH1cbiAgc29ydE5vZGVzKHJvb3QpXG4gIHJldHVybiByb290XG59XG5cbi8qKiBSZWN1cnNpdmUgdHJlZSByZW5kZXJlcjogY29sbGFwc2libGUgZGlyZWN0b3JpZXMgKyBsZWFmIHJvd3MuICovXG5mdW5jdGlvbiBGaWxlVHJlZVZpZXc8VD4ocHJvcHM6IHtcbiAgbm9kZXM6IFRyZWVOb2RlPFQ+W11cbiAgY29sbGFwc2VkOiBSZWFkb25seVNldDxzdHJpbmc+XG4gIG9uVG9nZ2xlRGlyOiAocGF0aDogc3RyaW5nKSA9PiB2b2lkXG4gIGRlcHRoOiBudW1iZXJcbiAgcmVuZGVyTGVhZjogKGxlYWY6IFRyZWVMZWFmPFQ+KSA9PiBSZWFjdE5vZGVcbn0pOiBSZWFjdEVsZW1lbnQge1xuICBjb25zdCB7IG5vZGVzLCBjb2xsYXBzZWQsIG9uVG9nZ2xlRGlyLCBkZXB0aCwgcmVuZGVyTGVhZiB9ID0gcHJvcHNcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge25vZGVzLm1hcCgobm9kZSkgPT5cbiAgICAgICAgbm9kZS5raW5kID09PSAnZGlyJyA/IChcbiAgICAgICAgICA8ZGl2IGtleT17bm9kZS5wYXRofT5cbiAgICAgICAgICAgIHsvKiBEaXJlY3Rvcnkgcm93OiBjbGljayB0b2dnbGVzIHRoaXMgZGlyZWN0b3J5J3MgY29sbGFwc2Ugc3RhdGVcbiAgICAgICAgICAgICAgICAoY29sbGFwc2VkIFx1MjE5MiBleHBhbmQsIGV4cGFuZGVkIFx1MjE5MiBjb2xsYXBzZSkuICovfVxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1kaXIke2NvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/ICcnIDogJyBkc2RyLWRpci1vcGVuJ31gfVxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nTGVmdDogZGVwdGggKiAxNCArIDggfX1cbiAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25Ub2dnbGVEaXIobm9kZS5wYXRoKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY2FyZXRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y29sbGFwc2VkLmhhcyhub2RlLnBhdGgpID8gJ1x1MjVCOCcgOiAnXHUyNUJFJ308L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLW5hbWVcIiB0aXRsZT17bm9kZS5wYXRofT57bm9kZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaXItY291bnRcIj57bm9kZS5jaGlsZHJlbi5sZW5ndGh9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICB7IWNvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/IChcbiAgICAgICAgICAgICAgPEZpbGVUcmVlVmlldyBub2Rlcz17bm9kZS5jaGlsZHJlbn0gY29sbGFwc2VkPXtjb2xsYXBzZWR9IG9uVG9nZ2xlRGlyPXtvblRvZ2dsZURpcn0gZGVwdGg9e2RlcHRoICsgMX0gcmVuZGVyTGVhZj17cmVuZGVyTGVhZn0gLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYga2V5PXtub2RlLnBhdGh9IHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBkZXB0aCAqIDE0IH19PntyZW5kZXJMZWFmKG5vZGUpfTwvZGl2PlxuICAgICAgICApLFxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbnZlcnNhdGlvbiBjYXJkIChzZXNzaW9uIHNjb3BlKTogdGhlIGNhcnJpZWQgcmV2aWV3IHBhY2thZ2UgcmVuZGVycyBpbiB0aGVcbi8vIHRyYW5zY3JpcHQgYXMgYSBDb2RleC1zdHlsZSBjYXJkIFx1MjAxNCBlYWNoIGNvbW1lbnQgY2xpY2thYmxlIHRvIGp1bXAgdG8gdGhlXG4vLyBtYXRjaGluZyBjaGFuZ2UgYmxvY2sgaW4gdGhlIHJldmlldyBwYW5lbC4gVGhlIHVzZXItbm9kZSByZW5kZXJlciBpc1xuLy8gc2hhZG93ZWQgYXQgcHJpb3JpdHkgLTE7IG5vbi1wYWNrYWdlIG1lc3NhZ2VzIGZhbGwgYmFjayB0byBhIG5hdGl2ZS1sb29rXG4vLyBidWJibGUgKHRoZSBzaGVsbCdzIG93biByZW5kZXJlciBjYW5ub3QgYmUgZGVsZWdhdGVkIHRvLCBiZWNhdXNlIHRoZSBzbG90XG4vLyBoYW5kcyBvdXIgbmFtZXNwYWNlLWJvdW5kIGB0YCB0byB3aGF0ZXZlciBjb21wb25lbnQgd2lucyB0aGUgY2VsbCkuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFN0cnVjdHVyYWwgdXNlciBjb250ZW50IGJsb2NrIChDb250ZW50QmxvY2sgaXMgbm90IGV4cG9ydGVkIGZyb20gcnVudGltZSkuICovXG50eXBlIFVzZXJCbG9jayA9IHsgdHlwZTogc3RyaW5nOyB0ZXh0Pzogc3RyaW5nOyBhdHRhY2htZW50PzogSW1hZ2VBdHRhY2htZW50UmVmIH1cblxuLyoqIFBsYWluIHRleHQgb2YgYSB1c2VyIG1lc3NhZ2UncyBjb250ZW50IGJsb2NrcyAodGV4dCBibG9ja3MgY29uY2F0ZW5hdGVkKS4gKi9cbmZ1bmN0aW9uIHVzZXJNZXNzYWdlVGV4dChjb250ZW50OiByZWFkb25seSBVc2VyQmxvY2tbXSk6IHN0cmluZyB7XG4gIGxldCBvdXQgPSAnJ1xuICBmb3IgKGNvbnN0IGJsb2NrIG9mIGNvbnRlbnQpIHtcbiAgICBpZiAoYmxvY2sudHlwZSA9PT0gJ3RleHQnICYmIHR5cGVvZiBibG9jay50ZXh0ID09PSAnc3RyaW5nJykgb3V0ICs9IGJsb2NrLnRleHRcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBGdWxsIHByb3BzIG9mIG91ciBzaGFkb3dlZCB1c2VyL3N0ZWVyaW5nIG5vZGUgcmVuZGVyZXJzICh0IGJvdW5kIHRvIG91ciBuYW1lc3BhY2UpLiAqL1xudHlwZSBVc2VyUmV2aWV3Tm9kZVByb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uY2hhdC5ub2RlJywgJ3VzZXInIHwgJ3N0ZWVyaW5nJz4gJiBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPlxuLyoqIFRyYW5zbGF0b3IgYm91bmQgdG8gdGhlIHBsdWdpbiBuYW1lc3BhY2UgKHNoYXJlZCBieSB0aGUgY2FyZC9idWJibGUpLiAqL1xudHlwZSBDYXJkVCA9IFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+Wyd0J11cblxuLyoqIEdyb3VwIGNvbW1lbnRzIGJ5IHBhdGgsIHByZXNlcnZpbmcgZmlyc3Qtc2VlbiBvcmRlci4gKi9cbmZ1bmN0aW9uIGdyb3VwQ29tbWVudHMoY29tbWVudHM6IFJldmlld1BhY2thZ2VDb21tZW50W10pOiB7IHBhdGg6IHN0cmluZzsgY29tbWVudHM6IFJldmlld1BhY2thZ2VDb21tZW50W10gfVtdIHtcbiAgY29uc3QgZ3JvdXBzOiB7IHBhdGg6IHN0cmluZzsgY29tbWVudHM6IFJldmlld1BhY2thZ2VDb21tZW50W10gfVtdID0gW11cbiAgY29uc3QgaW5kZXggPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpXG4gIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgIGxldCBnID0gaW5kZXguZ2V0KGMucGF0aClcbiAgICBpZiAoZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBnID0gZ3JvdXBzLmxlbmd0aFxuICAgICAgaW5kZXguc2V0KGMucGF0aCwgZylcbiAgICAgIGdyb3Vwcy5wdXNoKHsgcGF0aDogYy5wYXRoLCBjb21tZW50czogW10gfSlcbiAgICB9XG4gICAgZ3JvdXBzW2ddLmNvbW1lbnRzLnB1c2goYylcbiAgfVxuICByZXR1cm4gZ3JvdXBzXG59XG5cbmZ1bmN0aW9uIEljb25GaWxlKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk0xNCAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOHpcIiAvPlxuICAgICAgPHBhdGggZD1cIk0xNCAydjZoNlwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIENvZGV4LXN0eWxlIHJldmlldyBjYXJkIGZvciBhIGNhcnJpZWQgcmV2aWV3IHBhY2thZ2UgbWVzc2FnZS4gKi9cbmZ1bmN0aW9uIFJldmlld1BhY2thZ2VDYXJkKHsgcGtnLCBjd2QsIHQgfTogeyBwa2c6IFJldmlld1BhY2thZ2U7IGN3ZD86IHN0cmluZzsgdDogQ2FyZFQgfSkge1xuICBjb25zdCB0YXJnZXRDd2QgPSBwa2cud29ya3NwYWNlID8/IGN3ZCA/PyBudWxsXG4gIGNvbnN0IGp1bXAgPSAocGF0aDogc3RyaW5nLCBsaW5lPzogbnVtYmVyLCBzb3VyY2U/OiBSZXZpZXdQYWNrYWdlQ29tbWVudFsnc291cmNlJ10pID0+IHtcbiAgICBpZiAoIXRhcmdldEN3ZCkgcmV0dXJuXG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSB0YXJnZXRDd2RcbiAgICAgIC8vIFNlc3Npb24tc291cmNlZCBjb21tZW50cyBhbmNob3IgdG8gcmVsYXRpdmUgaHVuayBsaW5lcyBhbmQganVtcCB0b1xuICAgICAgLy8gdGhlIHNlc3Npb24gdGFiOyB3b3Jrc3BhY2UgY29tbWVudHMganVtcCB0byByZWFsIGZpbGUgbGluZXMuXG4gICAgICBkLmZvY3VzID0geyBwYXRoLCBsaW5lLCB0YWI6IHNvdXJjZSA9PT0gJ3Nlc3Npb24nID8gJ3Nlc3Npb24nIDogJ3dvcmtzcGFjZScgfVxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG4gIGNvbnN0IGdyb3VwcyA9IHVzZU1lbW8oKCkgPT4gZ3JvdXBDb21tZW50cyhwa2cuY29tbWVudHMpLCBbcGtnLmNvbW1lbnRzXSlcbiAgY29uc3Qgc2hvd1ZlcmRpY3QgPSBwa2cudmVyZGljdCAhPT0gbnVsbCB8fCBwa2cuZmluZGluZ3MubGVuZ3RoID4gMFxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZFwiIGRhdGEtdGltZS1ob3Zlci1yb290PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWhlYWRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1iYWRnZVwiPjxJY29uQ29tbWVudCAvPnt0KCdyZXZpZXcuY2FyZFRpdGxlJyl9PC9zcGFuPlxuICAgICAgICB7dGFyZ2V0Q3dkID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtd29ya3NwYWNlXCIgdGl0bGU9e3RhcmdldEN3ZH0+e3RhcmdldEN3ZH08L3NwYW4+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgIHtwa2cuY29tbWVudHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLW1ldGFcIj57dCgncmV2aWV3LmNhcmRDb21tZW50cycsIHsgbjogcGtnLmNvbW1lbnRzLmxlbmd0aCB9KX08L3NwYW4+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7Z3JvdXBzLm1hcCgoZykgPT4gKFxuICAgICAgICA8ZGl2IGtleT17Zy5wYXRofSBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWdyb3VwXCI+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1wYXRoXCIgdGl0bGU9e3QoJ3Jldmlldy5jYXJkT3BlbkZpbGUnKX0gb25DbGljaz17KCkgPT4ganVtcChnLnBhdGgpfT5cbiAgICAgICAgICAgIDxJY29uRmlsZSAvPjxzcGFuPntnLnBhdGh9PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIHtnLmNvbW1lbnRzLm1hcCgoYywgaSkgPT4gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWl0ZW1cIlxuICAgICAgICAgICAgICB0aXRsZT17dCgncmV2aWV3LmNhcmRKdW1wJyl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGp1bXAoYy5wYXRoLCBjLmxpbmUgPz8gdW5kZWZpbmVkLCBjLnNvdXJjZSl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtbG9jXCI+e2MubGluZSAhPT0gbnVsbCA/IGAke2MucGF0aH06JHtjLmxpbmV9YCA6IGAke2MucGF0aH0gKG9sZClgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC10ZXh0XCI+e2MudGV4dH08L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApKX1cbiAgICAgIHtzaG93VmVyZGljdCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLXZlcmRpY3Qtc2VjXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtaGVhZFwiPlxuICAgICAgICAgICAgPHNwYW4+e3QoJ3Jldmlldy5jYXJkVmVyZGljdCcpfTwvc3Bhbj5cbiAgICAgICAgICAgIHtwa2cudmVyZGljdCA/IChcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0IGRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC0ke3BrZy52ZXJkaWN0fWB9PlxuICAgICAgICAgICAgICAgIHtwa2cudmVyZGljdCA9PT0gJ2NvcnJlY3QnID8gdCgncmV2aWV3LnZlcmRpY3RDb3JyZWN0JykgOiB0KCdyZXZpZXcudmVyZGljdEluY29ycmVjdCcpfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7cGtnLmZpbmRpbmdzLm1hcCgoZjogUmV2aWV3UGFja2FnZUZpbmRpbmcsIGk6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZmluZGluZ1wiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWZpbmRpbmctdGFnIGRzZHItZmluZGluZy0ke2YucHJpb3JpdHl9YH0+e2YucHJpb3JpdHl9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWZpbmRpbmctdGV4dFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZmluZGluZy1sb2NcIj57Zi5maWxlfTp7Zi5saW5lfTwvc3Bhbj57JyAnfVxuICAgICAgICAgICAgICAgIHtmLnRpdGxlfXtmLmRldGFpbCA/IGAgXHUyMDE0ICR7Zi5kZXRhaWx9YCA6ICcnfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1mb290XCI+e3QoJ3Jldmlldy5jYXJkSGludCcpfTwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBOYXRpdmUtbG9vayBmYWxsYmFjayBidWJibGUgZm9yIG9yZGluYXJ5IHVzZXIgbWVzc2FnZXMgKHNoYWRvd2VkIGNlbGwpLiAqL1xuZnVuY3Rpb24gRmFsbGJhY2tVc2VyQnViYmxlKHtcbiAgdGV4dCxcbiAgaW1hZ2VzLFxuICBsb2FkSW1hZ2UsXG4gIHQsXG59OiB7XG4gIHRleHQ6IHN0cmluZ1xuICBpbWFnZXM6IHJlYWRvbmx5IChVc2VyQmxvY2sgJiB7IGF0dGFjaG1lbnQ6IEltYWdlQXR0YWNobWVudFJlZiB9KVtdXG4gIGxvYWRJbWFnZTogKGF0dGFjaG1lbnQ6IEltYWdlQXR0YWNobWVudFJlZikgPT4gUHJvbWlzZTxzdHJpbmc+XG4gIHQ6IENhcmRUXG59KSB7XG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3Qgb25Db3B5ID0gKCkgPT4ge1xuICAgIHZvaWQgd3JpdGVDbGlwYm9hcmQodGV4dCkudGhlbigob2spID0+IHtcbiAgICAgIGlmICghb2spIHJldHVyblxuICAgICAgc2V0Q29waWVkKHRydWUpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDEwMDApXG4gICAgfSlcbiAgfVxuICBjb25zdCBsYWJlbHMgPSB1c2VNZW1vKFxuICAgICgpID0+ICh7XG4gICAgICBpbWFnZTogdCgnZmFsbGJhY2suaW1hZ2UnKSxcbiAgICAgIG9wZW46IHQoJ2ZhbGxiYWNrLm9wZW4nKSxcbiAgICAgIG9wZW5OYW1lZDogKG5hbWU6IHN0cmluZykgPT4gdCgnZmFsbGJhY2sub3Blbk5hbWVkJywgeyBuYW1lIH0pLFxuICAgICAgbG9hZGluZzogdCgnZmFsbGJhY2subG9hZGluZycpLFxuICAgICAgbG9hZEZhaWxlZDogdCgnZmFsbGJhY2subG9hZEZhaWxlZCcpLFxuICAgICAgbGlnaHRib3g6IHsgZGlhbG9nOiB0KCdmYWxsYmFjay5saWdodGJveERpYWxvZycpLCBjbG9zZTogdCgnZmFsbGJhY2subGlnaHRib3hDbG9zZScpIH0sXG4gICAgfSksXG4gICAgW3RdLFxuICApXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXJcIiBkYXRhLXRpbWUtaG92ZXItcm9vdD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyLXN0YWNrXCI+XG4gICAgICAgIHtpbWFnZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICA8SW1hZ2VHYWxsZXJ5IGltYWdlcz17aW1hZ2VzfSBsb2FkPXtsb2FkSW1hZ2V9IGFsaWduPVwiZW5kXCIgbGFiZWxzPXtsYWJlbHN9IC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7dGV4dCAhPT0gJycgPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXItcm93XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmFsbGJhY2stdXNlci1idWJibGVcIj57dGV4dH08L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZmFsbGJhY2stdXNlci1jb3B5XCIgdGl0bGU9e3QoJ3Jldmlldy5jb3B5Jyl9IG9uQ2xpY2s9e29uQ29weX0+XG4gICAgICAgICAgICAgIHtjb3BpZWQgPyB0KCdyZXZpZXcuY29waWVkJykgOiA8SWNvbkNvcHkgLz59XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ29weSgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxyZWN0IHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHg9XCI4XCIgeT1cIjhcIiByeD1cIjJcIiByeT1cIjJcIiAvPlxuICAgICAgPHBhdGggZD1cIk00IDE2Yy0xLjEgMC0yLS45LTItMlY0YzAtMS4xLjktMiAyLTJoMTBjMS4xIDAgMiAuOSAyIDJcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKlxuICogVXNlci1ub2RlIHJlbmRlcmVyIHNoYWRvdzogY2FycmllZCByZXZpZXcgcGFja2FnZXMgcmVuZGVyIGFzIGEgY2FyZDtcbiAqIGV2ZXJ5dGhpbmcgZWxzZSByZW5kZXJzIGFzIGEgbmF0aXZlLWxvb2sgYnViYmxlLlxuICovXG5mdW5jdGlvbiBVc2VyUmV2aWV3Tm9kZVZpZXcocHJvcHM6IFVzZXJSZXZpZXdOb2RlUHJvcHMpIHtcbiAgY29uc3QgY29udGVudCA9IHVzZU1lbW8oKCkgPT4gcHJvcHMubm9kZS5kYXRhLmNvbnRlbnQgYXMgcmVhZG9ubHkgVXNlckJsb2NrW10sIFtwcm9wcy5ub2RlLmRhdGEuY29udGVudF0pXG4gIGNvbnN0IHRleHQgPSB1c2VNZW1vKCgpID0+IHVzZXJNZXNzYWdlVGV4dChjb250ZW50KSwgW2NvbnRlbnRdKVxuICBjb25zdCBpbWFnZXMgPSB1c2VNZW1vKFxuICAgICgpID0+IGNvbnRlbnQuZmlsdGVyKChiKTogYiBpcyBVc2VyQmxvY2sgJiB7IGF0dGFjaG1lbnQ6IEltYWdlQXR0YWNobWVudFJlZiB9ID0+IGIudHlwZSA9PT0gJ2ltYWdlJyAmJiBiLmF0dGFjaG1lbnQgIT09IHVuZGVmaW5lZCksXG4gICAgW2NvbnRlbnRdLFxuICApXG4gIGNvbnN0IHBrZyA9IHVzZU1lbW8oKCkgPT4gKGlzUmV2aWV3UGFja2FnZVRleHQodGV4dCkgPyBwYXJzZVJldmlld1BhY2thZ2UodGV4dCkgOiBudWxsKSwgW3RleHRdKVxuICBpZiAocGtnKSB7XG4gICAgcmV0dXJuIDxSZXZpZXdQYWNrYWdlQ2FyZCBwa2c9e3BrZ30gY3dkPXtwcm9wcy5jd2R9IHQ9e3Byb3BzLnR9IC8+XG4gIH1cbiAgcmV0dXJuIDxGYWxsYmFja1VzZXJCdWJibGUgdGV4dD17dGV4dH0gaW1hZ2VzPXtpbWFnZXN9IGxvYWRJbWFnZT17cHJvcHMubG9hZEltYWdlfSB0PXtwcm9wcy50fSAvPlxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENvbXBvc2VyIGRvY2sgKHNlc3Npb24gc2NvcGUpOiBwZW5kaW5nIGlubGluZSBjb21tZW50cyBmbG9hdCBhYm92ZSB0aGVcbi8vIGlucHV0IGJveCwgQ29kZXgtc3R5bGUgXHUyMDE0IGhvdmVyIHRoZSBwaWxsIHRvIHByZXZpZXcsIGNsaWNrIHNlbmQgdG8gaW5qZWN0LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnR5cGUgRGlmZlJldmlld0NvbXBvc2VyRG9ja1Byb3BzID0gUHJvcHNSdW50aW1lPCdjb252ZXJzYXRpb24uaW5wdXQuZG9jayc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz4gJiB7IHNlc3Npb25zOiBJU2Vzc2lvbnMgfVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3Q29tcG9zZXJEb2NrKHsgc2Vzc2lvbklkLCB1c2VTZXNzaW9ucywgc2Vzc2lvbnMsIHQgfTogRGlmZlJldmlld0NvbXBvc2VyRG9ja1Byb3BzKSB7XG4gIGNvbnN0IGN3ZCA9IHVzZVNlc3Npb25zKChzOiBTZXNzaW9uTGlzdFN0YXRlKSA9PiBzLmJ5SWRbc2Vzc2lvbklkXT8uY3dkKVxuICBjb25zdCBwZW5kaW5nID0gdXNlU3luY0V4dGVybmFsU3RvcmUocGVuZGluZ0NvbW1lbnRzU3RvcmUuc3Vic2NyaWJlLCBwZW5kaW5nQ29tbWVudHNTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3QgW2Rpc21pc3NlZCwgc2V0RGlzbWlzc2VkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY2FycnlGbGFzaCwgc2V0Q2FycnlGbGFzaF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBjYXJyeWluZyA9IHVzZVJlZihmYWxzZSlcblxuICAvLyBTZWVkIHRoZSBzdG9yZSBmcm9tIHNlcnZlciBzdG9yYWdlIHdoZW4gbm90aGluZyBoYXMgYmVlbiBzeW5jZWQgZm9yIHRoaXNcbiAgLy8gd29ya3NwYWNlIHlldCAocGFuZWwgbmV2ZXIgb3BlbmVkIHRoaXMgc2Vzc2lvbiBcdTIwMTQgY29tbWVudHMgcGVyc2lzdCBpbiAuZ2l0KS5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWN3ZCB8fCBwZW5kaW5nLmN3ZCA9PT0gY3dkKSByZXR1cm5cbiAgICBsZXQgY2FuY2VsbGVkID0gZmFsc2VcbiAgICB2b2lkIGxvYWRDb21tZW50cyhjd2QpLnRoZW4oKGxpc3QpID0+IHtcbiAgICAgIGlmIChjYW5jZWxsZWQpIHJldHVyblxuICAgICAgcGVuZGluZ0NvbW1lbnRzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgIGlmIChkLmN3ZCA9PT0gY3dkKSByZXR1cm5cbiAgICAgICAgZC5jd2QgPSBjd2RcbiAgICAgICAgZC5jb21tZW50cyA9IGxpc3RcbiAgICAgIH0pXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2FuY2VsbGVkID0gdHJ1ZVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtjd2QsIHBlbmRpbmcuY3dkXSlcblxuICBjb25zdCBjb21tZW50cyA9IHBlbmRpbmcuY3dkID09PSBjd2QgPyBwZW5kaW5nLmNvbW1lbnRzIDogW11cbiAgY29uc3Qgc2VudFNuYXAgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShzZW50U3RvcmUuc3Vic2NyaWJlLCBzZW50U3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IHNlbnQgPSAoY3dkICYmIHNlbnRTbmFwW2N3ZF0pIHx8IHsgc2VudENvbW1lbnRJZHM6IFtdLCBzZW50UmV2aWV3S2V5OiBudWxsIH1cbiAgY29uc3Qgc2VudFNldCA9IG5ldyBTZXQoc2VudC5zZW50Q29tbWVudElkcylcbiAgY29uc3QgdW5zZW50Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+ICFzZW50U2V0LmhhcyhjLmlkKSlcbiAgY29uc3QgcmV2aWV3S2V5ID1cbiAgICBwZW5kaW5nLnJldmlldz8ub2sgJiYgKHBlbmRpbmcucmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgfHwgcGVuZGluZy5yZXZpZXcudmVyZGljdClcbiAgICAgID8gYCR7cGVuZGluZy5yZXZpZXcudmVyZGljdCA/PyAnJ306JHtwZW5kaW5nLnJldmlldy5maW5kaW5ncy5sZW5ndGh9OiR7cGVuZGluZy5yZXZpZXcuZmluZGluZ3NbMF0/LnRpdGxlID8/ICcnfWBcbiAgICAgIDogbnVsbFxuICBjb25zdCByZXZpZXdQZW5kaW5nID0gcmV2aWV3S2V5ICE9PSBudWxsICYmIHJldmlld0tleSAhPT0gc2VudC5zZW50UmV2aWV3S2V5XG4gIGNvbnN0IGhhc1BlbmRpbmcgPSB1bnNlbnRDb21tZW50cy5sZW5ndGggPiAwIHx8IHJldmlld1BlbmRpbmdcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghaGFzUGVuZGluZykge1xuICAgICAgc2V0RGlzbWlzc2VkKGZhbHNlKVxuICAgIH1cbiAgfSwgW2hhc1BlbmRpbmddKVxuXG4gIC8qKiBDb21wb3NlIHRoZSBmdWxsIHJldmlldyBwYWNrYWdlOiBjb21tZW50cyArIHRoZWlyIGRpZmYgaHVua3MgKyBBSSB2ZXJkaWN0LiAqL1xuICBjb25zdCBjb21wb3NlQ2FycmllZE1lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQlx1OTQ4OFx1NUJGOVx1NUY1M1x1NTI0RFx1NURFNVx1NEY1Q1x1NTMzQVx1NzY4NFx1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMVx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsIGBcdTVERTVcdTRGNUNcdTUzM0FcdUZGMUEke2N3ZH1gLCAnJ11cbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUmV2aWV3Q29tbWVudFtdPigpXG4gICAgZm9yIChjb25zdCBjIG9mIHVuc2VudENvbW1lbnRzKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChjLnBhdGgpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGMpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoYy5wYXRoLCBbY10pXG4gICAgfVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGMgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCBhbmNob3IgPSBjLmxpbmVOZXcgIT09IG51bGwgPyBgOiR7Yy5saW5lTmV3fWAgOiBgIChvbGQgbGluZSAke2MubGluZU9sZH0pYFxuICAgICAgICAvLyBPcmlnaW4gdGFiIHRhZyBzbyB0aGUgY29udmVyc2F0aW9uIGNhcmQgcm91dGVzIGl0cyBqdW1wICgncycgPVxuICAgICAgICAvLyBzZXNzaW9uIHJlbGF0aXZlIGh1bmsgbGluZXMsICd3JyA9IHdvcmtzcGFjZSByZWFsIGxpbmVzKS5cbiAgICAgICAgY29uc3QgdGFnID0gYy5zb3VyY2UgPT09ICdzZXNzaW9uJyA/ICdbc10nIDogJ1t3XSdcbiAgICAgICAgbGluZXMucHVzaChgLSAke3RhZ30gJHtwYXRofSR7YW5jaG9yfTogJHtjLnRleHR9YClcbiAgICAgIH1cbiAgICAgIGNvbnN0IGh1bmtzID0gaHVua3NGb3JMaW5lcyhwZW5kaW5nLmRpZmZzW3BhdGhdID8/ICcnLCBsaXN0Lm1hcCgoYykgPT4gYy5saW5lTmV3ID8/IGMubGluZU9sZCkpXG4gICAgICBpZiAoaHVua3MpIHtcbiAgICAgICAgbGluZXMucHVzaCgnYGBgZGlmZicpXG4gICAgICAgIGxpbmVzLnB1c2goaHVua3MpXG4gICAgICAgIGxpbmVzLnB1c2goJ2BgYCcpXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICBpZiAocmV2aWV3UGVuZGluZyAmJiBwZW5kaW5nLnJldmlldykge1xuICAgICAgbGluZXMucHVzaCgnIyMgQUkgXHU4QkM0XHU1QkExXHU3RUQzXHU4QkJBJylcbiAgICAgIGxpbmVzLnB1c2gocGVuZGluZy5yZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnXHU4ODY1XHU0RTAxXHU1QjU4XHU1NzI4XHU5NUVFXHU5ODk4XHVGRjA4UGF0Y2ggaXMgaW5jb3JyZWN0XHVGRjA5JyA6ICdcdTg4NjVcdTRFMDFcdTZCNjNcdTc4NkVcdUZGMDhQYXRjaCBpcyBjb3JyZWN0XHVGRjA5JylcbiAgICAgIGZvciAoY29uc3QgZiBvZiBwZW5kaW5nLnJldmlldy5maW5kaW5ncykge1xuICAgICAgICBsaW5lcy5wdXNoKGAtIFske2YucHJpb3JpdHl9XSAke2YuZmlsZX06JHtmLmxpbmVTdGFydH0ke2YubGluZUVuZCAhPT0gZi5saW5lU3RhcnQgPyBgLSR7Zi5saW5lRW5kfWAgOiAnJ30gJHtmLnRpdGxlfSBcdTIwMTQgJHtmLmRldGFpbH1gKVxuICAgICAgICBpZiAoZi5zdWdnZXN0aW9uKSBsaW5lcy5wdXNoKGAgIFxcYFxcYFxcYFxcbiR7Zi5zdWdnZXN0aW9ufVxcbiAgXFxgXFxgXFxgYClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpLnNsaWNlKDAsIDE2MDAwKVxuICB9XG5cbiAgLyoqIE1hcmsgdGhlIGNhcnJpZWQgaXRlbXMgYXMgc2VudCBzbyB0aGV5IGFyZSBuZXZlciByZS1zZW50IChwZXJzaXN0ZWQgcGVyIGN3ZCkuICovXG4gIGNvbnN0IG1hcmtTZW50ID0gKCkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBjb25zdCBjYXJyaWVkSWRzID0gdW5zZW50Q29tbWVudHMubWFwKChjKSA9PiBjLmlkKVxuICAgIHNlbnRTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGNvbnN0IHByZXYgPSBkW2N3ZF0gPz8geyBzZW50Q29tbWVudElkczogW10sIHNlbnRSZXZpZXdLZXk6IG51bGwgfVxuICAgICAgZFtjd2RdID0ge1xuICAgICAgICBzZW50Q29tbWVudElkczogWy4uLm5ldyBTZXQoWy4uLnByZXYuc2VudENvbW1lbnRJZHMsIC4uLmNhcnJpZWRJZHNdKV0sXG4gICAgICAgIHNlbnRSZXZpZXdLZXk6IHJldmlld1BlbmRpbmcgPyByZXZpZXdLZXkgOiBwcmV2LnNlbnRSZXZpZXdLZXksXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKiBTZW5kIHRoZSBwZW5kaW5nIHJldmlldyBwYWNrYWdlIG5vdyAoZXhwbGljaXQgY2xpY2sgb25seSBcdTIwMTQgbmV2ZXIgYXV0by1jYXJyaWVkKS4gKi9cbiAgY29uc3QgY2FycnkgPSAoKSA9PiB7XG4gICAgaWYgKCFoYXNQZW5kaW5nIHx8IGNhcnJ5aW5nLmN1cnJlbnQpIHJldHVyblxuICAgIGNhcnJ5aW5nLmN1cnJlbnQgPSB0cnVlXG4gICAgdm9pZCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIHNlc3Npb25JZCwgY29tcG9zZUNhcnJpZWRNZXNzYWdlKCkpLnRoZW4oKG91dGNvbWUpID0+IHtcbiAgICAgIGlmIChvdXRjb21lICE9PSAnZmFpbGVkJykgbWFya1NlbnQoKVxuICAgICAgY2FycnlpbmcuY3VycmVudCA9IGZhbHNlXG4gICAgICBzZXRDYXJyeUZsYXNoKG91dGNvbWUgPT09ICdzZW50JyA/IHQoJ3Jldmlldy5zZW50VG9BZ2VudCcpIDogb3V0Y29tZSA9PT0gJ2NvcGllZCcgPyB0KCdyZXZpZXcuY29waWVkRmFsbGJhY2snKSA6IHQoJ3Jldmlldy5zZW5kRmFpbGVkJykpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENhcnJ5Rmxhc2gobnVsbCksIDMyMDApXG4gICAgfSlcbiAgfVxuXG4gIGlmICghY3dkIHx8ICghaGFzUGVuZGluZyAmJiAhY2FycnlGbGFzaCkgfHwgZGlzbWlzc2VkKSByZXR1cm4gbnVsbFxuXG4gIC8qKiBPcGVuIHRoZSByZXZpZXcgcGFuZWwgYXQgdGhlIGNvbW1lbnQncyBjaGFuZ2UgYmxvY2suICovXG4gIGNvbnN0IGZvY3VzQ29tbWVudCA9IChjb21tZW50OiBSZXZpZXdDb21tZW50KSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQuZm9jdXMgPSB7XG4gICAgICAgIHBhdGg6IGNvbW1lbnQucGF0aCxcbiAgICAgICAgbGluZTogY29tbWVudC5saW5lTmV3ID8/IGNvbW1lbnQubGluZU9sZCA/PyB1bmRlZmluZWQsXG4gICAgICAgIHRhYjogY29tbWVudC5zb3VyY2UgPT09ICdzZXNzaW9uJyA/ICdzZXNzaW9uJyA6ICd3b3Jrc3BhY2UnLFxuICAgICAgfVxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgLyoqIE9wZW4gdGhlIHJldmlldyBwYW5lbCB3aXRob3V0IGEganVtcCB0YXJnZXQgKCtOIGNoaXApLiAqL1xuICBjb25zdCBvcGVuUGFuZWwgPSAoKSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gdHJ1ZVxuICAgICAgZC5jd2QgPSBjd2RcbiAgICAgIGQuZm9jdXMgPSBudWxsXG4gICAgICBkLmtleSA9IGQua2V5ICsgMVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kb2NrXCI+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItZG9jay1oZWFkXCJcbiAgICAgICAgcm9sZT1cImJ1dHRvblwiXG4gICAgICAgIHRhYkluZGV4PXswfVxuICAgICAgICB0aXRsZT17dCgncmV2aWV3LmRvY2tTZW5kJyl9XG4gICAgICAgIG9uQ2xpY2s9e2NhcnJ5fVxuICAgICAgICBvbktleURvd249eyhlKSA9PiB7XG4gICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInIHx8IGUua2V5ID09PSAnICcpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgY2FycnkoKVxuICAgICAgICAgIH1cbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWljb25cIj48SWNvbkNvbW1lbnQgLz48L3NwYW4+XG4gICAgICAgIHtjYXJyeUZsYXNoID8gKFxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1mbGFzaFwiPntjYXJyeUZsYXNofTwvc3Bhbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY291bnRcIj5cbiAgICAgICAgICAgIHt0KCdyZXZpZXcuZG9ja0NvbW1lbnRzJywgeyBuOiB1bnNlbnRDb21tZW50cy5sZW5ndGggfSl9XG4gICAgICAgICAgICB7cmV2aWV3UGVuZGluZyA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmRvY2tWZXJkaWN0Jyl9YCA6ICcnfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKX1cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stc2VuZC1oaW50XCI+e3QoJ3Jldmlldy5kb2NrU2VuZCcpfTwvc3Bhbj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZG9jay1jbG9zZVwiXG4gICAgICAgICAgYXJpYS1sYWJlbD17dCgnY29tbWVudC5jYW5jZWwnKX1cbiAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0RGlzbWlzc2VkKHRydWUpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxJY29uWCAvPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAge3Vuc2VudENvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNoaXBzXCI+XG4gICAgICAgICAge3Vuc2VudENvbW1lbnRzLnNsaWNlKDAsIE1BWF9ET0NLX0NISVBTKS5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAga2V5PXtjb21tZW50LmlkfVxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNoaXBcIlxuICAgICAgICAgICAgICB0aXRsZT17dCgncmV2aWV3LmRvY2tKdW1wJyl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGZvY3VzQ29tbWVudChjb21tZW50KX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNoaXAtbG9jXCI+e2NvbW1lbnQucGF0aH17Y29tbWVudC5saW5lTmV3ICE9PSBudWxsID8gYDoke2NvbW1lbnQubGluZU5ld31gIDogJyd9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2hpcC10ZXh0XCI+e2NvbW1lbnQudGV4dH08L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgICB7dW5zZW50Q29tbWVudHMubGVuZ3RoID4gTUFYX0RPQ0tfQ0hJUFMgPyAoXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2hpcC1tb3JlXCIgdGl0bGU9e3QoJ3Jldmlldy5kb2NrTW9yZScsIHsgbjogdW5zZW50Q29tbWVudHMubGVuZ3RoIC0gTUFYX0RPQ0tfQ0hJUFMgfSl9IG9uQ2xpY2s9e29wZW5QYW5lbH0+XG4gICAgICAgICAgICAgICt7dW5zZW50Q29tbWVudHMubGVuZ3RoIC0gTUFYX0RPQ0tfQ0hJUFN9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJldmlldyBvdmVybGF5IChyb290IHNjb3BlKTogc2Vzc2lvbiArIHdvcmtzcGFjZSB0YWJzLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdPdmVybGF5KHsgc2Vzc2lvbnMsIHQgfTogRGlmZlJldmlld092ZXJsYXlQcm9wcykge1xuICBjb25zdCBzdG9yZVN0YXRlID0gdXNlU3luY0V4dGVybmFsU3RvcmUob3ZlcmxheVN0b3JlLnN1YnNjcmliZSwgb3ZlcmxheVN0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICAvLyBHaXQtZmlyc3Q6IGxhbmQgb24gdGhlIHdvcmtzcGFjZSB0YWIgKHN0YWdlZC91bnN0YWdlZC9icmFuY2ggdHJlZXMpIHNvIHRoZVxuICAvLyBjaGFuZ2UgcmV2aWV3IGlzIG9uZSBjbGljayBhd2F5OyB0aGUgc2Vzc2lvbiB0YWIgc3RheXMgYSBjbGljayBhd2F5LlxuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gdXNlU3RhdGU8J3Nlc3Npb24nIHwgJ3dvcmtzcGFjZSc+KCd3b3Jrc3BhY2UnKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSB1c2VTdGF0ZTxWaWV3TW9kZT4oKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGxvY2FsU3RvcmFnZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2RzZHItdmlldycpID09PSAnc3BsaXQnID8gJ3NwbGl0JyA6ICdzaW5nbGUnXG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gJ3NpbmdsZSdcbiAgICB9XG4gIH0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkc2RyLXZpZXcnLCB2aWV3KVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gcHJpdmF0ZSBtb2RlIC8gdW5hdmFpbGFibGUgXHUyMDE0IG5vbi1mYXRhbFxuICAgIH1cbiAgfSwgW3ZpZXddKVxuXG4gIC8vIFdvcmtzcGFjZSB0YWIgc3RhdGUuXG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSB1c2VTdGF0ZTxTdGF0dXNSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtub3RpY2UsIHNldE5vdGljZV0gPSB1c2VTdGF0ZTx7IGtpbmQ6ICdvaycgfCAnZXJyb3InOyB0ZXh0OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb25maXJtLCBzZXRDb25maXJtXSA9IHVzZVN0YXRlPCdmaWxlJyB8ICdhbGwnIHwgJ3B1c2gnIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdE1lc3NhZ2UsIHNldENvbW1pdE1lc3NhZ2VdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjb21taXRPcGVuLCBzZXRDb21taXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaW5jbHVkZVVuc3RhZ2VkLCBzZXRJbmNsdWRlVW5zdGFnZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIC8vIExvY2FsICh1bnB1c2hlZCkgY29tbWl0IGhpc3Rvcnk6IGxpc3QgKyBwZXItY29tbWl0IGRpZmYgdmlldy5cbiAgY29uc3QgW2hpc3RvcnksIHNldEhpc3RvcnldID0gdXNlU3RhdGU8Q29tbWl0SW5mb1tdPihbXSlcbiAgY29uc3QgW3NlbGVjdGVkQ29tbWl0LCBzZXRTZWxlY3RlZENvbW1pdF0gPSB1c2VTdGF0ZTxDb21taXRJbmZvIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdERpZmYsIHNldENvbW1pdERpZmZdID0gdXNlU3RhdGU8Q29tbWl0RGlmZlJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbW1pdERpZmZMb2FkaW5nLCBzZXRDb21taXREaWZmTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbGVjdGVkQ29tbWl0RmlsZSwgc2V0U2VsZWN0ZWRDb21taXRGaWxlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIC8vIElubGluZSByZXZpZXcgY29tbWVudHMgKHdvcmtzcGFjZSB0YWIsIHNpbmdsZSB2aWV3KS5cbiAgY29uc3QgW2NvbW1lbnRzLCBzZXRDb21tZW50c10gPSB1c2VTdGF0ZTxSZXZpZXdDb21tZW50W10+KFtdKVxuICBjb25zdCBbY29tbWVudEVkaXRvciwgc2V0Q29tbWVudEVkaXRvcl0gPSB1c2VTdGF0ZTx7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21tZW50VGV4dCwgc2V0Q29tbWVudFRleHRdID0gdXNlU3RhdGUoJycpXG4gIC8vIFJldmlldyBzY29wZTogd2hpY2ggc2xpY2Ugb2YgdGhlIHJlcG9zaXRvcnkgdGhlIHdvcmtzcGFjZSB0YWIgc2hvd3MuXG4gIGNvbnN0IFtzY29wZSwgc2V0U2NvcGVdID0gdXNlU3RhdGU8V29ya3NwYWNlU2NvcGU+KCdsYXN0LXR1cm4nKVxuICBjb25zdCBbYnJhbmNoZXMsIHNldEJyYW5jaGVzXSA9IHVzZVN0YXRlPHN0cmluZ1tdPihbXSlcbiAgY29uc3QgW2Jhc2VCcmFuY2gsIHNldEJhc2VCcmFuY2hdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2Jhc2VTdGF0dXMsIHNldEJhc2VTdGF0dXNdID0gdXNlU3RhdGU8U3RhdHVzUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICAvLyBGZWVkYmFjayBsb29wOiBzZW5kIGlubGluZSBjb21tZW50cyB0byB0aGUgYWdlbnQgKHNlc3Npb24ucHJvbXB0LCBjb3B5IGZhbGxiYWNrKS5cbiAgY29uc3QgW3NlbmRPcGVuLCBzZXRTZW5kT3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbmRUZXh0LCBzZXRTZW5kVGV4dF0gPSB1c2VTdGF0ZSgnJylcbiAgLy8gQUkgcmV2aWV3ICgvcmV2aWV3KTogZmluZGluZ3MgKyB2ZXJkaWN0LlxuICBjb25zdCBbcmV2aWV3LCBzZXRSZXZpZXddID0gdXNlU3RhdGU8UmV2aWV3UmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbcmV2aWV3aW5nLCBzZXRSZXZpZXdpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIC8vIEdpdEh1YiBQUiBjb250ZXh0IChnaCBDTEkpLlxuICBjb25zdCBbcHIsIHNldFByXSA9IHVzZVN0YXRlPFByUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICAvLyBNdWx0aS1yZXBvOiByZXBvcyBkZXRlY3RlZCB1bmRlciB0aGUgd29ya3NwYWNlICsgdGhlIHNlbGVjdGVkIG9uZS5cbiAgY29uc3QgW3JlcG9zLCBzZXRSZXBvc10gPSB1c2VTdGF0ZTx7IHBhdGg6IHN0cmluZzsgYnJhbmNoOiBzdHJpbmcgfCBudWxsIH1bXT4oW10pXG4gIGNvbnN0IFtyZXBvUGF0aCwgc2V0UmVwb1BhdGhdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3N1cmZhY2UsIHNldFN1cmZhY2VdID0gdXNlU3RhdGU8J3JldmlldycgfCAnZmlsZXMnPigncmV2aWV3JylcbiAgLy8gVGVtcG9yYXJ5IGxpbmUgaGlnaGxpZ2h0IChqdW1wIHRhcmdldCBmcm9tIGEgUFIgY29tbWVudCBvciBhIGZpbmRpbmcpLlxuICBjb25zdCBbanVtcExpbmUsIHNldEp1bXBMaW5lXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpXG5cbiAgLyoqIFNlbGVjdCBhIGZpbGUgYW5kIGZsYXNoIGl0cyBsaW5lIChmaW5kaW5ncyAvIFBSIGNvbW1lbnRzKS4gKi9cbiAgY29uc3QganVtcFRvID0gKGZpbGU6IHN0cmluZywgbGluZT86IG51bWJlcikgPT4ge1xuICAgIHNldFNlbGVjdGVkKGZpbGUpXG4gICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgc2V0SnVtcExpbmUobGluZSA/PyBudWxsKVxuICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0SnVtcExpbmUobnVsbCksIDI1MDApXG4gIH1cbiAgLy8gQ29sbGFwc2VkIGRpcmVjdG9yaWVzIGluIHRoZSBsZWZ0LWhhbmQgZmlsZSB0cmVlIChzaGFyZWQgYWNyb3NzIHRhYnMpLlxuICBjb25zdCBbY29sbGFwc2VkRGlycywgc2V0Q29sbGFwc2VkRGlyc10gPSB1c2VTdGF0ZTxSZWFkb25seVNldDxzdHJpbmc+PigoKSA9PiBuZXcgU2V0KCkpXG4gIGNvbnN0IHRvZ2dsZURpciA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKHBhdGg6IHN0cmluZykgPT4ge1xuICAgICAgc2V0Q29sbGFwc2VkRGlycygocHJldikgPT4ge1xuICAgICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChwcmV2KVxuICAgICAgICBpZiAobmV4dC5oYXMocGF0aCkpIG5leHQuZGVsZXRlKHBhdGgpXG4gICAgICAgIGVsc2UgbmV4dC5hZGQocGF0aClcbiAgICAgICAgcmV0dXJuIG5leHRcbiAgICAgIH0pXG4gICAgfSxcbiAgICBbXSxcbiAgKVxuICBjb25zdCBub3RpY2VUaW1lciA9IHVzZVJlZjxSZXR1cm5UeXBlPHR5cGVvZiBzZXRUaW1lb3V0PiB8IHVuZGVmaW5lZD4odW5kZWZpbmVkKVxuXG4gIC8vIEN1cnJlbnQgc2Vzc2lvbidzIGNvbnZlcnNhdGlvbiBzbmFwc2hvdCAocmVhY3RpdmUpLCBmb3IgdGhlIHNlc3Npb24gdGFiLlxuICBjb25zdCBjdXJyZW50SWQgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShcbiAgICB1c2VNZW1vKCgpID0+IChub3RpZnk6ICgpID0+IHZvaWQpID0+IHNlc3Npb25zLmxpc3Quc3Vic2NyaWJlKG5vdGlmeSksIFtzZXNzaW9uc10pLFxuICAgIHVzZU1lbW8oKCkgPT4gKCkgPT4gc2Vzc2lvbnMubGlzdC5nZXRTbmFwc2hvdCgpLmN1cnJlbnQsIFtzZXNzaW9uc10pLFxuICApXG4gIGNvbnN0IHNuYXBzaG90ID0gdXNlU3luY0V4dGVybmFsU3RvcmUoXG4gICAgdXNlTWVtbygoKSA9PiB7XG4gICAgICByZXR1cm4gKG5vdGlmeTogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gY3VycmVudElkID8gc2Vzc2lvbnMuYmluZGluZyhjdXJyZW50SWQpIDogdW5kZWZpbmVkXG4gICAgICAgIGlmICghYmluZGluZykgcmV0dXJuICgpID0+IHt9XG4gICAgICAgIHJldHVybiBiaW5kaW5nLnNlc3Npb24uc3Vic2NyaWJlKG5vdGlmeSlcbiAgICAgIH1cbiAgICB9LCBbc2Vzc2lvbnMsIGN1cnJlbnRJZF0pLFxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IGN1cnJlbnRJZCA/IHNlc3Npb25zLmJpbmRpbmcoY3VycmVudElkKSA6IHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gYmluZGluZyA/IGJpbmRpbmcuc2Vzc2lvbi5nZXRTbmFwc2hvdCgpIDogbnVsbFxuICAgICAgfVxuICAgIH0sIFtzZXNzaW9ucywgY3VycmVudElkXSksXG4gIClcblxuICBjb25zdCByb3VuZHMgPSB1c2VNZW1vKCgpID0+IChzbmFwc2hvdCA/IGNvbGxlY3RTZXNzaW9uUm91bmRzKHNuYXBzaG90Lm5vZGVzKSA6IFtdKSwgW3NuYXBzaG90XSlcbiAgLy8gRGlhZ25vc3RpY3MgZm9yIHRoZSBlbXB0eSBzZXNzaW9uLWNoYW5nZXMgc3RhdGU6IHdoYXQgdGhlIHNuYXBzaG90IHNjYW4gZm91bmQuXG4gIGNvbnN0IHNlc3Npb25TY2FuID0gdXNlTWVtbygoKSA9PiB7XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuIG51bGxcbiAgICBsZXQgcmVzdWx0cyA9IDBcbiAgICBsZXQgZGlmZkNhcmRzID0gMFxuICAgIGxldCBwYXRoT25seSA9IDBcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygc25hcHNob3Qubm9kZXMpIHtcbiAgICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcpIGNvbnRpbnVlXG4gICAgICByZXN1bHRzKytcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKVxuICAgICAgaWYgKGNoYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoY2hhbmdlcy5zb21lKCh4KSA9PiB4Lmhhc0RpZmYpKSBkaWZmQ2FyZHMrK1xuICAgICAgICBlbHNlIHBhdGhPbmx5KytcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgcmVzdWx0cywgZGlmZkNhcmRzLCBwYXRoT25seSB9XG4gIH0sIFtzbmFwc2hvdF0pXG4gIC8vIExlZnQtaGFuZCBmaWxlIHRyZWVzOiBwZXItcm91bmQgdHJlZXMgZm9yIHRoZSBzZXNzaW9uIHRhYiwgb25lIHRyZWUgZm9yXG4gIC8vIHRoZSBnaXQgd29ya2luZyB0cmVlIG9uIHRoZSB3b3Jrc3BhY2UgdGFiLlxuICBjb25zdCBzZXNzaW9uVHJlZXMgPSB1c2VNZW1vKCgpID0+IG5ldyBNYXAocm91bmRzLm1hcCgocikgPT4gW3Iucm91bmQsIGJ1aWxkRmlsZVRyZWUoci5jaGFuZ2VzLCAoYykgPT4gYy5wYXRoKV0pKSwgW3JvdW5kc10pXG4gIGNvbnN0IHRvdGFsU2Vzc2lvbkZpbGVzID0gdXNlTWVtbygoKSA9PiByb3VuZHMucmVkdWNlKChuLCByKSA9PiBuICsgci5jaGFuZ2VzLmxlbmd0aCwgMCksIFtyb3VuZHNdKVxuICBjb25zdCBbc2VsZWN0ZWRSb3VuZCwgc2V0U2VsZWN0ZWRSb3VuZF0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICBjb25zdCBbc2VsZWN0ZWRQYXRoLCBzZXRTZWxlY3RlZFBhdGhdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRDaGFuZ2UgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCByb3VuZCA9IHJvdW5kcy5maW5kKChyKSA9PiByLnJvdW5kID09PSBzZWxlY3RlZFJvdW5kKVxuICAgIHJldHVybiByb3VuZD8uY2hhbmdlcy5maW5kKChjKSA9PiBjLnBhdGggPT09IHNlbGVjdGVkUGF0aCkgPz8gbnVsbFxuICB9LCBbcm91bmRzLCBzZWxlY3RlZFJvdW5kLCBzZWxlY3RlZFBhdGhdKVxuICAvKiogTGFzdCBUdXJuIGlzIHNvdXJjZWQgZnJvbSBwZXJzaXN0ZWQgc2Vzc2lvbiBkaWZmcywgbm90IHRoZSBhY3RpdmUgZ2l0IHJlcG8uICovXG4gIGNvbnN0IGxhc3RUdXJuRmlsZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCBsYXN0ID0gcm91bmRzLmF0KC0xKVxuICAgIHJldHVybiBsYXN0ID8gbGFzdC5jaGFuZ2VzLmZpbHRlcigoY2hhbmdlKSA9PiBjaGFuZ2UuaGFzRGlmZikubWFwKHNlc3Npb25DaGFuZ2VUb0RpZmZGaWxlKSA6IFtdXG4gIH0sIFtyb3VuZHNdKVxuXG4gIGNvbnN0IGN3ZCA9IHN0b3JlU3RhdGUuY3dkXG4gIC8qKiBBY3RpdmUgZ2l0IHJlcG8gZm9yIHdvcmtzcGFjZSBvcGVyYXRpb25zIChtdWx0aS1yZXBvIHNlbGVjdG9yIG92ZXJyaWRlKS4gKi9cbiAgY29uc3QgYWN0aXZlQ3dkID0gcmVwb1BhdGggPz8gY3dkXG5cbiAgY29uc3QgbG9hZFdvcmtzcGFjZSA9IGFzeW5jIChzaWxlbnQgPSBmYWxzZSkgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAoIXNpbGVudCkgc2V0TG9hZGluZyh0cnVlKVxuICAgIHNldEVycm9yKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IFtuZXh0LCBoaXN0LCBuZXh0Q29tbWVudHMsIGJyYW5jaExpc3QsIHByRGF0YSwgcmVwb0xpc3RdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBsb2FkU3RhdHVzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRIaXN0b3J5KGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRDb21tZW50cyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkQnJhbmNoZXMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZFByKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRSZXBvcyhhY3RpdmVDd2QpLFxuICAgICAgXSlcbiAgICAgIHNldFN0YXR1cyhuZXh0KVxuICAgICAgaWYgKGhpc3Qub2spIHNldEhpc3RvcnkoaGlzdC5jb21taXRzKVxuICAgICAgc2V0Q29tbWVudHMobmV4dENvbW1lbnRzKVxuICAgICAgc2V0QnJhbmNoZXMoYnJhbmNoTGlzdClcbiAgICAgIHNldFByKHByRGF0YSlcbiAgICAgIHNldFJlcG9zKHJlcG9MaXN0LnJlcG9zKVxuICAgICAgLy8gRGVmYXVsdCB0aGUgcmVwbyBzZWxlY3RvciB0byB0aGUgd29ya3NwYWNlIHJvb3Qgd2hlbiBpdCBpcyBpdHNlbGYgYSByZXBvLlxuICAgICAgaWYgKHJlcG9QYXRoID09PSBudWxsICYmICFyZXBvTGlzdC5yZXBvcy5zb21lKChyKSA9PiByLnBhdGggPT09IGFjdGl2ZUN3ZCkpIHtcbiAgICAgICAgY29uc3QgZmlyc3QgPSByZXBvTGlzdC5yZXBvc1swXVxuICAgICAgICBpZiAoZmlyc3QgJiYgZmlyc3QucGF0aCAhPT0gY3dkKSBzZXRSZXBvUGF0aChmaXJzdC5wYXRoKVxuICAgICAgfVxuICAgICAgaWYgKG5leHQuZXJyb3IgJiYgIW5leHQuaXNSZXBvKSBzZXRFcnJvcihuZXh0LmVycm9yKVxuICAgICAgc2V0U2VsZWN0ZWQoKHByZXYpID0+IChwcmV2ICYmIG5leHQuZmlsZXMuc29tZSgoZikgPT4gZi5wYXRoID09PSBwcmV2KSA/IHByZXYgOiBuZXh0LmZpbGVzWzBdPy5wYXRoID8/IG51bGwpKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldEVycm9yKGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IFN0cmluZyhlKSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyBBdXRvLXJlZnJlc2ggdGhlIHdvcmtzcGFjZSBkYXRhOiByZWxvYWQgd2hlbmV2ZXIgdGhlIHRhYiBiZWNvbWVzIGFjdGl2ZSBvclxuICAvLyB0aGUgd29ya3NwYWNlIGNoYW5nZXMsIGFuZCBwZXJpb2RpY2FsbHkgd2hpbGUgdGhlIG92ZXJsYXkgaXMgb3Blbi4gQVxuICAvLyB3b3Jrc3BhY2Ugc3dpdGNoIGNsZWFycyBzdGFsZSBjb21taXQgc2VsZWN0aW9uIGFuZCBoaXN0b3J5IGZpcnN0LlxuICBjb25zdCB3b3Jrc3BhY2VDd2RSZWYgPSB1c2VSZWY8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBwcmV2aW91cyA9IHdvcmtzcGFjZUN3ZFJlZi5jdXJyZW50XG4gICAgd29ya3NwYWNlQ3dkUmVmLmN1cnJlbnQgPSBhY3RpdmVDd2QgPz8gbnVsbFxuICAgIGlmICh0YWIgIT09ICd3b3Jrc3BhY2UnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGlmIChwcmV2aW91cyAhPT0gYWN0aXZlQ3dkKSB7XG4gICAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgICBzZXRIaXN0b3J5KFtdKVxuICAgICAgc2V0Q29tbWVudHMoW10pXG4gICAgICBzZXRDb21tZW50RWRpdG9yKG51bGwpXG4gICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgIHNldFByKG51bGwpXG4gICAgfVxuICAgIHZvaWQgbG9hZFdvcmtzcGFjZSgpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbdGFiLCBhY3RpdmVDd2RdKVxuXG4gIC8vIFN1cmZhY2Ugd29ya3NwYWNlIGNvbW1lbnRzIGFib3ZlIHRoZSBjb21wb3NlciAoQ29kZXgtc3R5bGUgZG9jayksIGFsb25nXG4gIC8vIHdpdGggdGhlIGRpZmYgY29udGV4dCBhbmQgdGhlIGxhc3QgQUkgcmV2aWV3IHJlc3VsdC5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBwZW5kaW5nQ29tbWVudHNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQuY3dkID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICAgIGQuY29tbWVudHMgPSBjb21tZW50c1xuICAgICAgY29uc3QgZGlmZnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fVxuICAgICAgZm9yIChjb25zdCBjIG9mIGNvbW1lbnRzKSB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBzdGF0dXM/LmZpbGVzLmZpbmQoKGYpID0+IGYucGF0aCA9PT0gYy5wYXRoKVxuICAgICAgICBpZiAoZmlsZT8uZGlmZikgZGlmZnNbYy5wYXRoXSA9IGZpbGUuZGlmZlxuICAgICAgfVxuICAgICAgZC5kaWZmcyA9IGRpZmZzXG4gICAgICBkLnJldmlldyA9IHJldmlld1xuICAgIH0pXG4gIH0sIFtjb21tZW50cywgYWN0aXZlQ3dkLCBzdGF0dXMsIHJldmlld10pXG5cbiAgLy8gSnVtcCB0byBhIGNoYW5nZSBibG9jayBmcm9tIHRoZSBjb21wb3NlciBkb2NrIChjb21tZW50IGNsaWNrKS4gQ29tbWVudHNcbiAgLy8gY3JlYXRlZCBpbiB0aGUgc2Vzc2lvbiB0YWIgYW5jaG9yIHRvIFJFTEFUSVZFIGh1bmsgbGluZXMsIHNvIHRob3NlIGp1bXBzXG4gIC8vIHN0YXkgaW4gdGhlIHNlc3Npb24gdGFiOyB3b3Jrc3BhY2UgY29tbWVudHMganVtcCB0byByZWFsIGZpbGUgbGluZXMuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZm9jdXMgPSBzdG9yZVN0YXRlLmZvY3VzXG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4gfHwgIWN3ZCB8fCAhZm9jdXMpIHJldHVyblxuICAgIGlmIChmb2N1cy50YWIgPT09ICdzZXNzaW9uJykge1xuICAgICAgLy8gUmVwbHkgY2FyZHMgYWx3YXlzIG9wZW4gdGhlIHNhbWUgTGFzdCBUdXJuIHZpZXc7IGl0IGlzIGludGVudGlvbmFsbHlcbiAgICAgIC8vIGluZGVwZW5kZW50IGZyb20gdGhlIGFjdGl2ZSBHaXQgcmVwb3NpdG9yeSBzZWxlY3Rpb24uXG4gICAgICBzZXRUYWIoJ3dvcmtzcGFjZScpXG4gICAgICBzZXRTY29wZSgnbGFzdC10dXJuJylcbiAgICAgIHNldFNlbGVjdGVkKGZvY3VzLnBhdGgpXG4gICAgICBzZXRKdW1wTGluZShmb2N1cy5saW5lID8/IG51bGwpXG4gICAgICBjb25zdCBzY3JvbGxUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoZm9jdXMubGluZSAhPSBudWxsKSB7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtZHNkci1saW5lPVwiJHtmb2N1cy5saW5lfVwiXWApPy5zY3JvbGxJbnRvVmlldyh7IGJsb2NrOiAnY2VudGVyJywgYmVoYXZpb3I6ICdzbW9vdGgnIH0pXG4gICAgICAgIH1cbiAgICAgIH0sIDgwKVxuICAgICAgY29uc3QgY2xlYXJUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gc2V0SnVtcExpbmUobnVsbCksIDI1MDApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZXIpXG4gICAgICAgIGNsZWFyVGltZW91dChjbGVhclRpbWVyKVxuICAgICAgfVxuICAgIH1cbiAgICBzZXRUYWIoJ3dvcmtzcGFjZScpXG4gICAgc2V0U2VsZWN0ZWQoZm9jdXMucGF0aClcbiAgICBzZXRKdW1wTGluZShmb2N1cy5saW5lID8/IG51bGwpXG4gICAgY29uc3Qgc2Nyb2xsVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmIChmb2N1cy5saW5lICE9IG51bGwpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtZHNkci1saW5lPVwiJHtmb2N1cy5saW5lfVwiXWApPy5zY3JvbGxJbnRvVmlldyh7IGJsb2NrOiAnY2VudGVyJywgYmVoYXZpb3I6ICdzbW9vdGgnIH0pXG4gICAgICB9XG4gICAgfSwgODApXG4gICAgY29uc3QgY2xlYXJUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4gc2V0SnVtcExpbmUobnVsbCksIDI1MDApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dChzY3JvbGxUaW1lcilcbiAgICAgIGNsZWFyVGltZW91dChjbGVhclRpbWVyKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzdG9yZVN0YXRlLmtleV0pXG5cbiAgLy8gS2VlcCBzdGFnZWQvdW5zdGFnZWQvaGlzdG9yeSBmcmVzaCB3aGlsZSB0aGUgd29ya3NwYWNlIHRhYiBpcyBvcGVuLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8IHRhYiAhPT0gJ3dvcmtzcGFjZScgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgY29uc3QgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICB2b2lkIGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICB9LCAxNTAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbCh0aW1lcilcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW4sIHRhYiwgYWN0aXZlQ3dkXSlcblxuICAvLyBCcmFuY2ggc2NvcGU6IGRpZmYgdGhlIHdvcmt0cmVlIGFnYWluc3QgdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAvLyBEZWZhdWx0IHRoZSBiYXNlIHRvIHRoZSBmaXJzdCBicmFuY2ggdGhhdCBpc24ndCB0aGUgY3VycmVudCBvbmUuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNjb3BlICE9PSAnYnJhbmNoJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBjb25zdCBjdXJyZW50ID0gc3RhdHVzPy5icmFuY2ggPz8gbnVsbFxuICAgIGlmIChiYXNlQnJhbmNoID09PSBudWxsICYmIGJyYW5jaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZhbGxiYWNrID0gYnJhbmNoZXMuZmluZCgoYikgPT4gYiAhPT0gY3VycmVudCkgPz8gYnJhbmNoZXNbMF1cbiAgICAgIHNldEJhc2VCcmFuY2goZmFsbGJhY2spXG4gICAgfVxuICB9LCBbc2NvcGUsIGFjdGl2ZUN3ZCwgYnJhbmNoZXMsIGJhc2VCcmFuY2gsIHN0YXR1cz8uYnJhbmNoXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzY29wZSAhPT0gJ2JyYW5jaCcgfHwgIWFjdGl2ZUN3ZCB8fCAhYmFzZUJyYW5jaCkge1xuICAgICAgc2V0QmFzZVN0YXR1cyhudWxsKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZVxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1NUQVRVU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChhY3RpdmVDd2QpfSZiYXNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGJhc2VCcmFuY2gpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gICAgICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCkpIGFzIFN0YXR1c1Jlc3BvbnNlIHwgbnVsbFxuICAgICAgaWYgKCFjYW5jZWxsZWQgJiYgZGF0YSkge1xuICAgICAgICBzZXRCYXNlU3RhdHVzKGRhdGEpXG4gICAgICAgIGlmIChkYXRhLmVycm9yICYmIGJhc2VTdGF0dXM/LmVycm9yICE9PSBkYXRhLmVycm9yKSBzZXRFcnJvcihkYXRhLmVycm9yKVxuICAgICAgfVxuICAgIH0pKClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2FuY2VsbGVkID0gdHJ1ZVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtzY29wZSwgYWN0aXZlQ3dkLCBiYXNlQnJhbmNoXSlcblxuICAvLyBEZWZhdWx0IHNlbGVjdGlvbiBmb3IgdGhlIHNlc3Npb24gdGFiIGZvbGxvd3MgdGhlIGZpcnN0IHJvdW5kIHdpdGggY2hhbmdlcy5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWRSb3VuZCA9PT0gbnVsbCAmJiByb3VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgc2V0U2VsZWN0ZWRSb3VuZChyb3VuZHNbMF0ucm91bmQpXG4gICAgICBzZXRTZWxlY3RlZFBhdGgocm91bmRzWzBdLmNoYW5nZXNbMF0/LnBhdGggPz8gbnVsbClcbiAgICB9XG4gIH0sIFtyb3VuZHMsIHNlbGVjdGVkUm91bmRdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzdG9yZVN0YXRlLm9wZW4pIHJldHVyblxuICAgIGNvbnN0IG9uS2V5ID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ID09PSAnRXNjYXBlJykge1xuICAgICAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5KVxuICAgIHJldHVybiAoKSA9PiBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gIH0sIFtzdG9yZVN0YXRlLm9wZW5dKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFub3RpY2UpIHJldHVyblxuICAgIG5vdGljZVRpbWVyLmN1cnJlbnQgPSBzZXRUaW1lb3V0KCgpID0+IHNldE5vdGljZShudWxsKSwgMzAwMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KG5vdGljZVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtub3RpY2VdKVxuXG4gIGNvbnN0IGZpbGVzID0gc3RhdHVzPy5pc1JlcG8gPyBzdGF0dXMuZmlsZXMgOiBbXVxuICBjb25zdCBzdGFnZWRGaWxlcyA9IHVzZU1lbW8oKCkgPT4gZmlsZXMuZmlsdGVyKChmKSA9PiBmLnN0YWdlZCksIFtmaWxlc10pXG4gIGNvbnN0IHVuc3RhZ2VkRmlsZXMgPSB1c2VNZW1vKCgpID0+IGZpbGVzLmZpbHRlcigoZikgPT4gIWYuc3RhZ2VkKSwgW2ZpbGVzXSlcblxuICAvKiogVGhlIGZpbGUgc2xpY2UgdGhlIGN1cnJlbnQgc2NvcGUgc2hvd3MuICovXG4gIGNvbnN0IHNjb3BlRmlsZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICBzd2l0Y2ggKHNjb3BlKSB7XG4gICAgICBjYXNlICd1bnN0YWdlZCc6XG4gICAgICAgIHJldHVybiB1bnN0YWdlZEZpbGVzXG4gICAgICBjYXNlICdzdGFnZWQnOlxuICAgICAgICByZXR1cm4gc3RhZ2VkRmlsZXNcbiAgICAgIGNhc2UgJ2JyYW5jaCc6XG4gICAgICAgIHJldHVybiBiYXNlU3RhdHVzPy5maWxlcyA/PyBbXVxuICAgICAgY2FzZSAnbGFzdC10dXJuJzoge1xuICAgICAgICByZXR1cm4gbGFzdFR1cm5GaWxlc1xuICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZpbGVzXG4gICAgfVxuICB9LCBbc2NvcGUsIHVuc3RhZ2VkRmlsZXMsIHN0YWdlZEZpbGVzLCBiYXNlU3RhdHVzLCBmaWxlcywgbGFzdFR1cm5GaWxlc10pXG5cbiAgLyoqIFNjb3BlcyB3aGVyZSBmaWxlL2h1bmsgYWNjZXB0XHUwMEI3cmV2ZXJ0XHUwMEI3dW5zdGFnZSBhbmQgY29tbWl0L3B1c2ggbWFrZSBzZW5zZS4gKi9cbiAgY29uc3QgYWxsb3dBY3Rpb25zID0gc2NvcGUgIT09ICdicmFuY2gnICYmIHNjb3BlICE9PSAnY29tbWl0JyAmJiBzY29wZSAhPT0gJ2xhc3QtdHVybidcblxuICAvKiogRmlsZXMgdGhlIGN1cnJlbnQgc2NvcGUgY2FuIGhhbmQgdG8gdGhlIEFJIHJldmlldy4gKi9cbiAgY29uc3QgcmV2aWV3YWJsZUZpbGVzID0gc2NvcGUgPT09ICdicmFuY2gnID8gYmFzZVN0YXR1cz8uZmlsZXM/Lmxlbmd0aCA/PyAwIDogZmlsZXMubGVuZ3RoXG4gIGNvbnN0IHN0YWdlZENvdW50ID0gc3RhZ2VkRmlsZXMubGVuZ3RoXG4gIC8vIE5PVEU6IGhvb2tzIG11c3QgYWxsIHJ1biBiZWZvcmUgdGhlIGVhcmx5IHJldHVybiBiZWxvdyAoUmVhY3QgaG9vayBvcmRlcikuXG4gIGNvbnN0IHN0YWdlZFRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc3RhZ2VkRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbc3RhZ2VkRmlsZXNdKVxuICBjb25zdCB1bnN0YWdlZFRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUodW5zdGFnZWRGaWxlcywgKGYpID0+IGYucGF0aCksIFt1bnN0YWdlZEZpbGVzXSlcbiAgY29uc3Qgc2NvcGVUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHNjb3BlRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbc2NvcGVGaWxlc10pXG4gIGNvbnN0IGNvbW1pdEZpbGVzVHJlZSA9IHVzZU1lbW8oXG4gICAgKCkgPT4gKGNvbW1pdERpZmY/Lm9rID8gYnVpbGRGaWxlVHJlZShjb21taXREaWZmLmZpbGVzLCAoZikgPT4gZi5wYXRoKSA6IFtdKSxcbiAgICBbY29tbWl0RGlmZl0sXG4gIClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzY29wZSA9PT0gJ2xhc3QtdHVybicgJiYgc2VsZWN0ZWQgPT09IG51bGwgJiYgbGFzdFR1cm5GaWxlcy5sZW5ndGggPiAwKSBzZXRTZWxlY3RlZChsYXN0VHVybkZpbGVzWzBdLnBhdGgpXG4gIH0sIFtzY29wZSwgc2VsZWN0ZWQsIGxhc3RUdXJuRmlsZXNdKVxuXG4gIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8ICFjd2QpIHJldHVybiBudWxsXG5cbiAgY29uc3Qgc2VsZWN0ZWRGaWxlID0gc2NvcGVGaWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IHNlbGVjdGVkKSA/PyBudWxsXG4gIGNvbnN0IHRvdGFsQWRkZWQgPSBmaWxlcy5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLmFkZGVkLCAwKVxuICBjb25zdCB0b3RhbERlbGV0ZWQgPSBmaWxlcy5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLmRlbGV0ZWQsIDApXG5cbiAgLy8gQ29tbWl0LWRldGFpbCB2aWV3OiB0aGUgc2VsZWN0ZWQgZmlsZSB3aXRoaW4gdGhlIHNlbGVjdGVkIGNvbW1pdC5cbiAgY29uc3QgY29tbWl0U2VnbWVudHMgPSBjb21taXREaWZmPy5vayA/IHNwbGl0Q29tbWl0RGlmZihjb21taXREaWZmLmRpZmYpIDogW11cbiAgY29uc3QgY29tbWl0QWN0aXZlRmlsZSA9IHNlbGVjdGVkQ29tbWl0ICYmIGNvbW1pdERpZmY/Lm9rID8gY29tbWl0RGlmZi5maWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IHNlbGVjdGVkQ29tbWl0RmlsZSkgPz8gbnVsbCA6IG51bGxcbiAgY29uc3QgY29tbWl0QWN0aXZlVGV4dCA9IGNvbW1pdEFjdGl2ZUZpbGVcbiAgICA/IGNvbW1pdFNlZ21lbnRzLmZpbmQoKHMpID0+IHMucGF0aCA9PT0gY29tbWl0QWN0aXZlRmlsZS5wYXRoKT8udGV4dCA/PyBjb21taXREaWZmPy5kaWZmID8/ICcnXG4gICAgOiBjb21taXREaWZmPy5kaWZmID8/ICcnXG5cbiAgLyoqIExlYWYgcm93IHNoYXJlZCBieSB0aGUgc3RhZ2VkL3Vuc3RhZ2VkIGZpbGUgdHJlZXMuICovXG4gIGNvbnN0IHdvcmtzcGFjZUxlYWYgPSAoeyBpdGVtOiBmaWxlLCBuYW1lIH06IHsgaXRlbTogRGlmZkZpbGU7IG5hbWU6IHN0cmluZyB9KSA9PiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICByb2xlPVwib3B0aW9uXCJcbiAgICAgIGFyaWEtc2VsZWN0ZWQ9e2ZpbGUucGF0aCA9PT0gc2VsZWN0ZWR9XG4gICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2ZpbGUucGF0aCA9PT0gc2VsZWN0ZWQgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBzZXRTZWxlY3RlZChmaWxlLnBhdGgpXG4gICAgICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgICBzZXRDb21taXREaWZmKG51bGwpXG4gICAgICAgIHNldENvbmZpcm0obnVsbClcbiAgICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgICB9fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoaXBDbGFzcyhmaWxlLnN0YXR1cyl9YH0+e2ZpbGUudW50cmFja2VkID8gJz8/JyA6IGZpbGUuc3RhdHVzfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2ZpbGUucGF0aH0+e25hbWV9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLXN0YXRcIj5cbiAgICAgICAge2ZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBmaWxlLmFkZGVkLCBkZWxldGVkOiBmaWxlLmRlbGV0ZWQgfSl9XG4gICAgICA8L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtYWN0aW9uc1wiPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtaWNvblwiIHRpdGxlPXt0KCdodW5rLnN0YWdlJyl9IGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoZXZlbnQpID0+IHsgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IHZvaWQgcnVuQXBwbHkoJ2FjY2VwdCcsIGZpbGUucGF0aCkgfX0+KzwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtaWNvbiBkc2RyLWZpbGUtaWNvbi1kYW5nZXJcIiB0aXRsZT17dCgnaHVuay5yZXZlcnQnKX0gZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eyhldmVudCkgPT4geyBldmVudC5zdG9wUHJvcGFnYXRpb24oKTsgdm9pZCBydW5BcHBseSgncmV2ZXJ0JywgZmlsZS5wYXRoKSB9fT5cdTIxQjY8L2J1dHRvbj5cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxuXG4gIGNvbnN0IHJ1bkFwcGx5ID0gYXN5bmMgKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZykgPT4ge1xuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcGx5Q2hhbmdlcyhhY3RpdmVDd2QgPz8gY3dkID8/ICcnLCBhY3Rpb24sIHBhdGgpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIGNvbnN0IHZlcmIgPSBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiBhY3Rpb24gPT09ICd1bnN0YWdlJyA/IHQoJ3Jldmlldy51bnN0YWdlZCcpIDogdCgncmV2aWV3LnJldmVydGVkJylcbiAgICAgICAgc2V0Tm90aWNlKHtcbiAgICAgICAgICBraW5kOiAnb2snLFxuICAgICAgICAgIHRleHQ6IHBhdGhcbiAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVPbmUnLCB7IGFjdGlvbjogdmVyYiwgcGF0aCB9KVxuICAgICAgICAgICAgOiByZXN1bHQuZGVsZXRlZCAmJiByZXN1bHQuZGVsZXRlZC5sZW5ndGggPiAwXG4gICAgICAgICAgICAgID8gdCgncmV2aWV3LmRvbmVEZWxldGVkJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGgsIGRlbGV0ZWQ6IHJlc3VsdC5kZWxldGVkLmxlbmd0aCB9KVxuICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5kb25lJywgeyBhY3Rpb246IHZlcmIsIGNvdW50OiBmaWxlcy5sZW5ndGggfSksXG4gICAgICAgIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcubG9hZEVycm9yJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBvbkZpbGVBY3Rpb24gPSAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBwYXRoOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnZmlsZScpIHtcbiAgICAgIHNldENvbmZpcm0oJ2ZpbGUnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2ZpbGUnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbiwgcGF0aClcbiAgfVxuXG4gIGNvbnN0IG9uQWxsQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JykgPT4ge1xuICAgIGlmIChhY3Rpb24gPT09ICdyZXZlcnQnICYmIGNvbmZpcm0gIT09ICdhbGwnKSB7XG4gICAgICBzZXRDb25maXJtKCdhbGwnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ2FsbCcgPyBudWxsIDogYykpLCAyNTAwKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZvaWQgcnVuQXBwbHkoYWN0aW9uKVxuICB9XG5cbiAgLyoqIEFwcGx5IG9uZSBodW5rIChzdGFnZSAvIHVuc3RhZ2UgLyByZXZlcnQpIG9mIHRoZSBzZWxlY3RlZCBmaWxlLiAqL1xuICBjb25zdCBvbkh1bmtBY3Rpb24gPSBhc3luYyAoYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBEaWZmSHVuaykgPT4ge1xuICAgIGlmICghc2VsZWN0ZWRGaWxlIHx8IGJ1c3kpIHJldHVyblxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBwbHlIdW5rKGFjdGl2ZUN3ZCA/PyBjd2QgPz8gJycsIHNlbGVjdGVkRmlsZS5wYXRoLCBhY3Rpb24sIGh1bmsudGV4dClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgY29uc3QgdmVyYiA9IGFjdGlvbiA9PT0gJ2FjY2VwdCcgPyB0KCdyZXZpZXcuYWNjZXB0ZWQnKSA6IGFjdGlvbiA9PT0gJ3Vuc3RhZ2UnID8gdCgncmV2aWV3LnVuc3RhZ2VkJykgOiB0KCdyZXZpZXcucmV2ZXJ0ZWQnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuZG9uZU9uZScsIHsgYWN0aW9uOiB2ZXJiLCBwYXRoOiBzZWxlY3RlZEZpbGUucGF0aCB9KSB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLSBpbmxpbmUgY29tbWVudHMgLS0tLVxuICBjb25zdCBvcGVuQ29tbWVudCA9IChvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVyblxuICAgIHNldENvbW1lbnRFZGl0b3IoeyBvbGRMaW5lLCBuZXdMaW5lIH0pXG4gICAgc2V0Q29tbWVudFRleHQoJycpXG4gIH1cblxuICAvKipcbiAgICogQ29tbWVudHMgYXJlIHN0b3JlZCByZXBvLXJlbGF0aXZlIChzZXJ2ZXIgcmVqZWN0cyBhYnNvbHV0ZSBwYXRocyksIGJ1dFxuICAgKiB0aGUgc2Vzc2lvbiB0YWIncyBjaGFuZ2UgcGF0aHMgY29tZSBmcm9tIHRoZSBob3N0IHRvb2wgZGlmZiBjYXJkcywgd2hpY2hcbiAgICogY2Fycnkgd2hhdGV2ZXIgcGF0aCB0aGUgYWdlbnQgcGFzc2VkICh1c3VhbGx5IGFic29sdXRlKS5cbiAgICovXG4gIGNvbnN0IHJlbGF0aXZlUGF0aCA9IChwOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkIHx8ICFpc0Fic1BhdGgocCkpIHJldHVybiBwXG4gICAgaWYgKHAuc3RhcnRzV2l0aChhY3RpdmVDd2QpKSByZXR1cm4gcC5zbGljZShhY3RpdmVDd2QubGVuZ3RoKS5yZXBsYWNlKC9eW1xcXFwvXSsvLCAnJylcbiAgICByZXR1cm4gcFxuICB9XG5cbiAgY29uc3Qgc2F2ZUNvbW1lbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgY29tbWVudFBhdGggPSByZWxhdGl2ZVBhdGgoKHRhYiA9PT0gJ3dvcmtzcGFjZScgPyBzZWxlY3RlZEZpbGU/LnBhdGggOiBzZWxlY3RlZENoYW5nZT8ucGF0aCkgPz8gJycpXG4gICAgaWYgKCFjb21tZW50UGF0aCB8fCAhY29tbWVudEVkaXRvciB8fCBidXN5KSByZXR1cm5cbiAgICBjb25zdCB0ZXh0ID0gY29tbWVudFRleHQudHJpbSgpXG4gICAgaWYgKCF0ZXh0KSByZXR1cm5cbiAgICBjb25zdCBjb21tZW50OiBSZXZpZXdDb21tZW50ID0ge1xuICAgICAgaWQ6IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5yYW5kb21VVUlEID8gY3J5cHRvLnJhbmRvbVVVSUQoKSA6IGAke0RhdGUubm93KCl9LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMil9YCxcbiAgICAgIHBhdGg6IGNvbW1lbnRQYXRoLFxuICAgICAgbGluZU5ldzogY29tbWVudEVkaXRvci5uZXdMaW5lLFxuICAgICAgbGluZU9sZDogY29tbWVudEVkaXRvci5vbGRMaW5lLFxuICAgICAgdGV4dCxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgc291cmNlOiB0YWIgPT09ICdzZXNzaW9uJyA/ICdzZXNzaW9uJyA6ICd3b3Jrc3BhY2UnLFxuICAgIH1cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG5leHQgPSBbLi4uY29tbWVudHMsIGNvbW1lbnRdXG4gICAgICBpZiAoYWN0aXZlQ3dkICYmIChhd2FpdCBzYXZlQ29tbWVudHMoYWN0aXZlQ3dkLCBuZXh0KSkpIHtcbiAgICAgICAgc2V0Q29tbWVudHMobmV4dClcbiAgICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgnY29tbWVudC5zYXZlZCcpIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNhbmNlbENvbW1lbnQgPSAoKSA9PiB7XG4gICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICB9XG5cbiAgY29uc3QgZGVsZXRlQ29tbWVudCA9IGFzeW5jIChpZDogc3RyaW5nKSA9PiB7XG4gICAgaWYgKGJ1c3kpIHJldHVyblxuICAgIGNvbnN0IG5leHQgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGMuaWQgIT09IGlkKVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBVcGRhdGUgb25lIHNhdmVkIGNvbW1lbnQncyB0ZXh0IChQVVQgcmVwbGFjZSkuIFJldHVybnMgc3VjY2Vzcy4gKi9cbiAgY29uc3QgdXBkYXRlQ29tbWVudCA9IGFzeW5jIChpZDogc3RyaW5nLCB0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBpZiAoIXRleHQgfHwgYnVzeSkgcmV0dXJuIGZhbHNlXG4gICAgY29uc3QgbmV4dCA9IGNvbW1lbnRzLm1hcCgoYykgPT4gKGMuaWQgPT09IGlkID8geyAuLi5jLCB0ZXh0LCBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9IDogYykpXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBpZiAoYWN0aXZlQ3dkICYmIChhd2FpdCBzYXZlQ29tbWVudHMoYWN0aXZlQ3dkLCBuZXh0KSkpIHtcbiAgICAgICAgc2V0Q29tbWVudHMobmV4dClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gQUkgcmV2aWV3ICgvcmV2aWV3KTogcnVuLCByZS1ydW4sIGFuZCBoYW5kIGZpbmRpbmdzIHRvIHRoZSBhZ2VudCAtLS0tXG4gIGNvbnN0IG9uUmV2aWV3ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkIHx8IHJldmlld2luZyB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRSZXZpZXdpbmcodHJ1ZSlcbiAgICBzZXRSZXZpZXcobnVsbClcbiAgICBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmV2aWV3U2NvcGUgPSBzY29wZSA9PT0gJ2JyYW5jaCcgPyAnYnJhbmNoJyA6IHNjb3BlID09PSAnY29tbWl0JyAmJiBzZWxlY3RlZENvbW1pdCA/ICdjb21taXQnIDogJ3VuY29tbWl0dGVkJ1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuUmV2aWV3KGFjdGl2ZUN3ZCwgY3VycmVudElkID8/IG51bGwsIHJldmlld1Njb3BlLCBiYXNlQnJhbmNoID8/IHVuZGVmaW5lZCwgc2VsZWN0ZWRDb21taXQ/Lmhhc2ggPz8gdW5kZWZpbmVkKVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBzZXRSZXZpZXcocmVzdWx0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5yZXZpZXdGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5yZXZpZXdGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRSZXZpZXdpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIENvbXBvc2UgYSBcInNlbmQgdG8gYWdlbnRcIiBtZXNzYWdlIGZyb20gZmluZGluZ3Mgb3IgUFIgY29tbWVudHMuICovXG4gIGNvbnN0IGNvbXBvc2VGaW5kaW5nc01lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBieVBhdGggPSBuZXcgTWFwPHN0cmluZywgUmV2aWV3RmluZGluZ1tdPigpXG4gICAgZm9yIChjb25zdCBmIG9mIHJldmlldz8uZmluZGluZ3MgPz8gW10pIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBieVBhdGguZ2V0KGYuZmlsZSlcbiAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goZilcbiAgICAgIGVsc2UgYnlQYXRoLnNldChmLmZpbGUsIFtmXSlcbiAgICB9XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gWydcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEIgQUkgXHU4QkM0XHU1QkExXHU1M0QxXHU3M0IwXHVGRjA4QWRkcmVzcyB0aGUgcmV2aWV3IGZpbmRpbmdzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJywgJyddXG4gICAgZm9yIChjb25zdCBbcGF0aCwgbGlzdF0gb2YgYnlQYXRoKSB7XG4gICAgICBsaW5lcy5wdXNoKGAjIyAke3BhdGh9YClcbiAgICAgIGZvciAoY29uc3QgZiBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gZi5saW5lU3RhcnQgPT09IGYubGluZUVuZCA/IGA6JHtmLmxpbmVTdGFydH1gIDogYDoke2YubGluZVN0YXJ0fS0ke2YubGluZUVuZH1gXG4gICAgICAgIGxpbmVzLnB1c2goYC0gWyR7Zi5wcmlvcml0eX1dICR7cGF0aH0ke3JhbmdlfTogJHtmLnRpdGxlfSBcdTIwMTQgJHtmLmRldGFpbH1gKVxuICAgICAgICBpZiAoZi5zdWdnZXN0aW9uKSBsaW5lcy5wdXNoKGAgIFxcYFxcYFxcYFxcbiR7Zi5zdWdnZXN0aW9ufVxcbiAgXFxgXFxgXFxgYClcbiAgICAgIH1cbiAgICAgIGxpbmVzLnB1c2goJycpXG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgY29uc3QgY29tcG9zZVByTWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGlmICghcHI/LnByIHx8IHByLmNvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW2BcdThCRjdcdTU5MDRcdTc0MDYgUFIgIyR7cHIucHIubnVtYmVyfVx1RkYwOCR7cHIucHIudGl0bGV9XHVGRjA5XHU3Njg0XHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgUFIgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUFgLCAnJ11cbiAgICBmb3IgKGNvbnN0IGMgb2YgcHIuY29tbWVudHMpIHtcbiAgICAgIGNvbnN0IGFuY2hvciA9IGMucGF0aCA/IGAke2MucGF0aH0ke2MubGluZSA/IGA6JHtjLmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCdcbiAgICAgIGxpbmVzLnB1c2goYC0gJHthbmNob3J9ICgke2MuYXV0aG9yfSk6ICR7Yy5ib2R5fWApXG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgY29uc3Qgb3BlblNlbmRQYW5lbFdpdGggPSAodGV4dDogc3RyaW5nKSA9PiB7XG4gICAgc2V0U2VuZFRleHQodGV4dClcbiAgICBzZXRTZW5kT3Blbih0cnVlKVxuICB9XG5cbiAgLy8gLS0tLSBlZGl0b3IgaW50ZWdyYXRpb24gKHZpYSBkc2gtcGx1Z2luLW9wZW4tZWRpdG9yKSAtLS0tXG4gIGNvbnN0IG9wZW5GaWxlID0gYXN5bmMgKHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlcikgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkIHx8IGJ1c3kpIHJldHVyblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG9wZW5JbkVkaXRvcihhY3RpdmVDd2QsIHBhdGgsIGxpbmUpXG4gICAgaWYgKCFyZXN1bHQub2spIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGAke3QoJ2VkaXRvci5mYWlsZWQnKX06ICR7cmVzdWx0LmVycm9yID8/ICcnfWAgfSlcbiAgfVxuXG4gIC8qKiBKdW1wIGZyb20gYSBQUiBjb21tZW50IHRvIHRoZSBmaWxlIChhbmQgaGlnaGxpZ2h0IHRoZSBsaW5lKS4gKi9cbiAgY29uc3Qgb25QckNvbW1lbnRDbGljayA9IChwYXRoOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkLCBsaW5lOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgaWYgKHBhdGgpIGp1bXBUbyhwYXRoLCBsaW5lID8/IHVuZGVmaW5lZClcbiAgICBlbHNlIHNldEp1bXBMaW5lKG51bGwpXG4gIH1cblxuICAvLyAtLS0tIGZlZWRiYWNrIGxvb3A6IGNvbW1lbnRzIFx1MjE5MiBhZ2VudCAocHJvbXB0IGluamVjdGlvbiwgY29weSBmYWxsYmFjaykgLS0tLVxuICBjb25zdCBjb21wb3NlUmV2aWV3TWVzc2FnZSA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGlmIChjb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIGNvbnN0IGJ5UGF0aCA9IG5ldyBNYXA8c3RyaW5nLCBSZXZpZXdDb21tZW50W10+KClcbiAgICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBieVBhdGguZ2V0KGMucGF0aClcbiAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goYylcbiAgICAgIGVsc2UgYnlQYXRoLnNldChjLnBhdGgsIFtjXSlcbiAgICB9XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gW1xuICAgICAgJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQlx1OTQ4OFx1NUJGOVx1NUY1M1x1NTI0RFx1NURFNVx1NEY1Q1x1NTMzQVx1NzY4NFx1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMVx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsXG4gICAgICAnJyxcbiAgICBdXG4gICAgZm9yIChjb25zdCBbcGF0aCwgbGlzdF0gb2YgYnlQYXRoKSB7XG4gICAgICBsaW5lcy5wdXNoKGAjIyAke3BhdGh9YClcbiAgICAgIGZvciAoY29uc3QgYyBvZiBsaXN0KSB7XG4gICAgICAgIGNvbnN0IGFuY2hvciA9IGMubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjLmxpbmVOZXd9YCA6IGAgKG9sZCBsaW5lICR7Yy5saW5lT2xkfSlgXG4gICAgICAgIC8vIE9yaWdpbiB0YWIgdGFnIHNvIHRoZSBjb252ZXJzYXRpb24gY2FyZCByb3V0ZXMgaXRzIGp1bXAgKCdzJyA9XG4gICAgICAgIC8vIHNlc3Npb24gcmVsYXRpdmUgaHVuayBsaW5lcywgJ3cnID0gd29ya3NwYWNlIHJlYWwgbGluZXMpLlxuICAgICAgICBjb25zdCB0YWcgPSBjLnNvdXJjZSA9PT0gJ3Nlc3Npb24nID8gJ1tzXScgOiAnW3ddJ1xuICAgICAgICBsaW5lcy5wdXNoKGAtICR7dGFnfSAke3BhdGh9JHthbmNob3J9OiAke2MudGV4dH1gKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBjb25zdCBvcGVuU2VuZFBhbmVsID0gKCkgPT4ge1xuICAgIHNldFNlbmRUZXh0KGNvbXBvc2VSZXZpZXdNZXNzYWdlKCkpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIGNvbnN0IHNlbmRUb0FnZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHRleHQgPSBzZW5kVGV4dC50cmltKClcbiAgICBpZiAoIXRleHQgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRjb21lID0gYXdhaXQgaW5qZWN0VG9TZXNzaW9uKHNlc3Npb25zLCBjdXJyZW50SWQgPz8gbnVsbCwgdGV4dClcbiAgICAgIHNldFNlbmRPcGVuKGZhbHNlKVxuICAgICAgaWYgKG91dGNvbWUgPT09ICdzZW50Jykgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LnNlbnRUb0FnZW50JykgfSlcbiAgICAgIGVsc2UgaWYgKG91dGNvbWUgPT09ICdjb3BpZWQnKSBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSlcbiAgICAgIGVsc2Ugc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgncmV2aWV3LmNvcHlGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21taXQgdGhlIHN0YWdlZCBjaGFuZ2VzIHdpdGggdGhlIGVudGVyZWQgbWVzc2FnZS4gKi9cbiAgY29uc3Qgb25Db21taXQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGNvbW1pdE1lc3NhZ2UudHJpbSgpXG4gICAgaWYgKCFtZXNzYWdlIHx8IGJ1c3kgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHNldE5vdGljZShudWxsKVxuICAgIHNldENvbmZpcm0obnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcnVuR2l0QWN0aW9uKGFjdGl2ZUN3ZCwgJ2NvbW1pdCcsIG1lc3NhZ2UpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIHNldENvbW1pdE1lc3NhZ2UoJycpXG4gICAgICAgIGNvbnN0IHN1bW1hcnkgPSByZXN1bHQuaGFzaCA/IGAke3Jlc3VsdC5oYXNofSAke3Jlc3VsdC5zdWJqZWN0ID8/ICcnfWAudHJpbSgpIDogKHJlc3VsdC5zdWJqZWN0ID8/ICcnKVxuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29tbWl0dGVkJywgeyBzdW1tYXJ5IH0pIH0pXG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcuY29tbWl0RmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcuY29tbWl0RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBzdWJtaXRDb21taXQgPSBhc3luYyAocHVzaEFmdGVyOiBib29sZWFuKSA9PiB7XG4gICAgaWYgKCFhY3RpdmVDd2QgfHwgYnVzeSkgcmV0dXJuXG4gICAgaWYgKGluY2x1ZGVVbnN0YWdlZCkge1xuICAgICAgc2V0QnVzeSh0cnVlKVxuICAgICAgY29uc3Qgc3RhZ2VkID0gYXdhaXQgYXBwbHlDaGFuZ2VzKGFjdGl2ZUN3ZCwgJ2FjY2VwdCcpXG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgaWYgKCFzdGFnZWQub2spIHsgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogc3RhZ2VkLmVycm9yIHx8IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KTsgcmV0dXJuIH1cbiAgICB9XG4gICAgYXdhaXQgb25Db21taXQoKVxuICAgIGlmIChwdXNoQWZ0ZXIpIG9uUHVzaCh0cnVlKVxuICAgIHNldENvbW1pdE9wZW4oZmFsc2UpXG4gIH1cblxuICAvKiogUHVzaCB0aGUgY3VycmVudCBicmFuY2ggKGRvdWJsZS1jbGljayB0byBjb25maXJtKS4gKi9cbiAgY29uc3Qgb25QdXNoID0gKGltbWVkaWF0ZSA9IGZhbHNlKSA9PiB7XG4gICAgaWYgKGJ1c3kgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKCFpbW1lZGlhdGUgJiYgY29uZmlybSAhPT0gJ3B1c2gnKSB7XG4gICAgICBzZXRDb25maXJtKCdwdXNoJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdwdXNoJyA/IG51bGwgOiBjKSksIDI1MDApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgc2V0QnVzeSh0cnVlKVxuICAgICAgc2V0Tm90aWNlKG51bGwpXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAncHVzaCcpXG4gICAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcucHVzaGVkJykgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LnB1c2hGYWlsZWQnKSB9KVxuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGxvYWRXb3Jrc3BhY2UodHJ1ZSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LnB1c2hGYWlsZWQnKSB9KVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICAgIH1cbiAgICB9KSgpXG4gIH1cblxuICAvKiogU2VsZWN0IGEgbG9jYWwgY29tbWl0IGFuZCBsb2FkIGl0cyBkaWZmIGludG8gdGhlIHJpZ2h0IHBhbmUuICovXG4gIGNvbnN0IHNlbGVjdENvbW1pdCA9IChjb21taXQ6IENvbW1pdEluZm8pID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICBzZXRTZWxlY3RlZENvbW1pdChjb21taXQpXG4gICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICBzZXRDb21taXREaWZmTG9hZGluZyh0cnVlKVxuICAgIHZvaWQgbG9hZENvbW1pdERpZmYoYWN0aXZlQ3dkLCBjb21taXQuaGFzaClcbiAgICAgIC50aGVuKChkKSA9PiB7XG4gICAgICAgIHNldENvbW1pdERpZmYoZClcbiAgICAgICAgc2V0Q29tbWl0RGlmZkxvYWRpbmcoZmFsc2UpXG4gICAgICAgIC8vIERlZmF1bHQgdGhlIGZpbGUgdHJlZSB0byB0aGUgZmlyc3QgY2hhbmdlZCBmaWxlLlxuICAgICAgICBpZiAoZC5vayAmJiBkLmZpbGVzLmxlbmd0aCA+IDApIHNldFNlbGVjdGVkQ29tbWl0RmlsZShkLmZpbGVzWzBdLnBhdGgpXG4gICAgICB9KVxuICAgICAgLmNhdGNoKCgpID0+IHNldENvbW1pdERpZmZMb2FkaW5nKGZhbHNlKSlcbiAgfVxuXG4gIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwiZHNkci1vdmVybGF5XCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jdXJyZW50VGFyZ2V0KSBjbG9zZSgpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1wYW5lbFwiXG4gICAgICAgIHJvbGU9XCJkaWFsb2dcIlxuICAgICAgICBhcmlhLW1vZGFsPVwidHJ1ZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfVxuICAgICAgICBzdHlsZT17eyB3aWR0aDogYCR7cHJlZnMud2lkdGh9cHhgLCBoZWlnaHQ6IGAke3ByZWZzLmhlaWdodH1weGAsIC4uLmRpZmZTdHlsZVZhcnMocHJlZnMpIH0gYXMgQ1NTUHJvcGVydGllc31cbiAgICAgID5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJlXCJcbiAgICAgICAgICBvblJlc2l6ZT17KGR4KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC53aWR0aCA9IE1hdGgubWF4KE1JTl9QQU5FTF9XLCBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCAtIDY0LCBkLndpZHRoICsgZHgpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwic1wiXG4gICAgICAgICAgb25SZXNpemU9eyhfZHgsIGR5KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5oZWlnaHQgPSBNYXRoLm1heChNSU5fUEFORUxfSCwgTWF0aC5taW4od2luZG93LmlubmVySGVpZ2h0IC0gNjQsIGQuaGVpZ2h0ICsgZHkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICAgIDxSZXNpemVIYW5kbGVcbiAgICAgICAgICBtb2RlPVwic2VcIlxuICAgICAgICAgIG9uUmVzaXplPXsoZHgsIGR5KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC53aWR0aCA9IE1hdGgubWF4KE1JTl9QQU5FTF9XLCBNYXRoLm1pbih3aW5kb3cuaW5uZXJXaWR0aCAtIDY0LCBkLndpZHRoICsgZHgpKVxuICAgICAgICAgICAgICBkLmhlaWdodCA9IE1hdGgubWF4KE1JTl9QQU5FTF9ILCBNYXRoLm1pbih3aW5kb3cuaW5uZXJIZWlnaHQgLSA2NCwgZC5oZWlnaHQgKyBkeSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWhlYWRlclwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdGl0bGVcIj57dCgncmV2aWV3LnRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci10YWJzXCIgcm9sZT1cInRhYmxpc3RcIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcudGl0bGUnKX0+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiByb2xlPVwidGFiXCIgYXJpYS1zZWxlY3RlZD17c3VyZmFjZSA9PT0gJ3Jldmlldyd9IGNsYXNzTmFtZT17YGRzZHItdGFiJHtzdXJmYWNlID09PSAncmV2aWV3JyA/ICcgZHNkci10YWItYWN0aXZlJyA6ICcnfWB9IG9uQ2xpY2s9eygpID0+IHNldFN1cmZhY2UoJ3JldmlldycpfT57dCgncmV2aWV3LnRpdGxlJyl9PC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiByb2xlPVwidGFiXCIgYXJpYS1zZWxlY3RlZD17c3VyZmFjZSA9PT0gJ2ZpbGVzJ30gY2xhc3NOYW1lPXtgZHNkci10YWIke3N1cmZhY2UgPT09ICdmaWxlcycgPyAnIGRzZHItdGFiLWFjdGl2ZScgOiAnJ31gfSBvbkNsaWNrPXsoKSA9PiBzZXRTdXJmYWNlKCdmaWxlcycpfT57dCgnZmlsZXMudGl0bGUnKX08L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7c3VyZmFjZSA9PT0gJ3JldmlldycgJiYgdGFiID09PSAnd29ya3NwYWNlJyAmJiBzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2NvcGVcIj5cbiAgICAgICAgICAgICAge3JlcG9zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICAgICAgPFRoZW1lU2VsZWN0XG4gICAgICAgICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3JlcG8ubGFiZWwnKX1cbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtyZXBvUGF0aCA/PyBhY3RpdmVDd2QgPz8gJyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXtyZXBvcy5tYXAoKHIpID0+ICh7IHZhbHVlOiByLnBhdGgsIGxhYmVsOiBgJHtiYXNlTmFtZShyLnBhdGgpfSR7ci5icmFuY2ggPyBgICgke3IuYnJhbmNofSlgIDogJyd9YCB9KSl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0UmVwb1BhdGgodilcbiAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICAgICAgc2V0UmV2aWV3KG51bGwpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3Njb3BlLmxhYmVsJyl9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3Njb3BlfVxuICAgICAgICAgICAgICAgIG9wdGlvbnM9e1NDT1BFX09QVElPTlMubWFwKChzKSA9PiAoeyB2YWx1ZTogcy5pZCwgbGFiZWw6IHQocy5sYWJlbCkgfSkpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0U2NvcGUodiBhcyBXb3Jrc3BhY2VTY29wZSlcbiAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkKG51bGwpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYnJhbmNoJyA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUuYmFzZScpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2Jhc2VCcmFuY2ggPz8gJyd9XG4gICAgICAgICAgICAgICAgICBvcHRpb25zPXticmFuY2hlcy5tYXAoKGIpID0+ICh7IHZhbHVlOiBiLCBsYWJlbDogYiB9KSl9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0QmFzZUJyYW5jaH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXN1YnRpdGxlXCI+XG4gICAgICAgICAgICB7dGFiID09PSAnc2Vzc2lvbidcbiAgICAgICAgICAgICAgPyB0KCdyZXZpZXcuc2Vzc2lvblN0YXRzJywgeyByb3VuZHM6IHJvdW5kcy5sZW5ndGgsIGZpbGVzOiB0b3RhbFNlc3Npb25GaWxlcyB9KVxuICAgICAgICAgICAgICA6IHN0YXR1cz8uaXNSZXBvXG4gICAgICAgICAgICAgICAgPyBgJHtzdGF0dXMuYnJhbmNoID8/IHQoJ3Jldmlldy5kZXRhY2hlZCcpfSBcdTAwQjcgJHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IHRvdGFsQWRkZWQsIGRlbGV0ZWQ6IHRvdGFsRGVsZXRlZCB9KX0ke3N0YXR1cy5haGVhZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5haGVhZCcsIHsgbjogc3RhdHVzLmFoZWFkIH0pfWAgOiAnJ30ke3N0YXR1cy5iZWhpbmQgPiAwID8gYCBcdTAwQjcgJHt0KCdyZXZpZXcuYmVoaW5kJywgeyBuOiBzdGF0dXMuYmVoaW5kIH0pfWAgOiAnJ31gXG4gICAgICAgICAgICAgICAgOiB0KCdyZXZpZXcubm90UmVwbycpfVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICB7c3VyZmFjZSA9PT0gJ3JldmlldycgJiYgdGFiID09PSAnd29ya3NwYWNlJyAmJiBhbGxvd0FjdGlvbnMgPyAoXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5IHx8IChmaWxlcy5sZW5ndGggPT09IDAgJiYgc3RhZ2VkQ291bnQgPT09IDApfSBvbkNsaWNrPXsoKSA9PiBzZXRDb21taXRPcGVuKHRydWUpfT57dCgncmV2aWV3LmNvbW1pdCcpfTwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgYXJpYS1sYWJlbD17dCgncmV2aWV3LmNsb3NlJyl9IG9uQ2xpY2s9e2Nsb3NlfT5cbiAgICAgICAgICAgIDxJY29uWCAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7Y29tbWl0T3BlbiA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LW1vZGFsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWNhcmRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC10aXRsZVwiPntzdGF0dXM/LmJyYW5jaCA/PyB0KCdyZXZpZXcuY29tbWl0Jyl9PC9kaXY+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1pbnB1dFwiIGF1dG9Gb2N1cyB2YWx1ZT17Y29tbWl0TWVzc2FnZX0gcGxhY2Vob2xkZXI9e3QoJ3Jldmlldy5jb21taXRQbGFjZWhvbGRlcicpfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRDb21taXRNZXNzYWdlKGV2ZW50LnRhcmdldC52YWx1ZSl9IC8+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1pbmNsdWRlXCI+PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2luY2x1ZGVVbnN0YWdlZH0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0SW5jbHVkZVVuc3RhZ2VkKGV2ZW50LnRhcmdldC5jaGVja2VkKX0gLz4gSW5jbHVkZSB1bnN0YWdlZCBjaGFuZ2VzPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1hY3Rpb25zXCI+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBvbkNsaWNrPXsoKSA9PiBzZXRDb21taXRPcGVuKGZhbHNlKX0+e3QoJ2NvbW1lbnQuY2FuY2VsJyl9PC9idXR0b24+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeSB8fCAhY29tbWl0TWVzc2FnZS50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc3VibWl0Q29tbWl0KGZhbHNlKX0+e3QoJ3Jldmlldy5jb21taXQnKX08L2J1dHRvbj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3kgfHwgIWNvbW1pdE1lc3NhZ2UudHJpbSgpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIHN1Ym1pdENvbW1pdCh0cnVlKX0+e3QoJ3Jldmlldy5jb21taXQnKX0gYW5kIHt0KCdyZXZpZXcucHVzaCcpfTwvYnV0dG9uPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3kgfHwgKHN0YXR1cz8uYWhlYWQgPz8gMCkgPT09IDB9IG9uQ2xpY2s9eygpID0+IHsgc2V0Q29tbWl0T3BlbihmYWxzZSk7IG9uUHVzaCh0cnVlKSB9fT57dCgncmV2aWV3LnB1c2gnKX08L2J1dHRvbj48L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge3N1cmZhY2UgPT09ICdmaWxlcycgPyAoXG4gICAgICAgICAgPEZpbGVzV29ya3NwYWNlIGN3ZD17Y3dkfSB0PXt0fSBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9IG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9IC8+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPD5cbiAgICAgICAge3NlbmRPcGVuID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZW5kXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbmQtdGl0bGVcIj57dCgncmV2aWV3LnNlbmRUaXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VuZC1oaW50XCI+e3QoJ3Jldmlldy5zZW5kSGludCcpfTwvc3Bhbj5cbiAgICAgICAgICAgIDx0ZXh0YXJlYSBjbGFzc05hbWU9XCJkc2RyLXNlbmQtaW5wdXRcIiByZWFkT25seSB2YWx1ZT17c2VuZFRleHR9IHNwZWxsQ2hlY2s9e2ZhbHNlfSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWN0aW9uc1wiPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBzZXRTZW5kT3BlbihmYWxzZSl9PlxuICAgICAgICAgICAgICAgIHt0KCdjb21tZW50LmNhbmNlbCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItYnRuXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICB2b2lkIG5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dChzZW5kVGV4dCkudGhlbihcbiAgICAgICAgICAgICAgICAgICAgKCkgPT4gc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmNvcGllZCcpIH0pLFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdyZXZpZXcuY29weUZhaWxlZCcpIH0pLFxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNvcHknKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCAhc2VuZFRleHQudHJpbSgpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIHNlbmRUb0FnZW50KCl9PlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZFRvQWdlbnQnKX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAge3RhYiA9PT0gJ3Nlc3Npb24nID8gKFxuICAgICAgICAgIHJvdW5kcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgICAge3QoJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJyl9XG4gICAgICAgICAgICAgIHtzZXNzaW9uU2NhbiAmJiBzZXNzaW9uU2Nhbi5yZXN1bHRzID4gMCA/IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Jldmlldy5zZXNzaW9uU2NhbicsIHsgcmVzdWx0czogc2Vzc2lvblNjYW4ucmVzdWx0cywgZGlmZjogc2Vzc2lvblNjYW4uZGlmZkNhcmRzLCBwYXRoOiBzZXNzaW9uU2Nhbi5wYXRoT25seSB9KX08L2Rpdj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eS1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBvbkNsaWNrPXsoKSA9PiBzZXRUYWIoJ3dvcmtzcGFjZScpfT5cbiAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuZ29Xb3Jrc3BhY2UnKX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJvZHlcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbGVzXCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPXt0KCd0YWIuc2Vzc2lvbicpfT5cbiAgICAgICAgICAgICAgICB7cm91bmRzLm1hcCgocm91bmQpID0+IChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyb3VuZC5yb3VuZH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcucm91bmQnLCB7IHJvdW5kOiByb3VuZC5yb3VuZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICB7cm91bmQubGFiZWwgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcm91bmQtbGFiZWxcIiB0aXRsZT17cm91bmQubGFiZWx9Pntyb3VuZC5sYWJlbH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzZXNzaW9uVHJlZXMuZ2V0KHJvdW5kLnJvdW5kKSA/PyBbXX1cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXsoeyBpdGVtOiBjaGFuZ2UsIG5hbWUgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7cm91bmQucm91bmR9OiR7Y2hhbmdlLnBhdGh9YFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRLZXkgPSBzZWxlY3RlZENoYW5nZSA/IGAke3NlbGVjdGVkUm91bmR9OiR7c2VsZWN0ZWRDaGFuZ2UucGF0aH1gIDogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2tleSA9PT0gc2VsZWN0ZWRLZXl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtrZXkgPT09IHNlbGVjdGVkS2V5ID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZFJvdW5kKHJvdW5kLnJvdW5kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRQYXRoKGNoYW5nZS5wYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29uZmlybShudWxsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWNoaXAgJHtjaGFuZ2UuaGFzRGlmZiA/ICdkc2RyLWNoaXAtbScgOiAnZHNkci1jaGlwLXUnfWB9PntjaGFuZ2UuaGFzRGlmZiA/ICdNJyA6ICdcdTAwQjcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtjaGFuZ2UucGF0aH0+e25hbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdG9vbFwiIHRpdGxlPXtjaGFuZ2UudG9vbH0+e2NoYW5nZS50b29sfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmZcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRDaGFuZ2UucGF0aH0+e3NlbGVjdGVkQ2hhbmdlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdG9vbFwiPntzZWxlY3RlZENoYW5nZS50b29sfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDaGFuZ2UuaGFzRGlmZiA/IDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRDaGFuZ2UucGF0aCl9IHRpdGxlPXt0KCdlZGl0b3Iub3BlbkZpbGUnKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTcge3QoJ2VkaXRvci5vcGVuRmlsZScpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlLmhhc0RpZmYgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgdmlldyA9PT0gJ3NwbGl0JyAmJiBjaGFuZ2VTcGxpdEJsb2NrcyhzZWxlY3RlZENoYW5nZSkubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5iZWZvcmUnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYWZ0ZXInKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpLm1hcCgoYmxvY2ssIGJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0QW5jaG9yID0geyBvbGRMaW5lOiByb3cubGVmdE51bSwgbmV3TGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5sZWZ0TnVtICE9PSBudWxsID8gcm93LmxlZnROdW0gOiBudWxsIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEFuY2hvciA9IHsgb2xkTGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA6IG51bGwsIG5ld0xpbmU6IHJvdy5yaWdodE51bSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEtleSA9IGAke2xlZnRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7bGVmdEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRLZXkgPSBgJHtyaWdodEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtyaWdodEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBsZWZ0QW5jaG9yLm9sZExpbmUsIGxlZnRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgcmlnaHRBbmNob3Iub2xkTGluZSwgcmlnaHRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWVudEJ0biA9IChhbmNob3I6IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9LCBjb3VudDogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e2NvdW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk9wZW49eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZTogYW5jaG9yLm9sZExpbmUsIG5ld0xpbmU6IGFuY2hvci5uZXdMaW5lIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGVuQnRuID0gKGxpbmU6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1vcGVubGluZVwiIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gYXJpYS1sYWJlbD17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRDaGFuZ2UucGF0aCwgbGluZSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17cml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5sZWZ0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKGxlZnRBbmNob3IsIGxlZnRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cubGVmdE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LmxlZnROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsZWZ0Q29tbWVudHMubGVuZ3RoID4gMCA/IGxlZnRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e3VwZGF0ZUNvbW1lbnR9IG9uRGVsZXRlPXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9IHQ9e3R9IC8+KSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiBsZWZ0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHR9IG9uVGV4dD17c2V0Q29tbWVudFRleHR9IG9uU2F2ZT17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfSBvbkNhbmNlbD17Y2FuY2VsQ29tbWVudH0gYnVzeT17YnVzeX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17cm93LnJpZ2h0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEJ0bihyaWdodEFuY2hvciwgcmlnaHRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5yaWdodH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cucmlnaHROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLmxlbmd0aCA+IDAgPyByaWdodENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50RWRpdG9yICYmIHJpZ2h0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHR9IG9uVGV4dD17c2V0Q29tbWVudFRleHR9IG9uU2F2ZT17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfSBvbkNhbmNlbD17Y2FuY2VsQ29tbWVudH0gYnVzeT17YnVzeX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2Vzc2lvblJvd3NXaXRoTGluZXMoc2VsZWN0ZWRDaGFuZ2UpLm1hcCgoeyByb3csIG9sZExpbmUsIG5ld0xpbmUgfSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7b2xkTGluZSA/PyAnbyd9OiR7bmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIG9sZExpbmUsIG5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvd0FjdGlvbnMgPSByb3cua2luZCA9PT0gJ2N0eCcgfHwgcm93LmtpbmQgPT09ICdhZGQnIHx8IHJvdy5raW5kID09PSAnZGVsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17aX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9JHtyb3dDb21tZW50cy5sZW5ndGggPiAwID8gJyBkc2RyLWxpbmUtY29tbWVudGVkJyA6ICcnfWB9IGRhdGEtZHNkci1saW5lPXtuZXdMaW5lID8/IG9sZExpbmUgPz8gdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge25ld0xpbmUgPz8gb2xkTGluZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zID8gPENvbW1lbnRMaW5lIGNvdW50PXtyb3dDb21tZW50cy5sZW5ndGh9IG9uT3Blbj17KCkgPT4gb3BlbkNvbW1lbnQob2xkTGluZSwgbmV3TGluZSl9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS10ZXh0XCI+e3Jvdy50ZXh0IHx8ICcgJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgJiYgKG5ld0xpbmUgPz8gb2xkTGluZSkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItb3BlbmxpbmVcIiB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkQ2hhbmdlLnBhdGgsIG5ld0xpbmUgPz8gb2xkTGluZSA/PyAxKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zICYmIHJvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e3VwZGF0ZUNvbW1lbnR9IG9uRGVsZXRlPXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9IHQ9e3R9IC8+KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50RWRpdG9yICYmIGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gID09PSBrZXkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgICAgKSA6IGVycm9yICYmICFzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgIHtlcnJvcn1cbiAgICAgICAgICAgIDxkaXY+e3QoJ3Jldmlldy5ub3RSZXBvSGludCcpfTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJvZHlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLndvcmtzcGFjZScpfT5cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAge3N0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25TdGFnZWQnKX0gKHtzdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAge3Vuc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnKX0gKHt1bnN0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ3Vuc3RhZ2VkJyA/IChcbiAgICAgICAgICAgICAgICB1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnKX0gKHt1bnN0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17dW5zdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ3N0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2JyYW5jaCcgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgnc2NvcGUuYnJhbmNoJyl9IHtiYXNlQnJhbmNoID8gYFx1MjE5NCAke2Jhc2VCcmFuY2h9YCA6ICcnfSAoe3Njb3BlRmlsZXMubGVuZ3RofSlcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ub2RpZmZcIj57dCgnc2NvcGUuYnJhbmNoUmVhZG9ubHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzY29wZVRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj57dCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnbGFzdC10dXJuJyA/IChcbiAgICAgICAgICAgICAgICBzY29wZUZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdzY29wZS5sYXN0LXR1cm4nKX0gKHtzY29wZUZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5sYXN0VHVybkVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBoaXN0b3J5Lmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5oaXN0b3J5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGltZWxpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAge2hpc3RvcnkubWFwKChjb21taXQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2NvbW1pdC5oYXNofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10bC1pdGVtJHtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2ggPyAnIGRzZHItdGwtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGwtcmFpbFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWRvdCR7Y29tbWl0LmFoZWFkID8gJyBkc2RyLXRsLWRvdC1sb2NhbCcgOiAnIGRzZHItdGwtZG90LXJlbW90ZSd9YH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0Py5oYXNoID09PSBjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21taXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RDb21taXQoY29tbWl0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItdGwtYmFkZ2Uke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1iYWRnZS1sb2NhbCcgOiAnIGRzZHItdGwtYmFkZ2UtcmVtb3RlJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21taXQuYWhlYWQgPyB0KCdoaXN0b3J5LmxvY2FsJykgOiB0KCdoaXN0b3J5LnJlbW90ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zaG9ydFwiPntjb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LXN1YmplY3RcIiB0aXRsZT17Y29tbWl0LnN1YmplY3R9Pntjb21taXQuc3ViamVjdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtbWV0YVwiPntjb21taXQuYXV0aG9yfSBcdTAwQjcge3JlbGF0aXZlVGltZShjb21taXQuZGF0ZSwgdCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7KHNjb3BlID09PSAnYWxsJyB8fCBzY29wZSA9PT0gJ2NvbW1pdCcpICYmIHNlbGVjdGVkQ29tbWl0ICYmIGNvbW1pdERpZmY/Lm9rICYmIGNvbW1pdERpZmYuZmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LmNvbW1pdEZpbGVzJyl9ICh7Y29tbWl0RGlmZi5maWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICBub2Rlcz17Y29tbWl0RmlsZXNUcmVlfVxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXsoeyBpdGVtOiBmaWxlLCBuYW1lIH0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17c2VsZWN0ZWRDb21taXRGaWxlID09PSBmaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRoID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkQ29tbWl0RmlsZShmaWxlLnBhdGgpfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2hpcCBkc2RyLWNoaXAtbVwiPntmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdhbGwnID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkJyYW5jaCcpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1yZWZcIiB0aXRsZT17c3RhdHVzLnVwc3RyZWFtID8/IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtYXJyb3dcIj5cdTIxOTI8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy51cHN0cmVhbSA/PyB0KCdyZXZpZXcubm9VcHN0cmVhbScpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLXN0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFoZWFkXCI+e3QoJ3Jldmlldy5haGVhZCcsIHsgbjogc3RhdHVzLmFoZWFkIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYmVoaW5kID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWJlaGluZFwiPnt0KCdyZXZpZXcuYmVoaW5kJywgeyBuOiBzdGF0dXMuYmVoaW5kIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYWhlYWQgPT09IDAgJiYgc3RhdHVzLmJlaGluZCA9PT0gMCAmJiBzdGF0dXMudXBzdHJlYW0gPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zeW5jXCI+XHUyNzEzPC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuJHtjb25maXJtID09PSAncHVzaCcgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCAoc3RhdHVzPy5haGVhZCA/PyAwKSA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRDb21taXRPcGVuKHRydWUpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdwdXNoJyA/IHQoJ3Jldmlldy5jb25maXJtUHVzaCcpIDogYCR7dCgncmV2aWV3LnB1c2gnKX0keyhzdGF0dXM/LmFoZWFkID8/IDApID4gMCA/IGAgKCR7c3RhdHVzPy5haGVhZCA/PyAwfSlgIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtwcj8ucHIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci50aXRsZScsIHsgbnVtYmVyOiBwci5wci5udW1iZXIgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IGAgXHUwMEI3ICR7dCgncHIuY29tbWVudHMnLCB7IG46IHByLmNvbW1lbnRzLmxlbmd0aCB9KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXByXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdwci5ub1ByJyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXByLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUHJDb21tZW50Q2xpY2soY29tbWVudC5wYXRoLCBjb21tZW50LmxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudC5wYXRoID8gYCR7YmFzZU5hbWUoY29tbWVudC5wYXRoKX0ke2NvbW1lbnQubGluZSA/IGA6JHtjb21tZW50LmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCd9IFx1MDBCNyB7Y29tbWVudC5hdXRob3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcHItdGV4dFwiPntjb21tZW50LmJvZHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VQck1lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci5zZW5kQ29tbWVudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgIHtyZXZpZXc/Lm9rID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci12ZXJkaWN0JHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnIGRzZHItdmVyZGljdC1iYWQnIDogJyBkc2RyLXZlcmRpY3Qtb2snfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1hcmtcIj57cmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gJ1x1MjcxNycgOiAnXHUyNzEzJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXZlcmRpY3QtdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7cmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gdCgncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnKSA6IHQoJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCcpfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gdCgncmV2aWV3LmZpbmRpbmdzJywgeyBuOiByZXZpZXcuZmluZGluZ3MubGVuZ3RoIH0pIDogdCgncmV2aWV3Lm5vRmluZGluZ3MnKX1cbiAgICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAge3Jldmlldy5tb2RlbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdmVyZGljdC1tb2RlbFwiPntyZXZpZXcubW9kZWwucHJvdmlkZXJ9L3tyZXZpZXcubW9kZWwubW9kZWx9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VGaW5kaW5nc01lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZEZpbmRpbmdzJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQgPyAoXG4gICAgICAgICAgICAgICAgY29tbWl0RGlmZkxvYWRpbmcgPyAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiBjb21taXREaWZmPy5vayA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhhc2hcIj57c2VsZWN0ZWRDb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5hdXRob3J9IFx1MDBCNyB7cmVsYXRpdmVUaW1lKHNlbGVjdGVkQ29tbWl0LmRhdGUsIHQpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdERpZmYuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdERpZmYuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPERpZmZWaWV3VG9nZ2xlIHZpZXc9e3ZpZXd9IG9uQ2hhbmdlPXtzZXRWaWV3fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge2NvbW1pdEFjdGl2ZUZpbGUgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1maWxlLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e2NvbW1pdEFjdGl2ZUZpbGUucGF0aH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2hpcCBkc2RyLWNoaXAtbVwiPntjb21taXRGaWxlU3RhdHVzKGNvbW1pdFNlZ21lbnRzLmZpbmQoKHMpID0+IHMucGF0aCA9PT0gY29tbWl0QWN0aXZlRmlsZS5wYXRoKT8udGV4dCA/PyAnJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1maWxlLXBhdGhcIj57Y29tbWl0QWN0aXZlRmlsZS5wYXRofTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBjb21taXRBY3RpdmVGaWxlLmFkZGVkLCBkZWxldGVkOiBjb21taXRBY3RpdmVGaWxlLmRlbGV0ZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7dmlldyA9PT0gJ3NwbGl0JyAmJiBnaXRTcGxpdEJsb2Nrcyhjb21taXRBY3RpdmVUZXh0KS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxTcGxpdERpZmYgYmxvY2tzPXtnaXRTcGxpdEJsb2Nrcyhjb21taXRBY3RpdmVUZXh0KX0gYmVmb3JlTGFiZWw9e3QoJ3ZpZXcuYmVmb3JlJyl9IGFmdGVyTGFiZWw9e3QoJ3ZpZXcuYWZ0ZXInKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge2dpdERpZmZSb3dzKGNvbW1pdEFjdGl2ZVRleHQpLm1hcCgocm93LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH1gfT57cm93LnRleHQgfHwgJyAnfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWVtcHR5XCI+e2NvbW1pdERpZmY/LmVycm9yID8/IHQoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogc2VsZWN0ZWRGaWxlID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1wYXRoXCIgdGl0bGU9e3NlbGVjdGVkRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkRmlsZS5vcmlnUGF0aCA/IGAgXHUyMTkwICR7c2VsZWN0ZWRGaWxlLm9yaWdQYXRofWAgOiAnJ31cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogc2VsZWN0ZWRGaWxlLmFkZGVkLCBkZWxldGVkOiBzZWxlY3RlZEZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8RGlmZlZpZXdUb2dnbGUgdmlldz17dmlld30gb25DaGFuZ2U9e3NldFZpZXd9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRGaWxlLnBhdGgpfSB0aXRsZT17dCgnZWRpdG9yLm9wZW5GaWxlJyl9PlxuICAgICAgICAgICAgICAgICAgICAgIFx1MjE5NyB7dCgnZWRpdG9yLm9wZW5GaWxlJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zICYmIHNlbGVjdGVkRmlsZS51bnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0biBkc2RyLWJ0bi1wcmltYXJ5XCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbignYWNjZXB0Jywgc2VsZWN0ZWRGaWxlLnBhdGgpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuYWNjZXB0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zICYmIHNlbGVjdGVkRmlsZS5zdGFnZWQgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCd1bnN0YWdlJywgc2VsZWN0ZWRGaWxlLnBhdGgpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcudW5zdGFnZScpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuIGRzZHItYnRuLWRhbmdlciR7Y29uZmlybSA9PT0gJ2ZpbGUnID8gJyBkc2RyLWJ0bi1jb25maXJtJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbigncmV2ZXJ0Jywgc2VsZWN0ZWRGaWxlLnBhdGgpfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb25maXJtID09PSAnZmlsZScgPyB0KCdyZXZpZXcuY29uZmlybVJldmVydCcpIDogdCgncmV2aWV3LnJldmVydCcpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3ZpZXcgPT09ICdzcGxpdCcgJiYgIXNlbGVjdGVkRmlsZS5iaW5hcnkgJiYgZ2l0U3BsaXRCbG9ja3Moc2VsZWN0ZWRGaWxlLmRpZmYpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYmVmb3JlJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYWZ0ZXInKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Z2l0U3BsaXRCbG9ja3Moc2VsZWN0ZWRGaWxlLmRpZmYpLm1hcCgoYmxvY2ssIGJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2JpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YWxsb3dBY3Rpb25zID8gPEh1bmtUb29sYmFyIGh1bms9e3NlbGVjdGVkRmlsZS5odW5rc1tiaV19IGJ1c3k9e2J1c3l9IG9uQWN0aW9uPXtvbkh1bmtBY3Rpb259IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1odW5rXCI+e2Jsb2NrLmhlYWR9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvd0ZpbmRpbmdzID0gKHJldmlldz8uZmluZGluZ3MgPz8gW10pLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGYpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZi5maWxlID09PSBzZWxlY3RlZEZpbGUucGF0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyb3cucmlnaHROdW0gIT09IG51bGwgPyByb3cucmlnaHROdW0gPj0gZi5saW5lU3RhcnQgJiYgcm93LnJpZ2h0TnVtIDw9IGYubGluZUVuZCA6IHJvdy5sZWZ0TnVtICE9PSBudWxsICYmIHJvdy5sZWZ0TnVtID49IGYubGluZVN0YXJ0ICYmIHJvdy5sZWZ0TnVtIDw9IGYubGluZUVuZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5nQ2xzID0gcm93RmluZGluZ3MubGVuZ3RoID4gMCA/IGAgZHNkci1jZWxsLWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YCA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBqdW1wZWQgPSBqdW1wTGluZSAhPSBudWxsICYmIChyb3cucmlnaHROdW0gPT09IGp1bXBMaW5lIHx8IChyb3cucmlnaHROdW0gPT09IG51bGwgJiYgcm93LmxlZnROdW0gPT09IGp1bXBMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvbW1lbnQgYW5jaG9ycyBzdGF5IGNvbnNpc3RlbnQgd2l0aCB0aGUgdW5pZmllZCB2aWV3OiBjdHggcm93cyBleHBvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJvdGggbGluZSBudW1iZXJzLCBjaGFuZ2Ugcm93cyBleHBvc2UgdGhlIHNpZGUgdGhleSBiZWxvbmcgdG8uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0QW5jaG9yID0geyBvbGRMaW5lOiByb3cubGVmdE51bSwgbmV3TGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5sZWZ0TnVtICE9PSBudWxsID8gcm93LmxlZnROdW0gOiBudWxsIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0QW5jaG9yID0geyBvbGRMaW5lOiByb3cua2luZCA9PT0gJ2N0eCcgJiYgcm93LnJpZ2h0TnVtICE9PSBudWxsID8gcm93LnJpZ2h0TnVtIDogbnVsbCwgbmV3TGluZTogcm93LnJpZ2h0TnVtIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnRLZXkgPSBgJHtsZWZ0QW5jaG9yLm9sZExpbmUgPz8gJ28nfToke2xlZnRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRLZXkgPSBgJHtyaWdodEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtyaWdodEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIGxlZnRBbmNob3Iub2xkTGluZSwgbGVmdEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIHJpZ2h0QW5jaG9yLm9sZExpbmUsIHJpZ2h0QW5jaG9yLm5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3BlbkJ0biA9IChsaW5lOiBudW1iZXIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRmlsZS5wYXRoID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtb3BlbmxpbmVcIiB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkRmlsZS5wYXRoLCBsaW5lKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbW1lbnRCdG4gPSAoYW5jaG9yOiB7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfSwgY291bnQ6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3VudD17Y291bnR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25PcGVuPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZTogYW5jaG9yLm9sZExpbmUsIG5ld0xpbmU6IGFuY2hvci5uZXdMaW5lIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cubGVmdE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtZGVsJyA6ICcnfSR7ZmluZGluZ0Nsc30ke2p1bXBlZCA/ICcgZHNkci1jZWxsLWp1bXAnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5sZWZ0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4obGVmdEFuY2hvciwgbGVmdENvbW1lbnRzLmxlbmd0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5sZWZ0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cubGVmdE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93RmluZGluZ3MubGVuZ3RoID4gMCAmJiByb3cucmlnaHROdW0gPT09IG51bGwgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YH0+e3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bGVmdENvbW1lbnRzLmxlbmd0aCA+IDAgPyBsZWZ0Q29tbWVudHMubWFwKChjb21tZW50KSA9PiA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXt1cGRhdGVDb21tZW50fSBvbkRlbGV0ZT17KGlkKSA9PiB2b2lkIGRlbGV0ZUNvbW1lbnQoaWQpfSB0PXt0fSAvPikgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiBsZWZ0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWNlbGwgJHtyb3cucmlnaHROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWFkZCcgOiAnJ30ke2ZpbmRpbmdDbHN9JHtqdW1wZWQgPyAnIGRzZHItY2VsbC1qdW1wJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtyb3cucmlnaHROdW0gPz8gdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRCdG4ocmlnaHRBbmNob3IsIHJpZ2h0Q29tbWVudHMubGVuZ3RoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LnJpZ2h0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5yaWdodE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LnJpZ2h0TnVtKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3dGaW5kaW5ncy5sZW5ndGggPiAwICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtZmluZGluZyBkc2RyLWZpbmRpbmctJHtyb3dGaW5kaW5nc1swXS5wcmlvcml0eX1gfT57cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLmxlbmd0aCA+IDAgPyByaWdodENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgcmlnaHRLZXkgPT09IGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0fSBvblRleHQ9e3NldENvbW1lbnRUZXh0fSBvblNhdmU9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX0gb25DYW5jZWw9e2NhbmNlbENvbW1lbnR9IGJ1c3k9e2J1c3l9IHQ9e3R9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KHJldmlldz8uZmluZGluZ3MgPz8gW10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChmKSA9PiBmLmZpbGUgPT09IHNlbGVjdGVkRmlsZS5wYXRoICYmIGYubGluZVN0YXJ0ID09PSAocm93LmxlZnROdW0gPz8gcm93LnJpZ2h0TnVtKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGYsIGZpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaW5kaW5nQ2FyZCBrZXk9e2Ake2YuZmlsZX06JHtmLmxpbmVTdGFydH06JHtmaX1gfSBmaW5kaW5nPXtmfSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8VW5pZmllZERpZmZcbiAgICAgICAgICAgICAgICAgICAgICBkaWZmPXtzZWxlY3RlZEZpbGUuZGlmZn1cbiAgICAgICAgICAgICAgICAgICAgICBodW5rcz17c2VsZWN0ZWRGaWxlLmh1bmtzfVxuICAgICAgICAgICAgICAgICAgICAgIGJ1c3k9e2J1c3l9XG4gICAgICAgICAgICAgICAgICAgICAgb25IdW5rQWN0aW9uPXtvbkh1bmtBY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgdD17dH1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50cz17Y29tbWVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudEVkaXRvcj17Y29tbWVudEVkaXRvcn1cbiAgICAgICAgICAgICAgICAgICAgICBjb21tZW50VGV4dD17Y29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25Db21tZW50VGV4dD17c2V0Q29tbWVudFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuQ29tbWVudD17b3BlbkNvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgb25TYXZlQ29tbWVudD17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsQ29tbWVudD17Y2FuY2VsQ29tbWVudH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZUNvbW1lbnQ9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX1cbiAgICAgICAgICAgICAgICAgICAgICBvblVwZGF0ZUNvbW1lbnQ9e3VwZGF0ZUNvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgcmVhZE9ubHk9eyFhbGxvd0FjdGlvbnN9XG4gICAgICAgICAgICAgICAgICAgICAgcGF0aD17c2VsZWN0ZWRGaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgcmV2aWV3RmluZGluZ3M9e3Jldmlldz8uZmluZGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgb25PcGVuTGluZT17KHAsIGxpbmUpID0+IHZvaWQgb3BlbkZpbGUocCwgbGluZSl9XG4gICAgICAgICAgICAgICAgICAgICAganVtcExpbmU9e2p1bXBMaW5lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntzY29wZSA9PT0gJ2NvbW1pdCcgPyB0KCdyZXZpZXcuc2VsZWN0Q29tbWl0JykgOiB0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yID8/IHQoJ3Jldmlldy5sb2FkRXJyb3InKX1cbiAgICAgICAgICAgIHshc3RhdHVzPy5pc1JlcG8gPyA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgICAgPC8+XG4gICAgICAgICl9XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZvb3RcIj5cbiAgICAgICAgICB7KGxvYWRpbmcgfHwgYnVzeSkgJiYgdGFiID09PSAnd29ya3NwYWNlJyA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3Bpbm5lclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7YnVzeSA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbm90aWNlXCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAge25vdGljZSA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItbm90aWNlIGRzZHItbm90aWNlLSR7bm90aWNlLmtpbmR9YH0+e25vdGljZS50ZXh0fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBDb25maWcgY2FyZCBmb3IgdGhlIFBsdWdpbnMgY29uZmlndXJhdGlvbiB0YWIgKFNldHRpbmdzIFx1MjE5MiBQbHVnaW5zIFx1MjE5MiBcdTUzRUZcdTkxNERcdTdGNkUpLiAqL1xuZnVuY3Rpb24gRGlmZlJldmlld0NvbmZpZ0NhcmQoeyB0IH06IHsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgcmV0dXJuIChcbiAgICA8bGkgY2xhc3NOYW1lPXtvcGVuID8gJ2RzZHItY2ZnLWNhcmQgZHNkci1jZmctY2FyZC1vcGVuJyA6ICdkc2RyLWNmZy1jYXJkJ30+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWNmZy1oZWFkXCIgYXJpYS1leHBhbmRlZD17b3Blbn0gb25DbGljaz17KCkgPT4gc2V0T3BlbigodikgPT4gIXYpfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZC10ZXh0XCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbmFtZVwiPnt0KCdzZXR0aW5ncy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1kZXNjXCI+e3QoJ2NvbmZpZy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8SWNvbkNoZXZyb25Eb3duT3V0bGluZTE0IGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJldCBkc2RyLWNmZy1jYXJldC1vcGVuJyA6ICdkc2RyLWNmZy1jYXJldCd9IC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWJvZHlcIj5cbiAgICAgICAgICA8RGlmZlJldmlld1ByZWZzIHQ9e3R9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9saT5cbiAgKVxufVxuXG4vKiogQ2xpZW50IHBsdWdpbiBib2R5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5KGN0eDogQ2xpZW50Q29udGV4dCk6IHZvaWQge1xuICBjdHguZWZmZWN0KCgpID0+IGN0eC5sb2NhbGUucmVnaXN0ZXIoTE9DQUxFX05TLCB7IHpoLCBlbiB9KSwgJ2RpZmYtcmV2aWV3OiBsb2NhbGUgZGljdGlvbmFyeScpXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5zZXNzaW9uLmhlYWRlci5hY3Rpb25zJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXcnLFxuICAgICAgICBvcmRlcjogNzAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdBY3Rpb24sXG4gICAgKSxcbiAgKVxuICBjdHguc2xvdHMuaW5qZWN0KCdzaGVsbC5vdmVybGF5JywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzaGVsbC5vdmVybGF5JyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1vdmVybGF5JyxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgICAgaW5qZWN0OiAoKSA9PiAoeyBzZXNzaW9uczogY3R4LnNlc3Npb25zIH0pLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdPdmVybGF5LFxuICAgICksXG4gIClcbiAgLy8gQ29kZXgtc3R5bGUgcGVuZGluZy1jb21tZW50cyBzdHJpcCBhdCB0aGUgVE9QIG9mIHRoZSBjb21wb3Nlciwgc3R5bGVkIGFzXG4gIC8vIHRoZSBjYXJkJ3Mgb3duIHN1cmZhY2Ugc28gaXQgcmVhZHMgYXMgb25lIGZ1c2VkIGRpYWxvZy5cbiAgY3R4LnNsb3RzLmluamVjdCgnY29udmVyc2F0aW9uLmlucHV0LmRvY2snLCAoKSA9PlxuICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1jb21tZW50cy1kb2NrJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgICAgaW5qZWN0OiAoKSA9PiAoeyBzZXNzaW9uczogY3R4LnNlc3Npb25zIH0pLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdDb21wb3NlckRvY2ssXG4gICAgKSxcbiAgKVxuICAvLyBUaGUgZW5naW5lJ3MgdHVybiB0YWlsIHNpdHMgZGlyZWN0bHkgYWZ0ZXIgYSBjb21wbGV0ZWQgYWdlbnQgcmVzcG9uc2UuXG4gIC8vIEl0cyBjaGFpbiBzZWxlY3RvciByZXR1cm5zIHRoZSBvd25lciBjdXJyZW5jeTsgdGhlIGNvbXBvbmVudCBkZWNsaW5lc1xuICAvLyB0dXJucyB3aXRob3V0IHBlcnNpc3RlZCBmaWxlIGNoYW5nZXMuXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5jaGF0LnR1cm5UYWlsJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uY2hhdC50dXJuVGFpbCcsXG4gICAgICAgIHNlbGVjdDogKG93bmVyKSA9PiBvd25lcixcbiAgICAgICAgcHJpb3JpdHk6IC0xMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICB9LFxuICAgICAgVHVybkNoYW5nZVN1bW1hcnksXG4gICAgKSxcbiAgKVxuICAvLyBUaGUgY2FycmllZCByZXZpZXcgcGFja2FnZSByZW5kZXJzIGluIHRoZSB0cmFuc2NyaXB0IGFzIGEgQ29kZXgtc3R5bGVcbiAgLy8gY2FyZDogc2hhZG93IHRoZSBzaGVsbCdzIHVzZXItbm9kZSByZW5kZXJlciAocHJpb3JpdHkgLTEgPSBsb3dlc3Qgd2lucylcbiAgLy8gYW5kIHJlLXJlbmRlciBub24tcGFja2FnZSBtZXNzYWdlcyB3aXRoIGEgbmF0aXZlLWxvb2sgYnViYmxlLiBUaGVcbiAgLy8gc3RlZXJpbmcga2luZCBnZXRzIHRoZSBzYW1lIHRyZWF0bWVudCBcdTIwMTQgdGhlIHBhY2thZ2UgaXMgaW5qZWN0ZWQgd2l0aFxuICAvLyBwcm9tcHQoLi4uLCAnc3RlZXInKSwgc28gaXQgbGFuZHMgaW4gdGhlIHRyYW5zY3JpcHQgYXMgYSBzdGVlcmluZyBub2RlLlxuICBmb3IgKGNvbnN0IGtleSBvZiBbJ3VzZXInLCAnc3RlZXJpbmcnXSBhcyBjb25zdCkge1xuICAgIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5jaGF0Lm5vZGUnLCAoKSA9PlxuICAgICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ2NvbnZlcnNhdGlvbi5jaGF0Lm5vZGUnLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICBwcmlvcml0eTogLTEsXG4gICAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIH0sXG4gICAgICAgIFVzZXJSZXZpZXdOb2RlVmlldyxcbiAgICAgICksXG4gICAgKVxuICB9XG4gIC8vIFRoZSBwbHVnaW4ncyBvd24gc2V0dGluZ3MgdGFiIGluc2lkZSBcdThCQkVcdTdGNkUgXHUyMTkyIFx1NjNEMlx1NEVGNiAobm90IHRoZSBHZW5lcmFsIHNlY3Rpb24pLlxuICAvLyBUaGUgcGx1Z2luJ3Mgd2hvbGUgY29uZmlndXJhdGlvbiBsaXZlcyBpbiBvbmUgY2FyZCBpbnNpZGVcbiAgLy8gXHU4QkJFXHU3RjZFIFx1MjE5MiBcdTYzRDJcdTRFRjYgXHUyMTkyIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RSAoc2V0dGluZ3MucGx1Z2luLml0ZW0pOiBmb250L3NpemUuXG4gIGN0eC5zbG90cy5pbmplY3QoJ3NldHRpbmdzLnBsdWdpbi5pdGVtJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzZXR0aW5ncy5wbHVnaW4uaXRlbScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29uZmlnJyxcbiAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29uZmlnQ2FyZCxcbiAgICApLFxuICApXG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZiB7XG4gICAgZGlmZihvbGRTdHIsIG5ld1N0ciwgXG4gICAgLy8gVHlwZSBiZWxvdyBpcyBub3QgYWNjdXJhdGUvY29tcGxldGUgLSBzZWUgYWJvdmUgZm9yIGZ1bGwgcG9zc2liaWxpdGllcyAtIGJ1dCBpdCBjb21waWxlc1xuICAgIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBsZXQgY2FsbGJhY2s7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCdjYWxsYmFjaycgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IHN1YmNsYXNzZXMgdG8gbWFzc2FnZSB0aGUgaW5wdXQgcHJpb3IgdG8gcnVubmluZ1xuICAgICAgICBjb25zdCBvbGRTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChvbGRTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBuZXdTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChuZXdTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBvbGRUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUob2xkU3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIGNvbnN0IG5ld1Rva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShuZXdTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBkb25lID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucG9zdFByb2Nlc3ModmFsdWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNhbGxiYWNrKHZhbHVlKTsgfSwgMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IGVkaXRMZW5ndGggPSAxO1xuICAgICAgICBsZXQgbWF4RWRpdExlbmd0aCA9IG5ld0xlbiArIG9sZExlbjtcbiAgICAgICAgaWYgKG9wdGlvbnMubWF4RWRpdExlbmd0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXhFZGl0TGVuZ3RoID0gTWF0aC5taW4obWF4RWRpdExlbmd0aCwgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhFeGVjdXRpb25UaW1lID0gKF9hID0gb3B0aW9ucy50aW1lb3V0KSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgYWJvcnRBZnRlclRpbWVzdGFtcCA9IERhdGUubm93KCkgKyBtYXhFeGVjdXRpb25UaW1lO1xuICAgICAgICBjb25zdCBiZXN0UGF0aCA9IFt7IG9sZFBvczogLTEsIGxhc3RDb21wb25lbnQ6IHVuZGVmaW5lZCB9XTtcbiAgICAgICAgLy8gU2VlZCBlZGl0TGVuZ3RoID0gMCwgaS5lLiB0aGUgY29udGVudCBzdGFydHMgd2l0aCB0aGUgc2FtZSB2YWx1ZXNcbiAgICAgICAgbGV0IG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiZXN0UGF0aFswXSwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIDAsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoYmVzdFBhdGhbMF0ub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgIC8vIElkZW50aXR5IHBlciB0aGUgZXF1YWxpdHkgYW5kIHRva2VuaXplclxuICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiZXN0UGF0aFswXS5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2Ugd2UgaGl0IHRoZSByaWdodCBlZGdlIG9mIHRoZSBlZGl0IGdyYXBoIG9uIHNvbWUgZGlhZ29uYWwgaywgd2UgY2FuXG4gICAgICAgIC8vIGRlZmluaXRlbHkgcmVhY2ggdGhlIGVuZCBvZiB0aGUgZWRpdCBncmFwaCBpbiBubyBtb3JlIHRoYW4gayBlZGl0cywgc29cbiAgICAgICAgLy8gdGhlcmUncyBubyBwb2ludCBpbiBjb25zaWRlcmluZyBhbnkgbW92ZXMgdG8gZGlhZ29uYWwgaysxIGFueSBtb3JlIChmcm9tXG4gICAgICAgIC8vIHdoaWNoIHdlJ3JlIGd1YXJhbnRlZWQgdG8gbmVlZCBhdCBsZWFzdCBrKzEgbW9yZSBlZGl0cykuXG4gICAgICAgIC8vIFNpbWlsYXJseSwgb25jZSB3ZSd2ZSByZWFjaGVkIHRoZSBib3R0b20gb2YgdGhlIGVkaXQgZ3JhcGgsIHRoZXJlJ3Mgbm9cbiAgICAgICAgLy8gcG9pbnQgY29uc2lkZXJpbmcgbW92ZXMgdG8gbG93ZXIgZGlhZ29uYWxzLlxuICAgICAgICAvLyBXZSByZWNvcmQgdGhpcyBmYWN0IGJ5IHNldHRpbmcgbWluRGlhZ29uYWxUb0NvbnNpZGVyIGFuZFxuICAgICAgICAvLyBtYXhEaWFnb25hbFRvQ29uc2lkZXIgdG8gc29tZSBmaW5pdGUgdmFsdWUgb25jZSB3ZSd2ZSBoaXQgdGhlIGVkZ2Ugb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGguXG4gICAgICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGlzIG5vdCBmYWl0aGZ1bCB0byB0aGUgb3JpZ2luYWwgYWxnb3JpdGhtIHByZXNlbnRlZCBpblxuICAgICAgICAvLyBNeWVycydzIHBhcGVyLCB3aGljaCBpbnN0ZWFkIHBvaW50bGVzc2x5IGV4dGVuZHMgRC1wYXRocyBvZmYgdGhlIGVuZCBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaCAtIHNlZSBwYWdlIDcgb2YgTXllcnMncyBwYXBlciB3aGljaCBub3RlcyB0aGlzIHBvaW50XG4gICAgICAgIC8vIGV4cGxpY2l0bHkgYW5kIGlsbHVzdHJhdGVzIGl0IHdpdGggYSBkaWFncmFtLiBUaGlzIGhhcyBtYWpvciBwZXJmb3JtYW5jZVxuICAgICAgICAvLyBpbXBsaWNhdGlvbnMgZm9yIHNvbWUgY29tbW9uIHNjZW5hcmlvcy4gRm9yIGluc3RhbmNlLCB0byBjb21wdXRlIGEgZGlmZlxuICAgICAgICAvLyB3aGVyZSB0aGUgbmV3IHRleHQgc2ltcGx5IGFwcGVuZHMgZCBjaGFyYWN0ZXJzIG9uIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIHRleHQgb2YgbGVuZ3RoIG4sIHRoZSB0cnVlIE15ZXJzIGFsZ29yaXRobSB3aWxsIHRha2UgTyhuK2ReMilcbiAgICAgICAgLy8gdGltZSB3aGlsZSB0aGlzIG9wdGltaXphdGlvbiBuZWVkcyBvbmx5IE8obitkKSB0aW1lLlxuICAgICAgICBsZXQgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gLUluZmluaXR5LCBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBJbmZpbml0eTtcbiAgICAgICAgLy8gTWFpbiB3b3JrZXIgbWV0aG9kLiBjaGVja3MgYWxsIHBlcm11dGF0aW9ucyBvZiBhIGdpdmVuIGVkaXQgbGVuZ3RoIGZvciBhY2NlcHRhbmNlLlxuICAgICAgICBjb25zdCBleGVjRWRpdExlbmd0aCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGRpYWdvbmFsUGF0aCA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgLWVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggPD0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBlZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoICs9IDIpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdLCBhZGRQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gb25lIGVsc2UgaXMgZ29pbmcgdG8gYXR0ZW1wdCB0byB1c2UgdGhpcyB2YWx1ZSwgY2xlYXIgaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjYW5BZGQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGF0IG5ld1BvcyB3aWxsIGJlIGFmdGVyIHdlIGRvIGFuIGluc2VydGlvbjpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkUGF0aE5ld1BvcyA9IGFkZFBhdGgub2xkUG9zIC0gZGlhZ29uYWxQYXRoO1xuICAgICAgICAgICAgICAgICAgICBjYW5BZGQgPSBhZGRQYXRoICYmIDAgPD0gYWRkUGF0aE5ld1BvcyAmJiBhZGRQYXRoTmV3UG9zIDwgbmV3TGVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBjYW5SZW1vdmUgPSByZW1vdmVQYXRoICYmIHJlbW92ZVBhdGgub2xkUG9zICsgMSA8IG9sZExlbjtcbiAgICAgICAgICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgcGF0aCBpcyBhIHRlcm1pbmFsIHRoZW4gcHJ1bmVcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgZGlhZ29uYWwgdGhhdCB3ZSB3YW50IHRvIGJyYW5jaCBmcm9tLiBXZSBzZWxlY3QgdGhlIHByaW9yXG4gICAgICAgICAgICAgICAgLy8gcGF0aCB3aG9zZSBwb3NpdGlvbiBpbiB0aGUgb2xkIHN0cmluZyBpcyB0aGUgZmFydGhlc3QgZnJvbSB0aGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRvZXMgbm90IHBhc3MgdGhlIGJvdW5kcyBvZiB0aGUgZGlmZiBncmFwaFxuICAgICAgICAgICAgICAgIGlmICghY2FuUmVtb3ZlIHx8IChjYW5BZGQgJiYgcmVtb3ZlUGF0aC5vbGRQb3MgPCBhZGRQYXRoLm9sZFBvcykpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChhZGRQYXRoLCB0cnVlLCBmYWxzZSwgMCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKHJlbW92ZVBhdGgsIGZhbHNlLCB0cnVlLCAxLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpIHx8IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlZGl0TGVuZ3RoKys7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcmZvcm1zIHRoZSBsZW5ndGggb2YgZWRpdCBpdGVyYXRpb24uIElzIGEgYml0IGZ1Z2x5IGFzIHRoaXMgaGFzIHRvIHN1cHBvcnQgdGhlXG4gICAgICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAgICAgLy8gaXMgcHJvZHVjZWQsIG9yIHVudGlsIHRoZSBlZGl0IGxlbmd0aCBleGNlZWRzIG9wdGlvbnMubWF4RWRpdExlbmd0aCAoaWYgZ2l2ZW4pLFxuICAgICAgICAvLyBpbiB3aGljaCBjYXNlIGl0IHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoIHx8IERhdGUubm93KCkgPiBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChlZGl0TGVuZ3RoIDw9IG1heEVkaXRMZW5ndGggJiYgRGF0ZS5ub3coKSA8PSBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFRvUGF0aChwYXRoLCBhZGRlZCwgcmVtb3ZlZCwgb2xkUG9zSW5jLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwYXRoLmxhc3RDb21wb25lbnQ7XG4gICAgICAgIGlmIChsYXN0ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IGxhc3QuY291bnQgKyAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0LnByZXZpb3VzQ29tcG9uZW50IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IG9sZFBvcyA9IGJhc2VQYXRoLm9sZFBvcywgbmV3UG9zID0gb2xkUG9zIC0gZGlhZ29uYWxQYXRoLCBjb21tb25Db3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChuZXdQb3MgKyAxIDwgbmV3TGVuICYmIG9sZFBvcyArIDEgPCBvbGRMZW4gJiYgdGhpcy5lcXVhbHMob2xkVG9rZW5zW29sZFBvcyArIDFdLCBuZXdUb2tlbnNbbmV3UG9zICsgMV0sIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBuZXdQb3MrKztcbiAgICAgICAgICAgIG9sZFBvcysrO1xuICAgICAgICAgICAgY29tbW9uQ291bnQrKztcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IDEsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbkNvdW50ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogY29tbW9uQ291bnQsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgYmFzZVBhdGgub2xkUG9zID0gb2xkUG9zO1xuICAgICAgICByZXR1cm4gbmV3UG9zO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29tcGFyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY29tcGFyYXRvcihsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHRcbiAgICAgICAgICAgICAgICB8fCAoISFvcHRpb25zLmlnbm9yZUNhc2UgJiYgbGVmdC50b0xvd2VyQ2FzZSgpID09PSByaWdodC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVFbXB0eShhcnJheSkge1xuICAgICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBjYXN0SW5wdXQodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xuICAgIH1cbiAgICBqb2luKGNoYXJzKSB7XG4gICAgICAgIC8vIEFzc3VtZXMgVmFsdWVUIGlzIHN0cmluZywgd2hpY2ggaXMgdGhlIGNhc2UgZm9yIG1vc3Qgc3ViY2xhc3Nlcy5cbiAgICAgICAgLy8gV2hlbiBpdCdzIGZhbHNlLCBlLmcuIGluIGRpZmZBcnJheXMsIHRoaXMgbWV0aG9kIG5lZWRzIHRvIGJlIG92ZXJyaWRkZW4gKGUuZy4gd2l0aCBhIG5vLW9wKVxuICAgICAgICAvLyBZZXMsIHRoZSBjYXN0cyBhcmUgdmVyYm9zZSBhbmQgdWdseSwgYmVjYXVzZSB0aGlzIHBhdHRlcm4gLSBvZiBoYXZpbmcgdGhlIGJhc2UgY2xhc3MgU09SVCBPRlxuICAgICAgICAvLyBhc3N1bWUgdG9rZW5zIGFuZCB2YWx1ZXMgYXJlIHN0cmluZ3MsIGJ1dCBub3QgY29tcGxldGVseSAtIGlzIHdlaXJkIGFuZCBqYW5reS5cbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH1cbiAgICBwb3N0UHJvY2VzcyhjaGFuZ2VPYmplY3RzLCBcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gY2hhbmdlT2JqZWN0cztcbiAgICB9XG4gICAgZ2V0IHVzZUxvbmdlc3RUb2tlbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBidWlsZFZhbHVlcyhsYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2Vucykge1xuICAgICAgICAvLyBGaXJzdCB3ZSBjb252ZXJ0IG91ciBsaW5rZWQgbGlzdCBvZiBjb21wb25lbnRzIGluIHJldmVyc2Ugb3JkZXIgdG8gYW5cbiAgICAgICAgLy8gYXJyYXkgaW4gdGhlIHJpZ2h0IG9yZGVyOlxuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gW107XG4gICAgICAgIGxldCBuZXh0Q29tcG9uZW50O1xuICAgICAgICB3aGlsZSAobGFzdENvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGxhc3RDb21wb25lbnQpO1xuICAgICAgICAgICAgbmV4dENvbXBvbmVudCA9IGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBkZWxldGUgbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGxhc3RDb21wb25lbnQgPSBuZXh0Q29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbXBvbmVudHMucmV2ZXJzZSgpO1xuICAgICAgICBjb25zdCBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aDtcbiAgICAgICAgbGV0IGNvbXBvbmVudFBvcyA9IDAsIG5ld1BvcyA9IDAsIG9sZFBvcyA9IDA7XG4gICAgICAgIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wb25lbnRzW2NvbXBvbmVudFBvc107XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQgJiYgdGhpcy51c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9sZFRva2Vuc1tvbGRQb3MgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGRWYWx1ZS5sZW5ndGggPiB2YWx1ZS5sZW5ndGggPyBvbGRWYWx1ZSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG9sZFRva2Vucy5zbGljZShvbGRQb3MsIG9sZFBvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHM7XG4gICAgfVxufVxuIiwgImltcG9ydCBEaWZmIGZyb20gJy4vYmFzZS5qcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZU9wdGlvbnMgfSBmcm9tICcuLi91dGlsL3BhcmFtcy5qcyc7XG5jbGFzcyBMaW5lRGlmZiBleHRlbmRzIERpZmYge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnRva2VuaXplID0gdG9rZW5pemU7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICAvLyBJZiB3ZSdyZSBpZ25vcmluZyB3aGl0ZXNwYWNlLCB3ZSBuZWVkIHRvIG5vcm1hbGlzZSBsaW5lcyBieSBzdHJpcHBpbmdcbiAgICAgICAgLy8gd2hpdGVzcGFjZSBiZWZvcmUgY2hlY2tpbmcgZXF1YWxpdHkuIChUaGlzIGhhcyBhbiBhbm5veWluZyBpbnRlcmFjdGlvblxuICAgICAgICAvLyB3aXRoIG5ld2xpbmVJc1Rva2VuIHRoYXQgcmVxdWlyZXMgc3BlY2lhbCBoYW5kbGluZzogaWYgbmV3bGluZXMgZ2V0IHRoZWlyXG4gICAgICAgIC8vIG93biB0b2tlbiwgdGhlbiB3ZSBET04nVCB3YW50IHRvIHRyaW0gdGhlICpuZXdsaW5lKiB0b2tlbnMgZG93biB0byBlbXB0eVxuICAgICAgICAvLyBzdHJpbmdzLCBzaW5jZSB0aGlzIHdvdWxkIGNhdXNlIHVzIHRvIHRyZWF0IHdoaXRlc3BhY2Utb25seSBsaW5lIGNvbnRlbnRcbiAgICAgICAgLy8gYXMgZXF1YWwgdG8gYSBzZXBhcmF0b3IgYmV0d2VlbiBsaW5lcywgd2hpY2ggd291bGQgYmUgd2VpcmQgYW5kXG4gICAgICAgIC8vIGluY29uc2lzdGVudCB3aXRoIHRoZSBkb2N1bWVudGVkIGJlaGF2aW9yIG9mIHRoZSBvcHRpb25zLilcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFsZWZ0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhcmlnaHQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5pZ25vcmVOZXdsaW5lQXRFb2YgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIGlmIChsZWZ0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyaWdodC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgbGluZURpZmYgPSBuZXcgTGluZURpZmYoKTtcbmV4cG9ydCBmdW5jdGlvbiBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZlRyaW1tZWRMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgeyBpZ25vcmVXaGl0ZXNwYWNlOiB0cnVlIH0pO1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbi8vIEV4cG9ydGVkIHN0YW5kYWxvbmUgc28gaXQgY2FuIGJlIHVzZWQgZnJvbSBqc29uRGlmZiB0b28uXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5zdHJpcFRyYWlsaW5nQ3IpIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9uZSBcXHIgYmVmb3JlIFxcbiB0byBtYXRjaCBHTlUgZGlmZidzIC0tc3RyaXAtdHJhaWxpbmctY3IgYmVoYXZpb3JcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuICAgIH1cbiAgICBjb25zdCByZXRMaW5lcyA9IFtdLCBsaW5lc0FuZE5ld2xpbmVzID0gdmFsdWUuc3BsaXQoLyhcXG58XFxyXFxuKS8pO1xuICAgIC8vIElnbm9yZSB0aGUgZmluYWwgZW1wdHkgdG9rZW4gdGhhdCBvY2N1cnMgaWYgdGhlIHN0cmluZyBlbmRzIHdpdGggYSBuZXcgbGluZVxuICAgIGlmICghbGluZXNBbmROZXdsaW5lc1tsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIGxpbmVzQW5kTmV3bGluZXMucG9wKCk7XG4gICAgfVxuICAgIC8vIE1lcmdlIHRoZSBjb250ZW50IGFuZCBsaW5lIHNlcGFyYXRvcnMgaW50byBzaW5nbGUgdG9rZW5zXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc0FuZE5ld2xpbmVzW2ldO1xuICAgICAgICBpZiAoaSAlIDIgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9IGxpbmU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRMaW5lcztcbn1cbiIsICIvKipcbiAqIFJldmlldy1wYWNrYWdlIHBhcnNpbmcgZm9yIHRoZSBDb2RleC1zdHlsZSBjb252ZXJzYXRpb24gY2FyZC5cbiAqXG4gKiBUaGUgcGx1Z2luIGluamVjdHMgdGhlIHBlbmRpbmcgaW5saW5lIGNvbW1lbnRzIChwbHVzIHRoZWlyIGRpZmYgaHVua3MgYW5kXG4gKiB0aGUgb3B0aW9uYWwgQUkgdmVyZGljdCkgYXMgb25lIHBsYWluIHVzZXIgbWVzc2FnZS4gVGhpcyBtb2R1bGUgcmUtcGFyc2VzXG4gKiB0aGF0IG1lc3NhZ2UgdGV4dCBzbyB0aGUgY29udmVyc2F0aW9uIGNhbiByZW5kZXIgaXQgYXMgYSBjYXJkIFx1MjAxNCBlYWNoXG4gKiBjb21tZW50IGNsaWNrYWJsZSB0byBqdW1wIHRvIHRoZSBtYXRjaGluZyBjaGFuZ2UgYmxvY2sgaW4gdGhlIHJldmlldyBwYW5lbC5cbiAqXG4gKiBQdXJlIGZ1bmN0aW9ucyBvbmx5OiB0aGUgY2xpZW50IGJ1bmRsZSBjYW5ub3QgYmUgaW1wb3J0ZWQgaW4gbm9kZSwgc28gdGhlXG4gKiB1bml0IHRlc3QgKHNjcmlwdHMvcmV2aWV3LXBhY2thZ2UtdGVzdC5tanMpIGJ1bmRsZXMgdGhpcyBtb2R1bGUgd2l0aCBlc2J1aWxkXG4gKiBhbmQgZXhlcmNpc2VzIHRoZSBleGFjdCBzYW1lIGNvZGUgdGhlIGJyb3dzZXIgcnVucy5cbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFJldmlld1BhY2thZ2VDb21tZW50IHtcbiAgLyoqIFJlcG8tcmVsYXRpdmUgcGF0aCAoc2FtZSBhcyB0aGUgc2VjdGlvbiBoZWFkZXIgcGF0aCkuICovXG4gIHBhdGg6IHN0cmluZ1xuICAvKiogUG9zdC1jaGFuZ2UgbGluZSAoMS1iYXNlZCk7IG51bGwgd2hlbiBvbmx5IHRoZSBvbGQtbGluZSBhbmNob3IgZXhpc3RzLiAqL1xuICBsaW5lOiBudW1iZXIgfCBudWxsXG4gIC8qKiBDb21tZW50IHRleHQuICovXG4gIHRleHQ6IHN0cmluZ1xuICAvKipcbiAgICogT3JpZ2luIHJldmlldyB0YWIsIGNhcnJpZWQgaW4gdGhlIG1lc3NhZ2UgYXMgYSBgW3NdYC9gW3ddYCB0YWcgc28gdGhlXG4gICAqIGNhcmQgY2FuIHJvdXRlIGl0cyBqdW1wOiAnc2Vzc2lvbicgYW5jaG9ycyB0byByZWxhdGl2ZSBodW5rIGxpbmVzLFxuICAgKiAnd29ya3NwYWNlJyB0byByZWFsIGZpbGUgbGluZXMuIEFic2VudCBvbiBvbGRlciBtZXNzYWdlcy5cbiAgICovXG4gIHNvdXJjZT86ICdzZXNzaW9uJyB8ICd3b3Jrc3BhY2UnXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmV2aWV3UGFja2FnZUZpbmRpbmcge1xuICBwcmlvcml0eTogJ1AwJyB8ICdQMScgfCAnUDInIHwgJ1AzJ1xuICBmaWxlOiBzdHJpbmdcbiAgbGluZTogbnVtYmVyXG4gIHRpdGxlOiBzdHJpbmdcbiAgZGV0YWlsOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXZpZXdQYWNrYWdlIHtcbiAgLyoqIFdvcmtzcGFjZSByb290IGVtYmVkZGVkIGluIHRoZSBtZXNzYWdlIChcdTVERTVcdTRGNUNcdTUzM0FcdUZGMUEuLi4pLCB3aGVuIHByZXNlbnQuICovXG4gIHdvcmtzcGFjZTogc3RyaW5nIHwgbnVsbFxuICBjb21tZW50czogUmV2aWV3UGFja2FnZUNvbW1lbnRbXVxuICB2ZXJkaWN0OiAnY29ycmVjdCcgfCAnaW5jb3JyZWN0JyB8IG51bGxcbiAgZmluZGluZ3M6IFJldmlld1BhY2thZ2VGaW5kaW5nW11cbn1cblxuLyoqIEZpcnN0IG5vbi1lbXB0eSBsaW5lIG9mIHRoZSBtZXNzYWdlICh0aGUgbWVzc2FnZSBoZWFkZXIgbGluZSkuICovXG5jb25zdCBSRVZJRVdfUFJFRklYID0gJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQlx1OTQ4OFx1NUJGOVx1NUY1M1x1NTI0RFx1NURFNVx1NEY1Q1x1NTMzQVx1NzY4NFx1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMVx1OEJDNFx1OEJCQSdcblxuLyoqIEByZXR1cm5zIHRydWUgd2hlbiB0aGUgdGV4dCBpcyBhIGNhcnJpZWQgcmV2aWV3IHBhY2thZ2UgKGNhcmQtd29ydGh5KS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Jldmlld1BhY2thZ2VUZXh0KHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBmaXJzdCA9IGZpcnN0Tm9uRW1wdHlMaW5lKHRleHQpXG4gIHJldHVybiBmaXJzdCAhPT0gbnVsbCAmJiBmaXJzdC5zdGFydHNXaXRoKFJFVklFV19QUkVGSVgpXG59XG5cbmZ1bmN0aW9uIGZpcnN0Tm9uRW1wdHlMaW5lKHRleHQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBmb3IgKGNvbnN0IHJhdyBvZiB0ZXh0LnNwbGl0KCdcXG4nKSkge1xuICAgIGNvbnN0IHQgPSByYXcudHJpbSgpXG4gICAgaWYgKHQgIT09ICcnKSByZXR1cm4gdFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbi8qKlxuICogUGFyc2UgYSBjYXJyaWVkIHJldmlldy1wYWNrYWdlIG1lc3NhZ2UgYmFjayBpbnRvIHN0cnVjdHVyZWQgZGF0YS5cbiAqIFJldHVybnMgbnVsbCB3aGVuIHRoZSB0ZXh0IGlzIG5vdCBhIHJldmlldyBwYWNrYWdlIChwbGFpbiB1c2VyIG1lc3NhZ2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VSZXZpZXdQYWNrYWdlKHRleHQ6IHN0cmluZyk6IFJldmlld1BhY2thZ2UgfCBudWxsIHtcbiAgaWYgKCFpc1Jldmlld1BhY2thZ2VUZXh0KHRleHQpKSByZXR1cm4gbnVsbFxuICBjb25zdCBwa2c6IFJldmlld1BhY2thZ2UgPSB7IHdvcmtzcGFjZTogbnVsbCwgY29tbWVudHM6IFtdLCB2ZXJkaWN0OiBudWxsLCBmaW5kaW5nczogW10gfVxuICBjb25zdCBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gIGxldCBpID0gMFxuXG4gIC8vIDEuIGhlYWRlciBsaW5lICh0aGUgcHJlZml4KSBcdTIwMTQgYWxyZWFkeSBtYXRjaGVkIGJ5IGlzUmV2aWV3UGFja2FnZVRleHQuXG4gIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoKSB7XG4gICAgY29uc3QgdCA9IGxpbmVzW2ldLnRyaW0oKVxuICAgIGkgKz0gMVxuICAgIGlmICh0ICE9PSAnJykgYnJlYWtcbiAgfVxuXG4gIC8vIDIuIG9wdGlvbmFsIHdvcmtzcGFjZSBsaW5lIHJpZ2h0IGFmdGVyIHRoZSBoZWFkZXIuXG4gIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoKSB7XG4gICAgY29uc3QgdCA9IGxpbmVzW2ldLnRyaW0oKVxuICAgIGlmICh0ID09PSAnJykge1xuICAgICAgaSArPSAxXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBjb25zdCB3ID0gL15cdTVERTVcdTRGNUNcdTUzM0FbOlx1RkYxQV1cXHMqKC4rKSQvLmV4ZWModClcbiAgICBpZiAodykge1xuICAgICAgcGtnLndvcmtzcGFjZSA9IHdbMV0udHJpbSgpIHx8IG51bGxcbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgICBicmVha1xuICB9XG5cbiAgLy8gMy4gc2VjdGlvbnM6IGAjIyA8cGF0aD5gIChjb21tZW50cyArIG9wdGlvbmFsIGBgYGRpZmYgaHVuaykgYW5kXG4gIC8vICAgIGAjIyBBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkFgICh2ZXJkaWN0ICsgZmluZGluZ3MpLlxuICBsZXQgc2VjdGlvbjogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgZm9yICg7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJhdyA9IGxpbmVzW2ldXG4gICAgY29uc3QgdCA9IHJhdy50cmltKClcbiAgICBpZiAodCA9PT0gJycpIGNvbnRpbnVlXG4gICAgaWYgKHQuc3RhcnRzV2l0aCgnIyMgJykpIHtcbiAgICAgIGNvbnN0IHRpdGxlID0gdC5zbGljZSgzKS50cmltKClcbiAgICAgIHNlY3Rpb24gPSB0aXRsZSA9PT0gJ0FJIFx1OEJDNFx1NUJBMVx1N0VEM1x1OEJCQScgPyAndmVyZGljdCcgOiB0aXRsZVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKHQuc3RhcnRzV2l0aCgnYGBgJykpIHtcbiAgICAgIC8vIGRpZmYgZmVuY2Ugb3Igc3VnZ2VzdGlvbiBmZW5jZSBcdTIwMTQgY29uc3VtZSB1bnRpbCB0aGUgY2xvc2luZyBmZW5jZS5cbiAgICAgIGkgKz0gMVxuICAgICAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGggJiYgIWxpbmVzW2ldLnRyaW0oKS5zdGFydHNXaXRoKCdgYGAnKSkgaSArPSAxXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAoc2VjdGlvbiA9PT0gJ3ZlcmRpY3QnKSB7XG4gICAgICBpZiAoL1x1ODg2NVx1NEUwMVx1NUI1OFx1NTcyOFx1OTVFRVx1OTg5OC8udGVzdCh0KSB8fCAvcGF0Y2ggaXMgaW5jb3JyZWN0L2kudGVzdCh0KSkgcGtnLnZlcmRpY3QgPSAnaW5jb3JyZWN0J1xuICAgICAgZWxzZSBpZiAoL1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RS8udGVzdCh0KSB8fCAvcGF0Y2ggaXMgY29ycmVjdC9pLnRlc3QodCkpIHBrZy52ZXJkaWN0ID0gJ2NvcnJlY3QnXG4gICAgICBjb25zdCBmID0gL14tXFxzKlxcWyhQWzAtM10pXFxdXFxzKiguKz8pOihcXGQrKSg/Oi0oXFxkKykpP1xccysoLis/KSg/OlxccypcdTIwMTRcXHMqKC4qKSk/JC8uZXhlYyh0KVxuICAgICAgaWYgKGYpIHtcbiAgICAgICAgcGtnLmZpbmRpbmdzLnB1c2goeyBwcmlvcml0eTogZlsxXSBhcyBSZXZpZXdQYWNrYWdlRmluZGluZ1sncHJpb3JpdHknXSwgZmlsZTogZlsyXSwgbGluZTogTnVtYmVyKGZbM10pLCB0aXRsZTogZls1XSwgZGV0YWlsOiBmWzZdID8/ICcnIH0pXG4gICAgICB9XG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAoc2VjdGlvbiAhPT0gbnVsbCAmJiB0LnN0YXJ0c1dpdGgoJy0gJykpIHtcbiAgICAgIGxldCBib2R5ID0gdC5zbGljZSgyKS50cmltKClcbiAgICAgIC8vIE9wdGlvbmFsIG9yaWdpbi10YWIgdGFnIChgLSBbc10gcGF0aDpcdTIwMjZgIC8gYC0gW3ddIHBhdGg6XHUyMDI2YCkuXG4gICAgICBsZXQgc291cmNlOiBSZXZpZXdQYWNrYWdlQ29tbWVudFsnc291cmNlJ11cbiAgICAgIGNvbnN0IG1UYWcgPSAvXlxcWyhbc3ddKVxcXVxccyooLispJC8uZXhlYyhib2R5KVxuICAgICAgaWYgKG1UYWcpIHtcbiAgICAgICAgc291cmNlID0gbVRhZ1sxXSA9PT0gJ3MnID8gJ3Nlc3Npb24nIDogJ3dvcmtzcGFjZSdcbiAgICAgICAgYm9keSA9IG1UYWdbMl0udHJpbSgpXG4gICAgICB9XG4gICAgICBjb25zdCBlc2MgPSBlc2NhcGVSZWdleChzZWN0aW9uKVxuICAgICAgLy8gYC0gPHBhdGg+OjxsaW5lTmV3PjogPHRleHQ+YFxuICAgICAgY29uc3QgbU5ldyA9IG5ldyBSZWdFeHAoYF4ke2VzY306KFxcXFxkKyk6XFxcXHMqKC4qKSRgKS5leGVjKGJvZHkpXG4gICAgICBpZiAobU5ldykge1xuICAgICAgICBwa2cuY29tbWVudHMucHVzaCh7IHBhdGg6IHNlY3Rpb24sIGxpbmU6IE51bWJlcihtTmV3WzFdKSwgdGV4dDogbU5ld1syXSwgc291cmNlIH0pXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICAvLyBgLSA8cGF0aD4gKG9sZCBsaW5lIDxsaW5lT2xkPik6IDx0ZXh0PmBcbiAgICAgIGNvbnN0IG1PbGQgPSBuZXcgUmVnRXhwKGBeJHtlc2N9IFxcXFwob2xkIGxpbmUgKFxcXFxkKylcXFxcKTpcXFxccyooLiopJGApLmV4ZWMoYm9keSlcbiAgICAgIGlmIChtT2xkKSB7XG4gICAgICAgIHBrZy5jb21tZW50cy5wdXNoKHsgcGF0aDogc2VjdGlvbiwgbGluZTogbnVsbCwgdGV4dDogbU9sZFsyXSwgc291cmNlIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwa2dcbn1cblxuZnVuY3Rpb24gZXNjYXBlUmVnZXgoczogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcUJBLG1CQUFxRjs7O0FDckJyRixJQUFxQixPQUFyQixNQUEwQjtBQUFBLEVBQ3RCLEtBQUssUUFBUSxRQUViLFVBQVUsQ0FBQyxHQUFHO0FBQ1YsUUFBSTtBQUNKLFFBQUksT0FBTyxZQUFZLFlBQVk7QUFDL0IsaUJBQVc7QUFDWCxnQkFBVSxDQUFDO0FBQUEsSUFDZixXQUNTLGNBQWMsU0FBUztBQUM1QixpQkFBVyxRQUFRO0FBQUEsSUFDdkI7QUFFQSxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxXQUFPLEtBQUssbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFFBQVE7QUFBQSxFQUMxRTtBQUFBLEVBQ0EsbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFVBQVU7QUFDeEQsUUFBSTtBQUNKLFVBQU0sT0FBTyxDQUFDLFVBQVU7QUFDcEIsY0FBUSxLQUFLLFlBQVksT0FBTyxPQUFPO0FBQ3ZDLFVBQUksVUFBVTtBQUNWLG1CQUFXLFdBQVk7QUFBRSxtQkFBUyxLQUFLO0FBQUEsUUFBRyxHQUFHLENBQUM7QUFDOUMsZUFBTztBQUFBLE1BQ1gsT0FDSztBQUNELGVBQU87QUFBQSxNQUNYO0FBQUEsSUFDSjtBQUNBLFVBQU0sU0FBUyxVQUFVLFFBQVEsU0FBUyxVQUFVO0FBQ3BELFFBQUksYUFBYTtBQUNqQixRQUFJLGdCQUFnQixTQUFTO0FBQzdCLFFBQUksUUFBUSxpQkFBaUIsTUFBTTtBQUMvQixzQkFBZ0IsS0FBSyxJQUFJLGVBQWUsUUFBUSxhQUFhO0FBQUEsSUFDakU7QUFDQSxVQUFNLG9CQUFvQixLQUFLLFFBQVEsYUFBYSxRQUFRLE9BQU8sU0FBUyxLQUFLO0FBQ2pGLFVBQU0sc0JBQXNCLEtBQUssSUFBSSxJQUFJO0FBQ3pDLFVBQU0sV0FBVyxDQUFDLEVBQUUsUUFBUSxJQUFJLGVBQWUsT0FBVSxDQUFDO0FBRTFELFFBQUksU0FBUyxLQUFLLGNBQWMsU0FBUyxDQUFDLEdBQUcsV0FBVyxXQUFXLEdBQUcsT0FBTztBQUM3RSxRQUFJLFNBQVMsQ0FBQyxFQUFFLFNBQVMsS0FBSyxVQUFVLFNBQVMsS0FBSyxRQUFRO0FBRTFELGFBQU8sS0FBSyxLQUFLLFlBQVksU0FBUyxDQUFDLEVBQUUsZUFBZSxXQUFXLFNBQVMsQ0FBQztBQUFBLElBQ2pGO0FBa0JBLFFBQUksd0JBQXdCLFdBQVcsd0JBQXdCO0FBRS9ELFVBQU0saUJBQWlCLE1BQU07QUFDekIsZUFBUyxlQUFlLEtBQUssSUFBSSx1QkFBdUIsQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLEtBQUssSUFBSSx1QkFBdUIsVUFBVSxHQUFHLGdCQUFnQixHQUFHO0FBQ2xKLFlBQUk7QUFDSixjQUFNLGFBQWEsU0FBUyxlQUFlLENBQUMsR0FBRyxVQUFVLFNBQVMsZUFBZSxDQUFDO0FBQ2xGLFlBQUksWUFBWTtBQUdaLG1CQUFTLGVBQWUsQ0FBQyxJQUFJO0FBQUEsUUFDakM7QUFDQSxZQUFJLFNBQVM7QUFDYixZQUFJLFNBQVM7QUFFVCxnQkFBTSxnQkFBZ0IsUUFBUSxTQUFTO0FBQ3ZDLG1CQUFTLFdBQVcsS0FBSyxpQkFBaUIsZ0JBQWdCO0FBQUEsUUFDOUQ7QUFDQSxjQUFNLFlBQVksY0FBYyxXQUFXLFNBQVMsSUFBSTtBQUN4RCxZQUFJLENBQUMsVUFBVSxDQUFDLFdBQVc7QUFHdkIsbUJBQVMsWUFBWSxJQUFJO0FBQ3pCO0FBQUEsUUFDSjtBQUlBLFlBQUksQ0FBQyxhQUFjLFVBQVUsV0FBVyxTQUFTLFFBQVEsUUFBUztBQUM5RCxxQkFBVyxLQUFLLFVBQVUsU0FBUyxNQUFNLE9BQU8sR0FBRyxPQUFPO0FBQUEsUUFDOUQsT0FDSztBQUNELHFCQUFXLEtBQUssVUFBVSxZQUFZLE9BQU8sTUFBTSxHQUFHLE9BQU87QUFBQSxRQUNqRTtBQUNBLGlCQUFTLEtBQUssY0FBYyxVQUFVLFdBQVcsV0FBVyxjQUFjLE9BQU87QUFDakYsWUFBSSxTQUFTLFNBQVMsS0FBSyxVQUFVLFNBQVMsS0FBSyxRQUFRO0FBRXZELGlCQUFPLEtBQUssS0FBSyxZQUFZLFNBQVMsZUFBZSxXQUFXLFNBQVMsQ0FBQyxLQUFLO0FBQUEsUUFDbkYsT0FDSztBQUNELG1CQUFTLFlBQVksSUFBSTtBQUN6QixjQUFJLFNBQVMsU0FBUyxLQUFLLFFBQVE7QUFDL0Isb0NBQXdCLEtBQUssSUFBSSx1QkFBdUIsZUFBZSxDQUFDO0FBQUEsVUFDNUU7QUFDQSxjQUFJLFNBQVMsS0FBSyxRQUFRO0FBQ3RCLG9DQUF3QixLQUFLLElBQUksdUJBQXVCLGVBQWUsQ0FBQztBQUFBLFVBQzVFO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFDQTtBQUFBLElBQ0o7QUFLQSxRQUFJLFVBQVU7QUFDVixPQUFDLFNBQVMsT0FBTztBQUNiLG1CQUFXLFdBQVk7QUFDbkIsY0FBSSxhQUFhLGlCQUFpQixLQUFLLElBQUksSUFBSSxxQkFBcUI7QUFDaEUsbUJBQU8sU0FBUyxNQUFTO0FBQUEsVUFDN0I7QUFDQSxjQUFJLENBQUMsZUFBZSxHQUFHO0FBQ25CLGlCQUFLO0FBQUEsVUFDVDtBQUFBLFFBQ0osR0FBRyxDQUFDO0FBQUEsTUFDUixHQUFFO0FBQUEsSUFDTixPQUNLO0FBQ0QsYUFBTyxjQUFjLGlCQUFpQixLQUFLLElBQUksS0FBSyxxQkFBcUI7QUFDckUsY0FBTSxNQUFNLGVBQWU7QUFDM0IsWUFBSSxLQUFLO0FBQ0wsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFDQSxVQUFVLE1BQU0sT0FBTyxTQUFTLFdBQVcsU0FBUztBQUNoRCxVQUFNLE9BQU8sS0FBSztBQUNsQixRQUFJLFFBQVEsQ0FBQyxRQUFRLHFCQUFxQixLQUFLLFVBQVUsU0FBUyxLQUFLLFlBQVksU0FBUztBQUN4RixhQUFPO0FBQUEsUUFDSCxRQUFRLEtBQUssU0FBUztBQUFBLFFBQ3RCLGVBQWUsRUFBRSxPQUFPLEtBQUssUUFBUSxHQUFHLE9BQWMsU0FBa0IsbUJBQW1CLEtBQUssa0JBQWtCO0FBQUEsTUFDdEg7QUFBQSxJQUNKLE9BQ0s7QUFDRCxhQUFPO0FBQUEsUUFDSCxRQUFRLEtBQUssU0FBUztBQUFBLFFBQ3RCLGVBQWUsRUFBRSxPQUFPLEdBQUcsT0FBYyxTQUFrQixtQkFBbUIsS0FBSztBQUFBLE1BQ3ZGO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQSxFQUNBLGNBQWMsVUFBVSxXQUFXLFdBQVcsY0FBYyxTQUFTO0FBQ2pFLFVBQU0sU0FBUyxVQUFVLFFBQVEsU0FBUyxVQUFVO0FBQ3BELFFBQUksU0FBUyxTQUFTLFFBQVEsU0FBUyxTQUFTLGNBQWMsY0FBYztBQUM1RSxXQUFPLFNBQVMsSUFBSSxVQUFVLFNBQVMsSUFBSSxVQUFVLEtBQUssT0FBTyxVQUFVLFNBQVMsQ0FBQyxHQUFHLFVBQVUsU0FBUyxDQUFDLEdBQUcsT0FBTyxHQUFHO0FBQ3JIO0FBQ0E7QUFDQTtBQUNBLFVBQUksUUFBUSxtQkFBbUI7QUFDM0IsaUJBQVMsZ0JBQWdCLEVBQUUsT0FBTyxHQUFHLG1CQUFtQixTQUFTLGVBQWUsT0FBTyxPQUFPLFNBQVMsTUFBTTtBQUFBLE1BQ2pIO0FBQUEsSUFDSjtBQUNBLFFBQUksZUFBZSxDQUFDLFFBQVEsbUJBQW1CO0FBQzNDLGVBQVMsZ0JBQWdCLEVBQUUsT0FBTyxhQUFhLG1CQUFtQixTQUFTLGVBQWUsT0FBTyxPQUFPLFNBQVMsTUFBTTtBQUFBLElBQzNIO0FBQ0EsYUFBUyxTQUFTO0FBQ2xCLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFDQSxPQUFPLE1BQU0sT0FBTyxTQUFTO0FBQ3pCLFFBQUksUUFBUSxZQUFZO0FBQ3BCLGFBQU8sUUFBUSxXQUFXLE1BQU0sS0FBSztBQUFBLElBQ3pDLE9BQ0s7QUFDRCxhQUFPLFNBQVMsU0FDUixDQUFDLENBQUMsUUFBUSxjQUFjLEtBQUssWUFBWSxNQUFNLE1BQU0sWUFBWTtBQUFBLElBQzdFO0FBQUEsRUFDSjtBQUFBLEVBQ0EsWUFBWSxPQUFPO0FBQ2YsVUFBTSxNQUFNLENBQUM7QUFDYixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQ25DLFVBQUksTUFBTSxDQUFDLEdBQUc7QUFDVixZQUFJLEtBQUssTUFBTSxDQUFDLENBQUM7QUFBQSxNQUNyQjtBQUFBLElBQ0o7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBO0FBQUEsRUFFQSxVQUFVLE9BQU8sU0FBUztBQUN0QixXQUFPO0FBQUEsRUFDWDtBQUFBO0FBQUEsRUFFQSxTQUFTLE9BQU8sU0FBUztBQUNyQixXQUFPLE1BQU0sS0FBSyxLQUFLO0FBQUEsRUFDM0I7QUFBQSxFQUNBLEtBQUssT0FBTztBQUtSLFdBQU8sTUFBTSxLQUFLLEVBQUU7QUFBQSxFQUN4QjtBQUFBLEVBQ0EsWUFBWSxlQUVaLFNBQVM7QUFDTCxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxrQkFBa0I7QUFDbEIsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUNBLFlBQVksZUFBZSxXQUFXLFdBQVc7QUFHN0MsVUFBTSxhQUFhLENBQUM7QUFDcEIsUUFBSTtBQUNKLFdBQU8sZUFBZTtBQUNsQixpQkFBVyxLQUFLLGFBQWE7QUFDN0Isc0JBQWdCLGNBQWM7QUFDOUIsYUFBTyxjQUFjO0FBQ3JCLHNCQUFnQjtBQUFBLElBQ3BCO0FBQ0EsZUFBVyxRQUFRO0FBQ25CLFVBQU0sZUFBZSxXQUFXO0FBQ2hDLFFBQUksZUFBZSxHQUFHLFNBQVMsR0FBRyxTQUFTO0FBQzNDLFdBQU8sZUFBZSxjQUFjLGdCQUFnQjtBQUNoRCxZQUFNLFlBQVksV0FBVyxZQUFZO0FBQ3pDLFVBQUksQ0FBQyxVQUFVLFNBQVM7QUFDcEIsWUFBSSxDQUFDLFVBQVUsU0FBUyxLQUFLLGlCQUFpQjtBQUMxQyxjQUFJLFFBQVEsVUFBVSxNQUFNLFFBQVEsU0FBUyxVQUFVLEtBQUs7QUFDNUQsa0JBQVEsTUFBTSxJQUFJLFNBQVVBLFFBQU8sR0FBRztBQUNsQyxrQkFBTSxXQUFXLFVBQVUsU0FBUyxDQUFDO0FBQ3JDLG1CQUFPLFNBQVMsU0FBU0EsT0FBTSxTQUFTLFdBQVdBO0FBQUEsVUFDdkQsQ0FBQztBQUNELG9CQUFVLFFBQVEsS0FBSyxLQUFLLEtBQUs7QUFBQSxRQUNyQyxPQUNLO0FBQ0Qsb0JBQVUsUUFBUSxLQUFLLEtBQUssVUFBVSxNQUFNLFFBQVEsU0FBUyxVQUFVLEtBQUssQ0FBQztBQUFBLFFBQ2pGO0FBQ0Esa0JBQVUsVUFBVTtBQUVwQixZQUFJLENBQUMsVUFBVSxPQUFPO0FBQ2xCLG9CQUFVLFVBQVU7QUFBQSxRQUN4QjtBQUFBLE1BQ0osT0FDSztBQUNELGtCQUFVLFFBQVEsS0FBSyxLQUFLLFVBQVUsTUFBTSxRQUFRLFNBQVMsVUFBVSxLQUFLLENBQUM7QUFDN0Usa0JBQVUsVUFBVTtBQUFBLE1BQ3hCO0FBQUEsSUFDSjtBQUNBLFdBQU87QUFBQSxFQUNYO0FBQ0o7OztBQzFQQSxJQUFNLFdBQU4sY0FBdUIsS0FBSztBQUFBLEVBQ3hCLGNBQWM7QUFDVixVQUFNLEdBQUcsU0FBUztBQUNsQixTQUFLLFdBQVc7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsT0FBTyxNQUFNLE9BQU8sU0FBUztBQVF6QixRQUFJLFFBQVEsa0JBQWtCO0FBQzFCLFVBQUksQ0FBQyxRQUFRLGtCQUFrQixDQUFDLEtBQUssU0FBUyxJQUFJLEdBQUc7QUFDakQsZUFBTyxLQUFLLEtBQUs7QUFBQSxNQUNyQjtBQUNBLFVBQUksQ0FBQyxRQUFRLGtCQUFrQixDQUFDLE1BQU0sU0FBUyxJQUFJLEdBQUc7QUFDbEQsZ0JBQVEsTUFBTSxLQUFLO0FBQUEsTUFDdkI7QUFBQSxJQUNKLFdBQ1MsUUFBUSxzQkFBc0IsQ0FBQyxRQUFRLGdCQUFnQjtBQUM1RCxVQUFJLEtBQUssU0FBUyxJQUFJLEdBQUc7QUFDckIsZUFBTyxLQUFLLE1BQU0sR0FBRyxFQUFFO0FBQUEsTUFDM0I7QUFDQSxVQUFJLE1BQU0sU0FBUyxJQUFJLEdBQUc7QUFDdEIsZ0JBQVEsTUFBTSxNQUFNLEdBQUcsRUFBRTtBQUFBLE1BQzdCO0FBQUEsSUFDSjtBQUNBLFdBQU8sTUFBTSxPQUFPLE1BQU0sT0FBTyxPQUFPO0FBQUEsRUFDNUM7QUFDSjtBQUNPLElBQU0sV0FBVyxJQUFJLFNBQVM7QUFDOUIsU0FBUyxVQUFVLFFBQVEsUUFBUSxTQUFTO0FBQy9DLFNBQU8sU0FBUyxLQUFLLFFBQVEsUUFBUSxPQUFPO0FBQ2hEO0FBTU8sU0FBUyxTQUFTLE9BQU8sU0FBUztBQUNyQyxNQUFJLFFBQVEsaUJBQWlCO0FBRXpCLFlBQVEsTUFBTSxRQUFRLFNBQVMsSUFBSTtBQUFBLEVBQ3ZDO0FBQ0EsUUFBTSxXQUFXLENBQUMsR0FBRyxtQkFBbUIsTUFBTSxNQUFNLFdBQVc7QUFFL0QsTUFBSSxDQUFDLGlCQUFpQixpQkFBaUIsU0FBUyxDQUFDLEdBQUc7QUFDaEQscUJBQWlCLElBQUk7QUFBQSxFQUN6QjtBQUVBLFdBQVMsSUFBSSxHQUFHLElBQUksaUJBQWlCLFFBQVEsS0FBSztBQUM5QyxVQUFNLE9BQU8saUJBQWlCLENBQUM7QUFDL0IsUUFBSSxJQUFJLEtBQUssQ0FBQyxRQUFRLGdCQUFnQjtBQUNsQyxlQUFTLFNBQVMsU0FBUyxDQUFDLEtBQUs7QUFBQSxJQUNyQyxPQUNLO0FBQ0QsZUFBUyxLQUFLLElBQUk7QUFBQSxJQUN0QjtBQUFBLEVBQ0o7QUFDQSxTQUFPO0FBQ1g7OztBRnZDQSxvQkFBb0M7QUFJcEMsc0NBQXlEO0FBQ3pELHNDQUE2Qjs7O0FHZTdCLElBQU0sZ0JBQWdCO0FBR2YsU0FBUyxvQkFBb0IsTUFBdUI7QUFDekQsUUFBTSxRQUFRLGtCQUFrQixJQUFJO0FBQ3BDLFNBQU8sVUFBVSxRQUFRLE1BQU0sV0FBVyxhQUFhO0FBQ3pEO0FBRUEsU0FBUyxrQkFBa0IsTUFBNkI7QUFDdEQsYUFBVyxPQUFPLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDbEMsVUFBTSxJQUFJLElBQUksS0FBSztBQUNuQixRQUFJLE1BQU0sR0FBSSxRQUFPO0FBQUEsRUFDdkI7QUFDQSxTQUFPO0FBQ1Q7QUFNTyxTQUFTLG1CQUFtQixNQUFvQztBQUNyRSxNQUFJLENBQUMsb0JBQW9CLElBQUksRUFBRyxRQUFPO0FBQ3ZDLFFBQU0sTUFBcUIsRUFBRSxXQUFXLE1BQU0sVUFBVSxDQUFDLEdBQUcsU0FBUyxNQUFNLFVBQVUsQ0FBQyxFQUFFO0FBQ3hGLFFBQU0sUUFBUSxLQUFLLE1BQU0sSUFBSTtBQUM3QixNQUFJLElBQUk7QUFHUixTQUFPLElBQUksTUFBTSxRQUFRO0FBQ3ZCLFVBQU0sSUFBSSxNQUFNLENBQUMsRUFBRSxLQUFLO0FBQ3hCLFNBQUs7QUFDTCxRQUFJLE1BQU0sR0FBSTtBQUFBLEVBQ2hCO0FBR0EsU0FBTyxJQUFJLE1BQU0sUUFBUTtBQUN2QixVQUFNLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSztBQUN4QixRQUFJLE1BQU0sSUFBSTtBQUNaLFdBQUs7QUFDTDtBQUFBLElBQ0Y7QUFDQSxVQUFNLElBQUksbUJBQW1CLEtBQUssQ0FBQztBQUNuQyxRQUFJLEdBQUc7QUFDTCxVQUFJLFlBQVksRUFBRSxDQUFDLEVBQUUsS0FBSyxLQUFLO0FBQy9CLFdBQUs7QUFBQSxJQUNQO0FBQ0E7QUFBQSxFQUNGO0FBSUEsTUFBSSxVQUF5QjtBQUM3QixTQUFPLElBQUksTUFBTSxRQUFRLEtBQUs7QUFDNUIsVUFBTSxNQUFNLE1BQU0sQ0FBQztBQUNuQixVQUFNLElBQUksSUFBSSxLQUFLO0FBQ25CLFFBQUksTUFBTSxHQUFJO0FBQ2QsUUFBSSxFQUFFLFdBQVcsS0FBSyxHQUFHO0FBQ3ZCLFlBQU0sUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEtBQUs7QUFDOUIsZ0JBQVUsVUFBVSxnQ0FBWSxZQUFZO0FBQzVDO0FBQUEsSUFDRjtBQUNBLFFBQUksRUFBRSxXQUFXLEtBQUssR0FBRztBQUV2QixXQUFLO0FBQ0wsYUFBTyxJQUFJLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLEtBQUssRUFBRyxNQUFLO0FBQ3BFO0FBQUEsSUFDRjtBQUNBLFFBQUksWUFBWSxXQUFXO0FBQ3pCLFVBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxzQkFBc0IsS0FBSyxDQUFDLEVBQUcsS0FBSSxVQUFVO0FBQUEsZUFDNUQsT0FBTyxLQUFLLENBQUMsS0FBSyxvQkFBb0IsS0FBSyxDQUFDLEVBQUcsS0FBSSxVQUFVO0FBQ3RFLFlBQU0sSUFBSSxzRUFBc0UsS0FBSyxDQUFDO0FBQ3RGLFVBQUksR0FBRztBQUNMLFlBQUksU0FBUyxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUMsR0FBdUMsTUFBTSxFQUFFLENBQUMsR0FBRyxNQUFNLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEtBQUssR0FBRyxDQUFDO0FBQUEsTUFDM0k7QUFDQTtBQUFBLElBQ0Y7QUFDQSxRQUFJLFlBQVksUUFBUSxFQUFFLFdBQVcsSUFBSSxHQUFHO0FBQzFDLFVBQUksT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEtBQUs7QUFFM0IsVUFBSTtBQUNKLFlBQU0sT0FBTyxzQkFBc0IsS0FBSyxJQUFJO0FBQzVDLFVBQUksTUFBTTtBQUNSLGlCQUFTLEtBQUssQ0FBQyxNQUFNLE1BQU0sWUFBWTtBQUN2QyxlQUFPLEtBQUssQ0FBQyxFQUFFLEtBQUs7QUFBQSxNQUN0QjtBQUNBLFlBQU0sTUFBTSxZQUFZLE9BQU87QUFFL0IsWUFBTSxPQUFPLElBQUksT0FBTyxJQUFJLEdBQUcsbUJBQW1CLEVBQUUsS0FBSyxJQUFJO0FBQzdELFVBQUksTUFBTTtBQUNSLFlBQUksU0FBUyxLQUFLLEVBQUUsTUFBTSxTQUFTLE1BQU0sT0FBTyxLQUFLLENBQUMsQ0FBQyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ2pGO0FBQUEsTUFDRjtBQUVBLFlBQU0sT0FBTyxJQUFJLE9BQU8sSUFBSSxHQUFHLGtDQUFrQyxFQUFFLEtBQUssSUFBSTtBQUM1RSxVQUFJLE1BQU07QUFDUixZQUFJLFNBQVMsS0FBSyxFQUFFLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTSxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUM7QUFBQSxNQUN4RTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUO0FBRUEsU0FBUyxZQUFZLEdBQW1CO0FBQ3RDLFNBQU8sRUFBRSxRQUFRLHVCQUF1QixNQUFNO0FBQ2hEOzs7QUhvbkNJO0FBN3RDRyxJQUFNLE9BQU87QUFHYixJQUFNLFNBQVMsQ0FBQyxZQUFZLFNBQVMsUUFBUTtBQUVwRCxJQUFNLFlBQVk7QUFFbEIsSUFBTSxpQkFBaUI7QUFDdkIsSUFBTSxhQUFhO0FBQ25CLElBQU0sWUFBWTtBQUNsQixJQUFNLGlCQUFpQjtBQUN2QixJQUFNLGFBQWE7QUFDbkIsSUFBTSxXQUFXO0FBQ2pCLElBQU0sY0FBYztBQUNwQixJQUFNLGtCQUFrQjtBQUN4QixJQUFNLGVBQWU7QUFDckIsSUFBTSxlQUFlO0FBQ3JCLElBQU0sYUFBYTtBQUNuQixJQUFNLFNBQVM7QUFDZixJQUFNLFlBQVk7QUFDbEIsSUFBTSxZQUFZO0FBQ2xCLElBQU0sa0JBQWtCO0FBQ3hCLElBQU0sWUFBWTtBQUdsQixJQUFNLG1CQUFlLG1DQUF1SztBQUFBLEVBQzFMLE1BQU07QUFBQSxFQUNOLEtBQUs7QUFBQSxFQUNMLEtBQUs7QUFBQSxFQUNMLE9BQU87QUFDVCxDQUFDO0FBZ0JELElBQU0sMkJBQXVCLG1DQUFxQztBQUFBLEVBQ2hFLEtBQUs7QUFBQSxFQUNMLFVBQVUsQ0FBQztBQUFBLEVBQ1gsT0FBTyxDQUFDO0FBQUEsRUFDUixRQUFRO0FBQ1YsQ0FBQztBQU1ELElBQU0sZ0JBQVksbUNBQWdHLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixFQUFFLENBQUM7QUFHL0osZUFBZSxnQkFBZ0IsVUFBaUMsV0FBNkIsTUFBcUQ7QUFDaEosUUFBTSxVQUFVLFlBQVksVUFBVSxRQUFRLFNBQVMsSUFBSTtBQUMzRCxRQUFNLFVBQVUsU0FBUztBQUN6QixNQUFJLFNBQVM7QUFDWCxRQUFJO0FBTUYsWUFBTSxTQUFTLE1BQU0sUUFBUSxPQUFPLENBQUMsRUFBRSxNQUFNLFFBQVEsS0FBSyxDQUFDLEdBQUcsT0FBTztBQUNyRSxVQUFJLE9BQU8sR0FBSSxRQUFPO0FBQUEsSUFDeEIsUUFBUTtBQUFBLElBRVI7QUFBQSxFQUNGO0FBQ0EsTUFBSTtBQUNGLFVBQU0sVUFBVSxVQUFVLFVBQVUsSUFBSTtBQUN4QyxXQUFPO0FBQUEsRUFDVCxRQUFRO0FBQ04sV0FBTztBQUFBLEVBQ1Q7QUFDRjtBQVFPLElBQU0sY0FBYztBQUNwQixJQUFNLGNBQWM7QUFhM0IsSUFBTSxlQUE2RDtBQUFBLEVBQ2pFLEVBQUUsSUFBSSxRQUFRLE9BQU8sYUFBYSxLQUFLLHVCQUF1QjtBQUFBLEVBQzlELEVBQUUsSUFBSSxVQUFVLE9BQU8sZUFBZSxLQUFLLHVDQUF1QztBQUFBLEVBQ2xGLEVBQUUsSUFBSSxZQUFZLE9BQU8sWUFBWSxLQUFLLHFDQUFxQztBQUFBLEVBQy9FLEVBQUUsSUFBSSxhQUFhLE9BQU8sa0JBQWtCLEtBQUssd0NBQXdDO0FBQUEsRUFDekYsRUFBRSxJQUFJLFFBQVEsT0FBTyxhQUFhLEtBQUssbUNBQW1DO0FBQUEsRUFDMUUsRUFBRSxJQUFJLFVBQVUsT0FBTyxtQkFBbUIsS0FBSyx5Q0FBeUM7QUFDMUY7QUFFQSxJQUFNLGVBQWUsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtBQU01QyxJQUFNLGdCQUFrRTtBQUFBLEVBQ3RFLEVBQUUsSUFBSSxZQUFZLE9BQU8saUJBQWlCO0FBQUEsRUFDMUMsRUFBRSxJQUFJLFVBQVUsT0FBTyxlQUFlO0FBQUEsRUFDdEMsRUFBRSxJQUFJLFVBQVUsT0FBTyxlQUFlO0FBQUEsRUFDdEMsRUFBRSxJQUFJLFVBQVUsT0FBTyxlQUFlO0FBQUEsRUFDdEMsRUFBRSxJQUFJLGFBQWEsT0FBTyxrQkFBa0I7QUFDOUM7QUFHQSxTQUFTLFVBQVUsR0FBb0I7QUFDckMsU0FBTyxFQUFFLFdBQVcsR0FBRyxLQUFLLGtCQUFrQixLQUFLLENBQUM7QUFDdEQ7QUFTQSxTQUFTLFNBQVMsR0FBbUI7QUFDbkMsU0FBTyxFQUFFLE1BQU0sT0FBTyxFQUFFLElBQUksS0FBSztBQUNuQztBQUVBLElBQU0saUJBQWE7QUFBQSxFQUNqQixFQUFFLE1BQU0sUUFBUSxNQUFNLElBQUksT0FBTyxNQUFNLFFBQVEsSUFBSTtBQUFBLEVBQ25ELEVBQUUsU0FBUyxFQUFFLE1BQU0sYUFBYSxFQUFFO0FBQ3BDO0FBR0EsU0FBUyxRQUFRLElBQW9CO0FBQ25DLFNBQU8sYUFBYSxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sYUFBYSxDQUFDLEVBQUU7QUFDdkU7QUFHQSxTQUFTLGNBQWMsT0FBNkI7QUFDbEQsU0FBTztBQUFBLElBQ0wsb0JBQW9CLFFBQVEsTUFBTSxJQUFJO0FBQUEsSUFDdEMsb0JBQW9CLEdBQUcsTUFBTSxJQUFJO0FBQUEsRUFDbkM7QUFDRjtBQTBDQSxTQUFTLFdBQVcsS0FBbUM7QUFDckQsTUFBSSxDQUFDLE9BQU8sT0FBTyxRQUFRLFNBQVUsUUFBTztBQUM1QyxRQUFNLE1BQU07QUFDWixNQUFJLE9BQU8sSUFBSSxTQUFTLFlBQVksQ0FBQyxJQUFJLEtBQU0sUUFBTztBQUN0RCxNQUFJLE9BQU8sSUFBSSxZQUFZLFNBQVUsUUFBTztBQUM1QyxRQUFNLFVBQVUsSUFBSTtBQUNwQixTQUFPLEVBQUUsTUFBTSxJQUFJLE1BQU0sU0FBUyxPQUFPLFlBQVksV0FBVyxVQUFVLE1BQU0sU0FBUyxJQUFJLFFBQVE7QUFDdkc7QUFHQSxTQUFTLGtCQUFrQixNQUE4RTtBQUN2RyxNQUFJLENBQUMsUUFBUSxLQUFLLFNBQVMsVUFBVSxDQUFDLE1BQU0sUUFBUSxLQUFLLEtBQUssRUFBRyxRQUFPLENBQUM7QUFDekUsU0FBTyxLQUFLLE1BQU0sSUFBSSxVQUFVLEVBQUUsT0FBTyxDQUFDLE1BQXlCLE1BQU0sSUFBSTtBQUMvRTtBQUdBLFNBQVMsY0FBYyxNQUE4QjtBQUNuRCxNQUFJLENBQUMsUUFBUSxPQUFPLFNBQVMsU0FBVSxRQUFPO0FBQzlDLFFBQU0sUUFBUyxLQUFpQztBQUNoRCxTQUFPLE9BQU8sVUFBVSxZQUFZLE1BQU0sS0FBSyxJQUFJLE1BQU0sS0FBSyxJQUFJO0FBQ3BFO0FBR0EsU0FBUyxjQUFjLE1BQStCO0FBQ3BELE1BQUksQ0FBQyxRQUFRLE9BQU8sU0FBUyxTQUFVLFFBQU8sQ0FBQztBQUMvQyxRQUFNLFFBQVMsS0FBaUM7QUFDaEQsTUFBSSxDQUFDLE1BQU0sUUFBUSxLQUFLLEVBQUcsUUFBTyxDQUFDO0FBQ25DLFNBQU8sTUFBTSxJQUFJLFVBQVUsRUFBRSxPQUFPLENBQUMsTUFBeUIsTUFBTSxJQUFJO0FBQzFFO0FBRUEsSUFBTSxpQkFBaUIsb0JBQUksSUFBSSxDQUFDLHNCQUFzQixlQUFlLENBQUM7QUFDdEUsSUFBTSxvQkFBb0Isb0JBQUksSUFBSSxDQUFDLFNBQVMsUUFBUSxXQUFXLFVBQVUsTUFBTSxDQUFDO0FBR2hGLFNBQVMsYUFBYSxNQUFjLFNBQWdDO0FBQ2xFLE1BQUksT0FBdUM7QUFDM0MsTUFBSTtBQUNGLFdBQU8sS0FBSyxNQUFNLE9BQU87QUFBQSxFQUMzQixRQUFRO0FBQ04sV0FBTztBQUFBLEVBQ1Q7QUFDQSxNQUFJLENBQUMsUUFBUSxPQUFPLFNBQVMsU0FBVSxRQUFPO0FBQzlDLE1BQUksU0FBUyxRQUFRLFNBQVMsY0FBYztBQUMxQyxVQUFNLE1BQU0sT0FBTyxLQUFLLFlBQVksV0FBVyxLQUFLLFVBQVU7QUFDOUQsUUFBSSxDQUFDLGtCQUFrQixJQUFJLEdBQUcsRUFBRyxRQUFPO0FBQ3hDLFdBQU8sT0FBTyxLQUFLLGNBQWMsWUFBWSxLQUFLLFlBQVksS0FBSyxZQUFZO0FBQUEsRUFDakY7QUFDQSxNQUFJLGVBQWUsSUFBSSxJQUFJLEtBQUssS0FBSyxXQUFXLE1BQU0sR0FBRztBQUN2RCxlQUFXLE9BQU8sQ0FBQyxhQUFhLFFBQVEsVUFBVSxHQUFHO0FBQ25ELFVBQUksT0FBTyxLQUFLLEdBQUcsTUFBTSxZQUFZLEtBQUssR0FBRyxFQUFHLFFBQU8sS0FBSyxHQUFHO0FBQUEsSUFDakU7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUO0FBR0EsU0FBUyxzQkFBc0IsTUFBZ0QsTUFBcUM7QUFHbEgsUUFBTSxjQUFjLGtCQUFrQixLQUFLLFVBQVU7QUFDckQsUUFBTSxZQUFZLFlBQVksV0FBVyxJQUFJLGtCQUFrQixLQUFLLFFBQVEsSUFBSSxDQUFDO0FBQ2pGLFFBQU0sWUFBWSxZQUFZLFdBQVcsS0FBSyxVQUFVLFdBQVcsSUFBSSxjQUFjLEtBQUssSUFBSSxJQUFJLENBQUM7QUFDbkcsUUFBTSxXQUFXLFlBQVksU0FBUyxJQUFJLGNBQWMsVUFBVSxTQUFTLElBQUksWUFBWTtBQUMzRixRQUFNLE9BQU8sTUFBTSxRQUFRLGNBQWMsS0FBSyxRQUFRLEtBQUs7QUFDM0QsTUFBSSxTQUFTLFNBQVMsR0FBRztBQUN2QixVQUFNLFNBQVMsb0JBQUksSUFBeUI7QUFDNUMsZUFBVyxLQUFLLFVBQVU7QUFDeEIsVUFBSSxRQUFRLE9BQU8sSUFBSSxFQUFFLElBQUk7QUFDN0IsVUFBSSxDQUFDLE9BQU87QUFDVixnQkFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sT0FBTyxDQUFDLEdBQUcsU0FBUyxLQUFLO0FBQ3ZELGVBQU8sSUFBSSxFQUFFLE1BQU0sS0FBSztBQUFBLE1BQzFCO0FBQ0EsWUFBTSxNQUFNLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxTQUFTLEVBQUUsUUFBUSxDQUFDO0FBQUEsSUFDN0Q7QUFDQSxXQUFPLENBQUMsR0FBRyxPQUFPLE9BQU8sQ0FBQztBQUFBLEVBQzVCO0FBQ0EsUUFBTSxPQUFPLE9BQU8sYUFBYSxNQUFNLEtBQUssT0FBTyxJQUFJO0FBQ3ZELFNBQU8sT0FBTyxDQUFDLEVBQUUsTUFBTSxNQUFNLE9BQU8sQ0FBQyxHQUFHLFNBQVMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUMvRDtBQUdBLFNBQVMsU0FBUyxNQUErQjtBQUMvQyxRQUFNLFFBQWtCLENBQUM7QUFDekIsYUFBVyxTQUFTLEtBQUssU0FBUztBQUNoQyxRQUFJLFNBQVMsT0FBTyxVQUFVLFlBQWEsTUFBNkIsU0FBUyxVQUFVLE9BQVEsTUFBNkIsU0FBUyxVQUFVO0FBQ2pKLFlBQU0sS0FBTSxNQUEyQixJQUFJO0FBQUEsSUFDN0M7QUFBQSxFQUNGO0FBQ0EsU0FBTyxNQUFNLEtBQUssR0FBRyxFQUFFLFFBQVEsUUFBUSxHQUFHLEVBQUUsS0FBSztBQUNuRDtBQUdPLFNBQVMscUJBQXFCLE9BQW9EO0FBQ3ZGLFFBQU0sU0FBeUIsQ0FBQztBQUNoQyxNQUFJLFVBQStCO0FBQ25DLGFBQVcsUUFBUSxPQUFPO0FBQ3hCLFFBQUksS0FBSyxTQUFTLFFBQVE7QUFDeEIsZ0JBQVUsRUFBRSxPQUFPLE9BQU8sU0FBUyxHQUFHLE9BQU8sU0FBUyxJQUFJLEVBQUUsTUFBTSxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsRUFBRTtBQUN0RixhQUFPLEtBQUssT0FBTztBQUNuQjtBQUFBLElBQ0Y7QUFDQSxRQUFJLEtBQUssU0FBUyxjQUFlO0FBR2pDLFFBQUksQ0FBQyxTQUFTO0FBQ1osZ0JBQVUsRUFBRSxPQUFPLE9BQU8sU0FBUyxHQUFHLE9BQU8sSUFBSSxTQUFTLENBQUMsRUFBRTtBQUM3RCxhQUFPLEtBQUssT0FBTztBQUFBLElBQ3JCO0FBQ0EsZUFBVyxVQUFVLHNCQUFzQixLQUFLLE1BQU0sSUFBSSxHQUFHO0FBQzNELFlBQU0sV0FBVyxRQUFRLFFBQVEsS0FBSyxDQUFDLE1BQU0sRUFBRSxTQUFTLE9BQU8sUUFBUSxFQUFFLFNBQVMsT0FBTyxJQUFJO0FBQzdGLFVBQUksVUFBVTtBQUNaLFlBQUksT0FBTyxTQUFTO0FBQ2xCLG1CQUFTLE1BQU0sS0FBSyxHQUFHLE9BQU8sS0FBSztBQUNuQyxtQkFBUyxVQUFVO0FBQUEsUUFDckI7QUFBQSxNQUNGLE9BQU87QUFDTCxnQkFBUSxRQUFRLEtBQUssTUFBTTtBQUFBLE1BQzdCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxTQUFPLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLFNBQVMsQ0FBQztBQUNsRDtBQUdPLFNBQVMsb0JBQW9CLE9BQTRDO0FBQzlFLE1BQUksUUFBUTtBQUNaLFFBQU0sT0FBTyxvQkFBSSxJQUFZO0FBQzdCLGFBQVcsUUFBUSxPQUFPO0FBQ3hCLFFBQUksS0FBSyxTQUFTLGNBQWU7QUFDakMsZUFBVyxVQUFVLHNCQUFzQixLQUFLLE1BQU0sSUFBSSxHQUFHO0FBQzNELFlBQU0sTUFBTSxHQUFHLE9BQU8sSUFBSSxJQUFJLE9BQU8sSUFBSTtBQUN6QyxVQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsR0FBRztBQUNsQixhQUFLLElBQUksR0FBRztBQUNaO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUNUO0FBRUEsU0FBUyxjQUFjLE1BQXNCO0FBQzNDLE1BQUksU0FBUyxHQUFJLFFBQU87QUFDeEIsU0FBTyxLQUFLLE1BQU0sSUFBSSxFQUFFLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSSxJQUFJO0FBQzlEO0FBR0EsU0FBUyxtQkFBbUIsT0FBb0MsVUFBa0IsUUFBcUM7QUFDckgsUUFBTSxRQUFRLG9CQUFJLElBQStCO0FBQ2pELGFBQVcsUUFBUSxPQUFPO0FBQ3hCLFFBQUksS0FBSyxTQUFTLGlCQUFpQixLQUFLLE1BQU0sWUFBWSxLQUFLLE1BQU0sT0FBUTtBQUM3RSxlQUFXLFVBQVUsc0JBQXNCLEtBQUssTUFBTSxJQUFJLEdBQUc7QUFDM0QsWUFBTSxVQUFVLE1BQU0sSUFBSSxPQUFPLElBQUksS0FBSyxFQUFFLE1BQU0sT0FBTyxNQUFNLE9BQU8sR0FBRyxTQUFTLEVBQUU7QUFDcEYsaUJBQVcsUUFBUSxPQUFPLE9BQU87QUFDL0IsbUJBQVcsUUFBUSxVQUFVLEtBQUssV0FBVyxJQUFJLEtBQUssT0FBTyxHQUFHO0FBQzlELGNBQUksS0FBSyxNQUFPLFNBQVEsU0FBUyxjQUFjLEtBQUssS0FBSztBQUFBLG1CQUNoRCxLQUFLLFFBQVMsU0FBUSxXQUFXLGNBQWMsS0FBSyxLQUFLO0FBQUEsUUFDcEU7QUFBQSxNQUNGO0FBQ0EsWUFBTSxJQUFJLE9BQU8sTUFBTSxPQUFPO0FBQUEsSUFDaEM7QUFBQSxFQUNGO0FBQ0EsU0FBTyxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUM7QUFDM0I7QUFHQSxTQUFTLHdCQUF3QixRQUErQjtBQUM5RCxNQUFJLFFBQVE7QUFDWixNQUFJLFVBQVU7QUFDZCxRQUFNLFNBQW1CLENBQUMsZ0JBQWdCLE9BQU8sSUFBSSxNQUFNLE9BQU8sSUFBSSxJQUFJLFNBQVMsT0FBTyxJQUFJLElBQUksU0FBUyxPQUFPLElBQUksRUFBRTtBQUN4SCxhQUFXLFFBQVEsT0FBTyxPQUFPO0FBQy9CLFVBQU0sU0FBUyxLQUFLLFdBQVc7QUFDL0IsVUFBTSxRQUFRLEtBQUs7QUFDbkIsVUFBTSxjQUFjLGNBQWMsTUFBTTtBQUN4QyxVQUFNLGFBQWEsY0FBYyxLQUFLO0FBQ3RDLFdBQU8sS0FBSyxTQUFTLFdBQVcsT0FBTyxVQUFVLEtBQUs7QUFDdEQsZUFBVyxRQUFRLFVBQVUsUUFBUSxLQUFLLEdBQUc7QUFDM0MsWUFBTSxTQUFTLEtBQUssUUFBUSxNQUFNLEtBQUssVUFBVSxNQUFNO0FBQ3ZELFlBQU0sUUFBUSxjQUFjLEtBQUssS0FBSztBQUN0QyxVQUFJLEtBQUssTUFBTyxVQUFTO0FBQUEsZUFDaEIsS0FBSyxRQUFTLFlBQVc7QUFDbEMsaUJBQVcsUUFBUSxLQUFLLE1BQU0sTUFBTSxJQUFJLEVBQUUsTUFBTSxHQUFHLEtBQUssTUFBTSxTQUFTLElBQUksSUFBSSxLQUFLLE1BQVMsRUFBRyxRQUFPLEtBQUssR0FBRyxNQUFNLEdBQUcsSUFBSSxFQUFFO0FBQUEsSUFDaEk7QUFBQSxFQUNGO0FBQ0EsU0FBTztBQUFBLElBQ0wsTUFBTSxPQUFPO0FBQUEsSUFDYixJQUFJO0FBQUEsSUFDSixRQUFRO0FBQUEsSUFDUixXQUFXLE9BQU8sTUFBTSxLQUFLLENBQUMsU0FBUyxLQUFLLFlBQVksSUFBSTtBQUFBLElBQzVELFFBQVE7QUFBQSxJQUNSLFVBQVU7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0EsTUFBTSxPQUFPLEtBQUssSUFBSTtBQUFBLElBQ3RCLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxJQUNQLE9BQU8sQ0FBQztBQUFBLEVBQ1Y7QUFDRjtBQU9BLFNBQVMsZ0JBQWdCLE1BQWdEO0FBQ3ZFLFFBQU0sV0FBK0MsQ0FBQztBQUN0RCxNQUFJLFVBQW1EO0FBQ3ZELGFBQVcsUUFBUSxLQUFLLE1BQU0sSUFBSSxHQUFHO0FBQ25DLFVBQU0sUUFBUSwyQkFBMkIsS0FBSyxJQUFJO0FBQ2xELFFBQUksT0FBTztBQUNULFVBQUksUUFBUyxVQUFTLEtBQUssT0FBTztBQUNsQyxnQkFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRTtBQUFBLElBQzNDLFdBQVcsU0FBUztBQUNsQixjQUFRLEtBQUssS0FBSyxJQUFJO0FBQUEsSUFDeEI7QUFBQSxFQUNGO0FBQ0EsTUFBSSxRQUFTLFVBQVMsS0FBSyxPQUFPO0FBQ2xDLFNBQU8sU0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sRUFBRSxLQUFLLEtBQUssSUFBSSxFQUFFLEVBQUU7QUFDeEU7QUFHQSxTQUFTLGlCQUFpQixhQUE2QjtBQUNyRCxNQUFJLGlCQUFpQixLQUFLLFdBQVcsRUFBRyxRQUFPO0FBQy9DLE1BQUkscUJBQXFCLEtBQUssV0FBVyxFQUFHLFFBQU87QUFDbkQsTUFBSSxnQkFBZ0IsS0FBSyxXQUFXLEVBQUcsUUFBTztBQUM5QyxTQUFPO0FBQ1Q7QUFLQSxTQUFTLFlBQVksTUFBeUI7QUFDNUMsU0FBTyxLQUFLLE1BQU0sSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTO0FBQ3BDLFFBQUksS0FBSyxXQUFXLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxFQUFHLFFBQU8sRUFBRSxNQUFNLFFBQWlCLE1BQU0sS0FBSztBQUNqRyxRQUFJLEtBQUssV0FBVyxJQUFJLEVBQUcsUUFBTyxFQUFFLE1BQU0sUUFBaUIsTUFBTSxLQUFLO0FBQ3RFLFFBQUksS0FBSyxXQUFXLEdBQUcsRUFBRyxRQUFPLEVBQUUsTUFBTSxPQUFnQixNQUFNLEtBQUs7QUFDcEUsUUFBSSxLQUFLLFdBQVcsR0FBRyxFQUFHLFFBQU8sRUFBRSxNQUFNLE9BQWdCLE1BQU0sS0FBSztBQUNwRSxRQUFJLEtBQUssV0FBVyxLQUFLLEVBQUcsUUFBTyxFQUFFLE1BQU0sUUFBaUIsTUFBTSxLQUFLO0FBQ3ZFLFdBQU8sRUFBRSxNQUFNLE9BQWdCLE1BQU0sS0FBSztBQUFBLEVBQzVDLENBQUM7QUFDSDtBQUdBLFNBQVMsYUFBYSxTQUF3QixTQUE0QjtBQUN4RSxRQUFNLE9BQWtCLENBQUM7QUFDekIsYUFBVyxRQUFRLFVBQVUsV0FBVyxJQUFJLE9BQU8sR0FBRztBQUNwRCxVQUFNLFFBQVEsS0FBSyxNQUFNLE1BQU0sSUFBSTtBQUNuQyxRQUFJLE1BQU0sU0FBUyxLQUFLLE1BQU0sTUFBTSxTQUFTLENBQUMsTUFBTSxHQUFJLE9BQU0sSUFBSTtBQUNsRSxlQUFXLFFBQVEsT0FBTztBQUN4QixVQUFJLEtBQUssTUFBTyxNQUFLLEtBQUssRUFBRSxNQUFNLE9BQU8sTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDO0FBQUEsZUFDbEQsS0FBSyxRQUFTLE1BQUssS0FBSyxFQUFFLE1BQU0sT0FBTyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUM7QUFBQSxVQUM3RCxNQUFLLEtBQUssRUFBRSxNQUFNLE9BQU8sTUFBTSxLQUFLLENBQUM7QUFBQSxJQUM1QztBQUFBLEVBQ0Y7QUFDQSxTQUFPO0FBQ1Q7QUFHQSxTQUFTLHFCQUFxQixRQUF5RjtBQUNySCxRQUFNLE1BQTBFLENBQUM7QUFDakYsTUFBSSxVQUFVO0FBQ2QsTUFBSSxVQUFVO0FBQ2QsYUFBVyxPQUFPLFdBQVcsTUFBTSxHQUFHO0FBQ3BDLFFBQUksSUFBSSxTQUFTLE9BQU87QUFDdEIsVUFBSSxLQUFLLEVBQUUsS0FBSyxTQUFTLFdBQVcsU0FBUyxVQUFVLENBQUM7QUFBQSxJQUMxRCxXQUFXLElBQUksU0FBUyxPQUFPO0FBQzdCLFVBQUksS0FBSyxFQUFFLEtBQUssU0FBUyxNQUFNLFNBQVMsVUFBVSxDQUFDO0FBQUEsSUFDckQsV0FBVyxJQUFJLFNBQVMsT0FBTztBQUM3QixVQUFJLEtBQUssRUFBRSxLQUFLLFNBQVMsV0FBVyxTQUFTLEtBQUssQ0FBQztBQUFBLElBQ3JELE9BQU87QUFDTCxVQUFJLEtBQUssRUFBRSxLQUFLLFNBQVMsTUFBTSxTQUFTLEtBQUssQ0FBQztBQUFBLElBQ2hEO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFDVDtBQUdBLFNBQVMsV0FBVyxRQUFnQztBQUNsRCxNQUFJLENBQUMsT0FBTyxXQUFXLE9BQU8sTUFBTSxXQUFXLEVBQUcsUUFBTyxDQUFDO0FBQzFELFFBQU0sT0FBa0IsQ0FBQztBQUN6QixTQUFPLE1BQU0sUUFBUSxDQUFDLE1BQU0sTUFBTTtBQUNoQyxRQUFJLE9BQU8sTUFBTSxTQUFTLEVBQUcsTUFBSyxLQUFLLEVBQUUsTUFBTSxRQUFRLE1BQU0sV0FBVyxJQUFJLENBQUMsSUFBSSxPQUFPLE1BQU0sTUFBTSxNQUFNLENBQUM7QUFDM0csU0FBSyxLQUFLLEdBQUcsYUFBYSxLQUFLLFNBQVMsS0FBSyxPQUFPLENBQUM7QUFBQSxFQUN2RCxDQUFDO0FBQ0QsU0FBTztBQUNUO0FBOEJBLFNBQVMsU0FBUyxNQUFpQixVQUFrQixVQUE4QjtBQUNqRixRQUFNLE1BQWtCLENBQUM7QUFDekIsTUFBSSxVQUFVO0FBQ2QsTUFBSSxVQUFVO0FBQ2QsTUFBSSxVQUEyQyxDQUFDO0FBQ2hELFFBQU0sUUFBUSxNQUFNO0FBQ2xCLGVBQVcsS0FBSyxRQUFTLEtBQUksS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLE9BQU8sSUFBSSxTQUFTLEVBQUUsS0FBSyxVQUFVLE1BQU0sTUFBTSxTQUFTLENBQUM7QUFDN0csY0FBVSxDQUFDO0FBQUEsRUFDYjtBQUNBLGFBQVcsT0FBTyxNQUFNO0FBQ3RCLFFBQUksSUFBSSxTQUFTLE9BQU87QUFDdEIsY0FBUSxLQUFLLEVBQUUsTUFBTSxJQUFJLEtBQUssTUFBTSxDQUFDLEdBQUcsS0FBSyxVQUFVLENBQUM7QUFBQSxJQUMxRCxXQUFXLElBQUksU0FBUyxPQUFPO0FBQzdCLFlBQU0sSUFBSSxRQUFRLE1BQU07QUFDeEIsVUFBSSxLQUFLLEVBQUUsTUFBTSxHQUFHLFFBQVEsSUFBSSxPQUFPLElBQUksS0FBSyxNQUFNLENBQUMsR0FBRyxTQUFTLEdBQUcsT0FBTyxNQUFNLFVBQVUsV0FBVyxNQUFNLFNBQVMsQ0FBQztBQUFBLElBQzFILFdBQVcsSUFBSSxTQUFTLE9BQU87QUFDN0IsWUFBTTtBQUdOLFlBQU0sT0FBTyxJQUFJLEtBQUssV0FBVyxHQUFHLElBQUksSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUk7QUFDaEUsVUFBSSxLQUFLLEVBQUUsTUFBTSxNQUFNLE9BQU8sTUFBTSxTQUFTLFdBQVcsVUFBVSxXQUFXLE1BQU0sTUFBTSxDQUFDO0FBQUEsSUFDNUYsT0FBTztBQUNMLFlBQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUNBLFFBQU07QUFDTixTQUFPO0FBQ1Q7QUFHQSxJQUFNLFdBQVc7QUFFakIsU0FBUyxlQUFlLE1BQTJEO0FBQ2pGLFFBQU0sU0FBc0QsQ0FBQztBQUM3RCxNQUFJLFVBQTREO0FBQ2hFLFFBQU0sUUFBUSxLQUFLLE1BQU0sSUFBSTtBQUM3QixNQUFJLE1BQU0sU0FBUyxLQUFLLE1BQU0sTUFBTSxTQUFTLENBQUMsTUFBTSxHQUFJLE9BQU0sSUFBSTtBQUNsRSxhQUFXLFFBQVEsT0FBTztBQUN4QixRQUFJO0FBQ0osUUFBSSxLQUFLLFdBQVcsS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssU0FBUyxLQUFLLElBQUksRUFBRyxRQUFPO0FBQUEsYUFDM0UsS0FBSyxXQUFXLElBQUksRUFBRyxRQUFPO0FBQUEsYUFDOUIsS0FBSyxXQUFXLEdBQUcsRUFBRyxRQUFPO0FBQUEsYUFDN0IsS0FBSyxXQUFXLEdBQUcsRUFBRyxRQUFPO0FBQUEsYUFDN0IsS0FBSyxXQUFXLEtBQUssRUFBRyxRQUFPO0FBQUEsUUFDbkMsUUFBTztBQUNaLFFBQUksU0FBUyxVQUFVLFNBQVMsUUFBUTtBQUN0QyxnQkFBVSxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxFQUFFO0FBQ2pELGFBQU8sS0FBSyxPQUFPO0FBQUEsSUFDckIsT0FBTztBQUNMLFVBQUksQ0FBQyxTQUFTO0FBQ1osa0JBQVUsRUFBRSxNQUFNLE1BQU0sTUFBTSxDQUFDLEVBQUU7QUFDakMsZUFBTyxLQUFLLE9BQU87QUFBQSxNQUNyQjtBQUNBLGNBQVEsS0FBSyxLQUFLLEVBQUUsTUFBTSxNQUFNLEtBQUssQ0FBQztBQUFBLElBQ3hDO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFDVDtBQUdBLFNBQVMsV0FBVyxNQUFzRDtBQUN4RSxRQUFNLElBQUksOEJBQThCLEtBQUssSUFBSTtBQUNqRCxTQUFPLEVBQUUsVUFBVSxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLFVBQVUsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUMxRTtBQUdBLFNBQVMsZUFBZSxNQUE0QjtBQUNsRCxTQUFPLGVBQWUsSUFBSSxFQUN2QixPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sU0FBUyxXQUFXLEVBQUUsS0FBSyxTQUFTLEtBQUssRUFBRSxNQUFNLFNBQVMsT0FBTyxFQUN2RixJQUFJLENBQUMsTUFBTTtBQUNWLFVBQU0sU0FBUyxFQUFFLE9BQU8sV0FBVyxFQUFFLEtBQUssSUFBSSxJQUFJLEVBQUUsVUFBVSxHQUFHLFVBQVUsRUFBRTtBQUM3RSxXQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sU0FBUyxTQUFTLEVBQUUsS0FBSyxPQUFPLE1BQU0sTUFBTSxTQUFTLEVBQUUsTUFBTSxPQUFPLFVBQVUsT0FBTyxRQUFRLEVBQUU7QUFBQSxFQUN4SCxDQUFDO0FBQ0w7QUFHQSxTQUFTLGdCQUFnQixTQUF3QixTQUErQjtBQUM5RSxRQUFNLE9BQWtCLENBQUM7QUFDekIsYUFBVyxRQUFRLFVBQVUsV0FBVyxJQUFJLE9BQU8sR0FBRztBQUNwRCxVQUFNLFFBQVEsS0FBSyxNQUFNLE1BQU0sSUFBSTtBQUNuQyxRQUFJLE1BQU0sU0FBUyxLQUFLLE1BQU0sTUFBTSxTQUFTLENBQUMsTUFBTSxHQUFJLE9BQU0sSUFBSTtBQUNsRSxlQUFXLFFBQVEsT0FBTztBQUN4QixVQUFJLEtBQUssTUFBTyxNQUFLLEtBQUssRUFBRSxNQUFNLE9BQU8sTUFBTSxJQUFJLElBQUksR0FBRyxDQUFDO0FBQUEsZUFDbEQsS0FBSyxRQUFTLE1BQUssS0FBSyxFQUFFLE1BQU0sT0FBTyxNQUFNLElBQUksSUFBSSxHQUFHLENBQUM7QUFBQSxVQUM3RCxNQUFLLEtBQUssRUFBRSxNQUFNLE9BQU8sTUFBTSxLQUFLLENBQUM7QUFBQSxJQUM1QztBQUFBLEVBQ0Y7QUFDQSxTQUFPLENBQUMsRUFBRSxNQUFNLE1BQU0sTUFBTSxTQUFTLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNwRDtBQUdBLFNBQVMsa0JBQWtCLFFBQW1DO0FBQzVELE1BQUksQ0FBQyxPQUFPLFdBQVcsT0FBTyxNQUFNLFdBQVcsRUFBRyxRQUFPLENBQUM7QUFDMUQsU0FBTyxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sT0FBTztBQUFBLElBQ3BDLE1BQU0sT0FBTyxNQUFNLFNBQVMsSUFBSSxXQUFXLElBQUksQ0FBQyxJQUFJLE9BQU8sTUFBTSxNQUFNLFFBQVE7QUFBQSxJQUMvRSxNQUFNLGdCQUFnQixLQUFLLFNBQVMsS0FBSyxPQUFPLEVBQUUsQ0FBQyxFQUFFO0FBQUEsRUFDdkQsRUFBRTtBQUNKO0FBTUEsSUFBTSxhQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFB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QUNKLE9BQU87QUFBQSxRQUNQLFFBQVE7QUFBQSxRQUNSLFFBQVEsT0FBTyxFQUFFLFVBQVUsSUFBSSxTQUFTO0FBQUEsTUFDMUM7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFJQSxNQUFJLE1BQU07QUFBQSxJQUFPO0FBQUEsSUFBOEIsTUFDN0MsSUFBSSxNQUFNO0FBQUEsTUFDUjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUSxDQUFDLFVBQVU7QUFBQSxRQUNuQixVQUFVO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQU1BLGFBQVcsT0FBTyxDQUFDLFFBQVEsVUFBVSxHQUFZO0FBQy9DLFFBQUksTUFBTTtBQUFBLE1BQU87QUFBQSxNQUEwQixNQUN6QyxJQUFJLE1BQU07QUFBQSxRQUNSO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTjtBQUFBLFVBQ0EsVUFBVTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBSUEsTUFBSSxNQUFNO0FBQUEsSUFBTztBQUFBLElBQXdCLE1BQ3ZDLElBQUksTUFBTTtBQUFBLE1BQ1I7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInZhbHVlIiwgIm5hbWUiLCAic2Nyb2xsVGltZXIiLCAiY2xlYXJUaW1lciJdCn0K

		})(module, module.exports, require);
		return module.exports;
	}
});
