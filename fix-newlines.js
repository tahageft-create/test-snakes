const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lenBefore = content.length;

  // Add newline before import when not preceded by newline/semicolon
  content = content.replace(/([^;\n])(import\s+)/g, '$1\n$2');
  // Add newline before export default, export function, export const, export interface, export type
  content = content.replace(/([^;\n])(export\s+(default|function|const|interface|type))/g, '$1\n$2');
  // Add newline between closing brace and next import/export
  content = content.replace(/}(import\s+)/g, '}\n$1');
  content = content.replace(/}(export\s+(default|function|const|interface|type))/g, '}\n$1');
  // Add newline after }; or }) before another keyword
  content = content.replace(/;?(import\s+)/g, ';\n$1');
  content = content.replace(/;?(export\s+(default|function|const|interface|type))/g, ';\n$2');

  // If the first line is empty, remove it
  content = content.replace(/^\n/, '');

  if (content.length !== lenBefore) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

const clientSrc = path.resolve(__dirname, 'client/src');
let changed = 0;
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && /\.(tsx?)$/.test(entry.name)) {
      if (fixFile(fullPath)) changed++;
    }
  }
}
walk(clientSrc);
console.log(`Fixed ${changed} files`);
