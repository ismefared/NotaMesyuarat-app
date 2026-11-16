/**
 * Alat pemprosesan audio untuk transkripsi on-device.
 *
 * - decodeMono(): nyahkod audio kepada PCM mono 16 kHz (jimat memori)
 * - analyseSamples(): nilai kualiti audio (SNR anggaran, aras, senyap, clipping)
 * - enhanceSamples(): tapisan high-pass 100 Hz + normalisasi aras
 * - splitSamples(): pecah PCM kepada segmen panjang tetap
 * - encodeWav(): bungkus PCM Float32 kepada WAV 16-bit
 *
 * Semua fungsi tulen (kecuali decodeMono) boleh diuji tanpa DOM.
 */

const TARGET_SAMPLE_RATE = 16000;

/** Nyahkod blob audio kepada PCM mono. Guna 16 kHz untuk jimat memori. */
export async function decodeMono(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const Ctx = window.AudioContext || window.webkitAudioContext;
  let ctx;
  try {
    ctx = new Ctx({ sampleRate: TARGET_SAMPLE_RATE });
  } catch {
    ctx = new Ctx();
  }
  try {
    const audio = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const channels = audio.numberOfChannels;
    const length = audio.length;
    const mono = new Float32Array(length);
    for (let c = 0; c < channels; c++) {
      const data = audio.getChannelData(c);
      const gain = 1 / channels;
      for (let i = 0; i < length; i++) mono[i] += data[i] * gain;
    }
    return { samples: mono, sampleRate: audio.sampleRate, duration: audio.duration };
  } finally {
    if (ctx.state !== 'closed') await ctx.close().catch(() => {});
  }
}

/**
 * Nilai kualiti audio.
 * SNR anggaran = aras bingkai persentil-90 (suara) - persentil-10 (bunyi latar).
 * rating: 'good' | 'fair' | 'poor'
 */
export function analyseSamples(samples, sampleRate) {
  const frameLen = Math.max(1, Math.round(sampleRate * 0.1)); // 100 ms
  const frameCount = Math.floor(samples.length / frameLen);
  if (!frameCount) {
    return {
      rating: 'unknown', snr: 0, rmsDb: -80, peakDb: -80,
      silencePct: 100, clipPct: 0,
      tips: ['Audio terlalu pendek untuk dinilai.'],
    };
  }

  const frameDb = new Array(frameCount);
  let peak = 0;
  let clipped = 0;
  let sumSq = 0;

  for (let f = 0; f < frameCount; f++) {
    let sum = 0;
    const start = f * frameLen;
    for (let i = 0; i < frameLen; i++) {
      const s = samples[start + i];
      const a = Math.abs(s);
      if (a > peak) peak = a;
      if (a >= 0.999) clipped++;
      sum += s * s;
    }
    sumSq += sum;
    const rms = Math.sqrt(sum / frameLen);
    frameDb[f] = 20 * Math.log10(rms || 1e-8);
  }

  const sorted = [...frameDb].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const noiseFloor = pct(0.1);
  const speechLevel = pct(0.9);
  const snr = Math.round((speechLevel - noiseFloor) * 10) / 10;
  const rmsDb = Math.round(20 * Math.log10(Math.sqrt(sumSq / (frameCount * frameLen)) || 1e-8) * 10) / 10;
  const peakDb = Math.round(20 * Math.log10(peak || 1e-8) * 10) / 10;
  const silencePct = Math.round((sorted.filter((v) => v < -45).length / sorted.length) * 100);
  const clipPct = Math.round((clipped / samples.length) * 10000) / 100;

  const tips = [];
  let rating = 'good';
  if (snr < 8 || rmsDb < -35 || clipPct > 0.5 || silencePct > 85) rating = 'poor';
  else if (snr < 15 || rmsDb < -28 || silencePct > 60) rating = 'fair';

  if (rmsDb < -30) tips.push('Volume rendah — dekatkan mikrofon atau aktifkan "Tingkatkan audio".');
  if (snr < 12) tips.push('Bunyi latar tinggi berbanding suara — cuba mikrofon lebih dekat atau model Small.');
  if (clipPct > 0.1) tips.push('Audio terpotong (clipping) — kurangkan gain semasa merakam.');
  if (silencePct > 60) tips.push('Banyak bahagian senyap — pastikan mikrofon menangkap suara.');
  if (!tips.length) tips.push('Kualiti audio baik untuk transkripsi.');

  return { rating, snr, rmsDb, peakDb, silencePct, clipPct, tips };
}

/**
 * Tingkatkan audio: tapisan high-pass 100 Hz (buang dengung/rumble) dan
 * normalisasi aras bila terlalu perlahan/kuat. Tidak mengubah kandungan suara.
 */
export function enhanceSamples(samples, sampleRate) {
  const out = new Float32Array(samples.length);
  const freq = 100;
  const w0 = (2 * Math.PI * freq) / sampleRate;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const q = 0.707;
  const alpha = sin / (2 * q);
  const b0 = (1 + cos) / 2;
  const b1 = -(1 + cos);
  const b2 = (1 + cos) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cos;
  const a2 = 1 - alpha;

  // Puncak input digunakan untuk keputusan normalisasi — bukan puncak selepas
  // tapisan (menguatkan dengung yang telah dilemahkan ialah tingkah laku salah).
  let inputPeak = 0;
  for (let i = 0; i < samples.length; i++) {
    const a = Math.abs(samples[i]);
    if (a > inputPeak) inputPeak = a;
  }

  let x1 = 0; let x2 = 0; let y1 = 0; let y2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const x = samples[i];
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    out[i] = y;
    x2 = x1; x1 = x;
    y2 = y1; y1 = y;
  }

  if (inputPeak > 1e-4) {
    const target = 0.89; // ~ -1 dBFS
    const gain = target / inputPeak;
    // Hanya ubah aras jika terlalu perlahan (<0.3) atau hampir clipping (>0.95)
    if (inputPeak < 0.3 || inputPeak > 0.95) {
      for (let i = 0; i < out.length; i++) out[i] *= gain;
    }
  }
  return out;
}

/** Pecah PCM kepada segmen (subarray — tiada salinan tambahan). */
export function splitSamples(samples, sampleRate, segmentSeconds = 600) {
  const segLen = Math.max(1, Math.round(sampleRate * segmentSeconds));
  const parts = [];
  for (let start = 0; start < samples.length; start += segLen) {
    parts.push(samples.subarray(start, Math.min(start + segLen, samples.length)));
  }
  return parts;
}

/** Bungkus PCM Float32 mono kepada WAV 16-bit. */
export function encodeWav(samples, sampleRate) {
  const bytes = samples.length * 2;
  const buffer = new ArrayBuffer(44 + bytes);
  const view = new DataView(buffer);
  const writeString = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + bytes, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, bytes, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}
