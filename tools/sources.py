"""Prépare en une commande toutes les sources d'une matière pour écrire sa fiche.

Usage : python -I tools/sources.py "<dossier de la matière>" <dossier de sortie>
        (sortie conseillée : le scratchpad de la session, jamais le dépôt)

Produit dans le dossier de sortie :
  INDEX.md            inventaire : chaque source, son volume, ses pages à regarder en image
  <source>.txt        le texte, page par page (« === page N === ») pour PDF, PPTX, DOCX
  planches-<n>.png    les pages pauvres en texte (schémas, photos, tableaux en image),
                      quatre par planche, lisibles d'un seul Read
Les transcriptions (.md, .txt) ne sont pas copiées : l'index donne leur chemin et leur taille,
à lire directement (par morceaux si elles dépassent ~90 Ko).

Page « à regarder » : elle contient une image couvrant au moins 15 % de la page (schéma,
capture, tableau scanné, photo). Le texte d'une telle image n'est PAS dans le .txt. Les pages
sans image (intercalaires, slides de texte) sont entièrement couvertes par le .txt. Seule la
zone de l'image est rendue, titrée par la première ligne de la diapositive.
"""
import os
import re
import sys
import zipfile

import warnings

warnings.filterwarnings("ignore", category=DeprecationWarning)
import pymupdf  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

COUVERTURE = 0.15


def police():
    # Police système qui gère les accents ; la police par défaut de PIL ne les affiche pas.
    for f in ("C:/Windows/Fonts/arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
              "/System/Library/Fonts/Supplemental/Arial.ttf"):
        if os.path.exists(f):
            return ImageFont.truetype(f, 16)
    return ImageFont.load_default()
PAR_PLANCHE = 4
LARGEUR = 1100          # largeur d'une page dans la planche : un schéma reste lisible

src_dir, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
sys.stdout.reconfigure(encoding="utf-8")


def nom(path):
    return re.sub(r"[^\w.-]+", "_", os.path.splitext(os.path.relpath(path, src_dir))[0])


def pdf(path):
    doc = pymupdf.open(path)
    pages, images = [], []
    for i, page in enumerate(doc, 1):
        t = page.get_text().strip()
        pages.append(f"=== page {i} ===\n{t}")
        aire = page.rect.width * page.rect.height
        grandes = [pymupdf.Rect(b["bbox"]) for b in page.get_image_info()
                   if pymupdf.Rect(b["bbox"]).get_area() >= COUVERTURE * aire]
        if grandes:
            zone = grandes[0]
            for r in grandes[1:]:
                zone |= r
            pix = page.get_pixmap(dpi=110, clip=zone & page.rect)
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            img.thumbnail((LARGEUR, LARGEUR))
            titre = t.splitlines()[0][:60] if t else ""
            images.append((f"{os.path.basename(path)} p.{i} | {titre}", img))
    return pages, images


def pptx(path):
    pages = []
    with zipfile.ZipFile(path) as z:
        slides = sorted((n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
                        key=lambda n: int(re.findall(r"\d+", n)[-1]))
        for i, n in enumerate(slides, 1):
            xml = z.read(n).decode("utf-8", "replace")
            pages.append(f"=== diapo {i} ===\n" + " ".join(re.findall(r"<a:t>([^<]*)</a:t>", xml)))
    return pages, []


def docx(path):
    import docx as d
    doc = d.Document(path)
    lignes = [p.text for p in doc.paragraphs if p.text.strip()]
    for k, t in enumerate(doc.tables, 1):
        lignes.append(f"--- tableau {k} ---")
        for row in t.rows:
            lignes.append(" | ".join(c.text.strip() for c in row.cells))
    return ["\n".join(lignes)], []


LECTEURS = {".pdf": pdf, ".pptx": pptx, ".docx": docx}
FONTE = police()
index, planches = [], []
for root, _, files in os.walk(src_dir):
    for f in sorted(files):
        path = os.path.join(root, f)
        ext = os.path.splitext(f)[1].lower()
        rel = os.path.relpath(path, src_dir)
        if ext in LECTEURS:
            pages, images = LECTEURS[ext](path)
            txt = os.path.join(out, nom(path) + ".txt")
            open(txt, "w", encoding="utf-8").write("\n\n".join(pages))
            a_voir = ", ".join(n.split(" p.")[1].split(" ")[0] for n, _ in images) or "aucune"
            index.append(f"| {rel} | {len(pages)} p. | {os.path.getsize(txt) // 1000} Ko de texte | à regarder : {a_voir} |")
            planches += images
        elif ext in (".md", ".txt"):
            index.append(f"| {rel} | transcription | {os.path.getsize(path) // 1000} Ko | lire directement |")
        else:
            index.append(f"| {rel} | ignoré ({ext or 'sans extension'}) | | |")

for k in range(0, len(planches), PAR_PLANCHE):
    lot = planches[k:k + PAR_PLANCHE]
    w = max(i.width for _, i in lot)
    h = sum(i.height + 28 for _, i in lot)
    sheet = Image.new("RGB", (w, h), "white")
    y = 0
    dr = ImageDraw.Draw(sheet)
    for titre, img in lot:
        dr.text((6, y + 5), titre, fill="black", font=FONTE)
        sheet.paste(img, (0, y + 28))
        y += img.height + 28
    sheet.save(os.path.join(out, f"planches-{k // PAR_PLANCHE + 1}.png"))

n_pl = (len(planches) + PAR_PLANCHE - 1) // PAR_PLANCHE
open(os.path.join(out, "INDEX.md"), "w", encoding="utf-8").write(
    f"# Sources de {os.path.basename(os.path.normpath(src_dir))}\n\n"
    "| Fichier | Volume | Texte | À regarder |\n|---|---|---|---|\n" + "\n".join(index) +
    f"\n\n{len(planches)} pages à regarder réparties sur {n_pl} planches (planches-N.png).\n")
print(open(os.path.join(out, "INDEX.md"), encoding="utf-8").read())
