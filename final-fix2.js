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

  // 1. Fix "; in strings (from earlier corruption where ; was inserted)
  content = content.replace(/";/g, '"')
  content = content.replace(/';/g, "'")

  // 2. Fix extra ; at start of string literals (like t(';auth.reset'))
  content = content.replace(/\(\s*';/g, "('")
  content = content.replace(/\(\s*";/g, '("')

  // 3. Deduplicate keywords WITHOUT space (constconst, etc.)
  // Using backreference: (\w+)\1 where \1 is a reserved keyword
  const dedupWords = ['const', 'function', 'interface', 'type', 'export', 'if', 'return', 'throw', 'try', 'catch', 'finally', 'else', 'for', 'while', 'switch', 'case', 'default', 'class', 'enum', 'extends', 'implements']
  for (const word of dedupWords) {
    const re = new RegExp('\\b' + word + '\\b\\s*\\b' + word + '\\b', 'g')
    content = content.replace(re, word)
  }
  // Also handle constconst without space (like "as constconst")
  for (const word of dedupWords) {
    const re = new RegExp(word + word, 'g')
    content = content.replace(re, word)
  }

  // 4. Dedup function call identifiers
  const callDedups = ['setTimeout', 'setInterval', 'requestAnimationFrame', 'localStorage', 'useEffect', 'useState', 'useRef', 'useCallback', 'useMemo', 'ReactDOM', 'window', 'api']
  for (const word of callDedups) {
    // With optional dot separator: api.api., window.window.
    const re = new RegExp('\\b' + word + '(?:\\.' + word + ')+', 'g')
    content = content.replace(re, word)
    // Without separator: localStoragelocalStorage, useEffectuseEffect
    const re2 = new RegExp(word + word, 'g')
    content = content.replace(re2, word)
  }
  // Also fix api.api. pattern (with dot)
  content = content.replace(/\bapi\.api(\.)/g, 'api$1')
  content = content.replace(/\bwindow\.window(\.)/g, 'window$1')

  // 5. Fix interface/type bodies on one line
  // Match interface { body } where body has properties separated by 2+ spaces
  content = content.replace(/(interface\s+\w+\s*\{)\s*(\S[\s\S]*?\})\s*(\})?/g, (match, header, body, extra) => {
    // Only process if body is a single line (no newline inside)
    if (body.includes('\n') || body.trim().startsWith('\n')) return match
    const parts = body.replace(/\}$/, '').split(/\s{2,}/).map(p => p.trim()).filter(Boolean)
    if (parts.length <= 1) return match
    return header + '\n  ' + parts.join('\n  ') + '\n}'
  })

  // 6. Fix type { body } on one line  
  content = content.replace(/(type\s+\w+\s*=\s*\{)\s*(\S[\s\S]*?\})\s*/g, (match, header, body) => {
    if (body.includes('\n')) return match
    const parts = body.replace(/\}$/, '').split(/\s{2,}/).map(p => p.trim()).filter(Boolean)
    if (parts.length <= 1) return match
    return header + '\n  ' + parts.join('\n  ') + '\n}'
  })

  // 7. Fix case statements on same line in switch blocks
  // Match: return <X />    case 'y'
  content = content.replace(/(return\s+<[^>]+>\s*\/?>)\s{3,}(case\s)/g, '$1\n          $2')
  content = content.replace(/(return\s+null)\s{3,}(default:)/g, '$1\n          $2')
  // General case: after any case body (ending with return or break), then more cases
  content = content.replace(/(return\s+\S+)\s{3,}(case\s)/g, '$1\n    $2')
  content = content.replace(/(break;?)\s{3,}(case\s)/g, '$1\n    $2')

  // 8. Fix missing newlines between statements
  // `}let`, `}const`, `}function`, `}export` - after closing brace
  content = content.replace(/}(\s*)(let|const|function|export|interface|type|class|var)\b/g, '}\n$1$2')
  // `)let`, `)const`, `)function` - after closing paren
  content = content.replace(/\)(\s*)(let|const|function|export|interface|type|class|var)\b/g, ')\n$1$2')

  // 9. Fix `nullfunction`, `nullconst` etc. - missing space+newline between null and keyword
  content = content.replace(/null(\s*)(function|const|let|var|export|interface|type|class)\b/g, 'null\n$1$2')

  // 10. Fix import '...' immediately followed by code (main.tsx pattern)
  content = content.replace(/(import\s+['"][^'"]*['"])\s*([A-Z]\w+\.)/g, '$1\n$2')

  // 11. Fix `= {}  identifier` - empty object followed by another statement
  content = content.replace(/=\s*\{\}\s{2,}(\w+)/g, '= {}\n$1')

  // 12. Fix `[]    identifier` - empty array followed by another statement
  content = content.replace(/\[\]\s{4,}(\w+)/g, '[]\n$1')

  // 13. Fix multiple statements on same line in useEffect/function bodies
  // `null    countRef.current = start`
  content = content.replace(/\bnull\s{4,}(\w+\.\w+)/g, 'null\n$1')
  // `current        setCount(current)` - variable followed by function call
  content = content.replace(/(\w+)\s{6,}(\w+\s*\()/g, '$1\n$2')

  // 14. Fix } followed by comment then code on same line (Events.tsx pattern)
  // Actually; fix the case where there's a comment then more code on same line
  content = content.replace(/}\s*(\/\/.*?)\s{3,}(\w+)/g, '} $1\n$2')

  // 15. Fix missing newline between `{` in function body and immediately following comment/code (Login.tsx pattern)
  // Already handled by Prettier mostly, but handle `{    //` starting a comment on same line
  content = content.replace(/\{\s{4,}\/\//g, '{\n    //')

  if (content !== before) {
    fs.writeFileSync(fullPath, content, 'utf8')
    totalFixes++
    console.log(`Fixed: ${relPath}`)
  }
}

console.log(`\nFixed ${totalFixes} files.`)
