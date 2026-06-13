const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Undo step 4: ';\n  letter → 'letter (broken string literals from fix8)
  content = content.replace(/';\n([a-zA-Z_/])/g, "'$1");
  content = content.replace(/"\n([a-zA-Z_/])/g, '"$1');
  content = content.replace(/`\n([a-zA-Z_/])/g, '`$1');

  // Undo step 5: remove newlines before 'export' that fix8 added
  // Only if the newline+export was not originally a line break
  content = content.replace(/\nexport /g, 'export ');

  // Undo step 6: remove newlines after semicolons that fix8 added
  content = content.replace(/;\n([a-zA-Z])/g, ';$1');

  // Undo step 1: > then \n then < (from ">\n<")
  content = content.replace(/>\n</g, '><');

  // Undo step 3: interface body newlines
  // (hard to reverse perfectly, but let's try to fix obvious issues)

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
console.log('Done reversing');
