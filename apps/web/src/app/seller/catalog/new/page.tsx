"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/api";
import { sellerTranslations, SellerLocale } from "@/lib/seller-i18n";

export default function CreateProductPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<SellerLocale>("fr");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("maroquinerie");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [originCity, setOriginCity] = useState("Cotonou");
  const [priceFcfa, setPriceFcfa] = useState("");
  const [stockOnHand, setStockOnHand] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ojarket_seller_locale") as SellerLocale;
      if (saved === "en" || saved === "fr") setLocale(saved);
    } catch {}
  }, []);

  const t = sellerTranslations[locale];

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const token = getStoredToken();
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/seller/uploads", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors du téléversement");
      }

      if (data.url) {
        setUploadedImages((prev) => [...prev, data.url]);
      }
    } catch (err: any) {
      setError(err.message || "Échec de l'envoi de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (imageUrl.trim()) {
      setUploadedImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (publishImmediate: boolean) => {
    setError(null);

    if (!title.trim()) {
      setError(t.newProduct.errorRequired);
      return;
    }

    const priceNum = parseInt(priceFcfa.replace(/\D/g, ""), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Le prix doit être un montant valide en FCFA.");
      return;
    }

    const stockNum = parseInt(stockOnHand, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError("Le stock doit être un nombre positif.");
      return;
    }

    setSubmitting(true);
    const token = getStoredToken();

    const finalCategory = category === "custom"
      ? (customCategory.trim() || "Création Originale")
      : category;

    try {
      const res = await fetch("/api/v1/seller/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          category: finalCategory,
          description: description.trim(),
          originCity: originCity.trim() || "Cotonou",
          priceMinor: priceNum * 100, // minor units in database
          stockOnHand: stockNum,
          images: uploadedImages,
          isPublished: publishImmediate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la création de la pièce");
      }

      // Success: redirect to catalog
      router.push("/seller/catalog");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header with Navigation Back */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <Link
            href="/seller/catalog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12.5px",
              color: "#D4B483",
              textDecoration: "none",
              marginBottom: "8px",
            }}
          >
            ← {t.newProduct.backToCatalog}
          </Link>
          <h1 style={{ fontFamily: "var(--oj-font-editorial, serif)", fontSize: "28px", color: "#F8F6F0", margin: "0 0 6px 0" }}>
            {t.newProduct.title}
          </h1>
          <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "14px", margin: 0 }}>
            {t.newProduct.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="seller-secondary-btn"
            style={{
              padding: "10px 18px",
              fontSize: "13px",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {t.newProduct.saveDraft}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
            className="seller-action-btn"
            style={{
              padding: "10px 22px",
              fontSize: "13px",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Enregistrement..." : t.newProduct.publishNow}
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "8px",
            backgroundColor: "rgba(229, 115, 115, 0.15)",
            border: "1px solid rgba(229, 115, 115, 0.4)",
            color: "#FFCDD2",
            fontSize: "13.5px",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      {/* Main Form Body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "28px" }}>
        {/* Left Column: Form Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Section 1: General Info */}
          <div
            className="seller-card"
            style={{
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "16px", color: "#D4B483", fontFamily: "var(--oj-font-editorial, serif)", margin: "0 0 16px 0" }}>
              {t.newProduct.sectionGeneral}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Title */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  {t.newProduct.titleLabel}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.newProduct.titlePlaceholder}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                  }}
                />
              </div>

              {/* Category & City */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                    {t.newProduct.categoryLabel}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: "var(--oj-color-surface, #111C1A)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#F8F6F0",
                      fontSize: "13.5px",
                    }}
                  >
                    <option value="maroquinerie">{t.newProduct.catLeather}</option>
                    <option value="jewelry">{t.newProduct.catJewelry}</option>
                    <option value="wood">{t.newProduct.catWood}</option>
                    <option value="textile">{t.newProduct.catTextile}</option>
                    <option value="fashion">{t.newProduct.catFashion}</option>
                    <option value="shoes">{t.newProduct.catShoes}</option>
                    <option value="cosmetics">{t.newProduct.catCosmetics}</option>
                    <option value="art">{t.newProduct.catArt}</option>
                    <option value="home">{t.newProduct.catHome}</option>
                    <option value="gourmet">{t.newProduct.catGourmet}</option>
                    <option value="accessories">{t.newProduct.catAccessories}</option>
                    <option value="digital">{t.newProduct.catDigital}</option>
                    <option value="custom">{t.newProduct.catCustom}</option>
                  </select>
                  {category === "custom" && (
                    <div style={{ marginTop: "10px" }}>
                      <label style={{ display: "block", fontSize: "12px", color: "#D4B483", marginBottom: "4px", fontWeight: 600 }}>
                        {t.newProduct.customCategoryLabel}
                      </label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder={t.newProduct.customCategoryPlaceholder}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          padding: "9px 12px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(0, 0, 0, 0.35)",
                          border: "1.5px solid rgba(212, 180, 131, 0.45)",
                          color: "#F8F6F0",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                    {t.newProduct.cityLabel}
                  </label>
                  <input
                    type="text"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    placeholder="Cotonou"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#F8F6F0",
                      fontSize: "13.5px",
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  {t.newProduct.descriptionLabel}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.newProduct.descriptionPlaceholder}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "13.5px",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Stock */}
          <div
            className="seller-card"
            style={{
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "16px", color: "#D4B483", fontFamily: "var(--oj-font-editorial, serif)", margin: "0 0 16px 0" }}>
              {t.newProduct.sectionPricing}
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  {t.newProduct.priceLabel}
                </label>
                <input
                  type="text"
                  value={priceFcfa}
                  onChange={(e) => setPriceFcfa(e.target.value)}
                  placeholder={t.newProduct.pricePlaceholder}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "14px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", color: "#F8F6F0", marginBottom: "6px", fontWeight: 500 }}>
                  {t.newProduct.stockLabel}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockOnHand}
                  onChange={(e) => setStockOnHand(e.target.value)}
                  placeholder={t.newProduct.stockPlaceholder}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "14px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visuals & Media */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            className="seller-card"
            style={{
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "16px", color: "#D4B483", fontFamily: "var(--oj-font-editorial, serif)", margin: "0 0 12px 0" }}>
              {t.newProduct.sectionMedia}
            </h2>
            <p style={{ color: "rgba(248, 246, 240, 0.65)", fontSize: "12.5px", margin: "0 0 16px 0", lineHeight: "1.5" }}>
              {t.newProduct.mediaDesc}
            </p>

            {/* Upload Zone */}
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px 16px",
                borderRadius: "8px",
                border: "2px dashed rgba(173, 132, 85, 0.3)",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                cursor: isUploading ? "wait" : "pointer",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{ display: "none" }}
              />
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "8px" }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span style={{ fontSize: "12.5px", color: "#F8F6F0" }}>
                {isUploading ? "Téléversement en cours..." : t.newProduct.uploadDropzone}
              </span>
            </label>

            {/* Direct URL input fallback */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.7)", marginBottom: "6px" }}>
                {t.newProduct.uploadOrUrl}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={t.newProduct.urlPlaceholder}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#F8F6F0",
                    fontSize: "12.5px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="seller-secondary-btn"
                  style={{
                    padding: "8px 14px",
                    fontSize: "12px",
                  }}
                >
                  + Ajouter
                </button>
              </div>
            </div>

            {/* Gallery of uploaded/added images */}
            {uploadedImages.length > 0 && (
              <div>
                <div style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.7)", marginBottom: "8px" }}>
                  Visuels associés ({uploadedImages.length}) :
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {uploadedImages.map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: "6px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <img src={img} alt={`Aperçu ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="seller-btn-delete"
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          width: "22px",
                          height: "22px",
                          padding: 0,
                          borderRadius: "50%",
                        }}
                        title="Retirer ce visuel"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Studio Framing Assurance */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(212, 180, 131, 0.08)",
                border: "1px solid rgba(212, 180, 131, 0.25)",
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="1.75" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
              </svg>
              <div style={{ fontSize: "12px", color: "rgba(248, 246, 240, 0.85)", lineHeight: "1.5" }}>
                <strong style={{ color: "#D4B483" }}>Cadrage Studio Adaptatif :</strong> Vos photographies (carrées 1:1, paysages ou portraits) sont automatiquement intégrées sans rognage avec un halo d’exposition noble.
              </div>
            </div>
          </div>

          {/* Live Card Preview (Reflecting the true 4:5 storefront ratio) */}
          <div
            className="seller-card"
            style={{
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "1px", color: "#D4B483", fontWeight: 700 }}>
                {t.newProduct.previewTitle} (Vitrine 4:5)
              </div>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "999px", backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#34D399", border: "1px solid rgba(16, 185, 129, 0.3)", fontWeight: 700 }}>
                En Direct
              </span>
            </div>

            <div
              style={{
                borderRadius: "12px",
                backgroundColor: "#0B1614",
                overflow: "hidden",
                border: "1px solid rgba(212, 180, 131, 0.25)",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Product Visual Container with 4:5 Ratio & Dual-Layer Studio Presentation */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4/5",
                  background: "radial-gradient(circle at 50% 50%, rgba(212, 180, 131, 0.08) 0%, #081018 100%)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Badge top-left */}
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(8, 16, 24, 0.85)",
                    color: "#D4B483",
                    fontSize: "9.5px",
                    fontWeight: 700,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(212, 180, 131, 0.3)",
                    zIndex: 10,
                  }}
                >
                  {category === "custom"
                    ? (customCategory.trim() || "Personnalisée")
                    : category}
                </span>

                {uploadedImages.length > 0 ? (
                  <>
                    {/* Ambient Glow Backdrop */}
                    <img
                      src={uploadedImages[0]}
                      alt=""
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: "-15%",
                        width: "130%",
                        height: "130%",
                        objectFit: "cover",
                        filter: "blur(24px) saturate(1.4)",
                        opacity: 0.35,
                        transform: "scale(1.1)",
                        pointerEvents: "none",
                        zIndex: 1,
                      }}
                    />
                    {/* Primary Foreground Image */}
                    <img
                      src={uploadedImages[0]}
                      alt="Aperçu"
                      style={{
                        position: "relative",
                        zIndex: 2,
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "12px",
                        filter: "drop-shadow(0 6px 14px rgba(0, 0, 0, 0.3))",
                      }}
                    />
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#D4B483" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                    </svg>
                    <span style={{ fontSize: "11px", marginTop: "8px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                      Ojarket Prestige
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: "14px 16px 16px" }}>
                <div style={{ fontSize: "10.5px", color: "#D4B483", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 700, marginBottom: "4px" }}>
                  {originCity || "Cotonou"} · {category === "custom" ? (customCategory.trim() || "Création d'Art") : category}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#F8F6F0", marginBottom: "10px", lineHeight: "1.35" }}>
                  {title || "Titre de la création"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#D4B483", fontVariantNumeric: "tabular-nums" }}>
                    {priceFcfa ? `${(parseInt(priceFcfa.replace(/\D/g, "") || "0", 10)).toLocaleString("fr-FR")} FCFA` : "0 FCFA"}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#D4B483", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#D4B483" strokeWidth="2">
                      <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                    </svg>
                    NOUVEAU
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
