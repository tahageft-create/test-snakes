const fs = require("fs");
const file = "C:/Users/Harch/Downloads/goaals/client/src/lib/translations.ts";
let content = fs.readFileSync(file, "utf8");

// Fix en object: move closing } to its own line
content = content.replace(
  "'auth.disconnectDiscord': 'Disconnect Discord',}",
  "'auth.disconnectDiscord': 'Disconnect Discord',\n}"
);

// Add const ar declaration before the arabic section
content = content.replace(
  "}\n\n  // Navbar",
  "}\n\nconst ar: Record<string, string> = {\n  // Navbar"
);

// Fix ar object closing
content = content.replace(
  "'auth.disconnectDiscord': '\u0641\u0635\u0644 Discord',}",
  "'auth.disconnectDiscord': '\u0641\u0635\u0644 Discord',\n}"
);

fs.writeFileSync(file, content, "utf8");
console.log("Fixed translations.ts");
