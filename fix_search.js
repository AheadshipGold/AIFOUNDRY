const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/screens/buyer/SearchScreen.tsx', 'utf-8');

c = c.replace(
  'import { CatalogApi, ProductItem } from "../../services/api";',
  'import { CatalogApi, ProductItem, API_BASE_URL } from "../../services/api";'
);

const resolveFunc = `
  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = API_BASE_URL.replace(':3001/api', ':3000');
    return \`\${base}\${url.startsWith('/') ? url : '/' + url}\`;
  };
`;
c = c.replace(
  'const isDark = mode === "dark";',
  'const isDark = mode === "dark";\n' + resolveFunc
);

c = c.replace(/<Image\s*source=\{prod\.image\}\s*style=\{\{/g, `<Image\n                          source={typeof prod.image === 'string' ? { uri: resolveImageUrl(prod.image) } : prod.image}\n                          style={{`);

fs.writeFileSync('apps/mobile/src/screens/buyer/SearchScreen.tsx', c);
console.log("Updated SearchScreen.tsx");
