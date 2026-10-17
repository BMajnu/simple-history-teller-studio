const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.resolve('public/assets/badges');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const SPEAKER_META = {
  TIME_CHRONICLER: {
    icon: '🎙️',
    type: 'host',
    bn: { name: 'সময়ের সাক্ষী', role: 'হোস্ট ও গল্পকথক' },
    en: { name: 'The Time Chronicler', role: 'Host & Storyteller' },
    hi: { name: 'समय का साक्षी', role: 'सूत्रधार एवं कहानीकार' }
  },
  HUNTER_CHIEF: {
    icon: '🏹',
    type: 'hunter',
    bn: { name: 'শিকারি প্রধান', role: 'আদিম কৌম নেতা' },
    en: { name: 'Hunter Chief', role: 'Egalitarian Leader' },
    hi: { name: 'शिकारी सरदार', role: 'शिकारी कबीला' }
  },
  WARLORD: {
    icon: '⚔️',
    type: 'warlord',
    bn: { name: 'লুগাল (যুদ্ধনেতা)', role: 'মেসোপটেমিয়ার প্রথম শাসক' },
    en: { name: 'Sumerian Warlord (Lugal)', role: 'First Ruler' },
    hi: { name: 'सुमेरियन युद्धनेता (लुगाल)', role: 'पहला शासक' }
  },
  SUMERIAN_ENSI: {
    icon: '⚔️',
    type: 'warlord',
    bn: { name: 'এনসি (নগরপ্রধান)', role: 'প্রাচীন উরুক নগর' },
    en: { name: 'Ensi (City Governor)', role: 'Ancient Uruk' },
    hi: { name: 'एनसी (नगर प्रमुख)', role: 'प्राचीन उरुक' }
  },
  PHARAOH_NARMER: {
    icon: '👑',
    type: 'host',
    bn: { name: 'ফারাও নারমার', role: 'মিশরের প্রথম ঐক্যবদ্ধ ফারাও' },
    en: { name: 'Pharaoh Narmer', role: 'First Pharaoh of Egypt' },
    hi: { name: 'फ़राओ नार्मर', role: 'मिस्र का पहला सम्राट' }
  },
  HAMMURABI: {
    icon: '⚖️',
    type: 'host',
    bn: { name: 'সম্রাট হাম্মুরাবি', role: 'ব্যাবিলনের বিধাতা' },
    en: { name: 'King Hammurabi', role: 'Babylonian Lawgiver' },
    hi: { name: 'सम्राट हम्मुराबी', role: 'बेबीलोन के शासक' }
  },
  SUMERIAN_PRIEST: {
    icon: '🏛️',
    type: 'priest',
    bn: { name: 'সুমেরীয় পুরোহিত', role: 'প্রধান জিকুরাত' },
    en: { name: 'Sumerian High Priest', role: 'Grand Ziggurat' },
    hi: { name: 'सुमेरियन मुख्य पुरोहित', role: 'मुख्य ज़िगुरात' }
  },
  PRIEST_VOICE: {
    icon: '🏛️',
    type: 'priest',
    bn: { name: 'সুমেরীয় পুরোহিত', role: 'প্রধান জিকুরাত' },
    en: { name: 'Sumerian Priest', role: 'Grand Ziggurat' },
    hi: { name: 'सुमेरियन पुरोहित', role: 'मुख्य ज़िगुरात' }
  },
  ELDER: {
    icon: '👴',
    type: 'character',
    bn: { name: 'কৌম প্রবীণ', role: 'অভিজ্ঞ শিকারি' },
    en: { name: 'Tribal Elder', role: 'Elder Forager' },
    hi: { name: 'कबीलाई बुज़ुर्ग', role: 'अनुभवी शिकारी' }
  },
  BABYLON_DEBTOR: {
    icon: '⛓️',
    type: 'character',
    bn: { name: 'ব্যাবিলনীয় নাগরিক', role: 'ঋণগ্রস্ত প্রজা' },
    en: { name: 'Babylonian Debtor', role: 'Indebted Citizen' },
    hi: { name: 'बेबीलोन का नागरिक', role: 'कर्ज़दार प्रजा' }
  },
  FARMER_VOICE: {
    icon: '🌾',
    type: 'character',
    bn: { name: 'প্রাচীন কৃষক', role: 'উদ্বৃত্ত শস্য উৎপাদনকারী' },
    en: { name: 'Ancient Farmer', role: 'Grain Producer' },
    hi: { name: 'प्राचीन किसान', role: 'अन्न उत्पादक' }
  },
  CITIZEN: {
    icon: '👥',
    type: 'character',
    bn: { name: 'প্রাচীন নাগরিক', role: 'সাধারণ প্রজা' },
    en: { name: 'Ancient Citizen', role: 'Common Subject' },
    hi: { name: 'प्राचीन नागरिक', role: 'आम प्रजा' }
  },
  NARRATOR: {
    icon: '📜',
    type: 'narrator',
    bn: { name: 'ইতিহাস কথক', role: 'মূল ধারাভাষ্য' },
    en: { name: 'Historical Narrator', role: 'Documentary Voice' },
    hi: { name: 'इतिहास वाचक', role: 'मुख्य कथावाचक' }
  }
};

const STYLES = {
  host: {
    bg: 'rgba(28, 18, 5, 0.45)',
    border: '1.5px solid rgba(229, 184, 11, 0.45)',
    color: '#fef08a',
    glow: '0 4px 18px rgba(0, 0, 0, 0.45), 0 0 12px rgba(229, 184, 11, 0.16)'
  },
  character: {
    bg: 'rgba(10, 15, 25, 0.45)',
    border: '1.5px solid rgba(56, 189, 248, 0.42)',
    color: '#e0f2fe',
    glow: '0 4px 18px rgba(0, 0, 0, 0.45)'
  },
  hunter: {
    bg: 'rgba(12, 25, 15, 0.45)',
    border: '1.5px solid rgba(52, 211, 153, 0.45)',
    color: '#d1fae5',
    glow: '0 4px 18px rgba(0, 0, 0, 0.45)'
  },
  warlord: {
    bg: 'rgba(30, 10, 15, 0.45)',
    border: '1.5px solid rgba(248, 113, 113, 0.45)',
    color: '#fee2e2',
    glow: '0 4px 18px rgba(0, 0, 0, 0.45)'
  },
  priest: {
    bg: 'rgba(25, 10, 35, 0.45)',
    border: '1.5px solid rgba(192, 132, 252, 0.45)',
    color: '#f3e8ff',
    glow: '0 4px 18px rgba(0, 0, 0, 0.45)'
  },
  narrator: {
    bg: 'rgba(15, 20, 30, 0.45)',
    border: '1.5px solid rgba(148, 163, 184, 0.40)',
    color: '#f1f5f9',
    glow: '0 4px 18px rgba(0, 0, 0, 0.45)'
  }
};

async function generateAll() {
  console.log('Generating ultra-high fidelity speaker badge PNGs for 1080p...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 600 } });

  const langs = ['bn', 'en', 'hi'];
  let count = 0;

  for (const [key, data] of Object.entries(SPEAKER_META)) {
    const style = STYLES[data.type] || STYLES.character;

    for (const lang of langs) {
      const textData = data[lang] || data.bn || data.en;
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;600;700&family=Noto+Sans+Devanagari:wght@500;600;700&family=Inter:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 30px;
      background: transparent;
      display: inline-block;
      font-family: 'Hind Siliguri', 'Noto Sans Devanagari', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 6px 16px 8px 14px;
      border-radius: 9px;
      background: ${style.bg};
      border: ${style.border};
      box-shadow: ${style.glow};
      color: ${style.color};
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .icon {
      font-size: 24px;
      line-height: 1;
      display: flex;
      align-items: center;
    }
    .name {
      font-size: 23px;
      font-weight: 700;
      letter-spacing: 0.3px;
      line-height: 1.2;
    }
    .role {
      font-size: 20px;
      font-weight: 500;
      opacity: 0.82;
      border-left: 1.5px solid rgba(255, 255, 255, 0.28);
      padding-left: 10px;
      margin-left: 2px;
      line-height: 1.2;
    }
  </style>
</head>
<body>
  <div class="badge" id="targetBadge">
    <span class="icon">${data.icon}</span>
    <span class="name">${textData.name}</span>
    <span class="role">${textData.role}</span>
  </div>
</body>
</html>
      `;

      await page.setContent(html, { waitUntil: 'load' });
      const badgeElem = await page.$('#targetBadge');
      const filename = `badge_${key}_${lang}.png`;
      const filePath = path.join(outDir, filename);

      await badgeElem.screenshot({
        path: filePath,
        omitBackground: true
      });

      count++;
    }
  }

  await browser.close();
  console.log(`✓ Successfully generated ${count} transparent PNG speaker badges in ${outDir}!`);
}

generateAll().catch(console.error);
