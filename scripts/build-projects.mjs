// Generate static project pages from structured content. No runtime framework.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = readFileSync(join(root, 'templates/portfolio-project.html'), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

const shortWords = [
  'a', 'i', 'o', 'u', 'w', 'z',
  'do', 'na', 'od', 'po', 'za', 'ze', 'we', 'ku', 'że', 'bo', 'aż', 'ni',
  'dla', 'nad', 'pod', 'bez', 'oraz'
];
const typoRegex = new RegExp(`(^|[\\s\\(\\[\\{„"'>]|&nbsp;)(${shortWords.join('|')})\\s+`, 'gi');

const typo = (value) => {
  if (!value || typeof value !== 'string') return '';
  let res = escape(value);
  let prev;
  do {
    prev = res;
    res = res.replace(typoRegex, '$1$2&nbsp;');
  } while (res !== prev);
  return res;
};

function imagePath(value) {
  if (!/^assets\/[a-zA-Z0-9_./-]+$/.test(value) || value.split('/').includes('..') || !existsSync(join(root, value))) throw new Error(`Invalid or missing image: ${value}`);
  return '../../' + value;
}
function link(value) {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Unsupported project URL');
    return escape(value);
  }
  if (value.startsWith('../') || value.startsWith('/')) {
    return escape(value);
  }
  throw new Error(`Unsupported link: ${value}`);
}
const pages = [];
for (const filename of readdirSync(join(root, 'content/portfolio')).filter(f => f.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(root, 'content/portfolio', filename), 'utf8'));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug) || filename !== data.slug + '.json') throw new Error('Invalid project slug');
  for (const field of ['title', 'description', 'category', 'brief_title', 'result_title', 'next_title']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error(`Missing ${field}`);
  }
  if (data.year && !/^\d{4}$/.test(data.year)) throw new Error('Invalid year');
  for (const item of data.gallery) {
    if (!Number.isInteger(item.width) || !Number.isInteger(item.height) || item.width < 1 || item.height < 1) throw new Error('Invalid gallery dimensions');
  }
  const url = `https://grafmen.com/portfolio/${data.slug}/`;
  const schema = JSON.stringify({'@context':'https://schema.org','@type':'CreativeWork',name:data.title,description:data.description,url,image:'https://grafmen.com/'+data.cover,creator:{'@type':'Person',name:'Krzysztof Krawczyk'}}).replace(/</g, '\\u003c');
  const fields = {
    PAGE_TITLE: escape(data.title),
    META_DESCRIPTION: escape(data.description),
    TITLE: typo(data.title),
    DESCRIPTION: typo(data.description),
    META: `<link rel="canonical" href="${url}"><meta property="og:type" content="article"><meta property="og:title" content="${escape(data.title)} | Grafmen"><meta property="og:description" content="${escape(data.description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://grafmen.com/${escape(data.cover)}"><script type="application/ld+json">${schema}</script>`,
    CATEGORY: typo(data.category), YEAR: data.year ? ' / ' + escape(data.year) : '',
    COVER: imagePath(data.cover), COVER_ALT: escape(data.cover_alt), BRIEF_TITLE: typo(data.brief_title),
    BRIEF: data.brief.map(t => `<p>${typo(t)}</p>`).join(''),
    DELIVERABLES: data.deliverables.map(t => `<li>${typo(t)}</li>`).join(''),
    GALLERY: data.gallery.map(i => {
      if (i.type === 'video' || (i.src && i.src.endsWith('.mp4'))) {
        const posterAttr = i.poster ? ` poster="${imagePath(i.poster)}"` : '';
        return `<figure><video src="${imagePath(i.src)}"${posterAttr} width="${i.width}" height="${i.height}" controls playsinline muted loop autoplay preload="metadata"></video><figcaption>${typo(i.caption)}</figcaption></figure>`;
      }
      return `<figure><img src="${imagePath(i.src)}" alt="${escape(i.alt)}" loading="lazy" height="${i.height}" width="${i.width}"><figcaption>${typo(i.caption)}</figcaption></figure>`;
    }).join(''),
    RESULT_TITLE: typo(data.result_title), RESULT: data.result.map(t => `<p>${typo(t)}</p>`).join(''),
    TESTIMONIAL: data.testimonial && data.testimonial_author ? `<blockquote><p>${typo(data.testimonial)}</p><cite>${escape(data.testimonial_author)}</cite></blockquote>` : '',
    EXTERNAL: data.external_url ? `<a class="text-link" href="${link(data.external_url)}" target="_blank" rel="noopener noreferrer">${escape(data.external_label)} ↗</a>` : '',
    NEXT_URL: link(data.next_url), NEXT_TITLE: typo(data.next_title)
  };
  const templatePath = existsSync(join(root, `templates/portfolio-project-${data.slug}.html`))
    ? join(root, `templates/portfolio-project-${data.slug}.html`)
    : join(root, 'templates/portfolio-project.html');
  const currentTemplate = readFileSync(templatePath, 'utf8');
  const html = currentTemplate.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!(key in fields)) throw new Error(`Unknown template key ${key}`);
    return fields[key];
  });
  const target = join(root, 'portfolio', data.slug, 'index.html');
  if (existsSync(target) && !readFileSync(target, 'utf8').includes('GRAFMEN_GENERATED_PROJECT')) throw new Error('Refusing to overwrite hand-authored project');
  pages.push([target, '<!-- GRAFMEN_GENERATED_PROJECT -->\n' + html]);
}
for (const [target, html] of pages) {
  mkdirSync(dirname(target), {recursive:true});
  writeFileSync(target, html);
}
console.log(`Projects generated: ${pages.length}`);
