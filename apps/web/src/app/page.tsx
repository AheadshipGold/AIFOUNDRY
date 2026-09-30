"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DesignProvider, useDesign } from "../design-system/provider";
import "../design-system/styles.css";
import "./landing.css";

// Types
interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  seller: {
    name: string;
    city: string;
    verified: boolean;
    rating: number;
    salesCount: number;
  };
  image: string;
  description: string;
  stock: number;
  variants: { name: string; color: string }[];
}

const CATALOG: Product[] = [
  {
    id: "prod-1",
    title: "Cabas Studio en Cuir Tanné Végétal",
    category: "leather",
    price: 48000,
    currency: "XOF",
    rating: 4.9,
    reviewsCount: 124,
    seller: {
      name: "Maison Laurent",
      city: "Cotonou",
      verified: true,
      rating: 4.9,
      salesCount: 520,
    },
    image: "/reference-assets/market-tote.png",
    description:
      "Un sac cabas intemporel façonné à la main en cuir pleine fleur tanné aux écorces végétales. Anses ergonomiques renforcées pour le port quotidien.",
    stock: 5,
    variants: [
      { name: "Cognac Naturel", color: "#8E502B" },
      { name: "Noir Onyx", color: "#1F2326" },
      { name: "Terre Cuite", color: "#A85D42" },
    ],
  },
  {
    id: "prod-2",
    title: "Chronographe Héritage Automatique Or & Acier",
    category: "watches",
    price: 285000,
    currency: "XOF",
    rating: 5.0,
    reviewsCount: 68,
    seller: {
      name: "Atelier Horlogerie",
      city: "Abidjan",
      verified: true,
      rating: 5.0,
      salesCount: 186,
    },
    image: "/reference-assets/market-tote.png",
    description:
      "Pièce de haute précision avec mouvement mécanique automatique, cadran brossé soleil et lunette ciselée avec inserts en or champagne 18 carats.",
    stock: 2,
    variants: [
      { name: "Or Champagne & Noir", color: "#D4B483" },
      { name: "Acier Brossé & Bleu Nuit", color: "#3B5266" },
    ],
  },
  {
    id: "prod-3",
    title: "Fauteuil Club Travertin & Lin Brut Teint",
    category: "home",
    price: 145000,
    currency: "XOF",
    rating: 4.8,
    reviewsCount: 42,
    seller: {
      name: "Studio Djoliba",
      city: "Bamako",
      verified: true,
      rating: 4.8,
      salesCount: 340,
    },
    image: "/reference-assets/market-tote.png",
    description:
      "Assise sculpturale alliant socle minéral en travertin massif poli et coussin tapissé de lin écru tissé aux métiers traditionnels.",
    stock: 3,
    variants: [
      { name: "Lin Écru", color: "#E7E1D9" },
      { name: "Terre d'Ombre", color: "#54463A" },
    ],
  },
  {
    id: "prod-4",
    title: "Tenture Murale Bogolan & Soie Sauvage",
    category: "fashion",
    price: 36000,
    currency: "XOF",
    rating: 4.9,
    reviewsCount: 89,
    seller: {
      name: "Studio Djoliba",
      city: "Bamako",
      verified: true,
      rating: 4.8,
      salesCount: 340,
    },
    image: "/reference-assets/market-tote.png",
    description:
      "Œuvre textile unique aux pigments d'argile fermentée, mêlant motifs géométriques ancestraux et lisière de soie sauvage filée à la main.",
    stock: 7,
    variants: [
      { name: "Noir & Ocre", color: "#2B241F" },
      { name: "Indigo Profond", color: "#1D283E" },
    ],
  },
  {
    id: "prod-5",
    title: "Bague Sculpturale Or 18K & Pierre Précieuse",
    category: "watches",
    price: 95000,
    currency: "XOF",
    rating: 4.9,
    reviewsCount: 31,
    seller: {
      name: "Orfèvrerie Ashanti",
      city: "Kumasi",
      verified: true,
      rating: 4.9,
      salesCount: 210,
    },
    image: "/reference-assets/market-tote.png",
    description:
      "Anneau en or jaune brossé martelé à la flamme, serti d'une tourmaline verte taille émeraude issue de gisements responsables certifiés.",
    stock: 4,
    variants: [
      { name: "Or Jaune 18K", color: "#D4B483" },
      { name: "Or Rose 18K", color: "#B87363" },
    ],
  },
  {
    id: "prod-6",
    title: "Traité de Modélisme & Maroquinerie d'Art",
    category: "digital",
    price: 6500,
    currency: "XOF",
    rating: 4.7,
    reviewsCount: 215,
    seller: {
      name: "Studio Éditions",
      city: "Dakar",
      verified: true,
      rating: 4.9,
      salesCount: 890,
    },
    image: "/reference-assets/market-tote.png",
    description:
      "Guide complet haute résolution (PDF interactif + patrons vectoriels 1:1) détaillant le point sellier, le parage et l'assemblage des cuirs nobles.",
    stock: 99,
    variants: [{ name: "Édition Numérique Intégrale", color: "#0F7D58" }],
  },
];

function formatPrice(amount: number, currency: string = "XOF"): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${currency}`;
}

export default function MasterOjarketPage() {
  return (
    <DesignProvider>
      <MainMarketplaceView />
    </DesignProvider>
  );
}

function MainMarketplaceView() {
  const { locale, setLocale, theme, setMode } = useDesign();
  const isEn = locale === "en";
  const isDark = theme === "dark";

  // App State
  const [universe, setUniverse] = useState<"buyer" | "seller">("buyer");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [needModalOpen, setNeedModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Seller Dashboard Sub-tab
  const [sellerTab, setSellerTab] = useState<"overview" | "orders" | "cashbook">("overview");

  // Need form state (D02)
  const [needDesc, setNeedDesc] = useState("");
  const [needBudget, setNeedBudget] = useState("");
  const [needPlace, setNeedPlace] = useState("");
  const [needCategory, setNeedCategory] = useState("leather");
  const [needSubmitted, setNeedSubmitted] = useState(false);
  const [aiStructuring, setAiStructuring] = useState(false);

  // Cart operations
  const addToCart = (prod: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter products
  const filteredProducts = CATALOG.filter((p) => {
    const matchesCat = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAiAssist = () => {
    if (!needDesc) {
      setNeedDesc("Je recherche une pièce maroquinière sur-mesure en cuir cognac, format A4, avec fermoir laiton brossé.");
    }
    setAiStructuring(true);
    setTimeout(() => {
      setAiStructuring(false);
      setNeedBudget("65 000 FCFA");
      setNeedPlace("Cotonou, Bénin");
    }, 600);
  };

  return (
    <div className={`oj-app ${isDark ? "theme-dark" : "theme-light"}`} data-theme={theme}>
      {/* ==================== 1. TOP MASTER HEADER ==================== */}
      <header className="oj-header">
        <div className="oj-header-container">
          {/* Logo Brand */}
          <div className="oj-header-brand">
            <Link href="/" className="oj-brand-link">
              <img
                src={
                  isDark
                    ? "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Dark_Transparent.png"
                    : "/brand/Ojarket_02_Wordmark_Centered_UltraPremium_Transparent.png"
                }
                alt="Ojarket"
                className="oj-master-logo"
              />
            </Link>
          </div>

          {/* Search Bar with filter */}
          <div className="oj-search-wrap">
            <span className="oj-search-icon">⌕</span>
            <input
              type="text"
              className="oj-search-input"
              placeholder={
                isEn
                  ? "Search for exquisite pieces, artisans, ateliers..."
                  : "Rechercher une pièce d'exception, un artisan, un atelier..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="oj-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls & Universe Switcher */}
          <div className="oj-header-actions">
            {/* Universe Switcher (Acheteur vs Vendeur Pro) */}
            <div className="oj-universe-pill">
              <button
                className={`oj-pill-opt ${universe === "buyer" ? "active" : ""}`}
                onClick={() => setUniverse("buyer")}
              >
                {isEn ? "Buyer" : "Acheteur"}
              </button>
              <button
                className={`oj-pill-opt ${universe === "seller" ? "active" : ""}`}
                onClick={() => setUniverse("seller")}
              >
                {isEn ? "Seller Pro" : "Vendeur Pro"}
              </button>
            </div>

            {/* Language Switch */}
            <button
              className="oj-icon-btn"
              onClick={() => setLocale(isEn ? "fr" : "en")}
              title="Changer de langue"
            >
              {isEn ? "FR" : "EN"}
            </button>

            {/* Theme Switch */}
            <button
              className="oj-icon-btn"
              onClick={() => setMode(isDark ? "light" : "dark")}
              title="Changer de thème"
            >
              {isDark ? "☼" : "☾"}
            </button>

            {/* Cart Button */}
            {universe === "buyer" && (
              <button
                className="oj-cart-btn"
                onClick={() => setCartOpen(true)}
                aria-label="Panier"
              >
                <span className="oj-cart-icon">◇</span>
                <span className="oj-cart-label">{isEn ? "Cart" : "Panier"}</span>
                {cartCount > 0 && (
                  <span className="oj-cart-badge">{cartCount}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==================== 2. MAIN UNIVERSE VIEW ==================== */}
      {universe === "buyer" ? (
        /* ============================================================ */
        /*                   UNIVERS ACHETEUR (S01 / S07 / S03)          */
        /* ============================================================ */
        <main className="oj-main-buyer">
          {/* Hero Editorial Showcase */}
          <section className="oj-hero-section">
            <div className="oj-hero-card">
              <div className="oj-hero-content">
                <span className="oj-eyebrow">
                  {isEn
                    ? "CURATED SELECTION · HERITAGE & DISTINCTION"
                    : "SÉLECTION DU MOMENT · HÉRITAGE & DISTINCTION"}
                </span>
                <h1 className="oj-hero-title">
                  {isEn ? "Discover the Exceptional." : "Découvrez l'exceptionnel."}
                </h1>
                <p className="oj-hero-desc">
                  {isEn
                    ? "Unique, handcrafted pieces designed by the master artisans and distinguished ateliers across West Africa and beyond."
                    : "Des créations uniques façonnées avec rigueur par les plus grands maîtres artisans et ateliers d'Afrique de l'Ouest et d'ailleurs."}
                </p>
                <div className="oj-hero-ctas">
                  <button
                    className="oj-btn-primary"
                    onClick={() => {
                      const el = document.getElementById("catalog-grid");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {isEn ? "Explore Collection →" : "Explorer la sélection →"}
                  </button>
                  <button
                    className="oj-btn-secondary"
                    onClick={() => setNeedModalOpen(true)}
                  >
                    {isEn ? "Post a Custom Request" : "Exprimer un besoin sur-mesure"}
                  </button>
                </div>
              </div>

              <div className="oj-hero-visual">
                <div className="oj-hero-badge">
                  <span className="oj-hero-badge-tag">PIÈCE MAÎTRESSE</span>
                  <strong>Cabas Cuir d'Exception</strong>
                  <small>48 000 FCFA · Édition Atelier</small>
                </div>
                <img
                  src="/reference-assets/market-tote.png"
                  alt="Pièce maîtresse"
                  className="oj-hero-img"
                />
              </div>
            </div>
          </section>

          {/* Categories Selector */}
          <section className="oj-categories-bar">
            <div className="oj-section-inner">
              <div className="oj-cats-list">
                {[
                  { id: "all", label: isEn ? "All Creations" : "Toutes les créations", icon: "◇" },
                  { id: "leather", label: isEn ? "Fine Leather" : "Maroquinerie d'art", icon: "◈" },
                  { id: "watches", label: isEn ? "Watches & Jewelry" : "Horlogerie & Joaillerie", icon: "◎" },
                  { id: "fashion", label: isEn ? "Textiles & Silks" : "Textiles & Soie", icon: "▣" },
                  { id: "home", label: isEn ? "Home & Mineral" : "Maison & Minéral", icon: "⌂" },
                  { id: "digital", label: isEn ? "Master Digital Guides" : "Guides d'atelier", icon: "▤" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    className={`oj-cat-chip ${activeCategory === cat.id ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="oj-cat-icon">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Catalog Showcase (Recommandé pour vous - S01) */}
          <section className="oj-catalog-section" id="catalog-grid">
            <div className="oj-section-inner">
              <div className="oj-section-header">
                <div>
                  <h2 className="oj-section-title">
                    {isEn ? "Curated for You" : "Sélection d'excellence"}
                  </h2>
                  <p className="oj-section-sub">
                    {isEn
                      ? "Direct from verified workshops. Transparent merchant pricing."
                      : "Directement depuis les ateliers certifiés. Rémunération juste sans intermédiaire."}
                  </p>
                </div>
                <button
                  className="oj-link-btn"
                  onClick={() => setNeedModalOpen(true)}
                >
                  {isEn ? "Need something bespoke? →" : "Une pièce sur-mesure ? →"}
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="oj-empty-catalog">
                  <p>{isEn ? "No items matching your query." : "Aucune création ne correspond à votre recherche."}</p>
                  <button className="oj-btn-secondary" onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}>
                    {isEn ? "Reset filters" : "Réinitialiser les filtres"}
                  </button>
                </div>
              ) : (
                <div className="oj-product-grid">
                  {filteredProducts.map((p) => (
                    <article key={p.id} className="oj-prod-card">
                      <div
                        className="oj-prod-media"
                        onClick={() => setSelectedProduct(p)}
                      >
                        <img src={p.image} alt={p.title} className="oj-prod-img" />
                        <button
                          className={`oj-fav-btn ${favorites[p.id] ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(p.id);
                          }}
                          aria-label="Favori"
                        >
                          {favorites[p.id] ? "♥" : "♡"}
                        </button>
                        <span className="oj-stock-badge">
                          {p.stock > 0
                            ? isEn
                              ? `● In stock (${p.stock})`
                              : `● En stock (${p.stock})`
                            : isEn
                            ? "Made to order"
                            : "Sur commande"}
                        </span>
                      </div>

                      <div className="oj-prod-body">
                        <div className="oj-prod-meta">
                          <span className="oj-seller-name">{p.seller.name}</span>
                          <span className="oj-prod-rating">★ {p.rating.toFixed(1)}</span>
                        </div>

                        <h3
                          className="oj-prod-title"
                          onClick={() => setSelectedProduct(p)}
                        >
                          {p.title}
                        </h3>

                        <div className="oj-prod-footer">
                          <div className="oj-prod-price">
                            <strong>{formatPrice(p.price, p.currency)}</strong>
                            <small>{(p.price / 655.957).toFixed(0)} €</small>
                          </div>

                          <button
                            className="oj-add-btn"
                            onClick={() => addToCart(p)}
                            title={isEn ? "Add to cart" : "Ajouter au panier"}
                          >
                            ＋
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Verified Ateliers / Boutiques de confiance */}
          <section className="oj-ateliers-section">
            <div className="oj-section-inner">
              <div className="oj-section-header">
                <div>
                  <h2 className="oj-section-title">
                    {isEn ? "Ateliers of Trust" : "Boutiques d'artisanat certifiées"}
                  </h2>
                  <p className="oj-section-sub">
                    {isEn
                      ? "Master artisans possessing proven savoir-faire."
                      : "Des maîtres artisans sélectionnés pour leur maîtrise technique et leur régularité."}
                  </p>
                </div>
              </div>

              <div className="oj-ateliers-grid">
                {[
                  {
                    name: "Maison Laurent",
                    city: "Cotonou · Bénin",
                    domain: "Maroquinerie & Sellerie d'art",
                    rating: 4.9,
                    sales: "520 créations",
                    initials: "ML",
                  },
                  {
                    name: "Atelier Horlogerie",
                    city: "Abidjan · Côte d'Ivoire",
                    domain: "Horlogerie de collection & Métaux",
                    rating: 5.0,
                    sales: "186 montres",
                    initials: "AH",
                  },
                  {
                    name: "Studio Djoliba",
                    city: "Bamako · Mali",
                    domain: "Tissage Bogolan & Mobilier",
                    rating: 4.8,
                    sales: "340 commandes",
                    initials: "SD",
                  },
                ].map((shop, i) => (
                  <div key={i} className="oj-atelier-card">
                    <div className="oj-atelier-header">
                      <div className="oj-atelier-avatar">{shop.initials}</div>
                      <div>
                        <div className="oj-atelier-name-row">
                          <strong>{shop.name}</strong>
                          <span className="oj-verified-pill">✓ Vendeur Pro</span>
                        </div>
                        <span className="oj-atelier-city">{shop.city}</span>
                      </div>
                    </div>
                    <p className="oj-atelier-domain">{shop.domain}</p>
                    <div className="oj-atelier-footer">
                      <span>★ {shop.rating}</span>
                      <span>{shop.sales}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* D02 Banner: Exprimer un besoin */}
          <section className="oj-demand-section">
            <div className="oj-section-inner">
              <div className="oj-demand-card">
                <div className="oj-demand-content">
                  <span className="oj-eyebrow" style={{ color: "var(--gold)" }}>
                    {isEn ? "BESPOKE NETWORK · D02" : "RÉSEAU SUR-MESURE · D02"}
                  </span>
                  <h2 className="oj-demand-title">
                    {isEn
                      ? "Cannot find the exact piece you desire?"
                      : "Vous ne trouvez pas la création idéale ?"}
                  </h2>
                  <p className="oj-demand-text">
                    {isEn
                      ? "Publish your custom requirements. Certified artisans will respond directly with tailored offers and verified timelines."
                      : "Décrivez votre besoin sur-mesure. Les maîtres artisans certifiés vous soumettront directement leurs propositions personnalisées avec délais et devis clairs."}
                  </p>
                  <button
                    className="oj-btn-primary"
                    onClick={() => setNeedModalOpen(true)}
                  >
                    {isEn ? "Post Your Custom Request →" : "Publier ma demande de création →"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* ============================================================ */
        /*              UNIVERS VENDEUR PRO (S20 / S28 / S43 / S44)      */
        /* ============================================================ */
        <main className="oj-main-seller">
          <div className="oj-section-inner">
            {/* Seller Header */}
            <div className="oj-seller-header">
              <div>
                <span className="oj-eyebrow">
                  {isEn ? "MERCHANT COMMERCE OS · S20" : "COMMERCE OS MARCHAND · S20"}
                </span>
                <h1 className="oj-seller-name-title">
                  {isEn ? "Welcome back, Alexandre 👋" : "Bonjour Alexandre 👋"}
                </h1>
                <p className="oj-seller-sub">
                  {isEn
                    ? "Direct control of your atelier, cashbook and client orders."
                    : "Pilotez votre atelier, vos encaissements et vos commandes sans intermédiaire."}
                </p>
              </div>

              <div className="oj-seller-badge-top">
                <span className="oj-pro-badge">✓ {isEn ? "Pro Seller Verified" : "Vendeur Pro Vérifié"}</span>
                <span className="oj-seller-store-name">Atelier Cotonou #042</span>
              </div>
            </div>

            {/* Sub-navigation tabs */}
            <div className="oj-seller-tabs">
              <button
                className={`oj-seller-tab ${sellerTab === "overview" ? "active" : ""}`}
                onClick={() => setSellerTab("overview")}
              >
                {isEn ? "Dashboard & Today" : "Aujourd'hui & Tableau de bord"}
              </button>
              <button
                className={`oj-seller-tab ${sellerTab === "orders" ? "active" : ""}`}
                onClick={() => setSellerTab("orders")}
              >
                {isEn ? "Orders (14)" : "Commandes (14)"}
              </button>
              <button
                className={`oj-seller-tab ${sellerTab === "cashbook" ? "active" : ""}`}
                onClick={() => setSellerTab("cashbook")}
              >
                {isEn ? "Cashbook & Reconciliation (FinOps)" : "Caisse & Rapprochement (FinOps)"}
              </button>
            </div>

            {/* SUB-TAB 1: Overview */}
            {sellerTab === "overview" && (
              <div className="oj-seller-overview">
                {/* 4 KPI Cards with Sparklines */}
                <div className="oj-kpi-grid">
                  <div className="oj-kpi-card">
                    <div className="oj-kpi-head">
                      <span>{isEn ? "Gross Sales (30d)" : "Ventes (30 jours)"}</span>
                      <span className="oj-trend-up">↗ +38%</span>
                    </div>
                    <strong className="oj-kpi-val">1 280 000 FCFA</strong>
                    <div className="oj-sparkline-bar">
                      <div className="oj-spark-fill" style={{ width: "78%" }}></div>
                    </div>
                  </div>

                  <div className="oj-kpi-card">
                    <div className="oj-kpi-head">
                      <span>{isEn ? "Orders in Progress" : "Commandes en cours"}</span>
                      <span className="oj-trend-up">↗ +24%</span>
                    </div>
                    <strong className="oj-kpi-val">14 {isEn ? "orders" : "commandes"}</strong>
                    <div className="oj-sparkline-bar">
                      <div className="oj-spark-fill" style={{ width: "62%" }}></div>
                    </div>
                  </div>

                  <div className="oj-kpi-card">
                    <div className="oj-kpi-head">
                      <span>{isEn ? "Bespoke Requests (D02)" : "Demandes sur-mesure"}</span>
                      <span className="oj-trend-up">6 {isEn ? "pending" : "en attente"}</span>
                    </div>
                    <strong className="oj-kpi-val">6 {isEn ? "opportunities" : "opportunités"}</strong>
                    <div className="oj-sparkline-bar">
                      <div className="oj-spark-fill" style={{ width: "45%" }}></div>
                    </div>
                  </div>

                  <div className="oj-kpi-card oj-kpi-warn">
                    <div className="oj-kpi-head">
                      <span>{isEn ? "Low Stock Alert" : "Alerte réappro"}</span>
                      <span className="oj-trend-warn">! 2 articles</span>
                    </div>
                    <strong className="oj-kpi-val">2 {isEn ? "low SKU" : "articles critiques"}</strong>
                    <div className="oj-sparkline-bar">
                      <div className="oj-spark-fill warn" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Priority Actions ("À faire") */}
                <div className="oj-todo-box">
                  <h3 className="oj-todo-title">
                    {isEn ? "Actions Requiring Immediate Attention" : "Priorités opérationnelles du jour"}
                  </h3>
                  <div className="oj-todo-list">
                    <div className="oj-todo-item">
                      <span className="oj-todo-icon">▤</span>
                      <div className="oj-todo-copy">
                        <strong>4 commandes prêtes pour expédition</strong>
                        <p>Bénéficiaires confirmés via MTN MoMo et Virement bancaire direct.</p>
                      </div>
                      <button
                        className="oj-btn-small"
                        onClick={() => setSellerTab("orders")}
                      >
                        Traiter →
                      </button>
                    </div>

                    <div className="oj-todo-item">
                      <span className="oj-todo-icon">✦</span>
                      <div className="oj-todo-copy">
                        <strong>3 demandes acheteurs D02 sans proposition</strong>
                        <p>Demandes en cuir et textile en attente de devis à Cotonou.</p>
                      </div>
                      <button
                        className="oj-btn-small"
                        onClick={() => setSellerTab("overview")}
                      >
                        Consulter →
                      </button>
                    </div>

                    <div className="oj-todo-item">
                      <span className="oj-todo-icon">◈</span>
                      <div className="oj-todo-copy">
                        <strong>Clôture de caisse du jour à vérifier</strong>
                        <p>Rapprochement Mobile Money direct vs Espèces caisse physique.</p>
                      </div>
                      <button
                        className="oj-btn-small"
                        onClick={() => setSellerTab("cashbook")}
                      >
                        Rapprocher →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: Orders (S28) */}
            {sellerTab === "orders" && (
              <div className="oj-seller-orders">
                <div className="oj-orders-filter-row">
                  {["Toutes (14)", "En préparation (4)", "À expédier (3)", "Terminées (7)"].map((st, i) => (
                    <button
                      key={i}
                      className={`oj-filter-pill ${i === 0 ? "active" : ""}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="oj-orders-table">
                  {[
                    {
                      id: "#CMD-2847",
                      item: "Cabas Studio Cuir Cognac",
                      client: "Mme Dossou (Cotonou)",
                      amount: 48000,
                      status: "En préparation",
                      method: "MTN MoMo Direct",
                      date: "Aujourd'hui, 11:20",
                    },
                    {
                      id: "#CMD-2846",
                      item: "Chronographe Héritage Automatique",
                      client: "M. Traoré (Abidjan)",
                      amount: 285000,
                      status: "À expédier",
                      method: "Virement bancaire direct",
                      date: "Aujourd'hui, 09:14",
                    },
                    {
                      id: "#CMD-2845",
                      item: "Fauteuil Travertin & Lin Brut",
                      client: "Dr. Mensah (Lomé)",
                      amount: 145000,
                      status: "Livrée",
                      method: "Paiement à la remise",
                      date: "Hier, 16:45",
                    },
                  ].map((ord) => (
                    <div key={ord.id} className="oj-order-row">
                      <div className="oj-order-main">
                        <span className="oj-order-id">{ord.id}</span>
                        <strong>{ord.item}</strong>
                        <small>{ord.client} · {ord.date}</small>
                      </div>

                      <div className="oj-order-financial">
                        <strong>{formatPrice(ord.amount)}</strong>
                        <span className="oj-order-method">{ord.method}</span>
                      </div>

                      <div className="oj-order-actions">
                        <span className="oj-status-pill">{ord.status}</span>
                        <button className="oj-btn-small">Détail →</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: Cashbook & Reconciliation (S43 / S44 FinOps) */}
            {sellerTab === "cashbook" && (
              <div className="oj-seller-cashbook">
                {/* Master Financial Golden Rule Banner */}
                <div className="oj-finops-triad">
                  <div className="oj-triad-col">
                    <span className="oj-triad-label">VENDU (Chiffre brut)</span>
                    <strong className="oj-triad-val sold">1 280 000 FCFA</strong>
                    <small>Total des commandes enregistrées</small>
                  </div>
                  <div className="oj-triad-div">≠</div>
                  <div className="oj-triad-col">
                    <span className="oj-triad-label">ENCAISSÉ (Fonds réels reçus)</span>
                    <strong className="oj-triad-val received">850 000 FCFA</strong>
                    <small>Confirmé sur comptes MTN / Moov / Caisse</small>
                  </div>
                  <div className="oj-triad-div">≠</div>
                  <div className="oj-triad-col">
                    <span className="oj-triad-label">RESTANT (À encaisser)</span>
                    <strong className="oj-triad-val outstanding">430 000 FCFA</strong>
                    <small>Paiements à la livraison & soldes dus</small>
                  </div>
                </div>

                {/* Journal de Caisse */}
                <div className="oj-cash-journal">
                  <div className="oj-section-header">
                    <h3>Journal des écritures financières du jour</h3>
                    <button className="oj-btn-primary" onClick={() => alert("Simulation : Clôture de journée validée sans écart.")}>
                      Effectuer la clôture de journée →
                    </button>
                  </div>

                  <div className="oj-journal-rows">
                    {[
                      {
                        time: "14:10",
                        type: "Encaissement MTN MoMo",
                        desc: "Commande #CMD-2847 (Mme Dossou)",
                        amount: "+48 000 FCFA",
                        status: "Confirmé marchand",
                        tone: "pos",
                      },
                      {
                        time: "11:35",
                        type: "Encaissement Espèces",
                        desc: "Vente atelier directe (Point de vente)",
                        amount: "+25 000 FCFA",
                        status: "En caisse physique",
                        tone: "pos",
                      },
                      {
                        time: "09:50",
                        type: "Acompte Virement",
                        desc: "Commande #CMD-2846 (M. Traoré)",
                        amount: "+150 000 FCFA",
                        status: "Vérifié sur compte",
                        tone: "pos",
                      },
                    ].map((entry, idx) => (
                      <div key={idx} className="oj-journal-row">
                        <span className="oj-journal-time">{entry.time}</span>
                        <div className="oj-journal-desc">
                          <strong>{entry.type}</strong>
                          <p>{entry.desc}</p>
                        </div>
                        <div className="oj-journal-amount pos">{entry.amount}</div>
                        <span className="oj-journal-badge">{entry.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ==================== 3. MODAL S07: FICHE PRODUIT DÉTAILLÉE ==================== */}
      {selectedProduct && (
        <div className="oj-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div
            className="oj-modal-card oj-product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="oj-modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>

            <div className="oj-detail-grid">
              <div className="oj-detail-media">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  className="oj-detail-img"
                />
                <div className="oj-detail-badges">
                  <span className="oj-badge-stock">✓ En stock ({selectedProduct.stock})</span>
                  <span className="oj-badge-origin">Fait main · Cotonou</span>
                </div>
              </div>

              <div className="oj-detail-info">
                <div className="oj-detail-seller-box">
                  <div className="oj-atelier-avatar small">
                    {selectedProduct.seller.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong>{selectedProduct.seller.name}</strong>
                    <small>★ {selectedProduct.seller.rating} · {selectedProduct.seller.city}</small>
                  </div>
                  <span className="oj-verified-pill">✓ Vendeur Pro</span>
                </div>

                <h2 className="oj-detail-title">{selectedProduct.title}</h2>
                <p className="oj-detail-desc">{selectedProduct.description}</p>

                <div className="oj-detail-price-box">
                  <div className="oj-price-large">
                    {formatPrice(selectedProduct.price, selectedProduct.currency)}
                  </div>
                  <small className="oj-price-sub">
                    Soit approx. {(selectedProduct.price / 655.957).toFixed(0)} € · Paiement direct vendeur
                  </small>
                </div>

                {/* Variant selection */}
                <div className="oj-detail-variants">
                  <label className="oj-variant-label">Finitions disponibles :</label>
                  <div className="oj-variant-swatches">
                    {selectedProduct.variants.map((v, idx) => (
                      <span
                        key={idx}
                        className="oj-variant-chip active"
                        title={v.name}
                      >
                        <i
                          className="oj-color-dot"
                          style={{ backgroundColor: v.color }}
                        ></i>
                        {v.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="oj-detail-actions">
                  <button
                    className="oj-btn-primary"
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      setCartOpen(true);
                    }}
                  >
                    Ajouter au panier ({formatPrice(selectedProduct.price)})
                  </button>
                  <button
                    className="oj-btn-secondary"
                    onClick={() => {
                      setSelectedProduct(null);
                      setNeedModalOpen(true);
                    }}
                  >
                    Demander une personnalisation
                  </button>
                </div>

                {/* Reassurance Triad */}
                <div className="oj-reassurance-row">
                  <div>
                    <span>◈</span>
                    <small>Paiement direct Mobile Money (Wave, MTN, Moov) & Carte</small>
                  </div>
                  <div>
                    <span>◎</span>
                    <small>Retrait en atelier ou expédition sécurisée</small>
                  </div>
                  <div>
                    <span>✓</span>
                    <small>Garantie d'authenticité artisanale</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. MODAL S03: EXPRIMER UN BESOIN D02 ==================== */}
      {needModalOpen && (
        <div className="oj-modal-overlay" onClick={() => setNeedModalOpen(false)}>
          <div
            className="oj-modal-card oj-need-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="oj-modal-close"
              onClick={() => setNeedModalOpen(false)}
            >
              ✕
            </button>

            <span className="oj-eyebrow" style={{ color: "var(--gold)" }}>
              DEMANDE SUR-MESURE · D02 SMART MATCHING
            </span>
            <h2 className="oj-modal-title">Exprimer un besoin</h2>
            <p className="oj-modal-sub">
              Décrivez la pièce que vous recherchez. Notre réseau la transmettra aux artisans qualifiés pour vous soumettre leurs propositions.
            </p>

            {/* AI Assistant Banner */}
            <div className="oj-ai-helper-card">
              <div className="oj-ai-icon">✦</div>
              <div className="oj-ai-text">
                <strong>Assistance IA d'expression</strong>
                <p>Besoin d'aide pour formuler votre demande ? Cliquez pour structurer automatiquement vos critères.</p>
              </div>
              <button
                className="oj-btn-small"
                onClick={handleAiAssist}
                disabled={aiStructuring}
              >
                {aiStructuring ? "Structuration..." : "✦ Structurer avec l'IA"}
              </button>
            </div>

            {needSubmitted ? (
              <div className="oj-need-success">
                <span className="oj-success-icon">✓</span>
                <h3>Demande transmise aux maîtres artisans !</h3>
                <p>
                  Les ateliers de la catégorie recevront votre cahier des charges et vous répondront avec leurs devis et délais réels.
                </p>
                <button
                  className="oj-btn-primary"
                  onClick={() => {
                    setNeedSubmitted(false);
                    setNeedModalOpen(false);
                  }}
                >
                  Retour aux créations
                </button>
              </div>
            ) : (
              <form
                className="oj-need-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (needDesc.trim()) setNeedSubmitted(true);
                }}
              >
                <div className="oj-form-group">
                  <label>Catégorie de la création *</label>
                  <select
                    className="oj-input"
                    value={needCategory}
                    onChange={(e) => setNeedCategory(e.target.value)}
                  >
                    <option value="leather">Maroquinerie & Bagagerie d'art</option>
                    <option value="watches">Horlogerie & Joaillerie de collection</option>
                    <option value="fashion">Textiles nobles, Soie & Broderie</option>
                    <option value="home">Mobilier, Marbre & Sculpture</option>
                  </select>
                </div>

                <div className="oj-form-group">
                  <label>Description détaillée de votre besoin *</label>
                  <textarea
                    className="oj-textarea"
                    rows={4}
                    placeholder="Exemple : Je recherche un sac de voyage week-end en cuir pleine fleur, doublure lin, avec finitions laiton vieilli..."
                    value={needDesc}
                    onChange={(e) => setNeedDesc(e.target.value)}
                    required
                  ></textarea>
                  <small className="oj-char-count">{needDesc.length}/500 caractères</small>
                </div>

                <div className="oj-form-row">
                  <div className="oj-form-group">
                    <label>Budget indicatif</label>
                    <input
                      type="text"
                      className="oj-input"
                      placeholder="Ex: 50 000 – 75 000 FCFA"
                      value={needBudget}
                      onChange={(e) => setNeedBudget(e.target.value)}
                    />
                  </div>

                  <div className="oj-form-group">
                    <label>Lieu de livraison / retrait</label>
                    <input
                      type="text"
                      className="oj-input"
                      placeholder="Ex: Cotonou, Abidjan, Paris..."
                      value={needPlace}
                      onChange={(e) => setNeedPlace(e.target.value)}
                    />
                  </div>
                </div>

                <div className="oj-form-submit-row">
                  <button type="submit" className="oj-btn-primary">
                    Publier ma demande de création →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== 5. DRAWER S06: PANIER & CHECKOUT ==================== */}
      {cartOpen && (
        <div className="oj-modal-overlay" onClick={() => setCartOpen(false)}>
          <div
            className="oj-cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="oj-drawer-header">
              <h2>Votre Panier ({cartCount})</h2>
              <button
                className="oj-modal-close"
                onClick={() => setCartOpen(false)}
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="oj-drawer-empty">
                <span className="oj-empty-icon">◇</span>
                <p>Votre panier est vide pour le moment.</p>
                <button
                  className="oj-btn-primary"
                  onClick={() => setCartOpen(false)}
                >
                  Découvrir les créations
                </button>
              </div>
            ) : (
              <div className="oj-drawer-body">
                <div className="oj-drawer-items">
                  {cart.map((item) => (
                    <div key={item.product.id} className="oj-drawer-item">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="oj-drawer-thumb"
                      />
                      <div className="oj-drawer-info">
                        <strong>{item.product.title}</strong>
                        <small>{item.product.seller.name}</small>
                        <div className="oj-drawer-price">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </div>
                      </div>
                      <button
                        className="oj-drawer-del"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="oj-drawer-footer">
                  <div className="oj-drawer-total-row">
                    <span>Total à régler directement à l'atelier :</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>
                  <small className="oj-drawer-note">
                    Règlement direct Mobile Money (MTN, Moov, Wave) ou Carte bancaire au moment de la confirmation du vendeur.
                  </small>
                  <button
                    className="oj-btn-primary"
                    onClick={() => {
                      alert("Commande enregistrée avec succès auprès des ateliers vendeurs.");
                      setCart([]);
                      setCartOpen(false);
                    }}
                  >
                    Valider la commande ({formatPrice(cartTotal)}) →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 6. MASTER FOOTER ==================== */}
      <footer className="oj-footer">
        <div className="oj-section-inner">
          <div className="oj-footer-top">
            <div className="oj-footer-brand">
              <img
                src={
                  isDark
                    ? "/brand/Ojarket_03_Compact_Wordmark_Centered_Dark_Transparent.png"
                    : "/brand/Ojarket_03_Compact_Wordmark_Centered_Transparent.png"
                }
                alt="Ojarket"
                className="oj-footer-logo"
              />
              <p className="oj-footer-tagline">
                Le marché d'exception reliant les acheteurs passionnés et les maîtres artisans vérifiés.
              </p>
            </div>

            <div className="oj-footer-cols">
              <div className="oj-f-col">
                <h4>Acheter</h4>
                <ul>
                  <li><a href="#catalog-grid">Maroquinerie d'art</a></li>
                  <li><a href="#catalog-grid">Horlogerie & Joaillerie</a></li>
                  <li><a href="#catalog-grid">Mobilier & Minéral</a></li>
                  <li><button className="oj-f-link" onClick={() => setNeedModalOpen(true)}>Exprimer un besoin</button></li>
                </ul>
              </div>

              <div className="oj-f-col">
                <h4>Vendre</h4>
                <ul>
                  <li><button className="oj-f-link" onClick={() => setUniverse("seller")}>Espace Vendeur Pro</button></li>
                  <li><button className="oj-f-link" onClick={() => setUniverse("seller")}>Livre de caisse autonome</button></li>
                  <li><button className="oj-f-link" onClick={() => setUniverse("seller")}>Paiements directs sans intermédiaire</button></li>
                </ul>
              </div>

              <div className="oj-f-col">
                <h4>Engagements</h4>
                <ul>
                  <li><span>Paiement direct sécurisé</span></li>
                  <li><span>Savoir-faire vérifié</span></li>
                  <li><span>Protection des transactions</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="oj-footer-bottom">
            <span>© {new Date().getFullYear()} Ojarket Inc. Tous droits réservés. Modèle Merchant-Owned autonome.</span>
            <div className="oj-footer-links">
              <span>Conditions d'utilisation</span>
              <span>Confidentialité</span>
              <span>Authenticité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
