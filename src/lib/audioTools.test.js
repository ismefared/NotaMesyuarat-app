import { describe, it, expect } from 'vitest';
import { analyseSamples, enhanceSamples, splitSamples, encodeWav } from './audioTools';

const SR = 16000;

function sine(freq, seconds, amp = 0.5, sr = SR) {
  const n = Math.round(seconds * sr);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = amp * Math.sin((2 * Math.PI * freq * i) / sr);
  return out;
}

describe('encodeWav', () => {
  it('menulis pengepala WAV PCM 16-bit mono yang betul', async () => {
    const samples = sine(440, 0.1, 0.4);
    const blob = encodeWav(samples, SR);
    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBe(44 + samples.length * 2);
    const view = new DataView(await blob.arrayBuffer());
    const tag = (o) => String.fromCharCode(view.getUint8(o), view.getUint8(o + 1), view.getUint8(o + 2), view.getUint8(o + 3));
    expect(tag(0)).toBe('RIFF');
    expect(tag(8)).toBe('WAVE');
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(SR);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(samples.length * 2);
  });
});

describe('splitSamples', () => {
  it('memecah kepada bilangan segmen yang betul', () => {
    const samples = new Float32Array(Math.round(SR * 25)); // 25s
    const parts = splitSamples(samples, SR, 10);
    expect(parts).toHaveLength(3);
    expect(parts[0].length).toBe(SR * 10);
    expect(parts[2].length).toBe(SR * 5);
  });

  it('audio lebih pendek daripada segmen kekal satu bahagian', () => {
    const parts = splitSamples(new Float32Array(SR * 3), SR, 600);
    expect(parts).toHaveLength(1);
  });
});

describe('enhanceSamples', () => {
  it('melemahkan komponen frekuensi rendah (dengung 50 Hz)', () => {
    const hum = sine(50, 0.5, 0.5);
    const out = enhanceSamples(hum, SR);
    const rms = Math.sqrt(out.reduce((a, s) => a + s * s, 0) / out.length);
    expect(rms).toBeLessThan(0.25); // asal ~0.35
  });

  it('mengekalkan suara frekuensi pertuturan', () => {
    const voice = sine(1000, 0.5, 0.2);
    const out = enhanceSamples(voice, SR);
    const rms = Math.sqrt(out.reduce((a, s) => a + s * s, 0) / out.length);
    expect(rms).toBeGreaterThan(0.1);
  });

  it('menormalkan audio terlalu perlahan ke aras sasaran', () => {
    const quiet = sine(1000, 0.5, 0.02);
    const out = enhanceSamples(quiet, SR);
    const peak = out.reduce((m, s) => Math.max(m, Math.abs(s)), 0);
    expect(peak).toBeGreaterThan(0.8);
    expect(peak).toBeLessThanOrEqual(1);
  });
});

describe('analyseSamples', () => {
  it('menilai audio jelas (suara + jeda) sebagai baik', () => {
    // 1s nada pertuturan + 1s senyap — meniru corak suara/jeda sebenar
    const speech = new Float32Array(SR * 2);
    speech.set(sine(300, 1.0, 0.4), 0);
    const q = analyseSamples(speech, SR);
    expect(q.rating).toBe('good');
    expect(q.snr).toBeGreaterThan(15);
  });

  it('mengesan audio senyap sebagai lemah', () => {
    const silence = new Float32Array(SR * 2);
    const q = analyseSamples(silence, SR);
    expect(q.rating).toBe('poor');
    expect(q.silencePct).toBe(100);
  });

  it('mengesan clipping', () => {
    const loud = new Float32Array(SR);
    loud.fill(1);
    const q = analyseSamples(loud, SR);
    expect(q.clipPct).toBeGreaterThan(0.5);
    expect(q.rating).toBe('poor');
  });

  it('memberi tip apabila aras rendah', () => {
    const quiet = sine(300, 1.0, 0.005);
    const q = analyseSamples(quiet, SR);
    expect(q.tips.length).toBeGreaterThan(0);
  });
});
