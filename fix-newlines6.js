const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Handle { followed by 3+ spaces then a statement
  content = content.replace(/\{\s{3,}([a-zA-Z_\$])/g, '{\n$1');

  // Handle } followed by 2+ spaces then a closing paren/comma
  content = content.replace(/\}\s{2,}(\))/g, '}\n$1');
  content = content.replace(/\}\s{2,}(\],)/g, '}\n$1');

  // Handle remaining: statement keywords preceded by 2+ spaces at any position
  content = content.replace(/\s{2,}(const |let |var |function |if |for |while |switch |try |return |throw |class |interface |type |enum )/g, '\n$1');

  // Handle useEffect, useState etc preceded by 2+ spaces (but only after ) or })
  content = content.replace(/\)\s{2,}(use[A-Z])/g, ')\n$1');
  content = content.replace(/\)\s{2,}(api\.)/g, ')\n$1');
  content = content.replace(/\)\s{2,}(set[A-Z])/g, ')\n$1');

  // Cleanup: multiple blank lines
  content = content.replace(/\n\n\n+/g, '\n\n');

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
