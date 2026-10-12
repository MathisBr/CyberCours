"""Lecture des fichiers de données JavaScript du site (QCM, catalogue) sans node.

Les fichiers sont de la forme  window.NOM = [ ... ];  avec des clés nues.
to_json() met les clés entre guillemets en sautant les chaînes et les commentaires,
ce qui suffit pour ces fichiers, qui ne contiennent que des littéraux.
"""
import json

BACKSLASH = chr(92)


def to_json(text):
    """Met entre guillemets les clés nues, hors des chaînes ; retire les commentaires."""
    out, i, n = [], 0, len(text)
    while i < n:
        c = text[i]
        if c == '"':
            j = i + 1
            while text[j] != '"':
                j += 2 if text[j] == BACKSLASH else 1
            out.append(text[i:j + 1])
            i = j + 1
        elif text.startswith("/*", i):
            i = text.index("*/", i) + 2
        elif text.startswith("//", i):
            i = text.index("\n", i)
        elif c.isdigit():
            j = i
            while j < n and text[j].isdigit():
                j += 1
            key = text[j:].lstrip().startswith(":")
            out.append(('"%s"' if key else "%s") % text[i:j])
            i = j
        elif c.isalpha() or c == "_":
            j = i
            while j < n and (text[j].isalnum() or text[j] == "_"):
                j += 1
            out.append('"' + text[i:j] + '"')
            i = j
        elif c in "]}":
            # Virgule finale (« },\n] ») : valide en JavaScript, refusée par JSON.
            # On la retire ici ; qcmcheck la signale séparément.
            k = len(out) - 1
            while k >= 0 and out[k].isspace():
                k -= 1
            if k >= 0 and out[k] == ",":
                del out[k]
            out.append(c)
            i += 1
        else:
            out.append(c)
            i += 1
    return "".join(out)


def read_global(src, name, closer):
    """Renvoie la valeur de window.<name>, en s'arrêtant au premier <closer> ('];' ou '};')."""
    a = src.index("=", src.index("window." + name)) + 1
    b = src.index(closer, a) + len(closer) - 1  # inclut le crochet, pas le point-virgule
    return json.loads(to_json(src[a:b]))
