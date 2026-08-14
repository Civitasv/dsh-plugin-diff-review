// src/server/index.ts
import z from "@deepseek-ai/schemastery";
import { execFile } from "node:child_process";
import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import { isAbsolute, resolve, sep } from "node:path";
var name = "diff-review";
var Config = z.object({
  statusPath: z.string().default("/diff-review/status"),
  applyPath: z.string().default("/diff-review/apply"),
  commitPath: z.string().default("/diff-review/commit"),
  pushPath: z.string().default("/diff-review/push"),
  allowedRoots: z.array(z.string()).default([])
});
var MAX_BUFFER = 64 * 1024 * 1024;
function git(cwd, args) {
  return new Promise((resolvePromise) => {
    execFile("git", ["-C", cwd, "-c", "color.ui=never", ...args], { windowsHide: true, maxBuffer: MAX_BUFFER }, (err, stdout, stderr) => {
      if (err) {
        const code = typeof err.code === "number" ? err.code : 1;
        resolvePromise({ code, stdout: stdout ?? "", stderr: stderr ?? "" });
      } else {
        resolvePromise({ code: 0, stdout: stdout ?? "", stderr: stderr ?? "" });
      }
    });
  });
}
function sanitizeRepoPath(raw) {
  if (typeof raw !== "string" || !raw.trim()) return { error: 'missing "path"' };
  const p = raw.trim();
  if (isAbsolute(p)) return { error: `path must be repo-relative: ${p}` };
  if (p.startsWith("-")) return { error: `invalid path: ${p}` };
  const segments = p.split(/[\\/]/);
  if (segments.includes("..")) return { error: `path traversal is not allowed: ${p}` };
  return { path: p };
}
function isRecord(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function parsePorcelain(stdout) {
  const records = stdout.split("\0").filter((r) => r.length > 0);
  const out = [];
  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (rec.length < 3) continue;
    const xy = rec.slice(0, 2);
    const path = rec.slice(3);
    if (xy === "??" || xy === "!!") continue;
    if (xy[0] === "R" || xy[0] === "C") {
      const orig = i + 1 < records.length ? records[i + 1] : void 0;
      if (orig !== void 0) i++;
      out.push({ path, origPath: orig, xy });
    } else {
      out.push({ path, xy });
    }
  }
  return out;
}
function countLines(diff) {
  let added = 0;
  let deleted = 0;
  for (const line of diff.split("\n")) {
    if (line.startsWith("+") && !line.startsWith("+++")) added++;
    else if (line.startsWith("-") && !line.startsWith("---")) deleted++;
  }
  return { added, deleted };
}
function syntheticUntrackedDiff(path, content) {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  const header = `--- /dev/null
+++ b/${path}
@@ -0,0 +1,${lines.length} @@
`;
  return header + lines.map((l) => `+${l}`).join("\n");
}
async function collectDiff(cwd, change) {
  const untracked = change.xy.startsWith("??");
  let diff = "";
  let binary = false;
  if (untracked) {
    const abs = resolve(cwd, change.path);
    try {
      const content = readFileSync(abs, "utf8");
      if (content.includes("\0")) {
        binary = true;
        diff = "Binary file (untracked)";
      } else {
        diff = syntheticUntrackedDiff(change.path, content);
      }
    } catch {
      diff = "(unreadable)";
    }
  } else {
    const [staged2, unstaged2] = await Promise.all([
      git(cwd, ["diff", "--cached", "--", change.path]),
      git(cwd, ["diff", "--", change.path])
    ]);
    const stagedText = staged2.stdout.trimEnd();
    const unstagedText = unstaged2.stdout.trimEnd();
    diff = [stagedText, unstagedText].filter(Boolean).join("\n");
    if (!diff.trim()) {
      const [b1, b2] = await Promise.all([
        git(cwd, ["diff", "--cached", "--numstat", "--", change.path]),
        git(cwd, ["diff", "--numstat", "--", change.path])
      ]);
      const numstat = [b1.stdout, b2.stdout].join("\n");
      if (numstat.includes("-	-	")) {
        binary = true;
        diff = "Binary files differ";
      }
    }
  }
  const counts = binary ? { added: 0, deleted: 0 } : countLines(diff);
  const staged = untracked ? false : change.xy[0] !== " " && change.xy[0] !== "?";
  const unstaged = untracked ? true : change.xy[1] !== " " && change.xy[1] !== "?";
  const status = untracked ? "??" : change.xy.trim();
  return {
    path: change.path,
    origPath: change.origPath,
    xy: change.xy,
    status,
    untracked,
    staged,
    unstaged,
    added: counts.added,
    deleted: counts.deleted,
    diff,
    binary
  };
}
async function collectStatus(cwd) {
  const isRepo = await git(cwd, ["rev-parse", "--is-inside-work-tree"]);
  if (isRepo.code !== 0) {
    return { isRepo: false, branch: null, upstream: null, ahead: 0, behind: 0, files: [], error: "not a git repository" };
  }
  const branchResult = await git(cwd, ["branch", "--show-current"]);
  const branch = branchResult.code === 0 && branchResult.stdout.trim() ? branchResult.stdout.trim() : null;
  const upstreamResult = await git(cwd, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
  const upstream = upstreamResult.code === 0 && upstreamResult.stdout.trim() ? upstreamResult.stdout.trim() : null;
  let ahead = 0;
  let behind = 0;
  if (upstream) {
    const [aheadRes, behindRes] = await Promise.all([
      git(cwd, ["rev-list", "--count", "@{u}..HEAD"]),
      git(cwd, ["rev-list", "--count", "HEAD..@{u}"])
    ]);
    ahead = aheadRes.code === 0 ? Number(aheadRes.stdout.trim()) || 0 : 0;
    behind = behindRes.code === 0 ? Number(behindRes.stdout.trim()) || 0 : 0;
  }
  const [statusResult, othersResult] = await Promise.all([
    git(cwd, ["status", "--porcelain=v1", "-z"]),
    git(cwd, ["ls-files", "--others", "--exclude-standard", "-z"])
  ]);
  const changes = parsePorcelain(statusResult.stdout);
  const untrackedPaths = othersResult.stdout.split("\0").filter(Boolean);
  for (const p of untrackedPaths) changes.push({ path: p, xy: "??" });
  const files = await Promise.all(changes.map((change) => collectDiff(cwd, change)));
  return { isRepo: true, branch, upstream, ahead, behind, files };
}
async function revertPath(cwd, path, untracked) {
  const abs = resolve(cwd, path);
  if (untracked) {
    try {
      if (!abs.startsWith(resolve(cwd) + sep) && abs !== resolve(cwd)) return `refusing to delete outside workspace: ${path}`;
      if (existsSync(abs)) rmSync(abs, { recursive: true, force: true });
      return null;
    } catch (e) {
      return `cannot remove ${path}: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  const res = await git(cwd, ["restore", "--source=HEAD", "--staged", "--worktree", "--", path]);
  return res.code === 0 ? null : res.stderr.trim() || `git restore failed for ${path}`;
}
async function applyAction(config, raw) {
  const record = isRecord(raw) ? raw : {};
  const cwd = validateWorkspace(record.cwd, config.allowedRoots);
  if ("error" in cwd) return { status: 400, body: { ok: false, error: cwd.error } };
  const action = record.action;
  if (action !== "accept" && action !== "revert") {
    return { status: 400, body: { ok: false, error: 'action must be "accept" or "revert"' } };
  }
  let paths = null;
  if (record.path !== void 0) {
    const safe = sanitizeRepoPath(record.path);
    if ("error" in safe) return { status: 400, body: { ok: false, error: safe.error } };
    paths = [safe.path];
  }
  if (action === "accept") {
    const res = await git(cwd.path, paths === null ? ["add", "-A"] : ["add", "--", ...paths]);
    if (res.code !== 0) return { status: 500, body: { ok: false, error: res.stderr.trim() || "git add failed" } };
    return { status: 200, body: { ok: true } };
  }
  if (paths === null) {
    const status2 = await collectStatus(cwd.path);
    if (!status2.isRepo) return { status: 400, body: { ok: false, error: "not a git repository" } };
    const errors = [];
    for (const file2 of status2.files) {
      const error2 = await revertPath(cwd.path, file2.path, file2.untracked);
      if (error2) errors.push(error2);
    }
    if (errors.length > 0) return { status: 500, body: { ok: false, error: errors.join("; ") } };
    return { status: 200, body: { ok: true } };
  }
  const status = await collectStatus(cwd.path);
  const file = status.isRepo ? status.files.find((f) => f.path === paths[0]) : void 0;
  const untracked = file?.untracked ?? false;
  const error = await revertPath(cwd.path, paths[0], untracked);
  if (error) return { status: 500, body: { ok: false, error } };
  return { status: 200, body: { ok: true } };
}
var MAX_COMMIT_MESSAGE = 2e3;
async function commitAction(config, raw) {
  const record = isRecord(raw) ? raw : {};
  const cwd = validateWorkspace(record.cwd, config.allowedRoots);
  if ("error" in cwd) return { status: 400, body: { ok: false, error: cwd.error } };
  const message = typeof record.message === "string" ? record.message.trim() : "";
  if (!message) return { status: 400, body: { ok: false, error: 'missing "message"' } };
  if (message.length > MAX_COMMIT_MESSAGE) return { status: 400, body: { ok: false, error: `message too long (max ${MAX_COMMIT_MESSAGE} chars)` } };
  if (message.startsWith("-")) return { status: 400, body: { ok: false, error: 'message must not start with "-"' } };
  const res = await git(cwd.path, ["commit", "-m", message]);
  if (res.code !== 0) {
    const detail = res.stderr.trim() || res.stdout.trim();
    return { status: 400, body: { ok: false, error: detail || "git commit failed" } };
  }
  const hashRes = await git(cwd.path, ["rev-parse", "--short", "HEAD"]);
  return {
    status: 200,
    body: {
      ok: true,
      hash: hashRes.code === 0 ? hashRes.stdout.trim() : void 0,
      subject: message.split("\n")[0]
    }
  };
}
async function pushAction(config, raw) {
  const record = isRecord(raw) ? raw : {};
  const cwd = validateWorkspace(record.cwd, config.allowedRoots);
  if ("error" in cwd) return { status: 400, body: { ok: false, error: cwd.error } };
  const res = await git(cwd.path, ["push"]);
  if (res.code !== 0) {
    return { status: 500, body: { ok: false, error: res.stderr.trim() || "git push failed" } };
  }
  return { status: 200, body: { ok: true, output: res.stdout.trim() || res.stderr.trim() || "pushed" } };
}
function validateWorkspace(raw, allowedRoots) {
  if (typeof raw !== "string" || !raw.trim()) return { error: 'missing "cwd"' };
  const p = raw.trim();
  if (!isAbsolute(p)) return { error: `cwd must be absolute: ${p}` };
  if (!existsSync(p)) return { error: `cwd does not exist: ${p}` };
  try {
    if (!statSync(p).isDirectory()) return { error: `cwd is not a directory: ${p}` };
  } catch (e) {
    return { error: `cannot stat cwd: ${e instanceof Error ? e.message : String(e)}` };
  }
  if (allowedRoots.length > 0) {
    const ok = allowedRoots.some((root) => {
      const r = root.replace(/[\\/]+$/, "");
      return p === r || p.startsWith(r + sep);
    });
    if (!ok) return { error: `cwd is outside allowedRoots: ${p}` };
  }
  return { path: p };
}
function jsonResponse(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(data)
  });
  res.end(data);
}
async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}
function readQuery(req) {
  return new URLSearchParams(req.url?.split("?")[1] ?? "");
}
function apply(ctx, config) {
  ctx.inject(["webServer"], (httpCtx) => {
    httpCtx.effect(
      () => httpCtx.webServer.register({
        kind: "exact",
        path: config.statusPath,
        handler: async (req, res) => {
          if (req.method === "GET" || req.method === "HEAD") {
            const cwd = validateWorkspace(readQuery(req).get("cwd"), config.allowedRoots);
            if ("error" in cwd) {
              jsonResponse(res, 400, { isRepo: false, branch: null, files: [], error: cwd.error });
              return;
            }
            jsonResponse(res, 200, await collectStatus(cwd.path));
            return;
          }
          jsonResponse(res, 405, { ok: false, error: "method not allowed" });
        }
      }),
      "diff-review: status route"
    );
    httpCtx.effect(
      () => httpCtx.webServer.register({
        kind: "exact",
        path: config.applyPath,
        handler: async (req, res) => {
          if (req.method === "POST") {
            const raw = await readJsonBody(req);
            if (raw === null) {
              jsonResponse(res, 400, { ok: false, error: "invalid JSON body" });
              return;
            }
            const result = await applyAction(config, raw);
            jsonResponse(res, result.status, result.body);
            return;
          }
          jsonResponse(res, 405, { ok: false, error: "method not allowed" });
        }
      }),
      "diff-review: apply route"
    );
    httpCtx.effect(
      () => httpCtx.webServer.register({
        kind: "exact",
        path: config.commitPath,
        handler: async (req, res) => {
          if (req.method === "POST") {
            const raw = await readJsonBody(req);
            if (raw === null) {
              jsonResponse(res, 400, { ok: false, error: "invalid JSON body" });
              return;
            }
            const result = await commitAction(config, raw);
            jsonResponse(res, result.status, result.body);
            return;
          }
          jsonResponse(res, 405, { ok: false, error: "method not allowed" });
        }
      }),
      "diff-review: commit route"
    );
    httpCtx.effect(
      () => httpCtx.webServer.register({
        kind: "exact",
        path: config.pushPath,
        handler: async (req, res) => {
          if (req.method === "POST") {
            const raw = await readJsonBody(req);
            if (raw === null) {
              jsonResponse(res, 400, { ok: false, error: "invalid JSON body" });
              return;
            }
            const result = await pushAction(config, raw);
            jsonResponse(res, result.status, result.body);
            return;
          }
          jsonResponse(res, 405, { ok: false, error: "method not allowed" });
        }
      }),
      "diff-review: push route"
    );
  });
}
export {
  Config,
  apply,
  name
};
//# sourceMappingURL=index.js.map
