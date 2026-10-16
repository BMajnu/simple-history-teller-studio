<#
.SYNOPSIS
  Tagore-Bangladesh documentary fleet orchestrator (up to 10 workers).
.DESCRIPTION
  Probe-first launcher for the three generation fleets of project bn_tagore_bangladesh_docu:
    Tts    -> tools/run_tts_bn_tagore_docu.js     (95 BN wav, Cruz/Charon)
    Images -> tools/run_images_bn_tagore_docu.js  (79 AI keyframes, model chain R1)
    Videos -> tools/run_videos_bn_tagore_docu.js  (85 AI clips, engine chain V1)
  Order: Tts (independent) -> Images (keyframes) -> Videos (needs anchors).
  Videos refuse to start when anchors are missing (lists them instead).
.PARAMETER Phase
  Tts | Images | Videos | All
.PARAMETER Workers
  1..10 (default 10). Passed as $env:NUM_WORKERS to the fleet script.
.PARAMETER OnlyScene
  Probe exactly one scene (fleet runs single-worker probe, verifies output, exits).
.PARAMETER Force
  Re-generate even if output already exists (passed as --force to TTS only).
.EXAMPLE
  .\tools\Run_Tagore_Fleet.ps1 -Phase Tts -OnlyScene 1        # probe 1 wav first
  .\tools\Run_Tagore_Fleet.ps1 -Phase Tts -Workers 10         # full BN-TTS fleet
  .\tools\Run_Tagore_Fleet.ps1 -Phase Images -Workers 10      # 79 keyframes
  .\tools\Run_Tagore_Fleet.ps1 -Phase Videos -OnlyScene 7     # probe 1 clip first
#>
[CmdletBinding()]
param(
  [ValidateSet('Tts', 'Images', 'Videos', 'All')]
  [string]$Phase = 'Tts',
  [ValidateRange(1, 10)]
  [int]$Workers = 10,
  [int]$OnlyScene = 0,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'
$ROOT = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$PROJ = Join-Path $ROOT 'projects\bn_tagore_bangladesh_docu'
$LOGDIR = Join-Path $PROJ 'fleet_logs'
New-Item -ItemType Directory -Path $LOGDIR -Force | Out-Null

function Test-Prereq {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'node not on PATH' }
  if (-not (Test-Path 'C:\Program Files\Google\Chrome\Application\chrome.exe')) { throw 'Chrome not found' }
  if (-not (Test-Path 'C:\Users\badiu\.gemini\antigravity\scratch\chrome_aistudio_profile_3')) { throw 'AI Studio Chrome profile missing (login first)' }
  $pj = Get-Content (Join-Path $PROJ 'project.json') -Raw | ConvertFrom-Json
  Write-Host "project.json ok: $($pj.scenes.Count) scenes, style=$($pj.style_preset)"
}

function Invoke-Fleet([string]$Name, [string]$Script, [string]$OutPattern, [int]$OutMinBytes, [string]$OutDir) {
  $probeTxt = if ($OnlyScene) { ", probe=$OnlyScene" } else { '' }
  Write-Host "`n=== FLEET: $Name (workers=$Workers$probeTxt) ==="
  $ts = Get-Date -Format 'yyyyMMdd-HHmmss'
  $log = Join-Path $LOGDIR "${Name}_${ts}.log"
  $env:NUM_WORKERS = "$Workers"
  if ($OnlyScene) { $env:ONLY_SCENE = "$OnlyScene" } else { Remove-Item Env:\ONLY_SCENE -ErrorAction SilentlyContinue }
  $args = @($Script) + $(if ($Force -and $Name -eq 'Tts') { @('--force') } else { @() })
  Write-Host "log: $log"
  $p = Start-Process -FilePath 'node' -ArgumentList $args -WorkingDirectory $ROOT `
    -RedirectStandardOutput $log -RedirectStandardError ($log + '.err') -PassThru
  if ($OnlyScene) {
    # Probe: wait up to 8 min, then verify exactly one output
    $deadline = (Get-Date).AddMinutes(8)
    while ((Get-Date) -lt $deadline -and -not $p.HasExited) { Start-Sleep -Seconds 10 }
    $hits = Get-ChildItem -LiteralPath $OutDir -Filter $OutPattern -ErrorAction SilentlyContinue |
      Where-Object { $_.Length -gt $OutMinBytes }
    $ok = ($hits | Where-Object { $_.Name -match ('{0:0000}' -f $OnlyScene) }).Count -gt 0
    Write-Host ($(if ($ok) { 'PROBE PASS' } else { 'PROBE FAIL (see log)' }) + ": $OutPattern > ${OutMinBytes}B in $OutDir")
    if (-not $p.HasExited) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
    return $ok
  }
  # Full fleet: monitor every 60s until process exits
  while (-not $p.HasExited) {
    Start-Sleep -Seconds 60
    $n = @(Get-ChildItem -LiteralPath $OutDir -Filter $OutPattern -ErrorAction SilentlyContinue |
      Where-Object { $_.Length -gt $OutMinBytes }).Count
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Name outputs on disk: $n"
  }
  Write-Host "$Name fleet exited (code $($p.ExitCode)). Log: $log"
  return ($p.ExitCode -eq 0)
}

function Test-VideoAnchors {
  $missing = @(node -e "const fs=require('fs'),path=require('path');const p=require('./projects/bn_tagore_bangladesh_docu/project.json');for(const s of p.scenes.filter(x=>x.type==='DYNAMIC_AI_VIDEO')){const a=path.join('projects/bn_tagore_bangladesh_docu/visual_assets','shot_'+String(s.scene_id).padStart(4,'0')+'.jpg');if(!fs.existsSync(a))console.log(s.scene_id)}")
  if ($missing.Count -gt 0) {
    Write-Host "VIDEOS BLOCKED: anchors missing for scenes: $($missing -join ', ')"
    Write-Host 'Run -Phase Images first (AI keyframes) + archival download manifest (6 stills).'
    return $false
  }
  return $true
}

Test-Prereq
$rawAudio = Join-Path $PROJ 'audio\raw'
$visual = Join-Path $PROJ 'visual_assets'
$ok = $true
switch ($Phase) {
  'Tts' { $ok = Invoke-Fleet 'Tts' 'tools\run_tts_bn_tagore_docu.js' 'bn_shot_*.wav' 50000 $rawAudio }
  'Images' { $ok = Invoke-Fleet 'Images' 'tools\run_images_bn_tagore_docu.js' 'shot_*.jpg' 50000 $visual }
  'Videos' {
    if (-not (Test-VideoAnchors)) { exit 2 }
    $ok = Invoke-Fleet 'Videos' 'tools\run_videos_bn_tagore_docu.js' 'clip_shot_*.mp4' 100000 $visual
  }
  'All' {
    $ok = Invoke-Fleet 'Tts' 'tools\run_tts_bn_tagore_docu.js' 'bn_shot_*.wav' 50000 $rawAudio
    if ($ok) { $ok = Invoke-Fleet 'Images' 'tools\run_images_bn_tagore_docu.js' 'shot_*.jpg' 50000 $visual }
    if ($ok -and (Test-VideoAnchors)) { $ok = Invoke-Fleet 'Videos' 'tools\run_videos_bn_tagore_docu.js' 'clip_shot_*.mp4' 100000 $visual }
  }
}
exit ($(if ($ok) { 0 } else { 1 }))
