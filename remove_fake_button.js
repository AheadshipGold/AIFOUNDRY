const fs = require('fs');
let c = fs.readFileSync('apps/web/src/app/page.tsx', 'utf-8');

// Find the button and remove it completely.
const buttonRegex = /<button\s+className="oj-btn-secondary"\s+onClick=\{[^}]+\}\s+style=\{\{[^}]+\}\}\s*>\s*\{locale === "fr" \? "Mes demandes & devis re[^"]+" : "My requests & quotes received \(2\) →"\}\s*<\/button>/g;

if (buttonRegex.test(c)) {
  c = c.replace(buttonRegex, '');
  fs.writeFileSync('apps/web/src/app/page.tsx', c);
  console.log("Button removed successfully");
} else {
  console.log("Button regex didn't match, trying a broader match");
  // Broader match
  const fallbackRegex = /<button[\s\S]*?Mes demandes & devis[\s\S]*?<\/button>/g;
  c = c.replace(fallbackRegex, '');
  fs.writeFileSync('apps/web/src/app/page.tsx', c);
  console.log("Button removed with fallback");
}
