/* ============================================================
   Page glossaire — construite à partir de glossaire-data.js
   (généré par tools/generer.py) et des couleurs de catalogue.js.
   ============================================================ */
(function () {
  'use strict';

  var G = (window.GLOSSAIRE || []).slice().sort(function (a, b) {
    return a.s.localeCompare(b.s, 'fr', { sensitivity: 'base' });
  });
  var COULEUR = {};
  (window.CATALOGUE || []).forEach(function (c) { COULEUR[c.code] = c.couleur; });
  var plier = window.replier || function (s) { return s.toLowerCase(); };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function lettre(e) {
    var l = plier(e.s[0]).toUpperCase();
    return /[A-Z]/.test(l) ? l : '#';
  }

  function rendre() {
    var host = document.getElementById('glossaire');
    var html = '', courante = '';
    G.forEach(function (e, i) {
      var l = lettre(e);
      if (l !== courante) {
        if (courante) html += '</dl>';
        html += '<h2 class="gl-l" id="l-' + l + '">' + l + '</h2><dl class="gl">';
        courante = l;
      }
      html += '<div class="gl-e" data-i="' + i + '"><dt>' + esc(e.s) + '</dt><dd>' + esc(e.d) +
        e.c.map(function (code, k) {
          return ' <a class="gl-c k-' + (COULEUR[code] || 'blue') + '" href="' + esc(e.u[k]) + '">' + esc(code) + '</a>';
        }).join('') + '</dd></div>';
    });
    host.innerHTML = html + (courante ? '</dl>' : '') +
      '<p class="vide hidden" id="vide">Aucun sigle ne correspond.</p>';

    var lettres = [];
    G.forEach(function (e) { if (lettres.indexOf(lettre(e)) === -1) lettres.push(lettre(e)); });
    document.getElementById('lettres').innerHTML = lettres.map(function (l) {
      return '<a href="#l-' + l + '">' + l + '</a>';
    }).join('');
  }

  function filtrer(q) {
    q = plier(q.trim());
    var n = 0;
    document.querySelectorAll('.gl-e').forEach(function (div) {
      var e = G[+div.getAttribute('data-i')];
      var ok = !q || plier(e.s + ' ' + e.d).indexOf(q) !== -1;
      div.classList.toggle('hidden', !ok);
      if (ok) n++;
    });
    /* Une lettre sans entrée visible disparaît avec sa liste. */
    document.querySelectorAll('.gl-l').forEach(function (h) {
      var dl = h.nextElementSibling;
      var vide = !dl.querySelector('.gl-e:not(.hidden)');
      h.classList.toggle('hidden', vide);
      dl.classList.toggle('hidden', vide);
    });
    document.getElementById('vide').classList.toggle('hidden', n > 0);
    document.getElementById('resultat').textContent = q ? n + ' sigle' + (n > 1 ? 's' : '') : G.length + ' sigles';
  }

  document.addEventListener('DOMContentLoaded', function () {
    rendre();
    filtrer('');
    var f = document.getElementById('filtre');
    f.addEventListener('input', function () { filtrer(f.value); });
    document.addEventListener('keydown', function (e) {
      if ((e.key === '/' && document.activeElement !== f) || (e.key === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault(); f.focus(); f.select();
      } else if (e.key === 'Escape' && document.activeElement === f) {
        f.value = ''; filtrer(''); f.blur();
      }
    });
  });
})();
