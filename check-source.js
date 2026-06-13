const fs = require('fs');
const files = ['package.json','README.md','.git\\config','client\\package.json','server\\package.json'];
for (const f of files) {
  try {
    const c = fs.readFileSync(f, 'utf8');
    const urls = c.match(/https?:\/\/[^\s"'`]+/g);
    if (urls) console.log(f + ': ' + urls.join(', '));
    if (f.endsWith('package.json')) {
      try {
        const pkg = JSON.parse(c);
        if (pkg.repository) console.log(f + ' repository: ' + JSON.stringify(pkg.repository));
        if (pkg.homepage) console.log(f + ' homepage: ' + pkg.homepage);
      } catch(e) {}
    }
  } catch(e) {
    console.log(f + ': not found');
  }
}
