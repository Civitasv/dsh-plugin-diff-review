#!/usr/bin/env bash
#
# dsh-plugin-diff-review — 一键安装脚本（macOS / Linux）
#
# 用法：  bash install.sh
# 或：    ./install.sh
#
# 步骤：安装依赖（含 devDependencies，便于本地开发）→ 链接进 profile →
#       注册 cordis.patch.yml → 提示重启与验证。
set -euo pipefail

NAME="dsh-plugin-diff-review"
PLUGIN_ID="diff-review"
OPEN_EDITOR_NAME="dsh-plugin-open-editor"
OPEN_EDITOR_ID="open-editor"
OPEN_EDITOR_SOURCE="github:Civitasv/dsh-plugin-open-editor#main"
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE_NM="$DSH_HOME/profiles/node_modules"
PATCH="$DSH_HOME/profiles/web/cordis.patch.yml"

echo "==> 安装 $NAME"
echo "    插件目录: $PLUGIN_DIR"

# 1. 依赖（全量安装：运行依赖 + devDependencies，改源码后可直接 npm run build）
if [ ! -d "$PLUGIN_DIR/node_modules" ]; then
  echo "==> 安装依赖（npm install --no-audit --no-fund）…"
  (cd "$PLUGIN_DIR" && npm install --no-audit --no-fund)
else
  echo "==> 依赖已存在，跳过 npm install"
fi

# 2. 安装必装前置插件（提供“在编辑器中打开”能力）
if ! command -v dsh >/dev/null 2>&1; then
  echo "!! 未找到 dsh 命令，无法安装 $OPEN_EDITOR_NAME" >&2
  exit 1
fi
echo "==> 安装必装前置插件：$OPEN_EDITOR_NAME"
dsh plugin --profile web add "$OPEN_EDITOR_SOURCE"

# 3. 链接进 profile 的扁平 node_modules
mkdir -p "$PROFILE_NM"
if [ -e "$PROFILE_NM/$NAME" ] && [ ! -L "$PROFILE_NM/$NAME" ]; then
  echo "!! $PROFILE_NM/$NAME 已存在且不是符号链接，请手动处理" >&2
  exit 1
fi
ln -sfn "$PLUGIN_DIR" "$PROFILE_NM/$NAME"
echo "==> 已链接: $PROFILE_NM/$NAME -> $PLUGIN_DIR"

# 4. 注册到 cordis.patch.yml（幂等）
mkdir -p "$(dirname "$PATCH")"
ensure_plugin_registration() {
  local id="$1"
  local name="$2"
  if [ -f "$PATCH" ] && grep -q "name: $name" "$PATCH" 2>/dev/null; then
    echo "==> $PATCH 已包含 $name，跳过注册"
    return
  fi
  cat >> "$PATCH" <<EOF

# $name (由 install.sh 添加)
- insert:
    - id: $id
      name: $name
EOF
  echo "==> 已注册到 $PATCH：$name"
}
ensure_plugin_registration "$OPEN_EDITOR_ID" "$OPEN_EDITOR_NAME"
ensure_plugin_registration "$PLUGIN_ID" "$NAME"

echo
echo "==> 完成。请重启 dsh web："
echo "    停止当前 dsh web 进程后重新运行：  dsh web"
echo "    验证：  dsh --profile web --dump-config | grep dsh-plugin-diff-review"
echo "    重启后打开任意会话，页头会出现「变动」按钮。"
