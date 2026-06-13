const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Split JSX: newline before JSX elements when preceded by another element close
  // > followed by spaces then < or </
  content = content.replace(/>( {2,})</g, '>\n<');
  // /> followed by spaces then <
  content = content.replace(/\/>( {2,})</g, '/>\n<');
  // ) followed by spaces then < (start of JSX in return)
  content = content.replace(/\)( {2,})</g, ')\n<');
  
  // 2. Split JSX attributes that have 2+ spaces between them (likely separate lines)
  // But NOT spaces inside string attributes
  // Match: ">{space}  className=" or similar
  content = content.replace(/"( {2,})className=/g, '"\nclassName=');
  content = content.replace(/"( {2,})href=/g, '"\nhref=');
  content = content.replace(/"( {2,})src=/g, '"\nsrc=');
  content = content.replace(/"( {2,})alt=/g, '"\nalt=');
  content = content.replace(/"( {2,})style=/g, '"\nstyle=');
  content = content.replace(/"( {2,})onClick=/g, '"\nonClick=');
  content = content.replace(/"( {2,})onChange=/g, '"\nonChange=');
  content = content.replace(/"( {2,})onSubmit=/g, '"\nonSubmit=');
  content = content.replace(/"( {2,})type=/g, '"\ntype=');
  content = content.replace(/"( {2,})value=/g, '"\nvalue=');
  content = content.replace(/"( {2,})placeholder=/g, '"\nplaceholder=');
  content = content.replace(/"( {2,})disabled=/g, '"\ndisabled=');
  content = content.replace(/"( {2,})key=/g, '"\nkey=');
  content = content.replace(/"( {2,})to=/g, '"\nto=');
  content = content.replace(/"( {2,})target=/g, '"\ntarget=');
  content = content.replace(/"( {2,})rel=/g, '"\nrel=');

  // 3. Handle interface/type body properties separated by 2+ spaces
  // e.g., {  prop1: type  prop2: type}
  content = content.replace(/([{,]) {2,}([a-zA-Z_\$])/g, '$1\n$2');
  content = content.replace(/ {2,}(\})/g, '\n$1');

  // 4. Add newline after import statements followed immediately by other code
  content = content.replace(/('|"|`);?([a-zA-Z])/g, function(m, quote, letter) {
    // Don't break single-char variable names after string ending
    return quote + ';\n' + letter;
  });

  // 5. Add newline before export if on same line as something else
  content = content.replace(/([^ \n])export /g, '$1\nexport ');

  // 6. Fix ; followed by identifier (semicolon was on its own line before)
  content = content.replace(/;([a-zA-Z])/g, ';\n$1');

  // 7. Newline after { in function/if/for/try blocks
  content = content.replace(/\{ ([a-zA-Z])/g, '{\n$1');
  content = content.replace(/\{  ([a-zA-Z])/g, '{\n$1');

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
