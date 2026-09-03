/* ============================================================
   Scènes d'attaque — moteur d'animation SVG
   ------------------------------------------------------------
   Une « scène » montre CE QUI CIRCULE ENTRE LES ACTEURS : des
   machines, des commutateurs, des serveurs, et des paquets qui
   se déplacent réellement de l'un à l'autre, étape par étape.

   Utilisation dans une page :
       <div class="scene" data-scene="vlan-dtp"></div>
   et, dans un fichier de données chargé avant ce script :
       window.SCENES = { 'vlan-dtp': { ...spec... } };

   Le rendu reste lisible sans JavaScript et à l'impression :
   la liste des étapes est du texte, la scène n'est qu'un plus.
   ============================================================ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function svg(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, cls, anchor) {
    var t = svg('text', { x: x, y: y, 'class': cls, 'text-anchor': anchor || 'middle' }, parent);
    t.textContent = s;
    return t;
  }

  /* ---------- Icônes : dessinées à la main dans une boîte 26 × 26 ----------
     Pas d'emoji : ils changent de forme d'un système à l'autre et rendent mal
     en impression. Ces formes-là sont identiques partout. */
  function icon(parent, kind, x, y) {
    var g = svg('g', { transform: 'translate(' + x + ',' + y + ')', 'class': 'ico' }, parent);
    switch (kind) {
      case 'switch':
        svg('rect', { x: 0, y: 6, width: 26, height: 14, rx: 2, 'class': 'ico-body' }, g);
        for (var i = 0; i < 4; i++) svg('rect', { x: 3 + i * 5.6, y: 15, width: 3.4, height: 3, 'class': 'ico-port' }, g);
        svg('path', { d: 'M5 11 h9 m-3 -2.5 l3 2.5 l-3 2.5', 'class': 'ico-line' }, g);
        svg('path', { d: 'M21 11 h-9 m3 -2.5 l-3 2.5 l3 2.5', 'class': 'ico-line' }, g);
        break;
      case 'router':
        svg('circle', { cx: 13, cy: 13, r: 10, 'class': 'ico-body' }, g);
        svg('path', { d: 'M7 10 h12 m-3 -2.5 l3 2.5 l-3 2.5 M19 16 h-12 m3 -2.5 l-3 2.5 l3 2.5', 'class': 'ico-line' }, g);
        break;
      case 'server':
        svg('rect', { x: 3, y: 2, width: 20, height: 7, rx: 1.5, 'class': 'ico-body' }, g);
        svg('rect', { x: 3, y: 10.5, width: 20, height: 7, rx: 1.5, 'class': 'ico-body' }, g);
        svg('rect', { x: 3, y: 19, width: 20, height: 5, rx: 1.5, 'class': 'ico-body' }, g);
        svg('circle', { cx: 7, cy: 5.5, r: 1.3, 'class': 'ico-led' }, g);
        svg('circle', { cx: 7, cy: 14, r: 1.3, 'class': 'ico-led' }, g);
        break;
      case 'cloud':
        svg('path', { d: 'M6 20 a5.5 5.5 0 0 1 .6 -11 a7 7 0 0 1 13 1.6 a4.7 4.7 0 0 1 -.6 9.4 z', 'class': 'ico-body' }, g);
        break;
      case 'firewall':
        svg('rect', { x: 1, y: 4, width: 24, height: 18, rx: 2, 'class': 'ico-body' }, g);
        svg('path', { d: 'M1 10 h24 M1 16 h24 M9 4 v6 M17 4 v6 M5 10 v6 M13 10 v6 M21 10 v6 M9 16 v6 M17 16 v6', 'class': 'ico-line' }, g);
        break;
      case 'attacker':
        svg('rect', { x: 1, y: 3, width: 24, height: 15, rx: 2, 'class': 'ico-body' }, g);
        svg('path', { d: 'M10 18 h6 l1.5 5 h-9 z', 'class': 'ico-body' }, g);
        svg('path', { d: 'M8 8 l4 4 m0 -4 l-4 4 M14 8 l4 4 m0 -4 l-4 4', 'class': 'ico-line' }, g);
        break;
      case 'phone':
        svg('rect', { x: 6, y: 1, width: 14, height: 24, rx: 2.5, 'class': 'ico-body' }, g);
        svg('path', { d: 'M10.5 4 h5', 'class': 'ico-line' }, g);
        svg('circle', { cx: 13, cy: 21.5, r: 1.4, 'class': 'ico-led' }, g);
        break;
      case 'wall':
        svg('rect', { x: 11, y: 0, width: 4, height: 26, rx: 1, 'class': 'ico-body' }, g);
        break;
      case 'lock':
        svg('rect', { x: 5, y: 11, width: 16, height: 13, rx: 2, 'class': 'ico-body' }, g);
        svg('path', { d: 'M9 11 v-3.5 a4 4 0 0 1 8 0 V11', 'class': 'ico-line' }, g);
        break;
      default: /* host / victim / pc */
        svg('rect', { x: 1, y: 3, width: 24, height: 15, rx: 2, 'class': 'ico-body' }, g);
        svg('path', { d: 'M10 18 h6 l1.5 5 h-9 z', 'class': 'ico-body' }, g);
        svg('path', { d: 'M5 7 h10 M5 10 h14 M5 13 h7', 'class': 'ico-line' }, g);
    }
    return g;
  }

  /* ---------- Géométrie ---------- */
  function centre(n) { return { x: n.x + n.w / 2, y: n.y + n.h / 2 }; }

  /* Point où le trait quitte la boîte, en direction de (tx,ty) : on coupe le
     rectangle plutôt que de partir du centre, sinon le trait passe sous l'icône. */
  function bord(n, tx, ty) {
    var c = centre(n), dx = tx - c.x, dy = ty - c.y;
    if (!dx && !dy) return c;
    var sx = dx ? (n.w / 2 + 6) / Math.abs(dx) : Infinity;
    var sy = dy ? (n.h / 2 + 6) / Math.abs(dy) : Infinity;
    var s = Math.min(sx, sy);
    return { x: c.x + dx * s, y: c.y + dy * s };
  }

  /* ---------- Construction d'une scène ---------- */
  function build(box, spec) {
    var byId = {};
    spec.nodes.forEach(function (n) {
      n.w = n.w || 152; n.h = n.h || 80;
      byId[n.id] = n;
    });

    box.classList.add('scene');
    box.innerHTML = '';

    if (spec.title) {
      var h = document.createElement('div');
      h.className = 'scene-title';
      var kind = spec.kind || 'Attaque';
      h.innerHTML = '<span class="scene-kind' + (kind === 'Attaque' ? '' : ' ctrl') + '">' + kind + '</span> ' + spec.title;
      box.appendChild(h);
    }

    var stage = document.createElement('div');
    stage.className = 'scene-stage';
    box.appendChild(stage);

    var W = spec.w || 900, H = spec.h || 320;
    var root = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, 'class': 'scene-svg', role: 'img' }, stage);
    if (spec.title) { var ttl = svg('title', {}, root); ttl.textContent = spec.title; }

    var gLinks = svg('g', { 'class': 'g-links' }, root);
    var gNodes = svg('g', { 'class': 'g-nodes' }, root);
    var gPkts = svg('g', { 'class': 'g-pkts' }, root);

    /* --- liens --- */
    var linkEls = {};
    (spec.links || []).forEach(function (l) {
      var a = byId[l.from], b = byId[l.to];
      if (!a || !b) return;
      var ca = centre(a), cb = centre(b);
      var pa = bord(a, cb.x, cb.y), pb = bord(b, ca.x, ca.y);
      l._a = pa; l._b = pb;
      var g = svg('g', { 'class': 'link k-' + (l.kind || 'net') }, gLinks);
      svg('line', { x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, 'class': 'link-wire' }, g);
      if (l.label) {
        var mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
        var lw = l.label.length * 5.6 + 14;
        svg('rect', { x: mx - lw / 2, y: my - 9 + (l.dy || 0), width: lw, height: 17, rx: 8, 'class': 'link-tagbg' }, g);
        txt(g, mx, my + 3.5 + (l.dy || 0), l.label, 'link-tag');
      }
      linkEls[l.id] = { g: g, spec: l };
    });

    /* --- nœuds --- */
    var nodeEls = {};
    spec.nodes.forEach(function (n) {
      var g = svg('g', { 'class': 'node k-' + (n.kind || 'host') }, gNodes);
      svg('rect', { x: n.x, y: n.y, width: n.w, height: n.h, rx: 11, 'class': 'node-box' }, g);
      var cx = n.x + n.w / 2;
      icon(g, n.kind, cx - 13, n.y + 9);
      txt(g, cx, n.y + 52, n.label, 'node-label');
      var subs = n.sub ? (Array.isArray(n.sub) ? n.sub : [n.sub]) : [];
      subs.forEach(function (s, i) { txt(g, cx, n.y + 66 + i * 12, s, 'node-sub'); });
      /* pastille d'état, réécrite par les étapes */
      var bg = svg('g', { 'class': 'node-badge hidden' }, g);
      var br = svg('rect', { x: 0, y: 0, width: 10, height: 18, rx: 9, 'class': 'badge-box' }, bg);
      var bt = txt(bg, 0, 0, '', 'badge-txt');
      nodeEls[n.id] = { g: g, spec: n, badge: bg, badgeRect: br, badgeTxt: bt };
    });

    function setBadge(id, s) {
      var e = nodeEls[id]; if (!e) return;
      if (!s) { e.badge.classList.add('hidden'); return; }
      var n = e.spec, cx = n.x + n.w / 2;
      var w = String(s).length * 6.2 + 16;
      e.badge.classList.remove('hidden');
      e.badgeRect.setAttribute('x', cx - w / 2);
      e.badgeRect.setAttribute('y', n.y - 12);
      e.badgeRect.setAttribute('width', w);
      e.badgeTxt.setAttribute('x', cx);
      e.badgeTxt.setAttribute('y', n.y + 1);
      e.badgeTxt.textContent = s;
    }

    /* --- panneau latéral (table CAM, cache DNS, bail DHCP…) --- */
    var panelEl = null;
    if (spec.panel) {
      var p = spec.panel;
      var pg = svg('g', { 'class': 'panel' }, root);
      svg('rect', { x: p.x, y: p.y, width: p.w, height: p.h, rx: 10, 'class': 'panel-box' }, pg);
      txt(pg, p.x + 12, p.y + 20, p.title, 'panel-title', 'start');
      svg('line', { x1: p.x + 10, y1: p.y + 28, x2: p.x + p.w - 10, y2: p.y + 28, 'class': 'panel-sep' }, pg);
      var rows = svg('g', {}, pg);
      panelEl = { spec: p, rows: rows };
    }
    function setPanel(list) {
      if (!panelEl) return;
      var p = panelEl.spec;
      while (panelEl.rows.firstChild) panelEl.rows.removeChild(panelEl.rows.firstChild);
      (list || p.rows || []).forEach(function (r, i) {
        var s = typeof r === 'string' ? { t: r } : r;
        var y = p.y + 46 + i * 17;
        if (y > p.y + p.h - 6) return;
        if (s.s) svg('rect', { x: p.x + 7, y: y - 12, width: p.w - 14, height: 16, rx: 4, 'class': 'panel-hl s-' + s.s }, panelEl.rows);
        var t = txt(panelEl.rows, p.x + 12, y, s.t, 'panel-row' + (s.s ? ' s-' + s.s : ''), 'start');
        t.setAttribute('xml:space', 'preserve');
      });
    }

    /* ---------- Barre de commande ---------- */
    var bar = document.createElement('div');
    bar.className = 'scene-bar';
    bar.innerHTML =
      '<button class="btn primary sc-play">▶ Lancer</button>' +
      '<button class="btn ghost sc-prev" title="Étape précédente">◀</button>' +
      '<button class="btn ghost sc-next" title="Étape suivante">▶</button>' +
      '<button class="btn ghost sc-reset" title="Revenir au début">↻</button>' +
      '<span class="sc-pos"></span>';
    box.appendChild(bar);

    /* ---------- Journal : le texte, qui reste la source de vérité ---------- */
    var log = document.createElement('ol');
    log.className = 'scene-log';
    spec.steps.forEach(function (s, i) {
      var li = document.createElement('li');
      li.className = 'scene-step' + (s.tone ? ' t-' + s.tone : '');
      li.innerHTML = '<b>' + (s.title || 'Étape ' + (i + 1)) + '</b> ' + (s.text || '');
      li.tabIndex = 0;
      li.addEventListener('click', function () { stop(); goto(i, true); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stop(); goto(i, true); } });
      log.appendChild(li);
    });
    box.appendChild(log);

    /* ---------- Moteur ---------- */
    var cur = -1, playing = false, timer = null, raf = [], N = spec.steps.length;
    var elPlay = bar.querySelector('.sc-play'), elPos = bar.querySelector('.sc-pos');

    function clearPkts() {
      raf.forEach(cancelAnimationFrame); raf = [];
      while (gPkts.firstChild) gPkts.removeChild(gPkts.firstChild);
    }

    /* L'état est recalculé depuis le début à chaque saut : jamais de dérive,
       on peut cliquer n'importe quelle étape et obtenir exactement son état. */
    function applyState(upTo) {
      Object.keys(nodeEls).forEach(function (k) {
        nodeEls[k].g.setAttribute('class', 'node k-' + (nodeEls[k].spec.kind || 'host'));
        setBadge(k, null);
      });
      Object.keys(linkEls).forEach(function (k) {
        linkEls[k].g.setAttribute('class', 'link k-' + (linkEls[k].spec.kind || 'net'));
      });
      var pan = null;
      /* On tolère « evil » comme « s-evil » : la donnée reste lisible des deux façons. */
      function st8(v) { return 's-' + String(v).replace(/^s-/, ''); }
      for (var i = 0; i <= upTo; i++) {
        var st = spec.steps[i]; if (!st) continue;
        var set = st.set || {};
        if (set.nodes) Object.keys(set.nodes).forEach(function (k) {
          if (nodeEls[k]) nodeEls[k].g.setAttribute('class', 'node k-' + (nodeEls[k].spec.kind || 'host') + ' ' + st8(set.nodes[k]));
        });
        if (set.links) Object.keys(set.links).forEach(function (k) {
          if (linkEls[k]) linkEls[k].g.setAttribute('class', 'link k-' + (linkEls[k].spec.kind || 'net') + ' ' + st8(set.links[k]));
        });
        if (set.badges) Object.keys(set.badges).forEach(function (k) { setBadge(k, set.badges[k]); });
        if (st.panel) pan = st.panel;
      }
      setPanel(pan);
    }

    /* Un paquet : une étiquette qui se déplace réellement le long du lien.
       `path` permet de traverser plusieurs équipements d'affilée, en changeant
       de libellé à chaque saut — c'est ce qui rend le double étiquetage lisible. */
    function launch(pk) {
      var hops = [];
      if (pk.path) {
        for (var i = 0; i < pk.path.length - 1; i++) {
          var a = byId[pk.path[i]], b = byId[pk.path[i + 1]];
          if (!a || !b) return;
          var ca = centre(a), cb = centre(b);
          hops.push({ a: bord(a, cb.x, cb.y), b: bord(b, ca.x, ca.y), label: (pk.labels && pk.labels[i]) || pk.label, kind: (pk.kinds && pk.kinds[i]) || pk.kind });
        }
      } else {
        var l = linkEls[pk.link]; if (!l) return;
        var A = l.spec._a, B = l.spec._b;
        if (pk.dir === -1) { var t = A; A = B; B = t; }
        hops.push({ a: A, b: B, label: pk.label, kind: pk.kind });
      }

      var g = svg('g', { 'class': 'pkt p-' + (pk.kind || 'data') }, gPkts);
      var w = Math.max(34, String(hops[0].label || '').length * 6.4 + 16);
      var r = svg('rect', { x: -w / 2, y: -11, width: w, height: 22, rx: 7, 'class': 'pkt-box' }, g);
      var t = txt(g, 0, 4, hops[0].label || '', 'pkt-txt');
      var dur = pk.dur || 1200, delay = pk.at || 0;
      var per = dur / hops.length;
      g.setAttribute('opacity', '0');

      if (REDUCE) {
        var last = hops[hops.length - 1];
        g.setAttribute('opacity', '1');
        g.setAttribute('transform', 'translate(' + last.b.x + ',' + last.b.y + ')');
        t.textContent = last.label || '';
        return;
      }

      var t0 = null;
      function next() { raf.push(requestAnimationFrame(frame)); }
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var e = ts - t0;
        if (e < delay) { next(); return; }
        var el = e - delay;
        var k = Math.min(hops.length - 1, Math.floor(el / per));
        var u = Math.min(1, (el - k * per) / per);
        var hop = hops[k];
        if (t.textContent !== (hop.label || '')) {
          t.textContent = hop.label || '';
          var nw = Math.max(34, String(hop.label || '').length * 6.4 + 16);
          r.setAttribute('x', -nw / 2); r.setAttribute('width', nw);
          if (hop.kind) g.setAttribute('class', 'pkt p-' + hop.kind);
        }
        var x = hop.a.x + (hop.b.x - hop.a.x) * u;
        var y = hop.a.y + (hop.b.y - hop.a.y) * u;
        g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
        var total = el / (per * hops.length);
        g.setAttribute('opacity', total < .08 ? String(total / .08) : (total > .93 && !pk.stay ? String((1 - total) / .07) : '1'));
        if (total < 1) { next(); }
        else if (pk.stay) { g.setAttribute('opacity', '1'); }
        else { g.parentNode && g.parentNode.removeChild(g); }
      }
      next();
    }

    function duration(st) {
      var d = st.dur || 0;
      (st.packets || []).forEach(function (p) { d = Math.max(d, (p.at || 0) + (p.dur || 1200) + 420); });
      return d || 1900;
    }

    function goto(i, animate) {
      clearPkts();
      cur = Math.max(0, Math.min(N - 1, i));
      applyState(cur);
      var items = log.querySelectorAll('.scene-step');
      items.forEach(function (li, k) {
        li.classList.toggle('now', k === cur);
        li.classList.toggle('done', k < cur);
      });
      elPos.textContent = (cur + 1) + ' / ' + N;
      var st = spec.steps[cur];
      if (animate !== false) (st.packets || []).forEach(launch);
      if (items[cur] && document.activeElement !== items[cur]) {
        var lr = log.getBoundingClientRect(), ir = items[cur].getBoundingClientRect();
        if (ir.top < lr.top || ir.bottom > lr.bottom) items[cur].scrollIntoView({ block: 'nearest' });
      }
    }

    function tick() {
      goto(cur + 1, true);
      if (cur >= N - 1) { stop(); return; }
      timer = setTimeout(tick, duration(spec.steps[cur]));
    }
    function play() {
      if (playing) { stop(); return; }
      playing = true; elPlay.textContent = '⏸ Pause'; elPlay.classList.add('on');
      if (cur >= N - 1) cur = -1;
      tick();
    }
    function stop() {
      playing = false; elPlay.textContent = '▶ Lancer'; elPlay.classList.remove('on');
      clearTimeout(timer); timer = null;
    }

    bar.querySelector('.sc-play').onclick = play;
    bar.querySelector('.sc-prev').onclick = function () { stop(); goto(cur - 1, true); };
    bar.querySelector('.sc-next').onclick = function () { stop(); goto(cur + 1, true); };
    bar.querySelector('.sc-reset').onclick = function () { stop(); clearPkts(); goto(0, false); };

    /* État initial : première étape affichée, rien en mouvement. Le lecteur
       qui n'appuie sur rien voit quand même un schéma complet et légendé. */
    goto(0, false);
    box.dataset.built = '1';
  }

  function buildAll(scope) {
    var reg = window.SCENES || {};
    (scope || document).querySelectorAll('.scene[data-scene]').forEach(function (box) {
      if (box.dataset.built) return;
      var spec = reg[box.dataset.scene];
      if (!spec) { box.innerHTML = '<div class="scene-miss">Scène « ' + box.dataset.scene + ' » introuvable.</div>'; return; }
      try { build(box, spec); }
      catch (err) { box.innerHTML = '<div class="scene-miss">Scène indisponible (' + err.message + ').</div>'; }
    });
  }
  window.buildScenes = buildAll;

  document.addEventListener('DOMContentLoaded', function () { buildAll(document); });
})();
