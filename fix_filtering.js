const fs = require('fs');
let content = fs.readFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', 'utf-8');

const oldFiltered = 'const filtered = cms?.featuredProducts || [];';
const newFiltered = `  const filtered = (cms?.featuredProducts || []).filter((p: any) => {
    const matchesCat = activeCat === "all" || p.category === activeCat;
    const matchesSearch =
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.seller?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });`;

content = content.replace(oldFiltered, newFiltered);

// Also remove products from state and CatalogApi.getProducts because it's not needed
const useEffectStart = content.indexOf('const fetchProducts = async () => {');
const useEffectEnd = content.indexOf('};', useEffectStart);

if (useEffectStart > -1 && useEffectEnd > -1) {
    const newUseEffect = `const fetchProducts = async () => {
      setLoading(true);
      try {
        const cmsRes = await CmsApi.getLandingConfig().catch(() => null);
        if (cmsRes?.data) {
          setCms(cmsRes.data);
        }
      } catch (err) {
        console.warn("API Error", err);
      } finally {
        setLoading(false);
      }
    `;
    const oldUseEffect = content.substring(useEffectStart, useEffectEnd + 2);
    content = content.replace(oldUseEffect, newUseEffect + '}');
}

fs.writeFileSync('apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx', content);
console.log('Fixed filtering');
