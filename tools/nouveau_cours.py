"""Crée un nouveau cours en une commande : dossier, fiche squelette, QCM squelette, catalogue.

Usage :
  python -I tools/nouveau_cours.py CODE sujet "Titre complet" [--couleur purple] [--clore]

  CODE      code du module, par exemple INF5050
  sujet     suffixe du dossier, en minuscules avec tirets, par exemple forensic
  --couleur red | amber | blue | green | purple (défaut : purple)
  --clore   passe les cours « en cours » existants à « terminé »

Exemple :
  python -I tools/nouveau_cours.py INF5050 forensic "Investigation numérique" --couleur red --clore
  -> crée inf5050-forensic/fiche.html et qcm.js, et ajoute l'entrée en tête de catalogue.js
     (résumé et programme à compléter), puis lance sitecheck.
"""
import argparse
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.stdout.reconfigure(encoding="utf-8")

ap = argparse.ArgumentParser()
ap.add_argument("code")
ap.add_argument("sujet")
ap.add_argument("titre")
ap.add_argument("--couleur", default="purple", choices=["red", "amber", "blue", "green", "purple"])
ap.add_argument("--clore", action="store_true")
a = ap.parse_args()

code = a.code.upper()
cle = code.lower()
dossier = f"{cle}-{a.sujet.lower()}"
if not re.fullmatch(r"[a-z0-9]+-[a-z0-9-]+", dossier):
    sys.exit(f"nom de dossier invalide : {dossier}")
if os.path.exists(dossier):
    sys.exit(f"{dossier}/ existe déjà : rien n'est modifié")

valeurs = {"{{CODE}}": code, "{{TITRE}}": a.titre, "{{TITRE_COURT}}": a.titre.lower(),
           "{{CLE}}": cle, "{{DOSSIER}}": dossier}
os.makedirs(dossier)
for f in ("fiche.html", "qcm.js"):
    t = open(f"tools/modele/{f}", encoding="utf-8").read()
    for k, v in valeurs.items():
        t = t.replace(k, v)
    open(f"{dossier}/{f}", "w", encoding="utf-8").write(t)

cat = open("catalogue.js", encoding="utf-8").read()
if a.clore:
    cat = cat.replace('etat: "en cours"', 'etat: "terminé"')
entree = f'''{{
  code: "{code}",
  titre: "{a.titre}",
  dossier: "{dossier}",
  etat: "en cours",
  couleur: "{a.couleur}",
  resume: "À compléter : une phrase sur le fil rouge du cours.",
  programme: [
    "À compléter"
  ],
  ressources: [
    {{ type: "fiche", page: "fiche.html", titre: "Fiche de révision",
      desc: "À compléter : sources couvertes",
      qcm: {{ src: "qcm.js", cle: "{cle}" }} }}
  ]
}},

'''
marque = "window.CATALOGUE = [\n\n"
if marque not in cat:
    sys.exit("catalogue.js : début de liste introuvable")
cat = cat.replace(marque, marque + entree, 1)
open("catalogue.js", "w", encoding="utf-8").write(cat)

print(f"Créé : {dossier}/fiche.html, {dossier}/qcm.js ; entrée ajoutée en tête de catalogue.js")
print("À compléter : résumé, programme et description dans catalogue.js, puis la fiche et le QCM.", flush=True)
subprocess.run([sys.executable, "-I", "tools/sitecheck.py"])
