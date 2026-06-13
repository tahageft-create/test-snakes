const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let prev;
  do {
    prev = content;

    // 1. Newline before statement keywords when mid-line (not at start, not inside string)
    const stmtKws = [
      'const ', 'let ', 'var ', 'function ', 'if ', 'for ', 'while ',
      'switch ', 'try ', 'catch ', 'finally ', 'return ', 'throw ',
      'import ', 'export ', 'class ', 'interface ', 'type ', 'enum ',
      'default ', 'case ',
    ];
    for (const kw of stmtKws) {
      if (kw === 'case ') {
        // case is special - always preceded by newline from previous case/default
        content = content.replace(/:[ \t]{2,}(case )/g, ':\n$1');
        content = content.replace(/}[ \t]{2,}(case )/g, '}\n$1');
      } else if (kw === 'catch ' || kw === 'finally ') {
        content = content.replace(/}[ \t]{2,}(catch )/g, '}\n$1');
        content = content.replace(/}[ \t]{2,}(finally )/g, '}\n$1');
      } else {
        // For other keywords, add newline when preceded by non-whitespace
        content = content.replace(new RegExp('([^\\s;{}(),])\\s{2,}' + kw.replace(/ /, '\\s+'), 'g'), '$1\n' + kw);
        // Also after ), }, ], ; but not inside strings
        content = content.replace(new RegExp('([\\)\\}\\]\\;])\\s{2,}' + kw.replace(/ /, '\\s+'), 'g'), '$1\n' + kw);
      }
    }

    // 2. Newline after { when followed by statement content (3+ spaces then identifier)
    content = content.replace(/\{\s{3,}([a-zA-Z_])/g, '{\n$1');

    // 3. Newline before '}' that closes a block, when preceded by statement content
    // (but not inside object literals like { x: 1 })
    content = content.replace(/([;})\]])\s{2,}(\})/g, '$1\n$2');

    // 4. Handle interface body: {  prop1: type  prop2: type}
    content = content.replace(/(\{)\s{2,}/g, '$1\n');
    content = content.replace(/\s{2,}(\})/g, '\n$1');

    // 5. Handle '  ' after : in function body lines - becomes indentation
    content = content.replace(/\}\s{2,}/g, '}\n');

    // 6. Remove semicolons on their own line (artifact from earlier fix)
    content = content.replace(/^;\s*$/gm, '');

  } while (prev !== content);

  fs.writeFileSync(filePath, content, 'utf8');
}

const clientSrc = path.resolve(__dirname, 'client/src');
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && /\.(tsx?)$/.test(entry.name)) {
      fixFile(fullPath);
    }
  }
}
walk(clientSrc);
console.log('Done');
