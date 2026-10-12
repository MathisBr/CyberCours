"""Génère les fichiers dérivés du site. À relancer après toute modification d'une fiche ou
d'un QCM (sitecheck.py le fait automatiquement).

Usage : python -I tools/generer.py

Produit à la racine du site :
  compteurs.js       window.QCM_COMPTES = { "dossier/qcm.js": nombre de questions }
                     → l'accueil affiche les compteurs sans charger les QCM.
  glossaire-data.js  window.GLOSSAIRE = [ { s: sigle, d: développé, c: code du cours,
                     u: "dossier/page.html#ancre" } ]  → page glossaire.html.

Glossaire : extrait des fiches les couples sigle / développé écrits sous l'une des formes
« SIGLE (développé) », « développé (SIGLE) » ou « SIGLE : développé ». Un couple n'est retenu
que si les lettres du sigle se retrouvent, dans l'ordre, parmi les initiales du développé :
c'est ce qui écarte les parenthèses qui ne sont pas des définitions.
"""
import html
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jsdata import read_global  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.stdout.reconfigure(encoding="utf-8")

PETITS = {"de", "des", "du", "d", "la", "le", "les", "l", "et", "en", "au", "aux", "a", "à", "pour",
          "par", "sur", "of", "the", "and", "for", "to", "in", "on", "with", "un", "une"}
SIGLE = r"[A-Z][A-Za-z0-9]*[A-Z][A-Za-z0-9-]*"


def mots(texte):
    return [m for m in re.split(r"[\s/'’\-–—]+", texte.strip()) if m]


def initiales(texte, garder_petits=False):
    out = []
    for m in mots(texte):
        m2 = re.sub(r"^[^\wÀ-ÿ]+", "", m)
        if not m2 or (m2.lower() in PETITS and not garder_petits):
            continue
        # Initiale sans accent : « Électroniques » donne « e ».
        out.append(unicodedata.normalize("NFD", m2[0].lower())[0])
        # Les capitales internes comptent : « OpenSSL », « WireGuard ».
        out += [c.lower() for c in m2[1:] if c.isupper()]
    return "".join(out)


def sous_suite(lettres, initi):
    it = iter(initi)
    return all(c in it for c in lettres)


def correspond(sigle, dev):
    lettres = re.sub(r"[^a-z]", "", sigle.lower())
    if len(lettres) < 2 or not dev or len(dev) > 90:
        return False
    # Un développé ne contient ni le sigle lui-même, ni plusieurs autres sigles.
    if sigle.upper() in (w.upper() for w in re.findall(r"\w+", dev)):
        return False
    autres = re.findall(r"\b[A-Z][A-Z0-9_]+\b", dev)
    if len(autres) > 1:
        return False
    # Un autre sigle n'est admis que s'il forme le début ou la fin du sigle défini
    # (SNAT = Source NAT, PVLAN = Private VLAN, AIMS = AI Management System).
    if autres and not (sigle.upper().endswith(autres[0]) or sigle.upper().startswith(autres[0])):
        return False
    # Pas plus d'un mot significatif de plus que de lettres : sinon c'est une phrase.
    significatifs = [m for m in mots(dev) if m.lower() not in PETITS]
    if len(significatifs) > len(lettres) + 1:
        return False
    ini = initiales(dev)
    return bool(ini) and ini[0] == lettres[0] and (sous_suite(lettres, ini) or sous_suite(lettres, initiales(dev, True)))


def suffixe_minimal(sigle, avant):
    """Dans « … texte qui précède (SIGLE) », le plus court suffixe qui développe le sigle."""
    # Découpage sur les espaces seulement : « d'importance » garde son apostrophe.
    debuts = [m.start() for m in re.finditer(r"\S+", avant)][-14:]
    for pos in reversed(debuts):
        cand = avant[pos:]
        if correspond(sigle, cand):
            return cand.strip(" ,;:")
    return None


def prefixe_minimal(sigle, apres):
    """Dans « SIGLE (développé, précision…) » ou « SIGLE : développé… », le plus court début
    qui développe le sigle, coupé sur un espace."""
    fins = [m.end() for m in re.finditer(r"\S+", apres)][:12]
    for pos in fins:
        cand = apres[:pos]
        if correspond(sigle, cand):
            return cand.strip(" ,;:")
    return None


def nettoyer(d):
    d = re.sub(r"\s+", " ", d).strip(" ,;:.—–-")
    d = re.sub(r"^(?:le|la|les|un|une|du|des)\s+|^[ld][’']", "", d, flags=re.I)   # « Le Code… » → « Code… »
    return d[0].upper() + d[1:] if d else d


def extraire(page_html, base_url, code):
    """Découpe la page aux titres <h2|h3 id> pour rattacher chaque sigle à son passage."""
    out = []
    morceaux = re.split(r'(<h[23] id="[^"]+")', page_html)
    ancre = ""
    for m in morceaux:
        t = re.match(r'<h[23] id="([^"]+)"', m)
        if t:
            ancre = t.group(1)
            continue
        m = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", m, flags=re.S)
        texte = html.unescape(re.sub(r"<[^>]+>", " ", m))
        texte = re.sub(r"\s+", " ", texte)
        url = base_url + ("#" + ancre if ancre else "")
        for s, d in re.findall(r"\b(" + SIGLE + r")\s*\(([^()]{3,90})\)", texte):
            d = prefixe_minimal(s, d)
            if d:
                out.append((s, nettoyer(d), code, url))
        for avant, s in re.findall(r"([^().;:!?]{3,140}?)\s*\((" + SIGLE + r")\)", texte):
            d = suffixe_minimal(s, avant)
            if d:
                out.append((s, nettoyer(d), code, url))
        for s, d in re.findall(r"\b(" + SIGLE + r")\s*[:—–]\s*([A-ZÀ-Ýa-zà-ÿ][^.;:()]{3,80})", texte):
            d2 = prefixe_minimal(s, d)
            if d2:
                out.append((s, nettoyer(d2), code, url))
    return out


catalogue = read_global(open("catalogue.js", encoding="utf-8").read(), "CATALOGUE", "\n];")

# ---- compteurs ----
comptes = {}
for c in catalogue:
    for r in c["ressources"]:
        if "qcm" in r:
            src = f"{c['dossier']}/{r['qcm']['src']}"
            comptes[src] = len(read_global(open(src, encoding="utf-8").read(), "QCM_DATA", "];"))
open("compteurs.js", "w", encoding="utf-8").write(
    "/* Généré par tools/generer.py : ne pas modifier à la main. */\n"
    "window.QCM_COMPTES = " + json.dumps(comptes, ensure_ascii=False, indent=1) + ";\n")

# ---- glossaire ----
vus, entrees = {}, []
for c in catalogue:
    for r in c["ressources"]:
        page = f"{c['dossier']}/{r['page']}"
        for s, d, code, url in extraire(open(page, encoding="utf-8").read(), page, c["code"]):
            cle = (s.upper(), re.sub(r"[^a-z0-9]", "", d.lower()))
            if cle in vus:
                if code not in vus[cle]["c"]:
                    vus[cle]["c"].append(code)
                    vus[cle]["u"].append(url)
                continue
            e = {"s": s, "d": d, "c": [code], "u": [url]}
            vus[cle] = e
            entrees.append(e)
# Pour un même sigle, deux développés presque identiques (casse, pluriel) : on garde le plus court.
entrees.sort(key=lambda e: (e["s"].upper(), len(e["d"])))
final, dernier = [], {}
for e in entrees:
    k = e["s"].upper()
    racine = re.sub(r"[^a-z]", "", e["d"].lower())[:14]
    if k in dernier and dernier[k] == racine:
        continue
    dernier[k] = racine
    final.append(e)
open("glossaire-data.js", "w", encoding="utf-8").write(
    "/* Généré par tools/generer.py : ne pas modifier à la main. */\n"
    "window.GLOSSAIRE = " + json.dumps(final, ensure_ascii=False, separators=(",", ":")) + ";\n")

print(f"compteurs.js : {len(comptes)} QCM · glossaire-data.js : {len(final)} sigles "
      f"({len({e['s'].upper() for e in final})} distincts)")
