const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/services/api.ts', 'utf-8');

c = c.replace(
  'export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;',
  "export const API_BASE_URL = 'http://10.33.188.162:3001/api';"
);

fs.writeFileSync('apps/mobile/src/services/api.ts', c);
console.log("Forced IP!");
