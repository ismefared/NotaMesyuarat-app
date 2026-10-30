/**
 * Integrasi dengan OpenCode Console (Zen) API.
 * Dokumentasi: https://opencode.ai/v2/docs/console/models/
 *
 * - Transkripsi: Gemini Flash multimodal melalui gateway Google
 *   (terima audio inline, pulangkan transkrip).
 * - Penjanaan nota: endpoint OpenAI-compatible dengan model percuma
 *   (glm-5.3-flash-free)atau model berbayar.
 *
 * API key disimpan dalam localStorage pelayar sahaja.
 */

import { PROMPTS, } from './prompts';
import { detailsContext } from './minutes';

const KEY_STORAGE = 'notamesyuarat:opencode-key';
const BASE = 'https://opencode.ai/inference';

export const OPENCODE_MODELS = [
  { id: 'glm-5.3-flash-free', label: 'GLM 5.3 Flash — PERCUMA (disyorkan)' },
  { id: 'deepseek-v4.1-flash-free', label: 'DeepSeek V4.1 Flash — PERCUMA' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite — murah' },
  { id: 'gpt-5.4-nano', label: 'GPT 5.4 Nano — murah' },
];

const TRANSCRIBE_MODEL = 'gemini-3.5-flash-lite';

export function getAPIKey() {
  return localStorage.getItem(KEY_STORAGE) || '';
}

export function setAPIKey(key) {
  if (key) localStorage.setItem(KEY_STORAGE, key);
  else localStorage.removeItem(KEY_STORAGE);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // hasil: data:<mime>;base64,<data>
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Transkripsi audio menggunakan Gemini (multimodal) melalui
 * gateway OpenCode. Jika `diarize`, minta Gemini label pembicara.
 * Kembalikan teks transkrip.
 */
export async function transcribeWithOpenCode(blob, apiKey, { diarize = false, language = 'auto' } = {}) {
  const base64 = await blobToBase64(blob);
  const namaBahasa = {
    ms: 'Bahasa Melayu',
    en: 'English',
    id: 'Bahasa Indonesia',
    zh: 'Mandarin',
    ta: 'Tamil',
  }[language];
  const arahanBahasa = language !== 'auto' && namaBahasa
    ? ` Bahasa pembicara adalah ${namaBahasa} — transkrip sepenuhnya dalam bahasa itu, jangan terjemah.`
    : ' Kekalkan bahasa asal pembicara.';
  const arahan = diarize
    ? 'Transkripkan audio ini dengan tepat.' + arahanBahasa +
      ' Kenal pasti setiap pembicara berbeza dan label ' +
      'setiap selerangan menggunakan format "Pembicara N:" (contoh: "Pembicara 1:", ' +
      '"Pembicara 2:") pada setiap kali pembicara bertukar. Mulakan setiap ' +
      'selangangan pembicara pada baris baharu. Pulangkan transkrip berlabel SAHAJA ' +
      'tanpa sebarang komen atau penjelasan tambahan.'
    : 'Transkripkan audio ini dengan tepat.' + arahanBahasa +
      ' Pulangkan TEKS TRANSKRIP SAHAJA tanpa sebarang komen atau pemformatan tambahan.';

  const res = await fetch(
    `${BASE}/google/v1beta/models/${TRANSCRIBE_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: arahan },
              {
                inline_data: {
                  mime_type: blob.type || 'audio/webm',
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err.error?.message || err.message || msg;
    } catch {
      // kekalkan msg asal
    }
    throw new Error(`OpenCode API: ${msg}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts
    .map((p) => p.text || '')
    .join('')
    .trim();
}

/**
 * Penjanaan nota (minit mesyuarat / skop keperluan) menggunakan
 * model teks melalui endpoint OpenAI-compatible OpenCode.
 */
export async function generateNotesWithOpenCode(transcript, mode, apiKey, modelId, details = null) {
  const konteks = detailsContext(details);
  const res = await fetch(`${BASE}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'user',
          content: `${PROMPTS[mode] || PROMPTS.minit}${konteks}\n${transcript.slice(0, 8000)}\n"""`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err.error?.message || err.message || msg;
    } catch {
      // kekalkan msg asal
    }
    throw new Error(`OpenCode API: ${msg}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}
