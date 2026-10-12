# Site de révision — règles de production

Site statique hors ligne, publié sur GitHub Pages. Aucun build : on ouvre les fichiers directement.

## Architecture

```
index.html            accueil : coquille vide, remplie par assets/accueil.js
catalogue.js          SOURCE UNIQUE de l'accueil : un objet par cours (voir son en-tête)
404.html              redirige les anciennes adresses (avant le rangement par cours)
assets/               moteur commun : core.css, viz.css, app.js (onglets, recherche, QCM),
                      accueil.css / accueil.js, atelier.js, scenes.js
tools/                qcmcheck.py, sitecheck.py, jsdata.py (lecture des .js sans node)
<code>-<sujet>/       un dossier par cours, par exemple inf5049-controle-audit/
  fiche.html          la fiche ; d'autres pages possibles (points-examen, atelier, ebios-rm…)
  qcm.js              window.QCM_CHAPTERS + window.QCM_DATA
  *-data.js           données d'un atelier ou de scènes animées
```

Dans un dossier de cours, les chemins sont relatifs : `../assets/…`, `../index.html`, `qcm.js`.
La progression de lecture est rangée sous `majcyb.seen.<dossier>/<page>` (dérivé du chemin),
les statistiques de QCM sous `majcyb.<clé passée à initQCM>`, la dernière page sous `majcyb.last`.

### Ajouter un cours

1. Créer `<code>-<sujet>/` avec `fiche.html` et `qcm.js` (copier l'en-tête d'une fiche existante).
2. Ajouter son entrée dans `catalogue.js` (état `en cours` = carte en pleine largeur en tête).
3. `python -I tools/sitecheck.py` : doit afficher « ARCHITECTURE : aucun problème ».

Le nombre de questions affiché à l'accueil est compté en chargeant le QCM : rien à synchroniser.
Une page de cours sans `#toc` n'a pas d'onglets ; un lien `page.html#qcm` ouvre l'onglet du QCM.

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
