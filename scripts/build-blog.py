"""Build static blog pages using only Python's standard library.

Run: python scripts/build-blog.py
Preview the template, without publishing a post: python scripts/build-blog.py --preview
"""
import argparse
from datetime import date
from html import escape
import json
from pathlib import Path
import re
from string import Template
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://grafmen.com'
NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
GENERATED_MARKER = '<!-- GRAFMEN_GENERATED_BLOG -->'


def validate_post(post):
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', post['slug']):
        raise ValueError('Slug must use lowercase letters, digits and hyphens.')
    for key in ['title', 'description', 'category', 'date']:
        if not isinstance(post.get(key), str) or not post[key].strip():
            raise ValueError(f'Missing post field: {key}')
    date.fromisoformat(post['date'])
    if post.get('updated'):
        if date.fromisoformat(post['updated']) < date.fromisoformat(post['date']):
            raise ValueError('Updated date cannot precede publication.')
    if not post.get('body'):
        raise ValueError('A published article needs content.')


def body_html(blocks):
    output = []
    for block in blocks:
        kind = block['type']
        if kind in ('paragraph', 'heading'):
            tag = 'p' if kind == 'paragraph' else 'h2'
            output.append(f'<{tag}>{escape(block["text"])}</{tag}>')
        elif kind == 'list':
            output.append('<ul>' + ''.join(f'<li>{escape(t)}</li>' for t in block['items']) + '</ul>')
        else:
            raise ValueError(f'Unsupported content block: {kind}')
    return '\n'.join(output)


def render_post(post, template, preview=False):
    validate_post(post)
    url = ORIGIN + '/blog/' + post['slug'] + '/'
    if preview:
        meta = '<meta name="robots" content="noindex,nofollow">'
    else:
        schema = {'@context': 'https://schema.org', '@type': 'BlogPosting',
                  'headline': post['title'], 'description': post['description'],
                  'datePublished': post['date'], 'dateModified': post.get('updated', post['date']),
                  'mainEntityOfPage': url, 'url': url,
                  'author': {'@type': 'Person', 'name': 'Krzysztof Krawczyk', 'url': ORIGIN + '/o-mnie/'},
                  'publisher': {'@type': 'Organization', 'name': 'Grafmen', 'url': ORIGIN}}
        og_image = post.get('og_image')
        if og_image:
            og_image_url = og_image if og_image.startswith('http') else f'https://grafmen-com.vercel.app/assets/og/{og_image}'
        else:
            og_image_url = 'https://grafmen-com.vercel.app/assets/og/grafmen-og-home.jpg'
        meta = (
            f'<link rel="canonical" href="{url}">'
            f'<meta property="og:type" content="article">'
            f'<meta property="og:site_name" content="Grafmen">'
            f'<meta property="og:locale" content="pl_PL">'
            f'<meta property="og:title" content="{escape(post["title"], quote=True)} | Grafmen">'
            f'<meta property="og:description" content="{escape(post["description"], quote=True)}">'
            f'<meta property="og:url" content="{url}">'
            f'<meta property="og:image" content="{og_image_url}">'
            f'<meta property="og:image:width" content="1200">'
            f'<meta property="og:image:height" content="630">'
            f'<meta property="og:image:alt" content="{escape(post["title"], quote=True)} · Grafmen">'
            f'<meta name="twitter:card" content="summary_large_image">'
            f'<meta name="twitter:title" content="{escape(post["title"], quote=True)} | Grafmen">'
            f'<meta name="twitter:description" content="{escape(post["description"], quote=True)}">'
            f'<meta name="twitter:image" content="{og_image_url}">'
            f'<script type="application/ld+json">{safe_json}</script>'
        )
    updated = ''
    if post.get('updated'):
        updated = f'<span>Aktualizacja: <time datetime="{post["updated"]}">{date.fromisoformat(post["updated"]).strftime("%d.%m.%Y")}</time></span>'
    return GENERATED_MARKER + '\n' + Template(template).substitute(
        TITLE=escape(post['title'], quote=True), DESCRIPTION=escape(post['description'], quote=True),
        META=meta, CATEGORY=escape(post['category']),
        DATE_ISO=post['date'], DATE_LABEL=date.fromisoformat(post['date']).strftime('%d.%m.%Y'),
        UPDATED=updated, CONTENT=body_html(post['body']),
        PREVIEW='<p class="home-kicker">Podgląd szablonu, nieopublikowany wpis</p>' if preview else '')


def build(root=ROOT, preview=False):
    source = json.loads((root/'content/blog/posts.json').read_text())
    posts = [p for p in source if p.get('published') is True]
    slugs = [p['slug'] for p in posts]
    if len(slugs) != len(set(slugs)):
        raise ValueError('Duplicate published blog slugs.')
    template = (root/'templates/blog-post.html').read_text()
    # Validate and render every post before changing any output.
    pages = [(p, render_post(p, template)) for p in posts]
    manifest_path = root/'content/blog/generated-pages.json'
    previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else []
    stale = []
    for slug in set(previous) - set(slugs):
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
            raise ValueError('Invalid slug in generated-pages manifest.')
        old = root/'blog'/slug/'index.html'
        if old.exists():
            if GENERATED_MARKER not in old.read_text():
                raise ValueError(f'Refusing to remove non-generated page: {slug}')
            stale.append(old)
    for p, page in pages:
        target = root/'blog'/p['slug']/'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page)
    if posts:
        cards = []
        for p in sorted(posts, key=lambda p: p['date'], reverse=True):
            cards.append(f'<li class="blog-card"><p>{escape(p["category"])} / <time datetime="{p["date"]}">{date.fromisoformat(p["date"]).strftime("%d.%m.%Y")}</time></p><h2><a href="{p["slug"]}/index.html">{escape(p["title"])}</a></h2><p>{escape(p["description"])}</p><a class="text-link" href="{p["slug"]}/index.html">Czytaj artykuł ↗</a></li>')
        listing = '<div class="home-inner"><ul class="blog-list" aria-label="Artykuły">'+''.join(cards)+'</ul></div>'
    else:
        listing = '<div class="home-inner compact-grid"><h2>Pierwsze artykuły<br>już wkrótce.</h2><p class="home-lead">Przygotowuję materiały o projektowaniu stron i budowaniu spójnego wizerunku firmy. W międzyczasie zobacz moje <a class="text-link" href="../portfolio/index.html">realizacje ↗</a>.</p></div>'
    index = root/'blog/index.html'
    html = index.read_text()
    html, count = re.subn(r'<!-- BLOG_LIST_START -->.*?<!-- BLOG_LIST_END -->', lambda _: '<!-- BLOG_LIST_START -->'+listing+'<!-- BLOG_LIST_END -->', html, flags=re.S)
    if count != 1:
        raise ValueError('Expected exactly one blog listing marker.')
    index.write_text(html)
    ET.register_namespace('', NS)
    sitemap_path = root/'sitemap.xml'
    sitemap = ET.parse(sitemap_path)
    tree = sitemap.getroot()
    for item in list(tree):
        loc = item.find(f'{{{NS}}}loc')
        if loc is not None and loc.text.startswith(ORIGIN+'/blog/') and loc.text != ORIGIN+'/blog/':
            tree.remove(item)
    for p in posts:
        item = ET.SubElement(tree, f'{{{NS}}}url')
        ET.SubElement(item, f'{{{NS}}}loc').text = ORIGIN+'/blog/'+p['slug']+'/'
    sitemap.write(sitemap_path, encoding='utf-8', xml_declaration=True)
    # Remove only pages previously emitted by this builder, never unrelated files.
    for old in stale:
        old.unlink()
        if not any(old.parent.iterdir()):
            old.parent.rmdir()
    manifest_path.write_text(json.dumps(sorted(slugs), ensure_ascii=False, indent=2)+'\n')
    if preview:
        example = json.loads((root/'docs/blog-post-example.json').read_text())
        target = root/'docs/blog-preview/index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render_post(example, template, preview=True))
    print(f'Blog: {len(posts)} published articles. Template preview: {preview}.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--preview', action='store_true')
    build(preview=parser.parse_args().preview)
