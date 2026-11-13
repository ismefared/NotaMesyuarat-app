/**
 * Eksport nota ke PDF dan Word (.doc).
 * PDF: jsPDF dengan penghuraian Markdown ringkas (tajuk, senarai, tebal).
 * Word: HTML dalam balutan .doc — dibuka dengan lancar dalam MS Word.
 */
import { jsPDF } from 'jspdf';

function escapeHTML(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(md) {
  return escapeHTML(md)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>');
}

// Dijana untuk ujian unit (exporters.test.js) — tidak dimaksudkan untuk import pengguna
export const markdownToHTMLInternal = markdownToHTML;

function markdownToHTML(markdown) {
  const lines = markdown.split('\n');
  let html = '';
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${inline(bullet[1])}</li>`;
      continue;
    }
    if (inList) {
      html += '</ul>';
      inList = false;
    }
    if (!line || line === '---') continue;
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      html += `<h${level}>${inline(h[2])}</h${level}>`;
    } else {
      html += `<p>${inline(line)}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
}

/** Eksport nota sebagai .doc (dibuka dalam MS Word / Google Docs) */
export function exportWord(markdown, filename) {
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${escapeHTML(filename)}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1a1a1a; }
  h1 { font-size: 16pt; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 4pt; }
  h2 { font-size: 13pt; color: #0369a1; margin-top: 14pt; }
  ul { margin-top: 4pt; }
  li { margin-bottom: 3pt; }
</style></head>
<body>${markdownToHTML(markdown)}</body></html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  triggerDownload(blob, `${filename}.doc`);
}

/** Eksport nota sebagai PDF menggunakan jsPDF */
export function exportPDF(markdown, filename) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (needed) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeText = (text, { size = 11, bold = false, gap = 6, indent = 0 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxW - indent);
    for (const l of lines) {
      ensureSpace(size + 4);
      doc.text(l, margin + indent, y + size);
      y += size + 4;
    }
    y += gap;
  };

  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line === '---') continue;

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      ensureSpace(16);
      doc.setFillColor(2, 132, 199);
      doc.circle(margin + 3, y + 7, 1.6, 'F');
      writeText(bullet[1].replace(/\*\*(.+?)\*\*/g, '$1').replace(/[_*](.+?)[_*]/g, '$1'), { size: 10.5, gap: 3, indent: 14 });
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const sizes = { 1: 18, 2: 14, 3: 12, 4: 11 };
      writeText(h[2].replace(/\*\*(.+?)\*\*/g, '$1'), { size: sizes[level], bold: true, gap: level <= 2 ? 8 : 5 });
      if (level === 1) {
        ensureSpace(2);
        doc.setDrawColor(2, 132, 199);
        doc.setLineWidth(1.2);
        doc.line(margin, y, margin + maxW, y);
        y += 10;
      }
      continue;
    }

    writeText(line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/[_*](.+?)[_*]/g, '$1'), { size: 10.5, gap: 6 });
  }

  doc.save(`${filename}.pdf`);
}

function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
