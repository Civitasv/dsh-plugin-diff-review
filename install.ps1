# dsh-plugin-diff-review — 一键安装脚本（Windows / PowerShell）
#
# 用法：  powershell -ExecutionPolicy Bypass -File install.ps1
#
# 步骤：安装依赖（含 devDependencies，便于本地开发）→ 链接进 profile →
#       注册 cordis.patch.yml → 提示重启与验证。
$ErrorActionPreference = 'Stop'

$Name = 'dsh-plugin-diff-review'
$PluginId = 'diff-review'
$OpenEditorName = 'dsh-plugin-open-editor'
$OpenEditorId = 'open-editor'
$OpenEditorSource = 'github:Civitasv/dsh-plugin-open-editor#main'
$PluginDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }
$ProfileNm = Join-Path $DshHome 'profiles\node_modules'
$Patch = Join-Path $DshHome 'profiles\web\cordis.patch.yml'

Write-Host "==> 安装 $Name"
Write-Host "    插件目录: $PluginDir"

# 1. 依赖（全量安装：运行依赖 + devDependencies，改源码后可直接 npm run build）
if (-not (Test-Path (Join-Path $PluginDir 'node_modules'))) {
  Write-Host '==> 安装依赖（npm install --no-audit --no-fund）…'
  Push-Location $PluginDir
  try { npm install --no-audit --no-fund } finally { Pop-Location }
} else {
  Write-Host '==> 依赖已存在，跳过 npm install'
}

# 2. 安装必装前置插件（提供“在编辑器中打开”能力）
if (-not (Get-Command dsh -ErrorAction SilentlyContinue)) {
  throw "未找到 dsh 命令，无法安装 $OpenEditorName"
}
Write-Host "==> 安装必装前置插件：$OpenEditorName"
dsh plugin --profile web add $OpenEditorSource

# 3. 链接进 profile 的扁平 node_modules（Junction 无需管理员权限）
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

# 4. 注册到 cordis.patch.yml（幂等）
New-Item -ItemType Directory -Force -Path (Split-Path $Patch) | Out-Null
function Ensure-PluginRegistration([string]$Id, [string]$PluginName) {
  if ((Test-Path $Patch) -and (Select-String -Path $Patch -Pattern "name: $PluginName" -Quiet)) {
    Write-Host "==> $Patch 已包含 $PluginName，跳过注册"
    return
  }
  @"

# $PluginName (由 install.ps1 添加)
- insert:
    - id: $Id
      name: $PluginName
"@ | Add-Content -Path $Patch -Encoding UTF8
  Write-Host "==> 已注册到 $Patch：$PluginName"
}
Ensure-PluginRegistration $OpenEditorId $OpenEditorName
Ensure-PluginRegistration $PluginId $Name

Write-Host ''
Write-Host '==> 完成。请重启 dsh web：'
Write-Host '    停止当前 dsh web 进程后重新运行：  dsh web'
Write-Host '    验证：  dsh --profile web --dump-config | Select-String dsh-plugin-diff-review'
Write-Host '    重启后打开任意会话，页头会出现「变动」按钮。'
