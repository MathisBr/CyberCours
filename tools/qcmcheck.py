"""Contrôle d'un fichier data/qcm-*.js avant livraison.

Usage : python -I tools/qcmcheck.py data/qcm-xxx.js

Vérifie : syntaxe (conversion JS -> JSON, sans node), virgules finales, ids uniques,
chapitres connus, index de réponse valides, indices de forme présents seulement dans
les bonnes réponses, renvois de position dans les explications, et la proportion de
questions où la bonne réponse est la plus longue (cible < 80 %).
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from jsdata import read_global  # noqa: E402

path = sys.argv[1]
src = open(path, encoding="utf-8").read()


def block(name, closer):
    return read_global(src, name, closer)


sys.stdout.reconfigure(encoding="utf-8")  # accents corrects dans la console Windows
problems = []
try:
    CH = {str(k): v for k, v in block("QCM_CHAPTERS", "};").items()}
    Q = block("QCM_DATA", "];")
except Exception as ex:  # noqa: BLE001
    sys.exit(f"SYNTAXE KO : {ex}")

if re.search(r",\s*[\]\}]", re.sub(r"/\*.*?\*/", "", src, flags=re.S)):
    problems.append("virgule finale avant ] ou }")

seen = set()
for q in Q:
    if q["id"] in seen:
        problems.append(f"id en double : {q['id']}")
    seen.add(q["id"])
    if str(q["ch"]) not in CH:
        problems.append(f"{q['id']} : chapitre {q['ch']} inconnu")
    if any(i >= len(q["o"]) for i in q["a"]):
        problems.append(f"{q['id']} : index de réponse hors limites")

MARKS = {"<b>": "<b>", "<i>": "<i>", "guillemets": "«", "nbsp": "&nbsp;"}
for q in Q:
    good = [q["o"][i] for i in q["a"]]
    bad = [o for i, o in enumerate(q["o"]) if i not in q["a"]]
    for name, m in MARKS.items():
        if any(m in g for g in good) and not any(m in b for b in bad):
            problems.append(f"{q['id']} : indice de forme ({name}) seulement dans la bonne réponse")

POS = re.compile(r"(premi[eè]re|deuxi[eè]me|seconde|troisi[eè]me|quatri[eè]me|derni[eè]re)\s+"
                 r"(r[ée]ponse|proposition|option)", re.I)
for q in Q:
    if POS.search(q["e"]):
        problems.append(f"{q['id']} : renvoi de position dans l'explication")

single = [q for q in Q if len(q["a"]) == 1]
longest = [q["id"] for q in single if len(q["o"][q["a"][0]]) == max(len(o) for o in q["o"])]
ratio = len(longest) / len(single) if single else 0
pos = [0] * 6
for q in single:
    pos[q["a"][0]] += 1

print(f"{len(Q)} questions, {len(CH)} chapitres, {len(Q) - len(single)} à réponses multiples")
print("par chapitre :", {k: sum(1 for q in Q if str(q['ch']) == k) for k in CH})
print(f"bonne réponse = la plus longue : {len(longest)}/{len(single)} ({ratio:.0%}, cible < 80 %)")
print("position des bonnes réponses dans le fichier :", pos[:4])
if ratio >= 0.8:
    problems.append("bonne réponse trop souvent la plus longue")
print("PROBLÈMES :" if problems else "aucun problème", *problems, sep="\n  ")
sys.exit(1 if problems else 0)
