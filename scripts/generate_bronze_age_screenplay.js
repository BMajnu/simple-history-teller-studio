const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '..', 'projects', 'simple_itihash_004_bronze_age_collapse');

// 85 Granular Scenes Definition
const rawScenes = [
  // --- ACT 1: THE GOLDEN GLOBAL NETWORK & THE ACHILLES' HEEL ---
  {
    id: 1, beat: 1, sub: 1, type: "DYNAMIC_AI_VIDEO", speaker: "TIME_CHRONICLER",
    bn: "আমি সময়ের সাক্ষী হয়ে আজ তোমাদের নিয়ে যাচ্ছি ঠিক ৩২০০ বছর পেছনের এক রহস্যময় ও রোমাঞ্চকর পৃথিবীতে।",
    en: "I am the Time Chronicler, taking you back thirty-two hundred years into a mysterious and thrilling ancient world.",
    hi: "मैं समय का साक्षी बनकर आज आपको ले चल रहा हूँ ठीक ३२०० साल पुरानी एक रहस्यमयी और रोमांचक दुनिया में।",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Time Chronicler, an elderly bald scholar with thick bushy white beard, circular wire spectacles and flowing brown linen robes holding a flaming bronze torch and ancient history book, stepping through a swirling celestial time portal into ancient Mediterranean ruins, warm amber glow, 24fps motion.",
    sfx: "portal_whoosh_mystic", motion: "ai_video", dur: 11.0, claim: "CLM-26"
  },
  {
    id: 2, beat: 1, sub: 2, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "আজ আমরা যাকে আধুনিক বিশ্বায়ন বলি, ঠিক তেমনই এক বিস্ময়কর আন্তর্জাতিক বাণিজ্যের নেটওয়ার্ক গড়ে উঠেছিল প্রাচীন ভূমধ্যসাগর জুড়ে।",
    en: "What we call modern globalization today had an astonishing ancient counterpart spanning the entire Mediterranean basin.",
    hi: "आज जिसे हम आधुनिक वैश्वीकरण कहते हैं, वैसा ही एक हैरतअंगेज़ अंतरराष्ट्रीय व्यापारिक नेटवर्क प्राचीन भूमध्यसागर में फैला हुआ था।",
    prompt: "Simple History 2D graphic novel style, clean outlines, warm parchment palette, an ornate ancient world map depicting bustling shipping lanes across Egypt, Greece, Cyprus, and Anatolia with golden miniature ships and trade routes, 16:9 widescreen historical illustration.",
    sfx: "parchment_map_open", motion: "zoom_in", dur: 11.5, claim: "CLM-01"
  },
  {
    id: 3, beat: 1, sub: 3, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "কিন্তু মাত্র পঞ্চাশ বছরের এক নির্মম ঝড়ে সেই পরাক্রমশালী স্বর্ণযুগ এমনভাবে মুছে গেল যে মানবজাতি নিমজ্জিত হলো চারশত বছরের অন্ধকারে!",
    en: "Yet within fifty short, brutal years, that golden age vanished so completely that humanity was plunged into four centuries of darkness!",
    hi: "लेकिन महज़ पचास सालों के एक बेरहम तूफ़ान ने उस सुनहरे युग को ऐसे मिटा दिया कि मानव सभ्यता चार सौ साल के अंधेरे में डूब गई!",
    prompt: "Simple History 2D graphic novel style, dramatic split composition showing a gleaming bronze city on the left contrasting with blackened smoking ruins and broken stone pillars under stormy grey clouds on the right, 16:9 widescreen.",
    sfx: "dramatic_thunder_hit", motion: "pan_right", dur: 12.0, claim: "CLM-06, CLM-13"
  },
  {
    id: 4, beat: 1, sub: 4, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "খ্রিস্টপূর্ব তেরো শতকে নীল নদের উর্বর উপত্যকা শাসন করত স্বর্ণ আর রত্নে মোড়া নতুন সাম্রাজ্যের পরাক্রমশালী মিশর।",
    en: "In the thirteenth century BCE, the fertile Nile Valley was ruled by the fabulously wealthy New Kingdom of Egypt.",
    hi: "ईसा पूर्व तेरहवीं सदी में नील नदी की उपजाऊ घाटी पर सोने और जवाहरात से सजे शक्तिशाली मिस्र साम्राज्य का राज था।",
    prompt: "Simple History 2D graphic novel style, magnificent panoramic view of Thebes and Karnak temples, Pharaoh Ramesses II standing tall on a golden royal chariot overlooking monumental stone obelisks and the glistening Nile, 16:9 widescreen.",
    sfx: "egyptian_harp_ambient", motion: "pan_left", dur: 11.0, claim: "CLM-06"
  },
  {
    id: 5, beat: 1, sub: 5, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "উত্তরে আনাতোলিয়ার দুর্ভেদ্য পাথুরে পাহাড়ে রাজত্ব করত লৌহকঠিন যোদ্ধা জাতি হিট্টাইট সাম্রাজ্য।",
    en: "To the north, the rugged mountain plateaus of Anatolia were dominated by the warrior Hittite Empire.",
    hi: "उत्तर में अनातोलिया की चट्टानी पहाड़ियों पर जांबाज योद्धाओं के हित्ती साम्राज्य का दबदबा था।",
    prompt: "Simple History 2D graphic novel style, the monumental stone Lion Gate of Hattusa, heavily armored Hittite warriors with pointed bronze helmets and crested shields standing guard along cyclopean stone battlements, 16:9 widescreen.",
    sfx: "stone_fortress_ambience", motion: "zoom_in", dur: 11.0, claim: "CLM-06"
  },
  {
    id: 6, beat: 1, sub: 6, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "এজিয়ান সাগরের দ্বীপগুলোতে মাইসিনীয় গ্রিক রাজারা সমুদ্রের জল কেটে তাদের দ্রুতগামী যুদ্ধজাহাজ ছুটিয়ে নিয়ে যেত।",
    en: "Across the Aegean Sea, Mycenaean Greek warlords sailed swift war galleys along jagged coastlines.",
    hi: "एजियन सागर के द्वीपों पर माइसीनियाई ग्रीक सरदार अपनी तेज़ नौकाएं लहरों पर दौड़ाते थे।",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. A sleek Mycenaean wooden war galley with bold painted eye at the prow cutting through foaming turquoise Aegean sea waves, bronze-clad oarsmen pulling rhythmically, 24fps motion.",
    sfx: "ocean_waves_rowing", motion: "ai_video", dur: 11.0, claim: "CLM-06"
  },
  {
    id: 7, beat: 1, sub: 7, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "আর বর্তমান সিরিয়ার উপকূলে জেগে উঠেছিল ইউগারিত—যেখানে পৃথিবীর সব দেশের বণিকরা ভিড় করত বিলাসদ্রব্য বেচাকেনা করতে।",
    en: "On the Syrian coast flourished Ugarit, a cosmopolitan merchant metropolis where traders from all known nations bartered luxuries.",
    hi: "और आधुनिक सीरिया के तट पर बसा था उगालित—एक ऐसा व्यापारिक शहर जहाँ दुनिया भर के व्यापारी कीमती सामान बेचने आते थे।",
    prompt: "Simple History 2D graphic novel style, vibrant bustling coastal port of Ugarit, merchant ships docked at stone quays, traders in colorful Levantine tunics trading wine jars, purple dyed fabrics, and ivory tusks, 16:9 widescreen.",
    sfx: "busy_harbor_market", motion: "zoom_out", dur: 11.5, claim: "CLM-01, CLM-13"
  },
  {
    id: 8, beat: 1, sub: 8, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "মিশরীয় ফারাও ও হিট্টাইট সম্রাটরা মাটির ফলকে কিউনিফর্ম লিপিতে একে অপরকে 'আমার প্রিয় ভাই' বলে কুশল বিনিময় করতেন।",
    en: "Egyptian Pharaohs and Hittite Emperors addressed each other on clay tablets as 'My Brother,' exchanging royal brides and greetings.",
    hi: "मिस्र के फिरौन और हित्ती राजा मिट्टी की तख्तियों पर एक-दूसरे को 'मेरा भाई' लिखकर बधाई और शाही तोहफे भेजते थे।",
    prompt: "Simple History 2D graphic novel style, royal scribe carefully stamping cuneiform wedge symbols into a moist clay tablet using a reed stylus, nearby an Egyptian golden diplomatic seal and rolled papyri, warm studio light, 16:9 widescreen.",
    sfx: "cuneiform_reed_stamp", motion: "zoom_in", dur: 11.5, claim: "CLM-01"
  },
  {
    id: 9, beat: 1, sub: 9, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "১২৭৪ খ্রিস্টপূর্বাব্দে কাদেশের বিশাল প্রান্তরে এই দুই পরাশক্তি পাঁচ হাজার যুদ্ধরথ নিয়ে মানব ইতিহাসের বৃহত্তম রথযুদ্ধে মুখোমুখি হয়েছিল!",
    en: "In 1274 BCE at Kadesh, these two titans clashed in the largest chariot battle in history, fielding five thousand war chariots!",
    hi: "ईसा पूर्व १२७४ में कादेश के मैदान में ये दोनों महाशक्तियां पांच हज़ार युद्ध-रथों के साथ इतिहास के सबसे बड़े रथ-संग्राम में टकराईं!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Hundreds of two-wheeled Egyptian and Hittite bronze war chariots thundering across a dusty desert battlefield, horses galloping at full sprint, arrows flying, heavy dust clouds billowing, 24fps motion.",
    sfx: "chariot_clash_war_horns", motion: "ai_video", dur: 12.0, claim: "CLM-07"
  },
  {
    id: 10, beat: 1, sub: 10, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "সেই রক্তক্ষয়ী যুদ্ধের সমাপ্তি ঘটেছিল পৃথিবীর প্রাচীনতম আন্তর্জাতিক শান্তিচুক্তির মাধ্যমে, যার একটি প্রতিরূপ আজও জাতিসংঘ সদর দপ্তরে সংরক্ষিত আছে।",
    en: "That clash ended with the world's first recorded international peace treaty, a replica of which hangs in the United Nations headquarters today.",
    hi: "उस भीषण संग्राम का अंत दुनिया की पहली लिखित शांति-संधि से हुआ, जिसकी एक प्रति आज भी संयुक्त राष्ट्र मुख्यालय में मौजूद है।",
    prompt: "Simple History 2D graphic novel style, close-up of the ancient Treaty of Kadesh baked clay tablet covered in fine Akkadian cuneiform inscriptions, flanked by the stylized silhouettes of Ramesses II and Hattusili III, 16:9 widescreen.",
    sfx: "treaty_fanfare_subtle", motion: "zoom_out", dur: 11.5, claim: "CLM-07"
  },
  {
    id: 11, beat: 1, sub: 11, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "কিন্তু তোমরা কি জানো—এই বিশাল সাম্রাজ্য, রথবাহিনী আর কোটি কোটি মানুষের ধনসম্পদের মূল চাবিকাঠি আসলে কী ছিল?",
    en: "Yet do you know what single material secret held this entire web of empires, armies, and prosperity together?",
    hi: "लेकिन क्या आप जानते हैं—इन विशाल साम्राज्यों, सेनाओं और अकूत दौलत की सबसे बड़ी जीवनरेखा असल में क्या थी?",
    prompt: "Simple History 2D graphic novel style, Time Chronicler looking up curiously with raised eyebrow and spectacles glinting, holding an ancient glowing bronze dagger over an open history scroll in a torchlit stone study, 16:9 widescreen.",
    sfx: "mystery_bell_toll", motion: "zoom_in", dur: 11.0, claim: "CLM-02"
  },
  {
    id: 12, beat: 1, sub: 12, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "উত্তরটি হলো এক জাদুকরী সংকর ধাতু—ব্রোঞ্জ বা কাঁসা!",
    en: "The answer was a miraculous metal alloy: bronze!",
    hi: "वह जवाब था एक जादुई मिश्र धातु—कांस्य यानी ब्रॉन्ज़!",
    prompt: "Simple History 2D graphic novel style, gleaming golden-brown bronze broadsword and polished horned helmet resting heroically on an engraved stone pedestal under theatrical beam of light, 16:9 widescreen.",
    sfx: "metal_sword_gleam", motion: "zoom_in", dur: 10.5, claim: "CLM-02"
  },
  {
    id: 13, beat: 1, sub: 13, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "ব্রোঞ্জ ছাড়া সেই যুগে যুদ্ধক্ষেত্রের বর্ম কিংবা চাষের লাঙলের ফলা তৈরি করা অসম্ভব ছিল।",
    en: "Without bronze, crafting battlefield armor or sturdy farming plowshares was practically impossible.",
    hi: "कांस्य के बिना उस दौर में न तो जंग के हथियार बन सकते थे और न ही खेतों के लिए मजबूत हल।",
    prompt: "Simple History 2D graphic novel style, split illustration showing an ancient armorer sharpening a bronze spearhead on the left and a farmer tilling dry soil with a bronze-tipped wooden plow on the right, 16:9 widescreen.",
    sfx: "blacksmith_chime", motion: "pan_right", dur: 11.0, claim: "CLM-02"
  },
  {
    id: 14, beat: 1, sub: 14, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "কিন্তু ব্রোঞ্জ তৈরির রেসিপিতে লুকিয়ে ছিল এক মারাত্মক ভূতাত্ত্বিক ফাঁদ: এর জন্য প্রয়োজন শতকরা ৯০ ভাগ তামা আর ঠিক ১০ ভাগ খাঁটি টিন।",
    en: "Yet inside the recipe for bronze lay a fatal geological trap: it required ninety percent copper and exactly ten percent pure tin.",
    hi: "लेकिन कांस्य बनाने के नुस्खे में एक जानलेवा पहेली छिपी थी: इसके लिए नब्बे प्रतिशत तांबा और ठीक दस प्रतिशत शुद्ध टिन चाहिए था।",
    prompt: "Simple History 2D graphic novel style, clear educational visual diagram: a large orange block labeled 90% Copper next to a small silver ingot labeled 10% Tin pointing into a glowing crucible producing Bronze, 16:9 widescreen.",
    sfx: "educational_ding", motion: "zoom_in", dur: 12.0, claim: "CLM-02"
  },
  {
    id: 15, beat: 1, sub: 15, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "তামা পাওয়ার ব্যবস্থা ছিল সহজ, কারণ ভূমধ্যসাগরের সাইপ্রাস দ্বীপে ছিল অফুরন্ত তামার খনি।",
    en: "Securing copper was relatively straightforward, thanks to the vast copper mines of Cyprus right in the Mediterranean.",
    hi: "तांबा जुटाना तो आसान था, क्योंकि भूमध्यसागर के साइप्रस द्वीप में तांबे की अथाह खदानें मौजूद थीं।",
    prompt: "Simple History 2D graphic novel style, an ancient opencast copper mine on the island of Cyprus (Alashiya), workers loading raw reddish copper oxhide ingots into donkey panniers, turquoise sea in the backdrop, 16:9 widescreen.",
    sfx: "stone_pickaxe_strike", motion: "pan_left", dur: 11.0, claim: "CLM-03"
  },
  {
    id: 16, beat: 1, sub: 16, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "কিন্তু খাঁটি টিন পেতে হলে বণিকদের পাড়ি দিতে হতো হাজার হাজার মাইল দূরের দুর্গম আফগানিস্তানের পর্বত কিংবা ব্রিটেনের কর্নওয়ালের উপকূল!",
    en: "To obtain tin, however, merchants had to trek thousands of perilous miles to the mountains of remote Central Asia or distant Britain!",
    hi: "लेकिन टिन हासिल करने के लिए व्यापारियों को हज़ारों मील दूर मध्य एशिया के अफ़ग़ानिस्तान की पहाड़ियों या सुदूर ब्रिटेन तक जाना पड़ता था!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. A merchant pack caravan of mules and bearded traders struggling against freezing mountain blizzards along treacherous narrow cliff paths in the Hindu Kush, 24fps motion.",
    sfx: "howling_blizzard_wind", motion: "ai_video", dur: 12.0, claim: "CLM-03"
  },
  {
    id: 17, beat: 1, sub: 17, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "১৯৮২ সালে তুরস্কের উলুবুরুন উপকূলে সমুদ্রের তলদেশে আবিষ্কৃত হয় ৩৩০০ বছর আগের একটি বিস্ময়কর বাণিজ্য জাহাজ।",
    en: "In 1982, off the Turkish coast of Uluburun, marine archaeologists discovered an astonishing 3,300-year-old shipwreck.",
    hi: "१९८२ में तुर्की के उलूबुरुन तट के पास समुद्र की गहराइयों में ३३०० साल पुराना एक हैरतअंगेज़ डूबा हुआ जहाज़ मिला।",
    prompt: "Simple History 2D graphic novel style, underwater scene showing scuba divers carefully uncovering the wooden ribs of an ancient Bronze Age galley embedded in seabed sand surrounded by stacked oxhide ingots, 16:9 widescreen.",
    sfx: "underwater_bubbles_low", motion: "zoom_in", dur: 11.5, claim: "CLM-04"
  },
  {
    id: 18, beat: 1, sub: 18, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "গবেষকরা দেখতে পান সেই জাহাজে বোঝাই ছিল দশ টন সাইপ্রাসের তামা এবং ঠিক এক টন মধ্য এশিয়ার দুর্লভ টিনের ইনগট!",
    en: "Researchers found the ship carrying ten tons of Cypriot copper and exactly one ton of rare Central Asian tin ingots!",
    hi: "शोधकर्ताओं ने पाया कि उस जहाज़ पर दस टन साइप्रस का तांबा और ठीक एक टन दुर्लभ टिन के बिस्कुट लदे हुए थे!",
    prompt: "Simple History 2D graphic novel style, cross-section cutaway of the Uluburun cargo hold showing neat stacks of four-handled bronze oxhide ingots and triangular tin ingots, 16:9 widescreen.",
    sfx: "metal_stacking_sound", motion: "zoom_out", dur: 11.5, claim: "CLM-04"
  },
  {
    id: 19, beat: 1, sub: 19, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "এটি ছিল ঠিক সেই নিখুঁত অনুপাত, যা দিয়ে একটি রাজকীয় সেনাবাহিনীর জন্য এগারো টন ব্রোঞ্জের অস্ত্র তৈরি করা যেত।",
    en: "This was the exact ten-to-one ratio required to forge eleven tons of top-grade bronze weapons for an entire royal army.",
    hi: "यह बिल्कुल वही अनुपात था, जिससे किसी शाही सेना के लिए ग्यारह टन घातक कांस्य हथियार बनाए जा सकते थे।",
    prompt: "Simple History 2D graphic novel style, thousands of newly forged bronze spears, helmets, and round shields arrayed symmetrically inside an imperial palace armory, 16:9 widescreen.",
    sfx: "military_armory_rattle", motion: "zoom_in", dur: 11.5, claim: "CLM-04"
  },
  {
    id: 20, beat: 1, sub: 20, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "সেই জাহাজে আরও ছিল বাল্টিক সাগরের অ্যাম্বার রত্ন, হাতির দাঁত, সুগন্ধি রজন এবং রাণী নেফারতিতির খোদাই করা সোনার লকেট।",
    en: "The wreckage also preserved Baltic amber, African ivory tusks, Canaanite resin jars, and a solid gold scarab of Queen Nefertiti.",
    hi: "उस मलबे में बाल्टिक का एम्बर, हाथीदांत, कनानी इत्र और मिस्र की महारानी नेफ़रतिती का सोने का पेंडेंट भी मिला।",
    prompt: "Simple History 2D graphic novel style, exquisite museum display layout of recovered Uluburun artifacts: carved ivory duck cosmetic box, golden scarab amulet, blue glass ingots, and amber beads, 16:9 widescreen.",
    sfx: "treasure_twinkle", motion: "pan_right", dur: 12.0, claim: "CLM-05"
  },
  {
    id: 21, beat: 1, sub: 21, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "তার মানে—আজকের আধুনিক পৃথিবীর মতো প্রাচীন পৃথিবীও পরস্পরের সঙ্গে শত শত বাণিজ্যের সূক্ষ্ম সুতোয় বাঁধা ছিল।",
    en: "In other words, just like today, the ancient world was intricately interconnected through delicate threads of specialized trade.",
    hi: "यानी आज की ही तरह वह प्राचीन दुनिया भी व्यापार और भरोसे के नाज़ुक धागों से आपस में गहराई से जुड़ी हुई थी।",
    prompt: "Simple History 2D graphic novel style, Time Chronicler holding a glowing woven web of golden trade threads across miniature ancient cities, thoughtful analytical expression, warm parchment library background, 16:9 widescreen.",
    sfx: "delicate_harp_chime", motion: "zoom_in", dur: 11.5, claim: "CLM-01, CLM-23"
  },
  {
    id: 22, beat: 1, sub: 22, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "কিন্তু কোনো সিস্টেম যদি অতিরিক্ত জটিল আর পরস্পরের ওপর অতিমাত্রায় নির্ভরশীল হয়ে পড়ে, তবে একটি সুতো ছিঁড়লেই পুরো ব্যবস্থা তাসের ঘরের মতো ধসে পড়ে!",
    en: "Yet when a hyper-complex system becomes overly interdependent, snapping a single thread can collapse the entire house of cards!",
    hi: "लेकिन जब कोई तंत्र हद से ज़्यादा जटिल और एक-दूसरे पर निर्भर हो जाता है, तो एक धागा टूटते ही पूरा ताश का महल ढह जाता है!",
    prompt: "Simple History 2D graphic novel style, metaphorical cartoon illustration: a magnificent stone arch bridge of empires suddenly cracking in the middle as the central keystone slips, 16:9 widescreen.",
    sfx: "stone_crack_foreboding", motion: "zoom_in", dur: 12.0, claim: "CLM-23"
  },

  // --- ACT 2: THE PERFECT STORM — NATURE STRIKES ---
  {
    id: 23, beat: 2, sub: 1, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "১২৫০ খ্রিস্টপূর্বাব্দ থেকে হঠাৎ করে এজিয়ান ও মধ্যপ্রাচ্যের নীল আকাশ থেকে বর্ষার মেঘগুলো কর্পূরের মতো উবে যেতে শুরু করল!",
    en: "Around 1250 BCE, seasonal rainclouds began vanishing from the skies of the Aegean and the Near East like smoke!",
    hi: "ईसा पूर्व १२५० के आसपास अचानक एजियन और मध्य पूर्व के आसमान से बारिश के बादल धुआं बनकर गायब होने लगे!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Blistering desert sun scorching dry earth, moisture evaporating violently from cracking soil, heatwaves distorting the horizon, dying wheat field wilting under intense glare, 24fps motion.",
    sfx: "scorching_sun_heatwave", motion: "ai_video", dur: 11.5, claim: "CLM-08"
  },
  {
    id: 24, beat: 2, sub: 2, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "আধুনিক জীবাশ্মবিজ্ঞানী ডেভিড কানিউস্কি সাইপ্রাস ও সিরিয়ার হ্রদের প্রাচীন পললস্তর পরীক্ষা করে নিশ্চিত প্রমাণ পেয়েছেন।",
    en: "Modern paleoecologist David Kaniewski analyzed ancient pollen cores from lakes in Cyprus and Syria, uncovering startling proof.",
    hi: "आधुनिक जीवाश्म वैज्ञानिक डेविड कानिएव्स्की ने साइप्रस और सीरिया की झीलों की प्राचीन तलछट की जांच कर चौंकाने वाले सबूत पाए।",
    prompt: "Simple History 2D graphic novel style, modern scientist in laboratory peering through microscope at ancient fossil pollen grains, graphic overlay comparing lush green tree pollen vs arid desert scrub pollen charts, 16:9 widescreen.",
    sfx: "scientific_scanner_bleep", motion: "zoom_in", dur: 11.5, claim: "CLM-08, CLM-09"
  },
  {
    id: 25, beat: 2, sub: 2, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "সেই প্রমাণ দেখায় যে সেখানে শুরু হয়েছিল প্রায় তিন শতাব্দী স্থায়ী এক নজিরবিহীন তীব্র খরা ও মহামরুকরণ!",
    en: "The geological data confirms the onset of an unprecedented, three-hundred-year megadrought across the entire basin!",
    hi: "भूगर्भीय आंकड़े साबित करते हैं कि पूरे इलाके में तीन सदियों तक चलने वाला एक भयानक महासूखा शुरू हो चुका था!",
    prompt: "Simple History 2D graphic novel style, vast dramatic landscape of withered ancient olive orchards with dead twisted grey branches standing in parched, cracked white earth under a pale blinding sky, 16:9 widescreen.",
    sfx: "dry_wind_dust_blow", motion: "pan_right", dur: 11.5, claim: "CLM-08"
  },
  {
    id: 26, beat: 2, sub: 3, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "বছরের পর বছর অনাবৃষ্টির কারণে ক্ষেতের গম শুকিয়ে খড় হয়ে গেল এবং পশুরা পানির অভাবে মরতে শুরু করল।",
    en: "Year after year of failed rains turned wheat fields into dry tinder, and livestock perished of thirst by the thousands.",
    hi: "साल-दर-साल बारिश न होने से गेहूं के खेत जलकर खाक हो गए और मवेशी प्यास से तड़प-तड़पकर मरने लगे।",
    prompt: "Simple History 2D graphic novel style, sorrowful Bronze Age shepherd holding an empty clay water jug next to an arid dry riverbed and the bones of sheep under a merciless sun, 16:9 widescreen.",
    sfx: "sad_wind_flute", motion: "zoom_in", dur: 11.5, claim: "CLM-09"
  },
  {
    id: 27, beat: 2, sub: 4, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "আনাতোলিয়ার হিট্টাইট সাম্রাজ্যের বিশাল শহরগুলোতে ক্ষুধার্ত মানুষ হাহাকার করতে লাগল।",
    en: "In the monumental cities of the Hittite Empire in Anatolia, starving populations wept and cried out for food.",
    hi: "अनातोलिया के हित्ती साम्राज्य के विशाल नगरों में भूखी जनता दाने-दाने के लिए बिलखने लगी।",
    prompt: "Simple History 2D graphic novel style, crowds of impoverished Anatolian citizens gathered in front of closed palace grain storehouses holding empty woven baskets, despair on their faces, 16:9 widescreen.",
    sfx: "crowd_murmur_despair", motion: "pan_left", dur: 11.0, claim: "CLM-10"
  },
  {
    id: 28, beat: 2, sub: 5, type: "DYNAMIC_AI_VIDEO", speaker: "HITTITE_QUEEN_PUDUHEPA",
    bn: "হিট্টাইট রাণী পুদুহেপা তখন বুক চাপড়ে বলে উঠলেন: 'আমাদের দেশ অনাহারে শেষ হয়ে যাচ্ছে—আমাদের বাঁচাও!'",
    en: "The desperate Hittite Queen Puduhepa cried out: 'Our land is perishing of famine—save our people!'",
    hi: "हित्ती महारानी पुदुहेपा ने तब तड़पकर पुकारा: 'हमारा देश भूख से तबाह हो रहा है—हमारे लोगों को बचाओ!'",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Hittite Queen Puduhepa in ornate royal headdress and gold robes, eyes filled with tears, frantically raising her hands toward the heavens in a magnificent palace hall, 24fps motion.",
    sfx: "royal_sorrow_strings", motion: "ai_video", dur: 11.0, claim: "CLM-10"
  },
  {
    id: 29, beat: 2, sub: 6, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "ইউগারিতে পাওয়া মাটির ফলক আরএস ১৮.০৩৮-এ খোদাই করা বার্তা আজও বেঁচে আছে: 'হাত্তি দেশে চরম দুর্ভিক্ষ, এটি এখন বাঁচার প্রশ্ন!'",
    en: "Clay tablet RS 18.038 found at Ugarit still preserves the royal distress dispatch: 'Famine grips Hatti; it is a matter of life or death!'",
    hi: "उगालित में मिली मिट्टी की तख्ती आर.एस. १८.०३८ पर आज भी वह शाही चीख दर्ज है: 'हित्ती देश में भीषण अकाल है, यह ज़िंदगी और मौत का सवाल है!'",
    prompt: "Simple History 2D graphic novel style, macro close-up of cuneiform tablet RS 18.038 with authentic Akkadian wedges highlighted in subtle golden illumination against weathered terracotta clay, 16:9 widescreen.",
    sfx: "stone_chisel_echo", motion: "zoom_in", dur: 12.0, claim: "CLM-10"
  },
  {
    id: 30, beat: 2, sub: 7, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "মিশরীয় ফারাওরা এই খবর পেয়ে জরুরি খাদ্যবাহী জাহাজ পাঠিয়েছিল, কিন্তু তা ছিল ক্ষুধার্ত মহাসাগরে এক ফোঁটা পানির মতো!",
    en: "Pharaoh Merneptah rushed emergency grain ships to Anatolia, but it was merely a drop in an ocean of starvation!",
    hi: "मिस्र के फिरौन ने मदद के लिए अनाज से भरे समुद्री जहाज़ भेजे, लेकिन वह भुखमरी के सागर में एक बूंद के बराबर था!",
    prompt: "Simple History 2D graphic novel style, Egyptian cargo vessel sailing heavy with woven wheat sacks past mountainous coastlines, dramatic twilight clouds, 16:9 widescreen.",
    sfx: "wooden_ship_creak", motion: "pan_right", dur: 11.5, claim: "CLM-10"
  },
  {
    id: 31, beat: 2, sub: 8, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "কিন্তু প্রকৃতি যেন কেবল খরা দিয়েই সন্তুষ্ট ছিল না; মাটির গভীর থেকেও জেগে উঠেছিল আরেক চরম ধ্বংসলীলা!",
    en: "Yet nature was not content with drought alone; from deep beneath the earth awakened another catastrophic fury!",
    hi: "लेकिन कुदरत सिर्फ सूखे से ही शांत नहीं हुई; धरती के सीने से एक और भयानक विनाशकारी प्रलय जाग उठी!",
    prompt: "Simple History 2D graphic novel style, Time Chronicler holding his torch high, looking down in alarm at deep jagged glowing cracks forming across an ancient tiled stone floor, 16:9 widescreen.",
    sfx: "earthquake_low_rumble", motion: "zoom_in", dur: 11.5, claim: "CLM-12"
  },
  {
    id: 32, beat: 2, sub: 9, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "১২২৫ থেকে ১১৭৫ খ্রিস্টপূর্বাব্দের মধ্যে ভূমধ্যসাগরের টেকটোনিক ফল্ট লাইনে একের পর এক আঘাত হানল বিধ্বংসী ভূমিকম্পের ঝড়!",
    en: "Between 1225 and 1175 BCE, an extraordinary sequence of tectonic 'earthquake storms' hammered the entire Aegean basin!",
    hi: "ईसा पूर्व १२२५ से ११७५ के बीच भूमध्यसागर की भूगर्भीय प्लेटों पर विनाशकारी 'भूकंपों के तूफ़ान' ने लगातार भीषण हमले किए!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Massive cyclopean stone walls of Mycenae fracturing violently, giant multi-ton ashlar boulders tumbling downward in massive choking dust clouds, terracotta roof tiles smashing, 24fps motion.",
    sfx: "earthquake_collapse_crash", motion: "ai_video", dur: 12.0, claim: "CLM-12"
  },
  {
    id: 33, beat: 2, sub: 10, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "ভূতাত্ত্বিক আমোস নূর প্রমাণ করেছেন—মাইসিনি, টিরিন্স, ট্রয় ও কনসসের মতো দুর্ভেদ্য দুর্গগুলো এই ভূমিকম্পে ক্ষতবিক্ষত হয়ে পড়েছিল।",
    en: "Geophysicist Amos Nur proved that the fortified citadels of Mycenae, Tiryns, Troy, and Knossos suffered structural earthquake shear.",
    hi: "भूवैज्ञानिक अमोस नूर ने साबित किया कि माइसीनिया, टिरिन्स, ट्रॉय और क्नोसोस जैसे अभेद्य किले इन भूकंपों से टूटकर बिखर गए थे।",
    prompt: "Simple History 2D graphic novel style, architectural cross-section diagram showing modern seismic shear fractures cutting through the Cyclopean masonry and Lion Gate of Mycenae, 16:9 widescreen.",
    sfx: "masonry_crumble", motion: "zoom_in", dur: 11.5, claim: "CLM-12"
  },
  {
    id: 34, beat: 2, sub: 11, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "যে দুর্গগুলো হাজার হাজার সৈন্যের আক্রমণ ঠেকিয়ে দিতে পারত, প্রকৃতির এক ধাক্কায় তাদের নিরাপত্তা প্রাচীর চুরমার হয়ে গেল।",
    en: "Citadels designed to withstand armies of thousands saw their impregnable defensive perimeters shattered in seconds.",
    hi: "जो किले हज़ारों सैनिकों के हमले झेल सकते थे, कुदरत के एक झटके में उनकी सुरक्षा दीवारें चकनाचूर हो गईं।",
    prompt: "Simple History 2D graphic novel style, fallen stone walls and crushed guard towers overlooking an Aegean valley, bewildered bronze guards staring at the gap in their defenses, 16:9 widescreen.",
    sfx: "wind_howl_ruins", motion: "zoom_out", dur: 11.0, claim: "CLM-12"
  },
  {
    id: 35, beat: 2, sub: 12, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "প্রাচীর ভেঙে যাওয়ায় এবং পেটে খাবার না থাকায় রাজাদের ওপর থেকে সাধারণ মানুষের বিশ্বাস পুরোপুরি উঠে গেল।",
    en: "With defenses breached and bellies empty, the populace lost all faith in the divine authority of their palatial rulers.",
    hi: "दीवारें ढह जाने और पेट खाली होने से आम जनता का अपने राजाओं और देवताओं से भरोसा पूरी तरह उठ गया।",
    prompt: "Simple History 2D graphic novel style, angry Bronze Age commoners staring upward with furrowed brows at a distant palace balcony where a golden king stands paralyzed in indecision, 16:9 widescreen.",
    sfx: "tense_silence_strings", motion: "zoom_in", dur: 11.0, claim: "CLM-23"
  },
  {
    id: 36, beat: 2, sub: 13, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "অনাহার আর হতাশার চূড়ান্ত সীমায় পৌঁছে বিভিন্ন অঞ্চলে শুরু হলো অভ্যন্তরীণ প্রজাবিদ্রোহ ও গৃহযুদ্ধ!",
    en: "Pushed to the brink of utter starvation, widespread peasant rebellions and violent civil wars erupted across the kingdoms!",
    hi: "भुखमरी और बेबसी की इंतहा होने पर कई इलाकों में जनता के भयानक विद्रोह और गृहयुद्ध भड़क उठे!",
    prompt: "Simple History 2D graphic novel style, angry peasants wielding wooden pitchforks and bronze sickles confronting palace guards in an open courtyard, smoke rising behind them, 16:9 widescreen.",
    sfx: "peasant_uprising_shouts", motion: "pan_right", dur: 11.5, claim: "CLM-23"
  },
  {
    id: 37, beat: 2, sub: 14, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "অত্যাচারী কর আদায়কারীদের ওপর ক্ষুব্ধ জনতা হামলা চালাল এবং রাজকীয় শস্যভাণ্ডারগুলো লুট করে নিল।",
    en: "Enraged mobs attacked royal tax collectors, smashing open private imperial silos to seize whatever grain remained.",
    hi: "गुस्साई भीड़ ने शाही लगान वसूलने वालों पर हमला बोल दिया और शाही गोदाम तोड़कर सारा अनाज लूट लिया।",
    prompt: "Simple History 2D graphic novel style, villagers breaking open a heavy barred wooden granary door, spilled golden grain falling onto the stone pavers as guards flee, 16:9 widescreen.",
    sfx: "wood_door_splinter", motion: "zoom_in", dur: 11.0, claim: "CLM-23"
  },
  {
    id: 38, beat: 2, sub: 15, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "পাহাড়ের ডাকাত ও যাযাবর দলগুলো রাতের অন্ধকারে মশাল জ্বালিয়ে অরক্ষিত গ্রামগুলোতে আগুন ধরিয়ে দিতে লাগল!",
    en: "Bandits and mountain tribes swarmed out of the hills under the cover of night, torching defenseless rural settlements!",
    hi: "पहाड़ी लुटेरे और कबीलाई रात के अंधेरे में मशालें जलाकर निहत्थे गांवों पर टूट पड़े और उनमें आग लगा दी!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Masked mountain raiders with crude spears and torches galloping past thatched mud-brick houses, flames licking thatched roofs, orange firelight casting chaotic shadows, 24fps motion.",
    sfx: "fire_crackle_screams", motion: "ai_video", dur: 11.5, claim: "CLM-23"
  },
  {
    id: 39, beat: 2, sub: 16, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "ডাকাত আর দস্যুদের ভয়ে শতাব্দীপ্রাচীন বাণিজ্যিক রাজপথগুলো একে একে সম্পূর্ণ বন্ধ হয়ে গেল।",
    en: "Terrorized by roving raiders, the ancient caravan highways that had connected continents for centuries shut down completely.",
    hi: "लुटेरों के खौफ से सदियों पुराने अंतरराष्ट्रीय व्यापारिक रास्ते एक-एक करके पूरी तरह बंद हो गए।",
    prompt: "Simple History 2D graphic novel style, an abandoned stone desert road littered with overturned wooden wagons and broken pottery wheels under a lonely crimson sunset, 16:9 widescreen.",
    sfx: "desolate_wind_whistle", motion: "pan_left", dur: 11.0, claim: "CLM-03, CLM-23"
  },
  {
    id: 40, beat: 2, sub: 17, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "সমুদ্রের বন্দরে সাইপ্রাসের তামা কিংবা আফগানিস্তানের টিনবাহী জাহাজের আগমন পুরোপুরি থেমে গেল।",
    en: "Harbors saw the arrival of Cypriot copper and Central Asian tin galleys grind to a sudden, absolute halt.",
    hi: "बंदरगाहों पर साइप्रस के तांबे और मध्य एशिया के टिन से लदे जहाजों का आना हमेशा के लिए थम गया।",
    prompt: "Simple History 2D graphic novel style, an empty stone dock with rotting mooring ropes, no ships in sight, gloomy mist clinging to the deserted shoreline, 16:9 widescreen.",
    sfx: "lonely_foghorn_distant", motion: "zoom_out", dur: 11.0, claim: "CLM-03, CLM-24"
  },
  {
    id: 41, beat: 2, sub: 18, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "ফলে রাজকীয় কর্মকাররা নতুন অস্ত্র তৈরির কাঁচামাল হারাল, আর পুরোনো অস্ত্র মেরামতের কোনো উপায় রইল না।",
    en: "Royal armorers lost the raw ingredients to cast new weapons, leaving existing imperial arsenals completely unreplenished.",
    hi: "नतीजतन शाही लोहार नए हथियार बनाने के लिए तरस गए और पुराने हथियारों की मरम्मत का कोई जरिया न बचा।",
    prompt: "Simple History 2D graphic novel style, an ancient bronze foundry with cold, dark stone crucibles, an armorer staring down at an empty metal mold with empty hands, 16:9 widescreen.",
    sfx: "cold_anvil_tap", motion: "zoom_in", dur: 11.5, claim: "CLM-02, CLM-24"
  },
  {
    id: 42, beat: 2, sub: 19, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "ঠিক যখন বিশ্ব অনাহার, ভূমিকম্প আর বাণিজ্যের সংকটে ধুঁকছিল—ঠিক তখনই দিগন্তের সাগরজলে দেখা দিল এক চরম দুঃস্বপ্ন!",
    en: "Just as the civilized world lay paralyzed by famine, quakes, and severed trade, a waking nightmare appeared on the maritime horizon!",
    hi: "ठीक जब दुनिया अकाल, भूकंप और ठप पड़े व्यापार से कराह रही थी—तभी समंदर के क्षितिज पर दिखा एक भयानक खौफनाक मंज़र!",
    prompt: "Simple History 2D graphic novel style, Time Chronicler pointing with alarm toward an ominous maritime horizon shrouded in grey sea mist where dozens of jagged black ship sails emerge, 16:9 widescreen.",
    sfx: "ominous_war_horn_distant", motion: "zoom_in", dur: 12.0, claim: "CLM-11, CLM-14"
  },

  // --- ACT 3: THE FALLING DOMINOS & THE SEA PEOPLES ---
  {
    id: 43, beat: 3, sub: 1, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "সাগরের ঘন কুয়াশা ভেদ করে শত শত যুদ্ধজাহাজ উপকূলে এসে আছড়ে পড়ল, আর তাদের মধ্য থেকে লাফিয়ে নামল হিংস্র সশস্ত্র যোদ্ধারা!",
    en: "Piercing the dense coastal fog, hundreds of war galleys slammed into the beaches, and fierce armored warriors leaped ashore!",
    hi: "समुद्र के घने कोहरे को चीरते हुए सैकड़ों जंगी नावें तट से आ टकराईं और उनमें से खूंखार हथियारबंद योद्धा दहाड़ते हुए कूदे!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Horn-prowed maritime galleys crashing onto golden sand, bronze-clad warriors with feathered crests leaping into crashing surf, brandishing long slashing swords and round shields, 24fps motion.",
    sfx: "ship_landing_war_cries", motion: "ai_video", dur: 12.0, claim: "CLM-14, CLM-19"
  },
  {
    id: 44, beat: 3, sub: 2, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "প্রাচীন ইতিহাসের পাতায় এই রহস্যময় আক্রমণকারীরা পরিচিত 'সি পিপলস' বা সাগর মানব নামে।",
    en: "In the chronicles of ancient history, these enigmatic invaders are famously remembered as the 'Sea Peoples.'",
    hi: "प्राचीन इतिहास के पन्नों में इन रहस्यमयी हमलावरों को 'सी पीपल्स' यानी सागर मानव के नाम से जाना जाता है।",
    prompt: "Simple History 2D graphic novel style, striking character lineup of three Sea Peoples warriors: one with feathered headdress (Peleset), one with horned bronze helmet (Sherden), and one with pointed kilts and round shield, bold ink outlines, 16:9 widescreen.",
    sfx: "warrior_lineup_drum", motion: "zoom_in", dur: 11.5, claim: "CLM-11, CLM-19"
  },
  {
    id: 45, beat: 3, sub: 3, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "কিন্তু তারা আসলে কারা ছিল? কোথা থেকেই বা ঘটেছিল তাদের এই আকস্মিক আগমন?",
    en: "Yet who were they in reality? Where did this sudden catastrophic multitude truly originate?",
    hi: "लेकिन वे असल में कौन थे? और अचानक कहाँ से हुआ था उनका यह भयानक सैलाब?",
    prompt: "Simple History 2D graphic novel style, Time Chronicler examining ancient Egyptian temple stone reliefs depicting foreign captive warriors with a magnifying glass, intrigued scholar expression, 16:9 widescreen.",
    sfx: "curious_instrumental_cue", motion: "zoom_in", dur: 11.0, claim: "CLM-19, CLM-20"
  },
  {
    id: 46, beat: 3, sub: 4, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "তারা কোনো ভিনগ্রহের জীব বা অলৌকিক জলদানব ছিল না; তারা ছিল খরা ও যুদ্ধে ভিটেমাটি হারানো এজিয়ান ও দক্ষিণ ইউরোপের বাস্তুচ্যুত শরণার্থী জাতি!",
    en: "They were no mythical sea monsters, but desperate displaced refugees from the drought-stricken Aegean, Sicily, and Southern Europe!",
    hi: "वे कोई जलदानव या एलियन नहीं थे; वे सूखे और जंग में अपना सब कुछ गंवा चुके एजियन और दक्षिणी यूरोप के बेघर शरणार्थी थे!",
    prompt: "Simple History 2D graphic novel style, displaced families walking along dusty coastal trails, exhausted women and children carrying clay pots, weary men with crude weapons guarding wooden carts, 16:9 widescreen.",
    sfx: "refugee_march_footsteps", motion: "pan_right", dur: 12.0, claim: "CLM-19, CLM-20"
  },
  {
    id: 47, beat: 3, sub: 5, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "মেদিনাত হাবুর চিত্রে স্পষ্ট দেখা যায়—তারা শুধু যুদ্ধজাহাজে আসেনি, বরং দুই চাকার বলদটানা গাড়িতে পরিবার ও সম্বল নিয়ে নতুন আশ্রয়ের খোঁজে এসেছিল।",
    en: "Inscriptions at Medinet Habu vividly depict them migrating not just in ships, but in solid two-wheeled ox-carts carrying women, children, and belongings.",
    hi: "मेदीनेत हाबू के भित्तिचित्र साफ दिखाते हैं—वे सिर्फ नावों में नहीं आए थे, बल्कि दो पहियों वाली बैलगाड़ियों में परिवार और सामान लेकर नई ज़मीन की तलाश में आए थे।",
    prompt: "Simple History 2D graphic novel style, detailed historical rendering inspired by Medinet Habu reliefs showing heavy solid wooden ox-carts pulled by humped oxen, filled with wrapped bundles and children, escorted by horned-helmet guards, 16:9 widescreen.",
    sfx: "ox_cart_creak_wheels", motion: "pan_left", dur: 12.5, claim: "CLM-19"
  },
  {
    id: 48, beat: 3, sub: 6, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "কিন্তু বেঁচে থাকার তীব্র তাগিদে এই লাখ লাখ ক্ষুধার্ত মানুষ পরিণত হয়েছিল এক অপ্রতিরোধ্য বিধ্বংসী বন্যায়!",
    en: "Yet driven by the raw imperative of survival, this displaced multitude transformed into an unstoppable, ravenous human tidal wave!",
    hi: "लेकिन जिंदा रहने की भयानक मजबूरी में यह भूखा जनसैलाब एक बेकाबू विनाशकारी सैलाब बन गया!",
    prompt: "Simple History 2D graphic novel style, vast army of migrating warriors and ships sweeping across a coastal plain like a dark swarm, smoke rising from villages in their wake, 16:9 widescreen.",
    sfx: "ominous_march_horns", motion: "zoom_in", dur: 11.5, claim: "CLM-19, CLM-20"
  },
  {
    id: 49, beat: 3, sub: 7, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "সিরিয়ার সমৃদ্ধ বন্দরনগরী ইউগারিতে তখন রাজত্ব করছিলেন তাদের শেষ রাজা আম্মুরাপি।",
    en: "In the fabulously wealthy Syrian trade hub of Ugarit, King Ammurapi ruled over his city's final days.",
    hi: "सीरिया के अमीर बंदरगाह उगालित में उस समय उनके अंतिम राजा अम्मुरापी का शासन था।",
    prompt: "Simple History 2D graphic novel style, King Ammurapi sitting upon a carved stone throne inside the palace of Ugarit, looking out through palace columns at the sea with anxious, heavy eyes, 16:9 widescreen.",
    sfx: "solemn_palace_harp", motion: "zoom_in", dur: 11.0, claim: "CLM-14"
  },
  {
    id: 50, beat: 3, sub: 8, type: "DYNAMIC_AI_VIDEO", speaker: "KING_AMMURAPI",
    bn: "রাজা আম্মুরাপি কাঁপতে কাঁপতে মাটির ফলকে লিখলেন: 'হে আমার পিতা, শত্রুর জাহাজ এসে গেছে, তারা আমার নগরীগুলো পুড়িয়ে দিচ্ছে!'",
    en: "King Ammurapi trembled as he etched on clay: 'My father, the enemy ships have arrived; they are burning our coastal cities!'",
    hi: "राजा अम्मुरापी ने कांपते हाथों से मिट्टी पर उकेरा: 'हे मेरे पिता, दुश्मन के जहाज़ आ पहुंचे हैं, वे हमारे तटीय नगरों को जला रहे हैं!'",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. King Ammurapi hastily pressing a reed stylus into a moist clay tablet by flickering torchlight, looking toward the window in terror as orange fire reflects in his eyes, 24fps motion.",
    sfx: "cuneiform_rapid_chisel", motion: "ai_video", dur: 12.0, claim: "CLM-14"
  },
  {
    id: 51, beat: 3, sub: 9, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "তিনি আরও লিখেছিলেন: 'আমার নিজের সেনাবাহিনী হত্তিতে আটকে আছে আর নৌবহর লিসিয়ায়—আমার দেশ সম্পূর্ণ অরক্ষিত!'",
    en: "He continued in despair: 'All my troops and chariots are deployed in Hatti, and my navy is away in Lycia—my realm is completely defenseless!'",
    hi: "उन्होंने बेबसी में आगे लिखा: 'मेरी अपनी सेना हित्ती देश में फंसी है और नौसेना लूसिया में—मेरा देश पूरी तरह बेसहारा है!'",
    prompt: "Simple History 2D graphic novel style, panoramic tactical map showing Ugarit's armies stranded far inland in Anatolia while empty coastal fortresses face oncoming enemy warships, 16:9 widescreen.",
    sfx: "tense_percussion_hit", motion: "zoom_out", dur: 12.0, claim: "CLM-14"
  },
  {
    id: 52, beat: 3, sub: 10, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "বহু বছর ধরে গল্প প্রচলিত ছিল যে, চিঠিটি পোড়ানোর জন্য তন্দুরে থাকা অবস্থাতেই শত্রুরা দরজায় আঘাত হেনেছিল।",
    en: "For decades, romantic legend claimed the tablet was caught baking in a kiln at the exact moment raiders smashed through the gates.",
    hi: "दशकों तक यह रूमानी कहानी मशहूर रही कि तख्ती जब भट्ठी में पक रही थी, ठीक उसी पल हमलावरों ने दरवाजे तोड़ डाले।",
    prompt: "Simple History 2D graphic novel style, dramatic illustration of an ancient clay oven with glowing red embers inside a palace archive, an unbaked clay tablet resting on hot coals, 16:9 widescreen.",
    sfx: "fire_hearth_hum", motion: "zoom_in", dur: 12.0, claim: "CLM-15"
  },
  {
    id: 53, beat: 3, sub: 11, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "আধুনিক প্রত্নতাত্ত্বিকরা প্রমাণ করেছেন ওভেনটি ছিল পরের যুগের, তবে চিঠির ভেতরে থাকা সেই ভয়ংকর আর্তনাদ ছিল একশত ভাগ বাস্তব!",
    en: "Modern excavators proved the kiln was built by later squatters, but the sheer terror preserved inside the text was entirely real!",
    hi: "आधुनिक पुरातत्वविदों ने साबित किया कि वह भट्ठी बाद के लोगों की थी, लेकिन उस पत्र में दर्ज भयानक खौफ सौ प्रतिशत सच था!",
    prompt: "Simple History 2D graphic novel style, Time Chronicler holding clay tablet RS 20.238 carefully with cotton gloves, nodding solemnly in scholarly verification, 16:9 widescreen.",
    sfx: "revelation_bell_soft", motion: "zoom_out", dur: 12.0, claim: "CLM-15"
  },
  {
    id: 54, beat: 3, sub: 12, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "মুহূর্তের মধ্যে সমৃদ্ধ ইউগারিত নগরী লেলিহান আগুনে পুড়ে ছাই হয়ে গেল, যা গত ৩০০০ বছরেও আর কোনোদিন পুনর্নির্মিত হয়নি!",
    en: "Within hours, the magnificent metropolis of Ugarit burned to absolute ash, never to be inhabited again for over three thousand years!",
    hi: "चंद घंटों में वैभवशाली उगालित नगर धधकती आग में जलकर राख हो गया, जो पिछले ३००० सालों में फिर कभी दोबारा नहीं बसा!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Raging inferno devouring the cedar-wood roofs and limestone pillars of Ugarit's royal palace, sparks billowing into the black night sky, collapsing stone lintel, 24fps motion.",
    sfx: "massive_building_inferno", motion: "ai_video", dur: 12.0, claim: "CLM-13"
  },
  {
    id: 55, beat: 3, sub: 13, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "একে একে লেভান্ট ও সাইপ্রাসের প্রাচীন বন্দরগুলো ধুলোয় মিশে গেল—যেন এক অদৃশ্য হাত মানচিত্র থেকে তাদের চিরতরে মুছে দিল।",
    en: "One by one, the ancient port citadels of the Levant and Cyprus collapsed into ruin, as if wiped clean by an invisible hand.",
    hi: "एक-एक करके लेवांत और साइप्रस के प्राचीन बंदरगाह मिट्टी में मिल गए—मानो किसी अनदेखे हाथ ने नक्शे से उन्हें हमेशा के लिए मिटा दिया हो।",
    prompt: "Simple History 2D graphic novel style, smoking ruins of Byblos, Enkomi, and Megiddo marked on an ancient parchment map by blackened scorch marks and red falling arrows, 16:9 widescreen.",
    sfx: "somber_drone_wind", motion: "pan_right", dur: 11.5, claim: "CLM-20"
  },
  {
    id: 56, beat: 3, sub: 14, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "এরপর পতন ঘটল আনাতোলিয়ার পরাক্রমশালী হিট্টাইট সাম্রাজ্যের চারশত বছরের রাজধানী হাত্তুসার।",
    en: "Next fell Hattusa, the four-hundred-year-old imperial capital of the mighty Hittite superpower.",
    hi: "इसके बाद पतन हुआ अनातोलिया के ताकतवर हित्ती साम्राज्य की चार सौ साल पुरानी राजधानी हात्तुसा का।",
    prompt: "Simple History 2D graphic novel style, monumental cyclopean ruins of Hattusa, silent shattered stone ramparts overlooking the vast Anatolian plateau at bleak twilight, 16:9 widescreen.",
    sfx: "bleak_wind_brass", motion: "zoom_in", dur: 11.5, claim: "CLM-16"
  },
  {
    id: 57, beat: 3, sub: 15, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "শত্রুরা পৌঁছানোর আগেই রাজপরিবার তাদের ধনরত্ন নিয়ে পালিয়ে গিয়েছিল, আর পরিত্যক্ত প্রাসাদটি পুড়ে অঙ্গার হয়ে গেল!",
    en: "The royal elite evacuated their archives and treasures in haste, leaving the abandoned palaces to be consumed by flame!",
    hi: "दुश्मन के पहुंचने से पहले ही शाही परिवार अपने खजाने लेकर भाग चुका था, और सूना पड़ा महल आग की लपटों में जलकर खाक हो गया!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Silhouette of royal Hittite court fleeing with loaded carts along a rocky gorge under a blood-red sky, behind them Hattusa's great temple burning in distance, 24fps motion.",
    sfx: "distant_burning_chariots", motion: "ai_video", dur: 11.5, claim: "CLM-16"
  },
  {
    id: 58, beat: 3, sub: 16, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "গ্রিসের মাইসিনি এবং পাইলসের সুরক্ষিত রাজপ্রাসাদগুলোও রেহাই পেল না; সেগুলোও পুড়ে মাটিতে মিশে গেল।",
    en: "The formidable fortified palaces of Mycenae and Pylos in Greece were similarly besieged, torched, and razed.",
    hi: "ग्रीस के माइसीनिया और पाइलोस के मजबूत शाही महल भी न बच सके; वे भी जलकर खाक में मिल गए।",
    prompt: "Simple History 2D graphic novel style, charred ruins of the Palace of Nestor at Pylos, blackened megaron throne room hearth surrounded by collapsed stucco walls, 16:9 widescreen.",
    sfx: "somber_cello_mourn", motion: "zoom_in", dur: 11.5, claim: "CLM-17"
  },
  {
    id: 59, beat: 3, sub: 17, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "আর সেই প্রাসাদগুলো পুড়ে যাওয়ার সাথে সাথে বিলুপ্ত হয়ে গেল তাদের প্রশাসনিক লিপি 'লিনিয়ার বি'!",
    en: "And with the incineration of those administrative complexes died their palace writing system: Linear B!",
    hi: "और उन महलों के जलने के साथ ही हमेशा के लिए मिट गई उनकी प्रशासनिक लिपि 'लीनियर बी'!",
    prompt: "Simple History 2D graphic novel style, a clay tablet inscribed with Linear B syllabic signs crumbling into grey dust and floating away into dark smoke, 16:9 widescreen.",
    sfx: "paper_dissolve_magic", motion: "zoom_in", dur: 11.5, claim: "CLM-18"
  },
  {
    id: 60, beat: 3, sub: 18, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "পুরো গ্রিস নিমজ্জিত হলো চারশত বছরের চরম নিরক্ষরতায়—যেখানে কোনো লিখিত শব্দ, ইতিহাস কিংবা বিজ্ঞান জন্মায়নি!",
    en: "Greece was cast into four centuries of total illiteracy—a dark age without a single written word, chronicle, or science!",
    hi: "पूरा ग्रीस चार सौ साल के घोर अंधकार और अशिक्षा में डूब गया—जहाँ एक भी लिखित शब्द या इतिहास दर्ज नहीं हुआ!",
    prompt: "Simple History 2D graphic novel style, primitive Greek pastoral village during the Dark Ages, simple mud huts, illiterate goat herders around a small fire under a cold starry sky, forgotten palace ruins on the hill above, 16:9 widescreen.",
    sfx: "lonely_pastoral_wind", motion: "pan_left", dur: 12.0, claim: "CLM-18"
  },
  {
    id: 61, beat: 3, sub: 19, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "সব সাম্রাজ্য ধ্বংস করে এই অপ্রতিরোধ্য যাযাবর বাহিনী তখন ধেয়ে এলো তাদের শেষ ও সবচেয়ে লোভনীয় লক্ষ্য—প্রাচীন মিশরের দিকে!",
    en: "Having pulverized every empire in their path, this unstoppable human tide marched toward their final and richest prize: Egypt!",
    hi: "सारे साम्राज्यों को रौंदने के बाद यह अजेय सैलाब अपने आखिरी और सबसे बड़े शिकार की ओर बढ़ा—प्राचीन मिस्र!",
    prompt: "Simple History 2D graphic novel style, vast army of Sea Peoples marchers and naval flotillas advancing relentlessly along the sandy Mediterranean coast toward the lush green delta of Egypt, 16:9 widescreen.",
    sfx: "approaching_war_drums", motion: "zoom_in", dur: 12.0, claim: "CLM-20"
  },
  {
    id: 62, beat: 3, sub: 20, type: "DYNAMIC_AI_VIDEO", speaker: "PHARAOH_RAMESSES_III",
    bn: "খ্রিস্টপূর্ব ১১৭৭ অব্দে নীল নদের মোহনায় মিশরের ফারাও ৩য় রামসেস চিৎকার করে আদেশ দিলেন: 'নীল নদের মাটি যেন তাদের সমাধি হয়!'",
    en: "In 1177 BCE at the mouth of the Nile, Pharaoh Ramesses III roared his command: 'Let the soil of the Nile become their grave!'",
    hi: "ईसा पूर्व ११७७ में नील नदी के मुहाने पर मिस्र के फिरौन रामसेस तृतीय ने ललकारते हुए आदेश दिया: 'नील नदी की मिट्टी ही इनकी कब्र बने!'",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Pharaoh Ramesses III in full golden battle armor and blue khepresh crown drawing a massive curved golden composite bow aboard an Egyptian flagship, his eyes blazing, 24fps motion.",
    sfx: "pharaoh_battle_cry_fanfare", motion: "ai_video", dur: 12.0, claim: "CLM-21"
  },
  {
    id: 63, beat: 3, sub: 21, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "তীরের ঝোপঝাড় আর জলাভূমিতে লুকিয়ে থাকা হাজার হাজার মিশরীয় তীরন্দাজ শত্রুর জাহাজের ওপর বিষাক্ত তীরের বৃষ্টি ঝরাল।",
    en: "Hidden in the papyrus marshes, thousands of disciplined Egyptian archers rained relentless volleys of arrows onto the invaders' boats.",
    hi: "सरकंडों के दलदल में छिपे हज़ारों अनुशासित मिस्री तीरंदाजों ने दुश्मन की नावों पर तीरों की मूसलाधार बारिश कर दी।",
    prompt: "Simple History 2D graphic novel style, dense ranks of Egyptian archers kneeling in tall green Nile papyrus reeds, hundreds of drawn bows unleashing dark swarms of arrows upward, 16:9 widescreen.",
    sfx: "arrow_volley_whistle", motion: "pan_right", dur: 11.5, claim: "CLM-21"
  },
  {
    id: 64, beat: 3, sub: 22, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "মিশরীয় নাবিকরা দীর্ঘ রশি আর লোহার নোঙর ছুড়ে শত্রুর নৌকাগুলোকে উল্টে দিল এবং হাজার হাজার যোদ্ধাকে সাগরে ডুবিয়ে মারল!",
    en: "Egyptian sailors hurled grappling hooks and iron anchors, capsizing the enemy vessels and dragging thousands to watery deaths!",
    hi: "मिस्री मल्लाहों ने लोहे के कांटेदार लंगर फेंककर दुश्मन की कश्तियों को पलट दिया और हज़ारों हमलावरों को जलसमाधि दे दी!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Egyptian warship crew throwing heavy bronze grappling hooks over the rails of a Sea Peoples galley, ropes tightening, enemy boat capsizing sideways into frothing Nile Delta waters, 24fps motion.",
    sfx: "ship_splinter_water_splash", motion: "ai_video", dur: 12.0, claim: "CLM-21"
  },

  // --- ACT 4: POST-MORTEM & THE IRON DAWN ---
  {
    id: 65, beat: 4, sub: 1, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "মেদিনাত হাবুর মন্দিরের দেয়ালে ফারাও দম্ভভরে খোদাই করেছিলেন: 'কোনো দেশ তাদের অস্ত্রের সামনে দাঁড়াতে পারেনি, কিন্তু মিশরে এসে তারা নিশ্চিহ্ন হলো!'",
    en: "On his mortuary temple walls at Medinet Habu, Ramesses III carved: 'No land could stand before their arms, but in Egypt they were extinguished!'",
    hi: "मेदीनेत हाबू मंदिर की दीवारों पर फिरौन ने गर्व से खुदवाया: 'कोई देश उनके हथियारों के आगे नहीं टिक सका, लेकिन मिस्र में आकर वे खाक हो गए!'",
    prompt: "Simple History 2D graphic novel style, monumental carved stone wall of Medinet Habu with deep hieroglyphic inscriptions illuminated by golden torchlight, depicting captured Sea Peoples in feathered caps led in chains, 16:9 widescreen.",
    sfx: "monumental_brass_chime", motion: "zoom_in", dur: 12.5, claim: "CLM-20, CLM-21"
  },
  {
    id: 66, beat: 4, sub: 2, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "মিশর যুদ্ধে হয়তো জয়ী হয়েছিল, কিন্তু এই বিজয়ের মূল্য ছিল তাদের সমস্ত অর্থনৈতিক ও সামাজিক অস্তিত্বের চরম নিঃশেষণ!",
    en: "Egypt had survived militarily, but the victory came at the cost of total fiscal and structural exhaustion!",
    hi: "मिस्र जंग तो जीत गया, लेकिन इस जीत की कीमत उसने अपनी पूरी अर्थव्यवस्था और ताकत को तबाह करके चुकाई!",
    prompt: "Simple History 2D graphic novel style, Time Chronicler looking thoughtfully at an empty Egyptian treasury vault with empty gold pedestals and scattered account papyri, 16:9 widescreen.",
    sfx: "empty_echo_hall", motion: "zoom_in", dur: 11.5, claim: "CLM-01, CLM-23"
  },
  {
    id: 67, beat: 4, sub: 3, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "যুদ্ধ শেষে ফারাওয়ের রাজকোষ শূন্য হয়ে গেল, সৈন্যদের বেতন আটকে গেল এবং প্রাচীন মিশরে শুরু হলো মানব ইতিহাসের প্রথম নথিবদ্ধ শ্রমিক ধর্মঘট!",
    en: "The treasury was bankrupt, royal tomb builders were unpaid, and Egypt witnessed the first recorded labor strike in human history!",
    hi: "शाही खजाना खाली हो गया, सैनिकों की तनख्वाह रुक गई और प्राचीन मिस्र में शुरू हुई मानव इतिहास की पहली दर्ज हड़ताल!",
    prompt: "Simple History 2D graphic novel style, Egyptian royal tomb artisans and sculptors sitting down on the stones of Deir el-Medina with folded arms, refusing to work for the vizier, 16:9 widescreen.",
    sfx: "strike_clamor_subtle", motion: "pan_left", dur: 12.0, claim: "CLM-23"
  },
  {
    id: 68, beat: 4, sub: 4, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "বিখ্যাত প্রত্নতাত্ত্বিক এরিক ক্লাইন তার গবেষণায় দেখিয়েছেন—ব্রোঞ্জ যুগের এই পতন কোনো একক শত্রু বা কোনো একক দুর্যোগের ফল ছিল না।",
    en: "Eminent archaeologist Eric Cline demonstrated that this catastrophe was never the fault of a single invader or solitary disaster.",
    hi: "प्रसिद्ध पुरातत्वविद एरिक क्लाइन ने अपने शोध में साबित किया कि यह तबाही किसी एक दुश्मन या अकेले संकट की वजह से नहीं हुई थी।",
    prompt: "Simple History 2D graphic novel style, modern archaeological analysis diagram showing interlocking gears labeled: Megadrought, Earthquake Storms, Famine, Broken Trade Routes, Rebellion, and Sea Peoples Raids, 16:9 widescreen.",
    sfx: "gears_turning_clockwork", motion: "zoom_in", dur: 12.0, claim: "CLM-23"
  },
  {
    id: 69, beat: 4, sub: 5, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "এটি ছিল এক নিখুঁত 'সিস্টেমস কলাপ্স'—যেখানে প্রতিটি সংকট অন্যটিকে তীব্রতর করে এক অভাবনীয় ধ্বংসযজ্ঞ তৈরি করেছিল!",
    en: "It was a textbook 'systems collapse'—a catastrophic domino cascade where each failure amplified the next into mutual ruin!",
    hi: "यह एक संपूर्ण 'सिस्टम्स कोलैप्स' था—जहाँ हर संकट ने दूसरे संकट को भड़काकर एक महाप्रलय पैदा कर दिया!",
    prompt: "Simple History 2D graphic novel style, dramatic falling domino animation style: huge stone monuments tipping over and crushing one another in a sequence until all lie flat in dust, 16:9 widescreen.",
    sfx: "domino_stone_topple", motion: "zoom_out", dur: 11.5, claim: "CLM-23"
  },
  {
    id: 70, beat: 4, sub: 6, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "কিন্তু বন্ধুরা, ইতিহাসের সবচেয়ে বড় শিক্ষা হলো—প্রতিটি মহাধ্বংসের ছাই থেকেই জন্ম নেয় এক সম্পূর্ণ নতুন মানব সভ্যতা!",
    en: "Yet the greatest lesson of history is this: from the ashes of every great cataclysm rises an entirely new human world!",
    hi: "लेकिन दोस्तों, इतिहास का सबसे बड़ा सबक यही है—हर महाविनाश की राख से ही एक बिल्कुल नई मानव सभ्यता का जन्म होता है!",
    prompt: "Simple History 2D graphic novel style, Time Chronicler smiling with warmth and hope, a tiny green sprout breaking through charred black ash in front of ancient ruined columns at dawn, 16:9 widescreen.",
    sfx: "hopeful_dawn_strings", motion: "zoom_in", dur: 12.0, claim: "CLM-24, CLM-25"
  },
  {
    id: 71, beat: 4, sub: 7, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "বাণিজ্যপথ ধ্বংস হওয়ায় ব্রোঞ্জ তৈরির মহার্ঘ্য টিন পাওয়া যখন অসম্ভব হয়ে গেল, তখন বেঁচে থাকার তাগিদে মানুষ খুঁজে বের করল এক বিকল্প।",
    en: "With trade lanes severed and tin impossible to import, necessity forced humanity to seek an abundant substitute.",
    hi: "व्यापारिक रास्ते कट जाने से जब कांस्य का कीमती टिन मिलना नामुमकिन हो गया, तब मजबूरी ने इंसान को एक नया रास्ता दिखाया।",
    prompt: "Simple History 2D graphic novel style, an ancient artisan examining a heavy, rough chunk of dark red-brown iron ore with a look of intense discovery, 16:9 widescreen.",
    sfx: "ore_inspection_clink", motion: "zoom_in", dur: 11.5, claim: "CLM-24"
  },
  {
    id: 72, beat: 4, sub: 8, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "কামারশালায় চারকোল আর হাপরের তীব্র বাতাসে তাপমাত্রা বাড়িয়ে কর্মকাররা মাটির নিচে প্রচুর থাকা লোহার আকরিক গলাতে শিখে গেল!",
    en: "Pumping bellows to generate scorching heat, metalsmiths mastered the elusive craft of smelting common iron ore!",
    hi: "धौंकनी से दहकते कोयले की आग को भड़काकर लोहारों ने जमीन के नीचे बहुतायत में मौजूद लोहे के अयस्क को पिघलाना सीख लिया!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Muscular ancient blacksmith fiercely slamming a heavy hammer down onto a glowing red-orange hot iron blade on a stone anvil, brilliant sparks showering across a dark forge, 24fps motion.",
    sfx: "heavy_hammer_anvil_strike", motion: "ai_video", dur: 12.0, claim: "CLM-24"
  },
  {
    id: 73, beat: 4, sub: 9, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "ব্রোঞ্জ ছিল কেবল ধনী সম্রাট ও রাজাদের বিলাসিতা, কিন্তু লোহা ছিল সাধারণ কৃষকের সহজলভ্য গণমুখী হাতিয়ার।",
    en: "Bronze had been an elite luxury monopolized by emperors, but iron was cheap, abundant, and accessible to the common man.",
    hi: "कांस्य सिर्फ अमीर राजाओं और शहंशाहों की बपौती था, लेकिन लोहा आम किसानों और गरीबों का सुलभ औजार बन गया।",
    prompt: "Simple History 2D graphic novel style, split illustration contrasting a decadent golden pharaoh with a single bronze sword against dozens of smiling ordinary villagers equipped with sturdy black iron sickles, 16:9 widescreen.",
    sfx: "iron_tool_clatter", motion: "pan_right", dur: 11.5, claim: "CLM-24"
  },
  {
    id: 74, beat: 4, sub: 10, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "লোহার এই সহজলভ্যতা সামরিক ও অর্থনৈতিক ক্ষমতাকে কয়েকজন স্বৈরশাসকের হাত থেকে ছিনিয়ে তৃণমূল মানুষের হাতে পৌঁছে দিল।",
    en: "The democratization of iron stripped monopolistic power from absolute monarchs and distributed it among ordinary people.",
    hi: "लोहे की इस उपलब्धता ने ताकत को चंद तानाशाहों के हाथों से छीनकर आम जनता की हथेलियों में रख दिया।",
    prompt: "Simple History 2D graphic novel style, symbolic illustration showing a giant golden imperial crown gently crumbling into dust as sturdy iron farming tools and village workshop gears rise into prominence, 16:9 widescreen.",
    sfx: "liberation_horn_tone", motion: "zoom_out", dur: 12.0, claim: "CLM-24, CLM-25"
  },
  {
    id: 75, beat: 4, sub: 11, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "মহাদলগুলোর পতনের পর লেভান্টের মুক্ত বাতাসে মাথা তুলে দাঁড়াল বহু ক্ষুদ্র কিন্তু স্বাধীন সমাজ ও নতুন জাতি।",
    en: "In the power vacuum left by the fallen giants, small independent communities and fresh cultural identities flourished.",
    hi: "विशाल साम्राज्यों के खात्मे के बाद लेवांत की खुली हवा में कई छोटे मगर आज़ाद समाज और नई कौमें सिर उठाकर खड़ी हुईं।",
    prompt: "Simple History 2D graphic novel style, picturesque hill-country settlements in the Levant, independent farmers terracing olive groves and dry-farming barley on sunny mountain slopes, 16:9 widescreen.",
    sfx: "peaceful_village_flute", motion: "pan_left", dur: 11.5, claim: "CLM-25"
  },
  {
    id: 76, beat: 4, sub: 12, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "পরাজিত সাগর মানব বা 'পেলেসেত' যোদ্ধারা দক্ষিণ কানানের সমুদ্রতীরে পাঁচটি শক্তিশালী নগরী গড়ে তুলে বসতি স্থাপন করল।",
    en: "The defeated Sea Peoples known as the Peleset settled permanently along the southern Canaanite coast, founding five great cities.",
    hi: "पराजित सागर मानव यानी 'पेलेसेत' दक्षिणी कनान के तट पर बस गए और उन्होंने पांच ताकतवर नगर बसाए।",
    prompt: "Simple History 2D graphic novel style, fortified coastal Philistine city of Ashkelon with Aegean-style architecture and ceramic kilns, merchant docks busy with coastal trade, 16:9 widescreen.",
    sfx: "philistine_harbor_ambient", motion: "zoom_in", dur: 12.0, claim: "CLM-22"
  },
  {
    id: 77, beat: 4, sub: 13, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "ইতিহাস ও ধর্মগ্রন্থের পাতায় এরাই পরিচিত হলো 'ফিলিস্তিনি' হিসেবে, যাদের রঙিন এজিয়ান মৃৎপাত্র আজও মাটির নিচে টিকে আছে।",
    en: "In chronicles and scriptures, they became known as the Philistines, leaving distinctive Aegean-style bichrome pottery for archaeologists.",
    hi: "इतिहास और धर्मग्रंथों में यही कौम 'फ़िलिस्तीनी' कहलाई, जिनके खास एजियन शैली के बर्तन आज भी मिट्टी के नीचे मिलते हैं।",
    prompt: "Simple History 2D graphic novel style, beautiful Philistine bichrome ceramic vessel with stylized black-and-red painted water birds, excavated carefully by an archaeologist's brush, 16:9 widescreen.",
    sfx: "archaeology_brush_soft", motion: "zoom_in", dur: 12.0, claim: "CLM-22"
  },
  {
    id: 78, beat: 4, sub: 14, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "একই সঙ্গে পাহাড়ি অঞ্চলে বিকাশ লাভ করল হিব্রু ও আরামীয় জাতিসত্তা, যাদের ঐতিহ্য পরবর্তীকালে বিশ্ব সভ্যতাকে গভীরভাবে নাড়া দিয়েছে।",
    en: "Alongside them in the highlands emerged Hebrew and Aramean societies whose enduring traditions would shape world history.",
    hi: "उसी के साथ पहाड़ी इलाकों में हिब्रू और अरामी समाजों का उदय हुआ, जिनकी परंपराओं ने आगे चलकर दुनिया की सोच को बदल दिया।",
    prompt: "Simple History 2D graphic novel style, ancient shepherd in simple woolen tunic standing upon the Judean hills at sunrise, looking out toward distant fertile valleys, dignified posture, 16:9 widescreen.",
    sfx: "ancient_hebrew_kinor", motion: "pan_right", dur: 12.0, claim: "CLM-25, CLM-26"
  },
  {
    id: 79, beat: 4, sub: 15, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "শত শত জটিল চিত্রলিপি আর দুর্বোধ্য রাজকীয় কিউনিফর্মের দিনও শেষ হয়ে এলো।",
    en: "The age of cumbersome royal hieroglyphs and hundreds of baffling cuneiform symbols came to a swift end.",
    hi: "सैकड़ों पेचीदा चित्रलिपियों और राजाओं की कठिन क्यूनिफॉर्म लिपि के दिन भी लद गए।",
    prompt: "Simple History 2D graphic novel style, side-by-side comparison: an intimidating wall filled with hundreds of confusing Egyptian hieroglyphs next to a clean, simple clay tile, 16:9 widescreen.",
    sfx: "page_turn_clean", motion: "zoom_out", dur: 11.5, claim: "CLM-25"
  },
  {
    id: 80, beat: 4, sub: 16, type: "DYNAMIC_AI_VIDEO", speaker: "NARRATOR",
    bn: "লেভান্টের উপকূলীয় ফোনিশীয় ব্যবসায়ীরা আবিষ্কার করল মাত্র বাইশটি সহজ অক্ষরের বৈপ্লবিক ধ্বনিভিত্তিক বর্ণমালা!",
    en: "Coastal Phoenician seafarers created a revolutionary phonetic alphabet consisting of just twenty-two simple letters!",
    hi: "लेवांत के फोनिशियन व्यापारियों ने महज़ बाईस सरल अक्षरों वाली एक क्रांतिकारी ध्वनि-आधारित वर्णमाला ईजाद की!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. A clever Phoenician merchant in purple robes swiftly carving simple alphabet symbols (Aleph, Beth, Gimel) into a fresh clay tablet with confident, elegant strokes, ink glowing softly, 24fps motion.",
    sfx: "pen_stylus_carve_magic", motion: "ai_video", dur: 12.0, claim: "CLM-25"
  },
  {
    id: 81, beat: 4, sub: 17, type: "STATIC_IMAGE", speaker: "NARRATOR",
    bn: "সেই বাইশটি সহজ অক্ষর থেকেই জন্ম নিয়েছে আজকের গ্রিক, ল্যাটিন, আরবি, হিন্দি এবং পৃথিবীর প্রায় সমস্ত আধুনিক ভাষার বর্ণমালা!",
    en: "From those twenty-two letters descended Greek, Latin, Arabic, Devanagari, and virtually every modern alphabet on Earth!",
    hi: "उन्हीं बाईस अक्षरों से जन्म हुआ आज की ग्रीक, लैटिन, अरबी, देवनागरी और दुनिया की लगभग हर आधुनिक लिपि का!",
    prompt: "Simple History 2D graphic novel style, genealogical tree of writing: starting from the Phoenician letter Aleph at the root branching out into Greek Alpha, Latin A, and Arabic Alif in luminous golden letters, 16:9 widescreen.",
    sfx: "triumphant_knowledge_fanfare", motion: "zoom_in", dur: 12.5, claim: "CLM-25"
  },
  {
    id: 82, beat: 4, sub: 18, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "ইতিহাস আমাদের মনে করিয়ে দেয়—কোনো পরাশক্তিই চিরস্থায়ী নয়, এবং প্রকৃতির নিয়মের সামনে সবচেয়ে অহংকারী সাম্রাজ্যও বিনীত হতে বাধ্য।",
    en: "History reminds us that no superpower is immortal, and before the laws of nature and time, even the proudest empires must bow.",
    hi: "इतिहास हमें याद दिलाता है—कोई भी महाशक्ति अमर नहीं है, और कुदरत के नियमों के आगे सबसे घमंडी सल्तनत को भी झुकना पड़ता है।",
    prompt: "Simple History 2D graphic novel style, Time Chronicler standing among ancient weathered ruins under a vast starry night sky, looking forward with wise reflective gaze, 16:9 widescreen.",
    sfx: "contemplative_cello_theme", motion: "zoom_in", dur: 12.0, claim: "CLM-23, CLM-26"
  },
  {
    id: 83, beat: 4, sub: 19, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "আজকের চরম প্রযুক্তিনির্ভর আধুনিক পৃথিবীও কিন্তু ইন্টারনেট, বিদ্যুৎ আর বিরল খনিজের অতি-সংবেদনশীল বৈশ্বিক সাপ্লাই চেইনের ওপর দাঁড়িয়ে আছে।",
    en: "Today's hyper-technological civilization likewise rests upon fragile global supply chains of microchips, energy, and rare minerals.",
    hi: "आज की आधुनिक तकनीकी दुनिया भी माइक्रोचिप्स, बिजली और नाज़ुक वैश्विक सप्‍लाई चेन के धागों पर ही टिकी हुई है।",
    prompt: "Simple History 2D graphic novel style, modern futuristic cityscape glowing with fiber-optic data streams and semiconductor circuit lines merging seamlessly into the ancient trade routes of old, 16:9 widescreen.",
    sfx: "modern_data_hum", motion: "zoom_out", dur: 12.0, claim: "CLM-01, CLM-23"
  },
  {
    id: 84, beat: 4, sub: 20, type: "STATIC_IMAGE", speaker: "TIME_CHRONICLER",
    bn: "যদি কোনোদিন সেই চেইন ছিঁড়ে যায়, তবে আমরা কি ৩০০০ বছর আগের ব্রোঞ্জ যুগের মানুষের চেয়ে বেশি প্রস্তুত?",
    en: "If those vital links ever snap, are we truly any more resilient than the people of the Late Bronze Age three thousand years ago?",
    hi: "अगर कभी वे नाज़ुक रिश्ते टूट गए, तो क्या हम ३००० साल पहले के कांस्य युग के इंसानों से ज़्यादा तैयार हैं?",
    prompt: "Simple History 2D graphic novel style, Time Chronicler looking directly into the viewer's eyes with an intense, thought-provoking philosophical expression, raising his glowing bronze torch, 16:9 widescreen.",
    sfx: "deep_resonance_toll", motion: "zoom_in", dur: 11.5, claim: "CLM-23"
  },
  {
    id: 85, beat: 4, sub: 21, type: "DYNAMIC_AI_VIDEO", speaker: "TIME_CHRONICLER",
    bn: "ইতিহাসের এমন রোমাঞ্চকর ও অজানা সত্য উন্মোচনে আমাদের সাথে যুক্ত থাকতে এখনই 'সিম্পল হিস্ট্রি টেলার বাংলা' সাবস্ক্রাইব করে বেল বাটন বাজিয়ে রাখো!",
    en: "To uncover more thrilling lost truths from the chronicles of human history, subscribe to Simple History Teller and hit the bell icon right now!",
    hi: "इतिहास के ऐसे ही रोमांचक और अनसुलझे रहस्यों को जानने के लिए अभी 'सिंपल हिस्ट्री टेलर हिंदी' को सब्सक्राइब करें और बेल आइकन दबाएं!",
    prompt: "Dynamic 2D animation in Simple History graphic novel style. Time Chronicler with a genial grandfatherly smile shutting the massive leather-bound chronicle with an echoing thud, golden dust motes rising, cheerfully waving to camera and pointing down toward the subscribe button, 24fps motion.",
    sfx: "book_slam_outro_fanfare", motion: "ai_video", dur: 12.0, claim: "CLM-26"
  }
];

// Verify counts
const dynamicCount = rawScenes.filter(s => s.type === "DYNAMIC_AI_VIDEO").length;
const staticCount = rawScenes.filter(s => s.type === "STATIC_IMAGE").length;
console.log(`Total Scenes: ${rawScenes.length}`);
console.log(`DYNAMIC_AI_VIDEO: ${dynamicCount} (${(dynamicCount / rawScenes.length * 100).toFixed(1)}%)`);
console.log(`STATIC_IMAGE: ${staticCount} (${(staticCount / rawScenes.length * 100).toFixed(1)}%)`);

// Build project.json structure
let currentTimestamp = 0;
const scenesArray = rawScenes.map(s => {
  const assetFile = s.type === "DYNAMIC_AI_VIDEO"
    ? `visual_assets/clip_scene_${String(s.id).padStart(4, '0')}.mp4`
    : `visual_assets/scene_${String(s.id).padStart(4, '0')}.png`;

  const negativePrompt = " --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients";
  const fullVisualPrompt = s.prompt.includes("--no") ? s.prompt : s.prompt + negativePrompt;

  const aistudioVoice = s.speaker === "TIME_CHRONICLER" ? "Cruz" : "Charon";
  const stylePrompt = s.speaker === "TIME_CHRONICLER" 
    ? "An Old Story Teller, Old Man voice" 
    : "An Authoritative Documentary Narrator, Deep Resonant voice";

  const sceneObj = {
    scene_id: s.id,
    parent_beat: s.beat,
    sub_id: s.sub,
    type: s.type,
    dialogue_speaker: s.speaker,
    narration: {
      bn: s.bn,
      en: s.en,
      hi: s.hi
    },
    visual_prompt: fullVisualPrompt,
    asset_file: assetFile,
    sfx: s.sfx,
    motion_effect: s.motion,
    duration: s.dur,
    language_durations: {
      bn: Number((s.dur * 1.05).toFixed(2)),
      en: Number((s.dur * 0.95).toFixed(2)),
      hi: Number((s.dur * 1.02).toFixed(2))
    },
    timestamp_start: Number(currentTimestamp.toFixed(2)),
    timestamp_end: Number((currentTimestamp + s.dur).toFixed(2)),
    aistudio_voice: aistudioVoice,
    style_prompt: stylePrompt,
    vfx_effect: "none",
    audio_effect: "studio_clean",
    claim_id: s.claim,
    audio_clips: {
      bn: {
        file: `audio/bn/scene_${String(s.id).padStart(4, '0')}.wav`,
        source_duration: Number((s.dur * 1.05).toFixed(2)),
        duration: Number((s.dur * 1.05).toFixed(2)),
        trim_in: 0,
        trim_out: 0,
        volume_db: 0,
        fade_in: 0,
        fade_out: 0
      },
      en: {
        file: `audio/en/scene_${String(s.id).padStart(4, '0')}.wav`,
        source_duration: Number((s.dur * 0.95).toFixed(2)),
        duration: Number((s.dur * 0.95).toFixed(2)),
        trim_in: 0,
        trim_out: 0,
        volume_db: 0,
        fade_in: 0,
        fade_out: 0
      },
      hi: {
        file: `audio/hi/scene_${String(s.id).padStart(4, '0')}.wav`,
        source_duration: Number((s.dur * 1.02).toFixed(2)),
        duration: Number((s.dur * 1.02).toFixed(2)),
        trim_in: 0,
        trim_out: 0,
        volume_db: 0,
        fade_in: 0,
        fade_out: 0
      }
    }
  };
  currentTimestamp += s.dur;
  return sceneObj;
});

const totalDuration = Number(currentTimestamp.toFixed(2));
const totalBn = Number((totalDuration * 1.05).toFixed(2));
const totalEn = Number((totalDuration * 0.95).toFixed(2));
const totalHi = Number((totalDuration * 1.02).toFixed(2));

const projectJsonData = {
  project_id: "simple_itihash_004_bronze_age_collapse",
  brand: "Simple History Teller",
  channels: {
    bn: "Simple History Teller Bangla",
    en: "Simple History Teller",
    hi: "Simple History Teller Hindi"
  },
  style_preset: "PRESET_SIMPLE_HISTORY",
  target_duration_seconds: 1100,
  total_duration_seconds: totalDuration,
  language_total_durations: {
    bn: totalBn,
    en: totalEn,
    hi: totalHi
  },
  metadata: {
    title_bn: "৩০০০ বছর আগে প্রাচীন পৃথিবীর মহাবিপর্যয়: ব্রোঞ্জ এজ কলাপ্স — একটি সুসংহত বৈশ্বিক সভ্যতার হঠাৎ পতন",
    title_en: "The Bronze Age Collapse: How Ancient Superpowers Vanished in 50 Years",
    title_hi: "कांस्य युग का महाविनाश: ३२०० साल पहले कैसे रातों-रात तबाह हुईं दुनिया की सबसे बड़ी सभ्यताएं?"
  },
  scenes: scenesArray
};

// Write project.json
fs.writeFileSync(path.join(projectDir, 'project.json'), JSON.stringify(projectJsonData, null, 2), 'utf-8');
console.log(`Saved project.json (${totalDuration}s / ${(totalDuration/60).toFixed(1)} mins)`);

// Build AISTUDIO_TTS_SCREENPLAY.txt
let screenplayContent = `================================================================================
SIMPLE HISTORY TELLER — AISTUDIO TTS PRODUCTION SCREENPLAY (85 SCENES)
Episode: ৩০০০ বছর আগে প্রাচীন পৃথিবীর মহাবিপর্যয়: ব্রোঞ্জ এজ কলাপ্স (Late Bronze Age Collapse)
Model: gemini-3.8-flash-tts
Total Duration: ~${(totalDuration/60).toFixed(1)} minutes (85 Granular Scenes)
Host Voice: Cruz ("An Old Story Teller, Old Man voice")
Narrator Voice: Charon ("An Authoritative Documentary Narrator, Deep Resonant voice")
================================================================================\n\n`;

screenplayContent += `================================================================================\n`;
screenplayContent += `PART 1: BENGALI (বাংলা) — 85 BLOCKS\n`;
screenplayContent += `================================================================================\n\n`;
rawScenes.forEach(s => {
  screenplayContent += `[Shot ${String(s.id).padStart(4, '0')} - ${s.speaker === 'TIME_CHRONICLER' ? 'Cruz' : 'Charon'}] ${s.bn}\n\n`;
});

screenplayContent += `================================================================================\n`;
screenplayContent += `PART 2: ENGLISH — 85 BLOCKS\n`;
screenplayContent += `================================================================================\n\n`;
rawScenes.forEach(s => {
  screenplayContent += `[Shot ${String(s.id).padStart(4, '0')} - ${s.speaker === 'TIME_CHRONICLER' ? 'Cruz' : 'Charon'}] ${s.en}\n\n`;
});

screenplayContent += `================================================================================\n`;
screenplayContent += `PART 3: HINDI (हिन्दी) — 85 BLOCKS\n`;
screenplayContent += `================================================================================\n\n`;
rawScenes.forEach(s => {
  screenplayContent += `[Shot ${String(s.id).padStart(4, '0')} - ${s.speaker === 'TIME_CHRONICLER' ? 'Cruz' : 'Charon'}] ${s.hi}\n\n`;
});

fs.writeFileSync(path.join(projectDir, 'AISTUDIO_TTS_SCREENPLAY.txt'), screenplayContent, 'utf-8');
console.log(`Saved AISTUDIO_TTS_SCREENPLAY.txt`);

// Build FLOW_BATCH_PROMPTS.txt (Static Images: 68 scenes)
let flowBatchContent = `================================================================================
GOOGLE FLOW / AI STUDIO 1K IMAGE GENERATION BATCH PROMPTS (68 STATIC SCENES = 80%)
Style: PRESET_SIMPLE_HISTORY (2D Historical Graphic Novel / Simple History)
Aspect Ratio: 16:9 | Resolution: 1K Widescreen (1376x768)
Negative Prompt Anchor: --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients
================================================================================\n\n`;

rawScenes.filter(s => s.type === "STATIC_IMAGE").forEach(s => {
  const file = `visual_assets/scene_${String(s.id).padStart(4, '0')}.png`;
  const negativePrompt = " --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients";
  const promptText = s.prompt.includes("--no") ? s.prompt : s.prompt + negativePrompt;
  flowBatchContent += `### Scene ${s.id} (${s.dur}s | ${s.claim}) -> ${file}\n${promptText}\n\n`;
});

fs.writeFileSync(path.join(projectDir, 'FLOW_BATCH_PROMPTS.txt'), flowBatchContent, 'utf-8');
console.log(`Saved FLOW_BATCH_PROMPTS.txt`);

// Build FLOW_VEO_VIDEO_PROMPT.txt (Dynamic AI Video: 17 scenes)
let flowVeoContent = `================================================================================
GOOGLE FLOW DYNAMIC AI VIDEO MOTION PROMPTS (17 SCENES = EXACTLY 20%)
Aspect Ratio: 16:9 | Framerate: 24fps Motion Clip
Style: PRESET_SIMPLE_HISTORY (2D Historical Graphic Novel Animation)
================================================================================\n\n`;

rawScenes.filter(s => s.type === "DYNAMIC_AI_VIDEO").forEach(s => {
  const file = `visual_assets/clip_scene_${String(s.id).padStart(4, '0')}.mp4`;
  const negativePrompt = " --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, signatures, captions, photorealism, 3d render, realistic textures, gradients";
  const promptText = s.prompt.includes("--no") ? s.prompt : s.prompt + negativePrompt;
  flowVeoContent += `### Scene ${s.id} [CLIP CANDIDATE] (${s.dur}s | Speaker: ${s.speaker}) -> ${file}\nAction Description: ${s.bn}\nPrompt: ${promptText}\n\n`;
});

fs.writeFileSync(path.join(projectDir, 'FLOW_VEO_VIDEO_PROMPT.txt'), flowVeoContent, 'utf-8');
console.log(`Saved FLOW_VEO_VIDEO_PROMPT.txt`);

// Build CHARACTER_VOICE_MAP.json
const characterVoiceMap = {
  project_id: "simple_itihash_004_bronze_age_collapse",
  preset: "PRESET_SIMPLE_HISTORY",
  cast: {
    TIME_CHRONICLER: {
      role: "Anchor & Time Chronicler",
      gender: "Male",
      appearance: "Elderly human scholar with bald crown, long bushy white beard, circular wire-rim spectacles, brown linen scholar robe, holding bronze torch and ancient history book",
      voice_id: "Cruz",
      style_prompt: "An Old Story Teller, Old Man voice"
    },
    NARRATOR: {
      role: "Lead Historical Narrator",
      gender: "Male",
      voice_id: "Charon",
      style_prompt: "An Authoritative Documentary Narrator, Deep Resonant voice"
    },
    KING_AMMURAPI: {
      role: "Last King of Ugarit",
      gender: "Male",
      voice_id: "Charon",
      style_prompt: "Desperate King, Trembling Voice"
    },
    PHARAOH_RAMESSES_III: {
      role: "Pharaoh of Egypt",
      gender: "Male",
      voice_id: "Fenrir",
      style_prompt: "Mighty Pharaoh, Commanding Battle Roar"
    },
    HITTITE_QUEEN_PUDUHEPA: {
      role: "Queen of Hatti",
      gender: "Female",
      voice_id: "Aoede",
      style_prompt: "Sorrowful Queen, Despairing Plea"
    }
  }
};

fs.writeFileSync(path.join(projectDir, 'CHARACTER_VOICE_MAP.json'), JSON.stringify(characterVoiceMap, null, 2), 'utf-8');
console.log(`Saved CHARACTER_VOICE_MAP.json`);
