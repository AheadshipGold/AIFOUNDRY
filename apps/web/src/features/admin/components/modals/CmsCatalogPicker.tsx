import React from "react";
import { AdminIconX, AdminIconSearch, AdminIconSparkle } from "../shared/AdminIcons";
import { Locale } from "@aifoundry/shared";

interface CmsCatalogPickerProps {
  isOpen: boolean;
  onClose: () => void;
  isEn: boolean;
  locale: Locale;
  catalogSearch: string;
  setCatalogSearch: (val: string) => void;
  catalogShopFilter: string;
  setCatalogShopFilter: (val: string) => void;
  adminShopsList: any[];
  catalogLoading: boolean;
  catalogProducts: any[];
  handleSelectCatalogProduct: (p: any) => void;
}

export function CmsCatalogPicker({
  isOpen,
  onClose,
  isEn,
  locale,
  catalogSearch,
  setCatalogSearch,
  catalogShopFilter,
  setCatalogShopFilter,
  adminShopsList,
  catalogLoading,
  catalogProducts,
  handleSelectCatalogProduct,
}: CmsCatalogPickerProps) {
  if (!isOpen) return null;

  return (
    <div className="oj-cms-modal-backdrop" onClick={onClose}>
      <div className="oj-cms-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "720px" }}>
        <div className="oj-cms-modal-header">
          <div>
            <h2>{isEn ? "Select Product from Platform Catalog" : "Sélectionner depuis le Catalogue Ojarket"}</h2>
            <p style={{ color: "var(--oj-color-muted)", fontSize: "12px", margin: "4px 0 0" }}>
              {isEn
                ? "Select an existing catalog product to feature immediately on the landing page showcase."
                : "Sélectionnez un produit existant en base pour le hisser en un clic au rang de création phare."}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--oj-color-muted)", cursor: "pointer" }}
          >
            <AdminIconX size={18} />
          </button>
        </div>

        <div className="oj-cms-modal-body" style={{ gap: "14px" }}>
          {/* Search & Filter Toolbar */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--oj-color-muted)", display: "flex", alignItems: "center" }}>
                <AdminIconSearch size={14} />
              </span>
              <input
                type="text"
                placeholder={isEn ? "Search by title, craft, boutique..." : "Rechercher par titre, savoir-faire, boutique..."}
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  borderRadius: "8px",
                  border: "1px solid var(--oj-color-border)",
                  background: "var(--oj-color-bg)",
                  color: "var(--oj-color-text)",
                  fontSize: "13px",
                }}
              />
            </div>

            <select
              value={catalogShopFilter}
              onChange={(e) => setCatalogShopFilter(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--oj-color-border)",
                background: "var(--oj-color-bg)",
                color: "var(--oj-color-text)",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              <option value="ALL">{isEn ? "All Partner Shops" : "Toutes les Boutiques Partenaires"}</option>
              {adminShopsList.map((shop: any) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name} ({shop.city || "Cotonou"})
                </option>
              ))}
            </select>
          </div>

          {catalogLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--oj-color-muted)" }}>
              {isEn ? "Loading catalog..." : "Chargement du catalogue..."}
            </div>
          ) : (() => {
            const filtered = catalogProducts.filter((p: any) => {
              const shopName = p.artisanShop?.name || p.shop?.name || "";
              const shopId = p.artisanShop?.id || p.shop?.id || p.shopId || "";
              const matchesShop =
                catalogShopFilter === "ALL" ||
                shopId === catalogShopFilter ||
                shopName === catalogShopFilter;
              const matchesSearch =
                !catalogSearch ||
                p.title?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                shopName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                (p.category && p.category.toLowerCase().includes(catalogSearch.toLowerCase()));
              return matchesShop && matchesSearch;
            });

            if (filtered.length === 0) {
              return (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--oj-color-muted)" }}>
                  {isEn ? "No products matching your filters." : "Aucun produit ne correspond à ces critères."}
                </div>
              );
            }

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto" }}>
                {filtered.map((p: any) => {
                  const shopName = p.artisanShop?.name || p.shop?.name || "Boutique Partenaire";
                  const shopCity = p.artisanShop?.city || p.shop?.city || "Cotonou";
                  const priceFormatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(
                    p.priceMinor ? Math.round(p.priceMinor / 100) : (p.price || 0)
                  );
                  const imgSrc = p.image || (p.images && p.images[0]) || p.imageUrl || "/products/watch-chrono.jpg";

                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1px solid var(--oj-color-border)",
                        background: "var(--oj-color-bg)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={p.title}
                        style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/watch-chrono.jpg";
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ fontSize: "14px", display: "block", color: "var(--oj-color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </strong>
                        <div style={{ fontSize: "12px", color: "var(--oj-color-muted)", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ color: "var(--oj-color-action)", fontWeight: 600 }}>{shopName}</span>
                          <span>· {shopCity}</span>
                          <span>· {p.category || "Luxe"}</span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#AD8455", marginTop: "2px" }}>
                          {priceFormatted} FCFA
                        </div>
                      </div>
                      <button
                        className="oj-btn-primary"
                        style={{
                          height: "34px",
                          padding: "0 14px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() => handleSelectCatalogProduct(p)}
                      >
                        <AdminIconSparkle size={11} color="#D4B483" />
                        {isEn ? "Feature" : "Mettre en Avant"}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div className="oj-cms-modal-footer">
          <button className="oj-btn-secondary" onClick={onClose}>
            {isEn ? "Close" : "Fermer"}
          </button>
        </div>
      </div>
    </div>
  );
}
