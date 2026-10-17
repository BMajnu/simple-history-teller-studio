const fs = require('fs');
const path = require('path');

const ID = 'simple_itihash_004_first_city';
const DIR = path.join(__dirname, '..', 'projects', ID);
const WPS_BN = 1.7, WPS_EN = 2.3, WPS_HI = 1.7;
const estSec = (t, lang) => {
  const words = t.trim().split(/\s+/).length;
  const wps = lang === 'en' ? WPS_EN : lang === 'hi' ? WPS_HI : WPS_BN;
  return Math.max(6, Math.min(13, +(words / wps).toFixed(2)));
};

const HOST = 'TIME_CHRONICLER';
const NARRATOR = 'NARRATOR';

let scenes = [];
let beat = 0;
let sub = 0;
function NEW_BEAT() { beat++; sub = 0; return beat; }
function addScene(f) {
  const id = scenes.length + 1;
  if (f.sub === undefined) { sub++; f.sub = sub; }
  const bn = f.bn.trim(), en = f.en.trim(), hi = f.hi.trim();
  const dbn = estSec(bn, 'bn'), den = estSec(en, 'en'), dhi = estSec(hi, 'hi');
  const dur = +((dbn + den + dhi) / 3).toFixed(2);
  const isDyn = f.type === 'DYNAMIC_AI_VIDEO';
  const pad = String(id).padStart(4, '0');
  scenes.push({
    scene_id: id,
    parent_beat: f.beat,
    sub_id: f.sub,
    type: isDyn ? 'DYNAMIC_AI_VIDEO' : 'STATIC_IMAGE',
    dialogue_speaker: f.speaker,
    narration: { bn, en, hi },
    visual_prompt: isDyn
      ? 'Dynamic cartoon 2D animation in Simple History flat vector style, ' + f.vis + ', 24fps motion --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, photorealistic'
      : 'Simple History cutout vector cartoon, clean shapes, warm parchment tones, ' + f.vis + ', 16:9 historical illustration --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, photorealistic, stickman',
    asset_file: isDyn ? 'visual_assets/clip_shot_' + pad + '.mp4' : 'visual_assets/shot_' + pad + '.jpg',
    sfx: f.sfx,
    motion_effect: isDyn ? 'ai_video' : (f.motion || 'pan_right'),
    duration: dur,
    language_durations: { bn: dbn, en: den, hi: dhi },
    timestamp_start: 0,
    timestamp_end: dur,
    aistudio_voice: f.speaker === HOST ? 'Cruz' : (f.speaker === 'NARRATOR' ? 'Charon' : (f.speaker === 'CAT_NEIGHBOR' ? 'Aoede' : 'Fenrir')),
    style_prompt: f.speaker === HOST ? 'An Old Story Teller, Old Man voice' : (f.speaker === 'NARRATOR' ? 'deep, resonant, authoritative documentary narrator' : 'expressive historical character acting'),
    vfx_effect: 'none',
    audio_effect: 'studio_clean',
    audio_clips: {
      bn: { file: 'audio/bn/scene_' + pad + '.wav', duration: dbn, trim_in: 0, trim_out: 0, volume_db: 0, fade_in: 0, fade_out: 0 },
      en: { file: 'audio/en/scene_' + pad + '.wav', duration: den, trim_in: 0, trim_out: 0, volume_db: 0, fade_in: 0, fade_out: 0 },
      hi: { file: 'audio/hi/scene_' + pad + '.wav', duration: dhi, trim_in: 0, trim_out: 0, volume_db: 0, fade_in: 0, fade_out: 0 }
    }
  });
}

let b;

/* BEAT 1 - HOOK */
b = NEW_BEAT();
addScene({ beat: b, speaker: HOST, type: 'DYNAMIC_AI_VIDEO', sfx: 'cosmic_clock_whoosh_intro',
  vis: 'Time Chronicler, the bald elderly human scholar with long white beard, round glasses and brown robe holding torch and ancient book, emerging from a swirling starry time-tunnel where a tiny cluster of mud huts morphs into a glowing metropolis skyline, 16:9',
  bn: 'মানুষ এই পৃথিবীতে রয়েছে প্রায় দুই লাখ বছর, অথচ ভিড়ভাড়ে ভরা শহরের জীবন মাত্র ছয় থেকে সাত হাজার বছরের নতুন এক পরীক্ষা।',
  en: 'Humans have walked this planet for almost 200,000 years, yet life packed inside a city is only a six to seven thousand year old experiment.',
  hi: 'इंसान धरती पर लगभग दो लाख साल से है, फिर भी भीड़भाड़ भरे शहर की ज़िंदगी सिर्फ़ छह से सात हज़ार साल पुराना एक प्रयोग है।' });
addScene({ beat: b, speaker: HOST, type: 'DYNAMIC_AI_VIDEO', sfx: 'city_ambience_swelling',
  vis: 'elderly scholar torch sweeping an animated split world, half the crowd living inside claybrick walls, half roaming open fields, glowing map of river plains, 16:9',
  bn: 'আজ পৃথিবীর অর্ধেকেরও বেশি মানুষ শহরে বাস করে, তবু প্রথম শহর কোনটা — এই একটা প্রশ্নই আজও প্রত্নতাত্ত্বিকদের কড়া বিতর্কে জাগায়।',
  en: 'More than half of humanity lives in cities today, yet the plain question of which city came first still keeps archaeologists arguing hotly.',
  hi: 'आज धरती के आधे से ज़्यादा लोग शहरों में रहते हैं, फिर भी पहला शहर कौन-सा था, यही सवाल आज भी पुरातत्वविदों की कड़ी बहस है।' });
addScene({ beat: b, speaker: HOST, sfx: 'parchment_flip_soft',
  vis: 'three antique contender cards floating in torchlight: desert spring walled town, honeycomb rooftop town, walled mudbrick metropolis between two blue rivers, 16:9',
  bn: 'সিংহাসনে বসার আগে আজ মেদানে তিন দাবিদার — মরুঝরনার জেরিকো, ছাদে হাঁটা কাতালহায়ুক, আর দুই নদীর মাঝের উরুক।',
  en: 'Before any crown is handed out, the arena holds three contenders — desert-spring Jericho, roof-walking Çatalhöyük, and between-rivers Uruk.',
  hi: 'किसी ताज के सौंपे जाने से पहले मैदान में तीन दावेदार हैं — मरूझरने की यरीहो, छतों पर चलने वाला कैटलहॉयुक और दो नदियों के बीच उरुक।' });
addScene({ beat: b, speaker: HOST, sfx: 'throne_dust_settling',
  vis: 'flashback frame of a golden empty throne beside a village bonfire, elderly scholar pointing at it, continuity to previous episode, 16:9',
  bn: 'শেষ পর্বে দেখেছ মানুষ কেন প্রথম রাজা বানাল; আজ সেই ধারাতেই দেখব প্রথম দেয়াল, প্রথম রাজাহীন শহর আর প্রথম হিসাবখাতা কোথায় জন্মাল।',
  en: 'Last episode we watched why humans invented their first king; today on that same trail we find the first wall, the first kingless city and the first ledger.',
  hi: 'पिछले एपिसोड में देखा था इंसान ने पहला राजा क्यों बनाया; आज उसी धारा में पहली दीवार, पहला राजाविहीन शहर और पहला लेखा-खाता ढूँढेंगे।' });


/* BEAT 2 - JERICHO INTRO */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'desert_wind_spring_bubbling',
  vis: 'wide desert basin with a lone green strip and a powerful spring pool, palm trees, Jordan Valley floor with the Dead Sea far below, cluster of round mud huts, 16:9',
  bn: 'নাটকের প্রথম মঞ্চ জর্দান উপত্যকা — মৃত সাগরের ঠিক উত্তরে মরুর বুকে ফুটে ওঠা সবুজ ঝরনা-দ্বীপ, যে জায়গা ইতিহাসে জেরিকো।',
  en: 'Our first stage is the Jordan Valley — a green spring-island blooming in pure desert just north of the Dead Sea, known to history as Jericho.',
  hi: 'पहला मंच है जॉर्डन घाटी — मृत सागर के ठीक उत्तर में शुद्ध मरुस्थल में उगा हरा झरना-द्वीप, जिसे इतिहास यरीहो कहता है।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'flint_strike_clack',
  vis: 'hunter-gatherer family in simple furs laying down walking staffs beside the roaring spring, first smoke of a hearth rising, 16:9',
  bn: 'খ্রিস্টপূর্ব নয় হাজারের কাছাকাছি এক সময়ে, খননের তারিখে কিছুটা এদিক-ওদিক থাকলেও, শিকারি-সংগ্রাহক পরিবারেরা ঝরনার ধারে থিতু হলো — আর উঠে যায়নি।',
  en: 'Close to 9000 BCE — with the wide error bars of that date left alone — hunter-gatherer families settled by the spring and never packed up again.',
  hi: '९००० ईसा पूर्व के आसपास — उस तारीख की व्यापक सीमाएँ बची हुईं — शिकार-संग्रहकर्ता परिवार झरने के किनारे बस गए और दोबारा कभी नहीं गए।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'mudbrick_pat_pat',
  vis: 'square mudbrick houses stacking layer upon layer into a growing tell mound, cutaway side view with more than twenty occupation strata, 16:9',
  bn: 'কাঁচা-ইটের ঘর একটার ওপর আরেকটা শতাব্দী ধরে জমে ধীরে-ধীরে বিশের বেশি বসতি-স্তরের বিশাল এক ঢিবির জন্ম দিল।',
  en: 'Mudbrick houses, laid one atop another for centuries, slowly built a settlement mound of more than twenty stacked occupation layers.',
  hi: 'सदियों तक एक के ऊपर एक रखी कीचड़-ईंटों के घर धीरे-धीरे बीस से ज़्यादा बसती परतों का विशाल टीला बन गए।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'site_measure_tape',
  vis: 'surveyor ropes stretching over the settlement footprint, tiny human figures scattered across the enclosure, 16:9',
  bn: 'সবার আগে জায়গার সৎ হিসাব — এই প্রথম বসতির সীমাবদ্ধ জায়গা ছিল মাত্র ২.৪ হেক্টর, কোনো মহানগরের ছবি নয়।',
  en: 'An honest first fact of ground: this early settlement was fenced to just 2.4 hectares — no grand metropolis picture at all.',
  hi: 'ज़मीन की ईमानदार पहली हक़ीक़त: पहली बसती सिर्फ़ २.४ हेक्टेयर में सिमटी थी — कोई महानगर की तस्वीर नहीं।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'stone_drag_groan_start',
  vis: 'villagers lifting large undressed stones as a straight line of wall foundation starts to grow, collective gathering mood, 16:9',
  bn: 'তারপর এই সাধারণ ঝরনা-গ্রামটাই বানিয়েছিল এমন এক কীর্তি যা কোনো পৃথিবী আগে দেখেনি — স্বতন্ত্র পাথরের দেয়াল আর ওঠা এক টাওয়ার।',
  en: 'Then this plain spring village pulled off something no world had ever witnessed — a free-standing stone wall with a rising stone tower.',
  hi: 'फिर उसी साधारण झरना-गाँव ने कर दिखाया वह कारनामा जो कभी कोई दुनिया नहीं देखी थी — स्वतंत्र पत्थर की दीवार और उठता पत्थर का टावर।' });


/* BEAT 3 - TOWER SPECS */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'stone_wall_raise_rumble',
  vis: 'hundreds of stone blocks being packed and lifted quickly along a growing circular perimeter wall, dust rising, 24fps motion',
  bn: 'গ্রামের চারপাশে দাঁড়াল বিশাল পাথরের পরিধি-দেয়াল — প্রায় ৩.৬ মিটার উঁচু, নীরে ১.৮ মিটার পুরুত্বে ভার বাঁধা।',
  en: 'Around the village rose a massive stone perimeter wall — roughly 3.6 metres tall, resting on a base 1.8 metres thick.',
  hi: 'गाँव के चारों ओर खड़ी हुई विशाल पत्थर की परिधि-दीवार — लगभग ३.६ मीटर ऊँची, १.८ मीटर मोटी नींव पर टिकी।' });
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'stone_cone_shootup_epic',
  vis: 'time-lapse of a conical stone tower growing floor by floor beside the wall, raw log scaffolding, villagers hauling baskets, 24fps motion',
  bn: 'দেয়ালের ভেতরে উঠে এল আরও অদ্ভুত এক গোল টাওয়ার — প্রায় ৮.৫ মিটার উঁচু কাঁচা পাথরের, মানুষের ইতিহাসের প্রথম স্মারক-ইমারত।',
  en: 'Behind it rose something stranger still — a solid round tower about 8.5 metres high, the first monumental building of human history.',
  hi: 'उसके पीछे उठा कोई और अजीब ढाँचा — लगभग ८.५ मीटर ऊँचा पत्थर का गोल टावर, इंसानी इतिहास की सबसे पहली स्मारकीय इमारत।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'staircase_creak_step',
  vis: 'cutaway interior of the conical tower showing a winding internal stone staircase with 22 steps and plastered walls, a torch figure climbing, 16:9',
  bn: 'ভেতরে ঘুরে উঠত পাথরের সিঁড়ি — ঠিক ২২টি ধাপ, তাজা পলেস্তারা-মাখা দেয়াল ধরে দুই পাশ ছুঁয়ে ওঠা।',
  en: 'Inside it wound a stone staircase of exactly 22 steps, climbing along walls coated in fresh plaster.',
  hi: 'अन्दर लिपटी थी ठीक २२ सीढ़ियों वाली पत्थर की सीढ़ी, ताज़ा पलस्तर से लिपटी दीवारों के साथ ऊपर चढ़ती हुई।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'heavy_stone_clank_sweat',
  vis: 'line of sweating villagers offloading basket after basket of stones at the tower base, tally marks scratched on a clay board, 16:9',
  bn: 'খাটুনির হিসাব চোখ ধাঁধায় — প্রায় ১,০০০ টন পাথর, যা আনুমানিক ১১,০০০ কর্ম-দিনের সম্মিলিত শ্রমে উঠে আসত।',
  en: 'The labour bill is staggering: nearly 1,000 tons of stone carried up through an estimated 11,000 working-days of shared toil.',
  hi: 'मेहनत का हिसाब चौंकाने वाला है: लगभग १००० टन पत्थर, अनुमानित ११,००० कार्यदिनों की साझी मेहनत से ऊपर उठाया गया।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'pyramid_contrast_gasp',
  vis: 'stone tower on the left dwarfing a faint ghost image of the great pyramids on the right horizon with a floating sand arrow for the time gap, 16:9',
  bn: 'মিশরের বিখ্যাত পিরামিড দাঁড়াবে প্রায় ৫,৫০০ বছর পরে — ততদিনে এই পাথরের টাওয়ার বহু যুগের পুরনো হয়ে থাকবে।',
  en: 'The famous pyramids of Egypt rise almost 5,500 years later — by that time this stone tower was already ages old.',
  hi: 'मिस्र के प्रसिद्ध पिरामिड करीब ५,५०० साल बाद खड़े होते हैं — तब तक यह पत्थर का टावर कई युग पुराना हो चुका था।' });


/* BEAT 4 - TOWER MYSTERY */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'empty_plain_wind',
  vis: 'empty desert landscape in every direction from the top of the stone tower, no enemy camp visible anywhere, watchful mood, 16:9',
  bn: 'প্রথম রহস্য: ওই যুগে জেরিকোর চারপাশে একটাও শত্রু-শিবির জানা যায়নি — তাই সাদামাটা দুর্গ-তত্ত্বে টান পড়তে হয়।',
  en: 'Mystery one: no enemy camp is known anywhere near Jericho in that era — so the plain fort theory starts to wobble.',
  hi: 'पहला रहस्य: उस युग में यरीहो के आसपास कोई शत्रु-शिविर ज्ञात नहीं — इसलिए सादा किला-सिद्धांत ढीला पड़ने लगता है।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'flood_mud_stream',
  vis: 'rain-swollen winter mudflow sliding against the outer wall base, churning gully water, villagers peering down from the rampart, 16:9',
  bn: 'দ্বিতীয় তত্ত্ব: কাদাপ্লাবনের দিকে সবচেয়ে মোটা এই দেয়াল, যুদ্ধের ঢাল নয় — বরং বন্যা আর কাদা ঠেকানোর বাঁধ।',
  en: 'Theory two: thickest toward the mudflow side, the wall worked as a flood and debris barrier rather than a shield for war.',
  hi: 'दूसरा सिद्धांत: कीचड़-बहाव की ओर सबसे मोटी उस दीवार का काम युद्ध की ढाल नहीं, बाढ़ और कीचड़ रोकने का बाँध था।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'stone_hollow_thud',
  vis: 'searching brush passing over the empty interior of the tower base, no graves, cool pale light, 16:9',
  bn: 'তৃতীয় ধারণাও ভেঙে পড়ে: ভেতরে একটাও কবর পাওয়া যায়নি — সুতরাং এই ইমারত কবর বলে দাবি আজও নেই।',
  en: 'Theory three falls too: not one burial was found inside — so the claim that the monument was a tomb stands nowhere.',
  hi: 'तीसरा दावा भी बिखरता है: भीतर एक भी समाधि नहीं मिली — यह इमारत कब्र थी, यह दावा कहीं नहीं टिकता।' });
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'solstice_shadow_roll_epic',
  vis: 'cinematic dusk sky, huge shadow of a sacred mountain rolling slowly across a mudbrick village, first touching the tall stone tower, then swallowing the houses, torch glow, 24fps motion',
  bn: '২০১১ সালে গবেষকেরা দেখালেন — গ্রীষ্মের সবচেয়ে লম্বা দিনের সূর্যাস্তে কুরুন্তুল পাহাড়ের ছায়া সবার আগে এই টাওয়ারেই পড়ে।',
  en: 'In 2011 researchers showed that at summer-solstice sunset the shadow of nearby Mount Quruntul strikes this very tower first.',
  hi: '२०११ में शोधकर्ताओं ने दिखाया: ग्रीष्म-अयनांत के सूर्यास्त पर नज़दीक के कुरुन्तुल पहाड़ की छाया इसी टावर पर सबसे पहले गिरती है।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'awe_vs_fear_choir_low',
  vis: 'villagers pressing hands together on the tower top at night under stars, one elder guiding, quiet determination, 16:9',
  bn: 'ওই দুই গবেষকের পাঠ — টাওয়ার এক সামূহিক জোয়ার: ভয় বদলে যায় সাজানো শ্রম-কাজে সবাইকে জড়ানোর হাতিয়ার।',
  en: 'Those two researchers read the tower as shared mobilisation — shared fear converted into a tool that binds everyone into organised labour.',
  hi: 'उन दो शोधकर्ताओं का पढ़ना है: टावर एक सामूहिक जुटाव था — साझा भय व्यवस्थित श्रम में सबको बाँधने का साधन बना।' });
addScene({ beat: b, speaker: HOST, sfx: 'scroll_tally_flip',
  vis: 'giant clay inquiry board with two hanging counters bearing only tally marks, one dense and one sparse, no readable letters, 16:9',
  bn: 'জনসংখ্যার প্রশ্নেও হিসাব খোলা রাখা চলে — কয়েক প্রাক্কলন ৪০০ থেকে ৯০০ বাসিন্দা, আবার কেনিয়নের পুরনো মাপ ৩,০০০ থেকে ৪,০০০।',
  en: 'Population numbers stay openly swinging: some reconstructions give 400 to 900 residents, while the old Kenyon estimate said 3,000 to 4,000.',
  hi: 'जनसंख्या के अनुमान खुले घूमते रहे: कुछ गणनाएँ ४०० से ९०० निवासी बताती हैं, जबकि केनियन का पुराना अनुमान ३,००० से ४,००० था।' });


/* BEAT 5 - KENYON VERDICT */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'brush_excavate_scrub',
  vis: 'solemn female archaeologist persona in 1950s field blouse and headscarf brushing dust from the conical stone tower, kindly caricature, no real face, 16:9',
  bn: '১৯৫২ থেকে ৫৮ সালের বড় খননে ব্রিটিশ প্রত্নতাত্ত্বিক ক্যাথলিন কেনিয়ন এই দেয়াল-টাওয়ারের প্রকৃত রূপ প্রথম উজাড়ে তুললেন।',
  en: 'Between 1952 and 1958 the British archaeologist Kathleen Kenyon excavated and first bared the true form of wall and tower.',
  hi: '१९५२ से ५८ की बड़ी खुदाई में ब्रितानी पुरातत्वविद कैथलीन केनियन ने इस दीवार-टावर का असली रूप पहली बार उघाड़ा।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'press_clapper_thud',
  vis: 'vintage newspaper page with a glowing headline block left blurred and illegible, rosette medal motif, 16:9',
  bn: 'কেনিয়নের ঘোষণায় জেরিকো দুনিয়ায় দাবি তুলল — বিশ্বের জানা সভ্যতার সবচেয়ে পুরনো শহর বলে গর্বের মুকুট।',
  en: 'In the Kenyon announcement Jericho carried the proud claim of being the oldest city known in the world.',
  hi: 'केनियन की घोषणा में यरीहो ने दुनिया का सबसे पुराना ज्ञात शहर होने का गर्व भरा दावा उठाया।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'scholar_deny_pencil_tap',
  vis: 'chalk circle around a stylized city glyph being crossed out with a red X, small village huts drawn inside, 16:9',
  bn: 'আজকের পাঠ ঘুরেছে: নব্য-প্রস্তরযুগের জেরিকো ছিল বিশাল এক গ্রাম — প্রকৃত শহরের জন্ম সেখানে খ্রিস্টপূর্ব ৩০০০-এর কাছে।',
  en: 'Modern scholarship has turned the plate: Neolithic Jericho was an enormous village, and a true city there only appears near 3000 BCE.',
  hi: 'आधुनिक अध्ययन ने पलट दिया: नव-पाषाण युगीन यरीहो एक विशाल गाँव था, असली शहर वहाँ ३००० ईसा पूर्व के नज़दीक ही सामने आता है।' });
addScene({ beat: b, speaker: HOST, sfx: 'question_mark_bell',
  vis: 'elderly scholar holding up a chalk slate with three coded glyphs carved as tower, rooftops and stepped temple, 16:9',
  bn: 'তাহলে মুকুট কাউকে পরিয়ে না-দিয়ে আগে দেখি আরও বিচিত্র এক শহর — যার কোনো রাস্তাই ছিল না।',
  en: 'So before crowning any oldest-city champion, we must first cross a stranger kind of city — one that owned no streets at all.',
  hi: 'तो किसी को सबसे पुराने-शहर का ताज पहनाने से पहले एक अजीब प्रकार के शहर से गुज़रें — जिसकी कोई सड़क ही नहीं थी।' });

/* BEAT 6 - CATAL INTRO */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'anatolian_plain_wind',
  vis: 'flat golden wheat plain of Konya with a double-humped mound rising, twin volcano silhouette far back, a surveyor sketching, 16:9',
  bn: 'দ্বিতীয় প্রার্থী তুরস্কের কোনিয়া সোনালি সমতলে — দুই-চূড়া উঁচু ঢিবি কাতালহায়ুক, নামের মানেই দো-ভাগ ঢিবি।',
  en: 'Our second contender rises on the golden Konya plain of Turkey — the twin-peaked mound of Çatalhöyük, a name meaning forked mound.',
  hi: 'दूसरा दावेदार तुर्की के सुनहरे कोन्या मैदान पर खड़ा है — दो-शिखर वाला ढेर कैटलहॉयुक, जिसका नाम है जुड़ा ढेर।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'excav_brush_sweep',
  vis: 'bustling digger team with brushes over honeycomb wall tops, blue survey grid tapes stitched across the site, 16:9',
  bn: 'মেল্লার্ট ১৯৫৮ সালে সুর খুললেন; ১৯৬১ থেকে ৬৫ সালের খনন উঁচু করল ১৮ স্তরের নগর-জীবন।',
  en: 'Mellaart struck the first note in 1958, and digs from 1961 to 1965 lifted an 18-level town back into daylight.',
  hi: 'मेलार्ट ने १९५८ में पहली ताक लगाई, और १९६१ से ६५ की खुदाइयों में १८ स्तरों का कस्बा निकला।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'town_age_announce_drum',
  vis: 'layered timeline ribbon stretching from 7400 to 6200 BCE with a glowing band of fourteen centuries, 16:9',
  bn: 'খ্রিস্টপূর্ব ৭৪০০ থেকে ৬২০০ সাল — টানা প্রায় ১,৪০০ বছরের অবিচ্ছিন্ন মানুষের বসতি একই ঢিবিতে।',
  en: 'From 7400 down to 6200 BCE — nearly 1,400 years of unbroken human living on that very same mound.',
  hi: '७४०० से ६२०० ईसा पूर्व तक — उसी टीले पर लगभग १४०० साल लगातार इंसानी बसाव।' });
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'roof_walk_slip_path',
  vis: 'stylized first-person walk across a wavy rooftop plain, villagers carrying grain baskets overhead, then sliding down a wooden ladder into a smoky interior, 24fps motion',
  bn: 'সবচেয়ে অদ্ভুত সত্য: এই নগরে রাস্তা ছিলই না — ঘরগুলো পিঠে-পিঠে ঠাসা, আর ছাদই ছিল পথ।',
  en: 'Here stands the strangest truth: this town had no streets — houses stood glued back to back, and rooftops were the roads.',
  hi: 'यहाँ सबसे अजीब सत्य: इस कस्बे में कोई सड़क नहीं थी — घर पीठ से पीठ जुड़े थे, और छतें ही रास्ते थीं।' });


/* BEAT 7 - CATAL LIFE */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'hearth_fire_crackle',
  vis: 'crowded single cozy room with hearth fire, small stools, raised sleeping platforms and granary shelves, family of eight, 16:9',
  bn: 'একেকটা একক ঘরে ঠাসা থাকত ৫ থেকে ১০ জনের পরিবার — চুলা, চাটাই, ধান-ভাঁড়ার সব একই বেঁচে থাকার ঘরে।',
  en: 'A single house held 5 to 10 people — hearth, mats and grain stores all jammed into that one breathing space.',
  hi: 'एक ही घर में ५ से १० लोग रहते थे — चूल्हा, चटाई और अनाज भंडार सब उसी एक कमरे में समेटे हुए।' });
addScene({ beat: b, speaker: 'CAT_NEIGHBOR', sfx: 'rooftop_greeting_warm',
  vis: 'neighbour woman in fringed wool wrap swinging a grain basket up onto the roof edge, waving openly, 16:9',
  bn: 'প্রতিবেশীর ঘরে যেতে চাও? কাঠের সিঁড়িটা ধরো — আমাদের শহরে রাস্তা মানেই ছাদ, আর চুলার ধোঁয়াতেই চেনা যায় প্রতিবেশী।',
  en: 'Visiting a neighbour? Take the wooden ladder — in our city the road means a rooftop, and hearth-smoke tells you whose roof it is.',
  hi: 'पड़ोसी के घर जाना है? लकड़ी की सीढ़ी पकड़ो — हमारे शहर में रास्ता मतलब छत, और चूल्हे का धुआँ बताता है किसकी छत है।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'burial_soil_sift',
  vis: 'family carefully laying a wrapped ancestor body into a stone-lined pit cut into the house floor, room still furnished and dusty, 16:9',
  bn: 'মৃতরা ঘর ছাড়ত না — পরিবার তাদের কবর দিত ঠিক ওই মেঝেতেই, যার ওপর বেঁচে থাকা মানুষ রোজ হাঁটত।',
  en: 'The dead never left the house — families buried them right beneath the floor the living kept walking on every day.',
  hi: 'मरे हुए घर नहीं छोड़ते थे — परिवार उन्हें उसी फर्श के नीचे दफ़न करता था, जिस पर ज़िंदा लोग हर रोज़ चलते थे।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'plaster_bowl_pat',
  vis: 'close cutaway of floor plaster layers stacked thin like pale marble rings, hand smoothing fresh white coating, 16:9',
  bn: 'একই ঘরের মেঝে প্রায় ৪৫০ বার পর্যন্ত নতুন পলেস্তারা পেত — এক লম্বা মানুষ-জীবনের যত্নের ফসল।',
  en: 'A single house floor could be freshly plastered up to 450 times — a harvest of care across one long human lifetime.',
  hi: 'एक ही घर की फर्श लगभग ४५० बार नई पलस्तर पाती थी — एक लंबे मानव-जीवन की देखभाल की फसल।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'house_lifetime_tick',
  vis: 'multi-decade house cross-section with six ghost layers stacked, furniture repeated faintly like echoes, 16:9',
  bn: 'এক ঘর এক পরিবারকে আশ্রয় দিত ৪৫ থেকে ৯০ বছর, আর ঠিক সেই জায়গাতেই প্রায় ছয়বার নতুন করে উঠত।',
  en: 'One house sheltered a family for 45 to 90 years, and rose anew about six times on exactly the same spot.',
  hi: 'एक घर एक परिवार को ४५ से ९० साल आश्रय देता था, और ठीक उसी जगह लगभग छह बार नया उठता था।' });

/* BEAT 8 - THE KINGLESS CITY */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'ghost_palace_chalk_draw',
  vis: 'wide aerial of the vast honeycomb town as dashed chalk outlines float where a palace, temple and elite quarter would normally stand, then fading away empty, 24fps motion',
  bn: '১৩.৫ হেক্টর বিস্তারেও খুঁজে পাওয়া গেল না কোনো প্রাসাদ, কোনো মন্দির, কোনো ধনী-পাড়া — কোথাও কিছু নেই।',
  en: 'Across this enormous 13.5 hectare town excavators found no palace, no temple, no wealthy quarter — nothing, nowhere.',
  hi: 'इस विशाल १३.५ हेक्टेयर कस्बे में खुदाई को कहीं महल नहीं मिला, कोई मंदिर नहीं, कोई अमीर-मोहल्ला नहीं।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'equal_bread_scale_tap',
  vis: 'two skeleton sketches side by side with equal-size bread loaves on a scale and tick marks of matched nutrition, 16:9',
  bn: 'হাড়ের পরীক্ষা আরও জোরালো তথ্য জোগাল — পুরুষ ও নারীর পুষ্টির মাপ ছিল প্রায় একেবারে সমান।',
  en: 'Skeleton studies added another firm fact: men and women were eating at almost perfectly equal nutrition levels.',
  hi: 'कंकाल अध्ययन ने और पक्का तथ्य जोड़ा: पुरुष और स्त्री का पोषण लगभग पूरी तरह समान माप पर था।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'theories_tumble_crash',
  vis: 'seated plump goddess figurine breaking apart into drifting sand while a younger brush-holder observes, sideways collapse stylized, 16:9',
  bn: 'মেল্লার্টের মাতৃ-দেবী-শাসকের গল্প ভেঙে পড়ল — ১৯৯৩ সাল থেকে হাইডারের নতুন খনন সেই পড়া বাতিল করল।',
  en: 'The grand mother-goddess-ruler story of Mellaart collapsed — fresh digging by Hodder from 1993 cancelled that reading.',
  hi: 'मेलार्ट की मात-देवी-शासक कहानी टूट गई — १९९३ से हाइडर की नई खुदाई ने वह पाठ रद्द कर दिया।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'census_board_swap',
  vis: 'old-style census board with two hanging counters, one dense tally and one sparse, both without readable letters, 16:9',
  bn: 'গণনার সংখ্যায় একটিও নিশ্চিত নয়: পুরনো হিসেব ৩,৫০০ থেকে ৮,০০০; আর ২০২৪ সালের মাপ মাত্র ৬০০ থেকে ৮০০।',
  en: 'The headcount refuses one number: older estimates gave 3,500 to 8,000 residents, while a 2024 recount argues only 600 to 800.',
  hi: 'गिनती एक संख्या नहीं मानती: पुराने अंदाज़े ३,५०० से ८,००० निवासी कहते हैं, जबकि २०२४ की गिनती सिर्फ़ ६०० से ८००।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'dna_helix_soft_shimmer',
  vis: 'glowing double helix ribbon made of clay beads passing from an older woman to a younger woman across outlines of houses, 16:9',
  bn: '২০২৫ সালের এক জিন-গবেষণা জুড়ল — ঘরে বসবাস মা থেকে মেয়ের ধারায় চলত, মাতৃসূত্রের ইঙ্গিত।',
  en: 'One 2025 genetic study adds a line: house residence passed from mother to daughter — a matrilineal hint.',
  hi: '२०२५ का एक जीन-अध्ययन जोड़ता है: घर की बसत माँ से बेटी की धारा में चलती थी — मातृसूत्रीय संकेत।' });


/* BEAT 9 - CATAL VERDICT */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'abandon_ghost_dissolve',
  vis: 'honeycomb town fading into hill hollows at dusk with wooden ladders propped empty in silence, soft ghost dissolve, 16:9',
  bn: 'প্রায় ১,৪০০ বছর পড়ে সবাই নীরবে চলে গেল কাছের পশ্চিম ঢিবিতে — কেন গেল, সেই ফাইল আজও খোলা।',
  en: 'After some 1,400 years the residents quietly crossed to the nearby West Mound — why, is still an open file.',
  hi: 'करीब १४०० साल बाद सब चुपचाप चले गए पड़ोस के पश्चिमी टीले पर — क्यों गए, फ़ाइल आज तक खुली है।' });
addScene({ beat: b, speaker: HOST, type: 'DYNAMIC_AI_VIDEO', sfx: 'insight_bell_bright',
  vis: 'elderly scholar placing a small equal-arm balance scale onto the raised palms of two stone-age cutout figures, glow of insight, 24fps motion',
  bn: 'এখানেই অসম্ভবতম সত্য — এত বড়ো ছাদ-শহর বেঁচে রইল অবিচ্ছিন্ন, অথচ একটাও মুকুট কেউ পরেনি, এটাই খননের সবচেয়ে বড় শিক্ষা।',
  en: 'Here sits the most impossible truth: a settlement this enormous survived without any crown at all — the deepest lesson of excavation.',
  hi: 'यहीं बैठी है असंभव सच्चाई — इतना बड़ा नगर जीवित रहा, बिना एक भी ताज — खुदाई का सबसे बड़ा सबक।' });
addScene({ beat: b, speaker: HOST, sfx: 'river_horizon_wink',
  vis: 'elderly scholar turning his torch south toward a distant twin-river floodplain glowing faintly on the horizon, 16:9',
  bn: 'মুকুটের আসল জন্মভূমি অপেক্ষায় ছিল দক্ষিণে — দুই নদীর ভেতরে, যেখানে সব নির্ণায়ক শুরু হবে।',
  en: 'But the true birthplace of the crown was waiting deeper south — right between the two muddy rivers.',
  hi: 'परन्तु ताज का असली जन्म-स्थल दक्षिण में बैठा था — दो कीचड़ नदियों के ठीक बीच।' });

/* BEAT 10 - URUK INTRO */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'tigris_wide_flow_hum',
  vis: 'map-wide flat plain of southern Iraq with two broad blue river lines converging toward the unseen gulf, marsh reeds in foreground, 16:9',
  bn: 'তৃতীয় প্রার্থী দক্ষিণে আরও গভীর — দক্ষিণ ইরাকের দলদল-ভরা জমি, দুই বড় নদীর ঠিক মাঝে।',
  en: 'The third contender lies deeper south — the marshy flats of southern Iraq, wedged between two great rivers.',
  hi: 'तीसरा दावेदार और दक्षिण में — दक्षिण इराक की दलदलभरी ज़मीन, दो बड़ी नदियों के ठीक बीच।' });
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'reed_raft_glide_water',
  vis: 'flat reed boat gliding along a tree-lined marsh canal between the two parallel rivers, fish leaping, date palms, 24fps motion',
  bn: 'ছোটো সরজের নৌকা চলত হাতে-খোদা খালের ধারে — পানির নিজস্ব শাসন চালাত এই সমতল, জালের মতো খাল বেঁধেছিল পুরো এলাকা।',
  en: 'Little reed boats travelled along hand-dug canal lines cut through the flat marsh — canals netting the whole plain like a web.',
  hi: 'छोटी सरकंडे से बनी नावें चलती थीं हाथ-खोदी नहर पर — पानी का अपना शासन चलाता था यह मैदान, नहरों ने पूरे इलाके को जाल की तरह बाँधा था।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'two_village_merge_stamp',
  vis: 'two adjacent village clusters each with a small temple core sliding together and fusing into one larger blob with twin glowing cores, 24fps animation',
  bn: 'উবাইদ যুগের দুই পুরোনো গ্রাম উনুগ আর কুল্লাবা মিশে গেল একসঙ্গে — সেই মিলনের নাম উরুক।',
  en: 'Two old Ubaid villages — Unug and Kullaba — merged into one, and that union took the name Uruk.',
  hi: 'उबैद युग के दो पुराने गाँव ऊनुग और कुल्लाबा मिलकर एक बने — उस मिलन का नाम उरुक।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'silt_rain_harvest_sweep',
  vis: 'vast checkerboard of narrow flood fields beside levees, amber barley heads heavy with silt-boost, farmers bending with sickles, 16:9',
  bn: 'নিয়মিত বর্ষায় নামত তাজা কাদা — যবের ফসল বড় ও বড় হতে লাগল, গাঁয়ের মুখ ছাড়িয়ে।',
  en: 'Regular floods laid silt so fresh that barley harvests kept growing past what village mouths could swallow.',
  hi: 'लगातार बारिश में उतरती थी ताज़ा कीचड़ — जौ की फसल बड़ी और बड़ी होती गई, गाँव के मुँह से बाहर।' });


/* BEAT 11 - TEMPLE ECONOMY */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'granary_intro_clank',
  vis: 'temple courtyard with grain pouring into giant communal clay bins, a priest-warden pressing a clay seal on the bin mouth, no readable text, 16:9',
  bn: 'বাড়তি শস্য বছরের পর বছর মন্দিরের ভাণ্ডারে ঢুকতে থাকল, টনের পর টন জমা হয়ে — ভাণ্ডার ভরে উঠত প্রতি মৌসুমে।',
  en: 'Surplus grain kept pouring year after year into temple storehouses, piling ton upon ton — stores filling every season.',
  hi: 'ज़रूरत से ज़्यादा अनाज साल-दर-साल मंदिर के भंडारों में बहता रहा, टन पर टन जमा होता गया — हर मौसम भंडार भर उठते थे।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'priest_warden_stamp_sack',
  vis: 'priest-steward tying and stamping small ration bundles under the temple granary roof, no readable letters, 16:9',
  bn: 'মন্দিরের চাকর-পুরোহিতেরা রোজ হিসেব রাখল, আর নির্ধারিত ছোট ভাগে ভাগে সবার হাতে ফিরিয়ে দিল রেশন।',
  en: 'The temple priest-stewards kept the daily count and handed the share back out in sanctioned packet sizes.',
  hi: 'मंदिर के याजक-रखवाले रोज़ हिसाब रखते थे, और तय छोटे भाग-भाग में सबके हाथ राशि लौटाते थे।' });
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'cone_mosaic_flicker',
  vis: 'camera closing in on a temple wall with thousands of tiny baked clay cones in red, black and cream set point-outward, forming giant zigzag patterns glittering in sun, 24fps pan',
  bn: 'মন্দিরের দেয়ালে বিঁধত হাজার হাজার ছোট্ট পোড়া মাটির শঙ্কু — লাল-কালো-সাদায় বিশাল জিগজ্যাগ আলপনা আঁকা।',
  en: 'Temple facades bristled with thousands of coloured clay cones set point-outward, glittering as rainbow zigzag mosaics.',
  hi: 'मंदिर की दीवारों में धँसे थे हज़ारों रंगीन पकी मिट्टी के शंकु — लाल-काले-सफ़ेद में विशाल ज़िगज़ैग नक्शा।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'white_plaster_glint',
  vis: 'white-gypsum brick temple glowing atop a huge mud terrace, sunlight flaring off the whitewash, small figures climbing, 16:9',
  bn: 'খ্রিস্টপূর্ব ৩৩০০-এর কাছাকাছি উঠল আকাশ-দেবতা আনুর সাদা মন্দির — উঁচু ভিতের গায়ে ঝলমলে সাদা চুন।',
  en: 'The sky god Anu White Temple was raised near 3300 BCE on a high terrace, all in blinding whitewash.',
  hi: '३३०० ईसा पूर्व के नज़दीक उठा आकाश-देव अनु का सफ़ेद मंदिर — ऊँचे चबूतरे पर चमकदार सफ़ेद चूना।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'precinct_gate_wide_sweep',
  vis: 'huge walled administrative temple precinct with storerooms, writing benches and workshops, many staff carrying clay carriers, 16:9',
  bn: 'ঠিক পাশেই দেবী ইনান্নার বিশাল ইআন্না-অঞ্চল — ভাণ্ডারঘর, কাজঘর আর লেখক-মেজ ঠাসা ঘেরা জমি।',
  en: 'Beside it lay the vast Eanna precinct of goddess Inanna — a walled ground packed with stores, workshops and scribe tables.',
  hi: 'ठीक पास था देवी इनना का विशाल इअन्ना-क्षेत्र — भंडारघर, कार्य-हल और लेखक-मेजों से ठसी घेरी ज़मीन।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'gigantic_column_gasp',
  vis: 'large limestone temple 76 by 30 metres in cutaway scale with a ghost-drawn Parthenon beside it for size comparison, 16:9',
  bn: 'ওখানে চুন-পাথরের মন্দিরের মাপ ছিল ৭৬ বাই ৩০ মিটার — এথেন্সের পার্থেননের চেয়েও বড়।',
  en: 'Its Limestone Temple measured 76 by 30 metres — a shell bigger even than the later Parthenon of Athens.',
  hi: 'वहाँ चूना-पत्थर मंदिर का माप था ७६ बाइ ३० मीटर — एथेन्स के पार्थेनन से भी बड़ा।' });


/* BEAT 12 - URUK SCALE */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'city_ha_expand_waves',
  vis: 'aerial rings of new houses radiating outward like ripples from twin temple cores, outline territory crossing the 100 hectare mark, 24fps looped growth',
  bn: 'খ্রিস্টপূর্ব ৩৫০০-এর দিকে উরুকের বিস্তার ১০০ হেক্টর টেকে ছাপিয়ে উঠতে লাগল, নতুন মানুষের ঢেউ আর থামতেই চাইত না।',
  en: 'By about 3500 BCE the sprawl of Uruk surged past 100 hectares, and the wave of newcomers refused to stop.',
  hi: 'करीब ३५०० ईसा पूर्व उरुक का फैलाव १०० हेक्टेयर पार कर गया, और नए आने वालों की लहर थमती नहीं थी।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'crowd_market_buzz',
  vis: 'dense street scene with thousands of tiny cutout humans, market stalls, children chasing, smoke rising from ovens, 16:9',
  bn: 'দেয়ালের ভিতরে বাসত প্রায় ৫০ হাজার মানুষ, আর চারপাশের নেটওয়ার্ক মিলিয়ে ৮০ থেকে ৯০ হাজার।',
  en: 'About 50,000 people lived inside the wall, and 80,000 to 90,000 more across the wider network.',
  hi: 'दीवार के भीतर लगभग ५० हज़ार लोग बसते थे, और आसपास के नेटवर्क में ८० से ९० हज़ार।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'largest_settlement_hum',
  vis: 'world map sketched with a single glowing dot marked as the dominant settlement of its era, 16:9',
  bn: 'সে-সময় সমগ্র পৃথিবীর সব চাইতে বড় বসতি হয়ে উঠল উরুক — ইতিহাসের এক নতুন রেকর্ড, এমন রেকর্ড আগে কখনো হয়নি।',
  en: 'And Uruk rose to become the largest living settlement anywhere on Earth in that whole era — a record never seen before.',
  hi: 'और उरुक उस पूरे युग में धरती की सबसे बड़ी जीवित बसत बनकर उठा — ऐसा रिकॉर्ड पहले कभी नहीं हुआ।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'tape_measure_unroll',
  vis: 'two giant measuring strings draped over the walled city, one over a shorter inner block, one over a wider outer ring, both without letters, 16:9',
  bn: 'নগরের মাপেও হিসেব দোলে — দেয়ালের ভিতর ২৫০ হেক্টর, আর সবচেয়ে বিস্তারে ৪৫০ হেক্টর।',
  en: 'The city size swung openly too: 250 hectares inside the walled core, up to 450 hectares at its fullest.',
  hi: 'नगर का क्षेत्र भी खुला दोलता है: घिरी कोर में २५० हेक्टेयर, फैलाव में ४५० तक।' });

/* BEAT 13 - WALL AND GILGAMESH */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'wall_build_rhythm_hammer',
  vis: 'endless brick-stamping crew on a long wall line, mud bricks slotted briskly one above another, wall stretching to horizon, 24fps motion',
  bn: 'তুলল ৯ থেকে ৯.৫ কিলোমিটার লম্বা দেয়াল — ১২ থেকে ১৫ মিটার উঁচু, সবটা কাঁচা ইটের গাঁথুনি।',
  en: 'Then rose a city wall 9 to 9.5 kilometres long, standing 12 to 15 metres high in stamped mudbrick courses.',
  hi: 'फिर उठी ९ से ९.५ किलोमीटर लम्बी दीवार — १२ से १५ मीटर ऊँची, सारी कच्ची ईंटों की चिनाई।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'king_list_tablet_tap',
  vis: 'kinglist-style stone slab with a line of small crowned cutout figures topped by one sturdy bearded king holding a shovel over a wall outline, no letters, 16:9',
  bn: 'পরের যুগে গিলগামেশ উঠে আসলেন উরুকের রাজা — রাজা-তালিকায় লেখা ২৭ শতকের হিসেব, যা কিংবদন্তি।',
  en: 'A later age raised Gilgamesh as king of Uruk — a 27th-century entry in the king list, legend rather than excavation.',
  hi: 'बाद के युग ने गिलगमेश को उरुक का राजा उठाया — राजा-सूची में २७वीं सदी की प्रविष्टि, खुदाई नहीं किंवदंती।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'epic_scroll_recite',
  vis: 'bearded legendary king in period kilt pressing a hand on the towering wall under night torch light, legend mood, 16:9',
  bn: 'মহাকাব্য গেয়ে ওঠে — বীর উঠে দাঁড়ান উরুকের উঁচু দেয়ালের ওপরে, পুরো শহর চোখের ধারে।',
  en: 'The epic sings on — the hero stands tall upon the high rampart of Uruk, the whole city under his gaze.',
  hi: 'महाकाव्य गाता रहता है — वीर उरुक की ऊँची दीवार पर खड़ा है, पूरा शहर नज़र के नीचे।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'brick_archaeology_tablet',
  vis: 'cutaway of the brick wall with measurement overlay, the same outline transferred as a legend motif onto a clay tablet, 16:9',
  bn: 'আর প্রত্নতত্ত্ব বলে: ইটের সেই দেয়াল সত্যিই খ্রিস্টপূর্ব ৩০০০-এর কাছাকাছি দাঁড়াল — বাস্তব শহরের বাস্তব দেয়াল।',
  en: 'And archaeology answers: that brick wall truly stood near 3000 BCE — a real wall of a real city.',
  hi: 'और पुरातत्त्व जवाब देता है: ईंट की वह दीवार सचमुच ३००० ईसा पूर्व के नज़दीक खड़ी थी — असली शहर की असली दीवार।' });
addScene({ beat: b, speaker: 'URUK_KING', sfx: 'king_wall_survey_gruff',
  vis: 'sturdy early Sumerian ruler standing on the wall top, surveying the sprawling city inside with a level gaze, 16:9',
  bn: 'ওঠো আমার দেয়ালের ছাদে — সেখান থেকেই তোমার চোখে শহরটা মেপে নাও, তবেই বুঝবে শহর কত বড়।',
  en: 'Climb onto my wall top — from there alone let your eyes measure out my city, only then will you grasp how grand it stands.',
  hi: 'मेरी दीवार की छत पर चढ़ो — वहीं से अपनी आँखों से मेरा शहर नापो, तभी समझोगे शहर कितना बड़ा है।' });
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'throne_crown_settle',
  vis: 'sturdy ruler figure seated on a low gold-gilded dais, officials kneeling in circles around him, city wall silhouette behind through the doorway, 24fps slow push',
  bn: 'এখানেই প্রথম পর্বের ধারাটা পূর্ণ হয়: বাড়তি শস্য, মন্দিরের হিসেব আর বসে যাওয়া রাজা — একই দেয়ালের ভিতরে।',
  en: 'Here the episode-one thread completes: surplus grain, temple accounting and an installed king — all inside one wall.',
  hi: 'यहीं पहले एपिसोड का धागा पूरा होता है: बचा अनाज, मंदिर का हिसाब और बैठा राजा — एक ही दीवार के भीतर।' });


/* BEAT 14 - WRITING IS BORN */
b = NEW_BEAT();
addScene({ beat: b, speaker: HOST, sfx: 'ledger_tap_think',
  vis: 'elderly scholar with an abacus bead frame beside a clay tablet trio, tension lines on forehead, counting abstract cutout herds, 16:9',
  bn: 'কিন্তু ৫০ হাজার মানুষের মন পুরো মন্দিরের খাতা মনে রাখতে পারে না — চাই এক নতুন যন্ত্র।',
  en: 'But 50,000 human minds cannot hold a temple ledger in memory — numbers now demanded a new tool.',
  hi: 'परन्तु ५० हज़ार मानव-मन मंदिर का लेखा याद नहीं रख सकते — संख्या ने एक नया साधन माँगा।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'token_pile_click',
  vis: 'table covered with clay token counters in cone, sphere and disc shapes arranged in rows, a shepherd counting sheep tokens, 16:9',
  bn: 'মানুষ আট হাজার বছর ধরেই ঝাঁক ও শস্য মাপত আকৃতি-বদলা কাঁচা মাটির ছোট্ট টোকেনে — গোনার এই পদ্ধতি চলেছিল হাজার হাজার বছর।',
  en: 'People had already counted herds and grain with shaped clay tokens for eight thousand years — a counting method that ran for thousands of years.',
  hi: 'इंसान आठ हज़ार साल से झुंड और अनाज नापता आया था आकृतिबद्ध कच्ची मिट्टी के छोटे टोकन से — गिनने की यह विधि हज़ारों साल चली।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'clay_ball_wrap_thud',
  vis: 'hollow clay ball sealed shut with tokens rattling inside, impressed dot and shape marks showing outside, 24fps two-step animation',
  bn: 'খ্রিস্টপূর্ব ৩৫০০-এর আশপাশে ঋণ-টোকেন বন্ধ হতো খালি পোড়া মাটির বলে, বাইরে ছাপ ফুটে যাচাই হতো।',
  en: 'Around 3500 BCE debt-tokens were shut inside hollow baked-clay balls, verified by the marks pressed outside.',
  hi: '३५०० ईसा पूर्व के आसपास कर्ज़-टोकन बंद होते थे खोखली पकी मिट्टी की गेंद में, बाहर दबी छाप से जाँच होती थी।' });
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'tablet_impress_staccato',
  vis: 'reed stylus crafting bold wedge shapes across a cushion tablet as impressed circle and cone signs multiply down lines, 24fps rapid',
  bn: 'খ্রিস্টপূর্ব ৩২০০-এর দিকে টোকেনের বদলে নিল ভিতর-ছাপ — প্রথম লেখা জন্মাল হিসেব থেকেই।',
  en: 'By about 3200 BCE the inner tokens gave way to pressed signs — the first writing was born from accounting itself.',
  hi: '३२०० ईसा पूर्व के आसपास टोकन की जगह दबी छाप ने ली — पहली लेखा हिसाब से ही जन्मी।' });
addScene({ beat: b, speaker: 'URUK_SCRIBE', sfx: 'scribe_ration_list_drone',
  vis: 'shaved-head temple scribe holding a reed stylus beside rows of grain and beer jars on a shelf, 16:9',
  bn: 'আজকের খাতা: চারটে ঘট বিয়ার, তিনটে সের উন, আর চল্লিশটা ভেড়া — মন্দিরের জন্য, রোজই এমন খাতা ভরে যেত।',
  en: 'Today tablet: four jars of beer, three measures of wool, and forty sheep — for the temple, and such tablets filled up every single day.',
  hi: 'आज का खाता: चार घड़े बीयर, तीन सेर ऊन, और चालीस भेड़ें — मंदिर के लिए, और ऐसी पट्टियाँ हर रोज़ भरती थीं।' });

/* BEAT 15 - TABLETS LEGACY */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'ledger_bowl_beer_pour',
  vis: 'clay tablet laid before a pouring jar of beer with foam head, beside a heap of barley bundle and a sheep token row, no readable text, 16:9',
  bn: 'ইআন্না-অঞ্চলের প্রায় ছয় হাজার ফলক সবই হিসেবের কথা বলে — শস্য, বিয়ার, উন, ভেড়া — কোনো কবিতা নয়।',
  en: 'Nearly six thousand tablets from the Eanna precinct all talk accounting — barley, beer, wool, sheep — no poetry at all.',
  hi: 'इअन्ना-क्षेत्र की लगभग छह हज़ार पट्टियाँ सब खाते की बात करती हैं — जौ, बीयर, ऊन, भेड़ — कोई कविता नहीं।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'phoneme_bell_twinkle',
  vis: 'clay tablet where an animal sign morphs into an arrow sign beside a star sign slowly, glowing rebus transformation, 16:9',
  bn: 'পরে লেখকেরা নাম লিখতে শিখল ধ্বনি ধরে ধ্বনি ধরে — লেখা তখন শিখছিল কথা ধরে রাখা।',
  en: 'Later scribes learned to write names sound by sound — writing was learning to hold speech itself.',
  hi: 'बाद में लेखकों ने नाम ध्वनि-दर-ध्वनि लिखना सीखा — लेखा तब वाणी थामना सीख रही थी।' });


/* BEAT 16 - WHY CITIES */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'canal_water_slurp',
  vis: 'network of long hand-cut canals threading planted fields and transport rafts toward cities, water gates lifting, 16:9',
  bn: 'তত্ত্ব এক: নদীর খাল-সেচে উৎপাদন বাড়ল, আর মানুষের শ্রম বাঁধা পড়ল একটাই ব্যবস্থায়, যা খাল-কাটা শ্রমকে এক ছাতার নিচে আনল।',
  en: 'Theory one: river canal irrigation multiplied surplus and tied human labour into one single system, which pulled canal-digging labour under one roof.',
  hi: 'सिद्धांत एक: नहर-सिंचाई से उपज बढ़ी और इंसानी मेहनत एक तंत्र में बँध गई, जिसने नहर-खुदाई श्रम को एक छत के नीचे ला दिया।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'dry_winds_gust',
  vis: 'northern rain-fed hills fading brown while the wet southern river plain glows green, arrows of tiny villages drifting south, 16:9',
  bn: 'তত্ত্ব দুই: ক্রমশ শুকিয়ে যাওয়া বৃষ্টি-মাঠ থেকে মানুষ ঠেলে এল নদীর সবুজ সমতলে, ভিড় বাড়ল দক্ষিণের উর্বর ভূমিতে।',
  en: 'Theory two: spreading dryness pushed rain farmers further south into the crowded river plains, and crowds thickened on the fertile southern ground.',
  hi: 'सिद्धांत दो: फैलते सूखे ने वर्षा-किसानों को दक्षिण नदियों के मैदान की ओर धकेला, और भीड़ बढ़ी दक्षिण की उपजाऊ भूमि पर।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'failed_hypothesis_buzzer',
  vis: 'cheerful trade bazaar model being gently crossed out with red paper tape, ledger analyses pinning stacked stone papers, 16:9',
  bn: 'তত্ত্ব তিন বলত বাজার-বাণিজ্যই শহরকে জন্ম দিল — কিন্তু ২০১৪ সালের বিশ্লেষণে সেই যুক্তি ভেঙে পড়ল, প্রমাণ বলল বাজার আসার আগেই শহর এসেছিল।',
  en: 'Theory three credits trade and markets — but a 2014 analysis proved cities came first, since evidence shows cities arrived before such markets.',
  hi: 'सिद्धांत तीन कहता था बाज़ार-व्यापार ने शहर को जन्म दिया — परन्तु २०१४ के विश्लेषण में वह युक्ति टूट गई, क्योंकि प्रमाण कहता है बाज़ार से पहले शहर आए।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'pressure_cooker_hiss',
  vis: 'highland-ringed valley bowl filling with more tiny villages until they press together, steam rising as barrier lines show blocked escape, 24fps build up',
  bn: 'তত্ত্ব চার: নদী-মরু-পাহাড়ে ঘেরা জমিতে পালানোর জায়গা নেই — তাই যুদ্ধ চেপে গড়ে তুলল রাষ্ট্র, যেখানে হারলে পালানোর পথ বন্ধ ছিল।',
  en: 'Theory four: circumscribed land of rivers, desert and mountains blocks escape, so war squeezes villages into states, where losers found every escape route blocked.',
  hi: 'सिद्धांत चार: नदी-मरू-पर्वत से घिरी ज़मीन में भागने की जगह नहीं, इसलिए युद्ध गाँवों को राज्य में दबाता है, जहाँ हारने वालों को भागने का रास्ता बंद था।' });
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'five_gears_mesh_whir',
  vis: 'five interlocking stone gears turning one another inside a transparent clay city model, grain, water, market, sword and temple icons as teeth, 24fps mesh',
  bn: 'সৎ উত্তর একটাই: কোনো একক চাকা নয় — শস্য, নদী, জলবায়ু, বাজার আর ভয় সবাই মিলে চালাল চাকা, একটাই সত্যে সব তত্ত্বের সুতো জড়ানো।',
  en: 'The honest answer stands single: no lone dial did it — surplus, water, climate, trade and fear all turned the wheel together, and every theory-thread knots into that one truth.',
  hi: 'ईमानदार जवाब एक ही है: कोई अकेला पहिया नहीं — अनाज, नदी, जलवायु, बाज़ार और डर सबने मिलकर चक्र चलाया, और हर सिद्धांत का धागा उसी एक सत्य में गुँथा है।' });

/* BEAT 17 - DISEASE */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, type: 'DYNAMIC_AI_VIDEO', sfx: 'sneeze_echo_alley',
  vis: 'crowded mudbrick alley, one ill villager coughing, ripple of worried heads turning quickly, water pot standing, 24fps tense motion',
  bn: 'একই দেয়ালের ভিতরে হাজারো মানুষ ঠাসা ঘর বাঁধা — ইতিহাসের প্রথম রোগ-বিস্তারক শহর, ভিড়ের গায়ে গা লাগা জীবন রোগকে ডানা দিল।',
  en: 'Thousands of people packed behind a single wall made the first true disease super-spreaders, and cheek-by-jowl living gave disease its wings.',
  hi: 'एक ही दीवार के भीतर हज़ारों लोग ठसे घर बाँधे — इतिहास का पहला रोग-फैलाव शहर, और भीड़ से सटी ज़िंदगी ने रोग को पंख दिए।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'lone_letter_unroll',
  vis: 'single clay tablet letter being opened from its clay envelope beside a royal court courtyard with people crowding nearby but not touching, 24fps reveal',
  bn: 'খ্রিস্টপূর্ব ১৭৭৫ সালের মারি-চিঠিতে প্রথম লিখিত রোগ-রোধ: কাপ, চেয়ার, বিছানা ভাগ করবেন না — মারির রাজদরবারে পাঠানো সেই ফলক আজও পড়া যায়।',
  en: 'The earliest written epidemic advice is a Mari letter from about 1775 BCE: do not share cup, chair or bed — and that tablet sent to the Mari court can still be read today.',
  hi: 'सबसे पहली लिखी महामारी-सलाह मारी का पत्र है १७७५ ईपू: कप, कुर्सी, बिस्तर न बाँटें — और मारी दरबार को भेजी वह पट्टी आज भी पढ़ी जाती है।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'tooth_ache_pixel',
  vis: 'large chalk skeleton jaws enlarged with several horizontal pale bands on teeth, weather-health chart lines dipping, 16:9',
  bn: 'দাঁতের ইমেল-রেখা পড়ে গবেষকেরা বলে — প্রথম রাষ্ট্র-শুরুর শতকগুলোতে স্বাস্থ্য সত্যিই কমেছিল, শহরের দাম শরীর দিয়েই প্রথম মেটাতে হলো।',
  en: 'Tooth enamel records show nutrition and health actually dipped in the first proto-state centuries, and bodies paid the first instalment of the city price.',
  hi: 'दाँत-इमेल रेखें दिखाती हैं — पहली प्रोटो-राज्य सदियों में पोषण-स्वास्थ्य सचमुच गिरे, और शरीर ने शहर की कीमत की पहली किश्त चुकाई।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'ghost_city_fade',
  vis: 'city ring shrinking as outer dwellers disappear at edges, thin trickle of newcomers entering gate and whole ring re-inflating, 24fps ebb loop',
  bn: 'আলগাজের ধাঁধা বলে — প্রথম নগরগুলো ছিল ক্ষয়প্রবণ: নতুন অভিবাসীর ধারা থামলেই সেগুলো ভাঙনের দিকে ঢলে পড়ত।',
  en: 'The Algaze paradox states the early cities were entropic: the moment the tide of fresh migrants stopped, they slid toward collapse.',
  hi: 'अलगेज़ पहेली कहती है: प्रारंभिक शहर क्षयी थे — नए प्रवासियों की धारा थमते ही वे पतन की ओर ढल जाते थे।' });


/* BEAT 18 - NETWORK NOT SINGLE */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'sequenced_lap_map',
  vis: 'survey map showing not one but several glowing walled settlements across north and south flashing in sequence, all lit at once, 16:9',
  bn: 'উত্তরের তেল ব্র্যাকও ১৩০ হেক্টরে ছড়াল, নিজের চক্ষু-মন্দির নিয়ে — প্রমাণ করে নগরায়ণ কখনোই এক শহরের অলৌকিক ঘটনা ছিল না।',
  en: 'Tell Brak in the north also spread across 130 hectares with its own Eye Temple — proving urbanism was never a one-city miracle.',
  hi: 'उत्तर का तेल ब्रैक भी अपने दृष्टि-मंदिर के साथ १३० हेक्टेयर में फैला — साबित करता नगरीकरण कभी एक-शहर का चमत्कार नहीं था।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'two_skull_compare_tap',
  vis: 'two skull diagrams side by side with different jaw tooth patterns and bead ornaments, small inequality scale arrows rising, 16:9',
  bn: 'উত্তরের শহরগুলো নতুন মানুষ টেনে বড় হলো, তবু রইল পৃথক পৃথক সামাজিক রেখা — পাশে বসত, কিন্তু মিশত না।',
  en: 'The northern cities grew by pulling in newcomers, yet separate social lines survived — they lived side by side but never blended.',
  hi: 'उत्तरी शहर नए लोगों को खींचकर बड़े हुए, फिर भी अलग-अलग सामाजिक रेखें बचीं — साथ बसते थे, पर घुलते नहीं थे।' });
addScene({ beat: b, speaker: HOST, sfx: 'scale_tilt_gentle',
  vis: 'elderly scholar holding a balance scale with a glinting pearl on one pan and a clay tablet on the other, thoughtful face, 16:9',
  bn: 'তাহলে বোঝা গেল — প্রথম শহর কেবল একটা নয়, বহু জায়গায় জন্মাল একই যন্ত্রপাতি নিয়ে, যা একটাই ভাগ করা জ্ঞান-ভাণ্ডার থেকে উঠে এসেছিল।',
  en: 'So the record clarifies: the first city was never one alone — many sprouted in many places with one shared toolbox, drawn from a single shared pool of craft.',
  hi: 'तो रिकॉर्ड साफ़ करता है: पहला शहर कभी एक नहीं था — एक साझा औज़ार-पेटी से बहुत जगह बहुत जन्मे, एक ही साझा हुनर-भंडार से उठे हुए।' });

/* BEAT 19 - VERDICT */
b = NEW_BEAT();
addScene({ beat: b, speaker: NARRATOR, sfx: 'triple_medal_flip',
  vis: 'three contest medals shaped as tower, honeycomb and ziggurat laid in line on dark wood, engraved only with shapes, 16:9',
  bn: 'শেষ হিসেবে দাঁড়াল: জেরিকো তুলল প্রথম দেয়াল, রাজাহীন কাতালহায়ুক বাঁচল শহর হয়ে, আর উরুক গড়ল প্রথম প্রকৃত শহর।',
  en: 'So the final tally: Jericho raised the first wall, kingless Çatalhöyük lived on as a city, and Uruk built the first true city.',
  hi: 'अंतिम गणना खड़ी हुई: यरीहो ने पहली दीवार उठाई, राजाविहीन कैटलहॉयुक शहर बनकर जिया, और उरुक ने पहला सच्चा शहर बनाया।' });
addScene({ beat: b, speaker: NARRATOR, sfx: 'hash_tag_unclean',
  vis: 'typewritten note pinned flat with the word city replaced by a big question mark stamping seal, bureaucratic motif, 16:9',
  bn: 'শেষ সতর্কতা: প্রথম-শহর খেতাবটা দাঁড়ায় শহর-সংজ্ঞার মাপে — সংজ্ঞা বদলালে মুকুটও বদলায়, তাই তাড়াহুড়ো করে একক বিজয়ী ঘোষণা করা যায় না।',
  en: 'One guarded note before the crown: the first-city title hinges on how you define city itself — change the definition and the crown moves too, so no single winner can be rushed.',
  hi: 'ताज से पहले एक बचाव टिप्पणी: पहला-शहर खिताब टिका है शहर की परिभाषा पर — परिभाषा बदली तो ताज भी बदला, इसलिए एकल विजेता की जल्दबाज़ी नहीं हो सकती।' });
addScene({ beat: b, speaker: HOST, sfx: 'verdict_gavel_clay',
  vis: 'elderly scholar carefully pressing a round clay seal onto a parchment spread of a three-city map, glow line tracing connection between all three sites, 16:9',
  bn: 'ইতিহাস ধরে রাখে তিন প্রথম — দেয়াল, রাস্তাহীন নগর, আর সত্যিকার শহর — পাশাপাশি চলা, কখনোই একা চ্যাম্পিয়ন নয়, এটাই খননের সবচেয়ে নিরাপদ রায়।',
  en: 'History keeps three firsts running side by side — wall, streetless city, true city — never a lone champion, and that is the safest verdict of excavation.',
  hi: 'इतिहास रखता है तीन प्रथम साथ-साथ — दीवार, बेसड़क नगर और असली शहर — कभी अकेला चैंपियन नहीं, और यही खुदाई का सबसे सुरक्षित फैसला है।' });
addScene({ beat: b, speaker: HOST, sfx: 'torch_lift_empire',
  vis: 'elderly scholar raising torch witnessing a parade horizon where mud tower, honeycomb town and ziggurat stand under one sky, 16:9',
  bn: 'আর সবার সাধারণ উপহার: দেয়াল, হিসেব-খাতা, রোগ-পত্র — সভ্যতার পুরো যন্ত্র-সেট, যা আজও আমাদের হাতে।',
  en: 'And their shared gift: the wall, the tax ledger, the epidemic memo — the whole toolkit of civilization, still in our hands.',
  hi: 'और उनका साझा उपहार: दीवार, हिसाब-खाता, महामारी-पत्र — सभ्यता का पूरा यन्त्र-सेट, आज भी हमारे हाथ में।' });

/* BEAT 20 - OUTRO */
b = NEW_BEAT();
addScene({ beat: b, speaker: HOST, sfx: 'comment_bell_ding',
  vis: 'three contest cards hovering in torch light above an open comment box sketch, 16:9',
  bn: 'তিন চ্যাম্পিয়নের মধ্যে তুমি কোনটা বেছে নিলে — টাওয়ার, ছাদ-শহর, না দেয়াল-নগর? নিচে কমেন্টে তোমার পছন্দ লিখে যাও।',
  en: 'Which of the three champions convinced you — the Tower, the streetless town, or the walled metropolis? Drop your pick in the comments below.',
  hi: 'तीन चैंपियन में से तुम कौन चुनोगे — टावर, छत-शहर या दीवार-नगर? नीचे कमेंट में अपनी पसंद लिखो।' });
addScene({ beat: b, speaker: HOST, sfx: 'source_pile_tap',
  vis: 'stack of four study books and one journal spilling softly on desk with torch glow, each spine drawn shape-only, 16:9',
  bn: 'এখানে প্রতিটি সংখ্যা যাচাই করা — UNESCO-র রিপোর্ট, Antiquity জার্নাল, ব্রিটানিকা আর জাদুঘর-হ্যান্ডবুক থেকে, যেখানে মতভেদ সেখানে দুটো মতই রাখা।',
  en: 'Every number here was checked against UNESCO reports, the Antiquity journal, Britannica and museum handbooks — and where scholars disagree, both views were kept.',
  hi: 'यहाँ हर संख्या जाँची गई — UNESCO रिपोर्ट, Antiquity जर्नल, Britannica और म्यूज़ियम-हैंडबुक से — और जहाँ विद्वान असहमत हैं, दोनों मत रखे गए।' });
addScene({ beat: b, speaker: HOST, sfx: 'subscribe_bell_pop',
  vis: 'elderly scholar waving torch as a glowing subscribe bell icon forms from a dot cluster, warm outro glow, 16:9',
  bn: 'সাবস্ক্রাইব করো, যেন সময়ের সাক্ষী আবার দরজায় নাড়া দেয় — ইতিহাসের প্রতিটি দরজা খুলতেই থাকবে তোমার জন্য।',
  en: 'Subscribe, so the Time Chronicler keeps knocking at your door of history — every door of the past will keep opening for you.',
  hi: 'सबस्क्राइब करो, ताकि समय का साक्षी इतिहास के दरवाज़े पर दस्तक देता रहे — अतीत का हर दरवाज़ा तुम्हारे लिए खुलता रहेगा।' });
addScene({ beat: b, speaker: HOST, type: 'DYNAMIC_AI_VIDEO', sfx: 'next_episode_token_spiral',
  vis: 'elderly scholar torch pointing as clay token shapes spiral upward and morph into wedge writing signs, next-episode glyph tease, 24fps outro motion',
  bn: 'পরের পর্ব: মানুষের প্রথম ভাষার গল্প — যেখানে হিসেবের ফলকই একদিন কবিতা হয়ে উঠবে।',
  en: 'Next episode: the story of the first language of our species — where tablets of accounting will one day become poetry.',
  hi: 'अगला एपिसोड: हमारी प्रजाति की पहली भाषा की कहानी — जहाँ हिसाब की पट्टियाँ एक दिन कविता बनेंगी।' });


/* PROJECT ASSEMBLY */
const scenesDone = () => scenes.length;
const DYN = scenes.filter((s) => s.type === 'DYNAMIC_AI_VIDEO').length;
const STAT = scenesDone() - DYN;
let total = +scenes.reduce((a, s) => a + s.duration, 0).toFixed(2);

const project = {
  project_id: ID,
  brand: 'Simple Studio',
  channels: { bn: 'Simple History Teller Bangla', en: 'Simple History Teller', hi: 'Simple History Teller Hindi' },
  style_preset: 'PRESET_SIMPLE_HISTORY',
  target_duration_seconds: 1120,
  total_duration_seconds: total,
  language_total_durations: {
    bn: +scenes.reduce((a, s) => a + s.language_durations.bn, 0).toFixed(2),
    en: +scenes.reduce((a, s) => a + s.language_durations.en, 0).toFixed(2),
    hi: +scenes.reduce((a, s) => a + s.language_durations.hi, 0).toFixed(2)
  },
  metadata: {
    title_bn: 'দুনিয়ার প্রথম শহর — যেখানে রাস্তাই ছিল না! (মানুষ কেন বানাল শহর?)',
    title_en: 'Why Did Humans Build the First City? — No Streets, No Kings, Just 9 km of Wall',
    title_hi: 'मानव ने पहला शहर क्यों बनाया? — बिना सड़क का शहर और 9 किमी की दीवार'
  },
  scenes,
  characters: [
    {
      id: 'TIME_CHRONICLER', name_bn: 'সময়ের সাক্ষী', name_en: 'The Time Chronicler', name_hi: 'समय का साक्षी',
      role_bn: 'হোস্ট ও সূত্রধার', role_en: 'Host and Storyteller', role_hi: 'सूत्रधार एवं कहानीकार',
      gender: 'Male', age_group: 'Elderly', icon: '-ie', badge_class: 'speaker-badge-host',
      aistudio_voice: 'Cruz', fallback_voice: 'Charon', style_prompt: 'An Old Story Teller, Old Man voice',
      default_wpm: 135, volume_db: 0, audio_effect: 'studio_clean',
      ref_image: 'references/ref_host_chronicler.jpg', noor_veil: false,
      visual_dna: 'Elderly male scholar with fluffy white beard, round wire spectacles, brown scholar tunic, holding history journal and torch.'
    },
    {
      id: 'NARRATOR', name_bn: 'ইতিহাস কথক', name_en: 'Historical Narrator', name_hi: 'इतिहास वाचक',
      role_bn: 'মূল ধারাভাষ্যকার', role_en: 'Documentary Narrator', role_hi: 'मुख्य कथावाचक',
      gender: 'Male', age_group: 'Adult', icon: 'ip', badge_class: 'speaker-badge-narrator',
      aistudio_voice: 'Charon', fallback_voice: 'Orus', style_prompt: 'deep, resonant, authoritative documentary narrator',
      default_wpm: 140, volume_db: 0, audio_effect: 'warm_tube_narrator',
      ref_image: 'references/ref_host_simple_history.jpg', noor_veil: false,
      visual_dna: 'Authoritative historical documentary narrator with classic archival aesthetic.'
    },
    {
      id: 'CAT_NEIGHBOR', name_bn: 'কাতালহায়ুক প্রতিবেশী', name_en: 'Catalhoyuk Neighbor', name_hi: 'कैटलहॉयुक पड़ोसी',
      role_bn: 'ঐতিহাসিক চরিত্র', role_en: 'Historical Character', role_hi: 'ऐतिहासिक पात्र',
      gender: 'Female', age_group: 'Adult', icon: 'i-c2', badge_class: 'speaker-badge-character',
      aistudio_voice: 'Aoede', fallback_voice: 'Fenrir', style_prompt: 'expressive historical character acting',
      default_wpm: 135, volume_db: 0, audio_effect: 'studio_clean',
      ref_image: 'references/ref_style_2_simple_history.jpg', noor_veil: false,
      visual_dna: 'Neolithic Catalhoyuk woman in fringed wool wrap, ochre bead necklace, carrying grain basket across rooftops.'
    },
    {
      id: 'URUK_SCRIBE', name_bn: 'উরুক লেখক', name_en: 'Uruk Scribe', name_hi: 'उरुक लेखक',
      role_bn: 'ঐতিহাসিক চরিত্র', role_en: 'Historical Character', role_hi: 'ऐतिहासिक पात्र',
      gender: 'Male', age_group: 'Adult', icon: 'i-c3', badge_class: 'speaker-badge-character',
      aistudio_voice: 'Fenrir', fallback_voice: 'Charon', style_prompt: 'expressive historical character acting',
      default_wpm: 138, volume_db: 0, audio_effect: 'studio_clean',
      ref_image: 'references/ref_style_2_simple_history.jpg', noor_veil: false,
      visual_dna: 'Early Sumerian temple scribe with shaved head, plain woven kilt, holding reed stylus and cushion clay tablet.'
    },
    {
      id: 'URUK_KING', name_bn: 'উরুকের শাসক', name_en: 'Uruk Ruler', name_hi: 'उरुक शासक',
      role_bn: 'ঐতিহাসিক চরিত্র', role_en: 'Historical Character', role_hi: 'ऐतिहासिक पात्र',
      gender: 'Male', age_group: 'Adult', icon: 'i-c4', badge_class: 'speaker-badge-character',
      aistudio_voice: 'Fenrir', fallback_voice: 'Charon', style_prompt: 'expressive historical character acting',
      default_wpm: 138, volume_db: 0, audio_effect: 'studio_clean',
      ref_image: 'references/ref_style_2_simple_history.jpg', noor_veil: false,
      visual_dna: 'Sturdy early Sumerian ruler in belted kilt and simple crown-band, standing before mudbrick city wall, regal but neutral.'
    }
  ]
};

fs.mkdirSync(DIR, { recursive: true });
fs.mkdirSync(path.join(DIR, 'audio', 'bn'), { recursive: true });
fs.mkdirSync(path.join(DIR, 'audio', 'en'), { recursive: true });
fs.mkdirSync(path.join(DIR, 'audio', 'hi'), { recursive: true });
fs.mkdirSync(path.join(DIR, 'audio', 'sfx'), { recursive: true });
fs.mkdirSync(path.join(DIR, 'audio', 'bgm'), { recursive: true });
fs.mkdirSync(path.join(DIR, 'visual_assets'), { recursive: true });
fs.mkdirSync(path.join(DIR, 'metadata'), { recursive: true });
fs.mkdirSync(path.join(DIR, 'exports'), { recursive: true });

fs.writeFileSync(path.join(DIR, 'project.json'), JSON.stringify(project, null, 2), 'utf8');
const report = {
  project: ID,
  scenes: scenesDone(),
  static: STAT,
  dynamic: DYN,
  dynamic_ratio_pct: +(DYN / scenesDone() * 100).toFixed(1),
  beats: beat,
  total_sec: total,
  minutes: +(total / 60).toFixed(1),
  min_shot_sec: Math.min(...scenes.map((s) => s.duration)),
  max_shot_sec: Math.max(...scenes.map((s) => s.duration)),
  bn_minutes: +(project.language_total_durations.bn / 60).toFixed(1),
  en_minutes: +(project.language_total_durations.en / 60).toFixed(1),
  hi_minutes: +(project.language_total_durations.hi / 60).toFixed(1),
  contract: {
    duration_900_1200: total >= 900 && total <= 1200,
    shots_70_90: scenesDone() >= 70 && scenesDone() <= 90,
    shot_6_13s: Math.min(...scenes.map((s) => s.duration)) >= 6 && Math.max(...scenes.map((s) => s.duration)) <= 13,
    dyn_ratio_10_20: DYN / scenesDone() <= 0.2,
    hook_outro_dynamic: scenes[0].type === 'DYNAMIC_AI_VIDEO' && scenes[scenesDone() - 1].type === 'DYNAMIC_AI_VIDEO'
  }
};
fs.writeFileSync(path.join(DIR, '_GEN_REPORT.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));

