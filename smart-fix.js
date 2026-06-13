const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // First pass: remove leading/trailing whitespace lines
  content = content.replace(/^\s*\n/gm, '');

  // Second pass: fix specific known patterns
  // 1. Remove leading semicolons
  content = content.replace(/^;/gm, '');
  // 2. Fix template literal with extra semicolon: `;Bearer ${token}`
  content = content.replace(/`;(\w+)/g, '`$1');
  // 3. Fix missing newline between }); and next statement
  content = content.replace(/}\);([a-zA-Z_])/g, '});\n$1');
  content = content.replace(/}\)([a-zA-Z_])/g, '})\n$1');
  // 4. Fix missing newline between }) and next statement
  content = content.replace(/}\); /g, '});\n');
  content = content.replace(/\}\([a-zA-Z_]/g, function(m) {
    // Only fix if it looks like a statement, not an object key
    return m.replace('}(', '}\n(');
  });
  // 5. Fix "})api." -> "})\napi."
  content = content.replace(/}\)([a-z_])/g, '})\n$1');
  // 6. Fix ";default" -> "export default"  
  content = content.replace(/;default /g, 'export default ');
  // 7. Fix "}      window" -> "}\nwindow"
  content = content.replace(/}\s{3,}([a-zA-Z_])/g, '}\n$1');
  // 8. Fix missing semicolon before new statement: "token')      window" -> "token')\nwindow"
  content = content.replace(/\)\s{4,}([a-zA-Z_])/g, ')\n$1');

  // Third pass: add newlines at statement boundaries (outside strings)
  // Use a state machine to track string context
  let result = '';
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let prevChar = '';
  let i = 0;

  while (i < content.length) {
    const ch = content[i];
    const next = content[i + 1] || '';
    const prev = content[i - 1] || '';

    // Handle line comments
    if (!inSingle && !inDouble && !inTemplate && !inBlockComment && ch === '/' && next === '/') {
      inLineComment = true;
      result += ch;
      i++;
      continue;
    }
    if (inLineComment && ch === '\n') {
      inLineComment = false;
      result += ch;
      i++;
      continue;
    }

    // Handle block comments
    if (!inSingle && !inDouble && !inTemplate && !inLineComment && ch === '/' && next === '*') {
      inBlockComment = true;
      result += ch;
      i++;
      continue;
    }
    if (inBlockComment && ch === '*' && next === '/') {
      inBlockComment = false;
      result += ch;
      i++;
      continue;
    }

    // Track string context
    if (!inLineComment && !inBlockComment) {
      if (ch === "'" && !inDouble && !inTemplate) inSingle = !inSingle;
      if (ch === '"' && !inSingle && !inTemplate) inDouble = !inDouble;
      if (ch === '`' && !inSingle && !inDouble) inTemplate = !inTemplate;
      // Handle template literal escape
      if (inTemplate && ch === '\\' && next) {
        result += ch + next;
        i += 2;
        continue;
      }
    }

    // Handle escape in strings
    if ((inSingle || inDouble) && ch === '\\' && next) {
      result += ch + next;
      i += 2;
      continue;
    }

    // If we're inside a string/comment, just copy
    if (inSingle || inDouble || inTemplate || inLineComment || inBlockComment) {
      result += ch;
      i++;
      continue;
    }

    // Outside string: looking for statement boundaries
    // Pattern: closing brace/paren followed by space(s) and a new statement keyword
    const rest = content.substring(i);
    const boundaryPattern = /^([}\]\)])\s+(import\s|export\s|const\s|let\s|var\s|function\s|class\s|interface\s|type\s|enum\s|if\s|for\s|while\s|switch\s|try\s|return\s|throw\s|api\.|useEffect|useState|useCallback|useMemo|useRef|setTimeout|setInterval|window\.|localStorage)/;
    const m = rest.match(boundaryPattern);
    if (m) {
      result += m[1] + '\n' + m[2];
      i += m[1].length + m[0].length - m[1].length - m[2].length;
      // Skip the spaces
      while (i < content.length && (content[i] === ' ' || content[i] === '\t')) i++;
      continue;
    }

    // Handle "})identifier" - need newline between }) and identifier
    if (/^\}\)/.test(rest) && /[a-zA-Z_]/.test(rest[2])) {
      result += '})\n';
      i += 2;
      continue;
    }
    // Handle "}identifier" where the identifier starts a new statement
    if (ch === '}' && /[a-zA-Z_]/.test(next)) {
      // Check if this is likely an object literal vs block statement
      // Look ahead for common statement keywords
      if (/^(const|let|var|function|class|interface|type|enum|export|import|if|for|while|switch|try|return)/.test(rest.substring(1))) {
        result += '}\n';
        i++;
        continue;
      }
    }

    // Handle ";export" -> "export" (remove leading semicolon)
    if (ch === ';' && /^export\s/.test(rest.substring(1))) {
      result += '';
      i++;
      continue;
    }
    // Handle ";default " -> "export default "  
    if (ch === ';' && /^default\s/.test(rest.substring(1))) {
      result += 'export ';
      i++;
      continue;
    }

    result += ch;
    i++;
  }

  content = result;

  // Fourth pass: fix JSX - add newlines between JSX elements
  result = '';
  i = 0;
  inSingle = inDouble = inTemplate = inLineComment = inBlockComment = false;
  while (i < content.length) {
    const ch = content[i];
    const next = content[i + 1] || '';
    // Track strings (simplified)
    if (ch === "'" && !inDouble && !inTemplate) inSingle = !inSingle;
    if (ch === '"' && !inSingle && !inTemplate) inDouble = !inDouble;
    if (ch === '`' && !inSingle && !inDouble) inTemplate = !inTemplate;
    if (!inSingle && !inDouble && !inTemplate) {
      if (ch === '/' && next === '/') inLineComment = true;
      if (ch === '/' && next === '*') inBlockComment = true;
    }
    if (inLineComment && ch === '\n') inLineComment = false;
    if (inBlockComment && ch === '*' && next === '/') { inBlockComment = false; result += ch; i++; continue; }
    if ((inSingle || inDouble) && ch === '\\' && next) { result += ch + next; i += 2; continue; }
    if (inTemplate && ch === '\\' && next) { result += ch + next; i += 2; continue; }

    if (!inSingle && !inDouble && !inTemplate && !inLineComment && !inBlockComment) {
      // JSX: > followed by < (with optional spaces) -> split
      if (ch === '>' && (next === ' ' || next === '\t') && /^\s*</.test(content.substring(i + 1))) {
        result += '>\n';
        i++;
        while (i < content.length && (content[i] === ' ' || content[i] === '\t')) i++;
        continue;
      }
      // JSX: /> followed by <
      if (ch === '/' && next === '>' && /^\s*</.test(content.substring(i + 2))) {
        result += '/>\n';
        i += 2;
        while (i < content.length && (content[i] === ' ' || content[i] === '\t')) i++;
        continue;
      }
      // JSX: ) followed by < (return statement)
      if (ch === ')' && /^\s*</.test(content.substring(i + 1))) {
        result += ')\n';
        i++;
        while (i < content.length && (content[i] === ' ' || content[i] === '\t')) i++;
        continue;
      }
    }

    result += ch;
    i++;
  }
  content = result;

  // Final: remove consecutive blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(filePath, content, 'utf8');
}

const clientSrc = path.resolve(__dirname, 'client/src');
console.log('Fixing files in', clientSrc);
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.isFile() && /\.(tsx?)$/.test(entry.name)) {
      fixFile(fullPath);
      console.log('  fixed:', path.relative(clientSrc, fullPath));
    }
  }
}
walk(clientSrc);
console.log('Done');
