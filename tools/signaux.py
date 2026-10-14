"""Relève dans les transcriptions les passages où l'enseignant signale un point d'examen.

Usage : python -I tools/signaux.py "<dossier des transcriptions>"

Cherche les formules d'insistance (interro, partiel, examen, « si je vous pose une question »,
« super important », « c'est la clé », « à connaître », « faute professionnelle »…) dans les
paragraphes de parole, en ignorant les encadrés « > » ajoutés par l'outil de transcription.
Chaque passage est affiché avec son horodatage, pour construire la page points-examen.html du
cours : ne garder que les déclarations explicites, et mettre la réponse attendue dessous.
"""
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

MOTIFS = re.compile(
    r"interro|partiel|examen|je vous pose|vous poser|je pose une question|questions? là-dessus|"
    r"vous aurez des questions|super important|hyper important|très (très )*important|important les gars|"
    r"c'est la clé|c'est la base|à conna[iî]tre|faut conna[iî]tre|faute professionnelle|retenez|"
    r"par c[oœ]ur|ça donne pas de points|règle d'or|règle capitale|le plus important",
    re.I)

dossier = sys.argv[1]
total = 0
for f in sorted(os.listdir(dossier)):
    if not f.lower().endswith((".md", ".txt")):
        continue
    print(f"\n########## {f}")
    for ligne in open(os.path.join(dossier, f), encoding="utf-8", errors="replace"):
        ligne = ligne.strip()
        if not ligne or ligne.startswith((">", "#")):
            continue                      # encadrés et titres : rédigés par l'outil, pas par le prof
        for m in MOTIFS.finditer(ligne):
            temps = re.match(r"\*\*\[(\d[\d:]*)\]\*\*", ligne)
            debut, fin = max(0, m.start() - 170), min(len(ligne), m.end() + 150)
            print(f"[{temps.group(1) if temps else '?'}] …{ligne[debut:fin]}…")
            total += 1
print(f"\n{total} passage(s) à trier.")
