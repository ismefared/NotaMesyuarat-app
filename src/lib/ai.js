/**
 * Penjanaan nota menggunakan LLM on-device (WebLLM via WebGPU).
 * Model dimuat secara dinamik dari CDN hanya apabila pengguna
 * memilih "Jana dengan AI". Jika WebGPU tiada atau gagal, kembalikan null.
 */
import { PROMPTS } from './prompts';

const MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
let engine = null;

async function getEngine(onStatus) {
  if (engine) return engine;
  const webllm = await import(/* @vite-ignore */ 'https://esm.run/@mlc-ai/web-llm');
  onStatus?.('Memuat turun model AI (~600MB, sekali sahaja)…');
  engine = await webllm.CreateMLCEngine(MODEL_ID, {
    initProgressCallback: (p) => onStatus?.(p.text || ''),
  });
  return engine;
}

export async function generateWithAI(transcript, mode, onStatus) {
  try {
    if (!('gpu' in navigator)) {
      onStatus?.('WebGPU tidak disokong pelayar ini.');
      return null;
    }
    const eng = await getEngine(onStatus);
    onStatus?.('Menjana nota…');
    const reply = await eng.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `${PROMPTS[mode] || PROMPTS.minit}\n${transcript.slice(0, 4000)}\n"""`,
        },
      ],
      temperature: 0.3,
      max_tokens: 900,
    });
    return reply.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('WebLLM gagal:', err);
    onStatus?.('AI on-device tidak tersedia, menggunakan kaedah pantas.');
    return null;
  }
}
