/* Exon Exams — runtime PT→EN/ES translator
 * Walks the DOM, looks each visible text node up in EXAM_DICT, swaps content.
 * Also handles common attributes (alt, title, placeholder, aria-label).
 * Persists choice in localStorage('exon-lang') — same key as the home nav.
 *
 * Usage in each exam page:
 *   <script src="assets/exam-dict.js"></script>
 *   <script src="assets/exam-i18n.js"></script>
 * plus a <div class="nav-langs"> with three buttons [data-lang=pt|en|es].
 */
(function () {
  var DICT = window.EXAM_DICT || { en: {}, es: {} };

  // Cache the original PT text on each text node, on first run.
  function cacheOriginal(node) {
    if (node.__ptCached) return;
    node.__ptOriginal = node.nodeValue;
    node.__ptCached = true;
  }

  function translateText(raw, lang) {
    if (lang === 'pt') return raw;
    var trimmed = raw.replace(/\s+/g, ' ').trim();
    if (!trimmed) return raw;
    var hit = DICT[lang] && DICT[lang][trimmed];
    if (!hit) return raw;
    // Preserve leading / trailing whitespace from the original
    var lead = raw.match(/^\s*/)[0];
    var tail = raw.match(/\s*$/)[0];
    return lead + hit + tail;
  }

  function walkText(root, lang) {
    var skipTags = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, PRE: 1 };
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.parentNode) return NodeFilter.FILTER_REJECT;
        if (skipTags[n.parentNode.tagName]) return NodeFilter.FILTER_REJECT;
        if (n.parentNode.closest && n.parentNode.closest('[data-i18n-skip]')) return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var list = [];
    var n;
    while ((n = walker.nextNode())) list.push(n);
    list.forEach(function (node) {
      cacheOriginal(node);
      node.nodeValue = translateText(node.__ptOriginal, lang);
    });
  }

  function translateAttrs(root, lang) {
    var sel = '[alt], [title], [placeholder], [aria-label]';
    var nodes = root.querySelectorAll(sel);
    nodes.forEach(function (el) {
      ['alt', 'title', 'placeholder', 'aria-label'].forEach(function (attr) {
        if (!el.hasAttribute(attr)) return;
        var key = '__pt_' + attr;
        if (!el[key + '_cached']) {
          el[key] = el.getAttribute(attr);
          el[key + '_cached'] = true;
        }
        el.setAttribute(attr, translateText(el[key], lang));
      });
    });
  }

  function apply(lang) {
    if (!['pt', 'en', 'es'].includes(lang)) lang = 'pt';
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    walkText(document.body, lang);
    translateAttrs(document.body, lang);
    try { localStorage.setItem('exon-lang', lang); } catch (e) {}
    document.querySelectorAll('.nav-langs button[data-lang]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
  }

  function init() {
    var saved = 'pt';
    try { saved = localStorage.getItem('exon-lang') || 'pt'; } catch (e) {}
    apply(saved);
    document.addEventListener('click', function (e) {
      var t = e.target.closest('.nav-langs button[data-lang]');
      if (t) { e.preventDefault(); apply(t.getAttribute('data-lang')); }
    });
  }

  window.ExamI18n = { apply: apply, init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
