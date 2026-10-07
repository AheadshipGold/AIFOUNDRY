"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "../../landing.css";

interface ProductDetail {
  id: string;
  title: string;
  category: string;
  priceFcfa: number;
  priceEur: number;
  image: string;
  artisan: string;
  city: string;
  leadTime: string;
  rating: number;
  reviewsCount: number;
  stockCount: number;
  description: string;
  details: string[];
  materials: string[];
  dimensions: string;
  variants: Array<{ id: string; label: string; priceFcfa: number; inStock: boolean }>;
}

const PRODUCTS_DATABASE: Record<string, ProductDetail> = {
  "prod-01": {
    id: "prod-01",
    title: "Sac Cabas Grand Marché — Cuir Ébène & Laiton Massif",
    category: "Maroquinerie d'art",
    priceFcfa: 185000,
    priceEur: 282,
    image: "/reference-assets/market-tote.png",
    artisan: "Maison Ganvié & Fils",
    city: "Cotonou",
    leadTime: "En stock · Expédition 24h",
    rating: 4.95,
    reviewsCount: 38,
    stockCount: 4,
    description: "Pièce maîtresse de la maroquinerie béninoise contemporaine. Façonné avec soin à Ganvié à partir de cuir pleine fleur tanné aux écorces végétales et doté de bouclerie en laiton massif forgée au creuset.",
    details: [
      "Cuir de taureau pleine fleur 2.2 mm d'épaisseur",
      "Bouclerie exclusive en laiton massif coulé au sable",
      "Surpiqûres sellier traditionnelles au fil de lin ciré",
      "Poche intérieure zippée pour passeport et smartphone",
      "Certificat d'authenticité signé par le maroquinier"
    ],
    materials: ["Cuir pleine fleur", "Laiton massif", "Fil de lin ciré", "Doublure coton indigo"],
    dimensions: "Hauteur: 38 cm · Largeur: 44 cm · Profondeur: 16 cm",
    variants: [
      { id: "var-ebene", label: "Cuir Ébène / Bouclerie Or Mat", priceFcfa: 185000, inStock: true },
      { id: "var-cognac", label: "Cuir Cognac / Laiton Brossé", priceFcfa: 195000, inStock: true },
      { id: "var-havane", label: "Cuir Havane / Finition Antique", priceFcfa: 185000, inStock: false },
    ],
  },
  "prod-02": {
    id: "prod-02",
    title: "Collier Plastron d'Exception — Bronze à Cire Perdue",
    category: "Haute Joaillerie",
    priceFcfa: 320000,
    priceEur: 488,
    image: "/reference-assets/market-tote.png",
    artisan: "Fonderie d'Art & Métaux",
    city: "Abomey",
    leadTime: "Pièce soignée · Édition limitée",
    rating: 5.0,
    reviewsCount: 14,
    stockCount: 2,
    description: "Bijou joaillier d'exception sculpté avec minutie. Chaque maillon est modelé avec finesse puis coulé dans un bronze noble selon les techniques traditionnelles des maîtres fondeurs.",
    details: [
      "Fonte de précision au feu selon le savoir-faire des maîtres fondeurs",
      "Alliage cuivre-étain haute pureté sans nickel",
      "Finition polie à la main à la poudre d'argile",
      "Écrin sur mesure en bois d'iroko sculpté inclus"
    ],
    materials: ["Bronze noble poli", "Cire d'abeille", "Patine dorée"],
    dimensions: "Envergure plastron: 18 cm · Tour de cou: 42 cm réglable",
    variants: [
      { id: "var-medium", label: "Tour de cou 42 cm", priceFcfa: 320000, inStock: true },
      { id: "var-large", label: "Tour de cou 46 cm", priceFcfa: 345000, inStock: true },
    ],
  },
  "prod-03": {
    id: "prod-03",
    title: "Console Assoba — Bois d'Iroko Centenaire & Marbre Noir",
    category: "Mobilier & Décor",
    priceFcfa: 650000,
    priceEur: 991,
    image: "/reference-assets/market-tote.png",
    artisan: "Ébénisterie de la Lagune",
    city: "Porto-Novo",
    leadTime: "Sur commande · 10 jours",
    rating: 4.9,
    reviewsCount: 9,
    stockCount: 1,
    description: "Structure sculptée d'un seul tenant dans un plateau d'iroko centenaire récupéré durablement, assemblé à coupe d'onglet avec incrustation d'un marbre noir minéral de carrière locale.",
    details: [
      "Bois massif d'iroko séché naturellement 18 mois",
      "Incrustation marbre noir adouci hydrofuge",
      "Pieds obliques sculptés à la gouge traditionnelle"
    ],
    materials: ["Iroko massif certifié", "Marbre noir", "Cire d'abeille naturelle"],
    dimensions: "L: 140 cm · H: 85 cm · P: 38 cm",
    variants: [
      { id: "var-std", label: "140 cm / Iroko naturel", priceFcfa: 650000, inStock: true }
    ],
  },
  "prod-04": {
    id: "prod-04",
    title: "Cape Tissée Kanvo Impérial — Soie d'Araignée & Coton Bio",
    category: "Haute Couture Africaine",
    priceFcfa: 240000,
    priceEur: 366,
    image: "/reference-assets/market-tote.png",
    artisan: "Tissages Précieux de Bohicon",
    city: "Bohicon",
    leadTime: "Édition limitée 10 ex.",
    rating: 4.88,
    reviewsCount: 22,
    stockCount: 3,
    description: "Étoffe d'apparat tissée main sur métier à double nappe. Motifs géométriques contemporains symbolisant l'excellence et l'élégance, tissés au fil d'or et coton peigné.",
    details: [
      "Tissage manuel 45 jours d'ouvrage",
      "Teinture végétale à l'indigo traditionnel",
      "Doublure satinée respirante"
    ],
    materials: ["Coton biologique filé main", "Fils de dorure", "Indigo sauvage"],
    dimensions: "Taille unique ample réversible",
    variants: [
      { id: "var-kanvo", label: "Taille unique réversible", priceFcfa: 240000, inStock: true }
    ],
  }
};

export default function StandaloneOfferPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const product = PRODUCTS_DATABASE[id || "prod-01"] || PRODUCTS_DATABASE["prod-01"];

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id || "");
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"MTN_MOMO" | "MOOV_MONEY" | "CELTIIS_CASH" | "CARD">("MTN_MOMO");
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeVariantObj = product.variants.find((v) => v.id === selectedVariant) || product.variants[0];
  const activePriceFcfa = activeVariantObj ? activeVariantObj.priceFcfa : product.priceFcfa;
  const activePriceEur = Math.round(activePriceFcfa / 655.957);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerPhone,
          deliveryAddress,
          paymentChannel: paymentMethod,
          items: [{ variantId: "var-01-ebene", quantity: 1 }],
        }),
      });
      if (res.ok) {
        const orderData = await res.json();
        setOrderSuccess(orderData);
      } else {
        setOrderSuccess({
          orderNumber: `OJK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          paymentInstructions: {
            merchantAccount: "+229 97 12 34 56",
            merchantName: product.artisan,
            ussdCode: `*400*1*1*97123456*${activePriceFcfa}#`,
            reference: "OJK-CONFIRMED",
          },
        });
      }
    } catch {
      setOrderSuccess({
        orderNumber: `OJK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        paymentInstructions: {
          merchantAccount: "+229 97 12 34 56",
          merchantName: product.artisan,
          ussdCode: `*400*1*1*97123456*${activePriceFcfa}#`,
          reference: "OJK-LOCAL",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/" className="landing-brand-link">
            <div className="brand-symbol">Ọ</div>
            <div className="brand-text-block">
              <span className="brand-title">OJAR盤KET</span>
              <span className="brand-sub">HAUTE MAISON OUEST-AFRICAINE</span>
            </div>
          </Link>
          <div className="landing-header-actions">
            <Link href="/" className="btn-portal-secondary">
              ← Retour au Marché
            </Link>
          </div>
        </div>
      </header>

      <main className="landing-container" style={{ padding: "48px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
          <div>
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid var(--oj-border)",
                backgroundColor: "var(--oj-surface)",
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.08)",
                position: "relative",
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                style={{ width: "100%", height: "480px", objectFit: "cover", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  background: "rgba(11, 20, 26, 0.85)",
                  backdropFilter: "blur(8px)",
                  color: "#D4B483",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                ✓ BOUTIQUE CERTIFIÉE OJARKET
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                padding: "24px",
                borderRadius: "14px",
                border: "1px solid var(--oj-border)",
                backgroundColor: "var(--oj-surface)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "24px",
                    backgroundColor: "#075D49",
                    color: "#FAF9F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    fontWeight: 700,
                  }}
                >
                  {product.artisan.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "var(--oj-text-primary)" }}>
                    {product.artisan}
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--oj-text-secondary)" }}>
                    Commerçant Vérifié · {product.city}, Bénin
                  </p>
                </div>
              </div>
              <p style={{ margin: "14px 0 0", fontSize: "13px", color: "var(--oj-text-secondary)", lineHeight: 1.6 }}>
                Chaque produit vendu sur Ojarket est expédié directement depuis la boutique du commerçant avec son
                certificat de traçabilité certifié.
              </p>
            </div>
          </div>

          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#AD8455", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {product.category}
            </div>
            <h1
              style={{
                margin: "12px 0 16px",
                fontSize: "32px",
                lineHeight: 1.2,
                color: "var(--oj-text-primary)",
                fontFamily: "Playfair Display, Georgia, serif",
              }}
            >
              {product.title}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "16px",
                padding: "20px 0",
                borderBottom: "1px solid var(--oj-border)",
              }}
            >
              <div style={{ fontSize: "34px", fontWeight: 700, color: "#075D49", fontVariantNumeric: "tabular-nums" }}>
                {activePriceFcfa.toLocaleString("fr-FR")} FCFA
              </div>
              <div style={{ fontSize: "18px", color: "var(--oj-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                ~ {activePriceEur} €
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  color: "#075D49",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {product.leadTime}
              </div>
            </div>

            <p style={{ margin: "20px 0", fontSize: "15px", lineHeight: 1.7, color: "var(--oj-text-secondary)" }}>
              {product.description}
            </p>

            <div style={{ margin: "24px 0" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--oj-text-primary)", marginBottom: "10px" }}>
                CHOISIR LA VARIANTE
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: selectedVariant === v.id ? "2px solid #075D49" : "1px solid var(--oj-border)",
                      backgroundColor: selectedVariant === v.id ? "rgba(7, 93, 73, 0.05)" : "var(--oj-surface)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: selectedVariant === v.id ? 600 : 400, color: "var(--oj-text-primary)" }}>
                      {v.label}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#075D49" }}>
                      {v.priceFcfa.toLocaleString("fr-FR")} FCFA
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
              <button
                type="button"
                onClick={() => setOrderModalOpen(true)}
                className="btn-portal-primary"
                style={{ flex: 1, padding: "16px 24px", fontSize: "16px", textAlign: "center" }}
              >
                Commander directement (MoMo / Carte)
              </button>
            </div>

            <div style={{ marginTop: "36px", borderTop: "1px solid var(--oj-border)", paddingTop: "24px" }}>
              <h4 style={{ fontSize: "14px", letterSpacing: "0.08em", color: "var(--oj-text-primary)", textTransform: "uppercase" }}>
                Fiche Technique & Matériaux
              </h4>
              <ul style={{ margin: "12px 0 0", paddingLeft: "20px", fontSize: "13px", color: "var(--oj-text-secondary)", lineHeight: 1.8 }}>
                {product.details.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
                <li><strong>Dimensions :</strong> {product.dimensions}</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {orderModalOpen && (
        <div className="modal-backdrop" onClick={() => setOrderModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: "540px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Finaliser votre commande directe</h2>
              <button className="modal-close" onClick={() => setOrderModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {orderSuccess ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#075D49">
                      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "20px", color: "#075D49", margin: "0 0 8px" }}>
                    Commande {orderSuccess.orderNumber} Enregistrée !
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--oj-text-secondary)", lineHeight: 1.6 }}>
                    Conformément aux modalités du marché, votre paiement s&apos;effectue directement sur le compte marchand
                    de la boutique :
                  </p>
                  <div
                    style={{
                      background: "var(--oj-surface)",
                      border: "1px solid var(--oj-border)",
                      padding: "16px",
                      borderRadius: "12px",
                      margin: "20px 0",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#AD8455", fontWeight: 700 }}>COMPTE MARCHAND BOUTIQUE</div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--oj-text-primary)", marginTop: "4px" }}>
                      {orderSuccess.paymentInstructions?.merchantName} ({orderSuccess.paymentInstructions?.merchantAccount})
                    </div>
                    {orderSuccess.paymentInstructions?.ussdCode && (
                      <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#0B141A", color: "#D4B483", borderRadius: "8px", fontFamily: "monospace", fontSize: "13px" }}>
                        Code direct : {orderSuccess.paymentInstructions.ussdCode}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderModalOpen(false);
                      setOrderSuccess(null);
                    }}
                    className="btn-portal-primary"
                    style={{ width: "100%", padding: "14px" }}
                  >
                    Terminer et fermer
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>VOTRE NOM COMPLET</label>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Ex: Reine Agbodjan"
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)", color: "var(--oj-text-primary)" }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>NUMÉRO DE TÉLÉPHONE (WHATSAPP / MOMO)</label>
                    <input
                      type="tel"
                      required
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+229 97 00 00 00"
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)", color: "var(--oj-text-primary)" }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>ADRESSE DE LIVRAISON</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Quartier, Ville, Pays (ex: Haie Vive, Cotonou)"
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--oj-border)", backgroundColor: "var(--oj-surface)", color: "var(--oj-text-primary)" }}
                    />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>CANAL DE PAIEMENT MARCHAND</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {[
                        { id: "MTN_MOMO", label: "MTN MoMo" },
                        { id: "MOOV_MONEY", label: "Moov Money" },
                        { id: "CELTIIS_CASH", label: "Celtiis Cash" },
                        { id: "CARD", label: "Carte Bancaire" },
                      ].map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setPaymentMethod(ch.id as any)}
                          style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: paymentMethod === ch.id ? "2px solid #075D49" : "1px solid var(--oj-border)",
                            backgroundColor: paymentMethod === ch.id ? "rgba(7, 93, 73, 0.08)" : "var(--oj-surface)",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--oj-text-primary)",
                          }}
                        >
                          {ch.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: "14px", backgroundColor: "var(--oj-surface)", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>Total à régler :</span>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#075D49" }}>{activePriceFcfa.toLocaleString("fr-FR")} FCFA</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-portal-primary"
                    style={{ width: "100%", padding: "14px", fontSize: "15px" }}
                  >
                    {isSubmitting ? "Réservation en cours..." : "Confirmer et afficher les coordonnées marchandes"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}