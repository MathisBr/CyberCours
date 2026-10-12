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
  /* Identifiant de page = « dossier-du-cours/page » : deux cours peuvent avoir
     chacun leur fiche.html sans que leurs progressions se mélangent. */
  var PAGE = location.pathname.split('/').slice(-2).join('/').replace(/\.html$/, '') || 'page';

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
      g.raw = sec.textContent.replace(/\s+/g, ' ');
      g.text = replier(g.raw);
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

  /* Dernière page ouverte, lue par l'accueil pour proposer « Reprendre ».
     Le chemin est relatif à la racine du site : dossier/page.html#section. */
  function rememberLast(g) {
    try {
      localStorage.setItem('majcyb.last', JSON.stringify({
        href: PAGE + '.html#' + g.el.id,
        page: PAGE,
        doc: document.title,
        section: g.title,
        t: Date.now()
      }));
    } catch (e) { /* stockage indisponible : l'accueil n'affichera simplement pas de reprise */ }
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

    document.body.classList.remove('toc-open');
    var bq = document.getElementById('back-qcm');
    if (bq && SECTIONS[i].el.querySelector('#qcm')) bq.remove();
    markVisited(SECTIONS[i].el.id);
    localStorage.setItem('majcyb.tab.' + PAGE, SECTIONS[i].el.id);
    rememberLast(SECTIONS[i]);

    if (history.replaceState) history.replaceState(null, '', '#' + (anchorId || SECTIONS[i].el.id));

    revealAllSteps(SECTIONS[i].el);
    watchViz(SECTIONS[i].el);
    setupCards(SECTIONS[i].el);
    setupPicks(SECTIONS[i].el);

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
  /* Recherche insensible à la casse ET aux accents (« securite » trouve « sécurité »).
     Le repli se fait caractère par caractère : la chaîne repliée garde la même
     longueur que l'originale, ce qui permet de surligner aux bonnes positions. */
  var REPLI = {};
  function replierCar(c) {
    if (REPLI[c] === undefined) {
      var f = c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      REPLI[c] = f.length === 1 ? f : c.toLowerCase();
    }
    return REPLI[c];
  }
  function replier(s) {
    var out = '';
    for (var i = 0; i < s.length; i++) out += replierCar(s[i]);
    return out;
  }
  window.replier = replier;

  function clearMarks() {
    document.querySelectorAll('.content mark').forEach(function (m) {
      var p = m.parentNode;
      p.replaceChild(document.createTextNode(m.textContent), m);
      p.normalize();
    });
  }

  /* Surligne toutes les occurrences de tous les termes ; renvoie les <mark> dans l'ordre. */
  function highlight(root, termes) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.parentNode && /SCRIPT|STYLE|MARK/.test(n.parentNode.tagName)) continue;
      nodes.push(n);
    }
    var marks = [];
    nodes.forEach(function (t) {
      var s = t.nodeValue, f = replier(s), hits = [];
      termes.forEach(function (q) {
        var p = 0;
        while ((p = f.indexOf(q, p)) !== -1) { hits.push([p, p + q.length]); p += q.length; }
      });
      if (!hits.length) return;
      hits.sort(function (a, b) { return a[0] - b[0]; });
      var frag = document.createDocumentFragment(), idx = 0;
      hits.forEach(function (h) {
        if (h[0] < idx) return;                          // chevauchement : on garde le premier
        if (h[0] > idx) frag.appendChild(document.createTextNode(s.slice(idx, h[0])));
        var m = el('mark'); m.textContent = s.slice(h[0], h[1]);
        frag.appendChild(m); marks.push(m);
        idx = h[1];
      });
      if (idx < s.length) frag.appendChild(document.createTextNode(s.slice(idx)));
      t.parentNode.replaceChild(frag, t);
    });
    return marks;
  }

  /* Barre « précédent / suivant » entre les occurrences surlignées (F3, Maj+F3). */
  var FIND = { marks: [], i: 0 };
  function findBar(marks) {
    var bar = document.getElementById('find-bar');
    if (!bar) {
      bar = el('div', 'find-bar');
      bar.id = 'find-bar';
      bar.innerHTML = '<button class="btn" data-f="-1" title="Précédente (Maj+F3)">◀</button>' +
        '<span id="find-pos"></span>' +
        '<button class="btn" data-f="1" title="Suivante (F3)">▶</button>' +
        '<button class="btn ghost" data-f="0" title="Fermer (Échap)">✕</button>';
      bar.onclick = function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var d = parseInt(b.getAttribute('data-f'), 10);
        if (d) findGo(FIND.i + d); else findClose();
      };
      document.body.appendChild(bar);
    }
    FIND.marks = marks;
    bar.classList.toggle('hidden', !marks.length);
    findGo(0);
  }
  function findGo(i) {
    var m = FIND.marks;
    if (!m.length) return;
    FIND.i = (i + m.length) % m.length;
    m.forEach(function (x, k) { x.classList.toggle('cur', k === FIND.i); });
    m[FIND.i].scrollIntoView({ block: 'center' });
    document.getElementById('find-pos').textContent = (FIND.i + 1) + ' / ' + m.length;
  }
  function findClose() {
    clearMarks();
    FIND.marks = [];
    var bar = document.getElementById('find-bar');
    if (bar) bar.classList.add('hidden');
  }

  function setupSearch() {
    var input = document.getElementById('search');
    if (!input) return;
    var panel = el('div', 'search-panel hidden');
    panel.id = 'search-panel';
    document.body.appendChild(panel);

    function close() { panel.classList.add('hidden'); }
    function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

    function run() {
      /* Tous les mots doivent figurer dans le chapitre, dans n'importe quel ordre. */
      var termes = replier(input.value.trim()).split(/\s+/).filter(function (t) { return t.length >= 2; });
      if (!termes.length) { close(); return; }
      var hits = [];
      SECTIONS.forEach(function (g, i) {
        var n = 0;
        for (var k = 0; k < termes.length; k++) {
          var c = g.text.split(termes[k]).length - 1;
          if (!c) return;
          n += c;
        }
        var pos = g.text.indexOf(termes[0]);
        hits.push({ i: i, n: n, extrait: g.raw.slice(Math.max(0, pos - 45), pos + 75) });
      });
      if (!hits.length) {
        panel.innerHTML = '<div class="search-empty">Aucun chapitre ne contient « ' + esc(input.value.trim()) + ' »</div>';
        panel.classList.remove('hidden');
        return;
      }
      hits.sort(function (a, b) { return b.n - a.n; });
      panel.innerHTML = '<div class="search-head">' + hits.reduce(function (s, h) { return s + h.n; }, 0) +
        ' occurrence(s) dans ' + hits.length + ' chapitre(s)' +
        (termes.length > 1 ? ' — tous les mots, dans n\'importe quel ordre' : '') + '</div>';
      hits.forEach(function (h) {
        var r = el('button', 'search-hit');
        r.innerHTML = '<b>' + esc(SECTIONS[h.i].title) + '</b> <span class="badge">' + h.n + '</span>' +
          '<div class="search-x">…' + esc(h.extrait) + '…</div>';
        r.onclick = function () {
          clearMarks();
          showSection(h.i);
          findBar(highlight(SECTIONS[h.i].el, termes));
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
      if (e.key === 'F3' && FIND.marks.length) { e.preventDefault(); findGo(FIND.i + (e.shiftKey ? -1 : 1)); }
      if (e.key === 'Escape') { close(); input.blur(); findClose(); }
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== input) close();
    });
  }

  /* ================= Animations pédagogiques ================= */
  /* Révèle les .step d'un conteneur une à une. La version statique reste
     intégralement lisible : on ne masque rien de façon définitive, et
     prefers-reduced-motion affiche tout d'emblée (voir core.css). */
  var timers = {};
  window.playSteps = function (id) {
    var box = document.getElementById(id);
    if (!box) return;
    var steps = box.querySelectorAll('.step');
    (timers[id] || []).forEach(clearTimeout);
    timers[id] = [];
    steps.forEach(function (s) { s.classList.remove('visible'); });
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    steps.forEach(function (s, i) {
      if (reduce) { s.classList.add('visible'); return; }
      timers[id].push(setTimeout(function () { s.classList.add('visible'); }, 350 + i * 900));
    });
  };
  window.resetSteps = function (id) {
    var box = document.getElementById(id);
    if (!box) return;
    (timers[id] || []).forEach(clearTimeout);
    timers[id] = [];
    box.querySelectorAll('.step').forEach(function (s) { s.classList.add('visible'); });
  };
  /* À l'ouverture d'un onglet, toutes les étapes sont visibles : l'animation
     est un plus, jamais un prérequis pour lire le contenu. */
  function revealAllSteps(scope) {
    (scope || document).querySelectorAll('.step').forEach(function (s) { s.classList.add('visible'); });
  }

  /* Schémas animés (.viz de viz.css) : on pose .seen quand le schéma entre
     dans le viewport. Sans IntersectionObserver — ou si l'utilisateur a
     demandé moins d'animations — tout est affiché immédiatement, le contenu
     restant lisible en toutes circonstances. */
  var vizObs = null;
  if (window.IntersectionObserver && document.querySelector('.viz')) {
    /* On ne masque les schémas que si on est effectivement capable de les
       révéler : le marqueur porte l'état initial en CSS (html.viz-anim). */
    document.documentElement.classList.add('viz-anim');
  }
  if (window.IntersectionObserver) {
    vizObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('seen'); vizObs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  }
  function watchViz(scope) {
    var list = (scope || document).querySelectorAll('.viz:not(.seen)');
    if (!vizObs) { list.forEach(function (v) { v.classList.add('seen'); }); return; }
    list.forEach(function (v) { vizObs.observe(v); });
    /* Filet de sécurité : si l'observateur n'a rien déclenché au bout de
       2,5 s (viewport de hauteur nulle, impression, contexte exotique…),
       on affiche tout. Un schéma ne doit JAMAIS rester invisible. */
    setTimeout(function () {
      list.forEach(function (v) {
        if (!v.classList.contains('seen')) { v.classList.add('seen'); if (vizObs) vizObs.unobserve(v); }
      });
    }, 2500);
  }
  window.watchViz = watchViz;

  /* ================= Cartes de concepts interactives =================
     Délégation : un clic sur .vz-c bascule son détail. Le repli initial est
     posé ici et non dans le HTML, pour que le contenu reste intégralement
     lisible si ce script ne tourne pas. */
  /* Sélecteur à jauges (.pick) : chaque bouton porte data-m="v1,v2,…" (largeurs des
     jauges en %) et correspond, dans l'ordre, à un .pick-out. Sans JS, tous les
     textes restent visibles ; avec, seul celui de l'option choisie s'affiche. */
  function choosePick(box, k) {
    var btns = box.querySelectorAll('.pick-btns button');
    var outs = box.querySelectorAll('.pick-out');
    var bars = box.querySelectorAll('.meter .bar i');
    var vals = (btns[k].getAttribute('data-m') || '').split(',');
    btns.forEach(function (b, i) { b.setAttribute('aria-pressed', i === k ? 'true' : 'false'); });
    outs.forEach(function (o, i) { o.classList.toggle('hidden', i !== k); });
    bars.forEach(function (b, i) { b.style.width = (parseFloat(vals[i]) || 0) + '%'; });
  }
  function setupPicks(scope) {
    (scope || document).querySelectorAll('.pick:not([data-ready])').forEach(function (box) {
      box.setAttribute('data-ready', '1');
      choosePick(box, 0);
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.pick-btns button');
    if (!b) return;
    var box = b.closest('.pick');
    choosePick(box, Array.prototype.indexOf.call(box.querySelectorAll('.pick-btns button'), b));
  });

  function setupCards(scope) {
    var cards = (scope || document).querySelectorAll('.vz-c:not([data-open])');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      c.setAttribute('data-open', '0');
      if (!c.getAttribute('type')) c.setAttribute('type', 'button');
      c.setAttribute('aria-expanded', 'false');
      if (!c.querySelector('.hint')) {
        var h = document.createElement('span');
        h.className = 'hint';
        h.textContent = c.getAttribute('data-hint') || 'En savoir plus';
        c.appendChild(h);
      }
    }
    var bars = (scope || document).querySelectorAll('.vz-bar:not([data-ready])');
    for (var j = 0; j < bars.length; j++) { bars[j].setAttribute('data-ready', '1'); }
    refreshCardCounts(scope);
  }
  function cardsOf(el) {
    var viz = el.closest ? el.closest('.viz') : null;
    return (viz || document).querySelectorAll('.vz-c');
  }
  function refreshCardCounts(scope) {
    var vizs = (scope || document).querySelectorAll('.viz');
    for (var i = 0; i < vizs.length; i++) {
      var cnt = vizs[i].querySelector('.vz-bar .cnt');
      if (!cnt) continue;
      var all = vizs[i].querySelectorAll('.vz-c');
      var open = vizs[i].querySelectorAll('.vz-c[data-open="1"]');
      cnt.textContent = open.length + ' / ' + all.length + ' ouvertes';
    }
  }
  function toggleCard(c, force) {
    var open = force === undefined ? c.getAttribute('data-open') !== '1' : force;
    c.setAttribute('data-open', open ? '1' : '0');
    c.setAttribute('aria-expanded', open ? 'true' : 'false');
    var h = c.querySelector('.hint');
    if (h) h.textContent = open ? 'Replier' : (c.getAttribute('data-hint') || 'En savoir plus');
  }
  document.addEventListener('click', function (e) {
    var all = e.target.closest && e.target.closest('.vz-bar [data-cards]');
    if (all) {
      var want = all.getAttribute('data-cards') === 'open';
      var list = cardsOf(all);
      for (var i = 0; i < list.length; i++) toggleCard(list[i], want);
      refreshCardCounts();
      return;
    }
    var c = e.target.closest && e.target.closest('.vz-c');
    if (!c) return;
    toggleCard(c);
    refreshCardCounts();
  });
  window.setupCards = setupCards;

  /* ================= Retour en haut ================= */
  function setupTop() {
    var b = document.getElementById('top');
    if (!b) return;
    b.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    window.addEventListener('scroll', function () { b.classList.toggle('show', window.scrollY > 700); });
  }

  /* ============================================================
     QCM — vue dédiée, une question à la fois
     Quatre façons de jouer la même banque de questions :
       - entraînement : correction expliquée après chaque réponse ;
       - révision intelligente : répétition espacée (boîtes de Leitner),
         les erreurs et les questions « dues » d'abord ;
       - cartes mémoire : question → réponse → « je savais / à revoir » ;
       - examen blanc : chronométré, correction seulement à la fin.
     Historique par matière dans localStorage (clé majcyb.<clé>) :
       a, c        réponses données / justes, toutes séries confondues
       wrong, seen identifiants à revoir / déjà vus
       res         { id: { b: boîte 1-5, t: date, o: 1 si dernière réponse juste } }
     ============================================================ */
  var Q = {
    all: [], chapters: {}, key: 'qcm', mono: true,
    mode: 'train',    // train | cards | exam
    serie: [], idx: 0, order: [],
    answered: 0, correct: 0, wrongIds: [], validated: false,
    exam: null        // { fin: horodatage, timer, reponses: [{ q, sel, ok }] }
  };
  /* Délai avant qu'une question réussie redevienne « due », par boîte (en jours). */
  var INTERVALLES = [0, 0, 1, 3, 7, 16];
  var JOUR = 86400000;

  window.initQCM = function (data, chapters, storageKey) {
    Q.all = data || [];
    Q.chapters = chapters || {};
    Q.key = 'majcyb.' + (storageKey || 'qcm');
    /* Un QCM dont TOUTES les questions ont une seule bonne réponse se joue au
       bouton radio, comme sur Moodle. Le drapeau est global et non calculé
       question par question : sinon la forme du contrôle trahirait le nombre
       de bonnes réponses attendues dans les QCM mixtes. */
    Q.mono = Q.all.length > 0 && Q.all.every(function (q) { return q.a && q.a.length === 1; });
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

  /* ---------- Historique ---------- */
  function hist() {
    var h;
    try { h = JSON.parse(localStorage.getItem(Q.key)) || {}; } catch (e) { h = {}; }
    if (typeof h.a !== 'number') h.a = 0;
    if (typeof h.c !== 'number') h.c = 0;
    if (!Array.isArray(h.wrong)) h.wrong = [];
    if (!Array.isArray(h.seen)) h.seen = [];
    if (!h.res || typeof h.res !== 'object') h.res = {};
    return h;
  }
  function saveHist(h) {
    try { localStorage.setItem(Q.key, JSON.stringify(h)); } catch (e) { /* stockage plein ou bloqué */ }
  }
  /* État d'une question : son entrée res, ou une reconstitution à partir des
     anciennes listes (historiques antérieurs à la répétition espacée). */
  function etat(h, id) {
    if (h.res[id]) return h.res[id];
    if (h.wrong.indexOf(id) !== -1) return { b: 1, t: 0, o: 0 };
    if (h.seen.indexOf(id) !== -1) return { b: 2, t: 0, o: 1 };
    return null;
  }
  function persist(id, ok) {
    var h = hist();
    h.a++; if (ok) h.c++;
    var i = h.wrong.indexOf(id);
    if (!ok && i === -1) h.wrong.push(id);
    if (ok && i !== -1) h.wrong.splice(i, 1);
    if (h.seen.indexOf(id) === -1) h.seen.push(id);
    var r = etat(h, id) || { b: 0 };
    h.res[id] = { b: ok ? Math.min((r.b || 0) + 1, 5) : 1, t: Date.now(), o: ok ? 1 : 0 };
    saveHist(h);
  }

  /* Le mode « sans répétition » est une préférence, pas un historique. */
  function skipSeenOn() { return localStorage.getItem(Q.key + '.skipseen') === '1'; }
  function setSkipSeen(v) { localStorage.setItem(Q.key + '.skipseen', v ? '1' : '0'); }

  /* ---------- Répétition espacée ---------- */
  /* Priorité : erreurs, puis questions jamais vues, puis réussites dont le délai est
     écoulé (boîte la plus basse d'abord). Les réussites récentes ne reviennent pas. */
  function aReviser(pool) {
    var h = hist(), now = Date.now(), erreurs = [], neuves = [], dues = [];
    pool.forEach(function (q) {
      var s = etat(h, q.id);
      if (!s) neuves.push(q);
      else if (!s.o) erreurs.push(q);
      else if (now - (s.t || 0) >= INTERVALLES[s.b || 1] * JOUR) dues.push(q);
    });
    dues = shuffle(dues).sort(function (x, y) { return (etat(h, x.id).b || 1) - (etat(h, y.id).b || 1); });
    return shuffle(erreurs).concat(shuffle(neuves), dues);
  }

  /* ---------- Écran de réglage ---------- */
  function filtered(raw) {
    var cs = document.getElementById('q-chap'), ds = document.getElementById('q-diff');
    var chap = cs ? cs.value : 'all', diff = ds ? ds.value : '0';
    var pool = Q.all.filter(function (q) {
      return (chap === 'all' || String(q.ch) === chap) && (diff === '0' || String(q.d) === diff);
    });
    if (raw || !skipSeenOn()) return pool;
    var seen = hist().seen;
    return pool.filter(function (q) { return seen.indexOf(q.id) === -1; });
  }

  function maitrise(h) {
    var lignes = '';
    Object.keys(Q.chapters).forEach(function (c) {
      var qs = Q.all.filter(function (q) { return String(q.ch) === String(c); });
      if (!qs.length) return;
      var vues = 0, sues = 0, erreurs = 0;
      qs.forEach(function (q) {
        var s = etat(h, q.id);
        if (s) { vues++; if (s.o) sues++; else erreurs++; }
      });
      var p = Math.round(sues / qs.length * 100);
      var cls = p >= 80 ? 'good' : (p >= 50 ? 'mid' : 'bad');
      lignes += '<tr><td>' + c + '. ' + Q.chapters[c] + '</td>' +
        '<td class="m-bar"><span class="mbar ' + cls + '"><i style="width:' + p + '%"></i></span> ' + p + ' %</td>' +
        '<td>' + vues + ' / ' + qs.length + '</td><td>' + (erreurs || '') + '</td>' +
        '<td><button class="btn" data-travail="' + c + '">Travailler</button></td></tr>';
    });
    return '<details class="maitrise"' + (h.a ? '' : '') + '><summary>Maîtrise par chapitre</summary>' +
      '<p class="m-note">« Maîtrisé » = dernière réponse juste. Le bouton lance une révision intelligente du chapitre.</p>' +
      '<div class="tw"><table><thead><tr><th>Chapitre</th><th>Maîtrisé</th><th>Vues</th><th>Erreurs</th><th></th></tr></thead>' +
      '<tbody>' + lignes + '</tbody></table></div></details>';
  }

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
        '</div>' +
        '<div class="qcm-modes">' +
          '<div><span class="m-lbl">Entraînement</span>' +
            '<button class="btn primary" id="q-start">Commencer</button>' +
            '<button class="btn" id="q-smart" title="Erreurs, questions jamais vues, puis questions à revoir selon la répétition espacée">Révision intelligente</button>' +
            '<button class="btn" id="q-full">Tout enchaîner</button>' +
            '<button class="btn" id="q-wrong">Rejouer mes erreurs (' + h.wrong.length + ')</button></div>' +
          '<div><span class="m-lbl">Autres modes</span>' +
            '<button class="btn" id="q-cards" title="Question, puis réponse, puis « je savais / à revoir »">Cartes mémoire</button>' +
            '<button class="btn" id="q-exam" title="Chronométré, correction seulement à la fin">Examen blanc</button>' +
            '<label>Durée <input id="q-minutes" type="number" min="1" max="240" value="20"> min</label></div>' +
        '</div>' +
        '<div class="qcm-controls" style="margin-top:8px">' +
          '<label class="q-skip"><input type="checkbox" id="q-skipseen"' + (skipSeenOn() ? ' checked' : '') + '> ' +
          '<b>Ne pas reproposer</b> les questions déjà faites</label>' +
          '<span id="q-seen-info" class="q-seen-info"></span>' +
        '</div>' +
        '<div class="qcm-stats">' +
          '<span>Historique : <b>' + taux + '</b>' + (h.a ? ' sur ' + h.a + ' réponses' : '') + '</span>' +
          '<span>À revoir : <b>' + h.wrong.length + '</b></span>' +
          '<span>Déjà vues : <b>' + h.seen.length + '</b> / ' + Q.all.length + '</span>' +
          '<span id="q-due"></span>' +
        '</div>' +
        maitrise(h) +
        '<div class="qcm-controls m-reset">' +
          '<button class="btn ghost" id="q-seen-reset">Oublier les questions vues</button>' +
          '<button class="btn ghost" id="q-reset">Réinitialiser les statistiques</button>' +
        '</div>' +
      '</div>' +
      '<p class="q-help">Ordre des questions et des propositions tiré au hasard. ' +
      (Q.mono ? 'Une seule bonne réponse par question. ' : 'Plusieurs réponses peuvent être correctes. ') +
      'Raccourcis : <kbd>1</kbd>–<kbd>4</kbd> ou <kbd>A</kbd>–<kbd>D</kbd> pour répondre, <kbd>Entrée</kbd> pour valider.</p>';

    var $ = function (id) { return document.getElementById(id); };
    $('q-start').onclick = function () { start('train'); };
    $('q-smart').onclick = function () { start('smart'); };
    $('q-full').onclick = function () { start('all'); };
    $('q-wrong').onclick = function () { start('wrong'); };
    $('q-cards').onclick = function () { start('cards'); };
    $('q-exam').onclick = function () { start('exam'); };
    $('q-reset').onclick = function () {
      if (confirm('Effacer les statistiques enregistrées pour cette matière ?')) {
        localStorage.removeItem(Q.key); renderSetup();
      }
    };
    $('q-chap').onchange = syncAvail;
    $('q-diff').onchange = syncAvail;
    $('q-skipseen').onchange = function () { setSkipSeen(this.checked); syncAvail(); };
    $('q-seen-reset').onclick = function () {
      var n = hist().seen.length;
      if (!n) { alert('Aucune question n’est encore marquée comme vue.'); return; }
      if (confirm('Oublier les ' + n + ' question(s) déjà vues ?\n\nLes statistiques et les erreurs à revoir sont conservées.')) {
        var x = hist(); x.seen = []; saveHist(x); renderSetup();
      }
    };
    document.querySelectorAll('[data-travail]').forEach(function (b) {
      b.onclick = function () {
        $('q-chap').value = b.getAttribute('data-travail');
        $('q-diff').value = '0';
        start('smart');
      };
    });
    syncAvail();
  }

  function syncAvail() {
    var dispo = filtered().length, brut = filtered(true).length;
    var b = document.getElementById('q-full');
    if (b) b.textContent = 'Tout enchaîner (' + dispo + ')';
    var due = document.getElementById('q-due');
    if (due) due.innerHTML = 'À réviser maintenant : <b>' + aReviser(filtered(true)).length + '</b>';
    var info = document.getElementById('q-seen-info');
    if (info) {
      info.innerHTML = skipSeenOn()
        ? (dispo ? '<b>' + dispo + '</b> question(s) restante(s) sur ' + brut + ' pour ce filtre'
                 : '<b class="q-done">Tout ce filtre a été vu.</b> Décoche, change de filtre, ou oublie les questions vues.')
        : brut + ' question(s) pour ce filtre';
    }
  }

  /* ---------- Lancement ---------- */
  function start(kind) {
    var n = parseInt((document.getElementById('q-count') || {}).value, 10) || 20;
    var pool;
    if (kind === 'wrong') {
      var w = hist().wrong;
      pool = Q.all.filter(function (q) { return w.indexOf(q.id) !== -1; });
      if (!pool.length) { alert('Aucune erreur enregistrée pour l’instant. Lancez d’abord une série.'); return; }
      pool = shuffle(pool);
    } else if (kind === 'smart') {
      pool = aReviser(filtered(true)).slice(0, n);
      if (!pool.length) { alert('Rien à réviser pour ce filtre : tout est maîtrisé et aucune question n’est due. Revenez plus tard, ou lancez une série normale.'); return; }
    } else {
      pool = filtered();
      pool = kind === 'all' ? shuffle(pool) : shuffle(pool).slice(0, Math.min(n, pool.length));
      if (!pool.length) {
        alert(skipSeenOn() && filtered(true).length
          ? 'Toutes les questions de ce filtre ont déjà été faites.\n\nChange de filtre, décoche « Ne pas reproposer », ou oublie les questions vues.'
          : 'Aucune question ne correspond à ce filtre.');
        return;
      }
    }

    Q.mode = kind === 'cards' ? 'cards' : (kind === 'exam' ? 'exam' : 'train');
    /* La révision intelligente garde son ordre de priorité ; le reste est mélangé. */
    Q.serie = kind === 'smart' ? pool : shuffle(pool);
    Q.idx = 0; Q.answered = 0; Q.correct = 0; Q.wrongIds = [];
    stopTimer();
    Q.exam = null;
    if (Q.mode === 'exam') {
      var minutes = parseInt((document.getElementById('q-minutes') || {}).value, 10) || 20;
      Q.exam = { fin: Date.now() + minutes * 60000, reponses: [] };
      Q.exam.timer = setInterval(tick, 1000);
    }

    document.getElementById('qcm-setup').classList.add('hidden');
    document.getElementById('qcm-end').classList.add('hidden');
    document.getElementById('qcm-run').classList.remove('hidden');
    renderQuestion();
  }

  function stopTimer() { if (Q.exam && Q.exam.timer) { clearInterval(Q.exam.timer); Q.exam.timer = null; } }
  function restant() {
    var s = Math.max(0, Math.round((Q.exam.fin - Date.now()) / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function tick() {
    var t = document.getElementById('q-timer');
    if (t) t.textContent = '⏱ ' + restant();
    if (Date.now() >= Q.exam.fin) { stopTimer(); finish(true); }
  }

  function quit() {
    stopTimer();
    document.getElementById('qcm-run').classList.add('hidden');
    document.getElementById('qcm-end').classList.add('hidden');
    document.getElementById('qcm-setup').classList.remove('hidden');
    renderSetup();
  }

  /* ---------- Une question ---------- */
  function lienFiche(q) {
    /* Les chapitres du QCM sont calqués sur les <h2 id="chN"> de la fiche. */
    return document.getElementById('ch' + q.ch)
      ? '<a href="#ch' + q.ch + '" class="q-revoir" data-revoir="ch' + q.ch + '">📖 Revoir ce chapitre dans la fiche</a>' : '';
  }

  function renderQuestion() {
    var q = Q.serie[Q.idx];
    Q.validated = false;
    Q.order = shuffle(q.o.map(function (_, i) { return i; }));
    var dl = ['', 'Base', 'Intermédiaire', 'Expert'][q.d || 1];
    var droite = Q.mode === 'exam'
      ? '<span class="q-score" id="q-timer">⏱ ' + restant() + '</span>'
      : '<span class="q-score">' + (Q.mode === 'cards' ? 'Sues' : 'Réussite') + ' : <b id="q-pct">' +
        (Q.answered ? Math.round(Q.correct / Q.answered * 100) + ' %' : '—') + '</b></span>';

    var actions = Q.mode === 'cards'
      ? '<button class="btn primary" id="q-reveal">Voir la réponse</button>' +
        '<button class="btn primary hidden" id="q-knew">✔ Je savais <kbd>1</kbd></button>' +
        '<button class="btn hidden" id="q-again">✘ À revoir <kbd>2</kbd></button>'
      : '<button class="btn primary" id="q-validate" disabled>' + (Q.mode === 'exam' ? 'Valider et continuer' : 'Valider') + '</button>' +
        (Q.mode === 'exam' ? '<button class="btn ghost" id="q-skipq">Passer</button>' : '') +
        '<button class="btn primary hidden" id="q-next">' + (Q.idx + 1 < Q.serie.length ? 'Suivant ▶' : 'Voir mon score ▶') + '</button>' +
        '<span class="q-hint">' + (Q.mono ? 'Une seule réponse est correcte.' : 'Plusieurs réponses peuvent être correctes.') + '</span>';

    document.getElementById('qcm-run').innerHTML =
      '<div class="qcm-panel qcm-card">' +
        '<div class="q-top">' +
          '<span class="q-count">' + { train: '', cards: 'Carte ', exam: 'Examen · ' }[Q.mode] +
            (Q.idx + 1) + ' / ' + Q.serie.length + '</span>' + droite +
          '<button class="btn ghost" id="q-quit">' + (Q.mode === 'exam' ? 'Terminer' : 'Quitter') + '</button>' +
        '</div>' +
        '<div class="progress"><i style="width:' + (Q.idx / Q.serie.length * 100) + '%"></i></div>' +
        '<div class="q-meta">' +
          '<span class="badge acc">Ch. ' + q.ch + ' — ' + (Q.chapters[q.ch] || '') + '</span>' +
          '<span class="badge b' + (q.d || 1) + '">' + dl + '</span>' +
        '</div>' +
        '<div class="q-text">' + q.q + '</div>' +
        '<div class="q-opts" id="q-opts"></div>' +
        '<div id="q-feedback"></div>' +
        '<div class="q-actions">' + actions + '</div>' +
      '</div>';

    var $ = function (id) { return document.getElementById(id); };
    $('q-quit').onclick = Q.mode === 'exam' ? function () {
      if (confirm('Terminer l’examen maintenant ? Les questions sans réponse comptent comme fausses.')) finish(true);
    } : quit;

    if (Q.mode === 'cards') {
      $('q-reveal').onclick = revealCard;
      $('q-knew').onclick = function () { rateCard(true); };
      $('q-again').onclick = function () { rateCard(false); };
    } else {
      var box = $('q-opts');
      Q.order.forEach(function (orig, pos) {
        var lab = el('label', 'opt');
        lab.dataset.idx = orig;
        lab.innerHTML = '<input type="' + (Q.mono ? 'radio" name="q-opt' : 'checkbox') + '" value="' + orig + '">' +
          '<span><b>' + LETTERS[pos] + '.</b> ' + q.o[orig] + '</span>';
        lab.querySelector('input').addEventListener('change', syncOpts);
        box.appendChild(lab);
      });
      $('q-validate').onclick = validate;
      $('q-next').onclick = next;
      if ($('q-skipq')) $('q-skipq').onclick = function () { recordExam([]); };
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function syncOpts() {
    /* En mode radio, le navigateur décoche l'autre choix sans émettre d'événement. */
    var box = document.getElementById('q-opts');
    box.querySelectorAll('.opt').forEach(function (o) { o.classList.toggle('sel', o.querySelector('input').checked); });
    var v = document.getElementById('q-validate');
    if (v) v.disabled = box.querySelectorAll('input:checked').length === 0;
  }

  function selection() {
    var sel = [];
    document.querySelectorAll('#q-opts input:checked').forEach(function (i) { sel.push(parseInt(i.value, 10)); });
    return sel;
  }

  function validate() {
    if (Q.validated) return;
    var q = Q.serie[Q.idx], sel = selection();
    if (!sel.length) return;
    if (Q.mode === 'exam') return recordExam(sel);
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
      '<div class="expl"><b>Explication.</b> ' + q.e + '</div>' + (ok ? '' : lienFiche(q));
    document.getElementById('q-pct').textContent = Math.round(Q.correct / Q.answered * 100) + ' %';
    document.getElementById('q-validate').classList.add('hidden');
    document.getElementById('q-next').classList.remove('hidden');
    document.getElementById('q-next').focus();
  }

  /* Examen : la réponse est enregistrée sans être corrigée, puis on enchaîne. */
  function recordExam(sel) {
    var q = Q.serie[Q.idx], ok = sel.length > 0 && sameSet(sel, q.a);
    Q.exam.reponses.push({ q: q, sel: sel, ok: ok });
    Q.answered++;
    if (ok) Q.correct++; else Q.wrongIds.push(q.id);
    if (sel.length) persist(q.id, ok);
    next();
  }

  function revealCard() {
    var q = Q.serie[Q.idx];
    Q.validated = true;
    document.getElementById('q-feedback').innerHTML =
      '<div class="verdict good">Réponse</div>' +
      '<ul class="card-rep">' + q.a.map(function (i) { return '<li>' + q.o[i] + '</li>'; }).join('') + '</ul>' +
      '<div class="expl"><b>Explication.</b> ' + q.e + '</div>' + lienFiche(q);
    document.getElementById('q-reveal').classList.add('hidden');
    document.getElementById('q-knew').classList.remove('hidden');
    document.getElementById('q-again').classList.remove('hidden');
    document.getElementById('q-knew').focus();
  }
  function rateCard(ok) {
    var q = Q.serie[Q.idx];
    Q.answered++;
    if (ok) Q.correct++; else Q.wrongIds.push(q.id);
    persist(q.id, ok);
    next();
  }

  function next() {
    Q.idx++;
    if (Q.idx >= Q.serie.length) return finish(Q.mode === 'exam');
    renderQuestion();
  }

  /* ---------- Fin de série ---------- */
  function finish(exam) {
    stopTimer();
    var total = Q.serie.length;
    var pct = Math.round(Q.correct / total * 100);
    var cls = pct >= 80 ? 'good' : (pct >= 60 ? 'mid' : 'bad');
    var msg = pct >= 90 ? 'Niveau examen atteint. Attaque les questions « Expert » et les autres chapitres.'
      : pct >= 75 ? 'Bonne maîtrise. Reprends les questions ratées puis refais une série complète.'
      : pct >= 50 ? 'Base acquise mais fragile : relis les chapitres concernés avant de rejouer.'
      : 'Relis le cours en entier sur ce périmètre, le QCM ne suffira pas.';

    var revue = '';
    if (exam && Q.exam) {
      var faites = Q.exam.reponses.length;
      /* Questions jamais atteintes (temps écoulé) : comptées fausses, sans être enregistrées. */
      Q.serie.slice(faites).forEach(function (q) { Q.exam.reponses.push({ q: q, sel: [], ok: false }); });
      revue = '<h3 class="rev-t">Correction</h3>' + Q.exam.reponses.map(function (r, k) {
        var q = r.q;
        var votre = r.sel.length ? r.sel.map(function (i) { return q.o[i]; }).join(' · ') : '<i>sans réponse</i>';
        return '<div class="qcm-panel rev ' + (r.ok ? 'ok' : 'ko') + '">' +
          '<div class="rev-h">' + (r.ok ? '✔' : '✘') + ' ' + (k + 1) + '. ' + q.q + '</div>' +
          (r.ok ? '' : '<div class="rev-l"><b>Votre réponse :</b> ' + votre + '</div>') +
          '<div class="rev-l"><b>Bonne réponse :</b> ' + q.a.map(function (i) { return q.o[i]; }).join(' · ') + '</div>' +
          '<div class="expl"><b>Explication.</b> ' + q.e + '</div>' + (r.ok ? '' : lienFiche(q)) +
        '</div>';
      }).join('');
    }

    document.getElementById('qcm-run').classList.add('hidden');
    var end = document.getElementById('qcm-end');
    end.classList.remove('hidden');
    end.innerHTML =
      '<div class="qcm-panel score-box">' +
        (exam ? '<p class="rev-mode">Examen blanc</p>' : '') +
        '<div class="big ' + cls + '">' + pct + ' %</div>' +
        '<p><b>' + Q.correct + ' / ' + total + '</b> ' + (Q.mode === 'cards' ? 'cartes sues' : 'bonnes réponses') + '</p>' +
        '<p style="color:var(--fg-soft)">' + msg + '</p>' +
        (Q.wrongIds.length ? '<p style="font-size:.85rem;color:var(--fg-mute)">' + Q.wrongIds.length +
          ' question(s) ajoutée(s) à la liste « à revoir ».</p>' : '') +
        '<div class="q-actions" style="justify-content:center">' +
          '<button class="btn primary" id="e-smart">Révision intelligente</button>' +
          '<button class="btn" id="e-wrong">Rejouer mes erreurs</button>' +
          '<button class="btn" id="e-again">Retour aux réglages</button>' +
        '</div>' +
      '</div>' + revue;
    document.getElementById('e-smart').onclick = function () { start('smart'); };
    document.getElementById('e-wrong').onclick = function () { start('wrong'); };
    document.getElementById('e-again').onclick = quit;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ---------- Revoir dans la fiche, puis revenir au QCM ---------- */
  var retourQcm = null;
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-revoir]');
    if (!a) return;
    e.preventDefault();
    var cible = a.getAttribute('data-revoir');
    for (var i = 0; i < SECTIONS.length; i++) {
      if (SECTIONS[i].el.querySelector('#qcm')) retourQcm = i;
    }
    for (var k = 0; k < SECTIONS.length; k++) {
      if (SECTIONS[k].el.querySelector('#' + cible)) { showSection(k, cible); break; }
    }
    var b = document.getElementById('back-qcm');
    if (!b) {
      b = el('button', 'btn primary back-qcm', '↩ Retour au QCM');
      b.id = 'back-qcm';
      b.onclick = function () { if (retourQcm !== null) showSection(retourQcm); b.remove(); };
      document.body.appendChild(b);
    }
  });

  /* ---------- Clavier ---------- */
  document.addEventListener('keydown', function (e) {
    var run = document.getElementById('qcm-run');
    if (!run || run.classList.contains('hidden')) return;
    var act = document.activeElement;
    if (act && (act.tagName === 'INPUT' && act.type !== 'radio' && act.type !== 'checkbox' || act.tagName === 'SELECT' || act.tagName === 'TEXTAREA')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key.toLowerCase();

    if (Q.mode === 'cards') {
      if (!Q.validated && (k === 'enter' || k === ' ')) { e.preventDefault(); revealCard(); }
      else if (Q.validated && k === '1') { e.preventDefault(); rateCard(true); }
      else if (Q.validated && k === '2') { e.preventDefault(); rateCard(false); }
      return;
    }
    if (k === 'enter') {
      e.preventDefault();
      if (!Q.validated) { var v = document.getElementById('q-validate'); if (v && !v.disabled) validate(); }
      else next();
      return;
    }
    /* 1-4 ou A-D : coche la proposition affichée à cette position. */
    var pos = '1234'.indexOf(k) !== -1 ? '1234'.indexOf(k) : 'abcd'.indexOf(k);
    if (pos === -1 || Q.validated) return;
    var opt = document.querySelectorAll('#q-opts .opt input')[pos];
    if (!opt) return;
    e.preventDefault();
    opt.checked = Q.mono ? true : !opt.checked;
    syncOpts();
  });

  /* ================= Menu des chapitres sur écran étroit =================
     Sous 1080 px, la barre latérale est masquée : un bouton « ☰ Chapitres » l'ouvre
     en tiroir, fermé par un choix, un clic à côté ou Échap. */
  function setupDrawer() {
    var side = document.querySelector('.sidebar'), bar = document.querySelector('.topbar');
    if (!side || !bar || !SECTIONS.length) return;
    var b = el('button', 'btn ghost toc-toggle', '☰ Chapitres');
    b.setAttribute('aria-label', 'Afficher les chapitres');
    b.onclick = function (e) { e.stopPropagation(); document.body.classList.toggle('toc-open'); };
    bar.insertBefore(b, bar.children[1] || null);
    var fond = el('div', 'toc-fond');
    fond.onclick = function () { document.body.classList.remove('toc-open'); };
    document.body.appendChild(fond);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.body.classList.remove('toc-open');
    });
  }

  /* ================= Init ================= */
  document.addEventListener('DOMContentLoaded', function () {
    /* Le mode onglets ne s'applique qu'aux pages de cours, reconnaissables à leur
       conteneur de menu #toc. La page d'accueil reste une page simple et défilante. */
    if (document.getElementById('toc')) buildSections();
    if (SECTIONS.length) {
      buildMenu();
      setupDrawer();
      var side = document.querySelector('.sidebar');
      if (side) {
        var p = el('div', 'read-progress');
        p.innerHTML = '<div class="progress"><i id="read-bar"></i></div><small id="read-lab"></small>';
        side.insertBefore(p, side.firstChild);
      }
      /* Le nombre total de chapitres permet à l'accueil d'afficher « 8 / 17 lus ». */
      localStorage.setItem('majcyb.secs.' + PAGE, String(SECTIONS.length));
      openFromHash();
      paintProgress();
    }
    setupPicks();
    setupSearch();
    setupTop();
    window.addEventListener('hashchange', openFromHash);
  });
})();
