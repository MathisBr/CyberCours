/* ============================================================
   atelier.js — moteur des trois ateliers INF5244
     1. Restitution   : rappel libre, auto-évalué
     2. Règles        : énoncé généré → règle iptables, corrigée par jetons
     3. Trouve l'erreur : configuration fautive → diagnostic
   Autonome : ne dépend que des données de data/atelier-inf5244.js.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'majcyb.atelier.inf5244';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  var ST = load();
  ST.r = ST.r || {}; ST.e = ST.e || {}; ST.g = ST.g || { ok: 0, ko: 0 };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ================= Onglets ================= */
  window.atlTab = function (name) {
    ['restit', 'regles', 'erreurs'].forEach(function (n) {
      var p = $('atl-' + n), b = $('tab-' + n);
      if (p) p.classList.toggle('hidden', n !== name);
      if (b) b.classList.toggle('primary', n === name);
    });
    localStorage.setItem(KEY + '.tab', name);
  };

  /* ============================================================
     1. RESTITUTION
     ============================================================ */
  var Rq = [], Ri = 0;

  function restitStart(onlyTodo) {
    var pool = window.ATL_RESTIT.slice();
    if (onlyTodo) {
      pool = pool.filter(function (x) { return ST.r[x.id] !== 'ok'; });
      if (!pool.length) { alert('Toutes les listes sont marquées « sue ». Utilisez « Tout rejouer » pour repartir de zéro.'); return; }
    }
    Rq = shuffle(pool); Ri = 0;
    $('r-setup').classList.add('hidden');
    $('r-run').classList.remove('hidden');
    restitRender();
  }

  function restitRender() {
    if (Ri >= Rq.length) { restitEnd(); return; }
    var q = Rq[Ri];
    $('r-run').innerHTML =
      '<div class="atl-card">' +
        '<div class="atl-top"><span class="atl-pos">' + (Ri + 1) + ' / ' + Rq.length + '</span>' +
        '<span class="badge b2">chapitre ' + q.ch + '</span></div>' +
        '<h3 class="atl-q">' + q.q + '</h3>' +
        '<p class="atl-hint">Écris la liste de mémoire, <b>puis</b> révèle. Le but est de produire, pas de reconnaître.</p>' +
        '<textarea id="r-input" rows="' + Math.max(4, q.a.length) + '" placeholder="1.&#10;2.&#10;3."></textarea>' +
        '<div class="qactions"><button class="btn primary" id="r-show">Révéler la correction</button>' +
        '<button class="btn ghost" id="r-skip">Passer</button></div>' +
        '<div id="r-corr"></div>' +
      '</div>';
    $('r-show').onclick = restitReveal;
    $('r-skip').onclick = function () { Ri++; restitRender(); };
    var ta = $('r-input'); if (ta) ta.focus();
  }

  function restitReveal() {
    var q = Rq[Ri];
    var mine = ($('r-input').value || '').trim();
    var html = '<div class="atl-corr">' +
      '<div class="t">La réponse attendue — ' + q.a.length + ' élément' + (q.a.length > 1 ? 's' : '') + '</div>' +
      '<ol class="atl-list">' + q.a.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' +
      (q.note ? '<p class="atl-note">' + q.note + '</p>' : '') +
      (mine ? '<div class="t" style="margin-top:12px">Ce que tu as écrit</div><pre class="atl-mine">' + esc(mine) + '</pre>' : '') +
      '<div class="atl-self"><b>Auto-évaluation honnête :</b> avais-tu tous les éléments, sans les avoir lus&nbsp;?' +
      '<div class="qactions">' +
      '<button class="btn primary" id="r-ok">Je savais</button>' +
      '<button class="btn" id="r-half">Partiellement</button>' +
      '<button class="btn ghost" id="r-ko">À revoir</button></div></div></div>';
    $('r-corr').innerHTML = html;
    $('r-show').disabled = true;
    function mark(v) { ST.r[q.id] = v; save(ST); Ri++; restitRender(); }
    $('r-ok').onclick = function () { mark('ok'); };
    $('r-half').onclick = function () { mark('half'); };
    $('r-ko').onclick = function () { mark('ko'); };
  }

  function restitEnd() {
    var all = window.ATL_RESTIT.length, ok = 0, half = 0, ko = 0;
    window.ATL_RESTIT.forEach(function (x) {
      if (ST.r[x.id] === 'ok') ok++; else if (ST.r[x.id] === 'half') half++; else if (ST.r[x.id] === 'ko') ko++;
    });
    $('r-run').innerHTML =
      '<div class="atl-card"><h3>Série terminée</h3>' +
      '<div class="atl-score"><span class="s-ok">' + ok + ' sue' + (ok > 1 ? 's' : '') + '</span>' +
      '<span class="s-half">' + half + ' partielle' + (half > 1 ? 's' : '') + '</span>' +
      '<span class="s-ko">' + ko + ' à revoir</span>' +
      '<span class="s-mute">sur ' + all + '</span></div>' +
      '<div class="qactions"><button class="btn primary" id="r-again">Rejouer ce qui n\'est pas acquis</button>' +
      '<button class="btn ghost" id="r-back">Retour</button></div></div>';
    $('r-again').onclick = function () { restitStart(true); };
    $('r-back').onclick = function () { $('r-run').classList.add('hidden'); $('r-setup').classList.remove('hidden'); restitSetup(); };
  }

  function restitSetup() {
    var all = window.ATL_RESTIT.length, todo = 0;
    window.ATL_RESTIT.forEach(function (x) { if (ST.r[x.id] !== 'ok') todo++; });
    $('r-setup').innerHTML =
      '<div class="atl-card"><h3>Restitution — ' + all + ' listes</h3>' +
      '<p>Le QCM entraîne la <b>reconnaissance</b>. Ici on travaille le <b>rappel</b>&nbsp;: ' +
      'produire la liste sur une page blanche, comme à l\'examen.</p>' +
      '<div class="qactions">' +
      '<button class="btn primary" id="r-start">Commencer (' + all + ')</button>' +
      '<button class="btn" id="r-todo">Non acquises (' + todo + ')</button>' +
      '<button class="btn ghost" id="r-reset">Réinitialiser</button></div></div>';
    $('r-start').onclick = function () { restitStart(false); };
    $('r-todo').onclick = function () { restitStart(true); };
    $('r-reset').onclick = function () {
      if (confirm('Effacer la progression de la restitution ?')) { ST.r = {}; save(ST); restitSetup(); }
    };
  }

  /* ============================================================
     2. ÉCRITURE DE RÈGLES
     ============================================================ */
  var Gex = null;

  /* Vérifie la présence d'un couple option/valeur dans une ligne. */
  function findOpt(line, opt) {
    var re = new RegExp('(^|\\s)' + opt.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\s+(\\S+)');
    var m = line.match(re);
    return m ? m[2] : null;
  }

  function checkLine(line, need) {
    line = ' ' + line.toLowerCase().replace(/\s+/g, ' ').trim() + ' ';
    var miss = [], wrong = [], good = 0;
    need.forEach(function (p) {
      var got = findOpt(line, p[0]);
      if (got === null) miss.push(p);
      else if (got.replace(/["']/g, '') !== String(p[1]).toLowerCase()) wrong.push([p[0], got, p[1]]);
      else good++;
    });
    return { miss: miss, wrong: wrong, good: good, total: need.length };
  }

  /* ---- générateurs d'exercices ---- */
  function gTransitStateless() {
    var s = pick(window.ATL_SERVICES), ifs = pick(window.ATL_IFACES), n = pick(window.ATL_NETS);
    return {
      titre: 'Flux en transit — pare-feu SANS état',
      enonce: 'Le poste <b>' + n.cli + '</b> (interface <code>' + ifs[0] + '</code>) doit joindre le service <b>' +
        s.n + '</b> du serveur <b>' + n.srv + '</b> (interface <code>' + ifs[1] + '</code>). Le pare-feu n\'a <b>aucun suivi de connexion</b>.',
      consigne: 'Écris les <b>deux</b> règles, une par ligne : l\'aller puis le retour.',
      lignes: 2,
      sol: [
        'iptables -A FORWARD -i ' + ifs[0] + ' -o ' + ifs[1] + ' -s ' + n.cli + ' -d ' + n.srv + ' -p ' + s.p + ' --sport 1024: --dport ' + s.port + ' -j ACCEPT',
        'iptables -A FORWARD -i ' + ifs[1] + ' -o ' + ifs[0] + ' -s ' + n.srv + ' -d ' + n.cli + ' -p ' + s.p + ' --sport ' + s.port + ' --dport 1024: -j ACCEPT'
      ],
      need: [
        [['-a', 'forward'], ['-i', ifs[0]], ['-o', ifs[1]], ['-s', n.cli], ['-d', n.srv], ['-p', s.p], ['--dport', s.port], ['-j', 'accept']],
        [['-a', 'forward'], ['-i', ifs[1]], ['-o', ifs[0]], ['-s', n.srv], ['-d', n.cli], ['-p', s.p], ['--sport', s.port], ['-j', 'accept']]
      ],
      cle: 'Les <b>trois inversions</b> : interfaces, adresses, ports. En oublier une seule et le retour meurt dans le <code>DROP</code>.'
    };
  }

  function gTransitStateful() {
    var s = pick(window.ATL_SERVICES), ifs = pick(window.ATL_IFACES), n = pick(window.ATL_NETS);
    return {
      titre: 'Flux en transit — pare-feu À ÉTAT',
      enonce: 'Même besoin : <b>' + n.cli + '</b> (<code>' + ifs[0] + '</code>) vers le service <b>' + s.n +
        '</b> de <b>' + n.srv + '</b> (<code>' + ifs[1] + '</code>). Cette fois la règle <code>ESTABLISHED,RELATED</code> est <b>déjà en tête de chaîne</b>.',
      consigne: 'Une <b>seule</b> ligne : uniquement le sens aller, en précisant que c\'est une nouvelle connexion.',
      lignes: 1,
      sol: ['iptables -A FORWARD -i ' + ifs[0] + ' -o ' + ifs[1] + ' -s ' + n.cli + ' -d ' + n.srv + ' -p ' + s.p + ' --dport ' + s.port + ' -m conntrack --ctstate NEW -j ACCEPT'],
      need: [[['-a', 'forward'], ['-i', ifs[0]], ['-o', ifs[1]], ['-s', n.cli], ['-d', n.srv], ['-p', s.p], ['--dport', s.port], ['--ctstate', 'new'], ['-j', 'accept']]],
      cle: 'Avec le suivi d\'état, <b>on supprime toutes les règles de retour</b> : il ne reste qu\'une ligne par flux, dans le sens aller.'
    };
  }

  function gPingLocal() {
    var ifs = pick(window.ATL_IFACES), n = pick(window.ATL_NETS);
    var vers = pick([{ ip: n.srv, i: ifs[1], q: 'le serveur' }, { ip: n.cli, i: ifs[0], q: 'le client' }]);
    return {
      titre: 'Diagnostic depuis le pare-feu',
      enonce: 'Depuis la <b>console du pare-feu</b>, l\'administrateur doit pouvoir pinguer <b>' + vers.q +
        ' ' + vers.ip + '</b> (interface <code>' + vers.i + '</code>). En revanche <b>personne ne doit pouvoir pinguer le pare-feu</b>.',
      consigne: 'Deux lignes : la requête émise, puis la réponse reçue. Attention à la <b>chaîne</b>.',
      lignes: 2,
      sol: [
        'iptables -A OUTPUT -o ' + vers.i + ' -d ' + vers.ip + ' -p icmp --icmp-type echo-request -j ACCEPT',
        'iptables -A INPUT -i ' + vers.i + ' -s ' + vers.ip + ' -p icmp --icmp-type echo-reply -j ACCEPT'
      ],
      need: [
        [['-a', 'output'], ['-o', vers.i], ['-d', vers.ip], ['-p', 'icmp'], ['--icmp-type', 'echo-request'], ['-j', 'accept']],
        [['-a', 'input'], ['-i', vers.i], ['-s', vers.ip], ['-p', 'icmp'], ['--icmp-type', 'echo-reply'], ['-j', 'accept']]
      ],
      cle: 'Un flux <b>généré par le pare-feu</b> ne passe jamais par <code>FORWARD</code>. L\'asymétrie vient de n\'autoriser que le <b>type 8 en sortie</b> et le <b>type 0 en entrée</b>.'
    };
  }

  function gDnat() {
    var s = pick([window.ATL_SERVICES[1], window.ATL_SERVICES[2], window.ATL_SERVICES[0]]);
    var ifs = pick(window.ATL_IFACES), n = pick(window.ATL_NETS);
    var pub = pick(['203.0.113.10', '198.51.100.7', '192.0.2.44']);
    var interne = n.srv, portInterne = pick(['8080', '8443', '2222']);
    return {
      titre: 'Publier un serveur — DNAT avec changement de port',
      enonce: 'Les clients d\'Internet arrivent sur <b>' + pub + ':' + s.port + '</b> (interface <code>' + ifs[0] +
        '</code>). Le serveur réel est en <b>' + interne + '</b> et écoute sur le port <b>' + portInterne +
        '</b> (interface <code>' + ifs[1] + '</code>).',
      consigne: 'Deux lignes : la règle de translation, puis la règle de filtrage correspondante.',
      lignes: 2,
      sol: [
        'iptables -t nat -A PREROUTING -i ' + ifs[0] + ' -p ' + s.p + ' --dport ' + s.port + ' -j DNAT --to-destination ' + interne + ':' + portInterne,
        'iptables -A FORWARD -i ' + ifs[0] + ' -o ' + ifs[1] + ' -d ' + interne + ' -p ' + s.p + ' --dport ' + portInterne + ' -j ACCEPT'
      ],
      need: [
        [['-t', 'nat'], ['-a', 'prerouting'], ['-i', ifs[0]], ['-p', s.p], ['--dport', s.port], ['--to-destination', interne + ':' + portInterne]],
        [['-a', 'forward'], ['-d', interne], ['-p', s.p], ['--dport', portInterne], ['-j', 'accept']]
      ],
      cle: 'Le piège : <code>PREROUTING</code> s\'exécute <b>avant</b> <code>FORWARD</code>. La règle de filtrage porte sur le <b>port réel après translation</b> (' + portInterne + '), pas sur le port public (' + s.port + ').'
    };
  }

  function gSnat() {
    var ifs = pick(window.ATL_IFACES), n = pick(window.ATL_NETS);
    var reseau = n.cli.split('.').slice(0, 3).join('.') + '.0/24';
    var dyn = Math.random() < 0.5;
    var pub = pick(['203.0.113.2', '198.51.100.9']);
    return {
      titre: 'Sortie vers Internet — ' + (dyn ? 'adresse publique DYNAMIQUE' : 'adresse publique FIXE'),
      enonce: 'Le réseau interne <b>' + reseau + '</b> doit sortir vers Internet par l\'interface <code>' + ifs[0] + '</code>. ' +
        (dyn ? 'Cette interface est configurée <b>en DHCP</b> chez l\'opérateur : l\'adresse publique change.'
             : 'L\'adresse publique est <b>fixe</b> : <b>' + pub + '</b>.'),
      consigne: 'Une seule ligne, dans la bonne table et la bonne chaîne.',
      lignes: 1,
      sol: [dyn
        ? 'iptables -t nat -A POSTROUTING -o ' + ifs[0] + ' -s ' + reseau + ' -j MASQUERADE'
        : 'iptables -t nat -A POSTROUTING -o ' + ifs[0] + ' -s ' + reseau + ' -j SNAT --to-source ' + pub],
      need: [dyn
        ? [['-t', 'nat'], ['-a', 'postrouting'], ['-o', ifs[0]], ['-s', reseau], ['-j', 'masquerade']]
        : [['-t', 'nat'], ['-a', 'postrouting'], ['-o', ifs[0]], ['-s', reseau], ['-j', 'snat'], ['--to-source', pub]]],
      cle: dyn
        ? '<b>IP dynamique → MASQUERADE.</b> Il lit l\'adresse de la carte à chaque nouveau flux. Un <code>SNAT</code> figé serait tombé au premier renouvellement de bail.'
        : '<b>IP fixe → SNAT.</b> Plus rapide : l\'adresse est figée, pas besoin d\'interroger l\'interface. <b>S</b>ource → po<b>S</b>trouting.'
    };
  }

  function gLog() {
    var s = pick(window.ATL_SERVICES), ifs = pick(window.ATL_IFACES), n = pick(window.ATL_NETS);
    return {
      titre: 'Journaliser un flux autorisé',
      enonce: 'On veut <b>tracer</b> chaque ouverture de session <b>' + s.n + '</b> de <b>' + n.cli +
        '</b> vers <b>' + n.srv + '</b> (de <code>' + ifs[0] + '</code> vers <code>' + ifs[1] + '</code>), <b>puis l\'autoriser</b>. Préfixe imposé : <code>[' + s.n.toUpperCase() + ']</code>',
      consigne: 'Deux lignes, dans le <b>bon ordre</b>.',
      lignes: 2,
      sol: [
        'iptables -A FORWARD -i ' + ifs[0] + ' -o ' + ifs[1] + ' -s ' + n.cli + ' -d ' + n.srv + ' -p ' + s.p + ' --dport ' + s.port + ' -j LOG --log-prefix "[' + s.n.toUpperCase() + '] "',
        'iptables -A FORWARD -i ' + ifs[0] + ' -o ' + ifs[1] + ' -s ' + n.cli + ' -d ' + n.srv + ' -p ' + s.p + ' --dport ' + s.port + ' -j ACCEPT'
      ],
      need: [
        [['-a', 'forward'], ['-i', ifs[0]], ['-o', ifs[1]], ['-p', s.p], ['--dport', s.port], ['-j', 'log']],
        [['-a', 'forward'], ['-i', ifs[0]], ['-o', ifs[1]], ['-p', s.p], ['--dport', s.port], ['-j', 'accept']]
      ],
      cle: '<code>LOG</code> est <b>non terminale</b> : elle écrit puis laisse le paquet continuer. Placée <b>après</b> l\'<code>ACCEPT</code>, elle ne serait jamais atteinte.'
    };
  }

  var GENS = [gTransitStateless, gTransitStateful, gPingLocal, gDnat, gSnat, gLog];

  function reglesNew(which) {
    Gex = (typeof which === 'number' ? GENS[which] : pick(GENS))();
    var rows = '';
    for (var i = 0; i < Gex.lignes; i++) {
      rows += '<input class="atl-rule" id="g-in-' + i + '" type="text" spellcheck="false" ' +
              'placeholder="' + (Gex.lignes > 1 ? 'ligne ' + (i + 1) : 'ta règle') + '">';
    }
    $('g-run').innerHTML =
      '<div class="atl-card">' +
        '<div class="atl-top"><span class="badge acc">' + Gex.titre + '</span>' +
        '<span class="atl-pos">série : <b class="s-ok">' + ST.g.ok + '</b> / ' + (ST.g.ok + ST.g.ko) + '</span></div>' +
        '<p class="atl-enonce">' + Gex.enonce + '</p>' +
        '<p class="atl-hint">' + Gex.consigne + '</p>' +
        rows +
        '<div class="qactions"><button class="btn primary" id="g-check">Vérifier</button>' +
        '<button class="btn" id="g-sol">Voir la solution</button>' +
        '<button class="btn ghost" id="g-next">Exercice suivant</button></div>' +
        '<div id="g-corr"></div>' +
      '</div>';
    $('g-check').onclick = reglesCheck;
    $('g-sol').onclick = function () { reglesShow(null); };
    $('g-next').onclick = function () { reglesNew(); };
    var f = $('g-in-0'); if (f) f.focus();
    $('g-run').querySelectorAll('.atl-rule').forEach(function (el, idx) {
      el.onkeydown = function (ev) {
        if (ev.key === 'Enter') {
          var nxt = $('g-in-' + (idx + 1));
          if (nxt) nxt.focus(); else reglesCheck();
        }
      };
    });
  }

  function reglesCheck() {
    var res = [], parfait = true;
    for (var i = 0; i < Gex.lignes; i++) {
      var val = ($('g-in-' + i).value || '').trim();
      if (!val) { parfait = false; res.push({ vide: true }); continue; }
      var r = checkLine(val, Gex.need[i]);
      if (r.miss.length || r.wrong.length) parfait = false;
      res.push(r);
    }
    if (parfait) { ST.g.ok++; } else { ST.g.ko++; }
    save(ST);
    reglesShow(res);
  }

  /* Les critères sont comparés en minuscules, mais affichés comme on les écrit. */
  var OPT_LBL = { '-a': '-A', '-t': '-t', '-i': '-i', '-o': '-o', '-s': '-s', '-d': '-d', '-p': '-p', '-j': '-j' };
  var UP = { '-a': 1, '-j': 1, '--ctstate': 1 };
  function fmtOpt(o) { return OPT_LBL[o] || o; }
  function fmtVal(o, v) { return UP[o] ? String(v).toUpperCase() : v; }

  function reglesShow(res) {
    var html = '';
    if (res) {
      html += '<div class="atl-corr ' + (res.every(function (r) { return !r.vide && !r.miss.length && !r.wrong.length; }) ? 'good' : 'bad') + '">';
      res.forEach(function (r, i) {
        html += '<div class="t">Ligne ' + (i + 1) + '</div>';
        if (r.vide) { html += '<p class="atl-bad">Rien saisi.</p>'; return; }
        if (!r.miss.length && !r.wrong.length) {
          html += '<p class="atl-good">✓ Tous les critères attendus sont présents (' + r.good + '/' + r.total + ').</p>';
        } else {
          html += '<p>' + r.good + ' / ' + r.total + ' critères corrects.</p><ul class="atl-diag">';
          r.miss.forEach(function (p) {
            html += '<li class="atl-bad"><b>Manque</b> <code>' + fmtOpt(p[0]) + ' ' + fmtVal(p[0], p[1]) + '</code></li>';
          });
          r.wrong.forEach(function (p) {
            html += '<li class="atl-warn"><b>Valeur inattendue</b> pour <code>' + fmtOpt(p[0]) +
              '</code>&nbsp;: tu as mis <code>' + esc(fmtVal(p[0], p[1])) + '</code>, on attend <code>' + fmtVal(p[0], p[2]) + '</code></li>';
          });
          html += '</ul>';
        }
      });
      html += '</div>';
    }
    html += '<div class="atl-corr"><div class="t">La règle attendue</div><pre class="atl-sol">' +
      Gex.sol.map(esc).join('\n') + '</pre>' +
      '<p class="atl-note"><b>Le point clé :</b> ' + Gex.cle + '</p></div>';
    $('g-corr').innerHTML = html;
  }

  /* ============================================================
     3. TROUVE L'ERREUR
     ============================================================ */
  var Eq = [], Ei = 0;

  function erreursStart(onlyTodo) {
    var pool = window.ATL_ERREURS.slice();
    if (onlyTodo) {
      pool = pool.filter(function (x) { return ST.e[x.id] !== 'ok'; });
      if (!pool.length) { alert('Tous les cas sont marqués « trouvé ». Utilisez « Réinitialiser » pour repartir de zéro.'); return; }
    }
    Eq = shuffle(pool); Ei = 0;
    $('e-setup').classList.add('hidden');
    $('e-run').classList.remove('hidden');
    erreursRender();
  }

  function erreursRender() {
    if (Ei >= Eq.length) { erreursEnd(); return; }
    var q = Eq[Ei];
    $('e-run').innerHTML =
      '<div class="atl-card">' +
        '<div class="atl-top"><span class="atl-pos">' + (Ei + 1) + ' / ' + Eq.length + '</span>' +
        '<span class="badge b2">chapitre ' + q.ch + '</span></div>' +
        '<h3 class="atl-q">' + q.t + '</h3>' +
        '<p class="atl-enonce">' + q.sit + '</p>' +
        '<pre class="atl-code">' + q.code.map(esc).join('\n') + '</pre>' +
        '<p class="atl-hint">Qu\'est-ce qui cloche, <b>et pourquoi</b>&nbsp;? Formule la réponse avant de révéler.</p>' +
        '<textarea id="e-input" rows="3" placeholder="Le problème est…"></textarea>' +
        '<div class="qactions"><button class="btn primary" id="e-show">Révéler</button>' +
        '<button class="btn ghost" id="e-skip">Passer</button></div>' +
        '<div id="e-corr"></div>' +
      '</div>';
    $('e-show').onclick = erreursReveal;
    $('e-skip').onclick = function () { Ei++; erreursRender(); };
  }

  function erreursReveal() {
    var q = Eq[Ei];
    $('e-corr').innerHTML =
      '<div class="atl-corr">' +
        '<div class="t">L\'erreur</div><p>' + q.err + '</p>' +
        '<div class="t">Pourquoi</div><p>' + q.why + '</p>' +
        '<div class="t">La correction</div><p>' + q.fix + '</p>' +
        '<div class="atl-self"><b>Auto-évaluation :</b> avais-tu identifié l\'erreur <i>et</i> su l\'expliquer&nbsp;?' +
        '<div class="qactions"><button class="btn primary" id="e-ok">Oui</button>' +
        '<button class="btn" id="e-half">L\'erreur, mais pas le pourquoi</button>' +
        '<button class="btn ghost" id="e-ko">Non</button></div></div>' +
      '</div>';
    $('e-show').disabled = true;
    function mark(v) { ST.e[q.id] = v; save(ST); Ei++; erreursRender(); }
    $('e-ok').onclick = function () { mark('ok'); };
    $('e-half').onclick = function () { mark('half'); };
    $('e-ko').onclick = function () { mark('ko'); };
  }

  function erreursEnd() {
    var ok = 0, half = 0, ko = 0;
    window.ATL_ERREURS.forEach(function (x) {
      if (ST.e[x.id] === 'ok') ok++; else if (ST.e[x.id] === 'half') half++; else if (ST.e[x.id] === 'ko') ko++;
    });
    $('e-run').innerHTML =
      '<div class="atl-card"><h3>Série terminée</h3>' +
      '<div class="atl-score"><span class="s-ok">' + ok + ' trouvé' + (ok > 1 ? 's' : '') + '</span>' +
      '<span class="s-half">' + half + ' à moitié</span>' +
      '<span class="s-ko">' + ko + ' manqué' + (ko > 1 ? 's' : '') + '</span>' +
      '<span class="s-mute">sur ' + window.ATL_ERREURS.length + '</span></div>' +
      '<div class="qactions"><button class="btn primary" id="e-again">Rejouer les non trouvés</button>' +
      '<button class="btn ghost" id="e-back">Retour</button></div></div>';
    $('e-again').onclick = function () { erreursStart(true); };
    $('e-back').onclick = function () { $('e-run').classList.add('hidden'); $('e-setup').classList.remove('hidden'); erreursSetup(); };
  }

  function erreursSetup() {
    var all = window.ATL_ERREURS.length, todo = 0;
    window.ATL_ERREURS.forEach(function (x) { if (ST.e[x.id] !== 'ok') todo++; });
    $('e-setup').innerHTML =
      '<div class="atl-card"><h3>Trouve l\'erreur — ' + all + ' cas</h3>' +
      '<p>Une configuration ou un schéma, un symptôme. À toi de dire <b>ce qui cloche et pourquoi</b>. ' +
      'Tous les cas viennent des pièges réellement signalés en cours.</p>' +
      '<div class="qactions">' +
      '<button class="btn primary" id="e-start">Commencer (' + all + ')</button>' +
      '<button class="btn" id="e-todo">Non trouvés (' + todo + ')</button>' +
      '<button class="btn ghost" id="e-reset">Réinitialiser</button></div></div>';
    $('e-start').onclick = function () { erreursStart(false); };
    $('e-todo').onclick = function () { erreursStart(true); };
    $('e-reset').onclick = function () {
      if (confirm('Effacer la progression des cas d\'erreur ?')) { ST.e = {}; save(ST); erreursSetup(); }
    };
  }

  /* ================= Démarrage ================= */
  window.addEventListener('DOMContentLoaded', function () {
    restitSetup();
    erreursSetup();
    reglesNew();
    $('g-reset').onclick = function () {
      if (confirm('Remettre le compteur des règles à zéro ?')) { ST.g = { ok: 0, ko: 0 }; save(ST); reglesNew(); }
    };
    GENS.forEach(function (fn, i) {
      var b = $('g-pick-' + i);
      if (b) b.onclick = function () { reglesNew(i); };
    });
    atlTab(localStorage.getItem(KEY + '.tab') || 'restit');
  });
})();
