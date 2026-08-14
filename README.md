# dsh-plugin-diff-review

类似 Codex 的 **Diff 审查**插件：在一个浮层面板里审查当前项目的全部未提交更改，
逐文件查看 unified diff，并 **采纳（暂存）/ 丢弃** 更改 —— 可以单个文件操作，
也可以一键全部操作。

## 特性

- 列出工作区的**全部未提交更改**：已暂存（staged）、未暂存（unstaged）、
  未跟踪（untracked）三种状态一目了然；
- 每个文件展示**完整 unified diff**（新增行 / 删除行 / 上下文按行着色）；
- 逐文件 **采纳**（`git add`）或 **丢弃**（`git restore`；未跟踪文件直接删除）；
- **全部采纳 / 全部丢弃** 一键操作，丢弃需要二次点击确认，防误操作；
- 会话页头的按钮带**更改文件数角标**，一眼看到当前项目有多少改动；
- 依赖 git 工作树，天然支持任何 git 仓库（VS Code / GitHub Desktop 同款语义）。

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

3. **重启 `dsh web`**，打开任意会话，页头会出现「Diff 审查」按钮（带更改数角标）。

## 使用

| 操作 | 效果 |
| --- | --- |
| 点击「Diff 审查」 | 打开审查面板，列出当前项目的全部未提交更改 |
| 左侧选择文件 | 右侧显示该文件的完整 unified diff |
| 单文件「采纳」 | `git add` 该文件（保留更改并暂存，准备提交） |
| 单文件「丢弃」 | 恢复该文件到 HEAD（未跟踪文件则删除），需二次点击确认 |
| 「全部采纳」 | `git add -A` 暂存全部更改 |
| 「全部丢弃」 | 恢复全部跟踪文件 + 删除全部未跟踪文件，需二次点击确认 |
| 「刷新」 | 重新读取工作区状态（代理刚改完文件后点一下） |

> 「采纳」只是**暂存**，不会自动 commit —— 提交仍由你决定（可以用
> `dsh-plugin-open-editor` 打开编辑器来完成）。

## 配置

编辑 `~/.dsh/profiles/web/cordis.patch.yml` 中该插件的 `config`：

```yaml
- id: diff-review
  name: dsh-plugin-diff-review
  config:
    statusPath: /diff-review/status   # 状态路由（一般无需改动）
    applyPath: /diff-review/apply     # 操作路由（一般无需改动）
    allowedRoots: []                  # 非空时，仅允许审查这些目录下的仓库
```

- `allowedRoots`：安全开关。默认允许审查任意存在的目录；填写后只允许这些目录
  （及子目录）下的 git 仓库被读取和修改。

## 工作原理

1. 浏览器端从会话列表取得当前会话的 `cwd`（工作目录）。
2. `GET /diff-review/status?cwd=…` 返回仓库信息与每个更改文件：
   - `git status --porcelain=v1 -z` 解析暂存/未暂存状态（含重命名双记录）；
   - `git ls-files --others --exclude-standard` 列出未跟踪文件；
   - 每个文件用 `git diff` / `git diff --cached` 取 unified diff，
     未跟踪文件生成全新增的合成 diff。
3. `POST /diff-review/apply` 执行操作：
   - 采纳：`git add -A`（全部）或 `git add -- <path>`（单文件）；
   - 丢弃：`git restore --source=HEAD --staged --worktree -- <path>`
     （未跟踪文件用 fs 删除，且只允许删在工作区内）。
4. 所有 git 命令通过 `execFile` 执行（无 shell），路径参数都带 `--` 分隔符并
   拒绝 `..` 穿越与绝对路径，浏览器输入无法逃逸到仓库之外。

## 卸载

1. 从 `cordis.patch.yml` 删除 `diff-review` 条目；
2. 删除 `~/.dsh/profiles/node_modules/dsh-plugin-diff-review` 目录；
3. 重启 `dsh web`。

## 常见问题

- **提示「当前目录不是 git 仓库」**：该工作区没有 `.git`。可以
  `git init` 后再审查；或换一个 git 仓库作为工作区。
- **按钮没有出现**：确认已重启 `dsh web`，并检查 设置 → 插件清单 里
  `diff-review` 已加载。
- **未跟踪文件被「全部丢弃」删除了，能找回吗？** 不能 —— 未跟踪文件不在 git
  历史里。这也是丢弃需要二次确认的原因，请谨慎操作。

## License

MIT
