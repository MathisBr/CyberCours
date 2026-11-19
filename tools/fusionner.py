"""Fiche fusionnée : assemble les chapitres de plusieurs fiches de cours en une seule page de révision.

Usage : python -I tools/fusionner.py            (régénère toutes les fusions déclarées dans FUSIONS)

Pour chaque fusion, écrit dans son dossier :
  fiche.html          les chapitres repris tels quels, renumérotés et réordonnés, précédés de l'en-tête, du
                      calendrier et du chapitre de synthèse rédigés dans tools/fusion/<dossier>.html ;
  qcm.js              les questions des cours d'origine (ids préfixés, chapitres renumérotés) ;
  points-examen.html  les signaux d'examen des cours d'origine, liens vers la fiche fusionnée.

Les fiches d'origine restent la source : on corrige là, puis on relance ce script (ne jamais éditer les
fichiers générés). Le script vérifie lui-même que rien n'est perdu : chaque phrase de chaque chapitre repris,
chaque point de « L'essentiel » et chaque signal d'examen doivent se retrouver dans la sortie, le QCM resserré
(liste qcm_garder) doit couvrir chaque chapitre sans dépasser qcm_max,
et tout lien interne doit viser un identifiant qui existe.
"""
import html as H
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jsdata import read_global  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.stdout.reconfigure(encoding="utf-8")

GC, IE, OS = "inf5059-gestion-crise", "inf5061-intelligence-economique", "ent5002-osint-cti"

FUSIONS = [dict(
    dossier="i2ed-partiel-20-11",
    code="I2ED",
    titre="Partiel du 20 novembre",
    cle="i2ed2011",
    # Ordre de la fiche fusionnée : (cours, chapitre d'origine) -> chapitres 1, 2, 3…
    chapitres=[(GC, n) for n in range(1, 9)] + [(GC, 11), (GC, 12), (GC, 13)]
              + [(IE, 1), (GC, 9), (GC, 10), (IE, 7), (IE, 8)]
              + [(IE, n) for n in range(2, 7)] + [(IE, 9), (IE, 10)]
              + [(OS, 13), (OS, 14)],
    prefixe={GC: "GC", IE: "IE", OS: "OS"},
    # QCM resserré (130 questions au plus) : les notions signalées par les intervenants, les distinctions et les
    # définitions de base ; sont écartés les anecdotes, les doublons entre cours (GC-I01 = IE-A04, le SGDSN) et les
    # détails secondaires. Les QCM complets restent dans les fiches de chaque cours.
    qcm_max=130,
    qcm_garder="""
      GC-A02 GC-A03 GC-A06 GC-A08
      GC-B01 GC-B03 GC-B04 GC-B06 GC-B08
      GC-C01 GC-C02 GC-C03 GC-C05 GC-C06 GC-C07 GC-C09
      GC-D01 GC-D02 GC-D03 GC-D04 GC-D05
      GC-E02 GC-E03 GC-E07 GC-E09 GC-E10 GC-E11 GC-E12 GC-E13
      GC-F02 GC-F03 GC-F06 GC-F09 GC-F11 GC-F13
      GC-G01 GC-G02 GC-G03 GC-G05 GC-G06 GC-G14 GC-G16
      GC-H01 GC-H02 GC-H06 GC-H07 GC-H10
      GC-K03 GC-K04 GC-K05 GC-K06 GC-K10
      GC-L01 GC-L03 GC-L07 GC-L08
      GC-M01 GC-M02 GC-M04 GC-M05 GC-M07 GC-M08 GC-M09 GC-M15
      IE-A01 IE-A02 IE-A04 IE-A05
      GC-I04 GC-I08 GC-I09 GC-I10 GC-I17
      GC-J01 GC-J02 GC-J03 GC-J04 GC-J08 GC-J11 GC-J13
      IE-G01 IE-G02 IE-G03
      IE-H01 IE-H04 IE-H05 IE-H09
      IE-B01 IE-B02 IE-B03 IE-B06
      IE-C01 IE-C03 IE-C05
      IE-D01 IE-D02 IE-D03 IE-D04
      IE-E01 IE-E02 IE-E03 IE-E05
      IE-F01 IE-F02 IE-F04 IE-F07
      IE-I01 IE-I02 IE-I03 IE-I06 IE-I07 IE-I08 IE-I11 IE-I13
      IE-J01 IE-J02 IE-J03
      OS-M01 OS-M02 OS-M04 OS-M05 OS-M06 OS-M07 OS-M09
      OS-N01 OS-N03 OS-N06
    """.split(),
    # L'essentiel : (cours, titre du groupe, filtre sur le texte des puces — None = toutes).
    essentiel=[(GC, "Gestion de crise : entreprise, DSI, État", None),
               (IE, "Esprit de défense, intelligence économique, menaces hybrides", None),
               (OS, "OSINT", "OSINT")],
    # Signaux d'examen : (cours, filtre sur le titre de séance — None = toutes).
    signaux=[(GC, None), (OS, "Module OSINT")],
    # Renvois textuels qui changent de sens une fois les chapitres renumérotés : (cours, avant, après).
    textes=[
        (IE, "(§ 3.3)", "(§ 18.3)"),
        (IE, "(voir le <a href=\"#ch6\">chapitre 6</a>)", "(voir le <a href=\"#ch6\">chapitre 21</a>)"),
        (IE, "(voir le <a href=\"#ch5\">chapitre 5</a>)", "(voir le <a href=\"#ch5\">chapitre 20</a>)"),
        (IE, "(voir le <a href=\"#ch4-predation\">§ 4.3</a>)", "(voir le <a href=\"#ch4-predation\">§ 19.3</a>)"),
        (IE, "(voir la fiche <a href=\"../ent5002-osint-cti/fiche.html#ch13-l2i\">OSINT et CTI</a>)",
             "(voir le <a href=\"../ent5002-osint-cti/fiche.html#ch13-l2i\">§ 24.6</a>)"),
        (IE, "(Voir le cours <a href=\"../inf5059-gestion-crise/fiche.html\">Gestion de crise</a>.)",
             "(Voir les <a href=\"../inf5059-gestion-crise/fiche.html#ch13-plans\">chapitres 9 à 11</a>.)"),
        (GC, "(voir <a href=\"../inf5061-intelligence-economique/fiche.html\">INF5061</a>)",
             "(voir les <a href=\"../inf5061-intelligence-economique/fiche.html#ch2\">chapitres 17 à 21</a>)"),
        (GC, "l'organisation de l'État en crise (chapitres 9 et 10) et l'évolution des armées\n"
             "(<a href=\"../inf5061-intelligence-economique/fiche.html#ch7\">fiche INF5061</a>)",
             "l'organisation de l'État en crise (chapitres 13 et 14) et l'évolution des armées\n"
             "(<a href=\"../inf5061-intelligence-economique/fiche.html#ch7\">chapitre 15</a>)"),
    ],
)]


def lire(p):
    return io.open(p, encoding="utf-8", newline="").read()


def ecrire(p, t):
    io.open(p, "w", encoding="utf-8", newline="").write(t)
    assert lire(p) == t, f"écriture incomplète : {p}"


def texte(h):
    """Texte comparable d'un fragment HTML : sans balises ni numéros (renumérotés à la fusion)."""
    t = re.sub(r"<script.*?</script>", " ", h, flags=re.S)
    t = H.unescape(re.sub(r"<[^>]+>", " ", t))
    t = re.sub(r"\d+", "#", t)
    return re.sub(r"\s+", " ", t).strip()


def phrases(h):
    return [p.strip() for p in re.split(r"(?<=[.;:!?»])\s+", texte(h)) if len(p.strip()) > 12]


def chapitres(contenu):
    """{n: html du chapitre} : du <h2 id="chN"> au séparateur suivant."""
    out = {}
    for m in re.finditer(r'<h2 id="ch(\d+)">', contenu):
        fin = min(i for i in (contenu.find("<!-- =====", m.start()), contenu.find("<h2 ", m.start() + 4), len(contenu))
                  if i != -1)
        out[int(m.group(1))] = contenu[m.start():fin].rstrip() + "\n"
    return out


def fusionner(F):
    D = F["dossier"]
    os.makedirs(D, exist_ok=True)
    frag = dict(re.findall(r"^@(\w+)\n(.*?)(?=^@\w+\n|\Z)", lire(f"tools/fusion/{D}.html"), flags=re.S | re.M))
    sources = {c for c, _ in F["chapitres"]}
    pages = {c: lire(f"{c}/fiche.html") for c in sources}
    contenus = {c: re.search(r'<main class="content">(.*)</main>', pages[c], re.S).group(1) for c in sources}
    chs = {c: chapitres(contenus[c]) for c in sources}
    num = {(c, n): i + 1 for i, (c, n) in enumerate(F["chapitres"])}
    problemes = []

    def cible(c, ancre):
        """Ancre d'une fiche d'origine -> ancre de la fiche fusionnée (None si le chapitre n'est pas repris)."""
        m = re.fullmatch(r"ch(\d+)(-[\w-]+)?", ancre or "")
        if m and (c, int(m.group(1))) in num:
            return f"ch{num[(c, int(m.group(1)))]}{m.group(2) or ''}"
        return None

    # ---- chapitres ----
    corps, applique, verif = [], {i: 0 for i in range(len(F["textes"]))}, {}
    for c, n in F["chapitres"]:
        N = num[(c, n)]
        h = chs[c][n]
        for i, (src, avant, apres) in enumerate(F["textes"]):
            if src == c and avant in h:
                applique[i] += h.count(avant)
                h = h.replace(avant, apres)
        verif[(c, n)] = h  # la version à comparer : celle de la source, renvois textuels compris
        h = re.sub(r'(<h2 id="ch)\d+(">)<span class="num">\d+\.</span>',
                   lambda m, N=N: f'{m.group(1)}{N}{m.group(2)}<span class="num">{N}.</span>', h)
        h = re.sub(r'(<h3 id="ch)\d+(-[\w-]+">)\d+\.', lambda m, N=N: f"{m.group(1)}{N}{m.group(2)}{N}.", h)
        h = re.sub(r"\b(id=\"|playSteps\(')anim-", lambda m, N=N: f"{m.group(1)}anim-c{N}-", h)

        def lien(m, c=c):
            chemin, ancre = m.group(1), m.group(2)
            cours = c if not chemin else re.match(r"\.\./([^/]+)/fiche\.html", chemin).group(1)
            if cours in sources:
                t = cible(cours, ancre)
                if t:
                    return f'href="#{t}"'
                if not ancre:
                    problemes.append(f"lien sans ancre vers un cours fusionné ({cours}) dans le chapitre {N}")
            return f'href="{chemin or f"../{c}/fiche.html"}#{ancre}"' if ancre else m.group(0)
        h = re.sub(r'href="((?:\.\./[^/"]+/fiche\.html)?)(?:#([^"]*))?"', lien, h)
        corps.append("<!-- ===================================================================== -->\n" + h)

    # ---- L'essentiel ----
    def bloc(c, cls):
        """Les puces du bloc « exam » ou « key-points » de L'essentiel d'une fiche (le bloc se ferme sur sa propre ligne)."""
        m = re.search(r'<h2 id="essentiel">.*?(?=<!-- =====)', contenus[c], re.S).group(0)
        i = m.find(f'<div class="{cls}">')
        return re.findall(r"<li>.*?</li>", m[i:m.find("\n</div>", i)], re.S) if i != -1 else []
    ess = ['<!-- ===================================================================== -->',
           '<h2 id="essentiel">★ L\'essentiel — à relire la veille</h2>', frag["examen"].strip()]
    annonces = []
    for c, titre, filtre in F["essentiel"]:
        items = [i for i in bloc(c, "exam") if not filtre or filtre in i]
        if items:
            annonces.append(f"<p><b>{titre}</b></p>\n<ul>\n" + "\n".join(items) + "\n</ul>")
    ess.append('<details class="case"><summary>Les annonces d\'origine, cours par cours<span class="sit">Ce que chaque '
               'fiche disait de l\'évaluation, mot pour mot</span></summary><div>\n' + "\n".join(annonces) + "\n</div></details>")
    vus = set()
    for i, (c, titre, filtre) in enumerate(F["essentiel"]):
        items = [x for x in bloc(c, "key-points") if (not filtre or filtre in x) and texte(x) not in vus]
        vus |= {texte(x) for x in items}
        ess.append(f'<h3 id="essentiel-{i + 1}">{titre}</h3>\n<div class="key-points">\n' + "\n".join(items) + "\n</div>")

    nb = len(F["chapitres"]) + 1
    titre_page = f"{F['code']} — {F['titre']}"
    fiche = f"""<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titre_page}</title>
<link rel="stylesheet" href="../assets/core.css?v=28">
<link rel="stylesheet" href="../assets/viz.css?v=12">
</head>
<body>
<!-- Généré par tools/fusionner.py à partir des fiches de cours : ne pas modifier à la main. -->

<header class="topbar">
  <div class="brand"><span class="dot"></span> {F['code']} <small>· {F['titre'].lower()}</small></div>
  <div class="spacer"></div>
  <input id="search" type="search" placeholder="Rechercher…  (Ctrl+K)">
  <a class="home" href="points-examen.html">Signaux d'examen</a>
  <a class="home" href="../index.html">← Accueil</a>
  <button class="btn ghost" onclick="toggleTheme()" title="Thème clair / sombre">◐</button>
  <button class="btn ghost" onclick="window.print()" title="Imprimer / PDF">⎙</button>
</header>

<div class="layout">
  <nav class="sidebar"><h4>Parcours</h4><div id="toc"></div></nav>
  <main class="content">
{frag['tete'].strip()}

{chr(10).join(ess)}

{frag['synthese'].strip()}

{chr(10).join(corps)}
<!-- ===================================================================== -->
<h2 id="qcm-sec"><span class="num">{nb}.</span> QCM —<span id="count-badge" class="badge acc"></span></h2>
<p><b>Une seule bonne réponse par question</b>, ordre tiré au hasard, correction expliquée. Une sélection des questions des trois cours :
les notions signalées par les intervenants, les distinctions et les définitions de base, classées par chapitre de cette fiche.
Les QCM complets restent dans les fiches de chaque cours. Pour s'entraîner aux conditions de vendredi : le mode « examen blanc ».</p>
<div id="qcm"></div>

  </main>
</div>

<button id="top" title="Haut de page">↑</button>
<script src="qcm.js?v=@V@"></script>
<script src="../assets/app.js?v=35"></script>
<script>initQCM(window.QCM_DATA, window.QCM_CHAPTERS, '{F['cle']}');</script>
</body>
</html>
"""

    # ---- QCM ----
    chap_titres, questions, exclues = {}, [], []
    for c in sources:
        src = lire(f"{c}/qcm.js")
        titres = read_global(src, "QCM_CHAPTERS", "};")
        for q in read_global(src, "QCM_DATA", "];"):
            if (c, q["ch"]) not in num:
                continue
            q = dict(q, id=f"{F['prefixe'][c]}-{q['id']}", ch=num[(c, q["ch"])])
            if q["id"] not in F["qcm_garder"]:
                exclues.append(q["id"])
                continue
            questions.append(q)
        for n, t in titres.items():
            if (c, int(n)) in num:
                chap_titres[num[(c, int(n))]] = t
    questions.sort(key=lambda q: (q["ch"], q["id"]))
    js = ["/* Généré par tools/fusionner.py à partir des QCM de cours : ne pas modifier à la main. */",
          "window.QCM_CHAPTERS = {"]
    js += [f"  {n}: {json.dumps(chap_titres[n], ensure_ascii=False)}," for n in sorted(chap_titres)]
    js[-1] = js[-1].rstrip(",")
    js += ["};", "", "window.QCM_DATA = ["]
    lignes = []
    for q in questions:
        o = ",\n     ".join(json.dumps(x, ensure_ascii=False) for x in q["o"])
        lignes.append(f'{{ id:{json.dumps(q["id"])}, ch:{q["ch"]}, d:{q["d"]},\n  q:{json.dumps(q["q"], ensure_ascii=False)},\n'
                      f'  o:[{o}],\n  a:{json.dumps(q["a"])},\n  e:{json.dumps(q["e"], ensure_ascii=False)} }}')
    js.append(",\n\n".join(lignes))
    js += ["", "];", ""]
    qcm = "\n".join(js)

    # ---- signaux d'examen ----
    sections = []
    for c, filtre in F["signaux"]:
        p = lire(f"{c}/points-examen.html")
        corps_px = re.search(r'<main class="px-wrap">(.*)</main>', p, re.S).group(1)
        corps_px = corps_px[corps_px.find('<div class="px-seance">'):] if filtre is None else corps_px
        morceaux = re.split(r'(?=<div class="px-seance">)', corps_px)
        garde = [m for m in morceaux if m.startswith('<div class="px-seance">') and (filtre is None or filtre in m.split("</div>")[0])]
        for m in garde:
            for i, (src, avant, apres) in enumerate(F["textes"]):
                if src == c and avant in m:
                    applique[i] += m.count(avant)
                    m = m.replace(avant, apres)

            def lien_px(x, c=c):
                chemin, ancre = x.group(1), x.group(2)
                cours = c if chemin == "fiche.html" else re.match(r"\.\./([^/]+)/fiche\.html", chemin).group(1)
                if ancre == "essentiel":
                    return 'href="fiche.html#essentiel"'
                t = cible(cours, ancre) if cours in sources else None
                return f'href="fiche.html#{t}"' if t else (f'href="../{cours}/fiche.html#{ancre}"' if cours != c or chemin != "fiche.html"
                                                            else f'href="../{c}/fiche.html#{ancre}"')
            m = re.sub(r'href="(fiche\.html|\.\./[^/"]+/fiche\.html)#([^"]*)"', lien_px, m)
            m = re.sub(r"→ Fiche §(\d+)", lambda y, c=c: f"→ Fiche §{num.get((c, int(y.group(1))), y.group(1))}", m)
            sections.append(m.rstrip())
    px = f"""<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{F['code']} — Ce que les profs ont signalé</title>
<link rel="stylesheet" href="../assets/core.css?v=28">
<link rel="stylesheet" href="../assets/viz.css?v=12">
</head>
<body>
<!-- Généré par tools/fusionner.py à partir des pages de cours : ne pas modifier à la main. -->

<header class="topbar">
  <div class="brand"><span class="dot"></span> {F['code']} <small>· signaux d'examen</small></div>
  <div class="spacer"></div>
  <a class="home" href="fiche.html">← La fiche</a>
  <a class="home" href="../index.html">Accueil</a>
  <button class="btn ghost" onclick="toggleTheme()" title="Thème clair / sombre">◐</button>
</header>

<main class="px-wrap">

<div class="hero" style="margin-top:22px">
  <h1>Ce que les profs ont signalé</h1>
  <p class="lead">Tous les passages où un intervenant a lui-même insisté, pour les cours du contrôle du 20 novembre : gestion de crise
  (entreprise, État, DSI) et module OSINT. Sous chaque citation, la réponse à savoir donner et le lien vers la fiche unique.
  L'intervention sur les menaces hybrides n'a pas de page de signaux : ses « idées à garder » sont au <a href="fiche.html#ch22-def">§ 22.1</a>.</p>
</div>

<div class="callout"><div class="t">Méthode</div>
Écartés : les étiquettes « point examen » ajoutées par l'outil de transcription, les anecdotes et les remarques des étudiants, et les
passages qui semblent reconstitués par l'outil. Les citations sont resserrées, sans en changer le sens. En gras, les signaux les plus forts.
</div>

{chr(10).join(chr(10) + s for s in sections)}

</main>

<button id="top" title="Haut de page">↑</button>
<script src="../assets/app.js?v=35"></script>
</body>
</html>
"""

    # ---- vérifications : rien de perdu, liens valides ----
    sortie = texte(fiche)
    problemes += [f"renvoi textuel appliqué {k} fois au lieu d'une : {F['textes'][i][1][:70]}"
                  for i, k in applique.items() if k != 1]
    for c, n in F["chapitres"]:
        manq = [p for p in phrases(verif[(c, n)]) if p not in sortie]
        problemes += [f"phrase perdue ({c} ch{n}) : {p[:90]}" for p in manq]
    for c, titre, filtre in F["essentiel"]:
        for i in bloc(c, "key-points") + bloc(c, "exam"):
            if (not filtre or filtre in i) and texte(i) not in sortie:
                problemes.append(f"point de l'essentiel perdu ({c}) : {texte(i)[:90]}")
    ids = re.findall(r'\bid="([^"]+)"', fiche)
    problemes += [f"identifiant en double : {i}" for i in sorted({i for i in ids if ids.count(i) > 1})]
    for a in re.findall(r'href="#([^"]+)"', fiche):
        if a not in ids:
            problemes.append(f"lien interne sans cible : #{a}")
    for a in re.findall(r'href="fiche\.html#([^"]+)"', px):
        if a not in ids:
            problemes.append(f"signal d'examen : lien sans cible fiche.html#{a}")
    for a in re.findall(r"playSteps\('([^']+)'\)", fiche):
        if a not in ids:
            problemes.append(f"animation sans cible : {a}")
    attendu = sum(1 for c in sources for q in read_global(lire(f"{c}/qcm.js"), "QCM_DATA", "];") if (c, q["ch"]) in num)
    if len(questions) + len(exclues) != attendu:
        problemes.append(f"QCM : {len(questions)} + {len(exclues)} écartées != {attendu} questions d'origine")
    inconnues = set(F["qcm_garder"]) - {q["id"] for q in questions}
    problemes += [f"QCM : question à garder introuvable : {i}" for i in sorted(inconnues)]
    if len(set(F["qcm_garder"])) != len(F["qcm_garder"]):
        problemes.append("QCM : identifiant en double dans qcm_garder")
    if len(questions) > F["qcm_max"]:
        problemes.append(f"QCM : {len(questions)} questions, plus que le maximum de {F['qcm_max']}")
    vides = sorted(set(range(1, len(F["chapitres"]) + 1)) - {q["ch"] for q in questions})
    problemes += [f"QCM : aucune question pour le chapitre {n}" for n in vides]
    for c, filtre in F["signaux"]:
        p = lire(f"{c}/points-examen.html")
        for item in re.findall(r'<div class="px-item.*?</blockquote>', p, re.S):
            seance = p[:p.find(item)].rsplit('<div class="px-seance">', 1)[-1].split("</div>")[0]
            if (filtre is None or filtre in seance) and texte(item) not in texte(px):
                problemes.append(f"signal d'examen perdu ({c}) : {texte(item)[:90]}")
    if problemes:
        print(f"{D} : {len(problemes)} problème(s), rien n'est écrit")
        for p in problemes:
            print("  -", p)
        return False

    # cache-busting : le ?v= du QCM suit son contenu
    v = 1
    if os.path.exists(f"{D}/qcm.js") and os.path.exists(f"{D}/fiche.html"):
        ancien = re.search(r'qcm\.js\?v=(\d+)', lire(f"{D}/fiche.html"))
        v = int(ancien.group(1)) + (lire(f"{D}/qcm.js") != qcm) if ancien else 1
    ecrire(f"{D}/fiche.html", fiche.replace("@V@", str(v)))
    ecrire(f"{D}/qcm.js", qcm)
    ecrire(f"{D}/points-examen.html", px)
    print(f"{D} : {len(F['chapitres'])} chapitres, {len(questions)} questions retenues sur {attendu}, "
          f"{len(re.findall('px-item', px))} signaux ; vérifié : aucune phrase, aucun point de l'essentiel ni aucun signal "
          f"perdu, chaque chapitre a ses questions, tous les liens internes résolus.")
    return True


ok = all([fusionner(F) for F in FUSIONS])
sys.exit(0 if ok else 1)
