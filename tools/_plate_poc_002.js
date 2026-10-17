const C = require('../lib/media-compositor');
(async () => {
  const projDir = require('path').resolve(__dirname, '..', 'projects', 'simple_itihash_002_first_language');
  const logoBn = projDir + '\\branding\\avatar_simple_history_teller_bangla.jpg';
  const bgShot = projDir + '\\visual_assets\\shot_0007.jpg';
  const overlayOk = await C.runPlateScript({
    mode: 'shorts_overlay',
    out_path: projDir + '\\..\\..\\tools\\_poc_overlay_bn.png',
    lang: 'bn',
    logo_path: logoBn,
    channel_name: 'Simple History Teller Bangla',
    channel_handle: '@SimpleHistoryTellerBangla',
    part_label: 'পর্ব ১ / ১২',
    short_title: 'এক লাখ বছর কেউ কথা বলেনি!',
    main_video_label: 'মূল ভিডিও / FULL DOCUMENTARY:',
    main_title: 'মানুষের প্রথম ভাষা কী ছিল? (ফারাও এবং আকবরের নিষিদ্ধ পরীক্ষা)',
    cta_text: 'সম্পূর্ণ ভিডিও দেখুন চ্যানেলে • SUBSCRIBE',
    vid_y1: 560,
    vid_h: 640
  });
  console.log('overlay:', overlayOk);
  const thumbOk = await C.runPlateScript({
    mode: 'thumbnail',
    is_short: true,
    out_path: projDir + '\\..\\..\\tools\\_poc_thumb_bn.png',
    lang: 'bn',
    bg_path: bgShot,
    logo_path: logoBn,
    channel_name: 'Simple History Teller Bangla',
    badge_text: 'পর্ব ১ / ১২',
    title_text: 'এক লাখ বছর কেউ কথা বলেনি!'
  });
  console.log('thumb:', thumbOk);
  const masterOk = await C.runPlateScript({
    mode: 'thumbnail',
    is_short: false,
    out_path: projDir + '\\..\\..\\tools\\_poc_master_bn.png',
    lang: 'bn',
    bg_path: bgShot,
    logo_path: logoBn,
    channel_name: 'Simple History Teller Bangla',
    badge_text: 'পূর্ণাঙ্গ ডকুমেন্টারি',
    title_text: 'মানুষের প্রথম ভাষা কী ছিল? (ফারাও এবং আকবরের নিষিদ্ধ পরীক্ষা)'
  });
  console.log('master:', masterOk);
  await C.closePlateRenderer();
  process.exit(0);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
