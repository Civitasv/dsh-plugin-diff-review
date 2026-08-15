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
var composerDraftStore = (0, import_client.createSnapshotStore)({
  sessionId: null,
  text: "",
  key: 0
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
.dsdr-file-head-actions{display:flex;gap:3px;opacity:0;transition:opacity .12s}.dsdr-diff-head:hover .dsdr-file-head-actions,.dsdr-file-head-actions:focus-within{opacity:1}
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
.dsdr-files-menu{position:fixed;z-index:80;display:flex;min-width:180px;flex-direction:column;gap:2px;padding:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3)}.dsdr-files-menu button{border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);padding:8px 10px;text-align:left;font:12px var(--dsw-font-sans);cursor:pointer}.dsdr-files-menu button:hover{background:var(--dsw-alias-interactive-bg-hover)}
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
function FilesWorkspace({ cwd, t, collapsed, onToggleDir, target, onAddToChat }) {
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
  const [menu, setMenu] = (0, import_react.useState)(null);
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
    if (target && target !== selected) void open(target);
  }, [target]);
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
            renderLeaf: (leaf) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-files-item" + (selected === leaf.path ? " dsdr-files-item-active" : ""), onClick: () => void open(leaf.path), onContextMenu: (event) => {
              event.preventDefault();
              setMenu({ path: leaf.path, x: event.clientX, y: event.clientY });
            }, title: leaf.path, children: leaf.name })
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
    ] }),
    menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-files-menu", role: "menu", style: { left: menu.x, top: menu.y }, onPointerLeave: () => setMenu(null), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", role: "menuitem", onClick: () => {
        void openInEditor(cwd, menu.path);
        setMenu(null);
      }, children: "Open in editor" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", role: "menuitem", onClick: () => {
        void (0, import_dsh_client_ui_primitives.writeClipboard)(menu.path);
        setMenu(null);
      }, children: "Copy path" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", role: "menuitem", onClick: () => {
        onAddToChat(menu.path);
        setMenu(null);
      }, children: "Add to chat" })
    ] }) : null
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
function DiffReviewComposerDock({ sessionId, useSessions, sessions, inputActions, useInput, t }) {
  const cwd = useSessions((s) => s.byId[sessionId]?.cwd);
  const pending = (0, import_react.useSyncExternalStore)(pendingCommentsStore.subscribe, pendingCommentsStore.getSnapshot);
  const draftRequest = (0, import_react.useSyncExternalStore)(composerDraftStore.subscribe, composerDraftStore.getSnapshot);
  const draft = useInput((state) => state.draft);
  const [dismissed, setDismissed] = (0, import_react.useState)(false);
  const [carryFlash, setCarryFlash] = (0, import_react.useState)(null);
  const carrying = (0, import_react.useRef)(false);
  const consumedDraftRequest = (0, import_react.useRef)(0);
  (0, import_react.useEffect)(() => {
    if (draftRequest.key === 0 || draftRequest.key === consumedDraftRequest.current || draftRequest.sessionId !== sessionId) return;
    consumedDraftRequest.current = draftRequest.key;
    inputActions.setDraft(draft.trim() ? `${draft.trimEnd()}
${draftRequest.text}` : draftRequest.text);
  }, [draft, draftRequest, inputActions, sessionId]);
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
  const [filesTarget, setFilesTarget] = (0, import_react.useState)(null);
  const [collapsedReviewFiles, setCollapsedReviewFiles] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
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
  const openInFilesTab = (path) => {
    setFilesTarget(path);
    setSurface("files");
  };
  const toggleReviewFile = (path) => {
    setCollapsedReviewFiles((previous) => {
      const next = new Set(previous);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
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
              surface === "review" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiffViewToggle, { view, onChange: setView, t }) : null,
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
            surface === "files" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilesWorkspace, { cwd, t, collapsed: collapsedDirs, onToggleDir: toggleDir, target: filesTarget, onAddToChat: (path) => {
              composerDraftStore.update((draft) => {
                draft.sessionId = currentId ?? null;
                draft.text = `\u8BF7\u67E5\u770B\u5DE5\u4F5C\u533A\u6587\u4EF6\uFF1A${path}`;
                draft.key = draft.key + 1;
              });
            } }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
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
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsdr-diff-stats", children: t("review.changes", { added: commitDiff.added, deleted: commitDiff.deleted }) })
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
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsdr-file-head-actions", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon", title: "Copy path", "aria-label": "Copy path", onClick: () => void (0, import_dsh_client_ui_primitives.writeClipboard)(selectedFile.path), children: "\u29C9" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon", title: collapsedReviewFiles.has(selectedFile.path) ? "Expand file" : "Collapse file", "aria-label": collapsedReviewFiles.has(selectedFile.path) ? "Expand file" : "Collapse file", onClick: () => toggleReviewFile(selectedFile.path), children: collapsedReviewFiles.has(selectedFile.path) ? "\u2304" : "\u2303" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon", title: "Open file in Files", "aria-label": "Open file in Files", onClick: () => openInFilesTab(selectedFile.path), children: "\u2197" })
                      ] }),
                      allowActions && selectedFile.unstaged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon", title: t("hunk.stage"), "aria-label": t("hunk.stage"), disabled: busy, onClick: () => onFileAction("accept", selectedFile.path), children: "+" }) : null,
                      allowActions && selectedFile.staged ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon", title: t("hunk.unstage"), "aria-label": t("hunk.unstage"), disabled: busy, onClick: () => onFileAction("unstage", selectedFile.path), children: "\u2212" }) : null,
                      allowActions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsdr-file-icon dsdr-file-icon-danger", title: t("hunk.revert"), "aria-label": t("hunk.revert"), disabled: busy, onClick: () => onFileAction("revert", selectedFile.path), children: "\u21B6" }) : null
                    ] }),
                    !collapsedReviewFiles.has(selectedFile.path) ? view === "split" && !selectedFile.binary && gitSplitBlocks(selectedFile.diff).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsdr-diff-scroll", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsdr-split", children: [
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
                    ) : null
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2NsaWVudC9pbmRleC50c3giLCAibm9kZV9tb2R1bGVzL2RpZmYvbGliZXNtL2RpZmYvYmFzZS5qcyIsICJub2RlX21vZHVsZXMvZGlmZi9saWJlc20vZGlmZi9saW5lLmpzIiwgInNyYy9jbGllbnQvcmV2aWV3LXBhY2thZ2UudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRGlmZi1yZXZpZXcgcGx1Z2luIFx1MjAxNCBjbGllbnQgaGFsZi5cbiAqXG4gKiBDb2RleC1zdHlsZSByZXZpZXcgd2l0aCB0d28gc291cmNlczpcbiAqXG4gKiAxLiAqKlx1NEYxQVx1OEJERFx1NjZGNFx1NjUzOSAoU2Vzc2lvbiBjaGFuZ2VzKSoqIFx1MjAxNCB3aGF0IHRoZSBhZ2VudCBjaGFuZ2VkIGluIGVhY2ggcm91bmQgb2ZcbiAqICAgIHRoaXMgY29udmVyc2F0aW9uLCBkZXJpdmVkIGZyb20gdGhlIGNvbnZlcnNhdGlvbiBzbmFwc2hvdDogZWFjaCB0b29sXG4gKiAgICByZXN1bHQgdGhhdCBjYXJyaWVkIGZpbGUgZGlmZnMgYmVjb21lcyBjaGFuZ2UgZW50cmllcyAoaG9zdC1jb21wdXRlZFxuICogICAgYHJlc3VsdFZpZXdgIGh1bmtzLCBlbHNlIGNhbGwtdmlldy9tZXRhIGRpZmZzLCBlbHNlIGEgcGF0aC1vbmx5IGVudHJ5KS5cbiAqICAgIFdvcmtzIHdpdGggb3Igd2l0aG91dCBnaXQsIGFuZCBzaG93cyBhIGNoYW5nZSBldmVuIHdoZW4gbm8gZGlmZiB0ZXh0IGlzXG4gKiAgICBhdmFpbGFibGUgKHBhdGgtb25seSkuXG4gKiAyLiAqKlx1NURFNVx1NEY1Q1x1NTMzQSAoV29ya3NwYWNlKSoqIFx1MjAxNCB0aGUgZ2l0IHdvcmtpbmcgdHJlZSdzIHVuY29tbWl0dGVkIGNoYW5nZXNcbiAqICAgIChzdGFnZWQgKyB1bnN0YWdlZCArIHVudHJhY2tlZCkgd2l0aCBwZXItZmlsZSAvIGFsbC1maWxlIGFjY2VwdCAoc3RhZ2UpXG4gKiAgICBhbmQgcmV2ZXJ0IChkaXNjYXJkKSB0aHJvdWdoIHRoZSBwbHVnaW4ncyBzZXJ2ZXIgcm91dGVzLlxuICpcbiAqIFRoZSByZXZpZXcgc3VyZmFjZSBtb3VudHMgaW4gYHNoZWxsLm92ZXJsYXlgIChyb290IHNjb3BlKS4gU3RhdGUgaGFuZC1vZmZcbiAqIGJldHdlZW4gdGhlIHNlc3Npb24tc2NvcGVkIGhlYWRlciB0cmlnZ2VyIGFuZCB0aGUgcm9vdC1zY29wZWQgb3ZlcmxheSBnb2VzXG4gKiB0aHJvdWdoIGEgbW9kdWxlLWxldmVsIHNuYXBzaG90IHN0b3JlOyB0aGUgY29udmVyc2F0aW9uIHNuYXBzaG90IGZvciB0aGVcbiAqIGN1cnJlbnQgc2Vzc2lvbiBpcyByZWFkIHJlYWN0aXZlbHkgdGhyb3VnaCBgY3R4LnNlc3Npb25zYCAoaW5qZWN0ZWQgdmlhIHRoZVxuICogb3ZlcmxheSByZWdpc3RyYXRpb24ncyBpbmplY3QgZmFjZSkuXG4gKi9cbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSwgdXNlU3luY0V4dGVybmFsU3RvcmUsIEZyYWdtZW50IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENTU1Byb3BlcnRpZXMsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBkaWZmTGluZXMgfSBmcm9tICdkaWZmJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnRDb250ZXh0LCBJU2Vzc2lvbnMsIFNlc3Npb25MaXN0U3RhdGUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB7IGNyZWF0ZVNuYXBzaG90U3RvcmUgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1ydW50aW1lL2NsaWVudCdcbmltcG9ydCB0eXBlIHsgUHJvcHNMb2NhbGUsIFByb3BzUnVudGltZSB9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLXNsb3RzJ1xuaW1wb3J0IHR5cGUgeyBDb252ZXJzYXRpb25Ob2RlLCBUb29sUmVzdWx0Tm9kZSwgVXNlck1lc3NhZ2VOb2RlIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtcnVudGltZS9jbGllbnQnXG5pbXBvcnQgdHlwZSB7IFNlc3Npb25JZCwgVG9vbFJlc3VsdFZpZXcgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWFwaS1yZW1vdGVzL2NsaWVudCdcbmltcG9ydCB7IEljb25DaGV2cm9uRG93bk91dGxpbmUxNCwgd3JpdGVDbGlwYm9hcmQgfSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1wcmltaXRpdmVzJ1xuaW1wb3J0IHsgSW1hZ2VHYWxsZXJ5IH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktYXR0YWNobWVudCdcbmltcG9ydCB0eXBlIHsgSW1hZ2VBdHRhY2htZW50UmVmIH0gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1hdHRhY2htZW50J1xuLy8gVHlwZS1vbmx5IGltcG9ydHMgcHVsbGluZyB0aGUgaGVhZGVyLWFjdGlvbiBzbG90IGNvbnRyYWN0LCB0aGUgc2hlbGwub3ZlcmxheVxuLy8gY29udHJhY3QsIHRoZSBzZXR0aW5ncy5nZW5lcmFsLml0ZW0gc2xvdCBjb250cmFjdCBhbmQgdGhlIHN0YW5kYXJkIGtpdC5cbmltcG9ydCB0eXBlIHt9IGZyb20gJ0BkZWVwc2Vlay1haS9kc2gtY2xpZW50LXVpLWNvbnZlcnNhdGlvbi9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC11aS1sYXlvdXQvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MvY2xpZW50J1xuaW1wb3J0IHR5cGUge30gZnJvbSAnQGRlZXBzZWVrLWFpL2RzaC1jbGllbnQtdWktc2V0dGluZ3MtcGx1Z2lucy9jbGllbnQnXG5pbXBvcnQgdHlwZSB7fSBmcm9tICdAZGVlcHNlZWstYWkvZHNoLWNsaWVudC1sb2NhbGUvY2xpZW50J1xuaW1wb3J0IHR5cGUgeyBBcHBseUh1bmtSZXNwb25zZSwgQXBwbHlSZXNwb25zZSwgQ29tbWVudHNSZXNwb25zZSwgQ29tbWl0RGlmZlJlc3BvbnNlLCBDb21taXRJbmZvLCBEaWZmRmlsZSwgRGlmZkh1bmssIEZpbGVSZWFkUmVzcG9uc2UsIEZpbGVzTGlzdFJlc3BvbnNlLCBGaWxlV3JpdGVSZXNwb25zZSwgR2l0UmVzcG9uc2UsIEhpc3RvcnlSZXNwb25zZSwgUHJSZXNwb25zZSwgUmVwb3NSZXNwb25zZSwgUmV2aWV3Q29tbWVudCwgUmV2aWV3RmluZGluZywgUmV2aWV3UmVzcG9uc2UsIFN0YXR1c1Jlc3BvbnNlLCBXb3Jrc3BhY2VGaWxlRW50cnkgfSBmcm9tICcuLi9zaGFyZWQvdHlwZXMudHMnXG5pbXBvcnQgeyBwYXJzZVJldmlld1BhY2thZ2UsIGlzUmV2aWV3UGFja2FnZVRleHQgfSBmcm9tICcuL3Jldmlldy1wYWNrYWdlLnRzJ1xuaW1wb3J0IHR5cGUgeyBSZXZpZXdQYWNrYWdlLCBSZXZpZXdQYWNrYWdlQ29tbWVudCwgUmV2aWV3UGFja2FnZUZpbmRpbmcgfSBmcm9tICcuL3Jldmlldy1wYWNrYWdlLnRzJ1xuXG5leHBvcnQgY29uc3QgbmFtZSA9ICdkaWZmLXJldmlldydcblxuLyoqIFJlcXVpcmVkIGNsaWVudCBzZXJ2aWNlcyAoZmliZXIgaW5qZWN0KS4gKi9cbmV4cG9ydCBjb25zdCBpbmplY3QgPSBbJ3Nlc3Npb25zJywgJ3Nsb3RzJywgJ2xvY2FsZSddXG5cbmNvbnN0IExPQ0FMRV9OUyA9ICdkaWZmLXJldmlldydcbi8qKiBNYXggY29tbWVudCBjaGlwcyBzaG93biBpbiB0aGUgZG9jayByb3cgYmVmb3JlIGNvbGxhcHNpbmcgaW50byArTi4gKi9cbmNvbnN0IE1BWF9ET0NLX0NISVBTID0gNFxuY29uc3QgU1RBVFVTX1VSTCA9ICdkaWZmLXJldmlldy9zdGF0dXMnXG5jb25zdCBBUFBMWV9VUkwgPSAnZGlmZi1yZXZpZXcvYXBwbHknXG5jb25zdCBBUFBMWV9IVU5LX1VSTCA9ICdkaWZmLXJldmlldy9hcHBseS1odW5rJ1xuY29uc3QgQ09NTUlUX1VSTCA9ICdkaWZmLXJldmlldy9jb21taXQnXG5jb25zdCBQVVNIX1VSTCA9ICdkaWZmLXJldmlldy9wdXNoJ1xuY29uc3QgSElTVE9SWV9VUkwgPSAnZGlmZi1yZXZpZXcvaGlzdG9yeSdcbmNvbnN0IENPTU1JVF9ESUZGX1VSTCA9ICdkaWZmLXJldmlldy9jb21taXQtZGlmZidcbmNvbnN0IENPTU1FTlRTX1VSTCA9ICdkaWZmLXJldmlldy9jb21tZW50cydcbmNvbnN0IEJSQU5DSEVTX1VSTCA9ICdkaWZmLXJldmlldy9icmFuY2hlcydcbmNvbnN0IFJFVklFV19VUkwgPSAnZGlmZi1yZXZpZXcvcmV2aWV3J1xuY29uc3QgUFJfVVJMID0gJ2RpZmYtcmV2aWV3L3ByJ1xuY29uc3QgUkVQT1NfVVJMID0gJ2RpZmYtcmV2aWV3L3JlcG9zJ1xuY29uc3QgRklMRVNfVVJMID0gJ2RpZmYtcmV2aWV3L2ZpbGVzJ1xuY29uc3QgT1BFTl9FRElUT1JfVVJMID0gJ29wZW4tZWRpdG9yL29wZW4nXG5jb25zdCBTVFlMRV9UQUcgPSAnZHNoLXBsdWdpbi1kaWZmLXJldmlldy9yZXZpZXcuY3NzJ1xuXG4vKiogT3BlbiBzdGF0ZSBzaGFyZWQgYmV0d2VlbiB0aGUgaGVhZGVyIHRyaWdnZXIgKHNlc3Npb24gc2NvcGUpIGFuZCB0aGUgb3ZlcmxheSAocm9vdCBzY29wZSkuICovXG5jb25zdCBvdmVybGF5U3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPHsgb3BlbjogYm9vbGVhbjsgY3dkOiBzdHJpbmcgfCBudWxsOyBrZXk6IG51bWJlcjsgZm9jdXM/OiB7IHBhdGg6IHN0cmluZzsgbGluZT86IG51bWJlcjsgcm91bmQ/OiBudW1iZXI7IHRhYj86ICdzZXNzaW9uJyB8ICd3b3Jrc3BhY2UnIH0gfCBudWxsIH0+KHtcbiAgb3BlbjogZmFsc2UsXG4gIGN3ZDogbnVsbCxcbiAga2V5OiAwLFxuICBmb2N1czogbnVsbCxcbn0pXG5cbi8qKlxuICogUGVuZGluZyBpbmxpbmUgY29tbWVudHMgc3VyZmFjZWQgYWJvdmUgdGhlIGNvbXBvc2VyIChDb2RleC1zdHlsZSkuIFRoZVxuICogcmV2aWV3IG92ZXJsYXkgc3luY3MgaXRzIHdvcmtzcGFjZSBjb21tZW50cyAocGx1cyB0aGUgZGlmZiBjb250ZXh0IGFuZCB0aGVcbiAqIGxhc3QgQUkgcmV2aWV3IHJlc3VsdCkgaGVyZTsgdGhlIGNvbXBvc2VyIGRvY2sgcmVhZHMgdGhlbSBhbmQgY2FycmllcyBhXG4gKiBmdWxsIHJldmlldyBwYWNrYWdlIHdpdGggdGhlIHVzZXIncyBuZXh0IG1lc3NhZ2UuXG4gKi9cbmludGVyZmFjZSBQZW5kaW5nQ29tbWVudHMge1xuICBjd2Q6IHN0cmluZyB8IG51bGxcbiAgY29tbWVudHM6IFJldmlld0NvbW1lbnRbXVxuICAvKiogVW5pZmllZCBkaWZmIHRleHQgcGVyIGNvbW1lbnRlZCBwYXRoIChjb250ZXh0IGZvciB0aGUgY2FycmllZCBtZXNzYWdlKS4gKi9cbiAgZGlmZnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgLyoqIExhc3QgQUkgcmV2aWV3IHJlc3VsdCAodmVyZGljdCArIGZpbmRpbmdzKSwgYXBwZW5kZWQgdG8gdGhlIGNhcnJpZWQgbWVzc2FnZS4gKi9cbiAgcmV2aWV3OiBSZXZpZXdSZXNwb25zZSB8IG51bGxcbn1cbmNvbnN0IHBlbmRpbmdDb21tZW50c1N0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTxQZW5kaW5nQ29tbWVudHM+KHtcbiAgY3dkOiBudWxsLFxuICBjb21tZW50czogW10sXG4gIGRpZmZzOiB7fSxcbiAgcmV2aWV3OiBudWxsLFxufSlcblxuLyoqIEEgb25lLXNob3QgcmVxdWVzdCB0byBwdXQgYSBmaWxlIHJlZmVyZW5jZSBpbnRvIGEgc2Vzc2lvbidzIGNvbXBvc2VyLiAqL1xuY29uc3QgY29tcG9zZXJEcmFmdFN0b3JlID0gY3JlYXRlU25hcHNob3RTdG9yZTx7IHNlc3Npb25JZDogU2Vzc2lvbklkIHwgbnVsbDsgdGV4dDogc3RyaW5nOyBrZXk6IG51bWJlciB9Pih7XG4gIHNlc3Npb25JZDogbnVsbCxcbiAgdGV4dDogJycsXG4gIGtleTogMCxcbn0pXG5cbi8qKlxuICogRHVyYWJsZSwgcGVyLXdvcmtzcGFjZSBcImFscmVhZHkgY2FycmllZFwiIHN0YXRlIChzdXJ2aXZlcyByZWxvYWRzOyBpc29sYXRlZFxuICogcGVyIGN3ZCBzbyBjb21tZW50cyBzZW50IGluIG9uZSB3b3Jrc3BhY2UgbmV2ZXIgZmlsdGVyIGFub3RoZXIncykuXG4gKi9cbmNvbnN0IHNlbnRTdG9yZSA9IGNyZWF0ZVNuYXBzaG90U3RvcmU8UmVjb3JkPHN0cmluZywgeyBzZW50Q29tbWVudElkczogc3RyaW5nW107IHNlbnRSZXZpZXdLZXk6IHN0cmluZyB8IG51bGwgfT4+KHt9LCB7IHBlcnNpc3Q6IHsgbmFtZTogJ2RzZHItcmV2aWV3LXNlbnQnIH0gfSlcblxuLyoqIEluamVjdCB0ZXh0IGludG8gYSBzZXNzaW9uIGFzIGEgdXNlciBtZXNzYWdlOyBmYWxscyBiYWNrIHRvIHRoZSBjbGlwYm9hcmQuICovXG5hc3luYyBmdW5jdGlvbiBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnM6IElTZXNzaW9ucyB8IHVuZGVmaW5lZCwgc2Vzc2lvbklkOiBTZXNzaW9uSWQgfCBudWxsLCB0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPCdzZW50JyB8ICdjb3BpZWQnIHwgJ2ZhaWxlZCc+IHtcbiAgY29uc3QgYmluZGluZyA9IHNlc3Npb25JZCA/IHNlc3Npb25zPy5iaW5kaW5nKHNlc3Npb25JZCkgOiB1bmRlZmluZWRcbiAgY29uc3Qgc2Vzc2lvbiA9IGJpbmRpbmc/LnNlc3Npb25cbiAgaWYgKHNlc3Npb24pIHtcbiAgICB0cnkge1xuICAgICAgLy8gJ3N0ZWVyJyAobm90ICdxdWV1ZScpOiB0aGUgcmV2aWV3IHBhY2thZ2UgaXMgaW5qZWN0ZWQgYXMgYSBzdGVlcmluZ1xuICAgICAgLy8gbWVzc2FnZSBcdTIwMTQgdGhlIGFnZW50IGhhbmRsZXMgaXQgb24gaXRzIG5leHQgc3RlcCAob3IgdGhlIGlkbGUgYWdlbnQgaXNcbiAgICAgIC8vIHdva2VuIGltbWVkaWF0ZWx5KSwgc28gaXQgbmV2ZXIgc2hvd3MgdXAgYXMgYSBxdWV1ZWQgaXRlbSBhYm92ZSB0aGVcbiAgICAgIC8vIGlucHV0LiAncXVldWUnIHdvdWxkIGFwcGVuZCBhZnRlciB0aGUgY3VycmVudCB0dXJuIGFuZCBzdXJmYWNlIGFzIGFcbiAgICAgIC8vIFwiXHU2MzkyXHU5NjFGXHU0RkUxXHU2MDZGXCIgc3RyaXAgaW5zdGVhZC5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHNlc3Npb24ucHJvbXB0KFt7IHR5cGU6ICd0ZXh0JywgdGV4dCB9XSwgJ3N0ZWVyJylcbiAgICAgIGlmIChyZXN1bHQub2spIHJldHVybiAnc2VudCdcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byB0aGUgY29weSBmYWxsYmFja1xuICAgIH1cbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gICAgcmV0dXJuICdjb3BpZWQnXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnZmFpbGVkJ1xuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUmV2aWV3IHByZWZlcmVuY2VzIChmb250IC8gc2l6ZSAvIHBhbmVsIGdlb21ldHJ5KSwgc2hhcmVkIGJ5IHRoZSBvdmVybGF5XG4vLyBhbmQgdGhlIFNldHRpbmdzIFx1MjE5MiBHZW5lcmFsIHJvdy4gUGVyc2lzdGVkIHRvIGxvY2FsU3RvcmFnZSBieSB0aGUgc3RvcmUuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFBhbmVsIGdlb21ldHJ5IGJvdW5kcy4gKi9cbmV4cG9ydCBjb25zdCBNSU5fUEFORUxfVyA9IDY0MFxuZXhwb3J0IGNvbnN0IE1JTl9QQU5FTF9IID0gNDAwXG5cbmludGVyZmFjZSBQcmVmcyB7XG4gIC8qKiBGb250IG9wdGlvbiBpZCAoc2VlIEZPTlRfT1BUSU9OUykuICovXG4gIGZvbnQ6IHN0cmluZ1xuICAvKiogRGlmZiB0ZXh0IHNpemUgaW4gcHguICovXG4gIHNpemU6IG51bWJlclxuICAvKiogUGFuZWwgd2lkdGggaW4gcHguICovXG4gIHdpZHRoOiBudW1iZXJcbiAgLyoqIFBhbmVsIGhlaWdodCBpbiBweC4gKi9cbiAgaGVpZ2h0OiBudW1iZXJcbn1cblxuY29uc3QgRk9OVF9PUFRJT05TOiB7IGlkOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmc7IGNzczogc3RyaW5nIH1bXSA9IFtcbiAgeyBpZDogJ21vbm8nLCBsYWJlbDogJ2ZvbnQubW9ubycsIGNzczogJ3ZhcigtLWRzdy1mb250LW1vbm8pJyB9LFxuICB7IGlkOiAnc3lzdGVtJywgbGFiZWw6ICdmb250LnN5c3RlbScsIGNzczogJ3N5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZicgfSxcbiAgeyBpZDogJ2NvbnNvbGFzJywgbGFiZWw6ICdDb25zb2xhcycsIGNzczogJ0NvbnNvbGFzLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZScgfSxcbiAgeyBpZDogJ2pldGJyYWlucycsIGxhYmVsOiAnSmV0QnJhaW5zIE1vbm8nLCBjc3M6ICdcIkpldEJyYWlucyBNb25vXCIsIENvbnNvbGFzLCBtb25vc3BhY2UnIH0sXG4gIHsgaWQ6ICdmaXJhJywgbGFiZWw6ICdGaXJhIENvZGUnLCBjc3M6ICdcIkZpcmEgQ29kZVwiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuICB7IGlkOiAnc291cmNlJywgbGFiZWw6ICdTb3VyY2UgQ29kZSBQcm8nLCBjc3M6ICdcIlNvdXJjZSBDb2RlIFByb1wiLCBDb25zb2xhcywgbW9ub3NwYWNlJyB9LFxuXVxuXG5jb25zdCBTSVpFX09QVElPTlMgPSBbMTEsIDEyLCAxMywgMTQsIDE2LCAxOF1cblxuLyoqIFJldmlldyBzY29wZXMgb2YgdGhlIHdvcmtzcGFjZSB0YWIgKGFsaWduZWQgd2l0aCB0aGUgQ29kZXggcmV2aWV3IHBhbmUpLiAqL1xudHlwZSBXb3Jrc3BhY2VTY29wZSA9ICdhbGwnIHwgJ3Vuc3RhZ2VkJyB8ICdzdGFnZWQnIHwgJ2NvbW1pdCcgfCAnYnJhbmNoJyB8ICdsYXN0LXR1cm4nXG5cbi8qKiBSZXZpZXctc2NvcGUgZHJvcGRvd24gb3B0aW9uczogZWFjaCBpZCBtYXBzIHRvIGEgbG9jYWxlIGxhYmVsIGluIGB6aGAvYGVuYC4gKi9cbmNvbnN0IFNDT1BFX09QVElPTlM6IHsgaWQ6IFdvcmtzcGFjZVNjb3BlOyBsYWJlbDoga2V5b2YgdHlwZW9mIHpoIH1bXSA9IFtcbiAgeyBpZDogJ3Vuc3RhZ2VkJywgbGFiZWw6ICdzY29wZS51bnN0YWdlZCcgfSxcbiAgeyBpZDogJ3N0YWdlZCcsIGxhYmVsOiAnc2NvcGUuc3RhZ2VkJyB9LFxuICB7IGlkOiAnY29tbWl0JywgbGFiZWw6ICdzY29wZS5jb21taXQnIH0sXG4gIHsgaWQ6ICdicmFuY2gnLCBsYWJlbDogJ3Njb3BlLmJyYW5jaCcgfSxcbiAgeyBpZDogJ2xhc3QtdHVybicsIGxhYmVsOiAnc2NvcGUubGFzdC10dXJuJyB9LFxuXVxuXG4vKiogQnJvd3Nlci1zaWRlIGFic29sdXRlIHBhdGggY2hlY2sgKG5vIG5vZGU6cGF0aCBpbiB0aGUgY2xpZW50IGJ1bmRsZSkuICovXG5mdW5jdGlvbiBpc0Fic1BhdGgocDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocClcbn1cblxuLyoqIExhcmdlc3Qgb2YgdGhyZWUgbnVtYmVycyAocHJlZmVycyBiIG9uIHRpZXMpLiAqL1xuZnVuY3Rpb24gbWF4T2YzKGE6IG51bWJlciwgYjogbnVtYmVyLCBjOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAoYiA+PSBhICYmIGIgPj0gYykgcmV0dXJuIGJcbiAgaWYgKGEgPj0gYykgcmV0dXJuIGFcbiAgcmV0dXJuIGNcbn1cblxuZnVuY3Rpb24gYmFzZU5hbWUocDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHAuc3BsaXQoL1tcXFxcL10vKS5wb3AoKSA/PyBwXG59XG5cbmNvbnN0IHByZWZzU3RvcmUgPSBjcmVhdGVTbmFwc2hvdFN0b3JlPFByZWZzPihcbiAgeyBmb250OiAnbW9ubycsIHNpemU6IDEyLCB3aWR0aDogMTEyMCwgaGVpZ2h0OiA3MjAgfSxcbiAgeyBwZXJzaXN0OiB7IG5hbWU6ICdkc2RyLXByZWZzJyB9IH0sXG4pXG5cbi8qKiBDU1MgZm9udC1mYW1pbHkgZm9yIGEgc3RvcmVkIGZvbnQgb3B0aW9uIGlkLiAqL1xuZnVuY3Rpb24gZm9udENzcyhpZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIEZPTlRfT1BUSU9OUy5maW5kKChmKSA9PiBmLmlkID09PSBpZCk/LmNzcyA/PyBGT05UX09QVElPTlNbMF0uY3NzXG59XG5cbi8qKiBQYW5lbCBDU1MgdmFyaWFibGVzIGNhcnJ5aW5nIHRoZSBmb250L3NpemUgcHJlZmVyZW5jZS4gKi9cbmZ1bmN0aW9uIGRpZmZTdHlsZVZhcnMocHJlZnM6IFByZWZzKTogQ1NTUHJvcGVydGllcyB7XG4gIHJldHVybiB7XG4gICAgJy0tZHNkci1kaWZmLWZvbnQnOiBmb250Q3NzKHByZWZzLmZvbnQpLFxuICAgICctLWRzZHItZGlmZi1zaXplJzogYCR7cHJlZnMuc2l6ZX1weGAsXG4gIH0gYXMgQ1NTUHJvcGVydGllc1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNlc3Npb24tY2hhbmdlcyBleHRyYWN0aW9uIChjbGllbnQtc2lkZSwgd29ya3Mgd2l0aG91dCBnaXQpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYmVmb3JlL2FmdGVyIHNsaWNlIG9mIGEgY2hhbmdlIChhIGh1bmspLiAqL1xuaW50ZXJmYWNlIEh1bmsge1xuICBvbGRUZXh0OiBzdHJpbmcgfCBudWxsXG4gIG5ld1RleHQ6IHN0cmluZ1xufVxuXG4vKiogT25lIGZpbGUgY2hhbmdlZCBpbnNpZGUgb25lIHJvdW5kLiAqL1xuaW50ZXJmYWNlIFJvdW5kQ2hhbmdlIHtcbiAgcGF0aDogc3RyaW5nXG4gIHRvb2w6IHN0cmluZ1xuICBodW5rczogSHVua1tdXG4gIC8qKiBGYWxzZSB3aGVuIG9ubHkgdGhlIHBhdGggaXMga25vd24gKG5vIGRpZmYgZGF0YSBwZXJzaXN0ZWQpLiAqL1xuICBoYXNEaWZmOiBib29sZWFuXG59XG5cbi8qKiBPbmUgdXNlciByb3VuZCBhbmQgdGhlIGZpbGVzIGl0IGNoYW5nZWQuICovXG5pbnRlcmZhY2UgU2Vzc2lvblJvdW5kIHtcbiAgcm91bmQ6IG51bWJlclxuICBsYWJlbDogc3RyaW5nXG4gIGNoYW5nZXM6IFJvdW5kQ2hhbmdlW11cbn1cblxuLyoqIE9uZSBmaWxlIHN1bW1hcml6ZWQgaW4gdGhlIHJlcGx5LWxvY2FsIGNoYW5nZXMgY2FyZC4gKi9cbmludGVyZmFjZSBUdXJuQ2hhbmdlU3VtbWFyeSB7XG4gIHBhdGg6IHN0cmluZ1xuICBhZGRlZDogbnVtYmVyXG4gIGRlbGV0ZWQ6IG51bWJlclxufVxuXG5pbnRlcmZhY2UgRmlsZURpZmZMaWtlIHtcbiAgcGF0aDogc3RyaW5nXG4gIG9sZFRleHQ6IHN0cmluZyB8IG51bGxcbiAgbmV3VGV4dDogc3RyaW5nXG59XG5cbi8qKiBWYWxpZGF0ZSBhIHJhdyBGaWxlRGlmZi1zaGFwZWQgdmFsdWUgKHRoZSB0b29scycgYHtwYXRoLCBvbGRUZXh0LCBuZXdUZXh0fWAgY29udHJhY3QpLiAqL1xuZnVuY3Rpb24gYXNGaWxlRGlmZihyYXc6IHVua25vd24pOiBGaWxlRGlmZkxpa2UgfCBudWxsIHtcbiAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGNvbnN0IHJlYyA9IHJhdyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuICBpZiAodHlwZW9mIHJlYy5wYXRoICE9PSAnc3RyaW5nJyB8fCAhcmVjLnBhdGgpIHJldHVybiBudWxsXG4gIGlmICh0eXBlb2YgcmVjLm5ld1RleHQgIT09ICdzdHJpbmcnKSByZXR1cm4gbnVsbFxuICBjb25zdCBvbGRUZXh0ID0gcmVjLm9sZFRleHRcbiAgcmV0dXJuIHsgcGF0aDogcmVjLnBhdGgsIG9sZFRleHQ6IHR5cGVvZiBvbGRUZXh0ID09PSAnc3RyaW5nJyA/IG9sZFRleHQgOiBudWxsLCBuZXdUZXh0OiByZWMubmV3VGV4dCB9XG59XG5cbi8qKiBEaWZmIGh1bmtzIGNhcnJpZWQgYnkgYSBkaWZmIGNhcmQgKGNhbGwgdmlldyBvciByZXN1bHQgdmlldykuICovXG5mdW5jdGlvbiBkaWZmc0Zyb21EaWZmQ2FyZCh2aWV3OiB7IGNhcmQ/OiB1bmtub3duOyBkaWZmcz86IHVua25vd24gfSB8IG51bGwgfCB1bmRlZmluZWQpOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghdmlldyB8fCB2aWV3LmNhcmQgIT09ICdkaWZmJyB8fCAhQXJyYXkuaXNBcnJheSh2aWV3LmRpZmZzKSkgcmV0dXJuIFtdXG4gIHJldHVybiB2aWV3LmRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG4vKiogSHVtYW4gbGFiZWwgZm9yIGEgY2FsbCB3aG9zZSBgY2FsbGAgaGVhZCB3YXMgdHJ1bmNhdGVkIG91dCBvZiB0aGUgd2luZG93LiAqL1xuZnVuY3Rpb24gZGlmZkNhcmRUaXRsZSh2aWV3OiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmICghdmlldyB8fCB0eXBlb2YgdmlldyAhPT0gJ29iamVjdCcpIHJldHVybiBudWxsXG4gIGNvbnN0IHRpdGxlID0gKHZpZXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLnRpdGxlXG4gIHJldHVybiB0eXBlb2YgdGl0bGUgPT09ICdzdHJpbmcnICYmIHRpdGxlLnRyaW0oKSA/IHRpdGxlLnRyaW0oKSA6IG51bGxcbn1cblxuLyoqIFJhdyBgbWV0YS5kaWZmc2AgZmFsbGJhY2sgKHRoZSBwZXJzaXN0ZWQgdG9vbC9yZXN1bHQgbWV0YSkuICovXG5mdW5jdGlvbiBkaWZmc0Zyb21NZXRhKG1ldGE6IHVua25vd24pOiBGaWxlRGlmZkxpa2VbXSB7XG4gIGlmICghbWV0YSB8fCB0eXBlb2YgbWV0YSAhPT0gJ29iamVjdCcpIHJldHVybiBbXVxuICBjb25zdCBkaWZmcyA9IChtZXRhIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KS5kaWZmc1xuICBpZiAoIUFycmF5LmlzQXJyYXkoZGlmZnMpKSByZXR1cm4gW11cbiAgcmV0dXJuIGRpZmZzLm1hcChhc0ZpbGVEaWZmKS5maWx0ZXIoKGQpOiBkIGlzIEZpbGVEaWZmTGlrZSA9PiBkICE9PSBudWxsKVxufVxuXG5jb25zdCBNVVRBVElPTl9UT09MUyA9IG5ldyBTZXQoWydzdHJfcmVwbGFjZV9lZGl0b3InLCAnbm90ZWJvb2tfZWRpdCddKVxuY29uc3QgTVVUQVRJT05fQ09NTUFORFMgPSBuZXcgU2V0KFsnd3JpdGUnLCAnZWRpdCcsICdyZXBsYWNlJywgJ2RlbGV0ZScsICdtb3ZlJ10pXG5cbi8qKiBQYXRoLW9ubHkgZmFsbGJhY2sgZm9yIGtub3duIGZpbGUtbXV0YXRpbmcgdG9vbHMgd2hvc2UgcmVzdWx0IGNhcnJpZWQgbm8gZGlmZi4gKi9cbmZ1bmN0aW9uIG11dGF0aW9uUGF0aCh0b29sOiBzdHJpbmcsIGFyZ3NSYXc6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBsZXQgYXJnczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCBudWxsID0gbnVsbFxuICB0cnkge1xuICAgIGFyZ3MgPSBKU09OLnBhcnNlKGFyZ3NSYXcpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgaWYgKCFhcmdzIHx8IHR5cGVvZiBhcmdzICE9PSAnb2JqZWN0JykgcmV0dXJuIG51bGxcbiAgaWYgKHRvb2wgPT09ICdmcycgfHwgdG9vbCA9PT0gJ2ZpbGVzeXN0ZW0nKSB7XG4gICAgY29uc3QgY21kID0gdHlwZW9mIGFyZ3MuY29tbWFuZCA9PT0gJ3N0cmluZycgPyBhcmdzLmNvbW1hbmQgOiAnJ1xuICAgIGlmICghTVVUQVRJT05fQ09NTUFORFMuaGFzKGNtZCkpIHJldHVybiBudWxsXG4gICAgcmV0dXJuIHR5cGVvZiBhcmdzLmZpbGVfcGF0aCA9PT0gJ3N0cmluZycgJiYgYXJncy5maWxlX3BhdGggPyBhcmdzLmZpbGVfcGF0aCA6IG51bGxcbiAgfVxuICBpZiAoTVVUQVRJT05fVE9PTFMuaGFzKHRvb2wpIHx8IHRvb2wuc3RhcnRzV2l0aCgnZWRpdCcpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgWydmaWxlX3BhdGgnLCAncGF0aCcsICdmaWxlbmFtZSddKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3Nba2V5XSA9PT0gJ3N0cmluZycgJiYgYXJnc1trZXldKSByZXR1cm4gYXJnc1trZXldIGFzIHN0cmluZ1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG4vKiogRXh0cmFjdCB0aGUgY2hhbmdlZCBmaWxlcyBmcm9tIG9uZSBzZXR0bGVkIHRvb2wgcmVzdWx0IChkaWZmIGh1bmtzLCBlbHNlIHBhdGgtb25seSkuICovXG5mdW5jdGlvbiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQoY2FsbDogeyBuYW1lOiBzdHJpbmc7IGFyZ3NSYXc6IHN0cmluZyB9IHwgbnVsbCwgbm9kZTogVG9vbFJlc3VsdE5vZGUpOiBSb3VuZENoYW5nZVtdIHtcbiAgLy8gTG9uZyBzZXNzaW9ucyB0cnVuY2F0ZSB0aGUgY2FsbCBoZWFkIG91dCBvZiB0aGUgd2luZG93IChjYWxsID09PSBudWxsKSwgYnV0XG4gIC8vIHRoZSBob3N0LWNvbXB1dGVkIGNhbGwvcmVzdWx0IGRpZmYgY2FyZHMgc3RpbGwgY2FycnkgdGhlIGNoYW5nZSBcdTIwMTQgcmVhZCB0aG9zZS5cbiAgY29uc3QgcmVzdWx0RGlmZnMgPSBkaWZmc0Zyb21EaWZmQ2FyZChub2RlLnJlc3VsdFZpZXcpXG4gIGNvbnN0IGNhbGxEaWZmcyA9IHJlc3VsdERpZmZzLmxlbmd0aCA9PT0gMCA/IGRpZmZzRnJvbURpZmZDYXJkKG5vZGUuY2FsbFZpZXcpIDogW11cbiAgY29uc3QgbWV0YURpZmZzID0gcmVzdWx0RGlmZnMubGVuZ3RoID09PSAwICYmIGNhbGxEaWZmcy5sZW5ndGggPT09IDAgPyBkaWZmc0Zyb21NZXRhKG5vZGUubWV0YSkgOiBbXVxuICBjb25zdCBhbGxEaWZmcyA9IHJlc3VsdERpZmZzLmxlbmd0aCA+IDAgPyByZXN1bHREaWZmcyA6IGNhbGxEaWZmcy5sZW5ndGggPiAwID8gY2FsbERpZmZzIDogbWV0YURpZmZzXG4gIGNvbnN0IHRvb2wgPSBjYWxsPy5uYW1lID8/IGRpZmZDYXJkVGl0bGUobm9kZS5jYWxsVmlldykgPz8gJ3Rvb2wnXG4gIGlmIChhbGxEaWZmcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJvdW5kQ2hhbmdlPigpXG4gICAgZm9yIChjb25zdCBkIG9mIGFsbERpZmZzKSB7XG4gICAgICBsZXQgZW50cnkgPSBieVBhdGguZ2V0KGQucGF0aClcbiAgICAgIGlmICghZW50cnkpIHtcbiAgICAgICAgZW50cnkgPSB7IHBhdGg6IGQucGF0aCwgdG9vbCwgaHVua3M6IFtdLCBoYXNEaWZmOiB0cnVlIH1cbiAgICAgICAgYnlQYXRoLnNldChkLnBhdGgsIGVudHJ5KVxuICAgICAgfVxuICAgICAgZW50cnkuaHVua3MucHVzaCh7IG9sZFRleHQ6IGQub2xkVGV4dCwgbmV3VGV4dDogZC5uZXdUZXh0IH0pXG4gICAgfVxuICAgIHJldHVybiBbLi4uYnlQYXRoLnZhbHVlcygpXVxuICB9XG4gIGNvbnN0IHBhdGggPSBjYWxsID8gbXV0YXRpb25QYXRoKHRvb2wsIGNhbGwuYXJnc1JhdykgOiBudWxsXG4gIHJldHVybiBwYXRoID8gW3sgcGF0aCwgdG9vbCwgaHVua3M6IFtdLCBoYXNEaWZmOiBmYWxzZSB9XSA6IFtdXG59XG5cbi8qKiBQbGFpbiB0ZXh0IG9mIGEgdXNlciBtZXNzYWdlIChjb250ZW50IGJsb2NrcyBvZiB0eXBlICd0ZXh0JykuICovXG5mdW5jdGlvbiB1c2VyVGV4dChub2RlOiBVc2VyTWVzc2FnZU5vZGUpOiBzdHJpbmcge1xuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIG5vZGUuY29udGVudCkge1xuICAgIGlmIChibG9jayAmJiB0eXBlb2YgYmxvY2sgPT09ICdvYmplY3QnICYmIChibG9jayBhcyB7IHR5cGU/OiB1bmtub3duIH0pLnR5cGUgPT09ICd0ZXh0JyAmJiB0eXBlb2YgKGJsb2NrIGFzIHsgdGV4dD86IHVua25vd24gfSkudGV4dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBhcnRzLnB1c2goKGJsb2NrIGFzIHsgdGV4dDogc3RyaW5nIH0pLnRleHQpXG4gICAgfVxuICB9XG4gIHJldHVybiBwYXJ0cy5qb2luKCcgJykucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxufVxuXG4vKiogV2FsayB0aGUgY29udmVyc2F0aW9uIG5vZGVzIGFuZCBncm91cCBjaGFuZ2VkIGZpbGVzIGJ5IHVzZXIgcm91bmQuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdFNlc3Npb25Sb3VuZHMobm9kZXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbk5vZGVbXSk6IFNlc3Npb25Sb3VuZFtdIHtcbiAgY29uc3Qgcm91bmRzOiBTZXNzaW9uUm91bmRbXSA9IFtdXG4gIGxldCBjdXJyZW50OiBTZXNzaW9uUm91bmQgfCBudWxsID0gbnVsbFxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBpZiAobm9kZS5raW5kID09PSAndXNlcicpIHtcbiAgICAgIGN1cnJlbnQgPSB7IHJvdW5kOiByb3VuZHMubGVuZ3RoICsgMSwgbGFiZWw6IHVzZXJUZXh0KG5vZGUpLnNsaWNlKDAsIDYwKSwgY2hhbmdlczogW10gfVxuICAgICAgcm91bmRzLnB1c2goY3VycmVudClcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcpIGNvbnRpbnVlXG4gICAgLy8gVGhlIHdpbmRvdyBjYW4gc3RhcnQgbWlkLXR1cm4gKHRoZSBsZWFkaW5nIHVzZXIgbWVzc2FnZSB0cnVuY2F0ZWQgb3V0KTtcbiAgICAvLyBzdGlsbCBzdXJmYWNlIHRoZSB0b29sIHJlc3VsdHMgdW5kZXIgYW4gaW1wbGljaXQgcm91bmQuXG4gICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICBjdXJyZW50ID0geyByb3VuZDogcm91bmRzLmxlbmd0aCArIDEsIGxhYmVsOiAnJywgY2hhbmdlczogW10gfVxuICAgICAgcm91bmRzLnB1c2goY3VycmVudClcbiAgICB9XG4gICAgZm9yIChjb25zdCBjaGFuZ2Ugb2YgY2hhbmdlc0Zyb21Ub29sUmVzdWx0KG5vZGUuY2FsbCwgbm9kZSkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gY3VycmVudC5jaGFuZ2VzLmZpbmQoKGMpID0+IGMucGF0aCA9PT0gY2hhbmdlLnBhdGggJiYgYy50b29sID09PSBjaGFuZ2UudG9vbClcbiAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICBpZiAoY2hhbmdlLmhhc0RpZmYpIHtcbiAgICAgICAgICBleGlzdGluZy5odW5rcy5wdXNoKC4uLmNoYW5nZS5odW5rcylcbiAgICAgICAgICBleGlzdGluZy5oYXNEaWZmID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50LmNoYW5nZXMucHVzaChjaGFuZ2UpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByb3VuZHMuZmlsdGVyKChyKSA9PiByLmNoYW5nZXMubGVuZ3RoID4gMClcbn1cblxuLyoqIENvdW50IG9mIGNoYW5nZWQgZmlsZXMgYWNyb3NzIGFsbCByb3VuZHMgKGZvciB0aGUgaGVhZGVyIGJhZGdlKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3VudFNlc3Npb25DaGFuZ2VzKG5vZGVzOiByZWFkb25seSBDb252ZXJzYXRpb25Ob2RlW10pOiBudW1iZXIge1xuICBsZXQgY291bnQgPSAwXG4gIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBpZiAobm9kZS5raW5kICE9PSAndG9vbC1yZXN1bHQnKSBjb250aW51ZVxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGNoYW5nZXNGcm9tVG9vbFJlc3VsdChub2RlLmNhbGwsIG5vZGUpKSB7XG4gICAgICBjb25zdCBrZXkgPSBgJHtjaGFuZ2UudG9vbH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICBpZiAoIXNlZW4uaGFzKGtleSkpIHtcbiAgICAgICAgc2Vlbi5hZGQoa2V5KVxuICAgICAgICBjb3VudCsrXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudFxufVxuXG5mdW5jdGlvbiB0ZXh0TGluZUNvdW50KHRleHQ6IHN0cmluZyk6IG51bWJlciB7XG4gIGlmICh0ZXh0ID09PSAnJykgcmV0dXJuIDBcbiAgcmV0dXJuIHRleHQuc3BsaXQoJ1xcbicpLmxlbmd0aCAtICh0ZXh0LmVuZHNXaXRoKCdcXG4nKSA/IDEgOiAwKVxufVxuXG4vKiogTWVyZ2UgYWxsIGZpbGUgbXV0YXRpb25zIGJvdW5kZWQgYnkgb25lIGVuZ2luZS1vd25lZCBhZ2VudCB0dXJuLiAqL1xuZnVuY3Rpb24gY29sbGVjdFR1cm5DaGFuZ2VzKG5vZGVzOiByZWFkb25seSBDb252ZXJzYXRpb25Ob2RlW10sIHN0YXJ0U2VxOiBudW1iZXIsIGVuZFNlcTogbnVtYmVyKTogVHVybkNoYW5nZVN1bW1hcnlbXSB7XG4gIGNvbnN0IGZpbGVzID0gbmV3IE1hcDxzdHJpbmcsIFR1cm5DaGFuZ2VTdW1tYXJ5PigpXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGlmIChub2RlLmtpbmQgIT09ICd0b29sLXJlc3VsdCcgfHwgbm9kZS5zZXEgPCBzdGFydFNlcSB8fCBub2RlLnNlcSA+IGVuZFNlcSkgY29udGludWVcbiAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzRnJvbVRvb2xSZXN1bHQobm9kZS5jYWxsLCBub2RlKSkge1xuICAgICAgY29uc3QgY3VycmVudCA9IGZpbGVzLmdldChjaGFuZ2UucGF0aCkgPz8geyBwYXRoOiBjaGFuZ2UucGF0aCwgYWRkZWQ6IDAsIGRlbGV0ZWQ6IDAgfVxuICAgICAgZm9yIChjb25zdCBodW5rIG9mIGNoYW5nZS5odW5rcykge1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgZGlmZkxpbmVzKGh1bmsub2xkVGV4dCA/PyAnJywgaHVuay5uZXdUZXh0KSkge1xuICAgICAgICAgIGlmIChwYXJ0LmFkZGVkKSBjdXJyZW50LmFkZGVkICs9IHRleHRMaW5lQ291bnQocGFydC52YWx1ZSlcbiAgICAgICAgICBlbHNlIGlmIChwYXJ0LnJlbW92ZWQpIGN1cnJlbnQuZGVsZXRlZCArPSB0ZXh0TGluZUNvdW50KHBhcnQudmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZpbGVzLnNldChjaGFuZ2UucGF0aCwgY3VycmVudClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFsuLi5maWxlcy52YWx1ZXMoKV1cbn1cblxuLyoqIEFkYXB0IGEgcGVyc2lzdGVkIHNlc3Npb24gZGlmZiB0byB0aGUgcmVhZC1vbmx5IGZpbGUgc2hhcGUgdXNlZCBieSBMYXN0IFR1cm4uICovXG5mdW5jdGlvbiBzZXNzaW9uQ2hhbmdlVG9EaWZmRmlsZShjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogRGlmZkZpbGUge1xuICBsZXQgYWRkZWQgPSAwXG4gIGxldCBkZWxldGVkID0gMFxuICBjb25zdCBjaHVua3M6IHN0cmluZ1tdID0gW2BkaWZmIC0tZ2l0IGEvJHtjaGFuZ2UucGF0aH0gYi8ke2NoYW5nZS5wYXRofWAsIGAtLS0gYS8ke2NoYW5nZS5wYXRofWAsIGArKysgYi8ke2NoYW5nZS5wYXRofWBdXG4gIGZvciAoY29uc3QgaHVuayBvZiBjaGFuZ2UuaHVua3MpIHtcbiAgICBjb25zdCBiZWZvcmUgPSBodW5rLm9sZFRleHQgPz8gJydcbiAgICBjb25zdCBhZnRlciA9IGh1bmsubmV3VGV4dFxuICAgIGNvbnN0IGJlZm9yZUxpbmVzID0gdGV4dExpbmVDb3VudChiZWZvcmUpXG4gICAgY29uc3QgYWZ0ZXJMaW5lcyA9IHRleHRMaW5lQ291bnQoYWZ0ZXIpXG4gICAgY2h1bmtzLnB1c2goYEBAIC0xLCR7YmVmb3JlTGluZXN9ICsxLCR7YWZ0ZXJMaW5lc30gQEBgKVxuICAgIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMoYmVmb3JlLCBhZnRlcikpIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IHBhcnQuYWRkZWQgPyAnKycgOiBwYXJ0LnJlbW92ZWQgPyAnLScgOiAnICdcbiAgICAgIGNvbnN0IGNvdW50ID0gdGV4dExpbmVDb3VudChwYXJ0LnZhbHVlKVxuICAgICAgaWYgKHBhcnQuYWRkZWQpIGFkZGVkICs9IGNvdW50XG4gICAgICBlbHNlIGlmIChwYXJ0LnJlbW92ZWQpIGRlbGV0ZWQgKz0gY291bnRcbiAgICAgIGZvciAoY29uc3QgbGluZSBvZiBwYXJ0LnZhbHVlLnNwbGl0KCdcXG4nKS5zbGljZSgwLCBwYXJ0LnZhbHVlLmVuZHNXaXRoKCdcXG4nKSA/IC0xIDogdW5kZWZpbmVkKSkgY2h1bmtzLnB1c2goYCR7cHJlZml4fSR7bGluZX1gKVxuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIHBhdGg6IGNoYW5nZS5wYXRoLFxuICAgIHh5OiAnTScsXG4gICAgc3RhdHVzOiAnTScsXG4gICAgdW50cmFja2VkOiBjaGFuZ2UuaHVua3Muc29tZSgoaHVuaykgPT4gaHVuay5vbGRUZXh0ID09PSBudWxsKSxcbiAgICBzdGFnZWQ6IGZhbHNlLFxuICAgIHVuc3RhZ2VkOiB0cnVlLFxuICAgIGFkZGVkLFxuICAgIGRlbGV0ZWQsXG4gICAgZGlmZjogY2h1bmtzLmpvaW4oJ1xcbicpLFxuICAgIGJpbmFyeTogZmFsc2UsXG4gICAgbXRpbWU6IDAsXG4gICAgaHVua3M6IFtdLFxuICB9XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gRGlmZiByZW5kZXJpbmcuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqIFNwbGl0IG9uZSBgZ2l0IHNob3cgLS1mb3JtYXQ9YCBkaWZmIGludG8gcGVyLWZpbGUgc2VnbWVudHMuICovXG5mdW5jdGlvbiBzcGxpdENvbW1pdERpZmYoZGlmZjogc3RyaW5nKTogeyBwYXRoOiBzdHJpbmc7IHRleHQ6IHN0cmluZyB9W10ge1xuICBjb25zdCBzZWdtZW50czogeyBwYXRoOiBzdHJpbmc7IHRleHQ6IHN0cmluZ1tdIH1bXSA9IFtdXG4gIGxldCBjdXJyZW50OiB7IHBhdGg6IHN0cmluZzsgdGV4dDogc3RyaW5nW10gfSB8IG51bGwgPSBudWxsXG4gIGZvciAoY29uc3QgbGluZSBvZiBkaWZmLnNwbGl0KCdcXG4nKSkge1xuICAgIGNvbnN0IG1hdGNoID0gL15kaWZmIC0tZ2l0IGFcXC8oLio/KSBiXFwvLy5leGVjKGxpbmUpXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICBpZiAoY3VycmVudCkgc2VnbWVudHMucHVzaChjdXJyZW50KVxuICAgICAgY3VycmVudCA9IHsgcGF0aDogbWF0Y2hbMV0sIHRleHQ6IFtsaW5lXSB9XG4gICAgfSBlbHNlIGlmIChjdXJyZW50KSB7XG4gICAgICBjdXJyZW50LnRleHQucHVzaChsaW5lKVxuICAgIH1cbiAgfVxuICBpZiAoY3VycmVudCkgc2VnbWVudHMucHVzaChjdXJyZW50KVxuICByZXR1cm4gc2VnbWVudHMubWFwKChzKSA9PiAoeyBwYXRoOiBzLnBhdGgsIHRleHQ6IHMudGV4dC5qb2luKCdcXG4nKSB9KSlcbn1cblxuLyoqIFN0YXR1cyBsZXR0ZXIgZm9yIGEgY29tbWl0J3MgZmlsZSwgZGVyaXZlZCBmcm9tIGl0cyBkaWZmIHNlZ21lbnQgdGV4dC4gKi9cbmZ1bmN0aW9uIGNvbW1pdEZpbGVTdGF0dXMoc2VnbWVudFRleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmICgvXm5ldyBmaWxlIG1vZGUvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ0EnXG4gIGlmICgvXmRlbGV0ZWQgZmlsZSBtb2RlLy50ZXN0KHNlZ21lbnRUZXh0KSkgcmV0dXJuICdEJ1xuICBpZiAoL15yZW5hbWUgZnJvbSAvLnRlc3Qoc2VnbWVudFRleHQpKSByZXR1cm4gJ1InXG4gIHJldHVybiAnTSdcbn1cblxudHlwZSBEaWZmUm93ID0geyBraW5kOiAnYWRkJyB8ICdkZWwnIHwgJ2N0eCcgfCAnaHVuaycgfCAnZmlsZScgfCAnbm90ZSc7IHRleHQ6IHN0cmluZyB9XG5cbi8qKiBDbGFzc2lmeSByYXcgdW5pZmllZC1kaWZmIHRleHQgKGdpdCBvdXRwdXQpIGludG8gcm93cy4gKi9cbmZ1bmN0aW9uIGdpdERpZmZSb3dzKGRpZmY6IHN0cmluZyk6IERpZmZSb3dbXSB7XG4gIHJldHVybiBkaWZmLnNwbGl0KCdcXG4nKS5tYXAoKGxpbmUpID0+IHtcbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCcrKysnKSB8fCBsaW5lLnN0YXJ0c1dpdGgoJy0tLScpKSByZXR1cm4geyBraW5kOiAnZmlsZScgYXMgY29uc3QsIHRleHQ6IGxpbmUgfVxuICAgIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ0BAJykpIHJldHVybiB7IGtpbmQ6ICdodW5rJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKycpKSByZXR1cm4geyBraW5kOiAnYWRkJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnLScpKSByZXR1cm4geyBraW5kOiAnZGVsJyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnXFxcXCAnKSkgcmV0dXJuIHsga2luZDogJ25vdGUnIGFzIGNvbnN0LCB0ZXh0OiBsaW5lIH1cbiAgICByZXR1cm4geyBraW5kOiAnY3R4JyBhcyBjb25zdCwgdGV4dDogbGluZSB9XG4gIH0pXG59XG5cbi8qKiBDb21wdXRlIGFkZC9kZWwvY3R4IHJvd3MgYmV0d2VlbiB0d28gdGV4dHMgKHRoZSB0b29scycgRmlsZURpZmYgc2hhcGUpLiAqL1xuZnVuY3Rpb24gdGV4dERpZmZSb3dzKG9sZFRleHQ6IHN0cmluZyB8IG51bGwsIG5ld1RleHQ6IHN0cmluZyk6IERpZmZSb3dbXSB7XG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMob2xkVGV4dCA/PyAnJywgbmV3VGV4dCkpIHtcbiAgICBjb25zdCBsaW5lcyA9IHBhcnQudmFsdWUuc3BsaXQoJ1xcbicpXG4gICAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgaWYgKHBhcnQuYWRkZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdhZGQnLCB0ZXh0OiBgKyR7bGluZX1gIH0pXG4gICAgICBlbHNlIGlmIChwYXJ0LnJlbW92ZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdkZWwnLCB0ZXh0OiBgLSR7bGluZX1gIH0pXG4gICAgICBlbHNlIHJvd3MucHVzaCh7IGtpbmQ6ICdjdHgnLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiByb3dzXG59XG5cbi8qKiBTZXNzaW9uIGNoYW5nZSByb3dzIHdpdGggcmVsYXRpdmUgb2xkL25ldyBsaW5lIG51bWJlcnMgKGh1bmsgcm93cyByZXNldCkuICovXG5mdW5jdGlvbiBzZXNzaW9uUm93c1dpdGhMaW5lcyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogeyByb3c6IERpZmZSb3c7IG9sZExpbmU6IG51bWJlciB8IG51bGw7IG5ld0xpbmU6IG51bWJlciB8IG51bGwgfVtdIHtcbiAgY29uc3Qgb3V0OiB7IHJvdzogRGlmZlJvdzsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9W10gPSBbXVxuICBsZXQgb2xkTGluZSA9IDFcbiAgbGV0IG5ld0xpbmUgPSAxXG4gIGZvciAoY29uc3Qgcm93IG9mIGNoYW5nZVJvd3MoY2hhbmdlKSkge1xuICAgIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHtcbiAgICAgIG91dC5wdXNoKHsgcm93LCBvbGRMaW5lOiBvbGRMaW5lKyssIG5ld0xpbmU6IG5ld0xpbmUrKyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdhZGQnKSB7XG4gICAgICBvdXQucHVzaCh7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbmV3TGluZSsrIH0pXG4gICAgfSBlbHNlIGlmIChyb3cua2luZCA9PT0gJ2RlbCcpIHtcbiAgICAgIG91dC5wdXNoKHsgcm93LCBvbGRMaW5lOiBvbGRMaW5lKyssIG5ld0xpbmU6IG51bGwgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0LnB1c2goeyByb3csIG9sZExpbmU6IG51bGwsIG5ld0xpbmU6IG51bGwgfSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG4vKiogQWxsIHJvd3MgZm9yIG9uZSByb3VuZCBjaGFuZ2UgKG11bHRpcGxlIGh1bmtzIGdldCBgQEBgIHNlcGFyYXRvcnMpLiAqL1xuZnVuY3Rpb24gY2hhbmdlUm93cyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogRGlmZlJvd1tdIHtcbiAgaWYgKCFjaGFuZ2UuaGFzRGlmZiB8fCBjaGFuZ2UuaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgY29uc3Qgcm93czogRGlmZlJvd1tdID0gW11cbiAgY2hhbmdlLmh1bmtzLmZvckVhY2goKGh1bmssIGkpID0+IHtcbiAgICBpZiAoY2hhbmdlLmh1bmtzLmxlbmd0aCA+IDEpIHJvd3MucHVzaCh7IGtpbmQ6ICdodW5rJywgdGV4dDogYEBAIGh1bmsgJHtpICsgMX0vJHtjaGFuZ2UuaHVua3MubGVuZ3RofSBAQGAgfSlcbiAgICByb3dzLnB1c2goLi4udGV4dERpZmZSb3dzKGh1bmsub2xkVGV4dCwgaHVuay5uZXdUZXh0KSlcbiAgfSlcbiAgcmV0dXJuIHJvd3Ncbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTcGxpdCAodHdvLWNvbHVtbikgZGlmZiB2aWV3LlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBPbmUgYWxpZ25lZCByb3cgb2YgdGhlIHNpZGUtYnktc2lkZSB2aWV3LiAqL1xuaW50ZXJmYWNlIFNwbGl0Um93IHtcbiAgbGVmdDogc3RyaW5nXG4gIHJpZ2h0OiBzdHJpbmdcbiAgLyoqIDEtYmFzZWQgbGluZSBudW1iZXIgaW4gdGhlIG9sZCBmaWxlLCBvciBudWxsIChwdXJlIGFkZGl0aW9uKS4gKi9cbiAgbGVmdE51bTogbnVtYmVyIHwgbnVsbFxuICAvKiogMS1iYXNlZCBsaW5lIG51bWJlciBpbiB0aGUgbmV3IGZpbGUsIG9yIG51bGwgKHB1cmUgZGVsZXRpb24pLiAqL1xuICByaWdodE51bTogbnVtYmVyIHwgbnVsbFxuICBraW5kOiAnY3R4JyB8ICdjaGFuZ2UnXG59XG5cbi8qKiBPbmUgc2lkZS1ieS1zaWRlIGJsb2NrIChhIGh1bmsgd2l0aCBpdHMgYEBAYCBoZWFkZXIpLiAqL1xuaW50ZXJmYWNlIFNwbGl0QmxvY2sge1xuICBoZWFkOiBzdHJpbmcgfCBudWxsXG4gIHJvd3M6IFNwbGl0Um93W11cbn1cblxuLyoqXG4gKiBQYWlyIGFkZC9kZWwgcm93cyBpbnRvIGFsaWduZWQgbGVmdC9yaWdodCBjb2x1bW5zLiBSZW1vdmVkIGxpbmVzIGJ1ZmZlclxuICogdW50aWwgdGhlIG1hdGNoaW5nIGFkZGl0aW9ucyBhcnJpdmUgKHVuaWZpZWQgZGlmZiBvcmRlcnMgZGVsZXRpb25zIGJlZm9yZVxuICogYWRkaXRpb25zKSwgc28gcHVyZSBkZWxldGlvbnMgYW5kIHB1cmUgYWRkaXRpb25zIHN0aWxsIGdldCB0aGVpciBvd24gcm93XG4gKiB3aXRoIGFuIGVtcHR5IGNlbGwgb24gdGhlIG9wcG9zaXRlIHNpZGUuIExpbmUgbnVtYmVycyB0cmFjayBmcm9tIHRoZSBodW5rXG4gKiBoZWFkZXIncyBgLWEsYiArYyxkYCBwb3NpdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIHBhaXJSb3dzKHJvd3M6IERpZmZSb3dbXSwgb2xkU3RhcnQ6IG51bWJlciwgbmV3U3RhcnQ6IG51bWJlcik6IFNwbGl0Um93W10ge1xuICBjb25zdCBvdXQ6IFNwbGl0Um93W10gPSBbXVxuICBsZXQgb2xkTGluZSA9IG9sZFN0YXJ0XG4gIGxldCBuZXdMaW5lID0gbmV3U3RhcnRcbiAgbGV0IHBlbmRpbmc6IHsgdGV4dDogc3RyaW5nOyBudW06IG51bWJlciB9W10gPSBbXVxuICBjb25zdCBmbHVzaCA9ICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IHAgb2YgcGVuZGluZykgb3V0LnB1c2goeyBsZWZ0OiBwLnRleHQsIHJpZ2h0OiAnJywgbGVmdE51bTogcC5udW0sIHJpZ2h0TnVtOiBudWxsLCBraW5kOiAnY2hhbmdlJyB9KVxuICAgIHBlbmRpbmcgPSBbXVxuICB9XG4gIGZvciAoY29uc3Qgcm93IG9mIHJvd3MpIHtcbiAgICBpZiAocm93LmtpbmQgPT09ICdkZWwnKSB7XG4gICAgICBwZW5kaW5nLnB1c2goeyB0ZXh0OiByb3cudGV4dC5zbGljZSgxKSwgbnVtOiBvbGRMaW5lKysgfSlcbiAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnYWRkJykge1xuICAgICAgY29uc3QgcCA9IHBlbmRpbmcuc2hpZnQoKVxuICAgICAgb3V0LnB1c2goeyBsZWZ0OiBwPy50ZXh0ID8/ICcnLCByaWdodDogcm93LnRleHQuc2xpY2UoMSksIGxlZnROdW06IHA/Lm51bSA/PyBudWxsLCByaWdodE51bTogbmV3TGluZSsrLCBraW5kOiAnY2hhbmdlJyB9KVxuICAgIH0gZWxzZSBpZiAocm93LmtpbmQgPT09ICdjdHgnKSB7XG4gICAgICBmbHVzaCgpXG4gICAgICAvLyBVbmlmaWVkLWRpZmYgY29udGV4dCBsaW5lcyBjYXJyeSBhIGxlYWRpbmcgc3BhY2UgXHUyMDE0IHN0cmlwIGl0IGZvciB0aGVcbiAgICAgIC8vIHNwbGl0IGNlbGxzIHNvIGJvdGggY29sdW1ucyByZW5kZXIgYmFyZSB0ZXh0LlxuICAgICAgY29uc3QgdGV4dCA9IHJvdy50ZXh0LnN0YXJ0c1dpdGgoJyAnKSA/IHJvdy50ZXh0LnNsaWNlKDEpIDogcm93LnRleHRcbiAgICAgIG91dC5wdXNoKHsgbGVmdDogdGV4dCwgcmlnaHQ6IHRleHQsIGxlZnROdW06IG9sZExpbmUrKywgcmlnaHROdW06IG5ld0xpbmUrKywga2luZDogJ2N0eCcgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZmx1c2goKSAvLyBub3RlcyAoXFwgTm8gbmV3bGluZVx1MjAyNikgYW5kIHN0cmF5IHJvd3M6IGp1c3QgYnJlYWsgdGhlIHBhaXJpbmdcbiAgICB9XG4gIH1cbiAgZmx1c2goKVxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBQYXJzZSBnaXQgdW5pZmllZCBkaWZmIHRleHQgaW50byBibG9ja3MgKGAtLS0vKysrYCBmaWxlIHJvd3MgYW5kIGBAQGAgaHVua3MpLiAqL1xuY29uc3QgR0lUX01FVEEgPSAvXihkaWZmIC0tZ2l0IHxpbmRleCB8bmV3IGZpbGUgfGRlbGV0ZWQgZmlsZSB8b2xkIG1vZGUgfG5ldyBtb2RlIHxzaW1pbGFyaXR5IGluZGV4IHxyZW5hbWUgKGZyb218dG8pIHxCaW5hcnkgZmlsZXMgKS9cblxuZnVuY3Rpb24gcGFyc2VHaXRCbG9ja3MoZGlmZjogc3RyaW5nKTogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH1bXSB7XG4gIGNvbnN0IGJsb2NrczogeyBoZWFkOiBEaWZmUm93IHwgbnVsbDsgcm93czogRGlmZlJvd1tdIH1bXSA9IFtdXG4gIGxldCBjdXJyZW50OiB7IGhlYWQ6IERpZmZSb3cgfCBudWxsOyByb3dzOiBEaWZmUm93W10gfSB8IG51bGwgPSBudWxsXG4gIGNvbnN0IGxpbmVzID0gZGlmZi5zcGxpdCgnXFxuJylcbiAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICBsZXQga2luZDogRGlmZlJvd1sna2luZCddXG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aCgnKysrJykgfHwgbGluZS5zdGFydHNXaXRoKCctLS0nKSB8fCBHSVRfTUVUQS50ZXN0KGxpbmUpKSBraW5kID0gJ2ZpbGUnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCdAQCcpKSBraW5kID0gJ2h1bmsnXG4gICAgZWxzZSBpZiAobGluZS5zdGFydHNXaXRoKCcrJykpIGtpbmQgPSAnYWRkJ1xuICAgIGVsc2UgaWYgKGxpbmUuc3RhcnRzV2l0aCgnLScpKSBraW5kID0gJ2RlbCdcbiAgICBlbHNlIGlmIChsaW5lLnN0YXJ0c1dpdGgoJ1xcXFwgJykpIGtpbmQgPSAnbm90ZSdcbiAgICBlbHNlIGtpbmQgPSAnY3R4J1xuICAgIGlmIChraW5kID09PSAnZmlsZScgfHwga2luZCA9PT0gJ2h1bmsnKSB7XG4gICAgICBjdXJyZW50ID0geyBoZWFkOiB7IGtpbmQsIHRleHQ6IGxpbmUgfSwgcm93czogW10gfVxuICAgICAgYmxvY2tzLnB1c2goY3VycmVudClcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnQgPSB7IGhlYWQ6IG51bGwsIHJvd3M6IFtdIH1cbiAgICAgICAgYmxvY2tzLnB1c2goY3VycmVudClcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQucm93cy5wdXNoKHsga2luZCwgdGV4dDogbGluZSB9KVxuICAgIH1cbiAgfVxuICByZXR1cm4gYmxvY2tzXG59XG5cbi8qKiBIdW5rIHN0YXJ0IHBvc2l0aW9ucyBmcm9tIGEgYEBAIC1hLGIgK2MsZCBAQGAgaGVhZGVyLiAqL1xuZnVuY3Rpb24gaHVua1N0YXJ0cyhoZWFkOiBzdHJpbmcpOiB7IG9sZFN0YXJ0OiBudW1iZXI7IG5ld1N0YXJ0OiBudW1iZXIgfSB7XG4gIGNvbnN0IG0gPSAvXkBAIC0oXFxkKykoPzosXFxkKyk/IFxcKyhcXGQrKS8uZXhlYyhoZWFkKVxuICByZXR1cm4geyBvbGRTdGFydDogbSA/IE51bWJlcihtWzFdKSA6IDEsIG5ld1N0YXJ0OiBtID8gTnVtYmVyKG1bMl0pIDogMSB9XG59XG5cbi8qKiBTaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciBhIGdpdCB1bmlmaWVkIGRpZmYgKHNraXBzIHB1cmUgZmlsZS1oZWFkZXIgYmxvY2tzKS4gKi9cbmZ1bmN0aW9uIGdpdFNwbGl0QmxvY2tzKGRpZmY6IHN0cmluZyk6IFNwbGl0QmxvY2tbXSB7XG4gIHJldHVybiBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICAgIC5maWx0ZXIoKGIpID0+IGIuaGVhZD8ua2luZCAhPT0gJ2ZpbGUnICYmIChiLnJvd3MubGVuZ3RoID4gMCB8fCBiLmhlYWQ/LmtpbmQgPT09ICdodW5rJykpXG4gICAgLm1hcCgoYikgPT4ge1xuICAgICAgY29uc3Qgc3RhcnRzID0gYi5oZWFkID8gaHVua1N0YXJ0cyhiLmhlYWQudGV4dCkgOiB7IG9sZFN0YXJ0OiAxLCBuZXdTdGFydDogMSB9XG4gICAgICByZXR1cm4geyBoZWFkOiBiLmhlYWQ/LmtpbmQgPT09ICdodW5rJyA/IGIuaGVhZC50ZXh0IDogbnVsbCwgcm93czogcGFpclJvd3MoYi5yb3dzLCBzdGFydHMub2xkU3RhcnQsIHN0YXJ0cy5uZXdTdGFydCkgfVxuICAgIH0pXG59XG5cbi8qKiBTaWRlLWJ5LXNpZGUgYmxvY2tzIGZvciB0aGUgdG9vbHMnIEZpbGVEaWZmIHNoYXBlIChvbGRUZXh0L25ld1RleHQpLiAqL1xuZnVuY3Rpb24gdGV4dFNwbGl0QmxvY2tzKG9sZFRleHQ6IHN0cmluZyB8IG51bGwsIG5ld1RleHQ6IHN0cmluZyk6IFNwbGl0QmxvY2tbXSB7XG4gIGNvbnN0IHJvd3M6IERpZmZSb3dbXSA9IFtdXG4gIGZvciAoY29uc3QgcGFydCBvZiBkaWZmTGluZXMob2xkVGV4dCA/PyAnJywgbmV3VGV4dCkpIHtcbiAgICBjb25zdCBsaW5lcyA9IHBhcnQudmFsdWUuc3BsaXQoJ1xcbicpXG4gICAgaWYgKGxpbmVzLmxlbmd0aCA+IDAgJiYgbGluZXNbbGluZXMubGVuZ3RoIC0gMV0gPT09ICcnKSBsaW5lcy5wb3AoKVxuICAgIGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgICAgaWYgKHBhcnQuYWRkZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdhZGQnLCB0ZXh0OiBgKyR7bGluZX1gIH0pXG4gICAgICBlbHNlIGlmIChwYXJ0LnJlbW92ZWQpIHJvd3MucHVzaCh7IGtpbmQ6ICdkZWwnLCB0ZXh0OiBgLSR7bGluZX1gIH0pXG4gICAgICBlbHNlIHJvd3MucHVzaCh7IGtpbmQ6ICdjdHgnLCB0ZXh0OiBsaW5lIH0pXG4gICAgfVxuICB9XG4gIHJldHVybiBbeyBoZWFkOiBudWxsLCByb3dzOiBwYWlyUm93cyhyb3dzLCAxLCAxKSB9XVxufVxuXG4vKiogQWxsIHNpZGUtYnktc2lkZSBibG9ja3MgZm9yIG9uZSByb3VuZCBjaGFuZ2UuICovXG5mdW5jdGlvbiBjaGFuZ2VTcGxpdEJsb2NrcyhjaGFuZ2U6IFJvdW5kQ2hhbmdlKTogU3BsaXRCbG9ja1tdIHtcbiAgaWYgKCFjaGFuZ2UuaGFzRGlmZiB8fCBjaGFuZ2UuaHVua3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgcmV0dXJuIGNoYW5nZS5odW5rcy5tYXAoKGh1bmssIGkpID0+ICh7XG4gICAgaGVhZDogY2hhbmdlLmh1bmtzLmxlbmd0aCA+IDEgPyBgQEAgaHVuayAke2kgKyAxfS8ke2NoYW5nZS5odW5rcy5sZW5ndGh9IEBAYCA6IG51bGwsXG4gICAgcm93czogdGV4dFNwbGl0QmxvY2tzKGh1bmsub2xkVGV4dCwgaHVuay5uZXdUZXh0KVswXS5yb3dzLFxuICB9KSlcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBTdHlsZXMgKGRzZHItKjsgdGhlIGhlYWRlciB0cmlnZ2VyIG1pcnJvcnMgdGhlIGluLXRyZWUgYWN0aW9uIHJvd3MpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IFJFVklFV19DU1MgPSBgXG4uZHNkci10cmlnZ2Vye21pbi1oZWlnaHQ6MjhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NHB4O3BhZGRpbmc6M3B4IDZweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4fVxuLmRzZHItdHJpZ2dlcjpob3ZlciwuZHNkci10cmlnZ2VyOmZvY3VzLXZpc2libGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci1sYWJlbHttYXJnaW4tbGVmdDoycHh9XG4uZHNkci1jb3VudHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtib3JkZXItcmFkaXVzOjk5OXB4O21pbi13aWR0aDoxNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7cGFkZGluZzowIDVweDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1vdmVybGF5e3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7ei1pbmRleDoyMDA7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLC40NSk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MzJweH1cbi5kc2RyLXBhbmVse2JveC1zaXppbmc6Ym9yZGVyLWJveDtwb3NpdGlvbjpyZWxhdGl2ZTt3aWR0aDptaW4oMTEyMHB4LDEwMCUpO2hlaWdodDptaW4oNzIwcHgsY2FsYygxMDB2aCAtIDY0cHgpKTttYXgtd2lkdGg6Y2FsYygxMDB2dyAtIDY0cHgpO21heC1oZWlnaHQ6Y2FsYygxMDB2aCAtIDY0cHgpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjE0cHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1yZXNpemV7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDo1fVxuLmRzZHItcmVzaXplLWV7dG9wOjA7cmlnaHQ6LTNweDt3aWR0aDo3cHg7aGVpZ2h0OjEwMCU7Y3Vyc29yOmV3LXJlc2l6ZX1cbi5kc2RyLXJlc2l6ZS1ze2JvdHRvbTotM3B4O2xlZnQ6MDt3aWR0aDoxMDAlO2hlaWdodDo3cHg7Y3Vyc29yOm5zLXJlc2l6ZX1cbi5kc2RyLXJlc2l6ZS1zZXtyaWdodDotNHB4O2JvdHRvbTotNHB4O3dpZHRoOjE1cHg7aGVpZ2h0OjE1cHg7Y3Vyc29yOm53c2UtcmVzaXplfVxuLmRzZHItaGVhZGVye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7cGFkZGluZzoxMnB4IDE2cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lfVxuLmRzZHItdGl0bGV7Zm9udC1zaXplOjE0cHg7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXN1YnRpdGxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEycHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci10YWJze2Rpc3BsYXk6ZmxleDtnYXA6NHB4O21hcmdpbi1sZWZ0OjE0cHh9XG4uZHNkci10YWJ7Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjZweDtib3JkZXI6MXB4IHNvbGlkIHRyYW5zcGFyZW50O2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjJweCAxMHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4fVxuLmRzZHItdGFiOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdGFiLWFjdGl2ZXtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNjb3Ble2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWFyZ2luLWxlZnQ6OHB4fVxuLmRzZHItc2NvcGUgLmRzZHItc2VsLXRyaWdnZXJ7bWluLXdpZHRoOjExMHB4O2hlaWdodDoyNnB4O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cGFkZGluZzowIDhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKX1cbi5kc2RyLXNwYWNlcntmbGV4OjF9XG4uZHNkci1idG57Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JvcmRlci1yYWRpdXM6N3B4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzozcHggMTBweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4fVxuLmRzZHItYnRuOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1idG46ZGlzYWJsZWR7b3BhY2l0eTouNTtjdXJzb3I6ZGVmYXVsdH1cbi5kc2RyLWJ0bi1wcmltYXJ5e2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTQwMCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItYnRuLWRhbmdlcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1idG4tZGFuZ2VyOmhvdmVyOm5vdCg6ZGlzYWJsZWQpe2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KX1cbi5kc2RyLWJ0bi1jb25maXJte2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7Y29sb3I6dmFyKC0tZHN3LXN0YXRpYy1uZXV0cmFsLWJsdWlzaC01MCl9XG4uZHNkci1idG4tY29uZmlybTpob3Zlcjpub3QoOmRpc2FibGVkKXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1lcnJvci1wcmltYXJ5KTtjb2xvcjp2YXIoLS1kc3ctc3RhdGljLW5ldXRyYWwtYmx1aXNoLTUwKX1cbi5kc2RyLWNvbW1pdC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MjAwcHg7bWluLWhlaWdodDoyOHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6M3B4IDEwcHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHh9XG4uZHNkci1jb21taXQtbW9kYWx7cG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoxMDtpbnNldDowO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjQyKX0uZHNkci1jb21taXQtY2FyZHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoxNnB4O3dpZHRoOm1pbig1MjBweCxjYWxjKDEwMCUgLSA0OHB4KSk7cGFkZGluZzoyNHB4O2JvcmRlci1yYWRpdXM6MTZweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjMpfS5kc2RyLWNvbW1pdC10aXRsZXtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfS5kc2RyLWNvbW1pdC1jYXJkIC5kc2RyLWNvbW1pdC1pbnB1dHt3aWR0aDoxMDAlO21pbi1oZWlnaHQ6MzhweH0uZHNkci1jb21taXQtaW5jbHVkZXtkaXNwbGF5OmZsZXg7Z2FwOjlweDthbGlnbi1pdGVtczpjZW50ZXI7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udC1zaXplOjEzcHh9LmRzZHItY29tbWl0LWFjdGlvbnN7ZGlzcGxheTpmbGV4O2ZsZXgtd3JhcDp3cmFwO2dhcDo4cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7cGFkZGluZy10b3A6MTRweH1cbi5kc2RyLWZpbGUtYWN0aW9uc3tkaXNwbGF5OmZsZXg7Z2FwOjNweDttYXJnaW4tbGVmdDo2cHh9LmRzZHItZmlsZS1pY29ue3dpZHRoOjIycHg7aGVpZ2h0OjIycHg7cGFkZGluZzowO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NnB4O2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250OjE2cHgvMjBweCB2YXIoLS1kc3ctZm9udC1zYW5zKTtjdXJzb3I6cG9pbnRlcn0uZHNkci1maWxlLWljb246aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX0uZHNkci1maWxlLWljb24tZGFuZ2VyOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0dXMtZGFuZ2VyKX1cbi5kc2RyLWNvbW1pdC1pbnB1dDo6cGxhY2Vob2xkZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWNhcHRpb24pfVxuLmRzZHItY29tbWl0LWlucHV0OmZvY3Vze291dGxpbmU6bm9uZTtib3JkZXItY29sb3I6dmFyKC0tZHN3LWFsaWFzLWJyYW5kLXByaW1hcnkpfVxuLmRzZHItc2VjdGlvbntmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7cGFkZGluZzoxMHB4IDhweCAzcHg7Zm9udC13ZWlnaHQ6NjAwO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweH1cbi5kc2RyLXNlY3Rpb246Zmlyc3QtY2hpbGR7cGFkZGluZy10b3A6NHB4fVxuLmRzZHItYnJhbmNoe2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjRweCA4cHggOHB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItYnJhbmNoLXJlZntmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7bWluLXdpZHRoOjA7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweH1cbi5kc2RyLWJyYW5jaC1hcnJvd3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItYnJhbmNoLXN0YXR7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtmb250LXNpemU6MTFweDtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1icmFuY2gtYWhlYWR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1icmFuY2gtYmVoaW5ke2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS13YXJuLXByaW1hcnkpfVxuLmRzZHItYnJhbmNoLXN5bmN7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci1jb21taXR7ZmxleDoxO21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjJweDtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjVweCA4cHg7Y3Vyc29yOnBvaW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1pdDpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci10bC1zZWxlY3RlZCAuZHNkci1jb21taXR7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItdGltZWxpbmV7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbn1cbi5kc2RyLXRsLWl0ZW17ZGlzcGxheTpmbGV4O2dhcDo2cHg7YWxpZ24taXRlbXM6c3RyZXRjaDtib3JkZXItcmFkaXVzOjhweH1cbi5kc2RyLXRsLXJhaWx7cG9zaXRpb246cmVsYXRpdmU7ZmxleDpub25lO3dpZHRoOjE0cHg7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpjZW50ZXJ9XG4uZHNkci10bC1yYWlsOjpiZWZvcmV7Y29udGVudDpcIlwiO3Bvc2l0aW9uOmFic29sdXRlO3RvcDowO2JvdHRvbTowO2xlZnQ6NTAlO3dpZHRoOjFweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpfVxuLmRzZHItdGwtaXRlbTpmaXJzdC1jaGlsZCAuZHNkci10bC1yYWlsOjpiZWZvcmV7dG9wOjlweH1cbi5kc2RyLXRsLWl0ZW06bGFzdC1jaGlsZCAuZHNkci10bC1yYWlsOjpiZWZvcmV7Ym90dG9tOmF1dG87aGVpZ2h0OjlweH1cbi5kc2RyLXRsLWRvdHtwb3NpdGlvbjpyZWxhdGl2ZTt6LWluZGV4OjE7dG9wOjlweDtmbGV4Om5vbmU7d2lkdGg6N3B4O2hlaWdodDo3cHg7Ym9yZGVyLXJhZGl1czo1MCU7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKX1cbi5kc2RyLXRsLWRvdC1sb2NhbHtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdGwtZG90LXJlbW90ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1jb21taXQtaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWluLXdpZHRoOjB9XG4uZHNkci1jb21taXQtc2hvcnR7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jb21taXQtc3ViamVjdHtmbGV4OjE7bWluLXdpZHRoOjA7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItY29tbWl0LW1ldGF7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtwYWRkaW5nLWxlZnQ6MH1cbi5kc2RyLXRsLWJhZGdle2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA1cHh9XG4uZHNkci10bC1iYWRnZS1sb2NhbHtiYWNrZ3JvdW5kOnJnYmEoNDYsMTYwLDY3LC4xNik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9XG4uZHNkci10bC1iYWRnZS1yZW1vdGV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLWRpZmYtaGFzaHttYXJnaW4tbGVmdDo4cHg7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWNvbW1pdC1maWxlLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLWNvbW1pdC1maWxlLXBhdGh7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO21hcmdpbi1sZWZ0OjRweH1cbi5kc2RyLWNmZy1jYXJke2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMyk7Ym9yZGVyLXJhZGl1czoxMnB4O2xpc3Qtc3R5bGU6bm9uZTt0cmFuc2l0aW9uOmJvcmRlci1jb2xvciAuMTZzLGJhY2tncm91bmQgLjE2c31cbi5kc2RyLWNmZy1jYXJkOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLWNmZy1jYXJkLW9wZW57YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1kaW1tZWQpfVxuLmRzZHItY2ZnLWhlYWR7YXBwZWFyYW5jZTpub25lO3dpZHRoOjEwMCU7Zm9udDppbmhlcml0O2NvbG9yOmluaGVyaXQ7dGV4dC1hbGlnbjpsZWZ0O2N1cnNvcjpwb2ludGVyO2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2JvcmRlci1yYWRpdXM6MTJweDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEycHg7cGFkZGluZzoxNHB4IDE2cHg7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLWhlYWQ6Zm9jdXMtdmlzaWJsZXtvdXRsaW5lOjJweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYnJhbmQtcHJpbWFyeSk7b3V0bGluZS1vZmZzZXQ6LTJweH1cbi5kc2RyLWNmZy1oZWFkLXRleHR7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2ZsZXg6MTtnYXA6NHB4O21pbi13aWR0aDowO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWNmZy1uYW1le2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtmb250LXNpemU6MTVweDtmb250LXdlaWdodDo2MDA7bGluZS1oZWlnaHQ6MS40fVxuLmRzZHItY2ZnLWRlc2N7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctY2FyZXR7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmbGV4Om5vbmU7dHJhbnNpdGlvbjp0cmFuc2Zvcm0gLjE2c31cbi5kc2RyLWNmZy1jYXJldC1vcGVue3RyYW5zZm9ybTpyb3RhdGUoMTgwZGVnKX1cbi5kc2RyLWNmZy1ib2R5e2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO21hcmdpbjowIDE2cHg7cGFkZGluZy1ib3R0b206OHB4O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW59XG4uZHNkci1jZmctZmllbGR7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo2cHg7cGFkZGluZzoxMnB4IDA7ZGlzcGxheTpmbGV4fVxuLmRzZHItY2ZnLWZpZWxkKy5kc2RyLWNmZy1maWVsZHtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKX1cbi5kc2RyLWNmZy1sYWJlbHttaW4td2lkdGg6MDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7ZmxleDoxO2ZvbnQtc2l6ZToxM3B4O2ZvbnQtd2VpZ2h0OjUwMDtsaW5lLWhlaWdodDoxLjV9XG4uZHNkci1jZmctaGludHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO21hcmdpbjowO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjEuNX1cbi5kc2RyLWNmZy1wZW5kaW5ne3doaXRlLXNwYWNlOm5vd3JhcDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2JvcmRlci1yYWRpdXM6OTk5cHg7ZmxleDpub25lO3BhZGRpbmc6MXB4IDhweDtmb250LXNpemU6MTFweDtmb250LXdlaWdodDo1MDA7bGluZS1oZWlnaHQ6MTdweH1cbi5kc2RyLWNmZy1mYWlsZWR7bWluLXdpZHRoOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLWVycm9yKTtmbGV4OjE7bWFyZ2luOjA7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MS41fVxuLmRzZHItY2ZnLWFjdGlvbnN7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7anVzdGlmeS1jb250ZW50OmZsZXgtZW5kO2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6MTJweCAwIDRweDtkaXNwbGF5OmZsZXh9XG4uZHNkci1ib2R5e2Rpc3BsYXk6ZmxleDtmbGV4OjE7bWluLWhlaWdodDowfVxuLmRzZHItZmlsZXN7d2lkdGg6MzAwcHg7ZmxleDpub25lO2JvcmRlci1yaWdodDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7b3ZlcmZsb3cteTphdXRvO3BhZGRpbmc6OHB4fVxuLmRzZHItcm91bmR7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6OHB4IDhweCAzcHg7Zm9udC13ZWlnaHQ6NjAwfVxuLmRzZHItcm91bmQtbGFiZWx7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjQwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLWZpbGV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXQ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmlsZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1maWxlLXNlbGVjdGVke2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWRpcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo1cHg7d2lkdGg6MTAwJTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzo1cHggOHB4O2N1cnNvcjpwb2ludGVyO2JvcmRlcjowO2JhY2tncm91bmQ6dHJhbnNwYXJlbnQ7dGV4dC1hbGlnbjpsZWZ0O2ZvbnQ6aW5oZXJpdDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250LXNpemU6MTJweH1cbi5kc2RyLWRpcjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZGlyLWNhcmV0e2ZsZXg6bm9uZTt3aWR0aDoxMnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1kaXItbmFtZXtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtd2VpZ2h0OjYwMH1cbi5kc2RyLWRpci1jb3VudHtmbGV4Om5vbmU7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1maWxlLW5hbWV7ZmxleDoxO21pbi13aWR0aDowO2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbjtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbGUtc3RhdHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXN9XG4uZHNkci1jaGlwe2ZsZXg6bm9uZTttaW4td2lkdGg6MjJweDt0ZXh0LWFsaWduOmNlbnRlcjtib3JkZXItcmFkaXVzOjVweDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1jaGlwLW17YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOiMyZWEwNDN9XG4uZHNkci1jaGlwLWF7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTYpO2NvbG9yOiMyZWEwNDN9XG4uZHNkci1jaGlwLWR7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTYpO2NvbG9yOiNmODUxNDl9XG4uZHNkci1jaGlwLXJ7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KTtjb2xvcjojNThhNmZmfVxuLmRzZHItY2hpcC11e2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci10b29se2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZGlmZntmbGV4OjE7bWluLXdpZHRoOjA7b3ZlcmZsb3c6YXV0bztwYWRkaW5nOjEwcHggMH1cbi5kc2RyLWRpZmYtZW1wdHl7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2hlaWdodDoxMDAlO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1kaWZmLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTBweDtwYWRkaW5nOjZweCAxNnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2ZsZXg6bm9uZX1cbi5kc2RyLWZpbGUtaGVhZC1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtnYXA6M3B4O29wYWNpdHk6MDt0cmFuc2l0aW9uOm9wYWNpdHkgLjEyc30uZHNkci1kaWZmLWhlYWQ6aG92ZXIgLmRzZHItZmlsZS1oZWFkLWFjdGlvbnMsLmRzZHItZmlsZS1oZWFkLWFjdGlvbnM6Zm9jdXMtd2l0aGlue29wYWNpdHk6MX1cbi5kc2RyLWRpZmYtcGF0aHtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTNweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLWRpZmYtc3RhdHN7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7ZmxleDpub25lfVxuLmRzZHItZGlmZi1zY3JvbGx7ZmxleDoxO21pbi1oZWlnaHQ6MDtvdmVyZmxvdzphdXRvO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLXByZXttYXJnaW46MDtwYWRkaW5nOjhweCAwO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOnZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KTtsaW5lLWhlaWdodDpjYWxjKHZhcigtLWRzZHItZGlmZi1zaXplLCAxMnB4KSArIDZweCk7d2hpdGUtc3BhY2U6cHJlO21pbi13aWR0aDoxMDAlO2ZsZXg6MX1cbi5kc2RyLWxpbmV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjEwcHg7cGFkZGluZzowIDE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3Bvc2l0aW9uOnJlbGF0aXZlfVxuLmRzZHItbGluZS1udW17ZmxleDpub25lO3Bvc2l0aW9uOnJlbGF0aXZlO3dpZHRoOjQwcHg7dGV4dC1hbGlnbjpyaWdodDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3VzZXItc2VsZWN0Om5vbmU7Zm9udC1zaXplOmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpIC0gMXB4KTtvcGFjaXR5Oi43NX1cbi5kc2RyLWxpbmUtdGV4dHtmbGV4OjE7bWluLXdpZHRoOjA7d2hpdGUtc3BhY2U6cHJlfVxuLmRzZHItY29tbWVudC1hZGR7cG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDo1MCU7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoLTUwJSk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE2cHg7aGVpZ2h0OjE2cHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo0cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1jb21tZW50LWFkZCwuZHNkci1jb21tZW50LWFkZDpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLWNvbW1lbnQtYWRkOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1jb21tZW50LWhhc3t2aXNpYmlsaXR5OnZpc2libGU7YmFja2dyb3VuZDpjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpIDE2JSwgdHJhbnNwYXJlbnQpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKTtmb250LXZhcmlhbnQtbnVtZXJpYzp0YWJ1bGFyLW51bXM7Zm9udC1zaXplOjEwcHh9XG4uZHNkci1saW5lLWNvbW1lbnRlZHtib3gtc2hhZG93Omluc2V0IDNweCAwIDAgY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKSA3MCUsIHRyYW5zcGFyZW50KX1cbi5kc2RyLWNvbW1lbnQtZWRpdG9ye2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTIpfVxuLmRzZHItY29tbWVudC1pbnB1dHtib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjUycHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtwYWRkaW5nOjZweCA4cHg7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7cmVzaXplOnZlcnRpY2FsfVxuLmRzZHItY29tbWVudC1pbnB1dDpmb2N1c3tvdXRsaW5lOm5vbmU7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KX1cbi5kc2RyLWNvbW1lbnQtYWN0aW9uc3tkaXNwbGF5OmZsZXg7Z2FwOjZweDtqdXN0aWZ5LWNvbnRlbnQ6ZmxleC1lbmR9XG4uZHNkci1vcGVubGluZXtmbGV4Om5vbmU7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjE4cHg7aGVpZ2h0OjE4cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE7cGFkZGluZzowO3Zpc2liaWxpdHk6aGlkZGVufVxuLmRzZHItbGluZTpob3ZlciAuZHNkci1vcGVubGluZSwuZHNkci1vcGVubGluZTpmb2N1cy12aXNpYmxle3Zpc2liaWxpdHk6dmlzaWJsZX1cbi5kc2RyLW9wZW5saW5lOmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWxpbmUtZmluZGluZ3tib3gtc2hhZG93Omluc2V0IDNweCAwIDAgdmFyKC0tZHNkci1maW5kaW5nLWNvbG9yLCByZ2JhKDI1NSwxNjYsODcsLjcpKX1cbi5kc2RyLWZpbmRpbmctUDB7LS1kc2RyLWZpbmRpbmctY29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctUDF7LS1kc2RyLWZpbmRpbmctY29sb3I6I2ZmYTY1N31cbi5kc2RyLWZpbmRpbmctUDJ7LS1kc2RyLWZpbmRpbmctY29sb3I6I2QyOTkyMn1cbi5kc2RyLWZpbmRpbmctUDN7LS1kc2RyLWZpbmRpbmctY29sb3I6IzhiOTQ5ZX1cbi5kc2RyLWZpbmRpbmctdGFne2ZsZXg6bm9uZTtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxNHB4O2JvcmRlci1yYWRpdXM6NHB4O3BhZGRpbmc6MCA0cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydDttYXJnaW4tdG9wOjJweH1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMHtiYWNrZ3JvdW5kOnJnYmEoMjQ4LDgxLDczLC4xOCk7Y29sb3I6I2Y4NTE0OX1cbi5kc2RyLWZpbmRpbmctdGFnLmRzZHItZmluZGluZy1QMXtiYWNrZ3JvdW5kOnJnYmEoMjU1LDE2Niw4NywuMTYpO2NvbG9yOiNmZmE2NTd9XG4uZHNkci1maW5kaW5nLXRhZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItZmluZGluZy10YWcuZHNkci1maW5kaW5nLVAze2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLWp1bXB7YmFja2dyb3VuZDpyZ2JhKDg4LDE2NiwyNTUsLjE2KX1cbi5kc2RyLXZlcmRpY3R7cG9zaXRpb246c3RpY2t5O3RvcDowO3otaW5kZXg6NjtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7bWFyZ2luOjAgMCA2cHg7cGFkZGluZzo4cHggMTJweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czoxMHB4O2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjIpO2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7ZmxleC13cmFwOndyYXB9XG4uZHNkci12ZXJkaWN0LW1hcmt7ZmxleDpub25lO2Rpc3BsYXk6aW5saW5lLWZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MjBweDtoZWlnaHQ6MjBweDtib3JkZXItcmFkaXVzOjUwJTtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo3MDB9XG4uZHNkci12ZXJkaWN0LW9rIC5kc2RyLXZlcmRpY3QtbWFya3tiYWNrZ3JvdW5kOmNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KSAxOCUsIHRyYW5zcGFyZW50KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3QtYmFkIC5kc2RyLXZlcmRpY3QtbWFya3tiYWNrZ3JvdW5kOmNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSkgMTglLCB0cmFuc3BhcmVudCk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLWVycm9yLXByaW1hcnkpfVxuLmRzZHItdmVyZGljdC10ZXh0e2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci12ZXJkaWN0LW9rIC5kc2RyLXZlcmRpY3QtdGV4dHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXZlcmRpY3QtYmFkIC5kc2RyLXZlcmRpY3QtdGV4dHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci12ZXJkaWN0LW1ldGF7Zm9udC12YXJpYW50LW51bWVyaWM6dGFidWxhci1udW1zO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpfVxuLmRzZHItdmVyZGljdC1tb2RlbHtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItZmluZGluZy1jYXJke2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjRweDttYXJnaW46NHB4IDAgNnB4O3BhZGRpbmc6OHB4IDE2cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtib3JkZXItdG9wOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKX1cbi5kc2RyLXNhdmVkLWNvbW1lbnQtbG9je2ZvbnQtc2l6ZToxMHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1zYXZlZC1jb21tZW50LWp1bXB7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MnB4O3dpZHRoOjEwMCU7bWluLXdpZHRoOjA7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjZweDtwYWRkaW5nOjJweDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0fVxuLmRzZHItc2F2ZWQtY29tbWVudC1qdW1wOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXNhdmVkLWNvbW1lbnQtanVtcDpob3ZlciAuZHNkci1zYXZlZC1jb21tZW50LWxvY3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXNhdmVkLWNvbW1lbnQtdmlld3t3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO3Jlc2l6ZTpub25lfVxuLmRzZHItZmluZGluZy1jYXJkLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O2ZsZXgtd3JhcDp3cmFwfVxuLmRzZHItZmluZGluZy1jYXJkLXRpdGxle2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmluZGluZy1jYXJkLWxvY3tmb250LXNpemU6MTBweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc31cbi5kc2RyLWZpbmRpbmctY2FyZC1kZXRhaWx7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTt3aGl0ZS1zcGFjZTpwcmUtd3JhcDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItZmluZGluZy1jYXJkLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLWZpbmRpbmctY2FyZC1zdWdnZXN0aW9ue21hcmdpbjowO3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjhweDtwYWRkaW5nOjZweCA4cHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyl9XG4uZHNkci1wcntkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo0cHg7cGFkZGluZzo0cHggOHB4IDhweH1cbi5kc2RyLXByLWl0ZW17ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6M3B4O2JvcmRlci1yYWRpdXM6OHB4O3BhZGRpbmc6NnB4IDhweDtjdXJzb3I6cG9pbnRlcjtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3RleHQtYWxpZ246bGVmdDtmb250OmluaGVyaXR9XG4uZHNkci1wci1pdGVtOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLXByLW1ldGF7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKX1cbi5kc2RyLXByLXRleHR7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6cHJlLXdyYXA7b3ZlcmZsb3ctd3JhcDphbnl3aGVyZX1cbi5kc2RyLWRvY2t7Ym94LXNpemluZzpib3JkZXItYm94O2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjZweDt3aWR0aDoxMDAlO21heC13aWR0aDp2YXIoLS1kc2gtY29tcG9zZXItY2FyZC1tYXgtd2lkdGgsIDc4MHB4KTttYXJnaW46MCBhdXRvIGNhbGMoLTEgKiB2YXIoLS1kc2gtY29tcG9zZXItc3RhY2stZ2FwLCA2cHgpIC0gOHB4KTtwYWRkaW5nOjhweCAxNnB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLWlucHV0LW1ham9yKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDItZGFya21vZGUtdGhpbik7Ym9yZGVyLWJvdHRvbTpub25lO2JvcmRlci1yYWRpdXM6MjJweCAyMnB4IDAgMDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWRvY2staGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWluLWhlaWdodDoyMnB4O21hcmdpbjotOHB4IC0xNnB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXJhZGl1czoyMnB4IDIycHggMCAwO2N1cnNvcjpwb2ludGVyfVxuLmRzZHItZG9jay1oZWFkOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWRvY2staWNvbntkaXNwbGF5OmlubGluZS1mbGV4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKX1cbi5kc2RyLWRvY2stY291bnR7Zm9udC13ZWlnaHQ6NjAwO2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtcztjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7d2hpdGUtc3BhY2U6bm93cmFwfVxuLmRzZHItZG9jay1mbGFzaHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KTtmb250LXNpemU6MTFweDt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci1kb2NrLXNlbmQtaGludHtmbGV4Om5vbmU7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpO3Zpc2liaWxpdHk6aGlkZGVuO3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLWRvY2staGVhZDpob3ZlciAuZHNkci1kb2NrLXNlbmQtaGludHt2aXNpYmlsaXR5OnZpc2libGV9XG4uZHNkci1kb2NrLWNsb3Nle2ZsZXg6bm9uZTtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3dpZHRoOjIwcHg7aGVpZ2h0OjIwcHg7Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MH1cbi5kc2RyLWRvY2stY2xvc2U6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLWRvY2stY2hpcHN7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O21pbi1oZWlnaHQ6MjZweDttYXJnaW46MCAtMTZweDtwYWRkaW5nOjAgMTZweDtvdmVyZmxvdzpoaWRkZW59XG4uZHNkci1kb2NrLWNoaXB7ZmxleDowIDEgYXV0bzttaW4td2lkdGg6MDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7Ym9yZGVyOjA7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzozcHggOHB4O2N1cnNvcjpwb2ludGVyO2ZvbnQ6aW5oZXJpdDt0ZXh0LWFsaWduOmxlZnR9XG4uZHNkci1kb2NrLWNoaXA6aG92ZXJ7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpfVxuLmRzZHItZG9jay1jaGlwLWxvY3tmbGV4Om5vbmU7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjEwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpO3doaXRlLXNwYWNlOm5vd3JhcDttYXgtd2lkdGg6NDIlO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzfVxuLmRzZHItZG9jay1jaGlwLXRleHR7bWluLXdpZHRoOjA7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTZweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXN9XG4uZHNkci1kb2NrLWNoaXAtbW9yZXtmbGV4Om5vbmU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Ym9yZGVyOjA7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2N1cnNvcjpwb2ludGVyO2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4O3BhZGRpbmc6MnB4IDZweDtib3JkZXItcmFkaXVzOjZweDt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci1kb2NrLWNoaXAtbW9yZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2VuZHtwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjQwO3RvcDo1MnB4O3JpZ2h0OjE2cHg7d2lkdGg6bWluKDQ4MHB4LGNhbGMoMTAwJSAtIDMycHgpKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDIpO2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLW1lbnUpO2JvcmRlci1yYWRpdXM6MTJweDtib3gtc2hhZG93OnZhcigtLWRzdy1zaGFkb3ctbHYzKTtwYWRkaW5nOjEycHg7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6OHB4fVxuLmRzZHItc2VuZC10aXRsZXtmb250LXNpemU6MTNweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc2VuZC1oaW50e2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXNlbmQtaW5wdXR7Ym94LXNpemluZzpib3JkZXItYm94O3dpZHRoOjEwMCU7bWluLWhlaWdodDoxNDBweDttYXgtaGVpZ2h0OjMyMHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6OHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtsaW5lLWhlaWdodDoxOHB4O3Jlc2l6ZTp2ZXJ0aWNhbDt3aGl0ZS1zcGFjZTpwcmUtd3JhcH1cbi5kc2RyLWxpbmUtYWRke2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjEzKX1cbi5kc2RyLWxpbmUtZGVse2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjEyKX1cbi5kc2RyLWxpbmUtaHVua3tiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1maWxsLWwyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpfVxuLmRzZHItbGluZS1maWxle2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1saW5lLW5vdGV7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250LXN0eWxlOml0YWxpY31cbi5kc2RyLWh1bmstYmFye2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjVweDtwYWRkaW5nOjRweCAxMnB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpfVxuLmRzZHItaHVuay1hY3Rpb257ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoyOHB4O2hlaWdodDoyOHB4O3BhZGRpbmc6MDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjUwJTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQ6MThweC8xIHZhcigtLWRzdy1mb250LXNhbnMpO2N1cnNvcjpwb2ludGVyfS5kc2RyLWh1bmstYWN0aW9uOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9LmRzZHItaHVuay1hY3Rpb24tc3RhZ2U6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLXN0YXRlLXN1Y2Nlc3MtcHJpbWFyeSl9LmRzZHItaHVuay1hY3Rpb24tcmV2ZXJ0OmhvdmVye2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0dXMtZGFuZ2VyKX0uZHNkci1odW5rLWFjdGlvbjpkaXNhYmxlZHtjdXJzb3I6ZGVmYXVsdDtvcGFjaXR5Oi40NX1cbi5kc2RyLWh1bmstbGF5ZXJ7Zm9udC1zaXplOjEwcHg7bGluZS1oZWlnaHQ6MTRweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO21hcmdpbi1yaWdodDphdXRvfVxuLmRzZHItZm9vdHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6OHB4IDE2cHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleDpub25lO21pbi1oZWlnaHQ6MzZweH1cbi5kc2RyLW5vdGljZXtmb250LXNpemU6MTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLW5vdGljZS1va3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLW5vdGljZS1lcnJvcntjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1zcGlubmVye2ZsZXg6bm9uZTt3aWR0aDoxMnB4O2hlaWdodDoxMnB4O2JvcmRlci1yYWRpdXM6NTAlO2JvcmRlcjoycHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXRvcC1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTthbmltYXRpb246ZHNkci1zcGluIC44cyBsaW5lYXIgaW5maW5pdGV9XG5Aa2V5ZnJhbWVzIGRzZHItc3Bpbnt0b3t0cmFuc2Zvcm06cm90YXRlKDM2MGRlZyl9fVxuLmRzZHItZW1wdHl7cGFkZGluZzo0MHB4O3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1lbXB0eS1hY3Rpb25ze2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO21hcmdpbi10b3A6MTJweH1cbi5kc2RyLW5vZGlmZntwYWRkaW5nOjhweCAxNnB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEycHh9XG4uZHNkci1zZWx7cG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTppbmxpbmUtZmxleH1cbi5kc2RyLXNlbC10cmlnZ2Vye2JveC1zaXppbmc6Y29udGVudC1ib3g7bWluLXdpZHRoOjE4MHB4O2hlaWdodDozNHB4O2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLWxheWVyLTMpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2N1cnNvcjpwb2ludGVyO3BhZGRpbmc6MCAxMnB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTNweDtsaW5lLWhlaWdodDoxLjU7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweH1cbi5kc2RyLXNlbC10cmlnZ2VyOmhvdmVye2JvcmRlci1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtZGltbWVkKX1cbi5kc2RyLXNlbC10cmlnZ2VyOmZvY3VzLXZpc2libGV7Ym9yZGVyLWNvbG9yOnZhcigtLWRzdy1hbGlhcy1icmFuZC1wcmltYXJ5KTtvdXRsaW5lOm5vbmV9XG4uZHNkci1zZWwtdHJpZ2dlciBzdmd7ZmxleDpub25lO3RyYW5zaXRpb246dHJhbnNmb3JtIC4xMnN9XG4uZHNkci1zZWwtdHJpZ2dlclthcmlhLWV4cGFuZGVkPVwidHJ1ZVwiXSBzdmd7dHJhbnNmb3JtOnJvdGF0ZSgxODBkZWcpfVxuLmRzZHItc2VsLXZhbHVle2ZsZXg6MTttaW4td2lkdGg6MDt0ZXh0LWFsaWduOmxlZnQ7d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7b3ZlcmZsb3c6aGlkZGVufVxuLmRzZHItc2VsLW1lbnV7ei1pbmRleDoyMDA7Ym94LXNpemluZzpib3JkZXItYm94O21pbi13aWR0aDoxMDAlO2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myk7Ym9yZGVyLXJhZGl1czoxMHB4O21hcmdpbjowO3BhZGRpbmc6NHB4O2xpc3Qtc3R5bGU6bm9uZTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoxcHg7cG9zaXRpb246YWJzb2x1dGU7dG9wOmNhbGMoMTAwJSArIDVweCk7bGVmdDowfVxuLmRzZHItc2VsLW9wdGlvbntib3gtc2l6aW5nOmJvcmRlci1ib3g7d2lkdGg6MTAwJTttaW4taGVpZ2h0OjMwcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JvcmRlci1yYWRpdXM6N3B4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6NXB4IDhweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjdXJzb3I6cG9pbnRlcjtiYWNrZ3JvdW5kOjAgMDtib3JkZXI6MDt0ZXh0LWFsaWduOmxlZnQ7ZGlzcGxheTpmbGV4fVxuLmRzZHItc2VsLW9wdGlvbjpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1zZWwtb3B0aW9uLWFjdGl2ZXtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1zZWwtb3B0aW9uLW1hcmt7ZmxleDpub25lO3dpZHRoOjE0cHg7ZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXNlbC1vcHRpb24tbGFiZWx7ZmxleDoxO21pbi13aWR0aDowO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO292ZXJmbG93OmhpZGRlbn1cbi5kc2RyLXZpZXctdG9nZ2xle2Rpc3BsYXk6ZmxleDtnYXA6MnB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo3cHg7cGFkZGluZzoycHg7ZmxleDpub25lfVxuLmRzZHItdmlldy1idG57Ym94LXNpemluZzpib3JkZXItYm94O21pbi1oZWlnaHQ6MjJweDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjVweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7cGFkZGluZzoxcHggOHB4O2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTFweDtsaW5lLWhlaWdodDoxNnB4fVxuLmRzZHItdmlldy1idG46aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSl9XG4uZHNkci12aWV3LWJ0bi1hY3RpdmV7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtaW50ZXJhY3RpdmUtYmctaG92ZXIpO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KX1cbi5kc2RyLXNwbGl0e21pbi13aWR0aDoxMDAlfVxuLmRzZHItc3BsaXQtaGVhZHtkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO3BhZGRpbmc6NHB4IDhweDtwb3NpdGlvbjpzdGlja3k7dG9wOjA7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKX1cbi5kc2RyLXNwbGl0LWhlYWQgZGl2e2Rpc3BsYXk6ZmxleDtnYXA6OHB4fVxuLmRzZHItc3BsaXQtaHVua3tjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWZpbGwtbDIpO2ZvbnQtZmFtaWx5OnZhcigtLWRzZHItZGlmZi1mb250LCB2YXIoLS1kc3ctZm9udC1tb25vKSk7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MThweDtwYWRkaW5nOjJweCAxNnB4fVxuLmRzZHItc3BsaXQtcm93e3Bvc2l0aW9uOnJlbGF0aXZlO2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtmb250LWZhbWlseTp2YXIoLS1kc2RyLWRpZmYtZm9udCwgdmFyKC0tZHN3LWZvbnQtbW9ubykpO2ZvbnQtc2l6ZTp2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCk7bGluZS1oZWlnaHQ6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgKyA2cHgpfVxuLmRzZHItc3BsaXQtY2VsbDpob3ZlciAuZHNkci1jb21tZW50LWFkZCwuZHNkci1zcGxpdC1yb3c6aG92ZXIgLmRzZHItY29tbWVudC1hZGR7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItc3BsaXQtY2VsbHtkaXNwbGF5OmZsZXg7ZmxleC13cmFwOndyYXA7Z2FwOjhweDtwYWRkaW5nOjAgOHB4O3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItc3BsaXQtY2VsbD4uZHNkci1jb21tZW50LWVkaXRvcntmbGV4OjAgMCAxMDAlO3BhZGRpbmc6NnB4IDhweH1cbi5kc2RyLXNwbGl0LW51bXtmbGV4Om5vbmU7cG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NDJweDt0ZXh0LWFsaWduOnJpZ2h0O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7dXNlci1zZWxlY3Q6bm9uZTtmb250LXNpemU6Y2FsYyh2YXIoLS1kc2RyLWRpZmYtc2l6ZSwgMTJweCkgLSAxcHgpO2xpbmUtaGVpZ2h0OmNhbGModmFyKC0tZHNkci1kaWZmLXNpemUsIDEycHgpICsgNnB4KX1cbi5kc2RyLXNwbGl0LXRleHR7ZmxleDoxO21pbi13aWR0aDowfVxuLmRzZHItY2VsbC1maW5kaW5ne2JveC1zaGFkb3c6aW5zZXQgMCAwIDAgMXB4IHZhcigtLWRzZHItZmluZGluZy1jb2xvciwgcmdiYSgyNTUsMTY2LDg3LC43KSk7YmFja2dyb3VuZDpyZ2JhKDI1NSwxNjYsODcsLjA4KX1cbi5kc2RyLWNlbGwtanVtcHtiYWNrZ3JvdW5kOnJnYmEoODgsMTY2LDI1NSwuMTYpfVxuLmRzZHItc3BsaXQtZmluZGluZ3tmbGV4Om5vbmU7Zm9udC1zaXplOjlweDtsaW5lLWhlaWdodDoxMnB4O2JvcmRlci1yYWRpdXM6M3B4O3BhZGRpbmc6MCAzcHg7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC13ZWlnaHQ6NjAwO2FsaWduLXNlbGY6ZmxleC1zdGFydH1cbi5kc2RyLXNwbGl0LWZpbmRpbmcuZHNkci1maW5kaW5nLVAwe2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE4KTtjb2xvcjojZjg1MTQ5fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDF7YmFja2dyb3VuZDpyZ2JhKDI1NSwxNjYsODcsLjE2KTtjb2xvcjojZmZhNjU3fVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDJ7YmFja2dyb3VuZDpyZ2JhKDIxMCwxNTMsMzQsLjE2KTtjb2xvcjojZDI5OTIyfVxuLmRzZHItc3BsaXQtZmluZGluZy5kc2RyLWZpbmRpbmctUDN7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXNwbGl0LW9wZW5saW5le2ZsZXg6bm9uZTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7d2lkdGg6MTZweDtoZWlnaHQ6MTZweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udC1zaXplOjExcHg7bGluZS1oZWlnaHQ6MTtwYWRkaW5nOjA7dmlzaWJpbGl0eTpoaWRkZW59XG4uZHNkci1zcGxpdC1jZWxsOmhvdmVyIC5kc2RyLXNwbGl0LW9wZW5saW5lLC5kc2RyLXNwbGl0LW9wZW5saW5lOmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItc3BsaXQtb3BlbmxpbmU6aG92ZXJ7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItY2VsbC1hZGR7YmFja2dyb3VuZDpyZ2JhKDQ2LDE2MCw2NywuMTMpfVxuLmRzZHItY2VsbC1kZWx7YmFja2dyb3VuZDpyZ2JhKDI0OCw4MSw3MywuMTIpfVxuLmRzZHItY2VsbC1kaW17YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtZmlsbC1sMSwgcmdiYSgxMjgsMTI4LDEyOCwuMDUpKX1cbi8qIC0tLSBjb252ZXJzYXRpb24gcmV2aWV3IGNhcmQgKENvZGV4LXN0eWxlKSAtLS0gKi9cbi5kc2RyLXJldmlldy1jYXJke2Rpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjJweDttYXgtd2lkdGg6bWluKDcyMHB4LDEwMCUpO2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWJnLW1vZHVsZS1wbGF0Zm9ybSk7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItcmFkaXVzOjE2cHg7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Mik7b3ZlcmZsb3c6aGlkZGVuO21hcmdpbjoycHggMH1cbi5kc2RyLXJldmlldy1jYXJkLWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3BhZGRpbmc6OHB4IDEycHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7ZmxleC13cmFwOndyYXB9XG4uZHNkci1yZXZpZXctY2FyZC1iYWRnZXtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4O2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC1iYWRnZSBzdmd7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWJ1dHRvbi1pbmZvLWZpbGwpfVxuLmRzZHItcmV2aWV3LWNhcmQtd29ya3NwYWNle2ZsZXg6MTttaW4td2lkdGg6MDtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO3doaXRlLXNwYWNlOm5vd3JhcDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpc31cbi5kc2RyLXJldmlldy1jYXJkLW1ldGF7ZmxleDpub25lO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC1ncm91cHtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1ufVxuLmRzZHItcmV2aWV3LWNhcmQtcGF0aHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7d2lkdGg6MTAwJTttaW4td2lkdGg6MDtwYWRkaW5nOjZweCAxMnB4O2JhY2tncm91bmQ6MCAwO2JvcmRlcjowO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQ6aW5oZXJpdDtmb250LXNpemU6MTJweDtmb250LXdlaWdodDo2MDA7dGV4dC1hbGlnbjpsZWZ0O2N1cnNvcjpwb2ludGVyO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pfVxuLmRzZHItcmV2aWV3LWNhcmQtcGF0aDpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItcmV2aWV3LWNhcmQtcGF0aCBzcGFue21pbi13aWR0aDowO292ZXJmbG93OmhpZGRlbjt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzO3doaXRlLXNwYWNlOm5vd3JhcH1cbi5kc2RyLXJldmlldy1jYXJkLWl0ZW17ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmZsZXgtc3RhcnQ7Z2FwOjhweDt3aWR0aDoxMDAlO21pbi13aWR0aDowO3BhZGRpbmc6NXB4IDEycHggNXB4IDI2cHg7YmFja2dyb3VuZDowIDA7Ym9yZGVyOjA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXNlY29uZGFyeSk7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMnB4O2xpbmUtaGVpZ2h0OjE4cHg7dGV4dC1hbGlnbjpsZWZ0O2N1cnNvcjpwb2ludGVyfVxuLmRzZHItcmV2aWV3LWNhcmQtaXRlbTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcil9XG4uZHNkci1yZXZpZXctY2FyZC1sb2N7ZmxleDpub25lO2ZvbnQtZmFtaWx5OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMXB4O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1idXR0b24taW5mby1maWxsKTt3aGl0ZS1zcGFjZTpub3dyYXA7cGFkZGluZy10b3A6MXB4fVxuLmRzZHItcmV2aWV3LWNhcmQtdGV4dHttaW4td2lkdGg6MDtvdmVyZmxvdy13cmFwOmFueXdoZXJlO3doaXRlLXNwYWNlOnByZS13cmFwfVxuLmRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC1zZWN7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6NHB4O3BhZGRpbmc6OHB4IDEycHg7Ym9yZGVyLXRvcDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMil9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LWhlYWR7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O2ZvbnQtc2l6ZToxMnB4O2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0e2ZsZXg6bm9uZTtmb250LXNpemU6MTFweDtmb250LXdlaWdodDo2MDA7Ym9yZGVyLXJhZGl1czo2cHg7cGFkZGluZzoxcHggNnB4fVxuLmRzZHItcmV2aWV3LWNhcmQtdmVyZGljdC1jb3JyZWN0e2JhY2tncm91bmQ6cmdiYSg0NiwxNjAsNjcsLjE2KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtc3VjY2Vzcy1wcmltYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtaW5jb3JyZWN0e2JhY2tncm91bmQ6cmdiYSgyNDgsODEsNzMsLjE2KTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSl9XG4uZHNkci1yZXZpZXctY2FyZC1maW5kaW5ne2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDo2cHg7Zm9udC1zaXplOjEycHg7bGluZS1oZWlnaHQ6MThweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWZpbmRpbmctdGV4dHttaW4td2lkdGg6MDtvdmVyZmxvdy13cmFwOmFueXdoZXJlfVxuLmRzZHItcmV2aWV3LWNhcmQtZmluZGluZy1sb2N7Zm9udC1mYW1pbHk6dmFyKC0tZHN3LWZvbnQtbW9ubyk7Zm9udC1zaXplOjExcHg7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KX1cbi5kc2RyLXJldmlldy1jYXJkLWZvb3R7cGFkZGluZzo2cHggMTJweDtmb250LXNpemU6MTFweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLyogLS0tIENvZGV4LXN0eWxlIHJlcGx5IGNoYW5nZSBzdW1tYXJ5ICh0dXJuIHRhaWwpIC0tLSAqL1xuLmRzZHItdHVybi1zdW1tYXJ5e21heC13aWR0aDptaW4oNzIwcHgsMTAwJSk7bWFyZ2luOjJweCAwIDEwcHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtib3JkZXItcmFkaXVzOjE0cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbW9kdWxlLXBsYXRmb3JtKTtvdmVyZmxvdzpoaWRkZW59XG4uZHNkci10dXJuLXN1bW1hcnktaGVhZHtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O3BhZGRpbmc6MTJweCAxNHB4fVxuLmRzZHItdHVybi1zdW1tYXJ5LWljb257ZGlzcGxheTpncmlkO3BsYWNlLWl0ZW1zOmNlbnRlcjt3aWR0aDozNHB4O2hlaWdodDozNHB4O2JvcmRlci1yYWRpdXM6MTBweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0yKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KX1cbi5kc2RyLXR1cm4tc3VtbWFyeS10aXRsZXtmb250LXNpemU6MTRweDtmb250LXdlaWdodDo2MDA7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItdHVybi1zdW1tYXJ5LXN0YXRze2ZvbnQtc2l6ZToxM3B4O2ZvbnQtdmFyaWFudC1udW1lcmljOnRhYnVsYXItbnVtczt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci10dXJuLXN1bW1hcnktYWRke2NvbG9yOnZhcigtLWRzdy1hbGlhcy1zdGF0ZS1zdWNjZXNzLXByaW1hcnkpfVxuLmRzZHItdHVybi1zdW1tYXJ5LWRlbHtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtc3RhdGUtZXJyb3ItcHJpbWFyeSk7bWFyZ2luLWxlZnQ6NHB4fVxuLmRzZHItdHVybi1zdW1tYXJ5LWZpbGVze2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLmRzZHItdHVybi1zdW1tYXJ5LWZpbGV7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6OHB4O3dpZHRoOjEwMCU7cGFkZGluZzo4cHggMTRweDtib3JkZXI6MDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1zZWNvbmRhcnkpO2ZvbnQ6aW5oZXJpdDtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1tb25vKTtmb250LXNpemU6MTJweDt0ZXh0LWFsaWduOmxlZnQ7Y3Vyc29yOnBvaW50ZXJ9XG4uZHNkci10dXJuLXN1bW1hcnktZmlsZTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItdHVybi1zdW1tYXJ5LWZpbGUgc3BhbjpmaXJzdC1jaGlsZHttaW4td2lkdGg6MDtvdmVyZmxvdzpoaWRkZW47dGV4dC1vdmVyZmxvdzplbGxpcHNpczt3aGl0ZS1zcGFjZTpub3dyYXB9XG4uZHNkci10dXJuLXN1bW1hcnktZmlsZS1zdGF0c3ttYXJnaW4tbGVmdDphdXRvO2ZsZXg6bm9uZTtmb250LWZhbWlseTp2YXIoLS1kc3ctZm9udC1zYW5zLHN5c3RlbS11aSk7Zm9udC1zaXplOjEycHh9XG4vKiAtLS0gRmlsZXMgZHJhd2VyIC0tLSAqL1xuLmRzZHItZmlsZXMtd29ya3NwYWNle2Rpc3BsYXk6ZmxleDttaW4taGVpZ2h0OjA7ZmxleDoxO2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1tb2R1bGUtcGxhdGZvcm0pfVxuLmRzZHItZmlsZXMtdG9vbGJhcntkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO3BhZGRpbmc6MTBweCAxMnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLmRzZHItZmlsZXMtc2VhcmNoe3dpZHRoOjEwMCU7Ym94LXNpemluZzpib3JkZXItYm94O2JvcmRlcjoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMik7Ym9yZGVyLXJhZGl1czo4cHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctYWxpYXMtYmctbGF5ZXItMik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO3BhZGRpbmc6N3B4IDlweDtmb250OmluaGVyaXQ7Zm9udC1zaXplOjEycHh9XG4uZHNkci1maWxlcy1jb250ZW50e2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6bWlubWF4KDIzMHB4LDMxJSkgMWZyO21pbi1oZWlnaHQ6MDtmbGV4OjF9XG4uZHNkci1maWxlcy1saXN0e292ZXJmbG93OmF1dG87Ym9yZGVyLXJpZ2h0OjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwxKTtwYWRkaW5nOjhweCA2cHh9XG4uZHNkci1maWxlcy1pdGVte2Rpc3BsYXk6ZmxleDt3aWR0aDoxMDAlO2JveC1zaXppbmc6Ym9yZGVyLWJveDtib3JkZXI6MDtib3JkZXItcmFkaXVzOjdweDtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50O3BhZGRpbmc6NnB4IDhweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtc2Vjb25kYXJ5KTtmb250OnZhcigtLWRzdy1mb250LW1vbm8pO2ZvbnQtc2l6ZToxMXB4O2xpbmUtaGVpZ2h0OjE2cHg7dGV4dC1hbGlnbjpsZWZ0O2N1cnNvcjpwb2ludGVyfVxuLmRzZHItZmlsZXMtaXRlbTpob3ZlciwuZHNkci1maWxlcy1pdGVtLWFjdGl2ZXtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1pbnRlcmFjdGl2ZS1iZy1ob3Zlcik7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItZmlsZXMtbWVudXtwb3NpdGlvbjpmaXhlZDt6LWluZGV4OjgwO2Rpc3BsYXk6ZmxleDttaW4td2lkdGg6MTgwcHg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDoycHg7cGFkZGluZzo2cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1kc3ctYWxpYXMtYm9yZGVyLWwyKTtib3JkZXItcmFkaXVzOjEwcHg7YmFja2dyb3VuZDp2YXIoLS1kc3ctc3BlY2lmaWMtbWVudSk7Ym94LXNoYWRvdzp2YXIoLS1kc3ctc2hhZG93LWx2Myl9LmRzZHItZmlsZXMtbWVudSBidXR0b257Ym9yZGVyOjA7Ym9yZGVyLXJhZGl1czo2cHg7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7cGFkZGluZzo4cHggMTBweDt0ZXh0LWFsaWduOmxlZnQ7Zm9udDoxMnB4IHZhcigtLWRzdy1mb250LXNhbnMpO2N1cnNvcjpwb2ludGVyfS5kc2RyLWZpbGVzLW1lbnUgYnV0dG9uOmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKX1cbi5kc2RyLWZpbGVzLWVkaXRvcntkaXNwbGF5OmZsZXg7bWluLXdpZHRoOjA7ZmxleC1kaXJlY3Rpb246Y29sdW1ufS5kc2RyLWZpbGVzLXBhdGh7cGFkZGluZzo4cHggMTJweDtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtdGVydGlhcnkpO2ZvbnQ6MTFweCB2YXIoLS1kc3ctZm9udC1tb25vKTt3aGl0ZS1zcGFjZTpub3dyYXA7b3ZlcmZsb3c6aGlkZGVuO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSl9XG4uZHNkci1jb2RlLWVkaXRvcntkaXNwbGF5OmZsZXg7bWluLWhlaWdodDowO2ZsZXg6MTtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0xKTtvdmVyZmxvdzpoaWRkZW59LmRzZHItY29kZS1saW5lc3tmbGV4Om5vbmU7d2lkdGg6NDhweDtib3gtc2l6aW5nOmJvcmRlci1ib3g7b3ZlcmZsb3c6aGlkZGVuO3BhZGRpbmc6MTJweCA4cHggMTJweCAwO2JvcmRlci1yaWdodDoxcHggc29saWQgdmFyKC0tZHN3LWFsaWFzLWJvcmRlci1sMSk7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXRlcnRpYXJ5KTtmb250OjEycHgvMjBweCB2YXIoLS1kc3ctZm9udC1tb25vKTt0ZXh0LWFsaWduOnJpZ2h0O3VzZXItc2VsZWN0Om5vbmV9LmRzZHItY29kZS1saW5lcyBzcGFue2Rpc3BsYXk6YmxvY2s7aGVpZ2h0OjIwcHh9XG4uZHNkci1jb2RlLWxheWVye3Bvc2l0aW9uOnJlbGF0aXZlO21pbi13aWR0aDowO21pbi1oZWlnaHQ6MDtmbGV4OjE7b3ZlcmZsb3c6aGlkZGVufS5kc2RyLWNvZGUtaGlnaGxpZ2h0LC5kc2RyLWZpbGVzLXRleHR7Ym94LXNpemluZzpib3JkZXItYm94O3Bvc2l0aW9uOmFic29sdXRlO2luc2V0OjA7bWFyZ2luOjA7cGFkZGluZzoxMnB4IDE0cHg7Ym9yZGVyOjA7Zm9udDoxMnB4LzIwcHggdmFyKC0tZHN3LWZvbnQtbW9ubyk7dGFiLXNpemU6Mjt3aGl0ZS1zcGFjZTpwcmU7b3ZlcmZsb3c6YXV0b30uZHNkci1jb2RlLWhpZ2hsaWdodHtwb2ludGVyLWV2ZW50czpub25lO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC1wcmltYXJ5KTtiYWNrZ3JvdW5kOnRyYW5zcGFyZW50fS5kc2RyLWZpbGVzLXRleHR7cmVzaXplOm5vbmU7YmFja2dyb3VuZDp0cmFuc3BhcmVudDtjb2xvcjp0cmFuc3BhcmVudDtjYXJldC1jb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSk7b3V0bGluZTowOy13ZWJraXQtdGV4dC1maWxsLWNvbG9yOnRyYW5zcGFyZW50fS5kc2RyLWZpbGVzLXRleHQ6OnNlbGVjdGlvbntiYWNrZ3JvdW5kOnJnYmEoOTEsMTQwLDI1NSwuMzUpfVxuLmRzZHItY29kZS1rZXl3b3Jke2NvbG9yOiNjNTg2YzB9LmRzZHItY29kZS1zdHJpbmd7Y29sb3I6I2NlOTE3OH0uZHNkci1jb2RlLWNvbW1lbnR7Y29sb3I6IzZhOTk1NX0uZHNkci1jb2RlLW51bWJlcntjb2xvcjojYjVjZWE4fS5kc2RyLWNvZGUtcGxhaW57Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpfVxuLmRzZHItaW1hZ2UtcHJldmlld3tkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7bWluLWhlaWdodDowO2ZsZXg6MTtvdmVyZmxvdzphdXRvO3BhZGRpbmc6MjRweDtiYWNrZ3JvdW5kOnZhcigtLWRzdy1hbGlhcy1iZy1sYXllci0xKX0uZHNkci1pbWFnZS1wcmV2aWV3IGltZ3ttYXgtd2lkdGg6MTAwJTttYXgtaGVpZ2h0OjEwMCU7b2JqZWN0LWZpdDpjb250YWluO2JveC1zaGFkb3c6dmFyKC0tZHN3LXNoYWRvdy1sdjIpfS5kc2RyLWZpbGVzLXVuYXZhaWxhYmxle2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjttaW4taGVpZ2h0OjA7ZmxleDoxO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Zm9udC1zaXplOjEzcHh9XG4uZHNkci1maWxlcy1hY3Rpb25ze2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweDtwYWRkaW5nOjhweCAxMHB4O2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWRzdy1hbGlhcy1ib3JkZXItbDEpfVxuLyogLS0tIGZhbGxiYWNrIHVzZXIgYnViYmxlIChuYXRpdmUgbG9vaykgLS0tICovXG4uZHNkci1mYWxsYmFjay11c2Vye2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjthbGlnbi1pdGVtczpmbGV4LWVuZDtnYXA6NnB4O2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWZhbGxiYWNrLXVzZXItc3RhY2t7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmZsZXgtZW5kO2dhcDo4cHg7bWluLXdpZHRoOjA7bWF4LXdpZHRoOm1pbig1MjVweCw4MiUpO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWZhbGxiYWNrLXVzZXItcm93e2ZsZXgtZGlyZWN0aW9uOnJvdzthbGlnbi1pdGVtczpmbGV4LWVuZDtnYXA6NnB4O21heC13aWR0aDoxMDAlO2Rpc3BsYXk6ZmxleH1cbi5kc2RyLWZhbGxiYWNrLXVzZXItYnViYmxle2JhY2tncm91bmQ6dmFyKC0tZHN3LXNwZWNpZmljLWJ1YmJsZSk7bWF4LXdpZHRoOjEwMCU7Y29sb3I6dmFyKC0tZHN3LWFsaWFzLWxhYmVsLXByaW1hcnkpO2JvcmRlci1yYWRpdXM6MjJweDtwYWRkaW5nOjEwcHggMTZweDtmb250LXNpemU6MTZweDtsaW5lLWhlaWdodDoyNHB4O3doaXRlLXNwYWNlOnByZS13cmFwO292ZXJmbG93LXdyYXA6YW55d2hlcmV9XG4uZHNkci1mYWxsYmFjay11c2VyLWNvcHl7ZmxleDpub25lO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjt3aWR0aDoyNHB4O2hlaWdodDoyNHB4O2JvcmRlcjowO2JvcmRlci1yYWRpdXM6NnB4O2JhY2tncm91bmQ6MCAwO2NvbG9yOnZhcigtLWRzdy1hbGlhcy1sYWJlbC10ZXJ0aWFyeSk7Y3Vyc29yOnBvaW50ZXI7Zm9udDppbmhlcml0O2ZvbnQtc2l6ZToxMXB4O3Zpc2liaWxpdHk6aGlkZGVuO21hcmdpbi1ib3R0b206MnB4fVxuLmRzZHItZmFsbGJhY2stdXNlcjpob3ZlciAuZHNkci1mYWxsYmFjay11c2VyLWNvcHksLmRzZHItZmFsbGJhY2stdXNlci1jb3B5OmZvY3VzLXZpc2libGV7dmlzaWJpbGl0eTp2aXNpYmxlfVxuLmRzZHItZmFsbGJhY2stdXNlci1jb3B5OmhvdmVye2JhY2tncm91bmQ6dmFyKC0tZHN3LWFsaWFzLWludGVyYWN0aXZlLWJnLWhvdmVyKTtjb2xvcjp2YXIoLS1kc3ctYWxpYXMtbGFiZWwtcHJpbWFyeSl9XG5gXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzdHlsZVtkYXRhLXBsdWdpbi1jc3M9JHtKU09OLnN0cmluZ2lmeShTVFlMRV9UQUcpfV1gKSA9PT0gbnVsbCkge1xuICBjb25zdCB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gIHRhZy5kYXRhc2V0LnBsdWdpbiA9ICdkc2gtcGx1Z2luLWRpZmYtcmV2aWV3J1xuICB0YWcuZGF0YXNldC5wbHVnaW5Dc3MgPSBTVFlMRV9UQUdcbiAgdGFnLnRleHRDb250ZW50ID0gUkVWSUVXX0NTU1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHRhZylcbn1cblxuLyoqIFNpbXBsaWZpZWQgQ2hpbmVzZSBkaWN0aW9uYXJ5IChrZXktc2V0IHNvdXJjZSBvZiB0cnV0aCkuICovXG5jb25zdCB6aCA9IHtcbiAgJ2FjdGlvbi5sYWJlbCc6ICdcdTUzRDhcdTUyQTgnLFxuICAnYWN0aW9uLmFyaWEnOiAnXHU1QkExXHU2N0U1XHU1RjUzXHU1MjREXHU5ODc5XHU3NkVFXHU0RTBFXHU2QkNGXHU4RjZFXHU0RkVFXHU2NTM5JyxcbiAgJ3RhYi5zZXNzaW9uJzogJ1x1NEYxQVx1OEJERFx1NjZGNFx1NjUzOScsXG4gICd0YWIud29ya3NwYWNlJzogJ1x1NURFNVx1NEY1Q1x1NTMzQScsXG4gICdyZXZpZXcudGl0bGUnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ3Jldmlldy5icmFuY2gnOiAnXHU1MjA2XHU2NTJGJyxcbiAgJ3Jldmlldy5kZXRhY2hlZCc6ICdcdTZFMzhcdTc5QkIgSEVBRCcsXG4gICdyZXZpZXcubm90UmVwbyc6ICdcdTVGNTNcdTUyNERcdTc2RUVcdTVGNTVcdTRFMERcdTY2MkYgZ2l0IFx1NEVEM1x1NUU5MycsXG4gICdyZXZpZXcubm90UmVwb0hpbnQnOiAnXHUzMDBDXHU0RjFBXHU4QkREXHU2NkY0XHU2NTM5XHUzMDBEXHU5ODc1XHU3QjdFXHU0RTBEXHU1M0Q3XHU1RjcxXHU1NENEXHVGRjBDXHU0RUNEXHU1M0VGXHU2N0U1XHU3NzBCXHU2QkNGXHU4RjZFXHU0RkVFXHU2NTM5XHUzMDAyJyxcbiAgJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJzogJ1x1OEZEOVx1NEUyQVx1NEYxQVx1OEJERFx1OEZEOFx1NkNBMVx1NjcwOVx1NjU4N1x1NEVGNlx1NEZFRVx1NjUzOVx1OEJCMFx1NUY1NScsXG4gICdyZXZpZXcuc2Vzc2lvblNjYW4nOiAnXHU1REYyXHU2MjZCXHU2M0NGIHtyZXN1bHRzfSBcdTRFMkFcdTVERTVcdTUxNzdcdTdFRDNcdTY3OUNcdUZGMUF7ZGlmZn0gXHU0RTJBXHU2NDNBXHU1RTI2IGRpZmZcdTMwMDF7cGF0aH0gXHU0RTJBXHU0RUM1XHU2NzA5XHU4REVGXHU1Rjg0XHUyMDE0XHUyMDE0XHU3RUM4XHU3QUVGXHU1NDdEXHU0RUU0XHVGRjA4YmFzaFx1RkYwOVx1NjUzOVx1NjU4N1x1NEVGNlx1NEUwRFx1NEYxQVx1OEJBMVx1NTE2NVx1NEYxQVx1OEJERFx1OEJCMFx1NUY1NVx1MzAwMicsXG4gICdyZXZpZXcuZ29Xb3Jrc3BhY2UnOiAnXHU2N0U1XHU3NzBCXHU1REU1XHU0RjVDXHU1MzNBXHU2NTM5XHU1MkE4JyxcbiAgJ3Jldmlldy5zZXNzaW9uU3RhdHMnOiAne3JvdW5kc30gXHU4RjZFIFx1MDBCNyB7ZmlsZXN9IFx1NEUyQVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcucm91bmQnOiAnXHU3QjJDIHtyb3VuZH0gXHU4RjZFJyxcbiAgJ3Jldmlldy5lbXB0eSc6ICdcdTZDQTFcdTY3MDlcdTY3MkFcdTYzRDBcdTRFQTRcdTc2ODRcdTY2RjRcdTY1MzkgXHVEODNDXHVERjg5JyxcbiAgJ3Jldmlldy5sb2FkRXJyb3InOiAnXHU1MkEwXHU4RjdEXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5hY2NlcHQnOiAnXHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy5hY2NlcHRBbGwnOiAnXHU1MTY4XHU5MEU4XHU5MUM3XHU3RUIzJyxcbiAgJ3Jldmlldy5yZXZlcnRBbGwnOiAnXHU1MTY4XHU5MEU4XHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy51bnN0YWdlJzogJ1x1NTNENlx1NkQ4OFx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcudW5zdGFnZUFsbCc6ICdcdTUxNjhcdTkwRThcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5zdGFnZSc6ICdcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5yZXZlcnQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ2h1bmsudW5zdGFnZSc6ICdcdTUzRDZcdTZEODhcdTY2ODJcdTVCNTgnLFxuICAnaHVuay5zdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ2h1bmsudW5zdGFnZWQnOiAnXHU2NzJBXHU2NjgyXHU1QjU4JyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0JzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NEUyMlx1NUYwMycsXG4gICdyZXZpZXcuY29uZmlybVJldmVydEFsbCc6ICdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTUxNjhcdTkwRThcdTRFMjJcdTVGMDMnLFxuICAncmV2aWV3LmNvbW1pdCc6ICdcdTYzRDBcdTRFQTQnLFxuICAncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJzogJ1x1NjNEMFx1NEVBNFx1OEJGNFx1NjYwRVx1MjAyNicsXG4gICdyZXZpZXcucHVzaCc6ICdcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LmNvbmZpcm1QdXNoJzogJ1x1NTE4RFx1NkIyMVx1NzBCOVx1NTFGQlx1Nzg2RVx1OEJBNFx1NjNBOFx1OTAwMScsXG4gICdyZXZpZXcuY29tbWl0dGVkJzogJ1x1NURGMlx1NjNEMFx1NEVBNCB7c3VtbWFyeX0nLFxuICAncmV2aWV3LmNvbW1pdEZhaWxlZCc6ICdcdTYzRDBcdTRFQTRcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnB1c2hlZCc6ICdcdTVERjJcdTYzQThcdTkwMDEnLFxuICAncmV2aWV3LnB1c2hGYWlsZWQnOiAnXHU2M0E4XHU5MDAxXHU1OTMxXHU4RDI1JyxcbiAgJ3Jldmlldy5haGVhZCc6ICdcdTk4ODZcdTUxNDgge259JyxcbiAgJ3Jldmlldy5iZWhpbmQnOiAnXHU4NDNEXHU1NDBFIHtufScsXG4gICdyZXZpZXcuc2VjdGlvblN0YWdlZCc6ICdcdTVERjJcdTY2ODJcdTVCNTgnLFxuICAncmV2aWV3LnNlY3Rpb25DaGFuZ2VzJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdyZXZpZXcuc2VjdGlvbkJyYW5jaCc6ICdcdTUyMDZcdTY1MkZcdTRFMEVcdThGRENcdTdBMEInLFxuICAncmV2aWV3Lm5vVXBzdHJlYW0nOiAnXHU2NzJBXHU4QkJFXHU3RjZFXHU0RTBBXHU2RTM4XHU1MjA2XHU2NTJGJyxcbiAgJ3Jldmlldy5oaXN0b3J5JzogJ1x1NTM4Nlx1NTNGMicsXG4gICdyZXZpZXcuY29tbWl0RmlsZXMnOiAnXHU1M0Q4XHU1MkE4XHU2NTg3XHU0RUY2JyxcbiAgJ2hpc3RvcnkubG9jYWwnOiAnXHU2NzJDXHU1NzMwJyxcbiAgJ2hpc3RvcnkucmVtb3RlJzogJ1x1OEZEQ1x1N0EwQicsXG4gICd0aW1lLm5vdyc6ICdcdTUyMUFcdTUyMUEnLFxuICAndGltZS5taW51dGVzJzogJ3tufSBcdTUyMDZcdTk0OUZcdTUyNEQnLFxuICAndGltZS5ob3Vycyc6ICd7bn0gXHU1QzBGXHU2NUY2XHU1MjREJyxcbiAgJ3RpbWUuZGF5cyc6ICd7bn0gXHU1OTI5XHU1MjREJyxcbiAgJ3Jldmlldy5yZWZyZXNoJzogJ1x1NTIzN1x1NjVCMCcsXG4gICdyZXZpZXcuY2xvc2UnOiAnXHU1MTczXHU5NUVEJyxcbiAgJ3Jldmlldy5idXN5JzogJ1x1NTkwNFx1NzQwNlx1NEUyRFx1MjAyNicsXG4gICdyZXZpZXcuZG9uZSc6ICdcdTVERjJ7YWN0aW9ufSB7Y291bnR9IFx1NEUyQVx1NjU4N1x1NEVGNicsXG4gICdyZXZpZXcuZG9uZU9uZSc6ICdcdTVERjJ7YWN0aW9ufSB7cGF0aH0nLFxuICAncmV2aWV3LmRvbmVEZWxldGVkJzogJ1x1NURGMnthY3Rpb259IHtjb3VudH0gXHU0RTJBXHU2NTg3XHU0RUY2XHVGRjA4XHU1MjIwXHU5NjY0IHtkZWxldGVkfSBcdTRFMkFcdTY3MkFcdThEREZcdThFMkFcdTY1ODdcdTRFRjZcdUZGMDknLFxuICAncmV2aWV3LmFjY2VwdGVkJzogJ1x1OTFDN1x1N0VCMycsXG4gICdyZXZpZXcucmV2ZXJ0ZWQnOiAnXHU0RTIyXHU1RjAzJyxcbiAgJ3Jldmlldy51bnRyYWNrZWQnOiAnXHU2NzJBXHU4RERGXHU4RTJBJyxcbiAgJ3Jldmlldy5iaW5hcnknOiAnXHU0RThDXHU4RkRCXHU1MjM2JyxcbiAgJ3Jldmlldy5ub0RpZmZEYXRhJzogJ1x1OEJFNVx1NEZFRVx1NjUzOVx1NkNBMVx1NjcwOSBkaWZmIFx1NjU3MFx1NjM2RScsXG4gICdyZXZpZXcuY2hhbmdlcyc6ICd7YWRkZWR9KyB7ZGVsZXRlZH0tJyxcbiAgJ3ZpZXcuc2luZ2xlJzogJ1x1NTM1NVx1NjgwRicsXG4gICd2aWV3LnNwbGl0JzogJ1x1NTNDQ1x1NjgwRicsXG4gICd2aWV3LmJlZm9yZSc6ICdcdTUzOUZcdTY1ODdcdTRFRjYnLFxuICAndmlldy5hZnRlcic6ICdcdTY1QjBcdTY1ODdcdTRFRjYnLFxuICAnY29tbWVudC5hZGQnOiAnXHU4QkM0XHU4QkJBXHU2QjY0XHU4ODRDJyxcbiAgJ2NvbW1lbnQuc2hvdyc6ICdcdTY3RTVcdTc3MEJcdThCQzRcdThCQkEnLFxuICAnY29tbWVudC5wbGFjZWhvbGRlcic6ICdcdThCQzRcdThCQkFcdTIwMjZcdUZGMDhDdHJsL1x1MjMxOCtFbnRlciBcdTRGRERcdTVCNThcdUZGMDknLFxuICAnY29tbWVudC5zYXZlJzogJ1x1NEZERFx1NUI1OCcsXG4gICdjb21tZW50LmNhbmNlbCc6ICdcdTUzRDZcdTZEODgnLFxuICAnY29tbWVudC5kZWxldGUnOiAnXHU1MjIwXHU5NjY0JyxcbiAgJ2NvbW1lbnQuZWRpdCc6ICdcdTdGMTZcdThGOTEnLFxuICAnY29tbWVudC5zYXZlZCc6ICdcdTVERjJcdTRGRERcdTVCNThcdThCQzRcdThCQkEnLFxuICAnY29tbWVudC5mYWlsZWQnOiAnXHU4QkM0XHU4QkJBXHU0RkREXHU1QjU4XHU1OTMxXHU4RDI1JyxcbiAgJ3Njb3BlLmxhYmVsJzogJ1x1ODMwM1x1NTZGNCcsXG4gICdzY29wZS5hbGwnOiAnXHU1MTY4XHU5MEU4JyxcbiAgJ3Njb3BlLnVuc3RhZ2VkJzogJ1x1NjcyQVx1NjY4Mlx1NUI1OCcsXG4gICdzY29wZS5zdGFnZWQnOiAnXHU1REYyXHU2NjgyXHU1QjU4JyxcbiAgJ3Njb3BlLmNvbW1pdCc6ICdcdTYzRDBcdTRFQTQnLFxuICAnc2NvcGUuYnJhbmNoJzogJ1x1NTIwNlx1NjUyRicsXG4gICdzY29wZS5sYXN0LXR1cm4nOiAnXHU2NzAwXHU1NDBFXHU0RTAwXHU4RjZFJyxcbiAgJ3Jldmlldy5sYXN0VHVybkVtcHR5JzogJ1x1NjcwMFx1NTQwRVx1NEUwMFx1OEY2RVx1NkNBMVx1NjcwOVx1OEJCMFx1NUY1NVx1NTIzMFx1NjU4N1x1NEVGNlx1NEZFRVx1NjUzOSBcdTIwMTRcdTIwMTQgXHU3RUM4XHU3QUVGXHU1NDdEXHU0RUU0XHVGRjA4YmFzaFx1RkYwOVx1NjUzOVx1NjU4N1x1NEVGNlx1NEUwRFx1NEYxQVx1OEJBMVx1NTE2NVx1NEYxQVx1OEJERFx1OEJCMFx1NUY1NVx1RkYxQlx1NTNFRlx1NTIwN1x1NTIzMFx1MzAwQ1x1NTE2OFx1OTBFOFx1MzAwRFx1NjdFNVx1NzcwQiBnaXQgXHU1M0Q4XHU2NkY0JyxcbiAgJ3Njb3BlLmJhc2UnOiAnXHU1N0ZBXHU3RUJGXHU1MjA2XHU2NTJGJyxcbiAgJ3Njb3BlLmJyYW5jaFJlYWRvbmx5JzogJ1x1NTIwNlx1NjUyRlx1ODMwM1x1NTZGNFx1NTNFQVx1OEJGQlx1RkYwOFx1NUJGOVx1NkJENCBtZXJnZS1iYXNlXHVGRjBDXHU0RTBEXHU2M0QwXHU0RjlCXHU5MUM3XHU3RUIzL1x1NEUyMlx1NUYwM1x1RkYwOScsXG4gICdyZXZpZXcuc2VsZWN0Q29tbWl0JzogJ1x1NEVDRVx1NURFNlx1NEZBN1x1OTAwOVx1NjJFOVx1NjNEMFx1NEVBNFx1NjdFNVx1NzcwQiBkaWZmJyxcbiAgJ3Jldmlldy5zZW5kVG9BZ2VudCc6ICdcdTUzRDFcdTkwMDFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbmRUaXRsZSc6ICdcdTUzRDFcdTkwMDFcdTg4NENcdTUxODVcdThCQzRcdThCQkFcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbmRIaW50JzogJ1x1OEJDNFx1OEJCQVx1NEYxQVx1NEY1Q1x1NEUzQVx1OEJDNFx1NUJBMVx1NjMwN1x1NUYxNVx1NkNFOFx1NTE2NVx1NUY1M1x1NTI0RFx1NEYxQVx1OEJERFx1RkYwOEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50c1x1RkYwOVx1MzAwMlx1NTNEMVx1OTAwMVx1NTkzMVx1OEQyNVx1NjVGNlx1OTAwMFx1NTMxNlx1NEUzQVx1NTkwRFx1NTIzNlx1NjU4N1x1NjcyQ1x1MzAwMicsXG4gICdyZXZpZXcuc2VudFRvQWdlbnQnOiAnXHU1REYyXHU1M0QxXHU5MDAxXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ3Jldmlldy5jb3B5JzogJ1x1NTkwRFx1NTIzNlx1NjU4N1x1NjcyQycsXG4gICdyZXZpZXcuY29waWVkJzogJ1x1NURGMlx1NTkwRFx1NTIzNicsXG4gICdyZXZpZXcuY29weUZhaWxlZCc6ICdcdTU5MERcdTUyMzZcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnJldmlldyc6ICdcdThCQzRcdTVCQTEnLFxuICAncmV2aWV3LnJldmlld2luZyc6ICdcdThCQzRcdTVCQTFcdTRFMkRcdTIwMjYnLFxuICAncmV2aWV3LnJldmlld0ZhaWxlZCc6ICdcdThCQzRcdTVCQTFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LnZlcmRpY3RDb3JyZWN0JzogJ1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RSBcdTI3MTMnLFxuICAncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnOiAnXHU4ODY1XHU0RTAxXHU1QjU4XHU1NzI4XHU5NUVFXHU5ODk4IFx1MjcxNycsXG4gICdyZXZpZXcubm9GaW5kaW5ncyc6ICdcdTZDQTFcdTY3MDlcdTUzRDFcdTczQjBcdTk1RUVcdTk4OTgnLFxuICAncmV2aWV3LmZpbmRpbmdzJzogJ3tufSBcdTY3NjFcdTUzRDFcdTczQjAnLFxuICAncmV2aWV3LmNvbmZpZGVuY2UnOiAnXHU3RjZFXHU0RkUxXHU1RUE2IHtjb25maWRlbmNlfScsXG4gICdyZXZpZXcuc3VnZ2VzdGlvbic6ICdcdTVFRkFcdThCQUUnLFxuICAncmV2aWV3LnNlbmRGaW5kaW5ncyc6ICdcdTUzRDFcdTkwMDFcdTUzRDFcdTczQjBcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnNlbnRGaW5kaW5ncyc6ICdcdTVERjJcdTUzRDFcdTkwMDFcdTUzRDFcdTczQjBcdTdFRDlcdTRFRTNcdTc0MDYnLFxuICAncmV2aWV3LnJldmlld1Njb3BlJzogJ1x1OEJDNFx1NUJBMVx1ODMwM1x1NTZGNCcsXG4gICdwci50aXRsZSc6ICdQUiAje251bWJlcn0nLFxuICAncHIuY29tbWVudHMnOiAnUFIgXHU4QkM0XHU4QkJBICh7bn0pJyxcbiAgJ3ByLm5vUHInOiAnXHU2NUUwXHU1MTczXHU4MDU0IFBSJyxcbiAgJ3ByLnNlbmRDb21tZW50cyc6ICdcdTUzRDFcdTkwMDEgUFIgXHU4QkM0XHU4QkJBXHU3RUQ5XHU0RUUzXHU3NDA2JyxcbiAgJ2VkaXRvci5vcGVuRmlsZSc6ICdcdTU3MjhcdTdGMTZcdThGOTFcdTU2NjhcdTRFMkRcdTYyNTNcdTVGMDAnLFxuICAnZWRpdG9yLm9wZW5MaW5lJzogJ1x1NTcyOFx1N0YxNlx1OEY5MVx1NTY2OFx1NEUyRFx1NjI1M1x1NUYwMFx1OEJFNVx1ODg0QycsXG4gICdlZGl0b3IuZmFpbGVkJzogJ1x1NjI1M1x1NUYwMFx1NTkzMVx1OEQyNScsXG4gICdyZXBvLmxhYmVsJzogJ1x1NEVEM1x1NUU5MycsXG4gICdyZXZpZXcuZG9ja0NvbW1lbnRzJzogJ1x1ODg0Q1x1NTE4NVx1OEJDNFx1OEJCQSB7bn0gXHU2NzYxJyxcbiAgJ3Jldmlldy5kb2NrVmVyZGljdCc6ICdcdThCQzRcdTVCQTFcdTdFRDNcdThCQkFcdTVGODVcdTUzRDFcdTkwMDEnLFxuICAncmV2aWV3LmRvY2tTZW5kJzogJ1x1NzBCOVx1NTFGQlx1NTNEMVx1OTAwMVx1OEJDNFx1OEJCQScsXG4gICdyZXZpZXcuZG9ja01vcmUnOiAnXHU4RkQ4XHU2NzA5IHtufSBcdTY3NjFcdThCQzRcdThCQkFcdUZGMENcdTcwQjlcdTUxRkJcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTY3RTVcdTc3MEInLFxuICAncmV2aWV3LmNvcGllZEZhbGxiYWNrJzogJ1x1NEYxQVx1OEJERFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwQ1x1OEJDNFx1OEJCQVx1NURGMlx1NTkwRFx1NTIzNlx1RkYwOFx1OEJGN1x1N0M5OFx1OEQzNFx1NTNEMVx1OTAwMVx1RkYwOScsXG4gICdyZXZpZXcuc2VuZEZhaWxlZCc6ICdcdThCQzRcdThCQkFcdTUzRDFcdTkwMDFcdTU5MzFcdThEMjUnLFxuICAncmV2aWV3LmRvY2tKdW1wJzogJ1x1NzBCOVx1NTFGQlx1NTcyOFx1OEJDNFx1NUJBMVx1OTc2Mlx1Njc3Rlx1NEUyRFx1NjI1M1x1NUYwMFx1NUJGOVx1NUU5NFx1NTNEOFx1NjZGNCcsXG4gICdyZXZpZXcuY2FyZFRpdGxlJzogJ1x1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMScsXG4gICdyZXZpZXcuY2FyZENvbW1lbnRzJzogJ3tufSBcdTY3NjFcdThCQzRcdThCQkEnLFxuICAncmV2aWV3LmNhcmRWZXJkaWN0JzogJ0FJIFx1OEJDNFx1NUJBMVx1N0VEM1x1OEJCQScsXG4gICdyZXZpZXcuY2FyZEp1bXAnOiAnXHU3MEI5XHU1MUZCXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU1QjlBXHU0RjREXHU1MjMwXHU1QkY5XHU1RTk0XHU0RUUzXHU3ODAxJyxcbiAgJ3Jldmlldy5jYXJkT3BlbkZpbGUnOiAnXHU1NzI4XHU4QkM0XHU1QkExXHU5NzYyXHU2NzdGXHU0RTJEXHU2MjUzXHU1RjAwXHU4QkU1XHU2NTg3XHU0RUY2JyxcbiAgJ3Jldmlldy5jYXJkSGludCc6ICdcdTcwQjlcdTUxRkJcdThCQzRcdThCQkFcdTUzRUZcdTU3MjhcdThCQzRcdTVCQTFcdTk3NjJcdTY3N0ZcdTRFMkRcdTVCOUFcdTRGNERcdTUyMzBcdTVCRjlcdTVFOTRcdTRFRTNcdTc4MDEnLFxuICAncmV2aWV3LnR1cm5TdW1tYXJ5VGl0bGUnOiAnXHU1REYyXHU0RkVFXHU2NTM5IHtufSBcdTRFMkFcdTY1ODdcdTRFRjYnLFxuICAncmV2aWV3LnR1cm5TdW1tYXJ5UmV2aWV3JzogJ1x1OEJDNFx1NUJBMScsXG4gICdmaWxlcy50aXRsZSc6ICdcdTY1ODdcdTRFRjYnLFxuICAnZmlsZXMuc2VhcmNoJzogJ1x1N0I1Qlx1OTAwOVx1NjU4N1x1NEVGNlx1MjAyNicsXG4gICdmaWxlcy5zYXZlJzogJ1x1NEZERFx1NUI1OCcsXG4gICdmaWxlcy5zYXZlZCc6ICdcdTVERjJcdTRGRERcdTVCNTgnLFxuICAnZmlsZXMubG9hZGluZyc6ICdcdTZCNjNcdTU3MjhcdThCRkJcdTUzRDZcdTIwMjYnLFxuICAnZmlsZXMuZW1wdHknOiAnXHU2Q0ExXHU2NzA5XHU1MzM5XHU5MTREXHU2NTg3XHU0RUY2JyxcbiAgLy8gZmFsbGJhY2suKjogbGFiZWxzIG9mIHRoZSBidWlsdC1pbiBpbWFnZSBmYWxsYmFjayB2aWV3ZXIgKEZhbGxiYWNrVXNlckJ1YmJsZSksXG4gIC8vIHVzZWQgd2hlbiBhIHBsYWluIHVzZXIgbWVzc2FnZSBjYXJyaWVzIGltYWdlcy5cbiAgJ2ZhbGxiYWNrLmltYWdlJzogJ1x1NTZGRVx1NzI0NycsXG4gICdmYWxsYmFjay5vcGVuJzogJ1x1NjdFNVx1NzcwQlx1NTM5Rlx1NTZGRScsXG4gICdmYWxsYmFjay5vcGVuTmFtZWQnOiAnXHU2N0U1XHU3NzBCXHU1MzlGXHU1NkZFIHtuYW1lfScsXG4gICdmYWxsYmFjay5sb2FkaW5nJzogJ1x1NTJBMFx1OEY3RFx1NEUyRFx1MjAyNicsXG4gICdmYWxsYmFjay5sb2FkRmFpbGVkJzogJ1x1NTJBMFx1OEY3RFx1NTkzMVx1OEQyNScsXG4gICdmYWxsYmFjay5saWdodGJveERpYWxvZyc6ICdcdTU2RkVcdTcyNDdcdTk4ODRcdTg5QzgnLFxuICAnZmFsbGJhY2subGlnaHRib3hDbG9zZSc6ICdcdTUxNzNcdTk1RUQnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnXHU1M0Q4XHU1MkE4JyxcbiAgJ3NldHRpbmdzLmZvbnQnOiAnXHU1QjU3XHU0RjUzJyxcbiAgJ3NldHRpbmdzLnNpemUnOiAnXHU1QjU3XHU1M0Y3JyxcbiAgJ2NvbmZpZy50aXRsZSc6ICdcdTkxNERcdTdGNkUnLFxuICAnZm9udC5tb25vJzogJ1x1N0I0OVx1NUJCRFx1RkYwOFx1OUVEOFx1OEJBNFx1RkYwOScsXG4gICdmb250LnN5c3RlbSc6ICdcdTdDRkJcdTdFREZcdTVCNTdcdTRGNTMnLFxufSBhcyBjb25zdFxuXG4vKiogRW5nbGlzaCBkaWN0aW9uYXJ5LCBjaGVja2VkIGNvbXBsZXRlIGFnYWluc3QgdGhlIHpoIGtleSBzZXQuICovXG5jb25zdCBlbjogUmVjb3JkPGtleW9mIHR5cGVvZiB6aCwgc3RyaW5nPiA9IHtcbiAgJ2FjdGlvbi5sYWJlbCc6ICdDaGFuZ2VzJyxcbiAgJ2FjdGlvbi5hcmlhJzogJ1JldmlldyB3b3Jrc3BhY2UgYW5kIHBlci1yb3VuZCBjaGFuZ2VzJyxcbiAgJ3RhYi5zZXNzaW9uJzogJ1Nlc3Npb24nLFxuICAndGFiLndvcmtzcGFjZSc6ICdXb3Jrc3BhY2UnLFxuICAncmV2aWV3LnRpdGxlJzogJ0NoYW5nZXMnLFxuICAncmV2aWV3LmJyYW5jaCc6ICdicmFuY2gnLFxuICAncmV2aWV3LmRldGFjaGVkJzogJ2RldGFjaGVkIEhFQUQnLFxuICAncmV2aWV3Lm5vdFJlcG8nOiAnVGhpcyBkaXJlY3RvcnkgaXMgbm90IGEgZ2l0IHJlcG9zaXRvcnknLFxuICAncmV2aWV3Lm5vdFJlcG9IaW50JzogJ1RoZSBcIlNlc3Npb25cIiB0YWIgc3RpbGwgc2hvd3MgZXZlcnkgcm91bmRcXCdzIGNoYW5nZXMuJyxcbiAgJ3Jldmlldy5ub1Nlc3Npb25DaGFuZ2VzJzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBpbiB0aGlzIHNlc3Npb24geWV0JyxcbiAgJ3Jldmlldy5zZXNzaW9uU2Nhbic6ICdTY2FubmVkIHtyZXN1bHRzfSB0b29sIHJlc3VsdHM6IHtkaWZmfSB3aXRoIGRpZmZzLCB7cGF0aH0gcGF0aC1vbmx5IFx1MjAxNCB0ZXJtaW5hbCAoYmFzaCkgZWRpdHMgYXJlIG5vdCB0cmFja2VkIGluIHRoZSBzZXNzaW9uIGxvZy4nLFxuICAncmV2aWV3LmdvV29ya3NwYWNlJzogJ1ZpZXcgd29ya3NwYWNlIGNoYW5nZXMnLFxuICAncmV2aWV3LnNlc3Npb25TdGF0cyc6ICd7cm91bmRzfSByb3VuZHMgXHUwMEI3IHtmaWxlc30gZmlsZXMnLFxuICAncmV2aWV3LnJvdW5kJzogJ1JvdW5kIHtyb3VuZH0nLFxuICAncmV2aWV3LmVtcHR5JzogJ05vIHVuY29tbWl0dGVkIGNoYW5nZXMgXHVEODNDXHVERjg5JyxcbiAgJ3Jldmlldy5sb2FkRXJyb3InOiAnRmFpbGVkIHRvIGxvYWQnLFxuICAncmV2aWV3LmFjY2VwdCc6ICdBY2NlcHQnLFxuICAncmV2aWV3LnJldmVydCc6ICdSZXZlcnQnLFxuICAncmV2aWV3LmFjY2VwdEFsbCc6ICdBY2NlcHQgYWxsJyxcbiAgJ3Jldmlldy5yZXZlcnRBbGwnOiAnUmV2ZXJ0IGFsbCcsXG4gICdyZXZpZXcudW5zdGFnZSc6ICdVbnN0YWdlJyxcbiAgJ3Jldmlldy51bnN0YWdlQWxsJzogJ1Vuc3RhZ2UgYWxsJyxcbiAgJ2h1bmsuc3RhZ2UnOiAnU3RhZ2UnLFxuICAnaHVuay5yZXZlcnQnOiAnUmV2ZXJ0JyxcbiAgJ2h1bmsudW5zdGFnZSc6ICdVbnN0YWdlJyxcbiAgJ2h1bmsuc3RhZ2VkJzogJ3N0YWdlZCcsXG4gICdodW5rLnVuc3RhZ2VkJzogJ3Vuc3RhZ2VkJyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0JzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcmV2ZXJ0JyxcbiAgJ3Jldmlldy5jb25maXJtUmV2ZXJ0QWxsJzogJ0NsaWNrIGFnYWluIHRvIGNvbmZpcm0gcmV2ZXJ0IGFsbCcsXG4gICdyZXZpZXcuY29tbWl0JzogJ0NvbW1pdCcsXG4gICdyZXZpZXcuY29tbWl0UGxhY2Vob2xkZXInOiAnQ29tbWl0IG1lc3NhZ2VcdTIwMjYnLFxuICAncmV2aWV3LnB1c2gnOiAnUHVzaCcsXG4gICdyZXZpZXcuY29uZmlybVB1c2gnOiAnQ2xpY2sgYWdhaW4gdG8gY29uZmlybSBwdXNoJyxcbiAgJ3Jldmlldy5jb21taXR0ZWQnOiAnQ29tbWl0dGVkIHtzdW1tYXJ5fScsXG4gICdyZXZpZXcuY29tbWl0RmFpbGVkJzogJ0NvbW1pdCBmYWlsZWQnLFxuICAncmV2aWV3LnB1c2hlZCc6ICdQdXNoZWQnLFxuICAncmV2aWV3LnB1c2hGYWlsZWQnOiAnUHVzaCBmYWlsZWQnLFxuICAncmV2aWV3LmFoZWFkJzogJ3tufSBhaGVhZCcsXG4gICdyZXZpZXcuYmVoaW5kJzogJ3tufSBiZWhpbmQnLFxuICAncmV2aWV3LnNlY3Rpb25TdGFnZWQnOiAnU3RhZ2VkJyxcbiAgJ3Jldmlldy5zZWN0aW9uQ2hhbmdlcyc6ICdDaGFuZ2VzJyxcbiAgJ3Jldmlldy5zZWN0aW9uQnJhbmNoJzogJ0JyYW5jaCB2cyByZW1vdGUnLFxuICAncmV2aWV3Lm5vVXBzdHJlYW0nOiAnbm8gdXBzdHJlYW0nLFxuICAncmV2aWV3Lmhpc3RvcnknOiAnSGlzdG9yeScsXG4gICdyZXZpZXcuY29tbWl0RmlsZXMnOiAnRmlsZXMnLFxuICAnaGlzdG9yeS5sb2NhbCc6ICdsb2NhbCcsXG4gICdoaXN0b3J5LnJlbW90ZSc6ICdyZW1vdGUnLFxuICAndGltZS5ub3cnOiAnanVzdCBub3cnLFxuICAndGltZS5taW51dGVzJzogJ3tufSBtaW4gYWdvJyxcbiAgJ3RpbWUuaG91cnMnOiAne259IGggYWdvJyxcbiAgJ3RpbWUuZGF5cyc6ICd7bn0gZCBhZ28nLFxuICAncmV2aWV3LnJlZnJlc2gnOiAnUmVmcmVzaCcsXG4gICdyZXZpZXcuY2xvc2UnOiAnQ2xvc2UnLFxuICAncmV2aWV3LmJ1c3knOiAnV29ya2luZ1x1MjAyNicsXG4gICdyZXZpZXcuZG9uZSc6ICd7YWN0aW9ufSB7Y291bnR9IGZpbGVzJyxcbiAgJ3Jldmlldy5kb25lT25lJzogJ3thY3Rpb259IHtwYXRofScsXG4gICdyZXZpZXcuZG9uZURlbGV0ZWQnOiAne2FjdGlvbn0ge2NvdW50fSBmaWxlcyAoe2RlbGV0ZWR9IHVudHJhY2tlZCBkZWxldGVkKScsXG4gICdyZXZpZXcuYWNjZXB0ZWQnOiAnQWNjZXB0ZWQnLFxuICAncmV2aWV3LnJldmVydGVkJzogJ1JldmVydGVkJyxcbiAgJ3Jldmlldy51bnRyYWNrZWQnOiAndW50cmFja2VkJyxcbiAgJ3Jldmlldy5iaW5hcnknOiAnYmluYXJ5JyxcbiAgJ3Jldmlldy5ub0RpZmZEYXRhJzogJ05vIGRpZmYgZGF0YSBmb3IgdGhpcyBjaGFuZ2UnLFxuICAncmV2aWV3LmNoYW5nZXMnOiAne2FkZGVkfSsge2RlbGV0ZWR9LScsXG4gICd2aWV3LnNpbmdsZSc6ICdTaW5nbGUnLFxuICAndmlldy5zcGxpdCc6ICdTcGxpdCcsXG4gICd2aWV3LmJlZm9yZSc6ICdCZWZvcmUnLFxuICAndmlldy5hZnRlcic6ICdBZnRlcicsXG4gICdjb21tZW50LmFkZCc6ICdDb21tZW50IG9uIHRoaXMgbGluZScsXG4gICdjb21tZW50LnNob3cnOiAnVmlldyBjb21tZW50cycsXG4gICdjb21tZW50LnBsYWNlaG9sZGVyJzogJ0NvbW1lbnRcdTIwMjYgKEN0cmwvXHUyMzE4K0VudGVyIHRvIHNhdmUpJyxcbiAgJ2NvbW1lbnQuc2F2ZSc6ICdTYXZlJyxcbiAgJ2NvbW1lbnQuY2FuY2VsJzogJ0NhbmNlbCcsXG4gICdjb21tZW50LmRlbGV0ZSc6ICdEZWxldGUnLFxuICAnY29tbWVudC5lZGl0JzogJ0VkaXQnLFxuICAnY29tbWVudC5zYXZlZCc6ICdDb21tZW50IHNhdmVkJyxcbiAgJ2NvbW1lbnQuZmFpbGVkJzogJ0ZhaWxlZCB0byBzYXZlIGNvbW1lbnQnLFxuICAnc2NvcGUubGFiZWwnOiAnU2NvcGUnLFxuICAnc2NvcGUuYWxsJzogJ0FsbCcsXG4gICdzY29wZS51bnN0YWdlZCc6ICdVbnN0YWdlZCcsXG4gICdzY29wZS5zdGFnZWQnOiAnU3RhZ2VkJyxcbiAgJ3Njb3BlLmNvbW1pdCc6ICdDb21taXQnLFxuICAnc2NvcGUuYnJhbmNoJzogJ0JyYW5jaCcsXG4gICdzY29wZS5sYXN0LXR1cm4nOiAnTGFzdCB0dXJuJyxcbiAgJ3Jldmlldy5sYXN0VHVybkVtcHR5JzogJ05vIGZpbGUgY2hhbmdlcyByZWNvcmRlZCBmb3IgdGhlIGxhc3QgdHVybiBcdTIwMTQgdGVybWluYWwgY29tbWFuZHMgKGJhc2gpIHRoYXQgZWRpdCBmaWxlcyBhcmUgbm90IHRyYWNrZWQgaW4gdGhlIHNlc3Npb24gbG9nOyBzd2l0Y2ggdG8gXCJBbGxcIiB0byBzZWUgZ2l0IGNoYW5nZXMnLFxuICAnc2NvcGUuYmFzZSc6ICdCYXNlIGJyYW5jaCcsXG4gICdzY29wZS5icmFuY2hSZWFkb25seSc6ICdCcmFuY2ggc2NvcGUgaXMgcmVhZC1vbmx5IChtZXJnZS1iYXNlIGRpZmY7IG5vIGFjY2VwdC9yZXZlcnQpJyxcbiAgJ3Jldmlldy5zZWxlY3RDb21taXQnOiAnU2VsZWN0IGEgY29tbWl0IGZyb20gdGhlIGxlZnQgdG8gdmlldyBpdHMgZGlmZicsXG4gICdyZXZpZXcuc2VuZFRvQWdlbnQnOiAnU2VuZCB0byBhZ2VudCcsXG4gICdyZXZpZXcuc2VuZFRpdGxlJzogJ1NlbmQgaW5saW5lIGNvbW1lbnRzIHRvIHRoZSBhZ2VudCcsXG4gICdyZXZpZXcuc2VuZEhpbnQnOiAnQ29tbWVudHMgYXJlIGluamVjdGVkIGludG8gdGhlIGN1cnJlbnQgc2Vzc2lvbiBhcyByZXZpZXcgZ3VpZGFuY2UgKEFkZHJlc3MgdGhlIGlubGluZSBjb21tZW50cykuIEZhbGxzIGJhY2sgdG8gY29weWFibGUgdGV4dCBpZiBzZW5kaW5nIGZhaWxzLicsXG4gICdyZXZpZXcuc2VudFRvQWdlbnQnOiAnU2VudCB0byBhZ2VudCcsXG4gICdyZXZpZXcuY29weSc6ICdDb3B5IHRleHQnLFxuICAncmV2aWV3LmNvcGllZCc6ICdDb3BpZWQnLFxuICAncmV2aWV3LmNvcHlGYWlsZWQnOiAnQ29weSBmYWlsZWQnLFxuICAncmV2aWV3LnJldmlldyc6ICdSZXZpZXcnLFxuICAncmV2aWV3LnJldmlld2luZyc6ICdSZXZpZXdpbmdcdTIwMjYnLFxuICAncmV2aWV3LnJldmlld0ZhaWxlZCc6ICdSZXZpZXcgZmFpbGVkJyxcbiAgJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCc6ICdQYXRjaCBpcyBjb3JyZWN0IFx1MjcxMycsXG4gICdyZXZpZXcudmVyZGljdEluY29ycmVjdCc6ICdQYXRjaCBuZWVkcyB3b3JrIFx1MjcxNycsXG4gICdyZXZpZXcubm9GaW5kaW5ncyc6ICdObyBpc3N1ZXMgZm91bmQnLFxuICAncmV2aWV3LmZpbmRpbmdzJzogJ3tufSBmaW5kaW5ncycsXG4gICdyZXZpZXcuY29uZmlkZW5jZSc6ICdjb25maWRlbmNlIHtjb25maWRlbmNlfScsXG4gICdyZXZpZXcuc3VnZ2VzdGlvbic6ICdTdWdnZXN0aW9uJyxcbiAgJ3Jldmlldy5zZW5kRmluZGluZ3MnOiAnU2VuZCBmaW5kaW5ncyB0byBhZ2VudCcsXG4gICdyZXZpZXcuc2VudEZpbmRpbmdzJzogJ0ZpbmRpbmdzIHNlbnQgdG8gYWdlbnQnLFxuICAncmV2aWV3LnJldmlld1Njb3BlJzogJ1JldmlldyBzY29wZScsXG4gICdwci50aXRsZSc6ICdQUiAje251bWJlcn0nLFxuICAncHIuY29tbWVudHMnOiAnUFIgY29tbWVudHMgKHtufSknLFxuICAncHIubm9Qcic6ICdObyBhc3NvY2lhdGVkIFBSJyxcbiAgJ3ByLnNlbmRDb21tZW50cyc6ICdTZW5kIFBSIGNvbW1lbnRzIHRvIGFnZW50JyxcbiAgJ2VkaXRvci5vcGVuRmlsZSc6ICdPcGVuIGluIGVkaXRvcicsXG4gICdlZGl0b3Iub3BlbkxpbmUnOiAnT3BlbiB0aGlzIGxpbmUgaW4gZWRpdG9yJyxcbiAgJ2VkaXRvci5mYWlsZWQnOiAnRmFpbGVkIHRvIG9wZW4nLFxuICAncmVwby5sYWJlbCc6ICdSZXBvJyxcbiAgJ3Jldmlldy5kb2NrQ29tbWVudHMnOiAne259IGlubGluZSBjb21tZW50cycsXG4gICdyZXZpZXcuZG9ja1ZlcmRpY3QnOiAndmVyZGljdCBwZW5kaW5nJyxcbiAgJ3Jldmlldy5kb2NrU2VuZCc6ICdDbGljayB0byBzZW5kJyxcbiAgJ3Jldmlldy5jb3BpZWRGYWxsYmFjayc6ICdTZXNzaW9uIHVuYXZhaWxhYmxlIFx1MjAxNCBjb21tZW50cyBjb3BpZWQgKHBhc3RlIHRvIHNlbmQpJyxcbiAgJ3Jldmlldy5zZW5kRmFpbGVkJzogJ0ZhaWxlZCB0byBzZW5kIGNvbW1lbnRzJyxcbiAgJ3Jldmlldy5kb2NrSnVtcCc6ICdPcGVuIHRoZSBtYXRjaGluZyBjaGFuZ2UgaW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuZG9ja01vcmUnOiAne259IG1vcmUgY29tbWVudHMgXHUyMDE0IG9wZW4gdGhlIHJldmlldyBwYW5lbCcsXG4gICdyZXZpZXcuY2FyZFRpdGxlJzogJ0lubGluZSByZXZpZXcnLFxuICAncmV2aWV3LmNhcmRDb21tZW50cyc6ICd7bn0gY29tbWVudHMnLFxuICAncmV2aWV3LmNhcmRWZXJkaWN0JzogJ0FJIHJldmlldyB2ZXJkaWN0JyxcbiAgJ3Jldmlldy5jYXJkSnVtcCc6ICdKdW1wIHRvIHRoZSBtYXRjaGluZyBjb2RlIGluIHRoZSByZXZpZXcgcGFuZWwnLFxuICAncmV2aWV3LmNhcmRPcGVuRmlsZSc6ICdPcGVuIHRoaXMgZmlsZSBpbiB0aGUgcmV2aWV3IHBhbmVsJyxcbiAgJ3Jldmlldy5jYXJkSGludCc6ICdDbGljayBhIGNvbW1lbnQgdG8ganVtcCB0byB0aGUgbWF0Y2hpbmcgY2hhbmdlIGJsb2NrJyxcbiAgJ3Jldmlldy50dXJuU3VtbWFyeVRpdGxlJzogJ0VkaXRlZCB7bn0gZmlsZXMnLFxuICAncmV2aWV3LnR1cm5TdW1tYXJ5UmV2aWV3JzogJ1JldmlldycsXG4gICdmaWxlcy50aXRsZSc6ICdGaWxlcycsXG4gICdmaWxlcy5zZWFyY2gnOiAnRmlsdGVyIGZpbGVzXHUyMDI2JyxcbiAgJ2ZpbGVzLnNhdmUnOiAnU2F2ZScsXG4gICdmaWxlcy5zYXZlZCc6ICdTYXZlZCcsXG4gICdmaWxlcy5sb2FkaW5nJzogJ0xvYWRpbmdcdTIwMjYnLFxuICAnZmlsZXMuZW1wdHknOiAnTm8gbWF0Y2hpbmcgZmlsZXMnLFxuICAvLyBmYWxsYmFjay4qOiBsYWJlbHMgb2YgdGhlIGJ1aWx0LWluIGltYWdlIGZhbGxiYWNrIHZpZXdlciAoRmFsbGJhY2tVc2VyQnViYmxlKSxcbiAgLy8gdXNlZCB3aGVuIGEgcGxhaW4gdXNlciBtZXNzYWdlIGNhcnJpZXMgaW1hZ2VzLlxuICAnZmFsbGJhY2suaW1hZ2UnOiAnSW1hZ2UnLFxuICAnZmFsbGJhY2sub3Blbic6ICdWaWV3IG9yaWdpbmFsJyxcbiAgJ2ZhbGxiYWNrLm9wZW5OYW1lZCc6ICdWaWV3IG9yaWdpbmFsIHtuYW1lfScsXG4gICdmYWxsYmFjay5sb2FkaW5nJzogJ0xvYWRpbmdcdTIwMjYnLFxuICAnZmFsbGJhY2subG9hZEZhaWxlZCc6ICdGYWlsZWQgdG8gbG9hZCcsXG4gICdmYWxsYmFjay5saWdodGJveERpYWxvZyc6ICdJbWFnZSBwcmV2aWV3JyxcbiAgJ2ZhbGxiYWNrLmxpZ2h0Ym94Q2xvc2UnOiAnQ2xvc2UnLFxuICAnc2V0dGluZ3MudGl0bGUnOiAnQ2hhbmdlcycsXG4gICdzZXR0aW5ncy5mb250JzogJ0ZvbnQnLFxuICAnc2V0dGluZ3Muc2l6ZSc6ICdGb250IHNpemUnLFxuICAnY29uZmlnLnRpdGxlJzogJ0NvbmZpZ3VyYXRpb24nLFxuICAnZm9udC5tb25vJzogJ01vbm9zcGFjZSAoZGVmYXVsdCknLFxuICAnZm9udC5zeXN0ZW0nOiAnU3lzdGVtIGZvbnQnLFxufVxuXG50eXBlIERpZmZSZXZpZXdBY3Rpb25Qcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLnNlc3Npb24uaGVhZGVyLmFjdGlvbnMnPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+XG50eXBlIERpZmZSZXZpZXdPdmVybGF5UHJvcHMgPSBQcm9wc1J1bnRpbWU8J3NoZWxsLm92ZXJsYXknPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYgeyBzZXNzaW9uczogSVNlc3Npb25zIH1cbnR5cGUgVHVyblN1bW1hcnlQcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLmNoYXQudHVyblRhaWwnPiAmXG4gIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYge1xuICAgIG1hdGNoZWQ6IHsgdHVybjogeyB0dXJuOiBudW1iZXI7IHN0YXJ0PzogeyBzZXE6IG51bWJlciB9OyBlbmQ/OiB7IHNlcTogbnVtYmVyIH0gfSB9XG4gIH1cblxuLyoqIERpZmYgaWNvbiAobHVjaWRlIGZpbGUtZGlmZikuICovXG5mdW5jdGlvbiBJY29uRGlmZigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTUgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjdaXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOSAxMGg2XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNMTIgN3Y2XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNOSAxN2g2XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uWCgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTggNiA2IDE4XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJtNiA2IDEyIDEyXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ29tbWVudCgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMjEgMTVhMiAyIDAgMCAxLTIgMkg3bC00IDRWNWEyIDIgMCAwIDEgMi0yaDE0YTIgMiAwIDAgMSAyIDJ6XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ2hldnJvbkRvd24oKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjEyXCIgaGVpZ2h0PVwiMTJcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwibTYgOSA2IDYgNi02XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5mdW5jdGlvbiBJY29uQ2hlY2soKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjEyXCIgaGVpZ2h0PVwiMTJcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjIuNVwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMjAgNiA5IDE3bC01LTVcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbnR5cGUgVmlld01vZGUgPSAnc2luZ2xlJyB8ICdzcGxpdCdcblxuLyoqIFx1NTM1NVx1NjgwRiAvIFx1NTNDQ1x1NjgwRiBzZWdtZW50ZWQgdG9nZ2xlIChwZXJzaXN0ZWQgYWNyb3NzIG9wZW5zKS4gKi9cbmZ1bmN0aW9uIERpZmZWaWV3VG9nZ2xlKHsgdmlldywgb25DaGFuZ2UsIHQgfTogeyB2aWV3OiBWaWV3TW9kZTsgb25DaGFuZ2U6ICh2OiBWaWV3TW9kZSkgPT4gdm9pZDsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdmlldy10b2dnbGVcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPXt0KCd2aWV3LnNpbmdsZScpfT5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17YGRzZHItdmlldy1idG4ke3ZpZXcgPT09ICdzaW5nbGUnID8gJyBkc2RyLXZpZXctYnRuLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICBhcmlhLXByZXNzZWQ9e3ZpZXcgPT09ICdzaW5nbGUnfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZSgnc2luZ2xlJyl9XG4gICAgICA+XG4gICAgICAgIHt0KCd2aWV3LnNpbmdsZScpfVxuICAgICAgPC9idXR0b24+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLXZpZXctYnRuJHt2aWV3ID09PSAnc3BsaXQnID8gJyBkc2RyLXZpZXctYnRuLWFjdGl2ZScgOiAnJ31gfVxuICAgICAgICBhcmlhLXByZXNzZWQ9e3ZpZXcgPT09ICdzcGxpdCd9XG4gICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlKCdzcGxpdCcpfVxuICAgICAgPlxuICAgICAgICB7dCgndmlldy5zcGxpdCcpfVxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFR3by1jb2x1bW4gc2lkZS1ieS1zaWRlIGRpZmYgYm9keSAob2xkIGxlZnQsIG5ldyByaWdodCwgbGluZSBudW1iZXJzIGFsaWduZWQpLiAqL1xuZnVuY3Rpb24gU3BsaXREaWZmKHsgYmxvY2tzLCBiZWZvcmVMYWJlbCwgYWZ0ZXJMYWJlbCB9OiB7IGJsb2NrczogU3BsaXRCbG9ja1tdOyBiZWZvcmVMYWJlbDogc3RyaW5nOyBhZnRlckxhYmVsOiBzdHJpbmcgfSkge1xuICBpZiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICA8c3Bhbj57YmVmb3JlTGFiZWx9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgICA8c3Bhbj57YWZ0ZXJMYWJlbH08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7YmxvY2tzLm1hcCgoYmxvY2ssIGJpKSA9PiAoXG4gICAgICAgICAgPGRpdiBrZXk9e2JpfT5cbiAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtyaX0gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1yb3dcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5sZWZ0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1kZWwnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPntyb3cubGVmdE51bSA/PyAnJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LXRleHRcIj57cm93LmxlZnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LnJpZ2h0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1hZGQnIDogJyd9YH0+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPntyb3cucmlnaHROdW0gPz8gJyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5yaWdodH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIFBlci1odW5rIGFjdGlvbiBiYXIgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkgZm9yIHdvcmtzcGFjZSBkaWZmcy4gKi9cbmZ1bmN0aW9uIEh1bmtUb29sYmFyKHtcbiAgaHVuayxcbiAgYnVzeSxcbiAgb25BY3Rpb24sXG4gIHQsXG59OiB7XG4gIGh1bms6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmsgfCB1bmRlZmluZWRcbiAgYnVzeTogYm9vbGVhblxuICBvbkFjdGlvbjogKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuaykgPT4gdm9pZFxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbn0pIHtcbiAgaWYgKCFodW5rKSByZXR1cm4gbnVsbFxuICBjb25zdCBzdGFnZWQgPSBodW5rLmxheWVyID09PSAnc3RhZ2VkJ1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1odW5rLWJhclwiPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1odW5rLWxheWVyXCI+e3N0YWdlZCA/IHQoJ2h1bmsuc3RhZ2VkJykgOiB0KCdodW5rLnVuc3RhZ2VkJyl9PC9zcGFuPlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1odW5rLWFjdGlvbiBkc2RyLWh1bmstYWN0aW9uLXN0YWdlXCIgdGl0bGU9e3N0YWdlZCA/IHQoJ2h1bmsudW5zdGFnZScpIDogdCgnaHVuay5zdGFnZScpfSBhcmlhLWxhYmVsPXtzdGFnZWQgPyB0KCdodW5rLnVuc3RhZ2UnKSA6IHQoJ2h1bmsuc3RhZ2UnKX0gZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uQWN0aW9uKHN0YWdlZCA/ICd1bnN0YWdlJyA6ICdhY2NlcHQnLCBodW5rKX0+XG4gICAgICAgIHtzdGFnZWQgPyAnXHUyMjEyJyA6ICcrJ31cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1odW5rLWFjdGlvbiBkc2RyLWh1bmstYWN0aW9uLXJldmVydFwiIHRpdGxlPXt0KCdodW5rLnJldmVydCcpfSBhcmlhLWxhYmVsPXt0KCdodW5rLnJldmVydCcpfSBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25BY3Rpb24oJ3JldmVydCcsIGh1bmspfT5cdTIxQjY8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogSHVua3Mgb2YgYGRpZmZgIHdob3NlIG9sZCBvciBuZXcgbGluZSByYW5nZSBjb3ZlcnMgYW55IG9mIGBsaW5lc2AuICovXG5mdW5jdGlvbiBodW5rc0ZvckxpbmVzKGRpZmY6IHN0cmluZywgbGluZXM6IChudW1iZXIgfCBudWxsKVtdKTogc3RyaW5nIHtcbiAgY29uc3QgdGFyZ2V0cyA9IG5ldyBTZXQobGluZXMuZmlsdGVyKChsKTogbCBpcyBudW1iZXIgPT4gbCAhPT0gbnVsbCkpXG4gIGlmICh0YXJnZXRzLnNpemUgPT09IDApIHJldHVybiAnJ1xuICBjb25zdCBibG9ja3MgPSBwYXJzZUdpdEJsb2NrcyhkaWZmKVxuICBjb25zdCBwYXJ0czogc3RyaW5nW10gPSBbXVxuICBmb3IgKGNvbnN0IGJsb2NrIG9mIGJsb2Nrcykge1xuICAgIGlmIChibG9jay5oZWFkPy5raW5kICE9PSAnaHVuaycpIGNvbnRpbnVlXG4gICAgY29uc3Qgc3RhcnRzID0gaHVua1N0YXJ0cyhibG9jay5oZWFkLnRleHQpXG4gICAgbGV0IG9sZExpbmUgPSBzdGFydHMub2xkU3RhcnRcbiAgICBsZXQgbmV3TGluZSA9IHN0YXJ0cy5uZXdTdGFydFxuICAgIGxldCBvTWluID0gSW5maW5pdHlcbiAgICBsZXQgb01heCA9IC1JbmZpbml0eVxuICAgIGxldCBuTWluID0gSW5maW5pdHlcbiAgICBsZXQgbk1heCA9IC1JbmZpbml0eVxuICAgIGZvciAoY29uc3Qgcm93IG9mIGJsb2NrLnJvd3MpIHtcbiAgICAgIGlmIChyb3cua2luZCA9PT0gJ2N0eCcpIHtcbiAgICAgICAgaWYgKG9sZExpbmUgPCBvTWluKSBvTWluID0gb2xkTGluZVxuICAgICAgICBpZiAob2xkTGluZSA+IG9NYXgpIG9NYXggPSBvbGRMaW5lXG4gICAgICAgIGlmIChuZXdMaW5lIDwgbk1pbikgbk1pbiA9IG5ld0xpbmVcbiAgICAgICAgaWYgKG5ld0xpbmUgPiBuTWF4KSBuTWF4ID0gbmV3TGluZVxuICAgICAgICBvbGRMaW5lKytcbiAgICAgICAgbmV3TGluZSsrXG4gICAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnYWRkJykge1xuICAgICAgICBpZiAobmV3TGluZSA8IG5NaW4pIG5NaW4gPSBuZXdMaW5lXG4gICAgICAgIGlmIChuZXdMaW5lID4gbk1heCkgbk1heCA9IG5ld0xpbmVcbiAgICAgICAgbmV3TGluZSsrXG4gICAgICB9IGVsc2UgaWYgKHJvdy5raW5kID09PSAnZGVsJykge1xuICAgICAgICBpZiAob2xkTGluZSA8IG9NaW4pIG9NaW4gPSBvbGRMaW5lXG4gICAgICAgIGlmIChvbGRMaW5lID4gb01heCkgb01heCA9IG9sZExpbmVcbiAgICAgICAgb2xkTGluZSsrXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhpdCA9IFsuLi50YXJnZXRzXS5zb21lKFxuICAgICAgKGwpID0+IChvTWluIDw9IGwgJiYgbCA8PSBvTWF4KSB8fCAobk1pbiA8PSBsICYmIGwgPD0gbk1heCksXG4gICAgKVxuICAgIGlmIChoaXQpIHBhcnRzLnB1c2goW2Jsb2NrLmhlYWQudGV4dCwgLi4uYmxvY2sucm93cy5tYXAoKHIpID0+IHIudGV4dCldLmpvaW4oJ1xcbicpKVxuICB9XG4gIHJldHVybiBwYXJ0cy5qb2luKCdcXG4nKVxufVxuXG4vKiogVW5pZmllZCBkaWZmIHJvd3Mgd2l0aCBvbGQvbmV3IGxpbmUgbnVtYmVycyB0cmFja2VkIHRocm91Z2ggaHVua3MuICovXG5mdW5jdGlvbiB1bmlmaWVkUm93c1dpdGhMaW5lcyhyb3dzOiBEaWZmUm93W10sIG9sZFN0YXJ0OiBudW1iZXIsIG5ld1N0YXJ0OiBudW1iZXIpOiB7IHJvdzogRGlmZlJvdzsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9W10ge1xuICBsZXQgb2xkTGluZSA9IG9sZFN0YXJ0XG4gIGxldCBuZXdMaW5lID0gbmV3U3RhcnRcbiAgcmV0dXJuIHJvd3MubWFwKChyb3cpID0+IHtcbiAgICBpZiAocm93LmtpbmQgPT09ICdjdHgnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG9sZExpbmUrKywgbmV3TGluZTogbmV3TGluZSsrIH1cbiAgICBpZiAocm93LmtpbmQgPT09ICdhZGQnKSByZXR1cm4geyByb3csIG9sZExpbmU6IG51bGwsIG5ld0xpbmU6IG5ld0xpbmUrKyB9XG4gICAgaWYgKHJvdy5raW5kID09PSAnZGVsJykgcmV0dXJuIHsgcm93LCBvbGRMaW5lOiBvbGRMaW5lKyssIG5ld0xpbmU6IG51bGwgfVxuICAgIHJldHVybiB7IHJvdywgb2xkTGluZTogbnVsbCwgbmV3TGluZTogbnVsbCB9XG4gIH0pXG59XG5cbi8qKiBNYXRjaCBhIGNvbW1lbnQgYWdhaW5zdCBhIHJvdydzIGFuY2hvcnMgKGJvdGggbXVzdCBhZ3JlZSB3aGVuIHNldCkuICovXG5mdW5jdGlvbiBjb21tZW50TWF0Y2hlcyhjb21tZW50OiBSZXZpZXdDb21tZW50LCBvbGRMaW5lOiBudW1iZXIgfCBudWxsLCBuZXdMaW5lOiBudW1iZXIgfCBudWxsKTogYm9vbGVhbiB7XG4gIGlmIChjb21tZW50LmxpbmVOZXcgIT09IG51bGwgJiYgY29tbWVudC5saW5lTmV3ICE9PSBuZXdMaW5lKSByZXR1cm4gZmFsc2VcbiAgaWYgKGNvbW1lbnQubGluZU9sZCAhPT0gbnVsbCAmJiBjb21tZW50LmxpbmVPbGQgIT09IG9sZExpbmUpIHJldHVybiBmYWxzZVxuICByZXR1cm4gdHJ1ZVxufVxuXG4vKiogSG92ZXItdG8tY29tbWVudCBhZmZvcmRhbmNlIGluIHRoZSBsaW5lLW51bWJlciBndXR0ZXIuIExpbmVzIHRoYXQgYWxyZWFkeVxuICogaGF2ZSBjb21tZW50cyBzaG93IGEgbm9uLWludGVyYWN0aXZlIGNvdW50IGJhZGdlICh0aGUgc2F2ZWQgYm94ZXMgYmVsb3cgdGhlXG4gKiBsaW5lIGFyZSB0aGUgdmlldyk7IHRoZSArIG9ubHkgYXBwZWFycyBvbiBjb21tZW50LWZyZWUgbGluZXMgdG8gYWRkIG9uZS4gKi9cbmZ1bmN0aW9uIENvbW1lbnRMaW5lKHsgY291bnQsIG9uT3BlbiwgdCB9OiB7IGNvdW50OiBudW1iZXI7IG9uT3BlbjogKCkgPT4gdm9pZDsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgaWYgKGNvdW50ID4gMCkge1xuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtYWRkIGRzZHItY29tbWVudC1oYXNcIiB0aXRsZT17dCgnY29tbWVudC5zaG93Jyl9IGFyaWEtbGFiZWw9e3QoJ2NvbW1lbnQuc2hvdycpfT5cbiAgICAgICAge2NvdW50fVxuICAgICAgPC9zcGFuPlxuICAgIClcbiAgfVxuICByZXR1cm4gKFxuICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hZGRcIiB0aXRsZT17dCgnY29tbWVudC5hZGQnKX0gYXJpYS1sYWJlbD17dCgnY29tbWVudC5hZGQnKX0gb25DbGljaz17b25PcGVufT5cbiAgICAgICtcbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG4vKiogVGhlIGlubGluZSBjb21tZW50IGVkaXRvciwgcmVuZGVyZWQgYXMgaXRzIG93biByb3cuICovXG5mdW5jdGlvbiBDb21tZW50RWRpdG9yKHtcbiAgdGV4dCxcbiAgb25UZXh0LFxuICBvblNhdmUsXG4gIG9uQ2FuY2VsLFxuICBidXN5LFxuICB0LFxufToge1xuICB0ZXh0OiBzdHJpbmdcbiAgb25UZXh0OiAodjogc3RyaW5nKSA9PiB2b2lkXG4gIG9uU2F2ZTogKCkgPT4gdm9pZFxuICBvbkNhbmNlbDogKCkgPT4gdm9pZFxuICBidXN5OiBib29sZWFuXG4gIHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZ1xufSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWVkaXRvclwiPlxuICAgICAgPHRleHRhcmVhXG4gICAgICAgIGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1pbnB1dFwiXG4gICAgICAgIHZhbHVlPXt0ZXh0fVxuICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgcm93cz17Mn1cbiAgICAgICAgcGxhY2Vob2xkZXI9e3QoJ2NvbW1lbnQucGxhY2Vob2xkZXInKX1cbiAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25UZXh0KGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgIG9uS2V5RG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIG9uQ2FuY2VsKClcbiAgICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInICYmIChldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXkpKSBvblNhdmUoKVxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21tZW50LWFjdGlvbnNcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8ICF0ZXh0LnRyaW0oKX0gb25DbGljaz17b25TYXZlfT5cbiAgICAgICAgICB7dCgnY29tbWVudC5zYXZlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXtvbkNhbmNlbH0+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIEEgc2F2ZWQgaW5saW5lIGNvbW1lbnQsIHJlbmRlcmVkIGV4YWN0bHkgbGlrZSB0aGUgY29tbWVudCBlZGl0b3IgXHUyMDE0IHRoZSBib3hcbiAqIGlzIHJlYWQtb25seSB1bnRpbCBFZGl0IGlzIHByZXNzZWQsIHRoZW4gaXQgYmVjb21lcyB0aGUgZWRpdGFibGUgZWRpdG9yLiAqL1xuZnVuY3Rpb24gQ29tbWVudEJveCh7IGNvbW1lbnQsIGJ1c3ksIG9uVXBkYXRlLCBvbkRlbGV0ZSwgdCB9OiB7IGNvbW1lbnQ6IFJldmlld0NvbW1lbnQ7IGJ1c3k6IGJvb2xlYW47IG9uVXBkYXRlOiAoaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nKSA9PiBQcm9taXNlPGJvb2xlYW4+OyBvbkRlbGV0ZTogKGlkOiBzdHJpbmcpID0+IHZvaWQ7IHQ6IChrZXk6IGtleW9mIHR5cGVvZiB6aCwgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHN0cmluZyB9KSB7XG4gIGNvbnN0IFtlZGl0aW5nLCBzZXRFZGl0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbdGV4dCwgc2V0VGV4dF0gPSB1c2VTdGF0ZShjb21tZW50LnRleHQpXG4gIGlmIChlZGl0aW5nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxDb21tZW50RWRpdG9yXG4gICAgICAgIHRleHQ9e3RleHR9XG4gICAgICAgIG9uVGV4dD17c2V0VGV4dH1cbiAgICAgICAgb25TYXZlPXsoKSA9PlxuICAgICAgICAgIHZvaWQgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGlmIChhd2FpdCBvblVwZGF0ZShjb21tZW50LmlkLCB0ZXh0LnRyaW0oKSkpIHNldEVkaXRpbmcoZmFsc2UpXG4gICAgICAgICAgfSkoKVxuICAgICAgICB9XG4gICAgICAgIG9uQ2FuY2VsPXsoKSA9PiB7XG4gICAgICAgICAgc2V0VGV4dChjb21tZW50LnRleHQpXG4gICAgICAgICAgc2V0RWRpdGluZyhmYWxzZSlcbiAgICAgICAgfX1cbiAgICAgICAgYnVzeT17YnVzeX1cbiAgICAgICAgdD17dH1cbiAgICAgIC8+XG4gICAgKVxuICB9XG4gIC8qKiBKdW1wIHRvIHRoZSBjb21tZW50J3MgY2hhbmdlIGJsb2NrIGluIHRoZSByZXZpZXcgcGFuZWwgKGxpa2UgdGhlIGRvY2sgY2hpcHMpLiAqL1xuICBjb25zdCBqdW1wID0gKCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuZm9jdXMgPSB7XG4gICAgICAgIHBhdGg6IGNvbW1lbnQucGF0aCxcbiAgICAgICAgbGluZTogY29tbWVudC5saW5lTmV3ID8/IGNvbW1lbnQubGluZU9sZCA/PyB1bmRlZmluZWQsXG4gICAgICAgIHRhYjogY29tbWVudC5zb3VyY2UgPT09ICdzZXNzaW9uJyA/ICdzZXNzaW9uJyA6ICd3b3Jrc3BhY2UnLFxuICAgICAgfVxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWNvbW1lbnQtZWRpdG9yXCI+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXNhdmVkLWNvbW1lbnQtanVtcFwiXG4gICAgICAgIHRpdGxlPXt0KCdyZXZpZXcuZG9ja0p1bXAnKX1cbiAgICAgICAgb25DbGljaz17anVtcH1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zYXZlZC1jb21tZW50LWxvY1wiPlxuICAgICAgICAgIHtjb21tZW50LnBhdGh9XG4gICAgICAgICAge2NvbW1lbnQubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjb21tZW50LmxpbmVOZXd9YCA6IGNvbW1lbnQubGluZU9sZCAhPT0gbnVsbCA/IGAgKG9sZDoke2NvbW1lbnQubGluZU9sZH0pYCA6ICcnfVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1pbnB1dCBkc2RyLXNhdmVkLWNvbW1lbnQtdmlld1wiPntjb21tZW50LnRleHR9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWJ0blwiXG4gICAgICAgICAgZGlzYWJsZWQ9e2J1c3l9XG4gICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIHNldFRleHQoY29tbWVudC50ZXh0KVxuICAgICAgICAgICAgc2V0RWRpdGluZyh0cnVlKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7dCgnY29tbWVudC5lZGl0Jyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tZGFuZ2VyXCJcbiAgICAgICAgICBkaXNhYmxlZD17YnVzeX1cbiAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgb25EZWxldGUoY29tbWVudC5pZClcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3QoJ2NvbW1lbnQuZGVsZXRlJyl9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIE9uZSBBSS1yZXZpZXcgZmluZGluZyByZW5kZXJlZCBhcyBhbiBpbmxpbmUgY2FyZCAoQ29kZXgtc3R5bGUpLiAqL1xuZnVuY3Rpb24gRmluZGluZ0NhcmQoeyBmaW5kaW5nLCB0IH06IHsgZmluZGluZzogUmV2aWV3RmluZGluZzsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YGRzZHItZmluZGluZy1jYXJkIGRzZHItZmluZGluZy0ke2ZpbmRpbmcucHJpb3JpdHl9YH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLWhlYWRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLXRhZyBkc2RyLWZpbmRpbmctJHtmaW5kaW5nLnByaW9yaXR5fWB9PntmaW5kaW5nLnByaW9yaXR5fTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtdGl0bGVcIj57ZmluZGluZy50aXRsZX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLWxvY1wiPlxuICAgICAgICAgIHtmaW5kaW5nLmZpbGV9OntmaW5kaW5nLmxpbmVTdGFydH17ZmluZGluZy5saW5lRW5kICE9PSBmaW5kaW5nLmxpbmVTdGFydCA/IGAtJHtmaW5kaW5nLmxpbmVFbmR9YCA6ICcnfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIHtmaW5kaW5nLmRldGFpbCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtZGV0YWlsXCI+e2ZpbmRpbmcuZGV0YWlsfTwvZGl2PiA6IG51bGx9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmluZGluZy1jYXJkLW1ldGFcIj5cbiAgICAgICAge3QoJ3Jldmlldy5jb25maWRlbmNlJywgeyBjb25maWRlbmNlOiBmaW5kaW5nLmNvbmZpZGVuY2UudG9GaXhlZCgyKSB9KX1cbiAgICAgIDwvZGl2PlxuICAgICAge2ZpbmRpbmcuc3VnZ2VzdGlvbiA/IDxwcmUgY2xhc3NOYW1lPVwiZHNkci1maW5kaW5nLWNhcmQtc3VnZ2VzdGlvblwiPntmaW5kaW5nLnN1Z2dlc3Rpb259PC9wcmU+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogVW5pZmllZCBkaWZmIHdpdGggcGVyLWh1bmsgYWN0aW9uIGJhcnMgYW5kIGlubGluZSBjb21tZW50cyAod29ya3NwYWNlIGZpbGVzKS4gKi9cbmZ1bmN0aW9uIFVuaWZpZWREaWZmKHtcbiAgZGlmZixcbiAgaHVua3MsXG4gIGJ1c3ksXG4gIG9uSHVua0FjdGlvbixcbiAgdCxcbiAgY29tbWVudHMsXG4gIGNvbW1lbnRFZGl0b3IsXG4gIGNvbW1lbnRUZXh0LFxuICBvbkNvbW1lbnRUZXh0LFxuICBvbk9wZW5Db21tZW50LFxuICBvblNhdmVDb21tZW50LFxuICBvbkNhbmNlbENvbW1lbnQsXG4gIG9uRGVsZXRlQ29tbWVudCxcbiAgb25VcGRhdGVDb21tZW50LFxuICByZWFkT25seSxcbiAgcGF0aCxcbiAgcmV2aWV3RmluZGluZ3MsXG4gIG9uT3BlbkxpbmUsXG4gIGp1bXBMaW5lLFxufToge1xuICBkaWZmOiBzdHJpbmdcbiAgaHVua3M6IGltcG9ydCgnLi4vc2hhcmVkL3R5cGVzLnRzJykuRGlmZkh1bmtbXVxuICBidXN5OiBib29sZWFuXG4gIG9uSHVua0FjdGlvbjogKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogaW1wb3J0KCcuLi9zaGFyZWQvdHlwZXMudHMnKS5EaWZmSHVuaykgPT4gdm9pZFxuICB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmdcbiAgY29tbWVudHM/OiBSZXZpZXdDb21tZW50W11cbiAgY29tbWVudEVkaXRvcj86IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9IHwgbnVsbFxuICBjb21tZW50VGV4dD86IHN0cmluZ1xuICBvbkNvbW1lbnRUZXh0PzogKHY6IHN0cmluZykgPT4gdm9pZFxuICBvbk9wZW5Db21tZW50PzogKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpID0+IHZvaWRcbiAgb25TYXZlQ29tbWVudD86ICgpID0+IHZvaWRcbiAgb25DYW5jZWxDb21tZW50PzogKCkgPT4gdm9pZFxuICBvbkRlbGV0ZUNvbW1lbnQ/OiAoaWQ6IHN0cmluZykgPT4gdm9pZFxuICBvblVwZGF0ZUNvbW1lbnQ/OiAoaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nKSA9PiBQcm9taXNlPGJvb2xlYW4+XG4gIC8qKiBIaWRlIHBlci1odW5rIGFjdGlvbiBiYXJzIChicmFuY2ggc2NvcGUgaXMgYSByZWFkLW9ubHkgZGlmZikuICovXG4gIHJlYWRPbmx5PzogYm9vbGVhblxuICAvKiogUmVwby1yZWxhdGl2ZSBmaWxlIHBhdGggKGZvciBvcGVuLWluLWVkaXRvciBhbmQgbWFya2VycykuICovXG4gIHBhdGg/OiBzdHJpbmdcbiAgLyoqIEFJLXJldmlldyBmaW5kaW5ncyB0byBtYXJrIG9uIG1hdGNoaW5nIGxpbmVzLiAqL1xuICByZXZpZXdGaW5kaW5ncz86IFJldmlld0ZpbmRpbmdbXVxuICAvKiogT3BlbiB0aGUgZmlsZSBhdCBhIGxpbmUgaW4gdGhlIHVzZXIncyBlZGl0b3IuICovXG4gIG9uT3BlbkxpbmU/OiAocGF0aDogc3RyaW5nLCBsaW5lOiBudW1iZXIpID0+IHZvaWRcbiAgLyoqIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoZS5nLiBqdW1wIGZyb20gYSBQUiBjb21tZW50KS4gKi9cbiAganVtcExpbmU/OiBudW1iZXIgfCBudWxsXG59KSB7XG4gIGNvbnN0IGJsb2NrcyA9IHBhcnNlR2l0QmxvY2tzKGRpZmYpXG4gIGxldCBodW5rSW5kZXggPSAwXG4gIGNvbnN0IGVkaXRpbmdLZXkgPSBjb21tZW50RWRpdG9yID8gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgOiBudWxsXG4gIGNvbnN0IGZpbmRpbmdzRm9yID0gKG9sZExpbmU6IG51bWJlciB8IG51bGwsIG5ld0xpbmU6IG51bWJlciB8IG51bGwpOiBSZXZpZXdGaW5kaW5nW10gPT4ge1xuICAgIGlmICghcGF0aCB8fCAhcmV2aWV3RmluZGluZ3MgfHwgcmV2aWV3RmluZGluZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gW11cbiAgICByZXR1cm4gcmV2aWV3RmluZGluZ3MuZmlsdGVyKChmKSA9PiB7XG4gICAgICBpZiAoZi5maWxlICE9PSBwYXRoKSByZXR1cm4gZmFsc2VcbiAgICAgIGlmIChuZXdMaW5lICE9PSBudWxsKSByZXR1cm4gbmV3TGluZSA+PSBmLmxpbmVTdGFydCAmJiBuZXdMaW5lIDw9IGYubGluZUVuZFxuICAgICAgcmV0dXJuIG9sZExpbmUgIT09IG51bGwgJiYgb2xkTGluZSA+PSBmLmxpbmVTdGFydCAmJiBvbGRMaW5lIDw9IGYubGluZUVuZFxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAge2Jsb2Nrcy5tYXAoKGJsb2NrLCBiaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGlzSHVuayA9IGJsb2NrLmhlYWQ/LmtpbmQgPT09ICdodW5rJ1xuICAgICAgICAgIGNvbnN0IGh1bmsgPSBpc0h1bmsgPyBodW5rc1todW5rSW5kZXgrK10gOiB1bmRlZmluZWRcbiAgICAgICAgICBjb25zdCBzdGFydHMgPSBibG9jay5oZWFkPy5raW5kID09PSAnaHVuaycgPyBodW5rU3RhcnRzKGJsb2NrLmhlYWQudGV4dCkgOiB7IG9sZFN0YXJ0OiAxLCBuZXdTdGFydDogMSB9XG4gICAgICAgICAgY29uc3Qgcm93cyA9IGlzSHVuayA/IHVuaWZpZWRSb3dzV2l0aExpbmVzKGJsb2NrLnJvd3MsIHN0YXJ0cy5vbGRTdGFydCwgc3RhcnRzLm5ld1N0YXJ0KSA6IFtdXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxGcmFnbWVudCBrZXk9e2JpfT5cbiAgICAgICAgICAgICAge2lzSHVuayAmJiAhcmVhZE9ubHkgPyA8SHVua1Rvb2xiYXIgaHVuaz17aHVua30gYnVzeT17YnVzeX0gb25BY3Rpb249e29uSHVua0FjdGlvbn0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICB7YmxvY2suaGVhZCA/IDxkaXYgY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke2Jsb2NrLmhlYWQua2luZH1gfT57YmxvY2suaGVhZC50ZXh0IHx8ICcgJ308L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICB7aXNIdW5rXG4gICAgICAgICAgICAgICAgPyByb3dzLm1hcCgoeyByb3csIG9sZExpbmUsIG5ld0xpbmUgfSwgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7b2xkTGluZSA/PyAnbyd9OiR7bmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dDb21tZW50cyA9IGNvbW1lbnRzPy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIG9sZExpbmUsIG5ld0xpbmUpKSA/PyBbXVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5ncyA9IGZpbmRpbmdzRm9yKG9sZExpbmUsIG5ld0xpbmUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVkaXRpbmcgPSBlZGl0aW5nS2V5ID09PSBrZXlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvd0FjdGlvbnMgPSByb3cua2luZCA9PT0gJ2N0eCcgfHwgcm93LmtpbmQgPT09ICdhZGQnIHx8IHJvdy5raW5kID09PSAnZGVsJ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kaW5nQ2xzID0gZmluZGluZ3MubGVuZ3RoID4gMCA/IGAgZHNkci1saW5lLWZpbmRpbmcgZHNkci1maW5kaW5nLSR7ZmluZGluZ3NbMF0ucHJpb3JpdHl9YCA6ICcnXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGp1bXBlZCA9IGp1bXBMaW5lICE9IG51bGwgJiYgKG5ld0xpbmUgPT09IGp1bXBMaW5lIHx8IChuZXdMaW5lID09PSBudWxsICYmIG9sZExpbmUgPT09IGp1bXBMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtyaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItbGluZSBkc2RyLWxpbmUtJHtyb3cua2luZH0ke3Jvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAnIGRzZHItbGluZS1jb21tZW50ZWQnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWxpbmUtanVtcCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17bmV3TGluZSA/PyBvbGRMaW5lID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1saW5lLW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtuZXdMaW5lID8/IG9sZExpbmUgPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lIGNvdW50PXtyb3dDb21tZW50cy5sZW5ndGh9IG9uT3Blbj17KCkgPT4gb25PcGVuQ29tbWVudD8uKG9sZExpbmUsIG5ld0xpbmUpfSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS10ZXh0XCI+e3Jvdy50ZXh0IHx8ICcgJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItZmluZGluZy10YWcgZHNkci1maW5kaW5nLSR7ZmluZGluZ3NbMF0ucHJpb3JpdHl9YH0gdGl0bGU9e2ZpbmRpbmdzWzBdLnRpdGxlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmluZGluZ3NbMF0ucHJpb3JpdHl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZpbmRpbmdzLmxlbmd0aCA+IDEgPyBgXHUwMEQ3JHtmaW5kaW5ncy5sZW5ndGh9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtwYXRoICYmIG9uT3BlbkxpbmUgJiYgKG5ld0xpbmUgPz8gb2xkTGluZSkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLW9wZW5saW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dCgnZWRpdG9yLm9wZW5MaW5lJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25PcGVuTGluZShwYXRoLCBuZXdMaW5lID8/IG9sZExpbmUgPz8gMSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93QWN0aW9ucyAmJiByb3dDb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICByb3dDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEJveCBrZXk9e2NvbW1lbnQuaWR9IGNvbW1lbnQ9e2NvbW1lbnR9IGJ1c3k9e2J1c3l9IG9uVXBkYXRlPXtvblVwZGF0ZUNvbW1lbnQgPz8gKGFzeW5jICgpID0+IGZhbHNlKX0gb25EZWxldGU9e29uRGVsZXRlQ29tbWVudCA/PyAoKCkgPT4ge30pfSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZWRpdGluZyA/IDxDb21tZW50RWRpdG9yIHRleHQ9e2NvbW1lbnRUZXh0ID8/ICcnfSBvblRleHQ9e29uQ29tbWVudFRleHQgPz8gKCgpID0+IHt9KX0gb25TYXZlPXtvblNhdmVDb21tZW50ID8/ICgoKSA9PiB7fSl9IG9uQ2FuY2VsPXtvbkNhbmNlbENvbW1lbnQgPz8gKCgpID0+IHt9KX0gYnVzeT17YnVzeX0gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyhyZXZpZXdGaW5kaW5ncyA/PyBbXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZikgPT4gZi5maWxlID09PSBwYXRoICYmIGYubGluZVN0YXJ0ID09PSAobmV3TGluZSA/PyBvbGRMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoZiwgZmkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmluZGluZ0NhcmQga2V5PXtgJHtmLmZpbGV9OiR7Zi5saW5lU3RhcnR9OiR7Zml9YH0gZmluZGluZz17Zn0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICA6IGJsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyaX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvRnJhZ21lbnQ+XG4gICAgICAgICAgKVxuICAgICAgICB9KX1cbiAgICAgIDwvcHJlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBTdGF0dXMgY2hpcCBjb2xvciBjbGFzcyBmb3IgYSB3b3Jrc3BhY2UgY2hhbmdlLiAqL1xuLyoqIERyYWcgaGFuZGxlIGZvciByZXNpemluZyB0aGUgcGFuZWwgKGVhc3QgLyBzb3V0aCAvIHNvdXRoLWVhc3QpLiAqL1xuZnVuY3Rpb24gUmVzaXplSGFuZGxlKHsgbW9kZSwgb25SZXNpemUgfTogeyBtb2RlOiAnZScgfCAncycgfCAnc2UnOyBvblJlc2l6ZTogKGR4OiBudW1iZXIsIGR5OiBudW1iZXIpID0+IHZvaWQgfSkge1xuICBjb25zdCBsYXN0ID0gdXNlUmVmPHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1yZXNpemUgZHNkci1yZXNpemUtJHttb2RlfWB9XG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoIWxhc3QuY3VycmVudCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGR4ID0gZXZlbnQuY2xpZW50WCAtIGxhc3QuY3VycmVudC54XG4gICAgICAgIGNvbnN0IGR5ID0gZXZlbnQuY2xpZW50WSAtIGxhc3QuY3VycmVudC55XG4gICAgICAgIGxhc3QuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSB9XG4gICAgICAgIGlmIChkeCAhPT0gMCB8fCBkeSAhPT0gMCkgb25SZXNpemUoZHgsIGR5KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXsoZXZlbnQpID0+IHtcbiAgICAgICAgbGFzdC5jdXJyZW50ID0gbnVsbFxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXsoKSA9PiB7XG4gICAgICAgIGxhc3QuY3VycmVudCA9IG51bGxcbiAgICAgIH19XG4gICAgLz5cbiAgKVxufVxuXG4vKiogU3RhdHVzIGNoaXAgY29sb3IgY2xhc3MgZm9yIGEgd29ya3NwYWNlIGNoYW5nZS4gKi9cbmZ1bmN0aW9uIGNoaXBDbGFzcyhzdGF0dXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHMgPSBzdGF0dXMucmVwbGFjZSgvXFxzL2csICcnKVxuICBpZiAocy5pbmNsdWRlcygnPz8nKSkgcmV0dXJuICdkc2RyLWNoaXAtdSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnQScpIHx8IHMuaW5jbHVkZXMoJ0EnKSkgcmV0dXJuICdkc2RyLWNoaXAtYSdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnRCcpIHx8IHMuaW5jbHVkZXMoJ0QnKSkgcmV0dXJuICdkc2RyLWNoaXAtZCdcbiAgaWYgKHMuc3RhcnRzV2l0aCgnUicpIHx8IHMuaW5jbHVkZXMoJ1InKSkgcmV0dXJuICdkc2RyLWNoaXAtcidcbiAgcmV0dXJuICdkc2RyLWNoaXAtbSdcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZFN0YXR1cyhjd2Q6IHN0cmluZyk6IFByb21pc2U8U3RhdHVzUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7U1RBVFVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgaWYgKCFyZXMub2spIHRocm93IG5ldyBFcnJvcihgc3RhdHVzIHJlcXVlc3QgZmFpbGVkOiAke3Jlcy5zdGF0dXN9YClcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpKSBhcyBTdGF0dXNSZXNwb25zZVxufVxuXG5hc3luYyBmdW5jdGlvbiBhcHBseUNoYW5nZXMoY3dkOiBzdHJpbmcsIGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aD86IHN0cmluZyk6IFByb21pc2U8QXBwbHlSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChBUFBMWV9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgYWN0aW9uLCBwYXRoIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQXBwbHlSZXNwb25zZVxufVxuXG4vKiogQXBwbHkgb25lIGh1bmsgb2Ygb25lIGZpbGUgKHN0YWdlIC8gdW5zdGFnZSAvIHJldmVydCkuICovXG5hc3luYyBmdW5jdGlvbiBhcHBseUh1bmsoY3dkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgYWN0aW9uOiAnYWNjZXB0JyB8ICdyZXZlcnQnIHwgJ3Vuc3RhZ2UnLCBodW5rOiBzdHJpbmcpOiBQcm9taXNlPEFwcGx5SHVua1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEFQUExZX0hVTktfVVJMLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBjd2QsIHBhdGgsIGFjdGlvbiwgaHVuayB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEFwcGx5SHVua1Jlc3BvbnNlXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bkdpdEFjdGlvbihjd2Q6IHN0cmluZywgYWN0aW9uOiAnY29tbWl0JyB8ICdwdXNoJywgbWVzc2FnZT86IHN0cmluZyk6IFByb21pc2U8R2l0UmVzcG9uc2U+IHtcbiAgY29uc3QgdXJsID0gYWN0aW9uID09PSAnY29tbWl0JyA/IENPTU1JVF9VUkwgOiBQVVNIX1VSTFxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShhY3Rpb24gPT09ICdjb21taXQnID8geyBjd2QsIG1lc3NhZ2UgfSA6IHsgY3dkIH0pLFxuICB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgR2l0UmVzcG9uc2Vcbn1cblxuLyoqIExvY2FsICh1bnB1c2hlZCkgY29tbWl0cyBhaGVhZCBvZiB0aGUgdXBzdHJlYW0uICovXG5hc3luYyBmdW5jdGlvbiBsb2FkSGlzdG9yeShjd2Q6IHN0cmluZyk6IFByb21pc2U8SGlzdG9yeVJlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke0hJU1RPUllfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21taXRzOiBbXSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIEhpc3RvcnlSZXNwb25zZVxufVxuXG4vKiogT25lIGNvbW1pdCdzIHVuaWZpZWQgZGlmZi4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRDb21taXREaWZmKGN3ZDogc3RyaW5nLCBoYXNoOiBzdHJpbmcpOiBQcm9taXNlPENvbW1pdERpZmZSZXNwb25zZT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtDT01NSVRfRElGRl9VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfSZoYXNoPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGhhc2gpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIHJldHVybiAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGRpZmY6ICcnLCBmaWxlczogW10sIGFkZGVkOiAwLCBkZWxldGVkOiAwLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgQ29tbWl0RGlmZlJlc3BvbnNlXG59XG5cbi8qKiBJbmxpbmUgcmV2aWV3IGNvbW1lbnRzIGZvciB0aGUgd29ya3NwYWNlIChyZXBvLXNjb3BlZCkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkQ29tbWVudHMoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFJldmlld0NvbW1lbnRbXT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtDT01NRU5UU19VUkx9P2N3ZD0ke2VuY29kZVVSSUNvbXBvbmVudChjd2QpfWAsIHsgaGVhZGVyczogeyBhY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyB9IH0pXG4gIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBvazogZmFsc2UsIGNvbW1lbnRzOiBbXSB9KSkpIGFzIENvbW1lbnRzUmVzcG9uc2VcbiAgcmV0dXJuIGRhdGEub2sgPyBkYXRhLmNvbW1lbnRzIDogW11cbn1cblxuLyoqIFJlcGxhY2UgdGhlIHdob2xlIGNvbW1lbnQgbGlzdCAoc2luZ2xlLXVzZXIgcmVwbGFjZSBzZW1hbnRpY3MpLiAqL1xuYXN5bmMgZnVuY3Rpb24gc2F2ZUNvbW1lbnRzKGN3ZDogc3RyaW5nLCBjb21tZW50czogUmV2aWV3Q29tbWVudFtdKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKENPTU1FTlRTX1VSTCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGhlYWRlcnM6IHsgJ2NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBjb21tZW50cyB9KSxcbiAgfSlcbiAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSB9KSkpIGFzIENvbW1lbnRzUmVzcG9uc2VcbiAgcmV0dXJuIGRhdGEub2sgPT09IHRydWVcbn1cblxuLyoqIExvY2FsIGJyYW5jaCBuYW1lcyAoZm9yIHRoZSBCcmFuY2ggcmV2aWV3IHNjb3BlKS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGxvYWRCcmFuY2hlcyhjd2Q6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7QlJBTkNIRVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICBjb25zdCBkYXRhID0gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBicmFuY2hlczogW10gfSkpKSBhcyB7IG9rOiBib29sZWFuOyBicmFuY2hlczogc3RyaW5nW10gfVxuICByZXR1cm4gZGF0YS5vayA/IGRhdGEuYnJhbmNoZXMgOiBbXVxufVxuXG4vKiogUnVuIGFuIEFJIHJldmlldyBvdmVyIHRoZSBnaXZlbiBzY29wZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIHJ1blJldmlldyhjd2Q6IHN0cmluZywgc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsLCBzY29wZTogJ3VuY29tbWl0dGVkJyB8ICdicmFuY2gnIHwgJ2NvbW1pdCcsIGJhc2U/OiBzdHJpbmcsIGNvbW1pdEhhc2g/OiBzdHJpbmcpOiBQcm9taXNlPFJldmlld1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFJFVklFV19VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGN3ZCwgc2Vzc2lvbklkOiBzZXNzaW9uSWQgPz8gdW5kZWZpbmVkLCBzY29wZSwgYmFzZSwgY29tbWl0SGFzaCB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZmluZGluZ3M6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUmV2aWV3UmVzcG9uc2Vcbn1cblxuLyoqIEN1cnJlbnQgYnJhbmNoJ3MgR2l0SHViIFBSIGNvbnRleHQgKGRlZ3JhZGVzIGdyYWNlZnVsbHkgd2l0aG91dCBnaCkuICovXG5hc3luYyBmdW5jdGlvbiBsb2FkUHIoY3dkOiBzdHJpbmcpOiBQcm9taXNlPFByUmVzcG9uc2U+IHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7UFJfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICByZXR1cm4gKGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHsgb2s6IGZhbHNlLCBjb21tZW50czogW10sIGVycm9yOiAnaW52YWxpZCByZXNwb25zZScgfSkpKSBhcyBQclJlc3BvbnNlXG59XG5cbi8qKiBHaXQgcmVwb3MgdW5kZXIgYSB3b3Jrc3BhY2UgKG11bHRpLXJlcG8gc2VsZWN0b3IpLiAqL1xuYXN5bmMgZnVuY3Rpb24gbG9hZFJlcG9zKGN3ZDogc3RyaW5nKTogUHJvbWlzZTxSZXBvc1Jlc3BvbnNlPiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKGAke1JFUE9TX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgcmVwb3M6IFtdLCBlcnJvcjogJ2ludmFsaWQgcmVzcG9uc2UnIH0pKSkgYXMgUmVwb3NSZXNwb25zZVxufVxuXG4vKiogT3BlbiBhIGZpbGUgKG9wdGlvbmFsbHkgYXQgYSBsaW5lKSBpbiB0aGUgdXNlcidzIGVkaXRvciB2aWEgb3Blbi1lZGl0b3IuICovXG5hc3luYyBmdW5jdGlvbiBvcGVuSW5FZGl0b3IoY3dkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlcik6IFByb21pc2U8eyBvazogYm9vbGVhbjsgZXJyb3I/OiBzdHJpbmcgfT4ge1xuICBjb25zdCBhYnMgPSBwYXRoLnN0YXJ0c1dpdGgoJy8nKSB8fCAvXltBLVphLXpdOltcXFxcL10vLnRlc3QocGF0aCkgPyBwYXRoIDogYCR7Y3dkfS8ke3BhdGh9YFxuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChPUEVOX0VESVRPUl9VUkwsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBoZWFkZXJzOiB7ICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHBhdGg6IGFicywgbGluZSB9KSxcbiAgfSlcbiAgcmV0dXJuIChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+ICh7IG9rOiBmYWxzZSwgZXJyb3I6ICdpbnZhbGlkIHJlc3BvbnNlJyB9KSkpIGFzIHsgb2s6IGJvb2xlYW47IGVycm9yPzogc3RyaW5nIH1cbn1cblxuLyoqIFNob3J0IHJlbGF0aXZlIHRpbWUgZm9yIGNvbW1pdCByb3dzIChcImp1c3Qgbm93XCIgLyBcIjMgbWluIGFnb1wiIC8gXHUyMDI2KS4gKi9cbmZ1bmN0aW9uIHJlbGF0aXZlVGltZShpc286IHN0cmluZywgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IoKERhdGUubm93KCkgLSBuZXcgRGF0ZShpc28pLmdldFRpbWUoKSkgLyA2MDAwMClcbiAgaWYgKG1pbnV0ZXMgPCAxKSByZXR1cm4gdCgndGltZS5ub3cnKVxuICBpZiAobWludXRlcyA8IDYwKSByZXR1cm4gdCgndGltZS5taW51dGVzJywgeyBuOiBtaW51dGVzIH0pXG4gIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihtaW51dGVzIC8gNjApXG4gIGlmIChob3VycyA8IDI0KSByZXR1cm4gdCgndGltZS5ob3VycycsIHsgbjogaG91cnMgfSlcbiAgcmV0dXJuIHQoJ3RpbWUuZGF5cycsIHsgbjogTWF0aC5mbG9vcihob3VycyAvIDI0KSB9KVxufVxuXG4vKiogVGhlbWUtYXdhcmUgZHJvcGRvd24gcmVwbGFjaW5nIG5hdGl2ZSA8c2VsZWN0PiAobmF0aXZlIHBvcHVwcyBpZ25vcmUgdGhlIHRoZW1lKS4gKi9cbmZ1bmN0aW9uIFRoZW1lU2VsZWN0KHtcbiAgdmFsdWUsXG4gIG9wdGlvbnMsXG4gIG9uQ2hhbmdlLFxuICBhcmlhTGFiZWwsXG59OiB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgb3B0aW9uczogeyB2YWx1ZTogc3RyaW5nOyBsYWJlbDogc3RyaW5nIH1bXVxuICBvbkNoYW5nZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWRcbiAgYXJpYUxhYmVsPzogc3RyaW5nXG59KSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCByb290UmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKVxuICBjb25zdCBjdXJyZW50ID0gb3B0aW9ucy5maW5kKChvKSA9PiBvLnZhbHVlID09PSB2YWx1ZSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghb3BlbikgcmV0dXJuXG4gICAgY29uc3QgY2xvc2VPdXRzaWRlID0gKGV2ZW50OiBQb2ludGVyRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgaW5zdGFuY2VvZiBOb2RlICYmICFyb290UmVmLmN1cnJlbnQ/LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHNldE9wZW4oZmFsc2UpXG4gICAgfVxuICAgIGNvbnN0IGNsb3NlT25LZXkgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgPT09ICdFc2NhcGUnKSBzZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIGNsb3NlT3V0c2lkZSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2xvc2VPbktleSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBjbG9zZU91dHNpZGUpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgY2xvc2VPbktleSlcbiAgICB9XG4gIH0sIFtvcGVuXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWxcIiByZWY9e3Jvb3RSZWZ9PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1zZWwtdHJpZ2dlclwiXG4gICAgICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICAgICAgYXJpYS1leHBhbmRlZD17b3Blbn1cbiAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVsfVxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKCh2KSA9PiAhdil9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VsLXZhbHVlXCI+e2N1cnJlbnQ/LmxhYmVsID8/IHZhbHVlfTwvc3Bhbj5cbiAgICAgICAgPEljb25DaGV2cm9uRG93biAvPlxuICAgICAgPC9idXR0b24+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cImRzZHItc2VsLW1lbnVcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgICAge29wdGlvbnMubWFwKChvcHRpb24pID0+IChcbiAgICAgICAgICAgIDxsaSBrZXk9e29wdGlvbi52YWx1ZX0gcm9sZT1cIm5vbmVcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e29wdGlvbi52YWx1ZSA9PT0gdmFsdWV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zZWwtb3B0aW9uJHtvcHRpb24udmFsdWUgPT09IHZhbHVlID8gJyBkc2RyLXNlbC1vcHRpb24tYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgb25DaGFuZ2Uob3B0aW9uLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZWwtb3B0aW9uLW1hcmtcIj57b3B0aW9uLnZhbHVlID09PSB2YWx1ZSA/IDxJY29uQ2hlY2sgLz4gOiBudWxsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNlbC1vcHRpb24tbGFiZWxcIj57b3B0aW9uLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3VsPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIERpZmYgZm9udCArIGZvbnQgc2l6ZSBjb250cm9scyAoc2hhcmVkIHByZWZzIHN0b3JlKS4gKi9cbmZ1bmN0aW9uIERpZmZSZXZpZXdQcmVmcyh7IHQgfTogeyB0OiAoa2V5OiBrZXlvZiB0eXBlb2YgemgsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSA9PiBzdHJpbmcgfSkge1xuICBjb25zdCBwcmVmcyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHByZWZzU3RvcmUuc3Vic2NyaWJlLCBwcmVmc1N0b3JlLmdldFNuYXBzaG90KVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWZpZWxkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2ZnLWxhYmVsXCIgaWQ9XCJkc2RyLXByZWYtZm9udC1sYWJlbFwiPnt0KCdzZXR0aW5ncy5mb250Jyl9PC9zcGFuPlxuICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICBhcmlhTGFiZWw9e3QoJ3NldHRpbmdzLmZvbnQnKX1cbiAgICAgICAgICB2YWx1ZT17cHJlZnMuZm9udH1cbiAgICAgICAgICBvcHRpb25zPXtGT05UX09QVElPTlMubWFwKChmKSA9PiAoeyB2YWx1ZTogZi5pZCwgbGFiZWw6IGYubGFiZWwuc3RhcnRzV2l0aCgnZm9udC4nKSA/IHQoZi5sYWJlbCBhcyBrZXlvZiB0eXBlb2YgemgpIDogZi5sYWJlbCB9KSl9XG4gICAgICAgICAgb25DaGFuZ2U9eyhmb250KSA9PlxuICAgICAgICAgICAgcHJlZnNTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgICAgICAgICAgZC5mb250ID0gZm9udFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jZmctZmllbGRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbGFiZWxcIiBpZD1cImRzZHItcHJlZi1zaXplLWxhYmVsXCI+e3QoJ3NldHRpbmdzLnNpemUnKX08L3NwYW4+XG4gICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2V0dGluZ3Muc2l6ZScpfVxuICAgICAgICAgIHZhbHVlPXtTdHJpbmcocHJlZnMuc2l6ZSl9XG4gICAgICAgICAgb3B0aW9ucz17U0laRV9PUFRJT05TLm1hcCgocykgPT4gKHsgdmFsdWU6IFN0cmluZyhzKSwgbGFiZWw6IGAke3N9cHhgIH0pKX1cbiAgICAgICAgICBvbkNoYW5nZT17KHNpemUpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLnNpemUgPSBOdW1iZXIoc2l6ZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgPC8+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBIZWFkZXIgYWN0aW9uIChzZXNzaW9uIHNjb3BlKTogYmFkZ2UgKyBvcGVuLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBSZXBseS1sb2NhbCBjaGFuZ2Ugc3VtbWFyeSBtb3VudGVkIGJlbmVhdGggYSBjb21wbGV0ZWQgYWdlbnQgdHVybi4gKi9cbmZ1bmN0aW9uIFR1cm5DaGFuZ2VTdW1tYXJ5KHsgbWF0Y2hlZCwgc2Vzc2lvbklkLCB1c2VTZXNzaW9uLCB1c2VTZXNzaW9ucywgdCB9OiBUdXJuU3VtbWFyeVByb3BzKSB7XG4gIGNvbnN0IG5vZGVzID0gdXNlU2Vzc2lvbigoc25hcHNob3QpID0+IHNuYXBzaG90Lm5vZGVzKVxuICBjb25zdCBjd2QgPSB1c2VTZXNzaW9ucygoc2Vzc2lvbnM6IFNlc3Npb25MaXN0U3RhdGUpID0+IHNlc3Npb25zLmJ5SWRbc2Vzc2lvbklkXT8uY3dkKVxuICBjb25zdCB0dXJuID0gbWF0Y2hlZC50dXJuXG4gIGNvbnN0IGZpbGVzID0gdXNlTWVtbygoKSA9PiBjb2xsZWN0VHVybkNoYW5nZXMobm9kZXMsIHR1cm4uc3RhcnQ/LnNlcSA/PyAtSW5maW5pdHksIHR1cm4uZW5kPy5zZXEgPz8gSW5maW5pdHkpLCBbbm9kZXMsIHR1cm5dKVxuICBjb25zdCBhZGRlZCA9IHVzZU1lbW8oKCkgPT4gZmlsZXMucmVkdWNlKCh0b3RhbCwgZmlsZSkgPT4gdG90YWwgKyBmaWxlLmFkZGVkLCAwKSwgW2ZpbGVzXSlcbiAgY29uc3QgZGVsZXRlZCA9IHVzZU1lbW8oKCkgPT4gZmlsZXMucmVkdWNlKCh0b3RhbCwgZmlsZSkgPT4gdG90YWwgKyBmaWxlLmRlbGV0ZWQsIDApLCBbZmlsZXNdKVxuXG4gIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG5cbiAgY29uc3QgcmV2aWV3ID0gKCkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChzdGF0ZSkgPT4ge1xuICAgICAgc3RhdGUub3BlbiA9IHRydWVcbiAgICAgIHN0YXRlLmN3ZCA9IGN3ZFxuICAgICAgc3RhdGUuZm9jdXMgPSB7IHBhdGg6IGZpbGVzWzBdLnBhdGgsIHJvdW5kOiB0dXJuLnR1cm4sIHRhYjogJ3Nlc3Npb24nIH1cbiAgICAgIHN0YXRlLmtleSA9IHN0YXRlLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5XCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWhlYWRcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktaWNvblwiPjxJY29uRGlmZiAvPjwvc3Bhbj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LXRpdGxlXCI+e3QoJ3Jldmlldy50dXJuU3VtbWFyeVRpdGxlJywgeyBuOiBmaWxlcy5sZW5ndGggfSl9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1zdGF0c1wiPjxzcGFuIGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWFkZFwiPit7YWRkZWR9PC9zcGFuPjxzcGFuIGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWRlbFwiPi17ZGVsZXRlZH08L3NwYW4+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgb25DbGljaz17cmV2aWV3fT57dCgncmV2aWV3LnR1cm5TdW1tYXJ5UmV2aWV3Jyl9PC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktZmlsZXNcIj5cbiAgICAgICAge2ZpbGVzLm1hcCgoZmlsZSkgPT4gKFxuICAgICAgICAgIDxidXR0b24ga2V5PXtmaWxlLnBhdGh9IHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXR1cm4tc3VtbWFyeS1maWxlXCIgb25DbGljaz17cmV2aWV3fSB0aXRsZT17ZmlsZS5wYXRofT5cbiAgICAgICAgICAgIDxzcGFuPntmaWxlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktZmlsZS1zdGF0c1wiPjxzcGFuIGNsYXNzTmFtZT1cImRzZHItdHVybi1zdW1tYXJ5LWFkZFwiPit7ZmlsZS5hZGRlZH08L3NwYW4+PHNwYW4gY2xhc3NOYW1lPVwiZHNkci10dXJuLXN1bW1hcnktZGVsXCI+LXtmaWxlLmRlbGV0ZWR9PC9zcGFuPjwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBoaWdobGlnaHRDb2RlKHZhbHVlOiBzdHJpbmcpOiBSZWFjdE5vZGVbXSB7XG4gIGNvbnN0IHRva2VuID0gLyhcXC9cXC9bXlxcbl0qfFxcL1xcKltcXHNcXFNdKj9cXCpcXC98XCIoPzpcXFxcLnxbXlwiXSkqXCJ8Jyg/OlxcXFwufFteJ10pKid8XFxiKD86Y29uc3R8bGV0fHZhcnxmdW5jdGlvbnxyZXR1cm58aWZ8ZWxzZXxmb3J8d2hpbGV8YXN5bmN8YXdhaXR8aW1wb3J0fGZyb218ZXhwb3J0fHR5cGV8aW50ZXJmYWNlfGNsYXNzfG5ld3x0cnVlfGZhbHNlfG51bGx8dW5kZWZpbmVkKVxcYnxcXGJcXGQrKD86XFwuXFxkKyk/XFxiKS9nXG4gIHJldHVybiB2YWx1ZS5zcGxpdCh0b2tlbikuZmlsdGVyKEJvb2xlYW4pLm1hcCgocGFydCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBraW5kID0gcGFydC5zdGFydHNXaXRoKCcvLycpIHx8IHBhcnQuc3RhcnRzV2l0aCgnLyonKSA/ICdjb21tZW50JyA6IHBhcnQuc3RhcnRzV2l0aCgnXCInKSB8fCBwYXJ0LnN0YXJ0c1dpdGgoXCInXCIpID8gJ3N0cmluZycgOiAvXlxcZC8udGVzdChwYXJ0KSA/ICdudW1iZXInIDogL14oY29uc3R8bGV0fHZhcnxmdW5jdGlvbnxyZXR1cm58aWZ8ZWxzZXxmb3J8d2hpbGV8YXN5bmN8YXdhaXR8aW1wb3J0fGZyb218ZXhwb3J0fHR5cGV8aW50ZXJmYWNlfGNsYXNzfG5ld3x0cnVlfGZhbHNlfG51bGx8dW5kZWZpbmVkKSQvLnRlc3QocGFydCkgPyAna2V5d29yZCcgOiAncGxhaW4nXG4gICAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17J2RzZHItY29kZS0nICsga2luZH0ga2V5PXtpbmRleH0+e3BhcnR9PC9zcGFuPlxuICB9KVxufVxuXG5mdW5jdGlvbiBGaWxlc1dvcmtzcGFjZSh7IGN3ZCwgdCwgY29sbGFwc2VkLCBvblRvZ2dsZURpciwgdGFyZ2V0LCBvbkFkZFRvQ2hhdCB9OiB7IGN3ZDogc3RyaW5nOyB0OiBDYXJkVDsgY29sbGFwc2VkOiBSZWFkb25seVNldDxzdHJpbmc+OyBvblRvZ2dsZURpcjogKHBhdGg6IHN0cmluZykgPT4gdm9pZDsgdGFyZ2V0OiBzdHJpbmcgfCBudWxsOyBvbkFkZFRvQ2hhdDogKHBhdGg6IHN0cmluZykgPT4gdm9pZCB9KSB7XG4gIGNvbnN0IFtmaWxlcywgc2V0RmlsZXNdID0gdXNlU3RhdGU8V29ya3NwYWNlRmlsZUVudHJ5W10+KFtdKVxuICBjb25zdCBbZmlsdGVyLCBzZXRGaWx0ZXJdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtzZWxlY3RlZCwgc2V0U2VsZWN0ZWRdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbnRlbnQsIHNldENvbnRlbnRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtmaWxlS2luZCwgc2V0RmlsZUtpbmRdID0gdXNlU3RhdGU8J3RleHQnIHwgJ2ltYWdlJyB8ICdiaW5hcnknPigndGV4dCcpXG4gIGNvbnN0IFtpbWFnZVVybCwgc2V0SW1hZ2VVcmxdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW210aW1lLCBzZXRNdGltZV0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbc2F2aW5nLCBzZXRTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtub3RpY2UsIHNldE5vdGljZV0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICBjb25zdCBbbWVudSwgc2V0TWVudV0gPSB1c2VTdGF0ZTx7IHBhdGg6IHN0cmluZzsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHNhdmVkQ29udGVudCA9IHVzZVJlZignJylcbiAgY29uc3QgY29kZVJlZiA9IHVzZVJlZjxIVE1MUHJlRWxlbWVudD4obnVsbClcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBhbGl2ZSA9IHRydWVcbiAgICB2b2lkIGZldGNoKGAke0ZJTEVTX1VSTH0/Y3dkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGN3ZCl9YCwgeyBoZWFkZXJzOiB7IGFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0gfSlcbiAgICAgIC50aGVuKChyZXMpID0+IHJlcy5qc29uKCkgYXMgUHJvbWlzZTxGaWxlc0xpc3RSZXNwb25zZT4pXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICBpZiAoYWxpdmUpIHtcbiAgICAgICAgICBzZXRGaWxlcyhkYXRhLmZpbGVzID8/IFtdKVxuICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4gYWxpdmUgJiYgc2V0TG9hZGluZyhmYWxzZSkpXG4gICAgcmV0dXJuICgpID0+IHsgYWxpdmUgPSBmYWxzZSB9XG4gIH0sIFtjd2RdKVxuXG4gIGNvbnN0IHNob3duID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUucGF0aC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlci50cmltKCkudG9Mb3dlckNhc2UoKSkpLCBbZmlsZXMsIGZpbHRlcl0pXG4gIGNvbnN0IHRyZWUgPSB1c2VNZW1vKCgpID0+IGJ1aWxkRmlsZVRyZWUoc2hvd24sIChmaWxlKSA9PiBmaWxlLnBhdGgpLCBbc2hvd25dKVxuICBjb25zdCBvcGVuID0gYXN5bmMgKHBhdGg6IHN0cmluZykgPT4ge1xuICAgIHNldFNlbGVjdGVkKHBhdGgpOyBzZXRMb2FkaW5nKHRydWUpOyBzZXROb3RpY2UobnVsbClcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goYCR7RklMRVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoY3dkKX0mcGF0aD0ke2VuY29kZVVSSUNvbXBvbmVudChwYXRoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpKSBhcyBGaWxlUmVhZFJlc3BvbnNlXG4gICAgICBpZiAoZGF0YS5vaykgeyBjb25zdCBuZXh0ID0gZGF0YS5jb250ZW50ID8/ICcnOyBzYXZlZENvbnRlbnQuY3VycmVudCA9IG5leHQ7IHNldENvbnRlbnQobmV4dCk7IHNldEZpbGVLaW5kKGRhdGEua2luZCA/PyAndGV4dCcpOyBzZXRJbWFnZVVybChkYXRhLmRhdGFVcmwgPz8gbnVsbCk7IHNldE10aW1lKGRhdGEubXRpbWUgPz8gbnVsbCkgfSBlbHNlIHNldE5vdGljZShkYXRhLmVycm9yID8/ICdGYWlsZWQgdG8gcmVhZCBmaWxlJylcbiAgICB9IGNhdGNoIHsgc2V0Tm90aWNlKCdGYWlsZWQgdG8gcmVhZCBmaWxlJykgfSBmaW5hbGx5IHsgc2V0TG9hZGluZyhmYWxzZSkgfVxuICB9XG4gIGNvbnN0IHNhdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFzZWxlY3RlZCB8fCBzYXZpbmcpIHJldHVyblxuICAgIHNldFNhdmluZyh0cnVlKTsgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKEZJTEVTX1VSTCwgeyBtZXRob2Q6ICdQT1NUJywgaGVhZGVyczogeyAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgY3dkLCBwYXRoOiBzZWxlY3RlZCwgY29udGVudCwgbXRpbWUgfSkgfSlcbiAgICAgIGNvbnN0IGRhdGEgPSAoYXdhaXQgcmVzLmpzb24oKSkgYXMgRmlsZVdyaXRlUmVzcG9uc2VcbiAgICAgIGlmIChkYXRhLm9rKSB7IHNhdmVkQ29udGVudC5jdXJyZW50ID0gY29udGVudDsgc2V0TXRpbWUoZGF0YS5tdGltZSA/PyBtdGltZSk7IHNldE5vdGljZSh0KCdmaWxlcy5zYXZlZCcpKSB9IGVsc2Ugc2V0Tm90aWNlKGRhdGEuZXJyb3IgPz8gJ0ZhaWxlZCB0byBzYXZlIGZpbGUnKVxuICAgIH0gY2F0Y2ggeyBzZXROb3RpY2UoJ0ZhaWxlZCB0byBzYXZlIGZpbGUnKSB9IGZpbmFsbHkgeyBzZXRTYXZpbmcoZmFsc2UpIH1cbiAgfVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0ICE9PSBzZWxlY3RlZCkgdm9pZCBvcGVuKHRhcmdldClcbiAgfSwgW3RhcmdldF0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzZWxlY3RlZCB8fCBsb2FkaW5nIHx8IHNhdmluZyB8fCBjb250ZW50ID09PSBzYXZlZENvbnRlbnQuY3VycmVudCkgcmV0dXJuXG4gICAgY29uc3QgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB2b2lkIHNhdmUoKSwgODAwKVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKVxuICB9LCBbY29udGVudCwgc2VsZWN0ZWQsIGxvYWRpbmcsIHNhdmluZywgbXRpbWVdKVxuXG4gIHJldHVybiAoXG4gICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiZHNkci1maWxlcy13b3Jrc3BhY2VcIiBhcmlhLWxhYmVsPXt0KCdmaWxlcy50aXRsZScpfT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy10b29sYmFyXCI+PGlucHV0IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtc2VhcmNoXCIgdmFsdWU9e2ZpbHRlcn0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmlsdGVyKGV2ZW50LnRhcmdldC52YWx1ZSl9IHBsYWNlaG9sZGVyPXt0KCdmaWxlcy5zZWFyY2gnKX0gYXV0b0ZvY3VzIC8+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtY29udGVudFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtbGlzdFwiPlxuICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgIG5vZGVzPXt0cmVlfVxuICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWR9XG4gICAgICAgICAgICBvblRvZ2dsZURpcj17b25Ub2dnbGVEaXJ9XG4gICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgIHJlbmRlckxlYWY9eyhsZWFmKSA9PiA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9eydkc2RyLWZpbGVzLWl0ZW0nICsgKHNlbGVjdGVkID09PSBsZWFmLnBhdGggPyAnIGRzZHItZmlsZXMtaXRlbS1hY3RpdmUnIDogJycpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW4obGVhZi5wYXRoKX0gb25Db250ZXh0TWVudT17KGV2ZW50KSA9PiB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IHNldE1lbnUoeyBwYXRoOiBsZWFmLnBhdGgsIHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFkgfSkgfX0gdGl0bGU9e2xlYWYucGF0aH0+e2xlYWYubmFtZX08L2J1dHRvbj59XG4gICAgICAgICAgLz5cbiAgICAgICAgICB7IWxvYWRpbmcgJiYgc2hvd24ubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ2ZpbGVzLmVtcHR5Jyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy1lZGl0b3JcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXMtcGF0aFwiPntzZWxlY3RlZCA/PyAobG9hZGluZyA/IHQoJ2ZpbGVzLmxvYWRpbmcnKSA6ICcnKX08L2Rpdj5cbiAgICAgICAgICB7c2VsZWN0ZWQgJiYgZmlsZUtpbmQgPT09ICd0ZXh0JyA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb2RlLWVkaXRvclwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29kZS1saW5lc1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb250ZW50LnNwbGl0KCdcXG4nKS5tYXAoKF8sIGluZGV4KSA9PiA8c3BhbiBrZXk9e2luZGV4fT57aW5kZXggKyAxfTwvc3Bhbj4pfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29kZS1sYXllclwiPlxuICAgICAgICAgICAgICAgIDxwcmUgcmVmPXtjb2RlUmVmfSBjbGFzc05hbWU9XCJkc2RyLWNvZGUtaGlnaGxpZ2h0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PGNvZGU+e2hpZ2hsaWdodENvZGUoY29udGVudCl9PC9jb2RlPjwvcHJlPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBjbGFzc05hbWU9XCJkc2RyLWZpbGVzLXRleHRcIiB2YWx1ZT17Y29udGVudH0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0Q29udGVudChldmVudC50YXJnZXQudmFsdWUpfSBvblNjcm9sbD17KGV2ZW50KSA9PiB7IGlmIChjb2RlUmVmLmN1cnJlbnQpIHsgY29kZVJlZi5jdXJyZW50LnNjcm9sbFRvcCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuc2Nyb2xsVG9wOyBjb2RlUmVmLmN1cnJlbnQuc2Nyb2xsTGVmdCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuc2Nyb2xsTGVmdCB9IH19IHNwZWxsQ2hlY2s9e2ZhbHNlfSAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCAmJiBmaWxlS2luZCA9PT0gJ2ltYWdlJyAmJiBpbWFnZVVybCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1pbWFnZS1wcmV2aWV3XCI+PGltZyBzcmM9e2ltYWdlVXJsfSBhbHQ9e3NlbGVjdGVkfSAvPjwvZGl2PiA6IG51bGx9XG4gICAgICAgICAge3NlbGVjdGVkICYmIGZpbGVLaW5kID09PSAnYmluYXJ5JyA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy11bmF2YWlsYWJsZVwiPlx1NkI2NFx1NEU4Q1x1OEZEQlx1NTIzNlx1NjU4N1x1NEVGNlx1NEUwRFx1NTNFRlx1OTg4NFx1ODlDODwvZGl2PiA6IG51bGx9XG4gICAgICAgICAge3NlbGVjdGVkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZpbGVzLWFjdGlvbnNcIj48c3BhbiBjbGFzc05hbWU9XCJkc2RyLW5vdGljZVwiPntzYXZpbmcgPyB0KCdmaWxlcy5sb2FkaW5nJykgOiBub3RpY2UgPz8gJyd9PC9zcGFuPjwvZGl2PiA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICB7bWVudSA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlcy1tZW51XCIgcm9sZT1cIm1lbnVcIiBzdHlsZT17eyBsZWZ0OiBtZW51LngsIHRvcDogbWVudS55IH19IG9uUG9pbnRlckxlYXZlPXsoKSA9PiBzZXRNZW51KG51bGwpfT48YnV0dG9uIHR5cGU9XCJidXR0b25cIiByb2xlPVwibWVudWl0ZW1cIiBvbkNsaWNrPXsoKSA9PiB7IHZvaWQgb3BlbkluRWRpdG9yKGN3ZCwgbWVudS5wYXRoKTsgc2V0TWVudShudWxsKSB9fT5PcGVuIGluIGVkaXRvcjwvYnV0dG9uPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIHJvbGU9XCJtZW51aXRlbVwiIG9uQ2xpY2s9eygpID0+IHsgdm9pZCB3cml0ZUNsaXBib2FyZChtZW51LnBhdGgpOyBzZXRNZW51KG51bGwpIH19PkNvcHkgcGF0aDwvYnV0dG9uPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIHJvbGU9XCJtZW51aXRlbVwiIG9uQ2xpY2s9eygpID0+IHsgb25BZGRUb0NoYXQobWVudS5wYXRoKTsgc2V0TWVudShudWxsKSB9fT5BZGQgdG8gY2hhdDwvYnV0dG9uPjwvZGl2PiA6IG51bGx9XG4gICAgPC9zZWN0aW9uPlxuICApXG59XG5cbmZ1bmN0aW9uIERpZmZSZXZpZXdBY3Rpb24oeyBzZXNzaW9uSWQsIHVzZVNlc3Npb25zLCB1c2VTZXNzaW9uLCB0IH06IERpZmZSZXZpZXdBY3Rpb25Qcm9wcykge1xuICBjb25zdCBjd2QgPSB1c2VTZXNzaW9ucygoczogU2Vzc2lvbkxpc3RTdGF0ZSkgPT4gcy5ieUlkW3Nlc3Npb25JZF0/LmN3ZClcbiAgY29uc3Qgbm9kZXMgPSB1c2VTZXNzaW9uKChzKSA9PiBzLm5vZGVzKVxuICBjb25zdCBjaGFuZ2VDb3VudCA9IHVzZU1lbW8oKCkgPT4gY291bnRTZXNzaW9uQ2hhbmdlcyhub2RlcyksIFtub2Rlc10pXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IG9wZW5PdmVybGF5ID0gKCkgPT4ge1xuICAgIGlmICghY3dkKSByZXR1cm5cbiAgICBvdmVybGF5U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLm9wZW4gPSB0cnVlXG4gICAgICBkLmN3ZCA9IGN3ZFxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1bnN1YiA9IG92ZXJsYXlTdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgc2V0T3BlbihvdmVybGF5U3RvcmUuZ2V0U25hcHNob3QoKS5vcGVuKVxuICAgIH0pXG4gICAgcmV0dXJuIHVuc3ViXG4gIH0sIFtdKVxuXG4gIGlmICghY3dkKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci10cmlnZ2VyXCIgYXJpYS1sYWJlbD17dCgnYWN0aW9uLmFyaWEnKX0gb25DbGljaz17b3Blbk92ZXJsYXl9PlxuICAgICAgPEljb25EaWZmIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWxhYmVsXCI+e3QoJ2FjdGlvbi5sYWJlbCcpfTwvc3Bhbj5cbiAgICAgIHtjaGFuZ2VDb3VudCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvdW50XCI+e2NoYW5nZUNvdW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAge29wZW4gPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XHUyNzEzPC9zcGFuPiA6IG51bGx9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBGaWxlIHRyZWU6IGJ1aWxkIGEgZGlyZWN0b3J5IHRyZWUgZnJvbSBmbGF0IHBhdGhzIGFuZCByZW5kZXIgaXQgd2l0aFxuLy8gY29sbGFwc2libGUgZm9sZGVycyAodGhlIGxlZnQgc2lkZSBvZiB0aGUgcmV2aWV3IHN1cmZhY2UpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnR5cGUgVHJlZURpcjxUPiA9IHsga2luZDogJ2Rpcic7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBjaGlsZHJlbjogVHJlZU5vZGU8VD5bXSB9XG50eXBlIFRyZWVMZWFmPFQ+ID0geyBraW5kOiAnbGVhZic7IG5hbWU6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBpdGVtOiBUIH1cbnR5cGUgVHJlZU5vZGU8VD4gPSBUcmVlRGlyPFQ+IHwgVHJlZUxlYWY8VD5cblxuLyoqIFR1cm4gYSBmbGF0IGl0ZW0gbGlzdCBpbnRvIGEgc29ydGVkIGRpcmVjdG9yeSB0cmVlIChkaXJlY3RvcmllcyBmaXJzdCkuICovXG5mdW5jdGlvbiBidWlsZEZpbGVUcmVlPFQ+KGl0ZW1zOiByZWFkb25seSBUW10sIHBhdGhPZjogKGl0ZW06IFQpID0+IHN0cmluZyk6IFRyZWVOb2RlPFQ+W10ge1xuICBjb25zdCByb290OiBUcmVlTm9kZTxUPltdID0gW11cbiAgY29uc3QgZGlySW5kZXggPSBuZXcgTWFwPHN0cmluZywgVHJlZURpcjxUPj4oKVxuICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHtcbiAgICBjb25zdCBwYXRoID0gcGF0aE9mKGl0ZW0pXG4gICAgY29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkgY29udGludWVcbiAgICBsZXQgc2libGluZ3MgPSByb290XG4gICAgbGV0IHByZWZpeCA9ICcnXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgIHByZWZpeCA9IHByZWZpeCA/IGAke3ByZWZpeH0vJHtwYXJ0c1tpXX1gIDogcGFydHNbaV1cbiAgICAgIGxldCBkaXIgPSBkaXJJbmRleC5nZXQocHJlZml4KVxuICAgICAgaWYgKCFkaXIpIHtcbiAgICAgICAgZGlyID0geyBraW5kOiAnZGlyJywgbmFtZTogcGFydHNbaV0sIHBhdGg6IHByZWZpeCwgY2hpbGRyZW46IFtdIH1cbiAgICAgICAgZGlySW5kZXguc2V0KHByZWZpeCwgZGlyKVxuICAgICAgICBzaWJsaW5ncy5wdXNoKGRpcilcbiAgICAgIH1cbiAgICAgIHNpYmxpbmdzID0gZGlyLmNoaWxkcmVuXG4gICAgfVxuICAgIHNpYmxpbmdzLnB1c2goeyBraW5kOiAnbGVhZicsIG5hbWU6IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLCBwYXRoLCBpdGVtIH0pXG4gIH1cbiAgY29uc3Qgc29ydE5vZGVzID0gKG5vZGVzOiBUcmVlTm9kZTxUPltdKTogdm9pZCA9PiB7XG4gICAgbm9kZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYgKGEua2luZCAhPT0gYi5raW5kKSByZXR1cm4gYS5raW5kID09PSAnZGlyJyA/IC0xIDogMVxuICAgICAgcmV0dXJuIGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSlcbiAgICB9KVxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2RlcykgaWYgKG5vZGUua2luZCA9PT0gJ2RpcicpIHNvcnROb2Rlcyhub2RlLmNoaWxkcmVuKVxuICB9XG4gIHNvcnROb2Rlcyhyb290KVxuICByZXR1cm4gcm9vdFxufVxuXG4vKiogUmVjdXJzaXZlIHRyZWUgcmVuZGVyZXI6IGNvbGxhcHNpYmxlIGRpcmVjdG9yaWVzICsgbGVhZiByb3dzLiAqL1xuZnVuY3Rpb24gRmlsZVRyZWVWaWV3PFQ+KHByb3BzOiB7XG4gIG5vZGVzOiBUcmVlTm9kZTxUPltdXG4gIGNvbGxhcHNlZDogUmVhZG9ubHlTZXQ8c3RyaW5nPlxuICBvblRvZ2dsZURpcjogKHBhdGg6IHN0cmluZykgPT4gdm9pZFxuICBkZXB0aDogbnVtYmVyXG4gIHJlbmRlckxlYWY6IChsZWFmOiBUcmVlTGVhZjxUPikgPT4gUmVhY3ROb2RlXG59KTogUmVhY3RFbGVtZW50IHtcbiAgY29uc3QgeyBub2RlcywgY29sbGFwc2VkLCBvblRvZ2dsZURpciwgZGVwdGgsIHJlbmRlckxlYWYgfSA9IHByb3BzXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtub2Rlcy5tYXAoKG5vZGUpID0+XG4gICAgICAgIG5vZGUua2luZCA9PT0gJ2RpcicgPyAoXG4gICAgICAgICAgPGRpdiBrZXk9e25vZGUucGF0aH0+XG4gICAgICAgICAgICB7LyogRGlyZWN0b3J5IHJvdzogY2xpY2sgdG9nZ2xlcyB0aGlzIGRpcmVjdG9yeSdzIGNvbGxhcHNlIHN0YXRlXG4gICAgICAgICAgICAgICAgKGNvbGxhcHNlZCBcdTIxOTIgZXhwYW5kLCBleHBhbmRlZCBcdTIxOTIgY29sbGFwc2UpLiAqL31cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItZGlyJHtjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAnJyA6ICcgZHNkci1kaXItb3Blbid9YH1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZ0xlZnQ6IGRlcHRoICogMTQgKyA4IH19XG4gICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9eyFjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCl9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVG9nZ2xlRGlyKG5vZGUucGF0aCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLWNhcmV0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+e2NvbGxhcHNlZC5oYXMobm9kZS5wYXRoKSA/ICdcdTI1QjgnIDogJ1x1MjVCRSd9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpci1uYW1lXCIgdGl0bGU9e25vZGUucGF0aH0+e25vZGUubmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlyLWNvdW50XCI+e25vZGUuY2hpbGRyZW4ubGVuZ3RofTwvc3Bhbj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgeyFjb2xsYXBzZWQuaGFzKG5vZGUucGF0aCkgPyAoXG4gICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXcgbm9kZXM9e25vZGUuY2hpbGRyZW59IGNvbGxhcHNlZD17Y29sbGFwc2VkfSBvblRvZ2dsZURpcj17b25Ub2dnbGVEaXJ9IGRlcHRoPXtkZXB0aCArIDF9IHJlbmRlckxlYWY9e3JlbmRlckxlYWZ9IC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8ZGl2IGtleT17bm9kZS5wYXRofSBzdHlsZT17eyBwYWRkaW5nTGVmdDogZGVwdGggKiAxNCB9fT57cmVuZGVyTGVhZihub2RlKX08L2Rpdj5cbiAgICAgICAgKSxcbiAgICAgICl9XG4gICAgPC8+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb252ZXJzYXRpb24gY2FyZCAoc2Vzc2lvbiBzY29wZSk6IHRoZSBjYXJyaWVkIHJldmlldyBwYWNrYWdlIHJlbmRlcnMgaW4gdGhlXG4vLyB0cmFuc2NyaXB0IGFzIGEgQ29kZXgtc3R5bGUgY2FyZCBcdTIwMTQgZWFjaCBjb21tZW50IGNsaWNrYWJsZSB0byBqdW1wIHRvIHRoZVxuLy8gbWF0Y2hpbmcgY2hhbmdlIGJsb2NrIGluIHRoZSByZXZpZXcgcGFuZWwuIFRoZSB1c2VyLW5vZGUgcmVuZGVyZXIgaXNcbi8vIHNoYWRvd2VkIGF0IHByaW9yaXR5IC0xOyBub24tcGFja2FnZSBtZXNzYWdlcyBmYWxsIGJhY2sgdG8gYSBuYXRpdmUtbG9va1xuLy8gYnViYmxlICh0aGUgc2hlbGwncyBvd24gcmVuZGVyZXIgY2Fubm90IGJlIGRlbGVnYXRlZCB0bywgYmVjYXVzZSB0aGUgc2xvdFxuLy8gaGFuZHMgb3VyIG5hbWVzcGFjZS1ib3VuZCBgdGAgdG8gd2hhdGV2ZXIgY29tcG9uZW50IHdpbnMgdGhlIGNlbGwpLlxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKiBTdHJ1Y3R1cmFsIHVzZXIgY29udGVudCBibG9jayAoQ29udGVudEJsb2NrIGlzIG5vdCBleHBvcnRlZCBmcm9tIHJ1bnRpbWUpLiAqL1xudHlwZSBVc2VyQmxvY2sgPSB7IHR5cGU6IHN0cmluZzsgdGV4dD86IHN0cmluZzsgYXR0YWNobWVudD86IEltYWdlQXR0YWNobWVudFJlZiB9XG5cbi8qKiBQbGFpbiB0ZXh0IG9mIGEgdXNlciBtZXNzYWdlJ3MgY29udGVudCBibG9ja3MgKHRleHQgYmxvY2tzIGNvbmNhdGVuYXRlZCkuICovXG5mdW5jdGlvbiB1c2VyTWVzc2FnZVRleHQoY29udGVudDogcmVhZG9ubHkgVXNlckJsb2NrW10pOiBzdHJpbmcge1xuICBsZXQgb3V0ID0gJydcbiAgZm9yIChjb25zdCBibG9jayBvZiBjb250ZW50KSB7XG4gICAgaWYgKGJsb2NrLnR5cGUgPT09ICd0ZXh0JyAmJiB0eXBlb2YgYmxvY2sudGV4dCA9PT0gJ3N0cmluZycpIG91dCArPSBibG9jay50ZXh0XG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG4vKiogRnVsbCBwcm9wcyBvZiBvdXIgc2hhZG93ZWQgdXNlci9zdGVlcmluZyBub2RlIHJlbmRlcmVycyAodCBib3VuZCB0byBvdXIgbmFtZXNwYWNlKS4gKi9cbnR5cGUgVXNlclJldmlld05vZGVQcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLmNoYXQubm9kZScsICd1c2VyJyB8ICdzdGVlcmluZyc+ICYgUHJvcHNMb2NhbGU8J2RpZmYtcmV2aWV3Jz5cbi8qKiBUcmFuc2xhdG9yIGJvdW5kIHRvIHRoZSBwbHVnaW4gbmFtZXNwYWNlIChzaGFyZWQgYnkgdGhlIGNhcmQvYnViYmxlKS4gKi9cbnR5cGUgQ2FyZFQgPSBQcm9wc0xvY2FsZTwnZGlmZi1yZXZpZXcnPlsndCddXG5cbi8qKiBHcm91cCBjb21tZW50cyBieSBwYXRoLCBwcmVzZXJ2aW5nIGZpcnN0LXNlZW4gb3JkZXIuICovXG5mdW5jdGlvbiBncm91cENvbW1lbnRzKGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdKTogeyBwYXRoOiBzdHJpbmc7IGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdIH1bXSB7XG4gIGNvbnN0IGdyb3VwczogeyBwYXRoOiBzdHJpbmc7IGNvbW1lbnRzOiBSZXZpZXdQYWNrYWdlQ29tbWVudFtdIH1bXSA9IFtdXG4gIGNvbnN0IGluZGV4ID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKVxuICBmb3IgKGNvbnN0IGMgb2YgY29tbWVudHMpIHtcbiAgICBsZXQgZyA9IGluZGV4LmdldChjLnBhdGgpXG4gICAgaWYgKGcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZyA9IGdyb3Vwcy5sZW5ndGhcbiAgICAgIGluZGV4LnNldChjLnBhdGgsIGcpXG4gICAgICBncm91cHMucHVzaCh7IHBhdGg6IGMucGF0aCwgY29tbWVudHM6IFtdIH0pXG4gICAgfVxuICAgIGdyb3Vwc1tnXS5jb21tZW50cy5wdXNoKGMpXG4gIH1cbiAgcmV0dXJuIGdyb3Vwc1xufVxuXG5mdW5jdGlvbiBJY29uRmlsZSgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNMTQgMkg2YTIgMiAwIDAgMC0yIDJ2MTZhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0yVjh6XCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNMTQgMnY2aDZcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBDb2RleC1zdHlsZSByZXZpZXcgY2FyZCBmb3IgYSBjYXJyaWVkIHJldmlldyBwYWNrYWdlIG1lc3NhZ2UuICovXG5mdW5jdGlvbiBSZXZpZXdQYWNrYWdlQ2FyZCh7IHBrZywgY3dkLCB0IH06IHsgcGtnOiBSZXZpZXdQYWNrYWdlOyBjd2Q/OiBzdHJpbmc7IHQ6IENhcmRUIH0pIHtcbiAgY29uc3QgdGFyZ2V0Q3dkID0gcGtnLndvcmtzcGFjZSA/PyBjd2QgPz8gbnVsbFxuICBjb25zdCBqdW1wID0gKHBhdGg6IHN0cmluZywgbGluZT86IG51bWJlciwgc291cmNlPzogUmV2aWV3UGFja2FnZUNvbW1lbnRbJ3NvdXJjZSddKSA9PiB7XG4gICAgaWYgKCF0YXJnZXRDd2QpIHJldHVyblxuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gdGFyZ2V0Q3dkXG4gICAgICAvLyBTZXNzaW9uLXNvdXJjZWQgY29tbWVudHMgYW5jaG9yIHRvIHJlbGF0aXZlIGh1bmsgbGluZXMgYW5kIGp1bXAgdG9cbiAgICAgIC8vIHRoZSBzZXNzaW9uIHRhYjsgd29ya3NwYWNlIGNvbW1lbnRzIGp1bXAgdG8gcmVhbCBmaWxlIGxpbmVzLlxuICAgICAgZC5mb2N1cyA9IHsgcGF0aCwgbGluZSwgdGFiOiBzb3VyY2UgPT09ICdzZXNzaW9uJyA/ICdzZXNzaW9uJyA6ICd3b3Jrc3BhY2UnIH1cbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuICBjb25zdCBncm91cHMgPSB1c2VNZW1vKCgpID0+IGdyb3VwQ29tbWVudHMocGtnLmNvbW1lbnRzKSwgW3BrZy5jb21tZW50c10pXG4gIGNvbnN0IHNob3dWZXJkaWN0ID0gcGtnLnZlcmRpY3QgIT09IG51bGwgfHwgcGtnLmZpbmRpbmdzLmxlbmd0aCA+IDBcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmRcIiBkYXRhLXRpbWUtaG92ZXItcm9vdD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1oZWFkXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtYmFkZ2VcIj48SWNvbkNvbW1lbnQgLz57dCgncmV2aWV3LmNhcmRUaXRsZScpfTwvc3Bhbj5cbiAgICAgICAge3RhcmdldEN3ZCA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLXdvcmtzcGFjZVwiIHRpdGxlPXt0YXJnZXRDd2R9Pnt0YXJnZXRDd2R9PC9zcGFuPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGFjZXJcIiAvPlxuICAgICAgICB7cGtnLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1tZXRhXCI+e3QoJ3Jldmlldy5jYXJkQ29tbWVudHMnLCB7IG46IHBrZy5jb21tZW50cy5sZW5ndGggfSl9PC9zcGFuPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAge2dyb3Vwcy5tYXAoKGcpID0+IChcbiAgICAgICAgPGRpdiBrZXk9e2cucGF0aH0gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1ncm91cFwiPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtcGF0aFwiIHRpdGxlPXt0KCdyZXZpZXcuY2FyZE9wZW5GaWxlJyl9IG9uQ2xpY2s9eygpID0+IGp1bXAoZy5wYXRoKX0+XG4gICAgICAgICAgICA8SWNvbkZpbGUgLz48c3Bhbj57Zy5wYXRofTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICB7Zy5jb21tZW50cy5tYXAoKGMsIGkpID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1pdGVtXCJcbiAgICAgICAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5jYXJkSnVtcCcpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBqdW1wKGMucGF0aCwgYy5saW5lID8/IHVuZGVmaW5lZCwgYy5zb3VyY2UpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWxvY1wiPntjLmxpbmUgIT09IG51bGwgPyBgJHtjLnBhdGh9OiR7Yy5saW5lfWAgOiBgJHtjLnBhdGh9IChvbGQpYH08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtdGV4dFwiPntjLnRleHR9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSl9XG4gICAgICB7c2hvd1ZlcmRpY3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LXNlY1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC12ZXJkaWN0LWhlYWRcIj5cbiAgICAgICAgICAgIDxzcGFuPnt0KCdyZXZpZXcuY2FyZFZlcmRpY3QnKX08L3NwYW4+XG4gICAgICAgICAgICB7cGtnLnZlcmRpY3QgPyAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItcmV2aWV3LWNhcmQtdmVyZGljdCBkc2RyLXJldmlldy1jYXJkLXZlcmRpY3QtJHtwa2cudmVyZGljdH1gfT5cbiAgICAgICAgICAgICAgICB7cGtnLnZlcmRpY3QgPT09ICdjb3JyZWN0JyA/IHQoJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCcpIDogdCgncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnKX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3BrZy5maW5kaW5ncy5tYXAoKGY6IFJldmlld1BhY2thZ2VGaW5kaW5nLCBpOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWZpbmRpbmdcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1maW5kaW5nLXRhZyBkc2RyLWZpbmRpbmctJHtmLnByaW9yaXR5fWB9PntmLnByaW9yaXR5fTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1yZXZpZXctY2FyZC1maW5kaW5nLXRleHRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXJldmlldy1jYXJkLWZpbmRpbmctbG9jXCI+e2YuZmlsZX06e2YubGluZX08L3NwYW4+eycgJ31cbiAgICAgICAgICAgICAgICB7Zi50aXRsZX17Zi5kZXRhaWwgPyBgIFx1MjAxNCAke2YuZGV0YWlsfWAgOiAnJ31cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItcmV2aWV3LWNhcmQtZm9vdFwiPnt0KCdyZXZpZXcuY2FyZEhpbnQnKX08L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vKiogTmF0aXZlLWxvb2sgZmFsbGJhY2sgYnViYmxlIGZvciBvcmRpbmFyeSB1c2VyIG1lc3NhZ2VzIChzaGFkb3dlZCBjZWxsKS4gKi9cbmZ1bmN0aW9uIEZhbGxiYWNrVXNlckJ1YmJsZSh7XG4gIHRleHQsXG4gIGltYWdlcyxcbiAgbG9hZEltYWdlLFxuICB0LFxufToge1xuICB0ZXh0OiBzdHJpbmdcbiAgaW1hZ2VzOiByZWFkb25seSAoVXNlckJsb2NrICYgeyBhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYgfSlbXVxuICBsb2FkSW1hZ2U6IChhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYpID0+IFByb21pc2U8c3RyaW5nPlxuICB0OiBDYXJkVFxufSkge1xuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IG9uQ29weSA9ICgpID0+IHtcbiAgICB2b2lkIHdyaXRlQ2xpcGJvYXJkKHRleHQpLnRoZW4oKG9rKSA9PiB7XG4gICAgICBpZiAoIW9rKSByZXR1cm5cbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxMDAwKVxuICAgIH0pXG4gIH1cbiAgY29uc3QgbGFiZWxzID0gdXNlTWVtbyhcbiAgICAoKSA9PiAoe1xuICAgICAgaW1hZ2U6IHQoJ2ZhbGxiYWNrLmltYWdlJyksXG4gICAgICBvcGVuOiB0KCdmYWxsYmFjay5vcGVuJyksXG4gICAgICBvcGVuTmFtZWQ6IChuYW1lOiBzdHJpbmcpID0+IHQoJ2ZhbGxiYWNrLm9wZW5OYW1lZCcsIHsgbmFtZSB9KSxcbiAgICAgIGxvYWRpbmc6IHQoJ2ZhbGxiYWNrLmxvYWRpbmcnKSxcbiAgICAgIGxvYWRGYWlsZWQ6IHQoJ2ZhbGxiYWNrLmxvYWRGYWlsZWQnKSxcbiAgICAgIGxpZ2h0Ym94OiB7IGRpYWxvZzogdCgnZmFsbGJhY2subGlnaHRib3hEaWFsb2cnKSwgY2xvc2U6IHQoJ2ZhbGxiYWNrLmxpZ2h0Ym94Q2xvc2UnKSB9LFxuICAgIH0pLFxuICAgIFt0XSxcbiAgKVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyXCIgZGF0YS10aW1lLWhvdmVyLXJvb3Q+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmFsbGJhY2stdXNlci1zdGFja1wiPlxuICAgICAgICB7aW1hZ2VzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgPEltYWdlR2FsbGVyeSBpbWFnZXM9e2ltYWdlc30gbG9hZD17bG9hZEltYWdlfSBhbGlnbj1cImVuZFwiIGxhYmVscz17bGFiZWxzfSAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge3RleHQgIT09ICcnID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1mYWxsYmFjay11c2VyLXJvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXItYnViYmxlXCI+e3RleHR9PC9kaXY+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZhbGxiYWNrLXVzZXItY29weVwiIHRpdGxlPXt0KCdyZXZpZXcuY29weScpfSBvbkNsaWNrPXtvbkNvcHl9PlxuICAgICAgICAgICAgICB7Y29waWVkID8gdCgncmV2aWV3LmNvcGllZCcpIDogPEljb25Db3B5IC8+fVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gSWNvbkNvcHkoKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2VXaWR0aD1cIjJcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiBzdHJva2VMaW5lam9pbj1cInJvdW5kXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cmVjdCB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiB4PVwiOFwiIHk9XCI4XCIgcng9XCIyXCIgcnk9XCIyXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNCAxNmMtMS4xIDAtMi0uOS0yLTJWNGMwLTEuMS45LTIgMi0yaDEwYzEuMSAwIDIgLjkgMiAyXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKipcbiAqIFVzZXItbm9kZSByZW5kZXJlciBzaGFkb3c6IGNhcnJpZWQgcmV2aWV3IHBhY2thZ2VzIHJlbmRlciBhcyBhIGNhcmQ7XG4gKiBldmVyeXRoaW5nIGVsc2UgcmVuZGVycyBhcyBhIG5hdGl2ZS1sb29rIGJ1YmJsZS5cbiAqL1xuZnVuY3Rpb24gVXNlclJldmlld05vZGVWaWV3KHByb3BzOiBVc2VyUmV2aWV3Tm9kZVByb3BzKSB7XG4gIGNvbnN0IGNvbnRlbnQgPSB1c2VNZW1vKCgpID0+IHByb3BzLm5vZGUuZGF0YS5jb250ZW50IGFzIHJlYWRvbmx5IFVzZXJCbG9ja1tdLCBbcHJvcHMubm9kZS5kYXRhLmNvbnRlbnRdKVxuICBjb25zdCB0ZXh0ID0gdXNlTWVtbygoKSA9PiB1c2VyTWVzc2FnZVRleHQoY29udGVudCksIFtjb250ZW50XSlcbiAgY29uc3QgaW1hZ2VzID0gdXNlTWVtbyhcbiAgICAoKSA9PiBjb250ZW50LmZpbHRlcigoYik6IGIgaXMgVXNlckJsb2NrICYgeyBhdHRhY2htZW50OiBJbWFnZUF0dGFjaG1lbnRSZWYgfSA9PiBiLnR5cGUgPT09ICdpbWFnZScgJiYgYi5hdHRhY2htZW50ICE9PSB1bmRlZmluZWQpLFxuICAgIFtjb250ZW50XSxcbiAgKVxuICBjb25zdCBwa2cgPSB1c2VNZW1vKCgpID0+IChpc1Jldmlld1BhY2thZ2VUZXh0KHRleHQpID8gcGFyc2VSZXZpZXdQYWNrYWdlKHRleHQpIDogbnVsbCksIFt0ZXh0XSlcbiAgaWYgKHBrZykge1xuICAgIHJldHVybiA8UmV2aWV3UGFja2FnZUNhcmQgcGtnPXtwa2d9IGN3ZD17cHJvcHMuY3dkfSB0PXtwcm9wcy50fSAvPlxuICB9XG4gIHJldHVybiA8RmFsbGJhY2tVc2VyQnViYmxlIHRleHQ9e3RleHR9IGltYWdlcz17aW1hZ2VzfSBsb2FkSW1hZ2U9e3Byb3BzLmxvYWRJbWFnZX0gdD17cHJvcHMudH0gLz5cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBDb21wb3NlciBkb2NrIChzZXNzaW9uIHNjb3BlKTogcGVuZGluZyBpbmxpbmUgY29tbWVudHMgZmxvYXQgYWJvdmUgdGhlXG4vLyBpbnB1dCBib3gsIENvZGV4LXN0eWxlIFx1MjAxNCBob3ZlciB0aGUgcGlsbCB0byBwcmV2aWV3LCBjbGljayBzZW5kIHRvIGluamVjdC5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG50eXBlIERpZmZSZXZpZXdDb21wb3NlckRvY2tQcm9wcyA9IFByb3BzUnVudGltZTwnY29udmVyc2F0aW9uLmlucHV0LmRvY2snPiAmIFByb3BzTG9jYWxlPCdkaWZmLXJldmlldyc+ICYgeyBzZXNzaW9uczogSVNlc3Npb25zIH1cblxuZnVuY3Rpb24gRGlmZlJldmlld0NvbXBvc2VyRG9jayh7IHNlc3Npb25JZCwgdXNlU2Vzc2lvbnMsIHNlc3Npb25zLCBpbnB1dEFjdGlvbnMsIHVzZUlucHV0LCB0IH06IERpZmZSZXZpZXdDb21wb3NlckRvY2tQcm9wcykge1xuICBjb25zdCBjd2QgPSB1c2VTZXNzaW9ucygoczogU2Vzc2lvbkxpc3RTdGF0ZSkgPT4gcy5ieUlkW3Nlc3Npb25JZF0/LmN3ZClcbiAgY29uc3QgcGVuZGluZyA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKHBlbmRpbmdDb21tZW50c1N0b3JlLnN1YnNjcmliZSwgcGVuZGluZ0NvbW1lbnRzU3RvcmUuZ2V0U25hcHNob3QpXG4gIGNvbnN0IGRyYWZ0UmVxdWVzdCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKGNvbXBvc2VyRHJhZnRTdG9yZS5zdWJzY3JpYmUsIGNvbXBvc2VyRHJhZnRTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3QgZHJhZnQgPSB1c2VJbnB1dCgoc3RhdGUpID0+IHN0YXRlLmRyYWZ0KVxuICBjb25zdCBbZGlzbWlzc2VkLCBzZXREaXNtaXNzZWRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYXJyeUZsYXNoLCBzZXRDYXJyeUZsYXNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGNhcnJ5aW5nID0gdXNlUmVmKGZhbHNlKVxuICBjb25zdCBjb25zdW1lZERyYWZ0UmVxdWVzdCA9IHVzZVJlZigwKVxuXG4gIC8vIEZpbGVzIFx1MjE5MiBBZGQgdG8gY2hhdCBzaG91bGQgb25seSBwcmVmaWxsIHRoZSBuYXRpdmUgY29tcG9zZXIuIEtlZXAgYW55XG4gIC8vIGV4aXN0aW5nIGRyYWZ0IGFuZCBhcHBlbmQgdGhlIHJlZmVyZW5jZSBvbiBhIG5ldyBsaW5lOyBzdWJtaXR0aW5nIHJlbWFpbnNcbiAgLy8gZW50aXJlbHkgdW5kZXIgdGhlIHVzZXIncyBjb250cm9sLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcmFmdFJlcXVlc3Qua2V5ID09PSAwIHx8IGRyYWZ0UmVxdWVzdC5rZXkgPT09IGNvbnN1bWVkRHJhZnRSZXF1ZXN0LmN1cnJlbnQgfHwgZHJhZnRSZXF1ZXN0LnNlc3Npb25JZCAhPT0gc2Vzc2lvbklkKSByZXR1cm5cbiAgICBjb25zdW1lZERyYWZ0UmVxdWVzdC5jdXJyZW50ID0gZHJhZnRSZXF1ZXN0LmtleVxuICAgIGlucHV0QWN0aW9ucy5zZXREcmFmdChkcmFmdC50cmltKCkgPyBgJHtkcmFmdC50cmltRW5kKCl9XFxuJHtkcmFmdFJlcXVlc3QudGV4dH1gIDogZHJhZnRSZXF1ZXN0LnRleHQpXG4gIH0sIFtkcmFmdCwgZHJhZnRSZXF1ZXN0LCBpbnB1dEFjdGlvbnMsIHNlc3Npb25JZF0pXG5cbiAgLy8gU2VlZCB0aGUgc3RvcmUgZnJvbSBzZXJ2ZXIgc3RvcmFnZSB3aGVuIG5vdGhpbmcgaGFzIGJlZW4gc3luY2VkIGZvciB0aGlzXG4gIC8vIHdvcmtzcGFjZSB5ZXQgKHBhbmVsIG5ldmVyIG9wZW5lZCB0aGlzIHNlc3Npb24gXHUyMDE0IGNvbW1lbnRzIHBlcnNpc3QgaW4gLmdpdCkuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFjd2QgfHwgcGVuZGluZy5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlXG4gICAgdm9pZCBsb2FkQ29tbWVudHMoY3dkKS50aGVuKChsaXN0KSA9PiB7XG4gICAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm5cbiAgICAgIHBlbmRpbmdDb21tZW50c1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICBpZiAoZC5jd2QgPT09IGN3ZCkgcmV0dXJuXG4gICAgICAgIGQuY3dkID0gY3dkXG4gICAgICAgIGQuY29tbWVudHMgPSBsaXN0XG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbY3dkLCBwZW5kaW5nLmN3ZF0pXG5cbiAgY29uc3QgY29tbWVudHMgPSBwZW5kaW5nLmN3ZCA9PT0gY3dkID8gcGVuZGluZy5jb21tZW50cyA6IFtdXG4gIGNvbnN0IHNlbnRTbmFwID0gdXNlU3luY0V4dGVybmFsU3RvcmUoc2VudFN0b3JlLnN1YnNjcmliZSwgc2VudFN0b3JlLmdldFNuYXBzaG90KVxuICBjb25zdCBzZW50ID0gKGN3ZCAmJiBzZW50U25hcFtjd2RdKSB8fCB7IHNlbnRDb21tZW50SWRzOiBbXSwgc2VudFJldmlld0tleTogbnVsbCB9XG4gIGNvbnN0IHNlbnRTZXQgPSBuZXcgU2V0KHNlbnQuc2VudENvbW1lbnRJZHMpXG4gIGNvbnN0IHVuc2VudENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiAhc2VudFNldC5oYXMoYy5pZCkpXG4gIGNvbnN0IHJldmlld0tleSA9XG4gICAgcGVuZGluZy5yZXZpZXc/Lm9rICYmIChwZW5kaW5nLnJldmlldy5maW5kaW5ncy5sZW5ndGggPiAwIHx8IHBlbmRpbmcucmV2aWV3LnZlcmRpY3QpXG4gICAgICA/IGAke3BlbmRpbmcucmV2aWV3LnZlcmRpY3QgPz8gJyd9OiR7cGVuZGluZy5yZXZpZXcuZmluZGluZ3MubGVuZ3RofToke3BlbmRpbmcucmV2aWV3LmZpbmRpbmdzWzBdPy50aXRsZSA/PyAnJ31gXG4gICAgICA6IG51bGxcbiAgY29uc3QgcmV2aWV3UGVuZGluZyA9IHJldmlld0tleSAhPT0gbnVsbCAmJiByZXZpZXdLZXkgIT09IHNlbnQuc2VudFJldmlld0tleVxuICBjb25zdCBoYXNQZW5kaW5nID0gdW5zZW50Q29tbWVudHMubGVuZ3RoID4gMCB8fCByZXZpZXdQZW5kaW5nXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWhhc1BlbmRpbmcpIHtcbiAgICAgIHNldERpc21pc3NlZChmYWxzZSlcbiAgICB9XG4gIH0sIFtoYXNQZW5kaW5nXSlcblxuICAvKiogQ29tcG9zZSB0aGUgZnVsbCByZXZpZXcgcGFja2FnZTogY29tbWVudHMgKyB0aGVpciBkaWZmIGh1bmtzICsgQUkgdmVyZGljdC4gKi9cbiAgY29uc3QgY29tcG9zZUNhcnJpZWRNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgbGluZXM6IHN0cmluZ1tdID0gWydcdThCRjdcdTU5MDRcdTc0MDZcdTRFRTVcdTRFMEJcdTk0ODhcdTVCRjlcdTVGNTNcdTUyNERcdTVERTVcdTRGNUNcdTUzM0FcdTc2ODRcdTg4NENcdTUxODVcdThCQzRcdTVCQTFcdThCQzRcdThCQkFcdUZGMDhBZGRyZXNzIHRoZSBpbmxpbmUgY29tbWVudHNcdUZGMENcdTRGRERcdTYzMDFcdTY1MzlcdTUyQThcdTgzMDNcdTU2RjRcdTY3MDBcdTVDMEZcdUZGMDlcdUZGMUEnLCBgXHU1REU1XHU0RjVDXHU1MzNBXHVGRjFBJHtjd2R9YCwgJyddXG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0NvbW1lbnRbXT4oKVxuICAgIGZvciAoY29uc3QgYyBvZiB1bnNlbnRDb21tZW50cykge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoYy5wYXRoKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChjKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGMucGF0aCwgW2NdKVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBjIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgICAgLy8gT3JpZ2luIHRhYiB0YWcgc28gdGhlIGNvbnZlcnNhdGlvbiBjYXJkIHJvdXRlcyBpdHMganVtcCAoJ3MnID1cbiAgICAgICAgLy8gc2Vzc2lvbiByZWxhdGl2ZSBodW5rIGxpbmVzLCAndycgPSB3b3Jrc3BhY2UgcmVhbCBsaW5lcykuXG4gICAgICAgIGNvbnN0IHRhZyA9IGMuc291cmNlID09PSAnc2Vzc2lvbicgPyAnW3NdJyA6ICdbd10nXG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHt0YWd9ICR7cGF0aH0ke2FuY2hvcn06ICR7Yy50ZXh0fWApXG4gICAgICB9XG4gICAgICBjb25zdCBodW5rcyA9IGh1bmtzRm9yTGluZXMocGVuZGluZy5kaWZmc1twYXRoXSA/PyAnJywgbGlzdC5tYXAoKGMpID0+IGMubGluZU5ldyA/PyBjLmxpbmVPbGQpKVxuICAgICAgaWYgKGh1bmtzKSB7XG4gICAgICAgIGxpbmVzLnB1c2goJ2BgYGRpZmYnKVxuICAgICAgICBsaW5lcy5wdXNoKGh1bmtzKVxuICAgICAgICBsaW5lcy5wdXNoKCdgYGAnKVxuICAgICAgfVxuICAgICAgbGluZXMucHVzaCgnJylcbiAgICB9XG4gICAgaWYgKHJldmlld1BlbmRpbmcgJiYgcGVuZGluZy5yZXZpZXcpIHtcbiAgICAgIGxpbmVzLnB1c2goJyMjIEFJIFx1OEJDNFx1NUJBMVx1N0VEM1x1OEJCQScpXG4gICAgICBsaW5lcy5wdXNoKHBlbmRpbmcucmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gJ1x1ODg2NVx1NEUwMVx1NUI1OFx1NTcyOFx1OTVFRVx1OTg5OFx1RkYwOFBhdGNoIGlzIGluY29ycmVjdFx1RkYwOScgOiAnXHU4ODY1XHU0RTAxXHU2QjYzXHU3ODZFXHVGRjA4UGF0Y2ggaXMgY29ycmVjdFx1RkYwOScpXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgcGVuZGluZy5yZXZpZXcuZmluZGluZ3MpIHtcbiAgICAgICAgbGluZXMucHVzaChgLSBbJHtmLnByaW9yaXR5fV0gJHtmLmZpbGV9OiR7Zi5saW5lU3RhcnR9JHtmLmxpbmVFbmQgIT09IGYubGluZVN0YXJ0ID8gYC0ke2YubGluZUVuZH1gIDogJyd9ICR7Zi50aXRsZX0gXHUyMDE0ICR7Zi5kZXRhaWx9YClcbiAgICAgICAgaWYgKGYuc3VnZ2VzdGlvbikgbGluZXMucHVzaChgICBcXGBcXGBcXGBcXG4ke2Yuc3VnZ2VzdGlvbn1cXG4gIFxcYFxcYFxcYGApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKS5zbGljZSgwLCAxNjAwMClcbiAgfVxuXG4gIC8qKiBNYXJrIHRoZSBjYXJyaWVkIGl0ZW1zIGFzIHNlbnQgc28gdGhleSBhcmUgbmV2ZXIgcmUtc2VudCAocGVyc2lzdGVkIHBlciBjd2QpLiAqL1xuICBjb25zdCBtYXJrU2VudCA9ICgpID0+IHtcbiAgICBpZiAoIWN3ZCkgcmV0dXJuXG4gICAgY29uc3QgY2FycmllZElkcyA9IHVuc2VudENvbW1lbnRzLm1hcCgoYykgPT4gYy5pZClcbiAgICBzZW50U3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBjb25zdCBwcmV2ID0gZFtjd2RdID8/IHsgc2VudENvbW1lbnRJZHM6IFtdLCBzZW50UmV2aWV3S2V5OiBudWxsIH1cbiAgICAgIGRbY3dkXSA9IHtcbiAgICAgICAgc2VudENvbW1lbnRJZHM6IFsuLi5uZXcgU2V0KFsuLi5wcmV2LnNlbnRDb21tZW50SWRzLCAuLi5jYXJyaWVkSWRzXSldLFxuICAgICAgICBzZW50UmV2aWV3S2V5OiByZXZpZXdQZW5kaW5nID8gcmV2aWV3S2V5IDogcHJldi5zZW50UmV2aWV3S2V5LFxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKiogU2VuZCB0aGUgcGVuZGluZyByZXZpZXcgcGFja2FnZSBub3cgKGV4cGxpY2l0IGNsaWNrIG9ubHkgXHUyMDE0IG5ldmVyIGF1dG8tY2FycmllZCkuICovXG4gIGNvbnN0IGNhcnJ5ID0gKCkgPT4ge1xuICAgIGlmICghaGFzUGVuZGluZyB8fCBjYXJyeWluZy5jdXJyZW50KSByZXR1cm5cbiAgICBjYXJyeWluZy5jdXJyZW50ID0gdHJ1ZVxuICAgIHZvaWQgaW5qZWN0VG9TZXNzaW9uKHNlc3Npb25zLCBzZXNzaW9uSWQsIGNvbXBvc2VDYXJyaWVkTWVzc2FnZSgpKS50aGVuKChvdXRjb21lKSA9PiB7XG4gICAgICBpZiAob3V0Y29tZSAhPT0gJ2ZhaWxlZCcpIG1hcmtTZW50KClcbiAgICAgIGNhcnJ5aW5nLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgc2V0Q2FycnlGbGFzaChvdXRjb21lID09PSAnc2VudCcgPyB0KCdyZXZpZXcuc2VudFRvQWdlbnQnKSA6IG91dGNvbWUgPT09ICdjb3BpZWQnID8gdCgncmV2aWV3LmNvcGllZEZhbGxiYWNrJykgOiB0KCdyZXZpZXcuc2VuZEZhaWxlZCcpKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDYXJyeUZsYXNoKG51bGwpLCAzMjAwKVxuICAgIH0pXG4gIH1cblxuICBpZiAoIWN3ZCB8fCAoIWhhc1BlbmRpbmcgJiYgIWNhcnJ5Rmxhc2gpIHx8IGRpc21pc3NlZCkgcmV0dXJuIG51bGxcblxuICAvKiogT3BlbiB0aGUgcmV2aWV3IHBhbmVsIGF0IHRoZSBjb21tZW50J3MgY2hhbmdlIGJsb2NrLiAqL1xuICBjb25zdCBmb2N1c0NvbW1lbnQgPSAoY29tbWVudDogUmV2aWV3Q29tbWVudCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmZvY3VzID0ge1xuICAgICAgICBwYXRoOiBjb21tZW50LnBhdGgsXG4gICAgICAgIGxpbmU6IGNvbW1lbnQubGluZU5ldyA/PyBjb21tZW50LmxpbmVPbGQgPz8gdW5kZWZpbmVkLFxuICAgICAgICB0YWI6IGNvbW1lbnQuc291cmNlID09PSAnc2Vzc2lvbicgPyAnc2Vzc2lvbicgOiAnd29ya3NwYWNlJyxcbiAgICAgIH1cbiAgICAgIGQua2V5ID0gZC5rZXkgKyAxXG4gICAgfSlcbiAgfVxuXG4gIC8qKiBPcGVuIHRoZSByZXZpZXcgcGFuZWwgd2l0aG91dCBhIGp1bXAgdGFyZ2V0ICgrTiBjaGlwKS4gKi9cbiAgY29uc3Qgb3BlblBhbmVsID0gKCkgPT4ge1xuICAgIG92ZXJsYXlTdG9yZS51cGRhdGUoKGQpID0+IHtcbiAgICAgIGQub3BlbiA9IHRydWVcbiAgICAgIGQuY3dkID0gY3dkXG4gICAgICBkLmZvY3VzID0gbnVsbFxuICAgICAgZC5rZXkgPSBkLmtleSArIDFcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZG9ja1wiPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWRvY2staGVhZFwiXG4gICAgICAgIHJvbGU9XCJidXR0b25cIlxuICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5kb2NrU2VuZCcpfVxuICAgICAgICBvbkNsaWNrPXtjYXJyeX1cbiAgICAgICAgb25LZXlEb3duPXsoZSkgPT4ge1xuICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJyB8fCBlLmtleSA9PT0gJyAnKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGNhcnJ5KClcbiAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1pY29uXCI+PEljb25Db21tZW50IC8+PC9zcGFuPlxuICAgICAgICB7Y2FycnlGbGFzaCA/IChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRvY2stZmxhc2hcIj57Y2FycnlGbGFzaH08L3NwYW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNvdW50XCI+XG4gICAgICAgICAgICB7dCgncmV2aWV3LmRvY2tDb21tZW50cycsIHsgbjogdW5zZW50Q29tbWVudHMubGVuZ3RoIH0pfVxuICAgICAgICAgICAge3Jldmlld1BlbmRpbmcgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5kb2NrVmVyZGljdCcpfWAgOiAnJ31cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICl9XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLXNlbmQtaGludFwiPnt0KCdyZXZpZXcuZG9ja1NlbmQnKX08L3NwYW4+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLWRvY2stY2xvc2VcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9e3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIHNldERpc21pc3NlZCh0cnVlKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SWNvblggLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIHt1bnNlbnRDb21tZW50cy5sZW5ndGggPiAwID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwc1wiPlxuICAgICAgICAgIHt1bnNlbnRDb21tZW50cy5zbGljZSgwLCBNQVhfRE9DS19DSElQUykubWFwKChjb21tZW50KSA9PiAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwXCJcbiAgICAgICAgICAgICAgdGl0bGU9e3QoJ3Jldmlldy5kb2NrSnVtcCcpfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBmb2N1c0NvbW1lbnQoY29tbWVudCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZG9jay1jaGlwLWxvY1wiPntjb21tZW50LnBhdGh9e2NvbW1lbnQubGluZU5ldyAhPT0gbnVsbCA/IGA6JHtjb21tZW50LmxpbmVOZXd9YCA6ICcnfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNoaXAtdGV4dFwiPntjb21tZW50LnRleHR9PC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSl9XG4gICAgICAgICAge3Vuc2VudENvbW1lbnRzLmxlbmd0aCA+IE1BWF9ET0NLX0NISVBTID8gKFxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1kb2NrLWNoaXAtbW9yZVwiIHRpdGxlPXt0KCdyZXZpZXcuZG9ja01vcmUnLCB7IG46IHVuc2VudENvbW1lbnRzLmxlbmd0aCAtIE1BWF9ET0NLX0NISVBTIH0pfSBvbkNsaWNrPXtvcGVuUGFuZWx9PlxuICAgICAgICAgICAgICAre3Vuc2VudENvbW1lbnRzLmxlbmd0aCAtIE1BWF9ET0NLX0NISVBTfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSZXZpZXcgb3ZlcmxheSAocm9vdCBzY29wZSk6IHNlc3Npb24gKyB3b3Jrc3BhY2UgdGFicy5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBEaWZmUmV2aWV3T3ZlcmxheSh7IHNlc3Npb25zLCB0IH06IERpZmZSZXZpZXdPdmVybGF5UHJvcHMpIHtcbiAgY29uc3Qgc3RvcmVTdGF0ZSA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKG92ZXJsYXlTdG9yZS5zdWJzY3JpYmUsIG92ZXJsYXlTdG9yZS5nZXRTbmFwc2hvdClcbiAgY29uc3QgcHJlZnMgPSB1c2VTeW5jRXh0ZXJuYWxTdG9yZShwcmVmc1N0b3JlLnN1YnNjcmliZSwgcHJlZnNTdG9yZS5nZXRTbmFwc2hvdClcbiAgLy8gR2l0LWZpcnN0OiBsYW5kIG9uIHRoZSB3b3Jrc3BhY2UgdGFiIChzdGFnZWQvdW5zdGFnZWQvYnJhbmNoIHRyZWVzKSBzbyB0aGVcbiAgLy8gY2hhbmdlIHJldmlldyBpcyBvbmUgY2xpY2sgYXdheTsgdGhlIHNlc3Npb24gdGFiIHN0YXlzIGEgY2xpY2sgYXdheS5cbiAgY29uc3QgW3RhYiwgc2V0VGFiXSA9IHVzZVN0YXRlPCdzZXNzaW9uJyB8ICd3b3Jrc3BhY2UnPignd29ya3NwYWNlJylcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gdXNlU3RhdGU8Vmlld01vZGU+KCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHR5cGVvZiBsb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkc2RyLXZpZXcnKSA9PT0gJ3NwbGl0JyA/ICdzcGxpdCcgOiAnc2luZ2xlJ1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuICdzaW5nbGUnXG4gICAgfVxuICB9KVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZHNkci12aWV3JywgdmlldylcbiAgICB9IGNhdGNoIHtcbiAgICAgIC8vIHByaXZhdGUgbW9kZSAvIHVuYXZhaWxhYmxlIFx1MjAxNCBub24tZmF0YWxcbiAgICB9XG4gIH0sIFt2aWV3XSlcblxuICAvLyBXb3Jrc3BhY2UgdGFiIHN0YXRlLlxuICBjb25zdCBbc3RhdHVzLCBzZXRTdGF0dXNdID0gdXNlU3RhdGU8U3RhdHVzUmVzcG9uc2UgfCBudWxsPihudWxsKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzZWxlY3RlZCwgc2V0U2VsZWN0ZWRdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbm90aWNlLCBzZXROb3RpY2VdID0gdXNlU3RhdGU8eyBraW5kOiAnb2snIHwgJ2Vycm9yJzsgdGV4dDogc3RyaW5nIH0gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29uZmlybSwgc2V0Q29uZmlybV0gPSB1c2VTdGF0ZTwnZmlsZScgfCAnYWxsJyB8ICdwdXNoJyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXRNZXNzYWdlLCBzZXRDb21taXRNZXNzYWdlXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbY29tbWl0T3Blbiwgc2V0Q29tbWl0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2luY2x1ZGVVbnN0YWdlZCwgc2V0SW5jbHVkZVVuc3RhZ2VkXSA9IHVzZVN0YXRlKGZhbHNlKVxuICAvLyBMb2NhbCAodW5wdXNoZWQpIGNvbW1pdCBoaXN0b3J5OiBsaXN0ICsgcGVyLWNvbW1pdCBkaWZmIHZpZXcuXG4gIGNvbnN0IFtoaXN0b3J5LCBzZXRIaXN0b3J5XSA9IHVzZVN0YXRlPENvbW1pdEluZm9bXT4oW10pXG4gIGNvbnN0IFtzZWxlY3RlZENvbW1pdCwgc2V0U2VsZWN0ZWRDb21taXRdID0gdXNlU3RhdGU8Q29tbWl0SW5mbyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXREaWZmLCBzZXRDb21taXREaWZmXSA9IHVzZVN0YXRlPENvbW1pdERpZmZSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtjb21taXREaWZmTG9hZGluZywgc2V0Q29tbWl0RGlmZkxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZWxlY3RlZENvbW1pdEZpbGUsIHNldFNlbGVjdGVkQ29tbWl0RmlsZV0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuICAvLyBJbmxpbmUgcmV2aWV3IGNvbW1lbnRzICh3b3Jrc3BhY2UgdGFiLCBzaW5nbGUgdmlldykuXG4gIGNvbnN0IFtjb21tZW50cywgc2V0Q29tbWVudHNdID0gdXNlU3RhdGU8UmV2aWV3Q29tbWVudFtdPihbXSlcbiAgY29uc3QgW2NvbW1lbnRFZGl0b3IsIHNldENvbW1lbnRFZGl0b3JdID0gdXNlU3RhdGU8eyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0gfCBudWxsPihudWxsKVxuICBjb25zdCBbY29tbWVudFRleHQsIHNldENvbW1lbnRUZXh0XSA9IHVzZVN0YXRlKCcnKVxuICAvLyBSZXZpZXcgc2NvcGU6IHdoaWNoIHNsaWNlIG9mIHRoZSByZXBvc2l0b3J5IHRoZSB3b3Jrc3BhY2UgdGFiIHNob3dzLlxuICBjb25zdCBbc2NvcGUsIHNldFNjb3BlXSA9IHVzZVN0YXRlPFdvcmtzcGFjZVNjb3BlPignbGFzdC10dXJuJylcbiAgY29uc3QgW2JyYW5jaGVzLCBzZXRCcmFuY2hlc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oW10pXG4gIGNvbnN0IFtiYXNlQnJhbmNoLCBzZXRCYXNlQnJhbmNoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtiYXNlU3RhdHVzLCBzZXRCYXNlU3RhdHVzXSA9IHVzZVN0YXRlPFN0YXR1c1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gRmVlZGJhY2sgbG9vcDogc2VuZCBpbmxpbmUgY29tbWVudHMgdG8gdGhlIGFnZW50IChzZXNzaW9uLnByb21wdCwgY29weSBmYWxsYmFjaykuXG4gIGNvbnN0IFtzZW5kT3Blbiwgc2V0U2VuZE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZW5kVGV4dCwgc2V0U2VuZFRleHRdID0gdXNlU3RhdGUoJycpXG4gIC8vIEFJIHJldmlldyAoL3Jldmlldyk6IGZpbmRpbmdzICsgdmVyZGljdC5cbiAgY29uc3QgW3Jldmlldywgc2V0UmV2aWV3XSA9IHVzZVN0YXRlPFJldmlld1Jlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3Jldmlld2luZywgc2V0UmV2aWV3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICAvLyBHaXRIdWIgUFIgY29udGV4dCAoZ2ggQ0xJKS5cbiAgY29uc3QgW3ByLCBzZXRQcl0gPSB1c2VTdGF0ZTxQclJlc3BvbnNlIHwgbnVsbD4obnVsbClcbiAgLy8gTXVsdGktcmVwbzogcmVwb3MgZGV0ZWN0ZWQgdW5kZXIgdGhlIHdvcmtzcGFjZSArIHRoZSBzZWxlY3RlZCBvbmUuXG4gIGNvbnN0IFtyZXBvcywgc2V0UmVwb3NdID0gdXNlU3RhdGU8eyBwYXRoOiBzdHJpbmc7IGJyYW5jaDogc3RyaW5nIHwgbnVsbCB9W10+KFtdKVxuICBjb25zdCBbcmVwb1BhdGgsIHNldFJlcG9QYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtzdXJmYWNlLCBzZXRTdXJmYWNlXSA9IHVzZVN0YXRlPCdyZXZpZXcnIHwgJ2ZpbGVzJz4oJ3JldmlldycpXG4gIGNvbnN0IFtmaWxlc1RhcmdldCwgc2V0RmlsZXNUYXJnZXRdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2NvbGxhcHNlZFJldmlld0ZpbGVzLCBzZXRDb2xsYXBzZWRSZXZpZXdGaWxlc10gPSB1c2VTdGF0ZTxSZWFkb25seVNldDxzdHJpbmc+PigoKSA9PiBuZXcgU2V0KCkpXG4gIC8vIFRlbXBvcmFyeSBsaW5lIGhpZ2hsaWdodCAoanVtcCB0YXJnZXQgZnJvbSBhIFBSIGNvbW1lbnQgb3IgYSBmaW5kaW5nKS5cbiAgY29uc3QgW2p1bXBMaW5lLCBzZXRKdW1wTGluZV0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxuXG4gIC8qKiBTZWxlY3QgYSBmaWxlIGFuZCBmbGFzaCBpdHMgbGluZSAoZmluZGluZ3MgLyBQUiBjb21tZW50cykuICovXG4gIGNvbnN0IGp1bXBUbyA9IChmaWxlOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpID0+IHtcbiAgICBzZXRTZWxlY3RlZChmaWxlKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0KG51bGwpXG4gICAgc2V0U2VsZWN0ZWRDb21taXRGaWxlKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgIHNldEp1bXBMaW5lKGxpbmUgPz8gbnVsbClcbiAgICBzZXRUaW1lb3V0KCgpID0+IHNldEp1bXBMaW5lKG51bGwpLCAyNTAwKVxuICB9XG4gIC8vIENvbGxhcHNlZCBkaXJlY3RvcmllcyBpbiB0aGUgbGVmdC1oYW5kIGZpbGUgdHJlZSAoc2hhcmVkIGFjcm9zcyB0YWJzKS5cbiAgY29uc3QgW2NvbGxhcHNlZERpcnMsIHNldENvbGxhcHNlZERpcnNdID0gdXNlU3RhdGU8UmVhZG9ubHlTZXQ8c3RyaW5nPj4oKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCB0b2dnbGVEaXIgPSB1c2VNZW1vKFxuICAgICgpID0+IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgIHNldENvbGxhcHNlZERpcnMoKHByZXYpID0+IHtcbiAgICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQocHJldilcbiAgICAgICAgaWYgKG5leHQuaGFzKHBhdGgpKSBuZXh0LmRlbGV0ZShwYXRoKVxuICAgICAgICBlbHNlIG5leHQuYWRkKHBhdGgpXG4gICAgICAgIHJldHVybiBuZXh0XG4gICAgICB9KVxuICAgIH0sXG4gICAgW10sXG4gIClcbiAgY29uc3Qgbm90aWNlVGltZXIgPSB1c2VSZWY8UmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ+KHVuZGVmaW5lZClcblxuICAvLyBDdXJyZW50IHNlc3Npb24ncyBjb252ZXJzYXRpb24gc25hcHNob3QgKHJlYWN0aXZlKSwgZm9yIHRoZSBzZXNzaW9uIHRhYi5cbiAgY29uc3QgY3VycmVudElkID0gdXNlU3luY0V4dGVybmFsU3RvcmUoXG4gICAgdXNlTWVtbygoKSA9PiAobm90aWZ5OiAoKSA9PiB2b2lkKSA9PiBzZXNzaW9ucy5saXN0LnN1YnNjcmliZShub3RpZnkpLCBbc2Vzc2lvbnNdKSxcbiAgICB1c2VNZW1vKCgpID0+ICgpID0+IHNlc3Npb25zLmxpc3QuZ2V0U25hcHNob3QoKS5jdXJyZW50LCBbc2Vzc2lvbnNdKSxcbiAgKVxuICBjb25zdCBzbmFwc2hvdCA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgIHVzZU1lbW8oKCkgPT4ge1xuICAgICAgcmV0dXJuIChub3RpZnk6ICgpID0+IHZvaWQpID0+IHtcbiAgICAgICAgY29uc3QgYmluZGluZyA9IGN1cnJlbnRJZCA/IHNlc3Npb25zLmJpbmRpbmcoY3VycmVudElkKSA6IHVuZGVmaW5lZFxuICAgICAgICBpZiAoIWJpbmRpbmcpIHJldHVybiAoKSA9PiB7fVxuICAgICAgICByZXR1cm4gYmluZGluZy5zZXNzaW9uLnN1YnNjcmliZShub3RpZnkpXG4gICAgICB9XG4gICAgfSwgW3Nlc3Npb25zLCBjdXJyZW50SWRdKSxcbiAgICB1c2VNZW1vKCgpID0+IHtcbiAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGJpbmRpbmcgPSBjdXJyZW50SWQgPyBzZXNzaW9ucy5iaW5kaW5nKGN1cnJlbnRJZCkgOiB1bmRlZmluZWRcbiAgICAgICAgcmV0dXJuIGJpbmRpbmcgPyBiaW5kaW5nLnNlc3Npb24uZ2V0U25hcHNob3QoKSA6IG51bGxcbiAgICAgIH1cbiAgICB9LCBbc2Vzc2lvbnMsIGN1cnJlbnRJZF0pLFxuICApXG5cbiAgY29uc3Qgcm91bmRzID0gdXNlTWVtbygoKSA9PiAoc25hcHNob3QgPyBjb2xsZWN0U2Vzc2lvblJvdW5kcyhzbmFwc2hvdC5ub2RlcykgOiBbXSksIFtzbmFwc2hvdF0pXG4gIC8vIERpYWdub3N0aWNzIGZvciB0aGUgZW1wdHkgc2Vzc2lvbi1jaGFuZ2VzIHN0YXRlOiB3aGF0IHRoZSBzbmFwc2hvdCBzY2FuIGZvdW5kLlxuICBjb25zdCBzZXNzaW9uU2NhbiA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICghc25hcHNob3QpIHJldHVybiBudWxsXG4gICAgbGV0IHJlc3VsdHMgPSAwXG4gICAgbGV0IGRpZmZDYXJkcyA9IDBcbiAgICBsZXQgcGF0aE9ubHkgPSAwXG4gICAgZm9yIChjb25zdCBub2RlIG9mIHNuYXBzaG90Lm5vZGVzKSB7XG4gICAgICBpZiAobm9kZS5raW5kICE9PSAndG9vbC1yZXN1bHQnKSBjb250aW51ZVxuICAgICAgcmVzdWx0cysrXG4gICAgICBjb25zdCBjaGFuZ2VzID0gY2hhbmdlc0Zyb21Ub29sUmVzdWx0KG5vZGUuY2FsbCwgbm9kZSlcbiAgICAgIGlmIChjaGFuZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuc29tZSgoeCkgPT4geC5oYXNEaWZmKSkgZGlmZkNhcmRzKytcbiAgICAgICAgZWxzZSBwYXRoT25seSsrXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHJlc3VsdHMsIGRpZmZDYXJkcywgcGF0aE9ubHkgfVxuICB9LCBbc25hcHNob3RdKVxuICAvLyBMZWZ0LWhhbmQgZmlsZSB0cmVlczogcGVyLXJvdW5kIHRyZWVzIGZvciB0aGUgc2Vzc2lvbiB0YWIsIG9uZSB0cmVlIGZvclxuICAvLyB0aGUgZ2l0IHdvcmtpbmcgdHJlZSBvbiB0aGUgd29ya3NwYWNlIHRhYi5cbiAgY29uc3Qgc2Vzc2lvblRyZWVzID0gdXNlTWVtbygoKSA9PiBuZXcgTWFwKHJvdW5kcy5tYXAoKHIpID0+IFtyLnJvdW5kLCBidWlsZEZpbGVUcmVlKHIuY2hhbmdlcywgKGMpID0+IGMucGF0aCldKSksIFtyb3VuZHNdKVxuICBjb25zdCB0b3RhbFNlc3Npb25GaWxlcyA9IHVzZU1lbW8oKCkgPT4gcm91bmRzLnJlZHVjZSgobiwgcikgPT4gbiArIHIuY2hhbmdlcy5sZW5ndGgsIDApLCBbcm91bmRzXSlcbiAgY29uc3QgW3NlbGVjdGVkUm91bmQsIHNldFNlbGVjdGVkUm91bmRdID0gdXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkUGF0aCwgc2V0U2VsZWN0ZWRQYXRoXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHNlbGVjdGVkQ2hhbmdlID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3Qgcm91bmQgPSByb3VuZHMuZmluZCgocikgPT4gci5yb3VuZCA9PT0gc2VsZWN0ZWRSb3VuZClcbiAgICByZXR1cm4gcm91bmQ/LmNoYW5nZXMuZmluZCgoYykgPT4gYy5wYXRoID09PSBzZWxlY3RlZFBhdGgpID8/IG51bGxcbiAgfSwgW3JvdW5kcywgc2VsZWN0ZWRSb3VuZCwgc2VsZWN0ZWRQYXRoXSlcbiAgLyoqIExhc3QgVHVybiBpcyBzb3VyY2VkIGZyb20gcGVyc2lzdGVkIHNlc3Npb24gZGlmZnMsIG5vdCB0aGUgYWN0aXZlIGdpdCByZXBvLiAqL1xuICBjb25zdCBsYXN0VHVybkZpbGVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3QgbGFzdCA9IHJvdW5kcy5hdCgtMSlcbiAgICByZXR1cm4gbGFzdCA/IGxhc3QuY2hhbmdlcy5maWx0ZXIoKGNoYW5nZSkgPT4gY2hhbmdlLmhhc0RpZmYpLm1hcChzZXNzaW9uQ2hhbmdlVG9EaWZmRmlsZSkgOiBbXVxuICB9LCBbcm91bmRzXSlcblxuICBjb25zdCBjd2QgPSBzdG9yZVN0YXRlLmN3ZFxuICAvKiogQWN0aXZlIGdpdCByZXBvIGZvciB3b3Jrc3BhY2Ugb3BlcmF0aW9ucyAobXVsdGktcmVwbyBzZWxlY3RvciBvdmVycmlkZSkuICovXG4gIGNvbnN0IGFjdGl2ZUN3ZCA9IHJlcG9QYXRoID8/IGN3ZFxuXG4gIGNvbnN0IGxvYWRXb3Jrc3BhY2UgPSBhc3luYyAoc2lsZW50ID0gZmFsc2UpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgaWYgKCFzaWxlbnQpIHNldExvYWRpbmcodHJ1ZSlcbiAgICBzZXRFcnJvcihudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBbbmV4dCwgaGlzdCwgbmV4dENvbW1lbnRzLCBicmFuY2hMaXN0LCBwckRhdGEsIHJlcG9MaXN0XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgbG9hZFN0YXR1cyhhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkSGlzdG9yeShhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkQ29tbWVudHMoYWN0aXZlQ3dkKSxcbiAgICAgICAgbG9hZEJyYW5jaGVzKGFjdGl2ZUN3ZCksXG4gICAgICAgIGxvYWRQcihhY3RpdmVDd2QpLFxuICAgICAgICBsb2FkUmVwb3MoYWN0aXZlQ3dkKSxcbiAgICAgIF0pXG4gICAgICBzZXRTdGF0dXMobmV4dClcbiAgICAgIGlmIChoaXN0Lm9rKSBzZXRIaXN0b3J5KGhpc3QuY29tbWl0cylcbiAgICAgIHNldENvbW1lbnRzKG5leHRDb21tZW50cylcbiAgICAgIHNldEJyYW5jaGVzKGJyYW5jaExpc3QpXG4gICAgICBzZXRQcihwckRhdGEpXG4gICAgICBzZXRSZXBvcyhyZXBvTGlzdC5yZXBvcylcbiAgICAgIC8vIERlZmF1bHQgdGhlIHJlcG8gc2VsZWN0b3IgdG8gdGhlIHdvcmtzcGFjZSByb290IHdoZW4gaXQgaXMgaXRzZWxmIGEgcmVwby5cbiAgICAgIGlmIChyZXBvUGF0aCA9PT0gbnVsbCAmJiAhcmVwb0xpc3QucmVwb3Muc29tZSgocikgPT4gci5wYXRoID09PSBhY3RpdmVDd2QpKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0ID0gcmVwb0xpc3QucmVwb3NbMF1cbiAgICAgICAgaWYgKGZpcnN0ICYmIGZpcnN0LnBhdGggIT09IGN3ZCkgc2V0UmVwb1BhdGgoZmlyc3QucGF0aClcbiAgICAgIH1cbiAgICAgIGlmIChuZXh0LmVycm9yICYmICFuZXh0LmlzUmVwbykgc2V0RXJyb3IobmV4dC5lcnJvcilcbiAgICAgIHNldFNlbGVjdGVkKChwcmV2KSA9PiAocHJldiAmJiBuZXh0LmZpbGVzLnNvbWUoKGYpID0+IGYucGF0aCA9PT0gcHJldikgPyBwcmV2IDogbmV4dC5maWxlc1swXT8ucGF0aCA/PyBudWxsKSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXRFcnJvcihlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiBTdHJpbmcoZSkpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLy8gQXV0by1yZWZyZXNoIHRoZSB3b3Jrc3BhY2UgZGF0YTogcmVsb2FkIHdoZW5ldmVyIHRoZSB0YWIgYmVjb21lcyBhY3RpdmUgb3JcbiAgLy8gdGhlIHdvcmtzcGFjZSBjaGFuZ2VzLCBhbmQgcGVyaW9kaWNhbGx5IHdoaWxlIHRoZSBvdmVybGF5IGlzIG9wZW4uIEFcbiAgLy8gd29ya3NwYWNlIHN3aXRjaCBjbGVhcnMgc3RhbGUgY29tbWl0IHNlbGVjdGlvbiBhbmQgaGlzdG9yeSBmaXJzdC5cbiAgY29uc3Qgd29ya3NwYWNlQ3dkUmVmID0gdXNlUmVmPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcHJldmlvdXMgPSB3b3Jrc3BhY2VDd2RSZWYuY3VycmVudFxuICAgIHdvcmtzcGFjZUN3ZFJlZi5jdXJyZW50ID0gYWN0aXZlQ3dkID8/IG51bGxcbiAgICBpZiAodGFiICE9PSAnd29ya3NwYWNlJyB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAocHJldmlvdXMgIT09IGFjdGl2ZUN3ZCkge1xuICAgICAgc2V0U2VsZWN0ZWRDb21taXQobnVsbClcbiAgICAgIHNldENvbW1pdERpZmYobnVsbClcbiAgICAgIHNldFNlbGVjdGVkQ29tbWl0RmlsZShudWxsKVxuICAgICAgc2V0SGlzdG9yeShbXSlcbiAgICAgIHNldENvbW1lbnRzKFtdKVxuICAgICAgc2V0Q29tbWVudEVkaXRvcihudWxsKVxuICAgICAgc2V0UmV2aWV3KG51bGwpXG4gICAgICBzZXRQcihudWxsKVxuICAgIH1cbiAgICB2b2lkIGxvYWRXb3Jrc3BhY2UoKVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgfSwgW3RhYiwgYWN0aXZlQ3dkXSlcblxuICAvLyBTdXJmYWNlIHdvcmtzcGFjZSBjb21tZW50cyBhYm92ZSB0aGUgY29tcG9zZXIgKENvZGV4LXN0eWxlIGRvY2spLCBhbG9uZ1xuICAvLyB3aXRoIHRoZSBkaWZmIGNvbnRleHQgYW5kIHRoZSBsYXN0IEFJIHJldmlldyByZXN1bHQuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcGVuZGluZ0NvbW1lbnRzU3RvcmUudXBkYXRlKChkKSA9PiB7XG4gICAgICBkLmN3ZCA9IGFjdGl2ZUN3ZCA/PyBudWxsXG4gICAgICBkLmNvbW1lbnRzID0gY29tbWVudHNcbiAgICAgIGNvbnN0IGRpZmZzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbiAgICAgIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgICAgICBjb25zdCBmaWxlID0gc3RhdHVzPy5maWxlcy5maW5kKChmKSA9PiBmLnBhdGggPT09IGMucGF0aClcbiAgICAgICAgaWYgKGZpbGU/LmRpZmYpIGRpZmZzW2MucGF0aF0gPSBmaWxlLmRpZmZcbiAgICAgIH1cbiAgICAgIGQuZGlmZnMgPSBkaWZmc1xuICAgICAgZC5yZXZpZXcgPSByZXZpZXdcbiAgICB9KVxuICB9LCBbY29tbWVudHMsIGFjdGl2ZUN3ZCwgc3RhdHVzLCByZXZpZXddKVxuXG4gIC8vIEp1bXAgdG8gYSBjaGFuZ2UgYmxvY2sgZnJvbSB0aGUgY29tcG9zZXIgZG9jayAoY29tbWVudCBjbGljaykuIENvbW1lbnRzXG4gIC8vIGNyZWF0ZWQgaW4gdGhlIHNlc3Npb24gdGFiIGFuY2hvciB0byBSRUxBVElWRSBodW5rIGxpbmVzLCBzbyB0aG9zZSBqdW1wc1xuICAvLyBzdGF5IGluIHRoZSBzZXNzaW9uIHRhYjsgd29ya3NwYWNlIGNvbW1lbnRzIGp1bXAgdG8gcmVhbCBmaWxlIGxpbmVzLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGZvY3VzID0gc3RvcmVTdGF0ZS5mb2N1c1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuIHx8ICFjd2QgfHwgIWZvY3VzKSByZXR1cm5cbiAgICBpZiAoZm9jdXMudGFiID09PSAnc2Vzc2lvbicpIHtcbiAgICAgIC8vIFJlcGx5IGNhcmRzIGFsd2F5cyBvcGVuIHRoZSBzYW1lIExhc3QgVHVybiB2aWV3OyBpdCBpcyBpbnRlbnRpb25hbGx5XG4gICAgICAvLyBpbmRlcGVuZGVudCBmcm9tIHRoZSBhY3RpdmUgR2l0IHJlcG9zaXRvcnkgc2VsZWN0aW9uLlxuICAgICAgc2V0VGFiKCd3b3Jrc3BhY2UnKVxuICAgICAgc2V0U2NvcGUoJ2xhc3QtdHVybicpXG4gICAgICBzZXRTZWxlY3RlZChmb2N1cy5wYXRoKVxuICAgICAgc2V0SnVtcExpbmUoZm9jdXMubGluZSA/PyBudWxsKVxuICAgICAgY29uc3Qgc2Nyb2xsVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKGZvY3VzLmxpbmUgIT0gbnVsbCkge1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWRzZHItbGluZT1cIiR7Zm9jdXMubGluZX1cIl1gKT8uc2Nyb2xsSW50b1ZpZXcoeyBibG9jazogJ2NlbnRlcicsIGJlaGF2aW9yOiAnc21vb3RoJyB9KVxuICAgICAgICB9XG4gICAgICB9LCA4MClcbiAgICAgIGNvbnN0IGNsZWFyVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHNldEp1bXBMaW5lKG51bGwpLCAyNTAwKVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNjcm9sbFRpbWVyKVxuICAgICAgICBjbGVhclRpbWVvdXQoY2xlYXJUaW1lcilcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0VGFiKCd3b3Jrc3BhY2UnKVxuICAgIHNldFNlbGVjdGVkKGZvY3VzLnBhdGgpXG4gICAgc2V0SnVtcExpbmUoZm9jdXMubGluZSA/PyBudWxsKVxuICAgIGNvbnN0IHNjcm9sbFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAoZm9jdXMubGluZSAhPSBudWxsKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWRzZHItbGluZT1cIiR7Zm9jdXMubGluZX1cIl1gKT8uc2Nyb2xsSW50b1ZpZXcoeyBibG9jazogJ2NlbnRlcicsIGJlaGF2aW9yOiAnc21vb3RoJyB9KVxuICAgICAgfVxuICAgIH0sIDgwKVxuICAgIGNvbnN0IGNsZWFyVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHNldEp1bXBMaW5lKG51bGwpLCAyNTAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQoc2Nyb2xsVGltZXIpXG4gICAgICBjbGVhclRpbWVvdXQoY2xlYXJUaW1lcilcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc3RvcmVTdGF0ZS5rZXldKVxuXG4gIC8vIEtlZXAgc3RhZ2VkL3Vuc3RhZ2VkL2hpc3RvcnkgZnJlc2ggd2hpbGUgdGhlIHdvcmtzcGFjZSB0YWIgaXMgb3Blbi5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCB0YWIgIT09ICd3b3Jrc3BhY2UnIHx8ICFhY3RpdmVDd2QpIHJldHVyblxuICAgIGNvbnN0IHRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdm9pZCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgfSwgMTUwMDApXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwodGltZXIpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc3RvcmVTdGF0ZS5vcGVuLCB0YWIsIGFjdGl2ZUN3ZF0pXG5cbiAgLy8gQnJhbmNoIHNjb3BlOiBkaWZmIHRoZSB3b3JrdHJlZSBhZ2FpbnN0IHRoZSBzZWxlY3RlZCBiYXNlIGJyYW5jaC5cbiAgLy8gRGVmYXVsdCB0aGUgYmFzZSB0byB0aGUgZmlyc3QgYnJhbmNoIHRoYXQgaXNuJ3QgdGhlIGN1cnJlbnQgb25lLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzY29wZSAhPT0gJ2JyYW5jaCcgfHwgIWFjdGl2ZUN3ZCkgcmV0dXJuXG4gICAgY29uc3QgY3VycmVudCA9IHN0YXR1cz8uYnJhbmNoID8/IG51bGxcbiAgICBpZiAoYmFzZUJyYW5jaCA9PT0gbnVsbCAmJiBicmFuY2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBmYWxsYmFjayA9IGJyYW5jaGVzLmZpbmQoKGIpID0+IGIgIT09IGN1cnJlbnQpID8/IGJyYW5jaGVzWzBdXG4gICAgICBzZXRCYXNlQnJhbmNoKGZhbGxiYWNrKVxuICAgIH1cbiAgfSwgW3Njb3BlLCBhY3RpdmVDd2QsIGJyYW5jaGVzLCBiYXNlQnJhbmNoLCBzdGF0dXM/LmJyYW5jaF0pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2NvcGUgIT09ICdicmFuY2gnIHx8ICFhY3RpdmVDd2QgfHwgIWJhc2VCcmFuY2gpIHtcbiAgICAgIHNldEJhc2VTdGF0dXMobnVsbClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsZXQgY2FuY2VsbGVkID0gZmFsc2VcbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChgJHtTVEFUVVNfVVJMfT9jd2Q9JHtlbmNvZGVVUklDb21wb25lbnQoYWN0aXZlQ3dkKX0mYmFzZT0ke2VuY29kZVVSSUNvbXBvbmVudChiYXNlQnJhbmNoKX1gLCB7IGhlYWRlcnM6IHsgYWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSB9KVxuICAgICAgY29uc3QgZGF0YSA9IChhd2FpdCByZXMuanNvbigpLmNhdGNoKCgpID0+IG51bGwpKSBhcyBTdGF0dXNSZXNwb25zZSB8IG51bGxcbiAgICAgIGlmICghY2FuY2VsbGVkICYmIGRhdGEpIHtcbiAgICAgICAgc2V0QmFzZVN0YXR1cyhkYXRhKVxuICAgICAgICBpZiAoZGF0YS5lcnJvciAmJiBiYXNlU3RhdHVzPy5lcnJvciAhPT0gZGF0YS5lcnJvcikgc2V0RXJyb3IoZGF0YS5lcnJvcilcbiAgICAgIH1cbiAgICB9KSgpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNhbmNlbGxlZCA9IHRydWVcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICB9LCBbc2NvcGUsIGFjdGl2ZUN3ZCwgYmFzZUJyYW5jaF0pXG5cbiAgLy8gRGVmYXVsdCBzZWxlY3Rpb24gZm9yIHRoZSBzZXNzaW9uIHRhYiBmb2xsb3dzIHRoZSBmaXJzdCByb3VuZCB3aXRoIGNoYW5nZXMuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkUm91bmQgPT09IG51bGwgJiYgcm91bmRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmRzWzBdLnJvdW5kKVxuICAgICAgc2V0U2VsZWN0ZWRQYXRoKHJvdW5kc1swXS5jaGFuZ2VzWzBdPy5wYXRoID8/IG51bGwpXG4gICAgfVxuICB9LCBbcm91bmRzLCBzZWxlY3RlZFJvdW5kXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghc3RvcmVTdGF0ZS5vcGVuKSByZXR1cm5cbiAgICBjb25zdCBvbktleSA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgIGQub3BlbiA9IGZhbHNlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgICByZXR1cm4gKCkgPT4gZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5KVxuICB9LCBbc3RvcmVTdGF0ZS5vcGVuXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghbm90aWNlKSByZXR1cm5cbiAgICBub3RpY2VUaW1lci5jdXJyZW50ID0gc2V0VGltZW91dCgoKSA9PiBzZXROb3RpY2UobnVsbCksIDMwMDApXG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dChub3RpY2VUaW1lci5jdXJyZW50KVxuICB9LCBbbm90aWNlXSlcblxuICBjb25zdCBmaWxlcyA9IHN0YXR1cz8uaXNSZXBvID8gc3RhdHVzLmZpbGVzIDogW11cbiAgY29uc3Qgc3RhZ2VkRmlsZXMgPSB1c2VNZW1vKCgpID0+IGZpbGVzLmZpbHRlcigoZikgPT4gZi5zdGFnZWQpLCBbZmlsZXNdKVxuICBjb25zdCB1bnN0YWdlZEZpbGVzID0gdXNlTWVtbygoKSA9PiBmaWxlcy5maWx0ZXIoKGYpID0+ICFmLnN0YWdlZCksIFtmaWxlc10pXG5cbiAgLyoqIFRoZSBmaWxlIHNsaWNlIHRoZSBjdXJyZW50IHNjb3BlIHNob3dzLiAqL1xuICBjb25zdCBzY29wZUZpbGVzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgc3dpdGNoIChzY29wZSkge1xuICAgICAgY2FzZSAndW5zdGFnZWQnOlxuICAgICAgICByZXR1cm4gdW5zdGFnZWRGaWxlc1xuICAgICAgY2FzZSAnc3RhZ2VkJzpcbiAgICAgICAgcmV0dXJuIHN0YWdlZEZpbGVzXG4gICAgICBjYXNlICdicmFuY2gnOlxuICAgICAgICByZXR1cm4gYmFzZVN0YXR1cz8uZmlsZXMgPz8gW11cbiAgICAgIGNhc2UgJ2xhc3QtdHVybic6IHtcbiAgICAgICAgcmV0dXJuIGxhc3RUdXJuRmlsZXNcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmaWxlc1xuICAgIH1cbiAgfSwgW3Njb3BlLCB1bnN0YWdlZEZpbGVzLCBzdGFnZWRGaWxlcywgYmFzZVN0YXR1cywgZmlsZXMsIGxhc3RUdXJuRmlsZXNdKVxuXG4gIC8qKiBTY29wZXMgd2hlcmUgZmlsZS9odW5rIGFjY2VwdFx1MDBCN3JldmVydFx1MDBCN3Vuc3RhZ2UgYW5kIGNvbW1pdC9wdXNoIG1ha2Ugc2Vuc2UuICovXG4gIGNvbnN0IGFsbG93QWN0aW9ucyA9IHNjb3BlICE9PSAnYnJhbmNoJyAmJiBzY29wZSAhPT0gJ2NvbW1pdCcgJiYgc2NvcGUgIT09ICdsYXN0LXR1cm4nXG5cbiAgLyoqIEZpbGVzIHRoZSBjdXJyZW50IHNjb3BlIGNhbiBoYW5kIHRvIHRoZSBBSSByZXZpZXcuICovXG4gIGNvbnN0IHJldmlld2FibGVGaWxlcyA9IHNjb3BlID09PSAnYnJhbmNoJyA/IGJhc2VTdGF0dXM/LmZpbGVzPy5sZW5ndGggPz8gMCA6IGZpbGVzLmxlbmd0aFxuICBjb25zdCBzdGFnZWRDb3VudCA9IHN0YWdlZEZpbGVzLmxlbmd0aFxuICAvLyBOT1RFOiBob29rcyBtdXN0IGFsbCBydW4gYmVmb3JlIHRoZSBlYXJseSByZXR1cm4gYmVsb3cgKFJlYWN0IGhvb2sgb3JkZXIpLlxuICBjb25zdCBzdGFnZWRUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHN0YWdlZEZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3N0YWdlZEZpbGVzXSlcbiAgY29uc3QgdW5zdGFnZWRUcmVlID0gdXNlTWVtbygoKSA9PiBidWlsZEZpbGVUcmVlKHVuc3RhZ2VkRmlsZXMsIChmKSA9PiBmLnBhdGgpLCBbdW5zdGFnZWRGaWxlc10pXG4gIGNvbnN0IHNjb3BlVHJlZSA9IHVzZU1lbW8oKCkgPT4gYnVpbGRGaWxlVHJlZShzY29wZUZpbGVzLCAoZikgPT4gZi5wYXRoKSwgW3Njb3BlRmlsZXNdKVxuICBjb25zdCBjb21taXRGaWxlc1RyZWUgPSB1c2VNZW1vKFxuICAgICgpID0+IChjb21taXREaWZmPy5vayA/IGJ1aWxkRmlsZVRyZWUoY29tbWl0RGlmZi5maWxlcywgKGYpID0+IGYucGF0aCkgOiBbXSksXG4gICAgW2NvbW1pdERpZmZdLFxuICApXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2NvcGUgPT09ICdsYXN0LXR1cm4nICYmIHNlbGVjdGVkID09PSBudWxsICYmIGxhc3RUdXJuRmlsZXMubGVuZ3RoID4gMCkgc2V0U2VsZWN0ZWQobGFzdFR1cm5GaWxlc1swXS5wYXRoKVxuICB9LCBbc2NvcGUsIHNlbGVjdGVkLCBsYXN0VHVybkZpbGVzXSlcblxuICBpZiAoIXN0b3JlU3RhdGUub3BlbiB8fCAhY3dkKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHNlbGVjdGVkRmlsZSA9IHNjb3BlRmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBzZWxlY3RlZCkgPz8gbnVsbFxuICBjb25zdCB0b3RhbEFkZGVkID0gZmlsZXMucmVkdWNlKChuLCBmKSA9PiBuICsgZi5hZGRlZCwgMClcbiAgY29uc3QgdG90YWxEZWxldGVkID0gZmlsZXMucmVkdWNlKChuLCBmKSA9PiBuICsgZi5kZWxldGVkLCAwKVxuXG4gIC8vIENvbW1pdC1kZXRhaWwgdmlldzogdGhlIHNlbGVjdGVkIGZpbGUgd2l0aGluIHRoZSBzZWxlY3RlZCBjb21taXQuXG4gIGNvbnN0IGNvbW1pdFNlZ21lbnRzID0gY29tbWl0RGlmZj8ub2sgPyBzcGxpdENvbW1pdERpZmYoY29tbWl0RGlmZi5kaWZmKSA6IFtdXG4gIGNvbnN0IGNvbW1pdEFjdGl2ZUZpbGUgPSBzZWxlY3RlZENvbW1pdCAmJiBjb21taXREaWZmPy5vayA/IGNvbW1pdERpZmYuZmlsZXMuZmluZCgoZikgPT4gZi5wYXRoID09PSBzZWxlY3RlZENvbW1pdEZpbGUpID8/IG51bGwgOiBudWxsXG4gIGNvbnN0IGNvbW1pdEFjdGl2ZVRleHQgPSBjb21taXRBY3RpdmVGaWxlXG4gICAgPyBjb21taXRTZWdtZW50cy5maW5kKChzKSA9PiBzLnBhdGggPT09IGNvbW1pdEFjdGl2ZUZpbGUucGF0aCk/LnRleHQgPz8gY29tbWl0RGlmZj8uZGlmZiA/PyAnJ1xuICAgIDogY29tbWl0RGlmZj8uZGlmZiA/PyAnJ1xuXG4gIC8qKiBMZWFmIHJvdyBzaGFyZWQgYnkgdGhlIHN0YWdlZC91bnN0YWdlZCBmaWxlIHRyZWVzLiAqL1xuICBjb25zdCB3b3Jrc3BhY2VMZWFmID0gKHsgaXRlbTogZmlsZSwgbmFtZSB9OiB7IGl0ZW06IERpZmZGaWxlOyBuYW1lOiBzdHJpbmcgfSkgPT4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICBhcmlhLXNlbGVjdGVkPXtmaWxlLnBhdGggPT09IHNlbGVjdGVkfVxuICAgICAgY2xhc3NOYW1lPXtgZHNkci1maWxlJHtmaWxlLnBhdGggPT09IHNlbGVjdGVkID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWQoZmlsZS5wYXRoKVxuICAgICAgICBzZXRTZWxlY3RlZENvbW1pdChudWxsKVxuICAgICAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICAgICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgfX1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLWNoaXAgJHtjaGlwQ2xhc3MoZmlsZS5zdGF0dXMpfWB9PntmaWxlLnVudHJhY2tlZCA/ICc/PycgOiBmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1zdGF0XCI+XG4gICAgICAgIHtmaWxlLmJpbmFyeSA/IHQoJ3Jldmlldy5iaW5hcnknKSA6IHQoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogZmlsZS5hZGRlZCwgZGVsZXRlZDogZmlsZS5kZWxldGVkIH0pfVxuICAgICAgPC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1maWxlLWFjdGlvbnNcIj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1maWxlLWljb25cIiB0aXRsZT17dCgnaHVuay5zdGFnZScpfSBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KGV2ZW50KSA9PiB7IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpOyB2b2lkIHJ1bkFwcGx5KCdhY2NlcHQnLCBmaWxlLnBhdGgpIH19Pis8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1maWxlLWljb24gZHNkci1maWxlLWljb24tZGFuZ2VyXCIgdGl0bGU9e3QoJ2h1bmsucmV2ZXJ0Jyl9IGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoZXZlbnQpID0+IHsgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7IHZvaWQgcnVuQXBwbHkoJ3JldmVydCcsIGZpbGUucGF0aCkgfX0+XHUyMUI2PC9idXR0b24+XG4gICAgICA8L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcblxuICBjb25zdCBydW5BcHBseSA9IGFzeW5jIChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcgfCAndW5zdGFnZScsIHBhdGg/OiBzdHJpbmcpID0+IHtcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcHBseUNoYW5nZXMoYWN0aXZlQ3dkID8/IGN3ZCA/PyAnJywgYWN0aW9uLCBwYXRoKVxuICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICBjb25zdCB2ZXJiID0gYWN0aW9uID09PSAnYWNjZXB0JyA/IHQoJ3Jldmlldy5hY2NlcHRlZCcpIDogYWN0aW9uID09PSAndW5zdGFnZScgPyB0KCdyZXZpZXcudW5zdGFnZWQnKSA6IHQoJ3Jldmlldy5yZXZlcnRlZCcpXG4gICAgICAgIHNldE5vdGljZSh7XG4gICAgICAgICAga2luZDogJ29rJyxcbiAgICAgICAgICB0ZXh0OiBwYXRoXG4gICAgICAgICAgICA/IHQoJ3Jldmlldy5kb25lT25lJywgeyBhY3Rpb246IHZlcmIsIHBhdGggfSlcbiAgICAgICAgICAgIDogcmVzdWx0LmRlbGV0ZWQgJiYgcmVzdWx0LmRlbGV0ZWQubGVuZ3RoID4gMFxuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5kb25lRGVsZXRlZCcsIHsgYWN0aW9uOiB2ZXJiLCBjb3VudDogZmlsZXMubGVuZ3RoLCBkZWxldGVkOiByZXN1bHQuZGVsZXRlZC5sZW5ndGggfSlcbiAgICAgICAgICAgICAgOiB0KCdyZXZpZXcuZG9uZScsIHsgYWN0aW9uOiB2ZXJiLCBjb3VudDogZmlsZXMubGVuZ3RoIH0pLFxuICAgICAgICB9KVxuICAgICAgICBhd2FpdCBsb2FkV29ya3NwYWNlKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiByZXN1bHQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogZSBpbnN0YW5jZW9mIEVycm9yID8gZS5tZXNzYWdlIDogdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb25GaWxlQWN0aW9uID0gKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgcGF0aDogc3RyaW5nKSA9PiB7XG4gICAgdm9pZCBydW5BcHBseShhY3Rpb24sIHBhdGgpXG4gIH1cblxuICBjb25zdCBvbkFsbEFjdGlvbiA9IChhY3Rpb246ICdhY2NlcHQnIHwgJ3JldmVydCcpID0+IHtcbiAgICBpZiAoYWN0aW9uID09PSAncmV2ZXJ0JyAmJiBjb25maXJtICE9PSAnYWxsJykge1xuICAgICAgc2V0Q29uZmlybSgnYWxsJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0Q29uZmlybSgoYykgPT4gKGMgPT09ICdhbGwnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIHJ1bkFwcGx5KGFjdGlvbilcbiAgfVxuXG4gIC8qKiBBcHBseSBvbmUgaHVuayAoc3RhZ2UgLyB1bnN0YWdlIC8gcmV2ZXJ0KSBvZiB0aGUgc2VsZWN0ZWQgZmlsZS4gKi9cbiAgY29uc3Qgb25IdW5rQWN0aW9uID0gYXN5bmMgKGFjdGlvbjogJ2FjY2VwdCcgfCAncmV2ZXJ0JyB8ICd1bnN0YWdlJywgaHVuazogRGlmZkh1bmspID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkRmlsZSB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwcGx5SHVuayhhY3RpdmVDd2QgPz8gY3dkID8/ICcnLCBzZWxlY3RlZEZpbGUucGF0aCwgYWN0aW9uLCBodW5rLnRleHQpXG4gICAgICBpZiAocmVzdWx0Lm9rKSB7XG4gICAgICAgIGNvbnN0IHZlcmIgPSBhY3Rpb24gPT09ICdhY2NlcHQnID8gdCgncmV2aWV3LmFjY2VwdGVkJykgOiBhY3Rpb24gPT09ICd1bnN0YWdlJyA/IHQoJ3Jldmlldy51bnN0YWdlZCcpIDogdCgncmV2aWV3LnJldmVydGVkJylcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ29rJywgdGV4dDogdCgncmV2aWV3LmRvbmVPbmUnLCB7IGFjdGlvbjogdmVyYiwgcGF0aDogc2VsZWN0ZWRGaWxlLnBhdGggfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5sb2FkRXJyb3InKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0gaW5saW5lIGNvbW1lbnRzIC0tLS1cbiAgY29uc3Qgb3BlbkNvbW1lbnQgPSAob2xkTGluZTogbnVtYmVyIHwgbnVsbCwgbmV3TGluZTogbnVtYmVyIHwgbnVsbCkgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm5cbiAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZSwgbmV3TGluZSB9KVxuICAgIHNldENvbW1lbnRUZXh0KCcnKVxuICB9XG5cbiAgLyoqXG4gICAqIENvbW1lbnRzIGFyZSBzdG9yZWQgcmVwby1yZWxhdGl2ZSAoc2VydmVyIHJlamVjdHMgYWJzb2x1dGUgcGF0aHMpLCBidXRcbiAgICogdGhlIHNlc3Npb24gdGFiJ3MgY2hhbmdlIHBhdGhzIGNvbWUgZnJvbSB0aGUgaG9zdCB0b29sIGRpZmYgY2FyZHMsIHdoaWNoXG4gICAqIGNhcnJ5IHdoYXRldmVyIHBhdGggdGhlIGFnZW50IHBhc3NlZCAodXN1YWxseSBhYnNvbHV0ZSkuXG4gICAqL1xuICBjb25zdCByZWxhdGl2ZVBhdGggPSAocDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCAhaXNBYnNQYXRoKHApKSByZXR1cm4gcFxuICAgIGlmIChwLnN0YXJ0c1dpdGgoYWN0aXZlQ3dkKSkgcmV0dXJuIHAuc2xpY2UoYWN0aXZlQ3dkLmxlbmd0aCkucmVwbGFjZSgvXltcXFxcL10rLywgJycpXG4gICAgcmV0dXJuIHBcbiAgfVxuXG4gIGNvbnN0IHNhdmVDb21tZW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGNvbW1lbnRQYXRoID0gcmVsYXRpdmVQYXRoKCh0YWIgPT09ICd3b3Jrc3BhY2UnID8gc2VsZWN0ZWRGaWxlPy5wYXRoIDogc2VsZWN0ZWRDaGFuZ2U/LnBhdGgpID8/ICcnKVxuICAgIGlmICghY29tbWVudFBhdGggfHwgIWNvbW1lbnRFZGl0b3IgfHwgYnVzeSkgcmV0dXJuXG4gICAgY29uc3QgdGV4dCA9IGNvbW1lbnRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCkgcmV0dXJuXG4gICAgY29uc3QgY29tbWVudDogUmV2aWV3Q29tbWVudCA9IHtcbiAgICAgIGlkOiB0eXBlb2YgY3J5cHRvICE9PSAndW5kZWZpbmVkJyAmJiBjcnlwdG8ucmFuZG9tVVVJRCA/IGNyeXB0by5yYW5kb21VVUlEKCkgOiBgJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIpfWAsXG4gICAgICBwYXRoOiBjb21tZW50UGF0aCxcbiAgICAgIGxpbmVOZXc6IGNvbW1lbnRFZGl0b3IubmV3TGluZSxcbiAgICAgIGxpbmVPbGQ6IGNvbW1lbnRFZGl0b3Iub2xkTGluZSxcbiAgICAgIHRleHQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHNvdXJjZTogdGFiID09PSAnc2Vzc2lvbicgPyAnc2Vzc2lvbicgOiAnd29ya3NwYWNlJyxcbiAgICB9XG4gICAgc2V0QnVzeSh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBuZXh0ID0gWy4uLmNvbW1lbnRzLCBjb21tZW50XVxuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ2NvbW1lbnQuc2F2ZWQnKSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBjYW5jZWxDb21tZW50ID0gKCkgPT4ge1xuICAgIHNldENvbW1lbnRFZGl0b3IobnVsbClcbiAgICBzZXRDb21tZW50VGV4dCgnJylcbiAgfVxuXG4gIGNvbnN0IGRlbGV0ZUNvbW1lbnQgPSBhc3luYyAoaWQ6IHN0cmluZykgPT4ge1xuICAgIGlmIChidXN5KSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjLmlkICE9PSBpZClcbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGlmIChhY3RpdmVDd2QgJiYgKGF3YWl0IHNhdmVDb21tZW50cyhhY3RpdmVDd2QsIG5leHQpKSkge1xuICAgICAgICBzZXRDb21tZW50cyhuZXh0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogdCgnY29tbWVudC5mYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ2NvbW1lbnQuZmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvKiogVXBkYXRlIG9uZSBzYXZlZCBjb21tZW50J3MgdGV4dCAoUFVUIHJlcGxhY2UpLiBSZXR1cm5zIHN1Y2Nlc3MuICovXG4gIGNvbnN0IHVwZGF0ZUNvbW1lbnQgPSBhc3luYyAoaWQ6IHN0cmluZywgdGV4dDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgaWYgKCF0ZXh0IHx8IGJ1c3kpIHJldHVybiBmYWxzZVxuICAgIGNvbnN0IG5leHQgPSBjb21tZW50cy5tYXAoKGMpID0+IChjLmlkID09PSBpZCA/IHsgLi4uYywgdGV4dCwgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSA6IGMpKVxuICAgIHNldEJ1c3kodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgaWYgKGFjdGl2ZUN3ZCAmJiAoYXdhaXQgc2F2ZUNvbW1lbnRzKGFjdGl2ZUN3ZCwgbmV4dCkpKSB7XG4gICAgICAgIHNldENvbW1lbnRzKG5leHQpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdjb21tZW50LmZhaWxlZCcpIH0pXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0QnVzeShmYWxzZSlcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tIEFJIHJldmlldyAoL3Jldmlldyk6IHJ1biwgcmUtcnVuLCBhbmQgaGFuZCBmaW5kaW5ncyB0byB0aGUgYWdlbnQgLS0tLVxuICBjb25zdCBvblJldmlldyA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCByZXZpZXdpbmcgfHwgYnVzeSkgcmV0dXJuXG4gICAgc2V0UmV2aWV3aW5nKHRydWUpXG4gICAgc2V0UmV2aWV3KG51bGwpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldmlld1Njb3BlID0gc2NvcGUgPT09ICdicmFuY2gnID8gJ2JyYW5jaCcgOiBzY29wZSA9PT0gJ2NvbW1pdCcgJiYgc2VsZWN0ZWRDb21taXQgPyAnY29tbWl0JyA6ICd1bmNvbW1pdHRlZCdcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1blJldmlldyhhY3RpdmVDd2QsIGN1cnJlbnRJZCA/PyBudWxsLCByZXZpZXdTY29wZSwgYmFzZUJyYW5jaCA/PyB1bmRlZmluZWQsIHNlbGVjdGVkQ29tbWl0Py5oYXNoID8/IHVuZGVmaW5lZClcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0UmV2aWV3KHJlc3VsdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucmV2aWV3RmFpbGVkJykgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0UmV2aWV3aW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDb21wb3NlIGEgXCJzZW5kIHRvIGFnZW50XCIgbWVzc2FnZSBmcm9tIGZpbmRpbmdzIG9yIFBSIGNvbW1lbnRzLiAqL1xuICBjb25zdCBjb21wb3NlRmluZGluZ3NNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0ZpbmRpbmdbXT4oKVxuICAgIGZvciAoY29uc3QgZiBvZiByZXZpZXc/LmZpbmRpbmdzID8/IFtdKSB7XG4gICAgICBjb25zdCBsaXN0ID0gYnlQYXRoLmdldChmLmZpbGUpXG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGYpXG4gICAgICBlbHNlIGJ5UGF0aC5zZXQoZi5maWxlLCBbZl0pXG4gICAgfVxuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFsnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCIEFJIFx1OEJDNFx1NUJBMVx1NTNEMVx1NzNCMFx1RkYwOEFkZHJlc3MgdGhlIHJldmlldyBmaW5kaW5nc1x1RkYwQ1x1NEZERFx1NjMwMVx1NjUzOVx1NTJBOFx1ODMwM1x1NTZGNFx1NjcwMFx1NUMwRlx1RkYwOVx1RkYxQScsICcnXVxuICAgIGZvciAoY29uc3QgW3BhdGgsIGxpc3RdIG9mIGJ5UGF0aCkge1xuICAgICAgbGluZXMucHVzaChgIyMgJHtwYXRofWApXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgbGlzdCkge1xuICAgICAgICBjb25zdCByYW5nZSA9IGYubGluZVN0YXJ0ID09PSBmLmxpbmVFbmQgPyBgOiR7Zi5saW5lU3RhcnR9YCA6IGA6JHtmLmxpbmVTdGFydH0tJHtmLmxpbmVFbmR9YFxuICAgICAgICBsaW5lcy5wdXNoKGAtIFske2YucHJpb3JpdHl9XSAke3BhdGh9JHtyYW5nZX06ICR7Zi50aXRsZX0gXHUyMDE0ICR7Zi5kZXRhaWx9YClcbiAgICAgICAgaWYgKGYuc3VnZ2VzdGlvbikgbGluZXMucHVzaChgICBcXGBcXGBcXGBcXG4ke2Yuc3VnZ2VzdGlvbn1cXG4gIFxcYFxcYFxcYGApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IGNvbXBvc2VQck1lc3NhZ2UgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoIXByPy5wciB8fCBwci5jb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiAnJ1xuICAgIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IFtgXHU4QkY3XHU1OTA0XHU3NDA2IFBSICMke3ByLnByLm51bWJlcn1cdUZGMDgke3ByLnByLnRpdGxlfVx1RkYwOVx1NzY4NFx1OEJDNFx1OEJCQVx1RkYwOEFkZHJlc3MgdGhlIFBSIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBYCwgJyddXG4gICAgZm9yIChjb25zdCBjIG9mIHByLmNvbW1lbnRzKSB7XG4gICAgICBjb25zdCBhbmNob3IgPSBjLnBhdGggPyBgJHtjLnBhdGh9JHtjLmxpbmUgPyBgOiR7Yy5saW5lfWAgOiAnJ31gIDogJ2dlbmVyYWwnXG4gICAgICBsaW5lcy5wdXNoKGAtICR7YW5jaG9yfSAoJHtjLmF1dGhvcn0pOiAke2MuYm9keX1gKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWxXaXRoID0gKHRleHQ6IHN0cmluZykgPT4ge1xuICAgIHNldFNlbmRUZXh0KHRleHQpXG4gICAgc2V0U2VuZE9wZW4odHJ1ZSlcbiAgfVxuXG4gIC8vIC0tLS0gZWRpdG9yIGludGVncmF0aW9uICh2aWEgZHNoLXBsdWdpbi1vcGVuLWVkaXRvcikgLS0tLVxuICBjb25zdCBvcGVuRmlsZSA9IGFzeW5jIChwYXRoOiBzdHJpbmcsIGxpbmU/OiBudW1iZXIpID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCBidXN5KSByZXR1cm5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBvcGVuSW5FZGl0b3IoYWN0aXZlQ3dkLCBwYXRoLCBsaW5lKVxuICAgIGlmICghcmVzdWx0Lm9rKSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBgJHt0KCdlZGl0b3IuZmFpbGVkJyl9OiAke3Jlc3VsdC5lcnJvciA/PyAnJ31gIH0pXG4gIH1cbiAgY29uc3Qgb3BlbkluRmlsZXNUYWIgPSAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgc2V0RmlsZXNUYXJnZXQocGF0aClcbiAgICBzZXRTdXJmYWNlKCdmaWxlcycpXG4gIH1cbiAgY29uc3QgdG9nZ2xlUmV2aWV3RmlsZSA9IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICBzZXRDb2xsYXBzZWRSZXZpZXdGaWxlcygocHJldmlvdXMpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXZpb3VzKVxuICAgICAgaWYgKG5leHQuaGFzKHBhdGgpKSBuZXh0LmRlbGV0ZShwYXRoKVxuICAgICAgZWxzZSBuZXh0LmFkZChwYXRoKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgLyoqIEp1bXAgZnJvbSBhIFBSIGNvbW1lbnQgdG8gdGhlIGZpbGUgKGFuZCBoaWdobGlnaHQgdGhlIGxpbmUpLiAqL1xuICBjb25zdCBvblByQ29tbWVudENsaWNrID0gKHBhdGg6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsIGxpbmU6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQpID0+IHtcbiAgICBpZiAocGF0aCkganVtcFRvKHBhdGgsIGxpbmUgPz8gdW5kZWZpbmVkKVxuICAgIGVsc2Ugc2V0SnVtcExpbmUobnVsbClcbiAgfVxuXG4gIC8vIC0tLS0gZmVlZGJhY2sgbG9vcDogY29tbWVudHMgXHUyMTkyIGFnZW50IChwcm9tcHQgaW5qZWN0aW9uLCBjb3B5IGZhbGxiYWNrKSAtLS0tXG4gIGNvbnN0IGNvbXBvc2VSZXZpZXdNZXNzYWdlID0gKCk6IHN0cmluZyA9PiB7XG4gICAgaWYgKGNvbW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gICAgY29uc3QgYnlQYXRoID0gbmV3IE1hcDxzdHJpbmcsIFJldmlld0NvbW1lbnRbXT4oKVxuICAgIGZvciAoY29uc3QgYyBvZiBjb21tZW50cykge1xuICAgICAgY29uc3QgbGlzdCA9IGJ5UGF0aC5nZXQoYy5wYXRoKVxuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChjKVxuICAgICAgZWxzZSBieVBhdGguc2V0KGMucGF0aCwgW2NdKVxuICAgIH1cbiAgICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXG4gICAgICAnXHU4QkY3XHU1OTA0XHU3NDA2XHU0RUU1XHU0RTBCXHU5NDg4XHU1QkY5XHU1RjUzXHU1MjREXHU1REU1XHU0RjVDXHU1MzNBXHU3Njg0XHU4ODRDXHU1MTg1XHU4QkM0XHU1QkExXHU4QkM0XHU4QkJBXHVGRjA4QWRkcmVzcyB0aGUgaW5saW5lIGNvbW1lbnRzXHVGRjBDXHU0RkREXHU2MzAxXHU2NTM5XHU1MkE4XHU4MzAzXHU1NkY0XHU2NzAwXHU1QzBGXHVGRjA5XHVGRjFBJyxcbiAgICAgICcnLFxuICAgIF1cbiAgICBmb3IgKGNvbnN0IFtwYXRoLCBsaXN0XSBvZiBieVBhdGgpIHtcbiAgICAgIGxpbmVzLnB1c2goYCMjICR7cGF0aH1gKVxuICAgICAgZm9yIChjb25zdCBjIG9mIGxpc3QpIHtcbiAgICAgICAgY29uc3QgYW5jaG9yID0gYy5saW5lTmV3ICE9PSBudWxsID8gYDoke2MubGluZU5ld31gIDogYCAob2xkIGxpbmUgJHtjLmxpbmVPbGR9KWBcbiAgICAgICAgLy8gT3JpZ2luIHRhYiB0YWcgc28gdGhlIGNvbnZlcnNhdGlvbiBjYXJkIHJvdXRlcyBpdHMganVtcCAoJ3MnID1cbiAgICAgICAgLy8gc2Vzc2lvbiByZWxhdGl2ZSBodW5rIGxpbmVzLCAndycgPSB3b3Jrc3BhY2UgcmVhbCBsaW5lcykuXG4gICAgICAgIGNvbnN0IHRhZyA9IGMuc291cmNlID09PSAnc2Vzc2lvbicgPyAnW3NdJyA6ICdbd10nXG4gICAgICAgIGxpbmVzLnB1c2goYC0gJHt0YWd9ICR7cGF0aH0ke2FuY2hvcn06ICR7Yy50ZXh0fWApXG4gICAgICB9XG4gICAgICBsaW5lcy5wdXNoKCcnKVxuICAgIH1cbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGNvbnN0IG9wZW5TZW5kUGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0U2VuZFRleHQoY29tcG9zZVJldmlld01lc3NhZ2UoKSlcbiAgICBzZXRTZW5kT3Blbih0cnVlKVxuICB9XG5cbiAgY29uc3Qgc2VuZFRvQWdlbnQgPSBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgdGV4dCA9IHNlbmRUZXh0LnRyaW0oKVxuICAgIGlmICghdGV4dCB8fCBidXN5KSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG91dGNvbWUgPSBhd2FpdCBpbmplY3RUb1Nlc3Npb24oc2Vzc2lvbnMsIGN1cnJlbnRJZCA/PyBudWxsLCB0ZXh0KVxuICAgICAgc2V0U2VuZE9wZW4oZmFsc2UpXG4gICAgICBpZiAob3V0Y29tZSA9PT0gJ3NlbnQnKSBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuc2VudFRvQWdlbnQnKSB9KVxuICAgICAgZWxzZSBpZiAob3V0Y29tZSA9PT0gJ2NvcGllZCcpIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb3BpZWQnKSB9KVxuICAgICAgZWxzZSBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiB0KCdyZXZpZXcuY29weUZhaWxlZCcpIH0pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgLyoqIENvbW1pdCB0aGUgc3RhZ2VkIGNoYW5nZXMgd2l0aCB0aGUgZW50ZXJlZCBtZXNzYWdlLiAqL1xuICBjb25zdCBvbkNvbW1pdCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBtZXNzYWdlID0gY29tbWl0TWVzc2FnZS50cmltKClcbiAgICBpZiAoIW1lc3NhZ2UgfHwgYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRCdXN5KHRydWUpXG4gICAgc2V0Tm90aWNlKG51bGwpXG4gICAgc2V0Q29uZmlybShudWxsKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBydW5HaXRBY3Rpb24oYWN0aXZlQ3dkLCAnY29tbWl0JywgbWVzc2FnZSlcbiAgICAgIGlmIChyZXN1bHQub2spIHtcbiAgICAgICAgc2V0Q29tbWl0TWVzc2FnZSgnJylcbiAgICAgICAgY29uc3Qgc3VtbWFyeSA9IHJlc3VsdC5oYXNoID8gYCR7cmVzdWx0Lmhhc2h9ICR7cmVzdWx0LnN1YmplY3QgPz8gJyd9YC50cmltKCkgOiAocmVzdWx0LnN1YmplY3QgPz8gJycpXG4gICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5jb21taXR0ZWQnLCB7IHN1bW1hcnkgfSkgfSlcbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0Tm90aWNlKHsga2luZDogJ2Vycm9yJywgdGV4dDogcmVzdWx0LmVycm9yIHx8IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUubWVzc2FnZSA6IHQoJ3Jldmlldy5jb21taXRGYWlsZWQnKSB9KVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRCdXN5KGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN1Ym1pdENvbW1pdCA9IGFzeW5jIChwdXNoQWZ0ZXI6IGJvb2xlYW4pID0+IHtcbiAgICBpZiAoIWFjdGl2ZUN3ZCB8fCBidXN5KSByZXR1cm5cbiAgICBpZiAoaW5jbHVkZVVuc3RhZ2VkKSB7XG4gICAgICBzZXRCdXN5KHRydWUpXG4gICAgICBjb25zdCBzdGFnZWQgPSBhd2FpdCBhcHBseUNoYW5nZXMoYWN0aXZlQ3dkLCAnYWNjZXB0JylcbiAgICAgIHNldEJ1c3koZmFsc2UpXG4gICAgICBpZiAoIXN0YWdlZC5vaykgeyBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBzdGFnZWQuZXJyb3IgfHwgdCgncmV2aWV3LmxvYWRFcnJvcicpIH0pOyByZXR1cm4gfVxuICAgIH1cbiAgICBhd2FpdCBvbkNvbW1pdCgpXG4gICAgaWYgKHB1c2hBZnRlcikgb25QdXNoKHRydWUpXG4gICAgc2V0Q29tbWl0T3BlbihmYWxzZSlcbiAgfVxuXG4gIC8qKiBQdXNoIHRoZSBjdXJyZW50IGJyYW5jaCAoZG91YmxlLWNsaWNrIHRvIGNvbmZpcm0pLiAqL1xuICBjb25zdCBvblB1c2ggPSAoaW1tZWRpYXRlID0gZmFsc2UpID0+IHtcbiAgICBpZiAoYnVzeSB8fCAhYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBpZiAoIWltbWVkaWF0ZSAmJiBjb25maXJtICE9PSAncHVzaCcpIHtcbiAgICAgIHNldENvbmZpcm0oJ3B1c2gnKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiBzZXRDb25maXJtKChjKSA9PiAoYyA9PT0gJ3B1c2gnID8gbnVsbCA6IGMpKSwgMjUwMClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2b2lkIChhc3luYyAoKSA9PiB7XG4gICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICBzZXRCdXN5KHRydWUpXG4gICAgICBzZXROb3RpY2UobnVsbClcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJ1bkdpdEFjdGlvbihhY3RpdmVDd2QsICdwdXNoJylcbiAgICAgICAgaWYgKHJlc3VsdC5vaykge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdvaycsIHRleHQ6IHQoJ3Jldmlldy5wdXNoZWQnKSB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHJlc3VsdC5lcnJvciB8fCB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgbG9hZFdvcmtzcGFjZSh0cnVlKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzZXROb3RpY2UoeyBraW5kOiAnZXJyb3InLCB0ZXh0OiBlIGluc3RhbmNlb2YgRXJyb3IgPyBlLm1lc3NhZ2UgOiB0KCdyZXZpZXcucHVzaEZhaWxlZCcpIH0pXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRCdXN5KGZhbHNlKVxuICAgICAgfVxuICAgIH0pKClcbiAgfVxuXG4gIC8qKiBTZWxlY3QgYSBsb2NhbCBjb21taXQgYW5kIGxvYWQgaXRzIGRpZmYgaW50byB0aGUgcmlnaHQgcGFuZS4gKi9cbiAgY29uc3Qgc2VsZWN0Q29tbWl0ID0gKGNvbW1pdDogQ29tbWl0SW5mbykgPT4ge1xuICAgIGlmICghYWN0aXZlQ3dkKSByZXR1cm5cbiAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgIHNldFNlbGVjdGVkQ29tbWl0KGNvbW1pdClcbiAgICBzZXRTZWxlY3RlZENvbW1pdEZpbGUobnVsbClcbiAgICBzZXRDb25maXJtKG51bGwpXG4gICAgc2V0Q29tbWl0RGlmZihudWxsKVxuICAgIHNldENvbW1pdERpZmZMb2FkaW5nKHRydWUpXG4gICAgdm9pZCBsb2FkQ29tbWl0RGlmZihhY3RpdmVDd2QsIGNvbW1pdC5oYXNoKVxuICAgICAgLnRoZW4oKGQpID0+IHtcbiAgICAgICAgc2V0Q29tbWl0RGlmZihkKVxuICAgICAgICBzZXRDb21taXREaWZmTG9hZGluZyhmYWxzZSlcbiAgICAgICAgLy8gRGVmYXVsdCB0aGUgZmlsZSB0cmVlIHRvIHRoZSBmaXJzdCBjaGFuZ2VkIGZpbGUuXG4gICAgICAgIGlmIChkLm9rICYmIGQuZmlsZXMubGVuZ3RoID4gMCkgc2V0U2VsZWN0ZWRDb21taXRGaWxlKGQuZmlsZXNbMF0ucGF0aClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4gc2V0Q29tbWl0RGlmZkxvYWRpbmcoZmFsc2UpKVxuICB9XG5cbiAgY29uc3QgY2xvc2UgPSAoKSA9PiB7XG4gICAgb3ZlcmxheVN0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgZC5vcGVuID0gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9XCJkc2RyLW92ZXJsYXlcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQpIGNsb3NlKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXBhbmVsXCJcbiAgICAgICAgcm9sZT1cImRpYWxvZ1wiXG4gICAgICAgIGFyaWEtbW9kYWw9XCJ0cnVlXCJcbiAgICAgICAgYXJpYS1sYWJlbD17dCgncmV2aWV3LnRpdGxlJyl9XG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiBgJHtwcmVmcy53aWR0aH1weGAsIGhlaWdodDogYCR7cHJlZnMuaGVpZ2h0fXB4YCwgLi4uZGlmZlN0eWxlVmFycyhwcmVmcykgfSBhcyBDU1NQcm9wZXJ0aWVzfVxuICAgICAgPlxuICAgICAgICA8UmVzaXplSGFuZGxlXG4gICAgICAgICAgbW9kZT1cImVcIlxuICAgICAgICAgIG9uUmVzaXplPXsoZHgpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLndpZHRoID0gTWF0aC5tYXgoTUlOX1BBTkVMX1csIE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gNjQsIGQud2lkdGggKyBkeCkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJzXCJcbiAgICAgICAgICBvblJlc2l6ZT17KF9keCwgZHkpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLmhlaWdodCA9IE1hdGgubWF4KE1JTl9QQU5FTF9ILCBNYXRoLm1pbih3aW5kb3cuaW5uZXJIZWlnaHQgLSA2NCwgZC5oZWlnaHQgKyBkeSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgICAgPFJlc2l6ZUhhbmRsZVxuICAgICAgICAgIG1vZGU9XCJzZVwiXG4gICAgICAgICAgb25SZXNpemU9eyhkeCwgZHkpID0+XG4gICAgICAgICAgICBwcmVmc1N0b3JlLnVwZGF0ZSgoZCkgPT4ge1xuICAgICAgICAgICAgICBkLndpZHRoID0gTWF0aC5tYXgoTUlOX1BBTkVMX1csIE1hdGgubWluKHdpbmRvdy5pbm5lcldpZHRoIC0gNjQsIGQud2lkdGggKyBkeCkpXG4gICAgICAgICAgICAgIGQuaGVpZ2h0ID0gTWF0aC5tYXgoTUlOX1BBTkVMX0gsIE1hdGgubWluKHdpbmRvdy5pbm5lckhlaWdodCAtIDY0LCBkLmhlaWdodCArIGR5KSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItaGVhZGVyXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10aXRsZVwiPnt0KCdyZXZpZXcudGl0bGUnKX08L3NwYW4+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXRhYnNcIiByb2xlPVwidGFibGlzdFwiIGFyaWEtbGFiZWw9e3QoJ3Jldmlldy50aXRsZScpfT5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHJvbGU9XCJ0YWJcIiBhcmlhLXNlbGVjdGVkPXtzdXJmYWNlID09PSAncmV2aWV3J30gY2xhc3NOYW1lPXtgZHNkci10YWIke3N1cmZhY2UgPT09ICdyZXZpZXcnID8gJyBkc2RyLXRhYi1hY3RpdmUnIDogJyd9YH0gb25DbGljaz17KCkgPT4gc2V0U3VyZmFjZSgncmV2aWV3Jyl9Pnt0KCdyZXZpZXcudGl0bGUnKX08L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHJvbGU9XCJ0YWJcIiBhcmlhLXNlbGVjdGVkPXtzdXJmYWNlID09PSAnZmlsZXMnfSBjbGFzc05hbWU9e2Bkc2RyLXRhYiR7c3VyZmFjZSA9PT0gJ2ZpbGVzJyA/ICcgZHNkci10YWItYWN0aXZlJyA6ICcnfWB9IG9uQ2xpY2s9eygpID0+IHNldFN1cmZhY2UoJ2ZpbGVzJyl9Pnt0KCdmaWxlcy50aXRsZScpfTwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtzdXJmYWNlID09PSAncmV2aWV3JyAmJiB0YWIgPT09ICd3b3Jrc3BhY2UnICYmIHN0YXR1cz8uaXNSZXBvID8gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zY29wZVwiPlxuICAgICAgICAgICAgICB7cmVwb3MubGVuZ3RoID4gMSA/IChcbiAgICAgICAgICAgICAgICA8VGhlbWVTZWxlY3RcbiAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgncmVwby5sYWJlbCcpfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3JlcG9QYXRoID8/IGFjdGl2ZUN3ZCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e3JlcG9zLm1hcCgocikgPT4gKHsgdmFsdWU6IHIucGF0aCwgbGFiZWw6IGAke2Jhc2VOYW1lKHIucGF0aCl9JHtyLmJyYW5jaCA/IGAgKCR7ci5icmFuY2h9KWAgOiAnJ31gIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRSZXBvUGF0aCh2KVxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChudWxsKVxuICAgICAgICAgICAgICAgICAgICBzZXRSZXZpZXcobnVsbClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgIGFyaWFMYWJlbD17dCgnc2NvcGUubGFiZWwnKX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17c2NvcGV9XG4gICAgICAgICAgICAgICAgb3B0aW9ucz17U0NPUEVfT1BUSU9OUy5tYXAoKHMpID0+ICh7IHZhbHVlOiBzLmlkLCBsYWJlbDogdChzLmxhYmVsKSB9KSl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2KSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRTY29wZSh2IGFzIFdvcmtzcGFjZVNjb3BlKVxuICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQobnVsbClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdicmFuY2gnID8gKFxuICAgICAgICAgICAgICAgIDxUaGVtZVNlbGVjdFxuICAgICAgICAgICAgICAgICAgYXJpYUxhYmVsPXt0KCdzY29wZS5iYXNlJyl9XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YmFzZUJyYW5jaCA/PyAnJ31cbiAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2JyYW5jaGVzLm1hcCgoYikgPT4gKHsgdmFsdWU6IGIsIGxhYmVsOiBiIH0pKX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRCYXNlQnJhbmNofVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzdXJmYWNlID09PSAncmV2aWV3JyA/IDxEaWZmVmlld1RvZ2dsZSB2aWV3PXt2aWV3fSBvbkNoYW5nZT17c2V0Vmlld30gdD17dH0gLz4gOiBudWxsfVxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3VidGl0bGVcIj5cbiAgICAgICAgICAgIHt0YWIgPT09ICdzZXNzaW9uJ1xuICAgICAgICAgICAgICA/IHQoJ3Jldmlldy5zZXNzaW9uU3RhdHMnLCB7IHJvdW5kczogcm91bmRzLmxlbmd0aCwgZmlsZXM6IHRvdGFsU2Vzc2lvbkZpbGVzIH0pXG4gICAgICAgICAgICAgIDogc3RhdHVzPy5pc1JlcG9cbiAgICAgICAgICAgICAgICA/IGAke3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9IFx1MDBCNyAke3QoJ3Jldmlldy5jaGFuZ2VzJywgeyBhZGRlZDogdG90YWxBZGRlZCwgZGVsZXRlZDogdG90YWxEZWxldGVkIH0pfSR7c3RhdHVzLmFoZWFkID4gMCA/IGAgXHUwMEI3ICR7dCgncmV2aWV3LmFoZWFkJywgeyBuOiBzdGF0dXMuYWhlYWQgfSl9YCA6ICcnfSR7c3RhdHVzLmJlaGluZCA+IDAgPyBgIFx1MDBCNyAke3QoJ3Jldmlldy5iZWhpbmQnLCB7IG46IHN0YXR1cy5iZWhpbmQgfSl9YCA6ICcnfWBcbiAgICAgICAgICAgICAgICA6IHQoJ3Jldmlldy5ub3RSZXBvJyl9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BhY2VyXCIgLz5cbiAgICAgICAgIHtzdXJmYWNlID09PSAncmV2aWV3JyAmJiB0YWIgPT09ICd3b3Jrc3BhY2UnICYmIGFsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3kgfHwgKGZpbGVzLmxlbmd0aCA9PT0gMCAmJiBzdGFnZWRDb3VudCA9PT0gMCl9IG9uQ2xpY2s9eygpID0+IHNldENvbW1pdE9wZW4odHJ1ZSl9Pnt0KCdyZXZpZXcuY29tbWl0Jyl9PC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBhcmlhLWxhYmVsPXt0KCdyZXZpZXcuY2xvc2UnKX0gb25DbGljaz17Y2xvc2V9PlxuICAgICAgICAgICAgPEljb25YIC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHtjb21taXRPcGVuID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21taXQtbW9kYWxcIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1jb21taXQtY2FyZFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LXRpdGxlXCI+e3N0YXR1cz8uYnJhbmNoID8/IHQoJ3Jldmlldy5jb21taXQnKX08L2Rpdj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWlucHV0XCIgYXV0b0ZvY3VzIHZhbHVlPXtjb21taXRNZXNzYWdlfSBwbGFjZWhvbGRlcj17dCgncmV2aWV3LmNvbW1pdFBsYWNlaG9sZGVyJyl9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldENvbW1pdE1lc3NhZ2UoZXZlbnQudGFyZ2V0LnZhbHVlKX0gLz5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWluY2x1ZGVcIj48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD17aW5jbHVkZVVuc3RhZ2VkfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJbmNsdWRlVW5zdGFnZWQoZXZlbnQudGFyZ2V0LmNoZWNrZWQpfSAvPiBJbmNsdWRlIHVuc3RhZ2VkIGNoYW5nZXM8L2xhYmVsPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWFjdGlvbnNcIj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIG9uQ2xpY2s9eygpID0+IHNldENvbW1pdE9wZW4oZmFsc2UpfT57dCgnY29tbWVudC5jYW5jZWwnKX08L2J1dHRvbj48YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIGRpc2FibGVkPXtidXN5IHx8ICFjb21taXRNZXNzYWdlLnRyaW0oKX0gb25DbGljaz17KCkgPT4gdm9pZCBzdWJtaXRDb21taXQoZmFsc2UpfT57dCgncmV2aWV3LmNvbW1pdCcpfTwvYnV0dG9uPjxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuIGRzZHItYnRuLXByaW1hcnlcIiBkaXNhYmxlZD17YnVzeSB8fCAhY29tbWl0TWVzc2FnZS50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc3VibWl0Q29tbWl0KHRydWUpfT57dCgncmV2aWV3LmNvbW1pdCcpfSBhbmQge3QoJ3Jldmlldy5wdXNoJyl9PC9idXR0b24+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG5cIiBkaXNhYmxlZD17YnVzeSB8fCAoc3RhdHVzPy5haGVhZCA/PyAwKSA9PT0gMH0gb25DbGljaz17KCkgPT4geyBzZXRDb21taXRPcGVuKGZhbHNlKTsgb25QdXNoKHRydWUpIH19Pnt0KCdyZXZpZXcucHVzaCcpfTwvYnV0dG9uPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7c3VyZmFjZSA9PT0gJ2ZpbGVzJyA/IChcbiAgICAgICAgICA8RmlsZXNXb3Jrc3BhY2UgY3dkPXtjd2R9IHQ9e3R9IGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc30gb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn0gdGFyZ2V0PXtmaWxlc1RhcmdldH0gb25BZGRUb0NoYXQ9eyhwYXRoKSA9PiB7XG4gICAgICAgICAgICBjb21wb3NlckRyYWZ0U3RvcmUudXBkYXRlKChkcmFmdCkgPT4ge1xuICAgICAgICAgICAgICBkcmFmdC5zZXNzaW9uSWQgPSBjdXJyZW50SWQgPz8gbnVsbFxuICAgICAgICAgICAgICBkcmFmdC50ZXh0ID0gYFx1OEJGN1x1NjdFNVx1NzcwQlx1NURFNVx1NEY1Q1x1NTMzQVx1NjU4N1x1NEVGNlx1RkYxQSR7cGF0aH1gXG4gICAgICAgICAgICAgIGRyYWZ0LmtleSA9IGRyYWZ0LmtleSArIDFcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfX0gLz5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8PlxuICAgICAgICB7c2VuZE9wZW4gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlbmRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc2VuZC10aXRsZVwiPnt0KCdyZXZpZXcuc2VuZFRpdGxlJyl9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zZW5kLWhpbnRcIj57dCgncmV2aWV3LnNlbmRIaW50Jyl9PC9zcGFuPlxuICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzTmFtZT1cImRzZHItc2VuZC1pbnB1dFwiIHJlYWRPbmx5IHZhbHVlPXtzZW5kVGV4dH0gc3BlbGxDaGVjaz17ZmFsc2V9IC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWVudC1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHNldFNlbmRPcGVuKGZhbHNlKX0+XG4gICAgICAgICAgICAgICAge3QoJ2NvbW1lbnQuY2FuY2VsJyl9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1idG5cIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIHZvaWQgbmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KHNlbmRUZXh0KS50aGVuKFxuICAgICAgICAgICAgICAgICAgICAoKSA9PiBzZXROb3RpY2UoeyBraW5kOiAnb2snLCB0ZXh0OiB0KCdyZXZpZXcuY29waWVkJykgfSksXG4gICAgICAgICAgICAgICAgICAgICgpID0+IHNldE5vdGljZSh7IGtpbmQ6ICdlcnJvcicsIHRleHQ6IHQoJ3Jldmlldy5jb3B5RmFpbGVkJykgfSksXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY29weScpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1idG4gZHNkci1idG4tcHJpbWFyeVwiIGRpc2FibGVkPXtidXN5IHx8ICFzZW5kVGV4dC50cmltKCl9IG9uQ2xpY2s9eygpID0+IHZvaWQgc2VuZFRvQWdlbnQoKX0+XG4gICAgICAgICAgICAgICAge3QoJ3Jldmlldy5zZW5kVG9BZ2VudCcpfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cblxuICAgICAgICB7dGFiID09PSAnc2Vzc2lvbicgPyAoXG4gICAgICAgICAgcm91bmRzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAgICB7dCgncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnKX1cbiAgICAgICAgICAgICAge3Nlc3Npb25TY2FuICYmIHNlc3Npb25TY2FuLnJlc3VsdHMgPiAwID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ub2RpZmZcIj57dCgncmV2aWV3LnNlc3Npb25TY2FuJywgeyByZXN1bHRzOiBzZXNzaW9uU2Nhbi5yZXN1bHRzLCBkaWZmOiBzZXNzaW9uU2Nhbi5kaWZmQ2FyZHMsIHBhdGg6IHNlc3Npb25TY2FuLnBhdGhPbmx5IH0pfTwvZGl2PlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5LWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWJ0blwiIG9uQ2xpY2s9eygpID0+IHNldFRhYignd29ya3NwYWNlJyl9PlxuICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5nb1dvcmtzcGFjZScpfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItYm9keVwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZmlsZXNcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbGFiZWw9e3QoJ3RhYi5zZXNzaW9uJyl9PlxuICAgICAgICAgICAgICAgIHtyb3VuZHMubWFwKChyb3VuZCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3JvdW5kLnJvdW5kfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXJvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3QoJ3Jldmlldy5yb3VuZCcsIHsgcm91bmQ6IHJvdW5kLnJvdW5kIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIHtyb3VuZC5sYWJlbCA/IDxkaXYgY2xhc3NOYW1lPVwiZHNkci1yb3VuZC1sYWJlbFwiIHRpdGxlPXtyb3VuZC5sYWJlbH0+e3JvdW5kLmxhYmVsfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8RmlsZVRyZWVWaWV3XG4gICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Nlc3Npb25UcmVlcy5nZXQocm91bmQucm91bmQpID8/IFtdfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9eyh7IGl0ZW06IGNoYW5nZSwgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtyb3VuZC5yb3VuZH06JHtjaGFuZ2UucGF0aH1gXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZEtleSA9IHNlbGVjdGVkQ2hhbmdlID8gYCR7c2VsZWN0ZWRSb3VuZH06JHtzZWxlY3RlZENoYW5nZS5wYXRofWAgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17a2V5ID09PSBzZWxlY3RlZEtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke2tleSA9PT0gc2VsZWN0ZWRLZXkgPyAnIGRzZHItZmlsZS1zZWxlY3RlZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkUm91bmQocm91bmQucm91bmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZFBhdGgoY2hhbmdlLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb25maXJtKG51bGwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItY2hpcCAke2NoYW5nZS5oYXNEaWZmID8gJ2RzZHItY2hpcC1tJyA6ICdkc2RyLWNoaXAtdSd9YH0+e2NoYW5nZS5oYXNEaWZmID8gJ00nIDogJ1x1MDBCNyd9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1uYW1lXCIgdGl0bGU9e2NoYW5nZS5wYXRofT57bmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCIgdGl0bGU9e2NoYW5nZS50b29sfT57Y2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZlwiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZENoYW5nZSA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENoYW5nZS5wYXRofT57c2VsZWN0ZWRDaGFuZ2UucGF0aH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci10b29sXCI+e3NlbGVjdGVkQ2hhbmdlLnRvb2x9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRDaGFuZ2UucGF0aCl9IHRpdGxlPXt0KCdlZGl0b3Iub3BlbkZpbGUnKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTcge3QoJ2VkaXRvci5vcGVuRmlsZScpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2hhbmdlLmhhc0RpZmYgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgdmlldyA9PT0gJ3NwbGl0JyAmJiBjaGFuZ2VTcGxpdEJsb2NrcyhzZWxlY3RlZENoYW5nZSkubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dCgndmlldy5iZWZvcmUnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3QoJ3ZpZXcuYWZ0ZXInKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hhbmdlU3BsaXRCbG9ja3Moc2VsZWN0ZWRDaGFuZ2UpLm1hcCgoYmxvY2ssIGJpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtibG9jay5oZWFkID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LWh1bmtcIj57YmxvY2suaGVhZH08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YmxvY2sucm93cy5tYXAoKHJvdywgcmkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0QW5jaG9yID0geyBvbGRMaW5lOiByb3cubGVmdE51bSwgbmV3TGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5sZWZ0TnVtICE9PSBudWxsID8gcm93LmxlZnROdW0gOiBudWxsIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEFuY2hvciA9IHsgb2xkTGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA6IG51bGwsIG5ld0xpbmU6IHJvdy5yaWdodE51bSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEtleSA9IGAke2xlZnRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7bGVmdEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRLZXkgPSBgJHtyaWdodEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtyaWdodEFuY2hvci5uZXdMaW5lID8/ICduJ31gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBsZWZ0QW5jaG9yLm9sZExpbmUsIGxlZnRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmlnaHRDb21tZW50cyA9IGNvbW1lbnRzLmZpbHRlcigoYykgPT4gY29tbWVudE1hdGNoZXMoYywgcmlnaHRBbmNob3Iub2xkTGluZSwgcmlnaHRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWVudEJ0biA9IChhbmNob3I6IHsgb2xkTGluZTogbnVtYmVyIHwgbnVsbDsgbmV3TGluZTogbnVtYmVyIHwgbnVsbCB9LCBjb3VudDogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e2NvdW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbk9wZW49eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50RWRpdG9yKHsgb2xkTGluZTogYW5jaG9yLm9sZExpbmUsIG5ld0xpbmU6IGFuY2hvci5uZXdMaW5lIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcGVuQnRuID0gKGxpbmU6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1vcGVubGluZVwiIHRpdGxlPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gYXJpYS1sYWJlbD17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IG9uQ2xpY2s9eygpID0+IHZvaWQgb3BlbkZpbGUoc2VsZWN0ZWRDaGFuZ2UucGF0aCwgbGluZSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcdTIxOTdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17cml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1kc2RyLWxpbmU9e3Jvdy5sZWZ0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LmxlZnROdW0gPz8gJyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKGxlZnRBbmNob3IsIGxlZnRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5sZWZ0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cubGVmdE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LmxlZnROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsZWZ0Q29tbWVudHMubGVuZ3RoID4gMCA/IGxlZnRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e3VwZGF0ZUNvbW1lbnR9IG9uRGVsZXRlPXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9IHQ9e3R9IC8+KSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEVkaXRvciAmJiBsZWZ0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHR9IG9uVGV4dD17c2V0Q29tbWVudFRleHR9IG9uU2F2ZT17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfSBvbkNhbmNlbD17Y2FuY2VsQ29tbWVudH0gYnVzeT17YnVzeX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItc3BsaXQtY2VsbCAke3Jvdy5yaWdodE51bSA9PT0gbnVsbCA/ICdkc2RyLWNlbGwtZGltJyA6IHJvdy5raW5kID09PSAnY2hhbmdlJyA/ICdkc2RyLWNlbGwtYWRkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17cm93LnJpZ2h0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW51bVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudEJ0bihyaWdodEFuY2hvciwgcmlnaHRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5yaWdodH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtICE9PSBudWxsID8gb3BlbkJ0bihyb3cucmlnaHROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyaWdodENvbW1lbnRzLmxlbmd0aCA+IDAgPyByaWdodENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50RWRpdG9yICYmIHJpZ2h0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHR9IG9uVGV4dD17c2V0Q29tbWVudFRleHR9IG9uU2F2ZT17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfSBvbkNhbmNlbD17Y2FuY2VsQ29tbWVudH0gYnVzeT17YnVzeX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc2Nyb2xsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwcmUgY2xhc3NOYW1lPVwiZHNkci1wcmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2Vzc2lvblJvd3NXaXRoTGluZXMoc2VsZWN0ZWRDaGFuZ2UpLm1hcCgoeyByb3csIG9sZExpbmUsIG5ld0xpbmUgfSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7b2xkTGluZSA/PyAnbyd9OiR7bmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93Q29tbWVudHMgPSBjb21tZW50cy5maWx0ZXIoKGMpID0+IGNvbW1lbnRNYXRjaGVzKGMsIG9sZExpbmUsIG5ld0xpbmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvd0FjdGlvbnMgPSByb3cua2luZCA9PT0gJ2N0eCcgfHwgcm93LmtpbmQgPT09ICdhZGQnIHx8IHJvdy5raW5kID09PSAnZGVsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17aX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Bkc2RyLWxpbmUgZHNkci1saW5lLSR7cm93LmtpbmR9JHtyb3dDb21tZW50cy5sZW5ndGggPiAwID8gJyBkc2RyLWxpbmUtY29tbWVudGVkJyA6ICcnfWB9IGRhdGEtZHNkci1saW5lPXtuZXdMaW5lID8/IG9sZExpbmUgPz8gdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge25ld0xpbmUgPz8gb2xkTGluZSA/PyAnJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zID8gPENvbW1lbnRMaW5lIGNvdW50PXtyb3dDb21tZW50cy5sZW5ndGh9IG9uT3Blbj17KCkgPT4gb3BlbkNvbW1lbnQob2xkTGluZSwgbmV3TGluZSl9IHQ9e3R9IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbGluZS10ZXh0XCI+e3Jvdy50ZXh0IHx8ICcgJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2hvd0FjdGlvbnMgJiYgKG5ld0xpbmUgPz8gb2xkTGluZSkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItb3BlbmxpbmVcIiB0aXRsZT17dCgnZWRpdG9yLm9wZW5MaW5lJyl9IGFyaWEtbGFiZWw9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBvbkNsaWNrPXsoKSA9PiB2b2lkIG9wZW5GaWxlKHNlbGVjdGVkQ2hhbmdlLnBhdGgsIG5ld0xpbmUgPz8gb2xkTGluZSA/PyAxKX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Nob3dBY3Rpb25zICYmIHJvd0NvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e3VwZGF0ZUNvbW1lbnR9IG9uRGVsZXRlPXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9IHQ9e3R9IC8+KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50RWRpdG9yICYmIGAke2NvbW1lbnRFZGl0b3Iub2xkTGluZSA/PyAnbyd9OiR7Y29tbWVudEVkaXRvci5uZXdMaW5lID8/ICduJ31gID09PSBrZXkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItbm9kaWZmXCI+e3QoJ3Jldmlldy5ub0RpZmZEYXRhJyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57dCgncmV2aWV3Lm5vU2Vzc2lvbkNoYW5nZXMnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIClcbiAgICAgICAgKSA6IGVycm9yICYmICFzdGF0dXM/LmlzUmVwbyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj5cbiAgICAgICAgICAgIHtlcnJvcn1cbiAgICAgICAgICAgIDxkaXY+e3QoJ3Jldmlldy5ub3RSZXBvSGludCcpfTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogc3RhdHVzPy5pc1JlcG8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJvZHlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1maWxlc1wiIHJvbGU9XCJsaXN0Ym94XCIgYXJpYS1sYWJlbD17dCgndGFiLndvcmtzcGFjZScpfT5cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnYWxsJyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAge3N0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LnNlY3Rpb25TdGFnZWQnKX0gKHtzdGFnZWRGaWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVEaXI9e3RvZ2dsZURpcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAge3Vuc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnKX0gKHt1bnN0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXM9e3Vuc3RhZ2VkVHJlZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aD17MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ3Vuc3RhZ2VkJyA/IChcbiAgICAgICAgICAgICAgICB1bnN0YWdlZEZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkNoYW5nZXMnKX0gKHt1bnN0YWdlZEZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17dW5zdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ3N0YWdlZCcgPyAoXG4gICAgICAgICAgICAgICAgc3RhZ2VkRmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5zZWN0aW9uU3RhZ2VkJyl9ICh7c3RhZ2VkRmlsZXMubGVuZ3RofSk8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzdGFnZWRUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5lbXB0eScpfTwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIHtzY29wZSA9PT0gJ2JyYW5jaCcgPyAoXG4gICAgICAgICAgICAgICAgc2NvcGVGaWxlcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICB7dCgnc2NvcGUuYnJhbmNoJyl9IHtiYXNlQnJhbmNoID8gYFx1MjE5NCAke2Jhc2VCcmFuY2h9YCA6ICcnfSAoe3Njb3BlRmlsZXMubGVuZ3RofSlcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1ub2RpZmZcIj57dCgnc2NvcGUuYnJhbmNoUmVhZG9ubHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICAgIG5vZGVzPXtzY29wZVRyZWV9XG4gICAgICAgICAgICAgICAgICAgICAgY29sbGFwc2VkPXtjb2xsYXBzZWREaXJzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZGVwdGg9ezB9XG4gICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGVhZj17d29ya3NwYWNlTGVhZn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZW1wdHlcIj57dCgncmV2aWV3LmVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAge3Njb3BlID09PSAnbGFzdC10dXJuJyA/IChcbiAgICAgICAgICAgICAgICBzY29wZUZpbGVzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdzY29wZS5sYXN0LXR1cm4nKX0gKHtzY29wZUZpbGVzLmxlbmd0aH0pPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxGaWxlVHJlZVZpZXdcbiAgICAgICAgICAgICAgICAgICAgICBub2Rlcz17c2NvcGVUcmVlfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZD17Y29sbGFwc2VkRGlyc31cbiAgICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZURpcj17dG9nZ2xlRGlyfVxuICAgICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxlYWY9e3dvcmtzcGFjZUxlYWZ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWVtcHR5XCI+e3QoJ3Jldmlldy5sYXN0VHVybkVtcHR5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgeyhzY29wZSA9PT0gJ2FsbCcgfHwgc2NvcGUgPT09ICdjb21taXQnKSAmJiBoaXN0b3J5Lmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zZWN0aW9uXCI+e3QoJ3Jldmlldy5oaXN0b3J5Jyl9PC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGltZWxpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAge2hpc3RvcnkubWFwKChjb21taXQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2NvbW1pdC5oYXNofVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci10bC1pdGVtJHtzZWxlY3RlZENvbW1pdD8uaGFzaCA9PT0gY29tbWl0Lmhhc2ggPyAnIGRzZHItdGwtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItdGwtcmFpbFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXRsLWRvdCR7Y29tbWl0LmFoZWFkID8gJyBkc2RyLXRsLWRvdC1sb2NhbCcgOiAnIGRzZHItdGwtZG90LXJlbW90ZSd9YH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cIm9wdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkQ29tbWl0Py5oYXNoID09PSBjb21taXQuaGFzaH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZHNkci1jb21taXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RDb21taXQoY29tbWl0KX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGRzZHItdGwtYmFkZ2Uke2NvbW1pdC5haGVhZCA/ICcgZHNkci10bC1iYWRnZS1sb2NhbCcgOiAnIGRzZHItdGwtYmFkZ2UtcmVtb3RlJ31gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21taXQuYWhlYWQgPyB0KCdoaXN0b3J5LmxvY2FsJykgOiB0KCdoaXN0b3J5LnJlbW90ZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNvbW1pdC1zaG9ydFwiPntjb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LXN1YmplY3RcIiB0aXRsZT17Y29tbWl0LnN1YmplY3R9Pntjb21taXQuc3ViamVjdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jb21taXQtbWV0YVwiPntjb21taXQuYXV0aG9yfSBcdTAwQjcge3JlbGF0aXZlVGltZShjb21taXQuZGF0ZSwgdCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7KHNjb3BlID09PSAnYWxsJyB8fCBzY29wZSA9PT0gJ2NvbW1pdCcpICYmIHNlbGVjdGVkQ29tbWl0ICYmIGNvbW1pdERpZmY/Lm9rICYmIGNvbW1pdERpZmYuZmlsZXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj57dCgncmV2aWV3LmNvbW1pdEZpbGVzJyl9ICh7Y29tbWl0RGlmZi5maWxlcy5sZW5ndGh9KTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPEZpbGVUcmVlVmlld1xuICAgICAgICAgICAgICAgICAgICBub2Rlcz17Y29tbWl0RmlsZXNUcmVlfVxuICAgICAgICAgICAgICAgICAgICBjb2xsYXBzZWQ9e2NvbGxhcHNlZERpcnN9XG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRGlyPXt0b2dnbGVEaXJ9XG4gICAgICAgICAgICAgICAgICAgIGRlcHRoPXswfVxuICAgICAgICAgICAgICAgICAgICByZW5kZXJMZWFmPXsoeyBpdGVtOiBmaWxlLCBuYW1lIH0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJvcHRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1zZWxlY3RlZD17c2VsZWN0ZWRDb21taXRGaWxlID09PSBmaWxlLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Bkc2RyLWZpbGUke3NlbGVjdGVkQ29tbWl0RmlsZSA9PT0gZmlsZS5wYXRoID8gJyBkc2RyLWZpbGUtc2VsZWN0ZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkQ29tbWl0RmlsZShmaWxlLnBhdGgpfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY2hpcCBkc2RyLWNoaXAtbVwiPntmaWxlLnN0YXR1c308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtbmFtZVwiIHRpdGxlPXtmaWxlLnBhdGh9PntuYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1zdGF0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2NvcGUgPT09ICdhbGwnID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc2VjdGlvblwiPnt0KCdyZXZpZXcuc2VjdGlvbkJyYW5jaCcpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1yZWZcIiB0aXRsZT17c3RhdHVzLnVwc3RyZWFtID8/IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy5icmFuY2ggPz8gdCgncmV2aWV3LmRldGFjaGVkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1icmFuY2gtYXJyb3dcIj5cdTIxOTI8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAge3N0YXR1cy51cHN0cmVhbSA/PyB0KCdyZXZpZXcubm9VcHN0cmVhbScpfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLXN0YXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c3RhdHVzLmFoZWFkID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWFoZWFkXCI+e3QoJ3Jldmlldy5haGVhZCcsIHsgbjogc3RhdHVzLmFoZWFkIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYmVoaW5kID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItYnJhbmNoLWJlaGluZFwiPnt0KCdyZXZpZXcuYmVoaW5kJywgeyBuOiBzdGF0dXMuYmVoaW5kIH0pfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXMuYWhlYWQgPT09IDAgJiYgc3RhdHVzLmJlaGluZCA9PT0gMCAmJiBzdGF0dXMudXBzdHJlYW0gPyA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWJyYW5jaC1zeW5jXCI+XHUyNzEzPC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGRzZHItYnRuJHtjb25maXJtID09PSAncHVzaCcgPyAnIGRzZHItYnRuLWNvbmZpcm0nIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCAoc3RhdHVzPy5haGVhZCA/PyAwKSA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRDb21taXRPcGVuKHRydWUpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NvbmZpcm0gPT09ICdwdXNoJyA/IHQoJ3Jldmlldy5jb25maXJtUHVzaCcpIDogYCR7dCgncmV2aWV3LnB1c2gnKX0keyhzdGF0dXM/LmFoZWFkID8/IDApID4gMCA/IGAgKCR7c3RhdHVzPy5haGVhZCA/PyAwfSlgIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtwcj8ucHIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci50aXRsZScsIHsgbnVtYmVyOiBwci5wci5udW1iZXIgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID4gMCA/IGAgXHUwMEI3ICR7dCgncHIuY29tbWVudHMnLCB7IG46IHByLmNvbW1lbnRzLmxlbmd0aCB9KX1gIDogJyd9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLXByXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cHIuY29tbWVudHMubGVuZ3RoID09PSAwID8gPGRpdiBjbGFzc05hbWU9XCJkc2RyLW5vZGlmZlwiPnt0KCdwci5ub1ByJyl9PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwci5jb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y29tbWVudC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkc2RyLXByLWl0ZW1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uUHJDb21tZW50Q2xpY2soY29tbWVudC5wYXRoLCBjb21tZW50LmxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1wci1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29tbWVudC5wYXRoID8gYCR7YmFzZU5hbWUoY29tbWVudC5wYXRoKX0ke2NvbW1lbnQubGluZSA/IGA6JHtjb21tZW50LmxpbmV9YCA6ICcnfWAgOiAnZ2VuZXJhbCd9IFx1MDBCNyB7Y29tbWVudC5hdXRob3J9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItcHItdGV4dFwiPntjb21tZW50LmJvZHl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAge3ByLmNvbW1lbnRzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VQck1lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdwci5zZW5kQ29tbWVudHMnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmXCI+XG4gICAgICAgICAgICAgIHtyZXZpZXc/Lm9rID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZHNkci12ZXJkaWN0JHtyZXZpZXcudmVyZGljdCA9PT0gJ2luY29ycmVjdCcgPyAnIGRzZHItdmVyZGljdC1iYWQnIDogJyBkc2RyLXZlcmRpY3Qtb2snfWB9PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1hcmtcIj57cmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gJ1x1MjcxNycgOiAnXHUyNzEzJ308L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXZlcmRpY3QtdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7cmV2aWV3LnZlcmRpY3QgPT09ICdpbmNvcnJlY3QnID8gdCgncmV2aWV3LnZlcmRpY3RJbmNvcnJlY3QnKSA6IHQoJ3Jldmlldy52ZXJkaWN0Q29ycmVjdCcpfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci12ZXJkaWN0LW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgICAge3Jldmlldy5maW5kaW5ncy5sZW5ndGggPiAwID8gdCgncmV2aWV3LmZpbmRpbmdzJywgeyBuOiByZXZpZXcuZmluZGluZ3MubGVuZ3RoIH0pIDogdCgncmV2aWV3Lm5vRmluZGluZ3MnKX1cbiAgICAgICAgICAgICAgICAgICAge3Jldmlldy50cnVuY2F0ZWQgPyAnICh0cnVuY2F0ZWQpJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAge3Jldmlldy5tb2RlbCA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItdmVyZGljdC1tb2RlbFwiPntyZXZpZXcubW9kZWwucHJvdmlkZXJ9L3tyZXZpZXcubW9kZWwubW9kZWx9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXNwYWNlclwiIC8+XG4gICAgICAgICAgICAgICAgICB7cmV2aWV3LmZpbmRpbmdzLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItYnRuXCIgZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9wZW5TZW5kUGFuZWxXaXRoKGNvbXBvc2VGaW5kaW5nc01lc3NhZ2UoKSl9PlxuICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuc2VuZEZpbmRpbmdzJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICB7c2VsZWN0ZWRDb21taXQgPyAoXG4gICAgICAgICAgICAgICAgY29tbWl0RGlmZkxvYWRpbmcgPyAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPnt0KCdyZXZpZXcuYnVzeScpfTwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiBjb21taXREaWZmPy5vayA/IChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtcGF0aFwiIHRpdGxlPXtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5zdWJqZWN0fVxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhhc2hcIj57c2VsZWN0ZWRDb21taXQuc2hvcnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLXRvb2xcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENvbW1pdC5hdXRob3J9IFx1MDBCNyB7cmVsYXRpdmVUaW1lKHNlbGVjdGVkQ29tbWl0LmRhdGUsIHQpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtc3RhdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdERpZmYuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdERpZmYuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7Y29tbWl0QWN0aXZlRmlsZSA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtaGVhZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17Y29tbWl0QWN0aXZlRmlsZS5wYXRofT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jaGlwIGRzZHItY2hpcC1tXCI+e2NvbW1pdEZpbGVTdGF0dXMoY29tbWl0U2VnbWVudHMuZmluZCgocykgPT4gcy5wYXRoID09PSBjb21taXRBY3RpdmVGaWxlLnBhdGgpPy50ZXh0ID8/ICcnKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItY29tbWl0LWZpbGUtcGF0aFwiPntjb21taXRBY3RpdmVGaWxlLnBhdGh9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXN0YXRzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0KCdyZXZpZXcuY2hhbmdlcycsIHsgYWRkZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuYWRkZWQsIGRlbGV0ZWQ6IGNvbW1pdEFjdGl2ZUZpbGUuZGVsZXRlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHt2aWV3ID09PSAnc3BsaXQnICYmIGdpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPFNwbGl0RGlmZiBibG9ja3M9e2dpdFNwbGl0QmxvY2tzKGNvbW1pdEFjdGl2ZVRleHQpfSBiZWZvcmVMYWJlbD17dCgndmlldy5iZWZvcmUnKX0gYWZ0ZXJMYWJlbD17dCgndmlldy5hZnRlcicpfSAvPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLXNjcm9sbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHByZSBjbGFzc05hbWU9XCJkc2RyLXByZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Z2l0RGlmZlJvd3MoY29tbWl0QWN0aXZlVGV4dCkubWFwKChyb3csIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPXtgZHNkci1saW5lIGRzZHItbGluZS0ke3Jvdy5raW5kfWB9Pntyb3cudGV4dCB8fCAnICd9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWRpZmYtZW1wdHlcIj57Y29tbWl0RGlmZj8uZXJyb3IgPz8gdCgncmV2aWV3Lm5vRGlmZkRhdGEnKX08L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICkgOiBzZWxlY3RlZEZpbGUgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1kaWZmLWhlYWRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1kaWZmLXBhdGhcIiB0aXRsZT17c2VsZWN0ZWRGaWxlLnBhdGh9PlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRGaWxlLm9yaWdQYXRoID8gYCBcdTIxOTAgJHtzZWxlY3RlZEZpbGUub3JpZ1BhdGh9YCA6ICcnfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZGlmZi1zdGF0c1wiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZEZpbGUuYmluYXJ5ID8gdCgncmV2aWV3LmJpbmFyeScpIDogdCgncmV2aWV3LmNoYW5nZXMnLCB7IGFkZGVkOiBzZWxlY3RlZEZpbGUuYWRkZWQsIGRlbGV0ZWQ6IHNlbGVjdGVkRmlsZS5kZWxldGVkIH0pfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItZmlsZS1oZWFkLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtaWNvblwiIHRpdGxlPVwiQ29weSBwYXRoXCIgYXJpYS1sYWJlbD1cIkNvcHkgcGF0aFwiIG9uQ2xpY2s9eygpID0+IHZvaWQgd3JpdGVDbGlwYm9hcmQoc2VsZWN0ZWRGaWxlLnBhdGgpfT5cdTI5Qzk8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtaWNvblwiIHRpdGxlPXtjb2xsYXBzZWRSZXZpZXdGaWxlcy5oYXMoc2VsZWN0ZWRGaWxlLnBhdGgpID8gJ0V4cGFuZCBmaWxlJyA6ICdDb2xsYXBzZSBmaWxlJ30gYXJpYS1sYWJlbD17Y29sbGFwc2VkUmV2aWV3RmlsZXMuaGFzKHNlbGVjdGVkRmlsZS5wYXRoKSA/ICdFeHBhbmQgZmlsZScgOiAnQ29sbGFwc2UgZmlsZSd9IG9uQ2xpY2s9eygpID0+IHRvZ2dsZVJldmlld0ZpbGUoc2VsZWN0ZWRGaWxlLnBhdGgpfT57Y29sbGFwc2VkUmV2aWV3RmlsZXMuaGFzKHNlbGVjdGVkRmlsZS5wYXRoKSA/ICdcdTIzMDQnIDogJ1x1MjMwMyd9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwiZHNkci1maWxlLWljb25cIiB0aXRsZT1cIk9wZW4gZmlsZSBpbiBGaWxlc1wiIGFyaWEtbGFiZWw9XCJPcGVuIGZpbGUgaW4gRmlsZXNcIiBvbkNsaWNrPXsoKSA9PiBvcGVuSW5GaWxlc1RhYihzZWxlY3RlZEZpbGUucGF0aCl9Plx1MjE5NzwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnVuc3RhZ2VkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRzZHItZmlsZS1pY29uXCIgdGl0bGU9e3QoJ2h1bmsuc3RhZ2UnKX0gYXJpYS1sYWJlbD17dCgnaHVuay5zdGFnZScpfSBkaXNhYmxlZD17YnVzeX0gb25DbGljaz17KCkgPT4gb25GaWxlQWN0aW9uKCdhY2NlcHQnLCBzZWxlY3RlZEZpbGUucGF0aCl9Pis8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIHthbGxvd0FjdGlvbnMgJiYgc2VsZWN0ZWRGaWxlLnN0YWdlZCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtaWNvblwiIHRpdGxlPXt0KCdodW5rLnVuc3RhZ2UnKX0gYXJpYS1sYWJlbD17dCgnaHVuay51bnN0YWdlJyl9IGRpc2FibGVkPXtidXN5fSBvbkNsaWNrPXsoKSA9PiBvbkZpbGVBY3Rpb24oJ3Vuc3RhZ2UnLCBzZWxlY3RlZEZpbGUucGF0aCl9Plx1MjIxMjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWZpbGUtaWNvbiBkc2RyLWZpbGUtaWNvbi1kYW5nZXJcIiB0aXRsZT17dCgnaHVuay5yZXZlcnQnKX0gYXJpYS1sYWJlbD17dCgnaHVuay5yZXZlcnQnKX0gZGlzYWJsZWQ9e2J1c3l9IG9uQ2xpY2s9eygpID0+IG9uRmlsZUFjdGlvbigncmV2ZXJ0Jywgc2VsZWN0ZWRGaWxlLnBhdGgpfT5cdTIxQjY8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHshY29sbGFwc2VkUmV2aWV3RmlsZXMuaGFzKHNlbGVjdGVkRmlsZS5wYXRoKSA/ICh2aWV3ID09PSAnc3BsaXQnICYmICFzZWxlY3RlZEZpbGUuYmluYXJ5ICYmIGdpdFNwbGl0QmxvY2tzKHNlbGVjdGVkRmlsZS5kaWZmKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1zY3JvbGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1oZWFkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmJlZm9yZScpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt0KCd2aWV3LmFmdGVyJyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAge2dpdFNwbGl0QmxvY2tzKHNlbGVjdGVkRmlsZS5kaWZmKS5tYXAoKGJsb2NrLCBiaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8RnJhZ21lbnQga2V5PXtiaX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2FsbG93QWN0aW9ucyA/IDxIdW5rVG9vbGJhciBodW5rPXtzZWxlY3RlZEZpbGUuaHVua3NbYmldfSBidXN5PXtidXN5fSBvbkFjdGlvbj17b25IdW5rQWN0aW9ufSB0PXt0fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLmhlYWQgPyA8ZGl2IGNsYXNzTmFtZT1cImRzZHItc3BsaXQtaHVua1wiPntibG9jay5oZWFkfTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Jsb2NrLnJvd3MubWFwKChyb3csIHJpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByb3dGaW5kaW5ncyA9IChyZXZpZXc/LmZpbmRpbmdzID8/IFtdKS5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGYuZmlsZSA9PT0gc2VsZWN0ZWRGaWxlLnBhdGggJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocm93LnJpZ2h0TnVtICE9PSBudWxsID8gcm93LnJpZ2h0TnVtID49IGYubGluZVN0YXJ0ICYmIHJvdy5yaWdodE51bSA8PSBmLmxpbmVFbmQgOiByb3cubGVmdE51bSAhPT0gbnVsbCAmJiByb3cubGVmdE51bSA+PSBmLmxpbmVTdGFydCAmJiByb3cubGVmdE51bSA8PSBmLmxpbmVFbmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmluZGluZ0NscyA9IHJvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgPyBgIGRzZHItY2VsbC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWAgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QganVtcGVkID0ganVtcExpbmUgIT0gbnVsbCAmJiAocm93LnJpZ2h0TnVtID09PSBqdW1wTGluZSB8fCAocm93LnJpZ2h0TnVtID09PSBudWxsICYmIHJvdy5sZWZ0TnVtID09PSBqdW1wTGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21tZW50IGFuY2hvcnMgc3RheSBjb25zaXN0ZW50IHdpdGggdGhlIHVuaWZpZWQgdmlldzogY3R4IHJvd3MgZXhwb3NlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBib3RoIGxpbmUgbnVtYmVycywgY2hhbmdlIHJvd3MgZXhwb3NlIHRoZSBzaWRlIHRoZXkgYmVsb25nIHRvLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdEFuY2hvciA9IHsgb2xkTGluZTogcm93LmxlZnROdW0sIG5ld0xpbmU6IHJvdy5raW5kID09PSAnY3R4JyAmJiByb3cubGVmdE51bSAhPT0gbnVsbCA/IHJvdy5sZWZ0TnVtIDogbnVsbCB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodEFuY2hvciA9IHsgb2xkTGluZTogcm93LmtpbmQgPT09ICdjdHgnICYmIHJvdy5yaWdodE51bSAhPT0gbnVsbCA/IHJvdy5yaWdodE51bSA6IG51bGwsIG5ld0xpbmU6IHJvdy5yaWdodE51bSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0S2V5ID0gYCR7bGVmdEFuY2hvci5vbGRMaW5lID8/ICdvJ306JHtsZWZ0QW5jaG9yLm5ld0xpbmUgPz8gJ24nfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0S2V5ID0gYCR7cmlnaHRBbmNob3Iub2xkTGluZSA/PyAnbyd9OiR7cmlnaHRBbmNob3IubmV3TGluZSA/PyAnbid9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCBsZWZ0QW5jaG9yLm9sZExpbmUsIGxlZnRBbmNob3IubmV3TGluZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByaWdodENvbW1lbnRzID0gY29tbWVudHMuZmlsdGVyKChjKSA9PiBjb21tZW50TWF0Y2hlcyhjLCByaWdodEFuY2hvci5vbGRMaW5lLCByaWdodEFuY2hvci5uZXdMaW5lKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wZW5CdG4gPSAobGluZTogbnVtYmVyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEZpbGUucGF0aCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLXNwbGl0LW9wZW5saW5lXCIgdGl0bGU9e3QoJ2VkaXRvci5vcGVuTGluZScpfSBhcmlhLWxhYmVsPXt0KCdlZGl0b3Iub3BlbkxpbmUnKX0gb25DbGljaz17KCkgPT4gdm9pZCBvcGVuRmlsZShzZWxlY3RlZEZpbGUucGF0aCwgbGluZSl9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUyMTk3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb21tZW50QnRuID0gKGFuY2hvcjogeyBvbGRMaW5lOiBudW1iZXIgfCBudWxsOyBuZXdMaW5lOiBudW1iZXIgfCBudWxsIH0sIGNvdW50OiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ9e2NvdW50fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT3Blbj17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudEVkaXRvcih7IG9sZExpbmU6IGFuY2hvci5vbGRMaW5lLCBuZXdMaW5lOiBhbmNob3IubmV3TGluZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Q29tbWVudFRleHQoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0PXt0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZyYWdtZW50IGtleT17cml9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1yb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LmxlZnROdW0gPT09IG51bGwgPyAnZHNkci1jZWxsLWRpbScgOiByb3cua2luZCA9PT0gJ2NoYW5nZScgPyAnZHNkci1jZWxsLWRlbCcgOiAnJ30ke2ZpbmRpbmdDbHN9JHtqdW1wZWQgPyAnIGRzZHItY2VsbC1qdW1wJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtZHNkci1saW5lPXtyb3cubGVmdE51bSA/PyB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtbnVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvdy5sZWZ0TnVtID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKGxlZnRBbmNob3IsIGxlZnRDb21tZW50cy5sZW5ndGgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3BsaXQtdGV4dFwiPntyb3cubGVmdH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cubGVmdE51bSAhPT0gbnVsbCA/IG9wZW5CdG4ocm93LmxlZnROdW0pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Jvd0ZpbmRpbmdzLmxlbmd0aCA+IDAgJiYgcm93LnJpZ2h0TnVtID09PSBudWxsID8gPHNwYW4gY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1maW5kaW5nIGRzZHItZmluZGluZy0ke3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fWB9Pntyb3dGaW5kaW5nc1swXS5wcmlvcml0eX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2xlZnRDb21tZW50cy5sZW5ndGggPiAwID8gbGVmdENvbW1lbnRzLm1hcCgoY29tbWVudCkgPT4gPENvbW1lbnRCb3gga2V5PXtjb21tZW50LmlkfSBjb21tZW50PXtjb21tZW50fSBidXN5PXtidXN5fSBvblVwZGF0ZT17dXBkYXRlQ29tbWVudH0gb25EZWxldGU9eyhpZCkgPT4gdm9pZCBkZWxldGVDb21tZW50KGlkKX0gdD17dH0gLz4pIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbW1lbnRFZGl0b3IgJiYgbGVmdEtleSA9PT0gYCR7Y29tbWVudEVkaXRvci5vbGRMaW5lID8/ICdvJ306JHtjb21tZW50RWRpdG9yLm5ld0xpbmUgPz8gJ24nfWAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbW1lbnRFZGl0b3IgdGV4dD17Y29tbWVudFRleHR9IG9uVGV4dD17c2V0Q29tbWVudFRleHR9IG9uU2F2ZT17KCkgPT4gdm9pZCBzYXZlQ29tbWVudCgpfSBvbkNhbmNlbD17Y2FuY2VsQ29tbWVudH0gYnVzeT17YnVzeX0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZHNkci1zcGxpdC1jZWxsICR7cm93LnJpZ2h0TnVtID09PSBudWxsID8gJ2RzZHItY2VsbC1kaW0nIDogcm93LmtpbmQgPT09ICdjaGFuZ2UnID8gJ2RzZHItY2VsbC1hZGQnIDogJyd9JHtmaW5kaW5nQ2xzfSR7anVtcGVkID8gJyBkc2RyLWNlbGwtanVtcCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWRzZHItbGluZT17cm93LnJpZ2h0TnVtID8/IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC1udW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93LnJpZ2h0TnVtID8/ICcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50QnRuKHJpZ2h0QW5jaG9yLCByaWdodENvbW1lbnRzLmxlbmd0aCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1zcGxpdC10ZXh0XCI+e3Jvdy5yaWdodH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cucmlnaHROdW0gIT09IG51bGwgPyBvcGVuQnRuKHJvdy5yaWdodE51bSkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cm93RmluZGluZ3MubGVuZ3RoID4gMCAmJiByb3cucmlnaHROdW0gIT09IG51bGwgPyA8c3BhbiBjbGFzc05hbWU9e2Bkc2RyLXNwbGl0LWZpbmRpbmcgZHNkci1maW5kaW5nLSR7cm93RmluZGluZ3NbMF0ucHJpb3JpdHl9YH0+e3Jvd0ZpbmRpbmdzWzBdLnByaW9yaXR5fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmlnaHRDb21tZW50cy5sZW5ndGggPiAwID8gcmlnaHRDb21tZW50cy5tYXAoKGNvbW1lbnQpID0+IDxDb21tZW50Qm94IGtleT17Y29tbWVudC5pZH0gY29tbWVudD17Y29tbWVudH0gYnVzeT17YnVzeX0gb25VcGRhdGU9e3VwZGF0ZUNvbW1lbnR9IG9uRGVsZXRlPXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9IHQ9e3R9IC8+KSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjb21tZW50RWRpdG9yICYmIHJpZ2h0S2V5ID09PSBgJHtjb21tZW50RWRpdG9yLm9sZExpbmUgPz8gJ28nfToke2NvbW1lbnRFZGl0b3IubmV3TGluZSA/PyAnbid9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWVudEVkaXRvciB0ZXh0PXtjb21tZW50VGV4dH0gb25UZXh0PXtzZXRDb21tZW50VGV4dH0gb25TYXZlPXsoKSA9PiB2b2lkIHNhdmVDb21tZW50KCl9IG9uQ2FuY2VsPXtjYW5jZWxDb21tZW50fSBidXN5PXtidXN5fSB0PXt0fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyhyZXZpZXc/LmZpbmRpbmdzID8/IFtdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoZikgPT4gZi5maWxlID09PSBzZWxlY3RlZEZpbGUucGF0aCAmJiBmLmxpbmVTdGFydCA9PT0gKHJvdy5sZWZ0TnVtID8/IHJvdy5yaWdodE51bSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChmLCBmaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmluZGluZ0NhcmQga2V5PXtgJHtmLmZpbGV9OiR7Zi5saW5lU3RhcnR9OiR7Zml9YH0gZmluZGluZz17Zn0gdD17dH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPFVuaWZpZWREaWZmXG4gICAgICAgICAgICAgICAgICAgICAgZGlmZj17c2VsZWN0ZWRGaWxlLmRpZmZ9XG4gICAgICAgICAgICAgICAgICAgICAgaHVua3M9e3NlbGVjdGVkRmlsZS5odW5rc31cbiAgICAgICAgICAgICAgICAgICAgICBidXN5PXtidXN5fVxuICAgICAgICAgICAgICAgICAgICAgIG9uSHVua0FjdGlvbj17b25IdW5rQWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIHQ9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudHM9e2NvbW1lbnRzfVxuICAgICAgICAgICAgICAgICAgICAgIGNvbW1lbnRFZGl0b3I9e2NvbW1lbnRFZGl0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgY29tbWVudFRleHQ9e2NvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ29tbWVudFRleHQ9e3NldENvbW1lbnRUZXh0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uT3BlbkNvbW1lbnQ9e29wZW5Db21tZW50fVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZUNvbW1lbnQ9eygpID0+IHZvaWQgc2F2ZUNvbW1lbnQoKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbENvbW1lbnQ9e2NhbmNlbENvbW1lbnR9XG4gICAgICAgICAgICAgICAgICAgICAgb25EZWxldGVDb21tZW50PXsoaWQpID0+IHZvaWQgZGVsZXRlQ29tbWVudChpZCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25VcGRhdGVDb21tZW50PXt1cGRhdGVDb21tZW50fVxuICAgICAgICAgICAgICAgICAgICAgIHJlYWRPbmx5PXshYWxsb3dBY3Rpb25zfVxuICAgICAgICAgICAgICAgICAgICAgIHBhdGg9e3NlbGVjdGVkRmlsZS5wYXRofVxuICAgICAgICAgICAgICAgICAgICAgIHJldmlld0ZpbmRpbmdzPXtyZXZpZXc/LmZpbmRpbmdzfVxuICAgICAgICAgICAgICAgICAgICAgIG9uT3BlbkxpbmU9eyhwLCBsaW5lKSA9PiB2b2lkIG9wZW5GaWxlKHAsIGxpbmUpfVxuICAgICAgICAgICAgICAgICAgICAgIGp1bXBMaW5lPXtqdW1wTGluZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICkpIDogbnVsbH1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItZGlmZi1lbXB0eVwiPntzY29wZSA9PT0gJ2NvbW1pdCcgPyB0KCdyZXZpZXcuc2VsZWN0Q29tbWl0JykgOiB0KCdyZXZpZXcuZW1wdHknKX08L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHNkci1lbXB0eVwiPlxuICAgICAgICAgICAge2Vycm9yID8/IHQoJ3Jldmlldy5sb2FkRXJyb3InKX1cbiAgICAgICAgICAgIHshc3RhdHVzPy5pc1JlcG8gPyA8ZGl2Pnt0KCdyZXZpZXcubm90UmVwb0hpbnQnKX08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgICAgPC8+XG4gICAgICAgICl9XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkc2RyLWZvb3RcIj5cbiAgICAgICAgICB7KGxvYWRpbmcgfHwgYnVzeSkgJiYgdGFiID09PSAnd29ya3NwYWNlJyA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItc3Bpbm5lclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7YnVzeSA/IDxzcGFuIGNsYXNzTmFtZT1cImRzZHItbm90aWNlXCI+e3QoJ3Jldmlldy5idXN5Jyl9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAge25vdGljZSA/IDxzcGFuIGNsYXNzTmFtZT17YGRzZHItbm90aWNlIGRzZHItbm90aWNlLSR7bm90aWNlLmtpbmR9YH0+e25vdGljZS50ZXh0fTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBDb25maWcgY2FyZCBmb3IgdGhlIFBsdWdpbnMgY29uZmlndXJhdGlvbiB0YWIgKFNldHRpbmdzIFx1MjE5MiBQbHVnaW5zIFx1MjE5MiBcdTUzRUZcdTkxNERcdTdGNkUpLiAqL1xuZnVuY3Rpb24gRGlmZlJldmlld0NvbmZpZ0NhcmQoeyB0IH06IHsgdDogKGtleToga2V5b2YgdHlwZW9mIHpoLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgPT4gc3RyaW5nIH0pIHtcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgcmV0dXJuIChcbiAgICA8bGkgY2xhc3NOYW1lPXtvcGVuID8gJ2RzZHItY2ZnLWNhcmQgZHNkci1jZmctY2FyZC1vcGVuJyA6ICdkc2RyLWNmZy1jYXJkJ30+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkc2RyLWNmZy1oZWFkXCIgYXJpYS1leHBhbmRlZD17b3Blbn0gb25DbGljaz17KCkgPT4gc2V0T3BlbigodikgPT4gIXYpfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctaGVhZC10ZXh0XCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZHNkci1jZmctbmFtZVwiPnt0KCdzZXR0aW5ncy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJkc2RyLWNmZy1kZXNjXCI+e3QoJ2NvbmZpZy50aXRsZScpfTwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8SWNvbkNoZXZyb25Eb3duT3V0bGluZTE0IGNsYXNzTmFtZT17b3BlbiA/ICdkc2RyLWNmZy1jYXJldCBkc2RyLWNmZy1jYXJldC1vcGVuJyA6ICdkc2RyLWNmZy1jYXJldCd9IC8+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImRzZHItY2ZnLWJvZHlcIj5cbiAgICAgICAgICA8RGlmZlJldmlld1ByZWZzIHQ9e3R9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9saT5cbiAgKVxufVxuXG4vKiogQ2xpZW50IHBsdWdpbiBib2R5LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5KGN0eDogQ2xpZW50Q29udGV4dCk6IHZvaWQge1xuICBjdHguZWZmZWN0KCgpID0+IGN0eC5sb2NhbGUucmVnaXN0ZXIoTE9DQUxFX05TLCB7IHpoLCBlbiB9KSwgJ2RpZmYtcmV2aWV3OiBsb2NhbGUgZGljdGlvbmFyeScpXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5zZXNzaW9uLmhlYWRlci5hY3Rpb25zJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uc2Vzc2lvbi5oZWFkZXIuYWN0aW9ucycsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXcnLFxuICAgICAgICBvcmRlcjogNzAsXG4gICAgICAgIGxvY2FsZTogTE9DQUxFX05TLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdBY3Rpb24sXG4gICAgKSxcbiAgKVxuICBjdHguc2xvdHMuaW5qZWN0KCdzaGVsbC5vdmVybGF5JywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzaGVsbC5vdmVybGF5JyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1vdmVybGF5JyxcbiAgICAgICAgb3JkZXI6IDEwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgICAgaW5qZWN0OiAoKSA9PiAoeyBzZXNzaW9uczogY3R4LnNlc3Npb25zIH0pLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdPdmVybGF5LFxuICAgICksXG4gIClcbiAgLy8gQ29kZXgtc3R5bGUgcGVuZGluZy1jb21tZW50cyBzdHJpcCBhdCB0aGUgVE9QIG9mIHRoZSBjb21wb3Nlciwgc3R5bGVkIGFzXG4gIC8vIHRoZSBjYXJkJ3Mgb3duIHN1cmZhY2Ugc28gaXQgcmVhZHMgYXMgb25lIGZ1c2VkIGRpYWxvZy5cbiAgY3R4LnNsb3RzLmluamVjdCgnY29udmVyc2F0aW9uLmlucHV0LmRvY2snLCAoKSA9PlxuICAgIGN0eC5zbG90cy5yZWdpc3RlcihcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2NvbnZlcnNhdGlvbi5pbnB1dC5kb2NrJyxcbiAgICAgICAgaWQ6ICdkaWZmLXJldmlldy1jb21tZW50cy1kb2NrJyxcbiAgICAgICAgb3JkZXI6IDIwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgICAgaW5qZWN0OiAoKSA9PiAoeyBzZXNzaW9uczogY3R4LnNlc3Npb25zIH0pLFxuICAgICAgfSxcbiAgICAgIERpZmZSZXZpZXdDb21wb3NlckRvY2ssXG4gICAgKSxcbiAgKVxuICAvLyBUaGUgZW5naW5lJ3MgdHVybiB0YWlsIHNpdHMgZGlyZWN0bHkgYWZ0ZXIgYSBjb21wbGV0ZWQgYWdlbnQgcmVzcG9uc2UuXG4gIC8vIEl0cyBjaGFpbiBzZWxlY3RvciByZXR1cm5zIHRoZSBvd25lciBjdXJyZW5jeTsgdGhlIGNvbXBvbmVudCBkZWNsaW5lc1xuICAvLyB0dXJucyB3aXRob3V0IHBlcnNpc3RlZCBmaWxlIGNoYW5nZXMuXG4gIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5jaGF0LnR1cm5UYWlsJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdjb252ZXJzYXRpb24uY2hhdC50dXJuVGFpbCcsXG4gICAgICAgIHNlbGVjdDogKG93bmVyKSA9PiBvd25lcixcbiAgICAgICAgcHJpb3JpdHk6IC0xMCxcbiAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICB9LFxuICAgICAgVHVybkNoYW5nZVN1bW1hcnksXG4gICAgKSxcbiAgKVxuICAvLyBUaGUgY2FycmllZCByZXZpZXcgcGFja2FnZSByZW5kZXJzIGluIHRoZSB0cmFuc2NyaXB0IGFzIGEgQ29kZXgtc3R5bGVcbiAgLy8gY2FyZDogc2hhZG93IHRoZSBzaGVsbCdzIHVzZXItbm9kZSByZW5kZXJlciAocHJpb3JpdHkgLTEgPSBsb3dlc3Qgd2lucylcbiAgLy8gYW5kIHJlLXJlbmRlciBub24tcGFja2FnZSBtZXNzYWdlcyB3aXRoIGEgbmF0aXZlLWxvb2sgYnViYmxlLiBUaGVcbiAgLy8gc3RlZXJpbmcga2luZCBnZXRzIHRoZSBzYW1lIHRyZWF0bWVudCBcdTIwMTQgdGhlIHBhY2thZ2UgaXMgaW5qZWN0ZWQgd2l0aFxuICAvLyBwcm9tcHQoLi4uLCAnc3RlZXInKSwgc28gaXQgbGFuZHMgaW4gdGhlIHRyYW5zY3JpcHQgYXMgYSBzdGVlcmluZyBub2RlLlxuICBmb3IgKGNvbnN0IGtleSBvZiBbJ3VzZXInLCAnc3RlZXJpbmcnXSBhcyBjb25zdCkge1xuICAgIGN0eC5zbG90cy5pbmplY3QoJ2NvbnZlcnNhdGlvbi5jaGF0Lm5vZGUnLCAoKSA9PlxuICAgICAgY3R4LnNsb3RzLnJlZ2lzdGVyKFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ2NvbnZlcnNhdGlvbi5jaGF0Lm5vZGUnLFxuICAgICAgICAgIGtleSxcbiAgICAgICAgICBwcmlvcml0eTogLTEsXG4gICAgICAgICAgbG9jYWxlOiBMT0NBTEVfTlMsXG4gICAgICAgIH0sXG4gICAgICAgIFVzZXJSZXZpZXdOb2RlVmlldyxcbiAgICAgICksXG4gICAgKVxuICB9XG4gIC8vIFRoZSBwbHVnaW4ncyBvd24gc2V0dGluZ3MgdGFiIGluc2lkZSBcdThCQkVcdTdGNkUgXHUyMTkyIFx1NjNEMlx1NEVGNiAobm90IHRoZSBHZW5lcmFsIHNlY3Rpb24pLlxuICAvLyBUaGUgcGx1Z2luJ3Mgd2hvbGUgY29uZmlndXJhdGlvbiBsaXZlcyBpbiBvbmUgY2FyZCBpbnNpZGVcbiAgLy8gXHU4QkJFXHU3RjZFIFx1MjE5MiBcdTYzRDJcdTRFRjYgXHUyMTkyIFx1NjNEMlx1NEVGNlx1OTE0RFx1N0Y2RSAoc2V0dGluZ3MucGx1Z2luLml0ZW0pOiBmb250L3NpemUuXG4gIGN0eC5zbG90cy5pbmplY3QoJ3NldHRpbmdzLnBsdWdpbi5pdGVtJywgKCkgPT5cbiAgICBjdHguc2xvdHMucmVnaXN0ZXIoXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdzZXR0aW5ncy5wbHVnaW4uaXRlbScsXG4gICAgICAgIGlkOiAnZGlmZi1yZXZpZXctY29uZmlnJyxcbiAgICAgICAgb3JkZXI6IDMwLFxuICAgICAgICBsb2NhbGU6IExPQ0FMRV9OUyxcbiAgICAgIH0sXG4gICAgICBEaWZmUmV2aWV3Q29uZmlnQ2FyZCxcbiAgICApLFxuICApXG59XG4iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlmZiB7XG4gICAgZGlmZihvbGRTdHIsIG5ld1N0ciwgXG4gICAgLy8gVHlwZSBiZWxvdyBpcyBub3QgYWNjdXJhdGUvY29tcGxldGUgLSBzZWUgYWJvdmUgZm9yIGZ1bGwgcG9zc2liaWxpdGllcyAtIGJ1dCBpdCBjb21waWxlc1xuICAgIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBsZXQgY2FsbGJhY2s7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zO1xuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCdjYWxsYmFjaycgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsbG93IHN1YmNsYXNzZXMgdG8gbWFzc2FnZSB0aGUgaW5wdXQgcHJpb3IgdG8gcnVubmluZ1xuICAgICAgICBjb25zdCBvbGRTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChvbGRTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBuZXdTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChuZXdTdHIsIG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBvbGRUb2tlbnMgPSB0aGlzLnJlbW92ZUVtcHR5KHRoaXMudG9rZW5pemUob2xkU3RyaW5nLCBvcHRpb25zKSk7XG4gICAgICAgIGNvbnN0IG5ld1Rva2VucyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShuZXdTdHJpbmcsIG9wdGlvbnMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlmZldpdGhPcHRpb25zT2JqKG9sZFRva2VucywgbmV3VG9rZW5zLCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgfVxuICAgIGRpZmZXaXRoT3B0aW9uc09iaihvbGRUb2tlbnMsIG5ld1Rva2Vucywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBjb25zdCBkb25lID0gKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMucG9zdFByb2Nlc3ModmFsdWUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNhbGxiYWNrKHZhbHVlKTsgfSwgMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IGVkaXRMZW5ndGggPSAxO1xuICAgICAgICBsZXQgbWF4RWRpdExlbmd0aCA9IG5ld0xlbiArIG9sZExlbjtcbiAgICAgICAgaWYgKG9wdGlvbnMubWF4RWRpdExlbmd0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXhFZGl0TGVuZ3RoID0gTWF0aC5taW4obWF4RWRpdExlbmd0aCwgb3B0aW9ucy5tYXhFZGl0TGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXhFeGVjdXRpb25UaW1lID0gKF9hID0gb3B0aW9ucy50aW1lb3V0KSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgYWJvcnRBZnRlclRpbWVzdGFtcCA9IERhdGUubm93KCkgKyBtYXhFeGVjdXRpb25UaW1lO1xuICAgICAgICBjb25zdCBiZXN0UGF0aCA9IFt7IG9sZFBvczogLTEsIGxhc3RDb21wb25lbnQ6IHVuZGVmaW5lZCB9XTtcbiAgICAgICAgLy8gU2VlZCBlZGl0TGVuZ3RoID0gMCwgaS5lLiB0aGUgY29udGVudCBzdGFydHMgd2l0aCB0aGUgc2FtZSB2YWx1ZXNcbiAgICAgICAgbGV0IG5ld1BvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiZXN0UGF0aFswXSwgbmV3VG9rZW5zLCBvbGRUb2tlbnMsIDAsIG9wdGlvbnMpO1xuICAgICAgICBpZiAoYmVzdFBhdGhbMF0ub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgIC8vIElkZW50aXR5IHBlciB0aGUgZXF1YWxpdHkgYW5kIHRva2VuaXplclxuICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiZXN0UGF0aFswXS5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE9uY2Ugd2UgaGl0IHRoZSByaWdodCBlZGdlIG9mIHRoZSBlZGl0IGdyYXBoIG9uIHNvbWUgZGlhZ29uYWwgaywgd2UgY2FuXG4gICAgICAgIC8vIGRlZmluaXRlbHkgcmVhY2ggdGhlIGVuZCBvZiB0aGUgZWRpdCBncmFwaCBpbiBubyBtb3JlIHRoYW4gayBlZGl0cywgc29cbiAgICAgICAgLy8gdGhlcmUncyBubyBwb2ludCBpbiBjb25zaWRlcmluZyBhbnkgbW92ZXMgdG8gZGlhZ29uYWwgaysxIGFueSBtb3JlIChmcm9tXG4gICAgICAgIC8vIHdoaWNoIHdlJ3JlIGd1YXJhbnRlZWQgdG8gbmVlZCBhdCBsZWFzdCBrKzEgbW9yZSBlZGl0cykuXG4gICAgICAgIC8vIFNpbWlsYXJseSwgb25jZSB3ZSd2ZSByZWFjaGVkIHRoZSBib3R0b20gb2YgdGhlIGVkaXQgZ3JhcGgsIHRoZXJlJ3Mgbm9cbiAgICAgICAgLy8gcG9pbnQgY29uc2lkZXJpbmcgbW92ZXMgdG8gbG93ZXIgZGlhZ29uYWxzLlxuICAgICAgICAvLyBXZSByZWNvcmQgdGhpcyBmYWN0IGJ5IHNldHRpbmcgbWluRGlhZ29uYWxUb0NvbnNpZGVyIGFuZFxuICAgICAgICAvLyBtYXhEaWFnb25hbFRvQ29uc2lkZXIgdG8gc29tZSBmaW5pdGUgdmFsdWUgb25jZSB3ZSd2ZSBoaXQgdGhlIGVkZ2Ugb2ZcbiAgICAgICAgLy8gdGhlIGVkaXQgZ3JhcGguXG4gICAgICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIGlzIG5vdCBmYWl0aGZ1bCB0byB0aGUgb3JpZ2luYWwgYWxnb3JpdGhtIHByZXNlbnRlZCBpblxuICAgICAgICAvLyBNeWVycydzIHBhcGVyLCB3aGljaCBpbnN0ZWFkIHBvaW50bGVzc2x5IGV4dGVuZHMgRC1wYXRocyBvZmYgdGhlIGVuZCBvZlxuICAgICAgICAvLyB0aGUgZWRpdCBncmFwaCAtIHNlZSBwYWdlIDcgb2YgTXllcnMncyBwYXBlciB3aGljaCBub3RlcyB0aGlzIHBvaW50XG4gICAgICAgIC8vIGV4cGxpY2l0bHkgYW5kIGlsbHVzdHJhdGVzIGl0IHdpdGggYSBkaWFncmFtLiBUaGlzIGhhcyBtYWpvciBwZXJmb3JtYW5jZVxuICAgICAgICAvLyBpbXBsaWNhdGlvbnMgZm9yIHNvbWUgY29tbW9uIHNjZW5hcmlvcy4gRm9yIGluc3RhbmNlLCB0byBjb21wdXRlIGEgZGlmZlxuICAgICAgICAvLyB3aGVyZSB0aGUgbmV3IHRleHQgc2ltcGx5IGFwcGVuZHMgZCBjaGFyYWN0ZXJzIG9uIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIG9yaWdpbmFsIHRleHQgb2YgbGVuZ3RoIG4sIHRoZSB0cnVlIE15ZXJzIGFsZ29yaXRobSB3aWxsIHRha2UgTyhuK2ReMilcbiAgICAgICAgLy8gdGltZSB3aGlsZSB0aGlzIG9wdGltaXphdGlvbiBuZWVkcyBvbmx5IE8obitkKSB0aW1lLlxuICAgICAgICBsZXQgbWluRGlhZ29uYWxUb0NvbnNpZGVyID0gLUluZmluaXR5LCBtYXhEaWFnb25hbFRvQ29uc2lkZXIgPSBJbmZpbml0eTtcbiAgICAgICAgLy8gTWFpbiB3b3JrZXIgbWV0aG9kLiBjaGVja3MgYWxsIHBlcm11dGF0aW9ucyBvZiBhIGdpdmVuIGVkaXQgbGVuZ3RoIGZvciBhY2NlcHRhbmNlLlxuICAgICAgICBjb25zdCBleGVjRWRpdExlbmd0aCA9ICgpID0+IHtcbiAgICAgICAgICAgIGZvciAobGV0IGRpYWdvbmFsUGF0aCA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgLWVkaXRMZW5ndGgpOyBkaWFnb25hbFBhdGggPD0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBlZGl0TGVuZ3RoKTsgZGlhZ29uYWxQYXRoICs9IDIpIHtcbiAgICAgICAgICAgICAgICBsZXQgYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlUGF0aCA9IGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdLCBhZGRQYXRoID0gYmVzdFBhdGhbZGlhZ29uYWxQYXRoICsgMV07XG4gICAgICAgICAgICAgICAgaWYgKHJlbW92ZVBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gb25lIGVsc2UgaXMgZ29pbmcgdG8gYXR0ZW1wdCB0byB1c2UgdGhpcyB2YWx1ZSwgY2xlYXIgaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoIC0gMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxldCBjYW5BZGQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGF0IG5ld1BvcyB3aWxsIGJlIGFmdGVyIHdlIGRvIGFuIGluc2VydGlvbjpcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkUGF0aE5ld1BvcyA9IGFkZFBhdGgub2xkUG9zIC0gZGlhZ29uYWxQYXRoO1xuICAgICAgICAgICAgICAgICAgICBjYW5BZGQgPSBhZGRQYXRoICYmIDAgPD0gYWRkUGF0aE5ld1BvcyAmJiBhZGRQYXRoTmV3UG9zIDwgbmV3TGVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBjYW5SZW1vdmUgPSByZW1vdmVQYXRoICYmIHJlbW92ZVBhdGgub2xkUG9zICsgMSA8IG9sZExlbjtcbiAgICAgICAgICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgcGF0aCBpcyBhIHRlcm1pbmFsIHRoZW4gcHJ1bmVcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIHBlcmYgb3B0aW1pc2F0aW9uLiBUaGlzIHR5cGUtdmlvbGF0aW5nIHZhbHVlIHdpbGwgbmV2ZXIgYmUgcmVhZC5cbiAgICAgICAgICAgICAgICAgICAgYmVzdFBhdGhbZGlhZ29uYWxQYXRoXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFNlbGVjdCB0aGUgZGlhZ29uYWwgdGhhdCB3ZSB3YW50IHRvIGJyYW5jaCBmcm9tLiBXZSBzZWxlY3QgdGhlIHByaW9yXG4gICAgICAgICAgICAgICAgLy8gcGF0aCB3aG9zZSBwb3NpdGlvbiBpbiB0aGUgb2xkIHN0cmluZyBpcyB0aGUgZmFydGhlc3QgZnJvbSB0aGUgb3JpZ2luXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRvZXMgbm90IHBhc3MgdGhlIGJvdW5kcyBvZiB0aGUgZGlmZiBncmFwaFxuICAgICAgICAgICAgICAgIGlmICghY2FuUmVtb3ZlIHx8IChjYW5BZGQgJiYgcmVtb3ZlUGF0aC5vbGRQb3MgPCBhZGRQYXRoLm9sZFBvcykpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZVBhdGggPSB0aGlzLmFkZFRvUGF0aChhZGRQYXRoLCB0cnVlLCBmYWxzZSwgMCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlUGF0aCA9IHRoaXMuYWRkVG9QYXRoKHJlbW92ZVBhdGgsIGZhbHNlLCB0cnVlLCAxLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zID0gdGhpcy5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdUb2tlbnMsIG9sZFRva2VucywgZGlhZ29uYWxQYXRoLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZVBhdGgub2xkUG9zICsgMSA+PSBvbGRMZW4gJiYgbmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUodGhpcy5idWlsZFZhbHVlcyhiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2VucykpIHx8IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiZXN0UGF0aFtkaWFnb25hbFBhdGhdID0gYmFzZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlUGF0aC5vbGRQb3MgKyAxID49IG9sZExlbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF4RGlhZ29uYWxUb0NvbnNpZGVyID0gTWF0aC5taW4obWF4RGlhZ29uYWxUb0NvbnNpZGVyLCBkaWFnb25hbFBhdGggLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAobmV3UG9zICsgMSA+PSBuZXdMZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpYWdvbmFsVG9Db25zaWRlciA9IE1hdGgubWF4KG1pbkRpYWdvbmFsVG9Db25zaWRlciwgZGlhZ29uYWxQYXRoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlZGl0TGVuZ3RoKys7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFBlcmZvcm1zIHRoZSBsZW5ndGggb2YgZWRpdCBpdGVyYXRpb24uIElzIGEgYml0IGZ1Z2x5IGFzIHRoaXMgaGFzIHRvIHN1cHBvcnQgdGhlXG4gICAgICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAgICAgLy8gaXMgcHJvZHVjZWQsIG9yIHVudGlsIHRoZSBlZGl0IGxlbmd0aCBleGNlZWRzIG9wdGlvbnMubWF4RWRpdExlbmd0aCAoaWYgZ2l2ZW4pLFxuICAgICAgICAvLyBpbiB3aGljaCBjYXNlIGl0IHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoIHx8IERhdGUubm93KCkgPiBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSgpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdoaWxlIChlZGl0TGVuZ3RoIDw9IG1heEVkaXRMZW5ndGggJiYgRGF0ZS5ub3coKSA8PSBhYm9ydEFmdGVyVGltZXN0YW1wKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcbiAgICAgICAgICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFRvUGF0aChwYXRoLCBhZGRlZCwgcmVtb3ZlZCwgb2xkUG9zSW5jLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGxhc3QgPSBwYXRoLmxhc3RDb21wb25lbnQ7XG4gICAgICAgIGlmIChsYXN0ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuICYmIGxhc3QuYWRkZWQgPT09IGFkZGVkICYmIGxhc3QucmVtb3ZlZCA9PT0gcmVtb3ZlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvbGRQb3M6IHBhdGgub2xkUG9zICsgb2xkUG9zSW5jLFxuICAgICAgICAgICAgICAgIGxhc3RDb21wb25lbnQ6IHsgY291bnQ6IGxhc3QuY291bnQgKyAxLCBhZGRlZDogYWRkZWQsIHJlbW92ZWQ6IHJlbW92ZWQsIHByZXZpb3VzQ29tcG9uZW50OiBsYXN0LnByZXZpb3VzQ29tcG9uZW50IH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9sZFBvczogcGF0aC5vbGRQb3MgKyBvbGRQb3NJbmMsXG4gICAgICAgICAgICAgICAgbGFzdENvbXBvbmVudDogeyBjb3VudDogMSwgYWRkZWQ6IGFkZGVkLCByZW1vdmVkOiByZW1vdmVkLCBwcmV2aW91c0NvbXBvbmVudDogbGFzdCB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4dHJhY3RDb21tb24oYmFzZVBhdGgsIG5ld1Rva2Vucywgb2xkVG9rZW5zLCBkaWFnb25hbFBhdGgsIG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgbmV3TGVuID0gbmV3VG9rZW5zLmxlbmd0aCwgb2xkTGVuID0gb2xkVG9rZW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IG9sZFBvcyA9IGJhc2VQYXRoLm9sZFBvcywgbmV3UG9zID0gb2xkUG9zIC0gZGlhZ29uYWxQYXRoLCBjb21tb25Db3VudCA9IDA7XG4gICAgICAgIHdoaWxlIChuZXdQb3MgKyAxIDwgbmV3TGVuICYmIG9sZFBvcyArIDEgPCBvbGRMZW4gJiYgdGhpcy5lcXVhbHMob2xkVG9rZW5zW29sZFBvcyArIDFdLCBuZXdUb2tlbnNbbmV3UG9zICsgMV0sIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBuZXdQb3MrKztcbiAgICAgICAgICAgIG9sZFBvcysrO1xuICAgICAgICAgICAgY29tbW9uQ291bnQrKztcbiAgICAgICAgICAgIGlmIChvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICAgICAgYmFzZVBhdGgubGFzdENvbXBvbmVudCA9IHsgY291bnQ6IDEsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbW1vbkNvdW50ICYmICFvcHRpb25zLm9uZUNoYW5nZVBlclRva2VuKSB7XG4gICAgICAgICAgICBiYXNlUGF0aC5sYXN0Q29tcG9uZW50ID0geyBjb3VudDogY29tbW9uQ291bnQsIHByZXZpb3VzQ29tcG9uZW50OiBiYXNlUGF0aC5sYXN0Q29tcG9uZW50LCBhZGRlZDogZmFsc2UsIHJlbW92ZWQ6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgYmFzZVBhdGgub2xkUG9zID0gb2xkUG9zO1xuICAgICAgICByZXR1cm4gbmV3UG9zO1xuICAgIH1cbiAgICBlcXVhbHMobGVmdCwgcmlnaHQsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY29tcGFyYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY29tcGFyYXRvcihsZWZ0LCByaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHRcbiAgICAgICAgICAgICAgICB8fCAoISFvcHRpb25zLmlnbm9yZUNhc2UgJiYgbGVmdC50b0xvd2VyQ2FzZSgpID09PSByaWdodC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVFbXB0eShhcnJheSkge1xuICAgICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycmF5W2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0LnB1c2goYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICBjYXN0SW5wdXQodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xuICAgIH1cbiAgICBqb2luKGNoYXJzKSB7XG4gICAgICAgIC8vIEFzc3VtZXMgVmFsdWVUIGlzIHN0cmluZywgd2hpY2ggaXMgdGhlIGNhc2UgZm9yIG1vc3Qgc3ViY2xhc3Nlcy5cbiAgICAgICAgLy8gV2hlbiBpdCdzIGZhbHNlLCBlLmcuIGluIGRpZmZBcnJheXMsIHRoaXMgbWV0aG9kIG5lZWRzIHRvIGJlIG92ZXJyaWRkZW4gKGUuZy4gd2l0aCBhIG5vLW9wKVxuICAgICAgICAvLyBZZXMsIHRoZSBjYXN0cyBhcmUgdmVyYm9zZSBhbmQgdWdseSwgYmVjYXVzZSB0aGlzIHBhdHRlcm4gLSBvZiBoYXZpbmcgdGhlIGJhc2UgY2xhc3MgU09SVCBPRlxuICAgICAgICAvLyBhc3N1bWUgdG9rZW5zIGFuZCB2YWx1ZXMgYXJlIHN0cmluZ3MsIGJ1dCBub3QgY29tcGxldGVseSAtIGlzIHdlaXJkIGFuZCBqYW5reS5cbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH1cbiAgICBwb3N0UHJvY2VzcyhjaGFuZ2VPYmplY3RzLCBcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gY2hhbmdlT2JqZWN0cztcbiAgICB9XG4gICAgZ2V0IHVzZUxvbmdlc3RUb2tlbigpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBidWlsZFZhbHVlcyhsYXN0Q29tcG9uZW50LCBuZXdUb2tlbnMsIG9sZFRva2Vucykge1xuICAgICAgICAvLyBGaXJzdCB3ZSBjb252ZXJ0IG91ciBsaW5rZWQgbGlzdCBvZiBjb21wb25lbnRzIGluIHJldmVyc2Ugb3JkZXIgdG8gYW5cbiAgICAgICAgLy8gYXJyYXkgaW4gdGhlIHJpZ2h0IG9yZGVyOlxuICAgICAgICBjb25zdCBjb21wb25lbnRzID0gW107XG4gICAgICAgIGxldCBuZXh0Q29tcG9uZW50O1xuICAgICAgICB3aGlsZSAobGFzdENvbXBvbmVudCkge1xuICAgICAgICAgICAgY29tcG9uZW50cy5wdXNoKGxhc3RDb21wb25lbnQpO1xuICAgICAgICAgICAgbmV4dENvbXBvbmVudCA9IGxhc3RDb21wb25lbnQucHJldmlvdXNDb21wb25lbnQ7XG4gICAgICAgICAgICBkZWxldGUgbGFzdENvbXBvbmVudC5wcmV2aW91c0NvbXBvbmVudDtcbiAgICAgICAgICAgIGxhc3RDb21wb25lbnQgPSBuZXh0Q29tcG9uZW50O1xuICAgICAgICB9XG4gICAgICAgIGNvbXBvbmVudHMucmV2ZXJzZSgpO1xuICAgICAgICBjb25zdCBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aDtcbiAgICAgICAgbGV0IGNvbXBvbmVudFBvcyA9IDAsIG5ld1BvcyA9IDAsIG9sZFBvcyA9IDA7XG4gICAgICAgIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBjb21wb25lbnRzW2NvbXBvbmVudFBvc107XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudC5yZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjb21wb25lbnQuYWRkZWQgJiYgdGhpcy51c2VMb25nZXN0VG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3VG9rZW5zLnNsaWNlKG5ld1BvcywgbmV3UG9zICsgY29tcG9uZW50LmNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IG9sZFRva2Vuc1tvbGRQb3MgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvbGRWYWx1ZS5sZW5ndGggPiB2YWx1ZS5sZW5ndGggPyBvbGRWYWx1ZSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudC52YWx1ZSA9IHRoaXMuam9pbihuZXdUb2tlbnMuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3UG9zICs9IGNvbXBvbmVudC5jb3VudDtcbiAgICAgICAgICAgICAgICAvLyBDb21tb24gY2FzZVxuICAgICAgICAgICAgICAgIGlmICghY29tcG9uZW50LmFkZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LnZhbHVlID0gdGhpcy5qb2luKG9sZFRva2Vucy5zbGljZShvbGRQb3MsIG9sZFBvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgICAgICAgICAgIG9sZFBvcyArPSBjb21wb25lbnQuY291bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudHM7XG4gICAgfVxufVxuIiwgImltcG9ydCBEaWZmIGZyb20gJy4vYmFzZS5qcyc7XG5pbXBvcnQgeyBnZW5lcmF0ZU9wdGlvbnMgfSBmcm9tICcuLi91dGlsL3BhcmFtcy5qcyc7XG5jbGFzcyBMaW5lRGlmZiBleHRlbmRzIERpZmYge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnRva2VuaXplID0gdG9rZW5pemU7XG4gICAgfVxuICAgIGVxdWFscyhsZWZ0LCByaWdodCwgb3B0aW9ucykge1xuICAgICAgICAvLyBJZiB3ZSdyZSBpZ25vcmluZyB3aGl0ZXNwYWNlLCB3ZSBuZWVkIHRvIG5vcm1hbGlzZSBsaW5lcyBieSBzdHJpcHBpbmdcbiAgICAgICAgLy8gd2hpdGVzcGFjZSBiZWZvcmUgY2hlY2tpbmcgZXF1YWxpdHkuIChUaGlzIGhhcyBhbiBhbm5veWluZyBpbnRlcmFjdGlvblxuICAgICAgICAvLyB3aXRoIG5ld2xpbmVJc1Rva2VuIHRoYXQgcmVxdWlyZXMgc3BlY2lhbCBoYW5kbGluZzogaWYgbmV3bGluZXMgZ2V0IHRoZWlyXG4gICAgICAgIC8vIG93biB0b2tlbiwgdGhlbiB3ZSBET04nVCB3YW50IHRvIHRyaW0gdGhlICpuZXdsaW5lKiB0b2tlbnMgZG93biB0byBlbXB0eVxuICAgICAgICAvLyBzdHJpbmdzLCBzaW5jZSB0aGlzIHdvdWxkIGNhdXNlIHVzIHRvIHRyZWF0IHdoaXRlc3BhY2Utb25seSBsaW5lIGNvbnRlbnRcbiAgICAgICAgLy8gYXMgZXF1YWwgdG8gYSBzZXBhcmF0b3IgYmV0d2VlbiBsaW5lcywgd2hpY2ggd291bGQgYmUgd2VpcmQgYW5kXG4gICAgICAgIC8vIGluY29uc2lzdGVudCB3aXRoIHRoZSBkb2N1bWVudGVkIGJlaGF2aW9yIG9mIHRoZSBvcHRpb25zLilcbiAgICAgICAgaWYgKG9wdGlvbnMuaWdub3JlV2hpdGVzcGFjZSkge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5ld2xpbmVJc1Rva2VuIHx8ICFsZWZ0LmluY2x1ZGVzKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5uZXdsaW5lSXNUb2tlbiB8fCAhcmlnaHQuaW5jbHVkZXMoJ1xcbicpKSB7XG4gICAgICAgICAgICAgICAgcmlnaHQgPSByaWdodC50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucy5pZ25vcmVOZXdsaW5lQXRFb2YgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIGlmIChsZWZ0LmVuZHNXaXRoKCdcXG4nKSkge1xuICAgICAgICAgICAgICAgIGxlZnQgPSBsZWZ0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyaWdodC5lbmRzV2l0aCgnXFxuJykpIHtcbiAgICAgICAgICAgICAgICByaWdodCA9IHJpZ2h0LnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwZXIuZXF1YWxzKGxlZnQsIHJpZ2h0LCBvcHRpb25zKTtcbiAgICB9XG59XG5leHBvcnQgY29uc3QgbGluZURpZmYgPSBuZXcgTGluZURpZmYoKTtcbmV4cG9ydCBmdW5jdGlvbiBkaWZmTGluZXMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbGluZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGlmZlRyaW1tZWRMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgeyBpZ25vcmVXaGl0ZXNwYWNlOiB0cnVlIH0pO1xuICAgIHJldHVybiBsaW5lRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cbi8vIEV4cG9ydGVkIHN0YW5kYWxvbmUgc28gaXQgY2FuIGJlIHVzZWQgZnJvbSBqc29uRGlmZiB0b28uXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemUodmFsdWUsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5zdHJpcFRyYWlsaW5nQ3IpIHtcbiAgICAgICAgLy8gcmVtb3ZlIG9uZSBcXHIgYmVmb3JlIFxcbiB0byBtYXRjaCBHTlUgZGlmZidzIC0tc3RyaXAtdHJhaWxpbmctY3IgYmVoYXZpb3JcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuICAgIH1cbiAgICBjb25zdCByZXRMaW5lcyA9IFtdLCBsaW5lc0FuZE5ld2xpbmVzID0gdmFsdWUuc3BsaXQoLyhcXG58XFxyXFxuKS8pO1xuICAgIC8vIElnbm9yZSB0aGUgZmluYWwgZW1wdHkgdG9rZW4gdGhhdCBvY2N1cnMgaWYgdGhlIHN0cmluZyBlbmRzIHdpdGggYSBuZXcgbGluZVxuICAgIGlmICghbGluZXNBbmROZXdsaW5lc1tsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIGxpbmVzQW5kTmV3bGluZXMucG9wKCk7XG4gICAgfVxuICAgIC8vIE1lcmdlIHRoZSBjb250ZW50IGFuZCBsaW5lIHNlcGFyYXRvcnMgaW50byBzaW5nbGUgdG9rZW5zXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0FuZE5ld2xpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc0FuZE5ld2xpbmVzW2ldO1xuICAgICAgICBpZiAoaSAlIDIgJiYgIW9wdGlvbnMubmV3bGluZUlzVG9rZW4pIHtcbiAgICAgICAgICAgIHJldExpbmVzW3JldExpbmVzLmxlbmd0aCAtIDFdICs9IGxpbmU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRMaW5lcztcbn1cbiIsICIvKipcbiAqIFJldmlldy1wYWNrYWdlIHBhcnNpbmcgZm9yIHRoZSBDb2RleC1zdHlsZSBjb252ZXJzYXRpb24gY2FyZC5cbiAqXG4gKiBUaGUgcGx1Z2luIGluamVjdHMgdGhlIHBlbmRpbmcgaW5saW5lIGNvbW1lbnRzIChwbHVzIHRoZWlyIGRpZmYgaHVua3MgYW5kXG4gKiB0aGUgb3B0aW9uYWwgQUkgdmVyZGljdCkgYXMgb25lIHBsYWluIHVzZXIgbWVzc2FnZS4gVGhpcyBtb2R1bGUgcmUtcGFyc2VzXG4gKiB0aGF0IG1lc3NhZ2UgdGV4dCBzbyB0aGUgY29udmVyc2F0aW9uIGNhbiByZW5kZXIgaXQgYXMgYSBjYXJkIFx1MjAxNCBlYWNoXG4gKiBjb21tZW50IGNsaWNrYWJsZSB0byBqdW1wIHRvIHRoZSBtYXRjaGluZyBjaGFuZ2UgYmxvY2sgaW4gdGhlIHJldmlldyBwYW5lbC5cbiAqXG4gKiBQdXJlIGZ1bmN0aW9ucyBvbmx5OiB0aGUgY2xpZW50IGJ1bmRsZSBjYW5ub3QgYmUgaW1wb3J0ZWQgaW4gbm9kZSwgc28gdGhlXG4gKiB1bml0IHRlc3QgKHNjcmlwdHMvcmV2aWV3LXBhY2thZ2UtdGVzdC5tanMpIGJ1bmRsZXMgdGhpcyBtb2R1bGUgd2l0aCBlc2J1aWxkXG4gKiBhbmQgZXhlcmNpc2VzIHRoZSBleGFjdCBzYW1lIGNvZGUgdGhlIGJyb3dzZXIgcnVucy5cbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIFJldmlld1BhY2thZ2VDb21tZW50IHtcbiAgLyoqIFJlcG8tcmVsYXRpdmUgcGF0aCAoc2FtZSBhcyB0aGUgc2VjdGlvbiBoZWFkZXIgcGF0aCkuICovXG4gIHBhdGg6IHN0cmluZ1xuICAvKiogUG9zdC1jaGFuZ2UgbGluZSAoMS1iYXNlZCk7IG51bGwgd2hlbiBvbmx5IHRoZSBvbGQtbGluZSBhbmNob3IgZXhpc3RzLiAqL1xuICBsaW5lOiBudW1iZXIgfCBudWxsXG4gIC8qKiBDb21tZW50IHRleHQuICovXG4gIHRleHQ6IHN0cmluZ1xuICAvKipcbiAgICogT3JpZ2luIHJldmlldyB0YWIsIGNhcnJpZWQgaW4gdGhlIG1lc3NhZ2UgYXMgYSBgW3NdYC9gW3ddYCB0YWcgc28gdGhlXG4gICAqIGNhcmQgY2FuIHJvdXRlIGl0cyBqdW1wOiAnc2Vzc2lvbicgYW5jaG9ycyB0byByZWxhdGl2ZSBodW5rIGxpbmVzLFxuICAgKiAnd29ya3NwYWNlJyB0byByZWFsIGZpbGUgbGluZXMuIEFic2VudCBvbiBvbGRlciBtZXNzYWdlcy5cbiAgICovXG4gIHNvdXJjZT86ICdzZXNzaW9uJyB8ICd3b3Jrc3BhY2UnXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmV2aWV3UGFja2FnZUZpbmRpbmcge1xuICBwcmlvcml0eTogJ1AwJyB8ICdQMScgfCAnUDInIHwgJ1AzJ1xuICBmaWxlOiBzdHJpbmdcbiAgbGluZTogbnVtYmVyXG4gIHRpdGxlOiBzdHJpbmdcbiAgZGV0YWlsOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZXZpZXdQYWNrYWdlIHtcbiAgLyoqIFdvcmtzcGFjZSByb290IGVtYmVkZGVkIGluIHRoZSBtZXNzYWdlIChcdTVERTVcdTRGNUNcdTUzM0FcdUZGMUEuLi4pLCB3aGVuIHByZXNlbnQuICovXG4gIHdvcmtzcGFjZTogc3RyaW5nIHwgbnVsbFxuICBjb21tZW50czogUmV2aWV3UGFja2FnZUNvbW1lbnRbXVxuICB2ZXJkaWN0OiAnY29ycmVjdCcgfCAnaW5jb3JyZWN0JyB8IG51bGxcbiAgZmluZGluZ3M6IFJldmlld1BhY2thZ2VGaW5kaW5nW11cbn1cblxuLyoqIEZpcnN0IG5vbi1lbXB0eSBsaW5lIG9mIHRoZSBtZXNzYWdlICh0aGUgbWVzc2FnZSBoZWFkZXIgbGluZSkuICovXG5jb25zdCBSRVZJRVdfUFJFRklYID0gJ1x1OEJGN1x1NTkwNFx1NzQwNlx1NEVFNVx1NEUwQlx1OTQ4OFx1NUJGOVx1NUY1M1x1NTI0RFx1NURFNVx1NEY1Q1x1NTMzQVx1NzY4NFx1ODg0Q1x1NTE4NVx1OEJDNFx1NUJBMVx1OEJDNFx1OEJCQSdcblxuLyoqIEByZXR1cm5zIHRydWUgd2hlbiB0aGUgdGV4dCBpcyBhIGNhcnJpZWQgcmV2aWV3IHBhY2thZ2UgKGNhcmQtd29ydGh5KS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1Jldmlld1BhY2thZ2VUZXh0KHRleHQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBmaXJzdCA9IGZpcnN0Tm9uRW1wdHlMaW5lKHRleHQpXG4gIHJldHVybiBmaXJzdCAhPT0gbnVsbCAmJiBmaXJzdC5zdGFydHNXaXRoKFJFVklFV19QUkVGSVgpXG59XG5cbmZ1bmN0aW9uIGZpcnN0Tm9uRW1wdHlMaW5lKHRleHQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBmb3IgKGNvbnN0IHJhdyBvZiB0ZXh0LnNwbGl0KCdcXG4nKSkge1xuICAgIGNvbnN0IHQgPSByYXcudHJpbSgpXG4gICAgaWYgKHQgIT09ICcnKSByZXR1cm4gdFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbi8qKlxuICogUGFyc2UgYSBjYXJyaWVkIHJldmlldy1wYWNrYWdlIG1lc3NhZ2UgYmFjayBpbnRvIHN0cnVjdHVyZWQgZGF0YS5cbiAqIFJldHVybnMgbnVsbCB3aGVuIHRoZSB0ZXh0IGlzIG5vdCBhIHJldmlldyBwYWNrYWdlIChwbGFpbiB1c2VyIG1lc3NhZ2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VSZXZpZXdQYWNrYWdlKHRleHQ6IHN0cmluZyk6IFJldmlld1BhY2thZ2UgfCBudWxsIHtcbiAgaWYgKCFpc1Jldmlld1BhY2thZ2VUZXh0KHRleHQpKSByZXR1cm4gbnVsbFxuICBjb25zdCBwa2c6IFJldmlld1BhY2thZ2UgPSB7IHdvcmtzcGFjZTogbnVsbCwgY29tbWVudHM6IFtdLCB2ZXJkaWN0OiBudWxsLCBmaW5kaW5nczogW10gfVxuICBjb25zdCBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpXG4gIGxldCBpID0gMFxuXG4gIC8vIDEuIGhlYWRlciBsaW5lICh0aGUgcHJlZml4KSBcdTIwMTQgYWxyZWFkeSBtYXRjaGVkIGJ5IGlzUmV2aWV3UGFja2FnZVRleHQuXG4gIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoKSB7XG4gICAgY29uc3QgdCA9IGxpbmVzW2ldLnRyaW0oKVxuICAgIGkgKz0gMVxuICAgIGlmICh0ICE9PSAnJykgYnJlYWtcbiAgfVxuXG4gIC8vIDIuIG9wdGlvbmFsIHdvcmtzcGFjZSBsaW5lIHJpZ2h0IGFmdGVyIHRoZSBoZWFkZXIuXG4gIHdoaWxlIChpIDwgbGluZXMubGVuZ3RoKSB7XG4gICAgY29uc3QgdCA9IGxpbmVzW2ldLnRyaW0oKVxuICAgIGlmICh0ID09PSAnJykge1xuICAgICAgaSArPSAxXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBjb25zdCB3ID0gL15cdTVERTVcdTRGNUNcdTUzM0FbOlx1RkYxQV1cXHMqKC4rKSQvLmV4ZWModClcbiAgICBpZiAodykge1xuICAgICAgcGtnLndvcmtzcGFjZSA9IHdbMV0udHJpbSgpIHx8IG51bGxcbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgICBicmVha1xuICB9XG5cbiAgLy8gMy4gc2VjdGlvbnM6IGAjIyA8cGF0aD5gIChjb21tZW50cyArIG9wdGlvbmFsIGBgYGRpZmYgaHVuaykgYW5kXG4gIC8vICAgIGAjIyBBSSBcdThCQzRcdTVCQTFcdTdFRDNcdThCQkFgICh2ZXJkaWN0ICsgZmluZGluZ3MpLlxuICBsZXQgc2VjdGlvbjogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgZm9yICg7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJhdyA9IGxpbmVzW2ldXG4gICAgY29uc3QgdCA9IHJhdy50cmltKClcbiAgICBpZiAodCA9PT0gJycpIGNvbnRpbnVlXG4gICAgaWYgKHQuc3RhcnRzV2l0aCgnIyMgJykpIHtcbiAgICAgIGNvbnN0IHRpdGxlID0gdC5zbGljZSgzKS50cmltKClcbiAgICAgIHNlY3Rpb24gPSB0aXRsZSA9PT0gJ0FJIFx1OEJDNFx1NUJBMVx1N0VEM1x1OEJCQScgPyAndmVyZGljdCcgOiB0aXRsZVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKHQuc3RhcnRzV2l0aCgnYGBgJykpIHtcbiAgICAgIC8vIGRpZmYgZmVuY2Ugb3Igc3VnZ2VzdGlvbiBmZW5jZSBcdTIwMTQgY29uc3VtZSB1bnRpbCB0aGUgY2xvc2luZyBmZW5jZS5cbiAgICAgIGkgKz0gMVxuICAgICAgd2hpbGUgKGkgPCBsaW5lcy5sZW5ndGggJiYgIWxpbmVzW2ldLnRyaW0oKS5zdGFydHNXaXRoKCdgYGAnKSkgaSArPSAxXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAoc2VjdGlvbiA9PT0gJ3ZlcmRpY3QnKSB7XG4gICAgICBpZiAoL1x1ODg2NVx1NEUwMVx1NUI1OFx1NTcyOFx1OTVFRVx1OTg5OC8udGVzdCh0KSB8fCAvcGF0Y2ggaXMgaW5jb3JyZWN0L2kudGVzdCh0KSkgcGtnLnZlcmRpY3QgPSAnaW5jb3JyZWN0J1xuICAgICAgZWxzZSBpZiAoL1x1ODg2NVx1NEUwMVx1NkI2M1x1Nzg2RS8udGVzdCh0KSB8fCAvcGF0Y2ggaXMgY29ycmVjdC9pLnRlc3QodCkpIHBrZy52ZXJkaWN0ID0gJ2NvcnJlY3QnXG4gICAgICBjb25zdCBmID0gL14tXFxzKlxcWyhQWzAtM10pXFxdXFxzKiguKz8pOihcXGQrKSg/Oi0oXFxkKykpP1xccysoLis/KSg/OlxccypcdTIwMTRcXHMqKC4qKSk/JC8uZXhlYyh0KVxuICAgICAgaWYgKGYpIHtcbiAgICAgICAgcGtnLmZpbmRpbmdzLnB1c2goeyBwcmlvcml0eTogZlsxXSBhcyBSZXZpZXdQYWNrYWdlRmluZGluZ1sncHJpb3JpdHknXSwgZmlsZTogZlsyXSwgbGluZTogTnVtYmVyKGZbM10pLCB0aXRsZTogZls1XSwgZGV0YWlsOiBmWzZdID8/ICcnIH0pXG4gICAgICB9XG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAoc2VjdGlvbiAhPT0gbnVsbCAmJiB0LnN0YXJ0c1dpdGgoJy0gJykpIHtcbiAgICAgIGxldCBib2R5ID0gdC5zbGljZSgyKS50cmltKClcbiAgICAgIC8vIE9wdGlvbmFsIG9yaWdpbi10YWIgdGFnIChgLSBbc10gcGF0aDpcdTIwMjZgIC8gYC0gW3ddIHBhdGg6XHUyMDI2YCkuXG4gICAgICBsZXQgc291cmNlOiBSZXZpZXdQYWNrYWdlQ29tbWVudFsnc291cmNlJ11cbiAgICAgIGNvbnN0IG1UYWcgPSAvXlxcWyhbc3ddKVxcXVxccyooLispJC8uZXhlYyhib2R5KVxuICAgICAgaWYgKG1UYWcpIHtcbiAgICAgICAgc291cmNlID0gbVRhZ1sxXSA9PT0gJ3MnID8gJ3Nlc3Npb24nIDogJ3dvcmtzcGFjZSdcbiAgICAgICAgYm9keSA9IG1UYWdbMl0udHJpbSgpXG4gICAgICB9XG4gICAgICBjb25zdCBlc2MgPSBlc2NhcGVSZWdleChzZWN0aW9uKVxuICAgICAgLy8gYC0gPHBhdGg+OjxsaW5lTmV3PjogPHRleHQ+YFxuICAgICAgY29uc3QgbU5ldyA9IG5ldyBSZWdFeHAoYF4ke2VzY306KFxcXFxkKyk6XFxcXHMqKC4qKSRgKS5leGVjKGJvZHkpXG4gICAgICBpZiAobU5ldykge1xuICAgICAgICBwa2cuY29tbWVudHMucHVzaCh7IHBhdGg6IHNlY3Rpb24sIGxpbmU6IE51bWJlcihtTmV3WzFdKSwgdGV4dDogbU5ld1syXSwgc291cmNlIH0pXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICAvLyBgLSA8cGF0aD4gKG9sZCBsaW5lIDxsaW5lT2xkPik6IDx0ZXh0PmBcbiAgICAgIGNvbnN0IG1PbGQgPSBuZXcgUmVnRXhwKGBeJHtlc2N9IFxcXFwob2xkIGxpbmUgKFxcXFxkKylcXFxcKTpcXFxccyooLiopJGApLmV4ZWMoYm9keSlcbiAgICAgIGlmIChtT2xkKSB7XG4gICAgICAgIHBrZy5jb21tZW50cy5wdXNoKHsgcGF0aDogc2VjdGlvbiwgbGluZTogbnVsbCwgdGV4dDogbU9sZFsyXSwgc291cmNlIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwa2dcbn1cblxuZnVuY3Rpb24gZXNjYXBlUmVnZXgoczogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHMucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csICdcXFxcJCYnKVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBcUJBLG1CQUFxRjs7O0FDckJyRixJQUFxQixPQUFyQixNQUEwQjtBQUFBLEVBQ3RCLEtBQUssUUFBUSxRQUViLFVBQVUsQ0FBQyxHQUFHO0FBQ1YsUUFBSTtBQUNKLFFBQUksT0FBTyxZQUFZLFlBQVk7QUFDL0IsaUJBQVc7QUFDWCxnQkFBVSxDQUFDO0FBQUEsSUFDZixXQUNTLGNBQWMsU0FBUztBQUM1QixpQkFBVyxRQUFRO0FBQUEsSUFDdkI7QUFFQSxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxVQUFVLFFBQVEsT0FBTztBQUNoRCxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssU0FBUyxXQUFXLE9BQU8sQ0FBQztBQUNwRSxXQUFPLEtBQUssbUJBQW1CLFdBQVcsV0FBVyxTQUFTLFFBQVE7QUFBQSxFQUMxRTtBQUFB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SUFDcEMsTUFBTSxPQUFPLE1BQU0sU0FBUyxJQUFJLFdBQVcsSUFBSSxDQUFDLElBQUksT0FBTyxNQUFNLE1BQU0sUUFBUTtBQUFBLElBQy9FLE1BQU0sZ0JBQWdCLEtBQUssU0FBUyxLQUFLLE9BQU8sRUFBRSxDQUFDLEVBQUU7QUFBQSxFQUN2RCxFQUFFO0FBQ0o7QUFNQSxJQUFNLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBK1NuQixJQUFJLE9BQU8sYUFBYSxlQUFlLFNBQVMsY0FBYyx5QkFBeUIsS0FBSyxVQUFVLFNBQVMsQ0FBQyxHQUFHLE1BQU0sTUFBTTtBQUM3SCxRQUFNLE1BQU0sU0FBUyxjQUFjLE9BQU87QUFDMUMsTUFBSSxRQUFRLFNBQVM7QUFDckIsTUFBSSxRQUFRLFlBQVk7QUFDeEIsTUFBSSxjQUFjO0FBQ2xCLFdBQVMsS0FBSyxZQUFZLEdBQUc7QUFDL0I7QUFHQSxJQUFNLEtBQUs7QUFBQSxFQUNULGdCQUFnQjtBQUFBLEVBQ2hCLGVBQWU7QUFBQSxFQUNmLGVBQWU7QUFBQSxFQUNmLGlCQUFpQjtBQUFBLEVBQ2pCLGdCQUFnQjtBQUFBLEVBQ2hCLGlCQUFpQjtBQUFBLEVBQ2pCLG1CQUFtQjtBQUFBLEVBQ25CLGtCQUFrQjtBQUFBLEVBQ2xCLHNCQUFzQjtBQUFBLEVBQ3RCLDJCQUEyQjtBQUFBLEVBQzNCLHNCQUFzQjtBQUFBLEVBQ3RCLHNCQUFzQjtBQUFBLEVBQ3RCLHVCQUF1QjtBQUFBLEVBQ3ZCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUFBLEVBQ2hCLG9CQUFvQjtBQUFBLEVBQ3BCLGlCQUFpQjtBQUFBLEVBQ2pCLGlCQUFpQjtBQUFBLEVBQ2pCLG9CQUFvQjtBQUFBLEVBQ3BCLG9CQUFvQjtBQUFBLEVBQ3BCLGtCQUFrQjtBQUFBLEVBQ2xCLHFCQUFxQjtBQUFBLEVBQ3JCLGNBQWM7QUFBQSxFQUNkLGVBQWU7QUFBQSxFQUNmLGdCQUFnQjtBQUFBLEVBQ2hCLGVBQWU7QUFBQSxFQUNmLGlCQUFpQjtBQUFBLEVBQ2pCLHdCQUF3QjtBQUFBLEVBQ3hCLDJCQUEyQjtBQUFBLEVBQzNCLGlCQUFpQjtBQUFBLEVBQ2pCLDRCQUE0QjtBQUFBLEVBQzVCLGVBQWU7QUFBQSxFQUNmLHNCQUFzQjtBQUFBLEVBQ3RCLG9CQUFvQjtBQUFBLEVBQ3BCLHVCQUF1QjtBQUFBLEVBQ3ZCLGlCQUFpQjtBQUFBLEVBQ2pCLHFCQUFxQjtBQUFBLEVBQ3JCLGdCQUFnQjtBQUFBLEVBQ2hCLGlCQUFpQjtBQUFBLEVBQ2pCLHdCQUF3QjtBQUFBLEVBQ3hCLHlCQUF5QjtBQUFBLEVBQ3pCLHdCQUF3QjtBQUFBLEVBQ3hCLHFCQUFxQjtBQUFBLEVBQ3JCLGtCQUFrQjtBQUFBLEVBQ2xCLHNCQUFzQjtBQUFBLEVBQ3RCLGlCQUFpQjtBQUFBLEVBQ2pCLGtCQUFrQjtBQUFBLEVBQ2xCLFlBQVk7QUFBQSxFQUNaLGdCQUFnQjtBQUFBLEVBQ2hCLGNBQWM7QUFBQSxFQUNkLGFBQWE7QUFBQSxFQUNiLGtCQUFrQjtBQUFBLEVBQ2xCLGdCQUFnQjtBQUFBLEVBQ2hCLGVBQWU7QUFBQSxFQUNmLGVBQWU7QUFBQSxFQUNmLGtCQUFrQjtBQUFBLEVBQ2xCLHNCQUFzQjtBQUFBLEVBQ3RCLG1CQUFtQjtBQUFBLEVBQ25CLG1CQUFtQjtBQUFBLEVBQ25CLG9CQUFvQjtBQUFBLEVBQ3BCLGlCQUFpQjtBQUFBLEVBQ2pCLHFCQUFxQjtBQUFBLEVBQ3JCLGtCQUFrQjtBQUFBLEVBQ2xCLGVBQWU7QUFBQSxFQUNmLGNBQWM7QUFBQSxFQUNkLGVBQWU7QUFBQSxFQUNmLGNBQWM7QUFBQSxFQUNkLGVBQWU7QUFBQSxFQUNmLGdCQUFnQjtBQUFBLEVBQ2hCLHVCQUF1QjtBQUFBLEVBQ3ZCLGdCQUFnQjtBQUFBLEVBQ2hCLGtCQUFrQjtBQUFBLEVBQ2xCLGtCQUFrQjtBQUFBLEVBQ2xCLGdCQUFnQjtBQUFBLEVBQ2hCLGlCQUFpQjtBQUFBLEVBQ2pCLGtCQUFrQjtBQUFBLEVBQ2xCLGVBQWU7QUFBQSxFQUNmLGFBQWE7QUFBQSxFQUNiLGtCQUFrQjtBQUFBLEVBQ2xCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUFBLEVBQ2hCLG1CQUFtQjtBQUFBLEVBQ25CLHdCQUF3QjtBQUFBLEVBQ3hCLGNBQWM7QUFBQSxFQUNkLHdCQUF3QjtBQUFBLEVBQ3hCLHVCQUF1QjtBQUFBLEVBQ3ZCLHNCQUFzQjtBQUFBLEVBQ3RCLG9CQUFvQjtBQUFBLEVBQ3BCLG1CQUFtQjtBQUFBLEVBQ25CLHNCQUFzQjtBQUFBLEVBQ3RCLGVBQWU7QUFBQSxFQUNmLGlCQUFpQjtBQUFBLEVBQ2pCLHFCQUFxQjtBQUFBLEVBQ3JCLGlCQUFpQjtBQUFBLEVBQ2pCLG9CQUFvQjtBQUFBLEVBQ3BCLHVCQUF1QjtBQUFBLEVBQ3ZCLHlCQUF5QjtBQUFBLEVB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QUFrQjtBQUFBLEVBQ2xCLGdCQUFnQjtBQUFBLEVBQ2hCLGVBQWU7QUFBQSxFQUNmLGVBQWU7QUFBQSxFQUNmLGtCQUFrQjtBQUFBLEVBQ2xCLHNCQUFzQjtBQUFBLEVBQ3RCLG1CQUFtQjtBQUFBLEVBQ25CLG1CQUFtQjtBQUFBLEVBQ25CLG9CQUFvQjtBQUFBLEVBQ3BCLGlCQUFpQjtBQUFBLEVBQ2pCLHFCQUFxQjtBQUFBLEVBQ3JCLGtCQUFrQjtBQUFBLEVBQ2xCLGVBQWU7QUFBQSxFQUNmLGNBQWM7QUFBQSxFQUNkLGVBQWU7QUFBQSxFQUNmLGNBQWM7QUFBQSxFQUNkLGVBQWU7QUFBQSxFQUNmLGdCQUFnQjtBQUFBLEVBQ2hCLHVCQUF1QjtBQUFBLEVBQ3ZCLGdCQUFnQjtBQUFBLEVBQ2hCLGtCQUFrQjtBQUFBLEVBQ2xCLGtCQUFrQjtBQUFBLEVBQ2xCLGdCQUFnQjtBQUFBLEVBQ2hCLGlCQUFpQjtBQUFBLEVBQ2pCLGtCQUFrQjtBQUFBLEVBQ2xCLGVBQWU7QUFBQSxFQUNmLGFBQWE7QUFBQSxFQUNiLGtCQUFrQjtBQUFBLEVBQ2xCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUFBLEVBQ2hCLGdCQUFnQjtBQUFBLEVBQ2hCLG1CQUFtQjtBQUFBLEVBQ25CLHdCQUF3QjtBQUFBLEVBQ3hCLGNBQWM7QUFBQSxFQUNkLHdCQUF3QjtBQUFBLEVBQ3hCLHVCQUF1QjtBQUFBLEVBQ3ZCLHNCQUFzQjtBQUFBLEVBQ3RCLG9CQUFvQjtBQUFBLEVBQ3BCLG1CQUFtQjtBQUFBLEVBQ25CLHNCQUFzQjtBQUFBLEVBQ3RCLGVBQWU7QUFBQSxFQUNmLGlCQUFpQjtBQUFBLEVBQ2pCLHFCQUFxQjtBQUFBLEVBQ3JCLGlCQUFpQjtBQUFBLEVBQ2pCLG9CQUFvQjtBQUFBLEVBQ3BCLHVCQUF1QjtBQUFBLEVBQ3ZCLHlCQUF5QjtBQUFBLEVBQ3pCLDJCQUEyQjtBQUFBLEVBQzNCLHFCQUFxQjtBQUFBLEVBQ3JCLG1CQUFtQjtBQUFBLEVBQ25CLHFCQUFxQjtBQUFBLEVBQ3JCLHFCQUFxQjtBQUFBLEVBQ3JC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QUEsUUFDUCxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksTUFBTTtBQUFBLElBQU87QUFBQSxJQUFpQixNQUNoQyxJQUFJLE1BQU07QUFBQSxNQUNSO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixRQUFRLE9BQU8sRUFBRSxVQUFVLElBQUksU0FBUztBQUFBLE1BQzFDO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBR0EsTUFBSSxNQUFNO0FBQUEsSUFBTztBQUFBLElBQTJCLE1BQzFDLElBQUksTUFBTTtBQUFBLE1BQ1I7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFFBQVE7QUFBQSxRQUNSLFFBQVEsT0FBTyxFQUFFLFVBQVUsSUFBSSxTQUFTO0FBQUEsTUFDMUM7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFJQSxNQUFJLE1BQU07QUFBQSxJQUFPO0FBQUEsSUFBOEIsTUFDN0MsSUFBSSxNQUFNO0FBQUEsTUFDUjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sUUFBUSxDQUFDLFVBQVU7QUFBQSxRQUNuQixVQUFVO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQU1BLGFBQVcsT0FBTyxDQUFDLFFBQVEsVUFBVSxHQUFZO0FBQy9DLFFBQUksTUFBTTtBQUFBLE1BQU87QUFBQSxNQUEwQixNQUN6QyxJQUFJLE1BQU07QUFBQSxRQUNSO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTjtBQUFBLFVBQ0EsVUFBVTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBSUEsTUFBSSxNQUFNO0FBQUEsSUFBTztBQUFBLElBQXdCLE1BQ3ZDLElBQUksTUFBTTtBQUFBLE1BQ1I7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbInZhbHVlIiwgIm5hbWUiLCAic2Nyb2xsVGltZXIiLCAiY2xlYXJUaW1lciJdCn0K

		})(module, module.exports, require);
		return module.exports;
	}
});
