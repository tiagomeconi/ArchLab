"""Gera src/fonts/material-symbols-subset.woff2 só com os ícones usados no código (Material Symbols Rounded).
Uso: python3 scripts/subset-icons.py   (requer fonttools + brotli)"""
import re, subprocess, sys, pathlib
from fontTools.ttLib import TTFont

root = pathlib.Path(__file__).resolve().parent.parent
font_path = root / "node_modules/@fontsource-variable/material-symbols-rounded/files/material-symbols-rounded-latin-full-normal.woff2"
f = TTFont(str(font_path))
cmap = f.getBestCmap(); rev = {g: chr(c) for c, g in cmap.items()}
liga = {}
for lookup in f["GSUB"].table.LookupList.Lookup:
    for st in lookup.SubTable:
        st = getattr(st, "ExtSubTable", st)
        if hasattr(st, "ligatures"):
            for first, ligs in st.ligatures.items():
                for l in ligs:
                    name = "".join(rev.get(g, "?") for g in [first] + list(l.Component))
                    if re.fullmatch(r"[a-z0-9_]+", name): liga[name] = l.LigGlyph
words = set()
for p in (root / "src").rglob("*"):
    if p.suffix in {".ts", ".tsx"} and "generated" not in p.name:
        words |= set(re.findall(r"[a-z][a-z0-9_]+", p.read_text(encoding="utf-8", errors="ignore")))
used = sorted(w for w in words if w in liga)
print(len(used), "ícones:", ", ".join(used[:12]), "…")
# glifos a manter: as letras (entrada das ligaduras) + o glifo-saída de cada ícone usado. Sem fechamento de layout,
# o subsetter descarta as demais ligaduras (senão ele manteria os ~4.000 ícones).
letters = [cmap[ord(c)] for c in "abcdefghijklmnopqrstuvwxyz_0123456789"]
glyphs = sorted(set(letters + [liga[w] for w in used] + [".notdef"]))
out = root / "src/fonts/material-symbols-subset.woff2"
subprocess.run([sys.executable, "-m", "fontTools.subset", str(font_path), f"--glyphs={','.join(glyphs)}", "--no-layout-closure", "--layout-features=liga,rlig,calt", "--flavor=woff2",
                f"--output-file={out}", "--no-hinting", "--drop-tables+=DSIG"], check=True)
print("gerado:", out.stat().st_size // 1024, "KB")

# versiona a URL da fonte no CSS: quebra o cache do navegador sempre que o conjunto de ícones muda
import hashlib
ver = hashlib.sha1(out.read_bytes()).hexdigest()[:8]
css = root / "src/styles.css"
txt = css.read_text(encoding="utf-8")
new = re.sub(r'material-symbols-subset\.woff2(\?v=[0-9a-f]+)?', f"material-symbols-subset.woff2?v={ver}", txt, count=1)
css.write_text(new, encoding="utf-8")
print("versão da fonte:", ver)
