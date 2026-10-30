/**
 * Penjanaan nota secara pantas — kaedah extractive berdasarkan
 * kekerapan perkataan dan kata kunci. Berfungsi sepenuhnya offline,
 * tanpa muat turun model LLM.
 */

const STOPWORDS = new Set(
  `yang dan di ke dari untuk pada dengan adalah ini itu dalam tidak akan
   juga oleh kepada sebagai serta atau jika kita kami saya anda mereka
   ada ialah supaya kerana sudah belum sangat lebih hanya lagi nak tak
   ia nya beliau kali macam macam lah kah pon pun saja hanya mungkin
   boleh nanti sekarang kemudian selepas sebelum ketika bila mana apa
   siapa kenapa bagaimana Okay okay ye ya tak eh ha`
    .split(/\s+/)
    .filter(Boolean)
);

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length > 2);
}

function words(text) {
  return text
    .toLowerCase()
    .split(/[^a-zà-ÿ0-9]+/i)
    .filter(Boolean);
}

function scoreSentences(sentences) {
  const freq = new Map();
  for (const s of sentences) {
    for (const w of words(s)) {
      if (!STOPWORDS.has(w)) freq.set(w, (freq.get(w) || 0) + 1);
    }
  }
  return sentences.map((s, index) => {
    const ws = words(s).filter((w) => !STOPWORDS.has(w));
    const score = ws.reduce((sum, w) => sum + (freq.get(w) || 0), 0) / Math.sqrt(ws.length || 1);
    return { index, text: s, score };
  });
}

function topSentences(sentences, count) {
  return scoreSentences(sentences)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.text);
}

function findByKeywords(sentences, keywords) {
  const lower = keywords.map((k) => k.toLowerCase());
  return sentences.filter((s) => {
    const w = words(s);
    return lower.some((k) => k.includes(' ') ? s.toLowerCase().includes(k) : w.includes(k));
  });
}

const DECISION_WORDS = ['keputusan', 'setuju', 'bersetuju', 'diputuskan', 'disepakati', 'agreed'];
const ACTION_WORDS = ['akan', 'perlu', 'tugas', 'siapkan', 'sediakan', 'hantar', 'kemaskini', 'kemas kini', 'pastikan', 'follow up', 'susul'];
const REQUIREMENT_WORDS = ['perlukan', 'perlu ada', 'ciri', 'fungsi', 'skop', 'keperluan', 'sistem', 'modul', 'laporan', 'integrasi', 'pengguna', 'autentikasi', 'dashboard'];

/**
 * Bina blok pengepala daripada butiran mesyuarat (semua pilihan).
 * Medan yang diisi sahaja dipaparkan; tarikh lalai guna masa semasa.
 */
function detailsHeader(details, fallbackTarikh) {
  if (!details) return `**Tarikh:** ${fallbackTarikh}`;
  const lines = [];
  const tarikh = details.tarikh
    ? new Date(`${details.tarikh}T${details.masa || '00:00'}`).toLocaleDateString('ms-MY', { dateStyle: 'full' })
    : fallbackTarikh;
  lines.push(`**Tarikh:** ${tarikh}`);
  if (details.masa && details.tarikh) {
    const masa = new Date(`${details.tarikh}T${details.masa}`).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
    lines.push(`**Masa:** ${masa}`);
  }
  if (details.lokasi) lines.push(`**Lokasi:** ${details.lokasi}`);
  if (details.organisasi) lines.push(`**Organisasi:** ${details.organisasi}`);
  if (details.ahli) {
    const ahli = details.ahli
      .split(/[\n,;]+/)
      .map((a) => a.trim())
      .filter(Boolean);
    if (ahli.length) lines.push(`**Ahli Mesyuarat:** ${ahli.join(', ')}`);
  }
  return lines.join('\n');
}

/**
 * Konteks butiran untuk prompt AI — hanya medan yang diisi.
 */
export function detailsContext(details) {
  if (!details) return '';
  const parts = [];
  if (details.tarikh) parts.push(`Tarikh: ${details.tarikh}`);
  if (details.masa) parts.push(`Masa: ${details.masa}`);
  if (details.lokasi) parts.push(`Lokasi: ${details.lokasi}`);
  if (details.organisasi) parts.push(`Organisasi: ${details.organisasi}`);
  if (details.ahli) parts.push(`Ahli mesyuarat: ${details.ahli}`);
  return parts.length ? `\nButiran mesyuarat:\n${parts.join('\n')}\n` : '';
}

function formatMinutes(transcript, createdAt, details) {
  const sentences = splitSentences(transcript);
  const summary = topSentences(sentences, 5);
  const decisions = findByKeywords(sentences, DECISION_WORDS).slice(0, 5);
  const actions = findByKeywords(sentences, ACTION_WORDS)
    .filter((s) => !decisions.includes(s))
    .slice(0, 7);

  const tarikh = new Date(createdAt).toLocaleString('ms-MY', { dateStyle: 'full', timeStyle: 'short' });
  const bullets = (arr, emptyMsg) =>
    arr.length ? arr.map((s) => `- ${s}`).join('\n') : `- _${emptyMsg}_`;

  return `# Minit Mesyuarat

${detailsHeader(details, tarikh)}
**Kaedah:** Dijana secara automatik (kaedah pantas, on-device)

## Rumasan
${bullets(summary, 'Transkrip terlalu pendek untuk dirumuskan.')}

## Keputusan
${bullets(decisions, 'Tiada keputusan dikesan.')}

## Tindakan (Action Items)
${bullets(actions, 'Tiada item tindakan dikesan.')}

---

> Nota: Nota ini dijana secara automatik. Sila semak dan edit sebelum diedarkan.`;
}

function formatRequirements(transcript, createdAt, details) {
  const sentences = splitSentences(transcript);
  const objectives = topSentences(sentences, 3);
  const features = findByKeywords(sentences, REQUIREMENT_WORDS).slice(0, 10);
  const others = topSentences(
    sentences.filter((s) => !features.includes(s) && !objectives.includes(s)),
    3
  );

  const tarikh = new Date(createdAt).toLocaleString('ms-MY', { dateStyle: 'full', timeStyle: 'short' });
  const bullets = (arr, emptyMsg) =>
    arr.length ? arr.map((s) => `- ${s}`).join('\n') : `- _${emptyMsg}_`;

  return `# Draf Skop Keperluan

${detailsHeader(details, tarikh)}
**Sumber:** Transkrip mesyuarat (dijana secara automatik)

## Objektif
${bullets(objectives, 'Tiada objektif dikesan.')}

## Fungsi & Ciri Dicadangkan
${bullets(features, 'Tiada keperluan spesifik dikesan.')}

## Nota & Andaian Lain
${bullets(others, 'Tiada nota tambahan.')}

---

> Nota: Draf ini perlu disemak dan disahkan bersama pihak berkepentingan.`;
}

export function generateMinutes(transcript, createdAt, mode = 'minit', details = null) {
  return mode === 'skop'
    ? formatRequirements(transcript, createdAt, details)
    : formatMinutes(transcript, createdAt, details);
}

export function transcriptToMarkdown(transcript, createdAt) {
  const tarikh = new Date(createdAt).toLocaleString('ms-MY', { dateStyle: 'full', timeStyle: 'short' });
  return `# Transkrip Mesyuarat\n\n**Tarikh:** ${tarikh}\n\n${transcript}\n`;
}
