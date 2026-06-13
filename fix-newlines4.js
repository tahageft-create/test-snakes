const fs = require('fs');
const path = require('path');

// All JavaScript statement-starting keywords
const stmtKeywords = ['const ', 'let ', 'var ', 'function ', 'if ', 'for ', 'while ', 'switch ', 'try ', 'return ', 'throw ', 'import ', 'export ', 'async ', 'class ', 'interface ', 'type ', 'enum '];

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  for (const kw of stmtKeywords) {
    // Two or more spaces before keyword → insert newline (but not at very start of content)
    content = content.replace(new RegExp('  (' + kw.replace(/ /g, '\\s+') + ')', 'g'), '\n$1');
    // Semicolon+space before keyword
    content = content.replace(new RegExp('; (' + kw.replace(/ /g, '\\s+') + ')', 'g'), ';\n$1');
  }

  // Also handle }) or }); before keywords
  content = content.replace(/}\) (const |let |var |function |if |for |while |switch |try |return |throw |import |export |async )/g, '})\n$1');
  content = content.replace(/}\) (const |let |var |function |if |for |while |switch |try |return |throw |import |export |async )/g, '})\n$1');  
  content = content.replace(/}\( (const |let |var |function |if |for )/g, '}\(\n$1');
  
  // Handle specific case: "})  const " or "])  const "
  content = content.replace(/\)\)  (const |function |export )/g, '\)\)\n$1');

  // Clean up: remove empty lines that are just whitespace
  content = content.replace(/^\s*[\r\n]/gm, '');

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
