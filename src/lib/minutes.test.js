import { describe, it, expect } from 'vitest';
import { generateMinutes, transcriptToMarkdown, detailsContext } from './minutes';

const transkrip = [
  'Terima kasih semua hadir. Mesyuarat ini untuk membincangkan sistem e-Perolehan baharu.',
  'Keputusan: pihak jabatan bersetuju melaksanakan modul e-Perolehan fasa satu tahun ini.',
  'Encik Ali akan sedikan draf keperluan sebelum hujung bulan.',
  'Puan Siti perlu hantar permohonan bajet kepada unit kewangan minggu depan.',
].join(' ');

describe('generateMinutes (mod minit)', () => {
  it('menghasilkan pengepala dan seksyen piawai', () => {
    const out = generateMinutes(transkrip, Date.now(), 'minit', null);
    expect(out).toContain('# Minit Mesyuarat');
    expect(out).toContain('## Rumasan');
    expect(out).toContain('## Keputusan');
    expect(out).toContain('## Tindakan');
  });

  it('menyertakan butiran mesyuarat yang diisi sahaja', () => {
    const out = generateMinutes(transkrip, Date.now(), 'minit', {
      tarikh: '2026-11-13',
      masa: '10:00',
      lokasi: 'Bilik A',
      organisasi: '',
      ahli: '',
    });
    expect(out).toContain('Bilik A');
    expect(out).not.toContain('**Organisasi:**');
  });

  it('transkrip pendek tetap menghasilkan nota tanpa crash', () => {
    const out = generateMinutes('terlalu pendek', Date.now(), 'minit', null);
    expect(out).toContain('# Minit Mesyuarat');
  });
});

describe('generateMinutes (mod skop)', () => {
  it('menghasilkan draf skop keperluan', () => {
    const out = generateMinutes(transkrip, Date.now(), 'skop', null);
    expect(out).toContain('# Draf Skop Keperluan');
    expect(out).toContain('## Objektif');
  });
});

describe('transcriptToMarkdown', () => {
  it('membungkus transkrip dengan pengepala tarikh', () => {
    const out = transcriptToMarkdown('kandungan uji', 1760000000000);
    expect(out).toContain('# Transkrip Mesyuarat');
    expect(out).toContain('**Tarikh:**');
    expect(out).toContain('kandungan uji');
  });
});

describe('detailsContext', () => {
  it('pulangkan rentak kosong bila tiada butiran', () => {
    expect(detailsContext(null)).toBe('');
    expect(detailsContext({})).toBe('');
  });

  it('menyertakan medan yang diisi sahaja', () => {
    const out = detailsContext({ lokasi: 'Zoom', tarikh: '2026-11-13' });
    expect(out).toContain('Lokasi: Zoom');
    expect(out).not.toContain('Masa');
  });
});
