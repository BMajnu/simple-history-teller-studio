const { FleetGenerator } = require('./fleet_consistent_generator');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');
const REF_MASCOT = path.join(ROOT, 'references', 'ref_host_sticky_meme.jpg');

async function main() {
  const fleet = new FleetGenerator();

  // ==========================================
  // SCENE 70 (Timeline Scene 69: Ziggurat vs City)
  // ==========================================
  console.log('\n>>> PROCESSING SCENE 70 (Timeline 69) <<<');
  const s70Start = path.join(VISUAL_DIR, 'scene_0070.jpg');
  const s70End = path.join(VISUAL_DIR, 'scene_0070_end.jpg');
  const s70Video = path.join(VISUAL_DIR, 'clip_scene_0070.mp4');

  if (!fs.existsSync(s70End)) {
    const s70EndPrompt = `OverSimplified 2D cartoon style, 16:9 widescreen composition.
ENDING KEYFRAME: The Time Chronicler (elderly wise historian: bald crown with fluffy white hair on sides, full bushy white beard and mustache, circular wire spectacles, warm philosophical smile, wearing brown scholar tunic over muted shirt, stick figure legs, bold 5px black vector outlines) standing on the stone hill overlooking the ancient Mesopotamian Ziggurat on the left and glowing modern skyscraper city on the right.
In this ending frame, he rests his hand thoughtfully on the antique leather history book on the stone pedestal, stroking his white beard with the other hand, gazing with profound curiosity at the viewers as twilight mist and clouds drift between the ancient mudbrick temples and the futuristic glass towers.
CRITICAL MANDATORY CONSISTENCY: The character MUST EXACTLY match the character in Image 1 and Image 2: full bushy white beard, mustache, wire glasses, brown scholar tunic. Pure 2D flat vector art, clean white cartoon head, no photorealism. --no text, words, captions, watermark, labels`;

    await fleet.generateImage({
      prompt: s70EndPrompt,
      referenceFiles: [s70Start, REF_MASCOT],
      outPath: s70End
    });
  }

  const s70VidPrompt = `Keyframe Animation: Transition smoothly from Image 1 (Starting Frame) to Image 2 (Ending Frame).
Animate this 2D cartoon scene into a smooth 24fps motion video in OverSimplified style:
The Time Chronicler (elderly wise historian: bald crown with white hair on sides, full bushy white beard and mustache, round wire-rim spectacles, brown scholar tunic) stands between the ancient Mesopotamian ziggurat and the towering modern skyscraper metropolis, speaking thoughtfully to the viewer, stroking his white beard with one hand and touching the ancient book on the stone pedestal with the other, as atmospheric twilight clouds drift across the horizon.
CRITICAL MANDATORY LOCK: The character MUST retain his full white beard, white mustache, spectacles, hair, and brown scholar tunic from frame 1 to the final frame. DO NOT remove the beard. DO NOT change facial features. Pure 2D flat animation, 24fps motion, 16:9 widescreen.`;

  await fleet.generateVideo({
    startFrame: s70Start,
    endFrame: s70End,
    prompt: s70VidPrompt,
    outPath: s70Video
  });

  // ==========================================
  // SCENE 78 (Comment Callout)
  // ==========================================
  console.log('\n>>> PROCESSING SCENE 78 <<<');
  const s78Start = path.join(VISUAL_DIR, 'scene_0078_start.jpg');
  const s78End = path.join(VISUAL_DIR, 'scene_0078_end.jpg');
  const s78Video = path.join(VISUAL_DIR, 'clip_scene_0078.mp4');

  if (!fs.existsSync(s78Start)) {
    const s78StartPrompt = `OverSimplified 2D cartoon style, 16:9 widescreen composition.
STARTING KEYFRAME: The Time Chronicler (elderly wise historian: bald crown with fluffy white hair on sides, full bushy white beard and mustache, circular wire spectacles, warm inviting smile, wearing brown scholar tunic over muted shirt, stick figure legs, bold 5px black vector outlines) standing in a cozy ancient stone library near a warm glowing fireplace and candle chandeliers, holding his antique leather history journal under one arm.
He looks directly at the viewers with a curious, friendly expression.
CRITICAL MANDATORY CONSISTENCY: The character MUST EXACTLY match the reference character in Image 1: full bushy white beard, white mustache, round wire glasses, bald crown with white side hair, brown scholar tunic. Pure 2D flat vector art, clean white cartoon head, no photorealism. --no text, words, captions, watermark, labels`;

    await fleet.generateImage({
      prompt: s78StartPrompt,
      referenceFiles: [REF_MASCOT],
      outPath: s78Start
    });
  }

  if (!fs.existsSync(s78End)) {
    const s78EndPrompt = `OverSimplified 2D cartoon style, 16:9 widescreen composition.
ENDING KEYFRAME: The Time Chronicler (elderly wise historian: bald crown with fluffy white hair on sides, full bushy white beard and mustache, circular wire spectacles, warm inviting smile, wearing brown scholar tunic over muted shirt, stick figure legs, bold 5px black vector outlines) in the cozy stone library near the fireplace.
In this ending frame, he has playfully cupped one ear with his hand in an inquisitive, listening gesture, smiling warmly at the viewers, inviting them to comment.
CRITICAL MANDATORY CONSISTENCY: The character MUST EXACTLY match the reference character in Image 1: full bushy white beard, white mustache, round wire glasses, bald crown with white side hair, brown scholar tunic. Pure 2D flat vector art, clean white cartoon head, no photorealism. --no text, words, captions, watermark, labels`;

    await fleet.generateImage({
      prompt: s78EndPrompt,
      referenceFiles: [s78Start, REF_MASCOT],
      outPath: s78End
    });
  }

  const s78VidPrompt = `Keyframe Animation: Transition smoothly from Image 1 (Starting Frame) to Image 2 (Ending Frame).
Animate this 2D cartoon scene into a smooth 24fps motion video in OverSimplified style:
The Time Chronicler (elderly wise historian: bald crown with white hair on sides, full bushy white beard and mustache, round wire-rim spectacles, brown scholar tunic) smiles and playfully cups one ear with his hand to ask the audience for their thoughts in the comments in the cozy stone library.
CRITICAL MANDATORY LOCK: The character MUST retain his full white beard, white mustache, spectacles, hair, and brown scholar tunic from frame 1 to the final frame. DO NOT remove the beard. Pure 2D flat animation, 24fps motion, 16:9 widescreen.`;

  await fleet.generateVideo({
    startFrame: s78Start,
    endFrame: s78End,
    prompt: s78VidPrompt,
    outPath: s78Video
  });

  console.log('\n🎉 ALL TARGET CONSISTENT SCENES GENERATED SUCCESSFULLY!');
}

main().catch(console.error);
