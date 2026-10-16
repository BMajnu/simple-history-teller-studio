const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJECT_JSON = path.join(ROOT, 'projects', 'sample_first_king', 'project.json');

const NEGATIVE_CONSTRAINT = '--no realistic human faces, realistic eyes, realistic nose, realistic lips, text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks';

function transformToRichStickyPrompt(scene) {
  let raw = scene.visual_prompt || '';

  // Strip negative tails and old boilerplate
  raw = raw
    .replace(/--no.*$/i, '')
    .replace(/^Dynamic cartoon 2D animation in OverSimplified style\.\s*/i, '')
    .replace(/^OverSimplified cartoon style,\s*clean 2D flat vector comic art,\s*bold solid 5px black ink outlines,\s*vibrant saturated color fills,\s*/i, '')
    .replace(/^OverSimplified cartoon style,\s*/i, '')
    .replace(/^OverSimplified comic style,\s*/i, '')
    .replace(/^OverSimplified style,\s*/i, '')
    .replace(/, 16:9 widescreen comic art\.\s*/i, '')
    .replace(/, 24fps motion\.\s*/i, '')
    .trim();

  // If this scene features The Time Chronicler (host)
  if (raw.includes('The Time Chronicler')) {
    raw = raw.replace(
      /The Time Chronicler\s*\([^)]*\)/i,
      'The Time Chronicler (OverSimplified cartoon host, smooth egg-shaped white head, round circular brass spectacles, expressive dot eyes with arched comic eyebrow, thin black stick-figure limbs, wearing brown tweed vest over white collared shirt with tiny brass pocket watch chain, holding antique leather history journal)'
    );
    return `Humorous historical comic illustration, 16:9 widescreen. Richly detailed mystical cosmic library environment with towering dark mahogany bookshelves, glowing celestial maps, floating ancient scrolls, warm golden lantern light, atmospheric dust motes and rich environmental depth. Minimalist OverSimplified stick-figure host: ${raw}. Vibrant colors, cinematic lighting, bold comic outlines. ${NEGATIVE_CONSTRAINT}`;
  }

  // General historical scene:
  // Detect historical setting keywords to inject rich environmental atmosphere
  let envAtmosphere = 'Richly detailed atmospheric historical environment with dramatic cinematic lighting, deep shadows, rich textures, and vibrant color depth.';

  if (raw.toLowerCase().includes('kalahari') || raw.toLowerCase().includes('desert') || raw.toLowerCase().includes('sand dunes')) {
    envAtmosphere = 'Richly detailed African Kalahari desert landscape at sunset with textured rolling red sand dunes, scattered acacia trees, warm glowing horizon, and atmospheric heat haze.';
  } else if (raw.toLowerCase().includes('savannah') || raw.toLowerCase().includes('african')) {
    envAtmosphere = 'Richly detailed African savannah landscape at golden hour with tall golden grass, distant purple mountains, scattered acacia trees, and traditional thatched huts.';
  } else if (raw.toLowerCase().includes('campfire') || raw.toLowerCase().includes('fire') || raw.toLowerCase().includes('clearing')) {
    envAtmosphere = 'Richly detailed ancient prehistoric clearing at twilight with a warmly glowing crackling campfire casting dancing orange light and long shadows over textured earth and rocky hills under a starry night sky.';
  } else if (raw.toLowerCase().includes('throne') || raw.toLowerCase().includes('palace') || raw.toLowerCase().includes('bureaucrat') || raw.toLowerCase().includes('office')) {
    envAtmosphere = 'Richly detailed grand ancient hall with massive stone columns, flickering bronze wall torches, rich ornamental tapestries, and dramatic cinematic lighting.';
  } else if (raw.toLowerCase().includes('farm') || raw.toLowerCase().includes('grain') || raw.toLowerCase().includes('wheat') || raw.toLowerCase().includes('granary') || raw.toLowerCase().includes('crop')) {
    envAtmosphere = 'Richly detailed ancient Fertile Crescent farmland along the Tigris river with lush golden wheat fields, stone granary storehouses, irrigation canals, and warm golden hour sunlight.';
  } else if (raw.toLowerCase().includes('ziggurat') || raw.toLowerCase().includes('sumer') || raw.toLowerCase().includes('priest') || raw.toLowerCase().includes('temple') || raw.toLowerCase().includes('altar')) {
    envAtmosphere = 'Richly detailed ancient Sumerian city-state with a monumental mudbrick Ziggurat temple, billowing ceremonial incense smoke, bronze braziers, and dramatic twilight sky.';
  } else if (raw.toLowerCase().includes('war') || raw.toLowerCase().includes('battle') || raw.toLowerCase().includes('army') || raw.toLowerCase().includes('soldier') || raw.toLowerCase().includes('spear')) {
    envAtmosphere = 'Richly detailed epic ancient Bronze Age battlefield with dust clouds kicking up, bronze shields, spears, banners, dramatic high-contrast sunlight, and wide horizon.';
  }

  // Ensure characters are explicitly anchored as minimalist OverSimplified stickmen
  let characterAnchor = 'Minimalist OverSimplified stick-figure characters with smooth egg-shaped bald white heads (#FFFFFF) and thin black stick limbs:';
  if (!raw.toLowerCase().includes('stickman') && !raw.toLowerCase().includes('stick figures') && !raw.toLowerCase().includes('stick men')) {
    raw = raw.replace(/\b(hunters|farmers|people|warriors|raiders|villagers|citizens|slaves|priests|council members|men)\b/gi, 'stickman $1');
  }

  return `Humorous historical comic illustration, 16:9 widescreen. ${envAtmosphere} ${characterAnchor} ${raw}. Bold clean comic outlines, rich environmental storytelling, vibrant cinematic colors. ${NEGATIVE_CONSTRAINT}`;
}

const p = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
console.log('Testing transformation on 5 scenes:\n');

[1, 2, 4, 10, 42].forEach(id => {
  const sc = p.scenes.find(s => s.scene_id === id);
  console.log(`=== Scene ${id} ===`);
  console.log(transformToRichStickyPrompt(sc));
  console.log('');
});

module.exports = { transformToRichStickyPrompt };
