/* FightEndo – bridge for the Android/iOS app builds (Capacitor).
 * In a normal browser this does nothing. Inside the native app, "save" and "share"
 * write the file to the app's private cache and open the system share sheet, so the
 * user decides where it goes (Files, Drive, e-mail, the insurer's app …).
 * No network access is involved. SPDX-License-Identifier: GPL-3.0-or-later */
(function () {
  'use strict';

  const FE = window.FightEndo;

  function cap() { return window.Capacitor; }

  function isNative() {
    const c = cap();
    return !!(c && typeof c.isNativePlatform === 'function' && c.isNativePlatform());
  }

  function toBase64(content) {
    const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  async function shareFile(name, content, title) {
    const P = cap().Plugins;
    const written = await P.Filesystem.writeFile({ path: name, data: toBase64(content), directory: 'CACHE' });
    await P.Share.share({ title: title || name, dialogTitle: title || name, files: [written.uri] });
  }

  // Remove letters/backups we put in the cache for sharing (on start and on lock).
  async function cleanup() {
    if (!isNative()) return;
    try {
      const P = cap().Plugins;
      const res = await P.Filesystem.readdir({ path: '', directory: 'CACHE' });
      for (const f of res.files || []) {
        const name = typeof f === 'string' ? f : f.name;
        if (/\.(pdf|txt|json)$/i.test(name)) await P.Filesystem.deleteFile({ path: name, directory: 'CACHE' });
      }
    } catch (e) { /* nothing to clean */ }
  }

  FE.native = { isNative: isNative, shareFile: shareFile, cleanup: cleanup };
  if (isNative()) setTimeout(cleanup, 3000);
})();
