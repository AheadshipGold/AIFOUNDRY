"use client";

import React, { useState, useEffect, useRef } from "react";
import { getStoredToken } from "../../../lib/api";
import { useAdmin } from "../context/AdminContext";
import { AdminIconCheck, AdminIconCrown, AdminIconFileText, AdminIconPlus, AdminIconSearch, AdminIconSparkle, AdminIconStore, AdminIconTrash, AdminIconEdit, AdminIconArrowUp, AdminIconArrowDown } from "../components/shared/AdminIcons";
import { CmsProductModal, CmsProductForm } from "../components/modals/CmsProductModal";
import { CmsCatalogPicker } from "../components/modals/CmsCatalogPicker";
import { CmsIconModal, CmsIconForm } from "../components/modals/CmsIconModal";
import { CmsShopModal, CmsShopForm } from "../components/modals/CmsShopModal";

const apiBase = '/api/v1';

const PRESET_IMAGES = [
  { label: "Chronomètre", url: "/products/watch-chrono.jpg" },
  { label: "Sac Cabas", url: "/products/leather-tote.jpg" },
  { label: "Parure Or", url: "/products/jewelry-gold.jpg" },
  { label: "Buste Bronze", url: "/products/art-bronze.jpg" },
  { label: "Fauteuil Iroko", url: "/products/armchair.jpg" },
  { label: "Motifs Royaux", url: "/products/digital-patterns.jpg" },
];

const CMS_CATEGORIES = [
  { id: "watches", label: "Horlogerie de Précision" },
  { id: "leather", label: "Maroquinerie d'Exception" },
  { id: "fashion", label: "Haute Joaillerie & Mode" },
  { id: "art", label: "Art & Fonderie Royale" },
  { id: "home", label: "Mobilier & Décor d'Apparat" },
  { id: "textile", label: "Tissage Noble & Soie" },
];

export function CmsConfigView() {
  const { isEn, locale } = useAdmin();

  const [cmsConfig, setCmsConfig] = useState<any>(null);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsSaving, setCmsSaving] = useState(false);
  const [cmsSubTab, setCmsSubTab] = useState<"featured" | "icons" | "shops" | "raw">("featured");
  const [cmsSearch, setCmsSearch] = useState("");
  const [cmsCategoryFilter, setCmsCategoryFilter] = useState("ALL");
  const [cmsDirty, setCmsDirty] = useState(false);
  const [cmsSaveSuccessToast, setCmsSaveSuccessToast] = useState(false);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<CmsProductForm>({
    id: "", title: "", price: 125000, image: "", category: "watches", currency: "FCFA", description: "", sellerName: "", sellerCity: "Cotonou", sellerIsPremium: true, sellerId: "", badgeText: ""
  });

  const [catalogPickerOpen, setCatalogPickerOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogShopFilter, setCatalogShopFilter] = useState("ALL");
  const [catalogSearch, setCatalogSearch] = useState("");

  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [editingIconIndex, setEditingIconIndex] = useState<number | null>(null);
  const [iconForm, setIconForm] = useState<CmsIconForm>({ title: "", subtitle: "", categoryId: "watches", image: "", description: "" });

  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [editingShopIndex, setEditingShopIndex] = useState<number | null>(null);
  const [shopForm, setShopForm] = useState<CmsShopForm>({ id: "", name: "", city: "Cotonou", initials: "KB", verified: true });

  const [adminShopsList, setAdminShopsList] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCmsLoading(true);
    fetch(`${apiBase}/cms/landing`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    })
    .then(r => r.json())
    .then(data => {
      const raw = data?.data || data || {};
      setCmsConfig({
        featuredProducts: Array.isArray(raw.featuredProducts) ? raw.featuredProducts : [],
        intemporelIcons: Array.isArray(raw.intemporelIcons) ? raw.intemporelIcons : [],
        trustedShops: Array.isArray(raw.trustedShops) ? raw.trustedShops : [],
      });
    })
    .catch(console.error)
    .finally(() => setCmsLoading(false));

    fetch(`${apiBase}/admin/shops`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` }
    })
    .then(r => r.ok ? r.json() : [])
    .then(shops => {
      if (Array.isArray(shops)) setAdminShopsList(shops);
    })
    .catch(console.error);
  }, []);

  const handleSaveCms = async () => {
    setCmsSaving(true);
    try {
      const res = await fetch(`${apiBase}/cms/landing`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStoredToken()}` 
        },
        body: JSON.stringify(cmsConfig)
      });
      if (res.ok) {
        setCmsDirty(false);
        setCmsSaveSuccessToast(true);
        setTimeout(() => setCmsSaveSuccessToast(false), 4500);
      } else {
        alert(isEn ? "Failed to save CMS Config" : "Erreur lors de la sauvegarde CMS");
      }
    } catch (e) {
      console.error(e);
      alert(isEn ? "Error saving CMS Config" : "Erreur de connexion lors de la sauvegarde CMS");
    } finally {
      setCmsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${apiBase}/admin/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getStoredToken()}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erreur de téléversement");
      }
      const data = await res.json();
      if (data.url) {
        setProductForm((prev: any) => ({ ...prev, image: data.url }));
      }
    } catch (err: any) {
      alert(isEn ? `Upload failed: ${err.message}` : `Échec du téléversement : ${err.message}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOpenAddProduct = () => {
    setProductForm({
      id: `feat-${Date.now()}`,
      title: "", price: 150000, image: "/products/watch-chrono.jpg", category: "watches", currency: "FCFA", description: "",
      sellerName: "Kingston Bio", sellerCity: "Cotonou", sellerIsPremium: true, sellerId: "d2e05cf4-d782-4fe4-9cd6-a6dd73f2db73", badgeText: "Boutique Officielle",
    });
    setEditingProductIndex(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (idx: number) => {
    const p = cmsConfig?.featuredProducts?.[idx];
    if (!p) return;
    setProductForm({
      id: p.id || `feat-${Date.now()}`,
      title: p.title || "",
      price: typeof p.price === 'number' ? p.price : 125000,
      image: p.image || "/products/watch-chrono.jpg",
      category: p.category || "watches",
      currency: p.currency || "FCFA",
      description: p.description || "",
      sellerName: p.seller?.name || "Kingston Bio",
      sellerCity: p.seller?.city || "Cotonou",
      sellerIsPremium: p.seller?.isPremium ?? true,
      sellerId: p.seller?.id || "d2e05cf4-d782-4fe4-9cd6-a6dd73f2db73",
      badgeText: p.badgeText || (p.seller?.name?.toLowerCase().includes("kingston") ? "Boutique Officielle" : "Partenaire Phare"),
    });
    setEditingProductIndex(idx);
    setProductModalOpen(true);
  };

  const handleSaveProductForm = () => {
    if (!productForm.title.trim()) {
      alert(isEn ? "Product title is required." : "Le titre de la création est obligatoire.");
      return;
    }
    const updatedProd = {
      id: productForm.id || `feat-${Date.now()}`,
      title: productForm.title.trim(),
      price: Number(productForm.price) || 0,
      image: productForm.image.trim() || "/products/watch-chrono.jpg",
      category: productForm.category,
      currency: "FCFA",
      description: productForm.description.trim(),
      badgeText: productForm.badgeText.trim() || (productForm.sellerName.toLowerCase().includes("kingston") ? "Boutique Officielle" : "Partenaire Phare"),
      seller: {
        id: productForm.sellerId || "d2e05cf4-d782-4fe4-9cd6-a6dd73f2db73",
        name: productForm.sellerName.trim() || "Kingston Bio",
        city: productForm.sellerCity.trim() || "Cotonou",
        isPremium: productForm.sellerIsPremium,
      },
      rating: null,
      reviewsCount: 0,
    };

    setCmsConfig((prev: any) => {
      const list = [...(prev?.featuredProducts || [])];
      if (editingProductIndex !== null && editingProductIndex >= 0) {
        list[editingProductIndex] = { ...list[editingProductIndex], ...updatedProd };
      } else {
        list.push(updatedProd);
      }
      return { ...prev, featuredProducts: list };
    });
    setCmsDirty(true);
    setProductModalOpen(false);
  };

  const handleDeleteProduct = (idx: number) => {
    if (!confirm(isEn ? "Remove this creation from the homepage?" : "Retirer cette création de la vitrine d'accueil ?")) return;
    setCmsConfig((prev: any) => {
      const list = [...(prev?.featuredProducts || [])];
      list.splice(idx, 1);
      return { ...prev, featuredProducts: list };
    });
    setCmsDirty(true);
  };

  const handleMoveProduct = (idx: number, dir: "up" | "down") => {
    setCmsConfig((prev: any) => {
      const list = [...(prev?.featuredProducts || [])];
      const targetIdx = dir === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, featuredProducts: list };
    });
    setCmsDirty(true);
  };

  const handleOpenCatalogPicker = async () => {
    setCatalogPickerOpen(true);
    if (catalogProducts.length > 0) return;
    setCatalogLoading(true);
    try {
      const res = await fetch(`${apiBase}/products?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setCatalogProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleSelectCatalogProduct = (p: any) => {
    const shopName = p.artisanShop?.name || p.shop?.name || "Kingston Bio";
    const shopCity = p.artisanShop?.city || p.shop?.city || "Cotonou";
    const shopId = p.artisanShop?.id || p.shop?.id || p.shopId || "d2e05cf4-d782-4fe4-9cd6-a6dd73f2db73";
    const isPremium = p.artisanShop?.status === "VERIFIED" || p.shop?.status === "VERIFIED" || true;
    
    const newProd = {
      id: `feat-${p.id || Date.now()}`,
      title: p.title || "",
      price: p.priceMinor ? Math.round(p.priceMinor / 100) : (p.price || 0),
      image: p.image || (p.images && p.images[0]) || p.imageUrl || "/products/watch-chrono.jpg",
      category: p.category || "watches",
      currency: "FCFA",
      description: p.description || "",
      badgeText: shopName.toLowerCase().includes("kingston") ? "Boutique Officielle" : "Partenaire Phare",
      seller: { id: shopId, name: shopName, city: shopCity, isPremium },
      rating: null,
      reviewsCount: 0,
    };

    setCmsConfig((prev: any) => ({
      ...prev,
      featuredProducts: [...(prev?.featuredProducts || []), newProd]
    }));
    setCmsDirty(true);
    setCatalogPickerOpen(false);
  };

  const handleOpenEditIcon = (idx: number) => {
    const icon = cmsConfig?.intemporelIcons?.[idx];
    if (!icon) return;
    setIconForm({ ...icon });
    setEditingIconIndex(idx);
    setIconModalOpen(true);
  };

  const handleSaveIconForm = () => {
    setCmsConfig((prev: any) => {
      const list = [...(prev?.intemporelIcons || [])];
      if (editingIconIndex !== null && editingIconIndex >= 0) {
        list[editingIconIndex] = { ...list[editingIconIndex], ...iconForm };
      } else {
        list.push(iconForm);
      }
      return { ...prev, intemporelIcons: list };
    });
    setCmsDirty(true);
    setIconModalOpen(false);
  };

  const handleOpenEditShop = (idx: number) => {
    const s = cmsConfig?.trustedShops?.[idx];
    if (!s) return;
    setShopForm({ ...s });
    setEditingShopIndex(idx);
    setShopModalOpen(true);
  };

  const handleSaveShopForm = () => {
    setCmsConfig((prev: any) => {
      const list = [...(prev?.trustedShops || [])];
      if (editingShopIndex !== null && editingShopIndex >= 0) {
        list[editingShopIndex] = { ...list[editingShopIndex], ...shopForm };
      } else {
        list.push(shopForm);
      }
      return { ...prev, trustedShops: list };
    });
    setCmsDirty(true);
    setShopModalOpen(false);
  };

  return (
    <div>
      <div className="oj-admin-header-row">
        <div className="oj-admin-title-wrap">
          <h1>{isEn ? "CMS Landing Page Studio" : "Studio de la Page d'Accueil (CMS)"}</h1>
          <p>
            {isEn
              ? "Curate featured creations, timeless prestige icons, and verified partner workshops in real-time."
              : "Composez visuellement les créations phares, univers intemporels et maisons d'artisanat d'élite mises en avant sur la vitrine."}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {cmsDirty && (
            <span style={{ fontSize: "12px", color: "#AD8455", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <AdminIconSparkle size={13} color="#AD8455" />
              {isEn ? "Unsaved changes" : "Modifications non publiées"}
            </span>
          )}
          <button
            className="oj-btn-primary"
            disabled={cmsSaving || cmsLoading}
            onClick={handleSaveCms}
            style={{ height: "42px", padding: "0 22px", display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
          >
            <AdminIconCheck size={16} />
            {cmsSaving
              ? (isEn ? "Publishing..." : "Publication...")
              : (isEn ? "Publish Changes" : "Sauvegarder & Publier")}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {cmsSaveSuccessToast && (
        <div style={{ padding: "12px 18px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10B981", color: "#10B981", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <AdminIconCheck size={16} color="#10B981" />
          {isEn ? "Storefront landing page updated and published successfully!" : "La vitrine publique d'accueil a été actualisée et publiée avec succès !"}
        </div>
      )}

      {/* Sub-tabs bar */}
      <div className="oj-cms-tabs-bar">
        <button
          className={`oj-cms-tab-btn ${cmsSubTab === "featured" ? "active" : ""}`}
          onClick={() => setCmsSubTab("featured")}
        >
          <AdminIconSparkle size={14} />
          <span>{isEn ? "Featured Creations" : "Créations Phares"}</span>
          <span className="oj-admin-badge" style={{ marginLeft: "4px" }}>
            {cmsConfig?.featuredProducts?.length || 0}
          </span>
        </button>

        <button
          className={`oj-cms-tab-btn ${cmsSubTab === "icons" ? "active" : ""}`}
          onClick={() => setCmsSubTab("icons")}
        >
          <AdminIconCrown size={14} />
          <span>{isEn ? "Timeless Icons" : "Vitrines Intemporelles"}</span>
          <span className="oj-admin-badge" style={{ marginLeft: "4px" }}>
            {cmsConfig?.intemporelIcons?.length || 0}
          </span>
        </button>

        <button
          className={`oj-cms-tab-btn ${cmsSubTab === "shops" ? "active" : ""}`}
          onClick={() => setCmsSubTab("shops")}
        >
          <AdminIconStore size={14} />
          <span>{isEn ? "Trusted Houses" : "Boutiques de Confiance"}</span>
          <span className="oj-admin-badge" style={{ marginLeft: "4px" }}>
            {cmsConfig?.trustedShops?.length || 0}
          </span>
        </button>

        <button
          className={`oj-cms-tab-btn ${cmsSubTab === "raw" ? "active" : ""}`}
          onClick={() => setCmsSubTab("raw")}
        >
          <AdminIconFileText size={14} />
          <span>{isEn ? "Raw Config (JSON)" : "Mode Expert (JSON)"}</span>
        </button>
      </div>

      {cmsLoading ? (
        <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--oj-color-muted)" }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{isEn ? "Loading CMS Studio..." : "Chargement du studio CMS..."}</div>
        </div>
      ) : !cmsConfig ? (
        <div style={{ padding: "40px", textAlign: "center", background: "var(--oj-color-surface)", borderRadius: "12px", border: "1px solid var(--oj-color-border)" }}>
          <p style={{ color: "var(--oj-color-muted)", marginBottom: "16px" }}>{isEn ? "Unable to load CMS configuration." : "Impossible de charger la configuration CMS."}</p>
          <button className="oj-btn-primary" onClick={() => window.location.reload()}>
            {isEn ? "Retry" : "Réessayer"}
          </button>
        </div>
      ) : (
        <>
          {/* ================= SUBTAB 1: FEATURED CREATIONS ================= */}
          {cmsSubTab === "featured" && (
            <div>
              {/* Action & Filter Toolbar */}
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    className="oj-btn-primary"
                    onClick={handleOpenAddProduct}
                    style={{ height: "38px", padding: "0 16px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                  >
                    <AdminIconPlus size={14} />
                    <span>{isEn ? "Add Featured Creation" : "Ajouter une Création"}</span>
                  </button>

                  <button
                    className="oj-btn-secondary"
                    onClick={handleOpenCatalogPicker}
                    style={{ height: "38px", padding: "0 16px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                  >
                    <AdminIconStore size={14} />
                    <span>{isEn ? "Pick from Catalog" : "Sélectionner depuis le Catalogue"}</span>
                  </button>
                </div>

                {/* Search & Category Filter */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <div className="oj-admin-search" style={{ width: "220px" }}>
                    <span className="oj-admin-search-icon"><AdminIconSearch size={13} /></span>
                    <input
                      type="text"
                      placeholder={isEn ? "Filter creations..." : "Rechercher une création..."}
                      value={cmsSearch}
                      onChange={(e) => setCmsSearch(e.target.value)}
                    />
                  </div>

                  <select
                    value={cmsCategoryFilter}
                    onChange={(e) => setCmsCategoryFilter(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--oj-color-border)",
                      background: "var(--oj-color-surface)",
                      color: "var(--oj-color-text)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <option value="ALL">{isEn ? "All Rayons" : "Tous les Rayons"}</option>
                    <option value="watches">{isEn ? "Watches" : "Horlogerie"}</option>
                    <option value="leather">{isEn ? "Leather" : "Maroquinerie"}</option>
                    <option value="fashion">{isEn ? "High Jewelry & Fashion" : "Joaillerie & Mode"}</option>
                    <option value="art">{isEn ? "Art & Bronze" : "Art & Fonderie"}</option>
                    <option value="home">{isEn ? "Fine Furniture" : "Mobilier d'Art"}</option>
                    <option value="textile">{isEn ? "Royal Textile" : "Tissage Noble"}</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {(() => {
                const items: any[] = cmsConfig?.featuredProducts || [];
                const filtered = items.filter((p: any) => {
                  const matchesCat = cmsCategoryFilter === "ALL" || p.category === cmsCategoryFilter;
                  const matchesSearch =
                    !cmsSearch ||
                    p.title?.toLowerCase().includes(cmsSearch.toLowerCase()) ||
                    p.seller?.name?.toLowerCase().includes(cmsSearch.toLowerCase());
                  return matchesCat && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div style={{ padding: "50px 20px", textAlign: "center", background: "var(--oj-color-surface)", borderRadius: "14px", border: "1px solid var(--oj-color-border)" }}>
                      <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", marginBottom: "14px" }}>
                        {isEn ? "No featured creations match your filter." : "Aucune création ne correspond aux critères sélectionnés."}
                      </p>
                      <button className="oj-btn-primary" onClick={handleOpenAddProduct}>
                        <AdminIconPlus size={14} /> {isEn ? "Add Creation" : "Ajouter une Création"}
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="oj-cms-grid">
                    {filtered.map((prod: any, idx: number) => {
                      const realIndex = items.findIndex((x) => x.id === prod.id || x.title === prod.title);
                      return (
                        <div key={prod.id || idx} className="oj-cms-card">
                          <div className="oj-cms-card-media">
                            <img
                              src={prod.image || "/products/watch-chrono.jpg"}
                              alt={prod.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/products/watch-chrono.jpg";
                              }}
                            />
                            <span className="oj-cms-card-badge" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              {prod.badgeText ? (
                                <>
                                  <AdminIconSparkle size={10} color="#D4B483" />
                                  {prod.badgeText}
                                </>
                              ) : (
                                prod.category?.toUpperCase() || "CRÉATION"
                              )}
                            </span>
                            <div className="oj-cms-card-actions-float">
                              <button
                                className="oj-cms-action-btn-sm"
                                title={isEn ? "Edit" : "Modifier"}
                                onClick={() => handleOpenEditProduct(realIndex)}
                              >
                                <AdminIconEdit size={14} />
                              </button>
                              <button
                                className="oj-cms-action-btn-sm delete"
                                title={isEn ? "Remove" : "Retirer"}
                                onClick={() => handleDeleteProduct(realIndex)}
                              >
                                <AdminIconTrash size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="oj-cms-card-body">
                            <h3 className="oj-cms-card-title">{prod.title}</h3>
                            <div className="oj-cms-card-price">
                              {new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR").format(prod.price || 0)} FCFA
                            </div>
                            <div className="oj-cms-card-seller">
                              <AdminIconStore size={13} color="var(--oj-color-action)" />
                              <strong>{prod.seller?.name || "Kingston Bio"}</strong>
                              <span>· {prod.seller?.city || "Cotonou"}</span>
                              {prod.seller?.isPremium && (
                                <span title="Maison Officielle Certifiée" style={{ display: "inline-flex", alignItems: "center" }}>
                                  <AdminIconSparkle size={12} color="#AD8455" />
                                </span>
                              )}
                            </div>
                            <p className="oj-cms-card-desc">
                              {prod.description || (isEn ? "Exclusive creation handcrafted for Ojarket." : "Création d'exception réalisée dans le respect des traditions de haute facture.")}
                            </p>

                            <div className="oj-cms-card-footer">
                              <button
                                className="oj-btn-secondary"
                                style={{ height: "30px", padding: "0 10px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center" }}
                                onClick={() => handleOpenEditProduct(realIndex)}
                              >
                                <AdminIconEdit size={12} /> {isEn ? "Edit" : "Modifier"}
                              </button>
                              <button
                                className="oj-btn-secondary"
                                style={{ height: "30px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                title={isEn ? "Move Left/Up" : "Déplacer vers la gauche"}
                                disabled={realIndex === 0}
                                onClick={() => handleMoveProduct(realIndex, "up")}
                              >
                                <AdminIconArrowUp size={12} />
                              </button>
                              <button
                                className="oj-btn-secondary"
                                style={{ height: "30px", width: "32px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                title={isEn ? "Move Right/Down" : "Déplacer vers la droite"}
                                disabled={realIndex === items.length - 1}
                                onClick={() => handleMoveProduct(realIndex, "down")}
                              >
                                <AdminIconArrowDown size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= SUBTAB 2: TIMELESS ICONS ================= */}
          {cmsSubTab === "icons" && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: 0 }}>
                  {isEn
                    ? "Configure the 3 prestigious universe pillars highlighted on the landing hero section (Watches, Leather, Fine Jewelry)."
                    : "Configurez les 3 grands univers de prestige présentés en majesté sur la page d'accueil (Montres, Maroquinerie, Haute Joaillerie)."}
                </p>
              </div>

              <div className="oj-cms-grid">
                {(cmsConfig?.intemporelIcons || []).map((icon: any, idx: number) => (
                  <div key={idx} className="oj-cms-card">
                    <div className="oj-cms-card-media" style={{ height: "200px" }}>
                      <img
                        src={icon.image || "/products/watch-chrono.jpg"}
                        alt={icon.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/watch-chrono.jpg";
                        }}
                      />
                      <span className="oj-cms-card-badge">{icon.subtitle || "PILIER"}</span>
                    </div>
                    <div className="oj-cms-card-body">
                      <h3 className="oj-cms-card-title">{icon.title}</h3>
                      <div style={{ fontSize: "12px", color: "#AD8455", fontWeight: 700, marginBottom: "8px" }}>
                        Rayon : {icon.categoryId || "watches"}
                      </div>
                      <p className="oj-cms-card-desc">{icon.description}</p>
                      <div className="oj-cms-card-footer">
                        <button
                          className="oj-btn-secondary"
                          style={{ height: "32px", width: "100%", fontSize: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                          onClick={() => handleOpenEditIcon(idx)}
                        >
                          <AdminIconEdit size={13} /> {isEn ? "Edit Universe" : "Modifier cet Univers"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SUBTAB 3: TRUSTED HOUSES ================= */}
          {cmsSubTab === "shops" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: 0 }}>
                  {isEn
                    ? "Curate the official trusted boutiques and artisan workshops endorsed on the homepage."
                    : "Gérez les boutiques officielles et ateliers d'exception certifiés mis en avant sur la page d'accueil."}
                </p>
                <button
                  className="oj-btn-primary"
                  onClick={() => {
                    setShopForm({ id: `shop-${Date.now()}`, name: "", city: "Cotonou", initials: "KB", verified: true });
                    setEditingShopIndex(null);
                    setShopModalOpen(true);
                  }}
                  style={{ height: "36px", padding: "0 16px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                >
                  <AdminIconPlus size={14} />
                  <span>{isEn ? "Add Workshop" : "Ajouter une Maison"}</span>
                </button>
              </div>

              <div className="oj-cms-grid">
                {(cmsConfig?.trustedShops || []).map((shop: any, idx: number) => (
                  <div key={shop.id || idx} className="oj-cms-card">
                    <div style={{ padding: "24px 20px 14px", display: "flex", alignItems: "center", gap: "14px", borderBottom: "1px solid var(--oj-color-border)" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #075D49, #AD8455)",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "16px",
                          border: "1.5px solid #D4B483",
                        }}
                      >
                        {shop.initials || shop.name?.slice(0, 2).toUpperCase() || "MA"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 2px 0", fontSize: "15px", fontWeight: 700, color: "var(--oj-color-text)" }}>
                          {shop.name}
                        </h3>
                        <div style={{ fontSize: "12px", color: "var(--oj-color-muted)" }}>
                          {shop.city || "Cotonou, Bénin"}
                        </div>
                      </div>
                      {shop.verified && (
                        <span className="oj-status-pill success" style={{ fontSize: "10px", padding: "2px 6px" }}>
                          ✓ CERTIFIÉ
                        </span>
                      )}
                    </div>

                    <div className="oj-cms-card-body" style={{ paddingTop: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--oj-color-muted)", marginBottom: "14px" }}>
                        <span>Créations vitrine :</span>
                        <strong>{Array.isArray(shop.products) ? shop.products.length : (shop.products || 1)} pièces</strong>
                      </div>

                      <div className="oj-cms-card-footer">
                        <button
                          className="oj-btn-secondary"
                          style={{ height: "30px", flex: 1, fontSize: "11px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                          onClick={() => handleOpenEditShop(idx)}
                        >
                          <AdminIconEdit size={12} /> {isEn ? "Edit" : "Modifier"}
                        </button>
                        <button
                          className="oj-btn-secondary"
                          style={{ height: "30px", padding: "0 10px", fontSize: "11px", color: "#FF6B6B", borderColor: "rgba(255,107,107,0.3)" }}
                          onClick={() => {
                            if (!confirm(isEn ? "Remove this workshop?" : "Retirer cette maison d'atelier ?")) return;
                            setCmsConfig((prev: any) => {
                              const list = [...(prev?.trustedShops || [])];
                              list.splice(idx, 1);
                              return { ...prev, trustedShops: list };
                            });
                            setCmsDirty(true);
                          }}
                        >
                          <AdminIconTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SUBTAB 4: RAW CONFIG JSON ================= */}
          {cmsSubTab === "raw" && (
            <div className="oj-admin-table-card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0" }}>{isEn ? "Raw Config Data (JSON)" : "Données de Configuration Brutes (JSON)"}</h3>
                  <small style={{ color: "var(--oj-color-muted)" }}>
                    {isEn ? "Direct JSON payload stored in platform_config." : "Représentation JSON brute persistée dans platform_config."}
                  </small>
                </div>
                <button
                  className="oj-btn-secondary"
                  style={{ height: "32px", padding: "0 12px", fontSize: "12px" }}
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(cmsConfig, null, 2));
                    alert(isEn ? "JSON copied to clipboard!" : "JSON copié dans le presse-papiers !");
                  }}
                >
                  {isEn ? "Copy JSON" : "Copier le JSON"}
                </button>
              </div>

              <textarea
                style={{
                  width: "100%",
                  height: "420px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  padding: "14px",
                  border: "1px solid var(--oj-color-border)",
                  backgroundColor: "var(--oj-color-bg)",
                  color: "var(--oj-color-text)",
                  borderRadius: "10px",
                  lineHeight: "1.5",
                  boxSizing: "border-box",
                }}
                value={JSON.stringify(cmsConfig, null, 2)}
                onChange={(e) => {
                  try {
                    setCmsConfig(JSON.parse(e.target.value));
                    setCmsDirty(true);
                  } catch (err) {
                    // ignore parse errors while typing
                  }
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Render Extracted Modals */}
      <CmsProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        isEn={isEn}
        editingProductIndex={editingProductIndex}
        productForm={productForm}
        setProductForm={setProductForm}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
        uploadingImage={uploadingImage}
        adminShopsList={adminShopsList}
        PRESET_IMAGES={PRESET_IMAGES}
        CMS_CATEGORIES={CMS_CATEGORIES}
        handleSaveProductForm={handleSaveProductForm}
      />

      <CmsCatalogPicker
        isOpen={catalogPickerOpen}
        onClose={() => setCatalogPickerOpen(false)}
        isEn={isEn}
        locale={locale}
        catalogSearch={catalogSearch}
        setCatalogSearch={setCatalogSearch}
        catalogShopFilter={catalogShopFilter}
        setCatalogShopFilter={setCatalogShopFilter}
        adminShopsList={adminShopsList}
        catalogLoading={catalogLoading}
        catalogProducts={catalogProducts}
        handleSelectCatalogProduct={handleSelectCatalogProduct}
      />

      <CmsIconModal
        isOpen={iconModalOpen}
        onClose={() => setIconModalOpen(false)}
        isEn={isEn}
        iconForm={iconForm}
        setIconForm={setIconForm}
        CMS_CATEGORIES={CMS_CATEGORIES}
        handleSaveIconForm={handleSaveIconForm}
      />

      <CmsShopModal
        isOpen={shopModalOpen}
        onClose={() => setShopModalOpen(false)}
        isEn={isEn}
        editingShopIndex={editingShopIndex}
        shopForm={shopForm}
        setShopForm={setShopForm}
        handleSaveShopForm={handleSaveShopForm}
      />
    </div>
  );
}
