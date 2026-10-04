import re

with open("BuyerHomeScreen.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove image imports
content = re.sub(r'const img[A-Za-z]+ = require\("\.\./\.\./\.\./assets/products/.*?"\);\n', '', content)

# 2. Remove CATALOG array
content = re.sub(r'const CATALOG: Product\[\] = \[[\s\S]*?\];\n+', '', content)

# 3. Update mapApiProduct
new_mapApiProduct = '''function mapApiProduct(prod: ProductItem): Product {
  const isDigital = (prod.category || "").toLowerCase().includes("digital");
  return {
    id: prod.id,
    title: prod.title || "",
    subtitle: prod.description || "",
    seller: prod.artisanShop?.name || "Boutique Partenaire",
    price: Math.round(prod.priceMinor / 100),
    currency: "FCFA",
    rating: 4.9,
    reviews: 24,
    image: prod.image ? { uri: prod.image } : null,
    category: prod.category || "other",
    isDigital: !!isDigital,
    format: isDigital ? "PDF Vectoriel (14.5 Mo)" : undefined,
  };
}'''

content = re.sub(r'function mapApiProduct\(prod: ProductItem\): Product \{[\s\S]*?\}\n', new_mapApiProduct + '\n', content)

# 4. Update initial state and fetch
content = content.replace('const [products, setProducts] = useState<any[]>(CATALOG);', 'const [products, setProducts] = useState<Product[]>([]);')

fetch_products = '''const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = search.trim() ? search : undefined;
        const category = activeCat !== "all" ? activeCat : undefined;
        const apiProds = await CatalogApi.getProducts(query, category);
        const mappedApi = (apiProds || []).map(mapApiProduct);
        setProducts(mappedApi);
      } catch (err) {
        console.warn("API Error", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };'''

content = re.sub(r'const fetchProducts = async \(\) => \{[\s\S]*?setLoading\(false\);\n      \}\n    \};', fetch_products, content)

# 5. Fix categories array images
cat_fix = '''const categories = [
    { id: "all", label: isEn ? "All" : "Tout", image: null, isAll: true, icon: "🏷" },
    { id: "watches", label: isEn ? "Watches" : "Montres", image: null, isAll: false, icon: "⌚" },
    { id: "leather", label: isEn ? "Leather" : "Maroquinerie", image: null, isAll: false, icon: "👜" },
    { id: "fashion", label: isEn ? "Jewelry & Fashion" : "Bijoux & Mode", image: null, isAll: false, icon: "💍" },
    { id: "home", label: isEn ? "Home & Decor" : "Maison & Mobilier", image: null, isAll: false, icon: "🛋" },
    { id: "art", label: isEn ? "Art & Sculptures" : "Art & Décoration", image: null, isAll: false, icon: "🏺" },
    { id: "digital", label: isEn ? "Digital" : "Numérique", image: null, isAll: false, icon: "💻" },
  ];'''
content = re.sub(r'const categories = \[[\s\S]*?\];', cat_fix, content)

# 6. Fix Categories render
cat_render_old = '''<Image
                      source={c.image}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 27,
                        resizeMode: "cover",
                      }}
                    />'''
cat_render_new = '''<View style={{width: "100%", height: "100%", borderRadius: 27, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center"}}>
                      <Text style={{fontSize: 22}}>{(c as any).icon}</Text>
                    </View>'''
content = content.replace(cat_render_old, cat_render_new)

# 7. Hero Banner image removal
hero_image = '''<Image
                source={imgWatchChrono}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />'''
hero_image_new = '''<View style={{ width: "100%", height: "100%", backgroundColor: "rgba(212, 180, 131, 0.1)" }} />'''
content = content.replace(hero_image, hero_image_new)

with open("BuyerHomeScreen.tsx", "w", encoding="utf-8") as f:
    f.write(content)
