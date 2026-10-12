"""Contrôle de couverture : ce que disent les sources d'un cours et que ses pages ne disent pas.

Usage : python -I tools/couverture.py <dossier-du-cours> [--tout]
        python -I tools/couverture.py --tous

Lit les sources déclarées dans catalogue.js (champ « sources », relatif à la racine du site),
dans les sous-dossiers dont le nom contient support, transcri ou tp. Puis cherche dans toutes
les pages .html du cours :
  1. les TITRES de diapositives (première ligne de chaque page de PDF / PPTX) : un titre est
     couvert si tous ses mots significatifs figurent dans la fiche ;
  2. les SIGLES (2 à 6 capitales, chiffres permis) des supports, ou cités au moins deux fois à
     l'oral ; les noms propres en capitales (« Prénom NOM ») sont écartés automatiquement ;
  3. les TERMES EN GRAS des transcriptions (**terme**), mêmes règles que les titres.

C'est un filet, pas un juge : il détecte un mot absent, pas une notion mal expliquée. Chaque
manque se trie à la main : notion à ajouter, ou bruit à déclarer dans
tools/couverture_ignore.txt (« dossier | terme », ou « * | terme » pour tous les cours).
Ne jamais y écrire de nom de personne : le dépôt est public. Pour ignorer un nom, écrire son
empreinte : `python -I tools/couverture.py --empreinte "NOM"` donne la ligne `* | h:…` à coller.
"""
import fnmatch
import hashlib
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jsdata import read_global  # noqa: E402
from sources import lire  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.stdout.reconfigure(encoding="utf-8")

DOSSIERS = re.compile(r"support|transcri|^tps?$|^tp[ _-]", re.I)
VIDES = set("""le la les un une des du de d l au aux et ou en dans sur sous par pour avec sans
ce cet cette ces son sa ses leur leurs que qui quoi dont est sont etre avoir faire plus moins tres
comment pourquoi quel quelle quels quelles tout tous toute toutes autre autres entre vers chez
ne pas se si on il ils elle elles nous vous a y n s c qu j m t""".split())
GENERIQUES = re.compile(r"^(sommaire|plan|introduction|conclusions?|merci.*|feedback|questions?"
                        r"|annexes?|bibliographie|references|definitions?|rappels?|objectifs?.*"
                        r"|tp ?n?.*|td ?n?.*|lab.*|exercices?.*|partie .*|chapitre .*|seance .*"
                        r"|qu est ce que c est|esiea.*|syllabus.*)$")
META = re.compile(r"^(date|duree|enseignant|cours|fichier source|intervenant|lieu|horaire)")


def norm(t):
    t = "".join(c for c in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-z0-9]+", " ", t)                        # apostrophes typographiques comprises
    return re.sub(r"(?<=[a-z])(?=[0-9])", " ", t).strip()    # « NIS2 » = « NIS 2 »


def mots(t):
    return [m for m in norm(t).split() if len(m) > 2 and m not in VIDES and not m.isdigit()]


def couvert(terme, texte, vocab):
    n = norm(terme)
    if not n:
        return True
    if f" {n} " in texte:
        return True
    # Un intitulé long est couvert si l'essentiel de ses mots y est : 100 % jusqu'à deux mots,
    # 70 % au-delà (« Les différents types d'évaluation » ≈ « Types d'évaluation »).
    ms = mots(terme)
    if not ms:
        return True
    present = sum(m in vocab for m in ms)
    return present == len(ms) if len(ms) <= 2 else present >= 0.7 * len(ms)


def ignores(dossier):
    path = "tools/couverture_ignore.txt"
    if not os.path.exists(path):
        return set()
    out = set()
    for ligne in open(path, encoding="utf-8"):
        if "|" in ligne and not ligne.lstrip().startswith("#"):
            d, t = (x.strip() for x in ligne.split("|", 1))
            if d in ("*", dossier):
                out.add(t[2:] if t.startswith("h:") else norm(t))
    return out


def empreinte(terme):
    """Empreinte courte d'un terme : permet d'ignorer un nom de personne sans l'écrire."""
    return hashlib.sha256(norm(terme).encode()).hexdigest()[:12]


def ignore(terme, ign):
    return norm(terme) in ign or empreinte(terme) in ign


def analyser(cours, tout=False):
    dossier, src = cours["dossier"], cours.get("sources")
    if not src or not os.path.isdir(src):
        print(f"\n## {cours['code']} : sources introuvables ({src}) — champ « sources » du catalogue")
        return 0
    pages_html = [f for f in os.listdir(dossier) if f.endswith(".html")]
    brut = " ".join(open(os.path.join(dossier, f), encoding="utf-8").read() for f in pages_html)
    brut = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", brut, flags=re.S)
    import html as h
    texte = " " + norm(h.unescape(re.sub(r"<[^>]+>", " ", brut))) + " "
    vocab = set(texte.split())

    titres, supports, oral, gras = {}, [], [], {}
    for racine, dirs, files in os.walk(src):
        rel = os.path.relpath(racine, src)
        haut = rel.split(os.sep)[0]
        if rel != "." and not DOSSIERS.search(haut):
            continue
        for f in files:
            path = os.path.join(racine, f)
            # Nos propres productions (devoir, compte rendu de lab, fiche générée) ne sont pas
            # des sources : motifs « exclure » du catalogue, sur le nom de fichier.
            if any(fnmatch.fnmatch(f.lower(), m.lower()) for m in cours.get("exclure", [])):
                continue
            pages, _ = lire(path)
            if pages is None:
                continue
            nom = os.path.relpath(path, src)
            if f.lower().endswith((".md", ".txt")):
                oral.append(pages[0])
                for g in re.findall(r"\*\*([^*\n]{3,60})\*\*", pages[0]):
                    g = g.strip(" :.")
                    # Un terme technique tient en trois mots ; au-delà, c'est un intertitre
                    # rédigé par l'outil de transcription, pas une notion.
                    if (re.match(r"^[A-ZÀ-Ý0-9]", g) and not META.match(norm(g))
                            and not re.match(r"diapositive \d", norm(g)) and len(mots(g)) <= 3):
                        gras.setdefault(g, nom)
            else:
                supports.append("\n".join(pages))
                for p in pages:
                    lignes = [x.strip() for x in p.split("\n")[1:] if x.strip()]
                    if lignes:
                        t = re.sub(r"\s*\(\d+\)$", "", lignes[0])
                        # Un titre est court et rédigé : pas de balise, de flèche, ni de phrase entière.
                        if (3 < len(t) <= 90 and re.match(r"^[A-ZÀ-Ý0-9]", t) and not re.search(r"[<>=]|\.\.\.", t)
                                and not GENERIQUES.match(norm(t)) and not norm(t).isdigit()):
                            titres.setdefault(t, nom)

    # Adresses et signatures (« x@ECOLE.2026 ») : jamais des notions.
    supports = [re.sub(r"\S*@\S*", " ", t) for t in supports]
    oral = [re.sub(r"\S*@\S*", " ", t) for t in oral]
    tout_texte = "\n".join(supports + oral)
    noms = set(re.findall(r"\b[A-ZÉ][a-zéèëï]+(?:-[A-ZÉ][a-zéèëï]+)?\s+([A-Z][A-Z]{2,})\b", tout_texte))
    sig_sup = re.findall(r"\b([A-Z][A-Z0-9]{1,5})\b", "\n".join(supports))
    sig_oral = re.findall(r"\b([A-Z][A-Z0-9]{1,5})\b", "\n".join(oral))
    tous = sig_sup + sig_oral

    def credible(s):
        # Identifiant (AE01, BS7, D21) ou mot long en capitales (nom, intitulé) : seulement s'il
        # revient souvent. Un vrai sigle de cours est répété ; un nom ou un identifiant de TP non.
        if re.fullmatch(r"[A-Z]{1,3}[0-9]{1,3}", s) or (s.isalpha() and len(s) >= 5):
            return tous.count(s) >= 3
        return True

    candidats = {s for s in set(sig_sup) | {s for s in set(sig_oral) if sig_oral.count(s) >= 2}
                 if credible(s)}
    ign = ignores(dossier)

    manques = {
        "Titres de diapositives": sorted(t for t in titres if not couvert(t, texte, vocab) and not ignore(t, ign)),
        "Sigles": sorted(s for s in candidats - noms
                         if f" {norm(s)} " not in texte and not s.isdigit() and not ignore(s, ign)),
        "Termes en gras des transcriptions": sorted(g for g in gras
                                                    if not couvert(g, texte, vocab) and not ignore(g, ign)),
    }
    total = sum(len(v) for v in manques.values())
    print(f"\n## {cours['code']} — {cours['titre']} : {total} manque(s) "
          f"[{len(titres)} titres, {len(candidats - noms)} sigles, {len(gras)} termes en gras contrôlés]")
    for cat, liste in manques.items():
        if liste:
            montre = liste if tout else liste[:40]
            print(f"- {cat} ({len(liste)}) : " + " · ".join(montre) + (" · …" if len(liste) > len(montre) else ""))
    return total


if "--empreinte" in sys.argv:
    # python -I tools/couverture.py --empreinte "TERME" -> ligne à copier dans couverture_ignore.txt
    t = sys.argv[sys.argv.index("--empreinte") + 1]
    sys.exit(print(f"* | h:{empreinte(t)}") or 0)
catalogue = read_global(open("catalogue.js", encoding="utf-8").read(), "CATALOGUE", "\n];")
args = [a for a in sys.argv[1:] if not a.startswith("--")]
cibles = catalogue if "--tous" in sys.argv else [c for c in catalogue if c["dossier"] in args]
if not cibles:
    sys.exit("Usage : python -I tools/couverture.py <dossier-du-cours> | --tous  [--tout]")
for c in cibles:
    analyser(c, "--tout" in sys.argv)
