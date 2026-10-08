const fs = require('fs');
let c = fs.readFileSync('apps/mobile/src/screens/buyer/SearchScreen.tsx', 'utf-8');

// Remove resolveImageUrl from inside the component if it exists
c = c.replace(/const resolveImageUrl = \(url: string\) => \{[\s\S]*?\};\n/, '');

// Add it to the top level (after imports)
const resolveFuncTop = `
const resolveImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE_URL.replace(':3001/api', ':3000');
  return \`\${base}\${url.startsWith('/') ? url : '/' + url}\`;
};
`;

c = c.replace(
  'function mapApiProduct(prod: ProductItem): Product {',
  resolveFuncTop + '\nfunction mapApiProduct(prod: ProductItem): Product {'
);

// Update mapApiProduct to use resolveImageUrl
c = c.replace(
  'image: prod.image ? { uri: prod.image } : undefined,',
  'image: prod.image ? { uri: resolveImageUrl(prod.image) } : undefined,'
);

// We can revert the inline fix in render, or just leave it since it won't hurt if prod.image is already {uri: 'http...'}
c = c.replace(/source=\{typeof prod\.image === 'string' \? \{ uri: resolveImageUrl\(prod\.image\) \} : prod\.image\}/g, "source={prod.image}");

fs.writeFileSync('apps/mobile/src/screens/buyer/SearchScreen.tsx', c);
console.log("Fixed SearchScreen.tsx completely!");
