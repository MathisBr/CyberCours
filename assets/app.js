/* ============================================================
   Révisions Majeure Cybersécurité S9 — moteur commun
   - thème clair / sombre
   - navigation par ONGLETS (un chapitre à la fois), construite
     automatiquement à partir des <h2> de la page
   - recherche plein texte sur TOUTES les sections, y compris inactives
   - QCM en vue dédiée : une question à la fois, ordre des questions ET
     des propositions totalement aléatoire, correction immédiate expliquée,
     pourcentage de réussite en direct, rejeu des erreurs
   ============================================================ */
(function () {
  'use strict';

  /* ================= Thème ================= */
  var KEY_THEME = 'majcyb.theme';
  var saved = localStorage.getItem(KEY_THEME);
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  else if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-theme', 'dark');

  window.toggleTheme = function () {
    var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', cur);
    localStorage.setItem(KEY_THEME, cur);
  };

  /* ================= Utilitaires ================= */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function shuffle(a) {                       // Fisher-Yates
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sameSet(a, b) {
    if (a.length !== b.length) return false;
    var x = a.slice().sort(function (p, q) { return p - q; });
    var y = b.slice().sort(function (p, q) { return p - q; });
    for (var i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
    return true;
  }
  var LETTERS = 'ABCDEFGH';
  var PAGE = (location.pathname.split('/').pop() || 'page').replace('.html', '');

  /* ================= Onglets ================= */
  var SECTIONS = [];
  var current = -1;

  function buildSections() {
    var content = document.querySelector('.content');
    if (!content) return;
    var kids = Array.prototype.slice.call(content.children);
    var groups = [];
    var cur = { id: 'presentation', title: 'Présentation', nodes: [] };

    kids.forEach(function (n) {
      if (n.tagName === 'H2') {
        if (cur.nodes.length) groups.push(cur);
        cur = {
          id: n.id || ('sec' + groups.length),
          title: (n.textContent || '').replace(/\s+/g, ' ').trim(),
          nodes: [n]
        };
      } else cur.nodes.push(n);
    });
    if (cur.nodes.length) groups.push(cur);

    while (content.firstChild) content.removeChild(content.firstChild);

    groups.forEach(function (g, i) {
      var sec = el('section', 'section-content');
      sec.id = 'sec-' + g.id;
      g.nodes.forEach(function (n) { sec.appendChild(n); });

      var nav = el('div', 'sec-nav');
      nav.innerHTML =
        '<button class="btn" data-go="' + (i - 1) + '">◀ Précédent</button>' +
        '<span class="sec-pos">' + (i + 1) + ' / ' + groups.length + '</span>' +
        '<button class="btn" data-go="' + (i + 1) + '">Suivant ▶</button>';
      nav.querySelectorAll('button').forEach(function (b) {
        var t = parseInt(b.dataset.go, 10);
        if (t < 0 || t >= groups.length) b.disabled = true;
        else b.onclick = function () { showSection(t); };
      });
      sec.appendChild(nav);

      content.appendChild(sec);
      g.el = sec;
      g.text = sec.textContent.toLowerCase();
    });
    SECTIONS = groups;
  }

  function buildMenu() {
    var nav = document.getElementById('toc');
    if (!nav) return;
    nav.innerHTML = '';
    SECTIONS.forEach(function (g, i) {
      var a = el('a', 'tab-link');
      a.href = '#' + g.el.id;
      a.dataset.idx = i;
      a.textContent = g.title;
      a.onclick = function (e) { e.preventDefault(); showSection(i); };
      nav.appendChild(a);

      g.el.querySelectorAll('h3[id]').forEach(function (h) {
        var s = el('a', 'lvl3');
        s.href = '#' + h.id;
        s.textContent = (h.textContent || '').replace(/\s+/g, ' ').trim();
        s.onclick = function (e) { e.preventDefault(); showSection(i, h.id); };
        nav.appendChild(s);
      });
    });
  }

  /* progression de lecture */
  function visited() {
    try { return JSON.parse(localStorage.getItem('majcyb.seen.' + PAGE)) || []; }
    catch (e) { return []; }
  }
  function markVisited(id) {
    var v = visited();
    if (v.indexOf(id) === -1) { v.push(id); localStorage.setItem('majcyb.seen.' + PAGE, JSON.stringify(v)); }
    paintProgress();
  }
  function paintProgress() {
    var bar = document.getElementById('read-bar');
    var lab = document.getElementById('read-lab');
    if (!bar || !SECTIONS.length) return;
    var n = visited().length;
    bar.style.width = Math.round(n / SECTIONS.length * 100) + '%';
    if (lab) lab.textContent = n + ' / ' + SECTIONS.length + ' chapitres vus';
    document.querySelectorAll('#toc a.tab-link').forEach(function (a) {
      var g = SECTIONS[parseInt(a.dataset.idx, 10)];
      a.classList.toggle('seen', g && visited().indexOf(g.el.id) !== -1);
    });
  }

  function showSection(i, anchorId) {
    if (i < 0 || i >= SECTIONS.length) return;
    current = i;
    SECTIONS.forEach(function (g, k) { g.el.classList.toggle('active', k === i); });
    document.querySelectorAll('#toc a').forEach(function (a) { a.classList.remove('active'); });
    var link = document.querySelector('#toc a.tab-link[data-idx="' + i + '"]');
    if (link) link.classList.add('active');

    markVisited(SECTIONS[i].el.id);
    localStorage.setItem('majcyb.tab.' + PAGE, SECTIONS[i].el.id);

    if (history.replaceState) history.replaceState(null, '', '#' + (anchorId || SECTIONS[i].el.id));

    if (anchorId) {
      var t = document.getElementById(anchorId);
      if (t) { t.scrollIntoView({ block: 'start' }); return; }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  window.showSection = showSection;

  function openFromHash() {
    var h = (location.hash || '').replace('#', '');
    if (h) {
      for (var i = 0; i < SECTIONS.length; i++) {
        if (SECTIONS[i].el.id === h) { showSection(i); return; }
        if (SECTIONS[i].el.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(h) : h))) { showSection(i, h); return; }
      }
    }
    var last = localStorage.getItem('majcyb.tab.' + PAGE);
    if (last) {
      for (var k = 0; k < SECTIONS.length; k++) if (SECTIONS[k].el.id === last) { showSection(k); return; }
    }
    showSection(0);
  }

  /* ================= Recherche (toutes sections) ================= */
  function clearMarks() {
    document.querySelectorAll('.content mark').forEach(function (m) {
      var p = m.parentNode;
      p.replaceChild(document.createTextNode(m.textContent), m);
      p.normalize();
    });
  }
  function highlight(root, q) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.parentNode && /SCRIPT|STYLE|MARK/.test(n.parentNode.tagName)) continue;
      if (n.nodeValue.toLowerCase().indexOf(q) !== -1) nodes.push(n);
    }
    var first = null;
    nodes.forEach(function (t) {
      var frag = document.createDocumentFragment(), s = t.nodeValue, low = s.toLowerCase(), idx = 0, p;
      while ((p = low.indexOf(q, idx)) !== -1) {
        if (p > idx) frag.appendChild(document.createTextNode(s.slice(idx, p)));
        var m = el('mark'); m.textContent = s.slice(p, p + q.length);
        frag.appendChild(m); if (!first) first = m;
        idx = p + q.length;
      }
      if (idx < s.length) frag.appendChild(document.createTextNode(s.slice(idx)));
      t.parentNode.replaceChild(frag, t);
    });
    return first;
  }

  function setupSearch() {
    var input = document.getElementById('search');
    if (!input) return;
    var panel = el('div', 'search-panel hidden');
    panel.id = 'search-panel';
    document.body.appendChild(panel);

    function close() { panel.classList.add('hidden'); }

    function run() {
      var q = input.value.trim().toLowerCase();
      clearMarks();
      if (q.length < 2) { close(); return; }
      var hits = [];
      SECTIONS.forEach(function (g, i) {
        var c = g.text.split(q).length - 1;
        if (c > 0) {
          var pos = g.text.indexOf(q);
          hits.push({ i: i, n: c, extrait: g.text.slice(Math.max(0, pos - 45), pos + 55) });
        }
      });
      if (!hits.length) {
        panel.innerHTML = '<div class="search-empty">Aucun résultat pour « ' + q + ' »</div>';
        panel.classList.remove('hidden');
        return;
      }
      panel.innerHTML = '<div class="search-head">' + hits.reduce(function (s, h) { return s + h.n; }, 0) +
        ' occurrence(s) dans ' + hits.length + ' chapitre(s)</div>';
      hits.forEach(function (h) {
        var r = el('button', 'search-hit');
        r.innerHTML = '<b>' + SECTIONS[h.i].title + '</b> <span class="badge">' + h.n + '</span>' +
          '<div class="search-x">…' + h.extrait.replace(/</g, '&lt;') + '…</div>';
        r.onclick = function () {
          showSection(h.i);
          var first = highlight(SECTIONS[h.i].el, q);
          if (first) first.scrollIntoView({ block: 'center' });
          close();
        };
        panel.appendChild(r);
      });
      panel.classList.remove('hidden');
    }

    var t;
    input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(run, 160); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var f = panel.querySelector('.search-hit'); if (f) f.click(); }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); input.focus(); input.select(); }
      if (e.key === 'Escape') { close(); input.blur(); }
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== input) close();
    });
  }

  /* ================= Retour en haut ================= */
  function setupTop() {
    var b = document.getElementById('top');
    if (!b) return;
    b.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    window.addEventListener('scroll', function () { b.classList.toggle('show', window.scrollY > 700); });
  }

  /* ============================================================
     QCM — vue dédiée, une question à la fois
     ============================================================ */
  var Q = {
    all: [], chapters: {}, key: 'qcm',
    serie: [],        // questions de la série, déjà mélangées
    idx: 0,           // index de la question courante
    order: [],        // ordre mélangé des propositions de la question courante
    answered: 0, correct: 0, wrongIds: [], validated: false
  };

  window.initQCM = function (data, chapters, storageKey) {
    Q.all = data || [];
    Q.chapters = chapters || {};
    Q.key = 'majcyb.' + (storageKey || 'qcm');
    var host = document.getElementById('qcm');
    if (!host) return;
    host.innerHTML =
      '<div id="qcm-setup"></div>' +
      '<div id="qcm-run" class="hidden"></div>' +
      '<div id="qcm-end" class="hidden"></div>';
    renderSetup();
    var badge = document.getElementById('count-badge');
    if (badge) badge.textContent = Q.all.length + ' questions';
  };

  function hist() {
    try { return JSON.parse(localStorage.getItem(Q.key)) || { a: 0, c: 0, wrong: [] }; }
    catch (e) { return { a: 0, c: 0, wrong: [] }; }
  }
  function saveHist(h) { localStorage.setItem(Q.key, JSON.stringify(h)); }

  function renderSetup() {
    var h = hist();
    var opts = '<option value="all">Tous les chapitres (' + Q.all.length + ')</option>';
    Object.keys(Q.chapters).forEach(function (c) {
      var n = Q.all.filter(function (q) { return String(q.ch) === String(c); }).length;
      opts += '<option value="' + c + '">' + c + '. ' + Q.chapters[c] + ' (' + n + ')</option>';
    });
    var taux = h.a ? Math.round(h.c / h.a * 100) + ' %' : '—';

    document.getElementById('qcm-setup').innerHTML =
      '<div class="qcm-panel">' +
        '<div class="qcm-controls">' +
          '<label>Chapitre <select id="q-chap">' + opts + '</select></label>' +
          '<label>Niveau <select id="q-diff">' +
            '<option value="0">Tous</option><option value="1">1 · Base</option>' +
            '<option value="2">2 · Intermédiaire</option><option value="3">3 · Expert</option>' +
          '</select></label>' +
          '<label>Nombre <input id="q-count" type="number" min="1" max="500" value="20"></label>' +
          '<button class="btn primary" id="q-start">Commencer</button>' +
          '<button class="btn" id="q-wrong">Rejouer mes erreurs (' + h.wrong.length + ')</button>' +
          '<button class="btn ghost" id="q-reset">Réinitialiser les stats</button>' +
        '</div>' +
        '<div class="qcm-stats">' +
          '<span>Historique cumulé : <b>' + taux + '</b>' + (h.a ? ' sur ' + h.a + ' réponses' : '') + '</span>' +
          '<span>À revoir : <b>' + h.wrong.length + '</b> question(s)</span>' +
        '</div>' +
      '</div>' +
      '<p style="color:var(--fg-mute);font-size:.88rem">L\'ordre des questions et celui des propositions sont ' +
      'entièrement tirés au hasard à chaque série. Plusieurs réponses peuvent être correctes.</p>';

    document.getElementById('q-start').onclick = function () { start(false); };
    document.getElementById('q-wrong').onclick = function () { start(true); };
    document.getElementById('q-reset').onclick = function () {
      if (confirm('Effacer les statistiques enregistrées pour cette matière ?')) {
        localStorage.removeItem(Q.key); renderSetup();
      }
    };
  }

  function start(wrongOnly) {
    var pool = Q.all.slice();
    if (wrongOnly) {
      var w = hist().wrong;
      pool = pool.filter(function (q) { return w.indexOf(q.id) !== -1; });
      if (!pool.length) { alert('Aucune erreur enregistrée pour l’instant. Lancez d’abord une série.'); return; }
    } else {
      var chap = document.getElementById('q-chap').value;
      var diff = document.getElementById('q-diff').value;
      if (chap !== 'all') pool = pool.filter(function (q) { return String(q.ch) === chap; });
      if (diff !== '0') pool = pool.filter(function (q) { return String(q.d) === diff; });
      var n = parseInt(document.getElementById('q-count').value, 10) || 20;
      pool = shuffle(pool).slice(0, Math.min(n, pool.length));
    }
    if (!pool.length) { alert('Aucune question ne correspond à ce filtre.'); return; }

    Q.serie = wrongOnly ? shuffle(pool) : shuffle(pool);   // ordre des questions : toujours aléatoire
    Q.idx = 0; Q.answered = 0; Q.correct = 0; Q.wrongIds = [];

    document.getElementById('qcm-setup').classList.add('hidden');
    document.getElementById('qcm-end').classList.add('hidden');
    document.getElementById('qcm-run').classList.remove('hidden');
    renderQuestion();
  }

  function quit() {
    document.getElementById('qcm-run').classList.add('hidden');
    document.getElementById('qcm-end').classList.add('hidden');
    document.getElementById('qcm-setup').classList.remove('hidden');
    renderSetup();
  }

  function renderQuestion() {
    var q = Q.serie[Q.idx];
    Q.validated = false;
    Q.order = shuffle(q.o.map(function (_, i) { return i; }));   // propositions mélangées
    var pct = Q.answered ? Math.round(Q.correct / Q.answered * 100) : 0;
    var dl = ['', 'Base', 'Intermédiaire', 'Expert'][q.d || 1];

    var html =
      '<div class="qcm-panel qcm-card">' +
        '<div class="q-top">' +
          '<span class="q-count">Question ' + (Q.idx + 1) + ' / ' + Q.serie.length + '</span>' +
          '<span class="q-score">Réussite : <b id="q-pct">' + (Q.answered ? pct + ' %' : '—') + '</b></span>' +
          '<button class="btn ghost" id="q-quit">Quitter</button>' +
        '</div>' +
        '<div class="progress"><i style="width:' + (Q.idx / Q.serie.length * 100) + '%"></i></div>' +
        '<div class="q-meta">' +
          '<span class="badge acc">Ch. ' + q.ch + ' — ' + (Q.chapters[q.ch] || '') + '</span>' +
          '<span class="badge b' + (q.d || 1) + '">' + dl + '</span>' +
        '</div>' +
        '<div class="q-text">' + q.q + '</div>' +
        '<div class="q-opts" id="q-opts"></div>' +
        '<div id="q-feedback"></div>' +
        '<div class="q-actions">' +
          '<button class="btn primary" id="q-validate" disabled>Valider</button>' +
          '<button class="btn primary hidden" id="q-next">' +
            (Q.idx + 1 < Q.serie.length ? 'Suivant ▶' : 'Voir mon score ▶') + '</button>' +
          '<span class="q-hint">Plusieurs réponses peuvent être correctes.</span>' +
        '</div>' +
      '</div>';
    document.getElementById('qcm-run').innerHTML = html;

    var box = document.getElementById('q-opts');
    Q.order.forEach(function (orig, pos) {
      var lab = el('label', 'opt');
      lab.dataset.idx = orig;
      lab.innerHTML = '<input type="checkbox" value="' + orig + '">' +
        '<span><b>' + LETTERS[pos] + '.</b> ' + q.o[orig] + '</span>';
      lab.querySelector('input').addEventListener('change', function () {
        lab.classList.toggle('sel', this.checked);
        document.getElementById('q-validate').disabled =
          box.querySelectorAll('input:checked').length === 0;
      });
      box.appendChild(lab);
    });

    document.getElementById('q-quit').onclick = quit;
    document.getElementById('q-validate').onclick = validate;
    document.getElementById('q-next').onclick = next;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function validate() {
    if (Q.validated) return;
    var q = Q.serie[Q.idx];
    var sel = [];
    document.querySelectorAll('#q-opts input:checked').forEach(function (i) { sel.push(parseInt(i.value, 10)); });
    if (!sel.length) return;
    Q.validated = true;

    var ok = sameSet(sel, q.a);
    document.querySelectorAll('#q-opts .opt').forEach(function (o) {
      var idx = parseInt(o.dataset.idx, 10);
      var good = q.a.indexOf(idx) !== -1, chosen = sel.indexOf(idx) !== -1;
      o.querySelector('input').disabled = true;
      o.classList.remove('sel');
      if (good) { o.classList.add('good'); o.insertAdjacentHTML('beforeend', '<span class="mark">✔ bonne réponse</span>'); }
      else if (chosen) { o.classList.add('bad'); o.insertAdjacentHTML('beforeend', '<span class="mark">✘ à écarter</span>'); }
    });

    Q.answered++;
    if (ok) Q.correct++; else Q.wrongIds.push(q.id);
    persist(q.id, ok);

    document.getElementById('q-feedback').innerHTML =
      '<div class="verdict ' + (ok ? 'good' : 'bad') + '">' + (ok ? '✔ Correct' : '✘ Incorrect') + '</div>' +
      '<div class="expl"><b>Explication.</b> ' + q.e + '</div>';
    document.getElementById('q-pct').textContent = Math.round(Q.correct / Q.answered * 100) + ' %';
    document.getElementById('q-validate').classList.add('hidden');
    document.getElementById('q-next').classList.remove('hidden');
    document.getElementById('q-next').focus();
  }

  function next() {
    Q.idx++;
    if (Q.idx >= Q.serie.length) return finish();
    renderQuestion();
  }

  function persist(id, ok) {
    var h = hist();
    h.a++; if (ok) h.c++;
    var i = h.wrong.indexOf(id);
    if (!ok && i === -1) h.wrong.push(id);
    if (ok && i !== -1) h.wrong.splice(i, 1);
    saveHist(h);
  }

  function finish() {
    var pct = Math.round(Q.correct / Q.serie.length * 100);
    var cls = pct >= 80 ? 'good' : (pct >= 60 ? 'mid' : 'bad');
    var msg = pct >= 90 ? 'Niveau examen atteint. Attaque les questions « Expert » et les autres chapitres.'
      : pct >= 75 ? 'Bonne maîtrise. Reprends les questions ratées puis refais une série complète.'
      : pct >= 50 ? 'Base acquise mais fragile : relis les chapitres concernés avant de rejouer.'
      : 'Relis le cours en entier sur ce périmètre, le QCM ne suffira pas.';

    document.getElementById('qcm-run').classList.add('hidden');
    var end = document.getElementById('qcm-end');
    end.classList.remove('hidden');
    end.innerHTML =
      '<div class="qcm-panel score-box">' +
        '<div class="big ' + cls + '">' + pct + ' %</div>' +
        '<p><b>' + Q.correct + ' / ' + Q.serie.length + '</b> bonnes réponses</p>' +
        '<p style="color:var(--fg-soft)">' + msg + '</p>' +
        (Q.wrongIds.length ? '<p style="font-size:.85rem;color:var(--fg-mute)">' + Q.wrongIds.length +
          ' question(s) ajoutée(s) à la liste « à revoir ».</p>' : '') +
        '<div class="q-actions" style="justify-content:center">' +
          '<button class="btn primary" id="e-wrong">Rejouer mes erreurs</button>' +
          '<button class="btn" id="e-again">Nouvelle série</button>' +
        '</div>' +
      '</div>';
    document.getElementById('e-wrong').onclick = function () { start(true); };
    document.getElementById('e-again').onclick = quit;
  }

  /* Entrée = valider puis passer à la suivante */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var run = document.getElementById('qcm-run');
    if (!run || run.classList.contains('hidden')) return;
    if (document.activeElement && document.activeElement.tagName === 'INPUT' &&
        document.activeElement.type === 'search') return;
    e.preventDefault();
    if (!Q.validated) { var v = document.getElementById('q-validate'); if (v && !v.disabled) validate(); }
    else next();
  });

  /* ================= Init ================= */
  document.addEventListener('DOMContentLoaded', function () {
    /* Le mode onglets ne s'applique qu'aux pages de cours, reconnaissables à leur
       conteneur de menu #toc. La page d'accueil reste une page simple et défilante. */
    if (document.getElementById('toc')) buildSections();
    if (SECTIONS.length) {
      buildMenu();
      var side = document.querySelector('.sidebar');
      if (side) {
        var p = el('div', 'read-progress');
        p.innerHTML = '<div class="progress"><i id="read-bar"></i></div><small id="read-lab"></small>';
        side.insertBefore(p, side.firstChild);
      }
      openFromHash();
      paintProgress();
    }
    setupSearch();
    setupTop();
    window.addEventListener('hashchange', openFromHash);
  });
})();
