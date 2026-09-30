"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DesignProvider, useDesign } from "../design-system/provider";
import "../design-system/styles.css";
import "./landing.css";

// Types
interface Product {
  id: string;
  title: string;
  subtitle: string;
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
    initials: string;
  };
  image: string;
  description: string;
  stock: number;
  variants: { name: string; color: string }[];
}

const CATALOG: Product[] = [
  {
    id: "prod-1",
    title: "Cabas Studio en Cuir Tanné",
    subtitle: "Cuir pleine fleur · Cognac naturel",
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
      initials: "ML",
    },
    image: "/products/leather-tote.jpg",
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
    title: "Chronographe Héritage",
    subtitle: "Automatique · Or & Acier",
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
      initials: "AH",
    },
    image: "/products/watch-chrono.jpg",
    description:
      "Pièce de haute précision avec mouvement mécanique automatique, cadran brossé soleil et lunette ciselée avec inserts en or champagne 18 carats.",
    stock: 2,
    variants: [
      { name: "Or Champagne & Noir", color: "#D4B483" },
      { name: "Acier Brossé & Bleu", color: "#3B5266" },
    ],
  },
  {
    id: "prod-3",
    title: "Fauteuil Club Travertin",
    subtitle: "Pierre & Lin brut teint",
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
      initials: "SD",
    },
    image: "/products/armchair.jpg",
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
    title: "Tenture Murale Bogolan",
    subtitle: "Soie sauvage · Pigments d'argile",
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
      initials: "SD",
    },
    image: "/products/leather-tote.jpg",
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
    title: "Bague Sculpturale Or 18K",
    subtitle: "Or jaune · Tourmaline verte",
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
      initials: "OA",
    },
    image: "/products/watch-chrono.jpg",
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
    title: "Traité de Modélisme",
    subtitle: "PDF interactif · Patrons 1:1",
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
      initials: "SE",
    },
    image: "/products/armchair.jpg",
    description:
      "Guide complet haute résolution détaillant le point sellier, le parage et l'assemblage des cuirs nobles.",
    stock: 99,
    variants: [{ name: "Édition Numérique", color: "#075D49" }],
  },
];

function formatPrice(amount: number, currency: string = "XOF"): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${currency}`;
}

/* ============================================================
   SVG Icon Components (matching reference design icons)
   ============================================================ */
function IconHome() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconHeart({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="1.75">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconWatch() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7" />
      <polyline points="12 9 12 12 13.5 13.5" />
      <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83" />
    </svg>
  );
}
function IconBag() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function IconDiamond() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9z" />
      <path d="M2 9h20" />
      <path d="M10 3l-4 6 6 13 6-13-4-6" />
    </svg>
  );
}
function IconPalette() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c0 5.523 4.477 10 10 10a3 3 0 0 0 3-3v-1a2 2 0 0 1 2-2h1a3 3 0 0 0 3-3c0-4.97-4.03-9-9-9a10 10 0 0 0-10 9z" />
      <circle cx="8.5" cy="11.5" r="1.5" />
      <circle cx="12.5" cy="7.5" r="1.5" />
      <circle cx="16.5" cy="11.5" r="1.5" />
    </svg>
  );
}
function IconLamp() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6" />
      <path d="M12 3a6 6 0 0 0-6 6c0 3 2 5 3 7h6c1-2 3-4 3-7a6 6 0 0 0-6-6z" />
      <path d="M9 16h6" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */

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

  const [universe, setUniverse] = useState<"buyer" | "seller">("buyer");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [needModalOpen, setNeedModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [sellerTab, setSellerTab] = useState<"overview" | "orders" | "cashbook">("overview");
  const [needDesc, setNeedDesc] = useState("");
  const [needBudget, setNeedBudget] = useState("");
  const [needPlace, setNeedPlace] = useState("");
  const [needCategory, setNeedCategory] = useState("leather");
  const [needSubmitted, setNeedSubmitted] = useState(false);
  const [aiStructuring, setAiStructuring] = useState(false);

  const addToCart = (prod: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product: prod, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  const categories = [
    { id: "all", label: isEn ? "All" : "Tout", icon: <IconSearch /> },
    { id: "leather", label: isEn ? "Bags" : "Sacs", icon: <IconBag /> },
    { id: "watches", label: isEn ? "Watches" : "Montres", icon: <IconWatch /> },
    { id: "fashion", label: isEn ? "Art" : "Art", icon: <IconPalette /> },
    { id: "home", label: isEn ? "Home" : "Maison", icon: <IconLamp /> },
    { id: "digital", label: isEn ? "Digital" : "Numérique", icon: <IconBook /> },
  ];

  return (
    <div className={`oj-app ${isDark ? "theme-dark" : "theme-light"}`} data-theme={theme}>
      {/* ==================== HEADER ==================== */}
      <header className="oj-header">
        <div className="oj-header-container">
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

          <div className="oj-search-wrap">
            <span className="oj-search-icon">
              <IconSearch />
            </span>
            <input
              type="text"
              className="oj-search-input"
              placeholder={
                isEn
                  ? "Search for products, artisans..."
                  : "Rechercher un produit, une marque..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="oj-header-actions">
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

            <button className="oj-icon-btn" onClick={() => setLocale(isEn ? "fr" : "en")}>
              {isEn ? "FR" : "EN"}
            </button>

            <button className="oj-icon-btn" onClick={() => setMode(isDark ? "light" : "dark")}>
              {isDark ? "☼" : "☾"}
            </button>

            {universe === "buyer" && (
              <button className="oj-icon-btn" onClick={() => setCartOpen(true)} aria-label="Panier" style={{ position: "relative" }}>
                <IconCart />
                {cartCount > 0 && <span className="oj-cart-badge">{cartCount}</span>}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==================== BUYER UNIVERSE ==================== */}
      {universe === "buyer" ? (
        <main className="oj-main-buyer">
          {/* Editorial Lead & Mobile Search */}
          <section className="oj-editorial-lead-section">
            <div className="oj-section" style={{ paddingBottom: 0 }}>
              <h1 className="oj-editorial-lead-title">
                {isEn ? "Discover the Exceptional" : "Découvrez l'exceptionnel"}
              </h1>
              <p className="oj-editorial-lead-sub">
                {isEn
                  ? "Unique handcrafted pieces for unique individuals."
                  : "Des produits uniques pour des personnes uniques."}
              </p>
              <div className="oj-mobile-search-wrap">
                <span className="oj-search-icon">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  className="oj-search-input"
                  placeholder={
                    isEn
                      ? "Search for products, brands..."
                      : "Rechercher un produit, une marque..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Category Thumbnails */}
          <section className="oj-categories-bar">
            <div className="oj-section">
              <div className="oj-cats-list">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`oj-cat-item ${activeCategory === cat.id ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <span className="oj-cat-icon-circle">{cat.icon}</span>
                    <span className="oj-cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Hero Collection Carousel */}
          <section className="oj-hero-section">
            <div className="oj-section">
              <div className="oj-hero-card">
                <div className="oj-hero-content">
                  <span className="oj-hero-eyebrow">
                    {isEn ? "CURATED COLLECTION" : "COLLECTION SÉLECTIONNÉE"}
                  </span>
                  <h1 className="oj-hero-title">
                    {isEn ? "Timeless Icons" : "Icônes Intemporelles"}
                  </h1>
                  <p className="oj-hero-desc">
                    {isEn
                      ? "Exceptional pieces from yesterday, today, and tomorrow."
                      : "Des pièces d'exception, hier, aujourd'hui et demain."}
                  </p>
                  <button
                    className="oj-hero-cta"
                    onClick={() => {
                      const el = document.getElementById("catalog-grid");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {isEn ? "Discover →" : "Découvrir →"}
                  </button>
                </div>
                <div className="oj-hero-visual">
                  <img src="/products/watch-chrono.jpg" alt="Collection" />
                </div>
                <div className="oj-hero-controls">
                  <div className="oj-hero-dots">
                    <span className="oj-hero-dot active" />
                    <span className="oj-hero-dot" />
                    <span className="oj-hero-dot" />
                    <span className="oj-hero-dot" />
                  </div>
                  <span className="oj-hero-page-count">1 / 4</span>
                </div>
              </div>
            </div>
          </section>

          {/* Recommandé pour vous */}
          <section className="oj-section" id="catalog-grid">
            <div className="oj-section-header">
              <h2 className="oj-section-title">
                {isEn ? "Recommended for you" : "Recommandé pour vous"}
              </h2>
              <button className="oj-link-btn">
                {isEn ? "See all →" : "Voir tout →"}
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: "var(--oj-color-muted)" }}>
                <p>{isEn ? "No items matching your query." : "Aucune création ne correspond."}</p>
                <button className="oj-btn-secondary" onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}>
                  {isEn ? "Reset filters" : "Réinitialiser"}
                </button>
              </div>
            ) : (
              <div className="oj-product-grid">
                {filteredProducts.map((p) => (
                  <article key={p.id} className="oj-prod-card">
                    <div className="oj-prod-media" onClick={() => setSelectedProduct(p)}>
                      <img src={p.image} alt={p.title} />
                      <button
                        className="oj-fav-btn"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                        aria-label="Favori"
                      >
                        <IconHeart filled={!!favorites[p.id]} />
                      </button>
                    </div>
                    <div className="oj-prod-body">
                      <div className="oj-prod-seller">{p.seller.name}</div>
                      <h3 className="oj-prod-title" onClick={() => setSelectedProduct(p)}>
                        {p.title}
                      </h3>
                      <p className="oj-prod-subtitle">{p.subtitle}</p>
                      <div className="oj-prod-footer">
                        <div>
                          <div className="oj-prod-price">
                            {formatPrice(p.price, p.currency)}
                          </div>
                          <div className="oj-prod-rating">
                            <span className="oj-star-icon"><IconStar /></span>
                            <span>{p.rating.toFixed(1)} ({p.reviewsCount})</span>
                          </div>
                        </div>
                        <button
                          className="oj-prod-cart-btn"
                          onClick={() => addToCart(p)}
                          title={isEn ? "Add to cart" : "Ajouter au panier"}
                        >
                          <IconCart />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Boutiques de confiance */}
          <section className="oj-section">
            <div className="oj-section-header">
              <h2 className="oj-section-title">
                {isEn ? "Trusted Shops" : "Boutiques de confiance"}
              </h2>
              <button className="oj-link-btn">
                {isEn ? "See all →" : "Voir tout →"}
              </button>
            </div>
            <div className="oj-shops-scroll">
              {[
                {
                  name: "Maison Laurent",
                  initials: "ML",
                  rating: 4.8,
                  reviews: 320,
                  verified: true,
                  products: ["/products/leather-tote.jpg", "/products/armchair.jpg"],
                },
                {
                  name: "Atelier Horlogerie",
                  initials: "AH",
                  rating: 4.9,
                  reviews: 186,
                  verified: true,
                  products: ["/products/watch-chrono.jpg", "/products/leather-tote.jpg"],
                },
                {
                  name: "Studio Djoliba",
                  initials: "SD",
                  rating: 4.8,
                  reviews: 340,
                  verified: true,
                  products: ["/products/armchair.jpg", "/products/watch-chrono.jpg"],
                },
              ].map((shop, i) => (
                <div key={i} className="oj-shop-card">
                  <div className="oj-shop-header">
                    <div className="oj-shop-avatar">{shop.initials}</div>
                    <div className="oj-shop-info">
                      <div className="oj-shop-name">{shop.name}</div>
                      {shop.verified && (
                        <span className="oj-verified-pill">✓ Vendeur Pro</span>
                      )}
                      <div className="oj-shop-meta">
                        <span className="oj-star-icon"><IconStar /></span>
                        <span>{shop.rating} ({shop.reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="oj-shop-thumbnails">
                    {shop.products.slice(0, 2).map((img, j) => (
                      <div key={j} className="oj-shop-thumb">
                        <img src={img} alt="" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* D02 Banner */}
          <section className="oj-section">
            <div className="oj-demand-banner">
              <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
                {isEn ? "BESPOKE NETWORK" : "RÉSEAU SUR-MESURE"}
              </span>
              <h2 className="oj-demand-title">
                {isEn ? "Cannot find the ideal creation?" : "Vous ne trouvez pas la création idéale ?"}
              </h2>
              <p className="oj-demand-subtitle">
                {isEn
                  ? "Describe your needs. Certified artisans will submit tailored proposals with clear timelines."
                  : "Décrivez votre besoin sur-mesure. Les maîtres artisans certifiés vous soumettront directement leurs propositions personnalisées avec délais et devis clairs."}
              </p>
              <button className="oj-btn-primary" onClick={() => setNeedModalOpen(true)}>
                {isEn ? "Post your request →" : "Publier ma demande de création →"}
              </button>
            </div>
          </section>
        </main>
      ) : (
        /* ==================== SELLER UNIVERSE ==================== */
        <main className="oj-main-seller">
          <div className="oj-section">
            <div className="oj-seller-header">
              <div>
                <h1 className="oj-seller-greeting">
                  {isEn ? "Welcome back, Alexandre 👋" : "Bonjour Alexandre 👋"}
                </h1>
                <p style={{ color: "var(--oj-color-muted)", margin: 0 }}>
                  {isEn
                    ? "Manage your workshop, payments and orders."
                    : "Gérez votre boutique et développez vos ventes."}
                </p>
              </div>
              <span className="oj-verified-pill" style={{ fontSize: "12px", padding: "4px 12px" }}>
                Vendeur Pro
              </span>
            </div>

            <div className="oj-seller-tabs">
              {(["overview", "orders", "cashbook"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`oj-seller-tab ${sellerTab === tab ? "active" : ""}`}
                  onClick={() => setSellerTab(tab)}
                >
                  {tab === "overview"
                    ? isEn ? "Dashboard" : "Tableau de bord"
                    : tab === "orders"
                    ? isEn ? "Orders (14)" : "Commandes (14)"
                    : isEn ? "Cashbook" : "Caisse & FinOps"}
                </button>
              ))}
            </div>

            {sellerTab === "overview" && (
              <div>
                <div className="oj-kpi-grid">
                  {[
                    { label: isEn ? "Sales" : "Ventes", value: "1 280 000 FCFA", trend: "+38%", positive: true },
                    { label: isEn ? "Orders" : "Commandes", value: "142", trend: "+24%", positive: true },
                    { label: isEn ? "Requests" : "Demandes clients", value: "16", trend: "+60%", positive: true },
                    { label: isEn ? "Low Stock" : "Stock faible", value: "3", trend: isEn ? "Items" : "Articles", positive: false },
                  ].map((kpi, i) => (
                    <div key={i} className="oj-kpi-card">
                      <div className="oj-kpi-header">
                        <span>{kpi.label}</span>
                        <span className={`oj-kpi-trend ${kpi.positive ? "positive" : "negative"}`}>
                          {kpi.positive ? "↗" : "⚠"} {kpi.trend}
                        </span>
                      </div>
                      <strong className="oj-kpi-value">{kpi.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="oj-todo-box">
                  <h3 style={{ margin: "0 0 16px", fontFamily: "var(--oj-font-editorial)" }}>
                    {isEn ? "Needs Action" : "Actions prioritaires"}
                  </h3>
                  {[
                    { label: isEn ? "Orders to prepare" : "Commandes à préparer", count: "04", action: () => setSellerTab("orders") },
                    { label: isEn ? "Requests to review" : "Demandes à traiter", count: "06", action: () => setSellerTab("overview") },
                    { label: isEn ? "Items to restock" : "Réappro à planifier", count: "02", action: () => setSellerTab("overview") },
                  ].map((todo, i) => (
                    <div key={i} className="oj-todo-item">
                      <div>
                        <strong>{todo.label}</strong>
                        <small style={{ display: "block", color: "var(--oj-color-muted)", fontSize: "13px" }}>
                          {todo.count} {isEn ? "items" : "éléments"}
                        </small>
                      </div>
                      <button className="oj-btn-ghost" onClick={todo.action}>→</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sellerTab === "orders" && (
              <div>
                <table className="oj-order-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "12px 0", borderBottom: "1px solid var(--oj-color-border)", fontSize: "12px", color: "var(--oj-color-muted)" }}>
                        {isEn ? "Order" : "Commande"}
                      </th>
                      <th style={{ textAlign: "left", padding: "12px 0", borderBottom: "1px solid var(--oj-color-border)", fontSize: "12px", color: "var(--oj-color-muted)" }}>
                        {isEn ? "Amount" : "Montant"}
                      </th>
                      <th style={{ textAlign: "left", padding: "12px 0", borderBottom: "1px solid var(--oj-color-border)", fontSize: "12px", color: "var(--oj-color-muted)" }}>
                        {isEn ? "Status" : "Statut"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "#CMD-2847", item: "Cabas Studio", amount: 48000, status: "En préparation", statusClass: "pending" },
                      { id: "#CMD-2846", item: "Chronographe Héritage", amount: 285000, status: "À expédier", statusClass: "pending" },
                      { id: "#CMD-2845", item: "Fauteuil Travertin", amount: 145000, status: "Livrée", statusClass: "success" },
                    ].map((ord) => (
                      <tr key={ord.id}>
                        <td style={{ padding: "16px 0", borderBottom: "1px solid var(--oj-color-border)" }}>
                          <div style={{ fontWeight: 600 }}>{ord.item}</div>
                          <small style={{ color: "var(--oj-color-muted)" }}>{ord.id}</small>
                        </td>
                        <td style={{ padding: "16px 0", borderBottom: "1px solid var(--oj-color-border)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                          {formatPrice(ord.amount)}
                        </td>
                        <td style={{ padding: "16px 0", borderBottom: "1px solid var(--oj-color-border)" }}>
                          <span className={`oj-status-pill ${ord.statusClass}`}>{ord.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {sellerTab === "cashbook" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                  {[
                    { label: isEn ? "SOLD" : "VENDU", value: "1 280 000 FCFA", desc: isEn ? "Total orders" : "Commandes enregistrées" },
                    { label: isEn ? "COLLECTED" : "ENCAISSÉ", value: "850 000 FCFA", desc: isEn ? "Funds received" : "Fonds réels reçus" },
                    { label: isEn ? "OUTSTANDING" : "RESTANT", value: "430 000 FCFA", desc: isEn ? "To collect" : "À encaisser" },
                  ].map((col, i) => (
                    <div key={i} className="oj-kpi-card">
                      <div className="oj-kpi-header"><span>{col.label}</span></div>
                      <strong className="oj-kpi-value">{col.value}</strong>
                      <small style={{ color: "var(--oj-color-muted)", fontSize: "12px" }}>{col.desc}</small>
                    </div>
                  ))}
                </div>
                <button className="oj-btn-primary" onClick={() => alert("Clôture de journée validée.")}>
                  {isEn ? "Close Day →" : "Effectuer la clôture de journée →"}
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ==================== PRODUCT DETAIL MODAL ==================== */}
      {selectedProduct && (
        <div className="oj-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="oj-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", padding: "32px" }}>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--oj-color-text)" }}
            >
              ✕
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  style={{ width: "100%", borderRadius: "var(--oj-radius-card)", objectFit: "cover", aspectRatio: "4/5" }}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <span className="oj-status-pill success">
                    {isEn ? `In stock (${selectedProduct.stock})` : `En stock (${selectedProduct.stock})`}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div className="oj-shop-avatar" style={{ width: "36px", height: "36px", fontSize: "12px" }}>
                    {selectedProduct.seller.initials}
                  </div>
                  <div>
                    <strong style={{ fontSize: "14px" }}>{selectedProduct.seller.name}</strong>
                    <span className="oj-verified-pill" style={{ marginLeft: "8px" }}>Vendeur Pro</span>
                  </div>
                </div>
                <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", margin: "0 0 8px" }}>
                  {selectedProduct.title}
                </h2>
                <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px" }}>
                  {selectedProduct.description}
                </p>
                <div style={{ fontSize: "28px", fontWeight: 700, fontVariantNumeric: "tabular-nums", marginBottom: "24px" }}>
                  {formatPrice(selectedProduct.price, selectedProduct.currency)}
                </div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                  {selectedProduct.variants.map((v, idx) => (
                    <span key={idx} style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", border: "1px solid var(--oj-color-border)",
                      borderRadius: "var(--oj-radius-pill)", fontSize: "13px"
                    }}>
                      <i style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: v.color, display: "inline-block" }} />
                      {v.name}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <button className="oj-btn-primary" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setCartOpen(true); }}>
                    {isEn ? "Add to cart" : "Ajouter au panier"}
                  </button>
                  <button className="oj-btn-secondary" onClick={() => { setSelectedProduct(null); setNeedModalOpen(true); }}>
                    {isEn ? "Request customization" : "Demander une personnalisation"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== NEED MODAL ==================== */}
      {needModalOpen && (
        <div className="oj-modal-overlay" onClick={() => setNeedModalOpen(false)}>
          <div className="oj-modal" onClick={(e) => e.stopPropagation()} style={{ padding: "32px" }}>
            <button
              onClick={() => setNeedModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--oj-color-text)" }}
            >
              ✕
            </button>
            <span className="oj-eyebrow" style={{ color: "var(--oj-color-accent)" }}>
              {isEn ? "BESPOKE REQUEST" : "DEMANDE SUR-MESURE"}
            </span>
            <h2 style={{ fontFamily: "var(--oj-font-editorial)", fontSize: "24px", margin: "8px 0 8px" }}>
              {isEn ? "Express a need" : "Exprimer un besoin"}
            </h2>
            <p style={{ color: "var(--oj-color-muted)", fontSize: "14px", margin: "0 0 24px" }}>
              {isEn
                ? "Describe what you are looking for. Our network will transmit it to qualified artisans."
                : "Décrivez la pièce que vous recherchez. Notre réseau la transmettra aux artisans qualifiés."}
            </p>

            <div style={{ background: "var(--oj-color-subtle)", borderRadius: "var(--oj-radius-card)", padding: "16px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "20px" }}>✦</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "14px" }}>{isEn ? "AI Assist" : "Aide IA"}</strong>
                <p style={{ fontSize: "13px", color: "var(--oj-color-muted)", margin: "2px 0 0" }}>
                  {isEn ? "Let AI structure your request." : "Décrivez votre besoin simplement, notre IA le structure pour vous."}
                </p>
              </div>
              <button className="oj-btn-secondary" style={{ height: "36px", fontSize: "13px", padding: "0 16px" }} onClick={handleAiAssist} disabled={aiStructuring}>
                {aiStructuring ? "..." : "→"}
              </button>
            </div>

            {needSubmitted ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", color: "var(--oj-color-action)" }}>✓</div>
                <h3>{isEn ? "Request submitted!" : "Demande transmise !"}</h3>
                <p style={{ color: "var(--oj-color-muted)" }}>
                  {isEn ? "Artisans will respond with proposals." : "Les ateliers vous répondront avec leurs devis et délais."}
                </p>
                <button className="oj-btn-primary" onClick={() => { setNeedSubmitted(false); setNeedModalOpen(false); }}>
                  {isEn ? "Back to collection" : "Retour aux créations"}
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (needDesc.trim()) setNeedSubmitted(true); }}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                    {isEn ? "Category *" : "Catégorie *"}
                  </label>
                  <select
                    value={needCategory}
                    onChange={(e) => setNeedCategory(e.target.value)}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: "var(--oj-radius-field)",
                      border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)", fontSize: "14px"
                    }}
                  >
                    <option value="leather">{isEn ? "Leather & Bags" : "Maroquinerie"}</option>
                    <option value="watches">{isEn ? "Watches & Jewelry" : "Horlogerie & Joaillerie"}</option>
                    <option value="fashion">{isEn ? "Textiles" : "Textiles"}</option>
                    <option value="home">{isEn ? "Home & Furniture" : "Mobilier & Maison"}</option>
                  </select>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                    {isEn ? "Description *" : "Description de votre besoin *"}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={isEn ? "Describe what you're looking for..." : "Ex. : Je recherche une Rolex Submariner en bon état, avec boîte et papiers si possible..."}
                    value={needDesc}
                    onChange={(e) => setNeedDesc(e.target.value)}
                    required
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: "var(--oj-radius-field)",
                      border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                      color: "var(--oj-color-text)", fontSize: "14px", resize: "vertical",
                      fontFamily: "var(--oj-font-ui)"
                    }}
                  />
                  <small style={{ color: "var(--oj-color-muted)", fontSize: "12px" }}>{needDesc.length}/500</small>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                      {isEn ? "Budget" : "Budget indicatif"}
                    </label>
                    <input
                      type="text"
                      placeholder="8 000 – 10 000 €"
                      value={needBudget}
                      onChange={(e) => setNeedBudget(e.target.value)}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: "var(--oj-radius-field)",
                        border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                        color: "var(--oj-color-text)", fontSize: "14px"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                      {isEn ? "Delivery location" : "Lieu de livraison"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "France" : "Cotonou, Bénin"}
                      value={needPlace}
                      onChange={(e) => setNeedPlace(e.target.value)}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: "var(--oj-radius-field)",
                        border: "1px solid var(--oj-color-border)", backgroundColor: "var(--oj-color-subtle)",
                        color: "var(--oj-color-text)", fontSize: "14px"
                      }}
                    />
                  </div>
                </div>
                <button type="submit" className="oj-btn-primary" style={{ width: "100%" }}>
                  {isEn ? "Submit my request" : "Publier ma demande"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== CART DRAWER ==================== */}
      {cartOpen && (
        <div className="oj-modal-overlay" onClick={() => setCartOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0, width: "min(420px, 90vw)",
              backgroundColor: "var(--oj-color-surface)", borderLeft: "1px solid var(--oj-color-border)",
              display: "flex", flexDirection: "column", zIndex: 1001
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--oj-color-border)" }}>
              <h2 style={{ margin: 0, fontFamily: "var(--oj-font-editorial)", fontSize: "20px" }}>
                {isEn ? `Your Cart (${cartCount})` : `Votre Panier (${cartCount})`}
              </h2>
              <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--oj-color-text)" }}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", color: "var(--oj-color-muted)" }}>
                <p>{isEn ? "Your cart is empty." : "Votre panier est vide."}</p>
                <button className="oj-btn-primary" onClick={() => setCartOpen(false)}>
                  {isEn ? "Discover creations" : "Découvrir les créations"}
                </button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                  {cart.map((item) => (
                    <div key={item.product.id} style={{ display: "flex", gap: "16px", paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid var(--oj-color-border)" }}>
                      <img src={item.product.image} alt={item.product.title} style={{ width: "64px", height: "64px", borderRadius: "var(--oj-radius-field)", objectFit: "cover" }} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: "14px" }}>{item.product.title}</strong>
                        <small style={{ display: "block", color: "var(--oj-color-muted)", fontSize: "12px" }}>{item.product.seller.name}</small>
                        <div style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", marginTop: "4px" }}>
                          {formatPrice(item.product.price)} × {item.quantity}
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} style={{ background: "none", border: "none", color: "var(--oj-color-muted)", cursor: "pointer", fontSize: "16px" }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "20px 24px", borderTop: "1px solid var(--oj-color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>{isEn ? "Total" : "Total"}</span>
                    <strong style={{ fontSize: "18px", fontVariantNumeric: "tabular-nums" }}>{formatPrice(cartTotal)}</strong>
                  </div>
                  <small style={{ display: "block", color: "var(--oj-color-muted)", fontSize: "12px", marginBottom: "16px" }}>
                    {isEn ? "Direct payment via Mobile Money or Card." : "Règlement direct Mobile Money (MTN, Moov, Wave) ou Carte."}
                  </small>
                  <button className="oj-btn-primary" style={{ width: "100%" }} onClick={() => { alert(isEn ? "Order placed!" : "Commande enregistrée !"); setCart([]); setCartOpen(false); }}>
                    {isEn ? `Place order (${formatPrice(cartTotal)})` : `Valider la commande (${formatPrice(cartTotal)})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== FOOTER ==================== */}
      <footer className="oj-footer">
        <div className="oj-footer-grid">
          <div className="oj-footer-brand">
            <img
              src={isDark ? "/brand/Ojarket_03_Compact_Wordmark_Centered_Dark_Transparent.png" : "/brand/Ojarket_03_Compact_Wordmark_Centered_Transparent.png"}
              alt="Ojarket"
              style={{ height: "28px", width: "auto" }}
            />
            <p className="oj-footer-tagline">
              {isEn
                ? "The exceptional marketplace connecting passionate buyers with verified master artisans."
                : "Le marché d'exception reliant les acheteurs passionnés et les maîtres artisans vérifiés."}
            </p>
          </div>
          <div>
            <h4 className="oj-footer-col-title">{isEn ? "Buy" : "Acheter"}</h4>
            <ul className="oj-footer-links">
              <li><a href="#catalog-grid">{isEn ? "Fine Leather" : "Maroquinerie d'art"}</a></li>
              <li><a href="#catalog-grid">{isEn ? "Watches & Jewelry" : "Horlogerie & Joaillerie"}</a></li>
              <li><a href="#catalog-grid">{isEn ? "Home" : "Mobilier & Minéral"}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="oj-footer-col-title">{isEn ? "Sell" : "Vendre"}</h4>
            <ul className="oj-footer-links">
              <li><a href="#" onClick={(e) => { e.preventDefault(); setUniverse("seller"); }}>{isEn ? "Seller Pro" : "Espace Vendeur Pro"}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); setUniverse("seller"); }}>{isEn ? "Cashbook" : "Livre de caisse"}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="oj-footer-col-title">{isEn ? "Trust" : "Engagements"}</h4>
            <ul className="oj-footer-links">
              <li><a href="#">{isEn ? "Secure Payment" : "Paiement sécurisé"}</a></li>
              <li><a href="#">{isEn ? "Verified Craft" : "Savoir-faire vérifié"}</a></li>
              <li><a href="#">{isEn ? "Protection" : "Protection des transactions"}</a></li>
            </ul>
          </div>
        </div>
        <div className="oj-footer-bottom">
          <span>© {new Date().getFullYear()} Ojarket Inc. {isEn ? "All rights reserved." : "Tous droits réservés."}</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <a href="#" style={{ color: "inherit" }}>{isEn ? "Terms" : "Conditions"}</a>
            <a href="#" style={{ color: "inherit" }}>{isEn ? "Privacy" : "Confidentialité"}</a>
          </div>
        </div>
      </footer>

      {/* ==================== BOTTOM NAVIGATION (mobile) ==================== */}
      <nav className="oj-bottom-nav">
        {[
          {
            label: isEn ? "Discover" : "Découvrir",
            icon: <IconHome />,
            active: universe === "buyer",
            onClick: () => {
              setUniverse("buyer");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
          {
            label: isEn ? "Search" : "Rechercher",
            icon: <IconSearch />,
            active: false,
            onClick: () => {
              setUniverse("buyer");
              const el = document.getElementById("catalog-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            },
          },
          {
            label: isEn ? "Sell" : "Vendre",
            icon: <IconPlus />,
            active: universe === "seller",
            onClick: () => {
              setUniverse("seller");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          },
          {
            label: isEn ? "Messages" : "Messages",
            icon: <IconMessage />,
            active: false,
            onClick: () => alert(isEn ? "No new messages" : "Aucun nouveau message"),
          },
          {
            label: isEn ? "Profile" : "Profil",
            icon: <IconUser />,
            active: false,
            onClick: () => setMode(isDark ? "light" : "dark"),
          },
        ].map((item, i) => (
          <button
            key={i}
            className={`oj-bnav-item ${item.active ? "active" : ""}`}
            onClick={item.onClick}
          >
            <span className="oj-bnav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
