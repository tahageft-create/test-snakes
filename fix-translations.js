const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'client', 'src', 'lib', 'translations.ts');
let content = fs.readFileSync(file, 'utf8');

// Find lines with: // comment  'key': 'value',
// Extract the property part to a new line
content = content.replace(/^(\s*\/\/[^']+)  ('[\w.]+\s*':\s*'[^']*',)/gm, (match, comment, prop) => {
  return comment + '\n' + prop;
});

// Handle double-quoted values
content = content.replace(/^(\s*\/\/[^']+)  ('[\w.]+\s*':\s*"[^"]*",)/gm, (match, comment, prop) => {
  return comment + '\n' + prop;
});

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed translations.ts');
