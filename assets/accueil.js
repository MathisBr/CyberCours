/* ============================================================
   Page d'accueil — construite à partir de catalogue.js.
   - « Reprendre » : la dernière page ouverte (mémorisée par app.js)
   - filtres par état et recherche dans les codes, titres et programmes
   - pour chaque ressource : progression de lecture et statistiques du QCM
   - nombre de questions compté en chargeant chaque fichier de QCM
   Toutes les lectures de localStorage sont protégées : sans stockage,
   la page s'affiche normalement, simplement sans progression.
   ============================================================ */
(function () {
  'use strict';

  var COURS = window.CATALOGUE || [];
  var TAGS = { fiche: 'Fiche', examen: 'Examen', atelier: 'Atelier', attestation: 'Attestation', qcm: 'QCM' };
  var etatFiltre = 'tous';
  var texte = '';

  function lire(cle, defaut) {
    try { var v = localStorage.getItem(cle); return v === null ? defaut : JSON.parse(v); }
    catch (e) { return defaut; }
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function slug(etat) { return etat === 'en cours' ? 'en-cours' : 'termine'; }
  function idPage(c, r) { return c.dossier + '/' + r.page.replace(/\.html$/, ''); }

  /* ---------- Reprendre ---------- */
  function depuis(t) {
    var m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return "à l'instant";
    if (m < 60) return 'il y a ' + m + ' min';
    var h = Math.round(m / 60);
    if (h < 24) return 'il y a ' + h + ' h';
    var j = Math.round(h / 24);
    return j === 1 ? 'hier' : 'il y a ' + j + ' jours';
  }
  function rendreReprise() {
    var host = document.getElementById('reprise');
    var last = lire('majcyb.last', null);
    if (!host || !last || !last.page) return;
    var cours = null, res = null;
    COURS.forEach(function (c) {
      c.ressources.forEach(function (r) { if (idPage(c, r) === last.page) { cours = c; res = r; } });
    });
    if (!cours) return;                           // page retirée du catalogue
    host.innerHTML =
      '<a class="reprise" href="' + esc(last.href) + '">' +
        '<span class="lbl">Reprendre</span>' +
        '<span class="txt"><b>' + esc(cours.code + ' · ' + res.titre) + '</b>' +
        '<small>' + esc(last.section || '') + ' — ' + depuis(last.t) + '</small></span>' +
        '<span class="go">Continuer →</span>' +
      '</a>';
  }

  /* ---------- Cartes ---------- */
  function ligneRessource(c, r) {
    var id = idPage(c, r);
    var vus = lire('majcyb.seen.' + id, []).length;
    var total = parseInt(lire('majcyb.secs.' + id, 0), 10) || 0;
    var meta = total ? vus + ' / ' + total + ' lus' : (vus ? vus + ' chapitres lus' : 'pas encore ouverte');
    var pct = total ? Math.min(100, Math.round(vus / total * 100)) : 0;
    var html =
      '<a class="res" href="' + esc(c.dossier + '/' + r.page) + '">' +
        '<span class="tag">' + TAGS[r.type] + '</span>' +
        '<span class="rt"><b>' + esc(r.titre) + '</b><small>' + esc(r.desc) + '</small></span>' +
        '<span class="meta">' + meta + '</span>' +
        '<span class="bar"><i style="width:' + pct + '%"></i></span>' +
      '</a>';
    if (r.qcm) {
      html +=
        '<a class="res" href="' + esc(c.dossier + '/' + r.page) + '#qcm" data-qcm="' + esc(c.dossier + '/' + r.qcm.src) + '" data-cle="' + esc(r.qcm.cle) + '">' +
          '<span class="tag">QCM</span>' +
          '<span class="rt"><b class="qn">QCM</b><small>' + esc(r.titre) + '</small></span>' +
          '<span class="meta qs"></span>' +
          '<span class="bar"><i></i></span>' +
        '</a>';
    }
    return html;
  }

  function carte(c, i) {
    var vedette = c.etat === 'en cours' ? ' vedette' : '';
    return '<article class="cours k-' + esc(c.couleur) + vedette + '" data-i="' + i + '">' +
      '<div class="cours-top"><span class="code">' + esc(c.code) + '</span>' +
      '<span class="etat ' + slug(c.etat) + '">' + esc(c.etat) + '</span></div>' +
      '<h2>' + esc(c.titre) + '</h2>' +
      '<p class="resume">' + esc(c.resume) + '</p>' +
      '<div class="ress">' + c.ressources.map(function (r) { return ligneRessource(c, r); }).join('') + '</div>' +
      '<details class="prog"><summary>Programme · ' + c.programme.length + ' notions</summary><ul>' +
        c.programme.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') +
      '</ul></details>' +
    '</article>';
  }

  function rendreCartes() {
    var host = document.getElementById('cours');
    host.innerHTML = COURS.map(carte).join('') +
      '<p class="vide hidden" id="vide">Aucun cours ne correspond.</p>';
    statsQCM();
    compterQCM();
  }

  /* ---------- QCM : statistiques et nombre de questions ---------- */
  function statsQCM() {
    document.querySelectorAll('a[data-cle]').forEach(function (a) {
      var h = lire('majcyb.' + a.getAttribute('data-cle'), {}) || {};
      var vues = (h.seen || []).length;
      a._vues = vues;
      a.querySelector('.qs').textContent = h.a ? Math.round(h.c / h.a * 100) + ' % de réussite' : 'jamais lancé';
      peindreQCM(a);
    });
  }
  function peindreQCM(a) {
    var n = a._total;
    a.querySelector('.qn').textContent = n ? n + ' questions' : 'QCM';
    var small = a.querySelector('.rt small');
    if (n) small.textContent = a._vues + ' / ' + n + ' déjà vues';
    a.querySelector('.bar i').style.width = n ? Math.min(100, Math.round(a._vues / n * 100)) + '%' : '0%';
  }
  /* Les compteurs viennent de compteurs.js (généré). À défaut, chaque fichier de QCM
     définit window.QCM_DATA : on les charge un par un et on lit la longueur. */
  function compterQCM() {
    var liens = Array.prototype.slice.call(document.querySelectorAll('a[data-qcm]'));
    var cache = {};
    (function suivant(k) {
      if (k >= liens.length) return;
      var a = liens[k], src = a.getAttribute('data-qcm');
      /* Compteur pré-calculé par tools/generer.py : pas besoin de charger le QCM. */
      var pre = (window.QCM_COMPTES || {})[src];
      if (pre !== undefined) cache[src] = pre;
      if (cache[src] !== undefined) { a._total = cache[src]; peindreQCM(a); suivant(k + 1); return; }
      window.QCM_DATA = undefined;
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () {
        cache[src] = (window.QCM_DATA || []).length;
        a._total = cache[src]; peindreQCM(a);
        s.remove(); suivant(k + 1);
      };
      s.onerror = function () { s.remove(); suivant(k + 1); };
      document.body.appendChild(s);
    })(0);
  }

  /* ---------- Filtres ---------- */
  function rendreChips() {
    var n = { tous: COURS.length, 'en cours': 0, 'terminé': 0 };
    COURS.forEach(function (c) { n[c.etat] = (n[c.etat] || 0) + 1; });
    var host = document.getElementById('chips');
    host.innerHTML = [['tous', 'Tous'], ['en cours', 'En cours'], ['terminé', 'Terminés']].map(function (x) {
      return '<button data-etat="' + x[0] + '" aria-pressed="' + (x[0] === etatFiltre) + '">' +
        x[1] + '<span>' + (n[x[0]] || 0) + '</span></button>';
    }).join('');
    host.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      etatFiltre = b.getAttribute('data-etat');
      host.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      filtrer();
    };
  }

  function filtrer() {
    var q = norm(texte.trim());
    var visibles = 0;
    document.querySelectorAll('.cours').forEach(function (art) {
      var c = COURS[+art.getAttribute('data-i')];
      var okEtat = etatFiltre === 'tous' || c.etat === etatFiltre;
      var tete = norm([c.code, c.titre, c.resume].concat(c.ressources.map(function (r) { return r.titre + ' ' + r.desc; })).join(' '));
      var hits = 0;
      art.querySelectorAll('.prog li').forEach(function (li, k) {
        var h = q !== '' && norm(c.programme[k]).indexOf(q) !== -1;
        li.classList.toggle('hit', h); if (h) hits++;
      });
      var okTexte = q === '' || tete.indexOf(q) !== -1 || hits > 0;
      var show = okEtat && okTexte;
      art.classList.toggle('hidden', !show);
      art.querySelector('.prog').open = q !== '' && hits > 0;
      if (show) visibles++;
    });
    document.getElementById('vide').classList.toggle('hidden', visibles > 0);
    document.getElementById('resultat').textContent =
      (q || etatFiltre !== 'tous') ? visibles + ' cours affiché' + (visibles > 1 ? 's' : '') : '';
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    rendreReprise();
    rendreChips();
    rendreCartes();
    var f = document.getElementById('filtre');
    f.addEventListener('input', function () { texte = f.value; filtrer(); });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && document.activeElement !== f)) {
        e.preventDefault(); f.focus(); f.select();
      } else if (e.key === 'Escape' && document.activeElement === f) {
        f.value = ''; texte = ''; filtrer(); f.blur();
      }
    });
  });
})();
