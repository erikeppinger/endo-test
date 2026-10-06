/* FightEndo – signature: draw it, or take it from a photo (rotate, crop, clean up),
 * then place it interactively. Everything happens on the device (canvas only).
 * Result: { dataUrl (JPEG), width, height, scale, dx, dy } – dx/dy in millimetres.
 * SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';

  const FE = window.FightEndo;
  const esc = FE.esc;
  const PREVIEW_MM = 150;   // width of letter area shown in the placement preview
  const SIG_MM = 14.8;      // default signature height in the PDF (42 pt)

  function mount(root, api) {
    // api: { t, get(): signature|null, set(sig|null), closing, name }
    const t = api.t;
    let mode = 'draw';
    let photo = null;          // { img, rot }
    let crop = null;           // { x, y, w, h } in canvas px of the photo editor

    root.innerHTML =
      '<div class="sig-tabs" role="tablist">' +
      '<button class="btn small" data-sig="draw" role="tab">' + esc(t('sig.draw')) + '</button>' +
      '<button class="btn small" data-sig="photo" role="tab">' + esc(t('sig.photo')) + '</button></div>' +
      '<div data-pane="draw"><p class="muted">' + esc(t('letter.signatureHint')) + '</p>' +
      '<canvas id="sig-pad" class="sig-pad" width="600" height="200" aria-label="' + esc(t('letter.signature')) + '"></canvas></div>' +
      '<div data-pane="photo" hidden><p class="muted">' + esc(t('sig.photoHint')) + '</p>' +
      '<label class="btn small file-btn">' + esc(t('sig.choose')) + '<input type="file" accept="image/*" id="sig-file" hidden></label>' +
      '<div class="sig-editor" hidden><canvas id="sig-photo" class="sig-photo"></canvas>' +
      '<p class="muted">' + esc(t('sig.cropHint')) + '</p>' +
      '<div class="actions"><button class="btn small" data-sig-act="rotate">↻ ' + esc(t('sig.rotate')) + '</button>' +
      '<label class="check"><input type="checkbox" id="sig-clean" checked><span>' + esc(t('sig.clean')) + '</span></label>' +
      '<button class="btn small primary" data-sig-act="apply">' + esc(t('sig.apply')) + '</button></div></div></div>' +
      '<div class="sig-place" hidden><h3>' + esc(t('sig.place')) + '</h3>' +
      '<div class="sig-preview" id="sig-preview"><div class="pv-closing"></div><img alt="" class="pv-img"><div class="pv-name"></div></div>' +
      '<div class="grid">' +
      '<div class="field"><label for="sig-scale">' + esc(t('sig.size')) + '</label><input type="range" id="sig-scale" min="0.5" max="1.8" step="0.05"></div>' +
      '<div class="field"><label for="sig-dx">' + esc(t('sig.x')) + '</label><input type="range" id="sig-dx" min="-5" max="80" step="1"></div>' +
      '<div class="field"><label for="sig-dy">' + esc(t('sig.y')) + '</label><input type="range" id="sig-dy" min="-8" max="8" step="0.5"></div></div></div>' +
      '<div class="actions"><button class="btn ghost small" data-sig-act="clear">' + esc(t('letter.signatureClear')) + '</button></div>';

    const $ = (s) => root.querySelector(s);
    const pad = $('#sig-pad');
    const pctx = pad.getContext('2d');

    /* ---- tabs ---- */
    function setMode(m) {
      mode = m;
      root.querySelectorAll('[data-sig]').forEach((b) => b.classList.toggle('primary', b.dataset.sig === m));
      root.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== m; });
    }
    root.querySelectorAll('[data-sig]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); setMode(b.dataset.sig); }));
    setMode('draw');

    /* ---- draw ---- */
    function clearPad() { pctx.fillStyle = '#fff'; pctx.fillRect(0, 0, pad.width, pad.height); }
    clearPad();
    const cur = api.get();
    if (cur && cur.dataUrl && cur.source !== 'photo') {
      const img = new Image();
      img.onload = () => pctx.drawImage(img, 0, 0, pad.width, pad.height);
      img.src = cur.dataUrl;
    }
    let drawing = false, dirty = false;
    const pos = (c, e) => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; };
    pad.addEventListener('pointerdown', (e) => {
      drawing = true; dirty = true;
      try { pad.setPointerCapture(e.pointerId); } catch (err) { /* synthetic */ }
      const [x, y] = pos(pad, e);
      pctx.strokeStyle = '#10204a'; pctx.lineWidth = 3.2; pctx.lineCap = 'round'; pctx.lineJoin = 'round';
      pctx.beginPath(); pctx.moveTo(x, y); e.preventDefault();
    });
    pad.addEventListener('pointermove', (e) => { if (!drawing) return; const [x, y] = pos(pad, e); pctx.lineTo(x, y); pctx.stroke(); e.preventDefault(); });
    const endDraw = () => {
      if (!drawing) return;
      drawing = false;
      if (dirty) save(trimToInk(pad), 'draw');
    };
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => pad.addEventListener(ev, endDraw));

    /* ---- photo ---- */
    const pcan = $('#sig-photo');
    const pc = pcan.getContext('2d');
    $('#sig-file').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { photo = { img: img, rot: 0 }; crop = null; $('.sig-editor').hidden = false; drawPhoto(); URL.revokeObjectURL(url); };
      img.src = url;
    });
    function rotated() {
      // Photo drawn upright into an offscreen canvas (max 1600 px long side).
      const { img, rot } = photo;
      const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const w = img.naturalWidth * k, h = img.naturalHeight * k;
      const c = document.createElement('canvas');
      const swap = rot % 180 !== 0;
      c.width = swap ? h : w; c.height = swap ? w : h;
      const x = c.getContext('2d');
      x.translate(c.width / 2, c.height / 2); x.rotate(rot * Math.PI / 180);
      x.drawImage(img, -w / 2, -h / 2, w, h);
      return c;
    }
    let src = null;
    function drawPhoto() {
      src = rotated();
      pcan.width = src.width; pcan.height = src.height;
      pc.drawImage(src, 0, 0);
      if (crop) {
        pc.fillStyle = 'rgba(29,26,43,0.45)';
        pc.fillRect(0, 0, pcan.width, crop.y); pc.fillRect(0, crop.y + crop.h, pcan.width, pcan.height - crop.y - crop.h);
        pc.fillRect(0, crop.y, crop.x, crop.h); pc.fillRect(crop.x + crop.w, crop.y, pcan.width - crop.x - crop.w, crop.h);
        pc.strokeStyle = '#f5c518'; pc.lineWidth = Math.max(2, pcan.width / 300); pc.strokeRect(crop.x, crop.y, crop.w, crop.h);
      }
    }
    let dragFrom = null;
    pcan.addEventListener('pointerdown', (e) => { try { pcan.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } dragFrom = pos(pcan, e); crop = null; e.preventDefault(); });
    pcan.addEventListener('pointermove', (e) => {
      if (!dragFrom) return;
      const [x, y] = pos(pcan, e);
      crop = { x: Math.min(x, dragFrom[0]), y: Math.min(y, dragFrom[1]), w: Math.abs(x - dragFrom[0]), h: Math.abs(y - dragFrom[1]) };
      drawPhoto(); e.preventDefault();
    });
    pcan.addEventListener('pointerup', () => { dragFrom = null; if (crop && (crop.w < 10 || crop.h < 10)) { crop = null; drawPhoto(); } });

    root.addEventListener('click', (e) => {
      const act = e.target.closest('[data-sig-act]');
      if (!act) return;
      e.preventDefault();
      const a = act.dataset.sigAct;
      if (a === 'rotate' && photo) { photo.rot = (photo.rot + 90) % 360; crop = null; drawPhoto(); }
      if (a === 'apply' && src) {
        const r = crop || { x: 0, y: 0, w: src.width, h: src.height };
        const k = Math.min(1, 900 / r.w);
        const out = document.createElement('canvas');
        out.width = Math.max(1, Math.round(r.w * k)); out.height = Math.max(1, Math.round(r.h * k));
        const o = out.getContext('2d');
        o.fillStyle = '#fff'; o.fillRect(0, 0, out.width, out.height);
        o.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height);
        if ($('#sig-clean').checked) cleanBackground(out);
        save(trimToInk(out), 'photo');
      }
      if (a === 'clear') { clearPad(); api.set(null); showPlacement(); }
    });

    /* ---- placement ---- */
    function showPlacement() {
      const sig = api.get();
      const box = $('.sig-place');
      box.hidden = !(sig && sig.dataUrl);
      if (box.hidden) return;
      $('#sig-scale').value = sig.scale || 1;
      $('#sig-dx').value = sig.dx || 0;
      $('#sig-dy').value = sig.dy || 0;
      $('.pv-closing').textContent = api.closing || '';
      $('.pv-name').textContent = api.name || '';
      $('.pv-img').src = sig.dataUrl;
      layoutPreview();
    }
    function layoutPreview() {
      const sig = api.get();
      if (!sig) return;
      const pv = $('#sig-preview');
      const pxPerMm = pv.clientWidth / PREVIEW_MM || 3;
      const img = $('.pv-img');
      const h = SIG_MM * (sig.scale || 1) * pxPerMm;
      img.style.height = h + 'px';
      img.style.width = Math.min(190 / 42 * SIG_MM * (sig.scale || 1) * pxPerMm, h * sig.width / sig.height) + 'px';
      img.style.transform = 'translate(' + ((sig.dx || 0) * pxPerMm) + 'px,' + ((sig.dy || 0) * -pxPerMm) + 'px)';
    }
    ['sig-scale', 'sig-dx', 'sig-dy'].forEach((id) => $('#' + id).addEventListener('input', () => {
      const sig = Object.assign({}, api.get());
      sig.scale = +$('#sig-scale').value; sig.dx = +$('#sig-dx').value; sig.dy = +$('#sig-dy').value;
      api.set(sig); layoutPreview();
    }));
    // Drag the signature in the preview.
    const pvImg = $('.pv-img');
    let pvDrag = null;
    pvImg.addEventListener('pointerdown', (e) => { const s = api.get() || {}; pvDrag = { x: e.clientX, y: e.clientY, dx: s.dx || 0, dy: s.dy || 0 }; try { pvImg.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } e.preventDefault(); });
    pvImg.addEventListener('pointermove', (e) => {
      if (!pvDrag) return;
      const pxPerMm = $('#sig-preview').clientWidth / PREVIEW_MM || 3;
      const sig = Object.assign({}, api.get());
      sig.dx = Math.max(-5, Math.min(80, Math.round(pvDrag.dx + (e.clientX - pvDrag.x) / pxPerMm)));
      sig.dy = Math.max(-8, Math.min(8, Math.round((pvDrag.dy - (e.clientY - pvDrag.y) / pxPerMm) * 2) / 2));
      api.set(sig); $('#sig-dx').value = sig.dx; $('#sig-dy').value = sig.dy; layoutPreview();
    });
    pvImg.addEventListener('pointerup', () => { pvDrag = null; });

    function save(canvas, source) {
      const prev = api.get() || {};
      api.set({ dataUrl: canvas.toDataURL('image/jpeg', 0.92), width: canvas.width, height: canvas.height,
        source: source, scale: prev.scale || 1, dx: prev.dx || 0, dy: prev.dy || 0 });
      showPlacement();
    }

    root._fightendoClear = () => { clearPad(); api.set(null); showPlacement(); };
    showPlacement();
  }

  // Paper → pure white, ink → darker; removes shadows and grey paper from photos.
  function cleanBackground(c) {
    const x = c.getContext('2d');
    const d = x.getImageData(0, 0, c.width, c.height);
    const p = d.data;
    let sum = 0;
    for (let i = 0; i < p.length; i += 4) sum += 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
    const paper = sum / (p.length / 4);                     // average ≈ paper brightness
    const cut = paper * 0.72;
    for (let i = 0; i < p.length; i += 4) {
      const l = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
      if (l >= cut) { p[i] = p[i + 1] = p[i + 2] = 255; }
      else {
        const f = Math.max(0, l / cut) * 0.5;                 // keep ink colour, but darker
        p[i] = p[i] * f; p[i + 1] = p[i + 1] * f; p[i + 2] = p[i + 2] * f;
      }
    }
    x.putImageData(d, 0, 0);
  }

  // Crop white margins so placement matches the visible ink.
  function trimToInk(c) {
    const x = c.getContext('2d');
    const { data, width, height } = x.getImageData(0, 0, c.width, c.height);
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) for (let i = 0; i < width; i++) {
      const k = (y * width + i) * 4;
      if (data[k] < 200 || data[k + 1] < 200 || data[k + 2] < 200) { if (i < minX) minX = i; if (i > maxX) maxX = i; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
    if (maxX < 0) return c;
    const pad = 6;
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(width - 1, maxX + pad); maxY = Math.min(height - 1, maxY + pad);
    const out = document.createElement('canvas');
    out.width = maxX - minX + 1; out.height = maxY - minY + 1;
    const o = out.getContext('2d');
    o.fillStyle = '#fff'; o.fillRect(0, 0, out.width, out.height);
    o.drawImage(c, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
    return out;
  }

  FE.signatureUI = { mount: mount };
})();
