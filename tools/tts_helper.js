const fs = require('fs');
const path = require('path');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const VOICE_MAP = {
  bn: 'bn-BD-PradeepNeural',
  en: 'en-US-ChristopherNeural',
  hi: 'hi-IN-MadhurNeural'
};

/**
 * Synthesizes studio-grade neural speech using Microsoft Azure Neural TTS.
 * @param {string} text - Text to speak
 * @param {string} lang - 'bn' | 'en' | 'hi'
 * @param {string} outFile - Destination audio file path
 */
async function synthesizeSpeech(text, lang, outFile) {
  const voice = VOICE_MAP[lang] || 'bn-BD-PradeepNeural';
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const outDir = path.dirname(outFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    try {
      const { audioStream } = tts.toStream(text);
      const writeStream = fs.createWriteStream(outFile);
      audioStream.pipe(writeStream);

      writeStream.on('finish', () => resolve(outFile));
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { synthesizeSpeech, VOICE_MAP };
