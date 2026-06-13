const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add newline before common statement keywords when preceded by } or ; or { + spaces
  // This handles inside function bodies that are still concatenated

  // } followed directly by statement keyword
  content = content.replace(/}(const |let |var |function |if |for |while |switch |try |return |throw )/g, '}\n$1');
  content = content.replace(/};(const |let |var |function |if |for |while |switch |try |return |throw )/g, '};\n$1');

  // ); followed by statement keyword  
  content = content.replace(/\);(const |let |var |function |if |for |while |switch |try |return |throw )/g, ');\n$1');

  // {  followed by statement keyword (double space indicates where newline was)
  content = content.replace(/\{\s{2,}(const |let |var |function |if |for |while |switch |try |return |throw )/g, '{\n  $1');

  // } + spaces + statement keyword
  content = content.replace(/}\s{2,}(const |let |var |function |if |for |while |switch |try |return |throw |export )/g, '}\n$1');

  // Explicitly handle missing newline between statements: "}  const" or "})  const"
  content = content.replace(/}\)\s+(const |function |export )/g, '})\n$1');

  fs.writeFileSync(filePath, content, 'utf8');
}

const clientSrc = path.resolve(__dirname, 'client/src');
let changed = 0;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && /\.(tsx?)$/.test(entry.name)) {
      fixFile(fullPath);
      changed++;
    }
  }
}
walk(clientSrc);
console.log(`Processed ${changed} files`);
