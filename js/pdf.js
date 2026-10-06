/* FightEndo – tiny offline PDF writer (A4, Helvetica, optional JPEG signature).
 *   FE.pdf.build(text, opts)            plain document (e.g. chronology)
 *   FE.pdf.buildLetter(letter, text, o) business letter laid out per DIN 5008, Form B
 * No libraries, no network. Supports the Windows-1252 character set (Western European
 * languages); other characters are replaced – for other scripts use "Print / save as PDF".
 * SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';

  const FE = window.FightEndo;
  const MM = 72 / 25.4;                  // points per millimetre
  const PW = 595.28, PH = 841.89;        // A4

  // Helvetica advance widths (1/1000 em) for ASCII 32–126.
  const ASCII_W = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584
  ];
  const EXTRA_W = {
    'ß': 611, 'Æ': 1000, 'æ': 889, 'Ø': 778, 'ø': 611, 'Œ': 1000, 'œ': 944, '«': 556, '»': 556,
    '°': 400, '§': 556, '€': 556, '„': 333, '“': 333, '”': 333, '‚': 222, '‘': 222, '’': 222,
    '•': 350, '–': 556, '—': 1000, '…': 1000, '×': 584, '©': 737, '®': 737, '¿': 611, '¡': 333, '·': 278
  };
  const BOLD = 1.08;  // Helvetica-Bold is ~8 % wider; enough for line breaking
  const WIN = { '€': 0x80, '‚': 0x82, '„': 0x84, '…': 0x85, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, 'Œ': 0x8C, 'œ': 0x9C, 'Š': 0x8A, 'š': 0x9A, 'Ž': 0x8E, 'ž': 0x9E, 'Ÿ': 0x9F };
  const SKIP = '\u0000skip';
  const SUBST = { '≥': '>=', '≤': '<=', '→': '->', '←': '<-', '≠': '!=', ' ': ' ', ' ': ' ', ' ': ' ', '\t': '    ', '✓': 'x', '✔': 'x' };

  function clean(text) {
    return String(text).replace(/\r\n?/g, '\n').replace(/[≥≤→←≠   \t✓✔]/g, (c) => SUBST[c]);
  }

  function code(ch) {
    const c = ch.charCodeAt(0);
    if (c < 128) return c;
    if (WIN[ch]) return WIN[ch];
    if (c >= 0xA0 && c <= 0xFF) return c;
    const base = ch.normalize('NFD')[0];            // e.g. ł → l, ő → o
    return base && base.charCodeAt(0) < 128 ? base.charCodeAt(0) : 63; // '?'
  }

  function charWidth(ch) {
    const c = ch.charCodeAt(0);
    if (c >= 32 && c <= 126) return ASCII_W[c - 32];
    if (EXTRA_W[ch]) return EXTRA_W[ch];
    const base = ch.normalize('NFD')[0];
    const b = base ? base.charCodeAt(0) : 0;
    return b >= 32 && b <= 126 ? ASCII_W[b - 32] : 556;
  }

  function textWidth(s, size, bold) {
    let w = 0;
    for (const ch of s) w += charWidth(ch);
    return (w * size * (bold ? BOLD : 1)) / 1000;
  }

  // PDF string literal, ASCII-only (octal escapes for everything above 0x7E).
  function pdfString(s) {
    let out = '(';
    for (const ch of s) {
      const c = code(ch);
      if (c === 40 || c === 41 || c === 92) out += '\\' + String.fromCharCode(c);
      else if (c < 32 || c > 126) out += '\\' + c.toString(8).padStart(3, '0');
      else out += String.fromCharCode(c);
    }
    return out + ')';
  }

  // Word-wrap one line; list items ("  – foo", "1) foo") get a hanging indent.
  function wrap(line, size, maxW, bold) {
    if (!line.trim()) return [''];
    const m = /^(\s*(?:[–•-]|\d+\)|\d+\.|\[\d+\])\s+)/.exec(line);
    const indent = m ? ' '.repeat(Math.round(textWidth(m[1], size) / textWidth(' ', size))) : '';
    const words = line.split(/(\s+)/);
    const out = [];
    let cur = '';
    for (const w of words) {
      const next = cur + w;
      if (cur && textWidth(next.replace(/\s+$/, ''), size, bold) > maxW) {
        out.push(cur.replace(/\s+$/, ''));
        cur = indent + w.replace(/^\s+/, '');
      } else {
        cur = next;
      }
      // Hard-break words longer than a full line (e.g. URLs) – linear, one pass per line.
      while (textWidth(cur.replace(/\s+$/, ''), size, bold) > maxW) {
        const chars = Array.from(cur);
        const k = (size * (bold ? BOLD : 1)) / 1000;
        let w = 0, i = 0;
        for (; i < chars.length; i++) { w += charWidth(chars[i]) * k; if (w > maxW) break; }
        i = Math.max(1, i);
        out.push(chars.slice(0, i).join(''));
        cur = indent + chars.slice(i).join('');
      }
    }
    if (cur.trim()) out.push(cur.replace(/\s+$/, ''));
    return out.length ? out : [''];
  }

  function dataUrlToBytes(url) {
    const bin = atob(url.split(',')[1] || '');
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  /* ---------- page model ---------- */
  function Doc() { this.pages = [[]]; }
  Doc.prototype.page = function () { return this.pages[this.pages.length - 1]; };
  Doc.prototype.newPage = function () { this.pages.push([]); };
  Doc.prototype.text = function (x, y, s, size, bold, gray) {
    if (!s) return;
    this.page().push((gray != null ? gray + ' g ' : '') + 'BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' Td ' + pdfString(s) + ' Tj ET' + (gray != null ? ' 0 g' : ''));
  };
  Doc.prototype.line = function (x1, y1, x2, y2, width, gray) {
    this.page().push('q ' + (gray != null ? gray + ' G ' : '') + width + ' w ' + x1.toFixed(2) + ' ' + y1.toFixed(2) + ' m ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + ' l S Q');
  };
  Doc.prototype.image = function (x, y, w, h) {
    this.page().push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + y.toFixed(2) + ' cm /Im1 Do Q');
  };

  /* Flows `lines` from y downwards, starting new pages as needed. Handles the signature
   * after the closing phrase and a bold first paragraph (the subject). */
  function flow(doc, lines, y, o) {
    const size = o.size, lead = o.lead, L = o.left, maxW = PW - o.left - o.right;
    const sig = o.signature && o.signature.dataUrl ? o.signature : null;
    let anchorIdx = -1;
    if (sig && o.anchor) lines.forEach((l, i) => { if (l.trim() === o.anchor) anchorIdx = i; });
    let boldUntil = o.boldFirstParagraph ? lines.findIndex((l) => !l.trim()) : -1;
    if (o.boldFirstParagraph && boldUntil < 0) boldUntil = lines.length;
    let placed = false;
    // The closing line is never separated from the signature and the name below it.
    let closingIdx = -1;
    if (o.anchor) lines.forEach((l, i) => { if (l.trim() === o.anchor) closingIdx = i; });
    const sigH = sig ? 42 * (sig.scale || 1) : 0;
    lines.forEach((raw, idx) => {
      if (raw === SKIP) return;
      if (idx === closingIdx && y - (sig ? lead * 2 + sigH : lead * 4) < o.bottom) { doc.newPage(); y = o.nextTop; }
      const bold = idx < boldUntil;
      wrap(raw, size, maxW, bold).forEach((ln) => {
        if (y < o.bottom) { doc.newPage(); y = o.nextTop; }
        doc.text(L, y, ln, size, bold);
        y -= lead;
      });
      if (idx === anchorIdx && !placed) {
        const scale = sig.scale || 1;
        const h = 42 * scale, w = Math.min(190 * scale, h * sig.width / sig.height);
        if (y - h < o.bottom) { doc.newPage(); y = o.nextTop; }
        const top = y + lead * 0.55 + (sig.dy || 0) * MM;
        doc.image(L + (sig.dx || 0) * MM, top - h, w, h);
        y = Math.min(y, top - h - lead * 0.2);
        placed = true;
        let j = idx + 1;
        while (j < lines.length && !lines[j].trim()) { lines[j] = SKIP; j++; }
      }
    });
    return y;
  }

  function pageNumbers(doc, o, label) {
    const n = doc.pages.length;
    if (n < 2) return;
    doc.pages.forEach((ops, i) => {
      const s = (label || 'Seite {i} von {n}').replace('{i}', i + 1).replace('{n}', n);
      ops.push('BT /F1 9 Tf ' + (PW - o.right - textWidth(s, 9)).toFixed(2) + ' ' + (12 * MM).toFixed(2) + ' Td ' + pdfString(s) + ' Tj ET');
    });
  }

  /* ---------- serialisation ---------- */
  function serialize(doc, opts) {
    const sig = opts.signature && opts.signature.dataUrl ? opts.signature : null;
    const parts = [];
    const offsets = [];
    let length = 0;
    const push = (p) => { parts.push(p); length += typeof p === 'string' ? p.length : p.byteLength; };
    const objStart = (n) => { offsets[n] = length; push(n + ' 0 obj\n'); };
    const n = doc.pages.length;
    const F1 = 3, F2 = 4, IMG = sig ? 5 : 0, INFO = sig ? 6 : 5, first = INFO + 1;
    const pageObjs = doc.pages.map((_, i) => first + i * 2);

    push('%PDF-1.4\n');
    objStart(1); push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    objStart(2); push('<< /Type /Pages /Count ' + n + ' /Kids [' + pageObjs.map((k) => k + ' 0 R').join(' ') + '] >>\nendobj\n');
    objStart(F1); push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');
    objStart(F2); push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');
    if (sig) {
      const bytes = dataUrlToBytes(sig.dataUrl);
      objStart(IMG);
      push('<< /Type /XObject /Subtype /Image /Width ' + sig.width + ' /Height ' + sig.height + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + bytes.byteLength + ' >>\nstream\n');
      push(bytes);
      push('\nendstream\nendobj\n');
    }
    objStart(INFO); push('<< /Title ' + pdfString(opts.title || 'FightEndo') + ' /Producer (FightEndo) >>\nendobj\n');
    doc.pages.forEach((ops, i) => {
      const content = ops.join('\n');
      const pn = pageObjs[i];
      objStart(pn);
      push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /Font << /F1 ' + F1 + ' 0 R /F2 ' + F2 + ' 0 R >>' +
        (sig ? ' /XObject << /Im1 ' + IMG + ' 0 R >>' : '') + ' >> /Contents ' + (pn + 1) + ' 0 R >>\nendobj\n');
      objStart(pn + 1);
      push('<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream\nendobj\n');
    });
    const total = first + n * 2;
    const xref = length;
    let x = 'xref\n0 ' + total + '\n0000000000 65535 f \n';
    for (let k = 1; k < total; k++) x += String(offsets[k]).padStart(10, '0') + ' 00000 n \n';
    push(x);
    push('trailer\n<< /Size ' + total + ' /Root 1 0 R /Info ' + INFO + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');

    const out = new Uint8Array(length);
    let pos = 0;
    for (const p of parts) {
      if (typeof p === 'string') { for (let k = 0; k < p.length; k++) out[pos++] = p.charCodeAt(k); }
      else { out.set(p, pos); pos += p.byteLength; }
    }
    return out;
  }

  /* ---------- public: plain document ---------- */
  function build(text, opts) {
    opts = opts || {};
    const doc = new Doc();
    const o = { size: 11, lead: 15.4, left: 25 * MM, right: 20 * MM, bottom: 22 * MM, nextTop: PH - 22 * MM,
      signature: opts.signature, anchor: opts.anchor, boldFirstParagraph: !!opts.boldTitle };
    flow(doc, clean(text).split('\n'), PH - 22 * MM, o);
    pageNumbers(doc, o, opts.pageLabel);
    return serialize(doc, opts);
  }

  /* ---------- public: DIN 5008 letter (Form B) ----------
   * letter: { sender:[…], recipient:[…], info:[[label, value]…] }
   * text:   subject (first paragraph, bold) + body, as edited by the user. */
  function buildLetter(letter, text, opts) {
    opts = opts || {};
    const doc = new Doc();
    const top = (mm) => PH - mm * MM;       // DIN positions are measured from the top edge
    const L = 25 * MM, INFO_X = 125 * MM;

    // Fold marks (105 mm, 210 mm) and punch mark (148.5 mm), Form B.
    doc.line(3 * MM, top(105), 8 * MM, top(105), 0.4, 0.55);
    doc.line(3 * MM, top(210), 8 * MM, top(210), 0.4, 0.55);
    doc.line(3 * MM, top(148.5), 10 * MM, top(148.5), 0.4, 0.55);

    // Letterhead: sender, right-aligned block in the head zone (0–45 mm).
    const sender = (letter.sender || []).filter(Boolean);
    sender.forEach((s, i) => doc.text(INFO_X, top(22 + i * 4.6), s, i === 0 ? 11 : 9.5, i === 0));

    // Return address line (Rücksendeangabe) at the bottom of the 17.7 mm Zusatz- und Vermerkzone.
    const ret = sender.join(' · ');
    const retSize = Math.min(7, 7 * (80 * MM) / Math.max(textWidth(ret, 7), 1));
    doc.text(L, top(59.5), ret, retSize.toFixed(2) * 1, false, 0.3);
    doc.line(L, top(60.5), L + Math.min(textWidth(ret, retSize), 80 * MM), top(60.5), 0.3, 0.6);

    // Recipient in the Anschriftzone (from 62.7 mm, max. 6 lines of 4.23 mm).
    (letter.recipient || []).slice(0, 6).forEach((s, i) => doc.text(L, top(67 + i * 4.8), s, 11));

    // Information block, right of the address field (from 50 mm).
    (letter.info || []).forEach((row, i) => {
      doc.text(INFO_X, top(52 + i * 8.2), row[0], 7.5, false, 0.35);
      doc.text(INFO_X, top(55.6 + i * 8.2), row[1], 10);
    });

    // Subject (bold) two lines below the address field (field ends at 90 mm), then the body.
    const o = { size: 11, lead: 15.4, left: L, right: 20 * MM, bottom: 24 * MM, nextTop: top(20),
      signature: opts.signature, anchor: opts.anchor, boldFirstParagraph: true };
    flow(doc, clean(text).replace(/^\s+/, '').split('\n'), top(101), o);
    pageNumbers(doc, o, opts.pageLabel);
    return serialize(doc, opts);
  }

  FE.pdf = { build: build, buildLetter: buildLetter, textWidth: textWidth };
})();
