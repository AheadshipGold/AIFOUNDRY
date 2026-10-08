const fs = require('fs');
const file = 'apps/mobile/src/screens/buyer/BuyerHomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add CmsApi import
if (!content.includes('CmsApi')) {
  content = content.replace(
    'import { CatalogApi, ProductItem } from "../../services/api";',
    'import { CatalogApi, CmsApi, ProductItem } from "../../services/api";'
  );
}

// 2. Add cms state and fetch logic
if (!content.includes('const [cms, setCms]')) {
  content = content.replace(
    'const [products, setProducts] = useState<Product[]>([]);',
    `const [products, setProducts] = useState<Product[]>([]);
  const [cms, setCms] = useState<any>(null);`
  );
  
  content = content.replace(
    'const apiProds = await CatalogApi.getProducts(query, category);',
    `const apiProds = await CatalogApi.getProducts(query, category);
          const cmsData = await CmsApi.getLandingConfig().catch(()=>null);
          if (cmsData?.data) setCms(cmsData.data);`
  );
}

fs.writeFileSync(file, content);
console.log('Step 1 and 2 done');
