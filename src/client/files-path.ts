/**
 * Convert a tool-reported path into the workspace-relative format consumed by
 * the Files API. Tool diffs commonly retain absolute paths, whereas normal
 * Git entries already use repo-relative paths.
 */
export function filesWorkspacePath(cwd: string, rawPath: string): string | null {
  const path = rawPath.trim().replace(/\\/g, '/')
  if (!path) return null
  if (!/^(?:[A-Za-z]:\/|\/)/.test(path)) {
    const segments = path.split('/')
    return path.startsWith('-') || segments.includes('..') ? null : path
  }

  const root = cwd.trim().replace(/\\/g, '/').replace(/\/+$/, '')
  if (!root) return null
  const windows = /^[A-Za-z]:\//.test(root) && /^[A-Za-z]:\//.test(path)
  const comparableRoot = windows ? root.toLowerCase() : root
  const comparablePath = windows ? path.toLowerCase() : path
  if (!comparablePath.startsWith(`${comparableRoot}/`)) return null

  const relative = path.slice(root.length + 1)
  return relative && !relative.split('/').includes('..') ? relative : null
}
