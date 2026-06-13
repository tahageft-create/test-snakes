const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix step 4 damage: ';\n  letter → ' (broken string literals from fix8)
  content = content.replace(/';\n([a-zA-Z_/.@])/g, "'$1");
  content = content.replace(/"\n([a-zA-Z_/.@])/g, '"$1');
  content = content.replace(/`\n([a-zA-Z_/.@])/g, '`$1');

  // Also fix step 6 damage: ;\n followed by letter (may have doubled)
  content = content.replace(/;\n([a-zA-Z])/g, ';$1');

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
