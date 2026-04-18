// Exon i18n — PT/EN/ES
// Current policy: EN and ES mirror PT (same copy). Swaps the active button
// visual state and sets <html data-lang>. Textual content is already in the
// DOM in PT and is left untouched.
//
// If/when real translations are added later, store per-language text via
// data-i18n-pt / data-i18n-en / data-i18n-es (or data-i18n-html-{lang}) and
// this file will swap them automatically.

window.ExonI18n = (function () {
  function apply(lang) {
    if (!['pt', 'en', 'es'].includes(lang)) lang = 'pt';
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);

    // Text content swap (only runs if data-i18n-<lang> is present)
    document.querySelectorAll('[data-i18n-pt], [data-i18n-en], [data-i18n-es]').forEach(function (el) {
      var txt = el.getAttribute('data-i18n-' + lang);
      if (txt == null) txt = el.getAttribute('data-i18n-pt'); // fallback to PT
      if (txt != null) el.innerHTML = txt;
    });

    // Placeholder swap
    document.querySelectorAll('[data-i18n-pt-placeholder], [data-i18n-en-placeholder], [data-i18n-es-placeholder]').forEach(function (el) {
      var p = el.getAttribute('data-i18n-' + lang + '-placeholder');
      if (p == null) p = el.getAttribute('data-i18n-pt-placeholder');
      if (p != null) el.setAttribute('placeholder', p);
    });

    try { localStorage.setItem('exon-lang', lang); } catch (e) {}

    // Update toggle UI — supports both data-lang-btn and data-lang patterns
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang-btn') === lang);
    });
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      if (b.tagName === 'BUTTON') {
        b.classList.toggle('active', b.getAttribute('data-lang') === lang);
      }
    });
  }

  function init(defaultLang) {
    var saved;
    try { saved = localStorage.getItem('exon-lang'); } catch (e) {}
    apply(saved || defaultLang || 'pt');
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-lang-btn], button[data-lang]');
      if (t) {
        e.preventDefault();
        var l = t.getAttribute('data-lang-btn') || t.getAttribute('data-lang');
        apply(l);
      }
    });
  }
  return { init: init, apply: apply };
})();

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { window.ExonI18n.init(); });
} else {
  window.ExonI18n.init();
}
