const fs = require("fs");
const file = "C:/Users/Harch/Downloads/goaals/client/src/lib/translations.ts";
let content = fs.readFileSync(file, "utf8");

// Find the pattern: closing en object then starting ar content
// Line 375 = "}" alone, 376-377 blank, 378 = "  // Navbar", 379 = "'nav.home':..."
// Replace to insert const ar declaration

content = content.replace(
  "}\n\n\n  // Navbar",
  "}\n\nconst ar: Record<string, string> = {\n  // Navbar"
);

fs.writeFileSync(file, content, "utf8");
console.log("Fixed translations.ts");
