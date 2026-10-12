"""Contrôle de l'architecture du site, à lancer depuis la racine du dépôt.

Usage : python -I tools/sitecheck.py

Vérifie :
  - chaque href / src local de chaque page pointe vers un fichier existant ;
  - chaque ancre (page.html#id ou #id) existe dans la page visée ;
  - chaque cours du catalogue a son dossier, ses pages et ses fichiers de QCM ;
  - la clé de QCM du catalogue est bien celle passée à initQCM dans la page ;
  - aucun fichier de cours n'est orphelin (absent du catalogue et jamais référencé) ;
  - chaque QCM passe tools/qcmcheck.py.
"""
import json
import os
import re
import subprocess
import sys
from html.parser import HTMLParser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jsdata import read_global  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.stdout.reconfigure(encoding="utf-8")  # accents corrects dans la console Windows
problems = []


class Refs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k == "id" and v:
                self.ids.add(v)
            # Les liens absolus (« / ») dépendent de l'hébergement : seul 404.html en a un.
            if k in ("href", "src") and v and not re.match(r"(https?:|mailto:|javascript:|data:|/)", v):
                self.refs.append(v)


def parse(path):
    p = Refs()
    p.feed(open(path, encoding="utf-8").read())
    return p


pages = sorted(
    os.path.join(d, f).replace("\\", "/").lstrip("./")
    for d, _, fs in os.walk(".") if ".git" not in d
    for f in fs if f.endswith(".html")
)
parsed = {p: parse(p) for p in pages}
referenced = set()

for page, p in parsed.items():
    here = os.path.dirname(page)
    for ref in p.refs:
        path, _, anchor = ref.partition("#")
        path = path.split("?")[0]
        target = os.path.normpath(os.path.join(here, path)).replace("\\", "/") if path else page
        referenced.add(target)
        if path and not os.path.isfile(target):
            problems.append(f"{page} : lien cassé -> {ref}")
            continue
        if anchor and target.endswith(".html"):
            ids = parsed.get(target, Refs()).ids
            # app.js préfixe chaque onglet par « sec- » : #sec-<id du h2> est valide.
            if anchor not in ids and anchor.removeprefix("sec-") not in ids:
                problems.append(f"{page} : ancre absente -> {ref}")

# ---- catalogue ----
src = open("catalogue.js", encoding="utf-8").read()
try:
    catalogue = read_global(src, "CATALOGUE", "\n];")
except (ValueError, json.JSONDecodeError) as ex:
    sys.exit(f"catalogue.js illisible : {ex}")

qcm_files = []
for c in catalogue:
    d = c["dossier"]
    if not os.path.isdir(d):
        problems.append(f"catalogue : dossier absent -> {d}")
        continue
    for r in c["ressources"]:
        page = f"{d}/{r['page']}"
        referenced.add(page)
        if not os.path.isfile(page):
            problems.append(f"catalogue : page absente -> {page}")
            continue
        if "qcm" in r:
            q = f"{d}/{r['qcm']['src']}"
            referenced.add(q)
            qcm_files.append(q)
            if not os.path.isfile(q):
                problems.append(f"catalogue : QCM absent -> {q}")
            html = open(page, encoding="utf-8").read()
            m = re.search(r"initQCM\([^)]*'([^']+)'\)", html)
            if not m or m.group(1) != r["qcm"]["cle"]:
                problems.append(f"{page} : clé initQCM {m.group(1) if m else '?'} != catalogue {r['qcm']['cle']}")
            if f'src="{r["qcm"]["src"]}' not in html:
                problems.append(f"{page} : ne charge pas {r['qcm']['src']}")

# ---- orphelins ----
for c in catalogue:
    for f in sorted(os.listdir(c["dossier"])):
        path = f"{c['dossier']}/{f}"
        if path not in referenced:
            problems.append(f"orphelin : {path} (ni au catalogue, ni référencé)")

# ---- QCM : défauts de contenu, signalés à part ----
warnings = []
for q in qcm_files:
    r = subprocess.run([sys.executable, "-I", "tools/qcmcheck.py", q], capture_output=True,
                       text=True, encoding="utf-8", errors="replace")
    first = r.stdout.splitlines()[0] if r.stdout else r.stderr.strip()
    print(f"QCM {q} : {first}")
    if r.returncode:
        detail = r.stdout.split("PROBLÈMES :")[-1].strip().splitlines() or [r.stderr.strip()]
        warnings += [f"{q} : {d.strip()}" for d in detail]

print(f"\n{len(pages)} pages, {len(catalogue)} cours, {len(qcm_files)} QCM")
print("ARCHITECTURE :", *(problems or ["aucun problème"]), sep="\n  ")
print("CONTENU DES QCM (python -I tools/qcmcheck.py <fichier>) :",
      *(warnings or ["aucun avertissement"]), sep="\n  ")
# Seule l'architecture fait échouer le contrôle : le contenu se corrige QCM par QCM.
sys.exit(1 if problems else 0)
