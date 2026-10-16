const path = require('path');
const { generateAIStudioImage } = require('./generate_aistudio_image');

const scenes = [
  {
    name: 'scene_0003.jpg',
    prompt: 'Simple Itihash Scene 3: Small stick figures playfully mockingly laughing and pointing at a giant embarrassed stickman hunter holding a woolly prehistoric beast, funny meme expression, Kalahari desert, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, 16:9 widescreen composition.'
  },
  {
    name: 'scene_0004.jpg',
    prompt: 'Simple Itihash Scene 4: Furious primitive stickman hunter chief shouting with intense rage, holding a giant bone club raised high, dramatic desert storm dust swirl, cinematic impact, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, 16:9 widescreen composition.'
  },
  {
    name: 'scene_0005.jpg',
    prompt: 'Simple Itihash Scene 5: Stickman king wearing a crude stone crown sitting proudly on a crude wooden log throne receiving fruits and meat from bowed stickman subjects, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, 16:9 widescreen composition.'
  },
  {
    name: 'scene_0006.jpg',
    prompt: 'Simple Itihash Scene 6: Colossal stone pyramid under construction, thousands of tiny stickman workers pulling stone blocks and marching armies under a royal balcony, ancient civilization, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, 16:9 widescreen composition.'
  },
  {
    name: 'scene_0007.jpg',
    prompt: 'Simple Itihash Scene 7: The Time Chronicler closing his leather history journal, looking directly at the camera with a warm friendly smile, ancient cosmic library background, brass spectacles, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, 16:9 widescreen composition.'
  },
  {
    name: 'bn_thumbnail.jpg',
    prompt: 'YouTube Thumbnail 16:9: Large glowing dramatic text "প্রথম রাজা!" with furious stickman chief shouting with bone club vs crowned king on throne, high contrast, vibrant saturated yellow and red lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold outlines, eye-catching 4k.'
  },
  {
    name: 'en_thumbnail.jpg',
    prompt: 'YouTube Thumbnail 16:9: Large bold dramatic text "THE FIRST KING!" with angry prehistoric stickman hunter vs proud stone-crowned king on throne, high contrast, vibrant neon yellow and red lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold outlines, eye-catching 4k.'
  },
  {
    name: 'hi_thumbnail.jpg',
    prompt: 'YouTube Thumbnail 16:9: Large bold dramatic text "पहला राजा!" with angry prehistoric stickman hunter vs proud stone-crowned king on throne, high contrast, vibrant yellow and red lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold outlines, eye-catching 4k.'
  }
];

async function run() {
  const assetsDir = path.join(__dirname, '..', 'projects', 'sample_first_king', 'visual_assets');
  console.log(`Starting batch generation of ${scenes.length} assets in Google AI Studio (Nano Banana 2, 2K, 16:9)...`);

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const outPath = path.join(assetsDir, s.name);
    console.log(`\n========================================`);
    console.log(`[${i + 1}/${scenes.length}] Generating ${s.name}...`);
    console.log(`========================================`);
    try {
      await generateAIStudioImage(s.prompt, outPath, { resetChat: true, aspectRatio: '16:9', resolution: '2K' });
      console.log(`[${i + 1}/${scenes.length}] Done ${s.name}!`);
    } catch (err) {
      console.error(`[${i + 1}/${scenes.length}] Failed ${s.name}:`, err.message);
    }
  }

  console.log('\nAll AI Studio asset generations completed!');
}

run().catch(console.error);
