// Fresh visual_prompt regeneration for simple_itihash_002_first_language (EP02).
// Locked style: PRESET_STICKY_MEME. Every prompt rebuilt from scene narration beat.
// Rules: style prefix first, mascot anchor for host scenes, zero baked-text triggers
// (no diagram/chart/icons/bubbles/scrolls-with-writing/blackboard-writing/calendar/seal-letters).
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'simple_itihash_002_first_language');
const PJ = path.join(PROJ, 'project.json');

const PREFIX = 'Sticky-man stick-figure cartoon, smooth plain round heads with simple dot eyes, thin black stick arms and legs, thick outlines, flat warm colors, full-scene composition with painted background, ';
const HOST = 'Time Chronicler, a bald elderly stick-man scholar with white side hair, long white beard, small glasses and brown robe, holding an old book and a wooden torch (match the attached character design exactly), ';
const NEG = ' --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, sticker, die-cut, white border outline, floating cutout, photorealism, detailed anatomy';
const NEG_HOST = NEG + ', no clock face, no clock head, no egg head';

// scene_id -> { h: hostPresent(bool), b: body }
const P = {
1:{h:1,b:'standing in his vast cosmic history library among towering bookshelves of blank leatherbound tomes, holding a glowing quill and torch, smiling warmly at camera, warm comic lighting'},
2:{h:1,b:'leaning close in his moonlit cosmic library at night whispering to camera with finger on lips, glowing question-mark shapes floating above the bookshelves, warm lamp glow'},
3:{h:0,b:'modern cartoon teenager sitting on a sofa laughing while texting on a smartphone, blank rounded thought clouds floating overhead with simple smiley shapes'},
4:{h:1,b:'opening a large blank illuminated scroll with glowing edges in his cosmic library, gentle respectful smile, warm golden lighting'},
5:{h:0,b:'planet earth one hundred thousand years ago at night, misty primeval forest under starry skies, complete silent stillness, no humans, no buildings'},
6:{h:0,b:'dramatic close-up of a shivering caveman opening his mouth wide at dawn, glowing golden sound waves flowing out into the morning sky'},
7:{h:0,b:'dry african savanna with acacia trees, panicked vervet monkey pointing at a swooping eagle while another monkey below screeches at a lurking leopard'},
8:{h:0,b:'two relaxed monkeys lounging on tree branches wearing sunglasses sipping coconut juice, one dreaming of a leopard face inside a soft dream cloud'},
9:{h:0,b:'newborn baby in a wooden cradle with glowing light threads inside its head, loving mother cooing beside the cradle, soft warm nursery light'},
10:{h:0,b:'split scene: puzzled monkey staring at the moon on one side, clever humans sitting around a campfire acting out a story with big fire shadows on the other'},
11:{h:0,b:'sun-drenched african savanna, two funny cavemen crouching behind yellow bushes peeking at the giant furry rear of a huge mammoth'},
12:{h:0,b:'close-up of a caveman making frantic exaggerated silent mime gestures with popped eyes, his companion looking clueless while swatting a fly with a stick'},
13:{h:0,b:'giant mammoth turning its head with a hilarious raised eyebrow, staring directly at two panicked cavemen hugging each other tightly'},
14:{h:0,b:'six-month-old baby babbling happily in a wooden crib, loving parents smiling and clapping, floating musical notes in the air'},
15:{h:1,b:'holding a glowing golden blank parchment showing painted tree roots merging into one single trunk, swirling light patterns around it'},
16:{h:0,b:'colossal spiral brick tower rising into storm clouds, tiny babylonian builders waving arms and arguing comically on wooden scaffolds'},
17:{h:1,b:'smiling thoughtfully while holding a glowing glass globe with branching light paths spreading across tiny continents'},
18:{h:0,b:'grand parisian lecture hall in the eighteen hundreds, gentlemen with top hats and long coats shouting and waving papers, red faces'},
19:{h:0,b:'stern podium president with an enormous white mustache slamming a huge wooden gavel onto stacked books, comic shockwaves, blank paper decree with a plain red seal shape beside him'},
20:{h:0,b:'stacks of books tumbling comically into a trash bin, a big blank paper decree stamped with a plain red seal floating above'},
21:{h:0,b:'german scholar max muller in victorian suit with beard, standing beside a blank chalkboard with funny simple dog doodles, laughing knowingly'},
22:{h:0,b:'scruffy caveman on all fours barking energetically at an extremely confused awkward-looking dog sitting in green grass'},
23:{h:0,b:'caveman stubbing his bare toe on a jagged rock and hopping in pain with a big red swollen toe, beside another caveman pinching his nose near a smelly skunk'},
24:{h:0,b:'lonely shepherd in a torn cloak leading goats through a desert sandstorm toward an isolated stone hut, two swaddled babies sleeping inside on straw'},
25:{h:0,b:'caveman tapping a hollow wooden log with a stick, glowing golden sound rings vibrating through the air around him'},
26:{h:0,b:'four muscular cavemen sweating and pulling a colossal round boulder with vine ropes in comic synchronized rhythm'},
27:{h:0,b:'cavemen cheering together on a hilltop after moving the boulder, jumping and high-fiving comically under a bright sun'},
28:{h:0,b:'egyptian pharaoh on a golden throne listening with wide eyes to two toddlers shouting, scholars unrolling long blank papyrus scrolls nearby'},
29:{h:1,b:'watching a cute dog wearing a graduation cap sitting at a school desk, staring puzzled at a blank blackboard with simple circles and lines, no writing anywhere'},
30:{h:1,b:'watching a caveman scratching his messy head in deep thought, a soft thought cloud above him showing a fish, a river wave and a sun, no writing'},
31:{h:1,b:'standing before a dark ancient king silhouette with glowing eyes sitting on a stone throne, a plain crescent seal emblem glowing on the wall, ominous torchlight'},
32:{h:0,b:'grand golden egyptian palace courtyard, pharaoh psamtik in a gold cobra crown standing proudly before tall carved stone columns with weathered patterns'},
33:{h:0,b:'egyptian royal chariot stopped in a humble mud village, guards gently carrying two swaddled baby bundles while the stern pharaoh watches'},
34:{h:0,b:'rugged hunter chief in a fur cloak teaching two toddlers hunt calls by a campfire at night, empty desert hut visible far behind'},
35:{h:0,b:'isolated stone shepherd hut on a barren desert hill with goats grazing on dry grass, shepherd standing outside covering his mouth with both hands'},
36:{h:0,b:'warm sunlight streaming through an open wooden door, two smiling toddlers crawling across a dirt floor with raised hands toward a shocked shepherd'},
37:{h:0,b:'grand egyptian throne room with priests and scholars in white linen robes unrolling blank papyrus scrolls, magnifying glasses in hand'},
38:{h:0,b:'pharaoh psamtik sitting slouched on his golden throne holding his head in comic distress, a loaf of bread on a golden plate beside him'},
39:{h:1,b:'presenting a moody medieval stone castle in sicily at dusk, emperor frederick in a velvet ermine cape writing on blank parchment by candlelight'},
40:{h:0,b:'stern medieval nurse in a white veil mechanically feeding a baby in a wooden cradle without smiling, cold gray stone room, rain on the window'},
41:{h:0,b:'empty wooden cradle beside an arched stone window with soft rain falling outside, a small glowing heart of warm light floating above the cradle'},
42:{h:0,b:'emperor akbar on a red sandstone throne in fatehpur sikri court, surrounded by scholars in turbans arguing, pointing toward a distant quiet pavilion'},
43:{h:0,b:'stormy scottish sea with crashing white waves, a small wooden rowboat carrying two swaddled babies toward a craggy rocky island'},
44:{h:0,b:'king james with crown and scottish tartan mantle standing on a royal ship, looking through a brass spyglass with a triumphant smile'},
45:{h:0,b:'king james in tartan cloak celebrating on a windy island cliff, two toddlers playing with wooden toys, courtiers cheering behind'},
46:{h:0,b:'two toddlers babbling on a sandy beach with wooden rattles and balls, a torn blank scroll rolling beside them turning into a toy, no writing anywhere'},
47:{h:0,b:'grand red sandstone courtyards of fatehpur sikri at sunrise, emperor akbar with emerald-studded turban and white pearls standing with dignity'},
48:{h:0,b:'secluded red sandstone pavilion with high carved screens and arched gates, silent guards with spears standing outside, peacocks in the garden'},
49:{h:0,b:'inside a sunlit courtyard emperor akbar walking with hands behind his back, observing silent children talking with hand gestures and puzzled looks'},
50:{h:0,b:'emperor akbar nodding thoughtfully to his chronicler abul fazl, both looking at a painted round mural showing families talking together in a village'},
51:{h:0,b:'emperor akbar inspecting a red sandstone courtyard where mute nurses feed toddlers, children gesturing with hands, carved arches above'},
52:{h:0,b:'modern paleontologist in field gear with khaki vest, kneeling beside a rock ledge displaying a row of ancient human skulls, desert dig site'},
53:{h:0,b:'archaeological trench inside a limestone cave, spotlight on a fossil skeleton, a delicate brush cleaning a tiny horseshoe-shaped throat bone'},
54:{h:0,b:'modern laboratory table with an ancient small bone beside a modern bone under a magnifying glass, both glowing with matching warm light'},
55:{h:1,b:'presenting a glowing double helix of golden light floating above london rooftops, family of many members holding hands below'},
56:{h:1,b:'showing a child head silhouette with glowing light paths flowing from the brain down to the tongue and lips, soft blue and gold glow, no labels'},
57:{h:1,b:'holding two ancient skulls side by side, a single identical glowing helix of light rising above both, cave torchlight'},
58:{h:0,b:'wild chimpanzee drinking at a forest stream, its throat glowing high with warm light, green jungle all around'},
59:{h:0,b:'human silhouette in profile with glowing throat, voice box light sitting low in the neck, clear sound waves flowing from the mouth'},
60:{h:0,b:'archaeologist holding a tiny ancient throat bone up against bright sunlight, eyes wide with amazement, cave entrance behind'},
61:{h:0,b:'a large balance scale in a void: on one side a plain gray feather, on the other side a glowing golden swirl of sound tipping the scale down heavily'},
62:{h:0,b:'young child speaking with bright sound ripples flowing from the mouth, one ripple gently cracking apart like thin ice'},
63:{h:0,b:'vast kalahari desert at sunrise, san hunters with bows tracking footprints in red sand, acacia trees far away'},
64:{h:0,b:'close-up of a san hunter pressing tongue to palate making a click, curved motion lines in the air, an antelope lifting its ears'},
65:{h:0,b:'san elders around a night fire mixing sharp mouth clicks with hand gestures, children copying them playfully, starry sky'},
66:{h:1,b:'presenting a scientist at a wooden desk with a world map covered in glowing dots, a thick blank book open beside him'},
67:{h:1,b:'listening to an african elder speaking, a hundred glowing dots of light floating from his mouth into the air'},
68:{h:0,b:'planet earth from space at night with glowing ripples of speech spreading across continents, seven bright clusters shining'},
69:{h:1,b:'walking along a dotted path leading away from africa on a giant floor map, glowing dots growing fewer along the path'},
70:{h:0,b:'harsh ice-age coastline with snow and gray waves, a small brave band of humans with torches crossing the frozen shore'},
71:{h:0,b:'three winding paths from a single camp: a small boat toward green river plains, footprints over mountains, footprints through forests'},
72:{h:0,b:'three different houses side by side: a stepped temple, a curved-roof house and a dome shrine, families waving from doorways'},
73:{h:1,b:'speaking with expressive hand gestures beside evening firelight, wild apes watching curiously from dark bushes'},
74:{h:1,b:'showing ape hands shaping fine signs in the air, early humans copying the gestures, soft cave firelight'},
75:{h:1,b:'standing in a dark night camp holding a spear, explaining how voice ripples replace hand signs, glowing sound waves from his mouth'},
76:{h:0,b:'a small lone man in tall grass facing huge lion and cheetah shadows, trembling with a tiny stick, vast savanna'},
77:{h:0,b:'millions of tiny humans uniting to raise high walls and stack giant pyramid blocks, blank scrolls and tools around, bright daylight'},
78:{h:0,b:'a glowing web of light threads connecting small huts and cities across the whole world, warm and hopeful'},
79:{h:1,b:'weighing a loaf of bread in one hand and sparkling desert click sounds in the other, smiling wisely at camera'},
80:{h:1,b:'sitting with a mother and child talking happily inside a cozy home, a warm heart of light glowing between them'},
81:{h:0,b:'wooden table with three blank aged scrolls and one modern book, a feather quill resting beside them, museum lamplight'},
82:{h:1,b:'pointing at floating glowing hearts of light sent by viewers, each heart blank and warm, night library background'},
83:{h:1,b:'opening grand ancient stone gates of nalanda with rows of blank book spines inside, monks with lamps, sunrise birds'},
84:{h:1,b:'waving goodbye cheerfully, library doors slowly closing with warm light streaming out, a plain bell shape glowing above'},
};

const d = JSON.parse(fs.readFileSync(PJ, 'utf8'));
if (d.style_preset !== 'PRESET_STICKY_MEME') throw new Error('style_preset changed! ' + d.style_preset);
let n = 0;
for (const s of d.scenes) {
  const p = P[s.scene_id];
  if (!p) throw new Error('missing fresh prompt for scene ' + s.scene_id);
  const host = s.dialogue_speaker === 'TIME_CHRONICLER';
  const mast = host ? HOST : '';
  const neg = host ? NEG_HOST : NEG;
  s.visual_prompt = PREFIX + mast + p.b + neg;
  n++;
}
fs.writeFileSync(PJ, JSON.stringify(d, null, 2), 'utf8');
console.log('fresh prompts written: ' + n + '/84, style_preset=PRESET_STICKY_MEME');
// ponytail: single-file prompt source, rerun to reapply
