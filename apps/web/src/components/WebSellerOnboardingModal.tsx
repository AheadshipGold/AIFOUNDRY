"use client";

import React, { useState } from "react";
import { AuthApi, type AuthUser } from "../lib/api";

interface WebSellerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onShopRegistered: (updatedUser: AuthUser) => void;
  onRequireLogin: () => void;
  isEn?: boolean;
}

const COMMERCIAL_CATEGORIES = [
  "Maroquinerie & Mode",
  "Bijoux & Accessoires",
  "Maison & Décoration",
  "Horlogerie & Montres",
  "Art & Artisanat d'Art",
  "Électronique & High-Tech",
  "Produits Numériques",
  "Commerce Général",
];

export function WebSellerOnboardingModal({
  isOpen,
  onClose,
  currentUser,
  onShopRegistered,
  onRequireLogin,
  isEn = false,
}: WebSellerOnboardingModalProps) {
  const [shopName, setShopName] = useState("");
  const [craftType, setCraftType] = useState("Maroquinerie & Mode");
  const [city, setCity] = useState("Cotonou");
  const [description, setDescription] = useState("");
  const [merchantPhone, setMerchantPhone] = useState("+229 ");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onClose();
      onRequireLogin();
      return;
    }

    if (!shopName.trim()) {
      setError(isEn ? "Please enter your store name." : "Veuillez renseigner le nom de votre boutique.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await AuthApi.registerSeller({
        shopName: shopName.trim(),
        craftType,
        city: city.trim() || "Cotonou",
        description: description.trim() || undefined,
        merchantPhone: merchantPhone.trim() || undefined,
      });

      setSuccessMsg(res.message || (isEn ? "Store registered successfully! Pending KYC review." : "Boutique enregistrée avec succès ! En attente d'approbation KYC."));
      
      // Fetch fresh profile
      const updatedUser = await AuthApi.getMe();
      setTimeout(() => {
        setSuccessMsg("");
        onShopRegistered(updatedUser);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || (isEn ? "Store registration failed." : "Échec de l'enregistrement de la boutique."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="oj-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        className="oj-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: "36px 32px",
          maxWidth: "500px",
          width: "100%",
          borderRadius: "16px",
          backgroundColor: "var(--oj-color-surface)",
          border: "1px solid var(--oj-color-border)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "var(--oj-color-text)",
            lineHeight: 1,
            padding: "6px",
          }}
          aria-label="Fermer"
        >
          ✕
        </button>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)", letterSpacing: "0.14em" }}>
            OJARKET · ESPACE COMMERÇANT
          </span>
          <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", margin: "6px 0 8px", color: "var(--oj-color-text)" }}>
            {isEn ? "Open Your Store on Ojarket" : "Ouvrir Votre Boutique Vendeur"}
          </h2>
          <p style={{ color: "var(--oj-color-muted)", fontSize: "13px", margin: 0 }}>
            {isEn
              ? "Sell your products with zero commission, integrated Mobile Money and daily cash register."
              : "Vendez vos produits à 0% de commission avec encaissement Mobile Money direct et journal de caisse."}
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              color: "#DC2626",
              fontSize: "13px",
              marginBottom: "16px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {successMsg ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px", color: "#075D49" }}>✓</div>
            <h3 style={{ fontSize: "18px", color: "var(--oj-color-text)", margin: "0 0 8px" }}>
              {isEn ? "Application Submitted!" : "Dossier Transmis !"}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--oj-color-muted)", margin: 0 }}>
              {successMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                {isEn ? "Store / Business Name" : "Nom Commercial de la Boutique"} *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Ex: Maison Laurent Cotonou"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--oj-color-border)",
                  backgroundColor: "var(--oj-color-subtle)",
                  color: "var(--oj-color-text)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                  {isEn ? "Primary Category" : "Catégorie Principale"} *
                </label>
                <select
                  value={craftType}
                  onChange={(e) => setCraftType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "13px",
                  }}
                >
                  {COMMERCIAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                  {isEn ? "City / Location" : "Ville / Localisation"} *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Cotonou, Ganvié..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--oj-color-border)",
                    backgroundColor: "var(--oj-color-subtle)",
                    color: "var(--oj-color-text)",
                    fontSize: "13px",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                {isEn ? "Merchant Mobile Money Phone (MTN / Moov)" : "Numéro Marchand Mobile Money (MTN / Moov)"}
              </label>
              <input
                type="tel"
                value={merchantPhone}
                onChange={(e) => setMerchantPhone(e.target.value)}
                placeholder="+229 97 00 00 00"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--oj-color-border)",
                  backgroundColor: "var(--oj-color-subtle)",
                  color: "var(--oj-color-text)",
                  fontSize: "13px",
                }}
              />
              <small style={{ display: "block", color: "var(--oj-color-muted)", fontSize: "11px", marginTop: "4px" }}>
                {isEn ? "Used for direct client payments (*880# / *155#)." : "Sert à recevoir vos paiements clients directs (*880# / *155#)."}
              </small>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: "var(--oj-color-text)" }}>
                {isEn ? "Description & Specialties" : "Description & Spécialités"}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Présentez brièvement vos produits et savoir-faire..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--oj-color-border)",
                  backgroundColor: "var(--oj-color-subtle)",
                  color: "var(--oj-color-text)",
                  fontSize: "13px",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="oj-btn-primary"
              style={{ width: "100%", height: "44px", fontSize: "14px", marginTop: "6px" }}
            >
              {loading ? (isEn ? "Submitting..." : "Enregistrement en cours...") : (isEn ? "Register My Store →" : "Enregistrer ma Boutique →")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default WebSellerOnboardingModal;
