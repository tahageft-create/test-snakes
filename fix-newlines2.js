const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix missing 'export' keyword: "default function/class" should be "export default function/class"
  content = content.replace(/([;\n])\s*default\s+(function|class|const)/g, '$1\nexport default $2');

  // Split concatenated lines: add newline before "export", "import", "const", "function", "interface", "type",
  // "useEffect", "useState" when they're at the start of a logical statement mid-line
  // More specific: before "const " that follows a closing brace, paren, or semicolon
  content = content.replace(/}(const\s+)/g, '}\n$1');
  content = content.replace(/\);(const\s+)/g, ');\n$1');
  content = content.replace(/};(const\s+)/g, '};\n$1');
  
  // Newline before statements that follow }} or });
  content = content.replace(/}\)\)(const|function|export)/g, '}))\n$1');
  content = content.replace(/}\);(const|function|export)/g, '});\n$1');
  
  // Handle cases like "from 'x'const label:" -> need newline
  content = content.replace(/('|"|`)(const\s+|[a-z]+\s*:\s*(Record|string\[\]))/g, function(match, quote, rest) {
    return quote + '\n' + rest;
  });

  // Very aggressive: put newline before any top-level statement keyword that follows non-whitespace
  // This should be safe now that imports are separated
  content = content.replace(/([^\s;{}(),])\s*(export\s+(default|function|const|interface|type))/g, '$1\n$2');
  content = content.replace(/([^\s;{}(),])\s*(import\s+)/g, '$1\n$2');

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
