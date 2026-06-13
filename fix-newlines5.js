const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Pattern: statement-ending char followed by two spaces then statement-starting keyword
  const stmtEndings = [';', '}', ')', ']'];
  const stmtStarters = [
    'const ', 'let ', 'var ', 'function ', 'if ', 'for ', 'while ',
    'switch ', 'try ', 'return ', 'throw ', 'import ', 'export ',
    'class ', 'interface ', 'type ', 'enum ', 'async ',
    'useEffect', 'useState', 'useCallback', 'useMemo', 'useRef',
    'api.', 'setTimeout', 'setInterval',
  ];

  for (const ending of stmtEndings) {
    for (const starter of stmtStarters) {
      // Match: ending + 2+ spaces + starter
      const escapedEnding = ending.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escapedEnding + ' {2,}' + starter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(re, ending + '\n' + starter);
    }
  }

  // Also handle case where newline is needed before useEffect/useState etc. after non-statement-ending chars
  // e.g., "false)  useEffect(" -> already handled by ')  useEffect' above
  // "catch(() => {})    }  }, [isAuthenticated])" -> '}  }' -> handled

  // Handle remaining common pattern: closing paren of an if/for/try etc followed by spaces and next statement
  // Like: ")    }" or ")  }" 
  // These were partially handled but let's be more aggressive:
  content = content.replace(/\)\s{3,}\{/g, ')\n{');
  content = content.replace(/\}\s{3,}\},/g, '}\n},');
  content = content.replace(/\}\s{3,}\);/g, '}\n);');

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
