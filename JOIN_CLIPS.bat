@echo off
REM Reassemble split render chunks (GitHub 100MB workaround). Run from repo root.
set RDIR=projects\simple_itihash_003_nalanda\renders
for %%F in (video_bn.mp4 video_en.mp4 video_hi.mp4 visual_master_bn.mp4 visual_master_en.mp4 visual_master_hi.mp4) do (
  if not exist "%RDIR%\%%F" (
    echo Joining %%F ...
    copy /b "%RDIR%\%%F.part-*" "%RDIR%\%%F" >nul
  ) else (
    echo Exists, skip: %%F
  )
)
echo DONE. Verify sizes against %RDIR%\manifest.json
