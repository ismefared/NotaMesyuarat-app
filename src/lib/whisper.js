/**
 * Transkripsi suara-ke-teks secara on-device menggunakan Whisper
 * (transformers.js / ONNX Runtime Web). Model dimuat turun sekali
 * dan disimpan dalam cache pelayar.
 *
 * Pilihan bahasa: 'auto' (deteksi) atau kod ISO ('ms', 'en', dll).
 * Untuk Bahasa Melayu, paksaan 'ms' + prompt anti-hallucination
 * membantu mengelakkan gelung pengulangan (loop) pada model kecil.
 */
import { pipeline, env } from '@huggingface/transformers';
import { decodeMono, encodeWav, enhanceSamples, splitSamples } from './audioTools';

env.allowLocalModels = false;

export const MODELS = {
  tiny: {
    id: 'onnx-community/whisper-tiny',
    label: 'Tiny — paling pantas (~50MB), ketepatan asas',
  },
  base: {
    id: 'onnx-community/whisper-base',
    label: 'Base — seimbang (~80MB), disyorkan',
  },
  small: {
    id: 'onnx-community/whisper-small',
    label: 'Small — paling tepat (~250MB), lebih lambat',
  },
};

export const LANGUAGES = [
  { id: 'auto', label: 'Auto — kesan automatik' },
  { id: 'ms', label: 'Bahasa Melayu' },
  { id: 'en', label: 'English' },
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'zh', label: '中文 Mandarin' },
  { id: 'ta', label: 'தமிழ் Tamil' },
];

const DEFAULT_MODEL = 'base';

// Prompt pemula untuk memandu dekoder — menyatakan konteks
// dan mengelakkan hasil seperti "[Speaking in foreign language]".
const INITIAL_PROMPTS = {
  ms: 'Ini adalah mesyuarat dalam Bahasa Melayu. Sila transkrip dengan tepat tanpa mengulang ayat.',
  en: 'This is a meeting in English. Transcribe accurately without repeating sentences.',
  id: 'Ini adalah rapat dalam Bahasa Indonesia. Transkrip dengan tepat tanpa mengulang kalimat.',
  zh: 'This is a meeting in Mandarin Chinese. Transcribe accurately.',
  ta: 'This is a meeting in Tamil. Transcribe accurately.',
};

let asrCache = { key: null, promise: null };

function getASR(modelKey, onProgress) {
  const modelId = MODELS[modelKey]?.id || MODELS[DEFAULT_MODEL].id;
  if (asrCache.key !== modelId) {
    asrCache = {
      key: modelId,
      promise: pipeline('automatic-speech-recognition', modelId, {
        dtype: 'q8',
        progress_callback: (info) => {
          if (info.status === 'progress' && info.file?.includes('.onnx')) {
            onProgress?.({
              file: info.file,
              percent: Math.round(info.progress || 0),
            });
          }
        },
      }),
    };
  }
  return asrCache.promise;
}

export function loadASR(onProgress, modelKey = DEFAULT_MODEL) {
  return getASR(modelKey, onProgress);
}

export function isModelReady() {
  return asrCache.promise !== null;
}

/**
 * Bersihkan hasil transkrip daripada artefak hallucination Whisper:
 * - Pengulangan frasa berturutan ("that's, that's, that's, ...")
 * - Penanda seperti "[Speaking in foreign language]", "[Inaudible]"
 * - Baris duplikasi penuh
 */
function cleanTranscript(text) {
  let out = text;

  // Buang penanda artefak umum Whisper (dengan atau tanpa ruang dalam kurungan)
  out = out.replace(/\s*\[[^\]]*\]\s*/gi, ' ');

  // Buang pengulangan frasa 3+ kali berturutan, dengan pemisah koma/ruang.
  // Ulang sehingga stabil untuk menangkap rantaian panjang.
  const repetisi = /([^,.!?\n]{2,60}?)([,\s]+)\1(\2\1)+/gi;
  let sebelum;
  do {
    sebelum = out;
    out = out.replace(repetisi, '$1');
  } while (out !== sebelum);

  // Buang baris yang sama berturut-turut
  const lines = out.split('\n');
  const deduped = [];
  for (const line of lines) {
    const prev = deduped[deduped.length - 1];
    if (!prev || prev.trim() !== line.trim()) deduped.push(line);
  }
  out = deduped.join('\n');

  // Rapatkan koma/ruang berkembar dan koma sebelum titik
  out = out.replace(/([,\s])\1+/g, '$1').replace(/,+\s*\./g, '.').trim();
  return out;
}

/**
 * Transkripsi pintar:
 * - Audio panjang (> thresholdSec) dipecah automatik kepada segmen dan
 *   ditranskripsi berurutan — mengurangkan beban memori dan masa per larian.
 * - `enhance` mengaktifkan tapisan bising ringan + normalisasi sebelum ASR.
 * - onProgress({ phase, part, total }) untuk status UI.
 */
export async function transcribeFlexible(
  blob,
  modelKey = DEFAULT_MODEL,
  language = 'auto',
  { enhance = false, thresholdSec = 900, segmentSec = 600, onProgress } = {}
) {
  const { samples, sampleRate, duration } = await decodeMono(blob);
  let data = samples;
  if (enhance) {
    onProgress?.({ phase: 'enhance' });
    data = enhanceSamples(samples, sampleRate);
  }

  if (!Number.isFinite(duration) || duration <= thresholdSec) {
    return transcribe(encodeWav(data, sampleRate), modelKey, language);
  }

  const parts = splitSamples(data, sampleRate, segmentSec);
  const results = [];
  for (let i = 0; i < parts.length; i++) {
    onProgress?.({ phase: 'segment', part: i + 1, total: parts.length });
    const text = await transcribe(encodeWav(parts[i], sampleRate), modelKey, language);
    if (text) results.push(text);
  }
  return results.join('\n\n');
}

export async function transcribe(blob, modelKey = DEFAULT_MODEL, language = 'auto') {
  const asr = await getASR(modelKey);
  const url = URL.createObjectURL(blob);
  try {
    const options = {
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
      return_timestamps: false,
    };
    // 'auto' — biarkan Whisper mengesan bahasa. Selain itu, paksa kod.
    if (language && language !== 'auto') {
      options.language = language;
      const prompt = INITIAL_PROMPTS[language];
      if (prompt) options.prompt = prompt;
    }
    const out = await asr(url, options);
    return cleanTranscript((out.text || '').trim());
  } finally {
    URL.revokeObjectURL(url);
  }
}
