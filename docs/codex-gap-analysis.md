# diff-review 与 Codex 的差距分析（v2 · 按作者裁决修订）

> 分析对象：本插件（dsh-plugin-diff-review v0.1.0，2026-08 快照）
> 参照基准：OpenAI Codex 的评审能力（CLI `/review`、`codex review` 非交互命令、
> ChatGPT 桌面 App 的评审面板；依据官方文档
> [Code review](https://learn.chatgpt.com/docs/code-review.md)、
> [Developer commands](https://learn.chatgpt.com/docs/developer-commands.md?surface=cli)）。

## 〇、决策记录（作者 2026-08 裁决）

| 议题 | 裁决 |
| --- | --- |
| 1. AI 评审（`/review`） | **已实现**（2026-08）—— 插件内 AI 评审：`POST /diff-review/review`，`ctx.llm.stream`，会话模型/`reviewModel` 双来源，P0–P3 发现 + 结论，评审→修复→复评审闭环（见 §八） |
| 2. hunk 粒度操作 | **已实现**（`apply-hunk` 路由 + hunk 操作栏） |
| 3. unstage | **已实现**（file/all 级取消暂存 + staged hunk 取消暂存） |
| 4. 行内评论 / 行级反馈 | **已实现**（服务器端 `.git/diff-review-comments.json`，单栏视图） |
| 5. 评审范围切换 | **已实现**（scope 下拉 All/Unstaged/Staged/Commit/Branch/Last-turn） |
| 6. AI 修复闭环 | **已实现**：评论/发现/PR 评论 → `session.prompt` 注入代理（失败退化为复制文本） |
| 7a. PR(gh) 集成 | **已实现**：`gh pr view` + `gh api pulls/{n}/comments`，评论跳转 + 聚合发送（无 gh 静默降级） |
| 7b. 多仓库 | **已实现**：`/diff-review/repos` 检测 cwd 及一层子目录仓库，客户端仓库选择器 |
| 7c. 编辑器联动 | **已实现**：扩展 `dsh-plugin-open-editor` 支持 file:line，diff 头/行 hover 打开 |
| 7d. review_model / 评审准则 | **已实现**：`reviewProvider`/`reviewModel` 配置 + 内置评审准则（`instructions` 参数） |
| 评论存储（#4） | **已定**：服务器端文件（git dir 下 `diff-review-comments.json`） |
| 范围切换形态（#5） | **已定**：scope 下拉（All / Unstaged / Staged / Commit / Branch / Last turn），对齐 Codex App |
| 实施顺序 | **全部完成**：P0-a → P0-b → P1 评论+范围 → #6 反馈闭环 → /review → PR → 多仓库 → 编辑器联动 |

## 一、结论摘要

本插件是**「手动 diff 查看器 + git 操作台」**：把 Codex 评审流程中的
**「看 diff → 逐文件/逐 hunk 决定取舍 → 评论 → 提交/推送」**做成 Web 面板。按作者裁决，
**AI 评审不属于插件**——需要"让模型看 diff 给意见"时，用户在会话里直接问代理即可，
这正是 DSH 的主场。经过本轮补齐，插件与 Codex 的对齐目标已达成：

> **Codex 评审面板的"手动评审交互"已做完整**：hunk 级操作、unstage、行内评论、
> 范围切换、反馈闭环（评论 → `session.prompt` 注入代理）。

## 二、当前插件能力（事实）

**会话更改页签（纯客户端，不依赖 git）**
- 从会话快照按用户消息切"轮"，归集每轮代理改过的文件；
- diff 来自工具结果的 `resultView.diffs` / `meta.diffs`（`{path, oldText, newText}`），
  无 diff 时退化为 path-only（仅列出路径与工具名）；
- 单栏/双栏渲染，按轮展示，跨会话历史可用。

**工作区页签（服务器端 git）**
- `git status --porcelain=v1 -z` + `git ls-files --others` 收集变更；
- 已暂存 / 未暂存两棵文件树 + 每文件 unified diff（单/双栏可切换、字体字号可调）；
- 单文件/全部 **采纳**（`git add`）、**丢弃**（`git restore`，未跟踪文件 `rm`，二次确认）；
- **提交**（`git commit -m`）与**推送**（`git push`，双击确认）；
- 历史时间线（`git log`，标注本地/远程未推送）＋ 提交 diff（`git show --format=`）；
- 分支 vs 上游（ahead/behind）、切换工作区自动刷新 + 每 15s 静默刷新；
- 安全：`execFile` 无 shell、path 过 `--`、拒绝 `..`/绝对路径/`-` 开头、hash 正则校验。

## 三、Codex 评审能力全景（含 #7 名词解释）

### 3.1 触发方式

| 方式 | 说明 |
| --- | --- |
| CLI 交互 `/review` | 进入评审模式，生成评审回合 |
| CLI `/diff` | 显示 git diff（含未跟踪文件） |
| App / IDE `/review` | 选择 **Review against a base branch** 或 **Review uncommitted changes** |
| `codex review`（非交互） | `--uncommitted` / `--base` / `--commit` / 自定义 prompt，四者互斥，`--title` 仅配 `--commit` |
| CI | `codex exec "/review" --ephemeral` |

### 3.2 评审范围（scope）—— 即 #5 要补的东西

- **Unstaged**（App 默认）：工作区未暂存；
- **Staged**：git index；
- **Commit**：指定提交的变更集；
- **Branch**：相对 base 分支的 diff（merge-base 起算）；
- **Last turn**：最近一轮 assistant 改动（可跨仓库 "All repos"）；
- CLI `/review` 另有 **Review against a base branch** / **Review uncommitted changes** /
  **Review a commit** / **Custom review instructions** 四档。

### 3.3 AI 评审输出（#1 裁决后，仅作背景）

结构化发现 P0–P3 + 置信度 + 建议代码块 + 总体结论，专用评审子代理、`review_model`、
`AGENTS.md` 评审准则 —— 这些全部随 #1 **不做**，不再进入本插件路线图。

### 3.4 评审面板的交互

- **三级 git 操作**：整批（Stage all / Revert all）· 每文件（stage / unstage / revert）·
  **每 hunk（stage / unstage / revert）** —— #2/#3 要对齐的是这一条；
- **行内评论**：hover 行 → `+` → 写评论 → 提交 —— #4 要对齐的是这一条；
- **PR 集成**（需 `gh`）：PR 上下文、reviewer 反馈、修复闭环 —— **#7 的第一项**；
- **多仓库**：review header 的仓库选择器 —— **#7 的第二项**；
- **编辑器联动**：点击文件/行在外部编辑器打开 —— **#7 的第三项**；
- `review_model` / 评审准则配置 —— **#7 的第四项，已随 #1 取消**。

### 3.5 #7 逐项解释（含对接方案）

1. **PR(gh) 集成**：当前分支关联 GitHub PR 时，面板里能看到 PR 标题与 reviewer 的
   评论（通过 `gh pr view` 拉取），形成"看 PR 反馈 → 改 → 提交推送"的单面板闭环。
   依赖本机 `gh` CLI 且已登录。没有 gh 时静默降级。
   - 具体形态：工作区页签新增「PR」区——`gh pr view --json number,title,body,url` +
   `gh api .../pulls/{n}/comments`；每条 PR 评论（带 file/line 或笼统）可点击跳到
   对应文件行；「让代理处理」按钮把 PR 评论聚合进 #6 的发送面板。
2. **多仓库**：一个项目目录含多个 git 仓库（嵌套仓库/monorepo）时，面板可切换查看
   各仓库的 diff（Codex 有仓库选择器 + "All repos"）。
   - 具体形态：工作区页签顶部仓库选择器——检测 `cwd` 及其一层子目录中的 git 仓库
   （`git -C <dir> rev-parse --is-inside-work-tree`），选定后所有现有路由照常以该
   仓库路径为 `cwd` 工作（路由本就是 `cwd` 参数化，改动集中在客户端检测 + 选择器）。
3. **编辑器联动**：点击 diff 中的文件或行，在 VS Code 等外部编辑器打开对应位置。
   - **对接 `dsh-plugin-open-editor`**（已装）：该插件现在只打开**目录**
   （`POST /open-editor/open {editor, path}`，path 必须为目录）。扩展它支持
   `{ editor, path: <文件>, line? }`：
     - VS Code 系（vscode/insiders/cursor/windsurf/trae）：`code --goto file:line`；
     - vim/gvim/nvim/emacs：`+<line> file`；sublime：`file:line`；JetBrains 系先
       打开文件（行参数视 CLI 支持再加）；
     - `validatePath` 放宽为"文件或目录"，`allowedRoots` 规则不变；
   - diff-review 侧：diff 头部「在编辑器中打开」按钮（打开文件）、行 hover
   「打开该行」（Cmd/⌘+点击行）；调用 open-editor 路由（绝对路径 =
   `cwd + repo-relative path`）。
4. **review_model / 评审准则**：随 `/review` 恢复（见 §八）：`reviewModel`
   `{ provider, model }` 配置，评审提示词内置 Codex 评审准则（AGENTS.md 轻量版
   可作为后续配置项）。

## 四、差距矩阵（v2，含裁决）

| # | 能力 | Codex | 本插件 | 裁决 |
| --- | --- | --- | --- | --- |
| 1 | AI 评审（/review） | ✅ 核心 | ✅ | **已实现** |
| 2 | **hunk 粒度** stage/unstage/revert | ✅ | ✅ | **已实现** |
| 3 | **unstage**（已暂存 → 未暂存） | ✅ | ✅ | **已实现** |
| 4 | **行内评论 / 行级反馈** | ✅ | ✅（单栏视图） | **已实现** |
| 5 | **评审范围切换**（Unstaged/Staged/Commit/Branch/Last turn） | ✅ | ✅ | **已实现** |
| 6 | **AI 修复闭环**（评论/反馈 → 代理改 → 复看） | ✅ | ✅ | **已实现**（prompt 注入） |
| 7a | PR(gh) 集成 | ✅ | ✅ | **已实现** |
| 7b | 多仓库 | ✅ | ✅ | **已实现** |
| 7c | 编辑器联动 | ✅ | ✅（经 open-editor） | **已实现** |
| 7d | review_model / 评审准则 | ✅ | ✅ | **已实现**（reviewProvider/reviewModel） |
| 8 | 单/双栏 diff | ✅ | ✅ | — |
| 9 | 每文件 accept/revert（file/all 级） | ✅ | ✅ | — |
| 10 | commit / push / ahead-behind | ✅ | ✅ | — |
| 11 | 历史时间线 + commit diff | ✅ | ✅ | — |
| 12 | 未跟踪文件展示 | ✅ | ✅（合成 diff） | — |
| 13 | 自动刷新 | ⚠️ 手动 | ✅ 15s 自动 | 插件更优 |
| 14 | 会话维度逐轮回顾（不依赖 git） | ⚠️ 近似 Last turn | ✅ 完整逐轮 | 插件更优 |

## 五、补齐设计（#2/#3/#4/#5）

> **实现状态（2026-08）：P0-a / P0-b / P1-a / P1-b / #6 均已落地**，见
> 代码与 README。关键实现决策：
> - hunk 的 index 侧操作（暂存/取消暂存）走 `git apply --cached` —— hunk 的
>   上下文与 index 完全一致，实测可靠；
> - hunk 的工作区侧操作（丢弃）**不用** `git apply --reverse`：实测 git 对
>   「变更行在 hunk 末尾、文件在 hunk 之后还有内容」的补丁会拒绝（context 布局
>   相关），改用 hunk 文本做行级替换写回文件（`parseHunk`/`applyHunkToText`，
>   严格上下文匹配，不匹配返回 409 提示刷新）；
> - 评论存储于 `git rev-parse --git-dir` 下的 `diff-review-comments.json`
>   （linked worktree 也能用），整表替换式 PUT，单用户语义；
> - 分支范围 = `git diff $(git merge-base HEAD <base>)`，只读（无操作按钮）；
>   基线分支名经 `check-ref-format` + `rev-parse --verify` 双重校验。

### P0-a：unstage（#3，最简单，可先行）

- `ApplyAction` 增加 `'unstage'`：单路径 `git restore --staged -- <path>`；
  全部 `git restore --staged .`（注意 `.` 的语义：仅 index，不动工作区）；
- 客户端：已暂存文件行内出现「取消暂存」按钮；头部可选「全部取消暂存」；
- 不影响现有 accept/revert 语义；`ApplyRequest` 类型加 `'unstage'`。

### P0-b：hunk 粒度操作（#2）

**数据层改造（关键）**：当前 `collectDiff` 把 staged 与 unstaged 的 diff 直接拼接，
客户端无法区分 hunk 属于哪一层。改为返回结构化 hunk 列表：

```ts
interface DiffHunk { layer: 'staged' | 'unstaged'; text: string /* 含 @@ 头 */ }
// DiffFile 增加：stagedHunks: DiffHunk[]; unstagedHunks: DiffHunk[]
```

- staged diff（`git diff --cached`）→ `stagedHunks`；unstaged diff（`git diff`）→
  `unstagedHunks`；未跟踪文件 → 合成 diff 归入 `unstagedHunks`；
- 客户端渲染时按 hunk 分块（unified 视图以 `@@` 行为界；split 视图天然按 block），
  每个 hunk 给操作按钮。

**执行**：新增 `POST {applyHunkPath}`，body `{ cwd, path, action, hunk }`：

| action | 目标层 | 实现 |
| --- | --- | --- |
| `accept` | unstaged → staged | 构造 patch（`diff --git a/P b/P` + `--- a/P` + `+++ b/P` + hunk），`git apply --cached` |
| `revert` | unstaged → 丢弃 | 同 patch，`git apply --reverse`（写回工作区） |
| `unstage` | staged → unstaged | 同 patch，`git apply --cached --reverse` |

- 校验：hunk 文本必须匹配 `@@ -\d+(,\d+)? +\d+(,\d+)? @@`，长度上限（如 1MB）；
  path 走现有 `sanitizeRepoPath`；
- 未跟踪文件的 hunk：`accept` = `git apply --cached`（可部分暂存新文件）；
  `revert` = 对工作区文件做反向文本应用（重写文件，非 `git apply -R` 亦可，
  因文件未被跟踪，`git apply --reverse` 对不存在于 index 的文件需要验证）；
- 失败分支：`git apply` 因上下文不匹配报错时，回传 stderr 提示"该 hunk 已过期，
  请刷新"；客户端失败后自动刷新状态。

### P1-a：行内评论 / 行级反馈（#4）

**交互（对齐 Codex 面板）**：
- unified 视图：hover 行右侧出现 `+` 按钮 → 弹出小输入框 → 提交；
  split 视图：行单元格 hover 同款；
- 有评论的行：左侧缘色条 + 数量角标，点击展开评论列表；可删除；
- 评论数据：`{ path, layer?, lineOld?, lineNew?, text, createdAt }`。

**存储（待定，见 §六 Q1）**：
- localStorage（本机、零后端）；
- 服务器端文件（如 `<cwd>/.git/diff-review-comments.json`，新路由 GET/PUT）；
- 只做会话内临时（关闭即弃）。

**行号映射**：评论挂在 unified 行的新旧行号上（`gitDiffRows`/`textDiffRows` 已有行号
能力需补：unified 视图当前不显示行号，需为评论锚点引入行号跟踪，参考 split 视图的
`pairRows` 行号推进逻辑）。

### P1-b：评审范围切换（#5）

**形态（待定，见 §六 Q3）**，能力清单：
- **Unstaged / Staged**：现有两个分区，改为可单独选中的 scope；
- **Commit**：现有历史时间线 → 提交 diff（已有）；
- **Branch**：新增。服务器端 `git for-each-ref refs/heads` 列分支 + base 选择；
  diff = `git diff $(git merge-base HEAD <base>) -- <path>`；
- **Last turn**：用现有 `collectSessionRounds` 的最后一轮文件集过滤 git 视图
  （git 文件路径 ↔ 会话路径需对齐，会话路径可能相对 cwd 也可能绝对）。

### P2（可选，待定）：#7 外围

- PR(gh)：检测 `gh` 存在 + 当前分支有上游 PR → `gh pr view --json title,body,reviews,comments`
  显示上下文；无 gh 静默降级；
- 多仓库：`cwd` 支持数组/仓库选择器；
- 编辑器联动：`vscode://file/<abs>:<line>` 协议（macOS 需 `open`；Windows
  `code` CLI）—— 最小实现是服务器端返回绝对路径，客户端拼 URL。

## 六、待讨论问题（#6 与开放项）

### Q1（#4）：行内评论存哪里？

**先回答"Codex 存在哪里"**（依据官方
[Code review](https://learn.chatgpt.com/docs/code-review.md) 文档）：

- Codex 的行内评论**属于会话数据，不属于仓库**：评论挂在聊天线程里（桌面 App 的
  本地聊天数据库），随账号同步；CLI 的 `/review` 发现则是一个 transcript 回合
  （JSONL session），同样随会话持久化；
- 关键语义是 **"Codex treats inline comments as review guidance"**：评论本身不是
  独立存储的注释，它的归宿是**下一轮发给模型的消息**——你发 follow-up 时评论作为
  评审指引进入模型上下文；
- 评论**不写入 git 仓库**（既不是工作区文件，也不是 .git 文件）。

**DSH 侧的对应**：DSH 客户端 Session 有 per-session projection store
（`ProjectionValueStore`），但它是 **host 计算、客户端只读**的（push 帧下发，
`apply()`/`seed()` 只能由 host 驱动），插件客户端没有写入会话数据的通道。
因此"评论随会话走"没有现成落点，可落地选项：

| 方案 | 优点 | 缺点 | 与 Codex 语义的距离 |
| --- | --- | --- | --- |
| A. 服务器端文件（`.git/diff-review-comments.json`，新路由 GET/PUT） | 随项目目录走、跨浏览器、面板可回看/编辑 | 需要新路由与并发处理；换机器不跟随（.git 不同步） | 中：随"项目"而非随"会话" |
| B. localStorage | 零后端、立即实现 | 单机单浏览器；换机器丢失 | 远：随"本机浏览器" |
| C. 不做独立存储 | 评论的用途就是**生成一条发给代理的消息**（#6 已定注入）；面板内仅会话内展示 | 关面板即丢，无法回看/编辑历史评论 | 近：评论=即将进入对话的反馈，最贴 Codex 语义 |

**推荐 A**（服务器端文件）：既能回看/编辑，又最接近"随项目走的会话数据"；
发送时按 #6 聚合为一条消息注入代理。C 可作 A 的降级（存储路由未就绪时先
localStorage 垫底，发送语义不变）。

### Q2（#6）：评论/反馈如何交给代理？

**技术事实**：DSH 客户端 Session 有 `prompt(content, mode: 'queue' | 'steer')`
（`dsh-client-runtime` 的 session.d.ts），插件可以程序化向当前会话注入用户消息。
因此闭环技术上可行。

**已定（作者裁决）：方案 A + B 兜底** —— 面板「发送给代理」→ 聚合评论 + 对应
diff 片段 → `binding.prompt([{type:'text',text}], 'steer')` → 代理下一步即处理（不再排队）；
注入失败（无当前会话/会话不可用）时退化为生成可复制文本。
注意：注入的消息会成为真实用户消息（steering 节点）；`steer` 模式在代理空闲时
直接唤醒处理、忙碌时插入下一步，均不会出现在队列条里（`queue` 模式才会排队）。

### Q3（#5）：范围切换的形态？

**已定（作者裁决）：方案 A** —— 顶部 scope 下拉：All / Unstaged / Staged / Commit /
Branch / Last turn，每次只看一个 scope 的文件树 + diff；All = 现在的样子
（staged + unstaged 分区一屏看全）。Branch 与 Last turn 为新增 scope。

## 八、AI 评审（/review）设计 —— 作者已反转裁决：做

> 闭环：**评审（按钮）→ 修复（#6 发送给代理）→ 复评审（再点按钮）**。
> 对齐 Codex CLI 的 `/review`（专用评审代理、P0–P3 发现、总体结论、`review_model`）。

### 8.1 已验证的 DSH 能力（决定架构）

- **服务器端可直接调 LLM**：`ctx.llm: LlmRuntime`（cordis Context 增强，
  `dsh-llm`），`ctx.llm.stream({ provider, model, messages, system, temperature, maxTokens, signal })`
  → `AsyncIterable<StreamChunk>`；
- **服务器端可解析会话当前模型**：`ctx.sessions.get(sessionId)?.requestHeader()?.config`
  → `{ provider, model, reasoningEffort?, temperature?, maxTokens? }`（会话的最近一次
  调用配置）；客户端评审请求携带 `sessionId`（overlay 已知 `currentId`）；
- 客户端公开契约（`ISessions`/`SessionFace`）**不暴露**模型选择，故模型来源走
  服务器端解析 + 配置兜底，不由客户端传。

### 8.2 路由与流程

```
POST {reviewPath}  body: { cwd, sessionId, scope?, base?, commitHash?, instructions? }
```

1. 按 scope 收集 diff（复用现有代码）：
   - `uncommitted`（默认）→ `collectStatus(cwd)`（files + hunks + diff）；
   - `branch` → `collectBaseStatus(cwd, base)`（merge-base diff，只读）；
   - `commit` → `commitDiffAction` 的 diff（指定 commit）；
2. 解析模型：`ctx.sessions.get(sessionId)?.requestHeader()?.config` →
   `{ provider, model }`；缺失时用配置 `reviewModel`；两者都无 → 400 提示
   「当前会话还没有可用的模型，或请在插件配置里设置 reviewModel」；
3. 组装评审提示词（内置 Codex 评审准则）：
   - 系统提示：评审准则（只报本次改动引入的问题、P0–P3 分级、可执行、给
     file/line/confidence/suggestion；不报风格偏好、不报既有问题）；
   - 用户消息：逐文件的 unified diff（路径 + added/deleted 统计 + diff 文本），
     要求 **严格输出 JSON**（`temperature: 0`，`maxTokens: 8192`）；
4. 调用 `ctx.llm.stream(...)`，聚合 chunk 文本，`JSON.parse`；
   解析失败 → 把原文作为一条 P2 发现返回（不整单失败）；
5. 校验发现（file 必须在本次评审文件集合内、line 为正整数、priority 白名单），
   返回 `{ ok, verdict: 'correct'|'incorrect', findings: ReviewFinding[], model, error? }`。

### 8.3 输出结构（对齐 Codex）

```ts
interface ReviewFinding {
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  title: string        // ≤80 字符
  detail: string
  file: string         // repo-relative
  lineStart: number    // 新文件行号（diff 的 new-side）
  lineEnd: number
  confidence: number   // 0–1
  suggestion?: string  // 建议代码块
}
interface ReviewResponse {
  ok: boolean
  verdict?: 'correct' | 'incorrect'
  findings: ReviewFinding[]
  model?: { provider: string; model: string }
  error?: string
}
```

### 8.4 客户端面板

- 工作区页签头部「**评审**」按钮（读 diff 时禁用；进行中显示 spinner）；
- 评审结果渲染：
  - 右侧 diff：有发现的文件/行叠加 **优先级色条 + 数量角标**（点击定位到
    对应行）；发现列表区（按文件分组，P0–P3 徽标 + 标题 + 详情 + 置信度 +
    建议代码块）；
  - 头部显示总体结论（Patch is correct ✓ / incorrect ✗）+ 模型名；
- **复评审**：代理修复后再点「评审」（重新收集当前 diff）；
- **发现 → 代理**：复用 #6 的发送面板（`session.prompt` 注入，失败复制兜底），
  消息体 = 选中的发现（带 file:line）+ "Address the review findings"。

### 8.5 配置（对齐 Codex `review_model`）

```yaml
config:
  reviewPath: /diff-review/review
  reviewModel:              # 可选；缺省用会话当前模型
    provider: deepseek-official
    model: deepseek-reasoner
```

### 8.6 风险与护栏

- 评审是**只读**的（仅收集 diff + 调模型，不改工作区）；
- diff 过大：按文件/总行数截断（如总 2000 行、单文件 500 行），截断在响应中标注；
- 模型不可用（`ctx.llm` 无适配器 / 无会话 header / 无 reviewModel）→ 明确报错提示
  配置；`LlmError` 的 `code`（AUTH/RATE_LIMIT…）透传给客户端；
- 发现校验：file 必须在本次评审文件内（防模型幻觉路径），行号钳制到文件长度。

### 8.7 与 Codex 的差异（有意为之）

- 无「评审子代理」：直接用 `ctx.llm` 单次调用（评审中不打断主会话、无工具）；
  如需更强隔离/更长的自省，后续可换 dsh-subagent 子代理（客户端契约暂不支持
  程序化创建，需另议）；
- 无 AGENTS.md 评审准则：内置准则 + `instructions` 请求参数先行，配置化后补。

## 七、实现层面的小问题（状态：2026-08 已打磨）

1. ~~commit diff 的 status 硬编码~~ **已修**：commit-diff 路由改为并行取
   `--name-status`，按 numstat 路径映射真实 A/D/M/R 状态（e2e 覆盖 A/M/D）。
2. **会话 tab 的 hunk 无真实行号**（保留，数据源限制）：`{oldText,newText}`
   片段不带起始行号，无法推导真实行号；split 视图按相对位置计数并标注
   `@@ hunk i/n @@` 伪头。文档注明即可。
3. ~~未跟踪文件合成 diff 全量读~~ **已修**：超过 1MB 的未跟踪文件不再
   `readFileSync` 全量读入，降级为 `Large untracked file (preview disabled)`
   （文件级采纳/丢弃不受影响）。
4. ~~`revert all` 未跟踪删除无反馈~~ **已修**：`ApplyResponse` 新增 `deleted[]`，
   客户端提示「已… N 个文件（删除 M 个未跟踪文件）」。
5. ~~行内评论只在单栏视图可用~~ **已修**：split 视图左右单元格均可加评论（锚定与
   单栏一致：上下文行两侧同锚、变更行按各自侧）；hover 按钮改 visibility 占位，
   不再导致行高跳动。评论锚定 `(path, lineNew, lineOld)`，行号失效时静默不显示。
6. **`git apply` 的 hunk-only 补丁有坑（已绕开）**：`git apply --reverse` 对
   「变更行位于 hunk 末尾、目标文件在该 hunk 之后还有内容」的补丁会报
   "patch does not apply"（与上下文行数/位置相关，实测确认）。工作区侧丢弃因此
   改用行级文本替换；index 侧 `git apply --cached` 不受影响。
7. **发送出去的评审包在对话中渲染为可点击卡片**：插件以 `priority: -1` 影射
   `conversation.chat.node` 的 `user` 渲染器（keyed 槽位，低优先级胜出），
   消息文本命中评审包前缀时渲染卡片（按文件分组、每条评论 `路径:行号` 可点击
   跳到评审面板对应变更块，AI 评审结论 + P0–P3 发现一并展示）；普通用户消息
   回退为原生外观气泡（含图片画廊与复制按钮）。注意：槽位会把条目自身命名空间
   的 `t` 交给胜出组件，因此**不能**委托给 shell 默认渲染器（其内部文案键
   不存在于插件命名空间），必须自绘回退气泡；`工作区：<cwd>` 行内嵌在消息里
   供卡片解析跳转目标。
