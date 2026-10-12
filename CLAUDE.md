# Site de révision — règles de production

Site statique hors ligne, publié sur GitHub Pages. Aucun build : on ouvre les fichiers directement.

## Architecture

```
index.html            accueil : coquille vide, remplie par assets/accueil.js
catalogue.js          SOURCE UNIQUE de l'accueil : un objet par cours (voir son en-tête)
404.html              redirige les anciennes adresses (avant le rangement par cours)
glossaire.html        glossaire des sigles de tous les cours (assets/glossaire.js)
compteurs.js,         GÉNÉRÉS par tools/generer.py (lancé par sitecheck) : nombre de questions
glossaire-data.js     des QCM pour l'accueil, sigles extraits des fiches. Ne jamais les éditer.
assets/               moteur commun : core.css, viz.css, app.js (onglets, recherche, QCM),
                      accueil.css / accueil.js, atelier.js, scenes.js
tools/                sources.py (extraction des supports), couverture.py (+ couverture_ignore.txt),
                      nouveau_cours.py + modele/ (squelette),
                      generer.py, qcmcheck.py, sitecheck.py, jsdata.py (lecture des .js sans node)
<code>-<sujet>/       un dossier par cours, par exemple inf5049-controle-audit/
  fiche.html          la fiche ; d'autres pages possibles (points-examen, atelier, ebios-rm…)
  qcm.js              window.QCM_CHAPTERS + window.QCM_DATA
  *-data.js           données d'un atelier ou de scènes animées
```

Dans un dossier de cours, les chemins sont relatifs : `../assets/…`, `../index.html`, `qcm.js`.
La progression de lecture est rangée sous `majcyb.seen.<dossier>/<page>` (dérivé du chemin),
les statistiques de QCM sous `majcyb.<clé passée à initQCM>`, la dernière page sous `majcyb.last`.

Le nombre de questions affiché à l'accueil est compté en chargeant le QCM : rien à synchroniser.
Une page de cours sans `#toc` n'a pas d'onglets ; un lien `page.html#qcm` ouvre l'onglet du QCM.

## Nouvelle matière : la marche à suivre (économe en tokens)

1. **Sources** : `python -I tools/sources.py "../<Matière>" "<scratchpad>/src"` → lire `INDEX.md`,
   les `.txt`, les `planches-N.png` (seules les pages contenant une image y figurent : leur texte
   n'est PAS dans les `.txt`), puis les transcriptions (par morceaux au-delà de ~90 Ko).
2. **Squelette** : `python -I tools/nouveau_cours.py CODE sujet "Titre" --couleur X --clore`
   → dossier, `fiche.html`, `qcm.js`, entrée de catalogue (résumé et programme à compléter).
3. **Écrire** la fiche avec les composants ci-dessous, puis le QCM.
4. **Couverture** : `python -I tools/couverture.py <dossier>` liste les titres de slides, sigles et
   termes en gras des sources absents de la fiche. Trier chaque manque : notion à ajouter, ou bruit
   à déclarer dans `tools/couverture_ignore.txt` (un nom de personne : `--empreinte "NOM"`, jamais
   en clair). Nos productions (devoir, compte rendu) vont dans le champ `exclure` du catalogue.
   C'est un filet par mots-clés : il ne juge pas la qualité d'une explication.
5. **Contrôler** : `qcmcheck.py` sur le QCM, `sitecheck.py`, rendu dans le navigateur.

**Ne jamais relire une fiche entière** (250 à 350 Ko, soit des dizaines de milliers de tokens) :
`grep -n` pour situer, puis `Read` avec `offset`/`limit`, et `Edit` ciblé. Les composants sont
documentés ci-dessous : inutile d'ouvrir une autre fiche pour les retrouver.

## Composants (assets/core.css, viz.css, app.js)

Tout est déjà stylé, thème sombre compris. Une fiche n'a **ni `<style>` ni `<script>` propres**.

| Besoin | Code |
|---|---|
| Onglet / sous-menu | `<h2 id="chN"><span class="num">N.</span> Titre</h2>` · `<h3 id="chN-x">N.x Titre</h3>` |
| Encadré | `<div class="callout def\|warn\|danger\|ok"><div class="t">Titre</div>…</div>` (sans classe = bleu) |
| Point d'examen | `<div class="exam"><div class="t">Titre</div>…</div>` |
| Exemple / RETEX | `<div class="example"><div class="t">Titre</div>…</div>` |
| Liste à puces forte | `<div class="key-points"><li>…</li></div>` |
| Cartes côte à côte | `<div class="grid c2\|c3"><div class="card"><h4>Titre</h4>…</div></div>` |
| Tableau | `<div class="tw"><table><thead>…</thead><tbody>…</tbody></table></div>` |
| Étapes animées | `<div class="steps" id="anim-x"><div class="step"><b>1. Titre</b> <span class="who">avant</span><br>…</div></div>` + bouton `<button class="btn primary" onclick="playSteps('anim-x')">▶ Lancer l'animation</button>` |
| Cartes cliquables | `<div class="viz"><div class="t">Titre</div><div class="vz-grid g3"><button class="vz-c k-red\|amber\|blue\|green\|purple"><span class="n">Surtitre</span><h5>Titre</h5><span class="q">Résumé</span><span class="more"><span class="t">Détail</span>…</span></button></div><div class="vz-bar"><button class="btn" data-cards="open">Tout déplier</button><button class="btn ghost" data-cards="close">Tout replier</button><span class="cnt"></span></div></div>` |
| Schéma SVG | `<div class="viz"><div class="t">…</div><svg viewBox="0 0 900 H">` ; groupes `<g class="vz-step">` révélés un à un ; formes `vz-ok\|vz-bad\|vz-filt\|vz-dec\|vz-box` ; texte `vz-lbl\|vz-sub` (+ `vz-t-ok\|bad\|filt`) |
| Répartition | `<div class="split"><span class="a" style="flex-basis:35%">…</span><span class="b" style="flex-basis:65%">…</span></div><div class="split-cap"><span>…</span><span>…</span></div>` |
| Sélecteur à jauges | `<div class="pick"><div class="pick-btns"><button data-m="100,25">A</button><button class="gris\|sombre" data-m="8,100">B</button></div><div class="meter"><span>Jauge 1</span><div class="bar"><i></i></div>…</div><div class="pick-out">texte A</div><div class="pick-out">texte B</div></div>` |
| Phases | `<div class="phase-band"><div class="p1"><b>Avant</b>…</div><div class="p2">…</div><div class="p3">…</div></div>` |
| Mise en situation | `<details class="case"><summary>Cas 1 — Titre<span class="sit">Énoncé</span></summary><div>Réponse</div></details>` |
| QCM | `<h2 id="qcm-sec">… <span id="count-badge" class="badge acc"></span></h2><div id="qcm"></div>` + `initQCM(window.QCM_DATA, window.QCM_CHAPTERS, 'cle')` |

**Fourni sans rien écrire** (app.js) : tiroir « ☰ Chapitres » sous 1080 px ; recherche sans accents,
multi-mots, avec barre d'occurrences (F3) ; QCM en quatre modes (entraînement, révision intelligente
à répétition espacée, cartes mémoire, examen blanc chronométré), tableau de maîtrise par chapitre,
raccourcis 1–4 / A–D, lien « Revoir ce chapitre » vers `<h2 id="chN">` (d'où la règle : les chapitres
du QCM reprennent la numérotation `chN` des h2 de la fiche). Glossaire : un sigle est repris
automatiquement s'il est écrit « SIGLE (développé) », « développé (SIGLE) » ou « SIGLE : développé ».

Un nouveau composant réutilisable va dans `viz.css` (et `app.js` s'il est interactif, piloté par
des attributs `data-*`), puis dans ce tableau.

## Règle n° 1 — un QCM sert à connaître le cours, pas le cours

**Interdiction absolue de produire des questions sur autre chose que la matière.**
Une question de QCM doit apprendre une notion à quelqu'un qui n'a jamais vu ni le TP, ni le
devoir, ni le corrigé, ni le diaporama.

### Le test à appliquer avant d'écrire une question

> *Un étudiant qui n'a jamais assisté à ce TP apprend-il quelque chose en lisant cette
> question et sa réponse&nbsp;?*

Si la réponse est non, la question ne doit pas exister. Pas de reformulation de complaisance :
on la supprime.

### Les six familles à ne jamais produire

| Famille | Exemple de ce qu'il ne faut pas écrire |
| --- | --- |
| **Logistique d'un devoir** | « Quelles sont les contraintes formelles du devoir ? » · « Quel est le livrable attendu du TP ? » · « Quelles évaluations composent la note du module ? » · dates de rendu, taille des groupes, format de fichier |
| **Méta-énoncé** | « Sur quoi serez-vous évalués ? » · « Pourquoi l'énoncé demande-t-il de… ? » · « Que dit la consigne à propos de… ? » |
| **Contenu d'un corrigé en tant que document** | « Quelle mesure figure en tête de liste dans la correction ? » · « Combien de schémas propose le corrigé ? » · « Quelle recommandation clôt le tableau ? » |
| **Bibliographie du support** | « Combien de niveaux le support officiel définit-il ? » · « Que dit la diapositive 47 ? » · « Le support demande… » |
| **Comptage sans contenu** | « Combien d'activités compte l'atelier 5 ? » · « Combien de questions dans tel exercice ? » — sauf si **le nombre est la connaissance** (7 couches OSI, 93 mesures ISO 27002, 2 adresses utilisables dans un /30) |
| **Position dans une liste** | Toute explication qui dit « la deuxième proposition », « la troisième réponse » — les options sont mélangées à l'affichage, ces renvois sont faux une fois sur deux |

### Ce qu'on fait d'un exemple travaillé en cours

Un cas d'étude traité en cours **enseigne une distinction** : on garde la distinction, on jette
le cadre narratif.

- ❌ « Dans le TP zero trust, à quel principe rattacher la faiblesse *VPN depuis des postes
  personnels* ? »
- ✅ « Un collaborateur se connecte à distance depuis un poste dont l'état de santé est inconnu.
  Quel principe zero trust est en cause en premier ? »

Même notion, mais la seconde reste vraie hors du TP. Les formules à bannir dans un
énoncé : *dans l'exercice…*, *dans la correction…*, *le support demande…*, *selon l'énoncé du
devoir…*.

### Exception

Le contexte d'un cas peut rester dans l'énoncé quand **le cas lui-même est la matière** — une
étude de cas de presse dont on doit extraire la grille source de risque / objectif visé /
événement redouté, par exemple. Le critère reste le même : ce qu'on apprend doit être
transposable ailleurs.

## Règle n° 2 — ne jamais trahir la bonne réponse par la forme

Le moteur mélange les options, mais pas leur mise en forme. Avant toute livraison, vérifier
qu'aucun de ces indices n'apparaisse **uniquement** dans les bonnes réponses d'une question :
`<b>`, `<i>`, guillemets français, espaces insécables `&nbsp;`.

La bonne réponse ne doit pas non plus être systématiquement la plus longue : viser moins de
80 % de questions où c'est le cas, et étoffer les distracteurs plutôt que raccourcir la réponse.

`python -I tools/qcmcheck.py <dossier>/qcm.js` vérifie la syntaxe, les ids, les indices de forme,
les renvois de position et la proportion de bonnes réponses les plus longues. Il tourne sans node.

## Règle n° 3 — pas de doublons contradictoires

Deux questions qui testent la même équivalence depuis deux angles opposés entretiennent la
confusion au lieu de la lever. Si deux vocabulaires désignent la même chose, écrire **une**
question qui teste l'équivalence, pas deux qui se contredisent.

## Format des données de QCM

```js
window.QCM_CHAPTERS = { 1: "Titre du chapitre", … };   // calqué sur les <h2> de la fiche
window.QCM_DATA = [
  { id:"A01", ch:1, d:2, q:"Énoncé…", o:["…","…","…","…"], a:[0], e:"Explication…" }
];
```

`d` = difficulté 1 à 3 · `a` = index des bonnes réponses · `e` = explication, qui doit **dire
pourquoi les distracteurs sont faux**, pas seulement répéter la bonne réponse.

Un QCM dont **toutes** les questions ont une seule bonne réponse s'affiche en boutons radio :
ne pas mélanger réponses uniques et multiples dans un même fichier sans raison.

Après toute modification d'un `qcm.js` ou d'un fichier de `assets/`, **incrémenter le `?v=`
correspondant** dans les pages HTML, sinon le navigateur sert l'ancien fichier depuis son cache.

## Vérifications avant de livrer

- `python -I tools/sitecheck.py` : « ARCHITECTURE : aucun problème » (liens, ancres, catalogue,
  clés initQCM, fichiers orphelins) ; il lance aussi qcmcheck sur chaque QCM.
- `python -I tools/qcmcheck.py <dossier>/qcm.js` à zéro problème pour tout QCM produit ou modifié
  (pas de virgule finale, ids uniques, aucun indice de forme, moins de 80 % de bonnes réponses
  les plus longues).
- Rendu vérifié dans le navigateur via le serveur local `revisions` de `5A/.claude/launch.json`
  (port 8765) : un fichier ouvert directement dans l'aperçu ne charge pas ses scripts.
