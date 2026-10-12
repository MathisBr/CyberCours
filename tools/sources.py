"""Prépare en une commande toutes les sources d'une matière pour écrire sa fiche.

Usage : python -I tools/sources.py "<dossier de la matière>" <dossier de sortie>
        (sortie conseillée : le scratchpad de la session, jamais le dépôt)

Produit dans le dossier de sortie :
  INDEX.md            inventaire : chaque source, son volume, ses pages à regarder en image
  <source>.txt        le texte, page par page (« === page N === ») pour PDF, PPTX, DOCX, ODT
  planches-<n>.png    les pages contenant une image, quatre par planche, lisibles d'un seul Read
Les transcriptions (.md, .txt) ne sont pas copiées : l'index donne leur chemin et leur taille,
à lire directement (par morceaux si elles dépassent ~90 Ko).

Page « à regarder » : elle contient une image couvrant au moins 15 % de la page (schéma,
capture, tableau scanné, photo). Le texte d'une telle image n'est PAS dans le .txt. Les pages
sans image (intercalaires, slides de texte) sont entièrement couvertes par le .txt. Seule la
zone de l'image est rendue, titrée par la première ligne de la diapositive.

Module importable : lire(path, images=False) renvoie (pages, images) pour tools/couverture.py.
"""
import os
import re
import sys
import warnings
import zipfile

warnings.filterwarnings("ignore", category=DeprecationWarning)
import pymupdf  # noqa: E402
from PIL import Image, ImageDraw, ImageFont  # noqa: E402

COUVERTURE = 0.15     # part minimale de la page occupée par une image pour la regarder
PAR_PLANCHE = 4
LARGEUR = 1100        # largeur d'une page dans la planche : un schéma reste lisible
TEXTE = (".md", ".txt")


def police():
    # Police système qui gère les accents ; la police par défaut de PIL ne les affiche pas.
    for f in ("C:/Windows/Fonts/arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
              "/System/Library/Fonts/Supplemental/Arial.ttf"):
        if os.path.exists(f):
            return ImageFont.truetype(f, 16)
    return ImageFont.load_default()


def pdf(path, images=True):
    doc = pymupdf.open(path)
    pages, imgs = [], []
    for i, page in enumerate(doc, 1):
        t = page.get_text().strip()
        pages.append(f"=== page {i} ===\n{t}")
        if not images:
            continue
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
            imgs.append((f"{os.path.basename(path)} p.{i} | {titre}", img))
    return pages, imgs


def _xml_zip(path, motif, balise, entete):
    pages = []
    with zipfile.ZipFile(path) as z:
        noms = sorted((n for n in z.namelist() if re.match(motif, n)),
                      key=lambda n: [int(x) for x in re.findall(r"\d+", n)] or [0])
        for i, n in enumerate(noms, 1):
            xml = z.read(n).decode("utf-8", "replace")
            texte = " ".join(re.findall(balise, xml))
            pages.append(f"=== {entete} {i} ===\n" + re.sub(r"<[^>]+>", "", texte))
    return pages


def pptx(path, images=True):
    return _xml_zip(path, r"ppt/slides/slide\d+\.xml$", r"<a:t>([^<]*)</a:t>", "diapo"), []


def odt(path, images=True):
    return _xml_zip(path, r"content\.xml$", r"<text:[ph][^>]*>(.*?)</text:[ph]>", "document"), []


def docx(path, images=True):
    import docx as d
    doc = d.Document(path)
    lignes = [p.text for p in doc.paragraphs if p.text.strip()]
    for k, t in enumerate(doc.tables, 1):
        lignes.append(f"--- tableau {k} ---")
        for row in t.rows:
            lignes.append(" | ".join(c.text.strip() for c in row.cells))
    return ["\n".join(lignes)], []


LECTEURS = {".pdf": pdf, ".pptx": pptx, ".docx": docx, ".odt": odt}


def lire(path, images=False):
    """(pages, images) d'un document ; pages = [texte] pour une transcription."""
    ext = os.path.splitext(path)[1].lower()
    if ext in LECTEURS:
        return LECTEURS[ext](path, images)
    if ext in TEXTE:
        return [open(path, encoding="utf-8", errors="replace").read()], []
    return None, []


def main(src_dir, out):
    os.makedirs(out, exist_ok=True)
    fonte = police()
    index, planches = [], []
    for root, _, files in os.walk(src_dir):
        for f in sorted(files):
            path = os.path.join(root, f)
            ext = os.path.splitext(f)[1].lower()
            rel = os.path.relpath(path, src_dir)
            if ext in LECTEURS:
                pages, images = LECTEURS[ext](path)
                nom = re.sub(r"[^\w.-]+", "_", os.path.splitext(rel)[0])
                txt = os.path.join(out, nom + ".txt")
                open(txt, "w", encoding="utf-8").write("\n\n".join(pages))
                a_voir = ", ".join(n.split(" p.")[1].split(" ")[0] for n, _ in images) or "aucune"
                index.append(f"| {rel} | {len(pages)} p. | {os.path.getsize(txt) // 1000} Ko de texte "
                             f"| à regarder : {a_voir} |")
                planches += images
            elif ext in TEXTE:
                index.append(f"| {rel} | transcription | {os.path.getsize(path) // 1000} Ko | lire directement |")
            else:
                index.append(f"| {rel} | ignoré ({ext or 'sans extension'}) | | |")

    for k in range(0, len(planches), PAR_PLANCHE):
        lot = planches[k:k + PAR_PLANCHE]
        sheet = Image.new("RGB", (max(i.width for _, i in lot), sum(i.height + 28 for _, i in lot)), "white")
        dr, y = ImageDraw.Draw(sheet), 0
        for titre, img in lot:
            dr.text((6, y + 5), titre, fill="black", font=fonte)
            sheet.paste(img, (0, y + 28))
            y += img.height + 28
        sheet.save(os.path.join(out, f"planches-{k // PAR_PLANCHE + 1}.png"))

    n_pl = (len(planches) + PAR_PLANCHE - 1) // PAR_PLANCHE
    texte = (f"# Sources de {os.path.basename(os.path.normpath(src_dir))}\n\n"
             "| Fichier | Volume | Texte | À regarder |\n|---|---|---|---|\n" + "\n".join(index) +
             f"\n\n{len(planches)} pages à regarder réparties sur {n_pl} planches (planches-N.png).\n")
    open(os.path.join(out, "INDEX.md"), "w", encoding="utf-8").write(texte)
    print(texte)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main(sys.argv[1], sys.argv[2])
