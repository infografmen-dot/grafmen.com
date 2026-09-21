import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/content/portfolio';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

// Replace space after single letter (a, i, o, u, w, z, etc.) with non-breaking space \u00A0
function fix(str) {
  if (typeof str !== 'string') return str;
  // Match single Polish letter preceded by start-of-string or whitespace/punctuation, followed by whitespace
  return str.replace(/(^|[\s(„"'\u00A0])([a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ])\s+/g, '$1$2\u00A0');
}

let modifiedCount = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  let changed = false;

  if (data.description) {
    const nextDesc = fix(data.description);
    if (nextDesc !== data.description) {
      data.description = nextDesc;
      changed = true;
    }
  }

  if (Array.isArray(data.brief)) {
    data.brief = data.brief.map(b => {
      const fixed = fix(b);
      if (fixed !== b) changed = true;
      return fixed;
    });
  }

  if (Array.isArray(data.deliverables)) {
    data.deliverables = data.deliverables.map(d => {
      const fixed = fix(d);
      if (fixed !== d) changed = true;
      return fixed;
    });
  }

  if (Array.isArray(data.result)) {
    data.result = data.result.map(r => {
      const fixed = fix(r);
      if (fixed !== r) changed = true;
      return fixed;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    modifiedCount++;
    console.log('Fixed orphans in:', file);
  }
}

console.log('Done. Updated files:', modifiedCount);
