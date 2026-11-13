import { describe, it, expect } from 'vitest';

// Eksport bergantung pada DOM pelayar (Blob/a.click) — stub minimum
class StubBlob {
  constructor(parts) {
    this.parts = parts;
  }
}
globalThis.Blob = StubBlob;
globalThis.URL = { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} };
const clicked = [];
globalThis.document = {
  createElement: () => ({ click: () => clicked.push(1) }),
};
globalThis.window = {};

import { markdownToHTMLInternal } from './exporters';

describe('markdownToHTML (melalui ejen dalaman)', () => {
  it('menukar pengepala, senarai, dan teks tebal', () => {
    const html = markdownToHTMLInternal(
      '# Tajuk\n\n**teks tebal** dan _condong_\n\n- item satu\n- item dua\n\nPerenggan biasa\n---'
    );
    expect(html).toContain('<h1>Tajuk</h1>');
    expect(html).toContain('<strong>teks tebal</strong>');
    expect(html).toContain('<em>condong</em>');
    expect(html).toContain('<li>item satu</li>');
    expect(html).toContain('<li>item dua</li>');
    expect(html).toContain('<p>Perenggan biasa</p>');
  });

  it('mengekod karakter HTML berbahaya', () => {
    const html = markdownToHTMLInternal('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
