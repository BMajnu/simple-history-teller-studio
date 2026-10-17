# Concat recipes (exact commands from FlowKit `fk-concat`)

Source priority per scene: local `4k/scene_{ORD3}_{SID}.mp4` → `${ori}_upscale_url`
(GCS ~8h TTL) → `${ori}_video_url`. ABORT if none. Canonical name
`4k/scene_${IDX3}_${SCENE_ID}.mp4` (`IDX3` = `printf %03d display_order`).
Resolution: `--4k` → `3840:2160` H / `2160:3840` V, else ffprobe first scene.
NEVER downscale 4K. NEVER `-an`.

## A. No TTS (normalize)

```bash
ffmpeg -y -i "$CANONICAL" -c:v libx264 -preset fast -crf 18 \
 -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2" \
 -r 24 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart \
 "${OUTDIR}/norm/scene_${IDX3}_${SCENE_ID}.mp4"
```

## B. With TTS (scene SFX 0.3 + narration 1.5)

```bash
ffmpeg -y -i "$CANONICAL" -i "$TTS_WAV" \
 -filter_complex "[0:a]volume=0.3[bg];[1:a]volume=1.5[fg];[bg][fg]amix=inputs=2:duration=first[aout]" \
 -map 0:v -map "[aout]" -c:v libx264 -preset fast -crf 18 \
 -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2" \
 -r 24 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart \
 "${OUTDIR}/narrated/scene_${IDX3}_${SCENE_ID}.mp4"
```

## Concat (demuxer, display order)

```bash
printf "file '%s'\n" ... > concat.txt
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy -movflags +faststart "${OUTDIR}/${SLUG}_final.mp4"
```

Verify: ffprobe width/height/codec, `ls -lh`, duration,
`ffmpeg -t 10 -i final -af volumedetect -f null /dev/null` (−30..−10 dB ok, −inf = silent).

Server variant (`agent/services/post_process.py`) uses 30fps normalize
(`-r 30 -b:a 128k -ar 48000 -ac 2`), stream-copy merge, `-ss/-t` trim with
`-force_key_frames expr:gte(t,0)`, and narration/music amix chains — see
`skills/flowkit/fk-concat.md` Step 6 for the full strings.
