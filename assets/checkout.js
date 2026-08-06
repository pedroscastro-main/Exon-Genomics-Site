/* Exon Genomics — checkout via InfinitePay */
(function () {

  function injectStyles() {
    if (document.getElementById('exon-ck-styles')) return;
    var s = document.createElement('style');
    s.id = 'exon-ck-styles';
    s.textContent = [
      '#exon-ck-overlay{display:none;position:fixed;inset:0;z-index:2000;',
        'background:rgba(10,20,40,.78);backdrop-filter:blur(5px);',
        '-webkit-backdrop-filter:blur(5px);',
        'align-items:center;justify-content:center;padding:20px;}',
      '#exon-ck-overlay.open{display:flex;}',
      '#exon-ck-dialog{background:#fff;border-radius:16px;width:100%;max-width:420px;',
        'box-shadow:0 24px 60px rgba(10,20,40,.28);',
        "font-family:'Inter',-apple-system,sans-serif;",
        'display:flex;flex-direction:column;align-items:center;',
        'text-align:center;padding:48px 40px;gap:20px;}',
      '.exon-spinner{width:36px;height:36px;border:3px solid rgba(26,35,64,.1);',
        'border-top-color:#0a3d7a;border-radius:50%;',
        'animation:exon-spin .7s linear infinite;flex-shrink:0;}',
      '@keyframes exon-spin{to{transform:rotate(360deg)}}',
      '#exon-ck-dialog h3{font-family:"Fraunces",Georgia,serif;font-size:1.45rem;',
        'font-weight:400;color:#1a2340;line-height:1.1;margin:0;}',
      '#exon-ck-dialog p{font-size:13.5px;color:#6b7a95;line-height:1.6;',
        'max-width:32ch;margin:0;}',
      '#exon-ck-err{color:#c64c2e;font-size:13px;}',
      '.ck-btn-cancel{padding:10px 24px;border-radius:100px;',
        'background:rgba(26,35,64,.06);color:#6b7a95;',
        'font-size:13px;cursor:pointer;border:0;font-family:inherit;',
        'transition:background .2s;margin-top:4px;}',
      '.ck-btn-cancel:hover{background:rgba(26,35,64,.12);color:#1a2340;}',
    ].join('');
    document.head.appendChild(s);
  }

  function injectModal() {
    if (document.getElementById('exon-ck-overlay')) return;
    var el = document.createElement('div');
    el.id = 'exon-ck-overlay';
    el.innerHTML =
      '<div id="exon-ck-dialog" role="dialog" aria-modal="true">' +
        '<div class="exon-spinner"></div>' +
        '<h3>Redirecionando para o<br><em style="color:#c64c2e;font-style:italic">checkout seguro…</em></h3>' +
        '<p>Você será direcionado para a página de pagamento em instantes.</p>' +
        '<div id="exon-ck-err" style="display:none"></div>' +
        '<button class="ck-btn-cancel" id="exon-ck-cancel">Cancelar</button>' +
      '</div>';
    document.body.appendChild(el);
    document.getElementById('exon-ck-cancel').addEventListener('click', closeModal);
    el.addEventListener('click', function (e) { if (e.target === el) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  function closeModal() {
    var o = document.getElementById('exon-ck-overlay');
    if (o) o.classList.remove('open');
  }

  function showError(msg) {
    var el = document.getElementById('exon-ck-err');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    document.querySelector('.exon-spinner').style.display = 'none';
  }

  window.openCheckout = async function (examId) {
    injectStyles();
    injectModal();
    var overlay = document.getElementById('exon-ck-overlay');
    var errEl = document.getElementById('exon-ck-err');
    var spinner = overlay.querySelector('.exon-spinner');
    errEl.style.display = 'none';
    spinner.style.display = 'block';
    overlay.classList.add('open');

    try {
      var resp = await fetch('/api/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: examId }),
      });
      if (!resp.ok) throw new Error('Erro ao gerar link');
      var data = await resp.json();
      if (!data.url) throw new Error('Link inválido');
      window.location.href = data.url;
    } catch (err) {
      showError('Não foi possível gerar o link de pagamento. Tente novamente.');
      console.error(err);
    }
  };

})();
