# dsh-plugin-diff-review

类似 Codex 的 **Diff 审查**插件：一个浮层面板里同时提供两个视角 ——
**会话更改**（每一轮对话中代理修改了哪些文件，逐轮查看，不依赖 git）和
**工作区**（git 工作区全部未提交更改，可采纳/丢弃）。

## 特性

### 会话更改（Session）— 不依赖 git

- 从当前会话的记录中提取**每一轮（每次用户提问）代理修改的文件**，按轮分组，
  显示该轮提问的内容摘要；
- 每个修改展示**完整的按行 diff**（来自工具结果的 hunks）；
- **即使没有 diff 数据**（如工具未附带 diff），仍会列出文件路径与工具名；
- **完全客户端计算**，工作区**是不是 git 仓库都能显示**，历史轮次也能回看；
- 会话页头的按钮角标实时显示本会话累计修改的文件数。

### 工作区（Workspace）— git 工作树

- 列出工作区的**全部未提交更改**：已暂存（staged）、未暂存（unstaged）、
  未跟踪（untracked）三种状态一目了然；
- 每个文件展示完整 unified diff（新增 / 删除 / 上下文按行着色）；
- 逐文件 **采纳**（`git add`）或 **丢弃**（`git restore`；未跟踪文件直接删除）；
- **全部采纳 / 全部丢弃** 一键操作，丢弃需要二次点击确认。

## 安装

本仓库已包含构建产物（`dist/index.js` 与 `client.js`），可直接使用；修改过源码才需要
先执行 `npm install && npm run build`。

1. **把插件放进 profile 的依赖目录**：

   ```sh
   # PowerShell（Windows）
   Copy-Item -Recurse <本插件目录> "$HOME\.dsh\profiles\node_modules\dsh-plugin-diff-review"
   ```

2. **注册到配置**：编辑 `~/.dsh/profiles/web/cordis.patch.yml`：

   ```yaml
   - insert:
       - id: diff-review
         name: dsh-plugin-diff-review
   ```

3. **重启 `dsh web`**，打开任意会话，页头会出现「Diff 审查」按钮（带修改数角标）。

## 使用

| 操作 | 效果 |
| --- | --- |
| 点击「Diff 审查」 | 打开审查面板，默认停在「会话更改」页签 |
| 会话更改页签 | 左侧按轮列出修改的文件，右侧显示该修改的 diff（无 diff 时显示占位） |
| 工作区页签 | 左侧列出 git 未提交更改，右侧显示 unified diff |
| **单栏 / 双栏切换** | diff 头部可切换：单栏 = 行视图；双栏 = 左右对照（原文件/新文件分列，行号对齐），选择会记住 |
| 单文件「采纳」 | `git add` 该文件（保留更改并暂存） |
| 单文件「丢弃」 | 恢复该文件到 HEAD（未跟踪文件删除），需二次点击确认 |
| 「全部采纳」 / 「全部丢弃」 | 对全部更改批量操作，丢弃需二次点击确认 |
| 「刷新」 | 重新读取工作区状态（会话更改页签实时更新，无需刷新） |

> 「采纳」只是**暂存**，不会自动 commit —— 提交仍由你决定（可以用
> `dsh-plugin-open-editor` 打开编辑器来完成）。

## 配置

编辑 `~/.dsh/profiles/web/cordis.patch.yml` 中该插件的 `config`：

```yaml
- id: diff-review
  name: dsh-plugin-diff-review
  config:
    statusPath: /diff-review/status   # 工作区状态路由（一般无需改动）
    applyPath: /diff-review/apply     # 工作区操作路由（一般无需改动）
    allowedRoots: []                  # 非空时，仅允许审查这些目录下的仓库
```

- `allowedRoots`：安全开关，只约束「工作区」页签的 git 操作；「会话更改」页签
  纯客户端展示，不经过服务器。

## 工作原理

**会话更改**（纯客户端）：

1. 从会话快照读取全部对话节点，按用户消息划分"轮"；
2. 每个已完成的工具调用若携带 diff hunks（宿主计算好的 `resultView`，
   或工具结果的 `meta.diffs`），解析为 `{path, oldText, newText}` 并归入对应轮次；
3. 没有 diff 数据但能确定是文件修改（如 `str_replace_editor`、fs 的 write/edit）
   时，仍列出路径与工具名 —— 保证"即使没有 diff 也能显示"；
4. diff 按行渲染（新增绿 / 删除红 / 上下文），多 hunk 用 `@@` 分隔。

**工作区**（服务器端）：

1. `GET /diff-review/status?cwd=…` 返回仓库信息与每个更改文件：
   - `git status --porcelain=v1 -z` 解析暂存/未暂存状态（含重命名双记录）；
   - `git ls-files --others --exclude-standard` 列出未跟踪文件；
   - 每个文件用 `git diff` / `git diff --cached` 取 unified diff，
     未跟踪文件生成全新增的合成 diff。
2. `POST /diff-review/apply` 执行操作：
   - 采纳：`git add -A`（全部）或 `git add -- <path>`（单文件）；
   - 丢弃：`git restore --source=HEAD --staged --worktree -- <path>`
     （未跟踪文件用 fs 删除，且只允许删在工作区内）。
3. 所有 git 命令通过 `execFile` 执行（无 shell），路径参数都带 `--` 分隔符并
   拒绝 `..` 穿越与绝对路径，浏览器输入无法逃逸到仓库之外。

## 卸载

1. 从 `cordis.patch.yml` 删除 `diff-review` 条目；
2. 删除 `~/.dsh/profiles/node_modules/dsh-plugin-diff-review` 目录；
3. 重启 `dsh web`。

## 常见问题

- **工作区页签提示「不是 git 仓库」**：该工作区没有 `.git`。这不影响
  「会话更改」页签 —— 每轮修改照常显示。
- **某个修改显示「没有 diff 数据」**：该工具调用没有附带 diff hunks（例如通过
  命令直接改写文件）。文件路径与工具名仍会列出。
- **按钮没有出现**：确认已重启 `dsh web`，并检查 设置 → 插件清单 里
  `diff-review` 已加载。
- **未跟踪文件被「全部丢弃」删除了，能找回吗？** 不能 —— 未跟踪文件不在 git
  历史里。这也是丢弃需要二次确认的原因。

## License

MIT
