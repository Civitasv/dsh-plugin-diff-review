# dsh-plugin-diff-review — 一键安装脚本（Windows / PowerShell）
#
# 用法：  powershell -ExecutionPolicy Bypass -File install.ps1
#
# 步骤：安装运行依赖 → 链接进 profile → 注册 cordis.patch.yml → 提示重启。
$ErrorActionPreference = 'Stop'

$Name = 'dsh-plugin-diff-review'
$PluginDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }
$ProfileNm = Join-Path $DshHome 'profiles\node_modules'
$Patch = Join-Path $DshHome 'profiles\web\cordis.patch.yml'

Write-Host "==> 安装 $Name"
Write-Host "    插件目录: $PluginDir"

# 1. 运行依赖（仓库自带构建产物，只需生产依赖）
if (-not (Test-Path (Join-Path $PluginDir 'node_modules'))) {
  Write-Host '==> 安装运行依赖（npm install --omit=dev）…'
  Push-Location $PluginDir
  try { npm install --omit=dev --no-audit --no-fund } finally { Pop-Location }
} else {
  Write-Host '==> 依赖已存在，跳过 npm install'
}

# 2. 链接进 profile 的扁平 node_modules（Junction 无需管理员权限）
New-Item -ItemType Directory -Force -Path $ProfileNm | Out-Null
$Target = Join-Path $ProfileNm $Name
if (Test-Path $Target) {
  if ((Get-Item $Target).LinkType) {
    Remove-Item $Target -Force
  } else {
    Write-Host "!! $Target 已存在且不是链接，请手动处理" -ForegroundColor Red
    exit 1
  }
}
New-Item -ItemType Junction -Path $Target -Target $PluginDir | Out-Null
Write-Host "==> 已链接: $Target -> $PluginDir"

# 3. 注册到 cordis.patch.yml（幂等：已存在则跳过）
if ((Test-Path $Patch) -and (Select-String -Path $Patch -Pattern "name: $Name" -Quiet)) {
  Write-Host "==> $Patch 已包含 $Name，跳过注册"
} else {
  New-Item -ItemType Directory -Force -Path (Split-Path $Patch) | Out-Null
  @"

# $Name (由 install.ps1 添加)
- insert:
    - id: diff-review
      name: $Name
"@ | Add-Content -Path $Patch -Encoding UTF8
  Write-Host "==> 已注册到 $Patch"
}

Write-Host ''
Write-Host '==> 完成。请重启 dsh web，然后打开任意会话，页头会出现「变动」按钮。'
