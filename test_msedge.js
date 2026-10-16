const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');
const path = require('path');

async function test() {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('bn-BD-PradeepNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  
  const text = 'আমি সময়ের সাক্ষী! আজ তোমাকে নিয়ে যাব মানব ইতিহাসের সেই মুহূর্তে, যখন তৈরি হয়েছিল মানুষের প্রথম ভাষা।';
  const outPath = path.join(__dirname, 'scratch', 'test_msedge_bn.mp3');

  console.log('Testing msedge-tts Bengali (bn-BD-PradeepNeural)...');
  const { audioStream } = tts.toStream(text);
  const writeStream = fs.createWriteStream(outPath);
  audioStream.pipe(writeStream);

  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    audioStream.on('error', reject);
  });

  const st = fs.statSync(outPath);
  console.log(`SUCCESS! Saved ${outPath} (${st.size} bytes)`);
}

test().catch(console.error);
