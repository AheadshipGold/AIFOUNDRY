import React from "react";
import { AdminIconX, AdminIconUpload, AdminIconSparkle, AdminIconCheck } from "../shared/AdminIcons";

export interface CmsProductForm {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  currency: string;
  description: string;
  sellerName: string;
  sellerCity: string;
  sellerIsPremium: boolean;
  sellerId: string;
  badgeText: string;
}

interface CmsProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn: boolean;
  editingProductIndex: number | null;
  productForm: CmsProductForm;
  setProductForm: (form: CmsProductForm) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingImage: boolean;
  adminShopsList: any[];
  PRESET_IMAGES: { label: string; url: string }[];
  CMS_CATEGORIES: { id: string; label: string }[];
  handleSaveProductForm: () => void;
}

export function CmsProductModal({
  isOpen,
  onClose,
  isEn,
  editingProductIndex,
  productForm,
  setProductForm,
  fileInputRef,
  handleImageUpload,
  uploadingImage,
  adminShopsList,
  PRESET_IMAGES,
  CMS_CATEGORIES,
  handleSaveProductForm,
}: CmsProductModalProps) {
  if (!isOpen) return null;

  return (
    <div className="oj-cms-modal-backdrop" onClick={onClose}>
      <div className="oj-cms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="oj-cms-modal-header">
          <h2>
            {editingProductIndex !== null
              ? (isEn ? "Edit Featured Creation" : "Modifier la Création Phare")
              : (isEn ? "Add Featured Creation" : "Ajouter une Création Phare")}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--oj-color-muted)", cursor: "pointer" }}
          >
            <AdminIconX size={18} />
          </button>
        </div>

        <div className="oj-cms-modal-body">
          {/* Product Title */}
          <div className="oj-cms-form-field">
            <label>{isEn ? "Creation Title" : "Titre de la Création d'Élite"}</label>
            <input
              type="text"
              placeholder={isEn ? "e.g. Heritage Chronometer" : "ex: Chronomètre Heritage en Or Noble"}
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
            />
          </div>

          {/* Category & Price Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="oj-cms-form-field">
              <label>{isEn ? "Category / Rayon" : "Rayon & Savoir-Faire"}</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              >
                {CMS_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="oj-cms-form-field">
              <label>{isEn ? "Price in FCFA" : "Prix d'Apparat (FCFA)"}</label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Hidden File Input for direct photo upload */}
          <input
            type="file"
            ref={fileInputRef as any}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: "none" }}
          />

          {/* Image Visual, Upload & Presets */}
          <div className="oj-cms-form-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={{ margin: 0 }}>{isEn ? "Creation Photography / Visual" : "Photographie & Visuel de la Pièce"}</label>
              <span style={{ fontSize: "11px", color: "var(--oj-color-muted)" }}>
                {isEn ? "High-res PNG, JPG or WebP" : "Haute résolution PNG, JPG ou WebP"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
              <button
                type="button"
                className="oj-btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                style={{
                  height: "36px",
                  padding: "0 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: uploadingImage ? "wait" : "pointer",
                  opacity: uploadingImage ? 0.7 : 1,
                }}
              >
                <AdminIconUpload size={14} color="var(--oj-color-action)" />
                {uploadingImage
                  ? (isEn ? "Uploading image..." : "Téléversement en cours...")
                  : (isEn ? "Upload Photo from Device" : "Téléverser depuis l'Appareil")}
              </button>
              <span style={{ fontSize: "12px", color: "var(--oj-color-muted)" }}>
                {isEn ? "or paste URL:" : "ou URL :"}
              </span>
            </div>

            <input
              type="text"
              placeholder="/products/watch-chrono.jpg ou https://..."
              value={productForm.image}
              onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
            />

            <div className="oj-cms-image-preview-box">
              <img
                src={productForm.image || "/products/watch-chrono.jpg"}
                alt="Aperçu"
                className="oj-cms-thumb-preview"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/products/watch-chrono.jpg";
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", color: "var(--oj-color-muted)", marginBottom: "6px" }}>
                  {isEn ? "Quick presets from platform asset vault:" : "Sélecteur rapide parmi les créations du coffre :"}
                </div>
                <div className="oj-cms-preset-chips">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      className="oj-cms-preset-chip"
                      onClick={() => setProductForm({ ...productForm, image: img.url })}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Partner Shop Selector & Inputs */}
          <div className="oj-cms-form-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={{ margin: 0 }}>{isEn ? "Partner Boutique / Artisan House" : "Boutique Partenaire / Maison d'Artisanat"}</label>
              {adminShopsList.length > 0 && (
                <span style={{ fontSize: "11px", color: "var(--oj-color-action)", fontWeight: 600 }}>
                  {adminShopsList.length} {isEn ? "shops in DB" : "boutiques en base"}
                </span>
              )}
            </div>

            {adminShopsList.length > 0 && (
              <select
                style={{ marginTop: "4px", marginBottom: "8px" }}
                value={productForm.sellerId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const shop = adminShopsList.find((s) => s.id === selectedId);
                  if (shop) {
                    const isOfficial = shop.name.toLowerCase().includes("kingston");
                    setProductForm({
                      ...productForm,
                      sellerId: shop.id,
                      sellerName: shop.name,
                      sellerCity: shop.city || "Cotonou",
                      sellerIsPremium: shop.status === "VERIFIED",
                      badgeText: isOfficial ? "Boutique Officielle" : "Partenaire Phare",
                    });
                  }
                }}
              >
                <option value="">{isEn ? "-- Select from registered partner shops --" : "-- Choisir une boutique partenaire enregistrée --"}</option>
                {adminShopsList.map((shop: any) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name} ({shop.city || "Cotonou"}) · {shop.status === "VERIFIED" ? (isEn ? "Verified" : "Certifiée") : (isEn ? "Pending" : "En attente")}
                  </option>
                ))}
              </select>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--oj-color-muted)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  {isEn ? "Shop Name" : "Nom Commercial"}
                </label>
                <input
                  type="text"
                  value={productForm.sellerName}
                  onChange={(e) => setProductForm({ ...productForm, sellerName: e.target.value })}
                  placeholder="ex: Kingston Bio"
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--oj-color-muted)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  {isEn ? "Origin City" : "Ville d'Atelier / Siège"}
                </label>
                <input
                  type="text"
                  value={productForm.sellerCity}
                  onChange={(e) => setProductForm({ ...productForm, sellerCity: e.target.value })}
                  placeholder="ex: Cotonou"
                />
              </div>
            </div>
          </div>

          {/* Promotional Badge / Status Chips */}
          <div className="oj-cms-form-field">
            <label>{isEn ? "Promotional Badge / Spotlight Label" : "Badge Promotionnel & Mise en Avant"}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "4px 0 8px" }}>
              {[
                { id: "Boutique Officielle", label: isEn ? "Official Store" : "Boutique Officielle" },
                { id: "Partenaire Phare", label: isEn ? "Flagship Partner" : "Partenaire Phare" },
                { id: "Promotion Sponsorisée", label: isEn ? "Sponsored Promo" : "Promotion Sponsorisée" },
                { id: "Nouveau Talent", label: isEn ? "Emerging Talent" : "Nouveau Talent" },
                { id: "Création d'Élite", label: isEn ? "Elite Creation" : "Création d'Élite" },
                { id: "Pièce Unique", label: isEn ? "Unique Piece" : "Pièce Unique" },
              ].map((b) => {
                const isSelected = productForm.badgeText === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setProductForm({ ...productForm, badgeText: b.id })}
                    style={{
                      padding: "5px 11px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1px solid #AD8455" : "1px solid var(--oj-color-border)",
                      background: isSelected ? "rgba(173, 132, 85, 0.18)" : "var(--oj-color-subtle)",
                      color: isSelected ? "#D4B483" : "var(--oj-color-text)",
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {isSelected && <AdminIconSparkle size={10} color="#D4B483" />}
                    {b.label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              placeholder={isEn ? "Or custom badge text..." : "Ou texte de badge personnalisé..."}
              value={productForm.badgeText}
              onChange={(e) => setProductForm({ ...productForm, badgeText: e.target.value })}
            />
          </div>

          {/* Premium Certified Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="chk-seller-premium"
              checked={productForm.sellerIsPremium}
              onChange={(e) => setProductForm({ ...productForm, sellerIsPremium: e.target.checked })}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="chk-seller-premium" style={{ fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--oj-color-text)" }}>
              {isEn ? "Official Verified Boutique Badge" : "Boutique Officielle Certifiée (Badge d'Élite)"}
            </label>
          </div>

          {/* Description */}
          <div className="oj-cms-form-field">
            <label>{isEn ? "Prestige Description" : "Description & Histoire de la Pièce"}</label>
            <textarea
              rows={3}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder={isEn ? "Detail materials, horology/craft techniques, and provenance..." : "Précisez les matières nobles, la facture artisanale et l'authenticité de la pièce..."}
            />
          </div>
        </div>

        <div className="oj-cms-modal-footer">
          <button
            className="oj-btn-secondary"
            onClick={onClose}
            style={{ height: "40px", padding: "0 18px" }}
          >
            {isEn ? "Cancel" : "Annuler"}
          </button>
          <button
            className="oj-btn-primary"
            onClick={handleSaveProductForm}
            style={{ height: "40px", padding: "0 22px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <AdminIconCheck size={14} />
            {isEn ? "Confirm Creation" : "Valider la Création"}
          </button>
        </div>
      </div>
    </div>
  );
}
