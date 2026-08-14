# dsh-plugin-diff-review

**变动（Changes）**插件：一个浮层面板里同时提供两个视角 ——
**会话更改**（每一轮对话中代理修改了哪些文件，逐轮查看，不依赖 git）和
**工作区**（git 工作区全部未提交更改，可采纳/丢弃/提交/推送，并带历史时间线）。

## 截图

工作区视图 —— 已暂存 / 未暂存 / 历史时间线 / 分支与远程，左侧文件树、右侧 diff：

![工作区视图](docs/screenshots/workspace.png)

提交详情 —— 点历史时间线中的提交，查看该提交的变动文件树与逐文件 diff：

![提交详情](docs/screenshots/commit.png)

会话更改 —— 按轮列出代理修改的文件（不依赖 git），右侧查看每处修改的 diff：

![会话更改](docs/screenshots/session.png)

## 特性

### 工作区（Workspace）— git 工作树

- 左侧按 git 维度分区，每区一棵文件树：**已暂存**（staged）、**未暂存**（unstaged
  含未跟踪）、**本地提交**（未推送的提交时间线，标注 本地/远程）、**分支与远程**
  （`branch → upstream`、领先/落后、推送）；
- 逐文件 **采纳**（`git add`）/ **丢弃**（`git restore`；未跟踪文件直接删除），
  丢弃需二次点击确认；「全部采纳 / 全部丢弃」一键操作；
- **提交**：输入提交说明，提交已暂存的更改；**推送**：双击确认后推送当前分支；
- 切换工作区或标签页时**自动刷新**（无需手动刷新按钮），打开期间每 15 秒静默刷新；
- 每个文件展示完整 unified diff（单栏 / 双栏切换）。

### 会话更改（Session）— 不依赖 git

- 从当前会话的记录中提取**每一轮（每次用户提问）代理修改的文件**，按轮分组，
  显示该轮提问的内容摘要；
- 每个修改展示**完整的按行 diff**；即使没有 diff 数据，仍会列出文件路径与工具名；
- **完全客户端计算**，工作区是不是 git 仓库都能显示，历史轮次也能回看。

## 一键安装

```sh
# macOS / Linux
bash install.sh
```

```powershell
# Windows（PowerShell）
powershell -ExecutionPolicy Bypass -File install.ps1
```

脚本会：安装运行依赖 → 把插件链接进 `~/.dsh/profiles/node_modules` →
幂等注册到 `cordis.patch.yml` → 提示重启。

### 手动安装

本仓库已包含构建产物（`dist/index.js` 与 `client.js`），可直接使用；修改过源码才需要
先执行 `npm install && npm run build`。

1. **把插件放进 profile 的依赖目录**：

   ```sh
   # macOS / Linux
   ln -sfn "$PWD" ~/.dsh/profiles/node_modules/dsh-plugin-diff-review

   # Windows（PowerShell）
   New-Item -ItemType Junction -Path "$HOME\.dsh\profiles\node_modules\dsh-plugin-diff-review" -Target "$PWD"
   ```

2. **注册到配置**：编辑 `~/.dsh/profiles/web/cordis.patch.yml`：

   ```yaml
   - insert:
       - id: diff-review
         name: dsh-plugin-diff-review
   ```

3. **重启 `dsh web`**，打开任意会话，页头会出现「变动」按钮（带修改数角标）。

## 使用

| 操作 | 效果 |
| --- | --- |
| 点击「变动」 | 打开审查面板，默认停在「工作区」页签 |
| 工作区页签 | 左侧按 已暂存 / 未暂存 / 历史 / 分支 分区，右侧显示 diff |
| 点击文件树中的文件 | 右侧显示该文件的 unified diff |
| **单栏 / 双栏切换** | diff 头部可切换，选择会记住 |
| 历史时间线 | 显示最近提交（本地/远程标注），点提交 → 该提交的变动文件树 + 逐文件 diff |
| 单文件「采纳」 | `git add` 该文件（保留更改并暂存） |
| 单文件「丢弃」 | 恢复该文件到 HEAD（未跟踪文件删除），需二次点击确认 |
| 「全部采纳」 / 「全部丢弃」 | 对全部更改批量操作，丢弃需二次确认 |
| **提交** | 输入说明 → 提交已暂存的更改（无已暂存时按钮禁用） |
| **推送** | 双击确认 → 推送当前分支到上游；「分支与远程」区显示领先/落后数 |

### 设置：字体与字号

在 **设置 → 插件 → 变动** 页签中可修改 diff 的字体与字号；**设置 → 插件 → 插件配置** 里的「变动」卡片可在线修改 `allowedRoots`（安全边界）（等宽 / 系统字体 /
Consolas / JetBrains Mono / Fira Code / Source Code Pro；字号 11–18px），
即时生效并持久化。

> 「采纳」只是**暂存**，不会自动 commit —— 在提交框输入说明后点「提交」，
> 再在「分支与远程」点「推送」。

## 配置

编辑 `~/.dsh/profiles/web/cordis.patch.yml` 中该插件的 `config`：

```yaml
- id: diff-review
  name: dsh-plugin-diff-review
  config:
    statusPath: /diff-review/status          # 工作区状态路由（一般无需改动）
    applyPath: /diff-review/apply            # 采纳/丢弃路由
    commitPath: /diff-review/commit          # 提交路由
    pushPath: /diff-review/push              # 推送路由
    historyPath: /diff-review/history        # 历史时间线路由
    commitDiffPath: /diff-review/commit-diff # 提交 diff 路由
    allowedRoots: []                         # 非空时，仅允许审查这些目录下的仓库
```

- `allowedRoots`：安全开关，只约束「工作区」页签的 git 操作；「会话更改」页签
  纯客户端展示，不经过服务器。

## 工作原理

**会话更改**（纯客户端）：从会话快照读取全部对话节点，按用户消息划分"轮"；
每个已完成的工具调用若携带 diff hunks（`resultView` 或 `meta.diffs`），解析为
`{path, oldText, newText}` 并归入对应轮次；没有 diff 数据但能确定是文件修改时，
仍列出路径与工具名；diff 按行渲染（新增绿 / 删除红 / 上下文）。

**工作区**（服务器端）：`git status --porcelain=v1 -z` + `git ls-files --others`
收集变更，`git diff` / `git diff --cached` 取 diff；采纳 = `git add`，丢弃 =
`git restore`；提交 = `git commit -m`，推送 = `git push`；历史 = `git log HEAD`
（`git rev-list @{u}..HEAD` 标注未推送）；提交 diff = `git show --format=` +
`--numstat`。所有 git 命令通过 `execFile` 执行（无 shell），路径参数带 `--`
并拒绝 `..` 穿越与绝对路径，提交说明拒绝以 `-` 开头，hash 严格校验。

## 卸载

1. 从 `cordis.patch.yml` 删除 `diff-review` 条目；
2. 删除 `~/.dsh/profiles/node_modules/dsh-plugin-diff-review` 链接；
3. 重启 `dsh web`。

## 常见问题

- **工作区页签提示「不是 git 仓库」**：该工作区没有 `.git`。不影响「会话更改」页签。
- **某个修改显示「没有 diff 数据」**：该工具调用没有附带 diff hunks。文件路径与
  工具名仍会列出。
- **「提交」按钮不可用**：说明当前没有已暂存的更改 —— 先「采纳」文件或「全部采纳」。
- **「推送」按钮不可用**：说明当前分支没有领先提交，或未配置上游分支（`git push -u` 一次）。
- **按钮没有出现**：确认已重启 `dsh web`，并检查 设置 → 插件清单 里
  `diff-review` 已加载。
- **未跟踪文件被「全部丢弃」删除了，能找回吗？** 不能 —— 未跟踪文件不在 git
  历史里。这也是丢弃需要二次确认的原因。

## License

MIT
