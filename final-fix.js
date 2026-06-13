const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, 'client', 'src')

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.')) files.push(...walk(full))
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

const files = walk(srcDir)
let totalFixes = 0

for (const fullPath of files) {
  const relPath = path.relative(srcDir, fullPath)
  let content = fs.readFileSync(fullPath, 'utf8')
  const before = content
  let changed = false

  // 1. Deduplicate doubled keywords
  const dups = [
    /\bconst\s+const\b/g,
    /\bfunction\s+function\b/g,
    /\binterface\s+interface\b/g,
    /\btype\s+type\b/g,
    /\bexport\s+export\b/g,
    /\bif\s+if\b/g,
    /\breturn\s+return\b/g,
    /\bthrow\s+throw\b/g,
    /\btry\s+try\b/g,
    /\bcatch\s+catch\b/g,
    /\bfinally\s+finally\b/g,
    /\belse\s+else\b/g,
  ]
  for (const re of dups) {
    content = content.replace(re, (match) => match.trim().split(/\s+/)[0])
  }

  // 2. `api.api.` -> `api.`
  content = content.replace(/\bapi\.api\./g, 'api.')
  // 3. `window.window.` -> `window.`
  content = content.replace(/\bwindow\.window\./g, 'window.')
  // 4. `localStoragelocalStorage` -> `localStorage`
  content = content.replace(/\blocalStoragelocalStorage/g, 'localStorage')
  // 5. Doubled identifier patterns
  content = content.replace(/\buseEffectuseEffect\b/g, 'useEffect')
  content = content.replace(/\buseStateuseState\b/g, 'useState')
  content = content.replace(/\buseRefuseRef\b/g, 'useRef')
  content = content.replace(/\buseCallbackuseCallback\b/g, 'useCallback')
  content = content.replace(/\buseMemouseMemo\b/g, 'useMemo')

  // 6. `}keyword` -> `}\nkeyword`
  content = content.replace(/\}(interface|type|const|function|export|enum|class|import)\b/g, '}\n$1')
  // 7. `]keyword` -> `]\nkeyword`
  content = content.replace(/\](interface|type|const|function|export|enum|class)\b/g, ']\n$1')

  // 8. `default X` -> `export default X`
  content = content.replace(/(?<!\bexport\s+)default\s+(\w+)/g, 'export default $1')

  // 9. `import '...' interface` -> `import '...'\ninterface`
  content = content.replace(/(['"`])\s*(interface|type|const|function|export|enum|class)\b/g, '$1\n$2')

  // 10. For types.ts specifically: fix interface bodies
  if (relPath === 'lib\\types.ts' || relPath === 'lib/types.ts') {
    content = content.replace(/\{([^}]*)\}/g, (match, inner) => {
      const parts = inner.split(/\s{2,}/)
      if (parts.length <= 1) return match
      const formatted = parts.map(p => p.trim()).filter(Boolean).join('\n')
      return '{\n' + formatted + '\n}'
    })
    // Re-deduplicate interfaces if the above created issues
    content = content.replace(/\binterface\s+interface\b/g, 'interface')
  }

  // 11. Add missing newlines after `{` in object destructuring, etc.
  // (Prettier will handle formatting)

  if (content !== before) {
    fs.writeFileSync(fullPath, content, 'utf8')
    totalFixes++
    console.log(`Fixed: ${relPath}`)
  }
}

console.log(`\nFixed ${totalFixes} files.`)
