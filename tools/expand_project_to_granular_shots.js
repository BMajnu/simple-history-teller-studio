const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language');
const PROJECT_JSON = path.join(PROJECT_DIR, 'project.json');
const BACKUP_JSON = path.join(PROJECT_DIR, 'project_original_22scenes.json');

const original = JSON.parse(fs.readFileSync(PROJECT_JSON, 'utf8'));
if (!fs.existsSync(BACKUP_JSON)) {
  fs.writeFileSync(BACKUP_JSON, JSON.stringify(original, null, 2), 'utf8');
}

// 70 granular visual shots mapped to specific sentences across the 22 scenes
const granularShots = [
  // Scene 1: Intro (41.6s)
  {
    scene_id: 1,
    sub_id: 1,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "আমি সময়ের সাক্ষী।",
      en: "I am the Time Chronicler.",
      hi: "मैं समय का गवाह हूँ।"
    },
    visual_prompt: "The Time Chronicler standing in his vast cosmic history library surrounded by towering bookshelves of leatherbound ancient tomes, holding an illuminated quill, smiling at camera, warm comic lighting.",
    motion: "zoom_in",
    dur_ratio: 0.15
  },
  {
    scene_id: 1,
    sub_id: 2,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "আজ তুমি যে ভাষায় তোমার বন্ধুদের সাথে আড্ডা দিচ্ছ, কিংবা ফোনে টেক্সট করছ—কখনো কি ভেবে দেখেছ, এই শব্দগুলো এলো কোথা থেকে?",
      en: "Today, whether you are arguing on the internet or texting your friends, have you ever wondered where these words came from?",
      hi: "आज आप जिस भाषा में अपने दोस्तों से बात करते हैं या फोन पर मैसेज भेजते हैं—क्या आपने कभी सोचा है कि ये शब्द कहाँ से आए?"
    },
    visual_prompt: "Modern cartoon teenager sitting on a sofa enthusiastically chatting and laughing while texting on a smartphone, comical emoji bubbles floating overhead.",
    motion: "pan_right",
    dur_ratio: 0.25
  },
  {
    scene_id: 1,
    sub_id: 3,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "এই মুহূর্তে পৃথিবীতে প্রায় ৭,১০০টি ভাষা চালু আছে।",
      en: "Right now on planet Earth, there are over 7,100 spoken languages.",
      hi: "इस समय दुनिया भर में लगभग 7,100 भाषाएं बोली जाती हैं।"
    },
    visual_prompt: "A vibrant cartoon globe spinning with colorful banners showing different world scripts and a giant glowing counter saying 7,100, cartoon figures waving.",
    motion: "zoom_out",
    dur_ratio: 0.20
  },
  {
    scene_id: 1,
    sub_id: 4,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "কিন্তু একটা সময় ছিল, যখন পুরো পৃথিবীতে কোনো কথা ছিল না, কোনো ভাষা ছিল না। ছিল শুধুই মহাশূন্যের মতো এক নিঃশব্দ নীরবতা।",
      en: "But rewind 100,000 years, and planet Earth was eerily quiet. No books, no songs, not a single word—just eerie stillness.",
      hi: "लेकिन एक ऐसा समय था जब इस धरती पर कोई भाषा नहीं थी, कोई शब्द नहीं था। चारों तरफ केवल एक गहरा सन्नाटा था।"
    },
    visual_prompt: "Earth 100,000 years ago at night, misty primeval landscape under starry cosmic skies, complete silent stillness, no humans.",
    motion: "pan_left",
    dur_ratio: 0.22
  },
  {
    scene_id: 1,
    sub_id: 5,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "তাহলে এই মহাজাগতিক নীরবতা ভেঙে মানুষের মুখ থেকে প্রথম কোন শব্দটি উচ্চারিত হয়েছিল?",
      en: "So how did a troop of hairless shivering apes break the cosmic silence and speak the very first word in human history?",
      hi: "तो आखिर इस महासन्नाटे को तोड़कर आदिम इंसान के मुँह से निकला पहला जादुई शब्द कौन सा था?"
    },
    visual_prompt: "Dramatic close-up of a cartoon stickman caveman opening his mouth wide with glowing golden question marks floating out into the dawn sky.",
    motion: "zoom_in",
    dur_ratio: 0.18
  },

  // Scene 2: Animal Boundary (36.9s)
  {
    scene_id: 2,
    sub_id: 1,
    speaker: "NARRATOR",
    narration: {
      bn: "প্রাণীদের দিকে তাকাও। একটি ভারভেট বানর চিতার আগমন দেখলে একরকম চিৎকার দেয়, আর চিল দেখলে অন্যরকম ডাক দেয়।",
      en: "Look at the animal kingdom. A vervet monkey has a specific screech for an eagle, and a different grunt for a leopard.",
      hi: "जानवरों की दुनिया को देखिए। एक बंदर चील को देखकर खास तरह की चीख़ मारता है और तेंदुए को देखकर अलग आवाज़।"
    },
    visual_prompt: "African acacia tree, comical cartoon vervet monkey pointing in sheer panic at a swooping eagle while another monkey below screams at a leopard.",
    motion: "zoom_in",
    dur_ratio: 0.32
  },
  {
    scene_id: 2,
    sub_id: 2,
    speaker: "NARRATOR",
    narration: {
      bn: "কিন্তু কোনো বানর কি কখনো বলতে পারে: গতকাল নদীর ওপারে যে চিতাটা দেখেছিলাম, ওটা খুব সুন্দর ছিল! না!",
      en: "But no monkey in history has ever said: Hey guys, remember that cool leopard we saw yesterday near the river? Never!",
      hi: "लेकिन कोई बंदर कभी यह नहीं कह सकता: अरे भाई, कल जो तेंदुआ हमने नदी किनारे देखा था, वह कितना सुंदर था! कभी नहीं!"
    },
    visual_prompt: "Two hilarious cartoon monkeys lounging on tree branches wearing sunglasses drinking coconut juice with a thought bubble of a leopard taking a selfie.",
    motion: "pan_right",
    dur_ratio: 0.32
  },
  {
    scene_id: 2,
    sub_id: 3,
    speaker: "NARRATOR",
    narration: {
      bn: "প্রাণীদের ডাক কেবল বর্তমান বিপদের সংকেত। তারা অতীত বা ভবিষ্যতের গল্প বলতে পারে না। কিন্তু মানুষ পারে! আর এখানেই শুরু হয় পৃথিবীর সবচেয়ে অদ্ভুত রহস্য।",
      en: "Animals are trapped in the immediate present. Only humans can gossip, tell stories, dream of tomorrow, and lie. And here begins the grand mystery.",
      hi: "जानवर सिर्फ तुरंत के खतरे का इशारा कर सकते हैं। वे बीते कल या आने वाले कल की बात नहीं कर सकते। लेकिन इंसान कर सकता है! और यहीं से शुरू होती है हमारी असली पहेली।"
    },
    visual_prompt: "Split comparison screen: confused monkey looking at an hourglass vs clever stickman human sitting by a campfire excitedly narrating an epic illustrated story to his tribe.",
    motion: "zoom_out",
    dur_ratio: 0.36
  },

  // Scene 3: Charades in Savanna (35.2s)
  {
    scene_id: 3,
    sub_id: 1,
    speaker: "HUNTER_CHIEF",
    narration: {
      bn: "লক্ষ বছর আগে আদিম সাভানায় শিকার করতে গিয়ে আমাদের পূর্বপুরুষরা চরম মুশকিলে পড়ত। কল্পনা করো: এক শিকারি ঝোপের আড়ালে ম্যামথ দেখেছে।",
      en: "Picture this: 200,000 years ago in the African savanna. Two hunters are tracking game. One spots a massive woolly mammoth behind bushes.",
      hi: "ज़रा सोचिए: लाखों साल पहले दो शिकारी झाड़ियों के पीछे छिपे हैं। एक ने विशालकाय हाथी देखा।"
    },
    visual_prompt: "Sun-drenched savanna, two funny cartoon cavemen crouching behind yellow bushes, peeking at the massive furry rear of a giant mammoth.",
    motion: "pan_left",
    dur_ratio: 0.30
  },
  {
    scene_id: 3,
    sub_id: 2,
    speaker: "HUNTER_CHIEF",
    narration: {
      bn: "সে শব্দ করতে পারবে না, পাছে শিকার পালিয়ে যায়। এখন সে হাত-পা নেড়ে চার্লস চ্যাপলিনের মতো মূকাভিনয় করছে! কিন্তু সঙ্গী ভাবল সে হয়তো মাছি তাড়াচ্ছে!",
      en: "He can't make loud noise, so he tries aggressive silent charades, waving his arms like a windmill. His buddy thinks he's swatting an imaginary mosquito!",
      hi: "वह आवाज़ नहीं कर सकता वरना शिकार भाग जाएगा। अब वह पागलों की तरह हाथ हिलाकर इशारे कर रहा है! लेकिन उसका साथी सोचता है कि वह मक्खियाँ उड़ा रहा है!"
    },
    visual_prompt: "Close-up of caveman making frantic exaggerated mime gestures with popped eyes, while his companion looks completely clueless swatting a fly with a stick.",
    motion: "zoom_in",
    dur_ratio: 0.38
  },
  {
    scene_id: 3,
    sub_id: 3,
    speaker: "HUNTER_CHIEF",
    narration: {
      bn: "এই হাস্যকর বিভ্রান্তি থেকে বাঁচতেই মানুষের প্রয়োজন হয়ে পড়েছিল সুনির্দিষ্ট শব্দের।",
      en: "Misunderstandings meant starvation or getting crushed. Silent hand gestures were simply not enough.",
      hi: "इस गलतफहमी का नतीजा होता था भूख या मौत। इशारों की अपनी एक सीमा थी।"
    },
    visual_prompt: "The giant mammoth turning its head with a hilarious raised eyebrow looking directly at the two panicked cavemen hugging each other.",
    motion: "zoom_out",
    dur_ratio: 0.32
  },

  // Scene 4: Babel Myth (32.2s)
  {
    scene_id: 4,
    sub_id: 1,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "হাজার বছর ধরে প্রাচীন সমাজগুলো বিশ্বাস করত—মানবজাতির শুরুতে একটাই আদি ভাষা ছিল।",
      en: "For millennia, ancient mythologies believed all humans originally spoke a single mother tongue.",
      hi: "सदियों से अलग-अलग संस्कृतियों में यह माना जाता रहा कि शुरुआत में इंसान की केवल एक ही मूल भाषा थी।"
    },
    visual_prompt: "An ancient glowing golden parchment showing tree roots uniting into a single trunk of speech, illuminated with mysterious symbols.",
    motion: "zoom_in",
    dur_ratio: 0.30
  },
  {
    scene_id: 4,
    sub_id: 2,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "বাইবেলের রূপকথা ব্যবিলনের মিনারের গল্প বলে, যেখানে মানুষ অহংকার করে আকাশে টাওয়ার বানাতে চেয়েছিল, আর ঈশ্বর তাদের অহংকার ভেঙে দিতে সবার ভাষা আলাদা করে দিলেন!",
      en: "The Biblical myth of the Tower of Babel claimed humanity was building a tower to heaven, so God scrambled their tongues into mutual gibberish!",
      hi: "बेबीलोन की मीनार की पौराणिक कथा कहती है कि जब इंसान आसमान छूने की कोशिश करने लगा, तो कुदरत ने उनकी ज़बानों को अलग-अलग कर दिया!"
    },
    visual_prompt: "Colossal spiral brick tower reaching high into storm clouds, miniature Babylonian builders arguing comically with speech bubbles full of exclamation marks.",
    motion: "pan_right",
    dur_ratio: 0.40
  },
  {
    scene_id: 4,
    sub_id: 3,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "কিন্তু রূপকথা বাদ দিলে বিজ্ঞান কী বলে? ভাষা কি সত্যি একটা ছিল, নাকি হাজারটা?",
      en: "But stripped of myth, what does real science tell us? Was there a single Proto-World language, or did speech ignite in multiple sparks?",
      hi: "लेकिन पौराणिक कथाओं से हटकर विज्ञान क्या कहता है? क्या भाषा सच में एक थी, या हज़ारों?"
    },
    visual_prompt: "The Time Chronicler smiling thoughtfully holding a glowing glass globe showing question marks branching across continents.",
    motion: "zoom_out",
    dur_ratio: 0.30
  },

  // Scene 5: Paris Ban 1866 (34.7s)
  {
    scene_id: 5,
    sub_id: 1,
    speaker: "PRESIDENT_PARIS",
    narration: {
      bn: "উনবিংশ শতাব্দীতে ভাষা কীভাবে শুরু হলো—তা নিয়ে ইউরোপের বিজ্ঞানীরা এমন উন্মাদ তর্ক শুরু করলেন যে মারামারির দশা হলো!",
      en: "By the mid-19th century, European linguists were arguing so viciously about how speech began that conferences devolved into near fistfights!",
      hi: "उन्नीसवीं सदी में यूरोपीय भाषाविदों के बीच यह बहस इतनी उग्र हो गई कि वैज्ञानिक आपस में ही लड़ने लगे!"
    },
    visual_prompt: "19th-century French Parisian lecture hall, Victorian gentlemen with mutton chops and top hats waving papers, shouting and red in the face.",
    motion: "zoom_in",
    dur_ratio: 0.35
  },
  {
    scene_id: 5,
    sub_id: 2,
    speaker: "PRESIDENT_PARIS",
    narration: {
      bn: "অবশেষে ১৮৬৬ সালে বিশ্ববিখ্যাত প্যারিস লিঙ্গুইস্টিক সোসাইটি তাদের সংবিধানের ২ নম্বর ধারায় একটি ঐতিহাসিক আইন পাস করল:",
      en: "Finally, in 1866, the prestigious Linguistic Society of Paris slammed down the hammer with an extraordinary decree:",
      hi: "आखिरकार 1866 में पेरिस की भाषा वैज्ञानिक समिति ने एक ऐतिहासिक फैसला लिया:"
    },
    visual_prompt: "The podium president with an enormous white mustache slamming a huge wooden gavel down onto a stack of books with comic shockwaves.",
    motion: "pan_left",
    dur_ratio: 0.32
  },
  {
    scene_id: 5,
    sub_id: 3,
    speaker: "PRESIDENT_PARIS",
    narration: {
      bn: "এখন থেকে ভাষার উৎপত্তি নিয়ে কোনো প্রবন্ধ বা বিতর্ক এই সমাজে সম্পূর্ণ নিষিদ্ধ! কারণ তথ্যের কোনো প্রমাণ ছিল না, শুধু আজগুবি কল্পনা!",
      en: "Article 2 of their bylaws officially banned all papers, presentations, and debates on the origin of language! They declared it unscientific junk.",
      hi: "आज के बाद भाषा की उत्पत्ति पर किसी भी तरह का शोध या बहस पूरी तरह से प्रतिबंधित की जाती है! क्योंकि किसी के पास सबूत नहीं थे, सिर्फ मनगढ़ंत कहानियां थीं।"
    },
    visual_prompt: "An official French decree with a giant red stamp saying BANNED, with books on origin of language flying comically into a trash bin.",
    motion: "zoom_out",
    dur_ratio: 0.33
  },

  // Scene 6: Bow-Wow & Pooh-Pooh (35.0s)
  {
    scene_id: 6,
    sub_id: 1,
    speaker: "NARRATOR",
    narration: {
      bn: "বিখ্যাত জার্মান ভাষাবিদ ম্যাক্স মুলার তখনকার প্রচলিত ৫টি থিওরিকে রীতিমতো ট্রোল করেছিলেন।",
      en: "Famous philologist Max Müller mocked the absurdity of 19th-century speculation by giving them ridiculous nicknames.",
      hi: "मशहूर विद्वान मैक्स मूलर ने उस समय के सिद्धांतों का मज़ाक उड़ाते हुए बड़े अनोखे नाम दिए।"
    },
    visual_prompt: "Max Müller in Victorian suit standing beside a chalkboard with funny cartoon caricatures of barking dogs, laughing knowingly at camera.",
    motion: "zoom_in",
    dur_ratio: 0.28
  },
  {
    scene_id: 6,
    sub_id: 2,
    speaker: "NARRATOR",
    narration: {
      bn: "প্রথমটি: বাউ-ওয়াউ তত্ত্ব। আদিম মানুষ নাকি কুকুরের ঘেউ-ঘেউ বা পাখির কুহু-কুহু নকল করে শব্দ বানিয়েছে।",
      en: "First was the Bow-Wow Theory: humans allegedly started talking by imitating barking dogs and cuckoo birds.",
      hi: "पहला था बाउ-वाउ सिद्धांत—यानी इंसान ने भौंकते हुए कुत्तों या चहकती चिड़ियों की नक़ल करके बोलना सीखा।"
    },
    visual_prompt: "A scruffy caveman on all fours barking energetically at an extremely confused, awkward-looking dog sitting in grass.",
    motion: "pan_right",
    dur_ratio: 0.36
  },
  {
    scene_id: 6,
    sub_id: 3,
    speaker: "NARRATOR",
    narration: {
      bn: "দ্বিতীয়টি: পুহ্-পুহ্ তত্ত্ব। মানুষ যখন পায়ে চোট খেত আর চিৎকার দিত—উফ! বা দুর্গন্ধ পেয়ে বলত—ছিঃ!—সেই ব্যথাবেদনা থেকেই নাকি শব্দ তৈরি হয়েছে!",
      en: "Second was the Pooh-Pooh Theory: language supposedly began with instinctive gasps of pain or disgust—like stubbing a toe and yelling Ouch! or smelling rotting garbage and saying Eww!",
      hi: "दूसरा था पूह-पूह सिद्धांत—यानी जब पैर में पत्थर लगा और मुँह से निकला उफ!, या बदबू आने पर निकला छी!—इन्हीं दर्दों और भावों से शब्दों का जन्म हुआ।"
    },
    visual_prompt: "Caveman stubbing bare toe on a jagged rock screaming in agony with giant cartoon swollen red toe, beside another caveman holding nose in disgust near smelly skunk.",
    motion: "zoom_out",
    dur_ratio: 0.36
  },

  // Scene 7: Ding-Dong & Yo-He-Ho (36.0s)
  {
    scene_id: 7,
    sub_id: 1,
    speaker: "NARRATOR",
    narration: {
      bn: "তৃতীয়টি ছিল ডিং-ডং তত্ত্ব। প্রকৃতির সব বস্তুর একটি অন্তর্নিহিত অনুরণন আছে, যা মানুষ মুখে ফুটিয়ে তুলেছে।",
      en: "Then came the Ding-Dong Theory, which claimed every object in nature has an inherent mystic resonance that human vocal cords echoed.",
      hi: "तीसरा था डिंग-डोंग सिद्धांत—जिसके अनुसार प्रकृति की हर चीज़ में एक स्वाभाविक गूँज होती है जिसे इंसान ने शब्दों में ढाला।"
    },
    visual_prompt: "Caveman tapping a hollow bronze bell with a wooden stick, with mystical golden sound rings vibrating through the air around him.",
    motion: "zoom_in",
    dur_ratio: 0.30
  },
  {
    scene_id: 7,
    sub_id: 2,
    speaker: "NARRATOR",
    narration: {
      bn: "আর চতুর্থটি সবচেয়ে বাস্তবসম্মত: ইয়ো-হে-হো তত্ত্ব। চারজন মানুষ মিলে যখন কোনো বিশাল ম্যামথ বা পাথর টানত, তখন তাল মিলিয়ে শক্তি দিতে গিয়ে তারা সমস্বরে গোঙাত—হেই-জো! হেঁইয়ো!",
      en: "And fourth: the Yo-He-Ho Theory. When primitive humans teamed up to haul a colossal woolly mammoth or boulder, they needed synchronized rhythm. Their rhythmic grunts—Heave! Ho! Ugh!",
      hi: "और चौथा था यो-हे-हो सिद्धांत। जब चार लोग मिलकर किसी भारी पत्थर या शिकार को खींचते थे, तो एक साथ दम लगाने के लिए लयबद्ध आवाज़ें निकालते थे—ज़ोर लगा के... हैय्या!"
    },
    visual_prompt: "Four muscular stickman cavemen sweating profusely, pulling a colossal round boulder with vine ropes in comic synchronized rhythm.",
    motion: "pan_left",
    dur_ratio: 0.40
  },
  {
    scene_id: 7,
    sub_id: 3,
    speaker: "NARRATOR",
    narration: {
      bn: "এই সমবেত গোঙানিই নাকি পরবর্তীতে রূপান্তরিত হয়েছিল সামাজিক ভাষায়।",
      en: "eventually evolved into coordinated vocal language and community bonding.",
      hi: "यही सामूहिक आवाज़ें आगे चलकर भाषा का रूप लेने लगीं।"
    },
    visual_prompt: "The cavemen cheering together at the top of the hill after successfully moving the boulder, high-fiving comically.",
    motion: "zoom_out",
    dur_ratio: 0.30
  },

  // Scene 8: The Need for Syntax (35.8s)
  {
    scene_id: 8,
    sub_id: 1,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "কিন্তু সমস্যা হলো, কুকুর ঘেউ-ঘেউ করলেও ব্যাকরণ তৈরি করতে পারে না।",
      en: "Cute theories, but they miss the point. A dog can bark, but it cannot invent grammar.",
      hi: "लेकिन इन सिद्धांतों में एक बड़ी खामी थी। कुत्ता भौंक सकता है, लेकिन व्याकरण नहीं बना सकता।"
    },
    visual_prompt: "A cute dog wearing a graduation cap sitting at a school desk looking puzzled at a blackboard filled with Latin grammar diagrams.",
    motion: "zoom_in",
    dur_ratio: 0.30
  },
  {
    scene_id: 8,
    sub_id: 2,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "গোঙানি দিয়ে আদেশ দেওয়া যায়, কিন্তু আগামীকাল আমি নদীর ওপারে গিয়ে মাছ ধরব—এই জটিল বাক্য বলা যায় না।",
      en: "Rhythmic grunting can drag a rock, but it cannot express: If it rains tomorrow, we will fish by the northern river.",
      hi: "दम लगाने की आवाज़ से काम हो सकता है, लेकिन कल सुबह मैं नदी पार जाकर मछली पकड़ूँगा—यह जटिल वाक्य नहीं बन सकता।"
    },
    visual_prompt: "Caveman thinking of a multi-step future plan with calendar icons, raindrops, and fish, scratching his messy head in deep thought.",
    motion: "pan_right",
    dur_ratio: 0.35
  },
  {
    scene_id: 8,
    sub_id: 3,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "তাহলে আসল পরীক্ষা কীভাবে হলো? সত্যিটা জানার জন্য ইতিহাসের কিছু ক্ষমতাবান রাজা এমন এক পরীক্ষা করেছিলেন, যাকে বলা হয় দ্য ফরবিডেন এক্সপেরিমেন্ট—মানব ইতিহাসের সবচেয়ে রোমহর্ষক ও নিষ্ঠুর পরীক্ষা!",
      en: "To find the true primordial tongue, eccentric monarchs throughout antiquity conducted what modern history calls The Forbidden Experiment—and it was utterly ruthless.",
      hi: "इसी सच को जानने के लिए पुराने ज़माने के ताकतवर राजाओं ने इतिहास के सबसे भयानक और क्रूर प्रयोग किए, जिन्हें द फॉरबिडन एक्सपेरिमेंट कहा जाता है।"
    },
    visual_prompt: "Dramatic silhouette of a dark ancient king sitting on a throne with glowing eyes, an ominous medieval seal reading The Forbidden Experiment.",
    motion: "zoom_out",
    dur_ratio: 0.35
  },

  // Scene 9: Pharaoh Psamtik I (36.6s)
  {
    scene_id: 9,
    sub_id: 1,
    speaker: "PHARAOH_PSAMTIK",
    narration: {
      bn: "খ্রিস্টপূর্ব সপ্তম শতক। প্রাচীন মিশরের ফারাও সামটিক নিজেকে পৃথিবীর সবচেয়ে প্রাচীন জাতির শাসক মনে করতেন।",
      en: "The 7th Century BC. Pharaoh Psamtik the First of Egypt was convinced that Egyptians were the most ancient civilization on earth.",
      hi: "ईसा पूर्व सातवीं सदी। मिस्र के राजा फिरौन सामटिक को पूरा यकीन था कि मिस्र के लोग ही दुनिया की सबसे पुरानी सभ्यता हैं।"
    },
    visual_prompt: "Grand golden Egyptian palace, Pharaoh Psamtik I in gold cobra nemes crown standing proudly in front of towering hieroglyphic columns.",
    motion: "zoom_in",
    dur_ratio: 0.32
  },
  {
    scene_id: 9,
    sub_id: 2,
    speaker: "PHARAOH_PSAMTIK",
    narration: {
      bn: "কিন্তু তার মনে খটকা লাগল—মানুষের আদি জন্মগত ভাষা কী? তিনি দুই সদ্যোজাত শিশুকে নিজের পরিবার থেকে ছিনিয়ে এনে এক নিঃশব্দ রাখালের হাতে তুলে দিলেন।",
      en: "He wanted empirical proof. He seized two newborn infants from poor families and handed them over to a secluded shepherd.",
      hi: "लेकिन उन्हें सबूत चाहिए था। उन्होंने दो नवजात बच्चों को उनके परिवारों से छीन लिया और एक चरवाहे को सौंप दिया।"
    },
    visual_prompt: "Egyptian royal chariot in a humble village, guards gently carrying two swaddled baby bundles under Pharaoh's stern gaze.",
    motion: "pan_left",
    dur_ratio: 0.35
  },
  {
    scene_id: 9,
    sub_id: 3,
    speaker: "PHARAOH_PSAMTIK",
    narration: {
      bn: "নির্দেশ ছিল কঠোর: শিশুদের পাহাড়ি কুটিরে ছাগলের দুধ খাইয়ে বড় করতে হবে, কিন্তু তাদের সামনে একটি শব্দও উচ্চারণ করা যাবে না!",
      en: "The royal decree was absolute: raise them in an isolated hut, feed them goat milk, but never utter a single word in their presence.",
      hi: "शाही हुक्म बहुत सख्त था: इन बच्चों को वीरान झोपड़ी में पालो, बकरियों का दूध पिलाओ, लेकिन इनके सामने एक भी लफ़्ज़ मुँह से मत निकालना!"
    },
    visual_prompt: "Isolated stone shepherd hut on a barren desert hill with goats grazing, shepherd standing outside covering his mouth with both hands in fear.",
    motion: "zoom_out",
    dur_ratio: 0.33
  },

  // Scene 10: Bekos! (39.9s)
  {
    scene_id: 10,
    sub_id: 1,
    speaker: "SHEPHERD",
    narration: {
      bn: "দুই বছর কেটে গেল। একদিন রাখাল কুটিরের দরজা খুলতেই দুটি শিশু হামাগুড়ি দিয়ে এসে তার পা জড়িয়ে ধরল এবং হাত বাড়িয়ে চিৎকার করে বলল—বেকস! বেকস!",
      en: "Two long years passed in silence. One morning, as the shepherd opened the door, both toddlers crawled forward, clutched his knees, and shouted: Bekos! Bekos!",
      hi: "दो साल का लंबा समय सन्नाटे में बीता। एक दिन जब चरवाहे ने दरवाज़ा खोला, तो दोनों बच्चे घुटनों के बल चलकर आए और चरवाहे के पाँव पकड़कर पुकारने लगे—बेकोस! बेकोस!"
    },
    visual_prompt: "Sunlight streaming through open wooden door, two smiling toddlers crawling across dirt floor, hands raised toward the shocked shepherd.",
    motion: "zoom_in",
    dur_ratio: 0.40
  },
  {
    scene_id: 10,
    sub_id: 2,
    speaker: "SHEPHERD",
    narration: {
      bn: "রাখাল চমকে গিয়ে খবর পাঠাল ফারাওয়ের দরবারে। ফারাও সারা রাজ্যের পণ্ডিতদের তলব করলেন।",
      en: "Stunned, the shepherd rushed to the royal palace. Pharaoh frantically summoned scholars and linguists from across the Mediterranean.",
      hi: "चरवाहा हैरान होकर उन्हें राजा के दरबार में ले गया। विद्वानों ने पुरानी पांडुलिपियाँ खंगालीं।"
    },
    visual_prompt: "Pharaoh's grand throne room, Egyptian priests and scholars in linen robes unrolling ancient papyrus scrolls with magnifying glasses.",
    motion: "pan_right",
    dur_ratio: 0.30
  },
  {
    scene_id: 10,
    sub_id: 3,
    speaker: "SHEPHERD",
    narration: {
      bn: "জানা গেল, বেকস কোনো মিশরীয় শব্দই নয়! আনাতোলিয়ার প্রাচীন ফ্রিজিয়ান ভাষায় বেকস মানে রুটি! ফারাও সামটিকের অহংকার চূর্ণ হয়ে গেল—মিশরীয়রা প্রথম ভাষার জাতি নয়!",
      en: "The devastating verdict: Bekos was not Egyptian at all! It was ancient Phrygian for bread! Pharaoh's pride was utterly shattered.",
      hi: "नतीजा चौंकाने वाला था: बेकोस मिस्री भाषा का शब्द नहीं था, बल्कि प्राचीन फ़्रिजियन भाषा में इसका मतलब था रोटी! राजा का सारा घमंड चकनाचूर हो गया।"
    },
    visual_prompt: "Pharaoh Psamtik sitting slouched on his golden throne holding his head in comical distress beside an illustration of a loaf of Phrygian bread.",
    motion: "zoom_out",
    dur_ratio: 0.30
  },

  // Scene 11: Frederick II (41.3s)
  {
    scene_id: 11,
    sub_id: 1,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "ত্রয়োদশ শতাব্দীতে সিসিলির পবিত্র রোমান সম্রাট দ্বিতীয় ফ্রেডেরিক একই পরীক্ষা চালালেন। তিনি জানতে চেয়েছিলেন—শিশুরা কি নিজে নিজে হিব্রু, গ্রিক কিংবা ল্যাটিন বলবে?",
      en: "In the 13th Century, Holy Roman Emperor Frederick II wanted to know if isolated babies would naturally speak Hebrew, Greek, or Latin.",
      hi: "तेरहवीं सदी में पवित्र रोमन सम्राट फ्रेडरिक द्वितीय ने भी यही प्रयोग दोहराया। वह देखना चाहते थे कि बच्चे बड़े होकर हिब्रू, ग्रीक या लैटिन भाषा बोलेंगे।"
    },
    visual_prompt: "Moody medieval stone castle in Sicily, Emperor Frederick II in velvet ermine cape writing cruel experimental decrees by candlelight.",
    motion: "zoom_in",
    dur_ratio: 0.33
  },
  {
    scene_id: 11,
    sub_id: 2,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "তিনি ধাত্রীদের কঠোর নির্দেশ দিলেন: শিশুদের খাওয়াবে, স্নান করাবে, কিন্তু কখনো তাদের সাথে কথা বলবে না বা আদর করবে না।",
      en: "He commanded foster mothers to feed and bathe the infants, but strictly forbade them from ever cuddling, singing, or speaking to them.",
      hi: "उन्होंने आदेश दिया कि बच्चों को खाना खिलाओ, नहलाओ, लेकिन न कोई उनसे बात करेगा, न कोई उन्हें प्यार करेगा।"
    },
    visual_prompt: "Stern medieval nurse in white veil mechanically feeding a baby in a wooden cradle without looking at it or smiling, looking deeply sorrowful.",
    motion: "pan_left",
    dur_ratio: 0.33
  },
  {
    scene_id: 11,
    sub_id: 3,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "কিন্তু ফলাফল ছিল মর্মান্তিক। কোনো ভালোবাসার স্পর্শ বা মিষ্টি কথা না পেয়ে সব কটি শিশু মারা যায়! প্রমাণ হলো—ভাষা ও স্নেহ মানুষের প্রাণের মতোই জরুরি।",
      en: "The result was heartbreaking. Chronicler Salimbene noted every single infant perished. Deprived of warmth and spoken love, babies fail to thrive.",
      hi: "लेकिन नतीजा बेहद दर्दनाक निकला। बिना किसी दुलार और आवाज़ के, वे सारे बच्चे तड़पकर मर गए! इसने साबित किया कि इंसानी प्यार और आवाज़ ज़िंदगी के लिए कितनी ज़रूरी है।"
    },
    visual_prompt: "An empty wooden cradle beside an arched stone window with soft rain falling outside, symbolic glowing heart showing the warmth of human love.",
    motion: "zoom_out",
    dur_ratio: 0.34
  },

  // Scene 12: King James IV (37.1s)
  {
    scene_id: 12,
    sub_id: 1,
    speaker: "KING_JAMES",
    narration: {
      bn: "১৪৯৩ সাল। স্কটল্যান্ডের রাজা চতুর্থ জেমস সমুদ্রের মাঝে নির্জন ইনচকিথ দ্বীপে এক বোবা ধাত্রীর কাছে দুটি শিশুকে নির্বাসনে পাঠিয়ে দেন।",
      en: "In 1493, King James IV of Scotland sent two babies to the desolate windswept island of Inchkeith in the care of a mute woman.",
      hi: "1493 में स्कॉटलैंड के राजा जेम्स चतुर्थ ने समुद्र के बीच एक सुनसान पथरीले द्वीप पर दो बच्चों को एक गूँगी दाई के पास भेज दिया।"
    },
    visual_prompt: "Stormy Scottish sea with crashing white foam, a wooden rowboat carrying two swaddled babies toward a craggy rocky island.",
    motion: "pan_right",
    dur_ratio: 0.35
  },
  {
    scene_id: 12,
    sub_id: 2,
    speaker: "KING_JAMES",
    narration: {
      bn: "কয়েক বছর পর রাজা দাবি করলেন—বাচ্চারা নাকি বড় হয়ে সম্পূর্ণ নির্ভেজাল ও বিশুদ্ধ হিব্রু ভাষায় কথা বলা শুরু করেছে!",
      en: "Years later, James proudly claimed that upon reaching speaking age, the children miraculously spoke very good Hebrew!",
      hi: "कुछ सालों बाद राजा ने दावा किया कि बच्चे बड़े होकर अपने आप शुद्ध हिब्रू भाषा बोलने लगे हैं!"
    },
    visual_prompt: "King James IV with crown and Scottish tartan mantle standing on a royal ship looking through a brass spyglass with a triumphant arrogant smile.",
    motion: "zoom_in",
    dur_ratio: 0.32
  },
  {
    scene_id: 12,
    sub_id: 3,
    speaker: "KING_JAMES",
    narration: {
      bn: "কিন্তু আধুনিক ঐতিহাসিকরা হাসতে হাসতে বলেন: রাজা নিজের মনগড়া ধর্মীয় অহংকার মেটাতে শিশুদের অর্থহীন তোতলানো আওয়াজকেই হিব্রু বলে চালিয়ে দিয়েছিলেন!",
      en: "Modern historians call absolute nonsense. The superstitious king simply heard random baby babble and projected his own holy fantasies!",
      hi: "लेकिन आज के इतिहासकार इसे सिर्फ राजा का वहम और धार्मिक अंधविश्वास मानते हैं। बच्चों की बेमतलब की तुतलाहट को राजा ने अपनी मनपसंद भाषा समझ लिया था।"
    },
    visual_prompt: "Two toddlers on the beach babbling comically with baby toys, while a cartoon speech bubble above them shows holy Hebrew scrolls turning into baby rattles.",
    motion: "zoom_out",
    dur_ratio: 0.33
  },

  // Scene 13: Emperor Akbar's Gang Mahal (56.5s)
  {
    scene_id: 13,
    sub_id: 1,
    speaker: "EMPEROR_AKBAR",
    narration: {
      bn: "সবচেয়ে বিশ্বাসযোগ্য এবং সত্যিকারের বিজ্ঞানসম্মত পরীক্ষাটি করেছিলেন আমাদের এই উপমহাদেশের মুঘল সম্রাট আকবর দ্য গ্রেট!",
      en: "The most methodologically sound isolation experiment happened right in the Indian subcontinent under Mughal Emperor Akbar the Great!",
      hi: "सबसे प्रामाणिक और वैज्ञानिक प्रयोग किया हमारे उपमहाद्वीप के महान मुग़ल बादशाह अकबर ने!"
    },
    visual_prompt: "Grand red sandstone courtyards of Fatehpur Sikri, Emperor Akbar with regal emerald-studded turban and white pearls standing with dignity.",
    motion: "zoom_in",
    dur_ratio: 0.22
  },
  {
    scene_id: 13,
    sub_id: 2,
    speaker: "EMPEROR_AKBAR",
    narration: {
      bn: "১৫৭৯ সালে ফতেহপুর সিক্রিতে আকবর গূং মহল বা নিঃশব্দের প্রাসাদ নামে একটি সুরক্ষিত ভবন তৈরি করান। সেখানে ৩০ জন শিশুকে রাখা হয় এবং ধাত্রীদের জিভ বেঁধে বা বোবা ধাত্রী নিয়োগ করা হয়।",
      en: "In 1579 at Fatehpur Sikri, Akbar built the Gang Mahal—the Palace of the Mute. He placed 30 infants under the care of strictly mute wet nurses.",
      hi: "1579 में फतेहपुर सीकरी में अकबर ने गूँग महल नाम की एक अलग इमारत बनवाई। वहाँ तीस बच्चों को रखा गया और उनकी देखभाल के लिए गूँगी दाइयों को तैनात किया गया।"
    },
    visual_prompt: "A secluded red sandstone pavilion with high carved jali screens named Gang Mahal, silent guards standing outside arched gates.",
    motion: "pan_left",
    dur_ratio: 0.28
  },
  {
    scene_id: 13,
    sub_id: 3,
    speaker: "EMPEROR_AKBAR",
    narration: {
      bn: "চার বছর পর আকবর যখন সেই মহলে প্রবেশ করলেন—তিনি দেখলেন শিশুরা কোনো সংস্কৃত, আরবি বা ফারসি কিছুই বলছে না। তারা শুধু ভয়ার্ত পশুর মতো গোঙাচ্ছে আর ইশারায় কথা বলছে!",
      en: "When Akbar inspected the palace four years later, the children spoke zero Arabic, Sanskrit, or Persian. They communicated solely through animalistic grunts and frantic gestures.",
      hi: "चार साल बाद जब अकबर उस महल में पहुँचे, तो उन्होंने देखा कि बच्चे न अरबी बोल रहे थे, न संस्कृत और न फ़ारसी। वे सिर्फ जंगली जानवरों जैसी आवाज़ें और इशारे कर रहे थे!"
    },
    visual_prompt: "Inside the sunlit courtyard, Akbar walking forward with hands behind back, looking at silent children communicating with hand signs and puzzled looks.",
    motion: "zoom_in",
    dur_ratio: 0.28
  },
  {
    scene_id: 13,
    sub_id: 4,
    speaker: "EMPEROR_AKBAR",
    narration: {
      bn: "আকবর প্রমাণ করলেন: ভাষা কোনো ঈশ্বরপ্রদত্ত জাদুকরী কোড নয়, এটি সম্পূর্ণভাবে সমাজ থেকে শেখা একটি দক্ষতা!",
      en: "Akbar conclusively proved that human language is not an innate magical gift; it is 100% socially learned!",
      hi: "अकबर ने साबित कर दिया कि भाषा कोई ईश्वरीय वरदान नहीं, बल्कि समाज से सीखी जाने वाली विद्या है!"
    },
    visual_prompt: "Akbar turning to his court chronicler Abu'l-Fazl, nodding in profound scientific revelation, with a parchment diagram showing society shaping language.",
    motion: "zoom_out",
    dur_ratio: 0.22
  },

  // Scene 14: Kebara Hyoid Bone (45.5s)
  {
    scene_id: 14,
    sub_id: 1,
    speaker: "ARCHAEOLOGIST",
    narration: {
      bn: "তাহলে জীববিজ্ঞানের ইতিহাস কী বলছে? মানুষ কবে প্রথম কথা বলার মতো শারীরিক সক্ষমতা অর্জন করেছিল?",
      en: "So when did human anatomy physically evolve to speak?",
      hi: "तो इंसानी शरीर में बोलने की शारीरिक क्षमता कब विकसित हुई?"
    },
    visual_prompt: "A modern paleontologist in field gear looking at a timeline chart showing human skulls from 2 million years ago to present.",
    motion: "zoom_in",
    dur_ratio: 0.25
  },
  {
    scene_id: 14,
    sub_id: 2,
    speaker: "ARCHAEOLOGIST",
    narration: {
      bn: "১৯৮৩ সালে ইসরায়েলের কেবারা গুহায় প্রত্নতাত্ত্বিকরা ৬০,০০০ বছর পুরোনো একটি নিঅ্যান্ডারথাল কঙ্কাল খুঁজে পান। সেখানে মানুষের গলার ভেতরে থাকা সবচেয়ে স্পর্শকাতর হাড়—হাইঅয়েড বোন অক্ষত পাওয়া যায়।",
      en: "In 1983, inside Israel's Kebara Cave, paleoanthropologists unearthed a 60,000-year-old Neanderthal skeleton dubbed Kebara 2. Nestled in its throat was the fragile hyoid bone.",
      hi: "1983 में इज़रायल की केबारा गुफा में वैज्ञानिकों को 60,000 साल पुराना निएंडरथल कंकाल मिला। उनके गले में मौजूद हायोइड हड्डी बिल्कुल सुरक्षित थी।"
    },
    visual_prompt: "Archaeological trench inside a limestone cave, spotlight illuminating a fossilized skeleton, a delicate brush cleaning a horseshoe-shaped throat bone.",
    motion: "pan_right",
    dur_ratio: 0.40
  },
  {
    scene_id: 14,
    sub_id: 3,
    speaker: "ARCHAEOLOGIST",
    narration: {
      bn: "বিস্ময়করভাবে দেখা গেল, এই হাড়টি আধুনিক মানুষের গলার হাড়ের সাথে হুবহু এক! অর্থাৎ, নিঅ্যান্ডারথালরা বোবা বুনো জন্তু ছিল না, তারাও হয়তো জটিল ভাষায় কথা বলত!",
      en: "CT analysis revealed it was virtually identical to modern humans! The pop-culture myth of the dumb caveman was dead. Neanderthals likely spoke in full sentences!",
      hi: "यह हड्डी आज के इंसान की हड्डी जैसी ही थी! इसका मतलब था कि निएंडरथल सिर्फ गूँगे जानवर नहीं थे, बल्कि वे भी आपस में बातचीत करते थे!"
    },
    visual_prompt: "Side-by-side 3D glowing comparison of Neanderthal hyoid bone and modern human bone with matching green checkmarks, shattering the dumb brute stereotype.",
    motion: "zoom_out",
    dur_ratio: 0.35
  },

  // Scene 15: FOXP2 Gene (48.4s)
  {
    scene_id: 15,
    sub_id: 1,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "শুধু হাড় নয়, আমাদের জিনের ভেতরেও এর প্রমাণ লুকিয়ে আছে। ১৯৯০-এর দশকে লন্ডনের একটি পরিবারের ওপর গবেষণা করে বিজ্ঞানীরা আবিষ্কার করেন FOXP2 জিন—যাকে বলা হয় ভাষার মূল জিন।",
      en: "The mystery goes deeper into our DNA. In the 1990s, geneticists studying a London family pinpointed the FOXP2 gene—dubbed the language gene.",
      hi: "रहस्य सिर्फ हड्डियों में नहीं, हमारे डीएनए में भी छिपा है। 1990 के दशक में वैज्ञानिकों ने FOXP2 जीन की खोज की, जिसे भाषा का जीन कहा जाता है।"
    },
    visual_prompt: "High-tech genetics laboratory, scientist examining a glowing chromosome 7 map highlighting the sparkling FOXP2 gene locus.",
    motion: "zoom_in",
    dur_ratio: 0.35
  },
  {
    scene_id: 15,
    sub_id: 2,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "এই জিনে সামান্য সমস্যা থাকলে মানুষ কথা সাজাতে বা ব্যাকরণ বুঝতে পারে না।",
      en: "Without it, the brain cannot coordinate rapid mouth movements or process complex grammar.",
      hi: "इसके बिना इंसान मुँह की मांसपेशियों को तेज़ी से हिला नहीं सकता और न व्याकरण समझ सकता है।"
    },
    visual_prompt: "Animated brain diagram showing neural pathways lighting up from Broca's area to the tongue and lips during articulate speech.",
    motion: "pan_left",
    dur_ratio: 0.30
  },
  {
    scene_id: 15,
    sub_id: 3,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "আর সবচেয়ে তাজ্জব ব্যাপার হলো—আধুনিক মানুষের শরীরে এই জিনের যে রূপটি আছে, নিঅ্যান্ডারথালদের শরীরেও হুবহু সেই একই জিন ছিল! অর্থাৎ আজ থেকে অন্তত ৪ লাখ বছর আগেই আমাদের সাধারণ পূর্বপুরুষদের শরীরে ভাষা গঠনের ব্লু-প্রিন্ট তৈরি হয়ে গিয়েছিল!",
      en: "And when geneticists sequenced Neanderthal fossils, they found the exact same FOXP2 variants! The genetic operating system for speech existed at least 400,000 years ago!",
      hi: "और सबसे चौंकाने वाली बात यह है कि यही जीन निएंडरथल के डीएनए में भी मौजूद था! यानी बोलने का बुनियादी खाका कम से कम 4 लाख साल पहले ही तैयार हो चुका था!"
    },
    visual_prompt: "A smiling cartoon Neanderthal and a modern human standing together on a glowing DNA spiral double helix, high-fiving in evolutionary brotherhood.",
    motion: "zoom_out",
    dur_ratio: 0.35
  },

  // Scene 16: Dropped Larynx & Choking (48.5s)
  {
    scene_id: 16,
    sub_id: 1,
    speaker: "NARRATOR",
    narration: {
      bn: "কিন্তু কথা বলার জন্য মানুষের শরীরকে একটি মারাত্মক বিবর্তনীয় মূল্য দিতে হয়েছে! শিম্পাঞ্জিদের স্বরতন্ত্র গলার অনেক উপরে থাকে, তাই তারা একই সাথে পানি গিলতে ও শ্বাস নিতে পারে—তাদের কখনো বিষম খেয়ে দম বন্ধ হয় না।",
      en: "To grant us speech, natural selection made a terrifying trade-off. Chimpanzees have their larynx high in the throat—a chimp can drink and breathe simultaneously without choking.",
      hi: "लेकिन बोलने की यह ताकत हमें एक बहुत बड़े ख़तरे की कीमत पर मिली है! चिम्पांजी का गला ऐसा होता है कि वे एक ही समय में पानी पी सकते हैं और साँस ले सकते हैं।"
    },
    visual_prompt: "Chimpanzee anatomy cross-section showing high vocal larynx, chimp happily drinking water upside down without any coughing.",
    motion: "zoom_in",
    dur_ratio: 0.35
  },
  {
    scene_id: 16,
    sub_id: 2,
    speaker: "NARRATOR",
    narration: {
      bn: "কিন্তু মানুষের স্বরতন্ত্র কথা বলার জন্য গলার অনেক নিচে নেমে এসেছে। এর ফলে আমরা মিষ্টি সুর আর শব্দ বানাতে পারি ঠিকই, কিন্তু খাবার শ্বাসনালীতে আটকে মানুষ মারা যেতে পারে!",
      en: "In humans, the larynx dropped low into the throat, creating an acoustic resonance chamber. The deadly cost? We are one of the only mammals that can choke on our dinner!",
      hi: "लेकिन इंसान का वोकल कॉर्ड नीचे आ गया ताकि हम तरह-तरह की आवाज़ें निकाल सकें। इसका ख़तरा यह है कि खाना अटकने से इंसान की जान जा सकती है!"
    },
    visual_prompt: "Human throat cross-section diagram highlighting the deep pharynx acoustic chamber, beside a cartoon dinner guest comically coughing on a fish bone.",
    motion: "pan_right",
    dur_ratio: 0.35
  },
  {
    scene_id: 16,
    sub_id: 3,
    speaker: "NARRATOR",
    narration: {
      bn: "বিবর্তন আমাদের জীবনে এই মারাত্মক ঝুঁকি তখনই নিয়েছে, যখন ভাষার মূল্য মানুষের বেঁচে থাকার জন্য যেকোনো বিপদের চেয়ে কোটি গুণ বেশি ছিল!",
      en: "Evolution only accepted this fatal hazard because the survival power of language was astronomical.",
      hi: "कुदरत ने यह ख़तरा सिर्फ इसलिए उठाया क्योंकि बात करने की ताकत ज़िंदा रहने के लिए किसी भी ख़तरे से कहीं बड़ी थी!"
    },
    visual_prompt: "A balance scale: on one side a small choking danger symbol, on the other side a glowing golden word Language tipping the scale with massive weight.",
    motion: "zoom_out",
    dur_ratio: 0.30
  },

  // Scene 17: Kalahari Click Languages (40.8s)
  {
    scene_id: 17,
    sub_id: 1,
    speaker: "SAN_HUNTER",
    narration: {
      bn: "তাহলে সেই আদিম আফ্রিকার মাটির প্রথম ভাষাটি শুনতে কেমন ছিল? দক্ষিণ আফ্রিকার কালাহারি মরুভূমির সান বুশম্যানরা পৃথিবীর প্রাচীনতম জেনেটিক বংশধর।",
      en: "So what did that original African mother tongue actually sound like? Geneticists point to the indigenous San people of the Kalahari desert, carrying humanity's oldest lineage.",
      hi: "तो आखिर अफ्रीका की उस धरती पर इंसान की पहली बोली सुनने में कैसी लगती थी? वैज्ञानिक कालाहारी रेगिस्तान के सैन आदिवासियों की तरफ इशारा करते हैं।"
    },
    visual_prompt: "Magnificent red dunes of the Kalahari desert under a giant ancient baobab tree, warm sunset glow, San hunters resting gracefully.",
    motion: "zoom_in",
    dur_ratio: 0.33
  },
  {
    scene_id: 17,
    sub_id: 2,
    speaker: "SAN_HUNTER",
    narration: {
      bn: "তাদের মুখের ভাষা হলো খোয়সান বা ক্লিক ল্যাঙ্গুয়েজ। সেখানে কথা বলার সময় জিভ তালুতে ঠেকিয়ে অদ্ভুত টক্-টক্ শব্দ করা হয়।",
      en: "Their tongues belong to the Khoisan language family—famed for complex clicks produced by suction of the tongue.",
      hi: "उनकी भाषा में जीभ से क्लिक जैसी अनोखी आवाज़ें निकाली जाती हैं।"
    },
    visual_prompt: "Close-up of a San hunter speaking with friendly animated expression, with musical percussive click sound notes popping around his lips.",
    motion: "pan_left",
    dur_ratio: 0.33
  },
  {
    scene_id: 17,
    sub_id: 3,
    speaker: "SAN_HUNTER",
    narration: {
      bn: "আধুনিক সিংহভাগ ভাষাবিদ মনে করেন, মানুষের প্রথম আদি ভাষা হয়তো কোনো মিষ্টি গান ছিল না—ছিল শিকারের সময় নিঃশব্দে যোগাযোগ করার জন্য এমনই কিছু তীক্ষ্ণ ক্লিক ও শিসের মিশ্রণ!",
      en: "Linguists theorize primordial human speech was a rhythmic tapestry of percussive clicks and whistles designed for stealth communication during hunts!",
      hi: "भाषाविदों का मानना है कि इंसान की पहली बोली शिकार के दौरान बिना आवाज़ किए बात करने के लिए बनाई गई ऐसी ही सीटी और क्लिक की आवाज़ें थीं!"
    },
    visual_prompt: "Two hunters creeping through tall savanna grass stalking an antelope, using subtle tongue clicks and eye glances to coordinate silently.",
    motion: "zoom_out",
    dur_ratio: 0.34
  },

  // Scene 18: Atkinson's Phonemic Diversity (49.7s)
  {
    scene_id: 18,
    sub_id: 1,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "২০১১ সালে বিখ্যাত বিজ্ঞানী কোয়েন্টিন অ্যাটকিনসন বিশ্বখ্যাত সায়েন্স জার্নালে একটি যুগান্তকারী গবেষণা প্রকাশ করেন।",
      en: "In 2011, biologist Quentin Atkinson published a landmark paper in Science analyzing 504 languages across the globe.",
      hi: "2011 में वैज्ञानिक क्वेंटिन एटकिंसन ने साइंस पत्रिका में एक ऐतिहासिक शोध छापा। उन्होंने दुनिया की 504 भाषाओं की बुनियादी आवाज़ों का अध्ययन किया।"
    },
    visual_prompt: "The cover of Science magazine with computer-generated world frequency maps, Professor Atkinson smiling at computer data screens.",
    motion: "zoom_in",
    dur_ratio: 0.30
  },
  {
    scene_id: 18,
    sub_id: 2,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "তিনি বিশ্বের ৫০৪টি ভাষার মৌলিক ধ্বনি বা ফোনমে বিশ্লেষণ করে দেখলেন—আফ্রিকার ক্লিক ভাষাগুলোতে ১০০টিরও বেশি আলাদা আলাদা ধ্বনি রয়েছে!",
      en: "He mapped phonemes—basic units of distinct sound. Southwest African click languages boast over 100 distinct phonemes!",
      hi: "नतीजा हैरान करने वाला था: अफ्रीका की भाषाओं में 100 से ज़्यादा आवाज़ें हैं!"
    },
    visual_prompt: "3D map of Africa with a massive glowing fountain of colorful phonetic sound bubbles rising into the sky over Southern Africa.",
    motion: "pan_right",
    dur_ratio: 0.35
  },
  {
    scene_id: 18,
    sub_id: 3,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "কিন্তু আফ্রিকা থেকে মানুষ যত দূরে মাইগ্রেট করেছে, ধ্বনির সংখ্যা তত কমে গেছে। দক্ষিণ আমেরিকায় মাত্র ২৫টি, আর প্রশান্ত মহাসাগরের হাওয়াইয়ান ভাষায় ধ্বনি বেঁচে আছে মাত্র ১৩টি! ঠিক যেমন আফ্রিকা থেকে বের হয়ে মানুষের জিনগত বৈচিত্র্য কমেছিল, ভাষার বৈচিত্র্যও সেভাবেই কমেছে!",
      en: "As you trace migration paths across Eurasia and the Pacific, phoneme counts collapse! Pirahã in the Amazon has 11; Hawaiian has just 13! Language diversity bled out just like human genetics.",
      hi: "लेकिन जैसे-जैसे इंसान अफ्रीका से दूर गया, भाषाओं की आवाज़ें घटती चली गईं। दक्षिण अमेरिका में सिर्फ 25 बचीं और हवाई द्वीप की भाषा में केवल 13!"
    },
    visual_prompt: "Golden migration arrows flowing from Africa across Asia, Americas, and Pacific, with sound counters dropping from 100 down to 13 on distant Pacific islands.",
    motion: "zoom_out",
    dur_ratio: 0.35
  },

  // Scene 19: The Great Coastal Migration (45.2s)
  {
    scene_id: 19,
    sub_id: 1,
    speaker: "NARRATOR",
    narration: {
      bn: "৭০,০০০ বছর আগে যখন তুষারযুগ শুরু হলো, একদল মানুষ আফ্রিকা ছেড়ে লোহিত সাগর পাড়ি দিল।",
      en: "Around 70,000 years ago, as glaciers locked the north, intrepid bands crossed the Red Sea in the Great Coastal Migration.",
      hi: "लगभग 70,000 साल पहले जब हिमयुग शुरू हुआ, इंसानों के छोटे-छोटे समूह अफ्रीका छोड़कर लाल सागर पार कर गए।"
    },
    visual_prompt: "Ancient human families holding flaming driftwood torches walking across shallow turquoise sea straits under starry night skies.",
    motion: "zoom_in",
    dur_ratio: 0.30
  },
  {
    scene_id: 19,
    sub_id: 2,
    speaker: "NARRATOR",
    narration: {
      bn: "উপকূল ধরে কেউ পৌঁছাল ভারতে, কেউ ইউরোপে, কেউ সাইবেরিয়া পেরিয়ে আমেরিকায়। হাজার হাজার বছরের বিচ্ছিন্নতায় সেই আদি আফ্রিকার ভাষাটি ভেঙে কোটি কোটি নতুন শব্দ তৈরি করল।",
      en: "Over tens of thousands of years, tribes settled the coasts of India, valleys of China, tundra of Siberia, and crossed into the Americas, fracturing speech into millions of words.",
      hi: "हज़ारों सालों के सफर में कुछ भारत पहुँचे, कुछ चीन, कुछ यूरोप और कुछ साइबेरिया पार करके अमेरिका पहुँचे।"
    },
    visual_prompt: "Panoramic world montage: campfire in Indian monsoon valley, yurt in snowy Siberian tundra, wooden canoes along Pacific coast.",
    motion: "pan_left",
    dur_ratio: 0.40
  },
  {
    scene_id: 19,
    sub_id: 3,
    speaker: "NARRATOR",
    narration: {
      bn: "ইন্দো-ইউরোপীয়, দ্রাবিড়, সিনো-তিব্বতি—হাজারো ভাষা পরিবারের জন্ম হলো। ব্যবিলনের কোনো অভিশাপ নয়, ভূগোলের বিশাল দূরত্বের কারণেই মানুষের ভাষা বিভক্ত হয়ে গিয়েছিল।",
      en: "Indo-European, Dravidian, Sino-Tibetan language families were born. Not a curse from heaven, but pure distance and time.",
      hi: "इंडो-यूरोपीय, द्रविड़, चीनी-तिब्बती भाषा परिवारों का जन्म हुआ। यह किसी का शाप नहीं था, बल्कि दुनिया के भूगोल और समय का खेल था।"
    },
    visual_prompt: "A flourishing botanical tree of languages with colorful blossoming branches named Indo-European, Dravidian, Sino-Tibetan spreading gracefully.",
    motion: "zoom_out",
    dur_ratio: 0.30
  },

  // Scene 20: Gestural Theory (47.1s)
  {
    scene_id: 20,
    sub_id: 1,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "আধুনিক অনেক শীর্ষ বিজ্ঞানী যেমন মাইকেল করবালিস মনে করেন—মানুষের প্রথম ভাষা আসলে মুখ দিয়ে শুরুই হয়নি! তা শুরু হয়েছিল হাতের ইশারায়—অর্থাৎ সাইন ল্যাঙ্গুয়েজ দিয়ে!",
      en: "Cognitive scientists like Michael Corballis propose that human language didn't even start with vocal cords—it started with our hands!",
      hi: "माइकल कॉर्बालिस जैसे कई आधुनिक वैज्ञानिकों का मानना है कि इंसान की पहली भाषा मुँह से नहीं, बल्कि हाथों के इशारों यानी साइन लैंग्वेज से शुरू हुई थी!"
    },
    visual_prompt: "The Time Chronicler standing beside a chalkboard showing expressive cartoon hands gesturing in sign language, smiling warmly.",
    motion: "zoom_in",
    dur_ratio: 0.32
  },
  {
    scene_id: 20,
    sub_id: 2,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "শিম্পাঞ্জিরা চিৎকার করে কোনো নতুন তথ্য দিতে পারে না, কিন্তু তারা চমৎকার হাতের ইশারা তৈরি করতে পারে। মানুষও প্রথমে পূর্ণাঙ্গ হাত ও চেহারার ভাষায় কথা বলত।",
      en: "Apes have poor control over screeches, but extraordinary dexterity with manual gestures. Earliest humans likely communicated in rich sign language.",
      hi: "बंदर अपनी आवाज़ पर ज़्यादा काबू नहीं रख सकते, लेकिन वे हाथों से कमाल के इशारे करते हैं। आदिम इंसानों ने भी पहले हाथों से बात करना शुरू किया।"
    },
    visual_prompt: "Two cartoon early humans sitting near a cave entrance, having a rich expressive conversation entirely through graceful manual hand signs and facial expressions.",
    motion: "pan_right",
    dur_ratio: 0.34
  },
  {
    scene_id: 20,
    sub_id: 3,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "কিন্তু হাতের তো একটা সমস্যা আছে—রাতে অন্ধকারে তা দেখা যায় না, আর হাতে পাথরের অস্ত্র থাকলে হাত দিয়ে কথা বলা যায় না! তাই মানুষ আস্তে আস্তে সেই ইশারাগুলোকে গলার শব্দে রূপান্তর করল!",
      en: "But sign language had critical bugs: you can't see hands in pitch-black caves, and you can't sign while gripping a spear! So nature transferred gestures into vocal acoustics.",
      hi: "लेकिन हाथों की दो कमियाँ थीं: अंधेरी रात में हाथ नहीं दिखते और शिकार करते वक्त हाथ खाली नहीं होते! इसलिए धीरे-धीरे इंसान ने हाथों के इशारों को आवाज़ में बदल दिया!"
    },
    visual_prompt: "Caveman in pitch dark squinting trying to see his friend's hand gestures, then switching to vocal speech with a bright lightbulb over his head.",
    motion: "zoom_out",
    dur_ratio: 0.34
  },

  // Scene 21: Superpower (34.3s)
  {
    scene_id: 21,
    sub_id: 1,
    speaker: "NARRATOR",
    narration: {
      bn: "মানুষের না আছে সিংহের মতো দাঁত, না আছে চিতার মতো গতি। একাকী একটি মানুষ সাভানায় নিতান্তই অসহায় এক খাবার।",
      en: "Physically, Homo sapiens are pathetic. No sharp fangs, no cheetah speed. A solitary human in the wild is just lunch.",
      hi: "शारीरिक रूप से इंसान बहुत कमज़ोर है। न हमारे पास शेर जैसे दाँत हैं, न चीते जैसी रफ़्तार। जंगल में अकेला इंसान सिर्फ एक शिकार था।"
    },
    visual_prompt: "A shivering, scrawny cartoon caveman with a tiny stick staring nervously at a ferocious giant saber-toothed cat with enormous fangs.",
    motion: "zoom_in",
    dur_ratio: 0.32
  },
  {
    scene_id: 21,
    sub_id: 2,
    speaker: "NARRATOR",
    narration: {
      bn: "কিন্তু ভাষার কারণেই লাখ লাখ দুর্বল মানুষ একসাথে মিলে সেনাবাহিনী গড়ল, পিরামিড তৈরি করল, সংবিধান লিখল এবং চাঁদে রকেট পাঠাল!",
      en: "Language was our cheat code! It allowed thousands of strangers to coordinate, build colossal cities, write constitutions, and launch rockets to the moon!",
      hi: "लेकिन भाषा ही इंसान का वह जादुई हथियार बनी जिसने लाखों अजनबियों को एकजुट किया, पिरामिड खड़े किए, कानून बनाए और अंतरिक्ष तक रॉकेट भेजे!"
    },
    visual_prompt: "Timelapse montage: hundreds of stickmen pulling stones for a pyramid transitioning seamlessly into a modern space rocket launching into starlight.",
    motion: "pan_left",
    dur_ratio: 0.40
  },
  {
    scene_id: 21,
    sub_id: 3,
    speaker: "NARRATOR",
    narration: {
      bn: "ভাষা কেবল যোগাযোগের মাধ্যম নয়—এটি মানুষের মস্তিষ্ককে একে অপরের সাথে যুক্ত করার এক মহাজাগতিক ইন্টারনেট!",
      en: "Speech was the neural internet that networked billions of human minds together.",
      hi: "भाषा सिर्फ बातचीत का ज़रिया नहीं, बल्कि इंसानी दिमागों को आपस में जोड़ने वाला एक इंटरनेट थी!"
    },
    visual_prompt: "Glowing network lines connecting millions of cartoon human silhouettes across continents, forming a radiant illuminated brain web across Earth.",
    motion: "zoom_out",
    dur_ratio: 0.28
  },

  // Scene 22: Outro & Call to Action (42.0s)
  {
    scene_id: 22,
    sub_id: 1,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "তাই ফারাওয়ের বেকস হোক বা আফ্রিকার মরুভূমির ক্লিক—মানুষের প্রথম ভাষা আসলে কোনো নির্দিষ্ট একক শব্দ ছিল না। মানুষের প্রথম ভাষা ছিল অন্য মানুষের চোখের দিকে তাকিয়ে তাকে আপন করে নেওয়ার এক চিরন্তন আকুলতা।",
      en: "So whether it was Pharaoh's Bekos, Kalahari clicks, or silent signs—first language wasn't a single magic word. It was the eternal yearning to connect across darkness.",
      hi: "तो चाहे फिरौन का बेकोस हो या रेगिस्तान की क्लिक आवाज़ें—इंसान की पहली भाषा कोई एक जादुई शब्द नहीं थी। वह तो बस अंधेरे में एक-दूसरे को समझने की चाहत थी।"
    },
    visual_prompt: "Two ancient humans around a warm campfire, smiling with deep understanding, two glowing silhouettes touching fingertips under cosmic stars.",
    motion: "zoom_in",
    dur_ratio: 0.35
  },
  {
    scene_id: 22,
    sub_id: 2,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "আজ তুমি যে ভাষায় কথা বলছ, সেই ভাষার কোন শব্দটি তোমার সবচেয়ে প্রিয়? কমেন্টে লিখে জানাও।",
      en: "What is your favorite word in your native language? Drop it in the comments below!",
      hi: "आपकी अपनी मातृभाषा का कौन सा शब्द आपको सबसे प्यारा लगता है? कमेंट में ज़रूर बताइए।"
    },
    visual_prompt: "The Time Chronicler cupping his ear playfully with a bright smile, pointing down toward a cartoon YouTube comment box with speech bubbles.",
    motion: "pan_right",
    dur_ratio: 0.25
  },
  {
    scene_id: 22,
    sub_id: 3,
    speaker: "TIME_CHRONICLER",
    narration: {
      bn: "ইতিহাসকে সহজ ও হাসিখুশি করে জানতে সাবস্ক্রাইব করে সঙ্গে থাকো আমাদের Simple History Teller Bangla পরিবারের। আমি সময়ের সাক্ষী—দেখা হবে ইতিহাসের পরের অভিযানে!",
      en: "Hit subscribe and ring the bell to join us on Simple History Teller. I am the Time Chronicler—until our next journey through time!",
      hi: "इतिहास को इसी तरह आसान और मज़ेदार तरीके से जानने के लिए Simple History Teller Hindi को सब्सक्राइब करें। मैं हूँ समय का गवाह—फिर मिलेंगे इतिहास के अगले सफ़र में!"
    },
    visual_prompt: "The Time Chronicler closing his grand glowing history book with a warm farewell wave, beside a vibrant glowing YouTube Subscribe Bell and channel banner.",
    motion: "zoom_out",
    dur_ratio: 0.40
  }
];

// Now construct expanded scenes
const expandedScenes = [];
let shotCounter = 1;

for (const shot of granularShots) {
  const origScene = original.scenes.find(s => s.scene_id === shot.scene_id);
  const shotNum = String(shotCounter).padStart(4, '0');
  
  // Calculate per-language duration for this shot based on its ratio of the original scene
  const langDurs = {};
  for (const l of ['bn', 'en', 'hi']) {
    const parentDur = (origScene.language_durations && origScene.language_durations[l]) || origScene.duration;
    langDurs[l] = +(parentDur * shot.dur_ratio).toFixed(3);
  }

  expandedScenes.push({
    scene_id: shotCounter,
    parent_scene_id: shot.scene_id,
    sub_id: shot.sub_id,
    type: "STATIC_IMAGE",
    dialogue_speaker: shot.speaker,
    narration: shot.narration,
    visual_prompt: shot.visual_prompt + " --no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks",
    asset_file: `visual_assets/shot_${shotNum}.jpg`,
    sfx: origScene.sfx,
    motion_effect: shot.motion,
    duration: langDurs.bn,
    language_durations: langDurs
  });

  shotCounter++;
}

// Compute timestamps
let acc = 0;
for (const s of expandedScenes) {
  s.timestamp_start = +acc.toFixed(3);
  acc += s.duration;
  s.timestamp_end = +acc.toFixed(3);
}

const updatedProject = {
  ...original,
  total_shots: expandedScenes.length,
  scenes: expandedScenes
};

fs.writeFileSync(PROJECT_JSON, JSON.stringify(updatedProject, null, 2), 'utf8');

console.log(`Successfully expanded ${original.scenes.length} scenes into ${expandedScenes.length} granular shots!`);
console.log(`Average shot duration: ${(acc / expandedScenes.length).toFixed(1)}s (dynamic pacing).`);
console.log(`Total duration: ${acc.toFixed(2)}s (${(acc / 60).toFixed(2)} minutes).`);
