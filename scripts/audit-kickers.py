import os, re

root = r'd:\www\grafmen\aero'
pages = [
    'index.html',
    'strony-www/index.html',
    'modernizacja/index.html',
    'branding/index.html',
    'portfolio/index.html',
    'o-mnie/index.html',
    'blog/index.html',
    'kontakt/index.html',
    'templates/portfolio-project.html',
    'templates/portfolio-project-hiker.html'
]

out = []
for p in pages:
    fpath = os.path.join(root, p.replace('/', os.sep))
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = re.finditer(r'<p[^>]*class=["\'][^"\']*home-kicker[^"\']*["\'][^>]*>(.*?)</p>', content, re.DOTALL)
    out.append(f"=== {p} ===")
    for m in matches:
        out.append(f"  {m.group(1).strip()}")

with open(os.path.join(root, 'scripts/kickers-report.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print("Report written!")
