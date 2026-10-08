const fs = require('fs');

const file = 'apps/web/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add FavoritesApi, ReviewsApi import
if (!content.includes('FavoritesApi,')) {
  content = content.replace(
    'CmsApi,\r\n  type AuthUser,',
    'CmsApi,\r\n  FavoritesApi,\r\n  ReviewsApi,\r\n  type AuthUser,'
  );
  if (!content.includes('FavoritesApi,')) {
    content = content.replace(
      'CmsApi,\n  type AuthUser,',
      'CmsApi,\n  FavoritesApi,\n  ReviewsApi,\n  type AuthUser,'
    );
  }
}

// 2. Sync favorites with API on mount and user change
const favSyncTarget = `    const token = getStoredToken();
    if (token) {
      AuthApi.getMe()`;

const favSyncReplacement = `    // Sync user favorites from database
    FavoritesApi.getMyIds().then((ids) => {
      if (Array.isArray(ids)) {
        const favMap: Record<string, boolean> = {};
        ids.forEach((id) => { favMap[id] = true; });
        setFavorites(favMap);
      }
    });

    const token = getStoredToken();
    if (token) {
      AuthApi.getMe()`;

if (content.includes(favSyncTarget) && !content.includes('FavoritesApi.getMyIds()')) {
  content = content.replace(favSyncTarget, favSyncReplacement);
}

// 3. Update toggleFavorite function to call database
const toggleFavTarget = `  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };`;

const toggleFavReplacement = `  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = !prev[id];
      FavoritesApi.toggleFavorite(id).catch(() => {
        // Revert on error
        setFavorites((curr) => ({ ...curr, [id]: !next }));
      });
      return { ...prev, [id]: next };
    });
  };`;

if (content.includes(toggleFavTarget)) {
  content = content.replace(toggleFavTarget, toggleFavReplacement);
}

// 4. Update product card rating display in catalog grid
const ratingDisplayRegex = /<div className="oj-prod-rating">[\s\S]*?<\/div>/;

const newRatingDisplay = `<div className="oj-prod-rating">
                            {p.reviewsCount && p.reviewsCount > 0 && p.rating ? (
                              <>
                                <span className="oj-star-icon"><IconStar /></span>
                                <span>{p.rating.toFixed(1)} ({p.reviewsCount})</span>
                              </>
                            ) : (
                              <span style={{ fontSize: "11px", color: "var(--oj-color-accent)", fontWeight: 700, letterSpacing: "0.4px" }}>
                                ✨ {isEn ? "New creation" : "Nouveau"}
                              </span>
                            )}
                          </div>`;

content = content.replace(ratingDisplayRegex, newRatingDisplay);

// 5. Update Product Detail Modal rating badge
const modalPriceTarget = `<div style={{ fontSize: "28px", fontWeight: 700, fontVariantNumeric: "tabular-nums", marginBottom: "24px" }}>
                  {formatPrice(selectedProduct.price, selectedProduct.currency)}
                </div>`;

const modalPriceReplacement = `<div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "28px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {formatPrice(selectedProduct.price, selectedProduct.currency)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {selectedProduct.reviewsCount && selectedProduct.reviewsCount > 0 && selectedProduct.rating ? (
                      <>
                        <span className="oj-star-icon"><IconStar /></span>
                        <strong style={{ fontSize: "14px" }}>{selectedProduct.rating.toFixed(1)}</strong>
                        <span style={{ color: "var(--oj-color-muted)", fontSize: "13px" }}>({selectedProduct.reviewsCount} {isEn ? "verified reviews" : "avis vérifiés"})</span>
                      </>
                    ) : (
                      <span style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "12px", background: "rgba(212, 180, 131, 0.15)", color: "var(--oj-color-accent)", border: "1px solid rgba(212, 180, 131, 0.3)" }}>
                        ✨ {isEn ? "New creation • Verified authenticity" : "Nouvelle création • Authenticité certifiée"}
                      </span>
                    )}
                  </div>
                </div>`;

if (content.includes(modalPriceTarget)) {
  content = content.replace(modalPriceTarget, modalPriceReplacement);
}

fs.writeFileSync(file, content, 'utf-8');
console.log("Successfully patched Web page.tsx with verified ratings & favorites DB sync!");
